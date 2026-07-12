import fs from "node:fs/promises";
import path from "node:path";
import { satisfies, validRange } from "semver";
import { normalizeComparableVersion } from "../versionUtils.js";
import type { ProjectConventions, ProjectConventionsStack } from "./index.js";

export const MAX_PROJECT_POLICY_FILE_BYTES = 512 * 1024;
const MAX_PROJECT_POLICY_ENTRIES = 100;
const MAX_PROJECT_CONVENTION_LAYERS = 64;
const MAX_PROJECT_POLICY_STRING_LENGTH = 4_096;

export type ProjectConventionsLayerResolutionStatus =
  | "resolved"
  | "missing"
  | "unreadable"
  | "invalid";

export type ProjectConventionsPackCompatibilityStatus =
  | "compatible"
  | "unsupported"
  | "missing-range"
  | "unknown-current-version"
  | "invalid-range";

export interface ProjectConventionsPackCompatibility {
  status: ProjectConventionsPackCompatibilityStatus;
  currentSaltVersion: string | null;
  checkedVersion: string | null;
  reason: string;
}

export interface ProjectConventionsLayerMetadata {
  contract: string | null;
  id: string | null;
  version: string | null;
  project: string | null;
  supportedSaltRange: string | null;
}

export interface ProjectConventionsLayerResolution {
  status: ProjectConventionsLayerResolutionStatus;
  resolvedPath: string | null;
  packageName: string | null;
  exportName: string | null;
  packageVersion: string | null;
  conventions: ProjectConventions | null;
  metadata: ProjectConventionsLayerMetadata;
  compatibility: ProjectConventionsPackCompatibility | null;
  reason: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function isPathInside(rootDir: string, candidatePath: string): boolean {
  const relativePath = path.relative(rootDir, candidatePath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith(`..${path.sep}`) &&
      relativePath !== ".." &&
      !path.isAbsolute(relativePath))
  );
}

function isBoundedString(value: unknown, allowEmpty = false): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_PROJECT_POLICY_STRING_LENGTH &&
    (allowEmpty || value.trim().length > 0)
  );
}

function isOptionalBoundedString(value: unknown): value is string | undefined {
  return value === undefined || isBoundedString(value);
}

function isBoundedStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= MAX_PROJECT_POLICY_ENTRIES &&
    value.every((entry) => isBoundedString(entry))
  );
}

function isOptionalBoundedStringArray(
  value: unknown,
): value is string[] | undefined {
  return value === undefined || isBoundedStringArray(value);
}

function isOptionalDocs(value: unknown): boolean {
  return isOptionalBoundedStringArray(value);
}

function isImportReference(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["from", "name"]) &&
    isBoundedString(value.from) &&
    isBoundedString(value.name)
  );
}

function isOptionalImportReference(value: unknown): boolean {
  return value === undefined || isImportReference(value);
}

function isBoundedRecordArray(
  value: unknown,
  predicate: (entry: Record<string, unknown>) => boolean,
): boolean {
  return (
    Array.isArray(value) &&
    value.length <= MAX_PROJECT_POLICY_ENTRIES &&
    value.every((entry) => isRecord(entry) && predicate(entry))
  );
}

function isOptionalBoundedRecordArray(
  value: unknown,
  predicate: (entry: Record<string, unknown>) => boolean,
): boolean {
  return value === undefined || isBoundedRecordArray(value, predicate);
}

function validateProjectConventionsPayload(
  value: unknown,
): value is ProjectConventions {
  if (!isRecord(value)) return false;
  if (
    !hasOnlyKeys(value, [
      "$schema",
      "contract",
      "id",
      "version",
      "project",
      "supported_salt_range",
      "preferred_components",
      "approved_wrappers",
      "token_aliases",
      "theme_defaults",
      "token_family_policies",
      "pattern_preferences",
      "banned_choices",
      "notes",
    ])
  ) {
    return false;
  }
  if (
    value.contract !== "project_conventions_v1" ||
    !isBoundedString(value.version) ||
    !isOptionalBoundedString(value.$schema) ||
    !isOptionalBoundedString(value.id) ||
    !isOptionalBoundedString(value.project) ||
    !isOptionalBoundedString(value.supported_salt_range) ||
    !isOptionalBoundedStringArray(value.notes)
  ) {
    return false;
  }

  const valid =
    isOptionalBoundedRecordArray(
      value.preferred_components,
      (entry) =>
        hasOnlyKeys(entry, ["salt_name", "prefer", "reason", "docs"]) &&
        isBoundedString(entry.salt_name) &&
        isBoundedString(entry.prefer) &&
        isBoundedString(entry.reason) &&
        isOptionalDocs(entry.docs),
    ) &&
    isOptionalBoundedRecordArray(
      value.approved_wrappers,
      (entry) =>
        hasOnlyKeys(entry, [
          "name",
          "wraps",
          "reason",
          "import",
          "use_when",
          "avoid_when",
          "migration_shim",
          "docs",
        ]) &&
        isBoundedString(entry.name) &&
        isBoundedString(entry.wraps) &&
        isBoundedString(entry.reason) &&
        isOptionalImportReference(entry.import) &&
        isOptionalBoundedStringArray(entry.use_when) &&
        isOptionalBoundedStringArray(entry.avoid_when) &&
        (entry.migration_shim === undefined ||
          typeof entry.migration_shim === "boolean") &&
        isOptionalDocs(entry.docs),
    ) &&
    isOptionalBoundedRecordArray(
      value.token_aliases,
      (entry) =>
        hasOnlyKeys(entry, ["salt_name", "prefer", "reason", "docs"]) &&
        isBoundedString(entry.salt_name) &&
        isBoundedString(entry.prefer) &&
        isBoundedString(entry.reason) &&
        isOptionalDocs(entry.docs),
    ) &&
    isOptionalBoundedRecordArray(
      value.token_family_policies,
      (entry) =>
        hasOnlyKeys(entry, ["family", "mode", "reason", "docs"]) &&
        isBoundedString(entry.family) &&
        (entry.mode === "prefer-local-aliases" ||
          entry.mode === "allow-local-aliases" ||
          entry.mode === "canonical-only") &&
        isBoundedString(entry.reason) &&
        isOptionalDocs(entry.docs),
    ) &&
    isOptionalBoundedRecordArray(
      value.pattern_preferences,
      (entry) =>
        hasOnlyKeys(entry, [
          "intent",
          "prefer",
          "canonical_salt_start",
          "reason",
          "docs",
        ]) &&
        isBoundedString(entry.intent) &&
        isBoundedString(entry.prefer) &&
        isOptionalBoundedString(entry.canonical_salt_start) &&
        isBoundedString(entry.reason) &&
        isOptionalDocs(entry.docs),
    ) &&
    isOptionalBoundedRecordArray(
      value.banned_choices,
      (entry) =>
        hasOnlyKeys(entry, ["name", "reason", "replacement", "docs"]) &&
        isBoundedString(entry.name) &&
        isBoundedString(entry.reason) &&
        isOptionalBoundedString(entry.replacement) &&
        isOptionalDocs(entry.docs),
    );
  if (!valid) return false;

  if (value.theme_defaults !== undefined) {
    if (!isRecord(value.theme_defaults)) return false;
    const theme = value.theme_defaults;
    if (
      !hasOnlyKeys(theme, [
        "provider",
        "provider_import",
        "imports",
        "props",
        "reason",
        "docs",
      ]) ||
      !isOptionalBoundedString(theme.provider) ||
      !isOptionalImportReference(theme.provider_import) ||
      !isOptionalBoundedStringArray(theme.imports) ||
      !isOptionalBoundedRecordArray(
        theme.props,
        (entry) =>
          hasOnlyKeys(entry, ["name", "value"]) &&
          isBoundedString(entry.name) &&
          isBoundedString(entry.value),
      ) ||
      !isBoundedString(theme.reason) ||
      !isOptionalDocs(theme.docs)
    ) {
      return false;
    }
    if (
      typeof theme.provider === "string" &&
      theme.provider !== "SaltProvider" &&
      theme.provider !== "SaltProviderNext" &&
      !isImportReference(theme.provider_import)
    ) {
      return false;
    }
  }

  return true;
}

export function parseProjectConventionsStackPayload(input: unknown): {
  stack: ProjectConventionsStack | null;
  reason: string | null;
} {
  if (!isRecord(input)) {
    return {
      stack: null,
      reason: "The project-conventions stack must be a JSON object.",
    };
  }
  if (!hasOnlyKeys(input, ["$schema", "contract", "layers", "notes"])) {
    return {
      stack: null,
      reason: "The project-conventions stack contains unknown fields.",
    };
  }
  if (input.contract !== "project_conventions_stack_v1") {
    return {
      stack: null,
      reason:
        "The project-conventions stack must declare contract project_conventions_stack_v1.",
    };
  }
  if (
    !Array.isArray(input.layers) ||
    input.layers.length === 0 ||
    input.layers.length > MAX_PROJECT_CONVENTION_LAYERS
  ) {
    return {
      stack: null,
      reason: `The project-conventions stack must declare between 1 and ${MAX_PROJECT_CONVENTION_LAYERS} layers.`,
    };
  }
  if (!isOptionalBoundedString(input.$schema)) {
    return {
      stack: null,
      reason: "The project-conventions stack $schema field is invalid.",
    };
  }
  if (!isOptionalBoundedStringArray(input.notes)) {
    return {
      stack: null,
      reason: "The project-conventions stack notes field is invalid.",
    };
  }

  const ids = new Set<string>();
  for (const layer of input.layers) {
    if (
      !isRecord(layer) ||
      !hasOnlyKeys(layer, [
        "id",
        "scope",
        "source",
        "description",
        "optional",
      ]) ||
      !isBoundedString(layer.id) ||
      ids.has(layer.id) ||
      (layer.scope !== "line_of_business" &&
        layer.scope !== "team" &&
        layer.scope !== "repo" &&
        layer.scope !== "other") ||
      (layer.description !== undefined &&
        !isBoundedString(layer.description)) ||
      (layer.optional !== undefined && typeof layer.optional !== "boolean") ||
      !isRecord(layer.source)
    ) {
      return {
        stack: null,
        reason:
          "The project-conventions stack contains an invalid or duplicate layer definition.",
      };
    }
    ids.add(layer.id);

    const source = layer.source;
    const validSource =
      (source.type === "file" &&
        hasOnlyKeys(source, ["type", "path"]) &&
        isBoundedString(source.path)) ||
      (source.type === "package" &&
        hasOnlyKeys(source, ["type", "specifier", "export"]) &&
        isBoundedString(source.specifier) &&
        isOptionalBoundedString(source.export));
    if (!validSource) {
      return {
        stack: null,
        reason:
          "The project-conventions stack contains a layer with an invalid source.",
      };
    }
  }

  return { stack: input as ProjectConventionsStack, reason: null };
}

export async function readProjectConventionsStackFile(input: {
  filePath: string;
  rootDir: string;
}): Promise<{
  stack: ProjectConventionsStack | null;
  resolvedPath: string | null;
  reason: string | null;
}> {
  const file = await resolveBoundedPolicyFile(input);
  if (!file.contents) {
    return {
      stack: null,
      resolvedPath: file.resolvedPath,
      reason: file.reason,
    };
  }
  try {
    const parsed = parseProjectConventionsStackPayload(
      JSON.parse(file.contents) as unknown,
    );
    return {
      ...parsed,
      resolvedPath: file.resolvedPath,
    };
  } catch {
    return {
      stack: null,
      resolvedPath: file.resolvedPath,
      reason: `Could not parse project-conventions stack at ${file.resolvedPath ?? input.filePath}.`,
    };
  }
}

async function resolveBoundedPolicyFile(input: {
  filePath: string;
  rootDir?: string;
}): Promise<{
  contents: string | null;
  resolvedPath: string | null;
  missing: boolean;
  reason: string | null;
}> {
  const absolutePath = path.resolve(input.filePath);
  let realRootDir: string | null = null;
  if (input.rootDir) {
    const absoluteRootDir = path.resolve(input.rootDir);
    if (!isPathInside(absoluteRootDir, absolutePath)) {
      return {
        contents: null,
        resolvedPath: absolutePath,
        missing: false,
        reason: `Project conventions path ${absolutePath} leaves the declared root_dir. Only repo-local JSON policy files are supported.`,
      };
    }
    realRootDir = await fs.realpath(absoluteRootDir).catch(() => null);
    if (!realRootDir) {
      return {
        contents: null,
        resolvedPath: absolutePath,
        missing: false,
        reason: `Could not resolve the declared root_dir ${absoluteRootDir} before reading project conventions.`,
      };
    }
  }

  let realPath: string;
  try {
    realPath = await fs.realpath(absolutePath);
  } catch (error) {
    return {
      contents: null,
      resolvedPath: absolutePath,
      missing: isMissingFileError(error),
      reason: `Could not read project conventions at ${absolutePath}.`,
    };
  }

  if (realRootDir && !isPathInside(realRootDir, realPath)) {
    return {
      contents: null,
      resolvedPath: realPath,
      missing: false,
      reason: `Project conventions path ${absolutePath} resolves outside the declared root_dir. Symlink escapes are not supported.`,
    };
  }

  try {
    const stats = await fs.stat(realPath);
    if (!stats.isFile()) {
      return {
        contents: null,
        resolvedPath: realPath,
        missing: false,
        reason: `Project conventions path ${realPath} is not a file.`,
      };
    }
    if (stats.size > MAX_PROJECT_POLICY_FILE_BYTES) {
      return {
        contents: null,
        resolvedPath: realPath,
        missing: false,
        reason: `Project conventions at ${realPath} exceed the ${MAX_PROJECT_POLICY_FILE_BYTES}-byte inspection limit.`,
      };
    }
    const contents = await fs.readFile(realPath, "utf8");
    if (Buffer.byteLength(contents, "utf8") > MAX_PROJECT_POLICY_FILE_BYTES) {
      return {
        contents: null,
        resolvedPath: realPath,
        missing: false,
        reason: `Project conventions at ${realPath} exceed the ${MAX_PROJECT_POLICY_FILE_BYTES}-byte inspection limit.`,
      };
    }
    return {
      contents,
      resolvedPath: realPath,
      missing: false,
      reason: null,
    };
  } catch {
    return {
      contents: null,
      resolvedPath: realPath,
      missing: false,
      reason: `Could not read project conventions at ${realPath}.`,
    };
  }
}

function normalizeSaltVersion(
  version: string | null | undefined,
): string | null {
  return normalizeComparableVersion(version);
}

export function getProjectConventionsMetadata(
  conventions: ProjectConventions | null | undefined,
): ProjectConventionsLayerMetadata {
  return {
    contract:
      typeof conventions?.contract === "string" ? conventions.contract : null,
    id: typeof conventions?.id === "string" ? conventions.id : null,
    version:
      typeof conventions?.version === "string" ? conventions.version : null,
    project:
      typeof conventions?.project === "string" ? conventions.project : null,
    supportedSaltRange:
      typeof conventions?.supported_salt_range === "string"
        ? conventions.supported_salt_range
        : null,
  };
}

export function deriveComparableSaltVersion(input: {
  declaredVersion?: string | null;
  resolvedVersions?: string[];
}): string | null {
  const uniqueResolved = [...new Set(input.resolvedVersions ?? [])];
  if (uniqueResolved.length === 1) {
    return normalizeSaltVersion(uniqueResolved[0]);
  }

  return normalizeSaltVersion(input.declaredVersion ?? null);
}

export function evaluatePackCompatibility(input: {
  supportedSaltRange: string | null;
  currentSaltVersion: string | null;
}): ProjectConventionsPackCompatibility {
  const supportedSaltRange = input.supportedSaltRange?.trim() ?? "";
  if (supportedSaltRange.length === 0) {
    return {
      status: "missing-range",
      currentSaltVersion: input.currentSaltVersion,
      checkedVersion: null,
      reason:
        "The shared conventions pack does not declare supported_salt_range.",
    };
  }

  const normalizedRange = validRange(supportedSaltRange);
  if (!normalizedRange) {
    return {
      status: "invalid-range",
      currentSaltVersion: input.currentSaltVersion,
      checkedVersion: null,
      reason: `The shared conventions pack declares an invalid supported_salt_range (${supportedSaltRange}).`,
    };
  }

  const checkedVersion = normalizeSaltVersion(input.currentSaltVersion);
  if (!checkedVersion) {
    return {
      status: "unknown-current-version",
      currentSaltVersion: input.currentSaltVersion,
      checkedVersion: null,
      reason:
        "Salt version compatibility could not be verified because no comparable Salt package version was detected for the repo.",
    };
  }

  if (satisfies(checkedVersion, normalizedRange, { includePrerelease: true })) {
    return {
      status: "compatible",
      currentSaltVersion: input.currentSaltVersion,
      checkedVersion,
      reason: `The shared conventions pack supports Salt ${checkedVersion} via ${supportedSaltRange}.`,
    };
  }

  return {
    status: "unsupported",
    currentSaltVersion: input.currentSaltVersion,
    checkedVersion,
    reason: `The shared conventions pack supports ${supportedSaltRange}, but this repo is using Salt ${checkedVersion}.`,
  };
}

export async function resolveProjectConventionsFileLayer(input: {
  filePath: string;
  rootDir?: string;
  currentSaltVersion: string | null;
  optional?: boolean;
}): Promise<ProjectConventionsLayerResolution> {
  const file = await resolveBoundedPolicyFile(input);
  if (!file.contents) {
    if (input.optional && file.missing) {
      return {
        status: "missing",
        resolvedPath: file.resolvedPath,
        packageName: null,
        exportName: null,
        packageVersion: null,
        conventions: null,
        metadata: getProjectConventionsMetadata(null),
        compatibility: null,
        reason: null,
      };
    }

    return {
      status: file.missing ? "missing" : "invalid",
      resolvedPath: file.resolvedPath,
      packageName: null,
      exportName: null,
      packageVersion: null,
      conventions: null,
      metadata: getProjectConventionsMetadata(null),
      compatibility: null,
      reason: file.reason,
    };
  }

  try {
    const parsed = JSON.parse(file.contents) as unknown;
    if (!validateProjectConventionsPayload(parsed)) {
      return {
        status: "invalid",
        resolvedPath: file.resolvedPath,
        packageName: null,
        exportName: null,
        packageVersion: null,
        conventions: null,
        metadata: getProjectConventionsMetadata(null),
        compatibility: null,
        reason: `Project conventions at ${file.resolvedPath ?? input.filePath} do not match the bounded project_conventions_v1 data contract.`,
      };
    }

    const conventions = parsed;
    const metadata = getProjectConventionsMetadata(conventions);
    const compatibility = metadata.supportedSaltRange
      ? evaluatePackCompatibility({
          supportedSaltRange: metadata.supportedSaltRange,
          currentSaltVersion: input.currentSaltVersion,
        })
      : null;

    return {
      status: "resolved",
      resolvedPath: file.resolvedPath,
      packageName: null,
      exportName: null,
      packageVersion: null,
      conventions,
      metadata,
      compatibility,
      reason:
        compatibility && compatibility.status !== "compatible"
          ? compatibility.reason
          : null,
    };
  } catch {
    return {
      status: "unreadable",
      resolvedPath: file.resolvedPath,
      packageName: null,
      exportName: null,
      packageVersion: null,
      conventions: null,
      metadata: getProjectConventionsMetadata(null),
      compatibility: null,
      reason: `Could not parse project conventions at ${file.resolvedPath ?? input.filePath}.`,
    };
  }
}

export async function resolveProjectConventionsPackageLayer(input: {
  rootDir: string;
  specifier: string;
  exportName?: string;
  currentSaltVersion: string | null;
  optional?: boolean;
}): Promise<ProjectConventionsLayerResolution> {
  const descriptor = input.exportName
    ? `${input.specifier}#${input.exportName}`
    : input.specifier;
  return {
    status: "invalid",
    resolvedPath: null,
    packageName: input.specifier,
    exportName: input.exportName ?? null,
    packageVersion: null,
    conventions: null,
    metadata: getProjectConventionsMetadata(null),
    compatibility: null,
    reason: `Package-backed project-conventions layer ${descriptor} is unsupported. Salt MCP v1 treats project policy as data-only JSON and never imports or requires policy package code. Replace this layer with source.type "file" pointing to a repo-local JSON policy file.`,
  };
}
