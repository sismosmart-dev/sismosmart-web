import {
  getPages,
  resolveStaticPageKey,
  routeSegments,
  staticPageKeys,
  type StaticPageKey,
} from "@/lib/pages";
import {
  getCopy,
  isLocale,
  siteConfig,
  type Locale,
} from "@/lib/site";

export type AgentPageKey = "home" | StaticPageKey;
export type MarkdownPageKey = StaticPageKey;

export const agentContentLastUpdated = "2026-10-01";
export const agentPageKeys: readonly AgentPageKey[] = ["home", ...staticPageKeys];
export const markdownPageKeys: readonly MarkdownPageKey[] = staticPageKeys;

const markdownPageKeySet = new Set<StaticPageKey>(markdownPageKeys);

export type AgentPageDescriptor = {
  pageKey: AgentPageKey;
  title: string;
  description: string;
  canonicalPath: string;
  canonicalUrl: string;
  markdownPath: string;
  markdownUrl: string;
};

export function isMarkdownPageKey(
  pageKey: StaticPageKey,
): pageKey is MarkdownPageKey {
  return markdownPageKeySet.has(pageKey);
}

function getPageMeta(locale: Locale, pageKey: AgentPageKey) {
  if (pageKey === "home") {
    return getCopy(locale).meta;
  }
  return getPages(locale)[pageKey].meta;
}

export function getAgentPageDescriptor(
  locale: Locale,
  pageKey: AgentPageKey,
): AgentPageDescriptor {
  const segment = routeSegments[pageKey];
  const canonicalPath =
    pageKey === "home" ? `/${locale}` : `/${locale}${segment}`;
  const markdownPath =
    pageKey === "home" ? `/${locale}.md` : `${canonicalPath}.md`;
  const meta = getPageMeta(locale, pageKey);

  return {
    pageKey,
    title: meta.title,
    description: meta.description,
    canonicalPath,
    canonicalUrl: `${siteConfig.url}${canonicalPath}`,
    markdownPath,
    markdownUrl: `${siteConfig.url}${markdownPath}`,
  };
}

export function resolveAgentPage(
  localeValue: string,
  segmentValue: string | null,
): { locale: Locale; pageKey: AgentPageKey } | null {
  if (!isLocale(localeValue)) {
    return null;
  }

  const segment = segmentValue?.replace(/^\/+|\/+$/g, "") ?? "";
  if (!segment || segment === "home") {
    return { locale: localeValue, pageKey: "home" };
  }

  const pageKey = resolveStaticPageKey(segment);
  return pageKey ? { locale: localeValue, pageKey } : null;
}

export function getMarkdownMirrorPath(
  locale: Locale,
  pageKey: AgentPageKey,
) {
  return getAgentPageDescriptor(locale, pageKey).markdownPath;
}

export function getMarkdownMirrorUrl(
  locale: Locale,
  pageKey: AgentPageKey,
) {
  return getAgentPageDescriptor(locale, pageKey).markdownUrl;
}

/** Backwards-compatible helper name; now points to the preferred same-path mirror. */
export function getMarkdownPath(
  locale: Locale,
  pageKey: AgentPageKey,
) {
  return getMarkdownMirrorPath(locale, pageKey);
}

/** Backwards-compatible helper name; now points to the preferred same-path mirror. */
export function getMarkdownUrl(
  locale: Locale,
  pageKey: AgentPageKey,
) {
  return getMarkdownMirrorUrl(locale, pageKey);
}

export function getLegacyMarkdownPath(
  locale: Locale,
  pageKey: AgentPageKey,
) {
  const page = pageKey === "home" ? "home" : routeSegments[pageKey].slice(1);
  return `/markdown/${locale}/${page}`;
}

export function getMarkdownAlternativeUrl(
  locale: Locale,
  path: string,
) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/") {
    return getMarkdownMirrorUrl(locale, "home");
  }

  const pageKey = staticPageKeys.find(
    (candidate) => routeSegments[candidate] === normalizedPath,
  );

  return pageKey ? getMarkdownMirrorUrl(locale, pageKey) : null;
}
