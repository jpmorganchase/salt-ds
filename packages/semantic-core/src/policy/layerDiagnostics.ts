import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { coerce, minVersion, satisfies, valid, validRange } from "semver";
import type { ProjectConventions } from "./index.js";

const require = createRequire(import.meta.url);

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

interface PackageJsonLike {
  name?: string;
  version?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function isMissingModuleError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "MODULE_NOT_FOUND"
  );
}

function normalizeSaltVersion(
  version: string | null | undefined,
): string | null {
  if (typeof version !== "string") {
    return null;
  }

  const trimmed = version.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return (
    valid(trimmed) ??
    minVersion(trimmed)?.version ??
    coerce(trimmed)?.version ??
    null
  );
}

function extractProjectConventionsCandidate(
  value: unknown,
  exportName?: string,
): ProjectConventions | null {
  if (!isRecord(value)) {
    return null;
  }

  const directCandidate = exportName
    ? value[exportName]
    : ((value.default as unknown) ?? value.project_conventions_v1 ?? value);
  if (isRecord(directCandidate)) {
    return directCandidate as ProjectConventions;
  }

  if (!exportName && isRecord(value.default)) {
    return value.default as ProjectConventions;
  }

  if (
    exportName &&
    isRecord(value.default) &&
    isRecord(value.default[exportName])
  ) {
    return value.default[exportName] as ProjectConventions;
  }

  return null;
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
  installedVersions?: string[];
}): string | null {
  const uniqueResolved = [...new Set(input.resolvedVersions ?? [])];
  if (uniqueResolved.length === 1) {
    return normalizeSaltVersion(uniqueResolved[0]);
  }

  const uniqueInstalled = [...new Set(input.installedVersions ?? [])];
  if (uniqueInstalled.length === 1) {
    return normalizeSaltVersion(uniqueInstalled[0]);
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

function validateSharedPackMetadata(
  metadata: ProjectConventionsLayerMetadata,
): string | null {
  if (metadata.contract !== "project_conventions_v1") {
    return "The shared conventions pack must export a project_conventions_v1 object.";
  }

  if (!metadata.id) {
    return "The shared conventions pack must declare id.";
  }

  if (!metadata.version) {
    return "The shared conventions pack must declare version.";
  }

  if (!metadata.supportedSaltRange) {
    return "The shared conventions pack must declare supported_salt_range.";
  }

  const compatibility = evaluatePackCompatibility({
    supportedSaltRange: metadata.supportedSaltRange,
    currentSaltVersion: "0.0.0",
  });
  if (compatibility.status === "invalid-range") {
    return compatibility.reason;
  }

  return null;
}

export async function resolveProjectConventionsFileLayer(input: {
  filePath: string;
  currentSaltVersion: string | null;
  optional?: boolean;
}): Promise<ProjectConventionsLayerResolution> {
  let contents: string;

  try {
    contents = await fs.readFile(input.filePath, "utf8");
  } catch (error) {
    if (input.optional && isMissingFileError(error)) {
      return {
        status: "missing",
        resolvedPath: input.filePath,
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
      status: "missing",
      resolvedPath: input.filePath,
      packageName: null,
      exportName: null,
      packageVersion: null,
      conventions: null,
      metadata: getProjectConventionsMetadata(null),
      compatibility: null,
      reason: `Could not read project conventions at ${input.filePath}.`,
    };
  }

  try {
    const parsed = JSON.parse(contents) as unknown;
    if (!isRecord(parsed)) {
      return {
        status: "unreadable",
        resolvedPath: input.filePath,
        packageName: null,
        exportName: null,
        packageVersion: null,
        conventions: null,
        metadata: getProjectConventionsMetadata(null),
        compatibility: null,
        reason: `Could not parse project conventions at ${input.filePath}.`,
      };
    }

    const conventions = parsed as ProjectConventions;
    const metadata = getProjectConventionsMetadata(conventions);
    const compatibility = metadata.supportedSaltRange
      ? evaluatePackCompatibility({
          supportedSaltRange: metadata.supportedSaltRange,
          currentSaltVersion: input.currentSaltVersion,
        })
      : null;

    return {
      status: "resolved",
      resolvedPath: input.filePath,
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
      resolvedPath: input.filePath,
      packageName: null,
      exportName: null,
      packageVersion: null,
      conventions: null,
      metadata: getProjectConventionsMetadata(null),
      compatibility: null,
      reason: `Could not parse project conventions at ${input.filePath}.`,
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
  let packageJsonPath: string;

  try {
    packageJsonPath = require.resolve(`${input.specifier}/package.json`, {
      paths: [input.rootDir],
    });
  } catch (error) {
    if (input.optional && isMissingModuleError(error)) {
      return {
        status: "missing",
        resolvedPath: null,
        packageName: input.specifier,
        exportName: input.exportName ?? null,
        packageVersion: null,
        conventions: null,
        metadata: getProjectConventionsMetadata(null),
        compatibility: null,
        reason: null,
      };
    }

    return {
      status: "missing",
      resolvedPath: null,
      packageName: input.specifier,
      exportName: input.exportName ?? null,
      packageVersion: null,
      conventions: null,
      metadata: getProjectConventionsMetadata(null),
      compatibility: null,
      reason: `Could not resolve shared conventions pack ${descriptor}.`,
    };
  }

  let packageJson: PackageJsonLike | null = null;
  try {
    packageJson = JSON.parse(
      await fs.readFile(packageJsonPath, "utf8"),
    ) as PackageJsonLike;
  } catch {
    return {
      status: "unreadable",
      resolvedPath: packageJsonPath,
      packageName: input.specifier,
      exportName: input.exportName ?? null,
      packageVersion: null,
      conventions: null,
      metadata: getProjectConventionsMetadata(null),
      compatibility: null,
      reason: `Could not read package metadata for shared conventions pack ${descriptor}.`,
    };
  }

  let resolvedEntry: string;
  try {
    resolvedEntry = require.resolve(input.specifier, {
      paths: [input.rootDir],
    });
  } catch (error) {
    if (input.optional && isMissingModuleError(error)) {
      return {
        status: "missing",
        resolvedPath: packageJsonPath,
        packageName:
          typeof packageJson.name === "string"
            ? packageJson.name
            : input.specifier,
        exportName: input.exportName ?? null,
        packageVersion:
          typeof packageJson.version === "string" ? packageJson.version : null,
        conventions: null,
        metadata: getProjectConventionsMetadata(null),
        compatibility: null,
        reason: null,
      };
    }

    return {
      status: "invalid",
      resolvedPath: packageJsonPath,
      packageName:
        typeof packageJson.name === "string"
          ? packageJson.name
          : input.specifier,
      exportName: input.exportName ?? null,
      packageVersion:
        typeof packageJson.version === "string" ? packageJson.version : null,
      conventions: null,
      metadata: getProjectConventionsMetadata(null),
      compatibility: null,
      reason: `Could not resolve an executable export for shared conventions pack ${descriptor}.`,
    };
  }

  let conventions: ProjectConventions | null = null;
  try {
    const imported = await import(pathToFileURL(resolvedEntry).href);
    conventions = extractProjectConventionsCandidate(
      imported,
      input.exportName,
    );
  } catch {
    conventions = null;
  }

  if (!conventions) {
    try {
      const required = require(resolvedEntry) as unknown;
      conventions = extractProjectConventionsCandidate(
        required,
        input.exportName,
      );
    } catch {
      conventions = null;
    }
  }

  if (!conventions) {
    return {
      status: "invalid",
      resolvedPath: packageJsonPath,
      packageName:
        typeof packageJson.name === "string"
          ? packageJson.name
          : input.specifier,
      exportName: input.exportName ?? null,
      packageVersion:
        typeof packageJson.version === "string" ? packageJson.version : null,
      conventions: null,
      metadata: getProjectConventionsMetadata(null),
      compatibility: null,
      reason: `Shared conventions pack ${descriptor} did not export a project_conventions_v1 object.`,
    };
  }

  const metadata = getProjectConventionsMetadata(conventions);
  const metadataError = validateSharedPackMetadata(metadata);
  if (metadataError) {
    return {
      status: "invalid",
      resolvedPath: packageJsonPath,
      packageName:
        typeof packageJson.name === "string"
          ? packageJson.name
          : input.specifier,
      exportName: input.exportName ?? null,
      packageVersion:
        typeof packageJson.version === "string" ? packageJson.version : null,
      conventions: null,
      metadata,
      compatibility: null,
      reason: metadataError,
    };
  }

  const compatibility = evaluatePackCompatibility({
    supportedSaltRange: metadata.supportedSaltRange,
    currentSaltVersion: input.currentSaltVersion,
  });

  if (compatibility.status === "invalid-range") {
    return {
      status: "invalid",
      resolvedPath: packageJsonPath,
      packageName:
        typeof packageJson.name === "string"
          ? packageJson.name
          : input.specifier,
      exportName: input.exportName ?? null,
      packageVersion:
        typeof packageJson.version === "string" ? packageJson.version : null,
      conventions: null,
      metadata,
      compatibility,
      reason: compatibility.reason,
    };
  }

  return {
    status: "resolved",
    resolvedPath: packageJsonPath,
    packageName:
      typeof packageJson.name === "string" ? packageJson.name : input.specifier,
    exportName: input.exportName ?? null,
    packageVersion:
      typeof packageJson.version === "string" ? packageJson.version : null,
    conventions,
    metadata,
    compatibility,
    reason: compatibility.status !== "compatible" ? compatibility.reason : null,
  };
}
