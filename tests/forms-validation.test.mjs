import assert from "node:assert/strict";
import { test } from "node:test";

import {
  contactSchema,
  getClientKey,
  hasSpamTrap,
  maxFormBodyBytes,
  maxRequestsPerWindow,
  readLimitedJsonBody,
  RateLimiter,
  waitlistSchema,
} from "../src/app/api/_lib/validation.ts";

const validContact = {
  consent: true,
  email: "person@example.com",
  message: "Hello, I would like to know more about the pilot program.",
  name: "Ada Lovelace",
  subject: "Pilot program",
};

const validWaitlist = {
  consent: true,
  email: "person@example.com",
};


test("readLimitedJsonBody parses JSON below the byte limit", async () => {
  const request = new Request("https://example.test/api/contact", {
    body: JSON.stringify(validContact),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const result = await readLimitedJsonBody(request);

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, validContact);
});

test("readLimitedJsonBody rejects a declared oversized payload", async () => {
  const request = new Request("https://example.test/api/contact", {
    body: "{}",
    headers: {
      "content-length": String(maxFormBodyBytes + 1),
      "content-type": "application/json",
    },
    method: "POST",
  });
  const result = await readLimitedJsonBody(request);

  assert.deepEqual(result, { code: "PAYLOAD_TOO_LARGE", ok: false });
});

test("readLimitedJsonBody rejects a streamed payload above the byte limit", async () => {
  const request = new Request("https://example.test/api/contact", {
    body: JSON.stringify({ message: "x".repeat(maxFormBodyBytes) }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const result = await readLimitedJsonBody(request);

  assert.deepEqual(result, { code: "PAYLOAD_TOO_LARGE", ok: false });
});

test("readLimitedJsonBody rejects malformed JSON", async () => {
  const request = new Request("https://example.test/api/contact", {
    body: "{not-json",
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const result = await readLimitedJsonBody(request);

  assert.deepEqual(result, { code: "INVALID_JSON", ok: false });
});

test("contactSchema accepts a well-formed submission", () => {
  const result = contactSchema.safeParse(validContact);
  assert.equal(result.success, true);
});

test("contactSchema rejects a missing/invalid email", () => {
  const result = contactSchema.safeParse({ ...validContact, email: "not-an-email" });
  assert.equal(result.success, false);
});

test("contactSchema rejects a message that is too short", () => {
  const result = contactSchema.safeParse({ ...validContact, message: "hi" });
  assert.equal(result.success, false);
});

test("contactSchema rejects consent values other than true/'true'/'on'", () => {
  const result = contactSchema.safeParse({ ...validContact, consent: "nope" });
  assert.equal(result.success, false);
});

test("contactSchema accepts consent as the string 'on' (native HTML checkbox)", () => {
  const result = contactSchema.safeParse({ ...validContact, consent: "on" });
  assert.equal(result.success, true);
});

test("waitlistSchema accepts a minimal submission (only email + consent required)", () => {
  const result = waitlistSchema.safeParse(validWaitlist);
  assert.equal(result.success, true);
});

test("waitlistSchema coerces number_of_buildings from a numeric string", () => {
  const result = waitlistSchema.safeParse({ ...validWaitlist, number_of_buildings: "12" });
  assert.equal(result.success, true);
  assert.equal(result.data?.number_of_buildings, 12);
});

test("waitlistSchema treats an empty number_of_buildings string as absent", () => {
  const result = waitlistSchema.safeParse({ ...validWaitlist, number_of_buildings: "" });
  assert.equal(result.success, true);
  assert.equal(result.data?.number_of_buildings, undefined);
});

test("waitlistSchema rejects an out-of-range number_of_buildings", () => {
  const result = waitlistSchema.safeParse({ ...validWaitlist, number_of_buildings: "999999" });
  assert.equal(result.success, false);
});

test("hasSpamTrap flags a filled honeypot field", () => {
  assert.equal(hasSpamTrap({ ...validContact, website: "http://spam.example" }), true);
  assert.equal(hasSpamTrap({ ...validContact, company_url: "spam" }), true);
  assert.equal(hasSpamTrap({ ...validContact, homepage: "spam" }), true);
});

test("hasSpamTrap ignores empty/whitespace honeypot fields", () => {
  assert.equal(hasSpamTrap({ ...validContact, website: "" }), false);
  assert.equal(hasSpamTrap({ ...validContact, website: "   " }), false);
});

test("getClientKey prefers Cloudflare's visitor IP", () => {
  const key = getClientKey(
    "192.0.2.44",
    "203.0.113.7 (attacker-supplied), 198.51.100.20",
    "198.51.100.30",
  );
  assert.equal(key, "192.0.2.44");
});

test("getClientKey falls back to the nearest forwarded hop, then x-real-ip", () => {
  assert.equal(
    getClientKey(null, "203.0.113.7 (attacker-supplied), 198.51.100.20", null),
    "198.51.100.20",
  );
  assert.equal(getClientKey(null, null, "192.0.2.5"), "192.0.2.5");
  assert.equal(getClientKey(null, null, null), "unknown");
});

test("getClientKey handles realistic Cloudflare and Passenger proxy chains", () => {
  assert.equal(
    getClientKey(
      " 2001:db8::44 ",
      "203.0.113.9, 172.64.12.4, 127.0.0.1",
      "127.0.0.1",
    ),
    "2001:db8::44",
  );
  assert.equal(
    getClientKey(null, "203.0.113.9, 172.64.12.4, 127.0.0.1", "127.0.0.1"),
    "127.0.0.1",
  );
  assert.equal(
    getClientKey("198.51.100.77", "198.51.100.10, 198.51.100.11", "9.9.9.9"),
    "198.51.100.77",
  );
});

test("RateLimiter allows up to the configured burst then blocks", () => {
  const limiter = new RateLimiter();
  const now = Date.now();

  for (let i = 0; i < maxRequestsPerWindow; i += 1) {
    assert.equal(limiter.isLimited("client-a", now), false, `request ${i + 1} should be allowed`);
  }
  assert.equal(limiter.isLimited("client-a", now), true, "request beyond the burst should be blocked");
});

test("RateLimiter tracks clients independently", () => {
  const limiter = new RateLimiter();
  const now = Date.now();

  for (let i = 0; i < maxRequestsPerWindow; i += 1) {
    limiter.isLimited("client-a", now);
  }
  assert.equal(limiter.isLimited("client-a", now), true);
  assert.equal(limiter.isLimited("client-b", now), false);
});

test("RateLimiter resets a client's budget after the window elapses", () => {
  const limiter = new RateLimiter();
  const start = Date.now();

  for (let i = 0; i < maxRequestsPerWindow; i += 1) {
    limiter.isLimited("client-a", start);
  }
  assert.equal(limiter.isLimited("client-a", start), true);

  const afterWindow = start + 10 * 60 * 1000 + 1;
  assert.equal(limiter.isLimited("client-a", afterWindow), false);
});
