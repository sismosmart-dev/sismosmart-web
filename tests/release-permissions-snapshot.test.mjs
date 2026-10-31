import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, statSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { releaseSensitiveFileExpression } from "../scripts/deploy/permissions-lib.mjs";

test("release permission normalization keeps rollback backups and env private", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "sismosmart-permissions-"));
  try {
    const secrets = [".env.production", ".rollback-public-html.tar.gz",
      ".rollback-public-html.tar.gz.sha256"];
    for (const name of [...secrets, "app.js"]) {
      writeFileSync(path.join(root, name), "test");
    }
    const expr = releaseSensitiveFileExpression();
    const quoted = "'" + root.replaceAll("'", "'\"'\"'") + "'";
    const command = "find " + quoted + " -xdev -type f ! " + expr +
      " -exec chmod 0644 {} + && find " + quoted +
      " -xdev -type f " + expr + " -exec chmod 0600 {} +";
    execFileSync("bash", ["-lc", command], { timeout: 5000 });
    for (const name of secrets) {
      assert.equal(statSync(path.join(root, name)).mode & 0o777, 0o600, name);
    }
    assert.equal(statSync(path.join(root, "app.js")).mode & 0o777, 0o644);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("production audit distinguishes protected archives from normal release files", () => {
  const source = readFileSync(new URL("../scripts/deploy/permissions-lib.mjs", import.meta.url), "utf8");
  assert.match(source, /release_bad_regular=.*releaseExpression/);
  assert.match(source, /release_bad_secrets=.*releaseExpression/);
  assert.match(source, /find .* -type f ! \$\{releaseExpression\} -exec chmod 0644/);
});
