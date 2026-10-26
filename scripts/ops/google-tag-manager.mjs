import process from "node:process";

import { google } from "googleapis";

import { getAnalyticsIdentifiers } from "./analytics-config.mjs";
import {
  getCommandUsage,
  getRequiredPositional,
  parseCliArgs,
  printJson,
} from "./config.mjs";
import { getGoogleAuthClient, GOOGLE_SCOPES } from "./google-auth.mjs";

const usage = getCommandUsage("ops:gtm", [
  "status",
  "list-accounts",
  "list-containers [accountId]",
  "list-workspaces [accountId] [containerId]",
  "list-tags [accountId] [containerId] [workspaceId]",
  "list-triggers [accountId] [containerId] [workspaceId]",
  "create-workspace [accountId] [containerId] [name]",
  "create-version [accountId] [containerId] [workspaceId] [name]",
  "publish-version [containerVersionPath]",
]);

function getTagManager(auth) {
  return google.tagmanager({ version: "v2", auth });
}

function normalizeAccountPath(accountId) {
  return accountId.startsWith("accounts/") ? accountId : `accounts/${accountId}`;
}

function normalizeContainerPath(accountId, containerId) {
  if (containerId?.startsWith("accounts/")) return containerId;
  const normalizedContainerId = containerId.replace(/^containers\//, "");
  return `${normalizeAccountPath(accountId)}/containers/${normalizedContainerId}`;
}

function normalizeWorkspacePath(accountId, containerId, workspaceId) {
  if (workspaceId?.startsWith("accounts/")) return workspaceId;
  const normalizedWorkspaceId = workspaceId.replace(/^workspaces\//, "");
  return `${normalizeContainerPath(accountId, containerId)}/workspaces/${normalizedWorkspaceId}`;
}

function accountIdFromPath(path) {
  return String(path || "").match(/^accounts\/([^/]+)/)?.[1] || null;
}

async function listContainersForAccount(tagManager, account) {
  const parent = account.path || normalizeAccountPath(account.accountId);
  const response = await tagManager.accounts.containers.list({ parent });
  return response.data.container || [];
}

async function discoverConfiguredContainer(tagManager, accounts) {
  const identifiers = getAnalyticsIdentifiers();
  const targetPublicId = identifiers.gtmId.value;
  const configuredAccountId = identifiers.gtmAccountId.value;
  const configuredContainerId = identifiers.gtmContainerId.value;
  const candidateAccounts = configuredAccountId
    ? accounts.filter(
        (account) =>
          account.accountId === configuredAccountId ||
          account.path === normalizeAccountPath(configuredAccountId),
      )
    : accounts;

  for (const account of candidateAccounts) {
    const containers = await listContainersForAccount(tagManager, account);
    const container = containers.find((entry) => {
      const containerMatches = configuredContainerId
        ? entry.containerId === configuredContainerId ||
          entry.path === normalizeContainerPath(account.accountId, configuredContainerId)
        : true;
      const publicIdMatches = targetPublicId ? entry.publicId === targetPublicId : true;
      return containerMatches && publicIdMatches;
    });

    if (container) {
      return {
        account,
        container,
        discoverySource:
          configuredAccountId || configuredContainerId ? "configured-resource+public-id" : "public-id",
      };
    }
  }

  return {
    account: null,
    container: null,
    discoverySource: "not-found",
  };
}

async function resolveWorkspace(tagManager, account, container) {
  const identifiers = getAnalyticsIdentifiers();
  const parent = container.path || normalizeContainerPath(account.accountId, container.containerId);
  const response = await tagManager.accounts.containers.workspaces.list({ parent });
  const workspaces = response.data.workspace || [];
  const configuredWorkspaceId = identifiers.gtmWorkspaceId.value;
  const workspace = configuredWorkspaceId
    ? workspaces.find(
        (entry) =>
          entry.workspaceId === configuredWorkspaceId ||
          entry.path === normalizeWorkspacePath(account.accountId, container.containerId, configuredWorkspaceId),
      )
    : workspaces.find((entry) => entry.name === "Default Workspace") || workspaces[0] || null;

  return {
    workspace,
    workspaces,
    selectionSource: configuredWorkspaceId ? "configured-workspace" : workspace ? "default-workspace" : "not-found",
  };
}

async function runStatus() {
  const { client, mode } = await getGoogleAuthClient([GOOGLE_SCOPES.tagManagerReadonly]);
  const tagManager = getTagManager(client);
  const accountsResponse = await tagManager.accounts.list();
  const accounts = accountsResponse.data.account || [];
  const discovery = await discoverConfiguredContainer(tagManager, accounts);

  if (!discovery.account || !discovery.container) {
    throw new Error(
      `No accessible GTM container matches ${getAnalyticsIdentifiers().gtmId.value || "the configured public ID"}.`,
    );
  }

  const workspaceResolution = await resolveWorkspace(
    tagManager,
    discovery.account,
    discovery.container,
  );
  const workspace = workspaceResolution.workspace;
  let tags = [];
  let triggers = [];

  if (workspace) {
    const [tagsResponse, triggersResponse] = await Promise.all([
      tagManager.accounts.containers.workspaces.tags.list({ parent: workspace.path }),
      tagManager.accounts.containers.workspaces.triggers.list({ parent: workspace.path }),
    ]);
    tags = tagsResponse.data.tag || [];
    triggers = triggersResponse.data.trigger || [];
  }

  printJson({
    authMode: mode,
    configuredPublicId: getAnalyticsIdentifiers().gtmId,
    discoverySource: discovery.discoverySource,
    account: {
      path: discovery.account.path,
      accountId: discovery.account.accountId || accountIdFromPath(discovery.account.path),
      name: discovery.account.name,
    },
    container: {
      path: discovery.container.path,
      containerId: discovery.container.containerId,
      name: discovery.container.name,
      publicId: discovery.container.publicId,
      usageContext: discovery.container.usageContext,
    },
    workspace: workspace
      ? {
          path: workspace.path,
          workspaceId: workspace.workspaceId,
          name: workspace.name,
          description: workspace.description,
          selectionSource: workspaceResolution.selectionSource,
        }
      : null,
    accessibleAccountCount: accounts.length,
    workspaceCount: workspaceResolution.workspaces.length,
    tagCount: tags.length,
    triggerCount: triggers.length,
    verification: {
      containerPublicIdMatches:
        discovery.container.publicId === getAnalyticsIdentifiers().gtmId.value,
      workspaceResolved: Boolean(workspace?.workspaceId),
      tagsPresent: tags.length > 0,
      triggersPresent:
        triggers.length > 0 ||
        tags.some((tag) => (tag.firingTriggerId || []).length > 0),
    },
    tagNames: tags.map((tag) => tag.name).filter(Boolean).sort(),
    triggerNames: triggers.map((trigger) => trigger.name).filter(Boolean).sort(),
  });
}

async function runListAccounts() {
  const { client } = await getGoogleAuthClient([GOOGLE_SCOPES.tagManagerReadonly]);
  const response = await getTagManager(client).accounts.list();
  printJson(response.data.account || []);
}

async function runListContainers(accountId) {
  const { client } = await getGoogleAuthClient([GOOGLE_SCOPES.tagManagerReadonly]);
  const tagManager = getTagManager(client);
  const parent = normalizeAccountPath(
    getRequiredPositional(accountId || process.env.GOOGLE_GTM_ACCOUNT_ID, "accountId"),
  );
  const response = await tagManager.accounts.containers.list({ parent });
  printJson(response.data.container || []);
}

async function runListWorkspaces(accountId, containerId) {
  const { client } = await getGoogleAuthClient([GOOGLE_SCOPES.tagManagerReadonly]);
  const tagManager = getTagManager(client);
  const parent = normalizeContainerPath(
    getRequiredPositional(accountId || process.env.GOOGLE_GTM_ACCOUNT_ID, "accountId"),
    getRequiredPositional(containerId || process.env.GOOGLE_GTM_CONTAINER_ID, "containerId"),
  );
  const response = await tagManager.accounts.containers.workspaces.list({ parent });
  printJson(response.data.workspace || []);
}

async function runListTags(accountId, containerId, workspaceId) {
  const { client } = await getGoogleAuthClient([GOOGLE_SCOPES.tagManagerReadonly]);
  const tagManager = getTagManager(client);
  const parent = normalizeWorkspacePath(
    getRequiredPositional(accountId || process.env.GOOGLE_GTM_ACCOUNT_ID, "accountId"),
    getRequiredPositional(containerId || process.env.GOOGLE_GTM_CONTAINER_ID, "containerId"),
    getRequiredPositional(workspaceId || process.env.GOOGLE_GTM_WORKSPACE_ID, "workspaceId"),
  );
  const response = await tagManager.accounts.containers.workspaces.tags.list({ parent });
  printJson(response.data.tag || []);
}

async function runListTriggers(accountId, containerId, workspaceId) {
  const { client } = await getGoogleAuthClient([GOOGLE_SCOPES.tagManagerReadonly]);
  const tagManager = getTagManager(client);
  const parent = normalizeWorkspacePath(
    getRequiredPositional(accountId || process.env.GOOGLE_GTM_ACCOUNT_ID, "accountId"),
    getRequiredPositional(containerId || process.env.GOOGLE_GTM_CONTAINER_ID, "containerId"),
    getRequiredPositional(workspaceId || process.env.GOOGLE_GTM_WORKSPACE_ID, "workspaceId"),
  );
  const response = await tagManager.accounts.containers.workspaces.triggers.list({ parent });
  printJson(response.data.trigger || []);
}

async function runCreateWorkspace(accountId, containerId, name) {
  const { client, mode } = await getGoogleAuthClient([GOOGLE_SCOPES.tagManagerEditContainers]);
  const tagManager = getTagManager(client);
  const parent = normalizeContainerPath(
    getRequiredPositional(accountId || process.env.GOOGLE_GTM_ACCOUNT_ID, "accountId"),
    getRequiredPositional(containerId || process.env.GOOGLE_GTM_CONTAINER_ID, "containerId"),
  );
  const response = await tagManager.accounts.containers.workspaces.create({
    parent,
    requestBody: {
      name: getRequiredPositional(name, "name"),
      description: "Created by SismoSmart automation",
    },
  });
  printJson({ authMode: mode, workspace: response.data });
}

async function runCreateVersion(accountId, containerId, workspaceId, name) {
  const { client, mode } = await getGoogleAuthClient([GOOGLE_SCOPES.tagManagerEditVersions]);
  const tagManager = getTagManager(client);
  const path = normalizeWorkspacePath(
    getRequiredPositional(accountId || process.env.GOOGLE_GTM_ACCOUNT_ID, "accountId"),
    getRequiredPositional(containerId || process.env.GOOGLE_GTM_CONTAINER_ID, "containerId"),
    getRequiredPositional(workspaceId || process.env.GOOGLE_GTM_WORKSPACE_ID, "workspaceId"),
  );
  const response = await tagManager.accounts.containers.workspaces.create_version({
    path,
    requestBody: {
      name: name || "SismoSmart automated publish",
      notes: "Created by scripts/ops/google-tag-manager.mjs",
    },
  });
  printJson({ authMode: mode, versionResponse: response.data });
}

async function runPublishVersion(containerVersionPath) {
  const { client, mode } = await getGoogleAuthClient([GOOGLE_SCOPES.tagManagerPublish]);
  const path = getRequiredPositional(containerVersionPath, "containerVersionPath");
  const response = await getTagManager(client).accounts.containers.versions.publish({ path });
  printJson({ authMode: mode, publishedVersion: response.data });
}

async function main() {
  const { positional } = parseCliArgs();
  const [command = "status", firstArg, secondArg, thirdArg, fourthArg] = positional;

  switch (command) {
    case "status":
      await runStatus();
      break;
    case "list-accounts":
      await runListAccounts();
      break;
    case "list-containers":
      await runListContainers(firstArg);
      break;
    case "list-workspaces":
      await runListWorkspaces(firstArg, secondArg);
      break;
    case "list-tags":
      await runListTags(firstArg, secondArg, thirdArg);
      break;
    case "list-triggers":
      await runListTriggers(firstArg, secondArg, thirdArg);
      break;
    case "create-workspace":
      await runCreateWorkspace(firstArg, secondArg, thirdArg);
      break;
    case "create-version":
      await runCreateVersion(firstArg, secondArg, thirdArg, fourthArg);
      break;
    case "publish-version":
      await runPublishVersion(firstArg);
      break;
    case "help":
    case "--help":
    case "-h":
      console.log(usage);
      break;
    default:
      throw new Error(`Unknown GTM command: ${command}\n\n${usage}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
