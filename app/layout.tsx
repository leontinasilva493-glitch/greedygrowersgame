import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { siteConfig } from "@/config/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: siteConfig.title,
    template: "%s | Greedy Growers Calculator",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/media/greedy-growers/og/home.png",
        width: 1200,
        height: 630,
        alt: "Fan-made illustration of growth versus lightning risk for Greedy Growers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/media/greedy-growers/og/home.png"],
  },
  icons: {
    icon: [{ url: "/brand/icon.svg", type: "image/svg+xml" }],
    shortcut: "/brand/icon.svg",
    apple: [{ url: "/brand/icon.svg" }],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-[4px] bg-lightning px-4 py-2 font-semibold text-ink transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content" className="min-w-0 flex-1" tabIndex={-1}>
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
