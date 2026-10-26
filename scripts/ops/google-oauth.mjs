import http from "node:http";
import process from "node:process";
import { URL } from "node:url";

import { google } from "googleapis";

import {
  ensureRequiredEnv,
  getCommandUsage,
  parseCliArgs,
  printJson,
} from "./config.mjs";
import { GOOGLE_SCOPES } from "./google-auth.mjs";
import { REFRESH_TOKEN_CONFIG, storeRefreshToken } from "./google-oauth-lib.mjs";

const usage = getCommandUsage("ops:google-auth", [
  "scopes",
  "url",
  "listen",
  "exchange [code]",
]);

const defaultScopes = [
  GOOGLE_SCOPES.analyticsReadonly,
  GOOGLE_SCOPES.analyticsEdit,
  GOOGLE_SCOPES.tagManagerReadonly,
  GOOGLE_SCOPES.tagManagerEditContainers,
  GOOGLE_SCOPES.tagManagerEditVersions,
  GOOGLE_SCOPES.tagManagerPublish,
  GOOGLE_SCOPES.searchConsole,
  GOOGLE_SCOPES.siteVerification,
];

const storeFailureWarning =
  `Google returned a refresh token, but it could not be stored in Doppler ${REFRESH_TOKEN_CONFIG}. Check the Doppler CLI session and write access, then re-run the flow.`;

function getRedirectUri() {
  return (
    process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://127.0.0.1:8788/oauth2callback"
  );
}

function buildOAuthClient() {
  ensureRequiredEnv(
    ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"],
    "OAuth helper requires GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.",
  );

  return new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    getRedirectUri(),
  );
}

function buildAuthUrl() {
  const client = buildOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    // Incremental authorization would merge every scope this client was ever granted into the token.
    include_granted_scopes: false,
    scope: defaultScopes,
  });
}

function parsePortFromRedirectUri() {
  const redirectUri = new URL(getRedirectUri());

  if (redirectUri.hostname !== "127.0.0.1" && redirectUri.hostname !== "localhost") {
    throw new Error(
      "GOOGLE_OAUTH_REDIRECT_URI must point to localhost or 127.0.0.1 for the listen flow.",
    );
  }

  return Number(redirectUri.port || 80);
}

async function runScopes() {
  printJson({
    redirectUri: getRedirectUri(),
    scopes: defaultScopes,
  });
}

// The authorization URL carries the OAuth client ID, redirect URI and scopes but no
// secret, and the operator must open it. Redacting it would make the flow unusable.
async function runUrl() {
  console.log(
    JSON.stringify(
      {
        redirectUri: getRedirectUri(),
        authUrl: buildAuthUrl(),
        note: "Open authUrl, approve access, then either use the listen command or run exchange with the returned code.",
      },
      null,
      2,
    ),
  );
}

async function exchangeCode(code) {
  const client = buildOAuthClient();
  const { tokens } = await client.getToken(code);
  const saved = storeRefreshToken(tokens.refresh_token);

  printJson({
    redirectUri: getRedirectUri(),
    refreshToken: saved ? `saved-to-doppler-${REFRESH_TOKEN_CONFIG}` : null,
    expiryDate: tokens.expiry_date || null,
    scope: tokens.scope || null,
    warning: !tokens.refresh_token
      ? "Google did not return a refresh token. Re-run the flow with prompt=consent and make sure this client has not already been granted without offline access."
      : saved
        ? null
        : storeFailureWarning,
  });
}

async function runListen() {
  const authUrl = buildAuthUrl();
  const redirectUri = new URL(getRedirectUri());
  const port = parsePortFromRedirectUri();

  await new Promise((resolve, reject) => {
    const server = http.createServer(async (request, response) => {
      try {
        const requestUrl = new URL(request.url || "/", getRedirectUri());
        const code = requestUrl.searchParams.get("code");
        const error = requestUrl.searchParams.get("error");

        if (error) {
          response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          response.end(`Google authorization failed: ${error}`);
          server.close();
          reject(new Error(`Google authorization failed: ${error}`));
          return;
        }

        if (!code) {
          response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          response.end("Missing code in callback.");
          return;
        }

        const client = buildOAuthClient();
        const { tokens } = await client.getToken(code);
        const saved = storeRefreshToken(tokens.refresh_token);

        response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(
          "Authorization completed. You can close this tab and return to the terminal.",
        );

        server.close();

        printJson({
          redirectUri: getRedirectUri(),
          refreshToken: saved ? `saved-to-doppler-${REFRESH_TOKEN_CONFIG}` : null,
          expiryDate: tokens.expiry_date || null,
          scope: tokens.scope || null,
          warning: !tokens.refresh_token
            ? "Google did not return a refresh token. Re-run after revoking the app or with a fresh OAuth client if needed."
            : saved
              ? null
              : storeFailureWarning,
        });

        resolve();
      } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Token exchange failed. Check terminal output.");
        server.close();
        reject(error);
      }
    });

    server.on("error", reject);

    server.listen(port, redirectUri.hostname, () => {
      console.log(`Listening for Google OAuth callback on ${getRedirectUri()}`);
      console.log("");
      console.log("Open this URL in a browser and approve access. It holds no secret.");
      console.log(authUrl);
      console.log("");
    });
  });
}

async function main() {
  const { positional } = parseCliArgs();
  const [command = "help", firstArg] = positional;

  switch (command) {
    case "scopes":
      await runScopes();
      break;
    case "url":
      await runUrl();
      break;
    case "listen":
      await runListen();
      break;
    case "exchange":
      if (!firstArg) {
        throw new Error(`Missing code argument.\n\n${usage}`);
      }
      await exchangeCode(firstArg);
      break;
    case "help":
    case "--help":
    case "-h":
      console.log(usage);
      break;
    default:
      throw new Error(`Unknown Google OAuth command: ${command}\n\n${usage}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
