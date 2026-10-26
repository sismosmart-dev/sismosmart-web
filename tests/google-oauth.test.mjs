import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  REFRESH_TOKEN_CONFIG,
  REFRESH_TOKEN_NAME,
  storeRefreshToken,
} from "../scripts/ops/google-oauth-lib.mjs";

test("refresh token goes to Doppler prd_ops through stdin only", () => {
  const calls = [];
  const stored = storeRefreshToken("secret-refresh-token\n", (command, args, options) => {
    calls.push({ command, args, options });
    return { status: 0 };
  });

  assert.equal(stored, true);
  assert.equal(calls.length, 1);
  const [{ command, args, options }] = calls;
  assert.equal(command, "doppler");
  assert.deepEqual(args, [
    "secrets",
    "set",
    REFRESH_TOKEN_NAME,
    "--project",
    "sismosmart-web",
    "--config",
    REFRESH_TOKEN_CONFIG,
    "--silent",
    "--no-interactive",
  ]);
  assert.equal(REFRESH_TOKEN_CONFIG, "prd_ops");
  assert.equal(options.input, "secret-refresh-token");
  assert.equal(args.some((arg) => arg.includes("secret-refresh-token")), false);
  assert.deepEqual(options.stdio, ["pipe", "ignore", "ignore"]);
});

test("refresh token storage reports failure and ignores an empty token", () => {
  assert.equal(storeRefreshToken("", () => assert.fail("must not run")), false);
  assert.equal(storeRefreshToken(undefined, () => assert.fail("must not run")), false);
  assert.equal(storeRefreshToken("token", () => ({ status: 1 })), false);
  assert.equal(storeRefreshToken("token", () => ({ error: new Error("missing"), status: null })), false);
});

test("OAuth helper no longer writes a persistent .env file", () => {
  const helper = readFileSync("scripts/ops/google-oauth.mjs", "utf8");
  assert.doesNotMatch(helper, /writeFileSync|saved-to-env|"\.env"/);
  assert.match(helper, /storeRefreshToken/);
});

test("OAuth helper prints a usable authorization URL", () => {
  const helper = readFileSync("scripts/ops/google-oauth.mjs", "utf8");
  assert.doesNotMatch(helper, /redactSecret/);
  assert.ok(helper.includes("console.log(authUrl);"));
  assert.ok(helper.includes("authUrl: buildAuthUrl(),"));
  assert.doesNotMatch(helper, /printJson\(\{\s*redirectUri: getRedirectUri\(\),\s*authUrl/);
});

test("OAuth helper does not merge previously granted scopes into the token", () => {
  const helper = readFileSync("scripts/ops/google-oauth.mjs", "utf8");
  assert.match(helper, /include_granted_scopes: false/);
  assert.doesNotMatch(helper, /include_granted_scopes: true/);
});
