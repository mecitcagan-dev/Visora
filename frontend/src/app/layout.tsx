import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GalleryProvider } from "@/components/gallery-provider";
import { absoluteUrl, getSiteUrl } from "@/lib/site";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-MZ5NVP1MYS";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

const defaultTitle = "AI Blog Görselleri";
const defaultDescription =
  "Basit bir açıklamadan stil, ışık ve kompozisyonla zenginleştirilmiş blog görselleri üretin. Ücretsiz, tarayıcıda indirin.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    // Root page shares this segment — template does not apply here; default includes brand
    default: "AI Blog Görselleri | Visora",
    template: "%s | Visora",
  },
  description: defaultDescription,
  applicationName: "Visora",
  appleWebApp: {
    title: "Visora",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: absoluteUrl("/"),
    siteName: "Visora",
    title: `${defaultTitle} | Visora`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${defaultTitle} | Visora`,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${fraunces.variable} ${ibmPlexMono.variable} min-h-screen antialiased`}
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <GalleryProvider>
            {children}
            <Toaster richColors position="top-center" />
          </GalleryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
