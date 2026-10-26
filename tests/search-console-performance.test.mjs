import assert from "node:assert/strict";
import test from "node:test";

import {
  getPreviousPerformancePeriod,
  isBrandQuery,
  normalizeSearchConsoleRows,
  parseSearchConsoleDate,
  resolvePerformancePeriod,
  summarizePerformance,
} from "../scripts/ops/search-console-performance-lib.mjs";

const emptyDataset = () => ({
  totals: [],
  queries: [],
  pages: [],
  countries: [],
});

test("normalizeSearchConsoleRows returns only the safe row shape", () => {
  const [row] = normalizeSearchConsoleRows([
    {
      keys: ["sismosmart", "ignored"],
      clicks: 100,
      impressions: 5000,
      ctr: 0.020049,
      position: 5.555,
      token: "must-not-survive",
      rawResponse: { authorization: "must-not-survive" },
    },
  ]);

  assert.deepEqual(row, {
    key: "sismosmart",
    clicks: 100,
    impressions: 5000,
    ctrPercent: 2,
    position: 5.56,
  });
  assert.deepEqual(Object.keys(row), [
    "key",
    "clicks",
    "impressions",
    "ctrPercent",
    "position",
  ]);
});

test("normalizeSearchConsoleRows converts fractions and rounds metrics to two decimals", () => {
  const [row] = normalizeSearchConsoleRows([
    {
      keys: ["query"],
      clicks: 1,
      impressions: 3,
      ctr: 0.333333,
      position: 12.3456,
    },
  ]);

  assert.equal(row.ctrPercent, 33.33);
  assert.equal(row.position, 12.35);
});

test("normalizeSearchConsoleRows normalizes malformed and negative metrics to zero", () => {
  const rows = normalizeSearchConsoleRows([
    {
      keys: ["negative"],
      clicks: -5,
      impressions: -100,
      ctr: -0.4,
      position: Infinity,
    },
    {
      clicks: "not-a-number",
      impressions: NaN,
      ctr: undefined,
      position: null,
    },
    null,
  ]);

  assert.deepEqual(rows, [
    { key: "negative", clicks: 0, impressions: 0, ctrPercent: 0, position: 0 },
    { key: "", clicks: 0, impressions: 0, ctrPercent: 0, position: 0 },
    { key: "", clicks: 0, impressions: 0, ctrPercent: 0, position: 0 },
  ]);
  assert.deepEqual(normalizeSearchConsoleRows(null), []);
});

test("isBrandQuery recognizes only SismoSmart name and canonical-domain variants", () => {
  for (const query of [
    "SismoSmart",
    "  SISMOSMART  ",
    "sismo smart",
    "buy sismosmart device",
    "sismosmart.com",
    "www.sismosmart.com",
    "https://sismosmart.com/en",
    "https://www.sismosmart.com/tr",
  ]) {
    assert.equal(isBrandQuery(query), true, `${query} must be brand`);
  }

  for (const query of [
    "sismo",
    "sismos",
    "seismic monitor",
    "bina deprem sensörü",
    "sismik izleme cihazı",
    "earthquake sensor",
    "",
    null,
  ]) {
    assert.equal(isBrandQuery(query), false, `${query} must remain generic`);
  }
});

test("parseSearchConsoleDate accepts strict real UTC calendar dates", () => {
  assert.equal(parseSearchConsoleDate("2024-02-29", "startDate"), "2024-02-29");
  assert.equal(parseSearchConsoleDate("2026-07-25", "endDate"), "2026-07-25");
});

test("parseSearchConsoleDate rejects malformed and normalized impossible dates", () => {
  for (const value of [
    "2026-2-03",
    "2026/02/03",
    "2026-02-30",
    "2025-02-29",
    "2026-13-01",
    "not-a-date",
  ]) {
    assert.throws(
      () => parseSearchConsoleDate(value, "startDate"),
      /Invalid startDate/,
      value,
    );
  }
});

test("resolvePerformancePeriod defaults to a complete UTC 28-day window ending three days ago", () => {
  assert.deepEqual(
    resolvePerformancePeriod({ now: new Date("2026-07-27T00:30:00.000Z") }),
    { startDate: "2026-06-27", endDate: "2026-07-24" },
  );

  assert.deepEqual(
    resolvePerformancePeriod({ now: new Date("2026-01-02T23:30:00.000Z") }),
    { startDate: "2025-12-03", endDate: "2025-12-30" },
  );
});

test("resolvePerformancePeriod requires both explicit dates and preserves valid values", () => {
  assert.deepEqual(
    resolvePerformancePeriod({
      startDate: "2026-06-28",
      endDate: "2026-07-25",
      now: new Date("2030-01-01T00:00:00.000Z"),
    }),
    { startDate: "2026-06-28", endDate: "2026-07-25" },
  );

  assert.throws(
    () => resolvePerformancePeriod({ startDate: "2026-06-28" }),
    /Both startDate and endDate/,
  );
  assert.throws(
    () => resolvePerformancePeriod({ endDate: "2026-07-25" }),
    /Both startDate and endDate/,
  );
  assert.throws(
    () =>
      resolvePerformancePeriod({
        startDate: "2026-07-25",
        endDate: "2026-06-28",
      }),
    /startDate must be <= endDate/,
  );
});

test("getPreviousPerformancePeriod returns the immediately preceding equal-length period", () => {
  assert.deepEqual(
    getPreviousPerformancePeriod("2026-06-28", "2026-07-25"),
    { startDate: "2026-05-31", endDate: "2026-06-27" },
  );
  assert.deepEqual(
    getPreviousPerformancePeriod("2024-02-29", "2024-02-29"),
    { startDate: "2024-02-28", endDate: "2024-02-28" },
  );
});

test("summarizePerformance takes totals from the dimensionless aggregate row", () => {
  const current = {
    totals: [{ clicks: 7, impressions: 70, ctr: 0.1, position: 8.888 }],
    queries: [
      { keys: ["generic one"], clicks: 900, impressions: 9000, ctr: 0.1, position: 1 },
      { keys: ["generic two"], clicks: 800, impressions: 8000, ctr: 0.1, position: 2 },
    ],
    pages: [],
    countries: [],
  };

  const result = summarizePerformance({
    current,
    previous: null,
    startDate: "2026-06-28",
    endDate: "2026-07-25",
  });

  assert.deepEqual(result.totals, {
    clicks: 7,
    impressions: 70,
    ctrPercent: 10,
    position: 8.89,
  });
});

test("summarizePerformance derives non-brand metrics only from normalized query rows", () => {
  const current = {
    totals: [{ clicks: 300, impressions: 15000, ctr: 0.02, position: 8 }],
    queries: [
      { keys: ["SismoSmart"], clicks: 200, impressions: 5000, ctr: 0.04, position: 2 },
      { keys: ["deprem monitor"], clicks: 100, impressions: 10000, ctr: 0.01, position: 15 },
      { keys: ["bad metrics"], clicks: -40, impressions: Infinity, ctr: 1, position: 1 },
    ],
    pages: [{ keys: ["/en"], clicks: 999, impressions: 9999, ctr: 0.1, position: 1 }],
    countries: [],
  };

  const result = summarizePerformance({
    current,
    previous: null,
    startDate: "2026-06-28",
    endDate: "2026-07-25",
  });

  assert.deepEqual(result.nonBrand, {
    queryCount: 2,
    clicks: 100,
    impressions: 10000,
  });
});

test("summarizePerformance sorts every top list deterministically and limits it to 25", () => {
  const tiedRows = [
    { keys: ["b"], clicks: 100, impressions: 5000, ctr: 0.02, position: 10 },
    { keys: ["a"], clicks: 100, impressions: 5000, ctr: 0.02, position: 5 },
    { keys: ["c"], clicks: 150, impressions: 10000, ctr: 0.015, position: 12 },
    { keys: ["d"], clicks: 200, impressions: 5000, ctr: 0.04, position: 3 },
  ];
  const manyRows = Array.from({ length: 30 }, (_, index) => ({
    keys: [`row-${String(index).padStart(2, "0")}`],
    clicks: index,
    impressions: 100 + index,
    ctr: 0.1,
    position: index + 1,
  }));

  const result = summarizePerformance({
    current: {
      totals: [],
      queries: tiedRows,
      pages: manyRows,
      countries: manyRows,
    },
    previous: null,
    startDate: "2026-06-28",
    endDate: "2026-07-25",
  });

  assert.deepEqual(result.topQueries.map((row) => row.key), ["c", "d", "a", "b"]);
  assert.equal(result.topPages.length, 25);
  assert.equal(result.countries.length, 25);
  assert.equal(result.topPages[0].key, "row-29");
});

test("summarizePerformance returns exact previous period and current-minus-previous deltas", () => {
  const current = {
    ...emptyDataset(),
    totals: [{ clicks: 1200, impressions: 60000, ctr: 0.025, position: 7.5 }],
  };
  const previous = {
    ...emptyDataset(),
    totals: [{ clicks: 1000, impressions: 50000, ctr: 0.02, position: 8.5 }],
    token: "must-not-survive",
    rawResponse: { headers: { authorization: "must-not-survive" } },
  };

  const result = summarizePerformance({
    current,
    previous,
    startDate: "2026-06-28",
    endDate: "2026-07-25",
  });

  assert.deepEqual(result.comparison, {
    previousPeriod: { startDate: "2026-05-31", endDate: "2026-06-27" },
    clicksDelta: 200,
    impressionsDelta: 10000,
    ctrPointDelta: 0.5,
    positionDelta: -1,
  });
});

test("summarizePerformance returns only the documented safe summary shape", () => {
  const current = {
    ...emptyDataset(),
    totals: [
      {
        clicks: 100,
        impressions: 5000,
        ctr: 0.02,
        position: 8,
        token: "must-not-survive",
      },
    ],
    queries: [
      {
        keys: ["test"],
        clicks: 50,
        impressions: 2500,
        ctr: 0.02,
        position: 5,
        request: { siteUrl: "private-property" },
      },
    ],
    authClient: { credentials: "must-not-survive" },
    headers: { authorization: "must-not-survive" },
  };

  const result = summarizePerformance({
    current,
    previous: null,
    startDate: "2026-06-28",
    endDate: "2026-07-25",
  });

  assert.deepEqual(Object.keys(result), [
    "period",
    "totals",
    "nonBrand",
    "topQueries",
    "topPages",
    "countries",
    "comparison",
  ]);
  assert.deepEqual(Object.keys(result.period), ["startDate", "endDate"]);
  assert.deepEqual(Object.keys(result.totals), [
    "clicks",
    "impressions",
    "ctrPercent",
    "position",
  ]);
  assert.equal(result.comparison, null);
  assert.doesNotMatch(
    JSON.stringify(result),
    /must-not-survive|authorization|credentials|private-property/,
  );
});
