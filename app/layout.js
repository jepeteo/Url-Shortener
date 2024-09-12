import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "URL Shortener - Mentis T.",
  description:
    "A url shortener built with Next.js and MongoDB by Theodororos Mentis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
