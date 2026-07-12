import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceRef,
} from "../evidence.js";
import { validateGeneratedSaltArtifactSurface } from "../generatedArtifactSurface.js";
import { validateGeneratedArtifactRegistryEvidence } from "../generatedArtifactValidation.js";
import { buildReviewReportArtifact } from "../reviewReportArtifacts.js";
import {
  buildTokenPolicyStructuralRoleRulePack,
  type SaltTokenPolicyStructuralRoleRulePack,
} from "../tokenPolicyStructuralRoleRules.js";
import type { ValidationIssue } from "../tools/validation/shared.js";
import type { ComponentRecord, SaltRegistry, TokenRecord } from "../types.js";

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
      name: "mcp-core review report fixture",
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
        name: "mcp-core review report fixture",
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
        name: "mcp-core review report fixture",
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
        name: "mcp-core review report fixture",
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
        name: "mcp-core review report fixture",
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
});
