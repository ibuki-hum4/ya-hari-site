import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // 画像最適化
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // コンパイラ最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // 実験的機能
  experimental: {
    optimizeCss: true,
  },
};

export default withNextIntl(nextConfig);
