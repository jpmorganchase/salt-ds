import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import {
  type ArtifactDescriptor,
  type DoctorCheck,
  runDoctor,
} from "@salt-ds/runtime-inspector-core";
import {
  buildDefaultPromptHostInstructionSurfaces,
  buildSaltAiEvidenceClosureReport,
  buildSaltAiSetupSummary,
  type SaltAiEvidenceClosureReport,
  type SaltAiSetupSummary,
  type SaltGeneratedContextHealth,
  type SaltRegistry,
} from "@salt-ds/semantic-core";
import {
  createDefaultBundleDir,
  formatStatus,
  writeJsonFile,
} from "../lib/common.js";
import { inspectGeneratedContext } from "../lib/generatedContext.js";
import {
  readRegistryLoadOptionsFromFlags,
  resolveSemanticRegistry,
} from "../lib/registry.js";
import type { RequiredCliIo } from "../types.js";

// --- check-install helpers ---

const PLAYWRIGHT_PACKAGE_NAMES = new Set([
  "playwright",
  "playwright-core",
  "@playwright/test",
]);

const BROWSER_MODE_PATTERNS = ["--mode browser", "--mode auto"];

interface PackageJsonDeps {
  dependencies?: Record<string, string>;
}

async function tryReadPackageJsonDeps(
  pkgPath: string,
): Promise<PackageJsonDeps | null> {
  try {
    const content = await fs.readFile(pkgPath, "utf8");
    return JSON.parse(content) as PackageJsonDeps;
  } catch {
    return null;
  }
}

function resolveNodeModulesPath(
  nodeModulesDir: string,
  pkgName: string,
): string {
  // Handles both scoped (@scope/name) and unscoped (name) packages.
  const parts = pkgName.startsWith("@")
    ? pkgName.split("/").slice(0, 2)
    : [pkgName];
  return path.join(nodeModulesDir, ...parts, "package.json");
}

interface PlaywrightSearchResult {
  found: boolean;
  foundInPackage: string | null;
  viaPackage: string | null;
}

/**
 * BFS-walk the transitive dependency tree of `startPackage` in `rootDir/node_modules`
 * to detect whether any playwright package is reachable.
 */
async function findPlaywrightInTransitiveDeps(
  rootDir: string,
  startPackage: string,
  maxDepth = 6,
): Promise<PlaywrightSearchResult> {
  const nodeModulesDir = path.join(rootDir, "node_modules");
  const visited = new Set<string>();
  const queue: Array<{ name: string; depth: number }> = [
    { name: startPackage, depth: 0 },
  ];

  while (queue.length > 0) {
    const item = queue.shift()!;
    if (visited.has(item.name) || item.depth > maxDepth) continue;
    visited.add(item.name);

    const pkgJsonPath = resolveNodeModulesPath(nodeModulesDir, item.name);
    const pkg = await tryReadPackageJsonDeps(pkgJsonPath);
    if (!pkg) continue;

    const deps = Object.keys(pkg.dependencies ?? {});
    for (const depName of deps) {
      if (PLAYWRIGHT_PACKAGE_NAMES.has(depName)) {
        return {
          found: true,
          foundInPackage: item.name,
          viaPackage: depName,
        };
      }
      if (!visited.has(depName)) {
        queue.push({ name: depName, depth: item.depth + 1 });
      }
    }
  }

  return { found: false, foundInPackage: null, viaPackage: null };
}

async function scanFileContentForBrowserMode(
  filePath: string,
): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return BROWSER_MODE_PATTERNS.some((p) => content.includes(p));
  } catch {
    return false;
  }
}

async function walkDirForFiles(
  dir: string,
  predicate: (name: string) => boolean,
  skipDir: (name: string) => boolean,
  maxDepth: number,
): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    let entries: Dirent<string>[];
    try {
      entries = await fs.readdir(currentDir, {
        withFileTypes: true,
        encoding: "utf8",
      });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!skipDir(entry.name)) {
          await walk(fullPath, depth + 1);
        }
      } else if (predicate(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  await walk(dir, 0);
  return results;
}

/**
 * Scan the repo for `--mode browser` or `--mode auto` usage in:
 * - package.json scripts (recursive, excluding node_modules)
 * - .github/**\/*.yml and *.yaml (CI files)
 * - AGENTS.md files (root and .github/)
 */
async function scanForBrowserModeUsage(rootDir: string): Promise<string[]> {
  const found: string[] = [];

  // 1. package.json scripts (recursive, skip node_modules and hidden dirs)
  const pkgJsonFiles = await walkDirForFiles(
    rootDir,
    (name) => name === "package.json",
    (name) => name === "node_modules" || name.startsWith("."),
    5,
  );
  for (const pkgFile of pkgJsonFiles) {
    try {
      const content = await fs.readFile(pkgFile, "utf8");
      const pkg = JSON.parse(content) as {
        scripts?: Record<string, string>;
      };
      if (pkg.scripts) {
        const hasMatch = Object.values(pkg.scripts).some((script) =>
          BROWSER_MODE_PATTERNS.some((p) => script.includes(p)),
        );
        if (hasMatch) found.push(pkgFile);
      }
    } catch {
      // skip unreadable files
    }
  }

  // 2. CI files under .github/
  const githubDir = path.join(rootDir, ".github");
  const ciFiles = await walkDirForFiles(
    githubDir,
    (name) => name.endsWith(".yml") || name.endsWith(".yaml"),
    () => false,
    4,
  );
  for (const ciFile of ciFiles) {
    if (await scanFileContentForBrowserMode(ciFile)) {
      found.push(ciFile);
    }
  }

  // 3. AGENTS.md files (root and .github/)
  const agentFiles = [
    path.join(rootDir, "AGENTS.md"),
    path.join(rootDir, ".github", "AGENTS.md"),
    path.join(rootDir, ".github", "copilot-instructions.md"),
  ];
  for (const agentFile of agentFiles) {
    if (await scanFileContentForBrowserMode(agentFile)) {
      found.push(agentFile);
    }
  }

  return found;
}

/**
 * Run the --check-install diagnostic:
 * 1. Walk @salt-ds/cli and @salt-ds/mcp transitive deps for playwright.
 * 2. If found, scan repo for browser-mode usage.
 * 3. Emit warn if playwright is present but unused in browser mode.
 */
async function runCheckInstallChecks(rootDir: string): Promise<DoctorCheck[]> {
  const [cliResult, mcpResult] = await Promise.all([
    findPlaywrightInTransitiveDeps(rootDir, "@salt-ds/cli"),
    findPlaywrightInTransitiveDeps(rootDir, "@salt-ds/mcp"),
  ]);

  const playwrightFound = cliResult.found || mcpResult.found;

  if (!playwrightFound) {
    return [
      {
        id: "check-install-playwright-absent",
        status: "pass",
        summary:
          "playwright is not a transitive dependency of @salt-ds/cli or @salt-ds/mcp",
      },
    ];
  }

  const origins = [
    cliResult.found
      ? `@salt-ds/cli → ${cliResult.foundInPackage} (${cliResult.viaPackage})`
      : null,
    mcpResult.found
      ? `@salt-ds/mcp → ${mcpResult.foundInPackage} (${mcpResult.viaPackage})`
      : null,
  ]
    .filter(Boolean)
    .join("; ");

  const browserModeFiles = await scanForBrowserModeUsage(rootDir);

  if (browserModeFiles.length === 0) {
    return [
      {
        id: "check-install-playwright-unused",
        status: "warn",
        summary:
          "playwright is a transitive dependency but no --mode browser or --mode auto usage was detected",
        details: [
          `Origin: ${origins}.`,
          "Playwright adds ~250 MB to cold installs.",
          "Switch to --mode fetched-html, or remove runtime-inspector-browser once task 0.1 (Playwright split) lands.",
        ].join(" "),
      },
    ];
  }

  return [
    {
      id: "check-install-playwright-used",
      status: "pass",
      summary:
        "playwright is a transitive dependency and browser-mode usage was detected",
      details: `Origin: ${origins}. Used in: ${browserModeFiles.map((f) => path.relative(rootDir, f)).join(", ")}.`,
    },
  ];
}

type DoctorCommandResult = Awaited<ReturnType<typeof runDoctor>> & {
  generatedContext: SaltGeneratedContextHealth;
  aiSetup?: SaltAiSetupSummary | null;
  aiEvidenceClosure?: SaltAiEvidenceClosureReport | null;
};

const GENERATED_CONTEXT_HEALTH_BUNDLE_FILE = "generated-context-health.json";
const GENERATED_CONTEXT_MANIFEST_BUNDLE_FILE =
  "generated-context-manifest.json";
const GENERATED_CONTEXT_CHECK_SUMMARY_BUNDLE_FILE =
  "generated-context-check-summary.json";
const GENERATED_CONTEXT_PROMPT_INSTRUCTION_SURFACES_BUNDLE_FILE =
  "generated-context-prompt-instruction-surfaces.json";
const AI_EVIDENCE_CLOSURE_BUNDLE_FILE = "ai-evidence-closure-report.json";

function createGeneratedContextCheck(
  health: SaltGeneratedContextHealth,
): DoctorCheck {
  switch (health.status) {
    case "current":
      return {
        id: "generated-context-current",
        status: "pass",
        summary: "Generated context manifest is current",
        details: health.manifestPath,
      };
    case "missing":
      return {
        id: "generated-context-missing",
        status: "info",
        summary: "Generated context manifest is not present",
        details: health.recommendedAction,
      };
    case "stale":
      return {
        id: "generated-context-stale",
        status: "warn",
        summary: "Generated context manifest is stale",
        details: `${health.recommendedAction}: ${health.missingOutputs.join(", ") || health.manifestPath}`,
      };
    case "unsupported":
      return {
        id: "generated-context-unsupported",
        status: "warn",
        summary: "Generated context has unsupported evidence gaps",
        details: [
          ...health.entries.flatMap((entry) => entry.missing),
          ...health.coverageGaps.flatMap((gap) => gap.missing),
        ].join(", "),
      };
    case "invalid":
      return {
        id: "generated-context-invalid",
        status: "warn",
        summary: "Generated context manifest is invalid",
        details: health.recommendedAction,
      };
  }
}

function createGeneratedContextCheckSummary(
  health: SaltGeneratedContextHealth,
  check: DoctorCheck,
) {
  return {
    contract: "salt_generated_context_check_summary_v1",
    status: health.status,
    manifestPath: health.manifestPath,
    entryCount: health.entryCount,
    unsupportedEntries: health.unsupportedEntries,
    unsupportedCoverageGaps: health.unsupportedCoverageGaps,
    staleEntries: health.staleEntries,
    missingOutputs: health.missingOutputs,
    coverageGaps: health.coverageGaps,
    recommendedAction: health.recommendedAction,
    check,
  };
}

function inferPolicyMode(
  policyLayers: Awaited<ReturnType<typeof runDoctor>>["policyLayers"],
): "team" | "stack" | "none" {
  if (policyLayers.stackConfigPath) {
    return "stack";
  }

  if (policyLayers.teamConfigPath) {
    return "team";
  }

  return "none";
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeGeneratedContextBundle(input: {
  supportBundleDir: string;
  rootDir: string;
  generatedContext: SaltGeneratedContextHealth;
  generatedContextCheck: DoctorCheck;
  registry: SaltRegistry | null;
}): Promise<ArtifactDescriptor[]> {
  const healthPath = path.join(
    input.supportBundleDir,
    GENERATED_CONTEXT_HEALTH_BUNDLE_FILE,
  );
  const manifestBundlePath = path.join(
    input.supportBundleDir,
    GENERATED_CONTEXT_MANIFEST_BUNDLE_FILE,
  );
  const checkSummaryPath = path.join(
    input.supportBundleDir,
    GENERATED_CONTEXT_CHECK_SUMMARY_BUNDLE_FILE,
  );
  const promptInstructionSurfacesPath = path.join(
    input.supportBundleDir,
    GENERATED_CONTEXT_PROMPT_INSTRUCTION_SURFACES_BUNDLE_FILE,
  );
  const manifestPath = path.join(
    input.rootDir,
    ".salt",
    "context",
    "manifest.json",
  );
  const artifacts: ArtifactDescriptor[] = [
    {
      kind: "json",
      path: healthPath,
      label: "generated-context-health",
    },
    {
      kind: "json",
      path: checkSummaryPath,
      label: "generated-context-check-summary",
    },
  ];

  await writeJsonFile(healthPath, input.generatedContext);
  await writeJsonFile(
    checkSummaryPath,
    createGeneratedContextCheckSummary(
      input.generatedContext,
      input.generatedContextCheck,
    ),
  );
  if (input.registry) {
    await writeJsonFile(
      promptInstructionSurfacesPath,
      buildDefaultPromptHostInstructionSurfaces({
        registry: input.registry,
        generated_at: input.registry.generated_at,
        generator: {
          name: "salt-ds doctor generated-context bundle",
        },
      }),
    );
    artifacts.push({
      kind: "json",
      path: promptInstructionSurfacesPath,
      label: "generated-context-prompt-instruction-surfaces",
    });
  }

  if (await pathExists(manifestPath)) {
    try {
      await writeJsonFile(
        manifestBundlePath,
        JSON.parse(await fs.readFile(manifestPath, "utf8")) as unknown,
      );
      artifacts.push({
        kind: "json",
        path: manifestBundlePath,
        label: "generated-context-manifest",
      });
    } catch {
      // Invalid manifests are already represented by generatedContext.status.
    }
  }

  return artifacts;
}

function formatDoctorReport(result: DoctorCommandResult): string {
  const lines = [
    "Salt Doctor",
    `Root: ${result.rootDir}`,
    `Environment: ${result.environment.os}, ${result.environment.nodeVersion}, ${result.environment.packageManager}`,
    `Salt packages: ${
      result.saltPackages.length > 0
        ? result.saltPackages
            .map((pkg) => `${pkg.name}@${pkg.version}`)
            .join(", ")
        : "none detected"
    }`,
    `Salt installation: ${
      result.saltInstallation.healthSummary.health !== "pass"
        ? `${result.saltInstallation.healthSummary.health} (${result.saltInstallation.healthSummary.recommendedAction})`
        : result.saltInstallation.installedPackages.length > 0
          ? `consistent (${result.saltInstallation.versionHealth.installedVersions.join(", ")})`
          : "no installed Salt packages found on the resolution path"
    }`,
    `Installation inspection: ${
      result.saltInstallation.inspection.strategy === "package-manager-command"
        ? `${result.saltInstallation.inspection.packageManager} ${result.saltInstallation.inspection.status === "succeeded" ? "command" : "command fallback"}`
        : "node_modules scan"
    }${result.saltInstallation.inspection.limitations.length > 0 ? " (limited)" : ""}`,
    `Install layout: ${result.saltInstallation.inspection.packageLayout}`,
    `Install issue scope: ${
      result.saltInstallation.workspace.issueSourceHint === "none"
        ? "no workspace-specific issue origin"
        : result.saltInstallation.workspace.issueSourceHint
    }`,
    `Repo signals: Storybook=${result.repoSignals.storybookDetected ? "yes" : "no"}, app runtime=${result.repoSignals.appRuntimeDetected ? "yes" : "no"}, team config=${result.repoSignals.saltTeamConfigFound ? "yes" : "no"}, stack config=${result.repoSignals.saltStackConfigFound ? "yes" : "no"}`,
    `Runtime targets: ${result.runtimeTargets.length > 0 ? result.runtimeTargets.length : "none checked"}`,
    `Policy layers: ${result.policyLayers.layers.length > 0 ? result.policyLayers.layers.length : "none detected"}`,
    `Generated context: ${result.generatedContext.status} (${result.generatedContext.entryCount} entr${result.generatedContext.entryCount === 1 ? "y" : "ies"})`,
    ...(result.aiSetup ? [`AI setup: ${result.aiSetup.status}`] : []),
    ...(result.aiEvidenceClosure
      ? [`AI evidence closure: ${result.aiEvidenceClosure.status}`]
      : []),
  ];

  if (result.runtimeTargets.length > 0) {
    lines.push("Reachability:");
    lines.push(
      ...result.runtimeTargets.map(
        (target) =>
          `- ${target.label}: ${target.reachable ? "reachable" : "unreachable"} via ${target.source} (${target.url})${typeof target.statusCode === "number" ? ` [${target.statusCode}]` : ""}${target.error ? ` - ${target.error}` : ""}`,
      ),
    );
  }

  if (result.policyLayers.layers.length > 0) {
    lines.push("Policy layers:");
    lines.push(
      ...result.policyLayers.layers.map(
        (layer) =>
          `- ${layer.id}: ${layer.status} (${layer.sourceType} ${layer.source})${layer.resolvedPath ? ` -> ${layer.resolvedPath}` : ""}${layer.packageName ? ` [${layer.packageName}]` : ""}${layer.packId ? ` {${layer.packId}}` : ""}${layer.compatibility ? ` <${layer.compatibility.status}>` : ""}${layer.reason ? ` - ${layer.reason}` : ""}`,
      ),
    );
  }

  if (result.saltInstallation.versionHealth.issues.length > 0) {
    lines.push("Salt version issues:");
    lines.push(
      ...result.saltInstallation.versionHealth.issues.map(
        (issue) => `- ${issue}`,
      ),
    );
  }

  if (result.saltInstallation.healthSummary.reasons.length > 0) {
    lines.push("Install health summary:");
    lines.push(
      ...result.saltInstallation.healthSummary.reasons.map(
        (reason) => `- ${reason}`,
      ),
    );
  }

  if (result.saltInstallation.healthSummary.blockingWorkflows.length > 0) {
    lines.push(
      `Blocked workflows: ${result.saltInstallation.healthSummary.blockingWorkflows.join(", ")}`,
    );
  }

  if (result.saltInstallation.inspection.listCommand) {
    lines.push(
      `Inspection command: ${result.saltInstallation.inspection.listCommand}`,
    );
  }

  if (result.saltInstallation.inspection.discoveredVersions.length > 0) {
    lines.push(
      `Package manager versions: ${result.saltInstallation.inspection.discoveredVersions.join(", ")}`,
    );
  }

  if (result.saltInstallation.inspection.error) {
    lines.push(
      `Inspection fallback: ${result.saltInstallation.inspection.error}`,
    );
  }

  if (result.saltInstallation.inspection.manifestOverrideFields.length > 0) {
    lines.push(
      `Manifest override fields: ${result.saltInstallation.inspection.manifestOverrideFields.join(", ")}`,
    );
  }

  if (result.saltInstallation.inspection.limitations.length > 0) {
    lines.push("Inspection limitations:");
    lines.push(
      ...result.saltInstallation.inspection.limitations.map(
        (limitation) => `- ${limitation}`,
      ),
    );
  }

  if (result.saltInstallation.workspace.workspaceRoot) {
    lines.push(
      `Workspace root: ${result.saltInstallation.workspace.workspaceRoot}`,
    );
  }

  if (result.saltInstallation.workspace.workspaceIssues.length > 0) {
    lines.push("Workspace issues:");
    lines.push(
      ...result.saltInstallation.workspace.workspaceIssues.map(
        (issue) => `- ${issue}`,
      ),
    );
  }

  if (result.saltInstallation.duplicatePackages.length > 0) {
    lines.push("Duplicate Salt packages:");
    lines.push(
      ...result.saltInstallation.duplicatePackages.flatMap((saltPackage) => [
        `- ${saltPackage.name}: ${saltPackage.packageCount} installs${saltPackage.versionCount > 1 ? ` across ${saltPackage.versions.join(", ")}` : ` (${saltPackage.versions[0]})`}`,
        ...saltPackage.paths.map((packagePath) => `  ${packagePath}`),
      ]),
    );
  }

  const remediationEntries = [
    result.saltInstallation.remediation.explainCommand
      ? `- Explain: ${result.saltInstallation.remediation.explainCommand}`
      : null,
    result.saltInstallation.remediation.dedupeCommand
      ? `- Dedupe: ${result.saltInstallation.remediation.dedupeCommand}`
      : null,
    result.saltInstallation.remediation.reinstallCommand
      ? `- Reinstall: ${result.saltInstallation.remediation.reinstallCommand}`
      : null,
  ].filter(Boolean) as string[];

  if (
    result.saltInstallation.versionHealth.issues.length > 0 &&
    remediationEntries.length > 0
  ) {
    lines.push("Next commands:");
    lines.push(...remediationEntries);
  }

  lines.push(
    "Checks:",
    ...result.checks.map(
      (check) =>
        `- ${formatStatus(check.status)} ${check.id}: ${check.summary}${check.details ? ` (${check.details})` : ""}`,
    ),
  );

  if (result.artifacts.length > 0) {
    lines.push("Artifacts:");
    lines.push(
      ...result.artifacts.map(
        (artifact) =>
          `- ${artifact.kind}: ${artifact.path}${artifact.label ? ` (${artifact.label})` : ""}`,
      ),
    );
  }

  return `${lines.join("\n")}\n`;
}

export async function runDoctorCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const rootDir = path.resolve(io.cwd, positionals[0] ?? ".");
  const timeoutMs = flags.timeout ? Number(flags.timeout) : undefined;
  const supportBundleDir = flags["bundle-dir"]
    ? path.resolve(io.cwd, flags["bundle-dir"])
    : flags.bundle === "true"
      ? createDefaultBundleDir(io.cwd)
      : undefined;
  const result = await runDoctor({
    rootDir,
    storybookUrl: flags["storybook-url"],
    appUrl: flags["app-url"],
    checkDetectedTargets: flags["check-detected-targets"] === "true",
    reachabilityTimeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined,
    supportBundleDir,
  });
  let resolvedRegistry: Awaited<
    ReturnType<typeof resolveSemanticRegistry>
  > | null = null;
  try {
    resolvedRegistry = await resolveSemanticRegistry(
      rootDir,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
    );
  } catch {
    resolvedRegistry = null;
  }
  const generatedContext = await inspectGeneratedContext(
    result.rootDir,
    resolvedRegistry?.registry ?? null,
  );
  const generatedContextCheck = createGeneratedContextCheck(generatedContext);
  const generatedContextBundleArtifacts = supportBundleDir
    ? await writeGeneratedContextBundle({
        supportBundleDir,
        rootDir: result.rootDir,
        generatedContext,
        generatedContextCheck,
        registry: resolvedRegistry?.registry ?? null,
      })
    : [];
  const aiSetup =
    flags.ai === "true"
      ? buildSaltAiSetupSummary({
          root_dir: result.rootDir,
          policy_mode: inferPolicyMode(result.policyLayers),
          repo_instructions_path: null,
          host_adapters: [],
          ui_verify_command: null,
          generated_context: generatedContext,
          include_release_gate: true,
        })
      : null;
  const aiEvidenceClosure =
    flags.ai === "true" && resolvedRegistry
      ? buildSaltAiEvidenceClosureReport({
          registry: resolvedRegistry.registry,
          generated_at: resolvedRegistry.registry.generated_at,
          generator: {
            name: "salt-ds doctor --ai",
          },
          generated_context: generatedContext,
        })
      : null;
  const checkInstallChecks =
    flags["check-install"] === "true"
      ? await runCheckInstallChecks(result.rootDir)
      : [];

  const resultWithGeneratedContext: DoctorCommandResult = {
    ...result,
    generatedContext,
    aiSetup,
    aiEvidenceClosure,
    checks: [...result.checks, generatedContextCheck, ...checkInstallChecks],
    artifacts: [...result.artifacts, ...generatedContextBundleArtifacts],
  };
  if (supportBundleDir) {
    if (aiEvidenceClosure) {
      const aiEvidenceClosurePath = path.join(
        supportBundleDir,
        AI_EVIDENCE_CLOSURE_BUNDLE_FILE,
      );
      await writeJsonFile(aiEvidenceClosurePath, aiEvidenceClosure);
      resultWithGeneratedContext.artifacts.push({
        kind: "json",
        path: aiEvidenceClosurePath,
        label: "ai-evidence-closure-report",
      });
    }
    await writeJsonFile(
      path.join(supportBundleDir, "doctor-report.json"),
      resultWithGeneratedContext,
    );
  }
  const outputPath = flags.output
    ? path.resolve(io.cwd, flags.output)
    : undefined;
  const wantsJson = flags.json === "true";
  const resultWithArtifacts =
    outputPath &&
    !resultWithGeneratedContext.artifacts.some(
      (artifact) => artifact.path === outputPath,
    )
      ? {
          ...resultWithGeneratedContext,
          artifacts: [
            ...resultWithGeneratedContext.artifacts,
            {
              kind: "json",
              path: outputPath,
              label: "doctor-output",
            },
          ],
        }
      : resultWithGeneratedContext;

  if (outputPath) {
    await writeJsonFile(outputPath, resultWithArtifacts);
  }

  if (wantsJson) {
    io.writeStdout(`${JSON.stringify(resultWithArtifacts, null, 2)}\n`);
  } else {
    io.writeStdout(formatDoctorReport(resultWithArtifacts));
    if (outputPath) {
      io.writeStdout(`Wrote JSON report to ${outputPath}\n`);
    }
  }

  return resultWithArtifacts.checks.some((check) => check.status === "fail")
    ? 2
    : 0;
}
