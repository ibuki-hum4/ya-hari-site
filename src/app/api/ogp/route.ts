import { NextRequest, NextResponse } from "next/server";

// インメモリキャッシュ
const cache = new Map<string, { data: { title: string; description: string }; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1時間

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // キャッシュチェック
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5秒タイムアウト

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OGPFetcher/1.0)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 });
    }

    const html = await response.text();

    // OGP title を優先、なければ title タグ
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i)?.[1];

    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];

    const title = ogTitle || titleTag || "";

    // OGP description を優先、なければ meta description
    const ogDescription = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["']/i)?.[1];

    const metaDescription = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i)?.[1];

    const description = ogDescription || metaDescription || "";

    const data = { title, description };

    // キャッシュに保存
    cache.set(url, { data, timestamp: Date.now() });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch OGP" }, { status: 500 });
  }
}
