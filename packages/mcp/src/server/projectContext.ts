import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  buildRepoAwareSaltWorkflowAvailability,
  collectSaltInstallationDiagnostics as collectSaltInstallationDiagnosticsFromHelper,
  collectSaltPackages as collectSaltPackagesFromHelper,
  detectLocalRuntimeTargets,
  detectPackageManagerName as detectPackageManagerNameFromHelper,
} from "@salt-ds/runtime-inspector-core";
import {
  detectProjectPolicy,
  type ProjectPolicyDetailLevel,
} from "@salt-ds/semantic-core/policy/detection";
import { deriveComparableSaltVersion } from "@salt-ds/semantic-core/policy/layerDiagnostics";
import { parseTsconfig } from "get-tsconfig";
import type { SaltRegistry } from "../types.js";
import { getSaltMcpRuntimeMetadata } from "./serverMetadata.js";

interface PackageJsonLike {
  name?: string;
  version?: string;
  packageManager?: string;
  workspaces?: unknown;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

type FrameworkName = "next" | "vite-react" | "vite" | "react" | "unknown";
type WorkspaceKind =
  | "single-package"
  | "workspace-root"
  | "workspace-package"
  | "unknown";
type StackLayerScope = "line_of_business" | "team" | "repo" | "other";

interface SaltProjectContextSource {
  original: string;
  resolved: string;
  kind: "site" | "external" | "repo";
}

export interface SaltProjectContextData {
  root_dir: string;
  package_json_path: string | null;
  environment: {
    os: string;
    node_version: string;
    package_manager: string;
  };
  framework: {
    name: FrameworkName;
    evidence: string[];
  };
  workspace: {
    kind: WorkspaceKind;
    workspace_root: string | null;
  };
  salt: {
    packages: Array<{
      name: string;
      version: string;
    }>;
    package_version: string | null;
    installation: {
      node_modules_roots: string[];
      resolved_packages: Array<{
        name: string;
        declared_version: string;
        resolved_version: string | null;
        resolved_path: string | null;
        satisfies_declared_version: boolean | null;
      }>;
      installed_packages: Array<{
        name: string;
        version: string;
        path: string;
      }>;
      version_health: {
        declared_versions: string[];
        resolved_versions: string[];
        installed_versions: string[];
        multiple_declared_versions: boolean;
        multiple_resolved_versions: boolean;
        multiple_installed_versions: boolean;
        mismatched_packages: Array<{
          name: string;
          declared_version: string;
          resolved_version: string | null;
          resolved_path: string | null;
        }>;
        issues: string[];
      };
      inspection: {
        package_manager: string;
        strategy: "package-manager-command" | "node-modules-scan";
        status: "succeeded" | "failed" | "fallback";
        list_command: string | null;
        discovered_versions: string[];
        error: string | null;
        package_layout: "node-modules" | "pnp" | "unknown";
        limitations: string[];
        manifest_override_fields: string[];
      };
      remediation: {
        explain_command: string | null;
        dedupe_command: string | null;
        reinstall_command: string | null;
      };
      workspace: {
        kind: "single-package" | "workspace-root" | "workspace-package";
        package_root: string;
        workspace_root: string | null;
        issue_source_hint:
          | "none"
          | "package-local"
          | "workspace-root"
          | "mixed";
        workspace_salt_packages: Array<{
          name: string;
          version: string;
        }>;
        workspace_issues: string[];
      };
      duplicate_packages: Array<{
        name: string;
        versions: string[];
        paths: string[];
        package_count: number;
        version_count: number;
      }>;
      health_summary: {
        health: "pass" | "warn" | "fail";
        recommended_action:
          | "none"
          | "inspect-dependency-drift"
          | "dedupe-salt-install"
          | "reinstall-dependencies";
        blocking_workflows: Array<"review" | "migrate" | "upgrade">;
        reasons: string[];
      };
    };
  };
  repo_signals: {
    storybook_detected: boolean;
    app_runtime_detected: boolean;
    salt_team_config_found: boolean;
    salt_stack_config_found: boolean;
  };
  repo_instructions: {
    path: string | null;
    filename: "AGENTS.md" | "CLAUDE.md" | null;
  };
  policy: {
    team_config_path: string | null;
    stack_config_path: string | null;
    mode: "none" | "team" | "stack";
    approved_wrappers: string[];
    stack_layers: Array<{
      id: string;
      scope: StackLayerScope;
      source_type: "file" | "package";
      source: string;
      optional: boolean;
      resolution: {
        status: "resolved" | "missing" | "unreadable" | "invalid";
        resolved_path: string | null;
        package_name: string | null;
        export_name: string | null;
        version: string | null;
        package_version: string | null;
        conventions_version: string | null;
        contract: string | null;
        project: string | null;
        pack_id: string | null;
        supported_salt_range: string | null;
        compatibility: {
          status:
            | "compatible"
            | "unsupported"
            | "missing-range"
            | "unknown-current-version"
            | "invalid-range";
          current_salt_version: string | null;
          checked_version: string | null;
          reason: string;
        } | null;
        reason: string | null;
      };
    }>;
    shared_conventions: {
      enabled: boolean;
      pack_count: number;
      packs: string[];
      pack_details: Array<{
        id: string;
        source: string;
        package_name: string | null;
        export_name: string | null;
        version: string | null;
        package_version: string | null;
        conventions_version: string | null;
        pack_id: string | null;
        supported_salt_range: string | null;
        status: "resolved" | "missing" | "unreadable" | "invalid";
        compatibility: {
          status:
            | "compatible"
            | "unsupported"
            | "missing-range"
            | "unknown-current-version"
            | "invalid-range";
          current_salt_version: string | null;
          checked_version: string | null;
          reason: string;
        } | null;
        resolved_path: string | null;
        reason: string | null;
      }>;
    };
  };
  imports: {
    tsconfig_path: string | null;
    aliases: Array<{
      alias: string;
      targets: string[];
    }>;
  };
  runtime: {
    detected_targets: Array<{
      label: "storybook" | "app-runtime";
      url: string;
      source: "detected-default" | "detected-script";
    }>;
  };
  transport: {
    canonical_transport: "mcp";
    registry_version: string;
    registry_generated_at: string;
  };
  workflows: {
    create: boolean;
    review: boolean;
    migrate: boolean;
    upgrade: boolean;
    runtime_evidence: boolean;
  };
  summary: {
    recommended_next_tool:
      | "create_salt_ui"
      | "review_salt_ui"
      | "migrate_to_salt"
      | "upgrade_salt_ui"
      | null;
    bootstrap_requirement: {
      status: "recommended" | "not_required";
      tool: "bootstrap_salt_repo";
      cli_command: "salt-ds init";
      reason: string | null;
      next_tool_after_bootstrap:
        | "create_salt_ui"
        | "review_salt_ui"
        | "migrate_to_salt"
        | "upgrade_salt_ui"
        | null;
    };
    reasons: string[];
  };
  notes: string[];
  sources: SaltProjectContextSource[];
}

export interface SaltProjectContextResult {
  workflow: {
    id: "get_salt_project_context";
  };
  result: Omit<SaltProjectContextData, "summary" | "notes" | "sources"> & {
    context_id: string;
  };
  artifacts: {
    summary: SaltProjectContextData["summary"];
    notes: string[];
  };
  sources: SaltProjectContextSource[];
}

function toPosix(inputPath: string | null): string | null {
  return inputPath ? inputPath.split(path.sep).join("/") : null;
}

function uniqueContextSources(
  values: Array<SaltProjectContextSource | null>,
): SaltProjectContextSource[] {
  const seen = new Set<string>();
  const sources: SaltProjectContextSource[] = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    const key = `${value.kind}:${value.original}:${value.resolved}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    sources.push(value);
  }

  return sources;
}

function buildContextSource(
  kind: SaltProjectContextSource["kind"],
  original: string | null | undefined,
  resolved: string | null | undefined,
): SaltProjectContextSource | null {
  const normalizedOriginal = toPosix(original ?? null);
  const normalizedResolved = toPosix(resolved ?? original ?? null);
  if (!normalizedOriginal || !normalizedResolved) {
    return null;
  }

  return {
    original: normalizedOriginal,
    resolved: normalizedResolved,
    kind,
  };
}

function buildContextSources(input: {
  packageJsonPath: string | null;
  repoInstructionsPath: string | null;
  teamConfigPath: string | null;
  stackConfigPath: string | null;
  tsconfigPath: string | null;
  stackLayers: SaltProjectContextData["policy"]["stack_layers"];
}): SaltProjectContextSource[] {
  return uniqueContextSources([
    buildContextSource("repo", input.packageJsonPath, input.packageJsonPath),
    buildContextSource(
      "repo",
      input.repoInstructionsPath,
      input.repoInstructionsPath,
    ),
    buildContextSource("repo", input.teamConfigPath, input.teamConfigPath),
    buildContextSource("repo", input.stackConfigPath, input.stackConfigPath),
    buildContextSource("repo", input.tsconfigPath, input.tsconfigPath),
    ...input.stackLayers.map((layer) =>
      layer.source_type === "file"
        ? buildContextSource(
            "repo",
            layer.source,
            layer.resolution.resolved_path ?? layer.source,
          )
        : buildContextSource(
            "external",
            layer.source,
            layer.resolution.resolved_path ??
              layer.resolution.package_name ??
              layer.source,
          ),
    ),
  ]);
}

async function pathExists(candidatePath: string): Promise<boolean> {
  try {
    await fs.access(candidatePath);
    return true;
  } catch {
    return false;
  }
}

async function findAncestorWithChild(
  startPath: string,
  childSegments: string[],
): Promise<string | null> {
  let current = path.resolve(startPath);

  while (true) {
    const candidate = path.join(current, ...childSegments);
    if (await pathExists(candidate)) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }

    current = parent;
  }
}

async function readPackageJson(
  packageJsonPath: string | null,
): Promise<PackageJsonLike | null> {
  if (!packageJsonPath) {
    return null;
  }

  try {
    return JSON.parse(
      await fs.readFile(packageJsonPath, "utf8"),
    ) as PackageJsonLike;
  } catch {
    return null;
  }
}

function getDependencyEntries(
  packageJson: PackageJsonLike | null,
): Array<[string, string]> {
  const maps = [
    packageJson?.dependencies,
    packageJson?.devDependencies,
    packageJson?.peerDependencies,
  ].filter(Boolean) as Array<Record<string, string>>;

  return maps.flatMap((dependencyMap) => Object.entries(dependencyMap));
}

function getDependencyNames(packageJson: PackageJsonLike | null): string[] {
  return getDependencyEntries(packageJson).map(([name]) => name);
}

async function collectSaltInstallationDiagnostics(
  rootDir: string,
  saltPackages: Array<{ name: string; version: string }>,
  packageManager: string,
): Promise<SaltProjectContextData["salt"]["installation"]> {
  const installation = await collectSaltInstallationDiagnosticsFromHelper(
    rootDir,
    saltPackages,
    {
      packageManager,
    },
  );

  return {
    node_modules_roots: installation.nodeModulesRoots,
    resolved_packages: installation.resolvedPackages.map((saltPackage) => ({
      name: saltPackage.name,
      declared_version: saltPackage.declaredVersion,
      resolved_version: saltPackage.resolvedVersion,
      resolved_path: saltPackage.resolvedPath,
      satisfies_declared_version: saltPackage.satisfiesDeclaredVersion,
    })),
    installed_packages: installation.installedPackages.map((saltPackage) => ({
      name: saltPackage.name,
      version: saltPackage.version,
      path: saltPackage.path,
    })),
    version_health: {
      declared_versions: installation.versionHealth.declaredVersions,
      resolved_versions: installation.versionHealth.resolvedVersions,
      installed_versions: installation.versionHealth.installedVersions,
      multiple_declared_versions:
        installation.versionHealth.multipleDeclaredVersions,
      multiple_resolved_versions:
        installation.versionHealth.multipleResolvedVersions,
      multiple_installed_versions:
        installation.versionHealth.multipleInstalledVersions,
      mismatched_packages: installation.versionHealth.mismatchedPackages.map(
        (saltPackage) => ({
          name: saltPackage.name,
          declared_version: saltPackage.declaredVersion,
          resolved_version: saltPackage.resolvedVersion,
          resolved_path: saltPackage.resolvedPath,
        }),
      ),
      issues: installation.versionHealth.issues,
    },
    inspection: {
      package_manager: installation.inspection.packageManager,
      strategy: installation.inspection.strategy,
      status: installation.inspection.status,
      list_command: installation.inspection.listCommand,
      discovered_versions: installation.inspection.discoveredVersions,
      error: installation.inspection.error,
      package_layout: installation.inspection.packageLayout,
      limitations: installation.inspection.limitations,
      manifest_override_fields: installation.inspection.manifestOverrideFields,
    },
    remediation: {
      explain_command: installation.remediation.explainCommand,
      dedupe_command: installation.remediation.dedupeCommand,
      reinstall_command: installation.remediation.reinstallCommand,
    },
    workspace: {
      kind: installation.workspace.kind,
      package_root: installation.workspace.packageRoot,
      workspace_root: installation.workspace.workspaceRoot,
      issue_source_hint: installation.workspace.issueSourceHint,
      workspace_salt_packages: installation.workspace.workspaceSaltPackages.map(
        (saltPackage) => ({
          name: saltPackage.name,
          version: saltPackage.version,
        }),
      ),
      workspace_issues: installation.workspace.workspaceIssues,
    },
    duplicate_packages: installation.duplicatePackages.map((saltPackage) => ({
      name: saltPackage.name,
      versions: saltPackage.versions,
      paths: saltPackage.paths,
      package_count: saltPackage.packageCount,
      version_count: saltPackage.versionCount,
    })),
    health_summary: {
      health: installation.healthSummary.health,
      recommended_action: installation.healthSummary.recommendedAction,
      blocking_workflows: installation.healthSummary.blockingWorkflows,
      reasons: installation.healthSummary.reasons,
    },
  };
}

async function detectWorkspaceContext(rootDir: string): Promise<{
  kind: WorkspaceKind;
  workspace_root: string | null;
}> {
  const rootPackageJsonPath = path.join(rootDir, "package.json");
  const rootPackageJson = await readPackageJson(rootPackageJsonPath);
  if (rootPackageJson?.workspaces) {
    return {
      kind: "workspace-root",
      workspace_root: toPosix(rootDir),
    };
  }

  let current = path.dirname(rootDir);
  while (current !== path.dirname(current)) {
    const packageJsonPath = path.join(current, "package.json");
    const packageJson = await readPackageJson(packageJsonPath);
    if (packageJson?.workspaces) {
      return {
        kind: "workspace-package",
        workspace_root: toPosix(current),
      };
    }
    current = path.dirname(current);
  }

  return {
    kind: (await pathExists(rootPackageJsonPath))
      ? "single-package"
      : "unknown",
    workspace_root: null,
  };
}

async function detectFramework(
  rootDir: string,
  packageJson: PackageJsonLike | null,
): Promise<{
  name: FrameworkName;
  evidence: string[];
}> {
  const dependencyNames = getDependencyNames(packageJson);
  const evidence: string[] = [];

  if (dependencyNames.includes("next")) {
    evidence.push("dependency:next");
    return { name: "next", evidence };
  }

  if (dependencyNames.includes("vite")) {
    evidence.push("dependency:vite");
    if (dependencyNames.includes("react")) {
      evidence.push("dependency:react");
      return { name: "vite-react", evidence };
    }
    return { name: "vite", evidence };
  }

  if (dependencyNames.includes("react")) {
    evidence.push("dependency:react");
    return { name: "react", evidence };
  }

  const configChecks: Array<[string, string]> = [
    ["next.config.ts", "config:next.config.ts"],
    ["next.config.js", "config:next.config.js"],
    ["vite.config.ts", "config:vite.config.ts"],
    ["vite.config.js", "config:vite.config.js"],
  ];

  for (const [fileName, signal] of configChecks) {
    if (await pathExists(path.join(rootDir, fileName))) {
      evidence.push(signal);
      return {
        name: signal.startsWith("config:next") ? "next" : "vite",
        evidence,
      };
    }
  }

  return { name: "unknown", evidence };
}

async function detectRepoInstructions(rootDir: string): Promise<{
  path: string | null;
  filename: "AGENTS.md" | "CLAUDE.md" | null;
}> {
  for (const candidate of ["AGENTS.md", "CLAUDE.md"]) {
    const resolved = path.join(rootDir, candidate);
    if (await pathExists(resolved)) {
      return {
        path: toPosix(resolved),
        filename: candidate as "AGENTS.md" | "CLAUDE.md",
      };
    }
  }

  return {
    path: null,
    filename: null,
  };
}

async function detectSaltPackageVersion(
  rootDir: string,
): Promise<string | null> {
  const manifestPath = await findAncestorWithChild(rootDir, ["package.json"]);
  if (!manifestPath) {
    return null;
  }

  const manifest = await readPackageJson(manifestPath);
  const dependencyEntries = getDependencyEntries(manifest);
  const coreVersion = dependencyEntries.find(
    ([packageName, version]) =>
      packageName === "@salt-ds/core" && version.trim().length > 0,
  );
  if (coreVersion) {
    return coreVersion[1].trim();
  }

  const firstSaltVersion = dependencyEntries.find(
    ([packageName, version]) =>
      packageName.startsWith("@salt-ds/") && version.trim().length > 0,
  );
  return firstSaltVersion ? firstSaltVersion[1].trim() : null;
}

async function detectImportConventions(rootDir: string): Promise<{
  tsconfig_path: string | null;
  aliases: Array<{
    alias: string;
    targets: string[];
  }>;
}> {
  const tsconfigPath =
    (await findAncestorWithChild(rootDir, ["tsconfig.json"])) ??
    (await findAncestorWithChild(rootDir, ["tsconfig.base.json"]));
  if (!tsconfigPath) {
    return {
      tsconfig_path: null,
      aliases: [],
    };
  }

  let tsconfig: ReturnType<typeof parseTsconfig>;
  try {
    tsconfig = parseTsconfig(tsconfigPath);
  } catch {
    return {
      tsconfig_path: toPosix(tsconfigPath),
      aliases: [],
    };
  }

  const compilerOptions = (tsconfig.compilerOptions ?? {}) as {
    paths?: Record<string, string[]>;
  };
  const aliases = Object.entries(compilerOptions.paths ?? {})
    .filter(
      ([alias, targets]) =>
        alias.trim().length > 0 &&
        Array.isArray(targets) &&
        targets.some(
          (target) => typeof target === "string" && target.trim().length > 0,
        ),
    )
    .map(([alias, targets]) => ({
      alias,
      targets: targets.filter(
        (target): target is string =>
          typeof target === "string" && target.trim().length > 0,
      ),
    }));

  return {
    tsconfig_path: toPosix(tsconfigPath),
    aliases,
  };
}

async function detectProjectConventions(
  rootDir: string,
  currentSaltVersion: string | null,
  detailLevel: ProjectPolicyDetailLevel,
): Promise<{
  team_config_path: string | null;
  stack_config_path: string | null;
  mode: "none" | "team" | "stack";
  approved_wrappers: string[];
  stack_layers: SaltProjectContextData["policy"]["stack_layers"];
  shared_conventions: SaltProjectContextData["policy"]["shared_conventions"];
  notes: string[];
}> {
  const policy = await detectProjectPolicy(rootDir, currentSaltVersion, {
    detailLevel,
  });

  return {
    team_config_path: toPosix(policy.teamConfigPath),
    stack_config_path: toPosix(policy.stackConfigPath),
    mode: policy.mode,
    approved_wrappers: policy.approvedWrappers,
    stack_layers: policy.stackLayers.map((layer) => ({
      id: layer.id,
      scope: layer.scope,
      source_type: layer.sourceType,
      source: layer.source,
      optional: layer.optional,
      resolution: {
        status: layer.resolution.status,
        resolved_path: toPosix(layer.resolution.resolvedPath),
        package_name: layer.resolution.packageName,
        export_name: layer.resolution.exportName,
        version: layer.resolution.version,
        package_version: layer.resolution.packageVersion,
        conventions_version: layer.resolution.conventionsVersion,
        contract: layer.resolution.contract,
        project: layer.resolution.project,
        pack_id: layer.resolution.packId,
        supported_salt_range: layer.resolution.supportedSaltRange,
        compatibility: layer.resolution.compatibility
          ? {
              status: layer.resolution.compatibility.status,
              current_salt_version:
                layer.resolution.compatibility.currentSaltVersion,
              checked_version: layer.resolution.compatibility.checkedVersion,
              reason: layer.resolution.compatibility.reason,
            }
          : null,
        reason: layer.resolution.reason,
      },
    })),
    shared_conventions: {
      enabled: policy.sharedConventions.enabled,
      pack_count: policy.sharedConventions.packCount,
      packs: policy.sharedConventions.packs,
      pack_details: policy.sharedConventions.packDetails.map((detail) => ({
        id: detail.id,
        source: detail.source,
        package_name: detail.packageName,
        export_name: detail.exportName,
        version: detail.version,
        package_version: detail.packageVersion,
        conventions_version: detail.conventionsVersion,
        pack_id: detail.packId,
        supported_salt_range: detail.supportedSaltRange,
        status: detail.status,
        compatibility: detail.compatibility
          ? {
              status: detail.compatibility.status,
              current_salt_version: detail.compatibility.currentSaltVersion,
              checked_version: detail.compatibility.checkedVersion,
              reason: detail.compatibility.reason,
            }
          : null,
        resolved_path: toPosix(detail.resolvedPath),
        reason: detail.reason,
      })),
    },
    notes: policy.notes,
  };
}

async function detectRepoSignals(
  rootDir: string,
  packageJson: PackageJsonLike | null,
  framework: FrameworkName,
  policy: {
    team_config_path: string | null;
    stack_config_path: string | null;
  },
): Promise<SaltProjectContextData["repo_signals"]> {
  const dependencyNames = getDependencyNames(packageJson);
  const storybookDetected =
    dependencyNames.includes("storybook") ||
    dependencyNames.some((packageName) =>
      packageName.startsWith("@storybook/"),
    ) ||
    (await pathExists(path.join(rootDir, ".storybook")));

  const appRuntimeDetected =
    framework !== "unknown" ||
    Boolean(packageJson?.scripts?.dev) ||
    Boolean(packageJson?.scripts?.start);

  return {
    storybook_detected: storybookDetected,
    app_runtime_detected: appRuntimeDetected,
    salt_team_config_found: Boolean(policy.team_config_path),
    salt_stack_config_found: Boolean(policy.stack_config_path),
  };
}

function createDetectedTargets(
  packageJson: PackageJsonLike | null,
  signals: SaltProjectContextData["repo_signals"],
): SaltProjectContextData["runtime"]["detected_targets"] {
  return detectLocalRuntimeTargets({
    packageJson,
    storybookDetected: signals.storybook_detected,
    appRuntimeDetected: signals.app_runtime_detected,
  });
}

function buildSummary(input: {
  saltPackages: Array<{ name: string; version: string }>;
  hasSaltVersionIssues: boolean;
  blockingWorkflows: Array<"review" | "migrate" | "upgrade">;
  policyMode: "none" | "team" | "stack";
  repoInstructionPath: string | null;
  runtimeTargets: Array<{ label: "storybook" | "app-runtime"; url: string }>;
}): SaltProjectContextData["summary"] {
  const workflowAvailability = buildRepoAwareSaltWorkflowAvailability(
    input.blockingWorkflows,
  );
  const bootstrapReason =
    input.policyMode === "none" && !input.repoInstructionPath
      ? "Bootstrap is optional for first results. Run bootstrap_salt_repo (or salt-ds init when MCP bootstrap is unavailable) when you want durable repo policy and the managed root instruction block for future repo-aware refinement."
      : input.policyMode === "none"
        ? "Bootstrap is optional for first results. Run bootstrap_salt_repo (or salt-ds init when MCP bootstrap is unavailable) when wrappers, bans, shells, or other durable repo policy should refine future Salt answers."
        : !input.repoInstructionPath
          ? "Bootstrap is optional for first results. Run bootstrap_salt_repo (or salt-ds init when MCP bootstrap is unavailable) to add the managed root instruction block so hosts consistently use Salt transport instead of memory."
          : null;
  const blockedWorkflowReason =
    input.blockingWorkflows.length > 0
      ? `Salt install health is currently blocking ${input.blockingWorkflows.join(", ")}. Resolve dependency health before relying on those repo-aware workflows.`
      : null;
  const preferredNextTool =
    input.saltPackages.length > 0
      ? workflowAvailability.review
        ? ("review_salt_ui" as const)
        : null
      : input.runtimeTargets.length > 0
        ? workflowAvailability.migrate
          ? ("migrate_to_salt" as const)
          : null
        : workflowAvailability.create
          ? ("create_salt_ui" as const)
          : null;
  const buildBootstrapRequirement = (
    nextToolAfterBootstrap:
      | "create_salt_ui"
      | "review_salt_ui"
      | "migrate_to_salt"
      | "upgrade_salt_ui"
      | null,
  ) => ({
    status: bootstrapReason
      ? ("recommended" as const)
      : ("not_required" as const),
    tool: "bootstrap_salt_repo" as const,
    cli_command: "salt-ds init" as const,
    reason: bootstrapReason,
    next_tool_after_bootstrap: bootstrapReason ? nextToolAfterBootstrap : null,
  });

  if (input.saltPackages.length > 0) {
    return {
      recommended_next_tool: preferredNextTool,
      bootstrap_requirement: buildBootstrapRequirement(preferredNextTool),
      reasons: [
        ...(bootstrapReason ? [bootstrapReason] : []),
        ...(blockedWorkflowReason ? [blockedWorkflowReason] : []),
        preferredNextTool === "review_salt_ui"
          ? input.hasSaltVersionIssues
            ? "Salt packages are already present and version inconsistencies were detected, so review is the safest default first workflow once install health is acceptable."
            : "Salt packages are already present, so review is the safest default first workflow."
          : "Salt packages are already present, but review is blocked until Salt install health is fixed.",
      ],
    };
  }

  if (input.runtimeTargets.length > 0) {
    return {
      recommended_next_tool: preferredNextTool,
      bootstrap_requirement: buildBootstrapRequirement(preferredNextTool),
      reasons: [
        ...(bootstrapReason ? [bootstrapReason] : []),
        ...(blockedWorkflowReason ? [blockedWorkflowReason] : []),
        preferredNextTool === "migrate_to_salt"
          ? "The repo looks like an existing app without Salt packages, so migrate is the most likely first workflow."
          : "The repo looks like an existing app without Salt packages, but migrate is blocked until Salt install health is fixed.",
      ],
    };
  }

  return {
    recommended_next_tool: preferredNextTool,
    bootstrap_requirement: buildBootstrapRequirement(preferredNextTool),
    reasons: [
      ...(bootstrapReason ? [bootstrapReason] : []),
      ...(blockedWorkflowReason ? [blockedWorkflowReason] : []),
      "No existing Salt usage was detected, and the repo context looks ready for new Salt UI creation.",
    ],
  };
}

export async function getSaltProjectContext(
  registry: SaltRegistry,
  args: { root_dir?: string; include_policy_diagnostics?: boolean } = {},
): Promise<SaltProjectContextResult> {
  const context = await collectSaltProjectContextData(registry, args);
  return toSaltProjectContextResult(
    context,
    buildSaltProjectContextId(context.root_dir),
  );
}

export function buildSaltProjectContextId(rootDir: string): string {
  return Buffer.from(rootDir, "utf8").toString("base64url");
}

export function toSaltProjectContextResult(
  context: SaltProjectContextData,
  contextId: string,
): SaltProjectContextResult {
  const { summary, notes, sources, ...result } = context;

  return {
    workflow: {
      id: "get_salt_project_context",
    },
    result: {
      ...result,
      context_id: contextId,
    },
    artifacts: {
      summary,
      notes,
    },
    sources,
  };
}

export async function collectSaltProjectContextData(
  registry: SaltRegistry,
  args: { root_dir?: string; include_policy_diagnostics?: boolean } = {},
): Promise<SaltProjectContextData> {
  const rootDir = path.resolve(process.cwd(), args.root_dir ?? ".");
  const packageJsonPath = await findAncestorWithChild(rootDir, [
    "package.json",
  ]);
  const packageJson = await readPackageJson(packageJsonPath);
  const packageManager = await detectPackageManagerNameFromHelper(
    rootDir,
    packageJson,
  );
  const workspace = await detectWorkspaceContext(rootDir);
  const framework = await detectFramework(rootDir, packageJson);
  const repoInstructions = await detectRepoInstructions(rootDir);
  const packageVersion = await detectSaltPackageVersion(rootDir);
  const saltPackages = collectSaltPackagesFromHelper(packageJson);
  const saltInstallation = await collectSaltInstallationDiagnostics(
    rootDir,
    saltPackages,
    packageManager,
  );
  const currentSaltVersion = deriveComparableSaltVersion({
    declaredVersion: packageVersion,
    resolvedVersions: saltInstallation.version_health.resolved_versions,
    installedVersions: saltInstallation.version_health.installed_versions,
  });
  const detectedPolicy = await detectProjectConventions(
    rootDir,
    currentSaltVersion,
    args.include_policy_diagnostics ? "resolved" : "summary",
  );
  const { notes: policyNotes, ...policy } = detectedPolicy;
  const repoSignals = await detectRepoSignals(
    rootDir,
    packageJson,
    framework.name,
    policy,
  );
  const imports = await detectImportConventions(rootDir);
  const runtimeTargets = createDetectedTargets(packageJson, repoSignals);
  const runtimeMetadata = getSaltMcpRuntimeMetadata(registry);
  const notes = [...policyNotes];
  const workflowAvailability = buildRepoAwareSaltWorkflowAvailability(
    saltInstallation.health_summary.blocking_workflows,
  );

  if (!policy.team_config_path && !policy.stack_config_path) {
    notes.push(
      "No declared Salt policy detected (.salt/team.json or .salt/stack.json).",
    );
  }

  if (!repoInstructions.path) {
    notes.push("No repo-local instruction file detected.");
  }

  notes.push(...saltInstallation.version_health.issues);
  if (saltInstallation.inspection.manifest_override_fields.length > 0) {
    notes.push(
      `Salt dependency override fields detected: ${saltInstallation.inspection.manifest_override_fields.join(", ")}.`,
    );
  }
  if (saltInstallation.inspection.limitations.length > 0) {
    notes.push(...saltInstallation.inspection.limitations);
  }
  if (
    saltInstallation.version_health.issues.length > 0 &&
    saltInstallation.remediation.explain_command
  ) {
    notes.push(
      `Inspect Salt dependency drift with ${saltInstallation.remediation.explain_command}.`,
    );
  }
  if (
    saltInstallation.workspace.issue_source_hint !== "none" &&
    saltInstallation.workspace.workspace_root
  ) {
    notes.push(
      `Salt install issue scope: ${saltInstallation.workspace.issue_source_hint} (workspace root ${saltInstallation.workspace.workspace_root}).`,
    );
  }
  if (saltInstallation.health_summary.blocking_workflows.length > 0) {
    notes.push(
      `Salt install health blocks workflows: ${saltInstallation.health_summary.blocking_workflows.join(", ")}.`,
    );
  }
  if (saltInstallation.duplicate_packages.length > 0) {
    notes.push(
      `Duplicate Salt installs detected for ${saltInstallation.duplicate_packages.map((saltPackage: { name: string }) => saltPackage.name).join(", ")}.`,
    );
  }
  const sources = buildContextSources({
    packageJsonPath: toPosix(packageJsonPath),
    repoInstructionsPath: repoInstructions.path,
    teamConfigPath: policy.team_config_path,
    stackConfigPath: policy.stack_config_path,
    tsconfigPath: imports.tsconfig_path,
    stackLayers: policy.stack_layers,
  });

  return {
    root_dir: toPosix(rootDir) ?? rootDir,
    package_json_path: toPosix(packageJsonPath),
    environment: {
      os: os.platform(),
      node_version: process.version,
      package_manager: packageManager,
    },
    framework,
    workspace,
    salt: {
      packages: saltPackages,
      package_version: packageVersion,
      installation: saltInstallation,
    },
    repo_signals: repoSignals,
    repo_instructions: repoInstructions,
    policy,
    imports,
    runtime: {
      detected_targets: runtimeTargets,
    },
    transport: {
      canonical_transport: "mcp",
      registry_version: runtimeMetadata.registry_version,
      registry_generated_at: runtimeMetadata.registry_generated_at,
    },
    workflows: {
      create: workflowAvailability.create,
      review: workflowAvailability.review,
      migrate: workflowAvailability.migrate,
      upgrade: workflowAvailability.upgrade,
      runtime_evidence: runtimeTargets.length > 0,
    },
    summary: buildSummary({
      saltPackages,
      hasSaltVersionIssues: saltInstallation.version_health.issues.length > 0,
      blockingWorkflows: saltInstallation.health_summary.blocking_workflows,
      policyMode: policy.mode,
      repoInstructionPath: repoInstructions.path,
      runtimeTargets,
    }),
    notes,
    sources,
  };
}
