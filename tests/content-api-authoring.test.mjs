import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const requireFile = (file) => readFileSync(file, "utf8");
import test from "node:test";

import { authorizeContentAdmin, sameOrigin } from "../src/lib/content-api/auth.ts";
import { CmsMutationError, mutateContent } from "../src/lib/content-api/mutations.ts";
import { readAdminContent } from "../src/lib/content-api/query.ts";

const secret = "ABCDEFGHIJKLMNOPQRSTUvwxyz0123456789abcdEFGH";
const content = { title: "Ground motion insight", description: "The product is still under validation." };
const newer = { title: "Monitor, not an alarm", description: "No early warning is promised." };

test("admin Bearer token validation uses a long token and strict same-origin", () => {
  assert.equal(authorizeContentAdmin(`Bearer ${secret}`, secret), true);
  assert.equal(authorizeContentAdmin(`Bearer ${secret.slice(0, -1)}x`, secret), false);
  assert.equal(authorizeContentAdmin(`Bearer ${secret}`, "too-short"), false);
  assert.equal(authorizeContentAdmin(`Basic ${secret}`, secret), false);
  assert.equal(authorizeContentAdmin(null, secret), false);
  assert.equal(sameOrigin(null), true);
  assert.equal(sameOrigin("https://sismosmart.com"), true);
  assert.equal(sameOrigin("https://evil.example"), false);
  assert.equal(sameOrigin("invalid"), false);
  assert.equal(sameOrigin("https://sismosmart.com.evil.example"), false);
});

class FakeCmsConnection {
  state = { version: 0, draft_json: null, published_json: null, published_version: null };
  revisions = new Map();
  logs = [];
  snapshot = null;

  async beginTransaction() {
    this.logs.push("begin");
    this.snapshot = { state: structuredClone(this.state), revisions: new Map(this.revisions) };
  }
  async commit() { this.logs.push("commit"); this.snapshot = null; }
  async rollback() {
    this.logs.push("rollback");
    if (this.snapshot) {
      this.state = this.snapshot.state;
      this.revisions = this.snapshot.revisions;
    }
    this.snapshot = null;
  }
  async execute(sql, args) {
    if (sql.startsWith("INSERT INTO cms_content")) return [{}, []];
    if (sql.startsWith("SELECT version, draft_json")) return [[structuredClone(this.state)], []];
    if (sql.startsWith("SELECT action, content_json")) {
      const revision = this.revisions.get(args[2]);
      return [revision ? [revision] : [], []];
    }
    if (sql.startsWith("UPDATE cms_content")) {
      const [version, draft_json, published_json, published_version] = args;
      this.state = { version, draft_json, published_json, published_version };
      return [{}, []];
    }
    if (sql.startsWith("INSERT INTO cms_revision")) {
      const [locale, key, version, action, content_json] = args;
      assert.equal(locale, "en");
      assert.equal(key, "home.hero");
      this.revisions.set(version, { action, content_json });
      return [{}, []];
    }
    if (sql.startsWith("SELECT version, action")) {
      return [[...this.revisions.entries()].reverse().map(([version, x]) => ({ version, action: x.action })), []];
    }
    throw new Error(`Unexpected query: ${sql}`);
  }
}

test("draft never publishes, publication is atomic, and rollback restores a prior published revision", async () => {
  const db = new FakeCmsConnection();
  const draft = await mutateContent(db, "en", "home.hero", { action: "draft", expectedVersion: 0, content });
  assert.equal(draft.version, 1);
  assert.equal(db.state.published_json, null);
  assert.deepEqual(JSON.parse(db.state.draft_json), content);
  await assert.rejects(() => mutateContent(db, "en", "home.hero", { action: "publish", expectedVersion: 0 }),
    (error) => error instanceof CmsMutationError && error.code === "CMS_CONFLICT");
  assert.equal(db.state.version, 1);
  assert.equal(db.logs.at(-1), "rollback");

  const publish = await mutateContent(db, "en", "home.hero", { action: "publish", expectedVersion: 1 });
  assert.deepEqual(publish, { ok: true, locale: "en", key: "home.hero", version: 2, publishedVersion: 2, action: "publish" });
  assert.deepEqual(JSON.parse(db.state.published_json), content);

  await mutateContent(db, "en", "home.hero", { action: "draft", expectedVersion: 2, content: newer });
  assert.deepEqual(JSON.parse(db.state.published_json), content);
  await mutateContent(db, "en", "home.hero", { action: "publish", expectedVersion: 3 });
  assert.deepEqual(JSON.parse(db.state.published_json), newer);

  await assert.rejects(() => mutateContent(db, "en", "home.hero", { action: "rollback", expectedVersion: 4, targetVersion: 1 }),
    (error) => error instanceof CmsMutationError && error.code === "CMS_REVISION_NOT_FOUND");
  assert.equal(db.state.version, 4);

  const restored = await mutateContent(db, "en", "home.hero", { action: "rollback", expectedVersion: 4, targetVersion: 2 });
  assert.equal(restored.version, 5);
  assert.equal(restored.publishedVersion, 5);
  assert.deepEqual(JSON.parse(db.state.published_json), content);
  assert.equal(db.revisions.get(5).action, "rollback");
  const admin = await readAdminContent(db, "en", "home.hero");
  assert.equal(admin.version, 5);
  assert.deepEqual(admin.published, content);
  assert.deepEqual(admin.draft, content);
  assert.equal(admin.revisions[0].version, 5);
  const reset = await mutateContent(db, "en", "home.hero", { action: "rollback", expectedVersion: 5, targetVersion: 0 });
  assert.equal(reset.version, 6);
  assert.equal(reset.publishedVersion, null);
  assert.equal(db.state.published_json, null);
  assert.equal(db.state.draft_json, null);
  assert.equal(db.revisions.get(6).content_json, "null");
});

test("invalid drafts and publish-without-draft roll back without partial SQL state", async () => {
  const db = new FakeCmsConnection();
  await assert.rejects(() => mutateContent(db, "en", "home.hero", {
    action: "draft", expectedVersion: 0, content: { title: "<img src=x>", description: "test" },
  }), /CMS_HTML_NOT_ALLOWED/);
  assert.equal(db.state.version, 0);
  await assert.rejects(() => mutateContent(db, "en", "home.hero", { action: "publish", expectedVersion: 0 }),
    (error) => error instanceof CmsMutationError && error.code === "CMS_NO_DRAFT");
  assert.equal(db.state.version, 0);
  assert.equal(db.revisions.size, 0);
});


test("protected content write APIs are disabled by default and dynamic homepage uses one copy", () => {
  const fs = requireFile;
  const route = fs("src/app/api/admin/content/[locale]/[key]/route.ts");
  const publish = fs("src/app/api/admin/content/[locale]/[key]/publish/route.ts");
  const rollback = fs("src/app/api/admin/content/[locale]/[key]/rollback/route.ts");
  const admin = fs("src/lib/content-api/admin.ts");
  const home = fs("src/app/[locale]/page.tsx");
  const structured = fs("src/lib/structured-data.ts");
  const runtime = fs("scripts/deploy/runtime-env.mjs");
  const prepare = fs("scripts/deploy/prepare-standalone.mjs");
  assert.match(route, /executeCmsAdmin/);
  assert.match(publish, /executeCmsAdmin/);
  assert.match(rollback, /executeCmsAdmin/);
  assert.match(admin, /CMS_DB_ENABLED !== "true" \|\| process.env.CMS_WRITE_ENABLED !== "true"/);
  assert.match(admin, /authorizeContentAdmin/);
  assert.match(admin, /sameOrigin/);
  assert.match(admin, /readLimitedJsonBody\(request, maxBytes\)/);
  assert.match(home, /dynamic = "force-dynamic"/);
  assert.match(home, /getHomeCopy\(activeLocale\)/);
  assert.match(home, /getHomeStructuredData\(activeLocale, copy\)/);
  assert.match(structured, /getHomeStructuredData\(locale: Locale, copy: SiteCopy = getCopy\(locale\)\)/);
  for (const key of ["CMS_DB_ENABLED", "CMS_WRITE_ENABLED", "CMS_DB_PASSWORD", "CMS_ADMIN_TOKEN"]) {
    assert.ok(runtime.includes(`"${key}"`));
    assert.ok(prepare.includes(`"${key}"`));
  }
});
