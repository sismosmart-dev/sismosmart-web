import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const basePath = (() => {
  const value = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (!value || value === "/") return "";
  return `/${value}`.replace(/\/{2,}/g, "/").replace(/\/$/, "");
})();

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  process.env.NODE_ENV !== "production" ? "'unsafe-eval'" : "",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://www.clarity.ms",
  "https://scripts.clarity.ms",
  "https://static.cloudflareinsights.com",
].filter(Boolean);

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  `script-src ${scriptSources.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.clarity.ms https://*.clarity.ms https://cloudflareinsights.com",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  basePath,
  async redirects() {
    return [
      {
        source: basePath || "/",
        destination: basePath ? basePath.concat("/en") : "/en",
        permanent: true,
        basePath: false,
      },
    ];
  },
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
