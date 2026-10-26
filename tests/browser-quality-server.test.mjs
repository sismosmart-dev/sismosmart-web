import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  isAddressInUseFailure,
  startMockReceiver,
  startNextServer,
  stopChild,
} from "../scripts/test/browser-quality-server.mjs";
import * as browserQualityRunner from "../scripts/test/browser-quality.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

class FakeChild extends EventEmitter {
  constructor({ exitCode = null, graceful = false } = {}) {
    super();
    this.exitCode = exitCode;
    this.graceful = graceful;
    this.signals = [];
  }

  kill(signal) {
    this.signals.push(signal);
    if (signal === "SIGTERM" && this.graceful) {
      this.exitCode = 0;
      queueMicrotask(() => this.emit("exit", 0));
    }
    if (signal === "SIGKILL") {
      this.exitCode = 137;
      queueMicrotask(() => this.emit("exit", 137));
    }
    return true;
  }
}

test("browser runner delegates loopback lifecycle to a focused module", () => {
  const runner = readText("scripts/test/browser-quality.mjs");
  const server = readText("scripts/test/browser-quality-server.mjs");

  assert.match(server, /export function isAddressInUseFailure/);
  assert.match(server, /export async function startMockReceiver/);
  assert.match(server, /export async function startNextServer/);
  assert.match(server, /export async function stopChild/);
  assert.match(runner, /from "\.\/browser-quality-server\.mjs"/);
  assert.doesNotMatch(runner, /createServer/);
  assert.doesNotMatch(runner, /net\.createServer/);
  assert.doesNotMatch(runner, /\bspawn\(/);
  assert.doesNotMatch(runner, /MAX_MOCK_BODY_BYTES/);
  assert.doesNotMatch(runner, /SERVER_READY_TIMEOUT_MS/);
  assert.doesNotMatch(runner, /MAX_APP_START_ATTEMPTS/);
  assert.equal(browserQualityRunner.isAddressInUseFailure, isAddressInUseFailure);
});

test("mock receiver accepts safe contact and waitlist forwarding evidence", async () => {
  const expectedToken = "synthetic-loopback-token";
  const mock = await startMockReceiver({ expectedToken });
  try {
    for (const [route, payload] of [
      [
        "contact",
        {
          locale: "en",
          path: "/en/contact",
          source: "contact-page",
          utm_source: "ci",
        },
      ],
      [
        "waitlist",
        {
          locale: "tr",
          path: "/tr/pilot-program",
          source: "pilot-program",
          utm_source: "ci",
        },
      ],
    ]) {
      const response = await fetch(`${mock.baseUrl}/${route}`, {
        body: JSON.stringify({ form: route, payload }),
        headers: {
          authorization: `Bearer ${expectedToken}`,
          "content-type": "application/json; charset=utf-8",
        },
        method: "POST",
      });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { ok: true });
    }

    assert.deepEqual(mock.records, [
      {
        authorizationMatches: true,
        contentTypeMatches: true,
        formMatches: true,
        locale: "en",
        pagePath: "/en/contact",
        route: "contact",
        source: "contact-page",
        utmSource: "ci",
      },
      {
        authorizationMatches: true,
        contentTypeMatches: true,
        formMatches: true,
        locale: "tr",
        pagePath: "/tr/pilot-program",
        route: "waitlist",
        source: "pilot-program",
        utmSource: "ci",
      },
    ]);
  } finally {
    await mock.close();
  }
});

test("mock receiver rejects unsupported and unsafe requests without raw retention", async () => {
  const mock = await startMockReceiver({
    expectedToken: "synthetic-loopback-token",
    maxBodyBytes: 32,
  });
  try {
    const missing = await fetch(`${mock.baseUrl}/unknown`);
    assert.equal(missing.status, 404);

    const malformed = await fetch(`${mock.baseUrl}/contact`, {
      body: "{not-json",
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    assert.equal(malformed.status, 400);

    const oversized = await fetch(`${mock.baseUrl}/contact`, {
      body: JSON.stringify({ payload: "x".repeat(128) }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    assert.equal(oversized.status, 400);
    assert.deepEqual(mock.records, []);
  } finally {
    await mock.close();
  }
});

test("next server retry is limited to address collisions", async () => {
  const ports = [31001, 31002];
  const attempts = [];
  const success = { baseUrl: "http://127.0.0.1:31002", stop: async () => {} };

  const result = await startNextServer("http://127.0.0.1:39999", {
    findOpenPortImpl: async () => ports.shift(),
    startAttemptImpl: async (_mockBaseUrl, port) => {
      attempts.push(port);
      if (attempts.length === 1) throw new Error("listen EADDRINUSE");
      return success;
    },
  });

  assert.equal(result, success);
  assert.deepEqual(attempts, [31001, 31002]);

  let terminalAttempts = 0;
  await assert.rejects(
    () =>
      startNextServer("http://127.0.0.1:39999", {
        findOpenPortImpl: async () => 32001,
        startAttemptImpl: async () => {
          terminalAttempts += 1;
          throw new Error("Next readiness timed out");
        },
      }),
    /Next readiness timed out/,
  );
  assert.equal(terminalAttempts, 1);
});

test("next server stops after the address collision attempt budget", async () => {
  let attempts = 0;
  await assert.rejects(
    () =>
      startNextServer("http://127.0.0.1:39999", {
        findOpenPortImpl: async () => 33000 + attempts,
        maxAttempts: 4,
        startAttemptImpl: async () => {
          attempts += 1;
          throw new Error(`EADDRINUSE attempt ${attempts}`);
        },
      }),
    /EADDRINUSE attempt 4/,
  );
  assert.equal(attempts, 4);
});

test("child shutdown preserves no-op, graceful, and forced escalation behavior", async () => {
  await stopChild(null);
  const exited = new FakeChild({ exitCode: 0 });
  await stopChild(exited);
  assert.deepEqual(exited.signals, []);

  const graceful = new FakeChild({ graceful: true });
  await stopChild(graceful, { sleepImpl: async () => {} });
  assert.deepEqual(graceful.signals, ["SIGTERM"]);

  const forced = new FakeChild();
  await stopChild(forced, { forceDelayMs: 0, sleepImpl: async () => {} });
  assert.deepEqual(forced.signals, ["SIGTERM", "SIGKILL"]);
});

test("address collision classification remains narrow", () => {
  assert.equal(isAddressInUseFailure("listen EADDRINUSE: address already in use"), true);
  assert.equal(isAddressInUseFailure(new Error("EADDRINUSE on loopback")), true);
  assert.equal(isAddressInUseFailure("Next readiness timed out"), false);
});
