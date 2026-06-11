import fs from "node:fs/promises";
import path from "node:path";
import type { SaltReviewReportValidationResult } from "@salt-ds/semantic-core";
import { validateSaltReviewReport } from "@salt-ds/semantic-core";
import {
  attachPublicContractDetails,
  type PublicContract,
} from "@salt-ds/semantic-core/tools/publicContract";
import { writeJsonFile } from "../../../lib/common.js";
import type { resolveSemanticRegistry } from "../../../lib/semanticRuntime.js";
import type { RequiredCliIo } from "../../../types.js";
import { shouldEmitCompactWorkflowJson } from "./exitCode.js";
import type {
  CreateWorkflowResult,
  MigrateWorkflowResult,
  ReviewWorkflowResult,
  UpgradeWorkflowResult,
} from "./types.js";

export async function loadAttachedReviewReportValidation(input: {
  cwd: string;
  registry: Awaited<ReturnType<typeof resolveSemanticRegistry>>["registry"];
  reviewReportPath?: string | null;
}): Promise<SaltReviewReportValidationResult | null> {
  if (!input.reviewReportPath) {
    return null;
  }

  const reportPath = path.resolve(input.cwd, input.reviewReportPath);
  const report = JSON.parse(await fs.readFile(reportPath, "utf8")) as unknown;

  return validateSaltReviewReport({
    report,
    registry: input.registry,
    report_path: reportPath,
  });
}

export async function writeWorkflowOutput<
  T extends
    | CreateWorkflowResult
    | ReviewWorkflowResult
    | MigrateWorkflowResult
    | UpgradeWorkflowResult,
>(
  result: T,
  flags: Record<string, string>,
  io: RequiredCliIo,
  formatter: (result: T) => string,
  options: {
    compactJsonOverride: PublicContract;
  },
): Promise<void> {
  const jsonOutputPath = flags["json-file"] ?? flags.output;
  const outputPath = jsonOutputPath
    ? path.resolve(io.cwd, jsonOutputPath)
    : undefined;
  const compactJson = shouldEmitCompactWorkflowJson(flags);
  const jsonResult = compactJson
    ? options.compactJsonOverride
    : attachPublicContractDetails(options.compactJsonOverride, result);
  if (outputPath) {
    await writeJsonFile(outputPath, jsonResult);
  }

  if (flags.json === "true") {
    io.writeStdout(`${JSON.stringify(jsonResult, null, 2)}\n`);
  } else {
    io.writeStdout(formatter(result));
    if (outputPath) {
      io.writeStdout(`Wrote JSON report to ${outputPath}\n`);
    }
  }
}
