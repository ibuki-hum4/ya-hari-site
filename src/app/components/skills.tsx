"use client";

import { useTheme } from "./ThemeProvider";
import { useTranslations } from "next-intl";

export default function Skills() {
    const t = useTranslations("skills");
    const { resolvedTheme } = useTheme();
    const iconTheme = resolvedTheme === "dark" ? "dark" : "light";

    // skillicons.dev で使用するスキルID
    const languages = ["js", "ts", "ruby", "go", "html"];
    const frameworks = ["react", "nextjs", "discordjs", "tailwind", "nodejs"];
    const tools = ["docker", "kubernetes", "git", "github", "figma"];

    const languagesUrl = `https://skillicons.dev/icons?i=${languages.join(",")}&theme=${iconTheme}`;
    const frameworksUrl = `https://skillicons.dev/icons?i=${frameworks.join(",")}&theme=${iconTheme}`;
    const toolsUrl = `https://skillicons.dev/icons?i=${tools.join(",")}&theme=${iconTheme}`;

    return (
        <section id="skills" className="py-20 px-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">{t("title")}</h2>
                
                <div className="flex flex-col gap-10">
                    {/* 言語 */}
                    <div className="text-center select-none">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("languages")}</h3>
                        <div className="flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={languagesUrl}
                                alt="Languages"
                                className="max-w-full"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </div>

                    {/* フレームワーク */}
                    <div className="text-center select-none">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("frameworks")}</h3>
                        <div className="flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={frameworksUrl}
                                alt="Frameworks"
                                className="max-w-full"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </div>

                    {/* ツール */}
                    <div className="text-center select-none">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("tools")}</h3>
                        <div className="flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={toolsUrl}
                                alt="Tools"
                                className="max-w-full"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
