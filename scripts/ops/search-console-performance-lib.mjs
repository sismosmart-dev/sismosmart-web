const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TOP_LIST = 25;

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function roundToTwoDecimals(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatUtcDate(date) {
  return date.toISOString().slice(0, 10);
}

function toUtcDate(value, label) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid ${label}: must be YYYY-MM-DD format`);
  }

  const [, yearText, monthText, dayText] = match;
  const date = new Date(
    Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)),
  );

  if (formatUtcDate(date) !== value) {
    throw new Error(`Invalid ${label}: not a valid calendar date`);
  }

  return date;
}

export function parseSearchConsoleDate(value, label) {
  toUtcDate(value, label);
  return value;
}

export function resolvePerformancePeriod({
  now = new Date(),
  startDate,
  endDate,
} = {}) {
  if (Boolean(startDate) !== Boolean(endDate)) {
    throw new Error("Both startDate and endDate must be provided together");
  }

  if (startDate && endDate) {
    const parsedStart = parseSearchConsoleDate(startDate, "startDate");
    const parsedEnd = parseSearchConsoleDate(endDate, "endDate");
    if (parsedStart > parsedEnd) {
      throw new Error("startDate must be <= endDate");
    }
    return { startDate: parsedStart, endDate: parsedEnd };
  }

  const current = new Date(now);
  if (!Number.isFinite(current.getTime())) {
    throw new Error("Invalid current date");
  }

  const currentUtcDay = Date.UTC(
    current.getUTCFullYear(),
    current.getUTCMonth(),
    current.getUTCDate(),
  );
  const end = new Date(currentUtcDay - 3 * DAY_MS);
  const start = new Date(end.getTime() - 27 * DAY_MS);

  return {
    startDate: formatUtcDate(start),
    endDate: formatUtcDate(end),
  };
}

export function getPreviousPerformancePeriod(startDate, endDate) {
  const start = toUtcDate(startDate, "startDate");
  const end = toUtcDate(endDate, "endDate");
  if (start.getTime() > end.getTime()) {
    throw new Error("startDate must be <= endDate");
  }

  const inclusiveDays =
    Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  const previousEnd = new Date(start.getTime() - DAY_MS);
  const previousStart = new Date(
    previousEnd.getTime() - (inclusiveDays - 1) * DAY_MS,
  );

  return {
    startDate: formatUtcDate(previousStart),
    endDate: formatUtcDate(previousEnd),
  };
}

function asRecord(value) {
  return value && typeof value === "object" ? value : {};
}

function extractKey(row) {
  const record = asRecord(row);
  return Array.isArray(record.keys) && record.keys.length > 0
    ? String(record.keys[0])
    : "";
}

export function normalizeSearchConsoleRows(rows) {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => {
    const record = asRecord(row);
    return {
      key: extractKey(record),
      clicks: toFiniteNumber(record.clicks),
      impressions: toFiniteNumber(record.impressions),
      ctrPercent: roundToTwoDecimals(toFiniteNumber(record.ctr) * 100),
      position: roundToTwoDecimals(toFiniteNumber(record.position)),
    };
  });
}

export function isBrandQuery(query) {
  if (typeof query !== "string") return false;
  const normalized = query.trim().replace(/\s+/g, " ");
  if (!normalized) return false;

  return (
    /(?:^|[^a-z0-9])sismo\s*smart(?:[^a-z0-9]|$)/i.test(normalized) ||
    /(?:https?:\/\/)?(?:www\.)?sismosmart\.com(?:\/|$)/i.test(normalized)
  );
}

function compareKeys(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function sortTopList(rows) {
  return rows
    .slice()
    .sort((left, right) => {
      if (right.impressions !== left.impressions) {
        return right.impressions - left.impressions;
      }
      if (right.clicks !== left.clicks) {
        return right.clicks - left.clicks;
      }
      return compareKeys(left.key, right.key);
    })
    .slice(0, MAX_TOP_LIST);
}

function extractTotals(rows) {
  const record = asRecord(Array.isArray(rows) ? rows[0] : null);
  return {
    clicks: toFiniteNumber(record.clicks),
    impressions: toFiniteNumber(record.impressions),
    ctrPercent: roundToTwoDecimals(toFiniteNumber(record.ctr) * 100),
    position: roundToTwoDecimals(toFiniteNumber(record.position)),
  };
}

function computeNonBrand(queries) {
  const nonBrandQueries = queries.filter((row) => !isBrandQuery(row.key));
  return {
    queryCount: nonBrandQueries.length,
    clicks: nonBrandQueries.reduce((sum, row) => sum + row.clicks, 0),
    impressions: nonBrandQueries.reduce(
      (sum, row) => sum + row.impressions,
      0,
    ),
  };
}

export function summarizePerformance({
  current = {},
  previous = null,
  startDate,
  endDate,
}) {
  const currentTotals = extractTotals(current.totals);
  const normalizedQueries = normalizeSearchConsoleRows(current.queries);
  const normalizedPages = normalizeSearchConsoleRows(current.pages);
  const normalizedCountries = normalizeSearchConsoleRows(current.countries);

  let comparison = null;
  if (previous) {
    const previousTotals = extractTotals(previous.totals);
    comparison = {
      previousPeriod: getPreviousPerformancePeriod(startDate, endDate),
      clicksDelta: currentTotals.clicks - previousTotals.clicks,
      impressionsDelta:
        currentTotals.impressions - previousTotals.impressions,
      ctrPointDelta: roundToTwoDecimals(
        currentTotals.ctrPercent - previousTotals.ctrPercent,
      ),
      positionDelta: roundToTwoDecimals(
        currentTotals.position - previousTotals.position,
      ),
    };
  }

  return {
    period: { startDate, endDate },
    totals: currentTotals,
    nonBrand: computeNonBrand(normalizedQueries),
    topQueries: sortTopList(normalizedQueries),
    topPages: sortTopList(normalizedPages),
    countries: sortTopList(normalizedCountries),
    comparison,
  };
}
