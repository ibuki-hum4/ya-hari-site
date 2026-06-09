import Link from "next/link";
import { FiExternalLink, FiGithub, FiArrowRight } from "react-icons/fi";
import { getTranslations } from "next-intl/server";
import Section from "./ui/section";
import Card from "./ui/card";
import Reveal from "./ui/reveal";
import SplitTitle from "./ui/split-title";

type Project = {
    title: string;
    description: string;
    status: "completed" | "in-progress";
    links?: {
        demo?: string;
        github?: string;
    };
};

export default async function Projects() {
    const t = await getTranslations("projects");
    const tc = await getTranslations("common");

    const projects: Project[] = [
        {
            title: t("items.bluearchive.title"),
            description: t("items.bluearchive.description"),
            status: "completed",
            links: {
                demo: "https://bluearchive-api.skyia.jp/",
                github: "https://github.com/ibuki-hum4/BlueArchiveAPI",
            },
        },
        {
            title: t("items.school.title"),
            description: t("items.school.description"),
            status: "in-progress",
        },
        {
            title: t("items.alt.title"),
            description: t("items.alt.description"),
            status: "completed",
        },
    ];

    return (
        <Section id="projects">
            <h2 className="text-heading font-bold text-ink mb-8 sm:mb-12 text-right">
                <SplitTitle text={t("title")} />
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {projects.map((project, index) => (
                    <Reveal key={project.title} delay={Math.min(index, 2) * 0.1}>
                    <Card className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-ink">{project.title}</h3>
                            {project.status === "in-progress" && (
                                <span className="px-2 py-1 border border-line text-muted rounded-full text-xs">
                                    開発中
                                </span>
                            )}
                        </div>
                        <p className="text-muted mb-4 flex-grow">{project.description}</p>

                        {project.links && (
                            <div className="flex gap-3 mt-auto pt-4 border-t border-line">
                                {project.links.demo && (
                                    <a
                                        href={project.links.demo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-muted hover:text-ink transition-colors"
                                    >
                                        <FiExternalLink size={18} />
                                        <span className="text-sm">Demo</span>
                                    </a>
                                )}
                                {project.links.github && (
                                    <a
                                        href={project.links.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-muted hover:text-ink transition-colors"
                                    >
                                        <FiGithub size={18} />
                                        <span className="text-sm">GitHub</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </Card>
                    </Reveal>
                ))}
            </div>

            <Reveal delay={0.2}>
                <div className="mt-8 sm:mt-12 text-center">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors group"
                    >
                        {tc("viewMore")}
                        <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </Reveal>
        </Section>
    );
}
