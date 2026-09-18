import process from "node:process";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import {
  offlineNetworkGuardUrl,
  runOfflineNetworkGuardSelfTest,
} from "./offline-network-probe.mjs";
import { assert, getInstalledMcpBin, pathExists } from "./shared.mjs";

const TOOL_NAMES = [
  "search_salt",
  "inspect_salt_project",
  "review_salt_code",
];
const REMOVED_TOOL_NAMES = [
  "create_salt_ui",
  "migrate_to_salt",
  "get_salt_project_context",
  "get_salt_reference",
  "review_salt_ui",
];
const MAX_DISCOVERY_BYTES = 16 * 1024;
const MAX_RESULT_BYTES = 64 * 1024;

function transport(binPath, cwd, roots = []) {
  return new StdioClientTransport({
    command: process.execPath,
    args: [
      "--import",
      offlineNetworkGuardUrl,
      binPath,
      "serve",
      ...roots.flatMap((root) => ["--root", root]),
    ],
    cwd,
    stderr: "pipe",
  });
}

function currentClient(name) {
  return new Client(
    { name, version: "1.0.0" },
    {
      enforceStrictCapabilities: true,
      versionNegotiation: { mode: { pin: "2026-07-28" } },
    },
  );
}

function payload(result, label) {
  assert(result?.isError !== true, label + " returned a tool error.");
  assert(
    result?.structuredContent &&
      result.content?.some(
        (entry) =>
          entry.type === "text" &&
          typeof entry.text === "string" &&
          entry.text.length > 0,
      ),
    label + " omitted structured content or bounded text.",
  );
  assert(
    Buffer.byteLength(JSON.stringify(result), "utf8") <= MAX_RESULT_BYTES,
    label + " exceeded the result budget.",
  );
  return result.structuredContent;
}

async function mustReject(client, request, label) {
  let rejected = false;
  try {
    rejected = (await client.callTool(request))?.isError === true;
  } catch {
    rejected = true;
  }
  assert(rejected, "Installed MCP accepted " + label + ".");
}

async function verifyLegacyAndNoRoot(binPath, cwd) {
  const legacy = new Client(
    { name: "salt-consumer-legacy", version: "1.0.0" },
    { versionNegotiation: { mode: "legacy" } },
  );
  let legacyRejected = false;
  try {
    await legacy.connect(transport(binPath, cwd));
  } catch (error) {
    legacyRejected = /unsupported.*protocol|2026-07-28/iu.test(String(error));
  } finally {
    await legacy.close().catch(() => {});
  }
  assert(legacyRejected, "Installed MCP accepted a 2025-era opening.");

  const noRoot = currentClient("salt-consumer-no-root");
  try {
    await noRoot.connect(transport(binPath, cwd));
    const search = await noRoot.callTool({
      name: "search_salt",
      arguments: { query: "Button", limit: 1 },
    });
    assert(
      search.isError !== true &&
        search.structuredContent?.contract === "salt-mcp-search-result/1",
      "Static knowledge required an implicit project root.",
    );
    const inspection = await noRoot.callTool({
      name: "inspect_salt_project",
      arguments: {},
    });
    assert(
      inspection.isError === true &&
        inspection.content?.some(
          (entry) =>
            entry.type === "text" &&
            /--root|projectRoots/iu.test(entry.text),
        ),
      "Project inspection without a root did not fail actionably.",
    );
  } finally {
    await noRoot.close();
  }
}

export async function runMcpWorkflowCoverage(
  installRoot,
  exactSaltRoot,
  nonSaltRoot,
  expectedModuleFingerprint,
) {
  console.log("Checking the installed clean MCP v1 surface offline...");
  runOfflineNetworkGuardSelfTest();
  const binPath = getInstalledMcpBin(installRoot);
  assert(await pathExists(binPath), "Installed MCP binary is missing.");
  await verifyLegacyAndNoRoot(binPath, exactSaltRoot);

  const client = currentClient("salt-consumer-smoke");
  const stdio = transport(binPath, exactSaltRoot, [
    exactSaltRoot,
    nonSaltRoot,
  ]);
  let stderr = "";
  stdio.stderr?.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  try {
    await client.connect(stdio);
    assert(
      client.getProtocolEra() === "modern" &&
        client.getNegotiatedProtocolVersion() === "2026-07-28" &&
        client.getServerVersion()?.name === "@salt-ds/mcp",
      "Installed MCP did not negotiate its current server identity.",
    );

    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);
    assert(
      JSON.stringify(toolNames) === JSON.stringify(TOOL_NAMES),
      "Installed MCP advertised an unexpected tool list.",
    );
    for (const tool of tools.tools) {
      assert(
        tool.annotations?.readOnlyHint === true &&
          tool.annotations?.destructiveHint === false &&
          tool.annotations?.idempotentHint === true &&
          tool.annotations?.openWorldHint === false &&
          tool.inputSchema?.additionalProperties === false &&
          tool.outputSchema?.additionalProperties === false,
        "Installed MCP tool metadata is not closed-world and read-only.",
      );
    }

    const resources = await client.listResources();
    const resourceUris = resources.resources.map((entry) => entry.uri);
    assert(
      resourceUris.length === 12 &&
        new Set(resourceUris).size === 12 &&
        resourceUris.every((uri) =>
          /^salt-knowledge:\/\/v1\/sha256-[0-9a-f]{64}\/bootstrap\//u.test(
            uri,
          ),
        ) &&
        Buffer.byteLength(JSON.stringify(resources), "utf8") <=
          MAX_DISCOVERY_BYTES,
      "Installed MCP bootstrap resources are not bounded.",
    );
    const manifestUri = resourceUris.find((uri) =>
      uri.endsWith("/bootstrap/manifest"),
    );
    const manifest = JSON.parse(
      (await client.readResource({ uri: manifestUri })).contents[0].text,
    );

    const templates = await client.listResourceTemplates();
    const templateNames = templates.resourceTemplates.map(
      (entry) => entry.name,
    );
    const templateUris = templates.resourceTemplates.map(
      (entry) => entry.uriTemplate,
    );
    assert(
      JSON.stringify(templateNames) ===
        JSON.stringify([
          "salt-knowledge-record",
          "salt-example",
          "salt-migration",
          "salt-markdown",
        ]) &&
        Buffer.byteLength(JSON.stringify(templates), "utf8") <=
          MAX_DISCOVERY_BYTES,
      "Installed MCP resource templates are not bounded.",
    );

    const search = payload(
      await client.callTool({
        name: "search_salt",
        arguments: { query: "Button", families: ["component"], limit: 3 },
      }),
      "search_salt",
    );
    assert(
      search.contract === "salt-mcp-search-result/1" &&
        search.bundle_digest === manifest.bundle_digest &&
        search.matches.length > 0,
      "Installed MCP search diverged from the Knowledge bundle.",
    );
    const match = search.matches[0];
    const record = JSON.parse(
      (await client.readResource({ uri: match.resource_uri })).contents[0]
        .text,
    );
    assert(
      record.id === match.id && record.family === match.family,
      "Installed MCP record read diverged from search.",
    );

    const inspection = payload(
      await client.callTool({
        name: "inspect_salt_project",
        arguments: { project_root_index: 0 },
      }),
      "inspect_salt_project",
    );
    const secondInspection = payload(
      await client.callTool({
        name: "inspect_salt_project",
        arguments: { project_root_index: 1 },
      }),
      "inspect_salt_project second root",
    );
    assert(
      inspection.project.package_manifest.name ===
        expectedModuleFingerprint.projectName &&
        secondInspection.project.package_manifest.name ===
          "salt-consumer-smoke-non-salt",
      "Installed MCP did not preserve explicit multiple-root selection.",
    );

    const review = payload(
      await client.callTool({
        name: "review_salt_code",
        arguments: {
          artifacts: [
            {
              id: "demo.tsx",
              language: "tsx",
              text:
                'import { Button } from "@salt-ds/core"; export const Demo = () => <Button href="/next">Go</Button>;',
            },
          ],
          project_root_index: 0,
        },
      }),
      "review_salt_code",
    );
    assert(
      review.contract === "salt-mcp-code-review/1" &&
        review.results[0]?.artifact.id === "demo.tsx",
      "Installed MCP review omitted its submitted artifact.",
    );

    for (const [request, label] of [
      [{ name: "search_salt", arguments: { query: "" } }, "an empty query"],
      [
        {
          name: "inspect_salt_project",
          arguments: { project_root_index: 2 },
        },
        "an unauthorized root index",
      ],
      [
        {
          name: "inspect_salt_project",
          arguments: { root_dir: exactSaltRoot },
        },
        "a client-provided filesystem path",
      ],
      [
        { name: "review_salt_code", arguments: { artifacts: [] } },
        "an empty review",
      ],
    ]) {
      await mustReject(client, request, label);
    }
    for (const name of REMOVED_TOOL_NAMES) {
      await mustReject(
        client,
        { name, arguments: {} },
        "removed prototype tool " + name,
      );
    }

    const serialized = JSON.stringify({
      search,
      inspection,
      secondInspection,
      review,
    });
    assert(
      !serialized.includes(exactSaltRoot) &&
        !serialized.includes(nonSaltRoot),
      "Installed MCP leaked an authorized absolute path.",
    );

    const fingerprint = {
      protocol: client.getNegotiatedProtocolVersion(),
      toolNames,
      resourceUris,
      templates: templateUris,
      bundleDigest: manifest.bundle_digest,
      searchIds: [search.matches[0].id],
      recordIdentity: { family: record.family, id: record.id },
      projectName: inspection.project.package_manifest.name,
      reviewContract: review.contract,
    };
    assert(
      JSON.stringify(fingerprint) ===
        JSON.stringify(expectedModuleFingerprint),
      "Installed MCP stdio differs from its ESM/CommonJS factory.",
    );

    return {
      protocol: "2026-07-28",
      tools: toolNames,
      bootstrap_resources: resourceUris.length,
      resource_templates: templateNames,
      bundle_digest: manifest.bundle_digest,
      roots: 2,
      legacy_opening: "rejected",
      no_root_static_knowledge: "passed",
      network: "offline",
      node: process.versions.node,
      stderr_logging: stderr.includes("salt-mcp server running on stdio"),
    };
  } finally {
    await client.close();
  }
}
