"use client";

import { useEffect, useState } from "react";
import { IoEyeOutline } from "react-icons/io5";

interface ViewCounterProps {
    slug: string;
    increment?: boolean;
}

export default function ViewCounter({ slug, increment = false }: ViewCounterProps) {
    const [views, setViews] = useState<number | null>(null);

    useEffect(() => {
        const updateViews = async () => {
            try {
                if (increment) {
                    // ビュー数をインクリメント
                    const res = await fetch("/api/views", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ slug }),
                    });
                    const data = await res.json();
                    setViews(data.count);
                } else {
                    // ビュー数を取得のみ
                    const res = await fetch(`/api/views?slug=${slug}`);
                    const data = await res.json();
                    setViews(data.count);
                }
            } catch (error) {
                console.error("Failed to fetch views:", error);
            }
        };

        updateViews();
    }, [slug, increment]);

    return (
        <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <IoEyeOutline size={16} />
            <span>{views !== null ? views.toLocaleString() : "..."}</span>
        </span>
    );
}
