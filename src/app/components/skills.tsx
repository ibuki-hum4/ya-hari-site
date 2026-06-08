"use client";

import { useTranslations } from "next-intl";
import Section from "./ui/section";
import Reveal from "./ui/reveal";
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
} from "react-icons/si";

export default function Skills() {
    const t = useTranslations("skills");

    const favoriteIcons = [
        { name: "React", Icon: SiReact, className: "text-sky-500" },
        { name: "Next.js", Icon: SiNextdotjs, className: "text-gray-900 dark:text-white" },
        { name: "Discord.js", Icon: SiDiscord, className: "text-indigo-500" },
        { name: "Tailwind CSS", Icon: SiTailwindcss, className: "text-sky-400" },
        { name: "Node.js", Icon: SiNodedotjs, className: "text-green-600" },
        { name: "Docker", Icon: SiDocker, className: "text-blue-500" },
        { name: "Kubernetes", Icon: SiKubernetes, className: "text-blue-600" },
        { name: "Git", Icon: SiGit, className: "text-orange-500" },
        { name: "GitHub", Icon: SiGithub, className: "text-gray-900 dark:text-white" },
        { name: "Figma", Icon: SiFigma, className: "text-pink-500" },
    ];

    return (
        <Section id="skills">
            <Reveal>
                <h2 className="text-heading font-bold text-ink mb-8 sm:mb-12 text-center">
                    {t("title")}
                </h2>
            </Reveal>

            <div className="relative select-none">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-8 bg-gradient-to-r from-surface to-transparent backdrop-blur-sm" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-8 bg-gradient-to-l from-surface to-transparent backdrop-blur-sm" />
                <div className="overflow-hidden">
                    <div className="flex w-max items-center gap-6 animate-marquee">
                        {/* マーキーをシームレスにループさせるため、アイコン列を複製して並べる */}
                        {[...favoriteIcons, ...favoriteIcons].map(({ name, Icon, className }, index) => (
                            <div
                                key={`${name}-${index}`}
                                className="flex flex-col items-center gap-2 min-w-[64px]"
                            >
                                <Icon className={`text-4xl ${className}`} aria-hidden="true" />
                                <span className="text-xs text-muted">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-marquee {
                    animation: marquee 12s linear infinite;
                }
            `}</style>
        </Section>
    );
}
