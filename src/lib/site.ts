import { withBasePath } from "@/lib/base-path";
import { enCopy } from "@/lib/content/en";
import { esCopy } from "@/lib/content/es";
import { idCopy } from "@/lib/content/id";
import { itCopy } from "@/lib/content/it";
import { ptCopy } from "@/lib/content/pt";
import { trCopy } from "@/lib/content/tr";

export const locales = ["en", "tr", "es", "id", "pt", "it"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
  it: "Italiano",
  id: "Bahasa Indonesia",
  pt: "Português",
};

export const safetyNotices: Record<Locale, string> = {
  en: "SismoSmart is not an emergency service and does not determine whether a building is safe. Follow official alerts and qualified engineers.",
  tr: "SismoSmart bir acil durum servisi değildir ve bir binanın güvenli olup olmadığına karar vermez. Resmî uyarıları ve yetkili mühendisleri izleyin.",
  es: "SismoSmart no es un servicio de emergencia ni determina si un edificio es seguro. Siga las alertas oficiales y a profesionales cualificados.",
  it: "SismoSmart non è un servizio di emergenza e non stabilisce se un edificio è sicuro. Segui gli avvisi ufficiali e tecnici qualificati.",
  id: "SismoSmart bukan layanan darurat dan tidak menentukan apakah suatu bangunan aman. Ikuti peringatan resmi dan tenaga ahli yang berkualifikasi.",
  pt: "A SismoSmart não é um serviço de emergência e não determina se um prédio é seguro. Siga alertas oficiais e profissionais qualificados.",
};

export const productStageNotices: Record<Locale, string> = {
  en: "SismoSmart is a pre-launch product. Hardware, detection, connectivity, performance and certification details are design targets until pilot validation and formal approval.",
  tr: "SismoSmart lansman öncesi bir üründür. Donanım, algılama, bağlantı, performans ve sertifikasyon ayrıntıları pilot doğrulaması ve resmî onaya kadar tasarım hedefidir.",
  es: "SismoSmart es un producto previo al lanzamiento. Hardware, detección, conectividad, rendimiento y certificación son objetivos de diseño hasta la validación piloto y la aprobación formal.",
  it: "SismoSmart è un prodotto pre-lancio. Hardware, rilevamento, connettività, prestazioni e certificazione sono obiettivi di progetto fino alla validazione pilota e all'approvazione formale.",
  id: "SismoSmart adalah produk pra-peluncuran. Rincian perangkat keras, deteksi, konektivitas, kinerja, dan sertifikasi adalah target desain hingga validasi pilot dan persetujuan resmi.",
  pt: "A SismoSmart é um produto pré-lançamento. Hardware, detecção, conectividade, desempenho e certificação são metas de projeto até a validação piloto e a aprovação formal.",
};

export const siteConfig = {
  name: "SismoSmart",
  url: "https://sismosmart.com",
  description:
    "A wall-mounted seismic monitoring device that records building motion and helps engineers review what happened after an earthquake.",
  email: "info@sismosmart.com",
  ogImage: withBasePath("/images/og/sismosmart-og.png"),
  pressEmail: "press@sismosmart.com",
  socialLinks: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/sismosmart" },
    { label: "Instagram", href: "https://www.instagram.com/sismosmart" },
    { label: "X", href: "https://twitter.com/sismosmart" },
  ],
} as const;

export type SiteLink = {
  label: string;
  href: string;
};

export type Stat = {
  label: string;
  value: string;
};

export type ContentCard = {
  title: string;
  description: string;
};

export type FeatureCard = ContentCard & {
  accent: string;
};

export type ProofCard = {
  title: string;
  description: string;
  highlight: string;
};

export type SiteCopy = {
  accessibility: {
    skipToContent: string;
  };
  meta: {
    title: string;
    description: string;
  };
  navigation: {
    eyebrow: string;
    primaryCta: string;
    links: SiteLink[];
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    tertiaryCta?: string;
    primaryHref: string;
    secondaryHref: string;
    tertiaryHref?: string;
    stats: Stat[];
    deviceEyebrow: string;
    deviceTitle: string;
    deviceDescription: string;
    deviceSpecs: string[];
    meterTopLabel: string;
    meterTopValue: string;
    meterBottomLabel: string;
    meterBottomValue: string;
    imageAlt: string;
  };
  trust: {
    eyebrow: string;
    title: string;
    description: string;
    items: Stat[];
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    description: string;
    steps: ContentCard[];
  };
  features: {
    eyebrow: string;
    title: string;
    description: string;
    items: FeatureCard[];
  };
  demo: {
    eyebrow: string;
    title: string;
    description: string;
    previewLabel: string;
    networkLabel: string;
    sensorLabel: string;
    sensorValue: string;
    eventLabel: string;
    eventValue: string;
    bullets: string[];
    cta: string;
    ctaHref: string;
  };
  proof: {
    eyebrow: string;
    title: string;
    description: string;
    cards: ProofCard[];
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: ContentCard[];
  };
  newsletter: {
    eyebrow: string;
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    button: string;
    consent: string;
    note: string;
    loading: string;
    success: string;
    error: string;
    missingEndpoint: string;
    rateLimited: string;
  };
  footer: {
    legal: string;
  };
};

const copy: Record<Locale, SiteCopy> = {
  tr: trCopy,
  en: enCopy,
  es: esCopy,
  it: itCopy,
  id: idCopy,
  pt: ptCopy,
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getCopy(locale: Locale) {
  return copy[locale];
}

export function getLocalizedHref(locale: Locale, href: string) {
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  if (href.startsWith("#")) {
    return withBasePath(`/${locale}/${href}`);
  }

  if (href === "/") {
    return withBasePath(`/${locale}`);
  }

  if (href.startsWith(`/${locale}`)) {
    return withBasePath(href);
  }

  if (href.startsWith("/")) {
    return withBasePath(`/${locale}${href}`);
  }

  return href;
}
