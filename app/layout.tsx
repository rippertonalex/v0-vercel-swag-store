import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/lib/cart-context";
import { fetchCart } from "@/lib/cart-actions";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Vercel Swag Store",
    template: "%s | Vercel Swag Store",
  },
  description:
    "Official Vercel merchandise. Premium developer apparel, accessories, and gear.",
  generator: "vswag-cert-v3",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cart = await fetchCart();

  return (
    <html lang="en">
      <head>
        <meta name="generator" content="vswag-cert-v3" />
      </head>
      <body className="font-sans antialiased">
        <CartProvider initialCart={cart}>
          <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
