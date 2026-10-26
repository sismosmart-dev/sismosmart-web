# Historical engineering archive policy

Historical audits, incident evidence, generated reports, and provider snapshots may be retained outside Git when they have business, legal, security, or incident-response value. They are historical context and must not be used as current operational truth without revalidation against the current code, workflows, provider state, and runbooks.

Private historical reports are intentionally **not imported into the public repository**. This directory contains policy only.

## Retention rules

- Keep current procedures in `docs/operations/` and current claim policy in `docs/governance/`.
- Review privately retained historical evidence annually and remove duplicates or obsolete generated output when no retention requirement remains.
- Never archive credentials, private keys, OAuth tokens, raw form submissions, personal data, unredacted access logs, origin addresses, provider resource identifiers, or secret endpoint values in Git.
- A future public historical record must be independently sanitized, dated, and reviewed before it is added here.
