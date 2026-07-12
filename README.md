# Visora — AI Blog Görsel Üretimi

Next.js (shadcn/ui) + FastAPI monorepo. Blog kapak ve bölüm görselleri üretir; sunucuda kalıcı depolama yok — tarayıcıda tıklayarak indirilir.

## Özellikler

- Web UI: landing, generator (stil/oran kartları), oturum galerisi, `/gallery` 3D carousel
- Prompt zinciri: Groq (opsiyonel) → Pollinations text → template
- Varyasyonlar, watermark, blog metninden 1 kapak + 2 bölüm
- CLI üçüncü giriş noktası (`backend/src/cli.py`)

## Yerel geliştirme

```bash
# Backend
cd backend
pip install -r requirements.txt
# İsteğe bağlı: .env içine GROQ_API_KEY=... ve CORS_ORIGINS=http://localhost:3000
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000

# Frontend (ayrı terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Veya: `dev.bat` (Windows) / `bash dev.sh` (macOS/Linux).

- Web: http://127.0.0.1:3000  
- Galeri: http://127.0.0.1:3000/gallery  
- API: http://127.0.0.1:8000/health  

## CLI

```bash
cd backend
python -m src.cli "açıklama" --style minimal --ratio square
python -m src.cli "..." --style illustration --ratio landscape --watermark "Visora"
```

Çıktılar: `backend/output/images/` ve `backend/output/prompts/`

## Örnekler

`examples/` altında en az 5 görsel + eşleşen prompt ve `gorsel-prompt-yaklasimim.md` bulunur.

## Deploy (sen yaparsın)

1. **Render** (`backend`): `uvicorn api:app --host 0.0.0.0 --port $PORT`  
   Env: `CORS_ORIGINS=https://<vercel>`, opsiyonel `GROQ_API_KEY`
2. **Vercel** (`frontend`): `NEXT_PUBLIC_API_URL=https://<render>`
3. Free Render cold start: ilk istek 30–60 sn; UI warm-up içerir

## Notlar

- Rate limit: 8 istek/dakika/IP
- Pollinations ücretsiz görsellerde AI işareti olabilir; ticari kullanımda şartlara bakın
- Galeri yalnızca tarayıcı oturumunda (Context + sessionStorage); kalıcı sunucu depolama yok
