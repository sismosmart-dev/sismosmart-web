import fs from "node:fs/promises";
import path from "node:path";

import { getConfig, logStep } from "./config.mjs";
import { copyDirectory, resetDirectory } from "./helpers.mjs";

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findStandaloneRoot(rootPath) {
  const directServerPath = path.join(rootPath, "server.js");

  if (await pathExists(directServerPath)) {
    return rootPath;
  }

  const queue = [rootPath];

  while (queue.length > 0) {
    const current = queue.shift();
    const entries = await fs.readdir(current, { withFileTypes: true });

    if (
      entries.some((entry) => entry.isFile() && entry.name === "server.js") &&
      entries.some((entry) => entry.isFile() && entry.name === "package.json")
    ) {
      return current;
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === "node_modules") {
        continue;
      }

      queue.push(path.join(current, entry.name));
    }
  }

  throw new Error("Could not find standalone server.js output.");
}

async function removeSecretFiles(rootPath) {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      await removeSecretFiles(entryPath);
      continue;
    }

    if (entry.name === ".env" || entry.name.startsWith(".env.")) {
      await fs.rm(entryPath, { force: true });
    }
  }
}

function serializeEnvValue(value) {
  return JSON.stringify(value).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

async function writeRuntimeEnvFile(rootPath) {
  if (process.env.WRITE_RUNTIME_ENV_FILE !== "true") {
    return;
  }

  const runtimeEnvKeys = [
    "CONTACT_FORM_ENDPOINT",
    "FORM_FORWARD_AUTH_TOKEN",
    "NEXT_PUBLIC_CLARITY_ID",
    "NEXT_PUBLIC_GA_ID",
    "NEXT_PUBLIC_GTM_ID",
    "SENTRY_DSN",
    "WAITLIST_FORM_ENDPOINT",
  ];

  const lines = runtimeEnvKeys
    .filter((key) => process.env[key])
    .map((key) => `${key}=${serializeEnvValue(process.env[key])}`);

  if (lines.length === 0) {
    return;
  }

  await fs.writeFile(
    path.join(rootPath, ".env.production"),
    `${lines.join("\n")}\n`,
    { encoding: "utf8", mode: 0o600 },
  );
}

async function main() {
  const config = getConfig();
  const deployRoot = path.resolve(config.localDeployRoot);
  const staticRoot = path.join(deployRoot, ".next", "static");
  const publicRoot = path.join(deployRoot, "public");
  const standaloneRoot = await findStandaloneRoot(path.resolve(".next", "standalone"));

  logStep("Preparing standalone deployment bundle");
  await resetDirectory(deployRoot);

  await copyDirectory(standaloneRoot, deployRoot);
  await fs.mkdir(path.dirname(staticRoot), { recursive: true });
  await copyDirectory(path.resolve(".next", "static"), staticRoot);
  await copyDirectory(path.resolve("public"), publicRoot);
  await removeSecretFiles(deployRoot);
  await writeRuntimeEnvFile(deployRoot);

  const buildBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const startupSource = [
    `process.env.NEXT_PUBLIC_BASE_PATH = ${serializeEnvValue(buildBasePath)};`,
    'import("./server.js");',
    "",
  ].join("\n");

  await fs.writeFile(
    path.join(deployRoot, "app.js"),
    startupSource,
    "utf8",
  );

  console.log(`Standalone bundle ready at ${deployRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
