import { describe, expect, it } from "vitest";
import { SALT_EVIDENCE_REF_CONTRACT } from "../../evidence.js";
import {
  buildTokenPolicyStructuralRoleRulePack,
  type SaltTokenPolicyStructuralRoleRulePack,
} from "../../tokenPolicyStructuralRoleRules.js";
import type {
  ComponentRecord,
  GuideRecord,
  SaltRegistry,
  TokenRecord,
} from "../../types.js";
import {
  SALT_VALIDATION_RULE_PACK_CONTRACT,
  type SaltValidationRulePack,
} from "../../validationRulePacks.js";
import { validateSaltUsage } from "../validateSaltUsage.js";

// All Salt-looking names in this file are fixture-only registry facts.
function buildFixtureComponent(
  overrides: Partial<ComponentRecord> = {},
): ComponentRecord {
  return {
    id: "fixture-nonstable-action",
    name: "FixtureNonStableAction",
    aliases: [],
    package: {
      name: "@salt-ds/fixture",
      status: "beta",
      since: null,
    },
    summary: "Fixture component for validator evidence tests.",
    status: "beta",
    category: ["fixture"],
    tags: [],
    when_to_use: [],
    when_not_to_use: [],
    alternatives: [],
    props: [],
    accessibility: {
      summary: [],
      rules: [],
    },
    patterns: [],
    examples: [],
    related_docs: {
      overview: null,
      usage: null,
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: "packages/fixture/src/FixtureNonStableAction.tsx",
      export_name: "FixtureNonStableAction",
    },
    deprecations: [],
    last_verified_at: "2026-04-30T00:00:00.000Z",
    ...overrides,
  };
}

function buildFixtureGuide(overrides: Partial<GuideRecord> = {}): GuideRecord {
  return {
    id: "guide.fixture-primitive-choice",
    name: "Choosing the right primitive",
    aliases: ["fixture primitive choice"],
    kind: "getting-started",
    summary:
      "Fixture guide says to prefer the most constrained Salt component before creating custom UI.",
    packages: ["@salt-ds/fixture"],
    steps: [],
    related_docs: {
      overview: "https://example.test/fixture/primitive-choice",
      related_components: [],
      related_packages: ["@salt-ds/fixture"],
    },
    last_verified_at: "2026-04-30T00:00:00.000Z",
    ...overrides,
  };
}

function buildFixtureToken(overrides: Partial<TokenRecord> = {}): TokenRecord {
  return {
    name: "--fixture-size-base",
    category: "size",
    type: "dimension",
    value: "24px",
    semantic_intent: "Fixture size token.",
    themes: ["fixture"],
    densities: [],
    applies_to: [],
    guidance: ["Fixture size token guidance."],
    aliases: [],
    policy: {
      usage_tier: "foundation",
      direct_component_use: "conditional",
      preferred_for: ["fixture structural sizing"],
      avoid_for: ["fixture unsupported styling"],
      notes: ["Fixture token policy guidance."],
      docs: ["https://example.test/fixture/tokens"],
      structural_roles: [],
      pairing: null,
    },
    deprecated: false,
    last_verified_at: "2026-04-30T00:00:00.000Z",
    ...overrides,
  };
}

function buildFixtureRegistry(
  components: ComponentRecord[],
  guides: GuideRecord[] = [],
  tokens: TokenRecord[] = [],
  tokenPolicyStructuralRoleRulePack?: SaltTokenPolicyStructuralRoleRulePack | null,
): SaltRegistry {
  return {
    generated_at: "2026-04-30T00:00:00.000Z",
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components,
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides,
    tokens,
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
    token_policy_structural_role_rule_pack:
      tokenPolicyStructuralRoleRulePack ?? null,
  };
}

function buildFixtureStructuralRoleRulePack(input: {
  kind?: "container-pairing" | "fixed-size" | "separable-token";
  category: string;
  tokenFamily: string;
  tokenModifier?: string;
  evidenceText: string;
  evidenceTerms: string[];
}): SaltTokenPolicyStructuralRoleRulePack {
  return buildTokenPolicyStructuralRoleRulePack({
    structural_role_rules: [
      {
        id: `/fixture/docs/token-rules#${input.category}`,
        category: input.category,
        kind: input.kind ?? "container-pairing",
        source: {
          route: "/fixture/docs/token-rules",
          repo_path: "fixture/docs/token-rules.mdx",
        },
        evidence_text: input.evidenceText,
        evidence_terms: input.evidenceTerms,
        token_family: input.tokenFamily,
        token_modifier: input.tokenModifier,
      },
    ],
    generated_at: "2026-04-30T00:00:00.000Z",
    generator: {
      name: "semantic-core validator fixture",
    },
    registry: {
      version: "fixture-registry",
    },
  });
}

describe("validateSaltUsage evidence refs", () => {
  it("attaches registry evidence refs to fixture catalog-status issues", () => {
    const registry = buildFixtureRegistry([buildFixtureComponent()]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureNonStableAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNonStableAction />;
        }
      `,
    });

    const issue = result.issues.find(
      (item) =>
        item.category === "catalog-status" &&
        item.rule === "prefer-stable-catalog-status",
    );

    expect(issue).toBeDefined();
    expect(issue?.evidence_refs).toEqual([
      expect.objectContaining({
        contract: "salt_evidence_ref_v1",
        source_kind: "registry",
        claim_kind: "status",
        registry: expect.objectContaining({
          entity_id: "fixture-nonstable-action",
          entity_name: "FixtureNonStableAction",
          field_path: "status",
          registry_version: "fixture-registry",
        }),
      }),
    ]);
  });

  it("does not emit catalog-status evidence refs for fixture components absent from the registry", () => {
    const result = validateSaltUsage(buildFixtureRegistry([]), {
      code: `
        import { FixtureNonStableAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNonStableAction />;
        }
      `,
    });

    expect(
      result.issues.some(
        (issue) =>
          issue.category === "catalog-status" &&
          issue.rule === "prefer-stable-catalog-status",
      ),
    ).toBe(false);
  });

  it("emits rule-pack findings only for fixture props documented by the registry", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        props: [
          {
            name: "fixtureRisk",
            type: "boolean",
            required: false,
            description: "Fixture prop used by the source-backed rule pack.",
            deprecated: false,
          },
        ],
      }),
    ]);
    const rulePack: SaltValidationRulePack = {
      contract: SALT_VALIDATION_RULE_PACK_CONTRACT,
      id: "fixture-rule-pack",
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core validation rule pack fixture",
      },
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
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
          confidence: 0.9,
          match: {
            kind: "component_jsx_attribute",
            component_id: "fixture-nonstable-action",
            attribute_names: ["fixtureRisk"],
          },
          evidence_refs: [
            {
              contract: SALT_EVIDENCE_REF_CONTRACT,
              id: "fixture.component-prop-risk.rule-ref",
              source_kind: "registry",
              claim_kind: "prop",
              registry: {
                entity_type: "component",
                entity_id: "fixture-nonstable-action",
                field_path: "props.fixtureRisk",
                registry_version: "fixture-registry",
              },
              confidence: "high",
            },
          ],
        },
      ],
    };

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureNonStableAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNonStableAction fixtureRisk />;
        }
      `,
      validation_rule_pack: rulePack,
    });

    const issue = result.issues.find(
      (item) => item.id === "fixture.component-prop-risk",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        rule: "fixture-component-prop-risk",
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            id: "fixture.component-prop-risk.rule-ref",
            claim_kind: "prop",
          }),
          expect.objectContaining({
            id: "fixture-nonstable-action.fixture.component-prop-risk.component-target.validation-ref",
            claim_kind: "component",
          }),
          expect.objectContaining({
            id: "fixture.component-prop-risk.workflow-input.code.validation-ref",
            source_kind: "workflow_input",
          }),
        ]),
      }),
    );
  });

  it("skips rule-pack findings that match undocumented fixture props", () => {
    const registry = buildFixtureRegistry([buildFixtureComponent()]);
    const rulePack: SaltValidationRulePack = {
      contract: SALT_VALIDATION_RULE_PACK_CONTRACT,
      id: "fixture-invalid-rule-pack",
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core validation rule pack fixture",
      },
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      rules: [
        {
          id: "fixture.undocumented-prop-risk",
          category: "composition",
          rule: "fixture-undocumented-prop-risk",
          severity: "warning",
          title: "Fixture undocumented prop risk",
          message: "Fixture rule should not run without registry evidence.",
          suggested_fix: null,
          confidence: 0.9,
          match: {
            kind: "component_jsx_attribute",
            component_id: "fixture-nonstable-action",
            attribute_names: ["undocumentedFixtureProp"],
          },
          evidence_refs: [
            {
              contract: SALT_EVIDENCE_REF_CONTRACT,
              id: "fixture.undocumented-prop-risk.rule-ref",
              source_kind: "registry",
              claim_kind: "component",
              registry: {
                entity_type: "component",
                entity_id: "fixture-nonstable-action",
                field_path: "name",
                registry_version: "fixture-registry",
              },
              confidence: "high",
            },
          ],
        },
      ],
    };

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureNonStableAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNonStableAction undocumentedFixtureProp />;
        }
      `,
      validation_rule_pack: rulePack,
    });

    expect(
      result.issues.some(
        (item) => item.id === "fixture.undocumented-prop-risk",
      ),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining("unknown_component_match_attribute"),
      ]),
    );
  });

  it("derives action-vs-navigation findings from fixture registry usage guidance", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        id: "fixture-action",
        name: "FixtureAction",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        when_not_to_use: [
          "Use FixtureNavigation for navigation targets instead.",
        ],
        alternatives: [
          {
            use: "FixtureNavigation",
            reason: "Fixture alternative documented by source-backed usage.",
          },
        ],
        related_docs: {
          overview: null,
          usage: "https://example.test/fixture/action/usage",
          accessibility: null,
          examples: null,
        },
        source: {
          repo_path: "packages/fixture/src/FixtureAction.tsx",
          export_name: "FixtureAction",
        },
      }),
      buildFixtureComponent({
        id: "fixture-navigation",
        name: "FixtureNavigation",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["navigation"],
        tags: ["navigation"],
        when_to_use: ["Use FixtureNavigation for navigation targets."],
        related_docs: {
          overview: null,
          usage: "https://example.test/fixture/navigation/usage",
          accessibility: null,
          examples: null,
        },
        source: {
          repo_path: "packages/fixture/src/FixtureNavigation.tsx",
          export_name: "FixtureNavigation",
        },
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureAction href="/fixture" />;
        }
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "component-choice.navigation",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        category: "primitive-choice",
        rule: "navigation-target-uses-navigation-component",
        message:
          "FixtureAction: Use FixtureNavigation for navigation targets instead. FixtureNavigation: Use FixtureNavigation for navigation targets.",
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-action",
              field_path: "when_not_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/action/usage",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-navigation",
              field_path: "when_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/navigation/usage",
            }),
          }),
        ]),
      }),
    );
  });

  it("derives action-vs-navigation findings from fixture registry semantic guidance", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        id: "fixture-action",
        name: "FixtureAction",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["actions"],
        semantics: {
          category: ["actions"],
          preferred_for: [],
          not_for: ["Use a navigation destination component for pages."],
          derived_from: ["usage-docs"],
        },
        related_docs: {
          overview: null,
          usage: "https://example.test/fixture/action/usage",
          accessibility: null,
          examples: null,
        },
        source: {
          repo_path: "packages/fixture/src/FixtureAction.tsx",
          export_name: "FixtureAction",
        },
      }),
      buildFixtureComponent({
        id: "fixture-navigation",
        name: "FixtureNavigation",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["navigation"],
        semantics: {
          category: ["navigation"],
          preferred_for: ["Use for navigation to pages."],
          not_for: [],
          derived_from: ["usage-docs"],
        },
        related_docs: {
          overview: null,
          usage: "https://example.test/fixture/navigation/usage",
          accessibility: null,
          examples: null,
        },
        source: {
          repo_path: "packages/fixture/src/FixtureNavigation.tsx",
          export_name: "FixtureNavigation",
        },
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureAction href="/fixture" />;
        }
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "component-choice.navigation",
    );

    expect(issue?.evidence_refs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          registry: expect.objectContaining({
            entity_id: "fixture-action",
            field_path: "semantics.not_for.0",
          }),
        }),
        expect.objectContaining({
          registry: expect.objectContaining({
            entity_id: "fixture-navigation",
            field_path: "semantics.preferred_for.0",
          }),
        }),
      ]),
    );
  });

  it("records missing usage evidence instead of emitting unsupported action-vs-navigation findings", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        id: "fixture-action",
        name: "FixtureAction",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        when_not_to_use: [
          "Use FixtureNavigation for navigation targets instead.",
        ],
        alternatives: [
          {
            use: "FixtureNavigation",
            reason: "Fixture alternative missing source-backed usage.",
          },
        ],
        source: {
          repo_path: null,
          export_name: "FixtureAction",
        },
      }),
      buildFixtureComponent({
        id: "fixture-navigation",
        name: "FixtureNavigation",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["navigation"],
        when_to_use: ["Use FixtureNavigation for navigation targets."],
        source: {
          repo_path: null,
          export_name: "FixtureNavigation",
        },
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureAction href="/fixture" />;
        }
      `,
    });

    expect(
      result.issues.some((item) => item.id === "component-choice.navigation"),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Skipped action-vs-navigation validation"),
      ]),
    );
  });

  it("derives action-vs-navigation handler findings from fixture registry usage guidance", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        id: "fixture-action",
        name: "FixtureAction",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        when_not_to_use: [
          "Use FixtureNavigation for navigation targets instead.",
        ],
        alternatives: [
          {
            use: "FixtureNavigation",
            reason: "Fixture alternative documented by source-backed usage.",
          },
        ],
        related_docs: {
          overview: null,
          usage: "https://example.test/fixture/action/usage",
          accessibility: null,
          examples: null,
        },
        source: {
          repo_path: "packages/fixture/src/FixtureAction.tsx",
          export_name: "FixtureAction",
        },
      }),
      buildFixtureComponent({
        id: "fixture-navigation",
        name: "FixtureNavigation",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["navigation"],
        when_to_use: ["Use FixtureNavigation for navigation targets."],
        related_docs: {
          overview: null,
          usage: "https://example.test/fixture/navigation/usage",
          accessibility: null,
          examples: null,
        },
        source: {
          repo_path: "packages/fixture/src/FixtureNavigation.tsx",
          export_name: "FixtureNavigation",
        },
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureAction onClick={() => navigate("/fixture")} />;
        }
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "component-choice.navigation-handler",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        category: "primitive-choice",
        rule: "navigation-handler-uses-navigation-component",
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-action",
              field_path: "when_not_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/action/usage",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-navigation",
              field_path: "when_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/navigation/usage",
            }),
          }),
        ]),
      }),
    );
  });

  it("records missing usage evidence instead of emitting unsupported action-vs-navigation handler findings", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        id: "fixture-action",
        name: "FixtureAction",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        when_not_to_use: [
          "Use FixtureNavigation for navigation targets instead.",
        ],
        alternatives: [
          {
            use: "FixtureNavigation",
            reason: "Fixture alternative missing source-backed usage.",
          },
        ],
        source: {
          repo_path: null,
          export_name: "FixtureAction",
        },
      }),
      buildFixtureComponent({
        id: "fixture-navigation",
        name: "FixtureNavigation",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["navigation"],
        when_to_use: ["Use FixtureNavigation for navigation targets."],
        source: {
          repo_path: null,
          export_name: "FixtureNavigation",
        },
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureAction onClick={() => navigate("/fixture")} />;
        }
      `,
    });

    expect(
      result.issues.some(
        (item) => item.id === "component-choice.navigation-handler",
      ),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Skipped action-vs-navigation handler validation",
        ),
      ]),
    );
  });

  it("derives navigation-as-action findings from fixture registry usage guidance", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        id: "fixture-action",
        name: "FixtureAction",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["actions"],
        when_to_use: ["Use FixtureAction to trigger actions."],
        related_docs: {
          overview: null,
          usage: "https://example.test/fixture/action/usage",
          accessibility: null,
          examples: null,
        },
        source: {
          repo_path: "packages/fixture/src/FixtureAction.tsx",
          export_name: "FixtureAction",
        },
      }),
      buildFixtureComponent({
        id: "fixture-navigation",
        name: "FixtureNavigation",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["navigation"],
        when_not_to_use: ["Use FixtureAction for actions instead."],
        alternatives: [
          {
            use: "FixtureAction",
            reason: "Fixture alternative documented by source-backed usage.",
          },
        ],
        related_docs: {
          overview: null,
          usage: "https://example.test/fixture/navigation/usage",
          accessibility: null,
          examples: null,
        },
        source: {
          repo_path: "packages/fixture/src/FixtureNavigation.tsx",
          export_name: "FixtureNavigation",
        },
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureNavigation } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNavigation onClick={() => saveFixture()} />;
        }
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "primitive-choice.link-action",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        category: "primitive-choice",
        rule: "navigation-component-used-as-action",
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-navigation",
              field_path: "when_not_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/navigation/usage",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-action",
              field_path: "when_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/action/usage",
            }),
          }),
        ]),
      }),
    );
  });

  it("records missing usage evidence instead of emitting unsupported navigation-as-action findings", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        id: "fixture-action",
        name: "FixtureAction",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["actions"],
        when_to_use: ["Use FixtureAction to trigger actions."],
        source: {
          repo_path: null,
          export_name: "FixtureAction",
        },
      }),
      buildFixtureComponent({
        id: "fixture-navigation",
        name: "FixtureNavigation",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
        category: ["navigation"],
        when_not_to_use: ["Use FixtureAction for actions instead."],
        alternatives: [
          {
            use: "FixtureAction",
            reason: "Fixture alternative missing source-backed usage.",
          },
        ],
        source: {
          repo_path: null,
          export_name: "FixtureNavigation",
        },
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureNavigation } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNavigation onClick={() => saveFixture()} />;
        }
      `,
    });

    expect(
      result.issues.some((item) => item.id === "primitive-choice.link-action"),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Skipped navigation-as-action validation"),
      ]),
    );
  });

  it("derives primitive recreation findings from fixture component and guide evidence", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-action",
          name: "FixtureAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["actions"],
          when_to_use: ["Use FixtureAction to trigger fixture actions."],
          related_docs: {
            overview: null,
            usage: "https://example.test/fixture/action/usage",
            accessibility: null,
            examples: null,
          },
          source: {
            repo_path: "packages/fixture/src/FixtureAction.tsx",
            export_name: "FixtureAction",
          },
        }),
        buildFixtureComponent({
          id: "fixture-navigation",
          name: "FixtureNavigation",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["navigation"],
          when_to_use: [
            "Use FixtureNavigation for fixture navigation destinations.",
          ],
          related_docs: {
            overview: null,
            usage: "https://example.test/fixture/navigation/usage",
            accessibility: null,
            examples: null,
          },
          source: {
            repo_path: "packages/fixture/src/FixtureNavigation.tsx",
            export_name: "FixtureNavigation",
          },
        }),
      ],
      [buildFixtureGuide()],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureAction, FixtureNavigation } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return (
            <>
              <button onClick={() => saveFixture()}>Save</button>
              <a href="/fixture">Go</a>
              <div role="button" onClick={() => saveFixture()}>Save</div>
              <div role="link" onClick={() => goFixture()}>Go</div>
            </>
          );
        }
      `,
    });

    const nativeButtonIssue = result.issues.find(
      (item) => item.id === "primitive-choice.native-button",
    );
    const nativeLinkIssue = result.issues.find(
      (item) => item.id === "primitive-choice.native-link",
    );
    const customButtonIssue = result.issues.find(
      (item) => item.id === "primitive-choice.custom-button-role",
    );
    const customLinkIssue = result.issues.find(
      (item) => item.id === "primitive-choice.custom-link-role",
    );

    expect(nativeButtonIssue).toEqual(
      expect.objectContaining({
        category: "primitive-choice",
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-action",
              field_path: "when_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/action/usage",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "composition",
            registry: expect.objectContaining({
              entity_id: "guide.fixture-primitive-choice",
              field_path: "summary",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/primitive-choice",
            }),
          }),
        ]),
      }),
    );
    expect(nativeLinkIssue?.evidence_refs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          registry: expect.objectContaining({
            entity_id: "fixture-navigation",
            field_path: "when_to_use.0",
          }),
        }),
        expect.objectContaining({
          claim_kind: "composition",
          registry: expect.objectContaining({
            entity_id: "guide.fixture-primitive-choice",
            field_path: "summary",
          }),
        }),
      ]),
    );
    expect(customButtonIssue?.evidence_refs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          registry: expect.objectContaining({
            entity_id: "fixture-action",
            field_path: "when_to_use.0",
          }),
        }),
        expect.objectContaining({
          claim_kind: "composition",
          registry: expect.objectContaining({
            entity_id: "guide.fixture-primitive-choice",
            field_path: "summary",
          }),
        }),
      ]),
    );
    expect(customLinkIssue?.evidence_refs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          registry: expect.objectContaining({
            entity_id: "fixture-navigation",
            field_path: "when_to_use.0",
          }),
        }),
        expect.objectContaining({
          claim_kind: "composition",
          registry: expect.objectContaining({
            entity_id: "guide.fixture-primitive-choice",
            field_path: "summary",
          }),
        }),
      ]),
    );
  });

  it("records missing primitive recreation evidence instead of emitting unsupported findings", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-action",
          name: "FixtureAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["actions"],
          when_to_use: ["Use FixtureAction to trigger fixture actions."],
          source: {
            repo_path: null,
            export_name: "FixtureAction",
          },
        }),
        buildFixtureComponent({
          id: "fixture-navigation",
          name: "FixtureNavigation",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["navigation"],
          when_to_use: [
            "Use FixtureNavigation for fixture navigation destinations.",
          ],
          source: {
            repo_path: null,
            export_name: "FixtureNavigation",
          },
        }),
      ],
      [
        buildFixtureGuide({
          related_docs: {
            overview: null,
            related_components: [],
            related_packages: ["@salt-ds/fixture"],
          },
        }),
      ],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureAction, FixtureNavigation } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return (
            <>
              <button onClick={() => saveFixture()}>Save</button>
              <a href="/fixture">Go</a>
              <div role="button" onClick={() => saveFixture()}>Save</div>
              <div role="link" onClick={() => goFixture()}>Go</div>
            </>
          );
        }
      `,
    });

    expect(
      result.issues.some((item) =>
        [
          "primitive-choice.native-button",
          "primitive-choice.native-link",
          "primitive-choice.custom-button-role",
          "primitive-choice.custom-link-role",
        ].includes(item.id),
      ),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Skipped native-button"),
        expect.stringContaining("Skipped native-link"),
        expect.stringContaining("Skipped custom-button-role"),
        expect.stringContaining("Skipped custom-link-role"),
      ]),
    );
  });

  it("derives native table recreation findings from fixture component and guide evidence", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-table",
          name: "FixtureTable",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["data display"],
          summary: "Fixture table displays structured tabular data.",
          when_to_use: ["Use FixtureTable for structured tabular data."],
          related_docs: {
            overview: null,
            usage: "https://example.test/fixture/table/usage",
            accessibility: null,
            examples: null,
          },
          source: {
            repo_path: "packages/fixture/src/FixtureTable.tsx",
            export_name: "FixtureTable",
          },
        }),
        buildFixtureComponent({
          id: "fixture-data-grid",
          name: "FixtureDataGrid",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["data display"],
          summary: "Fixture data grid displays tabular rows and columns.",
          when_to_use: ["Use FixtureDataGrid for data grid rows."],
          related_docs: {
            overview: null,
            usage: "https://example.test/fixture/data-grid/usage",
            accessibility: null,
            examples: null,
          },
          source: {
            repo_path: "packages/fixture/src/FixtureDataGrid.tsx",
            export_name: "FixtureDataGrid",
          },
        }),
      ],
      [buildFixtureGuide()],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureTable, FixtureDataGrid } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return (
            <table>
              <tbody>
                <tr><td>Fixture</td></tr>
              </tbody>
            </table>
          );
        }
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "primitive-choice.native-table",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        category: "primitive-choice",
        rule: "native-table-should-prefer-salt-fixturetable-or-fixturedatagrid",
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-table",
              field_path: "when_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/table/usage",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-data-grid",
              field_path: "when_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/data-grid/usage",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "composition",
            registry: expect.objectContaining({
              entity_id: "guide.fixture-primitive-choice",
              field_path: "summary",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/primitive-choice",
            }),
          }),
        ]),
      }),
    );
  });

  it("records missing native table evidence instead of emitting unsupported findings", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-table",
          name: "FixtureTable",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["data display"],
          summary: "Fixture table displays structured tabular data.",
          when_to_use: ["Use FixtureTable for structured tabular data."],
          source: {
            repo_path: null,
            export_name: "FixtureTable",
          },
        }),
      ],
      [
        buildFixtureGuide({
          related_docs: {
            overview: null,
            related_components: [],
            related_packages: ["@salt-ds/fixture"],
          },
        }),
      ],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureTable } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <table><tbody><tr><td>Fixture</td></tr></tbody></table>;
        }
      `,
    });

    expect(
      result.issues.some((item) => item.id === "primitive-choice.native-table"),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([expect.stringContaining("Skipped native-table")]),
    );
  });

  it("derives nested interactive findings from fixture component and guide evidence", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-outer-action",
          name: "FixtureOuterAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["actions"],
          when_to_use: ["Use FixtureOuterAction to trigger fixture actions."],
          related_docs: {
            overview: null,
            usage: "https://example.test/fixture/outer-action/usage",
            accessibility: null,
            examples: null,
          },
          source: {
            repo_path: "packages/fixture/src/FixtureOuterAction.tsx",
            export_name: "FixtureOuterAction",
          },
        }),
        buildFixtureComponent({
          id: "fixture-inner-navigation",
          name: "FixtureInnerNavigation",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["navigation"],
          when_to_use: [
            "Use FixtureInnerNavigation for fixture navigation destinations.",
          ],
          related_docs: {
            overview: null,
            usage: "https://example.test/fixture/inner-navigation/usage",
            accessibility: null,
            examples: null,
          },
          source: {
            repo_path: "packages/fixture/src/FixtureInnerNavigation.tsx",
            export_name: "FixtureInnerNavigation",
          },
        }),
      ],
      [
        buildFixtureGuide({
          id: "guide.fixture-composition-pitfalls",
          name: "Composition pitfalls",
          aliases: ["composition-pitfalls"],
          summary: "Fixture composition guidance.",
          steps: [
            {
              title: "Avoid nested interactions",
              statements: ["Do not nest interactive fixture primitives."],
              snippets: [],
            },
          ],
          related_docs: {
            overview: "https://example.test/fixture/composition-pitfalls",
            related_components: [],
            related_packages: ["@salt-ds/fixture"],
          },
        }),
      ],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureOuterAction, FixtureInnerNavigation } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return (
            <FixtureOuterAction>
              <FixtureInnerNavigation href="/fixture">Go</FixtureInnerNavigation>
            </FixtureOuterAction>
          );
        }
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "composition.nested-interactive-primitives",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        category: "composition",
        rule: "avoid-nesting-interactive-salt-primitives",
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "composition",
            registry: expect.objectContaining({
              entity_id: "guide.fixture-composition-pitfalls",
              field_path: "steps.0.statements.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/composition-pitfalls",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-outer-action",
              field_path: "when_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/outer-action/usage",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-inner-navigation",
              field_path: "when_to_use.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/inner-navigation/usage",
            }),
          }),
        ]),
      }),
    );
  });

  it("records missing nested interactive evidence instead of emitting unsupported findings", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-outer-action",
          name: "FixtureOuterAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["actions"],
          when_to_use: ["Use FixtureOuterAction to trigger fixture actions."],
          source: {
            repo_path: null,
            export_name: "FixtureOuterAction",
          },
        }),
        buildFixtureComponent({
          id: "fixture-inner-navigation",
          name: "FixtureInnerNavigation",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          category: ["navigation"],
          when_to_use: [
            "Use FixtureInnerNavigation for fixture navigation destinations.",
          ],
          source: {
            repo_path: null,
            export_name: "FixtureInnerNavigation",
          },
        }),
      ],
      [
        buildFixtureGuide({
          id: "guide.fixture-composition-pitfalls",
          name: "Composition pitfalls",
          aliases: ["composition-pitfalls"],
          summary: "Fixture composition guidance.",
          steps: [
            {
              title: "Avoid nested interactions",
              statements: ["Do not nest interactive fixture primitives."],
              snippets: [],
            },
          ],
          related_docs: {
            overview: null,
            related_components: [],
            related_packages: ["@salt-ds/fixture"],
          },
        }),
      ],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureOuterAction, FixtureInnerNavigation } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return (
            <FixtureOuterAction>
              <FixtureInnerNavigation href="/fixture">Go</FixtureInnerNavigation>
            </FixtureOuterAction>
          );
        }
      `,
    });

    expect(
      result.issues.some(
        (item) => item.id === "composition.nested-interactive-primitives",
      ),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Skipped nested-interactive validation"),
      ]),
    );
  });

  it("derives pass-through wrapper findings from fixture component and guide evidence", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-wrapped-action",
          name: "FixtureWrappedAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          related_docs: {
            overview: null,
            usage: "https://example.test/fixture/wrapped-action/usage",
            accessibility: null,
            examples: null,
          },
          source: {
            repo_path: "packages/fixture/src/FixtureWrappedAction.tsx",
            export_name: "FixtureWrappedAction",
          },
        }),
      ],
      [
        buildFixtureGuide({
          id: "guide.fixture-custom-wrappers",
          name: "Custom wrappers",
          aliases: ["custom-wrappers"],
          summary: "Fixture custom-wrapper guide.",
          steps: [
            {
              title: "When wrappers hurt",
              statements: [
                "Avoid wrappers that only forward props to a single fixture primitive.",
              ],
              snippets: [],
            },
          ],
          related_docs: {
            overview: "https://example.test/fixture/custom-wrappers",
            related_components: ["FixtureWrappedAction"],
            related_packages: ["@salt-ds/fixture"],
          },
        }),
        buildFixtureGuide({
          id: "guide.fixture-composition-pitfalls",
          name: "Composition pitfalls",
          aliases: ["composition-pitfalls"],
          summary:
            "Fixture composition guide names pass-through wrappers as a pitfall.",
          steps: [],
          related_docs: {
            overview: "https://example.test/fixture/composition-pitfalls",
            related_components: ["FixtureWrappedAction"],
            related_packages: ["@salt-ds/fixture"],
          },
        }),
      ],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureWrappedAction } from "@salt-ds/fixture";

        export const FixtureWrapper = (props) => <FixtureWrappedAction {...props} />;
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "composition.pass-through-wrapper",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        category: "composition",
        rule: "avoid-pass-through-wrapper-over-salt-primitive",
        message:
          "Custom wrappers: Avoid wrappers that only forward props to a single fixture primitive. Wrapped component: FixtureWrappedAction.",
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "composition",
            registry: expect.objectContaining({
              entity_id: "guide.fixture-custom-wrappers",
              field_path: "steps.0.statements.0",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/custom-wrappers",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "composition",
            registry: expect.objectContaining({
              entity_id: "guide.fixture-composition-pitfalls",
              field_path: "summary",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/composition-pitfalls",
            }),
          }),
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "component",
            registry: expect.objectContaining({
              entity_id: "fixture-wrapped-action",
              field_path: "name",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/wrapped-action/usage",
            }),
          }),
          expect.objectContaining({
            source_kind: "workflow_input",
            claim_kind: "workflow",
            workflow_input: expect.objectContaining({
              field_path: "code",
            }),
          }),
        ]),
      }),
    );
  });

  it("records missing pass-through wrapper evidence instead of emitting unsupported findings", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-wrapped-action",
          name: "FixtureWrappedAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
          source: {
            repo_path: null,
            export_name: "FixtureWrappedAction",
          },
        }),
      ],
      [
        buildFixtureGuide({
          id: "guide.fixture-custom-wrappers",
          name: "Custom wrappers",
          aliases: ["custom-wrappers"],
          summary: "Fixture custom-wrapper guide.",
          steps: [
            {
              title: "When wrappers hurt",
              statements: [
                "Avoid wrappers that only forward props to a single fixture primitive.",
              ],
              snippets: [],
            },
          ],
          related_docs: {
            overview: null,
            related_components: ["FixtureWrappedAction"],
            related_packages: ["@salt-ds/fixture"],
          },
        }),
      ],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureWrappedAction } from "@salt-ds/fixture";

        export const FixtureWrapper = (props) => <FixtureWrappedAction {...props} />;
      `,
    });

    expect(
      result.issues.some(
        (item) => item.id === "composition.pass-through-wrapper",
      ),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Skipped pass-through wrapper validation"),
      ]),
    );
  });

  it("derives token-policy findings from fixture token records", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-styled-action",
          name: "FixtureStyledAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
        }),
      ],
      [],
      [
        buildFixtureToken(),
        buildFixtureToken({
          name: "--fixture-palette-accent-border",
          category: "palette",
          type: "color",
          value: "#336699",
          semantic_intent: "Fixture palette token.",
          guidance: ["Fixture palette token guidance."],
          policy: {
            usage_tier: "palette",
            direct_component_use: "never",
            preferred_for: ["fixture theme mapping"],
            avoid_for: ["direct fixture component styling"],
            notes: [
              "Fixture palette tokens are not for direct component styling.",
            ],
            docs: ["https://example.test/fixture/tokens"],
            structural_roles: [],
            pairing: null,
          },
        }),
      ],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureStyledAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return (
            <FixtureStyledAction
              style={{
                height: "12px",
                color: "var(--fixture-palette-accent-border)",
              }}
            />
          );
        }
      `,
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "tokens.hardcoded-size",
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "token",
              registry: expect.objectContaining({
                entity_id: "--fixture-size-base",
              }),
              source: expect.objectContaining({
                url: "https://example.test/fixture/tokens",
              }),
            }),
            expect.objectContaining({
              source_kind: "workflow_input",
              claim_kind: "workflow",
            }),
          ]),
        }),
        expect.objectContaining({
          id: "tokens.palette-direct-use",
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "token",
              registry: expect.objectContaining({
                entity_id: "--fixture-palette-accent-border",
              }),
            }),
            expect.objectContaining({
              source_kind: "workflow_input",
              claim_kind: "workflow",
            }),
          ]),
        }),
      ]),
    );
  });

  it("records missing token evidence instead of emitting unsupported hardcoded-size findings", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        id: "fixture-styled-action",
        name: "FixtureStyledAction",
        package: {
          name: "@salt-ds/fixture",
          status: "stable",
          since: null,
        },
        status: "stable",
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureStyledAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureStyledAction style={{ height: "12px" }} />;
        }
      `,
    });

    expect(
      result.issues.some((item) => item.id === "tokens.hardcoded-size"),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Skipped hardcoded-size token validation"),
      ]),
    );
  });

  it("records missing token structural-role evidence instead of emitting unsupported border-token findings", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-styled-action",
          name: "FixtureStyledAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
        }),
      ],
      [],
      [
        buildFixtureToken({
          name: "--salt-size-base",
          category: "size",
          guidance: ["Fixture size token guidance."],
          policy: {
            usage_tier: "foundation",
            direct_component_use: "conditional",
            preferred_for: ["fixture structural sizing"],
            avoid_for: [],
            notes: ["Fixture token policy guidance."],
            docs: ["https://example.test/fixture/tokens"],
            structural_roles: [],
            pairing: null,
          },
        }),
      ],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureStyledAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureStyledAction style={{ borderWidth: "var(--salt-size-base)" }} />;
        }
      `,
    });

    expect(
      result.issues.some(
        (item) => item.id === "tokens.border-thickness-not-fixed",
      ),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "source-backed structural-role rule-pack evidence for fixed border or separator thickness was missing",
        ),
      ]),
    );
  });

  it("emits structural-role token findings only when fixture rule-pack evidence is present", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-styled-action",
          name: "FixtureStyledAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
        }),
      ],
      [],
      [
        buildFixtureToken({
          name: "--salt-size-base",
          category: "size",
          guidance: ["Fixture size token guidance."],
          policy: {
            usage_tier: "foundation",
            direct_component_use: "conditional",
            preferred_for: ["fixture structural sizing"],
            avoid_for: [],
            notes: ["Fixture token policy guidance."],
            docs: ["https://example.test/fixture/tokens"],
            structural_roles: [],
            pairing: null,
          },
        }),
        buildFixtureToken({
          name: "--salt-size-fixed-100",
          category: "size",
          guidance: ["Fixture fixed-size token guidance."],
          policy: {
            usage_tier: "foundation",
            direct_component_use: "conditional",
            preferred_for: ["fixture border thickness"],
            avoid_for: [],
            notes: ["Fixture fixed token is for border thickness."],
            docs: ["https://example.test/fixture/tokens"],
            structural_roles: ["border-thickness"],
            pairing: null,
          },
        }),
      ],
      buildFixtureStructuralRoleRulePack({
        kind: "fixed-size",
        category: "size",
        tokenFamily: "size",
        tokenModifier: "fixed",
        evidenceText:
          "Fixture fixed-size evidence mentions --salt-size-fixed-100 for border thickness.",
        evidenceTerms: ["border"],
      }),
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureStyledAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureStyledAction style={{ borderWidth: "var(--salt-size-base)" }} />;
        }
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "tokens.border-thickness-not-fixed",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            source_kind: "docs",
            claim_kind: "token",
            source: expect.objectContaining({
              repo_path: "fixture/docs/token-rules.mdx",
            }),
          }),
        ]),
      }),
    );
  });

  it("emits unknown token findings from workflow input without inventing registry token evidence", () => {
    const registry = buildFixtureRegistry(
      [
        buildFixtureComponent({
          id: "fixture-styled-action",
          name: "FixtureStyledAction",
          package: {
            name: "@salt-ds/fixture",
            status: "stable",
            since: null,
          },
          status: "stable",
        }),
      ],
      [],
      [buildFixtureToken()],
    );

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureStyledAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureStyledAction style={{ height: "var(--fixture-size-missing)" }} />;
        }
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "tokens.unknown-salt-token",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        evidence_refs: [
          expect.objectContaining({
            source_kind: "workflow_input",
            claim_kind: "workflow",
          }),
        ],
      }),
    );
  });

  it("derives icon-only accessible-name findings from fixture registry accessibility rules", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        accessibility: {
          summary: ["Fixture accessible-name summary from registry."],
          rules: [
            {
              id: "fixture-accessible-name",
              severity: "warning",
              rule: "Fixture icon-only usage needs an accessible name.",
            },
          ],
        },
        related_docs: {
          overview: null,
          usage: null,
          accessibility: "https://example.test/fixture/accessibility",
          examples: null,
        },
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureNonStableAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNonStableAction><FixtureIcon /></FixtureNonStableAction>;
        }
      `,
    });

    const issue = result.issues.find(
      (item) => item.id === "a11y.fixturenonstableaction-accessible-name",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        category: "accessibility",
        rule: "fixture-accessible-name",
        message: "Fixture icon-only usage needs an accessible name.",
        evidence_refs: [
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "accessibility",
            registry: expect.objectContaining({
              entity_id: "fixture-nonstable-action",
              field_path: "accessibility.rules.fixture-accessible-name",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/accessibility",
            }),
          }),
        ],
      }),
    );
  });

  it("records missing accessibility evidence instead of emitting an unsupported fixture finding", () => {
    const registry = buildFixtureRegistry([buildFixtureComponent()]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureNonStableAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNonStableAction><FixtureIcon /></FixtureNonStableAction>;
        }
      `,
    });

    expect(
      result.issues.some(
        (item) =>
          item.id === "a11y.fixture-nonstable-action-accessible-name" ||
          item.id === "a11y.fixturenonstableaction-accessible-name" ||
          item.category === "accessibility",
      ),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Skipped icon-only accessible-name validation"),
      ]),
    );
  });

  it("derives decorative-icon findings from fixture registry accessibility rules", () => {
    const registry = buildFixtureRegistry([
      buildFixtureComponent({
        accessibility: {
          summary: ["Fixture decorative icon summary from registry."],
          rules: [
            {
              id: "fixture-decorative-icon-hidden",
              severity: "warning",
              rule: "Fixture decorative icons need aria-hidden.",
            },
          ],
        },
        related_docs: {
          overview: null,
          usage: null,
          accessibility: "https://example.test/fixture/accessibility",
          examples: null,
        },
      }),
    ]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureNonStableAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNonStableAction><FixtureIcon /> Label</FixtureNonStableAction>;
        }
      `,
    });

    const issue = result.issues.find(
      (item) =>
        item.id === "a11y.fixturenonstableaction-decorative-icon-hidden",
    );

    expect(issue).toEqual(
      expect.objectContaining({
        category: "accessibility",
        rule: "fixture-decorative-icon-hidden",
        message: "Fixture decorative icons need aria-hidden.",
        evidence_refs: [
          expect.objectContaining({
            source_kind: "registry",
            claim_kind: "accessibility",
            registry: expect.objectContaining({
              entity_id: "fixture-nonstable-action",
              field_path: "accessibility.rules.fixture-decorative-icon-hidden",
            }),
            source: expect.objectContaining({
              url: "https://example.test/fixture/accessibility",
            }),
          }),
        ],
      }),
    );
  });

  it("records missing decorative-icon evidence instead of emitting an unsupported fixture finding", () => {
    const registry = buildFixtureRegistry([buildFixtureComponent()]);

    const result = validateSaltUsage(registry, {
      code: `
        import { FixtureNonStableAction } from "@salt-ds/fixture";

        export function FixtureUsage() {
          return <FixtureNonStableAction><FixtureIcon /> Label</FixtureNonStableAction>;
        }
      `,
    });

    expect(
      result.issues.some(
        (item) =>
          item.id === "a11y.fixturenonstableaction-decorative-icon-hidden" ||
          item.category === "accessibility",
      ),
    ).toBe(false);
    expect(result.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Skipped decorative-icon accessibility validation",
        ),
      ]),
    );
  });
});
