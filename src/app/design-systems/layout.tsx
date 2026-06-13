import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata: Metadata = {
    title: "Design System",
    description: "やーはりのポートフォリオサイトを構成するデザイントークンとUIプリミティブの一覧。配色・タイポグラフィ・余白・ボタンやカードなどのコンポーネントを一箇所にまとめています。",
    alternates: {
        canonical: "/design-systems",
    },
    openGraph: {
        type: "website",
        url: `${siteUrl}/design-systems`,
        title: "Design System | やーはり",
        description: "やーはりのポートフォリオサイトを構成するデザイントークンとUIプリミティブの一覧。",
    },
    twitter: {
        card: "summary",
        title: "Design System | やーはり",
        description: "やーはりのポートフォリオサイトを構成するデザイントークンとUIプリミティブの一覧。",
    },
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Design System", item: `${siteUrl}/design-systems` },
    ],
};

export default function DesignSystemsLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            {children}
        </>
    );
}
