# Mail DNS and DMARC Operations

## Public configuration contract

The domain uses a direct DNS-only mail host as the local mail exchanger and an approved outbound relay. Provider record identifiers, origin addresses, mailbox inventory, queue state, and account-level evidence are maintained in the private continuity vault rather than this public runbook.

| Control | Required public behavior |
| --- | --- |
| MX | one direct target at `mail.sismosmart.com` |
| Mail A | DNS-only host resolves to the protected origin value supplied at runtime |
| SPF | one record with the approved relay include and terminal `-all` |
| DKIM | `default._domainkey`, RSA key of at least 2048 bits |
| DMARC | staged policy with same-domain aggregate reporting and `pct=100` |

Public resolvers must return only the approved MX exchange. SMTP submission endpoints must present a valid certificate; port 25 reachability is not used as the submission health check.

## Automated audit

Run locally:

```bash
npm run ops:mail-dns
npm run ops:mail-dns -- --output .artifacts/mail-dns-report.json
```

The daily `Mail DNS Audit` workflow checks Cloudflare, Google, Quad9, and the runner's local resolver for:

- a single direct MX target;
- the DNS-only mail host resolving to the intended origin;
- one SPF record with the MailBaby include and terminal `-all`;
- one parseable DKIM key of at least 2048 bits;
- one DMARC record with the approved aggregate-report mailbox;
- a recognized DMARC policy and `pct=100`;
- valid SMTP TLS on implicit TLS port 465 and STARTTLS port 587.

During the observation period, `p=none` is reported as a warning, not a failed audit. Enforcement is never changed automatically.

## DMARC observation period

Current monitoring record:

```text
v=DMARC1; p=none; rua=mailto:info@sismosmart.com; adkim=r; aspf=r; pct=100; ri=86400
```

Keep `p=none` until all of the following are true:

1. Aggregate reports have been received for at least 14 consecutive days.
2. Every legitimate source is identified and documented.
3. The cPanel origin and MailBaby traffic pass DMARC through aligned DKIM or aligned SPF.
4. Marketing, support, monitoring, and transactional tools are either aligned or explicitly retired.
5. Unknown failing volume is understood and does not contain legitimate mail.
6. Inbound and outbound synthetic tests have been reviewed in the receiving providers' raw headers.

Aggregate XML or compressed attachments are untrusted input. Store them separately, do not execute embedded content, and review source IP, message count, disposition, SPF alignment, and DKIM alignment before changing policy.

## Staged enforcement plan

Each stage requires a green `Mail DNS Audit`, a fresh aggregate-report review, and a documented rollback value.

| Stage | Minimum observation | Policy |
| --- | --- | --- |
| Monitor | 14 days | `p=none; pct=100` |
| Quarantine pilot | 7 days | `p=quarantine; pct=25` |
| Quarantine expansion | 7 days | `p=quarantine; pct=50` |
| Full quarantine | 14 days | `p=quarantine; pct=100` |
| Reject pilot | 7 days | `p=reject; pct=25` |
| Reject expansion | 7 days | `p=reject; pct=50` |
| Full reject | ongoing | `p=reject; pct=100` |

Use relaxed alignment (`adkim=r; aspf=r`) until all active senders are confirmed. Strict alignment is a separate hardening change and must not be bundled with the first enforcement transition.

At enforcement time, add an explicit subdomain policy only after inventorying subdomain senders. Do not assume unused subdomains are safe to reject without checking service integrations.

## Delivery tests

### Outbound

Send a uniquely identified message from the cPanel origin through the normal submission path to at least two independent mailbox providers. In the received raw headers verify:

- `spf=pass` and whether the return-path domain aligns;
- `dkim=pass` with `d=sismosmart.com` or another aligned domain;
- `dmarc=pass`;
- the expected MailBaby relay path;
- no unexpected forwarding or rewriting.

A sendmail acceptance code confirms local queue acceptance only; it is not proof of remote delivery or DMARC alignment. Preserve the receiving provider's `Authentication-Results` header as evidence.

### Inbound

Send from an independent provider to the published domain mailbox. Verify:

- MX resolution used `mail.sismosmart.com`;
- the message reached the intended mailbox exactly once;
- TLS was negotiated where the sender reports it;
- the message did not enter the web application path;
- no catch-all or unintended forwarder received a copy.

## Change procedure

1. Record the current MX, A, SPF, DKIM, and DMARC values in the private change record; keep provider record identifiers outside Git.
2. Run `Mail DNS Audit` and `DNS Cutover Audit`; both must be green except the expected DMARC observation warning.
3. Review the latest aggregate reports and synthetic delivery headers.
4. Change only the DMARC policy or percentage for the current stage. Do not change MX, SPF, DKIM, and DMARC enforcement together.
5. Confirm the authoritative nameservers and Cloudflare, Google, and Quad9 resolvers return the new value.
6. Run both audits again.
7. Monitor delivery failures, support reports, aggregate data, and the mail queue through the stage window.

## Rollback

For the current monitoring stage, restore:

```text
v=DMARC1; p=none; rua=mailto:info@sismosmart.com; adkim=r; aspf=r; pct=100; ri=86400
```

If aggregate reporting itself causes an operational problem, the pre-monitoring fallback is:

```text
v=DMARC1; p=none;
```

For a failed enforcement stage, restore the immediately previous policy and percentage rather than changing MX or SPF. Keep the same `rua` mailbox so the failure remains observable.

Never proxy the mail A record through Cloudflare. Never point web traffic at `mail.sismosmart.com`, and never point MX at the proxied apex. If MX or the mail A record must be rolled back, use the provider-private rollback record and validate inbound delivery before declaring recovery complete.
