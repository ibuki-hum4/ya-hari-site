import { jsonErrorResponse } from "@/lib/api-error";

export async function GET() {
    return jsonErrorResponse(
        500,
        "Internal Server Error",
        "The server encountered an unexpected condition that prevented it from fulfilling the request."
    );
}
