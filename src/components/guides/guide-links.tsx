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
    <section>
      <h2 className="font-heading text-xl tracking-normal text-fg">{heading}</h2>
      <ul className="mt-4 space-y-3">
        {guides.map((guide) => (
          <li key={guide.translationKey}>
            <a
              className="text-[var(--primary-600)] hover:underline"
              href={getGuideCanonicalPath(guide)}
            >
              {guide.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
