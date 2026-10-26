import process from "node:process";
import { pathToFileURL } from "node:url";

const DEFAULT_ATTEMPTS = 6;
const DEFAULT_DELAY_MS = 2_000;
const GITHUB_API_VERSION = "2022-11-28";

function defaultSleep(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function requireNonEmpty(value, name) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(`${name} is required.`);
  return normalized;
}

function validateOptions({ attempts, commitSha, delayMs, repository, token }) {
  const normalizedRepository = requireNonEmpty(repository, "repository");
  const normalizedCommitSha = requireNonEmpty(commitSha, "commitSha");
  const normalizedToken = requireNonEmpty(token, "token");

  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(normalizedRepository)) {
    throw new Error("repository must use the owner/name format.");
  }
  if (!/^[A-Za-z0-9._-]+$/.test(normalizedCommitSha)) {
    throw new Error("commitSha contains unsupported characters.");
  }
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new Error("attempts must be a positive integer.");
  }
  if (!Number.isFinite(delayMs) || delayMs < 0) {
    throw new Error("delayMs must be a non-negative number.");
  }

  return {
    commitSha: normalizedCommitSha,
    repository: normalizedRepository,
    token: normalizedToken,
  };
}

export function mergedMainPullRequests(pulls) {
  if (!Array.isArray(pulls)) return [];
  return pulls.filter(
    (pull) =>
      pull &&
      typeof pull === "object" &&
      Boolean(pull.merged_at) &&
      pull.base?.ref === "main",
  );
}

async function requestAssociatedPulls({
  commitSha,
  fetchImpl,
  repository,
  token,
}) {
  const url = `https://api.github.com/repos/${repository}/commits/${commitSha}/pulls`;
  const response = await fetchImpl(url, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": GITHUB_API_VERSION,
    },
  });

  if (!response?.ok) {
    const status = response?.status ?? "unknown";
    throw new Error(`GitHub API request failed with status ${status}.`);
  }

  const pulls = await response.json();
  if (!Array.isArray(pulls)) {
    throw new Error("GitHub API returned an invalid pull request association response.");
  }
  return pulls;
}

export async function verifyMainlinePrOrigin({
  attempts = DEFAULT_ATTEMPTS,
  commitSha,
  delayMs = DEFAULT_DELAY_MS,
  fetchImpl = fetch,
  logger = console,
  repository,
  sleep = defaultSleep,
  token,
}) {
  const validated = validateOptions({
    attempts,
    commitSha,
    delayMs,
    repository,
    token,
  });

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const pulls = await requestAssociatedPulls({
      ...validated,
      fetchImpl,
    });
    const mergedPulls = mergedMainPullRequests(pulls);

    if (mergedPulls.length > 0) {
      logger.log(
        `main commit ${validated.commitSha} is associated with ${mergedPulls.length} merged pull request(s).`,
      );
      return mergedPulls.length;
    }

    if (attempt < attempts) {
      logger.log(
        `main commit ${validated.commitSha} PR association is not visible yet (attempt ${attempt}/${attempts}); retrying in ${delayMs}ms.`,
      );
      await sleep(delayMs);
    }
  }

  throw new Error(
    `main commit ${validated.commitSha} is not associated with a merged pull request.`,
  );
}

async function main() {
  await verifyMainlinePrOrigin({
    commitSha: process.env.GITHUB_SHA,
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
  });
}

const isCli = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isCli) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`::error::${message}`);
    console.error(
      "The current private/free plan cannot block this push server-side; this failing check is the detective control.",
    );
    process.exitCode = 1;
  });
}
