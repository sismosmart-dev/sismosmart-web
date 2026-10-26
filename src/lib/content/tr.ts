import type { SiteCopy } from "@/lib/site";

export const trCopy: SiteCopy = {
  accessibility: {
    skipToContent: "İçeriğe geç",
  },
  meta: {
    title: "Binanız için sismik izleme cihazı",
    description:
      "SismoSmart, sarsıntı sırasında bina hareketini kaydetmek ve nitelikli mühendislerin olay sonrası incelemesine veri sağlamak için geliştirilen lansman öncesi bir sismik izleme cihazıdır.",
  },
  navigation: {
    eyebrow: "Bina için sismik izleme",
    primaryCta: "Pilot başvurusu",
    links: [
      { label: "Teknoloji", href: "/technology" },
      { label: "Ürün", href: "/product" },
      { label: "Pilot", href: "/pilot-program" },
      { label: "SSS", href: "/faq" },
    ],
  },
  hero: {
    badge: "Erken aşama donanım girişimi",
    title: "Depremde binanızın nasıl hareket ettiğini ölçen bir cihaz geliştiriyoruz.",
    description:
      "SismoSmart, bina hareketini ölçüp kaydetmek için geliştirdiğimiz, duvara sabitlenen bir cihaz. Henüz lansman öncesi aşamada: algılama, bildirim, bağlantı ve performans pilot çalışmalarında doğrulanacak. Amacımız, sarsıntıdan sonra nitelikli bir mühendisin inceleyebileceği bir hareket kaydı bırakmak.",
    primaryCta: "Pilot için başvur",
    secondaryCta: "Yatırımcı bilgi notu",
    tertiaryCta: "Teknolojiye bak",
    primaryHref: "/pilot-program",
    secondaryHref: "/investors",
    tertiaryHref: "/technology",
    stats: [
      { label: "Montaj", value: "Duvara sabit" },
      { label: "Algılama", value: "Cihaz üzerinde" },
      { label: "Örnekleme hedefi", value: "250 Hz, 3 eksen" },
      { label: "Güç hedefi", value: "30-60 sn süperkapasitör" },
    ],
    deviceEyebrow: "SismoSmart cihazı",
    deviceTitle: "Duvara sabitlenen, prizden beslenen 100 × 100 mm'lik cihaz",
    deviceDescription:
      "Cihazı duvara yapıştırıp prize takıyorsunuz, uygulamadan eşleyip Wi-Fi'nizi tanımlıyorsunuz. Sonrasında kendi başına çalışıyor: bina titreşimini ölçüyor, gündelik hayatınıza karışmıyor. Aşağıdaki özellikler henüz tasarım aşamasında.",
    deviceSpecs: [
      "3 eksende hareket ölçümü",
      "Olayın cihazda yerel olarak kaydı",
      "Cihaz verisinin şifrelenmesi",
    ],
    meterTopLabel: "Algılama",
    meterTopValue: "Doğrulama bekliyor",
    meterBottomLabel: "Veri",
    meterBottomValue: "Şifreleme planlı",
    imageAlt: "SismoSmart sismik izleme cihazı, durum LED'i ile",
  },
  trust: {
    eyebrow: "Konumlandırma",
    title: "Bu cihazın yapamadığı şeyler de var.",
    description:
      "SismoSmart henüz pilot aşamasında. Binanızda olanı kaydedip sonradan inceleyebileceğiniz bir veriye dönüştürmeyi amaçlıyor. AFAD'ın uyarı sistemiyle ya da deprem sonrası mühendis incelemesiyle yarışmıyoruz; ikisi de yerinde duruyor. Biz aradaki boşluğu doldurmaya çalışıyoruz.",
    items: [
      { label: "Aşama", value: "Pilot" },
      { label: "Ana iş", value: "Hareket kaydı" },
      { label: "Yapısal karar", value: "Mühendiste" },
    ],
  },
  howItWorks: {
    eyebrow: "Nasıl çalışır",
    title: "Kurulum birkaç dakika sürüyor, gerisi arka planda.",
    description:
      "Pilot kalibrasyonunda binanın olağan titreşim profilini öğrenmeyi ve gündelik gürültüden farklı hareketleri ayırmayı deniyoruz. Saha doğrulaması bitene kadar yanlış ya da kaçırılmış algılama olabilir.",
    steps: [
      {
        title: "Cihazı duvara takın",
        description:
          "İç mekânda sabit bir duvara yapıştırıyorsunuz. Arkasında çift taraflı bant hazır geliyor, isterseniz vidayla da sabitleyebilirsiniz.",
      },
      {
        title: "Uygulamaya bağlayın",
        description:
          "Telefonunuzdaki SismoSmart uygulaması cihazı Bluetooth ile buluyor. Wi-Fi şifrenizi bir kez giriyorsunuz, o kadar.",
      },
      {
        title: "Binayı tanır",
        description:
          "Pilot kalibrasyonunda trafik ve rüzgâr gibi gündelik titreşimlerden bir referans çizgisi çıkarmayı deniyoruz. Yöntemi saha verisiyle doğrulanana kadar güvenilir diye sunmuyoruz.",
      },
      {
        title: "Sarsıntıda haber verir",
        description:
          "Tasarım, cihazda algılama olduktan sonra bildirim üretmeyi amaçlıyor. Bildirim süresi ve birden fazla cihazla doğrulama pilotta sınanacak.",
      },
      {
        title: "Olayı kaydeder",
        description:
          "Tasarımda olay önce cihazda saklanıyor, bağlantı olunca buluta aktarılıyor. Bu akışın tamamını pilotta denemeden çalışan bir özellik olarak sunmuyoruz.",
      },
      {
        title: "Birden fazla cihaz",
        description:
          "Birden fazla cihazın, katlar arası göreli hareket ve olay eşleştirmesi için ek kanıt sağlayıp sağlamadığını test ediyoruz. Doğruluk ve yanlış alarma etkisi için pilot verisi gerekiyor.",
      },
    ],
  },
  features: {
    eyebrow: "Ne yapar",
    title: "Aslında birkaç ayrı işi aynı anda yapıyor.",
    description:
      "Ürünü olay kaydı ve daha uzun dönemli bina hareketi verisi etrafında geliştiriyoruz. Bildirim, yapı sağlığı yorumu ve diğer özellikler henüz doğrulanmadı; bunlar garanti edilen sonuçlar değil, üzerinde çalıştığımız hedefler.",
    items: [
      {
        accent: "01",
        title: "Sarsıntıyı algılar",
        description:
          "Şu anki tasarım ADXL355 sınıfı bir MEMS sensörü ve üç eksende 250 Hz örnekleme kullanmayı hedefliyor. Algılama ve performans için tezgâh ve pilot kanıtı gerekiyor.",
      },
      {
        accent: "02",
        title: "Telefonunuza bildirim gönderir",
        description:
          "Bildirimin nasıl davranacağı pilotta doğrulanması gereken bir hedef. SismoSmart acil durum servisi veya resmî uyarı sistemi değildir; resmî uyarıları ve acil durum talimatlarını izleyin.",
      },
      {
        accent: "03",
        title: "Bina sağlığını izler",
        description:
          "Ölçülen titreşim özelliklerindeki değişim zaman içinde mühendise ek kanıt sağlayabilir. Bu bir teşhis değildir ve binanın güvenli olup olmadığını belirlemez.",
      },
      {
        accent: "04",
        title: "Depremden sonra rapor üretir",
        description:
          "Planlanan olay sonrası rapor, ölçülen hareketi nitelikli bir inceleme için özetlemeyi amaçlıyor. Raporun içeriği ve yorumu pilotta doğrulanacak.",
      },
      {
        accent: "05",
        title: "Sıcaklık ve nem de okur",
        description:
          "Ortam ölçümü, mevsim etkilerini diğer değişimlerden ayırmaya yardım etmek için tasarlanıyor. Tek başına hasar tespiti yapmaz.",
      },
      {
        accent: "06",
        title: "Cihazlar arası eşleştirme",
        description:
          "Birden fazla cihazı birbiriyle eşleştirmek bir tasarım hedefi. Doğrulama süresine ve yanlış alarma etkisi henüz pilot kanıtıyla gösterilmedi.",
      },
    ],
  },
  demo: {
    eyebrow: "Veri akışı",
    title: "Ölçüm cihazda başlıyor, telefonunuzda bitiyor.",
    description:
      "Tasarımda ölçüm cihazda yapılıyor, bağlantı olduğunda veri güvenli biçimde aktarılacak. Cihaz güvenliği, raporlama ve uzun dönem eğilim ekranları pilotta doğrulanacak.",
    previewLabel: "Bina kaydı",
    networkLabel: "Mahalle ağı",
    sensorLabel: "Cihaz",
    sensorValue: "Çalışıyor",
    eventLabel: "Son olay",
    eventValue: "Kayıtlı, incelenebilir",
    bullets: [
      "Şu anki tasarım ADXL355 sınıfı bir sensör, üç eksende 250 Hz örnekleme ve belgelenmiş bir gürültü hedefi içeriyor; nihai performans için dondurulmuş malzeme listesi (BOM) ve tezgâh ölçümü gerekiyor.",
      "Binanızın titreşim verisini görmek için kişisel bilgi paylaşmanız gerekmiyor.",
      "Cihaz karar vermez; mühendisin inceleyeceği veriyi toplar.",
    ],
    cta: "Teknolojiye bak",
    ctaHref: "/technology",
  },
  proof: {
    eyebrow: "Pilot yolu",
    title: "Önce az sayıda gerçek binada denemek istiyoruz.",
    description:
      "Ürünü büyütmeden önce sahada görmek istiyoruz. İlk pilotlardan gelecek geri bildirim, cihazın son halini belirleyecek. Şimdilik üç grupla konuşuyoruz.",
    cards: [
      {
        title: "Apartmanlar",
        description:
          "Pilot cihaz sayısı, süre, mülkiyet ve ticari koşullar her saha için ayrıca belirlenir. Bu sayfa ücretsiz donanım veya sabit pilot süresi taahhüt etmez.",
        highlight: "Pilot koşulları görüşülür",
      },
      {
        title: "Kampüsler ve fabrikalar",
        description:
          "Birden fazla binası olan tesisler. Her binaya bir cihaz, hepsi tek bir panelden görünüyor.",
        highlight: "Kurumsal",
      },
      {
        title: "Üniversite ortaklıkları",
        description:
          "Araştırma erişimi için açık pilot koşulları, gizlilik kontrolleri ve ayrı veri paylaşım anlaşması gerekir. Bu, varsayılan veri akışı değildir.",
        highlight: "Akademik işbirliği",
      },
    ],
  },
  faq: {
    eyebrow: "SSS",
    title: "Sık sorulanlar",
    description:
      "Sorunuz burada yoksa info@sismosmart.com adresine yazın, yanıtlarız. Tüm sorular SSS sayfasında.",
    items: [
      {
        title: "Bu cihaz beni depremden önce uyarır mı?",
        description:
          "Hayır. SismoSmart bir deprem erken uyarı servisi değildir ve önceden uyarı sözü vermez. Pilot çalışmaları cihaz üzerindeki algılama sonrasında düşük gecikmeli bildirimi değerlendirebilir; acil uyarılar için resmî kaynakları izleyin.",
      },
      {
        title: "Google'ın deprem uyarısından farkı ne?",
        description:
          "Google telefonların ivmeölçerini kullanıyor. Ücretsiz, herkeste var ve iyi de çalışıyor. Ama ölçtüğü şey depremin kaynağı, sizin binanız değil. Biz binanızı ölçüyoruz: nasıl titreşiyor, mevsimle nasıl değişiyor, depremden sonra hangi durumda. Bu soruların cevabı telefondan çıkmaz.",
      },
      {
        title: "Tek cihaz binamın güvenli olduğunu söyleyebilir mi?",
        description:
          "Söyleyemez. Bir binanın güvenli olup olmadığına mühendis karar verir. Cihaz, mühendisin dayanabileceği somut bir veri bırakır.",
      },
      {
        title: "Kurulumu zor mu?",
        description:
          "USB-C kabloyu prize takıyor, cihazı arkasındaki bantla duvara yapıştırıyor, sonra uygulamadan eşliyorsunuz. Matkap ya da teknisyen gerekmiyor; kurulum birkaç dakika sürüyor.",
      },
      {
        title: "Elektrik veya internet kesilirse ne olur?",
        description:
          "Mevcut tasarım, internet kesintisinde yerel tamponlama ve elektrik kesintisinde kısa süreli süperkapasitör köprüsü hedefliyor. Kesin süre ve uçtan uca aktarım davranışı donanım ve pilot testlerinde doğrulanacak.",
      },
      {
        title: "Ne zaman satışa çıkıyor?",
        description:
          "Kesinleşmiş bir genel satış tarihi yok. SismoSmart lansman öncesi aşamada; pilot kanıtı, donanım hazırlığı, sertifikasyon ve üretim takvimi tarihi belirleyecek. Onaylanmış güncellemeler için bültene kaydolabilirsiniz.",
      },
    ],
  },
  newsletter: {
    eyebrow: "Bize ulaşın",
    title: "Lansmandan önce konuşalım.",
    description:
      "Pilot olmak isteyen bir bina yönetimi, yatırımcı ya da kurum temsilcisiyseniz kısaca ne yapmak istediğinizi yazın. Sizi doğru kişiye yönlendirelim.",
    inputLabel: "E-posta",
    placeholder: "ad@kurum.com",
    button: "Gönder",
    consent:
      "SismoSmart lansman, pilot ve yatırımcı duyuruları için e-posta almayı kabul ediyorum.",
    note: "E-posta adresinizi yalnızca bu amaçla kullanırız.",
    loading: "Gönderiliyor...",
    success: "Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.",
    error: "Bir sorun oluştu. Lütfen tekrar deneyin.",
    missingEndpoint:
      "Form henüz bağlanmadı. info@sismosmart.com adresine doğrudan yazabilirsiniz.",
    rateLimited:
      "Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.",
  },
  footer: {
    legal: "SismoSmart. Tüm hakları saklıdır.",
  },
};
