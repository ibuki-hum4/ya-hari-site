import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { getTranslations } from "next-intl/server";
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
import Section from "./ui/section";
import Reveal from "./ui/reveal";
import SplitTitle from "./ui/split-title";

const favoriteIcons = [
    { name: "React",        Icon: SiReact,        className: "text-sky-500" },
    { name: "Next.js",      Icon: SiNextdotjs,    className: "text-gray-900 dark:text-white" },
    { name: "Discord.js",   Icon: SiDiscord,      className: "text-indigo-500" },
    { name: "Tailwind CSS", Icon: SiTailwindcss,  className: "text-sky-400" },
    { name: "Node.js",      Icon: SiNodedotjs,    className: "text-green-600" },
    { name: "Docker",       Icon: SiDocker,       className: "text-blue-500" },
    { name: "Kubernetes",   Icon: SiKubernetes,   className: "text-blue-600" },
    { name: "Git",          Icon: SiGit,          className: "text-orange-500" },
    { name: "GitHub",       Icon: SiGithub,       className: "text-gray-900 dark:text-white" },
    { name: "Figma",        Icon: SiFigma,        className: "text-pink-500" },
];

// マーキーをシームレスにループさせるため、アイコン列を複製して並べる
const marqueeIcons = [...favoriteIcons, ...favoriteIcons];

export default async function Skills() {
    const t = await getTranslations("skills");
    const tc = await getTranslations("common");

    return (
        <Section id="skills">
            <h2 className="text-heading font-bold text-ink mb-8 sm:mb-12 text-left">
                <SplitTitle text={t("title")} />
            </h2>

            <div className="relative select-none">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-8 bg-gradient-to-r from-surface to-transparent backdrop-blur-sm" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-8 bg-gradient-to-l from-surface to-transparent backdrop-blur-sm" />
                <div className="overflow-hidden">
                    <div className="flex w-max items-center gap-6 animate-marquee">
                        {marqueeIcons.map(({ name, Icon, className }, index) => (
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

            <Reveal delay={0.2}>
                <div className="mt-8 sm:mt-12 text-center">
                    <Link
                        href="/skills"
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
