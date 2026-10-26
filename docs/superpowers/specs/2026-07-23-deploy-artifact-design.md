# Deployment Artifact Preparation Design

## Context

Issue #14 is decomposing oversized application and operations modules without changing production behavior. Browser-quality and production-health orchestration are now split into focused modules. The remaining deployment entry point, `scripts/deploy/deploy-server.mjs`, is still 1,076 lines and combines local build preparation, artifact packaging, remote transfer, release validation, Passenger activation, public-root synchronization, health verification, rollback, retention, and CLI orchestration.

This is the sixteenth small delivery for issue #14. The parent issue remains open for additional deployment orchestration decomposition.

## Goal

Extract deterministic local deployment artifact preparation into a focused module while preserving every command, path, checksum, metadata field, log boundary, upload consumer, cleanup path, and transactional deployment behavior.

## Approaches considered

### 1. Extract only checksum calculation

This is the smallest possible move, but it leaves artifact directory management, tar creation, checksum-file writing, and size collection in the oversized deployment runner. The resulting boundary would be too narrow to materially improve the orchestrator.

### 2. Extract local release artifact preparation — selected

Move `.next` cleanup, shell escaping needed by the local tar command, SHA-256 streaming, artifact/checksum path management, tar creation, checksum-file writing, and byte-size collection into one focused module. This creates a complete local filesystem/process boundary without touching SSH, SFTP, release activation, rollback, or production state.

### 3. Extract the complete prepare phase

Move build commands, artifact creation, remote upload, remote checksum verification, partial-release validation, metadata writing, and prepared-release promotion together. This would reduce the runner more, but it would cross local and remote boundaries and expand the review surface around production mutation.

## Architecture

Create `scripts/deploy/deploy-artifact.mjs` with these exports:

```js
export function shellEscapeDeployValue(value)
export async function cleanNextBuildArtifacts(options = {})
export async function sha256DeployFile(filePath, options = {})
export async function createReleaseArtifact(localDeployRoot, releaseId, options = {})
```

The module owns only local artifact preparation:

- remove the repository `.next` directory before a new build;
- create `.deploy/artifacts` when needed;
- remove stale artifact and checksum files for the selected release identifier;
- execute the exact `tar -czf ... -C ... .` command;
- calculate the archive SHA-256 digest as a stream;
- write the exact GNU-compatible checksum line;
- stat both files and return the existing artifact metadata shape.

`scripts/deploy/deploy-server.mjs` imports `cleanNextBuildArtifacts` and `createReleaseArtifact`. It reuses the artifact result exactly as today for logging, upload, remote checksum verification, release metadata, transfer accounting, and final cleanup.

The existing deployment runner keeps its own remote-command shell escaping because many remote lifecycle functions still depend on it. The focused artifact module has a local-command-specific escaping export so its behavior can be tested independently without forcing a broad shell-helper refactor.

## Data flow

1. The deployment transaction calls `cleanNextBuildArtifacts()` during `prepare`.
2. The runner executes the existing `npm run build` and `npm run deploy:prepare` commands.
3. The runner calls `createReleaseArtifact(localDeployRoot, releaseId)`.
4. The artifact module returns:

```js
{
  artifactBytes,
  artifactPath,
  checksum,
  checksumBytes,
  checksumPath,
}
```

5. The runner stores this object in `context.artifact` and continues the existing remote upload and validation flow unchanged.
6. Final transaction cleanup removes the returned paths exactly as before.

## Dependency injection

Production defaults remain the current Node and repository dependencies. Narrow options are permitted only for deterministic tests:

- filesystem promises implementation;
- readable-stream factory;
- local command runner;
- path implementation;
- hash factory;
- artifact-root override.

Defaults must preserve current behavior. Injection must not appear in deployment call sites and must not change production commands or paths.

## Behavior preservation requirements

- Preserve `.next` removal with `{ recursive: true, force: true }`.
- Preserve SHA-256 and streamed file hashing.
- Preserve artifact root `.deploy/artifacts` relative to the current working directory.
- Preserve artifact filename `${releaseId}.tar.gz` and checksum filename `${artifactPath}.sha256`.
- Preserve stale-file removal before tar creation.
- Preserve the exact tar command structure: `tar -czf <artifact> -C <localDeployRoot> .`.
- Preserve single-quote shell escaping semantics for local paths.
- Preserve checksum-file contents: `${checksum}  ${basename}\n` with two spaces.
- Preserve UTF-8 checksum-file writing.
- Preserve parallel stat calls for artifact and checksum files.
- Preserve the returned field names and byte counts.
- Preserve `prepare` operation order: clean, build, prepare standalone output, create artifact, log artifact, upload.
- Preserve all remote paths, transfer accounting, checksum verification, release metadata, activation, rollback, cleanup, and retention behavior.
- Preserve CLI scripts and environment behavior.
- Add no dependency and perform no production deployment or mutation.

## Error handling

The focused module does not add retries, fallbacks, or error wrapping. Filesystem, stream, hash, tar-command, write, and stat failures propagate exactly as they do today so `runDeploymentTransaction` retains ownership of failure handling and cleanup.

## Testing strategy

Add `tests/deploy-artifact.test.mjs` covering:

- deployment runner source delegates artifact preparation to the focused module;
- shell escaping preserves plain values, whitespace, and embedded single quotes;
- `.next` cleanup uses the exact recursive/force options;
- SHA-256 calculation preserves streamed hashing;
- artifact preparation creates the artifact directory, removes stale files, runs the exact tar command, writes the exact checksum line, stats both files concurrently, and returns the existing metadata shape;
- artifact preparation propagates command and filesystem failures without retries or wrapping;
- package test registration includes the focused test.

Existing deployment transaction, control-path, release-retention, repository-contract, full-suite, build, audit, and browser tests remain mandatory.

## Mechanical verification

Before commit, compare the moved `cleanNextBuildArtifacts`, `sha256File`, and `createReleaseArtifact` bodies against `origin/main` after normalizing only focused export names and injected dependency names. Separately verify the `prepare` operation call order and all artifact consumer expressions remain unchanged.

## Pull request boundary

The pull request contains only:

- the focused local artifact module;
- focused tests and package registration;
- the minimal deployment-runner imports/removal of moved helpers;
- source-location contract updates if required;
- design and implementation-plan documentation.

Before integration, inspect bot and agent comments, dependency and security findings, inline comments, submitted reviews, warning/failure annotations, CodeQL alerts, and every workflow result.

## Non-goals

- Moving build commands or the complete `prepare` phase.
- Changing tar format, compression, checksum algorithm, paths, metadata, or logs.
- Changing remote upload, extraction, permission normalization, or prepared-release promotion.
- Changing Passenger application lifecycle, public-root synchronization, health checks, activation, rollback, retention, or cleanup.
- Changing deployment workflow configuration, credentials, secrets, or production state.
