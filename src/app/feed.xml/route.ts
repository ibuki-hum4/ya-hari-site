import { getBlogs } from "@/lib/microcms";

export const revalidate = 3600; // 1時間ごとに再生成

export async function GET() {
    const { contents: blogs } = await getBlogs({ limit: 20 });
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";
    const siteName = "やーはり Blog";
    const siteDescription = "やーはりの技術ブログ";

    const rssItems = blogs
        .map((blog) => {
            const pubDate = new Date(blog.publishedAt).toUTCString();
            const description = blog.content
                .replace(/<[^>]*>/g, "")
                .slice(0, 200)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            const title = blog.title
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            return `
    <item>
      <title>${title}</title>
      <link>${siteUrl}/blog/${blog.id}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${blog.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      ${blog.category ? `<category>${blog.category.name}</category>` : ""}
    </item>`;
        })
        .join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}/blog</link>
    <description>${siteDescription}</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
