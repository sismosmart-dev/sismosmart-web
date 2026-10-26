# İçerik ton ve yazım kılavuzu

Bu kılavuz SismoSmart sitesindeki tüm metinler için geçerlidir. Türkçe kaynak dildir: metin önce Türkçe yazılır, diğer diller ona hizalanır. Amaç, çeviri gibi değil, konuyu bilen bir insanın yazdığı gibi okunmasıdır.

## Ses

Ürün bir ölçüm aleti, bir korku pazarlaması aracı değil. Metin sakin, somut ve iddialı olmayan bir mühendis gibi konuşur. Bilmediğimiz şeyi bilmiyoruz deriz, yapamadığımız şeyi yapamıyoruz deriz.

Hitap `siz` biçimindedir. Resmî ama bürokratik değil: `-maktadır`, `-mektedir` kullanılmaz. `tasarlanmıştır` yerine `tasarladık` ya da `öyle tasarlandı`.

## Kaçınılacak kalıplar

Bu kalıplar metne yapay bir tat veriyor ve şu an sitede fazlasıyla var.

**Uzun tire (—) kullanılmaz.** Yerine nokta, virgül veya iki nokta gelir. Sayı aralıklarında düz tire kullanılır: `30-60 saniye`.

**Üçlü ritim.** `Matkap yok, kablo yok, teknisyen yok` gibi üç öğeli simetrik diziler bir imza gibi tekrarlanıyor. Gerçekten üç şey varsa üçünü de yazın, ama cümleyi süslemek için üçe tamamlamayın. Sayfa başına en fazla bir tane.

**"X değil. Y." başlıkları.** `Bir alarm değil.` / `Düz cevaplar. Pazarlama dili yok.` / `Az veri topla. Kalanı koru.` Dört ayrı sayfa başlığı bu kalıpta olduğu için tek bir kalemden çıktığı belli oluyor. Başlık düz bir cümle olsun.

**Eşit uzunlukta maddeler.** Altı özellik maddesinin altısının da aynı uzunlukta olması insan yazısında olmayan bir düzenliliktir. Cümle uzunluğu değişsin.

**Aşırı işlenmiş mecazlar.** `Cihaz konuşur` mecazı arka arkaya iki cümlede kullanılmıştı. Bir mecaz bir kez kullanılır.

## Terminoloji

| Terim | Kullanım |
| --- | --- |
| `bildirim` | Uygulamadan gelen push bildirim. Varsayılan kelime budur. |
| `uyarı` | Yalnızca resmî uyarı sistemleri bağlamında (AFAD, devlet). Kendimizi `erken uyarı sistemi` olarak tanıtmıyoruz. |
| `alarm` | Yalnızca `yanlış alarm` ifadesinde. |
| `sarsıntı` | Deprem olayının kendisi. |
| `titreşim` | Cihazın ölçtüğü sinyal, binanın gündelik hareketi. |
| `cihaz` | Ürün. `sensör` yalnızca içindeki MEMS bileşeni için. |
| `istasyon` | Yalnızca profesyonel sismik istasyonlarla karşılaştırma yaparken. |
| `Çök, Kapan, Tutun` | AFAD'ın resmî protokol adı. Olduğu gibi, büyük harfle yazılır. |

Türkçe metinde İngilizce bırakılmaz: `embedded` yerine `gömülü yazılım`, `runway` yerine `nakit ömrü`, `deck` yerine `sunum`, `pivot` yerine `yön değişikliği`, `check-in` yerine `düzenli görüşme`. `MEMS`, `LoRa`, `SHM` gibi yerleşik teknik kısaltmalar kalır ama ilk geçtikleri yerde bir kez açıklanır.

## Güncellik ve kanıt

Public içerikte takvim, fiyat, pilot kapsamı, performans, sertifika, yatırım veya ürün özelliği gibi değişebilir bilgiler güncel kanıt olmadan kesin gerçek gibi yazılmaz.

- Tarihi geçmiş bir yol haritası maddesi otomatik olarak gerçekleşmiş sayılmaz. Kanıt yoksa tarih kaldırılır ve durum `şimdi`, `sonraki`, `daha sonra` gibi doğrulanabilir aşamalarla anlatılır.
- Donanım, algılama, bildirim, bağlantı, yapı sağlığı yorumu, cihaz güvenliği ve sertifikasyon iddiaları `docs/governance/technical-claims-register.md` içindeki Evidence status ve Approved wording sınırına uyar.
- Fiyat, abonelik, pazar büyüklüğü, yatırım turu, nakit ömrü, hibe ve üretim adedi gibi ticari rakamlar yalnız güncel, tarihli ve sahibi belli bir kaynak varsa public metne girer. Aksi halde güncel bilgi doğrudan görüşmeye yönlendirilir.
- `design target`, `planned`, `validation pending`, `may` gibi belirsizlik ifadeleri çeviride kesinliğe dönüşmez.
- Belirsizlik ifadesi her etikette ve cümlede tekrarlanmaz. Bir bölümde bir kez, kapsamı açıkça söyleyen bir cümleyle yazılır. Kısa etiketler, madde başlıkları ve rakam taşımayan satırlar sade kalır. `hedef`, `tabidir`, `doğrulama bekliyor` gibi kalıplar sayfa başına birkaç kez geçiyorsa metin ezber disklaymer gibi okunur.
- Yeni bir locale eklenirken yüksek etkili iddialar dil akıcılığı yanında kanıt modalitesi açısından da gözden geçirilir.

Editoryal metin önce Türkçe hazırlanır. Claims register'daki yüksek etkili iddialar için İngilizce onaylı kontrol wording'i kanıt referansıdır; diğer locale'ler aynı kesinlik seviyesini korur.

## Yazım

Düz kesme işareti kullanılır (`'`), eğri değil (`'`). Özel ada gelen ek kesme işaretiyle ayrılır: `SismoSmart'ı`, `Türkiye'de`.

Ünlem işareti kullanılmaz. Emoji kullanılmaz. Metin içinde markdown kalın işareti (`**`) kullanılmaz.

## Tekrar

Aynı cümle iki yerde görünmez. Şu tekrarlar bilinçli olarak kırıldı ve tekrar oluşturulmamalı:

- Ana sayfa SSS bölümü, SSS sayfasının kısaltılmış bir kopyası değildir. Ana sayfada yalnızca en sık sorulan altı soru bulunur, tam liste SSS sayfasındadır.
- Alt bilgi, hero başlığını ve açıklamasını tekrar basmaz, kendi kısa tanıtım cümlesi vardır.
- Ürün sayfasında sayfa açıklaması bir kez görünür.

## Sınır ifadeleri

Ürünün yapamadıklarını söylemek doğru, ama bunu her sayfada aynı cümleyle söylemek yapay duruyor. `Mühendis incelemesinin yerine geçmez` cümlesi sitede bir kez, ürün sayfasındaki sınırlar bölümünde yer alır. Diğer yerlerde aynı fikir gerekiyorsa o bağlama özgü bir cümleyle yazılır.
