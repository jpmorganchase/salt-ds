import fs from "node:fs/promises";
import path from "node:path";
import { JSON_SCHEMA, load as parseYaml } from "js-yaml";
import micromatch from "micromatch";
import { satisfies, valid, validRange } from "semver";
import {
  inspectProjectFileMetadata,
  readBoundedProjectFile,
} from "./boundedProjectFile.js";
import type {
  SaltInstallationDiagnostics,
  SaltInstallationWorkspace,
  SaltPackageDescriptor,
  SaltPackageManagerInspection,
  SaltPackageVersionHealth,
} from "./projectFacts.js";

export interface SaltPackageJsonLike {
  name?: string;
  version?: string;
  private?: boolean;
  main?: string;
  module?: string;
  types?: string;
  exports?: unknown;
  packageManager?: string;
  workspaces?: unknown;
  scripts?: Record<string, string>;
  overrides?: unknown;
  resolutions?: unknown;
  pnpm?: { overrides?: unknown };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface CollectSaltInstallationOptions {
  packageManager?: string;
  authorityRoot?: string;
  workspaceScope?: SaltWorkspaceScope;
}

export const MAX_PACKAGE_JSON_BYTES = 1024 * 1024;
export const MAX_PNPM_WORKSPACE_BYTES = 512 * 1024;
export const MAX_WORKSPACE_ANCESTOR_DIRECTORIES = 32;
export const MAX_WORKSPACE_PATTERNS = 128;
export const MAX_WORKSPACE_PATTERN_UTF8_BYTES = 1_024;
const MAX_RESOLVED_SALT_PACKAGES = 128;
const PACKAGE_RESOLUTION_CONCURRENCY = 8;
const SALT_PACKAGE_NAME_PATTERN = /^@salt-ds\/[a-z0-9][a-z0-9._-]{0,204}$/;
export const SALT_INSTALLATION_SCOPE_LIMITATION =
  "Salt inspected only declared packages through bounded manifest resolution; full dependency-graph and duplicate-install diagnosis is outside this inspection scope.";

export type MarkerInspectionReason =
  | "outside_root"
  | "not_file"
  | "multiple_links"
  | "unreadable"
  | "oversized"
  | "changed_during_inspection"
  | "identity_unavailable"
  | "parse_error"
  | "workspace_pattern_error";

export type MarkerInspection<T> =
  | { status: "absent"; path: null }
  | { status: "valid"; path: string; value: T }
  | { status: "invalid"; path: string; reason: MarkerInspectionReason };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function workspacePatterns(value: unknown): string[] {
  const candidates = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.packages)
      ? value.packages
      : [];
  return candidates.flatMap((entry) =>
    typeof entry === "string" && entry.trim().length > 0
      ? [entry.trim().replaceAll("\\", "/").replace(/^\.\//, "")]
      : [],
  );
}

export interface CompiledWorkspacePatterns {
  status: "valid";
  patterns: string[];
  hasPositivePattern: boolean;
  matches: (relativePath: string) => boolean;
}

export type WorkspacePatternCompilation =
  | { status: "absent" }
  | { status: "invalid" }
  | CompiledWorkspacePatterns;

function hasExcessiveNumericRange(pattern: string): boolean {
  for (const match of pattern.matchAll(
    /\{(-?\d+)\.\.(-?\d+)(?:\.\.(-?\d+))?\}/gu,
  )) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    const step = Math.abs(Number(match[3] ?? 1));
    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      !Number.isSafeInteger(step) ||
      step === 0 ||
      Math.floor(Math.abs(end - start) / step) + 1 > 1_000
    ) {
      return true;
    }
  }
  return false;
}

export function compileWorkspacePatterns(
  value: unknown,
): WorkspacePatternCompilation {
  const candidates = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.packages)
      ? value.packages
      : null;
  if (candidates === null) return { status: "absent" };
  if (
    candidates.length > MAX_WORKSPACE_PATTERNS ||
    candidates.some(
      (entry) =>
        typeof entry !== "string" ||
        entry.trim().length === 0 ||
        Buffer.byteLength(entry, "utf8") > MAX_WORKSPACE_PATTERN_UTF8_BYTES ||
        hasExcessiveNumericRange(entry),
    )
  ) {
    return { status: "invalid" };
  }
  const patterns = workspacePatterns(candidates);
  try {
    const positive = patterns
      .filter((pattern) => !pattern.startsWith("!"))
      .map((pattern) =>
        micromatch.matcher(pattern, {
          dot: false,
          nocase: false,
          nonegate: true,
          maxLength: MAX_WORKSPACE_PATTERN_UTF8_BYTES,
        }),
      );
    const negative = patterns
      .filter((pattern) => pattern.startsWith("!"))
      .map((pattern) =>
        micromatch.matcher(pattern.slice(1), {
          dot: false,
          nocase: false,
          nonegate: true,
          maxLength: MAX_WORKSPACE_PATTERN_UTF8_BYTES,
        }),
      );
    return {
      status: "valid",
      patterns,
      hasPositivePattern: positive.length > 0,
      matches: (relativePath) =>
        positive.some((matches) => matches(relativePath)) &&
        !negative.some((matches) => matches(relativePath)),
    };
  } catch {
    return { status: "invalid" };
  }
}

function workspaceContainsPackage(
  workspaceRoot: string,
  packageRoot: string,
  workspaces: CompiledWorkspacePatterns,
): boolean {
  const relativePath = path
    .relative(workspaceRoot, packageRoot)
    .split(path.sep)
    .join("/");
  return (
    relativePath.length > 0 &&
    !relativePath.startsWith("../") &&
    workspaces.matches(relativePath)
  );
}

function dependencyEntries(value: unknown): Array<[string, string]> {
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([name, version]) =>
    SALT_PACKAGE_NAME_PATTERN.test(name) &&
    typeof version === "string" &&
    version.trim().length > 0
      ? [[name, version.trim()]]
      : [],
  );
}

export async function inspectPackageJsonFile(
  packageJsonPath: string | null,
  containingRoot?: string,
  authorityRoot?: string,
): Promise<MarkerInspection<SaltPackageJsonLike>> {
  if (!packageJsonPath) return { status: "absent", path: null };
  const absolutePath = path.resolve(packageJsonPath);
  const normalizedPath = toPosix(absolutePath);
  const absoluteRoot = path.resolve(
    containingRoot ?? path.dirname(absolutePath),
  );
  if (!isPathInside(absoluteRoot, absolutePath)) {
    return { status: "invalid", path: normalizedPath, reason: "outside_root" };
  }
  const file = await readBoundedProjectFile({
    authorityRoot: authorityRoot ?? absoluteRoot,
    rootDir: absoluteRoot,
    filePath: absolutePath,
    maxUtf8Bytes: MAX_PACKAGE_JSON_BYTES,
  });
  if (file.status === "absent") return { status: "absent", path: null };
  if (file.status === "invalid") {
    return { status: "invalid", path: normalizedPath, reason: file.reason };
  }
  try {
    const parsed = JSON.parse(file.text) as unknown;
    return isRecord(parsed)
      ? { status: "valid", path: file.path, value: parsed }
      : { status: "invalid", path: normalizedPath, reason: "parse_error" };
  } catch {
    return { status: "invalid", path: normalizedPath, reason: "parse_error" };
  }
}

interface PnpmWorkspaceConfiguration {
  packages: string[];
  catalog: Record<string, string>;
  catalogs: Record<string, Record<string, string>>;
}

async function inspectPnpmWorkspaceConfiguration(
  rootDir: string,
  authorityRoot: string = rootDir,
): Promise<MarkerInspection<PnpmWorkspaceConfiguration>> {
  const file = await readBoundedProjectFile({
    authorityRoot,
    rootDir,
    filePath: path.join(rootDir, "pnpm-workspace.yaml"),
    maxUtf8Bytes: MAX_PNPM_WORKSPACE_BYTES,
  });
  if (file.status === "absent") return { status: "absent", path: null };
  if (file.status === "invalid") {
    return { status: "invalid", path: file.path, reason: file.reason };
  }
  let parsed: unknown;
  try {
    parsed = parseYaml(file.text, { schema: JSON_SCHEMA });
  } catch {
    return { status: "invalid", path: file.path, reason: "parse_error" };
  }
  if (!isRecord(parsed)) {
    return { status: "invalid", path: file.path, reason: "parse_error" };
  }
  const packagePatterns = compileWorkspacePatterns(parsed.packages);
  if (packagePatterns.status === "invalid") {
    return {
      status: "invalid",
      path: file.path,
      reason: "workspace_pattern_error",
    };
  }
  const packages =
    packagePatterns.status === "valid" ? packagePatterns.patterns : [];
  const collectCatalog = (value: unknown): Record<string, string> =>
    isRecord(value)
      ? Object.fromEntries(
          Object.entries(value).flatMap(([name, version]) =>
            typeof version === "string" && version.trim().length > 0
              ? [[name, version.trim()]]
              : [],
          ),
        )
      : {};
  const catalogs = isRecord(parsed.catalogs)
    ? Object.fromEntries(
        Object.entries(parsed.catalogs).map(([name, value]) => [
          name,
          collectCatalog(value),
        ]),
      )
    : {};
  return {
    status: "valid",
    path: file.path,
    value: { packages, catalog: collectCatalog(parsed.catalog), catalogs },
  };
}

async function isRegularMarker(
  rootDir: string,
  targetPath: string,
  authorityRoot: string = rootDir,
): Promise<boolean> {
  return (
    (await inspectPackageManagerMarker(rootDir, targetPath, authorityRoot))
      .status === "valid"
  );
}

export interface PackageManagerDetection {
  packageManager: string;
  status: SaltPackageManagerInspection["packageManagerDetectionStatus"];
  detectedManagers: string[];
  invalidMarkers: Array<{ fileName: string; reason: MarkerInspectionReason }>;
  issues: string[];
}

async function inspectPackageManagerMarker(
  rootDir: string,
  targetPath: string,
  authorityRoot: string = rootDir,
): Promise<MarkerInspection<true>> {
  const file = await inspectProjectFileMetadata({
    authorityRoot,
    rootDir,
    filePath: targetPath,
  });
  if (file.status === "absent") return { status: "absent", path: null };
  if (file.status === "invalid") {
    return { status: "invalid", path: file.path, reason: file.reason };
  }
  return { status: "valid", path: file.path, value: true };
}

function declaredPackageManagerName(
  packageJson: SaltPackageJsonLike | null,
): string | null {
  const declared =
    typeof packageJson?.packageManager === "string"
      ? packageJson.packageManager.trim()
      : "";
  if (!declared) return null;
  const separator = declared.indexOf("@");
  const name = separator === -1 ? declared : declared.slice(0, separator);
  return /^[a-z0-9][a-z0-9._-]*$/iu.test(name) ? name : null;
}

export async function detectPackageManager(
  rootDir: string,
  packageJson: SaltPackageJsonLike | null,
  authorityRoot: string = rootDir,
): Promise<PackageManagerDetection> {
  const declared = declaredPackageManagerName(packageJson);

  const markers = [
    { fileName: "pnpm-lock.yaml", manager: "pnpm" },
    { fileName: "yarn.lock", manager: "yarn" },
    { fileName: "bun.lock", manager: "bun" },
    { fileName: "bun.lockb", manager: "bun" },
    { fileName: "package-lock.json", manager: "npm" },
  ] as const;
  const detected = new Set<string>();
  const invalidMarkers: PackageManagerDetection["invalidMarkers"] = [];
  for (const marker of markers) {
    const inspection = await inspectPackageManagerMarker(
      rootDir,
      path.join(rootDir, marker.fileName),
      authorityRoot,
    );
    if (inspection.status === "valid") detected.add(marker.manager);
    if (inspection.status === "invalid") {
      invalidMarkers.push({
        fileName: marker.fileName,
        reason: inspection.reason,
      });
    }
  }
  const detectedManagers = [...detected].sort((left, right) =>
    left.localeCompare(right),
  );
  const declaredConflict =
    declared !== null &&
    detectedManagers.some((manager) => manager !== declared);
  const ambiguous = detectedManagers.length > 1 || declaredConflict;
  const issues = [
    ...(ambiguous
      ? [
          declaredConflict
            ? `Declared package manager ${declared} conflicts with detected lockfile families: ${detectedManagers.join(", ")}.`
            : `Multiple package-manager lockfile families were detected: ${detectedManagers.join(", ")}.`,
        ]
      : []),
    ...invalidMarkers.map(
      (marker) =>
        `Package-manager marker ${marker.fileName} could not be inspected (${marker.reason}).`,
    ),
  ];
  if (invalidMarkers.length > 0) {
    return {
      packageManager:
        declared ??
        (ambiguous ? "unknown" : (detectedManagers[0] ?? "unknown")),
      status: "invalid",
      detectedManagers,
      invalidMarkers,
      issues,
    };
  }
  if (ambiguous) {
    return {
      packageManager: declared ?? "unknown",
      status: "ambiguous",
      detectedManagers,
      invalidMarkers,
      issues,
    };
  }
  return {
    packageManager: declared ?? detectedManagers[0] ?? "unknown",
    status: declared
      ? "declared"
      : detectedManagers.length === 1
        ? "marker"
        : "absent",
    detectedManagers,
    invalidMarkers,
    issues,
  };
}

export async function readPackageJsonFile(
  packageJsonPath: string | null,
  containingRoot?: string,
  authorityRoot?: string,
): Promise<SaltPackageJsonLike | null> {
  const inspection = await inspectPackageJsonFile(
    packageJsonPath,
    containingRoot,
    authorityRoot,
  );
  return inspection.status === "valid" ? inspection.value : null;
}

function toPosix(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right),
  );
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

export interface SaltWorkspaceScope {
  kind: SaltInstallationWorkspace["kind"];
  workspaceRoot: string | null;
  pnpmWorkspace: PnpmWorkspaceConfiguration | null;
  workspacePatterns: CompiledWorkspacePatterns | null;
  workspacePatternIssue: boolean;
  pnpmWorkspaceIssue: MarkerInspectionReason | null;
  ancestorSearchLimited: boolean;
}

export async function detectSaltWorkspaceScope(
  rootDir: string,
  authorityRoot?: string,
): Promise<SaltWorkspaceScope> {
  const absoluteRoot = path.resolve(rootDir);
  const absoluteAuthority = path.resolve(
    authorityRoot ?? path.parse(absoluteRoot).root,
  );
  const rootManifest = await readPackageJsonFile(
    path.join(absoluteRoot, "package.json"),
    absoluteRoot,
    absoluteAuthority,
  );
  const rootPnpmInspection = await inspectPnpmWorkspaceConfiguration(
    absoluteRoot,
    absoluteAuthority,
  );
  const rootPnpmWorkspace =
    rootPnpmInspection.status === "valid" ? rootPnpmInspection.value : null;
  const rootManifestPatterns = compileWorkspacePatterns(
    rootManifest?.workspaces,
  );
  const rootPnpmPatterns = compileWorkspacePatterns(
    rootPnpmWorkspace?.packages,
  );
  if (rootPnpmInspection.status === "invalid") {
    return {
      kind: "single-package",
      workspaceRoot: null,
      pnpmWorkspace: null,
      workspacePatterns: null,
      workspacePatternIssue:
        rootPnpmInspection.reason === "workspace_pattern_error",
      pnpmWorkspaceIssue: rootPnpmInspection.reason,
      ancestorSearchLimited: false,
    };
  }
  if (
    (rootManifestPatterns.status === "valid" &&
      rootManifestPatterns.hasPositivePattern) ||
    rootPnpmWorkspace !== null
  ) {
    return {
      kind: "workspace-root",
      workspaceRoot: absoluteRoot,
      pnpmWorkspace: rootPnpmWorkspace,
      workspacePatterns:
        rootPnpmPatterns.status === "valid"
          ? rootPnpmPatterns
          : rootManifestPatterns.status === "valid"
            ? rootManifestPatterns
            : null,
      workspacePatternIssue:
        rootManifestPatterns.status === "invalid" ||
        rootPnpmPatterns.status === "invalid",
      pnpmWorkspaceIssue: null,
      ancestorSearchLimited: false,
    };
  }
  if (rootManifestPatterns.status === "invalid") {
    return {
      kind: "single-package",
      workspaceRoot: null,
      pnpmWorkspace: null,
      workspacePatterns: null,
      workspacePatternIssue: true,
      pnpmWorkspaceIssue: null,
      ancestorSearchLimited: false,
    };
  }
  let pnpmWorkspaceIssue: MarkerInspectionReason | null = null;
  let current = path.dirname(absoluteRoot);
  let inspectedDirectories = 1;
  let ancestorSearchLimited = false;
  while (isPathInside(absoluteAuthority, current)) {
    if (inspectedDirectories >= MAX_WORKSPACE_ANCESTOR_DIRECTORIES) {
      ancestorSearchLimited = true;
      break;
    }
    inspectedDirectories += 1;
    const manifest = await readPackageJsonFile(
      path.join(current, "package.json"),
      current,
      absoluteAuthority,
    );
    const pnpmInspection = await inspectPnpmWorkspaceConfiguration(
      current,
      absoluteAuthority,
    );
    const pnpmWorkspace =
      pnpmInspection.status === "valid" ? pnpmInspection.value : null;
    const manifestPatterns = compileWorkspacePatterns(manifest?.workspaces);
    const pnpmPatterns = compileWorkspacePatterns(pnpmWorkspace?.packages);
    if (pnpmWorkspaceIssue === null && pnpmInspection.status === "invalid") {
      pnpmWorkspaceIssue = pnpmInspection.reason;
    }
    if (pnpmInspection.status === "invalid") {
      return {
        kind: "single-package",
        workspaceRoot: null,
        pnpmWorkspace: null,
        workspacePatterns: null,
        workspacePatternIssue:
          pnpmInspection.reason === "workspace_pattern_error",
        pnpmWorkspaceIssue,
        ancestorSearchLimited: false,
      };
    }
    if (
      manifestPatterns.status === "invalid" ||
      pnpmPatterns.status === "invalid"
    ) {
      return {
        kind: "single-package",
        workspaceRoot: null,
        pnpmWorkspace: null,
        workspacePatterns: null,
        workspacePatternIssue: true,
        pnpmWorkspaceIssue,
        ancestorSearchLimited: false,
      };
    }
    const manifestMatch =
      manifestPatterns.status === "valid" &&
      manifestPatterns.hasPositivePattern &&
      workspaceContainsPackage(current, absoluteRoot, manifestPatterns);
    const pnpmMatch =
      pnpmPatterns.status === "valid" &&
      pnpmPatterns.hasPositivePattern &&
      workspaceContainsPackage(current, absoluteRoot, pnpmPatterns);
    if (manifestMatch || pnpmMatch) {
      return {
        kind: "workspace-package",
        workspaceRoot: current,
        pnpmWorkspace,
        workspacePatterns: pnpmMatch
          ? pnpmPatterns.status === "valid"
            ? pnpmPatterns
            : null
          : manifestPatterns.status === "valid"
            ? manifestPatterns
            : null,
        workspacePatternIssue: false,
        pnpmWorkspaceIssue,
        ancestorSearchLimited: false,
      };
    }
    const parent = path.dirname(current);
    if (parent === current || current === absoluteAuthority) break;
    current = parent;
  }
  return {
    kind: "single-package",
    workspaceRoot: null,
    pnpmWorkspace: null,
    workspacePatterns: null,
    workspacePatternIssue: false,
    pnpmWorkspaceIssue,
    ancestorSearchLimited,
  };
}

export async function detectPackageManagerName(
  rootDir: string,
  packageJson: SaltPackageJsonLike | null,
): Promise<string> {
  return (await detectPackageManager(rootDir, packageJson)).packageManager;
}

export function collectSaltPackages(
  packageJson: SaltPackageJsonLike | null,
): SaltPackageDescriptor[] {
  const collected = new Map<string, string>();
  for (const section of [
    packageJson?.dependencies,
    packageJson?.devDependencies,
    packageJson?.optionalDependencies,
    packageJson?.peerDependencies,
  ]) {
    for (const [name, version] of dependencyEntries(section)) {
      if (!collected.has(name)) {
        collected.set(name, version);
      }
    }
  }
  return [...collected.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, version]) => ({ name, version }));
}

function normalizeSaltPackageDescriptors(
  values: SaltPackageDescriptor[],
): SaltPackageDescriptor[] {
  const packages = new Map<string, string>();
  for (const value of values) {
    if (
      !value ||
      !SALT_PACKAGE_NAME_PATTERN.test(value.name) ||
      typeof value.version !== "string" ||
      value.version.trim().length === 0 ||
      packages.has(value.name)
    ) {
      continue;
    }
    packages.set(value.name, value.version.trim());
  }
  return [...packages.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, version]) => ({ name, version }));
}

function collectDuplicateDeclarations(
  packageJson: SaltPackageJsonLike | null,
): Array<{ name: string; versions: string[] }> {
  const declarations = new Map<string, string[]>();
  for (const section of [
    packageJson?.dependencies,
    packageJson?.devDependencies,
    packageJson?.optionalDependencies,
    packageJson?.peerDependencies,
  ]) {
    for (const [name, version] of dependencyEntries(section)) {
      declarations.set(name, [...(declarations.get(name) ?? []), version]);
    }
  }
  return [...declarations.entries()]
    .map(([name, versions]) => ({ name, versions: unique(versions) }))
    .filter(({ versions }) => versions.length > 1)
    .sort((left, right) => left.name.localeCompare(right.name));
}

function collectManifestOverrideFields(
  packageJson: SaltPackageJsonLike | null,
): string[] {
  const fields: string[] = [];
  if (isRecord(packageJson?.overrides)) {
    fields.push("overrides");
  }
  if (isRecord(packageJson?.resolutions)) {
    fields.push("resolutions");
  }
  if (isRecord(packageJson?.pnpm) && isRecord(packageJson.pnpm.overrides)) {
    fields.push("pnpm.overrides");
  }
  return unique(fields);
}

function resolveEffectiveDeclaration(input: {
  packageName: string;
  declaredVersion: string;
  resolvedVersion: string | null;
  resolvedManifestPath: string | null;
  allowedRoot: string;
  workspacePatterns: CompiledWorkspacePatterns | null;
  pnpmWorkspace: PnpmWorkspaceConfiguration | null;
}): { effective: string | null; resolution: "verified" | "unverifiable" } {
  const declared = input.declaredVersion.trim();
  if (declared.startsWith("workspace:")) {
    const isLocalWorkspacePackage =
      input.resolvedVersion !== null &&
      input.resolvedManifestPath !== null &&
      input.workspacePatterns !== null &&
      workspaceContainsPackage(
        input.allowedRoot,
        path.dirname(input.resolvedManifestPath),
        input.workspacePatterns,
      );
    if (!isLocalWorkspacePackage) {
      return { effective: null, resolution: "unverifiable" };
    }
    const selector = declared.slice("workspace:".length);
    const effective =
      selector === "" || selector === "*"
        ? input.resolvedVersion
        : selector === "^" || selector === "~"
          ? `${selector}${input.resolvedVersion}`
          : validRange(selector)
            ? selector
            : null;
    return effective
      ? { effective, resolution: "verified" }
      : { effective: null, resolution: "unverifiable" };
  }
  if (declared.startsWith("catalog:")) {
    const catalogName = declared.slice("catalog:".length);
    const effective =
      catalogName.length === 0 || catalogName === "default"
        ? (input.pnpmWorkspace?.catalog[input.packageName] ?? null)
        : (input.pnpmWorkspace?.catalogs[catalogName]?.[input.packageName] ??
          null);
    return effective && validRange(effective)
      ? { effective, resolution: "verified" }
      : { effective: null, resolution: "unverifiable" };
  }
  return validRange(declared)
    ? { effective: declared, resolution: "verified" }
    : { effective: null, resolution: "unverifiable" };
}

function satisfiesDeclaration(
  effectiveDeclaredVersion: string | null,
  resolvedVersion: string | null,
): boolean | null {
  if (!resolvedVersion) return null;
  const normalizedVersion = valid(resolvedVersion);
  const normalizedRange = effectiveDeclaredVersion
    ? validRange(effectiveDeclaredVersion)
    : null;
  if (normalizedVersion && normalizedRange) {
    return satisfies(normalizedVersion, normalizedRange);
  }
  return null;
}

type CandidatePackageDirectoryInspection =
  | { status: "absent" }
  | { status: "present" }
  | { status: "unverifiable" };

type DeclaredPackageManifestResolution =
  | {
      status: "valid";
      path: string;
      value: SaltPackageJsonLike;
    }
  | { status: "unverifiable" };

async function inspectCandidatePackageDirectory(
  candidateDirectory: string,
  allowedRoot: string,
): Promise<CandidatePackageDirectoryInspection> {
  if (!isPathInside(allowedRoot, candidateDirectory)) {
    return { status: "unverifiable" };
  }
  try {
    await fs.lstat(candidateDirectory, { bigint: true });
    return { status: "present" };
  } catch (error) {
    return (error as NodeJS.ErrnoException | undefined)?.code === "ENOENT"
      ? { status: "absent" }
      : { status: "unverifiable" };
  }
}

async function resolveDeclaredPackageManifest(input: {
  authorityRoot: string;
  rootDir: string;
  allowedRoot: string;
  packageName: string;
}): Promise<DeclaredPackageManifestResolution> {
  const absoluteRoot = path.resolve(input.rootDir);
  const absoluteAllowedRoot = path.resolve(input.allowedRoot);
  const absoluteAuthorityRoot = path.resolve(input.authorityRoot);
  if (
    !isPathInside(absoluteAuthorityRoot, absoluteAllowedRoot) ||
    !isPathInside(absoluteAllowedRoot, absoluteRoot)
  ) {
    throw new Error("package-root-outside-authority");
  }
  const packageSegments = input.packageName.split("/");
  let current = absoluteRoot;
  for (;;) {
    const candidateDirectory = path.join(
      current,
      "node_modules",
      ...packageSegments,
    );
    const directoryInspection = await inspectCandidatePackageDirectory(
      candidateDirectory,
      absoluteAllowedRoot,
    );
    if (directoryInspection.status === "unverifiable") {
      return { status: "unverifiable" };
    }
    if (directoryInspection.status === "present") {
      const candidate = path.join(candidateDirectory, "package.json");
      const inspection = await inspectPackageJsonFile(
        candidate,
        absoluteAllowedRoot,
        input.authorityRoot,
      );
      return inspection.status === "valid"
        ? {
            status: "valid",
            path: inspection.path,
            value: inspection.value,
          }
        : { status: "unverifiable" };
    }
    if (current === absoluteAllowedRoot) break;
    const parent = path.dirname(current);
    if (parent === current || !isPathInside(absoluteAllowedRoot, parent)) {
      break;
    }
    current = parent;
  }
  return { status: "unverifiable" };
}

async function resolveDeclaredPackages(input: {
  authorityRoot: string;
  rootDir: string;
  allowedRoot: string;
  saltPackages: SaltPackageDescriptor[];
  pnpmWorkspace: PnpmWorkspaceConfiguration | null;
  workspacePatterns: CompiledWorkspacePatterns | null;
}): Promise<SaltInstallationDiagnostics["resolvedPackages"]> {
  const realAllowedRoot = await fs
    .realpath(input.allowedRoot)
    .catch(() => path.resolve(input.allowedRoot));
  const absoluteAuthorityRoot = path.resolve(input.authorityRoot);
  if (!isPathInside(absoluteAuthorityRoot, realAllowedRoot)) {
    return input.saltPackages.map((saltPackage) => ({
      name: saltPackage.name,
      declaredVersion: saltPackage.version,
      effectiveDeclaredVersion: null,
      declarationResolution: "unverifiable" as const,
      resolvedVersion: null,
      resolvedPath: null,
      satisfiesDeclaredVersion: null,
    }));
  }

  const results: SaltInstallationDiagnostics["resolvedPackages"] = new Array(
    input.saltPackages.length,
  );
  let nextPackageIndex = 0;
  const resolveNextPackage = async (): Promise<void> => {
    for (;;) {
      const packageIndex = nextPackageIndex;
      nextPackageIndex += 1;
      if (packageIndex >= input.saltPackages.length) return;
      const saltPackage = input.saltPackages[packageIndex];
      try {
        const resolution = await resolveDeclaredPackageManifest({
          authorityRoot: input.authorityRoot,
          rootDir: input.rootDir,
          allowedRoot: input.allowedRoot,
          packageName: saltPackage.name,
        });
        if (resolution.status !== "valid") {
          throw new Error("package-manifest-unverifiable");
        }
        const realResolved = path.resolve(resolution.path);
        if (
          !isPathInside(absoluteAuthorityRoot, realResolved) ||
          !isPathInside(realAllowedRoot, realResolved)
        )
          throw new Error("outside-root");
        const manifest = resolution.value;
        const resolvedVersion =
          manifest?.name === saltPackage.name &&
          typeof manifest.version === "string"
            ? manifest.version.trim() || null
            : null;
        const declaration = resolveEffectiveDeclaration({
          packageName: saltPackage.name,
          declaredVersion: saltPackage.version,
          resolvedVersion,
          resolvedManifestPath: resolvedVersion ? realResolved : null,
          allowedRoot: realAllowedRoot,
          workspacePatterns: input.workspacePatterns,
          pnpmWorkspace: input.pnpmWorkspace,
        });
        results[packageIndex] = {
          name: saltPackage.name,
          declaredVersion: saltPackage.version,
          effectiveDeclaredVersion: declaration.effective,
          declarationResolution: declaration.resolution,
          resolvedVersion,
          resolvedPath: resolvedVersion ? toPosix(realResolved) : null,
          satisfiesDeclaredVersion: satisfiesDeclaration(
            declaration.effective,
            resolvedVersion,
          ),
        };
      } catch {
        results[packageIndex] = {
          name: saltPackage.name,
          declaredVersion: saltPackage.version,
          effectiveDeclaredVersion: null,
          declarationResolution: "unverifiable" as const,
          resolvedVersion: null,
          resolvedPath: null,
          satisfiesDeclaredVersion: null,
        };
      }
    }
  };
  await Promise.all(
    Array.from(
      {
        length: Math.min(
          PACKAGE_RESOLUTION_CONCURRENCY,
          input.saltPackages.length,
        ),
      },
      resolveNextPackage,
    ),
  );
  return results;
}

function nodeModulesRoot(packageJsonPath: string): string | null {
  const segments = path.resolve(packageJsonPath).split(path.sep);
  const index = segments.lastIndexOf("node_modules");
  return index === -1
    ? null
    : toPosix(segments.slice(0, index + 1).join(path.sep));
}

async function detectPackageLayout(
  allowedRoot: string,
  nodeModulesRoots: string[],
  authorityRoot: string = allowedRoot,
): Promise<SaltPackageManagerInspection["packageLayout"]> {
  for (const fileName of [".pnp.cjs", ".pnp.js", ".pnp.loader.mjs"]) {
    if (
      await isRegularMarker(
        allowedRoot,
        path.join(allowedRoot, fileName),
        authorityRoot,
      )
    )
      return "pnp";
  }
  return nodeModulesRoots.length > 0 ? "node-modules" : "unknown";
}

function buildWorkspaceDiagnostics(input: {
  rootDir: string;
  scope: Awaited<ReturnType<typeof detectSaltWorkspaceScope>>;
  localSaltPackages: SaltPackageDescriptor[];
  workspaceSaltPackages: SaltPackageDescriptor[];
  packageLocalIssues: boolean;
}): SaltInstallationWorkspace {
  const issues: string[] = [];
  let workspaceRootIssues = false;
  let packageLocalIssues = input.packageLocalIssues;
  const localByName = new Map(
    input.localSaltPackages.map((entry) => [entry.name, entry.version]),
  );
  const workspaceByName = new Map(
    input.workspaceSaltPackages.map((entry) => [entry.name, entry.version]),
  );
  if (input.scope.kind === "workspace-package") {
    for (const workspacePackage of input.workspaceSaltPackages) {
      if (!localByName.has(workspacePackage.name)) {
        workspaceRootIssues = true;
        issues.push(
          `${workspacePackage.name} is declared as ${workspacePackage.version} at the workspace root but is not declared in the selected package.`,
        );
      }
    }
  }
  for (const localPackage of input.localSaltPackages) {
    const workspaceVersion = workspaceByName.get(localPackage.name);
    if (workspaceVersion && workspaceVersion !== localPackage.version) {
      workspaceRootIssues = true;
      packageLocalIssues = true;
      issues.push(
        `${localPackage.name} is declared as ${localPackage.version} in the selected package and ${workspaceVersion} at the workspace root.`,
      );
    }
  }
  return {
    kind: input.scope.kind,
    packageRoot: toPosix(input.rootDir),
    workspaceRoot: input.scope.workspaceRoot
      ? toPosix(input.scope.workspaceRoot)
      : null,
    issueSourceHint:
      !workspaceRootIssues && !packageLocalIssues
        ? "none"
        : input.scope.kind === "workspace-root"
          ? "workspace-root"
          : input.scope.kind === "single-package"
            ? "package-local"
            : workspaceRootIssues && packageLocalIssues
              ? "mixed"
              : workspaceRootIssues
                ? "workspace-root"
                : "package-local",
    workspaceSaltPackages: input.workspaceSaltPackages,
    workspaceIssues: issues,
  };
}

export async function collectSaltInstallationDiagnostics(
  rootDir: string,
  saltPackages: SaltPackageDescriptor[],
  options: CollectSaltInstallationOptions = {},
): Promise<SaltInstallationDiagnostics> {
  const absoluteRoot = path.resolve(rootDir);
  const authorityRoot = path.resolve(
    options.authorityRoot ?? path.parse(absoluteRoot).root,
  );
  const declaredSaltPackages = normalizeSaltPackageDescriptors(saltPackages);
  const currentManifest = await readPackageJsonFile(
    path.join(absoluteRoot, "package.json"),
    absoluteRoot,
    authorityRoot,
  );
  const scope =
    options.workspaceScope ??
    (await detectSaltWorkspaceScope(absoluteRoot, options.authorityRoot));
  const allowedRoot = scope.workspaceRoot ?? absoluteRoot;
  const workspaceManifest =
    scope.workspaceRoot && scope.workspaceRoot !== absoluteRoot
      ? await readPackageJsonFile(
          path.join(scope.workspaceRoot, "package.json"),
          scope.workspaceRoot,
          authorityRoot,
        )
      : currentManifest;
  const workspaceSaltPackages = collectSaltPackages(workspaceManifest);
  const inspectionTruncated =
    declaredSaltPackages.length > MAX_RESOLVED_SALT_PACKAGES;
  const inspectedSaltPackages = declaredSaltPackages.slice(
    0,
    MAX_RESOLVED_SALT_PACKAGES,
  );
  const resolvedPackages = await resolveDeclaredPackages({
    authorityRoot,
    rootDir: absoluteRoot,
    allowedRoot,
    saltPackages: inspectedSaltPackages,
    pnpmWorkspace: scope.pnpmWorkspace,
    workspacePatterns: scope.workspacePatterns,
  });
  const nodeModulesRoots = unique(
    resolvedPackages.flatMap((entry) => {
      const root = entry.resolvedPath
        ? nodeModulesRoot(entry.resolvedPath)
        : null;
      return root ? [root] : [];
    }),
  );
  const packageLayout = await detectPackageLayout(
    allowedRoot,
    nodeModulesRoots,
    authorityRoot,
  );
  const requestedPackageManager = options.packageManager?.trim() || "unknown";
  const detectedPackageManager = await detectPackageManager(
    allowedRoot,
    workspaceManifest,
    authorityRoot,
  );
  const providedConflict =
    requestedPackageManager !== "unknown" &&
    (detectedPackageManager.status === "declared"
      ? detectedPackageManager.packageManager !== requestedPackageManager
      : detectedPackageManager.detectedManagers.some(
          (manager) => manager !== requestedPackageManager,
        ));
  const packageManagerDetection: PackageManagerDetection =
    requestedPackageManager === "unknown"
      ? detectedPackageManager
      : {
          ...detectedPackageManager,
          packageManager: requestedPackageManager,
          status:
            detectedPackageManager.status === "invalid"
              ? "invalid"
              : detectedPackageManager.status === "ambiguous" ||
                  providedConflict
                ? "ambiguous"
                : "provided",
          issues: [
            ...detectedPackageManager.issues,
            ...(providedConflict
              ? [
                  `Provided package manager ${requestedPackageManager} conflicts with detected package-manager evidence.`,
                ]
              : []),
          ],
        };
  const packageManager = packageManagerDetection.packageManager;
  const manifestOverrideFields = unique([
    ...collectManifestOverrideFields(currentManifest),
    ...(workspaceManifest !== currentManifest
      ? collectManifestOverrideFields(workspaceManifest)
      : []),
  ]);
  const duplicateDeclarations = collectDuplicateDeclarations(currentManifest);
  const declaredVersions = unique(
    declaredSaltPackages.map((entry) => entry.version),
  );
  const resolvedVersions = unique(
    resolvedPackages.flatMap((entry) =>
      entry.resolvedVersion ? [entry.resolvedVersion] : [],
    ),
  );
  const mismatchedPackages = resolvedPackages
    .filter((entry) => entry.satisfiesDeclaredVersion === false)
    .map((entry) => ({
      name: entry.name,
      declaredVersion: entry.declaredVersion,
      resolvedVersion: entry.resolvedVersion,
      resolvedPath: entry.resolvedPath,
    }));
  const unverifiablePackages = resolvedPackages
    .filter(
      (entry) =>
        entry.declarationResolution === "unverifiable" ||
        entry.satisfiesDeclaredVersion === null,
    )
    .map((entry) => ({
      name: entry.name,
      declaredVersion: entry.declaredVersion,
      resolvedVersion: entry.resolvedVersion,
      resolvedPath: entry.resolvedPath,
    }));
  const unresolvedPackages = resolvedPackages.filter(
    (entry) => !entry.resolvedVersion || !entry.resolvedPath,
  );
  const workspace = buildWorkspaceDiagnostics({
    rootDir: absoluteRoot,
    scope,
    localSaltPackages: declaredSaltPackages,
    workspaceSaltPackages,
    packageLocalIssues:
      duplicateDeclarations.length > 0 ||
      mismatchedPackages.length > 0 ||
      unverifiablePackages.length > 0 ||
      (packageLayout !== "pnp" && unresolvedPackages.length > 0) ||
      inspectionTruncated,
  });
  const issues: string[] = [];
  issues.push(...packageManagerDetection.issues);
  if (scope.pnpmWorkspaceIssue !== null) {
    issues.push(
      `A pnpm workspace marker could not be inspected (${scope.pnpmWorkspaceIssue}); workspace and catalog resolution may be incomplete.`,
    );
  }
  if (scope.workspacePatternIssue) {
    issues.push(
      "Workspace membership patterns were invalid or exceeded the bounded matcher limits; ancestor workspace reuse was disabled.",
    );
  }
  if (scope.ancestorSearchLimited) {
    issues.push(
      `Workspace ancestor discovery inspected at most ${MAX_WORKSPACE_ANCESTOR_DIRECTORIES} directories; workspace and dependency resolution may be incomplete.`,
    );
  }
  for (const duplicate of duplicateDeclarations) {
    issues.push(
      `${duplicate.name} is declared with multiple version ranges: ${duplicate.versions.join(", ")}.`,
    );
  }
  for (const mismatch of mismatchedPackages) {
    issues.push(
      `${mismatch.name} declares ${mismatch.declaredVersion} but resolves to ${mismatch.resolvedVersion ?? "an unknown version"}.`,
    );
  }
  for (const unverifiable of unverifiablePackages) {
    issues.push(
      `${unverifiable.name} has a declaration whose effective version could not be verified against the resolved package.`,
    );
  }
  if (packageLayout !== "pnp") {
    for (const unresolved of unresolvedPackages) {
      issues.push(
        `${unresolved.name} is declared but could not be resolved within the selected repo or workspace root.`,
      );
    }
  }
  issues.push(...workspace.workspaceIssues);
  if (inspectionTruncated) {
    issues.push(
      `Salt package resolution inspected only the first ${MAX_RESOLVED_SALT_PACKAGES} declared packages.`,
    );
  }
  if (manifestOverrideFields.length > 0) {
    issues.push(
      `Manifest override fields detected: ${manifestOverrideFields.join(", ")}. Declared ranges may not match the final installed graph.`,
    );
  }

  const inspectionWarnings = [
    ...(packageLayout === "pnp"
      ? [
          "Yarn PnP layout detected; unresolved package paths are not treated as broken without the host PnP runtime hook.",
        ]
      : []),
    ...(manifestOverrideFields.length > 0
      ? [
          `Dependency override fields detected: ${manifestOverrideFields.join(", ")}.`,
        ]
      : []),
    ...(inspectionTruncated
      ? [
          `Salt package resolution was limited to ${MAX_RESOLVED_SALT_PACKAGES} declared packages.`,
        ]
      : []),
    ...(scope.pnpmWorkspaceIssue !== null
      ? [
          `pnpm-workspace.yaml inspection was limited (${scope.pnpmWorkspaceIssue}).`,
        ]
      : []),
    ...(scope.workspacePatternIssue
      ? [
          "Workspace membership patterns were invalid or exceeded the bounded matcher limits; workspace reuse was disabled.",
        ]
      : []),
    ...(scope.ancestorSearchLimited
      ? [
          `Workspace ancestor discovery was limited to ${MAX_WORKSPACE_ANCESTOR_DIRECTORIES} directories.`,
        ]
      : []),
  ];
  const inspection: SaltPackageManagerInspection = {
    packageManager,
    packageManagerDetectionStatus: packageManagerDetection.status,
    strategy: "manifest-resolution",
    status:
      unresolvedPackages.length === 0 &&
      unverifiablePackages.length === 0 &&
      scope.pnpmWorkspaceIssue === null &&
      !scope.workspacePatternIssue &&
      !scope.ancestorSearchLimited &&
      packageManagerDetection.status !== "ambiguous" &&
      packageManagerDetection.status !== "invalid" &&
      !inspectionTruncated
        ? "succeeded"
        : "limited",
    packageLayout,
    limitations: [SALT_INSTALLATION_SCOPE_LIMITATION, ...inspectionWarnings],
    manifestOverrideFields,
  };
  const versionHealth: SaltPackageVersionHealth = {
    declaredVersions,
    resolvedVersions,
    multipleDeclaredVersions: duplicateDeclarations.length > 0,
    multipleResolvedVersions: resolvedVersions.length > 1,
    mismatchedPackages,
    unverifiablePackages,
    issues,
  };

  return {
    resolvedPackages,
    versionHealth,
    inspection,
    workspace,
  };
}
