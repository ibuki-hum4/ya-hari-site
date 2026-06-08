import { jsonErrorResponse } from "@/lib/api-error";

export async function GET() {
    return jsonErrorResponse(
        418,
        "I'm a teapot",
        "The server refuses to brew coffee because it is, permanently, a teapot.",
        { rfc: "RFC 2324" }
    );
}
