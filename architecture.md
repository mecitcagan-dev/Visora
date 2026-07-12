# Architecture Context

## Stack

| Layer              | Technology                                         | Role                                                          |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------------- |
| Frontend           | Next.js (App Router) + TypeScript                  | Birincil web UI                                               |
| UI kit             | shadcn/ui + Tailwind CSS                           | Bileşenler; `ui-context.md` token → CSS variables             |
| Backend API        | FastAPI + uvicorn                                  | İnce HTTP katmanı; `backend/src` sarmalayıcı                  |
| Logic              | Python 3.11+ (`backend/src/`)                      | Prompt, görsel, blog, watermark, errors (mevcut kod)          |
| CLI                | argparse (`backend/src/cli.py`)                    | Üçüncü giriş noktası; yerel `output/` yazımı                  |
| HTTP client        | httpx                                              | Groq, Pollinations metin/görsel                               |
| Prompt enrichment  | Groq → Pollinations text → template                | 3 katmanlı zincir                                             |
| Image generation   | Pollinations.ai (FLUX + kalite parametreleri)      | `enhance`, `nologo`, model; response'a bytes/base64           |
| Image post-process | Pillow                                             | Watermark (bellekte / geçici buffer)                          |
| Web storage        | Yok (kalıcı)                                       | Görsel response'ta döner; indirme tarayıcıda                  |
| CLI storage        | Yerel `output/`                                    | Yalnızca CLI; web akışını etkilemez                           |
| Secrets            | BYOK: kullanıcı Groq key (localStorage → `X-Groq-Api-Key`); opsiyonel backend env CLI için | Render'a zorunlu `GROQ_API_KEY` yok |
| CORS               | FastAPI CORSMiddleware                             | Vercel / localhost origin                                     |
| Rate limiting      | slowapi (veya eşdeğeri), IP bazlı                  | Ücretsiz kota koruması (sonraki implementasyon)               |
| Deploy             | Frontend → Vercel Hobby; Backend → Render free     | Fiili deploy sonra; cold start trade-off kabul                |
| Dev DX             | `dev.sh` / `dev.bat` (iki process)                 | Yalnızca geliştirici; son kullanıcı launcher yok              |

## System Boundaries

- `frontend/` — Next.js App Router (Visora); iş mantığı yok
- Route'lar: `/` (tam ekran hero), `/uretim` (generator + adımlar + sonuç), `/sergi` (3D sergi), `/galeri` (grid + indir); eski `/gallery` → `/sergi` redirect
- SEO: `/` ve `/uretim` indexlenebilir; `/sergi` ve `/galeri` `noindex, follow` (oturum state — botta boş/thin içerik)
- `frontend` bileşenleri — shadcn + stil/oran kartları + GalleryProvider (oturum store)
- `backend/api.py` — FastAPI app: `POST /api/generate`, CORS, rate limit, Pydantic şemalar; ince orchestration
- `backend/src/` — Mevcut mantık katmanı (kök `src/` buraya **taşınacak**; içerik/sorumluluk aynı)
- `backend/src/cli.py` — Yerel CLI; korunur
- `backend/src/prompt_engine.py` — Enrichment zinciri; görsel indirmez
- `backend/src/image_generator.py` — Pollinations görsel; web yolunda bytes/base64 döndürme desteği (CLI hâlâ dosyaya yazabilir)
- `backend/src/blog_ideas.py` — Blog'dan fikirler
- `backend/src/watermark.py` — Pillow watermark
- `backend/src/errors.py` — Typed errors → HTTP status eşlemesi
- `backend/requirements.txt` — FastAPI, uvicorn, httpx, Pillow, slowapi, …
- `backend/output/` — Yalnızca CLI çıktıları (web kalıcı yazmaz)
- `examples/` — Teslim örnekleri (repo kökü)
- `dev.sh` / `dev.bat` — Geliştirici: frontend + backend birlikte
- `README.md` — Dev, env, deploy notları, Pollinations uyarısı

## API Contract

- `POST /api/generate`
  - Body: `description`, `style`, `ratio`, opsiyonel `variations`, `watermark`, `blog_text` (veya eşdeğeri)
  - Success: görsel(ler) base64 veya binary, `enriched_prompt`(lar), `enrichment_source`: `groq` | `pollinations` | `template`
  - Errors: uygun HTTP status + `errors.py` tiplerine karşılık mesaj (`ValidationError` → 400, enrichment/image → 502/503 vb.)

## Storage Model

- **Kalıcı web depolama yok**: DB yok; R2/S3 yok; Render diskinde kalıcı galeri yok. Görsel üretilir → response → frontend indirme.
- **Frontend galeri**: Oturum store (React Context; isteğe `sessionStorage` — `localStorage` yok). `/` ↔ `/gallery` navigasyonunda korunur; sekme kapanınca / bilinçli temizlikte gider. Kalıcı sunucu galeri yok.
- **CLI**: Yerel `backend/output/images/` + `prompts/` — web'den bağımsız.
- **Secrets / BYOK**: Üretim sayfasında isteğe bağlı Groq API key; tarayıcı `localStorage`'da saklanır, istekte `X-Groq-Api-Key` ile backend'e iletilir (loglanmaz). Render'da paylaşılan `GROQ_API_KEY` zorunlu değil. CLI için opsiyonel env key kalır.
- **Geçici bellek**: Üretim sırasında bytes backend belleğinde; istek bitince tutulmaz.

## Auth and Access Model

- Kullanıcı auth yok; API herkese açık (public URL)
- CORS: yalnızca bilinen frontend origin'ler (Vercel prod + localhost)
- IP bazlı rate limit (ör. slowapi) — ücretsiz Pollinations/Groq kotasını korur
- Groq key yalnızca sunucuda; tarayıcıda görünmez / gönderilmez
- Pollinations anonim

## Deploy Notes

- **Vercel (frontend Hobby)**: `NEXT_PUBLIC_API_URL` → Render backend URL; `NEXT_PUBLIC_SITE_URL` → kanonik site origin (trailing slash yok, örn. `https://visora-studio.vercel.app`)
- **Search Console / Bing**: doğrulama meta için `NEXT_PUBLIC_GSC_VERIFICATION` / `NEXT_PUBLIC_BING_VERIFICATION` (değerleri sen ekle; boş bırakılabilir)
- **Render (backend free Web Service)**: 15 dk hareketsizlikten sonra uyku; ilk istek ~30–60 sn gecikebilir — kabul edilen trade-off; frontend cold-start UI gösterir
- Fiili deploy bu turda yok; mimari env + CORS ile hazır

## Invariants

1. Görsel veya metin API çağrısı başarısız olursa uygulama çökmez; CLI stderr/exit, web toast + HTTP hata gövdesi
2. Boş/whitespace açıklama ile üretim başlatılmaz
3. Görsel üretilmeden önce prompt zenginleştirme tamamlanır; ham metin doğrudan görsel API'ye gitmez (kullanıcı düzenlemiş prompt onayladıysa enriched sayılır)
4. CLI yolunda her başarılı PNG için eşleşen prompt `.txt` yazılır; web yolunda prompt response'ta döner (şeffaflık)
5. `prompt_engine` görsel indirmez; `image_generator` prompt üretmez
6. CLI çıktıları yalnızca `output/` altına yazılır; web yolu kalıcı dosya yazmaz
7. FastAPI (`api.py`) ve Next.js UI iş mantığını içermez; mantık `backend/src/`'de kalır
8. API anahtarları repoya yazılmaz. Üretimde Groq **BYOK**: kullanıcı kendi key'ini tarayıcıda tutar ve istek başına gönderir; sunucu key'i saklamaz. CLI için opsiyonel `GROQ_API_KEY` env kalır.
9. CLI ve `backend/src` public sözleşmeleri bozulmadan kalır
10. Prompt zinciri: Groq (key varsa) → Pollinations text → template
11. `backend/src` katman ayrımı bozulmaz; FastAPI yalnızca sarar
12. Kalıcı obje depolama (R2/S3 vb.) eklenmez — response/indirme modeli korunur

## Technical Notes — Image Quality

- Bilinen zayıflık: çoklu insan figürlü foto-gerçekçi sahnelerde artefakt. Azaltma:
  - `prompt_engine`: anti-deformasyon, daha az kişi, net odak, kalite olumlu/negatif ipuçları
  - `image_generator`: `enhance=true`, `nologo=true`, tutarlı `model=flux`, yeterli çözünürlük
