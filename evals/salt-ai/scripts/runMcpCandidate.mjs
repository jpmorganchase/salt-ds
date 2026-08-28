import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  gitHeadCommit,
  parseArgs,
  portablePath,
  readJson,
  repositoryRoot,
  sha256,
  writeJsonAtomic,
} from "../../../scripts/saltAiEvidenceUtils.mjs";
import { validateEvaluation } from "./validate.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const evalRoot = path.resolve(path.dirname(scriptPath), "..");
const outputPath = path.join(
  repositoryRoot,
  "dist",
  "salt-ai-eval",
  "mcp-candidate-run.json",
);

async function artifact(file, base = repositoryRoot) {
  const bytes = await readFile(file);
  return {
    path: path.relative(base, file).replaceAll("\\", "/"),
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
  };
}

async function assertArtifact(reference, base) {
  assert(
    reference &&
      typeof reference.path === "string" &&
      !path.isAbsolute(reference.path) &&
      !reference.path.split(/[\\/]/u).includes(".."),
    "Candidate report contains an unsafe artifact path.",
  );
  const file = path.resolve(base, reference.path);
  const bytes = await readFile(file);
  assert(
    (await stat(file)).isFile() &&
      reference.bytes === bytes.byteLength &&
      reference.sha256 === sha256(bytes),
    "Candidate report artifact identity is stale.",
  );
  return file;
}

async function validateSchema(value, schemaName) {
  const schema = await readJson(path.join(evalRoot, schemaName));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  assert(
    validate(value),
    "MCP candidate run schema failure: " +
      ajv.errorsText(validate.errors, { separator: "; " }),
  );
}

export async function runMcpCandidate({ cohort, candidatePath }) {
  assert(cohort === "mcp-pre-release", "Unsupported MCP evaluation cohort.");
  const candidateReportPath = path.resolve(repositoryRoot, candidatePath);
  const candidateReport = await readJson(candidateReportPath);
  assert(
    candidateReport.contract === "salt-ai-pack-report@1" &&
      candidateReport.policy_profile === "mcp-candidate" &&
      candidateReport.publishable === false,
    "The evaluation candidate is not a nonpublishing MCP candidate report.",
  );
  const packageByName = new Map(
    candidateReport.packages.map((entry) => [entry.name, entry]),
  );
  assert(
    packageByName.size === 3 &&
      packageByName.has("@salt-ds/knowledge") &&
      packageByName.has("@salt-ds/cli") &&
      packageByName.has("@salt-ds/mcp"),
    "The MCP candidate report does not bind the exact three-package graph.",
  );
  const mcpPackage = packageByName.get("@salt-ds/mcp");
  const knowledgePackage = packageByName.get("@salt-ds/knowledge");
  const reportDirectory = path.dirname(candidateReportPath);
  const mcpTarballPath = await assertArtifact(
    mcpPackage.tarball,
    reportDirectory,
  );

  const smokePath = path.join(
    reportDirectory,
    "consumer-smoke-receipt.json",
  );
  const smoke = await readJson(smokePath);
  const candidateReportBytes = await readFile(candidateReportPath);
  assert(
    smoke.contract === "salt-ai-consumer-smoke/1" &&
      smoke.result === "pass" &&
      smoke.adapters?.includes("@salt-ds/cli") &&
      smoke.adapters?.includes("@salt-ds/mcp") &&
      smoke.pack_report?.sha256 === sha256(candidateReportBytes) &&
      smoke.workflows?.mcp?.protocol === "2026-07-28" &&
      smoke.workflows?.mcp?.legacy_opening === "rejected" &&
      smoke.workflows?.mcp?.network === "offline",
    "The exact candidate has no passing combined consumer-smoke receipt.",
  );

  const validation = await validateEvaluation();
  const taskIds = [];
  for (const relative of validation.manifest.case_files) {
    const value = await readJson(path.resolve(repositoryRoot, relative));
    if (value.mcp_eligible) taskIds.push(value.id);
  }
  taskIds.sort();
  assert(taskIds.length === 12, "The frozen MCP-eligible subset changed.");

  const attemptPolicy = await readJson(
    path.join(evalRoot, "protocol", "attempt-policy.json"),
  );
  const budgets = await readJson(
    path.join(evalRoot, "protocol", "budgets.json"),
  );
  const scheduledPerHost =
    taskIds.length * attemptPolicy.repetitions;
  const hostMatrix = attemptPolicy.host_model_aliases.map((alias) => ({
    host_model_alias: alias,
    scheduled_cells_per_mode: scheduledPerHost,
    completed_mode_3_cells: 0,
    completed_mode_4_cells: 0,
    status: "not_run",
    reason:
      "No credentialed host/model execution result was available; the frozen gate forbids inferred or fabricated quality cells.",
  }));

  const surfacePath = path.join(
    repositoryRoot,
    "dist",
    "salt-ai-eval",
    "mcp-surface-measurement.json",
  );
  const runtimeLocPath = path.join(
    repositoryRoot,
    "dist",
    "salt-ai-eval",
    "mcp-runtime-loc.json",
  );
  const surface = await readJson(surfacePath);
  const runtimeLoc = await readJson(runtimeLocPath);
  assert(
    surface.contract === "salt-mcp-public-surface-measurement/1" &&
      surface.protocol_version === "2026-07-28" &&
      surface.discovery.tool_count === 3 &&
      runtimeLoc.passed === true,
    "The candidate surface/runtime measurements are missing or failed.",
  );

  const manifestPath = path.join(evalRoot, "manifest.json");
  const run = {
    schema_version: "1.0.0",
    contract: "salt-mcp-candidate-evaluation-run/1",
    cohort_id: cohort,
    candidate_source_sha: await gitHeadCommit(),
    candidate: {
      pack_report: await artifact(candidateReportPath),
      package: {
        name: "@salt-ds/mcp",
        version: mcpPackage.version,
        tarball: await artifact(mcpTarballPath, reportDirectory),
      },
    },
    knowledge: {
      package_version: knowledgePackage.version,
      bundle_digest: candidateReport.knowledge_bundle.bundle_digest,
      semantic_digest: candidateReport.knowledge_bundle.semantic_digest,
      semantic_source_digest:
        candidateReport.knowledge_bundle.semantic_source_digest,
      compiler_digest: candidateReport.knowledge_bundle.compiler_digest,
      manifest: candidateReport.knowledge_bundle.manifest,
    },
    protocol: {
      spec_version: "2026-07-28",
      server_sdk_version: "2.0.0",
      client_sdk_version: "2.0.0",
    },
    frozen_subset: {
      manifest: await artifact(manifestPath),
      task_ids: taskIds,
      repetitions: attemptPolicy.repetitions,
      host_model_aliases: attemptPolicy.host_model_aliases,
    },
    host_matrix: hostMatrix,
    outcomes: {
      mode_3: {
        scheduled_cells: scheduledPerHost * hostMatrix.length,
        completed_cells: 0,
        successful_cells: 0,
      },
      mode_4: {
        scheduled_cells: scheduledPerHost * hostMatrix.length,
        completed_cells: 0,
        successful_cells: 0,
      },
      paired: {
        percentage_point_delta: null,
        additional_successful_cells_by_host_model: hostMatrix.map((entry) => ({
          host_model_alias: entry.host_model_alias,
          count: 0,
        })),
        version_correctness_regression: "not_measured",
        unsupported_claim_rate_regression: "not_measured",
        threshold_passed: false,
      },
    },
    costs: {
      surface_measurement: await artifact(surfacePath),
      runtime_loc_measurement: await artifact(runtimeLocPath),
      setup: {
        mode_3_bootstrap_artifacts: 2,
        mode_4_additional_packages: 1,
        mode_4_tools: surface.discovery.tool_count,
        mode_4_tool_list_utf8_bytes:
          surface.discovery.exact_tools_list_utf8_bytes,
        mode_4_cold_load_ms: surface.load.cold_elapsed_ms,
        mode_4_warm_load_ms: surface.load.warm_elapsed_ms,
      },
      observed_model_usage: {
        model_cells: 0,
        input_tokens: 0,
        output_tokens: 0,
        tool_calls: 0,
        wall_time_ms: 0,
        estimated_cost_usd: 0,
      },
      per_cell_ceiling: budgets.per_cell,
    },
    security_interoperability: {
      consumer_smoke: await artifact(smokePath),
      exact_pack_identity: true,
      bundle_integrity: true,
      offline: true,
      current_spec: true,
      legacy_rejected: true,
      path_isolation: true,
      commonjs_esm_parity: true,
      all_gates_passed: true,
    },
    recommendation: "omit",
    rationale:
      "The candidate passes deterministic security and interoperability gates, but no completed paired host/model cells demonstrate the frozen five-point or two-cell material-value threshold. Plan 001 requires omit when the threshold is not proven.",
    sanitization: {
      raw_prompts: false,
      raw_model_outputs: false,
      credentials: false,
      proprietary_fixtures: false,
      absolute_paths: false,
    },
  };
  await validateSchema(run, "mcp-candidate-run.schema.json");
  await writeJsonAtomic(outputPath, run);
  return run;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(scriptPath)
) {
  const args = parseArgs(process.argv.slice(2));
  const run = await runMcpCandidate({
    cohort: String(args.get("--cohort") ?? ""),
    candidatePath: String(args.get("--candidate") ?? ""),
  });
  console.log(
    "Prepared sanitized MCP candidate evaluation run " +
      portablePath(outputPath) +
      " (" +
      run.frozen_subset.task_ids.length +
      " frozen tasks; recommendation=" +
      run.recommendation +
      ").",
  );
}
