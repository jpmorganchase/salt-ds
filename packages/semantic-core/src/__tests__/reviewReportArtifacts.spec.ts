import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
  type SaltEvidenceRegistryEntityType,
} from "../evidence.js";
import { validateGeneratedSaltArtifactSurface } from "../generatedArtifactSurface.js";
import { validateGeneratedArtifactRegistryEvidence } from "../generatedArtifactValidation.js";
import { buildReviewReportArtifact } from "../reviewReportArtifacts.js";
import {
  buildSaltReviewReport,
  SALT_REVIEW_REPORT_CONTRACT,
} from "../reviewReports.js";
import { validateSaltReviewReportSchema } from "./reviewReportSchemaTestUtils.js";
import {
  buildTokenPolicyStructuralRoleRulePack,
  type SaltTokenPolicyStructuralRoleRulePack,
} from "../tokenPolicyStructuralRoleRules.js";
import type { ReviewSaltUiResult } from "../tools/reviewSaltUi.js";
import type { ValidationIssue } from "../tools/validation/shared.js";
import type { ReviewSaltUiWorkflowContract } from "../tools/workflowContracts.js";
import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
  TokenRecord,
} from "../types.js";

type FixtureValidationIssue = ValidationIssue & Record<string, unknown>;

// Report tests use fixture-only registry facts; no production Salt facts live here.
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

function buildFixturePattern(): PatternRecord {
  return {
    id: "fixture-workflow",
    name: "FixtureWorkflow",
    aliases: [],
    summary: "Fixture source-backed workflow pattern.",
    status: "stable",
    category: ["fixture"],
    when_to_use: [],
    when_not_to_use: [],
    composed_of: [
      {
        component: "FixtureAction",
        role: "fixture action",
      },
    ],
    related_patterns: [],
    how_to_build: [],
    how_it_works: [],
    accessibility: {
      summary: [],
    },
    resources: [],
    examples: [],
    related_docs: {
      overview: "https://example.test/salt/fixture-workflow",
    },
    last_verified_at: "2026-04-30T00:00:00.000Z",
  };
}

function buildFixtureRegistry(input: {
  component?: ComponentRecord;
  patterns?: PatternRecord[];
} = {}): SaltRegistry {
  return {
    generated_at: "2026-04-30T00:00:00.000Z",
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: [input.component ?? buildFixtureComponent()],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: input.patterns ?? [],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
  };
}

function buildFixtureStructuralRoleToken(): TokenRecord {
  return {
    name: "--salt-fixture-primary-background",
    category: "fixture",
    type: "color",
    value: "#000000",
    semantic_intent: "Fixture token for structural-role report tests.",
    themes: [],
    densities: [],
    applies_to: [],
    guidance: [],
    aliases: [],
    policy: {
      usage_tier: "foundation",
      direct_component_use: "conditional",
      preferred_for: [],
      avoid_for: [],
      notes: [],
      docs: ["https://example.test/fixture/token-rules"],
      structural_roles: ["fixture-background"],
      pairing: null,
    },
    deprecated: false,
    last_verified_at: "2026-04-30T00:00:00.000Z",
  };
}

function buildFixtureStructuralRoleRulePack(): SaltTokenPolicyStructuralRoleRulePack {
  return buildTokenPolicyStructuralRoleRulePack({
    structural_role_rules: [
      {
        id: "/fixture/docs/token-rules#fixture-pairing",
        category: "fixture",
        kind: "container-pairing",
        source: {
          route: "/fixture/docs/token-rules",
          repo_path: "fixture/docs/token-rules.mdx",
        },
        evidence_text:
          "Fixture role source says fixture backgrounds and fixture border colors are paired.",
        evidence_terms: ["fixture"],
        token_family: "fixture",
      },
    ],
    generated_at: "2026-04-30T00:00:00.000Z",
    generator: {
      name: "semantic-core review report fixture",
    },
    registry: {
      version: "fixture-registry",
    },
  });
}

function buildFixtureTokenRegistry(input: {
  tokenPolicyStructuralRoleRulePack?: SaltTokenPolicyStructuralRoleRulePack | null;
}): SaltRegistry {
  return {
    ...buildFixtureRegistry(),
    components: [],
    tokens: [buildFixtureStructuralRoleToken()],
    token_policy_structural_role_rule_pack:
      input.tokenPolicyStructuralRoleRulePack ?? null,
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
    registry: {
      entity_type: "component",
      entity_id: "fixture-action",
      entity_name: "FixtureAction",
      field_path: fieldPath,
      registry_version: "fixture-registry",
    },
    source: {
      url: "https://example.test/salt/fixture-action",
      repo_path: "packages/fixture/src/FixtureAction.tsx",
    },
    confidence: "high",
    verified_at: "2026-04-30T00:00:00.000Z",
  };
}

function buildFixtureEvidenceRef(input: {
  id: string;
  claimKind: SaltEvidenceClaimKind;
  entityType: SaltEvidenceRegistryEntityType;
  entityId: string;
  entityName: string;
  fieldPath: string;
  source?: SaltEvidenceRef["source"];
}): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: input.id,
    source_kind: "registry",
    claim_kind: input.claimKind,
    registry: {
      entity_type: input.entityType,
      entity_id: input.entityId,
      entity_name: input.entityName,
      field_path: input.fieldPath,
      registry_version: "fixture-registry",
    },
    source: input.source ?? {
      url: "https://example.test/salt/fixture-action",
      repo_path: "packages/fixture/src/FixtureAction.tsx",
    },
    confidence: "high",
    verified_at: "2026-04-30T00:00:00.000Z",
  };
}

function buildValidationIssue(
  evidenceRefs: SaltEvidenceRef[] | undefined,
): FixtureValidationIssue {
  return {
    id: "fixture.review.issue",
    category: "composition",
    rule: "fixture-review-rule",
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

function buildTokenStructuralRoleEvidenceRef(): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: "fixture-token.structural-role.review-ref",
    source_kind: "registry",
    claim_kind: "token",
    registry: {
      entity_type: "token",
      entity_id: "--salt-fixture-primary-background",
      entity_name: "--salt-fixture-primary-background",
      field_path: "policy.structural_roles.0",
      registry_version: "fixture-registry",
    },
    source: {
      url: "https://example.test/fixture/token-rules",
    },
    confidence: "high",
    verified_at: "2026-04-30T00:00:00.000Z",
  };
}

function buildFixtureReviewResult(input: {
  issues: FixtureValidationIssue[];
  missing_data?: string[];
}): ReviewSaltUiResult {
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
      status: input.issues.length > 0 ? "needs_attention" : "clean",
      why:
        input.issues[0]?.message ??
        "Fixture review did not record source findings.",
    },
    summary: {
      errors: 0,
      warnings: input.issues.length,
      infos: 0,
      fix_count: 0,
      migration_count: 0,
    },
    fixes: [],
    issues: input.issues,
    migrations: [],
    missing_data: input.missing_data ?? [],
    source_urls: input.issues.flatMap((issue) => issue.source_urls),
  };
}

function buildFixtureReviewContract(
  result: ReviewSaltUiResult,
): ReviewSaltUiWorkflowContract {
  return {
    confidence: {
      level: "high",
      reasons: ["Fixture review report confidence."],
      ask_before_proceeding: false,
      raise_confidence: [],
    },
    ide_summary: {
      verdict: {
        level: result.decision.status === "clean" ? "clean" : "medium_risk",
        summary: result.decision.why,
      },
      top_findings: [],
      safest_next_fix: null,
      verify: [],
      top_source_urls: result.source_urls,
    },
    decision: result.decision,
    fix_candidates: {
      total_count: 0,
      deterministic_count: 0,
      manual_review_count: 0,
      candidates: [],
      notes: [],
    },
    issue_classes: [],
    project_conventions_check: {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: false,
      topics: [],
      reason: "Fixture review does not use project conventions.",
      canonical_only: true,
      declared_policy_status: "none-declared",
      policy_paths: [".salt/team.json", ".salt/stack.json"],
      suggested_follow_up_tool: "get_salt_project_context",
      suggested_follow_up_cli: "salt-ds info --json",
      next_step: "Continue with fixture review validation.",
    },
    rule_ids: [],
    provenance: {
      canonical_source_urls: result.source_urls,
      related_guide_urls: [],
      starter_source_urls: [],
      source_urls: result.source_urls,
      guidance_signals: [],
      project_conventions_contract: "project_conventions_v1",
    },
  };
}

function expectEvidenceValidationMirrorsSurfaceGate(
  report: ReturnType<typeof buildSaltReviewReport>,
): void {
  expect(report.evidence_validation).toEqual({
    status: report.surface_gate.status,
    issues: report.surface_gate.validation_issues,
    missing: report.surface_gate.missing,
    unsupported_claim_count: report.surface_gate.unsupported_claim_count,
  });
}

describe("review report artifacts", () => {
  it("turns source-backed validation issues into review-report claims", () => {
    const artifact = buildReviewReportArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      issues: [buildValidationIssue([buildPropEvidenceRef()])],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core review report fixture",
      },
    });

    expect(
      validateGeneratedArtifactRegistryEvidence(
        artifact,
        buildFixtureRegistry(),
      ),
    ).toEqual([]);
    expect(
      validateGeneratedSaltArtifactSurface({
        artifact,
        registry: buildFixtureRegistry(),
        artifact_label: "review report",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "validated",
        validation_issues: [],
        unsupported_claim_count: 0,
        missing: [],
      }),
    );
    expect(artifact.claims).toEqual([
      expect.objectContaining({
        kind: "prop",
        evidence_ref_ids: ["fixture-action.props.fixtureProp.review-ref"],
      }),
    ]);
  });

  it("records missing validation provenance as unsupported report state", () => {
    const artifact = buildReviewReportArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      issues: [buildValidationIssue(undefined)],
      missing_data: ["Fixture rule pack evidence is missing."],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core review report fixture",
      },
    });

    expect(artifact.claims).toEqual([]);
    expect(artifact.unsupported_claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field_path: "issues.fixture.review.issue",
          reason:
            "Validation issue did not include structured EvidenceRef provenance.",
        }),
        expect.objectContaining({
          field_path: "missing_data.0",
          reason:
            "The review recorded missing data instead of emitting a source-backed Salt claim.",
        }),
      ]),
    );
  });

  it("fails report validation when a finding points at an undocumented prop", () => {
    const artifact = buildReviewReportArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      issues: [buildValidationIssue([buildPropEvidenceRef("props.missing")])],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core review report fixture",
      },
    });

    expect(
      validateGeneratedArtifactRegistryEvidence(
        artifact,
        buildFixtureRegistry(),
      ),
    ).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("requires report token structural-role claims to resolve through the registry rule pack", () => {
    const rulePack = buildFixtureStructuralRoleRulePack();
    const artifact = buildReviewReportArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      issues: [buildValidationIssue([buildTokenStructuralRoleEvidenceRef()])],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core review report fixture",
      },
    });

    expect(
      validateGeneratedArtifactRegistryEvidence(
        artifact,
        buildFixtureTokenRegistry({
          tokenPolicyStructuralRoleRulePack: rulePack,
        }),
      ),
    ).toEqual([]);
    expect(
      validateGeneratedArtifactRegistryEvidence(
        artifact,
        buildFixtureTokenRegistry({}),
      ),
    ).toEqual([
      expect.objectContaining({
        code: "missing_structural_role_rule_evidence",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("builds a source-backed durable review report from EvidenceRefs", () => {
    const review = buildFixtureReviewResult({
      issues: [buildValidationIssue([buildPropEvidenceRef()])],
    });
    const report = buildSaltReviewReport({
      registry: buildFixtureRegistry(),
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core review report fixture",
      },
      transport_used: "cli",
      review,
      contract: buildFixtureReviewContract(review),
      scope: {
        root_dir: "/fixture",
        targets: ["src"],
        file_count: 1,
        files: [
          {
            path: "/fixture/src/App.tsx",
            relative_path: "src/App.tsx",
            status: "needs_attention",
            errors: 0,
            warnings: 1,
            infos: 0,
          },
        ],
      },
    });

    expect(validateSaltReviewReportSchema(report)).toEqual([]);
    expect(report).toEqual(
      expect.objectContaining({
        contract: SALT_REVIEW_REPORT_CONTRACT,
        status: "needs_attention",
        surface_gate: expect.objectContaining({
          status: "validated",
          validation_issues: [],
          unsupported_claim_count: 0,
          artifact_id: "review-report.validation",
          artifact_kind: "review-report",
        }),
        release_gate: expect.objectContaining({
          status: "passed",
          releasable: true,
          artifact_id: "review-report.validation",
          artifact_kind: "review-report",
          target_kind: "review-report",
        }),
        evidence_validation: expect.objectContaining({
          status: "validated",
          issues: [],
          unsupported_claim_count: 0,
        }),
        findings: [
          expect.objectContaining({
            status: "source_backed",
            evidence_ref_ids: ["fixture-action.props.fixtureProp.review-ref"],
          }),
        ],
      }),
    );
    expectEvidenceValidationMirrorsSurfaceGate(report);
  });

  it("keeps CLI and MCP durable report evidence on the same semantic-core serializer", () => {
    const review = buildFixtureReviewResult({
      issues: [buildValidationIssue([buildPropEvidenceRef()])],
    });
    const baseInput = {
      registry: buildFixtureRegistry(),
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core review report fixture",
      },
      review,
      contract: buildFixtureReviewContract(review),
      scope: {
        root_dir: "/fixture",
        targets: ["src"],
        file_count: 1,
        files: [
          {
            path: "/fixture/src/App.tsx",
            relative_path: "src/App.tsx",
            status: "needs_attention" as const,
            errors: 0,
            warnings: 1,
            infos: 0,
          },
        ],
      },
    };
    const cliReport = buildSaltReviewReport({
      ...baseInput,
      transport_used: "cli",
    });
    const mcpReport = buildSaltReviewReport({
      ...baseInput,
      transport_used: "mcp",
    });

    expect(cliReport.workflow.transport_used).toBe("cli");
    expect(mcpReport.workflow.transport_used).toBe("mcp");
    expect(cliReport.surface_gate).toEqual(mcpReport.surface_gate);
    expect(cliReport.evidence_validation).toEqual(
      mcpReport.evidence_validation,
    );
    expect(cliReport.generated_artifact).toEqual(mcpReport.generated_artifact);
    expect(cliReport.findings).toEqual(mcpReport.findings);
  });

  it("degrades a durable review report when a finding points at an undocumented prop", () => {
    const review = buildFixtureReviewResult({
      issues: [buildValidationIssue([buildPropEvidenceRef("props.missing")])],
    });
    const report = buildSaltReviewReport({
      registry: buildFixtureRegistry(),
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core review report fixture",
      },
      transport_used: "cli",
      review,
      contract: buildFixtureReviewContract(review),
      scope: {
        root_dir: "/fixture",
        targets: ["src"],
        file_count: 1,
        files: [
          {
            path: "/fixture/src/App.tsx",
            relative_path: "src/App.tsx",
            status: "needs_attention",
            errors: 0,
            warnings: 1,
            infos: 0,
          },
        ],
      },
    });

    expect(report.status).toBe("unsupported");
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
    expect(report.release_gate).toEqual(
      expect.objectContaining({
        status: "blocked",
        releasable: false,
        artifact_id: "review-report.validation",
        artifact_kind: "review-report",
        target_kind: "review-report",
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

  it.each([
    {
      claimKind: "prop" as const,
      entityType: "component" as const,
      entityId: "fixture-action",
      entityName: "FixtureAction",
      fieldPath: "props.missingFixtureProp",
      expectedCode: "missing_registry_field",
    },
    {
      claimKind: "token" as const,
      entityType: "token" as const,
      entityId: "--missing-fixture-token",
      entityName: "--missing-fixture-token",
      fieldPath: "name",
      expectedCode: "missing_registry_entity",
    },
    {
      claimKind: "import" as const,
      entityType: "component" as const,
      entityId: "fixture-action",
      entityName: "FixtureAction",
      fieldPath: "implementation_requirements.required_imports.MissingFixtureImport",
      expectedCode: "missing_registry_field",
    },
    {
      claimKind: "example" as const,
      entityType: "component" as const,
      entityId: "fixture-action",
      entityName: "FixtureAction",
      fieldPath: "examples.missing-fixture-example",
      expectedCode: "missing_registry_field",
    },
    {
      claimKind: "status" as const,
      entityType: "component" as const,
      entityId: "missing-fixture-action",
      entityName: "MissingFixtureAction",
      fieldPath: "status",
      expectedCode: "missing_registry_entity",
    },
    {
      claimKind: "accessibility" as const,
      entityType: "component" as const,
      entityId: "fixture-action",
      entityName: "FixtureAction",
      fieldPath: "accessibility.summary.99",
      expectedCode: "missing_registry_field",
    },
    {
      claimKind: "composition" as const,
      entityType: "pattern" as const,
      entityId: "fixture-workflow",
      entityName: "FixtureWorkflow",
      fieldPath: "composed_of.99",
      expectedCode: "missing_registry_field",
    },
  ])(
    "degrades durable review reports for undocumented fixture $claimKind claims",
    ({
      claimKind,
      entityType,
      entityId,
      entityName,
      fieldPath,
      expectedCode,
    }) => {
      const review = buildFixtureReviewResult({
        issues: [
          buildValidationIssue([
            buildFixtureEvidenceRef({
              id: `fixture.${claimKind}.undocumented-review-ref`,
              claimKind,
              entityType,
              entityId,
              entityName,
              fieldPath,
            }),
          ]),
        ],
      });
      const report = buildSaltReviewReport({
        registry: buildFixtureRegistry({
          patterns:
            entityType === "pattern" ? [buildFixturePattern()] : undefined,
        }),
        generated_at: "2026-04-30T00:00:00.000Z",
        generator: {
          name: "semantic-core review report fixture",
        },
        transport_used: "cli",
        review,
        contract: buildFixtureReviewContract(review),
        scope: {
          root_dir: "/fixture",
          targets: ["src"],
          file_count: 1,
          files: [
            {
              path: "/fixture/src/App.tsx",
              relative_path: "src/App.tsx",
              status: "needs_attention",
              errors: 0,
              warnings: 1,
              infos: 0,
            },
          ],
        },
      });

      expect(report.status).toBe("unsupported");
      expect(report.surface_gate.validation_issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: expectedCode,
          }),
        ]),
      );
      expect(report.gates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "report_evidence_validation",
            status: "unsupported",
          }),
        ]),
      );
      expectEvidenceValidationMirrorsSurfaceGate(report);
    },
  );
});
