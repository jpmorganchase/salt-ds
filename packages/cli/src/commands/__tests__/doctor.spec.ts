import fs from "node:fs";
import path from "node:path";
import type {
  CompleteReviewFinding,
  CompleteReviewSaltCodeAnalysis,
  KnowledgeManifestV1,
  SaltProjectDecision,
} from "@salt-ds/knowledge";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import { SALT_SCAN_LIMIT_DEFAULTS } from "../../config/limits.js";
import type { SaltProjectDiscovery } from "../../discovery/discoverProject.js";
import type { FileAnalysisOutcome } from "../../scan/analyzeFiles.js";
import {
  boundDoctorOutput,
  buildDoctorResult,
  DOCTOR_OPERATIONAL_REASONS,
  deriveDoctorOutcome,
  doctorExitCode,
  renderDoctorPrompt,
} from "../doctor.js";

const sha = `sha256:${"a".repeat(64)}`;

const manifest = {
  bundle_version: "1.0.0",
  bundle_digest: sha,
  semantic_digest: sha,
  compatibility: {
    packages: [
      {
        name: "@salt-ds/core",
        tested_version: "1.0.0",
        supported_range: "1.0.0",
        required: true,
      },
    ],
  },
} as KnowledgeManifestV1;

const DECISION_CASES = [
  ["selected", "SALT_PROJECT_SELECTED", "complete", "SALT_PROJECT_SELECTED"],
  [
    "not_salt",
    "SALT_PROJECT_NO_SALT_PACKAGES",
    "not_salt",
    "SALT_PROJECT_NO_SALT_PACKAGES",
  ],
  [
    "unverifiable",
    "SALT_PROJECT_PACKAGE_EVIDENCE_AMBIGUOUS",
    "incomplete",
    "PACKAGE_EVIDENCE_AMBIGUOUS",
  ],
  [
    "unverifiable",
    "SALT_PROJECT_INSPECTION_INCOMPLETE",
    "incomplete",
    "INSPECTION_INCOMPLETE",
  ],
  ["unsupported", "SALT_PROJECT_CORE_REQUIRED", "unsupported", "CORE_REQUIRED"],
  [
    "unsupported",
    "SALT_PROJECT_PACKAGE_FAMILY_UNKNOWN",
    "unsupported",
    "PACKAGE_FAMILY_UNKNOWN",
  ],
  [
    "unsupported",
    "SALT_PROJECT_EXACT_VERSION_REQUIRED",
    "unsupported",
    "EXACT_VERSION_REQUIRED",
  ],
] as const;

function decision(
  status: SaltProjectDecision["status"],
  reasonCode: SaltProjectDecision["reason_code"],
): SaltProjectDecision {
  return {
    contract: "salt-project-decision/1",
    schema_version: "1.0.0",
    status,
    reason_code: reasonCode,
    installed_package_vector:
      status === "not_salt"
        ? []
        : [{ name: "@salt-ds/core", version: "1.0.0" }],
  };
}

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
            declared_version: "1.0.0",
            observed_version: "1.0.0",
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

function finding(): CompleteReviewFinding {
  return {
    id: "internal",
    rule_id: "salt.component.action_navigation_target",
    rule_description: "Use Link for navigation.",
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
    evidence: {
      submitted_artifact_id: "src/Review.tsx",
      validation: "source_bound",
      references: [
        { locator: "salt://component/button", field_path: "$.usage" },
      ],
    },
  };
}

function analysis(): CompleteReviewSaltCodeAnalysis {
  return {
    results: [
      {
        artifact: {
          id: "src/Review.tsx",
          language: "tsx",
          utf8_bytes: 41,
          content_digest: sha,
        },
        outcome: "findings",
        summary: { errors: 0, warnings: 1, infos: 0 },
        findings: [finding()],
        version_decisions: [],
        coverage: {
          parser: "babel",
          fact_counts: [{ kind: "jsx_element", count: 1 }],
          unknown_fact_count: 0,
          evaluated_rule_ids: ["salt.component.action_navigation_target"],
          skipped_rule_matches: 0,
          detected_findings: 1,
          returned_findings: 1,
          detected_nonfinding_version_decisions: 0,
          returned_nonfinding_version_decisions: 0,
          nonfinding_version_decisions_truncated: false,
          truncated: false,
        },
        limitations: [],
      },
    ],
    scope: {
      kind: "submitted_text_only",
      context_source: "caller_package_versions",
      artifact_count: 1,
      submitted_utf8_bytes: 41,
    },
    coverage: {
      submitted_artifacts: 1,
      evaluated_artifacts: 1,
      analyzer: "salt_submitted_fact_rules_v1",
      semantic_validation: "source_bound_allowlist",
      location_encoding: "utf8_bytes_end_exclusive",
      detected_findings: 1,
      detected_nonfinding_version_decisions: 0,
    },
    limitations: [],
    provenance: {
      knowledge_version: "1.0.0",
      semantic_digest: sha,
      project_context_digest: null,
    },
  };
}

function completeResult() {
  const sourceDiscovery = discovery();
  return buildDoctorResult({
    cliVersion: "1.0.0",
    manifest,
    discovery: sourceDiscovery,
    workspaceDecisions: [
      {
        workspace_unit_id: ".",
        decision: decision("selected", "SALT_PROJECT_SELECTED"),
      },
    ],
    outcomes: [
      {
        status: "evaluated",
        file: sourceDiscovery.files[0],
        analysis: analysis(),
      } satisfies FileAnalysisOutcome,
    ],
  });
}

describe("Doctor project outcome", () => {
  it.each(DECISION_CASES)(
    "maps %s/%s to %s/%s",
    (status, projectReason, expectedStatus, expectedReason) => {
      expect(
        deriveDoctorOutcome({
          operationalReasons: [],
          workspaceDecisions: [
            {
              workspace_unit_id: ".",
              decision: decision(status, projectReason),
            },
          ],
        }),
      ).toEqual({
        status: expectedStatus,
        reason_code: expectedReason,
      });
    },
  );

  it.each(DOCTOR_OPERATIONAL_REASONS)(
    "fails closed on the exact operational reason %s",
    (reason) => {
      expect(
        deriveDoctorOutcome({
          operationalReasons: [reason],
          workspaceDecisions: [
            {
              workspace_unit_id: ".",
              decision: decision("selected", "SALT_PROJECT_SELECTED"),
            },
          ],
        }),
      ).toEqual({ status: "incomplete", reason_code: reason });
    },
  );

  it("uses lexical operational and workspace tie-breaks", () => {
    expect(
      deriveDoctorOutcome({
        operationalReasons: ["SCAN_WORKER_TIMEOUT", "SCAN_ANALYZER_FAILURE"],
        workspaceDecisions: [],
      }),
    ).toEqual({
      status: "incomplete",
      reason_code: "SCAN_ANALYZER_FAILURE",
    });
    expect(
      deriveDoctorOutcome({
        operationalReasons: [],
        workspaceDecisions: [
          {
            workspace_unit_id: "z-child",
            decision: decision(
              "unverifiable",
              "SALT_PROJECT_INSPECTION_INCOMPLETE",
            ),
          },
          {
            workspace_unit_id: "a-child",
            decision: decision(
              "unverifiable",
              "SALT_PROJECT_PACKAGE_EVIDENCE_AMBIGUOUS",
            ),
          },
        ],
      }),
    ).toEqual({
      status: "incomplete",
      reason_code: "PACKAGE_EVIDENCE_AMBIGUOUS",
    });
  });

  it("enforces aggregate precedence and lets a selected child outrank a non-Salt root", () => {
    const root = {
      workspace_unit_id: ".",
      decision: decision("not_salt", "SALT_PROJECT_NO_SALT_PACKAGES"),
    };
    const selected = {
      workspace_unit_id: "packages/app",
      decision: decision("selected", "SALT_PROJECT_SELECTED"),
    };
    const unsupported = {
      workspace_unit_id: "packages/legacy",
      decision: decision("unsupported", "SALT_PROJECT_EXACT_VERSION_REQUIRED"),
    };
    const incomplete = {
      workspace_unit_id: "packages/unknown",
      decision: decision("unverifiable", "SALT_PROJECT_INSPECTION_INCOMPLETE"),
    };
    expect(
      deriveDoctorOutcome({
        operationalReasons: [],
        workspaceDecisions: [root, selected],
      }),
    ).toEqual({
      status: "complete",
      reason_code: "SALT_PROJECT_SELECTED",
    });
    expect(
      deriveDoctorOutcome({
        operationalReasons: [],
        workspaceDecisions: [root, selected, unsupported],
      }).status,
    ).toBe("unsupported");
    expect(
      deriveDoctorOutcome({
        operationalReasons: [],
        workspaceDecisions: [root, selected, unsupported, incomplete],
      }).status,
    ).toBe("incomplete");
  });

  it("rejects unknown reasons and mismatched project status/reason pairs", () => {
    expect(() =>
      deriveDoctorOutcome({
        operationalReasons: ["SCAN_FUTURE_FAILURE"],
        workspaceDecisions: [],
      }),
    ).toThrow(/Unknown Doctor operational reason/u);
    expect(() =>
      deriveDoctorOutcome({
        operationalReasons: [],
        workspaceDecisions: [
          {
            workspace_unit_id: ".",
            decision: decision(
              "selected",
              "SALT_PROJECT_EXACT_VERSION_REQUIRED",
            ),
          },
        ],
      }),
    ).toThrow(/Invalid Salt project decision pair/u);
  });
});

describe("Doctor result contract", () => {
  const schema = JSON.parse(
    fs.readFileSync(
      path.resolve(
        import.meta.dirname,
        "../../../schemas/doctor-result-1.schema.json",
      ),
      "utf8",
    ),
  );
  const validate = new Ajv2020({ strict: true }).compile(schema);

  it("is deterministic, source-free, relative, schema-valid, and coverage-rich", () => {
    const first = completeResult();
    const second = completeResult();
    expect(second).toEqual(first);
    expect(validate(first), JSON.stringify(validate.errors)).toBe(true);
    expect(JSON.stringify(first)).not.toContain("SECRET SOURCE");
    expect(JSON.stringify(first)).not.toMatch(/[A-Z]:[\\/]/u);
    expect(first).toMatchObject({
      status: "complete",
      reason_code: "SALT_PROJECT_SELECTED",
      knowledge: { semantic_digest: sha },
      workspace_units: [
        {
          workspace_unit_id: ".",
          project_decision: {
            status: "selected",
            reason_code: "SALT_PROJECT_SELECTED",
          },
        },
      ],
      coverage: {
        selected_files: 1,
        evaluated_files: 1,
        parser_counts: [{ parser: "babel", files: 1 }],
        fact_counts: [{ kind: "jsx_element", count: 1 }],
        evaluated_rule_ids: ["salt.component.action_navigation_target"],
        truncated: false,
        timeout: false,
      },
    });
    expect(first.findings[0]).toMatchObject({
      id: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
      location: {
        path: "src/Review.tsx",
        encoding: "utf8_bytes_end_exclusive",
      },
      evidence: { validation: "source_bound" },
      remediation: expect.any(String),
      acceptance_criterion: expect.any(String),
    });
  });

  it("keeps the schema and runtime operational enums identical", () => {
    expect(schema.$defs.operationalReason.enum).toEqual(
      DOCTOR_OPERATIONAL_REASONS,
    );
  });

  it("schema-rejects missing, mismatched, and unknown reason codes", () => {
    const missing = structuredClone(completeResult()) as unknown as Record<
      string,
      unknown
    >;
    delete missing.reason_code;
    expect(validate(missing)).toBe(false);

    const mismatch = structuredClone(completeResult());
    mismatch.reason_code = "EXACT_VERSION_REQUIRED";
    expect(validate(mismatch)).toBe(false);

    const unknown = structuredClone(completeResult()) as unknown as Record<
      string,
      unknown
    >;
    unknown.reason_code = "SCAN_FUTURE_FAILURE";
    expect(validate(unknown)).toBe(false);
  });

  it("uses the closed exit-code and prompt contracts", () => {
    const result = completeResult();
    expect(doctorExitCode(result, "warning")).toBe(1);
    expect(doctorExitCode(result, "error")).toBe(0);
    expect(doctorExitCode(result, "never")).toBe(0);
    const unsupported = {
      ...result,
      status: "unsupported",
      reason_code: "EXACT_VERSION_REQUIRED",
    } as const;
    expect(doctorExitCode(unsupported, "never")).toBe(3);

    const prompt = renderDoctorPrompt(result);
    expect(prompt).toContain("SALT_DOCTOR_RESULT_V1");
    expect(prompt).toContain("untrusted evidence");
    expect(prompt).toContain(JSON.stringify(result));
    expect(prompt).toContain('"evaluated_rule_ids"');
    expect(prompt).toContain('"limitations"');
  });

  it("applies the canonical byte ceiling to the final JSON or prompt output", () => {
    const result = completeResult();
    const jsonBytes = Buffer.byteLength(`${JSON.stringify(result)}\n`, "utf8");
    expect(boundDoctorOutput(result, "json", jsonBytes)).toEqual({
      result,
      output: `${JSON.stringify(result)}\n`,
    });

    const promptBytes = Buffer.byteLength(renderDoctorPrompt(result), "utf8");
    const bounded = boundDoctorOutput(result, "prompt", promptBytes - 1);
    expect(Buffer.byteLength(bounded.output, "utf8")).toBeLessThanOrEqual(
      promptBytes - 1,
    );
    expect(bounded.result).toMatchObject({
      status: "incomplete",
      reason_code: "SCAN_RESULT_BYTES_LIMIT",
      coverage: { operational_reasons: ["SCAN_RESULT_BYTES_LIMIT"] },
    });

    expect(() => boundDoctorOutput(result, "prompt", 1)).toThrow(
      "The configured canonical result limit is too small.",
    );
  });
});
