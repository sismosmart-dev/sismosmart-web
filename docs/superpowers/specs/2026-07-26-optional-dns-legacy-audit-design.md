# Optional DNS Legacy Audit Design

## Context

The authoritative nameserver delegation for `sismosmart.com` has moved to Cloudflare, while the active hosting origin remains unchanged. There is no verified, distinct retired web-origin address. Requiring `DNS_LEGACY_IPV4` therefore prevents the useful DNS cutover checks from running and encourages operators to guess an address.

## Decision

Keep one DNS Cutover Audit workflow and make legacy endpoint inspection conditional.

`DNS_ORIGIN_IPV4` remains required. `DNS_LEGACY_IPV4` becomes optional. When a valid, distinct legacy address is configured, the current legacy endpoint and DNS-reference checks run unchanged. When it is absent, the audit still verifies registry delegation, public and authoritative resolver behavior, service and MX records, HTTPS, and TLS. The report records the legacy section as not configured instead of failing.

## Behavior

- Empty or missing `DNS_LEGACY_IPV4` is accepted.
- A present legacy value must be a valid IPv4 address.
- A present legacy value must differ from `DNS_ORIGIN_IPV4`.
- Former nameservers are still queried and their answers are included in the report.
- IP-specific former-nameserver and endpoint-isolation checks run only when the legacy address exists.
- The JSON report uses `legacyEndpoint.configured: false` and classification `not-configured` when skipped.
- The console summary uses `legacy=not-configured` when skipped.
- The apex HTTPS check accepts the application's permanent locale redirect response.
- No warning or failure is emitted merely because no retired origin is known.

## Error handling

The audit continues to fail closed for a missing or invalid origin address, an invalid non-empty legacy address, or identical origin and legacy addresses. Network, resolver, HTTPS, and TLS failures retain their existing behavior.

## Testing

Unit tests cover optional configuration, invalid optional values, equal-address rejection, and the stable unconfigured report shape. Existing tests preserve the fully configured legacy behavior. The complete CI gate and a real GitHub Actions DNS Cutover Audit run verify integration behavior.

## Documentation

The operations runbook must describe the actual migration: registrar delegation moved to Cloudflare, but no distinct retired web origin is known. It must not imply that the former nameserver host is the retired web server.
