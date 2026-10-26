import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

test("package exposes the required local quality and deployment scripts", () => {
  const packageJson = readJson("package.json");
  const requiredScripts = [
    "build",
    "deploy:prepare",
    "deploy:runtime-env",
    "deploy:releases",
    "deploy:server",
    "deploy:smoke",
    "deploy:status",
    "deploy:validate",
    "lint",
    "ops:analytics-admin-audit",
    "ops:analytics-audit",
    "ops:dns-cutover",
    "ops:mail-dns",
    "test",
    "typecheck",
    "verify:post-deploy",
  ];

  for (const script of requiredScripts) {
    assert.equal(
      typeof packageJson.scripts[script],
      "string",
      `${script} is missing`,
    );
  }
});

test("Node runtime and package module mode remain aligned", () => {
  const packageJson = readJson("package.json");
  const pinnedNodeVersion = readText(".nvmrc").trim();
  const qualityWorkflow = readText(".github/workflows/quality-ci.yml");
  const productionWorkflow = readText(".github/workflows/deploy-prod.yml");
  const securityWorkflow = readText(".github/workflows/security.yml");
  const dnsWorkflow = readText(".github/workflows/dns-cutover.yml");
  const analyticsWorkflow = readText(
    ".github/workflows/analytics-observability.yml",
  );
  const deployConfig = readText("scripts/deploy/config.mjs");

  assert.equal(pinnedNodeVersion, "22.18.0");
  assert.equal(packageJson.type, "module");
  assert.equal(packageJson.engines.node, ">=22.13.0 <27");

  for (const workflow of [
    qualityWorkflow,
    productionWorkflow,
    dnsWorkflow,
    analyticsWorkflow,
  ]) {
    assert.match(workflow, /NODE_VERSION: "22\.18\.0"/);
  }
  assert.match(securityWorkflow, /node-version: "22\.18\.0"/);
  assert.match(productionWorkflow, /REMOTE_NODE_VERSION: .*'22\.18\.0'/);
  assert.match(deployConfig, /REMOTE_NODE_VERSION \|\| "22\.18\.0"/);
  const prepareStandalone = readText("scripts/deploy/prepare-standalone.mjs");
  assert.ok(prepareStandalone.includes('import("./server.js")'));
  assert.ok(!prepareStandalone.includes('await import("./server.js")'));
  assert.ok(!prepareStandalone.includes('require("./server.js")'));
  const standaloneSmoke = readText("scripts/deploy/smoke-standalone.mjs");
  assert.ok(standaloneSmoke.includes('require("./app.js")'));
  assert.match(standaloneSmoke, /direct-node/);
  assert.match(standaloneSmoke, /passenger-require/);
  assert.match(qualityWorkflow, /npm run deploy:smoke/);
});

test("Next.js remains configured for cPanel Passenger standalone deployment", () => {
  const nextConfig = readText("next.config.ts");

  assert.match(nextConfig, /output:\s*"standalone"/);
  assert.match(nextConfig, /poweredByHeader:\s*false/);
});

test("localized pages remain eligible for static prerendering", () => {
  const rootLayout = readText("src/app/layout.tsx");
  const cookieConsent = readText("src/components/cookie-consent.tsx");
  const contactForm = readText("src/components/contact-form.tsx");
  const launchInterestForm = readText(
    "src/components/launch-interest-form.tsx",
  );
  const mobileNavigation = readText("src/components/mobile-navigation.tsx");

  assert.doesNotMatch(rootLayout, /next\/headers/);
  assert.doesNotMatch(rootLayout, /\bheaders\(/);
  assert.doesNotMatch(cookieConsent, /["']use client["']/);
  assert.doesNotMatch(contactForm, /["']use client["']/);
  assert.doesNotMatch(launchInterestForm, /["']use client["']/);
  assert.doesNotMatch(mobileNavigation, /["']use client["']/);
  assert.doesNotMatch(mobileNavigation, /@\/lib\/site/);
});

test("contribution guidance follows the production-only Doppler model", () => {
  const contributing = readText("CONTRIBUTING.md");
  assert.match(contributing, /production-only/i);
  assert.match(contributing, /npm run doppler:ci/);
  assert.doesNotMatch(contributing, /npm run dev/);
  assert.doesNotMatch(contributing, /redirects to `\/tr`/i);
  assert.doesNotMatch(contributing, /create (?:a )?persistent \.env/i);
});

test("request routing negotiates Markdown narrowly and defaults HTML to English", () => {
  const nextConfig = readText("next.config.ts");
  const proxy = readText("src/proxy.ts");
  const readme = readText("README.md");
  const sentryEdgeConfig = readText("src/sentry.edge.config.ts");

  assert.match(proxy, /request\.method !== "GET" && request\.method !== "HEAD"/);
  assert.match(proxy, /text\/markdown/);
  assert.match(proxy, /NextResponse\.rewrite/);
  assert.match(proxy, /resolveAgentPage/);
  assert.ok(proxy.includes("api(?:/|$)"));
  assert.doesNotMatch(proxy, /user-agent/i);
  assert.match(
    nextConfig,
    /destination:\s*basePath\s*\?\s*basePath\.concat\(\s*["']\/en["']\s*\)\s*:\s*["']\/en["']/,
  );
  assert.match(readme, /http:\/\/localhost:3000\/en/);
  assert.match(readme, /BASE_URL=https:\/\/sismosmart\.com/);
  assert.doesNotMatch(sentryEdgeConfig, /proxy\.ts/);
});

test("safe env example documents all CI/CD secret keys without values", () => {
  const envExample = readText(".env.example");
  const keys = new Map(
    envExample
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        return [key, valueParts.join("=")];
      }),
  );

  const expectedKeys = [
    "CPANEL_API_TOKEN",
    "CPANEL_API_TOKEN_NAME",
    "CPANEL_HOST",
    "CONTACT_FORM_ENDPOINT",
    "DOMAIN",
    "DNS_ORIGIN_IPV4",
    "DNS_LEGACY_IPV4",
    "SSH_HOST",
    "SSH_PASSWORD",
    "SSH_PORT",
    "SSH_USER",
    "SSH_PRIVATE_KEY_BASE64",
    "SSH_PRIVATE_KEY_PASSPHRASE",
    "GOOGLE_ANALYTICS_ACCOUNT_ID",
    "GOOGLE_ANALYTICS_PROPERTY_DISPLAY_NAME",
    "GOOGLE_ANALYTICS_PROPERTY_ID",
    "GOOGLE_ANALYTICS_WEB_STREAM_DISPLAY_NAME",
    "GOOGLE_ANALYTICS_WEB_STREAM_ID",
    "GOOGLE_AUTH_MODE",
    "GOOGLE_GTM_ACCOUNT_ID",
    "GOOGLE_GTM_CONTAINER_ID",
    "GOOGLE_GTM_WORKSPACE_ID",
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET",
    "GOOGLE_OAUTH_REDIRECT_URI",
    "GOOGLE_OAUTH_REFRESH_TOKEN",
    "FORM_FORWARD_AUTH_TOKEN",
    "GOOGLE_MEASUREMENT_PROTOCOL_API_SECRET",
    "NEXT_PUBLIC_ANALYTICS_ENABLED",
    "NEXT_PUBLIC_CLARITY_ID",
    "NEXT_PUBLIC_GA_ID",
    "NEXT_PUBLIC_GTM_ID",
    "NEXT_PUBLIC_BASE_PATH",
    "PUBLIC_BASE_URL",
    "REMOTE_APP_DOMAIN",
    "REMOTE_APP_ROOT",
    "REMOTE_APP_URI",
    "REMOTE_ORIGIN_HOST",
    "REMOTE_PUBLIC_ROOT",
    "REMOTE_RELEASES_ROOT",
    "DEPLOY_MANAGE_CANONICAL_REDIRECTS",
    "DEPLOY_REQUIRE_FORM_HEALTH",
    "WAITLIST_FORM_ENDPOINT",
    "WRITE_RUNTIME_ENV_FILE",
    "SENTRY_DSN",
  ];

  for (const key of expectedKeys) {
    assert.ok(keys.has(key), `${key} is missing from .env.example`);
    assert.equal(keys.get(key), "", `${key} must not have a committed value`);
  }

  assert.doesNotMatch(
    envExample,
    /replace-me|BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY|gh[pousr]_|doppler_[A-Za-z0-9]/,
  );
  assert.match(envExample, /Public key-name schema only/);
  assert.match(envExample, /Do not create a persistent \.env file/);
  assert.doesNotMatch(envExample, /Put local overrides in \.env/);
});

test("form forwarding configuration remains server-only", () => {
  const envExample = readText(".env.example");
  const forms = readText("src/app/api/_lib/forms.ts");
  const prepareStandalone = readText("scripts/deploy/prepare-standalone.mjs");
  const runtimeEnv = readText("scripts/deploy/runtime-env.mjs");
  const contactRoute = readText("src/app/api/contact/route.ts");
  const waitlistRoute = readText("src/app/api/waitlist/route.ts");

  for (const legacyKey of [
    "NEXT_PUBLIC_CONTACT_FORM_ENDPOINT",
    "NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT",
  ]) {
    assert.doesNotMatch(envExample, new RegExp(legacyKey));
    assert.doesNotMatch(forms, new RegExp(legacyKey));
    assert.doesNotMatch(prepareStandalone, new RegExp(legacyKey));
    assert.doesNotMatch(runtimeEnv, new RegExp(legacyKey));
  }

  assert.match(forms, /process\.env\.CONTACT_FORM_ENDPOINT/);
  assert.match(forms, /process\.env\.WAITLIST_FORM_ENDPOINT/);
  assert.match(contactRoute, /export function GET\(\)/);
  assert.match(waitlistRoute, /export function GET\(\)/);
  assert.match(forms, /readLimitedJsonBody\(request\)/);
  assert.match(forms, /PAYLOAD_TOO_LARGE/);
  assert.match(forms, /cf-connecting-ip/);
  assert.ok(
    forms.indexOf("readLimitedJsonBody(request)") <
      forms.indexOf("isRateLimited(request)"),
    "request body limits must run before the per-client application limiter",
  );

  const validation = readText("src/app/api/_lib/validation.ts");
  assert.match(validation, /maxFormBodyBytes = 32 \* 1024/);
  assert.match(validation, /request\.body\.getReader\(\)/);
  assert.match(validation, /totalBytes > maxBytes/);

  const postDeploy = readText("scripts/post-deploy-verify.sh");
  assert.match(postDeploy, /check_api_payload_limit/);
  assert.match(postDeploy, /expected 413/);
  assert.match(postDeploy, /if ! robots_html="\$\(curl/);
  assert.match(postDeploy, /Failed to fetch English homepage for robots check/);
});

test("Cloudflare security controls remain documented and auditable", () => {
  const runbook = readText("docs/operations/cloudflare-security.md");

  assert.match(runbook, /Minimum visitor TLS version: `1\.2`/);
  assert.match(runbook, /TLS 1\.3: enabled/);
  assert.doesNotMatch(runbook, /\b[a-f0-9]{32}\b/i);
  assert.match(runbook, /20 requests across both form API paths in 10 seconds/);
  assert.match(runbook, /Maximum request body: 32 KiB/);
  assert.match(runbook, /Zone WAF Write/);
  assert.match(runbook, /Analytics Read/);
  assert.match(runbook, /whm/);
  assert.match(runbook, /ftp/);
  assert.match(runbook, /Last externally verified:/);
  assert.match(runbook, /Owner confirmation status/);
  assert.match(runbook, /Review cadence: quarterly/);
  assert.match(runbook, /WHM certificate is currently valid/);
  assert.match(runbook, /FTP TLS hostname mismatch/);
});

test("mail DNS monitoring preserves staged DMARC enforcement", () => {
  const config = readJson("config/mail-dns.json");
  const workflow = readText(".github/workflows/mail-dns.yml");
  const audit = readText("scripts/ops/mail-dns.mjs");
  const runbook = readText("docs/operations/mail-dns.md");

  assert.equal(config.mx.exchange, "mail.sismosmart.com");
  assert.equal(config.dmarc.minimumPolicy, "none");
  assert.equal(config.dmarc.reportMailbox, "info@sismosmart.com");
  assert.equal(config.spf.requiredInclude, "include:relay.mailbaby.net");
  assert.equal(config.dkim.minimumRsaBits, 2048);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /npm run ops:mail-dns/);
  assert.match(audit, /DMARC enforcement observation/);
  assert.match(audit, /inspectStartTls/);
  assert.match(runbook, /p=none/);
  assert.match(runbook, /quarantine/);
  assert.match(runbook, /reject/);
  assert.match(runbook, /Rollback/);
  assert.doesNotMatch(runbook, /\b[a-f0-9]{32}\b/i);
  assert.doesNotMatch(runbook, /\b\d+ mailboxes? (?:are|is) configured\b/i);
});

test("analytics observability uses canonical public config and fail-closed consent", () => {
  const config = readJson("config/analytics.json");
  const consent = readText("src/components/cookie-consent.tsx");
  const formScript = readText("src/components/json-form-script.tsx");
  const contactForm = readText("src/components/contact-form.tsx");
  const waitlistForm = readText("src/components/launch-interest-form.tsx");
  const pilotForm = readText("src/components/pilot-program-form.tsx");
  const production = readText(".github/workflows/deploy-prod.yml");
  const quality = readText(".github/workflows/quality-ci.yml");
  const workflow = readText(".github/workflows/analytics-observability.yml");
  const runbook = readText("docs/operations/analytics-observability.md");

  assert.equal(config.canonicalSource, "config/analytics.json");
  assert.equal(config.consent.defaultState, "denied");
  assert.equal(config.events.formSuccess, "sismosmart_form_success");
  assert.match(config.googleTagManager.accountId, /^\d+$/);
  assert.match(config.googleTagManager.containerId, /^\d+$/);
  assert.match(config.googleTagManager.workspaceId, /^\d+$/);
  assert.deepEqual(config.locales, ["en", "tr", "es", "id", "pt", "it"]);

  assert.match(consent, /consent.*default.*denied/);
  assert.match(consent, /consentv2/);
  assert.match(consent, /clearClarityCookies/);
  assert.ok(consent.includes("sismosmart-gtm-loader"));
  assert.ok(consent.includes("sismosmart-ga-loader"));
  assert.ok(
    consent.indexOf("if (config.gtmId)") < consent.indexOf("if (config.gaId)"),
    "GTM must own the primary production loading path",
  );
  const gtmBranch = consent.match(
    /if \(config\.gtmId\) \{([\s\S]*?)\r?\n      return;\r?\n    \}/,
  )?.[1];
  assert.ok(gtmBranch, "GTM loading branch must remain explicit");
  assert.match(
    gtmBranch,
    /if \(document\.getElementById\("sismosmart-gtm-loader"\)\) return;/,
    "GTM bootstrap must guard the GA config command and loader together",
  );
  assert.equal(
    (gtmBranch.match(/window\.gtag\("config"/g) || []).length,
    1,
    "GTM bootstrap must queue exactly one GA config command",
  );
  assert.match(
    gtmBranch,
    /if \(config\.gaId\) \{[\s\S]*?window\.gtag\("js", new Date\(\)\);[\s\S]*?window\.gtag\("config", config\.gaId,[\s\S]*?send_page_view: true/,
    "GTM bootstrap must queue the consented GA page view before loading the container",
  );
  assert.match(
    consent,
    /if \(config\.gaId\) \{[\s\S]*?window\.gtag\("js", new Date\(\)\);[\s\S]*?window\.gtag\("config", config\.gaId,[\s\S]*?send_page_view: true/,
    "GA-only fallback must retain its direct page-view configuration",
  );
  const analyticsAudit = readText("scripts/ops/analytics-audit.mjs");
  assert.match(analyticsAudit, /getLogicalPageViewEvidence/);
  assert.match(analyticsAudit, /GTM loader network fanout/);
  assert.match(analyticsAudit, /networkFanoutBounded/);
  assert.match(formScript, /sismosmart_form_success/);
  assert.ok(formScript.includes("analytics?.track"));
  assert.match(contactForm, /data-analytics-form="contact"/);
  assert.match(waitlistForm, /data-analytics-form="waitlist"/);
  assert.match(pilotForm, /data-analytics-form="pilot_program"/);

  assert.match(production, /NEXT_PUBLIC_ANALYTICS_ENABLED: "true"/);
  assert.match(quality, /NEXT_PUBLIC_ANALYTICS_ENABLED: "true"/);
  assert.ok(production.includes("vars.NEXT_PUBLIC_GA_ID"));
  assert.ok(!production.includes("secrets.NEXT_PUBLIC_GA_ID"));
  assert.match(workflow, /dopplerhq\/cli-action@014df23b1329b615816a38eb5f473bb9000700b1/);
  const workflowLines = workflow.split("\n");
  assert.equal(
    workflowLines.filter((line) => line.startsWith("      DOPPLER_TOKEN:")).length,
    0,
    "the bootstrap token must not be exposed at job scope",
  );
  assert.equal(
    workflowLines.filter((line) => line.startsWith("          DOPPLER_TOKEN:")).length,
    4,
    "only the four Doppler-consuming steps may receive the bootstrap token",
  );
  assert.match(workflow, /DOPPLER_TOKEN: \$\{\{ secrets\.DOPPLER_TOKEN_PRD_OPS \}\}/);
  assert.match(workflow, /DOPPLER_PROJECT: "sismosmart-web"/);
  assert.match(workflow, /DOPPLER_CONFIG: "prd_ops"/);
  assert.match(workflow, /npm run doppler:check -- --doppler prd_ops/);
  assert.match(workflow, /doppler run --project "\$DOPPLER_PROJECT" --config "\$DOPPLER_CONFIG" -- npm run --silent ops:status/);
  assert.match(workflow, /doppler run --project "\$DOPPLER_PROJECT" --config "\$DOPPLER_CONFIG" --\s+npm run ops:analytics-admin-audit/);
  assert.match(workflow, /doppler run --project "\$DOPPLER_PROJECT" --config "\$DOPPLER_CONFIG" --\s+npm run ops:analytics-audit/);
  assert.doesNotMatch(workflow, /vars\.(?:NEXT_PUBLIC|GOOGLE_|CLARITY_)/);
  assert.doesNotMatch(workflow, /secrets\.(?:GOOGLE_|CLARITY_)/);
  assert.ok(workflow.includes("always()"));
  assert.match(workflow, /schedule:/);
  assert.match(runbook, /GTM owns/);
  assert.match(runbook, /OAuth refresh token/);
  assert.match(runbook, /auth-degraded/);
  assert.match(runbook, /Rollback/);
});

test("production CSP supports Cloudflare browser insights without console errors", () => {
  const nextConfig = readText("next.config.ts");

  assert.match(nextConfig, /https:\/\/static\.cloudflareinsights\.com/);
  assert.match(nextConfig, /https:\/\/cloudflareinsights\.com/);
});

test("product hero requests its LCP device image eagerly", () => {
  const productVisual = readText("src/components/product-visual.tsx");
  const productPage = readText("src/components/localized-pages/product-page.tsx");

  assert.match(
    productVisual,
    /fetchPriority=\{priority \|\| !compact \? "high"/,
  );
  assert.match(productVisual, /priority=\{priority \|\| !compact\}/);
  assert.match(productVisual, /unoptimized=\{compact\}/);
  assert.match(
    productVisual,
    /withBasePath\("\/images\/device\/sismosmart-device-front-320\.webp"\)/,
  );
  assert.match(
    productVisual,
    /withBasePath\("\/images\/device\/sismosmart-device-front-640\.webp"\)/,
  );
  assert.match(productVisual, /320w/);
  assert.match(productVisual, /640w/);
  assert.match(productVisual, /loading=\{priority \? "eager" : "lazy"\}/);
  assert.match(productVisual, /\{!compact \? \(/);

  const globalCss = readText("src/app/globals.css");
  assert.match(
    globalCss,
    /\.product-panel--compact \.product-panel__image[\s\S]*?filter: none/,
  );
  assert.match(
    globalCss,
    /\.product-panel--compact \.product-panel__meter[\s\S]*?backdrop-filter: none/,
  );
  assert.match(
    productPage,
    /meterTopValue=\{page\.meterTopValue\}\s+priority/,
  );

  const lighthouseWorkflow = readText(".github/workflows/lighthouse.yml");
  assert.match(lighthouseWorkflow, /curl --compressed/);
});

test("production deployment remains transactional and manual-only", () => {
  const deploy = readText("scripts/deploy/deploy-server.mjs");
  const transaction = readText("scripts/deploy/transaction.mjs");
  const transactionTests = readText("tests/deploy-transaction.test.mjs");
  const workflow = readText(".github/workflows/deploy-prod.yml");
  const runbook = readText("docs/operations/production-deployment.md");

  assert.match(deploy, /runDeploymentTransaction/);
  assert.match(deploy, /\.partial/);
  assert.match(deploy, /RELEASE_PREPARED_FILE/);
  assert.match(deploy, /RELEASE_READY_FILE/);
  assert.match(deploy, /writeReleaseMetadata/);
  assert.match(deploy, /enforceReleaseRetention/);
  assert.match(deploy, /sha256sum -c/);
  assert.match(deploy, /DEPLOY_RECOVERY_REQUIRED/);
  assert.match(deploy, /--connect-to/);
  assert.match(deploy, /PassengerAppRoot mismatch/);
  assert.match(deploy, /PassengerNodejs/);
  assert.match(deploy, /\$2 == "next-server"/);
  assert.match(deploy, /Discovered runtime is not a Node\.js executable/);
  assert.match(deploy, /if test -L .*readlink -f/);
  assert.match(
    deploy,
    /config\.requireFormHealth \? `[\s\S]*contact=.*api\/contact[\s\S]*waitlist=.*api\/waitlist/,
  );
  assert.doesNotMatch(deploy, /args= \| awk/);
  assert.match(deploy, /gsub\(\/\^"\|"\$\//);
  assert.doesNotMatch(deploy, /canonicalHost}:443:127\.0\.0\.1/);
  assert.match(transaction, /rollback-complete/);
  assert.ok(
    transaction.includes(`failurePointMatches(failurePoint, phase, "after")`),
  );
  assert.match(transactionTests, /after-activate/);
  assert.match(workflow, /validate-deploy/);
  assert.match(workflow, /inputs\.operation == 'status'/);
  assert.match(workflow, /inputs\.operation == 'retention'/);
  assert.match(workflow, /npm run deploy:releases/);
  assert.match(workflow, /npm run deploy:status/);
  assert.doesNotMatch(workflow, /push:\s*\n\s*branches:\s*\n\s*- main/);
  assert.match(runbook, /Manual recovery/);
  assert.match(runbook, /DEPLOY_RECOVERY_REQUIRED/);
});

test("public SEO and PWA assets required by post-deploy checks exist", () => {
  const requiredFiles = [
    "public/images/icons/favicon.ico",
    "src/app/robots.ts",
    "src/app/sitemap.ts",
    "src/app/site.webmanifest/route.ts",
    "src/app/manifest.json/route.ts",
  ];

  for (const relativePath of requiredFiles) {
    assert.ok(
      fs.existsSync(path.join(rootDir, relativePath)),
      `${relativePath} is missing`,
    );
  }
});

test("optimized SismoSmart device imagery is available for premium pages", () => {
  const requiredFiles = [
    "public/images/device/sismosmart-device-hero.webp",
    "public/images/device/sismosmart-device-front.webp",
    "public/images/device/sismosmart-device-front-320.webp",
    "public/images/device/sismosmart-device-front-640.webp",
    "public/images/device/sismosmart-device-side.webp",
    "public/images/device/sismosmart-device-low-profile.webp",
    "public/images/device/sismosmart-device-installation.webp",
  ];

  for (const relativePath of requiredFiles) {
    assert.ok(
      fs.existsSync(path.join(rootDir, relativePath)),
      `${relativePath} is missing`,
    );
  }
});

test("Lighthouse production baseline uses observed browser throttling", () => {
  const lighthouse = readJson(".lighthouserc.json");

  assert.equal(lighthouse.ci.collect.numberOfRuns, 3);
  assert.equal(lighthouse.ci.collect.settings.throttlingMethod, "devtools");
  assert.equal(
    lighthouse.ci.assert.assertions["categories:performance"][1].minScore,
    0.9,
  );
  for (const assertion of Object.values(lighthouse.ci.assert.assertions)) {
    assert.equal(assertion[1].aggregationMethod, "median");
  }
});

test("DNS cutover audit protects delegation, origin services, and legacy isolation", () => {
  const config = readJson("config/dns-cutover.json");
  const audit = readText("scripts/ops/dns-cutover.mjs");
  const auditLib = readText("scripts/ops/dns-cutover-lib.mjs");
  const workflow = readText(".github/workflows/dns-cutover.yml");
  const runbook = readText("docs/operations/dns-cutover.md");

  assert.deepEqual(config.expectedNameservers, [
    "dane.ns.cloudflare.com",
    "ryleigh.ns.cloudflare.com",
  ]);
  assert.equal(config.originIpv4, undefined);
  assert.equal(config.legacyIpv4, undefined);
  assert.match(audit, /hydrateNetworkConfig/);
  assert.match(workflow, /DNS_ORIGIN_IPV4: \${\{ secrets\.DNS_ORIGIN_IPV4 \}\}/);
  assert.match(workflow, /DNS_LEGACY_IPV4: \${\{ secrets\.DNS_LEGACY_IPV4 \}\}/);
  assert.match(audit, /registry delegation/);
  assert.match(audit, /no current DNS answer references legacy IPv4/);
  assert.match(auditLib, /isolated-provider-catch-all/);
  assert.match(workflow, /npm run ops:dns-cutover/);
  assert.match(workflow, /schedule:/);
  assert.match(runbook, /Rollback procedure/);
  assert.match(runbook, /Never point apex or `www` to the retired origin/i);
});

test("governance workflows gate production in a production-only repository", () => {
  const production = readText(".github/workflows/deploy-prod.yml");
  const mainline = readText(".github/workflows/mainline-policy.yml");
  const mainlineVerifier = readText("scripts/ci/verify-mainline-pr-origin.mjs");
  const deployConfig = readText("scripts/deploy/config.mjs");
  const deployServer = readText("scripts/deploy/deploy-server.mjs");
  const governance = readText("docs/operations/repository-governance.md");
  const packageJson = readJson("package.json");

  assert.match(production, /expected_sha:/);
  assert.match(production, /deploy-production/);
  assert.match(production, /validate-production/);
  assert.match(production, /git rev-parse origin\/main/);
  assert.doesNotMatch(production, /(^|\n)\s*push:/);
  assert.match(mainline, /node scripts\/ci\/verify-mainline-pr-origin\.mjs/);
  assert.match(mainlineVerifier, /commits\/\$\{commitSha\}\/pulls/);
  assert.match(mainlineVerifier, /not associated with a merged pull request/);
  assert.match(mainlineVerifier, /attempts = DEFAULT_ATTEMPTS/);
  assert.match(deployConfig, /remoteAppDomain:/);
  assert.match(deployServer, /preflightMount/);
  assert.equal(packageJson.scripts["staging:bootstrap"], undefined);
  assert.equal(fs.existsSync(path.join(rootDir, ".github/workflows/deploy-staging.yml")), false);
  assert.equal(fs.existsSync(path.join(rootDir, "scripts/deploy/staging-bootstrap.mjs")), false);
  assert.match(governance, /production-only/i);
  assert.match(governance, /single administrator/);
});

test("production health runbook documents thresholds, privacy, and fault isolation", () => {
  const runbook = readText("docs/operations/production-health.md");
  const deployment = readText("docs/operations/production-deployment.md");

  for (const faultDomain of [
    "release-state",
    "dns",
    "cloudflare-edge",
    "origin-passenger",
    "application-form-runtime",
    "capacity",
    "github-actions",
  ]) {
    assert.match(runbook, new RegExp(`\\b${faultDomain}\\b`));
  }

  assert.match(runbook, /public warm TTFB[^\n]*1,500 ms/i);
  assert.match(runbook, /origin warm TTFB[^\n]*1,200 ms/i);
  assert.match(runbook, /filesystem[^\n]*85%[^\n]*95%/i);
  assert.match(runbook, /account quota[^\n]*80%[^\n]*90%/i);
  assert.match(runbook, /release count[^\n]*8[^\n]*12/i);
  assert.match(runbook, /release storage[^\n]*1 GiB[^\n]*2 GiB/i);
  assert.match(runbook, /five or more[^\n]*20%/i);
  assert.match(runbook, /two consecutive completed runs/i);
  assert.match(runbook, /does not collect[^\n]*(payload|personal data)/i);
  assert.match(runbook, /LVE/i);
  assert.match(runbook, /hosting provider/i);
  assert.match(runbook, /read-only/i);
  assert.match(runbook, /PRODUCTION_HEALTH_SAFE/);
  assert.match(runbook, /artifact quota/i);
  assert.match(deployment, /production-health\.md/);
});

test("localized layout synchronizes the document language for browser accessibility", () => {
  const rootLayout = readText("src/app/layout.tsx");
  const localeLayout = readText("src/app/[locale]/layout.tsx");

  assert.match(rootLayout, /<html[\s\S]*suppressHydrationWarning/);
  assert.match(localeLayout, /document\.documentElement\.lang/);
  assert.match(localeLayout, /document-language-\$\{locale\}/);
});

test("production health monitoring is scheduled, least-privilege, and storage-safe", () => {
  const workflow = readText(".github/workflows/production-health.yml");
  const packageJson = readJson("package.json");

  assert.match(workflow, /cron:\s*["']17 \*\/6 \* \* \*["']/);
  assert.match(
    workflow,
    /permissions:\s*\r?\n\s+actions:\s*read\r?\n\s+contents:\s*read/,
  );
  assert.match(workflow, /NODE_VERSION:\s*["']22\.18\.0["']/);
  assert.match(workflow, /npm run ops:production-health/);
  assert.match(
    workflow,
    /PRODUCTION_HEALTH_OUTPUT:\s*\.artifacts\/production-health\.json/,
  );
  assert.match(workflow, /retention-days:\s*14/);
  assert.match(
    workflow,
    /- name: Upload production health report\r?\n\s+if: \$\{\{ always\(\) \}\}\r?\n\s+continue-on-error: true/,
  );
  assert.equal(
    packageJson.scripts["ops:production-health"],
    "node scripts/ops/production-health.mjs",
  );
  assert.match(packageJson.scripts.test, /tests\/production-health\.test\.mjs/);
  assert.match(
    packageJson.scripts["test:coverage"],
    /tests\/production-health\.test\.mjs/,
  );
});

test("GitHub Actions artifact policy preserves audit health and limits storage", () => {
  const qualityCi = readText(".github/workflows/quality-ci.yml");
  const dnsAudit = readText(".github/workflows/dns-cutover.yml");
  const mailAudit = readText(".github/workflows/mail-dns.yml");
  const analyticsAudit = readText(
    ".github/workflows/analytics-observability.yml",
  );
  const lighthouse = readText(".github/workflows/lighthouse.yml");

  assert.match(lighthouse, /uploadArtifacts: false/);
  assert.match(lighthouse, /temporaryPublicStorage: true/);

  assert.match(
    qualityCi,
    /- name: Upload standalone artifact\r?\n\s+if: \$\{\{ github\.ref == 'refs\/heads\/main' \|\| github\.event_name == 'workflow_dispatch' \}\}\r?\n\s+continue-on-error: true/,
  );
  assert.match(qualityCi, /retention-days:\s*3/);

  assert.match(
    dnsAudit,
    /- name: Upload DNS cutover report\r?\n\s+if: \$\{\{ always\(\) \}\}\r?\n\s+continue-on-error: true/,
  );
  assert.match(dnsAudit, /retention-days:\s*14/);

  assert.match(
    mailAudit,
    /- name: Upload mail DNS report\r?\n\s+if: \$\{\{ always\(\) \}\}\r?\n\s+continue-on-error: true/,
  );
  assert.match(mailAudit, /retention-days:\s*14/);

  assert.match(
    analyticsAudit,
    /- name: Upload analytics observability report\r?\n\s+if: \$\{\{ always\(\) \}\}\r?\n\s+continue-on-error: true/,
  );
  assert.match(analyticsAudit, /retention-days:\s*14/);
});


test("GitHub-hosted Ubuntu jobs pin the reviewed runner image", () => {
  const workflowDir = path.join(rootDir, ".github/workflows");
  const workflowFiles = fs
    .readdirSync(workflowDir)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"));
  const ubuntuJobs = [];

  for (const name of workflowFiles) {
    const workflow = readText(path.join(".github/workflows", name));
    assert.doesNotMatch(
      workflow,
      /runs-on:[ \t]*ubuntu-latest/,
      name + " must not follow the moving ubuntu-latest label",
    );
    for (const match of workflow.matchAll(/runs-on:[ \t]*(ubuntu-[^ \t\r\n#]+)/g)) {
      ubuntuJobs.push([name, match[1]]);
    }
  }

  assert.ok(ubuntuJobs.length > 0, "expected GitHub-hosted Ubuntu jobs");
  for (const [name, runner] of ubuntuJobs) {
    assert.equal(runner, "ubuntu-24.04", name + " uses an unreviewed Ubuntu image");
  }

  const policy = readText("docs/cicd-automation.md");
  assert.match(policy, /ubuntu-24.04/i);
  assert.match(policy, /Ubuntu 26/i);
  assert.match(policy, /separate.*validat/i);
});

test("GitHub automation files are present", () => {
  const requiredFiles = [
    ".github/CODEOWNERS",
    ".github/workflows/quality-ci.yml",
    ".github/workflows/deploy-prod.yml",
    ".github/workflows/dns-cutover.yml",
    ".github/workflows/github-release.yml",
    ".github/workflows/security.yml",
    ".github/workflows/analytics-observability.yml",
    ".github/workflows/lighthouse.yml",
    ".github/workflows/mail-dns.yml",
    ".github/workflows/pr-commitlint.yml",
    ".github/PULL_REQUEST_TEMPLATE.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "commitlint.config.mjs",
    "renovate.json",
  ];

  for (const relativePath of requiredFiles) {
    assert.ok(
      fs.existsSync(path.join(rootDir, relativePath)),
      `${relativePath} is missing`,
    );
  }

  const codeowners = readText(".github/CODEOWNERS");
  assert.match(codeowners, /@SismoSmart/);
  assert.doesNotMatch(codeowners, /@oaslananka\b/i);

  const renovate = readJson("renovate.json");
  assert.ok(renovate.extends.includes("helpers:pinGitHubActionDigests"));
  assert.doesNotMatch(JSON.stringify(renovate), /sismosmart-dev|oaslananka\/.github/i);
});

test("product comparison remains keyboard-scrollable on narrow viewports", async () => {
  const productPage = readText("src/components/localized-pages/product-page.tsx");
  assert.match(
    productPage,
    /aria-label=\{page\.comparisonTitle\}[\s\S]*className="mt-8 overflow-x-auto"[\s\S]*tabIndex=\{0\}/,
  );
});

test("browser accessibility checks run in CI with a pinned local browser", () => {
  const packageJson = readJson("package.json");
  assert.match(packageJson.scripts["browser:install"], /chrome-headless-shell@150\.0\.7871\.24/);
  assert.equal(packageJson.scripts["test:browser"], "node scripts/test/browser-quality.mjs");
  const workflow = readText(".github/workflows/quality-ci.yml");
  assert.match(workflow, /browser:\n\s+name: ci\/browser/);
  assert.match(workflow, /npm run browser:install/);
  assert.match(workflow, /--install-deps/);
  assert.match(workflow, /npm run test:browser/);
  assert.match(workflow, /browser-quality-failure-/);
  assert.match(workflow, /retention-days: 3/);
});

test("browser runner is portable, animation-stable, and retry-safe", () => {
  const runner = readText("scripts/test/browser-quality.mjs");
  const forms = readText("scripts/test/browser-quality-forms.mjs");
  const pageQuality = readText("scripts/test/browser-quality-page.mjs");
  const server = readText("scripts/test/browser-quality-server.mjs");
  assert.match(runner, /fileURLToPath/);
  assert.doesNotMatch(runner, /new URL\(import\.meta\.url\)\.pathname/);
  assert.match(pageQuality, /prefers-reduced-motion/);
  assert.match(pageQuality, /document\.fonts\?\.ready/);
  assert.match(server, /MAX_APP_START_ATTEMPTS/);
  assert.match(server, /isAddressInUseFailure/);
  assert.match(forms, /new URL\(value, window\.location\.origin\)/);
  assert.match(forms, /\/invalid-url/);

  const governance = readText("tests/seo-governance.test.mjs");
  assert.match(governance, /fileURLToPath/);
  assert.doesNotMatch(
    governance,
    /new URL\("\.\.", import\.meta\.url\)\.pathname/,
  );
});

test("guide markdown negotiation files exist and are self-contained", () => {
  assert.ok(
    fs.existsSync(path.join(rootDir, "src/lib/guides/markdown.ts")),
    "src/lib/guides/markdown.ts must exist",
  );
  assert.ok(
    fs.existsSync(path.join(rootDir, "src/app/markdown/guides/[locale]/route.ts")),
    "src/app/markdown/guides/[locale]/route.ts must exist",
  );
  assert.ok(
    fs.existsSync(path.join(rootDir, "src/app/markdown/guides/[locale]/[slug]/route.ts")),
    "src/app/markdown/guides/[locale]/[slug]/route.ts must exist",
  );
  const markdownSource = readText("src/lib/guides/markdown.ts");
  assert.doesNotMatch(markdownSource, /import.*fetch|node-fetch|axios/, "markdown.ts must not fetch HTML over HTTP");
  assert.doesNotMatch(markdownSource, /user-agent/i, "markdown.ts must not detect user agents");
  assert.match(markdownSource, /GuideHubCopy|GuideContent/, "markdown.ts must use GuideHubCopy or GuideContent");
});

test("guide hub metadata advertises text/markdown alternate", () => {
  const source = readText("src/lib/guides/metadata.ts");
  assert.match(
    source,
    /"text\/markdown"/,
    "metadata.ts must advertise text/markdown in alternates.types",
  );
  assert.match(
    source,
    /types\s*:\s*\{/,
    "metadata.ts must include types block in alternates",
  );
});

test("proxy validates guide slugs via getGuideBySlug", () => {
  const source = readText("src/proxy.ts");
  assert.match(source, /getGuideBySlug/, "proxy.ts must import and use getGuideBySlug");
  assert.match(source, /isGuideLocale/, "proxy.ts must validate locale via isGuideLocale");
});

test("vulnerable transitive dependency paths use patched compatibility releases", () => {
  const compareVersions = (left, right) => {
    const leftParts = left.split(".").map(Number);
    const rightParts = right.split(".").map(Number);
    for (let index = 0; index < 3; index += 1) {
      const delta = (leftParts[index] || 0) - (rightParts[index] || 0);
      if (delta !== 0) return delta;
    }
    return 0;
  };

  const packageJson = readJson("package.json");
  assert.equal(
    compareVersions(packageJson.overrides?.postcss || "0.0.0", "8.5.18") >= 0,
    true,
    `Unsafe postcss override: ${packageJson.overrides?.postcss}`,
  );
  assert.equal(
    packageJson.dependencies?.["brace-expansion"],
    "file:vendor/brace-expansion-compat",
  );
  assert.equal(
    packageJson.overrides?.minimatch?.["brace-expansion"],
    "$brace-expansion",
  );
  assert.equal(packageJson.overrides?.["minimatch@3.1.5"], undefined);
  assert.equal(packageJson.overrides?.["minimatch@10.2.5"], undefined);

  const compatPackage = readJson("vendor/brace-expansion-compat/package.json");
  assert.equal(compatPackage.name, "brace-expansion");
  assert.equal(compareVersions(compatPackage.version, "5.0.9") >= 0, true);
  assert.equal(
    compatPackage.dependencies?.["brace-expansion-upstream"],
    "npm:brace-expansion@5.0.12",
  );

  const compatModule = readText("vendor/brace-expansion-compat/index.js");
  assert.match(compatModule, /require\("brace-expansion-upstream"\)/);
  assert.match(compatModule, /module\.exports = expand/);
  assert.match(compatModule, /module\.exports\.expand = expand/);

  const lock = readJson("package-lock.json");
  const braceVersions = Object.values(lock.packages || {})
    .filter((metadata) => metadata.name === "brace-expansion" && metadata.version)
    .map((metadata) => metadata.version);
  assert.ok(braceVersions.length > 0, "No brace-expansion instances found in lockfile");
  for (const version of braceVersions) {
    assert.equal(
      compareVersions(version, "5.0.9") >= 0,
      true,
      `Vulnerable brace-expansion version found: ${version}`,
    );
  }

  const postcssVersions = Object.entries(lock.packages || {})
    .filter(
      ([name]) =>
        name === "node_modules/postcss" || name.endsWith("/node_modules/postcss"),
    )
    .map(([, metadata]) => metadata.version);
  assert.ok(postcssVersions.length > 0, "No postcss instances found in lockfile");
  for (const version of postcssVersions) {
    assert.equal(
      compareVersions(version, "8.5.18") >= 0,
      true,
      `Vulnerable postcss version found: ${version}`,
    );
  }
});


test("Search Console performance library is pure and exports safe aggregation and date interfaces", () => {
  const libPath = path.join(
    rootDir,
    "scripts/ops/search-console-performance-lib.mjs",
  );
  assert.ok(
    fs.existsSync(libPath),
    "search-console-performance-lib.mjs must exist",
  );

  const source = readText("scripts/ops/search-console-performance-lib.mjs");
  for (const name of [
    "normalizeSearchConsoleRows",
    "isBrandQuery",
    "parseSearchConsoleDate",
    "resolvePerformancePeriod",
    "getPreviousPerformancePeriod",
    "summarizePerformance",
  ]) {
    assert.match(
      source,
      new RegExp(`export function ${name}`),
      `${name} must be exported directly`,
    );
  }
  assert.doesNotMatch(source, /googleapis|process\.env|node:fs|writeFile|appendFile/);
  assert.match(source, /getUTCFullYear\(\)/);
  assert.match(source, /Date\.UTC\(/);
  assert.match(source, /formatUtcDate\(date\) !== value/);
});

test("Search Console CLI advertises the safe performance command", () => {
  const source = readText("scripts/ops/search-console.mjs");

  assert.match(
    source,
    /performance \[startDate\] \[endDate\] \[--compare\]/,
  );
  assert.match(source, /case "performance"/);
  assert.match(source, /runPerformance\(firstArg, secondArg, options\.compare\)/);
  assert.match(source, /search-console-performance-lib\.mjs/);
});

test("Search Console performance auth uses only the readonly Webmaster scope", () => {
  const source = readText("scripts/ops/search-console.mjs");
  const start = source.indexOf("async function runPerformance(");
  const end = source.indexOf("\nasync function main()", start);
  assert.ok(start >= 0 && end > start, "runPerformance block must be found");
  const block = source.slice(start, end);

  assert.match(
    block,
    /https:\/\/www\.googleapis\.com\/auth\/webmasters\.readonly/,
  );
  assert.doesNotMatch(block, /GOOGLE_SCOPES\.searchConsole\b/);
  assert.doesNotMatch(block, /authMode|siteUrl\s*:/);
});

test("Search Analytics request keeps siteUrl top-level and only safe fields in requestBody", () => {
  const source = readText("scripts/ops/search-console.mjs");
  const start = source.indexOf("async function querySearchAnalytics(");
  const end = source.indexOf("\nasync function queryPerformanceDataset(", start);
  assert.ok(start >= 0 && end > start, "querySearchAnalytics block must be found");
  const block = source.slice(start, end);

  assert.match(block, /const requestBody = \{/);
  assert.match(block, /searchType:\s*"web"/);
  assert.match(block, /rowLimit:\s*25000/);
  assert.match(
    block,
    /searchanalytics\.query\(\{\s*siteUrl:\s*site,\s*requestBody,\s*\}\)/s,
  );
  const bodyStart = block.indexOf("const requestBody = {");
  const bodyEnd = block.indexOf("};", bodyStart);
  assert.doesNotMatch(block.slice(bodyStart, bodyEnd), /siteUrl/);
});

test("Search Console performance requests totals, query, page, and country datasets only", () => {
  const source = readText("scripts/ops/search-console.mjs");
  const start = source.indexOf("async function queryPerformanceDataset(");
  const end = source.indexOf("\nasync function runPerformance(", start);
  assert.ok(start >= 0 && end > start, "queryPerformanceDataset block must be found");
  const block = source.slice(start, end);

  assert.equal(
    (block.match(/querySearchAnalytics\(/g) || []).length,
    4,
    "each period must issue exactly four Search Analytics reads",
  );
  for (const dimensions of ["[]", '["query"]', '["page"]', '["country"]']) {
    assert.ok(block.includes(dimensions), `${dimensions} query is missing`);
  }
  assert.doesNotMatch(block, /sites\.add|sitemaps\.submit|webResource|urlInspection|indexing/i);
});

test("Search Console performance path resolves safe dates, optional comparison, and prints only summary", () => {
  const source = readText("scripts/ops/search-console.mjs");
  const start = source.indexOf("async function runPerformance(");
  const end = source.indexOf("\nasync function main()", start);
  const block = source.slice(start, end);

  assert.match(block, /resolvePerformancePeriod\(\{/);
  assert.match(block, /getPreviousPerformancePeriod\(/);
  assert.match(block, /compare === true \|\| compare === "true"/);
  assert.match(block, /printJson\(\s*summarizePerformance\(\{/s);
  assert.doesNotMatch(
    block,
    /sites\.add|sitemaps\.submit|webResource|urlInspection|indexing|writeFile|appendFile/i,
  );
  assert.doesNotMatch(block, /authMode|rawResponse|headers|credentials|token/i);
});

test("Search Console performance documentation preserves the Doppler and privacy boundary", () => {
  const runbook = readText("docs/operations/analytics-observability.md");

  const normalizedRunbook = runbook.toLowerCase();
  for (const phrase of [
    "sismosmart-web",
    "prd_ops",
    "read-only",
    "Search Analytics query",
    "28-day",
    "three days",
    "immediately preceding equal-length period",
    "does not persist private reports",
    "https://www.googleapis.com/auth/webmasters.readonly",
  ]) {
    assert.ok(normalizedRunbook.includes(phrase.toLowerCase()), `Runbook must include ${phrase}`);
  }
  assert.doesNotMatch(runbook, /performance[^\n]*searchConsole OAuth scope/i);
});

test("production health capacity diagnostics are manual and opt-in", () => {
  const workflow = readText(".github/workflows/production-health.yml");

  assert.match(
    workflow,
    /workflow_dispatch:\s*\r?\n\s+inputs:\s*\r?\n\s+capacity_diagnostics:/,
  );
  assert.match(workflow, /capacity_diagnostics:[\s\S]*type:\s*boolean/);
  assert.match(workflow, /capacity_diagnostics:[\s\S]*default:\s*false/);
  assert.match(
    workflow,
    /PRODUCTION_HEALTH_CAPACITY_DIAGNOSTICS:\s*\$\{\{\s*github\.event_name == 'workflow_dispatch' && inputs\.capacity_diagnostics \|\| false\s*\}\}/,
  );
});
