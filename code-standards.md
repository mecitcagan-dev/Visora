# Code Standards

## General

- Modüller tek sorumluluklu: prompt, görsel API, CLI, FastAPI, frontend UI, watermark karışmasın
- Kök nedeni düzelt; hataları sessizce yutma — HTTP/toast veya CLI mesajı ver
- FastAPI ve Next.js ince kalsın; enrichment/HTTP Pollinations çağrıları `backend/src/`'de
- `backend/src` public API'sini kırarak "kolay UI" yapma; gerekirse geriye uyumlu parametre ekle
- Aşırı soyutlama yapma

## Python

- Tip ipuçları tüm public fonksiyonlarda; `from __future__ import annotations` kullanılabilir
- `Any` kaçın; dar dataclass / TypedDict / Pydantic
- Harici girdi (CLI, API body, Pollinations yanıtı) sınırda doğrulanır
- Exception: `ValidationError`, `PromptEnrichmentError`, `ImageGenerationError` → API katmanında HTTP'ye map

## FastAPI (`backend/api.py`)

- Route'lar ince: Pydantic parse → `src/` çağrısı → response modeli; iş mantığı route içinde yazılmaz
- Request/response için Pydantic modelleri (`GenerateRequest`, `GenerateResponse`, hata gövdesi)
- CORS config tek yerde (env'den allowed origins listesi)
- Rate limit (slowapi) middleware/decorator ile; eşik Open Question'da netleşir
- `GROQ_API_KEY` yalnızca `os.environ` / backend `.env`; response'a veya log'a yazma
- Web üretiminde kalıcı disk yazma yok; bytes/base64 döndür; CLI kendi disk yolunu kullanır
- Exception handler: typed errors → 400/502/503 + sade mesaj; traceback client'a sızmasın

## CLI (argparse)

- Üçüncü giriş noktası: `python -m src.cli` (`backend/` içinden); kaldırılmaz
- Argümanlar: açıklama, `--style`, `--ratio`, `--variations`, `--from-blog`, `--watermark`
- Exit code: `0` başarı, `2` doğrulama, `1` API/ağ
- CLI yerel `output/` yazar; web sözleşmesini bozmaz

## TypeScript / Next.js (`frontend/`)

- Strict TypeScript; `any` kaçın
- App Router; client etkileşimi gereken yerlerde `"use client"` bilinçli kullan
- Bileşenler küçük ve tek amaçlı; shadcn `components/ui/`, özellik bileşenleri `components/`
- Backend URL: `process.env.NEXT_PUBLIC_API_URL` — hardcode etme
- Fetch hatalarını toast ile göster; rate limit / cold start için ayrı UX metni
- Galeri yalnızca client state (ör. `useState`); localStorage kalıcılığı varsayılan değil (bilinçli sade)
- Görselleri `download` attribute / blob URL ile indir; secret'ları client'a koyma

## Styling

- `ui-context.md` token'ları → shadcn CSS variables + Tailwind
- Bileşende rastgele hex yok; `bg-background`, `text-primary`, `border-border` vb.
- Tema: light default + dark class strategy

## API Entegrasyonu (backend logic)

- HTTP: `httpx`; timeout (metin/Groq ~60s, görsel ~120s); max 2 retry
- Prompt zinciri: Groq → Pollinations text → template
- Görsel: `enhance=true`, `nologo=true`, encode, model=flux
- Key commit etme; `.env*` gitignore

## Data and Storage

- Web: kalıcı storage yok; response + tarayıcı indirme
- CLI: `output/images`, `output/prompts`; güvenli slug
- R2/S3 ekleme

## Testing

- Backend: `pytest` ile en az `prompt_engine` (boş girdi ValidationError, template fallback şekli) ve mümkünse `image_generator` yardımcıları (slug, response mapping) için birkaç unit test; canlı Pollinations çağrıları CI'da zorunlu değil (mock/skip)
- Frontend: opsiyonel (ör. kritik form doğrulama); zorunlu tutulmaz
- Regresyon: CLI smoke (`--help` / boş girdi exit 2) taşımadan sonra doğrulanır

## File Organization

- `backend/api.py` — FastAPI uygulaması
- `backend/requirements.txt` — backend bağımlılıkları
- `backend/src/` — taşınacak mevcut mantık (`cli`, `prompt_engine`, `image_generator`, `blog_ideas`, `watermark`, `errors`)
- `backend/output/` — yalnızca CLI çıktıları
- `frontend/` — Next.js App Router uygulaması
- `frontend/app/` — routes / layouts
- `frontend/components/ui/` — shadcn
- `frontend/components/` — özellik bileşenleri (form, gallery, result)
- `frontend/.env.local.example` — `NEXT_PUBLIC_API_URL=`
- `backend/.env.example` — `GROQ_API_KEY=`, `CORS_ORIGINS=`
- `dev.sh` / `dev.bat` — geliştirici: iki servisi birlikte başlat
- `examples/` — teslim örnekleri (kök)
- `README.md` — monorepo dev + deploy notları
- Kök `.gitignore`: `.env`, `.env.local`, `node_modules/`, `__pycache__/`, `.venv/`, `backend/output/**` (examples hariç politika), eski Streamlit kalıntıları (`.streamlit/secrets.toml`) temizlenir / ignore

## Dev Notes

- Son kullanıcı `start.bat`/`start.command` yok — ürün URL ziyareti
- Yerel DX: `dev.sh` / `dev.bat` ile frontend (next dev) + backend (uvicorn) birlikte
