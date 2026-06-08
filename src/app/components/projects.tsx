"use client";

import { FiExternalLink, FiGithub } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { useTranslations } from "next-intl";
import Section from "./ui/section";
import Card from "./ui/card";
import Reveal from "./ui/reveal";

type Project = {
    title: string;
    description: string;
    status: "completed" | "in-progress";
    links?: {
        demo?: string;
        github?: string;
        invite?: string;
    };
};

export default function Projects() {
    const t = useTranslations("projects");
    
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
            title: t("items.discord.title"),
            description: t("items.discord.description"),
            status: "in-progress",
            links: {
                invite: "https://discord.com/oauth2/authorize?client_id=1419869519475900426"
            },
        },
        {
            title: t("items.school.title"),
            description: t("items.school.description"),
            status: "in-progress",
        },
    ];

    return (
        <Section id="projects">
            <Reveal>
                <h2 className="text-heading font-bold text-ink mb-8 sm:mb-12 text-center">{t("title")}</h2>
            </Reveal>

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
                                {project.links.invite && (
                                    <a
                                        href={project.links.invite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-muted hover:text-ink transition-colors"
                                    >
                                        <FaDiscord size={18} />
                                        <span className="text-sm">Invite</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </Card>
                    </Reveal>
                ))}
            </div>
        </Section>
    );
}