"use client";

import { useEffect, useRef, useCallback } from "react";
import Script from "next/script";

interface TurnstileProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
}

declare global {
    interface Window {
        turnstile: {
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    "error-callback"?: () => void;
                    "expired-callback"?: () => void;
                    theme?: "light" | "dark" | "auto";
                }
            ) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

export default function Turnstile({ siteKey, onVerify, onError, onExpire }: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const renderWidget = useCallback(() => {
        if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            "error-callback": onError,
            "expired-callback": onExpire,
            theme: "light",
        });
    }, [siteKey, onVerify, onError, onExpire]);

    useEffect(() => {
        // Turnstileがすでにロード済みの場合
        if (window.turnstile) {
            renderWidget();
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [renderWidget]);

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="lazyOnload"
                onLoad={renderWidget}
            />
            <div ref={containerRef} className="flex justify-center" />
        </>
    );
}
