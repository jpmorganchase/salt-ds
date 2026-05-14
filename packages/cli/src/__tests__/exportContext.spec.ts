import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type {
  ComponentRecord,
  PatternRecord,
  SaltGeneratedArtifact,
  TokenRecord,
} from "@salt-ds/semantic-core";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
} from "@salt-ds/semantic-core";
import { REGISTRY_ARRAY_ARTIFACTS } from "@salt-ds/semantic-core/registry/artifacts";
import { afterEach, describe, expect, it } from "vitest";
import {
  validateSaltContextComponentCheckSchema,
  validateSaltGeneratedContextHealthSchema,
} from "../../../semantic-core/src/__tests__/contextCheckSchemaTestUtils.js";
import { validateSaltContextComponentSchema } from "../../../semantic-core/src/__tests__/contextComponentSchemaTestUtils.js";
import { validateSaltContextCoverageAuditSchema } from "../../../semantic-core/src/__tests__/contextCoverageAuditSchemaTestUtils.js";
import { validateSaltContextCoverageGapCatalogSchema } from "../../../semantic-core/src/__tests__/contextCoverageGapCatalogSchemaTestUtils.js";
import { validateSaltContextFoundationSchema } from "../../../semantic-core/src/__tests__/contextFoundationSchemaTestUtils.js";
import { validateSaltContextPackManifestSchema } from "../../../semantic-core/src/__tests__/contextManifestSchemaTestUtils.js";
import { validateSaltContextPatternSchema } from "../../../semantic-core/src/__tests__/contextPatternSchemaTestUtils.js";
import { validateSaltContextPromptHostInstructionSurfaceSchema } from "../../../semantic-core/src/__tests__/promptHostInstructionSurfaceSchemaTestUtils.js";
import {
  validateSaltGeneratedArtifactReleaseGateBatchSchema,
  validateSaltGeneratedArtifactReleaseGateSchema,
} from "../../../semantic-core/src/__tests__/generatedArtifactReleaseGateSchemaTestUtils.js";
import { validateSaltAiSetupSchema } from "../../../semantic-core/src/__tests__/aiSetupSchemaTestUtils.js";
import { validateSaltAiEvidenceClosureReportSchema } from "../../../semantic-core/src/__tests__/aiEvidenceClosureReportSchemaTestUtils.js";
import { runCli } from "../cli.js";

const tempDirs: string[] = [];
const GENERATED_AT = "2026-04-30T00:00:00.000Z";
const REGISTRY_VERSION = "fixture-registry";

async function createTempDir(name: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  tempDirs.push(tempDir);
  return tempDir;
}

// Export-context tests use tiny fixture-only registry facts. They are not
// production Salt API, token, import, example, or accessibility facts.
function buildFixtureComponent(
  overrides: Partial<ComponentRecord> = {},
): ComponentRecord {
  return {
    id: "fixture-action",
    name: "FixtureAction",
    aliases: ["Fixture Action"],
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
      repo_path: "packages/fixture/src/FixtureAction.tsx",
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
    how_it_works: ["The fixture workflow delegates actions to fixture records."],
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
        source_url:
          "https://example.test/salt/fixture-workflow/examples/basic",
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

async function writeRegistryArrayArtifact(
  registryDir: string,
  fileName: string,
  key: string,
  values: unknown[],
): Promise<void> {
  await fs.writeFile(
    path.join(registryDir, fileName),
    `${JSON.stringify(
      {
        generated_at: GENERATED_AT,
        version: REGISTRY_VERSION,
        [key]: values,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

async function writeFixtureRegistry(
  registryDir: string,
  component: ComponentRecord,
  options: {
    patterns?: PatternRecord[];
    tokens?: TokenRecord[];
  } = {},
): Promise<void> {
  await fs.mkdir(registryDir, { recursive: true });
  await Promise.all(
    REGISTRY_ARRAY_ARTIFACTS.map((artifact) =>
      writeRegistryArrayArtifact(
        registryDir,
        artifact.file_name,
        artifact.key,
        artifact.key === "components"
          ? [component]
          : artifact.key === "patterns"
            ? (options.patterns ?? [])
            : artifact.key === "tokens"
              ? (options.tokens ?? [])
              : [],
      ),
    ),
  );
  await fs.writeFile(path.join(registryDir, "search-index.jsonl"), "", "utf8");
}

function readJson(text: string): Record<string, unknown> {
  return JSON.parse(text) as Record<string, unknown>;
}

async function readJsonFile(
  filePath: string,
): Promise<Record<string, unknown>> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as Record<
    string,
    unknown
  >;
}

function buildFixturePromptArtifact(
  component: ComponentRecord,
  options: { evidence: "status" | "missing" },
): SaltGeneratedArtifact {
  const evidenceRefId = `${component.id}.status.prompt-ref`;

  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "prompt",
    id: "prompt.fixture-release-gate",
    generated_at: GENERATED_AT,
    generator: {
      name: "export-context release-gate fixture",
    },
    registry: {
      version: REGISTRY_VERSION,
      generated_at: GENERATED_AT,
    },
    claims: [
      {
        id: "prompt.fixture-status",
        kind: "status",
        text: `${component.name} fixture status is ${component.status}.`,
        field_path: "prompt.fixture-status",
        evidence_ref_ids: options.evidence === "status" ? [evidenceRefId] : [],
      },
    ],
    evidence_refs:
      options.evidence === "status"
        ? [
            {
              contract: SALT_EVIDENCE_REF_CONTRACT,
              id: evidenceRefId,
              source_kind: "registry",
              claim_kind: "status",
              registry: {
                entity_type: "component",
                entity_id: component.id,
                entity_name: component.name,
                field_path: "status",
                registry_version: REGISTRY_VERSION,
              },
              source: {
                repo_path: component.source.repo_path,
              },
              confidence: "high",
              verified_at: component.last_verified_at,
            },
          ]
        : [],
  };
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("salt cli export-context", () => {
  it("emits schema-valid source-backed component context from fixture registry records", async () => {
    const rootDir = await createTempDir("salt-cli-export-context");
    const registryDir = path.join(rootDir, "registry");
    await writeFixtureRegistry(registryDir, buildFixtureComponent(), {
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      [
        "export-context",
        "--component",
        "fixture-action",
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );
    const payload = readJson(stdout);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(validateSaltContextComponentSchema(payload)).toEqual([]);
    expect(payload).toEqual(
      expect.objectContaining({
        contract: "salt_context_component_v1",
        status: "validated",
        registry: expect.objectContaining({
          hash: expect.stringMatching(/^sha256:/),
        }),
        unsupported_claims: [],
        surface_gate: expect.objectContaining({
          status: "validated",
          artifact_id: "component-context.fixture-action",
          artifact_kind: "component-context",
        }),
      }),
    );
    expect(payload.component).toEqual(
      expect.objectContaining({
        id: "fixture-action",
        name: {
          value: "FixtureAction",
          evidence_ref_ids: ["fixture-action.name.ref"],
        },
        import: expect.objectContaining({
          package_name: "@salt-ds/fixture",
          export_name: "FixtureAction",
          evidence_ref_ids: expect.arrayContaining([
            "fixture-action.import.ref",
            "fixture-action.package.ref",
          ]),
        }),
        props: [
          expect.objectContaining({
            name: "fixtureProp",
            evidence_ref_ids: ["fixture-action.props.fixtureProp.ref"],
          }),
        ],
      }),
    );
  });

  it("returns unsupported context when fixture registry evidence is missing", async () => {
    const rootDir = await createTempDir("salt-cli-export-context-unsupported");
    const registryDir = path.join(rootDir, "registry");
    await writeFixtureRegistry(
      registryDir,
      buildFixtureComponent({
        accessibility: {
          summary: [],
          rules: [],
        },
        examples: [],
        source: {
          repo_path: null,
          export_name: null,
        },
      }),
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      [
        "export-context",
        ".",
        "--component",
        "FixtureAction",
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );
    const payload = readJson(stdout);

    expect(stderr).toBe("");
    expect(exitCode).toBe(10);
    expect(validateSaltContextComponentSchema(payload)).toEqual([]);
    expect(payload).toEqual(
      expect.objectContaining({
        contract: "salt_context_component_v1",
        status: "unsupported",
        unsupported_claims: expect.arrayContaining([
          expect.objectContaining({
            field_path: "source.export_name",
          }),
          expect.objectContaining({
            field_path: "examples",
          }),
        ]),
        surface_gate: expect.objectContaining({
          status: "unsupported",
          unsupported_claim_count: 2,
        }),
      }),
    );
    expect(payload.component).toEqual(
      expect.objectContaining({
        import: null,
        accessibility: {
          summary: [],
        },
        examples: [],
      }),
    );
  });

  it("writes a manifest and checks generated component context for staleness", async () => {
    const rootDir = await createTempDir("salt-cli-export-context-check");
    const registryDir = path.join(rootDir, "registry");
    const outputPath = path.join(rootDir, ".salt", "context", "component.json");
    const manifestPath = path.join(
      rootDir,
      ".salt",
      "context",
      "manifest.json",
    );
    await writeFixtureRegistry(registryDir, buildFixtureComponent(), {
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });

    let exportStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--component",
          "fixture-action",
          "--json",
          "--output",
          outputPath,
          "--manifest",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            exportStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(0);
    const context = readJson(exportStdout);
    const manifest = await readJsonFile(manifestPath);

    expect(validateSaltContextComponentSchema(context)).toEqual([]);
    expect(
      validateSaltContextComponentSchema(await readJsonFile(outputPath)),
    ).toEqual([]);
    expect(validateSaltContextPackManifestSchema(manifest)).toEqual([]);
    expect(manifest).toEqual(
      expect.objectContaining({
        contract: "salt_context_pack_manifest_v1",
        status: "validated",
        coverage_gaps: [],
        registry: expect.objectContaining({
          hash: expect.stringMatching(/^sha256:/),
        }),
        entries: [
          expect.objectContaining({
            kind: "component",
            id: "fixture-action",
            output_path: ".salt/context/component.json",
            status: "validated",
            generated_artifact_id: "component-context.fixture-action",
            evidence_ref_ids: ["fixture-action.name.ref"],
            evidence_ref_count: expect.any(Number),
            unsupported_claim_count: 0,
          }),
        ],
      }),
    );
    expect(
      (manifest.coverage_gaps as Array<{ kind?: string }>).some((gap) =>
        ["pattern", "foundation"].includes(gap.kind ?? ""),
      ),
    ).toBe(false);

    let checkStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--component",
          "fixture-action",
          "--output",
          outputPath,
          "--check",
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            checkStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(0);
    const checkPayload = readJson(checkStdout);
    expect(validateSaltContextComponentCheckSchema(checkPayload)).toEqual([]);
    expect(checkPayload).toEqual(
      expect.objectContaining({
        contract: "salt_context_component_check_v1",
        status: "current",
        current: true,
        supported: true,
        evidence_ref_ids: ["fixture-action.name.ref"],
        mismatches: [],
      }),
    );

    await writeFixtureRegistry(
      registryDir,
      buildFixtureComponent({
        summary: "Updated fixture source-backed action component.",
      }),
    );
    let registryHashStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--component",
          "fixture-action",
          "--output",
          outputPath,
          "--check",
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            registryHashStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const registryHashPayload = readJson(registryHashStdout);
    expect(
      validateSaltContextComponentCheckSchema(registryHashPayload),
    ).toEqual([]);
    expect(registryHashPayload).toEqual(
      expect.objectContaining({
        status: "stale",
        current: false,
        supported: true,
        mismatches: expect.arrayContaining([
          "registry",
          "component",
          "generated_artifact",
        ]),
      }),
    );
    await writeFixtureRegistry(registryDir, buildFixtureComponent());

    const tamperedEvidenceContext = await readJsonFile(outputPath);
    const evidenceRefs = tamperedEvidenceContext.evidence_refs as Array<
      Record<string, unknown>
    >;
    const firstEvidenceRefRegistry = evidenceRefs[0]?.registry as Record<
      string,
      unknown
    >;
    firstEvidenceRefRegistry.field_path = "name.tampered";
    const generatedArtifact =
      tamperedEvidenceContext.generated_artifact as Record<string, unknown>;
    const artifactEvidenceRefs = generatedArtifact.evidence_refs as Array<
      Record<string, unknown>
    >;
    const firstArtifactEvidenceRefRegistry = artifactEvidenceRefs[0]
      ?.registry as Record<string, unknown>;
    firstArtifactEvidenceRefRegistry.field_path = "name.tampered";
    await fs.writeFile(
      outputPath,
      `${JSON.stringify(tamperedEvidenceContext, null, 2)}\n`,
      "utf8",
    );

    let tamperedEvidenceStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--component",
          "fixture-action",
          "--output",
          outputPath,
          "--check",
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            tamperedEvidenceStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const tamperedEvidencePayload = readJson(tamperedEvidenceStdout);
    expect(
      validateSaltContextComponentCheckSchema(tamperedEvidencePayload),
    ).toEqual([]);
    expect(tamperedEvidencePayload).toEqual(
      expect.objectContaining({
        status: "stale",
        current: false,
        supported: true,
        mismatches: expect.arrayContaining([
          "evidence_refs",
          "generated_artifact",
        ]),
      }),
    );
    await fs.writeFile(
      outputPath,
      `${JSON.stringify(context, null, 2)}\n`,
      "utf8",
    );

    const staleContext = await readJsonFile(outputPath);
    const staleComponent = staleContext.component as Record<string, unknown>;
    staleComponent.name = {
      value: "StaleFixtureAction",
      evidence_ref_ids: ["fixture-action.name.ref"],
    };
    await fs.writeFile(
      outputPath,
      `${JSON.stringify(staleContext, null, 2)}\n`,
      "utf8",
    );

    let staleStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--component",
          "fixture-action",
          "--output",
          outputPath,
          "--check",
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            staleStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const stalePayload = readJson(staleStdout);
    expect(validateSaltContextComponentCheckSchema(stalePayload)).toEqual([]);
    expect(stalePayload).toEqual(
      expect.objectContaining({
        status: "stale",
        current: false,
        supported: true,
        mismatches: expect.arrayContaining(["component"]),
      }),
    );
  });

  it("checks unsupported fixture context as degraded instead of current", async () => {
    const rootDir = await createTempDir(
      "salt-cli-export-context-check-unsupported",
    );
    const registryDir = path.join(rootDir, "registry");
    const outputPath = path.join(rootDir, ".salt", "context", "component.json");
    await writeFixtureRegistry(
      registryDir,
      buildFixtureComponent({
        examples: [],
      }),
    );

    await runCli(
      [
        "export-context",
        "--component",
        "fixture-action",
        "--output",
        outputPath,
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: () => {},
        writeStderr: () => {},
      },
    );

    let stdout = "";
    expect(
      await runCli(
        [
          "export-context",
          "--component",
          "fixture-action",
          "--output",
          outputPath,
          "--check",
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            stdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const unsupportedCheckPayload = readJson(stdout);
    expect(
      validateSaltContextComponentCheckSchema(unsupportedCheckPayload),
    ).toEqual([]);
    expect(unsupportedCheckPayload).toEqual(
      expect.objectContaining({
        status: "unsupported",
        current: false,
        supported: false,
        mismatches: [],
        missing: ["component context has 1 unsupported claim(s)"],
      }),
    );
  });

  it("exports the default selected context pack from fixture registry records", async () => {
    const rootDir = await createTempDir("salt-cli-export-context-pack");
    const registryDir = path.join(rootDir, "registry");
    const outputDir = path.join(rootDir, ".salt", "context", "components");
    const manifestPath = path.join(
      rootDir,
      ".salt",
      "context",
      "manifest.json",
    );
    await writeFixtureRegistry(registryDir, buildFixtureComponent(), {
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });

    let stdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--manifest",
          "--output-dir",
          outputDir,
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            stdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(0);
    const manifest = readJson(stdout);
    const componentContextPath = path.join(outputDir, "fixture-action.json");
    const componentMarkdownPath = path.join(
      outputDir,
      "fixture-action.context.md",
    );
    const patternContextPath = path.join(
      outputDir,
      "fixture-workflow.pattern.json",
    );
    const foundationContextPath = path.join(
      outputDir,
      "tokens-fixture-color.foundation.json",
    );
    const promptSurfacePath = path.join(
      outputDir,
      "workflow-prompts.prompt.json",
    );
    const instructionSurfacePath = path.join(
      outputDir,
      "host-instructions.instruction.json",
    );

    expect(validateSaltContextPackManifestSchema(manifest)).toEqual([]);
    expect(manifest).toEqual(
      expect.objectContaining({
        contract: "salt_context_pack_manifest_v1",
        status: "validated",
        coverage_gaps: [],
        entries: expect.arrayContaining([
          expect.objectContaining({
            kind: "component",
            id: "fixture-action",
            output_path: ".salt/context/components/fixture-action.json",
            evidence_ref_ids: ["fixture-action.name.ref"],
            unsupported_claim_count: 0,
          }),
          expect.objectContaining({
            kind: "component_markdown",
            id: "fixture-action",
            output_path: ".salt/context/components/fixture-action.context.md",
            contract: "salt_context_component_markdown_v1",
            generated_artifact_kind: "component-markdown-bridge",
            evidence_ref_ids: expect.arrayContaining([
              "fixture-action.name.ref",
              "fixture-action.props.fixtureProp.ref",
            ]),
            unsupported_claim_count: 0,
          }),
          expect.objectContaining({
            kind: "pattern",
            id: "fixture-workflow",
            output_path: ".salt/context/components/fixture-workflow.pattern.json",
            contract: "salt_context_pattern_v1",
            generated_artifact_kind: "pattern-context",
            evidence_ref_ids: ["fixture-workflow.name.ref"],
            unsupported_claim_count: 0,
          }),
          expect.objectContaining({
            kind: "foundation",
            id: "tokens.fixture-color",
            output_path:
              ".salt/context/components/tokens-fixture-color.foundation.json",
            contract: "salt_context_foundation_v1",
            generated_artifact_kind: "foundation-context",
            evidence_ref_ids: ["salt-fixture-action-color.category.ref"],
            unsupported_claim_count: 0,
          }),
          expect.objectContaining({
            kind: "prompt",
            id: "workflow-prompts",
            output_path: ".salt/context/components/workflow-prompts.prompt.json",
            contract: "salt_context_prompt_instruction_surface_v1",
            generated_artifact_kind: "prompt",
            evidence_ref_ids: expect.arrayContaining([
              "prompt.workflow-prompts.salt-ds-skill-first-load.ref",
            ]),
            unsupported_claim_count: 0,
          }),
          expect.objectContaining({
            kind: "instruction",
            id: "host-instructions",
            output_path:
              ".salt/context/components/host-instructions.instruction.json",
            contract: "salt_context_prompt_instruction_surface_v1",
            generated_artifact_kind: "instruction",
            evidence_ref_ids: expect.arrayContaining([
              "instruction.host-instructions.salt-repo-instructions-template.ref",
            ]),
            unsupported_claim_count: 0,
          }),
        ]),
      }),
    );
    expect(
      validateSaltContextPackManifestSchema(await readJsonFile(manifestPath)),
    ).toEqual([]);
    expect(
      validateSaltContextComponentSchema(
        await readJsonFile(componentContextPath),
      ),
    ).toEqual([]);
    expect(
      validateSaltContextPatternSchema(await readJsonFile(patternContextPath)),
    ).toEqual([]);
    expect(
      validateSaltContextFoundationSchema(
        await readJsonFile(foundationContextPath),
      ),
    ).toEqual([]);
    const promptSurface = await readJsonFile(promptSurfacePath);
    const instructionSurface = await readJsonFile(instructionSurfacePath);
    for (const surface of [
      promptSurface,
      instructionSurface,
    ] as Array<Record<string, unknown>>) {
      expect(
        validateSaltContextPromptHostInstructionSurfaceSchema(surface),
      ).toEqual(
        [],
      );
      expect(surface).toEqual(
        expect.objectContaining({
          contract: "salt_context_prompt_instruction_surface_v1",
          status: "validated",
          generated_artifact: expect.objectContaining({
            evidence_refs: expect.arrayContaining([expect.any(Object)]),
            unsupported_claims: [],
          }),
        }),
      );
    }
    const markdown = await fs.readFile(componentMarkdownPath, "utf8");
    expect(markdown).toContain(
      "FixtureAction [EvidenceRef: fixture-action.name.ref]",
    );
    expect(markdown).toContain("`fixtureProp`");
    expect(markdown).toContain(
      "[EvidenceRef: fixture-action.props.fixtureProp.ref]",
    );

    let checkStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--manifest",
          "--check",
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            checkStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(0);
    const checkPayload = readJson(checkStdout);
    expect(validateSaltGeneratedContextHealthSchema(checkPayload)).toEqual([]);
    expect(checkPayload).toEqual(
      expect.objectContaining({
        status: "current",
        entryCount: 6,
        missingOutputs: [],
        entries: expect.arrayContaining([
          expect.objectContaining({
            kind: "component",
            outputStatus: "current",
            mismatches: [],
          }),
          expect.objectContaining({
            kind: "component_markdown",
            outputStatus: "current",
            mismatches: [],
          }),
          expect.objectContaining({
            kind: "pattern",
            outputStatus: "current",
            mismatches: [],
          }),
          expect.objectContaining({
            kind: "foundation",
            outputStatus: "current",
            mismatches: [],
          }),
          expect.objectContaining({
            kind: "prompt",
            outputStatus: "current",
            mismatches: [],
          }),
          expect.objectContaining({
            kind: "instruction",
            outputStatus: "current",
            mismatches: [],
          }),
        ]),
      }),
    );

    await fs.appendFile(
      componentMarkdownPath,
      "\nUndocumented fixture prop: missingProp\n",
      "utf8",
    );
    let staleMarkdownStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--manifest",
          "--check",
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            staleMarkdownStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const staleMarkdownPayload = readJson(staleMarkdownStdout);
    expect(staleMarkdownPayload.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "component_markdown",
          outputStatus: "stale",
          mismatches: ["markdown"],
        }),
      ]),
    );
  });

  it("omits unsupported default pack entries when selected fixture evidence is missing", async () => {
    const rootDir = await createTempDir(
      "salt-cli-export-context-pack-unsupported",
    );
    const registryDir = path.join(rootDir, "registry");
    const outputDir = path.join(rootDir, ".salt", "context", "components");
    await writeFixtureRegistry(
      registryDir,
      buildFixtureComponent({
        examples: [],
      }),
    );

    let stdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--manifest",
          "--output-dir",
          outputDir,
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            stdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const manifest = readJson(stdout);

    expect(validateSaltContextPackManifestSchema(manifest)).toEqual([]);
    expect(manifest).toEqual(
      expect.objectContaining({
        status: "unsupported",
        coverage_gaps: expect.arrayContaining([
          expect.objectContaining({
            kind: "component",
            status: "unsupported",
            missing: ["selected source-backed component registry records"],
            evidence_ref_ids: [],
          }),
          expect.objectContaining({
            kind: "pattern",
            status: "unsupported",
            evidence_ref_ids: [],
          }),
        ]),
      }),
    );
    expect(
      (manifest.entries as Array<{ kind?: string }>).filter((entry) =>
        entry.kind === "component" || entry.kind === "component_markdown",
      ),
    ).toEqual([]);
  });

  it("emits a fixture coverage audit instead of filling docs or registry gaps", async () => {
    const rootDir = await createTempDir("salt-cli-export-context-coverage");
    const registryDir = path.join(rootDir, "registry");
    const outputPath = path.join(rootDir, ".salt", "coverage.json");
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
    await writeFixtureRegistry(registryDir, buildFixtureComponent(), {
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

    let stdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--coverage",
          "--json",
          "--output",
          outputPath,
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            stdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const audit = readJson(stdout);

    expect(validateSaltContextCoverageAuditSchema(audit)).toEqual([]);
    expect(audit).toEqual(
      expect.objectContaining({
        contract: "salt_context_coverage_audit_v1",
        status: "unsupported",
        component_contexts: expect.objectContaining({
          selected_records: 1,
          source_gap_count: 0,
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
            kind: "pattern",
            id: "fixture-workflow",
            missing: ["pattern source locator"],
            evidence_ref_ids: [],
          }),
          expect.objectContaining({
            kind: "foundation",
            id: "tokens.fixture-color",
            missing: ["token policy docs or source-backed policy evidence"],
            evidence_ref_ids: [],
            records: [
              expect.objectContaining({
                kind: "token",
                id: "--salt-fixture-action-color",
                status: "unsupported",
                reason_code:
                  "missing_token_policy_docs_or_source_evidence",
                missing: ["policy docs", "source-backed policy evidence"],
                evidence_ref_ids: [],
              }),
            ],
          }),
        ]),
      }),
    );
    expect(await readJsonFile(outputPath)).toEqual(audit);
  });

  it("emits a fixture gap catalog with causes instead of filling docs or registry gaps", async () => {
    const rootDir = await createTempDir(
      "salt-cli-export-context-gap-catalog",
    );
    const registryDir = path.join(rootDir, "registry");
    const outputPath = path.join(rootDir, ".salt", "gap-catalog.json");
    const markdownPath = path.join(rootDir, ".salt", "gap-catalog.md");
    const tokenWithoutPolicy = buildFixtureToken({
      policy: null,
      policy_gap: {
        reason:
          "Fixture token is missing source-backed policy evidence for generated context.",
        missing: ["token policy"],
        evidence_refs: [],
      },
    });
    await writeFixtureRegistry(registryDir, buildFixtureComponent(), {
      patterns: [
        buildFixturePattern({
          resources: [],
          examples: [],
          related_docs: {
            overview: null,
          },
        }),
      ],
      tokens: [tokenWithoutPolicy],
    });

    let stdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--gap-catalog",
          "--json",
          "--output",
          outputPath,
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            stdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const catalog = readJson(stdout);

    expect(validateSaltContextCoverageGapCatalogSchema(catalog)).toEqual([]);
    expect(catalog).toEqual(
      expect.objectContaining({
        contract: "salt_context_coverage_gap_catalog_v1",
        audit_contract: "salt_context_coverage_audit_v1",
        audit_status: "unsupported",
        counts: expect.objectContaining({
          total: 2,
          pattern: 1,
          foundation: 1,
        }),
        gaps: expect.arrayContaining([
          expect.objectContaining({
            kind: "pattern",
            id: "fixture-workflow",
            cause_codes: ["missing_source_locator"],
            evidence_ref_ids: expect.any(Array),
            resolution: "add_source_backed_docs_or_registry_evidence",
          }),
          expect.objectContaining({
            kind: "foundation",
            id: "tokens.fixture-color",
            cause_codes: ["missing_token_policy"],
            evidence_ref_ids: expect.any(Array),
            records: [
              expect.objectContaining({
                id: "--salt-fixture-action-color",
                cause_code: "missing_token_policy",
                evidence_ref_ids: expect.any(Array),
                missing: ["token policy"],
              }),
            ],
          }),
        ]),
      }),
    );
    expect(await readJsonFile(outputPath)).toEqual(catalog);

    let markdownStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--gap-catalog",
          "--format",
          "markdown",
          "--output",
          markdownPath,
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            markdownStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const markdown = await fs.readFile(markdownPath, "utf8");

    expect(markdown).toBe(markdownStdout);
    expect(markdown).toContain("missing_source_locator");
    expect(markdown).toContain("missing_token_policy");
    expect(markdown).not.toMatch(/recommended replacement|use .+ instead/i);
  });

  it("surfaces generated context manifest health in info json", async () => {
    const rootDir = await createTempDir("salt-cli-export-context-info");
    const registryDir = path.join(rootDir, "registry");
    const outputPath = path.join(rootDir, ".salt", "context", "component.json");
    await writeFixtureRegistry(registryDir, buildFixtureComponent());
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/fixture": "0.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await runCli(
      [
        "export-context",
        ".",
        "--component",
        "fixture-action",
        "--output",
        outputPath,
        "--manifest",
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: () => {},
        writeStderr: () => {},
      },
    );

    let stdout = "";
    expect(
      await runCli(["info", ".", "--json", "--registry-dir", registryDir], {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);
    const infoPayload = readJson(stdout);
    expect(
      validateSaltGeneratedContextHealthSchema(infoPayload.generatedContext),
    ).toEqual([]);
    expect(infoPayload.generatedContext).toEqual(
      expect.objectContaining({
        contract: "salt_generated_context_health_v1",
        present: true,
        status: "current",
        registry: expect.objectContaining({
          hash: expect.stringMatching(/^sha256:/),
          current_hash: expect.stringMatching(/^sha256:/),
        }),
        entryCount: 1,
        unsupportedEntries: 0,
        unsupportedCoverageGaps: 0,
        staleEntries: 0,
        missingOutputs: [],
        coverageGaps: [],
        recommendedAction: "none",
        entries: [
          expect.objectContaining({
            kind: "component",
            id: "fixture-action",
            outputExists: true,
            status: "validated",
            evidenceRefIds: ["fixture-action.name.ref"],
          }),
        ],
      }),
    );

    await fs.rm(outputPath);

    let staleStdout = "";
    expect(
      await runCli(["info", ".", "--json", "--registry-dir", registryDir], {
        cwd: rootDir,
        writeStdout: (message) => {
          staleStdout += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);
    const staleInfoPayload = readJson(staleStdout);
    expect(
      validateSaltGeneratedContextHealthSchema(
        staleInfoPayload.generatedContext,
      ),
    ).toEqual([]);
    expect(staleInfoPayload.generatedContext).toEqual(
      expect.objectContaining({
        present: true,
        status: "stale",
        registry: expect.objectContaining({
          hash: expect.stringMatching(/^sha256:/),
          current_hash: expect.stringMatching(/^sha256:/),
        }),
        entryCount: 1,
        unsupportedCoverageGaps: 0,
        staleEntries: 1,
        missingOutputs: [".salt/context/component.json"],
        coverageGaps: [],
        recommendedAction: "export-context-check",
      }),
    );
  });

  it("release-gates fixture prompt artifacts through shared generated-artifact evidence", async () => {
    const rootDir = await createTempDir("salt-cli-export-context-release-gate");
    const registryDir = path.join(rootDir, "registry");
    const component = buildFixtureComponent();
    const supportedArtifactPath = path.join(rootDir, "fixture-prompt.json");
    const unsupportedArtifactPath = path.join(
      rootDir,
      "fixture-prompt-unsupported.json",
    );
    await writeFixtureRegistry(registryDir, component);
    await fs.writeFile(
      supportedArtifactPath,
      `${JSON.stringify(
        buildFixturePromptArtifact(component, { evidence: "status" }),
        null,
        2,
      )}\n`,
      "utf8",
    );
    await fs.writeFile(
      unsupportedArtifactPath,
      `${JSON.stringify(
        buildFixturePromptArtifact(component, { evidence: "missing" }),
        null,
        2,
      )}\n`,
      "utf8",
    );

    let supportedStdout = "";
    let unsupportedStdout = "";
    const supportedExitCode = await runCli(
      [
        "export-context",
        ".",
        "--release-gate",
        supportedArtifactPath,
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: (message) => {
          supportedStdout += message;
        },
        writeStderr: () => {},
      },
    );
    const unsupportedExitCode = await runCli(
      [
        "export-context",
        ".",
        "--release-gate",
        unsupportedArtifactPath,
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: (message) => {
          unsupportedStdout += message;
        },
        writeStderr: () => {},
      },
    );
    const supportedGate = readJson(supportedStdout);
    const unsupportedGate = readJson(unsupportedStdout);

    expect(supportedExitCode).toBe(0);
    expect(validateSaltGeneratedArtifactReleaseGateSchema(supportedGate)).toEqual(
      [],
    );
    expect(supportedGate).toEqual(
      expect.objectContaining({
        contract: "salt_generated_artifact_release_gate_v1",
        status: "passed",
        releasable: true,
        artifact_kind: "prompt",
        target_kind: "prompt",
        surface_gate: expect.objectContaining({
          status: "validated",
          artifact_kind: "prompt",
        }),
      }),
    );

    expect(unsupportedExitCode).toBe(10);
    expect(
      validateSaltGeneratedArtifactReleaseGateSchema(unsupportedGate),
    ).toEqual([]);
    expect(unsupportedGate).toEqual(
      expect.objectContaining({
        status: "blocked",
        releasable: false,
        artifact_kind: "prompt",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_claim_evidence",
            path: "claims[0].evidence_ref_ids",
          }),
        ]),
      }),
    );
  });

  it("release-gates generated fixture context files and blocks undocumented fixture evidence", async () => {
    const rootDir = await createTempDir(
      "salt-cli-export-context-release-gate-context",
    );
    const registryDir = path.join(rootDir, "registry");
    const outputPath = path.join(rootDir, ".salt", "context", "component.json");
    await writeFixtureRegistry(registryDir, buildFixtureComponent());
    await runCli(
      [
        "export-context",
        ".",
        "--component",
        "fixture-action",
        "--output",
        outputPath,
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: () => {},
        writeStderr: () => {},
      },
    );

    let supportedStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--release-gate",
          outputPath,
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            supportedStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(0);
    const supportedGate = readJson(supportedStdout);
    expect(validateSaltGeneratedArtifactReleaseGateSchema(supportedGate)).toEqual(
      [],
    );
    expect(supportedGate).toEqual(
      expect.objectContaining({
        status: "passed",
        releasable: true,
        artifact_kind: "component-context",
        target_kind: "component-context",
      }),
    );

    const tamperedContext = await readJsonFile(outputPath);
    const generatedArtifact =
      tamperedContext.generated_artifact as Record<string, unknown>;
    const artifactEvidenceRefs = generatedArtifact.evidence_refs as Array<
      Record<string, unknown>
    >;
    const firstRegistryRef = artifactEvidenceRefs[0]?.registry as Record<
      string,
      unknown
    >;
    firstRegistryRef.field_path = "props.undocumentedFixtureProp";
    await fs.writeFile(
      outputPath,
      `${JSON.stringify(tamperedContext, null, 2)}\n`,
      "utf8",
    );

    let blockedStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--release-gate",
          outputPath,
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            blockedStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const blockedGate = readJson(blockedStdout);
    expect(validateSaltGeneratedArtifactReleaseGateSchema(blockedGate)).toEqual(
      [],
    );
    expect(blockedGate).toEqual(
      expect.objectContaining({
        status: "blocked",
        releasable: false,
        artifact_kind: "component-context",
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_field",
            path: "evidence_refs[0].registry.field_path",
          }),
        ]),
      }),
    );
  });

  it("release-gates generated prompt and instruction surfaces as source-backed", async () => {
    const rootDir = await createTempDir(
      "salt-cli-export-context-release-gate-unsupported",
    );
    const registryDir = path.join(rootDir, "registry");
    const manifestPath = path.join(rootDir, ".salt", "context", "manifest.json");
    const outputDir = path.join(rootDir, ".salt", "context", "components");
    await writeFixtureRegistry(registryDir, buildFixtureComponent(), {
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });
    await runCli(
      [
        "export-context",
        ".",
        "--manifest",
        manifestPath,
        "--output-dir",
        outputDir,
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: () => {},
        writeStderr: () => {},
      },
    );

    for (const fileName of [
      "workflow-prompts.prompt.json",
      "host-instructions.instruction.json",
    ]) {
      let stdout = "";
      const exitCode = await runCli(
        [
          "export-context",
          ".",
          "--release-gate",
          path.join(outputDir, fileName),
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            stdout += message;
          },
          writeStderr: () => {},
        },
      );
      const payload = readJson(stdout);

      expect(exitCode).toBe(0);
      expect(validateSaltGeneratedArtifactReleaseGateSchema(payload)).toEqual(
        [],
      );
      expect(payload).toEqual(
        expect.objectContaining({
          status: "passed",
          releasable: true,
          unsupported_claim_count: 0,
          surface_gate: expect.objectContaining({
            status: "validated",
          }),
        }),
      );
    }
  });

  it("release-gates fixture context manifests and directories as aggregate batches", async () => {
    const rootDir = await createTempDir(
      "salt-cli-export-context-release-gate-batch",
    );
    const registryDir = path.join(rootDir, "registry");
    const manifestPath = path.join(rootDir, ".salt", "context", "manifest.json");
    const outputDir = path.join(rootDir, ".salt", "context", "components");
    await writeFixtureRegistry(registryDir, buildFixtureComponent(), {
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });
    await runCli(
      [
        "export-context",
        ".",
        "--manifest",
        manifestPath,
        "--output-dir",
        outputDir,
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: () => {},
        writeStderr: () => {},
      },
    );

    let manifestStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--release-gate",
          manifestPath,
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            manifestStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(0);
    const manifestGate = readJson(manifestStdout);
    expect(
      validateSaltGeneratedArtifactReleaseGateBatchSchema(manifestGate),
    ).toEqual([]);
    expect(manifestGate).toEqual(
      expect.objectContaining({
        contract: "salt_generated_artifact_release_gate_batch_v1",
        status: "passed",
        releasable: true,
        target_count: 5,
        passed_count: 5,
        coverage_gap_count: 0,
        coverage_gaps: [],
      }),
    );

    let directoryStdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--release-gate",
          outputDir,
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            directoryStdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(0);
    const directoryGate = readJson(directoryStdout);
    expect(
      validateSaltGeneratedArtifactReleaseGateBatchSchema(directoryGate),
    ).toEqual([]);
    expect(directoryGate).toEqual(
      expect.objectContaining({
        status: "passed",
        releasable: true,
        target_count: 5,
        passed_count: 5,
        blocked_count: 0,
        unsupported_claim_count: 0,
      }),
    );
  });

  it("blocks manifest release-gates when generated fixture markdown docs are tampered", async () => {
    const rootDir = await createTempDir(
      "salt-cli-export-context-release-gate-markdown",
    );
    const registryDir = path.join(rootDir, "registry");
    const manifestPath = path.join(rootDir, ".salt", "context", "manifest.json");
    const outputDir = path.join(rootDir, ".salt", "context", "components");
    const markdownPath = path.join(outputDir, "fixture-action.context.md");
    await writeFixtureRegistry(registryDir, buildFixtureComponent(), {
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });
    await runCli(
      [
        "export-context",
        ".",
        "--manifest",
        manifestPath,
        "--output-dir",
        outputDir,
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: () => {},
        writeStderr: () => {},
      },
    );
    await fs.appendFile(
      markdownPath,
      "\nUndocumented fixture prop: missingFixtureProp\n",
      "utf8",
    );

    let stdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--release-gate",
          manifestPath,
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            stdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const gate = readJson(stdout);

    expect(validateSaltGeneratedArtifactReleaseGateBatchSchema(gate)).toEqual(
      [],
    );
    expect(gate).toEqual(
      expect.objectContaining({
        status: "blocked",
        releasable: false,
        coverage_gap_count: 1,
        coverage_gaps: [
          expect.objectContaining({
            kind: "component_markdown",
            id: "fixture-action",
            status: "unsupported",
            missing: [
              "component markdown bridge text is stale or contains unsupported changes",
            ],
          }),
        ],
      }),
    );
  });

  it("blocks directory release-gates when stray fixture JSON lacks generated-artifact evidence", async () => {
    const rootDir = await createTempDir(
      "salt-cli-export-context-release-gate-stray-json",
    );
    const registryDir = path.join(rootDir, "registry");
    const manifestPath = path.join(rootDir, ".salt", "context", "manifest.json");
    const outputDir = path.join(rootDir, ".salt", "context", "components");
    await writeFixtureRegistry(registryDir, buildFixtureComponent(), {
      patterns: [buildFixturePattern()],
      tokens: [buildFixtureToken()],
    });
    await runCli(
      [
        "export-context",
        ".",
        "--manifest",
        manifestPath,
        "--output-dir",
        outputDir,
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: () => {},
        writeStderr: () => {},
      },
    );
    await fs.writeFile(
      path.join(outputDir, "stray-fixture-context.json"),
      `${JSON.stringify(
        {
          contract: "salt_context_component_v1",
          claim: "FixtureAction undocumented fixture claim.",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    let stdout = "";
    expect(
      await runCli(
        [
          "export-context",
          ".",
          "--release-gate",
          outputDir,
          "--json",
          "--registry-dir",
          registryDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            stdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(10);
    const gate = readJson(stdout);

    expect(validateSaltGeneratedArtifactReleaseGateBatchSchema(gate)).toEqual(
      [],
    );
    expect(gate).toEqual(
      expect.objectContaining({
        status: "blocked",
        releasable: false,
        coverage_gap_count: 1,
        coverage_gaps: [
          expect.objectContaining({
            kind: "json",
            id: ".salt/context/components/stray-fixture-context.json",
            status: "unsupported",
            evidence_ref_ids: [],
          }),
        ],
      }),
    );
  });

  it("surfaces generated context stale health in doctor json", async () => {
    const rootDir = await createTempDir("salt-cli-export-context-doctor");
    const registryDir = path.join(rootDir, "registry");
    const outputPath = path.join(rootDir, ".salt", "context", "component.json");
    const bundleDir = path.join(rootDir, "doctor-bundle");
    await writeFixtureRegistry(registryDir, buildFixtureComponent());
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/fixture": "0.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await runCli(
      [
        "export-context",
        ".",
        "--component",
        "fixture-action",
        "--output",
        outputPath,
        "--manifest",
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: () => {},
        writeStderr: () => {},
      },
    );
    await fs.rm(outputPath);

    let stdout = "";
    expect(
      await runCli(
        [
          "doctor",
          ".",
          "--ai",
          "--json",
          "--registry-dir",
          registryDir,
          "--bundle-dir",
          bundleDir,
        ],
        {
          cwd: rootDir,
          writeStdout: (message) => {
            stdout += message;
          },
          writeStderr: () => {},
        },
      ),
    ).toBe(0);
    const payload = readJson(stdout);

    expect(
      validateSaltGeneratedContextHealthSchema(payload.generatedContext),
    ).toEqual([]);
    expect(validateSaltAiSetupSchema(payload.aiSetup)).toEqual([]);
    expect(
      validateSaltAiEvidenceClosureReportSchema(payload.aiEvidenceClosure),
    ).toEqual([]);
    expect(payload.aiSetup).toEqual(
      expect.objectContaining({
        contract: "salt_ai_setup_v1",
        status: "degraded",
        steps: expect.arrayContaining([
          expect.objectContaining({
            id: "generated-context",
            status: "action_required",
          }),
          expect.objectContaining({
            id: "release-gate",
            status: "action_required",
          }),
        ]),
      }),
    );
    expect(payload.aiEvidenceClosure).toEqual(
      expect.objectContaining({
        contract: "salt_ai_evidence_closure_report_v1",
        status: "degraded",
        evidence_refs: [],
        release_gate: expect.objectContaining({
          status: "blocked",
          releasable: false,
        }),
        slices: expect.arrayContaining([
          expect.objectContaining({
            id: "release-gate-everywhere",
            status: "degraded",
          }),
          expect.objectContaining({
            id: "prompt-host-instruction-closure",
            status: "ready",
          }),
        ]),
      }),
    );
    expect(payload.generatedContext).toEqual(
      expect.objectContaining({
        contract: "salt_generated_context_health_v1",
        status: "stale",
        registry: expect.objectContaining({
          hash: expect.stringMatching(/^sha256:/),
          current_hash: expect.stringMatching(/^sha256:/),
        }),
        unsupportedCoverageGaps: 0,
        missingOutputs: [".salt/context/component.json"],
        coverageGaps: [],
        recommendedAction: "export-context-check",
      }),
    );
    expect(payload.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "generated-context-stale",
          status: "warn",
        }),
      ]),
    );
    await expect(
      fs.access(path.join(bundleDir, "generated-context-health.json")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(bundleDir, "generated-context-manifest.json")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(bundleDir, "generated-context-check-summary.json")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(
        path.join(
          bundleDir,
          "generated-context-prompt-instruction-surfaces.json",
        ),
      ),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(bundleDir, "ai-evidence-closure-report.json")),
    ).resolves.toBeUndefined();
    expect(
      validateSaltGeneratedContextHealthSchema(
        await readJsonFile(
          path.join(bundleDir, "generated-context-health.json"),
        ),
      ),
    ).toEqual([]);
    const promptInstructionSurfaces = (await readJsonFile(
      path.join(
        bundleDir,
        "generated-context-prompt-instruction-surfaces.json",
      ),
    )) as unknown as unknown[];
    expect(promptInstructionSurfaces).toHaveLength(2);
    for (const surface of promptInstructionSurfaces) {
      expect(
        validateSaltContextPromptHostInstructionSurfaceSchema(surface),
      ).toEqual([]);
    }
    expect(
      validateSaltAiEvidenceClosureReportSchema(
        await readJsonFile(path.join(bundleDir, "ai-evidence-closure-report.json")),
      ),
    ).toEqual([]);
  });
});
