/* eslint-disable @typescript-eslint/no-require-imports -- Node config file, same convention as tailwind.config.js */
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

// クライアントコンポーネントを含む動的レンダリングのページが多く、
// next-sitemap の自動検出（prerender-manifest）に乗らないため静的ページは明示的に列挙する
const staticRoutes = [
    { loc: "/", priority: 1.0, changefreq: "weekly" },
    { loc: "/about", priority: 0.8, changefreq: "monthly" },
    { loc: "/blog", priority: 0.9, changefreq: "daily" },
    { loc: "/projects", priority: 0.8, changefreq: "monthly" },
    { loc: "/skills", priority: 0.7, changefreq: "monthly" },
    { loc: "/tools", priority: 0.8, changefreq: "weekly" },
    { loc: "/contact", priority: 0.7, changefreq: "monthly" },
    { loc: "/privacy", priority: 0.3, changefreq: "yearly" },
    { loc: "/design-systems", priority: 0.5, changefreq: "monthly" },
    // /tools 配下の各ツールページ（クライアントコンポーネントを含み自動検出に乗らないため明示的に列挙）
    { loc: "/tools/base64-url", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/color-palette", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/commit-message", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/cookie-clicker", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/excuse-generator", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/http-status", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/image-color", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/json-formatter", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/markdown-html", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/meme-generator", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/mouse-music", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/none-ai", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/password-generator", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/text-counter", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/typing-speed", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/typography-preview", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/yaml-json", priority: 0.6, changefreq: "monthly" },
    { loc: "/tools/yardle", priority: 0.6, changefreq: "monthly" },
];

async function getBlogPaths(config) {
    if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
        return [];
    }

    try {
        const { createClient } = require("microcms-js-sdk");
        const client = createClient({
            serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
            apiKey: process.env.MICROCMS_API_KEY,
        });

        const { contents } = await client.get({
            endpoint: "blogs",
            queries: { fields: "id,updatedAt", limit: 100 },
        });

        return contents.map((blog) => ({
            loc: `/blog/${blog.id}`,
            lastmod: new Date(blog.updatedAt).toISOString(),
            changefreq: config.changefreq ?? "weekly",
            priority: config.priority ?? 0.7,
        }));
    } catch (error) {
        // microCMSが一時的に取得できなくても、サイトマップ生成自体(=ビルド)は失敗させない
        console.warn("[next-sitemap] Failed to fetch blog posts from microCMS, skipping blog paths:", error);
        return [];
    }
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl,
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: ["/api/*", "/400", "/500", "/teapot"],
    robotsTxtOptions: {
        policies: [
            { userAgent: "*", allow: "/" },
            // AI training crawlers — explicitly allowed for LLM training
            { userAgent: "GPTBot", allow: "/" },
            { userAgent: "ChatGPT-User", allow: "/" },
            { userAgent: "ClaudeBot", allow: "/" },
            { userAgent: "anthropic-ai", allow: "/" },
            { userAgent: "PerplexityBot", allow: "/" },
            { userAgent: "CCBot", allow: "/" },
            { userAgent: "Googlebot-Extended", allow: "/" },
        ],
        additionalSitemaps: [],
    },
    additionalPaths: async (config) => {
        const blogPaths = await getBlogPaths(config);
        return [...staticRoutes, ...blogPaths];
    },
};
