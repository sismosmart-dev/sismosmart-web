import { spawn } from "node:child_process";
import { createServer } from "node:http";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { summarizeForwardRequest } from "./browser-quality-lib.mjs";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const TEST_TOKEN = "browser-quality-local-token";
const MAX_MOCK_BODY_BYTES = 128 * 1024;
const SERVER_READY_TIMEOUT_MS = 45_000;
const PROCESS_LOG_LIMIT = 64 * 1024;
const MAX_APP_START_ATTEMPTS = 4;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function safeFailureMessage(error) {
  const message = String(error?.message || error || "browser scenario failed");
  return message
    .replaceAll(PROJECT_ROOT, "<repo>")
    .replace(/https?:\/\/(?:127\.0\.0\.1|localhost|\[::1\]):\d+/g, "<loopback>")
    .slice(0, 500);
}

export function isAddressInUseFailure(error) {
  return /EADDRINUSE|address already in use/i.test(
    String(error?.message || error || ""),
  );
}

function appendBounded(current, chunk) {
  if (current.length >= PROCESS_LOG_LIMIT) return current;
  return `${current}${String(chunk)}`.slice(-PROCESS_LOG_LIMIT);
}

async function findOpenPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close((error) => {
        if (error) reject(error);
        else if (!port)
          reject(new Error("Could not allocate a loopback port."));
        else resolve(port);
      });
    });
  });
}

async function readJsonBody(request, maxBodyBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new Error("Mock payload exceeded limit.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function startMockReceiver({
  expectedToken = TEST_TOKEN,
  maxBodyBytes = MAX_MOCK_BODY_BYTES,
} = {}) {
  const records = [];
  const server = createServer(async (request, response) => {
    const route =
      request.url === "/contact"
        ? "contact"
        : request.url === "/waitlist"
          ? "waitlist"
          : null;
    if (request.method !== "POST" || !route) {
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    try {
      const envelope = await readJsonBody(request, maxBodyBytes);
      const summary = summarizeForwardRequest({
        authorization: request.headers.authorization,
        contentType: request.headers["content-type"],
        expectedToken,
        payload: envelope?.payload,
        route,
      });
      const valid =
        envelope?.form === route &&
        summary.authorizationMatches &&
        summary.contentTypeMatches;
      records.push({ ...summary, formMatches: envelope?.form === route });
      response.writeHead(valid ? 200 : 400, {
        "content-type": "application/json",
      });
      response.end(JSON.stringify({ ok: valid }));
    } catch {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: false }));
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address !== "object") {
    server.close();
    throw new Error("Mock receiver did not expose a loopback address.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
    records,
  };
}

async function waitForApp(
  baseUrl,
  child,
  {
    fetchImpl = fetch,
    nowImpl = Date.now,
    readyTimeoutMs = SERVER_READY_TIMEOUT_MS,
    sleepImpl = sleep,
  } = {},
) {
  const deadline = nowImpl() + readyTimeoutMs;
  let lastError = null;
  while (nowImpl() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Next server exited before readiness with code ${child.exitCode}.`,
      );
    }
    try {
      const response = await fetchImpl(`${baseUrl}/en`, {
        redirect: "manual",
        signal: AbortSignal.timeout(2_000),
      });
      if (response.status === 200) return;
      lastError = new Error(`Next readiness returned ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await sleepImpl(300);
  }
  throw lastError || new Error("Next server readiness timed out.");
}

export async function stopChild(
  child,
  { forceDelayMs = 5_000, sleepImpl = sleep } = {},
) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  const stopped = await Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    sleepImpl(forceDelayMs).then(() => false),
  ]);
  if (!stopped && child.exitCode === null) {
    child.kill("SIGKILL");
    await new Promise((resolve) => child.once("exit", resolve));
  }
}

async function startNextServerAttempt(
  mockBaseUrl,
  port,
  {
    authToken = TEST_TOKEN,
    env = process.env,
    execPath = process.execPath,
    projectRoot = PROJECT_ROOT,
    spawnImpl = spawn,
    stopChildImpl = stopChild,
    waitForAppImpl = waitForApp,
  } = {},
) {
  const nextBin = path.join(
    projectRoot,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  let stdout = "";
  let stderr = "";
  const child = spawnImpl(
    execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectRoot,
      env: {
        ...env,
        CONTACT_FORM_ENDPOINT: `${mockBaseUrl}/contact`,
        FORM_FORWARD_AUTH_TOKEN: authToken,
        NODE_ENV: "production",
        WAITLIST_FORM_ENDPOINT: `${mockBaseUrl}/waitlist`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout.on("data", (chunk) => {
    stdout = appendBounded(stdout, chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderr = appendBounded(stderr, chunk);
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForAppImpl(baseUrl, child);
  } catch (error) {
    await stopChildImpl(child);
    const details = `${safeFailureMessage(error)} Next stdout=${stdout.slice(-500)} stderr=${stderr.slice(-500)}`;
    const wrapped = new Error(details);
    wrapped.cause = error;
    throw wrapped;
  }
  return { baseUrl, child, stop: () => stopChildImpl(child) };
}

export async function startNextServer(
  mockBaseUrl,
  {
    findOpenPortImpl = findOpenPort,
    maxAttempts = MAX_APP_START_ATTEMPTS,
    startAttemptImpl = startNextServerAttempt,
  } = {},
) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const port = await findOpenPortImpl();
    try {
      return await startAttemptImpl(mockBaseUrl, port);
    } catch (error) {
      lastError = error;
      if (!isAddressInUseFailure(error) || attempt === maxAttempts) {
        throw error;
      }
    }
  }
  throw lastError || new Error("Next server could not start.");
}
