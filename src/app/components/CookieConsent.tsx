"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

const COOKIE_CONSENT_KEY = "cookie-consent";

type ConsentStatus = "pending" | "accepted" | "rejected";

export default function CookieConsent() {
    const [status, setStatus] = useState<ConsentStatus>("pending");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // ローカルストレージから同意状態を取得
        const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (savedConsent === "accepted" || savedConsent === "rejected") {
            setStatus(savedConsent);
        } else {
            // 少し遅延させてから表示（UX向上）
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
        setStatus("accepted");
        setIsVisible(false);
        // Google Analytics を有効化（すでにロード済みなら何もしない）
        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("consent", "update", {
                analytics_storage: "granted",
            });
        }
    };

    const handleReject = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
        setStatus("rejected");
        setIsVisible(false);
        // Google Analytics を無効化
        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("consent", "update", {
                analytics_storage: "denied",
            });
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    // 同意済みまたは拒否済みの場合は表示しない
    if (status !== "pending" || !isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-start gap-4">
                    {/* コンテンツ */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            🍪 Cookieの使用について
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            このサイトでは、より良いユーザー体験を提供するためにCookieを使用しています。
                            アクセス解析のためにGoogle Analyticsを利用しており、匿名化された情報を収集しています。
                            「同意する」をクリックすると、Cookieの使用に同意したことになります。
                        </p>
                    </div>

                    {/* 閉じるボタン */}
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                        aria-label="閉じる"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* ボタン */}
                <div className="flex flex-wrap gap-3 mt-4">
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                    >
                        同意する
                    </button>
                    <button
                        onClick={handleReject}
                        className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        必須のみ
                    </button>
                    <a
                        href="/privacy"
                        className="px-6 py-2.5 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-colors underline underline-offset-2"
                    >
                        プライバシーポリシー
                    </a>
                </div>
            </div>
        </div>
    );
}

// gtag の型定義
declare global {
    interface Window {
        gtag: (
            command: string,
            action: string,
            params?: Record<string, string>
        ) => void;
    }
}
