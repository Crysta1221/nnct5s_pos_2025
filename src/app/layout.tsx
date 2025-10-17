import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Provider as JotaiProvider } from "jotai";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "2025 高専焼き POSシステム",
  description: "2025 Kosenyaki POS System.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "高専焼きPOS",
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "icon",
        url: "/logo.png",
      },
    ],
  },
  applicationName: "高専焼きPOS",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ja' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/logo.png' type='image/png' />
        <link rel='shortcut icon' href='/logo.png' />
        <link rel='apple-touch-icon' href='/logo.png' />
        <link
          rel='manifest'
          href='/manifest.json'
          crossOrigin='use-credentials'
        />
      </head>
      <body className={`${notoSans.variable} antialiased`}>
        <JotaiProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
