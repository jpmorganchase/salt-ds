import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { assert, getInstalledMcpBin, pathExists } from "./shared.mjs";
import { SmokeStdioClientTransport } from "./transport.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const offlineNetworkGuardUrl = pathToFileURL(
  path.join(__dirname, "offline-network-guard.mjs"),
).href;

const V1_TOOL_NAMES = [
  "get_salt_project_context",
  "get_salt_reference",
  "review_salt_ui",
  "create_salt_ui",
  "migrate_to_salt",
];

const CAPABILITY_MANIFEST_URI = "salt://capabilities/manifest";
const CATALOG_MANIFEST_URI = "salt://catalog/manifest";
const CATALOG_ENTITY_TEMPLATE_URI = "salt://catalog/entity/{name}";

function parseResourceText(result, label) {
  const text = result?.contents?.[0]?.text;
  assert(typeof text === "string" && text.length > 0, `${label} was empty.`);
  return JSON.parse(text);
}

function getToolPayload(result, label) {
  assert(result?.isError !== true, `${label} returned an MCP error.`);
  if (result?.structuredContent) {
    return result.structuredContent;
  }

  const text = result?.content?.find((part) => part.type === "text")?.text;
  assert(typeof text === "string" && text.length > 0, `${label} was empty.`);
  return JSON.parse(text);
}

function assertCompactMcpWorkflowPayload(payload, workflow, message) {
  assert(
    payload?.contract === "salt_workflow_v1" &&
      payload?.workflow === workflow &&
      typeof payload?.status === "string" &&
      ["success", "partial", "blocked", "failed"].includes(payload.status) &&
      payload?.request &&
      typeof payload.request === "object" &&
      payload?.safety &&
      typeof payload.safety === "object" &&
      typeof payload?.safety?.canonical_complete === "boolean" &&
      typeof payload?.safety?.exact_request_safe === "boolean" &&
      Array.isArray(payload?.safety?.blocking_reasons) &&
      payload?.action &&
      typeof payload.action === "object" &&
      typeof payload?.action?.kind === "string" &&
      Array.isArray(payload?.action?.rule_ids) &&
      (payload?.action?.post_action === null ||
        typeof payload?.action?.post_action === "object") &&
      Array.isArray(payload?.questions) &&
      payload?.evidence &&
      typeof payload.evidence === "object" &&
      payload?.internal_limitations &&
      typeof payload.internal_limitations === "object" &&
      typeof payload?.summary === "string" &&
      payload.summary.length > 0,
    message,
  );
  assert(
    !("next_required_action" in payload) &&
      !("allowed_next_actions" in payload) &&
      !("recipe" in payload),
    `${message} Legacy duplicate action fields were present.`,
  );
}

export async function runMcpWorkflowCoverage(
  installRoot,
  existingSaltRoot,
  nonSaltRoot,
) {
  console.log(
    "Checking v1 workflow coverage through the installed MCP server...",
  );
  const installedMcpBinPath = getInstalledMcpBin(installRoot);
  assert(
    await pathExists(installedMcpBinPath),
    `Expected installed MCP bin at ${installedMcpBinPath}.`,
  );

  const client = new Client(
    { name: "salt-consumer-smoke", version: "0.0.0" },
    { capabilities: {} },
  );
  const transport = new SmokeStdioClientTransport({
    command: process.execPath,
    args: ["--import", offlineNetworkGuardUrl, installedMcpBinPath, "serve"],
    cwd: existingSaltRoot,
  });

  try {
    await client.connect(transport);

    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);
    assert(
      JSON.stringify(toolNames) === JSON.stringify(V1_TOOL_NAMES),
      `Installed MCP server advertised ${toolNames.join(", ")} instead of the v1 tool contract.`,
    );
    const resources = await client.listResources();
    const resourceUris = resources.resources.map((resource) => resource.uri);
    assert(
      JSON.stringify(resourceUris.sort()) ===
        JSON.stringify([CAPABILITY_MANIFEST_URI, CATALOG_MANIFEST_URI].sort()),
      `Installed MCP server advertised unexpected resource URIs: ${resourceUris.join(", ")}.`,
    );

    const resourceTemplates = await client.listResourceTemplates();
    const templateUris = resourceTemplates.resourceTemplates.map(
      (resourceTemplate) => resourceTemplate.uriTemplate,
    );
    assert(
      JSON.stringify(templateUris.sort()) ===
        JSON.stringify([CATALOG_ENTITY_TEMPLATE_URI].sort()),
      `Installed MCP server advertised unexpected resource templates: ${templateUris.join(", ")}.`,
    );

    const capabilityManifest = parseResourceText(
      await client.readResource({ uri: CAPABILITY_MANIFEST_URI }),
      CAPABILITY_MANIFEST_URI,
    );
    assert(
      JSON.stringify(
        capabilityManifest?.public_surface?.default_surface_ids,
      ) === JSON.stringify(V1_TOOL_NAMES),
      "Capability manifest did not freeze the v1 public tool order.",
    );
    assert(
      capabilityManifest?.support_tools?.default_exposed === true &&
        JSON.stringify(capabilityManifest?.support_tools?.tool_ids) ===
          JSON.stringify(["get_salt_reference"]) &&
        capabilityManifest?.capabilities?.repo_bootstrap === false,
      "Capability manifest did not describe the read-only v1 support and governance story.",
    );

    const catalogManifest = parseResourceText(
      await client.readResource({ uri: CATALOG_MANIFEST_URI }),
      CATALOG_MANIFEST_URI,
    );
    assert(
      catalogManifest?.contract_version === "salt_create_catalog_v1",
      "Catalog manifest did not return the v1 create catalog contract.",
    );

    const entityResource = parseResourceText(
      await client.readResource({ uri: "salt://catalog/entity/Button" }),
      "salt://catalog/entity/Button",
    );
    assert(
      JSON.stringify(entityResource).includes("Button"),
      "Catalog entity resource did not resolve Button.",
    );

    const contextResult = await client.callTool({
      name: "get_salt_project_context",
      arguments: {
        root_dir: ".",
      },
    });
    const contextPayload = getToolPayload(
      contextResult,
      "get_salt_project_context",
    );
    assert(
      contextPayload?.workflow?.id === "get_salt_project_context" &&
        contextPayload?.result?.transport?.canonical_transport === "mcp" &&
        contextPayload?.result?.repo_signals?.salt_team_config_found === true &&
        contextPayload?.result &&
        !Object.hasOwn(contextPayload.result, "context_id") &&
        contextPayload?.artifacts?.summary?.policy_note &&
        !Object.hasOwn(
          contextPayload.artifacts.summary.retry_with,
          "context_id",
        ) &&
        !contextPayload?.artifacts?.summary?.bootstrap_requirement,
      "Installed MCP server did not return the v1 project-context payload.",
    );

    const entityReferenceResult = await client.callTool({
      name: "get_salt_reference",
      arguments: {
        names: ["Button"],
      },
    });
    const entityReferencePayload = getToolPayload(
      entityReferenceResult,
      "get_salt_reference entity",
    );
    assert(
      entityReferencePayload?.decision?.status === "results" &&
        entityReferencePayload?.found_count >= 1,
      "Installed MCP server did not resolve an entity through get_salt_reference.",
    );

    for (const reference of [
      {
        entityType: "icon",
        name: "WorkflowIcon",
        identityKey: "name",
        canonicalSource: "/salt/components/icon",
      },
      {
        entityType: "country_symbol",
        name: "US",
        identityKey: "code",
        canonicalSource: "/salt/components/country-symbol",
      },
    ]) {
      const referenceResult = await client.callTool({
        name: "get_salt_reference",
        arguments: {
          names: [reference.name],
          entity_type: reference.entityType,
        },
      });
      const referencePayload = getToolPayload(
        referenceResult,
        `get_salt_reference ${reference.entityType}`,
      );
      const resolvedReference = referencePayload?.results?.[0]?.result;
      assert(
        referencePayload?.decision?.status === "results" &&
          referencePayload?.found_count === 1 &&
          resolvedReference?.decision?.status === "found" &&
          resolvedReference?.entity_type === reference.entityType &&
          resolvedReference?.entity?.[reference.identityKey] ===
            reference.name &&
          Array.isArray(referencePayload?.sources) &&
          referencePayload.sources.some(
            (source) =>
              source?.kind === "site" &&
              source?.original === reference.canonicalSource,
          ),
        `Installed MCP server did not resolve ${reference.name} as a source-backed ${reference.entityType} reference.`,
      );
    }

    const examplesReferenceResult = await client.callTool({
      name: "get_salt_reference",
      arguments: {
        names: ["Button"],
        entity_type: "component",
        include: ["examples"],
        include_starter_code: true,
      },
    });
    const examplesReferencePayload = getToolPayload(
      examplesReferenceResult,
      "get_salt_reference examples",
    );
    const examplesEntity =
      examplesReferencePayload?.results?.[0]?.result?.entity;
    assert(
      examplesReferencePayload?.decision?.status === "results" &&
        (examplesEntity?.examples?.length > 0 ||
          examplesEntity?.starter_code?.length > 0),
      "Installed MCP server did not resolve examples through get_salt_reference.",
    );

    const createResult = await client.callTool({
      name: "create_salt_ui",
      arguments: {
        query: "link to another page from a toolbar action",
        include_starter_code: true,
      },
    });
    assertCompactMcpWorkflowPayload(
      getToolPayload(createResult, "create_salt_ui"),
      "create",
      "Installed MCP server did not return a stable create_salt_ui payload.",
    );

    const reviewResult = await client.callTool({
      name: "review_salt_ui",
      arguments: {
        code: [
          'import { Button } from "@salt-ds/core";',
          "",
          "export function Demo() {",
          '  return <Button href="/next">Go</Button>;',
          "}",
        ].join("\n"),
        framework: "react",
        package_version: "2.0.0",
      },
    });
    assertCompactMcpWorkflowPayload(
      getToolPayload(reviewResult, "review_salt_ui"),
      "review",
      "Installed MCP server did not return a stable review_salt_ui payload.",
    );

    const migrateResult = await client.callTool({
      name: "migrate_to_salt",
      arguments: {
        root_dir: nonSaltRoot,
        query:
          "Build a sidebar with vertical navigation, a main content area, a toolbar, and a modal dialog for confirmation with loading and error states.",
      },
    });
    assertCompactMcpWorkflowPayload(
      getToolPayload(migrateResult, "migrate_to_salt"),
      "migrate",
      "Installed MCP server did not return a stable migrate_to_salt payload.",
    );
  } catch (error) {
    const stderrOutput = transport.stderr.trim();
    if (stderrOutput.length > 0) {
      throw new Error(
        `Installed MCP server failed during smoke test.\nstderr:\n${stderrOutput}\n\n${error instanceof Error ? (error.stack ?? error.message) : error}`,
      );
    }
    throw error;
  } finally {
    await client.close();
  }
}
