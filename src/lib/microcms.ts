import { createClient } from "microcms-js-sdk";

if (!process.env.MICROCMS_SERVICE_DOMAIN) {
    throw new Error("MICROCMS_SERVICE_DOMAIN is required");
}

if (!process.env.MICROCMS_API_KEY) {
    throw new Error("MICROCMS_API_KEY is required");
}

export const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
});

// ブログ記事の型定義
export interface Blog {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    title: string;
    content: string;
    eyecatch?: {
        url: string;
        width: number;
        height: number;
    };
    category?: {
        id: string;
        name: string;
    };
    tags?: {
        id: string;
        name: string;
    }[];
}

export interface BlogResponse {
    contents: Blog[];
    totalCount: number;
    offset: number;
    limit: number;
}

// ブログ一覧を取得
export async function getBlogs(queries?: {
    offset?: number;
    limit?: number;
    filters?: string;
}): Promise<BlogResponse> {
    return await client.get<BlogResponse>({
        endpoint: "blogs",
        queries: {
            offset: queries?.offset ?? 0,
            limit: queries?.limit ?? 10,
            filters: queries?.filters,
        },
    });
}

// ブログ詳細を取得
export async function getBlogDetail(contentId: string): Promise<Blog> {
    return await client.get<Blog>({
        endpoint: "blogs",
        contentId,
    });
}

// 全ブログIDを取得（静的生成用）
export async function getAllBlogIds(): Promise<string[]> {
    const response = await client.get<BlogResponse>({
        endpoint: "blogs",
        queries: {
            fields: "id",
            limit: 100,
        },
    });
    return response.contents.map((blog) => blog.id);
}
