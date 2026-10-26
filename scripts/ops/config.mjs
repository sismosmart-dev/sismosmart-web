import "dotenv/config";

import path from "node:path";
import process from "node:process";

export const opsConfig = {
  domain: process.env.DOMAIN || "sismosmart.com",
  siteUrl: normalizeSiteUrl(
    process.env.GOOGLE_SITE_URL || `https://${process.env.DOMAIN || "sismosmart.com"}/`,
  ),
  searchConsoleSite:
    process.env.GOOGLE_SEARCH_CONSOLE_SITE ||
    `sc-domain:${process.env.DOMAIN || "sismosmart.com"}`,
  sitemapUrl:
    process.env.GOOGLE_SITEMAP_URL ||
    `https://${process.env.DOMAIN || "sismosmart.com"}/sitemap.xml`,
};

export function normalizeSiteUrl(url) {
  if (!url) {
    return "";
  }

  return url.endsWith("/") ? url : `${url}/`;
}

export function resolveMaybeRelative(filePath) {
  if (!filePath) {
    return "";
  }

  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
}

export function parseCliArgs(argv = process.argv.slice(2)) {
  const positional = [];
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];

    if (!item.startsWith("--")) {
      positional.push(item);
      continue;
    }

    const [rawKey, inlineValue] = item.slice(2).split("=", 2);

    if (inlineValue !== undefined) {
      options[rawKey] = inlineValue;
      continue;
    }

    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      options[rawKey] = true;
      continue;
    }

    options[rawKey] = next;
    index += 1;
  }

  return { positional, options };
}

export function getCommandUsage(scriptName, lines) {
  return [`Usage: npm run ${scriptName} -- <command> [options]`, "", ...lines].join(
    "\n",
  );
}

export function ensureRequiredEnv(keys, contextMessage) {
  const missing = keys.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const suffix = contextMessage ? ` ${contextMessage}` : "";
    throw new Error(`Missing environment variable(s): ${missing.join(", ")}.${suffix}`);
  }
}

export function getRequiredPositional(value, label) {
  if (!value) {
    throw new Error(`Missing required argument: ${label}`);
  }

  return value;
}

export function redactSecret(value) {
  if (!value || typeof value !== "string") return "[empty]";
  if (value.length <= 8) return "[redacted]";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

const sensitiveKeyPattern =
  /(secret|token|password|authorization|authUrl|clientId|client_id|refresh|credential|keyFile|endpoint|gaId|gtmId|clarityId|projectId|accountId|propertyId|streamId|containerId|workspaceId|measurementId|publicId|redirectUri)/i;

const sensitiveValuePatterns = [
  /^(accounts|properties|containers|workspaces|dataStreams)\/.+/i,
  /^G-[A-Z0-9-]+$/i,
  /^GTM-[A-Z0-9-]+$/i,
  /^https:\/\/(www\.)?googletagmanager\.com\/.+/i,
  /^https:\/\/www\.clarity\.ms\/.+/i,
];

function redactValue(key, value) {
  if (value === null || value === undefined || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(key, item));
  }

  if (typeof value === "object") {
    return redactObject(value);
  }

  if (typeof value === "string") {
    if (
      sensitiveKeyPattern.test(key) ||
      sensitiveValuePatterns.some((pattern) => pattern.test(value))
    ) {
      return redactSecret(value);
    }
  }

  return value;
}

export function redactObject(data) {
  if (Array.isArray(data)) {
    return data.map((item) => redactValue("", item));
  }

  if (!data || typeof data !== "object") {
    return data;
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, redactValue(key, value)]),
  );
}

export function printJson(data) {
  console.log(JSON.stringify(redactObject(data), null, 2));
}

export function normalizeGoogleResource(prefix, value) {
  if (!value) {
    return "";
  }

  return value.startsWith(`${prefix}/`) ? value : `${prefix}/${value}`;
}

export function normalizeAccountPath(value) {
  return normalizeGoogleResource("accounts", value);
}

export function normalizePropertyPath(value) {
  return normalizeGoogleResource("properties", value);
}

export function normalizeSearchConsoleSite(value = opsConfig.searchConsoleSite) {
  if (!value) {
    return `sc-domain:${opsConfig.domain}`;
  }

  if (
    value.startsWith("sc-domain:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `sc-domain:${value}`;
}
