/** A tiny bounded per-worker TTL cache for shared chrome, one entry per locale. */
export function createChromeCache<L, T>(
  read: (locale: L) => Promise<T | null>,
  { ttlMs = 5_000, now = Date.now }: { ttlMs?: number; now?: () => number } = {},
) {
  const values = new Map<L, { until: number; value: T | null }>();
  const pending = new Map<L, Promise<T | null>>();
  return async (locale: L): Promise<T | null> => {
    const cached = values.get(locale);
    if (cached && now() < cached.until) return cached.value;
    const inFlight = pending.get(locale);
    if (inFlight) return inFlight;
    const task = Promise.resolve().then(() => read(locale)).then((value) => {
      values.set(locale, { value, until: now() + ttlMs });
      return value;
    }).finally(() => { pending.delete(locale); });
    pending.set(locale, task);
    return task;
  };
}
