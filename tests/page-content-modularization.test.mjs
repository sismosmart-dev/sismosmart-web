import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { getPages } from "../src/lib/pages.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locales = ["tr", "en", "es", "it", "id", "pt"];

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

test("extra page copy is owned by focused locale modules", () => {
  const pagesSource = readText("src/lib/pages.ts");
  const sharedSource = readText("src/lib/page-content/extra-pages/shared.ts");
  const indexSource = readText("src/lib/page-content/extra-pages/index.ts");

  assert.match(sharedSource, /export function makeExtraPages/);
  assert.match(indexSource, /export const extraPagesByLocale/);

  for (const locale of locales) {
    const localeSource = readText(`src/lib/page-content/extra-pages/${locale}.ts`);
    assert.match(localeSource, /import \{ makeExtraPages \} from "@\/lib\/page-content\/extra-pages\/shared"/);
    assert.match(localeSource, new RegExp(`export const ${locale}ExtraPages = makeExtraPages\\(`));
    assert.match(indexSource, new RegExp(`\\b${locale}: ${locale}ExtraPages\\b`));
  }

  assert.match(
    pagesSource,
    /import \{ extraPagesByLocale \} from "@\/lib\/page-content\/extra-pages\/index"/,
  );
  assert.doesNotMatch(pagesSource, /type ExtraPageInput/);
  assert.doesNotMatch(pagesSource, /type ExtraPagesInput/);
  assert.doesNotMatch(pagesSource, /function toInfoPage/);
  assert.doesNotMatch(pagesSource, /function makeExtraPages/);
  assert.doesNotMatch(pagesSource, /MEMS accelerometer/);
  assert.doesNotMatch(pagesSource, /Pilot program application/);
  assert.ok(
    pagesSource.split("\n").length <= 360,
    `src/lib/pages.ts must remain focused; got ${pagesSource.split("\n").length} lines`,
  );
});

test("representative extra page content matches approved locale values", () => {
  const expectations = {
    tr: {
      technologyMeta: "Bina Hareketi için MEMS Sensörler | SismoSmart",
      technologyFirst: "MEMS ivmeölçer",
      securityLast: "Cihaz güvenlik planı",
    },
    en: {
      technologyMeta: "MEMS Sensors for Building Motion | SismoSmart",
      technologyFirst: "MEMS accelerometer",
      securityLast: "Device security plan",
    },
    es: {
      technologyMeta: "Tecnología: cómo mide SismoSmart",
      technologyFirst: "Acelerómetro MEMS",
      securityLast: "Plan de seguridad del dispositivo",
    },
    it: {
      technologyMeta: "Tecnologia: come misura SismoSmart",
      technologyFirst: "Accelerometro MEMS",
      securityLast: "Piano di sicurezza del dispositivo",
    },
    id: {
      technologyMeta: "Teknologi: bagaimana SismoSmart mengukur",
      technologyFirst: "Akselerometer MEMS",
      securityLast: "Rencana keamanan perangkat",
    },
    pt: {
      technologyMeta: "Tecnologia: como o SismoSmart mede",
      technologyFirst: "Acelerômetro MEMS",
      securityLast: "Plano de segurança do dispositivo",
    },
  };

  for (const locale of locales) {
    const pages = getPages(locale);
    assert.equal(pages.technology.meta.title, expectations[locale].technologyMeta);
    assert.equal(pages.technology.sections.at(0)?.title, expectations[locale].technologyFirst);
    assert.equal(pages.security.sections.at(-1)?.title, expectations[locale].securityLast);
    assert.equal(pages.faq.sections.length, 16);
  }
});
