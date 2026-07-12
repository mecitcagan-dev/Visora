# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Visora marka + landing + 3D galeri tamam; deploy kullanıcıda

## Current Goal

- Vercel + Render ücretsiz deploy (kullanıcı hesabı)

## Completed

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

## In Progress

- None yet.

## Next Up

- Vercel + Render ücretsiz deploy (kullanıcı)

## Open Questions

- Rate limit 8/min, JSON+base64, health warm-up — çözüldü

## Architecture Decisions

- Marka: **Visora**
- Oturum galeri: React Context + sessionStorage
- `/sergi` saf CSS 3D; Three.js yok
- Tıkla-indir + hover ipucu (yalnızca `/galeri` + sonuç önizlemesi)
- Route'lar: `/` tam ekran hero · `/uretim` generator · `/sergi` · `/galeri`

## Session Notes

- Yerel: `dev.bat` veya uvicorn :8000 + `npm run dev` :3000
- Hot reload için frontend’i yeniden başlatmak gerekebilir (EADDRINUSE görüldüyse eski process hâlâ ayakta)
