import type { GuideContent } from "@/lib/guides/types";

export const memsAccelerometersSeismicMonitoringTr: GuideContent = {
  translationKey: "mems-accelerometers-seismic-monitoring",
  locale: "tr",
  slug: "mems-ivmeolcer-sismik-izleme",
  title: "MEMS İvmeölçerler ile Sismik İzleme: Temel Kavramlar",
  description:
    "MEMS ivmeölçerlerin sismik izlemede nasıl çalıştığını; çözünürlük, ölçüm aralığı, gürültü, örnekleme ve zamanlama başlıklarıyla öğrenin.",
  eyebrow: "Rehberler",
  h1: "MEMS İvmeölçerler ile Sismik İzleme: Temel Kavramlar",
  summary:
    "MEMS ivmeölçerler, silikon çip üzerindeki mikroskobik bir mekanik yapıyla ivmeyi ölçen, küçük ve düşük maliyetli sensörlerdir. Ölçüm aralığı, gürültü zemini, örnekleme hızı, zamanlama doğruluğu, montaj ve kalibrasyon ölçüm hedefine uygunsa sismik ve yapısal izlemeye destek olabilirler. Düşük maliyet tek başına mühendislik kalitesinde veri sağlamaz. Çözünürlük, dinamik aralık ve gürültü arasındaki ödünleşimleri anlamak, bir MEMS cihazının belirli bir uygulamaya uyup uymadığını değerlendirmeye yardımcı olur.",
  keyTakeaways: [
    "Ölçüm aralığı, gürültü, örnekleme ve zamanlama hedefe uygunsa MEMS cihazları yapısal izlemeyi ve güçlü hareket uygulamalarını destekleyebilir.",
    "Düşük maliyet tek başına mühendislik kalitesinde veri sağlamaz; tam teknik şartname önemlidir.",
    "Çözünürlük, ölçüm aralığı, gürültü zemini ve kalibrasyon birlikte değerlendirilmelidir.",
  ],
  sections: [
    {
      heading: "Doğrudan cevap",
      paragraphs: [
        "MEMS ivmeölçerler, silikon bir tabana asılı küçük bir kanıt kütlesi kullanır. Sensör hareket ettiğinde kütle yer değiştirir ve bu değişim elektriksel olarak ölçülür. Sonuçta ivmeyle orantılı bir gerilim ya da dijital sinyal elde edilir. MEMS teknolojisi sayesinde bina, köprü ve benzeri yapılara yerleştirilebilecek küçük ve uygun maliyetli sensörler yapmak mümkün olur.",
      ],
    },
    {
      heading: "MEMS ivme ölçümü nasıl çalışır",
      paragraphs: [
        "MEMS elemanının içinde kanıt kütlesi, silikon tabandaki küçük elektrotlara bağlı olarak asılıdır. İvme kütlenin tabana göre kaymasına yol açar, bu da elektrotlar arasındaki kapasitansı değiştirir. Kapasitanstaki değişim, kalibre edilmiş bir ivme okumasına dönüştürülür. Üç eksenli yapı sayesinde dikey ve iki yatay yön aynı anda ölçülür.",
      ],
    },
    {
      heading: "Çözünürlük, ölçüm aralığı ve gürültü",
      paragraphs: [
        "Çözünürlük, sensörün algılayabildiği en küçük ivme değişimidir. Ölçüm aralığı, sensörün doyuma ulaşmadan ölçebileceği en büyük ivmedir. Gürültü zemini ise arka plandaki elektriksel gürültünün üzerine çıkabilen en küçük sinyali belirler. Güçlü hareket uygulamalarında aralığın, yüksek ivmeleri kırpılma olmadan karşılaması gerekir. Çevresel titreşim izlemede ise düşük gürültü zemini daha önemlidir.",
      ],
      bullets: [
        "Güçlü hareket izleme için ±birkaç g aralığı tipiktir.",
        "Mikro-g düzeyindeki gürültü zemini, çevresel titreşim çalışmalarına destek olur.",
        "Çözünürlük ile ölçüm aralığı dengelenmelidir; birini artırmak diğerini azaltabilir.",
      ],
    },
    {
      heading: "Örnekleme ve zamanlama",
      paragraphs: [
        "MEMS ivmeölçerler saniyede onlarca ya da yüzlerce örnek alır. Örnekleme hızı yükseldikçe daha yüksek frekanslı hareket yakalanır. Birden fazla sensörün verisi birleştirilirken ya da kayıtlar dış sismik verilerle karşılaştırılırken zamanlama doğruluğu önem kazanır. Saat kayması ve senkronizasyon hataları zaman farkları yaratır; bu da analizi zorlaştırabilir.",
      ],
    },
    {
      heading: "Düşük maliyetli ölçümden yararlı veriye",
      paragraphs: [
        "Düşük maliyetli bir MEMS sensörü doğru monte edilir, kalibre edilir ve güvenilir bir zamanlamayla eşleştirilirse yararlı veri üretebilir. Ham sensör çıktısından mühendislik düzeyinde bilgiye varmak için kurulum kalitesine, doğrulamaya ve bilinen referanslara göre kalibrasyona özen gerekir. Bu adımlar olmadan yetkin bir sensör bile yorumlaması zor sonuçlar verebilir.",
      ],
    },
    {
      heading: "Sınırlamalar",
      paragraphs: [
        "MEMS sensörlerin, araştırma sınıfı cihazlara göre sınırları vardır. Gürültü zeminleri daha yüksek, bant genişlikleri daha dar ya da zamanlamaları daha az hassas olabilir. Sıcaklık gibi çevresel etkenler okumaları değiştirebilir. Teknik şartnamenin dikkatle seçilmesi ve doğru montaj bu farkları azaltır, ama tamamen ortadan kaldırmaz.",
      ],
    },
  ],
  limitations: [
    "MEMS sensörlerin gürültü zemini genellikle araştırma düzeyindeki cihazlardan yüksektir.",
    "Sıcaklık ve çevre koşulları MEMS sensör çıkışını etkileyebilir.",
    "Zamanlama doğruluğu, özellikle çok sensörlü düzenlerde dikkatli senkronizasyon ister.",
    "Yararlı mühendislik verisi için doğru kalibrasyon ve montaj uygulamaları gerekir.",
  ],
  sismosmartFit: [
    "SismoSmart, ölçüm aralığı, gürültü ve örnekleme için hedef değerler belirlenmiş üç eksenli MEMS ivmeölçerler etrafında tasarlanan, lansman öncesi bir sistemdir.",
    "Bu tasarım hedefleri, pilot doğrulama seçilen MEMS bileşenlerinin gerçek binalarda izleme gereksinimlerini karşıladığını göstermedikçe tasarım hedefi olarak kalır.",
  ],
  references: [
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
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü ShakeNet taşınabilir kablosuz yapısal sensör ağı",
      organization: "USGS",
      url: "https://pubs.usgs.gov/publication/ofr20151134",
    },
  ],
  relatedGuides: [
    "building-seismic-monitoring-device",
    "seismic-sensor-placement",
    "building-natural-frequency-monitoring",
  ],
  relatedGlossaryTerms: ["MEMS", "ivmeölçer", "gürültü zemin değeri"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "MEMS ivmeölçer verisi binanın güvenli olduğunu belirlemez. Sonuçları yetkili bir mühendis yorumlamalıdır.",
  cta: {
    label: "SismoSmart hakkında bilgi alın",
    href: "/product",
    description: "SismoSmart'ın MEMS tabanlı izleme yaklaşımını inceleyin.",
  },
};
