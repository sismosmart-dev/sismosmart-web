# SismoSmart Web

SismoSmart'ın çok dilli web uygulaması, herkese açık form API'leri, makinelerin okuyabileceği keşif yüzeyleri ve GitHub tabanlı production otomasyonları.

**Canlı site:** https://sismosmart.com

SismoSmart, evler ve küçük binalar için lansman öncesi bir sismik izleme cihazı geliştiriyor. Sitedeki içerik ürünü acil durum servisi, resmî erken uyarı sistemi ya da bina güvenliğine karar veren bir sistem olarak sunmaz. Donanım, algılama, bildirim, bağlantı, performans, güvenlik ve sertifikasyon ayrıntıları yalnızca kanıt düzeyinin izin verdiği ölçüde yayımlanır.

## Public içerik modeli

Site `Next.js + TypeScript + Tailwind CSS` ile çalışır ve `tr`, `en`, `es`, `id`, `pt`, `it` locale'lerini sunar. Sitedeki metinler `src/lib/content` ve `src/lib/page-content` altında tutulur. Türkçe editoryal kaynak dildir; yüksek etkili iddialar ayrıca [`docs/governance/technical-claims-register.md`](docs/governance/technical-claims-register.md) tarafından yönetilir.

İngilizce ve Türkçe rehberler `src/lib/guides` altındadır. Canonical URL, hreflang, sitemap, structured data ve Markdown alternatifleri aynı public kaynak içerikle hizalı kalmalıdır.

## İnsanlar ve agent'lar için keşif

Public HTML yanında:

- `/llms.txt` ve `/llms-full.txt`
- `/sitemap.xml` ve `/sitemap.md`
- locale/sayfa bazlı `.md` alternatifleri
- `/openapi.json` public contact/waitlist API sözleşmesi
- `/AGENTS.md` public agent/repository rehberi

yayımlanır. HTML sayfaları canonical, hreflang, Markdown alternatifi ve `/llms.txt` discovery ilişkisini taşır. Agent'lara yönelik içerik, insanlara gösterilen herkese açık bilgilerden daha güçlü bir iddia içeremez.

## İçerik ve güvenlik sınırları

- SismoSmart bir acil durum servisi veya resmî erken uyarı sistemi değildir.
- Cihaz bir binanın güvenli veya güvensiz olduğuna karar vermez.
- Pilot doğrulaması bekleyen özellikler `design target`, `planned`, `validation pending` veya eşdeğer modaliteyle yazılır.
- Tarihi geçmiş yol haritası, fiyat, yatırım, pilot veya sertifikasyon varsayımları güncel gerçek gibi yayımlanmaz.
- Cihaz verisi, veri yerleşimi, araştırma erişimi ve cihaz güvenliği uygulanmış/onaylanmış olmadıkça gelecek veya koşullu akış olarak anlatılır.
- Herkese açık repoya secret, müşteri verisi, origin adresi ya da özel operasyon kanıtı girmez.

Yazım için [`docs/content-style-guide.md`](docs/content-style-guide.md), kanıt sınıfları için claims register esas alınır.

## Yerel geliştirme

Bağımlılıkları kurup geliştirme sunucusunu başlatın:

```bash
nvm use
npm ci
npm run dev
```

Varsayılan İngilizce locale'i yerelde `http://localhost:3000/en` adresinden açabilirsiniz. Kök yol locale yönlendirmesini test etmek için `http://localhost:3000` kullanılır.

## Geliştirme ve kalite kapıları

```bash
nvm use
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
npm run test:browser
```

Production build/CI kalıcı yerel secret akışı kullanmaz. Canonical configuration boundary Doppler'dır:

```bash
npm run doppler:ci
```

`.env.example` yalnız boş değerli public schema'dır. `.env`, credential, token, key, cookie, generated deploy bundle veya private infrastructure export commit edilmez.

## Mimari özet

- `src/app` - App Router, public route handler'lar, machine-readable routes
- `src/components` - UI/interaction bileşenleri
- `src/lib` - localized content, guides, metadata, structured data, public contracts
- `src/app/api/_lib` - server-only form validation/forwarding
- `scripts` - deploy, health, browser-quality ve ops araçları
- `tests` - repository, security, browser, deploy, content, SEO ve discovery contracts
- `.github/workflows` - tek CI/CD ve repository automation control plane'i
- `docs` - current runbook/governance belgeleri ve tarihsel `docs/superpowers` kayıtları

Tarihsel `docs/superpowers` dosyaları geçmiş kararların kaydıdır; canlı durum için current runbook'lar ve repository/workflow state'i esas alınır.

## Production ve operasyon

Model production-only'dir; ayrı staging deployment target'ı yoktur. Normal pull request production'ı deploy veya mutate etmez.

`.github/workflows/deploy-prod.yml` manual-only, exact-revision guarded ve transactional deployment yoludur. Push/merge otomatik activation yapmaz; preflight, activation, origin/public verification ve gerektiğinde rollback uygular.

Read-only status ve activation yapmayan deploy doğrulaması:

```bash
npm run doppler:ops:status
npm run doppler:deploy:validate
BASE_URL=https://sismosmart.com npm run verify:post-deploy
```

Ayrıntılar: [`docs/cicd-automation.md`](docs/cicd-automation.md), [`docs/operations/production-deployment.md`](docs/operations/production-deployment.md), [`docs/operations/production-health.md`](docs/operations/production-health.md), [`docs/operations/repository-governance.md`](docs/operations/repository-governance.md).

## Katkı ve lisans

Katkı akışı için [`CONTRIBUTING.md`](CONTRIBUTING.md), güvenlik bildirimleri için [`SECURITY.md`](SECURITY.md) dosyasına bakın.

Repository `UNLICENSED` durumundadır. [`LICENSE`](LICENSE) içindeki all-rights-reserved şartları geçerlidir; açık kaynak lisansı verilmemiştir.
