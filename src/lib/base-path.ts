function normalizeBasePath(value: string | undefined) {
  if (!value || value === "/") {
    return "";
  }

  const normalized = `/${value}`.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  if (normalized.split("/").includes("..")) {
    throw new Error("NEXT_PUBLIC_BASE_PATH must not contain parent segments.");
  }
  return normalized;
}

export const appBasePath = normalizeBasePath(
  process.env.NEXT_PUBLIC_BASE_PATH,
);

export function withBasePath(path: string) {
  if (
    !path ||
    path.startsWith("#") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  ) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!appBasePath || normalizedPath === appBasePath || normalizedPath.startsWith(`${appBasePath}/`)) {
    return normalizedPath;
  }

  return `${appBasePath}${normalizedPath}`;
}
