import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal-document";
import { absoluteUrl } from "@/lib/site";

const title = "Kullanım Koşulları";
const description =
  "Visora kullanım koşulları: ücretsiz hizmet, üretilen görsellerin sorumluluğu, telif ve hizmet garantisi hakkında bilgilendirme.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl("/kullanim-kosullari"),
  },
  openGraph: {
    title: `${title} | Visora`,
    description,
    url: absoluteUrl("/kullanim-kosullari"),
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

export default function KullanimKosullariPage() {
  return (
    <LegalDocument
      title="Kullanım Koşulları"
      lead="Visora’yı kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Metin, ücretsiz bir stüdyo aracı için sade tutulmuştur."
    >
      <LegalSection title="Hizmetin kapsamı">
        <p>
          Visora, blog ve içerik üretimi için açıklamanızdan (ve isteğe bağlı
          blog metninden) görsel üretmenize yardımcı olan{" "}
          <strong>ücretsiz</strong> bir web aracıdır. Hesap, abonelik veya ödeme
          zorunluluğu yoktur.
        </p>
        <p>
          Üretim isteği backend üzerinden Groq (kendi API anahtarınız varsa) ve
          Pollinations.ai servislerine iletilir. Sonuç görselleri response ile
          tarayıcınıza döner; sunucuda kalıcı galeri tutulmaz.
        </p>
      </LegalSection>

      <LegalSection title="Sizin sorumluluğunuz">
        <p>
          Formda yazdığınız açıklama, blog metni ve üretim tercihleri size
          aittir. Üretilen görselleri yasalara, üçüncü kişilerin haklarına ve
          platform kurallarına uygun kullanmak{" "}
          <strong>sizin sorumluluğunuzdadır</strong>.
        </p>
        <p>
          Yasaya aykırı, zararlı, yanıltıcı veya başkalarının haklarını ihlal
          eden içerik üretmek için Visora’yı kullanmayın.
        </p>
      </LegalSection>

      <LegalSection title="Telif ve içerik">
        <ul>
          <li>
            Görseller, sizin sağladığınız açıklama / blog metnine dayanarak
            otomatik üretilir. Çıktının telifi, kullanım hakkı ve ticari
            uygunluğu konusunda Visora garanti vermez; ilgili üçüncü taraf model
            / servis şartları da geçerli olabilir.
          </li>
          <li>
            Ana sayfadaki polaroid görseller{" "}
            <strong>yalnızca dekoratiftir</strong> (Wikimedia Commons kamu malı
            sanat eserleri). Bunlar indirme ürünü değildir; üretilen çıktı
            değildir.
          </li>
          <li>
            “Visora” markası ve arayüz tasarımı siteye aittir; izinsiz kopyalama
            veya markayı yanıltıcı şekilde kullanma kabul edilmez.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Garanti yokluğu">
        <p>
          Hizmet <strong>“olduğu gibi”</strong> sunulur. Kesintisiz, hatasız
          veya belirli bir kalitede görsel üretileceği taahhüt edilmez.
        </p>
        <ul>
          <li>
            Backend ücretsiz barındırma (ör. Render free-tier) kullanıldığında
            uyku / <strong>cold start</strong> nedeniyle ilk istekler gecikebilir
            veya zaman aşımına uğrayabilir.
          </li>
          <li>
            <strong>Pollinations.ai</strong> ve <strong>Groq</strong>{" "}
            kullanılabilirliği, kota ve çıktı kalitesi Visora’nın kontrolü
            dışındadır.
          </li>
          <li>
            Oturum galerisi yalnızca tarayıcınızda tutulur; veri kaybı (sekme
            kapatma, önbellek temizliği) riski kullanıcıya aittir — önemli
            görselleri indirerek saklayın.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Kullanım sınırları">
        <p>
          Hizmeti aşırı yükleyecek, otomatik kötüye kullanım veya güvenlik
          ihlali oluşturacak şekilde kullanmayın. IP bazlı rate limit uygulanabilir;
          limit aşımında istekler reddedilebilir.
        </p>
      </LegalSection>

      <LegalSection title="Değişiklikler">
        <p>
          Visora bu koşulları güncelleyebilir. Güncel metin bu sayfada yayınlanır.
          Hizmeti kullanmaya devam etmeniz güncel koşulları kabul ettiğiniz
          anlamına gelir.
        </p>
        <p className="text-xs text-muted-foreground">
          Son güncelleme: 12 Temmuz 2026
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
