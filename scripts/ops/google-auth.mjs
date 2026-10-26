import fs from "node:fs/promises";
import process from "node:process";

import { google } from "googleapis";

import { ensureRequiredEnv, resolveMaybeRelative } from "./config.mjs";

export const GOOGLE_SCOPES = {
  analyticsReadonly: "https://www.googleapis.com/auth/analytics.readonly",
  analyticsEdit: "https://www.googleapis.com/auth/analytics.edit",
  tagManagerReadonly: "https://www.googleapis.com/auth/tagmanager.readonly",
  tagManagerEditContainers:
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
  tagManagerEditVersions:
    "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
  tagManagerPublish: "https://www.googleapis.com/auth/tagmanager.publish",
  tagManagerManageUsers:
    "https://www.googleapis.com/auth/tagmanager.manage.users",
  searchConsole: "https://www.googleapis.com/auth/webmasters",
  siteVerification: "https://www.googleapis.com/auth/siteverification",
};

function getRequestedAuthMode() {
  return process.env.GOOGLE_AUTH_MODE || "auto";
}

function hasOAuthCredentials() {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  );
}

function hasServiceAccountCredentials() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  );
}

async function getServiceAccountConfig() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return {
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    };
  }

  ensureRequiredEnv(
    ["GOOGLE_SERVICE_ACCOUNT_KEY_PATH"],
    "Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_KEY_PATH.",
  );

  const keyFile = resolveMaybeRelative(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);
  await fs.access(keyFile);

  return { keyFile };
}

async function buildApplicationDefaultAuth(scopes) {
  const auth = new google.auth.GoogleAuth({ scopes });
  const client = await auth.getClient();
  await client.getAccessToken();

  return { client, mode: "application-default" };
}

async function buildServiceAccountAuth(scopes) {
  const config = await getServiceAccountConfig();
  const auth = new google.auth.GoogleAuth({
    ...config,
    scopes,
  });

  const client = await auth.getClient();
  await client.getAccessToken();

  return { client, mode: "service-account" };
}

async function buildOAuthAuth() {
  ensureRequiredEnv(
    [
      "GOOGLE_OAUTH_CLIENT_ID",
      "GOOGLE_OAUTH_CLIENT_SECRET",
      "GOOGLE_OAUTH_REFRESH_TOKEN",
    ],
    "OAuth mode requires client ID, client secret and refresh token.",
  );

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );

  client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });

  await client.getAccessToken();

  return { client, mode: "oauth-refresh-token" };
}

export async function getGoogleAuthClient(scopes) {
  const uniqueScopes = [...new Set(scopes)];
  const authMode = getRequestedAuthMode();

  if (authMode === "adc") {
    return buildApplicationDefaultAuth(uniqueScopes);
  }

  if (authMode === "oauth") {
    return buildOAuthAuth();
  }

  if (authMode === "service-account") {
    return buildServiceAccountAuth(uniqueScopes);
  }

  if (hasOAuthCredentials()) {
    return buildOAuthAuth();
  }

  if (hasServiceAccountCredentials()) {
    return buildServiceAccountAuth(uniqueScopes);
  }

  throw new Error(
    "Google auth is not configured. Add OAuth refresh token credentials, a service account key, or set GOOGLE_AUTH_MODE=adc where Application Default Credentials are available.",
  );
}

export function getGoogleAuthReadiness() {
  return {
    preferredMode: getRequestedAuthMode(),
    oauthReady: hasOAuthCredentials(),
    serviceAccountReady: hasServiceAccountCredentials(),
    applicationDefaultRequested: getRequestedAuthMode() === "adc",
    recommended:
      "OAuth is usually the smoothest option for GA, GTM and Search Console together. Service accounts also work if you grant them explicit access. ADC is intended for authenticated operator machines or workload identity environments.",
  };
}
