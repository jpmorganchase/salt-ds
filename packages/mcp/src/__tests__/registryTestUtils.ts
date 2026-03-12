import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  REGISTRY_ARRAY_ARTIFACTS,
  REGISTRY_SEARCH_INDEX_ARTIFACT,
  writeJsonFile,
} from "../registry/artifacts.js";

export const GENERATED_AT = "2026-03-10T00:00:00Z";
export const VERSION = "1.0.0";

export async function withRegistryDir(
  buildArtifacts: (registryDir: string) => Promise<void>,
  runAssertion: (registryDir: string) => Promise<void>,
): Promise<void> {
  const registryDir = await fs.mkdtemp(path.join(os.tmpdir(), "salt-mcp-"));

  try {
    await buildArtifacts(registryDir);
    await runAssertion(registryDir);
  } finally {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
}

export async function writeBaseArtifacts(
  registryDir: string,
  overrides: Partial<Record<string, Record<string, unknown>>> = {},
): Promise<void> {
  for (const definition of REGISTRY_ARRAY_ARTIFACTS) {
    await writeJsonFile(path.join(registryDir, definition.file_name), {
      generated_at: GENERATED_AT,
      version: VERSION,
      [definition.key]: [],
      ...overrides[definition.file_name],
    });
  }

  await fs.writeFile(
    path.join(registryDir, REGISTRY_SEARCH_INDEX_ARTIFACT.file_name),
    "",
    "utf8",
  );
}
