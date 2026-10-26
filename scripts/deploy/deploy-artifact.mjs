import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { runLocalCommand } from "./helpers.mjs";

export function shellEscapeDeployValue(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

export async function cleanNextBuildArtifacts({
  fsImpl = fs,
  pathImpl = path,
} = {}) {
  await fsImpl.rm(pathImpl.resolve(".next"), { recursive: true, force: true });
}

export async function sha256DeployFile(
  filePath,
  {
    createHashImpl = createHash,
    createReadStreamImpl = createReadStream,
  } = {},
) {
  const hash = createHashImpl("sha256");
  const stream = createReadStreamImpl(filePath);

  for await (const chunk of stream) {
    hash.update(chunk);
  }

  return hash.digest("hex");
}

export async function createReleaseArtifact(
  localDeployRoot,
  releaseId,
  {
    artifactRoot = path.resolve(".deploy", "artifacts"),
    fsImpl = fs,
    pathImpl = path,
    runLocalCommandImpl = runLocalCommand,
    sha256FileImpl = sha256DeployFile,
  } = {},
) {
  const artifactPath = pathImpl.join(artifactRoot, `${releaseId}.tar.gz`);
  const checksumPath = `${artifactPath}.sha256`;

  await fsImpl.mkdir(artifactRoot, { recursive: true });
  await fsImpl.rm(artifactPath, { force: true });
  await fsImpl.rm(checksumPath, { force: true });

  runLocalCommandImpl(
    `tar -czf ${shellEscapeDeployValue(artifactPath)} -C ${shellEscapeDeployValue(localDeployRoot)} .`,
  );

  const checksum = await sha256FileImpl(artifactPath);
  await fsImpl.writeFile(
    checksumPath,
    `${checksum}  ${pathImpl.basename(artifactPath)}\n`,
    "utf8",
  );

  const [artifactStat, checksumStat] = await Promise.all([
    fsImpl.stat(artifactPath),
    fsImpl.stat(checksumPath),
  ]);

  return {
    artifactBytes: artifactStat.size,
    artifactPath,
    checksum,
    checksumBytes: checksumStat.size,
    checksumPath,
  };
}
