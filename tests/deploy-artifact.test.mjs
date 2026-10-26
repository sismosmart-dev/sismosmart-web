import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  cleanNextBuildArtifacts,
  createReleaseArtifact,
  sha256DeployFile,
  shellEscapeDeployValue,
} from "../scripts/deploy/deploy-artifact.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "..");

function readText(relativePath) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

test("deployment runner delegates local artifact preparation to a focused module", () => {
  const runner = readText("scripts/deploy/deploy-server.mjs");
  const moduleSource = readText("scripts/deploy/deploy-artifact.mjs");

  assert.match(
    runner,
    /import \{[\s\S]*cleanNextBuildArtifacts,[\s\S]*createReleaseArtifact,[\s\S]*\} from "\.\/deploy-artifact\.mjs"/,
  );
  assert.match(moduleSource, /export function shellEscapeDeployValue/);
  assert.match(moduleSource, /export async function cleanNextBuildArtifacts/);
  assert.match(moduleSource, /export async function sha256DeployFile/);
  assert.match(moduleSource, /export async function createReleaseArtifact/);
  assert.doesNotMatch(runner, /async function sha256File\(/);
  assert.doesNotMatch(runner, /async function createReleaseArtifact\(/);
});

test("local deployment shell escaping preserves plain and quoted values", () => {
  assert.equal(shellEscapeDeployValue("plain/path"), "'plain/path'");
  assert.equal(shellEscapeDeployValue("path with spaces"), "'path with spaces'");
  assert.equal(shellEscapeDeployValue("a'b"), "'a'\\''b'");
});

test("Next build cleanup preserves recursive force removal", async () => {
  const calls = [];
  await cleanNextBuildArtifacts({
    fsImpl: {
      rm: async (...args) => calls.push(args),
    },
    pathImpl: {
      resolve: (...parts) => `/resolved/${parts.join("/")}`,
    },
  });

  assert.deepEqual(calls, [
    ["/resolved/.next", { recursive: true, force: true }],
  ]);
});

test("deployment checksum preserves streamed SHA-256 hashing", async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "sismosmart-deploy-hash-"));
  const filePath = path.join(root, "artifact.tar.gz");
  writeFileSync(filePath, "artifact-body", "utf8");

  try {
    const expected = createHash("sha256")
      .update("artifact-body")
      .digest("hex");
    assert.equal(await sha256DeployFile(filePath), expected);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("artifact preparation preserves paths, tar command, checksum line, stats, and result shape", async () => {
  const calls = [];
  const writes = [];
  const stats = new Map([
    ["/artifacts/release-1.tar.gz", { size: 123 }],
    ["/artifacts/release-1.tar.gz.sha256", { size: 88 }],
  ]);

  const result = await createReleaseArtifact("/deploy root", "release-1", {
    artifactRoot: "/artifacts",
    fsImpl: {
      mkdir: async (...args) => calls.push(["mkdir", ...args]),
      rm: async (...args) => calls.push(["rm", ...args]),
      stat: async (filePath) => stats.get(filePath),
      writeFile: async (...args) => writes.push(args),
    },
    pathImpl: path.posix,
    runLocalCommandImpl: (command) => calls.push(["command", command]),
    sha256FileImpl: async () => "abc123",
  });

  assert.deepEqual(calls, [
    ["mkdir", "/artifacts", { recursive: true }],
    ["rm", "/artifacts/release-1.tar.gz", { force: true }],
    ["rm", "/artifacts/release-1.tar.gz.sha256", { force: true }],
    [
      "command",
      "tar -czf '/artifacts/release-1.tar.gz' -C '/deploy root' .",
    ],
  ]);
  assert.deepEqual(writes, [
    [
      "/artifacts/release-1.tar.gz.sha256",
      "abc123  release-1.tar.gz\n",
      "utf8",
    ],
  ]);
  assert.deepEqual(result, {
    artifactBytes: 123,
    artifactPath: "/artifacts/release-1.tar.gz",
    checksum: "abc123",
    checksumBytes: 88,
    checksumPath: "/artifacts/release-1.tar.gz.sha256",
  });
});

test("artifact stats start before either stat result settles", async () => {
  const started = [];
  const resolvers = new Map();

  const operation = createReleaseArtifact("/deploy", "release-2", {
    artifactRoot: "/artifacts",
    fsImpl: {
      mkdir: async () => undefined,
      rm: async () => undefined,
      stat: (filePath) => {
        started.push(filePath);
        return new Promise((resolve) => resolvers.set(filePath, resolve));
      },
      writeFile: async () => undefined,
    },
    pathImpl: path.posix,
    runLocalCommandImpl: () => undefined,
    sha256FileImpl: async () => "def456",
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(started, [
    "/artifacts/release-2.tar.gz",
    "/artifacts/release-2.tar.gz.sha256",
  ]);
  resolvers.get("/artifacts/release-2.tar.gz")({ size: 10 });
  resolvers.get("/artifacts/release-2.tar.gz.sha256")({ size: 20 });
  await operation;
});

test("artifact preparation propagates local command failures without retry or wrapping", async () => {
  const failure = new Error("tar failed");
  let commandCalls = 0;

  await assert.rejects(
    createReleaseArtifact("/deploy", "release-3", {
      artifactRoot: "/artifacts",
      fsImpl: {
        mkdir: async () => undefined,
        rm: async () => undefined,
      },
      pathImpl: path.posix,
      runLocalCommandImpl: () => {
        commandCalls += 1;
        throw failure;
      },
    }),
    (error) => error === failure,
  );
  assert.equal(commandCalls, 1);
});
