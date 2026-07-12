"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { GalleryItem, GenerateResponse } from "@/lib/visora";

const STORAGE_KEY = "visora-session-gallery";

type GalleryContextValue = {
  gallery: GalleryItem[];
  addFromResponse: (payload: GenerateResponse) => void;
  clear: () => void;
};

const GalleryContext = createContext<GalleryContextValue | null>(null);

function loadInitial(): GalleryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GalleryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setGallery(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
    } catch {
      /* quota / private mode */
    }
  }, [gallery, hydrated]);

  const addFromResponse = useCallback((payload: GenerateResponse) => {
    const items: GalleryItem[] = payload.images.map((img) => ({
      ...img,
      id: `${img.filename}-${crypto.randomUUID()}`,
      source: payload.enrichment_source,
    }));
    setGallery((prev) => [...items, ...prev]);
  }, []);

  const clear = useCallback(() => setGallery([]), []);

  const value = useMemo(
    () => ({ gallery, addFromResponse, clear }),
    [gallery, addFromResponse, clear]
  );

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
}

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) {
    throw new Error("useGallery must be used within GalleryProvider");
  }
  return ctx;
}
