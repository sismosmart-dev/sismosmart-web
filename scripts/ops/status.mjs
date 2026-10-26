import process from "node:process";

import {
  analyticsConfigPath,
  getAnalyticsActivation,
  getAnalyticsIdentifiers,
} from "./analytics-config.mjs";
import { opsConfig, printJson } from "./config.mjs";
import { getGoogleAuthReadiness } from "./google-auth.mjs";

function main() {
  const identifiers = getAnalyticsIdentifiers();
  const googleAuth = getGoogleAuthReadiness();
  const googleAuthReady =
    googleAuth.oauthReady ||
    googleAuth.serviceAccountReady ||
    googleAuth.applicationDefaultRequested;

  printJson({
    domain: opsConfig.domain,
    canonicalConfig: analyticsConfigPath,
    activation: getAnalyticsActivation(),
    googleAuth,
    analytics: {
      measurementId: identifiers.gaId,
      accountId: identifiers.analyticsAccountId,
      propertyId: identifiers.analyticsPropertyId,
      webStreamId: identifiers.analyticsWebStreamId,
      remotelyVerifiable: googleAuthReady,
    },
    tagManager: {
      publicId: identifiers.gtmId,
      accountId: identifiers.gtmAccountId,
      containerId: identifiers.gtmContainerId,
      workspaceId: identifiers.gtmWorkspaceId,
      remotelyVerifiable: googleAuthReady,
    },
    searchConsole: {
      site: identifiers.searchConsoleSite,
      sitemapUrl: identifiers.searchConsoleSitemapUrl,
      googleAuthReady,
      cpanelDnsReady: Boolean(
        process.env.CPANEL_HOST && process.env.CPANEL_API_TOKEN && process.env.SSH_USER,
      ),
    },
    clarity: {
      publicId: identifiers.clarityId,
      projectId: identifiers.clarityProjectId,
      exportTokenConfigured: Boolean(process.env.CLARITY_EXPORT_TOKEN),
    },
  });
}

main();
