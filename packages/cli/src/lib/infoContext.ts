import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  buildRepoAwareSaltWorkflowAvailability,
  detectLocalRuntimeTargets,
  runDoctor,
} from "@salt-ds/runtime-inspector-core";
import {
  detectProjectPolicy,
  type ProjectPolicyDetailLevel,
} from "@salt-ds/semantic-core/policy/detection";
import { deriveComparableSaltVersion } from "@salt-ds/semantic-core/policy/layerDiagnostics";
import { getTsconfig } from "get-tsconfig";
import type { SaltInfoResult } from "../types.js";
import { pathExists } from "./common.js";
import {
  detectSaltPackageVersion,
  findAncestorWithChild,
  resolveSemanticRegistry,
} from "./registry.js";

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

async function detectProjectConventions(
  rootDir: string,
  currentSaltVersion: string | null,
  detailLevel: ProjectPolicyDetailLevel,
): Promise<{
  teamConfigPath: string | null;
  stackConfigPath: string | null;
  mode: SaltInfoResult["policy"]["mode"];
  approvedWrappers: string[];
  stackLayers: SaltInfoResult["policy"]["stackLayers"];
  sharedConventions: SaltInfoResult["policy"]["sharedConventions"];
  notes: string[];
}> {
  const policy = await detectProjectPolicy(rootDir, currentSaltVersion, {
    detailLevel,
  });

  return {
    teamConfigPath: toPosix(policy.teamConfigPath),
    stackConfigPath: toPosix(policy.stackConfigPath),
    mode: policy.mode,
    approvedWrappers: policy.approvedWrappers,
    stackLayers: policy.stackLayers.map((layer) => ({
      ...layer,
      resolution: {
        ...layer.resolution,
        resolvedPath: toPosix(layer.resolution.resolvedPath),
      },
    })),
    sharedConventions: {
      enabled: policy.sharedConventions.enabled,
      packCount: policy.sharedConventions.packCount,
      packs: policy.sharedConventions.packs,
      packDetails: policy.sharedConventions.packDetails.map((detail) => ({
        ...detail,
        resolvedPath: toPosix(detail.resolvedPath),
      })),
    },
    notes: policy.notes,
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
  packageJson: PackageJsonLike | null,
  signals: SaltInfoResult["repoSignals"],
): SaltInfoResult["runtime"]["detectedTargets"] {
  return detectLocalRuntimeTargets({
    packageJson,
    storybookDetected: signals.storybookDetected,
    appRuntimeDetected: signals.appRuntimeDetected,
  });
}

export interface CollectSaltInfoOptions {
  policyDetail?: ProjectPolicyDetailLevel;
}

export async function collectSaltInfo(
  cwd: string,
  explicitRegistryDir?: string,
  options: CollectSaltInfoOptions = {},
): Promise<SaltInfoResult> {
  const policyDetail = options.policyDetail ?? "summary";
  const doctor = await runDoctor({
    rootDir: cwd,
    includePolicyLayers: policyDetail === "resolved",
  });
  const packageJsonPath = await findAncestorWithChild(doctor.rootDir, [
    "package.json",
  ]);
  const packageJson = await readPackageJson(packageJsonPath);
  const workspace = await detectWorkspaceContext(doctor.rootDir);
  const framework = await detectFramework(doctor.rootDir, packageJson);
  const imports = detectImportConventions(doctor.rootDir);
  const repoInstructions = await detectRepoInstructions(doctor.rootDir);
  const packageVersion = await detectSaltPackageVersion(doctor.rootDir);
  const currentSaltVersion = deriveComparableSaltVersion({
    declaredVersion: packageVersion,
    resolvedVersions: doctor.saltInstallation.versionHealth.resolvedVersions,
    installedVersions: doctor.saltInstallation.versionHealth.installedVersions,
  });
  const policy = await detectProjectConventions(
    doctor.rootDir,
    currentSaltVersion,
    policyDetail,
  );
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
      mcpPackageInstalled: false,
      canonicalTransport: "cli",
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

  notes.push(...doctor.saltInstallation.versionHealth.issues);
  if (doctor.saltInstallation.inspection.manifestOverrideFields.length > 0) {
    notes.push(
      `Salt dependency override fields detected: ${doctor.saltInstallation.inspection.manifestOverrideFields.join(", ")}.`,
    );
  }
  if (doctor.saltInstallation.inspection.limitations.length > 0) {
    notes.push(...doctor.saltInstallation.inspection.limitations);
  }
  if (
    doctor.saltInstallation.workspace.issueSourceHint !== "none" &&
    doctor.saltInstallation.workspace.workspaceRoot
  ) {
    notes.push(
      `Salt install issue scope: ${doctor.saltInstallation.workspace.issueSourceHint} (workspace root ${doctor.saltInstallation.workspace.workspaceRoot}).`,
    );
  }
  if (doctor.saltInstallation.healthSummary.blockingWorkflows.length > 0) {
    notes.push(
      `Salt install health blocks workflows: ${doctor.saltInstallation.healthSummary.blockingWorkflows.join(", ")}.`,
    );
  }
  const repoAwareWorkflowAvailability = buildRepoAwareSaltWorkflowAvailability(
    doctor.saltInstallation.healthSummary.blockingWorkflows,
  );

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
      installation: doctor.saltInstallation,
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
      detectedTargets: createDetectedTargets(packageJson, doctor.repoSignals),
    },
    registry,
    workflows: {
      bootstrapConventions: true,
      create: registry.available && repoAwareWorkflowAvailability.create,
      review: registry.available && repoAwareWorkflowAvailability.review,
      migrate: registry.available && repoAwareWorkflowAvailability.migrate,
      upgrade: registry.available && repoAwareWorkflowAvailability.upgrade,
      runtimeEvidence:
        doctor.repoSignals.storybookDetected ||
        doctor.repoSignals.appRuntimeDetected,
    },
    notes,
  };
}
