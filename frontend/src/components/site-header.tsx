"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { BrandLogo } from "@/components/brand-logo";
import { GenerationProgressBar } from "@/components/generation-progress-bar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Üretim", href: "/uretim" },
  { label: "Sergi", href: "/sergi" },
  { label: "Galeri", href: "/galeri" },
] as const;

export function SiteHeader({
  className,
  generating = false,
}: {
  className?: string;
  /** When true, shows the simulated production progress strip under the nav. */
  generating?: boolean;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function onHomeClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMobileOpen(false);
    }
  }

  const linkClass = (active: boolean) =>
    cn(
      "cursor-pointer rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors duration-200",
      "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active ? "text-foreground" : "text-muted-foreground"
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 shrink-0 border-b border-border/70 bg-background/90 backdrop-blur-md",
        className
      )}
    >
      <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-8 md:py-4">
        <Link
          href="/"
          className="shrink-0 cursor-pointer rounded-md transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Visora ana sayfa"
          onClick={onHomeClick}
        >
          <BrandLogo variant="header" priority />
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          aria-label="Ana navigasyon"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(pathname === link.href)}
              onClick={link.href === "/" ? onHomeClick : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/uretim"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden rounded-xl sm:inline-flex"
            )}
          >
            Üretmeye başla
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
            aria-label="Tema değiştir"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer md:hidden"
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobil navigasyon">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  linkClass(pathname === link.href),
                  "w-full px-3 py-2.5 hover:bg-muted"
                )}
                onClick={
                  link.href === "/"
                    ? onHomeClick
                    : () => setMobileOpen(false)
                }
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/uretim"
              className={cn(
                buttonVariants({ size: "default" }),
                "mt-2 justify-center rounded-xl"
              )}
              onClick={() => setMobileOpen(false)}
            >
              Üretmeye başla
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      ) : null}

      <GenerationProgressBar active={generating} />
    </header>
  );
}
