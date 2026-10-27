import { z } from "zod";

import { staticPageKeys, type StaticPageKey } from "@/lib/pages";
import { guideTranslationKeys, type GuideTranslationKey } from "@/lib/guides/types";
import { locales, type Locale } from "@/lib/site";

/** API-editable documents are registered explicitly; no arbitrary key or HTML. */
const homeHero = z.strictObject({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(2_000),
});

const homeMeta = z.strictObject({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(320),
});

// Bounded plain-text pairs for FAQ, policy, glossary and other editorial cards.
const pageSections = z.strictObject({
  sections: z.array(z.strictObject({
    title: z.string().trim().min(1).max(240),
    description: z.string().trim().min(1).max(4_000),
  })).min(1).max(40),
});

export const sectionPageKeys = [
  "technology", "pilotProgram", "investors", "faq", "privacy",
  "terms", "security", "press", "glossary",
] as const;
export type SectionPageKey = typeof sectionPageKeys[number];

// Detailed explanatory text for product, process and about. Navigation targets,
// contact form processing, images and other operational inputs stay in source.
const shortText = z.string().trim().min(1).max(240);
const longText = z.string().trim().min(1).max(2_000);
const pageCard = z.strictObject({ title: shortText, description: longText });
const productDetails = z.strictObject({
  deviceDescription: longText,
  meterTopLabel: shortText,
  meterTopValue: shortText,
  meterBottomLabel: shortText,
  meterBottomValue: shortText,
  imageAlt: shortText,
  specs: z.array(z.strictObject({ label: shortText, value: shortText })).min(1).max(16),
  useCases: z.array(pageCard).min(1).max(16),
  comparisonTitle: shortText,
  comparisonDescription: longText,
  comparisonRows: z.array(z.strictObject({
    label: shortText, sismosmart: longText, traditional: longText, mobile: longText,
  })).min(1).max(20),
  ctaLabel: shortText,
});
const processDetails = z.strictObject({
  flow: z.array(pageCard).min(1).max(16),
  signals: z.array(pageCard).min(1).max(16),
  network: z.array(pageCard).min(1).max(16),
});
const aboutDetails = z.strictObject({
  story: z.array(longText).min(1).max(16),
  principles: z.array(pageCard).min(1).max(16),
  timeline: z.array(z.strictObject({
    period: shortText, title: shortText, description: longText,
  })).min(1).max(16),
  team: z.array(z.strictObject({ name: shortText, role: shortText, bio: longText })).max(30),
});

export const detailsPageKeys = ["product", "howItWorks", "about"] as const;
export type DetailsPageKey = typeof detailsPageKeys[number];
export type PageDetailsKey = `page.${DetailsPageKey}.details`;
type ProductDetails = z.infer<typeof productDetails>;
type ProcessDetails = z.infer<typeof processDetails>;
type AboutDetails = z.infer<typeof aboutDetails>;

// Guide identity, canonical slug, citations, dates, CTA and safety notices
// remain immutable in source; editable body fields carry no URLs or HTML.
const guideBody = z.strictObject({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(320),
  eyebrow: z.string().trim().min(1).max(120),
  h1: z.string().trim().min(1).max(240),
  summary: z.string().trim().min(1).max(3_000),
  keyTakeaways: z.array(z.string().trim().min(1).max(600)).min(1).max(12),
  sections: z.array(z.strictObject({
    heading: z.string().trim().min(1).max(200),
    paragraphs: z.array(z.string().trim().min(1).max(3_000)).min(1).max(12),
    bullets: z.array(z.string().trim().min(1).max(600)).max(24).optional(),
  })).min(1).max(24),
  limitations: z.array(z.string().trim().min(1).max(1_200)).min(1).max(12),
  sismosmartFit: z.array(z.string().trim().min(1).max(1_200)).min(1).max(12),
});

const pageIntro = z.strictObject({
  eyebrow: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(2_000),
  meta: homeMeta,
});

type HomeHero = z.infer<typeof homeHero>;
type HomeMeta = z.infer<typeof homeMeta>;
type PageIntro = z.infer<typeof pageIntro>;
type PageSections = z.infer<typeof pageSections>;
type GuideBody = z.infer<typeof guideBody>;
export type GuideBodyKey = `guide.${GuideTranslationKey}.body`;
export type PageIntroKey = `page.${StaticPageKey}.intro`;
export type PageSectionsKey = `page.${SectionPageKey}.sections`;
export type ContentKey = "home.hero" | "home.meta" | PageIntroKey | PageSectionsKey | PageDetailsKey | GuideBodyKey;
export type ContentDocument<K extends ContentKey> = K extends "home.hero"
  ? HomeHero
  : K extends "home.meta"
    ? HomeMeta
    : K extends PageIntroKey
      ? PageIntro
      : K extends PageSectionsKey
        ? PageSections
        : K extends "page.product.details"
          ? ProductDetails
          : K extends "page.howItWorks.details"
            ? ProcessDetails
            : K extends "page.about.details"
              ? AboutDetails
              : GuideBody;

const pageIntroKeys = new Set<string>(staticPageKeys.map((key) => `page.${key}.intro`));
const pageSectionsKeys = new Set<string>(sectionPageKeys.map((key) => `page.${key}.sections`));
const guideBodyKeys = new Set<string>(guideTranslationKeys.map((key) => `guide.${key}.body`));
const pageDetailsKeys = new Set<string>(detailsPageKeys.map((key) => `page.${key}.details`));

export function isDetailsPageKey(value: unknown): value is DetailsPageKey {
  return typeof value === "string" && detailsPageKeys.some((key) => key === value);
}

export function isSectionsPageKey(value: unknown): value is SectionPageKey {
  return typeof value === "string" && sectionPageKeys.some((key) => key === value);
}

export function isContentLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.some((entry) => entry === value);
}

export function isContentKey(value: unknown): value is ContentKey {
  return value === "home.hero" || value === "home.meta" ||
    (typeof value === "string" && (pageIntroKeys.has(value) || pageSectionsKeys.has(value) || pageDetailsKeys.has(value) || guideBodyKeys.has(value)));
}

/** Recursively forbid markup in nested metadata as well as ordinary copy. */
function rejectMarkup(input: unknown): void {
  if (typeof input === "string") {
    if (/<\/?[a-z][^>]*>/i.test(input)) throw new Error("CMS_HTML_NOT_ALLOWED");
  } else if (Array.isArray(input)) {
    input.forEach(rejectMarkup);
  } else if (input && typeof input === "object") {
    Object.values(input).forEach(rejectMarkup);
  }
}

export function validateContentDocument<K extends ContentKey>(key: K, input: unknown): ContentDocument<K> {
  if (!isContentKey(key)) throw new Error("CMS_INVALID_CONTENT_KEY");
  const schema = key === "home.hero" ? homeHero : key === "home.meta" ? homeMeta :
    pageSectionsKeys.has(key) ? pageSections : guideBodyKeys.has(key) ? guideBody :
      key === "page.product.details" ? productDetails :
      key === "page.howItWorks.details" ? processDetails :
      key === "page.about.details" ? aboutDetails : pageIntro;
  const parsed = schema.parse(input);
  rejectMarkup(parsed);
  return parsed as ContentDocument<K>;
}
