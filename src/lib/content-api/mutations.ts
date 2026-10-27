import type { PoolConnection, RowDataPacket } from "mysql2/promise";

import { validateContentDocument, type ContentKey } from "@/lib/content-api/contracts";
import type { Locale } from "@/lib/site";

export class CmsMutationError extends Error {
  readonly code: "CMS_CONFLICT" | "CMS_NO_DRAFT" | "CMS_REVISION_NOT_FOUND";

  constructor(code: "CMS_CONFLICT" | "CMS_NO_DRAFT" | "CMS_REVISION_NOT_FOUND") {
    super(code);
    this.code = code;
  }
}

type ExistingRow = RowDataPacket & {
  version: number;
  draft_json: string | null;
  published_json: string | null;
  published_version: number | null;
};

type RevisionRow = RowDataPacket & { action: string; content_json: string };
export type CmsMutation =
  | { action: "draft"; content: unknown; expectedVersion: number }
  | { action: "publish"; expectedVersion: number }
  | { action: "rollback"; expectedVersion: number; targetVersion: number };

/** Serialized per locale/key with InnoDB row lock; revision increments atomically. */
export async function mutateContent(
  connection: Pick<PoolConnection, "beginTransaction" | "commit" | "rollback" | "execute">,
  locale: Locale,
  key: ContentKey,
  mutation: CmsMutation,
) {
  const { expectedVersion } = mutation;
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0 || expectedVersion >= 2 ** 32 - 1) {
    throw new CmsMutationError("CMS_CONFLICT");
  }

  await connection.beginTransaction();
  try {
    await connection.execute(
      "INSERT INTO cms_content (locale, content_key) VALUES (?, ?) ON DUPLICATE KEY UPDATE locale = locale",
      [locale, key],
    );
    const [rows] = await connection.execute<ExistingRow[]>(
      "SELECT version, draft_json, published_json, published_version FROM cms_content WHERE locale = ? AND content_key = ? FOR UPDATE",
      [locale, key],
    );
    const current = rows[0];
    if (!current || Number(current.version) !== expectedVersion) throw new CmsMutationError("CMS_CONFLICT");

    let draft = current.draft_json;
    let published = current.published_json;
    let publishedVersion = current.published_version;
    let nextContent: string;

    if (mutation.action === "draft") {
      nextContent = JSON.stringify(validateContentDocument(key, mutation.content));
      draft = nextContent;
    } else if (mutation.action === "publish") {
      if (!draft) throw new CmsMutationError("CMS_NO_DRAFT");
      nextContent = JSON.stringify(validateContentDocument(key, JSON.parse(draft)));
      published = nextContent;
      publishedVersion = expectedVersion + 1;
    } else {
      if (!Number.isSafeInteger(mutation.targetVersion) || mutation.targetVersion < 0) {
        throw new CmsMutationError("CMS_REVISION_NOT_FOUND");
      }
      if (mutation.targetVersion === 0) {
        // A first publication has no prior CMS revision. Restore the original
        // source-controlled copy by clearing both published and draft values.
        nextContent = "null";
        draft = null;
        published = null;
        publishedVersion = null;
      } else {
        const [revisions] = await connection.execute<RevisionRow[]>(
          "SELECT action, content_json FROM cms_revision WHERE locale = ? AND content_key = ? AND version = ? LIMIT 1",
          [locale, key, mutation.targetVersion],
        );
        const revision = revisions[0];
        if (!revision || !["publish", "rollback"].includes(revision.action) || revision.content_json === "null") {
          throw new CmsMutationError("CMS_REVISION_NOT_FOUND");
        }
        nextContent = JSON.stringify(validateContentDocument(key, JSON.parse(revision.content_json)));
        draft = nextContent;
        published = nextContent;
        publishedVersion = expectedVersion + 1;
      }
    }

    const version = expectedVersion + 1;
    await connection.execute(
      "UPDATE cms_content SET version = ?, draft_json = ?, published_json = ?, published_version = ? WHERE locale = ? AND content_key = ?",
      [version, draft, published, publishedVersion, locale, key],
    );
    await connection.execute(
      "INSERT INTO cms_revision (locale, content_key, version, action, content_json) VALUES (?, ?, ?, ?, ?)",
      [locale, key, version, mutation.action, nextContent],
    );
    await connection.commit();
    return { ok: true, locale, key, version, publishedVersion, action: mutation.action };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
