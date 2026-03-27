import fs from "node:fs/promises";
import path from "node:path";
import { reviewSaltUi } from "@salt-ds/semantic-core/tools/reviewSaltUi";
import type { LintCommandResult } from "../types.js";
import { resolveLintTargets } from "./lintTargets.js";
import {
  detectSaltPackageVersion,
  resolveSemanticRegistry,
} from "./registry.js";

export async function analyzeLintTargets(
  rawTargets: string[],
  cwd: string,
  explicitRegistryDir?: string,
): Promise<LintCommandResult> {
  const result = await resolveLintTargets(rawTargets, cwd);
  const { registry, registryDir, registrySource } =
    await resolveSemanticRegistry(cwd, explicitRegistryDir);
  const packageVersion = await detectSaltPackageVersion(cwd);
  const files = await Promise.all(
    result.resolvedFiles.map(async (filePath) => {
      const code = await fs.readFile(filePath, "utf8");
      const analysis = reviewSaltUi(registry, {
        code,
        framework: "react",
        package_version: packageVersion ?? undefined,
      });

      return {
        path: filePath,
        relativePath: path.relative(cwd, filePath) || path.basename(filePath),
        decision: analysis.decision,
        guidanceBoundary: analysis.guidance_boundary,
        summary: analysis.summary,
        nextStep: analysis.next_step,
        missingData: analysis.missing_data,
        sourceUrls: analysis.source_urls,
        issues: analysis.issues,
        fixes: analysis.fixes,
        migrations: analysis.migrations,
      };
    }),
  );
  const summary = files.reduce(
    (accumulator, file) => {
      if (file.decision.status === "needs_attention") {
        accumulator.filesNeedingAttention += 1;
      } else {
        accumulator.cleanFiles += 1;
      }
      accumulator.errors += file.summary.errors;
      accumulator.warnings += file.summary.warnings;
      accumulator.infos += file.summary.infos;
      accumulator.fixCount += file.summary.fix_count;
      accumulator.migrationCount += file.summary.migration_count;
      return accumulator;
    },
    {
      cleanFiles: 0,
      filesNeedingAttention: 0,
      errors: 0,
      warnings: 0,
      infos: 0,
      fixCount: 0,
      migrationCount: 0,
    },
  );

  return {
    ...result,
    registryDir,
    registrySource,
    packageVersion,
    files,
    summary,
    notes: [
      ...(packageVersion
        ? [`Detected Salt package version ${packageVersion}.`]
        : [
            "No Salt package version was detected from package.json; version-aware deprecation filtering may be broader.",
          ]),
      ...new Set(files.flatMap((file) => file.missingData)),
    ],
  };
}
