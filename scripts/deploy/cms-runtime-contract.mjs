/**
 * Reject unsafe CMS opt-ins before producing or changing a production runtime
 * environment. Leaving CMS disabled remains valid for existing deployments.
 */
export function validateCmsRuntimeConfiguration(environment = process.env) {
  for (const key of ["CMS_DB_ENABLED", "CMS_WRITE_ENABLED"]) {
    const value = environment[key];
    if (value !== undefined && value !== "" && value !== "true" && value !== "false") {
      throw new Error(`CMS_RUNTIME_INVALID_FLAG: ${key}`);
    }
  }

  if (environment.CMS_WRITE_ENABLED === "true" && environment.CMS_DB_ENABLED !== "true") {
    throw new Error("CMS_RUNTIME_WRITE_REQUIRES_DB");
  }
  if (environment.CMS_DB_ENABLED !== "true") return;

  const required = ["CMS_DB_HOST", "CMS_DB_USER", "CMS_DB_PASSWORD", "CMS_DB_NAME"];
  const missing = required.filter((key) => !String(environment[key] ?? "").trim());
  if (missing.length) {
    throw new Error(`CMS_RUNTIME_MISSING_KEYS: ${missing.join(", ")}`);
  }

  // On this cPanel Passenger host the CMS database is local. Never silently
  // introduce a public SQL connection as part of enabling content editing.
  if (!["localhost", "127.0.0.1", "::1"].includes(environment.CMS_DB_HOST)) {
    throw new Error("CMS_RUNTIME_DATABASE_MUST_BE_LOCAL");
  }
  const port = environment.CMS_DB_PORT ?? "3306";
  const parsedPort = Number(port);
  if (!/^\d+$/.test(String(port)) || !Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error("CMS_RUNTIME_INVALID_DB_PORT");
  }

  if (environment.CMS_WRITE_ENABLED === "true" &&
      !/^[A-Za-z0-9_-]{32,256}$/.test(environment.CMS_ADMIN_TOKEN ?? "")) {
    throw new Error("CMS_RUNTIME_INVALID_ADMIN_TOKEN");
  }
}
