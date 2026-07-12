import Link from "next/link";
import { cn } from "@/lib/utils";

const LEGAL_LINKS = [
  { label: "Gizlilik", href: "/gizlilik" },
  { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
] as const;

export function SiteFooter({
  className,
  compact = false,
}: {
  className?: string;
  /** Home hero: thinner bar, no extra scroll. */
  compact?: boolean;
}) {
  return (
    <footer
      className={cn(
        "shrink-0 border-t border-border/70 bg-background",
        compact ? "py-2.5" : "py-5",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 md:px-8",
          compact ? "text-xs" : "text-sm"
        )}
      >
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} Visora
        </p>
        <nav
          className="flex flex-wrap items-center gap-x-4 gap-y-1"
          aria-label="Yasal"
        >
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
