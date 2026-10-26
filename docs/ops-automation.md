# Ops automation

Bu repo, pazarlama ve analitik operasyonlarını panelden bağımsız yönetebilmek için küçük bir operasyon katmanı içerir. Katman production-only Doppler modeline göre çalışır: komutlar `prd_ops` yapılandırmasıyla, proje ve config açıkça seçilerek çalıştırılır. Yapılandırma modeli için [`docs/secrets-and-observability.md`](secrets-and-observability.md) dosyasına bakın.

## Komutlar

Her komut `node scripts/doppler/run.mjs prd_ops --` ön ekiyle çalışır. Çıplak `npm run ops:*` veya çıplak `doppler run` kullanmayın.

```bash
npm run doppler:ops:status
node scripts/doppler/run.mjs prd_ops -- npm run ops:ga -- status
node scripts/doppler/run.mjs prd_ops -- npm run ops:gtm -- status
node scripts/doppler/run.mjs prd_ops -- npm run ops:search-console -- status
node scripts/doppler/run.mjs prd_ops -- npm run ops:clarity -- status
```

`doppler:ops:status` salt okunur durum özetini verir. Diğer örnekler de yalnızca durum okur. Aşağıdaki `create-*`, `publish-*` ve `bootstrap-domain` komutları dış sistemde değişiklik yapar; yalnızca yetkili bir operatör, bilinçli olarak çalıştırmalıdır.

## Google kimlik doğrulaması

İki yol desteklenir:

1. OAuth refresh token
2. Service account

`GOOGLE_AUTH_MODE=auto` ile varsayılan davranış önce OAuth'u, o yoksa service account'u kullanmaktır. OAuth, GA, GTM ve Search Console'u aynı kullanıcı hesabıyla birlikte yönetmek için daha rahattır.

Gerekli alan adları `.env.example` içinde değersiz olarak listelenir ve [`config/doppler-contract.mjs`](../config/doppler-contract.mjs) dosyasında `prd_ops` yapılandırmasına bağlanır: `GOOGLE_AUTH_MODE`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_OAUTH_REFRESH_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`, `GOOGLE_SERVICE_ACCOUNT_JSON`. Değerler yalnızca Doppler'da tutulur; yerel dosyaya, GitHub'a veya log'a yazılmaz.

### Refresh token alma

Yetkili operatör, tek seferlik refresh token'ı yardımcı komutla alabilir:

```bash
node scripts/doppler/run.mjs prd_ops -- npm run ops:google-auth -- listen
```

Komut yerel bir callback sunucusu açar, Google izin URL'sini terminale (gizli değerleri maskeleyerek) yazar ve tarayıcıdan onay verildiğinde callback'i yakalar. Yalnızca URL görmek için `-- url` kullanılır.

Alınan refresh token yerel dosyaya yazılmaz ve terminale basılmaz. Yardımcı komut değeri Doppler CLI'a stdin ile verir ve `sismosmart-web` projesinin `prd_ops` yapılandırmasındaki `GOOGLE_OAUTH_REFRESH_TOKEN` alanına kaydeder. Bunun için yetkili bir Doppler oturumu ve `prd_ops` yazma izni gerekir. Kayıt başarılı olursa çıktıda `saved-to-doppler-prd_ops` yazar; başarısız olursa çıktıdaki uyarıyı izleyip akışı yeniden çalıştırın. Hiçbir durumda kalıcı `.env` oluşturmayın ve değeri GitHub'a veya log'a yapıştırmayın.

## Google Analytics

```bash
node scripts/doppler/run.mjs prd_ops -- npm run ops:ga -- list-accounts
node scripts/doppler/run.mjs prd_ops -- npm run ops:ga -- list-properties 123456789
node scripts/doppler/run.mjs prd_ops -- npm run ops:ga -- list-web-streams 987654321
node scripts/doppler/run.mjs prd_ops -- npm run ops:ga -- create-property 123456789 "SismoSmart"
node scripts/doppler/run.mjs prd_ops -- npm run ops:ga -- create-web-stream 987654321 https://sismosmart.com/ "SismoSmart Website"
node scripts/doppler/run.mjs prd_ops -- npm run ops:ga -- create-measurement-secret 987654321 1234567890 "SismoSmart automation"
```

## Google Tag Manager

```bash
node scripts/doppler/run.mjs prd_ops -- npm run ops:gtm -- list-accounts
node scripts/doppler/run.mjs prd_ops -- npm run ops:gtm -- list-containers 123456
node scripts/doppler/run.mjs prd_ops -- npm run ops:gtm -- list-workspaces 123456 987654
node scripts/doppler/run.mjs prd_ops -- npm run ops:gtm -- create-workspace 123456 987654 "Automation Workspace"
node scripts/doppler/run.mjs prd_ops -- npm run ops:gtm -- create-version 123456 987654 3 "Automated publish"
node scripts/doppler/run.mjs prd_ops -- npm run ops:gtm -- publish-version accounts/123456/containers/987654/versions/12
```

Not:

- Bu repo şimdilik GTM workspace, version ve publish akışlarını otomatikleştirir.
- Tag/trigger şablonu otomasyonu container kurallarına göre değiştiği için bilinçli olarak dar tutuldu.

## Search Console ve Site Verification

```bash
node scripts/doppler/run.mjs prd_ops -- npm run ops:search-console -- list-sites
node scripts/doppler/run.mjs prd_ops -- npm run ops:search-console -- generate-token sismosmart.com
node scripts/doppler/run.mjs prd_ops -- npm run ops:search-console -- verify-domain sismosmart.com
node scripts/doppler/run.mjs prd_ops -- npm run ops:search-console -- submit-sitemap sc-domain:sismosmart.com https://sismosmart.com/sitemap.xml
node scripts/doppler/run.mjs prd_ops -- npm run ops:search-console -- bootstrap-domain sismosmart.com --verify
```

`bootstrap-domain` şunları yapar:

1. Google Site Verification için DNS TXT token üretir.
2. cPanel API erişimi varsa TXT kaydını zone dosyasına ekler.
3. `--verify` verilirse domain doğrulamasını dener.
4. Search Console property ekler.
5. Sitemap gönderir.

## Clarity

```bash
node scripts/doppler/run.mjs prd_ops -- npm run ops:clarity -- status
node scripts/doppler/run.mjs prd_ops -- npm run ops:clarity -- api-surface
```

Clarity tarafında şu ayrımı bilerek koruyoruz:

- Otomatik yapılabilenler: client API, consent, identify, custom tags, export hazırlığı.
- Hâlâ panel gerektirenler: proje oluşturma, ilk tracking code üretimi, ekip yetkileri.

Bu yüzden Clarity betiği şimdilik daha çok durum görünürlüğü ve sınırların netleşmesi için var.
