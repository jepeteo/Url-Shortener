"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Github, Heart, Linkedin } from "lucide-react";
import BuyMeACoffee from "@/components/BuyMeACoffee";
import { cn } from "@/lib/utils";

const MTX_STUDIO_URL = "https://www.mtxstudio.com";

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";

const creditLinkClass =
  "font-medium text-foreground/85 underline-offset-4 transition-colors hover:text-foreground hover:underline";

const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70";

const productLinks = [
  { href: "/app", label: "Shorten a URL" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard", auth: true },
];

const guestLinks = [
  { href: "/auth/signin", label: "Sign in" },
  { href: "/auth/register", label: "Create account" },
];

function FooterLinks({ title, links }) {
  if (links.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className={sectionTitleClass}>{title}</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialButton({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        linkClass,
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background transition-colors hover:border-border hover:bg-accent"
      )}
    >
      {children}
    </a>
  );
}

export function Footer() {
  const { status } = useSession();
  const year = new Date().getFullYear();
  const isAuthenticated = status === "authenticated";

  const visibleProductLinks = productLinks.filter(
    (link) => !link.auth || isAuthenticated
  );
  const visibleGuestLinks = isAuthenticated ? [] : guestLinks;

  return (
    <footer className="mt-auto border-t">
      <div className="container px-4 py-10 md:py-12">
        <div
          className={cn(
            "grid gap-10 md:grid-cols-2 lg:gap-12",
            visibleGuestLinks.length > 0
              ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)_minmax(0,0.75fr)]"
              : "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)]"
          )}
        >
          <div className="space-y-5">
            <div className="space-y-3">
              <Link
                href="/"
                className="text-xl font-bold tracking-tight hover:opacity-80"
              >
                mikrouli.link
              </Link>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Short links, click analytics, and QR codes — simple tools for creators
                and teams.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SocialButton href="https://github.com/jepeteo" label="GitHub">
                <Github className="h-4 w-4" />
              </SocialButton>
              <SocialButton
                href="https://www.linkedin.com/in/thmentis/"
                label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </SocialButton>
              <BuyMeACoffee />
            </div>
          </div>

          <FooterLinks title="Product" links={visibleProductLinks} />
          <FooterLinks title="Account" links={visibleGuestLinks} />
        </div>
      </div>

      <div className="border-t bg-muted/25">
        <div className="container flex flex-col items-start justify-between gap-3 px-4 py-4 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>© {year} mikrouli.link</p>
          <p className="flex flex-wrap items-center gap-1">
            Built with{" "}
            <Heart
              className="h-3.5 w-3.5 fill-red-500 text-red-500"
              aria-hidden="true"
            />{" "}
            by{" "}
            <a
              href="https://www.linkedin.com/in/thmentis/"
              target="_blank"
              rel="noopener noreferrer"
              className={creditLinkClass}
            >
              T. Mentis
            </a>{" "}
            and{" "}
            <a
              href={MTX_STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={creditLinkClass}
            >
              MTX Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
