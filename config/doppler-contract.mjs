export const DOPPLER_PROJECT = "sismosmart-web";

export const DOPPLER_CONFIGS = Object.freeze(["main"]);

export const LEGACY_ENV_KEYS = Object.freeze([
  "MeasurementProtocolAPI",
  "MEASUREMENTPROTOCOLAPI",
]);

export const EPHEMERAL_PROVIDER_KEYS = Object.freeze([
  "GITHUB_TOKEN",
  "GITHUB_SHA",
  "GITHUB_REF_NAME",
  "GITHUB_STEP_SUMMARY",
  "PWD",
  "NODE_ENV",
]);

function define(primaryConfig, configs, classification, required = false) {
  return Object.freeze({
    primaryConfig,
    configs: Object.freeze([...configs]),
    classification,
    required,
  });
}

export const ENVIRONMENT_CONTRACT = Object.freeze({
  NEXT_PUBLIC_ANALYTICS_ENABLED: define("main", ["main"], "public", true),
  NEXT_PUBLIC_CLARITY_ID: define("main", ["main"], "public"),
  NEXT_PUBLIC_GA_ID: define("main", ["main"], "public"),
  NEXT_PUBLIC_GTM_ID: define("main", ["main"], "public"),
  NEXT_PUBLIC_BASE_PATH: define("main", ["main"], "public"),
  PUBLIC_BASE_URL: define("main", ["main"], "public", true),
  SENTRY_DSN: define("main", ["main"], "conditional"),

  // CMS is dormant until independently approved production recovery and release.
  // Register the names without marking disabled-by-default opt-ins as required.
  CMS_DB_ENABLED: define("main", ["main"], "policy"),
  CMS_WRITE_ENABLED: define("main", ["main"], "policy"),
  CMS_DB_HOST: define("main", ["main"], "conditional"),
  CMS_DB_PORT: define("main", ["main"], "conditional"),
  CMS_DB_NAME: define("main", ["main"], "conditional"),
  CMS_DB_USER: define("main", ["main"], "secret"),
  CMS_DB_PASSWORD: define("main", ["main"], "secret"),
  CMS_ADMIN_TOKEN: define("main", ["main"], "secret"),

  CONTACT_FORM_ENDPOINT: define("main", ["main"], "conditional", true),
  FORM_FORWARD_AUTH_TOKEN: define("main", ["main"], "secret"),
  WAITLIST_FORM_ENDPOINT: define("main", ["main"], "conditional", true),

  CPANEL_API_TOKEN: define("main", ["main"], "secret"),
  CPANEL_API_TOKEN_NAME: define("main", ["main"], "conditional"),
  CPANEL_HOST: define("main", ["main"], "conditional", true),
  DOMAIN: define("main", ["main"], "public", true),
  SSH_HOST: define("main", ["main"], "conditional", true),
  SSH_PORT: define("main", ["main"], "conditional"),
  SSH_USER: define("main", ["main"], "conditional", true),
  SSH_PRIVATE_KEY_BASE64: define("main", ["main"], "secret"),
  SSH_PRIVATE_KEY_PASSPHRASE: define("main", ["main"], "secret"),
  SSH_PASSWORD: define("main", ["main"], "secret"),
  WRITE_RUNTIME_ENV_FILE: define("main", ["main"], "policy"),
  REMOTE_HOME: define("main", ["main"], "conditional"),
  REMOTE_APP_ROOT: define("main", ["main"], "conditional"),
  REMOTE_RELEASES_ROOT: define("main", ["main"], "conditional"),
  REMOTE_APP_URI: define("main", ["main"], "conditional"),
  REMOTE_NODE_VERSION: define("main", ["main"], "policy"),
  RELEASE_RETENTION_COUNT: define("main", ["main"], "policy"),
  REMOTE_APP_DOMAIN: define("main", ["main"], "conditional"),
  REMOTE_ORIGIN_HOST: define("main", ["main"], "conditional"),
  REMOTE_PUBLIC_ROOT: define("main", ["main"], "conditional"),
  DEPLOY_MANAGE_CANONICAL_REDIRECTS: define("main", ["main"], "policy"),
  DEPLOY_REQUIRE_FORM_HEALTH: define("main", ["main"], "policy"),

  GOOGLE_ANALYTICS_ACCOUNT_ID: define("main", ["main"], "public"),
  GOOGLE_ANALYTICS_PROPERTY_DISPLAY_NAME: define("main", ["main"], "public"),
  GOOGLE_ANALYTICS_PROPERTY_ID: define("main", ["main"], "public"),
  GOOGLE_ANALYTICS_WEB_STREAM_DISPLAY_NAME: define("main", ["main"], "public"),
  GOOGLE_ANALYTICS_WEB_STREAM_ID: define("main", ["main"], "public"),
  GOOGLE_AUTH_MODE: define("main", ["main"], "policy"),
  GOOGLE_GTM_ACCOUNT_ID: define("main", ["main"], "public"),
  GOOGLE_GTM_CONTAINER_ID: define("main", ["main"], "public"),
  GOOGLE_GTM_WORKSPACE_ID: define("main", ["main"], "public"),
  GOOGLE_OAUTH_CLIENT_ID: define("main", ["main"], "conditional"),
  GOOGLE_OAUTH_CLIENT_SECRET: define("main", ["main"], "secret"),
  GOOGLE_OAUTH_REDIRECT_URI: define("main", ["main"], "conditional"),
  GOOGLE_OAUTH_REFRESH_TOKEN: define("main", ["main"], "secret"),
  GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET: define("main", ["main"], "secret"),
  GOOGLE_SERVICE_ACCOUNT_KEY_PATH: define("main", ["main"], "conditional"),
  GOOGLE_SERVICE_ACCOUNT_JSON: define("main", ["main"], "secret"),
  GOOGLE_SITE_URL: define("main", ["main"], "public"),
  GOOGLE_SEARCH_CONSOLE_SITE: define("main", ["main"], "public"),
  GOOGLE_SITEMAP_URL: define("main", ["main"], "public"),
  GOOGLE_ANALYTICS_TIME_ZONE: define("main", ["main"], "public"),
  GOOGLE_ANALYTICS_CURRENCY_CODE: define("main", ["main"], "public"),
  CLARITY_PROJECT_ID: define("main", ["main"], "public"),
  DNS_ORIGIN_IPV4: define("main", ["main"], "secret", true),
  DNS_LEGACY_IPV4: define("main", ["main"], "secret"),
  CLARITY_EXPORT_TOKEN: define("main", ["main"], "secret"),
});

export function contractKeysForConfig(config) {
  if (!DOPPLER_CONFIGS.includes(config)) {
    throw new Error(`Unsupported Doppler config: ${config}`);
  }

  return Object.entries(ENVIRONMENT_CONTRACT)
    .filter(([, entry]) => entry.configs.includes(config))
    .map(([key]) => key)
    .sort();
}
