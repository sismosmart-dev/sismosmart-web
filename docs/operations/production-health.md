# Production health monitoring

## Purpose and safety boundary

The new `Production Health` GitHub Actions workflow is a **manual-only** audit (no GitHub required-reviewer gate) while the single Doppler config contains privileged credentials. The legacy repository remains the active scheduled monitor. It does not deploy, restart Passenger, reconcile release pointers, delete releases, submit forms, alter DNS, purge caches, or change hosting configuration.

The audit can fetch SSH/cPanel values from unified Doppler `main` **only** within the main-only `production-deploy` environment. Doppler Read access does not make those provider credentials read-only; the automatic schedule was removed to avoid granting it full production keys. Its JSON artifact is retained for 14 days. Artifact upload is deliberately non-blocking so an Actions storage incident cannot hide the actual audit result.

## What is checked

The audit records:

- DNS resolution timing for the canonical hostname;
- cold and warm HTTPS timing at the Cloudflare edge;
- direct-origin HTTPS timing while preserving the canonical Host header and TLS SNI;
- `/`, `/en`, `/tr`, `/robots.txt`, `/sitemap.xml`, `/site.webmanifest`, `/api/contact`, and `/api/waitlist` behavior;
- agreement between the `current` symlink, Passenger app root, `PassengerAppRoot` in `.htaccess`, a running `next-server` process working directory, and the active `.next/BUILD_ID`;
- retained release count and storage, host filesystem use, account quota when available, and cPanel LVE resource usage when exposed by the provider;
- aggregate HTTP status classes for the two form APIs from a bounded access-log tail;
- the latest three tagged mutation-deploy conclusions from Deploy Production, plus the latest completed Security and Lighthouse workflow conclusions. Read-only or validation operations in `deploy-prod.yml` are excluded from deploy-health streaks.

## Privacy model

Monitoring does not collect form payloads or other personal data. Access logs are reduced on the hosting account to route and HTTP status before any output leaves the host. The report excludes IP addresses, origin addresses, raw log lines, query strings, cookies, authorization headers, referrers, user agents, endpoint secrets, SSH hostnames, and credentials.

Do not modify the audit to upload raw access logs. A form incident that requires request-level diagnosis must use the approved provider log process with a defined retention period and access control.

## Thresholds

Latency reflects a shared hosting environment and is warning-only. Lighthouse remains the browser-performance gate.

| Signal | Warning | Blocking |
| --- | --- | --- |
| Public warm TTFB | above 1,500 ms | only when the route or expected status fails |
| Origin warm TTFB | above 1,200 ms | only when the route or expected status fails |
| Host filesystem usage (`df`) | 85% or higher; 95% or higher is critical host pressure | never by itself on shared hosting |
| Account quota usage | 80% or higher | 90% or higher |
| Retained release count | more than 8 | more than 12 |
| Release storage | more than 1 GiB | more than 2 GiB |
| Form API server errors | any sampled `5xx` | five or more `5xx` responses and at least 20% of sampled form API requests |
| Deploy, Security, or Lighthouse history | latest completed relevant run failed once | two consecutive completed runs failed within the relevant target history |

A missing optional quota, LVE, or access-log measurement produces a warning rather than a false outage. On shared hosting, `df` reports host-filesystem pressure rather than the cPanel account quota, so even a critical host-filesystem percentage is advisory by itself. Account quota, retained release count, and release storage remain account/application-scoped blocking capacity signals. Missing release-state inspection is blocking because consistency cannot be proved safely.

## Fault domains

The report contains one primary `classification`. Investigate in this order:

### `release-state`

One or more deployment invariants disagree or cannot be inspected. Compare `current`, Passenger, `.htaccess`, process cwd, and `BUILD_ID`. Do not run a new deploy until the desired active release is independently established. Use the reconciliation and manual recovery procedures in the production deployment runbook.

### `dns`

The canonical hostname could not be resolved. Check registrar delegation, Cloudflare zone status, authoritative nameservers, and the DNS Cutover workflow before examining Passenger.

### `cloudflare-edge`

The direct origin is healthy but the public route is not. Review Cloudflare DNS, proxy status, TLS mode, WAF/rate-limit events, cache behavior, and edge incidents. Do not change origin application state merely because the edge probe failed.

### `origin-passenger`

The origin probe is unhealthy, or both public and origin probes fail. Inspect Passenger registration, the active process, runtime logs, hosting resource pressure, TLS at the origin, and release consistency. A DNS-successful public failure with an unhealthy origin belongs here rather than at Cloudflare.

### `application-form-runtime`

Pages are available but a form status endpoint is not configured/healthy, or the sampled form API `5xx` threshold is crossed. Check canonical server-only runtime variables and the controlled forms verification operation. Never paste endpoint values or form records into an issue.

### `capacity`

Account quota, retained release count, or release storage crossed a blocking threshold. Review the exact measurements, run retention in dry-run mode, and remove only entries selected by the protected release planner. A critical host-filesystem `df` reading is reported as provider pressure but does not create a capacity block by itself on shared hosting; escalate persistent host pressure to the hosting provider.

### `github-actions`

At least one target workflow has two consecutive completed failures. Open both runs, identify the first failed job/step, and distinguish a repository defect from GitHub-hosted runner, artifact, or external provider failure before rerunning.

`healthy-with-warnings` means no blocking fault was found, but latency, optional telemetry, host-filesystem pressure, a single workflow failure, form `5xx`, or approaching account/application capacity requires review. `healthy` means all required checks passed with no warnings.

## Manual dispatch and report review

1. Open Actions → Production Health → Run workflow.
2. Use `main`; do not add mutation inputs. No environment reviewer click is required.
3. Review the job summary before downloading the JSON artifact.
4. Confirm `classification`, `blocking`, `warnings`, release mismatches, route status/timing, capacity severities, form aggregates, and workflow streaks.
5. Treat a missing report as a workflow/runtime error, not as a healthy result.

The JSON report uses schema version 1 and intentionally contains stable route labels instead of raw URLs or infrastructure addresses.

If the Actions artifact quota prevents upload, use the compact `PRODUCTION_HEALTH_SAFE` line in the audit step log. It preserves classification, failed route keys with status/error metadata, release mismatch names, capacity severities and values, aggregate form counts, workflow streaks, and warnings without infrastructure paths or credentials. An artifact quota failure remains non-blocking; the audit exit code is still authoritative.

## Hosting constraints and escalation

The application runs under cPanel/CloudLinux Passenger on shared infrastructure. Host-wide load averages, `df` disk pressure, noisy-neighbor effects, and provider throttling can affect TTFB even when repository code is unchanged. A filesystem percentage from `df` therefore describes the shared host mount, not the SismoSmart account quota. The audit records cPanel quota and LVE CPU/I/O/resource usage when the provider module returns them; it does not invent an LVE ceiling when the API omits one.

Escalate to the hosting provider when any of the following persists after a warm rerun:

- origin warm TTFB remains above 1,200 ms while application and release state are healthy;
- host filesystem usage remains at or above 95%, or account quota approaches its blocking threshold and cannot be corrected by reviewed release retention;
- LVE CPU, memory, entry-process, process-count, or I/O usage repeatedly reaches the provider maximum;
- Passenger becomes unavailable despite a consistent release and valid runtime configuration;
- origin TLS or provider networking fails independently of Cloudflare.

Include UTC timestamps, workflow run IDs, route labels, cold/warm timing, quota percentages, LVE usage versus maximum, and the report classification. Do not include IP addresses, credentials, endpoint secrets, raw logs, or form data.

## Alert channel

The scheduled workflow result is the alert. GitHub notifications should be enabled for failed Actions runs. The workflow does not automatically create or reopen issues, because repeated transient provider failures should be reviewed before generating repository noise. Two consecutive completed failures are blocking and must be triaged under the fault domain reported by the latest audit.

## New repository public-only scheduled monitor (staged, not yet activated)

The separate `Public Health` workflow performs cold and warm verified HTTPS GET
requests to eight public routes, including read-only form runtime endpoints. It
never uses Doppler, SSH, cPanel or any GitHub secret. A failed route or missing
route result fails the Action visibly. It is main-only and uses the tokenless
`production` environment. GitHub Actions defaults to notifying subscribed
maintainers of workflow failures; do not assume it replaces off-platform paging.

The scheduled job is **disabled by default** through the absent/false
`SISMOSMART_PUBLIC_MONITOR_ENABLED` repository variable. A manual
`workflow_dispatch` is available for acceptance after merge. Enable the
variable only when the old repository public monitoring has a safe replacement
and the new controller handoff is approved. Avoid duplicate scheduled audits.

This monitor cannot inspect origin, Passenger, cPanel quota, private release
consistency or privileged DNS/API resources. The deep `Production Health` audit
remains a **manual owner-approved** operation in `production-deploy`, because
the single Doppler config has deployment-capable credentials. Do not claim
that public-only checks are a privilege-equivalent replacement for historical
private audits. The old scheduled health workflow must remain active until the
monitoring scope and reduced automated coverage are explicitly accepted.

## Monitoring controller handoff (required before old repository deletion)

Old `SismoSmart/sismosmart-web` schedule coverage is wider than just website
health: it includes 6-hour production health, daily DNS/mail/Lighthouse,
weekly analytics and security, and daily stale-management. **Do not disable**
those jobs merely because the new public-only checker is green.

In the new repository, `Public Health` can probe eight HTTPS routes every six
hours and `Lighthouse` can audit web experience weekly. They require **no**
Doppler token, DNS origin address or SSH/cPanel credential; both are opt-in
for scheduled runs using `SISMOSMART_PUBLIC_MONITOR_ENABLED=true`. The
Lighthouse workflow must remain `disabled_manually` until final handoff,
otherwise re-enabling it too early would create duplicate scheduled audits.
The opt-in flag is set only once the original monitor is being retired.

The protected `production-deploy` deep read-only workflows are manual only:
Production Health, DNS Cutover Audit, Mail DNS Audit and Analytics
Observability. The unified Doppler config contains production-write-capable
SSH/cPanel credentials, so passing those credentials to unattended cron jobs
is not an acceptable equivalent of the old monitoring topology. Before
decommissioning the old repo, either supply **separate, least-privileged**
read-only monitoring credentials and test equivalent scheduled workflows or
explicitly accept reduced unattended monitoring. There is currently no proof
of equivalence for private origin, SMTP TLS, provider capacity and analytics
API checks.

Cutover acceptance must document: working production deployment on exact SHA,
form/TLS/DNS/analytics checks, verified rollback, monitored trial under the
new controller, whether failures create actionable alerts, no legacy deploy
trigger or external credential consumer, and valid old-organization admin
permission. The **last** action is deletion of the old repository; deletion
is not an acceptable test of the migration.

### Public DNS/mail regression checks in the existing 6-hour health job

The tokenless Public Health workflow checks public nameserver delegation,
mail MX destination, SPF relay/terminal policy, DKIM RSA key length and DMARC
policy/reporting. This runs as an extra step **within the existing Public
Health job**, so it does not create another scheduled Actions run.
Logs expose only pass/fail check labels, not TXT records, addresses or tokens.
A temporary public resolver failure fails the check visibly rather than
misreporting success. This does not replace private origin DNS reachability,
SMTP TLS, cPanel capacity or provider API inspections; keep those manual
until a separate accepted monitoring parity plan exists.
