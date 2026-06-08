import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import CookieConsent from "./components/CookieConsent";
import ThemeProvider from "./components/ThemeProvider";
import ThreeBackground from "./components/three-background";
import QueryProvider from "./components/QueryProvider";
import AppToaster from "./components/AppToaster";
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
  "やーはりのポートフォリオサイト。Web開発を中心に活動する中学生エンジニアの制作物・技術ブログ・GitHubでの活動を紹介しています。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | やーはり",
  },
  description: siteDescription,
  keywords: ["やーはり", "Yahari", "ポートフォリオ", "Web開発", "プログラミング", "個人開発", "中学生エンジニア", "Next.js"],
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
    icon: "/icon.png",
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

  // 構造化データ（Person + WebSite）: 検索結果でのナレッジパネル表示・サイトリンク検索ボックスを補強
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: siteName,
        alternateName: "Yahari",
        url: siteUrl,
        image: `${siteUrl}/icon.png`,
        jobTitle: "Web Developer",
        description: siteDescription,
        sameAs: ["https://github.com/ibuki-hum4", "https://x.com/Yaaaaahari"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        inLanguage: ["ja", "en"],
        publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Priority Hints: 重要なリソースの優先読み込み */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://skillicons.dev" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* RSS フィード */}
        <link rel="alternate" type="application/rss+xml" title="やーはり Blog" href="/feed.xml" />
        {/* LCP改善: プロフィール画像のプリロード */}
        <link rel="preload" as="image" href="/icon.png" fetchPriority="high" />
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
                <GoogleAnalytics />
                {children}
                <CookieConsent />
                <AppToaster />
              </QueryProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
