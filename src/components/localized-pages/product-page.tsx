import Image from "next/image";

import { PageHero } from "@/components/page-hero";
import { ProductVisual } from "@/components/product-visual";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { GuideLinks } from "@/components/guides/guide-links";
import { withBasePath } from "@/lib/base-path";
import { getPages } from "@/lib/pages";
import { getLocalizedHref, type Locale } from "@/lib/site";
import type { GuideTranslationKey } from "@/lib/guides/types";

const productGuideKeys: readonly GuideTranslationKey[] = [
  "building-seismic-monitoring-device",
  "earthquake-app-vs-fixed-sensor",
  "seismic-sensor-placement",
] as const;

const productLabels: Record<
  Locale,
  {
    cloudTitle: string;
    detailDescriptions: [string, string, string, string];
    doesNotClaimTitle: string;
    installationTitle: string;
    measuresTitle: string;
    nonClaims: [string, string, string];
    overviewTitle: string;
    overviewDescription: string;
    pilotTitle: string;
    useCasesEyebrow: string;
    useCasesTitle: string;
    useCasesDescription: string;
    category: string;
    traditional: string;
    mobile: string;
    ctaTitle: string;
    ctaDescription: string;
    guideLinksHeading?: string;
  }
> = {
  tr: {
    cloudTitle: "Bulut ve uygulama",
    detailDescriptions: [
      "Üç eksenli hareket, LED durumu, yerel kayıt ve cihaz sağlığı.",
      "Takın, eşleyin, durumu kontrol edin, gerekirse cihaz ekleyin.",
      "Wi-Fi ile şifreli veri, uygulama ekranları ve yazılım güncellemeleri.",
      "Evler, apartmanlar, kampüsler, fabrikalar, belediyeler ve araştırma ekipleri.",
    ],
    doesNotClaimTitle: "Ne iddia etmez",
    installationTitle: "Kurulum",
    measuresTitle: "Ne ölçer",
    nonClaims: [
      "Resmi bir deprem uyarı sistemi değildir.",
      "Tek cihaz bir binaya güvenli veya güvensiz diyemez.",
      "Acil durum talimatlarının veya mühendis incelemesinin yerine geçmez.",
    ],
    overviewTitle: "Cihaz özeti",
    overviewDescription:
      "Cihazın ne ölçtüğü, nasıl kurulduğu, veriyi nereye gönderdiği ve hangi binalarda denenebileceği tek bakışta.",
    pilotTitle: "Nerede denenebilir",
    useCasesEyebrow: "Kullanım alanları",
    useCasesTitle: "Aynı cihaz, farklı binalar",
    useCasesDescription:
      "Donanım her yerde aynı. Değişen tek şey kaç cihaz taktığınız ve binanın neresine taktığınız.",
    category: "Kategori",
    traditional: "Profesyonel cihaz",
    mobile: "Telefon uygulaması",
    ctaTitle: "Gerçek bir binada denemek ister misiniz?",
    ctaDescription:
      "Bize binayı anlatın. İlk pilotlar için uygun olup olmadığına birlikte bakalım.",
    guideLinksHeading: "Sabit bina sensörü seçimi ve yerleşimi",
  },
  en: {
    cloudTitle: "Cloud and app",
    detailDescriptions: [
      "Three-axis motion, LED status, local recording and device health.",
      "Mount it, pair it, check status, add more devices when needed.",
      "Encrypted Wi-Fi data, app review screens and software updates.",
      "Homes, apartments, campuses, factories, municipalities and research teams.",
    ],
    doesNotClaimTitle: "What it does not claim",
    installationTitle: "Installation",
    measuresTitle: "What it measures",
    nonClaims: [
      "It is not an official earthquake warning system.",
      "One device cannot call a building safe or unsafe.",
      "It does not replace emergency instructions or an engineer's inspection.",
    ],
    overviewTitle: "Device overview",
    overviewDescription:
      "What the device measures, how it goes up, where the data lands, and which buildings it suits.",
    pilotTitle: "Where it can be tested",
    useCasesEyebrow: "Use cases",
    useCasesTitle: "Same device, different buildings",
    useCasesDescription:
      "The hardware is identical everywhere. What changes is how many you install and where in the building they go.",
    category: "Category",
    traditional: "Professional device",
    mobile: "Phone app",
    ctaTitle: "Want to test it in a real building?",
    ctaDescription:
      "Tell us about the building. We will see if it fits the first pilots.",
    guideLinksHeading: "Choosing and placing a fixed building sensor",
  },
  es: {
    cloudTitle: "Nube y app",
    detailDescriptions: [
      "Movimiento en tres ejes, estado LED, registro local y salud del dispositivo.",
      "Móntalo, emparéjalo, revisa el estado y agrega dispositivos si hace falta.",
      "Datos Wi-Fi cifrados, pantallas de revisión y actualizaciones de software.",
      "Casas, apartamentos, campus, fábricas, municipios y equipos de investigación.",
    ],
    doesNotClaimTitle: "Lo que no afirma",
    installationTitle: "Instalación",
    measuresTitle: "Qué mide",
    nonClaims: [
      "No es un sistema oficial de alerta sísmica.",
      "Un dispositivo no puede declarar un edificio seguro o inseguro.",
      "No sustituye instrucciones de emergencia ni revisión de un ingeniero.",
    ],
    overviewTitle: "Resumen del dispositivo",
    overviewDescription:
      "Qué mide el dispositivo, cómo se instala, adónde va el dato y en qué edificios encaja.",
    pilotTitle: "Dónde puede probarse",
    useCasesEyebrow: "Casos de uso",
    useCasesTitle: "Mismo dispositivo, edificios distintos",
    useCasesDescription:
      "El hardware es el mismo en todas partes. Lo que cambia es cuántos instalas y en qué punto del edificio.",
    category: "Categoría",
    traditional: "Dispositivo profesional",
    mobile: "App móvil",
    ctaTitle: "¿Quieres probarlo en un edificio real?",
    ctaDescription:
      "Cuéntanos sobre el edificio. Veremos si encaja con los primeros pilotos.",
  },
  it: {
    cloudTitle: "Cloud e app",
    detailDescriptions: [
      "Movimento su tre assi, stato LED, registrazione locale e salute del dispositivo.",
      "Montalo, abbinalo, controlla lo stato e aggiungi dispositivi se serve.",
      "Dati Wi-Fi cifrati, schermate di revisione e aggiornamenti software.",
      "Case, appartamenti, campus, fabbriche, comuni e team di ricerca.",
    ],
    doesNotClaimTitle: "Cosa non dichiara",
    installationTitle: "Installazione",
    measuresTitle: "Cosa misura",
    nonClaims: [
      "Non è un sistema ufficiale di allerta terremoto.",
      "Un dispositivo non può dire che un edificio è sicuro o non sicuro.",
      "Non sostituisce istruzioni di emergenza o ispezione di un ingegnere.",
    ],
    overviewTitle: "Panoramica dispositivo",
    overviewDescription:
      "Cosa misura il dispositivo, come si installa, dove finiscono i dati e per quali edifici è adatto.",
    pilotTitle: "Dove si può testare",
    useCasesEyebrow: "Casi d'uso",
    useCasesTitle: "Stesso dispositivo, edifici diversi",
    useCasesDescription:
      "L'hardware è identico ovunque. Cambia solo quanti ne installi e in che punto dell'edificio.",
    category: "Categoria",
    traditional: "Dispositivo professionale",
    mobile: "App telefono",
    ctaTitle: "Vuoi provarlo in un edificio reale?",
    ctaDescription:
      "Raccontaci l'edificio. Vedremo se è adatto ai primi piloti.",
  },
  id: {
    cloudTitle: "Cloud dan app",
    detailDescriptions: [
      "Gerakan tiga sumbu, status LED, rekaman lokal, dan kondisi perangkat.",
      "Pasang, hubungkan, cek status, tambah perangkat jika perlu.",
      "Data Wi-Fi terenkripsi, layar tinjauan app, dan pembaruan software.",
      "Rumah, apartemen, kampus, pabrik, kota, dan tim riset.",
    ],
    doesNotClaimTitle: "Yang tidak diklaim",
    installationTitle: "Pemasangan",
    measuresTitle: "Apa yang diukur",
    nonClaims: [
      "Ini bukan sistem peringatan gempa resmi.",
      "Satu perangkat tidak bisa menyatakan bangunan aman atau tidak aman.",
      "Ini tidak menggantikan instruksi darurat atau inspeksi engineer.",
    ],
    overviewTitle: "Ringkasan perangkat",
    overviewDescription:
      "Apa yang diukur perangkat, cara memasangnya, ke mana datanya pergi, dan bangunan mana yang cocok.",
    pilotTitle: "Tempat uji",
    useCasesEyebrow: "Skenario penggunaan",
    useCasesTitle: "Perangkat sama, bangunan berbeda",
    useCasesDescription:
      "Perangkatnya sama di mana pun. Yang berbeda hanya berapa banyak yang dipasang dan di titik mana.",
    category: "Kategori",
    traditional: "Perangkat profesional",
    mobile: "App ponsel",
    ctaTitle: "Ingin mengujinya di bangunan nyata?",
    ctaDescription:
      "Ceritakan bangunannya. Kami akan melihat apakah cocok untuk pilot pertama.",
  },
  pt: {
    cloudTitle: "Cloud e app",
    detailDescriptions: [
      "Movimento em três eixos, estado do LED, registro local e saúde do dispositivo.",
      "Instale, pareie, confira o status e adicione dispositivos se precisar.",
      "Dados Wi-Fi criptografados, telas de revisão e atualizações de software.",
      "Casas, apartamentos, campi, fábricas, municípios e equipes de pesquisa.",
    ],
    doesNotClaimTitle: "O que não afirma",
    installationTitle: "Instalação",
    measuresTitle: "O que mede",
    nonClaims: [
      "Não é um sistema oficial de alerta de terremoto.",
      "Um dispositivo não pode declarar um prédio seguro ou inseguro.",
      "Não substitui instruções de emergência nem inspeção de engenheiro.",
    ],
    overviewTitle: "Visão geral do dispositivo",
    overviewDescription:
      "O que o dispositivo mede, como é instalado, para onde vai o dado e em que prédios ele se encaixa.",
    pilotTitle: "Onde pode ser testado",
    useCasesEyebrow: "Casos de uso",
    useCasesTitle: "Mesmo dispositivo, prédios diferentes",
    useCasesDescription:
      "O hardware é o mesmo em todo lugar. O que muda é quantos você instala e em que ponto do prédio.",
    category: "Categoria",
    traditional: "Dispositivo profissional",
    mobile: "App de celular",
    ctaTitle: "Quer testar em um prédio real?",
    ctaDescription:
      "Conte sobre o prédio. Vamos ver se ele combina com os primeiros pilotos.",
  },
};

export function ProductPage({ locale }: { locale: Locale }) {
  const labels = productLabels[locale];
  const page = getPages(locale).product;

  return (
    <main className="flex flex-1 flex-col gap-8 pb-16 pt-8 sm:gap-10 sm:pt-10" id="content">
      <PageHero
        actions={
          <ButtonLink href={getLocalizedHref(locale, page.ctaHref)} size="lg">
            {page.ctaLabel}
          </ButtonLink>
        }
        aside={
          <ProductVisual
            altText={page.imageAlt}
            bullets={page.specs.map((item) => `${item.label}: ${item.value}`)}
            compact
            description={page.deviceDescription}
            eyebrow={page.eyebrow}
            meterBottomLabel={page.meterBottomLabel}
            meterBottomValue={page.meterBottomValue}
            meterTopLabel={page.meterTopLabel}
            meterTopValue={page.meterTopValue}
            priority
            title={page.title}
          />
        }
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {page.specs.map((spec) => (
          <article
            key={spec.label}
            className="rounded-lg border border-border bg-surface px-6 py-6 shadow-3"
          >
            <p className="text-sm text-fg-subtle">{spec.label}</p>
            <p className="mt-3 font-heading text-2xl tracking-normal text-fg">
              {spec.value}
            </p>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading
          description={labels.useCasesDescription}
          eyebrow={labels.useCasesEyebrow}
          title={labels.useCasesTitle}
        />
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {page.useCases.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-border bg-[var(--surface-2)] px-6 py-6 shadow-2"
            >
              <h3 className="font-heading text-2xl tracking-normal text-fg">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-fg-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,1.05fr)]">
        <div className="rounded-xl border border-border bg-surface px-6 py-8 shadow-3 sm:px-8">
          <SectionHeading
            description={labels.overviewDescription}
            eyebrow={page.eyebrow}
            title={labels.overviewTitle}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              labels.measuresTitle,
              labels.installationTitle,
              labels.cloudTitle,
              labels.pilotTitle,
            ].map((title, index) => (
              <article key={title} className="rounded-xl border border-border bg-surface-2 p-5">
                <span className="text-sm font-semibold text-brand">0{index + 1}</span>
                <h3 className="mt-2 font-heading text-xl text-fg">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-fg-muted">
                  {labels.detailDescriptions[index]}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[rgba(114,174,127,0.2)] bg-primary-950 p-6 shadow-[var(--shadow-inverse)]">
          <Image
            alt={page.imageAlt}
            className="h-auto w-full object-contain"
            height={1309}
            sizes="(min-width: 1024px) 42vw, 100vw"
            src={withBasePath("/images/device/sismosmart-device-low-profile.webp")}
            width={2400}
          />
        </div>
      </section>

      <section className="rounded-xl border border-amber/40 bg-surface-2 px-6 py-8 shadow-3 sm:px-8">
        <h2 className="font-heading text-2xl text-fg">{labels.doesNotClaimTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {labels.nonClaims.map((claim) => (
            <p key={claim} className="rounded-xl border border-amber/30 bg-surface p-5 text-sm leading-6 text-fg-muted">
              {claim}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface px-6 py-10 shadow-3 sm:px-8">
        <SectionHeading
          description={page.comparisonDescription}
          eyebrow={page.eyebrow}
          title={page.comparisonTitle}
        />

        <div
          aria-label={page.comparisonTitle}
          className="mt-8 overflow-x-auto"
          tabIndex={0}
        >
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-sm uppercase tracking-normal text-fg-subtle">
                <th className="px-4 py-2">{labels.category}</th>
                <th className="px-4 py-2 text-primary-600">SismoSmart</th>
                <th className="px-4 py-2">{labels.traditional}</th>
                <th className="px-4 py-2">{labels.mobile}</th>
              </tr>
            </thead>
            <tbody>
              {page.comparisonRows.map((row) => (
                <tr key={row.label}>
                  <td className="rounded-l-2xl border border-r-0 border-border bg-[var(--surface-2)] px-4 py-4 font-semibold text-fg">
                    {row.label}
                  </td>
                  <td className="border-y border-primary-300/60 bg-[color-mix(in_srgb,var(--primary-500)_12%,var(--surface))] px-4 py-4 font-medium text-fg">
                    {row.sismosmart}
                  </td>
                  <td className="border border-r-0 border-border bg-surface px-4 py-4 text-fg-muted">
                    {row.traditional}
                  </td>
                  <td className="rounded-r-2xl border border-border bg-surface px-4 py-4 text-fg-muted">
                    {row.mobile}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-[rgba(114,174,127,0.2)] bg-primary-950 px-6 py-10 shadow-[var(--shadow-inverse)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeading
            description={labels.ctaDescription}
            eyebrow={page.eyebrow}
            invert
            title={labels.ctaTitle}
          />
          <ButtonLink
            href={getLocalizedHref(locale, page.ctaHref)}
            size="lg"
            variant="signal"
          >
            {page.ctaLabel}
          </ButtonLink>
        </div>
      </section>

      {labels.guideLinksHeading ? (
        <GuideLinks
          heading={labels.guideLinksHeading}
          locale={locale}
          translationKeys={productGuideKeys}
        />
      ) : null}
    </main>
  );
}
