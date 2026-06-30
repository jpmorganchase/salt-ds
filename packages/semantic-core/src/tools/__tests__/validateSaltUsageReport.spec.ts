import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  validateGeneratedArtifactEvidence,
} from "../../evidence.js";
import { validateGeneratedArtifactRegistryEvidence } from "../../generatedArtifactValidation.js";
import type {
  ComponentRecord,
  DeprecationRecord,
  SaltRegistry,
} from "../../types.js";
import {
  SALT_VALIDATION_RULE_PACK_CONTRACT,
  type SaltValidationRulePack,
} from "../../validationRulePacks.js";
import { validateSaltUsage } from "../validateSaltUsage.js";

// Fixture-only registry facts: these synthetic records prove validator reports
// are evidence-gated without adding production Salt facts to tests.

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
      {
        name: "legacyFixtureProp",
        type: "string",
        required: false,
        description: "Fixture deprecated prop sourced from registry.",
        deprecated: true,
        deprecation_note: "Use fixtureProp for fixture tests.",
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

function buildFixtureDeprecatedComponent(): ComponentRecord {
  return {
    ...buildFixtureComponent(),
    id: "fixture-deprecated-action",
    name: "FixtureDeprecatedAction",
    summary: "Fixture source-backed deprecated action component.",
    related_docs: {
      overview: "https://example.test/salt/fixture-deprecated-action",
      usage: null,
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: "packages/fixture/src/FixtureDeprecatedAction.tsx",
      export_name: "FixtureDeprecatedAction",
    },
    deprecations: ["fixture-deprecated-action.deprecation"],
  };
}

function buildFixtureDeprecations(): DeprecationRecord[] {
  return [
    {
      id: "fixture-deprecated-action.deprecation",
      package: "@salt-ds/fixture",
      component: "FixtureDeprecatedAction",
      kind: "component",
      name: "FixtureDeprecatedAction",
      deprecated_in: "1.0.0",
      removed_in: null,
      replacement: {
        type: "component",
        name: "FixtureAction",
        notes: "Use FixtureAction for fixture tests.",
      },
      migration: {
        strategy: "replace",
        details: [
          {
            from: "FixtureDeprecatedAction",
            to: "FixtureAction",
          },
        ],
      },
      source_urls: ["https://example.test/salt/fixture-deprecated-action"],
    },
    {
      id: "fixture-action.legacy-fixture-prop.deprecation",
      package: "@salt-ds/fixture",
      component: "FixtureAction",
      kind: "prop",
      name: "legacyFixtureProp",
      deprecated_in: "1.0.0",
      removed_in: null,
      replacement: {
        type: "prop",
        name: "fixtureProp",
        notes: "Use fixtureProp for fixture tests.",
      },
      migration: {
        strategy: "replace",
        details: [
          {
            from: "legacyFixtureProp",
            to: "fixtureProp",
          },
        ],
      },
      source_urls: ["https://example.test/salt/fixture-action/deprecations"],
    },
  ];
}

function buildFixtureRegistry(): SaltRegistry {
  return {
    generated_at: "2026-04-30T00:00:00.000Z",
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: [buildFixtureComponent(), buildFixtureDeprecatedComponent()],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [],
    deprecations: buildFixtureDeprecations(),
    examples: [],
    changes: [],
    search_index: [],
  };
}

function buildFixtureRulePack(): SaltValidationRulePack {
  return {
    contract: SALT_VALIDATION_RULE_PACK_CONTRACT,
    id: "fixture-validation-rules",
    generated_at: "2026-04-30T00:00:00.000Z",
    generator: {
      name: "semantic-core validation report fixture",
    },
    registry: {
      version: "fixture-registry",
    },
    rules: [
      {
        id: "fixture-rule",
        category: "composition",
        rule: "fixture-rule",
        severity: "warning",
        title: "Fixture rule matched",
        message: "Fixture rule message.",
        suggested_fix: null,
        confidence: 0.9,
        match: {
          kind: "component_jsx_attribute",
          component_id: "fixture-action",
          attribute_names: ["fixtureProp"],
        },
        evidence_refs: [
          {
            contract: SALT_EVIDENCE_REF_CONTRACT,
            id: "fixture-rule.docs.validation-ref",
            source_kind: "docs",
            claim_kind: "prop",
            source: {
              url: "https://example.test/salt/fixture-action/rule",
            },
            confidence: "high",
            verified_at: "2026-04-30T00:00:00.000Z",
          },
        ],
      },
    ],
  };
}

describe("validateSaltUsage report artifact", () => {
  it("emits a validation-report artifact for source-backed validator issues", () => {
    const registry = buildFixtureRegistry();
    const result = validateSaltUsage(registry, {
      code: [
        'import { FixtureAction } from "@salt-ds/fixture";',
        "",
        "export function Fixture() {",
        '  return <FixtureAction fixtureProp="yes" />;',
        "}",
      ].join("\n"),
      validation_rule_pack: buildFixtureRulePack(),
    });

    expect(result.generated_artifact).toEqual(
      expect.objectContaining({
        artifact_kind: "validation-report",
        id: "validation-report.validate-salt-usage",
      }),
    );
    expect(result.surface_gate).toEqual(
      expect.objectContaining({
        status: "validated",
        validation_issues: [],
        unsupported_claim_count: 0,
        artifact_kind: "validation-report",
      }),
    );
    expect(result.evidence_validation).toEqual({
      status: result.surface_gate.status,
      issues: result.surface_gate.validation_issues,
      missing: result.surface_gate.missing,
      unsupported_claim_count: result.surface_gate.unsupported_claim_count,
    });
    expect(
      validateGeneratedArtifactEvidence(result.generated_artifact),
    ).toEqual([]);
    expect(
      validateGeneratedArtifactRegistryEvidence(
        result.generated_artifact,
        registry,
      ),
    ).toEqual([]);
    expect(result.generated_artifact.claims).toEqual([
      expect.objectContaining({
        kind: "prop",
        evidence_ref_ids: expect.arrayContaining([
          "fixture-rule.docs.validation-ref",
          "fixture-action.fixture-rule.component-target.validation-ref",
          "fixture-rule.workflow-input.code.validation-ref",
        ]),
      }),
    ]);
  });

  it("backs deprecated import and prop report claims with registry EvidenceRefs", () => {
    const registry = buildFixtureRegistry();
    const result = validateSaltUsage(registry, {
      code: [
        'import { FixtureAction, FixtureDeprecatedAction } from "@salt-ds/fixture";',
        "",
        "export function Fixture() {",
        "  return (",
        "    <>",
        "      <FixtureDeprecatedAction />",
        '      <FixtureAction legacyFixtureProp="yes" />',
        "    </>",
        "  );",
        "}",
      ].join("\n"),
      package_version: "1.0.0",
    });

    const importIssue = result.issues.find((issue) =>
      issue.id.startsWith(
        "deprecated.import.salt-ds-fixture.fixturedeprecatedaction",
      ),
    );
    const propIssue = result.issues.find((issue) =>
      issue.id.startsWith("deprecated.prop.salt-ds-fixture.legacyfixtureprop"),
    );

    expect(importIssue?.evidence_refs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "registry",
          claim_kind: "import",
          registry: expect.objectContaining({
            entity_type: "deprecation",
            entity_id: "fixture-deprecated-action.deprecation",
            field_path: "name",
          }),
        }),
        expect.objectContaining({
          source_kind: "registry",
          claim_kind: "status",
          registry: expect.objectContaining({
            entity_type: "deprecation",
            field_path: "migration.details.0.to",
          }),
        }),
      ]),
    );
    expect(propIssue?.evidence_refs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "registry",
          claim_kind: "prop",
          registry: expect.objectContaining({
            entity_type: "deprecation",
            entity_id: "fixture-action.legacy-fixture-prop.deprecation",
            field_path: "name",
          }),
        }),
        expect.objectContaining({
          source_kind: "registry",
          claim_kind: "status",
          registry: expect.objectContaining({
            entity_type: "deprecation",
            field_path: "replacement.name",
          }),
        }),
      ]),
    );
    expect(result.surface_gate).toEqual(
      expect.objectContaining({
        status: "validated",
        validation_issues: [],
        unsupported_claim_count: 0,
      }),
    );
    expect(
      validateGeneratedArtifactRegistryEvidence(
        result.generated_artifact,
        registry,
      ),
    ).toEqual([]);
  });

  it("degrades validator reports when evidence is missing", () => {
    const result = validateSaltUsage(buildFixtureRegistry(), {
      code: "",
    });

    expect(result.surface_gate).toEqual(
      expect.objectContaining({
        status: "unsupported",
        unsupported_claim_count: 1,
      }),
    );
    expect(result.generated_artifact.claims).toEqual([]);
    expect(result.generated_artifact.unsupported_claims).toEqual([
      expect.objectContaining({
        field_path: "missing_data.0",
      }),
    ]);
  });
});
