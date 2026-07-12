"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingHero } from "@/components/landing-hero";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash === "#uretim") {
      router.replace("/uretim");
    }
  }, [router]);

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <LandingHero />
    </div>
  );
}
