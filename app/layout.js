import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "mikrouli.link — URL Shortener",
  description:
    "Shorten URLs, track clicks, and manage links with mikrouli.link by Theodoros Mentis.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://mikrouli.link"),
    icons: {
      icon: "/favicon.svg",
    },
  openGraph: {
    title: "mikrouli.link — URL Shortener",
    description:
      "Shorten URLs, track clicks, and manage links with analytics and QR codes.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://mikrouli.link",
    siteName: "mikrouli.link",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "mikrouli.link URL Shortener",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        <Providers>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
