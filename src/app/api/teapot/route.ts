import { NextResponse } from "next/server";

export async function GET() {
    return new NextResponse(
        JSON.stringify({
            error: "I'm a teapot",
            message: "The server refuses to brew coffee because it is, permanently, a teapot.",
            code: 418,
            rfc: "RFC 2324",
        }),
        {
            status: 418,
            statusText: "I'm a teapot",
            headers: { "Content-Type": "application/json" },
        }
    );
}
