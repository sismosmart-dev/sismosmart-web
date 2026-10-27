# Content API: database and release prerequisites

The SismoSmart website currently has six locale-specific TypeScript content sources. Issue #29 tracks progressive, opt-in API-managed edits with no rebuild needed for subsequent publications. **Authoring API code is merged but still disabled in production; no live SQL tables, grants, publishing credentials or live content have been enabled.**

## Confirmed hosting facts (2026-10-27)

- cPanel/CloudLinux Passenger serves the standalone Next.js production app (Node.js 22.23.4 on the hosting panel).
- The existing `sismosma_web` MariaDB/MySQL database has **zero tables** (verified in signed-in phpMyAdmin). The hosting plan permits exactly **one database**, currently allocated to it; the database is reported as 0 bytes used.
- One database user exists, but cPanel's database list shows **no privileged user assignment**. Assign explicit minimal rights only after backing up and verifying the intended account; do not silently reuse admin credentials.
- cPanel's Backup screen reports **no automatically generated account backup**; a download option for the database exists. The account's Cron Jobs screen reports **no cron jobs**. A **restorable off-site SQL backup process** must be tested before accepting content writes in production.
- No existing content database driver is in the current live application. `mysql2/promise` is included here for future protected runtime reads/writes; no connection is attempted while `CMS_DB_ENABLED` is absent/false.

## Schema and safe activation sequence

1. Independently verify the active database is still empty and make/export a tested backup before any DDL. Do not assume a future zero-byte display means there are zero tables.
2. Grant a dedicated CMS SQL user minimum rights on the existing database. Never use a panel/root account or make the SQL port publicly reachable. Use cPanel's local `localhost:3306` endpoint.
3. Apply the **additive** [`001_content_api.sql`](../../migrations/001_content_api.sql) migration. It defines `cms_content` and `cms_revision` with a composite locale/key primary key and independent revision history; it alters no existing table.
4. Store `CMS_DB_ENABLED=true`, `CMS_DB_HOST`, `CMS_DB_USER`, `CMS_DB_PASSWORD`, `CMS_DB_NAME`, and (optional) `CMS_DB_PORT` in Doppler's production runtime scope **only after the DB user and data access are verified**. Never pass write-capable database credentials into scheduled health checks or source control.
5. Publish only validated, approved records. First prove `en/home.hero` draft, publish, SEO consistency and rollback under a separate protected migration/release; then expand to other pages/locales.
6. Keep source-controlled TypeScript copy as a failure fallback. Publication must invalidate the corresponding Next.js rendering and metadata caches and must not require a new GitHub deployment.

## Operational boundaries

Only documented keys in `src/lib/content-api/contracts.ts` are editable. No raw HTML is accepted; the runtime must not return drafts to public visitors. Limit admin writes to authenticated, audited operations. Version/optimistic-lock checks, read-only public fallback, and rollback testing are required before enabling writes.

This repository is public. Never commit database passwords, SQL exports containing site/customer data, CMS bearer tokens, or cPanel browser session URLs. Existing deploy `runtime-env.mjs` uses an explicit allowlist and will require a reviewed update before any production CMS activation.

## Protected authoring API — staged, disabled by default

This code path only becomes operational after the migration, backup/restore test,
scoped database grants, production runtime secret allowlist and exact-release
acceptance are completed. A merged feature PR alone does **not** activate the CMS.
`CMS_DB_ENABLED` and `CMS_WRITE_ENABLED` must both be explicitly `true`, and
`CMS_ADMIN_TOKEN` must be a randomly generated **32+ character base64url** bearer
token stored in the protected server-only Doppler configuration. Never place it
in frontend JavaScript, GitHub issue text, public docs or scheduled Actions.

The first registered keys are `home.hero` and `home.meta`; locale must be one of
`en`, `tr`, `es`, `id`, `pt`, `it`. Example URLs (do not paste real secrets):

| Method and route | Action |
| --- | --- |
| `GET /api/admin/content/en/home.hero` | Authenticated private draft, published value, revision counter and last 25 revision labels |
| `PATCH /api/admin/content/en/home.hero` | Save draft without changing any visitor-facing copy |
| `POST /api/admin/content/en/home.hero/publish` | Publish the latest valid draft; update rendering and SEO cache |
| `POST /api/admin/content/en/home.hero/rollback` | Restore an earlier published revision, or `targetVersion: 0` to return to code-controlled copy |

All admin calls require `Authorization: Bearer <a-long-random-token>`; writes
must use `Content-Type: application/json` and include an integer
`expectedVersion` from the protected GET response. The PATCH body also needs
`content: { "title": "...", "description": "..." }`; the rollback body needs
`targetVersion`. A version mismatch returns 409; a missing publication/draft
returns 422. Invalid locale/key, unapproved fields, HTML markup and oversized
request bodies are rejected. Browser requests from any noncanonical Origin
are rejected even if a token is provided. CORS is not enabled.

The six localized homepage routes are deliberately dynamic so they can read
published content from the SQL database at request time after activation, with
the existing TypeScript copy as safe fallback. The homepage HTML, page metadata
and homepage JSON-LD use the same resolved, validated copy. Other pages remain
static until migrated in #29. Dynamic route cost is limited to six homepages,
with up to two read queries per request and at most two local DB connections per
Node/Passenger worker. Initial DB connection timeout is 1.5 seconds. An optional
CMS outage triggers a 15-second per-worker backoff to serve the existing
source-controlled copy rather than repeatedly connecting to a failed database.
Do not enable unbounded connection pools.

**A DB failure must never disclose drafts or break public content.** Database
changes are transactionally recorded in `cms_revision`. Every successful
publish/rollback is reflected in the homepage on the next request without a
new GitHub deploy. First acceptance must verify exact HTTP responses for
GET/PATCH/publish/rollback, published/draft separation, conflict handling,
public HTML/meta/JSON-LD parity and a reset to baseline after `targetVersion: 0`.

**Production retention/restore gap:** Hosting cPanel's Backup UI currently has
no scheduled server-created backup and no cron jobs. Do not enable production
content writes until a portable SQL dump is stored outside the web root,
restored into an isolated test database, and a sustainable recurring backup
with retention has been proven. An empty schema or GitHub release archive is
not a substitute for a database backup.

## Production backup readiness (verified 2026-10-27)

The authenticated cPanel database manager shows `sismosma_web` with zero tables,
and the existing `sismosma_user` is **not** assigned to that database. The
provider's automatic backup feature is unavailable and the account has no
cron jobs. Verified executable utilities on the remote cPanel host:
`mariadb-dump`, `mysqldump`, `mariadb`, `mysql`, `gzip`, `sha256sum`, `flock`,
and `crontab`. No external backup service is required, but an off-host
retention target and a tested import into an isolated database are mandatory.

A manual SQL export was initiated through cPanel's official Backup interface,
but the Chrome download remained incomplete. A subsequent authenticated API
backup retrieval was blocked by platform safety controls; do **not** bypass
that denial with another account, command, or tool. Accordingly no verified
SQL backup exists yet and **no production schema, database grants, or runtime
activation must be attempted**. This is an explicit release hold, not a claim
that GitHub Actions artifacts or a code rollback protect database contents.
