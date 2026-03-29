import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import type {
  ArtifactDescriptor,
  DoctorCheck,
  DoctorPolicyLayer,
  DoctorPolicyLayers,
  DoctorResult,
  DoctorRuntimeTarget,
  SaltPackageDescriptor,
} from "./schemas.js";

export interface DoctorOptions {
  rootDir?: string;
  timestamp?: string;
  toolVersion?: string;
  storybookUrl?: string;
  appUrl?: string;
  checkDetectedTargets?: boolean;
  reachabilityTimeoutMs?: number;
  supportBundleDir?: string;
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

const require = createRequire(import.meta.url);

function toPosix(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
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

function getPackageManagerName(packageJson: PackageJsonLike | null): string {
  const packageManager = packageJson?.packageManager?.trim();
  if (!packageManager) {
    return "unknown";
  }

  const separatorIndex = packageManager.indexOf("@");
  return separatorIndex === -1
    ? packageManager
    : packageManager.slice(0, separatorIndex);
}

function collectSaltPackages(
  packageJson: PackageJsonLike | null,
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

      collected.set(name, version);
    }
  }

  return [...collected.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, version]) => ({ name, version }));
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
    if (
      detected.storybookDetected &&
      !targets.some((target) => target.label === "storybook")
    ) {
      targets.push({
        label: "storybook",
        url: "http://127.0.0.1:6006/",
        source: "detected-default",
      });
    }

    if (
      detected.appRuntimeDetected &&
      !targets.some((target) => target.label === "app-runtime")
    ) {
      targets.push({
        label: "app-runtime",
        url: "http://127.0.0.1:3000/",
        source: "detected-default",
      });
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
): Record<string, unknown> {
  return {
    packageJsonPath: packageJsonPath ? toPosix(packageJsonPath) : null,
    packageManager: packageJson?.packageManager ?? null,
    scriptNames: Object.keys(packageJson?.scripts ?? {}).sort(),
    saltPackages,
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

function isStackLayerScope(value: unknown): value is StackLayerScope {
  return (
    value === "line_of_business" ||
    value === "team" ||
    value === "repo" ||
    value === "other"
  );
}

async function readJsonFile(targetPath: string): Promise<unknown> {
  return JSON.parse(await fs.readFile(targetPath, "utf8")) as unknown;
}

async function resolvePolicyLayers(resolvedRoot: string): Promise<{
  policyLayers: DoctorPolicyLayers;
  checks: DoctorCheck[];
}> {
  const teamConfigPath = path.join(resolvedRoot, ".salt", "team.json");
  const stackConfigPath = path.join(resolvedRoot, ".salt", "stack.json");
  const stackConfigFound = await pathExists(stackConfigPath);
  const policyLayers: DoctorPolicyLayers = {
    teamConfigPath: (await pathExists(teamConfigPath))
      ? toPosix(teamConfigPath)
      : null,
    stackConfigPath: stackConfigFound ? toPosix(stackConfigPath) : null,
    layers: [],
  };
  const checks: DoctorCheck[] = [];

  if (!stackConfigFound) {
    return { policyLayers, checks };
  }

  let normalizedLayers: NormalizedStackLayer[] = [];
  try {
    const stackConfig = (await readJsonFile(stackConfigPath)) as StackLike;
    const stackDir = path.dirname(stackConfigPath);
    normalizedLayers = Array.isArray(stackConfig.layers)
      ? stackConfig.layers.flatMap<NormalizedStackLayer>((layer) => {
          if (!layer || typeof layer !== "object") {
            return [];
          }

          const candidate = layer as StackLayerLike;
          if (
            typeof candidate.id !== "string" ||
            !isStackLayerScope(candidate.scope)
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
                scope: candidate.scope,
                sourceType: "file",
                source: typedSource.path,
                optional: candidate.optional === true,
                filePath: path.resolve(stackDir, typedSource.path),
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
                scope: candidate.scope,
                sourceType: "package",
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

    checks.push(
      createCheck(
        "salt-stack-config-readable",
        "pass",
        ".salt/stack.json is readable",
      ),
    );
  } catch {
    checks.push(
      createCheck(
        "salt-stack-config-readable",
        "fail",
        ".salt/stack.json could not be parsed",
      ),
    );
    return { policyLayers, checks };
  }

  const resolvedLayers = await Promise.all(
    normalizedLayers.map(async (layer): Promise<DoctorPolicyLayer> => {
      if (layer.sourceType === "file") {
        const resolvedPath =
          layer.filePath ?? path.resolve(resolvedRoot, layer.source);
        if (!(await pathExists(resolvedPath))) {
          return {
            id: layer.id,
            scope: layer.scope,
            sourceType: layer.sourceType,
            source: layer.source,
            optional: layer.optional,
            status: "missing",
            resolvedPath: toPosix(resolvedPath),
            packageName: null,
            exportName: null,
            version: null,
          };
        }

        try {
          const parsed = (await readJsonFile(resolvedPath)) as {
            version?: unknown;
          };
          return {
            id: layer.id,
            scope: layer.scope,
            sourceType: layer.sourceType,
            source: layer.source,
            optional: layer.optional,
            status: "resolved",
            resolvedPath: toPosix(resolvedPath),
            packageName: null,
            exportName: null,
            version: typeof parsed.version === "string" ? parsed.version : null,
          };
        } catch {
          return {
            id: layer.id,
            scope: layer.scope,
            sourceType: layer.sourceType,
            source: layer.source,
            optional: layer.optional,
            status: "unreadable",
            resolvedPath: toPosix(resolvedPath),
            packageName: null,
            exportName: null,
            version: null,
          };
        }
      }

      const packageSpecifier = layer.packageSpecifier ?? layer.source;
      let packageJsonPath: string;
      try {
        packageJsonPath = require.resolve(`${packageSpecifier}/package.json`, {
          paths: [resolvedRoot],
        });
      } catch {
        return {
          id: layer.id,
          scope: layer.scope,
          sourceType: layer.sourceType,
          source: layer.source,
          optional: layer.optional,
          status: "missing",
          resolvedPath: null,
          packageName: packageSpecifier,
          exportName: layer.exportName ?? null,
          version: null,
        };
      }

      try {
        const packageJson = (await readJsonFile(
          packageJsonPath,
        )) as PackageJsonLike;
        return {
          id: layer.id,
          scope: layer.scope,
          sourceType: layer.sourceType,
          source: layer.source,
          optional: layer.optional,
          status: "resolved",
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
        };
      } catch {
        return {
          id: layer.id,
          scope: layer.scope,
          sourceType: layer.sourceType,
          source: layer.source,
          optional: layer.optional,
          status: "unreadable",
          resolvedPath: toPosix(packageJsonPath),
          packageName: packageSpecifier,
          exportName: layer.exportName ?? null,
          version: null,
        };
      }
    }),
  );

  policyLayers.layers = resolvedLayers;

  for (const layer of resolvedLayers) {
    const label =
      layer.sourceType === "package"
        ? (layer.packageName ?? layer.source)
        : layer.source;
    const status =
      layer.status === "resolved"
        ? "pass"
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
          ? `Resolved policy layer ${layer.id}`
          : layer.status === "missing"
            ? layer.optional
              ? `Optional policy layer ${layer.id} is not available`
              : `Required policy layer ${layer.id} is missing`
            : layer.optional
              ? `Optional policy layer ${layer.id} could not be read`
              : `Required policy layer ${layer.id} could not be read`,
        `${layer.sourceType}:${label}${layer.resolvedPath ? ` -> ${layer.resolvedPath}` : ""}`,
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
  const saltPackages = collectSaltPackages(packageJson);
  const storybookDetected = await detectStorybook(resolvedRoot, packageJson);
  const appRuntimeDetected = await detectAppRuntime(resolvedRoot, packageJson);
  const saltTeamConfigFound = await pathExists(
    path.join(resolvedRoot, ".salt", "team.json"),
  );
  const saltStackConfigFound = await pathExists(
    path.join(resolvedRoot, ".salt", "stack.json"),
  );
  const { policyLayers, checks: policyChecks } =
    await resolvePolicyLayers(resolvedRoot);
  const runtimeTargets = await Promise.all(
    createRuntimeTargets(options, {
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
          ),
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
      packageManager: getPackageManagerName(packageJson),
    },
    saltPackages,
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
    createManifestSummary(packageJsonPath, packageJson, saltPackages),
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
