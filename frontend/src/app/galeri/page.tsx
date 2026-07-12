import type { Metadata } from "next";
import { GaleriPageClient } from "@/components/galeri-page-client";
import { absoluteUrl } from "@/lib/site";

const title = "Galeri";
const description =
  "Bu oturumda ürettiğin Visora görsellerini grid olarak görüntüle ve indir. Oturum bazlıdır; üretim yapılmadan boş görünür.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl("/galeri"),
  },
  openGraph: {
    title: `${title} | Visora`,
    description,
    url: absoluteUrl("/galeri"),
    type: "website",
    locale: "tr_TR",
    siteName: "Visora",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Visora`,
    description,
  },
  // Session-only empty-for-bots content — do not index (thin/empty SEO risk)
  robots: {
    index: false,
    follow: true,
  },
};

export default function GaleriPage() {
  return <GaleriPageClient />;
}
