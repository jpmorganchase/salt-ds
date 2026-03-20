import { describe, expect, it } from "vitest";
import { createSaltMcpServer } from "../server/createServer.js";
import {
  buildSaltMcpInstructions,
  buildSaltMcpServerInfo,
} from "../server/serverMetadata.js";
import { TOOL_DEFINITIONS } from "../tools/index.js";
import {
  GENERATED_AT,
  VERSION,
  withRegistryDir,
  writeBaseArtifacts,
} from "./registryTestUtils.js";

const EXPECTED_TOOL_NAMES = [
  "analyze_salt_code",
  "choose_salt_solution",
  "compare_salt_versions",
  "discover_salt",
  "get_salt_entity",
  "get_salt_examples",
  "translate_ui_to_salt",
].sort();

const EXPECTED_DEFAULT_TOOL_ORDER = [
  "discover_salt",
  "translate_ui_to_salt",
  "choose_salt_solution",
  "get_salt_entity",
  "get_salt_examples",
  "analyze_salt_code",
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

  it("keeps the broad router and lookup schemas intentionally small", () => {
    const discoverTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "discover_salt",
    );
    const chooseTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "choose_salt_solution",
    );
    const translateTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "translate_ui_to_salt",
    );
    const lookupTool = TOOL_DEFINITIONS.find(
      (definition) => definition.name === "get_salt_entity",
    );

    expect(Object.keys(discoverTool?.inputSchema ?? {})).toEqual([
      "query",
      "area",
      "package",
      "status",
      "related_to",
      "view",
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
    expect(Object.keys(lookupTool?.inputSchema ?? {})).toEqual([
      "entity_type",
      "name",
      "query",
      "package",
      "status",
      "include",
      "include_related",
      "include_starter_code",
      "max_results",
      "include_deprecated",
      "view",
    ]);
    expect(discoverTool?.description).toContain(
      "Do not use this for direct recommendation or known-entity lookup.",
    );
    expect(discoverTool?.description).toContain(
      "project-specific conventions belong in separate project conventions",
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
    expect(lookupTool?.description).toContain(
      "Do not use this for broad discovery or recommendation/comparison.",
    );
  });

  it("registers the full Salt MCP tool surface", async () => {
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
        expect(
          (
            server as unknown as {
              _registeredTools: Record<string, { description?: string }>;
            }
          )._registeredTools.discover_salt?.description,
        ).toContain(
          "Use this for broad, ambiguous, or exploratory Salt requests",
        );
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
          "Only call tools that are actually present in the current session tool list.",
        );
      },
    );
  });
});
