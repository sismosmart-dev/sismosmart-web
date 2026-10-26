import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import process from "node:process";

const bundleRoot = path.resolve(process.env.STANDALONE_BUNDLE_ROOT || ".deploy/standalone");
const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || "");
const startupTimeoutMs = Number(process.env.STANDALONE_SMOKE_TIMEOUT_MS || 30_000);

const startupModes = [
  { name: "direct-node", args: ["app.js"] },
  { name: "passenger-require", args: ["-e", 'require("./app.js")'] },
];

function normalizeBasePath(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

async function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

function appendCapped(current, chunk) {
  const next = `${current}${chunk}`;
  return next.length > 32_000 ? next.slice(-32_000) : next;
}

async function waitForHealthyServer({ child, port }) {
  const deadline = Date.now() + startupTimeoutMs;
  const urls = [
    `http://127.0.0.1:${port}${basePath}/en`,
    `http://127.0.0.1:${port}${basePath}/site.webmanifest`,
  ];

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Standalone process exited before becoming healthy (code ${child.exitCode}).`);
    }

    try {
      const responses = await Promise.all(
        urls.map((url) =>
          fetch(url, {
            redirect: "manual",
            signal: AbortSignal.timeout(4_000),
          }),
        ),
      );
      if (responses.every((response) => response.status === 200)) {
        return responses.map((response, index) => ({
          status: response.status,
          url: urls[index],
        }));
      }
    } catch {
      // The process may still be starting. Retry until the bounded deadline.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Standalone process did not become healthy within ${startupTimeoutMs}ms.`);
}

async function stopChild(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  const exited = await Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    new Promise((resolve) => setTimeout(() => resolve(false), 3_000)),
  ]);
  if (!exited && child.exitCode === null) {
    child.kill("SIGKILL");
  }
}

async function runStartupMode(mode) {
  const port = await reservePort();
  const child = spawn(process.execPath, mode.args, {
    cwd: bundleRoot,
    env: {
      ...process.env,
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout = appendCapped(stdout, chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderr = appendCapped(stderr, chunk);
  });

  try {
    const checks = await waitForHealthyServer({ child, port });
    return { mode: mode.name, checks, result: "success" };
  } catch (error) {
    const details = [
      `${mode.name}: ${error.message}`,
      stdout.trim() ? `stdout:\n${stdout.trim()}` : "",
      stderr.trim() ? `stderr:\n${stderr.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    throw new Error(details);
  } finally {
    await stopChild(child);
  }
}

async function main() {
  const results = [];
  for (const mode of startupModes) {
    results.push(await runStartupMode(mode));
  }

  console.log(
    JSON.stringify({
      bundleRoot,
      basePath: basePath || "/",
      modes: results,
      result: "success",
    }),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
