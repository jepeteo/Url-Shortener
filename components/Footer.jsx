import { Github, Coffee, Heart } from "lucide-react";
import BuyMeACoffee from "@/components/BuyMeACoffee";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose md:text-left">
            © 2024 Theodoros Menits. Made with
          </p>
          <div className="flex space-x-1">
            <Heart className="h-4 w-4" />
            <Github className="h-4 w-4" />
            <Coffee className="h-4 w-4" />
          </div>
        </div>
        <BuyMeACoffee />
        <p className="text-center text-sm md:text-left">
          Powered by Next.js, Tailwind, and Shadcn
        </p>
      </div>
    </footer>
  );
}