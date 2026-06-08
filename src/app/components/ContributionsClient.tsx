"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "motion/react";
import Link from "next/link";
import { FiGithub, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslations, useLocale } from "next-intl";
import Section from "./ui/section";
import { compactButtonClass } from "./ui/button";

interface ContributionDay {
    date: string;
    contributionCount: number;
    contributionLevel: string;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

interface ContributionCalendar {
    totalContributions: number;
    weeks: ContributionWeek[];
}

// 草の色を取得
function getContributionColor(level: string): string {
    switch (level) {
        case "NONE":
            return "bg-ink/10";
        case "FIRST_QUARTILE":
            return "bg-green-200 dark:bg-green-900";
        case "SECOND_QUARTILE":
            return "bg-green-400 dark:bg-green-700";
        case "THIRD_QUARTILE":
            return "bg-green-500 dark:bg-green-500";
        case "FOURTH_QUARTILE":
            return "bg-green-600 dark:bg-green-400";
        default:
            return "bg-ink/10";
    }
}

// 合計貢献数をカウントアップしながら表示
function AnimatedTotal({ value }: { value: number }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

    useEffect(() => {
        const controls = animate(count, value, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
        return () => controls.stop();
    }, [count, value]);

    return <motion.span>{rounded}</motion.span>;
}

const gridVariants = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.012 },
    },
};

const columnVariants = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

interface ContributionGraphProps {
    calendar: ContributionCalendar;
    year: number;
    locale: string;
    t: ReturnType<typeof useTranslations<"contributions">>;
}

function ContributionGraph({ calendar, year, locale, t }: ContributionGraphProps) {
    const weeks = calendar.weeks;
    const [tooltip, setTooltip] = useState<{ day: ContributionDay; x: number; y: number } | null>(null);
    const [activeDay, setActiveDay] = useState<string | null>(null);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // 月が切り替わる週にラベルを立てる
    const monthLabels = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", { month: "short" });
        const labels: { weekIndex: number; label: string }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, index) => {
            const firstDay = week.contributionDays[0];
            if (!firstDay) return;
            const date = new Date(firstDay.date);
            const month = date.getMonth();
            if (month !== lastMonth) {
                labels.push({ weekIndex: index, label: formatter.format(date) });
                lastMonth = month;
            }
        });
        return labels;
    }, [weeks, locale]);

    const handleInteraction = (day: ContributionDay, e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // ツールチップのX位置を画面内に収める
        let x = rect.left + rect.width / 2;
        const tooltipWidth = 150; // 推定幅
        if (x - tooltipWidth / 2 < 10) {
            x = tooltipWidth / 2 + 10;
        } else if (x + tooltipWidth / 2 > viewportWidth - 10) {
            x = viewportWidth - tooltipWidth / 2 - 10;
        }

        // タッチデバイスでのトグル動作
        if (activeDay === day.date) {
            setTooltip(null);
            setActiveDay(null);
        } else {
            setTooltip({
                day,
                x,
                y: rect.top,
            });
            setActiveDay(day.date);
        }
    };

    const handleMouseEnter = (day: ContributionDay, e: React.MouseEvent) => {
        // タッチデバイスではmouseenterを無視
        if ('ontouchstart' in window) return;
        handleInteraction(day, e);
    };

    const handleMouseLeave = () => {
        // タッチデバイスではmouseleaveを無視
        if ('ontouchstart' in window) return;
        setTooltip(null);
        setActiveDay(null);
    };

    const handleTouch = (day: ContributionDay, e: React.TouchEvent) => {
        handleInteraction(day, e);
    };

    return (
        <div className="overflow-x-auto relative pb-2">
            {/* 月ラベル */}
            <div className="inline-flex gap-[2px] sm:gap-[3px] mb-1.5 min-w-max">
                {weeks.map((_, index) => {
                    const label = monthLabels.find((m) => m.weekIndex === index);
                    return (
                        <div key={index} className="relative w-[8px] sm:w-[10px] h-3 text-[10px] leading-3 text-muted select-none">
                            {label && <span className="absolute left-0 whitespace-nowrap">{label.label}</span>}
                        </div>
                    );
                })}
            </div>

            <motion.div
                key={year}
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="inline-flex gap-[2px] sm:gap-[3px] min-w-max"
            >
                {weeks.map((week, weekIndex) => (
                    <motion.div key={weekIndex} variants={columnVariants} className="flex flex-col gap-[2px] sm:gap-[3px]">
                        {week.contributionDays.map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-sm ${getContributionColor(day.contributionLevel)} transition-colors cursor-pointer hover:ring-2 hover:ring-ink/30 ${activeDay === day.date ? 'ring-2 ring-ink/30' : ''}`}
                                onMouseEnter={(e) => handleMouseEnter(day, e)}
                                onMouseLeave={handleMouseLeave}
                                onTouchStart={(e) => handleTouch(day, e)}
                            />
                        ))}
                    </motion.div>
                ))}
            </motion.div>

            {/* ツールチップ */}
            <AnimatePresence>
                {tooltip && (
                    <div
                        className="fixed z-50 transform -translate-x-1/2 -translate-y-full pointer-events-none"
                        style={{ left: tooltip.x, top: tooltip.y - 8 }}
                    >
                        <motion.div
                            key={tooltip.day.date}
                            initial={{ opacity: 0, scale: 0.92, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 6 }}
                            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="relative px-3 py-2 text-sm bg-ink text-surface rounded-lg shadow-lg origin-bottom"
                        >
                            <p className="font-medium">{formatDate(tooltip.day.date)}</p>
                            <p className="text-surface/70">
                                {tooltip.day.contributionCount > 0
                                    ? `${tooltip.day.contributionCount} ${t("tooltip.contributions")}`
                                    : t("tooltip.noContributions")}
                            </p>
                            {/* 矢印 */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-ink" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 凡例 */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-4 text-xs text-muted">
                <span>{t("less")}</span>
                <div className="flex gap-[2px] sm:gap-[3px]">
                    <div className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-sm bg-ink/10" />
                    <div className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-sm bg-green-200 dark:bg-green-900" />
                    <div className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-sm bg-green-400 dark:bg-green-700" />
                    <div className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-sm bg-green-500 dark:bg-green-500" />
                    <div className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-sm bg-green-600 dark:bg-green-400" />
                </div>
                <span>{t("more")}</span>
            </div>
        </div>
    );
}

interface ContributionsProps {
    username: string;
    initialCalendar: ContributionCalendar;
    initialYear: number;
    joinedYear: number;
}

export default function ContributionsClient({
    username,
    initialCalendar,
    initialYear,
    joinedYear
}: ContributionsProps) {
    const t = useTranslations("contributions");
    const locale = useLocale();
    const [year, setYear] = useState(initialYear);

    const currentYear = new Date().getFullYear();
    const canGoNext = year < currentYear;
    const canGoPrev = year > joinedYear;

    // 年を切り替えるたびに取得し、サーバーから渡された初期データと結果をキャッシュして再取得を避ける
    const { data: calendar = initialCalendar, isFetching: loading } = useQuery({
        queryKey: ["contributions", username, year],
        queryFn: async (): Promise<ContributionCalendar> => {
            const res = await fetch(`/api/contributions?username=${username}&year=${year}`);
            if (!res.ok) throw new Error("Failed to fetch contributions");
            return res.json();
        },
        initialData: year === initialYear ? initialCalendar : undefined,
        placeholderData: keepPreviousData,
        staleTime: 60 * 60 * 1000,
    });

    return (
        <Section id="contributions">
            {/* ヘッダー */}
            <div className="text-center mb-8 sm:mb-12">
                <p className="text-sm text-muted mb-2 tracking-widest">
                    {t("label")}
                </p>
                <h2 className="text-heading font-bold text-ink mb-4">
                    {t("title")}
                </h2>

                {/* 年セレクター */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <motion.button
                        whileHover={canGoPrev && !loading ? { scale: 1.08 } : undefined}
                        whileTap={canGoPrev && !loading ? { scale: 0.92 } : undefined}
                        onClick={() => setYear(y => y - 1)}
                        disabled={!canGoPrev || loading}
                        className="p-2 rounded-full border border-line text-muted hover:text-ink hover:border-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous year"
                    >
                        <FiChevronLeft size={20} />
                    </motion.button>
                    <span className="relative inline-grid place-items-center text-2xl font-bold text-ink min-w-[80px] overflow-hidden">
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                                key={year}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="col-start-1 row-start-1"
                            >
                                {year}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                    <motion.button
                        whileHover={canGoNext && !loading ? { scale: 1.08 } : undefined}
                        whileTap={canGoNext && !loading ? { scale: 0.92 } : undefined}
                        onClick={() => setYear(y => y + 1)}
                        disabled={!canGoNext || loading}
                        className="p-2 rounded-full border border-line text-muted hover:text-ink hover:border-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next year"
                    >
                        <FiChevronRight size={20} />
                    </motion.button>
                </div>

                <p className={`text-4xl sm:text-5xl font-bold text-green-500 mb-2 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                    <AnimatedTotal value={calendar.totalContributions} />
                </p>
                <p className="text-muted">
                    {t("totalContributions", { year })}
                </p>
            </div>

            {/* グラフ */}
            <div className={`bg-surface border border-line rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                <ContributionGraph calendar={calendar} year={year} locale={locale} t={t} />

                {/* GitHubリンク */}
                <div className="flex justify-center mt-6">
                    <Link
                        href={`https://github.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${compactButtonClass} rounded-full`}
                    >
                        <FiGithub size={18} />
                        @{username}
                    </Link>
                </div>
            </div>
        </Section>
    );
}
