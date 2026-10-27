# SismoSmart Web

The multilingual public website for **SismoSmart**, a pre-launch seismic monitoring project for homes and small buildings. Built with Next.js, TypeScript and Tailwind CSS, this repository also contains public contact and waitlist APIs, machine-readable resources, and GitHub-based production operations.

**Live website:** [sismosmart.com](https://sismosmart.com) · **Default locale:** [English](https://sismosmart.com/en)

> **Product status and safety:** SismoSmart is under development. It is **not** an emergency response service, an official earthquake early-warning system, or a tool for determining whether a building is safe to occupy. Hardware, detection, notification, connectivity, performance, security, and certification claims are published only to the extent supported by evidence.

## Website and localization

The site supports six locales: **English (`en`), Turkish (`tr`), Spanish (`es`), Indonesian (`id`), Portuguese (`pt`), and Italian (`it`)**.

- `src/lib/content` and `src/lib/page-content` hold localized public copy.
- `src/lib/guides` contains English and Turkish guides.
- Canonical URLs, `hreflang`, sitemaps, structured data, and Markdown alternatives must remain consistent with the published website.
- Turkish is the editorial source language for some content; that does not affect the language of this repository's README.

For editorial standards, see the [content style guide](docs/content-style-guide.md) and [technical claims register](docs/governance/technical-claims-register.md).

## Public discovery and APIs

The website exposes machine-readable resources alongside its HTML pages:

| Resource | Purpose |
| --- | --- |
| [`/llms.txt`](https://sismosmart.com/llms.txt) and [`/llms-full.txt`](https://sismosmart.com/llms-full.txt) | Public, agent-readable site discovery |
| [`/sitemap.xml`](https://sismosmart.com/sitemap.xml) and [`/sitemap.md`](https://sismosmart.com/sitemap.md) | Search and Markdown-based navigation |
| Locale-specific `.md` pages | Markdown alternatives to public page content |
| [`/openapi.json`](https://sismosmart.com/openapi.json) | Contract for the public contact and waitlist APIs |
| [`/AGENTS.md`](https://sismosmart.com/AGENTS.md) | Guidance for agents consuming the public website |

Agent-facing materials must not make stronger product claims than the corresponding human-facing content.

## Getting started

Use the Node.js version pinned in [`.nvmrc`](.nvmrc):

```bash
nvm use
npm ci
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en). The root path, [http://localhost:3000](http://localhost:3000), can be used to test locale redirection.

### Local quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
npm run test:browser
```

For the authorized Doppler-backed CI configuration, run `npm run doppler:ci`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the dependency allowlist, environment requirements, and pull request checks.

**Never commit** real `.env` files, credentials, customer data, private origin details, cookies, generated deployment bundles, or infrastructure exports. [`.env.example`](.env.example) provides an empty configuration-key schema; Doppler is the canonical source for protected configuration.

## Project structure

| Path | Responsibility |
| --- | --- |
| `src/app` | Next.js App Router pages and public route handlers |
| `src/components` | UI and interaction components |
| `src/lib` | Localized content, guides, SEO metadata, structured data, and public contracts |
| `src/app/api/_lib` | Server-only form validation and forwarding |
| `scripts` | Deployment, health, browser-quality, and operations tools |
| `tests` | Content, security, deployment, accessibility/browser, SEO, and repository contracts |
| `.github/workflows` | CI, security checks, production releases, and monitoring |
| `docs` | Current operational runbooks, governance, and historical design records |

Historical files under `docs/superpowers` document past decisions; the current runbooks and live workflow state are authoritative for operations.

## Production deployment and monitoring

Production uses a standalone Next.js application hosted with **cPanel/CloudLinux Passenger**. There is no separate persistent staging deployment target. Pull request checks and merges **do not automatically deploy** to production.

The [`Deploy Production`](.github/workflows/deploy-prod.yml) workflow is manually initiated, pinned to an exact source revision, protected by its GitHub environment, and uses transactional activation with origin/public verification and rollback on failure.

Safe, non-activating checks are available to authorized operators:

```bash
npm run doppler:ops:status
npm run doppler:deploy:validate
BASE_URL=https://sismosmart.com npm run verify:post-deploy
```

The repository also provides scheduled, credential-free **Public Health** checks and weekly **Lighthouse** audits. Deeper production health, DNS, mail, and analytics administrative audits are available as protected **manual** workflows; they are not equivalent to unattended, privileged monitoring.

Operations documentation:

- [CI/CD automation](docs/cicd-automation.md)
- [Production deployment and rollback](docs/operations/production-deployment.md)
- [Production health and monitoring](docs/operations/production-health.md)
- [Repository governance](docs/operations/repository-governance.md)
- [Doppler and GitHub Actions](docs/operations/doppler-github-actions.md)

## Responsible product communication

- Do not present planned or validation-pending capabilities as completed features.
- Do not claim building safety assessments, emergency response, or official early warning.
- Do not publish expired roadmap, pricing, pilot, investment, or certification assumptions as current facts.
- Describe device data handling, research access, and device security as conditional until verified and approved.
- Never expose protected operational evidence or personal/customer information through the public website or repository.

## Contributing, security, and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and [SECURITY.md](SECURITY.md) for vulnerability reporting.

**This repository is not open source.** It is marked `UNLICENSED`; the [LICENSE](LICENSE) file reserves all rights. No permission to reuse, modify, or redistribute its contents is granted without a separate written agreement.
