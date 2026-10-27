// A hosting provider can briefly reject new SSH/SFTP handshakes under load.
// A retry is safe ONLY before any remote command has started.
const TRANSIENT_CONNECT_PATTERNS = [
  /connection lost before handshake/i,
  /timed out while waiting for handshake/i,
  /handshake timeout/i,
  /connection reset/i,
  /econnreset/i,
  /socket closed/i,
];

export const MAX_CONNECT_ATTEMPTS = 7;
export const retryDelayMs = (attempt) => Math.min(5_000 * attempt, 30_000);

export function isTransientConnectError(error) {
  if (error?.commandStarted) return false;
  const detail = [error?.message, error?.code, error?.level]
    .filter(Boolean)
    .join(" ");
  return TRANSIENT_CONNECT_PATTERNS.some((pattern) => pattern.test(detail));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withConnectRetry(label, task, {
  maxAttempts = MAX_CONNECT_ATTEMPTS,
  delayFor = retryDelayMs,
  pause = sleep,
  warn = console.warn,
} = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (attempt === maxAttempts || !isTransientConnectError(error)) throw error;
      const delay = delayFor(attempt);
      // Never log the remote command or authentication configuration.
      warn(`${label} failed during handshake; retrying in ${Math.round(delay / 1000)}s (${attempt + 1}/${maxAttempts})`);
      await pause(delay);
    }
  }
}

export async function connectFreshClient(label, makeClient, connect, options = {}) {
  return withConnectRetry(label, async () => {
    const client = makeClient();
    try {
      await connect(client);
      return client;
    } catch (error) {
      try {
        await client.end();
      } catch {
        // Preserve the original handshake error for retry classification.
      }
      throw error;
    }
  }, options);
}
