"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CookieConsentBanner({
  onAccept,
  onDeny,
}: {
  onAccept: () => void;
  onDeny: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card shadow-[0_8px_28px_rgba(18,22,28,0.12)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="min-w-0 space-y-1">
          <p
            id="cookie-consent-title"
            className="text-sm font-medium text-foreground"
          >
            Çerez ve analitik
          </p>
          <p
            id="cookie-consent-desc"
            className="text-sm leading-relaxed text-muted-foreground"
          >
            Bu site kullanım analitiği için çerez kullanır. Detaylar için{" "}
            <Link
              href="/gizlilik"
              className="cursor-pointer text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              Gizlilik
            </Link>{" "}
            metnine bakın.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-xl"
            onClick={onDeny}
          >
            Reddet
          </Button>
          <Button
            type="button"
            className="cursor-pointer rounded-xl"
            onClick={onAccept}
          >
            Kabul Et
          </Button>
        </div>
      </div>
    </div>
  );
}
