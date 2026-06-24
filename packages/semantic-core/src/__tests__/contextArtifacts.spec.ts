import { describe, expect, it } from "vitest";
import {
  buildComponentContext,
  buildComponentContextArtifact,
  buildComponentContextArtifactSurfaceGate,
  SALT_CONTEXT_COMPONENT_CONTRACT,
} from "../contextArtifacts.js";
import {
  buildFoundationContext,
  buildFoundationContextArtifact,
  SALT_CONTEXT_FOUNDATION_CONTRACT,
} from "../contextFoundations.js";
import {
  buildComponentContextMarkdownBridge,
  checkComponentContextMarkdownBridge,
  normalizeComponentContextMarkdownForCheck,
} from "../contextMarkdown.js";
import {
  buildPatternContext,
  buildPatternContextArtifact,
  SALT_CONTEXT_PATTERN_CONTRACT,
} from "../contextPatterns.js";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltGeneratedArtifact,
  validateGeneratedArtifactEvidence,
} from "../evidence.js";
import { validateGeneratedSaltArtifactSurface } from "../generatedArtifactSurface.js";
import { validateGeneratedArtifactRegistryEvidence } from "../generatedArtifactValidation.js";
import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
  TokenRecord,
} from "../types.js";
import { validateSaltContextComponentSchema } from "./contextComponentSchemaTestUtils.js";
import { validateSaltContextFoundationSchema } from "./contextFoundationSchemaTestUtils.js";
import { validateSaltContextPatternSchema } from "./contextPatternSchemaTestUtils.js";

// All Salt-looking names in this file are intentionally tiny fixture facts.
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
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: "packages/core/src/fixture-action",
      export_name: "FixtureAction",
    },
    deprecations: [],
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
    last_verified_at: "2026-04-30T00:00:00.000Z",
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
    last_verified_at: "2026-04-30T00:00:00.000Z",
    ...overrides,
  };
}

function buildFixtureRegistry(
  component: ComponentRecord,
  options: {
    patterns?: PatternRecord[];
    tokens?: TokenRecord[];
  } = {},
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
    patterns: options.patterns ?? [],
    guides: [],
    tokens: options.tokens ?? [],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
  };
}

function buildContextInput(component: ComponentRecord, registry: SaltRegistry) {
  return {
    registry,
    registry_hash: "fixture-hash",
    component,
    generated_at: "2026-04-30T00:00:00.000Z",
    generator: {
      name: "semantic-core context artifact fixture",
      version: "0.0.0",
    },
  };
}

function buildUndocumentedTokenContextArtifact(): SaltGeneratedArtifact {
  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "component-context",
    id: "component-context.fixture-token",
    generated_at: "2026-04-30T00:00:00.000Z",
    generator: {
      name: "semantic-core context artifact fixture",
    },
    registry: {
      version: "fixture-registry",
      generated_at: "2026-04-30T00:00:00.000Z",
    },
    claims: [
      {
        id: "fixture-token.claim",
        kind: "token",
        text: "Fixture token claim.",
        field_path: "tokens.fixture",
        evidence_ref_ids: ["fixture-token.ref"],
      },
    ],
    evidence_refs: [
      {
        contract: SALT_EVIDENCE_REF_CONTRACT,
        id: "fixture-token.ref",
        source_kind: "registry",
        claim_kind: "token",
        registry: {
          entity_type: "token",
          entity_id: "--fixture-missing-token",
          entity_name: "--fixture-missing-token",
          field_path: "value",
          registry_version: "fixture-registry",
        },
        source: {
          url: "https://example.test/fixture/token",
        },
        confidence: "high",
        verified_at: "2026-04-30T00:00:00.000Z",
      },
    ],
    unsupported_claims: [],
  };
}

describe("component context artifacts", () => {
  it("builds generated claims exclusively from fixture registry component fields", () => {
    const component = buildFixtureComponent();
    const artifact = buildComponentContextArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      registry_hash: "fixture-hash",
      component,
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core context artifact fixture",
        version: "0.0.0",
      },
    });

    expect(validateGeneratedArtifactEvidence(artifact)).toEqual([]);
    expect(
      validateGeneratedArtifactRegistryEvidence(
        artifact,
        buildFixtureRegistry(component),
      ),
    ).toEqual([]);
    expect(artifact.claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "fixture-action.name",
          text: "Component: FixtureAction",
          evidence_ref_ids: ["fixture-action.name.ref"],
        }),
        expect.objectContaining({
          id: "fixture-action.props.fixtureProp",
          text: "FixtureAction has optional prop fixtureProp.",
          evidence_ref_ids: ["fixture-action.props.fixtureProp.ref"],
        }),
        expect.objectContaining({
          id: "fixture-action.import",
          kind: "import",
          evidence_ref_ids: ["fixture-action.import.ref"],
        }),
        expect.objectContaining({
          id: "fixture-action.accessibility.summary.0",
          kind: "accessibility",
          evidence_ref_ids: ["fixture-action.accessibility.summary.0.ref"],
        }),
        expect.objectContaining({
          id: "fixture-action.examples.fixture-action-basic-example",
          kind: "example",
          evidence_ref_ids: [
            "fixture-action.examples.fixture-action-basic-example.ref",
          ],
        }),
      ]),
    );
    expect(artifact.evidence_refs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "fixture-action.props.fixtureProp.ref",
          registry: expect.objectContaining({
            entity_id: "fixture-action",
            field_path: "props.fixtureProp",
          }),
        }),
      ]),
    );
    expect(
      buildComponentContextArtifactSurfaceGate({
        registry: buildFixtureRegistry(component),
        registry_hash: "fixture-hash",
        component,
        generated_at: "2026-04-30T00:00:00.000Z",
        generator: {
          name: "semantic-core context artifact fixture",
          version: "0.0.0",
        },
      }),
    ).toEqual(
      expect.objectContaining({
        status: "validated",
        validation_issues: [],
        unsupported_claim_count: 0,
        missing: [],
      }),
    );

    const context = buildComponentContext(
      buildContextInput(component, buildFixtureRegistry(component)),
    );

    expect(validateSaltContextComponentSchema(context)).toEqual([]);
    expect(context).toEqual(
      expect.objectContaining({
        contract: SALT_CONTEXT_COMPONENT_CONTRACT,
        status: "validated",
        surface_gate: expect.objectContaining({
          status: "validated",
          validation_issues: [],
          artifact_id: "component-context.fixture-action",
          artifact_kind: "component-context",
        }),
        unsupported_claims: [],
      }),
    );
    expect(context.component).toEqual(
      expect.objectContaining({
        id: "fixture-action",
        name: {
          value: "FixtureAction",
          evidence_ref_ids: ["fixture-action.name.ref"],
        },
        package_name: {
          value: "@salt-ds/fixture",
          evidence_ref_ids: ["fixture-action.package.ref"],
        },
        status: {
          value: "stable",
          evidence_ref_ids: ["fixture-action.status.ref"],
        },
        import: expect.objectContaining({
          package_name: "@salt-ds/fixture",
          export_name: "FixtureAction",
          evidence_ref_ids: expect.arrayContaining([
            "fixture-action.import.ref",
            "fixture-action.package.ref",
          ]),
        }),
        summary: {
          value: "Fixture source-backed action component.",
          evidence_ref_ids: ["fixture-action.summary.ref"],
        },
        props: [
          expect.objectContaining({
            name: "fixtureProp",
            evidence_ref_ids: ["fixture-action.props.fixtureProp.ref"],
          }),
        ],
        accessibility: {
          summary: [
            {
              value: "Fixture accessibility summary from registry.",
              evidence_ref_ids: ["fixture-action.accessibility.summary.0.ref"],
            },
          ],
        },
        examples: [
          expect.objectContaining({
            id: "fixture-action-basic-example",
            evidence_ref_ids: [
              "fixture-action.examples.fixture-action-basic-example.ref",
            ],
          }),
        ],
      }),
    );
  });

  it("records unsupported states instead of inventing missing registry guidance", () => {
    const component = buildFixtureComponent({
      summary: "",
      accessibility: {
        summary: [],
        rules: [],
      },
      examples: [],
    });
    const artifact = buildComponentContextArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      component,
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core context artifact fixture",
      },
    });

    expect(validateGeneratedArtifactEvidence(artifact)).toEqual([]);
    expect(
      artifact.claims.some((claim) => claim.field_path === "summary"),
    ).toBe(false);
    expect(artifact.unsupported_claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field_path: "summary",
          reason: "Registry component summary is empty.",
        }),
        expect.objectContaining({
          field_path: "examples",
          reason: "Registry component examples are empty.",
        }),
      ]),
    );
    expect(
      buildComponentContextArtifactSurfaceGate({
        registry: buildFixtureRegistry(component),
        component,
        generated_at: "2026-04-30T00:00:00.000Z",
        generator: {
          name: "semantic-core context artifact fixture",
        },
      }),
    ).toEqual(
      expect.objectContaining({
        status: "unsupported",
        unsupported_claim_count: 2,
        missing: ["component context has 2 unsupported claim(s)"],
      }),
    );

    const context = buildComponentContext(
      buildContextInput(component, buildFixtureRegistry(component)),
    );

    expect(validateSaltContextComponentSchema(context)).toEqual([]);
    expect(context.status).toBe("unsupported");
    expect(context.component.summary).toBeNull();
    expect(context.component.accessibility.summary).toEqual([]);
    expect(context.component.examples).toEqual([]);
    expect(context.surface_gate).toEqual(
      expect.objectContaining({
        status: "unsupported",
        unsupported_claim_count: 2,
        missing: ["component context has 2 unsupported claim(s)"],
      }),
    );
  });

  it("records unsupported import and example source gaps instead of inventing them", () => {
    const artifact = buildComponentContextArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      component: buildFixtureComponent({
        examples: [
          {
            id: "fixture-action-unsourced-example",
            title: "Fixture unsourced example",
            description: "Fixture example without a source URL.",
            intent: ["fixture"],
            complexity: "basic",
            code: "<FixtureAction />",
            source_url: null,
            package: "@salt-ds/fixture",
            target_type: "component",
            target_name: "FixtureAction",
          },
        ],
        source: {
          repo_path: null,
          export_name: null,
        },
      }),
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core context artifact fixture",
      },
    });

    expect(
      artifact.claims.some(
        (claim) =>
          claim.kind === "import" ||
          claim.id ===
            "fixture-action.examples.fixture-action-unsourced-example",
      ),
    ).toBe(false);
    expect(artifact.unsupported_claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "import",
          field_path: "source.export_name",
        }),
        expect.objectContaining({
          kind: "example",
          field_path: "examples.fixture-action-unsourced-example",
        }),
      ]),
    );
  });

  it("fails the shared surface gate when generated fixture context points at undocumented props", () => {
    const artifactComponent = buildFixtureComponent();
    const registryComponent = buildFixtureComponent({
      props: [],
    });
    const artifact = buildComponentContextArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      component: artifactComponent,
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core context artifact fixture",
      },
    });

    expect(
      validateGeneratedSaltArtifactSurface({
        artifact,
        registry: buildFixtureRegistry(registryComponent),
        artifact_label: "component context",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "unsupported",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_field",
            path: "evidence_refs[5].registry.field_path",
          }),
        ]),
        missing: expect.arrayContaining([
          "component context evidence validation failed: missing_registry_field at evidence_refs[5].registry.field_path",
        ]),
      }),
    );
  });

  it("degrades component context when emitted fields are not backed by the fixture registry", () => {
    const artifactComponent = buildFixtureComponent();
    const registryGapCases = [
      buildFixtureComponent({ props: [] }),
      buildFixtureComponent({
        source: {
          repo_path: "packages/core/src/fixture-action",
          export_name: null,
        },
      }),
      buildFixtureComponent({ examples: [] }),
      buildFixtureComponent({
        accessibility: {
          summary: [],
          rules: [],
        },
      }),
    ];

    for (const registryComponent of registryGapCases) {
      const context = buildComponentContext(
        buildContextInput(
          artifactComponent,
          buildFixtureRegistry(registryComponent),
        ),
      );

      expect(validateSaltContextComponentSchema(context)).toEqual([]);
      expect(context.status).toBe("unsupported");
      expect(context.surface_gate.validation_issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_field",
          }),
        ]),
      );
    }
  });

  it("rejects fixture generated context artifacts with undocumented status and token claims", () => {
    const component = buildFixtureComponent();
    const artifact = buildComponentContextArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      component,
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core context artifact fixture",
      },
    });
    const statusArtifact: SaltGeneratedArtifact = {
      ...artifact,
      evidence_refs: artifact.evidence_refs.map((ref) => {
        if (ref.claim_kind !== "status" || !ref.registry) {
          return ref;
        }

        return {
          ...ref,
          registry: {
            ...ref.registry,
            field_path: "status.undocumented",
          },
        };
      }),
    };

    expect(
      validateGeneratedSaltArtifactSurface({
        artifact: statusArtifact,
        registry: buildFixtureRegistry(component),
        artifact_label: "component context",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "unsupported",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_field",
          }),
        ]),
      }),
    );

    expect(
      validateGeneratedSaltArtifactSurface({
        artifact: buildUndocumentedTokenContextArtifact(),
        registry: buildFixtureRegistry(component),
        artifact_label: "component context",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "unsupported",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_entity",
          }),
        ]),
      }),
    );
  });

  it("rejects component context schema drift and missing evidence refs", () => {
    const component = buildFixtureComponent();
    const context = buildComponentContext(
      buildContextInput(component, buildFixtureRegistry(component)),
    );
    const [firstProp] = context.component.props;

    if (!firstProp) {
      throw new Error("Fixture component context should include one prop.");
    }

    expect(
      validateSaltContextComponentSchema({
        ...context,
        undocumented_context_field: true,
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must NOT have additional properties"),
      ]),
    );
    expect(
      validateSaltContextComponentSchema({
        ...context,
        component: {
          ...context.component,
          props: [
            {
              ...firstProp,
              evidence_ref_ids: [],
            },
          ],
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must NOT have fewer than 1 items"),
      ]),
    );
  });

  it("builds fixture component markdown only from EvidenceRef-backed context fields", () => {
    const component = buildFixtureComponent();
    const context = buildComponentContext(
      buildContextInput(component, buildFixtureRegistry(component)),
    );
    const bridge = buildComponentContextMarkdownBridge(context);

    expect(bridge).toEqual(
      expect.objectContaining({
        contract: "salt_context_component_markdown_v1",
        generated_artifact_kind: "component-markdown-bridge",
        component_id: "fixture-action",
        status: "validated",
        evidence_ref_ids: expect.arrayContaining([
          "fixture-action.name.ref",
          "fixture-action.props.fixtureProp.ref",
          "fixture-action.import.ref",
          "fixture-action.accessibility.summary.0.ref",
          "fixture-action.examples.fixture-action-basic-example.ref",
        ]),
        unsupported_claim_count: 0,
      }),
    );
    expect(bridge.text).toContain(
      "FixtureAction [EvidenceRef: fixture-action.name.ref]",
    );
    expect(bridge.text).toContain(
      "`fixtureProp` (optional, `string`): Fixture prop sourced from registry. [EvidenceRef: fixture-action.props.fixtureProp.ref]",
    );
    expect(bridge.text).toContain(
      "Source: https://example.test/salt/fixture-action/examples/basic [EvidenceRef: fixture-action.examples.fixture-action-basic-example.ref]",
    );
    expect(
      checkComponentContextMarkdownBridge({
        bridge,
        existing_text: bridge.text.replace(
          "<!-- Generated At: 2026-04-30T00:00:00.000Z -->",
          "<!-- Generated At: 2026-05-01T00:00:00.000Z -->",
        ),
      }),
    ).toEqual({
      current: true,
      supported: true,
      mismatches: [],
      missing: [],
    });
    expect(
      checkComponentContextMarkdownBridge({
        bridge,
        existing_text: `${bridge.text}\nUndocumented fixture prop: missingProp\n`,
      }),
    ).toEqual({
      current: false,
      supported: true,
      mismatches: ["markdown"],
      missing: [],
    });
    expect(
      normalizeComponentContextMarkdownForCheck(bridge.text),
    ).not.toContain("Generated At: 2026-04-30T00:00:00.000Z");
  });

  it("builds fixture pattern context only from registry-backed pattern fields", () => {
    const component = buildFixtureComponent();
    const pattern = buildFixturePattern();
    const registry = buildFixtureRegistry(component, { patterns: [pattern] });
    const artifact = buildPatternContextArtifact({
      registry: {
        version: registry.version,
        generated_at: registry.generated_at,
      },
      registry_hash: "fixture-hash",
      pattern,
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core pattern context fixture",
      },
    });

    expect(validateGeneratedArtifactEvidence(artifact)).toEqual([]);
    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, registry),
    ).toEqual([]);
    expect(artifact.claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "fixture-workflow.composed_of.0",
          kind: "composition",
          evidence_ref_ids: ["fixture-workflow.composed_of.0.ref"],
        }),
        expect.objectContaining({
          id: "fixture-workflow.accessibility.summary.0",
          kind: "accessibility",
          evidence_ref_ids: ["fixture-workflow.accessibility.summary.0.ref"],
        }),
        expect.objectContaining({
          id: "fixture-workflow.examples.fixture-workflow-basic-example",
          kind: "example",
          evidence_ref_ids: [
            "fixture-workflow.examples.fixture-workflow-basic-example.ref",
          ],
        }),
      ]),
    );

    const context = buildPatternContext({
      registry,
      registry_hash: "fixture-hash",
      pattern,
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core pattern context fixture",
      },
    });

    expect(validateSaltContextPatternSchema(context)).toEqual([]);
    expect(context).toEqual(
      expect.objectContaining({
        contract: SALT_CONTEXT_PATTERN_CONTRACT,
        status: "validated",
        unsupported_claims: [],
      }),
    );
    expect(context.pattern).toEqual(
      expect.objectContaining({
        id: "fixture-workflow",
        name: {
          value: "FixtureWorkflow",
          evidence_ref_ids: ["fixture-workflow.name.ref"],
        },
        composed_of: [
          {
            component: "FixtureAction",
            role: "trigger",
            evidence_ref_ids: ["fixture-workflow.composed_of.0.ref"],
          },
        ],
        examples: [
          expect.objectContaining({
            id: "fixture-workflow-basic-example",
            evidence_ref_ids: [
              "fixture-workflow.examples.fixture-workflow-basic-example.ref",
            ],
          }),
        ],
      }),
    );
  });

  it("degrades pattern context when emitted fixture fields lose registry evidence", () => {
    const component = buildFixtureComponent();
    const artifactPattern = buildFixturePattern();
    const registryPattern = buildFixturePattern({
      composed_of: [],
      examples: [],
      accessibility: {
        summary: [],
      },
    });
    const artifact = buildPatternContextArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      pattern: artifactPattern,
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core pattern context fixture",
      },
    });

    expect(
      validateGeneratedSaltArtifactSurface({
        artifact,
        registry: buildFixtureRegistry(component, {
          patterns: [registryPattern],
        }),
        artifact_label: "pattern context",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "unsupported",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_field",
          }),
        ]),
      }),
    );

    const unsourcedContext = buildPatternContext({
      registry: buildFixtureRegistry(component, {
        patterns: [
          buildFixturePattern({
            related_docs: {
              overview: null,
            },
            resources: [],
            examples: [],
          }),
        ],
      }),
      pattern: buildFixturePattern({
        related_docs: {
          overview: null,
        },
        resources: [],
        examples: [],
      }),
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core pattern context fixture",
      },
    });

    expect(validateSaltContextPatternSchema(unsourcedContext)).toEqual([]);
    expect(unsourcedContext.status).toBe("unsupported");
    expect(unsourcedContext.unsupported_claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field_path: "accessibility.summary.0",
        }),
        expect.objectContaining({
          field_path: "examples",
        }),
      ]),
    );
  });

  it("builds fixture foundation context from token registry and policy docs", () => {
    const component = buildFixtureComponent();
    const token = buildFixtureToken();
    const registry = buildFixtureRegistry(component, { tokens: [token] });
    const artifact = buildFoundationContextArtifact({
      registry: {
        version: registry.version,
        generated_at: registry.generated_at,
      },
      registry_hash: "fixture-hash",
      category: token.category,
      tokens: [token],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core foundation context fixture",
      },
    });

    expect(validateGeneratedArtifactEvidence(artifact)).toEqual([]);
    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, registry),
    ).toEqual([]);

    const context = buildFoundationContext({
      registry,
      registry_hash: "fixture-hash",
      category: token.category,
      tokens: [token],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core foundation context fixture",
      },
    });

    expect(validateSaltContextFoundationSchema(context)).toEqual([]);
    expect(context).toEqual(
      expect.objectContaining({
        contract: SALT_CONTEXT_FOUNDATION_CONTRACT,
        status: "validated",
        unsupported_claims: [],
      }),
    );
    expect(context.foundation).toEqual(
      expect.objectContaining({
        id: "tokens.fixture-color",
        category: {
          value: "fixture-color",
          evidence_ref_ids: ["salt-fixture-action-color.category.ref"],
        },
        tokens: [
          expect.objectContaining({
            name: {
              value: "--salt-fixture-action-color",
              evidence_ref_ids: ["salt-fixture-action-color.name.ref"],
            },
            value: {
              value: "#123456",
              evidence_ref_ids: ["salt-fixture-action-color.value.ref"],
            },
            policy: expect.objectContaining({
              docs: [
                {
                  href: "https://example.test/salt/foundations/fixture-color",
                  evidence_ref_ids: [
                    "salt-fixture-action-color.policy.docs.0.ref",
                  ],
                },
              ],
            }),
          }),
        ],
      }),
    );
  });

  it("degrades foundation context for undocumented fixture token claims", () => {
    const component = buildFixtureComponent();
    const artifactToken = buildFixtureToken();
    const registryToken = buildFixtureToken({
      policy: {
        ...artifactToken.policy!,
        docs: [],
      },
    });
    const artifact = buildFoundationContextArtifact({
      registry: {
        version: "fixture-registry",
        generated_at: "2026-04-30T00:00:00.000Z",
      },
      category: artifactToken.category,
      tokens: [artifactToken],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core foundation context fixture",
      },
    });

    expect(
      validateGeneratedSaltArtifactSurface({
        artifact,
        registry: buildFixtureRegistry(component, {
          tokens: [registryToken],
        }),
        artifact_label: "foundation context",
      }),
    ).toEqual(
      expect.objectContaining({
        status: "unsupported",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_field",
          }),
        ]),
      }),
    );

    const roleToken = buildFixtureToken({
      policy: {
        ...artifactToken.policy!,
        structural_roles: ["fixture-color"],
        pairing: {
          family: "fixture",
          role: "fixture-color",
          level: "action",
        },
      },
    });
    const roleContext = buildFoundationContext({
      registry: buildFixtureRegistry(component, {
        tokens: [roleToken],
      }),
      category: roleToken.category,
      tokens: [roleToken],
      generated_at: "2026-04-30T00:00:00.000Z",
      generator: {
        name: "semantic-core foundation context fixture",
      },
    });

    expect(validateSaltContextFoundationSchema(roleContext)).toEqual([]);
    expect(roleContext.status).toBe("unsupported");
    expect(roleContext.surface_gate.validation_issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_structural_role_rule_evidence",
        }),
      ]),
    );
  });
});
