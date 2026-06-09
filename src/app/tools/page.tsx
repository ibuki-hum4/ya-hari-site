import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IoArrowBack, IoLockClosedOutline } from "react-icons/io5";
import Header from "../components/header";
import Footer from "../components/footer";
import Section from "../components/ui/section";
import Reveal from "../components/ui/reveal";
import SplitTitle from "../components/ui/split-title";
import ToolsGrid from "../components/tools/ToolsGrid";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata = {
    title: "Tools",
    description: "ブラウザだけで完結する小さなツール集。パスワード生成ツールなど、サーバーに何も送信しないユーティリティを公開しています。",
    alternates: {
        canonical: "/tools",
    },
    openGraph: {
        type: "website",
        url: `${siteUrl}/tools`,
        title: "Tools | やーはり",
        description: "ブラウザだけで完結する小さなツール集。",
    },
    twitter: {
        card: "summary",
        title: "Tools | やーはり",
        description: "ブラウザだけで完結する小さなツール集。",
    },
};

export default async function ToolsPage() {
    const [t, tc] = await Promise.all([
        getTranslations("tools"),
        getTranslations("common"),
    ]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="pt-20 flex-1">
                <Section>
                    <Reveal>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-10 sm:mb-16"
                        >
                            <IoArrowBack size={16} />
                            {tc("backToHome")}
                        </Link>
                    </Reveal>

                    {/* ヒーロー */}
                    <div className="mb-16 sm:mb-28">
                        <p className="text-sm text-muted tracking-widest mb-3 select-none">UTILITIES</p>
                        <h1 className="text-display font-bold text-ink mb-6 leading-[1.05]">
                            <SplitTitle text={t("title")} />
                        </h1>
                        <Reveal delay={0.25}>
                            <div className="flex items-start gap-2.5 max-w-2xl text-muted">
                                <IoLockClosedOutline size={18} className="shrink-0 mt-0.5" />
                                <p className="leading-relaxed">{t("pageIntro")}</p>
                            </div>
                        </Reveal>
                    </div>

                    {/* カテゴリフィルター付きツールグリッド */}
                    <ToolsGrid />
                </Section>
            </main>

            <Footer />
        </div>
    );
}
