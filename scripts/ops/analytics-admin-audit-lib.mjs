export const authDegradedPatterns = [
  /invalid_grant/i,
  /invalid_client/i,
  /unauthorized_client/i,
  /token has been expired or revoked/i,
  /google auth is not configured/i,
  /oauth mode requires/i,
  /insufficient authentication scopes/i,
  /insufficient_permission/i,
  /could not refresh access token/i,
];

export function classifyAdminFailure(stderr = "") {
  const message = String(stderr).trim();
  if (authDegradedPatterns.some((pattern) => pattern.test(message))) {
    return {
      category: "auth-degraded",
      severity: "warning",
      message:
        message.split(/\r?\n/).filter(Boolean).slice(-1)[0] ||
        "Google authentication is unavailable.",
    };
  }

  return {
    category: "command-failure",
    severity: "error",
    message:
      message.split(/\r?\n/).filter(Boolean).slice(-1)[0] ||
      "Administrative resource command failed.",
  };
}

function check(name, passed, details = {}) {
  return { name, passed: Boolean(passed), details };
}

export function validateGoogleAnalyticsStatus(status) {
  return [
    check("GA4 account is accessible", status.verification?.accountAccessible),
    check("GA4 property is accessible", status.verification?.propertyAccessible),
    check("GA4 web stream is accessible", status.verification?.webStreamAccessible),
    check("GA4 measurement ID matches", status.verification?.measurementIdMatches),
  ];
}

export function validateTagManagerStatus(status) {
  return [
    check("GTM container public ID matches", status.verification?.containerPublicIdMatches),
    check("GTM workspace resolved", status.verification?.workspaceResolved),
    check("GTM has at least one tag", status.verification?.tagsPresent, {
      tagCount: Number(status.tagCount || 0),
    }),
    check("GTM tags reference a firing trigger", status.verification?.triggersPresent, {
      triggerCount: Number(status.triggerCount || 0),
    }),
  ];
}

export function validateSearchConsoleStatus(status) {
  return [
    check("Search Console site is accessible", status.verification?.siteAccessible),
    check("Search Console domain is verified", status.verification?.domainVerified),
  ];
}

export function summarizeAdminServices(services) {
  const checks = services.flatMap((service) => service.checks || []);
  const failedChecks = checks.filter((item) => !item.passed);
  const degradedServices = services.filter((service) => service.status === "degraded");
  const failedServices = services.filter((service) => service.status === "failed");

  return {
    ok:
      failedChecks.length === 0 &&
      failedServices.length === 0 &&
      degradedServices.length === 0,
    degraded: degradedServices.length > 0,
    serviceCount: services.length,
    checkCount: checks.length,
    passedChecks: checks.length - failedChecks.length,
    failedChecks: failedChecks.length,
    degradedServices: degradedServices.map((service) => service.service),
    failedServices: failedServices.map((service) => service.service),
  };
}
