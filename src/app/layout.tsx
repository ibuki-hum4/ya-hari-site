import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import CookieConsent from "./components/CookieConsent";
import ThemeProvider from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "やーはり | ポートフォリオ",
  description: "やーはりのポートフォリオサイト。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* Priority Hints: 重要なリソースの優先読み込み */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://skillicons.dev" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* 重要なCSSのプリロード */}
        <link rel="preload" as="image" href="/icon.png" fetchPriority="high" />
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
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`}
      >
        <ThemeProvider>
          <GoogleAnalytics />
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
