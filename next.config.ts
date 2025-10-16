import type { NextConfig } from "next";
import nextpwa from "next-pwa";

const withPWA = nextpwa({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = withPWA({
  reactStrictMode: true,
});

export default nextConfig;
