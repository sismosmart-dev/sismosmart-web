import type { Pool, RowDataPacket } from "mysql2/promise";

import { isContentKey, isContentLocale, validateContentDocument, type ContentKey } from "@/lib/content-api/contracts";
import type { Locale } from "@/lib/site";

type PublishedRow = RowDataPacket & { published_json: string | null };

/** No draft data leaves the repository. Query keys are strictly registered. */
export async function readPublishedContent(
  database: Pick<Pool, "execute">,
  locale: Locale,
  key: ContentKey,
) {
  if (!isContentLocale(locale) || !isContentKey(key)) throw new Error("CMS_INVALID_CONTENT_KEY");
  const [rows] = await database.execute<PublishedRow[]>(
    "SELECT published_json FROM cms_content WHERE locale = ? AND content_key = ? LIMIT 1",
    [locale, key],
  );
  const serialized = rows[0]?.published_json;
  if (serialized == null) return null;
  return validateContentDocument(key, JSON.parse(serialized));
}

type AdminRow = RowDataPacket & {
  version: number;
  draft_json: string | null;
  published_json: string | null;
  published_version: number | null;
};
type RevisionSummary = RowDataPacket & { version: number; action: string };

/** Protected admin-only preview and short revision index. Never call from public routes. */
export async function readAdminContent(database: Pick<Pool, "execute">, locale: Locale, key: ContentKey) {
  if (!isContentLocale(locale) || !isContentKey(key)) throw new Error("CMS_INVALID_CONTENT_KEY");
  const [rows] = await database.execute<AdminRow[]>(
    "SELECT version, draft_json, published_json, published_version FROM cms_content WHERE locale = ? AND content_key = ? LIMIT 1",
    [locale, key],
  );
  const [revisions] = await database.execute<RevisionSummary[]>(
    "SELECT version, action FROM cms_revision WHERE locale = ? AND content_key = ? ORDER BY version DESC LIMIT 25",
    [locale, key],
  );
  const row = rows[0];
  return {
    locale, key, version: Number(row?.version ?? 0), publishedVersion: row?.published_version ?? null,
    draft: row?.draft_json ? validateContentDocument(key, JSON.parse(row.draft_json)) : null,
    published: row?.published_json ? validateContentDocument(key, JSON.parse(row.published_json)) : null,
    revisions: revisions.map((revision) => ({ version: Number(revision.version), action: revision.action })),
  };
}
