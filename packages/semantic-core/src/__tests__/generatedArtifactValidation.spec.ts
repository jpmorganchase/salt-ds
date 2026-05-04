import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRegistryEntityType,
  type SaltGeneratedArtifact,
} from "../evidence.js";
import { validateGeneratedArtifactRegistryEvidence } from "../generatedArtifactValidation.js";
import {
  validateGeneratedArtifactReleaseGate,
  validateGeneratedArtifactReleaseGateBatch,
} from "../generatedArtifactReleaseGate.js";
import type { SaltTokenPolicyStructuralRoleRulePack } from "../tokenPolicyStructuralRoleRules.js";
import { buildTokenPolicyStructuralRoleRulePack } from "../tokenPolicyStructuralRoleRules.js";
import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
  TokenRecord,
} from "../types.js";
import {
  validateSaltGeneratedArtifactReleaseGateBatchSchema,
  validateSaltGeneratedArtifactReleaseGateSchema,
} from "./generatedArtifactReleaseGateSchemaTestUtils.js";

// This file uses fixture-only registry facts to prove undocumented generated
// Salt claims fail closed before CLI, MCP, skills, or prompts can consume them.
function buildFixtureComponent(
  overrides: Partial<ComponentRecord> = {},
): ComponentRecord {
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
      summary: ["Fixture accessibility summary from registry."],
      rules: [],
    },
    patterns: [],
    examples: [
      {
        id: "fixture-action-basic-example",
        title: "Fixture action basic example",
        description: "Fixture example sourced from registry.",
        intent: ["fixture"],
        complexity: "basic",
        code: "<FixtureAction />",
        source_url: "https://example.test/salt/fixture-action/examples/basic",
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
    deprecations: [],
    last_verified_at: "2026-04-30T00:00:00.000Z",
    ...overrides,
  };
}

function buildFixtureToken(overrides: Partial<TokenRecord> = {}): TokenRecord {
  return {
    name: "--fixture-token",
    category: "fixture",
    type: "color",
    value: "#000000",
    semantic_intent: "Fixture token for registry validation tests.",
    themes: [],
    densities: [],
    applies_to: [],
    guidance: ["Fixture token guidance from registry."],
    aliases: [],
    policy: null,
    deprecated: false,
    last_verified_at: "2026-04-30T00:00:00.000Z",
    ...overrides,
  };
}

function buildFixturePattern(
  overrides: Partial<PatternRecord> = {},
): PatternRecord {
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
    ...overrides,
  };
}

function buildFixtureRegistry(input: {
  component?: ComponentRecord;
  pattern?: PatternRecord;
  token?: TokenRecord;
  tokenPolicyStructuralRoleRulePack?: SaltTokenPolicyStructuralRoleRulePack;
}): SaltRegistry {
  return {
    generated_at: "2026-04-30T00:00:00.000Z",
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: input.component ? [input.component] : [],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: input.pattern ? [input.pattern] : [],
    guides: [],
    tokens: input.token ? [input.token] : [],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
    token_policy_structural_role_rule_pack:
      input.tokenPolicyStructuralRoleRulePack ?? null,
  };
}

function buildArtifact(input: {
  kind: SaltEvidenceClaimKind;
  entity_type: SaltEvidenceRegistryEntityType;
  entity_id: string;
  field_path: string;
  artifact_kind?: SaltGeneratedArtifact["artifact_kind"];
  source?: {
    url?: string | null;
    repo_path?: string | null;
  } | null;
}): SaltGeneratedArtifact {
  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: input.artifact_kind ?? "component-context",
    id: "fixture.generated-artifact",
    generated_at: "2026-04-30T00:00:00.000Z",
    generator: {
      name: "semantic-core registry evidence fixture",
    },
    registry: {
      version: "fixture-registry",
      hash: "fixture-hash",
      generated_at: "2026-04-30T00:00:00.000Z",
    },
    claims: [
      {
        id: "fixture.claim",
        kind: input.kind,
        text: "Fixture generated claim.",
        evidence_ref_ids: ["fixture.ref"],
      },
    ],
    evidence_refs: [
      {
        contract: SALT_EVIDENCE_REF_CONTRACT,
        id: "fixture.ref",
        source_kind: "registry",
        claim_kind: input.kind,
        registry: {
          entity_type: input.entity_type,
          entity_id: input.entity_id,
          field_path: input.field_path,
          registry_version: "fixture-registry",
          registry_hash: "fixture-hash",
        },
        source:
          "source" in input
            ? input.source
            : {
                url: "https://example.test/salt/fixture",
                repo_path: "packages/fixture/src/FixtureAction.tsx",
              },
        confidence: "high",
      },
    ],
  };
}

describe("generated artifact registry evidence validation", () => {
  it("accepts fixture claims that point to documented registry fields", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
      token: buildFixtureToken(),
    });

    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "prop",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "props.fixtureProp",
      }),
      registry,
    );

    expect(issues).toEqual([]);
  });

  it("accepts fixture component claims that point to documented usage guidance", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent({
        when_not_to_use: ["Fixture guidance sourced from registry."],
      }),
    });

    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "component",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "when_not_to_use.0",
      }),
      registry,
    );

    expect(issues).toEqual([]);
  });

  it("accepts fixture component claims that point to documented semantic guidance", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent({
        semantics: {
          category: ["fixture"],
          preferred_for: [],
          not_for: ["Fixture semantic guidance sourced from registry."],
          derived_from: ["usage-docs"],
        },
      }),
    });

    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "component",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "semantics.not_for.0",
      }),
      registry,
    );

    expect(issues).toEqual([]);
  });

  it("rejects generated context claims for undocumented fixture props", () => {
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "prop",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "props.undocumentedFixtureProp",
      }),
      buildFixtureRegistry({ component: buildFixtureComponent() }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated context claims for missing fixture status entities", () => {
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "status",
        entity_type: "component",
        entity_id: "missing-fixture-action",
        field_path: "status",
      }),
      buildFixtureRegistry({ component: buildFixtureComponent() }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_entity",
        path: "evidence_refs[0].registry.entity_id",
      }),
    ]);
  });

  it("rejects generated context claims for undocumented fixture imports", () => {
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "import",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "source.export_name",
      }),
      buildFixtureRegistry({
        component: buildFixtureComponent({
          source: {
            repo_path: "packages/fixture/src/FixtureAction.tsx",
            export_name: null,
          },
        }),
      }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated context claims for undocumented fixture examples", () => {
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "example",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "examples.missing-fixture-example",
      }),
      buildFixtureRegistry({ component: buildFixtureComponent() }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated context claims for undocumented fixture pattern composition", () => {
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "composition",
        entity_type: "pattern",
        entity_id: "fixture-workflow",
        field_path: "composed_of.99",
      }),
      buildFixtureRegistry({ pattern: buildFixturePattern() }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated pattern composition claims without source locators", () => {
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "composition",
        entity_type: "pattern",
        entity_id: "fixture-workflow",
        field_path: "composed_of.0",
        source: null,
      }),
      buildFixtureRegistry({ pattern: buildFixturePattern() }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_source_locator",
        path: "evidence_refs[0].source",
      }),
    ]);
  });

  it("accepts fixture example ids that contain dot separators", () => {
    const component = buildFixtureComponent({
      examples: [
        {
          id: "fixture.story.default",
          title: "Fixture dotted story",
          description: "Fixture example id with dot separators.",
          intent: ["fixture"],
          complexity: "basic",
          code: "<FixtureAction />",
          source_url: "https://example.test/salt/fixture-action/stories/default",
          package: "@salt-ds/fixture",
          target_type: "component",
          target_name: "FixtureAction",
        },
      ],
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "example",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "examples.fixture.story.default",
      }),
      buildFixtureRegistry({ component }),
    );

    expect(issues).toEqual([]);
  });

  it("rejects generated context claims for undocumented fixture accessibility", () => {
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "accessibility",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "accessibility.summary.99",
      }),
      buildFixtureRegistry({ component: buildFixtureComponent() }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated context claims for undocumented fixture tokens", () => {
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "token",
        entity_type: "token",
        entity_id: "--missing-fixture-token",
        field_path: "name",
      }),
      buildFixtureRegistry({ token: buildFixtureToken() }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_entity",
        path: "evidence_refs[0].registry.entity_id",
      }),
    ]);
  });

  it("accepts fixture token claims that point to documented policy text", () => {
    const registry = buildFixtureRegistry({
      token: buildFixtureToken({
        policy: {
          usage_tier: "foundation",
          direct_component_use: "conditional",
          preferred_for: ["Fixture policy use from registry."],
          avoid_for: [],
          notes: ["Fixture policy note from registry."],
          docs: ["https://example.test/salt/fixture-token"],
          structural_roles: [],
          pairing: null,
        },
      }),
    });

    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "token",
        entity_type: "token",
        entity_id: "--fixture-token",
        field_path: "policy.preferred_for.0",
      }),
      registry,
    );

    expect(issues).toEqual([]);
  });

  it("rejects generated context claims for undocumented fixture token policy text", () => {
    const registry = buildFixtureRegistry({
      token: buildFixtureToken({
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
      }),
    });

    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact({
        kind: "token",
        entity_type: "token",
        entity_id: "--fixture-token",
        field_path: "policy.preferred_for.1",
      }),
      registry,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated fixture structural-role claims without rule-pack evidence", () => {
    const token = buildFixtureToken({
      name: "--salt-fixture-primary-background",
      category: "fixture",
      policy: {
        usage_tier: "foundation",
        direct_component_use: "conditional",
        preferred_for: [],
        avoid_for: [],
        notes: [],
        docs: ["https://example.test/salt/fixture-token"],
        structural_roles: ["fixture-background"],
        pairing: null,
      },
    });
    const artifact = buildArtifact({
      kind: "token",
      entity_type: "token",
      entity_id: token.name,
      field_path: "policy.structural_roles.0",
    });
    const registry = buildFixtureRegistry({ token });
    const rulePack = buildTokenPolicyStructuralRoleRulePack({
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
        name: "semantic-core fixture",
      },
      registry: {
        version: "fixture-registry",
      },
    });

    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, registry, {
        tokenPolicyStructuralRoleRulePack: rulePack,
      }),
    ).toEqual([]);
    expect(
      validateGeneratedArtifactRegistryEvidence(
        artifact,
        buildFixtureRegistry({
          token,
          tokenPolicyStructuralRoleRulePack: rulePack,
        }),
      ),
    ).toEqual([]);
    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, registry),
    ).toEqual([
      expect.objectContaining({
        code: "missing_structural_role_rule_evidence",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("release-gates fixture context and report artifacts through the shared surface gate", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const componentArtifact = buildArtifact({
      kind: "status",
      entity_type: "component",
      entity_id: "fixture-action",
      field_path: "status",
      artifact_kind: "component-context",
    });
    const reviewArtifact = buildArtifact({
      kind: "status",
      entity_type: "component",
      entity_id: "fixture-action",
      field_path: "status",
      artifact_kind: "review-report",
    });

    const componentGate = validateGeneratedArtifactReleaseGate({
      artifact: componentArtifact,
      registry,
      artifact_path: "fixture-context.json",
    });
    const batchGate = validateGeneratedArtifactReleaseGateBatch({
      registry,
      artifact_path: "fixture-batch",
      targets: [
        {
          artifact: componentArtifact,
          artifact_path: "fixture-context.json",
        },
        {
          artifact: reviewArtifact,
          artifact_path: "fixture-review.json",
        },
      ],
    });

    expect(validateSaltGeneratedArtifactReleaseGateSchema(componentGate)).toEqual(
      [],
    );
    expect(componentGate).toEqual(
      expect.objectContaining({
        status: "passed",
        releasable: true,
        artifact_kind: "component-context",
        target_kind: "component-context",
      }),
    );
    expect(
      validateSaltGeneratedArtifactReleaseGateBatchSchema(batchGate),
    ).toEqual([]);
    expect(batchGate).toEqual(
      expect.objectContaining({
        status: "passed",
        releasable: true,
        target_count: 2,
        passed_count: 2,
        blocked_count: 0,
      }),
    );
  });

  it("blocks release-gate artifacts built from a stale fixture registry fingerprint", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const artifact = buildArtifact({
      kind: "status",
      entity_type: "component",
      entity_id: "fixture-action",
      field_path: "status",
      artifact_kind: "component-context",
    });
    const gate = validateGeneratedArtifactReleaseGate({
      artifact: {
        ...artifact,
        registry: {
          ...artifact.registry,
          hash: "sha256:stale-fixture-registry",
        },
      },
      registry,
      artifact_path: "fixture-context.json",
    });

    expect(validateSaltGeneratedArtifactReleaseGateSchema(gate)).toEqual([]);
    expect(gate).toEqual(
      expect.objectContaining({
        status: "blocked",
        releasable: false,
        artifact_kind: "component-context",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "stale_registry",
            path: "registry.hash",
          }),
        ]),
        missing: expect.arrayContaining([
          "component-context artifact evidence validation failed: stale_registry at registry.hash",
        ]),
      }),
    );
  });

  it("blocks fixture release-gate batches when context coverage gaps are explicit", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const artifact = buildArtifact({
      kind: "status",
      entity_type: "component",
      entity_id: "fixture-action",
      field_path: "status",
      artifact_kind: "component-context",
    });
    const batchGate = validateGeneratedArtifactReleaseGateBatch({
      registry,
      targets: [{ artifact }],
      coverage_gaps: [
        {
          kind: "prompt",
          id: "fixture-prompt-gap",
          status: "unsupported",
          missing: ["fixture prompt serializer evidence"],
          evidence_ref_ids: [],
        },
      ],
    });

    expect(
      validateSaltGeneratedArtifactReleaseGateBatchSchema(batchGate),
    ).toEqual([]);
    expect(batchGate).toEqual(
      expect.objectContaining({
        status: "blocked",
        releasable: false,
        target_count: 1,
        passed_count: 1,
        coverage_gap_count: 1,
        missing: ["fixture-prompt-gap: fixture prompt serializer evidence"],
      }),
    );
  });
});
