import "server-only";

import type { Pool } from "mysql2/promise";

import { getCmsDatabaseConfig } from "@/lib/content-api/config";
import { readPublishedContent } from "@/lib/content-api/query";
import { createResilientContentReader } from "@/lib/content-api/resilience";
import type { ContentKey } from "@/lib/content-api/contracts";
import type { Locale } from "@/lib/site";

let pool: Pool | undefined;

/** Lazily open at most two local DB connections per Passenger worker. */
export async function getCmsPool() {
  const config = getCmsDatabaseConfig();
  if (!config) return null;
  if (!pool) {
    const { createPool } = await import("mysql2/promise");
    pool = createPool({
      ...config,
      connectTimeout: 1_500,
      waitForConnections: true,
      connectionLimit: 2,
      queueLimit: 10,
    });
  }
  return pool;
}

/** Fail over promptly and back off repeated errors instead of slowing public traffic. */
export const readPublishedOverride = createResilientContentReader<
  Locale,
  ContentKey,
  Awaited<ReturnType<typeof readPublishedContent>>
>(
  async (locale, key) => {
    const database = await getCmsPool();
    if (!database) return null;
    return readPublishedContent(database, locale, key);
  },
  { reportFailure: () => console.warn("CMS_PUBLISHED_FALLBACK") },
);
