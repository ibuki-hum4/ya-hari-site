import { describe, expect, test } from "bun:test";
import { parseRss } from "./rss";

// app/feed.xml/route.ts が出す形
const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>やーはり Blog</title>
    <item>
      <title>A &amp; B &lt;tips&gt;</title>
      <link>https://ya-hari.skyia.jp/blog/abc123</link>
      <guid isPermaLink="true">https://ya-hari.skyia.jp/blog/abc123</guid>
      <pubDate>Fri, 05 Dec 2025 03:00:00 GMT</pubDate>
      <description>本文の
        冒頭&amp;nbsp;です</description>
      <category>Tech</category>
    </item>
    <item>
      <title>日付なし</title>
      <link>https://ya-hari.skyia.jp/blog/no-date</link>
      <description></description>
    </item>
    <item>
      <title>リンクなしは捨てる</title>
    </item>
  </channel>
</rss>`;

describe("parseRss", () => {
    test("記事を取り出し、エスケープを戻す", () => {
        const [first] = parseRss(feed);
        expect(first.id).toBe("abc123");
        expect(first.title).toBe("A & B <tips>");
        expect(first.url).toBe("https://ya-hari.skyia.jp/blog/abc123");
        expect(first.date.toISOString()).toBe("2025-12-05T03:00:00.000Z");
        expect(first.category).toBe("Tech");
    });

    test("概要の改行・連続空白・&nbsp; を1つの空白にする", () => {
        expect(parseRss(feed)[0].summary).toBe("本文の 冒頭 です");
    });

    test("日付が無い・壊れている記事は 1970-01-01 にする", () => {
        expect(parseRss(feed)[1].date.getTime()).toBe(0);
    });

    test("タイトルかリンクが無い item は捨てる", () => {
        expect(parseRss(feed)).toHaveLength(2);
    });

    test("空のフィード", () => {
        expect(parseRss("<rss><channel></channel></rss>")).toEqual([]);
    });
});
