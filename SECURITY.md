# Security Policy

SismoSmart Web is a public production website repository. Please report suspected vulnerabilities without posting exploit details, credentials, customer data, or private infrastructure information in public issues.

## Supported Scope

Security review covers the current `main` branch and the production deployment generated from it.

In scope:

- Authentication, deployment, CI/CD, and supply-chain controls in this repository.
- Public website routes, API form handlers, security headers, consent behavior, and telemetry configuration.
- Exposed secrets or sensitive data in source, workflow output, deployment artifacts, or public assets.

Out of scope:

- Denial-of-service testing against production infrastructure.
- Social engineering, phishing, spam, or physical attacks.
- Findings that require access to private credentials or systems you do not own.

## Reporting

Use GitHub's private vulnerability reporting or security advisory flow when it is available for this repository.

If a private report flow is not available, open a minimal public issue titled `Security disclosure request` and include only:

- The affected area.
- Your GitHub username or preferred public contact handle.
- A short note that details should be exchanged privately.

Do not include proof-of-concept payloads, secrets, tokens, customer data, server names, IP addresses, or exploit instructions in a public issue.

## Response Process

Maintainers should:

1. Acknowledge a valid report within 3 business days.
2. Reproduce and classify severity before requesting detailed remediation work.
3. Keep remediation branches private when disclosure risk requires it.
4. Rotate any exposed credentials before publishing a fix.
5. Publish a GitHub Security Advisory when user action is required.

## Validation Baseline

Security-sensitive changes should run:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
gitleaks detect --source . --redact --verbose
```
