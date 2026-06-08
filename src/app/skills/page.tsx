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
import Header from "../components/header";
import Footer from "../components/footer";
import Section from "../components/ui/section";
import Reveal from "../components/ui/reveal";
import SplitTitle from "../components/ui/split-title";

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

const skillEntries = [
    { name: "React", Icon: SiReact, className: "text-sky-500", ja: "UIライブラリ", en: "UI Library" },
    { name: "Next.js", Icon: SiNextdotjs, className: "text-gray-900 dark:text-white", ja: "Reactフレームワーク", en: "React Framework" },
    { name: "Discord.js", Icon: SiDiscord, className: "text-indigo-500", ja: "Discord Bot 用ライブラリ", en: "Discord Bot Library" },
    { name: "Tailwind CSS", Icon: SiTailwindcss, className: "text-sky-400", ja: "ユーティリティファースト CSS", en: "Utility-first CSS" },
    { name: "Node.js", Icon: SiNodedotjs, className: "text-green-600", ja: "JavaScript ランタイム", en: "JavaScript Runtime" },
    { name: "Docker", Icon: SiDocker, className: "text-blue-500", ja: "コンテナ化プラットフォーム", en: "Containerization Platform" },
    { name: "Kubernetes", Icon: SiKubernetes, className: "text-blue-600", ja: "コンテナオーケストレーション", en: "Container Orchestration" },
    { name: "Git", Icon: SiGit, className: "text-orange-500", ja: "バージョン管理システム", en: "Version Control System" },
    { name: "GitHub", Icon: SiGithub, className: "text-gray-900 dark:text-white", ja: "コードホスティングサービス", en: "Code Hosting Service" },
    { name: "Figma", Icon: SiFigma, className: "text-pink-500", ja: "UI デザインツール", en: "UI Design Tool" },
    { name: "Disgo", Icon: SiGo, className: "text-cyan-500", ja: "Go製の Discord Bot 用ライブラリ", en: "Go library for building Discord bots" },
    { name: "Go", Icon: SiGo, className: "text-cyan-500", ja: "シンプルで高速なプログラミング言語", en: "Simple, fast programming language" },
    { name: "Ruby", Icon: SiRuby, className: "text-red-600", ja: "書きやすく読みやすいプログラミング言語", en: "Easy to write and read programming language" },
    { name: "TypeScript / JavaScript", Icon: SiTypescript, className: "text-blue-600", ja: "型を付けて書ける JavaScript と、そのベースとなる言語", en: "Typed superset of JavaScript, and the language it's built on" },
];

export default async function SkillsPage() {
    const t = await getTranslations("skills");
    const tc = await getTranslations("common");
    const locale = await getLocale();

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
                        {skillEntries.map(({ name, Icon, className, ja, en }, index) => {
                            const align = index % 2 === 0 ? "left" : "right";
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
