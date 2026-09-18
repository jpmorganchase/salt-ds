import { createHash } from "node:crypto";
import {
  type CompleteReviewFinding,
  type KnowledgeManifestV1,
  REVIEW_RULE_CHARACTERIZATION,
  resolveKnowledgeCompatibility,
} from "@salt-ds/knowledge";
import type { SaltProjectDiscovery } from "../discovery/discoverProject.js";
import type { FileAnalysisOutcome } from "./analyzeFiles.js";

export type ScanSeverity = "info" | "warning" | "error";
export type ScanCoverageStatus = "complete" | "partial" | "failed";

export interface CanonicalScanFinding {
  id: string;
  workspace_unit_id: string;
  rule_id: string;
  rule_description: string;
  severity: ScanSeverity;
  confidence: "high";
  applicability: unknown;
  location: {
    path: string;
    encoding: "utf8_bytes_end_exclusive";
    start_offset: number;
    end_offset: number;
    start_line: number;
    start_byte_column: number;
    end_line: number;
    end_byte_column: number;
  };
  message: string;
  evidence: {
    validation: "source_bound";
    references: Array<{ locator: string; field_path: string }>;
  };
  remediation: string | null;
  acceptance_criterion: string;
}

export interface SaltScanResult {
  contract: "salt-scan-result/1";
  schema_version: "1.0.0";
  tool: { package: "@salt-ds/cli"; version: string };
  engine: {
    id: "salt-static-scan";
    version: "1.0.0";
    ruleset_version: "1.0.0";
    ruleset_digest: string;
  };
  knowledge: {
    package: "@salt-ds/knowledge";
    version: string;
    bundle_digest: string;
    semantic_digest: string;
  };
  root: {
    path: ".";
    discovery: SaltProjectDiscovery["counters"];
  };
  workspace_units: Array<{
    workspace_unit_id: string;
    classification: string;
    classification_evidence: string[];
    package_vector: SaltProjectDiscovery["workspace_units"][number]["package_vector"];
    package_evidence: SaltProjectDiscovery["workspace_units"][number]["package_evidence"];
    compatibility: {
      status: "compatible" | "partial" | "incompatible";
      packages: unknown[];
      usable_families: string[];
    };
    files: {
      selected: number;
      evaluated: number;
      failed: number;
    };
    coverage: { status: ScanCoverageStatus; reasons: string[] };
    limitations: string[];
  }>;
  summary: { errors: number; warnings: number; infos: number; total: number };
  findings: CanonicalScanFinding[];
  coverage: {
    status: ScanCoverageStatus;
    reasons: string[];
    selected_files: number;
    evaluated_files: number;
    failed_files: number;
    skipped_files: number;
    unsupported_files: number;
    evaluated_rule_ids: string[];
  };
  limitations: string[];
}

function digest(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function findingIdentity(
  unitId: string,
  filePath: string,
  finding: CompleteReviewFinding,
): string {
  return digest({
    workspace_unit_id: unitId,
    rule_id: finding.rule_id,
    path: filePath,
    location: finding.location,
    references: finding.evidence.references,
  });
}

function findingProjection(
  unitId: string,
  filePath: string,
  finding: CompleteReviewFinding,
): CanonicalScanFinding {
  return {
    id: findingIdentity(unitId, filePath, finding),
    workspace_unit_id: unitId,
    rule_id: finding.rule_id,
    rule_description: finding.rule_description,
    severity: finding.severity,
    confidence: "high",
    applicability: finding.official_decision?.applicability ?? null,
    location: {
      path: filePath,
      encoding: "utf8_bytes_end_exclusive",
      start_offset: finding.location.start_offset,
      end_offset: finding.location.end_offset,
      start_line: finding.location.start_line,
      start_byte_column: finding.location.start_column,
      end_line: finding.location.end_line,
      end_byte_column: finding.location.end_column,
    },
    message: finding.rule_description,
    evidence: {
      validation: "source_bound",
      references: finding.evidence.references.map((reference) => ({
        locator: reference.locator,
        field_path: reference.field_path,
      })),
    },
    remediation: finding.remediation,
    acceptance_criterion: `The ${finding.rule_id} finding is absent on an unchanged rescan.`,
  };
}

function statusFromReasons(reasons: readonly string[]): ScanCoverageStatus {
  if (
    reasons.some(
      (reason) =>
        reason.includes("FAIL") ||
        reason.includes("CRASH") ||
        reason.includes("TIMEOUT") ||
        reason.includes("OOM") ||
        reason.includes("PROTOCOL") ||
        reason.includes("CONTAINMENT") ||
        reason.includes("OWNERSHIP_CONFLICT") ||
        reason.includes("WORKSPACE_PATTERN_INVALID") ||
        reason.includes("ISOLATION") ||
        reason.includes("PARSER") ||
        reason.includes("ANALYZER") ||
        reason.includes("FINDING_LIMIT") ||
        reason.includes("AST_NODE_LIMIT") ||
        reason.includes("EVIDENCE_LIMIT") ||
        reason.includes("WORKER_TIME_LIMIT") ||
        reason.includes("RESTART_LIMIT") ||
        reason.includes("RESULT_BYTES_LIMIT"),
    )
  ) {
    return "failed";
  }
  return reasons.length > 0 ? "partial" : "complete";
}

function parserCoverageReasons(
  outcome: Extract<FileAnalysisOutcome, { status: "evaluated" }>,
): string[] {
  const result = outcome.analysis.results[0];
  if (!result || result.coverage.parser === "failed")
    return ["SCAN_PARSER_FAILURE"];
  if (result.coverage.parser === "limited") {
    const evidenceLimited = result.limitations.some((entry) =>
      entry.includes("normalized-fact"),
    );
    return [
      evidenceLimited
        ? "SCAN_EVIDENCE_LIMIT"
        : outcome.file.path.endsWith(".css")
          ? "SCAN_CSS_NODE_LIMIT"
          : "SCAN_JS_AST_NODE_LIMIT",
    ];
  }
  return result.coverage.unknown_fact_count > 0
    ? ["SCAN_UNSUPPORTED_CONSTRUCT"]
    : [];
}

function compareFindings(
  left: CanonicalScanFinding,
  right: CanonicalScanFinding,
): number {
  return (
    left.workspace_unit_id.localeCompare(right.workspace_unit_id) ||
    left.location.path.localeCompare(right.location.path) ||
    left.location.start_offset - right.location.start_offset ||
    left.severity.localeCompare(right.severity) ||
    left.rule_id.localeCompare(right.rule_id)
  );
}

export function buildScanResult(input: {
  cliVersion: string;
  manifest: KnowledgeManifestV1;
  discovery: SaltProjectDiscovery;
  outcomes: readonly FileAnalysisOutcome[];
}): SaltScanResult {
  const outcomeByPath = new Map(
    input.outcomes.map((outcome) => [outcome.file.path, outcome]),
  );
  const findings: CanonicalScanFinding[] = [];
  const rootReasons = new Set<string>(input.discovery.coverage.reasons);
  const evaluatedRuleIds = new Set<string>();
  let evaluatedFiles = 0;
  let failedFiles = 0;

  for (const outcome of input.outcomes) {
    if (outcome.status === "failed") {
      failedFiles += 1;
      rootReasons.add(outcome.reason);
      continue;
    }
    const coverageReasons = parserCoverageReasons(outcome);
    for (const reason of coverageReasons) rootReasons.add(reason);
    if (statusFromReasons(coverageReasons) === "failed") {
      failedFiles += 1;
      continue;
    }
    evaluatedFiles += 1;
    const result = outcome.analysis.results[0];
    for (const ruleId of result?.coverage.evaluated_rule_ids ?? []) {
      evaluatedRuleIds.add(ruleId);
    }
    for (const finding of result?.findings ?? []) {
      findings.push(
        findingProjection(
          outcome.file.workspace_unit_id,
          outcome.file.path,
          finding,
        ),
      );
    }
  }
  findings.sort(compareFindings);

  const workspaceUnits = input.discovery.workspace_units.map((unit) => {
    const packageVersions = Object.fromEntries(
      unit.package_vector.map((entry) => [entry.name, entry.observed_version]),
    );
    const compatibility =
      unit.package_vector.length > 0
        ? resolveKnowledgeCompatibility(input.manifest, packageVersions)
        : null;
    const reasons = new Set<string>();
    if (!compatibility) reasons.add("SALT_PACKAGE_VECTOR_UNAVAILABLE");
    else {
      for (const reason of compatibility.limitations) reasons.add(reason);
    }
    if (unit.package_evidence.status !== "succeeded") {
      reasons.add("SALT_PROJECT_PACKAGE_VECTOR_NOT_EXACT");
    }
    const ownedOutcomes = unit.owned_files.flatMap((filePath) => {
      const outcome = outcomeByPath.get(filePath);
      return outcome ? [outcome] : [];
    });
    for (const outcome of ownedOutcomes) {
      if (outcome.status === "failed") reasons.add(outcome.reason);
      else {
        for (const reason of parserCoverageReasons(outcome))
          reasons.add(reason);
      }
    }
    for (const reason of reasons) rootReasons.add(reason);
    const reasonList = [...reasons].sort();
    const evaluated = ownedOutcomes.filter(
      (outcome) =>
        outcome.status === "evaluated" &&
        statusFromReasons(parserCoverageReasons(outcome)) !== "failed",
    ).length;
    return {
      workspace_unit_id: unit.workspace_unit_id,
      classification: unit.classification,
      classification_evidence: unit.classification_evidence,
      package_vector: unit.package_vector,
      package_evidence: unit.package_evidence,
      compatibility: {
        status: !compatibility
          ? ("partial" as const)
          : compatibility.complete
            ? ("compatible" as const)
            : compatibility.usable_families.length > 0
              ? ("partial" as const)
              : ("incompatible" as const),
        packages: compatibility?.packages ?? [],
        usable_families: compatibility?.usable_families ?? [],
      },
      files: {
        selected: unit.owned_files.length,
        evaluated,
        failed: ownedOutcomes.length - evaluated,
      },
      coverage: { status: statusFromReasons(reasonList), reasons: reasonList },
      limitations: [...new Set([...unit.limitations, ...reasonList])].sort(),
    };
  });
  const reasonList = [...rootReasons].sort();
  const summary = findings.reduce(
    (counts, finding) => {
      if (finding.severity === "error") counts.errors += 1;
      else if (finding.severity === "warning") counts.warnings += 1;
      else counts.infos += 1;
      counts.total += 1;
      return counts;
    },
    { errors: 0, warnings: 0, infos: 0, total: 0 },
  );
  return {
    contract: "salt-scan-result/1",
    schema_version: "1.0.0",
    tool: { package: "@salt-ds/cli", version: input.cliVersion },
    engine: {
      id: "salt-static-scan",
      version: "1.0.0",
      ruleset_version: "1.0.0",
      ruleset_digest: digest(REVIEW_RULE_CHARACTERIZATION),
    },
    knowledge: {
      package: "@salt-ds/knowledge",
      version: input.manifest.bundle_version,
      bundle_digest: input.manifest.bundle_digest,
      semantic_digest: input.manifest.semantic_digest,
    },
    root: { path: ".", discovery: input.discovery.counters },
    workspace_units: workspaceUnits,
    summary,
    findings,
    coverage: {
      status:
        input.discovery.coverage.status === "failed"
          ? "failed"
          : statusFromReasons(reasonList),
      reasons: reasonList,
      selected_files: input.discovery.files.length,
      evaluated_files: evaluatedFiles,
      failed_files: failedFiles,
      skipped_files: input.discovery.skipped.length,
      unsupported_files: input.discovery.skipped.filter(
        (entry) => entry.reason === "SCAN_UNSUPPORTED_EXTENSION",
      ).length,
      evaluated_rule_ids: [...evaluatedRuleIds].sort(),
    },
    limitations: reasonList,
  };
}

export function resultWithinByteLimit(
  result: SaltScanResult,
  maxBytes: number,
): SaltScanResult {
  if (Buffer.byteLength(JSON.stringify(result), "utf8") <= maxBytes)
    return result;
  return resultForByteLimit(result);
}

export function resultForByteLimit(result: SaltScanResult): SaltScanResult {
  return {
    ...result,
    workspace_units: [],
    summary: { errors: 0, warnings: 0, infos: 0, total: 0 },
    findings: [],
    coverage: {
      ...result.coverage,
      status: "failed",
      reasons: ["SCAN_RESULT_BYTES_LIMIT"],
      evaluated_rule_ids: [],
    },
    limitations: ["SCAN_RESULT_BYTES_LIMIT"],
  };
}
