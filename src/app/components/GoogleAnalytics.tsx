"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_TRACKING_ID = "G-NEXGZXVYZB";

export default function GoogleAnalytics() {
    const [hasConsent, setHasConsent] = useState<boolean | null>(null);

    useEffect(() => {
        // Cookie同意状態を確認
        const consent = localStorage.getItem("cookie-consent");
        setHasConsent(consent === "accepted");
    }, []);

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    
                    // デフォルトで同意を拒否（GDPRモード）
                    gtag('consent', 'default', {
                        'analytics_storage': '${hasConsent ? "granted" : "denied"}'
                    });
                    
                    gtag('config', '${GA_TRACKING_ID}', {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
        </>
    );
}
