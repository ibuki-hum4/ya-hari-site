import { NextResponse } from "next/server";

export async function GET() {
    return new NextResponse(
        JSON.stringify({
            error: "Forbidden",
            message: "You don't have permission to access this resource.",
            code: 403,
        }),
        {
            status: 403,
            statusText: "Forbidden",
            headers: { "Content-Type": "application/json" },
        }
    );
}
