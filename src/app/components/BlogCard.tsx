"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { IoEyeOutline } from "react-icons/io5";
import { PiNoteLight } from "react-icons/pi";
import { cardClass } from "./ui/card";

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
    const { data: views = null } = useQuery({
        queryKey: ["views", blog.id],
        queryFn: async (): Promise<number> => {
            const res = await fetch(`/api/views?slug=${blog.id}`);
            const data = await res.json();
            return data.count;
        },
        staleTime: 60_000,
    });

    return (
        <Link
            href={`/blog/${blog.id}`}
            className={`group block ${cardClass} overflow-hidden`}
        >
            {/* アイキャッチ */}
            <div className="relative aspect-video bg-ink/5 overflow-hidden">
                {blog.eyecatch ? (
                    <Image
                        src={blog.eyecatch.url}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted">
                        <PiNoteLight />
                    </div>
                )}
            </div>

            {/* コンテンツ */}
            <div className="p-6">
                {/* カテゴリ */}
                {blog.category && (
                    <span className="inline-block px-3 py-1 text-xs font-medium border border-line text-muted rounded-full mb-3">
                        {blog.category.name}
                    </span>
                )}

                {/* タイトル */}
                <h2 className="text-lg font-bold text-ink mb-2 line-clamp-2 group-hover:text-muted transition-colors">
                    {blog.title}
                </h2>

                {/* 日付とビュー数 */}
                <div className="flex items-center gap-3 text-sm text-muted">
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
                                className="text-xs text-muted"
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
