import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
import type { SaltRegistry } from "../types.js";
import { getSaltMcpRuntimeMetadata } from "./serverMetadata.js";

const require = createRequire(import.meta.url);

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
type StackLayerSource =
  | {
      type: "file";
      path: string;
    }
  | {
      type: "package";
      specifier: string;
      export?: string;
    };

interface StackLayerLike {
  id?: unknown;
  scope?: unknown;
  optional?: unknown;
  source?: unknown;
}

interface StackLike {
  layers?: unknown;
}

interface NormalizedStackLayer {
  id: string;
  scope: StackLayerScope;
  source_type: "file" | "package";
  source: string;
  optional: boolean;
  file_path?: string;
  package_specifier?: string;
  export_name?: string;
}

export interface SaltProjectContextResult {
  workflow: "context";
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
        status: "resolved" | "missing" | "unreadable";
        resolved_path: string | null;
        package_name: string | null;
        export_name: string | null;
        version: string | null;
        contract: string | null;
        project: string | null;
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
        status: "resolved" | "missing" | "unreadable";
        resolved_path: string | null;
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
      source: "detected-default";
    }>;
  };
  transport: {
    canonical_transport: "mcp";
    registry_version: string;
    registry_generated_at: string;
  };
  workflows: {
    create: true;
    review: true;
    migrate: true;
    upgrade: true;
    runtime_evidence: boolean;
  };
  summary: {
    recommended_next_workflow:
      | "init"
      | "create"
      | "review"
      | "migrate"
      | "upgrade";
    reasons: string[];
  };
  notes: string[];
}

function toPosix(inputPath: string | null): string | null {
  return inputPath ? inputPath.split(path.sep).join("/") : null;
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

async function detectPackageManager(
  rootDir: string,
  packageJson: PackageJsonLike | null,
): Promise<string> {
  const packageManager = packageJson?.packageManager;
  if (typeof packageManager === "string" && packageManager.trim().length > 0) {
    return packageManager.split("@")[0];
  }

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

  const configResult = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configResult.error) {
    return {
      tsconfig_path: toPosix(tsconfigPath),
      aliases: [],
    };
  }

  const compilerOptions =
    (
      configResult.config as {
        compilerOptions?: { paths?: Record<string, string[]> };
      }
    ).compilerOptions ?? {};
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

async function detectProjectConventions(rootDir: string): Promise<{
  team_config_path: string | null;
  stack_config_path: string | null;
  mode: "none" | "team" | "stack";
  approved_wrappers: string[];
  stack_layers: SaltProjectContextResult["policy"]["stack_layers"];
  shared_conventions: SaltProjectContextResult["policy"]["shared_conventions"];
  notes: string[];
}> {
  const teamConfigPath = path.join(rootDir, ".salt", "team.json");
  const stackConfigPath = path.join(rootDir, ".salt", "stack.json");
  const stackConfigDir = path.dirname(stackConfigPath);
  const notes: string[] = [];
  let approvedWrappers: string[] = [];
  let normalizedStackLayers: NormalizedStackLayer[] = [];

  if (await pathExists(teamConfigPath)) {
    try {
      const teamConfig = JSON.parse(
        await fs.readFile(teamConfigPath, "utf8"),
      ) as { approved_wrappers?: unknown };
      if (Array.isArray(teamConfig.approved_wrappers)) {
        approvedWrappers = teamConfig.approved_wrappers.filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        );
      }
    } catch {
      approvedWrappers = [];
    }
  }

  if (await pathExists(stackConfigPath)) {
    try {
      const stackConfig = JSON.parse(
        await fs.readFile(stackConfigPath, "utf8"),
      ) as StackLike;
      normalizedStackLayers = Array.isArray(stackConfig.layers)
        ? stackConfig.layers.flatMap<NormalizedStackLayer>((layer) => {
            if (!layer || typeof layer !== "object") {
              return [];
            }

            const candidate = layer as StackLayerLike;
            if (
              typeof candidate.id !== "string" ||
              !(
                candidate.scope === "line_of_business" ||
                candidate.scope === "team" ||
                candidate.scope === "repo" ||
                candidate.scope === "other"
              )
            ) {
              return [];
            }

            const source = candidate.source;
            if (!source || typeof source !== "object" || !("type" in source)) {
              return [];
            }

            const typedSource = source as StackLayerSource;
            if (
              typedSource.type === "file" &&
              typeof typedSource.path === "string"
            ) {
              return [
                {
                  id: candidate.id,
                  scope: candidate.scope as StackLayerScope,
                  source_type: "file",
                  source: typedSource.path,
                  optional: candidate.optional === true,
                  file_path: path.resolve(stackConfigDir, typedSource.path),
                },
              ];
            }

            if (
              typedSource.type === "package" &&
              typeof typedSource.specifier === "string"
            ) {
              return [
                {
                  id: candidate.id,
                  scope: candidate.scope as StackLayerScope,
                  source_type: "package",
                  source: typedSource.export
                    ? `${typedSource.specifier}#${typedSource.export}`
                    : typedSource.specifier,
                  optional: candidate.optional === true,
                  package_specifier: typedSource.specifier,
                  export_name: typedSource.export,
                },
              ];
            }

            return [];
          })
        : [];
    } catch {
      notes.push(
        "Detected .salt/stack.json but could not parse layered project conventions.",
      );
    }
  }

  const stackLayers = await Promise.all(
    normalizedStackLayers.map(async (layer) => {
      if (layer.source_type === "file") {
        const resolvedPath =
          layer.file_path ?? path.resolve(rootDir, layer.source);
        if (!(await pathExists(resolvedPath))) {
          notes.push(
            `Could not resolve local project-conventions layer ${layer.id} at ${layer.source}.`,
          );
          return {
            id: layer.id,
            scope: layer.scope,
            source_type: layer.source_type,
            source: layer.source,
            optional: layer.optional,
            resolution: {
              status: "missing" as const,
              resolved_path: toPosix(resolvedPath),
              package_name: null,
              export_name: null,
              version: null,
              contract: null,
              project: null,
            },
          };
        }

        try {
          const parsed = JSON.parse(
            await fs.readFile(resolvedPath, "utf8"),
          ) as {
            contract?: unknown;
            version?: unknown;
            project?: unknown;
          };
          return {
            id: layer.id,
            scope: layer.scope,
            source_type: layer.source_type,
            source: layer.source,
            optional: layer.optional,
            resolution: {
              status: "resolved" as const,
              resolved_path: toPosix(resolvedPath),
              package_name: null,
              export_name: null,
              version:
                typeof parsed.version === "string" ? parsed.version : null,
              contract:
                typeof parsed.contract === "string" ? parsed.contract : null,
              project:
                typeof parsed.project === "string" ? parsed.project : null,
            },
          };
        } catch {
          notes.push(
            `Could not parse local project-conventions layer ${layer.id} at ${layer.source}.`,
          );
          return {
            id: layer.id,
            scope: layer.scope,
            source_type: layer.source_type,
            source: layer.source,
            optional: layer.optional,
            resolution: {
              status: "unreadable" as const,
              resolved_path: toPosix(resolvedPath),
              package_name: null,
              export_name: null,
              version: null,
              contract: null,
              project: null,
            },
          };
        }
      }

      const packageSpecifier = layer.package_specifier ?? layer.source;
      try {
        const packageJsonPath = require.resolve(
          `${packageSpecifier}/package.json`,
          {
            paths: [rootDir],
          },
        );
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, "utf8"),
        ) as PackageJsonLike;

        return {
          id: layer.id,
          scope: layer.scope,
          source_type: layer.source_type,
          source: layer.source,
          optional: layer.optional,
          resolution: {
            status: "resolved" as const,
            resolved_path: toPosix(packageJsonPath),
            package_name:
              typeof packageJson.name === "string"
                ? packageJson.name
                : packageSpecifier,
            export_name: layer.export_name ?? null,
            version:
              typeof packageJson.version === "string"
                ? packageJson.version
                : null,
            contract: null,
            project: null,
          },
        };
      } catch {
        notes.push(
          `Could not resolve package-backed project-conventions layer ${layer.id} (${layer.source}).`,
        );
        return {
          id: layer.id,
          scope: layer.scope,
          source_type: layer.source_type,
          source: layer.source,
          optional: layer.optional,
          resolution: {
            status: "missing" as const,
            resolved_path: null,
            package_name: packageSpecifier,
            export_name: layer.export_name ?? null,
            version: null,
            contract: null,
            project: null,
          },
        };
      }
    }),
  );

  const sharedConventionsPacks = stackLayers
    .filter((layer) => layer.source_type === "package")
    .map((layer) => layer.source);
  const sharedConventionsPackDetails = stackLayers
    .filter((layer) => layer.source_type === "package")
    .map((layer) => ({
      id: layer.id,
      source: layer.source,
      package_name: layer.resolution.package_name,
      export_name: layer.resolution.export_name,
      version: layer.resolution.version,
      status: layer.resolution.status,
      resolved_path: layer.resolution.resolved_path,
    }));

  if (sharedConventionsPacks.length > 0) {
    notes.push(
      "Package-backed project-convention layers detected in .salt/stack.json. This repo is using shared conventions packs.",
    );
  }

  const resolvedTeamConfigPath = (await pathExists(teamConfigPath))
    ? toPosix(teamConfigPath)
    : null;
  const resolvedStackConfigPath = (await pathExists(stackConfigPath))
    ? toPosix(stackConfigPath)
    : null;

  return {
    team_config_path: resolvedTeamConfigPath,
    stack_config_path: resolvedStackConfigPath,
    mode: resolvedStackConfigPath
      ? "stack"
      : resolvedTeamConfigPath
        ? "team"
        : "none",
    approved_wrappers: approvedWrappers,
    stack_layers: stackLayers,
    shared_conventions: {
      enabled: sharedConventionsPacks.length > 0,
      pack_count: sharedConventionsPacks.length,
      packs: sharedConventionsPacks,
      pack_details: sharedConventionsPackDetails,
    },
    notes,
  };
}

function detectSaltPackages(packageJson: PackageJsonLike | null): Array<{
  name: string;
  version: string;
}> {
  return getDependencyEntries(packageJson)
    .filter(
      ([packageName, version]) =>
        packageName.startsWith("@salt-ds/") && version.trim().length > 0,
    )
    .map(([name, version]) => ({ name, version: version.trim() }));
}

async function detectRepoSignals(
  rootDir: string,
  packageJson: PackageJsonLike | null,
  framework: FrameworkName,
  policy: {
    team_config_path: string | null;
    stack_config_path: string | null;
  },
): Promise<SaltProjectContextResult["repo_signals"]> {
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
  signals: SaltProjectContextResult["repo_signals"],
): SaltProjectContextResult["runtime"]["detected_targets"] {
  const targets: SaltProjectContextResult["runtime"]["detected_targets"] = [];

  if (signals.storybook_detected) {
    targets.push({
      label: "storybook",
      url: "http://127.0.0.1:6006/",
      source: "detected-default",
    });
  }

  if (signals.app_runtime_detected) {
    targets.push({
      label: "app-runtime",
      url: "http://127.0.0.1:3000/",
      source: "detected-default",
    });
  }

  return targets;
}

function buildSummary(input: {
  saltPackages: Array<{ name: string; version: string }>;
  policyMode: "none" | "team" | "stack";
  repoInstructionPath: string | null;
  runtimeTargets: Array<{ label: "storybook" | "app-runtime"; url: string }>;
}): SaltProjectContextResult["summary"] {
  if (input.policyMode === "none" || !input.repoInstructionPath) {
    return {
      recommended_next_workflow: "init",
      reasons: [
        "The repo has not finished adopting Salt workflow policy or repo instructions yet.",
      ],
    };
  }

  if (input.saltPackages.length > 0) {
    return {
      recommended_next_workflow: "review",
      reasons: [
        "Salt packages are already present, so review is the safest default first workflow.",
      ],
    };
  }

  if (input.runtimeTargets.length > 0) {
    return {
      recommended_next_workflow: "migrate",
      reasons: [
        "The repo looks like an existing app without Salt packages, so migrate is the most likely first workflow.",
      ],
    };
  }

  return {
    recommended_next_workflow: "create",
    reasons: [
      "No existing Salt usage was detected, and the repo context looks ready for new Salt UI creation.",
    ],
  };
}

export async function getSaltProjectContext(
  registry: SaltRegistry,
  args: { root_dir?: string } = {},
): Promise<SaltProjectContextResult> {
  const rootDir = path.resolve(process.cwd(), args.root_dir ?? ".");
  const packageJsonPath = await findAncestorWithChild(rootDir, [
    "package.json",
  ]);
  const packageJson = await readPackageJson(packageJsonPath);
  const workspace = await detectWorkspaceContext(rootDir);
  const framework = await detectFramework(rootDir, packageJson);
  const repoInstructions = await detectRepoInstructions(rootDir);
  const policy = await detectProjectConventions(rootDir);
  const repoSignals = await detectRepoSignals(
    rootDir,
    packageJson,
    framework.name,
    policy,
  );
  const imports = await detectImportConventions(rootDir);
  const runtimeTargets = createDetectedTargets(repoSignals);
  const packageVersion = await detectSaltPackageVersion(rootDir);
  const saltPackages = detectSaltPackages(packageJson);
  const runtimeMetadata = getSaltMcpRuntimeMetadata(registry);
  const notes = [...policy.notes];

  if (!policy.team_config_path && !policy.stack_config_path) {
    notes.push(
      "No declared Salt policy detected (.salt/team.json or .salt/stack.json).",
    );
  }

  if (!repoInstructions.path) {
    notes.push("No repo-local instruction file detected.");
  }

  return {
    workflow: "context",
    root_dir: toPosix(rootDir) ?? rootDir,
    package_json_path: toPosix(packageJsonPath),
    environment: {
      os: os.platform(),
      node_version: process.version,
      package_manager: await detectPackageManager(rootDir, packageJson),
    },
    framework,
    workspace,
    salt: {
      packages: saltPackages,
      package_version: packageVersion,
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
      create: true,
      review: true,
      migrate: true,
      upgrade: true,
      runtime_evidence: runtimeTargets.length > 0,
    },
    summary: buildSummary({
      saltPackages,
      policyMode: policy.mode,
      repoInstructionPath: repoInstructions.path,
      runtimeTargets,
    }),
    notes,
  };
}
