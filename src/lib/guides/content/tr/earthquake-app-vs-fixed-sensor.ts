import type { GuideContent } from "@/lib/guides/types";

export const earthquakeAppVsFixedSensorTr: GuideContent = {
  translationKey: "earthquake-app-vs-fixed-sensor",
  locale: "tr",
  slug: "deprem-uygulamasi-sabit-sensor-farki",
  title: "Deprem Uygulaması ile Sabit Sensör: Temel Farklar",
  description:
    "Deprem uygulamalarını sabit bina sensörleriyle karşılaştırın: her birinin ne yaptığını, sabit referansın neden önemli olduğunu ve uyarı ile bina kaydı arasındaki farkı öğrenin.",
  eyebrow: "Rehberler",
  h1: "Deprem Uygulaması ile Sabit Sensör: Temel Farklar",
  summary:
    "Deprem uygulamaları da sabit bina sensörleri de sismik olaylarla ilgilidir, ama farklı işlere yarar. Telefon uygulamaları yoğun algılama ağlarına katılabilir ve bildirim gönderebilir; ancak telefon kullanıcıyla birlikte hareket eder, modele göre değişir ve binaya sabitlenmez. Kalıcı olarak monte edilmiş bir sensör ise bilinen bir noktada durur, hareketi tutarlı biçimde kaydeder ve kullanıcının değil binanın yaşadığını anlatan veri üretir. Bu farkı bilmek, sakinlerin ve yöneticilerin her ihtiyaç için doğru aracı seçmesine yardımcı olur.",
  keyTakeaways: [
    "Telefonlar yoğun algılama ağlarına katılabilir, ama kullanıcıyla birlikte hareket eder ve modelden modele değişir.",
    "Sabit sensör, tutarlı bina ölçümleri için sabit bir konum referansı sağlar.",
    "Resmî uyarılar ile sabit bina kayıtları farklı sorunlara yanıt verir; birbirine karıştırılmamalıdır.",
  ],
  sections: [
    {
      heading: "Doğrudan cevap",
      paragraphs: [
        "Deprem uygulaması akıllı telefonda çalışır; telefonun sensörlerinden, kalabalık kaynaklı verilerden veya sunucu tarafındaki algılamadan yararlanarak bildirim gönderir. Sabit bina sensörü ise belirli bir binanın belirli bir noktasına monte edilmiş, bu iş için yapılmış bir ivmeölçerdir. Uygulama taşınabilir ve kullanıcıya yöneliktir; sensör sabittir ve yapıya yöneliktir.",
      ],
    },
    {
      heading: "Telefon uygulamalarının iyi yaptığı şeyler",
      paragraphs: [
        "Telefon tabanlı deprem uygulamaları hızlı bildirim verebilir, araştırma ağlarına veri sağlayabilir ve farkındalık oluşturabilir. Milyonlarca telefon geniş bir alana dağıldığı için, geleneksel cihazların seyrek kaldığı yerlerde bile sarsıntıyı algılamaya katkı verebilir. Güçlü yanları erişilebilirlik ve kapsamdır.",
      ],
    },
    {
      heading: "Neden sabit referans önemlidir",
      paragraphs: [
        "Sabit sensör hep aynı koordinatta ve binanın aynı noktasında durur. Konumu değişmediği için kayıtların her biri doğrudan karşılaştırılabilir. Mühendislerin yapının davranışını zaman içinde çözümlemesi ya da olayları birbiriyle kıyaslaması gerektiğinde bu sabit nokta şarttır.",
      ],
    },
    {
      heading: "Uyarılar ile bina kayıtları",
      paragraphs: [
        "Uyarı, bir depremin olduğunu ya da yaklaştığını insanlara bildirir. Bina kaydı ise yapının gerçekte ne yaşadığını anlatır. İkisi birbirini tamamlar: biri hemen korunma önlemi almak için, diğeri olay sonrasında durumu anlamak ve inceleme kararlarına destek vermek için kullanılır.",
      ],
    },
    {
      heading: "Doğru aracı seçme",
      paragraphs: [
        "Telefon uygulamaları kişisel farkındalık ve topluluk katkısı için faydalıdır. Sabit sensörler bina bazında ölçüm, uzun vadeli izleme ve uzman analizi için uygundur. Bir olaydan sonra yapının tepkisini değerlendirmek isteyen bina yöneticisinin ihtiyacı, telefonun verebileceği yaklaşık bilgi değil, sabit sensörün sağladığı türden veridir.",
      ],
    },
  ],
  limitations: [
    "Telefon sensörleri yapı izleme için kalibre edilmemiştir ve cihazdan cihaza farklılık gösterir.",
    "Sabit sensör, birden fazla sensörden oluşan bir düzen kurulmadıkça tüm binayı kapsamaz.",
    "Uygulamalar ve tek tek sensörler, yetkili kurumların resmî uyarılarının yerini tutmaz.",
    "Verinin hangi cihazla kaydedildiğinden bağımsız olarak, yorumlaması uzman değerlendirmesi gerektirir.",
  ],
  sismosmartFit: [
    "SismoSmart, bina bazında hareket kaydı sağlamak için sabit MEMS ivmeölçerler kullanan, lansman öncesi bir sistemdir.",
    "Bu sabit konum yaklaşımı, pilot doğrulama gerçek koşullarda mobil alternatiflerle karşılaştırmalı başarımı göstermedikçe tasarım hedefidir.",
  ],
  references: [
    {
      label: "UC Berkeley MyShake projesi ve araştırma referansları",
      organization: "UC Berkeley",
      url: "https://myshake.berkeley.edu/about-us",
    },
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü Sismograflar: Depremleri Takip Etmek",
      organization: "USGS",
      url: "https://www.usgs.gov/programs/earthquake-hazards/seismographs-keeping-track-earthquakes",
    },
    {
      label: "UC Berkeley Mobil Telefonlar Sismolojik Sensör Olarak",
      organization: "UC Berkeley",
      url: "https://doi.org/10.1109/TASE.2013.2245121",
    },
  ],
  relatedGuides: [
    "building-seismic-monitoring-device",
    "seismic-sensor-placement",
    "measuring-building-motion-after-earthquake",
  ],
  relatedGlossaryTerms: ["ivmeölçer", "sismik ağ", "güçlü hareket"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "Ne telefon uygulaması ne de sabit sensör, binanın güvenli olup olmadığını belirler. Resmî uyarıları izleyin ve yapısal değerlendirme için yetkili bir mühendise danışın.",
  cta: {
    label: "SismoSmart hakkında bilgi alın",
    href: "/product",
    description: "SismoSmart'ın sabit bina izleme yaklaşımını inceleyin.",
  },
};
