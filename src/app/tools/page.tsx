import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IoArrowBack, IoLockClosedOutline } from "react-icons/io5";
import Header from "../components/header";
import Footer from "../components/footer";
import Section from "../components/ui/section";
import Reveal from "../components/ui/reveal";
import SplitTitle from "../components/ui/split-title";
import ToolsGrid from "../components/tools/ToolsGrid";
import { toolEntries } from "../components/tools/registry";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata = {
    title: "Tools",
    description: "ブラウザだけで動く18種類以上のツール集。パスワードジェネレーター・JSON フォーマッター・HTTP ステータスコード辞典・Commit Message Generator など、サーバーに何も送信しないプライバシー重視のユーティリティを無料公開。",
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

    const toolNames: Record<string, string> = {
        passwordGenerator: "Password Generator",
        jsonFormatter: "JSON Formatter",
        base64Url: "Base64 / URL Encoder",
        colorPalette: "Color Palette Generator",
        typographyPreview: "Typography Preview",
        markdownHtml: "Markdown → HTML",
        textCounter: "Text Counter",
        yamlJson: "YAML ↔ JSON Converter",
        imageColor: "Image Color Picker",
        httpStatus: "HTTP Status Code Dictionary",
        commitMessage: "Commit Message Generator",
        memeGenerator: "Meme Generator",
        excuseGenerator: "Excuse Generator",
        cookieClicker: "Cookie Clicker",
        typingSpeed: "Typing Speed Test",
        yardle: "YARDLE",
        mouseMusic: "Mouse Music Generator",
        noneAI: "None AI Chat",
    };
    const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "やーはりのツール集",
        description: "ブラウザだけで動くWebユーティリティツール集。サーバー送信なし・無料。",
        url: `${siteUrl}/tools`,
        numberOfItems: toolEntries.length,
        itemListElement: toolEntries.map((tool, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
                "@type": "SoftwareApplication",
                name: toolNames[tool.key] ?? tool.key,
                url: `${siteUrl}${tool.href}`,
                applicationCategory: tool.category === "dev" ? "DeveloperApplication" : "EntertainmentApplication",
                operatingSystem: "Web Browser",
                isAccessibleForFree: true,
                author: { "@type": "Person", "@id": `${siteUrl}/#person` },
                offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
            },
        })),
    };

    return (
        <div className="min-h-screen flex flex-col">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
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
