# Production Health Resolution Design

## Goal

Extract public DNS and origin-address resolution from `scripts/ops/production-health.mjs` into a focused module without changing production-health behavior, public report shape, runtime fallbacks, or production state.

This is the eleventh small delivery for issue #14. The parent issue remains open for additional production-health and deployment orchestration decomposition.

## Current problem

After the HTTPS probe extraction, `production-health.mjs` still owns two independent network-resolution responsibilities:

- measuring whether the public hostname resolves and how long resolution takes;
- resolving the configured SSH host into the origin address used by origin probes.

The same file also owns generic orchestration, SSH inspection, cPanel reads, workflow history, aggregation, classification, reporting, and the CLI entry point. Keeping resolution in the orchestrator makes the network boundary harder to test directly and leaves DNS libraries in a file that should increasingly coordinate focused modules.

## Approaches considered

### Move only the two exported resolver functions

This is the smallest code move, but it would either duplicate safe error-code normalization or leave the new module dependent on a helper in the orchestrator.

### Move DNS, SSH, cPanel, and workflow access together

This would reduce the orchestrator faster, but it combines several external systems with different failure semantics and review risks. The change would be too broad for one small pull request.

### Move resolution plus safe error-code normalization

Create a focused resolution module that owns public DNS timing, origin address resolution, and the safe error-code normalization used by both the resolvers and the orchestrator fallbacks. This is the selected approach.

## Architecture

Create `scripts/ops/production-health-resolution.mjs` with these exports:

```js
export function safeErrorCode(error)
export async function resolvePublicDns(options)
export async function resolveOriginAddress(options)
```

The production signatures remain compatible:

```js
resolvePublicDns({ hostname })
resolveOriginAddress({ config })
```

For focused tests, the functions accept optional dependencies:

```js
resolvePublicDns({ hostname, lookupImpl, nowImpl })
resolveOriginAddress({ config, isIpImpl, lookupImpl })
```

Production callers omit those options, so defaults remain Node's DNS lookup, IP classification, and performance clock.

`production-health.mjs` imports `safeErrorCode`, `resolvePublicDns`, and `resolveOriginAddress` from the new module. It re-exports the two resolver functions so current imports remain compatible. The orchestrator continues to inject them into `runProductionHealth` as the default `resolvePublic` and `resolveOrigin` dependencies.

## Behavior-preservation rules

- Preserve `dns.lookup(hostname, { all: true })` for public DNS.
- Preserve `ok: addresses.length > 0` for public DNS success.
- Preserve duration rounding to two decimal places.
- Preserve `durationMs` on public DNS failure.
- Preserve conversion of the supplied error code to a string before validation.
- Preserve safe error codes matching only uppercase letters, digits, and underscores, including numeric codes after string conversion.
- Preserve fallback error code `REQUEST_FAILED` for missing or unsafe error codes.
- Preserve direct return of configured IPv4 or IPv6 SSH hosts using `net.isIP`.
- Preserve `dns.lookup(config.sshHost)` for hostname-based origin resolution.
- Preserve `{ address, family, ok: true }` success results.
- Preserve `{ errorCode, ok: false }` failure results.
- Preserve `runProductionHealth` fallback objects, warning behavior, public report fields, and CLI failure output.
- Change no probe route, HTTP request, SSH command, cPanel request, workflow request, report, workflow, dependency, credential, or production state.

## Error handling

Resolution functions convert expected lookup failures into existing safe result objects rather than throwing. Unsafe or absent error codes normalize to `REQUEST_FAILED`. The orchestrator retains its existing `callOrFallback` protection for injected or unexpected resolver failures.

## Testing strategy

Add `tests/production-health-resolution.test.mjs` covering:

- runner delegation and backward-compatible re-exports;
- safe and unsafe error-code normalization;
- successful public DNS lookup with exact lookup options and deterministic rounded duration;
- empty public DNS results;
- public DNS lookup failure with duration and normalized error code;
- direct IPv4 and IPv6 origin addresses without DNS lookup;
- hostname origin lookup success;
- hostname origin lookup failure;
- unchanged runtime fallback behavior through existing production-health tests.

Register the focused test in both `test` and `test:coverage`. Existing full tests, production build, dependency audit, and browser/accessibility checks remain required acceptance gates.

## Public repository safety

Tests use documentation-only hostnames and address ranges, deterministic fake clocks, and synthetic errors. No production hostname, private network address, credential, provider identifier, internal filesystem path, or raw external response is added.

## Pull-request boundary

The pull request contains only resolution extraction, focused tests, package test registration, source-location contract updates, and design/plan documentation. Issue #14 remains open. Before integration, inspect all bot, agent, dependency, security, inline-review, submitted-review, annotation, and workflow channels.

## Non-goals

- No HTTPS probe change.
- No SSH inspection change.
- No cPanel or workflow-history change.
- No health aggregation or classification change.
- No report or CLI behavior change.
- No deployment or production mutation.
