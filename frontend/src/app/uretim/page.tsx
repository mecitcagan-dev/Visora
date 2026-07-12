import type { Metadata } from "next";
import { StudioApp } from "@/components/studio-app";
import { absoluteUrl } from "@/lib/site";

const title = "Üretim";
const description =
  "Konunu yaz, stil ve oranı seç; Visora promptu zenginleştirip blog görselini üretsin. Sonuçları tarayıcıda indir.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl("/uretim"),
  },
  openGraph: {
    title: `${title} | Visora`,
    description,
    url: absoluteUrl("/uretim"),
    type: "website",
    locale: "tr_TR",
    siteName: "Visora",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Visora`,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function UretimPage() {
  return <StudioApp />;
}
