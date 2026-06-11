import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { SaltPatternValidationRulePack } from "../patternValidationRulePacks.js";
import type { SerializedPageSearchIndex } from "../search/pageSearchIndex.js";
import type { SaltTokenPolicyStructuralRoleRulePack } from "../tokenPolicyStructuralRoleRules.js";
import type {
  CreateRetrievalDocument,
  RegistryBuildInfo,
  SaltRegistry,
  SearchIndexEntry,
} from "../types.js";
import {
  type MetadataArtifact,
  type PageSearchIndexArtifact,
  type PatternValidationRulePackArtifact,
  REGISTRY_ARRAY_ARTIFACTS,
  REGISTRY_CREATE_RETRIEVAL_INDEX_ARTIFACT,
  REGISTRY_METADATA_ARTIFACT,
  REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT,
  REGISTRY_PATTERN_VALIDATION_RULE_PACK_ARTIFACT,
  REGISTRY_SEARCH_INDEX_ARTIFACT,
  REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT,
  type RegistryArrayArtifactKey,
  type TokenPolicyStructuralRoleRulePackArtifact,
} from "./artifacts.js";
import { getCachedArtifact, setCachedArtifact } from "./artifactCache.js";
import { registerSerializedPageSearchIndexLoader } from "./runtimeCache.js";

/**
 * Lazy registry implementation for Phase 0 task 0.2.
 *
 * The exported `loadRegistry()` returns a Proxy whose synchronous
 * property reads trigger a single sync file read + JSON parse the first
 * time each array artifact is touched. Subsequent reads return the
 * cached value. Metadata.json (and friends) is loaded eagerly because
 * it's tiny and gives us the registry-wide `version` / `generated_at`.
 *
 * The cost model:
 * - `salt-ds info` (default): reads ~few KB (metadata.json only).
 * - `salt-ds create / review / migrate / upgrade`: reads only the
 *   artifacts the workflow touches.
 * - Hosts that want the legacy "eager everything" semantics pass
 *   `prefetch: true` to `loadRegistry`.
 *
 * Why sync reads? Property access on `SaltRegistry` is a sync field in
 * the public type. Every consumer reads `registry.components.find(...)`
 * eagerly today. Keeping that contract is worth the blocking cost: a
 * short-lived CLI turn or one MCP request, not a hot loop. The win
 * (24 MB → ~few KB on the common path) dwarfs the per-read cost.
 */

const ARTIFACT_GENERATED_AT_KEY = "generated_at";
const ARTIFACT_VERSION_KEY = "version";

interface ArtifactHeader {
  generated_at: string;
  version: string;
}

interface CachedArrayArtifact<T> extends ArtifactHeader {
  file_name: string;
  values: T[];
}

interface CachedSingleValueArtifact<T> extends ArtifactHeader {
  file_name: string;
  value: T | null;
}

interface CachedSearchIndex {
  file_name: string;
  values: SearchIndexEntry[];
}

interface CachedCreateRetrievalIndex {
  file_name: string;
  values: CreateRetrievalDocument[];
}

type ArrayArtifactValueType<Key extends RegistryArrayArtifactKey> =
  SaltRegistry[Key][number];

function readJsonFileSync<T>(absolutePath: string): T {
  fileReadCounter.set(absolutePath, (fileReadCounter.get(absolutePath) ?? 0) + 1);
  const content = readFileSync(absolutePath, "utf8");
  return JSON.parse(content) as T;
}

function readJsonLinesSync<T>(absolutePath: string): T[] {
  fileReadCounter.set(absolutePath, (fileReadCounter.get(absolutePath) ?? 0) + 1);
  const content = readFileSync(absolutePath, "utf8");
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as T);
}

/**
 * Per-process counter of disk reads performed by the sync loaders.
 * Exposed for tests; not part of the public surface. Resets when the
 * artifact cache is cleared via `clearArtifactCacheForTests`.
 */
const fileReadCounter = new Map<string, number>();

export function __getFileReadCountForTests(absolutePath: string): number {
  return fileReadCounter.get(absolutePath) ?? 0;
}

export function __resetFileReadCountsForTests(): void {
  fileReadCounter.clear();
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

function assertArtifactHeader(fileName: string, raw: unknown): ArtifactHeader {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(`${fileName} is not a JSON object.`);
  }
  const candidate = raw as Record<string, unknown>;
  const generatedAt = candidate[ARTIFACT_GENERATED_AT_KEY];
  const version = candidate[ARTIFACT_VERSION_KEY];
  if (typeof generatedAt !== "string" || generatedAt.length === 0) {
    throw new Error(`${fileName} is missing a valid generated_at field.`);
  }
  if (typeof version !== "string" || version.length === 0) {
    throw new Error(`${fileName} is missing a valid version field.`);
  }
  return { generated_at: generatedAt, version };
}

function assertHeaderMatchesMetadata(
  fileName: string,
  header: ArtifactHeader,
  metadata: ArtifactHeader,
): void {
  if (header.generated_at !== metadata.generated_at) {
    throw new Error(
      `Registry artifact generated_at mismatch between metadata.json and ${fileName}.`,
    );
  }
  if (header.version !== metadata.version) {
    throw new Error(
      `Registry artifact version mismatch between metadata.json and ${fileName}.`,
    );
  }
}

function readArrayArtifactSync<Key extends RegistryArrayArtifactKey>(
  registryDir: string,
  fileName: string,
  key: Key,
): CachedArrayArtifact<ArrayArtifactValueType<Key>> {
  const absolutePath = path.join(registryDir, fileName);
  const mtimeMs = statSync(absolutePath).mtimeMs;
  const cached = getCachedArtifact<
    CachedArrayArtifact<ArrayArtifactValueType<Key>>
  >(absolutePath, mtimeMs);
  if (cached) {
    return cached;
  }

  const raw = readJsonFileSync<Record<string, unknown>>(absolutePath);
  const header = assertArtifactHeader(fileName, raw);
  if (!Object.hasOwn(raw, key)) {
    throw new Error(`${fileName} is missing the '${key}' array.`);
  }
  const values = raw[key];
  if (!Array.isArray(values)) {
    throw new Error(`${fileName} field '${key}' must be an array.`);
  }

  const artifact: CachedArrayArtifact<ArrayArtifactValueType<Key>> = {
    file_name: fileName,
    generated_at: header.generated_at,
    version: header.version,
    values: values as ArrayArtifactValueType<Key>[],
  };
  setCachedArtifact(absolutePath, artifact, mtimeMs);
  return artifact;
}

function readSearchIndexSync(registryDir: string): CachedSearchIndex {
  const absolutePath = path.join(
    registryDir,
    REGISTRY_SEARCH_INDEX_ARTIFACT.file_name,
  );
  const mtimeMs = statSync(absolutePath).mtimeMs;
  const cached = getCachedArtifact<CachedSearchIndex>(absolutePath, mtimeMs);
  if (cached) {
    return cached;
  }

  const values = readJsonLinesSync<SearchIndexEntry>(absolutePath);
  const artifact: CachedSearchIndex = {
    file_name: REGISTRY_SEARCH_INDEX_ARTIFACT.file_name,
    values,
  };
  setCachedArtifact(absolutePath, artifact, mtimeMs);
  return artifact;
}

function readCreateRetrievalIndexSync(
  registryDir: string,
): CachedCreateRetrievalIndex {
  const absolutePath = path.join(
    registryDir,
    REGISTRY_CREATE_RETRIEVAL_INDEX_ARTIFACT.file_name,
  );
  let mtimeMs: number | null;
  try {
    mtimeMs = statSync(absolutePath).mtimeMs;
  } catch (error) {
    if (isMissingFileError(error)) {
      mtimeMs = null;
    } else {
      throw error;
    }
  }
  if (mtimeMs !== null) {
    const cached = getCachedArtifact<CachedCreateRetrievalIndex>(
      absolutePath,
      mtimeMs,
    );
    if (cached) {
      return cached;
    }
  }

  let values: CreateRetrievalDocument[];
  try {
    values = readJsonLinesSync<CreateRetrievalDocument>(absolutePath);
  } catch (error) {
    if (isMissingFileError(error)) {
      values = [];
    } else {
      throw error;
    }
  }

  const artifact: CachedCreateRetrievalIndex = {
    file_name: REGISTRY_CREATE_RETRIEVAL_INDEX_ARTIFACT.file_name,
    values,
  };
  if (mtimeMs !== null) {
    setCachedArtifact(absolutePath, artifact, mtimeMs);
  }
  return artifact;
}

function readMetadataSync(
  registryDir: string,
): CachedSingleValueArtifact<RegistryBuildInfo> | null {
  const absolutePath = path.join(
    registryDir,
    REGISTRY_METADATA_ARTIFACT.file_name,
  );
  let mtimeMs: number;
  try {
    mtimeMs = statSync(absolutePath).mtimeMs;
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }
    throw error;
  }
  const cached = getCachedArtifact<
    CachedSingleValueArtifact<RegistryBuildInfo> | null
  >(absolutePath, mtimeMs);
  if (cached !== undefined) {
    return cached;
  }

  let raw: MetadataArtifact;
  try {
    raw = readJsonFileSync<MetadataArtifact>(absolutePath);
  } catch (error) {
    if (isMissingFileError(error)) {
      setCachedArtifact<CachedSingleValueArtifact<RegistryBuildInfo> | null>(
        absolutePath,
        null,
        mtimeMs,
      );
      return null;
    }
    throw error;
  }

  const header = assertArtifactHeader(
    REGISTRY_METADATA_ARTIFACT.file_name,
    raw,
  );
  const value = raw[REGISTRY_METADATA_ARTIFACT.key] ?? null;
  const artifact: CachedSingleValueArtifact<RegistryBuildInfo> = {
    file_name: REGISTRY_METADATA_ARTIFACT.file_name,
    generated_at: header.generated_at,
    version: header.version,
    value,
  };
  setCachedArtifact(absolutePath, artifact, mtimeMs);
  return artifact;
}

function readPageSearchIndexSync(
  registryDir: string,
): CachedSingleValueArtifact<SerializedPageSearchIndex> | null {
  const absolutePath = path.join(
    registryDir,
    REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.file_name,
  );
  let mtimeMs: number;
  try {
    mtimeMs = statSync(absolutePath).mtimeMs;
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }
    throw error;
  }
  const cached = getCachedArtifact<
    CachedSingleValueArtifact<SerializedPageSearchIndex> | null
  >(absolutePath, mtimeMs);
  if (cached !== undefined) {
    return cached;
  }

  let raw: PageSearchIndexArtifact;
  try {
    raw = readJsonFileSync<PageSearchIndexArtifact>(absolutePath);
  } catch (error) {
    if (isMissingFileError(error)) {
      setCachedArtifact<
        CachedSingleValueArtifact<SerializedPageSearchIndex> | null
      >(absolutePath, null, mtimeMs);
      return null;
    }
    throw error;
  }

  const header = assertArtifactHeader(
    REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.file_name,
    raw,
  );
  const value = raw[REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(
      "page-search-index.json is missing a valid page_search_index object.",
    );
  }
  const artifact: CachedSingleValueArtifact<SerializedPageSearchIndex> = {
    file_name: REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.file_name,
    generated_at: header.generated_at,
    version: header.version,
    value,
  };
  setCachedArtifact(absolutePath, artifact, mtimeMs);
  return artifact;
}

function readPatternValidationRulePackSync(
  registryDir: string,
): CachedSingleValueArtifact<SaltPatternValidationRulePack> | null {
  const absolutePath = path.join(
    registryDir,
    REGISTRY_PATTERN_VALIDATION_RULE_PACK_ARTIFACT.file_name,
  );
  let mtimeMs: number;
  try {
    mtimeMs = statSync(absolutePath).mtimeMs;
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }
    throw error;
  }
  const cached = getCachedArtifact<
    CachedSingleValueArtifact<SaltPatternValidationRulePack> | null
  >(absolutePath, mtimeMs);
  if (cached !== undefined) {
    return cached;
  }

  let raw: PatternValidationRulePackArtifact;
  try {
    raw =
      readJsonFileSync<PatternValidationRulePackArtifact>(absolutePath);
  } catch (error) {
    if (isMissingFileError(error)) {
      setCachedArtifact<
        CachedSingleValueArtifact<SaltPatternValidationRulePack> | null
      >(absolutePath, null, mtimeMs);
      return null;
    }
    throw error;
  }

  const header = assertArtifactHeader(
    REGISTRY_PATTERN_VALIDATION_RULE_PACK_ARTIFACT.file_name,
    raw,
  );
  const value = raw[REGISTRY_PATTERN_VALIDATION_RULE_PACK_ARTIFACT.key];
  if (typeof value !== "object" || value === null) {
    throw new Error(
      "pattern-validation-rules.json is missing a valid pattern_validation_rule_pack object.",
    );
  }
  const artifact: CachedSingleValueArtifact<SaltPatternValidationRulePack> = {
    file_name: REGISTRY_PATTERN_VALIDATION_RULE_PACK_ARTIFACT.file_name,
    generated_at: header.generated_at,
    version: header.version,
    value,
  };
  setCachedArtifact(absolutePath, artifact, mtimeMs);
  return artifact;
}

function readTokenPolicyStructuralRoleRulePackSync(
  registryDir: string,
): CachedSingleValueArtifact<SaltTokenPolicyStructuralRoleRulePack> | null {
  const absolutePath = path.join(
    registryDir,
    REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT.file_name,
  );
  let mtimeMs: number;
  try {
    mtimeMs = statSync(absolutePath).mtimeMs;
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }
    throw error;
  }
  const cached = getCachedArtifact<
    CachedSingleValueArtifact<SaltTokenPolicyStructuralRoleRulePack> | null
  >(absolutePath, mtimeMs);
  if (cached !== undefined) {
    return cached;
  }

  let raw: TokenPolicyStructuralRoleRulePackArtifact;
  try {
    raw =
      readJsonFileSync<TokenPolicyStructuralRoleRulePackArtifact>(
        absolutePath,
      );
  } catch (error) {
    if (isMissingFileError(error)) {
      setCachedArtifact<
        CachedSingleValueArtifact<SaltTokenPolicyStructuralRoleRulePack> | null
      >(absolutePath, null, mtimeMs);
      return null;
    }
    throw error;
  }

  const header = assertArtifactHeader(
    REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT.file_name,
    raw,
  );
  const value =
    raw[REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT.key];
  if (typeof value !== "object" || value === null) {
    throw new Error(
      "token-policy-structural-role-rules.json is missing a valid token_policy_structural_role_rule_pack object.",
    );
  }
  const artifact: CachedSingleValueArtifact<SaltTokenPolicyStructuralRoleRulePack> =
    {
      file_name:
        REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT.file_name,
      generated_at: header.generated_at,
      version: header.version,
      value,
    };
  setCachedArtifact(absolutePath, artifact, mtimeMs);
  return artifact;
}

/**
 * Seed metadata for the registry. Tries metadata.json first; if absent,
 * falls back to the first array artifact (so old registries without a
 * separate metadata.json still work). Loading the fallback artifact
 * still respects the cache, so a subsequent touch of that key is free.
 */
function readSeedMetadata(registryDir: string): ArtifactHeader & {
  build_info: RegistryBuildInfo | null;
} {
  const metadataArtifact = readMetadataSync(registryDir);
  if (metadataArtifact) {
    return {
      generated_at: metadataArtifact.generated_at,
      version: metadataArtifact.version,
      build_info: metadataArtifact.value,
    };
  }

  const [firstDefinition] = REGISTRY_ARRAY_ARTIFACTS;
  if (!firstDefinition) {
    throw new Error("No registry array artifacts are configured.");
  }

  const seedArtifact = readArrayArtifactSync(
    registryDir,
    firstDefinition.file_name,
    firstDefinition.key,
  );
  return {
    generated_at: seedArtifact.generated_at,
    version: seedArtifact.version,
    build_info: null,
  };
}

interface LazyRegistryState {
  registryDir: string;
  metadata: ArtifactHeader & { build_info: RegistryBuildInfo | null };
  pageSearchIndexValue: SerializedPageSearchIndex | null | undefined;
}

function loadArrayArtifactForKey<Key extends RegistryArrayArtifactKey>(
  state: LazyRegistryState,
  key: Key,
): ArrayArtifactValueType<Key>[] {
  const definition = REGISTRY_ARRAY_ARTIFACTS.find(
    (entry) => entry.key === key,
  );
  if (!definition) {
    throw new Error(`Unknown registry array artifact key: ${String(key)}`);
  }
  const artifact = readArrayArtifactSync(
    state.registryDir,
    definition.file_name,
    definition.key,
  ) as CachedArrayArtifact<ArrayArtifactValueType<Key>>;
  assertHeaderMatchesMetadata(definition.file_name, artifact, state.metadata);
  return artifact.values;
}

function loadPatternValidationRulePack(
  state: LazyRegistryState,
): SaltPatternValidationRulePack | null {
  const artifact = readPatternValidationRulePackSync(state.registryDir);
  if (!artifact) {
    return null;
  }
  assertHeaderMatchesMetadata(artifact.file_name, artifact, state.metadata);
  return artifact.value;
}

function loadTokenPolicyStructuralRoleRulePack(
  state: LazyRegistryState,
): SaltTokenPolicyStructuralRoleRulePack | null {
  const artifact = readTokenPolicyStructuralRoleRulePackSync(state.registryDir);
  if (!artifact) {
    return null;
  }
  assertHeaderMatchesMetadata(artifact.file_name, artifact, state.metadata);
  return artifact.value;
}

function loadPageSearchIndexValue(
  state: LazyRegistryState,
): SerializedPageSearchIndex | null {
  if (state.pageSearchIndexValue !== undefined) {
    return state.pageSearchIndexValue;
  }
  const artifact = readPageSearchIndexSync(state.registryDir);
  if (!artifact) {
    state.pageSearchIndexValue = null;
    return null;
  }
  assertHeaderMatchesMetadata(artifact.file_name, artifact, state.metadata);
  state.pageSearchIndexValue = artifact.value;
  return artifact.value;
}

const PROPERTY_LOADERS = {
  generated_at: (state: LazyRegistryState) => state.metadata.generated_at,
  version: (state: LazyRegistryState) => state.metadata.version,
  build_info: (state: LazyRegistryState) => state.metadata.build_info,
  packages: (state: LazyRegistryState) =>
    loadArrayArtifactForKey(state, "packages"),
  components: (state: LazyRegistryState) =>
    loadArrayArtifactForKey(state, "components"),
  icons: (state: LazyRegistryState) => loadArrayArtifactForKey(state, "icons"),
  country_symbols: (state: LazyRegistryState) =>
    loadArrayArtifactForKey(state, "country_symbols"),
  pages: (state: LazyRegistryState) => loadArrayArtifactForKey(state, "pages"),
  patterns: (state: LazyRegistryState) =>
    loadArrayArtifactForKey(state, "patterns"),
  guides: (state: LazyRegistryState) =>
    loadArrayArtifactForKey(state, "guides"),
  tokens: (state: LazyRegistryState) =>
    loadArrayArtifactForKey(state, "tokens"),
  deprecations: (state: LazyRegistryState) =>
    loadArrayArtifactForKey(state, "deprecations"),
  examples: (state: LazyRegistryState) =>
    loadArrayArtifactForKey(state, "examples"),
  changes: (state: LazyRegistryState) =>
    loadArrayArtifactForKey(state, "changes"),
  search_index: (state: LazyRegistryState) =>
    readSearchIndexSync(state.registryDir).values,
  create_retrieval_index: (state: LazyRegistryState) => {
    const values = readCreateRetrievalIndexSync(state.registryDir).values;
    return values.length > 0 ? values : undefined;
  },
  pattern_validation_rule_pack: (state: LazyRegistryState) =>
    loadPatternValidationRulePack(state),
  token_policy_structural_role_rule_pack: (state: LazyRegistryState) =>
    loadTokenPolicyStructuralRoleRulePack(state),
} as const satisfies Record<keyof SaltRegistry, (state: LazyRegistryState) => unknown>;

type LoaderName = keyof typeof PROPERTY_LOADERS;

const LOADER_NAMES = Object.keys(PROPERTY_LOADERS) as LoaderName[];

function isLoaderName(value: PropertyKey): value is LoaderName {
  return (
    typeof value === "string" &&
    Object.hasOwn(PROPERTY_LOADERS, value as string)
  );
}

interface CreateLazyRegistryOptions {
  registryDir: string;
  prefetch?: boolean;
}

/**
 * Create a Proxy-backed `SaltRegistry`. Eagerly seeds metadata so
 * `generated_at` / `version` are accessible without a property touch.
 * Each other field loads from disk on first read via the cached sync
 * loaders in this module.
 *
 * When `prefetch: true` is passed, every property is touched once to
 * force the eager-equivalent load (mirrors pre-0.2 behaviour).
 */
export function createLazyRegistry(options: CreateLazyRegistryOptions): {
  registry: SaltRegistry;
  state: LazyRegistryState;
} {
  const seed = readSeedMetadata(options.registryDir);
  const state: LazyRegistryState = {
    registryDir: options.registryDir,
    metadata: seed,
    pageSearchIndexValue: undefined,
  };

  // Per-instance memo so the same property read returns the same array
  // reference across calls (avoids surprising consumers that hold onto
  // the result and check by-identity, and skips repeated cache lookups).
  const propertyCache = new Map<LoaderName, unknown>();

  const target: Record<string, unknown> = {};

  function getProperty(loaderName: LoaderName): unknown {
    if (propertyCache.has(loaderName)) {
      return propertyCache.get(loaderName);
    }
    let value: unknown;
    if (loaderName === "build_info") {
      // build_info is read directly from the eagerly-loaded metadata
      // seed; no extra disk read required.
      value = state.metadata.build_info;
    } else {
      value = (
        PROPERTY_LOADERS[loaderName] as (state: LazyRegistryState) => unknown
      )(state);
    }
    propertyCache.set(loaderName, value);
    return value;
  }

  const proxy = new Proxy(target, {
    get(_target, prop, receiver) {
      if (isLoaderName(prop)) {
        return getProperty(prop);
      }
      return Reflect.get(target, prop, receiver);
    },
    has(_target, prop) {
      if (isLoaderName(prop)) {
        return true;
      }
      return Reflect.has(target, prop);
    },
    ownKeys() {
      return [...LOADER_NAMES];
    },
    getOwnPropertyDescriptor(_target, prop) {
      // IMPORTANT: do NOT call getProperty(prop) here. Property
      // descriptors are evaluated by Object.keys, Object.entries,
      // JSON.stringify, the spread operator, for...in loops, and the
      // structured-clone algorithm. If we eagerly loaded each artifact
      // to populate `value`, any of those iterations would defeat the
      // entire lazy contract. Return a generic descriptor instead and
      // let the consumer's actual property access fire the load through
      // the `get` trap.
      if (isLoaderName(prop)) {
        return {
          enumerable: true,
          configurable: true,
          writable: false,
          value: undefined,
        };
      }
      return undefined;
    },
  }) as unknown as SaltRegistry;

  // Register the deferred page-search-index loader so the first call to
  // getSerializedPageSearchIndex(registry) loads page-search-index.json
  // on demand. Eagerly populating the WeakMap during loadRegistry would
  // pull ~1.9 MB off disk for every consumer, including `salt-ds info`,
  // even though only pageSearch users need it.
  registerSerializedPageSearchIndexLoader(proxy, () =>
    loadPageSearchIndexValue(state),
  );

  if (options.prefetch) {
    // Touch every loader so the cache fills synchronously up front.
    // Order is the same as the original eager loader for parity in any
    // error messages. Also eagerly resolves the page-search-index via
    // the registered loader so the WeakMap mirrors the pre-0.2 eager
    // behaviour.
    for (const loaderName of LOADER_NAMES) {
      // Side-effect only; getProperty memoises into propertyCache.
      void (proxy as unknown as Record<string, unknown>)[loaderName];
    }
    loadPageSearchIndexValue(state);
  }

  return { registry: proxy, state };
}















