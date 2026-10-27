import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_CONNECT_ATTEMPTS,
  connectFreshClient,
  isTransientConnectError,
  retryDelayMs,
  withConnectRetry,
} from "../scripts/deploy/connection-retry.mjs";

const short = { delayFor: () => 0, pause: async () => {}, warn: () => {} };

test("bounded backoff gives transient SSH throttling time without unbounded waiting", () => {
  assert.equal(MAX_CONNECT_ATTEMPTS, 7);
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(retryDelayMs), [5000, 10000, 15000, 20000, 25000, 30000]);
  assert.equal(isTransientConnectError(new Error("getConnection: Connection lost before handshake")), true);
});

test("transient pre-handshake failure can recover before exhausting budget", async () => {
  let attempts = 0;
  const answer = await withConnectRetry("safe", async () => {
    attempts += 1;
    if (attempts < 6) throw new Error("Connection lost before handshake");
    return "connected";
  }, short);
  assert.equal(answer, "connected");
  assert.equal(attempts, 6);
});

test("nontransient or already-started commands are never retried", async () => {
  for (const error of [new Error("authentication failed"), Object.assign(new Error("ECONNRESET"), { commandStarted: true })]) {
    let attempts = 0;
    await assert.rejects(withConnectRetry("safe", async () => { attempts += 1; throw error; }, short), (actual) => actual === error);
    assert.equal(attempts, 1);
  }
});

test("each rejected SFTP handshake gets a fresh client and failed clients close", async () => {
  const clients = [];
  const connected = await connectFreshClient("SFTP", () => {
    const client = { ended: false, async end() { this.ended = true; } };
    clients.push(client);
    return client;
  }, async () => {
    if (clients.length < 3) throw new Error("Connection lost before handshake");
  }, short);
  assert.equal(clients.length, 3);
  assert.equal(clients[0].ended, true);
  assert.equal(clients[1].ended, true);
  assert.equal(clients[2].ended, false);
  assert.equal(connected, clients[2]);
});

test("persistent transient errors fail closed after the final permitted attempt", async () => {
  let attempts = 0;
  await assert.rejects(withConnectRetry("SSH", async () => {
    attempts += 1;
    throw new Error("Connection lost before handshake");
  }, short), /Connection lost before handshake/);
  assert.equal(attempts, MAX_CONNECT_ATTEMPTS);
});
