import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRegistryEntityType,
  type SaltGeneratedArtifact,
} from "../evidence.js";
import { validateGeneratedArtifactRegistryEvidence } from "../generatedArtifactValidation.js";
import { getSaltRegistryFingerprint } from "../registry/fingerprint.js";
import type { SaltTokenPolicyStructuralRoleRulePack } from "../tokenPolicyStructuralRoleRules.js";
import {
  bindTokenPolicyStructuralRoleRulePackToInMemoryRegistry,
  buildTokenPolicyStructuralRoleRulePackBody,
} from "../tokenPolicyStructuralRoleRules.js";
import type {
  ComponentRecord,
  DeprecationRecord,
  ExampleRecord,
  GuideRecord,
  PackageRecord,
  PageRecord,
  PatternRecord,
  SaltRegistry,
  TokenRecord,
} from "../types.js";

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
        source_path: null,
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

function buildFixturePage(overrides: Partial<PageRecord> = {}): PageRecord {
  return {
    id: "page.fixture-action",
    title: "Fixture action",
    route: "/salt/components/fixture-action",
    page_kind: "component-doc",
    summary: "Fixture page sourced from the registry.",
    keywords: ["fixture"],
    content: ["Fixture page content."],
    section_headings: ["Usage"],
    source_path: "site/docs/components/fixture-action/index.mdx",
    last_verified_at: null,
    ...overrides,
  };
}

function buildFixtureGuide(overrides: Partial<GuideRecord> = {}): GuideRecord {
  return {
    id: "guide.fixture",
    name: "Fixture guide",
    aliases: [],
    kind: "getting-started",
    summary: "Fixture guide sourced from the registry.",
    packages: ["@salt-ds/fixture"],
    steps: [],
    related_docs: {
      overview: "https://example.test/salt/fixture-guide",
      related_components: [],
      related_packages: ["@salt-ds/fixture"],
    },
    last_verified_at: null,
    ...overrides,
  };
}

function buildFixtureExample(): ExampleRecord {
  return {
    id: "fixture-standalone-example",
    title: "Fixture standalone example",
    description: "Fixture standalone example sourced from the registry.",
    intent: ["fixture"],
    complexity: "basic",
    code: "<FixtureAction />",
    package: "@salt-ds/fixture",
    target_type: "component",
    target_name: "FixtureAction",
    source_url: "https://example.test/salt/fixture-example",
    source_path: null,
  };
}

function buildFixturePackage(
  overrides: Partial<PackageRecord> = {},
): PackageRecord {
  return {
    id: "package.fixture",
    name: "@salt-ds/fixture",
    status: "stable",
    version: "1.0.0",
    summary: "Fixture package sourced from the registry.",
    source_root: "packages/fixture",
    changelog_path: null,
    docs_root: "site/docs/fixture",
    ...overrides,
  };
}

function buildFixtureDeprecation(
  overrides: Partial<DeprecationRecord> = {},
): DeprecationRecord {
  return {
    id: "deprecation.fixture",
    subject: {
      package: "@salt-ds/fixture",
      entrypoint: ".",
      export_name: "FixtureAction",
      symbol_space: "value",
      member_path: [],
    },
    package: "@salt-ds/fixture",
    component: "FixtureAction",
    kind: "component",
    name: "FixtureAction",
    deprecated_in: "1.0.0",
    removed_in: null,
    replacement: {
      mode: "none",
      target: null,
      targets: [],
      type: null,
      name: null,
      notes: null,
    },
    migration: {
      strategy: "manual",
      value_map: null,
      details: [],
    },
    source_paths: ["packages/fixture/src/FixtureAction.tsx"],
    source_occurrences: [],
    source_urls: ["https://example.test/salt/fixture-deprecation"],
    ...overrides,
  };
}

function buildFixtureRegistry(input: {
  component?: ComponentRecord;
  deprecation?: DeprecationRecord;
  example?: ExampleRecord;
  guide?: GuideRecord;
  package?: PackageRecord;
  page?: PageRecord;
  pattern?: PatternRecord;
  token?: TokenRecord;
  tokenPolicyStructuralRoleRulePack?: SaltTokenPolicyStructuralRoleRulePack;
}): SaltRegistry {
  return {
    generated_at: "2026-04-30T00:00:00.000Z",
    version: "fixture-registry",
    build_info: null,
    packages: input.package ? [input.package] : [],
    components: input.component ? [input.component] : [],
    icons: [],
    country_symbols: [],
    pages: input.page ? [input.page] : [],
    patterns: input.pattern ? [input.pattern] : [],
    guides: input.guide ? [input.guide] : [],
    tokens: input.token ? [input.token] : [],
    deprecations: input.deprecation ? [input.deprecation] : [],
    examples: input.example ? [input.example] : [],
    token_policy_structural_role_rule_pack:
      input.tokenPolicyStructuralRoleRulePack ?? null,
  };
}

interface EvidenceFamilyCase {
  label: string;
  kind: SaltEvidenceClaimKind;
  entity_type: SaltEvidenceRegistryEntityType;
  entity_id: string;
  valid_field: string;
  missing_field: string;
  registry: () => SaltRegistry;
}

const EVIDENCE_FAMILY_CASES: EvidenceFamilyCase[] = [
  {
    label: "component",
    kind: "component",
    entity_type: "component",
    entity_id: "fixture-action",
    valid_field: "summary",
    missing_field: "props.missing",
    registry: () =>
      buildFixtureRegistry({ component: buildFixtureComponent() }),
  },
  {
    label: "pattern",
    kind: "pattern",
    entity_type: "pattern",
    entity_id: "fixture-workflow",
    valid_field: "summary",
    missing_field: "how_to_build.99",
    registry: () => buildFixtureRegistry({ pattern: buildFixturePattern() }),
  },
  {
    label: "guide",
    kind: "provider",
    entity_type: "guide",
    entity_id: "guide.fixture",
    valid_field: "summary",
    missing_field: "related_docs.missing",
    registry: () => buildFixtureRegistry({ guide: buildFixtureGuide() }),
  },
  {
    label: "token",
    kind: "token",
    entity_type: "token",
    entity_id: "--fixture-token",
    valid_field: "semantic_intent",
    missing_field: "guidance.99",
    registry: () => buildFixtureRegistry({ token: buildFixtureToken() }),
  },
  {
    label: "example",
    kind: "example",
    entity_type: "example",
    entity_id: "fixture-standalone-example",
    valid_field: "description",
    missing_field: "missing_field",
    registry: () => buildFixtureRegistry({ example: buildFixtureExample() }),
  },
  {
    label: "package",
    kind: "package",
    entity_type: "package",
    entity_id: "package.fixture",
    valid_field: "summary",
    missing_field: "missing_field",
    registry: () => buildFixtureRegistry({ package: buildFixturePackage() }),
  },
  {
    label: "page",
    kind: "example",
    entity_type: "page",
    entity_id: "page.fixture-action",
    valid_field: "summary",
    missing_field: "content.99",
    registry: () => buildFixtureRegistry({ page: buildFixturePage() }),
  },
  {
    label: "deprecation",
    kind: "status",
    entity_type: "deprecation",
    entity_id: "deprecation.fixture",
    valid_field: "migration.strategy",
    missing_field: "migration.details.99.from",
    registry: () =>
      buildFixtureRegistry({ deprecation: buildFixtureDeprecation() }),
  },
];

function buildArtifact(
  input: {
    kind: SaltEvidenceClaimKind;
    entity_type: SaltEvidenceRegistryEntityType;
    entity_id: string;
    field_path: string;
    artifact_kind?: SaltGeneratedArtifact["artifact_kind"];
    source?: {
      url?: string | null;
      repo_path?: string | null;
    } | null;
  },
  registry: SaltRegistry,
): SaltGeneratedArtifact {
  const registryHash = getSaltRegistryFingerprint(registry);
  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: input.artifact_kind ?? "validation-report",
    id: "fixture.generated-artifact",
    generated_at: "2026-04-30T00:00:00.000Z",
    generator: {
      name: "mcp-core registry evidence fixture",
    },
    registry: {
      version: registry.version,
      hash: registryHash,
      generated_at: registry.generated_at,
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
          registry_version: registry.version,
          registry_hash: registryHash,
        },
        source:
          "source" in input
            ? input.source
            : {
                url: "https://example.test/salt/fixture",
                repo_path: "packages/fixture/src/FixtureAction.tsx",
              },
      },
    ],
  };
}

describe("generated artifact registry evidence validation", () => {
  describe.each(
    EVIDENCE_FAMILY_CASES,
  )("$label evidence family", (familyCase) => {
    function artifactFor(
      registry: SaltRegistry,
      fieldPath = familyCase.valid_field,
    ): SaltGeneratedArtifact {
      return buildArtifact(
        {
          kind: familyCase.kind,
          entity_type: familyCase.entity_type,
          entity_id: familyCase.entity_id,
          field_path: fieldPath,
        },
        registry,
      );
    }

    it("accepts a current registry identity and existing field", () => {
      const registry = familyCase.registry();
      expect(
        validateGeneratedArtifactRegistryEvidence(
          artifactFor(registry),
          registry,
        ),
      ).toEqual([]);
    });

    it("rejects a stale EvidenceRef registry version", () => {
      const registry = familyCase.registry();
      const artifact = artifactFor(registry);
      artifact.evidence_refs[0]!.registry!.registry_version = "stale-version";
      expect(
        validateGeneratedArtifactRegistryEvidence(artifact, registry),
      ).toEqual([
        expect.objectContaining({
          code: "stale_registry",
          path: "evidence_refs[0].registry.registry_version",
        }),
      ]);
    });

    it("rejects a stale EvidenceRef registry hash", () => {
      const registry = familyCase.registry();
      const artifact = artifactFor(registry);
      artifact.evidence_refs[0]!.registry!.registry_hash =
        `sha256:${"f".repeat(64)}`;
      expect(
        validateGeneratedArtifactRegistryEvidence(artifact, registry),
      ).toEqual([
        expect.objectContaining({
          code: "stale_registry",
          path: "evidence_refs[0].registry.registry_hash",
        }),
      ]);
    });

    it("rejects a missing field on an existing family entity", () => {
      const registry = familyCase.registry();
      expect(
        validateGeneratedArtifactRegistryEvidence(
          artifactFor(registry, familyCase.missing_field),
          registry,
        ),
      ).toEqual([
        expect.objectContaining({
          code: "missing_registry_field",
          path: "evidence_refs[0].registry.field_path",
        }),
      ]);
    });

    it("rejects a missing family entity", () => {
      const registry = buildFixtureRegistry({});
      expect(
        validateGeneratedArtifactRegistryEvidence(
          artifactFor(registry),
          registry,
        ),
      ).toEqual([
        expect.objectContaining({
          code: "missing_registry_entity",
          path: "evidence_refs[0].registry.entity_id",
        }),
      ]);
    });

    it("rejects an id collision in the wrong family", () => {
      const registry =
        familyCase.entity_type === "component"
          ? buildFixtureRegistry({
              page: buildFixturePage({ id: familyCase.entity_id }),
            })
          : buildFixtureRegistry({
              component: buildFixtureComponent({ id: familyCase.entity_id }),
            });
      expect(
        validateGeneratedArtifactRegistryEvidence(
          artifactFor(registry),
          registry,
        ),
      ).toEqual([
        expect.objectContaining({
          code: "missing_registry_entity",
          path: "evidence_refs[0].registry.entity_id",
        }),
      ]);
    });
  });

  it("accepts fixture claims that point to documented registry fields", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
      token: buildFixtureToken(),
    });

    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "prop",
          entity_type: "component",
          entity_id: "fixture-action",
          field_path: "props.fixtureProp",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([]);
  });

  it("rejects owner-local example ids that are ambiguous across owners", () => {
    const first = buildFixtureExample();
    const second: ExampleRecord = {
      ...first,
      target_name: "OtherFixtureAction",
      source_url: "https://example.test/salt/other-fixture-example",
      source_path: null,
    };
    const registry = buildFixtureRegistry({ example: first });
    registry.examples.push(second);
    const artifact = buildArtifact(
      {
        kind: "example",
        entity_type: "example",
        entity_id: first.id,
        field_path: "description",
      },
      registry,
    );

    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, registry),
    ).toEqual([
      expect.objectContaining({
        code: "ambiguous_registry_entity",
        path: "evidence_refs[0].registry.entity_id",
      }),
    ]);
  });

  it("deduplicates the same logical example repeated in global and owner views", () => {
    const example = buildFixtureExample();
    const component = buildFixtureComponent({ examples: [example] });
    const registry = buildFixtureRegistry({ component, example });
    const artifact = buildArtifact(
      {
        kind: "example",
        entity_type: "example",
        entity_id: example.id,
        field_path: "description",
      },
      registry,
    );

    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, registry),
    ).toEqual([]);
  });

  it("validates page fields and rejects missing page fields or entities", () => {
    const page = buildFixturePage();
    const registry = buildFixtureRegistry({ page });
    expect(
      validateGeneratedArtifactRegistryEvidence(
        buildArtifact(
          {
            kind: "example",
            entity_type: "page",
            entity_id: page.id,
            field_path: "content.0",
            source: {
              repo_path: page.source_path,
            },
          },
          registry,
        ),
        registry,
      ),
    ).toEqual([]);

    expect(
      validateGeneratedArtifactRegistryEvidence(
        buildArtifact(
          {
            kind: "example",
            entity_type: "page",
            entity_id: page.id,
            field_path: "content.99",
            source: {
              repo_path: page.source_path,
            },
          },
          registry,
        ),
        registry,
      ),
    ).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);

    const registryWithoutPage = buildFixtureRegistry({});
    expect(
      validateGeneratedArtifactRegistryEvidence(
        buildArtifact(
          {
            kind: "example",
            entity_type: "page",
            entity_id: "page.missing",
            field_path: "route",
            source: {
              repo_path: "site/docs/missing.mdx",
            },
          },
          registryWithoutPage,
        ),
        registryWithoutPage,
      ),
    ).toEqual([
      expect.objectContaining({
        code: "missing_registry_entity",
        path: "evidence_refs[0].registry.entity_id",
      }),
    ]);
  });

  it("rejects stale artifact and EvidenceRef registry identities", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const artifact = buildArtifact(
      {
        kind: "prop",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "props.fixtureProp",
      },
      registry,
    );
    artifact.registry.version = "stale-registry";
    artifact.registry.hash = "stale-artifact-hash";
    const registryRef = artifact.evidence_refs[0]?.registry;
    if (!registryRef) {
      throw new Error("Fixture artifact has no registry evidence reference.");
    }
    registryRef.registry_version = "stale-registry";
    registryRef.registry_hash = "stale-evidence-hash";

    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, registry),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "stale_registry",
          path: "registry.version",
        }),
        expect.objectContaining({
          code: "stale_registry",
          path: "registry.hash",
        }),
        expect.objectContaining({
          code: "stale_registry",
          path: "evidence_refs[0].registry.registry_version",
        }),
        expect.objectContaining({
          code: "stale_registry",
          path: "evidence_refs[0].registry.registry_hash",
        }),
      ]),
    );
  });

  it("requires artifact registry version and hash", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const artifact = buildArtifact(
      {
        kind: "prop",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "props.fixtureProp",
      },
      registry,
    );
    artifact.registry.version = null;
    artifact.registry.hash = null;

    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, registry),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_registry_identity",
          path: "registry.version",
        }),
        expect.objectContaining({
          code: "missing_registry_identity",
          path: "registry.hash",
        }),
      ]),
    );
  });

  it("requires registry-bound EvidenceRefs to declare version and hash", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const artifact = buildArtifact(
      {
        kind: "prop",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "props.fixtureProp",
      },
      registry,
    );
    const registryRef = artifact.evidence_refs[0]?.registry;
    if (!registryRef) {
      throw new Error("Fixture artifact has no registry evidence reference.");
    }
    const invalidIdentity = registryRef as unknown as {
      registry_version: string | null;
      registry_hash: string | null;
    };
    invalidIdentity.registry_version = null;
    invalidIdentity.registry_hash = null;

    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, registry),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_registry_identity",
          path: "evidence_refs[0].registry.registry_version",
        }),
        expect.objectContaining({
          code: "missing_registry_identity",
          path: "evidence_refs[0].registry.registry_hash",
        }),
      ]),
    );
  });

  it("does not treat registry timestamp-only changes as stale", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const artifact = buildArtifact(
      {
        kind: "prop",
        entity_type: "component",
        entity_id: "fixture-action",
        field_path: "props.fixtureProp",
      },
      registry,
    );
    const rebuiltAtAnotherTime: SaltRegistry = {
      ...registry,
      generated_at: "2030-01-01T00:00:00.000Z",
    };

    expect(
      validateGeneratedArtifactRegistryEvidence(artifact, rebuiltAtAnotherTime),
    ).toEqual([]);
  });

  it("accepts fixture component claims that point to documented usage guidance", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent({
        when_not_to_use: ["Fixture guidance sourced from registry."],
      }),
    });

    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "component",
          entity_type: "component",
          entity_id: "fixture-action",
          field_path: "when_not_to_use.0",
        },
        registry,
      ),
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
      buildArtifact(
        {
          kind: "component",
          entity_type: "component",
          entity_id: "fixture-action",
          field_path: "semantics.not_for.0",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([]);
  });

  it("rejects generated artifact claims for undocumented fixture props", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "prop",
          entity_type: "component",
          entity_id: "fixture-action",
          field_path: "props.undocumentedFixtureProp",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated artifact claims for missing fixture status entities", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "status",
          entity_type: "component",
          entity_id: "missing-fixture-action",
          field_path: "status",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_entity",
        path: "evidence_refs[0].registry.entity_id",
      }),
    ]);
  });

  it("rejects generated artifact claims for undocumented fixture imports", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent({
        source: {
          repo_path: "packages/fixture/src/FixtureAction.tsx",
          export_name: null,
        },
      }),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "import",
          entity_type: "component",
          entity_id: "fixture-action",
          field_path: "source.export_name",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated artifact claims for undocumented fixture examples", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "example",
          entity_type: "component",
          entity_id: "fixture-action",
          field_path: "examples.missing-fixture-example",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated artifact claims for undocumented fixture pattern composition", () => {
    const registry = buildFixtureRegistry({
      pattern: buildFixturePattern(),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "composition",
          entity_type: "pattern",
          entity_id: "fixture-workflow",
          field_path: "composed_of.99",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated pattern composition claims without source locators", () => {
    const registry = buildFixtureRegistry({
      pattern: buildFixturePattern(),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "composition",
          entity_type: "pattern",
          entity_id: "fixture-workflow",
          field_path: "composed_of.0",
          source: null,
        },
        registry,
      ),
      registry,
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
          source_url:
            "https://example.test/salt/fixture-action/stories/default",
          source_path: null,
          package: "@salt-ds/fixture",
          target_type: "component",
          target_name: "FixtureAction",
        },
      ],
    });
    const registry = buildFixtureRegistry({ component });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "example",
          entity_type: "component",
          entity_id: "fixture-action",
          field_path: "examples.fixture.story.default",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([]);
  });

  it("rejects generated artifact claims for undocumented fixture accessibility", () => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent(),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "accessibility",
          entity_type: "component",
          entity_id: "fixture-action",
          field_path: "accessibility.summary.99",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("accepts fixture pattern accessibility implementation signal claims that point to documented registry fields", () => {
    const registry = buildFixtureRegistry({
      pattern: buildFixturePattern({
        accessibility: {
          summary: [],
          implementation_signals: [
            {
              kind: "aria_attribute",
              values: ["aria-label"],
              source_kind: "example",
              source_url:
                "https://example.test/salt/fixture-workflow/examples/basic",
              source_path: null,
            },
          ],
        },
      }),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "accessibility",
          entity_type: "pattern",
          entity_id: "fixture-workflow",
          field_path: "accessibility.implementation_signals.0",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([]);
  });

  it("rejects generated artifact claims for undocumented fixture pattern accessibility implementation signals", () => {
    const registry = buildFixtureRegistry({
      pattern: buildFixturePattern({
        accessibility: {
          summary: [],
          implementation_signals: [
            {
              kind: "aria_attribute",
              values: ["aria-label"],
              source_kind: "example",
              source_url:
                "https://example.test/salt/fixture-workflow/examples/basic",
              source_path: null,
            },
          ],
        },
      }),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "accessibility",
          entity_type: "pattern",
          entity_id: "fixture-workflow",
          field_path: "accessibility.implementation_signals.99",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects generated artifact claims for undocumented fixture tokens", () => {
    const registry = buildFixtureRegistry({
      token: buildFixtureToken(),
    });
    const issues = validateGeneratedArtifactRegistryEvidence(
      buildArtifact(
        {
          kind: "token",
          entity_type: "token",
          entity_id: "--missing-fixture-token",
          field_path: "name",
        },
        registry,
      ),
      registry,
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
      buildArtifact(
        {
          kind: "token",
          entity_type: "token",
          entity_id: "--fixture-token",
          field_path: "policy.preferred_for.0",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([]);
  });

  it("rejects generated artifact claims for undocumented fixture token policy text", () => {
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
      buildArtifact(
        {
          kind: "token",
          entity_type: "token",
          entity_id: "--fixture-token",
          field_path: "policy.preferred_for.1",
        },
        registry,
      ),
      registry,
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_registry_field",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it.each([
    "category.0",
    "tags.0",
    "composition",
    "related_docs.usage",
  ])("accepts production component evidence path %s", (fieldPath) => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent({
        tags: ["fixture-tag"],
        composition: { required_children: ["FixtureChild"] },
        related_docs: {
          overview: "https://example.test/salt/fixture-action",
          usage: "https://example.test/salt/fixture-action/usage",
          accessibility: null,
          examples: null,
        },
      }),
    });

    expect(
      validateGeneratedArtifactRegistryEvidence(
        buildArtifact(
          {
            kind: "component",
            entity_type: "component",
            entity_id: "fixture-action",
            field_path: fieldPath,
          },
          registry,
        ),
        registry,
      ),
    ).toEqual([]);
  });

  it.each([
    "props.fixtureProp.missing",
    "props.fixtureProp.",
    "props.fixtureProp..constructor",
    "when_to_use.00",
  ])("rejects non-exact component evidence path %s", (fieldPath) => {
    const registry = buildFixtureRegistry({
      component: buildFixtureComponent({
        when_to_use: ["Fixture guidance."],
      }),
    });

    expect(
      validateGeneratedArtifactRegistryEvidence(
        buildArtifact(
          {
            kind: "component",
            entity_type: "component",
            entity_id: "fixture-action",
            field_path: fieldPath,
          },
          registry,
        ),
        registry,
      ),
    ).toEqual([expect.objectContaining({ code: "missing_registry_field" })]);
  });

  it("accepts exact guide step statement evidence", () => {
    const registry = buildFixtureRegistry({
      guide: buildFixtureGuide({
        steps: [
          {
            title: "Fixture step",
            statements: ["Fixture statement."],
            snippets: [],
          },
        ],
      }),
    });
    expect(
      validateGeneratedArtifactRegistryEvidence(
        buildArtifact(
          {
            kind: "provider",
            entity_type: "guide",
            entity_id: "guide.fixture",
            field_path: "steps.0.statements.0",
          },
          registry,
        ),
        registry,
      ),
    ).toEqual([]);
  });

  it.each([
    "accessibility.implementation_signals.0.kind.0",
    "accessibility.implementation_signals.0.source_kind.0",
    "accessibility.implementation_signals.0.source_url.0",
    "accessibility.implementation_signals.00.values.0",
  ])("rejects non-exact pattern signal evidence path %s", (fieldPath) => {
    const registry = buildFixtureRegistry({
      pattern: buildFixturePattern({
        accessibility: {
          summary: [],
          implementation_signals: [
            {
              kind: "aria_attribute",
              values: ["aria-label"],
              source_kind: "example",
              source_url: "https://example.test/salt/fixture",
              source_path: null,
            },
          ],
        },
      }),
    });
    expect(
      validateGeneratedArtifactRegistryEvidence(
        buildArtifact(
          {
            kind: "accessibility",
            entity_type: "pattern",
            entity_id: "fixture-workflow",
            field_path: fieldPath,
          },
          registry,
        ),
        registry,
      ),
    ).toEqual([expect.objectContaining({ code: "missing_registry_field" })]);
  });

  it("uses only embedded current rule-pack evidence for structural-role claims", () => {
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
    const registryWithoutPack = buildFixtureRegistry({ token });
    const rulePackBody = buildTokenPolicyStructuralRoleRulePackBody({
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
      generator: {
        name: "mcp-core fixture",
      },
    });
    const rulePack = bindTokenPolicyStructuralRoleRulePackToInMemoryRegistry(
      rulePackBody,
      registryWithoutPack,
      null,
    );
    const embeddedRegistry = buildFixtureRegistry({
      token,
      tokenPolicyStructuralRoleRulePack: rulePack,
    });
    const embeddedArtifact = buildArtifact(
      {
        kind: "token",
        entity_type: "token",
        entity_id: token.name,
        field_path: "policy.structural_roles.0",
      },
      embeddedRegistry,
    );
    expect(
      validateGeneratedArtifactRegistryEvidence(
        embeddedArtifact,
        embeddedRegistry,
      ),
    ).toEqual([]);
    const artifactWithoutPack = buildArtifact(
      {
        kind: "token",
        entity_type: "token",
        entity_id: token.name,
        field_path: "policy.structural_roles.0",
      },
      registryWithoutPack,
    );
    expect(
      validateGeneratedArtifactRegistryEvidence(
        artifactWithoutPack,
        registryWithoutPack,
      ),
    ).toEqual([
      expect.objectContaining({
        code: "missing_structural_role_rule_evidence",
        path: "evidence_refs[0].registry.field_path",
      }),
    ]);
  });

  it("rejects missing or stale structural-role rule-pack identity before using its rules", () => {
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
    const baseRegistry = buildFixtureRegistry({ token });
    const body = buildTokenPolicyStructuralRoleRulePackBody({
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
      generator: {
        name: "mcp-core fixture",
      },
    });
    const validPack = bindTokenPolicyStructuralRoleRulePackToInMemoryRegistry(
      body,
      baseRegistry,
      null,
    );

    for (const [expectedCode, invalidPack] of [
      [
        "missing_registry_identity",
        {
          ...validPack,
          registry: {
            version: "",
            hash: "",
            generated_at: null,
          },
        },
      ],
      [
        "stale_registry",
        {
          ...validPack,
          registry: {
            version: "stale-registry",
            hash: `sha256:${"f".repeat(64)}`,
            generated_at: null,
          },
        },
      ],
    ] as const) {
      const registry = buildFixtureRegistry({
        token,
        tokenPolicyStructuralRoleRulePack: invalidPack,
      });
      const artifact = buildArtifact(
        {
          kind: "token",
          entity_type: "token",
          entity_id: token.name,
          field_path: "policy.structural_roles.0",
        },
        registry,
      );

      expect(
        validateGeneratedArtifactRegistryEvidence(artifact, registry),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: expectedCode,
            path: "token_policy_structural_role_rule_pack.registry",
          }),
          expect.objectContaining({
            code: "missing_structural_role_rule_evidence",
            path: "evidence_refs[0].registry.field_path",
          }),
        ]),
      );
    }
  });

  it.each([
    "subject",
    "subject.package",
    "subject.member_path",
    "replacement.mode",
    "replacement.target",
    "replacement.target.export_name",
    "replacement.targets",
    "replacement.targets.0",
    "replacement.targets.0.export_name",
  ])("accepts canonical deprecation identity field %s", (fieldPath) => {
    const deprecationCase = EVIDENCE_FAMILY_CASES.find(
      (entry) => entry.entity_type === "deprecation",
    );
    if (!deprecationCase)
      throw new Error("Expected deprecation evidence fixture");
    const replacementTarget = {
      package: "@salt-ds/fixture",
      entrypoint: ".",
      export_name: "FixtureReplacement",
      symbol_space: "value" as const,
      member_path: [],
    };
    const registry = buildFixtureRegistry({
      deprecation: buildFixtureDeprecation({
        replacement: {
          mode: "single",
          target: replacementTarget,
          targets: [replacementTarget],
          type: "component",
          name: "FixtureReplacement",
          notes: null,
        },
      }),
    });
    expect(
      validateGeneratedArtifactRegistryEvidence(
        buildArtifact(
          {
            kind: deprecationCase.kind,
            entity_type: "deprecation",
            entity_id: deprecationCase.entity_id,
            field_path: fieldPath,
          },
          registry,
        ),
        registry,
      ),
    ).toEqual([]);
  });
});
