import { spawnSync } from "node:child_process";

import { DOPPLER_PROJECT } from "../../config/doppler-contract.mjs";

export const REFRESH_TOKEN_NAME = "GOOGLE_OAUTH_REFRESH_TOKEN";
export const REFRESH_TOKEN_CONFIG = "prd_ops";

/**
 * Stores a Google OAuth refresh token in the Doppler prd_ops config.
 *
 * The value goes to the Doppler CLI through stdin only. It is never placed in
 * argv, written to a file, or echoed, which keeps the production-only model
 * (no persistent .env) intact. Requires an authorized Doppler session with
 * write access to prd_ops.
 */
export function storeRefreshToken(refreshToken, run = spawnSync) {
  if (!refreshToken) {
    return false;
  }

  const result = run(
    "doppler",
    [
      "secrets",
      "set",
      REFRESH_TOKEN_NAME,
      "--project",
      DOPPLER_PROJECT,
      "--config",
      REFRESH_TOKEN_CONFIG,
      "--silent",
      "--no-interactive",
    ],
    {
      input: String(refreshToken).replace(/\r?\n/g, ""),
      stdio: ["pipe", "ignore", "ignore"],
    },
  );

  return !result.error && result.status === 0;
}
