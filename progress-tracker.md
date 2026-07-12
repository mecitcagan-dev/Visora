# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Visora marka + landing + 3D galeri tamam; deploy kullanıcıda

## Current Goal

- Vercel + Render ücretsiz deploy (kullanıcı hesabı)

## Completed

- **SEO push + prod doğrulama** — Legal commit `6a55870` doğrulandı; `npm run build` hatasız; `main` push (`9aa6851..6a55870`, SEO 4 commit + Legal + ara commit’ler). Canlı: `/robots.txt` 200, `/sitemap.xml` 200 ve route’lar `/`, `/uretim`, `/gizlilik`, `/kullanim-kosullari`; `/`+`/uretim` title/OG/`index,follow` + ana sayfada JSON-LD var; `/sergi`+`/galeri` `noindex, follow`. **Açık:** Vercel’de `NEXT_PUBLIC_SITE_URL` set değil → canonical/OG/sitemap/robots Sitemap satırı `http://localhost:3000` (fallback); production origin için env eklenip redeploy gerekir. **Not (yanlış alarm):** önceki `git status`’ta `?? sitemap.ts` / `home-page-client.tsx` / `json-ld.tsx` görünmesi commit eksikliği değildi — dosyalar `f057cf7` içindeydi; anlık/stale status veya Legal WIP ile karışmış okuma. Asıl risk SiteFooter’ın untracked kalmasıydı; Legal commit ile çözüldü.
- **Erişilebilirlik turu (a11y)** — commit `87ef345`. axe-core + Playwright ile `/`, `/uretim`, `/sergi`, `/galeri` tarandı (production build); ihlal **0**. Token kontrastları WCAG AA geçiyor (`--text-muted`/`--bg-base` light 5.32:1, dark 7.43:1; diğer primary/muted/error/success çiftleri ≥4.5). Düzeltilenler: (1) `/sergi` drag-to-rotate için ok tuşu + Home klavye alternatifi, `role="region"` + `tabIndex` + görünür focus ring + aria-label (2) stil/oran kartları `radiogroup`/`radio` + focus-visible (3) logo link focus ring (4) `/` `<main>` landmark (5) `/uretim` çift banner kaldırıldı, tek `<main>`, Groq inline link her zaman underline (`link-in-text-block`) (6) form alanları zaten `Label htmlFor` — Collapsible gelişmiş alanlar OK. Polaroid overlap → axe `color-contrast` incomplete (yanlış pozitif; token hesapları AA). `lang=tr` + title’lar: `AI Blog Görselleri | Visora`, `Üretim|Sergi|Galeri | Visora`. SEO agent ile çakışma yok (logo `alt=""` + `sr-only` h1; polaroid anlamlı alt). Tarama: `frontend/scripts/a11y-scan.mjs`
- **SEO temel altyapı** — App Router Metadata API (title template `%s | Visora`, sayfa başına title/description/OG/Twitter/canonical via `NEXT_PUBLIC_SITE_URL`); `/`+`/uretim` index, `/sergi`+`/galeri` noindex+follow (oturum thin içerik); `robots.ts` + `sitemap.ts` (yalnızca indexlenebilir route'lar); marka OG/Twitter görseli (`opengraph-image.tsx`); ana sayfa JSON-LD (WebApplication+Organization+WebSite, fiyat 0, sahte rating yok); hero `sr-only` h1; `lang=tr`; GSC/Bing verification env placeholder; `.env.local.example` güncellendi
- Spec/planlama ve CLI/stretch/teslim (önceki turlar)
- Monorepo FastAPI + Next.js + Groq zinciri
- **Visora rebrand** (context + UI + API title + CLI prog)
- Landing/hero, premium spacing/shadow, `/gallery` CSS 3D carousel
- Tıkla-indir + GalleryProvider (sessionStorage)
- README + examples (≥5) + yaklaşım metni Visora/monorepo/Groq
- Hero/nav redesign — polaroid sanat eserleri (Wikimedia), sticky nav, tek CTA
- Ana sayfa tam ekran hero + `/uretim` route ayrımı
- Görsel cilalama: buton standardı, hero denge, kart caption fix, sayfa başlıkları, boş durum iyileştirme
- **UI 5 düzeltme:** (1) Hero polaroid çerçeve regressiyonu geri alındı — surface kart + mat padding + caption kart içinde, gölge/rotate, kırpılma yok (2) Sonuç paneli loading: Loader2 spinner + “Görsel üretiliyor…” (3) Nav altı simüle progress bar (üretime özel, asymptotic→%100→fade) (4) Enrichment + v1/v2/v3 Badge `soft` = accent-soft bg + primary text (5) Sergi 3D: n≤5 fan / n>5 full cylinder — dinamik step/radius, az görselde boşluk dengesi
- **Sergi 3D regresyon düzeltmesi** — kart boyutu/perspektif geri getirildi (`--w: 17.5em`, negatif `translateZ`, mask fade); önceki hatalı spacing (küçük açı → şişen radius → kameraya yapışan devasa düz kartlar) kaldırıldı; spacing yalnızca açı/radius ile, radius ref(n≈6) ile sınırlı
- **Sergi n=3 pinch fix** — fan adımı sabit 20° (n’e göre daraltma kaldırıldı); radius ≈ 0.9×ref; perspective 42em + daha geniş mask; kartlar kitap gibi kapanmadan net ayrı
- **/sergi carousel — n=1..10 ampirik lookup** — placeholder lab + rect/screenshot; fan: 2→32°/36em, 3→30°/34em, 4→22°/54em, 5→18°/58em; 6..10 (+n>10) klasik silindir chord; debug route silindi (`carousel-geometry.ts`)
- **Groq BYOK** — `/uretim`’de isteğe bağlı API key (localStorage); `X-Groq-Api-Key` ile enrichment; Render’da paylaşılan GROQ_API_KEY zorunlu değil
- **Blog section2 prompt fix** — `blog_ideas` H2 sırasıyla section_1/2; `concrete_scene_from_section` başlık+ilk cümleler; enrichment’ta aksiyon odaklı talimat + `focal_keywords` / template anchor; pytest (`tests/test_prompt_engine.py`, `test_blog_ideas.py`)
- **Galeri modal prompt** — lightbox’ta görsel altında scrollable “Kullanılan prompt” (`font-mono` + `bg-muted`, Üretim paneliyle aynı pattern) + Kopyala
- **Blog section prompt tutarlılığı** — ortak stil eki (`shared_style_suffix`: pastel mavi/bej/gri palet + ışık/stil iskeleti) her enrichment’a eklenir; zorunlu özne/eylem (`ensure_concrete_subject`, boş oda → insan figürü); H1 başlık/Sonuç atlanır, section_1/2 gerçek gövde H2’ye map; cover/section1 yapısı korunur; `image_generator`’a dokunulmadı (invariant #5)
- **Gizlilik / Kullanım Koşulları** — `/gizlilik` (KVKK aydınlatma: veri sorumlusu, işleme amacı, saklama=oturum/yok, Groq+Pollinations, oturum galerisi); `/kullanim-kosullari` (ücretsiz hizmet, çıktı sorumluluğu, Wikimedia polaroid dekoratif, cold-start/garanti yok); `SiteFooter` (© + yasal linkler, home `compact`); Groq BYOK yanına tarayıcı-saklama uyarısı; sitemap’e eklendi
- **Çerez/GA rıza mekanizması** — GA (`G-MZ5NVP1MYS`) yalnızca Kabul sonrası; Consent Mode v2 default denied→update granted; Reddet’te script yok; tercih `localStorage`; banner + footer “Çerez Tercihleri”; `/gizlilik` Çerezler ve Analitik bölümü

## In Progress

- None yet.

## Next Up

- Vercel env: `NEXT_PUBLIC_SITE_URL` production origin (SEO canonical/OG; ayrı iş)

### Security hardening (ADIM 1–4) — tamam

- **ADIM 1** (`cc649f1`): `frontend/next.config.ts` — CSP enforce + nosniff / Referrer-Policy / Permissions-Policy / X-Frame-Options DENY / HSTS / `poweredByHeader: false`. Report-Only → 0 ihlal → enforce.
- **ADIM 2** (`a72b3f4`): `backend/api.py` only — CORS whitelist (`*` yok), `SlowAPIMiddleware` + 8/min → 429, `max_length` (description 2000 / blog_text 50000 / watermark 120) → 400, `X-Groq-Api-Key` redact, generic 500 (stack yok), debug route yok (`/health` + `/api/generate`). `pytest` 11 passed. Generate smoke 200.
- **ADIM 3** (`206df77`): npm audit — High/Critical 0, moderate 2 (`postcss` via `next`, upgrade yok); pip-audit — temiz.
- **ADIM 4**: XSS tarama + `architecture.md` Security Headers / BYOK XSS + `'unsafe-inline'` trade-off notları; bu progress özeti.

### Security — ek kontroller

1. **`script-src 'unsafe-inline'` trade-off** — architecture.md’ye yazıldı (Next hydration + GA; nonce/strict-dynamic bu turda yok).
2. **Prod CSP `connect-src`** — `curl -I https://visora-studio.vercel.app/`: Render origin `https://visora-s9iq.onrender.com` CSP içinde **görünüyor** (doğrulandı).
3. **pytest** — max_length sonrası yeşil (11 passed).
4. **Rate limit vs ana akış** — generate smoke rate limit testinden **önce** çalıştırıldı; 429 testi `/health` ile yapıldı (eşik sonrası generate tekrarlanmadı).

### Security — ADIM 4 XSS tarama

- `dangerouslySetInnerHTML`: yalnızca [`frontend/src/components/json-ld.tsx`](frontend/src/components/json-ld.tsx) — sabit SEO JSON-LD; `serializeJsonLd` ile `<` → `\u003c` escape (kullanıcı/API serbest metin değil).
- Prompt / blog çıktıları: `studio-app` + `galeri-page-client` içinde `font-mono` `<pre>` / `<Textarea>` — React text children, HTML parse yok.

### Security — ADIM 3 bağımlılık taraması (upgrade YOK)

- **npm audit** (`frontend/`): High/Critical **0**. Moderate **2**: `postcss` XSS (GHSA-qx2v-qp2m-jg93) via `next` nested dependency; `npm audit fix --force` next@9 öneriyor (kırıcı — uygulanmadı).
- **pip-audit** (`backend/requirements.txt`): **No known vulnerabilities found**.

## Open Questions

- Rate limit 8/min, JSON+base64, health warm-up — çözüldü

## Architecture Decisions

- Marka: **Visora**
- Oturum galeri: React Context + sessionStorage
- `/sergi` saf CSS 3D; Three.js yok
- Tıkla-indir + hover ipucu (yalnızca `/galeri` + sonuç önizlemesi)
- Route'lar: `/` tam ekran hero · `/uretim` generator · `/sergi` · `/galeri` · `/gizlilik` · `/kullanim-kosullari`
- Shell footer: yasal linkler (nav’a eklenmez; footer’da)- SEO: `/sergi` ve `/galeri` noindex (oturum boş/thin); sitemap yalnızca `/` ve `/uretim`

## Session Notes

- Yerel: `dev.bat` veya uvicorn :8000 + `npm run dev` :3000
- Hot reload için frontend’i yeniden başlatmak gerekebilir (EADDRINUSE görüldüyse eski process hâlâ ayakta)

### CWV — Önce (baseline)

Lab: `next build` + `next start` (port 3055), Lighthouse mobile/`--preset=perf`, 2026-07-12.

| Sayfa | Performance | LCP | CLS | INP |
|-------|-------------|-----|-----|-----|
| `/` | 99 | 1.8 s | 0 | n/a (lab etkileşimsiz) |
| `/uretim` | 95 | 1.8 s | 0 | n/a (lab etkileşimsiz) |

Notlar: `/uretim` TBT 220 ms; `/` TBT 0 ms. INP lab’de ölçülmedi (interaction yok).

### CWV — Bundle analyze

- Tooling: `@next/bundle-analyzer` (dev) + `npm run analyze` (`ANALYZE=true`, webpack build; turbopack değil).
- Route First Load (webpack): `/` 131 kB · `/sergi` 131 kB · `/uretim` 152 kB · shared ~102 kB.
- **Sergi izolasyonu:** `SergiPageClient` / `aria-roledescription` yalnızca `.next/static/chunks/app/sergi/page-*.js`; `gallery-3d` CSS (`preserve-3d` / `.scene`) yalnızca `sergi.html` / `sergi.rsc` referanslı — home/uretim chunk’ına sızmamış.
- Anormal third-party yok (Three.js / framer-motion yok). En büyük pay: framework `react-dom` (~515 kB stat / ~168 kB parsed) — beklenen; kaldırma/upgrade önerisi yok.
