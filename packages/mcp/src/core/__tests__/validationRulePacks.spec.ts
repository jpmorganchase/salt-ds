import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceRef,
} from "../evidence.js";
import {
  getSaltRegistryFingerprint,
  toSaltEvidenceRegistryIdentity,
} from "../registry/fingerprint.js";
import type { ComponentRecord, SaltRegistry } from "../types.js";
import {
  SALT_VALIDATION_RULE_PACK_CONTRACT,
  type SaltValidationRulePack,
  validateValidationRulePackEvidence,
} from "../validationRulePacks.js";

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
    summary: "Fixture component for executable rule-pack validation.",
    status: "stable",
    category: ["fixture"],
    tags: [],
    when_to_use: [],
    when_not_to_use: [],
    alternatives: [],
    props: [
      {
        name: "fixtureRisk",
        type: "boolean",
        required: false,
        description: "Fixture prop targeted by the rule pack.",
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
    ...overrides,
  };
}

function buildFixtureRegistry(
  component: ComponentRecord = buildFixtureComponent(),
): SaltRegistry {
  return {
    generated_at: "2026-04-30T00:00:00.000Z",
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: [component],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
    token_policy_structural_role_rule_pack: null,
  };
}

function buildRegistryEvidenceRef(registry: SaltRegistry): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: "fixture-rule.registry.validation-ref",
    source_kind: "registry",
    claim_kind: "prop",
    registry: {
      entity_type: "component",
      entity_id: "fixture-action",
      field_path: "props.fixtureRisk",
      ...toSaltEvidenceRegistryIdentity(registry),
    },
  };
}

function buildFixtureRulePack(
  registry: SaltRegistry,
  evidenceRefs: SaltEvidenceRef[] = [buildRegistryEvidenceRef(registry)],
  attributeNames: string[] = ["fixtureRisk"],
): SaltValidationRulePack {
  return {
    contract: SALT_VALIDATION_RULE_PACK_CONTRACT,
    id: "fixture-validation-rules",
    generated_at: null,
    generator: {
      name: "mcp-core validation rule-pack fixture",
    },
    registry: {
      version: registry.version,
      hash: getSaltRegistryFingerprint(registry),
      generated_at: null,
    },
    rules: [
      {
        id: "fixture.component-prop-risk",
        category: "composition",
        rule: "fixture-component-prop-risk",
        severity: "warning",
        title: "Fixture prop needs review",
        message: "Fixture rule matched a registry-backed prop.",
        suggested_fix: null,
        confidence: {
          basis: "deterministic_match",
          score: 1,
        },
        match: {
          kind: "component_jsx_attribute",
          component_id: "fixture-action",
          attribute_names: attributeNames,
        },
        evidence_refs: evidenceRefs,
      },
    ],
  };
}

describe("executable validation rule-pack trust", () => {
  it("accepts an exact registry-bound pack and EvidenceRef", () => {
    const registry = buildFixtureRegistry();

    expect(
      validateValidationRulePackEvidence(
        buildFixtureRulePack(registry),
        registry,
      ),
    ).toEqual([]);
  });

  it.each([
    {
      expectedCode: "missing_registry_identity",
      version: "",
      hash: "",
    },
    {
      expectedCode: "stale_registry",
      version: "stale-registry",
      hash: `sha256:${"f".repeat(64)}`,
    },
  ])("rejects $expectedCode pack identity before execution", ({
    expectedCode,
    version,
    hash,
  }) => {
    const registry = buildFixtureRegistry();
    const pack = buildFixtureRulePack(registry);
    pack.registry = {
      version,
      hash,
      generated_at: null,
    };

    expect(validateValidationRulePackEvidence(pack, registry)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expectedCode,
          path: "registry",
        }),
      ]),
    );
  });

  it("rejects stale registry EvidenceRefs inside a current pack", () => {
    const registry = buildFixtureRegistry();
    const staleRef = buildRegistryEvidenceRef(registry);
    if (!staleRef.registry) {
      throw new Error("Fixture EvidenceRef omitted its registry locator.");
    }
    staleRef.registry.registry_version = "stale-registry";
    staleRef.registry.registry_hash = `sha256:${"f".repeat(64)}`;

    expect(
      validateValidationRulePackEvidence(
        buildFixtureRulePack(registry, [staleRef]),
        registry,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "stale_registry",
          path: "rules[0].evidence_refs[0].registry.registry_version",
        }),
        expect.objectContaining({
          code: "stale_registry",
          path: "rules[0].evidence_refs[0].registry.registry_hash",
        }),
      ]),
    );
  });

  it("rejects docs-backed rules that target undocumented component props", () => {
    const registry = buildFixtureRegistry();
    const docsRef: SaltEvidenceRef = {
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: "fixture-rule.docs.validation-ref",
      source_kind: "docs",
      claim_kind: "prop",
      source: {
        url: "https://example.test/salt/fixture-action/rule",
      },
    };

    expect(
      validateValidationRulePackEvidence(
        buildFixtureRulePack(registry, [docsRef], ["undocumentedFixtureProp"]),
        registry,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unknown_component_match_attribute",
          path: "rules[0].match.attribute_names",
        }),
      ]),
    );
  });

  it.each([
    {
      label: "a score above one",
      confidence: { basis: "deterministic_match", score: 1.1 },
    },
    {
      label: "a negative score",
      confidence: { basis: "deterministic_match", score: -0.1 },
    },
    {
      label: "a score without a derivation basis",
      confidence: { score: 1 },
    },
  ])("rejects $label", ({ confidence }) => {
    const registry = buildFixtureRegistry();
    const pack = buildFixtureRulePack(registry);
    (
      pack.rules[0] as unknown as {
        confidence: unknown;
      }
    ).confidence = confidence;

    expect(validateValidationRulePackEvidence(pack, registry)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_rule_confidence",
          path: "rules[0].confidence",
        }),
      ]),
    );
  });

  it("rejects conflicting EvidenceRef ids across rules", () => {
    const registry = buildFixtureRegistry();
    const firstRef = buildRegistryEvidenceRef(registry);
    const pack = buildFixtureRulePack(registry, [firstRef]);
    pack.rules.push({
      ...pack.rules[0],
      id: "fixture.second-rule",
      evidence_refs: [
        {
          ...firstRef,
          source: {
            repo_path: "packages/fixture/src/OtherFixtureAction.tsx",
          },
        },
      ],
    });

    expect(validateValidationRulePackEvidence(pack, registry)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "conflicting_evidence_ref",
          path: "rules[1].evidence_refs[0].id",
        }),
      ]),
    );
  });

  it("ignores timestamp-only registry and pack changes", () => {
    const registry = buildFixtureRegistry();
    const pack = buildFixtureRulePack(registry);
    pack.generated_at = "2030-01-01T00:00:00.000Z";
    pack.registry.generated_at = "2030-01-01T00:00:00.000Z";
    const rebuiltAtAnotherTime = buildFixtureRegistry(
      buildFixtureComponent({
        last_verified_at: "2030-01-01T00:00:00.000Z",
      }),
    );
    rebuiltAtAnotherTime.generated_at = "2030-01-01T00:00:00.000Z";

    expect(
      validateValidationRulePackEvidence(pack, rebuiltAtAnotherTime),
    ).toEqual([]);
  });
});
