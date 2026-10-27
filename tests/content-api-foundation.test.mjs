import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  isContentKey,
  isContentLocale,
  validateContentDocument,
} from "../src/lib/content-api/contracts.ts";
import { getCmsDatabaseConfig } from "../src/lib/content-api/config.ts";
import { readPublishedContent } from "../src/lib/content-api/query.ts";

const hero = { title: "A building-monitoring device", description: "Validation in progress." };

test("all six site languages are accepted; unrecognized content keys fail closed", () => {
  for (const locale of ["en", "tr", "es", "id", "pt", "it"]) {
    assert.equal(isContentLocale(locale), true);
  }
  assert.equal(isContentLocale("fr"), false);
  assert.equal(isContentLocale("en' OR 1=1"), false);
  assert.equal(isContentKey("home.hero"), true);
  assert.equal(isContentKey("home.meta"), true);
  assert.equal(isContentKey("navigation.admin"), false);
});

test("hero/meta documents have bounded, HTML-free, strictly defined fields", () => {
  assert.deepEqual(validateContentDocument("home.hero", hero), hero);
  assert.deepEqual(validateContentDocument("home.meta", { title: "SismoSmart", description: "Under development." }), {
    title: "SismoSmart",
    description: "Under development.",
  });
  assert.throws(() => validateContentDocument("home.hero", { title: "", description: "valid" }));
  assert.throws(() => validateContentDocument("home.hero", { ...hero, extra: "unapproved" }));
  assert.throws(() => validateContentDocument("home.hero", { ...hero, title: "<script>alert(1)</script>" }), /CMS_HTML_NOT_ALLOWED/);
  assert.throws(() => validateContentDocument("home.meta", { title: "T".repeat(161), description: "Description" }));
});

test("database remains disconnected unless all runtime-only settings are explicit", () => {
  const base = {
    CMS_DB_HOST: "localhost",
    CMS_DB_USER: "cms_runtime_user",
    CMS_DB_PASSWORD: "test-nonproduction-value",
    CMS_DB_NAME: "sismosma_web",
  };
  assert.equal(getCmsDatabaseConfig(base), null);
  assert.equal(getCmsDatabaseConfig({ ...base, CMS_DB_ENABLED: "false" }), null);
  assert.deepEqual(getCmsDatabaseConfig({ ...base, CMS_DB_ENABLED: "true" }), {
    host: "localhost", port: 3306, user: "cms_runtime_user",
    password: "test-nonproduction-value", database: "sismosma_web",
  });
  assert.throws(() => getCmsDatabaseConfig({ ...base, CMS_DB_ENABLED: "true", CMS_DB_PORT: "bad" }), /CMS_DB_CONFIG_INCOMPLETE/);
  assert.throws(() => getCmsDatabaseConfig({ CMS_DB_ENABLED: "true" }), /CMS_DB_CONFIG_INCOMPLETE/);
});

test("parameterized public query returns only approved published JSON, never drafts", async () => {
  const calls = [];
  const database = { execute: async (sql, args) => {
    calls.push({ sql, args });
    return [[{ published_json: JSON.stringify(hero), draft_json: JSON.stringify({ title: "private" }) }], []];
  } };
  assert.deepEqual(await readPublishedContent(database, "en", "home.hero"), hero);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /SELECT published_json FROM cms_content WHERE locale = \? AND content_key = \? LIMIT 1/);
  assert.deepEqual(calls[0].args, ["en", "home.hero"]);
  assert.equal(await readPublishedContent({ execute: async () => [[], []] }, "en", "home.meta"), null);
  await assert.rejects(() => readPublishedContent(database, "xx", "home.hero"), /CMS_INVALID_CONTENT_KEY/);
  await assert.rejects(() => readPublishedContent(database, "en", "unsafe.key"), /CMS_INVALID_CONTENT_KEY/);
});

test("SQL migration is additive and does not change existing tables", () => {
  const sql = readFileSync("migrations/001_content_api.sql", "utf8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS cms_content/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS cms_revision/);
  assert.match(sql, /PRIMARY KEY \(locale, content_key\)/);
  assert.match(sql, /PRIMARY KEY \(locale, content_key, version\)/);
  assert.match(sql, /ENGINE=InnoDB/);
  assert.match(sql, /utf8mb4/);
  assert.doesNotMatch(sql, /^\s*(DROP|DELETE|TRUNCATE|ALTER|GRANT|INSERT|UPDATE)\s/mi);
});
