import {
  type ComponentRecord,
  type PublicContract,
  type ReviewSaltUiResult,
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceRef,
  type SaltRegistry,
  type ValidationIssue,
} from "@salt-ds/semantic-core";
import { describe, expect, it } from "vitest";
import { validateSaltReviewReportSchema } from "../../../semantic-core/src/__tests__/reviewReportSchemaTestUtils.js";
import { withAnalyzeWorkflowGuidance } from "../server/workflowOutputs.js";

type FixtureValidationIssue = ValidationIssue & Record<string, unknown>;

// Fixture-only registry facts: these records are synthetic and exist only to
// prove MCP report output rejects claims that the fixture registry cannot back.
function buildFixtureComponent(): ComponentRecord {
  return {
    id: "fixture-action",
    name: "FixtureAction",
    aliases: [],
    package: {
      name: "@salt-ds/fixture",
      status: "stable",
      since: null,
    },
    summary: "Fixture source-backed action component.",
    status: "stable",
    category: ["fixture"],
    tags: [],
    when_to_use: [],
    when_not_to_use: [],
    alternatives: [],
    props: [
      {
        name: "fixtureProp",
        type: "string",
        required: false,
        description: "Fixture prop sourced from registry.",
        deprecated: false,
      },
    ],
    accessibility: {
      summary: [],
      rules: [],
    },
    patterns: [],
    examples: [],
    related_docs: {
      overview: "https://example.test/salt/fixture-action",
      usage: null,
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: "packages/fixture/src/FixtureAction.tsx",
      export_name: "FixtureAction",
    },
    deprecations: [],
    last_verified_at: "2026-04-30T00:00:00.000Z",
  };
}

function buildFixtureRegistry(): SaltRegistry {
  return {
    generated_at: "2026-04-30T00:00:00.000Z",
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: [buildFixtureComponent()],
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
  };
}

function buildPropEvidenceRef(
  fieldPath = "props.fixtureProp",
): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `fixture-action.${fieldPath}.review-ref`,
    source_kind: "registry",
    claim_kind: "prop",
    confidence: "high",
    registry: {
      entity_type: "component",
      entity_id: "fixture-action",
      entity_name: "FixtureAction",
      field_path: fieldPath,
      registry_version: "fixture-registry",
    },
    source: {
      repo_path: "packages/fixture/src/FixtureAction.tsx",
    },
  };
}

function buildStatusEvidenceRef(fieldPath = "status"): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `fixture-action.${fieldPath}.review-ref`,
    source_kind: "registry",
    claim_kind: "status",
    confidence: "high",
    registry: {
      entity_type: "component",
      entity_id: "fixture-action",
      entity_name: "FixtureAction",
      field_path: fieldPath,
      registry_version: "fixture-registry",
    },
    source: {
      repo_path: "packages/fixture/src/FixtureAction.tsx",
    },
  };
}

function buildAccessibilityEvidenceRef(
  fieldPath = "accessibility.summary.0",
): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `fixture-action.${fieldPath}.review-ref`,
    source_kind: "registry",
    claim_kind: "accessibility",
    confidence: "high",
    registry: {
      entity_type: "component",
      entity_id: "fixture-action",
      entity_name: "FixtureAction",
      field_path: fieldPath,
      registry_version: "fixture-registry",
    },
    source: null,
  };
}

function buildValidationIssue(
  evidenceRefs: SaltEvidenceRef[],
  category = "primitive-choice",
): FixtureValidationIssue {
  return {
    id: "fixture.review",
    category,
    rule: "fixture-review",
    severity: "warning",
    title: "Fixture review finding",
    message: "Fixture review finding message.",
    evidence: ["Fixture validation evidence."],
    canonical_source: null,
    suggested_fix: null,
    confidence: 0.9,
    source_urls: [],
    evidence_refs: evidenceRefs,
    matches: 1,
  } as FixtureValidationIssue;
}

function buildReviewResult(issue: FixtureValidationIssue): ReviewSaltUiResult {
  return {
    guidance_boundary: {
      guidance_source: "canonical_salt",
      scope: "official_salt_only",
      project_conventions: {
        supported: true,
        contract: "project_conventions_v1",
        check_recommended: false,
        reason: "Fixture review does not use project conventions.",
        topics: [],
      },
    },
    decision: {
      status: "needs_attention",
      why: "Fixture review found one issue.",
    },
    summary: {
      errors: 0,
      warnings: 1,
      infos: 0,
      fix_count: 0,
      migration_count: 0,
    },
    issues: [issue],
    missing_data: [],
    source_urls: [],
  };
}

function readReviewReport(output: unknown): Record<string, unknown> {
  const contract = output as PublicContract & {
    details?: {
      artifacts?: {
        review_report?: Record<string, unknown>;
      };
    };
  };
  const report = contract.details?.artifacts?.review_report;

  expect(report).toEqual(expect.any(Object));
  return report as Record<string, unknown>;
}

function expectEvidenceValidationMirrorsSurfaceGate(
  report: Record<string, unknown>,
): void {
  const surfaceGate = report.surface_gate as Record<string, unknown>;

  expect(surfaceGate).toEqual(expect.any(Object));
  expect(report.evidence_validation).toEqual({
    status: surfaceGate.status,
    issues: surfaceGate.validation_issues,
    missing: surfaceGate.missing,
    unsupported_claim_count: surfaceGate.unsupported_claim_count,
  });
}

describe("MCP review report workflow output", () => {
  it("includes a source-backed durable report in full review output", () => {
    const output = withAnalyzeWorkflowGuidance(
      buildFixtureRegistry(),
      buildReviewResult(buildValidationIssue([buildPropEvidenceRef()])),
      {
        code: '<FixtureAction fixtureProp="yes" />',
        root_dir: "/fixture",
        view: "full",
      },
    );
    const report = readReviewReport(output);

    expect(validateSaltReviewReportSchema(report)).toEqual([]);
    expect(report).toEqual(
      expect.objectContaining({
        contract: "salt_review_report_v1",
        status: "needs_attention",
        registry: expect.objectContaining({
          hash: expect.stringMatching(/^sha256:/),
        }),
        workflow: expect.objectContaining({
          id: "review",
          transport_used: "mcp",
        }),
        surface_gate: expect.objectContaining({
          status: "validated",
          validation_issues: [],
          unsupported_claim_count: 0,
          artifact_id: "review-report.validation",
          artifact_kind: "review-report",
        }),
        evidence_validation: expect.objectContaining({
          status: "validated",
          issues: [],
          unsupported_claim_count: 0,
        }),
      }),
    );
    expectEvidenceValidationMirrorsSurfaceGate(report);
    expect(report.findings).toEqual([
      expect.objectContaining({
        id: "fixture.review",
        status: "source_backed",
        evidence_ref_ids: ["fixture-action.props.fixtureProp.review-ref"],
      }),
    ]);
  });

  it("degrades MCP durable reports for undocumented fixture props", () => {
    const output = withAnalyzeWorkflowGuidance(
      buildFixtureRegistry(),
      buildReviewResult(
        buildValidationIssue([buildPropEvidenceRef("props.missing")]),
      ),
      {
        code: '<FixtureAction missing="yes" />',
        root_dir: "/fixture",
        view: "full",
      },
    );
    const report = readReviewReport(output);

    expect(validateSaltReviewReportSchema(report)).toEqual([]);
    expect(report.status).toBe("unsupported");
    expect(report.registry).toEqual(
      expect.objectContaining({
        hash: expect.stringMatching(/^sha256:/),
      }),
    );
    expect(report.surface_gate).toEqual(
      expect.objectContaining({
        status: "unsupported",
        validation_issues: [
          expect.objectContaining({
            code: "missing_registry_field",
            path: "evidence_refs[0].registry.field_path",
          }),
        ],
        artifact_id: "review-report.validation",
        artifact_kind: "review-report",
      }),
    );
    expect(report.evidence_validation).toEqual(
      expect.objectContaining({
        status: "unsupported",
        issues: [
          expect.objectContaining({
            code: "missing_registry_field",
            path: "evidence_refs[0].registry.field_path",
          }),
        ],
      }),
    );
    expectEvidenceValidationMirrorsSurfaceGate(report);
    expect(report.gates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "report_evidence_validation",
          status: "unsupported",
        }),
      ]),
    );
  });

  it("degrades MCP durable reports for undocumented fixture status claims", () => {
    const output = withAnalyzeWorkflowGuidance(
      buildFixtureRegistry(),
      buildReviewResult(
        buildValidationIssue(
          [buildStatusEvidenceRef("status.undocumented")],
          "catalog-status",
        ),
      ),
      {
        code: '<FixtureAction fixtureProp="yes" />',
        root_dir: "/fixture",
        view: "full",
      },
    );
    const report = readReviewReport(output);

    expect(validateSaltReviewReportSchema(report)).toEqual([]);
    expect(report.status).toBe("unsupported");
    expect(report.surface_gate).toEqual(
      expect.objectContaining({
        status: "unsupported",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_field",
            path: "evidence_refs[0].registry.field_path",
          }),
        ]),
      }),
    );
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: "source_backed",
          evidence_ref_ids: ["fixture-action.status.undocumented.review-ref"],
        }),
      ]),
    );
  });

  it("degrades MCP durable reports for undocumented fixture accessibility claims", () => {
    const output = withAnalyzeWorkflowGuidance(
      buildFixtureRegistry(),
      buildReviewResult(
        buildValidationIssue(
          [buildAccessibilityEvidenceRef()],
          "accessibility",
        ),
      ),
      {
        code: '<FixtureAction fixtureProp="yes" />',
        root_dir: "/fixture",
        view: "full",
      },
    );
    const report = readReviewReport(output);

    expect(validateSaltReviewReportSchema(report)).toEqual([]);
    expect(report.status).toBe("unsupported");
    expect(report.surface_gate).toEqual(
      expect.objectContaining({
        status: "unsupported",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_field",
            path: "evidence_refs[0].registry.field_path",
          }),
          expect.objectContaining({
            code: "missing_source_locator",
            path: "evidence_refs[0].source",
          }),
        ]),
      }),
    );
  });

  it("degrades compact MCP review output when fixture report evidence is unsupported", () => {
    const output = withAnalyzeWorkflowGuidance(
      buildFixtureRegistry(),
      buildReviewResult(
        buildValidationIssue([buildPropEvidenceRef("props.missing")]),
      ),
      {
        code: '<FixtureAction missing="yes" />',
        root_dir: "/fixture",
        view: "compact",
      },
    ) as PublicContract;

    expect(output).toEqual(
      expect.objectContaining({
        contract: "salt_workflow_v1",
        workflow: "review",
        evidence: expect.objectContaining({
          status: "missing",
          surface_gate: expect.objectContaining({
            status: "unsupported",
            artifact_kind: "review-report",
          }),
          unsupported_claim_count: expect.any(Number),
          validation_issue_count: expect.any(Number),
          missing: expect.arrayContaining([
            expect.stringContaining("missing_registry_field"),
          ]),
        }),
      }),
    );
    expect(output).not.toHaveProperty("details");
  });

  it("rejects MCP review report shape drift against the shared schema", () => {
    const output = withAnalyzeWorkflowGuidance(
      buildFixtureRegistry(),
      buildReviewResult(buildValidationIssue([buildPropEvidenceRef()])),
      {
        code: '<FixtureAction fixtureProp="yes" />',
        root_dir: "/fixture",
        view: "full",
      },
    );
    const report = readReviewReport(output);
    const reportWithoutSurfaceGate = { ...report };
    delete reportWithoutSurfaceGate.surface_gate;

    expect(
      validateSaltReviewReportSchema({
        ...report,
        undocumented_report_field: true,
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must NOT have additional properties"),
      ]),
    );
    expect(validateSaltReviewReportSchema(reportWithoutSurfaceGate)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must have required property 'surface_gate'"),
      ]),
    );
  });
});
