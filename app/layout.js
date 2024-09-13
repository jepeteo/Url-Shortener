import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: 'URL Shortener - Mentis T.',
  description: 'A url shortener built with Next.js and MongoDB by Theodororos Mentis.',
  openGraph: {
    title: 'URL Shortener - Mentis T.',
    description: 'A url shortener built with Next.js and MongoDB by Theodororos Mentis.',
    url: 'https://your-url-shortener.com',
    siteName: 'URL Shortener',
    images: [
      {
        url: 'https://your-url-shortener.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
        <Providers>
          <main id="main-content">{children}</main>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
