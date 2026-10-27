#!/usr/bin/env node
/** Restore proof ONLY against a pre-created isolated, empty MariaDB schema. */
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { pathToFileURL } from "node:url";
import { pipeline } from "node:stream/promises";
import { createConnection } from "mysql2/promise";
import { verifyBackup } from "./cms-db-backup.mjs";

export function isolatedRestoreSettings(env = process.env) {
  const host = env.CMS_RESTORE_HOST || "127.0.0.1";
  const port = Number(env.CMS_RESTORE_PORT || "3306");
  const database = env.CMS_RESTORE_DB || "";
  const user = env.CMS_RESTORE_USER || "";
  const password = env.CMS_RESTORE_PASSWORD || "";
  if (!env.CMS_RESTORE_ISOLATED || env.CMS_RESTORE_ISOLATED !== "true" ||
      !["localhost", "127.0.0.1", "::1"].includes(host) ||
      !/^sismosmart_restore_[a-z0-9_]{3,40}$/.test(database) ||
      !/^[a-z][a-z0-9_]{2,40}$/.test(user) || ["root", "admin", "mysql"].includes(user) ||
      !password || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("CMS_RESTORE_TARGET_UNSAFE");
  }
  return { host, port, database, user, password };
}

export async function assertEmptyRestoreTarget(connection) {
  const [rows] = await connection.query("SHOW FULL TABLES");
  if (rows.length) throw new Error("CMS_RESTORE_TARGET_NOT_EMPTY");
}

/**
 * Distinguish legitimate pre-migration (no CMS tables) backups from broken
 * partial CMS schema, and never silently accept an unexpectedly empty import.
 */
export async function inspectRestoredSchema(connection, { expectEmptySourceSchema = false } = {}) {
  const [rows] = await connection.query("SHOW FULL TABLES");
  const names = new Set(rows.map((row) => String(Object.values(row)[0] ?? "")));
  const hasContent = names.has("cms_content");
  const hasRevision = names.has("cms_revision");
  if (hasContent !== hasRevision) throw new Error("CMS_RESTORE_PARTIAL_CMS_SCHEMA");
  if (names.size === 0 && !expectEmptySourceSchema) {
    throw new Error("CMS_RESTORE_UNEXPECTED_EMPTY_SCHEMA");
  }
  if (!hasContent) {
    return { restoredObjects: names.size, cmsTablesPresent: false, contentRows: null, revisionRows: null };
  }
  const [data] = await connection.query("SELECT COUNT(*) AS count FROM cms_content");
  const [revisions] = await connection.query("SELECT COUNT(*) AS count FROM cms_revision");
  return {
    restoredObjects: names.size,
    cmsTablesPresent: true,
    contentRows: Number(data[0].count),
    revisionRows: Number(revisions[0].count),
  };
}

/** Must run on an independent DB instance with credentials scoped ONLY to the disposable target. */
export async function restoreAndVerify(archive, env = process.env, { command = "mariadb" } = {}) {
  const target = isolatedRestoreSettings(env);
  await verifyBackup(archive);
  const connection = await createConnection({
    host: target.host, port: target.port, database: target.database,
    user: target.user, password: target.password,
    connectTimeout: 2000,
  });
  try {
    await assertEmptyRestoreTarget(connection);
    const child = spawn(command, [
      "--no-defaults", `--host=${target.host}`, `--port=${target.port}`,
      `--user=${target.user}`, target.database,
    ], { env: { ...env, MYSQL_PWD: target.password }, stdio: ["pipe", "ignore", "pipe"] });
    child.stderr.resume(); // Do not leak SQL contents/host details.
    const exit = new Promise((resolve, reject) => {
      child.once("error", () => reject(new Error("CMS_RESTORE_IMPORT_FAILED")));
      child.once("close", (code) => code === 0 ? resolve() : reject(new Error("CMS_RESTORE_IMPORT_FAILED")));
    });
    await Promise.all([
      pipeline(createReadStream(archive), createGunzip(), child.stdin),
      exit,
    ]);
    const inspected = await inspectRestoredSchema(connection, {
      expectEmptySourceSchema: env.CMS_RESTORE_EXPECT_EMPTY_SCHEMA === "true",
    });
    return { ok: true, ...inspected, database: target.database };
  } finally {
    await connection.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const archive = process.argv[2];
  if (!archive?.endsWith(".sql.gz")) {
    console.error("CMS_RESTORE_TEST_FAILED code=ARCHIVE_REQUIRED");
    process.exitCode = 1;
  } else {
    restoreAndVerify(archive).then(({ restoredObjects, cmsTablesPresent, contentRows, revisionRows }) => {
      console.log(`CMS_ISOLATED_RESTORE_OK objects=${restoredObjects} cmsTables=${cmsTablesPresent} contentRows=${contentRows ?? "not_applicable"} revisionRows=${revisionRows ?? "not_applicable"}`);
      console.log("CMS_PRODUCTION_BACKUP_AND_OFFHOST_RETENTION_STILL_REQUIRED=true");
    }).catch(() => {
      console.error("CMS_RESTORE_TEST_FAILED code=PRECONDITION_OR_IMPORT_FAILED");
      process.exitCode = 1;
    });
  }
}
