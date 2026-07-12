"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import {
  loadAnalyticsConsent,
  OPEN_COOKIE_PREFERENCES_EVENT,
  saveAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-consent";

export const GA_MEASUREMENT_ID = "G-MZ5NVP1MYS";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureGtagStub() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }
}

function applyConsentUpdate(granted: boolean) {
  ensureGtagStub();
  window.gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const stored = loadAnalyticsConsent();
    setConsent(stored);
    setBannerOpen(stored === null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onOpenPreferences() {
      setBannerOpen(true);
    }
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, onOpenPreferences);
    return () => {
      window.removeEventListener(
        OPEN_COOKIE_PREFERENCES_EVENT,
        onOpenPreferences
      );
    };
  }, []);

  const onAccept = useCallback(() => {
    saveAnalyticsConsent("granted");
    setConsent("granted");
    setBannerOpen(false);
    applyConsentUpdate(true);
  }, []);

  const onDeny = useCallback(() => {
    saveAnalyticsConsent("denied");
    setConsent("denied");
    setBannerOpen(false);
    applyConsentUpdate(false);
  }, []);

  const loadGa = hydrated && consent === "granted";

  return (
    <>
      {loadGa ? (
        <>
          <Script id="ga-consent-default" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
              gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
            `}
          </Script>
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
        </>
      ) : null}

      {children}

      {hydrated && bannerOpen ? (
        <CookieConsentBanner onAccept={onAccept} onDeny={onDeny} />
      ) : null}
    </>
  );
}
