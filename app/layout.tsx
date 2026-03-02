import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/lib/cart-context";
import { BrowsingHistoryProvider } from "@/lib/browsing-history";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: {
    default: "Vercel Swag Store",
    template: "%s | Vercel Swag Store",
  },
  description:
    "Official Vercel merchandise. Premium developer apparel, accessories, and gear.",
  generator: "vswag-cert-v3",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Vercel Swag Store",
    description:
      "Official Vercel merchandise. Premium developer apparel, accessories, and gear.",
    type: "website",
    siteName: "Vercel Swag Store",
  },
};

export const viewport: Viewport = {
  themeColor: "#171719",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="generator" content="vswag-cert-v3" />
      </head>
      <body className="font-sans antialiased">
        <Suspense>
          <BrowsingHistoryProvider>
            <CartProvider>
              <div className="flex min-h-svh flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
              <Toaster position="bottom-right" />
            </CartProvider>
          </BrowsingHistoryProvider>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
