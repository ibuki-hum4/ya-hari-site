"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { FiArrowRight } from "react-icons/fi";
import { cardClass } from "../ui/card";
import { toolEntries, type ToolCategory } from "./registry";

type Filter = "all" | ToolCategory;

const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",  label: "ALL" },
    { key: "dev",  label: "DEV & DATA" },
    { key: "play", label: "MEDIA & PLAY" },
];

export default function ToolsGrid() {
    const t = useTranslations("tools");
    const [filter, setFilter] = useState<Filter>("all");

    const counts = useMemo(() => ({
        all:  toolEntries.length,
        dev:  toolEntries.filter(e => e.category === "dev").length,
        play: toolEntries.filter(e => e.category === "play").length,
    }), []);

    const filtered = filter === "all"
        ? toolEntries
        : toolEntries.filter(e => e.category === filter);

    return (
        <div>
            {/* カテゴリフィルター */}
            <div className="flex flex-wrap gap-2 mb-10">
                {FILTERS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors ${
                            filter === key
                                ? "bg-ink text-surface"
                                : "border border-line text-muted hover:text-ink"
                        }`}
                    >
                        {label}
                        <span className={`text-xs tabular-nums ${filter === key ? "opacity-60" : "opacity-50"}`}>
                            {counts[key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* ツールグリッド */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <AnimatePresence mode="popLayout">
                    {filtered.map((entry) => {
                        const { key, href, icon: Icon, status } = entry;
                        const isAvailable = status === "available";

                        const inner = (
                            <div className="flex flex-col h-full p-6 sm:p-7">
                                <Icon size={28} className="text-ink mb-6" aria-hidden />
                                <h2 className="text-lg sm:text-xl font-bold text-ink mb-2">
                                    {t(`items.${key}.title`)}
                                </h2>
                                <p className="text-sm text-muted leading-relaxed flex-1">
                                    {t(`items.${key}.description`)}
                                </p>
                                <span className={`mt-6 inline-flex items-center gap-2 text-sm ${isAvailable ? "text-ink" : "text-muted"}`}>
                                    {isAvailable ? (
                                        <>
                                            <span className="underline underline-offset-4">{t("openTool")}</span>
                                            <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                        </>
                                    ) : (
                                        <span className="px-3 py-1 border border-line rounded-full text-xs">
                                            {t("comingSoon")}
                                        </span>
                                    )}
                                </span>
                            </div>
                        );

                        return (
                            <motion.div
                                key={key}
                                layout
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                            >
                                {isAvailable ? (
                                    <Link href={href} className={`group block h-full ${cardClass}`}>
                                        {inner}
                                    </Link>
                                ) : (
                                    <div className={`block h-full opacity-60 ${cardClass}`}>{inner}</div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
