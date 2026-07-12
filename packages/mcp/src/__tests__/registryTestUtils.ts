import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  REGISTRY_ARRAY_ARTIFACTS,
  REGISTRY_METADATA_ARTIFACT,
  writeJsonFile,
} from "../core/registry/artifacts.js";

export const GENERATED_AT = "2026-03-10T00:00:00Z";
export const VERSION = "1.0.0";
export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);
export const V1_CATALOG_ARTIFACT_FILES = [
  "metadata.json",
  "packages.json",
  "components.json",
  "patterns.json",
  "pages.json",
  "guides.json",
  "icons.json",
  "country-symbols.json",
  "tokens.json",
  "deprecations.json",
  "token-policy-structural-role-rules.json",
] as const;
export const V1_EXCLUDED_CATALOG_ARTIFACT_FILES = [
  "search-index.jsonl",
  "changes.json",
  "create-retrieval-index.jsonl",
  "examples.json",
  "icons-lite.json",
  "page-search-index.json",
  "pattern-validation-rules.json",
] as const;

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
  await writeJsonFile(
    path.join(registryDir, REGISTRY_METADATA_ARTIFACT.file_name),
    {
      generated_at: GENERATED_AT,
      version: VERSION,
      [REGISTRY_METADATA_ARTIFACT.key]: null,
      ...overrides[REGISTRY_METADATA_ARTIFACT.file_name],
    },
  );
}

export async function copyV1CatalogArtifactsFromGenerated(
  registryDir: string,
): Promise<void> {
  const generatedDir = path.join(REPO_ROOT, "packages", "mcp", "generated");
  await fs.mkdir(registryDir, { recursive: true });

  for (const fileName of V1_CATALOG_ARTIFACT_FILES) {
    await fs.copyFile(
      path.join(generatedDir, fileName),
      path.join(registryDir, fileName),
    );
  }
}
