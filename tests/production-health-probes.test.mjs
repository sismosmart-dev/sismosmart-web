import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  fixedLookup,
  measureHttps,
  probeOriginRoutes,
  probePublicRoutes,
  probeRouteSet,
  productionHealthPublicRoutes,
} from "../scripts/ops/production-health-probes.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function createSuccessfulRequest({ body, headers, statusCode, onOptions }) {
  return (options, onResponse) => {
    onOptions(options);
    const request = new EventEmitter();
    request.setTimeout = (milliseconds, callback) => {
      request.timeout = { callback, milliseconds };
    };
    request.destroy = (error) => request.emit("error", error);
    request.end = () => {
      const socket = new EventEmitter();
      request.emit("socket", socket);
      socket.emit("lookup");
      socket.emit("connect");
      socket.emit("secureConnect");

      const response = new EventEmitter();
      response.statusCode = statusCode;
      response.headers = headers;
      onResponse(response);
      if (body) response.emit("data", Buffer.from(body));
      response.emit("end");
    };
    return request;
  };
}

test("production health runtime delegates HTTPS probing to a focused module", () => {
  const runtime = readText("scripts/ops/production-health.mjs");
  const probes = readText("scripts/ops/production-health-probes.mjs");

  assert.match(runtime, /from "\.\/production-health-probes\.mjs"/);
  assert.match(runtime, /export \{[\s\S]*productionHealthPublicRoutes/);
  assert.match(probes, /export const productionHealthPublicRoutes/);
  assert.match(probes, /export async function measureHttps/);
  assert.match(probes, /export async function probeRouteSet/);
  assert.doesNotMatch(runtime, /https\.request/);
  assert.doesNotMatch(runtime, /REQUEST_TIMEOUT_MS/);
  assert.doesNotMatch(runtime, /MAX_CAPTURE_BYTES/);
  assert.doesNotMatch(runtime, /expectedLocationSuffix: "\/en"/);
});

test("public route policy preserves every route and form target", () => {
  assert.deepEqual(productionHealthPublicRoutes, [
    {
      expectedLocationSuffix: "/en",
      expectedStatuses: [307, 308],
      key: "root",
      path: "/",
    },
    { expectedStatuses: [200], key: "en", path: "/en" },
    { expectedStatuses: [200], key: "tr", path: "/tr" },
    { expectedStatuses: [200], key: "robots", path: "/robots.txt" },
    { expectedStatuses: [200], key: "sitemap", path: "/sitemap.xml" },
    {
      expectedStatuses: [200],
      key: "manifest",
      path: "/site.webmanifest",
    },
    {
      expectedStatuses: [200],
      formTarget: "contact",
      key: "contact",
      path: "/api/contact",
    },
    {
      expectedStatuses: [200],
      formTarget: "waitlist",
      key: "waitlist",
      path: "/api/waitlist",
    },
  ]);
});

test("fixed lookup preserves single and all callback shapes", async () => {
  const lookup = fixedLookup("192.0.2.20", 4);

  const single = await new Promise((resolve, reject) => {
    lookup("example.test", {}, (error, address, family) => {
      if (error) reject(error);
      else resolve({ address, family });
    });
  });
  assert.deepEqual(single, { address: "192.0.2.20", family: 4 });

  const all = await new Promise((resolve, reject) => {
    lookup("example.test", { all: true }, (error, addresses) => {
      if (error) reject(error);
      else resolve(addresses);
    });
  });
  assert.deepEqual(all, [{ address: "192.0.2.20", family: 4 }]);
});

test("route sets preserve cold-warm order, delay, and aggregate status", async () => {
  const calls = [];
  let measurementIndex = 0;
  const routes = [
    { expectedStatuses: [200], key: "one", path: "/one" },
    { expectedStatuses: [200], key: "two", path: "/two" },
  ];

  const result = await probeRouteSet(
    { hostname: "example.test", routes },
    {
      measureHttpsImpl: async ({ hostname, route }) => {
        calls.push(["measure", hostname, route.key]);
        measurementIndex += 1;
        return { ok: measurementIndex !== 4, sequence: measurementIndex };
      },
      sleepImpl: async (milliseconds) => calls.push(["sleep", milliseconds]),
    },
  );

  assert.deepEqual(calls, [
    ["measure", "example.test", "one"],
    ["measure", "example.test", "two"],
    ["sleep", 500],
    ["measure", "example.test", "one"],
    ["measure", "example.test", "two"],
  ]);
  assert.deepEqual(result, {
    ok: false,
    routes: [
      {
        cold: { ok: true, sequence: 1 },
        key: "one",
        warm: { ok: true, sequence: 3 },
      },
      {
        cold: { ok: true, sequence: 2 },
        key: "two",
        warm: { ok: false, sequence: 4 },
      },
    ],
  });
});

test("public and origin wrappers preserve hostname and route selection", async () => {
  const captures = [];
  const probeRouteSetImpl = async (options) => {
    captures.push(options);
    return { ok: true, routes: [] };
  };
  const config = { publicBaseUrl: "https://status.example.test" };

  await probePublicRoutes({ config }, { probeRouteSetImpl });
  await probeOriginRoutes(
    { config, origin: { address: "192.0.2.30", family: 4, ok: true } },
    { probeRouteSetImpl },
  );

  assert.equal(captures[0].hostname, "status.example.test");
  assert.deepEqual(
    captures[0].routes.map((route) => route.key),
    ["root", "en", "tr", "robots", "sitemap", "manifest", "contact", "waitlist"],
  );
  assert.equal(captures[1].hostname, "status.example.test");
  assert.deepEqual(captures[1].lookupAddress, {
    address: "192.0.2.30",
    family: 4,
    ok: true,
  });
  assert.deepEqual(
    captures[1].routes.map((route) => route.key),
    ["en", "robots", "contact", "waitlist"],
  );

  let called = false;
  assert.deepEqual(
    await probeOriginRoutes(
      { config, origin: { ok: false } },
      {
        probeRouteSetImpl: async () => {
          called = true;
          return { ok: true, routes: [] };
        },
      },
    ),
    { ok: false, routes: [] },
  );
  assert.equal(called, false);
});

test("HTTPS measurement preserves request, form, Cloudflare, and timing evidence", async () => {
  let capturedOptions;
  const clock = [0, 10, 20, 30, 40, 50];
  const result = await measureHttps(
    {
      hostname: "status.example.test",
      lookupAddress: { address: "192.0.2.30", family: 4 },
      route: {
        expectedStatuses: [200],
        formTarget: "contact",
        key: "contact",
        path: "/api/contact",
      },
    },
    {
      httpsRequestImpl: createSuccessfulRequest({
        body: JSON.stringify({ configured: true, ok: true, target: "contact" }),
        headers: {
          "cf-cache-status": "DYNAMIC",
          "cf-ray": "synthetic",
          server: "cloudflare",
        },
        onOptions: (options) => {
          capturedOptions = options;
        },
        statusCode: 200,
      }),
      nowImpl: () => clock.shift(),
    },
  );

  assert.equal(capturedOptions.agent, false);
  assert.equal(capturedOptions.hostname, "status.example.test");
  assert.equal(capturedOptions.method, "GET");
  assert.equal(capturedOptions.path, "/api/contact");
  assert.equal(capturedOptions.port, 443);
  assert.equal(capturedOptions.rejectUnauthorized, true);
  assert.equal(capturedOptions.servername, "status.example.test");
  assert.deepEqual(capturedOptions.headers, {
    accept: "application/json",
    "user-agent": "SismoSmart-Production-Health/1.0",
  });

  const resolved = await new Promise((resolve, reject) => {
    capturedOptions.lookup("ignored", {}, (error, address, family) => {
      if (error) reject(error);
      else resolve({ address, family });
    });
  });
  assert.deepEqual(resolved, { address: "192.0.2.30", family: 4 });
  assert.deepEqual(result, {
    cacheStatus: "DYNAMIC",
    cloudflare: true,
    configured: true,
    connectMs: 20,
    errorCode: null,
    lookupMs: 10,
    ok: true,
    status: 200,
    target: "contact",
    tlsMs: 30,
    totalMs: 50,
    ttfbMs: 40,
  });
});

test("HTTPS timeout preserves bounded error classification", async () => {
  let timeoutMilliseconds;
  const result = await measureHttps(
    {
      hostname: "status.example.test",
      route: { expectedStatuses: [200], key: "en", path: "/en" },
    },
    {
      httpsRequestImpl: () => {
        const request = new EventEmitter();
        request.setTimeout = (milliseconds, callback) => {
          timeoutMilliseconds = milliseconds;
          request.timeoutCallback = callback;
        };
        request.destroy = (error) => request.emit("error", error);
        request.end = () => request.timeoutCallback();
        return request;
      },
      nowImpl: (() => {
        const clock = [0, 25];
        return () => clock.shift();
      })(),
    },
  );

  assert.equal(timeoutMilliseconds, 20_000);
  assert.deepEqual(result, {
    cacheStatus: null,
    cloudflare: false,
    configured: undefined,
    connectMs: null,
    errorCode: "ETIMEDOUT",
    lookupMs: null,
    ok: false,
    status: null,
    target: undefined,
    tlsMs: null,
    totalMs: 25,
    ttfbMs: null,
  });
});

test("HTTPS errors reject unsafe error codes", async () => {
  const result = await measureHttps(
    {
      hostname: "status.example.test",
      route: { expectedStatuses: [200], key: "en", path: "/en" },
    },
    {
      httpsRequestImpl: () => {
        const request = new EventEmitter();
        request.setTimeout = () => {};
        request.destroy = (error) => request.emit("error", error);
        request.end = () => {
          const error = new Error("synthetic failure");
          error.code = "unsafe-code";
          request.emit("error", error);
        };
        return request;
      },
      nowImpl: (() => {
        const clock = [0, 5];
        return () => clock.shift();
      })(),
    },
  );

  assert.deepEqual(result, {
    cacheStatus: null,
    cloudflare: false,
    configured: undefined,
    connectMs: null,
    errorCode: "REQUEST_FAILED",
    lookupMs: null,
    ok: false,
    status: null,
    target: undefined,
    tlsMs: null,
    totalMs: 5,
    ttfbMs: null,
  });
});
