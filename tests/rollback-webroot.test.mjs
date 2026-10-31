import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertDirectReleasePath,
  capturePreviousWebrootScript,
  restoreWebrootScript,
  shellQuote,
  verifyWebrootSnapshotScript,
  webrootSnapshotFiles,
} from "../scripts/deploy/rollback-webroot.mjs";

const execute = (command) => execSync(command, {
  shell: "/bin/bash", stdio: "pipe", timeout: 10_000,
});

test("snapshot capture retains exact previous webroot, including .htaccess", () => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "sismosmart-webroot-test-"));
  try {
    const releasesRoot = path.join(workspace, "releases");
    const prior = path.join(releasesRoot, "2026-10-27");
    const publicRoot = path.join(workspace, "public_html");
    mkdirSync(path.join(prior, ".next"), { recursive: true });
    mkdirSync(path.join(publicRoot, "images"), { recursive: true });
    writeFileSync(path.join(prior, "app.js"), "app");
    writeFileSync(path.join(prior, ".next", "BUILD_ID"), "build-1");
    writeFileSync(path.join(publicRoot, ".htaccess"), "PassengerAppRoot old\n");
    writeFileSync(path.join(publicRoot, "images", "logo.svg"), "old-logo");
    const backup = path.join(workspace, "previous-webroot.tar.gz");
    execute("tar -czf " + shellQuote(backup) + " -C " + shellQuote(publicRoot) + " .");
    execute(capturePreviousWebrootScript({
      releasesRoot, previousRelease: prior, backupArchive: backup,
    }));
    const { archive, digest } = webrootSnapshotFiles(releasesRoot, prior);
    assert.equal(existsSync(archive), true);
    assert.equal(existsSync(digest), true);
    execute(verifyWebrootSnapshotScript(releasesRoot, prior));
    assert.equal(existsSync(backup), true, "automatic rollback archive remains intact");
    writeFileSync(path.join(publicRoot, ".htaccess"), "PassengerAppRoot new\n");
    writeFileSync(path.join(publicRoot, "images", "logo.svg"), "new-logo");
    writeFileSync(path.join(publicRoot, "stale.txt"), "stale");
    execute(restoreWebrootScript(publicRoot, archive));
    assert.equal(readFileSync(path.join(publicRoot, ".htaccess"), "utf8"), "PassengerAppRoot old\n");
    assert.equal(readFileSync(path.join(publicRoot, "images", "logo.svg"), "utf8"), "old-logo");
    assert.equal(existsSync(path.join(publicRoot, "stale.txt")), false);
    // An altered backup must not be accepted even if tar can still be opened.
    writeFileSync(archive, "tampered");
    assert.throws(() => execute(verifyWebrootSnapshotScript(releasesRoot, prior)));
  } finally {
    rmSync(workspace, { force: true, recursive: true });
  }
});

test("candidate must be a direct retained release path", () => {
  assert.equal(assertDirectReleasePath("/releases", "/releases/older"), "/releases/older");
  assert.throws(() => assertDirectReleasePath("/releases", "/elsewhere/older"), /INVALID/);
  assert.throws(() => assertDirectReleasePath("/releases", "/releases/older/deep"), /INVALID/);
  assert.throws(() => assertDirectReleasePath("/releases", ""), /INVALID/);
});

test("missing snapshot fails before webroot cleanup", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "sismosmart-webroot-missing-"));
  try {
    const prior = path.join(root, "releases", "old");
    mkdirSync(prior, { recursive: true });
    const publicRoot = path.join(root, "public_html");
    mkdirSync(publicRoot);
    writeFileSync(path.join(publicRoot, "sentinel"), "retain");
    assert.throws(
      () => execute(verifyWebrootSnapshotScript(path.join(root, "releases"), prior)),
    );
    assert.equal(readFileSync(path.join(publicRoot, "sentinel"), "utf8"), "retain");
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("shell quoting does not interpret path metacharacters", () => {
  const raw = "space'; echo injection #";
  const result = execute("printf '%s' " + shellQuote(raw)).toString();
  assert.equal(result, raw);
});
