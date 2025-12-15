import { NextResponse } from "next/server";

export async function GET() {
    return new NextResponse(
        JSON.stringify({
            error: "Bad Gateway",
            message: "The server received an invalid response from the upstream server.",
            code: 502,
        }),
        {
            status: 502,
            statusText: "Bad Gateway",
            headers: { "Content-Type": "application/json" },
        }
    );
}
