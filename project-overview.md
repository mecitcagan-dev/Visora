# Visora — AI ile Blog Görsel Üretimi

## Overview

Visora, blog yazarları ve içerik üreticileri için internete ücretsiz deploy edilebilen modern bir web ürünüdür. Kullanıcı Vercel üzerindeki Next.js (App Router) + shadcn/ui arayüzünde konu, stil ve en-boy oranını seçer; istek Render üzerindeki FastAPI backend'e gider. Backend, mevcut Python mantık katmanını (`backend/src/` — prompt zenginleştirme, görsel üretim, watermark, blog fikirleri) sıfırdan yazmadan saran ince bir API'dir; görseller sunucuda kalıcı saklanmaz, response ile tarayıcıya döner ve kullanıcı tıklayarak cihazına indirir. Opsiyonel Groq + Pollinations text + template zinciri prompt kalitesini yükseltir. Güçlü kullanıcılar için CLI (`backend/src/cli.py`) üçüncü giriş noktası olarak yerel `output/` yazmaya devam eder. Hesap/ödeme gerektiren SaaS değildir.

## Goals

1. Next.js + shadcn arayüzünde landing → form → API → önizleme → indirme akışını tarayıcıda tamamlamak
2. FastAPI'nin mevcut `backend/src/` modüllerini bozmadan sarması; CLI'nin yerel giriş noktası olarak kalması
3. Prompt kalitesini opsiyonel Groq ile yükseltmek; key yoksa Pollinations text + template ile çalışmaya devam etmek
4. Kalıcı obje depolama olmadan güvenilir indirme ve oturum 3D galeri deneyimi sunmak
5. Mimariyi Vercel (frontend) + Render (backend) ücretsiz tier'lara deploy edilebilir tutmak

## Core User Flow

1. Kullanıcı ürün URL'sini ziyaret eder; önce Visora landing/hero (değer önerisi, 3 adım, showcase) görür
2. Generator formunda açıklama yazar; stil ve oranı kartlarla seçer; isteğe bağlı varyasyon, watermark, blog metni
3. "Üret" ile doğrulama; boş girdide toast; API çağrısı
4. Backend Groq → Pollinations text → template + görsel üretimi; UI loading / cold-start mesajı
5. Sonuçta görsel önizlenir; görsele tıklayınca indirilir; enrichment rozeti + prompt gösterilir
6. Oturum store'unda galeri birikir; "Galeriye eriş" ile `/gallery` 3D carousel; tıklayınca indirme
7. CLI kullanıcıları `backend` içinde yerel komutla `output/` yazar

## Features

### Zorunlu (Must-Have)

- Next.js + shadcn/ui web UI: konu, stil kartları, oran kartları
- FastAPI `POST /api/generate` + mevcut Python mantık katmanı
- Prompt zinciri: Groq (opsiyonel, yalnızca backend env) → Pollinations text → template
- Görsel response akışı: önizleme + tıkla-indir; sunucu kalıcı storage yok
- Hata yönetimi: HTTP status + toast
- Oturum galerisi (Context / sessionStorage; localStorage yok)
- Varyasyon, watermark, blog-fikir UI kontrolleri
- CLI korunması

### Ürün İyileştirmeleri (In Scope)

- Landing/hero + "nasıl çalışır" + örnek showcase
- `/gallery` saf CSS 3D carousel
- Tıkla-indir (sonuç + galeri); hover discoverability
- Premium tipografi/gölge/spacing (`ui-context.md`)
- Cold-start UX, rate limiting, CORS, `dev.sh`/`dev.bat`
- Deploy hazırlığı (Vercel + Render)

### Korunan Backend Yetenekleri

- N varyasyon, blog'dan 1 kapak + 2 bölüm, Pillow watermark
- CLI yerel `output/` + prompt `.txt` şeffaflığı

## Scope

### In Scope

- Monorepo: `frontend/` + `backend/`
- Mevcut Python modüllerinin yeniden kullanımı
- CLI üçüncü giriş noktası
- Response tabanlı görsel teslimi + oturum-only frontend galeri (3D sayfa dahil)
- Groq opsiyonel (backend env only)
- Rate limit + CORS
- Vercel + Render ücretsiz deploy mimarisi

### Out of Scope

- Kullanıcı hesapları, kimlik doğrulama, yetkilendirme
- Ödeme / abonelik sistemi
- Kalıcı veritabanı
- Kalıcı obje depolama (R2, S3 vb.)
- Streamlit / tek tık son kullanıcı launcher
- Mobil native uygulama
- Gerçek zamanlı işbirliği / sosyal paylaşım
- Backend mantığını sıfırdan yeniden yazma veya CLI'yi kaldırma

## Success Criteria

1. Landing + generator ile görsel üretilir; tıklayınca indirilir
2. `/gallery` oturum görsellerini 3D carousel'de gösterir; tıkla-indir çalışır
3. `POST /api/generate` mevcut `backend/src` kullanır; Groq yokken fallback çalışır
4. Sunucuda kalıcı görsel yok; galeri yalnızca oturum frontend store'unda
5. CLI bozulmadan çalışır
6. README + `examples/` (≥5 görsel+prompt) + "Görsel prompt yaklaşımım" güncel (Visora + monorepo + Groq)
7. UI `ui-context.md` ile uyumlu; boş şablon görünümü kabul edilmez
