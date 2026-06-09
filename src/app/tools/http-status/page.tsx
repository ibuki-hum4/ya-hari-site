import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IoArrowBack } from "react-icons/io5";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Section from "../../components/ui/section";
import Reveal from "../../components/ui/reveal";
import SplitTitle from "../../components/ui/split-title";
import HttpStatus from "../../components/tools/http-status";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata = {
    title: "HTTP Status Code Dictionary",
    description: "1xx から 5xx まで全 HTTP ステータスコードをゆるく一言解説。コード番号・名前・説明でリアルタイム検索できます。",
    alternates: { canonical: "/tools/http-status" },
    openGraph: {
        type: "website",
        url: `${siteUrl}/tools/http-status`,
        title: "HTTP Status Code Dictionary | やーはり",
        description: "全 HTTP ステータスコードをゆるく一言解説。",
    },
    twitter: {
        card: "summary",
        title: "HTTP Status Code Dictionary | やーはり",
        description: "全 HTTP ステータスコードをゆるく一言解説。",
    },
};

export default async function HttpStatusPage() {
    const t = await getTranslations("tools.httpStatus");
    const tt = await getTranslations("tools");

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="pt-20 flex-1">
                <Section>
                    <Reveal>
                        <Link
                            href="/tools"
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-10 sm:mb-16"
                        >
                            <IoArrowBack size={16} />
                            {tt("backToTools")}
                        </Link>
                    </Reveal>

                    <div className="mb-12 sm:mb-16">
                        <p className="text-sm text-muted tracking-widest mb-3 select-none">TOOLS</p>
                        <h1 className="text-display font-bold text-ink mb-6 leading-[1.05]">
                            <SplitTitle text={t("title")} />
                        </h1>
                        <Reveal delay={0.25}>
                            <p className="text-muted leading-relaxed max-w-2xl">{t("intro")}</p>
                        </Reveal>
                    </div>

                    <Reveal delay={0.3}>
                        <HttpStatus />
                    </Reveal>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
