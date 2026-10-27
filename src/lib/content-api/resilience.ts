/**
 * A brief per-worker backoff prevents a failed optional CMS database from
 * adding connection latency and log noise to every public homepage request.
 * The existing source-controlled copy remains the caller's fallback.
 */
export function createResilientContentReader<L, K, T>(
  read: (locale: L, key: K) => Promise<T | null>,
  { cooldownMs = 15_000, now = Date.now, reportFailure = () => undefined }:
    { cooldownMs?: number; now?: () => number; reportFailure?: () => void } = {},
) {
  let retryAfter = 0;
  let previouslyFailed = false;

  return async (locale: L, key: K): Promise<T | null> => {
    if (now() < retryAfter) return null;
    try {
      const result = await read(locale, key);
      retryAfter = 0;
      previouslyFailed = false;
      return result;
    } catch {
      retryAfter = now() + cooldownMs;
      if (!previouslyFailed) reportFailure();
      previouslyFailed = true;
      return null;
    }
  };
}
