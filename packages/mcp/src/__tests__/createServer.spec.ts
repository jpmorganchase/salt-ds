import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { describe, expect, it } from "vitest";
import * as z from "zod/v4";
import { loadRegistry } from "../registry/loadRegistry.js";
import { createSaltMcpServer } from "../server/createServer.js";
import {
  buildSaltMcpInstructions,
  buildSaltMcpServerInfo,
} from "../server/serverMetadata.js";
import {
  createToolExecutionRuntime,
  TOOL_DEFINITIONS,
} from "../server/toolDefinitions.js";
import {
  GENERATED_AT,
  REPO_ROOT,
  VERSION,
  withRegistryDir,
  writeBaseArtifacts,
} from "./registryTestUtils.js";

const EXPECTED_TOOL_NAMES = [
  "bootstrap_salt_repo",
  "review_salt_ui",
  "create_salt_ui",
  "upgrade_salt_ui",
  "get_salt_project_context",
  "migrate_to_salt",
].sort();

const EXPECTED_DEFAULT_TOOL_ORDER = [
  "get_salt_project_context",
  "bootstrap_salt_repo",
  "create_salt_ui",
  "review_salt_ui",
  "migrate_to_salt",
  "upgrade_salt_ui",
];

async function createTempDir(name: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
}

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
      (definition) => definition.name === "create_salt_ui",
    );
    const translateTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "migrate_to_salt",
    );

    expect(Object.keys(contextTool?.inputSchema ?? {})).toEqual([
      "root_dir",
      "include_policy_diagnostics",
    ]);
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
      "context_id",
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
      "context_id",
    ]);
    expect(Object.keys(translateTool?.inputSchema ?? {})).not.toContain(
      "mockup",
    );
    expect(Object.keys(translateTool?.inputSchema ?? {})).not.toContain(
      "screenshot",
    );
    expect(Object.keys(translateTool?.inputSchema ?? {})).not.toContain(
      "visual_evidence",
    );
    expect(contextTool?.description).toContain(
      "Inspect repo context for advanced Salt workflow debugging",
    );
    expect(chooseTool?.description).toContain(
      "If names is present, comparison mode wins",
    );
    expect(chooseTool?.description).toContain(
      "It returns canonical Salt guidance plus repo-policy artifacts",
    );
    expect(translateTool?.description).toContain(
      "translated into Salt primitives, patterns, and migration steps",
    );
    expect(translateTool?.description).toContain(
      "canonical Salt migration guidance plus repo-policy artifacts",
    );
    expect(translateTool?.description).not.toContain("raw screenshot");
  });

  it("allows repo-aware workflow execution without an explicit context_id", () => {
    const chooseTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "create_salt_ui",
    );
    const reviewTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "review_salt_ui",
    );
    const migrateTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "migrate_to_salt",
    );

    const chooseSchema = z.object(
      chooseTool?.inputSchema as Record<string, z.ZodType>,
    );
    const reviewSchema = z.object(
      reviewTool?.inputSchema as Record<string, z.ZodType>,
    );
    const migrateSchema = z.object(
      migrateTool?.inputSchema as Record<string, z.ZodType>,
    );

    expect(
      chooseSchema.safeParse({
        query: "navigate to another route",
      }).success,
    ).toBe(true);
    expect(
      reviewSchema.safeParse({
        code: "export const Demo = () => null;",
      }).success,
    ).toBe(true);
    expect(
      migrateSchema.safeParse({
        query: "toolbar layout",
      }).success,
    ).toBe(true);
  });

  it("publishes an explicit context output contract for get_salt_project_context", () => {
    const contextTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "get_salt_project_context",
    );
    const contextSchema = contextTool?.outputSchema as z.ZodType;

    expect(
      contextSchema.safeParse({
        workflow: {
          id: "get_salt_project_context",
        },
        result: {
          context_id: "repo:example",
          root_dir: "/repo",
          package_json_path: "/repo/package.json",
          environment: {
            os: "win32",
            node_version: "v22.0.0",
            package_manager: "pnpm",
          },
          framework: {
            name: "react",
            evidence: ["react dependency found"],
          },
          workspace: {
            kind: "single-package",
            workspace_root: null,
          },
          salt: {
            packages: [{ name: "@salt-ds/core", version: "2.0.0" }],
            package_version: "2.0.0",
            installation: {
              node_modules_roots: [],
              resolved_packages: [],
              installed_packages: [],
              version_health: {
                declared_versions: [],
                resolved_versions: [],
                installed_versions: [],
                multiple_declared_versions: false,
                multiple_resolved_versions: false,
                multiple_installed_versions: false,
                mismatched_packages: [],
                issues: [],
              },
              inspection: {
                package_manager: "pnpm",
                strategy: "node-modules-scan",
                status: "succeeded",
                list_command: null,
                discovered_versions: [],
                error: null,
                package_layout: "node-modules",
                limitations: [],
                manifest_override_fields: [],
              },
              remediation: {
                explain_command: null,
                dedupe_command: null,
                reinstall_command: null,
              },
              workspace: {
                kind: "single-package",
                package_root: "/repo",
                workspace_root: null,
                issue_source_hint: "none",
                workspace_salt_packages: [],
                workspace_issues: [],
              },
              duplicate_packages: [],
              health_summary: {
                health: "pass",
                recommended_action: "none",
                blocking_workflows: [],
                reasons: [],
              },
            },
          },
          repo_signals: {
            storybook_detected: false,
            app_runtime_detected: true,
            salt_team_config_found: false,
            salt_stack_config_found: false,
          },
          repo_instructions: {
            path: null,
            filename: null,
          },
          policy: {
            team_config_path: null,
            stack_config_path: null,
            mode: "none",
            approved_wrappers: [],
            stack_layers: [],
            shared_conventions: {
              enabled: false,
              pack_count: 0,
              packs: [],
              pack_details: [],
            },
          },
          imports: {
            tsconfig_path: null,
            aliases: [],
          },
          runtime: {
            detected_targets: [],
          },
          transport: {
            canonical_transport: "mcp",
            registry_version: "test",
            registry_generated_at: "2026-04-01T00:00:00Z",
          },
          workflows: {
            create: true,
            review: true,
            migrate: true,
            upgrade: true,
            runtime_evidence: false,
          },
        },
        artifacts: {
          summary: {
            recommended_next_tool: "create_salt_ui",
            bootstrap_requirement: {
              status: "recommended",
              tool: "bootstrap_salt_repo",
              cli_command: "salt-ds init",
              reason:
                "Bootstrap is optional for first results. Run bootstrap_salt_repo (or salt-ds init when MCP bootstrap is unavailable) when you want durable repo policy and the managed root instruction block for future repo-aware refinement.",
              next_tool_after_bootstrap: "create_salt_ui",
            },
            reasons: [
              "Bootstrap is optional for first results. Run bootstrap_salt_repo (or salt-ds init when MCP bootstrap is unavailable) when you want durable repo policy and the managed root instruction block for future repo-aware refinement.",
              "No existing Salt usage was detected, and the repo context looks ready for new Salt UI creation.",
            ],
          },
          notes: [],
        },
        sources: [],
      }).success,
    ).toBe(true);
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

  it("registers output schemas and workflow annotations for the default workflow tools", async () => {
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
          if (toolName === "bootstrap_salt_repo") {
            expect(registeredTools[toolName]?.annotations).toEqual(
              expect.objectContaining({
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
              }),
            );
          } else {
            expect(registeredTools[toolName]?.annotations).toEqual(
              expect.objectContaining({
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
              }),
            );
          }
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
          "Repo-local wrappers, approved custom patterns, and team-specific conventions stay in declared project policy",
        );
        expect(internalServer._instructions).toContain(
          "Keep the product workflows stable across transports",
        );
        expect(internalServer._instructions).toContain(
          "The default beta MCP surface is intentionally limited to the six repo-aware workflow tools.",
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
          (definition) => definition.name === "create_salt_ui",
        );
        const contextTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "get_salt_project_context",
        );
        const analyzeTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "review_salt_ui",
        );
        const translateTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "migrate_to_salt",
        );
        const compareTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "upgrade_salt_ui",
        );
        const runtime = createToolExecutionRuntime();

        const contextResult = (await contextTool?.execute(
          registry,
          {
            root_dir: REPO_ROOT,
          },
          runtime,
        )) as {
          result: {
            context_id: string;
          };
          sources: Array<{
            kind: string;
            original: string;
          }>;
        };
        expect(contextResult).toEqual(
          expect.objectContaining({
            workflow: {
              id: "get_salt_project_context",
            },
            result: expect.objectContaining({
              context_id: expect.any(String),
              transport: expect.objectContaining({
                canonical_transport: "mcp",
              }),
              workflows: expect.objectContaining({
                create: true,
                review: true,
                migrate: true,
                upgrade: true,
              }),
            }),
            artifacts: expect.objectContaining({
              summary: expect.objectContaining({
                recommended_next_tool: expect.any(String),
                bootstrap_requirement: expect.objectContaining({
                  status: "recommended",
                  tool: "bootstrap_salt_repo",
                  cli_command: "salt-ds init",
                  next_tool_after_bootstrap: expect.any(String),
                }),
              }),
            }),
          }),
        );
        expect(
          (contextTool?.outputSchema as z.ZodType).safeParse(contextResult)
            .success,
        ).toBe(true);
        expect(contextResult).toEqual(
          expect.objectContaining({
            sources: expect.arrayContaining([
              expect.objectContaining({
                kind: "repo",
                original: expect.stringContaining("/package.json"),
              }),
            ]),
          }),
        );

        const chooseResultWithoutContext = await chooseTool?.execute(
          registry,
          {
            query: "link to another route from a toolbar action",
            include_starter_code: true,
          },
          runtime,
        );
        expect(chooseResultWithoutContext).toEqual(
          expect.objectContaining({
            workflow: expect.objectContaining({
              id: "create_salt_ui",
              transport_used: "mcp",
              context_requirement: expect.objectContaining({
                status: "context_checked",
              }),
            }),
          }),
        );

        const chooseResult = await chooseTool?.execute(
          registry,
          {
            query: "link to another page from a toolbar action",
            include_starter_code: true,
            context_id: contextResult.result.context_id,
          },
          runtime,
        );
        expect(chooseResult).toEqual(
          expect.objectContaining({
            workflow: expect.objectContaining({
              id: "create_salt_ui",
              transport_used: "mcp",
              implementation_gate: expect.objectContaining({
                status: expect.stringMatching(
                  /^(clear|follow_through_required)$/,
                ),
                required_follow_through: expect.any(Array),
              }),
              readiness: expect.objectContaining({
                status: expect.stringMatching(
                  /^(starter_validated|starter_needs_attention)$/,
                ),
                implementation_ready: expect.any(Boolean),
              }),
              confidence: expect.objectContaining({
                level: expect.any(String),
                reasons: expect.arrayContaining([expect.any(String)]),
                raise_confidence: expect.arrayContaining([
                  expect.stringContaining(
                    "verify the exact name against canonical Salt guidance",
                  ),
                ]),
              }),
              intent: expect.objectContaining({
                user_task: expect.any(String),
                rule_ids: expect.arrayContaining([
                  "create-task-first",
                  "create-canonical-before-custom",
                ]),
              }),
              context_requirement: expect.objectContaining({
                status: "context_checked",
                repo_specific_edits_ready: true,
                satisfied_by: "salt-ds info",
              }),
            }),
            result: expect.objectContaining({
              mode: "recommend",
              ide_summary: expect.objectContaining({
                recommended_direction: expect.any(String),
                bounded_scope: expect.any(Array),
                starter_plan: expect.arrayContaining([expect.any(String)]),
                verify: expect.arrayContaining([expect.any(String)]),
              }),
              final_decision: expect.objectContaining({
                name: "Link",
                source: "canonical_salt",
              }),
            }),
            artifacts: expect.objectContaining({
              starter_validation: expect.objectContaining({
                status: expect.stringMatching(/^(clean|needs_attention)$/),
                snippets_checked: expect.any(Number),
                source_urls: expect.any(Array),
              }),
              suggested_follow_ups: expect.any(Array),
            }),
          }),
        );
        const publicFollowUps = (
          chooseResult as {
            artifacts: { suggested_follow_ups: Array<{ workflow: string }> };
          }
        ).artifacts.suggested_follow_ups;
        expect(
          publicFollowUps.every((followUp) =>
            [
              "get_salt_project_context",
              "create_salt_ui",
              "review_salt_ui",
              "migrate_to_salt",
              "upgrade_salt_ui",
            ].includes(followUp.workflow),
          ),
        ).toBe(true);

        const guidanceOnlyChooseResult = await chooseTool?.execute(
          registry,
          {
            query: "link to another page from a toolbar action",
            include_starter_code: false,
            context_id: contextResult.result.context_id,
          },
          runtime,
        );
        expect(guidanceOnlyChooseResult).toEqual(
          expect.objectContaining({
            workflow: expect.objectContaining({
              readiness: expect.objectContaining({
                status: "guidance_only",
                implementation_ready: false,
              }),
              context_requirement: expect.objectContaining({
                status: "context_checked",
                repo_specific_edits_ready: true,
              }),
            }),
            artifacts: expect.objectContaining({
              starter_validation: null,
            }),
          }),
        );

        const analyzeResult = await analyzeTool?.execute(
          registry,
          {
            code: [
              'import { Button } from "@salt-ds/core";',
              "",
              "export function Demo() {",
              '  return <Button href="/next">Go</Button>;',
              "}",
            ].join("\n"),
            framework: "react",
            package_version: "2.0.0",
            context_id: contextResult.result.context_id,
          },
          runtime,
        );
        expect(analyzeResult).toEqual(
          expect.objectContaining({
            workflow: expect.objectContaining({
              id: "review_salt_ui",
              confidence: expect.objectContaining({
                level: expect.any(String),
              }),
              project_conventions_check: expect.objectContaining({
                contract: "project_conventions_v1",
                suggested_follow_up_tool: "get_salt_project_context",
                suggested_follow_up_cli: "salt-ds info --json",
                declared_policy_status: "unknown-until-project-context",
              }),
            }),
            result: expect.objectContaining({
              ide_summary: expect.objectContaining({
                verdict: expect.objectContaining({
                  level: expect.stringMatching(
                    /^(clean|medium_risk|high_risk)$/,
                  ),
                  summary: expect.any(String),
                }),
                top_findings: expect.arrayContaining([expect.any(String)]),
                verify: expect.arrayContaining([expect.any(String)]),
              }),
            }),
            artifacts: expect.objectContaining({
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
          }),
        );

        const translateResult = await translateTool?.execute(
          registry,
          {
            query:
              "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
            include_starter_code: true,
            source_outline: {
              regions: ["header", "sidebar"],
              actions: ["primary action"],
              states: ["loading"],
            },
            context_id: contextResult.result.context_id,
          },
          runtime,
        );
        expect(translateResult).toEqual(
          expect.objectContaining({
            workflow: expect.objectContaining({
              id: "migrate_to_salt",
              confidence: expect.objectContaining({
                level: expect.any(String),
              }),
              context_requirement: expect.objectContaining({
                status: "context_checked",
                repo_specific_edits_ready: true,
                satisfied_by: "salt-ds info",
              }),
              project_conventions_check: expect.objectContaining({
                contract: "project_conventions_v1",
                suggested_follow_up_tool: "get_salt_project_context",
                suggested_follow_up_cli: "salt-ds info --json",
              }),
            }),
            result: expect.objectContaining({
              ide_summary: expect.objectContaining({
                screen_map: expect.any(Array),
                preserve: expect.any(Array),
                needs_confirmation: expect.any(Array),
                recommended_direction: expect.any(Array),
                first_scaffold: expect.arrayContaining([expect.any(String)]),
                verify: expect.arrayContaining([expect.any(String)]),
              }),
            }),
            artifacts: expect.objectContaining({
              starter_validation: expect.objectContaining({
                status: expect.stringMatching(/^(clean|needs_attention)$/),
                snippets_checked: expect.any(Number),
                source_urls: expect.any(Array),
              }),
              rule_ids: expect.arrayContaining(["migrate-preserve-task-flow"]),
              post_migration_verification: expect.objectContaining({
                source_checks: expect.arrayContaining([expect.any(String)]),
                preserve_checks: expect.arrayContaining([expect.any(String)]),
              }),
              visual_evidence_contract: expect.objectContaining({
                role: "supporting-evidence",
                interpretation_owner: "agent-or-adapter",
                normalization_required: true,
                normalization_contract: "migrate_visual_evidence_v1",
                source_outline_provided: true,
                source_outline_signal_counts: expect.objectContaining({
                  regions: 2,
                  actions: 1,
                  states: 1,
                  notes: 0,
                }),
                derived_outline_available: true,
                derived_outline_signal_counts: expect.objectContaining({
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
          }),
        );

        const compareResult = await compareTool?.execute(
          registry,
          {
            package: "@salt-ds/core",
            from_version: "1.1.0",
            include_deprecations: true,
          },
          runtime,
        );
        expect(compareResult).toEqual(
          expect.objectContaining({
            workflow: expect.objectContaining({
              id: "upgrade_salt_ui",
              confidence: expect.objectContaining({
                level: expect.any(String),
                reasons: expect.arrayContaining([expect.any(String)]),
              }),
              project_conventions_check: expect.objectContaining({
                contract: "project_conventions_v1",
                suggested_follow_up_tool: "get_salt_project_context",
                suggested_follow_up_cli: "salt-ds info --json",
              }),
            }),
            result: expect.objectContaining({
              ide_summary: expect.objectContaining({
                target: expect.any(String),
                required_changes: expect.any(Array),
                optional_cleanup: expect.any(Array),
                suggested_order: expect.arrayContaining([expect.any(String)]),
                verify: expect.arrayContaining([expect.any(String)]),
              }),
            }),
            artifacts: expect.objectContaining({
              rule_ids: ["upgrade-review-version-risks"],
            }),
          }),
        );
      },
    );
  }, 40000);

  it("surfaces cached repo policy overlays on workflow artifacts after project context is loaded", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await buildRegistry({
          sourceRoot: REPO_ROOT,
          outputDir: registryDir,
          timestamp: "2026-03-28T00:00:00Z",
        });
      },
      async (registryDir) => {
        const rootDir = await createTempDir("salt-mcp-create-policy-artifact");
        await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
        await fs.writeFile(
          path.join(rootDir, "package.json"),
          JSON.stringify(
            {
              name: "salt-mcp-policy-fixture",
              private: true,
              dependencies: {
                "@salt-ds/core": "^2.0.0",
              },
            },
            null,
            2,
          ),
        );
        await fs.writeFile(
          path.join(rootDir, ".salt", "team.json"),
          JSON.stringify(
            {
              contract: "project_conventions_v1",
              approved_wrappers: [
                {
                  name: "AppLink",
                  wraps: "Link",
                  reason: "Route links must use analytics and router helpers.",
                  import: {
                    from: "@/navigation/AppLink",
                    name: "AppLink",
                  },
                },
              ],
              theme_defaults: {
                provider: "SaltProviderNext",
                imports: [
                  "@salt-ds/theme/index.css",
                  "@salt-ds/theme/css/theme-next.css",
                ],
                props: [{ name: "accent", value: "teal" }],
                reason: "Repo defaults to the JPM Brand bootstrap.",
                docs: ["./docs/theme-policy.md"],
              },
              token_aliases: [
                {
                  salt_name: "--salt-content-primary-foreground",
                  prefer: "--brand-text-primary",
                  reason: "Use the brand text alias in app surfaces.",
                  docs: ["./docs/token-policy.md"],
                },
              ],
              token_family_policies: [
                {
                  family: "content",
                  mode: "prefer-local-aliases",
                  reason: "Local aliases should win for content tokens.",
                  docs: ["./docs/token-policy.md"],
                },
              ],
            },
            null,
            2,
          ),
        );

        const registry = await loadRegistry({ registryDir });
        const contextTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "get_salt_project_context",
        );
        const chooseTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "create_salt_ui",
        );
        const runtime = createToolExecutionRuntime();

        const contextResult = (await contextTool?.execute(
          registry,
          {
            root_dir: rootDir,
          },
          runtime,
        )) as { result: { context_id: string } };

        const chooseResult = await chooseTool?.execute(
          registry,
          {
            query: "navigate to another route",
            include_starter_code: true,
            context_id: contextResult.result.context_id,
          },
          runtime,
        );

        expect(chooseResult).toEqual(
          expect.objectContaining({
            artifacts: expect.objectContaining({
              starter_code: expect.arrayContaining([
                expect.objectContaining({
                  code: expect.stringContaining("AppLink"),
                }),
              ]),
              project_policy: expect.objectContaining({
                policyMode: "team",
                declared: true,
                approvedWrappers: ["AppLink"],
                themeDefaults: expect.objectContaining({
                  provider: "SaltProviderNext",
                  sourceUrls: ["./docs/theme-policy.md"],
                }),
                tokenAliases: expect.arrayContaining([
                  expect.objectContaining({
                    saltName: "--salt-content-primary-foreground",
                    prefer: "--brand-text-primary",
                    sourceUrls: ["./docs/token-policy.md"],
                  }),
                ]),
                tokenFamilyPolicies: expect.arrayContaining([
                  expect.objectContaining({
                    family: "content",
                    mode: "prefer-local-aliases",
                    sourceUrls: ["./docs/token-policy.md"],
                  }),
                ]),
                sourceUrls: expect.arrayContaining([
                  "./team.json",
                  "./docs/theme-policy.md",
                  "./docs/token-policy.md",
                ]),
              }),
              repo_refinement: expect.objectContaining({
                status: "refined_by_project_policy",
                canonical_name: "Link",
                final_name: "AppLink",
                source: "project_policy",
              }),
            }),
            result: expect.objectContaining({
              final_decision: expect.objectContaining({
                name: "AppLink",
                source: "project_policy",
              }),
            }),
          }),
        );
      },
    );
  }, 20000);

  it("keeps repo context isolated by explicit context_id across multiple repos", async () => {
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
        const contextTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "get_salt_project_context",
        );
        const chooseTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "create_salt_ui",
        );
        const runtime = createToolExecutionRuntime();

        const repoOne = await createTempDir("salt-mcp-context-one");
        const repoTwo = await createTempDir("salt-mcp-context-two");

        for (const [rootDir, wrapperName] of [
          [repoOne, "RepoOneLink"],
          [repoTwo, "RepoTwoLink"],
        ] as const) {
          await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
          await fs.writeFile(
            path.join(rootDir, "package.json"),
            JSON.stringify(
              {
                name: path.basename(rootDir),
                private: true,
                dependencies: {
                  "@salt-ds/core": "^2.0.0",
                },
              },
              null,
              2,
            ),
          );
          await fs.writeFile(
            path.join(rootDir, ".salt", "team.json"),
            JSON.stringify(
              {
                contract: "project_conventions_v1",
                approved_wrappers: [
                  {
                    name: wrapperName,
                    wraps: "Link",
                    reason: `${wrapperName} is required in this repo.`,
                    import: {
                      from: `@/${wrapperName}`,
                      name: wrapperName,
                    },
                  },
                ],
              },
              null,
              2,
            ),
          );
        }

        const contextOne = (await contextTool?.execute(
          registry,
          { root_dir: repoOne },
          runtime,
        )) as { result: { context_id: string } };
        const contextTwo = (await contextTool?.execute(
          registry,
          { root_dir: repoTwo },
          runtime,
        )) as { result: { context_id: string } };

        const resultOne = await chooseTool?.execute(
          registry,
          {
            query: "navigate to another route",
            context_id: contextOne.result.context_id,
          },
          runtime,
        );
        const resultTwo = await chooseTool?.execute(
          registry,
          {
            query: "navigate to another route",
            context_id: contextTwo.result.context_id,
          },
          runtime,
        );

        expect(resultOne).toEqual(
          expect.objectContaining({
            result: expect.objectContaining({
              final_decision: expect.objectContaining({
                name: "RepoOneLink",
              }),
            }),
          }),
        );
        expect(resultTwo).toEqual(
          expect.objectContaining({
            result: expect.objectContaining({
              final_decision: expect.objectContaining({
                name: "RepoTwoLink",
              }),
            }),
          }),
        );
      },
    );
  }, 30000);

  it("keeps the final decision canonical when repo wrapper policy is not actionable", async () => {
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
        const contextTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "get_salt_project_context",
        );
        const chooseTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "create_salt_ui",
        );
        const runtime = createToolExecutionRuntime();
        const rootDir = await createTempDir("salt-mcp-non-actionable-wrapper");

        await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
        await fs.writeFile(
          path.join(rootDir, "package.json"),
          JSON.stringify(
            {
              name: "non-actionable-wrapper",
              private: true,
              dependencies: {
                "@salt-ds/core": "^2.0.0",
              },
            },
            null,
            2,
          ),
        );
        await fs.writeFile(
          path.join(rootDir, ".salt", "team.json"),
          JSON.stringify(
            {
              contract: "project_conventions_v1",
              approved_wrappers: [
                {
                  name: "AppLink",
                  wraps: "Link",
                  reason: "Route links should use the repo wrapper.",
                  docs: ["./docs/router-policy.md"],
                },
              ],
            },
            null,
            2,
          ),
        );

        const contextResult = (await contextTool?.execute(
          registry,
          { root_dir: rootDir },
          runtime,
        )) as { result: { context_id: string } };
        const chooseResult = await chooseTool?.execute(
          registry,
          {
            query: "navigate to another route",
            include_starter_code: true,
            context_id: contextResult.result.context_id,
          },
          runtime,
        );

        expect(chooseResult).toEqual(
          expect.objectContaining({
            result: expect.objectContaining({
              final_decision: expect.objectContaining({
                name: "Link",
                source: "canonical_salt",
              }),
            }),
            artifacts: expect.objectContaining({
              starter_code: expect.arrayContaining([
                expect.objectContaining({
                  code: expect.not.stringContaining("AppLink"),
                }),
              ]),
              repo_refinement: expect.objectContaining({
                status: "canonical_only",
                canonical_name: "Link",
                final_name: "Link",
                source: "canonical_salt",
                reason: expect.stringContaining("no import metadata"),
              }),
            }),
          }),
        );
      },
    );
  }, 30000);

  it("bootstraps repo instructions and team policy by default through bootstrap_salt_repo", async () => {
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
        const bootstrapTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "bootstrap_salt_repo",
        );
        const runtime = createToolExecutionRuntime();
        const rootDir = await createTempDir("salt-mcp-bootstrap-repo");

        await fs.writeFile(
          path.join(rootDir, "package.json"),
          JSON.stringify(
            {
              name: "salt-mcp-bootstrap-repo",
              private: true,
              dependencies: {
                react: "^18.3.1",
              },
            },
            null,
            2,
          ),
        );

        const bootstrapResult = await bootstrapTool?.execute(
          registry,
          { root_dir: rootDir },
          runtime,
        );

        expect(bootstrapResult).toEqual(
          expect.objectContaining({
            workflow: {
              id: "bootstrap_salt_repo",
            },
            result: expect.objectContaining({
              repo_instructions: expect.objectContaining({
                action: "created",
                filename: "AGENTS.md",
              }),
            }),
          }),
        );

        const agents = await fs.readFile(
          path.join(rootDir, "AGENTS.md"),
          "utf8",
        );
        expect(agents).toContain("Do not inspect `node_modules`");
        expect(agents).toContain("run the repo `ui:verify` script");
        expect(agents).toContain("keep the first result canonical-only");

        await expect(
          fs.access(path.join(rootDir, ".github", "copilot-instructions.md")),
        ).rejects.toBeTruthy();
        await expect(
          fs.access(
            path.join(rootDir, ".github", "agents", "salt-ui.agent.md"),
          ),
        ).rejects.toBeTruthy();

        const packageJson = JSON.parse(
          await fs.readFile(path.join(rootDir, "package.json"), "utf8"),
        ) as { scripts?: Record<string, string> };
        expect(packageJson.scripts?.["ui:verify"]).toBeUndefined();
      },
    );
  }, 30000);

  it("scaffolds IDE files and ui:verify through bootstrap_salt_repo only when explicitly requested", async () => {
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
        const bootstrapTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "bootstrap_salt_repo",
        );
        const runtime = createToolExecutionRuntime();
        const rootDir = await createTempDir("salt-mcp-bootstrap-existing-salt");

        await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
        await fs.writeFile(
          path.join(rootDir, "package.json"),
          JSON.stringify(
            {
              name: "salt-mcp-bootstrap-existing-salt",
              private: true,
              dependencies: {
                "@salt-ds/core": "^2.0.0",
                "@salt-ds/theme": "^2.0.0",
                react: "^18.3.1",
              },
            },
            null,
            2,
          ),
        );

        const bootstrapResult = await bootstrapTool?.execute(
          registry,
          {
            root_dir: rootDir,
            host_adapters: ["vscode"],
            add_ui_verify: true,
          },
          runtime,
        );

        expect(bootstrapResult).toEqual(
          expect.objectContaining({
            result: expect.objectContaining({
              repo_instructions: expect.objectContaining({
                action: "created",
                filename: "AGENTS.md",
              }),
            }),
          }),
        );

        await expect(
          fs.access(path.join(rootDir, "AGENTS.md")),
        ).resolves.toBeUndefined();
        await expect(
          fs.access(path.join(rootDir, ".github", "copilot-instructions.md")),
        ).resolves.toBeUndefined();
        await expect(
          fs.access(
            path.join(rootDir, ".github", "agents", "salt-ui.agent.md"),
          ),
        ).resolves.toBeUndefined();

        const packageJson = JSON.parse(
          await fs.readFile(path.join(rootDir, "package.json"), "utf8"),
        ) as { scripts?: Record<string, string> };
        expect(packageJson.scripts?.["ui:verify"]).toBe("salt-ds review src");
      },
    );
  }, 30000);

  it("upgrades a legacy unmarked AGENTS bootstrap snippet through bootstrap_salt_repo", async () => {
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
        const bootstrapTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "bootstrap_salt_repo",
        );
        const runtime = createToolExecutionRuntime();
        const rootDir = await createTempDir("salt-mcp-bootstrap-legacy-agents");

        await fs.writeFile(
          path.join(rootDir, "package.json"),
          JSON.stringify(
            {
              name: "salt-mcp-bootstrap-legacy-agents",
              private: true,
              dependencies: {
                react: "^18.3.1",
              },
            },
            null,
            2,
          ),
        );
        await fs.writeFile(
          path.join(rootDir, "AGENTS.md"),
          [
            "Team-specific notes stay here.",
            "",
            "Use the Salt MCP for canonical Salt guidance.",
            "",
            "Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.",
            "",
            "Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.",
            "",
            "For Salt UI tasks, complete:",
            "",
            "- a selection step through Salt MCP or the Salt CLI fallback",
            "- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
            "- if the workflow output says stronger grounding is needed, follow the returned canonical Salt follow-up before editing",
            "",
            "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
            "",
            "If a Salt workflow result says project conventions matter:",
            "",
            "- keep repo-local policy in `.salt/team.json` when it exists",
            "- use `.salt/stack.json` only when the repo already declares layered upstream policy",
            "- use repo-aware Salt workflows so Salt applies the declared project conventions",
            "- keep the canonical Salt choice visible as provenance",
            "",
            "Default to `.salt/team.json` for simple repos. Add `.salt/stack.json` only when shared upstream layers or explicit merge ordering are real.",
            "",
          ].join("\n"),
          "utf8",
        );

        const bootstrapResult = await bootstrapTool?.execute(
          registry,
          { root_dir: rootDir },
          runtime,
        );

        expect(bootstrapResult).toEqual(
          expect.objectContaining({
            result: expect.objectContaining({
              repo_instructions: expect.objectContaining({
                action: "updated",
                filename: "AGENTS.md",
              }),
            }),
          }),
        );

        const agents = await fs.readFile(
          path.join(rootDir, "AGENTS.md"),
          "utf8",
        );
        expect(agents).toContain("Team-specific notes stay here.");
        expect(agents).toContain("<!-- salt-ds:repo-instructions:start -->");
        expect(agents).toContain("keep the first result canonical-only");
      },
    );
  }, 30000);
});
