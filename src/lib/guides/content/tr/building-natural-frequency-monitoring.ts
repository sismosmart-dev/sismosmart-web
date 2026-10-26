import type { GuideContent } from "@/lib/guides/types";

export const buildingNaturalFrequencyMonitoringTr: GuideContent = {
  translationKey: "building-natural-frequency-monitoring",
  locale: "tr",
  slug: "bina-dogal-frekansi-yapisal-izleme",
  title: "Bina Doğal Frekansı İzleme: Değişimlerin Anlamı",
  description:
    "Binalarda doğal frekansın ne anlama geldiğini, çevresel titreşim ve güçlü hareketin bu frekansları nasıl ortaya çıkardığını ve trend izlemenin ne zaman işe yaradığını öğrenin.",
  eyebrow: "Rehberler",
  h1: "Bina Doğal Frekansı İzleme: Değişimlerin Anlamı",
  summary:
    "Her binanın kütlesi, rijitliği ve geometrisi tarafından belirlenen birkaç doğal frekansı vardır; bina en çok bu frekanslarda titreşmeye yatkındır. Bu frekansları zaman içinde izlemek yapısal davranıştaki değişimleri gösterebilir. Ancak değişimin kaynağı hasar olabileceği gibi çevre koşulları, kullanım yükü, hareketin şiddeti veya analiz seçimleri de olabilir. Ölçülen frekanstaki bir kayma, bir şeyin değişmiş olabileceğini haber verir; yapısal durumun teşhisi değildir. Frekans verisini yorumlamak için mühendislik değerlendirmesi ve binaya dair bağlam bilgisi gerekir.",
  keyTakeaways: [
    "Dinamik özellikler, çevresel titreşim ya da güçlü hareket kayıtlarından çıkarılabilir.",
    "Frekans değişimi hasardan kaynaklanabilir. Çevre, kullanım yükü, hareketin şiddeti ve analiz yöntemi de aynı etkiyi yaratabilir.",
    "Frekanstaki değişim bir inceleme işaretidir, teşhis değildir; daha fazla araştırmanın gerekip gerekmediğini sorgulatır.",
  ],
  sections: [
    {
      heading: "Doğrudan cevap",
      paragraphs: [
        "Doğal frekans izleme, bir binanın hangi frekanslarda titreşmeye yatkın olduğunu ölçer. Mühendisler bu frekansları zaman içinde takip ederek yapının dinamik davranışındaki değişiklikleri fark edebilir. Değişimin arkasında yapısal bir değişiklik ya da hasar olabileceği gibi, çevre veya kullanım yükü koşullarındaki basit bir kayma da olabilir.",
      ],
    },
    {
      heading: "Doğal frekans ne anlama gelir",
      paragraphs: [
        "Bir binanın doğal frekansı, serbest bırakıldığında kendiliğinden salındığı hızdır. Kütle dağılımı, yapısal rijitlik ve geometri bu hızı belirler. Kısa ve rijit binaların doğal frekansları genellikle yüksek ve esnek binalarınkinden daha yüksektir. Bu frekanslar, gündelik koşullarda ya da deprem sırasında alınan titreşim ölçümlerinden çıkarılabilir.",
      ],
    },
    {
      heading: "Çevresel titreşim ve güçlü hareket",
      paragraphs: [
        "Çevresel titreşim izlemede rüzgâr, trafik ve mekanik ekipman gibi gündelik etkilerin binayı hafifçe sallaması kullanılır. Ortaya çıkan küçük genlikli titreşimler, deprem beklemeden doğal frekansları görünür kılabilir. Güçlü hareket izleme ise yapının deprem sırasındaki tepkisini kaydeder. Bu kayıt farklı titreşim modlarını harekete geçirebilir ve daha yüksek genliklerdeki davranış hakkında bilgi verebilir.",
      ],
    },
    {
      heading: "Frekans neden değişebilir",
      paragraphs: [
        "Ölçülen doğal frekans sabit bir sayı değildir. Sıcaklık malzemenin rijitliğini etkiler. Kullanım yükü kütle dağılımını değiştirir. Hareket güçlendiğinde doğrusal olmayan yapısal davranış devreye girebilir ve görünen frekansı kaydırabilir. Analiz yöntemi, pencere uzunluğu ve sinyal işleme tercihleri de sonucu etkiler. Dolayısıyla frekans değişimi beklenen bir durumdur ve kendiliğinden hasar anlamına gelmez.",
      ],
    },
    {
      heading: "Trend izleme",
      paragraphs: [
        "Frekansı haftalar, aylar ve yıllar boyunca izlemek, binanın olağan davranışı için bir referans çizgisi oluşturur. Bu çizgiden ani bir sapma ya da yavaş yavaş biriken bir eğilim, daha yakından incelemeyi gerektirebilir. Trend izlemenin değeri, uzman incelemesi isteyen değişimleri fark etmesindedir; bir binaya geçti ya da kaldı notu vermesinde değil.",
      ],
    },
    {
      heading: "Sınırlamalar",
      paragraphs: [
        "Frekans verisi tek başına bir değişimin nedenini söyleyemez. Birden fazla etken benzer kaymalar üretebilir. Frekans trendlerini yorumlamak için binanın yapımı, bakım geçmişi ve çevresi hakkında ayrıntılı bilgi gerekir. Tek bir ölçüm ya da bir dizi ölçüm bile yapısal sağlık teşhisi oluşturmaz.",
      ],
    },
  ],
  limitations: [
    "Frekans değişimi yalnızca yapısal hasardan değil, birçok nedenden kaynaklanabilir.",
    "Çevre koşulları ve kullanım yükü, yapısal durumdan bağımsız olarak ölçülen frekansı etkiler.",
    "Trendleri yorumlamak için bina hakkında ayrıntılı bilgi ve uzman mühendislik değerlendirmesi gerekir.",
    "Frekans verisi dinamik davranışı tanımlar; belirli yapısal elemanların durumunu göstermez.",
  ],
  sismosmartFit: [
    "SismoSmart, bina doğal frekanslarının zaman içinde çıkarılmasında kullanılabilecek titreşim verisi kaydetmek üzere tasarlanan, lansman öncesi bir sistemdir.",
    "Bu trend izleme yeteneği, pilot doğrulama gerçek bina koşullarında güvenilir frekans tahminini göstermedikçe bir tasarım hedefidir.",
  ],
  references: [
    {
      label: "NIST Tam Ölçekli Binaların Yapısal Tepki Özelliklerinin Ölçümü",
      organization: "NIST",
      url: "https://doi.org/10.6028/NIST.IR.4511",
    },
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü Çevresel Titreşim ve Deprem Güçlü Hareket Veri Setleri",
      organization: "USGS",
      url: "https://pubs.usgs.gov/of/2004/1375/",
    },
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü Binalarda Deprem Sarsıntısının İzlenmesi",
      organization: "USGS",
      url: "https://pubs.usgs.gov/fs/2003/fs068-03/",
    },
  ],
  relatedGuides: [
    "measuring-building-motion-after-earthquake",
    "mems-accelerometers-seismic-monitoring",
    "building-seismic-monitoring-device",
  ],
  relatedGlossaryTerms: ["doğal frekans", "çevresel titreşim", "modal analiz"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "Doğal frekanstaki değişim, uzman incelemesi gerektiren bir işarettir. Binanın güvenli olduğunu belirlemez; yapısal değerlendirme için yetkili bir mühendise danışın.",
  cta: {
    label: "SismoSmart hakkında bilgi alın",
    href: "/product",
    description: "SismoSmart'ın doğal frekans izleme yaklaşımını inceleyin.",
  },
};
