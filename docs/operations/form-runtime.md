# Form runtime, forwarding, proxy trust, and rate limiting

## Scope

The contact and waitlist/pilot APIs accept bounded JSON, validate it server-side, reject honeypot submissions, apply a best-effort rate limit, and forward a controlled envelope to a server-only HTTP(S) endpoint. Browser code never receives the forwarding endpoint or authorization token.

## Forwarding contract

The runtime sends one non-idempotent `POST` containing:

- `form`: `contact` or `waitlist`;
- `payload`: the validated form fields;
- `receivedAt`: a server timestamp.

When `FORM_FORWARD_AUTH_TOKEN` is configured, the request contains a Bearer authorization header. The forwarding request has a bounded timeout. Missing/unsafe endpoints fail closed with `FORM_ENDPOINT_MISSING`; network errors and non-2xx upstream responses become `FORM_FORWARD_FAILED` and return HTTP 502 to the browser.

There is **no automatic retry** for a failed forwarding request. Form submission is non-idempotent, and blindly retrying can create duplicate leads when an upstream service processes a request but the response is lost. A future retry design requires an agreed idempotency key and receiver-side deduplication. Until then, the user receives a failure response and may submit again manually.

## Controlled tests

Node integration tests replace `fetch` with a controlled mock and verify the envelope, Bearer authentication, timeout signal, missing endpoint handling, one-attempt behavior, and HTTP/network failure mapping. Browser tests run a local production Next.js server and a loopback mock receiver, submit synthetic contact and pilot forms, and confirm forwarding metadata without using real user data or production destinations.

## Trusted proxy/IP extraction

The application prefers `CF-Connecting-IP` because Cloudflare overwrites it for proxied traffic. Tests use realistic Cloudflare and Passenger chains and verify that this value wins over attacker-supplied `X-Forwarded-For` content.

When `CF-Connecting-IP` is unavailable, the application uses the final `X-Forwarded-For` hop as the nearest proxy value, then falls back to `X-Real-IP`. This fallback is only meaningful when the origin accepts traffic from a trusted reverse proxy. Direct origin exposure can make proxy headers spoofable; Cloudflare/origin restrictions remain part of the security boundary.

## Rate-limit decision

The current `RateLimiter` uses a **per-process** in-memory map. It is intentionally accepted as a **best-effort** abuse guard for the present runtime and is **not a hard global limit**. With multiple Passenger workers, each worker has an independent allowance, so the effective site-wide budget can be approximately `workers × limit`.

Strict cross-worker enforcement requires a shared store such as Redis, a provider KV/database, or an edge rate-limit control with an explicit availability and privacy model. A shared store must not be introduced only for test completeness; it requires an operational owner, credentials, monitoring, failure behavior, retention policy, and rollback plan. Cloudflare edge controls should remain the first line of defense, while the application limiter provides defense in depth.

## Operational verification

- Use only synthetic addresses and messages in tests.
- Keep endpoint values and tokens in approved Secrets/runtime configuration.
- Verify `GET /api/contact` and `GET /api/waitlist` report configured status without exposing endpoints.
- Run a controlled synthetic delivery after endpoint or token rotation.
- Review 429, 4xx, and 5xx aggregates through sanitized production health evidence; do not archive raw submissions.
- If Passenger worker count changes or strict global enforcement becomes a requirement, reopen the shared-store decision before claiming a fixed site-wide request budget.
