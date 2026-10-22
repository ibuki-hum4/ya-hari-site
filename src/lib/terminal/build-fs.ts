// サイトの内容から仮想ファイルシステムを組み立てる
// 中身は site-content.ts が messages と src/data から集めたものだけを使う（ここで文章を持たない）

import { HOME, dir, file, type VDir } from "./vfs";

export type BlogItem = {
    id: string;
    title: string;
    url: string;
    date: Date;
    summary: string;
    category?: string;
};

export type FsLabels = {
    hobbies: string;
    abilities: string;
    now: string;
    status: string;
    completed: string;
    inProgress: string;
    form: string;
    blogLoading: string;
    blogError: string;
};

export type SiteContent = {
    about: {
        name: string;
        age: string;
        school: string;
        location: string;
        description: string;
        now: string;
        hobbies: readonly string[];
        abilities: readonly string[];
    };
    projects: {
        slug: string;
        title: string;
        description: string;
        status: "completed" | "in-progress";
        links: { demo?: string; github?: string; invite?: string };
    }[];
    skills: { title: string; intro: string; items: { name: string; description: string }[] };
    contact: {
        heading: string;
        email: string;
        github: { handle: string; url: string; description: string };
        x: { handle: string; url: string; description: string };
        emailDescription: string;
        responseTime: string;
        language: string;
        formUrl: string;
    };
    links: { title: string; description: string; items: { url: string; name: string; description?: string }[] };
    blog: BlogItem[] | "loading" | "error";
    blogUrl: string;
    labels: FsLabels;
};

const md = (...blocks: (string | false | undefined)[]) =>
    `${blocks.filter((b): b is string => typeof b === "string").join("\n\n")}\n`;

const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");

const isoDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function aboutMd({ about, labels }: SiteContent): string {
    return md(
        `# ${about.name}`,
        `${about.age} / ${about.school} / ${about.location}`,
        about.description,
        `## ${labels.hobbies}\n${list(about.hobbies)}`,
        `## ${labels.abilities}\n${list(about.abilities)}`,
        `## ${labels.now}\n${about.now}`,
    );
}

function skillsMd({ skills }: SiteContent): string {
    return md(
        `# ${skills.title}`,
        skills.intro,
        list(skills.items.map(({ name, description }) => `${name} — ${description}`)),
    );
}

function projectMd(project: SiteContent["projects"][number], labels: FsLabels): string {
    const links = [
        project.links.demo && `Demo: ${project.links.demo}`,
        project.links.github && `GitHub: ${project.links.github}`,
        project.links.invite && `Invite: ${project.links.invite}`,
    ].filter((l): l is string => Boolean(l));
    return md(
        `# ${project.title}`,
        `${labels.status}: ${project.status === "completed" ? labels.completed : labels.inProgress}`,
        project.description,
        links.length > 0 && list(links),
    );
}

function contactMd({ contact, labels }: SiteContent): string {
    return md(
        "# Contact",
        contact.heading,
        [
            `- Email: ${contact.email}`,
            `  ${contact.emailDescription}`,
            `- GitHub: ${contact.github.handle} (${contact.github.url})`,
            `  ${contact.github.description}`,
            `- X: ${contact.x.handle} (${contact.x.url})`,
            `  ${contact.x.description}`,
            `- ${labels.form}: ${contact.formUrl}`,
        ].join("\n"),
        `${contact.responseTime} / ${contact.language}`,
    );
}

function linksMd({ links }: SiteContent): string {
    return md(
        `# ${links.title}`,
        links.description,
        links.items
            .map(({ url, name, description }) => `- ${name}${description ? ` — ${description}` : ""}\n  ${url}`)
            .join("\n"),
    );
}

function blogFiles(content: SiteContent, now: Date) {
    const { blog, blogUrl, labels } = content;
    if (blog === "loading") return [file("README.md", md(labels.blogLoading, blogUrl), now)];
    if (blog === "error") return [file("README.md", md(labels.blogError, blogUrl), now)];

    const index = file(
        "index.md",
        md("# Blog", blog.map((post) => `- ${isoDate(post.date)}  ${post.title}\n  ${post.url}`).join("\n"), blogUrl),
        blog[0]?.date ?? now,
    );
    const posts = blog.map((post) =>
        file(
            // 記事 ID だけだと並びが分からないので日付を前に付ける
            `${isoDate(post.date)}-${post.id}.md`,
            md(
                `# ${post.title}`,
                [isoDate(post.date), post.category].filter(Boolean).join(" · "),
                post.url,
                post.summary || undefined,
            ),
            post.date,
        ),
    );
    return [index, ...posts];
}

export function buildFs(content: SiteContent, now: Date): VDir {
    const home = dir(
        HOME.split("/").pop()!,
        [
            file("about.md", aboutMd(content), now),
            file("skills.md", skillsMd(content), now),
            file("contact.md", contactMd(content), now),
            file("links.md", linksMd(content), now),
            dir("projects", content.projects.map((p) => file(`${p.slug}.md`, projectMd(p, content.labels), now)), now),
            dir("blog", blogFiles(content, now), now),
        ],
        now,
    );
    return dir("", [dir("home", [home], now)], now);
}
