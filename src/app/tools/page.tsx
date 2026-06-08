import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IoArrowBack, IoLockClosedOutline } from "react-icons/io5";
import { FiArrowRight } from "react-icons/fi";
import Header from "../components/header";
import Footer from "../components/footer";
import Section from "../components/ui/section";
import Reveal from "../components/ui/reveal";
import SplitTitle from "../components/ui/split-title";
import { cardClass } from "../components/ui/card";
import { toolEntries } from "../components/tools/registry";

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
    const t = await getTranslations("tools");
    const tc = await getTranslations("common");

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

                    {/* ツール一覧: 今後の追加を見据えてカードグリッドで並べる */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                        {toolEntries.map(({ key, href, icon: Icon, status }, index) => {
                            const isAvailable = status === "available";
                            const content = (
                                <div className="flex flex-col h-full p-6 sm:p-7">
                                    <Icon size={28} className="text-ink mb-6" aria-hidden="true" />
                                    <h2 className="text-lg sm:text-xl font-bold text-ink mb-2">
                                        {t(`items.${key}.title`)}
                                    </h2>
                                    <p className="text-sm text-muted leading-relaxed flex-1">
                                        {t(`items.${key}.description`)}
                                    </p>
                                    <span
                                        className={`mt-6 inline-flex items-center gap-2 text-sm ${
                                            isAvailable ? "text-ink" : "text-muted"
                                        }`}
                                    >
                                        {isAvailable ? (
                                            <>
                                                <span className="underline underline-offset-4">{t("openTool")}</span>
                                                <FiArrowRight
                                                    size={14}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            </>
                                        ) : (
                                            <span className="px-3 py-1 border border-line rounded-full text-xs">
                                                {t("comingSoon")}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            );

                            return (
                                <Reveal key={key} delay={Math.min(index, 4) * 0.05}>
                                    {isAvailable ? (
                                        <Link href={href} className={`group block h-full ${cardClass}`}>
                                            {content}
                                        </Link>
                                    ) : (
                                        <div className={`block h-full opacity-60 ${cardClass}`}>{content}</div>
                                    )}
                                </Reveal>
                            );
                        })}
                    </div>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
