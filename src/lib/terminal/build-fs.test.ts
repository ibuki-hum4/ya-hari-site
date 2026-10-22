import { describe, expect, test } from "bun:test";
import ja from "@/messages/ja.json";
import en from "@/messages/en.json";
import { projectEntries } from "@/data/projects";
import { friendLinks } from "@/data/links";
import { buildFs, type BlogItem } from "./build-fs";
import { collectSiteContent, type Messages } from "./site-content";
import { stat, type VNode } from "./vfs";

const now = new Date(2026, 9, 22, 12, 0, 0);
const posts: BlogItem[] = [
    { id: "post-b", title: "二つ目の記事", url: "https://ya-hari.skyia.jp/blog/post-b", date: new Date(2026, 5, 2), summary: "本文の冒頭", category: "Tech" },
    { id: "post-a", title: "最初の記事", url: "https://ya-hari.skyia.jp/blog/post-a", date: new Date(2026, 0, 15), summary: "" },
];

const build = (overrides: Partial<Parameters<typeof collectSiteContent>[0]> = {}) =>
    buildFs(
        collectSiteContent({
            messages: ja,
            locale: "ja",
            siteUrl: "https://ya-hari.skyia.jp",
            blog: posts,
            ogp: () => undefined,
            ...overrides,
        }),
        now,
    );

const read = (fs: ReturnType<typeof build>, path: string): string => {
    const result = stat(fs, path);
    if (!("node" in result) || result.node.kind !== "file") throw new Error(`${path} is not a file`);
    return result.node.content;
};

const names = (node: VNode) => (node.kind === "dir" ? node.children.map((c) => c.name) : []);

describe("buildFs", () => {
    test("~ の構成", () => {
        const home = stat(build(), "~");
        expect("node" in home && names(home.node)).toEqual(["about.md", "blog", "contact.md", "links.md", "projects", "skills.md"]);
    });

    test("projects/ は src/data/projects.ts の slug から作る", () => {
        const projects = stat(build(), "projects");
        expect("node" in projects && names(projects.node)).toEqual(projectEntries.map((p) => `${p.slug}.md`).sort());
    });

    test("中身は messages から取り、言語で切り替わる", () => {
        expect(read(build(), "about.md")).toContain(`# ${ja.about.name}\n`);
        expect(read(build(), "about.md")).toContain(ja.about.description);

        const english = build({ messages: en as Messages, locale: "en" });
        expect(read(english, "about.md")).toContain(`# ${en.about.name}\n`);
        expect(read(english, "about.md")).toContain(`## ${en.terminal.fs.hobbies}\n`);
        expect(read(english, "skills.md")).toContain("- React — UI Library");
        expect(read(build(), "skills.md")).toContain("- React — UIライブラリ");
    });

    test("プロジェクトには状態とリンクを載せる", () => {
        const text = read(build(), "projects/bluearchive-api.md");
        expect(text).toContain(`# ${ja.projects.items.bluearchive.title}\n`);
        expect(text).toContain(`${ja.terminal.fs.status}: ${ja.terminal.fs.completed}`);
        expect(text).toContain("- GitHub: https://github.com/ibuki-hum4/BlueArchiveAPI");
        expect(read(build(), "projects/school-sns-lms.md")).toContain(ja.terminal.fs.inProgress);
    });

    test("contact.md にはメール・SNS・フォームの URL を載せる", () => {
        const text = read(build(), "contact.md");
        expect(text).toContain("- Email: yahari@skyia.jp");
        expect(text).toContain("https://ya-hari.skyia.jp/contact");
    });

    test("links.md は取得済みの OGP があれば名前を使い、無ければホスト名", () => {
        const [first] = friendLinks;
        const withOgp = read(build({ ogp: (url) => (url === first.url ? { title: "Yuitopia", description: "説明" } : undefined) }), "links.md");
        expect(withOgp).toContain(`- Yuitopia — 説明\n  ${first.url}`);
        expect(read(build(), "links.md")).toContain(`- ${new URL(first.url).hostname}\n`);
    });

    test("blog/ は日付付きのファイル名と一覧を作る", () => {
        const fs = build();
        const blog = stat(fs, "blog");
        expect("node" in blog && names(blog.node)).toEqual(["2026-01-15-post-a.md", "2026-06-02-post-b.md", "index.md"]);
        expect(read(fs, "blog/2026-06-02-post-b.md")).toBe(
            "# 二つ目の記事\n\n2026-06-02 · Tech\n\nhttps://ya-hari.skyia.jp/blog/post-b\n\n本文の冒頭\n",
        );
        expect(read(fs, "blog/index.md")).toContain("- 2026-01-15  最初の記事\n  https://ya-hari.skyia.jp/blog/post-a");
    });

    test("ブログの読み込み中・失敗時は README だけ置く", () => {
        expect(read(build({ blog: "loading" }), "blog/README.md")).toContain(ja.terminal.fs.blogLoading);
        expect(read(build({ blog: "error" }), "blog/README.md")).toContain(ja.terminal.fs.blogError);
    });

    test("すべてのファイルは改行で終わる", () => {
        const fs = build();
        for (const path of ["about.md", "skills.md", "contact.md", "links.md", "blog/index.md"]) {
            expect(read(fs, path)).toEndWith("\n");
        }
    });
});

describe("messages", () => {
    test("ja と en で terminal・playground のキーが揃っている", () => {
        const keys = (value: unknown, prefix = ""): string[] =>
            value && typeof value === "object"
                ? Object.entries(value).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
                : [prefix];
        expect(keys(en.terminal)).toEqual(keys(ja.terminal));
        expect(keys(en.playground)).toEqual(keys(ja.playground));
    });
});
