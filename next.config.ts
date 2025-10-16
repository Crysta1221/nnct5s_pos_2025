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
} as any);

export default nextConfig as NextConfig;
