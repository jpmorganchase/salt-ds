import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildRegistry } from "../core/build/buildRegistry.js";
import { cleanMarkdownText } from "../core/build/buildRegistryShared.js";
import {
  buildTokenPolicySourceRegistry,
  getTokenPolicy,
  type TokenPolicySourceRegistry,
} from "../core/build/buildRegistryTokenPolicy.js";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltGeneratedArtifact,
} from "../core/evidence.js";
import { validateGeneratedArtifactRegistryEvidence } from "../core/generatedArtifactValidation.js";
import {
  getRegistryPatternValidationRulePack,
  SALT_PATTERN_VALIDATION_RULE_PACK_CONTRACT,
  type SaltPatternValidationRulePack,
  validatePatternValidationRulePackEvidence,
} from "../core/patternValidationRulePacks.js";
import { REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT } from "../core/registry/artifacts.js";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import {
  buildTokenPolicyStructuralRoleRulePack,
  SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
  type SaltTokenPolicyStructuralRoleRulePack,
  validateTokenPolicyStructuralRoleRulePackEvidence,
} from "../core/tokenPolicyStructuralRoleRules.js";
import { getToken } from "../core/tools/getToken.js";
import { recommendTokens } from "../core/tools/recommendTokens.js";
import type { SaltRegistry } from "../core/types.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const DESIGN_TOKENS_URL = "/salt/themes/design-tokens/index";
let outputDir = "";
let builtRegistry: Awaited<ReturnType<typeof buildRegistry>>;
let tokenPolicySources: TokenPolicySourceRegistry;
let builtPatternRulePack: SaltPatternValidationRulePack;
let builtStructuralRoleRulePack: SaltTokenPolicyStructuralRoleRulePack;
let builtTokensArtifact: {
  tokens: Array<{
    name: string;
    policy?: {
      preferred_for?: string[] | null;
      avoid_for?: string[] | null;
      notes?: string[] | null;
      docs?: string[] | null;
      evidence_refs?: Array<{
        contract: string;
        source_kind: string;
        claim_kind: string;
        source?: {
          url?: string | null;
          repo_path?: string | null;
        } | null;
      }> | null;
      structural_roles?: string[] | null;
      pairing?: {
        family: string;
        role: string;
        level?: string | null;
      } | null;
    } | null;
  }>;
};

function readJsonFile(filePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
    string,
    unknown
  >;
}

beforeAll(async () => {
  outputDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "salt-token-policy-build-"),
  );
  [tokenPolicySources, builtRegistry] = await Promise.all([
    buildTokenPolicySourceRegistry(REPO_ROOT),
    buildRegistry({
      sourceRoot: REPO_ROOT,
      outputDir,
      timestamp: "2026-03-26T00:00:00Z",
    }),
  ]);
  builtTokensArtifact = JSON.parse(
    fs.readFileSync(path.join(outputDir, "tokens.json"), "utf8"),
  ) as typeof builtTokensArtifact;
  const structuralRoleRulePackArtifact = readJsonFile(
    path.join(
      outputDir,
      REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT.file_name,
    ),
  );
  builtStructuralRoleRulePack = structuralRoleRulePackArtifact[
    REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT.key
  ] as SaltTokenPolicyStructuralRoleRulePack;
  builtPatternRulePack = getRegistryPatternValidationRulePack(builtRegistry);
}, 120_000);

afterAll(() => {
  if (outputDir) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

describe("generated token policy", () => {
  function expectPolicyDocsBacked(policy: ReturnType<typeof getTokenPolicy>) {
    expect(policy).not.toBeNull();
    if (!policy) {
      throw new Error("Expected fixture token policy.");
    }

    expect(policy.evidence_refs).toHaveLength(policy.docs.length);
    for (const doc of policy.docs) {
      expect(policy.evidence_refs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            contract: SALT_EVIDENCE_REF_CONTRACT,
            source_kind: "docs",
            claim_kind: "token",
            source: expect.objectContaining({
              url: doc,
              repo_path: expect.stringMatching(/^site\/docs\//),
            }),
          }),
        ]),
      );
    }
  }

  function findPolicyDocText(docRoute: string): string | null {
    const allSources = [
      tokenPolicySources.design_tokens_overview,
      tokenPolicySources.foundations_index,
      ...tokenPolicySources.characteristic_docs_by_category.values(),
      ...tokenPolicySources.foundation_docs_by_category.values(),
    ];
    const source = allSources.find(
      (candidate) => candidate?.route === docRoute,
    );
    return source ? cleanMarkdownText(source.content) : null;
  }

  function expectPolicyProseBackedByCitedDocs(
    policy: ReturnType<typeof getTokenPolicy>,
  ) {
    expect(policy).not.toBeNull();
    if (!policy) {
      throw new Error("Expected fixture token policy.");
    }

    const citedDocsText = policy.docs
      .map((doc) => findPolicyDocText(doc))
      .filter((text): text is string => Boolean(text))
      .join(" ");
    const generatedTextClaims = [
      ...policy.preferred_for,
      ...policy.avoid_for,
      ...policy.notes,
    ];

    for (const text of generatedTextClaims) {
      expect(citedDocsText).toContain(text);
    }
  }

  it("uses the real design token docs instead of defaulting every palette token to the summary route", () => {
    const policy = getTokenPolicy(
      {
        name: "--salt-palette-accent-border",
        category: "palette",
      },
      tokenPolicySources,
    );

    expect(policy).toMatchObject({
      usage_tier: "palette",
      direct_component_use: "never",
      docs: [DESIGN_TOKENS_URL],
    });
    expectPolicyDocsBacked(policy);
    expectPolicyProseBackedByCitedDocs(policy);
  });

  it("prefers the specific characteristic doc for characteristic tokens", () => {
    const policy = getTokenPolicy(
      {
        name: "--salt-container-primary-background",
        category: "container",
      },
      tokenPolicySources,
    );

    expect(policy?.docs).toEqual([
      "/salt/themes/design-tokens/container-characteristic",
      DESIGN_TOKENS_URL,
    ]);
    expectPolicyDocsBacked(policy);
    expectPolicyProseBackedByCitedDocs(policy);
    expect(policy?.structural_roles).toEqual(["container-background"]);
    expect(policy?.pairing).toEqual({
      family: "container",
      role: "container-background",
      level: "primary",
    });
  });

  it("grounds focused and text policies in category-specific characteristic prose", () => {
    const focusedPolicy = getTokenPolicy(
      {
        name: "--salt-focused-outlineColor",
        category: "focused",
      },
      tokenPolicySources,
    );
    const textPolicy = getTokenPolicy(
      {
        name: "--salt-text-fontWeight",
        category: "text",
      },
      tokenPolicySources,
    );

    expect(focusedPolicy?.preferred_for).toContain(
      "Focused tokens define the outline used to indicate when an element receives focus. The family provides outline color, style, width, inset and offset tokens, plus the composed --salt-focused-outline shortcut.",
    );
    expect(textPolicy?.preferred_for).toContain(
      "Text tokens define typographic roles used alongside other characteristics to style textual content. The family includes base body text plus action, heading, display, label, notation and code roles, with font and density-dependent size and line-height values where applicable.",
    );
    expectPolicyDocsBacked(focusedPolicy);
    expectPolicyDocsBacked(textPolicy);
    expectPolicyProseBackedByCitedDocs(focusedPolicy);
    expectPolicyProseBackedByCitedDocs(textPolicy);
  });

  it("prefers the specific foundation doc for foundation tokens", () => {
    const policy = getTokenPolicy(
      {
        name: "--salt-size-fixed-100",
        category: "size",
      },
      tokenPolicySources,
    );

    expect(policy?.docs).toEqual(["/salt/foundations/size", DESIGN_TOKENS_URL]);
    expectPolicyDocsBacked(policy);
    expectPolicyProseBackedByCitedDocs(policy);
    expect(policy?.structural_roles).toEqual([
      "border-thickness",
      "separator-thickness",
    ]);
  });

  it("encodes default border style roles from the foundation docs", () => {
    const policy = getTokenPolicy(
      {
        name: "--salt-borderStyle-solid",
        category: "borderstyle",
      },
      tokenPolicySources,
    );

    expect(policy?.docs).toEqual([
      "/salt/foundations/borderStyle",
      DESIGN_TOKENS_URL,
    ]);
    expectPolicyDocsBacked(policy);
    expectPolicyProseBackedByCitedDocs(policy);
    expect(policy?.structural_roles).toEqual([
      "border-style-default",
      "divider-style-default",
    ]);
  });

  it("encodes separator roles from the separable characteristic docs", () => {
    const policy = getTokenPolicy(
      {
        name: "--salt-separable-secondary-borderColor",
        category: "separable",
      },
      tokenPolicySources,
    );

    expect(policy?.docs).toEqual([
      "/salt/themes/design-tokens/separable-characteristic",
      DESIGN_TOKENS_URL,
    ]);
    expectPolicyDocsBacked(policy);
    expectPolicyProseBackedByCitedDocs(policy);
    expect(policy?.structural_roles).toEqual(["separator-color"]);
  });

  it("keeps generated token policy prose backed by cited docs", () => {
    const undocumentedPolicyText = builtRegistry.tokens
      .filter((token) => token.policy)
      .flatMap((token) => {
        const docsText = (token.policy?.docs ?? [])
          .map((doc) => findPolicyDocText(doc))
          .filter((text): text is string => Boolean(text))
          .join(" ");
        return [
          ...(token.policy?.preferred_for ?? []),
          ...(token.policy?.avoid_for ?? []),
          ...(token.policy?.notes ?? []),
        ]
          .filter((text) => !docsText.includes(text))
          .map((text) => `${token.name} -> ${text}`);
      });

    expect(undocumentedPolicyText).toEqual([]);
  });

  it("keeps structural role rules backed by their source docs", () => {
    const undocumentedRules = tokenPolicySources.structural_role_rules
      .filter(
        (rule) =>
          !cleanMarkdownText(rule.source.content).includes(rule.evidence_text),
      )
      .map((rule) => rule.id);

    expect(undocumentedRules).toEqual([]);
    expect(tokenPolicySources.structural_role_rules.length).toBeGreaterThan(0);
  });

  it("serializes structural role rules as a source-backed rule pack", () => {
    const rulePack = buildTokenPolicyStructuralRoleRulePack({
      structural_role_rules: tokenPolicySources.structural_role_rules,
      generated_at: "2026-03-26T00:00:00Z",
      generator: {
        name: "mcp-core test",
      },
      registry: {
        version: builtRegistry.version,
        generated_at: builtRegistry.generated_at,
      },
    });

    expect(rulePack.contract).toBe(
      SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
    );
    expect(rulePack.rules).toHaveLength(
      tokenPolicySources.structural_role_rules.length,
    );
    expect(validateTokenPolicyStructuralRoleRulePackEvidence(rulePack)).toEqual(
      [],
    );
    expect(rulePack.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          emits: expect.objectContaining({
            structural_role_templates: expect.any(Array),
          }),
          evidence_refs: [
            expect.objectContaining({
              contract: SALT_EVIDENCE_REF_CONTRACT,
              source_kind: "docs",
              claim_kind: "token",
              source: expect.objectContaining({
                repo_path: expect.stringMatching(/^site\/docs\//),
              }),
            }),
          ],
        }),
      ]),
    );
  });

  it("writes the structural role rule pack with the registry build output", () => {
    expect(builtStructuralRoleRulePack.contract).toBe(
      SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
    );
    expect(builtRegistry.token_policy_structural_role_rule_pack).toEqual(
      builtStructuralRoleRulePack,
    );
    expect(builtStructuralRoleRulePack.rules).toHaveLength(
      tokenPolicySources.structural_role_rules.length,
    );
    expect(
      validateTokenPolicyStructuralRoleRulePackEvidence(
        builtStructuralRoleRulePack,
      ),
    ).toEqual([]);
  });

  it("loads the structural role rule pack through the shared registry loader", async () => {
    const loadedRegistry = await loadRegistry({
      registryDir: outputDir,
    });

    expect(loadedRegistry.token_policy_structural_role_rule_pack).toEqual(
      builtStructuralRoleRulePack,
    );
  });

  it("derives and caches the pattern validation rule pack from current patterns", async () => {
    expect(builtPatternRulePack.contract).toBe(
      SALT_PATTERN_VALIDATION_RULE_PACK_CONTRACT,
    );
    expect(getRegistryPatternValidationRulePack(builtRegistry)).toBe(
      builtPatternRulePack,
    );
    expect(
      validatePatternValidationRulePackEvidence(
        builtPatternRulePack,
        builtRegistry,
      ),
    ).toEqual([]);

    const loadedRegistry = await loadRegistry({
      registryDir: outputDir,
    });
    expect(getRegistryPatternValidationRulePack(loadedRegistry)).toEqual(
      builtPatternRulePack,
    );
  });

  it("validates the structural role rule pack schema", () => {
    const ajv = new Ajv2020({
      allErrors: true,
      strict: false,
    });
    ajv.addSchema(
      readJsonFile(
        path.join(
          REPO_ROOT,
          "packages/mcp/schemas/salt-evidence-ref.schema.json",
        ),
      ),
    );
    const schema = readJsonFile(
      path.join(
        REPO_ROOT,
        "packages/mcp/schemas/salt-token-policy-structural-role-rule-pack.schema.json",
      ),
    );
    const validate = ajv.compile(schema);
    const valid = validate(builtStructuralRoleRulePack);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it("validates the pattern validation rule pack schema", () => {
    const ajv = new Ajv2020({
      allErrors: true,
      strict: false,
    });
    ajv.addSchema(
      readJsonFile(
        path.join(
          REPO_ROOT,
          "packages/mcp/schemas/salt-evidence-ref.schema.json",
        ),
      ),
    );
    const schema = readJsonFile(
      path.join(
        REPO_ROOT,
        "packages/mcp/schemas/salt-pattern-validation-rule-pack.schema.json",
      ),
    );
    const validate = ajv.compile(schema);
    const valid = validate(builtPatternRulePack);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it("requires structural role claims to resolve to rule-pack evidence", () => {
    const structuralRoleToken = builtRegistry.tokens.find(
      (token) => (token.policy?.structural_roles?.length ?? 0) > 0,
    );
    if (!structuralRoleToken) {
      throw new Error("Expected source-backed structural-role token.");
    }

    const artifact: SaltGeneratedArtifact = {
      contract: "salt_generated_artifact_v1",
      artifact_kind: "pattern-guidance",
      id: "token-structural-role.fixture",
      generated_at: "2026-03-26T00:00:00Z",
      generator: {
        name: "mcp-core test",
      },
      registry: {
        version: builtRegistry.version,
        generated_at: builtRegistry.generated_at,
      },
      claims: [
        {
          id: "token-structural-role.fixture.claim",
          kind: "token",
          text: "Fixture claim for source-backed token structural role.",
          field_path: "policy.structural_roles.0",
          evidence_ref_ids: ["token-structural-role.fixture.ref"],
        },
      ],
      evidence_refs: [
        {
          contract: SALT_EVIDENCE_REF_CONTRACT,
          id: "token-structural-role.fixture.ref",
          source_kind: "registry",
          claim_kind: "token",
          registry: {
            entity_type: "token",
            entity_id: structuralRoleToken.name,
            entity_name: structuralRoleToken.name,
            field_path: "policy.structural_roles.0",
            registry_version: builtRegistry.version,
          },
          source: structuralRoleToken.policy?.docs[0]
            ? {
                url: structuralRoleToken.policy.docs[0],
              }
            : null,
          confidence: "high",
        },
      ],
    };

    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, builtRegistry, {
        tokenPolicyStructuralRoleRulePack: builtStructuralRoleRulePack,
      }),
    ).toEqual([]);
    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, {
        ...builtRegistry,
        token_policy_structural_role_rule_pack: null,
      }),
    ).toEqual([
      expect.objectContaining({
        code: "missing_structural_role_rule_evidence",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("does not infer structural roles when source-backed role rules are missing", () => {
    const fixtureSources: TokenPolicySourceRegistry = {
      ...tokenPolicySources,
      structural_role_rules: [],
    };

    const policy = getTokenPolicy(
      {
        name: "--salt-container-primary-background",
        category: "container",
      },
      fixtureSources,
    );

    expect(policy?.structural_roles).toEqual([]);
    expect(policy?.pairing).toBeNull();
  });

  it("does not generate fixture policy when required source evidence is missing", () => {
    // Fixture-only source registry: proves missing docs produce no Salt claim
    // instead of fallback guidance.
    const fixtureSources: TokenPolicySourceRegistry = {
      design_tokens_overview: null,
      foundations_index: null,
      characteristic_docs_by_category: new Map(),
      foundation_docs_by_category: new Map(),
      foundation_categories: new Set(["fixture"]),
      deprecated_replacements_by_token: new Map(),
      deprecated_unsupported_policy_by_token: new Map(),
      token_declarations_by_token: new Map(),
      structural_role_rules: [],
    };

    expect(
      getTokenPolicy(
        {
          name: "--fixture-palette-accent",
          category: "palette",
        },
        fixtureSources,
      ),
    ).toBeNull();
    expect(
      getTokenPolicy(
        {
          name: "--fixture-size-fixed-100",
          category: "fixture",
        },
        fixtureSources,
      ),
    ).toBeNull();
  });

  it("keeps the generated token artifact aligned with the specific docs", () => {
    const accentToken = builtTokensArtifact.tokens.find(
      (token) => token.name === "--salt-accent-background",
    );
    const containerToken = builtTokensArtifact.tokens.find(
      (token) => token.name === "--salt-container-primary-background",
    );
    const paletteToken = builtTokensArtifact.tokens.find(
      (token) => token.name === "--salt-palette-accent-border",
    );

    expect(accentToken?.policy?.docs).toEqual([DESIGN_TOKENS_URL]);
    const accentEvidenceRefs = accentToken?.policy?.evidence_refs ?? [];
    expect(
      accentEvidenceRefs.filter(
        (ref) => ref.source_kind === "docs" && ref.source?.url,
      ),
    ).toEqual([
      expect.objectContaining({
        contract: SALT_EVIDENCE_REF_CONTRACT,
        source_kind: "docs",
        claim_kind: "token",
        source: expect.objectContaining({
          url: DESIGN_TOKENS_URL,
          repo_path: "site/docs/themes/design-tokens/index.mdx",
        }),
      }),
    ]);
    expect(accentEvidenceRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "token",
          source: expect.objectContaining({
            repo_path: "packages/theme/css/deprecated/characteristics.css",
          }),
        }),
        expect.objectContaining({
          source_kind: "token",
          source: expect.objectContaining({
            repo_path: "packages/theme/css/legacy/palette/accent.css",
          }),
        }),
      ]),
    );
    expect(containerToken?.policy?.structural_roles).toEqual([
      "container-background",
    ]);
    expect(containerToken?.policy?.pairing).toEqual({
      family: "container",
      role: "container-background",
      level: "primary",
    });
    expect(paletteToken?.policy?.docs).toEqual([DESIGN_TOKENS_URL]);
    expect(paletteToken?.policy?.evidence_refs?.[0]).toMatchObject({
      contract: SALT_EVIDENCE_REF_CONTRACT,
      source_kind: "docs",
      claim_kind: "token",
      source: {
        url: DESIGN_TOKENS_URL,
        repo_path: "site/docs/themes/design-tokens/index.mdx",
      },
    });
  });

  it("keeps buildRegistry output aligned with the specific docs", () => {
    const accentToken = builtRegistry.tokens.find(
      (token) => token.name === "--salt-accent-background",
    );
    const containerToken = builtRegistry.tokens.find(
      (token) => token.name === "--salt-container-primary-background",
    );
    const paletteToken = builtRegistry.tokens.find(
      (token) => token.name === "--salt-palette-accent-border",
    );

    expect(accentToken?.policy?.docs).toEqual([DESIGN_TOKENS_URL]);
    const accentEvidenceRefs = accentToken?.policy?.evidence_refs ?? [];
    expect(
      accentEvidenceRefs.filter(
        (ref) => ref.source_kind === "docs" && ref.source?.url,
      ),
    ).toEqual([
      expect.objectContaining({
        contract: SALT_EVIDENCE_REF_CONTRACT,
        source_kind: "docs",
        claim_kind: "token",
        source: expect.objectContaining({
          url: DESIGN_TOKENS_URL,
          repo_path: "site/docs/themes/design-tokens/index.mdx",
        }),
      }),
    ]);
    expect(accentEvidenceRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "token",
          source: expect.objectContaining({
            repo_path: "packages/theme/css/deprecated/characteristics.css",
          }),
        }),
        expect.objectContaining({
          source_kind: "token",
          source: expect.objectContaining({
            repo_path: "packages/theme/css/legacy/palette/accent.css",
          }),
        }),
      ]),
    );
    expect(containerToken?.policy?.structural_roles).toEqual([
      "container-background",
    ]);
    expect(containerToken?.policy?.pairing).toEqual({
      family: "container",
      role: "container-background",
      level: "primary",
    });
    expect(paletteToken?.policy?.docs).toEqual([DESIGN_TOKENS_URL]);
    expect(paletteToken?.policy?.evidence_refs?.[0]).toMatchObject({
      contract: SALT_EVIDENCE_REF_CONTRACT,
      source_kind: "docs",
      claim_kind: "token",
      source: {
        url: DESIGN_TOKENS_URL,
        repo_path: "site/docs/themes/design-tokens/index.mdx",
      },
    });
  });

  it("fails if a generated token policy doc lacks source-backed evidence", () => {
    const docsWithoutEvidence = builtRegistry.tokens
      .filter((token) => token.policy)
      .flatMap((token) => {
        const evidenceUrls = new Set(
          token.policy?.evidence_refs?.map((ref) => ref.source?.url) ?? [],
        );
        return (token.policy?.docs ?? [])
          .filter((doc) => !evidenceUrls.has(doc))
          .map((doc) => `${token.name} -> ${doc}`);
      });

    expect(docsWithoutEvidence).toEqual([]);
  });
});

describe("token tools", () => {
  // Fixture-only registry: verifies tool serializers trust registry token docs
  // instead of adding Salt docs routes outside registry evidence.
  const registry: SaltRegistry = {
    generated_at: "2026-03-26T00:00:00Z",
    version: "1.0.0",
    build_info: null,
    packages: [],
    components: [],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [
      {
        name: "--salt-size-fixed-100",
        category: "size",
        type: "dimension",
        value: "1px",
        semantic_intent: "Fixed border and separator thickness.",
        themes: ["salt", "next"],
        densities: [],
        applies_to: [],
        guidance: ["Use for border and separator thickness."],
        aliases: [],
        policy: {
          usage_tier: "foundation",
          direct_component_use: "conditional",
          preferred_for: ["border thickness"],
          avoid_for: ["semantic component styling"],
          notes: [
            "Fixed size tokens are the correct choice for border thickness.",
          ],
          docs: ["/fixture/token-policy/size"],
        },
        deprecated: false,
        last_verified_at: "2026-03-26T00:00:00Z",
      },
      {
        name: "--salt-fixture-deprecated-gap",
        category: "fixture",
        type: "dimension",
        value: "12px",
        semantic_intent: "Fixture deprecated gap token.",
        themes: ["salt"],
        densities: [],
        applies_to: [],
        guidance: ["Fixture deprecated gap token."],
        aliases: [],
        policy: null,
        policy_gap: {
          reason:
            "Fixture deprecated token policy is unsupported from source-backed metadata.",
          missing: ["token policy", "source-backed replacement token"],
          evidence_refs: [
            {
              contract: SALT_EVIDENCE_REF_CONTRACT,
              id: "fixture-deprecated-gap.policy.unsupported.0.source-ref",
              source_kind: "token",
              claim_kind: "token",
              source: {
                repo_path:
                  "packages/theme/css/deprecated/token-replacements.json",
                section: "Fixture unsupported policy metadata.",
                line_start: 2,
                line_end: 2,
              },
              confidence: "high",
            },
          ],
        },
        deprecated: true,
        last_verified_at: "2026-03-26T00:00:00Z",
      },
    ],
    deprecations: [],
    examples: [],
  };

  it("does not reintroduce the summary route in getToken output when policy docs omit it", () => {
    const result = getToken(registry, {
      name: "--salt-size-fixed-100",
      max_results: 1,
    });

    expect(result.tokens[0]).toMatchObject({
      docs: ["/fixture/token-policy/size"],
    });
    expect(result.source_url).toBe("/fixture/token-policy/size");
  });

  it("returns fixture token policy gaps from getToken without inventing policy", () => {
    const result = getToken(registry, {
      name: "--salt-fixture-deprecated-gap",
      include_deprecated: true,
      max_results: 1,
    });

    expect(result.tokens[0]).toMatchObject({
      name: "--salt-fixture-deprecated-gap",
      policy: null,
      policy_gap: expect.objectContaining({
        reason:
          "Fixture deprecated token policy is unsupported from source-backed metadata.",
        missing: ["token policy", "source-backed replacement token"],
        evidence_refs: [
          expect.objectContaining({
            id: "fixture-deprecated-gap.policy.unsupported.0.source-ref",
            source_kind: "token",
            claim_kind: "token",
          }),
        ],
      }),
    });
  });

  it("does not reintroduce the summary route in recommendTokens output when policy docs omit it", () => {
    const result = recommendTokens(registry, {
      query: "border thickness",
      category: "size",
      top_k: 1,
    });

    expect(result.recommended).toMatchObject({
      docs: ["/fixture/token-policy/size"],
    });
    expect(result.source_url).toBe("/fixture/token-policy/size");
  });

  it("returns fixture token policy gaps from recommendTokens without inventing policy", () => {
    const result = recommendTokens(registry, {
      query: "deprecated gap",
      category: "fixture",
      include_deprecated: true,
      top_k: 1,
    });

    expect(result.recommended).toMatchObject({
      name: "--salt-fixture-deprecated-gap",
      policy: null,
      policy_gap: expect.objectContaining({
        reason:
          "Fixture deprecated token policy is unsupported from source-backed metadata.",
        missing: ["token policy", "source-backed replacement token"],
      }),
    });
  });
});
