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

## SQL backup command (prepared; live backup not yet accepted)

A repeatable, non-destructive backup tool is now available:

```bash
CMS_BACKUP_USER='<dedicated read-only DB account>' \
CMS_BACKUP_PASSWORD='<provided securely via protected runtime environment>' \
CMS_BACKUP_DB='sismosma_web' \
CMS_BACKUP_HOST='localhost' \
CMS_BACKUP_DIR='/home/<cpanel-account>/.sismosmart-cms/backups' \
npm run ops:cms-db-backup
```

Do not paste real credentials into shell history, issues or code. Prefer running
from a protected secret-injecting environment; the placeholders above illustrate
the required names, **not** an instruction to paste passwords interactively.

The tool requires the native `mariadb-dump` binary and a separate account with
SELECT/SHOW VIEW/TRIGGER rights as needed for the CMS schema. It runs a
single-transaction dump of the local database, writes a `.sql.gz` archive
atomically in a private directory outside the web root, and emits a matching
SHA-256 sidecar. Use `npm run ops:cms-db-verify -- /absolute/path/to/backup.sql.gz`
to recheck the matching checksum and the complete compressed SQL stream without
importing any data. This does not replace an independent restore test.
If dump/gzip exits unsuccessfully, incomplete output is
removed. SQL password is passed via child-process environment, not the argument
list or logs. Verification checks checksum and complete gzip decompression.

**Local storage is not sufficient for disaster recovery.** The archive must
also be transferred to an access-controlled **off-host** location, an isolated
MariaDB restore performed with an *independent* test schema, and retention
scheduled and observed. The tool does not perform restore or automatically
delete/rotate backups, to prevent any accidental production data loss. Do not
run a restore against `sismosma_web` on the live hosting account. Once off-host
retention and restore are proven, a daily cPanel cron schedule can be added
without an additional paid service; do not activate it before checking output,
server disk limits and privacy of the retention target.

### Isolated test proof, not a live hosting backup

On 2026-10-27, the backup tool was exercised against a temporary MariaDB 11.8
container using the actual two-table CMS migration and sample rows. A portable
SQL archive was created, SHA-256 and complete gzip stream verified, and the
archive imported successfully into a **separate** empty test database. The
restored data matched one published content row and two revision records,
including its revision/version. The temporary Docker container and test
files were cleaned up. This proves the **toolchain** on a disposable schema,
not that the live cPanel database has been backed up or that retention exists.

### Safe automated restore acceptance (independent database only)

The `npm run ops:cms-db-restore-test -- /absolute/path/to/backup.sql.gz`
command verifies the checksum/gzip and attempts an import **only to an empty,
pre-created disposable database** named `sismosmart_restore_*`, using a separate
non-root SQL user. The SQL user must have permissions restricted to that
**test database only**. The process has no database creation or deletion logic.

For the isolated acceptance runner, supply `CMS_RESTORE_ISOLATED=true`,
`CMS_RESTORE_HOST=127.0.0.1`, `CMS_RESTORE_PORT`, `CMS_RESTORE_DB`,
`CMS_RESTORE_USER`, and `CMS_RESTORE_PASSWORD` via an authenticated,
secret-injecting environment. `CMS_RESTORE_ISOLATED` is an explicit operator
assertion, **not evidence of isolation by itself**; isolate the database server
or container and its credentials before invoking the tool. The target name must
begin `sismosmart_restore_`, any existing tables cause refusal, and the
production name `sismosma_web` is rejected. The command does not expose SQL
content, accept administrator/root usernames, or drop/overwrite existing data.
It checks restored `cms_content` and `cms_revision` row counts after import.

The code was exercised on a temporary MariaDB 11.8 container: export from
`sismosma_web` *inside the test container only*, successful isolated restore
into `sismosmart_restore_test1` with a separate restricted user; one content
row and two revision records were confirmed. The container and files were
removed. This is evidence for the restore **mechanism**, not yet a completed
backup or recovery test of the actual production cPanel database.

For production acceptance, first export the *actual* live database using the
approved secure method, verify SHA-256 and gzip, keep a private off-host copy,
then restore that copy into a separately provisioned test database and observe
successful recurring retention. Only then consider creating CMS tables,
scoped runtime grants and enabling `CMS_DB_ENABLED`/`CMS_WRITE_ENABLED` under
the existing GitHub environment review.

## Static-subpage introduction and SEO coverage (staged)

In addition to `home.hero` / `home.meta`, the first content expansion registers a
`page.<pageKey>.intro` document for each of the **13 static subpage keys**:
`product`, `technology`, `howItWorks`, `pilotProgram`, `investors`, `faq`,
`about`, `contact`, `privacy`, `terms`, `security`, `press`, and `glossary`.
Each key supports the same six supported locales. The validated JSON document
has the exact shape:

```json
{
  "eyebrow": "A short label",
  "title": "A heading for this page",
  "description": "An accurate introduction",
  "meta": {
    "title": "Search listing title | SismoSmart",
    "description": "The search listing description"
  }
}
```

The same per-request published document is used for displayed page introductions,
search metadata/social previews and the page's JSON-LD descriptions; all
other page-specific sections (e.g., FAQs, specifications, legal text and
articles), and the shared navigation remain source-controlled and **are not
CMS-editable yet**. Missing/invalid published overrides or an unavailable CMS
fall back to existing TypeScript content and do not expose drafts. Pages are
rendered on demand after this expansion to pick up published changes without
releasing code; this must be monitored for latency on the shared 2 GB hosting
plan. `CMS_DB_ENABLED` and `CMS_WRITE_ENABLED` remain off in production until
backup/permissions/owner-reviewed release gates are fully satisfied.

As with the home page, changes affecting legal, earthquake-safety or product
performance claims require evidence and manual editorial review; a valid JSON
schema is not, by itself, proof that a claim is acceptable. URL fields and
arbitrary HTML are not editable through this intro document.

### Markdown and AI-facing content consistency

Each localized homepage and static subpage also exposes a canonical Markdown
alternative (`/<locale>.md` or `/<locale>/<page>.md`). Once the CMS is activated,
the localized Markdown handler reads the **same published content override** as
the corresponding HTML page, including SEO/frontmatter title and description,
visible page introduction and homepage hero text. With CMS disabled, Markdown
uses the original TypeScript content without opening SQL connections. To avoid
stale machine-readable content following an authorized CMS publication,
localized Markdown responses are rendered dynamically and use
`Cache-Control: public, max-age=0, must-revalidate`. The separate Markdown
navigation index retains stable source-controlled labels and links; it does
not expose unpublished drafts or claim to be an always-live CMS listing.

Before activation, test a real approved publication in both HTML and the
matching Markdown alternative, including canonical headers, SEO metadata and
JSON-LD. The route still requires the usual backup/grant/production release
acceptance; passing a static no-database Markdown test alone is insufficient.

## Editorial section and guide body documents (staged)

The second expansion adds `page.<pageKey>.sections` to nine plain-text
card/FAQ/policy pages: `faq`, `privacy`, `terms`, `security`, `glossary`,
`technology`, `pilotProgram`, `investors`, and `press`. The document is
`{"sections":[{"title":"...","description":"..."}]}`; section content is
rendered consistently in page HTML, FAQ JSON-LD and Markdown alternatives.
Each of the nine keys is available in all six site languages (54 separate
localized documents). Dynamic display uses the existing TypeScript fallback
and never reads an unpublished draft. Product specifications, charts, contact
forms, buttons and links are intentionally unaffected.

Six guide translation keys each have a `guide.<translationKey>.body` document
for English (`en`) and Turkish (`tr`): 12 guide-body records. The editable
schema contains `title`, `description`, `eyebrow`, `h1`, `summary`,
`keyTakeaways`, `sections` (heading/paragraphs/optional bullets),
`limitations` and `sismosmartFit`. Canonical slug, locale, source references,
related guides, publication timestamps, safety notice and CTA target remain
controlled by the repository. The same validated published guide body feeds
HTML, metadata, article JSON-LD, and the Markdown guide alternative. The
latter uses on-demand rendering and `Cache-Control: public, max-age=0,
must-revalidate`; public site visitors will never see private revisions.

Authoring requests for guide documents are bounded to 64 KiB and editorial
section documents to 128 KiB; small intro/hero documents retain the 8 KiB
limit. The draft/publish/rollback API remains feature-gated. The rollback
payload correctly permits `targetVersion: 0` to remove the published override
and restore the original TypeScript content.

**Review before accepting edited guide claims or legal/security copy:** strict
JSON shape, length and markup checks cannot verify scientific or legal facts.
Authorizing users must apply the technical claims register and editorial
review. Reference lists and source links cannot be silently changed through
this API. Guide hub summaries/navigation, shared footer/nav, detailed product
specifications, home page sections, and about/contact page bodies remain in
code until their own verified migrations. Existing source-controlled guide
`updatedAt` dates are not automatically advanced by this first CMS integration;
publication-time metadata handling needs explicit acceptance before live edits.

All these changes are dormant until real production cPanel SQL backup,
off-host retention, isolated restore, scoped grants and a protected production
release have been verified. No database administration or provider support
requests should be launched implicitly as part of this code change.

### Product, how-it-works and about page details

A further three registered keys cover the remaining explanatory sections of
`product`, `howItWorks` and `about` in all six locales (18 additional records):

- `page.product.details`: device/meter description, image alt text, specifications,
  use cases, comparison headings and rows, and CTA display label. The actual
  CTA destination stays in source control.
- `page.howItWorks.details`: process steps, signal explanations, and connectivity
  cards.
- `page.about.details`: story, editorial principles, timeline and public team
  descriptions.

Only plain text and bounded, strictly typed lists are accepted. Embedded HTML,
custom URLs, unexpected fields and external actions are rejected. The current
source copy remains the safe fallback and all HTML/Markdown/SEO/structured
content flows through the existing resolved page copy. These fields must be
editorially reviewed before publishing device or structural safety claims.
The long documents use the already-bounded 128 KiB admin request ceiling.

Outstanding content after these extensions includes homepage content blocks,
shared navigation and footer strings, contact form/channels, and guide hub
listing presentation. Live SQL backup and release acceptance are still required
before any editor API can be enabled in production.
