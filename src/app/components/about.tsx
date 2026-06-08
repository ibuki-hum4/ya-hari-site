"use client";

import Link from "next/link";
import { FiMusic, FiServer, FiArrowRight } from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import Section from "./ui/section";
import Card from "./ui/card";
import Reveal from "./ui/reveal";
import SplitTitle from "./ui/split-title";

export default function About() {
    const t = useTranslations("about");
    const tc = useTranslations("common");
    const hobbies = ["音楽", "ゲーム"];
    const abilities = ["バリトンサックス", "ギター", "インフラ", "k8s"];

    return (
        <Section id="about">
            <h2 className="text-heading font-bold text-ink mb-8 sm:mb-12 text-left">
                <SplitTitle text={t("title")} />
            </h2>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-12">
                {/* プロフィール */}
                <Reveal>
                    <Card className="p-6 sm:p-8">
                        <h3 className="text-2xl font-bold text-ink mb-4">{t("name")}</h3>
                        <p className="text-muted mb-6">{t("age")} / {t("school")}</p>

                        {/* 趣味 */}
                        <div className="flex items-center gap-2 mb-4">
                            <IoGameControllerOutline size={20} className="text-muted" />
                            <FiMusic size={20} className="text-muted" />
                            <span className="text-muted">{hobbies.join("、")}</span>
                        </div>
                    </Card>
                </Reveal>

                {/* できること */}
                <Reveal delay={0.1}>
                    <Card className="p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <FiServer size={20} className="text-muted" />
                            <h3 className="text-xl font-bold text-ink">Abilities</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {abilities.map((ability) => (
                                <span
                                    key={ability}
                                    className="px-3 py-1 border border-line text-muted rounded-full text-sm"
                                >
                                    {ability}
                                </span>
                            ))}
                        </div>
                    </Card>
                </Reveal>
            </div>

            <Reveal delay={0.2}>
                <div className="mt-8 sm:mt-12 text-center">
                    <Link
                        href="/about"
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