/** localStorage key for GA cookie preference (browser-only; not server storage). */
export const ANALYTICS_CONSENT_KEY = "visora-analytics-consent";

export const OPEN_COOKIE_PREFERENCES_EVENT = "visora:open-cookie-preferences";

export type AnalyticsConsent = "granted" | "denied";

/** Load analytics consent from localStorage. `null` = no choice yet. */
export function loadAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ANALYTICS_CONSENT_KEY)?.trim();
    if (raw === "granted" || raw === "denied") return raw;
    return null;
  } catch {
    return null;
  }
}

/** Persist analytics consent preference. */
export function saveAnalyticsConsent(value: AnalyticsConsent): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  } catch {
    /* private mode / quota */
  }
}

/** Ask the analytics provider to show the consent banner again. */
export function openCookiePreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT));
}
