import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const analyticsConfigPath = path.join(rootDir, "config", "analytics.json");
export const analyticsConfig = JSON.parse(fs.readFileSync(analyticsConfigPath, "utf8"));

export function getConfiguredValue(envName, fallback) {
  const environmentValue = process.env[envName]?.trim();
  const value = environmentValue || String(fallback || "").trim();
  return {
    configured: Boolean(value),
    source: environmentValue ? "environment" : value ? "config/analytics.json" : "missing",
    value: value || null,
  };
}

export function getAnalyticsIdentifiers() {
  return {
    gaId: getConfiguredValue(
      "NEXT_PUBLIC_GA_ID",
      analyticsConfig.public.gaMeasurementId,
    ),
    gtmId: getConfiguredValue(
      "NEXT_PUBLIC_GTM_ID",
      analyticsConfig.public.gtmPublicId,
    ),
    clarityId: getConfiguredValue(
      "NEXT_PUBLIC_CLARITY_ID",
      analyticsConfig.public.clarityProjectId,
    ),
    analyticsAccountId: getConfiguredValue(
      "GOOGLE_ANALYTICS_ACCOUNT_ID",
      analyticsConfig.googleAnalytics.accountId,
    ),
    analyticsPropertyId: getConfiguredValue(
      "GOOGLE_ANALYTICS_PROPERTY_ID",
      analyticsConfig.googleAnalytics.propertyId,
    ),
    analyticsWebStreamId: getConfiguredValue(
      "GOOGLE_ANALYTICS_WEB_STREAM_ID",
      analyticsConfig.googleAnalytics.webStreamId,
    ),
    gtmAccountId: getConfiguredValue(
      "GOOGLE_GTM_ACCOUNT_ID",
      analyticsConfig.googleTagManager.accountId,
    ),
    gtmContainerId: getConfiguredValue(
      "GOOGLE_GTM_CONTAINER_ID",
      analyticsConfig.googleTagManager.containerId,
    ),
    gtmWorkspaceId: getConfiguredValue(
      "GOOGLE_GTM_WORKSPACE_ID",
      analyticsConfig.googleTagManager.workspaceId,
    ),
    clarityProjectId: getConfiguredValue(
      "CLARITY_PROJECT_ID",
      analyticsConfig.public.clarityProjectId,
    ),
    searchConsoleSite: getConfiguredValue(
      "GOOGLE_SEARCH_CONSOLE_SITE",
      analyticsConfig.searchConsole.site,
    ),
    searchConsoleSitemapUrl: getConfiguredValue(
      "GOOGLE_SITEMAP_URL",
      analyticsConfig.searchConsole.sitemapUrl,
    ),
  };
}

export function getAnalyticsActivation() {
  const raw = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED;
  return {
    enabled: raw === "true",
    source: raw ? "environment" : "default-disabled",
  };
}
