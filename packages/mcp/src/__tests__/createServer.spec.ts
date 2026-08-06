import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  Client,
  InMemoryTransport,
  ProtocolError,
  ProtocolErrorCode,
  type VersionNegotiationMode,
} from "@modelcontextprotocol/client";
import { McpServer, Server } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as z from "zod/v4";
import {
  catalogManifestResourceUri,
  catalogRecordResourceTemplate,
  catalogRecordResourceUri,
} from "../core/catalog/catalogResourceIdentity.js";
import {
  projectPolicyResourceTemplate,
  projectPolicyResourceUri,
} from "../core/policy/projectPolicyResourceIdentity.js";
import {
  canonicalCatalogRuntimeFamilies,
  loadCatalogRuntimeContext,
  MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
  MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES,
  MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES,
  type SaltCatalogRuntimeContext,
} from "../core/runtime.js";
import { MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES } from "../core/search/searchSalt.js";
import { createSaltMcpServer } from "../server/createServer.js";
import type { ProjectAccessOptions } from "../server/projectAccess.js";
import { MAX_CATALOG_RESOURCE_READ_UTF8_BYTES } from "../server/registerResources.js";
import { MAX_SEARCH_TOOL_RESULT_UTF8_BYTES } from "../server/registerTools.js";
import {
  buildSaltMcpInstructions,
  getSaltMcpPackageManifest,
  SALT_MCP_CURRENT_PROTOCOL_VERSION,
  SALT_MCP_PREFERRED_LEGACY_PROTOCOL_VERSION,
  SALT_MCP_PROTOCOL_ERA,
  SALT_MCP_SUPPORTED_PROTOCOL_VERSIONS,
} from "../server/serverMetadata.js";
import {
  REGISTERED_SALT_TOOL_NAMES,
  TOOL_DEFINITIONS,
} from "../server/toolDefinitions.js";
import { MAX_TOOL_DISCOVERY_UTF8_BYTES } from "../publicSurfaceBudgets.js";
import {
  createBuiltCatalogV2Fixture,
  REPO_ROOT,
  SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS,
} from "./registryTestUtils.js";

const REMOVED_TOOL_NAMES = [
  "create_salt_ui",
  "migrate_to_salt",
  "get_salt_project_context",
  "get_salt_reference",
  "review_salt_ui",
] as const;
const MAX_INSTRUCTIONS_UTF8_BYTES = 1_000;
const JSON_SCHEMA_2020_12 = "https://json-schema.org/draft/2020-12/schema";
const PACKAGE_VERSIONS_SCHEMA_PATH =
  "review_salt_code.input.properties.package_versions";
let catalogFixtureDirectory = "";
let runtimeContext: SaltCatalogRuntimeContext;

function assertStrictNestedObjects(
  value: unknown,
  schemaPath = "schema",
): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const record = value as Record<string, unknown>;
  if (
    record.type === "object" ||
    (Array.isArray(record.type) && record.type.includes("object"))
  ) {
    const properties = Object.keys(
      (record.properties as object | undefined) ?? {},
    );
    if (schemaPath === PACKAGE_VERSIONS_SCHEMA_PATH) {
      expect(properties, schemaPath).toHaveLength(0);
      expect(record.maxProperties, schemaPath).toBe(32);
      expect(record.propertyNames, schemaPath).toEqual({
        type: "string",
        minLength: 1,
        maxLength: 214,
        pattern: "^@salt-ds\\/[a-z0-9][a-z0-9._-]*$",
      });
      expect(record.additionalProperties, schemaPath).toEqual(
        expect.objectContaining({
          type: "string",
          minLength: 1,
          maxLength: 128,
          pattern: expect.any(String),
        }),
      );
    } else {
      expect(record.additionalProperties, schemaPath).toBe(false);
      expect(properties, schemaPath).not.toHaveLength(0);
    }
  }
  for (const [key, child] of Object.entries(record)) {
    assertStrictNestedObjects(child, `${schemaPath}.${key}`);
  }
}

function assertRequiredObjectProperty(
  schema: Record<string, unknown>,
  propertyName: string,
  schemaPath: string,
): void {
  const propertyNames = Object.keys(
    (schema.properties as Record<string, unknown> | undefined) ?? {},
  );
  expect(propertyNames, schemaPath).toContain(propertyName);
  if (Array.isArray(schema.required)) {
    expect(schema.required, schemaPath).toContain(propertyName);
  } else {
    expect(schema.minProperties, schemaPath).toBe(propertyNames.length);
  }
}

beforeAll(async () => {
  catalogFixtureDirectory = await createBuiltCatalogV2Fixture(
    "salt-create-server-v2-",
  );
  runtimeContext = await loadCatalogRuntimeContext({
    registryDir: catalogFixtureDirectory,
    prefetch: true,
  });
}, SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS);

afterAll(async () => {
  if (catalogFixtureDirectory) {
    await fs.rm(catalogFixtureDirectory, {
      recursive: true,
      force: true,
    });
  }
});

function toolPayload(result: unknown): Record<string, unknown> {
  if (!result || typeof result !== "object") {
    throw new Error("Expected an MCP tool result object.");
  }
  const payload = result as {
    content?: Array<{ type: string; text?: string }>;
    structuredContent?: unknown;
  };
  const structured = payload.structuredContent;
  if (structured && typeof structured === "object") {
    return structured as Record<string, unknown>;
  }
  const text = payload.content?.find((part) => part.type === "text")?.text;
  if (typeof text !== "string") {
    throw new Error("Tool result omitted structured and text content.");
  }
  return JSON.parse(text) as Record<string, unknown>;
}

function valueAtFieldPath(
  record: Record<string, unknown>,
  fieldPath: string,
): unknown {
  return fieldPath.split(".").reduce<unknown>((value, segment) => {
    if (Array.isArray(value) && /^\d+$/u.test(segment)) {
      return value[Number(segment)];
    }
    return value && typeof value === "object"
      ? (value as Record<string, unknown>)[segment]
      : undefined;
  }, record);
}

async function withProtocolClient(
  run: (client: Client) => Promise<void>,
  projectAccess: ProjectAccessOptions = {
    mode: "restricted",
    allowedRoots: [REPO_ROOT],
    defaultRoot: REPO_ROOT,
  },
): Promise<void> {
  const server = await createSaltMcpServer({
    registryDir: catalogFixtureDirectory,
    projectAccess,
  });
  await withConnectedProtocolClient(server, run);
}

interface DirectResourcePage {
  resources: Array<{ uri: string; name: string; mimeType?: string }>;
  nextCursor?: string;
}

async function directResourcePage(
  client: Client,
  cursor?: string,
): Promise<DirectResourcePage> {
  return client.request({
    method: "resources/list",
    params: cursor === undefined ? {} : { cursor },
  }) as Promise<DirectResourcePage>;
}

async function withConnectedProtocolClient(
  server: McpServer | Server,
  run: (client: Client) => Promise<void>,
): Promise<void> {
  const client = new Client({
    name: "salt-mcp-v2-protocol-test",
    version: "1.0.0",
  });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  try {
    await run(client);
  } finally {
    await client.close();
    await server.close();
  }
}

async function withNegotiatedStdioClient(
  mode: VersionNegotiationMode,
  run: (client: Client, constructedEras: string[]) => Promise<void>,
): Promise<void> {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const constructedEras: string[] = [];
  const handle = serveStdio(
    async ({ era }) => {
      constructedEras.push(era);
      return createSaltMcpServer({
        registryDir: catalogFixtureDirectory,
        projectAccess: {
          mode: "restricted",
          allowedRoots: [REPO_ROOT],
          defaultRoot: REPO_ROOT,
        },
      });
    },
    { transport: serverTransport, legacy: "serve" },
  );
  const client = new Client(
    { name: "salt-mcp-negotiation-test", version: "1.0.0" },
    { versionNegotiation: { mode } },
  );

  try {
    await client.connect(clientTransport);
    await run(client, constructedEras);
  } finally {
    await client.close();
    await handle.close();
  }
}

describe("createSaltMcpServer final public boundary", () => {
  it("retains a direct legacy handshake for reusable-factory callers", async () => {
    await withProtocolClient(async (client) => {
      expect(SALT_MCP_PROTOCOL_ERA).toBe("dual");
      expect(client.getProtocolEra()).toBe("legacy");
      expect(client.getNegotiatedProtocolVersion()).toBe(
        SALT_MCP_PREFERRED_LEGACY_PROTOCOL_VERSION,
      );
    });
  });

  it.each([
    ["modern-pinned", { pin: SALT_MCP_CURRENT_PROTOCOL_VERSION }, "modern"],
    ["auto", "auto", "modern"],
    ["legacy-pinned", "legacy", "legacy"],
  ] as const)(
    "serves the %s negotiation path through one dual-era factory",
    async (_label, mode, expectedEra) => {
      await withNegotiatedStdioClient(mode, async (client, constructedEras) => {
        expect(client.getProtocolEra()).toBe(expectedEra);
        expect(client.getNegotiatedProtocolVersion()).toBe(
          expectedEra === "modern"
            ? SALT_MCP_CURRENT_PROTOCOL_VERSION
            : SALT_MCP_PREFERRED_LEGACY_PROTOCOL_VERSION,
        );
        expect(constructedEras.at(-1)).toBe(expectedEra);
        expect((await client.listTools()).tools.map((tool) => tool.name)).toEqual(
          [...REGISTERED_SALT_TOOL_NAMES],
        );
      });
    },
  );

  it("advertises exactly the three read-only adapter tools", async () => {
    await withProtocolClient(async (client) => {
      const listed = await client.listTools();
      expect(listed.tools.map((tool) => tool.name)).toEqual([
        ...REGISTERED_SALT_TOOL_NAMES,
      ]);
      expect(REGISTERED_SALT_TOOL_NAMES).toEqual([
        "search_salt",
        "inspect_salt_project",
        "review_salt_code",
      ]);

      for (const tool of listed.tools) {
        expect(tool.annotations).toEqual(
          expect.objectContaining({
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
          }),
        );
        expect(tool.inputSchema.additionalProperties).toBe(false);
        expect(tool.outputSchema?.additionalProperties).toBe(false);
        expect(tool.inputSchema.$schema).toBe(JSON_SCHEMA_2020_12);
        expect(tool.outputSchema?.$schema).toBe(JSON_SCHEMA_2020_12);
        assertStrictNestedObjects(tool.inputSchema, `${tool.name}.input`);
        assertStrictNestedObjects(tool.outputSchema, `${tool.name}.output`);
        assertRequiredObjectProperty(
          tool.outputSchema!,
          "provenance",
          `${tool.name}.output`,
        );
      }
      expect(
        Buffer.byteLength(JSON.stringify(listed), "utf8"),
      ).toBeLessThanOrEqual(MAX_TOOL_DISCOVERY_UTF8_BYTES);
    });
  });

  it("returns typed v2 protocol errors for removed, unknown, and disabled tools", async () => {
    await withProtocolClient(async (client) => {
      for (const name of [...REMOVED_TOOL_NAMES, "unknown_salt_tool"]) {
        const error = await client
          .callTool({ name, arguments: {} })
          .then(() => undefined)
          .catch((caught: unknown) => caught);
        expect(error).toBeInstanceOf(ProtocolError);
        expect(error).toMatchObject({ code: ProtocolErrorCode.InvalidParams });
      }
    });

    const server = new McpServer(
      { name: "disabled-tool-probe", version: "1.0.0" },
      { supportedProtocolVersions: [...SALT_MCP_SUPPORTED_PROTOCOL_VERSIONS] },
    );
    const disabledTool = server.registerTool(
      "disabled_probe",
      { inputSchema: z.object({}).strict() },
      () => ({ content: [{ type: "text", text: "unreachable" }] }),
    );
    disabledTool.disable();

    await withConnectedProtocolClient(server, async (client) => {
      const error = await client
        .callTool({ name: "disabled_probe", arguments: {} })
        .then(() => undefined)
        .catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(ProtocolError);
      expect(error).toMatchObject({ code: ProtocolErrorCode.InvalidParams });
      expect((error as Error).message).toMatch(/disabled_probe.*disabled/iu);
    });
  });

  it("distinguishes direct server pages from typed-client aggregation", async () => {
    const server = new Server(
      { name: "pagination-probe", version: "1.0.0" },
      { supportedProtocolVersions: [...SALT_MCP_SUPPORTED_PROTOCOL_VERSIONS] },
    );
    server.registerCapabilities({ tools: {} });
    const observedCursors: Array<string | undefined> = [];
    server.setRequestHandler("tools/list", (request) => {
      const cursor = request.params?.cursor;
      observedCursors.push(cursor);
      if (cursor === "page-2") {
        return {
          tools: [
            {
              name: "second_page",
              inputSchema: { type: "object", additionalProperties: false },
            },
          ],
        };
      }
      return {
        tools: [
          {
            name: "first_page",
            inputSchema: { type: "object", additionalProperties: false },
          },
        ],
        nextCursor: "page-2",
      };
    });

    await withConnectedProtocolClient(server, async (client) => {
      const firstPage = await client.listTools({ cursor: "page-1" });
      expect(firstPage).toMatchObject({
        tools: [{ name: "first_page" }],
        nextCursor: "page-2",
      });

      const secondPage = await client.listTools({
        cursor: firstPage.nextCursor,
      });
      expect(secondPage).toMatchObject({
        tools: [{ name: "second_page" }],
      });
      expect(secondPage.nextCursor).toBeUndefined();

      const aggregated = await client.listTools();
      expect(aggregated.tools.map((tool) => tool.name)).toEqual([
        "first_page",
        "second_page",
      ]);
      expect(aggregated.nextCursor).toBeUndefined();
    });

    expect(observedCursors).toEqual(["page-1", "page-2", undefined, "page-2"]);
  });

  it("searches summaries and links exact digest-bound resources", async () => {
    await withProtocolClient(async (client) => {
      const result = await client.callTool({
        name: "search_salt",
        arguments: {
          query: "Button",
          families: ["component"],
          statuses: ["stable"],
          limit: 3,
        },
      });
      expect(result.isError).not.toBe(true);
      const payload = toolPayload(result) as {
        data?: {
          matches?: Array<{
            title?: string;
            uri?: string;
            evidence?: { matched_fields?: string[] };
            provenance?: { resource_uri?: string };
          }>;
          ambiguity?: {
            candidate_count?: number;
            top_score_tie_count?: number;
            is_ambiguous?: boolean;
          };
        };
        scope?: {
          kind?: string;
          returned?: number;
          searched_statuses?: string[] | null;
        };
        coverage?: { matched_documents?: number };
        provenance?: { semantic_digest?: string };
      };
      const button = payload.data?.matches?.find(
        (match) => match.title === "Button",
      );
      expect(button?.uri).toMatch(
        /^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\/components\//u,
      );
      expect(payload.scope).toMatchObject({
        kind: "catalog_search",
        returned: expect.any(Number),
        searched_statuses: ["stable"],
      });
      expect(payload.provenance?.semantic_digest).toBe(
        runtimeContext.store.manifest.semantic_digest,
      );
      expect(button?.evidence?.matched_fields).toContain("title");
      expect(button?.provenance?.resource_uri).toBe(button?.uri);
      expect(payload.data?.ambiguity).toEqual(
        expect.objectContaining({
          candidate_count: expect.any(Number),
          top_score_tie_count: expect.any(Number),
          is_ambiguous: expect.any(Boolean),
        }),
      );
      expect(payload.coverage?.matched_documents).toBe(
        payload.data?.ambiguity?.candidate_count,
      );
      expect(
        Buffer.byteLength(JSON.stringify(result), "utf8"),
      ).toBeLessThanOrEqual(MAX_SEARCH_TOOL_RESULT_UTF8_BYTES);
      expect(result.content).toContainEqual(
        expect.objectContaining({
          type: "resource_link",
          uri: button?.uri,
        }),
      );

      const resource = await client.readResource({ uri: button?.uri ?? "" });
      expect(JSON.stringify(resource.contents)).toContain("Button");
      expect(JSON.stringify(resource.contents)).toContain(
        runtimeContext.store.manifest.semantic_digest,
      );
      expect(
        Buffer.byteLength(JSON.stringify(resource), "utf8"),
      ).toBeLessThanOrEqual(MAX_CATALOG_RESOURCE_READ_UTF8_BYTES);
      const recordContent = resource.contents[0];
      if (!recordContent || !("text" in recordContent)) {
        throw new Error("Button resource did not return a JSON record.");
      }
      const recordEnvelope = JSON.parse(recordContent.text) as {
        content_resources?: Array<{ uri?: string }>;
      };
      expect(recordEnvelope).not.toHaveProperty("content");
      const contentUri = recordEnvelope.content_resources?.[0]?.uri;
      expect(contentUri).toMatch(
        /^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\/content\//u,
      );
      const linkedContent = await client.readResource({
        uri: contentUri ?? "",
      });
      expect(linkedContent.contents[0]).toEqual(
        expect.objectContaining({ uri: contentUri }),
      );
    });
  }, 30_000);

  it("keeps representative search responses compact and fallback-equivalent", async () => {
    await withProtocolClient(async (client) => {
      const sizes: number[] = [];
      for (const query of [
        "Button",
        "border",
        "text color",
        "padding",
        "disabled text",
      ]) {
        const result = await client.callTool({
          name: "search_salt",
          arguments: { query, limit: 8 },
        });
        const payload = toolPayload(result) as {
          data?: { matches?: Array<{ id?: string; uri?: string }> };
        };
        const fallback = result.content.find((part) => part.type === "text");
        expect(fallback?.type).toBe("text");
        if (fallback?.type !== "text") continue;
        for (const match of payload.data?.matches ?? []) {
          expect(fallback.text).toContain(match.id);
          expect(fallback.text).toContain(match.uri);
        }
        expect(fallback.text).toContain("Scope: families=");
        expect(fallback.text).toContain("Coverage: indexed=");
        expect(fallback.text).toContain("top-score ties=");
        sizes.push(Buffer.byteLength(JSON.stringify(result), "utf8"));
      }
      sizes.sort((left, right) => left - right);
      const p95 = sizes[Math.ceil(sizes.length * 0.95) - 1] ?? 0;
      expect(p95).toBeLessThanOrEqual(8_000);
      expect(sizes.at(-1)).toBeLessThanOrEqual(
        MAX_SEARCH_TOOL_RESULT_UTF8_BYTES,
      );
    });
  }, 30_000);

  it("uses schema-valid adversarial search queries without exceeding public budgets", async () => {
    await withProtocolClient(async (client) => {
      for (const query of [
        "漢".repeat(2_000),
        `A${"\u0000".repeat(1_999)}`,
        `A${"\ud800".repeat(1_999)}`,
      ]) {
        const result = await client.callTool({
          name: "search_salt",
          arguments: { query },
        });
        expect(result.isError).not.toBe(true);
        const payload = toolPayload(result) as {
          data: { query: string };
          scope: { truncated: boolean };
          limitations: string[];
        };
        expect(
          Buffer.byteLength(JSON.stringify(payload), "utf8"),
        ).toBeLessThanOrEqual(MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES);
        expect(
          Buffer.byteLength(JSON.stringify(result), "utf8"),
        ).toBeLessThanOrEqual(MAX_SEARCH_TOOL_RESULT_UTF8_BYTES);
        expect(payload.data.query.length).toBeLessThan(query.length);
        expect(payload.scope.truncated).toBe(true);
        expect(payload.limitations.join(" ")).toMatch(
          /used in full for search.*public echo was truncated/iu,
        );
        const fallback = result.content.find((part) => part.type === "text");
        expect(fallback?.type === "text" ? fallback.text : "").toContain(
          payload.data.query,
        );
        expect(
          TOOL_DEFINITIONS.find(
            (candidate) => candidate.name === "search_salt",
          )?.outputValidationSchema.safeParse(payload).success,
        ).toBe(true);
      }

      const asciiQuery = "x".repeat(2_000);
      const asciiResult = await client.callTool({
        name: "search_salt",
        arguments: { query: asciiQuery },
      });
      expect(asciiResult.isError).not.toBe(true);
      expect(
        (toolPayload(asciiResult) as { data: { query: string } }).data.query,
      ).toBe(asciiQuery);
    });
  }, 30_000);

  it("inspects only the caller-selected project and makes no readiness claim", async () => {
    await withProtocolClient(async (client) => {
      const result = await client.callTool({
        name: "inspect_salt_project",
        arguments: {
          root_dir: REPO_ROOT,
          evaluate_policy: false,
          include_policy_ir: false,
        },
      });
      expect(result.isError).not.toBe(true);
      const payload = toolPayload(result) as {
        data?: { root_dir?: string; package_manifest?: { name?: string } };
        scope?: { kind?: string; filesystem_access?: string };
        provenance?: {
          project_context_digest?: string | null;
          project_policy_digest?: string | null;
        };
      };
      expect(payload.data?.root_dir?.replaceAll("\\", "/")).toBe(
        REPO_ROOT.replaceAll("\\", "/"),
      );
      expect(payload.scope).toEqual(
        expect.objectContaining({
          kind: "configured_project_inspection",
          filesystem_access: "read_only",
          authorization: "restricted",
        }),
      );
      expect(payload.provenance).toEqual({
        project_context_digest: null,
        project_policy_digest: null,
      });
      expect(JSON.stringify(payload)).not.toMatch(
        /implementation_ready|canonical_complete|exact_request_safe|finish_without_changes|post_action/iu,
      );
      expect(
        Buffer.byteLength(JSON.stringify(result), "utf8"),
      ).toBeLessThanOrEqual(MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES);
      const fallback = result.content.find((part) => part.type === "text");
      expect(
        fallback?.type === "text" ? JSON.parse(fallback.text) : null,
      ).toEqual(payload);
      const invalidPayload = structuredClone(payload);
      (invalidPayload.data as Record<string, unknown>).invented = true;
      const definition = TOOL_DEFINITIONS.find(
        (candidate) => candidate.name === "inspect_salt_project",
      );
      expect(
        definition?.outputValidationSchema.safeParse(invalidPayload).success,
      ).toBe(false);
    });
  }, 30_000);

  it("discovers an ancestor workspace for a CLI-selected child package", async () => {
    const workspaceRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-cli-workspace-"),
    );
    const packageRoot = path.join(workspaceRoot, "packages", "app");
    try {
      await fs.mkdir(packageRoot, { recursive: true });
      await fs.writeFile(
        path.join(workspaceRoot, "package.json"),
        JSON.stringify({ private: true, workspaces: ["packages/*"] }),
        "utf8",
      );
      await fs.writeFile(
        path.join(packageRoot, "package.json"),
        JSON.stringify({
          name: "workspace-app",
          dependencies: { "@salt-ds/core": "^2.0.0" },
        }),
        "utf8",
      );
      const installedCore = path.join(
        workspaceRoot,
        "node_modules",
        "@salt-ds",
        "core",
      );
      await fs.mkdir(installedCore, { recursive: true });
      await fs.writeFile(
        path.join(installedCore, "package.json"),
        JSON.stringify({ name: "@salt-ds/core", version: "2.1.0" }),
        "utf8",
      );

      await withProtocolClient(
        async (client) => {
          const result = await client.callTool({
            name: "inspect_salt_project",
            arguments: { root_dir: packageRoot, include_policy_ir: false },
          });
          expect(result.isError).not.toBe(true);
          const payload = toolPayload(result) as {
            data: {
              workspace: { kind: string; workspace_root: string | null };
              installation: {
                resolved_packages: Array<{
                  name: string;
                  resolved_version: string | null;
                }>;
              };
            };
          };
          expect(payload.data.workspace).toMatchObject({
            kind: "workspace-package",
            workspace_root: workspaceRoot.replaceAll("\\", "/"),
          });
          expect(payload.data.installation.resolved_packages).toContainEqual(
            expect.objectContaining({
              name: "@salt-ds/core",
              resolved_version: "2.1.0",
            }),
          );
        },
        {
          mode: "unrestricted_local_stdio",
          defaultRoot: workspaceRoot,
        },
      );
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  }, 30_000);

  it("bounds caller-controlled inspection fields without turning valid input into a tool error", async () => {
    const projectRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-inspect-public-budget-"),
    );
    try {
      await fs.writeFile(
        path.join(projectRoot, "package.json"),
        JSON.stringify({
          name: "漢".repeat(14_000),
          packageManager: "manager".repeat(6_000),
          dependencies: {
            "@salt-ds/core": `workspace:${"\u0000".repeat(20_000)}`,
          },
        }),
        "utf8",
      );

      await withProtocolClient(
        async (client) => {
          const result = await client.callTool({
            name: "inspect_salt_project",
            arguments: { root_dir: projectRoot, include_policy_ir: false },
          });
          expect(result.isError).not.toBe(true);
          const payload = toolPayload(result) as {
            data: {
              package_manifest: {
                name: string | null;
                package_manager: string;
              } | null;
            };
            coverage: {
              result_budget: {
                max_utf8_bytes: number;
                truncated: boolean;
                omissions: Array<{
                  section: string;
                  available: number;
                  returned: number;
                }>;
              };
            };
          };
          expect(payload.data.package_manifest).toMatchObject({
            name: null,
            package_manager: "unknown",
          });
          expect(payload.coverage.result_budget).toMatchObject({
            max_utf8_bytes: MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
            truncated: true,
          });
          expect(payload.coverage.result_budget.omissions).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                section: "package_manifest.name",
                available: 1,
                returned: 0,
              }),
              expect.objectContaining({
                section: "installation.resolved_packages",
                available: 1,
                returned: 0,
              }),
            ]),
          );
          expect(
            Buffer.byteLength(JSON.stringify(payload), "utf8"),
          ).toBeLessThanOrEqual(MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES);
          expect(
            Buffer.byteLength(JSON.stringify(result), "utf8"),
          ).toBeLessThanOrEqual(MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES);
          const fallback = result.content.find((part) => part.type === "text");
          expect(
            fallback?.type === "text" ? JSON.parse(fallback.text) : null,
          ).toEqual(payload);
          expect(
            TOOL_DEFINITIONS.find(
              (candidate) => candidate.name === "inspect_salt_project",
            )?.outputValidationSchema.safeParse(payload).success,
          ).toBe(true);
        },
        {
          mode: "restricted",
          allowedRoots: [projectRoot],
          defaultRoot: projectRoot,
        },
      );
    } finally {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  }, 30_000);

  it("budgets the exact escape-heavy inspection wrapper without a tool error", async () => {
    const projectRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-inspect-escape-budget-"),
    );
    try {
      await fs.mkdir(path.join(projectRoot, ".salt"), { recursive: true });
      await fs.writeFile(
        path.join(projectRoot, "package.json"),
        JSON.stringify({ name: "escape-heavy-fixture" }),
        "utf8",
      );
      await fs.writeFile(
        path.join(projectRoot, ".salt", "team.json"),
        JSON.stringify({
          contract: "project_conventions_v1",
          version: "1.0.0",
          approved_wrappers: [
            {
              name: "\\".repeat(4_096),
              wraps: "Button",
              reason: '\\"\u0001'.repeat(800),
            },
          ],
        }),
        "utf8",
      );

      await withProtocolClient(
        async (client) => {
          const result = await client.callTool({
            name: "inspect_salt_project",
            arguments: { root_dir: projectRoot, include_policy_ir: true },
          });
          expect(result.isError).not.toBe(true);
          const payload = toolPayload(result) as {
            data: { policy: { ir: { untrusted_ir: unknown } | null } };
            coverage: {
              result_budget: {
                omissions: Array<{
                  section: string;
                  available: number;
                  returned: number;
                }>;
              };
            };
          };
          expect(payload.data.policy.ir?.untrusted_ir).toBeNull();
          expect(payload.coverage.result_budget.omissions).toEqual(
            expect.arrayContaining([
              {
                section: "policy.ir",
                available: 1,
                returned: 0,
              },
            ]),
          );
          expect(
            Buffer.byteLength(JSON.stringify(result), "utf8"),
          ).toBeLessThanOrEqual(MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES);
          const fallback = result.content.find((part) => part.type === "text");
          expect(
            fallback?.type === "text" ? JSON.parse(fallback.text) : null,
          ).toEqual(payload);
          expect(
            TOOL_DEFINITIONS.find(
              (candidate) => candidate.name === "inspect_salt_project",
            )?.outputValidationSchema.safeParse(payload).success,
          ).toBe(true);
        },
        {
          mode: "restricted",
          allowedRoots: [projectRoot],
          defaultRoot: projectRoot,
        },
      );
    } finally {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  }, 30_000);

  it("publishes digest-bound authorized policy resources and applies established policy facts", async () => {
    const projectRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-policy-resource-"),
    );
    try {
      await fs.mkdir(path.join(projectRoot, ".salt"), { recursive: true });
      await fs.mkdir(path.join(projectRoot, "src"), { recursive: true });
      await fs.writeFile(
        path.join(projectRoot, "package.json"),
        JSON.stringify({ name: "policy-resource-fixture" }),
        "utf8",
      );
      await fs.writeFile(
        path.join(projectRoot, "src", "ActionButton.tsx"),
        "export const ActionButton = () => null;\n",
        "utf8",
      );
      await fs.writeFile(
        path.join(projectRoot, ".salt", "team.json"),
        JSON.stringify({
          contract: "project_conventions_v1",
          version: "1.0.0",
          approved_wrappers: [
            {
              name: "ActionButton",
              wraps: "Button",
              reason: "Bound fixture convention.",
              import: {
                from: "./src/ActionButton",
                name: "ActionButton",
              },
            },
          ],
          token_family_policies: [
            {
              family: "spacing",
              mode: "allow-local-aliases",
              reason: "Aliases are permitted, not required.",
            },
          ],
        }),
        "utf8",
      );

      await withProtocolClient(
        async (client) => {
          const inspected = await client.callTool({
            name: "inspect_salt_project",
            arguments: { root_dir: projectRoot, include_policy_ir: true },
          });
          expect(inspected.isError).not.toBe(true);
          const inspectedPayload = toolPayload(inspected) as {
            data: {
              context: { handle: string; digest: string } | null;
              policy: {
                ir: {
                  digest: string;
                  manifest_uri: string;
                } | null;
              };
            };
          };
          const policyIr = inspectedPayload.data.policy.ir;
          const projectContext = inspectedPayload.data.context;
          expect(policyIr).not.toBeNull();
          expect(projectContext).not.toBeNull();
          const manifestUri = policyIr!.manifest_uri;
          expect(inspected.content).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: "resource_link",
                uri: manifestUri,
              }),
            ]),
          );
          const manifestResource = await client.readResource({
            uri: manifestUri,
          });
          const manifestContent = manifestResource.contents[0];
          if (!manifestContent || !("text" in manifestContent)) {
            throw new Error("Project-policy manifest omitted text content.");
          }
          const manifest = JSON.parse(manifestContent.text) as {
            policy_digest: string;
            canonical_utf8_bytes: number;
            chunk_count: number;
            chunk_uri_template: string;
          };
          expect(manifest.policy_digest).toBe(policyIr!.digest);
          const chunks = await Promise.all(
            Array.from({ length: manifest.chunk_count }, async (_, index) => {
              const chunkResource = await client.readResource({
                uri: manifest.chunk_uri_template.replace(
                  "{index}",
                  String(index),
                ),
              });
              const content = chunkResource.contents[0];
              if (!content || !("text" in content)) {
                throw new Error("Project-policy chunk omitted text content.");
              }
              return JSON.parse(content.text) as { data: string };
            }),
          );
          const canonicalBytes = Buffer.concat(
            chunks.map((chunk) => Buffer.from(chunk.data, "base64url")),
          );
          expect(canonicalBytes.byteLength).toBe(manifest.canonical_utf8_bytes);
          expect(
            `sha256:${createHash("sha256").update(canonicalBytes).digest("hex")}`,
          ).toBe(policyIr!.digest);
          const reconstructed = JSON.parse(canonicalBytes.toString("utf8")) as {
            occurrences: Array<{ occurrence_id: string }>;
          };
          expect(reconstructed.occurrences.length).toBeGreaterThanOrEqual(2);

          await fs.rm(path.join(projectRoot, ".salt", "team.json"));

          const reviewed = await client.callTool({
            name: "review_salt_code",
            arguments: {
              project_context_handle: projectContext!.handle,
              artifacts: [
                {
                  id: "policy.tsx",
                  language: "tsx",
                  text: [
                    'import { Button } from "@salt-ds/core";',
                    "export const Demo = () => <Button>Save</Button>;",
                  ].join("\n"),
                },
              ],
            },
          });
          expect(reviewed.isError).not.toBe(true);
          const reviewedPayload = toolPayload(reviewed) as {
            data: {
              results: Array<{
                findings: Array<{
                  rule_id: string;
                  parsed_fact: { subject: string };
                  evidence: {
                    references: Array<{ locator: string; field_path: string }>;
                  };
                }>;
              }>;
            };
            coverage: { project_policy: { digest: string } };
            provenance: { project_context_digest: string | null };
          };
          expect(reviewedPayload.coverage.project_policy.digest).toBe(
            policyIr!.digest,
          );
          expect(reviewedPayload.provenance.project_context_digest).toBe(
            projectContext!.digest,
          );
          const policyFinding = reviewedPayload.data.results[0]!.findings.find(
            (finding) =>
              finding.rule_id === "salt.project_policy.approved_wrapper",
          );
          expect(policyFinding).toBeDefined();
          const claimReference = policyFinding!.evidence.references[0]!;
          expect(claimReference.field_path).toBe("claim.declaration.name");
          expect(reviewed.content).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: "resource_link",
                uri: claimReference.locator,
              }),
            ]),
          );
          const claim = await client.readResource({
            uri: claimReference.locator,
          });
          const claimContent = claim.contents[0];
          const claimBody =
            claimContent && "text" in claimContent
              ? (JSON.parse(claimContent.text) as Record<string, unknown>)
              : null;
          expect(
            claimContent && "text" in claimContent ? claimContent.text : "",
          ).not.toContain(projectRoot);
          expect(
            claimBody
              ? valueAtFieldPath(claimBody, claimReference.field_path)
              : null,
          ).toBe("ActionButton");
          expect(
            claimBody
              ? valueAtFieldPath(claimBody, "claim.declaration.reason")
              : null,
          ).toBe("Bound fixture convention.");
          expect(
            policyFinding!.evidence.references.map(
              (reference) => reference.field_path,
            ),
          ).toEqual(
            expect.arrayContaining([
              "claim.selector",
              "claim.declaration.reason",
              "claim.applicability",
              "claim.source",
              "claim.applicability.import_validation",
            ]),
          );
          for (const reference of policyFinding!.evidence.references) {
            expect(
              claimBody
                ? valueAtFieldPath(claimBody, reference.field_path)
                : undefined,
              reference.field_path,
            ).toBeDefined();
          }
          expect(policyFinding!.parsed_fact.subject.split("#").at(-1)).toBe(
            claimBody
              ? valueAtFieldPath(claimBody, "claim.selector.value")
              : null,
          );
          expect(
            claimBody
              ? valueAtFieldPath(
                  claimBody,
                  "claim.applicability.import_validation",
                )
              : null,
          ).toEqual({
            status: "resolved",
            from: "./src/ActionButton",
            name: "ActionButton",
          });

          await fs.writeFile(
            path.join(projectRoot, ".salt", "team.json"),
            JSON.stringify({
              contract: "project_conventions_v1",
              version: "1.0.0",
              approved_wrappers: [
                {
                  name: "ChangedButton",
                  wraps: "Button",
                  reason: "Changed after the cited snapshot was issued.",
                },
              ],
            }),
            "utf8",
          );
          const retainedManifest = await client.readResource({
            uri: manifestUri,
          });
          const retainedManifestContent = retainedManifest.contents[0];
          expect(
            retainedManifestContent && "text" in retainedManifestContent
              ? (
                  JSON.parse(retainedManifestContent.text) as {
                    policy_digest: string;
                  }
                ).policy_digest
              : null,
          ).toBe(policyIr!.digest);
          const retainedClaim = await client.readResource({
            uri: claimReference.locator,
          });
          const retainedClaimContent = retainedClaim.contents[0];
          expect(
            retainedClaimContent && "text" in retainedClaimContent
              ? valueAtFieldPath(
                  JSON.parse(retainedClaimContent.text) as Record<
                    string,
                    unknown
                  >,
                  claimReference.field_path,
                )
              : null,
          ).toBe("ActionButton");

          const occurrenceId = reconstructed.occurrences[0]!.occurrence_id;
          expect(
            projectPolicyResourceUri({
              rootDir: projectRoot,
              digest: policyIr!.digest,
              kind: "claim",
              id: occurrenceId,
            }),
          ).toMatch(/^salt:\/\/project-policy\/v2\//u);
          const staleUri = manifestUri.replace(
            /[0-9a-f](?=\/manifest\/index$)/u,
            (value) => (value === "0" ? "1" : "0"),
          );
          await expect(
            client.readResource({ uri: staleUri }),
          ).rejects.toThrow();
          await expect(
            client.readResource({
              uri: projectPolicyResourceUri({
                rootDir: `${projectRoot}${path.sep}.`,
                digest: policyIr!.digest,
                kind: "manifest",
              }),
            }),
          ).rejects.toThrow();
          await expect(
            client.readResource({
              uri: manifestUri.replace(
                /manifest\/index$/u,
                `claim/${"x".repeat(1_025)}`,
              ),
            }),
          ).rejects.toThrow();
          await expect(
            client.readResource({
              uri: projectPolicyResourceUri({
                rootDir: projectRoot,
                digest: policyIr!.digest,
                kind: "claim",
                id: "policy-occurrence.missing",
              }),
            }),
          ).rejects.toThrow();
          await expect(
            client.readResource({
              uri: projectPolicyResourceUri({
                rootDir: path.dirname(projectRoot),
                digest: policyIr!.digest,
                kind: "manifest",
              }),
            }),
          ).rejects.toThrow();
        },
        {
          mode: "restricted",
          allowedRoots: [projectRoot],
          defaultRoot: projectRoot,
        },
      );
    } finally {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  }, 30_000);

  it("reviews only submitted text and reports the bounded scope", async () => {
    await withProtocolClient(async (client) => {
      const submitted = [
        'import { Button } from "@salt-ds/core";',
        "export function Demo() {",
        '  return <Button href="/next">Go</Button>;',
        "}",
      ].join("\n");
      const result = await client.callTool({
        name: "review_salt_code",
        arguments: {
          artifacts: [{ id: "demo.tsx", language: "tsx", text: submitted }],
        },
      });
      expect(result.isError).not.toBe(true);
      const payload = toolPayload(result) as {
        data?: {
          results?: Array<{
            artifact?: { id?: string; utf8_bytes?: number };
            outcome?: string;
          }>;
        };
        scope?: { kind?: string; artifact_count?: number; statement?: string };
        limitations?: string[];
      };
      expect(payload.data?.results?.[0]).toMatchObject({
        artifact: {
          id: "demo.tsx",
          utf8_bytes: Buffer.byteLength(submitted, "utf8"),
        },
        outcome: expect.stringMatching(
          /^(findings|no_findings_in_evaluated_scope)$/u,
        ),
      });
      expect(payload.scope).toEqual(
        expect.objectContaining({
          kind: "submitted_text_only",
          artifact_count: 1,
        }),
      );
      expect(payload.limitations?.join(" ")).toMatch(/not submitted/iu);
      for (const finding of payload.data?.results?.flatMap((entry) => {
        const candidate = entry as {
          findings?: Array<{
            rule_id?: string;
            evidence?: {
              references?: Array<{ locator: string; field_path: string }>;
            };
          }>;
        };
        return candidate.findings ?? [];
      }) ?? []) {
        for (const reference of finding.evidence?.references ?? []) {
          expect(reference.locator).toMatch(
            /^salt:\/(?:\/catalog\/v2\/|\/project-policy\/v2\/)/u,
          );
          const resource = await client.readResource({
            uri: reference.locator,
          });
          const textContent = resource.contents.find(
            (content) => "text" in content,
          );
          const text =
            textContent && "text" in textContent ? textContent.text : null;
          expect(text).toBeTruthy();
          const body = JSON.parse(text ?? "{}") as {
            record?: Record<string, unknown>;
          };
          const evidenceRecord = body.record ?? body;
          const evidenceValue = valueAtFieldPath(
            evidenceRecord,
            reference.field_path,
          );
          expect(evidenceValue).toBeDefined();
          if (finding.rule_id === "salt.component.action_navigation_target") {
            expect(evidenceValue).toEqual(
              expect.stringMatching(/another page or window/iu),
            );
          }
        }
      }
      expect(JSON.stringify(payload)).not.toMatch(
        /implementation_ready|canonical_complete|exact_request_safe|finish_without_changes|post_action/iu,
      );
      expect(
        Buffer.byteLength(JSON.stringify(result), "utf8"),
      ).toBeLessThanOrEqual(MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES);
      const fallback = result.content.find((part) => part.type === "text");
      expect(
        fallback?.type === "text" ? JSON.parse(fallback.text) : null,
      ).toEqual(payload);
      const invalidPayload = structuredClone(payload);
      (invalidPayload.scope as Record<string, unknown>).invented = true;
      const definition = TOOL_DEFINITIONS.find(
        (candidate) => candidate.name === "review_salt_code",
      );
      expect(
        definition?.outputValidationSchema.safeParse(invalidPayload).success,
      ).toBe(false);

      const stressText = [
        'import { Button } from "@salt-ds/core";',
        "export function Stress() {",
        "  return <>",
        ...Array.from(
          { length: 80 },
          (_, index) =>
            `    <Button href="/next-${index}" style={{ color: "#fff", padding: "4px" }}>Go</Button>`,
        ),
        "  </>;",
        "}",
      ].join("\n");
      const stressed = await client.callTool({
        name: "review_salt_code",
        arguments: {
          artifacts: Array.from({ length: 8 }, (_, index) => ({
            id: `stress-${index}.tsx`,
            language: "tsx",
            text: stressText,
          })),
          max_findings: 50,
        },
      });
      const stressedPayload = toolPayload(stressed) as {
        data: {
          results: Array<{ coverage: { returned_findings: number } }>;
        };
        coverage: {
          returned_findings: number;
          detected_findings: number;
          truncated: boolean;
          result_budget: { max_utf8_bytes: number };
        };
      };
      expect(
        Buffer.byteLength(JSON.stringify(stressed), "utf8"),
      ).toBeLessThanOrEqual(MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES);
      expect(stressedPayload.coverage.returned_findings).toBeLessThanOrEqual(
        50,
      );
      expect(
        stressedPayload.data.results.reduce(
          (total, entry) => total + entry.coverage.returned_findings,
          0,
        ),
      ).toBe(stressedPayload.coverage.returned_findings);
      expect(stressedPayload.coverage.result_budget.max_utf8_bytes).toBe(
        MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
      );

      const escapeHeavyIds = Array.from(
        { length: 8 },
        (_, index) => `${"\u0001".repeat(84)}xxxxx${index}`,
      );
      expect(
        escapeHeavyIds.map((id) =>
          Buffer.byteLength(JSON.stringify(id), "utf8"),
        ),
      ).toEqual(
        Array.from({ length: 8 }, () => MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES),
      );
      const escapeHeavy = await client.callTool({
        name: "review_salt_code",
        arguments: {
          artifacts: escapeHeavyIds.map((id) => ({
            id,
            language: "tsx",
            text: stressText,
          })),
          max_findings: 50,
        },
      });
      expect(escapeHeavy.isError).not.toBe(true);
      const escapeHeavyPayload = toolPayload(escapeHeavy) as {
        data: {
          results: Array<{
            findings: unknown[];
            coverage: {
              detected_findings: number;
              returned_findings: number;
              truncated: boolean;
            };
          }>;
        };
        coverage: {
          returned_findings: number;
          detected_findings: number;
          truncated: boolean;
          result_budget: {
            truncated: boolean;
            omissions: Array<{
              section: string;
              available: number;
              returned: number;
            }>;
          };
        };
      };
      expect(
        Buffer.byteLength(JSON.stringify(escapeHeavyPayload), "utf8"),
      ).toBeLessThanOrEqual(MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES);
      expect(
        Buffer.byteLength(JSON.stringify(escapeHeavy), "utf8"),
      ).toBeLessThanOrEqual(MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES);
      expect(escapeHeavyPayload.coverage.returned_findings).toBeLessThanOrEqual(
        50,
      );
      expect(escapeHeavyPayload.coverage.detected_findings).toBeGreaterThan(
        escapeHeavyPayload.coverage.returned_findings,
      );
      expect(escapeHeavyPayload.coverage.truncated).toBe(true);
      for (const result of escapeHeavyPayload.data.results) {
        expect(result.findings).toHaveLength(result.coverage.returned_findings);
        expect(result.coverage.returned_findings).toBeLessThanOrEqual(
          result.coverage.detected_findings,
        );
        expect(result.coverage.truncated).toBe(
          result.coverage.returned_findings < result.coverage.detected_findings,
        );
      }
      expect(
        escapeHeavyPayload.data.results.reduce(
          (total, entry) => total + entry.coverage.detected_findings,
          0,
        ),
      ).toBe(escapeHeavyPayload.coverage.detected_findings);
      expect(
        escapeHeavyPayload.data.results.reduce(
          (total, entry) => total + entry.coverage.returned_findings,
          0,
        ),
      ).toBe(escapeHeavyPayload.coverage.returned_findings);
      expect(escapeHeavyPayload.coverage.truncated).toBe(
        escapeHeavyPayload.coverage.returned_findings <
          escapeHeavyPayload.coverage.detected_findings,
      );
      expect(escapeHeavyPayload.coverage.result_budget.truncated).toBe(
        escapeHeavyPayload.coverage.truncated,
      );
      expect(
        escapeHeavyPayload.coverage.result_budget.omissions,
      ).toContainEqual({
        section: "findings",
        available: escapeHeavyPayload.coverage.detected_findings,
        returned: escapeHeavyPayload.coverage.returned_findings,
      });
    });
  }, 60_000);

  it("enforces strict input schemas over the real transport", async () => {
    await withProtocolClient(async (client) => {
      const invalidSearch = await client.callTool({
        name: "search_salt",
        arguments: { query: "Button", invented: true },
      });
      expect(invalidSearch.isError).toBe(true);

      const invalidInspection = await client.callTool({
        name: "inspect_salt_project",
        arguments: { evaluate_policy: false, include_policy_ir: true },
      });
      expect(invalidInspection.isError).toBe(true);

      for (const artifacts of [
        [],
        [{ id: "empty.tsx", language: "tsx", text: "" }],
        [{ id: "blank.tsx", language: "tsx", text: " \n\t" }],
        [
          {
            id: "\0".repeat(512),
            language: "javascript",
            text: "export {};",
          },
        ],
      ]) {
        const invalidReview = await client.callTool({
          name: "review_salt_code",
          arguments: { artifacts },
        });
        expect(invalidReview.isError).toBe(true);
      }
      for (const packageVersion of [" ", "^2.0.0", "workspace:^2.0.0"] ) {
        const invalidReview = await client.callTool({
          name: "review_salt_code",
          arguments: {
            artifacts: [
              { id: "version.tsx", language: "tsx", text: "export {};" },
            ],
            package_versions: { "@salt-ds/core": packageVersion },
          },
        });
        expect(invalidReview.isError).toBe(true);
      }
      for (const extraContext of [
        { project_context_handle: "not-a-context-handle" },
        {
          root_dir: REPO_ROOT,
          project_context_handle: "salt-project-context-v1.e30",
        },
      ]) {
        const invalidReview = await client.callTool({
          name: "review_salt_code",
          arguments: {
            artifacts: [
              { id: "context.tsx", language: "tsx", text: "export {};" },
            ],
            ...extraContext,
          },
        });
        expect(invalidReview.isError).toBe(true);
      }
    });
  });

  it("lists a curated manifest while exact linked records remain retrievable", async () => {
    await withProtocolClient(async (client) => {
      const manifestUri = catalogManifestResourceUri(
        runtimeContext.store.manifest,
      );
      const directPage = await directResourcePage(client);
      expect(directPage).toMatchObject({
        resources: [expect.objectContaining({ uri: manifestUri })],
      });
      expect(directPage.nextCursor).toBeUndefined();

      const resources = await client.listResources();
      expect(resources.nextCursor).toBeUndefined();
      expect(resources.resources.map((resource) => resource.uri)).toEqual([
        manifestUri,
      ]);

      const templates = await client.listResourceTemplates();
      expect(
        templates.resourceTemplates.map((template) => template.uriTemplate),
      ).toEqual(
        expect.arrayContaining([
          catalogRecordResourceTemplate(runtimeContext.store.manifest),
          projectPolicyResourceTemplate(),
        ]),
      );
      expect(templates.resourceTemplates).toHaveLength(2);

      const manifest = await client.readResource({ uri: manifestUri });
      expect(manifest.contents[0]).toEqual(
        expect.objectContaining({
          uri: manifestUri,
          mimeType: "application/json",
        }),
      );
      const manifestContent = manifest.contents[0];
      if (!manifestContent || !("text" in manifestContent)) {
        throw new Error("Catalog manifest did not return text content.");
      }
      const publicManifest = JSON.parse(manifestContent.text) as Record<
        string,
        unknown
      >;
      expect(publicManifest).toMatchObject({
        server_version: getSaltMcpPackageManifest().version,
        catalog_version: runtimeContext.store.manifest.catalog_version,
        semantic_digest: runtimeContext.store.manifest.semantic_digest,
        negotiated_mcp_protocol_revision:
          SALT_MCP_PREFERRED_LEGACY_PROTOCOL_VERSION,
      });
      expect((publicManifest.families as unknown[]).length).toBe(
        canonicalCatalogRuntimeFamilies().length,
      );

      const representativeUris = canonicalCatalogRuntimeFamilies().map(
        (family) => {
          const record = runtimeContext.store.getFamily(family)[0];
          if (!record) throw new Error(`Missing '${family}' fixture record.`);
          return catalogRecordResourceUri(
            runtimeContext.store.manifest,
            family,
            record.id,
          );
        },
      );
      const representativeReads = await Promise.all(
        representativeUris.map((uri) => client.readResource({ uri })),
      );
      expect(representativeReads).toHaveLength(
        canonicalCatalogRuntimeFamilies().length,
      );
      await expect(
        client.readResource({ uri: "salt://capabilities/manifest" }),
      ).rejects.toThrow();
    });
  }, 60_000);

  it("completes retained resource-template arguments through the protocol", async () => {
    await withProtocolClient(async (client) => {
      const uri = catalogRecordResourceTemplate(runtimeContext.store.manifest);
      const families = await client.complete({
        ref: { type: "ref/resource", uri },
        argument: { name: "family", value: "comp" },
      });
      expect(families.completion.values).toContain("components");

      const ids = await client.complete({
        ref: { type: "ref/resource", uri },
        argument: { name: "id", value: "component.but" },
        context: { arguments: { family: "components" } },
      });
      expect(ids.completion.values).toContain("component.button");

      const evidenceIds = runtimeContext.store
        .getFamily("evidence")
        .map((record) => record.id);
      const allEvidence = await client.complete({
        ref: { type: "ref/resource", uri },
        argument: { name: "id", value: "" },
        context: { arguments: { family: "evidence" } },
      });
      expect(allEvidence.completion.total).toBe(evidenceIds.length);
      expect(allEvidence.completion.hasMore).toBe(true);
      expect(allEvidence.completion.values).toContain(evidenceIds[25]);
      expect(allEvidence.completion.values).toContain(evidenceIds[26]);
      expect(allEvidence.completion.values).not.toContain(evidenceIds[103]);

      const afterOneHundred = await client.complete({
        ref: { type: "ref/resource", uri },
        argument: { name: "id", value: evidenceIds[103] ?? "" },
        context: { arguments: { family: "evidence" } },
      });
      expect(afterOneHundred.completion).toMatchObject({
        values: [evidenceIds[103]],
        total: 1,
        hasMore: false,
      });
    });
  });

  it("advertises immutable resources without subscriptions or list changes", async () => {
    await withProtocolClient(async (client) => {
      expect(client.getServerCapabilities()?.resources).toEqual(
        expect.objectContaining({
          subscribe: false,
          listChanged: false,
        }),
      );
    });
  });

  it("rejects malformed and noncanonical aliases as resource misses", async () => {
    await withProtocolClient(async (client) => {
      const canonical = catalogRecordResourceUri(
        runtimeContext.store.manifest,
        "component",
        "Button",
      );
      const aliases = [
        canonical.replace(/\/Button$/u, "/%42utton"),
        canonical.replace(/\/Button$/u, "/%ZZ"),
      ];

      for (const uri of aliases) {
        await expect(client.readResource({ uri })).rejects.toMatchObject({
          code: -32602,
          data: { uri },
        });
      }
    });
  });

  it("keeps instructions bounded and non-prescriptive", () => {
    const instructions = buildSaltMcpInstructions(runtimeContext);

    expect(Buffer.byteLength(instructions, "utf8")).toBeLessThanOrEqual(
      MAX_INSTRUCTIONS_UTF8_BYTES,
    );
    expect(instructions).not.toMatch(
      /create_salt_ui|migrate_to_salt|salt_workflow_v1|post_action|ask_user|implementation_ready|canonical_complete|exact_request_safe|finish_without_changes|authoritative next step/iu,
    );
    expect(instructions).toContain("never edits files");
  });
});
