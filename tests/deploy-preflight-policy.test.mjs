import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assertValidationBaseline, VALIDATION_PHASES } from "../scripts/deploy/preflight-policy.mjs";

const healthy = {
  previousRelease: "/example/releases/r1",
  existingApp: { appRoot: "/example/releases/r1" },
  previousNodePath: "/example/node/bin/node",
};

test("validation inspects the remote baseline before any release preparation", () => {
  assert.deepEqual(VALIDATION_PHASES, ["snapshot", "prepare", "preflight"]);
  assert.equal(assertValidationBaseline(healthy), true);
});

test("validation fails without current, Passenger, matching roots or Node.js", () => {
  assert.throws(() => assertValidationBaseline({ ...healthy, previousRelease: "" }), /current release/);
  assert.throws(() => assertValidationBaseline({ ...healthy, existingApp: undefined }), /Passenger application/);
  assert.throws(() => assertValidationBaseline({ ...healthy, existingApp: { appRoot: "/other" } }), /to agree/);
  assert.throws(() => assertValidationBaseline({ ...healthy, previousNodePath: "" }), /Node\.js runtime/);
});

test("validation avoids webroot backup and refuses skipped isolated preflight", () => {
  const source = readFileSync("scripts/deploy/deploy-server.mjs", "utf8");
  const guard = source.indexOf("if (validationOnly) {\n        assertValidationBaseline(context)");
  const backup = source.indexOf("const snapshotScript = `");
  assert.ok(guard > 0 && backup > guard);
  assert.match(source, /if \(validationOnly && !context\.artifact\) return;/);
  assert.doesNotMatch(source, /DEPLOY_PREFLIGHT skipped/);
  assert.match(source, /throw new Error\("Cannot run isolated preflight without an existing Node\.js runtime/);
});
