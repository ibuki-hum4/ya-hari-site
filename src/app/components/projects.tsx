"use client";

import { FiExternalLink, FiGithub } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";

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
    const projects: Project[] = [
        {
            title: "BlueArchive API",
            description: "ブルーアーカイブのデータを提供する非公式API",
            status: "completed",
            links: {
                demo: "https://bluearchive-api.skyia.jp/",
                github: "https://github.com/ibuki-hum4/BlueArchiveAPI",
            },
        },
        {
            title: "Discord Bot",
            description: "多機能なDiscord Bot",
            status: "in-progress",
            links: {
                invite: "https://discord.com/oauth2/authorize?client_id=1419869519475900426"
            },
        },
        {
            title: "学校向けSNS・LMS",
            description: "学校向けのSNSと学習管理システム",
            status: "in-progress",
        },
    ];

    return (
        <section id="projects" className="py-20 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Projects</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div 
                            key={project.title}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                                {project.status === "in-progress" && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                        開発中
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 mb-4 flex-grow">{project.description}</p>
                            
                            {project.links && (
                                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                                    {project.links.demo && (
                                        <a 
                                            href={project.links.demo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors"
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
                                            className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors"
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
                                            className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors"
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