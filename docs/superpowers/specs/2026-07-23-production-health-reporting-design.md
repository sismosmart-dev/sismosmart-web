# Production Health Reporting Modularization Design

## Goal

Extract the output and presentation responsibilities from `scripts/ops/production-health.mjs` without changing probes, remote inspection, cPanel reads, workflow reads, classification, exit codes, report schema, privacy sanitization, or artifact behavior.

This is the second small delivery for issue #14. The parent issue remains open for the remaining production-health orchestration, deployment, browser-runner, and content-source decomposition work.

## Current problem

`production-health.mjs` is approximately 919 lines and currently combines:

- public and origin HTTPS measurement;
- DNS resolution;
- remote Passenger and release inspection;
- cPanel quota/resource collection;
- GitHub workflow history collection;
- health report orchestration and classification;
- safe console formatting;
- Markdown summary generation;
- GitHub workflow-command escaping;
- private artifact creation and permissions.

The final reporting section is pure or filesystem-bound and has a clear privacy boundary, but it is embedded in the runtime collector. This makes report-format changes require reviewing unrelated network and production inspection code.

## Approaches considered

### Extract only Markdown formatting

This would create a small helper but leave safe logging, warning escaping, and artifact persistence distributed across the orchestrator. The privacy/output boundary would remain unclear.

### Introduce a generic reporting framework

A reusable reporter abstraction would be more flexible, but no second consumer currently needs it. It would add indirection and risk to a behavior-preserving refactor.

### Extract one production-health report module

Create `scripts/ops/production-health-report.mjs` to own safe log formatting, Markdown formatting, workflow-command escaping, and report persistence. Keep the existing runtime module as the compatibility entry point and re-export `formatSafeLogSummary`. This is the selected approach.

## Architecture

### `scripts/ops/production-health-report.mjs`

The new module owns:

- private failure-probe normalization;
- private failed-route summarization;
- `formatSafeLogSummary(report)`;
- `formatProductionHealthMarkdown(report)`;
- `escapeWorkflowCommandValue(value)`;
- `writeProductionHealthReport(report, options?)`.

`writeProductionHealthReport` defaults to the same production dependencies and environment as today. Optional dependency injection is limited to tests:

```js
export async function writeProductionHealthReport(
  report,
  {
    env = process.env,
    fsImpl = fs,
    logger = console.log,
    resolvePath = path.resolve,
  } = {},
)
```

The default call path remains behaviorally identical.

### `scripts/ops/production-health.mjs`

The runtime module continues to own all probes, orchestration, report classification, CLI configuration, and exit-code behavior. It imports `writeProductionHealthReport`, re-exports `formatSafeLogSummary` from the new module for compatibility, and calls the writer from `main()`.

## Behavior-preservation rules

- Keep the report JSON schema and all values unchanged.
- Keep the default output path `.artifacts/production-health.json` and `PRODUCTION_HEALTH_OUTPUT` override unchanged.
- Keep report file and directory behavior unchanged, including mode `0600` on the final file.
- Keep `GITHUB_STEP_SUMMARY` append behavior unchanged.
- Keep warning command text and percent/CR/LF escaping unchanged.
- Keep the three console lines and their order unchanged.
- Keep safe log sanitization and the `PRODUCTION_HEALTH_SAFE` prefix unchanged.
- Keep `formatSafeLogSummary` import compatibility from `production-health.mjs`.
- Do not change probing, thresholds, classifications, warnings, or CLI failure handling.

## Testing strategy

Add `tests/production-health-report.test.mjs` to verify:

- safe summaries retain actionable status and remove sensitive paths/addresses;
- Markdown output includes classification, blocking state, subsystem status, and warnings;
- workflow command escaping handles `%`, carriage return, and newline;
- report writing creates JSON with a trailing newline, mode `0600`, appends the Markdown summary, emits escaped warnings, and preserves console log order;
- the original production-health module re-exports `formatSafeLogSummary` and delegates writing to the new module;
- the original module no longer owns filesystem report-writing code.

The existing `production-health.test.mjs`, repository contract, complete suite, build, browser checks, and security scans remain required.

## Public repository and production safety

The extraction does not add credentials, endpoints, origin data, provider identifiers, internal paths, or production mutations. Test fixtures use synthetic values and temporary directories only. The safe-log privacy boundary remains enforced by `sanitizeReport`.

## Pull-request boundary

This pull request contains only the reporting/output extraction and its tests/documentation. Parent issue #14 remains open for the remaining slices. Before integration, all bot, agent, security, dependency, inline-review, submitted-review, check-annotation, and workflow feedback must be inspected.

## Non-goals

- No probe or network behavior change.
- No remote script or SSH behavior change.
- No cPanel or GitHub API behavior change.
- No report schema or threshold change.
- No deployment or production mutation.
- No generic logging framework.
