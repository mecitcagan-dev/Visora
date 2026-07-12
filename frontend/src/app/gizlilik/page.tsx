import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal-document";
import { absoluteUrl } from "@/lib/site";

const title = "Gizlilik";
const description =
  "Visora aydınlatma metni: hangi verilerin işlendiği, üçüncü taraf servisler, saklama süresi ve oturum galerisi hakkında bilgilendirme.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl("/gizlilik"),
  },
  openGraph: {
    title: `${title} | Visora`,
    description,
    url: absoluteUrl("/gizlilik"),
    type: "website",
    locale: "tr_TR",
    siteName: "Visora",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Visora`,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GizlilikPage() {
  return (
    <LegalDocument
      title="Gizlilik ve Aydınlatma Metni"
      lead="Visora hesap açmadan, ücretsiz görsel üretmenize yardımcı olur. Bu metin, üretim sırasında hangi bilgilerin işlendiğini ve nerede tutulduğunu sade dilde açıklar."
    >
      <LegalSection title="Veri sorumlusu">
        <p>
          Bu site üzerinden sunulan Visora hizmetinin işletmecisi, aşağıda
          anlatılan işlemler bakımından veri sorumlusudur. Hesap veya üyelik
          sistemi yoktur; kimlik doğrulama yapılmaz.
        </p>
      </LegalSection>

      <LegalSection title="Hangi veriler işlenir?">
        <p>Üretim isteğinde şu bilgiler kullanılabilir:</p>
        <ul>
          <li>
            <strong>Görsel açıklaması</strong> — formda yazdığınız konu / sahne
            metni
          </li>
          <li>
            <strong>İsteğe bağlı blog metni</strong> — kapak ve bölüm görselleri
            için yapıştırdığınız yazı
          </li>
          <li>
            <strong>İsteğe bağlı Groq API anahtarınız</strong> — yalnızca kendi
            tercihinizle girdiğinizde; tarayıcınızda saklanır
          </li>
          <li>
            <strong>Üretim tercihleri</strong> — stil, oran, varyasyon,
            watermark gibi form seçimleri
          </li>
        </ul>
        <p>
          Ayrıca, ücretsiz kota koruması için istekler{" "}
          <strong>IP adresi üzerinden</strong> hız sınırına (rate limit) tabi
          tutulabilir. Kullanım analitiği için Google Analytics yalnızca sizin
          çerez onayınızdan sonra çalışır (aşağıdaki “Çerezler ve Analitik”
          bölümüne bakın).
        </p>
      </LegalSection>

      <LegalSection title="İşleme amacı">
        <p>Bu veriler yalnızca şu amaçlarla işlenir:</p>
        <ul>
          <li>Açıklamanıza (ve varsa blog metnine) uygun görsel üretmek</li>
          <li>
            Prompt’u zenginleştirmek (isteğe bağlı Groq; yoksa Pollinations metin
            / şablon yolu)
          </li>
          <li>Hizmetin kötüye kullanımını sınırlamak (IP bazlı rate limit)</li>
          <li>
            Onay verirseniz site kullanımını anlamak (Google Analytics —
            sayfa görüntüleme ve genel istatistik)
          </li>
        </ul>
        <p>Reklam profilleme veya hesap oluşturma amacıyla veri toplanmaz.</p>
      </LegalSection>

      <LegalSection title="Üçüncü taraf servisler">
        <p>
          Üretim isteği backend üzerinden şu servislere iletilebilir:
        </p>
        <ul>
          <li>
            <strong>Groq</strong> — kendi API anahtarınızı girdiyseniz, prompt
            zenginleştirme için (anahtar istek başına header ile gönderilir)
          </li>
          <li>
            <strong>Pollinations.ai</strong> — metin zenginleştirme (yedek yol)
            ve görsel üretimi için
          </li>
        </ul>
        <p>
          Bu servislerin kendi gizlilik politikaları geçerlidir. Visora, onların
          sunucularında ne kadar süre veri tuttuklarını kontrol etmez.
        </p>
      </LegalSection>

      <LegalSection title="Çerezler ve Analitik">
        <p>
          Visora, site kullanımını anlamak için{" "}
          <strong>Google Analytics</strong> kullanabilir. Bu araç sayfa
          görüntüleme ve genel kullanım istatistikleri toplar. Google, IP
          adresi, cihaz ve tarayıcı bilgisi gibi teknik verileri de
          işleyebilir; “kişisel veri toplanmaz” demiyoruz.
        </p>
        <p>
          <strong>Amaç:</strong> hangi sayfaların ziyaret edildiğini ve genel
          kullanım eğilimlerini görmek. Reklam hedefleme için kullanmıyoruz.
        </p>
        <p>
          <strong>Saklama:</strong> Analitik verilerin ne kadar süre
          tutulacağı Google’ın kendi politikasına tabidir. Visora, Google
          Analytics varsayılan saklama ayarını bu metinde ayrı bir süre olarak
          özelleştirmiş sayılmaz.
        </p>
        <p>
          <strong>Rızanız:</strong> Analytics yalnızca çerez banner’ında{" "}
          <strong>Kabul Et</strong> seçerseniz yüklenir.{" "}
          <strong>Reddet</strong> derseniz Google Analytics script’i
          yüklenmez. Tercihiniz tarayıcınızda saklanır; değiştirmek için
          sayfa altındaki <strong>Çerez Tercihleri</strong> linkini kullanın.
        </p>
        <p>
          Google’ın gizlilik politikası:{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            policies.google.com/privacy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Saklama süresi">
        <ul>
          <li>
            <strong>Üretilen görseller sunucuda kalıcı saklanmaz.</strong>{" "}
            Görseller yanıtla tarayıcınıza döner; isterseniz cihazınıza
            indirirsiniz. İstek bittikten sonra sunucu belleğinde tutulmaz.
          </li>
          <li>
            <strong>Sergi / Galeri yalnızca oturum bazlıdır.</strong> Görseller
            tarayıcınızda (React Context + sessionStorage) tutulur. Sekmeyi
            kapattığınızda veya bilinçli temizlikte silinir. Sunucuda galeri
            yoktur.
          </li>
          <li>
            <strong>Groq API anahtarı</strong> yalnızca tarayıcınızın
            localStorage alanında saklanır; sunucuya kalıcı olarak yazılmaz.
            Üretim sırasında istek başına backend’e iletilir, sunucu anahtarı
            saklamaz.
          </li>
          <li>
            <strong>Çerez / analitik tercihi</strong> tarayıcı localStorage’da
            tutulur (sunucu depolaması değildir).
          </li>
          <li>
            IP rate limit kayıtları, koruma amacıyla kısa süreli ve teknik
            niteliktedir; kullanıcı hesabı veya kalıcı profil oluşturmaz.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Haklarınız">
        <p>
          Hesap olmadığı için “profil silme” gibi üyelik işlemleri yoktur.
          Tarayıcı verilerinizi (oturum galerisi, kayıtlı Groq anahtarı, çerez
          tercihi) kendiniz temizleyebilirsiniz: sekme kapatma / site
          verilerini silme, Üretim sayfasındaki anahtar “Sil” kontrolü veya
          footer’daki <strong>Çerez Tercihleri</strong>.
        </p>
        <p>
          KVKK kapsamındaki aydınlatma, erişim ve silme talepleriniz için site
          üzerinden veya yayıncı iletişim kanallarından bize ulaşabilirsiniz.
        </p>
      </LegalSection>

      <LegalSection title="Değişiklikler">
        <p>
          Hizmet veya veri işleme şekli değişirse bu metin güncellenir. Önemli
          değişikliklerde sayfa üzerindeki tarih / içerik esas alınır.
        </p>
        <p className="text-xs text-muted-foreground">
          Son güncelleme: 12 Temmuz 2026
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
