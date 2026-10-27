import { z } from "zod";

import { staticPageKeys, type StaticPageKey } from "@/lib/pages";
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

const pageIntro = z.strictObject({
  eyebrow: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(2_000),
  meta: homeMeta,
});

type HomeHero = z.infer<typeof homeHero>;
type HomeMeta = z.infer<typeof homeMeta>;
type PageIntro = z.infer<typeof pageIntro>;
export type PageIntroKey = `page.${StaticPageKey}.intro`;
export type ContentKey = "home.hero" | "home.meta" | PageIntroKey;
export type ContentDocument<K extends ContentKey> = K extends "home.hero"
  ? HomeHero
  : K extends "home.meta"
    ? HomeMeta
    : PageIntro;

const pageIntroKeys = new Set<string>(staticPageKeys.map((key) => `page.${key}.intro`));

export function isContentLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.some((entry) => entry === value);
}

export function isContentKey(value: unknown): value is ContentKey {
  return value === "home.hero" || value === "home.meta" ||
    (typeof value === "string" && pageIntroKeys.has(value));
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
  const schema = key === "home.hero" ? homeHero : key === "home.meta" ? homeMeta : pageIntro;
  const parsed = schema.parse(input);
  rejectMarkup(parsed);
  return parsed as ContentDocument<K>;
}
