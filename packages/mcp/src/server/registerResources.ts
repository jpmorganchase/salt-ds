import {
  type McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  buildComponentContextMarkdownBridge,
  buildContextCoverageAudit,
  buildContextCoverageGapCatalog,
  buildContextPackBundleReleaseGate,
  buildGeneratedContextManifestHealth,
  buildSaltAiEvidenceClosureReport,
  buildSaltAiSetupSummary,
  selectDefaultContextPackFoundationTokenGroups,
} from "@salt-ds/semantic-core";
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
  buildContextRegistryRef,
  buildContextResourceGenerator,
  buildMcpComponentContext,
  buildMcpContextPack,
  buildMcpFoundationContext,
  buildMcpPatternContext,
} from "./contextPack.js";
import {
  getSaltMcpRuntimeMetadata,
  SALT_MCP_AI_SETUP_URI,
  SALT_MCP_AI_EVIDENCE_CLOSURE_URI,
  SALT_MCP_CAPABILITY_MANIFEST_URI,
  SALT_MCP_CATALOG_CANDIDATES_TEMPLATE_URI,
  SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
  SALT_MCP_CATALOG_FAMILY_TEMPLATE_URI,
  SALT_MCP_CATALOG_MANIFEST_URI,
  SALT_MCP_CONTEXT_COMPONENT_MARKDOWN_TEMPLATE_URI,
  SALT_MCP_CONTEXT_COMPONENT_TEMPLATE_URI,
  SALT_MCP_CONTEXT_COVERAGE_URI,
  SALT_MCP_CONTEXT_GAP_CATALOG_URI,
  SALT_MCP_CONTEXT_FOUNDATION_TEMPLATE_URI,
  SALT_MCP_CONTEXT_HEALTH_URI,
  SALT_MCP_CONTEXT_MANIFEST_URI,
  SALT_MCP_CONTEXT_PACK_URI,
  SALT_MCP_CONTEXT_PATTERN_TEMPLATE_URI,
  SALT_MCP_CONTEXT_RELEASE_GATE_URI,
} from "./serverMetadata.js";

export function registerSaltResources(
  server: McpServer,
  registry: SaltRegistry,
) {
  const runtimeMetadata = getSaltMcpRuntimeMetadata(registry);
  const { manifest: contextManifest, bundle: contextBundle } =
    buildMcpContextPack(registry);
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
  const contextManifestText = JSON.stringify(contextManifest, null, 2);
  const contextCoverage = buildContextCoverageAudit({
    registry,
    generated_at: registry.generated_at,
    generator: buildContextResourceGenerator(registry),
  });
  const contextCoverageText = JSON.stringify(contextCoverage, null, 2);
  const contextGapCatalogText = JSON.stringify(
    buildContextCoverageGapCatalog({
      audit: contextCoverage,
      generated_at: registry.generated_at,
    }),
    null,
    2,
  );
  const contextBundleText = JSON.stringify(contextBundle, null, 2);
  const contextHealth = buildGeneratedContextManifestHealth({
    manifest_path: SALT_MCP_CONTEXT_MANIFEST_URI,
    manifest: contextManifest,
    registry: buildContextRegistryRef(registry),
    output_exists_by_path: Object.fromEntries(
      contextManifest.entries.map((entry) => [entry.output_path, true]),
    ),
    output_checks_by_path: Object.fromEntries(
      contextManifest.entries.map((entry) => [
        entry.output_path,
        {
          outputExists: true,
          outputStatus: "current",
          outputContract: entry.contract,
          mismatches: [],
          missing: [],
        },
      ]),
    ),
  });
  const contextHealthText = JSON.stringify(contextHealth, null, 2);
  const contextReleaseGateText = JSON.stringify(
    buildContextPackBundleReleaseGate({
      bundle: contextBundle,
      registry,
      artifact_path: SALT_MCP_CONTEXT_PACK_URI,
    }),
    null,
    2,
  );
  const aiSetupText = JSON.stringify(
    buildSaltAiSetupSummary({
      root_dir: "mcp-resource",
      policy_mode: "none",
      repo_instructions_path: null,
      host_adapters: [],
      ui_verify_command: null,
      generated_context: contextHealth,
      include_release_gate: true,
    }),
    null,
    2,
  );
  const aiEvidenceClosureText = JSON.stringify(
    buildSaltAiEvidenceClosureReport({
      registry,
      generated_at: registry.generated_at,
      generator: buildContextResourceGenerator(registry),
      generated_context: contextHealth,
    }),
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
    "salt_context_manifest",
    SALT_MCP_CONTEXT_MANIFEST_URI,
    {
      title: "Salt Generated Context Manifest",
      description:
        "Machine-readable manifest for Salt generated context resources.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: contextManifestText,
        },
      ],
    }),
  );

  server.registerResource(
    "salt_context_health",
    SALT_MCP_CONTEXT_HEALTH_URI,
    {
      title: "Salt Generated Context Health",
      description:
        "Machine-readable health summary for Salt generated context resources.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: contextHealthText,
        },
      ],
    }),
  );

  server.registerResource(
    "salt_context_coverage",
    SALT_MCP_CONTEXT_COVERAGE_URI,
    {
      title: "Salt Generated Context Coverage Audit",
      description:
        "Machine-readable audit of source-backed component, pattern, and foundation context coverage.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: contextCoverageText,
        },
      ],
    }),
  );

  server.registerResource(
    "salt_context_gap_catalog",
    SALT_MCP_CONTEXT_GAP_CATALOG_URI,
    {
      title: "Salt Generated Context Gap Catalog",
      description:
        "Machine-readable cause-coded docs and registry gaps for Salt generated context coverage.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: contextGapCatalogText,
        },
      ],
    }),
  );

  server.registerResource(
    "salt_context_pack",
    SALT_MCP_CONTEXT_PACK_URI,
    {
      title: "Salt Generated Context Pack Bundle",
      description:
        "Machine-readable generated context pack bundle that hosts can persist to durable files.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: contextBundleText,
        },
      ],
    }),
  );

  server.registerResource(
    "salt_context_release_gate",
    SALT_MCP_CONTEXT_RELEASE_GATE_URI,
    {
      title: "Salt Generated Context Release Gate",
      description:
        "Machine-readable release gate for the MCP generated context pack bundle.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: contextReleaseGateText,
        },
      ],
    }),
  );

  server.registerResource(
    "salt_ai_setup",
    SALT_MCP_AI_SETUP_URI,
    {
      title: "Salt AI Setup State",
      description:
        "Machine-readable fact-free Salt AI setup state for MCP hosts.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: aiSetupText,
        },
      ],
    }),
  );

  server.registerResource(
    "salt_ai_evidence_closure",
    SALT_MCP_AI_EVIDENCE_CLOSURE_URI,
    {
      title: "Salt AI Evidence Closure Report",
      description:
        "Machine-readable final-pass Salt AI evidence closure and unsupported-surface inventory.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: aiEvidenceClosureText,
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

  server.registerResource(
    "salt_context_component",
    new ResourceTemplate(SALT_MCP_CONTEXT_COMPONENT_TEMPLATE_URI, {
      list: undefined,
      complete: {
        name: (value) =>
          registry.components
            .map((component) => component.name)
            .filter((name) =>
              name.toLowerCase().startsWith(value.trim().toLowerCase()),
            )
            .slice(0, 25),
      },
    }),
    {
      title: "Salt Component Context",
      description:
        "Schema-shaped static component context from semantic-core registry evidence.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const rawName = typeof variables.name === "string" ? variables.name : "";
      const context = buildMcpComponentContext(
        registry,
        decodeURIComponent(rawName),
      );

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(context, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "salt_context_component_markdown",
    new ResourceTemplate(SALT_MCP_CONTEXT_COMPONENT_MARKDOWN_TEMPLATE_URI, {
      list: undefined,
      complete: {
        name: (value) =>
          registry.components
            .map((component) => component.name)
            .filter((name) =>
              name.toLowerCase().startsWith(value.trim().toLowerCase()),
            )
            .slice(0, 25),
      },
    }),
    {
      title: "Salt Component Context Markdown",
      description:
        "Evidence-preserving markdown bridge derived from semantic-core component context.",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const rawName = typeof variables.name === "string" ? variables.name : "";
      const context = buildMcpComponentContext(
        registry,
        decodeURIComponent(rawName),
      );
      const bridge = buildComponentContextMarkdownBridge(context);

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "text/markdown",
            text: bridge.text,
          },
        ],
      };
    },
  );

  server.registerResource(
    "salt_context_pattern",
    new ResourceTemplate(SALT_MCP_CONTEXT_PATTERN_TEMPLATE_URI, {
      list: undefined,
      complete: {
        name: (value) =>
          registry.patterns
            .map((pattern) => pattern.name)
            .filter((name) =>
              name.toLowerCase().startsWith(value.trim().toLowerCase()),
            )
            .slice(0, 25),
      },
    }),
    {
      title: "Salt Pattern Context",
      description:
        "Schema-shaped static pattern context from semantic-core registry evidence.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const rawName = typeof variables.name === "string" ? variables.name : "";
      const context = buildMcpPatternContext(
        registry,
        decodeURIComponent(rawName),
      );

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(context, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "salt_context_foundation",
    new ResourceTemplate(SALT_MCP_CONTEXT_FOUNDATION_TEMPLATE_URI, {
      list: undefined,
      complete: {
        category: (value) =>
          selectDefaultContextPackFoundationTokenGroups(registry)
            .map((group) => group.category)
            .filter((category) =>
              category.toLowerCase().startsWith(value.trim().toLowerCase()),
            )
            .slice(0, 25),
      },
    }),
    {
      title: "Salt Foundation Token Context",
      description:
        "Schema-shaped static foundation token context from semantic-core registry evidence.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const rawCategory =
        typeof variables.category === "string" ? variables.category : "";
      const context = buildMcpFoundationContext(
        registry,
        decodeURIComponent(rawCategory),
      );

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(context, null, 2),
          },
        ],
      };
    },
  );
}
