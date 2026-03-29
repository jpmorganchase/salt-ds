import { describe, expect, it } from "vitest";
import { buildRegistry } from "../../../semantic-core/src/index.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import { createSaltMcpServer } from "../server/createServer.js";
import {
  buildSaltMcpInstructions,
  buildSaltMcpServerInfo,
} from "../server/serverMetadata.js";
import { TOOL_DEFINITIONS } from "../server/toolDefinitions.js";
import {
  GENERATED_AT,
  REPO_ROOT,
  VERSION,
  withRegistryDir,
  writeBaseArtifacts,
} from "./registryTestUtils.js";

const EXPECTED_TOOL_NAMES = [
  "analyze_salt_code",
  "choose_salt_solution",
  "compare_salt_versions",
  "get_salt_project_context",
  "translate_ui_to_salt",
].sort();

const EXPECTED_DEFAULT_TOOL_ORDER = [
  "get_salt_project_context",
  "choose_salt_solution",
  "analyze_salt_code",
  "translate_ui_to_salt",
  "compare_salt_versions",
];

describe("createSaltMcpServer", () => {
  it("keeps the default consumer workflow tools first in metadata order", () => {
    expect(
      TOOL_DEFINITIONS.slice(0, EXPECTED_DEFAULT_TOOL_ORDER.length).map(
        (definition) => definition.name,
      ),
    ).toEqual(EXPECTED_DEFAULT_TOOL_ORDER);
  });

  it("keeps the default workflow schemas intentionally small", () => {
    const contextTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "get_salt_project_context",
    );
    const chooseTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "choose_salt_solution",
    );
    const translateTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "translate_ui_to_salt",
    );

    expect(Object.keys(contextTool?.inputSchema ?? {})).toEqual(["root_dir"]);
    expect(Object.keys(chooseTool?.inputSchema ?? {})).toEqual([
      "query",
      "names",
      "solution_type",
      "package",
      "status",
      "top_k",
      "production_ready",
      "prefer_stable",
      "a11y_required",
      "form_field_support",
      "include_starter_code",
      "view",
    ]);
    expect(Object.keys(translateTool?.inputSchema ?? {})).toEqual([
      "code",
      "query",
      "source_outline",
      "package",
      "prefer_stable",
      "a11y_required",
      "form_field_support",
      "include_starter_code",
      "view",
    ]);
    expect(contextTool?.description).toContain(
      "Start here for repo-aware Salt work.",
    );
    expect(chooseTool?.description).toContain(
      "If names is present, comparison mode wins",
    );
    expect(chooseTool?.description).toContain(
      "Recommendations are canonical Salt guidance only",
    );
    expect(translateTool?.description).toContain(
      "translated into Salt primitives, patterns, and migration steps",
    );
    expect(translateTool?.description).toContain(
      "project-specific patterns and wrappers belong in separate project conventions",
    );
  });

  it("registers the workflow-first beta tool surface by default", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await writeBaseArtifacts(registryDir);
      },
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const registeredTools = Object.keys(
          (
            server as unknown as {
              _registeredTools: Record<string, { description?: string }>;
            }
          )._registeredTools,
        ).sort();

        expect(registeredTools).toEqual(EXPECTED_TOOL_NAMES);
      },
    );
  });

  it("registers output schemas and read-only annotations for the default workflow tools", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await writeBaseArtifacts(registryDir);
      },
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const registeredTools = (
          server as unknown as {
            _registeredTools: Record<
              string,
              {
                annotations?: Record<string, unknown>;
                outputSchema?: unknown;
              }
            >;
          }
        )._registeredTools;

        for (const toolName of EXPECTED_TOOL_NAMES) {
          expect(registeredTools[toolName]?.outputSchema).toBeTruthy();
          expect(registeredTools[toolName]?.annotations).toEqual(
            expect.objectContaining({
              readOnlyHint: true,
              destructiveHint: false,
              idempotentHint: true,
              openWorldHint: false,
            }),
          );
        }
      },
    );
  });

  it("advertises the MCP runtime version separately from the registry version", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await writeBaseArtifacts(registryDir);
      },
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const runtimeInfo = buildSaltMcpServerInfo({
          generated_at: GENERATED_AT,
          version: VERSION,
          build_info: null,
          packages: [],
          components: [],
          icons: [],
          country_symbols: [],
          pages: [],
          patterns: [],
          guides: [],
          tokens: [],
          deprecations: [],
          examples: [],
          changes: [],
          search_index: [],
        });
        const instructions = buildSaltMcpInstructions({
          generated_at: GENERATED_AT,
          version: VERSION,
          build_info: null,
          packages: [],
          components: [],
          icons: [],
          country_symbols: [],
          pages: [],
          patterns: [],
          guides: [],
          tokens: [],
          deprecations: [],
          examples: [],
          changes: [],
          search_index: [],
        });
        const internalServer = (
          server as unknown as {
            server: {
              _serverInfo: { name: string; version: string };
              _instructions?: string;
            };
          }
        ).server;

        expect(internalServer._serverInfo).toEqual(runtimeInfo);
        expect(internalServer._serverInfo.version).not.toBe(VERSION);
        expect(internalServer._instructions).toBe(instructions);
        expect(internalServer._instructions).toContain(
          "When asked for the MCP version, use the runtime version.",
        );
        expect(internalServer._instructions).toContain(
          `Serving Salt registry v${VERSION}.`,
        );
        expect(internalServer._instructions).toContain(
          "This MCP only provides canonical Salt guidance from official Salt sources.",
        );
        expect(internalServer._instructions).toContain(
          "Repo-local wrappers, approved custom patterns, and team-specific conventions belong in separate project conventions",
        );
        expect(internalServer._instructions).toContain(
          "Keep the product workflows stable across transports",
        );
        expect(internalServer._instructions).toContain(
          "The default beta MCP surface is intentionally limited to the five repo-aware workflow tools.",
        );
        expect(internalServer._instructions).toContain(
          "Only call tools that are actually present in the current session tool list.",
        );
      },
    );
  });

  it("adds workflow-level confidence and remediation guidance to the primary MCP tools", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await buildRegistry({
          sourceRoot: REPO_ROOT,
          outputDir: registryDir,
          timestamp: "2026-03-28T00:00:00Z",
        });
      },
      async (registryDir) => {
        const registry = await loadRegistry({ registryDir });
        const chooseTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "choose_salt_solution",
        );
        const contextTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "get_salt_project_context",
        );
        const analyzeTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "analyze_salt_code",
        );
        const translateTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "translate_ui_to_salt",
        );
        const compareTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "compare_salt_versions",
        );

        const contextResult = await contextTool?.execute(registry, {
          root_dir: REPO_ROOT,
        });
        expect(contextResult).toEqual(
          expect.objectContaining({
            workflow: "context",
            transport: expect.objectContaining({
              canonical_transport: "mcp",
            }),
            workflows: expect.objectContaining({
              create: true,
              review: true,
              migrate: true,
              upgrade: true,
            }),
            summary: expect.objectContaining({
              recommended_next_workflow: expect.any(String),
            }),
          }),
        );

        const chooseResult = await chooseTool?.execute(registry, {
          query: "link to another page from a toolbar action",
          include_starter_code: true,
        });
        expect(chooseResult).toEqual(
          expect.objectContaining({
            confidence: expect.objectContaining({
              level: expect.any(String),
              reasons: expect.arrayContaining([expect.any(String)]),
            }),
            intent: expect.objectContaining({
              user_task: expect.any(String),
              rule_ids: expect.arrayContaining([
                "create-task-first",
                "create-canonical-before-custom",
              ]),
            }),
            suggested_follow_ups: expect.arrayContaining([
              expect.objectContaining({
                workflow: "ground_with_examples",
              }),
            ]),
          }),
        );

        const analyzeResult = await analyzeTool?.execute(registry, {
          code: [
            'import { Button } from "@salt-ds/core";',
            "",
            "export function Demo() {",
            '  return <Button href="/next">Go</Button>;',
            "}",
          ].join("\n"),
          framework: "react",
          package_version: "2.0.0",
        });
        expect(analyzeResult).toEqual(
          expect.objectContaining({
            confidence: expect.objectContaining({
              level: expect.any(String),
            }),
            issue_classes: expect.arrayContaining([
              expect.objectContaining({
                rule_id: expect.any(String),
                count: expect.any(Number),
              }),
            ]),
            rule_ids: expect.arrayContaining([expect.any(String)]),
            fix_candidates: expect.objectContaining({
              total_count: expect.any(Number),
              candidates: expect.any(Array),
            }),
          }),
        );

        const translateResult = await translateTool?.execute(registry, {
          query:
            "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
          source_outline: {
            regions: ["header", "sidebar"],
            actions: ["primary action"],
            states: ["loading"],
          },
        });
        expect(translateResult).toEqual(
          expect.objectContaining({
            confidence: expect.objectContaining({
              level: expect.any(String),
            }),
            rule_ids: expect.arrayContaining(["migrate-preserve-task-flow"]),
            post_migration_verification: expect.objectContaining({
              source_checks: expect.arrayContaining([expect.any(String)]),
              preserve_checks: expect.arrayContaining([expect.any(String)]),
            }),
            visual_evidence_contract: expect.objectContaining({
              role: "supporting-evidence",
              source_outline_provided: true,
              source_outline_signal_counts: expect.objectContaining({
                regions: 2,
                actions: 1,
                states: 1,
                notes: 0,
              }),
              runtime_capture: expect.objectContaining({
                supported_via_cli: true,
                command: "salt-ds migrate --url <url>",
              }),
            }),
          }),
        );

        const compareResult = await compareTool?.execute(registry, {
          package: "@salt-ds/core",
          from_version: "1.1.0",
          include_deprecations: true,
        });
        expect(compareResult).toEqual(
          expect.objectContaining({
            confidence: expect.objectContaining({
              level: expect.any(String),
              reasons: expect.arrayContaining([expect.any(String)]),
            }),
            rule_ids: ["upgrade-review-version-risks"],
          }),
        );
      },
    );
  }, 40000);
});
