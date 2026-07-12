/**
 * Public site origin for canonical, sitemap, OG, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in deploy (e.g. https://visora-studio.vercel.app).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  // Local / CI fallback only — never hardcode production domain
  return "http://localhost:3000";
}

export function absoluteUrl(path: string = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
