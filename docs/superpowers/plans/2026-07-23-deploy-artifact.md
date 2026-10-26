# Deployment Artifact Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract deterministic local deployment artifact preparation from `scripts/deploy/deploy-server.mjs` into a focused, directly tested module without changing any remote or transactional deployment behavior.

**Architecture:** `scripts/deploy/deploy-artifact.mjs` will own `.next` cleanup, local shell escaping, streamed SHA-256 calculation, tarball/checksum creation, and byte-size metadata. `deploy-server.mjs` will import two production entry points and keep build commands, upload, remote checksum verification, metadata, activation, rollback, retention, cleanup, and CLI orchestration unchanged.

**Tech Stack:** Node.js 22 ESM, `node:crypto`, `node:fs`, `node:fs/promises`, `node:path`, Node test runner, ESLint, TypeScript checking, Next.js 16.2.11.

## Global Constraints

- Parent issue #14 remains open for additional deployment orchestration decomposition.
- Add no runtime or development dependency.
- Preserve every current path, command, checksum line, metadata field, log boundary, upload consumer, cleanup consumer, and failure propagation behavior.
- Do not run production deployment or mutate remote production state.
- Use `SismoSmart <207872631+SismoSmart@users.noreply.github.com>` for every commit.
- Inspect bot, agent, dependency, security, inline-review, submitted-review, annotation, CodeQL, and workflow channels before integration.

---

### Task 1: Add failing artifact-module contract tests

**Files:**
- Create: `tests/deploy-artifact.test.mjs`
- Modify: `package.json`
- Read: `scripts/deploy/deploy-server.mjs:1-93`
- Read: `tests/repository-contract.test.mjs:390-430`

**Interfaces:**
- Consumes: planned exports from `scripts/deploy/deploy-artifact.mjs`.
- Produces: focused architecture and behavior tests that fail because the module does not exist.

- [ ] **Step 1: Create the focused test file with imports and repository source helper**

```js
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import fs from "node:fs/promises";
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
```

- [ ] **Step 2: Add an architecture delegation test**

```js
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
```

- [ ] **Step 3: Add shell escaping and cleanup tests**

```js
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

  assert.deepEqual(calls, [["/resolved/.next", { recursive: true, force: true }]]);
});
```

- [ ] **Step 4: Add streamed SHA-256 behavior test**

```js
test("deployment checksum preserves streamed SHA-256 hashing", async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "sismosmart-deploy-hash-"));
  const filePath = path.join(root, "artifact.tar.gz");
  writeFileSync(filePath, "artifact-body", "utf8");

  try {
    const expected = createHash("sha256").update("artifact-body").digest("hex");
    assert.equal(await sha256DeployFile(filePath), expected);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
```

- [ ] **Step 5: Add deterministic artifact creation test**

```js
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
    ["command", "tar -czf '/artifacts/release-1.tar.gz' -C '/deploy root' ."],
  ]);
  assert.deepEqual(writes, [[
    "/artifacts/release-1.tar.gz.sha256",
    "abc123  release-1.tar.gz\n",
    "utf8",
  ]]);
  assert.deepEqual(result, {
    artifactBytes: 123,
    artifactPath: "/artifacts/release-1.tar.gz",
    checksum: "abc123",
    checksumBytes: 88,
    checksumPath: "/artifacts/release-1.tar.gz.sha256",
  });
});
```

- [ ] **Step 6: Add exact failure propagation tests**

```js
test("artifact preparation propagates local command failures without retry or wrapping", async () => {
  const failure = new Error("tar failed");
  let commandCalls = 0;

  await assert.rejects(
    createReleaseArtifact("/deploy", "release-2", {
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
```

- [ ] **Step 7: Register the new test in both package test commands**

Add `tests/deploy-artifact.test.mjs` immediately before `tests/deploy-transaction.test.mjs` in the `test` and `test:coverage` command strings.

- [ ] **Step 8: Run the focused test to verify RED**

Run:

```bash
node --import ./tests/alias-loader.mjs --test tests/deploy-artifact.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/deploy/deploy-artifact.mjs`.

---

### Task 2: Extract the local artifact module

**Files:**
- Create: `scripts/deploy/deploy-artifact.mjs`
- Modify: `scripts/deploy/deploy-server.mjs:1-93`
- Test: `tests/deploy-artifact.test.mjs`

**Interfaces:**
- Consumes: `runLocalCommand` from `scripts/deploy/helpers.mjs` and Node built-ins.
- Produces:
  - `shellEscapeDeployValue(value): string`
  - `cleanNextBuildArtifacts(options?): Promise<void>`
  - `sha256DeployFile(filePath, options?): Promise<string>`
  - `createReleaseArtifact(localDeployRoot, releaseId, options?): Promise<{artifactBytes, artifactPath, checksum, checksumBytes, checksumPath}>`

- [ ] **Step 1: Create the focused module with production defaults**

```js
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { runLocalCommand } from "./helpers.mjs";

export function shellEscapeDeployValue(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

export async function cleanNextBuildArtifacts({
  fsImpl = fs,
  pathImpl = path,
} = {}) {
  await fsImpl.rm(pathImpl.resolve(".next"), { recursive: true, force: true });
}

export async function sha256DeployFile(
  filePath,
  {
    createHashImpl = createHash,
    createReadStreamImpl = createReadStream,
  } = {},
) {
  const hash = createHashImpl("sha256");
  const stream = createReadStreamImpl(filePath);

  for await (const chunk of stream) {
    hash.update(chunk);
  }

  return hash.digest("hex");
}
```

- [ ] **Step 2: Add artifact creation with exact current behavior**

```js
export async function createReleaseArtifact(
  localDeployRoot,
  releaseId,
  {
    artifactRoot = path.resolve(".deploy", "artifacts"),
    fsImpl = fs,
    pathImpl = path,
    runLocalCommandImpl = runLocalCommand,
    sha256FileImpl = sha256DeployFile,
  } = {},
) {
  const artifactPath = pathImpl.join(artifactRoot, `${releaseId}.tar.gz`);
  const checksumPath = `${artifactPath}.sha256`;

  await fsImpl.mkdir(artifactRoot, { recursive: true });
  await fsImpl.rm(artifactPath, { force: true });
  await fsImpl.rm(checksumPath, { force: true });

  runLocalCommandImpl(
    `tar -czf ${shellEscapeDeployValue(artifactPath)} -C ${shellEscapeDeployValue(localDeployRoot)} .`,
  );

  const checksum = await sha256FileImpl(artifactPath);
  await fsImpl.writeFile(
    checksumPath,
    `${checksum}  ${pathImpl.basename(artifactPath)}\n`,
    "utf8",
  );

  const [artifactStat, checksumStat] = await Promise.all([
    fsImpl.stat(artifactPath),
    fsImpl.stat(checksumPath),
  ]);

  return {
    artifactBytes: artifactStat.size,
    artifactPath,
    checksum,
    checksumBytes: checksumStat.size,
    checksumPath,
  };
}
```

- [ ] **Step 3: Delegate from the deployment runner**

Add this import after the Node built-ins:

```js
import {
  cleanNextBuildArtifacts,
  createReleaseArtifact,
} from "./deploy-artifact.mjs";
```

Remove only these old definitions from `deploy-server.mjs`:

```js
async function cleanNextBuildArtifacts() { ... }
async function sha256File(filePath) { ... }
async function createReleaseArtifact(localDeployRoot, releaseId) { ... }
```

Remove `createHash` and `createReadStream` imports from the runner. Keep `fs`, `path`, and the runner's existing `shellEscape` because remote orchestration still uses them.

- [ ] **Step 4: Run focused and deployment contract tests**

Run:

```bash
node --import ./tests/alias-loader.mjs --test \
  tests/deploy-artifact.test.mjs \
  tests/deploy-transaction.test.mjs \
  tests/deploy-control-path.test.mjs \
  tests/repository-contract.test.mjs
```

Expected: all tests pass.

- [ ] **Step 5: Run lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both commands exit 0.

---

### Task 3: Prove behavioral equivalence and commit implementation

**Files:**
- Compare: `origin/main:scripts/deploy/deploy-server.mjs`
- Compare: `scripts/deploy/deploy-artifact.mjs`
- Compare: `scripts/deploy/deploy-server.mjs`
- Modify only if a contract check identifies a real mismatch.

**Interfaces:**
- Consumes: completed focused module and runner delegation.
- Produces: mechanical-equivalence evidence and one implementation commit.

- [ ] **Step 1: Mechanically compare moved helper bodies**

Extract old `cleanNextBuildArtifacts`, `sha256File`, and `createReleaseArtifact` bodies from `origin/main`. Normalize only:

```text
shellEscape -> shellEscapeDeployValue
sha256File -> sha256DeployFile
fs -> fsImpl
path -> pathImpl
runLocalCommand -> runLocalCommandImpl
createHash -> createHashImpl
createReadStream -> createReadStreamImpl
```

Verify command strings, path construction, removal order, checksum line, parallel stats, and return fields are unchanged.

- [ ] **Step 2: Verify prepare operation and consumers remain unchanged**

Confirm this order still exists:

```text
cleanNextBuildArtifacts
npm run build
npm run deploy:prepare
createReleaseArtifact
DEPLOY_ARTIFACT log
remote directory preparation
SFTP upload
remote sha256sum -c
```

Confirm artifact fields are still consumed for upload, transfer accounting, release metadata, and final cleanup.

- [ ] **Step 3: Run whitespace and public-repository safety scans**

```bash
git diff --check
git diff origin/main...HEAD -- . ':!docs/superpowers/specs/*' ':!docs/superpowers/plans/*'
```

Scan the complete diff for credentials, private keys, private infrastructure addresses, provider identifiers, absolute private paths, and legacy repository identities. Expected: no findings.

- [ ] **Step 4: Commit the implementation**

```bash
git add package.json \
  scripts/deploy/deploy-artifact.mjs \
  scripts/deploy/deploy-server.mjs \
  tests/deploy-artifact.test.mjs \
  tests/repository-contract.test.mjs
git commit -m "refactor: extract deployment artifact preparation"
```

Expected author and committer:

```text
SismoSmart <207872631+SismoSmart@users.noreply.github.com>
```

---

### Task 4: Run final verification and integrate through reviewed PR

**Files:**
- No production code changes expected.
- Read: all branch commits, full diff, GitHub PR channels, and post-main workflow results.

**Interfaces:**
- Consumes: committed branch.
- Produces: reviewed fast-forward integration or a documented blocker.

- [ ] **Step 1: Run the final local verification chain on the committed revision**

```bash
npm run lint
npm run typecheck
npm test
NEXT_PUBLIC_ANALYTICS_ENABLED=true npm run build
npm audit --audit-level=high
```

Expected: lint/typecheck pass, full suite passes, 126-page build succeeds, and audit reports 0 vulnerabilities.

- [ ] **Step 2: Run real Chrome browser quality**

```bash
LD_LIBRARY_PATH=/tmp/sismosmart-chrome-runtime/rootfs/usr/lib/x86_64-linux-gnu:/tmp/sismosmart-chrome-runtime/rootfs/lib/x86_64-linux-gnu npm run test:browser
```

Expected: 12/12 scenarios pass, including contact and pilot forwarding.

- [ ] **Step 3: Verify branch ancestry and identities**

Confirm:

```text
merge-base(HEAD, origin/main) == origin/main
origin/main...HEAD == 0 behind, 3 ahead
all branch commits use the SismoSmart author and committer identity
working tree clean
```

- [ ] **Step 4: Push and open a draft PR**

Use title:

```text
refactor: extract deployment artifact preparation
```

The PR body must document scope, behavior preservation, validation evidence, no production mutation, issue #14 remaining open, and the requirement to inspect every bot/agent/security/review channel.

- [ ] **Step 5: Request SismoSmart review and inspect all channels**

Inspect:

- issue and PR comments, including bots and agents;
- inline comments;
- submitted reviews;
- all CI, build, browser, commitlint, label, Security, CodeQL, Gitleaks, and npm-audit results;
- warning/failure annotations;
- open CodeQL alerts;
- dependency/security findings.

Resolve actionable findings before integration. Add an integration-review evidence comment only after every channel is clean.

- [ ] **Step 6: Fast-forward integrate without rewriting commits**

After the PR is ready, clean, mergeable, and `origin/main` is unchanged:

```bash
git push origin HEAD:main
```

Verify GitHub records the PR as merged with the branch HEAD as merge commit SHA.

- [ ] **Step 7: Verify post-main checks and update issue #14**

Confirm Mainline Policy passes on the first attempt and CI/Security are green on `main`. Re-scan annotations, CodeQL, bot/agent comments, inline comments, and submitted reviews. Delete the remote feature branch, add PR post-main evidence, and add issue #14 progress while keeping the issue open for the next deployment orchestration slice.
