import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as z from "zod/v4";
import { loadRegistry } from "../registry/loadRegistry.js";
import { createSaltMcpServer } from "../server/createServer.js";
import {
  buildSaltMcpInstructions,
  getSaltMcpRuntimeMetadata,
  SALT_MCP_CAPABILITY_MANIFEST_URI,
  SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
  SALT_MCP_CATALOG_MANIFEST_URI,
} from "../server/serverMetadata.js";
import {
  createToolExecutionRuntime,
  TOOL_DEFINITIONS,
} from "../server/toolDefinitions.js";
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

const V1_RESOURCE_TEMPLATE_NAMES = [
  "salt_catalog_entity",
] as const;

const REMOVED_PUBLIC_SURFACES = [
  "bootstrap_salt_repo",
  "upgrade_salt_ui",
  "discover_salt",
  "get_salt_entities",
  "get_salt_examples",
  "persist_salt_artifact",
  "salt://context/",
  "salt://setup/",
  "salt://review/",
] as const;

function objectSchemaKeys(definitionName: string): string[] {
  const definition = TOOL_DEFINITIONS.find(
    (toolDefinition) => toolDefinition.name === definitionName,
  );
  if (!definition || definition.inputSchema instanceof z.ZodType) {
    throw new Error(`Expected field-map input schema for ${definitionName}.`);
  }
  return Object.keys(definition.inputSchema).sort();
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
      "context_id",
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
      "context_id",
      "include_starter_code",
      "package",
      "prefer_stable",
      "query",
      "root_dir",
      "source_outline",
    ]);
    expect(objectSchemaKeys("review_salt_ui")).toEqual([
      "code",
      "context_id",
      "expected_targets",
      "framework",
      "from_version",
      "max_issues",
      "package_version",
      "root_dir",
      "to_version",
    ]);
  });

  it("merges public entity and example lookup into get_salt_reference", () => {
    const referenceTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "get_salt_reference",
    );
    expect(referenceTool).toBeDefined();
    if (!referenceTool || referenceTool.inputSchema instanceof z.ZodType) {
      throw new Error("Expected get_salt_reference to use a field-map schema.");
    }
    const entityTypeSchema = referenceTool.inputSchema.entity_type as z.ZodType;
    expect(entityTypeSchema.safeParse("component").success).toBe(true);
    expect(entityTypeSchema.safeParse("icon").success).toBe(false);
    expect(entityTypeSchema.safeParse("country_symbol").success).toBe(false);

    expect(objectSchemaKeys("get_salt_reference")).toEqual([
      "complexity",
      "entity_type",
      "include",
      "include_code",
      "include_deprecated",
      "include_related",
      "include_starter_code",
      "kind",
      "max_results",
      "name",
      "names",
      "package",
      "query",
      "status",
      "target_name",
      "target_type",
    ]);

    const createTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "create_salt_ui",
    );
    const createSchema = createTool?.outputSchema as z.ZodType;
    expect(
      createSchema.safeParse({
        contract: "salt_workflow_v1",
        workflow: "create",
        transport: "mcp",
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
          kind: "retrieve_entity",
          tool: "get_salt_reference",
          args: { kind: "entity", names: ["Avatar"] },
          rule_ids: [],
          post_action: null,
        },
        next_required_action: {
          kind: "retrieve_entity",
          tool: "get_salt_reference",
          args: { kind: "entity", names: ["Avatar"] },
        },
        allowed_next_actions: ["retrieve_entity"],
        recipe: {
          steps: [
            {
              id: "retrieve-avatar",
              action: {
                kind: "retrieve_entity",
                tool: "get_salt_reference",
                args: { kind: "entity", names: ["Avatar"] },
              },
              status: "required",
            },
          ],
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
      }).success,
    ).toBe(true);
  });

  it(
    "runs public v1 calls against the slim catalog without excluded artifacts",
    async () => {
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
        const runtime = createToolExecutionRuntime();
        const callPublicTool = (name: string, args: object) =>
          getToolDefinition(name).execute(registry, args, runtime);

        const entityCases = [
          { entity_type: "component", name: "Button" },
          { entity_type: "pattern", name: "Search" },
          { entity_type: "foundation", name: "Density" },
          { entity_type: "page", name: "Components" },
          { entity_type: "guide", name: "Developing with Salt" },
          { entity_type: "package", name: "@salt-ds/core" },
          {
            entity_type: "token",
            name: "--salt-accent-background",
            include_deprecated: true,
          },
        ] as const;

        for (const entityCase of entityCases) {
          const result = (await callPublicTool("get_salt_reference", {
            kind: "entity",
            ...entityCase,
          })) as { decision?: { status?: string }; found_count?: number };

          expect(result.decision?.status).toBe("results");
          expect(result.found_count).toBeGreaterThanOrEqual(1);
        }

        const missingAuto = (await callPublicTool("get_salt_reference", {
          kind: "entity",
          name: "Definitely Missing Salt Thing",
        })) as { decision?: { status?: string }; found_count?: number };
        expect(missingAuto.decision?.status).toBe("not_found");
        expect(missingAuto.found_count).toBe(0);

        for (const target of [
          { target_type: "component", target_name: "Button" },
          { target_type: "pattern", target_name: "Search" },
        ] as const) {
          const result = (await callPublicTool("get_salt_reference", {
            kind: "examples",
            include_code: true,
            max_results: 1,
            ...target,
          })) as {
            best_example?: unknown;
            starter_code?: unknown[];
            examples?: unknown[];
          };
          expect(
            result.best_example ||
              (result.starter_code?.length ?? 0) > 0 ||
              (result.examples?.length ?? 0) > 0,
          ).toBeTruthy();
        }

        const context = (await callPublicTool("get_salt_project_context", {
          root_dir: REPO_ROOT,
        })) as { workflow?: { id?: string } };
        expect(context.workflow?.id).toBe("get_salt_project_context");

        const createResult = (await callPublicTool("create_salt_ui", {
          query: "search toolbar with filter action and settings menu",
          include_starter_code: true,
        })) as { contract?: string; workflow?: string; transport?: string };
        expect(createResult).toEqual(
          expect.objectContaining({
            contract: "salt_workflow_v1",
            workflow: "create",
            transport: "mcp",
          }),
        );

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
        })) as { contract?: string; workflow?: string; transport?: string };
        expect(reviewResult).toEqual(
          expect.objectContaining({
            contract: "salt_workflow_v1",
            workflow: "review",
            transport: "mcp",
          }),
        );

        const migrateResult = (await callPublicTool("migrate_to_salt", {
          query:
            "Convert a non-Salt toolbar with a search icon, filter icon, settings menu, loading state, and error message into Salt.",
        })) as { contract?: string; workflow?: string; transport?: string };
        expect(migrateResult).toEqual(
          expect.objectContaining({
            contract: "salt_workflow_v1",
            workflow: "migrate",
            transport: "mcp",
          }),
        );

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
          registrations._registeredResourceTemplates[
            "salt_catalog_entity"
          ].readCallback(
            new URL("salt://catalog/entity/Button"),
            { name: "Button" },
            {},
          ),
        ).resolves.toEqual(
          expect.objectContaining({ contents: expect.any(Array) }),
        );
        },
      );
    },
    20_000,
  );

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

        const manifestResult =
          await registrations._registeredResources[
            SALT_MCP_CAPABILITY_MANIFEST_URI
          ].readCallback(
            new URL(SALT_MCP_CAPABILITY_MANIFEST_URI),
            {},
          );
        const capabilityManifest = JSON.parse(
          manifestResult.contents[0]?.text ?? "null",
        ) as {
          public_surface?: { default_surface_ids?: string[] };
          support_tools?: { tool_ids?: string[]; default_exposed?: boolean };
          capabilities?: { repo_bootstrap?: boolean };
          resources?: Record<string, string | null>;
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
        expect(capabilityManifest.resources).toEqual(
          expect.objectContaining({
            capability_manifest_uri: SALT_MCP_CAPABILITY_MANIFEST_URI,
            catalog_manifest_uri: SALT_MCP_CATALOG_MANIFEST_URI,
            catalog_entity_template_uri: SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
            catalog_candidates_template_uri: null,
          }),
        );
        expect(
          Object.values(capabilityManifest.resources ?? {}).filter(Boolean),
        ).toEqual([
          SALT_MCP_CAPABILITY_MANIFEST_URI,
          SALT_MCP_CATALOG_MANIFEST_URI,
          SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
        ]);

        const catalogManifestResult =
          await registrations._registeredResources[
            SALT_MCP_CATALOG_MANIFEST_URI
          ].readCallback(
            new URL(SALT_MCP_CATALOG_MANIFEST_URI),
            {},
          );
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

    expect(metadata.capability_manifest.public_surface.default_surface_ids).toEqual(
      [...V1_TOOL_ORDER],
    );
    for (const removedSurface of REMOVED_PUBLIC_SURFACES) {
      expect(instructions).not.toContain(removedSurface);
    }
    expect(instructions).toContain("get_salt_reference");
  });
});
