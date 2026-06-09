import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import Header from "../components/header";
import Footer from "../components/footer";
import Section from "../components/ui/section";
import Reveal from "../components/ui/reveal";
import SplitTitle from "../components/ui/split-title";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata = {
    title: "Projects",
    description: "やーはりが手がけたプロジェクト一覧。個人開発のAPIから学校向けツールまで、興味の赴くままに作ってきたものを紹介しています。",
    alternates: {
        canonical: "/projects",
    },
    openGraph: {
        type: "website",
        url: `${siteUrl}/projects`,
        title: "Projects | やーはり",
        description: "やーはりが手がけたプロジェクト一覧。",
    },
    twitter: {
        card: "summary",
        title: "Projects | やーはり",
        description: "やーはりが手がけたプロジェクト一覧。",
    },
};

type ProjectEntry = {
    key: "bluearchive" | "school" | "alt";
    status: "completed" | "in-progress";
    links?: {
        demo?: string;
        github?: string;
        invite?: string;
    };
};

const projectEntries: ProjectEntry[] = [
    {
        key: "bluearchive",
        status: "completed",
        links: {
            demo: "https://bluearchive-api.skyia.jp/",
            github: "https://github.com/ibuki-hum4/BlueArchiveAPI",
        },
    },
    {
        key: "school",
        status: "in-progress",
    },
    {
        key: "alt",
        status: "completed",
    },
];

export default async function ProjectsPage() {
    const t = await getTranslations("projects");
    const tc = await getTranslations("common");

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Projects", item: `${siteUrl}/projects` },
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
                        <p className="text-sm text-muted tracking-widest mb-3 select-none">WORKS</p>
                        <h1 className="text-display font-bold text-ink mb-6 leading-[1.05]">
                            <SplitTitle text={t("title")} />
                        </h1>
                        <Reveal delay={0.25}>
                            <p className="text-muted max-w-2xl leading-relaxed">
                                {t("pageIntro")}
                            </p>
                        </Reveal>
                    </div>

                    {/* ジグザグショーケース: プロジェクトごとに左右の寄せを反転させる */}
                    <div className="space-y-16 sm:space-y-28">
                        {projectEntries.map((project, index) => {
                            const align = index % 2 === 0 ? "left" : "right";
                            return (
                                <Reveal key={project.key}>
                                    <div className={align === "left" ? "text-left" : "text-right ml-auto"}>
                                        <p className="text-sm text-muted tracking-widest mb-3 select-none">
                                            {String(index + 1).padStart(2, "0")} —{" "}
                                            {project.status === "completed" ? "RELEASED" : "IN PROGRESS"}
                                        </p>
                                        <h2 className="text-2xl sm:text-4xl font-bold text-ink mb-5 leading-snug max-w-2xl"
                                            style={align === "right" ? { marginLeft: "auto" } : undefined}
                                        >
                                            {t(`items.${project.key}.title`)}
                                        </h2>
                                        <p
                                            className="text-muted leading-relaxed max-w-xl mb-6"
                                            style={align === "right" ? { marginLeft: "auto" } : undefined}
                                        >
                                            {t(`items.${project.key}.description`)}
                                        </p>

                                        {project.links && (
                                            <div className={`flex flex-wrap gap-5 ${align === "right" ? "justify-end" : "justify-start"}`}>
                                                {project.links.demo && (
                                                    <a
                                                        href={project.links.demo}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-ink hover:opacity-60 transition-opacity"
                                                    >
                                                        <FiExternalLink size={18} />
                                                        <span className="text-sm underline underline-offset-4">{t("viewProject")}</span>
                                                    </a>
                                                )}
                                                {project.links.github && (
                                                    <a
                                                        href={project.links.github}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-muted hover:text-ink transition-colors"
                                                    >
                                                        <FiGithub size={18} />
                                                        <span className="text-sm">GitHub</span>
                                                    </a>
                                                )}
                                                {project.links.invite && (
                                                    <a
                                                        href={project.links.invite}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-muted hover:text-ink transition-colors"
                                                    >
                                                        <FaDiscord size={18} />
                                                        <span className="text-sm">Invite</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
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
