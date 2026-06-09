import { IoMailOutline, IoArrowForward } from "react-icons/io5";
import { FiGithub, FiClock, FiGlobe } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Section from "./ui/section";
import { cardClass } from "./ui/card";
import { primaryButtonClass } from "./ui/button";
import Reveal from "./ui/reveal";

export default async function ContactSection() {
    const t = await getTranslations("contact");

    const contactMethods = [
        {
            icon: <IoMailOutline size={28} />,
            title: "EMAIL",
            subtitle: "yahari@skyia.jp",
            description: t("methods.email.description"),
            link: "mailto:yahari@skyia.jp",
        },
        {
            icon: <FiGithub size={28} />,
            title: "GITHUB",
            subtitle: "@ibuki-hum4",
            description: t("methods.github.description"),
            link: "https://github.com/ibuki-hum4",
        },
        {
            icon: <FaXTwitter size={28} />,
            title: "X",
            subtitle: "@Yaaaaahari",
            description: t("methods.x.description"),
            link: "https://x.com/Yaaaaahari",
        },
    ];

    return (
        <Section id="contact" containerClassName="max-w-5xl mx-auto">
            {/* ヘッダー */}
            <Reveal>
                <div className="mb-10 sm:mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-line" />
                        <span className="text-xs font-medium text-muted tracking-[0.3em]">CONTACT</span>
                        <div className="h-px flex-1 bg-line" />
                    </div>
                    <h2 className="text-heading font-bold text-ink text-center mb-4 sm:mb-6">
                        {t("heading")}
                    </h2>
                    <p className="text-muted text-center max-w-xl mx-auto leading-relaxed whitespace-pre-line">
                        {t("description")}
                    </p>
                </div>
            </Reveal>

            {/* ステータスバッジ */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10 sm:mb-14">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-line">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs sm:text-sm text-muted">{t("open")}</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-line">
                    <FiClock size={14} className="text-muted" />
                    <span className="text-xs sm:text-sm text-muted">{t("responseTime")}</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-line">
                    <FiGlobe size={14} className="text-muted" />
                    <span className="text-xs sm:text-sm text-muted">{t("language")}</span>
                </div>
            </div>

            {/* 連絡方法カード */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-10 sm:mb-14">
                {contactMethods.map((method, index) => (
                    <Reveal key={method.title} delay={Math.min(index, 2) * 0.1}>
                    <a
                        href={method.link}
                        target={method.link.startsWith("mailto") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className={`group relative ${cardClass} p-6 overflow-hidden block`}
                    >
                        <div className="relative">
                            <div className="mb-4 text-muted transition-colors duration-300 group-hover:text-ink">
                                {method.icon}
                            </div>
                            <p className="text-xs font-semibold tracking-wider text-muted mb-1">{method.title}</p>
                            <p className="text-ink font-medium text-lg">{method.subtitle}</p>

                            {/* ホバー時の矢印 */}
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <IoArrowForward size={20} className="text-muted" />
                            </div>
                        </div>
                    </a>
                    </Reveal>
                ))}
            </div>

            {/* CTA */}
            <Reveal>
                <div className="text-center">
                    <Link href="/contact" className={`group ${primaryButtonClass} px-8 py-4`}>
                        <IoMailOutline size={22} />
                        <span className="font-medium">{t("cta")}</span>
                        <IoArrowForward size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <p className="mt-4 text-sm text-muted">{t("ctaNote")}</p>
                </div>
            </Reveal>
        </Section>
    );
}
