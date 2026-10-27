import assert from "node:assert/strict";
import test from "node:test";

import { assertEmptyRestoreTarget, isolatedRestoreSettings } from "../scripts/ops/cms-db-restore-test.mjs";

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
