export type CmsDatabaseConfig = {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
};

/** Database reads are opt-in; the existing TypeScript copy remains authoritative. */
export function getCmsDatabaseConfig(environment: NodeJS.ProcessEnv = process.env): CmsDatabaseConfig | null {
  if (environment.CMS_DB_ENABLED !== "true") return null;

  const host = environment.CMS_DB_HOST?.trim();
  const user = environment.CMS_DB_USER?.trim();
  const password = environment.CMS_DB_PASSWORD;
  const database = environment.CMS_DB_NAME?.trim();
  const port = Number(environment.CMS_DB_PORT || "3306");

  if (!host || !user || !password || !database || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("CMS_DB_CONFIG_INCOMPLETE");
  }
  return { host, user, password, database, port };
}
