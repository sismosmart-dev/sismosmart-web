import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const root = process.cwd();
const forbiddenPaths = [
  ".azure-pipelines",
  ".env.azure-devops.example",
  "azure-pipelines.yml",
  "scripts/azure-devops",
  "tests/azure-bootstrap.test.mjs",
  "tests/azure-pipelines.test.mjs",
  "docs/superpowers/plans/2026-07-20-azure-pipelines-fallback.md",
  "docs/superpowers/plans/2026-07-21-production-only-azure.md",
  "docs/superpowers/specs/2026-07-20-azure-pipelines-fallback-design.md",
  "docs/superpowers/specs/2026-07-21-production-only-azure-design.md",
];

const ignoredDirectories = new Set([".git", ".next", "node_modules"]);
const textExtensions = new Set([
  ".cjs", ".js", ".json", ".md", ".mjs", ".sh", ".ts", ".tsx", ".yaml", ".yml",
]);

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;
    const path = join(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function extension(path) {
  const index = path.lastIndexOf(".");
  return index === -1 ? "" : path.slice(index);
}

test("legacy secondary CI provider files are absent", () => {
  for (const path of forbiddenPaths) {
    assert.equal(existsSync(join(root, path)), false, `${path} must be removed`);
  }
});

test("active repository content has no legacy provider dependency", () => {
  const forbidden = /Azure DevOps|Azure Pipelines|azure-pipelines|AZDO_|BUILD_SOURCE(?:BRANCH|VERSION)|variable group|service connection|secure file/i;
  const violations = [];
  for (const path of walk(root)) {
    if (!textExtensions.has(extension(path))) continue;
    const relativePath = relative(root, path);
    if (relativePath === "tests/github-only-automation.test.mjs") continue;
    const content = readFileSync(path, "utf8");
    if (forbidden.test(content)) violations.push(relativePath);
  }
  assert.deepEqual(violations, []);
});

test("GitHub Actions is the sole automation control plane", () => {
  const workflows = new Set(readdirSync(join(root, ".github/workflows")));
  for (const required of [
    "quality-ci.yml",
    "security.yml",
    "deploy-prod.yml",
    "production-health.yml",
    "dns-cutover.yml",
    "mail-dns.yml",
    "lighthouse.yml",
    "analytics-observability.yml",
    "pr-commitlint.yml",
    "mainline-policy.yml",
  ]) {
    assert.ok(workflows.has(required), `${required} is required`);
  }
});
