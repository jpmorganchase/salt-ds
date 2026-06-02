import { describe, expect, it } from "vitest";
import {
  buildContextCoverageAudit,
  SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT,
} from "../contextCoverageAudit.js";
import {
  buildDefaultUnsupportedContextSurfaces,
  buildUnsupportedGeneratedContextSurface,
  SALT_CONTEXT_UNSUPPORTED_SURFACE_CONTRACT,
} from "../contextUnsupportedSurfaces.js";
import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
  TokenRecord,
} from "../types.js";
import { validateSaltContextCoverageAuditSchema } from "./contextCoverageAuditSchemaTestUtils.js";
import { validateSaltContextUnsupportedSurfaceSchema } from "./contextUnsupportedSurfaceSchemaTestUtils.js";

// All Salt-looking names in this file are intentionally tiny fixture facts.
const GENERATED_AT = "2026-04-30T00:00:00.000Z";

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
    props: [],
    accessibility: {
      summary: ["Fixture component accessibility summary from registry."],
      rules: [],
    },
    patterns: [],
    examples: [
      {
        id: "fixture-action-basic-example",
        title: "Fixture action basic example",
        description: "Fixture component example sourced from registry.",
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
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: "packages/core/src/fixture-action",
      export_name: "FixtureAction",
    },
    deprecations: [],
    last_verified_at: GENERATED_AT,
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
    when_to_use: ["Use the fixture workflow when fixture evidence applies."],
    when_not_to_use: [
      "Do not use the fixture workflow when fixture evidence is absent.",
    ],
    composed_of: [
      {
        component: "FixtureAction",
        role: "trigger",
      },
    ],
    related_patterns: [],
    how_to_build: ["Build the fixture workflow from fixture records."],
    how_it_works: [
      "The fixture workflow delegates actions to fixture records.",
    ],
    accessibility: {
      summary: ["Fixture pattern accessibility summary from registry."],
    },
    resources: [
      {
        label: "Fixture workflow docs",
        href: "https://example.test/salt/fixture-workflow",
        internal: true,
      },
    ],
    examples: [
      {
        id: "fixture-workflow-basic-example",
        title: "Fixture workflow basic example",
        description: "Fixture pattern example sourced from registry.",
        intent: ["fixture"],
        complexity: "basic",
        code: "<FixtureWorkflow />",
        source_url: "https://example.test/salt/fixture-workflow/examples/basic",
        package: "@salt-ds/fixture",
        target_type: "pattern",
        target_name: "FixtureWorkflow",
      },
    ],
    related_docs: {
      overview: "https://example.test/salt/fixture-workflow",
    },
    last_verified_at: GENERATED_AT,
    ...overrides,
  };
}

function buildFixtureToken(overrides: Partial<TokenRecord> = {}): TokenRecord {
  return {
    name: "--salt-fixture-action-color",
    category: "fixture-color",
    type: "color",
    value: "#123456",
    semantic_intent: "Fixture color token.",
    themes: ["fixture-theme"],
    densities: [],
    applies_to: ["fixture"],
    guidance: ["Use this fixture token for fixture-only color tests."],
    aliases: [],
    policy: {
      usage_tier: "foundation",
      direct_component_use: "conditional",
      preferred_for: ["Fixture token preferred use from registry."],
      avoid_for: ["Fixture token avoid use from registry."],
      notes: ["Fixture token policy note from registry."],
      docs: ["https://example.test/salt/foundations/fixture-color"],
    },
    deprecated: false,
    last_verified_at: GENERATED_AT,
    ...overrides,
  };
}

function buildFixtureRegistry(input: {
  components?: ComponentRecord[];
  patterns?: PatternRecord[];
  tokens?: TokenRecord[];
}): SaltRegistry {
  return {
    generated_at: GENERATED_AT,
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: input.components ?? [buildFixtureComponent()],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: input.patterns ?? [],
    guides: [],
    tokens: input.tokens ?? [],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
  };
}

function buildGenerator() {
  return {
    name: "semantic-core context coverage fixture",
    version: "0.0.0",
  };
}

describe("context coverage and unsupported surfaces", () => {
  it("serializes prompt and instruction gaps as unsupported surfaces with no Salt claims", () => {
    const registry = buildFixtureRegistry({
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });
    const surfaces = buildDefaultUnsupportedContextSurfaces({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
      registry_hash: "fixture-hash",
    });

    expect(surfaces).toHaveLength(2);
    for (const surface of surfaces) {
      expect(validateSaltContextUnsupportedSurfaceSchema(surface)).toEqual([]);
      expect(surface).toEqual(
        expect.objectContaining({
          contract: SALT_CONTEXT_UNSUPPORTED_SURFACE_CONTRACT,
          status: "unsupported",
          evidence_refs: [],
          generated_artifact: expect.objectContaining({
            claims: [],
            evidence_refs: [],
          }),
          surface_gate: expect.objectContaining({
            status: "unsupported",
            unsupported_claim_count: 1,
          }),
        }),
      );
    }
  });

  it("rejects unsupported prompt surfaces that try to smuggle fixture Salt claims", () => {
    const registry = buildFixtureRegistry({
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });
    const surface = buildUnsupportedGeneratedContextSurface({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
      kind: "prompt",
      id: "fixture-prompt",
      name: "Fixture prompt",
      reason: "Fixture prompt surface is intentionally unsupported.",
      missing: ["fixture prompt serializer"],
      registry_hash: "fixture-hash",
    });

    expect(
      validateSaltContextUnsupportedSurfaceSchema({
        ...surface,
        generated_artifact: {
          ...surface.generated_artifact,
          claims: [
            {
              id: "fixture-action.claim",
              kind: "component",
              text: "FixtureAction should be used.",
              evidence_ref_ids: [],
            },
          ],
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must NOT have more than 0 items"),
      ]),
    );
  });

  it("audits fixture component, pattern, and foundation context coverage from serializers", () => {
    const registry = buildFixtureRegistry({
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });
    const audit = buildContextCoverageAudit({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
    });

    expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
    expect(audit).toEqual(
      expect.objectContaining({
        contract: SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT,
        status: "validated",
        docs_registry_gaps: [],
        component_contexts: expect.objectContaining({
          total_records: 1,
          selected_records: 1,
          validated_contexts: 1,
          unsupported_contexts: 0,
        }),
        pattern_contexts: expect.objectContaining({
          total_records: 1,
          selected_records: 1,
          validated_contexts: 1,
          unsupported_contexts: 0,
        }),
        foundation_contexts: expect.objectContaining({
          total_records: 1,
          selected_records: 1,
          validated_contexts: 1,
          unsupported_contexts: 0,
        }),
      }),
    );
  });

  it("surfaces docs and registry gaps instead of patching fixture coverage", () => {
    const tokenWithoutDocs = buildFixtureToken({
      policy: {
        usage_tier: "foundation",
        direct_component_use: "conditional",
        preferred_for: [],
        avoid_for: [],
        notes: [],
        docs: [],
      },
    });
    const componentWithoutSource = buildFixtureComponent({
      related_docs: {
        overview: null,
        usage: null,
        accessibility: null,
        examples: null,
      },
      source: {
        repo_path: null,
        export_name: "FixtureAction",
      },
    });
    const registry = buildFixtureRegistry({
      components: [componentWithoutSource],
      patterns: [
        buildFixturePattern({
          resources: [],
          examples: [],
          related_docs: {
            overview: null,
          },
        }),
      ],
      tokens: [tokenWithoutDocs],
    });
    const audit = buildContextCoverageAudit({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
    });

    expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
    expect(audit).toEqual(
      expect.objectContaining({
        status: "unsupported",
        component_contexts: expect.objectContaining({
          selected_records: 0,
          source_gap_count: 1,
        }),
        pattern_contexts: expect.objectContaining({
          selected_records: 0,
          source_gap_count: 1,
        }),
        foundation_contexts: expect.objectContaining({
          selected_records: 0,
          source_gap_count: 1,
        }),
        docs_registry_gaps: expect.arrayContaining([
          expect.objectContaining({
            kind: "component",
            id: "fixture-action",
            missing: ["component source locator"],
          }),
          expect.objectContaining({
            kind: "pattern",
            id: "fixture-workflow",
            missing: ["pattern source locator"],
          }),
          expect.objectContaining({
            kind: "foundation",
            id: "tokens.fixture-color",
            missing: ["token policy docs or source-backed policy evidence"],
            records: [
              expect.objectContaining({
                kind: "token",
                id: "--salt-fixture-action-color",
                status: "unsupported",
                reason_code: "missing_token_policy_docs_or_source_evidence",
                missing: ["policy docs", "source-backed policy evidence"],
                evidence_ref_ids: [],
              }),
            ],
          }),
        ]),
      }),
    );
  });

  it("records token-level fixture gap reasons without turning gaps into claims", () => {
    const registry = buildFixtureRegistry({
      tokens: [
        buildFixtureToken({
          name: "--salt-fixture-no-policy",
          category: "fixture-policy",
          policy: null,
        }),
        buildFixtureToken({
          name: "--salt-fixture-deprecated-raw",
          category: "fixture-policy",
          value: "1px",
          policy: null,
          deprecated: true,
        }),
        buildFixtureToken({
          name: "--salt-fixture-deprecated-reference",
          category: "fixture-policy",
          value: "var(--salt-fixture-next-token)",
          policy: null,
          deprecated: true,
        }),
        buildFixtureToken({
          name: "--salt-fixture-deprecated-policy-gap",
          category: "fixture-policy",
          value: "1px",
          policy: null,
          policy_gap: {
            reason:
              "Fixture deprecated token policy is unsupported from source-backed metadata.",
            missing: ["token policy", "source-backed replacement token"],
            evidence_refs: [
              {
                contract: "salt_evidence_ref_v1",
                id: "fixture-deprecated-policy-gap.source-ref",
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
        }),
      ],
    });
    const audit = buildContextCoverageAudit({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
    });
    const foundationGap = audit.docs_registry_gaps.find(
      (gap) => gap.kind === "foundation" && gap.id === "tokens.fixture-policy",
    );

    expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
    expect(foundationGap).toEqual(
      expect.objectContaining({
        records: expect.arrayContaining([
          expect.objectContaining({
            kind: "token",
            id: "--salt-fixture-no-policy",
            status: "unsupported",
            reason_code: "missing_token_policy",
            missing: ["token policy"],
            evidence_ref_ids: [],
          }),
          expect.objectContaining({
            kind: "token",
            id: "--salt-fixture-deprecated-raw",
            status: "unsupported",
            reason_code: "deprecated_token_raw_value_without_policy",
            missing: ["token policy"],
            evidence_ref_ids: [],
          }),
          expect.objectContaining({
            kind: "token",
            id: "--salt-fixture-deprecated-reference",
            status: "unsupported",
            reason_code: "deprecated_token_reference_without_policy",
            missing: ["token policy"],
            evidence_ref_ids: [],
          }),
          expect.objectContaining({
            kind: "token",
            id: "--salt-fixture-deprecated-policy-gap",
            status: "unsupported",
            reason_code: "deprecated_token_raw_value_without_policy",
            reason:
              "Fixture deprecated token policy is unsupported from source-backed metadata.",
            missing: ["token policy", "source-backed replacement token"],
            evidence_ref_ids: ["fixture-deprecated-policy-gap.source-ref"],
          }),
        ]),
      }),
    );
    expect(
      audit.docs_registry_gaps.flatMap((gap) =>
        gap.records.map((record) => record.reason_code),
      ),
    ).toEqual(
      expect.arrayContaining([
        "missing_token_policy",
        "deprecated_token_raw_value_without_policy",
        "deprecated_token_reference_without_policy",
      ]),
    );
  });

  it("records omitted optional fixture sections as docs gaps without inventing claims", () => {
    const registry = buildFixtureRegistry({
      components: [
        buildFixtureComponent({
          accessibility: {
            summary: [],
            rules: [],
          },
          related_docs: {
            overview: "https://example.test/salt/fixture-action",
            usage: null,
            accessibility:
              "https://example.test/salt/fixture-action/accessibility",
            examples: null,
          },
        }),
      ],
      patterns: [
        buildFixturePattern({
          when_not_to_use: [],
          how_to_build: [],
          how_it_works: [],
          accessibility: {
            summary: [],
          },
        }),
      ],
      tokens: [buildFixtureToken()],
    });
    const audit = buildContextCoverageAudit({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
    });

    expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
    expect(audit).toEqual(
      expect.objectContaining({
        status: "unsupported",
        component_contexts: expect.objectContaining({
          source_gap_count: 1,
          unsupported_contexts: 0,
        }),
        pattern_contexts: expect.objectContaining({
          source_gap_count: 1,
          unsupported_contexts: 0,
        }),
        docs_registry_gaps: expect.arrayContaining([
          expect.objectContaining({
            kind: "component",
            id: "fixture-action",
            missing: ["non-keyboard accessibility guidance"],
          }),
          expect.objectContaining({
            kind: "pattern",
            id: "fixture-workflow",
            missing: [
              "when_not_to_use guidance",
              "how_to_build guidance",
              "how_it_works guidance",
            ],
            records: [
              expect.objectContaining({
                kind: "pattern",
                id: "fixture-workflow.when_not_to_use.missing_optional_evidence",
                reason_code: "missing_optional_evidence",
                missing: ["when_not_to_use guidance"],
                evidence_ref_ids: [],
              }),
              expect.objectContaining({
                kind: "pattern",
                id: "fixture-workflow.how_to_build.missing_optional_evidence",
                reason_code: "missing_optional_evidence",
                missing: ["how_to_build guidance"],
                evidence_ref_ids: [],
              }),
              expect.objectContaining({
                kind: "pattern",
                id: "fixture-workflow.how_it_works.missing_optional_evidence",
                reason_code: "missing_optional_evidence",
                missing: ["how_it_works guidance"],
                evidence_ref_ids: [],
              }),
            ],
          }),
        ]),
      }),
    );
  });

  it("records fixture pattern accessibility coverage gaps only when pattern examples, implementation signals, and component accessibility evidence are absent", () => {
    const registry = buildFixtureRegistry({
      components: [
        buildFixtureComponent({
          accessibility: {
            summary: [],
            rules: [],
          },
          related_docs: {
            overview: "https://example.test/salt/fixture-action",
            usage: null,
            accessibility: null,
            examples: null,
          },
        }),
      ],
      patterns: [
        buildFixturePattern({
          accessibility: {
            summary: [],
          },
          examples: [],
        }),
      ],
      tokens: [buildFixtureToken()],
    });
    const audit = buildContextCoverageAudit({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
    });
    const patternGap = audit.docs_registry_gaps.find(
      (gap) =>
        gap.kind === "pattern" &&
        gap.id === "fixture-workflow" &&
        gap.reason ===
          "Pattern context omitted optional fields because registry or source-backed evidence is missing.",
    );

    expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
    expect(patternGap).toEqual(
      expect.objectContaining({
        missing: ["pattern accessibility coverage"],
        records: [
          expect.objectContaining({
            kind: "pattern",
            id: "fixture-workflow.accessibility.missing_optional_evidence",
            reason_code: "missing_optional_evidence",
            reason:
              "Registry pattern accessibility coverage is empty and no source-backed examples, implementation signals, or composed component accessibility evidence was found for generated context.",
            missing: ["pattern accessibility coverage"],
            evidence_ref_ids: [],
          }),
        ],
      }),
    );
  });

  it("treats composed fixture component accessibility evidence as pattern accessibility coverage", () => {
    const registry = buildFixtureRegistry({
      patterns: [
        buildFixturePattern({
          accessibility: {
            summary: [],
          },
          examples: [],
        }),
      ],
      tokens: [buildFixtureToken()],
    });
    const audit = buildContextCoverageAudit({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
    });

    expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
    expect(
      audit.docs_registry_gaps.flatMap((gap) => gap.missing),
    ).not.toContain("pattern accessibility coverage");
  });

  it("records selected fixture pattern surface-gate fields without inventing guidance", () => {
    const registry = buildFixtureRegistry({
      patterns: [
        buildFixturePattern({
          when_to_use: [],
        }),
      ],
      tokens: [buildFixtureToken()],
    });
    const audit = buildContextCoverageAudit({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
    });
    const selectedPatternGap = audit.docs_registry_gaps.find(
      (gap) =>
        gap.kind === "pattern" &&
        gap.id === "fixture-workflow" &&
        gap.reason ===
          "Selected pattern context did not pass the evidence surface gate.",
    );

    expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
    expect(selectedPatternGap).toEqual(
      expect.objectContaining({
        missing: ["pattern context has 1 unsupported claim(s)"],
        records: [
          expect.objectContaining({
            kind: "pattern",
            id: "fixture-workflow.when_to_use.unsupported",
            status: "unsupported",
            reason_code: "evidence_surface_gate_failed",
            reason: "Registry pattern when_to_use guidance is empty.",
            missing: ["when_to_use"],
            evidence_ref_ids: [],
          }),
        ],
      }),
    );
  });
});
