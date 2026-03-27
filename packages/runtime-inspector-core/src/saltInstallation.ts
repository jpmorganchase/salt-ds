import { execFile as execFileCallback } from "node:child_process";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { promisify } from "node:util";
import { satisfies, valid, validRange } from "semver";
import type {
  SaltInstallationDiagnostics,
  SaltInstallationHealthSummary,
  SaltInstallationRemediation,
  SaltPackageDescriptor,
  SaltPackageManagerInspection,
} from "./schemas.js";

export interface SaltPackageJsonLike {
  packageManager?: string;
  workspaces?: unknown;
  overrides?: unknown;
  resolutions?: unknown;
  pnpm?: {
    overrides?: unknown;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export type PackageManagerCommandRunner = (
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
) => Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}>;

export interface CollectSaltInstallationOptions {
  packageManager?: string;
  commandRunner?: PackageManagerCommandRunner;
  packageManagerCommandTimeoutMs?: number;
}

const require = createRequire(import.meta.url);
const execFile = promisify(execFileCallback);
const DEFAULT_PACKAGE_MANAGER_TIMEOUT_MS = 8_000;

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readPackageJson(
  packageJsonPath: string | null,
): Promise<(SaltPackageJsonLike & { name?: string; version?: string }) | null> {
  if (!packageJsonPath) {
    return null;
  }

  try {
    return JSON.parse(
      await fs.readFile(packageJsonPath, "utf8"),
    ) as SaltPackageJsonLike & { name?: string; version?: string };
  } catch {
    return null;
  }
}

function toPosix(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
}

async function detectWorkspaceScope(rootDir: string): Promise<{
  kind: "single-package" | "workspace-root" | "workspace-package";
  workspaceRoot: string | null;
}> {
  const rootPackageJsonPath = path.join(rootDir, "package.json");
  const rootPackageJson = await readPackageJson(rootPackageJsonPath);
  if (rootPackageJson?.workspaces) {
    return {
      kind: "workspace-root",
      workspaceRoot: toPosix(rootDir),
    };
  }

  let current = path.dirname(rootDir);
  while (current !== path.dirname(current)) {
    const packageJsonPath = path.join(current, "package.json");
    const packageJson = await readPackageJson(packageJsonPath);
    if (packageJson?.workspaces) {
      return {
        kind: "workspace-package",
        workspaceRoot: toPosix(current),
      };
    }
    current = path.dirname(current);
  }

  return {
    kind: "single-package",
    workspaceRoot: null,
  };
}

export async function detectPackageManagerName(
  rootDir: string,
  packageJson: SaltPackageJsonLike | null,
): Promise<string> {
  const packageManager = packageJson?.packageManager?.trim();
  if (!packageManager) {
    if (await pathExists(path.join(rootDir, "pnpm-lock.yaml"))) {
      return "pnpm";
    }
    if (await pathExists(path.join(rootDir, "yarn.lock"))) {
      return "yarn";
    }
    if (
      (await pathExists(path.join(rootDir, "bun.lockb"))) ||
      (await pathExists(path.join(rootDir, "bun.lock")))
    ) {
      return "bun";
    }
    if (await pathExists(path.join(rootDir, "package-lock.json"))) {
      return "npm";
    }
    return "unknown";
  }

  const separatorIndex = packageManager.indexOf("@");
  return separatorIndex === -1
    ? packageManager
    : packageManager.slice(0, separatorIndex);
}

export function collectSaltPackages(
  packageJson: SaltPackageJsonLike | null,
): SaltPackageDescriptor[] {
  const packageSections = [
    packageJson?.dependencies,
    packageJson?.devDependencies,
    packageJson?.peerDependencies,
  ];
  const collected = new Map<string, string>();

  for (const section of packageSections) {
    for (const [name, version] of Object.entries(section ?? {})) {
      if (!name.startsWith("@salt-ds/")) {
        continue;
      }

      const normalizedVersion = version.trim();
      if (!normalizedVersion) {
        continue;
      }

      if (!collected.has(name)) {
        collected.set(name, normalizedVersion);
      }
    }
  }

  return [...collected.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, version]) => ({ name, version }));
}

function collectDeclaredSaltPackageVersionGroups(
  packageJson: SaltPackageJsonLike | null,
): Array<{ name: string; versions: string[] }> {
  const packageSections = [
    packageJson?.dependencies,
    packageJson?.devDependencies,
    packageJson?.peerDependencies,
  ];
  const collected = new Map<string, string[]>();

  for (const section of packageSections) {
    for (const [name, version] of Object.entries(section ?? {})) {
      if (!name.startsWith("@salt-ds/")) {
        continue;
      }

      const normalizedVersion = version.trim();
      if (!normalizedVersion) {
        continue;
      }

      const versions = collected.get(name);
      if (versions) {
        versions.push(normalizedVersion);
      } else {
        collected.set(name, [normalizedVersion]);
      }
    }
  }

  return [...collected.entries()]
    .map(([name, versions]) => ({
      name,
      versions: getUniqueSortedValues(versions),
    }))
    .filter((entry) => entry.versions.length > 1)
    .sort((left, right) => left.name.localeCompare(right.name));
}

function getUniqueSortedValues(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right),
  );
}

function collectManifestOverrideFields(
  packageJson: SaltPackageJsonLike | null,
): string[] {
  const fields: string[] = [];

  if (
    packageJson?.overrides &&
    typeof packageJson.overrides === "object" &&
    !Array.isArray(packageJson.overrides)
  ) {
    fields.push("overrides");
  }

  if (
    packageJson?.resolutions &&
    typeof packageJson.resolutions === "object" &&
    !Array.isArray(packageJson.resolutions)
  ) {
    fields.push("resolutions");
  }

  if (
    packageJson?.pnpm?.overrides &&
    typeof packageJson.pnpm.overrides === "object" &&
    !Array.isArray(packageJson.pnpm.overrides)
  ) {
    fields.push("pnpm.overrides");
  }

  return getUniqueSortedValues(fields);
}

function doesResolvedVersionSatisfyDeclaredVersion(
  declaredVersion: string,
  resolvedVersion: string | null,
): boolean | null {
  if (!resolvedVersion) {
    return null;
  }

  const normalizedDeclaredVersion = declaredVersion.trim();
  const normalizedResolvedVersion = valid(resolvedVersion);
  const normalizedDeclaredRange = validRange(normalizedDeclaredVersion);

  if (normalizedResolvedVersion && normalizedDeclaredRange) {
    return satisfies(normalizedResolvedVersion, normalizedDeclaredRange, {
      includePrerelease: true,
    });
  }

  return normalizedDeclaredVersion === resolvedVersion ? true : null;
}

async function findNodeModulesRoots(startDir: string): Promise<string[]> {
  const roots: string[] = [];
  let current = path.resolve(startDir);

  while (true) {
    const nodeModulesPath = path.join(current, "node_modules");
    if (await pathExists(nodeModulesPath)) {
      roots.push(nodeModulesPath);
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return roots;
    }

    current = parent;
  }
}

async function readDirectoryEntries(targetDir: string): Promise<Dirent[]> {
  try {
    return await fs.readdir(targetDir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function collectInstalledSaltPackage(
  packageDir: string,
  collected: Map<
    string,
    {
      name: string;
      version: string;
      path: string;
    }
  >,
): Promise<void> {
  const packageJsonPath = path.join(packageDir, "package.json");
  if (!(await pathExists(packageJsonPath))) {
    return;
  }

  const packageJson = await readPackageJson(packageJsonPath);
  if (!packageJson?.name?.startsWith("@salt-ds/")) {
    return;
  }

  const normalizedPath = toPosix(packageJsonPath);
  collected.set(normalizedPath, {
    name: packageJson.name,
    version:
      typeof packageJson.version === "string" && packageJson.version.trim()
        ? packageJson.version.trim()
        : "unknown",
    path: normalizedPath,
  });
}

async function scanNestedNodeModules(
  packageDir: string,
  visitedNodeModulesDirs: Set<string>,
  collected: Map<
    string,
    {
      name: string;
      version: string;
      path: string;
    }
  >,
): Promise<void> {
  const nestedNodeModulesDir = path.join(packageDir, "node_modules");
  if (!(await pathExists(nestedNodeModulesDir))) {
    return;
  }

  await collectInstalledSaltPackagesFromNodeModules(
    nestedNodeModulesDir,
    visitedNodeModulesDirs,
    collected,
  );
}

async function collectInstalledSaltPackagesFromNodeModules(
  nodeModulesDir: string,
  visitedNodeModulesDirs: Set<string>,
  collected: Map<
    string,
    {
      name: string;
      version: string;
      path: string;
    }
  >,
): Promise<void> {
  const realNodeModulesDir = await fs
    .realpath(nodeModulesDir)
    .catch(() => nodeModulesDir);
  if (visitedNodeModulesDirs.has(realNodeModulesDir)) {
    return;
  }

  visitedNodeModulesDirs.add(realNodeModulesDir);

  const saltScopeDir = path.join(nodeModulesDir, "@salt-ds");
  for (const entry of await readDirectoryEntries(saltScopeDir)) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) {
      continue;
    }

    const packageDir = path.join(saltScopeDir, entry.name);
    await collectInstalledSaltPackage(packageDir, collected);
    await scanNestedNodeModules(packageDir, visitedNodeModulesDirs, collected);
  }

  for (const entry of await readDirectoryEntries(nodeModulesDir)) {
    if (
      entry.name === ".bin" ||
      entry.name === "@salt-ds" ||
      (!entry.isDirectory() && !entry.isSymbolicLink())
    ) {
      continue;
    }

    if (entry.name.startsWith("@")) {
      const scopeDir = path.join(nodeModulesDir, entry.name);
      for (const scopedEntry of await readDirectoryEntries(scopeDir)) {
        if (!scopedEntry.isDirectory() && !scopedEntry.isSymbolicLink()) {
          continue;
        }

        await scanNestedNodeModules(
          path.join(scopeDir, scopedEntry.name),
          visitedNodeModulesDirs,
          collected,
        );
      }
      continue;
    }

    await scanNestedNodeModules(
      path.join(nodeModulesDir, entry.name),
      visitedNodeModulesDirs,
      collected,
    );
  }
}

async function collectInstalledSaltPackages(rootDir: string): Promise<{
  nodeModulesRoots: string[];
  installedPackages: Array<{
    name: string;
    version: string;
    path: string;
  }>;
}> {
  const nodeModulesRoots = await findNodeModulesRoots(rootDir);
  const collected = new Map<
    string,
    {
      name: string;
      version: string;
      path: string;
    }
  >();
  const visitedNodeModulesDirs = new Set<string>();

  for (const nodeModulesRoot of nodeModulesRoots) {
    await collectInstalledSaltPackagesFromNodeModules(
      nodeModulesRoot,
      visitedNodeModulesDirs,
      collected,
    );
  }

  return {
    nodeModulesRoots: nodeModulesRoots.map(toPosix),
    installedPackages: [...collected.values()].sort((left, right) => {
      if (left.name !== right.name) {
        return left.name.localeCompare(right.name);
      }
      if (left.version !== right.version) {
        return left.version.localeCompare(right.version);
      }
      return left.path.localeCompare(right.path);
    }),
  };
}

async function detectInstallLayout(
  rootDir: string,
  nodeModulesRoots: string[],
): Promise<SaltPackageManagerInspection["packageLayout"]> {
  let current = path.resolve(rootDir);

  while (true) {
    for (const candidate of [".pnp.cjs", ".pnp.js", ".pnp.loader.mjs"]) {
      if (await pathExists(path.join(current, candidate))) {
        return "pnp";
      }
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }

    current = parent;
  }

  return nodeModulesRoots.length > 0 ? "node-modules" : "unknown";
}

function collectDuplicateInstalledSaltPackages(
  installedPackages: SaltInstallationDiagnostics["installedPackages"],
): SaltInstallationDiagnostics["duplicatePackages"] {
  const grouped = new Map<
    string,
    {
      versions: string[];
      paths: string[];
    }
  >();

  for (const installedPackage of installedPackages) {
    const existing = grouped.get(installedPackage.name);
    if (existing) {
      existing.versions.push(installedPackage.version);
      existing.paths.push(installedPackage.path);
      continue;
    }

    grouped.set(installedPackage.name, {
      versions: [installedPackage.version],
      paths: [installedPackage.path],
    });
  }

  return [...grouped.entries()]
    .map(([name, entry]) => {
      const versions = getUniqueSortedValues(entry.versions);
      return {
        name,
        versions,
        paths: [...entry.paths].sort((left, right) =>
          left.localeCompare(right),
        ),
        packageCount: entry.paths.length,
        versionCount: versions.length,
      };
    })
    .filter((entry) => entry.packageCount > 1)
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function resolveDeclaredSaltPackages(
  rootDir: string,
  saltPackages: SaltPackageDescriptor[],
): Promise<SaltInstallationDiagnostics["resolvedPackages"]> {
  return Promise.all(
    saltPackages.map(async (saltPackage) => {
      try {
        const resolvedPath = require.resolve(
          `${saltPackage.name}/package.json`,
          {
            paths: [rootDir],
          },
        );
        const resolvedPackageJson = await readPackageJson(resolvedPath);
        const resolvedVersion =
          typeof resolvedPackageJson?.version === "string" &&
          resolvedPackageJson.version.trim().length > 0
            ? resolvedPackageJson.version.trim()
            : null;

        return {
          name: saltPackage.name,
          declaredVersion: saltPackage.version,
          resolvedVersion,
          resolvedPath: toPosix(resolvedPath),
          satisfiesDeclaredVersion: doesResolvedVersionSatisfyDeclaredVersion(
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

function formatCommand(command: string, args: string[]): string {
  return [command, ...args]
    .map((part) =>
      /[\s"]/u.test(part)
        ? JSON.stringify(part).replaceAll("\\\\", "\\")
        : part,
    )
    .join(" ");
}

function normalizeDiscoveredVersion(version: string): string {
  const trimmed = version.trim();
  if (!trimmed) {
    return trimmed;
  }

  return trimmed.startsWith("npm:") ? trimmed.slice(4) : trimmed;
}

function parseSaltLocator(
  locator: string,
): { name: string; version: string } | null {
  const match = /^(@salt-ds\/[^@]+)@(.+)$/u.exec(locator.trim());
  if (!match) {
    return null;
  }

  return {
    name: match[1],
    version: normalizeDiscoveredVersion(match[2]),
  };
}

function collectSaltVersionsFromDependencyGraph(
  value: unknown,
  collected: string[],
  currentName?: string,
): void {
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectSaltVersionsFromDependencyGraph(entry, collected);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  if (
    typeof currentName === "string" &&
    currentName.startsWith("@salt-ds/") &&
    typeof record.version === "string"
  ) {
    collected.push(normalizeDiscoveredVersion(record.version));
  }

  if (
    typeof record.name === "string" &&
    record.name.startsWith("@salt-ds/") &&
    typeof record.version === "string"
  ) {
    collected.push(normalizeDiscoveredVersion(record.version));
  }

  const dependencies = record.dependencies;
  if (
    dependencies &&
    typeof dependencies === "object" &&
    !Array.isArray(dependencies)
  ) {
    for (const [dependencyName, dependencyValue] of Object.entries(
      dependencies as Record<string, unknown>,
    )) {
      collectSaltVersionsFromDependencyGraph(
        dependencyValue,
        collected,
        dependencyName,
      );
    }
  }

  for (const [key, entryValue] of Object.entries(record)) {
    if (key === "dependencies" || key === "name" || key === "version") {
      continue;
    }
    collectSaltVersionsFromDependencyGraph(entryValue, collected);
  }
}

function collectSaltVersionsFromYarnTrees(
  trees: unknown[],
  collected: string[],
): void {
  for (const tree of trees) {
    if (!tree || typeof tree !== "object") {
      continue;
    }

    const record = tree as Record<string, unknown>;
    if (typeof record.name === "string") {
      const locator = parseSaltLocator(record.name);
      if (locator) {
        collected.push(locator.version);
      }
    }

    if (Array.isArray(record.children)) {
      collectSaltVersionsFromYarnTrees(record.children, collected);
    }
  }
}

function collectDiscoveredSaltVersions(
  packageManager: string,
  stdout: string,
): string[] {
  const trimmedOutput = stdout.trim();
  if (!trimmedOutput) {
    return [];
  }

  if (packageManager === "yarn") {
    const collected: string[] = [];
    for (const line of trimmedOutput.split(/\r?\n/u)) {
      const trimmedLine = line.trim();
      if (!trimmedLine.startsWith("{")) {
        continue;
      }

      try {
        const parsed = JSON.parse(trimmedLine) as Record<string, unknown>;
        const data = parsed.data as { trees?: unknown[] } | undefined;
        const trees = Array.isArray(data?.trees)
          ? data.trees
          : Array.isArray(parsed.trees)
            ? (parsed.trees as unknown[])
            : null;
        if (trees) {
          collectSaltVersionsFromYarnTrees(trees, collected);
        }
      } catch {}
    }

    return getUniqueSortedValues(collected);
  }

  try {
    const parsed = JSON.parse(trimmedOutput) as unknown;
    const collected: string[] = [];
    collectSaltVersionsFromDependencyGraph(parsed, collected);
    return getUniqueSortedValues(collected);
  } catch {
    return [];
  }
}

function buildSaltInstallationRemediation(
  packageManager: string,
  saltPackages: SaltPackageDescriptor[],
): {
  inspectionCommand: { command: string; args: string[] } | null;
  remediation: SaltInstallationRemediation;
} {
  const explainTarget = saltPackages[0]?.name ?? "@salt-ds/core";

  switch (packageManager) {
    case "npm":
      return {
        inspectionCommand: {
          command: "npm",
          args: ["ls", "--json", "--all"],
        },
        remediation: {
          explainCommand: formatCommand("npm", ["ls", explainTarget]),
          dedupeCommand: formatCommand("npm", ["dedupe"]),
          reinstallCommand: formatCommand("npm", ["install"]),
        },
      };
    case "pnpm":
      return {
        inspectionCommand: {
          command: "pnpm",
          args: ["list", "--json", "--depth", "Infinity"],
        },
        remediation: {
          explainCommand: formatCommand("pnpm", ["why", explainTarget]),
          dedupeCommand: formatCommand("pnpm", ["dedupe"]),
          reinstallCommand: formatCommand("pnpm", ["install"]),
        },
      };
    case "yarn":
      return {
        inspectionCommand: {
          command: "yarn",
          args: ["list", "--json", "--pattern", "@salt-ds"],
        },
        remediation: {
          explainCommand: formatCommand("yarn", ["why", explainTarget]),
          dedupeCommand: formatCommand("yarn", ["dedupe"]),
          reinstallCommand: formatCommand("yarn", ["install"]),
        },
      };
    case "bun":
      return {
        inspectionCommand: null,
        remediation: {
          explainCommand: formatCommand("bun", ["pm", "ls"]),
          dedupeCommand: null,
          reinstallCommand: formatCommand("bun", ["install"]),
        },
      };
    default:
      return {
        inspectionCommand: null,
        remediation: {
          explainCommand: null,
          dedupeCommand: null,
          reinstallCommand: null,
        },
      };
  }
}

function buildInspectionLimitations(
  inspection: Pick<
    SaltPackageManagerInspection,
    "packageManager" | "status" | "packageLayout" | "manifestOverrideFields"
  >,
): string[] {
  const limitations: string[] = [];

  if (inspection.packageLayout === "pnp") {
    limitations.push(
      "Yarn PnP layout detected; node_modules scanning and resolved package paths may be incomplete outside a PnP runtime hook.",
    );
  }

  if (inspection.packageManager === "bun") {
    limitations.push(
      "Bun installs currently rely on node_modules scanning; package-manager graph inspection is not implemented.",
    );
  }

  if (inspection.status === "failed") {
    limitations.push(
      `Package-manager inspection failed for ${inspection.packageManager}; Salt relied on the node_modules scan instead.`,
    );
  }

  if (inspection.manifestOverrideFields.length > 0) {
    limitations.push(
      `Dependency override fields detected: ${inspection.manifestOverrideFields.join(", ")}.`,
    );
  }

  return limitations;
}

function buildSaltInstallationHealthSummary(
  installation: Pick<
    SaltInstallationDiagnostics,
    | "resolvedPackages"
    | "versionHealth"
    | "inspection"
    | "workspace"
    | "duplicatePackages"
  >,
): SaltInstallationHealthSummary {
  const unresolvedPackages = installation.resolvedPackages.filter(
    (saltPackage) => !saltPackage.resolvedVersion || !saltPackage.resolvedPath,
  );
  const unresolvedPackagesRequireNodeModulesResolution =
    installation.inspection.packageLayout !== "pnp";
  const blockingUnresolvedPackages =
    unresolvedPackagesRequireNodeModulesResolution ? unresolvedPackages : [];
  const duplicateVersionsDetected =
    installation.versionHealth.multipleResolvedVersions ||
    installation.versionHealth.multipleInstalledVersions;
  const duplicatePackageCopiesDetected =
    installation.duplicatePackages.length > 0;
  const workspaceVersionDriftDetected =
    installation.workspace.workspaceIssues.some(
      (issue) =>
        issue.includes("declared with multiple version ranges") ||
        issue.includes("Multiple declared Salt versions found"),
    );
  const declarationDriftDetected =
    installation.versionHealth.multipleDeclaredVersions ||
    workspaceVersionDriftDetected;
  const workspaceInstallIssuesDetected =
    installation.workspace.workspaceIssues.length > 0;
  const blockingReasons: string[] = [];
  const warningReasons: string[] = [];

  if (blockingUnresolvedPackages.length > 0) {
    blockingReasons.push(
      "Some declared Salt packages could not be resolved from the current install.",
    );
  }

  if (installation.versionHealth.mismatchedPackages.length > 0) {
    blockingReasons.push(
      "Some declared Salt packages resolve to incompatible installed versions.",
    );
  }

  if (duplicatePackageCopiesDetected) {
    warningReasons.push(
      `Duplicate Salt package copies were found for ${installation.duplicatePackages.map((saltPackage) => saltPackage.name).join(", ")}.`,
    );
  } else if (duplicateVersionsDetected) {
    warningReasons.push(
      "Multiple Salt versions were detected in the resolved or installed dependency graph.",
    );
  }

  if (declarationDriftDetected) {
    warningReasons.push(
      installation.workspace.issueSourceHint === "workspace-root" ||
        installation.workspace.issueSourceHint === "mixed"
        ? "The workspace root declares Salt packages with inconsistent versions."
        : "Declared Salt versions are inconsistent across dependency sections.",
    );
  } else if (
    workspaceInstallIssuesDetected &&
    (installation.workspace.issueSourceHint === "workspace-root" ||
      installation.workspace.issueSourceHint === "mixed")
  ) {
    warningReasons.push("The workspace root reports Salt install issues.");
  }

  if (installation.inspection.manifestOverrideFields.length > 0) {
    warningReasons.push(
      `Dependency override fields were detected in package.json: ${installation.inspection.manifestOverrideFields.join(", ")}. Declared Salt ranges may not match the final installed graph.`,
    );
  }

  if (installation.inspection.status === "failed") {
    warningReasons.push(
      `Package-manager inspection failed for ${installation.inspection.packageManager}; Salt fell back to the node_modules scan.`,
    );
  }

  if (blockingReasons.length > 0) {
    return {
      health: "fail",
      recommendedAction:
        blockingUnresolvedPackages.length > 0
          ? "reinstall-dependencies"
          : "inspect-dependency-drift",
      blockingWorkflows: ["review", "migrate", "upgrade"],
      reasons: [...blockingReasons, ...warningReasons],
    };
  }

  if (warningReasons.length > 0) {
    const hasDeclarationOrOverrideDrift =
      declarationDriftDetected ||
      installation.inspection.manifestOverrideFields.length > 0;
    return {
      health: "warn",
      recommendedAction:
        duplicateVersionsDetected || duplicatePackageCopiesDetected
          ? "dedupe-salt-install"
          : hasDeclarationOrOverrideDrift
            ? "inspect-dependency-drift"
            : "inspect-dependency-drift",
      blockingWorkflows: [],
      reasons: warningReasons,
    };
  }

  return {
    health: "pass",
    recommendedAction: "none",
    blockingWorkflows: [],
    reasons: [],
  };
}

const runPackageManagerCommand: PackageManagerCommandRunner = async (
  command,
  args,
  cwd,
  timeoutMs,
) => {
  try {
    const result = await execFile(command, args, {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 8 * 1024 * 1024,
      windowsHide: true,
      encoding: "utf8",
    });

    return {
      exitCode: 0,
      stdout: typeof result.stdout === "string" ? result.stdout : "",
      stderr: typeof result.stderr === "string" ? result.stderr : "",
    };
  } catch (error) {
    const details = error as {
      code?: number | string;
      stdout?: string;
      stderr?: string;
      message?: string;
    };

    return {
      exitCode: typeof details.code === "number" ? details.code : 1,
      stdout: typeof details.stdout === "string" ? details.stdout : "",
      stderr:
        typeof details.stderr === "string" && details.stderr.trim().length > 0
          ? details.stderr
          : (details.message ?? ""),
    };
  }
};

async function inspectSaltPackagesWithPackageManager(
  packageManager: string,
  rootDir: string,
  saltPackages: SaltPackageDescriptor[],
  options: CollectSaltInstallationOptions,
): Promise<{
  inspection: SaltPackageManagerInspection;
  remediation: SaltInstallationRemediation;
}> {
  const { inspectionCommand, remediation } = buildSaltInstallationRemediation(
    packageManager,
    saltPackages,
  );

  if (!inspectionCommand) {
    return {
      inspection: {
        packageManager,
        strategy: "node-modules-scan",
        status: "fallback",
        listCommand: null,
        discoveredVersions: [],
        error: null,
        packageLayout: "unknown",
        limitations: [],
        manifestOverrideFields: [],
      },
      remediation,
    };
  }

  const commandRunner = options.commandRunner ?? runPackageManagerCommand;
  const timeoutMs =
    options.packageManagerCommandTimeoutMs ??
    DEFAULT_PACKAGE_MANAGER_TIMEOUT_MS;
  const result = await commandRunner(
    inspectionCommand.command,
    inspectionCommand.args,
    rootDir,
    timeoutMs,
  );
  const discoveredVersions = collectDiscoveredSaltVersions(
    packageManager,
    result.stdout,
  );

  if (discoveredVersions.length > 0 || result.exitCode === 0) {
    return {
      inspection: {
        packageManager,
        strategy: "package-manager-command",
        status: "succeeded",
        listCommand: formatCommand(
          inspectionCommand.command,
          inspectionCommand.args,
        ),
        discoveredVersions,
        error: null,
        packageLayout: "unknown",
        limitations: [],
        manifestOverrideFields: [],
      },
      remediation,
    };
  }

  return {
    inspection: {
      packageManager,
      strategy: "package-manager-command",
      status: "failed",
      listCommand: formatCommand(
        inspectionCommand.command,
        inspectionCommand.args,
      ),
      discoveredVersions: [],
      error:
        result.stderr.trim().length > 0
          ? result.stderr.trim()
          : `Command exited with code ${result.exitCode}.`,
      packageLayout: "unknown",
      limitations: [],
      manifestOverrideFields: [],
    },
    remediation,
  };
}

async function collectSaltInstallationCore(
  rootDir: string,
  saltPackages: SaltPackageDescriptor[],
  options: CollectSaltInstallationOptions = {},
): Promise<SaltInstallationDiagnostics> {
  const packageManager =
    options.packageManager && options.packageManager.trim().length > 0
      ? options.packageManager
      : "unknown";
  const currentPackageJson = await readPackageJson(
    path.join(rootDir, "package.json"),
  );
  const manifestOverrideFields =
    collectManifestOverrideFields(currentPackageJson);
  const resolvedPackages = await resolveDeclaredSaltPackages(
    rootDir,
    saltPackages,
  );
  const { nodeModulesRoots, installedPackages } =
    await collectInstalledSaltPackages(rootDir);
  const packageLayout = await detectInstallLayout(rootDir, nodeModulesRoots);
  const duplicatePackages =
    collectDuplicateInstalledSaltPackages(installedPackages);
  const inspectionResult = await inspectSaltPackagesWithPackageManager(
    packageManager,
    rootDir,
    saltPackages,
    options,
  );
  const inspection: SaltPackageManagerInspection = {
    ...inspectionResult.inspection,
    packageLayout,
    manifestOverrideFields,
    limitations: buildInspectionLimitations({
      ...inspectionResult.inspection,
      packageLayout,
      manifestOverrideFields,
    }),
  };
  const remediation = inspectionResult.remediation;
  const duplicateDeclaredPackages =
    collectDeclaredSaltPackageVersionGroups(currentPackageJson);
  const declaredVersions = getUniqueSortedValues(
    saltPackages.map((saltPackage) => saltPackage.version),
  );
  const resolvedVersions = getUniqueSortedValues(
    resolvedPackages.flatMap((saltPackage) =>
      saltPackage.resolvedVersion ? [saltPackage.resolvedVersion] : [],
    ),
  );
  const installedVersions = getUniqueSortedValues(
    installedPackages.map((saltPackage) => saltPackage.version),
  );
  const mismatchedPackages = resolvedPackages
    .filter((saltPackage) => saltPackage.satisfiesDeclaredVersion === false)
    .map((saltPackage) => ({
      name: saltPackage.name,
      declaredVersion: saltPackage.declaredVersion,
      resolvedVersion: saltPackage.resolvedVersion,
      resolvedPath: saltPackage.resolvedPath,
    }));
  const unresolvedPackages = resolvedPackages.filter(
    (saltPackage) => !saltPackage.resolvedVersion || !saltPackage.resolvedPath,
  );
  const unresolvedPackagesRequireNodeModulesResolution =
    inspection.packageLayout !== "pnp";
  const issues: string[] = [];

  for (const duplicateDeclaredPackage of duplicateDeclaredPackages) {
    issues.push(
      `${duplicateDeclaredPackage.name} is declared with multiple version ranges: ${duplicateDeclaredPackage.versions.join(", ")}.`,
    );
  }

  for (const duplicatePackage of duplicatePackages) {
    issues.push(
      `${duplicatePackage.name} is installed ${duplicatePackage.packageCount} times${duplicatePackage.versionCount > 1 ? ` across versions ${duplicatePackage.versions.join(", ")}` : ""}.`,
    );
  }

  if (inspection.status === "failed" && inspection.error) {
    issues.push(
      `${inspection.packageManager} inspection failed and Salt fell back to the node_modules scan: ${inspection.error}`,
    );
  }

  if (manifestOverrideFields.length > 0) {
    issues.push(
      `Manifest override fields detected: ${manifestOverrideFields.join(", ")}. Declared Salt ranges may not match the final installed graph.`,
    );
  }

  for (const mismatch of mismatchedPackages) {
    issues.push(
      `${mismatch.name} declares ${mismatch.declaredVersion} but resolves to ${mismatch.resolvedVersion ?? "an unknown installed version"}${mismatch.resolvedPath ? ` at ${mismatch.resolvedPath}` : ""}.`,
    );
  }

  for (const unresolvedPackage of unresolvedPackages) {
    if (!unresolvedPackagesRequireNodeModulesResolution) {
      continue;
    }
    issues.push(
      `${unresolvedPackage.name} is declared in package.json but could not be resolved from the current install.`,
    );
  }

  return {
    nodeModulesRoots,
    resolvedPackages,
    installedPackages,
    versionHealth: {
      declaredVersions,
      resolvedVersions,
      installedVersions,
      multipleDeclaredVersions: duplicateDeclaredPackages.length > 0,
      multipleResolvedVersions: false,
      multipleInstalledVersions: duplicatePackages.some(
        (saltPackage) => saltPackage.versionCount > 1,
      ),
      mismatchedPackages,
      issues,
    },
    inspection,
    remediation,
    workspace: {
      kind: "single-package",
      packageRoot: toPosix(rootDir),
      workspaceRoot: null,
      issueSourceHint: "none",
      workspaceSaltPackages: [],
      workspaceIssues: [],
    },
    duplicatePackages,
    healthSummary: {
      health: "pass",
      recommendedAction: "none",
      blockingWorkflows: [],
      reasons: [],
    },
  };
}

export async function collectSaltInstallationDiagnostics(
  rootDir: string,
  saltPackages: SaltPackageDescriptor[],
  options: CollectSaltInstallationOptions = {},
): Promise<SaltInstallationDiagnostics> {
  const installation = await collectSaltInstallationCore(
    rootDir,
    saltPackages,
    options,
  );
  const workspace = await detectWorkspaceScope(rootDir);

  if (workspace.kind === "single-package") {
    const result: SaltInstallationDiagnostics = {
      ...installation,
      workspace: {
        kind: "single-package",
        packageRoot: toPosix(rootDir),
        workspaceRoot: null,
        issueSourceHint:
          installation.versionHealth.issues.length > 0
            ? "package-local"
            : "none",
        workspaceSaltPackages: [],
        workspaceIssues: [],
      },
      duplicatePackages: installation.duplicatePackages,
    };
    return {
      ...result,
      healthSummary: buildSaltInstallationHealthSummary(result),
    };
  }

  if (workspace.kind === "workspace-root" || !workspace.workspaceRoot) {
    const result: SaltInstallationDiagnostics = {
      ...installation,
      workspace: {
        kind: "workspace-root",
        packageRoot: toPosix(rootDir),
        workspaceRoot: workspace.workspaceRoot ?? toPosix(rootDir),
        issueSourceHint:
          installation.versionHealth.issues.length > 0
            ? "workspace-root"
            : "none",
        workspaceSaltPackages: saltPackages,
        workspaceIssues: installation.versionHealth.issues,
      },
      duplicatePackages: installation.duplicatePackages,
    };
    return {
      ...result,
      healthSummary: buildSaltInstallationHealthSummary(result),
    };
  }

  const workspaceRootPackageJson = await readPackageJson(
    path.join(workspace.workspaceRoot, "package.json"),
  );
  const workspaceOverrideFields = collectManifestOverrideFields(
    workspaceRootPackageJson,
  );
  const workspaceSaltPackages = collectSaltPackages(workspaceRootPackageJson);
  const workspaceInstallation = await collectSaltInstallationCore(
    workspace.workspaceRoot,
    workspaceSaltPackages,
    options,
  );
  const localHasIssues = installation.versionHealth.issues.length > 0;
  const workspaceHasIssues =
    workspaceInstallation.versionHealth.issues.length > 0;
  const manifestOverrideFields = getUniqueSortedValues([
    ...installation.inspection.manifestOverrideFields,
    ...workspaceOverrideFields,
  ]);

  const result: SaltInstallationDiagnostics = {
    ...installation,
    inspection: {
      ...installation.inspection,
      manifestOverrideFields,
      limitations: buildInspectionLimitations({
        packageManager: installation.inspection.packageManager,
        status: installation.inspection.status,
        packageLayout: installation.inspection.packageLayout,
        manifestOverrideFields,
      }),
    },
    workspace: {
      kind: "workspace-package",
      packageRoot: toPosix(rootDir),
      workspaceRoot: workspace.workspaceRoot,
      issueSourceHint:
        localHasIssues && workspaceHasIssues
          ? "mixed"
          : workspaceHasIssues
            ? "workspace-root"
            : localHasIssues
              ? "package-local"
              : "none",
      workspaceSaltPackages,
      workspaceIssues: workspaceInstallation.versionHealth.issues,
    },
    duplicatePackages: installation.duplicatePackages,
  };
  return {
    ...result,
    healthSummary: buildSaltInstallationHealthSummary(result),
  };
}
