import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogDetail, getAllBlogIds } from "@/lib/microcms";
import Header from "../../components/header";
import Footer from "../../components/footer";
import ViewCounter from "../../components/ViewCounter";
import { secondaryButtonClass } from "../../components/ui/button";
import { IoArrowBack, IoTimeOutline, IoCalendarOutline } from "react-icons/io5";
import { marked } from "marked";

interface Props {
    params: Promise<{ slug: string }>;
}

// markedの設定
marked.setOptions({
    gfm: true,
    breaks: true,
});

// 静的生成するパスを生成
export async function generateStaticParams() {
    const ids = await getAllBlogIds();
    return ids.map((id) => ({ slug: id }));
}

// メタデータ生成
export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    try {
        const blog = await getBlogDetail(slug);
        return {
            title: `${blog.title} | やーはり Blog`,
            description: blog.content.replace(/<[^>]*>/g, "").slice(0, 160),
            openGraph: {
                title: blog.title,
                description: blog.content.replace(/<[^>]*>/g, "").slice(0, 160),
                images: blog.eyecatch ? [blog.eyecatch.url] : [],
            },
        };
    } catch {
        return {
            title: "記事が見つかりません | やーはり Blog",
        };
    }
}

// ISR: 60秒ごとに再検証
export const revalidate = 60;

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;
    
    let blog;
    try {
        blog = await getBlogDetail(slug);
    } catch {
        notFound();
    }

    // 読了時間を計算（日本語: 約500文字/分）
    const textContent = blog.content.replace(/<[^>]*>/g, "");
    const readingTime = Math.max(1, Math.ceil(textContent.length / 500));

    // HTMLかマークダウンかを判定（HTMLタグが含まれていればHTML）
    const isHtml = /<[a-z][\s\S]*>/i.test(blog.content);
    const htmlContent = isHtml ? blog.content : await marked.parse(blog.content);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="pt-20 flex-1">
                <article className="py-8 sm:py-12 px-4 sm:px-8">
                    <div className="max-w-3xl mx-auto">
                        {/* 戻るリンク */}
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-muted hover:text-ink transition-colors mb-8"
                        >
                            <IoArrowBack size={18} />
                            <span>記事一覧に戻る</span>
                        </Link>

                        {/* ヘッダー */}
                        <header className="mb-10">
                            {/* カテゴリ */}
                            {blog.category && (
                                <span className="inline-block px-3 py-1 text-sm font-medium border border-line text-muted rounded-full mb-4">
                                    {blog.category.name}
                                </span>
                            )}

                            {/* タイトル */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-4 sm:mb-6 leading-tight">
                                {blog.title}
                            </h1>

                            {/* メタ情報 */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                                <div className="flex items-center gap-1">
                                    <IoCalendarOutline size={16} />
                                    <time>
                                        {new Date(blog.publishedAt).toLocaleDateString("ja-JP", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </time>
                                </div>
                                <div className="flex items-center gap-1">
                                    <IoTimeOutline size={16} />
                                    <span>約 {readingTime} 分で読めます</span>
                                </div>
                                <ViewCounter slug={slug} increment />
                            </div>

                            {/* タグ */}
                            {blog.tags && blog.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {blog.tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="px-3 py-1 text-sm border border-line text-muted rounded-full"
                                        >
                                            #{tag.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </header>

                        {/* アイキャッチ */}
                        {blog.eyecatch && (
                            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 border border-line">
                                <Image
                                    src={blog.eyecatch.url}
                                    alt={blog.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 768px"
                                />
                            </div>
                        )}

                        {/* 本文 */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none
                                prose-headings:font-bold prose-headings:text-ink
                                prose-p:text-muted prose-p:leading-relaxed
                                prose-a:text-ink prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-muted
                                prose-strong:text-ink
                                prose-code:bg-ink/5 prose-code:text-ink prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                                prose-pre:bg-ink prose-pre:text-surface prose-pre:rounded-xl
                                prose-img:rounded-xl
                                prose-hr:border-line
                                prose-blockquote:border-l-line prose-blockquote:text-muted
                                prose-ul:text-muted prose-ol:text-muted
                                prose-th:text-ink prose-td:text-muted prose-thead:border-line prose-tr:border-line"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />

                        {/* フッター */}
                        <footer className="mt-16 pt-8 border-t border-line">
                            <Link
                                href="/blog"
                                className={secondaryButtonClass}
                            >
                                <IoArrowBack size={18} />
                                <span>記事一覧に戻る</span>
                            </Link>
                        </footer>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
