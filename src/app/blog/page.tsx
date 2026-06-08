import Link from "next/link";
import { getBlogs } from "@/lib/microcms";
import Header from "../components/header";
import Footer from "../components/footer";
import BlogCard from "../components/BlogCard";
import Section from "../components/ui/section";
import Reveal from "../components/ui/reveal";
import { compactButtonClass } from "../components/ui/button";
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
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="pt-20 flex-1">
                <Section>
                    {/* ヘッダー */}
                    <Reveal>
                        <div className="text-center mb-10 sm:mb-16">
                            <p className="text-sm text-muted mb-2 tracking-widest">
                                BLOG
                            </p>
                            <h1 className="text-heading font-bold text-ink mb-4">
                                Blog
                            </h1>
                            <p className="text-muted">
                                技術記事や日々の学びを発信しています
                            </p>
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <p className="text-sm text-muted">
                                    {totalCount} 件の記事
                                </p>
                                <Link
                                    href="/feed.xml"
                                    target="_blank"
                                    className={`${compactButtonClass} rounded-full`}
                                >
                                    <IoLogoRss size={14} />
                                    RSS
                                </Link>
                            </div>
                        </div>
                    </Reveal>

                    {/* 記事一覧 */}
                    {blogs.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                            {blogs.map((blog, index) => (
                                <Reveal key={blog.id} delay={Math.min(index % 3, 2) * 0.1}>
                                    <BlogCard blog={blog} />
                                </Reveal>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-muted">
                                まだ記事がありません
                            </p>
                        </div>
                    )}
                </Section>
            </main>

            <Footer />
        </div>
    );
}
