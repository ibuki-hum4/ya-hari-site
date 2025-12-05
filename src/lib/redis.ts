import { Redis } from "@upstash/redis";

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ビュー数を取得
export async function getViewCount(slug: string): Promise<number> {
    const count = await redis.get<number>(`pageviews:blog:${slug}`);
    return count ?? 0;
}

// ビュー数をインクリメント
export async function incrementViewCount(slug: string): Promise<number> {
    const count = await redis.incr(`pageviews:blog:${slug}`);
    return count;
}

// 複数記事のビュー数を一括取得
export async function getMultipleViewCounts(slugs: string[]): Promise<Record<string, number>> {
    if (slugs.length === 0) return {};
    
    const keys = slugs.map((slug) => `pageviews:blog:${slug}`);
    const counts = await redis.mget<(number | null)[]>(...keys);
    
    return slugs.reduce((acc, slug, index) => {
        acc[slug] = counts[index] ?? 0;
        return acc;
    }, {} as Record<string, number>);
}

// サイト訪問者数を取得
export async function getSiteVisitors(): Promise<number> {
    const count = await redis.get<number>("site:visitors");
    return count ?? 0;
}

// サイト訪問者数をインクリメント
export async function incrementSiteVisitors(): Promise<number> {
    const count = await redis.incr("site:visitors");
    return count;
}
