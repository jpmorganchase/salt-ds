import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { build } from "esbuild";
import publicSurfaceBudgets from "../public-surface-budgets.json" with { type: "json" };
import {
  assertCatalogInputBytes,
  assertCatalogManifestBytes,
  assertSameCatalogBuildIdentity,
  createCatalogBuildIdentity,
  isPathWithinRoot,
  parseCatalogBuildBanner,
} from "../../../scripts/catalogBuildIdentity.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..", "..");
const builtPackageRoot = path.join(repoRoot, "dist", "salt-ds-mcp");
const builtEntrypoint = path.join(builtPackageRoot, "dist-es", "index.js");
const builtRegistryDir = path.join(builtPackageRoot, "generated");
const catalogManifestPath = path.join(
  builtRegistryDir,
  "catalog-manifest.json",
);
const catalogStoreEntry = path.join(
  repoRoot,
  "packages",
  "mcp",
  "src",
  "core",
  "catalog",
  "catalogStoreV2.ts",
);
const BASELINE_TOKEN_ARTIFACT_BYTES = 4_705_658;
const MAX_PUBLIC_TOOL_COUNT = 3;
const MAX_TOOL_DISCOVERY_UTF8_BYTES =
  publicSurfaceBudgets.toolDiscoveryUtf8Bytes;
const MAX_INSTRUCTIONS_UTF8_BYTES = 1_000;
const MIN_TOKEN_OWNED_REDUCTION_PERCENT = 50;

function assertMaximum(name, value, maximum) {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number; received ${value}.`);
  }
  if (value > maximum) {
    throw new Error(`${name} is ${value}; expected at most ${maximum}.`);
  }
}

function assertMinimum(name, value, minimum) {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number; received ${value}.`);
  }
  if (value < minimum) {
    throw new Error(`${name} is ${value}; expected at least ${minimum}.`);
  }
}

function jsonBytes(value) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function assertPortableInventoryPath(fileName) {
  if (
    typeof fileName !== "string" ||
    fileName.length === 0 ||
    fileName.includes("\\") ||
    path.isAbsolute(fileName) ||
    fileName
      .split("/")
      .some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new Error(`Catalog inventory contains an unsafe path: ${fileName}`);
  }
}

function captureCatalogSnapshot(buildIdentity) {
  const manifestBytes = assertCatalogManifestBytes(
    buildIdentity,
    readFileSync(catalogManifestPath),
  );
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const publicationEntry = manifest.support_artifacts.find(
    (entry) => entry.kind === "package_inventory",
  );
  if (!publicationEntry) {
    throw new Error("Catalog manifest has no package inventory.");
  }
  assertPortableInventoryPath(publicationEntry.file);
  const publicationPath = path.resolve(builtRegistryDir, publicationEntry.file);
  if (!isPathWithinRoot(builtRegistryDir, publicationPath)) {
    throw new Error("Catalog package inventory escapes the generated root.");
  }
  const publicationBytes = readFileSync(publicationPath);
  if (
    publicationBytes.byteLength !== publicationEntry.bytes ||
    sha256(publicationBytes) !== publicationEntry.sha256
  ) {
    throw new Error(
      "Catalog package inventory does not match its manifest digest.",
    );
  }
  const inventory = JSON.parse(publicationBytes.toString("utf8"));
  if (!Array.isArray(inventory.files)) {
    throw new Error("Catalog package inventory has no files array.");
  }
  const expectedFiles = [
    "catalog-manifest.json",
    ...manifest.artifacts.map((entry) => entry.file),
    ...manifest.support_artifacts.map((entry) => entry.file),
  ].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  if (
    new Set(inventory.files).size !== inventory.files.length ||
    JSON.stringify(inventory.files) !== JSON.stringify(expectedFiles)
  ) {
    throw new Error(
      "Catalog package inventory does not exactly cover the manifest.",
    );
  }
  const metadataByFile = new Map(
    [...manifest.artifacts, ...manifest.support_artifacts].map((entry) => [
      entry.file,
      entry,
    ]),
  );
  const snapshotDir = mkdtempSync(
    path.join(os.tmpdir(), "salt-mcp-surface-catalog-"),
  );
  let generatedBytes = 0;
  try {
    for (const fileName of inventory.files) {
      assertPortableInventoryPath(fileName);
      const sourcePath = path.resolve(builtRegistryDir, fileName);
      if (!isPathWithinRoot(builtRegistryDir, sourcePath)) {
        throw new Error(`Catalog inventory path escapes its root: ${fileName}`);
      }
      const bytes =
        fileName === "catalog-manifest.json"
          ? manifestBytes
          : fileName === publicationEntry.file
            ? publicationBytes
            : readFileSync(sourcePath);
      const metadata = metadataByFile.get(fileName);
      if (
        fileName !== "catalog-manifest.json" &&
        (!metadata ||
          bytes.byteLength !== metadata.bytes ||
          sha256(bytes) !== metadata.sha256)
      ) {
        throw new Error(
          `Catalog inventory file does not match its manifest digest: ${fileName}`,
        );
      }
      const snapshotPath = path.resolve(snapshotDir, fileName);
      if (!isPathWithinRoot(snapshotDir, snapshotPath)) {
        throw new Error(`Catalog snapshot path escapes its root: ${fileName}`);
      }
      mkdirSync(path.dirname(snapshotPath), { recursive: true });
      writeFileSync(snapshotPath, bytes);
      generatedBytes += bytes.byteLength;
    }
    assertCatalogManifestBytes(
      buildIdentity,
      readFileSync(catalogManifestPath),
    );
    return {
      directory: snapshotDir,
      entryCount: inventory.files.length,
      generatedBytes,
    };
  } catch (error) {
    rmSync(snapshotDir, { recursive: true, force: true });
    throw error;
  }
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

function esbuildLoader(filePath) {
  switch (path.extname(filePath)) {
    case ".ts":
    case ".mts":
    case ".cts":
      return "ts";
    case ".tsx":
      return "tsx";
    case ".js":
    case ".mjs":
    case ".cjs":
      return "js";
    case ".jsx":
      return "jsx";
    case ".json":
      return "json";
    case ".css":
      return "css";
    default:
      return "text";
  }
}

function guardedCatalogSourcePlugin(buildIdentity) {
  return {
    name: "salt-catalog-measurement-input-guard",
    setup(esbuildContext) {
      esbuildContext.onLoad({ filter: /.*/, namespace: "file" }, (args) => {
        if (!path.isAbsolute(args.path)) {
          throw new Error(
            `Catalog measurement received a non-absolute file input: ${args.path}`,
          );
        }
        if (!isPathWithinRoot(repoRoot, args.path)) return null;
        const relativePath = path.relative(repoRoot, args.path);
        if (relativePath.split(path.sep).includes("node_modules")) {
          return null;
        }
        const bytes = readFileSync(args.path);
        assertCatalogInputBytes(
          buildIdentity,
          relativePath.replaceAll("\\", "/"),
          bytes,
        );
        return {
          contents: bytes,
          loader: esbuildLoader(args.path),
        };
      });
    },
  };
}

async function measurePackedCatalog(buildIdentity, registryDir, snapshot) {
  const bundled = await build({
    entryPoints: [catalogStoreEntry],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    target: "node22",
    logLevel: "silent",
    outfile: "catalog-measurement.js",
    plugins: [guardedCatalogSourcePlugin(buildIdentity)],
  });
  const output = bundled.outputFiles.find((file) => file.path.endsWith(".js"));
  if (!output) {
    throw new Error("Catalog measurement bundle produced no output.");
  }
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(
    output.contents,
  ).toString("base64")}`;
  const { CatalogStoreV2 } = await import(moduleUrl);
  const metrics = new CatalogStoreV2({
    registryDir,
  }).validateCrossReferences();
  return {
    ...metrics,
    package_inventory_entry_count: snapshot.entryCount,
    package_inventory_total_bytes: snapshot.generatedBytes,
    baseline_token_artifact_bytes: BASELINE_TOKEN_ARTIFACT_BYTES,
    token_owned_reduction_percent:
      ((BASELINE_TOKEN_ARTIFACT_BYTES - metrics.tokenOwnedArtifactBytes) /
        BASELINE_TOKEN_ARTIFACT_BYTES) *
      100,
  };
}

const catalogBuildIdentity = createCatalogBuildIdentity(
  readFileSync(catalogManifestPath),
);
const builtEntrypointBytes = readFileSync(builtEntrypoint);
const runtimeBuildIdentity = parseCatalogBuildBanner(builtEntrypointBytes);
assertSameCatalogBuildIdentity(catalogBuildIdentity, runtimeBuildIdentity);
const catalogSnapshot = captureCatalogSnapshot(catalogBuildIdentity);
const registryDir = catalogSnapshot.directory;
const runtimeSnapshotDirectory = mkdtempSync(
  path.join(builtPackageRoot, ".salt-surface-runtime-"),
);
const runtimeSnapshotEntrypoint = path.join(
  runtimeSnapshotDirectory,
  "index.js",
);
writeFileSync(runtimeSnapshotEntrypoint, builtEntrypointBytes);
writeFileSync(
  path.join(runtimeSnapshotDirectory, "package.json"),
  readFileSync(path.join(builtPackageRoot, "dist-es", "package.json")),
);
const processStartMemory = memorySnapshot();
let server;
let client;

try {
  const { createSaltMcpServer } = await import(
    pathToFileURL(runtimeSnapshotEntrypoint).href
  );
  server = await createSaltMcpServer({ registryDir });
  client = new Client(
    { name: "salt-mcp-surface-measurement", version: "1.0.0" },
    { capabilities: {} },
  );
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  const listedTools = await client.listTools();
  const instructions = client.getInstructions() ?? "";
  const firstHitTool = {
    name: "search_salt",
    arguments: { query: "Button" },
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
  const catalog = await measurePackedCatalog(
    catalogBuildIdentity,
    registryDir,
    catalogSnapshot,
  );

  const measurement = {
    baseline_commit: "f0f6d86db9a5f7b6db434e2b0be4e6d3f57f4f4b",
    entrypoint: path.relative(repoRoot, builtEntrypoint).replaceAll("\\", "/"),
    exclusions:
      "No transport framing, agent edits, user corrections, host context, or external-model time. npm pack compression is reported by the separate package gate.",
    encoding: "UTF-8",
    build_identity: {
      manifest_sha256: catalogBuildIdentity.manifest_sha256,
      input_inventory_digest: catalogBuildIdentity.input_inventory_digest,
    },
    minification: "JSON.stringify(value) with no replacer or spacing",
    compression: "none",
    measurement_method: {
      discovery:
        "In-memory MCP client against the built ESM package; JSON.stringify with no replacer or spacing.",
      first_hit:
        "performance.now around the first search_salt call after connection and tool discovery, before resource enumeration; process.memoryUsage before and after forced GC using node --expose-gc.",
      catalog:
        "CatalogStoreV2.validateCrossReferences against an immutable digest-verified snapshot of dist/salt-ds-mcp/generated plus exact captured byte totals from the descriptor-derived package inventory.",
    },
    tool_count: listedTools.tools.length,
    resource_count: listedResources.resources.length,
    resource_template_count: listedTemplates.resourceTemplates.length,
    exact_tools_list_utf8_bytes: jsonBytes(listedTools),
    tool_array_utf8_bytes: jsonBytes(listedTools.tools),
    instructions_utf8_bytes: Buffer.byteLength(instructions, "utf8"),
    first_hit: {
      tool: firstHitTool.name,
      arguments: firstHitTool.arguments,
      pre_first_hit_protocol_calls: ["initialize", "tools/list"],
      resource_inventory_warmed_before_first_hit: false,
      elapsed_ms: firstHitElapsedMs,
      response_utf8_bytes: jsonBytes(firstHitResult),
      process_start_memory: processStartMemory,
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
    catalog,
    tool_parts: listedTools.tools.map((tool) => ({
      name: tool.name,
      full_tool_utf8_bytes: jsonBytes(tool),
      description_utf8_bytes: Buffer.byteLength(tool.description ?? "", "utf8"),
      input_schema_utf8_bytes: jsonBytes(tool.inputSchema),
      output_schema_utf8_bytes: jsonBytes(tool.outputSchema),
    })),
  };

  assertMaximum("Public tool count", measurement.tool_count, MAX_PUBLIC_TOOL_COUNT);
  assertMaximum(
    "Tool discovery UTF-8 bytes",
    measurement.exact_tools_list_utf8_bytes,
    MAX_TOOL_DISCOVERY_UTF8_BYTES,
  );
  assertMaximum(
    "Instructions UTF-8 bytes",
    measurement.instructions_utf8_bytes,
    MAX_INSTRUCTIONS_UTF8_BYTES,
  );
  assertMinimum(
    "Token-owned artifact reduction percent",
    measurement.catalog.token_owned_reduction_percent,
    MIN_TOKEN_OWNED_REDUCTION_PERCENT,
  );

  process.stdout.write(`${JSON.stringify(measurement, null, 2)}\n`);
} finally {
  await client?.close().catch(() => {});
  await server?.close().catch(() => {});
  rmSync(catalogSnapshot.directory, { recursive: true, force: true });
  rmSync(runtimeSnapshotDirectory, { recursive: true, force: true });
}
