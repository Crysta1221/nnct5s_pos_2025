import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
    icon: "/logo.png",
    apple: "/logo.png",
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
        <link
          rel='manifest'
          href='/manifest.json'
          crossOrigin='use-credentials'
        />
      </head>
      <body className={`${notoSans.variable} antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
