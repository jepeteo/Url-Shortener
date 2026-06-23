"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Link2, LayoutDashboard, Menu, Shield, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Shorten", icon: Link2 },
  { href: "/pricing", label: "Pricing", icon: Tag },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, auth: true },
  { href: "/mtxadmin", label: "Admin", icon: Shield, admin: true },
];

function NavLink({ href, label, icon: Icon, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-4 py-2.5 text-sm font-medium transition-colors md:text-base",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
      {label}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) => {
    if (item.auth && status !== "authenticated") return false;
    if (item.admin && !session?.user?.isAdmin) return false;
    return true;
  });

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:h-[4.5rem]">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-90 md:text-2xl"
          onClick={closeMobile}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white shadow-sm shadow-primary/30 transition-transform group-hover:scale-105">
            <Link2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="gradient-text">mikrouli.link</span>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Main navigation">
          {visibleItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {status === "authenticated" ? (
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          className="border-t px-4 py-4 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                onClick={closeMobile}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t pt-3">
            {status === "authenticated" ? (
              <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/auth/signin" onClick={closeMobile}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register" onClick={closeMobile}>
                    Get started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
