import { FrequencyTrend } from "@/components/frequency-trend";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { GuideLinks } from "@/components/guides/guide-links";
import { withBasePath } from "@/lib/base-path";
import { getPages } from "@/lib/pages";
import type { Locale } from "@/lib/site";
import type { GuideTranslationKey } from "@/lib/guides/types";

const technologyGuideKeys: readonly GuideTranslationKey[] = [
  "mems-accelerometers-seismic-monitoring",
  "building-natural-frequency-monitoring",
] as const;

export type InfoPageKey =
  | "glossary"
  | "investors"
  | "press"
  | "privacy"
  | "security"
  | "technology"
  | "terms";

// Labels for the technology page's structural-health chart. Kept here as a
// small dict rather than threaded through every locale's page copy, since the
// chart is specific to one page.
const frequencyTrendLabels: Record<
  Locale,
  { eyebrow: string; title: string; caption: string; baseline: string; event: string; guideLinksHeading?: string }
> = {
  tr: {
    eyebrow: "Yapı sağlığı",
    title: "Doğal frekans, hasarın erken habercisi",
    caption:
      "Bir binanın doğal frekansı aylar boyunca küçük mevsimsel dalgalanmalarla sabit kalır. Ciddi bir sarsıntıdan sonra bu değer düşer ve eski seviyesine dönmez. Cihaz bu kaymayı yakalar.",
    baseline: "Sağlıklı taban",
    event: "Olay",
    guideLinksHeading: "MEMS algılama ve yapı davranışı rehberleri",
  },
  en: {
    eyebrow: "Structural health",
    title: "Natural frequency is an early sign of damage",
    caption:
      "A building's natural frequency holds steady for months, wobbling only with the seasons. After a serious tremor it drops and does not return to where it was. The device catches that shift.",
    baseline: "Healthy baseline",
    event: "Event",
    guideLinksHeading: "MEMS sensing and structural response guides",
  },
  es: {
    eyebrow: "Salud estructural",
    title: "La frecuencia natural es una señal temprana de daño",
    caption:
      "La frecuencia natural de un edificio se mantiene estable durante meses, oscilando solo con las estaciones. Tras un temblor serio baja y no vuelve a su valor anterior. El dispositivo detecta ese cambio.",
    baseline: "Base sana",
    event: "Evento",
  },
  it: {
    eyebrow: "Salute strutturale",
    title: "La frequenza naturale è un segnale precoce di danno",
    caption:
      "La frequenza naturale di un edificio resta stabile per mesi, oscillando solo con le stagioni. Dopo una scossa seria cala e non torna al valore di prima. Il dispositivo coglie quello spostamento.",
    baseline: "Base sana",
    event: "Evento",
  },
  id: {
    eyebrow: "Kesehatan struktur",
    title: "Frekuensi alami adalah tanda awal kerusakan",
    caption:
      "Frekuensi alami sebuah bangunan tetap stabil selama berbulan-bulan, hanya bergoyang mengikuti musim. Setelah guncangan serius, nilainya turun dan tidak kembali seperti semula. Perangkat menangkap pergeseran itu.",
    baseline: "Garis dasar sehat",
    event: "Kejadian",
  },
  pt: {
    eyebrow: "Saúde estrutural",
    title: "A frequência natural é um sinal precoce de dano",
    caption:
      "A frequência natural de um prédio se mantém estável por meses, oscilando só com as estações. Depois de um tremor sério ela cai e não volta ao valor anterior. O dispositivo capta essa mudança.",
    baseline: "Base saudável",
    event: "Evento",
  },
};

export function InfoPage({
  locale,
  pageKey,
}: {
  locale: Locale;
  pageKey: InfoPageKey;
}) {
  const page = getPages(locale)[pageKey];
  const trend = pageKey === "technology" ? frequencyTrendLabels[locale] : null;

  return (
    <main className="flex flex-1 flex-col gap-8 pb-16 pt-8 sm:gap-10 sm:pt-10" id="content">
      <PageHero
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />

      {trend ? (
        <section
          className="overflow-hidden rounded-xl border border-[rgba(114,174,127,0.2)] bg-primary-950 px-6 py-10 shadow-[var(--shadow-inverse)] sm:px-8"
          data-reveal
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-normal text-[var(--signal)]">
                {trend.eyebrow}
              </p>
              <h2 className="font-heading text-2xl tracking-normal text-white sm:text-3xl">
                {trend.title}
              </h2>
              <p className="text-base leading-7 text-emerald-50/80">{trend.caption}</p>
            </div>
            <div className="overflow-hidden rounded-lg border border-[rgba(114,174,127,0.22)] bg-black/25 p-3 text-emerald-50/40">
              <FrequencyTrend
                baselineLabel={trend.baseline}
                className="h-52 w-full sm:h-64"
                eventLabel={trend.event}
                title={trend.title}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        {page.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-lg border border-border bg-surface px-6 py-6 shadow-3"
          >
            <h2 className="font-heading text-2xl tracking-normal text-fg">
              {section.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-fg-muted">
              {section.description}
            </p>
          </article>
        ))}
      </section>

      {pageKey === "technology" && trend?.guideLinksHeading ? (
        <GuideLinks
          heading={trend.guideLinksHeading}
          locale={locale}
          translationKeys={technologyGuideKeys}
        />
      ) : null}

      {page.links ? (
        <section className="rounded-xl border border-[rgba(114,174,127,0.2)] bg-primary-950 px-6 py-10 shadow-[var(--shadow-inverse)] sm:px-8">
          <SectionHeading
            description={page.description}
            eyebrow={page.eyebrow}
            invert
            title={page.title}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {page.links.map((link) => (
              <a
                key={link.href}
                className="rounded-[1.25rem] border border-white/10 bg-black/20 px-5 py-5 text-white hover:-translate-y-1 hover:border-brand-bright/40"
                href={withBasePath(link.href)}
              >
                <span className="font-heading text-xl tracking-normal">
                  {link.title}
                </span>
                <span className="mt-3 block text-sm leading-6 text-emerald-50/78">
                  {link.description}
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
