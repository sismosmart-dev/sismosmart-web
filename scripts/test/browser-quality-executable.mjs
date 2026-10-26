import { Browser, computeExecutablePath } from "@puppeteer/browsers";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const BROWSER_CACHE_DIR = path.join(PROJECT_ROOT, ".cache", "puppeteer");

export const browserQualityRevision = "150.0.7871.24";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function getBrowserExecutableCandidates({
  cacheDir = BROWSER_CACHE_DIR,
  env = process.env,
  platform = process.platform,
} = {}) {
  let cachedExecutable = "";
  try {
    cachedExecutable = computeExecutablePath({
      browser: Browser.CHROMEHEADLESSSHELL,
      buildId: browserQualityRevision,
      cacheDir,
    });
  } catch {
    cachedExecutable = "";
  }

  const systemCandidates =
    platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
        ]
      : platform === "win32"
        ? [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          ]
        : [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
          ];

  return unique([
    env.PUPPETEER_EXECUTABLE_PATH,
    env.CHROME_PATH,
    cachedExecutable,
    ...systemCandidates,
  ]);
}

export async function resolveBrowserExecutable(options = {}) {
  for (const candidate of getBrowserExecutableCandidates(options)) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Continue to the next explicit, cached, or system candidate.
    }
  }

  throw new Error(
    `Chrome Headless Shell ${browserQualityRevision} is not installed. Run npm run browser:install.`,
  );
}
