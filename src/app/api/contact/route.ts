import { NextResponse } from "next/server";

interface ContactFormData {
    name: string;
    email: string;
    type: string;
    subject: string;
    message: string;
    turnstileToken: string;
}

// Cloudflare Turnstile検証
async function verifyTurnstile(token: string): Promise<boolean> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) return true; // 開発環境ではスキップ

    try {
        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: secretKey,
                    response: token,
                }),
            }
        );

        const data = await response.json();
        return data.success === true;
    } catch {
        return false;
    }
}

export async function POST(request: Request) {
    try {
        const data: ContactFormData = await request.json();
        const { turnstileToken, ...formData } = data;

        // Turnstile検証
        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) {
            return NextResponse.json(
                { error: "認証に失敗しました。もう一度お試しください。" },
                { status: 400 }
            );
        }

        const timestamp = new Date().toISOString();

        // Google Spreadsheet に送信（スプレッドシート側でDiscord Webhookに転送）
        const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
        if (googleScriptUrl) {
            await fetch(googleScriptUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    timestamp,
                    ...formData,
                }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
    }
}
