"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, LayoutGrid, X } from "lucide-react";
import { toast } from "sonner";
import { useGallery } from "@/components/gallery-provider";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadImage, type GalleryItem } from "@/lib/visora";

export function GaleriPageClient() {
  const { gallery } = useGallery();
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const stillThere = gallery.some((item) => item.id === selected.id);
    if (!stillThere) setSelected(null);
  }, [gallery, selected]);

  useEffect(() => {
    setCopied(false);
  }, [selected?.id]);

  async function copyPrompt(prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("Prompt kopyalandı");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Kopyalanamadı");
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-6xl flex-col px-4 pb-16 pt-8 md:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Galeri
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Bu oturumda ürettiğiniz görseller. Bir kareye tıklayın, önizleyin ve
          indirin.
        </p>

        {gallery.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10">
            <div className="w-full max-w-md rounded-2xl border border-dashed border-border bg-card/60 px-8 py-12 text-center shadow-[0_8px_28px_rgba(18,22,28,0.07)]">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                <LayoutGrid className="h-6 w-6" />
              </span>
              <p className="text-foreground">Henüz görsel üretmediniz.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Üretim sayfasından bir görsel oluşturun; burada listelenecekler.
              </p>
              <Link
                href="/uretim"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-6 inline-flex rounded-xl"
                )}
              >
                Hemen Üret
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
            {gallery.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className={cn(
                    "group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-muted",
                    "transition-all duration-200",
                    "hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(18,22,28,0.10)] hover:scale-[1.02]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-label={`${item.label} — önizle`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${item.data}`}
                    alt={item.label}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Görsel önizleme"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-[min(92vh,52rem)] w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-[20px] border border-border bg-card p-4 shadow-[0_16px_48px_rgba(18,22,28,0.22)] md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{selected.label}</p>
                <p className="text-sm text-muted-foreground">
                  Önizleme · indirmek için butonu kullanın
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="cursor-pointer"
                aria-label="Kapat"
                onClick={() => setSelected(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${selected.data}`}
              alt={selected.label}
              className="max-h-[min(48vh,28rem)] w-full shrink-0 rounded-xl object-contain bg-muted"
              draggable={false}
            />

            {selected.prompt ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Kullanılan prompt
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 cursor-pointer gap-1.5 px-2 text-muted-foreground"
                    aria-label="Promptu kopyala"
                    onClick={() => copyPrompt(selected.prompt)}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Kopyalandı" : "Kopyala"}
                  </Button>
                </div>
                <pre className="max-h-32 overflow-y-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap text-muted-foreground">
                  {selected.prompt}
                </pre>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-xl"
                onClick={() => setSelected(null)}
              >
                Kapat
              </Button>
              <Button
                type="button"
                className="cursor-pointer rounded-xl"
                onClick={() => downloadImage(selected)}
              >
                <Download className="h-4 w-4" />
                İndir
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
