# Content API: database and release prerequisites

The SismoSmart website currently has six locale-specific TypeScript content sources. Issue #29 tracks progressive, opt-in API-managed edits with no rebuild needed for subsequent publications. **This foundation PR does not enable publishing or change current public rendering.**

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
