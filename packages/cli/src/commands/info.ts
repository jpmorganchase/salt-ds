import path from "node:path";
import { writeJsonFile } from "../lib/common.js";
import { collectSaltInfo } from "../lib/infoContext.js";
import type { RequiredCliIo, SaltInfoResult } from "../types.js";

function formatInfoReport(result: SaltInfoResult): string {
  const lines = [
    "Salt DS Info",
    `Root: ${result.rootDir}`,
    `Framework: ${result.framework.name}`,
    `Workspace: ${result.workspace.kind}${result.workspace.workspaceRoot ? ` (${result.workspace.workspaceRoot})` : ""}`,
    `Package manager: ${result.environment.packageManager}`,
    `Salt packages: ${
      result.salt.packages.length > 0
        ? result.salt.packages
            .map((pkg) => `${pkg.name}@${pkg.version}`)
            .join(", ")
        : "none detected"
    }`,
    `Registry: ${
      result.registry.available
        ? `${result.registry.source} (${result.registry.registryDir})`
        : "unavailable"
    }`,
    `Policy: ${
      result.policy.mode === "none"
        ? "not detected"
        : `${result.policy.mode} policy detected`
    }`,
    `Shared conventions packs: ${
      result.policy.sharedConventions.enabled
        ? `enabled (${result.policy.sharedConventions.packCount} package-backed layer${result.policy.sharedConventions.packCount === 1 ? "" : "s"})`
        : "not detected"
    }`,
    `Repo instructions: ${result.repoInstructions.path ?? "not detected"}`,
    `Runtime targets: ${result.runtime.detectedTargets.length}`,
  ];

  if (result.policy.stackLayers.length > 0) {
    lines.push("Policy layers:");
    lines.push(
      ...result.policy.stackLayers.map(
        (layer) =>
          `- ${layer.id} [${layer.scope}] via ${layer.sourceType}:${layer.source}${layer.optional ? " (optional)" : ""}`,
      ),
    );
  }

  if (result.imports.aliases.length > 0) {
    lines.push("Aliases:");
    lines.push(
      ...result.imports.aliases.map(
        (alias) => `- ${alias.alias} -> ${alias.targets.join(", ")}`,
      ),
    );
  }

  if (result.notes.length > 0) {
    lines.push("Notes:");
    lines.push(...result.notes.map((note) => `- ${note}`));
  }

  return `${lines.join("\n")}\n`;
}

export async function runInfoCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const rootDir = path.resolve(io.cwd, positionals[0] ?? ".");
  const result = await collectSaltInfo(rootDir, flags["registry-dir"]);
  const outputPath = flags.output
    ? path.resolve(io.cwd, flags.output)
    : undefined;

  if (outputPath) {
    await writeJsonFile(outputPath, result);
  }

  if (flags.json === "true") {
    io.writeStdout(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    io.writeStdout(formatInfoReport(result));
    if (outputPath) {
      io.writeStdout(`Wrote JSON report to ${outputPath}\n`);
    }
  }

  return 0;
}
