# UI Context

## Theme

Visora, yaratıcı bir stüdyo hissi veren modern bir web ürünüdür: bol boşluk, kart tabanlı yüzeyler, net tipografi hiyerarşisi. Uygulama teknolojisi **Next.js + shadcn/ui + Tailwind**.

- Varsayılan: **açık** (light) editorial stüdyo — sıcak-nötr zemin, koyu mürekkep metin, teal vurgu
- Opsiyonel: **koyu** (dark) — aynı vurgu, daha derin yüzeyler; `next-themes` toggle
- Mor/indigo gradient, glow efektleri ve aşırı yuvarlak "pill" kümeleri kullanılmaz
- Marka adı **Visora** ilk viewport'ta hero-seviyesinde görünür; alt başlık tek cümlelik değer önerisi

## Colors

Tasarım token'ları shadcn CSS variables + Tailwind theme'e eşlenir. Bileşen içinde rastgele hex kullanılmaz.

| Role              | Design token         | Light value | Dark value | shadcn / Tailwind eşlemesi        |
| ----------------- | -------------------- | ----------- | ---------- | --------------------------------- |
| Page background   | `--bg-base`          | `#F3F5F7`   | `#0E1116`  | `--background`                    |
| Surface / card    | `--bg-surface`       | `#FFFFFF`   | `#171B22`  | `--card` / `--popover`            |
| Surface elevated  | `--bg-elevated`      | `#EEF2F5`   | `#1E2430`  | `--muted` / `--secondary`         |
| Primary text      | `--text-primary`     | `#12161C`   | `#F2F4F7`  | `--foreground` / `--card-foreground` |
| Muted text        | `--text-muted`       | `#5C6675`   | `#9AA3B2`  | `--muted-foreground`              |
| Primary accent    | `--accent-primary`   | `#0F766E`   | `#2DD4BF`  | `--primary`                       |
| Accent soft       | `--accent-soft`      | `#CCFBF1`   | `#134E4A`  | `--accent` / primary soft         |
| Border            | `--border-default`   | `#D5DCE3`   | `#2A3140`  | `--border` / `--input`            |
| Error             | `--state-error`      | `#C0353A`   | `#F87171`  | `--destructive`                   |
| Success           | `--state-success`    | `#1B7F4A`   | `#4ADE80`  | custom / badge variant            |
| Warning           | `--state-warning`    | `#B45309`   | `#FBBF24`  | custom / badge variant            |

## Typography

| Role            | Font                                      | Variable / usage              |
| --------------- | ----------------------------------------- | ----------------------------- |
| Display / brand | "Fraunces" (next/font)                    | Hero marka + ana başlık       |
| UI text         | "DM Sans" (next/font)                     | Form, buton, gövde            |
| Code/mono       | "IBM Plex Mono"                           | Prompt önizleme kutusu        |

Ölçek (premium hiyerarşi): Marka ~2.75–3.25rem; hero alt metin ~1.05–1.15rem muted; bölüm H2 ~1.35rem; kart başlığı ~1.05rem; gövde 0.95rem; yardımcı 0.8–0.85rem. Satır aralığı 1.45–1.6. Büyük başlık / küçük alt metin kontrastı net olmalı.

## Border Radius

| Context           | Token / değer | Tailwind / shadcn        |
| ----------------- | ------------- | ------------------------ |
| Inline / small UI | `8px`         | `rounded-md`             |
| Cards / panels    | `16px`        | `rounded-xl` / card      |
| Modals / overlays | `20px`        | Dialog content           |
| Stil seçici kart  | `14px`        | özel kart                |
| Thumbnail         | `12px`        | `rounded-lg`             |
| 3D carousel card  | `1.5em`       | carousel CSS             |

Gölge: tek katmanlı, düşük opacity — kartlar `0 8px 28px rgba(18,22,28,0.07)`, hover'da hafif yükselme (`0 12px 32px rgba(18,22,28,0.10)`). Primary butonlar dolu + gölge (`0 8px 28px rgba(18,22,28,0.12)`), hover scale 1.02 + gölge artışı. Hero arkasında çok düşük opacity primary radial soft-glow (accent token; yeni renk yok). Token dışı yeni renk icat edilmez.

## Component Library

shadcn/ui (Radix + Tailwind). CLI ile ekle; `components/ui/` altında tut.

| İhtiyaç              | shadcn / yaklaşım                                      |
| -------------------- | ------------------------------------------------------ |
| Kart / yüzey         | `Card`, `CardHeader`, `CardContent`                    |
| Birincil / ikincil CTA | `Button` (default / outline / ghost)                 |
| Metin girişi         | `Input`, `Textarea`                                    |
| Stil / oran seçici   | Özel kart grid + seçili border/accent                  |
| Gelişmiş             | `Collapsible`                                          |
| Loading              | Sonuç: `Loader2` + metin; nav altı simüle progress bar |
| Toast                | `Sonner`                                               |
| Rozet                | `Badge` `soft` (enrichment + v1/v2/v3 — accent-soft/primary) |
| Tema                 | `next-themes`                                          |
| İkonlar              | `lucide-react`                                         |

## Landing / Hero

Ana sayfa (`/`) **yalnızca tam ekran hero**dır (nav + hero = ~100dvh; scroll edilecek ekstra içerik yok).

- **Polaroid yay**: 5 kamu malı ünlü tablo (Wikimedia Commons), eğik kartlar (-8°…+8°), surface çerçeve + gölge + caption; dekoratif (tıklanınca indirme yok)
- **Marka**: Visora logosu (hero boyutu) ortada
- **Değer önerisi**: tek cümle (stil/ışık/kompozisyonla zenginleştirilmiş blog görselleri)
- **CTA**: yalnızca **"Üretmeye başla"** → `/uretim` (Sergi/Galeri linkleri nav'da)
- Form, sonuç ve "nasıl çalışır" adımları Ana Sayfa'da yoktur

## Layout Patterns

- **Shell**: Sticky üst nav — logo | Ana Sayfa / Üretim / Sergi / Galeri | "Üretmeye başla" CTA + tema toggle; mobilde hamburger; aktif route `usePathname` ile vurgulanır
- **Home (`/`)**: Tam ekran hero (polaroid + marka + tek CTA); alt içerik yok
- **Üretim (`/uretim`)**: 3 adımlı intro şeridi (Açıkla / Zenginleştir / İndir) → Generator (iki kolon: form | sonuç) + Sergi/Galeri erişim kartları
- **Form kartı**: Açıklama; stil/oran kartları; Collapsible gelişmiş (varyasyon, watermark varsayılan ipucu "Visora", blog metni)
- **Sonuç kartı**: Büyük önizleme (tıkla-indir); Badge enrichment; prompt özeti
- **Cold start**: Skeleton + "Sunucu uyanıyor…"
- **Motion**: Polaroid hover scale/shadow; sergi JS `rotateY`; `prefers-reduced-motion` ile yavaşlat / scale kapat
## Sergi (`/sergi`) — 3D

- Saf CSS 3D carousel + JS drag-to-rotate; Three.js yok
- Yalnızca oturumda üretilmiş görseller — placeholder/örnek dolgu yok; `n` = gerçek adet
- Kart boyutu sabit (`--w: 17.5em`); spacing `carousel-geometry.ts` lookup (n=2..10 ampirik) + n>10 silindir formülü
- `n < 6`: merkezlenmiş fan (lab’de tune); `n ≥ 6`: tam silindir (klasik chord radius)
- `n === 1`: transform yok, ortada düz gösterim (tan bölme hatası önlenir)
- Kart tıklaması indirme yapmaz; indirme yalnızca Galeri'de
- Maskeli kenar fade; reduced-motion → otomatik dönüş yavaşlar; sürükleme her zaman mümkün (`n > 1`)
- Boş oturum: empty state + ana sayfaya link

## Galeri (`/galeri`) — grid + indir

- Kare thumbnail grid (telefon galerisi); 3D/animasyon yok
- Tıkla → önizleme lightbox + **Kullanılan prompt** (scrollable mono kutu) + **İndir**
- Aynı oturum store (Context + sessionStorage)

## Click-to-download

- Sonuç önizlemesi ve **Galeri** lightbox'ında indirme
- Sergi sayfasında indirme yok
- Discoverability: hover + "İndir" butonu / "İndirmek için tıkla"

## Icons

`lucide-react` stroke. Aksiyon ~16px, kart ~20px. Emoji yağmuru yok.

## UX Rules (ürün)

- İlk ekran markalı landing; boş şablon kabul edilmez
- Üretim aşamaları ve cold start görünür
- Hata mesajları sade (toast)
- Sergi + Galeri oturum bazlı — kullanıcıya belirtilir
- İndirme tarayıcıda; sunucuda kayıtlı galeri vaadi yok
- Erişilebilirlik: kontrast, odak, anlamlı etiketler; tıklanabilirlerde `cursor: pointer`
