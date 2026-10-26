import { getPages, routeSegments, type StaticPageKey } from "@/lib/pages";
import { getCopy, siteConfig, type Locale } from "@/lib/site";

const languageNames: Record<Locale, string> = {
  tr: "Turkish",
  en: "English",
  es: "Spanish",
  it: "Italian",
  id: "Indonesian",
  pt: "Portuguese",
};

const structuredDataModifiedDate = "2026-10-01";

const homeLabels: Record<Locale, string> = {
  tr: "Ana Sayfa",
  en: "Home",
  es: "Inicio",
  it: "Home",
  id: "Beranda",
  pt: "Início",
};

function absolutePath(locale: Locale, path: string) {
  return path === "/"
    ? `${siteConfig.url}/${locale}`
    : `${siteConfig.url}/${locale}${path}`;
}

function homeBreadcrumb(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabels[locale],
        item: `${siteConfig.url}/${locale}`,
      },
    ],
  };
}

function breadcrumb(locale: Locale, pageKey: StaticPageKey, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabels[locale],
        item: `${siteConfig.url}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: absolutePath(locale, routeSegments[pageKey]),
      },
    ],
  };
}

export function getGlobalStructuredData(locale: Locale) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/logo-symbol.svg`,
      email: siteConfig.email,
      description: siteConfig.description,
      sameAs: siteConfig.socialLinks.map((item) => item.href),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: siteConfig.email,
        availableLanguage: Object.values(languageNames),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: locale,
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
  ];
}

export function getHomeStructuredData(locale: Locale) {
  const copy = getCopy(locale);

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: copy.meta.title,
      description: copy.meta.description,
      url: `${siteConfig.url}/${locale}`,
      inLanguage: locale,
    },
    homeBreadcrumb(locale),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: copy.faq.items.map((item) => ({
        "@type": "Question",
        name: item.title,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.description,
        },
      })),
    },
  ];
}

export function getPageStructuredData(locale: Locale, pageKey: StaticPageKey) {
  const pages = getPages(locale);

  switch (pageKey) {
    case "product":
      return [
        breadcrumb(locale, pageKey, pages.product.title),
        {
          "@context": "https://schema.org",
          "@type": "Product",
          // A branded product name kept consistent across locales, rather than
          // the page heading (which is "The device" in some languages). Brand
          // and product names are not translated, so a single entity name is
          // both correct and better for search/LLM entity consolidation.
          name: `${siteConfig.name} seismic monitor`,
          image: [
            `${siteConfig.url}/images/device/sismosmart-device-hero.webp`,
            `${siteConfig.url}/images/device/sismosmart-device-front.webp`,
          ],
          description: pages.product.description,
          url: absolutePath(locale, routeSegments.product),
          category: "Seismic monitoring device",
          brand: {
            "@type": "Brand",
            name: siteConfig.name,
          },
          manufacturer: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
          },
          // The device specs shown on the page, restated as machine-readable
          // properties. No price or rating: the product is pre-launch, and
          // fabricating either would be misleading structured data.
          additionalProperty: pages.product.specs.map((spec) => ({
            "@type": "PropertyValue",
            name: spec.label,
            value: spec.value,
          })),
        },
      ];
    case "howItWorks":
      return [
        breadcrumb(locale, pageKey, pages.howItWorks.title),
        {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: pages.howItWorks.title,
          description: pages.howItWorks.description,
          url: absolutePath(locale, routeSegments.howItWorks),
          step: pages.howItWorks.flow.map((step) => ({
            "@type": "HowToStep",
            name: step.title,
            text: step.description,
          })),
        },
      ];
    case "about":
      return [
        breadcrumb(locale, pageKey, pages.about.title),
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: pages.about.title,
          description: pages.about.description,
          url: absolutePath(locale, routeSegments.about),
        },
      ];
    case "contact":
      return [
        breadcrumb(locale, pageKey, pages.contact.title),
        {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: pages.contact.title,
          description: pages.contact.description,
          url: absolutePath(locale, routeSegments.contact),
        },
      ];
    case "technology":
      return [
        breadcrumb(locale, pageKey, pages.technology.title),
        {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          name: pages.technology.title,
          description: pages.technology.description,
          url: absolutePath(locale, routeSegments.technology),
          inLanguage: locale,
          dateModified: structuredDataModifiedDate,
          publisher: {
            "@type": "Organization",
            name: siteConfig.name,
          },
        },
      ];
    case "pilotProgram":
      return [
        breadcrumb(locale, pageKey, pages.pilotProgram.title),
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: pages.pilotProgram.title,
          description: pages.pilotProgram.description,
          url: absolutePath(locale, routeSegments.pilotProgram),
          inLanguage: locale,
        },
      ];
    case "investors":
      return [
        breadcrumb(locale, pageKey, pages.investors.title),
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: pages.investors.title,
          description: pages.investors.description,
          url: absolutePath(locale, routeSegments.investors),
          inLanguage: locale,
        },
      ];
    case "faq":
      return [
        breadcrumb(locale, pageKey, pages.faq.title),
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          name: pages.faq.title,
          description: pages.faq.description,
          url: absolutePath(locale, routeSegments.faq),
          mainEntity: pages.faq.sections.map((item) => ({
            "@type": "Question",
            name: item.title,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.description,
            },
          })),
        },
      ];
    case "privacy":
      return [
        breadcrumb(locale, pageKey, pages.privacy.title),
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: pages.privacy.title,
          description: pages.privacy.description,
          url: absolutePath(locale, routeSegments.privacy),
        },
      ];
    case "terms":
      return [
        breadcrumb(locale, pageKey, pages.terms.title),
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: pages.terms.title,
          description: pages.terms.description,
          url: absolutePath(locale, routeSegments.terms),
        },
      ];
    case "security":
      return [
        breadcrumb(locale, pageKey, pages.security.title),
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: pages.security.title,
          description: pages.security.description,
          url: absolutePath(locale, routeSegments.security),
          inLanguage: locale,
        },
      ];
    case "glossary":
      return [
        breadcrumb(locale, pageKey, pages.glossary.title),
        {
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: pages.glossary.title,
          description: pages.glossary.description,
          url: absolutePath(locale, routeSegments.glossary),
          inLanguage: locale,
          hasDefinedTerm: pages.glossary.sections.map((term) => ({
            "@type": "DefinedTerm",
            name: term.title,
            description: term.description,
          })),
        },
      ];
    case "press":
      return [
        breadcrumb(locale, pageKey, pages.press.title),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: pages.press.title,
          description: pages.press.description,
          url: absolutePath(locale, routeSegments.press),
        },
      ];
    default:
      return [];
  }
}
