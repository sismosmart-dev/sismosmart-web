export const DOPPLER_PROJECT = "sismosmart-web";

export const DOPPLER_CONFIGS = Object.freeze(["prd_sismosmart"]);

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
  NEXT_PUBLIC_ANALYTICS_ENABLED: define("prd_sismosmart", ["prd_sismosmart"], "public", true),
  NEXT_PUBLIC_CLARITY_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  NEXT_PUBLIC_GA_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  NEXT_PUBLIC_GTM_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  NEXT_PUBLIC_BASE_PATH: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  PUBLIC_BASE_URL: define("prd_sismosmart", ["prd_sismosmart"], "public", true),
  SENTRY_DSN: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),

  CONTACT_FORM_ENDPOINT: define("prd_sismosmart", ["prd_sismosmart"], "conditional", true),
  FORM_FORWARD_AUTH_TOKEN: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  WAITLIST_FORM_ENDPOINT: define("prd_sismosmart", ["prd_sismosmart"], "conditional", true),

  CPANEL_API_TOKEN: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  CPANEL_API_TOKEN_NAME: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  CPANEL_HOST: define("prd_sismosmart", ["prd_sismosmart"], "conditional", true),
  DOMAIN: define("prd_sismosmart", ["prd_sismosmart"], "public", true),
  SSH_HOST: define("prd_sismosmart", ["prd_sismosmart"], "conditional", true),
  SSH_PORT: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  SSH_USER: define("prd_sismosmart", ["prd_sismosmart"], "conditional", true),
  SSH_PRIVATE_KEY_BASE64: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  SSH_PRIVATE_KEY_PASSPHRASE: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  SSH_PASSWORD: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  WRITE_RUNTIME_ENV_FILE: define("prd_sismosmart", ["prd_sismosmart"], "policy"),
  REMOTE_HOME: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  REMOTE_APP_ROOT: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  REMOTE_RELEASES_ROOT: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  REMOTE_APP_URI: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  REMOTE_NODE_VERSION: define("prd_sismosmart", ["prd_sismosmart"], "policy"),
  RELEASE_RETENTION_COUNT: define("prd_sismosmart", ["prd_sismosmart"], "policy"),
  REMOTE_APP_DOMAIN: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  REMOTE_ORIGIN_HOST: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  REMOTE_PUBLIC_ROOT: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  DEPLOY_MANAGE_CANONICAL_REDIRECTS: define("prd_sismosmart", ["prd_sismosmart"], "policy"),
  DEPLOY_REQUIRE_FORM_HEALTH: define("prd_sismosmart", ["prd_sismosmart"], "policy"),

  GOOGLE_ANALYTICS_ACCOUNT_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_ANALYTICS_PROPERTY_DISPLAY_NAME: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_ANALYTICS_PROPERTY_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_ANALYTICS_WEB_STREAM_DISPLAY_NAME: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_ANALYTICS_WEB_STREAM_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_AUTH_MODE: define("prd_sismosmart", ["prd_sismosmart"], "policy"),
  GOOGLE_GTM_ACCOUNT_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_GTM_CONTAINER_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_GTM_WORKSPACE_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_OAUTH_CLIENT_ID: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  GOOGLE_OAUTH_CLIENT_SECRET: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  GOOGLE_OAUTH_REDIRECT_URI: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  GOOGLE_OAUTH_REFRESH_TOKEN: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  GOOGLE_SERVICE_ACCOUNT_KEY_PATH: define("prd_sismosmart", ["prd_sismosmart"], "conditional"),
  GOOGLE_SERVICE_ACCOUNT_JSON: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  GOOGLE_SITE_URL: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_SEARCH_CONSOLE_SITE: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_SITEMAP_URL: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_ANALYTICS_TIME_ZONE: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  GOOGLE_ANALYTICS_CURRENCY_CODE: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  CLARITY_PROJECT_ID: define("prd_sismosmart", ["prd_sismosmart"], "public"),
  DNS_ORIGIN_IPV4: define("prd_sismosmart", ["prd_sismosmart"], "secret", true),
  DNS_LEGACY_IPV4: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
  CLARITY_EXPORT_TOKEN: define("prd_sismosmart", ["prd_sismosmart"], "secret"),
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
