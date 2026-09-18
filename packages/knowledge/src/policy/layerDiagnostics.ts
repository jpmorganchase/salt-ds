import path from "node:path";
import { satisfies, valid, validRange } from "semver";
import { readBoundedProjectFile } from "../project/boundedProjectFile.js";
import type { ProjectConventions, ProjectConventionsStack } from "./index.js";

export const MAX_PROJECT_POLICY_FILE_BYTES = 512 * 1024;
const MAX_PROJECT_POLICY_ENTRIES = 100;
const MAX_PROJECT_CONVENTION_LAYERS = 8;
export const MAX_PROJECT_POLICY_STACK_BYTES =
  MAX_PROJECT_POLICY_FILE_BYTES * (MAX_PROJECT_CONVENTION_LAYERS + 1);
export const MAX_PROJECT_POLICY_STRING_LENGTH = 4_096;

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

function isBoundedString(value: unknown, allowEmpty = false): value is string {
  return (
    typeof value === "string" &&
    Array.from(value).length <= MAX_PROJECT_POLICY_STRING_LENGTH &&
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

export function parseProjectConventionsPayload(input: unknown): {
  conventions: ProjectConventions | null;
  reason: string | null;
} {
  return validateProjectConventionsPayload(input)
    ? { conventions: input, reason: null }
    : {
        conventions: null,
        reason:
          "Project conventions do not match the bounded project_conventions_v1 data contract.",
      };
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
      source.type === "file" &&
      hasOnlyKeys(source, ["type", "path"]) &&
      isBoundedString(source.path);
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
  authorityRoot?: string;
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
  authorityRoot?: string;
  filePath: string;
  rootDir?: string;
}): Promise<{
  contents: string | null;
  resolvedPath: string | null;
  missing: boolean;
  reason: string | null;
}> {
  const absolutePath = path.resolve(input.filePath);
  const rootDir = input.rootDir ?? path.dirname(absolutePath);
  const file = await readBoundedProjectFile({
    authorityRoot: input.authorityRoot ?? rootDir,
    rootDir,
    filePath: absolutePath,
    maxUtf8Bytes: MAX_PROJECT_POLICY_FILE_BYTES,
  });
  if (file.status === "absent") {
    return {
      contents: null,
      resolvedPath: absolutePath,
      missing: true,
      reason: "The project policy file is absent.",
    };
  }
  if (file.status === "invalid") {
    const reason = {
      outside_root:
        "The project policy file is outside the authorized root after realpath resolution.",
      not_file: "The project policy marker is not a regular file.",
      multiple_links:
        "The project policy file has multiple hard links and cannot be trusted as a unique project input.",
      unreadable: "The project policy file is unreadable.",
      oversized: `The project policy file exceeds the ${MAX_PROJECT_POLICY_FILE_BYTES}-byte inspection limit.`,
      changed_during_inspection:
        "The project policy file changed during bounded inspection.",
      identity_unavailable:
        "The project policy file has no stable filesystem identity for bounded inspection.",
    }[file.reason];
    return {
      contents: null,
      resolvedPath: absolutePath,
      missing: false,
      reason,
    };
  }
  return {
    contents: file.text,
    resolvedPath: file.path,
    missing: false,
    reason: null,
  };
}

function normalizeSaltVersion(
  version: string | null | undefined,
): string | null {
  return version ? valid(version.trim()) : null;
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
  resolvedPackages?: readonly {
    name: string;
    resolvedVersion: string | null;
  }[];
}): string | null {
  const observedCore = (input.resolvedPackages ?? []).filter(
    (entry) => entry.name === "@salt-ds/core",
  );
  if (observedCore.length === 0) return null;
  const exactVersions = observedCore.map((entry) =>
    entry.resolvedVersion ? valid(entry.resolvedVersion.trim()) : null,
  );
  if (exactVersions.some((version) => version === null)) return null;
  const uniqueExactVersions = [...new Set(exactVersions as string[])];
  return uniqueExactVersions.length === 1 ? uniqueExactVersions[0]! : null;
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
        "Salt version compatibility could not be verified because no exact resolved @salt-ds/core version was observed for the repo.",
    };
  }

  if (satisfies(checkedVersion, normalizedRange)) {
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
  authorityRoot?: string;
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
