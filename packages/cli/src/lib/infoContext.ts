import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { getTsconfig } from "get-tsconfig";
import { runDoctor } from "../../../runtime-inspector-core/src/index.js";
import type { SaltInfoResult } from "../types.js";
import { pathExists } from "./common.js";
import {
  detectSaltPackageVersion,
  findAncestorWithChild,
  resolveSemanticRegistry,
} from "./registry.js";

const require = createRequire(import.meta.url);

interface PackageJsonLike {
  name?: string;
  version?: string;
  packageManager?: string;
  workspaces?: unknown;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

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
  sourceType: "file" | "package";
  source: string;
  optional: boolean;
  filePath?: string;
  packageSpecifier?: string;
  exportName?: string;
}

function toPosix(inputPath: string | null): string | null {
  return inputPath ? inputPath.split(path.sep).join("/") : null;
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

function getDependencyNames(packageJson: PackageJsonLike | null): string[] {
  return [
    ...Object.keys(packageJson?.dependencies ?? {}),
    ...Object.keys(packageJson?.devDependencies ?? {}),
    ...Object.keys(packageJson?.peerDependencies ?? {}),
  ];
}

async function detectWorkspaceContext(rootDir: string): Promise<{
  kind: SaltInfoResult["workspace"]["kind"];
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
    kind: (await pathExists(rootPackageJsonPath))
      ? "single-package"
      : "unknown",
    workspaceRoot: null,
  };
}

async function detectFramework(
  rootDir: string,
  packageJson: PackageJsonLike | null,
): Promise<SaltInfoResult["framework"]> {
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

async function detectProjectConventions(rootDir: string): Promise<{
  teamConfigPath: string | null;
  stackConfigPath: string | null;
  mode: SaltInfoResult["policy"]["mode"];
  approvedWrappers: string[];
  stackLayers: SaltInfoResult["policy"]["stackLayers"];
  sharedConventions: SaltInfoResult["policy"]["sharedConventions"];
  notes: string[];
}> {
  const teamConfigPath = path.join(rootDir, ".salt", "team.json");
  const stackConfigPath = path.join(rootDir, ".salt", "stack.json");
  const stackConfigDir = path.dirname(stackConfigPath);
  let approvedWrappers: string[] = [];
  let normalizedStackLayers: NormalizedStackLayer[] = [];
  const notes: string[] = [];

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
                  sourceType: "file" as const,
                  source: typedSource.path,
                  optional: candidate.optional === true,
                  filePath: path.resolve(stackConfigDir, typedSource.path),
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
                  sourceType: "package" as const,
                  source: typedSource.export
                    ? `${typedSource.specifier}#${typedSource.export}`
                    : typedSource.specifier,
                  optional: candidate.optional === true,
                  packageSpecifier: typedSource.specifier,
                  exportName: typedSource.export,
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
      if (layer.sourceType === "file") {
        const resolvedPath =
          layer.filePath ?? path.resolve(rootDir, layer.source);
        if (!(await pathExists(resolvedPath))) {
          notes.push(
            `Could not resolve local project-conventions layer ${layer.id} at ${layer.source}.`,
          );
          return {
            id: layer.id,
            scope: layer.scope,
            sourceType: layer.sourceType,
            source: layer.source,
            optional: layer.optional,
            resolution: {
              status: "missing" as const,
              resolvedPath: toPosix(resolvedPath),
              packageName: null,
              exportName: null,
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
            sourceType: layer.sourceType,
            source: layer.source,
            optional: layer.optional,
            resolution: {
              status: "resolved" as const,
              resolvedPath: toPosix(resolvedPath),
              packageName: null,
              exportName: null,
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
            sourceType: layer.sourceType,
            source: layer.source,
            optional: layer.optional,
            resolution: {
              status: "unreadable" as const,
              resolvedPath: toPosix(resolvedPath),
              packageName: null,
              exportName: null,
              version: null,
              contract: null,
              project: null,
            },
          };
        }
      }

      const packageSpecifier = layer.packageSpecifier ?? layer.source;
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
          sourceType: layer.sourceType,
          source: layer.source,
          optional: layer.optional,
          resolution: {
            status: "resolved" as const,
            resolvedPath: toPosix(packageJsonPath),
            packageName:
              typeof packageJson.name === "string"
                ? packageJson.name
                : packageSpecifier,
            exportName: layer.exportName ?? null,
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
          sourceType: layer.sourceType,
          source: layer.source,
          optional: layer.optional,
          resolution: {
            status: "missing" as const,
            resolvedPath: null,
            packageName: packageSpecifier,
            exportName: layer.exportName ?? null,
            version: null,
            contract: null,
            project: null,
          },
        };
      }
    }),
  );

  const resolvedTeamConfigPath = (await pathExists(teamConfigPath))
    ? toPosix(teamConfigPath)
    : null;
  const resolvedStackConfigPath = (await pathExists(stackConfigPath))
    ? toPosix(stackConfigPath)
    : null;
  const sharedConventionsPacks = stackLayers
    .filter((layer) => layer.sourceType === "package")
    .map((layer) => layer.source);
  const sharedConventionsPackDetails = stackLayers
    .filter((layer) => layer.sourceType === "package")
    .map((layer) => ({
      id: layer.id,
      source: layer.source,
      packageName: layer.resolution.packageName,
      exportName: layer.resolution.exportName,
      version: layer.resolution.version,
      status: layer.resolution.status,
      resolvedPath: layer.resolution.resolvedPath,
    }));

  if (sharedConventionsPacks.length > 0) {
    notes.push(
      "Package-backed project-convention layers detected in .salt/stack.json. This repo is using shared conventions packs.",
    );
  }

  return {
    teamConfigPath: resolvedTeamConfigPath,
    stackConfigPath: resolvedStackConfigPath,
    mode: resolvedStackConfigPath
      ? "stack"
      : resolvedTeamConfigPath
        ? "team"
        : "none",
    approvedWrappers,
    stackLayers,
    sharedConventions: {
      enabled: sharedConventionsPacks.length > 0,
      packCount: sharedConventionsPacks.length,
      packs: sharedConventionsPacks,
      packDetails: sharedConventionsPackDetails,
    },
    notes,
  };
}

function detectImportConventions(rootDir: string): SaltInfoResult["imports"] {
  const tsconfig = getTsconfig(rootDir);
  const aliases = Object.entries(
    (tsconfig?.config.compilerOptions?.paths ?? {}) as Record<
      string,
      string[] | string
    >,
  )
    .map(([alias, targets]) => ({
      alias,
      targets: (Array.isArray(targets) ? targets : [targets]).map((target) =>
        target.split(path.sep).join("/"),
      ),
    }))
    .sort((left, right) => left.alias.localeCompare(right.alias));

  return {
    tsconfigPath: tsconfig?.path ? toPosix(tsconfig.path) : null,
    aliases,
  };
}

function createDetectedTargets(
  signals: SaltInfoResult["repoSignals"],
): SaltInfoResult["runtime"]["detectedTargets"] {
  const targets: SaltInfoResult["runtime"]["detectedTargets"] = [];

  if (signals.storybookDetected) {
    targets.push({
      label: "storybook",
      url: "http://127.0.0.1:6006/",
      source: "detected-default",
    });
  }

  if (signals.appRuntimeDetected) {
    targets.push({
      label: "app-runtime",
      url: "http://127.0.0.1:3000/",
      source: "detected-default",
    });
  }

  return targets;
}

export async function collectSaltInfo(
  cwd: string,
  explicitRegistryDir?: string,
): Promise<SaltInfoResult> {
  const doctor = await runDoctor({ rootDir: cwd });
  const packageJsonPath = await findAncestorWithChild(doctor.rootDir, [
    "package.json",
  ]);
  const packageJson = await readPackageJson(packageJsonPath);
  const workspace = await detectWorkspaceContext(doctor.rootDir);
  const framework = await detectFramework(doctor.rootDir, packageJson);
  const policy = await detectProjectConventions(doctor.rootDir);
  const imports = detectImportConventions(doctor.rootDir);
  const repoInstructions = await detectRepoInstructions(doctor.rootDir);
  const packageVersion = await detectSaltPackageVersion(doctor.rootDir);
  const notes: string[] = [];

  let registry: SaltInfoResult["registry"] = {
    available: false,
    source: null,
    registryDir: null,
    mcpPackageInstalled: false,
    canonicalTransport: "unavailable",
  };

  try {
    const resolvedRegistry = await resolveSemanticRegistry(
      cwd,
      explicitRegistryDir,
    );
    registry = {
      available: true,
      source: resolvedRegistry.registrySource,
      registryDir: toPosix(resolvedRegistry.registryDir),
      mcpPackageInstalled: resolvedRegistry.registrySource === "installed-mcp",
      canonicalTransport:
        resolvedRegistry.registrySource === "installed-mcp" ? "mcp" : "cli",
    };
  } catch (error) {
    notes.push(
      error instanceof Error
        ? error.message
        : "Could not resolve a Salt registry.",
    );
  }

  if (!policy.teamConfigPath && !policy.stackConfigPath) {
    notes.push(
      "No declared Salt policy detected (.salt/team.json or .salt/stack.json).",
    );
  }
  notes.push(...policy.notes);

  if (!repoInstructions.path) {
    notes.push("No repo-local instruction file detected.");
  }

  return {
    toolVersion: "0.0.0",
    timestamp: new Date().toISOString(),
    rootDir: toPosix(doctor.rootDir) ?? doctor.rootDir,
    packageJsonPath: toPosix(packageJsonPath),
    environment: {
      os: os.platform(),
      nodeVersion: process.version,
      packageManager: doctor.environment.packageManager,
    },
    framework,
    workspace,
    salt: {
      packages: doctor.saltPackages,
      packageVersion,
    },
    repoSignals: doctor.repoSignals,
    repoInstructions,
    policy: {
      teamConfigPath: policy.teamConfigPath,
      stackConfigPath: policy.stackConfigPath,
      mode: policy.mode,
      approvedWrappers: policy.approvedWrappers,
      stackLayers: policy.stackLayers,
      sharedConventions: policy.sharedConventions,
    },
    imports,
    runtime: {
      storybookDetected: doctor.repoSignals.storybookDetected,
      appRuntimeDetected: doctor.repoSignals.appRuntimeDetected,
      detectedTargets: createDetectedTargets(doctor.repoSignals),
    },
    registry,
    workflows: {
      bootstrapConventions: true,
      create: registry.available,
      review: registry.available,
      migrate: registry.available,
      upgrade: registry.available,
      runtimeEvidence:
        doctor.repoSignals.storybookDetected ||
        doctor.repoSignals.appRuntimeDetected,
    },
    notes,
  };
}
