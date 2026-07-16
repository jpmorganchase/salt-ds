import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createPathsMatcher, parseTsconfig } from "get-tsconfig";
import { parse as parseJsonc, type ParseError } from "jsonc-parser";
import {
  deriveComparableSaltVersion,
  detectProjectPolicy,
  type ProjectPolicyDetailLevel,
  type SaltRegistry,
} from "../core/runtime.js";
import {
  collectSaltInstallationDiagnostics as collectSaltInstallationDiagnosticsFromHelper,
  collectSaltPackages as collectSaltPackagesFromHelper,
  detectPackageManagerName as detectPackageManagerNameFromHelper,
  detectSaltWorkspaceScope,
  inspectPackageJsonFile,
  type MarkerInspectionReason,
  readPackageJsonFile,
  type SaltPackageJsonLike,
} from "./projectContext/saltInstallation.js";
import { buildRepoAwareSaltWorkflowAvailability } from "./projectContext/workflowAvailability.js";
import {
  inspectWorkflowProjectPolicyArtifact,
  type WorkflowProjectPolicyInspection,
} from "./projectPolicy.js";
import type { ProjectPolicyImportTargetDiagnostics } from "./projectPolicyImports.js";
import { getSaltMcpRuntimeMetadata } from "./serverMetadata.js";

type PackageJsonLike = SaltPackageJsonLike;

type FrameworkName = "next" | "vite-react" | "vite" | "react" | "unknown";
type WorkspaceKind =
  | "single-package"
  | "workspace-root"
  | "workspace-package"
  | "unknown";
type StackLayerScope = "line_of_business" | "team" | "repo" | "other";
type ProjectContextResolutionSource = "explicit_input" | "process_cwd";
type ProjectContextResolutionStatus =
  | "resolved"
  | "fallback"
  | "needs_explicit_root"
  | "mismatch";
type ProjectContextResolutionQuality = "ready" | "needs_explicit_root";
type ProjectContextRetry = {
  root_dir: string | null;
};
type ProjectContextHealthSummary = {
  resolution_status: ProjectContextResolutionStatus;
  trusted: boolean;
  repo_specific_workflows_ready: boolean;
  reason: string | null;
};
type PublicRepoAwareWorkflow = "review" | "migrate";

interface InvalidProjectMarker {
  path: string;
  reason: MarkerInspectionReason;
}

interface SaltProjectContextSource {
  original: string;
  resolved: string;
  kind: "site" | "external" | "repo";
}

export interface SaltProjectContextData {
  root_dir: string;
  resolution: {
    status: ProjectContextResolutionStatus;
    root_source: ProjectContextResolutionSource;
    quality: ProjectContextResolutionQuality;
    reason: string | null;
  };
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
      resolved_packages: Array<{
        name: string;
        declared_version: string;
        resolved_version: string | null;
        resolved_path: string | null;
        satisfies_declared_version: boolean | null;
      }>;
      version_health: {
        declared_versions: string[];
        resolved_versions: string[];
        multiple_declared_versions: boolean;
        multiple_resolved_versions: boolean;
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
        strategy: "manifest-resolution" | "manifest-only";
        status: "succeeded" | "limited";
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
      health_summary: {
        health: "pass" | "warn" | "fail";
        recommended_action:
          | "none"
          | "inspect-dependency-drift"
          | "reinstall-dependencies";
        blocking_workflows: PublicRepoAwareWorkflow[];
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
    import_targets: ProjectPolicyImportTargetDiagnostics;
  };
  imports: {
    tsconfig_path: string | null;
    aliases: Array<{
      alias: string;
      targets: string[];
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
  };
  summary: {
    recommended_next_tool:
      | "create_salt_ui"
      | "review_salt_ui"
      | "migrate_to_salt"
      | null;
    policy_note: {
      status: "declared" | "not_declared" | "not_applicable";
      reason: string | null;
      next_tool_after_policy:
        | "create_salt_ui"
        | "review_salt_ui"
        | "migrate_to_salt"
        | null;
    };
    reasons: string[];
    context_health: ProjectContextHealthSummary;
    retry_with: ProjectContextRetry;
  };
  notes: string[];
  sources: SaltProjectContextSource[];
}

export interface SaltProjectContextResult {
  workflow: {
    id: "get_salt_project_context";
  };
  result: Omit<SaltProjectContextData, "summary" | "notes" | "sources">;
  artifacts: {
    summary: SaltProjectContextData["summary"];
    notes: string[];
  };
  sources: SaltProjectContextSource[];
}

function toPosix(inputPath: string | null): string | null {
  return inputPath ? inputPath.split(path.sep).join("/") : null;
}

function toPosixDirname(inputPath: string | null, levels = 1): string | null {
  if (!inputPath) {
    return null;
  }

  let current = inputPath;
  for (let index = 0; index < levels; index += 1) {
    current = path.posix.dirname(current);
  }

  return current === "." ? null : current;
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

function deriveDetectedRepoRoot(input: {
  root_dir: string;
  package_json_path: string | null;
  workspace_root: string | null;
  repo_instructions_path: string | null;
  team_config_path: string | null;
  stack_config_path: string | null;
  tsconfig_path: string | null;
  framework_name: FrameworkName;
}): string | null {
  const candidates = [
    toPosixDirname(input.package_json_path),
    input.workspace_root,
    toPosixDirname(input.team_config_path, 2),
    toPosixDirname(input.stack_config_path, 2),
    toPosixDirname(input.repo_instructions_path),
    toPosixDirname(input.tsconfig_path),
    input.framework_name !== "unknown" ? input.root_dir : null,
  ];

  for (const candidate of candidates) {
    if (candidate) {
      return candidate;
    }
  }

  return null;
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
  return readPackageJsonFile(
    packageJsonPath,
    packageJsonPath ? path.dirname(packageJsonPath) : undefined,
  );
}

function getDependencyEntries(
  packageJson: PackageJsonLike | null,
): Array<[string, string]> {
  const maps: unknown[] = [
    packageJson?.dependencies,
    packageJson?.devDependencies,
    packageJson?.peerDependencies,
  ];

  return maps.flatMap((dependencyMap) => {
    if (
      !dependencyMap ||
      typeof dependencyMap !== "object" ||
      Array.isArray(dependencyMap)
    ) {
      return [];
    }
    return Object.entries(dependencyMap).flatMap(([name, version]) =>
      name.trim().length > 0 && typeof version === "string"
        ? [[name, version] as [string, string]]
        : [],
    );
  });
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
    resolved_packages: installation.resolvedPackages.map((saltPackage) => ({
      name: saltPackage.name,
      declared_version: saltPackage.declaredVersion,
      resolved_version: saltPackage.resolvedVersion,
      resolved_path: saltPackage.resolvedPath,
      satisfies_declared_version: saltPackage.satisfiesDeclaredVersion,
    })),
    version_health: {
      declared_versions: installation.versionHealth.declaredVersions,
      resolved_versions: installation.versionHealth.resolvedVersions,
      multiple_declared_versions:
        installation.versionHealth.multipleDeclaredVersions,
      multiple_resolved_versions:
        installation.versionHealth.multipleResolvedVersions,
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
  const scope = await detectSaltWorkspaceScope(rootDir);
  if (scope.kind === "workspace-root") {
    return {
      kind: "workspace-root",
      workspace_root: toPosix(rootDir),
    };
  }
  if (scope.kind === "workspace-package") {
    return {
      kind: "workspace-package",
      workspace_root: toPosix(scope.workspaceRoot),
    };
  }

  return {
    kind: (await readPackageJson(rootPackageJsonPath))
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
  marker_issue: InvalidProjectMarker | null;
  paths_matcher: ((specifier: string) => string[]) | null;
}> {
  const tsconfigPath =
    (await findAncestorWithChild(rootDir, ["tsconfig.json"])) ??
    (await findAncestorWithChild(rootDir, ["tsconfig.base.json"]));
  if (!tsconfigPath) {
    return {
      tsconfig_path: null,
      aliases: [],
      marker_issue: null,
      paths_matcher: null,
    };
  }

  const normalizedTsconfigPath = toPosix(tsconfigPath) ?? tsconfigPath;
  let realPath: string;

  try {
    const [realRoot, resolvedPath] = await Promise.all([
      fs.realpath(path.dirname(tsconfigPath)),
      fs.realpath(tsconfigPath),
    ]);
    realPath = resolvedPath;
    const relative = path.relative(realRoot, resolvedPath);
    if (
      relative === ".." ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative)
    ) {
      return {
        tsconfig_path: null,
        aliases: [],
        marker_issue: {
          path: normalizedTsconfigPath,
          reason: "outside_root",
        },
        paths_matcher: null,
      };
    }
    if (!(await fs.stat(resolvedPath)).isFile()) {
      return {
        tsconfig_path: null,
        aliases: [],
        marker_issue: {
          path: normalizedTsconfigPath,
          reason: "not_file",
        },
        paths_matcher: null,
      };
    }
  } catch {
    return {
      tsconfig_path: null,
      aliases: [],
      marker_issue: {
        path: normalizedTsconfigPath,
        reason: "unreadable",
      },
      paths_matcher: null,
    };
  }

  let tsconfig: ReturnType<typeof parseTsconfig>;
  try {
    const contents = await fs.readFile(realPath, "utf8");
    const parseErrors: ParseError[] = [];
    const parsed = parseJsonc(
      contents.charCodeAt(0) === 0xfeff ? contents.slice(1) : contents,
      parseErrors,
      { allowTrailingComma: true },
    ) as unknown;
    if (
      parseErrors.length > 0 ||
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new SyntaxError("Invalid tsconfig JSONC object.");
    }
    tsconfig = parseTsconfig(realPath);
  } catch {
    return {
      tsconfig_path: null,
      aliases: [],
      marker_issue: {
        path: normalizedTsconfigPath,
        reason: "parse_error",
      },
      paths_matcher: null,
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
    tsconfig_path: normalizedTsconfigPath,
    aliases,
    marker_issue: null,
    paths_matcher: (() => {
      try {
        return createPathsMatcher({
          path: realPath,
          config: tsconfig,
        });
      } catch {
        return null;
      }
    })(),
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

function buildSummary(input: {
  saltPackages: Array<{ name: string; version: string }>;
  hasSaltVersionIssues: boolean;
  blockingWorkflows: PublicRepoAwareWorkflow[];
  policyMode: "none" | "team" | "stack";
  repoInstructionPath: string | null;
  appRuntimeDetected: boolean;
  resolution: SaltProjectContextData["resolution"];
  retryRootDir: string | null;
  policyBlockingReasons: string[];
  markerBlockingReasons: string[];
}): SaltProjectContextData["summary"] {
  const policyBlockingReason =
    input.policyBlockingReasons.length > 0
      ? `Declared project policy is not implementation-ready: ${input.policyBlockingReasons.join(" ")}`
      : null;
  const contextHealth: ProjectContextHealthSummary = {
    resolution_status: input.resolution.status,
    trusted:
      input.resolution.status === "resolved" &&
      input.markerBlockingReasons.length === 0,
    repo_specific_workflows_ready:
      input.resolution.status === "resolved" &&
      input.markerBlockingReasons.length === 0 &&
      !policyBlockingReason,
    reason:
      input.markerBlockingReasons[0] ??
      input.resolution.reason ??
      policyBlockingReason,
  };
  const retryWith: ProjectContextRetry = {
    root_dir: input.retryRootDir ?? null,
  };

  if (
    input.resolution.status === "needs_explicit_root" ||
    input.resolution.status === "mismatch" ||
    input.resolution.status === "fallback"
  ) {
    return {
      recommended_next_tool: null,
      policy_note: {
        status: "not_applicable",
        reason: null,
        next_tool_after_policy: null,
      },
      reasons: [
        ...input.markerBlockingReasons,
        input.resolution.reason ??
          "Project context could not confidently resolve the repo root. Re-run get_salt_project_context with an explicit root_dir before relying on repo-aware workflow guidance.",
      ],
      context_health: contextHealth,
      retry_with: retryWith,
    };
  }

  if (input.markerBlockingReasons.length > 0) {
    return {
      recommended_next_tool: null,
      policy_note: {
        status: "not_applicable",
        reason: null,
        next_tool_after_policy: null,
      },
      reasons: input.markerBlockingReasons,
      context_health: contextHealth,
      retry_with: retryWith,
    };
  }

  const workflowAvailability = buildRepoAwareSaltWorkflowAvailability(
    input.blockingWorkflows,
  );
  const policyReason =
    input.policyMode === "none" && !input.repoInstructionPath
      ? "No durable Salt team policy or managed repo instruction file was detected. The v1 MCP stays canonical-only until the repo declares policy outside the public MCP surface."
      : input.policyMode === "none"
        ? "No durable Salt team policy was detected. The v1 MCP will not infer repo-specific wrappers, bans, shells, or conventions without declared policy."
        : !input.repoInstructionPath
          ? "Salt team policy is declared, but no managed repo instruction file was detected. The v1 MCP still uses the declared policy it can inspect."
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
      : input.appRuntimeDetected
        ? workflowAvailability.migrate
          ? ("migrate_to_salt" as const)
          : null
        : workflowAvailability.create
          ? ("create_salt_ui" as const)
          : null;
  const buildPolicyNote = (
    nextToolAfterPolicy:
      | "create_salt_ui"
      | "review_salt_ui"
      | "migrate_to_salt"
      | null,
  ) => ({
    status: policyReason ? ("not_declared" as const) : ("declared" as const),
    reason: policyReason,
    next_tool_after_policy: policyReason ? nextToolAfterPolicy : null,
  });

  if (input.saltPackages.length > 0) {
    return {
      recommended_next_tool: preferredNextTool,
      policy_note: buildPolicyNote(preferredNextTool),
      reasons: [
        ...(policyReason ? [policyReason] : []),
        ...(policyBlockingReason ? [policyBlockingReason] : []),
        ...(blockedWorkflowReason ? [blockedWorkflowReason] : []),
        preferredNextTool === "review_salt_ui"
          ? input.hasSaltVersionIssues
            ? "Salt packages are already present and version inconsistencies were detected, so review is the safest default first workflow once install health is acceptable."
            : "Salt packages are already present, so review is the safest default first workflow."
          : "Salt packages are already present, but review is blocked until Salt install health is fixed.",
      ],
      context_health: contextHealth,
      retry_with: retryWith,
    };
  }

  if (input.appRuntimeDetected) {
    return {
      recommended_next_tool: preferredNextTool,
      policy_note: buildPolicyNote(preferredNextTool),
      reasons: [
        ...(policyReason ? [policyReason] : []),
        ...(policyBlockingReason ? [policyBlockingReason] : []),
        ...(blockedWorkflowReason ? [blockedWorkflowReason] : []),
        preferredNextTool === "migrate_to_salt"
          ? "The repo looks like an existing app without Salt packages, so migrate is the most likely first workflow."
          : "The repo looks like an existing app without Salt packages, but migrate is blocked until Salt install health is fixed.",
      ],
      context_health: contextHealth,
      retry_with: retryWith,
    };
  }

  return {
    recommended_next_tool: preferredNextTool,
    policy_note: buildPolicyNote(preferredNextTool),
    reasons: [
      ...(policyReason ? [policyReason] : []),
      ...(policyBlockingReason ? [policyBlockingReason] : []),
      ...(blockedWorkflowReason ? [blockedWorkflowReason] : []),
      policyBlockingReason
        ? "No existing Salt usage was detected. Canonical creation guidance remains usable, but declared project-policy imports must be fixed before repo-specific implementation proceeds."
        : "No existing Salt usage was detected, and the repo context looks ready for new Salt UI creation.",
    ],
    context_health: contextHealth,
    retry_with: retryWith,
  };
}

function buildProjectContextResolution(input: {
  rootDir: string;
  rootDirProvided: boolean;
  detectedRepoRoot: string | null;
  packageJsonPath: string | null;
  workspaceKind: WorkspaceKind;
  saltPackages: Array<{ name: string; version: string }>;
  repoInstructionPath: string | null;
  policyMode: "none" | "team" | "stack";
  frameworkName: FrameworkName;
  tsconfigPath: string | null;
}): SaltProjectContextData["resolution"] {
  const hasRepoSignals =
    input.detectedRepoRoot !== null ||
    input.packageJsonPath !== null ||
    input.workspaceKind !== "unknown" ||
    input.saltPackages.length > 0 ||
    input.repoInstructionPath !== null ||
    input.policyMode !== "none" ||
    input.frameworkName !== "unknown" ||
    input.tsconfigPath !== null;

  if (
    input.rootDirProvided &&
    input.detectedRepoRoot !== null &&
    input.detectedRepoRoot !== input.rootDir
  ) {
    return {
      status: "mismatch",
      root_source: "explicit_input",
      quality: "needs_explicit_root",
      reason: `The explicit root_dir points inside or outside the detected repo root ${input.detectedRepoRoot}. Re-run get_salt_project_context with root_dir set to ${input.detectedRepoRoot} before relying on repo-specific guidance.`,
    };
  }

  if (input.rootDirProvided && hasRepoSignals) {
    return {
      status: "resolved",
      root_source: "explicit_input",
      quality: "ready",
      reason: null,
    };
  }

  if (input.rootDirProvided && !hasRepoSignals) {
    return {
      status: "mismatch",
      root_source: "explicit_input",
      quality: "needs_explicit_root",
      reason:
        "The explicit root_dir did not expose recognizable repo signals for Salt-aware workflow guidance. Re-run get_salt_project_context with the actual repo root before relying on repo-specific guidance.",
    };
  }

  if (
    hasRepoSignals &&
    input.detectedRepoRoot !== null &&
    input.detectedRepoRoot === input.rootDir
  ) {
    return {
      status: "resolved",
      root_source: "process_cwd",
      quality: "ready",
      reason: null,
    };
  }

  if (hasRepoSignals) {
    return {
      status: "fallback",
      root_source: "process_cwd",
      quality: "needs_explicit_root",
      reason: input.detectedRepoRoot
        ? `Repo signals were inferred from the current working directory. Pass root_dir set to ${input.detectedRepoRoot} to the repo-aware workflow before relying on repo-specific guidance.`
        : "Repo signals were inferred from the current working directory. Pass an explicit root_dir to the repo-aware workflow before relying on repo-specific guidance.",
    };
  }

  return {
    status: "needs_explicit_root",
    root_source: "process_cwd",
    quality: "needs_explicit_root",
    reason:
      "Project context could not identify a repo root from the current MCP working directory. Pass an explicit root_dir to get_salt_project_context or the repo-aware workflow before relying on repo-specific guidance.",
  };
}

export function isSaltProjectContextReadyForRepoAwareWork(
  context: SaltProjectContextData,
): boolean {
  return context.summary.context_health.repo_specific_workflows_ready;
}

export async function getSaltProjectContext(
  registry: SaltRegistry,
  args: { root_dir?: string; include_policy_diagnostics?: boolean } = {},
): Promise<SaltProjectContextResult> {
  const context = await collectSaltProjectContextData(registry, args);
  return toSaltProjectContextResult(context);
}

export function toSaltProjectContextResult(
  context: SaltProjectContextData,
): SaltProjectContextResult {
  const { summary, notes, sources, ...result } = context;

  return {
    workflow: {
      id: "get_salt_project_context",
    },
    result,
    artifacts: {
      summary,
      notes,
    },
    sources,
  };
}

function buildWorkflowSaltInstallationSnapshot(input: {
  rootDir: string;
  packageManager: string;
  workspace: SaltProjectContextData["workspace"];
  saltPackages: Array<{ name: string; version: string }>;
}): SaltProjectContextData["salt"]["installation"] {
  const declaredVersions = [
    ...new Set(input.saltPackages.map((entry) => entry.version)),
  ].sort((left, right) => left.localeCompare(right));
  const workspaceKind =
    input.workspace.kind === "workspace-root" ||
    input.workspace.kind === "workspace-package"
      ? input.workspace.kind
      : "single-package";

  return {
    resolved_packages: input.saltPackages.map((entry) => ({
      name: entry.name,
      declared_version: entry.version,
      resolved_version: null,
      resolved_path: null,
      satisfies_declared_version: null,
    })),
    version_health: {
      declared_versions: declaredVersions,
      resolved_versions: [],
      multiple_declared_versions: declaredVersions.length > 1,
      multiple_resolved_versions: false,
      mismatched_packages: [],
      issues: [],
    },
    inspection: {
      package_manager: input.packageManager,
      strategy: "manifest-only",
      status: "limited",
      package_layout: "unknown",
      limitations: [
        "Workflow context uses package manifests only; run get_salt_project_context for installation diagnostics.",
      ],
      manifest_override_fields: [],
    },
    remediation: {
      explain_command: null,
      dedupe_command: null,
      reinstall_command: null,
    },
    workspace: {
      kind: workspaceKind,
      package_root: toPosix(input.rootDir) ?? input.rootDir,
      workspace_root: input.workspace.workspace_root,
      issue_source_hint: "none",
      workspace_salt_packages:
        workspaceKind === "workspace-root" ? input.saltPackages : [],
      workspace_issues: [],
    },
    health_summary: {
      health: "pass",
      recommended_action: "none",
      blocking_workflows: [],
      reasons: [],
    },
  };
}

export interface SaltWorkflowContextBundle {
  context: SaltProjectContextData;
  policyInspection: WorkflowProjectPolicyInspection;
}

async function collectSaltProjectContextBundleWithOptions(
  registry: SaltRegistry,
  args: { root_dir?: string; include_policy_diagnostics?: boolean },
  options: { installationDiagnostics: boolean },
): Promise<SaltWorkflowContextBundle> {
  const rootDir = path.resolve(process.cwd(), args.root_dir ?? ".");
  const discoveredPackageJsonPath = await findAncestorWithChild(rootDir, [
    "package.json",
  ]);
  const packageInspection = await inspectPackageJsonFile(
    discoveredPackageJsonPath,
    discoveredPackageJsonPath
      ? path.dirname(discoveredPackageJsonPath)
      : undefined,
  );
  const packageJsonPath =
    packageInspection.status === "valid" ? packageInspection.path : null;
  const packageJson =
    packageInspection.status === "valid" ? packageInspection.value : null;
  const packageManager = await detectPackageManagerNameFromHelper(
    rootDir,
    packageJson,
  );
  const workspace = await detectWorkspaceContext(rootDir);
  const framework = await detectFramework(rootDir, packageJson);
  const repoInstructions = await detectRepoInstructions(rootDir);
  const packageVersion = await detectSaltPackageVersion(rootDir);
  const saltPackages = collectSaltPackagesFromHelper(packageJson);
  const saltInstallation = options.installationDiagnostics
    ? await collectSaltInstallationDiagnostics(
        rootDir,
        saltPackages,
        packageManager,
      )
    : buildWorkflowSaltInstallationSnapshot({
        rootDir,
        packageManager,
        workspace,
        saltPackages,
      });
  const currentSaltVersion = deriveComparableSaltVersion({
    declaredVersion: packageVersion,
    resolvedVersions: saltInstallation.version_health.resolved_versions,
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
  const detectedImports = await detectImportConventions(rootDir);
  const imports: SaltProjectContextData["imports"] = {
    tsconfig_path: detectedImports.tsconfig_path,
    aliases: detectedImports.aliases,
  };
  const invalidMarkers: InvalidProjectMarker[] = [
    ...(packageInspection.status === "invalid"
      ? [
          {
            path: packageInspection.path,
            reason: packageInspection.reason,
          },
        ]
      : []),
    ...(detectedImports.marker_issue ? [detectedImports.marker_issue] : []),
  ];
  const markerBlockingReasons = invalidMarkers.map(
    (marker) =>
      `Invalid project marker ${marker.path} (${marker.reason}); fix or remove it before relying on repo-specific workflow guidance.`,
  );
  const runtimeMetadata = getSaltMcpRuntimeMetadata(registry);
  const publicBlockingWorkflows =
    saltInstallation.health_summary.blocking_workflows;
  const workflowAvailability = buildRepoAwareSaltWorkflowAvailability(
    publicBlockingWorkflows,
  );
  const normalizedRootDir = toPosix(rootDir) ?? rootDir;
  const policyInspection = await inspectWorkflowProjectPolicyArtifact({
    rootDir: normalizedRootDir,
    currentSaltVersion,
    policy,
    importConventions: {
      pathsMatcher: detectedImports.paths_matcher,
      aliasPatterns: detectedImports.aliases.map((entry) => entry.alias),
    },
  });
  const policyWithImportTargets: SaltProjectContextData["policy"] = {
    ...policy,
    import_targets: policyInspection.importTargets,
  };
  const notes = [...policyNotes, ...policyInspection.blockingReasons];
  const normalizedPackageJsonPath = toPosix(packageJsonPath);
  const detectedRepoRoot = deriveDetectedRepoRoot({
    root_dir: normalizedRootDir,
    package_json_path: normalizedPackageJsonPath,
    workspace_root: workspace.workspace_root,
    repo_instructions_path: repoInstructions.path,
    team_config_path: policy.team_config_path,
    stack_config_path: policy.stack_config_path,
    tsconfig_path: imports.tsconfig_path,
    framework_name: framework.name,
  });
  const resolution = buildProjectContextResolution({
    rootDir: normalizedRootDir,
    rootDirProvided:
      typeof args.root_dir === "string" && args.root_dir.length > 0,
    detectedRepoRoot,
    packageJsonPath: normalizedPackageJsonPath,
    workspaceKind: workspace.kind,
    saltPackages,
    repoInstructionPath: repoInstructions.path,
    policyMode: policy.mode,
    frameworkName: framework.name,
    tsconfigPath: imports.tsconfig_path,
  });

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
  if (publicBlockingWorkflows.length > 0) {
    notes.push(
      `Salt install health blocks workflows: ${publicBlockingWorkflows.join(", ")}.`,
    );
  }
  if (resolution.reason) {
    notes.push(resolution.reason);
  }
  notes.push(...markerBlockingReasons);
  const sources = buildContextSources({
    packageJsonPath: normalizedPackageJsonPath,
    repoInstructionsPath: repoInstructions.path,
    teamConfigPath: policy.team_config_path,
    stackConfigPath: policy.stack_config_path,
    tsconfigPath: imports.tsconfig_path,
    stackLayers: policy.stack_layers,
  });

  const context: SaltProjectContextData = {
    root_dir: normalizedRootDir,
    resolution,
    package_json_path: normalizedPackageJsonPath,
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
    policy: policyWithImportTargets,
    imports,
    transport: {
      canonical_transport: "mcp",
      registry_version: runtimeMetadata.registry_version,
      registry_generated_at: runtimeMetadata.registry_generated_at,
    },
    workflows: {
      create: workflowAvailability.create,
      review: workflowAvailability.review,
      migrate: workflowAvailability.migrate,
    },
    summary: buildSummary({
      saltPackages,
      hasSaltVersionIssues: saltInstallation.version_health.issues.length > 0,
      blockingWorkflows: publicBlockingWorkflows,
      policyMode: policy.mode,
      repoInstructionPath: repoInstructions.path,
      appRuntimeDetected: repoSignals.app_runtime_detected,
      resolution,
      retryRootDir:
        resolution.status === "resolved" ? normalizedRootDir : detectedRepoRoot,
      policyBlockingReasons: policyInspection.blockingReasons,
      markerBlockingReasons,
    }),
    notes,
    sources,
  };
  return { context, policyInspection };
}

async function collectSaltProjectContextDataWithOptions(
  registry: SaltRegistry,
  args: { root_dir?: string; include_policy_diagnostics?: boolean },
  options: { installationDiagnostics: boolean },
): Promise<SaltProjectContextData> {
  return (
    await collectSaltProjectContextBundleWithOptions(registry, args, options)
  ).context;
}

export function collectSaltProjectContextData(
  registry: SaltRegistry,
  args: { root_dir?: string; include_policy_diagnostics?: boolean } = {},
): Promise<SaltProjectContextData> {
  return collectSaltProjectContextDataWithOptions(registry, args, {
    installationDiagnostics: true,
  });
}

export function collectSaltWorkflowContextData(
  registry: SaltRegistry,
  args: { root_dir?: string } = {},
): Promise<SaltProjectContextData> {
  return collectSaltProjectContextDataWithOptions(registry, args, {
    installationDiagnostics: false,
  });
}

export function collectSaltWorkflowContextBundle(
  registry: SaltRegistry,
  args: { root_dir?: string } = {},
): Promise<SaltWorkflowContextBundle> {
  return collectSaltProjectContextBundleWithOptions(registry, args, {
    installationDiagnostics: false,
  });
}
