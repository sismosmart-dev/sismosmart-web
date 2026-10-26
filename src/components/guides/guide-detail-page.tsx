import { getLocalizedHref } from "@/lib/site";
import type { GuideContent, GuideLocale } from "@/lib/guides/types";
import { GuideLinks } from "@/components/guides/guide-links";
import { getGuideUiStrings } from "@/lib/guides/ui-strings";
import { partitionGuideSections } from "@/lib/guides/presentation";

type GuideDetailPageProps = {
  locale: GuideLocale;
  guide: GuideContent;
};

export function GuideDetailPage({ locale, guide }: GuideDetailPageProps) {
  const ui = getGuideUiStrings(locale);
  const { contentSections, limitationParagraphs } = partitionGuideSections(guide.sections, ui.limitations);

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-12 overflow-x-hidden pb-16 pt-8 sm:gap-16 sm:pt-10" id="content">
      <article className="max-w-3xl space-y-10" aria-labelledby="guide-title">
        <nav className="space-y-2 text-sm text-fg-muted" aria-label={ui.breadcrumb}>
          <a className="hover:text-[var(--primary-600)]" href={getLocalizedHref(locale, "/")}>
            {ui.home}
          </a>
          <span aria-hidden="true"> / </span>
          <a className="hover:text-[var(--primary-600)]" href={getLocalizedHref(locale, "/guides")}>
            {ui.guides}
          </a>
          <span aria-hidden="true"> / </span>
          <span className="text-fg" aria-current="page">{guide.title}</span>
        </nav>

        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-normal text-[var(--primary-600)]">
            {guide.eyebrow}
          </p>
          <h1 id="guide-title" className="max-w-full break-words font-heading text-3xl leading-tight tracking-normal text-fg sm:text-5xl">
            {guide.h1}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-fg-muted">
            {guide.summary}
          </p>
        </header>

        <div className="flex flex-wrap gap-4 text-sm text-fg-muted">
          <time dateTime={guide.publishedAt}>{ui.published} {guide.publishedAt}</time>
          <time dateTime={guide.updatedAt}>{ui.updated} {guide.updatedAt}</time>
        </div>

        <section className="space-y-4">
          <h2 className="font-heading text-2xl tracking-normal text-fg">{ui.keyTakeaways}</h2>
          <ul className="space-y-3">
            {guide.keyTakeaways.map((takeaway) => (
              <li key={takeaway} className="flex gap-3 text-base leading-7 text-fg">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal)]" />
                {takeaway}
              </li>
            ))}
          </ul>
        </section>

        {contentSections.map((section) => (
          <section key={section.heading} className="space-y-4">
            <h2 className="font-heading text-2xl tracking-normal text-fg">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-base leading-7 text-fg-muted">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-base leading-7 text-fg-muted">
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal)]" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="space-y-4">
          <h2 className="font-heading text-2xl tracking-normal text-fg">{ui.limitations}</h2>
          {limitationParagraphs.map((paragraph) => (
            <p key={paragraph} className="text-base leading-7 text-fg-muted">
              {paragraph}
            </p>
          ))}
          <ul className="space-y-3">
            {guide.limitations.map((limitation) => (
              <li key={limitation} className="flex gap-3 text-base leading-7 text-fg-muted">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                {limitation}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-2xl tracking-normal text-fg">{ui.sismosmartFit}</h2>
          {guide.sismosmartFit.map((paragraph) => (
            <p key={paragraph} className="text-base leading-7 text-fg-muted">
              {paragraph}
            </p>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-2xl tracking-normal text-fg">{ui.relatedGlossaryTerms}</h2>
          <ul className="space-y-2">
            {guide.relatedGlossaryTerms.map((term) => (
              <li key={term}>
                <a
                  className="text-[var(--primary-600)] hover:underline"
                  href={getLocalizedHref(locale, "/glossary")}
                >
                  {term}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <GuideLinks
          locale={locale}
          translationKeys={guide.relatedGuides}
          heading={ui.relatedGuides}
        />

        <section className="space-y-4">
          <h2 className="font-heading text-2xl tracking-normal text-fg">{ui.references}</h2>
          <ul className="space-y-3">
            {guide.references.map((reference) => (
              <li key={reference.url} className="text-base leading-7">
                <a
                  className="text-[var(--primary-600)] hover:underline"
                  href={reference.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {reference.label}
                </a>
                <span className="ml-2 text-sm text-fg-muted">
                  ({reference.organization})
                </span>
              </li>
            ))}
          </ul>
        </section>

        <aside aria-labelledby="guide-safety-title" className="rounded-lg border border-amber/30 bg-surface-2 px-5 py-5 text-sm leading-6 text-fg-muted">
          <h2 id="guide-safety-title" className="sr-only">{ui.safetyNotice}</h2>
          <p>{guide.safetyNotice}</p>
        </aside>

        <div className="space-y-3">
          <a
            className="inline-flex rounded-full border border-[var(--primary-600)] bg-[var(--primary-600)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-700)]"
            href={getLocalizedHref(locale, guide.cta.href)}
          >
            {guide.cta.label}
          </a>
          <p className="text-sm text-fg-muted">{guide.cta.description}</p>
        </div>
      </article>
    </main>
  );
}
