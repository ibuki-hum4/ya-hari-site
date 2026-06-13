import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import CookieConsent from "./components/CookieConsent";
import ThemeProvider from "./components/ThemeProvider";
import QueryProvider from "./components/QueryProvider";
import ThreeBackground from "./components/three-background-loader";
import AppToaster from "./components/AppToaster";
import { LoadingOverlayProvider } from "./components/loading/overlay";
import NavigationProgress from "./components/NavigationProgress";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

// メインフォント: LINE Seed JP（常用漢字+かな+記号でサブセット済みWOFF2、2ウェイトのみ）
const lineSeedJP = localFont({
  src: [
    { path: "./fonts/LINESeedJP-Regular.subset.woff2", weight: "400", style: "normal" },
    { path: "./fonts/LINESeedJP-Bold.subset.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-line-seed-jp",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// サブセットに含まれない字形のフォールバック（Google側で最適化済み）
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ya-hari.skyia.jp";
const siteName = "やーはり";
const siteTitle = "やーはり | ポートフォリオ";
const siteDescription =
  "プログラミングとテクノロジーが大好きな14歳の中学生エンジニア、やーはりのポートフォリオ。Next.js・TypeScript・Kubernetes を中心に Web 開発からインフラまで手がける個人開発者の制作物・技術ブログ・ブラウザで動くツールを公開しています。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | やーはり",
  },
  description: siteDescription,
  keywords: [
    "やーはり", "Yahari", "ポートフォリオ", "Web開発", "プログラミング",
    "個人開発", "中学生エンジニア", "14歳", "中学3年生", "ibuki-hum4",
    "Yaaaaahari", "Next.js", "TypeScript", "React", "Kubernetes",
    "インフラ", "フルスタック", "Webエンジニア", "やーはりのポートフォリオ",
  ],
  authors: [{ name: "やーはり", url: siteUrl }],
  creator: "やーはり",
  publisher: "やーはり",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    alternateLocale: "en_US",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: "@Yaaaaahari",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  // 構造化データ（Person + ProfilePage + WebSite）
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: "やーはり",
        alternateName: ["Yahari", "やーはり"],
        url: siteUrl,
        image: {
          "@type": "ImageObject",
          "@id": `${siteUrl}/#personimage`,
          url: `${siteUrl}/icon.png`,
          width: 256,
          height: 256,
          caption: "やーはり",
        },
        description: "プログラミングとテクノロジーが大好きな14歳の中学生Webエンジニア。Next.js・TypeScript・Kubernetes などを中心にWeb開発からインフラまで手がける。",
        jobTitle: ["Web Developer", "Full-Stack Developer", "Infrastructure Engineer"],
        hasOccupation: {
          "@type": "Occupation",
          name: "Web Developer",
          occupationLocation: { "@type": "Country", name: "Japan" },
          skills: "Next.js, React, TypeScript, Kubernetes, Docker, Linux, Python",
        },
        nationality: { "@type": "Country", name: "Japan" },
        address: { "@type": "PostalAddress", addressCountry: "JP" },
        knowsAbout: [
          "Next.js", "React", "TypeScript", "JavaScript", "Bun", "Node.js", "Python",
          "Tailwind CSS", "Framer Motion", "Kubernetes", "Docker", "Linux",
          "Web Development", "Full-Stack Development", "Infrastructure Engineering",
          "個人開発", "ポートフォリオ開発",
        ],
        knowsLanguage: [
          { "@type": "Language", name: "Japanese" },
          { "@type": "Language", name: "English" },
        ],
        sameAs: [
          "https://github.com/ibuki-hum4",
          "https://x.com/Yaaaaahari",
          "https://twitter.com/Yaaaaahari",
        ],
        email: "yahari@skyia.jp",
        mainEntityOfPage: { "@type": "ProfilePage", "@id": `${siteUrl}/#profilepage` },
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profilepage`,
        name: siteTitle,
        url: siteUrl,
        description: siteDescription,
        mainEntity: { "@id": `${siteUrl}/#person` },
        about: { "@id": `${siteUrl}/#person` },
        author: { "@id": `${siteUrl}/#person` },
        creator: { "@id": `${siteUrl}/#person` },
        inLanguage: ["ja", "en"],
        isPartOf: { "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        alternateName: ["Yahari Portfolio", "やーはりのポートフォリオ"],
        url: siteUrl,
        description: siteDescription,
        inLanguage: ["ja", "en"],
        publisher: { "@id": `${siteUrl}/#person` },
        author: { "@id": `${siteUrl}/#person` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/blog?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Priority Hints: 重要なリソースの優先読み込み */}
        {/* next/font/google はビルド時にセルフホストされるため fonts.googleapis.com / fonts.gstatic.com への preconnect は不要 */}
        <link rel="dns-prefetch" href="https://skillicons.dev" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* RSS フィード */}
        <link rel="alternate" type="application/rss+xml" title="やーはり Blog" href="/feed.xml" />
        {/* rel="me" — ソーシャルプロフィールとの紐付け（Google/AI の同一人物判定を補強） */}
        <link rel="me" href="https://github.com/ibuki-hum4" />
        <link rel="me" href="https://x.com/Yaaaaahari" />
        {/* LCPのプロフィール画像は hero.tsx の <Image priority> が next/image 用の preload を自動生成するため、ここでの手動 preload は不要（URLが一致せず未使用リソースになる） */}
        {/* Critical CSSのインライン化ヒント */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* 構造化データ: Person + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* ダークモードのフラッシュ防止 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${lineSeedJP.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased bg-surface text-ink transition-colors`}
      >
        <ThreeBackground />
        <div className="relative z-10">
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
              <QueryProvider>
                <LoadingOverlayProvider>
                  <Suspense>
                    <NavigationProgress />
                  </Suspense>
                  <GoogleAnalytics />
                  {children}
                  <CookieConsent />
                  <AppToaster />
                </LoadingOverlayProvider>
              </QueryProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
