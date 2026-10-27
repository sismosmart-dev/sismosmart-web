import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { backupSettings, createBackup, verifyBackup } from "../scripts/ops/cms-db-backup.mjs";

const secret = "fake-test-password-only";
const makeConfig = (directory) => ({
  CMS_BACKUP_DIR: directory,
  CMS_BACKUP_USER: "test_backup",
  CMS_BACKUP_PASSWORD: secret,
  CMS_BACKUP_DB: "test_db",
  CMS_BACKUP_HOST: "127.0.0.1",
  CMS_BACKUP_PORT: "3306",
});

async function withTmp(run) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "sismo-cms-backup-test-"));
  try { return await run(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

async function createFakeDump(dir, script) {
  const command = path.join(dir, "fake-dump.sh");
  await writeFile(command, `#!/bin/sh\n${script}\n`, { mode: 0o700 });
  await chmod(command, 0o700);
  return command;
}

test("backup requires dedicated credentials, a safe absolute directory and loopback SQL host", () => {
  const env = makeConfig("/tmp/cms-backup");
  assert.deepEqual(backupSettings(env), {
    directory: "/tmp/cms-backup", user: "test_backup", password: secret,
    database: "test_db", host: "127.0.0.1", port: 3306,
  });
  assert.throws(() => backupSettings({ ...env, CMS_BACKUP_DIR: "relative" }), /CMS_BACKUP_DIRECTORY_UNSAFE/);
  assert.throws(() => backupSettings({ ...env, CMS_BACKUP_DIR: "/home/test/public_html/backups" }), /CMS_BACKUP_DIRECTORY_UNSAFE/);
  assert.throws(() => backupSettings({ ...env, CMS_BACKUP_HOST: "db.example.com" }), /CMS_BACKUP_CONFIGURATION_INVALID/);
  assert.throws(() => backupSettings({ ...env, CMS_BACKUP_PORT: "1;rm" }), /CMS_BACKUP_CONFIGURATION_INVALID/);
  assert.throws(() => backupSettings({ ...env, CMS_BACKUP_DB: "db;DROP" }), /CMS_BACKUP_CONFIGURATION_INVALID/);
  assert.throws(() => backupSettings({ ...env, CMS_BACKUP_PASSWORD: "" }), /CMS_BACKUP_CONFIGURATION_INVALID/);
});

test("genuine gzip archive, verified checksum and restrictive file modes", async () => withTmp(async (dir) => {
  const command = await createFakeDump(dir, `printf 'CREATE TABLE cms_demo (id integer);\\nINSERT INTO cms_demo VALUES (1);\\n'`);
  const output = path.join(dir, "backup-output");
  const result = await createBackup(makeConfig(output), { command });
  assert.equal(result.verified, true);
  assert.ok(result.uncompressedBytes > 30);
  assert.ok(result.archive.startsWith(output));
  assert.equal((await stat(result.archive)).mode & 0o777, 0o600);
  assert.equal((await stat(`${result.archive}.sha256`)).mode & 0o777, 0o600);
  assert.equal((await stat(output)).mode & 0o777, 0o700);
  const verified = await verifyBackup(result.archive);
  assert.equal(verified.uncompressedBytes, result.uncompressedBytes);
  assert.equal((await readdir(output)).length, 2);
}));

test("checksum tampering is detected", async () => withTmp(async (dir) => {
  const command = await createFakeDump(dir, "echo 'CREATE TABLE cms_tamper (id integer);'");
  const result = await createBackup(makeConfig(path.join(dir, "output")), { command });
  await writeFile(result.archive, "broken archive", { mode: 0o600 });
  await assert.rejects(() => verifyBackup(result.archive), /CMS_BACKUP_CHECKSUM_MISMATCH/);
}));

test("failed database dump leaves no partial backup or success artifact", async () => withTmp(async (dir) => {
  const command = await createFakeDump(dir, "echo sensitive-upstream-error 1>&2; echo partial; exit 9");
  const output = path.join(dir, "output");
  await assert.rejects(() => createBackup(makeConfig(output), { command }), /CMS_BACKUP_DUMP_FAILED/);
  assert.deepEqual(await readdir(output), []);
}));

test("backup uses no plaintext password in subprocess arguments", async () => withTmp(async (dir) => {
  const logfile = path.join(dir, "args");
  const command = await createFakeDump(dir, `printf '%s\\n' "$@" > '${logfile}'; echo 'CREATE TABLE cms_test (id integer);'`);
  await createBackup(makeConfig(path.join(dir, "output")), { command });
  const args = await readFile(logfile, "utf8");
  assert.match(args, /--single-transaction/);
  assert.match(args, /--skip-lock-tables/);
  assert.doesNotMatch(args, new RegExp(secret));
}));
