"use client";

import { FiExternalLink, FiGithub } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { useTranslations } from "next-intl";

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
        <section id="projects" className="py-12 sm:py-20 px-4 sm:px-8 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-12 text-center">{t("title")}</h2>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {projects.map((project) => (
                        <div 
                            key={project.title}
                            className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h3>
                                {project.status === "in-progress" && (
                                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                                        開発中
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{project.description}</p>
                            
                            {project.links && (
                                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-600">
                                    {project.links.demo && (
                                        <a 
                                            href={project.links.demo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
                                            className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
                                            className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            <FaDiscord size={18} />
                                            <span className="text-sm">Invite</span>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}