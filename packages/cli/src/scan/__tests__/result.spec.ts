import fs from "node:fs";
import path from "node:path";
import type {
  CompleteReviewFinding,
  CompleteReviewSaltCodeAnalysis,
  KnowledgeManifestV1,
} from "@salt-ds/knowledge";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import { SALT_SCAN_LIMIT_DEFAULTS } from "../../config/limits.js";
import type { SaltProjectDiscovery } from "../../discovery/discoverProject.js";
import type { FileAnalysisOutcome } from "../analyzeFiles.js";
import { buildScanResult, resultWithinByteLimit } from "../result.js";

const digest = `sha256:${"a".repeat(64)}`;

const manifest = {
  bundle_version: "0.0.0",
  bundle_digest: digest,
  semantic_digest: digest,
  compatibility: {
    packages: [
      {
        name: "@salt-ds/core",
        tested_version: "1.69.0",
        supported_range: ">=1.0.0 <2.0.0",
        required: true,
      },
    ],
  },
} as KnowledgeManifestV1;

function discovery(): SaltProjectDiscovery {
  return {
    contract: "salt-project-discovery/1",
    schema_version: "1.0.0",
    root: ".",
    config: {
      schema_version: "1.0.0",
      source: "default",
      include: [],
      exclude: [],
      limits: { ...SALT_SCAN_LIMIT_DEFAULTS },
    },
    counters: {
      visited_directories: 2,
      directory_entries: 3,
      queued_paths: 3,
      selected_candidate_files: 1,
      selected_files: 1,
      selected_bytes: 41,
    },
    workspace_units: [
      {
        workspace_unit_id: ".",
        classification: "salt-application",
        classification_evidence: ["salt_dependency:@salt-ds/core"],
        workspace_claims: ["."],
        package_vector: [
          {
            name: "@salt-ds/core",
            declared_version: "1.69.0",
            observed_version: "1.69.0",
            observed_manifest_path: "node_modules/@salt-ds/core/package.json",
            satisfies_declaration: true,
          },
        ],
        package_evidence: {
          manager: "npm",
          manager_detection: "package_manager_field",
          layout: "node_modules",
          status: "succeeded",
        },
        owned_files: ["src/Review.tsx"],
        untrusted_project_context: {
          salt_policy: "untrusted",
          team_config: "absent",
          stack_config: "absent",
        },
        limitations: [],
      },
    ],
    skipped_units: [],
    files: [
      {
        path: "src/Review.tsx",
        workspace_unit_id: ".",
        utf8_bytes: 41,
        contents: "SECRET SOURCE MUST NOT ENTER THE RESULT",
      },
    ],
    skipped: [],
    coverage: { status: "complete", reasons: [] },
  };
}

function finding(
  description = "Use Link for navigation.",
): CompleteReviewFinding {
  return {
    id: "internal-id",
    rule_id: "salt.component.action_navigation_target",
    rule_description: description,
    severity: "warning",
    parsed_fact: {} as CompleteReviewFinding["parsed_fact"],
    location: {
      start_offset: 20,
      end_offset: 26,
      start_line: 1,
      start_column: 21,
      end_line: 1,
      end_column: 27,
    },
    remediation: "Use the Salt Link component.",
    official_decision: null,
    policy_evaluation: null,
    evidence: {
      submitted_artifact_id: "src/Review.tsx",
      validation: "source_bound",
      references: [
        { locator: "salt://component/button", field_path: "$.usage" },
      ],
    },
  };
}

function analysis(input?: {
  parser?: "babel" | "limited" | "failed";
  unknownFacts?: number;
  description?: string;
}): CompleteReviewSaltCodeAnalysis {
  return {
    results: [
      {
        outcome: input?.parser === "failed" ? "not_evaluated" : "findings",
        findings:
          input?.parser === "failed" ? [] : [finding(input?.description)],
        coverage: {
          parser: input?.parser ?? "babel",
          unknown_fact_count: input?.unknownFacts ?? 0,
          evaluated_rule_ids: ["salt.component.action_navigation_target"],
        },
        limitations:
          input?.parser === "limited"
            ? ["The normalized-fact limit was reached."]
            : [],
      },
    ],
  } as CompleteReviewSaltCodeAnalysis;
}

function evaluated(
  value = analysis(),
): Extract<FileAnalysisOutcome, { status: "evaluated" }> {
  return { status: "evaluated", file: discovery().files[0], analysis: value };
}

describe("canonical scan result", () => {
  it("is schema-valid, deterministic, relative, and source-free", () => {
    const first = buildScanResult({
      cliVersion: "0.0.0",
      manifest,
      discovery: discovery(),
      outcomes: [evaluated()],
    });
    const second = buildScanResult({
      cliVersion: "0.0.0",
      manifest,
      discovery: discovery(),
      outcomes: [evaluated()],
    });
    expect(second).toEqual(first);
    expect(JSON.stringify(first)).not.toContain("SECRET SOURCE");
    expect(JSON.stringify(first)).not.toMatch(/[A-Z]:[\\/]/u);
    expect(first.findings[0]).toMatchObject({
      workspace_unit_id: ".",
      location: { path: "src/Review.tsx" },
      id: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
    });

    const schema = JSON.parse(
      fs.readFileSync(
        path.resolve(
          import.meta.dirname,
          "../../../schemas/scan-result-1.schema.json",
        ),
        "utf8",
      ),
    );
    const validate = new Ajv2020({ strict: true }).compile(schema);
    expect(validate(first), JSON.stringify(validate.errors)).toBe(true);
  });

  it("keeps finding identity independent of message and remediation prose", () => {
    const base = buildScanResult({
      cliVersion: "0.0.0",
      manifest,
      discovery: discovery(),
      outcomes: [evaluated()],
    });
    const changed = analysis({ description: "Changed presentation prose." });
    const changedFinding = changed.results[0]?.findings[0];
    if (!changedFinding)
      throw new Error("Expected the result fixture finding.");
    changedFinding.remediation = "Changed remediation prose.";
    const projected = buildScanResult({
      cliVersion: "0.0.0",
      manifest,
      discovery: discovery(),
      outcomes: [evaluated(changed)],
    });
    expect(projected.findings[0]?.id).toBe(base.findings[0]?.id);
  });

  it("distinguishes disclosed partial coverage from failed evaluation", () => {
    const partialDiscovery = discovery();
    const partialUnit = partialDiscovery.workspace_units[0];
    if (!partialUnit) throw new Error("Expected the discovery fixture unit.");
    partialUnit.package_vector = [];
    partialUnit.package_evidence.status = "partial";
    const partial = buildScanResult({
      cliVersion: "0.0.0",
      manifest,
      discovery: partialDiscovery,
      outcomes: [evaluated(analysis({ unknownFacts: 1 }))],
    });
    expect(partial.coverage).toMatchObject({
      status: "partial",
      reasons: expect.arrayContaining([
        "SALT_PACKAGE_VECTOR_UNAVAILABLE",
        "SCAN_UNSUPPORTED_CONSTRUCT",
      ]),
    });

    const failed = buildScanResult({
      cliVersion: "0.0.0",
      manifest,
      discovery: discovery(),
      outcomes: [
        {
          status: "failed",
          file: discovery().files[0],
          reason: "SCAN_WORKER_CRASH",
        },
      ],
    });
    expect(failed.coverage).toMatchObject({
      status: "failed",
      evaluated_files: 0,
      failed_files: 1,
    });
    expect(failed.workspace_units[0]?.files).toEqual({
      selected: 1,
      evaluated: 0,
      failed: 1,
    });
  });

  it("discards findings and rule coverage when a parser budget is limited", () => {
    const result = buildScanResult({
      cliVersion: "0.0.0",
      manifest,
      discovery: discovery(),
      outcomes: [evaluated(analysis({ parser: "limited" }))],
    });
    expect(result.coverage).toMatchObject({
      status: "failed",
      evaluated_files: 0,
      failed_files: 1,
      evaluated_rule_ids: [],
    });
    expect(result.findings).toEqual([]);
  });

  it("returns a bounded failure projection when the full result exceeds its cap", () => {
    const result = buildScanResult({
      cliVersion: "0.0.0",
      manifest,
      discovery: discovery(),
      outcomes: [evaluated()],
    });
    expect(resultWithinByteLimit(result, 1)).toMatchObject({
      workspace_units: [],
      findings: [],
      coverage: { status: "failed", reasons: ["SCAN_RESULT_BYTES_LIMIT"] },
    });
  });
});
