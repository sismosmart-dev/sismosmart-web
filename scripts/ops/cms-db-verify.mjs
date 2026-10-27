#!/usr/bin/env node
/** Verifies gzip and SHA-256 without executing any SQL. */
import { pathToFileURL } from "node:url";
import { verifyBackup } from "./cms-db-backup.mjs";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const archive = process.argv[2];
  if (!archive || !archive.endsWith(".sql.gz")) {
    console.error("CMS_BACKUP_VERIFY_FAILED code=ARCHIVE_ARGUMENT_REQUIRED");
    process.exitCode = 1;
  } else {
    verifyBackup(archive).then(({ compressedBytes, uncompressedBytes }) => {
      console.log(`CMS_BACKUP_VERIFY_OK compressedBytes=${compressedBytes} sqlBytes=${uncompressedBytes}`);
      console.log("CMS_BACKUP_RESTORE_STILL_REQUIRED=true");
    }).catch(() => {
      console.error("CMS_BACKUP_VERIFY_FAILED code=INVALID_ARCHIVE");
      process.exitCode = 1;
    });
  }
}
