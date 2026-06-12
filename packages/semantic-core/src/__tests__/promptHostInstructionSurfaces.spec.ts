import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
  type SaltEvidenceRegistryEntityType,
  type SaltGeneratedArtifact,
} from "../evidence.js";
import { validateGeneratedArtifactReleaseGate } from "../generatedArtifactReleaseGate.js";
import {
  buildDefaultPromptHostInstructionSurfaces,
  promptHostInstructionSurfaceFileName,
  SALT_CONTEXT_PROMPT_INSTRUCTION_SURFACE_CONTRACT,
  type SaltPromptHostInstructionSurface,
} from "../promptHostInstructionSurfaces.js";
import type { ComponentRecord, SaltRegistry, TokenRecord } from "../types.js";
import { validateSaltContextPromptHostInstructionSurfaceSchema } from "./promptHostInstructionSurfaceSchemaTestUtils.js";

// These Salt-looking names are intentionally tiny fixture facts for prompt and
// host-instruction surface guardrail tests.
const GENERATED_AT = "2026-04-30T00:00:00.000Z";

const HOST_INSTRUCTION_TEXT_BUDGETS = new Map([
  ["salt-repo-instructions-template", 7_000],
  ["consumer-repo-agents-template", 7_500],
  ["vscode-copilot-instructions-template", 4_500],
]);

function buildFixtureComponent(): ComponentRecord {
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
        default: null,
        description: "Fixture prop documented in the fixture registry.",
        deprecated: false,
      },
    ],
    accessibility: {
      summary: ["Fixture component accessibility summary from registry."],
      rules: [
        {
          id: "fixture-rule",
          severity: "info",
          rule: "Fixture accessibility rule.",
        },
      ],
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
      repo_path: "packages/fixture/src/FixtureAction.tsx",
      export_name: "FixtureAction",
    },
    implementation_requirements: {
      required_imports: [
        {
          kind: "css",
          specifier: "@salt-ds/fixture/styles.css",
          statement: 'import "@salt-ds/fixture/styles.css";',
          source_url: "https://example.test/salt/fixture-action/imports",
        },
      ],
    },
    deprecations: [],
    last_verified_at: GENERATED_AT,
  };
}

function buildFixtureToken(): TokenRecord {
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
  };
}

function buildFixtureRegistry(): SaltRegistry {
  return {
    generated_at: GENERATED_AT,
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: [buildFixtureComponent()],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [buildFixtureToken()],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
  };
}

function buildGenerator() {
  return {
    name: "semantic-core prompt surface fixture",
    version: "0.0.0",
  };
}

function mutateSurfaceArtifact(
  surface: SaltPromptHostInstructionSurface,
  input: {
    claim_kind: SaltEvidenceClaimKind;
    entity_type: SaltEvidenceRegistryEntityType;
    entity_id: string;
    field_path: string;
  },
): SaltPromptHostInstructionSurface {
  const refId = `fixture.${input.claim_kind}.undocumented.ref`;
  const ref: SaltEvidenceRef = {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: refId,
    source_kind: "registry",
    claim_kind: input.claim_kind,
    registry: {
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      field_path: input.field_path,
      registry_version: "fixture-registry",
      registry_hash: "fixture-hash",
    },
    source: {
      repo_path: "packages/fixture/src/FixtureAction.tsx",
    },
    confidence: "high",
  };
  const generatedArtifact: SaltGeneratedArtifact = {
    ...surface.generated_artifact,
    claims: [
      ...surface.generated_artifact.claims,
      {
        id: `fixture.${input.claim_kind}.undocumented`,
        kind: input.claim_kind,
        text: `Undocumented fixture ${input.claim_kind} claim.`,
        field_path: `fixture.${input.claim_kind}`,
        evidence_ref_ids: [refId],
      },
    ],
    evidence_refs: [...surface.generated_artifact.evidence_refs, ref],
  };

  return {
    ...surface,
    generated_artifact: generatedArtifact,
  };
}

describe("prompt and host instruction generated context surfaces", () => {
  it("emits source-backed prompt and instruction surfaces without unsupported Salt claims", () => {
    const registry = buildFixtureRegistry();
    const surfaces = buildDefaultPromptHostInstructionSurfaces({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
      registry_hash: "fixture-hash",
    });

    expect(surfaces.map((surface) => surface.surface.kind)).toEqual([
      "prompt",
      "instruction",
    ]);
    for (const surface of surfaces) {
      expect(
        validateSaltContextPromptHostInstructionSurfaceSchema(surface),
      ).toEqual([]);
      expect(promptHostInstructionSurfaceFileName(surface)).toMatch(
        new RegExp(`${surface.surface.id}\\.${surface.surface.kind}\\.json$`),
      );
      expect(surface).toEqual(
        expect.objectContaining({
          contract: SALT_CONTEXT_PROMPT_INSTRUCTION_SURFACE_CONTRACT,
          status: "validated",
          unsupported_claims: [],
          surface_gate: expect.objectContaining({
            status: "validated",
            unsupported_claim_count: 0,
            missing: [],
          }),
          generated_artifact: expect.objectContaining({
            artifact_kind: surface.surface.kind,
            unsupported_claims: [],
          }),
        }),
      );

      const gate = validateGeneratedArtifactReleaseGate({
        artifact: surface,
        registry,
      });
      expect(gate).toEqual(
        expect.objectContaining({
          status: "passed",
          releasable: true,
          unsupported_claim_count: 0,
          missing: [],
        }),
      );
    }
  });

  it("keeps generated host instruction templates inside progressive disclosure budgets", () => {
    const registry = buildFixtureRegistry();
    const hostInstructionSurface = buildDefaultPromptHostInstructionSurfaces({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
      registry_hash: "fixture-hash",
    }).find((surface) => surface.surface.id === "host-instructions");

    expect(hostInstructionSurface).toBeDefined();

    // Budgets protect progressive disclosure: split deeper guidance into
    // references before growing always-on generated host instructions.
    for (const [fileId, maxChars] of HOST_INSTRUCTION_TEXT_BUDGETS) {
      const sourceFile = hostInstructionSurface?.source_files.find(
        (file) => file.id === fileId,
      );

      expect(sourceFile?.text?.length ?? 0).toBeGreaterThan(0);
      expect(sourceFile?.text?.length ?? 0).toBeLessThan(maxChars);
    }
  });

  it.each([
    {
      claim_kind: "prop" as const,
      entity_type: "component" as const,
      entity_id: "fixture-action",
      field_path: "props.undocumentedProp",
    },
    {
      claim_kind: "token" as const,
      entity_type: "token" as const,
      entity_id: "--salt-fixture-action-color",
      field_path: "policy.undocumented",
    },
    {
      claim_kind: "import" as const,
      entity_type: "component" as const,
      entity_id: "fixture-action",
      field_path:
        "implementation_requirements.required_imports.UndocumentedImport",
    },
    {
      claim_kind: "example" as const,
      entity_type: "component" as const,
      entity_id: "fixture-action",
      field_path: "examples.fixture-action-missing-example.code",
    },
    {
      claim_kind: "status" as const,
      entity_type: "component" as const,
      entity_id: "fixture-action",
      field_path: "status.undocumented",
    },
    {
      claim_kind: "accessibility" as const,
      entity_type: "component" as const,
      entity_id: "fixture-action",
      field_path: "accessibility.rules.undocumented-rule",
    },
  ])("blocks prompt/instruction surfaces that emit undocumented fixture $claim_kind claims", (undocumentedClaim) => {
    const registry = buildFixtureRegistry();
    const [surface] = buildDefaultPromptHostInstructionSurfaces({
      registry,
      generated_at: GENERATED_AT,
      generator: buildGenerator(),
      registry_hash: "fixture-hash",
    });
    const gate = validateGeneratedArtifactReleaseGate({
      artifact: mutateSurfaceArtifact(surface, undocumentedClaim),
      registry,
    });

    expect(gate).toEqual(
      expect.objectContaining({
        status: "blocked",
        releasable: false,
      }),
    );
    expect(gate.validation_issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_registry_field",
        }),
      ]),
    );
  });
});
