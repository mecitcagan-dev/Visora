# AI Workflow Rules

## Approach

Bu proje spec-driven ve incremental ilerler. Altı context dosyası neyin, nasıl ve hangi sırayla yapılacağını tanımlar. Implementasyon bu dosyalara göre yapılır; context'te olmayan davranış uydurulmaz.

**2. ürünleşme pivotu:** Streamlit planı **terk edildi** (Streamlit kodu yazılmadığı için kayıp yok). Güncel hedef: **Next.js + shadcn/ui (Vercel) + FastAPI (Render)**. Mevcut çalışan Python mantığı (`src/` → konum olarak `backend/src/` **taşınacak**, içerik/sorumluluk aynı) **sıfırdan yazılmaz**; FastAPI ince bir sarmalayıcıdır. CLI korunur. Önceki invariant'lar (katman ayrımı, şeffaflık, boş girdi, hata yönetimi, Groq→Pollinations→template zinciri planı, kalite notları) geçerlidir; kalıcı web storage yoktur. Her adım sonunda ilgili yüzey (API, UI veya CLI) ile doğrulanabilir çıktı üretilmiş olmalıdır.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large
  speculative changes
- Do not combine unrelated system boundaries in a
  single implementation step

## When to Split Work

Split an implementation step if it combines:

- Prompt zenginleştirme mantığı ile görsel üretim API entegrasyonu
- Frontend component/tema değişiklikleri ile backend route veya Pydantic şema değişiklikleri
- Repo taşıma (`src/` → `backend/src/`) ile özellik geliştirme (önce taşı, sonra API)
- Rate limiting / CORS ile UI galeri veya stil kartı işleri
- CLI sözleşmesini kıran değişiklikler ile web API özellikleri
- Context dosyalarında net tanımlanmamış davranış (önce ilgili context dosyasını güncelle)

If a change cannot be verified end to end quickly,
the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the
  context files
- If a requirement is ambiguous, resolve it in the
  relevant context file before implementing
- If a requirement is missing, add it as an open question
  in `progress-tracker.md` before continuing

## Protected Files

Do not modify the following unless explicitly instructed:

- `output/` / CLI ile üretilmiş kullanıcı çıktıları (dikkatli yaz)
- `examples/` teslim örnekleri (gerekmedikçe silme)
- Üçüncü parti paket kaynakları (`node_modules`, `site-packages`)
- Context dosyalarının başlık ve bölüm iskeleti
- `backend/src` sorumluluk sınırları ve CLI public sözleşmesi — UI/API iş mantığını buraya şişirerek taşıma; CLI'yi kaldırarak "sadeleştirme"
- Kalıcı storage (R2/S3) ekleyerek mimariyi sessizce genişletme

## Keeping Docs in Sync

Update the relevant context file whenever implementation
changes:

- System architecture or boundaries
- Storage model decisions
- Code conventions or standards
- Feature scope
- UI tema / layout kararları (`ui-context.md`)

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. Backend adımıysa: ilgili endpoint veya CLI doğrulanır; frontend adımıysa UI akışı doğrulanır; taşıma sonrası CLI regresyon kırığı yoktur; `requirements.txt` / `package.json` kurulabilir durumda
