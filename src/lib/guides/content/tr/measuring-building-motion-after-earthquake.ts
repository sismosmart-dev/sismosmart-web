import type { GuideContent } from "@/lib/guides/types";

export const measuringBuildingMotionAfterEarthquakeTr: GuideContent = {
  translationKey: "measuring-building-motion-after-earthquake",
  locale: "tr",
  slug: "deprem-sonrasi-bina-hareketi-olcumu",
  title: "Deprem Sonrası Bina Hareketi Ölçümü: Kayıttan İncelemeye",
  description:
    "Deprem sonrasında bina hareketinin nasıl ölçüldüğünü, ivme ve zaman serisi verisinin ne anlattığını ve sonuçların mühendis incelemesine nasıl destek olduğunu öğrenin.",
  eyebrow: "Rehberler",
  h1: "Deprem Sonrası Bina Hareketi Ölçümü: Kayıttan İncelemeye",
  summary:
    "Sabit bir sensör ya da taşınabilir bir ivmeölçer, yapının deprem sırasında nasıl hareket ettiğini ölçebilir. Ortaya çıkan kayıt, bilinen bir noktada ivmenin zamanla nasıl değiştiğini gösterir; mühendisler bundan tepe değerleri, frekans içeriğini ve sarsıntının süresini çıkarır. Bu ölçümler inceleme önceliğini belirlemeye yardımcı olur, ama yapının durumunu değil tepkisini anlatır. Tek bir kayıt binanın güvenli ya da hasarlı olduğunu kanıtlamaz; yorum ise bina tipine, zemin koşullarına ve depremin özelliklerine bağlıdır.",
  keyTakeaways: [
    "Deprem sonrası kayıtlar belirli bir noktada ölçülen hareketi anlatır, yapının durumunu değil.",
    "İvme ve zaman serisi verisi tepe değerleri, frekans içeriğini ve sarsıntının süresini gösterir.",
    "Veri, uzman incelemesinin önceliklendirilmesine destek olur; incelemenin yerini tutmaz.",
  ],
  sections: [
    {
      heading: "Doğrudan cevap",
      paragraphs: [
        "Deprem sonrasında bina hareketini ölçmek, yapının bir ya da birkaç noktasında ivmeyi ve yer değiştirmeyi kaydetmek demektir. Bu veri, yapının olay sırasında ne kadar şiddetli ve ne kadar süre hareket ettiğine dair bir fikir verir. Mühendisler de yapının hangi kuvvetlere maruz kaldığını anlamak ve daha ayrıntılı bir araştırmanın gerekip gerekmediğine karar vermek için bu bilgiden yararlanır.",
      ],
    },
    {
      heading: "İvme ve zaman serisi",
      paragraphs: [
        "İvmeölçer saniyede birçok kez örnek alarak ivme değerlerinden bir zaman serisi oluşturur. Analistler bu kayıttan tepe ivmeyi, hareketin frekans içeriğini ve önemli sarsıntının süresini çıkarır. Bu özellikler, olayın binanın bulunduğu noktada ne kadar şiddetli olduğunu anlatmaya yardımcı olur.",
      ],
    },
    {
      heading: "Konumları karşılaştırma",
      paragraphs: [
        "Birden fazla kata sensör yerleştirildiğinde veri, hareketin yapı boyunca nasıl değiştiğini gösterir. Alt katlar çoğunlukla zemin hareketini daha yakından izler; üst katlar ise bazı frekansları güçlendirebilir. Katlar arasındaki okumaları karşılaştırmak, mühendislerin yapının bütün olarak nasıl tepki verdiğini anlamasına yardımcı olur.",
      ],
    },
    {
      heading: "Kayıttan mühendis incelemesine",
      paragraphs: [
        "Ham ivme verisi analizin başlangıcıdır, sonucu değildir. Yetkili bir yapı mühendisi ölçümleri binanın tasarımı, yapım biçimi, yaşı ve bilinen kusurlarıyla birlikte değerlendirir. Sensör verisi ile mühendislik değerlendirmesi bir araya geldiğinde, ikisinin tek başına verebileceğinden daha eksiksiz bir tablo çıkar.",
      ],
    },
    {
      heading: "Sınırlamalar",
      paragraphs: [
        "Hareket kayıtları belirli bir olay sırasında ne olduğunu anlatır; binanın uzun vadeli durumunu anlatmaz. Sıcaklık, rüzgâr ve ekipman titreşimi gibi etkenler okumaları değiştirebilir. Bir kattaki tek sensör, çok katlı bir yapının tepkisinin tamamını yakalayamaz. Verinin yorumlanması da uzmanlık gerektirir.",
      ],
    },
  ],
  limitations: [
    "Ölçülen hareket, belirli olayı ve sensörün bulunduğu noktayı yansıtır; binanın genel durumunu yansıtmaz.",
    "Sıcaklık, rüzgâr ve ekipman titreşimi gibi etkenler okumaları etkileyebilir.",
    "Tek bir sensör, çok katlı bir yapının tepkisini bütünüyle yakalayamaz.",
    "Yorumlama için bina hakkında bilgi ve uzman mühendislik değerlendirmesi gerekir.",
  ],
  sismosmartFit: [
    "SismoSmart, binadaki sabit noktalarda zaman damgalı veriyle üç eksenli ivme kaydetmeyi hedefleyen, lansman öncesi bir sistemdir.",
    "Bu yetenekler, pilot doğrulama gerçek bina koşullarında başarımı göstermedikçe tasarım hedefidir.",
  ],
  references: [
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü Binalarda Deprem Sarsıntısının İzlenmesi",
      organization: "USGS",
      url: "https://pubs.usgs.gov/fs/2003/fs068-03/",
    },
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü Çevresel Titreşim ve Deprem Güçlü Hareket Veri Setleri",
      organization: "USGS",
      url: "https://pubs.usgs.gov/of/2004/1375/",
    },
    {
      label: "NIST Tam Ölçekli Binaların Yapısal Tepki Özelliklerinin Ölçümü",
      organization: "NIST",
      url: "https://doi.org/10.6028/NIST.IR.4511",
    },
  ],
  relatedGuides: [
    "building-seismic-monitoring-device",
    "seismic-sensor-placement",
    "building-natural-frequency-monitoring",
  ],
  relatedGlossaryTerms: ["güçlü hareket", "zaman serisi", "ivmeölçer"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "Deprem sonrası hareket verisi, yetkili mühendis incelemesine destek olur ama onun yerini tutmaz. Bina güvenliği konusunda resmî yönergeleri izleyin ve yapı mühendisine danışın.",
  cta: {
    label: "SismoSmart hakkında bilgi alın",
    href: "/product",
    description: "SismoSmart'ın olay sonrası hareket kaydı yaklaşımını inceleyin.",
  },
};
