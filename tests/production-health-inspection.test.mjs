import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildRemoteInspectionScript,
  inspectRemoteProduction,
  parseRemoteInspection,
} from "../scripts/ops/production-health-inspection.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

const config = {
  domain: "example.test",
  remoteAppDomain: "example.test",
  remoteAppRoot: "apps/site/current",
  remoteAppUri: "/",
  remoteHome: "/home/example",
  remotePublicRoot: "public_html",
  remoteReleasesRoot: "apps/site/releases",
  sshUser: "example",
};

test("production health runtime delegates SSH inspection to a focused module", () => {
  const runtime = readText("scripts/ops/production-health.mjs");
  const inspection = readText("scripts/ops/production-health-inspection.mjs");

  assert.match(inspection, /export function parseRemoteInspection/);
  assert.match(inspection, /export function buildRemoteInspectionScript/);
  assert.match(inspection, /export async function inspectRemoteProduction/);
  assert.match(runtime, /from "\.\/production-health-inspection\.mjs"/);
  assert.match(
    runtime,
    /export \{[\s\S]*buildRemoteInspectionScript,[\s\S]*inspectRemoteProduction,[\s\S]*parseRemoteInspection,[\s\S]*\} from "\.\/production-health-inspection\.mjs"/,
  );
  assert.doesNotMatch(runtime, /\btoRemoteAbsolutePath\b/);
  assert.doesNotMatch(runtime, /\bgetApplications\b/);
  assert.doesNotMatch(runtime, /\brunRemoteCommand\b/);
  assert.doesNotMatch(runtime, /export function parseRemoteInspection/);
  assert.doesNotMatch(runtime, /export function buildRemoteInspectionScript/);
  assert.doesNotMatch(runtime, /export async function inspectRemoteProduction/);
});

test("inspection parser preserves defaults and known record conversions", () => {
  const passenger = "/releases/active";
  assert.deepEqual(parseRemoteInspection("", passenger), {
    buildId: "",
    current: "",
    filesystemUsagePercent: null,
    formLogAvailable: false,
    formRecords: [],
    htaccess: "",
    passenger,
    processCwds: [],
    releaseBytes: null,
    releaseCount: null,
  });

  const result = parseRemoteInspection(
    [
      "",
      "state\tcurrent\t/releases/current",
      "state\thtaccess\t/releases/active",
      "state\tbuildId\tbuild-1",
      "state\tprocessCwd\t/releases/one",
      "unknown\tignored\tvalue",
      "metric\tfilesystemUsagePercent\t81",
      "metric\treleaseBytes\t123456",
      "metric\treleaseCount\t7",
      "formLog\tavailable\t1",
      "form\tcontact\t200",
      "state\tprocessCwd\t/releases/two",
      "form\twaitlist\t503",
    ].join("\n"),
    passenger,
  );

  assert.deepEqual(result, {
    buildId: "build-1",
    current: "/releases/current",
    filesystemUsagePercent: 81,
    formLogAvailable: true,
    formRecords: [
      { route: "contact", status: 200 },
      { route: "waitlist", status: 503 },
    ],
    htaccess: "/releases/active",
    passenger,
    processCwds: ["/releases/one", "/releases/two"],
    releaseBytes: 123456,
    releaseCount: 7,
  });
});

test("inspection script preserves quoting and remote evidence commands", () => {
  const script = buildRemoteInspectionScript({
    config: { ...config, domain: "example'quoted.test", sshUser: "user'quoted" },
    htaccessPath: "/home/example/public_html/.htaccess",
    passenger: "/home/example/apps/site/releases/active",
    remoteAppRoot: "/home/example/apps/site/current",
    remoteReleasesRoot: "/home/example/apps/site/releases",
  });

  for (const marker of [
    "set -u",
    "readlink -f",
    ".next/BUILD_ID",
    "next-server",
    "releaseCount",
    "releaseBytes",
    "filesystemUsagePercent",
    "$HOME/access-logs/$domain",
    "${domain}-ssl_log",
    "tail -n 20000",
    "/api/contact",
    "/api/waitlist",
    "formLog\tavailable",
    "form\\t%s\\t%s",
  ]) {
    assert.ok(script.includes(marker), `missing marker: ${marker}`);
  }
  assert.match(script, /domain='example'\\''quoted\.test'/);
  assert.match(script, /ps -u 'user'\\''quoted'/);
  assert.doesNotMatch(script, /domain=example'quoted\.test/);
});

test("remote inspection preserves application selection, path calls, execution, and parsing", async () => {
  const applicationCalls = [];
  const pathCalls = [];
  const commandCalls = [];
  const result = await inspectRemoteProduction({
    config,
    getApplicationsImpl: async (receivedConfig) => {
      applicationCalls.push(receivedConfig);
      return [
        { appRoot: "/wrong/domain", domain: "other.test", uri: "/" },
        { appRoot: "", domain: "example.test", uri: "/" },
        { appRoot: "/releases/selected", domain: "example.test", uri: "/" },
      ];
    },
    runRemoteCommandImpl: async (...args) => {
      commandCalls.push(args);
      return {
        stdout: [
          "state\tcurrent\t/releases/selected",
          "state\tbuildId\tbuild-2",
          "metric\treleaseCount\t6",
        ].join("\n"),
      };
    },
    toRemoteAbsolutePathImpl: (receivedConfig, value) => {
      pathCalls.push([receivedConfig, value]);
      return `/absolute/${value}`;
    },
  });

  assert.deepEqual(applicationCalls, [config]);
  assert.deepEqual(
    pathCalls.map(([, value]) => value),
    [config.remoteAppRoot, config.remoteReleasesRoot, config.remotePublicRoot],
  );
  assert.equal(commandCalls.length, 1);
  assert.equal(commandCalls[0][0], config);
  assert.match(commandCalls[0][1], /\/releases\/selected/);
  assert.match(commandCalls[0][1], /\/absolute\/public_html\/\.htaccess/);
  assert.deepEqual(result, {
    buildId: "build-2",
    current: "/releases/selected",
    filesystemUsagePercent: null,
    formLogAvailable: false,
    formRecords: [],
    htaccess: "",
    passenger: "/releases/selected",
    processCwds: [],
    releaseBytes: null,
    releaseCount: 6,
  });
});

test("remote inspection preserves empty Passenger fallback", async () => {
  let script = "";
  const result = await inspectRemoteProduction({
    config,
    getApplicationsImpl: async () => [],
    runRemoteCommandImpl: async (_config, receivedScript) => {
      script = receivedScript;
      return { stdout: "" };
    },
    toRemoteAbsolutePathImpl: (_config, value) => `/absolute/${value}`,
  });

  assert.match(script, /\/missing\/\.next\/BUILD_ID/);
  assert.equal(result.passenger, "");
});

test("remote inspection propagates external adapter failures", async () => {
  const discoveryError = new Error("discovery failed");
  await assert.rejects(
    inspectRemoteProduction({
      config,
      getApplicationsImpl: async () => {
        throw discoveryError;
      },
    }),
    (error) => error === discoveryError,
  );

  const pathError = new Error("path failed");
  await assert.rejects(
    inspectRemoteProduction({
      config,
      getApplicationsImpl: async () => [],
      toRemoteAbsolutePathImpl: () => {
        throw pathError;
      },
    }),
    (error) => error === pathError,
  );

  const commandError = new Error("command failed");
  await assert.rejects(
    inspectRemoteProduction({
      config,
      getApplicationsImpl: async () => [],
      runRemoteCommandImpl: async () => {
        throw commandError;
      },
      toRemoteAbsolutePathImpl: (_config, value) => `/absolute/${value}`,
    }),
    (error) => error === commandError,
  );
});

test("capacity diagnostics stay disabled unless explicitly requested", () => {
  const script = buildRemoteInspectionScript({
    config,
    htaccessPath: "/home/example/public_html/.htaccess",
    passenger: "/home/example/apps/site/releases/active",
    remoteAppRoot: "/home/example/apps/site/current",
    remoteReleasesRoot: "/home/example/apps/site/releases",
  });

  assert.doesNotMatch(script, /diagnosticCategory/);
  assert.doesNotMatch(script, /diagnostic\thomeBytes/);
});

test("capacity diagnostics expose only aggregate safe categories", () => {
  const script = buildRemoteInspectionScript({
    capacityDiagnostics: true,
    config,
    htaccessPath: "/home/example/public_html/.htaccess",
    passenger: "/home/example/apps/site/releases/active",
    remoteAppRoot: "/home/example/apps/site/current",
    remoteReleasesRoot: "/home/example/apps/site/releases",
  });

  for (const category of ["apps", "public", "logs", "mail", "cache", "localData", "tmp", "backups", "other"]) {
    assert.ok(script.includes(`diagnosticCategory\\t${category}\\t`));
  }
  assert.match(script, /diagnostic\\thomeBytes\\t/);
  assert.match(script, /diagnostic\\tfilesystemTotalBytes\\t/);
  assert.doesNotMatch(script, /diagnosticCategory\\t%s/);
});

test("capacity diagnostic parser keeps only allowlisted aggregate labels", () => {
  const result = parseRemoteInspection(
    [
      "diagnostic\thomeBytes\t1000",
      "diagnostic\tfilesystemTotalBytes\t10000",
      "diagnostic\tfilesystemUsedBytes\t9700",
      "diagnostic\tfilesystemAvailableBytes\t300",
      "diagnosticCategory\tapps\t400",
      "diagnosticCategory\tlogs\t500",
      "diagnosticCategory\tprivate-name\t9000",
      "diagnosticCategory\tother\t100",
    ].join("\n"),
    "/releases/active",
  );

  assert.deepEqual(result.capacityDiagnostics, {
    categories: { apps: 400, logs: 500, other: 100 },
    filesystemAvailableBytes: 300,
    filesystemTotalBytes: 10000,
    filesystemUsedBytes: 9700,
    homeBytes: 1000,
  });
  assert.doesNotMatch(JSON.stringify(result.capacityDiagnostics), /private-name/);
});

test("capacity diagnostics derive basenames without slash-escape-sensitive awk regex", () => {
  const script = buildRemoteInspectionScript({
    capacityDiagnostics: true,
    config,
    htaccessPath: "/home/example/public_html/.htaccess",
    passenger: "/home/example/apps/site/releases/active",
    remoteAppRoot: "/home/example/apps/site/current",
    remoteReleasesRoot: "/home/example/apps/site/releases",
  });

  assert.match(script, /split\(\$2, pathParts, "\/"\)/);
  assert.match(script, /name = pathParts\[pathCount\]/);
  assert.doesNotMatch(script, /sub\(\/\^\.\*\/\//);
});
