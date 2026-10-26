import type { BaseRoutePagesCopy } from "@/lib/page-copy";

export const trPages: BaseRoutePagesCopy = {
  product: {
    meta: {
      title: "Bina Deprem Sensörü ve Sismik İzleme Cihazı | SismoSmart",
      description:
        "Evler ve küçük binalar için lansman öncesi bina deprem sensörü ve sismik izleme cihazı; sarsıntı sırasında hareketi kaydetmek ve uzman incelemesini desteklemek için tasarlanıyor.",
    },
    eyebrow: "Ürün",
    title: "Evler ve küçük binalar için sismik izleme cihazı",
    description:
      "Duvara sabitlenen, USB-C ile beslenen lansman öncesi bir cihaz. Sensör seçimi, bağlantı, raporlama ve performans pilot doğrulaması bitene kadar hedef olarak kalıyor.",
    deviceDescription:
      "Pilot kasa duvara sabitlenmek ve USB-C ile beslenmek üzere tasarlanıyor. Nihai montaj donanımı ve yönergeleri doğrulanmış cihazla birlikte kesinleşecek.",
    meterTopLabel: "Sensör",
    meterTopValue: "ADXL355 sınıfı hedef",
    meterBottomLabel: "Veri",
    meterBottomValue: "Güvenlik hedefi",
    imageAlt: "SismoSmart sismik izleme cihazı, ön yüz",
    specs: [
      { label: "Sensör", value: "ADXL355 sınıfı tasarım hedefi" },
      { label: "Bağlantı", value: "Wi-Fi + Bluetooth hedefi" },
      { label: "Kurulum", value: "Pilot kurulum hedefi" },
      { label: "Durum göstergesi", value: "RGB LED + uygulama hedefi" },
    ],
    useCases: [
      {
        title: "Evler ve apartmanlar",
        description:
          "Sabit bina hareketi kaydı için aday pilot ortamlarıdır; cihaz yerleşimi her bina için ayrıca belirlenir.",
      },
      {
        title: "Kampüsler ve fabrikalar",
        description:
          "Çok binalı pilotlar, cihaz ve panel yolu doğrulandıktan sonra merkezi görünürlüğü değerlendirebilir.",
      },
      {
        title: "Atölyeler ve ofisler",
        description:
          "Küçük bina kullanımı pilot hipotezinin parçasıdır; doğrulanmış ticari kurulum olarak sunulmaz.",
      },
      {
        title: "Üniversite ortaklıkları",
        description:
          "Araştırma erişimi açık anlaşma, gizlilik kontrolü ve tanımlı veri paylaşım amacı gerektirir.",
      },
    ],
    comparisonTitle: "Diğer çözümlerle karşılaştırma",
    comparisonDescription:
      "SismoSmart, yalnızca telefonla yapılan ölçüm ile profesyonel enstrümantasyon arasında sabit, binaya bağlı bir ölçüm cihazı olarak tasarlanıyor. Hassasiyet, raporlama ve maliyet karşılaştırmaları doğrulama veya ticari varsayımdır.",
    comparisonRows: [
      {
        label: "Kurulum",
        sismosmart: "Pilot süreci",
        traditional: "Profesyonel kurulum değişir",
        mobile: "Uygulama kurulumu",
      },
      {
        label: "Sabit cihaz",
        sismosmart: "Tasarım hedefi: binaya sabit",
        traditional: "Var",
        mobile: "Yok, telefon hareket eder",
      },
      {
        label: "Yapısal yorum",
        sismosmart: "Doğrulama bekliyor",
        traditional: "Nitelikli uzman süreci",
        mobile: "Bina değerlendirmesi değildir",
      },
      {
        label: "Fiyat",
        sismosmart: "Lansman öncesi; halka açık fiyat yok",
        traditional: "Profesyonel sistem fiyatlaması",
        mobile: "Çoğu zaman ücretsiz",
      },
    ],
    ctaLabel: "Pilot için başvur",
    ctaHref: "/pilot-program",
  },
  howItWorks: {
    meta: {
      title: "Bina Hareketi Nasıl Ölçülür? | SismoSmart",
      description:
        "Lansman öncesi SismoSmart tasarımının bina hareketini ölçme, olay verisini tamponlama ve pilot doğrulama ile nitelikli inceleme için bilgi hazırlama yaklaşımı.",
    },
    eyebrow: "Nasıl çalışır",
    title: "SismoSmart bina hareketini nasıl ölçer ve rapora dönüştürür?",
    description:
      "Mevcut tasarım üç parçadan oluşuyor: yerel ölçüm, bağlantılı veri yolu ve uygulama/rapor katmanı. Algılama, bildirim, bulut eşleştirmesi ve rapor davranışı pilotta doğrulanacak.",
    flow: [
      {
        title: "Cihazı yerleştirin",
        description:
          "Pilot yerleşimi bina ve ölçüm amacı dikkate alınarak sabit bir iç yüzeyde belirlenir.",
      },
      {
        title: "Telefonla eşleyin",
        description:
          "Bluetooth ve Wi-Fi ile tanımlama tasarlanıyor; üretim güvenlik akışı uygulama incelemesinden sonra kesinleşecek.",
      },
      {
        title: "Taban çizgisini oluşturur",
        description:
          "Pilot kalibrasyonu gündelik titreşimi kaydetmeyi ve sıra dışı hareketin normal gürültüden ayrılıp ayrılamadığını test etmeyi hedefler.",
      },
      {
        title: "Olayı kaydeder",
        description:
          "Tasarım yerel olay kaydı ve daha sonra uygulama/rapor görünümü hedefler. Bildirim süresi ve rapor bütünlüğü doğrulama maddesidir.",
      },
    ],
    signals: [
      {
        title: "Cihaz üzerinde algılama",
        description:
          "Cihaz üzerinde algılama tasarlanıyor. Eşikler, yanlış ya da kaçırılmış olaylar ve bildirim güvenilirliği için etiketli pilot kanıtı gerekiyor.",
      },
      {
        title: "Olay sonrası rapor",
        description:
          "Gelecekteki rapor doğrulanmış ölçüm büyüklüklerini nitelikli inceleme için özetleyebilir. Bina güvenliği kararı vermez.",
      },
      {
        title: "Yalnız gerekli veri",
        description:
          "Canlı web sitesi veri akışı ayrı olarak belgelenmiştir. Gelecekteki cihaz telemetrisi, saklama ve işleme pilot veri toplamadan önce tanımlanır.",
      },
    ],
    network: [
      {
        title: "Çoklu cihaz korelasyonu",
        description:
          "Cihazların birbirini doğrulaması henüz bir hedef. Süreye ve yanlış alarma faydası pilot kanıtıyla gösterilmedi.",
      },
      {
        title: "Zaman içinde yapısal kanıt",
        description:
          "Ölçülen titreşim özelliklerindeki değişiklik mühendise ek kanıt sağlayabilir; teşhis değildir.",
      },
      {
        title: "Sade arayüz",
        description:
          "Kısa bir cihaz/uygulama durum görünümü planlıyoruz. Nihai durumlar ve eşikler doğrulanmış davranışa bağlı.",
      },
    ],
  },
  about: {
    meta: {
      title: "SismoSmart Hakkında",
      description:
        "SismoSmart'ı kim, neden geliştiriyor. 2023 depremlerinden sonra Türkiye'de kurulan ekip ve pilot doğrulama süreci. Cihazı kendi evimizde test ediyoruz.",
    },
    eyebrow: "Hakkımızda",
    title: "Biz de bu binalarda oturuyoruz.",
    description:
      "2023 Kahramanmaraş depremlerinden ve İstanbul çevresindeki son sarsıntılardan sonra bir araya geldik. Kendi evimizin depreme nasıl tepki verdiğini bilmek istedik. Bunu ölçen bir cihaz bulamayınca yapmaya karar verdik.",
    story: [
      "Türkiye'de büyük bir depremden sonra binaların kontrol edilmesi haftalar, bazen aylar sürüyor. O süre boyunca aileler evlerine girip giremeyeceklerini bilmiyor.",
      "Bu süreyi tamamen ortadan kaldıramayız, sonunda binaya bir mühendisin girmesi şart. Ama mühendis gelmeden önce hangi binanın öncelikli olduğunu gösteren bir veri katmanı kurulabilir. Uğraştığımız şey bu.",
      "Ekipte akademik danışman olarak bir inşaat mühendisi, iki yüksek lisans inşaat mühendisi ve gömülü yazılımla ilgilenen bir kurucu var. Hepimiz Türkiye'de oturuyoruz ve cihazı önce kendi evimizde deniyoruz.",
    ],
    principles: [
      {
        title: "Korkutmadan bilgi ver",
        description:
          "Afet pazarlaması yapmıyoruz. Amacımız panik değil hazırlık üretmek, o yüzden metinlerde büyük harfli uyarılar ya da geri sayımlar göremezsiniz.",
      },
      {
        title: "Sınırlarımızı söyle",
        description:
          "Cihazın neyi ölçemediğini de yazıyoruz. Bir özelliği abartmaktansa eksik olduğunu söylemeyi tercih ediyoruz.",
      },
      {
        title: "Veriyi sahibine geri ver",
        description:
          "Kendi binanızın verisi sizindir. Anonimleştirilmiş toplu veriyi akademiyle veya kamu kurumlarıyla paylaşabiliriz. Kişisel veriyi satmıyoruz.",
      },
    ],
    timeline: [
      { period: "Tamamlandı", title: "Ürün ve sistem temeli", description: "İlk ürün fikri ve sistem mimarisi oluşturuldu. Herkese açık iddialar kanıt kaydındaki sınırlarla yönetiliyor." },
      { period: "Şimdi", title: "Pilot doğrulaması", description: "Donanım, algılama, bildirim, bağlantı ve raporlama hedefleri daha geniş iddialardan önce doğrulanıyor." },
      { period: "Sonraki", title: "Kanıt ve tasarım dondurma", description: "Malzeme listesi (BOM), algoritmalar ve işletim varsayımları ancak tezgâh ve saha kanıtı incelendikten sonra dondurulacak." },
      { period: "Daha sonra", title: "Sertifikasyon ve üretim", description: "Sertifikasyon, üretim ve lansman kanıt kapılarından sonra gelir. Herkese açık bir teslim tarihi taahhüt edilmiyor." },
    ],
    team: [
      {
        name: "Kurucu",
        role: "Donanım, yazılım, ürün",
        bio: "Gömülü sistemler, IoT, bulut altyapısı ve ürün tarafından sorumlu.",
      },
      {
        name: "Akademik danışman",
        role: "Deprem mühendisliği",
        bio: "İnşaat mühendisliği doktoralı. Yapı sağlığı izleme (SHM) algoritmalarının bilimsel doğrulamasını yürütüyor.",
      },
      {
        name: "İnşaat mühendisleri",
        role: "Yapı sağlığı ve pilot saha",
        bio: "İki yüksek lisans inşaat mühendisi. Algoritmaların yapı tarafını ve pilot sahadaki doğrulamayı üstleniyorlar.",
      },
    ],
  },
  contact: {
    meta: {
      title: "SismoSmart İletişim",
      description:
        "Ürün soruları, pilot başvurusu, basın veya yatırımcı görüşmeleri için SismoSmart ekibine ulaşın. En hızlı kanal e-posta.",
    },
    eyebrow: "İletişim",
    title: "Yazın, döneriz.",
    description:
      "Bu aşamada en hızlı kanal e-posta. Konu başlığını net yazarsanız mesajınız doğru kişiye ulaşır.",
    channels: [
      {
        title: "Genel",
        description: "Ürün hakkında sorular, pilot başvurusu, satın alma ilgisi",
        value: "info@sismosmart.com",
        href: "mailto:info@sismosmart.com",
      },
      {
        title: "Basın",
        description: "Röportaj, basın kiti, kurum işbirliği",
        value: "press@sismosmart.com",
        href: "mailto:press@sismosmart.com",
      },
      {
        title: "LinkedIn",
        description: "Profesyonel takip ve şirket güncellemeleri",
        value: "linkedin.com/company/sismosmart",
        href: "https://www.linkedin.com/company/sismosmart",
      },
    ],
    form: {
      nameLabel: "Adınız",
      emailLabel: "E-posta",
      subjectLabel: "Konu",
      messageLabel: "Mesajınız",
      buttonLabel: "Gönder",
      consentLabel:
        "Mesajımı değerlendirebilmeniz için bu bilgilerin işlenmesini kabul ediyorum.",
      note: "Bilgileriniz sadece bu mesaja yanıt vermek için kullanılır.",
      loadingLabel: "Gönderiliyor...",
      successMessage: "Mesajınız gönderildi. En kısa sürede dönüş yaparız.",
      errorMessage: "Bir sorun oluştu. Lütfen tekrar deneyin.",
      missingEndpointMessage:
        "Form henüz bağlı değil. Lütfen info@sismosmart.com adresine yazın.",
      rateLimitedMessage:
        "Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.",
    },
  },
  privacy: {
    meta: {
      title: "Gizlilik",
      description:
        "Hangi veriyi topluyoruz, ne için kullanıyoruz, kimlerle paylaşıyoruz. Hepsi bu sayfada yazıyor.",
    },
    eyebrow: "Gizlilik",
    title: "Gizlilik politikası",
    description:
      "İhtiyacımız olmayan veriyi toplamıyoruz. Topladığımızı da yalnızca burada yazdığımız amaçlar için kullanıyoruz ve kimseye satmıyoruz.",
    sections: [
      {
        title: "Topladığımız veriler",
        description:
          "Canlı web sitesinde: bültene kaydolduğunuz e-posta adresi, iletişim formunda verdiğiniz bilgiler ve çerez tercihleriniz. Planlanan pilot cihaz verisi hareket ve çevresel ölçümleri, cihaz durumu ve yaklaşık konumu içerebilir; kesin veri kategorileri toplamadan önce belgelenir.",
      },
      {
        title: "Ne için kullanıyoruz",
        description:
          "Mevcut web sitesi verisini mesajlara yanıt vermek, pilot başvurularını değerlendirmek ve onay verdiğiniz duyuruları göndermek için kullanıyoruz. Gelecekteki cihaz verisinin amaçları pilot veri toplamadan önce anlaşmada tanımlanır.",
      },
      {
        title: "Kimlerle paylaşıyoruz",
        description:
          "Form gönderimleri yapılandırılmış form sağlayıcısından geçebilir. Gelecekteki cihaz işleyicileri, işleme yerleri, aktarımlar ve saklama süresi pilot verisi toplanmadan önce belirlenir. Kişisel veriyi reklam veya satış amacıyla üçüncü taraflara aktarmıyoruz.",
      },
      {
        title: "Haklarınız",
        description:
          "Verilerinize erişme, düzeltme, silme ve taşıma haklarınız var. KVKK ve GDPR kapsamındaki talepleriniz için info@sismosmart.com adresine yazabilirsiniz.",
      },
    ],
  },
  terms: {
    meta: {
      title: "Kullanım koşulları",
      description:
        "Web sitesinin ve lansman öncesi paylaşılan bilgilerin kullanımına dair temel koşullar.",
    },
    eyebrow: "Koşullar",
    title: "Kullanım koşulları",
    description:
      "Site henüz lansman öncesi. Aşağıdaki maddeler bu aşama için geçerli.",
    sections: [
      {
        title: "Bilgi amaçlı",
        description:
          "Bu site SismoSmart ürünü hakkında bilgi verir ve pilot başvurusu kabul eder. Resmî bir sismolojik hizmet ya da deprem uyarı kanalı değildir.",
      },
      {
        title: "Garanti değildir",
        description:
          "Cihazı olay sonrası hazırlık ve incelemeyi desteklemek için geliştiriyoruz. Resmî uyarı sistemlerinin, acil durum talimatlarının veya yapı mühendisi raporunun yerine geçmez.",
      },
      {
        title: "Fikri mülkiyet",
        description:
          "SismoSmart adı, logosu, ürün tasarımı ve site içeriği SismoSmart'a aittir. İzinsiz çoğaltılamaz.",
      },
      {
        title: "İletişim",
        description: "Sorularınız için info@sismosmart.com.",
      },
    ],
  },
  press: {
    meta: {
      title: "Basın kiti",
      description: "SismoSmart hakkında basın için bilgiler, görseller ve iletişim.",
    },
    eyebrow: "Basın",
    title: "Basın kiti",
    description:
      "Medya, partner kurumlar ve röportaj talepleri için tek sayfalık kaynak.",
    sections: [
      {
        title: "Kısa tanım",
        description:
          "SismoSmart, evler ve küçük binalar için lansman öncesi bir sismik izleme cihazı geliştiriyor. Amaç bina hareketini kaydedip nitelikli olay sonrası incelemeye veri sağlamak; pilot doğrulaması, sertifikasyon ve üretim lansman takvimini belirleyecek.",
      },
      {
        title: "Basın iletişimi",
        description:
          "Röportaj, basın görseli ve demo talepleri için press@sismosmart.com.",
      },
    ],
    links: [
      {
        title: "Logo",
        description: "SVG vektör logo",
        href: "/logo-symbol.svg",
      },
      {
        title: "Ürün fotoğrafı",
        description: "Cihazın yüksek çözünürlüklü görseli",
        href: "/images/device/sismosmart-device-front.png",
      },
      {
        title: "Sosyal medya görseli",
        description: "1200x630 paylaşım kartı",
        href: "/images/og/sismosmart-og.png",
      },
    ],
  },
};
