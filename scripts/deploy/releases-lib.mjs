import path from "node:path";

import {
  posixJoin,
  runRemoteCommand,
  withSftp,
} from "./helpers.mjs";

export const RELEASE_METADATA_FILE = ".release.json";
export const RELEASE_PREPARED_FILE = ".release-prepared";
export const RELEASE_READY_FILE = ".release-ready";
export const RELEASE_FAILED_FILE = ".release-failed";

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function asText(value) {
  return Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
}

function metadataTimestamp(metadata) {
  for (const value of [
    metadata?.completedAt,
    metadata?.preparedAt,
    metadata?.createdAt,
  ]) {
    const parsed = Date.parse(value || "");
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function classifyRelease({
  hasApp,
  hasBuildId,
  hasFailed,
  hasPrepared,
  hasReady,
  metadata,
  name,
}) {
  if (name.endsWith(".partial")) return "partial";
  if (hasFailed || metadata?.status === "failed") return "failed";
  if (hasReady || metadata?.status === "successful") return "successful";
  if (hasPrepared || metadata?.status === "prepared") return "prepared";
  if (hasApp && hasBuildId) return "legacy-valid";
  return "unknown";
}

export function isKnownGoodRelease(entry) {
  return entry.status === "successful" || entry.status === "legacy-valid";
}

export function sortReleasesNewestFirst(entries) {
  return [...entries].sort((left, right) => {
    const leftTimestamp = metadataTimestamp(left.metadata) || left.modifiedAt || 0;
    const rightTimestamp = metadataTimestamp(right.metadata) || right.modifiedAt || 0;
    if (rightTimestamp !== leftTimestamp) return rightTimestamp - leftTimestamp;
    return right.name.localeCompare(left.name);
  });
}

export function selectRollbackRelease(entries, currentPath) {
  return sortReleasesNewestFirst(entries).find(
    (entry) => entry.path !== currentPath && isKnownGoodRelease(entry),
  );
}

export function planReleaseRetention(
  entries,
  { protectedPaths = [], retainCount = 6 } = {},
) {
  if (!Number.isInteger(retainCount) || retainCount < 6) {
    throw new Error("Release retention count must be an integer of at least 6.");
  }

  const protectedSet = new Set(protectedPaths.filter(Boolean));
  const sorted = sortReleasesNewestFirst(entries);
  const knownGoodProtected = sorted.filter(
    (entry) => protectedSet.has(entry.path) && isKnownGoodRelease(entry),
  ).length;
  let remainingGoodSlots = Math.max(0, retainCount - knownGoodProtected);
  const keepSet = new Set(protectedSet);

  for (const entry of sorted) {
    if (keepSet.has(entry.path) || !isKnownGoodRelease(entry)) continue;
    if (remainingGoodSlots > 0) {
      keepSet.add(entry.path);
      remainingGoodSlots -= 1;
    }
  }

  const decisions = sorted.map((entry) => {
    if (protectedSet.has(entry.path)) {
      return { ...entry, action: "keep", reason: "active-protected" };
    }
    if (keepSet.has(entry.path)) {
      return { ...entry, action: "keep", reason: "retained-known-good" };
    }
    if (entry.status === "partial" || entry.status === "prepared") {
      return { ...entry, action: "delete", reason: "incomplete" };
    }
    if (entry.status === "failed") {
      return { ...entry, action: "delete", reason: "failed" };
    }
    if (isKnownGoodRelease(entry)) {
      return { ...entry, action: "delete", reason: "expired-known-good" };
    }
    return { ...entry, action: "keep", reason: "unknown-manual-review" };
  });

  return {
    decisions,
    remove: decisions.filter((entry) => entry.action === "delete"),
    keep: decisions.filter((entry) => entry.action === "keep"),
  };
}

async function readJsonIfPresent(client, remotePath) {
  if (!(await client.exists(remotePath))) return undefined;
  try {
    return JSON.parse(asText(await client.get(remotePath)));
  } catch {
    return undefined;
  }
}

export async function listReleaseInventory(config, remoteReleasesRoot) {
  return withSftp(config, async (client) => {
    if (!(await client.exists(remoteReleasesRoot))) return [];

    const listed = await client.list(remoteReleasesRoot);
    const directories = listed.filter((entry) => entry.type === "d");
    const inventory = [];

    for (const entry of directories) {
      const releasePath = posixJoin(remoteReleasesRoot, entry.name);
      const metadata = await readJsonIfPresent(
        client,
        posixJoin(releasePath, RELEASE_METADATA_FILE),
      );
      const [hasApp, hasBuildId, hasFailed, hasPrepared, hasReady] = await Promise.all([
        client.exists(posixJoin(releasePath, "app.js")),
        client.exists(posixJoin(releasePath, ".next", "BUILD_ID")),
        client.exists(posixJoin(releasePath, RELEASE_FAILED_FILE)),
        client.exists(posixJoin(releasePath, RELEASE_PREPARED_FILE)),
        client.exists(posixJoin(releasePath, RELEASE_READY_FILE)),
      ]);

      const release = {
        name: entry.name,
        path: releasePath,
        modifiedAt: Number(entry.modifyTime || 0),
        metadata,
        hasApp: Boolean(hasApp),
        hasBuildId: Boolean(hasBuildId),
        hasFailed: Boolean(hasFailed),
        hasPrepared: Boolean(hasPrepared),
        hasReady: Boolean(hasReady),
      };
      release.status = classifyRelease(release);
      inventory.push(release);
    }

    return sortReleasesNewestFirst(inventory);
  });
}

export async function writeReleaseMetadata(config, releasePath, metadata) {
  const metadataPath = posixJoin(releasePath, RELEASE_METADATA_FILE);
  await withSftp(config, async (client) => {
    await client.put(
      Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`, "utf8"),
      metadataPath,
    );
  });
  await runRemoteCommand(config, `chmod 0644 ${shellEscape(metadataPath)}`);
}

export async function getReleaseRootUsage(config, remoteReleasesRoot) {
  const { stdout } = await runRemoteCommand(
    config,
    `if [ -d ${shellEscape(remoteReleasesRoot)} ]; then du -sk ${shellEscape(remoteReleasesRoot)} | awk '{print $1 * 1024}'; else printf '0\\n'; fi`,
  );
  const bytes = Number.parseInt(stdout.trim(), 10);
  return Number.isFinite(bytes) ? bytes : 0;
}

function assertSafeReleasePath(remoteReleasesRoot, releasePath) {
  if (
    path.posix.dirname(releasePath) !== remoteReleasesRoot ||
    !path.posix.basename(releasePath) ||
    path.posix.basename(releasePath) === "." ||
    path.posix.basename(releasePath) === ".."
  ) {
    throw new Error(`Unsafe release cleanup path rejected: ${releasePath}`);
  }
}

export async function removeReleasePaths(
  config,
  remoteReleasesRoot,
  releasePaths,
) {
  for (const releasePath of releasePaths) {
    assertSafeReleasePath(remoteReleasesRoot, releasePath);
  }

  const chunks = [];
  for (let index = 0; index < releasePaths.length; index += 10) {
    chunks.push(releasePaths.slice(index, index + 10));
  }

  for (const chunk of chunks) {
    if (chunk.length === 0) continue;
    await runRemoteCommand(
      config,
      `rm -rf -- ${chunk.map(shellEscape).join(" ")}`,
    );
  }
}

export async function enforceReleaseRetention(
  config,
  {
    apply = false,
    protectedPaths = [],
    remoteReleasesRoot,
    retainCount = 6,
  },
) {
  const beforeBytes = await getReleaseRootUsage(config, remoteReleasesRoot);
  const inventory = await listReleaseInventory(config, remoteReleasesRoot);
  const plan = planReleaseRetention(inventory, {
    protectedPaths,
    retainCount,
  });

  console.table(
    plan.decisions.map((entry) => ({
      action: entry.action,
      name: entry.name,
      reason: entry.reason,
      status: entry.status,
    })),
  );
  console.log(
    `DEPLOY_RETENTION_PLAN apply=${apply} retainCount=${retainCount} releases=${inventory.length} keep=${plan.keep.length} remove=${plan.remove.length} beforeBytes=${beforeBytes}`,
  );

  if (apply && plan.remove.length > 0) {
    await removeReleasePaths(
      config,
      remoteReleasesRoot,
      plan.remove.map((entry) => entry.path),
    );
  }

  const afterInventory = apply
    ? await listReleaseInventory(config, remoteReleasesRoot)
    : inventory;
  const afterBytes = apply
    ? await getReleaseRootUsage(config, remoteReleasesRoot)
    : beforeBytes;

  for (const protectedPath of protectedPaths.filter(Boolean)) {
    if (!afterInventory.some((entry) => entry.path === protectedPath)) {
      throw new Error(`Protected release disappeared during retention: ${protectedPath}`);
    }
  }

  console.log(
    `DEPLOY_RETENTION_RESULT apply=${apply} beforeCount=${inventory.length} afterCount=${afterInventory.length} removed=${inventory.length - afterInventory.length} beforeBytes=${beforeBytes} afterBytes=${afterBytes}`,
  );

  return {
    afterBytes,
    afterInventory,
    beforeBytes,
    inventory,
    plan,
  };
}
