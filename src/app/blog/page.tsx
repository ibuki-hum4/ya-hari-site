import Link from "next/link";
import { getBlogs } from "@/lib/microcms";
import Header from "../components/header";
import Footer from "../components/footer";
import BlogCard from "../components/BlogCard";
import { IoLogoRss } from "react-icons/io5";

export const metadata = {
    title: "Blog | やーはり",
    description: "やーはりのブログ記事一覧",
};

// ISR: 60秒ごとに再検証
export const revalidate = 60;

export default async function BlogPage() {
    const { contents: blogs, totalCount } = await getBlogs({ limit: 12 });

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            <Header />

            <main className="pt-20 flex-1">
                <section className="py-20 px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* ヘッダー */}
                        <div className="text-center mb-16">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 tracking-widest">
                                BLOG
                            </p>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                Blog
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                技術記事や日々の学びを発信しています
                            </p>
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {totalCount} 件の記事
                                </p>
                                <Link
                                    href="/feed.xml"
                                    target="_blank"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                                >
                                    <IoLogoRss size={14} />
                                    RSS
                                </Link>
                            </div>
                        </div>

                        {/* 記事一覧 */}
                        {blogs.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {blogs.map((blog) => (
                                    <BlogCard key={blog.id} blog={blog} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    まだ記事がありません
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
