import { z } from "zod";

import { locales, type Locale } from "@/lib/site";

/** Only registered, explicitly reviewed content documents are API-editable. */
const homeHero = z.strictObject({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(2_000),
});

const homeMeta = z.strictObject({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(320),
});

export const contentSchemas = {
  "home.hero": homeHero,
  "home.meta": homeMeta,
} as const;

export type ContentKey = keyof typeof contentSchemas;

export function isContentLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.some((entry) => entry === value);
}

export function isContentKey(value: unknown): value is ContentKey {
  return typeof value === "string" && Object.hasOwn(contentSchemas, value);
}

/** Structured JSON only: never accept HTML markup as a substitute for content. */
export function validateContentDocument(key: ContentKey, input: unknown) {
  const parsed = contentSchemas[key].parse(input);
  for (const value of Object.values(parsed)) {
    if (/<\/?[a-z][^>]*>/i.test(value)) {
      throw new Error("CMS_HTML_NOT_ALLOWED");
    }
  }
  return parsed;
}
