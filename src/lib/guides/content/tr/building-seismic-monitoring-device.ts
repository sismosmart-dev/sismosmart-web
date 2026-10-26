import type { GuideContent } from "@/lib/guides/types";

export const buildingSeismicMonitoringDeviceTr: GuideContent = {
  translationKey: "building-seismic-monitoring-device",
  locale: "tr",
  slug: "bina-deprem-sensoru-sismik-izleme",
  title: "Bina Deprem Sensörü: Ne Ölçer ve Neden Önemlidir",
  description:
    "Sabit bir bina deprem sensörünün ne ölçtüğünü, alarm sistemleri ve telefon uygulamalarından nasıl ayrıldığını ve hangi durumlarda işe yaradığını öğrenin.",
  eyebrow: "Rehberler",
  h1: "Bina Deprem Sensörü: Ne Ölçer ve Neden Önemlidir",
  summary:
    "Bina deprem sensörü, belirli bir yapının deprem sırasındaki ve gündelik titreşimlerdeki hareketini kaydeden sabit bir ivmeölçerdir. Sahibiyle birlikte dolaşan bir telefonun aksine, kalıcı olarak monte edilen sensör kurulduğu noktada sabit bir referans sağlar. Elde edilen veri, mühendislerin yapının farklı bölümlerinin sarsıntıya nasıl tepki verdiğini anlamasına yardımcı olabilir. Cihazın kendisi ise güvenlik belgesi ya da resmî alarm sistemi değil, bir ölçüm aracıdır.",
  keyTakeaways: [
    "Sabit ivmeölçer monte edildiği noktadaki hareketi kaydeder ve mühendise güvenilir bir konum referansı verir.",
    "Çok katlı binalarda birden fazla sensör, yapının farklı noktalarındaki hareketi karşılaştırmaya yardımcı olur.",
    "Bireysel kullanıma yönelik bir izleme cihazı, yetkili bir yapı mühendisinin ya da resmî incelemenin yerini tutmaz.",
  ],
  sections: [
    {
      heading: "Doğrudan cevap",
      paragraphs: [
        "Bina deprem sensörü, kurulduğu noktadaki ivmeyi, titreşimi ve zamanı sürekli ölçer. Yerinde sabit durduğu için ürettiği veri geniş bir bölgeyi değil, o montaj noktasının davranışını anlatır. Bu yüzden sabit sensörler, yapının deprem, rüzgâr ve mekanik ekipman gibi kuvvetlere verdiği tepkiyi anlamak için işe yarar.",
      ],
    },
    {
      heading: "Cihaz ne ölçer",
      paragraphs: [
        "Cihazın içindeki sensör, biri dikey ikisi yatay olmak üzere üç eksende ivmeyi kaydeder. Her okumaya zaman damgası eklenir; böylece mühendisler bir olay sırasındaki hareketin zaman serisini yeniden kurabilir. Bu kayıtlardan frekans içeriği, tepe ivme ve süre çıkarılır ve yapının ne kadar şiddetli, ne kadar süre hareket ettiği anlaşılır.",
      ],
      bullets: [
        "Montaj noktasındaki tepe zemin ya da kat ivmesi.",
        "Frekans içeriği ve baskın titreşim modları.",
        "Önemli sarsıntının süresi.",
        "Birden fazla sensör kurulduğunda sensörler arası karşılaştırma.",
      ],
    },
    {
      heading: "Sabit izlemenin alarmdan farkı",
      paragraphs: [
        "Alarm ya da bildirim sistemi, bir olay algılandığında veya beklendiğinde insanları uyarmak için tasarlanır. Sabit izleme cihazı ise belirli bir konumda olanı kaydeder ve verinin sonradan incelenmesini sağlar. Amaçları farklıdır: biri hemen alınacak önlemler için bilgi verir, diğeri olay sonrasında durumu anlamaya hizmet eder.",
      ],
    },
    {
      heading: "Nerede işe yarar",
      paragraphs: [
        "Sabit izleme, çok katlı konut binalarında, olağan titreşim davranışı henüz bilinmeyen eski yapılarda, küçük ticari mülklerde ve sismik açıdan etkin bölgelere yakın konumlarda işe yarar. Veri, yöneticilerin bir olaydan sonra uzman incelemesine gerek olup olmadığına karar vermesine yardımcı olur. Şeffaf ve doğrulanabilir kayıtlar, sakinlerin binanın neler yaşadığını anlamasını da kolaylaştırır.",
      ],
    },
    {
      heading: "Sınırlamalar",
      paragraphs: [
        "Bir kattaki tek sensör tüm binanın davranışını temsil etmez. İvmeölçerler hasarı doğrudan ölçmez, yalnızca hareketi ölçer. Yapısal güvenlik hakkında bir sonuca varmak için verinin yetkili bir uzman tarafından yorumlanması gerekir. Hava koşulları, zemin ve ekipman titreşimi de okumaları etkileyebilir.",
      ],
    },
  ],
  limitations: [
    "Bir kattaki tek sensör tüm binanın davranışını temsil etmez.",
    "Hareket verisi hareketi anlatır, yapısal hasarı değil; bu yüzden binanın güvenli olduğunu doğrulayamaz.",
    "Yorumlama için yapının inşaat bilgisi ve uzman mühendislik değerlendirmesi gerekir.",
    "Rüzgâr, sıcaklık ve ekipman gibi çevresel etkenler ölçülen titreşimi etkileyebilir.",
  ],
  sismosmartFit: [
    "SismoSmart, binalara sabit MEMS ivmeölçerler yerleştirmeyi hedefleyen, lansman öncesi bir üründür. Mevcut tasarım hedefleri arasında üç eksenli kayıt, zaman damgalı veri ve uzaktan erişim bulunur.",
    "Bu yetenekler, pilot doğrulama gerçek binalarda başarımı göstermedikçe tasarım hedefidir.",
  ],
  references: [
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü Ulusal Güçlü Hareket Projesi",
      organization: "USGS",
      url: "https://earthquake.usgs.gov/monitoring/nsmp/",
    },
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü Binalarda Deprem İzleme",
      organization: "USGS",
      url: "https://earthquake.usgs.gov/monitoring/nsmp/buildings/",
    },
    {
      label: "ABD Jeolojik Araştırmalar Enstitüsü Binalarda Deprem Sarsıntısının İzlenmesi",
      organization: "USGS",
      url: "https://pubs.usgs.gov/fs/2003/fs068-03/",
    },
  ],
  relatedGuides: [
    "measuring-building-motion-after-earthquake",
    "seismic-sensor-placement",
    "earthquake-app-vs-fixed-sensor",
  ],
  relatedGlossaryTerms: ["ivmeölçer", "güçlü hareket", "MEMS"],
  publishedAt: "2026-07-26",
  updatedAt: "2026-07-26",
  safetyNotice:
    "Bina izleme cihazı hareket verisi kaydeder. Binanın güvenli olduğunu belgelemez ve deprem sonrasında yetkili bir mühendisin incelemesinin yerini tutmaz.",
  cta: {
    label: "SismoSmart hakkında bilgi alın",
    href: "/product",
    description: "SismoSmart'ın sabit bina izleme yaklaşımını inceleyin.",
  },
};
