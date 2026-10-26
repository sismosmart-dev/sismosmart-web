# Production Health HTTPS Probe Design

## Goal

Extract the production-health HTTPS route probing layer from `scripts/ops/production-health.mjs` without changing any route, network timeout, TLS behavior, form-health contract, health classification, report shape, workflow, or production state.

This is the tenth small delivery for issue #14. The parent issue remains open for the remaining production-health and deployment orchestration decomposition.

## Current problem

`production-health.mjs` still owns a cohesive HTTPS probing layer in addition to DNS resolution, SSH inspection, cPanel reads, workflow checks, health aggregation, reporting, and CLI orchestration. The probing layer includes:

- the canonical public route catalog;
- the origin route subset;
- fixed-address DNS lookup for origin probes;
- HTTPS request timing and bounded response capture;
- redirect, Cloudflare, and form-health evaluation;
- cold and warm route-set execution;
- public and origin probe wrappers.

These responsibilities are read-only and independently testable.

## Approaches considered

### Move only route constants

This would reduce little complexity and leave the network implementation coupled to the orchestration file.

### Move DNS and all network discovery

This would also move public DNS and origin-address resolution, increasing the scope to configuration and hostname resolution behavior.

### Move the complete HTTPS route-probe layer

Create one focused module for route definitions, HTTPS measurement, cold/warm route sets, and public/origin wrappers. Leave DNS/origin resolution and all remote-system orchestration in the current runtime. This is the selected approach.

## Architecture

Create `scripts/ops/production-health-probes.mjs` with these exports:

```js
export const productionHealthPublicRoutes
export function fixedLookup(address, family)
export async function measureHttps(options, dependencies?)
export async function probeRouteSet(options, dependencies?)
export function probePublicRoutes(options, dependencies?)
export function probeOriginRoutes(options, dependencies?)
```

The module owns:

- `REQUEST_TIMEOUT_MS = 20_000`;
- `MAX_CAPTURE_BYTES = 64 * 1024`;
- the eight public routes and four origin routes;
- fixed IPv4/IPv6 lookup callbacks;
- HTTPS request construction and timing;
- bounded JSON capture for form status routes;
- status, redirect, Cloudflare, form, and error evaluation;
- cold/warm execution with the existing 500 ms delay;
- public hostname and origin-address routing.

`production-health.mjs` imports `probePublicRoutes` and `probeOriginRoutes`, and re-exports those functions plus `productionHealthPublicRoutes`. Existing consumers continue importing from `production-health.mjs`.

## Behavior-preservation rules

- Preserve all eight route keys, paths, expected statuses, redirect suffix, and form targets.
- Preserve the origin subset: `en`, `robots`, `contact`, and `waitlist`.
- Preserve HTTPS port 443, SNI hostname, certificate validation, no-agent behavior, request headers, and GET method.
- Preserve the 20-second timeout and `ETIMEDOUT` classification.
- Preserve the 64 KiB maximum captured form body.
- Preserve timing fields and two-decimal rounding.
- Preserve Cloudflare detection from `cf-ray` or the server header.
- Preserve form health requirements: JSON `ok`, `configured`, and exact target.
- Preserve cold probe, 500 ms delay, warm probe, route ordering, and aggregate `ok` semantics.
- Preserve origin-unavailable behavior as `{ ok: false, routes: [] }`.
- Change no DNS lookup policy, SSH/cPanel interaction, workflow query, report shape, dependency, workflow, credential, or production state.

## Testability contract

Focused tests may inject:

- an HTTPS request implementation and clock into `measureHttps`;
- a measurement function and sleep function into `probeRouteSet`;
- a route-set function into the public/origin wrappers.

Production defaults remain the current Node.js implementations. Existing callers pass no dependency options.

## Testing strategy

Add `tests/production-health-probes.test.mjs` covering:

- runtime delegation and removal of probe implementation details;
- exact route and origin-subset policy;
- fixed lookup behavior for single and `all` calls;
- cold/warm ordering, 500 ms delay, route order, and aggregate status;
- public hostname selection;
- origin fixed-address forwarding and unavailable-origin behavior;
- representative successful form/Cloudflare measurement and timeout/error measurement with fake HTTPS primitives.

Existing production-health runtime tests, full repository tests, production build, dependency audit, and browser quality remain required acceptance checks.

## Public repository safety

Tests use loopback-style synthetic hosts, documentation addresses, fake response headers, and bounded synthetic JSON. They add no credential, production endpoint, private inventory, internal path, raw production response, or provider identifier.

## Pull-request boundary

The pull request contains only the HTTPS probe extraction, focused tests, package test registration, source-location contract updates, and design/plan documentation. Issue #14 remains open. Before integration, inspect every bot, agent, dependency, security, inline-review, submitted-review, annotation, and workflow channel.

## Non-goals

- No public DNS or origin-address resolution change.
- No SSH, cPanel, workflow, capacity, form-log, classification, reporting, or CLI change.
- No deployment, production request, or production mutation.
