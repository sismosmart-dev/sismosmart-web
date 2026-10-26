import assert from "node:assert/strict";
import test from "node:test";

import {
  planReleaseRetention,
  selectRollbackRelease,
} from "../scripts/deploy/releases-lib.mjs";

function release(index, status = "successful") {
  return {
    name: `release-${index}`,
    path: `/home/example/apps/releases/release-${index}`,
    status,
    modifiedAt: index,
    metadata: {
      completedAt: new Date(2026, 0, index).toISOString(),
      status,
    },
  };
}

test("retention keeps the active release plus five known-good predecessors", () => {
  const entries = Array.from({ length: 10 }, (_, index) => release(index + 1));
  const active = entries.at(-1).path;
  const plan = planReleaseRetention(entries, {
    protectedPaths: [active],
    retainCount: 6,
  });

  const keptKnownGood = plan.keep.filter((entry) =>
    ["successful", "legacy-valid"].includes(entry.status),
  );
  assert.equal(keptKnownGood.length, 6);
  assert.ok(plan.keep.some((entry) => entry.path === active));
  assert.equal(plan.remove.length, 4);
  assert.ok(plan.remove.every((entry) => entry.reason === "expired-known-good"));
});

test("retention protects distinct current and Passenger releases", () => {
  const entries = Array.from({ length: 10 }, (_, index) => release(index + 1));
  const current = entries[2].path;
  const passenger = entries[3].path;
  const plan = planReleaseRetention(entries, {
    protectedPaths: [current, passenger],
    retainCount: 6,
  });

  assert.ok(plan.keep.some((entry) => entry.path === current));
  assert.ok(plan.keep.some((entry) => entry.path === passenger));
  assert.equal(
    plan.keep.filter((entry) => entry.status === "successful").length,
    6,
  );
});

test("failed, partial, and prepared releases are removed but unknown entries require review", () => {
  const active = release(10);
  const entries = [
    active,
    release(9, "failed"),
    release(8, "partial"),
    release(7, "prepared"),
    release(6, "unknown"),
  ];
  const plan = planReleaseRetention(entries, {
    protectedPaths: [active.path],
    retainCount: 6,
  });

  assert.deepEqual(
    plan.remove.map((entry) => entry.status).sort(),
    ["failed", "partial", "prepared"],
  );
  const unknown = plan.keep.find((entry) => entry.status === "unknown");
  assert.equal(unknown.reason, "unknown-manual-review");
});

test("protected releases are never deleted even when marked failed", () => {
  const failedActive = release(10, "failed");
  const plan = planReleaseRetention([failedActive], {
    protectedPaths: [failedActive.path],
    retainCount: 6,
  });

  assert.equal(plan.remove.length, 0);
  assert.equal(plan.keep[0].reason, "active-protected");
});

test("rollback selection excludes current, failed, prepared, partial, and unknown releases", () => {
  const current = release(10);
  const olderGood = release(8, "legacy-valid");
  const entries = [
    current,
    release(9, "failed"),
    olderGood,
    release(7, "prepared"),
    release(6, "partial"),
    release(5, "unknown"),
  ];

  assert.equal(
    selectRollbackRelease(entries, current.path)?.path,
    olderGood.path,
  );
});

test("retention count below the six-release safety floor is rejected", () => {
  assert.throws(
    () => planReleaseRetention([], { retainCount: 5 }),
    /at least 6/,
  );
});
