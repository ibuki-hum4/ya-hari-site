import { NextResponse } from "next/server";

interface ContactFormData {
    name: string;
    email: string;
    type: string;
    subject: string;
    message: string;
}

export async function POST(request: Request) {
    try {
        const data: ContactFormData = await request.json();
        const timestamp = new Date().toISOString();

        // Google Spreadsheet に送信（スプレッドシート側でDiscord Webhookに転送）
        const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
        if (googleScriptUrl) {
            await fetch(googleScriptUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    timestamp,
                    ...data,
                }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
    }
}
