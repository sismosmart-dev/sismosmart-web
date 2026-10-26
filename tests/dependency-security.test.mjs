import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const braceCompat = JSON.parse(
  readFileSync("vendor/brace-expansion-compat/package.json", "utf8"),
);

const bracesCompat = JSON.parse(readFileSync("vendor/braces-compat/package.json", "utf8"));

function parts(version) {
  return String(version).replace(/^[^0-9]*/, "").split(".").slice(0, 3).map(Number);
}

function atLeast(version, minimum) {
  const left = parts(version);
  const right = parts(minimum);
  for (let index = 0; index < 3; index += 1) {
    const delta = (left[index] || 0) - (right[index] || 0);
    if (delta !== 0) return delta > 0;
  }
  return true;
}

test("direct dependencies meet the reviewed high-severity security floor", () => {
  assert.equal(atLeast(packageJson.dependencies.next, "16.3.8"), true);
  assert.equal(atLeast(packageJson.dependencies.sharp, "0.35.4"), true);
  assert.equal(atLeast(packageJson.dependencies.react, "19.2.8"), true);
  assert.equal(atLeast(packageJson.dependencies["react-dom"], "19.2.8"), true);
  assert.equal(atLeast(packageJson.dependencies["@sentry/nextjs"], "10.67.0"), true);
});

test("all locked fast-uri instances use the patched compatible release", () => {
  const versions = Object.entries(lock.packages || {})
    .filter(([name]) => name === "node_modules/fast-uri" || name.endsWith("/node_modules/fast-uri"))
    .map(([, metadata]) => metadata.version);
  assert.ok(versions.length > 0, "No fast-uri instances found in lockfile");
  for (const version of versions) {
    assert.equal(atLeast(version, "3.1.8"), true, `Unsafe fast-uri version: ${version}`);
  }
});

test("all locked sharp instances use a patched libvips line", () => {
  const versions = Object.entries(lock.packages || {})
    .filter(([name]) => name === "node_modules/sharp" || name.endsWith("/node_modules/sharp"))
    .map(([, metadata]) => metadata.version);
  assert.ok(versions.length > 0, "No sharp instances found in lockfile");
  for (const version of versions) {
    assert.equal(atLeast(version, "0.35.4"), true, `Unsafe sharp version: ${version}`);
  }
});

test("brace-expansion compatibility wrapper uses the reviewed patched line", () => {
  assert.equal(
    atLeast(braceCompat.dependencies["brace-expansion-upstream"], "5.0.9"),
    true,
  );
});

test("locked braces is the local wrapper over the patched brace-expansion line", () => {
  const versions = Object.entries(lock.packages || {})
    .filter(([name]) => name === "node_modules/braces" || name.endsWith("/node_modules/braces"))
    .map(([, metadata]) => metadata);
  assert.ok(versions.length > 0, "No braces instances found in lockfile");
  for (const metadata of versions) {
    assert.equal(metadata.resolved, "vendor/braces-compat", "braces must resolve to the local wrapper");
  }
  assert.equal(packageJson.overrides.braces, "$braces");
  assert.equal(packageJson.devDependencies.braces, "file:vendor/braces-compat");
  assert.equal(
    atLeast(bracesCompat.dependencies["brace-expansion-upstream"], "5.0.9"),
    true,
  );
});

test("braces wrapper keeps the expansion behavior micromatch and fast-glob rely on", () => {
  const braces = createRequire(import.meta.url)("../vendor/braces-compat/index.js");
  assert.deepEqual(braces("foo/{a,b}/bar", { expand: true }), ["foo/a/bar", "foo/b/bar"]);
  assert.deepEqual(braces("{1..3}", { expand: true }), ["1", "2", "3"]);
  assert.deepEqual(
    braces("a/{b,}/{c,}/*", { expand: true, nodupes: true }).sort(),
    ["a///*", "a//c/*", "a/b//*", "a/b/c/*"],
  );
  assert.deepEqual(braces("foo/{a,b}/bar"), ["(foo/a/bar|foo/b/bar)"]);
  assert.deepEqual(braces("plain/path"), ["plain/path"]);
});
