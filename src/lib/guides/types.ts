export const guideLocales = ["en", "tr"] as const;
export type GuideLocale = (typeof guideLocales)[number];

export function isGuideLocale(value: string): value is GuideLocale {
  return guideLocales.includes(value as GuideLocale);
}

export const guideTranslationKeys = [
  "building-seismic-monitoring-device",
  "measuring-building-motion-after-earthquake",
  "earthquake-app-vs-fixed-sensor",
  "seismic-sensor-placement",
  "mems-accelerometers-seismic-monitoring",
  "building-natural-frequency-monitoring",
] as const;
export type GuideTranslationKey = (typeof guideTranslationKeys)[number];

export type GuideCategory = "commercial" | "technical";

export type GuideReference = {
  label: string;
  organization: string;
  url: string;
};

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideCta = {
  label: string;
  href: "/product" | "/pilot-program";
  description: string;
};

export type GuideContent = {
  translationKey: GuideTranslationKey;
  locale: GuideLocale;
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  summary: string;
  keyTakeaways: string[];
  sections: GuideSection[];
  limitations: string[];
  sismosmartFit: string[];
  references: GuideReference[];
  relatedGuides: GuideTranslationKey[];
  relatedGlossaryTerms: string[];
  publishedAt: string;
  updatedAt: string;
  safetyNotice: string;
  cta: GuideCta;
};

export type GuideHubCopy = {
  locale: GuideLocale;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  commercialHeading: string;
  technicalHeading: string;
  relatedResourcesHeading: string;
};