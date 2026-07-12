"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  Images,
  LayoutGrid,
  ArrowRight,
  ImageIcon,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClickableImage } from "@/components/clickable-image";
import { useGallery } from "@/components/gallery-provider";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  apiBase,
  GenerateResponse,
  RATIOS,
  RatioId,
  STYLES,
  StyleId,
} from "@/lib/visora";

const STEPS = [
  {
    icon: Wand2,
    title: "Açıkla",
    text: "Konuyu, stili ve oranı seç.",
  },
  {
    icon: Sparkles,
    title: "Zenginleştir",
    text: "Visora prompt'u stil, ışık ve kompozisyonla genişletir.",
  },
  {
    icon: ImageIcon,
    title: "İndir",
    text: "Galeriden önizleyip bloguna ekle.",
  },
] as const;

export function StudioApp() {
  const { addFromResponse } = useGallery();
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<StyleId>("minimal");
  const [ratio, setRatio] = useState<RatioId>("square");
  const [variations, setVariations] = useState(1);
  const [watermark, setWatermark] = useState("");
  const [blogText, setBlogText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase()}/health`, { signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, []);

  async function onGenerate() {
    const hasBlog = blogText.trim().length > 0;
    if (!hasBlog && !description.trim()) {
      toast.error("Bir açıklama yazın veya blog metni ekleyin.");
      return;
    }

    setLoading(true);
    setStatus("Prompt zenginleştiriliyor ve görsel üretiliyor…");
    const coldTimer = window.setTimeout(() => {
      setStatus("Sunucu uyanıyor olabilir (ilk istek 30–60 sn sürebilir)…");
    }, 8000);

    try {
      const res = await fetch(`${apiBase()}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: hasBlog ? null : description.trim(),
          style,
          ratio,
          variations: hasBlog ? 1 : variations,
          watermark: watermark.trim() || null,
          blog_text: hasBlog ? blogText.trim() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail =
          typeof data?.detail === "string"
            ? data.detail
            : "Üretim başarısız oldu. Biraz sonra tekrar deneyin.";
        toast.error(
          res.status === 429
            ? "Çok fazla istek. Lütfen bir dakika bekleyin."
            : detail
        );
        return;
      }

      const payload = data as GenerateResponse;
      setResult(payload);
      addFromResponse(payload);
      toast.success(`${payload.images.length} görsel hazır`);
    } catch {
      toast.error(
        "Backend'e bağlanılamadı. API çalışıyor mu? (localhost:8000)"
      );
    } finally {
      window.clearTimeout(coldTimer);
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader generating={loading} />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Üretim
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Açıklamanı yaz, stil ve oranı seç; Visora senin için zenginleştirip
            üretsin.
          </p>
        </header>

        <ol className="mb-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-border bg-card p-4 shadow-[0_8px_28px_rgba(18,22,28,0.07)] sm:p-5"
            >
              <div className="mb-2 flex items-center gap-2 text-primary">
                <step.icon className="h-5 w-5" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Adım {index + 1}
                </span>
              </div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                {step.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>

        <main className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card className="rounded-2xl border shadow-[0_8px_28px_rgba(18,22,28,0.07)]">
            <CardHeader>
              <CardTitle className="text-lg">Üretim</CardTitle>
              <CardDescription>
                Stil ve oranı kartlardan seçin, ardından üretin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Örn. ahşap masada açık bir laptop"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-28 rounded-xl"
                  disabled={!!blogText.trim()}
                />
              </div>

              <div className="space-y-2">
                <Label>Stil</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        "cursor-pointer rounded-[14px] border p-3 text-left transition-all duration-200",
                        style === s.id
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border bg-card hover:bg-muted/60"
                      )}
                    >
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {s.blurb}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Oran</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {RATIOS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRatio(r.id)}
                      className={cn(
                        "cursor-pointer rounded-[14px] border p-3 text-left transition-all duration-200",
                        ratio === r.id
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border bg-card hover:bg-muted/60"
                      )}
                    >
                      <div className="text-sm font-medium">{r.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {r.blurb}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-auto min-h-8 w-full justify-start whitespace-normal px-2 py-2 text-left leading-snug text-primary"
                  )}
                >
                  {advancedOpen
                    ? "Gelişmiş seçenekleri gizle"
                    : "Gelişmiş seçenekler"}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="variations">Varyasyon (1–3)</Label>
                    <Input
                      id="variations"
                      type="number"
                      min={1}
                      max={3}
                      value={variations}
                      onChange={(e) =>
                        setVariations(
                          Math.min(3, Math.max(1, Number(e.target.value) || 1))
                        )
                      }
                      disabled={!!blogText.trim()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="watermark">Watermark</Label>
                    <Input
                      id="watermark"
                      placeholder="Visora"
                      value={watermark}
                      onChange={(e) => setWatermark(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog">Blog metni (1 kapak + 2 bölüm)</Label>
                    <Textarea
                      id="blog"
                      placeholder="Blog yazısını yapıştırın…"
                      value={blogText}
                      onChange={(e) => setBlogText(e.target.value)}
                      className="min-h-28 rounded-xl font-mono text-xs"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Button
                className="w-full rounded-xl"
                size="lg"
                onClick={onGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Üretiliyor…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Görsel üret
                  </>
                )}
              </Button>
              {status && (
                <p className="text-sm text-muted-foreground">{status}</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl border shadow-[0_8px_28px_rgba(18,22,28,0.07)]">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-lg">Sonuç</CardTitle>
                  <CardDescription>
                    Görsele tıklayarak cihazınıza indirin.
                  </CardDescription>
                </div>
                {result && (
                  <Badge variant="soft" className="capitalize">
                    {result.enrichment_source}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {loading && (
                  <div
                    className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-xl bg-muted/40 py-10"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2
                      className="h-8 w-8 animate-spin text-primary"
                      aria-hidden
                    />
                    <p className="text-sm text-muted-foreground">
                      Görsel üretiliyor…
                    </p>
                  </div>
                )}
                {!loading && !result && (
                  <p className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                    Henüz görsel yok. Soldan bir üretim başlatın.
                  </p>
                )}
                {!loading && result && (
                  <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 motion-reduce:animate-none">
                    {result.images.map((img) => (
                      <div key={img.filename + img.label} className="space-y-3">
                        <ClickableImage image={img} />
                        <Badge variant="soft">{img.label}</Badge>
                        <pre className="max-h-32 overflow-auto rounded-xl bg-muted p-3 font-mono text-xs whitespace-pre-wrap text-muted-foreground">
                          {img.prompt}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/sergi"
                className={cn(
                  "group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4",
                  "shadow-[0_8px_28px_rgba(18,22,28,0.07)] transition-all duration-200",
                  "hover:border-primary/40 hover:shadow-[0_12px_32px_rgba(18,22,28,0.10)] hover:scale-[1.01]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Images className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      Sergiye eriş
                    </p>
                    <p className="text-sm text-muted-foreground">
                      3D carousel sergisi
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
              <Link
                href="/galeri"
                className={cn(
                  "group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4",
                  "shadow-[0_8px_28px_rgba(18,22,28,0.07)] transition-all duration-200",
                  "hover:border-primary/40 hover:shadow-[0_12px_32px_rgba(18,22,28,0.10)] hover:scale-[1.01]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <LayoutGrid className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      Galeriye eriş
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Grid · önizle · indir
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
