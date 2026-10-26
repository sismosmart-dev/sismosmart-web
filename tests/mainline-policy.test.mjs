import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  mergedMainPullRequests,
  verifyMainlinePrOrigin,
} from "../scripts/ci/verify-mainline-pr-origin.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function mergedMainPr(number = 20) {
  return {
    base: { ref: "main" },
    merged_at: "2026-07-23T00:00:00Z",
    number,
  };
}

test("merged main pull request filtering remains strict", () => {
  assert.deepEqual(
    mergedMainPullRequests([
      mergedMainPr(20),
      { base: { ref: "main" }, merged_at: null, number: 21 },
      { base: { ref: "develop" }, merged_at: "2026-07-23T00:00:00Z", number: 22 },
      { base: null, merged_at: "2026-07-23T00:00:00Z", number: 23 },
      null,
    ]).map((pull) => pull.number),
    [20],
  );
  assert.deepEqual(mergedMainPullRequests(null), []);
});

test("mainline verifier succeeds immediately without sleeping", async () => {
  const requests = [];
  const sleeps = [];
  const logs = [];

  const count = await verifyMainlinePrOrigin({
    commitSha: "abc123",
    fetchImpl: async (url, options) => {
      requests.push({ options, url });
      return jsonResponse([mergedMainPr()]);
    },
    logger: { log: (message) => logs.push(message) },
    repository: "SismoSmart/sismosmart-web",
    sleep: async (delay) => sleeps.push(delay),
    token: "TEST_AUTH_SENTINEL",
  });

  assert.equal(count, 1);
  assert.equal(requests.length, 1);
  assert.equal(sleeps.length, 0);
  assert.equal(
    requests[0].url,
    "https://api.github.com/repos/SismoSmart/sismosmart-web/commits/abc123/pulls",
  );
  assert.equal(requests[0].options.headers.authorization, "Bearer TEST_AUTH_SENTINEL");
  assert.match(logs.at(-1), /abc123 is associated with 1 merged pull request/);
  assert.doesNotMatch(logs.join("\n"), /TEST_AUTH_SENTINEL/);
});

test("mainline verifier tolerates bounded association propagation", async () => {
  const responses = [
    [],
    [
      { base: { ref: "main" }, merged_at: null, number: 21 },
      { base: { ref: "develop" }, merged_at: "2026-07-23T00:00:00Z", number: 22 },
    ],
    [mergedMainPr(23)],
  ];
  const sleeps = [];
  const logs = [];
  let requests = 0;

  const count = await verifyMainlinePrOrigin({
    attempts: 6,
    commitSha: "delayed123",
    delayMs: 25,
    fetchImpl: async () => jsonResponse(responses[requests++]),
    logger: { log: (message) => logs.push(message) },
    repository: "SismoSmart/sismosmart-web",
    sleep: async (delay) => sleeps.push(delay),
    token: "TEST_AUTH_SENTINEL",
  });

  assert.equal(count, 1);
  assert.equal(requests, 3);
  assert.deepEqual(sleeps, [25, 25]);
  assert.equal(logs.filter((line) => /association is not visible yet/.test(line)).length, 2);
  assert.match(logs.at(-1), /delayed123 is associated with 1 merged pull request/);
});

test("mainline verifier fails after the bounded attempt budget", async () => {
  const sleeps = [];
  let requests = 0;

  await assert.rejects(
    verifyMainlinePrOrigin({
      attempts: 3,
      commitSha: "missing123",
      delayMs: 40,
      fetchImpl: async () => {
        requests += 1;
        return jsonResponse([]);
      },
      logger: { log() {} },
      repository: "SismoSmart/sismosmart-web",
      sleep: async (delay) => sleeps.push(delay),
      token: "TEST_AUTH_SENTINEL",
    }),
    /main commit missing123 is not associated with a merged pull request/,
  );

  assert.equal(requests, 3);
  assert.deepEqual(sleeps, [40, 40]);
});

test("GitHub API failures fail closed without retry", async () => {
  const sleeps = [];
  let requests = 0;

  await assert.rejects(
    verifyMainlinePrOrigin({
      attempts: 6,
      commitSha: "forbidden123",
      fetchImpl: async () => {
        requests += 1;
        return jsonResponse({ message: "forbidden" }, 403);
      },
      logger: { log() {} },
      repository: "SismoSmart/sismosmart-web",
      sleep: async (delay) => sleeps.push(delay),
      token: "TEST_AUTH_SENTINEL",
    }),
    /GitHub API request failed with status 403/,
  );

  assert.equal(requests, 1);
  assert.deepEqual(sleeps, []);
});

test("mainline workflow delegates to the tested verifier with read-only permissions", () => {
  const workflow = readText(".github/workflows/mainline-policy.yml");

  assert.match(workflow, /NODE_VERSION: "22\.18\.0"/);
  assert.match(workflow, /actions\/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10/);
  assert.match(workflow, /actions\/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e/);
  assert.match(workflow, /GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(workflow, /node scripts\/ci\/verify-mainline-pr-origin\.mjs/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /pull-requests: read/);
  assert.match(workflow, /name: governance\/pr-origin/);
  assert.doesNotMatch(workflow, /gh api/);
  assert.doesNotMatch(workflow, /merged_pr_count=/);
});
