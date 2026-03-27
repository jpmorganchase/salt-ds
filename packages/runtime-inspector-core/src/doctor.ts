import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { detectProjectPolicy } from "@salt-ds/semantic-core/policy/detection";
import { deriveComparableSaltVersion } from "@salt-ds/semantic-core/policy/layerDiagnostics";
import { detectLocalRuntimeTargets } from "./runtimeTargets.js";
import {
  collectSaltInstallationDiagnostics as collectSaltInstallationDiagnosticsFromHelper,
  collectSaltPackages as collectSaltPackagesFromHelper,
  detectPackageManagerName as detectPackageManagerNameFromHelper,
  type PackageManagerCommandRunner,
} from "./saltInstallation.js";
import type {
  ArtifactDescriptor,
  DoctorCheck,
  DoctorPolicyLayer,
  DoctorPolicyLayers,
  DoctorResult,
  DoctorRuntimeTarget,
  SaltInstallationDiagnostics,
  SaltPackageDescriptor,
} from "./schemas.js";

export type { PackageManagerCommandRunner } from "./saltInstallation.js";

export interface DoctorOptions {
  rootDir?: string;
  timestamp?: string;
  toolVersion?: string;
  storybookUrl?: string;
  appUrl?: string;
  checkDetectedTargets?: boolean;
  reachabilityTimeoutMs?: number;
  supportBundleDir?: string;
  packageManagerCommandTimeoutMs?: number;
  commandRunner?: PackageManagerCommandRunner;
  includePolicyLayers?: boolean;
}

interface PackageJsonLike {
  name?: string;
  version?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const APP_RUNTIME_CONFIG_FILES = [
  "vite.config.ts",
  "vite.config.js",
  "vite.config.mjs",
  "next.config.ts",
  "next.config.js",
  "next.config.mjs",
  "webpack.config.js",
  "webpack.config.ts",
] as const;
function toPosix(inputPath: string | null): string | null {
  return inputPath ? inputPath.split(path.sep).join("/") : null;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function findNearestPackageJson(
  startDir: string,
): Promise<string | null> {
  let current = path.resolve(startDir);

  while (true) {
    const candidate = path.join(current, "package.json");
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

  return JSON.parse(
    await fs.readFile(packageJsonPath, "utf8"),
  ) as PackageJsonLike;
}

function hasDependency(
  packageJson: PackageJsonLike | null,
  matcher: (name: string) => boolean,
): boolean {
  const packageSections = [
    packageJson?.dependencies,
    packageJson?.devDependencies,
    packageJson?.peerDependencies,
  ];

  return packageSections.some((section) =>
    Object.keys(section ?? {}).some((name) => matcher(name)),
  );
}

async function detectStorybook(
  rootDir: string,
  packageJson: PackageJsonLike | null,
): Promise<boolean> {
  if (await pathExists(path.join(rootDir, ".storybook"))) {
    return true;
  }

  return hasDependency(
    packageJson,
    (name) => name === "storybook" || name.startsWith("@storybook/"),
  );
}

async function detectAppRuntime(
  rootDir: string,
  packageJson: PackageJsonLike | null,
): Promise<boolean> {
  const scripts = packageJson?.scripts ?? {};
  if (typeof scripts.dev === "string" || typeof scripts.start === "string") {
    return true;
  }

  for (const fileName of APP_RUNTIME_CONFIG_FILES) {
    if (await pathExists(path.join(rootDir, fileName))) {
      return true;
    }
  }

  return hasDependency(
    packageJson,
    (name) =>
      name === "react" ||
      name === "next" ||
      name === "vite" ||
      name === "@storybook/react-vite",
  );
}

function createCheck(
  id: string,
  status: DoctorCheck["status"],
  summary: string,
  details?: string,
): DoctorCheck {
  return details ? { id, status, summary, details } : { id, status, summary };
}

function createRuntimeTargets(
  options: DoctorOptions,
  packageJson: PackageJsonLike | null,
  detected: {
    storybookDetected: boolean;
    appRuntimeDetected: boolean;
  },
): Array<Pick<DoctorRuntimeTarget, "label" | "url" | "source">> {
  const targets: Array<Pick<DoctorRuntimeTarget, "label" | "url" | "source">> =
    [];

  if (options.storybookUrl) {
    targets.push({
      label: "storybook",
      url: options.storybookUrl,
      source: "user",
    });
  }

  if (options.appUrl) {
    targets.push({
      label: "app-runtime",
      url: options.appUrl,
      source: "user",
    });
  }

  if (options.checkDetectedTargets) {
    for (const detectedTarget of detectLocalRuntimeTargets({
      packageJson,
      storybookDetected: detected.storybookDetected,
      appRuntimeDetected: detected.appRuntimeDetected,
    })) {
      if (targets.some((target) => target.label === detectedTarget.label)) {
        continue;
      }

      targets.push(detectedTarget);
    }
  }

  return targets;
}

async function checkRuntimeTarget(
  target: Pick<DoctorRuntimeTarget, "label" | "url" | "source">,
  timeoutMs: number,
): Promise<DoctorRuntimeTarget> {
  try {
    const response = await fetchWithTimeout(target.url, timeoutMs);
    return {
      ...target,
      reachable: response.ok,
      statusCode: response.status,
      contentType: response.headers.get("content-type") ?? "",
      error: response.ok
        ? undefined
        : `HTTP ${response.status} returned from ${response.url}`,
    };
  } catch (error) {
    return {
      ...target,
      reachable: false,
      error:
        error instanceof Error ? error.message : "Unknown reachability error",
    };
  }
}

function createManifestSummary(
  packageJsonPath: string | null,
  packageJson: PackageJsonLike | null,
  saltPackages: SaltPackageDescriptor[],
  saltInstallation: SaltInstallationDiagnostics,
): Record<string, unknown> {
  return {
    packageJsonPath: packageJsonPath ? toPosix(packageJsonPath) : null,
    packageManager: packageJson?.packageManager ?? null,
    scriptNames: Object.keys(packageJson?.scripts ?? {}).sort(),
    saltPackages,
    saltInstallation,
  };
}

function createSaltConfigSummary(
  resolvedRoot: string,
  policyLayers: DoctorPolicyLayers,
): Record<string, unknown> {
  return {
    rootDir: toPosix(resolvedRoot),
    saltTeamConfigPath: policyLayers.teamConfigPath,
    saltStackConfigPath: policyLayers.stackConfigPath,
    policyLayers: policyLayers.layers,
  };
}

async function resolvePolicyLayers(
  resolvedRoot: string,
  currentSaltVersion: string | null,
  includeLayers: boolean,
): Promise<{
  policyLayers: DoctorPolicyLayers;
  checks: DoctorCheck[];
}> {
  const detailLevel = includeLayers ? "resolved" : "summary";
  const policy = await detectProjectPolicy(resolvedRoot, currentSaltVersion, {
    detailLevel,
  });
  const policyLayers: DoctorPolicyLayers = {
    teamConfigPath: toPosix(policy.teamConfigPath),
    stackConfigPath: toPosix(policy.stackConfigPath),
    layers: policy.stackLayers.map(
      (layer): DoctorPolicyLayer => ({
        id: layer.id,
        scope: layer.scope,
        sourceType: layer.sourceType,
        source: layer.source,
        optional: layer.optional,
        status: layer.resolution.status,
        resolvedPath: toPosix(layer.resolution.resolvedPath),
        packageName: layer.resolution.packageName,
        exportName: layer.resolution.exportName,
        version: layer.resolution.version,
        packageVersion: layer.resolution.packageVersion,
        conventionsVersion: layer.resolution.conventionsVersion,
        contract: layer.resolution.contract,
        project: layer.resolution.project,
        packId: layer.resolution.packId,
        supportedSaltRange: layer.resolution.supportedSaltRange,
        compatibility: layer.resolution.compatibility,
        reason: layer.resolution.reason,
      }),
    ),
  };
  const checks: DoctorCheck[] = [];

  if (!includeLayers || !policy.stackConfigPath) {
    return { policyLayers, checks };
  }

  if (
    policy.notes.includes(
      "Detected .salt/stack.json but could not parse layered project conventions.",
    )
  ) {
    checks.push(
      createCheck(
        "salt-stack-config-readable",
        "fail",
        ".salt/stack.json could not be parsed",
      ),
    );
    return { policyLayers, checks };
  }

  checks.push(
    createCheck(
      "salt-stack-config-readable",
      "pass",
      ".salt/stack.json is readable",
    ),
  );

  for (const layer of policyLayers.layers) {
    const label =
      layer.sourceType === "package"
        ? (layer.packageName ?? layer.source)
        : layer.source;
    const status =
      layer.status === "resolved"
        ? layer.compatibility?.status === "unsupported" ||
          layer.compatibility?.status === "unknown-current-version"
          ? "warn"
          : "pass"
        : layer.optional
          ? layer.status === "missing"
            ? "info"
            : "warn"
          : "fail";

    checks.push(
      createCheck(
        `policy-layer-${layer.id}`,
        status,
        layer.status === "resolved"
          ? layer.compatibility?.status === "unsupported"
            ? `Resolved policy layer ${layer.id} but the shared pack is not compatible with this Salt version`
            : layer.compatibility?.status === "unknown-current-version"
              ? `Resolved policy layer ${layer.id} but Salt version compatibility could not be verified`
              : `Resolved policy layer ${layer.id}`
          : layer.status === "missing"
            ? layer.optional
              ? `Optional policy layer ${layer.id} is not available`
              : `Required policy layer ${layer.id} is missing`
            : layer.status === "invalid"
              ? layer.optional
                ? `Optional policy layer ${layer.id} is invalid`
                : `Required policy layer ${layer.id} is invalid`
              : layer.optional
                ? `Optional policy layer ${layer.id} could not be read`
                : `Required policy layer ${layer.id} could not be read`,
        [
          `${layer.sourceType}:${label}${layer.resolvedPath ? ` -> ${layer.resolvedPath}` : ""}`,
          layer.packId ? `pack id ${layer.packId}` : null,
          layer.conventionsVersion
            ? `conventions ${layer.conventionsVersion}`
            : null,
          layer.compatibility?.reason ?? layer.reason,
        ]
          .filter(Boolean)
          .join(" | "),
      ),
    );
  }

  return { policyLayers, checks };
}

async function writeSupportBundle(
  targetDir: string,
  report: DoctorResult,
  manifestSummary: Record<string, unknown>,
  saltConfigSummary: Record<string, unknown>,
  policyLayerSummary: Record<string, unknown>,
): Promise<ArtifactDescriptor[]> {
  await fs.mkdir(targetDir, { recursive: true });

  const reportPath = path.join(targetDir, "doctor-report.json");
  const manifestPath = path.join(targetDir, "manifest-summary.json");
  const saltConfigPath = path.join(targetDir, "salt-config-summary.json");
  const policyLayerPath = path.join(targetDir, "policy-layer-summary.json");

  await fs.writeFile(
    reportPath,
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    manifestPath,
    `${JSON.stringify(manifestSummary, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    saltConfigPath,
    `${JSON.stringify(saltConfigSummary, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    policyLayerPath,
    `${JSON.stringify(policyLayerSummary, null, 2)}\n`,
    "utf8",
  );

  return [
    {
      kind: "support-bundle",
      path: targetDir,
      label: "doctor-bundle",
    },
    {
      kind: "json",
      path: reportPath,
      label: "doctor-report",
    },
    {
      kind: "json",
      path: manifestPath,
      label: "manifest-summary",
    },
    {
      kind: "json",
      path: saltConfigPath,
      label: "salt-config-summary",
    },
    {
      kind: "json",
      path: policyLayerPath,
      label: "policy-layer-summary",
    },
  ];
}

export async function runDoctor(
  options: DoctorOptions = {},
): Promise<DoctorResult> {
  const requestedRoot = path.resolve(options.rootDir ?? process.cwd());
  const packageJsonPath = await findNearestPackageJson(requestedRoot);
  const resolvedRoot = packageJsonPath
    ? path.dirname(packageJsonPath)
    : requestedRoot;
  const packageJson = await readPackageJson(packageJsonPath);
  const packageManager = await detectPackageManagerNameFromHelper(
    resolvedRoot,
    packageJson,
  );
  const saltPackages = collectSaltPackagesFromHelper(packageJson);
  const saltInstallation = await collectSaltInstallationDiagnosticsFromHelper(
    resolvedRoot,
    saltPackages,
    {
      packageManager,
      commandRunner: options.commandRunner,
      packageManagerCommandTimeoutMs: options.packageManagerCommandTimeoutMs,
    },
  );
  const declaredSaltVersion =
    saltPackages.find((saltPackage) => saltPackage.name === "@salt-ds/core")
      ?.version ??
    saltPackages[0]?.version ??
    null;
  const currentSaltVersion = deriveComparableSaltVersion({
    declaredVersion: declaredSaltVersion,
    resolvedVersions: saltInstallation.versionHealth.resolvedVersions,
    installedVersions: saltInstallation.versionHealth.installedVersions,
  });
  const storybookDetected = await detectStorybook(resolvedRoot, packageJson);
  const appRuntimeDetected = await detectAppRuntime(resolvedRoot, packageJson);
  const saltTeamConfigFound = await pathExists(
    path.join(resolvedRoot, ".salt", "team.json"),
  );
  const saltStackConfigFound = await pathExists(
    path.join(resolvedRoot, ".salt", "stack.json"),
  );
  const { policyLayers, checks: policyChecks } = await resolvePolicyLayers(
    resolvedRoot,
    currentSaltVersion,
    options.includePolicyLayers !== false,
  );
  const runtimeTargets = await Promise.all(
    createRuntimeTargets(options, packageJson, {
      storybookDetected,
      appRuntimeDetected,
    }).map((target) =>
      checkRuntimeTarget(target, options.reachabilityTimeoutMs ?? 4_000),
    ),
  );

  const checks: DoctorCheck[] = [];

  checks.push(
    packageJsonPath
      ? createCheck(
          "package-json-found",
          "pass",
          "package.json detected",
          toPosix(
            path.relative(resolvedRoot, packageJsonPath) || "package.json",
          ) ?? undefined,
        )
      : createCheck(
          "package-json-found",
          "fail",
          "No package.json found from the requested root upward",
        ),
  );

  checks.push(
    saltPackages.length > 0
      ? createCheck(
          "salt-packages-present",
          "pass",
          `Detected ${saltPackages.length} Salt package${saltPackages.length === 1 ? "" : "s"}`,
        )
      : createCheck(
          "salt-packages-present",
          "warn",
          "No @salt-ds/* packages detected in the nearest package.json",
        ),
  );

  if (saltPackages.length > 0) {
    const hasUnresolvedResolvedPackages =
      saltInstallation.resolvedPackages.some(
        (saltPackage) =>
          !saltPackage.resolvedVersion || !saltPackage.resolvedPath,
      );
    const resolutionIsLimitedByPnpOnly =
      hasUnresolvedResolvedPackages &&
      saltInstallation.inspection.packageLayout === "pnp" &&
      saltInstallation.versionHealth.mismatchedPackages.length === 0;

    checks.push(
      createCheck(
        "salt-package-declared-version-consistency",
        saltInstallation.versionHealth.multipleDeclaredVersions
          ? "warn"
          : "pass",
        saltInstallation.versionHealth.multipleDeclaredVersions
          ? "A Salt package is declared with conflicting version ranges"
          : "Declared Salt package versions are consistent",
        saltInstallation.versionHealth.declaredVersions.length > 0
          ? saltInstallation.versionHealth.declaredVersions.join(", ")
          : undefined,
      ),
    );

    checks.push(
      createCheck(
        "salt-package-resolved-version-consistency",
        saltInstallation.versionHealth.multipleResolvedVersions
          ? "warn"
          : "pass",
        saltInstallation.versionHealth.multipleResolvedVersions
          ? "A declared Salt package resolves through multiple versions"
          : "Resolved Salt package versions are consistent",
        saltInstallation.versionHealth.resolvedVersions.length > 0
          ? saltInstallation.versionHealth.resolvedVersions.join(", ")
          : undefined,
      ),
    );

    checks.push(
      createCheck(
        "salt-package-installed-version-consistency",
        saltInstallation.versionHealth.multipleInstalledVersions
          ? "warn"
          : "pass",
        saltInstallation.versionHealth.multipleInstalledVersions
          ? "A Salt package is installed across multiple versions"
          : saltInstallation.installedPackages.length > 0
            ? "Installed Salt package versions are consistent"
            : saltInstallation.inspection.packageLayout === "pnp" &&
                saltInstallation.inspection.discoveredVersions.length > 0
              ? "Installed Salt package copies are not enumerated under Yarn PnP; using package-manager inspection instead"
              : "No installed Salt packages found in node_modules on the resolution path",
        saltInstallation.versionHealth.installedVersions.length > 0
          ? saltInstallation.versionHealth.installedVersions.join(", ")
          : undefined,
      ),
    );

    checks.push(
      createCheck(
        "salt-package-resolution-match",
        saltInstallation.versionHealth.mismatchedPackages.length > 0
          ? "warn"
          : resolutionIsLimitedByPnpOnly
            ? "info"
            : hasUnresolvedResolvedPackages
              ? "warn"
              : "pass",
        saltInstallation.versionHealth.mismatchedPackages.length > 0
          ? "Some declared Salt packages resolve to incompatible installed versions"
          : resolutionIsLimitedByPnpOnly
            ? "Resolved Salt package paths are limited by Yarn PnP outside a PnP runtime hook"
            : hasUnresolvedResolvedPackages
              ? "Some declared Salt packages could not be resolved from the current install"
              : "Declared Salt packages resolve cleanly from the current install",
        saltInstallation.versionHealth.issues.length > 0
          ? saltInstallation.versionHealth.issues.join(" | ")
          : undefined,
      ),
    );

    checks.push(
      createCheck(
        "salt-package-manager-inspection",
        saltInstallation.inspection.status === "failed"
          ? "warn"
          : saltInstallation.inspection.limitations.length > 0
            ? "info"
            : saltInstallation.inspection.strategy === "package-manager-command"
              ? "pass"
              : "info",
        saltInstallation.inspection.status === "failed"
          ? `Failed to inspect Salt packages with ${saltInstallation.inspection.packageManager}; using node_modules scan fallback`
          : saltInstallation.inspection.limitations.length > 0
            ? `Salt package inspection for ${saltInstallation.inspection.packageManager} has known limitations`
            : saltInstallation.inspection.strategy === "package-manager-command"
              ? `Used ${saltInstallation.inspection.packageManager} to inspect installed Salt packages`
              : "No package-manager-specific Salt inspection was available; used node_modules scan",
        saltInstallation.inspection.limitations.length > 0
          ? saltInstallation.inspection.limitations.join(" | ")
          : (saltInstallation.inspection.listCommand ?? undefined),
      ),
    );
  }

  checks.push(
    storybookDetected || appRuntimeDetected
      ? createCheck(
          "runtime-target-detected",
          "pass",
          storybookDetected && appRuntimeDetected
            ? "Storybook and app runtime targets look available"
            : storybookDetected
              ? "Storybook target looks available"
              : "App runtime target looks available",
        )
      : createCheck(
          "runtime-target-detected",
          "warn",
          "No obvious Storybook or app runtime target detected",
        ),
  );

  checks.push(
    saltTeamConfigFound || saltStackConfigFound
      ? createCheck(
          "salt-config-detected",
          "pass",
          "Salt project configuration detected",
        )
      : createCheck(
          "salt-config-detected",
          "info",
          "No .salt/team.json or .salt/stack.json detected",
        ),
  );

  if (runtimeTargets.length === 0) {
    checks.push(
      createCheck(
        "runtime-targets-checked",
        "info",
        "No runtime target reachability checks were requested",
      ),
    );
  } else {
    for (const target of runtimeTargets) {
      checks.push(
        target.reachable
          ? createCheck(
              `runtime-target-${target.label}`,
              "pass",
              `${target.label} is reachable`,
              `${target.url}${typeof target.statusCode === "number" ? ` (${target.statusCode})` : ""}`,
            )
          : createCheck(
              `runtime-target-${target.label}`,
              "warn",
              `${target.label} is not reachable`,
              target.error ?? target.url,
            ),
      );
    }
  }

  checks.push(...policyChecks);

  const baseResult: DoctorResult = {
    toolVersion: options.toolVersion ?? "0.0.0",
    timestamp: options.timestamp ?? new Date().toISOString(),
    rootDir: resolvedRoot,
    environment: {
      os: `${os.platform()} ${os.release()}`,
      nodeVersion: process.version,
      packageManager,
    },
    saltPackages,
    saltInstallation,
    repoSignals: {
      storybookDetected,
      appRuntimeDetected,
      saltTeamConfigFound,
      saltStackConfigFound,
    },
    runtimeTargets,
    policyLayers,
    checks,
    artifacts: [],
    redactionsApplied: true,
  };

  if (!options.supportBundleDir) {
    return baseResult;
  }

  const bundleArtifacts: ArtifactDescriptor[] = [
    {
      kind: "support-bundle",
      path: options.supportBundleDir,
      label: "doctor-bundle",
    },
    {
      kind: "json",
      path: path.join(options.supportBundleDir, "doctor-report.json"),
      label: "doctor-report",
    },
    {
      kind: "json",
      path: path.join(options.supportBundleDir, "manifest-summary.json"),
      label: "manifest-summary",
    },
    {
      kind: "json",
      path: path.join(options.supportBundleDir, "salt-config-summary.json"),
      label: "salt-config-summary",
    },
    {
      kind: "json",
      path: path.join(options.supportBundleDir, "policy-layer-summary.json"),
      label: "policy-layer-summary",
    },
  ];

  const resultWithArtifacts: DoctorResult = {
    ...baseResult,
    artifacts: bundleArtifacts,
  };

  await writeSupportBundle(
    options.supportBundleDir,
    resultWithArtifacts,
    createManifestSummary(
      packageJsonPath,
      packageJson,
      saltPackages,
      saltInstallation,
    ),
    createSaltConfigSummary(resolvedRoot, policyLayers),
    {
      rootDir: toPosix(resolvedRoot),
      teamConfigPath: policyLayers.teamConfigPath,
      stackConfigPath: policyLayers.stackConfigPath,
      layers: policyLayers.layers,
    },
  );

  return resultWithArtifacts;
}
