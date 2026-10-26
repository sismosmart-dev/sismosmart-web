import type { GuideLocale } from "@/lib/guides/types";

export interface GuideUiStrings {
  readonly home: string;
  readonly guides: string;
  readonly published: string;
  readonly updated: string;
  readonly keyTakeaways: string;
  readonly limitations: string;
  readonly sismosmartFit: string;
  readonly relatedGlossaryTerms: string;
  readonly relatedGuides: string;
  readonly references: string;
  readonly product: string;
  readonly technology: string;
  readonly howItWorks: string;
  readonly faq: string;
  readonly glossary: string;
  readonly pilotProgram: string;
  readonly breadcrumb: string;
  readonly safetyNotice: string;
}

const uiStringsByLocale: Record<GuideLocale, GuideUiStrings> = {
  en: {
    home: "Home",
    guides: "Guides",
    published: "Published",
    updated: "Updated",
    keyTakeaways: "Key takeaways",
    limitations: "Limitations",
    sismosmartFit: "SismoSmart fit",
    relatedGlossaryTerms: "Related glossary terms",
    relatedGuides: "Related guides",
    references: "References",
    product: "Product",
    technology: "Technology",
    howItWorks: "How it works",
    faq: "FAQ",
    glossary: "Glossary",
    pilotProgram: "Pilot program",
    breadcrumb: "Breadcrumb",
    safetyNotice: "Safety notice",
  },
  tr: {
    home: "Ana sayfa",
    guides: "Rehberler",
    published: "Yayınlandı",
    updated: "Güncellendi",
    keyTakeaways: "Temel çıkarımlar",
    limitations: "Sınırlamalar",
    sismosmartFit: "SismoSmart bu tabloda nerede?",
    relatedGlossaryTerms: "İlgili sözlük terimleri",
    relatedGuides: "İlgili rehberler",
    references: "Kaynaklar",
    product: "Ürün",
    technology: "Teknoloji",
    howItWorks: "Nasıl çalışır",
    faq: "SSS",
    glossary: "Sözlük",
    pilotProgram: "Pilot program",
    breadcrumb: "Sayfa yolu",
    safetyNotice: "Güvenlik notu",
  },
};

Object.freeze(uiStringsByLocale.en);
Object.freeze(uiStringsByLocale.tr);
Object.freeze(uiStringsByLocale);

export function getGuideUiStrings(locale: GuideLocale): GuideUiStrings {
  return uiStringsByLocale[locale];
}
