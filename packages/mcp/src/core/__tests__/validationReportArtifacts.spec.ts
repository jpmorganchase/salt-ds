import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
  type SaltEvidenceRegistryEntityType,
} from "../evidence.js";
import { validateGeneratedArtifactRegistryEvidence } from "../generatedArtifactValidation.js";
import type { ValidationIssue } from "../tools/validation/shared.js";
import type {
  ComponentRecord,
  DeprecationRecord,
  PatternRecord,
  SaltRegistry,
  TokenRecord,
} from "../types.js";
import {
  buildValidationReportArtifact,
  buildValidationReportEvidenceGate,
} from "../validationReportArtifacts.js";

// Fixture-only registry facts: these records are synthetic and exist only to
// prove validation reports reject claims the fixture registry cannot back.

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
      summary: ["Fixture accessibility sourced from registry."],
      rules: [],
    },
    patterns: [],
    examples: [
      {
        id: "fixture.example.default",
        title: "Fixture example",
        description: "Fixture example sourced from registry.",
        intent: ["fixture"],
        complexity: "basic",
        code: "<FixtureAction />",
        source_url: "https://example.test/salt/fixture-action/examples",
        package: "@salt-ds/fixture",
        target_type: "component",
        target_name: "FixtureAction",
      },
    ],
    related_docs: {
      overview: "https://example.test/salt/fixture-action",
      usage: null,
      accessibility: "https://example.test/salt/fixture-action/accessibility",
      examples: "https://example.test/salt/fixture-action/examples",
    },
    source: {
      repo_path: "packages/fixture/src/FixtureAction.tsx",
      export_name: "FixtureAction",
    },
    implementation_requirements: {
      required_imports: [
        {
          kind: "css",
          specifier: "FixtureAction",
          statement: 'import "fixture-action.css";',
          source_url: "https://example.test/salt/fixture-action/source",
        },
      ],
    },
    deprecations: [],
    last_verified_at: "2026-04-30T00:00:00.000Z",
  };
}

function buildFixtureToken(): TokenRecord {
  return {
    name: "--fixture-token",
    category: "fixture",
    type: "color",
    value: "#000000",
    semantic_intent: "Fixture token for validation report tests.",
    themes: [],
    densities: [],
    applies_to: [],
    guidance: [],
    aliases: [],
    policy: {
      usage_tier: "foundation",
      direct_component_use: "conditional",
      preferred_for: ["Fixture policy use from registry."],
      avoid_for: [],
      notes: [],
      docs: ["https://example.test/salt/fixture-token"],
      structural_roles: [],
      pairing: null,
    },
    deprecated: false,
    last_verified_at: "2026-04-30T00:00:00.000Z",
  };
}

function buildFixtureDeprecation(): DeprecationRecord {
  return {
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
    patterns: [buildFixturePattern()],
    guides: [],
    tokens: [buildFixtureToken()],
    deprecations: [buildFixtureDeprecation()],
    examples: [],
  };
}

function buildEvidenceRef(input: {
  claimKind: SaltEvidenceClaimKind;
  entityType: SaltEvidenceRegistryEntityType;
  entityId: string;
  entityName: string;
  fieldPath: string;
}): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `fixture.${input.claimKind}.validation-ref`,
    source_kind: "registry",
    claim_kind: input.claimKind,
    registry: {
      entity_type: input.entityType,
      entity_id: input.entityId,
      entity_name: input.entityName,
      field_path: input.fieldPath,
      registry_version: "fixture-registry",
    },
    source: {
      url: "https://example.test/salt/fixture",
      repo_path: "packages/fixture/src/FixtureAction.tsx",
    },
    confidence: "high",
    verified_at: "2026-04-30T00:00:00.000Z",
  };
}

function buildIssue(
  evidenceRefs: SaltEvidenceRef[] | undefined,
): ValidationIssue {
  return {
    id: "fixture.validation.issue",
    category: "composition",
    rule: "fixture-validation-rule",
    severity: "warning",
    title: "Fixture validation finding",
    message: "Fixture validation finding message.",
    evidence: ["Fixture validation evidence."],
    canonical_source: null,
    suggested_fix: null,
    confidence: 0.9,
    source_urls: [],
    evidence_refs: evidenceRefs,
    matches: 1,
  };
}

describe("validation report artifacts", () => {
  it("turns source-backed validator issues into validation-report claims", () => {
    const artifact = buildValidationReportArtifact({
      registry: buildFixtureRegistry(),
      issues: [
        buildIssue([
          buildEvidenceRef({
            claimKind: "prop",
            entityType: "component",
            entityId: "fixture-action",
            entityName: "FixtureAction",
            fieldPath: "props.fixtureProp",
          }),
        ]),
      ],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "mcp-core validation report fixture",
      },
    });

    expect(
      validateGeneratedArtifactRegistryEvidence(
        artifact,
        buildFixtureRegistry(),
      ),
    ).toEqual([]);
    expect(artifact).toEqual(
      expect.objectContaining({
        artifact_kind: "validation-report",
        id: "validation-report.validate-salt-usage",
        claims: [
          expect.objectContaining({
            kind: "prop",
            evidence_ref_ids: ["fixture.prop.validation-ref"],
          }),
        ],
      }),
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
      fieldPath:
        "implementation_requirements.required_imports.MissingFixtureImport",
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
    {
      claimKind: "status" as const,
      entityType: "deprecation" as const,
      entityId: "fixture-action.legacy-fixture-prop.deprecation",
      entityName: "legacyFixtureProp",
      fieldPath: "removed_in",
      expectedCode: "missing_registry_field",
    },
    {
      claimKind: "prop" as const,
      entityType: "deprecation" as const,
      entityId: "missing-fixture-deprecation",
      entityName: "missingFixtureProp",
      fieldPath: "name",
      expectedCode: "missing_registry_entity",
    },
  ])("degrades validation reports for undocumented fixture $claimKind claims", ({
    claimKind,
    entityType,
    entityId,
    entityName,
    fieldPath,
    expectedCode,
  }) => {
    const gate = buildValidationReportEvidenceGate({
      registry: buildFixtureRegistry(),
      issues: [
        buildIssue([
          buildEvidenceRef({
            claimKind,
            entityType,
            entityId,
            entityName,
            fieldPath,
          }),
        ]),
      ],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "mcp-core validation report fixture",
      },
    });

    expect(gate.status).toBe("unsupported");
    expect(gate.validation_issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expectedCode,
        }),
      ]),
    );
  });

  it("records missing validator provenance as unsupported report state", () => {
    const artifact = buildValidationReportArtifact({
      registry: buildFixtureRegistry(),
      issues: [buildIssue(undefined)],
      missing_data: ["Fixture validator evidence is missing."],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "mcp-core validation report fixture",
      },
    });

    expect(artifact.claims).toEqual([]);
    expect(artifact.unsupported_claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field_path: "issues.fixture.validation.issue",
        }),
        expect.objectContaining({
          field_path: "missing_data.0",
        }),
      ]),
    );
  });
});
