import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  buildSaltWorkflowFollowupReport,
  SALT_WORKFLOW_FOLLOWUP_REPORT_CONTRACT,
  validateSaltWorkflowFollowupReport,
} from "../workflowFollowupReports.js";
import { SALT_REVIEW_REPORT_VALIDATION_CONTRACT } from "../reviewReportValidation.js";
import type { SaltReviewReportValidationResult } from "../reviewReportValidation.js";
import type { SaltRegistry } from "../types.js";

const GENERATED_AT = "2026-04-30T00:00:00.000Z";

function buildFixtureRegistry(): SaltRegistry {
  return {
    generated_at: GENERATED_AT,
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: [],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
    token_policy_structural_role_rule_pack: null,
    pattern_validation_rule_pack: null,
  };
}

function readJsonSchema(name: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(new URL(`../../schemas/${name}`, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

function validateWorkflowFollowupReportSchema(value: unknown): string[] {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  ajv.addSchema(readJsonSchema("salt-evidence-ref.schema.json"));
  ajv.addSchema(readJsonSchema("salt-generated-artifact.schema.json"));
  ajv.addSchema(
    readJsonSchema("salt-generated-artifact-release-gate.schema.json"),
  );
  const validate = ajv.compile(
    readJsonSchema("salt-workflow-followup-report.schema.json"),
  );

  return validate(value)
    ? []
    : (validate.errors ?? []).map(
        (error) => `${error.instancePath || "/"} ${error.message ?? "failed"}`,
      );
}

function buildFixtureReviewReportValidation(
  overrides: Partial<SaltReviewReportValidationResult> = {},
): SaltReviewReportValidationResult {
  const status = overrides.status ?? "current";
  const current = overrides.current ?? status === "current";
  const supported = overrides.supported ?? status === "current";
  const reportPath =
    overrides.report_path ?? "fixture-post-action-review-report.json";
  const resumeStatus =
    status === "current" ? "ready" : status;

  return {
    contract: SALT_REVIEW_REPORT_VALIDATION_CONTRACT,
    status,
    current,
    supported,
    report_path: reportPath,
    registry: overrides.registry ?? {
      version: "fixture-registry",
      hash: "sha256:fixture-review",
      generated_at: GENERATED_AT,
      current_version: "fixture-registry",
      current_hash: "sha256:fixture-review",
      current_generated_at: GENERATED_AT,
    },
    validation_issues: overrides.validation_issues ?? [],
    unsupported_claim_count: overrides.unsupported_claim_count ?? 0,
    mismatches: overrides.mismatches ?? [],
    missing: overrides.missing ?? [],
    resume: overrides.resume ?? {
      contract: "salt_review_resume_v1",
      status: resumeStatus,
      report_path: reportPath,
      reusable_evidence_ref_ids: current ? ["fixture-review.evidence"] : [],
      unsupported_claim_ids: [],
      next_command: `salt-ds review --validate ${reportPath} --json`,
      missing: overrides.missing ?? [],
    },
  };
}

describe("workflow follow-up reports", () => {
  it("serializes migration follow-up evidence and keeps review follow-up degraded", () => {
    const registry = buildFixtureRegistry();
    const report = buildSaltWorkflowFollowupReport({
      registry,
      generated_at: GENERATED_AT,
      generator: {
        name: "semantic-core fixture",
      },
      workflow: "migration",
      transport_used: "cli",
      workflow_input: {
        request: "Fixture-only migration request.",
        source_outline_path: "fixture-outline.json",
      },
      followup: {
        verification_check_count: 4,
      },
    });

    expect(validateWorkflowFollowupReportSchema(report)).toEqual([]);
    expect(report).toEqual(
      expect.objectContaining({
        contract: SALT_WORKFLOW_FOLLOWUP_REPORT_CONTRACT,
        status: "degraded",
        source: expect.objectContaining({
          request_provided: true,
          evidence_ref_ids: expect.arrayContaining([
            "migration.workflow-input.request",
          ]),
        }),
        review_evidence: null,
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            id: "migration.workflow-input.request",
            source_kind: "workflow_input",
            claim_kind: "workflow",
          }),
        ]),
        unsupported_claims: [
          expect.objectContaining({
            id: "migration.followup.review-report.unsupported",
            kind: "workflow",
          }),
        ],
        release_gate: expect.objectContaining({
          status: "blocked",
          releasable: false,
          unsupported_claim_count: 1,
        }),
        generated_artifact: expect.objectContaining({
          artifact_kind: "validation-report",
          claims: expect.arrayContaining([
            expect.objectContaining({
              id: "migration.followup.workflow-input",
              evidence_ref_ids: ["migration.workflow-input.request"],
            }),
          ]),
        }),
      }),
    );
    expect(report.docs_registry_gaps).toEqual([]);
    expect(
      validateSaltWorkflowFollowupReport({
        report,
        registry,
        report_path: "fixture-migration.json",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "unsupported",
        current: false,
        supported: false,
        unsupported_claim_count: 1,
        validation_issues: [],
      }),
    );
  });

  it("serializes upgrade target evidence from package metadata and workflow input", () => {
    const registry = buildFixtureRegistry();
    const report = buildSaltWorkflowFollowupReport({
      registry,
      generated_at: GENERATED_AT,
      generator: {
        name: "semantic-core fixture",
      },
      workflow: "upgrade",
      transport_used: "cli",
      target: {
        package_name: "@fixture/salt-package",
        package_name_source: "package",
        component_name: "FixtureComponent",
        from_version: "1.0.0",
        from_version_source: "workflow_input",
        to_version: "2.0.0",
      },
      followup: {},
    });

    expect(validateWorkflowFollowupReportSchema(report)).toEqual([]);
    expect(report).toEqual(
      expect.objectContaining({
        status: "degraded",
        target: expect.objectContaining({
          package_name: "@fixture/salt-package",
          component_name: "FixtureComponent",
          evidence_ref_ids: expect.arrayContaining([
            "upgrade.package.target",
            "upgrade.workflow-input.component-name",
            "upgrade.workflow-input.from-version",
            "upgrade.workflow-input.to-version",
          ]),
        }),
        review_evidence: null,
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            id: "upgrade.package.target",
            source_kind: "package",
            claim_kind: "package",
          }),
          expect.objectContaining({
            id: "upgrade.workflow-input.component-name",
            source_kind: "workflow_input",
            claim_kind: "component",
          }),
        ]),
        unsupported_claims: [
          expect.objectContaining({
            id: "upgrade.followup.review-report.unsupported",
          }),
        ],
      }),
    );
    expect(
      validateSaltWorkflowFollowupReport({
        report,
        registry,
        report_path: "fixture-upgrade.json",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "unsupported",
        validation_issues: [],
        unsupported_claim_count: 1,
      }),
    );
  });

  it("can validate a fully evidenced follow-up report as current", () => {
    const registry = buildFixtureRegistry();
    const report = buildSaltWorkflowFollowupReport({
      registry,
      generated_at: GENERATED_AT,
      generator: {
        name: "semantic-core fixture",
      },
      workflow: "migration",
      transport_used: "cli",
      workflow_input: {
        request: "Fixture-only migration request.",
      },
      followup: {
        verification_check_count: 2,
        review_report_validation: buildFixtureReviewReportValidation({
          report_path: "fixture-post-migration-review-report.json",
        }),
      },
    });

    expect(validateWorkflowFollowupReportSchema(report)).toEqual([]);
    expect(report.status).toBe("ready");
    expect(report.review_evidence).toEqual(
      expect.objectContaining({
        report_path: "fixture-post-migration-review-report.json",
        validation_status: "current",
        current: true,
        supported: true,
        evidence_ref_ids: ["migration.review-report.validation"],
        reusable_evidence_ref_ids: ["fixture-review.evidence"],
      }),
    );
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "migration_review_followup",
          status: "passed",
          evidence_ref_ids: ["migration.review-report.validation"],
        }),
      ]),
    );
    expect(report.release_gate).toEqual(
      expect.objectContaining({
        status: "passed",
        releasable: true,
        unsupported_claim_count: 0,
      }),
    );
    expect(
      validateSaltWorkflowFollowupReport({
        report,
        registry,
        report_path: "fixture-migration.json",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "current",
        current: true,
        supported: true,
        missing: [],
      }),
    );
  });

  it("marks stale attached review evidence as unsupported", () => {
    const registry = buildFixtureRegistry();
    const report = buildSaltWorkflowFollowupReport({
      registry,
      generated_at: GENERATED_AT,
      generator: {
        name: "semantic-core fixture",
      },
      workflow: "upgrade",
      transport_used: "cli",
      target: {
        package_name: "@fixture/salt-package",
        package_name_source: "package",
        from_version: "1.0.0",
        from_version_source: "package",
      },
      followup: {
        review_report_validation: buildFixtureReviewReportValidation({
          status: "stale",
          current: false,
          supported: true,
          mismatches: ["registry"],
          report_path: "fixture-stale-post-upgrade-review-report.json",
        }),
      },
    });

    expect(validateWorkflowFollowupReportSchema(report)).toEqual([]);
    expect(report.status).toBe("unsupported");
    expect(report.review_evidence).toEqual(
      expect.objectContaining({
        report_path: "fixture-stale-post-upgrade-review-report.json",
        validation_status: "stale",
        current: false,
        supported: true,
        evidence_ref_ids: ["upgrade.review-report.validation"],
        missing: expect.arrayContaining([
          "current post-upgrade review report evidence",
        ]),
      }),
    );
    expect(report.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "upgrade_review_followup",
          status: "unsupported",
          evidence_ref_ids: ["upgrade.review-report.validation"],
        }),
      ]),
    );
    expect(report.unsupported_claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "upgrade.followup.review-report.validation.unsupported",
        }),
      ]),
    );
    expect(
      validateSaltWorkflowFollowupReport({
        report,
        registry,
        report_path: "fixture-upgrade.json",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "unsupported",
        current: false,
        supported: false,
        missing: expect.arrayContaining([
          "current post-upgrade review report evidence",
        ]),
      }),
    );
  });

  it("fails when an unsupported follow-up shell smuggles fixture Salt claims", () => {
    const report = buildSaltWorkflowFollowupReport({
      registry: buildFixtureRegistry(),
      generated_at: GENERATED_AT,
      generator: {
        name: "semantic-core fixture",
      },
      workflow: "migration",
      transport_used: "cli",
      workflow_input: {
        request: "Fixture-only migration request.",
      },
      followup: {
        verification_check_count: 1,
      },
    });

    expect(
      validateWorkflowFollowupReportSchema({
        ...report,
        generated_artifact: {
          ...report.generated_artifact,
          claims: [
            {
              id: "fixture-status",
              kind: "status",
              text: "Fixture status claim without evidence.",
              field_path: "fixture.status",
              evidence_ref_ids: [],
            },
          ],
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must NOT have fewer than 1 items"),
      ]),
    );
  });

  it.each([
    ["prop", "component", "props.fixture"],
    ["token", "token", "name"],
    ["import", "component", "implementation_requirements.required_imports.Fixture"],
    ["example", "example", "code"],
    ["status", "component", "status"],
    ["accessibility", "component", "accessibility.summary"],
  ] as const)(
    "fails validation when a follow-up report emits an undocumented fixture %s claim",
    (claimKind, entityType, fieldPath) => {
      const registry = buildFixtureRegistry();
      const report = buildSaltWorkflowFollowupReport({
        registry,
        generated_at: GENERATED_AT,
        generator: {
          name: "semantic-core fixture",
        },
        workflow: "upgrade",
        transport_used: "cli",
        target: {
          package_name: "@fixture/salt-package",
          from_version: "1.0.0",
        },
        followup: {},
      });
      const evidenceRefId = `fixture-undocumented-${claimKind}`;
      const validation = validateSaltWorkflowFollowupReport({
        report: {
          ...report,
          generated_artifact: {
            ...report.generated_artifact,
            claims: [
              ...report.generated_artifact.claims,
              {
                id: `fixture-undocumented-${claimKind}`,
                kind: claimKind,
                text: `Fixture-only undocumented ${claimKind} claim.`,
                field_path: `fixture.${claimKind}`,
                evidence_ref_ids: [evidenceRefId],
              },
            ],
            evidence_refs: [
              ...report.generated_artifact.evidence_refs,
              {
                contract: "salt_evidence_ref_v1",
                id: evidenceRefId,
                source_kind: "registry",
                claim_kind: claimKind,
                registry: {
                  entity_type: entityType,
                  entity_id: `missing-${claimKind}`,
                  field_path: fieldPath,
                },
                source: {
                  repo_path: "fixtures/undocumented.tsx",
                },
                confidence: "high",
              },
            ],
          },
        },
        registry,
        report_path: "fixture-upgrade.json",
      });

      expect(validation.status).toBe("unsupported");
      expect(validation.validation_issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_entity",
          }),
        ]),
      );
    },
  );
});
