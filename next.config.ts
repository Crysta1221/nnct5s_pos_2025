import type { NextConfig } from "next";
import nextpwa from "next-pwa";

const withPWA = nextpwa({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  publicExcludes: ["!manifest.json"],
});

const nextConfig = withPWA({
  reactStrictMode: true,
  // Vercel環境でのパフォーマンス最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // イベントハンドラーの最適化
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-alert-dialog",
    ],
  },
  // クライアント側のレンダリング最適化
  poweredByHeader: false,
} as any);

export default nextConfig as NextConfig;
