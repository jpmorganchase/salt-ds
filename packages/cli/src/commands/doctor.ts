import path from "node:path";
import { runDoctor } from "../../../runtime-inspector-core/src/index.js";
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
          `- ${layer.id}: ${layer.status} (${layer.sourceType} ${layer.source})${layer.resolvedPath ? ` -> ${layer.resolvedPath}` : ""}${layer.packageName ? ` [${layer.packageName}]` : ""}`,
      ),
    );
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
