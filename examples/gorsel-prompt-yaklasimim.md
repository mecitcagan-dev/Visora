# Görsel prompt yaklaşımım

Visora’da asıl iş, modeli boş bırakmak değil; kullanıcının kısa cümlesini görsel üreticinin anlayacağı net bir sahneye çevirmek. Her prompt’u dört katmana ayırıyorum: **stil**, **ışık**, **kompozisyon** ve **renk**.

Stil görselin dilini seçer (minimal, fotoğraf gerçekçiliği, illüstrasyon). Işık okunabilirlik ve atmosfer verir; kompozisyon blog kapağında başlık boşluğu bırakır; renk paleti tutarlı bir marka hissi üretir. Kullanıcı yalnızca konuyu yazar; bu katmanlar sistem tarafından eklenir.

Sıra üç kademelidir. Varsa **Groq** (hızlı ücretsiz LLM) önce zenginleştirir — kalite artışı burada hissedilir. Groq yoksa veya başarısızsa **Pollinations text** denenir. O da yetmezse kural tabanlı **template fallback** stil kütüphanesindeki ışık/kompozisyon/renk cümlelerini ekler. Böylece ağ hatasında zincir çökmez ve ham kullanıcı metni görsel API’ye gitmez.

Varyasyonlarda enrichment yalnızca bir kez çalışır; fark, görsel çağrısındaki hafif çerçeve ipuçlarıyla (geniş plan / yakın kadraj / soğuk kontrast) üretilir. Blog metninden fikir çıkarmada 1 kapak + 2 bölüm sahnesi üretilir, her biri aynı zincirden geçer. Web’de prompt response’ta ve rozette (`groq` | `pollinations` | `template`) görünür; CLI’de eşleşen `.txt` dosyasına yazılır.
