import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { SaltTokenPolicyStructuralRoleRulePack } from "../tokenPolicyStructuralRoleRules.js";
import type {
  ExampleRecord,
  RegistryBuildInfo,
  SaltRegistry,
} from "../types.js";
import { getCachedArtifact, setCachedArtifact } from "./artifactCache.js";
import {
  type MetadataArtifact,
  REGISTRY_ARRAY_ARTIFACTS,
  REGISTRY_METADATA_ARTIFACT,
  REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT,
  type RegistryArrayArtifactKey,
  type TokenPolicyStructuralRoleRulePackArtifact,
} from "./artifacts.js";

/**
 * Lazy reader for the one current registry format. Metadata is required and
 * every persisted collection must carry the same version and timestamp.
 * Examples are deliberately derived from component and pattern records so the
 * package does not publish a duplicate artifact.
 */

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

type CachedMetadataArtifact = CachedSingleValueArtifact<RegistryBuildInfo> & {
  semantic_hash: string | null;
};

type ArrayArtifactValueType<Key extends RegistryArrayArtifactKey> =
  SaltRegistry[Key][number];

const fileReadCounter = new Map<string, number>();

export function __getFileReadCountForTests(absolutePath: string): number {
  return fileReadCounter.get(absolutePath) ?? 0;
}

export function __resetFileReadCountsForTests(): void {
  fileReadCounter.clear();
}

function readJsonFileSync<T>(absolutePath: string): T {
  fileReadCounter.set(
    absolutePath,
    (fileReadCounter.get(absolutePath) ?? 0) + 1,
  );
  return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
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
  if (
    typeof candidate.generated_at !== "string" ||
    candidate.generated_at.length === 0
  ) {
    throw new Error(`${fileName} is missing a valid generated_at field.`);
  }
  if (typeof candidate.version !== "string" || candidate.version.length === 0) {
    throw new Error(`${fileName} is missing a valid version field.`);
  }

  return {
    generated_at: candidate.generated_at,
    version: candidate.version,
  };
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
  const values = raw[key];
  if (!Array.isArray(values)) {
    throw new Error(`${fileName} field '${key}' must be an array.`);
  }

  const artifact: CachedArrayArtifact<ArrayArtifactValueType<Key>> = {
    file_name: fileName,
    ...header,
    values: values as ArrayArtifactValueType<Key>[],
  };
  setCachedArtifact(absolutePath, artifact, mtimeMs);
  return artifact;
}

function readMetadataSync(registryDir: string): CachedMetadataArtifact {
  const absolutePath = path.join(
    registryDir,
    REGISTRY_METADATA_ARTIFACT.file_name,
  );
  let mtimeMs: number;
  try {
    mtimeMs = statSync(absolutePath).mtimeMs;
  } catch (error) {
    if (isMissingFileError(error)) {
      throw new Error(
        "metadata.json is required; this registry directory is not in the current format.",
      );
    }
    throw error;
  }

  const cached = getCachedArtifact<CachedMetadataArtifact>(
    absolutePath,
    mtimeMs,
  );
  if (cached) {
    return cached;
  }

  const raw = readJsonFileSync<MetadataArtifact>(absolutePath);
  const header = assertArtifactHeader(
    REGISTRY_METADATA_ARTIFACT.file_name,
    raw,
  );
  const artifact: CachedMetadataArtifact = {
    file_name: REGISTRY_METADATA_ARTIFACT.file_name,
    ...header,
    value: raw[REGISTRY_METADATA_ARTIFACT.key] ?? null,
    semantic_hash:
      typeof raw.semantic_hash === "string" &&
      /^sha256:[0-9a-f]{64}$/u.test(raw.semantic_hash)
        ? raw.semantic_hash
        : null,
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
    CachedSingleValueArtifact<SaltTokenPolicyStructuralRoleRulePack>
  >(absolutePath, mtimeMs);
  if (cached) {
    return cached;
  }

  const raw =
    readJsonFileSync<TokenPolicyStructuralRoleRulePackArtifact>(absolutePath);
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
      ...header,
      value,
    };
  setCachedArtifact(absolutePath, artifact, mtimeMs);
  return artifact;
}

interface LazyRegistryState {
  registryDir: string;
  metadata: ArtifactHeader & {
    semantic_hash: string | null;
    build_info: RegistryBuildInfo | null;
  };
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

function loadExamples(state: LazyRegistryState): ExampleRecord[] {
  const byId = new Map<string, ExampleRecord>();
  for (const example of [
    ...loadArrayArtifactForKey(state, "components").flatMap(
      (component) => component.examples,
    ),
    ...loadArrayArtifactForKey(state, "patterns").flatMap(
      (pattern) => pattern.examples,
    ),
  ]) {
    byId.set(example.id, example);
  }

  return [...byId.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
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

const PROPERTY_LOADERS = {
  generated_at: (state: LazyRegistryState) => state.metadata.generated_at,
  version: (state: LazyRegistryState) => state.metadata.version,
  semantic_hash: (state: LazyRegistryState) => state.metadata.semantic_hash,
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
  examples: (state: LazyRegistryState) => loadExamples(state),
  token_policy_structural_role_rule_pack: (state: LazyRegistryState) =>
    loadTokenPolicyStructuralRoleRulePack(state),
} as const satisfies Record<
  keyof SaltRegistry,
  (state: LazyRegistryState) => unknown
>;

type LoaderName = keyof typeof PROPERTY_LOADERS;
const LOADER_NAMES = Object.keys(PROPERTY_LOADERS) as LoaderName[];

function isLoaderName(value: PropertyKey): value is LoaderName {
  return typeof value === "string" && Object.hasOwn(PROPERTY_LOADERS, value);
}

interface CreateLazyRegistryOptions {
  registryDir: string;
  prefetch?: boolean;
}

export function createLazyRegistry(options: CreateLazyRegistryOptions): {
  registry: SaltRegistry;
  state: LazyRegistryState;
} {
  const metadataArtifact = readMetadataSync(options.registryDir);
  const state: LazyRegistryState = {
    registryDir: options.registryDir,
    metadata: {
      generated_at: metadataArtifact.generated_at,
      version: metadataArtifact.version,
      semantic_hash: metadataArtifact.semantic_hash,
      build_info: metadataArtifact.value,
    },
  };
  const propertyCache = new Map<LoaderName, unknown>();
  const target: Record<string, unknown> = {};

  function getProperty(loaderName: LoaderName): unknown {
    if (!propertyCache.has(loaderName)) {
      propertyCache.set(
        loaderName,
        PROPERTY_LOADERS[loaderName](state) as never,
      );
    }
    return propertyCache.get(loaderName);
  }

  const proxy = new Proxy(target, {
    get(_target, prop, receiver) {
      return isLoaderName(prop)
        ? getProperty(prop)
        : Reflect.get(target, prop, receiver);
    },
    has(_target, prop) {
      return isLoaderName(prop) || Reflect.has(target, prop);
    },
    ownKeys() {
      return [...LOADER_NAMES];
    },
    getOwnPropertyDescriptor(_target, prop) {
      return isLoaderName(prop)
        ? {
            enumerable: true,
            configurable: true,
            writable: false,
            value: undefined,
          }
        : undefined;
    },
  }) as unknown as SaltRegistry;

  if (options.prefetch) {
    for (const loaderName of LOADER_NAMES) {
      void proxy[loaderName];
    }
  }

  return { registry: proxy, state };
}
