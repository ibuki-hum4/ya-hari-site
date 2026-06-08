import { jsonErrorResponse } from "@/lib/api-error";

export async function GET() {
    return jsonErrorResponse(
        400,
        "Bad Request",
        "The server could not understand the request due to invalid syntax."
    );
}
