import type { Metadata } from "next";
import { HomePageClient } from "@/components/home-page-client";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/site";

const title = "AI Blog Görselleri";
const description =
  "Basit bir açıklamadan stil, ışık ve kompozisyonla zenginleştirilmiş blog görselleri üretin. Ücretsiz Visora stüdyosunda tarayıcıda indirin.";

export const metadata: Metadata = {
  // Root segment: title.template from layout does not apply — set absolute
  title: {
    absolute: `${title} | Visora`,
  },
  description,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: `${title} | Visora`,
    description,
    url: absoluteUrl("/"),
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Visora",
      url: absoluteUrl("/"),
      applicationCategory: "DesignApplication",
      operatingSystem: "Any",
      description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
      },
    },
    {
      "@type": "Organization",
      name: "Visora",
      url: absoluteUrl("/"),
    },
    {
      "@type": "WebSite",
      name: "Visora",
      url: absoluteUrl("/"),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <HomePageClient />
    </>
  );
}
