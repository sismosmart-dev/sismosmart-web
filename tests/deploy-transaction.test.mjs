import assert from "node:assert/strict";
import test from "node:test";

import {
  InjectedDeploymentFailure,
  runDeploymentTransaction,
} from "../scripts/deploy/transaction.mjs";

function createOperations({ failPhase, rollbackFails = false } = {}) {
  const calls = [];
  const operation = (phase) => async () => {
    calls.push(phase);
    if (failPhase === phase) {
      throw new Error(`failure:${phase}`);
    }
  };

  return {
    calls,
    operations: {
      prepare: operation("prepare"),
      snapshot: operation("snapshot"),
      preflight: operation("preflight"),
      activate: operation("activate"),
      "verify-origin": operation("verify-origin"),
      commit: operation("commit"),
      "verify-public": operation("verify-public"),
      rollback: async () => {
        calls.push("rollback");
        if (rollbackFails) {
          throw new Error("failure:rollback");
        }
      },
      cleanup: async () => {
        calls.push("cleanup");
      },
    },
  };
}

const silentLogger = {
  log() {},
  warn() {},
  error() {},
};

test("transaction executes all deployment phases and cleanup in order", async () => {
  const { calls, operations } = createOperations();
  const state = await runDeploymentTransaction(operations, { logger: silentLogger });

  assert.equal(state.committed, true);
  assert.equal(state.rollbackAttempted, false);
  assert.deepEqual(calls, [
    "prepare",
    "snapshot",
    "preflight",
    "activate",
    "verify-origin",
    "commit",
    "verify-public",
    "cleanup",
  ]);
});

test("validation-only phases never activate or commit production", async () => {
  const { calls, operations } = createOperations();
  const state = await runDeploymentTransaction(operations, {
    logger: silentLogger,
    phases: ["prepare", "snapshot", "preflight"],
  });

  assert.equal(state.activated, false);
  assert.equal(state.committed, false);
  assert.deepEqual(calls, ["prepare", "snapshot", "preflight", "cleanup"]);
});

test("failure before activation leaves production untouched", async () => {
  const { calls, operations } = createOperations({ failPhase: "prepare" });

  await assert.rejects(
    runDeploymentTransaction(operations, { logger: silentLogger }),
    /failure:prepare/,
  );
  assert.deepEqual(calls, ["prepare", "cleanup"]);
});

test("injected failure immediately before activation does not call rollback", async () => {
  const { calls, operations } = createOperations();

  await assert.rejects(
    runDeploymentTransaction(operations, {
      failurePoint: "before-activate",
      logger: silentLogger,
    }),
    InjectedDeploymentFailure,
  );
  assert.deepEqual(calls, ["prepare", "snapshot", "preflight", "cleanup"]);
});

test("failure inside Passenger activation triggers automatic rollback", async () => {
  const { calls, operations } = createOperations({ failPhase: "activate" });

  await assert.rejects(
    runDeploymentTransaction(operations, { logger: silentLogger }),
    /failure:activate/,
  );
  assert.deepEqual(calls, [
    "prepare",
    "snapshot",
    "preflight",
    "activate",
    "rollback",
    "cleanup",
  ]);
});

test("injected failure after Passenger activation triggers automatic rollback", async () => {
  const { calls, operations } = createOperations();

  await assert.rejects(
    runDeploymentTransaction(operations, {
      failurePoint: "after-activate",
      logger: silentLogger,
    }),
    InjectedDeploymentFailure,
  );
  assert.deepEqual(calls, [
    "prepare",
    "snapshot",
    "preflight",
    "activate",
    "rollback",
    "cleanup",
  ]);
});

test("origin health failure restores the previous release", async () => {
  const { calls, operations } = createOperations({ failPhase: "verify-origin" });

  await assert.rejects(
    runDeploymentTransaction(operations, { logger: silentLogger }),
    /failure:verify-origin/,
  );
  assert.deepEqual(calls, [
    "prepare",
    "snapshot",
    "preflight",
    "activate",
    "verify-origin",
    "rollback",
    "cleanup",
  ]);
});

test("public health failure after commit still triggers rollback", async () => {
  const { calls, operations } = createOperations({ failPhase: "verify-public" });

  await assert.rejects(
    runDeploymentTransaction(operations, { logger: silentLogger }),
    /failure:verify-public/,
  );
  assert.deepEqual(calls, [
    "prepare",
    "snapshot",
    "preflight",
    "activate",
    "verify-origin",
    "commit",
    "verify-public",
    "rollback",
    "cleanup",
  ]);
});

test("rollback failure preserves both deployment errors", async () => {
  const { operations } = createOperations({
    failPhase: "verify-origin",
    rollbackFails: true,
  });

  await assert.rejects(
    runDeploymentTransaction(operations, { logger: silentLogger }),
    (error) => {
      assert.ok(error instanceof AggregateError);
      assert.equal(error.errors.length, 2);
      assert.match(error.message, /automatic rollback also failed/);
      return true;
    },
  );
});
