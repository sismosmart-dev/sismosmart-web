# Production Health Inspection Design

## Goal

Extract remote production inspection from `scripts/ops/production-health.mjs` into a focused module without changing SSH commands, parsed evidence, fallback behavior, report shape, credentials, or production state.

This is the twelfth small delivery for issue #14. The parent issue remains open for cPanel/workflow access, aggregation, and deployment orchestration decomposition.

## Current problem

`production-health.mjs` still owns a complete SSH inspection boundary alongside orchestration and aggregation:

- shell escaping for remote command values;
- parsing tab-separated remote inspection output;
- generating the remote shell script that reads Passenger/release/filesystem/form-log evidence;
- discovering the matching cPanel Passenger application;
- resolving configured remote paths;
- executing the remote command and parsing its stdout.

These responsibilities form one coherent external-system adapter. Keeping them in the orchestrator makes the file harder to understand and forces remote script behavior to be tested through a broad module.

## Approaches considered

### Move only `parseRemoteInspection`

This is the smallest change, but it leaves script generation, path resolution, application discovery, and SSH execution in the orchestrator. The remote boundary remains split across files.

### Move parser, script generation, and remote execution

Create one focused inspection module that owns the full SSH adapter while preserving public re-exports from `production-health.mjs`. This is the selected approach because the functions change together and share the same security boundary.

### Move SSH inspection together with cPanel reads

This would reduce the orchestrator faster, but SSH and cPanel have different authentication, response, and fallback semantics. Combining them would create an overly broad review surface.

## Architecture

Create `scripts/ops/production-health-inspection.mjs` with these exports:

```js
export function parseRemoteInspection(stdout, passenger)
export function buildRemoteInspectionScript(options)
export async function inspectRemoteProduction(options)
```

The production signature remains compatible:

```js
inspectRemoteProduction({ config })
```

For focused tests, `inspectRemoteProduction` accepts optional dependencies with production defaults:

```js
inspectRemoteProduction({
  config,
  getApplicationsImpl,
  runRemoteCommandImpl,
  toRemoteAbsolutePathImpl,
})
```

`production-health.mjs` imports `inspectRemoteProduction` for the default runtime dependency and re-exports all three inspection functions so existing imports remain compatible.

The new module owns the Node `path` dependency and the deploy helpers/config imports used only by inspection. The orchestrator removes its Node `path` import; the CLI continues to use the separate `pathToFileURL` import from `node:url`.

## Components and data flow

1. `inspectRemoteProduction` receives canonical validated configuration.
2. It retrieves known Passenger applications and selects the entry matching `remoteAppDomain`, `remoteAppUri`, and a non-empty `appRoot`.
3. It resolves `remoteAppRoot`, `remoteReleasesRoot`, and `remotePublicRoot` through the existing absolute-path helper.
4. It builds the same shell script with the same quoted values and paths.
5. It executes the script with the existing remote-command helper.
6. It parses stdout into the same bounded evidence object.
7. `runProductionHealth` receives that object through its unchanged `inspectRemote` dependency and continues aggregation, classification, sanitization, and reporting unchanged.

## Behavior-preservation rules

- Preserve exact shell escaping of single quotes.
- Preserve `set -u` and every command, path, loop, `awk` expression, and output record in the remote script.
- Preserve Passenger application selection by domain, URI, and non-empty app root.
- Preserve fallback to an empty Passenger path when no application matches.
- Preserve path normalization through `toRemoteAbsolutePath` for app, releases, and public roots.
- Preserve `.htaccess` and `.next/BUILD_ID` path construction.
- Preserve `runRemoteCommand(config, script)` and parse only returned stdout.
- Preserve parser defaults and tab-separated handling for state, metric, form-log, and form records.
- Preserve numeric conversion for filesystem usage, release bytes/count, and form status.
- Preserve unknown-line and empty-line tolerance.
- Preserve existing `parseRemoteInspection`, `buildRemoteInspectionScript`, and `inspectRemoteProduction` imports through re-exports from `production-health.mjs`.
- Preserve `runProductionHealth` fallback to `null` when remote inspection throws.
- Change no SSH credential flow, remote command, cPanel request, GitHub request, probe, threshold, warning, report, workflow, dependency, or production state.

## Error handling

The adapter does not introduce new catches. Application discovery, path conversion, and remote-command failures continue to reject. `runProductionHealth` retains its existing `callOrFallback` boundary and converts inspection failure to unavailable remote evidence. Parser behavior remains tolerant of unrecognized output while retaining the same numeric conversions.

## Testing strategy

Add `tests/production-health-inspection.test.mjs` covering:

- orchestrator delegation and backward-compatible re-exports;
- parser defaults, known records, unknown records, repeated process/form records, and numeric conversions;
- exact shell escaping and required remote script markers;
- Passenger application selection and empty fallback;
- absolute-path helper call order and arguments;
- exact script passed to the remote command helper;
- parsing only the returned stdout;
- propagation of application-discovery, path-resolution, and remote-command failures;
- unchanged runtime fallback behavior through existing production-health tests.

Existing shell-execution tests in `tests/production-health.test.mjs` remain as integration evidence and continue importing through the orchestrator re-exports. Register the new focused test in both `test` and `test:coverage`.

Acceptance gates remain lint, typecheck, the full Node test suite, production build, dependency audit, real Chrome browser/accessibility checks, diff/public-safety review, and all GitHub review/security/check channels.

## Public repository safety

Tests use synthetic configuration, documentation-only domains, temporary directories, and injected helpers. No credential, private address, internal production path, provider identifier, raw external response, or secret-bearing environment value is added.

## Pull-request boundary

The pull request contains only inspection extraction, focused tests, package test registration, source-location contract updates, and design/plan documentation. Issue #14 remains open. Before integration, inspect all bot, agent, dependency, security, inline-review, submitted-review, annotation, and workflow channels.

## Non-goals

- No change to the remote shell script.
- No change to SSH authentication or deployment helpers.
- No cPanel or GitHub workflow-history extraction.
- No health aggregation or classification change.
- No report or CLI behavior change.
- No deployment or production mutation.
