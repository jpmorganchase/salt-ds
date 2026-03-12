import { describe, expect, it } from "vitest";
import { createSaltMcpServer } from "../server/createServer.js";
import { TOOL_DEFINITIONS } from "../tools/index.js";
import { withRegistryDir, writeBaseArtifacts } from "./registryTestUtils.js";

const EXPECTED_TOOL_NAMES = [
  "compare_options",
  "compare_versions",
  "discover_salt",
  "get_changes",
  "get_component",
  "get_composition_recipe",
  "get_country_symbol",
  "get_country_symbols",
  "get_examples",
  "get_foundation",
  "get_guide",
  "get_icon",
  "get_icons",
  "get_package",
  "get_page",
  "get_pattern",
  "get_related_entities",
  "get_token",
  "list_foundations",
  "list_salt_catalog",
  "recommend_component",
  "recommend_fix_recipes",
  "recommend_tokens",
  "search_api_surface",
  "search_component_capabilities",
  "search_salt_docs",
  "suggest_migration",
  "validate_salt_usage",
].sort();

const EXPECTED_DEFAULT_TOOL_ORDER = [
  "discover_salt",
  "recommend_component",
  "get_composition_recipe",
  "get_component",
  "get_examples",
  "get_foundation",
  "recommend_tokens",
  "recommend_fix_recipes",
  "compare_versions",
  "search_salt_docs",
];

describe("createSaltMcpServer", () => {
  it("keeps the default consumer workflow tools first in metadata order", () => {
    expect(
      TOOL_DEFINITIONS.slice(0, EXPECTED_DEFAULT_TOOL_ORDER.length).map(
        (definition) => definition.name,
      ),
    ).toEqual(EXPECTED_DEFAULT_TOOL_ORDER);
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
          )._registeredTools.search_salt_docs?.description,
        ).toContain("Search Salt package");
      },
    );
  });
});
