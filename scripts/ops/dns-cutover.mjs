import { createHash } from "node:crypto";
import dns from "node:dns/promises";
import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import process from "node:process";
import tls from "node:tls";
import { fileURLToPath } from "node:url";

import { parseCliArgs } from "./config.mjs";
import { hydrateNetworkConfig } from "./network-config.mjs";
import {
  buildCheck,
  classifyLegacyEndpoint,
  createUnconfiguredLegacyEndpoint,
  ipv4InAnyCidr,
  normalizeHostname,
  normalizeHostnames,
  sameStringSet,
  summarizeChecks,
} from "./dns-cutover-lib.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const defaultConfigPath = path.join(rootDir, "config", "dns-cutover.json");
const DNS_TIMEOUT_MS = 12_000;
const NETWORK_TIMEOUT_MS = 15_000;
const NO_DATA_CODES = new Set(["ENODATA", "ENOTFOUND", "ESERVFAIL", "EREFUSED"]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function withTimeout(promise, timeoutMs, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs} ms.`)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function createResolverClient(name, server) {
  const resolver = new dns.Resolver();
  resolver.setServers([server]);

  return {
    name,
    server,
    resolve4: (hostname) => resolver.resolve4(hostname),
    resolveMx: (hostname) => resolver.resolveMx(hostname),
    resolveNs: (hostname) => resolver.resolveNs(hostname),
  };
}

function createLocalResolverClient() {
  return {
    name: "local",
    server: "system",
    resolve4: (hostname) => dns.resolve4(hostname),
    resolveMx: (hostname) => dns.resolveMx(hostname),
    resolveNs: (hostname) => dns.resolveNs(hostname),
  };
}

async function resolve4(client, hostname, { allowNoData = false } = {}) {
  try {
    const values = await withTimeout(
      client.resolve4(hostname),
      DNS_TIMEOUT_MS,
      `${client.name} A ${hostname}`,
    );
    return [...new Set(values.map((value) => value.address || value))].sort();
  } catch (error) {
    if (allowNoData && NO_DATA_CODES.has(error.code)) {
      return [];
    }
    throw error;
  }
}

async function resolveNs(client, hostname, { allowNoData = false } = {}) {
  try {
    return normalizeHostnames(
      await withTimeout(
        client.resolveNs(hostname),
        DNS_TIMEOUT_MS,
        `${client.name} NS ${hostname}`,
      ),
    );
  } catch (error) {
    if (allowNoData && NO_DATA_CODES.has(error.code)) {
      return [];
    }
    throw error;
  }
}

async function resolveMx(client, hostname, { allowNoData = false } = {}) {
  try {
    const values = await withTimeout(
      client.resolveMx(hostname),
      DNS_TIMEOUT_MS,
      `${client.name} MX ${hostname}`,
    );
    return values
      .map((value) => ({
        exchange: normalizeHostname(value.exchange),
        priority: value.priority,
      }))
      .sort((left, right) => left.priority - right.priority || left.exchange.localeCompare(right.exchange));
  } catch (error) {
    if (allowNoData && NO_DATA_CODES.has(error.code)) {
      return [];
    }
    throw error;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { Accept: "text/plain, application/json" },
    signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${url}`);
  }

  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/rdap+json, application/json" },
    signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${url}`);
  }

  return response.json();
}

function compactCertificate(socket) {
  const certificate = socket.getPeerCertificate();
  return {
    authorized: socket.authorized,
    authorizationError: socket.authorizationError || null,
    subjectCommonName: certificate?.subject?.CN || null,
    issuerCommonName: certificate?.issuer?.CN || null,
    validFrom: certificate?.valid_from || null,
    validTo: certificate?.valid_to || null,
    subjectAltName: certificate?.subjectaltname || null,
  };
}

function requestHttps({
  hostname,
  port = 443,
  requestPath = "/",
  connectAddress,
  rejectUnauthorized = true,
  servername = hostname,
}) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: connectAddress || hostname,
        port,
        path: requestPath,
        method: "GET",
        servername,
        rejectUnauthorized,
        headers: {
          Host: hostname,
          "User-Agent": "SismoSmart-DNS-Cutover-Audit/1.0",
        },
        timeout: NETWORK_TIMEOUT_MS,
      },
      (response) => {
        const certificate = compactCertificate(response.socket);
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks);
          resolve({
            hostname,
            port,
            statusCode: response.statusCode || 0,
            location: response.headers.location || null,
            bodyBytes: body.length,
            bodyHash: sha256(body),
            certificate,
          });
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error(`HTTPS ${hostname}:${port} timed out.`));
    });
    request.on("error", reject);
    request.end();
  });
}

function checkTls({ hostname, port }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: true,
        timeout: NETWORK_TIMEOUT_MS,
      },
      () => {
        const certificate = compactCertificate(socket);
        socket.end();
        resolve({ hostname, port, certificate });
      },
    );

    socket.on("timeout", () => {
      socket.destroy(new Error(`TLS ${hostname}:${port} timed out.`));
    });
    socket.on("error", reject);
  });
}

function addObservedIps(target, values) {
  for (const value of values) {
    target.add(value);
  }
}

function addressesAreCloudflare(addresses, cloudflareCidrs) {
  return addresses.length > 0 && addresses.every((address) => ipv4InAnyCidr(address, cloudflareCidrs));
}

function addressesMatchOrigin(addresses, originIpv4) {
  return addresses.length === 1 && addresses[0] === originIpv4;
}

async function inspectResolver(client, config, cloudflareCidrs, observedIps, checks) {
  const apex = await resolve4(client, config.domain);
  const www = await resolve4(client, `www.${config.domain}`);
  const nameservers = await resolveNs(client, config.domain);
  const services = {};

  addObservedIps(observedIps, apex);
  addObservedIps(observedIps, www);

  checks.push(
    buildCheck(
      `${client.name}: delegation`,
      sameStringSet(nameservers, config.expectedNameservers),
      { actual: nameservers, expected: config.expectedNameservers },
    ),
    buildCheck(`${client.name}: apex uses Cloudflare`, addressesAreCloudflare(apex, cloudflareCidrs), {
      addresses: apex,
    }),
    buildCheck(`${client.name}: www uses Cloudflare`, addressesAreCloudflare(www, cloudflareCidrs), {
      addresses: www,
    }),
  );

  for (const label of config.serviceHosts) {
    const hostname = `${label}.${config.domain}`;
    const addresses = await resolve4(client, hostname);
    services[hostname] = addresses;
    addObservedIps(observedIps, addresses);
    checks.push(
      buildCheck(`${client.name}: ${hostname} reaches origin`, addressesMatchOrigin(addresses, config.originIpv4), {
        addresses,
        expected: config.originIpv4,
      }),
    );
  }

  const mx = await resolveMx(client, config.domain);
  const mxTargets = [];
  for (const record of mx) {
    const addresses = await resolve4(client, record.exchange, { allowNoData: true });
    addObservedIps(observedIps, addresses);
    mxTargets.push({ ...record, addresses });
  }
  checks.push(
    buildCheck(
      `${client.name}: MX reaches origin`,
      mxTargets.length > 0 &&
        mxTargets.every((record) => addressesMatchOrigin(record.addresses, config.originIpv4)),
      { targets: mxTargets, expected: config.originIpv4 },
    ),
  );

  return {
    name: client.name,
    server: client.server,
    apex,
    www,
    nameservers,
    services,
    mx: mxTargets,
  };
}

async function inspectAuthoritativeNameserver(
  nameserver,
  config,
  cloudflareCidrs,
  observedIps,
  checks,
) {
  const nameserverAddresses = await dns.resolve4(nameserver);
  const server = nameserverAddresses[0];
  const client = createResolverClient(nameserver, server);
  const result = await inspectResolver(client, config, cloudflareCidrs, observedIps, checks);
  return { ...result, nameserverAddresses };
}

async function inspectLegacyNameserver(nameserver, config, observedIps, checks) {
  const nameserverAddresses = await dns.resolve4(nameserver);
  const server = nameserverAddresses[0];
  const client = createResolverClient(nameserver, server);
  const apex = await resolve4(client, config.domain, { allowNoData: true });
  const www = await resolve4(client, `www.${config.domain}`, { allowNoData: true });
  const nameservers = await resolveNs(client, config.domain, { allowNoData: true });

  addObservedIps(observedIps, apex);
  addObservedIps(observedIps, www);
  if (config.legacyIpv4) {
    checks.push(
      buildCheck(
        `${nameserver}: no legacy apex/www answer`,
        ![...apex, ...www].includes(config.legacyIpv4),
        { apex, www, legacyIpv4: config.legacyIpv4 },
      ),
    );
  }

  return {
    name: nameserver,
    server,
    nameserverAddresses,
    apex,
    www,
    nameservers,
  };
}

async function main() {
  const { options } = parseCliArgs();
  const configPath = path.resolve(options.config || defaultConfigPath);
  const config = hydrateNetworkConfig(
    JSON.parse(await fs.readFile(configPath, "utf8")),
    process.env,
  );
  const checks = [];
  const observedIps = new Set();

  const rdap = await fetchJson(config.rdapUrl);
  const registryNameservers = normalizeHostnames(
    (rdap.nameservers || []).map((record) => record.ldhName),
  );
  checks.push(
    buildCheck(
      "registry delegation",
      sameStringSet(registryNameservers, config.expectedNameservers),
      { actual: registryNameservers, expected: config.expectedNameservers },
    ),
  );

  const cloudflareCidrs = (await fetchText(config.cloudflareIpv4RangesUrl))
    .split(/\s+/)
    .filter(Boolean);

  const publicResolvers = [
    ...config.publicResolvers.map((resolver) =>
      createResolverClient(resolver.name, resolver.server),
    ),
    createLocalResolverClient(),
  ];
  const resolverResults = [];
  for (const resolver of publicResolvers) {
    resolverResults.push(
      await inspectResolver(resolver, config, cloudflareCidrs, observedIps, checks),
    );
  }

  const authoritativeResults = [];
  for (const nameserver of config.expectedNameservers) {
    authoritativeResults.push(
      await inspectAuthoritativeNameserver(
        nameserver,
        config,
        cloudflareCidrs,
        observedIps,
        checks,
      ),
    );
  }

  const legacyNameserverResults = [];
  for (const nameserver of config.legacyNameservers) {
    legacyNameserverResults.push(
      await inspectLegacyNameserver(nameserver, config, observedIps, checks),
    );
  }

  const httpsResults = [];
  for (const target of config.httpsChecks) {
    const result = await requestHttps({
      hostname: target.hostname,
      port: target.port,
      requestPath: target.path,
    });
    httpsResults.push(result);
    checks.push(
      buildCheck(
        `HTTPS ${target.hostname}:${target.port}`,
        result.certificate.authorized && target.allowedStatuses.includes(result.statusCode),
        {
          statusCode: result.statusCode,
          location: result.location,
          certificate: result.certificate,
          allowedStatuses: target.allowedStatuses,
        },
      ),
    );
  }

  const tlsResults = [];
  for (const target of config.tlsChecks) {
    const result = await checkTls(target);
    tlsResults.push(result);
    checks.push(
      buildCheck(
        `TLS ${target.hostname}:${target.port}`,
        result.certificate.authorized,
        { certificate: result.certificate },
      ),
    );
  }

  let legacyEndpoint = createUnconfiguredLegacyEndpoint();

  if (config.legacyIpv4) {
    const randomHostname = `unassigned-${Date.now()}.invalid`;
    const legacyDomain = await requestHttps({
      hostname: config.domain,
      connectAddress: config.legacyIpv4,
      rejectUnauthorized: false,
    });
    const legacyRandom = await requestHttps({
      hostname: randomHostname,
      servername: randomHostname,
      connectAddress: config.legacyIpv4,
      rejectUnauthorized: false,
    });
    const dnsReferencesLegacy = observedIps.has(config.legacyIpv4);
    const legacyClassification = classifyLegacyEndpoint({
      dnsReferencesLegacy,
      domainBodyHash: legacyDomain.bodyHash,
      randomBodyHash: legacyRandom.bodyHash,
      certificateAuthorized: legacyDomain.certificate.authorized,
    });

    checks.push(
      buildCheck("legacy endpoint isolation", legacyClassification.acceptable, {
        ...legacyClassification,
        legacyIpv4: config.legacyIpv4,
        domainStatusCode: legacyDomain.statusCode,
        randomStatusCode: legacyRandom.statusCode,
        bodyHashesMatch: legacyDomain.bodyHash === legacyRandom.bodyHash,
        certificate: legacyDomain.certificate,
      }),
      buildCheck("no current DNS answer references legacy IPv4", !dnsReferencesLegacy, {
        legacyIpv4: config.legacyIpv4,
        observedIps: [...observedIps].sort(),
      }),
    );

    legacyEndpoint = {
      configured: true,
      ipv4: config.legacyIpv4,
      domainResponse: legacyDomain,
      randomResponse: legacyRandom,
      classification: legacyClassification,
      dnsReferencesLegacy,
    };
  }

  const summary = summarizeChecks(checks);
  const report = {
    generatedAt: new Date().toISOString(),
    configPath,
    domain: config.domain,
    registryDelegation: registryNameservers,
    cloudflareIpv4RangeCount: cloudflareCidrs.length,
    resolvers: resolverResults,
    authoritativeNameservers: authoritativeResults,
    legacyNameservers: legacyNameserverResults,
    https: httpsResults,
    tls: tlsResults,
    legacyEndpoint,
    checks,
    summary,
  };

  console.table(
    resolverResults.map((result) => ({
      resolver: result.name,
      server: result.server,
      apex: result.apex.join(","),
      www: result.www.join(","),
      nameservers: result.nameservers.join(","),
      mx: result.mx.map((record) => `${record.exchange}=>${record.addresses.join(",")}`).join(";"),
    })),
  );
  console.table(
    checks.map((check) => ({
      status: check.ok ? "PASS" : check.severity === "warning" ? "WARN" : "FAIL",
      check: check.name,
    })),
  );

  if (options.output) {
    const outputPath = path.resolve(String(options.output));
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`DNS_CUTOVER_REPORT path=${outputPath}`);
  }

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  }

  console.log(
    `DNS_CUTOVER_RESULT ok=${summary.ok} passed=${summary.passed} failed=${summary.failed} warnings=${summary.warnings} legacy=${legacyEndpoint.classification.classification}`,
  );

  if (!summary.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
