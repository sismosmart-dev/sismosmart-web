function cpanelErrorCode(error) {
  return String(error?.cause?.code || error?.code || "");
}

export function classifyCpanelHealthError(error) {
  const code = cpanelErrorCode(error);
  const message = String(error?.message || "");

  if (code === "ERR_TLS_CERT_ALTNAME_INVALID") {
    return "TLS_HOSTNAME_MISMATCH";
  }
  if (code.startsWith("ERR_TLS_")) {
    return "TLS_OTHER";
  }
  if (
    error?.name === "TimeoutError" ||
    ["ABORT_ERR", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT"].includes(code)
  ) {
    return "TIMEOUT";
  }
  if (/^CPANEL_[A-Z]+_UAPI_FAILURE$/.test(message)) {
    return "UAPI_FAILURE";
  }

  const httpMatch = message.match(/^CPANEL_[A-Z]+_(\d{3})$/);
  if (httpMatch) {
    const status = Number(httpMatch[1]);
    if (status >= 400 && status < 500) return "HTTP_4XX";
    if (status >= 500 && status < 600) return "HTTP_5XX";
  }

  return "NETWORK_OR_UNKNOWN";
}

export async function fetchCpanelHealthResource(config, moduleName, functionName, fetchImpl) {
  const response = await fetchImpl(
    `${config.cpanelHost}/execute/${moduleName}/${functionName}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `cpanel ${config.sshUser}:${config.cpanelToken}`,
      },
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) {
    throw new Error(`CPANEL_${moduleName.toUpperCase()}_${response.status}`);
  }

  const payload = await response.json();
  if (payload?.status === 0 || payload?.result?.status === 0) {
    throw new Error(`CPANEL_${moduleName.toUpperCase()}_UAPI_FAILURE`);
  }
  return payload;
}

export async function readCpanelHealth({
  config,
  fetchImpl = fetch,
  includeDiagnostics = false,
}) {
  if (!config.cpanelHost || !config.cpanelToken || !config.sshUser) {
    return {
      quotaPayload: null,
      resourcePayload: null,
      warnings: ["cPanel quota/resource usage is unavailable"],
      ...(includeDiagnostics
        ? {
            diagnostics: {
              quota: "CONFIG_UNAVAILABLE",
              resources: "CONFIG_UNAVAILABLE",
            },
          }
        : {}),
    };
  }

  const warnings = [];
  const [quota, resources] = await Promise.allSettled([
    fetchCpanelHealthResource(config, "Quota", "get_quota_info", fetchImpl),
    fetchCpanelHealthResource(config, "ResourceUsage", "get_usages", fetchImpl),
  ]);

  if (quota.status === "rejected") {
    warnings.push("cPanel quota usage could not be read");
  }
  if (resources.status === "rejected") {
    warnings.push("cPanel LVE resource usage could not be read");
  }

  return {
    quotaPayload: quota.status === "fulfilled" ? quota.value : null,
    resourcePayload: resources.status === "fulfilled" ? resources.value : null,
    warnings,
    ...(includeDiagnostics
      ? {
          diagnostics: {
            quota:
              quota.status === "fulfilled"
                ? "SUCCESS"
                : classifyCpanelHealthError(quota.reason),
            resources:
              resources.status === "fulfilled"
                ? "SUCCESS"
                : classifyCpanelHealthError(resources.reason),
          },
        }
      : {}),
  };
}
