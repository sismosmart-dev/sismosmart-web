# Production deployment runbook

## Safety model

Production deployment is manual-only through the `Deploy Production` workflow. A merge to `main` must not deploy the site automatically.

Use the workflow operations in this order:

1. `validate-deploy`: build, package, upload, checksum, extract, validate and run an isolated localhost preflight. It does not mutate Passenger, `current`, `.htaccess` or `public_html`.
2. `deploy`: execute the full transactional deployment after validation succeeds.
3. `reconcile`: align `current` with the already active Passenger release when an operator has independently confirmed the desired release.
4. `permissions`: audit and normalize retained release and `public_html` modes.
5. `forms`: rewrite canonical runtime form variables and restart the active Passenger application.

Never use `DEPLOY_FAIL_AT` against production. Failure injection is for automated transaction tests and disposable/non-production environments only.

## Transaction phases

Every deployment logs a release ID and explicit state transitions:

- `prepare`: build the standalone app, create one tar.gz artifact, calculate SHA-256, upload both files, verify checksum, extract into `<release>.partial`, normalize permissions and validate required files/runtime values.
- `snapshot`: record the previous `current` target and Passenger registration, back up `.htaccess` and archive `public_html`. A recovery JSON file is written with mode `0600`.
- `preflight`: start the new release on an unused localhost port using the known Passenger Node.js runtime. Verify `/en`, `/api/contact` and `/api/waitlist` without changing public traffic.
- `activate`: replace the Passenger registration and start the new release. From this point, any error triggers automatic rollback.
- `verify-origin`: query the origin directly through loopback/SNI and verify the form runtime.
- `commit`: move `current`, update managed `.htaccess` rules, synchronize public assets and verify file permissions.
- `verify-public`: verify Cloudflare/public routes and assert that the symlink, Passenger app root, `.htaccess`, process working directory and `BUILD_ID` agree.

A successfully prepared release contains `.release-ready`. A failed activated release has that marker removed and receives `.release-failed`.

## Required invariants

A successful deployment must leave all of the following on the same release directory:

- `/home/<cpanel-user>/apps/sismosmart-web/current`
- CloudLinux/Passenger `app_root`
- `PassengerAppRoot` in `public_html/.htaccess`
- the working directory of the running `next-server` process
- `.next/BUILD_ID`

Release directories are `0755`, regular files are `0644`, and `.env*` files are `0600`. No runtime environment file may exist under `public_html`.

## Doppler entry points

Production commands must select the Doppler project and least-privilege config
explicitly. Use the repository wrappers rather than directory-scoped CLI state:

```bash
npm run doppler:ops:status
npm run doppler:deploy:validate
npm run doppler:runtime-env
```

The deployment validation command must complete without activation. The runtime
command is dry-run by default. An approved apply operation must preserve mode
`0600` and must never place the runtime file under the public web root.

## Normal validation

Run `npm run doppler:deploy:validate` first. Confirm that the log includes:

```text
DEPLOY_STATE phase=prepare
DEPLOY_PREPARED buildId=...
DEPLOY_STATE phase=snapshot
DEPLOY_STATE phase=preflight
DEPLOY_PREFLIGHT status=healthy
Deployment validation completed without activation.
```

The temporary release, artifact and recovery backups must be removed by cleanup. Passenger, `current`, `.htaccess`, `public_html` and the running process must remain unchanged.

## Normal deployment

After validation succeeds, run `deploy`. Confirm that the log reaches:

```text
DEPLOY_STATE phase=activate
DEPLOY_ORIGIN status=healthy
DEPLOY_COMMITTED current=...
DEPLOY_VERIFIED release=... buildId=... public=healthy
DEPLOY_STATE phase=complete
```

Then run or inspect:

```bash
npm run deploy:status
readlink -f /home/<cpanel-user>/apps/sismosmart-web/current
cloudlinux-selector get --json --interpreter nodejs --user <cpanel-user>
grep -E 'Passenger(AppRoot|Nodejs)' /home/<cpanel-user>/public_html/.htaccess
```

Do not paste tokens, private keys, endpoint URLs or `.env.production` contents into issues or logs.

## Automatic rollback

If activation or any later phase fails, the transaction attempts to:

1. remove the failed Passenger registration;
2. restore the previous `current` target;
3. recreate the previous Passenger registration and Node.js version;
4. restore the archived `public_html` and `.htaccess`;
5. restart the previous workers;
6. verify origin, public traffic and final release consistency.

A successful rollback logs:

```text
DEPLOY_STATE phase=rollback
DEPLOY_ROLLBACK restored=...
DEPLOY_STATE phase=rollback-complete
```

The failed release remains for diagnosis with `.release-failed`, but it is not deployable.

## Manual recovery

Manual recovery is required only when the log contains:

```text
DEPLOY_RECOVERY_REQUIRED state=/home/<cpanel-user>/apps/sismosmart-web/tmp/deploy-<release-id>.json
```

Preserve that JSON and its referenced backups. Do not start a second deployment.

1. Read only the non-secret recovery metadata:

   ```bash
   cat /home/<cpanel-user>/apps/sismosmart-web/tmp/deploy-<release-id>.json
   ```

2. Compare the current state:

   ```bash
   readlink -f /home/<cpanel-user>/apps/sismosmart-web/current
   cloudlinux-selector get --json --interpreter nodejs --user <cpanel-user>
   grep -E 'Passenger(AppRoot|Nodejs)' /home/<cpanel-user>/public_html/.htaccess
   ps -u <cpanel-user> -o pid=,comm=
   ```

3. Destroy only the failed release registration shown in the current selector output.
4. Point `current` to `previousRelease` from the recovery JSON.
5. Recreate the previous app with its recorded `appRoot`, URI and Node.js version.
6. Remove the current top-level `public_html` entries and extract the recorded `publicBackupPath` into `public_html`.
7. Restore the recorded `.htaccess` backup when `htaccessExisted` is true; otherwise remove the newly created `.htaccess`.
8. Normalize `public_html` permissions and restart the previous Passenger app.
9. Verify `/en`, the form APIs, symlink, Passenger root, `.htaccess`, process cwd and `BUILD_ID` before removing recovery files.

When any path or application identity differs from the recovery JSON, stop and investigate instead of guessing.

## Release metadata and retention

Every prepared release contains `.release.json` with the release ID, commit SHA, build ID, SHA-256 checksum, artifact/checksum byte counts, transfer duration, timestamps, total deployment duration, and lifecycle status. A prepared release has `.release-prepared`; only a fully verified successful release receives `.release-ready`. Failed releases receive `.release-failed` and are excluded from manual rollback selection.

`RELEASE_RETENTION_COUNT` defaults to `6` and cannot be lower than six. This preserves the active release plus at least five known-good predecessors when `current` and Passenger point to the same release. Distinct `current` and Passenger roots are both protected. Unknown directories are never deleted automatically and require manual review.

A successful transactional deployment applies retention after public verification. It logs transferred bytes, deployment duration, release counts, and release-root disk usage before and after cleanup.

To inspect retention without changing production, dispatch `Deploy Production` with operation `retention` and leave `apply_retention=false`, or run:

```bash
npm run deploy:releases
```

After reviewing the exact keep/delete table, apply it with `apply_retention=true` or:

```bash
npm run deploy:releases -- --apply
```

The planner always protects the resolved `current` target and the active Passenger app root. Failed, partial, and prepared releases are removed; expired known-good releases are removed only after the configured safety floor is preserved.

## Production monitoring

The scheduled read-only audit, alert thresholds, fault-domain triage, privacy boundary, and hosting escalation procedure are documented in [`production-health.md`](./production-health.md). A health failure is diagnostic evidence; it does not authorize an automatic deployment, reconciliation, restart, or retention change.
