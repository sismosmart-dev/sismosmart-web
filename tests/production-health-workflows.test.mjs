import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  productionHealthWorkflowTargets,
  readTargetWorkflowRuns,
} from "../scripts/ops/production-health-workflows.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function successfulResponse(payload) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function deferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

const repository = "example-org/example-repo";
const token = "synthetic-not-a-secret";

const expectedTargets = {
  deploy: "deploy-prod.yml",
  lighthouse: "lighthouse.yml",
  security: "security.yml",
};

const expectedHeaders = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "User-Agent": "SismoSmart-Production-Health/1.0",
  "X-GitHub-Api-Version": "2022-11-28",
};

const expectedUrls = [
  "https://api.github.com/repos/example-org/example-repo/actions/workflows/deploy-prod.yml/runs?status=completed&per_page=100",
  "https://api.github.com/repos/example-org/example-repo/actions/workflows/lighthouse.yml/runs?status=completed&per_page=3",
  "https://api.github.com/repos/example-org/example-repo/actions/workflows/security.yml/runs?status=completed&per_page=3",
];

function restoreEnvironment(name, original) {
  if (original === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = original;
  }
}

test("production health runtime delegates workflow reads to a focused module", () => {
  const runtime = readText("scripts/ops/production-health.mjs");
  const adapter = readText("scripts/ops/production-health-workflows.mjs");
  const aggregation = readText("scripts/ops/production-health-aggregation.mjs");

  assert.match(adapter, /export const productionHealthWorkflowTargets/);
  assert.match(adapter, /export async function readTargetWorkflowRuns/);
  assert.match(
    runtime,
    /import \{ readTargetWorkflowRuns \} from "\.\/production-health-workflows\.mjs"/,
  );
  assert.match(
    runtime,
    /export \{ readTargetWorkflowRuns \} from "\.\/production-health-workflows\.mjs"/,
  );
  assert.match(
    aggregation,
    /import \{ productionHealthWorkflowTargets \} from "\.\/production-health-workflows\.mjs"/,
  );
  assert.match(aggregation, /Object\.keys\(productionHealthWorkflowTargets\)/);
  assert.doesNotMatch(runtime, /productionHealthWorkflowTargets/);
  assert.doesNotMatch(runtime, /const WORKFLOW_TARGETS/);
  assert.doesNotMatch(runtime, /export async function readTargetWorkflowRuns/);
});

test("workflow target catalog preserves keys, filenames, and insertion order", () => {
  assert.deepEqual(productionHealthWorkflowTargets, expectedTargets);
  assert.deepEqual(Object.keys(productionHealthWorkflowTargets), [
    "deploy",
    "lighthouse",
    "security",
  ]);
});


test("deploy workflow publishes an operation-specific run name contract", () => {
  const workflow = readText(".github/workflows/deploy-prod.yml");

  assert.match(
    workflow,
    /^run-name:\s*Deploy Production \/ \$\{\{ inputs\.operation \}\}$/m,
  );
  assert.match(
    readText("scripts/ops/production-health-workflows.mjs"),
    /productionHealthWorkflowRunNames[\s\S]*deploy:\s*"Deploy Production \/ deploy"/,
  );
});

test("deploy workflow reads keep only the latest three tagged mutation deploy runs", async () => {
  const result = await readTargetWorkflowRuns({
    repository,
    token,
    fetchImpl: async (url) => {
      if (!url.includes("/deploy-prod.yml/")) {
        return successfulResponse({ workflow_runs: [] });
      }

      return successfulResponse({
        workflow_runs: [
          {
            conclusion: "failure",
            created_at: "2026-10-01T01:10:00Z",
            display_title: "Deploy Production / status",
          },
          {
            conclusion: "success",
            created_at: "2026-10-01T01:09:00Z",
            display_title: "Deploy Production / deploy",
          },
          {
            conclusion: "failure",
            created_at: "2026-10-01T01:08:00Z",
            display_title: "Deploy Production / validate-deploy",
          },
          {
            conclusion: "failure",
            created_at: "2026-10-01T01:07:00Z",
            display_title: "Deploy Production / deploy",
          },
          {
            conclusion: "failure",
            created_at: "2026-10-01T01:06:00Z",
            display_title: "Deploy Production",
          },
          {
            conclusion: "success",
            created_at: "2026-10-01T01:05:00Z",
            display_title: "Deploy Production / reconcile",
          },
          {
            conclusion: "success",
            created_at: "2026-10-01T01:04:00Z",
            display_title: "Deploy Production / deploy",
          },
          {
            conclusion: "failure",
            created_at: "2026-10-01T01:03:00Z",
            display_title: "Deploy Production / deploy",
          },
        ],
      });
    },
  });

  assert.deepEqual(result.deploy, [
    { conclusion: "success", createdAt: "2026-10-01T01:09:00Z" },
    { conclusion: "failure", createdAt: "2026-10-01T01:07:00Z" },
    { conclusion: "success", createdAt: "2026-10-01T01:04:00Z" },
  ]);
});

test("workflow reads preserve URLs, headers, timeout signals, and safe projection", async () => {
  const calls = [];
  const result = await readTargetWorkflowRuns({
    repository,
    token,
    fetchImpl: async (...args) => {
      calls.push(args);
      const key = calls.length === 1 ? "deploy" : calls.length === 2 ? "lighthouse" : "security";
      return successfulResponse({
        workflow_runs: [
          {
            conclusion: `${key}-success`,
            created_at: `2026-07-23T15:00:0${calls.length}Z`,
            ...(key === "deploy"
              ? { display_title: "Deploy Production / deploy" }
              : {}),
            id: calls.length,
            html_url: "https://example.test/not-retained",
          },
        ],
      });
    },
  });

  assert.deepEqual(
    calls.map(([url]) => url),
    expectedUrls,
  );
  for (const [, options] of calls) {
    assert.deepEqual(options.headers, expectedHeaders);
    assert.ok(options.signal instanceof AbortSignal);
  }
  assert.match(
    readText("scripts/ops/production-health-workflows.mjs"),
    /AbortSignal\.timeout\(10_000\)/,
  );
  assert.deepEqual(result, {
    deploy: [
      { conclusion: "deploy-success", createdAt: "2026-07-23T15:00:01Z" },
    ],
    lighthouse: [
      {
        conclusion: "lighthouse-success",
        createdAt: "2026-07-23T15:00:02Z",
      },
    ],
    security: [
      {
        conclusion: "security-success",
        createdAt: "2026-07-23T15:00:03Z",
      },
    ],
  });
});

test("missing workflow repository or token fails closed without requests", async () => {
  for (const options of [
    { repository: "", token },
    { repository, token: "" },
  ]) {
    let fetchCount = 0;
    await assert.rejects(
      readTargetWorkflowRuns({
        ...options,
        fetchImpl: async () => {
          fetchCount += 1;
          return successfulResponse({ workflow_runs: [] });
        },
      }),
      /GITHUB_ACTIONS_READ_UNAVAILABLE/,
    );
    assert.equal(fetchCount, 0);
  }
});

test(
  "workflow reads preserve environment fallback and explicit option precedence",
  { concurrency: false },
  async () => {
    const originalRepository = process.env.GITHUB_REPOSITORY;
    const originalToken = process.env.GITHUB_TOKEN;
    process.env.GITHUB_REPOSITORY = "environment-org/environment-repo";
    process.env.GITHUB_TOKEN = "environment-synthetic-value";

    try {
      const environmentCalls = [];
      await readTargetWorkflowRuns({
        fetchImpl: async (...args) => {
          environmentCalls.push(args);
          return successfulResponse({ workflow_runs: [] });
        },
      });
      assert.match(
        environmentCalls[0][0],
        /repos\/environment-org\/environment-repo\/actions/,
      );
      assert.equal(
        environmentCalls[0][1].headers.Authorization,
        "Bearer environment-synthetic-value",
      );

      const explicitCalls = [];
      await readTargetWorkflowRuns({
        repository,
        token,
        fetchImpl: async (...args) => {
          explicitCalls.push(args);
          return successfulResponse({ workflow_runs: [] });
        },
      });
      assert.equal(explicitCalls[0][0], expectedUrls[0]);
      assert.equal(explicitCalls[0][1].headers.Authorization, `Bearer ${token}`);
    } finally {
      restoreEnvironment("GITHUB_REPOSITORY", originalRepository);
      restoreEnvironment("GITHUB_TOKEN", originalToken);
    }
  },
);

test("workflow reads start all targets before any response settles", async () => {
  const calls = [];
  const responses = expectedUrls.map(() => deferred());

  const resultPromise = readTargetWorkflowRuns({
    repository,
    token,
    fetchImpl: (url) => {
      calls.push(url);
      return responses[calls.length - 1].promise;
    },
  });

  await Promise.resolve();
  assert.deepEqual(calls, expectedUrls);

  responses[0].resolve(
    successfulResponse({
      workflow_runs: [
        {
          conclusion: "success",
          created_at: "2026-07-23T15:10:00Z",
          display_title: "Deploy Production / deploy",
        },
      ],
    }),
  );
  responses[1].resolve(successfulResponse({ workflow_runs: null }));
  responses[2].resolve(
    successfulResponse({
      workflow_runs: [
        { conclusion: "failure", created_at: "2026-07-23T15:12:00Z" },
      ],
    }),
  );

  assert.deepEqual(await resultPromise, {
    deploy: [
      { conclusion: "success", createdAt: "2026-07-23T15:10:00Z" },
    ],
    lighthouse: [],
    security: [
      { conclusion: "failure", createdAt: "2026-07-23T15:12:00Z" },
    ],
  });
});

test("workflow reads preserve exact target-specific HTTP errors", async () => {
  const cases = [
    ["deploy-prod.yml", 403, /GITHUB_WORKFLOW_DEPLOY_403/],
    ["lighthouse.yml", 429, /GITHUB_WORKFLOW_LIGHTHOUSE_429/],
    ["security.yml", 503, /GITHUB_WORKFLOW_SECURITY_503/],
  ];

  for (const [failingWorkflow, status, expectedError] of cases) {
    let jsonCalled = false;
    await assert.rejects(
      readTargetWorkflowRuns({
        repository,
        token,
        fetchImpl: async (url) =>
          url.includes(`/workflows/${failingWorkflow}/`)
            ? {
                ok: false,
                status,
                json: async () => {
                  jsonCalled = true;
                  return {};
                },
              }
            : successfulResponse({ workflow_runs: [] }),
      }),
      expectedError,
    );
    assert.equal(jsonCalled, false);
  }
});
