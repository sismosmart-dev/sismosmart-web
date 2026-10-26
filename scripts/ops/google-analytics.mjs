import process from "node:process";

import { google } from "googleapis";

import {
  getCommandUsage,
  getRequiredPositional,
  normalizePropertyPath,
  opsConfig,
  parseCliArgs,
  printJson,
} from "./config.mjs";
import { getAnalyticsIdentifiers } from "./analytics-config.mjs";
import { getGoogleAuthClient, GOOGLE_SCOPES } from "./google-auth.mjs";

const usage = getCommandUsage("ops:ga", [
  "status",
  "list-accounts",
  "list-properties [accountId]",
  "list-web-streams [propertyId]",
  "create-property [accountId] [displayName]",
  "create-web-stream [propertyId] [defaultUri] [displayName]",
  "create-measurement-secret [propertyId] [webStreamId] [displayName]",
]);

function getAnalyticsAdmin(auth) {
  return google.analyticsadmin({
    version: "v1beta",
    auth,
  });
}

function normalizeDataStreamPath(propertyId, streamId) {
  if (!streamId) {
    return "";
  }

  if (streamId.startsWith("properties/")) {
    return streamId;
  }

  const propertyPath = normalizePropertyPath(propertyId);
  const normalizedStreamId = streamId.replace(/^dataStreams\//, "");
  return `${propertyPath}/dataStreams/${normalizedStreamId}`;
}

async function runStatus() {
  const { client, mode } = await getGoogleAuthClient([
    GOOGLE_SCOPES.analyticsReadonly,
  ]);
  const analyticsAdmin = getAnalyticsAdmin(client);
  const accountSummaries = await analyticsAdmin.accountSummaries.list({
    pageSize: 50,
  });

  const identifiers = getAnalyticsIdentifiers();
  const propertyId = identifiers.analyticsPropertyId.value;
  const streamId = identifiers.analyticsWebStreamId.value;

  const propertyPath = propertyId ? normalizePropertyPath(propertyId) : "";
  const accountPath = identifiers.analyticsAccountId.value
    ? `accounts/${String(identifiers.analyticsAccountId.value).replace(/^accounts\//, "")}`
    : "";
  const streamPath = propertyId && streamId ? normalizeDataStreamPath(propertyId, streamId) : "";

  const property = propertyPath
    ? (
        await analyticsAdmin.properties.get({
          name: propertyPath,
        })
      ).data
    : null;

  const webStream =
    propertyId && streamId
      ? (
          await analyticsAdmin.properties.dataStreams.get({
            name: streamPath,
          })
        ).data
      : null;

  printJson({
    authMode: mode,
    domain: opsConfig.domain,
    configuredAccountId: identifiers.analyticsAccountId,
    configuredPropertyId: identifiers.analyticsPropertyId,
    configuredWebStreamId: identifiers.analyticsWebStreamId,
    accessibleAccountSummaries: (accountSummaries.data.accountSummaries || []).map(
      (summary) => ({
        name: summary.name,
        displayName: summary.displayName,
        propertyCount: summary.propertySummaries?.length || 0,
      }),
    ),
    verification: {
      accountAccessible: (accountSummaries.data.accountSummaries || []).some(
        (summary) => summary.account === accountPath,
      ),
      propertyAccessible: property?.name === propertyPath,
      webStreamAccessible: webStream?.name === streamPath,
      measurementIdMatches:
        webStream?.webStreamData?.measurementId === identifiers.gaId.value,
    },
    property,
    webStream,
  });
}

async function runListAccounts() {
  const { client } = await getGoogleAuthClient([GOOGLE_SCOPES.analyticsReadonly]);
  const analyticsAdmin = getAnalyticsAdmin(client);
  const response = await analyticsAdmin.accounts.list({ pageSize: 200 });

  printJson(
    (response.data.accounts || []).map((account) => ({
      name: account.name,
      displayName: account.displayName,
      regionCode: account.regionCode,
      deleted: account.deleted,
    })),
  );
}

async function runListProperties(accountId) {
  const { client } = await getGoogleAuthClient([GOOGLE_SCOPES.analyticsReadonly]);
  const analyticsAdmin = getAnalyticsAdmin(client);
  const parent = accountId || getAnalyticsIdentifiers().analyticsAccountId.value;

  if (!parent) {
    throw new Error("Provide an accountId argument or set GOOGLE_ANALYTICS_ACCOUNT_ID.");
  }

  const response = await analyticsAdmin.properties.list({
    filter: `parent:${parent.startsWith("accounts/") ? parent : `accounts/${parent}`}`,
    pageSize: 200,
  });

  printJson(
    (response.data.properties || []).map((property) => ({
      name: property.name,
      displayName: property.displayName,
      propertyType: property.propertyType,
      industryCategory: property.industryCategory,
      timeZone: property.timeZone,
      currencyCode: property.currencyCode,
    })),
  );
}

async function runListWebStreams(propertyId) {
  const { client } = await getGoogleAuthClient([GOOGLE_SCOPES.analyticsReadonly]);
  const analyticsAdmin = getAnalyticsAdmin(client);
  const parent = propertyId || getAnalyticsIdentifiers().analyticsPropertyId.value;

  if (!parent) {
    throw new Error("Provide a propertyId argument or set GOOGLE_ANALYTICS_PROPERTY_ID.");
  }

  const response = await analyticsAdmin.properties.dataStreams.list({
    parent: normalizePropertyPath(parent),
  });

  printJson(
    (response.data.dataStreams || []).map((stream) => ({
      name: stream.name,
      displayName: stream.displayName,
      type: stream.type,
      defaultUri: stream.webStreamData?.defaultUri,
      measurementId: stream.webStreamData?.measurementId,
    })),
  );
}

async function runCreateProperty(accountId, displayName) {
  const { client, mode } = await getGoogleAuthClient([GOOGLE_SCOPES.analyticsEdit]);
  const analyticsAdmin = getAnalyticsAdmin(client);
  const parent = getRequiredPositional(
    accountId || getAnalyticsIdentifiers().analyticsAccountId.value,
    "accountId",
  );
  const propertyDisplayName =
    displayName || process.env.GOOGLE_ANALYTICS_PROPERTY_DISPLAY_NAME || "SismoSmart";

  const response = await analyticsAdmin.properties.create({
    requestBody: {
      parent: parent.startsWith("accounts/") ? parent : `accounts/${parent}`,
      displayName: propertyDisplayName,
      industryCategory: "TECHNOLOGY",
      timeZone: process.env.GOOGLE_ANALYTICS_TIME_ZONE || "Europe/Istanbul",
      currencyCode: process.env.GOOGLE_ANALYTICS_CURRENCY_CODE || "USD",
    },
  });

  printJson({
    authMode: mode,
    createdProperty: response.data,
  });
}

async function runCreateWebStream(propertyId, defaultUri, displayName) {
  const { client, mode } = await getGoogleAuthClient([GOOGLE_SCOPES.analyticsEdit]);
  const analyticsAdmin = getAnalyticsAdmin(client);
  const propertyPath = normalizePropertyPath(
    getRequiredPositional(
      propertyId || getAnalyticsIdentifiers().analyticsPropertyId.value,
      "propertyId",
    ),
  );

  const response = await analyticsAdmin.properties.dataStreams.create({
    parent: propertyPath,
    requestBody: {
      type: "WEB_DATA_STREAM",
      displayName:
        displayName ||
        process.env.GOOGLE_ANALYTICS_WEB_STREAM_DISPLAY_NAME ||
        "SismoSmart Website",
      webStreamData: {
        defaultUri: defaultUri || opsConfig.siteUrl,
      },
    },
  });

  printJson({
    authMode: mode,
    createdWebStream: response.data,
  });
}

async function runCreateMeasurementSecret(propertyId, webStreamId, displayName) {
  const { client, mode } = await getGoogleAuthClient([GOOGLE_SCOPES.analyticsEdit]);
  const analyticsAdmin = getAnalyticsAdmin(client);
  const parent = normalizeDataStreamPath(
    getRequiredPositional(
      propertyId || getAnalyticsIdentifiers().analyticsPropertyId.value,
      "propertyId",
    ),
    getRequiredPositional(
      webStreamId || getAnalyticsIdentifiers().analyticsWebStreamId.value,
      "webStreamId",
    ),
  );

  const response =
    await analyticsAdmin.properties.dataStreams.measurementProtocolSecrets.create({
      parent,
      requestBody: {
        displayName: displayName || "SismoSmart automation secret",
      },
    });

  printJson({
    authMode: mode,
    measurementProtocolSecret: response.data,
  });
}

async function main() {
  const { positional } = parseCliArgs();
  const [command = "status", firstArg, secondArg, thirdArg] = positional;

  switch (command) {
    case "status":
      await runStatus();
      break;
    case "list-accounts":
      await runListAccounts();
      break;
    case "list-properties":
      await runListProperties(firstArg);
      break;
    case "list-web-streams":
      await runListWebStreams(firstArg);
      break;
    case "create-property":
      await runCreateProperty(firstArg, secondArg);
      break;
    case "create-web-stream":
      await runCreateWebStream(firstArg, secondArg, thirdArg);
      break;
    case "create-measurement-secret":
      await runCreateMeasurementSecret(firstArg, secondArg, thirdArg);
      break;
    case "help":
    case "--help":
    case "-h":
      console.log(usage);
      break;
    default:
      throw new Error(`Unknown GA command: ${command}\n\n${usage}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
