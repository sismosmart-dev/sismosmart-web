import type { MetadataRoute } from "next";

import { withBasePath } from "@/lib/base-path";

import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: withBasePath("/"),
      disallow: [withBasePath("/admin/"), withBasePath("/dashboard/"), withBasePath("/api/")],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
