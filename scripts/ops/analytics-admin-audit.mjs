import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  classifyAdminFailure,
  summarizeAdminServices,
  validateGoogleAnalyticsStatus,
  validateSearchConsoleStatus,
  validateTagManagerStatus,
} from "./analytics-admin-audit-lib.mjs";
import { parseCliArgs } from "./config.mjs";

const analyticsConfig = JSON.parse(
  await fs.readFile(new URL("../../config/analytics.json", import.meta.url), "utf8"),
);

const services = [
  {
    name: "google-analytics",
    script: "scripts/ops/google-analytics.mjs",
    output: "ga-status.json",
    validate: validateGoogleAnalyticsStatus,
  },
  {
    name: "google-tag-manager",
    script: "scripts/ops/google-tag-manager.mjs",
    output: "gtm-status.json",
    validate: validateTagManagerStatus,
  },
  {
    name: "search-console",
    script: "scripts/ops/search-console.mjs",
    output: "search-console-status.json",
    validate: validateSearchConsoleStatus,
  },
];

function runCommand(script) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script, "status"], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code, signal) => {
      resolve({ code: code ?? 1, signal, stdout, stderr });
    });
  });
}

function parseStatus(stdout, serviceName) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`${serviceName} returned invalid JSON: ${error.message}`);
  }
}

async function writeJson(targetPath, value) {
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function auditService(service, outputDir) {
  const result = await runCommand(service.script);
  const outputPath = path.join(outputDir, service.output);

  if (result.code !== 0) {
    const failure = classifyAdminFailure(result.stderr || result.stdout);
    const record = {
      service: service.name,
      status: failure.severity === "warning" ? "degraded" : "failed",
      category: failure.category,
      message: failure.message,
      exitCode: result.code,
      signal: result.signal,
      checks: [],
    };
    await writeJson(outputPath, record);
    return record;
  }

  let status;
  try {
    status = parseStatus(result.stdout, service.name);
  } catch (error) {
    const record = {
      service: service.name,
      status: "failed",
      category: "invalid-json",
      message: error.message,
      checks: [],
    };
    await writeJson(outputPath, record);
    return record;
  }

  const checks = service.validate(status, analyticsConfig);
  const failedChecks = checks.filter((item) => !item.passed);
  const record = {
    service: service.name,
    status: failedChecks.length === 0 ? "verified" : "failed",
    category: failedChecks.length === 0 ? "resource-verified" : "resource-mismatch",
    checks,
    resource: status,
  };
  await writeJson(outputPath, record);
  return record;
}

async function main() {
  const { options } = parseCliArgs();
  const outputDir = path.resolve(options["output-dir"] || ".artifacts/analytics");
  await fs.mkdir(outputDir, { recursive: true });

  const results = [];
  for (const service of services) {
    results.push(await auditService(service, outputDir));
  }

  const summary = summarizeAdminServices(results);
  const report = {
    generatedAt: new Date().toISOString(),
    canonicalConfig: "config/analytics.json",
    services: results.map((service) => {
      const copy = { ...service };
      delete copy.resource;
      return copy;
    }),
    summary,
  };
  const reportPath = path.join(outputDir, "admin-audit.json");
  await writeJson(reportPath, report);

  console.table(
    results.map((service) => ({
      service: service.service,
      status: service.status,
      category: service.category,
      checks: service.checks?.length || 0,
      failed: service.checks?.filter((item) => !item.passed).length || 0,
    })),
  );
  console.log(`ANALYTICS_ADMIN_AUDIT_REPORT path=${reportPath}`);
  console.log(
    `ANALYTICS_ADMIN_AUDIT_RESULT ok=${summary.ok} degraded=${summary.degraded} passed=${summary.passedChecks} failed=${summary.failedChecks}`,
  );

  if (!summary.ok) process.exitCode = 1;
}

await main();
