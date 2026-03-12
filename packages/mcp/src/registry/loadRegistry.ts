import fs from "node:fs/promises";
import path from "node:path";
import type { SerializedPageSearchIndex } from "../search/pageSearchIndex.js";
import type {
  LoadRegistryOptions,
  RegistryBuildInfo,
  SaltRegistry,
  SearchIndexEntry,
} from "../types.js";
import {
  type MetadataArtifact,
  type PageSearchIndexArtifact,
  REGISTRY_ARRAY_ARTIFACTS,
  REGISTRY_METADATA_ARTIFACT,
  REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT,
  REGISTRY_SEARCH_INDEX_ARTIFACT,
  type RegistryArrayArtifactDefinition,
  type RegistryArrayArtifactKey,
  readJsonFile,
} from "./artifacts.js";
import { getPackageRoot } from "./paths.js";
import { setSerializedPageSearchIndex } from "./runtimeCache.js";

interface JsonArtifact<T> {
  generated_at: string;
  version: string;
  [key: string]: unknown;
  values?: T[];
}

interface LoadedArtifact<T> {
  file_name: string;
  generated_at: string;
  version: string;
  values: T[];
}

async function loadArtifactArray<T>(
  registryDir: string,
  fileName: string,
  key: string,
): Promise<LoadedArtifact<T>> {
  const filePath = path.join(registryDir, fileName);
  const artifact = await readJsonFile<JsonArtifact<T>>(filePath);
  if (
    typeof artifact.generated_at !== "string" ||
    artifact.generated_at.length === 0
  ) {
    throw new Error(`${fileName} is missing a valid generated_at field.`);
  }
  if (typeof artifact.version !== "string" || artifact.version.length === 0) {
    throw new Error(`${fileName} is missing a valid version field.`);
  }
  if (!Object.hasOwn(artifact, key)) {
    throw new Error(`${fileName} is missing the '${key}' array.`);
  }
  if (!Array.isArray(artifact[key])) {
    throw new Error(`${fileName} field '${key}' must be an array.`);
  }
  const values = artifact[key] as T[];

  return {
    file_name: fileName,
    generated_at: artifact.generated_at,
    version: artifact.version,
    values,
  };
}

function assertConsistentArtifacts(artifacts: Array<LoadedArtifact<unknown>>): {
  generated_at: string;
  version: string;
} {
  const [firstArtifact] = artifacts;
  if (!firstArtifact) {
    throw new Error("No registry artifacts were loaded.");
  }

  for (const artifact of artifacts.slice(1)) {
    if (artifact.generated_at !== firstArtifact.generated_at) {
      throw new Error(
        `Registry artifact generated_at mismatch between ${firstArtifact.file_name} and ${artifact.file_name}.`,
      );
    }
    if (artifact.version !== firstArtifact.version) {
      throw new Error(
        `Registry artifact version mismatch between ${firstArtifact.file_name} and ${artifact.file_name}.`,
      );
    }
  }

  return {
    generated_at: firstArtifact.generated_at,
    version: firstArtifact.version,
  };
}

async function loadSearchIndex(
  registryDir: string,
): Promise<SearchIndexEntry[]> {
  const indexPath = path.join(
    registryDir,
    REGISTRY_SEARCH_INDEX_ARTIFACT.file_name,
  );
  const content = await fs.readFile(indexPath, "utf8");

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as SearchIndexEntry);
}

async function loadMetadata(
  registryDir: string,
): Promise<LoadedArtifact<RegistryBuildInfo> | null> {
  const metadataPath = path.join(
    registryDir,
    REGISTRY_METADATA_ARTIFACT.file_name,
  );
  try {
    const metadata = await readJsonFile<MetadataArtifact>(metadataPath);
    const buildInfo = metadata[REGISTRY_METADATA_ARTIFACT.key];
    if (
      typeof metadata.generated_at !== "string" ||
      metadata.generated_at.length === 0
    ) {
      throw new Error("metadata.json is missing a valid generated_at field.");
    }
    if (typeof metadata.version !== "string" || metadata.version.length === 0) {
      throw new Error("metadata.json is missing a valid version field.");
    }

    return {
      file_name: REGISTRY_METADATA_ARTIFACT.file_name,
      generated_at: metadata.generated_at,
      version: metadata.version,
      values: buildInfo == null ? [] : [buildInfo],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function loadPageSearchIndex(
  registryDir: string,
): Promise<LoadedArtifact<SerializedPageSearchIndex> | null> {
  const pageSearchIndexPath = path.join(
    registryDir,
    REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.file_name,
  );
  try {
    const artifact =
      await readJsonFile<PageSearchIndexArtifact>(pageSearchIndexPath);
    const pageSearchIndex = artifact[REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.key];
    if (
      typeof artifact.generated_at !== "string" ||
      artifact.generated_at.length === 0
    ) {
      throw new Error(
        "page-search-index.json is missing a valid generated_at field.",
      );
    }
    if (typeof artifact.version !== "string" || artifact.version.length === 0) {
      throw new Error(
        "page-search-index.json is missing a valid version field.",
      );
    }
    if (
      typeof pageSearchIndex !== "object" ||
      pageSearchIndex == null ||
      Array.isArray(pageSearchIndex)
    ) {
      throw new Error(
        "page-search-index.json is missing a valid page_search_index object.",
      );
    }

    return {
      file_name: REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.file_name,
      generated_at: artifact.generated_at,
      version: artifact.version,
      values: [pageSearchIndex],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function loadRegistryArrayArtifact<Key extends RegistryArrayArtifactKey>(
  registryDir: string,
  definition: RegistryArrayArtifactDefinition<Key>,
): Promise<[Key, LoadedArtifact<SaltRegistry[Key][number]>]> {
  const artifact = await loadArtifactArray<SaltRegistry[Key][number]>(
    registryDir,
    definition.file_name,
    definition.key,
  );

  return [definition.key, artifact];
}

export async function loadRegistry(
  options: LoadRegistryOptions = {},
): Promise<SaltRegistry> {
  const packageRoot = getPackageRoot(import.meta.url);
  const registryDir =
    options.registryDir ?? path.join(packageRoot, "generated");

  const [
    arrayArtifactEntries,
    searchIndex,
    metadataArtifact,
    pageSearchIndexArtifact,
  ] = await Promise.all([
    Promise.all(
      REGISTRY_ARRAY_ARTIFACTS.map((definition) =>
        loadRegistryArrayArtifact(registryDir, definition),
      ),
    ),
    loadSearchIndex(registryDir),
    loadMetadata(registryDir),
    loadPageSearchIndex(registryDir),
  ]);
  const arrayArtifacts = Object.fromEntries(arrayArtifactEntries) as {
    [Key in RegistryArrayArtifactKey]: LoadedArtifact<
      SaltRegistry[Key][number]
    >;
  };
  const metadata = assertConsistentArtifacts([
    ...Object.values(arrayArtifacts),
    ...(metadataArtifact ? [metadataArtifact] : []),
    ...(pageSearchIndexArtifact ? [pageSearchIndexArtifact] : []),
  ]);

  const registry: SaltRegistry = {
    generated_at: metadata.generated_at,
    version: metadata.version,
    build_info: metadataArtifact?.values[0] ?? null,
    packages: arrayArtifacts.packages.values,
    components: arrayArtifacts.components.values,
    icons: arrayArtifacts.icons.values,
    country_symbols: arrayArtifacts.country_symbols.values,
    pages: arrayArtifacts.pages.values,
    patterns: arrayArtifacts.patterns.values,
    guides: arrayArtifacts.guides.values,
    tokens: arrayArtifacts.tokens.values,
    deprecations: arrayArtifacts.deprecations.values,
    examples: arrayArtifacts.examples.values,
    changes: arrayArtifacts.changes.values,
    search_index: searchIndex,
  };

  setSerializedPageSearchIndex(
    registry,
    pageSearchIndexArtifact?.values[0] ?? null,
  );

  return registry;
}
