import { loadKnowledgeRuntimeContext } from "@salt-ds/knowledge";
import { discoverSaltProject } from "../discovery/discoverProject.js";
import { renderJson } from "../renderers/json.js";
import { renderPretty } from "../renderers/pretty.js";
import { renderPrompt } from "../renderers/prompt.js";
import { renderSarif } from "../renderers/sarif.js";
import { analyzeDiscoveredFiles } from "../scan/analyzeFiles.js";
import {
  buildScanResult,
  resultForByteLimit,
  resultWithinByteLimit,
  type SaltScanResult,
  type ScanSeverity,
} from "../scan/result.js";

export type ScanFormat = "pretty" | "json" | "sarif" | "prompt";
export type ScanFailOn = ScanSeverity | "never";

function render(input: {
  format: ScanFormat;
  result: SaltScanResult;
  sourceByPath: ReadonlyMap<string, string>;
  rescanCommand: string;
}): string {
  if (input.format === "json") return renderJson(input.result);
  if (input.format === "sarif")
    return renderSarif(input.result, input.sourceByPath);
  if (input.format === "prompt") {
    return renderPrompt(input.result, input.rescanCommand);
  }
  return renderPretty(input.result, input.rescanCommand);
}

function findingExitCode(result: SaltScanResult, failOn: ScanFailOn): number {
  if (failOn === "never") return 0;
  const rank = { info: 1, warning: 2, error: 3 } as const;
  return result.findings.some(
    (finding) => rank[finding.severity] >= rank[failOn],
  )
    ? 1
    : 0;
}

export function scanExitCode(
  result: SaltScanResult,
  failOn: ScanFailOn,
  allowIncomplete: boolean,
): number {
  if (
    result.coverage.status === "failed" ||
    (result.coverage.status === "partial" && !allowIncomplete)
  ) {
    return 3;
  }
  return findingExitCode(result, failOn);
}

export async function runScanCommand(input: {
  rootDir: string;
  cliVersion: string;
  format: ScanFormat;
  failOn: ScanFailOn;
  allowIncomplete: boolean;
}): Promise<{ output: string; exitCode: number; result: SaltScanResult }> {
  const scanStartedAt = performance.now();
  const [discovery, knowledge] = await Promise.all([
    discoverSaltProject({ rootDir: input.rootDir }),
    loadKnowledgeRuntimeContext(),
  ]);
  const units = new Map(
    discovery.workspace_units.map((unit) => [unit.workspace_unit_id, unit]),
  );
  const analysis = await analyzeDiscoveredFiles({
    files: discovery.files,
    workspaceUnits: units,
    limits: discovery.config.limits,
    scanStartedAt,
  });
  let result = resultWithinByteLimit(
    buildScanResult({
      cliVersion: input.cliVersion,
      manifest: knowledge.store.manifest,
      discovery,
      outcomes: analysis.outcomes,
    }),
    discovery.config.limits.canonical_result_bytes,
  );
  const sourceByPath = new Map(
    discovery.files.map((file) => [file.path, file.contents]),
  );
  const rescanCommand = `salt-ds scan . --format ${input.format} --fail-on ${input.failOn}${input.allowIncomplete ? " --allow-incomplete" : ""}`;
  let output = render({
    format: input.format,
    result,
    sourceByPath,
    rescanCommand,
  });
  if (
    Buffer.byteLength(output, "utf8") >
    discovery.config.limits.canonical_result_bytes
  ) {
    result = resultForByteLimit(result);
    output = render({
      format: input.format,
      result,
      sourceByPath: new Map(),
      rescanCommand,
    });
    if (
      Buffer.byteLength(output, "utf8") >
      discovery.config.limits.canonical_result_bytes
    ) {
      throw Object.assign(
        new Error("The configured canonical result limit is too small."),
        { code: "SALT_CLI_SCAN_FAILED", exitCode: 3 },
      );
    }
  }
  const exitCode = scanExitCode(result, input.failOn, input.allowIncomplete);
  return { output, exitCode, result };
}
