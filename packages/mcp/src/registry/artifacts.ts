import fs from "node:fs/promises";
import type { SerializedPageSearchIndex } from "../search/pageSearchIndex.js";
import type { RegistryBuildInfo, SaltRegistry } from "../types.js";

export const REGISTRY_ARRAY_ARTIFACTS = [
  { file_name: "packages.json", key: "packages" },
  { file_name: "components.json", key: "components" },
  { file_name: "icons.json", key: "icons" },
  { file_name: "country-symbols.json", key: "country_symbols" },
  { file_name: "pages.json", key: "pages" },
  { file_name: "patterns.json", key: "patterns" },
  { file_name: "guides.json", key: "guides" },
  { file_name: "tokens.json", key: "tokens" },
  { file_name: "deprecations.json", key: "deprecations" },
  { file_name: "examples.json", key: "examples" },
  { file_name: "changes.json", key: "changes" },
] as const;

export type RegistryArrayArtifactKey =
  (typeof REGISTRY_ARRAY_ARTIFACTS)[number]["key"];

export interface RegistryArrayArtifactDefinition<
  Key extends RegistryArrayArtifactKey = RegistryArrayArtifactKey,
> {
  file_name: `${string}.json`;
  key: Key;
}

export type RegistryArrayCollections = Pick<
  SaltRegistry,
  RegistryArrayArtifactKey
>;

export const REGISTRY_METADATA_ARTIFACT = {
  file_name: "metadata.json",
  key: "build_info",
} as const satisfies {
  file_name: "metadata.json";
  key: "build_info";
};

export const REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT = {
  file_name: "page-search-index.json",
  key: "page_search_index",
} as const satisfies {
  file_name: "page-search-index.json";
  key: "page_search_index";
};

export const REGISTRY_SEARCH_INDEX_ARTIFACT = {
  file_name: "search-index.jsonl",
} as const;

export interface MetadataArtifact {
  generated_at: string;
  version: string;
  [REGISTRY_METADATA_ARTIFACT.key]?: RegistryBuildInfo | null;
}

export interface PageSearchIndexArtifact {
  generated_at: string;
  version: string;
  [REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.key]?: SerializedPageSearchIndex | null;
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const fileContent = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContent) as T;
}

export async function writeJsonFile(
  filePath: string,
  data: unknown,
): Promise<void> {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function serializeJsonLines(values: readonly unknown[]): string {
  return `${values.map((value) => JSON.stringify(value)).join("\n")}\n`;
}
