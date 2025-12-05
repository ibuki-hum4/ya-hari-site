"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Header from "./components/header";
import Footer from "./components/footer";
import { FiServer } from "react-icons/fi";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const t = useTranslations("error");

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            <Header />
            
            <main className="flex-1 flex items-center justify-center px-8">
                <div className="text-center">
                    {/* エラーアイコン */}
                    <div className="relative mb-8">
                        <h1 className="text-[150px] md:text-[200px] font-bold text-gray-100 dark:text-gray-800 select-none">
                            500
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-6xl"><FiServer /></div>
                        </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {t("serverError.title")}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        {t("serverError.description")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => reset()}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                        >
                            {t("serverError.retry")}
                        </button>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {t("serverError.backHome")}
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
