// messages（next-intl）と src/data から、仮想ファイルに載せる内容を集める
// ページと同じ元データを読むので、サイトを直せばターミナルの中身も変わる

import type messagesJa from "@/messages/ja.json";
import { projectEntries } from "@/data/projects";
import { skillEntries } from "@/data/skills";
import { abilities, contacts, hobbies } from "@/data/profile";
import { friendLinks, type OGPData } from "@/data/links";
import type { BlogItem, SiteContent } from "./build-fs";
import type { TerminalStrings } from "./commands";

export type Messages = typeof messagesJa;

type Options = {
    messages: Messages;
    locale: string;
    siteUrl: string;
    blog: BlogItem[] | "loading" | "error";
    ogp: (url: string) => OGPData | undefined; // mlink.tsx が取得済みの OGP（無ければ undefined）
};

export function collectSiteContent({ messages, locale, siteUrl, blog, ogp }: Options): SiteContent {
    const { about, projects, skills, contact, links, terminal } = messages;

    return {
        about: { ...about, hobbies, abilities },
        projects: projectEntries.map((entry) => ({
            slug: entry.slug,
            title: projects.items[entry.key].title,
            description: projects.items[entry.key].description,
            status: entry.status,
            links: entry.links ?? {},
        })),
        skills: {
            title: skills.title,
            intro: skills.pageIntro,
            items: skillEntries.map(({ name, ja, en }) => ({ name, description: locale === "ja" ? ja : en })),
        },
        contact: {
            heading: contact.heading,
            email: contacts.email,
            emailDescription: contact.methods.email.description,
            github: { ...contacts.github, description: contact.methods.github.description },
            x: { ...contacts.x, description: contact.methods.x.description },
            responseTime: contact.responseTime,
            language: contact.language,
            formUrl: `${siteUrl}/contact`,
        },
        links: {
            title: links.title,
            description: links.description,
            items: friendLinks.map((link) => {
                const fetched = ogp(link.url);
                return {
                    url: link.url,
                    name: link.name ?? fetched?.title ?? new URL(link.url).hostname,
                    description: link.description ?? fetched?.description,
                };
            }),
        },
        blog,
        blogUrl: `${siteUrl}/blog`,
        labels: terminal.fs,
    };
}

export function terminalStrings(messages: Messages): TerminalStrings {
    return { help: messages.terminal.help };
}
