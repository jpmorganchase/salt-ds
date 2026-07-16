import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { satisfies, valid, validRange } from "semver";
import type {
  SaltInstallationDiagnostics,
  SaltInstallationHealthSummary,
  SaltInstallationRemediation,
  SaltInstallationWorkspace,
  SaltPackageDescriptor,
  SaltPackageManagerInspection,
  SaltPackageVersionHealth,
} from "./installationTypes.js";

export interface SaltPackageJsonLike {
  name?: string;
  version?: string;
  packageManager?: string;
  workspaces?: unknown;
  scripts?: Record<string, string>;
  overrides?: unknown;
  resolutions?: unknown;
  pnpm?: { overrides?: unknown };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface CollectSaltInstallationOptions {
  packageManager?: string;
}

export const MAX_PACKAGE_JSON_BYTES = 1024 * 1024;
const MAX_RESOLVED_SALT_PACKAGES = 128;
const SALT_PACKAGE_NAME_PATTERN = /^@salt-ds\/[a-z0-9][a-z0-9._-]*$/;
const GRAPH_LIMITATION =
  "Salt inspected only declared packages through bounded manifest resolution. Use the host package manager for full dependency-graph and duplicate-install diagnosis.";

export type MarkerInspectionReason =
  | "outside_root"
  | "not_file"
  | "unreadable"
  | "oversized"
  | "parse_error";

export type MarkerInspection<T> =
  | { status: "absent"; path: null }
  | { status: "valid"; path: string; value: T }
  | { status: "invalid"; path: string; reason: MarkerInspectionReason };

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasWorkspaceDeclaration(value: unknown): boolean {
  return workspacePatterns(value).some((pattern) => !pattern.startsWith("!"));
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

function workspacePatternMatches(
  pattern: string,
  relativePath: string,
): boolean {
  const tokens = pattern.split(/(\*\*|\*)/g);
  const source = tokens
    .map((token) =>
      token === "**"
        ? ".*"
        : token === "*"
          ? "[^/]+"
          : token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("");
  return new RegExp(`^${source}/?$`).test(relativePath);
}

function workspaceContainsPackage(
  workspaceRoot: string,
  packageRoot: string,
  workspaces: unknown,
): boolean {
  const relativePath = path
    .relative(workspaceRoot, packageRoot)
    .split(path.sep)
    .join("/");
  return (
    relativePath.length > 0 &&
    !relativePath.startsWith("../") &&
    workspacePatterns(workspaces)
      .filter((pattern) => !pattern.startsWith("!"))
      .some((pattern) => workspacePatternMatches(pattern, relativePath)) &&
    !workspacePatterns(workspaces)
      .filter((pattern) => pattern.startsWith("!"))
      .some((pattern) =>
        workspacePatternMatches(pattern.slice(1), relativePath),
      )
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
  try {
    const [realRoot, realPath] = await Promise.all([
      fs.realpath(absoluteRoot),
      fs.realpath(absolutePath),
    ]);
    if (!isPathInside(realRoot, realPath)) {
      return {
        status: "invalid",
        path: normalizedPath,
        reason: "outside_root",
      };
    }
    const stats = await fs.stat(realPath);
    if (!stats.isFile()) {
      return { status: "invalid", path: normalizedPath, reason: "not_file" };
    }
    if (stats.size > MAX_PACKAGE_JSON_BYTES) {
      return { status: "invalid", path: normalizedPath, reason: "oversized" };
    }
    const contents = await fs.readFile(realPath, "utf8");
    if (Buffer.byteLength(contents, "utf8") > MAX_PACKAGE_JSON_BYTES) {
      return { status: "invalid", path: normalizedPath, reason: "oversized" };
    }
    const parsed = JSON.parse(contents) as unknown;
    return isRecord(parsed)
      ? { status: "valid", path: normalizedPath, value: parsed }
      : { status: "invalid", path: normalizedPath, reason: "parse_error" };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return { status: "absent", path: null };
    }
    return {
      status: "invalid",
      path: normalizedPath,
      reason:
        error instanceof SyntaxError ? "parse_error" : "unreadable",
    };
  }
}

export async function readPackageJsonFile(
  packageJsonPath: string | null,
  containingRoot?: string,
): Promise<SaltPackageJsonLike | null> {
  const inspection = await inspectPackageJsonFile(
    packageJsonPath,
    containingRoot,
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

export async function detectSaltWorkspaceScope(rootDir: string): Promise<{
  kind: SaltInstallationWorkspace["kind"];
  workspaceRoot: string | null;
}> {
  const absoluteRoot = path.resolve(rootDir);
  const rootManifest = await readPackageJsonFile(
    path.join(absoluteRoot, "package.json"),
    absoluteRoot,
  );
  if (hasWorkspaceDeclaration(rootManifest?.workspaces)) {
    return { kind: "workspace-root", workspaceRoot: absoluteRoot };
  }

  let current = path.dirname(absoluteRoot);
  while (true) {
    const manifest = await readPackageJsonFile(
      path.join(current, "package.json"),
      current,
    );
    if (
      hasWorkspaceDeclaration(manifest?.workspaces) &&
      workspaceContainsPackage(current, absoluteRoot, manifest?.workspaces)
    ) {
      return { kind: "workspace-package", workspaceRoot: current };
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return { kind: "single-package", workspaceRoot: null };
}

export async function detectPackageManagerName(
  rootDir: string,
  packageJson: SaltPackageJsonLike | null,
): Promise<string> {
  const declared =
    typeof packageJson?.packageManager === "string"
      ? packageJson.packageManager.trim()
      : "";
  if (declared) {
    const separator = declared.indexOf("@");
    return separator === -1 ? declared : declared.slice(0, separator);
  }
  if (await pathExists(path.join(rootDir, "pnpm-lock.yaml"))) return "pnpm";
  if (await pathExists(path.join(rootDir, "yarn.lock"))) return "yarn";
  if (
    (await pathExists(path.join(rootDir, "bun.lock"))) ||
    (await pathExists(path.join(rootDir, "bun.lockb")))
  ) {
    return "bun";
  }
  if (await pathExists(path.join(rootDir, "package-lock.json"))) return "npm";
  return "unknown";
}

export function collectSaltPackages(
  packageJson: SaltPackageJsonLike | null,
): SaltPackageDescriptor[] {
  const collected = new Map<string, string>();
  for (const section of [
    packageJson?.dependencies,
    packageJson?.devDependencies,
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

function satisfiesDeclaration(
  declaredVersion: string,
  resolvedVersion: string | null,
): boolean | null {
  if (!resolvedVersion) return null;
  const normalizedVersion = valid(resolvedVersion);
  const normalizedRange = validRange(declaredVersion.trim());
  if (normalizedVersion && normalizedRange) {
    return satisfies(normalizedVersion, normalizedRange, {
      includePrerelease: true,
    });
  }
  return declaredVersion.trim() === resolvedVersion ? true : null;
}

async function resolveDeclaredPackageManifestPath(input: {
  rootDir: string;
  allowedRoot: string;
  packageName: string;
  resolver: ReturnType<typeof createRequire>;
}): Promise<string> {
  try {
    return input.resolver.resolve(`${input.packageName}/package.json`);
  } catch {
    const packageSegments = input.packageName.split("/");
    const candidates = unique([
      path.join(
        input.rootDir,
        "node_modules",
        ...packageSegments,
        "package.json",
      ),
      path.join(
        input.allowedRoot,
        "node_modules",
        ...packageSegments,
        "package.json",
      ),
    ]);
    for (const candidate of candidates) {
      if (await pathExists(candidate)) return candidate;
    }
    throw new Error("package-manifest-not-found");
  }
}

async function resolveDeclaredPackages(input: {
  rootDir: string;
  allowedRoot: string;
  saltPackages: SaltPackageDescriptor[];
}): Promise<SaltInstallationDiagnostics["resolvedPackages"]> {
  const rootManifestPath = path.join(
    path.resolve(input.rootDir),
    "package.json",
  );
  const resolver = createRequire(rootManifestPath);
  const realAllowedRoot = await fs
    .realpath(input.allowedRoot)
    .catch(() => path.resolve(input.allowedRoot));

  return Promise.all(
    input.saltPackages.map(async (saltPackage) => {
      try {
        const resolved = await resolveDeclaredPackageManifestPath({
          rootDir: input.rootDir,
          allowedRoot: input.allowedRoot,
          packageName: saltPackage.name,
          resolver,
        });
        const realResolved = await fs.realpath(resolved);
        if (!isPathInside(realAllowedRoot, realResolved))
          throw new Error("outside-root");
        const manifest = await readPackageJsonFile(realResolved);
        const resolvedVersion =
          manifest?.name === saltPackage.name &&
          typeof manifest.version === "string"
            ? manifest.version.trim() || null
            : null;
        return {
          name: saltPackage.name,
          declaredVersion: saltPackage.version,
          resolvedVersion,
          resolvedPath: resolvedVersion ? toPosix(realResolved) : null,
          satisfiesDeclaredVersion: satisfiesDeclaration(
            saltPackage.version,
            resolvedVersion,
          ),
        };
      } catch {
        return {
          name: saltPackage.name,
          declaredVersion: saltPackage.version,
          resolvedVersion: null,
          resolvedPath: null,
          satisfiesDeclaredVersion: null,
        };
      }
    }),
  );
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
): Promise<SaltPackageManagerInspection["packageLayout"]> {
  for (const fileName of [".pnp.cjs", ".pnp.js", ".pnp.loader.mjs"]) {
    if (await pathExists(path.join(allowedRoot, fileName))) return "pnp";
  }
  return nodeModulesRoots.length > 0 ? "node-modules" : "unknown";
}

function remediationFor(
  packageManager: string,
  saltPackages: SaltPackageDescriptor[],
): SaltInstallationRemediation {
  const target = saltPackages[0]?.name ?? "@salt-ds/core";
  switch (packageManager) {
    case "npm":
      return {
        explainCommand: `npm ls ${target}`,
        dedupeCommand: "npm dedupe",
        reinstallCommand: "npm install",
      };
    case "pnpm":
      return {
        explainCommand: `pnpm why ${target}`,
        dedupeCommand: "pnpm dedupe",
        reinstallCommand: "pnpm install",
      };
    case "yarn":
      return {
        explainCommand: `yarn why ${target}`,
        dedupeCommand: "yarn dedupe",
        reinstallCommand: "yarn install",
      };
    case "bun":
      return {
        explainCommand: "bun pm ls",
        dedupeCommand: null,
        reinstallCommand: "bun install",
      };
    default:
      return {
        explainCommand: null,
        dedupeCommand: null,
        reinstallCommand: null,
      };
  }
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

function buildHealthSummary(input: {
  unresolvedCount: number;
  pnp: boolean;
  mismatchCount: number;
  inspectionTruncated: boolean;
  warnings: string[];
}): SaltInstallationHealthSummary {
  const blockingReasons: string[] = [];
  if (input.unresolvedCount > 0 && !input.pnp) {
    blockingReasons.push(
      "Some declared Salt packages could not be resolved within the selected repo or workspace root.",
    );
  }
  if (input.mismatchCount > 0) {
    blockingReasons.push(
      "Some declared Salt packages resolve to incompatible installed versions.",
    );
  }
  if (input.inspectionTruncated) {
    blockingReasons.push(
      `Declared Salt packages exceed the bounded resolution limit of ${MAX_RESOLVED_SALT_PACKAGES}.`,
    );
  }
  if (blockingReasons.length > 0) {
    return {
      health: "fail",
      recommendedAction:
        input.unresolvedCount > 0
          ? "reinstall-dependencies"
          : "inspect-dependency-drift",
      blockingWorkflows: ["review", "migrate"],
      reasons: [...blockingReasons, ...input.warnings],
    };
  }
  if (input.warnings.length > 0) {
    return {
      health: "warn",
      recommendedAction: "inspect-dependency-drift",
      blockingWorkflows: [],
      reasons: input.warnings,
    };
  }
  return {
    health: "pass",
    recommendedAction: "none",
    blockingWorkflows: [],
    reasons: [],
  };
}

export async function collectSaltInstallationDiagnostics(
  rootDir: string,
  saltPackages: SaltPackageDescriptor[],
  options: CollectSaltInstallationOptions = {},
): Promise<SaltInstallationDiagnostics> {
  const absoluteRoot = path.resolve(rootDir);
  const declaredSaltPackages = normalizeSaltPackageDescriptors(saltPackages);
  const currentManifest = await readPackageJsonFile(
    path.join(absoluteRoot, "package.json"),
    absoluteRoot,
  );
  const scope = await detectSaltWorkspaceScope(absoluteRoot);
  const allowedRoot = scope.workspaceRoot ?? absoluteRoot;
  const workspaceManifest =
    scope.workspaceRoot && scope.workspaceRoot !== absoluteRoot
      ? await readPackageJsonFile(
          path.join(scope.workspaceRoot, "package.json"),
          scope.workspaceRoot,
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
    rootDir: absoluteRoot,
    allowedRoot,
    saltPackages: inspectedSaltPackages,
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
  );
  const requestedPackageManager = options.packageManager?.trim() || "unknown";
  const packageManager =
    requestedPackageManager === "unknown"
      ? await detectPackageManagerName(allowedRoot, workspaceManifest)
      : requestedPackageManager;
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
      (packageLayout !== "pnp" && unresolvedPackages.length > 0) ||
      inspectionTruncated,
  });
  const issues: string[] = [];
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
  ];
  const inspection: SaltPackageManagerInspection = {
    packageManager,
    strategy: "manifest-resolution",
    status:
      unresolvedPackages.length === 0 && !inspectionTruncated
        ? "succeeded"
        : "limited",
    packageLayout,
    limitations: [GRAPH_LIMITATION, ...inspectionWarnings],
    manifestOverrideFields,
  };
  const warningReasons = unique([
    ...duplicateDeclarations.map(
      ({ name }) => `${name} has inconsistent declarations.`,
    ),
    ...workspace.workspaceIssues,
    ...(manifestOverrideFields.length > 0
      ? ["Dependency override fields require package-manager verification."]
      : []),
    ...(packageLayout === "pnp" && unresolvedPackages.length > 0
      ? ["Salt package resolution is incomplete under Yarn PnP."]
      : []),
    ...(inspectionTruncated
      ? [
          `Salt package resolution was limited to ${MAX_RESOLVED_SALT_PACKAGES} declared packages.`,
        ]
      : []),
  ]);
  const versionHealth: SaltPackageVersionHealth = {
    declaredVersions,
    resolvedVersions,
    multipleDeclaredVersions: duplicateDeclarations.length > 0,
    multipleResolvedVersions: resolvedVersions.length > 1,
    mismatchedPackages,
    issues,
  };

  return {
    resolvedPackages,
    versionHealth,
    inspection,
    remediation: remediationFor(packageManager, declaredSaltPackages),
    workspace,
    healthSummary: buildHealthSummary({
      unresolvedCount: unresolvedPackages.length,
      pnp: packageLayout === "pnp",
      mismatchCount: mismatchedPackages.length,
      inspectionTruncated,
      warnings: warningReasons,
    }),
  };
}
