export const DOPPLER_PROJECT = "sismosmart-web";

export const DOPPLER_CONFIGS = Object.freeze([
  "ci",
  "prd_app",
  "prd_deploy",
  "prd_ops",
]);

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
  NEXT_PUBLIC_ANALYTICS_ENABLED: define("ci", ["ci"], "public", true),
  NEXT_PUBLIC_CLARITY_ID: define("ci", ["ci", "prd_app"], "public"),
  NEXT_PUBLIC_GA_ID: define("ci", ["ci", "prd_app"], "public"),
  NEXT_PUBLIC_GTM_ID: define("ci", ["ci", "prd_app"], "public"),
  NEXT_PUBLIC_BASE_PATH: define("ci", ["ci"], "public"),
  PUBLIC_BASE_URL: define("ci", ["ci", "prd_ops"], "public", true),
  SENTRY_DSN: define("ci", ["ci", "prd_app"], "conditional"),

  CONTACT_FORM_ENDPOINT: define("prd_app", ["prd_app"], "conditional", true),
  FORM_FORWARD_AUTH_TOKEN: define("prd_app", ["prd_app"], "secret"),
  WAITLIST_FORM_ENDPOINT: define("prd_app", ["prd_app"], "conditional", true),

  CPANEL_API_TOKEN: define("prd_deploy", ["prd_deploy", "prd_ops"], "secret"),
  CPANEL_API_TOKEN_NAME: define("prd_deploy", ["prd_deploy", "prd_ops"], "conditional"),
  CPANEL_HOST: define("prd_deploy", ["prd_deploy", "prd_ops"], "conditional", true),
  DOMAIN: define("prd_deploy", ["ci", "prd_deploy", "prd_ops"], "public", true),
  SSH_HOST: define("prd_deploy", ["prd_deploy", "prd_ops"], "conditional", true),
  SSH_PORT: define("prd_deploy", ["prd_deploy", "prd_ops"], "conditional"),
  SSH_USER: define("prd_deploy", ["prd_deploy", "prd_ops"], "conditional", true),
  SSH_PRIVATE_KEY_BASE64: define("prd_deploy", ["prd_deploy", "prd_ops"], "secret"),
  SSH_PRIVATE_KEY_PASSPHRASE: define("prd_deploy", ["prd_deploy", "prd_ops"], "secret"),
  SSH_PASSWORD: define("prd_deploy", ["prd_deploy", "prd_ops"], "secret"),
  WRITE_RUNTIME_ENV_FILE: define("prd_deploy", ["prd_deploy"], "policy"),
  REMOTE_HOME: define("prd_deploy", ["prd_deploy"], "conditional"),
  REMOTE_APP_ROOT: define("prd_deploy", ["prd_deploy"], "conditional"),
  REMOTE_RELEASES_ROOT: define("prd_deploy", ["prd_deploy"], "conditional"),
  REMOTE_APP_URI: define("prd_deploy", ["prd_deploy"], "conditional"),
  REMOTE_NODE_VERSION: define("prd_deploy", ["prd_deploy"], "policy"),
  RELEASE_RETENTION_COUNT: define("prd_deploy", ["prd_deploy"], "policy"),
  REMOTE_APP_DOMAIN: define("prd_deploy", ["prd_deploy"], "conditional"),
  REMOTE_ORIGIN_HOST: define("prd_deploy", ["prd_deploy", "prd_ops"], "conditional"),
  REMOTE_PUBLIC_ROOT: define("prd_deploy", ["prd_deploy"], "conditional"),
  DEPLOY_MANAGE_CANONICAL_REDIRECTS: define("prd_deploy", ["prd_deploy"], "policy"),
  DEPLOY_REQUIRE_FORM_HEALTH: define("prd_deploy", ["prd_deploy"], "policy"),

  GOOGLE_ANALYTICS_ACCOUNT_ID: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_ANALYTICS_PROPERTY_DISPLAY_NAME: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_ANALYTICS_PROPERTY_ID: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_ANALYTICS_WEB_STREAM_DISPLAY_NAME: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_ANALYTICS_WEB_STREAM_ID: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_AUTH_MODE: define("prd_ops", ["prd_ops"], "policy"),
  GOOGLE_GTM_ACCOUNT_ID: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_GTM_CONTAINER_ID: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_GTM_WORKSPACE_ID: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_OAUTH_CLIENT_ID: define("prd_ops", ["prd_ops"], "conditional"),
  GOOGLE_OAUTH_CLIENT_SECRET: define("prd_ops", ["prd_ops"], "secret"),
  GOOGLE_OAUTH_REDIRECT_URI: define("prd_ops", ["prd_ops"], "conditional"),
  GOOGLE_OAUTH_REFRESH_TOKEN: define("prd_ops", ["prd_ops"], "secret"),
  GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET: define("prd_ops", ["prd_ops"], "secret"),
  GOOGLE_SERVICE_ACCOUNT_KEY_PATH: define("prd_ops", ["prd_ops"], "conditional"),
  GOOGLE_SERVICE_ACCOUNT_JSON: define("prd_ops", ["prd_ops"], "secret"),
  GOOGLE_SITE_URL: define("prd_ops", ["ci", "prd_ops"], "public"),
  GOOGLE_SEARCH_CONSOLE_SITE: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_SITEMAP_URL: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_ANALYTICS_TIME_ZONE: define("prd_ops", ["prd_ops"], "public"),
  GOOGLE_ANALYTICS_CURRENCY_CODE: define("prd_ops", ["prd_ops"], "public"),
  CLARITY_PROJECT_ID: define("prd_ops", ["prd_ops"], "public"),
  DNS_ORIGIN_IPV4: define("prd_ops", ["prd_ops"], "secret", true),
  DNS_LEGACY_IPV4: define("prd_ops", ["prd_ops"], "secret"),
  CLARITY_EXPORT_TOKEN: define("prd_ops", ["prd_ops"], "secret"),
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
