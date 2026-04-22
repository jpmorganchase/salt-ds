import {
  type McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  buildCreateCatalogSupportManifest,
  inspectCreateCatalogQuery,
  listCreateCatalogEntityNames,
  listCreateCatalogFamilies,
  lookupCreateCatalogEntity,
  lookupCreateCatalogFamily,
} from "@salt-ds/semantic-core/tools/createCatalogSupport";
import type { SaltRegistry } from "../types.js";
import {
  getSaltMcpRuntimeMetadata,
  SALT_MCP_CAPABILITY_MANIFEST_URI,
  SALT_MCP_CATALOG_CANDIDATES_TEMPLATE_URI,
  SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
  SALT_MCP_CATALOG_FAMILY_TEMPLATE_URI,
  SALT_MCP_CATALOG_MANIFEST_URI,
} from "./serverMetadata.js";

export function registerSaltResources(
  server: McpServer,
  registry: SaltRegistry,
) {
  const runtimeMetadata = getSaltMcpRuntimeMetadata(registry);
  const manifestText = JSON.stringify(
    runtimeMetadata.capability_manifest,
    null,
    2,
  );
  const catalogManifestText = JSON.stringify(
    {
      ...buildCreateCatalogSupportManifest(),
      resources: {
        manifest_uri: SALT_MCP_CATALOG_MANIFEST_URI,
        entity_template_uri: SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
        candidates_template_uri: SALT_MCP_CATALOG_CANDIDATES_TEMPLATE_URI,
        family_template_uri: SALT_MCP_CATALOG_FAMILY_TEMPLATE_URI,
      },
    },
    null,
    2,
  );

  server.registerResource(
    "salt_capability_manifest",
    SALT_MCP_CAPABILITY_MANIFEST_URI,
    {
      title: "Salt Capability Manifest",
      description:
        "Machine-readable Salt MCP capability and contract manifest.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: manifestText,
        },
      ],
    }),
  );

  server.registerResource(
    "salt_catalog_manifest",
    SALT_MCP_CATALOG_MANIFEST_URI,
    {
      title: "Salt Catalog Manifest",
      description:
        "Machine-readable Salt retrieval catalog support contract and resource map.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: catalogManifestText,
        },
      ],
    }),
  );

  server.registerResource(
    "salt_catalog_entity",
    new ResourceTemplate(SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI, {
      list: undefined,
      complete: {
        name: (value) =>
          listCreateCatalogEntityNames(registry)
            .filter((name) =>
              name.toLowerCase().startsWith(value.trim().toLowerCase()),
            )
            .slice(0, 25),
      },
    }),
    {
      title: "Salt Catalog Entity",
      description:
        "Resolve a canonical Salt component or pattern by name, alias, or route slug.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const rawName = typeof variables.name === "string" ? variables.name : "";
      const entitySummary = lookupCreateCatalogEntity(
        registry,
        decodeURIComponent(rawName),
      );

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(entitySummary, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "salt_catalog_candidates",
    new ResourceTemplate(SALT_MCP_CATALOG_CANDIDATES_TEMPLATE_URI, {
      list: undefined,
    }),
    {
      title: "Salt Catalog Candidates",
      description:
        "Inspect retrieval-ranked Salt candidates for a create-style prompt.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const rawQuery =
        typeof variables.query === "string" ? variables.query : "";
      const querySummary = inspectCreateCatalogQuery(registry, {
        query: decodeURIComponent(rawQuery),
      });

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(querySummary, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "salt_catalog_family",
    new ResourceTemplate(SALT_MCP_CATALOG_FAMILY_TEMPLATE_URI, {
      list: undefined,
      complete: {
        family: (value) =>
          listCreateCatalogFamilies(registry)
            .filter((family) =>
              family.toLowerCase().startsWith(value.trim().toLowerCase()),
            )
            .slice(0, 25),
      },
    }),
    {
      title: "Salt Catalog Family",
      description:
        "Inspect a Salt category or family to browse related components and patterns.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const rawFamily =
        typeof variables.family === "string" ? variables.family : "";
      const familySummary = lookupCreateCatalogFamily(
        registry,
        decodeURIComponent(rawFamily),
      );

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(familySummary, null, 2),
          },
        ],
      };
    },
  );
}
