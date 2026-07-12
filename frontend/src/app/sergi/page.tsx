import type { Metadata } from "next";
import { SergiPageClient } from "@/components/sergi-page-client";
import { absoluteUrl } from "@/lib/site";

const title = "Sergi";
const description =
  "Bu oturumda ürettiğin Visora görsellerini 3D sergide gez. Oturum bazlıdır; üretim yapılmadan boş görünür.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl("/sergi"),
  },
  openGraph: {
    title: `${title} | Visora`,
    description,
    url: absoluteUrl("/sergi"),
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

export default function SergiPage() {
  return <SergiPageClient />;
}
