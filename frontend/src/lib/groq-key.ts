const STORAGE_KEY = "visora-groq-api-key";

/** Load Groq API key from localStorage (browser-only). Never log the value. */
export function loadGroqApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

/** Persist Groq API key; empty string clears storage. */
export function saveGroqApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = key.trim();
    if (!trimmed) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    }
  } catch {
    /* private mode / quota */
  }
}

export function clearGroqApiKey(): void {
  saveGroqApiKey("");
}
