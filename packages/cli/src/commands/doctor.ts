import path from "node:path";
import { runDoctor } from "@salt-ds/runtime-inspector-core";
import {
  createDefaultBundleDir,
  formatStatus,
  writeJsonFile,
} from "../lib/common.js";
import type { RequiredCliIo } from "../types.js";

function formatDoctorReport(
  result: Awaited<ReturnType<typeof runDoctor>>,
): string {
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
  const outputPath = flags.output
    ? path.resolve(io.cwd, flags.output)
    : undefined;
  const wantsJson = flags.json === "true";
  const resultWithArtifacts =
    outputPath &&
    !result.artifacts.some((artifact) => artifact.path === outputPath)
      ? {
          ...result,
          artifacts: [
            ...result.artifacts,
            {
              kind: "json",
              path: outputPath,
              label: "doctor-output",
            },
          ],
        }
      : result;

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
