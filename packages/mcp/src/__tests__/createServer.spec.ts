import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import Ajv from "ajv";
import { describe, expect, it } from "vitest";
import * as z from "zod/v4";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import { createSaltUi } from "../core/tools/createSaltUi.js";
import { createSaltMcpServer } from "../server/createServer.js";
import {
  buildSaltMcpInstructions,
  getSaltMcpRuntimeMetadata,
  SALT_MCP_CAPABILITY_MANIFEST_URI,
  SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
  SALT_MCP_CATALOG_MANIFEST_URI,
} from "../server/serverMetadata.js";
import {
  TOOL_DEFINITIONS,
  type ToolDefinition,
} from "../server/toolDefinitions.js";
import { withChooseWorkflowGuidance } from "../server/workflowOutputs.js";
import {
  copyV1CatalogArtifactsFromGenerated,
  REPO_ROOT,
  V1_EXCLUDED_CATALOG_ARTIFACT_FILES,
  withRegistryDir,
  writeBaseArtifacts,
} from "./registryTestUtils.js";

const V1_TOOL_ORDER = [
  "get_salt_project_context",
  "get_salt_reference",
  "review_salt_ui",
  "create_salt_ui",
  "migrate_to_salt",
] as const;

const V1_RESOURCE_NAMES = [
  SALT_MCP_CAPABILITY_MANIFEST_URI,
  SALT_MCP_CATALOG_MANIFEST_URI,
] as const;

const V1_RESOURCE_TEMPLATE_NAMES = ["salt_catalog_entity"] as const;

function objectSchemaKeys(definitionName: string): string[] {
  return Object.keys(getInputObjectSchema(definitionName).shape).sort();
}

function getToolDefinition(definitionName: string) {
  const definition = TOOL_DEFINITIONS.find(
    (toolDefinition) => toolDefinition.name === definitionName,
  );
  if (!definition) {
    throw new Error(`Expected ${definitionName} to be registered.`);
  }
  return definition;
}

function getInputObjectSchema(definitionName: string): z.ZodObject {
  const inputSchema = getToolDefinition(definitionName).inputSchema;
  const schema =
    inputSchema instanceof z.ZodType ? inputSchema : z.object(inputSchema);
  if (!(schema instanceof z.ZodObject)) {
    throw new Error(`Expected object input schema for ${definitionName}.`);
  }
  return schema;
}

function buildValidCreateOutputSchemaFixture() {
  const rerunArgs = {
    query: "profile page with tabs and avatar",
    resolved_entities: ["Tabs", "Avatar"],
  };
  return {
    contract: "salt_workflow_v1",
    workflow: "create",
    status: "partial",
    request: {
      entity: "profile page with tabs and avatar",
      resolved_entity: "Tabs",
      match_status: "broadened",
    },
    safety: {
      canonical_complete: false,
      exact_request_safe: false,
      blocking_reasons: ["required follow-through remains: Avatar"],
    },
    action: {
      kind: "retrieve_reference",
      tool: "get_salt_reference",
      args: { names: ["Avatar"] },
      rule_ids: [],
      post_action: {
        kind: "rerun_workflow",
        tool: "create_salt_ui",
        args: rerunArgs,
      },
    },
    guidance: {
      kind: "create",
      decision: {
        name: "Tabs",
        why: "Use Tabs with an Avatar follow-through.",
        solution_type: "component",
      },
      starter_guidance: {
        plan: ["Ground Avatar before implementing the profile page."],
        snippets: [],
      },
      review_targets: {
        components: ["Tabs", "Avatar"],
        patterns: [],
        composition_contract: null,
        source: "create_report",
      },
    },
    questions: [],
    evidence: {
      status: "partial",
      items: [],
      source_urls: [],
      missing: ["follow-through evidence for Avatar"],
      heuristic_fallback: false,
    },
    internal_limitations: {
      unsupported_claim_count: 0,
      unsupported_rule_kinds: [],
    },
    summary: "Ground Avatar before implementing.",
  };
}

describe("createSaltMcpServer", () => {
  it("exposes exactly the v1 public MCP tool contract", async () => {
    expect(TOOL_DEFINITIONS.map((definition) => definition.name)).toEqual([
      ...V1_TOOL_ORDER,
    ]);

    for (const definition of TOOL_DEFINITIONS) {
      expect(definition.annotations).toEqual(
        expect.objectContaining({
          readOnlyHint: true,
          destructiveHint: false,
        }),
      );
    }

    await withRegistryDir(
      async (registryDir) => {
        await writeBaseArtifacts(registryDir);
      },
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const registeredTools = Object.keys(
          (
            server as unknown as {
              _registeredTools: Record<string, unknown>;
            }
          )._registeredTools,
        );

        expect(registeredTools).toEqual([...V1_TOOL_ORDER]);
      },
    );
  });

  it("keeps v1 workflow schemas narrow and read-only", () => {
    expect(objectSchemaKeys("create_salt_ui")).toEqual([
      "a11y_required",
      "include_starter_code",
      "package",
      "prefer_stable",
      "query",
      "resolved_entities",
      "root_dir",
      "solution_type",
      "status",
    ]);
    expect(objectSchemaKeys("migrate_to_salt")).toEqual([
      "a11y_required",
      "code",
      "include_starter_code",
      "package",
      "prefer_stable",
      "query",
      "root_dir",
      "source_outline",
    ]);
    expect(objectSchemaKeys("review_salt_ui")).toEqual([
      "code",
      "expected_targets",
      "fidelity",
      "framework",
      "from_version",
      "max_issues",
      "package_version",
      "root_dir",
      "to_version",
    ]);
  });

  it("rejects invented live-evaluation arguments before workflow execution", () => {
    const toStrictInputSchema = (name: string) => {
      const inputSchema = getToolDefinition(name).inputSchema;
      return inputSchema instanceof z.ZodType
        ? inputSchema
        : z.object(inputSchema).strict();
    };
    const createSchema = toStrictInputSchema("create_salt_ui");
    const referenceSchema = toStrictInputSchema("get_salt_reference");

    expect(
      createSchema.safeParse({
        task: "Create a dashboard",
        target_file: "Dashboard.tsx",
      }).success,
    ).toBe(false);
    expect(
      createSchema.safeParse({
        target_type: "component",
        target_name: "Table",
      }).success,
    ).toBe(false);
    expect(
      createSchema.safeParse({
        query: "Create a dashboard with a transaction table",
        resolved_entities: ["Table"],
      }).success,
    ).toBe(true);

    expect(referenceSchema.safeParse({ names: ["Table"] }).success).toBe(true);
    expect(referenceSchema.safeParse({ names: ["   "] }).success).toBe(false);
    expect(
      referenceSchema.safeParse({
        names: ["Table"],
        query: "dashboard",
      }).success,
    ).toBe(false);
    expect(
      referenceSchema.safeParse({ names: ["Table", "Card", "Input", "Link"] })
        .success,
    ).toBe(false);
    expect(
      referenceSchema.safeParse({
        names: ["Table"],
        package: "@salt-ds/core",
      }).success,
    ).toBe(false);
    expect(
      referenceSchema.safeParse({ names: ["Table"], entity_type: "auto" })
        .success,
    ).toBe(false);
    expect(
      referenceSchema.safeParse({ names: ["Table"], include: ["tokens"] })
        .success,
    ).toBe(false);
    expect(referenceSchema.safeParse({}).success).toBe(false);
  });

  it("enforces strict inputs through the real MCP transport", async () => {
    await withRegistryDir(
      copyV1CatalogArtifactsFromGenerated,
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const client = new Client({
          name: "salt-mcp-contract-test",
          version: "1.0.0",
        });
        const [clientTransport, serverTransport] =
          InMemoryTransport.createLinkedPair();
        await server.connect(serverTransport);
        await client.connect(clientTransport);

        try {
          const listedTools = await client.listTools();
          expect(listedTools.tools.map((tool) => tool.name)).toEqual([
            ...V1_TOOL_ORDER,
          ]);
          expect(
            Buffer.byteLength(JSON.stringify(listedTools.tools), "utf8"),
          ).toBeLessThanOrEqual(43_500);
          for (const tool of listedTools.tools) {
            expect(tool.inputSchema.additionalProperties).toBe(false);
          }

          const schemasByName = new Map(
            listedTools.tools.map((tool) => [tool.name, tool.inputSchema]),
          );
          const ajv = new Ajv({ strict: false });
          const listedSchemaAccepts = (
            name: (typeof V1_TOOL_ORDER)[number],
            args: object,
          ) => {
            const schema = schemasByName.get(name);
            if (!schema) {
              throw new Error(`Missing listed schema for ${name}.`);
            }
            return ajv.compile(schema)(args);
          };

          expect(
            listedSchemaAccepts("get_salt_reference", { names: ["Table"] }),
          ).toBe(true);
          expect(listedSchemaAccepts("get_salt_reference", {})).toBe(false);
          expect(
            listedSchemaAccepts("get_salt_reference", { names: ["   "] }),
          ).toBe(false);
          expect(
            listedSchemaAccepts("get_salt_reference", {
              names: ["Table", "Card", "Input", "Link"],
            }),
          ).toBe(false);
          expect(
            listedSchemaAccepts("get_salt_reference", {
              names: ["Table"],
              query: "dashboard",
            }),
          ).toBe(false);
          expect(
            listedSchemaAccepts("get_salt_reference", {
              names: ["Table"],
              package: "@salt-ds/core",
            }),
          ).toBe(false);

          expect(
            listedSchemaAccepts("migrate_to_salt", {
              query: "Migrate this screen to Salt",
            }),
          ).toBe(true);
          expect(listedSchemaAccepts("migrate_to_salt", {})).toBe(false);
          expect(listedSchemaAccepts("migrate_to_salt", { query: "   " })).toBe(
            false,
          );
          expect(
            listedSchemaAccepts("migrate_to_salt", {
              query: "Migrate this screen to Salt",
              source_outline: {
                regions: ["header"],
                invented: ["not part of the contract"],
              },
            }),
          ).toBe(false);
          expect(
            listedSchemaAccepts("review_salt_ui", {
              code: "export function Example() { return null; }",
              expected_targets: {
                components: ["Button"],
                invented: true,
              },
            }),
          ).toBe(false);

          const validReference = await client.callTool({
            name: "get_salt_reference",
            arguments: { names: ["Table"] },
          });
          expect(validReference.isError).not.toBe(true);

          const validMigrate = await client.callTool({
            name: "migrate_to_salt",
            arguments: { query: "Migrate this screen to Salt" },
          });
          expect(validMigrate.isError).not.toBe(true);

          const invalidCreate = await client.callTool({
            name: "create_salt_ui",
            arguments: {
              query: "Button",
              task: "invented alias",
              target_file: "Invented.tsx",
            },
          });
          expect(invalidCreate.isError).toBe(true);
          expect(JSON.stringify(invalidCreate.content)).toMatch(
            /invalid|unrecognized/i,
          );

          const invalidReference = await client.callTool({
            name: "get_salt_reference",
            arguments: { name: "Table" },
          });
          expect(invalidReference.isError).toBe(true);
          expect(JSON.stringify(invalidReference.content)).toMatch(
            /invalid|required/i,
          );

          const invalidNestedReview = await client.callTool({
            name: "review_salt_ui",
            arguments: {
              code: "export function Example() { return null; }",
              expected_targets: {
                components: ["Button"],
                invented: true,
              },
            },
          });
          expect(invalidNestedReview.isError).toBe(true);
          expect(JSON.stringify(invalidNestedReview.content)).toMatch(
            /invalid|unrecognized/i,
          );
        } finally {
          await client.close();
          await server.close();
        }
      },
    );
  });

  it("carries create review targets through a real MCP create-to-review handoff", async () => {
    await withRegistryDir(
      copyV1CatalogArtifactsFromGenerated,
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const client = new Client({
          name: "salt-mcp-handoff-test",
          version: "1.0.0",
        });
        const [clientTransport, serverTransport] =
          InMemoryTransport.createLinkedPair();
        await server.connect(serverTransport);
        await client.connect(clientTransport);

        try {
          const createResponse = await client.callTool({
            name: "create_salt_ui",
            arguments: {
              query: "Button",
              resolved_entities: ["Button"],
            },
          });
          const createContent = createResponse.structuredContent as {
            contract?: string;
            workflow?: string;
            guidance?: {
              review_targets?: {
                components?: string[];
                patterns?: string[];
                composition_contract?: unknown;
                source?: string;
              };
            };
          };
          const reviewTargets = createContent.guidance?.review_targets;

          expect(createContent).toMatchObject({
            contract: "salt_workflow_v1",
            workflow: "create",
          });
          expect(reviewTargets).toMatchObject({
            components: expect.arrayContaining(["Button"]),
            source: "create_report",
          });

          const reviewResponse = await client.callTool({
            name: "review_salt_ui",
            arguments: {
              code: [
                'import { Button } from "@salt-ds/core";',
                "",
                "export function SaveAction() {",
                "  return <Button onClick={() => undefined}>Save</Button>;",
                "}",
              ].join("\n"),
              framework: "react",
              expected_targets: reviewTargets,
            },
          });
          const reviewContent = reviewResponse.structuredContent as {
            contract?: string;
            workflow?: string;
            status?: string;
            safety?: { blocking_reasons?: string[] };
            guidance?: {
              findings?: Array<{ rule?: string | null; title?: string }>;
            };
          };

          expect(reviewContent).toMatchObject({
            contract: "salt_workflow_v1",
            workflow: "review",
          });
          expect(reviewContent.safety?.blocking_reasons ?? []).toEqual([]);
          expect(
            reviewContent.guidance?.findings?.filter((finding) =>
              finding.rule?.startsWith("workflow-expected"),
            ) ?? [],
          ).toEqual([]);
          expect(
            (
              getToolDefinition("review_salt_ui").outputSchema as z.ZodType
            ).safeParse(reviewContent).success,
          ).toBe(true);
        } finally {
          await client.close();
          await server.close();
        }
      },
    );
  });

  it("uses declared approved wrapper imports when reviewing canonical component targets", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await copyV1CatalogArtifactsFromGenerated(registryDir);
        await fs.writeFile(
          path.join(registryDir, "package.json"),
          JSON.stringify({
            name: "policy-review-fixture",
            private: true,
            dependencies: { "@salt-ds/core": "2.0.0" },
          }),
          "utf8",
        );
        const policyDir = path.join(registryDir, ".salt");
        await fs.mkdir(policyDir, { recursive: true });
        await fs.writeFile(
          path.join(policyDir, "team.json"),
          JSON.stringify(
            {
              contract: "project_conventions_v1",
              version: "1.0.0",
              approved_wrappers: [
                {
                  name: "AppButton",
                  wraps: "Button",
                  reason: "Adds approved product defaults.",
                  import: {
                    from: "@/components/AppButton",
                    name: "AppButton",
                  },
                },
              ],
            },
            null,
            2,
          ),
          "utf8",
        );
        await fs.mkdir(path.join(registryDir, "src", "components"), {
          recursive: true,
        });
        await fs.writeFile(
          path.join(registryDir, "tsconfig.json"),
          JSON.stringify({
            compilerOptions: {
              paths: {
                "@/*": ["./src/*"],
              },
            },
          }),
          "utf8",
        );
        await fs.writeFile(
          path.join(registryDir, "src", "components", "AppButton.tsx"),
          "export function AppButton() { return null; }\n",
          "utf8",
        );
      },
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const client = new Client({
          name: "salt-mcp-policy-review-test",
          version: "1.0.0",
        });
        const [clientTransport, serverTransport] =
          InMemoryTransport.createLinkedPair();
        await server.connect(serverTransport);
        await client.connect(clientTransport);

        try {
          const contextResponse = await client.callTool({
            name: "get_salt_project_context",
            arguments: {
              root_dir: registryDir,
              include_policy_diagnostics: true,
            },
          });
          expect(contextResponse.structuredContent).toMatchObject({
            result: {
              policy: {
                import_targets: {
                  status: "ready",
                  declared_count: 1,
                  resolved_count: 1,
                  blocking_count: 0,
                },
              },
            },
            artifacts: {
              summary: {
                context_health: {
                  repo_specific_workflows_ready: true,
                },
              },
            },
          });
          expect(
            (
              getToolDefinition("get_salt_project_context")
                .outputSchema as z.ZodType
            ).safeParse(contextResponse.structuredContent).success,
          ).toBe(true);

          const reviewResponse = await client.callTool({
            name: "review_salt_ui",
            arguments: {
              code: [
                'import { AppButton } from "@/components/AppButton";',
                "",
                "export function SaveAction() {",
                "  return <AppButton>Save</AppButton>;",
                "}",
              ].join("\n"),
              framework: "react",
              expected_targets: {
                components: ["Button"],
                source: "create_report",
              },
              root_dir: registryDir,
            },
          });
          const reviewContent = reviewResponse.structuredContent as {
            guidance?: {
              findings?: Array<{ rule?: string | null }>;
            };
          };

          expect(reviewContent.guidance?.findings ?? []).not.toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                rule: "workflow-expected-component-not-imported",
              }),
            ]),
          );

          const canonicalInsteadOfWrapper = await client.callTool({
            name: "review_salt_ui",
            arguments: {
              code: [
                'import { Button } from "@salt-ds/core";',
                "",
                "export function SaveAction() {",
                "  return <Button>Save</Button>;",
                "}",
              ].join("\n"),
              framework: "react",
              root_dir: registryDir,
            },
          });
          expect(canonicalInsteadOfWrapper.structuredContent).toMatchObject({
            status: expect.stringMatching(/^(partial|blocked)$/),
            guidance: {
              fixes: expect.arrayContaining([
                expect.objectContaining({
                  recommendation: expect.stringContaining("AppButton"),
                }),
              ]),
            },
          });

          const wrongRootReview = await client.callTool({
            name: "review_salt_ui",
            arguments: {
              code: [
                'import { Button } from "@salt-ds/core";',
                "export function SaveAction() {",
                "  return <Button>Save</Button>;",
                "}",
              ].join("\n"),
              root_dir: path.join(registryDir, "does-not-exist"),
            },
          });
          expect(wrongRootReview.structuredContent).toMatchObject({
            status: "blocked",
            safety: {
              exact_request_safe: false,
              blocking_reasons: expect.arrayContaining([
                "required project context is missing",
              ]),
            },
            action: {
              kind: "fix_context",
              tool: "get_salt_project_context",
              mode: "stop_and_fix_context",
              args: { root_dir: registryDir.replaceAll("\\", "/") },
              post_action: null,
            },
          });
          expect(
            JSON.stringify(wrongRootReview.structuredContent),
          ).not.toContain("AppButton");
          expect(
            (
              getToolDefinition("review_salt_ui").outputSchema as z.ZodType
            ).safeParse(wrongRootReview.structuredContent).success,
          ).toBe(true);

          const wrongRootCreate = await client.callTool({
            name: "create_salt_ui",
            arguments: {
              query: "Button",
              root_dir: path.join(registryDir, "does-not-exist"),
            },
          });
          expect(wrongRootCreate.structuredContent).toMatchObject({
            status: "blocked",
            safety: {
              exact_request_safe: false,
              blocking_reasons: expect.arrayContaining([
                "required project context is missing",
              ]),
            },
            action: {
              kind: "fix_context",
              tool: "get_salt_project_context",
              mode: "stop_and_fix_context",
              args: { root_dir: registryDir.replaceAll("\\", "/") },
              post_action: null,
            },
          });
          expect(
            (
              getToolDefinition("create_salt_ui").outputSchema as z.ZodType
            ).safeParse(wrongRootCreate.structuredContent).success,
          ).toBe(true);
        } finally {
          await client.close();
          await server.close();
        }
      },
    );
  });

  it("does not ask for a Salt provider when repo policy declares one", async () => {
    await withRegistryDir(
      copyV1CatalogArtifactsFromGenerated,
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const client = new Client({
          name: "salt-mcp-theme-policy-test",
          version: "1.0.0",
        });
        const [clientTransport, serverTransport] =
          InMemoryTransport.createLinkedPair();
        await server.connect(serverTransport);
        await client.connect(clientTransport);

        try {
          const response = await client.callTool({
            name: "create_salt_ui",
            arguments: {
              query:
                "Create a branded application theme with rounded corners and a teal accent",
              root_dir: path.join(
                REPO_ROOT,
                "workflow-examples",
                "consumer-repo",
              ),
            },
          });
          const content = response.structuredContent as {
            action?: { question?: string };
            questions?: string[];
          };
          const serializedQuestions = [
            content.action?.question,
            ...(content.questions ?? []),
          ]
            .filter(Boolean)
            .join(" ");

          expect(serializedQuestions).not.toContain("SaltProviderNext");
          expect(serializedQuestions).not.toContain(
            "pick the stable SaltProvider",
          );
          expect(
            (
              getToolDefinition("create_salt_ui").outputSchema as z.ZodType
            ).safeParse(response.structuredContent).success,
          ).toBe(true);
        } finally {
          await client.close();
          await server.close();
        }
      },
    );
  });

  it("does not apply project policy whose declared runtime or theme imports are missing", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await copyV1CatalogArtifactsFromGenerated(registryDir);
        await fs.mkdir(path.join(registryDir, ".salt"), { recursive: true });
        await fs.mkdir(path.join(registryDir, "src", "theme"), {
          recursive: true,
        });
        await fs.writeFile(
          path.join(registryDir, "tsconfig.json"),
          JSON.stringify({
            compilerOptions: {
              paths: {
                "@/*": ["./src/*"],
              },
            },
          }),
          "utf8",
        );
        await fs.writeFile(
          path.join(registryDir, ".salt", "team.json"),
          JSON.stringify({
            contract: "project_conventions_v1",
            version: "1.0.0",
            approved_wrappers: [
              {
                name: "AppButton",
                wraps: "Button",
                reason: "Adds approved product defaults.",
                import: {
                  from: "@/components/AppButton",
                  name: "AppButton",
                },
              },
            ],
            theme_defaults: {
              provider: "BrandProvider",
              provider_import: {
                from: "@/theme/BrandProvider",
                name: "BrandProvider",
              },
              imports: ["@/theme/missing-brand.css"],
              reason: "Use the repo brand provider.",
            },
          }),
          "utf8",
        );
        await fs.writeFile(
          path.join(registryDir, "src", "theme", "BrandProvider.tsx"),
          "export function BrandProvider({ children }: { children: unknown }) { return children; }\n",
          "utf8",
        );
      },
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const client = new Client({
          name: "salt-mcp-invalid-policy-import-test",
          version: "1.0.0",
        });
        const [clientTransport, serverTransport] =
          InMemoryTransport.createLinkedPair();
        await server.connect(serverTransport);
        await client.connect(clientTransport);

        try {
          const contextResponse = await client.callTool({
            name: "get_salt_project_context",
            arguments: {
              root_dir: registryDir,
              include_policy_diagnostics: true,
            },
          });
          expect(contextResponse.structuredContent).toMatchObject({
            result: {
              policy: {
                import_targets: {
                  status: "blocked",
                  declared_count: 3,
                  resolved_count: 1,
                  blocking_count: 2,
                  targets: expect.arrayContaining([
                    expect.objectContaining({
                      owner: "AppButton",
                      status: "missing_module",
                    }),
                    expect.objectContaining({
                      kind: "theme_import",
                      owner: "BrandProvider",
                      from: "@/theme/missing-brand.css",
                      name: null,
                      status: "missing_module",
                    }),
                  ]),
                },
              },
            },
            artifacts: {
              summary: {
                context_health: {
                  repo_specific_workflows_ready: false,
                },
              },
              notes: expect.arrayContaining([
                expect.stringContaining(
                  "no supported repo-local module exists",
                ),
              ]),
            },
          });

          const reviewResponse = await client.callTool({
            name: "review_salt_ui",
            arguments: {
              code: [
                'import { AppButton } from "@/components/AppButton";',
                'import { SaltProvider } from "@salt-ds/core";',
                "",
                "export function SaveAction() {",
                "  return <SaltProvider><AppButton>Save</AppButton></SaltProvider>;",
                "}",
              ].join("\n"),
              framework: "react",
              expected_targets: {
                components: ["Button"],
                source: "create_report",
              },
              root_dir: registryDir,
            },
          });
          const reviewContent = reviewResponse.structuredContent as {
            guidance?: {
              findings?: Array<{ rule?: string | null }>;
            };
          };

          expect(reviewContent.guidance?.findings ?? []).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                rule: "workflow-expected-component-not-imported",
              }),
            ]),
          );
          expect(reviewContent.guidance?.findings ?? []).not.toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                rule: "review-project-policy-theme-default",
              }),
            ]),
          );
        } finally {
          await client.close();
          await server.close();
        }
      },
    );
  });

  it("keeps repeated workflow output schemas within a compact tools/list budget", () => {
    const workflowNames = [
      "create_salt_ui",
      "review_salt_ui",
      "migrate_to_salt",
    ] as const;
    const toJsonSchema = (schema: ToolDefinition["inputSchema"]) =>
      z.toJSONSchema(schema instanceof z.ZodType ? schema : z.object(schema));
    const schemaBytes = workflowNames.map((name) => {
      const outputSchema = getToolDefinition(name).outputSchema;
      if (!(outputSchema instanceof z.ZodType)) {
        throw new Error(`Expected object output schema for ${name}.`);
      }
      return Buffer.byteLength(
        JSON.stringify(z.toJSONSchema(outputSchema)),
        "utf8",
      );
    });

    const advertisedBytes = Buffer.byteLength(
      JSON.stringify(
        TOOL_DEFINITIONS.map((definition) => ({
          name: definition.name,
          description: definition.description,
          inputSchema: toJsonSchema(definition.inputSchema),
          outputSchema:
            definition.outputSchema instanceof z.ZodType
              ? z.toJSONSchema(definition.outputSchema)
              : undefined,
          annotations: definition.annotations,
        })),
      ),
      "utf8",
    );

    // The retired duplicate-action contract advertised roughly 106 KB. Keep
    // the strict five-tool contract compact without coupling the gate to an
    // exact prose byte snapshot; the transport test measures actual tools/list.
    expect(Math.max(...schemaBytes)).toBeLessThanOrEqual(13_000);
    expect(
      schemaBytes.reduce((total, bytes) => total + bytes, 0),
    ).toBeLessThanOrEqual(32_000);
    expect(advertisedBytes).toBeLessThanOrEqual(43_500);
  });

  it("uses one exact entity lookup shape for details and examples", () => {
    const referenceSchema = getInputObjectSchema("get_salt_reference");
    const entityTypeSchema = referenceSchema.shape.entity_type as z.ZodType;
    expect(entityTypeSchema.safeParse("component").success).toBe(true);
    expect(entityTypeSchema.safeParse("icon").success).toBe(true);
    expect(entityTypeSchema.safeParse("country_symbol").success).toBe(true);
    expect(entityTypeSchema.safeParse("auto").success).toBe(false);

    expect(objectSchemaKeys("get_salt_reference")).toEqual([
      "entity_type",
      "include",
      "include_starter_code",
      "names",
    ]);

    const createTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "create_salt_ui",
    );
    const createSchema = createTool?.outputSchema as z.ZodType;
    expect(
      createSchema.safeParse(buildValidCreateOutputSchemaFixture()).success,
    ).toBe(true);

    const typedReferenceFixture = buildValidCreateOutputSchemaFixture() as {
      action: { args: { entity_type?: string } };
    };
    typedReferenceFixture.action.args.entity_type = "pattern";
    expect(createSchema.safeParse(typedReferenceFixture).success).toBe(true);

    typedReferenceFixture.action.args.entity_type = "auto";
    expect(createSchema.safeParse(typedReferenceFixture).success).toBe(false);
  });

  it("bounds reference packets to three exact targets", async () => {
    const registry = await loadRegistry();
    const referenceTool = getToolDefinition("get_salt_reference");
    const referenceSchema = getInputObjectSchema("get_salt_reference");

    expect(
      referenceSchema.safeParse({
        names: ["Button", "Card", "Input", "Link"],
        include: ["examples", "props"],
      }).success,
    ).toBe(false);

    const bounded = (await referenceTool.execute(registry, {
      names: ["Mega menu", "File upload", "Vertical navigation"],
      entity_type: "component",
      include: ["examples", "props", "accessibility", "deprecations"],
      include_starter_code: true,
    })) as {
      results?: Array<{
        result?: {
          entity?: {
            examples?: Array<{ code?: string }>;
          };
        };
      }>;
    };
    const examples = (bounded.results ?? []).flatMap(
      (row) => row.result?.entity?.examples ?? [],
    );
    const exampleCodes = examples
      .map((example) => example.code)
      .filter((code): code is string => typeof code === "string");

    for (const row of bounded.results ?? []) {
      expect(row.result?.entity?.examples?.length ?? 0).toBeLessThanOrEqual(1);
    }
    expect(new Set(exampleCodes).size).toBe(exampleCodes.length);
    expect(Buffer.byteLength(JSON.stringify(bounded), "utf8")).toBeLessThan(
      80_000,
    );
  });

  it("rejects branch-invalid workflow actions and post-action pairings", () => {
    const createSchema = getToolDefinition("create_salt_ui")
      .outputSchema as z.ZodType;
    const valid = buildValidCreateOutputSchemaFixture();
    const rerun = valid.action.post_action;
    const invalidActions = [
      {
        kind: "ask_user",
        rule_ids: [],
        post_action: null,
      },
      {
        kind: "ask_user",
        question: "Which provider should the repo use?",
        rule_ids: [],
        post_action: rerun,
      },
      {
        kind: "complete",
        rule_ids: [],
        post_action: null,
      },
      {
        kind: "retrieve_reference",
        tool: "get_salt_reference",
        args: { names: ["Avatar"] },
        rule_ids: [],
        post_action: null,
      },
      {
        ...valid.action,
        tool: "migrate_to_salt",
      },
    ];

    for (const action of invalidActions) {
      expect(
        createSchema.safeParse({
          ...valid,
          action,
        }).success,
      ).toBe(false);
    }
  });

  it("stops for user input when invalid starter evidence has no safe continuation", async () => {
    await withRegistryDir(
      copyV1CatalogArtifactsFromGenerated,
      async (registryDir) => {
        const registry = await loadRegistry({ registryDir });
        const result = createSaltUi(registry, {
          query: "Button",
          include_starter_code: true,
        });
        result.starter_code = [
          {
            label: "Invalid Button starter",
            language: "tsx",
            code: [
              'import { Button } from "@salt-ds/core";',
              "export function Demo() {",
              '  return <Button style={{ color: "var(--salt-not-a-real-token)" }}>Save</Button>;',
              "}",
            ].join("\n"),
            source_urls: result.starter_code?.flatMap(
              (snippet) => snippet.source_urls ?? [],
            ),
          },
        ];

        const output = withChooseWorkflowGuidance(registry, result, {
          query: "Button",
          context_checked: true,
        });

        expect(output.action).toMatchObject({
          kind: "ask_user",
          question: expect.any(String),
          post_action: null,
        });
        expect(
          (
            getToolDefinition("create_salt_ui").outputSchema as z.ZodType
          ).safeParse(output).success,
        ).toBe(true);
      },
    );
  });

  it("runs public v1 calls against the slim catalog without excluded artifacts", async () => {
    await withRegistryDir(
      copyV1CatalogArtifactsFromGenerated,
      async (registryDir) => {
        for (const fileName of V1_EXCLUDED_CATALOG_ARTIFACT_FILES) {
          await expect(
            fs.access(path.join(registryDir, fileName)),
          ).rejects.toMatchObject({
            code: "ENOENT",
          });
        }

        const registry = await loadRegistry({ registryDir });
        const callPublicTool = (name: string, args: object) =>
          getToolDefinition(name).execute(registry, args);

        const entityCases = [
          { entity_type: "component", name: "Button" },
          { entity_type: "pattern", name: "Search" },
          { entity_type: "foundation", name: "Density" },
          { entity_type: "page", name: "Components" },
          { entity_type: "guide", name: "Developing with Salt" },
          { entity_type: "package", name: "@salt-ds/core" },
          { entity_type: "icon", name: "WorkflowIcon" },
          { entity_type: "country_symbol", name: "US" },
          { entity_type: "token", name: "--salt-accent-background" },
        ] as const;

        for (const { name, ...entityFilters } of entityCases) {
          const result = (await callPublicTool("get_salt_reference", {
            ...entityFilters,
            names: [name],
          })) as {
            decision?: { status?: string };
            found_count?: number;
            registry_context?: {
              source?: string;
              registry_version?: string;
              registry_generated_at?: string;
              note?: string;
            };
          };

          expect(result.decision?.status).toBe("results");
          expect(result.found_count).toBeGreaterThanOrEqual(1);
          expect(result.registry_context).toEqual({
            source: "bundled_package",
            registry_version: registry.version,
            registry_generated_at: registry.generated_at,
            note: expect.stringContaining(
              "not directly from the consumer repo",
            ),
          });
        }

        const missingAuto = (await callPublicTool("get_salt_reference", {
          names: ["Definitely Missing Salt Thing"],
        })) as { decision?: { status?: string }; found_count?: number };
        expect(missingAuto.decision?.status).toBe("not_found");
        expect(missingAuto.found_count).toBe(0);

        const overviewAuto = (await callPublicTool("get_salt_reference", {
          names: ["Overview"],
        })) as {
          decision?: { status?: string };
          results?: Array<{
            result?: { entity_type?: string; entity?: { id?: string } };
          }>;
        };
        expect(overviewAuto.decision?.status).toBe("results");
        expect(overviewAuto.results?.[0]?.result).toMatchObject({
          entity_type: "page",
          entity: { id: "page.salt-components-layouts-index" },
        });

        for (const target of [
          { entity_type: "component", name: "Button" },
          { entity_type: "pattern", name: "Search" },
        ] as const) {
          const result = (await callPublicTool("get_salt_reference", {
            names: [target.name],
            entity_type: target.entity_type,
            include: ["examples"],
            include_starter_code: true,
          })) as {
            results?: Array<{
              result?: {
                entity?: { examples?: unknown[]; starter_code?: unknown[] };
              };
            }>;
          };
          const entity = result.results?.[0]?.result?.entity;
          expect(
            (entity?.starter_code?.length ?? 0) > 0 ||
              (entity?.examples?.length ?? 0) > 0,
          ).toBeTruthy();
        }

        const context = (await callPublicTool("get_salt_project_context", {
          root_dir: REPO_ROOT,
        })) as {
          workflow?: { id?: string };
          result?: Record<string, unknown>;
          artifacts?: {
            summary?: { retry_with?: Record<string, unknown> };
          };
        };
        expect(context.workflow?.id).toBe("get_salt_project_context");
        expect(context.result).not.toHaveProperty("context_id");
        expect(context.artifacts?.summary?.retry_with).not.toHaveProperty(
          "context_id",
        );

        const createResult = (await callPublicTool("create_salt_ui", {
          query: "search toolbar with filter action and settings menu",
          include_starter_code: true,
        })) as {
          contract?: string;
          workflow?: string;
          evidence?: Record<string, unknown>;
        };
        expect(createResult).toEqual(
          expect.objectContaining({
            contract: "salt_workflow_v1",
            workflow: "create",
          }),
        );
        expect(
          (
            getToolDefinition("create_salt_ui").outputSchema as z.ZodType
          ).safeParse(createResult).success,
        ).toBe(true);
        expect(
          (
            getToolDefinition("create_salt_ui").outputSchema as z.ZodType
          ).safeParse({
            ...createResult,
            guidance: {
              kind: "create",
              decision: {
                name: "Search",
                why: "Use the canonical Salt search direction.",
                solution_type: "pattern",
              },
              starter_guidance: {
                plan: [],
                snippets: [{}],
              },
            },
          }).success,
        ).toBe(false);
        expect(
          (
            getToolDefinition("create_salt_ui").outputSchema as z.ZodType
          ).safeParse({
            ...createResult,
            evidence: {
              ...createResult.evidence,
              undeclared_protocol_field: true,
            },
          }).success,
        ).toBe(false);

        const reviewResult = (await callPublicTool("review_salt_ui", {
          code: [
            'import { Button } from "@salt-ds/core";',
            'import { SearchThingIcon } from "@salt-ds/icons";',
            "",
            "export function Demo() {",
            '  return <Button href="/next"><SearchThingIcon aria-hidden /> Go</Button>;',
            "}",
          ].join("\n"),
          framework: "react",
          package_version: "2.0.0",
        })) as { contract?: string; workflow?: string };
        expect(reviewResult).toEqual(
          expect.objectContaining({
            contract: "salt_workflow_v1",
            workflow: "review",
          }),
        );
        expect(
          (
            getToolDefinition("review_salt_ui").outputSchema as z.ZodType
          ).safeParse(reviewResult).success,
        ).toBe(true);
        expect(
          (
            getToolDefinition("review_salt_ui").outputSchema as z.ZodType
          ).safeParse({
            ...reviewResult,
            guidance: {
              kind: "review",
              findings: [{}],
              fixes: [{}],
            },
          }).success,
        ).toBe(false);

        const migrateResult = (await callPublicTool("migrate_to_salt", {
          query:
            "Convert a non-Salt toolbar with a search icon, filter icon, settings menu, loading state, and error message into Salt.",
        })) as { contract?: string; workflow?: string };
        expect(migrateResult).toEqual(
          expect.objectContaining({
            contract: "salt_workflow_v1",
            workflow: "migrate",
          }),
        );
        expect(
          (
            getToolDefinition("migrate_to_salt").outputSchema as z.ZodType
          ).safeParse(migrateResult).success,
        ).toBe(true);
        const migrateGuidance = (
          migrateResult as unknown as {
            guidance: Record<string, unknown>;
          }
        ).guidance;
        expect(
          (
            getToolDefinition("migrate_to_salt").outputSchema as z.ZodType
          ).safeParse({
            ...migrateResult,
            guidance: {
              ...migrateGuidance,
              translations: [{}],
            },
          }).success,
        ).toBe(false);

        const server = await createSaltMcpServer({ registryDir });
        const registrations = server as unknown as {
          _registeredResources: Record<
            string,
            {
              readCallback: (
                uri: URL,
                extra: unknown,
              ) => Promise<{ contents: Array<{ text?: string }> }>;
            }
          >;
          _registeredResourceTemplates: Record<
            string,
            {
              readCallback: (
                uri: URL,
                variables: Record<string, string>,
                extra: unknown,
              ) => Promise<{ contents: Array<{ text?: string }> }>;
            }
          >;
        };

        await expect(
          registrations._registeredResources[
            SALT_MCP_CAPABILITY_MANIFEST_URI
          ].readCallback(new URL(SALT_MCP_CAPABILITY_MANIFEST_URI), {}),
        ).resolves.toEqual(
          expect.objectContaining({ contents: expect.any(Array) }),
        );
        await expect(
          registrations._registeredResources[
            SALT_MCP_CATALOG_MANIFEST_URI
          ].readCallback(new URL(SALT_MCP_CATALOG_MANIFEST_URI), {}),
        ).resolves.toEqual(
          expect.objectContaining({ contents: expect.any(Array) }),
        );
        await expect(
          registrations._registeredResourceTemplates.salt_catalog_entity.readCallback(
            new URL("salt://catalog/entity/Button"),
            { name: "Button" },
            {},
          ),
        ).resolves.toEqual(
          expect.objectContaining({ contents: expect.any(Array) }),
        );
      },
    );
  }, 20_000);

  it("registers only the v1 capability and catalog resource surface", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await writeBaseArtifacts(registryDir);
      },
      async (registryDir) => {
        const server = await createSaltMcpServer({ registryDir });
        const registrations = server as unknown as {
          _registeredResources: Record<
            string,
            {
              readCallback: (
                uri: URL,
                extra: unknown,
              ) => Promise<{
                contents: Array<{ text?: string }>;
              }>;
            }
          >;
          _registeredResourceTemplates: Record<
            string,
            {
              readCallback: (
                uri: URL,
                variables: Record<string, string>,
                extra: unknown,
              ) => Promise<{
                contents: Array<{ text?: string }>;
              }>;
            }
          >;
        };

        expect(Object.keys(registrations._registeredResources).sort()).toEqual([
          ...V1_RESOURCE_NAMES,
        ]);
        expect(
          Object.keys(registrations._registeredResourceTemplates).sort(),
        ).toEqual([...V1_RESOURCE_TEMPLATE_NAMES]);

        const manifestResult = await registrations._registeredResources[
          SALT_MCP_CAPABILITY_MANIFEST_URI
        ].readCallback(new URL(SALT_MCP_CAPABILITY_MANIFEST_URI), {});
        const capabilityManifest = JSON.parse(
          manifestResult.contents[0]?.text ?? "null",
        ) as {
          public_surface?: { default_surface_ids?: string[] };
          support_tools?: { tool_ids?: string[]; default_exposed?: boolean };
          capabilities?: { repo_bootstrap?: boolean };
          resources?: Record<string, string>;
        };

        expect(capabilityManifest.public_surface?.default_surface_ids).toEqual([
          ...V1_TOOL_ORDER,
        ]);
        expect(capabilityManifest.support_tools).toEqual(
          expect.objectContaining({
            default_exposed: true,
            tool_ids: ["get_salt_reference"],
          }),
        );
        expect(capabilityManifest.capabilities?.repo_bootstrap).toBe(false);
        expect(capabilityManifest.resources).toEqual({
          capability_manifest_uri: SALT_MCP_CAPABILITY_MANIFEST_URI,
          catalog_manifest_uri: SALT_MCP_CATALOG_MANIFEST_URI,
          catalog_entity_template_uri: SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
        });
        expect(
          Object.values(capabilityManifest.resources ?? {}).filter(Boolean),
        ).toEqual([
          SALT_MCP_CAPABILITY_MANIFEST_URI,
          SALT_MCP_CATALOG_MANIFEST_URI,
          SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
        ]);

        const catalogManifestResult = await registrations._registeredResources[
          SALT_MCP_CATALOG_MANIFEST_URI
        ].readCallback(new URL(SALT_MCP_CATALOG_MANIFEST_URI), {});
        const catalogManifest = JSON.parse(
          catalogManifestResult.contents[0]?.text ?? "null",
        ) as Record<string, unknown>;

        expect(catalogManifest).toEqual(
          expect.objectContaining({
            contract_version: "salt_create_catalog_v1",
            resources: {
              manifest_uri: SALT_MCP_CATALOG_MANIFEST_URI,
              entity_template_uri: SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
            },
          }),
        );
      },
    );
  });

  it("keeps server metadata and instructions aligned to the v1 story", () => {
    const metadata = getSaltMcpRuntimeMetadata({
      version: "test",
      generated_at: "2026-04-01T00:00:00Z",
    } as Parameters<typeof getSaltMcpRuntimeMetadata>[0]);
    const instructions = buildSaltMcpInstructions({
      version: "test",
      generated_at: "2026-04-01T00:00:00Z",
    } as Parameters<typeof buildSaltMcpInstructions>[0]);

    expect(
      metadata.capability_manifest.public_surface.default_surface_ids,
    ).toEqual([...V1_TOOL_ORDER]);
    expect(instructions).toContain("get_salt_reference");
    expect(instructions).toContain(
      "apply_fixes action identifies grounded review fixes but does not authorize file mutation",
    );
    expect(instructions).toContain(
      "obtain host or user authorization before applying fixes",
    );
  });
});
