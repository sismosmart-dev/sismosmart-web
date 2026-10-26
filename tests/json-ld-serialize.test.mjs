import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../src/lib/json-ld-serialize.mjs";

test("JSON-LD serialization preserves valid JSON", () => {
  const value = [{ "@context": "https://schema.org", name: "SismoSmart", count: 3 }];
  assert.deepEqual(JSON.parse(serializeJsonLd(value)), value);
});

test("JSON-LD serialization cannot break out of its script element", () => {
  const value = {
    text: '</script><script>alert("xss")</script><&>\u2028\u2029',
  };
  const serialized = serializeJsonLd(value);
  assert.doesNotMatch(serialized, /<|>|&|\u2028|\u2029/);
  assert.match(serialized, /\\u003c\/script\\u003e/);
  assert.match(serialized, /\\u0026/);
  assert.deepEqual(JSON.parse(serialized), value);
});
