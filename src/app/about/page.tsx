import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IoArrowBack, IoGameControllerOutline, IoLocationOutline } from "react-icons/io5";
import { FiMusic, FiCalendar, FiBookOpen, FiGithub, FiArrowRight } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import Header from "../components/header";
import Footer from "../components/footer";
import Section from "../components/ui/section";
import Reveal from "../components/ui/reveal";
import SplitTitle from "../components/ui/split-title";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata = {
    title: "About",
    description: "やーはりのプロフィール。14歳の中学生Webエンジニア。Next.js・TypeScript・Kubernetes を使ったWeb開発・インフラを中心に活動。バリトンサックス・ギターも弾く個人開発者。",
    alternates: {
        canonical: "/about",
    },
    openGraph: {
        type: "profile",
        url: `${siteUrl}/about`,
        title: "About | やーはり",
        description: "やーはりのプロフィール。プログラミングとテクノロジーが大好きな中学生です。",
    },
    twitter: {
        card: "summary",
        title: "About | やーはり",
        description: "やーはりのプロフィール。プログラミングとテクノロジーが大好きな中学生です。",
    },
};

const hobbies = [
    { label: "音楽", icon: FiMusic },
    { label: "ゲーム", icon: IoGameControllerOutline },
];

const abilities = ["バリトンサックス", "ギター", "インフラ", "k8s"];

export default async function AboutPage() {
    const t = await getTranslations("about");
    const tc = await getTranslations("common");

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "About", item: `${siteUrl}/about` },
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
                        <p className="text-sm text-muted tracking-widest mb-3 select-none">PROFILE</p>
                        <h1 className="text-display font-bold text-ink mb-6 leading-[1.05]">
                            <SplitTitle text={t("title")} />
                        </h1>
                        <Reveal delay={0.25}>
                            <p className="text-muted max-w-2xl leading-relaxed">
                                {t("description")}
                            </p>
                        </Reveal>
                    </div>

                    {/* 奇抜なジグザグレイアウト: ブロックごとに左右の寄せを反転させる */}
                    <div className="space-y-16 sm:space-y-28">
                        {/* 01 — 基本情報（左寄せ） */}
                        <Reveal>
                            <div className="text-left">
                                <p className="text-sm text-muted tracking-widest mb-3 select-none">01 — BASICS</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-5">{t("name")}</h2>
                                <div className="flex flex-wrap gap-x-8 gap-y-3 text-muted">
                                    <span className="inline-flex items-center gap-2">
                                        <FiCalendar size={18} />
                                        {t("age")}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <FiBookOpen size={18} />
                                        {t("school")}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <IoLocationOutline size={18} />
                                        {t("location")}
                                    </span>
                                </div>
                            </div>
                        </Reveal>

                        {/* 02 — 趣味（右寄せ） */}
                        <Reveal>
                            <div className="text-right">
                                <p className="text-sm text-muted tracking-widest mb-3 select-none">02 — HOBBIES</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-5">Hobbies</h2>
                                <div className="flex flex-wrap justify-end gap-2">
                                    {hobbies.map(({ label, icon: Icon }) => (
                                        <span
                                            key={label}
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-line text-muted rounded-full text-sm"
                                        >
                                            <Icon size={16} />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        {/* 03 — できること（左寄せ） */}
                        <Reveal>
                            <div className="text-left">
                                <p className="text-sm text-muted tracking-widest mb-3 select-none">03 — ABILITIES</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-5">Abilities</h2>
                                <div className="flex flex-wrap gap-2">
                                    {abilities.map((ability) => (
                                        <span
                                            key={ability}
                                            className="px-4 py-2 border border-line text-muted rounded-full text-sm"
                                        >
                                            {ability}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        {/* 04 — いま取り組んでいること（右寄せ） */}
                        <Reveal>
                            <div className="text-right">
                                <p className="text-sm text-muted tracking-widest mb-3 select-none">04 — NOW</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-5">What I&apos;m up to</h2>
                                <p className="text-muted leading-relaxed max-w-xl ml-auto mb-6">
                                    {t("now")}
                                </p>
                                <div className="flex flex-wrap justify-end gap-x-6 gap-y-2">
                                    <Link
                                        href="/projects"
                                        className="inline-flex items-center gap-2 text-sm text-ink hover:opacity-60 transition-opacity group"
                                    >
                                        <span className="underline underline-offset-4">Projects</span>
                                        <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <Link
                                        href="/skills"
                                        className="inline-flex items-center gap-2 text-sm text-ink hover:opacity-60 transition-opacity group"
                                    >
                                        <span className="underline underline-offset-4">Skills</span>
                                        <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </Reveal>

                        {/* 05 — オンラインでの居場所（左寄せ） */}
                        <Reveal>
                            <div className="text-left">
                                <p className="text-sm text-muted tracking-widest mb-3 select-none">05 — CONNECT</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-5">Find me online</h2>
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href="https://github.com/ibuki-hum4"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-line text-muted hover:text-ink hover:border-ink rounded-full text-sm transition-colors"
                                    >
                                        <FiGithub size={16} />
                                        @ibuki-hum4
                                    </a>
                                    <a
                                        href="https://x.com/Yaaaaahari"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-line text-muted hover:text-ink hover:border-ink rounded-full text-sm transition-colors"
                                    >
                                        <FaXTwitter size={16} />
                                        @Yaaaaahari
                                    </a>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
