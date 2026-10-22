import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { IoArrowBack } from "react-icons/io5";
import {
    SiReact,
    SiNextdotjs,
    SiDiscord,
    SiTailwindcss,
    SiNodedotjs,
    SiDocker,
    SiKubernetes,
    SiGit,
    SiGithub,
    SiFigma,
    SiGo,
    SiRuby,
    SiTypescript,
} from "react-icons/si";
import type { IconType } from "react-icons";
import Header from "../components/header";
import Footer from "../components/footer";
import Section from "../components/ui/section";
import Reveal from "../components/ui/reveal";
import SplitTitle from "../components/ui/split-title";
import { skillEntries } from "@/data/skills";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata = {
    title: "Skills",
    description: "やーはりが普段使っている言語・フレームワーク・ツールの一覧。それぞれが何のためにあるのかを一言で紹介しています。",
    alternates: {
        canonical: "/skills",
    },
    openGraph: {
        type: "website",
        url: `${siteUrl}/skills`,
        title: "Skills | やーはり",
        description: "やーはりが普段使っている言語・フレームワーク・ツールの一覧。",
    },
    twitter: {
        card: "summary",
        title: "Skills | やーはり",
        description: "やーはりが普段使っている言語・フレームワーク・ツールの一覧。",
    },
};

// skillEntries の name → アイコンと色
const skillIcons: Record<string, { Icon: IconType; className: string }> = {
    "React": { Icon: SiReact, className: "text-sky-500" },
    "Next.js": { Icon: SiNextdotjs, className: "text-gray-900 dark:text-white" },
    "Discord.js": { Icon: SiDiscord, className: "text-indigo-500" },
    "Tailwind CSS": { Icon: SiTailwindcss, className: "text-sky-400" },
    "Node.js": { Icon: SiNodedotjs, className: "text-green-600" },
    "Docker": { Icon: SiDocker, className: "text-blue-500" },
    "Kubernetes": { Icon: SiKubernetes, className: "text-blue-600" },
    "Git": { Icon: SiGit, className: "text-orange-500" },
    "GitHub": { Icon: SiGithub, className: "text-gray-900 dark:text-white" },
    "Figma": { Icon: SiFigma, className: "text-pink-500" },
    "Disgo": { Icon: SiGo, className: "text-cyan-500" },
    "Go": { Icon: SiGo, className: "text-cyan-500" },
    "Ruby": { Icon: SiRuby, className: "text-red-600" },
    "TypeScript / JavaScript": { Icon: SiTypescript, className: "text-blue-600" },
};

export default async function SkillsPage() {
    const t = await getTranslations("skills");
    const tc = await getTranslations("common");
    const locale = await getLocale();

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Skills", item: `${siteUrl}/skills` },
        ],
    };

    return (
        <div className="min-h-screen flex flex-col">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
                        <p className="text-sm text-muted tracking-widest mb-3 select-none">TOOLBOX</p>
                        <h1 className="text-display font-bold text-ink mb-6 leading-[1.05]">
                            <SplitTitle text={t("title")} />
                        </h1>
                        <Reveal delay={0.25}>
                            <p className="text-muted max-w-2xl leading-relaxed">
                                {t("pageIntro")}
                            </p>
                        </Reveal>
                    </div>

                    {/* ジグザグリスト: 1行ごとに左右の寄せを反転させる */}
                    <div className="divide-y divide-line border-y border-line">
                        {skillEntries.map(({ name, ja, en }, index) => {
                            const align = index % 2 === 0 ? "left" : "right";
                            const { Icon, className } = skillIcons[name];
                            return (
                                <Reveal key={name} delay={Math.min(index, 6) * 0.05}>
                                    <div
                                        className={`flex items-center gap-5 sm:gap-8 py-6 sm:py-8 ${
                                            align === "right" ? "flex-row-reverse text-right" : "text-left"
                                        }`}
                                    >
                                        <Icon className={`text-4xl sm:text-5xl shrink-0 ${className}`} aria-hidden="true" />
                                        <div>
                                            <h2 className="text-lg sm:text-2xl font-bold text-ink">{name}</h2>
                                            <p className="text-sm sm:text-base text-muted mt-1">{locale === "ja" ? ja : en}</p>
                                        </div>
                                    </div>
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
