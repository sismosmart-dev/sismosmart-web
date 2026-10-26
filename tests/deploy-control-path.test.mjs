import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeCpanelHost,
  normalizeReleaseRetentionCount,
} from "../scripts/deploy/config.mjs";
import { getApplications } from "../scripts/deploy/helpers.mjs";

const baseConfig = {
  cpanelHost: "https://cpanel.example.com:2083",
  cpanelToken: "secret-token",
  domain: "example.com",
  remoteHome: "/home/example",
  sshUser: "example",
};

test("CPANEL_HOST normalization requires a canonical HTTPS origin and port", () => {
  assert.equal(
    normalizeCpanelHost("https://cpanel.example.com:2083/"),
    "https://cpanel.example.com:2083",
  );
  assert.equal(normalizeCpanelHost(undefined), undefined);
  assert.throws(() => normalizeCpanelHost("cpanel.example.com:2083"), /https/);
  assert.throws(() => normalizeCpanelHost("http://cpanel.example.com:2083"), /https/);
  assert.throws(() => normalizeCpanelHost("https://cpanel.example.com"), /explicit port/);
  assert.throws(
    () => normalizeCpanelHost("https://cpanel.example.com:2083/execute"),
    /must not include a path/,
  );
});

test("release retention configuration preserves the six-release safety floor", () => {
  assert.equal(normalizeReleaseRetentionCount(undefined), 6);
  assert.equal(normalizeReleaseRetentionCount("8"), 8);
  assert.throws(() => normalizeReleaseRetentionCount("5"), /greater than or equal to 6/);
  assert.throws(() => normalizeReleaseRetentionCount("6.5"), /integer/);
});

test("application discovery uses normalized cPanel records when API is available", async () => {
  let sshCalled = false;
  const applications = await getApplications(baseConfig, {
    fetchImpl: async () => ({
      ok: true,
      async json() {
        return {
          data: [
            {
              app_root: "apps/example/current",
              base_uri: "/",
              domain: "example.com",
              enabled: "started",
              version: "22.18.0",
            },
          ],
        };
      },
    }),
    nodeSelectorLookup: async () => {
      sshCalled = true;
      return [];
    },
  });

  assert.equal(sshCalled, false);
  assert.equal(applications.length, 1);
  assert.equal(applications[0].source, "cpanel");
  assert.equal(applications[0].appRoot, "/home/example/apps/example/current");
  assert.equal(applications[0].uri, "/");
});

test("application discovery falls back to SSH when cPanel returns 403", async () => {
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (message) => warnings.push(String(message));

  try {
    const applications = await getApplications(baseConfig, {
      fetchImpl: async () => ({ ok: false, status: 403 }),
      nodeSelectorLookup: async () => [
        {
          appRoot: "/home/example/apps/example/current",
          domain: "example.com",
          source: "cloudlinux",
          state: "started",
          uri: "/",
          version: "22.18.0",
        },
      ],
    });

    assert.equal(applications.length, 1);
    assert.equal(applications[0].source, "cloudlinux");
    assert.match(warnings.join("\n"), /403/);
    assert.doesNotMatch(warnings.join("\n"), /secret-token/);
  } finally {
    console.warn = originalWarn;
  }
});

test("application discovery uses SSH directly when cPanel is not configured", async () => {
  let fetchCalled = false;
  const applications = await getApplications(
    { ...baseConfig, cpanelHost: undefined, cpanelToken: undefined },
    {
      fetchImpl: async () => {
        fetchCalled = true;
        throw new Error("must not be called");
      },
      nodeSelectorLookup: async () => [{ source: "cloudlinux" }],
    },
  );

  assert.equal(fetchCalled, false);
  assert.deepEqual(applications, [{ source: "cloudlinux" }]);
});
