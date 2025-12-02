"use client";

import { useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";

export default function VisitorsCounter() {
    const [count, setCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndIncrement = async () => {
            try {
                const res = await fetch("/api/visitors", { method: "POST" });
                const data = await res.json();
                setCount(data.count);
            } catch (error) {
                console.error("Failed to fetch visitor count:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // 1セッションに1回だけカウント
        const hasVisited = sessionStorage.getItem("visited");
        if (!hasVisited) {
            fetchAndIncrement();
            sessionStorage.setItem("visited", "true");
        } else {
            // カウントを取得のみ
            fetch("/api/visitors")
                .then(res => res.json())
                .then(data => setCount(data.count))
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, []);

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
            <FiUsers size={16} />
            <span>
                {isLoading ? "..." : count?.toLocaleString() ?? "-"} visitors
            </span>
        </div>
    );
}
