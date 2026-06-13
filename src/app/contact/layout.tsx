import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";

export const metadata: Metadata = {
    title: "Contact",
    description: "やーはりへのお問い合わせはこちら。新しいプロジェクトのご相談、技術的な質問、コラボレーションのご提案など、メールやフォームからお気軽にご連絡ください。",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        type: "website",
        url: `${siteUrl}/contact`,
        title: "Contact | やーはり",
        description: "やーはりへのお問い合わせはこちら。お気軽にご連絡ください。",
    },
    twitter: {
        card: "summary",
        title: "Contact | やーはり",
        description: "やーはりへのお問い合わせはこちら。お気軽にご連絡ください。",
    },
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Contact", item: `${siteUrl}/contact` },
    ],
};

export default function ContactLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            {children}
        </>
    );
}
