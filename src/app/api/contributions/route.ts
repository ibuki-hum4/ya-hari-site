import { NextRequest, NextResponse } from "next/server";
import { getContributions } from "@/lib/github";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const year = searchParams.get("year");

    if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const contributions = await getContributions(
        username,
        year ? parseInt(year, 10) : undefined
    );

    if (!contributions) {
        return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
    }

    return NextResponse.json(contributions);
}
