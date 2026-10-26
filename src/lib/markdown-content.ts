import type {
  AboutPageCopy,
  ContactPageCopy,
  HowItWorksPageCopy,
  InfoPageCopy,
  PageCard,
  ProductPageCopy,
} from "@/lib/page-copy";
import {
  agentContentLastUpdated,
  getAgentPageDescriptor,
  type AgentPageKey,
  type MarkdownPageKey,
} from "@/lib/agent-discovery";
import { getPages } from "@/lib/pages";
import {
  getCopy,
  productStageNotices,
  safetyNotices,
  siteConfig,
  type Locale,
} from "@/lib/site";

type StructureLabels = {
  canonical: string;
  comparisonColumns: [string, string, string, string];
  contactChannels: string;
  eventRecording: string;
  features: string;
  machineResources: string;
  network: string;
  process: string;
  productOverview: string;
  proof: string;
  safety: string;
  signals: string;
  specifications: string;
  terminology: string;
  useCases: string;
};

const structureLabels: Record<Locale, StructureLabels> = {
  en: {
    canonical: "Canonical HTML page",
    comparisonColumns: ["Item", "SismoSmart", "Traditional system", "Mobile app"],
    contactChannels: "Contact channels",
    eventRecording: "Event recording",
    features: "Features",
    machineResources: "Machine-readable resources",
    network: "Network",
    process: "Process",
    productOverview: "Product overview",
    proof: "Evidence and limitations",
    safety: "Safety and product status",
    signals: "Signals",
    specifications: "Specifications",
    terminology: "Terminology",
    useCases: "Use cases",
  },
  tr: {
    canonical: "Kanonik HTML sayfası",
    comparisonColumns: ["Başlık", "SismoSmart", "Geleneksel sistem", "Mobil uygulama"],
    contactChannels: "İletişim kanalları",
    eventRecording: "Olay kaydı",
    features: "Özellikler",
    machineResources: "Makine tarafından okunabilir kaynaklar",
    network: "Ağ",
    process: "Süreç",
    productOverview: "Ürün özeti",
    proof: "Kanıtlar ve sınırlamalar",
    safety: "Güvenlik ve ürün durumu",
    signals: "Sinyaller",
    specifications: "Teknik özellikler",
    terminology: "Terminoloji",
    useCases: "Kullanım alanları",
  },
  es: {
    canonical: "Página HTML canónica",
    comparisonColumns: ["Elemento", "SismoSmart", "Sistema tradicional", "Aplicación móvil"],
    contactChannels: "Canales de contacto",
    eventRecording: "Registro de eventos",
    features: "Funciones",
    machineResources: "Recursos legibles por máquinas",
    network: "Red",
    process: "Proceso",
    productOverview: "Resumen del producto",
    proof: "Evidencia y limitaciones",
    safety: "Seguridad y estado del producto",
    signals: "Señales",
    specifications: "Especificaciones",
    terminology: "Terminología",
    useCases: "Casos de uso",
  },
  id: {
    canonical: "Halaman HTML kanonis",
    comparisonColumns: ["Item", "SismoSmart", "Sistem tradisional", "Aplikasi seluler"],
    contactChannels: "Saluran kontak",
    eventRecording: "Rekaman peristiwa",
    features: "Fitur",
    machineResources: "Sumber daya yang dapat dibaca mesin",
    network: "Jaringan",
    process: "Proses",
    productOverview: "Ringkasan produk",
    proof: "Bukti dan batasan",
    safety: "Keselamatan dan status produk",
    signals: "Sinyal",
    specifications: "Spesifikasi",
    terminology: "Terminologi",
    useCases: "Kasus penggunaan",
  },
  pt: {
    canonical: "Página HTML canónica",
    comparisonColumns: ["Item", "SismoSmart", "Sistema tradicional", "Aplicação móvel"],
    contactChannels: "Canais de contacto",
    eventRecording: "Registo de eventos",
    features: "Funcionalidades",
    machineResources: "Recursos legíveis por máquinas",
    network: "Rede",
    process: "Processo",
    productOverview: "Resumo do produto",
    proof: "Evidências e limitações",
    safety: "Segurança e estado do produto",
    signals: "Sinais",
    specifications: "Especificações",
    terminology: "Terminologia",
    useCases: "Casos de uso",
  },
  it: {
    canonical: "Pagina HTML canonica",
    comparisonColumns: ["Voce", "SismoSmart", "Sistema tradizionale", "App mobile"],
    contactChannels: "Canali di contatto",
    eventRecording: "Registrazione degli eventi",
    features: "Funzionalità",
    machineResources: "Risorse leggibili dalle macchine",
    network: "Rete",
    process: "Processo",
    productOverview: "Panoramica del prodotto",
    proof: "Evidenze e limitazioni",
    safety: "Sicurezza e stato del prodotto",
    signals: "Segnali",
    specifications: "Specifiche",
    terminology: "Terminologia",
    useCases: "Casi d'uso",
  },
};

function escapeYaml(value: string) {
  return JSON.stringify(value.replaceAll("\r\n", "\n").replaceAll("\r", "\n"));
}

function escapeTableCell(value: string) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function renderCards(cards: PageCard[]) {
  return cards
    .map((card) => `### ${card.title}\n\n${card.description}`)
    .join("\n\n");
}

function renderInfoPage(page: InfoPageCopy) {
  const sections = page.sections
    .map((section) => `## ${section.title}\n\n${section.description}`)
    .join("\n\n");
  const links = page.links?.length
    ? `\n\n${page.links
        .map((link) => `- [${link.title}](${link.href}): ${link.description}`)
        .join("\n")}`
    : "";

  return `${sections}${links}`;
}

function renderProductPage(locale: Locale, page: ProductPageCopy) {
  const labels = structureLabels[locale];
  const specs = page.specs
    .map((spec) => `- **${spec.label}:** ${spec.value}`)
    .join("\n");
  const comparisons = page.comparisonRows
    .map(
      (row) =>
        `| ${escapeTableCell(row.label)} | ${escapeTableCell(row.sismosmart)} | ${escapeTableCell(row.traditional)} | ${escapeTableCell(row.mobile)} |`,
    )
    .join("\n");
  const columns = labels.comparisonColumns;

  return `## ${labels.productOverview}

${page.deviceDescription}

## ${labels.specifications}

${specs}

## ${labels.useCases}

${renderCards(page.useCases)}

## ${page.comparisonTitle}

${page.comparisonDescription}

| ${columns.map(escapeTableCell).join(" | ")} |
| --- | --- | --- | --- |
${comparisons}`;
}

function renderHowItWorksPage(locale: Locale, page: HowItWorksPageCopy) {
  const labels = structureLabels[locale];

  return `## ${labels.process}

${renderCards(page.flow)}

## ${labels.signals}

${renderCards(page.signals)}

## ${labels.network}

${renderCards(page.network)}`;
}

function renderAboutPage(page: AboutPageCopy) {
  const story = page.story.map((paragraph) => paragraph).join("\n\n");
  const principles = renderCards(page.principles);
  const timeline = page.timeline
    .map(
      (item) =>
        `### ${item.period} — ${item.title}\n\n${item.description}`,
    )
    .join("\n\n");
  const team = page.team
    .map(
      (member) =>
        `### ${member.name}\n\n**${member.role}**\n\n${member.bio}`,
    )
    .join("\n\n");

  return `## Story

${story}

## Principles

${principles}

## Timeline

${timeline}

## Team

${team}`;
}

function renderContactPage(locale: Locale, page: ContactPageCopy) {
  const labels = structureLabels[locale];
  const channels = page.channels
    .map(
      (channel) =>
        `- [${channel.title}](${channel.href}): ${channel.description} (${channel.value})`,
    )
    .join("\n");

  return `## ${labels.contactChannels}

${channels}

## Contact form

${page.form.note}

The form collects the public fields shown on the canonical HTML page and sends them only after validation and consent.`;
}

function renderHomePage(locale: Locale) {
  const copy = getCopy(locale);
  const labels = structureLabels[locale];
  const stats = copy.hero.stats
    .map((item) => `- **${item.label}:** ${item.value}`)
    .join("\n");
  const trust = copy.trust.items
    .map((item) => `- **${item.label}:** ${item.value}`)
    .join("\n");
  const features = copy.features.items
    .map(
      (item) =>
        `### ${item.title}\n\n${item.description}\n\n**${item.accent}**`,
    )
    .join("\n\n");
  const proof = copy.proof.cards
    .map(
      (item) =>
        `### ${item.title}\n\n${item.description}\n\n**${item.highlight}**`,
    )
    .join("\n\n");
  const faq = copy.faq.items
    .map((item) => `### ${item.title}\n\n${item.description}`)
    .join("\n\n");

  return `## ${labels.productOverview}

${copy.hero.description}

${copy.hero.deviceDescription}

${stats}

## ${copy.trust.title}

${copy.trust.description}

${trust}

## ${labels.process}

${copy.howItWorks.description}

${renderCards(copy.howItWorks.steps)}

## ${labels.features}

${copy.features.description}

${features}

## ${labels.eventRecording}

${copy.demo.description}

${copy.demo.bullets.map((item) => `- ${item}`).join("\n")}

## ${labels.proof}

${copy.proof.description}

${proof}

## ${copy.faq.title}

${copy.faq.description}

${faq}`;
}

function renderPageBody(locale: Locale, pageKey: AgentPageKey) {
  if (pageKey === "home") {
    return renderHomePage(locale);
  }

  const page = getPages(locale)[pageKey];
  if (pageKey === "product") {
    return renderProductPage(locale, page as ProductPageCopy);
  }
  if (pageKey === "howItWorks") {
    return renderHowItWorksPage(locale, page as HowItWorksPageCopy);
  }
  if (pageKey === "about") {
    return renderAboutPage(page as AboutPageCopy);
  }
  if (pageKey === "contact") {
    return renderContactPage(locale, page as ContactPageCopy);
  }
  return renderInfoPage(page as InfoPageCopy);
}

export function renderAgentPageMarkdown(
  locale: Locale,
  pageKey: AgentPageKey,
) {
  const descriptor = getAgentPageDescriptor(locale, pageKey);
  const labels = structureLabels[locale];
  const glossaryUrl = `${siteConfig.url}/${locale}/glossary`;

  return `---
title: ${escapeYaml(descriptor.title)}
description: ${escapeYaml(descriptor.description)}
locale: ${locale}
canonical_url: ${descriptor.canonicalUrl}
last_updated: "${agentContentLastUpdated}"
---

# ${descriptor.title}

> ${descriptor.description}

${labels.canonical}: [${descriptor.canonicalUrl}](${descriptor.canonicalUrl})

${renderPageBody(locale, pageKey)}

## ${labels.terminology}

- [${getPages(locale).glossary.title}](${glossaryUrl})

## ${labels.safety}

${safetyNotices[locale]}

${productStageNotices[locale]}

## ${labels.machineResources}

- [Concise LLM summary](${siteConfig.url}/llms.txt)
- [Expanded LLM context](${siteConfig.url}/llms-full.txt)
- [Public agent guidance](${siteConfig.url}/AGENTS.md)
- [OpenAPI contract](${siteConfig.url}/openapi.json)

## Sitemap

- [Human-readable sitemap](${siteConfig.url}/sitemap.md)
- [XML sitemap](${siteConfig.url}/sitemap.xml)
`;
}

/** Backwards-compatible renderer used by the legacy `/markdown/...` routes. */
export function renderPageMarkdown(
  locale: Locale,
  pageKey: MarkdownPageKey,
) {
  return renderAgentPageMarkdown(locale, pageKey);
}
