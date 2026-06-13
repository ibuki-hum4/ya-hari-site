import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "やーはりのポートフォリオサイトにおけるプライバシーポリシー。収集する情報、Google Analyticsなどの利用、Cookieの取り扱いについて説明しています。",
    alternates: {
        canonical: "/privacy",
    },
    openGraph: {
        type: "website",
        url: `${siteUrl}/privacy`,
        title: "Privacy Policy | やーはり",
        description: "やーはりのポートフォリオサイトにおけるプライバシーポリシー。",
    },
    twitter: {
        card: "summary",
        title: "Privacy Policy | やーはり",
        description: "やーはりのポートフォリオサイトにおけるプライバシーポリシー。",
    },
    robots: {
        index: true,
        follow: true,
    },
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Privacy Policy", item: `${siteUrl}/privacy` },
    ],
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            {children}
        </>
    );
}
