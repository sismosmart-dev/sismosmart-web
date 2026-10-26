import https from "node:https";
import { performance } from "node:perf_hooks";

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_CAPTURE_BYTES = 64 * 1024;

export const productionHealthPublicRoutes = [
  {
    expectedLocationSuffix: "/en",
    expectedStatuses: [307, 308],
    key: "root",
    path: "/",
  },
  { expectedStatuses: [200], key: "en", path: "/en" },
  { expectedStatuses: [200], key: "tr", path: "/tr" },
  { expectedStatuses: [200], key: "robots", path: "/robots.txt" },
  { expectedStatuses: [200], key: "sitemap", path: "/sitemap.xml" },
  {
    expectedStatuses: [200],
    key: "manifest",
    path: "/site.webmanifest",
  },
  {
    expectedStatuses: [200],
    formTarget: "contact",
    key: "contact",
    path: "/api/contact",
  },
  {
    expectedStatuses: [200],
    formTarget: "waitlist",
    key: "waitlist",
    path: "/api/waitlist",
  },
];

const ORIGIN_ROUTES = productionHealthPublicRoutes.filter((route) =>
  ["en", "robots", "contact", "waitlist"].includes(route.key),
);

function rounded(value) {
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

function safeErrorCode(error) {
  const code = String(error?.code || "REQUEST_FAILED");
  return /^[A-Z0-9_]+$/.test(code) ? code : "REQUEST_FAILED";
}

export function fixedLookup(address, family) {
  return (_hostname, options, callback) => {
    if (options?.all) {
      callback(null, [{ address, family }]);
      return;
    }
    callback(null, address, family);
  };
}

export async function measureHttps(
  { hostname, lookupAddress, route },
  {
    httpsRequestImpl = https.request,
    nowImpl = () => performance.now(),
  } = {},
) {
  const startedAt = nowImpl();
  let lookupAt;
  let connectAt;
  let secureAt;
  let responseAt;

  return new Promise((resolve) => {
    const request = httpsRequestImpl(
      {
        agent: false,
        headers: {
          accept: route.formTarget ? "application/json" : "text/html,*/*",
          "user-agent": "SismoSmart-Production-Health/1.0",
        },
        hostname,
        lookup: lookupAddress
          ? fixedLookup(lookupAddress.address, lookupAddress.family)
          : undefined,
        method: "GET",
        path: route.path,
        port: 443,
        rejectUnauthorized: true,
        servername: hostname,
      },
      (response) => {
        responseAt = nowImpl();
        const chunks = [];
        let capturedBytes = 0;

        response.on("data", (chunk) => {
          if (!route.formTarget || capturedBytes >= MAX_CAPTURE_BYTES) return;
          const remaining = MAX_CAPTURE_BYTES - capturedBytes;
          const bounded = chunk.subarray(0, remaining);
          chunks.push(bounded);
          capturedBytes += bounded.length;
        });

        response.on("end", () => {
          const endedAt = nowImpl();
          const status = response.statusCode ?? null;
          const location = String(response.headers.location || "");
          const redirectOk = route.expectedLocationSuffix
            ? location.endsWith(route.expectedLocationSuffix)
            : true;
          let configured;
          let target;
          let formOk = true;

          if (route.formTarget) {
            try {
              const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
              configured = payload?.configured === true;
              target = payload?.target;
              formOk =
                payload?.ok === true &&
                configured &&
                target === route.formTarget;
            } catch {
              formOk = false;
            }
          }

          const statusOk = route.expectedStatuses.includes(status);
          resolve({
            cacheStatus: response.headers["cf-cache-status"] || null,
            cloudflare: Boolean(
              response.headers["cf-ray"] ||
                String(response.headers.server || "").toLowerCase() ===
                  "cloudflare",
            ),
            configured,
            connectMs: rounded(connectAt ? connectAt - startedAt : null),
            errorCode: null,
            lookupMs: rounded(lookupAt ? lookupAt - startedAt : null),
            ok: statusOk && redirectOk && formOk,
            status,
            target,
            tlsMs: rounded(secureAt ? secureAt - startedAt : null),
            totalMs: rounded(endedAt - startedAt),
            ttfbMs: rounded(responseAt - startedAt),
          });
        });
      },
    );

    request.on("socket", (socket) => {
      socket.once("lookup", () => {
        lookupAt = nowImpl();
      });
      socket.once("connect", () => {
        connectAt = nowImpl();
      });
      socket.once("secureConnect", () => {
        secureAt = nowImpl();
      });
    });

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      const error = new Error("request timeout");
      error.code = "ETIMEDOUT";
      request.destroy(error);
    });

    request.on("error", (error) => {
      const endedAt = nowImpl();
      resolve({
        cacheStatus: null,
        cloudflare: false,
        configured: undefined,
        connectMs: rounded(connectAt ? connectAt - startedAt : null),
        errorCode: safeErrorCode(error),
        lookupMs: rounded(lookupAt ? lookupAt - startedAt : null),
        ok: false,
        status: null,
        target: undefined,
        tlsMs: rounded(secureAt ? secureAt - startedAt : null),
        totalMs: rounded(endedAt - startedAt),
        ttfbMs: null,
      });
    });

    request.end();
  });
}

export async function probeRouteSet(
  { hostname, lookupAddress, routes },
  {
    measureHttpsImpl = measureHttps,
    sleepImpl = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
  } = {},
) {
  const cold = await Promise.all(
    routes.map((route) => measureHttpsImpl({ hostname, lookupAddress, route })),
  );
  await sleepImpl(500);
  const warm = await Promise.all(
    routes.map((route) => measureHttpsImpl({ hostname, lookupAddress, route })),
  );

  const results = routes.map((route, index) => ({
    cold: cold[index],
    key: route.key,
    warm: warm[index],
  }));

  return {
    ok: results.every((result) => result.cold.ok && result.warm.ok),
    routes: results,
  };
}

export function probePublicRoutes(
  { config },
  { probeRouteSetImpl = probeRouteSet } = {},
) {
  const hostname = new URL(config.publicBaseUrl).hostname;
  return probeRouteSetImpl({ hostname, routes: productionHealthPublicRoutes });
}

export function probeOriginRoutes(
  { config, origin },
  { probeRouteSetImpl = probeRouteSet } = {},
) {
  if (!origin?.ok || !origin.address) {
    return Promise.resolve({ ok: false, routes: [] });
  }
  const hostname = new URL(config.publicBaseUrl).hostname;
  return probeRouteSetImpl({
    hostname,
    lookupAddress: origin,
    routes: ORIGIN_ROUTES,
  });
}
