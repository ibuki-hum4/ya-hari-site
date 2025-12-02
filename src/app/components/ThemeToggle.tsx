"use client";

import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import { useTheme } from "./ThemeProvider";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ThemeToggle() {
    const t = useTranslations("theme");
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const options = [
        { value: "light" as const, icon: <FiSun size={16} />, label: t("light") },
        { value: "dark" as const, icon: <FiMoon size={16} />, label: t("dark") },
        { value: "system" as const, icon: <FiMonitor size={16} />, label: t("system") },
    ];

    // マウント前はプレースホルダーを表示
    if (!mounted) {
        return (
            <div className="p-2 rounded-lg text-gray-600 dark:text-gray-300">
                <FiSun size={20} className="opacity-0" />
            </div>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="テーマ切り替え"
            >
                {resolvedTheme === "dark" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                setTheme(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                theme === option.value
                                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                            {option.icon}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
