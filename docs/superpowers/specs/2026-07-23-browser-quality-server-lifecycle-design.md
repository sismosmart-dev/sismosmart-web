# Browser Quality Server Lifecycle Design

## Goal

Extract loopback port allocation, the local form-forwarding receiver, Next.js child-process startup/readiness/retry, bounded process logs, and graceful-to-forced shutdown from `scripts/test/browser-quality.mjs` without changing browser scenarios, form evidence, accessibility checks, report output, or CLI behavior.

This is the sixth small delivery for issue #14. The parent issue remains open for browser scenario decomposition, production-health orchestration, and deployment orchestration.

## Current problem

The browser runner still combines two independent layers:

- local infrastructure lifecycle: loopback HTTP servers, ports, child processes, readiness, retry, and cleanup;
- browser scenarios: pages, navigation, consent, forms, screenshots, layout, and accessibility.

The lifecycle layer can be tested independently and moved without changing page behavior.

## Approaches considered

### Extract all browser scenarios

This removes more lines, but moves route, navigation, consent, form, screenshot, layout, and accessibility behavior together. The regression surface is too broad for the next small change.

### Extract only the mock receiver

This is safe but leaves port allocation, Next.js startup, retry, and cleanup coupled to the runner. The resulting boundary would be too narrow to be useful.

### Extract the complete local server lifecycle

Create one focused module for loopback infrastructure while the existing runner remains the browser-scenario and CLI entry point. This is the selected approach.

## Architecture

Create `scripts/test/browser-quality-server.mjs` with these exports:

```js
export function isAddressInUseFailure(error)
export async function startMockReceiver(options?)
export async function startNextServer(mockBaseUrl, options?)
export async function stopChild(child, options?)
```

The module privately owns:

- the local forwarding token;
- maximum mock body size;
- readiness and process-log bounds;
- maximum application startup attempts;
- loopback port allocation;
- JSON-body reading;
- bounded stdout/stderr collection;
- one-attempt Next.js startup and readiness polling.

`browser-quality.mjs` imports `startMockReceiver` and `startNextServer`, re-exports `isAddressInUseFailure`, and leaves its existing `app.stop()` and `mock.close()` cleanup calls unchanged.

## Testability contract

Production defaults remain unchanged. Narrow dependency injection is allowed only at lifecycle boundaries:

```js
startNextServer(mockBaseUrl, {
  findOpenPortImpl,
  maxAttempts,
  startAttemptImpl,
})
```

```js
stopChild(child, {
  forceDelayMs,
  sleepImpl,
})
```

The mock receiver is tested using a real loopback HTTP server and synthetic payloads. No production endpoint is contacted.

## Behavior-preservation rules

- Bind all temporary servers to `127.0.0.1` only.
- Preserve contact and waitlist routes, POST-only behavior, status codes, content type, token matching, and safe recorded evidence.
- Preserve the 128 KiB mock body limit.
- Preserve Next.js command, working directory, environment keys, and production mode.
- Preserve readiness route `/en`, manual redirects, 2-second request timeout, 300 ms poll interval, and 45-second deadline.
- Preserve bounded process logs at 64 KiB and final 500-character diagnostic tails.
- Preserve four startup attempts and retry only for `EADDRINUSE`/“address already in use”.
- Preserve SIGTERM, five-second grace period, SIGKILL escalation, and no-op behavior for absent or exited children.
- Preserve `isAddressInUseFailure` import compatibility from `browser-quality.mjs`.
- Add no dependency, workflow change, endpoint, browser revision, secret, or production mutation.

## Testing strategy

Add `tests/browser-quality-server.test.mjs` covering:

- runner delegation and absence of server/process implementation details;
- strict address-in-use classification and compatibility re-export;
- valid contact/waitlist forwarding through a real loopback receiver;
- 404 and malformed/oversized payload handling without retaining raw values;
- retry after one address collision and no retry for other failures;
- retry budget exhaustion;
- child shutdown no-op, graceful exit, and forced escalation.

Existing browser tests, full repository tests, production build, real Chrome scenarios, and security checks remain required.

## Public repository safety

All tests use loopback addresses, temporary files, fake child processes, and synthetic form data. Logs and assertions contain no credentials, private endpoints, production addresses, internal paths, or provider identifiers.

## Pull-request boundary

The pull request contains only browser server-lifecycle extraction, focused tests, package test registration, and design/plan documentation. Issue #14 remains open. Every bot, agent, security, dependency, inline-review, submitted-review, check-annotation, and workflow result must be inspected before integration.

## Non-goals

- No browser scenario extraction.
- No Puppeteer launch or executable discovery change.
- No route matrix, consent, form interaction, accessibility, screenshot, or report change.
- No Next.js startup command, timeout, retry-count, or process-signal change.
