import type { RoutePagesCopy } from "@/lib/page-copy";
import { AboutPage } from "@/components/localized-pages/about-page";
import { ContactPage } from "@/components/localized-pages/contact-page";
import { FaqPage } from "@/components/localized-pages/faq-page";
import { HowItWorksPage } from "@/components/localized-pages/how-it-works-page";
import { InfoPage } from "@/components/localized-pages/info-page";
import { PilotProgramPage } from "@/components/localized-pages/pilot-program-page";
import { ProductPage } from "@/components/localized-pages/product-page";
import type { StaticPageKey } from "@/lib/pages";
import { isLocale, locales, type Locale } from "@/lib/site";

export function renderStaticPage(locale: Locale, pageKey: StaticPageKey, pages?: RoutePagesCopy) {
  if (!isLocale(locale) || !locales.includes(locale)) {
    return null;
  }

  switch (pageKey) {
    case "product":
      return <ProductPage locale={locale} pages={pages} />;
    case "technology":
    case "investors":
    case "security":
    case "glossary":
      return <InfoPage locale={locale} pageKey={pageKey} pages={pages} />;
    case "howItWorks":
      return <HowItWorksPage locale={locale} pages={pages} />;
    case "pilotProgram":
      return <PilotProgramPage locale={locale} pages={pages} />;
    case "faq":
      return <FaqPage locale={locale} pages={pages} />;
    case "about":
      return <AboutPage locale={locale} pages={pages} />;
    case "contact":
      return <ContactPage locale={locale} pages={pages} />;
    case "press":
    case "privacy":
    case "terms":
      return <InfoPage locale={locale} pageKey={pageKey} pages={pages} />;
    default:
      return null;
  }
}
