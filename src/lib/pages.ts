import { enPages } from "@/lib/page-content/en";
import { esPages } from "@/lib/page-content/es";
import { idPages } from "@/lib/page-content/id";
import { itPages } from "@/lib/page-content/it";
import { ptPages } from "@/lib/page-content/pt";
import { trPages } from "@/lib/page-content/tr";
import { extraPagesByLocale } from "@/lib/page-content/extra-pages/index";
import { glossaryPagesByLocale } from "@/lib/page-content/glossary";
import type { BaseRoutePagesCopy } from "@/lib/page-copy";
import type { Locale, SiteLink } from "@/lib/site";
import { isGuideLocale } from "@/lib/guides/types";

export const routeSegments = {
  home: "/",
  product: "/product",
  technology: "/technology",
  howItWorks: "/how-it-works",
  pilotProgram: "/pilot-program",
  investors: "/investors",
  faq: "/faq",
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  security: "/security",
  press: "/press",
  glossary: "/glossary",
} as const;

export type PageKey = keyof typeof routeSegments;
export type StaticPageKey = Exclude<PageKey, "home">;

export const staticPageKeys: StaticPageKey[] = [
  "product",
  "technology",
  "howItWorks",
  "pilotProgram",
  "investors",
  "faq",
  "about",
  "contact",
  "privacy",
  "terms",
  "security",
  "press",
  "glossary",
];

const pagesByLocale: Record<Locale, BaseRoutePagesCopy> = {
  tr: trPages,
  en: enPages,
  es: esPages,
  it: itPages,
  id: idPages,
  pt: ptPages,
};

const navigationLabels: Record<Locale, Record<Exclude<PageKey, "home">, string>> = {
  tr: {
    product: "Ürün",
    technology: "Teknoloji",
    howItWorks: "Nasıl çalışır",
    pilotProgram: "Pilot program",
    investors: "Yatırımcılar",
    faq: "SSS",
    about: "Hakkımızda",
    contact: "İletişim",
    privacy: "Gizlilik",
    terms: "Şartlar",
    security: "Güvenlik",
    press: "Basın",
    glossary: "Sözlük",
  },
  en: {
    product: "Product",
    technology: "Technology",
    howItWorks: "How it works",
    pilotProgram: "Pilot program",
    investors: "Investors",
    faq: "FAQ",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    security: "Security",
    press: "Press",
    glossary: "Glossary",
  },
  es: {
    product: "Producto",
    technology: "Tecnología",
    howItWorks: "Cómo funciona",
    pilotProgram: "Programa piloto",
    investors: "Inversores",
    faq: "FAQ",
    about: "Acerca de",
    contact: "Contacto",
    privacy: "Privacidad",
    terms: "Términos",
    security: "Seguridad",
    press: "Prensa",
    glossary: "Glosario",
  },
  it: {
    product: "Prodotto",
    technology: "Tecnologia",
    howItWorks: "Come funziona",
    pilotProgram: "Programma pilota",
    investors: "Investitori",
    faq: "FAQ",
    about: "Chi siamo",
    contact: "Contatto",
    privacy: "Privacy",
    terms: "Termini",
    security: "Sicurezza",
    press: "Stampa",
    glossary: "Glossario",
  },
  id: {
    product: "Produk",
    technology: "Teknologi",
    howItWorks: "Cara kerja",
    pilotProgram: "Program pilot",
    investors: "Investor",
    faq: "FAQ",
    about: "Tentang",
    contact: "Kontak",
    privacy: "Privasi",
    terms: "Syarat",
    security: "Keamanan",
    press: "Media",
    glossary: "Glosarium",
  },
  pt: {
    product: "Produto",
    technology: "Tecnologia",
    howItWorks: "Como funciona",
    pilotProgram: "Programa piloto",
    investors: "Investidores",
    faq: "FAQ",
    about: "Sobre",
    contact: "Contato",
    privacy: "Privacidade",
    terms: "Termos",
    security: "Segurança",
    press: "Imprensa",
    glossary: "Glossário",
  },
};

const layoutLabels: Record<
  Locale,
  {
    explore: string;
    note: string;
    menu: string;
    close: string;
    privacy: string;
    notFoundTitle: string;
    notFoundDescription: string;
    notFoundHomeCta: string;
    theme: string;
    nav: string;
  }
> = {
  tr: {
    explore: "Keşfet",
    note: "Depremden sonra binanızda ne olduğunu ölçmek için.",
    menu: "Menüyü aç",
    close: "Menüyü kapat",
    privacy: "Gizlilik tercihleri",
    notFoundTitle: "Sayfa bulunamadı",
    notFoundDescription:
      "Aradığınız adres burada yok. Bir dil seçip ana sayfaya dönebilirsiniz.",
    notFoundHomeCta: "Türkçe ana sayfa",
    theme: "Koyu ve açık tema arasında geçiş yap",
    nav: "Ana gezinme",
  },
  en: {
    explore: "Explore",
    note: "Measure what happened inside your building after an earthquake.",
    menu: "Open menu",
    close: "Close menu",
    privacy: "Privacy preferences",
    notFoundTitle: "Page not found",
    notFoundDescription:
      "This address does not exist. Pick a language below to get back to the site.",
    notFoundHomeCta: "English home",
    theme: "Switch between dark and light theme",
    nav: "Primary navigation",
  },
  es: {
    explore: "Explorar",
    note: "Medir qué pasó en tu edificio después de un terremoto.",
    menu: "Abrir menú",
    close: "Cerrar menú",
    privacy: "Preferencias de privacidad",
    notFoundTitle: "Página no encontrada",
    notFoundDescription:
      "Esta dirección no existe. Elige un idioma para volver al sitio.",
    notFoundHomeCta: "Inicio en español",
    theme: "Cambiar entre tema oscuro y claro",
    nav: "Navegación principal",
  },
  it: {
    explore: "Esplora",
    note: "Misurare cosa è successo nel tuo edificio dopo un terremoto.",
    menu: "Apri menu",
    close: "Chiudi menu",
    privacy: "Preferenze privacy",
    notFoundTitle: "Pagina non trovata",
    notFoundDescription:
      "Questo indirizzo non esiste. Scegli una lingua per tornare al sito.",
    notFoundHomeCta: "Home in italiano",
    theme: "Passa dal tema scuro a quello chiaro",
    nav: "Navigazione principale",
  },
  id: {
    explore: "Jelajahi",
    note: "Mengukur apa yang terjadi di bangunan Anda setelah gempa.",
    menu: "Buka menu",
    close: "Tutup menu",
    privacy: "Preferensi privasi",
    notFoundTitle: "Halaman tidak ditemukan",
    notFoundDescription:
      "Alamat ini tidak ada. Pilih bahasa untuk kembali ke situs.",
    notFoundHomeCta: "Beranda Bahasa Indonesia",
    theme: "Beralih antara tema gelap dan terang",
    nav: "Navigasi utama",
  },
  pt: {
    explore: "Explorar",
    note: "Medir o que aconteceu no seu prédio depois de um terremoto.",
    menu: "Abrir menu",
    close: "Fechar menu",
    privacy: "Preferências de privacidade",
    notFoundTitle: "Página não encontrada",
    notFoundDescription:
      "Este endereço não existe. Escolha um idioma para voltar ao site.",
    notFoundHomeCta: "Início em português",
    theme: "Alternar entre tema escuro e claro",
    nav: "Navegação principal",
  },
};

export function getPages(locale: Locale) {
  return {
    ...pagesByLocale[locale],
    ...extraPagesByLocale[locale],
    glossary: glossaryPagesByLocale[locale],
  };
}

export function resolveStaticPageKey(segment: string): StaticPageKey | null {
  return (
    staticPageKeys.find((key) => routeSegments[key].slice(1) === segment) ?? null
  );
}

export function getPrimaryNavigation(locale: Locale): SiteLink[] {
  const labels = navigationLabels[locale];

  return [
    { label: labels.product, href: routeSegments.product },
    { label: labels.technology, href: routeSegments.technology },
    { label: labels.howItWorks, href: routeSegments.howItWorks },
    { label: labels.pilotProgram, href: routeSegments.pilotProgram },
    { label: labels.investors, href: routeSegments.investors },
    { label: labels.contact, href: routeSegments.contact },
  ];
}

export function getFooterNavigation(locale: Locale): SiteLink[] {
  const labels = navigationLabels[locale];

  const links: SiteLink[] = [
    { label: labels.product, href: routeSegments.product },
    { label: labels.technology, href: routeSegments.technology },
    { label: labels.howItWorks, href: routeSegments.howItWorks },
    { label: labels.pilotProgram, href: routeSegments.pilotProgram },
    { label: labels.investors, href: routeSegments.investors },
    { label: labels.faq, href: routeSegments.faq },
    { label: labels.about, href: routeSegments.about },
    { label: labels.press, href: routeSegments.press },
    { label: labels.glossary, href: routeSegments.glossary },
    { label: labels.privacy, href: routeSegments.privacy },
    { label: labels.terms, href: routeSegments.terms },
    { label: labels.security, href: routeSegments.security },
    { label: labels.contact, href: routeSegments.contact },
  ];

  const guideLink = getGuideNavigationLink(locale);
  if (guideLink) {
    links.push(guideLink);
  }

  return links;
}

export function getGuideNavigationLink(locale: Locale): SiteLink | null {
  if (!isGuideLocale(locale)) return null;
  if (locale === "en") return { label: "Guides", href: "/guides" };
  if (locale === "tr") return { label: "Rehberler", href: "/guides" };
  return null;
}

export function getLayoutChromeLabels(locale: Locale) {
  // "contact" is intentionally the same string already defined in
  // navigationLabels for this locale, reused here instead of duplicated.
  return {
    ...layoutLabels[locale],
    contact: navigationLabels[locale].contact,
  };
}
