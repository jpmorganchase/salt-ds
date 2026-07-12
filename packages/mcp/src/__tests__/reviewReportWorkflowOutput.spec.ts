import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceRef,
} from "../core/evidence.js";
import type { PublicContract } from "../core/tools/publicContract.js";
import type { ReviewSaltUiResult } from "../core/tools/reviewSaltUi.js";
import type { ValidationIssue } from "../core/tools/validateSaltUsage.js";
import type { ComponentRecord, SaltRegistry } from "../core/types.js";
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
    artifact_verification: {
      status: "not_applicable",
      component_imports: [],
    },
    unsupported_rule_kinds: [],
    missing_data: [],
    source_urls: [],
  };
}

describe("MCP compact review workflow output", () => {
  it("degrades compact MCP review output when fixture report evidence is unsupported", () => {
    const output = withAnalyzeWorkflowGuidance(
      buildFixtureRegistry(),
      buildReviewResult(
        buildValidationIssue([buildPropEvidenceRef("props.missing")]),
      ),
      {
        code: '<FixtureAction missing="yes" />',
        root_dir: "/fixture",
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
});
