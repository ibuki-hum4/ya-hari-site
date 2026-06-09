"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCookieConsent } from "../../lib/cookie-consent";
import { GA_ID } from "../../lib/ga";

export default function GAConsent() {
    const pathname = usePathname();

    // セッション開始時に保存済み同意を GA に反映（リピーターが denied のまま計測されるバグを修正）
    useEffect(() => {
        if (!window.gtag) return;
        const consent = getCookieConsent();
        if (consent !== "pending") {
            window.gtag("consent", "update", {
                analytics_storage: consent === "accepted" ? "granted" : "denied",
            });
        }
    }, []);

    // SPA ナビゲーション（pathname 変化）のたびにページビューを送信
    useEffect(() => {
        if (!window.gtag) return;
        window.gtag("event", "page_view", {
            page_path: pathname,
            page_location: window.location.href,
            send_to: GA_ID,
        });
    }, [pathname]);

    return null;
}
