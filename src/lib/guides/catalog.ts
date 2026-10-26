import type {
  GuideContent,
  GuideHubCopy,
  GuideLocale,
  GuideTranslationKey,
  GuideCategory,
} from "@/lib/guides/types";

import { isGuideLocale, guideTranslationKeys } from "@/lib/guides/types";

import { englishGuides, englishGuideHub } from "@/lib/guides/content/en/index";
import { turkishGuides, turkishGuideHub } from "@/lib/guides/content/tr/index";

export const commercialTranslationKeys: readonly GuideTranslationKey[] = [
  "building-seismic-monitoring-device",
  "measuring-building-motion-after-earthquake",
  "earthquake-app-vs-fixed-sensor",
  "seismic-sensor-placement",
] as const;

export const technicalTranslationKeys: readonly GuideTranslationKey[] = [
  "mems-accelerometers-seismic-monitoring",
  "building-natural-frequency-monitoring",
] as const;

const guidesByLocale: Record<GuideLocale, readonly GuideContent[]> = {
  en: englishGuides,
  tr: turkishGuides,
};

const hubByLocale: Record<GuideLocale, GuideHubCopy> = {
  en: englishGuideHub,
  tr: turkishGuideHub,
};

const guidesByKey: Partial<Record<GuideTranslationKey, Partial<Record<GuideLocale, GuideContent>>>> = {};
for (const locale of ["en", "tr"] as const) {
  for (const guide of guidesByLocale[locale]) {
    if (!guidesByKey[guide.translationKey]) {
      guidesByKey[guide.translationKey] = {};
    }
    guidesByKey[guide.translationKey]![locale] = guide;
  }
}

const guidesBySlug: Record<string, Record<string, GuideContent>> = {};
for (const locale of ["en", "tr"] as const) {
  for (const guide of guidesByLocale[locale]) {
    if (!guidesBySlug[locale]) {
      guidesBySlug[locale] = {};
    }
    guidesBySlug[locale][guide.slug] = guide;
  }
}

export function getGuideHub(locale: GuideLocale): GuideHubCopy {
  return hubByLocale[locale];
}

export function getGuides(locale: GuideLocale): readonly GuideContent[] {
  return guidesByLocale[locale];
}

export function getGuidesByCategory(
  locale: GuideLocale,
  category: GuideCategory,
): readonly GuideContent[] {
  const keys = category === "commercial" ? commercialTranslationKeys : technicalTranslationKeys;
  return keys.map((key) => getGuideByTranslationKey(locale, key));
}

export function getGuideBySlug(
  localeValue: string,
  slug: string,
): GuideContent | null {
  if (!isGuideLocale(localeValue)) return null;
  return guidesBySlug[localeValue]?.[slug] ?? null;
}

export function getGuideByTranslationKey(
  locale: GuideLocale,
  key: GuideTranslationKey,
): GuideContent {
  const localeMap = guidesByKey[key];
  if (!localeMap) {
    throw new Error(`Guide translation key "${key}" not found in catalog`);
  }
  const guide = localeMap[locale];
  if (!guide) {
    throw new Error(`Guide translation key "${key}" missing for locale "${locale}"`);
  }
  return guide;
}

export function getGuideCanonicalPath(guide: GuideContent): string {
  return `/${guide.locale}/guides/${guide.slug}`;
}

export function getGuideMarkdownPath(guide: GuideContent): string {
  return `${getGuideCanonicalPath(guide)}.md`;
}

export function getGuideAlternates(
  key: GuideTranslationKey,
): Record<"en" | "tr" | "x-default", string> {
  const en = getGuideByTranslationKey("en", key);
  const tr = getGuideByTranslationKey("tr", key);
  return {
    en: `https://sismosmart.com/en/guides/${en.slug}`,
    tr: `https://sismosmart.com/tr/guides/${tr.slug}`,
    "x-default": `https://sismosmart.com/en/guides/${en.slug}`,
  };
}

export function getGuideLocaleSwitchPathMap(): Record<
  string,
  Partial<Record<GuideLocale, string>>
> {
  const map: Record<string, Partial<Record<GuideLocale, string>>> = {
    "/en/guides": { tr: "/tr/guides" },
    "/tr/guides": { en: "/en/guides" },
  };

  for (const key of guideTranslationKeys) {
    const en = getGuideByTranslationKey("en", key);
    const tr = getGuideByTranslationKey("tr", key);
    map[`/en/guides/${en.slug}`] = { tr: `/tr/guides/${tr.slug}` };
    map[`/tr/guides/${tr.slug}`] = { en: `/en/guides/${en.slug}` };
  }

  return map;
}
