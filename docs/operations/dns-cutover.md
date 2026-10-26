# DNS cutover and rollback

This runbook defines the authoritative DNS inventory and the verification procedure for `sismosmart.com` after the Cloudflare delegation cutover completed on 2026-07-10.

## Current authoritative state

Registry delegation must contain only:

- `dane.ns.cloudflare.com`
- `ryleigh.ns.cloudflare.com`

Cloudflare zone ID is stored in the private operations inventory.

### Web records

| Name | Configured record | Proxy mode | Public behavior |
| --- | --- | --- | --- |
| `sismosmart.com` | `A <origin-ip-redacted>` | Proxied | Returns Cloudflare edge IPv4 addresses. |
| `www.sismosmart.com` | `CNAME sismosmart.com` | Proxied | Returns Cloudflare edge IPv4 addresses and redirects to the apex HTTPS URL. |

The origin address must never appear in public apex or `www` A answers while the proxy is enabled. Cloudflare edge addresses are validated against Cloudflare's published IPv4 ranges rather than pinned to specific edge IPs.

### Mail and hosting service records

| Name | Configured record | Proxy mode | Expected public IPv4 |
| --- | --- | --- | --- |
| `mail.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `cpanel.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `webmail.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `autodiscover.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `autoconfig.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `ftp.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `webdisk.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `whm.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `cpcontacts.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `cpcalendars.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |
| `_dc-mx.15e29cb60c6e.sismosmart.com` | `A <origin-ip-redacted>` | DNS only | `<origin-ip-redacted>` |

The `_dc-mx` record is a temporary compatibility target for resolvers that cached the pre-migration Cloudflare-generated MX hostname. Remove it only after the previous 14,400-second MX TTL has elapsed and all audited resolvers return `mail.sismosmart.com` as the MX exchange.

The configured MX record is priority `0` with target `mail.sismosmart.com`. The mail host is an explicit DNS-only A record to `<origin-ip-redacted>`; it must not be a CNAME to the proxied apex. This avoids resolver-dependent CNAME flattening and keeps incoming mail independent of Cloudflare web proxy addresses.

Validated TLS service paths:

- `https://cpanel.sismosmart.com:2083/`
- `https://webmail.sismosmart.com:2096/`
- IMAPS `mail.sismosmart.com:993`

These services currently present a valid `*.sismosmart.com` certificate.

### Public TXT and validation records

The zone contains the following public TXT record groups:

- Apex SPF
- Apex Google Search Console verification
- Apex Facebook domain verification
- `default._domainkey` DKIM
- `_dmarc`
- `_acme-challenge`
- `_cpanel-dcv-test-record`
- CalDAV/CardDAV discovery records

TXT values are public DNS data but are intentionally omitted from this runbook to avoid copying stale validation material. The Cloudflare zone remains the source of truth.

## Automated audit

Run the complete read-only audit with:

```bash
npm run ops:dns-cutover -- --output .artifacts/dns-cutover-report.json
```

The audit verifies:

1. Registry/RDAP delegation exactly matches the two Cloudflare nameservers.
2. Cloudflare (`1.1.1.1`), Google (`8.8.8.8`), Quad9 (`9.9.9.9`), and the local resolver return Cloudflare edge addresses for apex and `www`.
3. Mail, cPanel, webmail, autodiscovery, FTP, WebDisk, WHM, contacts, and calendar hosts resolve only to `<origin-ip-redacted>`.
4. Every public MX exchange resolves only to `<origin-ip-redacted>`.
5. Both authoritative Cloudflare nameservers return the expected delegation, web, service, and MX results.
6. The former nameservers are queried and their apex and `www` answers are recorded for migration evidence.
7. Production web, cPanel, webmail, and IMAPS TLS paths validate without certificate errors.
8. When a verified `DNS_LEGACY_IPV4` is configured, no observed DNS answer references it and its endpoint is isolated from production.

The scheduled `DNS Cutover Audit` GitHub Actions workflow stores a 14-day JSON report artifact.

## Optional legacy provider endpoint

No distinct retired web-origin address is currently documented. The former nameserver host address identifies a historical DNS service and must not be treated as proof of a former web server. `DNS_LEGACY_IPV4` therefore remains unset unless a retired origin is verified from provider records, an old zone export, or another authoritative source.

When `DNS_LEGACY_IPV4` is unset, the audit records `legacyEndpoint.configured: false` with classification `not-configured`. It still runs every registry, Cloudflare, resolver, service-DNS, HTTPS, and TLS check. Former nameserver responses remain visible in the JSON report, while IP-specific endpoint and DNS-reference checks are skipped without warning or failure.

If a distinct retired origin is verified later, configure `DNS_LEGACY_IPV4`. The same workflow will then restore the endpoint isolation, certificate, content, and observed-DNS checks automatically.

## Cutover procedure

1. Export the complete current zone and registrar nameserver state.
2. Recreate all web, mail, service, DKIM, SPF, DMARC, validation, and discovery records in Cloudflare.
3. Keep apex and `www` proxied. Keep mail and hosting service records DNS only.
4. Validate origin TLS service paths before changing delegation.
5. Change registrar delegation to the assigned Cloudflare nameservers only.
6. Check registry/RDAP, authoritative nameservers, public resolvers, and a local ISP resolver.
7. Keep the previous provider zone available for at least the previous parent-delegation TTL, but remove any legacy apex/`www` A records.
8. Run `npm run ops:dns-cutover` until every error-severity check passes.

## Rollback procedure

Prefer record-level rollback inside Cloudflare. Do not restore the former registrar delegation unless a complete and verified authoritative zone has first been recreated on the rollback provider.

For a record-level rollback:

1. Restore the last exported Cloudflare record values.
2. Keep mail and service records DNS only.
3. Purge only affected Cloudflare cache entries if web routing changed.
4. Run the DNS audit and production post-deploy verification.

For an emergency delegation rollback:

1. Recreate the full zone on the rollback nameservers and verify it by querying those nameservers directly.
2. Confirm apex, `www`, MX, SPF, DKIM, DMARC, cPanel, webmail, and certificate paths before registrar changes.
3. Update registrar nameservers.
4. Monitor parent delegation for the full previous TTL.
5. Never point apex or `www` to the retired origin.
