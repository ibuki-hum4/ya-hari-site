import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IoArrowBack } from "react-icons/io5";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Section from "../../components/ui/section";
import Reveal from "../../components/ui/reveal";
import SplitTitle from "../../components/ui/split-title";
import CommitMessage from "../../components/tools/commit-message";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata = {
    title: "Commit Message Generator",
    description: "Conventional Commits 形式のコミットメッセージを簡単生成。プレフィックス選択・スコープ・説明を入力するだけで統一されたコミットメッセージが作れます。gitmoji 対応。",
    alternates: { canonical: "/tools/commit-message" },
    openGraph: {
        type: "website",
        url: `${siteUrl}/tools/commit-message`,
        title: "Commit Message Generator | やーはり",
        description: "Conventional Commits 形式のコミットメッセージを簡単生成。",
    },
    twitter: {
        card: "summary",
        title: "Commit Message Generator | やーはり",
        description: "Conventional Commits 形式のコミットメッセージを簡単生成。",
    },
};

export default async function CommitMessagePage() {
    const t = await getTranslations("tools.commitMessage");
    const tt = await getTranslations("tools");

    const softwareJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Commit Message Generator",
        description: "Conventional Commits 形式のコミットメッセージをリアルタイム生成。type 選択・scope・description・gitmoji 対応。",
        url: `${siteUrl}/tools/commit-message`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web Browser",
        isAccessibleForFree: true,
        author: { "@type": "Person", "@id": `${siteUrl}/#person` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
        featureList: ["Conventional Commits", "gitmoji", "BREAKING CHANGE", "Real-time preview", "Copy to clipboard"],
    };

    return (
        <div className="min-h-screen flex flex-col">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
            <Header />

            <main className="pt-20 flex-1">
                <Section>
                    <Reveal>
                        <Link
                            href="/tools"
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-10 sm:mb-16"
                        >
                            <IoArrowBack size={16} />
                            {tt("backToTools")}
                        </Link>
                    </Reveal>

                    <div className="mb-12 sm:mb-16">
                        <p className="text-sm text-muted tracking-widest mb-3 select-none">TOOLS</p>
                        <h1 className="text-display font-bold text-ink mb-6 leading-[1.05]">
                            <SplitTitle text={t("title")} />
                        </h1>
                        <Reveal delay={0.25}>
                            <p className="text-muted leading-relaxed max-w-2xl">{t("intro")}</p>
                        </Reveal>
                    </div>

                    <Reveal delay={0.3}>
                        <CommitMessage />
                    </Reveal>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
