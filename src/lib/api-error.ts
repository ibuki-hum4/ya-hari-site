import { NextResponse } from "next/server";

export function jsonErrorResponse(
    status: number,
    statusText: string,
    message: string,
    extra?: Record<string, unknown>
) {
    return new NextResponse(
        JSON.stringify({ error: statusText, message, code: status, ...extra }),
        {
            status,
            statusText,
            headers: { "Content-Type": "application/json" },
        }
    );
}
