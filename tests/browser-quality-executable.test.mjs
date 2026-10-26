import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  browserQualityRevision,
  getBrowserExecutableCandidates,
  resolveBrowserExecutable,
} from "../scripts/test/browser-quality-executable.mjs";
import * as browserQualityRunner from "../scripts/test/browser-quality.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

test("browser runner delegates executable discovery to a focused module", () => {
  const runner = readText("scripts/test/browser-quality.mjs");
  const executable = readText("scripts/test/browser-quality-executable.mjs");

  assert.match(executable, /export const browserQualityRevision/);
  assert.match(executable, /export function getBrowserExecutableCandidates/);
  assert.match(executable, /export async function resolveBrowserExecutable/);
  assert.match(runner, /from "\.\/browser-quality-executable\.mjs"/);
  assert.doesNotMatch(runner, /computeExecutablePath/);
  assert.doesNotMatch(runner, /150\.0\.7871\.24/);
  assert.doesNotMatch(runner, /\/usr\/bin\/google-chrome/);

  assert.equal(browserQualityRunner.browserQualityRevision, browserQualityRevision);
  assert.equal(
    browserQualityRunner.getBrowserExecutableCandidates,
    getBrowserExecutableCandidates,
  );
  assert.equal(browserQualityRunner.resolveBrowserExecutable, resolveBrowserExecutable);
});

test("candidate policy preserves explicit, cache, and platform priority", () => {
  const cacheDir = "/repo/.cache/puppeteer";
  const candidates = getBrowserExecutableCandidates({
    cacheDir,
    env: {
      CHROME_PATH: "/custom/chrome",
      PUPPETEER_EXECUTABLE_PATH: "/custom/headless-shell",
    },
    platform: "linux",
  });

  assert.equal(browserQualityRevision, "150.0.7871.24");
  assert.equal(candidates[0], "/custom/headless-shell");
  assert.equal(candidates[1], "/custom/chrome");
  assert.ok(
    candidates.some(
      (candidate) =>
        candidate.includes(cacheDir) && candidate.includes(browserQualityRevision),
    ),
  );
  assert.deepEqual(candidates.slice(-4), [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ]);
});

test("candidate policy remains stable across macOS, Windows, and duplicates", () => {
  const duplicate = "/same/browser";
  const linux = getBrowserExecutableCandidates({
    cacheDir: "/cache",
    env: {
      CHROME_PATH: duplicate,
      PUPPETEER_EXECUTABLE_PATH: duplicate,
    },
    platform: "linux",
  });
  assert.equal(linux.filter((candidate) => candidate === duplicate).length, 1);
  assert.equal(linux[0], duplicate);

  const mac = getBrowserExecutableCandidates({
    cacheDir: "/cache",
    env: {},
    platform: "darwin",
  });
  assert.deepEqual(mac.slice(-2), [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ]);

  const windows = getBrowserExecutableCandidates({
    cacheDir: "C:\\cache",
    env: {},
    platform: "win32",
  });
  assert.deepEqual(windows.slice(-2), [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ]);
});

test("resolver selects the first accessible candidate", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "browser-executable-"));
  const missing = path.join(directory, "missing-browser");
  const available = path.join(directory, "available-browser");
  writeFileSync(available, "synthetic executable sentinel\n", { mode: 0o700 });

  try {
    const resolved = await resolveBrowserExecutable({
      cacheDir: path.join(directory, "cache"),
      env: {
        CHROME_PATH: available,
        PUPPETEER_EXECUTABLE_PATH: missing,
      },
      platform: "win32",
    });
    assert.equal(resolved, available);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("resolver preserves exact missing-browser guidance", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "browser-missing-"));
  try {
    await assert.rejects(
      () =>
        resolveBrowserExecutable({
          cacheDir: path.join(directory, "cache"),
          env: {},
          platform: "win32",
        }),
      new Error(
        "Chrome Headless Shell 150.0.7871.24 is not installed. Run npm run browser:install.",
      ),
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
