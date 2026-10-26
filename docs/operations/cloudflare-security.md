# Cloudflare security operations

Last verified: 2026-07-20

## Scope

This runbook covers the Cloudflare edge policy for `sismosmart.com`, the form APIs, and provider-managed service hostnames. Cloudflare zone changes are production changes and must be applied one rule at a time, followed by an external verification and a documented rollback check.

## TLS baseline

The zone-wide policy is:

- SSL mode: `Full (strict)`
- Minimum visitor TLS version: `1.2`
- TLS 1.3: enabled
- Always Use HTTPS: enabled
- Universal certificate: active for `sismosmart.com` and `*.sismosmart.com`

External verification must show TLS 1.0 and 1.1 failing while TLS 1.2 and 1.3 succeed. The Cloudflare setting is authoritative only for proxied hostnames.

Reference: <https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/>

## Form API control layers

The protected production paths are:

- `/api/contact`
- `/api/waitlist`

The intended HTTP contract is:

| Method | Behavior |
| --- | --- |
| `GET` / `HEAD` | Runtime health response |
| `OPTIONS` | Framework preflight response |
| `POST` | Validate, rate-limit, and forward a form submission |
| Other methods | Block at the Cloudflare edge; origin also returns `405` |

### Custom WAF method rule

- Ruleset: `<ruleset-id-redacted>`
- Rule: `<rule-id-redacted>`
- Phase: `http_request_firewall_custom`
- Action: `block`
- Match: either form API path with a method outside `GET`, `HEAD`, `OPTIONS`, and `POST`

Rollback: disable this rule and verify that unsupported methods return the origin `405` response again.

### Free-plan burst limit

- Ruleset: `<ruleset-id-redacted>`
- Rule: `<rule-id-redacted>`
- Phase: `http_ratelimit`
- Characteristic: client IP, scoped per Cloudflare data center
- Threshold: 20 requests across both form API paths in 10 seconds
- Mitigation: block for 10 seconds

The Free plan provides one rate-limiting rule, a 10-second counting period, and path-based matching. Consequently, health requests to the two API paths also count toward this burst limit. The threshold is intentionally above deployment and monitoring bursts. The application retains its separate best-effort limit of eight parsed POST attempts per client over ten minutes per Node worker. For Cloudflare-proxied traffic, the application keys that limiter from the Cloudflare-managed `CF-Connecting-IP` visitor header; using the final proxy hop would incorrectly merge unrelated visitors onto one budget. Oversized or malformed bodies are rejected before this application limiter, so the 32 KiB boundary remains deterministic.

Rollback: disable this rule and verify normal GET, OPTIONS, invalid POST, and one controlled valid form submission.

Reference: <https://developers.cloudflare.com/waf/rate-limiting-rules/>

### Request body limit

Cloudflare's `http.request.body.size` field requires Enterprise. The authoritative body-size control is therefore enforced before JSON parsing in the application:

- Maximum request body: 32 KiB (`32 * 1024` bytes)
- Enforcement: declared `Content-Length` check plus streaming byte count
- Oversized response: HTTP `413` with `PAYLOAD_TOO_LARGE`
- Malformed JSON response: HTTP `400` with `INVALID_JSON`

The post-deploy verifier submits oversized payloads to both form endpoints and requires HTTP `413`.

Reference: <https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/http.request.body.size/>

## Provider-managed service host policy

These records are intentionally DNS-only because they terminate provider-managed mail, calendar, contact, FTP, cPanel, or webmail services outside the proxied application path. DNS-only records expose the origin address and do not receive the zone's Cloudflare WAF or visitor TLS policy.

Last externally verified: `2026-07-20`.

Review cadence: quarterly, and immediately after a hosting-provider, DNS, certificate, or access-policy change. Named owners and MFA recovery material belong in the private access inventory, not in this repository.

| Host group | Observed external state | Owner confirmation status | Policy and next action |
| --- | --- | --- | --- |
| `mail`, `autoconfig`, `autodiscover` | Resolve directly to the provider origin. SMTP submission and IMAPS service paths are reachable; automated mail DNS checks pass. | Named business/technical owner pending; production mail dependency is confirmed. | Retain DNS-only while provider mail is in use. Do not proxy without protocol-specific validation. |
| `cpanel`, `webmail` | Direct administrative login surfaces are reachable and present a valid `*.sismosmart.com` certificate. | Named hosting administrator and MFA evidence pending. | Keep operator-only, never link publicly, require unique credentials and MFA, and review provider login/audit logs after suspicious activity. |
| `webdisk`, `cpcontacts`, `cpcalendars` | Provider service ports are reachable. Standard HTTPS probing does not prove an active WebDAV/CardDAV/CalDAV client dependency. | Active client inventory pending. | Retain only while a named client or automation uses the service. Prepare the DNS rollback record, then remove unused records. |
| `whm` | Port `2087` is reachable. WHM certificate is currently valid for `whm.sismosmart.com` through the `*.sismosmart.com` wildcard certificate. | Provider requirement and authorized operator pending; routine use is not approved. | Remove the DNS record if the shared-hosting provider does not require it. Until then, treat it as an exposed administrative login surface. |
| `ftp` | Port `21` is reachable. FTP TLS hostname mismatch remains: explicit TLS presents only the provider hostname certificate, not `ftp.sismosmart.com`. | Legacy client or automation dependency pending. | Prefer SSH/SFTP. Remove the record and disable legacy FTP when no dependency exists; otherwise require a provider-side certificate correction. |

No DNS-only service record may be removed until the owner/dependency decision and rollback value are recorded. An unresolved owner status is a review finding, not an approval to retain the record indefinitely.

Cloudflare Access cannot protect a DNS-only hostname. Protecting these services with Access requires a supported proxied hostname or Cloudflare Tunnel and provider compatibility testing. Until then, account MFA, credential hygiene, provider logs, and removal of unused records are the controls.

## API token policy

Use a token restricted to the `sismosmart.com` zone. Separate read-only audit access from mutation access where practical.

Read-only audit token:

- Zone Read
- DNS Read
- Zone Settings Read
- SSL and Certificates Read
- Zone WAF Read
- Analytics Read

Mutation token, only for controlled operations:

- DNS Write when DNS automation is required
- Zone Settings Write when TLS/zone policy changes are required
- Zone WAF Write for custom and rate-limiting rules
- Dynamic URL Redirects Write and Zone Transform Rules Write only when those rule families are maintained

The current automation token can read and change DNS, settings, and rules, but zone analytics currently returns an authentication error. Create a replacement least-privilege audit token with `Analytics Read`, verify analytics retrieval, and rotate/revoke the old token according to the owner-approved procedure. Never write a token value to the repository, logs, issues, or command output.

Reference: <https://developers.cloudflare.com/fundamentals/api/reference/permissions/>

## Activation order

1. Confirm production form health GETs return `200` and invalid POSTs return `400`.
2. Deploy and verify the 32 KiB origin body limit.
3. Enable the method rule; verify allowed methods and an edge block for an unsupported method.
4. Enable the rate-limit rule.
5. Verify one controlled legitimate contact and waitlist submission end to end.
6. Verify production pages and Passenger status remain healthy.
7. Record ruleset versions, deploy run, release ID, and verification evidence in the tracking issue.

Do not load-test the production form endpoints to prove the rate limit. API configuration, rule enabled state, normal request behavior, and Cloudflare security analytics are the verification sources.

## Routine verification

At minimum, record:

- zone setting values for `ssl`, `min_tls_version`, and `tls_1_3`
- active certificate status and expiry
- TLS 1.0/1.1 rejection and TLS 1.2/1.3 success
- custom/rate-limit ruleset IDs, versions, and enabled state
- GET, HEAD, OPTIONS, invalid POST, and unsupported-method responses
- HTTP `413` for an oversized request on each form API
- one controlled valid form delivery when form delivery verification is explicitly enabled
- DNS-only service-host inventory and owner-approved exceptions
