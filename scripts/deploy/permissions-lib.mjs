import { runRemoteCommand } from "./helpers.mjs";

export function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function envFileExpression() {
  return "\\( -name '.env' -o -name '.env.*' \\)";
}

export async function normalizeReleasePermissions(config, releaseRoot) {
  const root = shellEscape(releaseRoot);
  const envExpression = envFileExpression();

  await runRemoteCommand(
    config,
    [
      `test -d ${root}`,
      `find ${root} -xdev -type d -exec chmod 0755 {} +`,
      `find ${root} -xdev -type f -exec chmod 0644 {} +`,
      `find ${root} -xdev -type f ${envExpression} -exec chmod 0600 {} +`,
    ].join(" && "),
  );
}

export async function normalizePublicPermissions(config, publicHtmlPath) {
  const root = shellEscape(publicHtmlPath);

  await runRemoteCommand(
    config,
    [
      `test -d ${root}`,
      `test -z "$(find ${root} -xdev -type f -name '.env*' -print -quit)"`,
      `find ${root} -xdev -type d -exec chmod 0755 {} +`,
      `find ${root} -xdev -type f -exec chmod 0644 {} +`,
    ].join(" && "),
  );
}

export async function auditPermissions(
  config,
  { releaseRoot, publicHtmlPath, expectedOwner },
) {
  const release = shellEscape(releaseRoot);
  const publicHtml = shellEscape(publicHtmlPath);
  const owner = shellEscape(expectedOwner);
  const envExpression = envFileExpression();
  const htaccess = shellEscape(`${publicHtmlPath}/.htaccess`);

  const { stdout } = await runRemoteCommand(
    config,
    [
      "set -eu",
      `test -d ${release}`,
      `test -d ${publicHtml}`,
      `release_group_other_writable=$(find ${release} -xdev -type f -perm /022 -print | wc -l)`,
      `release_bad_directories=$(find ${release} -xdev -type d ! -perm 0755 -print | wc -l)`,
      `release_bad_regular=$(find ${release} -xdev -type f ! ${envExpression} ! -perm 0644 -print | wc -l)`,
      `release_bad_secrets=$(find ${release} -xdev -type f ${envExpression} ! -perm 0600 -print | wc -l)`,
      `release_wrong_owner=$(find ${release} -xdev ! -user ${owner} -print | wc -l)`,
      `public_group_other_writable=$(find ${publicHtml} -xdev -type f -perm /022 -print | wc -l)`,
      `public_bad_directories=$(find ${publicHtml} -xdev -type d ! -perm 0755 -print | wc -l)`,
      `public_bad_files=$(find ${publicHtml} -xdev -type f ! -perm 0644 -print | wc -l)`,
      `public_env_files=$(find ${publicHtml} -xdev -type f -name '.env*' -print | wc -l)`,
      `public_wrong_owner=$(find ${publicHtml} -xdev ! -user ${owner} -print | wc -l)`,
      `htaccess_mode=$(stat -c '%a' ${htaccess})`,
      `htaccess_owner=$(stat -c '%U' ${htaccess})`,
      "printf 'release_group_other_writable=%s\\n' \"$release_group_other_writable\"",
      "printf 'release_bad_directories=%s\\n' \"$release_bad_directories\"",
      "printf 'release_bad_regular=%s\\n' \"$release_bad_regular\"",
      "printf 'release_bad_secrets=%s\\n' \"$release_bad_secrets\"",
      "printf 'release_wrong_owner=%s\\n' \"$release_wrong_owner\"",
      "printf 'public_group_other_writable=%s\\n' \"$public_group_other_writable\"",
      "printf 'public_bad_directories=%s\\n' \"$public_bad_directories\"",
      "printf 'public_bad_files=%s\\n' \"$public_bad_files\"",
      "printf 'public_env_files=%s\\n' \"$public_env_files\"",
      "printf 'public_wrong_owner=%s\\n' \"$public_wrong_owner\"",
      "printf 'htaccess_mode=%s\\n' \"$htaccess_mode\"",
      "printf 'htaccess_owner=%s\\n' \"$htaccess_owner\"",
    ].join(" && "),
  );

  const report = Object.fromEntries(
    stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );

  const numericKeys = [
    "release_group_other_writable",
    "release_bad_directories",
    "release_bad_regular",
    "release_bad_secrets",
    "release_wrong_owner",
    "public_group_other_writable",
    "public_bad_directories",
    "public_bad_files",
    "public_env_files",
    "public_wrong_owner",
  ];

  const failures = numericKeys.filter((key) => Number(report[key] ?? 0) !== 0);
  if (report.htaccess_mode !== "644") {
    failures.push("htaccess_mode");
  }
  if (report.htaccess_owner !== expectedOwner) {
    failures.push("htaccess_owner");
  }

  return { report, failures };
}

export function assertPermissionAudit({ report, failures }) {
  console.table([report]);

  if (failures.length > 0) {
    throw new Error(`Unsafe production permissions detected: ${failures.join(", ")}`);
  }
}
