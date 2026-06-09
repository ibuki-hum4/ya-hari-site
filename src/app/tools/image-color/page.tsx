import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IoArrowBack } from "react-icons/io5";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Section from "../../components/ui/section";
import Reveal from "../../components/ui/reveal";
import SplitTitle from "../../components/ui/split-title";
import ImageColor from "../../components/tools/image-color";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata = {
    title: "Image Color Analyzer | やーはり",
    description: "Upload an image to extract its dominant colors with hex codes and percentages.",
    alternates: { canonical: "/tools/image-color" },
    openGraph: { type: "website", url: `${siteUrl}/tools/image-color`, title: "Image Color Analyzer | やーはり", description: "Upload an image to extract its dominant colors with hex codes and percentages." },
    twitter: { card: "summary", title: "Image Color Analyzer | やーはり", description: "Upload an image to extract its dominant colors with hex codes and percentages." },
};

export default async function ToolPage() {
    const t = await getTranslations("tools.imageColor");
    const tt = await getTranslations("tools");
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="pt-20 flex-1">
                <Section>
                    <Reveal>
                        <Link href="/tools" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-10 sm:mb-16">
                            <IoArrowBack size={16} /> {tt("backToTools")}
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
                    <Reveal delay={0.3}><ImageColor /></Reveal>
                </Section>
            </main>
            <Footer />
        </div>
    );
}
