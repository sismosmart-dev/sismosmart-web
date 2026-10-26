import {
  guideLocales,
  isGuideLocale,
  type GuideLocale,
} from "@/lib/guides/types";
import {
  getGuideBySlug,
  getGuides,
} from "@/lib/guides/catalog";

export function getHubStaticParams(): Array<{ locale: GuideLocale }> {
  return guideLocales.map((locale) => ({ locale }));
}

export function getDetailStaticParams(): Array<{
  locale: GuideLocale;
  slug: string;
}> {
  const params: Array<{ locale: GuideLocale; slug: string }> = [];
  for (const locale of guideLocales) {
    for (const guide of getGuides(locale)) {
      params.push({ locale, slug: guide.slug });
    }
  }
  return params;
}

export function resolveHubLocale(localeValue: string): GuideLocale | null {
  return isGuideLocale(localeValue) ? localeValue : null;
}

export function resolveDetailParams(
  localeValue: string,
  slugValue: string,
): { locale: GuideLocale; slug: string } | null {
  if (!isGuideLocale(localeValue)) return null;
  const guide = getGuideBySlug(localeValue, slugValue);
  if (!guide) return null;
  return { locale: localeValue, slug: slugValue };
}
