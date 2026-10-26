import assert from "node:assert/strict";
import test from "node:test";

import {
  forwardFormPayload,
  normalizeFormEndpoint,
} from "../src/app/api/_lib/forwarding.ts";

const contactPayload = {
  consent: true,
  email: "browser-contact@example.com",
  locale: "en",
  message: "Synthetic integration message for a controlled local mock.",
  name: "Browser Contact Test",
  path: "/en/contact",
  source: "integration-test",
  subject: "Controlled form forwarding",
  utm_source: "ci",
};

const waitlistPayload = {
  consent: true,
  email: "browser-pilot@example.com",
  locale: "tr",
  name: "Browser Pilot Test",
  number_of_buildings: 3,
  path: "/tr/pilot-program",
  source: "integration-test",
  utm_source: "ci",
};

test("form forwarding uses a controlled envelope and bearer authentication", async () => {
  let observed = null;
  const result = await forwardFormPayload({
    authToken: "controlled-test-token",
    endpoint: "https://mock.invalid/contact",
    fetchImpl: async (url, init) => {
      observed = { init, url: String(url) };
      return new Response(null, { status: 204 });
    },
    now: () => new Date("2026-07-20T00:00:00.000Z"),
    payload: contactPayload,
    target: "contact",
  });
  assert.deepEqual(result, { ok: true });
  assert.equal(observed.url, "https://mock.invalid/contact");
  assert.equal(observed.init.method, "POST");
  assert.equal(observed.init.headers.authorization, "Bearer controlled-test-token");
  assert.equal(observed.init.headers["content-type"], "application/json");
  assert.ok(observed.init.signal instanceof AbortSignal);
  const envelope = JSON.parse(observed.init.body);
  assert.equal(envelope.form, "contact");
  assert.deepEqual(envelope.payload, contactPayload);
  assert.equal(envelope.receivedAt, "2026-07-20T00:00:00.000Z");
});

test("successful forwarding consumes the upstream response body", async () => {
  const upstream = new Response("accepted", { status: 200 });
  const result = await forwardFormPayload({
    endpoint: "https://mock.invalid/contact",
    fetchImpl: async () => upstream,
    payload: contactPayload,
    target: "contact",
  });
  assert.deepEqual(result, { ok: true });
  assert.equal(upstream.bodyUsed, true);
});

test("forwarding omits authorization when no token is configured", async () => {
  let observedHeaders = null;
  const result = await forwardFormPayload({
    endpoint: "https://mock.invalid/waitlist",
    fetchImpl: async (_url, init) => {
      observedHeaders = init.headers;
      return new Response(null, { status: 200 });
    },
    payload: waitlistPayload,
    target: "waitlist",
  });
  assert.deepEqual(result, { ok: true });
  assert.equal("authorization" in observedHeaders, false);
});

test("non-idempotent forwarding does not retry an upstream HTTP failure", async () => {
  let calls = 0;
  const result = await forwardFormPayload({
    endpoint: "https://mock.invalid/contact",
    fetchImpl: async () => {
      calls += 1;
      return new Response(null, { status: 503 });
    },
    payload: contactPayload,
    target: "contact",
  });
  assert.equal(calls, 1);
  assert.deepEqual(result, { code: "FORM_FORWARD_FAILED", ok: false });
});

test("network failures are converted to a controlled failure result", async () => {
  const result = await forwardFormPayload({
    endpoint: "https://mock.invalid/contact",
    fetchImpl: async () => {
      throw new TypeError("synthetic network failure");
    },
    payload: contactPayload,
    target: "contact",
  });
  assert.deepEqual(result, { code: "FORM_FORWARD_FAILED", ok: false });
});

test("missing or unsafe endpoint configuration fails closed", async () => {
  assert.equal(normalizeFormEndpoint(undefined), null);
  assert.equal(normalizeFormEndpoint("file:///tmp/not-allowed"), null);
  assert.equal(normalizeFormEndpoint("https://mock.invalid/path"), "https://mock.invalid/path");
  assert.deepEqual(
    await forwardFormPayload({
      endpoint: "file:///tmp/not-allowed",
      payload: contactPayload,
      target: "contact",
    }),
    { code: "FORM_ENDPOINT_MISSING", ok: false },
  );
});
