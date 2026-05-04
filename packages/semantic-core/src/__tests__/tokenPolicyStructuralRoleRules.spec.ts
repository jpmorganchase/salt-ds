import { describe, expect, it } from "vitest";
import {
  buildTokenPolicyStructuralRoleRulePack,
  findTokenStructuralRoleRuleEvidence,
  SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
  type SaltTokenPolicyStructuralRoleRulePack,
  validateTokenPolicyStructuralRoleRulePackEvidence,
} from "../tokenPolicyStructuralRoleRules.js";

// Fixture-only rule records: these names are intentionally synthetic and do
// not encode Salt design-system facts.
const fixtureRule = {
  id: "/fixture/docs/token-rules#fixture-pairing",
  category: "fixture",
  kind: "container-pairing" as const,
  source: {
    route: "/fixture/docs/token-rules",
    repo_path: "fixture/docs/token-rules.mdx",
  },
  evidence_text:
    "Fixture role source says fixture backgrounds and fixture border colors are paired.",
  evidence_terms: ["fixture"],
  token_family: "fixture",
};

describe("token policy structural role rule packs", () => {
  it("serializes fixture source-backed rules with EvidenceRefs", () => {
    const pack = buildTokenPolicyStructuralRoleRulePack({
      structural_role_rules: [fixtureRule],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core fixture",
      },
      registry: {
        version: "fixture-registry",
      },
    });

    expect(pack.contract).toBe(
      SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
    );
    expect(pack.rules[0]).toMatchObject({
      match: {
        category: "fixture",
        token_family: "fixture",
      },
      emits: {
        structural_role_templates: ["{token_family}-{token_property}"],
        pairing_template: {
          family: "{token_family}",
          role: "{token_family}-{token_property}",
          level: "{first_modifier}",
        },
      },
      evidence_refs: [
        expect.objectContaining({
          source_kind: "docs",
          claim_kind: "token",
          source: {
            url: "/fixture/docs/token-rules",
            repo_path: "fixture/docs/token-rules.mdx",
          },
        }),
      ],
    });
    expect(validateTokenPolicyStructuralRoleRulePackEvidence(pack)).toEqual([]);
  });

  it("rejects fixture rules without source-backed EvidenceRefs", () => {
    const pack = buildTokenPolicyStructuralRoleRulePack({
      structural_role_rules: [fixtureRule],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core fixture",
      },
      registry: {
        version: "fixture-registry",
      },
    });
    const invalidPack: SaltTokenPolicyStructuralRoleRulePack = {
      ...pack,
      rules: [
        {
          ...pack.rules[0],
          evidence_refs: [],
        },
      ],
    };

    expect(
      validateTokenPolicyStructuralRoleRulePackEvidence(invalidPack),
    ).toEqual([
      expect.objectContaining({
        code: "missing_rule_evidence",
        path: "rules[0].evidence_refs",
      }),
      expect.objectContaining({
        code: "missing_source_backed_rule_evidence",
        path: "rules[0].evidence_refs",
      }),
    ]);
  });

  it("resolves fixture structural roles back to rule EvidenceRefs", () => {
    const pack = buildTokenPolicyStructuralRoleRulePack({
      structural_role_rules: [fixtureRule],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core fixture",
      },
      registry: {
        version: "fixture-registry",
      },
    });

    expect(
      findTokenStructuralRoleRuleEvidence({
        rule_pack: pack,
        token: {
          name: "--salt-fixture-primary-background",
          category: "fixture",
        },
        structural_role: "fixture-background",
      }),
    ).toEqual(pack.rules[0].evidence_refs);
  });

  it("resolves fixture feedback structural roles only when source-backed rule text supports them", () => {
    const pack = buildTokenPolicyStructuralRoleRulePack({
      structural_role_rules: [
        {
          id: "/fixture/docs/token-rules#fixture-feedback",
          category: "fixture",
          kind: "separable-token",
          source: {
            route: "/fixture/docs/token-rules",
            repo_path: "fixture/docs/token-rules.mdx",
          },
          evidence_text:
            "Fixture separators provide visual feedback for fixture background and foreground changes.",
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

    expect(pack.rules[0].emits.structural_role_templates).toEqual([
      "fixture-{token_property_role}",
      "fixture-feedback-{token_property_role}",
    ]);
    expect(
      findTokenStructuralRoleRuleEvidence({
        rule_pack: pack,
        token: {
          name: "--salt-fixture-background",
          category: "fixture",
        },
        structural_role: "fixture-feedback-background",
      }),
    ).toEqual(pack.rules[0].evidence_refs);
    expect(validateTokenPolicyStructuralRoleRulePackEvidence(pack)).toEqual([]);
  });
});
