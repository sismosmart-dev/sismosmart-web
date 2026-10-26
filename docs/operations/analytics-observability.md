# Analytics and consent observability

## Scope

This runbook covers the production GA4, Google Tag Manager, Microsoft Clarity, Search Console, consent, and form-success event configuration for `sismosmart.com`.

## Canonical configuration

Public resource identifiers are not credentials. Their canonical public source is `config/analytics.json`. The read-only operations configuration is Doppler project `sismosmart-web`, config `prd_ops`; environment values from that config may override committed public identifiers for controlled diagnostics. `npm run ops:status` reports the source of each value without printing unredacted identifiers.

Production and CI explicitly set `NEXT_PUBLIC_ANALYTICS_ENABLED=true`. The project has no staging target, so only production and local test traffic are relevant.

## Secret credentials

Google OAuth refresh token credentials, optional service-account credentials, Measurement Protocol authentication, and Clarity credentials remain in Doppler `prd_ops`. GitHub stores only the config-scoped read-only bootstrap secret `DOPPLER_TOKEN_PRD_OPS`; it does not duplicate the individual analytics credential inventory.

Use read-only Google scopes for routine status and audit operations. Edit or publish scopes are only appropriate for an explicit administrative operation. Rotate OAuth client secrets and refresh tokens after suspected exposure, operator removal, or at least annually. Revoke the old token only after the replacement passes `ops:ga`, `ops:gtm`, and `ops:search-console` status checks.

## Tag ownership

GTM owns the production container bootstrap and the configured Clarity tag. The current GTM workspace does not contain a GA4 tag, so the application queues exactly one consented GA `config` command before loading the container. Direct `gtag.js` and direct Clarity loading remain fallback paths when GTM is not configured.

The observability audit treats one GA config command plus one or two mirrored transport beacons as one logical `page_view`. Duplicate config commands and unbounded beacon fanout remain blocking.

## Consent model

Before any analytics loader is inserted, the application initializes Google consent with all storage categories denied. The banner supports:

- `accepted`: Google consent is granted, Clarity ConsentV2 is granted, and analytics loaders may start.
- `necessary`: Google and Clarity analytics consent remain denied and no analytics loaders start.
- reset: stored consent is removed, Google and Clarity are returned to denied, Clarity first-party cookies are cleared, and the banner is shown again.

The six supported locales are `en`, `tr`, `es`, `id`, `pt`, and `it`.

## Events

Successful JSON form submissions emit one consent-aware event:

- event: `sismosmart_form_success`
- `form_type`: `contact`, `waitlist`, or `pilot_program`
- `locale`: active document locale
- `page_path`: current path

No event is emitted when analytics consent is absent or denied. The server-side form delivery result remains the source of truth; analytics is only emitted after a successful HTTP response.

## Automated checks

Run:

```bash
npm run ops:status
npm run ops:analytics-admin-audit -- --output-dir .artifacts/analytics
npm run ops:ga -- status
npm run ops:gtm -- status
npm run ops:search-console -- status
npm run ops:clarity -- status
npm run ops:analytics-audit -- --base-url https://sismosmart.com --output .artifacts/analytics-observability.json
```

The `Analytics Observability` GitHub workflow runs manually, weekly, and after a successful production deployment. It installs the pinned official Doppler CLI action, validates the names-only `prd_ops` inventory, and executes every operational command with explicit `--project sismosmart-web --config prd_ops` selection. It:

1. validates GA4, GTM, Search Console, and Clarity resource access;
2. checks all six locales with a real Chrome browser;
3. confirms no analytics requests before consent or under necessary-only consent;
4. confirms one GTM loader element, one GA config command, one logical GA page view, bounded network fanout, and one Clarity loader after acceptance;
5. verifies the consent command ordering, reset behavior, and form-success event;
6. uploads a redacted JSON artifact.

Browser reports contain request classes and event names only. They do not store client IDs, cookie values, OAuth tokens, or complete request URLs.

### Administrative credential degradation

The browser consent and network audit is the production hard gate. Google Admin API access is a separate control-plane check:

- an expired, revoked, or missing Google credential is recorded as `auth-degraded`; the administrative audit fails while the browser audit still runs and uploads its evidence;
- successful authentication followed by a GA4, GTM, or Search Console resource mismatch remains a hard failure;
- the workflow uploads `admin-audit.json` even when a later step fails;
- credential rotation is tracked in issue #81 and must never place refresh-token values in logs or artifacts.

This distinction prevents a stale operator credential from hiding real production consent regressions while preserving visibility of the credential defect.

## Controlled GA4 verification

The browser audit sends `sismosmart_analytics_audit` with `form_type=observability_audit`. Confirm the request in the audit artifact and, when needed, verify it in GA4 DebugView or Realtime. Realtime ingestion can lag; absence from the API immediately after a network-level success is not treated as proof of delivery failure.

## GTM preview and Clarity verification

For a manual release review:

1. Open GTM Preview for `https://sismosmart.com/en`.
2. Verify no GA4 or Clarity tags fire before consent.
3. Select **Accept** and verify the GA4 configuration and Clarity tags fire once.
4. Trigger a controlled form success and verify one `sismosmart_form_success` data-layer event.
5. Open Clarity and confirm a consented session is received.
6. Reset consent and verify subsequent analytics collection is denied.

## Missing configuration versus no traffic

`ops:status` distinguishes:

- identifier configured versus missing;
- committed config versus environment override;
- OAuth/service-account readiness;
- Clarity export-token readiness;
- analytics activation enabled versus default-disabled.

A configured resource with an empty Realtime report means no recent traffic or delayed ingestion; it does not mean the resource is missing.

## Search Console performance reporting

The `performance` command provides a safe, read-only Search Console performance report through explicit Doppler project `sismosmart-web`, config `prd_ops`:

```bash
npm run ops:search-console -- performance [startDate] [endDate] [--compare]
```

The command:

- runs through explicit Doppler project `sismosmart-web`, config `prd_ops`;
- is read-only and uses only Search Analytics query calls (`webmasters.searchanalytics.query`);
- prints aggregate safe output only (totals, non-brand metrics, top queries/pages/countries);
- does not persist private reports to disk;
- defaults to a complete 28-day window ending three days ago because Search Console data is commonly available after two to three days;
- can compare against the immediately preceding equal-length period with `--compare`.

The performance command never calls `sites.add`, `sitemaps.submit`, Site Verification mutation, URL Inspection, Indexing API, or any write method. It uses only the read-only `https://www.googleapis.com/auth/webmasters.readonly` OAuth scope.

## Rollback

If analytics or consent behavior regresses:

1. Set `NEXT_PUBLIC_ANALYTICS_ENABLED=false` for the affected build and redeploy. This removes the consent component and all application-controlled analytics loaders.
2. Disable the affected tag in GTM if the defect is container-side.
3. Roll back the production release through the transactional deploy workflow if the defect is application-side.
4. Restore the previous `config/analytics.json` or reviewed `prd_ops` key ownership through the appropriate rollback path; do not copy individual credentials back into GitHub.
5. Re-run `Analytics Observability` before re-enabling analytics.
