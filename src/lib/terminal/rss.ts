// /feed.xml（app/feed.xml/route.ts が出す RSS）から記事一覧を取り出す
// 自前のフィードで形が決まっているので、DOMParser を使わず正規表現で読む（テストを Bun だけで回せる）

import type { BlogItem } from "./build-fs";

function unescapeXml(text: string): string {
    return text
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
}

function tag(xml: string, name: string): string | undefined {
    const match = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
    return match ? unescapeXml(match[1].trim()) : undefined;
}

export function parseRss(xml: string): BlogItem[] {
    const items: BlogItem[] = [];
    for (const [, body] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const title = tag(body, "title");
        const url = tag(body, "link");
        if (!title || !url) continue;
        const date = new Date(tag(body, "pubDate") ?? "");
        items.push({
            id: url.split("/").filter(Boolean).pop() ?? url,
            title,
            url,
            date: Number.isNaN(date.getTime()) ? new Date(0) : date,
            // 本文の HTML を剥がしただけなので &nbsp; が残る
            summary: (tag(body, "description") ?? "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(),
            category: tag(body, "category"),
        });
    }
    return items;
}
