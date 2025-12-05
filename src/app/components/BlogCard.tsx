"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoEyeOutline } from "react-icons/io5";
import { PiNoteLight } from "react-icons/pi";

interface Blog {
    id: string;
    title: string;
    publishedAt: string;
    eyecatch?: {
        url: string;
    };
    category?: {
        name: string;
    };
    tags?: {
        id: string;
        name: string;
    }[];
}

interface BlogCardProps {
    blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
    const [views, setViews] = useState<number | null>(null);

    useEffect(() => {
        const fetchViews = async () => {
            try {
                const res = await fetch(`/api/views?slug=${blog.id}`);
                const data = await res.json();
                setViews(data.count);
            } catch (error) {
                console.error("Failed to fetch views:", error);
            }
        };
        fetchViews();
    }, [blog.id]);

    return (
        <Link
            href={`/blog/${blog.id}`}
            className="group block bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            {/* アイキャッチ */}
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {blog.eyecatch ? (
                    <Image
                        src={blog.eyecatch.url}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        <PiNoteLight />
                    </div>
                )}
            </div>

            {/* コンテンツ */}
            <div className="p-6">
                {/* カテゴリ */}
                {blog.category && (
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full mb-3">
                        {blog.category.name}
                    </span>
                )}

                {/* タイトル */}
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {blog.title}
                </h2>

                {/* 日付とビュー数 */}
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <time>
                        {new Date(blog.publishedAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </time>
                    <span className="inline-flex items-center gap-1">
                        <IoEyeOutline size={14} />
                        {views !== null ? views.toLocaleString() : "..."}
                    </span>
                </div>

                {/* タグ */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {blog.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag.id}
                                className="text-xs text-gray-500 dark:text-gray-400"
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
