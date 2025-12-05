"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiGithub, FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
            return "bg-gray-100 dark:bg-gray-800";
        case "FIRST_QUARTILE":
            return "bg-green-200 dark:bg-green-900";
        case "SECOND_QUARTILE":
            return "bg-green-400 dark:bg-green-700";
        case "THIRD_QUARTILE":
            return "bg-green-500 dark:bg-green-500";
        case "FOURTH_QUARTILE":
            return "bg-green-600 dark:bg-green-400";
        default:
            return "bg-gray-100 dark:bg-gray-800";
    }
}

// 日付をフォーマット
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

interface ContributionGraphProps {
    calendar: ContributionCalendar;
}

function ContributionGraph({ calendar }: ContributionGraphProps) {
    const weeks = calendar.weeks.slice(-52);
    const [tooltip, setTooltip] = useState<{ day: ContributionDay; x: number; y: number } | null>(null);

    const handleMouseEnter = (day: ContributionDay, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            day,
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div className="overflow-x-auto relative">
            <div className="inline-flex gap-[3px] min-w-max">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                        {week.contributionDays.map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                className={`w-[10px] h-[10px] rounded-sm ${getContributionColor(day.contributionLevel)} transition-colors cursor-pointer hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500`}
                                onMouseEnter={(e) => handleMouseEnter(day, e)}
                                onMouseLeave={handleMouseLeave}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* ツールチップ */}
            {tooltip && (
                <div
                    className="fixed z-50 px-3 py-2 text-sm bg-gray-900 dark:bg-gray-700 text-white rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 8,
                    }}
                >
                    <p className="font-medium">{formatDate(tooltip.day.date)}</p>
                    <p className="text-gray-300">
                        {tooltip.day.contributionCount > 0
                            ? `${tooltip.day.contributionCount} contributions`
                            : "No contributions"}
                    </p>
                    {/* 矢印 */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900 dark:border-t-gray-700" />
                </div>
            )}

            {/* 凡例 */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Less</span>
                <div className="flex gap-[3px]">
                    <div className="w-[10px] h-[10px] rounded-sm bg-gray-100 dark:bg-gray-800" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-green-200 dark:bg-green-900" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-green-400 dark:bg-green-700" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-green-500 dark:bg-green-500" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-green-600 dark:bg-green-400" />
                </div>
                <span>More</span>
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
    const [calendar, setCalendar] = useState<ContributionCalendar>(initialCalendar);
    const [year, setYear] = useState(initialYear);
    const [loading, setLoading] = useState(false);

    const currentYear = new Date().getFullYear();
    const canGoNext = year < currentYear;
    const canGoPrev = year > joinedYear;

    useEffect(() => {
        if (year === initialYear) {
            setCalendar(initialCalendar);
            return;
        }

        const fetchContributions = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/contributions?username=${username}&year=${year}`);
                if (res.ok) {
                    const data = await res.json();
                    setCalendar(data);
                }
            } catch (error) {
                console.error("Failed to fetch contributions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContributions();
    }, [year, username, initialYear, initialCalendar]);

    return (
        <section id="contributions" className="py-20 px-8 bg-white dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                {/* ヘッダー */}
                <div className="text-center mb-12">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 tracking-widest">
                        CONTRIBUTIONS
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        GitHub Activity
                    </h2>
                    
                    {/* 年セレクター */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <button
                            onClick={() => setYear(y => y - 1)}
                            disabled={!canGoPrev || loading}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous year"
                        >
                            <FiChevronLeft size={20} />
                        </button>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white min-w-[80px]">
                            {year}
                        </span>
                        <button
                            onClick={() => setYear(y => y + 1)}
                            disabled={!canGoNext || loading}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next year"
                        >
                            <FiChevronRight size={20} />
                        </button>
                    </div>

                    <p className={`text-5xl font-bold text-green-500 mb-2 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                        {calendar.totalContributions.toLocaleString()}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                        contributions in {year}
                    </p>
                </div>

                {/* グラフ */}
                <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                    <ContributionGraph calendar={calendar} />
                    
                    {/* GitHubリンク */}
                    <div className="flex justify-center mt-6">
                        <Link
                            href={`https://github.com/${username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <FiGithub size={18} />
                            @{username}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
