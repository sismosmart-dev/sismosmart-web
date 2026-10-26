import { resolveDetailParams, getDetailStaticParams } from "@/lib/guides/routing";
import { getGuideBySlug, getGuideCanonicalPath } from "@/lib/guides/catalog";
import { renderGuideMarkdown } from "@/lib/guides/markdown";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getDetailStaticParams();
}

type DetailRouteContext = {
  params: Promise<{ locale: string; slug: string }>;
};

function notFoundResponse() {
  return new Response("Not found\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
    status: 404,
  });
}

export async function GET(
  _request: Request,
  { params }: DetailRouteContext,
): Promise<Response> {
  const { locale, slug } = await params;
  const resolved = resolveDetailParams(locale, slug);
  if (!resolved) {
    return notFoundResponse();
  }

  const guide = getGuideBySlug(resolved.locale, resolved.slug);
  if (!guide) {
    return notFoundResponse();
  }

  const canonicalPath = getGuideCanonicalPath(guide);
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  return new Response(renderGuideMarkdown(guide), {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "text/markdown; charset=utf-8",
      link: `<${canonicalUrl}>; rel="canonical"`,
      vary: "Accept",
    },
  });
}
