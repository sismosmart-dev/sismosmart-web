import "dotenv/config";

export function normalizeCpanelHost(value) {
  if (!value) {
    return undefined;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "CPANEL_HOST must be a valid https:// URL with an explicit port.",
    );
  }

  if (url.protocol !== "https:") {
    throw new Error("CPANEL_HOST must use https://.");
  }
  if (!url.hostname || !url.port) {
    throw new Error("CPANEL_HOST must include a hostname and explicit port.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      "CPANEL_HOST must not contain credentials, query parameters, or fragments.",
    );
  }
  if (url.pathname !== "/") {
    throw new Error("CPANEL_HOST must not include a path.");
  }

  return url.origin;
}

export function normalizeReleaseRetentionCount(value) {
  if (value === undefined || value === null || value === "") {
    return 6;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 6 || String(parsed) !== String(value).trim()) {
    throw new Error(
      "RELEASE_RETENTION_COUNT must be an integer greater than or equal to 6.",
    );
  }

  return parsed;
}

function decodeSshPrivateKey() {
  const base64Key = process.env.SSH_PRIVATE_KEY_BASE64;
  if (base64Key) {
    return Buffer.from(base64Key, "base64").toString("utf8");
  }

  // Some CI/secret stores preserve literal newlines; support that form too.
  return process.env.SSH_PRIVATE_KEY || undefined;
}

const defaultConfig = {
  domain: process.env.DOMAIN || "sismosmart.com",
  sshHost: process.env.SSH_HOST,
  sshPort: Number.parseInt(process.env.SSH_PORT ?? "22", 10),
  sshUser: process.env.SSH_USER,
  // Key-based auth is preferred; SSH_PASSWORD remains only as a fallback for
  // environments not yet migrated to a key.
  sshPrivateKey: decodeSshPrivateKey(),
  sshPrivateKeyPassphrase: process.env.SSH_PRIVATE_KEY_PASSPHRASE || undefined,
  sshPassword: process.env.SSH_PASSWORD,
  remoteHome:
    process.env.REMOTE_HOME ||
    (process.env.SSH_USER ? `/home/${process.env.SSH_USER}` : undefined),
  cpanelHost: normalizeCpanelHost(process.env.CPANEL_HOST),
  cpanelToken: process.env.CPANEL_API_TOKEN,
  remoteAppRoot: process.env.REMOTE_APP_ROOT || "apps/sismosmart-web/current",
  remoteAppDomain:
    process.env.REMOTE_APP_DOMAIN || process.env.DOMAIN || "sismosmart.com",
  remoteReleasesRoot:
    process.env.REMOTE_RELEASES_ROOT || "apps/sismosmart-web/releases",
  remoteAppUri: process.env.REMOTE_APP_URI || "/",
  remoteOriginHost:
    process.env.REMOTE_ORIGIN_HOST ||
    process.env.REMOTE_APP_DOMAIN ||
    process.env.DOMAIN ||
    "sismosmart.com",
  publicBaseUrl:
    process.env.PUBLIC_BASE_URL ||
    `https://${(process.env.DOMAIN || "sismosmart.com").replace(/^www\./, "")}`,
  remoteNodeVersion: process.env.REMOTE_NODE_VERSION || "22.18.0",
  remotePublicRoot: process.env.REMOTE_PUBLIC_ROOT || "public_html",
  manageCanonicalRedirects:
    process.env.DEPLOY_MANAGE_CANONICAL_REDIRECTS !== "false",
  requireFormHealth: process.env.DEPLOY_REQUIRE_FORM_HEALTH !== "false",
  releaseRetentionCount: normalizeReleaseRetentionCount(
    process.env.RELEASE_RETENTION_COUNT,
  ),
  localDeployRoot: ".deploy/standalone",
};

export function getConfig() {
  return defaultConfig;
}

export function requireConfig(keys) {
  const config = getConfig();
  const missing = keys.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment values: ${missing.join(", ")}`);
  }

  return config;
}

// Call alongside requireConfig(): SSH auth is satisfied by either a private
// key (preferred) or a password (legacy fallback), not a single fixed key.
export function requireSshAuth(config) {
  if (!config.sshPrivateKey && !config.sshPassword) {
    throw new Error(
      "Missing SSH credentials: set SSH_PRIVATE_KEY_BASE64 (preferred) or SSH_PASSWORD.",
    );
  }

  return config;
}

// Builds the ssh2/ssh2-sftp-client auth fields for a connect() call.
export function getSshAuthOptions(config) {
  if (config.sshPrivateKey) {
    const options = { privateKey: config.sshPrivateKey };
    if (config.sshPrivateKeyPassphrase) {
      options.passphrase = config.sshPrivateKeyPassphrase;
    }
    return options;
  }

  return { password: config.sshPassword };
}

export function logStep(message) {
  console.log(`\n> ${message}`);
}

export function toRemoteAbsolutePath(config, targetPath) {
  if (targetPath.startsWith("/")) {
    return targetPath;
  }

  if (!config.remoteHome) {
    throw new Error("REMOTE_HOME could not be determined.");
  }

  return `${config.remoteHome.replace(/\/+$/, "")}/${targetPath.replace(/^\/+/, "")}`;
}
