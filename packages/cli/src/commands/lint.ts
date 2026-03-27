import path from "node:path";
import { writeJsonFile } from "../lib/common.js";
import { analyzeLintTargets } from "../lib/lintAnalysis.js";
import type { LintCommandResult, RequiredCliIo } from "../types.js";

function formatLintReport(result: LintCommandResult, cwd: string): string {
  const toDisplayPath = (targetPath: string) => {
    const relativePath = path.relative(cwd, targetPath);
    return relativePath.length > 0 ? relativePath : ".";
  };
  const lines = [
    "Salt Lint",
    `Root: ${result.rootDir}`,
    `Registry: ${result.registrySource} (${toDisplayPath(result.registryDir)})`,
    `Salt package version: ${result.packageVersion ?? "not detected"}`,
    `Targets: ${result.targetCount}`,
    `Files: ${result.fileCount}`,
    `Summary: ${result.summary.filesNeedingAttention} need attention, ${result.summary.cleanFiles} clean, ${result.summary.errors} errors, ${result.summary.warnings} warnings, ${result.summary.infos} infos`,
    "Resolved targets:",
    ...result.targets.map(
      (target) =>
        `- ${target.input} -> ${toDisplayPath(target.resolvedPath)} (${target.kind}, ${target.fileCount} file${target.fileCount === 1 ? "" : "s"})`,
    ),
    "File results:",
    ...result.files.map((file) => {
      const counts = `${file.summary.errors} error${file.summary.errors === 1 ? "" : "s"}, ${file.summary.warnings} warning${file.summary.warnings === 1 ? "" : "s"}, ${file.summary.infos} info${file.summary.infos === 1 ? "" : "s"}`;
      return `- ${file.relativePath}: ${file.decision.status} (${counts})${file.decision.why ? ` - ${file.decision.why}` : ""}`;
    }),
    "Notes:",
    ...result.notes.map((note) => `- ${note}`),
  ];

  return `${lines.join("\n")}\n`;
}

export async function runLintCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  let result: LintCommandResult;
  try {
    result = await analyzeLintTargets(
      positionals,
      io.cwd,
      flags["registry-dir"],
    );
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to resolve lint targets."}\n`,
    );
    return 1;
  }

  const outputPath = flags.output
    ? path.resolve(io.cwd, flags.output)
    : undefined;
  if (outputPath) {
    await writeJsonFile(outputPath, result);
  }

  if (flags.json === "true") {
    io.writeStdout(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    io.writeStdout(formatLintReport(result, io.cwd));
    if (outputPath) {
      io.writeStdout(`Wrote JSON report to ${outputPath}\n`);
    }
  }

  return result.summary.filesNeedingAttention > 0 ? 2 : 0;
}
