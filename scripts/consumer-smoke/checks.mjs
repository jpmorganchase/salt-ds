import process from "node:process";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import {
  offlineNetworkGuardUrl,
  runOfflineNetworkGuardSelfTest,
} from "./offline-network-probe.mjs";
import {
  assert,
  createMcpSurfaceFingerprint,
  createMcpToolSemanticFingerprint,
  getInstalledMcpBin,
  pathExists,
} from "./shared.mjs";

const REGISTERED_TOOL_NAMES = [
  "search_salt",
  "inspect_salt_project",
  "review_salt_code",
];
const SUPPORTED_PROTOCOL_REVISIONS = [
  "2025-11-25",
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
  "2024-10-07",
];
const REMOVED_TOOL_NAMES = [
  "create_salt_ui",
  "migrate_to_salt",
  "get_salt_project_context",
  "get_salt_reference",
  "review_salt_ui",
];
const MANIFEST_URI_PATTERN =
  /^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\/manifest$/u;
const RECORD_TEMPLATE_PATTERN =
  /^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\/\{family\}\/\{id\}$/u;
const PROJECT_POLICY_TEMPLATE =
  "salt://project-policy/v2/{root}/{digest}/{kind}/{id}";
const COMPLETION_CLAIM_PATTERN =
  /implementation_ready|canonical_complete|exact_request_safe|repo_specific_workflows_ready|finish_without_changes|post_action/iu;
const MAX_SEARCH_RESULT_UTF8_BYTES = 16 * 1024;
const PUBLIC_CITATION_PATTERN =
  /^(?:salt:\/\/(?:catalog\/v2\/sha256-[0-9a-f]{64}|project-policy\/v2\/[A-Za-z0-9_-]+\/sha256-[0-9a-f]{64})\/|https:\/\/)/u;
const MAX_RESOURCE_PAGE_UTF8_BYTES = 256 * 1024;
const MAX_RESOURCES_PER_PAGE = 512;

async function collectDirectResourcePages(client) {
  const resources = [];
  const cursors = new Set();
  let cursor;
  do {
    const page = await client.request({
      method: "resources/list",
      params: cursor === undefined ? {} : { cursor },
    });
    assert(
      Array.isArray(page.resources) &&
        page.resources.length > 0 &&
        page.resources.length <= MAX_RESOURCES_PER_PAGE &&
        Buffer.byteLength(JSON.stringify(page), "utf8") <=
          MAX_RESOURCE_PAGE_UTF8_BYTES,
      "Installed MCP returned an empty or oversized resource page.",
    );
    resources.push(...page.resources);
    cursor = page.nextCursor;
    if (cursor !== undefined) {
      assert(
        !cursors.has(cursor) && cursors.size < 1_000,
        "Installed MCP repeated a resource cursor or exceeded the page safety bound.",
      );
      cursors.add(cursor);
    }
  } while (cursor !== undefined);
  return { resources, pageCount: cursors.size + 1 };
}

function parseResourceText(result, label) {
  const text = result?.contents?.[0]?.text;
  assert(typeof text === "string" && text.length > 0, `${label} was empty.`);
  return JSON.parse(text);
}

function getToolPayload(result, label) {
  assert(result?.isError !== true, `${label} returned an MCP tool error.`);
  if (result?.structuredContent) return result.structuredContent;
  const text = result?.content?.find((part) => part.type === "text")?.text;
  assert(typeof text === "string" && text.length > 0, `${label} was empty.`);
  return JSON.parse(text);
}

async function assertModernProtocolIsNotAdvertised(installedMcpBinPath, cwd) {
  const client = new Client(
    { name: "salt-consumer-modern-probe", version: "0.0.0" },
    { versionNegotiation: { mode: { pin: "2026-07-28" } } },
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", offlineNetworkGuardUrl, installedMcpBinPath, "serve"],
    cwd,
    stderr: "pipe",
  });
  let rejection;
  try {
    await client.connect(transport);
  } catch (error) {
    rejection = error;
  } finally {
    await client.close();
  }
  const rejectionMessage =
    rejection instanceof Error ? rejection.message : String(rejection ?? "");
  assert(
    rejection?.code === "ERA_NEGOTIATION_FAILED" &&
      /version negotiation failed/iu.test(rejectionMessage) &&
      rejectionMessage.includes("2026-07-28"),
    `Installed MCP stdio server did not reject MCP 2026-07-28 with the expected negotiation error: ${rejectionMessage || "no rejection"}.`,
  );
}

export function assertBoundedMcpToolPayload(
  payload,
  expectedScopeKind,
  message,
) {
  assert(
    payload &&
      typeof payload === "object" &&
      payload.data &&
      typeof payload.data === "object" &&
      payload.scope?.kind === expectedScopeKind &&
      payload.coverage &&
      typeof payload.coverage === "object" &&
      Array.isArray(payload.limitations),
    message,
  );
  assert(
    !COMPLETION_CLAIM_PATTERN.test(JSON.stringify(payload)),
    `${message} The bounded result contained a completion or workflow-control claim.`,
  );
}

export async function runMcpWorkflowCoverage(
  installRoot,
  existingSaltRoot,
  nonSaltRoot,
  expectedModuleFingerprint,
) {
  console.log("Checking the installed MCP v2 surface...");
  runOfflineNetworkGuardSelfTest();
  const installedMcpBinPath = getInstalledMcpBin(installRoot);
  assert(
    await pathExists(installedMcpBinPath),
    `Expected installed MCP bin at ${installedMcpBinPath}.`,
  );
  await assertModernProtocolIsNotAdvertised(
    installedMcpBinPath,
    existingSaltRoot,
  );

  const client = new Client({
    name: "salt-consumer-smoke",
    version: "0.0.0",
  });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", offlineNetworkGuardUrl, installedMcpBinPath, "serve"],
    cwd: existingSaltRoot,
    stderr: "pipe",
  });
  let stderrOutput = "";
  transport.stderr?.on("data", (chunk) => {
    stderrOutput += chunk.toString();
  });

  try {
    await client.connect(transport);
    assert(
      client.getProtocolEra() === "legacy" &&
        client.getNegotiatedProtocolVersion() === "2025-11-25",
      `Installed MCP stdio negotiated ${client.getProtocolEra() ?? "<no era>"} ${client.getNegotiatedProtocolVersion() ?? "<no version>"} instead of legacy 2025-11-25.`,
    );
    const serverVersion = client.getServerVersion();
    const resourceCapabilities = client.getServerCapabilities()?.resources;
    assert(
      serverVersion?.name === "salt-mcp" &&
        resourceCapabilities?.subscribe === false &&
        resourceCapabilities?.listChanged === false,
      "Installed MCP server identity or immutable resource capabilities are incorrect.",
    );

    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);
    assert(
      JSON.stringify(toolNames) === JSON.stringify(REGISTERED_TOOL_NAMES),
      `Installed MCP server advertised ${toolNames.join(", ")} instead of the final registered tool contract.`,
    );
    for (const tool of tools.tools) {
      assert(
        tool.annotations?.readOnlyHint === true &&
          tool.annotations?.destructiveHint === false,
        `Installed MCP tool ${tool.name} was not advertised as read-only.`,
      );
    }

    const directResources = await collectDirectResourcePages(client);
    assert(
      directResources.pageCount > 1,
      "Installed MCP server did not paginate its exact resource catalog.",
    );
    const resources = await client.listResources();
    const resourceUris = resources.resources.map((resource) => resource.uri);
    const directResourceUris = directResources.resources.map(
      (resource) => resource.uri,
    );
    assert(
      MANIFEST_URI_PATTERN.test(resourceUris[0]) &&
        new Set(resourceUris).size === resourceUris.length &&
        JSON.stringify(resourceUris) === JSON.stringify(directResourceUris),
      "Installed MCP server did not advertise a unique digest-bound resource catalog.",
    );
    const manifestUri = resourceUris[0];

    const templates = await client.listResourceTemplates();
    const templateUris = templates.resourceTemplates.map(
      (template) => template.uriTemplate,
    );
    const catalogTemplate = templateUris.find((uri) =>
      RECORD_TEMPLATE_PATTERN.test(uri),
    );
    assert(
      templateUris.length === 2 &&
        catalogTemplate &&
        templateUris.includes(PROJECT_POLICY_TEMPLATE) &&
        catalogTemplate.split("/")[4] === manifestUri.split("/")[4],
      `Installed MCP server advertised unexpected resource templates: ${templateUris.join(", ")}.`,
    );

    const manifest = parseResourceText(
      await client.readResource({ uri: manifestUri }),
      manifestUri,
    );
    assert(
      typeof manifest?.schema_version === "string" &&
        typeof manifest?.server_version === "string" &&
        manifest?.server_version === serverVersion.version &&
        typeof manifest?.catalog_version === "string" &&
        manifest?.negotiated_mcp_protocol_revision === "2025-11-25" &&
        JSON.stringify(manifest?.supported_mcp_protocol_revisions) ===
          JSON.stringify(SUPPORTED_PROTOCOL_REVISIONS) &&
        /^sha256:[0-9a-f]{64}$/u.test(manifest?.semantic_digest) &&
        Array.isArray(manifest?.families) &&
        manifest.families.every((family) =>
          /^sha256:[0-9a-f]{64}$/u.test(family.artifact_digest),
        ),
      "Catalog manifest did not return a schema-v2 digest-bound summary.",
    );
    const stdioFingerprint = createMcpSurfaceFingerprint({
      client,
      toolNames,
      manifestUri,
      manifest,
      resourceCount: resourceUris.length,
      resourceTemplate: catalogTemplate,
    });
    assert(
      JSON.stringify(stdioFingerprint) ===
        JSON.stringify(expectedModuleFingerprint.surface),
      "Installed MCP stdio protocol fingerprint differs from ESM/CommonJS.",
    );
    const stdioToolFingerprint = await createMcpToolSemanticFingerprint(
      client,
      existingSaltRoot,
    );
    assert(
      JSON.stringify(stdioToolFingerprint) ===
        JSON.stringify(expectedModuleFingerprint.tools),
      "Installed MCP stdio tool semantics differ from ESM/CommonJS.",
    );
    const expectedResourceCount =
      1 +
      manifest.families.reduce(
        (total, family) => total + family.record_count,
        0,
      );
    assert(
      resourceUris.length === expectedResourceCount,
      `Installed MCP listed ${resourceUris.length} resources; expected ${expectedResourceCount}.`,
    );
    for (const family of manifest.families) {
      const prefix = family.uri_template.slice(0, -"{id}".length);
      const familyResources = resourceUris.filter((uri) =>
        uri.startsWith(prefix),
      );
      assert(
        familyResources.length === family.record_count,
        `Installed MCP listed ${familyResources.length}/${family.record_count} ${family.family} resources.`,
      );
      await client.readResource({ uri: familyResources[0] });
    }
    for (const index of [25, 26, 103, resourceUris.length - 1]) {
      await client.readResource({ uri: resourceUris[index] });
    }

    const searchResult = await client.callTool({
      name: "search_salt",
      arguments: { query: "Button", families: ["component"], limit: 3 },
    });
    const search = getToolPayload(searchResult, "search_salt");
    assertBoundedMcpToolPayload(
      search,
      "catalog_search",
      "Installed search did not return a bounded catalog-search result.",
    );
    const button = search.data.matches?.find(
      (match) => match.title === "Button",
    );
    assert(
      typeof button?.uri === "string" &&
        button.uri.startsWith(manifestUri.slice(0, -"manifest".length)),
      "Installed search did not return Button with a digest-bound resource URI.",
    );
    assert(
      searchResult.content?.some(
        (part) => part.type === "resource_link" && part.uri === button.uri,
      ),
      "Installed search omitted the MCP resource link for Button.",
    );
    assert(
      Buffer.byteLength(JSON.stringify(searchResult), "utf8") <=
        MAX_SEARCH_RESULT_UTF8_BYTES &&
        Array.isArray(button?.evidence?.matched_fields) &&
        button?.provenance?.resource_uri === button.uri &&
        typeof search.data?.ambiguity?.is_ambiguous === "boolean",
      "Installed search omitted compact match evidence, ambiguity, or claim-level provenance.",
    );
    const buttonResource = parseResourceText(
      await client.readResource({ uri: button.uri }),
      button.uri,
    );
    assert(
      buttonResource?.record?.name === "Button",
      "Installed Button resource did not resolve the canonical record.",
    );
    assert(
      Array.isArray(buttonResource.content_resources) &&
        buttonResource.content_resources.length > 0 &&
        buttonResource.content_resources.every((entry) =>
          PUBLIC_CITATION_PATTERN.test(entry.uri),
        ),
      "Installed Button resource embedded or omitted its digest-bound content links.",
    );
    await client.readResource({
      uri: buttonResource.content_resources[0].uri,
    });

    const evidenceFamily = manifest.families.find(
      (family) => family.family === "evidence",
    );
    assert(evidenceFamily, "Catalog manifest omitted the evidence family.");
    const evidencePrefix = evidenceFamily.uri_template.slice(0, -"{id}".length);
    const evidenceIds = resourceUris
      .filter((uri) => uri.startsWith(evidencePrefix))
      .map((uri) => decodeURIComponent(uri.slice(evidencePrefix.length)));
    const completion = await client.complete({
      ref: { type: "ref/resource", uri: catalogTemplate },
      argument: { name: "id", value: "" },
      context: { arguments: { family: "evidence" } },
    });
    assert(
      completion.completion.total === evidenceIds.length &&
        completion.completion.hasMore === true &&
        completion.completion.values.includes(evidenceIds[25]) &&
        completion.completion.values.includes(evidenceIds[26]) &&
        !completion.completion.values.includes(evidenceIds[103]),
      "Installed MCP completion misstated its bounded evidence results.",
    );
    const narrowCompletion = await client.complete({
      ref: { type: "ref/resource", uri: catalogTemplate },
      argument: { name: "id", value: evidenceIds[103] },
      context: { arguments: { family: "evidence" } },
    });
    assert(
      narrowCompletion.completion.total === 1 &&
        narrowCompletion.completion.hasMore === false &&
        narrowCompletion.completion.values[0] === evidenceIds[103],
      "Installed MCP completion could not retrieve the record after position 103.",
    );

    const inspectionResult = await client.callTool({
      name: "inspect_salt_project",
      arguments: { root_dir: ".", include_policy_ir: true },
    });
    const inspection = getToolPayload(inspectionResult, "inspect_salt_project");
    assertBoundedMcpToolPayload(
      inspection,
      "configured_project_inspection",
      "Installed project inspection did not return bounded observed facts.",
    );
    assert(
      inspection.scope.filesystem_access === "read_only" &&
        inspection.data.package_manifest &&
        Array.isArray(inspection.data.installation?.resolved_packages),
      "Installed project inspection omitted its read-only package facts.",
    );

    const nonSaltInspectionResult = await client.callTool({
      name: "inspect_salt_project",
      arguments: { root_dir: nonSaltRoot },
    });
    const nonSaltInspection = getToolPayload(
      nonSaltInspectionResult,
      "inspect_salt_project non-Salt fixture",
    );
    assertBoundedMcpToolPayload(
      nonSaltInspection,
      "configured_project_inspection",
      "Installed inspection did not retain bounded non-Salt project semantics.",
    );
    assert(
      nonSaltInspection.data.package_manifest?.name ===
        "salt-consumer-smoke-non-salt" &&
        nonSaltInspection.data.installation?.assessment?.status ===
          "not_observed" &&
        nonSaltInspection.data.installation?.resolved_packages?.length === 0,
      "Installed inspection mislabeled the non-Salt consumer as a healthy Salt installation.",
    );

    const noMatchResult = await client.callTool({
      name: "search_salt",
      arguments: { query: "qzvfpjxmqkht4ef437fa" },
    });
    const noMatch = getToolPayload(noMatchResult, "search_salt no-match");
    assertBoundedMcpToolPayload(
      noMatch,
      "catalog_search",
      "Installed search did not return a bounded no-match result.",
    );
    assert(
      noMatch.data.matches?.length === 0 &&
        noMatch.data.ambiguity?.candidate_count === 0 &&
        noMatch.data.ambiguity?.is_ambiguous === false,
      "Installed search promoted a no-match query into a successful candidate.",
    );

    const submitted = [
      'import { Button } from "@salt-ds/core";',
      "export function Demo() {",
      '  return <Button href="/next">Go</Button>;',
      "}",
    ].join("\n");
    const reviewResult = await client.callTool({
      name: "review_salt_code",
      arguments: {
        artifacts: [{ id: "demo.tsx", language: "tsx", text: submitted }],
      },
    });
    const review = getToolPayload(reviewResult, "review_salt_code");
    assertBoundedMcpToolPayload(
      review,
      "submitted_text_only",
      "Installed review did not retain its submitted-text boundary.",
    );
    assert(
      review.data.results?.[0]?.artifact?.id === "demo.tsx" &&
        ["findings", "no_findings_in_evaluated_scope"].includes(
          review.data.results?.[0]?.outcome,
        ) &&
        review.limitations.join(" ").includes("not submitted"),
      "Installed review omitted its artifact outcome or unsubmitted-file limitation.",
    );

    const nonSaltSubmitted = [
      'import { Button } from "@example/external-ui";',
      "export function LegacyPage() {",
      '  return <Button variant="contained">Save</Button>;',
      "}",
    ].join("\n");
    const nonSaltReviewResult = await client.callTool({
      name: "review_salt_code",
      arguments: {
        artifacts: [
          {
            id: "LegacyPage.tsx",
            language: "tsx",
            text: nonSaltSubmitted,
          },
        ],
      },
    });
    const nonSaltReview = getToolPayload(
      nonSaltReviewResult,
      "review_salt_code non-Salt fixture",
    );
    assertBoundedMcpToolPayload(
      nonSaltReview,
      "submitted_text_only",
      "Installed review did not retain bounded non-Salt submitted scope.",
    );
    assert(
      nonSaltReview.data.results?.[0]?.outcome ===
        "no_findings_in_evaluated_scope" &&
        nonSaltReview.data.results?.[0]?.findings?.length === 0 &&
        nonSaltReview.data.results?.[0]?.coverage?.parser === "babel" &&
        nonSaltReview.coverage?.detected_findings === 0 &&
        nonSaltReview.coverage?.returned_findings === 0,
      "Installed review falsely treated a non-Salt React component as a grounded Salt finding.",
    );

    const invalidCalls = [
      { name: "search_salt", arguments: { query: "" } },
      { name: "inspect_salt_project", arguments: { root_dir: "" } },
      { name: "review_salt_code", arguments: { artifacts: [] } },
      {
        name: "review_salt_code",
        arguments: {
          artifacts: Array.from({ length: 9 }, (_, index) => ({
            id: `too-many-${index}.tsx`,
            language: "tsx",
            text: `export const value${index} = ${index};`,
          })),
        },
      },
    ];
    for (const invalidCall of invalidCalls) {
      let rejected = false;
      try {
        const result = await client.callTool(invalidCall);
        rejected =
          result?.isError === true &&
          result.content?.some(
            (entry) =>
              entry.type === "text" &&
              typeof entry.text === "string" &&
              entry.text.length > 0,
          );
      } catch (error) {
        rejected = error?.code === -32602;
      }
      assert(
        rejected,
        `Installed MCP server accepted invalid ${invalidCall.name} arguments.`,
      );
    }

    for (const name of REMOVED_TOOL_NAMES) {
      let rejected = false;
      try {
        await client.callTool({ name, arguments: {} });
      } catch (error) {
        rejected = error?.code === -32602;
      }
      assert(rejected, `Installed MCP server unexpectedly accepted ${name}.`);
    }
  } catch (error) {
    const capturedStderr = stderrOutput.trim();
    if (capturedStderr.length > 0) {
      throw new Error(
        `Installed MCP server failed during smoke test.\nstderr:\n${capturedStderr}\n\n${error instanceof Error ? (error.stack ?? error.message) : error}`,
      );
    }
    throw error;
  } finally {
    await client.close();
  }
}
