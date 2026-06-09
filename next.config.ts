import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        minimumCacheTTL: 31536000,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.microcms-assets.io",
            },
        ],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    // 型チェック・lint はビルドから分離（bun run typecheck / bun run lint で別途実行）
    // Next.js 16 では eslint キーが廃止 → next build は ESLint を実行しない
    typescript: { ignoreBuildErrors: true },
    experimental: {
        // Turbopack の disk cache を有効化（デフォルト false → 毎回フルコンパイルになる）
        // 2回目以降のビルドが劇的に速くなる
        turbopackFileSystemCacheForBuild: true,
        // Server Components を並列コンパイル
        parallelServerCompiles: true,
        // ビルドトレースも並列生成
        parallelServerBuildTraces: true,
        // react-icons / motion などの巨大パッケージのインポートを最適化
        // サブパスのみバンドルするため、モジュールグラフの解析コストが下がる
        optimizePackageImports: [
            "react-icons",
            "motion",
            "@radix-ui/react-dialog",
            "sonner",
        ],
        // optimizeCss を削除: critters が 42 ページを後処理するため最大ボトルネック
        // Tailwind v4 はデフォルトで CSS を最適化済み、inlining の恩恵が少ない
    },
    async headers() {
        return [
            {
                source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-DNS-Prefetch-Control",
                        value: "on",
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
