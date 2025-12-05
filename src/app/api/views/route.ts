import { NextRequest, NextResponse } from "next/server";
import { incrementViewCount, getViewCount, getSiteVisitors, incrementSiteVisitors } from "@/lib/redis";

export async function POST(request: NextRequest) {
    try {
        const { slug, type } = await request.json();
        
        // サイト訪問者数
        if (type === "site") {
            const count = await incrementSiteVisitors();
            return NextResponse.json({ count });
        }
        
        // ブログ記事のビュー数
        if (!slug || typeof slug !== "string") {
            return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
        }
        
        const count = await incrementViewCount(slug);
        return NextResponse.json({ count });
    } catch (error) {
        console.error("Failed to increment view count:", error);
        return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const type = searchParams.get("type");
        
        // サイト訪問者数
        if (type === "site") {
            const count = await getSiteVisitors();
            return NextResponse.json({ count });
        }
        
        // ブログ記事のビュー数
        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }
        
        const count = await getViewCount(slug);
        return NextResponse.json({ count });
    } catch (error) {
        console.error("Failed to get view count:", error);
        return NextResponse.json({ error: "Failed to get count" }, { status: 500 });
    }
}
