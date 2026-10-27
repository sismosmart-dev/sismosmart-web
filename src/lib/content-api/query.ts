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
