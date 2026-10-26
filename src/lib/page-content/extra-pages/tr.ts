import { makeExtraPages } from "@/lib/page-content/extra-pages/shared";

export const trExtraPages = makeExtraPages({
  technology: {
    eyebrow: "Teknoloji",
    metaTitle: "Bina Hareketi için MEMS Sensörler | SismoSmart",
    metaDescription:
      "MEMS algılama, olay tamponlama ve bina hareketi analizine ilişkin lansman öncesi teknik özet; algılama ve performans pilotta doğrulanacak.",
    title: "MEMS sensörler bina hareketini nasıl ölçer?",
    description:
      "SismoSmart lansman öncesi bir ölçüm sistemidir. Bu sayfa algılama, olay kaydı ve raporlama için mevcut tasarım hedeflerini anlatır; pilot kanıtı bekleyen özellikleri mevcut kabiliyet gibi sunmaz.",
    sections: [
      ["MEMS ivmeölçer", "Mevcut tasarım ADXL355 sınıfı MEMS sensörü, üç eksende 250 Hz örnekleme ve belgelenmiş bir gürültü hedefi öngörüyor. Nihai sensör seçimi ve performans iddiaları için dondurulmuş malzeme listesi (BOM) ve tezgâh kanıtı gerekir."],
      ["STA/LTA algılama", "Cihaz son yarım saniyenin ortalamasını son otuz saniyenin ortalamasıyla karşılaştırıyor. Bu oran aniden büyüdüğünde olası bir olay işaretlenir. Yöntemin adı STA/LTA ve sismolojide standarttır. Pilot kalibrasyonunda sıradan bina gürültüsünü sarsıntıdan ayırmayı deniyoruz; saha doğrulaması bitene kadar yanlış ya da kaçırılmış algılama olabilir."],
      ["Yerel olay tamponu", "Bağlantı koptuğunda sınırlı bir hareket penceresini cihazda tutmayı tasarlıyoruz. Tampon süresi ve bağlantı geri geldiğinde verinin nasıl aktarılacağı uçtan uca pilotta doğrulanacak."],
      ["Bulut doğrulama", "Birden fazla cihazı eşleştirmek henüz bir hedef. Tetikleme penceresi, doğrulama kuralı ve yanlış alarma etkisi etiketli pilot verisiyle gösterilmeden doğrulanmış davranış olarak sunulmaz."],
      ["Yapı sağlığı takibi", "Ölçülen titreşim özelliklerindeki değişiklik zaman içinde mühendise ek kanıt sağlayabilir. Yöntem doğrulama aşamasındadır; hasar teşhisi yapmaz ve binanın güvenli olup olmadığını belirlemez."],
      ["Mühendis tarafındaki rapor", "Planlanan rapor ölçülen hareketi standart mühendislik büyüklükleriyle özetleyebilir. Kesin alanlar, belirsizlik sınırları ve yorumlama akışı pilot doğrulaması ve nitelikli inceleme sonrasında netleşecek."],
      ["Bağlantı", "Mevcut mimari ilk cihaz için Wi-Fi'yi hedefliyor. Hücresel veya LoRa bağlantısı yol haritasındadır ve devrede bir özellik olarak sunulmaz."],
      ["Güç", "Mevcut donanım tasarımı USB-C güç ve kısa süreli süperkapasitör köprüsü hedefliyor. Kesin süre ve olay aktarım davranışı tezgâh ve pilot doğrulaması gerektirir."],
      ["Sertifika", "Sertifikasyon planlanıyor, tamamlanmış değil. CE/RED, BTK, RoHS, WEEE, FCC veya başka bir onay yalnızca ilgili model ve pazar için belge oluştuğunda yayımlanacaktır."],
    ],
  },
  pilotProgram: {
    eyebrow: "Pilot program",
    metaTitle: "Pilot programı başvurusu",
    metaDescription:
      "Apartman, kampüs, fabrika ve araştırma binaları için pilot başvurusu. Kapsam, cihaz sayısı, süre ve ticari koşullar her saha için ayrıca belirlenir.",
    title: "Cihazı önce sizin binanızda görmek istiyoruz.",
    description:
      "Ürün henüz geniş satışta değil. Bu aşamada istediğimiz şey az sayıda ciddi saha ve dürüst geri bildirim. Aşağıdaki dört gruptan birine giriyorsanız sayfanın altındaki form giriş noktanız.",
    sections: [
      ["Apartmanlar", "Bir dairede bir cihazla başlıyoruz. Yönetim de katılırsa farklı katlara cihaz ekliyoruz. Kurulumda ve yönetimle koordinasyonda yardımcı oluyoruz."],
      ["Kampüsler ve fabrikalar", "Birden fazla bina, tek bir merkezi panel. Her bina kendi kaydını tutuyor. Kurulumdan önce bilgi işlem ekibinizle birlikte ağ topolojisini ve güvenlik gereksinimlerini gözden geçiriyoruz."],
      ["Belediye pilotları", "Mahalle ölçekli kurulum. Aynı depremin hangi bölgede daha şiddetli hissedildiğini gösteriyor. Kişisel veri bu akışın tamamen dışında kalıyor, yalnızca bina veya konum bazlı toplu veri paylaşılıyor."],
      ["Araştırma partnerleri", "Üniversitelerin deprem mühendisliği bölümleri. Ham verinin akademik analize açılması, geri bildirim ve ortak yayın imkânı karşılığında düşünülüyor; bunun için gizlilik ve veri paylaşım anlaşması gerekir. Bu akış henüz yok."],
      ["Size sunduklarımız", "Pilot kapsamı saha bazında belirlenir. Cihaz sayısı, süre, mülkiyet, destek ve ticari koşullar bu halka açık sayfada vaat edilmez; pilot anlaşmasında netleştirilir."],
      ["Sizden beklediklerimiz", "Kurulumu bina yönetimi veya çalışanlarla koordine etmeniz gerekiyor. Ayda yaklaşık on beş dakikalık bir geri bildirim görüşmesi yapıyoruz. Bir olay yaşanırsa kısa bir not düşmenizi rica ediyoruz. Pilot bitiminde kısa bir vaka çalışması yayımlamak istiyoruz; isterseniz kurum adını yazmadan, anonim olarak."],
      ["Başvurudan kuruluma", "Başvurular bina, erişim, ağ, gizlilik ve güvenlik koşullarıyla birlikte değerlendirilir. Takvim, anlaşma uzunluğu, sevkiyat ve kurulum adımları seçilen pilota göre doğrudan teyit edilir."],
    ],
  },
  investors: {
    eyebrow: "Yatırımcılar",
    metaTitle: "Yatırımcılar: SismoSmart tohum turu bilgi notu",
    metaDescription:
      "Lansman öncesi niteliksel yatırımcı özeti. Finansman, fiyatlama, yol haritası ve ticari varsayımların güncel hali değişebildiği için doğrudan görüşmede paylaşılır.",
    title: "Deprem sonrası hiç kimsenin ölçmediği bir aralık var.",
    description:
      "Türkiye'de büyük bir depremden sonra mühendis incelemesi haftalar sürüyor. O haftalarda aileler tahmin yürütüyor, işletmeler duruyor, sigorta süreçleri tıkanıyor. SismoSmart bu aralığı binanın kendi verisiyle kapatmaya çalışan bir donanım girişimi.",
    sections: [
      ["Problem", "Büyük depremler mühendis incelemelerinde yığılma yaratabilir. SismoSmart, sabit bina hareketi verisinin önceliklendirme için mühendise ek kanıt sağlayıp sağlayamayacağını araştırır; incelemenin yerini almaz ve güvenlik kararı vermez."],
      ["Neden şimdi", "Güncel MEMS sensörler ve bağlantılı gömülü donanım, daha düşük maliyetli sabit ölçümü geçmişe göre daha uygulanabilir kılıyor. Bileşen ekonomisi ve nihai donanım performansı tasarım dondurulana kadar varsayımdır."],
      ["Pazar", "İlk ticari odak Türkiye'dir. Sonraki pazarlar doğrulanmış talep, sertifikasyon, üretim ve yerel ortaklara bağlıdır; bu sayfa denetlenmemiş bir pazar büyüklüğünü güncel gerçek olarak yayımlamaz."],
      ["Ürün", "Donanım sürümleri, fiyatlama, abonelik ve birim ekonomi halen planlama varsayımlarıdır. Güncel ticari koşullar ve mali model, eski bir halka açık rakama sabitlenmek yerine nitelikli yatırımcılarla doğrudan paylaşılır."],
      ["Ekip", "Proje ürün/yazılım çalışmasını inşaat ve deprem mühendisliği girdisiyle birleştiriyor. Ekip yapısı ve danışmanlık ilişkileri değişebilir; güncel inceleme materyali yatırımcı görüşmesinde paylaşılır."],
      ["Rekabet", "İlgili alan resmî uyarı sistemlerini, telefon tabanlı uyarıları, profesyonel ölçüm cihazlarını ve diğer izleme ürünlerini kapsıyor. SismoSmart'ın hipotezi sabit bina ölçümü ve olay sonrası kanıt üretmek; farklılaşma hâlâ pazar ve pilot doğrulaması gerektiriyor."],
      ["Yol haritası", "Aktif sıra pilot doğrulaması, donanım/yazılım iyileştirmesi, kanıt incelemesi, sertifikasyon ve üretim hazırlığıdır. Lansman ancak bu kapılar karşılandığında gelir; bu sayfadaki hiçbir çeyrek teslim taahhüdü değildir."],
      ["Tohum turu", "Finansman miktarı, nakit ömrü, dağılım ve hibe/kredi varsayımları tarihli planlama girdileridir. Güncel yatırım şartları doğrudan paylaşılır; eski halka açık rakamlardan çıkarım yapılmamalıdır."],
      ["Aradığımız yatırımcılar", "Donanım girişimi görmüş melek yatırımcılar ve tohum aşaması fonları. Türkiye'de regülasyon, üretim ve sigorta ağına erişimi olan ortaklar bizim için hızlı paradan daha değerli. Ayrıntılı teknik dokümanı ve mali modeli gizlilik anlaşması altında paylaşıyoruz."],
    ],
  },
  faq: {
    eyebrow: "SSS",
    metaTitle: "Sık sorulan sorular",
    metaDescription:
      "Deprem uyarısı, bina güvenliği, veri, gizlilik, kurulum ve lansman takvimi hakkında doğrudan cevaplar.",
    title: "Sık sorulan sorular",
    description:
      "Deprem ürünleri kolayca fazla iddia eder. Biz cihazın sınırlarını görünür tutmaya çalışıyoruz. Cevabını burada bulamadığınız bir soru varsa info@sismosmart.com adresine yazın.",
    sections: [
      ["Bu cihaz beni depremden önce uyarır mı?", "Hayır. SismoSmart deprem erken uyarı servisi değildir ve önceden uyarı sözü vermez. Pilot çalışmaları cihaz üzerindeki algılama sonrası düşük gecikmeli bildirimi değerlendirebilir; acil uyarılar için resmî kaynakları izleyin."],
      ["Tek cihaz binamın güvenli olduğunu söyleyebilir mi?", "Söyleyemez. Bir binanın güvenli olup olmadığına mühendis karar verir. Cihaz, mühendisin dayanabileceği somut bir veri bırakır."],
      ["Hangi verileri topluyorsunuz?", "Titreşim ölçümleri, sıcaklık, nem, basınç ve cihazın kendi çalışma durumu. Kişisel bilgilerinizi cihazla ilişkilendirmiyoruz ve verinizi kimseye satmıyoruz. Ayrıntılar Gizlilik sayfasında."],
      ["Kesin konumum ortaya çıkıyor mu?", "Cihazınızın yaklaşık konumunu mahalle seviyesinde biliyoruz, çünkü bir olayı yakındaki cihazlarla eşleştirmek için bu gerekli. Daha hassas konum yalnızca açık bir pilot anlaşmasıyla paylaşılır."],
      ["Araştırmacılar verilerime erişebilir mi?", "Yalnızca veri anonimleştirildiğinde ve sizinle ayrıca anlaştığımızda. Şu anda böyle bir akış yok, yol haritasında duruyor."],
      ["Google'ın deprem uyarısından farkı ne?", "Google telefonların ivmeölçerini kullanıyor. Ücretsiz, herkeste var ve iyi de çalışıyor. Ama ölçtüğü şey depremin kaynağı, sizin binanız değil. Biz binanızı ölçüyoruz: nasıl titreşiyor, mevsimle nasıl değişiyor, depremden sonra hangi durumda. Bu soruların cevabı telefondan çıkmaz."],
      ["İnternet kesilince çalışmaya devam eder mi?", "Ağ kesintisinde yerel tamponlama tasarlanıyor. Pilot cihazın olayı tutup bağlantı sonrası aktarabilmesi doğrulanmış donanım, yazılım ve bağlantı yoluna bağlıdır."],
      ["Elektrik kesilince?", "Kısa süreli bir süperkapasitör köprüsü donanımda tasarlanıyor. Kesin süre ve kesinti sırasında olayın tamamlanması veya aktarılması tezgâh ve pilot kanıtı gerektirir."],
      ["Kurulumu zor mu?", "USB-C kabloyu prize takıyor, cihazı arkasındaki bantla duvara yapıştırıyor, sonra uygulamadan eşliyorsunuz. Matkap ya da teknisyen gerekmiyor; kurulum birkaç dakika sürüyor."],
      ["Bir binada kaç tane olmalı?", "Doğrulanmış evrensel bir cihaz sayısı yoktur. Pilot yerleşimi binaya, ölçüm amacına ve mühendislik incelemesine bağlıdır; çoklu cihaz düzeni saha bazında değerlendirilir."],
      ["PGA, PGV, MMI ne demek?", "PGA, PGV ve Modified Mercalli şiddeti standart deprem mühendisliği kavramlarıdır. Gelecekteki bir SismoSmart raporu ölçülen veya türetilen büyüklükleri ancak hesap yöntemi ve belirsizlik doğrulandıktan sonra kullanabilir."],
      ["Doğal frekans ne anlatır?", "Bir binanın doğal frekanslar dahil ölçülebilir titreşim özellikleri vardır. Değişimler mühendise ek kanıt sağlayabilir; tek başına hasar veya güvenlik sonucu değildir."],
      ["Cihaz hangi yöne bakmalı?", "Arka yüzünde bir yukarı oku var, o ok tavana baksın. Cihazın X ve Y eksenlerini binanın yatay yönleriyle hizalamaya çalışın. 90 derece yanlış takılırsa veri yine kullanılabilir ama bilgi değeri bir miktar düşer."],
      ["Cihaz konuşma kaydı yapıyor mu?", "Hayır. İçinde mikrofon yok, yalnızca zemin titreşimini ölçen bir ivmeölçer var. Konuşma ya da çevre sesi kaydetmek tamamen farklı bir sensör gerektirir."],
      ["Verilerim Türkiye dışına gidiyor mu?", "Pilot veri yerleşimi henüz kesinleşmedi. Cihaz verisi toplanmadan önce her pilot sözleşmesinde işleme konumları, aktarımlar, saklama süresi ve hukuki dayanak açıkça belirtilecek."],
      ["Ne zaman satışa çıkıyor?", "Kesinleşmiş bir genel satış tarihi yok. SismoSmart lansman öncesi aşamada; pilot kanıtı, donanım hazırlığı, sertifikasyon ve üretim takvimi tarihi belirleyecek."],
    ],
  },
  security: {
    eyebrow: "Güvenlik",
    metaTitle: "Güvenlik",
    metaDescription:
      "Web sitesi güvenliği, çerez onayı, cihaz verisi, şifreli aktarım ve pilot aşamasındaki gizlilik yaklaşımımız.",
    title: "Gerekmeyen veriyi hiç toplamamak en iyi koruma.",
    description:
      "Temel kuralımız bu. Şu anda yayında olan tek şey web sitesi, ama cihaz tarafında da aynı kuralla ilerliyoruz.",
    sections: [
      ["Varsayılan olarak az veri", "Canlı web sitesi şu anda yalnızca Gizlilik sayfasında açıklanan verileri toplar. Gelecekteki cihaz telemetrisi ürün ve politika tasarım alanıdır; pilot veri toplamadan önce açıkça belgelenecektir."],
      ["Analitikten önce onay", "Web analitiği yalnızca siz onay verdikten sonra yükleniyor. Bu tercihi alt bilgideki bağlantıdan istediğiniz zaman sıfırlayabilirsiniz."],
      ["Şifreli aktarım", "Web sitesi şu anda HTTPS ve güvenlik başlıkları kullanıyor. Cihaz şifrelemesi ve anahtar yaşam döngüsü, uygulanan protokol incelenip doğrulanana kadar hedef olarak kalıyor."],
      ["Tarayıcıya gizli anahtar gitmez", "Özel anahtarlar ve servis jetonları tarayıcıya inen kodda yer almaz. Korumalı sunucu tarafı yapılandırmasında tutulur."],
      ["Güvenlik açığı bildirimi", "Sitede ya da lansman öncesi materyallerde bir güvenlik sorunu bulursanız info@sismosmart.com adresine yazın. Sorumlu açıklama yapan araştırmacılara teşekkür ederiz."],
      ["Cihaz güvenlik planı", "İmzalı ürün yazılımı, şifreli depolama, cihaza özel anahtarlar ve geri alma destekli güncelleme tasarımı güvenlik hedefleridir. Uygulama ve inceleme kanıtı oluşmadan mevcut kabiliyet olarak yayımlanmaz."],
    ],
  },
});
