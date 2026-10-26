import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  assert.equal(fs.existsSync(absolutePath), true, `${relativePath} must exist`);
  return fs.readFileSync(absolutePath, "utf8");
}

const labelHeavyModules = [
  ["product-page.tsx", "ProductPage", "productLabels"],
  ["how-it-works-page.tsx", "HowItWorksPage", "howItWorksLabels"],
  ["about-page.tsx", "AboutPage", "aboutLabels"],
];

test("label-heavy localized pages own their rendering dependencies", () => {
  const dispatcher = readText("src/components/localized-subpage.tsx");

  for (const [file, component, labels] of labelHeavyModules) {
    const source = readText(`src/components/localized-pages/${file}`);
    assert.match(source, new RegExp(`export function ${component}`));
    assert.match(source, new RegExp(`const ${labels}`));
    assert.match(dispatcher, new RegExp(component));
    assert.doesNotMatch(dispatcher, new RegExp(`const ${labels}`));
  }
});

const remainingModules = [
  ["pilot-program-page.tsx", "PilotProgramPage"],
  ["faq-page.tsx", "FaqPage"],
  ["contact-page.tsx", "ContactPage"],
  ["info-page.tsx", "InfoPage"],
];

test("remaining localized page renderers are focused modules", () => {
  const dispatcher = readText("src/components/localized-subpage.tsx");

  for (const [file, component] of remainingModules) {
    const source = readText(`src/components/localized-pages/${file}`);
    assert.match(source, new RegExp(`export function ${component}`));
    assert.match(dispatcher, new RegExp(component));
  }
});

test("localized page dispatcher contains routing only", () => {
  const dispatcher = readText("src/components/localized-subpage.tsx");

  assert.ok(
    dispatcher.split("\n").length <= 90,
    "localized-subpage.tsx must remain a small dispatcher",
  );
  assert.doesNotMatch(dispatcher, /<main\b/);
  assert.doesNotMatch(
    dispatcher,
    /const (frequencyTrendLabels|productLabels|howItWorksLabels|aboutLabels)/,
  );
  for (const pageKey of [
    "product",
    "technology",
    "investors",
    "security",
    "howItWorks",
    "pilotProgram",
    "faq",
    "about",
    "contact",
    "press",
    "privacy",
    "terms",
  ]) {
    assert.match(dispatcher, new RegExp(`case "${pageKey}"`));
  }
});
