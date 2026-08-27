import type { BigIntStats, Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import {
  compileWorkspacePatterns,
  inspectPackageJsonFile,
  inspectSaltProjectFacts,
  readBoundedProjectFile,
  type SaltPackageJsonLike,
} from "@salt-ds/knowledge";
import type { SaltScanLimits } from "../config/limits.js";
import { loadSaltConfig, type SaltCliConfig } from "../config/loadConfig.js";
import {
  type IgnoreRule,
  isGitIgnored,
  matchesPortableGlob,
  parseGitIgnore,
} from "./pathPatterns.js";

const SUPPORTED_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".css"]);
const FIXED_EXCLUDED_DIRECTORY_NAMES = new Set([
  ".cache",
  ".git",
  ".next",
  ".npm",
  ".pnpm-store",
  ".turbo",
  ".yarn",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "storybook-static",
]);
const MAX_GITIGNORE_BYTES = 256 * 1024;

export type DiscoveryCoverageReason =
  | "SCAN_TRAVERSAL_DEPTH_LIMIT"
  | "SCAN_VISITED_DIRECTORY_LIMIT"
  | "SCAN_DIRECTORY_ENTRY_LIMIT"
  | "SCAN_QUEUED_PATH_LIMIT"
  | "SCAN_SELECTED_FILE_LIMIT"
  | "SCAN_SELECTED_BYTES_LIMIT"
  | "SCAN_SOURCE_BYTES_LIMIT"
  | "SCAN_DISCOVERY_TIMEOUT"
  | "SCAN_PATH_CONTAINMENT_FAILURE"
  | "SCAN_WORKSPACE_OWNERSHIP_CONFLICT"
  | "SCAN_WORKSPACE_PATTERN_INVALID";

export type DiscoverySkipReason =
  | DiscoveryCoverageReason
  | "SCAN_FIXED_EXCLUSION"
  | "SCAN_CONFIG_EXCLUSION"
  | "SCAN_CONFIG_NOT_INCLUDED"
  | "SCAN_VCS_IGNORED"
  | "SCAN_UNSUPPORTED_EXTENSION"
  | "SCAN_WORKSPACE_NO_SELECTED_FILES";

export class SaltDiscoveryError extends Error {
  readonly code:
    | "SALT_PROJECT_ROOT_UNAVAILABLE"
    | "SALT_PROJECT_ROOT_NOT_DIRECTORY";
  readonly exitCode = 2;

  constructor(
    code: "SALT_PROJECT_ROOT_UNAVAILABLE" | "SALT_PROJECT_ROOT_NOT_DIRECTORY",
    message: string,
  ) {
    super(message);
    this.name = "SaltDiscoveryError";
    this.code = code;
  }
}

export interface DiscoveredSourceFile {
  path: string;
  workspace_unit_id: string;
  utf8_bytes: number;
  contents: string;
}

export interface DiscoveredWorkspaceUnit {
  workspace_unit_id: string;
  classification: "salt-application" | "library" | "unknown";
  classification_evidence: string[];
  workspace_claims: string[];
  package_vector: Array<{
    name: string;
    declared_version: string;
    observed_version: string | null;
    observed_manifest_path: string | null;
    satisfies_declaration: boolean | null;
  }>;
  package_evidence: {
    manager: string;
    manager_detection: string;
    layout: string;
    status: string;
  };
  owned_files: string[];
  untrusted_project_context: {
    salt_policy: "untrusted";
    team_config: "present" | "absent";
    stack_config: "present" | "absent";
  };
  limitations: string[];
}

export interface SaltProjectDiscovery {
  contract: "salt-project-discovery/1";
  schema_version: "1.0.0";
  root: ".";
  config: SaltCliConfig;
  counters: {
    visited_directories: number;
    directory_entries: number;
    queued_paths: number;
    selected_candidate_files: number;
    selected_files: number;
    selected_bytes: number;
  };
  workspace_units: DiscoveredWorkspaceUnit[];
  skipped_units: Array<{
    workspace_unit_id: string;
    reason: DiscoverySkipReason;
    workspace_claims: string[];
  }>;
  files: DiscoveredSourceFile[];
  skipped: Array<{ path: string; reason: DiscoverySkipReason }>;
  coverage: {
    status: "complete" | "partial" | "failed";
    reasons: DiscoveryCoverageReason[];
  };
}

interface QueueEntry {
  absolutePath: string;
  relativePath: string;
  depth: number;
  ignoreRules: IgnoreRule[];
}

interface PackageBoundary {
  workspace_unit_id: string;
  absolutePath: string;
  manifest: SaltPackageJsonLike | null;
  workspaceMatches: ((relativePath: string) => boolean) | null;
  workspacePatternInvalid: boolean;
}

function portableRelative(rootDir: string, targetPath: string): string {
  const relative = path.relative(rootDir, targetPath).split(path.sep).join("/");
  return relative === "" ? "." : relative;
}

function isPathInside(rootDir: string, candidatePath: string): boolean {
  const relative = path.relative(rootDir, candidatePath);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function sameDirectoryIdentity(left: BigIntStats, right: BigIntStats): boolean {
  return (
    left.isDirectory() &&
    right.isDirectory() &&
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mtimeNs === right.mtimeNs &&
    left.ctimeNs === right.ctimeNs
  );
}

type SafeDirectoryRead =
  | { status: "valid"; entries: Dirent[] }
  | { status: "limit" }
  | { status: "timeout" }
  | { status: "invalid" };

async function readDirectorySafely(input: {
  rootDir: string;
  directoryPath: string;
  remainingEntries: number;
  timedOut: () => boolean;
}): Promise<SafeDirectoryRead> {
  let before: BigIntStats;
  let realPath: string;
  try {
    before = await fs.lstat(input.directoryPath, { bigint: true });
    realPath = await fs.realpath(input.directoryPath);
  } catch {
    return { status: "invalid" };
  }
  if (
    !before.isDirectory() ||
    before.isSymbolicLink() ||
    !isPathInside(input.rootDir, realPath)
  ) {
    return { status: "invalid" };
  }
  const entries: Dirent[] = [];
  try {
    const directory = await fs.opendir(input.directoryPath);
    try {
      for await (const entry of directory) {
        if (input.timedOut()) return { status: "timeout" };
        if (entries.length >= input.remainingEntries)
          return { status: "limit" };
        entries.push(entry);
      }
    } finally {
      await directory.close().catch(() => undefined);
    }
    const [after, confirmedRealPath] = await Promise.all([
      fs.lstat(input.directoryPath, { bigint: true }),
      fs.realpath(input.directoryPath),
    ]);
    if (
      !sameDirectoryIdentity(before, after) ||
      path.relative(realPath, confirmedRealPath) !== "" ||
      !isPathInside(input.rootDir, confirmedRealPath)
    ) {
      return { status: "invalid" };
    }
  } catch {
    return { status: "invalid" };
  }
  entries.sort((left, right) => left.name.localeCompare(right.name));
  return { status: "valid", entries };
}

function configuredMatch(
  portablePath: string,
  patterns: readonly string[],
): boolean {
  return patterns.some((pattern) => matchesPortableGlob(portablePath, pattern));
}

function configuredDirectoryMatch(
  portablePath: string,
  patterns: readonly string[],
): boolean {
  return patterns.some(
    (pattern) =>
      matchesPortableGlob(portablePath, pattern) ||
      matchesPortableGlob(`${portablePath}/__salt_probe__`, pattern),
  );
}

function fixedExcluded(relativePath: string): boolean {
  const segments = relativePath.split("/");
  const leaf = segments.at(-1) ?? relativePath;
  return (
    FIXED_EXCLUDED_DIRECTORY_NAMES.has(leaf) ||
    relativePath === ".salt/knowledge" ||
    relativePath === "packages/knowledge/records" ||
    leaf === "generated-knowledge"
  );
}

function workspacePatterns(manifest: SaltPackageJsonLike | null): {
  matches: ((relativePath: string) => boolean) | null;
  invalid: boolean;
} {
  const compiled = compileWorkspacePatterns(manifest?.workspaces);
  if (compiled.status === "invalid") {
    return { matches: null, invalid: true };
  }
  if (compiled.status === "absent") {
    return { matches: null, invalid: false };
  }
  return {
    matches: compiled.matches,
    invalid: false,
  };
}

function allDependencyNames(manifest: SaltPackageJsonLike | null): string[] {
  const sections = [
    manifest?.dependencies,
    manifest?.devDependencies,
    manifest?.optionalDependencies,
    manifest?.peerDependencies,
  ];
  return [
    ...new Set(
      sections.flatMap((section) =>
        section && typeof section === "object" ? Object.keys(section) : [],
      ),
    ),
  ].sort();
}

function classifyWorkspace(manifest: SaltPackageJsonLike | null): {
  classification: DiscoveredWorkspaceUnit["classification"];
  evidence: string[];
} {
  if (!manifest)
    return { classification: "unknown", evidence: ["manifest:absent"] };
  const saltDependencies = allDependencyNames(manifest).filter((name) =>
    name.startsWith("@salt-ds/"),
  );
  const libraryEntrypoints = ["exports", "main", "module", "types"].filter(
    (field) => manifest[field as keyof SaltPackageJsonLike] !== undefined,
  );
  const evidence = [
    ...saltDependencies.map((name) => `salt_dependency:${name}`),
    ...libraryEntrypoints.map((field) => `library_entrypoint:${field}`),
    ...(manifest.private === true ? ["manifest_private:true"] : []),
  ].sort();
  if (libraryEntrypoints.length > 0 && typeof manifest.name === "string") {
    return { classification: "library", evidence };
  }
  if (saltDependencies.length > 0 && manifest.private === true) {
    return { classification: "salt-application", evidence };
  }
  return {
    classification: "unknown",
    evidence: evidence.length > 0 ? evidence : ["manifest:inconclusive"],
  };
}

function relativeFromBoundary(boundaryId: string, candidateId: string): string {
  return boundaryId === "."
    ? candidateId
    : candidateId.slice(boundaryId.length + 1);
}

function claimsForBoundary(
  candidate: PackageBoundary,
  boundaries: ReadonlyMap<string, PackageBoundary>,
): string[] {
  if (candidate.workspace_unit_id === ".") return [];
  const claims: string[] = [];
  let ancestor = path.posix.dirname(candidate.workspace_unit_id);
  for (;;) {
    const owner = boundaries.get(ancestor);
    if (
      owner?.workspaceMatches?.(
        relativeFromBoundary(
          owner.workspace_unit_id,
          candidate.workspace_unit_id,
        ),
      )
    ) {
      claims.push(owner.workspace_unit_id);
    }
    if (ancestor === ".") break;
    ancestor = path.posix.dirname(ancestor);
  }
  return claims.sort();
}

function owningBoundary(
  filePath: string,
  boundaries: ReadonlyMap<string, PackageBoundary>,
): PackageBoundary {
  const rootBoundary = boundaries.get(".");
  if (!rootBoundary) {
    throw new Error("Discovery root workspace boundary is missing.");
  }
  let ancestor = path.posix.dirname(filePath);
  for (;;) {
    const boundary = boundaries.get(ancestor);
    if (boundary) return boundary;
    if (ancestor === ".") return rootBoundary;
    ancestor = path.posix.dirname(ancestor);
  }
}

function relativeManifestPath(
  rootDir: string,
  manifestPath: string | null,
): string | null {
  if (!manifestPath) return null;
  const absolutePath = path.resolve(manifestPath);
  return isPathInside(rootDir, absolutePath)
    ? portableRelative(rootDir, absolutePath)
    : null;
}

async function mapConcurrent<T, R>(
  entries: readonly T[],
  concurrency: number,
  mapper: (entry: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(entries.length);
  let nextIndex = 0;
  const worker = async () => {
    for (;;) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= entries.length) return;
      results[index] = await mapper(entries[index]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, entries.length) }, worker),
  );
  return results;
}

export async function discoverSaltProject(input: {
  rootDir: string;
  now?: () => number;
}): Promise<SaltProjectDiscovery> {
  const requestedRoot = path.resolve(input.rootDir);
  let rootDir: string;
  let rootStats: BigIntStats;
  try {
    rootDir = await fs.realpath(requestedRoot);
    rootStats = await fs.lstat(rootDir, { bigint: true });
  } catch {
    throw new SaltDiscoveryError(
      "SALT_PROJECT_ROOT_UNAVAILABLE",
      "The project root is unavailable.",
    );
  }
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
    throw new SaltDiscoveryError(
      "SALT_PROJECT_ROOT_NOT_DIRECTORY",
      "The project root is not a canonical directory.",
    );
  }

  const config = await loadSaltConfig({ authorityRoot: rootDir });
  const limits: SaltScanLimits = config.limits;
  const now = input.now ?? (() => performance.now());
  const startedAt = now();
  const timedOut = () => now() - startedAt > limits.discovery_elapsed_ms;
  let visitedDirectories = 0;
  let directoryEntries = 0;
  let queuedPaths = 1;
  let selectedBytes = 0;
  const selectedCandidates: Array<
    Omit<DiscoveredSourceFile, "workspace_unit_id">
  > = [];
  const skipped: SaltProjectDiscovery["skipped"] = [];
  const partialReasons = new Set<DiscoveryCoverageReason>();
  const failedReasons = new Set<DiscoveryCoverageReason>();
  const boundaryMap = new Map<string, PackageBoundary>();

  const rootManifestInspection = await inspectPackageJsonFile(
    path.join(rootDir, "package.json"),
    rootDir,
    rootDir,
  );
  const rootManifest =
    rootManifestInspection.status === "valid"
      ? rootManifestInspection.value
      : null;
  const rootWorkspacePatterns = workspacePatterns(rootManifest);
  boundaryMap.set(".", {
    workspace_unit_id: ".",
    absolutePath: rootDir,
    manifest: rootManifest,
    workspaceMatches: rootWorkspacePatterns.matches,
    workspacePatternInvalid: rootWorkspacePatterns.invalid,
  });
  if (rootManifestInspection.status === "invalid") {
    failedReasons.add("SCAN_PATH_CONTAINMENT_FAILURE");
    skipped.push({
      path: "package.json",
      reason: "SCAN_PATH_CONTAINMENT_FAILURE",
    });
  }

  const queue: QueueEntry[] = [
    { absolutePath: rootDir, relativePath: ".", depth: 0, ignoreRules: [] },
  ];
  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const current = queue[queueIndex];
    if (timedOut()) {
      failedReasons.add("SCAN_DISCOVERY_TIMEOUT");
      break;
    }
    if (current.depth > limits.traversal_depth) {
      partialReasons.add("SCAN_TRAVERSAL_DEPTH_LIMIT");
      skipped.push({
        path: current.relativePath,
        reason: "SCAN_TRAVERSAL_DEPTH_LIMIT",
      });
      continue;
    }
    if (visitedDirectories >= limits.visited_directories) {
      partialReasons.add("SCAN_VISITED_DIRECTORY_LIMIT");
      skipped.push({
        path: current.relativePath,
        reason: "SCAN_VISITED_DIRECTORY_LIMIT",
      });
      continue;
    }
    visitedDirectories += 1;
    const directory = await readDirectorySafely({
      rootDir,
      directoryPath: current.absolutePath,
      remainingEntries: limits.directory_entries - directoryEntries,
      timedOut,
    });
    if (directory.status === "timeout") {
      failedReasons.add("SCAN_DISCOVERY_TIMEOUT");
      break;
    }
    if (directory.status === "limit") {
      partialReasons.add("SCAN_DIRECTORY_ENTRY_LIMIT");
      skipped.push({
        path: current.relativePath,
        reason: "SCAN_DIRECTORY_ENTRY_LIMIT",
      });
      continue;
    }
    if (directory.status === "invalid") {
      failedReasons.add("SCAN_PATH_CONTAINMENT_FAILURE");
      skipped.push({
        path: current.relativePath,
        reason: "SCAN_PATH_CONTAINMENT_FAILURE",
      });
      continue;
    }
    directoryEntries += directory.entries.length;

    let ignoreRules = current.ignoreRules;
    if (directory.entries.some((entry) => entry.name === ".gitignore")) {
      const gitIgnore = await readBoundedProjectFile({
        authorityRoot: rootDir,
        rootDir: current.absolutePath,
        filePath: path.join(current.absolutePath, ".gitignore"),
        maxUtf8Bytes: MAX_GITIGNORE_BYTES,
      });
      if (gitIgnore.status === "valid") {
        ignoreRules = [
          ...ignoreRules,
          ...parseGitIgnore(gitIgnore.text, current.relativePath),
        ];
      } else if (gitIgnore.status === "invalid") {
        failedReasons.add("SCAN_PATH_CONTAINMENT_FAILURE");
        skipped.push({
          path:
            current.relativePath === "."
              ? ".gitignore"
              : `${current.relativePath}/.gitignore`,
          reason: "SCAN_PATH_CONTAINMENT_FAILURE",
        });
      }
    }

    for (const entry of directory.entries) {
      if (timedOut()) {
        failedReasons.add("SCAN_DISCOVERY_TIMEOUT");
        queue.length = queueIndex + 1;
        break;
      }
      if (entry.name === ".gitignore" || entry.name === "salt.config.json")
        continue;
      const absolutePath = path.join(current.absolutePath, entry.name);
      const relativePath =
        current.relativePath === "."
          ? entry.name
          : `${current.relativePath}/${entry.name}`;
      const isDirectory = entry.isDirectory();
      if (fixedExcluded(relativePath)) {
        skipped.push({ path: relativePath, reason: "SCAN_FIXED_EXCLUSION" });
        continue;
      }
      if (isGitIgnored(relativePath, isDirectory, ignoreRules)) {
        skipped.push({ path: relativePath, reason: "SCAN_VCS_IGNORED" });
        continue;
      }
      if (
        isDirectory || entry.isSymbolicLink()
          ? configuredDirectoryMatch(relativePath, config.exclude)
          : configuredMatch(relativePath, config.exclude)
      ) {
        skipped.push({ path: relativePath, reason: "SCAN_CONFIG_EXCLUSION" });
        continue;
      }
      if (entry.isSymbolicLink() || (!entry.isFile() && !isDirectory)) {
        failedReasons.add("SCAN_PATH_CONTAINMENT_FAILURE");
        skipped.push({
          path: relativePath,
          reason: "SCAN_PATH_CONTAINMENT_FAILURE",
        });
        continue;
      }
      if (isDirectory) {
        if (queuedPaths >= limits.queued_paths) {
          partialReasons.add("SCAN_QUEUED_PATH_LIMIT");
          skipped.push({
            path: relativePath,
            reason: "SCAN_QUEUED_PATH_LIMIT",
          });
          continue;
        }
        queuedPaths += 1;
        queue.push({
          absolutePath,
          relativePath,
          depth: current.depth + 1,
          ignoreRules,
        });
        continue;
      }
      if (entry.name === "package.json") {
        if (relativePath === "package.json") continue;
        const inspection = await inspectPackageJsonFile(
          absolutePath,
          current.absolutePath,
          rootDir,
        );
        if (inspection.status === "invalid") {
          failedReasons.add("SCAN_PATH_CONTAINMENT_FAILURE");
          skipped.push({
            path: relativePath,
            reason: "SCAN_PATH_CONTAINMENT_FAILURE",
          });
          continue;
        }
        if (inspection.status === "valid") {
          const unitId = current.relativePath;
          const patterns = workspacePatterns(inspection.value);
          boundaryMap.set(unitId, {
            workspace_unit_id: unitId,
            absolutePath: current.absolutePath,
            manifest: inspection.value,
            workspaceMatches: patterns.matches,
            workspacePatternInvalid: patterns.invalid,
          });
        }
        continue;
      }
      if (!SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        skipped.push({
          path: relativePath,
          reason: "SCAN_UNSUPPORTED_EXTENSION",
        });
        continue;
      }
      if (
        config.include.length > 0 &&
        !configuredMatch(relativePath, config.include)
      ) {
        skipped.push({
          path: relativePath,
          reason: "SCAN_CONFIG_NOT_INCLUDED",
        });
        continue;
      }
      if (selectedCandidates.length >= limits.selected_files) {
        partialReasons.add("SCAN_SELECTED_FILE_LIMIT");
        skipped.push({
          path: relativePath,
          reason: "SCAN_SELECTED_FILE_LIMIT",
        });
        continue;
      }
      let preliminarySize: number;
      try {
        const stats = await fs.lstat(absolutePath, { bigint: true });
        preliminarySize = Number(stats.size);
      } catch {
        failedReasons.add("SCAN_PATH_CONTAINMENT_FAILURE");
        skipped.push({
          path: relativePath,
          reason: "SCAN_PATH_CONTAINMENT_FAILURE",
        });
        continue;
      }
      if (preliminarySize > limits.individual_source_bytes) {
        partialReasons.add("SCAN_SOURCE_BYTES_LIMIT");
        skipped.push({ path: relativePath, reason: "SCAN_SOURCE_BYTES_LIMIT" });
        continue;
      }
      if (preliminarySize > limits.selected_aggregate_bytes - selectedBytes) {
        partialReasons.add("SCAN_SELECTED_BYTES_LIMIT");
        skipped.push({
          path: relativePath,
          reason: "SCAN_SELECTED_BYTES_LIMIT",
        });
        continue;
      }
      const source = await readBoundedProjectFile({
        authorityRoot: rootDir,
        rootDir: current.absolutePath,
        filePath: absolutePath,
        maxUtf8Bytes: Math.min(
          limits.individual_source_bytes,
          limits.selected_aggregate_bytes - selectedBytes,
        ),
      });
      if (source.status !== "valid") {
        if (source.status === "invalid" && source.reason === "oversized") {
          partialReasons.add("SCAN_SOURCE_BYTES_LIMIT");
          skipped.push({
            path: relativePath,
            reason: "SCAN_SOURCE_BYTES_LIMIT",
          });
        } else {
          failedReasons.add("SCAN_PATH_CONTAINMENT_FAILURE");
          skipped.push({
            path: relativePath,
            reason: "SCAN_PATH_CONTAINMENT_FAILURE",
          });
        }
        continue;
      }
      selectedBytes += source.utf8_bytes;
      selectedCandidates.push({
        path: relativePath,
        utf8_bytes: source.utf8_bytes,
        contents: source.text,
      });
    }
  }

  const boundaries = [...boundaryMap.values()].sort((left, right) =>
    left.workspace_unit_id.localeCompare(right.workspace_unit_id),
  );
  if (boundaries.some((boundary) => boundary.workspacePatternInvalid)) {
    failedReasons.add("SCAN_WORKSPACE_PATTERN_INVALID");
  }
  const boundaryClaims = new Map(
    boundaries.map((boundary) => [
      boundary.workspace_unit_id,
      claimsForBoundary(boundary, boundaryMap),
    ]),
  );
  const ambiguousBoundaries = new Set(
    boundaries
      .filter(
        (boundary) =>
          (boundaryClaims.get(boundary.workspace_unit_id)?.length ?? 0) > 1,
      )
      .map((boundary) => boundary.workspace_unit_id),
  );
  if (ambiguousBoundaries.size > 0) {
    failedReasons.add("SCAN_WORKSPACE_OWNERSHIP_CONFLICT");
  }

  const files: DiscoveredSourceFile[] = [];
  for (const candidate of selectedCandidates) {
    const owner = owningBoundary(candidate.path, boundaryMap);
    if (ambiguousBoundaries.has(owner.workspace_unit_id)) {
      skipped.push({
        path: candidate.path,
        reason: "SCAN_WORKSPACE_OWNERSHIP_CONFLICT",
      });
      continue;
    }
    files.push({ ...candidate, workspace_unit_id: owner.workspace_unit_id });
  }
  files.sort(
    (left, right) =>
      left.workspace_unit_id.localeCompare(right.workspace_unit_id) ||
      left.path.localeCompare(right.path),
  );
  const filesByUnit = new Map<string, string[]>();
  for (const file of files) {
    const owned = filesByUnit.get(file.workspace_unit_id) ?? [];
    owned.push(file.path);
    filesByUnit.set(file.workspace_unit_id, owned);
  }

  const activeBoundaries = boundaries.filter(
    (boundary) =>
      !ambiguousBoundaries.has(boundary.workspace_unit_id) &&
      (boundary.workspace_unit_id === "." ||
        filesByUnit.has(boundary.workspace_unit_id)),
  );
  if (timedOut()) failedReasons.add("SCAN_DISCOVERY_TIMEOUT");
  const workspaceUnits = await mapConcurrent(
    activeBoundaries,
    4,
    async (boundary) => {
      const [{ facts, limitations }, classification] = await Promise.all([
        inspectSaltProjectFacts({
          rootDir: boundary.absolutePath,
          authorityRoot: rootDir,
        }),
        Promise.resolve(classifyWorkspace(boundary.manifest)),
      ]);
      return {
        workspace_unit_id: boundary.workspace_unit_id,
        classification: classification.classification,
        classification_evidence: classification.evidence,
        workspace_claims: boundaryClaims.get(boundary.workspace_unit_id) ?? [],
        package_vector: facts.installation.resolvedPackages
          .map((entry) => ({
            name: entry.name,
            declared_version: entry.declaredVersion,
            observed_version: entry.resolvedVersion,
            observed_manifest_path: relativeManifestPath(
              rootDir,
              entry.resolvedPath,
            ),
            satisfies_declaration: entry.satisfiesDeclaredVersion,
          }))
          .sort((left, right) => left.name.localeCompare(right.name)),
        package_evidence: {
          manager: facts.installation.inspection.packageManager,
          manager_detection:
            facts.installation.inspection.packageManagerDetectionStatus,
          layout: facts.installation.inspection.packageLayout,
          status: facts.installation.inspection.status,
        },
        owned_files: [
          ...(filesByUnit.get(boundary.workspace_unit_id) ?? []),
        ].sort(),
        untrusted_project_context: {
          salt_policy: "untrusted" as const,
          team_config: facts.policy.detection.team_config_path
            ? ("present" as const)
            : ("absent" as const),
          stack_config: facts.policy.detection.stack_config_path
            ? ("present" as const)
            : ("absent" as const),
        },
        limitations: [...new Set(limitations)].sort(),
      };
    },
  );
  if (timedOut()) failedReasons.add("SCAN_DISCOVERY_TIMEOUT");

  const skippedUnits = boundaries
    .filter(
      (boundary) =>
        boundary.workspace_unit_id !== "." &&
        (ambiguousBoundaries.has(boundary.workspace_unit_id) ||
          !filesByUnit.has(boundary.workspace_unit_id)),
    )
    .map((boundary) => ({
      workspace_unit_id: boundary.workspace_unit_id,
      reason: ambiguousBoundaries.has(boundary.workspace_unit_id)
        ? ("SCAN_WORKSPACE_OWNERSHIP_CONFLICT" as const)
        : ("SCAN_WORKSPACE_NO_SELECTED_FILES" as const),
      workspace_claims: boundaryClaims.get(boundary.workspace_unit_id) ?? [],
    }))
    .sort((left, right) =>
      left.workspace_unit_id.localeCompare(right.workspace_unit_id),
    );

  skipped.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.reason.localeCompare(right.reason),
  );
  const reasons = [...failedReasons, ...partialReasons].sort();
  return {
    contract: "salt-project-discovery/1",
    schema_version: "1.0.0",
    root: ".",
    config,
    counters: {
      visited_directories: visitedDirectories,
      directory_entries: directoryEntries,
      queued_paths: queuedPaths,
      selected_candidate_files: selectedCandidates.length,
      selected_files: files.length,
      selected_bytes: selectedBytes,
    },
    workspace_units: workspaceUnits.sort((left, right) =>
      left.workspace_unit_id.localeCompare(right.workspace_unit_id),
    ),
    skipped_units: skippedUnits,
    files,
    skipped,
    coverage: {
      status:
        failedReasons.size > 0
          ? "failed"
          : partialReasons.size > 0
            ? "partial"
            : "complete",
      reasons,
    },
  };
}
