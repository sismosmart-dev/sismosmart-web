#!/usr/bin/env node
/**
 * Offline-capable CMS SQL dump. The operator must arrange off-host copies,
 * retention and a successful isolated restore before enabling production writes.
 */
import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { chmod, mkdir, readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip, createGunzip } from "node:zlib";
import { pathToFileURL } from "node:url";

function validateBackupDir(location) {
  if (!path.isAbsolute(location) || /(^|\/)(?:public_html|www|htdocs)(?:\/|$)/i.test(location)) {
    throw new Error("CMS_BACKUP_DIRECTORY_UNSAFE");
  }
  return path.resolve(location);
}

export function backupSettings(environment = process.env) {
  const directory = validateBackupDir(environment.CMS_BACKUP_DIR || path.join(homedir(), ".sismosmart-cms", "backups"));
  const user = environment.CMS_BACKUP_USER;
  const password = environment.CMS_BACKUP_PASSWORD;
  const database = environment.CMS_BACKUP_DB || "sismosma_web";
  const host = environment.CMS_BACKUP_HOST || "localhost";
  const port = Number(environment.CMS_BACKUP_PORT || "3306");
  // A production backup must not silently use an obvious administrator account.
  // This name check is not a substitute for verifying actual SELECT-only grants.
  if (!/^[a-zA-Z][a-zA-Z0-9_]{2,63}$/.test(user || "") ||
      ["root", "admin", "administrator", "mysql"].includes(user.toLowerCase()) ||
      !password || !/^[a-zA-Z0-9_]+$/.test(database) ||
      !["localhost", "127.0.0.1", "::1"].includes(host) ||
      !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("CMS_BACKUP_CONFIGURATION_INVALID");
  }
  return { directory, user, password, database, host, port };
}

async function sha256File(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

export async function verifyBackup(archive) {
  const digest = (await readFile(`${archive}.sha256`, "utf8")).trim();
  if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error("CMS_BACKUP_INVALID_CHECKSUM");
  if ((await sha256File(archive)) !== digest) throw new Error("CMS_BACKUP_CHECKSUM_MISMATCH");
  let bytes = 0;
  await pipeline(createReadStream(archive), createGunzip(), async function* (source) {
    for await (const chunk of source) bytes += chunk.length;
  });
  if (bytes === 0) throw new Error("CMS_BACKUP_EMPTY");
  return { verified: true, compressedBytes: (await stat(archive)).size, uncompressedBytes: bytes };
}

export async function createBackup(environment = process.env, { command = "mariadb-dump" } = {}) {
  const options = backupSettings(environment);
  await mkdir(options.directory, { recursive: true, mode: 0o700 });
  const realDir = await realpath(options.directory);
  validateBackupDir(realDir);
  // mkdir's mode does not restrict permissions on a pre-existing directory.
  // Refuse to write any snapshot into a directory accessible by other users.
  const directoryStats = await stat(realDir);
  if (!directoryStats.isDirectory() || (directoryStats.mode & 0o077) !== 0) {
    throw new Error("CMS_BACKUP_DIRECTORY_PERMISSIONS_UNSAFE");
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const base = path.join(realDir, `sismosmart-cms-${stamp}-${randomBytes(4).toString("hex")}.sql.gz`);
  const temporary = `${base}.partial`;
  const args = [
    "--no-defaults", "--single-transaction", "--quick", "--skip-lock-tables",
    // --skip-lock-tables avoids source locks; --skip-add-locks prevents
    // LOCK TABLES statements in the dump that otherwise require extra
    // privileges on the isolated restore user.
    "--no-tablespaces", "--skip-add-locks", "--set-charset", "--default-character-set=utf8mb4",
    `--host=${options.host}`, `--port=${options.port}`, `--user=${options.user}`,
    options.database,
  ];
  try {
    const child = spawn(command, args, {
      env: { ...environment, MYSQL_PWD: options.password },
      stdio: ["ignore", "pipe", "pipe"],
    });
    // Consume diagnostics, but never print arbitrary upstream stderr: it may
    // contain server details, usernames or connection credentials.
    child.stderr.resume();
    const ended = new Promise((resolve, reject) => {
      child.once("error", () => reject(new Error("CMS_BACKUP_DUMP_FAILED")));
      child.once("close", (code) => code === 0 ? resolve() : reject(new Error("CMS_BACKUP_DUMP_FAILED")));
    });
    await Promise.all([
      pipeline(child.stdout, createGzip({ level: 6 }), createWriteStream(temporary, { mode: 0o600, flags: "wx" })),
      ended,
    ]);
    if ((await stat(temporary)).size === 0) throw new Error("CMS_BACKUP_EMPTY");
    await chmod(temporary, 0o600);
    await rename(temporary, base);
    const digest = await sha256File(base);
    await writeFile(`${base}.sha256`, `${digest}\n`, { mode: 0o600, flag: "wx" });
    return { archive: base, ...await verifyBackup(base) };
  } catch (error) {
    await Promise.allSettled([
      rm(temporary, { force: true }),
      rm(base, { force: true }),
      rm(`${base}.sha256`, { force: true }),
    ]);
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createBackup().then(({ archive, compressedBytes, uncompressedBytes }) => {
    console.log(`CMS_BACKUP_OK archive=${archive} compressedBytes=${compressedBytes} sqlBytes=${uncompressedBytes}`);
    console.log("CMS_BACKUP_OFFHOST_AND_ISOLATED_RESTORE_REQUIRED=true");
  }).catch((error) => {
    console.error(`CMS_BACKUP_FAILED code=${error?.message?.startsWith("CMS_BACKUP_") ? error.message : "UNEXPECTED"}`);
    process.exitCode = 1;
  });
}
