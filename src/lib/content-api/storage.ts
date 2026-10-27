import "server-only";

import type { Pool } from "mysql2/promise";

import { getCmsDatabaseConfig } from "@/lib/content-api/config";
import { readPublishedContent } from "@/lib/content-api/query";
import type { ContentKey } from "@/lib/content-api/contracts";
import type { Locale } from "@/lib/site";

let pool: Pool | undefined;

/** Lazily open at most two local DB connections per Passenger worker. */
export async function getCmsPool() {
  const config = getCmsDatabaseConfig();
  if (!config) return null;
  if (!pool) {
    const { createPool } = await import("mysql2/promise");
    pool = createPool({ ...config, waitForConnections: true, connectionLimit: 2, queueLimit: 10 });
  }
  return pool;
}

/** Fail over to source-controlled copy instead of breaking public pages. */
export async function readPublishedOverride(locale: Locale, key: ContentKey) {
  try {
    const database = await getCmsPool();
    if (!database) return null;
    return await readPublishedContent(database, locale, key);
  } catch {
    console.warn("CMS_PUBLISHED_FALLBACK");
    return null;
  }
}
