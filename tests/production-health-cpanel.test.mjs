import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  classifyCpanelHealthError,
  fetchCpanelHealthResource,
  readCpanelHealth,
} from "../scripts/ops/production-health-cpanel.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function successfulResponse(payload) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function deferred() {
  let reject;
  let resolve;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

const config = {
  cpanelHost: "https://cpanel.example.test:2083",
  cpanelToken: "placeholder-credential",
  sshUser: "example-user",
};

test("production health runtime delegates cPanel reads to a focused module", () => {
  const runtime = readText("scripts/ops/production-health.mjs");
  const adapter = readText("scripts/ops/production-health-cpanel.mjs");

  assert.match(adapter, /export async function fetchCpanelHealthResource/);
  assert.match(adapter, /export async function readCpanelHealth/);
  assert.match(runtime, /import \{ readCpanelHealth \} from "\.\/production-health-cpanel\.mjs"/);
  assert.match(
    runtime,
    /export \{ readCpanelHealth \} from "\.\/production-health-cpanel\.mjs"/,
  );
  assert.doesNotMatch(runtime, /async function fetchCpanel\(/);
  assert.doesNotMatch(runtime, /export async function readCpanelHealth/);
});

test("cPanel request preserves URL, headers, timeout signal, and JSON result", async () => {
  const calls = [];
  const payload = { data: { bytes_used: 123 } };

  const result = await fetchCpanelHealthResource(
    config,
    "Quota",
    "get_quota_info",
    async (...args) => {
      calls.push(args);
      return successfulResponse(payload);
    },
  );

  assert.equal(result, payload);
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0][0],
    "https://cpanel.example.test:2083/execute/Quota/get_quota_info",
  );
  assert.deepEqual(calls[0][1].headers, {
    Accept: "application/json",
    Authorization: "cpanel example-user:placeholder-credential",
  });
  assert.ok(calls[0][1].signal instanceof AbortSignal);
  assert.match(
    readText("scripts/ops/production-health-cpanel.mjs"),
    /AbortSignal\.timeout\(10_000\)/,
  );
});

test("cPanel request preserves exact non-success error classification", async () => {
  let quotaJsonCalled = false;
  await assert.rejects(
    fetchCpanelHealthResource(
      config,
      "Quota",
      "get_quota_info",
      async () => ({
        ok: false,
        status: 403,
        json: async () => {
          quotaJsonCalled = true;
          return {};
        },
      }),
    ),
    /CPANEL_QUOTA_403/,
  );
  assert.equal(quotaJsonCalled, false);

  await assert.rejects(
    fetchCpanelHealthResource(
      config,
      "ResourceUsage",
      "get_usages",
      async () => ({ ok: false, status: 503 }),
    ),
    /CPANEL_RESOURCEUSAGE_503/,
  );
});

test("missing cPanel configuration remains unavailable without requests", async () => {
  for (const missingField of ["cpanelHost", "cpanelToken", "sshUser"]) {
    let fetchCount = 0;
    const result = await readCpanelHealth({
      config: { ...config, [missingField]: "" },
      fetchImpl: async () => {
        fetchCount += 1;
        return successfulResponse({});
      },
    });

    assert.equal(fetchCount, 0, `${missingField} should avoid requests`);
    assert.deepEqual(result, {
      quotaPayload: null,
      resourcePayload: null,
      warnings: ["cPanel quota/resource usage is unavailable"],
    });
  }
});

test("cPanel reads start quota and resource requests concurrently", async () => {
  const calls = [];
  const quota = deferred();
  const resources = deferred();

  const resultPromise = readCpanelHealth({
    config,
    fetchImpl: (url) => {
      calls.push(url);
      return url.includes("/Quota/") ? quota.promise : resources.promise;
    },
  });

  await Promise.resolve();
  assert.deepEqual(calls, [
    "https://cpanel.example.test:2083/execute/Quota/get_quota_info",
    "https://cpanel.example.test:2083/execute/ResourceUsage/get_usages",
  ]);

  quota.resolve(successfulResponse({ quota: true }));
  resources.resolve(successfulResponse({ resources: true }));

  assert.deepEqual(await resultPromise, {
    quotaPayload: { quota: true },
    resourcePayload: { resources: true },
    warnings: [],
  });
});

test("quota-only failure preserves resource payload and quota warning", async () => {
  const result = await readCpanelHealth({
    config,
    fetchImpl: async (url) =>
      url.includes("/Quota/")
        ? { ok: false, status: 429 }
        : successfulResponse({ resource: "ok" }),
  });

  assert.deepEqual(result, {
    quotaPayload: null,
    resourcePayload: { resource: "ok" },
    warnings: ["cPanel quota usage could not be read"],
  });
});

test("resource-only failure preserves quota payload and resource warning", async () => {
  const result = await readCpanelHealth({
    config,
    fetchImpl: async (url) => {
      if (url.includes("/ResourceUsage/")) {
        throw new Error("resource unavailable");
      }
      return successfulResponse({ quota: "ok" });
    },
  });

  assert.deepEqual(result, {
    quotaPayload: { quota: "ok" },
    resourcePayload: null,
    warnings: ["cPanel LVE resource usage could not be read"],
  });
});

test("complete cPanel failure preserves warning order and null payloads", async () => {
  const result = await readCpanelHealth({
    config,
    fetchImpl: async (url) => {
      if (url.includes("/Quota/")) {
        throw new Error("quota unavailable");
      }
      return { ok: false, status: 500 };
    },
  });

  assert.deepEqual(result, {
    quotaPayload: null,
    resourcePayload: null,
    warnings: [
      "cPanel quota usage could not be read",
      "cPanel LVE resource usage could not be read",
    ],
  });
});


test("cPanel diagnostic classifier exposes only allowlisted failure classes", () => {
  const tlsHostname = new Error("sensitive TLS message");
  tlsHostname.cause = { code: "ERR_TLS_CERT_ALTNAME_INVALID" };
  assert.equal(classifyCpanelHealthError(tlsHostname), "TLS_HOSTNAME_MISMATCH");

  const tlsOther = new Error("sensitive TLS message");
  tlsOther.cause = { code: "ERR_TLS_CERT_SIGNATURE_ALGORITHM_UNSUPPORTED" };
  assert.equal(classifyCpanelHealthError(tlsOther), "TLS_OTHER");

  const timeout = new Error("sensitive timeout message");
  timeout.cause = { code: "UND_ERR_CONNECT_TIMEOUT" };
  assert.equal(classifyCpanelHealthError(timeout), "TIMEOUT");

  assert.equal(
    classifyCpanelHealthError(new Error("CPANEL_QUOTA_403")),
    "HTTP_4XX",
  );
  assert.equal(
    classifyCpanelHealthError(new Error("CPANEL_RESOURCEUSAGE_503")),
    "HTTP_5XX",
  );
  assert.equal(
    classifyCpanelHealthError(new Error("CPANEL_QUOTA_UAPI_FAILURE")),
    "UAPI_FAILURE",
  );
  assert.equal(
    classifyCpanelHealthError(new Error("provider-specific private detail")),
    "NETWORK_OR_UNKNOWN",
  );
});

test("cPanel request rejects application-level UAPI failures without response detail", async () => {
  await assert.rejects(
    fetchCpanelHealthResource(
      config,
      "Quota",
      "get_quota_info",
      async () =>
        successfulResponse({
          errors: ["PRIVATE_PROVIDER_DETAIL"],
          status: 0,
        }),
    ),
    (error) => {
      assert.equal(error.message, "CPANEL_QUOTA_UAPI_FAILURE");
      assert.doesNotMatch(error.message, /PRIVATE_PROVIDER_DETAIL/);
      return true;
    },
  );
});

test("cPanel read returns secret-safe per-endpoint diagnostic classes", async () => {
  const result = await readCpanelHealth({
    config,
    includeDiagnostics: true,
    fetchImpl: async (url) => {
      if (url.includes("/Quota/")) {
        const error = new Error("PRIVATE_TLS_DETAIL");
        error.cause = { code: "ERR_TLS_CERT_ALTNAME_INVALID" };
        throw error;
      }
      return { ok: false, status: 404 };
    },
  });

  assert.deepEqual(result.diagnostics, {
    quota: "TLS_HOSTNAME_MISMATCH",
    resources: "HTTP_4XX",
  });
  assert.doesNotMatch(JSON.stringify(result.diagnostics), /PRIVATE_TLS_DETAIL/);
});
