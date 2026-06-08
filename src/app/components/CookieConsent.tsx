"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { primaryButtonClass, secondaryButtonClass } from "./ui/button";
import { getCookieConsent, setCookieConsent, type ConsentStatus } from "../../lib/cookie-consent";

export default function CookieConsent() {
    const t = useTranslations("cookie");
    const [status, setStatus] = useState<ConsentStatus>("pending");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const savedConsent = getCookieConsent();
        if (savedConsent !== "pending") {
            setStatus(savedConsent);
        } else {
            // 少し遅延させてから表示（UX向上）
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setCookieConsent("accepted");
        setStatus("accepted");
        setIsVisible(false);
    };

    const handleReject = () => {
        setCookieConsent("rejected");
        setStatus("rejected");
        setIsVisible(false);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    // 同意済みまたは拒否済みの場合は表示しない
    if (status !== "pending" || !isVisible) return null;
    
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div className="max-w-4xl mx-auto bg-surface rounded-2xl shadow-2xl border border-line p-6">
                <div className="flex items-start gap-4">
                    {/* コンテンツ */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-ink mb-2">
                            🍪 Cookies
                        </h3>
                        <p className="text-sm text-muted leading-relaxed">
                            {t("message")}
                        </p>
                    </div>

                    {/* 閉じるボタン */}
                    <button
                        onClick={handleClose}
                        className="text-muted hover:opacity-70 transition-opacity p-1"
                        aria-label="閉じる"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* ボタン */}
                <div className="flex flex-wrap gap-3 mt-4">
                    <button
                        onClick={handleAccept}
                        className={primaryButtonClass}
                    >
                        {t("accept")}
                    </button>
                    <button
                        onClick={handleReject}
                        className={secondaryButtonClass}
                    >
                        {t("decline")}
                    </button>
                    <a
                        href="/privacy"
                        className="px-6 py-2.5 text-muted text-sm hover:opacity-70 transition-opacity underline underline-offset-2"
                    >
                        {t("learnMore")}
                    </a>
                </div>
            </div>
        </div>
    );
}
