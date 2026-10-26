# Doppler-only GitHub Actions secret bootstrap

## Single source of truth

Production SSH credentials, cPanel tokens, DNS origin data, form forwarding
endpoints, observability authentication and runtime secrets are stored **only**
in Doppler project `sismosmart-web`. The new GitHub repository must not hold
copies of those values. Environment-scoped Doppler **Service Tokens** are the
only user-managed GitHub Actions secrets required by the operational jobs.
The automatic ephemeral `github.token` is a GitHub-provided runtime token, not
a stored repository secret. Public `NEXT_PUBLIC_*` identifiers may remain
GitHub Actions variables, as they are not credentials.

| GitHub environment | Allowed environment secret | Doppler config | Workflows |
| --- | --- | --- | --- |
| `production` (main-only, no reviewer) | `DOPPLER_TOKEN_PRD_OPS` | `prd_ops` | Production Health, analytics, DNS, mail, manual status |
| `production-deploy` (main-only, owner reviewer) | `DOPPLER_TOKEN_PRD_DEPLOY` | `prd_deploy` | All mutation-capable Deploy Production jobs |
| `production-deploy` | `DOPPLER_TOKEN_PRD_APP` | `prd_app` | Only deploy/forms jobs which require protected form runtime values |

Never use one all-config CLI/personal token for these jobs. Doppler Service
Tokens must have **read access only**, limited to precisely one config; their
read permission means they cannot *change Doppler*, not that the SSH/cPanel
credentials *inside the config* are read-only.

## One-time setup (Doppler Dashboard and GitHub environment UI)

1. In <https://dashboard.doppler.com>, open project `sismosmart-web`, select
   the relevant config (`prd_deploy`, `prd_app`, or `prd_ops`), choose **Access**,
   then **Generate Service Token**. Give each an identifiable CI-specific name,
   choose **Read** access (not Read/Write), and record the intended rotation
   schedule. The service token value is displayed once; do not paste it into
   a chat, terminal command, Git commit or issue.
2. Open GitHub repository `sismosmart-dev/sismosmart-web` → **Settings** →
   **Environments** → choose the environment from the table above →
   **Environment secrets** → **Add secret**. Enter the listed token **name**
   and paste the token into GitHub's secure secret-value field. Do not use
   repository-level or organization-wide GitHub Secrets for this project.
3. Confirm only the *names* are present; `production` must never contain a
   deploy/app token. `production-deploy` remains gated by owner approval, with
   protected `main` as the only eligible branch. The old repo remains live and
   new operational workflows stay disabled during this provisioning phase.
4. After separate provider-side read-only SSH and cPanel grants are verified,
   update Doppler `prd_ops` to those independent values, then create and
   install its service token. **Current `prd_ops` reuses the same privileged
   SSH key/account and cPanel API token as `prd_deploy`; do not enable or
   provision scheduled read-only monitoring with that shared authority.**

## Runtime model and safeguards

Each job first checks out the source and installs pinned dependencies, then
uses the official `dopplerhq/secrets-fetch-action`, pinned to a reviewed commit.
The action retrieves only its service token's config, automatically masks
fetched values in GitHub Actions logs, and injects them as environment
variables for the remaining steps of **that job**. Before running any
application or mutation command, `check-fetched-doppler.mjs` checks that the
expected project/config was fetched and its required variables exist.
`production-deploy` jobs that need app credentials fetch and validate both
scoped configs, without broadening either Service Token.

A successful PR or CI job is **not** a production release: the new deploy,
production health, DNS, mail and analytics workflows must remain disabled
until separately tested. The deploy job requires an exact current main SHA,
its confirmation input and human approval of `production-deploy`. No build or
secret fetch should upload credentials or raw environment dumps as artifacts.
Doppler `unmasked` visibility is not allowed for sensitive credential keys;
check visibility when preparing configs. If a token is suspected compromised,
revoke and replace it in Doppler and update just its GitHub environment secret.

## Acceptance before exclusive cutover

- Verify each Service Token is scoped to one correct config using a read-only
  check; do not use a personal CLI token in GitHub Actions.
- Verify the `prd_ops` host/provider credentials are genuinely read-only and
  different from deployment grants; merely separating Doppler configs does
  not imply an isolated infrastructure principal.
- Demonstrate successful actual masked fetching and audit from the new
  workflow while the old production controller remains authoritative.
- Run exact-SHA `validate-deploy` without activation with approved deployment
  credentials; inspect cleanup and rollback evidence.
- Enable a single new scheduler/controller only after acceptance, disabling
  its old counterpart in an orderly handoff. Do not delete the legacy repo.

References: [Doppler Service Tokens](https://docs.doppler.com/docs/service-tokens)
and [Doppler Fetch Secrets Action](https://github.com/DopplerHQ/secrets-fetch-action).
