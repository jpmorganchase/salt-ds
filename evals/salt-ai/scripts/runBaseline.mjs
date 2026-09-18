import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import {
  assert,
  parseArgs,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
  writeJsonAtomic,
} from "../../../scripts/saltAiEvidenceUtils.mjs";
import { buildCatalogRegistry } from "../../../packages/mcp/scripts/buildRegistry.mjs";
import { runDeterministicValidation } from "./runDeterministic.mjs";
import { validateEvaluation } from "./validate.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const COHORT_ID = "baseline-pre-platform";

async function filesUnder(root, directory = root) {
  const result = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await filesUnder(root, absolute)));
    else if (entry.isFile())
      result.push(path.relative(root, absolute).replaceAll("\\", "/"));
    else
      throw new Error(
        `Catalog build contains an unsupported entry: ${absolute}`,
      );
  }
  return result;
}

async function treeIdentity(root) {
  const entries = [];
  for (const file of await filesUnder(root)) {
    const bytes = await readFile(path.join(root, ...file.split("/")));
    entries.push({ file, bytes: bytes.byteLength, sha256: sha256(bytes) });
  }
  return { entries, sha256: sha256(Buffer.from(stableJson(entries), "utf8")) };
}

function aggregateManifest(manifest, manifestBytes, tree) {
  return {
    contract: "catalog-v2-internal-characterization",
    build_count: 2,
    deterministic: true,
    manifest_bytes: manifestBytes.byteLength,
    artifact_count: manifest.artifacts.length,
    artifact_bytes: manifest.artifacts.reduce(
      (total, artifact) => total + artifact.bytes,
      0,
    ),
    record_count: manifest.artifacts.reduce(
      (total, artifact) => total + artifact.record_count,
      0,
    ),
    semantic_digest: manifest.semantic_digest,
    derived_bundle_identity: sha256(manifestBytes),
    artifact_set_digest: tree.sha256,
  };
}

async function protocolIdentity(manifest) {
  const entries = [];
  for (const relative of manifest.protocol_files) {
    const bytes = await readFile(path.resolve(repositoryRoot, relative));
    entries.push({ file: relative, sha256: sha256(bytes) });
  }
  return sha256(Buffer.from(stableJson(entries), "utf8"));
}

async function measureMcp(registryDir, projectRoot) {
  const entrypoint = path.join(
    repositoryRoot,
    "dist",
    "salt-ds-mcp",
    "dist-es",
    "index.js",
  );
  assert(
    (await stat(entrypoint)).isFile(),
    "Build @salt-ds/mcp before running the baseline",
  );
  const { createSaltMcpServer } = await import(
    `${pathToFileURL(entrypoint).href}?baseline=${Date.now()}`
  );
  const options = {
    registryDir,
    projectAccess: {
      mode: "restricted",
      allowedRoots: [projectRoot],
      defaultRoot: projectRoot,
    },
  };

  const coldStarted = performance.now();
  const server = await createSaltMcpServer(options);
  const coldLoad = performance.now() - coldStarted;
  const client = new Client(
    { name: "salt-ai-baseline", version: "1.0.0" },
    { capabilities: {} },
  );
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  const warmStarted = performance.now();
  const warmServer = await createSaltMcpServer(options);
  const warmLoad = performance.now() - warmStarted;
  await warmServer.close();

  try {
    const searchStarted = performance.now();
    await client.callTool({
      name: "search_salt",
      arguments: { query: "Button", limit: 5 },
    });
    const search = performance.now() - searchStarted;

    const inspectStarted = performance.now();
    await client.callTool({
      name: "inspect_salt_project",
      arguments: { root_dir: projectRoot },
    });
    const inspection = performance.now() - inspectStarted;

    const reviewStarted = performance.now();
    await client.callTool({
      name: "review_salt_code",
      arguments: {
        package_versions: { "@salt-ds/core": "1.69.0" },
        artifacts: [
          {
            id: "src/App.tsx",
            language: "tsx",
            text: "import { Button } from '@salt-ds/core'; export const App = () => <Button variant=\"primary\">Save</Button>;",
          },
        ],
      },
    });
    const review = performance.now() - reviewStarted;
    return {
      cold_load: coldLoad,
      warm_load: warmLoad,
      search,
      inspection,
      review,
    };
  } finally {
    await client.close().catch(() => {});
    await server.close().catch(() => {});
  }
}

function roundedTimings(timings) {
  return Object.fromEntries(
    Object.entries(timings).map(([key, value]) => [
      key,
      Number(value.toFixed(3)),
    ]),
  );
}

async function buildBaseline() {
  await validateEvaluation({ allowStaleBaselines: true });
  const deterministic = await runDeterministicValidation({
    allowStaleBaselines: true,
  });
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), "salt-ai-unit00b-baseline-"),
  );
  const first = path.join(temporaryRoot, "catalog-a");
  const second = path.join(temporaryRoot, "catalog-b");
  const copied = path.join(temporaryRoot, "catalog-copy");
  const projectRoot = path.join(temporaryRoot, "project");
  try {
    await buildCatalogRegistry({
      sourceRoot: repositoryRoot,
      outputDir: first,
    });
    await buildCatalogRegistry({
      sourceRoot: repositoryRoot,
      outputDir: second,
    });
    const [firstTree, secondTree] = await Promise.all([
      treeIdentity(first),
      treeIdentity(second),
    ]);
    assert(
      stableJson(firstTree) === stableJson(secondTree),
      "Two clean Catalog-v2 builds produced different files",
    );
    const manifestBytes = await readFile(
      path.join(first, "catalog-manifest.json"),
    );
    const secondManifestBytes = await readFile(
      path.join(second, "catalog-manifest.json"),
    );
    assert(
      manifestBytes.equals(secondManifestBytes),
      "Two clean builds produced different manifest bytes",
    );
    const manifest = JSON.parse(manifestBytes.toString("utf8"));

    await mkdir(projectRoot, { recursive: true });
    await writeFile(
      path.join(projectRoot, "package.json"),
      `${JSON.stringify({ private: true, dependencies: { "@salt-ds/core": "1.69.0" } })}\n`,
      "utf8",
    );
    const copyStarted = performance.now();
    await cp(first, copied, { recursive: true, force: false });
    const copyMs = performance.now() - copyStarted;
    const timings = roundedTimings(await measureMcp(first, projectRoot));

    const evalManifestBytes = await readFile(
      path.join(repositoryRoot, "evals", "salt-ai", "manifest.json"),
    );
    const evalManifest = JSON.parse(evalManifestBytes.toString("utf8"));
    return {
      schema_version: "1.0.0",
      cohort_id: COHORT_ID,
      sanitization: {
        raw_prompts_committed: false,
        raw_output_committed: false,
        credentials_committed: false,
        absolute_paths_committed: false,
        proprietary_fixtures_committed: false,
      },
      identities: {
        manifest_sha256: sha256(evalManifestBytes),
        protocol_sha256: await protocolIdentity(evalManifest),
        fixture_sha256: evalManifest.fixture_sha256,
      },
      corpus: {
        outcome_cases: evalManifest.counts.outcome_cases,
        activation_cases: evalManifest.counts.activation_cases,
        retrieval_gold_queries: evalManifest.counts.retrieval_gold_queries,
      },
      modes: [
        {
          mode_id: "mode_1_base_tools",
          status: "baseline_available",
          scored: false,
          metrics: {
            deterministic_readiness: {
              passed: deterministic.status === "passed",
              numerator: deterministic.outcome_cases,
              denominator: deterministic.outcome_cases,
              harness_identity: deterministic.identity,
            },
          },
          reason:
            "Unit 00b validates the base-tools corpus and deterministic graders; no controlled-model quality run is claimed.",
        },
        {
          mode_id: "mode_2_markdown",
          status: "not_available",
          scored: false,
          metrics: null,
          reason: "Normalized Knowledge-v1 Markdown is introduced by Unit 05.",
        },
        {
          mode_id: "mode_3_cli_bootstrap",
          status: "not_available",
          scored: false,
          metrics: null,
          reason:
            "The CLI and selected Skill/AGENTS bootstrap are introduced by Unit 06d.",
        },
        {
          mode_id: "mode_4_mcp_candidate",
          status: "not_available",
          scored: false,
          metrics: null,
          reason:
            "The thin MCP candidate is evaluated only after Units 06g and 07.",
        },
      ],
      catalog_baseline: {
        ...aggregateManifest(manifest, manifestBytes, firstTree),
        timings_ms: timings,
      },
      load_sensitive_tests: [
        {
          id: "load-registry-setup",
          file: "packages/mcp/src/__tests__/loadRegistry.spec.ts",
          setup: "copy a verified complete Catalog-v2 fixture",
          bound_ms: 360000,
          baseline_ms: Number(copyMs.toFixed(3)),
        },
        {
          id: "create-server-setup",
          file: "packages/mcp/src/__tests__/createServer.spec.ts",
          setup: "cold createSaltMcpServer with full prefetch",
          bound_ms: 360000,
          baseline_ms: timings.cold_load,
        },
        {
          id: "outcome-boundaries-setup",
          file: "packages/mcp/src/__tests__/outcomeBoundaries.spec.ts",
          setup: "warm catalog context plus bounded project inspection",
          bound_ms: 360000,
          baseline_ms: Number(
            (timings.warm_load + timings.inspection).toFixed(3),
          ),
        },
      ],
      verification: {
        pack: {
          command: "yarn check:ai-tooling:pack",
          runtime: `Node ${process.versions.node}`,
          status: "required_external_matrix",
          evidence:
            "Executed as a separate Unit 00b gate; this sanitized baseline does not infer another process result.",
        },
        consumer_smoke: [
          {
            command: "yarn smoke:consumer --skip-build",
            runtime: "Node 22",
            status: "required_external_matrix",
            evidence:
              "Release CI matrix requirement; no local result is fabricated.",
          },
          {
            command: "yarn smoke:consumer --skip-build",
            runtime: "Node 24",
            status: "required_external_matrix",
            evidence:
              "Executed as a separate Unit 00b gate and release CI matrix requirement.",
          },
        ],
      },
      limitations: [
        "Catalog-v2 is internal characterization evidence and is not a Knowledge-v1 public compatibility contract.",
        "Timing values are single-host baselines used to derive later explicit bounds, not cross-host performance claims.",
        "No model quality, mode-2/3 uplift, MCP increment, or statistical significance is claimed in Unit 00b.",
        "Node 22/24 pack and consumer smoke remain separate release-matrix gates.",
      ],
    };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const output = path.join(
    repositoryRoot,
    "evals",
    "salt-ai",
    "baselines",
    `${COHORT_ID}.json`,
  );
  const measured = await buildBaseline();
  let existing = null;
  try {
    existing = await readJson(output);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (existing && !args.has("--refresh")) {
    for (const field of [
      "manifest_bytes",
      "artifact_count",
      "artifact_bytes",
      "record_count",
      "semantic_digest",
      "derived_bundle_identity",
      "artifact_set_digest",
    ]) {
      assert(
        existing.catalog_baseline[field] === measured.catalog_baseline[field],
        `Stored baseline drifted at catalog_baseline.${field}`,
      );
    }
    assert(
      existing.identities.manifest_sha256 ===
        measured.identities.manifest_sha256,
      "Stored evaluation manifest identity drifted",
    );
    assert(
      existing.identities.protocol_sha256 ===
        measured.identities.protocol_sha256,
      "Stored evaluation protocol identity drifted",
    );
    assert(
      existing.identities.fixture_sha256 === measured.identities.fixture_sha256,
      "Stored evaluation fixture identity drifted",
    );
    console.log(
      `Salt AI baseline ${COHORT_ID} reproduced; retained reviewed timing measurements.`,
    );
    return;
  }
  await writeJsonAtomic(output, measured);
  console.log(`Wrote Salt AI baseline ${COHORT_ID}.`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(scriptPath)
) {
  await main();
}
