import { getGuideByTranslationKey, getGuideCanonicalPath } from "@/lib/guides/catalog";
import { isGuideLocale } from "@/lib/guides/types";
import type { GuideTranslationKey } from "@/lib/guides/types";
import type { Locale } from "@/lib/site";

type GuideLinksProps = {
  locale: Locale;
  translationKeys: readonly GuideTranslationKey[];
  heading: string;
};

export function GuideLinks({ locale, translationKeys, heading }: GuideLinksProps) {
  if (!isGuideLocale(locale)) return null;

  const guides = translationKeys.map((key) => getGuideByTranslationKey(locale, key));

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-xl tracking-normal text-fg">{heading}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <a
            key={guide.translationKey}
            className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-5 shadow-2 transition hover:-translate-y-0.5 hover:border-primary-400 hover:shadow-3"
            href={getGuideCanonicalPath(guide)}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-[var(--primary-600)]">
                {guide.eyebrow}
              </p>
              <h3 className="mt-2 font-heading text-lg tracking-normal text-fg group-hover:text-[var(--primary-600)]">
                {guide.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-fg-muted">
                {guide.summary}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-600)]">
              <span>{locale === "tr" ? "Rehberi incele" : "Read guide"}</span>
              <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
