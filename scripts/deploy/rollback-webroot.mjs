import path from "node:path";

export const WEBROOT_ROLLBACK_ARCHIVE = ".rollback-public-html.tar.gz";
export const WEBROOT_ROLLBACK_DIGEST = ".rollback-public-html.tar.gz.sha256";

export function shellQuote(value) {
  return "'" + String(value).replaceAll("'", "'\"'\"'") + "'";
}

export function assertDirectReleasePath(releasesRoot, releasePath) {
  if (!releasePath || path.posix.dirname(releasePath) !== releasesRoot ||
      !path.posix.basename(releasePath) ||
      [".", ".."].includes(path.posix.basename(releasePath))) {
    throw new Error("ROLLBACK_RELEASE_PATH_INVALID");
  }
  return releasePath;
}

export function webrootSnapshotFiles(releasesRoot, releasePath) {
  assertDirectReleasePath(releasesRoot, releasePath);
  return {
    archive: path.posix.join(releasePath, WEBROOT_ROLLBACK_ARCHIVE),
    digest: path.posix.join(releasePath, WEBROOT_ROLLBACK_DIGEST),
  };
}

// Save the pre-deployment webroot on the release it actually belongs to.
// Keep the original transaction backup until normal transaction cleanup,
// so automatic rollback remains possible if any later phase fails.
export function capturePreviousWebrootScript({ releasesRoot, previousRelease, backupArchive }) {
  const { archive } = webrootSnapshotFiles(releasesRoot, previousRelease);
  const q = shellQuote;
  return [
    "set -eu",
    `test -f ${q(backupArchive)}`,
    `test -f ${q(path.posix.join(previousRelease, "app.js"))}`,
    `test -f ${q(path.posix.join(previousRelease, ".next/BUILD_ID"))}`,
    `cp ${q(backupArchive)} ${q(archive + ".partial")}`,
    `chmod 0600 ${q(archive + ".partial")}`,
    `tar -tzf ${q(archive + ".partial")} >/dev/null`,
    `mv -f ${q(archive + ".partial")} ${q(archive)}`,
    `cd ${q(previousRelease)}`,
    `sha256sum ${q(WEBROOT_ROLLBACK_ARCHIVE)} > ${q(WEBROOT_ROLLBACK_DIGEST + ".partial")}`,
    `chmod 0600 ${q(WEBROOT_ROLLBACK_DIGEST + ".partial")}`,
    `mv -f ${q(WEBROOT_ROLLBACK_DIGEST + ".partial")} ${q(WEBROOT_ROLLBACK_DIGEST)}`,
    `sha256sum --status -c ${q(WEBROOT_ROLLBACK_DIGEST)}`,
  ].join(" && ");
}

export function verifyWebrootSnapshotScript(releasesRoot, releasePath) {
  const { archive } = webrootSnapshotFiles(releasesRoot, releasePath);
  return [
    "set -eu",
    `cd ${shellQuote(releasePath)}`,
    `test -f ${shellQuote(WEBROOT_ROLLBACK_ARCHIVE)}`,
    `test -f ${shellQuote(WEBROOT_ROLLBACK_DIGEST)}`,
    `sha256sum --status -c ${shellQuote(WEBROOT_ROLLBACK_DIGEST)}`,
    `tar -tzf ${shellQuote(archive)} >/dev/null`,
  ].join(" && ");
}

export function restoreWebrootScript(publicRoot, archive) {
  const q = shellQuote;
  return [
    "set -eu",
    `test -d ${q(publicRoot)}`,
    `test -f ${q(archive)}`,
    `tar -tzf ${q(archive)} >/dev/null`,
    `find ${q(publicRoot)} -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +`,
    `tar -xzf ${q(archive)} -C ${q(publicRoot)}`,
  ].join(" && ");
}
