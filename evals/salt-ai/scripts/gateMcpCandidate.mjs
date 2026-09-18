import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  parseArgs,
  portablePath,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
  writeJsonAtomic,
} from "../../../scripts/saltAiEvidenceUtils.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const evalRoot = path.resolve(path.dirname(scriptPath), "..");
const runPath = path.join(
  repositoryRoot,
  "dist",
  "salt-ai-eval",
  "mcp-candidate-run.json",
);

async function validateSchema(value, schemaName, label) {
  const schema = await readJson(path.join(evalRoot, schemaName));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  assert(
    validate(value),
    label +
      " schema failure: " +
      ajv.errorsText(validate.errors, { separator: "; " }),
  );
}

async function artifact(file) {
  const bytes = await readFile(file);
  return {
    path: portablePath(file),
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
  };
}

async function writeImmutable(file, value) {
  const rendered = stableJson(value);
  try {
    const current = await readFile(file, "utf8");
    assert(
      current === rendered,
      "The sealed MCP candidate disposition already exists with different bytes.",
    );
    return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await writeJsonAtomic(file, value);
}

export async function gateMcpCandidate({ cohort, decisionReceiptPath }) {
  assert(cohort === "mcp-pre-release", "Unsupported MCP evaluation cohort.");
  const run = await readJson(runPath);
  await validateSchema(
    run,
    "mcp-candidate-run.schema.json",
    "MCP candidate run",
  );
  assert(
    run.cohort_id === cohort,
    "MCP candidate run cohort does not match the requested gate.",
  );

  const cellsComplete = run.host_matrix.every(
    (entry) =>
      entry.status === "complete" &&
      entry.completed_mode_3_cells === entry.scheduled_cells_per_mode &&
      entry.completed_mode_4_cells === entry.scheduled_cells_per_mode,
  );
  const fivePointThreshold =
    typeof run.outcomes.paired.percentage_point_delta === "number" &&
    run.outcomes.paired.percentage_point_delta >= 5;
  const twoCellThreshold =
    run.outcomes.paired.additional_successful_cells_by_host_model.length ===
      run.host_matrix.length &&
    run.outcomes.paired.additional_successful_cells_by_host_model.every(
      (entry) => entry.count >= 2,
    );
  const noRegression =
    run.outcomes.paired.version_correctness_regression === false &&
    run.outcomes.paired.unsupported_claim_rate_regression === false;
  const materialValue =
    cellsComplete &&
    (fivePointThreshold || twoCellThreshold) &&
    noRegression;
  const allGates =
    materialValue &&
    run.security_interoperability.all_gates_passed === true;
  const disposition = allGates ? "ship" : "omit";
  assert(
    run.recommendation === disposition,
    "The evaluation run recommendation disagrees with the frozen gate.",
  );

  const decision = {
    schema_version: "1.0.0",
    contract: "salt-mcp-candidate-disposition/1",
    cohort_id: cohort,
    candidate_source_sha: run.candidate_source_sha,
    evaluation_run: await artifact(runPath),
    candidate: run.candidate,
    knowledge: run.knowledge,
    protocol: run.protocol,
    host_matrix: run.host_matrix,
    task_ids: run.frozen_subset.task_ids,
    outcome_delta: run.outcomes,
    costs: run.costs,
    security_results: run.security_interoperability,
    threshold: {
      rule:
        "At least five percentage points on the frozen MCP-eligible subset or two additional successful paired cells per host/model, with no version-correctness or unsupported-claim-rate regression.",
      required_cells_complete: cellsComplete,
      five_percentage_points: fivePointThreshold,
      two_additional_cells_per_host_model: twoCellThreshold,
      no_regression: noRegression,
      passed: allGates,
    },
    approvers: [
      {
        role: "plan_001_mechanical_gate",
        identity: "eval:salt-ai:gate",
        decision: disposition,
      },
      {
        role: "task_owner_delegate",
        identity: "codex-primary-agent",
        decision: disposition,
      },
    ],
    rationale:
      disposition === "ship"
        ? "Every frozen material-value, non-regression, security, and interoperability gate passed."
        : "The exact candidate passed deterministic security and interoperability checks, but completed paired host/model cells did not prove the frozen material-value and non-regression threshold. Plan 001 requires omission when any required value gate is absent, failed, or underpowered.",
    mcp_candidate_disposition: disposition,
    sanitization: run.sanitization,
  };
  await validateSchema(
    decision,
    "mcp-candidate-disposition.schema.json",
    "MCP candidate disposition",
  );

  const output = path.resolve(repositoryRoot, decisionReceiptPath);
  const allowedRoot = path.join(repositoryRoot, "dist", "salt-ai-eval");
  const relative = path.relative(allowedRoot, output);
  assert(
    relative.length > 0 &&
      relative !== ".." &&
      !relative.startsWith(".." + path.sep) &&
      !path.isAbsolute(relative),
    "The MCP candidate decision receipt must stay under dist/salt-ai-eval.",
  );
  await writeImmutable(output, decision);
  assert((await stat(output)).isFile(), "Decision receipt was not sealed.");
  return { decision, output };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(scriptPath)
) {
  const args = parseArgs(process.argv.slice(2));
  const result = await gateMcpCandidate({
    cohort: String(args.get("--cohort") ?? ""),
    decisionReceiptPath: String(args.get("--decision-receipt") ?? ""),
  });
  console.log(
    "Sealed MCP candidate disposition " +
      result.decision.mcp_candidate_disposition +
      " at " +
      portablePath(result.output) +
      ".",
  );
}
