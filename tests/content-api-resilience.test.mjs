import assert from "node:assert/strict";
import test from "node:test";

import { createResilientContentReader } from "../src/lib/content-api/resilience.ts";

test("public copy falls back on CMS outage, without retry storms, then recovers", async () => {
  let now = 1_000;
  let queries = 0;
  let warnings = 0;
  let offline = true;
  const read = createResilientContentReader(async (_locale, key) => {
    queries += 1;
    if (offline) throw new Error("secret SQL error must not reach public response");
    return { key, title: "Published copy" };
  }, { now: () => now, cooldownMs: 15_000, reportFailure: () => { warnings += 1; } });

  assert.equal(await read("en", "home.hero"), null);
  assert.equal(warnings, 1);
  for (let n = 0; n < 20; n++) assert.equal(await read("en", "home.hero"), null);
  assert.equal(queries, 1);
  assert.equal(warnings, 1);
  now = 15_999;
  assert.equal(await read("tr", "home.meta"), null);
  assert.equal(queries, 1);
  offline = false;
  now = 16_000;
  assert.deepEqual(await read("en", "home.hero"), { key: "home.hero", title: "Published copy" });
  assert.equal(queries, 2);
  assert.equal(warnings, 1);
  assert.deepEqual(await read("tr", "home.meta"), { key: "home.meta", title: "Published copy" });
  assert.equal(queries, 3);
  offline = true;
  assert.equal(await read("en", "home.hero"), null);
  assert.equal(warnings, 2);
  assert.equal(queries, 4);
});

test("optional CMS disabled/missing overrides do not trigger retries or warnings", async () => {
  let count = 0;
  const read = createResilientContentReader(async () => null, { reportFailure: () => { count += 1; } });
  for (let i = 0; i < 5; i++) assert.equal(await read("en", "home.hero"), null);
  assert.equal(count, 0);
});
