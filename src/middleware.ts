import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ロケールプレフィックスを使わない設定
// 言語切り替えはCookieベースで行う
export function middleware(request: NextRequest) {
    // /ja や /en へのアクセスをルートにリダイレクト
    const pathname = request.nextUrl.pathname;
    if (pathname === "/ja" || pathname === "/en") {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.set("locale", pathname.slice(1), { path: "/", maxAge: 31536000 });
        return response;
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
