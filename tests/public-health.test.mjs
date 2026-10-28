import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runPublicHealth, summarizePublicHealth } from "../scripts/ops/public-health.mjs";

const routes = ["root", "en", "tr", "robots", "sitemap", "manifest", "contact", "waitlist"];
const success = () => ({ ok: true, routes: routes.map((key) => ({ key, cold: { ok: true }, warm: { ok: true } })) });

test("tokenless public health reports exactly eight successful public GET probes", async () => {
  const logs = [];
  const result = await runPublicHealth({ probe: async ({ config }) => {
    assert.equal(config.publicBaseUrl, "https://sismosmart.com");
    return success();
  }, log: (line) => logs.push(line) });
  assert.deepEqual(result, { ok: true, checked: 8, failed: [] });
  assert.match(logs.join("\n"), /PUBLIC_HEALTH ok=true checked=8 failed=0/);
});

test("an edge failure or incomplete probe set fails closed", () => {
  const failed = success();
  failed.routes[1].warm.ok = false;
  assert.deepEqual(summarizePublicHealth(failed), { ok: false, checked: 8, failed: ["en"] });
  assert.equal(summarizePublicHealth({ ok: true, routes: [] }).ok, false);
});

test("schedule is opt-in, main-only and completely free of production secrets", () => {
  const workflow = readFileSync(".github/workflows/public-health.yml", "utf8");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /vars\.SISMOSMART_PUBLIC_MONITOR_ENABLED == 'true'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /environment: production/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /node scripts\/ops\/public-health\.mjs/);
  assert.match(workflow, /node scripts\/ops\/public-dns-mail\.mjs/);
  assert.doesNotMatch(workflow, /secrets\.|DOPPLER_TOKEN|production-deploy|npm ci|deploy:|\bssh\b|\bcpanel\b/);
});


test("Cloudflare 525 incidents log bounded UTC and validated ray evidence only", async () => {
  const report = success();
  report.ok = false;
  report.routes[1].warm = { ok: false, status: 525, cfRay: "9abcde1234567890-FRA", observedAtUtc: "2026-10-28T03:00:00.000Z", secretHeader: "DO-NOT-LOG" };
  report.routes[2].cold = { ok: false, status: 525, cfRay: "BAD\nLEAK", observedAtUtc: "not-a-date" };
  const logs = [];
  const result = await runPublicHealth({ probe: async () => report, log: (line) => logs.push(line) });
  assert.equal(result.ok, false);
  assert.match(logs.join("\n"), /PUBLIC_TLS_525 key=en sample=warm utc=2026-10-28T03:00:00\.000Z cfRay=9abcde1234567890-FRA colo=FRA/);
  assert.match(logs.join("\n"), /PUBLIC_TLS_525 key=tr sample=cold utc=unknown cfRay=unavailable colo=unknown/);
  assert.doesNotMatch(logs.join("\n"), /DO-NOT-LOG|BAD|LEAK/);
  assert.equal(logs.filter((line) => line.startsWith("PUBLIC_TLS_525")).length, 2);
});
