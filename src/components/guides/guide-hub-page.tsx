import { getLocalizedHref } from "@/lib/site";
import { getGuideCanonicalPath, getGuidesByCategory } from "@/lib/guides/catalog";
import type { GuideHubCopy, GuideLocale } from "@/lib/guides/types";
import { getGuideUiStrings } from "@/lib/guides/ui-strings";

type GuideHubPageProps = {
  locale: GuideLocale;
  hub: GuideHubCopy;
};



export function GuideHubPage({ locale, hub }: GuideHubPageProps) {
  const commercialGuides = getGuidesByCategory(locale, "commercial");
  const technicalGuides = getGuidesByCategory(locale, "technical");
  const ui = getGuideUiStrings(locale);

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-12 overflow-x-hidden pb-16 pt-8 sm:gap-16 sm:pt-10" id="content" aria-labelledby="guide-hub-title">
      <section className="max-w-3xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-[var(--primary-600)]">
          {hub.eyebrow}
        </p>
        <h1 id="guide-hub-title" className="max-w-full break-words font-heading text-3xl leading-tight tracking-normal text-fg sm:text-5xl">
          {hub.h1}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-fg-muted">
          {hub.intro}
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-2xl tracking-normal text-fg">
          {hub.commercialHeading}
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {commercialGuides.map((guide) => (
            <li key={guide.translationKey}>
              <a
                className="block rounded-lg border border-border bg-surface p-5 hover:border-[var(--primary-600)] hover:shadow-3"
                href={getGuideCanonicalPath(guide)}
              >
                <h3 className="font-heading text-lg tracking-normal text-fg">
                  {guide.h1}
                </h3>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
                  {guide.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-2xl tracking-normal text-fg">
          {hub.technicalHeading}
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {technicalGuides.map((guide) => (
            <li key={guide.translationKey}>
              <a
                className="block rounded-lg border border-border bg-surface p-5 hover:border-[var(--primary-600)] hover:shadow-3"
                href={getGuideCanonicalPath(guide)}
              >
                <h3 className="font-heading text-lg tracking-normal text-fg">
                  {guide.h1}
                </h3>
                <p className="mt-2 text-sm leading-6 text-fg-muted">
                  {guide.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-2xl tracking-normal text-fg">
          {hub.relatedResourcesHeading}
        </h2>
        <ul className="space-y-3 text-sm">
          <li>
            <a className="text-[var(--primary-600)] hover:underline" href={getLocalizedHref(locale, "/product")}>
              {ui.product}
            </a>
          </li>
          <li>
            <a className="text-[var(--primary-600)] hover:underline" href={getLocalizedHref(locale, "/technology")}>
              {ui.technology}
            </a>
          </li>
          <li>
            <a className="text-[var(--primary-600)] hover:underline" href={getLocalizedHref(locale, "/how-it-works")}>
              {ui.howItWorks}
            </a>
          </li>
          <li>
            <a className="text-[var(--primary-600)] hover:underline" href={getLocalizedHref(locale, "/faq")}>
              {ui.faq}
            </a>
          </li>
          <li>
            <a className="text-[var(--primary-600)] hover:underline" href={getLocalizedHref(locale, "/glossary")}>
              {ui.glossary}
            </a>
          </li>
          <li>
            <a className="text-[var(--primary-600)] hover:underline" href={getLocalizedHref(locale, "/pilot-program")}>
              {ui.pilotProgram}
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
