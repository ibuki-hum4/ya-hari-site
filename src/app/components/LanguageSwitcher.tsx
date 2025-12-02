"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
    currentLocale: string;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const switchLocale = (locale: Locale) => {
        document.cookie = `locale=${locale};path=/;max-age=31536000`;
        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <div className="flex items-center gap-1">
            {locales.map((locale) => (
                <button
                    key={locale}
                    onClick={() => switchLocale(locale)}
                    disabled={isPending}
                    className={`px-2 py-1 text-sm rounded transition-colors ${
                        currentLocale === locale
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    } ${isPending ? "opacity-50" : ""}`}
                >
                    {locale.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
