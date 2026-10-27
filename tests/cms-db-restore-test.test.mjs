import assert from "node:assert/strict";
import test from "node:test";

import { assertEmptyRestoreTarget, inspectRestoredSchema, isolatedRestoreSettings } from "../scripts/ops/cms-db-restore-test.mjs";

const target = {
  CMS_RESTORE_ISOLATED: "true",
  CMS_RESTORE_HOST: "127.0.0.1",
  CMS_RESTORE_PORT: "3306",
  CMS_RESTORE_DB: "sismosmart_restore_test1",
  CMS_RESTORE_USER: "restore_only",
  CMS_RESTORE_PASSWORD: "isolated_test_only",
};

test("restore explicitly requires isolated disposable schema and limited named user", () => {
  assert.equal(isolatedRestoreSettings(target).database, "sismosmart_restore_test1");
  assert.throws(() => isolatedRestoreSettings({ ...target, CMS_RESTORE_ISOLATED: "false" }), /CMS_RESTORE_TARGET_UNSAFE/);
  assert.throws(() => isolatedRestoreSettings({ ...target, CMS_RESTORE_DB: "sismosma_web" }), /CMS_RESTORE_TARGET_UNSAFE/);
  assert.throws(() => isolatedRestoreSettings({ ...target, CMS_RESTORE_DB: "another_database" }), /CMS_RESTORE_TARGET_UNSAFE/);
  assert.throws(() => isolatedRestoreSettings({ ...target, CMS_RESTORE_DB: "sismosmart_restore_bad-name" }), /CMS_RESTORE_TARGET_UNSAFE/);
  assert.throws(() => isolatedRestoreSettings({ ...target, CMS_RESTORE_HOST: "production.example.com" }), /CMS_RESTORE_TARGET_UNSAFE/);
  assert.throws(() => isolatedRestoreSettings({ ...target, CMS_RESTORE_USER: "root" }), /CMS_RESTORE_TARGET_UNSAFE/);
  assert.throws(() => isolatedRestoreSettings({ ...target, CMS_RESTORE_PASSWORD: "" }), /CMS_RESTORE_TARGET_UNSAFE/);
  assert.throws(() => isolatedRestoreSettings({ ...target, CMS_RESTORE_PORT: "not-a-port" }), /CMS_RESTORE_TARGET_UNSAFE/);
});

test("restore refuses target with any existing objects, even an empty table", async () => {
  await assert.rejects(() => assertEmptyRestoreTarget({query:async()=>[[{table:"other"}],[]]}),/CMS_RESTORE_TARGET_NOT_EMPTY/);
  await assert.doesNotReject(() => assertEmptyRestoreTarget({query:async()=>[[],[]]}));
});

function mockedSchema(tableNames, counts = {}) {
  const queries = [];
  const connection = {
    async query(sql) {
      queries.push(sql);
      if (sql === "SHOW FULL TABLES") return [tableNames.map((table) => ({ table, type: "BASE TABLE" })), []];
      if (sql === "SELECT COUNT(*) AS count FROM cms_content") return [[{ count: counts.cms_content ?? 0 }], []];
      if (sql === "SELECT COUNT(*) AS count FROM cms_revision") return [[{ count: counts.cms_revision ?? 0 }], []];
      throw new Error(`Unexpected SQL ${sql}`);
    },
  };
  return { connection, queries };
}

test("pre-migration zero-table restore needs an explicit empty-schema acknowledgment", async () => {
  const { connection, queries } = mockedSchema([]);
  await assert.rejects(inspectRestoredSchema(connection), /CMS_RESTORE_UNEXPECTED_EMPTY_SCHEMA/);
  assert.deepEqual(await inspectRestoredSchema(connection, { expectEmptySourceSchema: true }), {
    restoredObjects: 0, cmsTablesPresent: false, contentRows: null, revisionRows: null,
  });
  assert.deepEqual(queries, ["SHOW FULL TABLES", "SHOW FULL TABLES"]);
});

test("pre-CMS backup with other application tables does not require CMS tables", async () => {
  const { connection, queries } = mockedSchema(["contact_form", "signup"]);
  assert.deepEqual(await inspectRestoredSchema(connection), {
    restoredObjects: 2, cmsTablesPresent: false, contentRows: null, revisionRows: null,
  });
  assert.deepEqual(queries, ["SHOW FULL TABLES"]);
});

test("valid CMS restore continues checking real content and revision counts", async () => {
  const { connection, queries } = mockedSchema(["cms_content", "cms_revision"], { cms_content: 1, cms_revision: 2 });
  assert.deepEqual(await inspectRestoredSchema(connection), {
    restoredObjects: 2, cmsTablesPresent: true, contentRows: 1, revisionRows: 2,
  });
  assert.deepEqual(queries, ["SHOW FULL TABLES", "SELECT COUNT(*) AS count FROM cms_content", "SELECT COUNT(*) AS count FROM cms_revision"]);
});

test("partially restored CMS tables fail closed instead of claiming successful restore", async () => {
  for (const tables of [["cms_content"], ["cms_revision", "other"]]) {
    const { connection } = mockedSchema(tables);
    await assert.rejects(inspectRestoredSchema(connection, { expectEmptySourceSchema: true }), /CMS_RESTORE_PARTIAL_CMS_SCHEMA/);
  }
});
