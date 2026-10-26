import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  resolveOriginAddress,
  resolvePublicDns,
  safeErrorCode,
} from "../scripts/ops/production-health-resolution.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

test("production health runtime delegates address resolution to a focused module", () => {
  const runtime = readText("scripts/ops/production-health.mjs");
  const resolution = readText("scripts/ops/production-health-resolution.mjs");

  assert.match(resolution, /export function safeErrorCode/);
  assert.match(resolution, /export async function resolvePublicDns/);
  assert.match(resolution, /export async function resolveOriginAddress/);
  assert.match(runtime, /from "\.\/production-health-resolution\.mjs"/);
  assert.match(
    runtime,
    /export \{[\s\S]*resolveOriginAddress,[\s\S]*resolvePublicDns,[\s\S]*\} from "\.\/production-health-resolution\.mjs"/,
  );
  assert.doesNotMatch(runtime, /from "node:dns\/promises"/);
  assert.doesNotMatch(runtime, /from "node:net"/);
  assert.doesNotMatch(runtime, /from "node:perf_hooks"/);
  assert.doesNotMatch(runtime, /export async function resolvePublicDns/);
  assert.doesNotMatch(runtime, /export async function resolveOriginAddress/);
});

test("safe error-code normalization preserves only the existing safe pattern", () => {
  assert.equal(safeErrorCode({ code: "EAI_AGAIN" }), "EAI_AGAIN");
  assert.equal(safeErrorCode({ code: 123 }), "123");
  assert.equal(safeErrorCode({ code: "eai_again" }), "REQUEST_FAILED");
  assert.equal(safeErrorCode({ code: "EAI-AGAIN" }), "REQUEST_FAILED");
  assert.equal(safeErrorCode({ code: "EAI AGAIN" }), "REQUEST_FAILED");
  assert.equal(safeErrorCode({}), "REQUEST_FAILED");
  assert.equal(safeErrorCode(null), "REQUEST_FAILED");
  assert.equal(
    safeErrorCode({ code: "unsafe", message: "private details", stack: "stack" }),
    "REQUEST_FAILED",
  );
});

test("public DNS resolution preserves lookup options and rounded timing", async () => {
  const calls = [];
  const times = [100, 101.236];
  const result = await resolvePublicDns({
    hostname: "public.example.test",
    lookupImpl: async (...args) => {
      calls.push(args);
      return [
        { address: "203.0.113.10", family: 4 },
        { address: "2001:db8::10", family: 6 },
      ];
    },
    nowImpl: () => times.shift(),
  });

  assert.deepEqual(calls, [["public.example.test", { all: true }]]);
  assert.deepEqual(result, { durationMs: 1.24, ok: true });
  assert.equal(JSON.stringify(result).includes("203.0.113.10"), false);
});

test("public DNS resolution preserves empty-result behavior", async () => {
  const times = [10, 10.004];
  const result = await resolvePublicDns({
    hostname: "empty.example.test",
    lookupImpl: async () => [],
    nowImpl: () => times.shift(),
  });

  assert.deepEqual(result, { durationMs: 0, ok: false });
});

test("public DNS resolution preserves safe failure timing and code", async () => {
  const times = [50, 53.456];
  const result = await resolvePublicDns({
    hostname: "failure.example.test",
    lookupImpl: async () => {
      const error = new Error("lookup failed");
      error.code = "EAI_AGAIN";
      throw error;
    },
    nowImpl: () => times.shift(),
  });

  assert.deepEqual(result, {
    durationMs: 3.46,
    errorCode: "EAI_AGAIN",
    ok: false,
  });
});

test("public DNS resolution rejects unsafe failure codes", async () => {
  const times = [20, 21];
  const result = await resolvePublicDns({
    hostname: "unsafe.example.test",
    lookupImpl: async () => {
      const error = new Error("lookup failed");
      error.code = "unsafe-code";
      throw error;
    },
    nowImpl: () => times.shift(),
  });

  assert.deepEqual(result, {
    durationMs: 1,
    errorCode: "REQUEST_FAILED",
    ok: false,
  });
});

test("origin resolution preserves direct IPv4 and IPv6 addresses without lookup", async () => {
  let lookupCalls = 0;
  const lookupImpl = async () => {
    lookupCalls += 1;
    throw new Error("lookup must not run");
  };

  assert.deepEqual(
    await resolveOriginAddress({
      config: { sshHost: "203.0.113.20" },
      isIpImpl: () => 4,
      lookupImpl,
    }),
    { address: "203.0.113.20", family: 4, ok: true },
  );
  assert.deepEqual(
    await resolveOriginAddress({
      config: { sshHost: "2001:db8::20" },
      isIpImpl: () => 6,
      lookupImpl,
    }),
    { address: "2001:db8::20", family: 6, ok: true },
  );
  assert.equal(lookupCalls, 0);
});

test("origin resolution preserves hostname lookup result", async () => {
  const calls = [];
  const result = await resolveOriginAddress({
    config: { sshHost: "origin.example.test" },
    isIpImpl: () => 0,
    lookupImpl: async (...args) => {
      calls.push(args);
      return { address: "203.0.113.30", family: 4 };
    },
  });

  assert.deepEqual(calls, [["origin.example.test"]]);
  assert.deepEqual(result, { address: "203.0.113.30", family: 4, ok: true });
});

test("origin resolution preserves safe and unsafe lookup failures", async () => {
  const safeResult = await resolveOriginAddress({
    config: { sshHost: "safe-failure.example.test" },
    isIpImpl: () => 0,
    lookupImpl: async () => {
      const error = new Error("lookup failed");
      error.code = "ENOTFOUND";
      throw error;
    },
  });
  const unsafeResult = await resolveOriginAddress({
    config: { sshHost: "unsafe-failure.example.test" },
    isIpImpl: () => 0,
    lookupImpl: async () => {
      const error = new Error("lookup failed");
      error.code = "unsafe-code";
      throw error;
    },
  });

  assert.deepEqual(safeResult, { errorCode: "ENOTFOUND", ok: false });
  assert.deepEqual(unsafeResult, { errorCode: "REQUEST_FAILED", ok: false });
});
