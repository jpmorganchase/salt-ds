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
import { CatalogStoreV2 } from "../core/catalog/catalogStoreV2.js";
import {
  SALT_EVIDENCE_REF_CONTRACT,
} from "../core/evidence.js";
import { getSaltRegistryFingerprint } from "../core/registry/fingerprint.js";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import {
  buildTokenPolicyStructuralRoleRulePack,
  SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
  type SaltTokenPolicyStructuralRoleRulePack,
  validateTokenPolicyStructuralRoleRulePackEvidence,
} from "../core/tokenPolicyStructuralRoleRules.js";
import type { SaltRegistry } from "../core/types.js";
import {
  REPO_ROOT,
  SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS,
} from "./registryTestUtils.js";

const DESIGN_TOKENS_URL = "/salt/themes/design-tokens";
let outputDir = "";
let builtRegistry: Awaited<ReturnType<typeof buildRegistry>>;
let tokenPolicySources: TokenPolicySourceRegistry;
let builtStructuralRoleRulePack: SaltTokenPolicyStructuralRoleRulePack;
let loadedRegistry: SaltRegistry;

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
    }),
  ]);
  loadedRegistry = await loadRegistry({
    registryDir: outputDir,
    prefetch: true,
  });
  const loadedStructuralRoleRulePack =
    loadedRegistry.token_policy_structural_role_rule_pack;
  if (!loadedStructuralRoleRulePack) {
    throw new Error(
      "Salt catalog schema v2 omitted the structural-role policy profile.",
    );
  }
  builtStructuralRoleRulePack = loadedStructuralRoleRulePack;
}, SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS);

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
        const derivedLifecycleText = token.deprecated
          ? new Set([
              "Deprecated token; use replacement_token_refs for migration.",
              `Deprecated ${token.policy?.usage_tier} token; direct component use is forbidden.`,
            ])
          : new Set<string>();
        return [
          ...(token.policy?.preferred_for ?? []),
          ...(token.policy?.avoid_for ?? []),
          ...(token.policy?.notes ?? []),
        ]
          .filter(
            (text) =>
              !docsText.includes(text) && !derivedLifecycleText.has(text),
          )
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
        hash: getSaltRegistryFingerprint(builtRegistry),
        generated_at: builtRegistry.generated_at,
      },
    });

    expect(rulePack.contract).toBe(
      SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
    );
    expect(rulePack.rules).toHaveLength(
      tokenPolicySources.structural_role_rules.length,
    );
    expect(
      validateTokenPolicyStructuralRoleRulePackEvidence(
        rulePack,
        builtRegistry,
      ),
    ).toEqual([]);
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

  it("writes the structural role rule pack into the loaded v2 catalog projection", () => {
    expect(builtStructuralRoleRulePack.contract).toBe(
      SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
    );
    expect(builtStructuralRoleRulePack.rules).toHaveLength(
      tokenPolicySources.structural_role_rules.length,
    );
    expect(
      validateTokenPolicyStructuralRoleRulePackEvidence(
        builtStructuralRoleRulePack,
        loadedRegistry,
      ),
    ).toEqual([]);
    expect(builtStructuralRoleRulePack.registry).toEqual({
      version: loadedRegistry.version,
      hash: getSaltRegistryFingerprint(loadedRegistry),
      generated_at: null,
    });
  });

  it("stores an unbound structural-rule body and inherits identity from the catalog manifest", () => {
    const store = new CatalogStoreV2({ registryDir: outputDir });
    const profile = store
      .getFamily("policy_profile")
      .find((candidate) => candidate.policy_kind === "structural_role_rules");
    if (!profile || profile.policy_kind !== "structural_role_rules") {
      throw new Error("Catalog omitted its structural-role policy profile.");
    }
    const payload = store.getContentJson(profile.body_content_ref);

    expect(payload).not.toHaveProperty("registry");
    expect(builtStructuralRoleRulePack.registry).toEqual({
      version: store.manifest.catalog_version,
      hash: store.manifest.semantic_digest,
      generated_at: null,
    });
  });

  it("loads the structural role rule pack through the shared registry loader", async () => {
    expect(loadedRegistry.token_policy_structural_role_rule_pack).toEqual(
      builtStructuralRoleRulePack,
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
    const accentToken = loadedRegistry.tokens.find(
      (token) => token.name === "--salt-accent-background",
    );
    const containerToken = loadedRegistry.tokens.find(
      (token) => token.name === "--salt-container-primary-background",
    );
    const paletteToken = loadedRegistry.tokens.find(
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
    expect(accentEvidenceRefs).toHaveLength(1);
    expect(accentToken?.replacement_tokens).toContain("--salt-palette-accent");
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
    expect(accentEvidenceRefs).toHaveLength(1);
    expect(accentToken?.replacement_tokens).toContain("--salt-palette-accent");
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
