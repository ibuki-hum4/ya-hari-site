import { NextResponse } from "next/server";

export async function GET() {
    return new NextResponse(
        JSON.stringify({
            error: "Service Unavailable",
            message: "The server is temporarily unable to handle the request. Please try again later.",
            code: 503,
            retryAfter: 300,
        }),
        {
            status: 503,
            statusText: "Service Unavailable",
            headers: {
                "Content-Type": "application/json",
                "Retry-After": "300",
            },
        }
    );
}
