import { Buffer } from "node:buffer";
import { cpSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import publicSurfaceBudgets from "../public-surface-budgets.json" with {
  type: "json",
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..", "..");
const builtMcpRoot = path.join(repoRoot, "dist", "salt-ds-mcp");
const builtKnowledgeRoot = path.join(repoRoot, "dist", "salt-ds-knowledge");
const MAX_PUBLIC_TOOL_COUNT = 3;
const MAX_BOOTSTRAP_RESOURCE_COUNT = 16;
const MAX_RESOURCE_TEMPLATE_COUNT = 4;
const MAX_INSTRUCTIONS_UTF8_BYTES = 1_000;
const MAX_RESOURCE_DISCOVERY_UTF8_BYTES = 16 * 1024;
const MAX_FIRST_HIT_UTF8_BYTES = 64 * 1024;

function assertMaximum(name, value, maximum) {
  if (!Number.isFinite(value) || value > maximum) {
    throw new Error(`${name} is ${value}; expected at most ${maximum}.`);
  }
}

function jsonBytes(value) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function memorySnapshot() {
  const memory = process.memoryUsage();
  return {
    rss_bytes: memory.rss,
    heap_used_bytes: memory.heapUsed,
    heap_total_bytes: memory.heapTotal,
    external_bytes: memory.external,
  };
}

const measurementRoot = mkdtempSync(
  path.join(repoRoot, "dist", ".salt-mcp-surface-"),
);
const installedScopeRoot = path.join(
  measurementRoot,
  "node_modules",
  "@salt-ds",
);
const installedMcpRoot = path.join(installedScopeRoot, "mcp");
const installedKnowledgeRoot = path.join(installedScopeRoot, "knowledge");
let client;
let serverHandle;

try {
  mkdirSync(installedScopeRoot, { recursive: true });
  cpSync(builtMcpRoot, installedMcpRoot, { recursive: true });
  cpSync(builtKnowledgeRoot, installedKnowledgeRoot, { recursive: true });

  const installedEntrypoint = path.join(installedMcpRoot, "dist-es", "index.js");
  const processStartMemory = memorySnapshot();
  const coldStarted = performance.now();
  const { createSaltMcpServer } = await import(
    pathToFileURL(installedEntrypoint).href
  );
  await createSaltMcpServer();
  const coldElapsedMs = performance.now() - coldStarted;

  const warmStarted = performance.now();
  const server = await createSaltMcpServer();
  const warmElapsedMs = performance.now() - warmStarted;
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  serverHandle = serveStdio(() => server, {
    legacy: "reject",
    transport: serverTransport,
  });
  client = new Client(
    { name: "salt-mcp-surface-measurement", version: "1.0.0" },
    {
      enforceStrictCapabilities: true,
      versionNegotiation: { mode: { pin: "2026-07-28" } },
    },
  );
  await client.connect(clientTransport);

  const listedTools = await client.listTools();
  const instructions = client.getInstructions() ?? "";
  const firstHitTool = {
    name: "search_salt",
    arguments: { query: "Button", limit: 3 },
  };
  globalThis.gc?.();
  const beforeFirstHitMemory = memorySnapshot();
  const firstHitStarted = performance.now();
  const firstHitResult = await client.callTool(firstHitTool);
  const firstHitElapsedMs = performance.now() - firstHitStarted;
  globalThis.gc?.();
  const afterFirstHitMemory = memorySnapshot();
  const listedResources = await client.listResources();
  const listedTemplates = await client.listResourceTemplates();

  const measurement = {
    contract: "salt-mcp-public-surface-measurement/1",
    protocol_version: "2026-07-28",
    sdk: {
      server: "2.0.0",
      client: "2.0.0",
    },
    entrypoint: "dist/salt-ds-mcp/dist-es/index.js",
    exclusions:
      "No transport framing, agent edits, user corrections, external-model time, or npm-pack compression.",
    encoding: "UTF-8",
    minification: "JSON.stringify(value) with no replacer or spacing",
    measurement_method: {
      installation:
        "Exact built MCP and Knowledge package directories copied into one isolated node_modules scope; all other dependencies resolve from the repository install.",
      load:
        "Cold includes first ESM import plus factory creation; warm repeats factory creation in the same process with filesystem cache available.",
      discovery:
        "Current v2 SDK client pinned to MCP 2026-07-28 over an in-memory transport served by serveStdio with legacy reject.",
      first_hit:
        "performance.now around the first search_salt call after tools/list and before resource discovery; process.memoryUsage before and after forced GC when available.",
    },
    setup_friction: {
      installable_candidate_packages: ["@salt-ds/mcp"],
      public_factory_values: 1,
      public_options_fields: ["projectRoots"],
      startup_flags_for_static_knowledge: 0,
      startup_flag_per_authorized_project_root: "--root",
      transports: ["stdio"],
    },
    load: {
      cold_elapsed_ms: coldElapsedMs,
      warm_elapsed_ms: warmElapsedMs,
      process_start_memory: processStartMemory,
    },
    discovery: {
      tool_count: listedTools.tools.length,
      bootstrap_resource_count: listedResources.resources.length,
      resource_template_count: listedTemplates.resourceTemplates.length,
      exact_tools_list_utf8_bytes: jsonBytes(listedTools),
      conservative_tools_list_token_upper_bound: jsonBytes(listedTools),
      exact_resources_list_utf8_bytes: jsonBytes(listedResources),
      exact_resource_templates_list_utf8_bytes: jsonBytes(listedTemplates),
      instructions_utf8_bytes: Buffer.byteLength(instructions, "utf8"),
    },
    first_hit: {
      tool: firstHitTool.name,
      arguments: firstHitTool.arguments,
      pre_first_hit_protocol_calls: ["initialize", "tools/list"],
      resource_inventory_warmed_before_first_hit: false,
      elapsed_ms: firstHitElapsedMs,
      response_utf8_bytes: jsonBytes(firstHitResult),
      before_memory: beforeFirstHitMemory,
      after_gc_memory: afterFirstHitMemory,
      retained_delta: {
        rss_bytes:
          afterFirstHitMemory.rss_bytes - beforeFirstHitMemory.rss_bytes,
        heap_used_bytes:
          afterFirstHitMemory.heap_used_bytes -
          beforeFirstHitMemory.heap_used_bytes,
      },
    },
    tool_parts: listedTools.tools.map((tool) => ({
      name: tool.name,
      full_tool_utf8_bytes: jsonBytes(tool),
      description_utf8_bytes: Buffer.byteLength(tool.description ?? "", "utf8"),
      input_schema_utf8_bytes: jsonBytes(tool.inputSchema),
      output_schema_utf8_bytes: jsonBytes(tool.outputSchema),
    })),
  };

  assertMaximum(
    "Public tool count",
    measurement.discovery.tool_count,
    MAX_PUBLIC_TOOL_COUNT,
  );
  assertMaximum(
    "Tool discovery UTF-8 bytes",
    measurement.discovery.exact_tools_list_utf8_bytes,
    publicSurfaceBudgets.toolDiscoveryUtf8Bytes,
  );
  assertMaximum(
    "Bootstrap Resource count",
    measurement.discovery.bootstrap_resource_count,
    MAX_BOOTSTRAP_RESOURCE_COUNT,
  );
  assertMaximum(
    "Resource Template count",
    measurement.discovery.resource_template_count,
    MAX_RESOURCE_TEMPLATE_COUNT,
  );
  assertMaximum(
    "Resource discovery UTF-8 bytes",
    measurement.discovery.exact_resources_list_utf8_bytes,
    MAX_RESOURCE_DISCOVERY_UTF8_BYTES,
  );
  assertMaximum(
    "Resource Template discovery UTF-8 bytes",
    measurement.discovery.exact_resource_templates_list_utf8_bytes,
    MAX_RESOURCE_DISCOVERY_UTF8_BYTES,
  );
  assertMaximum(
    "Instructions UTF-8 bytes",
    measurement.discovery.instructions_utf8_bytes,
    MAX_INSTRUCTIONS_UTF8_BYTES,
  );
  assertMaximum(
    "First-hit response UTF-8 bytes",
    measurement.first_hit.response_utf8_bytes,
    MAX_FIRST_HIT_UTF8_BYTES,
  );

  process.stdout.write(`${JSON.stringify(measurement, null, 2)}\n`);
} finally {
  await client?.close().catch(() => {});
  await serverHandle?.close().catch(() => {});
  rmSync(measurementRoot, { recursive: true, force: true });
}
