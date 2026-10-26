import type { GuideContent } from "@/lib/guides/types";

export const seismicSensorPlacementTr: GuideContent = {
  translationKey: "seismic-sensor-placement",
  locale: "tr",
  slug: "binada-sismik-sensor-yerlesimi",
  title: "Binada Sismik Sensör Yerleşimi: Sabit Montaj ve Pratik Rehberlik",
  description:
    "Binada sismik sensör yerleşiminde sabit montajı, tek sensör ile çok sensörlü düzen arasındaki seçimi ve kurulumdan önce işe yarayan kontrol listesini öğrenin.",
  eyebrow: "Rehberler",
  h1: "Binada Sismik Sensör Yerleşimi: Sabit Montaj ve Pratik Rehberlik",
  summary:
    "Sensör yerleşimi, neyi ölçmek istediğinizi belirlemekle başlar. Sağlam bir yüzeye sıkıca monte edilen sensör güvenilir bir referans noktası sağlar; birden fazla kata yerleştirilen sensörler ise yapının farklı noktalarındaki hareketi gösterir. Yerleşim veri kalitesini doğrudan etkiler: gevşek montaj gürültü üretir, ağır makinelerin yanındaki sensör ise mühendislerin asıl aradığı sinyalleri gölgeleyebilir. Binayı onaylayan evrensel bir yerleşim yoktur; amaç, sorulan sorulara yanıt verecek hareketi yakalayabilecek noktaları seçmektir.",
  keyTakeaways: [
    "Yerleşim ölçüm hedefine bağlıdır: nereye monte edeceğinize karar vermeden önce neyi öğrenmek istediğinizi belirleyin.",
    "Güvenilir veri için sensör, binanın sağlam bir yüzeyine sıkıca sabitlenmelidir.",
    "Yapının tepkisini karşılaştırmak için birden fazla kata sensör gerekir; tek noktanın sınırları vardır.",
  ],
  sections: [
    {
      heading: "Doğrudan cevap",
      paragraphs: [
        "Sismik sensör yerleşimi, ivmeölçerlerin nereye ve nasıl monte edileceğini seçmek demektir. İyi yerleşim tutarlı ve yorumlanabilir sonuç verir; kötü yerleşim gürültü ekler ya da önemli davranışları kaçırır. İlk adım, izlemenin hangi soruyu yanıtlaması gerektiğini tanımlamaktır.",
      ],
    },
    {
      heading: "Sabit montaj",
      paragraphs: [
        "Sensör; mobilyaya, bölme duvarlara ya da gevşek kaplamalara değil, yapıyla birlikte hareket eden bir yapı elemanına sağlam biçimde tutturulmalıdır. Beton, çelik veya sağlam duvar yüzeyleri tercih edilir. Montaj yöntemi bina hareketini sensöre olduğu gibi aktarmalı; kendi rezonansını, gevşemeyi ya da kaymayı ölçüme katmamalıdır.",
      ],
      bullets: [
        "Yapısal olmayan bölmelere değil, yapı elemanlarına monte edin.",
        "Motor, havalandırma ünitesi ve benzeri titreşim kaynaklarının yakınından kaçının.",
        "Montajın sıkı olduğunu ve zamanla gevşemeyeceğini kontrol edin.",
      ],
    },
    {
      heading: "Tek sensör ile çok sensörlü düzen",
      paragraphs: [
        "Referans noktasındaki tek sensör yalnızca o noktadaki hareketi anlatır. Farklı katlara yerleştirilmiş sensörler ise hareketin yapı boyunca nasıl büyüdüğünü ya da azaldığını gösterir. Çok sensörlü düzen daha fazla bilgi verir, ama daha fazla planlama, kurulum emeği ve veri yönetimi ister.",
      ],
    },
    {
      heading: "Zemin girişi ve üst kat hareketi",
      paragraphs: [
        "Zemin kattaki sensörler topraktan gelen hareketi yakalar. Üst kat sensörleri ise yapının bu hareketi nasıl dönüştürdüğünü kaydeder. İkisini karşılaştırmak, mühendislerin yapının dinamik davranışını ve bazı katların diğerlerinden daha şiddetli hareket edip etmediğini anlamasına yardımcı olur.",
      ],
    },
    {
      heading: "Kurulum öncesi pratik kontrol listesi",
      paragraphs: [
        "Kurulumdan önce ölçüm hedefini, yapısal montaj noktalarını, erişimi ve güç kaynağını doğrulayın; verinin nerede saklanıp nasıl alınacağını da planlayın. Sensörün konumunu, yönünü ve montaj türünü kaydedin. Böylece sonraki analizlerde kurulum ayrıntıları hesaba katılabilir.",
      ],
    },
    {
      heading: "Sınırlamalar",
      paragraphs: [
        "Yerleşim kararı her bina ve her ölçüm hedefi için ayrıdır. Her yapıya uyan tek bir yerleşim stratejisi yoktur. Sensör verisi montaj noktasındaki davranışı yansıtır; ek sensör olmadan diğer noktaları temsil etmeyebilir.",
      ],
    },
  ],
  limitations: [
    "Her binaya ve her ölçüm hedefine uyan evrensel bir yerleşim stratejisi yoktur.",
    "Sensör yalnızca bulunduğu noktadaki hareketi kaydeder; diğer katları ya da alanları temsil etmeyebilir.",
    "Çevresel etkenler ve yakındaki ekipman, her yerleşimde okumaları etkileyebilir.",
    "Doğru analiz için kurulum ayrıntılarının kaydedilmesi gerekir; bu da planlama emeği demektir.",
  ],
  sismosmartFit: [
    "SismoSmart, net montaj yönergeleri ve çok katlı kurulum seçeneğiyle sabit montaj için tasarlanan, lansman öncesi bir sistemdir.",
    "Bu yaklaşım, pilot doğrulama gerçek binalarda yerleşimi ve veri kalitesini göstermedikçe tasarım hedefidir.",
  ],
  references: [
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü Federal Binalarda Deprem Sarsıntısının İzlenmesi",
      organization: "USGS",
      url: "https://pubs.usgs.gov/fs/2005/3052/",
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
    "mems-accelerometers-seismic-monitoring",
    "measuring-building-motion-after-earthquake",
  ],
  relatedGlossaryTerms: ["sensör yerleşimi", "dizi", "montaj"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "Sensör yerleşimi binanın güvenli olduğunu belgelemez. Uygun ölçüm hedeflerini belirlemek ve sonuçları yorumlamak için yetkili bir mühendise danışın.",
  cta: {
    label: "SismoSmart hakkında bilgi alın",
    href: "/product",
    description: "SismoSmart'ın sensör yerleşimi yönergelerini inceleyin.",
  },
};
