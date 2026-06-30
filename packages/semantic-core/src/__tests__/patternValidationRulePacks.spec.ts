import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  buildPatternValidationRulePack,
  validatePatternValidationRulePackEvidence,
} from "../patternValidationRulePacks.js";
import type { PatternRecord, SaltRegistry } from "../types.js";

const TIMESTAMP = "2026-04-30T00:00:00.000Z";

// Fixture-only records: these prove source-backed pattern validation rule-pack
// behavior without adding production Salt pattern or component facts.
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
    composed_of: [],
    related_patterns: [],
    how_to_build: [],
    how_it_works: [],
    accessibility: {
      summary: ["Fixture accessibility claim from source-backed registry."],
    },
    resources: [],
    examples: [],
    starter_scaffold: {
      fidelity: "canonical",
      source_urls: ["https://example.test/salt/fixture-workflow/source"],
      example_source_urls: [],
      semantics: {
        regions: ["fixture header"],
        required_regions: ["fixture header", "fixture content"],
        optional_regions: [],
        build_around: ["Fixture source-backed build-around rule."],
        preserve_constraints: ["Fixture source-backed preserve rule."],
      },
      template: {
        kind: "fallback-template",
        imports: [
          {
            name: "FixtureAction",
            package: "@salt-ds/fixture",
          },
        ],
        jsx_lines: ["<FixtureAction />"],
        notes: ["Fixture template note."],
      },
    },
    related_docs: {
      overview: "https://example.test/salt/fixture-workflow",
    },
    last_verified_at: TIMESTAMP,
    ...overrides,
  };
}

function buildFixtureRegistry(pattern: PatternRecord): SaltRegistry {
  return {
    generated_at: TIMESTAMP,
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: [],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [pattern],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
    token_policy_structural_role_rule_pack: null,
  };
}

function readJsonSchema(name: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(new URL(`../../schemas/${name}`, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

function validateRulePackSchema(value: unknown): string[] {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  ajv.addSchema(readJsonSchema("salt-evidence-ref.schema.json"));
  const validate = ajv.compile(
    readJsonSchema("salt-pattern-validation-rule-pack.schema.json"),
  );

  return validate(value)
    ? []
    : (validate.errors ?? []).map(
        (error) => `${error.instancePath || "/"} ${error.message ?? "failed"}`,
      );
}

describe("pattern validation rule packs", () => {
  it("builds supported starter import rules and unsupported source-backed pattern gaps", () => {
    const pattern = buildFixturePattern();
    const registry = buildFixtureRegistry(pattern);

    const rulePack = buildPatternValidationRulePack({
      registry,
      generated_at: TIMESTAMP,
      generator: {
        name: "semantic-core fixture",
      },
    });

    expect(rulePack.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pattern_id: "fixture-workflow",
          kind: "starter-template-import",
          status: "supported",
          field_path: "starter_scaffold.template.imports.0.name",
          match: {
            kind: "salt_import",
            name: "FixtureAction",
            package: "@salt-ds/fixture",
          },
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "import",
              registry: expect.objectContaining({
                entity_type: "pattern",
                entity_id: "fixture-workflow",
                field_path: "starter_scaffold.template.imports.0.name",
              }),
              source: {
                url: "https://example.test/salt/fixture-workflow/source",
              },
            }),
          ]),
        }),
        expect.objectContaining({
          kind: "starter-region",
          status: "supported",
          field_path: "starter_scaffold.semantics.regions.0",
          match: {
            kind: "text_presence",
            text: "fixture header",
          },
        }),
        expect.objectContaining({
          kind: "starter-region-order",
          status: "unsupported",
          field_path: "starter_scaffold.semantics.required_regions.0",
          unsupported_reason: expect.stringContaining(
            "does not yet validate rendered region order",
          ),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              registry: expect.objectContaining({
                field_path: "starter_scaffold.semantics.required_regions.0",
              }),
              source: {
                url: "https://example.test/salt/fixture-workflow/source",
              },
            }),
          ]),
        }),
        expect.objectContaining({
          kind: "starter-build-around",
          status: "supported",
          field_path: "starter_scaffold.semantics.build_around.0",
          match: {
            kind: "text_presence",
            text: "Fixture source-backed build-around rule.",
          },
        }),
        expect.objectContaining({
          kind: "starter-preserve-constraint",
          status: "unsupported",
          field_path: "starter_scaffold.semantics.preserve_constraints.0",
        }),
        expect.objectContaining({
          kind: "pattern-accessibility-summary",
          status: "unsupported",
          field_path: "accessibility.summary.0",
        }),
      ]),
    );
    expect(
      validatePatternValidationRulePackEvidence(rulePack, registry),
    ).toEqual([]);
    expect(validateRulePackSchema(rulePack)).toEqual([]);
  });

  it("fails when a rule emits an undocumented pattern field path", () => {
    const pattern = buildFixturePattern();
    const registry = buildFixtureRegistry(pattern);
    const rulePack = buildPatternValidationRulePack({
      registry,
      generated_at: TIMESTAMP,
      generator: {
        name: "semantic-core fixture",
      },
    });
    const importRule = rulePack.rules.find(
      (rule) => rule.kind === "starter-template-import",
    );
    if (!importRule?.evidence_refs[0]?.registry) {
      throw new Error("Fixture import rule evidence was not generated.");
    }
    importRule.evidence_refs[0].registry.field_path =
      "starter_scaffold.template.imports.99.name";

    expect(
      validatePatternValidationRulePackEvidence(rulePack, registry),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_rule_evidence_ref",
          message: expect.stringContaining(
            "starter_scaffold.template.imports.99.name",
          ),
        }),
      ]),
    );
  });

  it("fails when supported pattern import rules lack source locators", () => {
    const pattern = buildFixturePattern({
      starter_scaffold: {
        fidelity: "canonical",
        source_urls: [],
        example_source_urls: [],
        semantics: {
          regions: [],
          build_around: [],
          preserve_constraints: [],
        },
        template: {
          kind: "fallback-template",
          imports: [
            {
              name: "FixtureAction",
              package: "@salt-ds/fixture",
            },
          ],
          jsx_lines: ["<FixtureAction />"],
        },
      },
      related_docs: {
        overview: null,
      },
      resources: [],
    });
    const registry = buildFixtureRegistry(pattern);
    const rulePack = buildPatternValidationRulePack({
      registry,
      generated_at: TIMESTAMP,
      generator: {
        name: "semantic-core fixture",
      },
    });

    expect(
      validatePatternValidationRulePackEvidence(rulePack, registry),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_source_backed_rule_evidence",
        }),
        expect.objectContaining({
          code: "invalid_rule_evidence_ref",
          message: expect.stringContaining(
            "must include source.url or source.repo_path",
          ),
        }),
      ]),
    );
  });
});
