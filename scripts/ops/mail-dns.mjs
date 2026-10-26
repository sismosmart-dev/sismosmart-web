import dns from "node:dns/promises";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import tls from "node:tls";
import { fileURLToPath } from "node:url";

import { parseCliArgs } from "./config.mjs";
import { hydrateNetworkConfig } from "./network-config.mjs";
import { buildCheck, summarizeChecks } from "./dns-cutover-lib.mjs";
import {
  compactDmarc,
  dmarcPolicyRank,
  getDkimRsaBits,
  hasAggregateMailbox,
  joinTxtRecord,
  normalizeHostname,
  parseTagRecord,
} from "./mail-dns-lib.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const defaultConfigPath = path.join(rootDir, "config", "mail-dns.json");
const DNS_TIMEOUT_MS = 12_000;
const NETWORK_TIMEOUT_MS = 30_000;

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
    resolveTxt: (hostname) => resolver.resolveTxt(hostname),
  };
}

function createLocalResolverClient() {
  return {
    name: "local",
    server: "system",
    resolve4: (hostname) => dns.resolve4(hostname),
    resolveMx: (hostname) => dns.resolveMx(hostname),
    resolveTxt: (hostname) => dns.resolveTxt(hostname),
  };
}

async function resolve4(client, hostname) {
  const values = await withTimeout(
    client.resolve4(hostname),
    DNS_TIMEOUT_MS,
    `${client.name} A ${hostname}`,
  );
  return [...new Set(values.map((value) => value.address || value))].sort();
}

async function resolveMx(client, hostname) {
  const values = await withTimeout(
    client.resolveMx(hostname),
    DNS_TIMEOUT_MS,
    `${client.name} MX ${hostname}`,
  );
  return values
    .map((value) => ({ exchange: normalizeHostname(value.exchange), priority: value.priority }))
    .sort((left, right) => left.priority - right.priority || left.exchange.localeCompare(right.exchange));
}

async function resolveTxt(client, hostname) {
  const records = await withTimeout(
    client.resolveTxt(hostname),
    DNS_TIMEOUT_MS,
    `${client.name} TXT ${hostname}`,
  );
  return records.map(joinTxtRecord);
}

function compactCertificate(socket) {
  const certificate = socket.getPeerCertificate();
  return {
    authorized: socket.authorized,
    authorizationError: socket.authorizationError || null,
    protocol: socket.getProtocol(),
    cipher: socket.getCipher()?.standardName || socket.getCipher()?.name || null,
    subjectCommonName: certificate?.subject?.CN || null,
    issuerCommonName: certificate?.issuer?.CN || null,
    validFrom: certificate?.valid_from || null,
    validTo: certificate?.valid_to || null,
    subjectAltName: certificate?.subjectaltname || null,
  };
}

function connectImplicitTlsVersion(hostname, port, connectAddress, tlsVersion) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host: connectAddress || hostname,
        port,
        servername: hostname,
        rejectUnauthorized: true,
        minVersion: tlsVersion,
        maxVersion: tlsVersion,
        timeout: NETWORK_TIMEOUT_MS,
      },
      () => {
        const certificate = compactCertificate(socket);
        socket.end();
        resolve({ mode: "implicit-tls", hostname, port, tlsVersion, certificate });
      },
    );
    socket.on("timeout", () =>
      socket.destroy(new Error(`SMTP TLS ${hostname}:${port} ${tlsVersion} timed out.`)),
    );
    socket.on("error", reject);
  });
}

async function inspectImplicitTls(hostname, port, connectAddress) {
  const errors = [];
  for (const tlsVersion of ["TLSv1.3", "TLSv1.2"]) {
    try {
      return await connectImplicitTlsVersion(hostname, port, connectAddress, tlsVersion);
    } catch (error) {
      errors.push(error.message);
    }
  }
  throw new Error(errors.join(" | "));
}

function readSmtpResponse(socket, label) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => finish(new Error(`${label} timed out.`)), NETWORK_TIMEOUT_MS);

    function cleanup() {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
    }

    function finish(error, value) {
      cleanup();
      if (error) reject(error);
      else resolve(value);
    }

    function onError(error) {
      finish(error);
    }

    function onClose() {
      finish(new Error(`${label} connection closed before a complete SMTP response.`));
    }

    function onData(chunk) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const finalLine = lines.find((line) => /^\d{3} /.test(line));
      if (finalLine) {
        finish(null, { code: Number.parseInt(finalLine.slice(0, 3), 10), lines });
      }
    }

    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("close", onClose);
  });
}

async function inspectStartTlsVersion(hostname, port, connectAddress, tlsVersion) {
  const socket = net.connect({ host: connectAddress || hostname, port });
  socket.setTimeout(NETWORK_TIMEOUT_MS, () => {
    socket.destroy(new Error(`SMTP STARTTLS ${hostname}:${port} timed out.`));
  });

  try {
    const greeting = await readSmtpResponse(socket, "SMTP greeting");
    if (greeting.code !== 220) throw new Error(`Unexpected SMTP greeting: ${greeting.code}`);

    const ehloPromise = readSmtpResponse(socket, "SMTP EHLO");
    socket.write("EHLO audit.sismosmart.com\r\n");
    const ehlo = await ehloPromise;
    if (ehlo.code !== 250 || !ehlo.lines.some((line) => /STARTTLS/i.test(line))) {
      throw new Error("SMTP server did not advertise STARTTLS.");
    }

    const startTlsPromise = readSmtpResponse(socket, "SMTP STARTTLS command");
    socket.write("STARTTLS\r\n");
    const startTls = await startTlsPromise;
    if (startTls.code !== 220) throw new Error(`STARTTLS rejected: ${startTls.code}`);

    const secureSocket = tls.connect({
      socket,
      servername: hostname,
      rejectUnauthorized: true,
      minVersion: tlsVersion,
      maxVersion: tlsVersion,
    });
    await withTimeout(
      new Promise((resolve, reject) => {
        secureSocket.once("secureConnect", resolve);
        secureSocket.once("error", reject);
      }),
      NETWORK_TIMEOUT_MS,
      `SMTP STARTTLS handshake ${hostname}:${port} ${tlsVersion}`,
    );
    const certificate = compactCertificate(secureSocket);
    secureSocket.end();
    return { mode: "starttls", hostname, port, tlsVersion, certificate };
  } catch (error) {
    socket.destroy();
    throw error;
  }
}

async function inspectStartTls(hostname, port, connectAddress) {
  const errors = [];
  for (const tlsVersion of ["TLSv1.3", "TLSv1.2"]) {
    try {
      return await inspectStartTlsVersion(hostname, port, connectAddress, tlsVersion);
    } catch (error) {
      errors.push(error.message);
    }
  }
  throw new Error(errors.join(" | "));
}

async function inspectResolver(client, config, checks) {
  const mx = await resolveMx(client, config.domain);
  const mailAddresses = await resolve4(client, config.mx.exchange);
  const apexTxt = await resolveTxt(client, config.domain);
  const dmarcTxt = await resolveTxt(client, `_dmarc.${config.domain}`);
  const dkimTxt = await resolveTxt(
    client,
    `${config.dkim.selector}._domainkey.${config.domain}`,
  );

  const spfRecords = apexTxt.filter((record) => /^v=spf1\b/i.test(record));
  const dmarcRecords = dmarcTxt.filter((record) => /^v=DMARC1\b/i.test(record));
  const dkimRecords = dkimTxt.filter((record) => /^v=DKIM1\b/i.test(record));
  const dmarcTags = parseTagRecord(dmarcRecords[0]);
  const dkimBits = getDkimRsaBits(dkimRecords[0]);

  checks.push(
    buildCheck(
      `${client.name}: direct MX target`,
      mx.length === 1 &&
        mx[0].exchange === normalizeHostname(config.mx.exchange) &&
        mx[0].priority === config.mx.priority,
      { actual: mx, expected: config.mx },
    ),
    buildCheck(
      `${client.name}: mail host reaches intended origin`,
      mailAddresses.length === 1 && mailAddresses[0] === config.originIpv4,
      { actual: mailAddresses, expected: config.originIpv4 },
    ),
    buildCheck(`${client.name}: one SPF record`, spfRecords.length === 1, {
      recordCount: spfRecords.length,
    }),
    buildCheck(
      `${client.name}: SPF authorizes MailBaby and fails closed`,
      spfRecords.length === 1 &&
        spfRecords[0].includes(config.spf.requiredInclude) &&
        spfRecords[0].trim().endsWith(config.spf.requiredTerminal),
      { record: spfRecords[0] || null },
    ),
    buildCheck(
      `${client.name}: DKIM key is valid`,
      dkimRecords.length === 1 && dkimBits >= config.dkim.minimumRsaBits,
      { recordCount: dkimRecords.length, rsaBits: dkimBits, minimum: config.dkim.minimumRsaBits },
    ),
    buildCheck(`${client.name}: one DMARC record`, dmarcRecords.length === 1, {
      recordCount: dmarcRecords.length,
    }),
    buildCheck(
      `${client.name}: DMARC aggregate mailbox`,
      dmarcRecords.length === 1 && hasAggregateMailbox(dmarcTags, config.dmarc.reportMailbox),
      { dmarc: compactDmarc(dmarcTags), expectedMailbox: config.dmarc.reportMailbox },
    ),
    buildCheck(
      `${client.name}: DMARC policy is recognized`,
      dmarcPolicyRank(dmarcTags.p) >= dmarcPolicyRank(config.dmarc.minimumPolicy),
      { actual: dmarcTags.p || null, minimum: config.dmarc.minimumPolicy },
    ),
    buildCheck(
      `${client.name}: DMARC percentage`,
      (dmarcTags.pct || "100") === config.dmarc.expectedPercentage,
      { actual: dmarcTags.pct || "100", expected: config.dmarc.expectedPercentage },
    ),
    buildCheck(
      `${client.name}: DMARC enforcement observation`,
      dmarcTags.p !== "none",
      { policy: dmarcTags.p || null, nextStep: "Review aggregate reports before quarantine." },
      "warning",
    ),
  );

  return {
    name: client.name,
    server: client.server,
    mx,
    mailAddresses,
    spf: { count: spfRecords.length, record: spfRecords[0] || null },
    dkim: { count: dkimRecords.length, rsaBits: dkimBits },
    dmarc: { count: dmarcRecords.length, ...compactDmarc(dmarcTags) },
  };
}

async function main() {
  const { options } = parseCliArgs();
  const configPath = path.resolve(options.config || defaultConfigPath);
  const config = hydrateNetworkConfig(
    JSON.parse(await fs.readFile(configPath, "utf8")),
    process.env,
    { requireLegacy: false },
  );
  const checks = [];
  const clients = [
    ...config.publicResolvers.map((resolver) =>
      createResolverClient(resolver.name, resolver.server),
    ),
    createLocalResolverClient(),
  ];

  const resolvers = [];
  for (const client of clients) {
    resolvers.push(await inspectResolver(client, config, checks));
  }

  const smtp = [];
  for (const operation of [
    () =>
      inspectImplicitTls(
        config.smtp.hostname,
        config.smtp.implicitTlsPort,
        config.originIpv4,
      ),
    () =>
      inspectStartTls(
        config.smtp.hostname,
        config.smtp.startTlsPort,
        config.originIpv4,
      ),
  ]) {
    try {
      const result = await operation();
      smtp.push(result);
      checks.push(
        buildCheck(
          `SMTP ${result.mode} ${result.hostname}:${result.port}`,
          result.certificate.authorized,
          { certificate: result.certificate },
        ),
      );
    } catch (error) {
      smtp.push({ error: error.message });
      checks.push(
        buildCheck("SMTP TLS endpoint", false, { error: error.message }, "warning"),
      );
    }
  }

  const summary = summarizeChecks(checks);
  const report = {
    generatedAt: new Date().toISOString(),
    configPath,
    domain: config.domain,
    resolvers,
    smtp,
    checks,
    summary,
  };

  console.table(
    resolvers.map((result) => ({
      resolver: result.name,
      mx: result.mx.map((record) => `${record.priority} ${record.exchange}`).join(","),
      mailA: result.mailAddresses.join(","),
      spf: result.spf.count,
      dkimBits: result.dkim.rsaBits,
      dmarc: result.dmarc.policy,
      rua: result.dmarc.aggregateReports,
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
    console.log(`MAIL_DNS_REPORT path=${outputPath}`);
  }
  if (options.json) console.log(JSON.stringify(report, null, 2));

  console.log(
    `MAIL_DNS_RESULT ok=${summary.ok} passed=${summary.passed} failed=${summary.failed} warnings=${summary.warnings}`,
  );
  if (!summary.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
