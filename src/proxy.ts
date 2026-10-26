import { NextResponse, type NextRequest } from "next/server.js";

import { resolveAgentPage } from "@/lib/agent-discovery";
import { routeSegments } from "@/lib/pages";
import { isGuideLocale } from "@/lib/guides/types";
import { getGuideBySlug } from "@/lib/guides/catalog";

function acceptsMarkdown(acceptHeader: string | null) {
  if (!acceptHeader) return false;

  return acceptHeader.split(",").some((entry) => {
    const [mediaType, ...parameters] = entry
      .trim()
      .split(";")
      .map((part) => part.trim().toLowerCase());
    if (mediaType !== "text/markdown") return false;

    const qualityParam = parameters.find((parameter) => parameter.startsWith("q="));
    if (!qualityParam) return true;
    const q = Number(qualityParam.slice(2));
    return Number.isFinite(q) && q > 0;
  });
}

function resolveGuidePath(pathname: string, directMarkdown: boolean): string | null {
  const expression = directMarkdown
    ? /^\/([a-z]{2})\/guides(?:\/([^/]+))?\.md$/
    : /^\/([a-z]{2})\/guides(?:\/([^/]+))?\/?$/;
  const match = expression.exec(pathname);
  if (!match) return null;

  const [, locale, slug] = match;
  if (!isGuideLocale(locale)) return null;

  if (!slug) {
    return `/markdown/guides/${locale}`;
  }

  const guide = getGuideBySlug(locale, slug);
  if (!guide) return null;

  return `/markdown/guides/${locale}/${slug}`;
}

function parseLocalizedPath(pathname: string, directMarkdown: boolean) {
  const expression = directMarkdown
    ? /^\/([a-z]{2})(?:\/([^/]+))?\.md$/
    : /^\/([a-z]{2})(?:\/([^/]+))?\/?$/;
  const match = expression.exec(pathname);
  if (!match) return null;

  const [, locale, segment] = match;
  if (segment === "home") return null;

  return resolveAgentPage(locale, segment ?? null);
}

function internalMarkdownPath(
  resolved: NonNullable<ReturnType<typeof resolveAgentPage>>,
) {
  const page =
    resolved.pageKey === "home"
      ? "home"
      : routeSegments[resolved.pageKey].slice(1);
  return `/markdown/${resolved.locale}/${page}`;
}

export function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const isDirectMarkdown = pathname.endsWith(".md");
  const shouldNegotiate = acceptsMarkdown(request.headers.get("accept"));
  if (!isDirectMarkdown && !shouldNegotiate) {
    return NextResponse.next();
  }

  const guidePath = resolveGuidePath(pathname, isDirectMarkdown);
  if (guidePath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = guidePath;
    return NextResponse.rewrite(rewriteUrl);
  }

  const resolved = parseLocalizedPath(pathname, isDirectMarkdown);
  if (!resolved) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalMarkdownPath(resolved);
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next(?:/|$)|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|sitemap\\.md$|llms(?:-full)?\\.txt$|AGENTS\\.md$|openapi\\.json$).*)",
  ],
};
