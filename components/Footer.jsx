import { Github, Linkedin, Mail } from "lucide-react";
import BuyMeACoffee from "@/components/BuyMeACoffee";
import { RiTailwindCssFill, RiNextjsFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose md:text-left">
            © 2024 Theodore Mentis
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 hover:bg-gray-200"
            asChild
          >
            <a
              href="https://github.com/jepeteo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 hover:bg-gray-200"
            asChild
          >
            <a
              href="https://www.linkedin.com/in/thmentis/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 hover:bg-gray-200"
            asChild
          >
            <a
              href="mailto:th.mentis@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Mail className="h-4 w-4" />
            </a>
          </Button>
        </div>
        <div className="flex space-x-2">
          <BuyMeACoffee />
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <span className="hidden lg:inline-flex">Made with Next.js</span>
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 hover:bg-gray-200"
            asChild
          >
            <a
              href="https://nextjs.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiNextjsFill className="h-4 w-4" />
            </a>
          </Button>
          <span className="hidden lg:inline-flex">& Tailwind CSS</span>
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 hover:bg-gray-200"
            asChild
          >
            <a
              href="https://tailwindcss.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiTailwindCssFill className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
