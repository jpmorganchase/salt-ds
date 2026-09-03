import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

import { runAiToolingPackCheck } from "../../../scripts/checkAiToolingPackageDryRun.mjs";
import {
  DOCTOR_METRIC_PREFIX,
  runCliWorkflowCoverage,
  runInstalledDoctorBinaryProcess,
} from "../../../scripts/consumer-smoke/checks.mjs";
import {
  createExactCliInfoRepo,
  createIsolatedPackageManagerEnvironment,
  createNonSaltRepo,
  hashExactDirectoryTree,
  installLocalCliPackages,
  loadExactPackReport,
} from "../../../scripts/consumer-smoke/fixture.mjs";
import {
  getExecutable,
  getInstalledCliBin,
  repoRoot,
  runCommand,
} from "../../../scripts/consumer-smoke/shared.mjs";
import {
  assertFixtureHarness,
  collectDoctorObservation,
  collectFixtureObservation,
  materializeFixture,
  projectDoctorParity,
  requireFixtureManifest,
} from "./run.mjs";

const RUNNER_PATH = "evals/salt-ai/doctor/runtimeFitness.mjs";
const FIXTURE_PATH = "evals/salt-ai/doctor/fixtures.json";
const WORKFLOW_PATH = ".github/workflows/test.yml";
const PACK_REPORT_NAME = "plan-006-doctor.json";
const PACK_ARTIFACTS_NAME = "plan-006-doctor.artifacts";
const PACK_RECEIPT_NAME = "pack-validation.json";
const SHA40 = /^[0-9a-f]{40}$/u;
const SHA64 = /^[0-9a-f]{64}$/u;
const SHA512 = /^sha512-[A-Za-z0-9+/]+={0,2}$/u;
const HOSTS = Object.freeze({
  "linux-node-22": { platform: "linux", architecture: "x64", node_major: 22 },
  "linux-node-24": { platform: "linux", architecture: "x64", node_major: 24 },
  "windows-node-24": {
    platform: "win32",
    architecture: "x64",
    node_major: 24,
  },
});
const WORKLOADS_00 = [
  "zero_worker",
  "one_worker",
  "default_workers",
  "forced_one_worker",
];
const WORKLOADS_02 = WORKLOADS_00.slice(0, 3);
const DECISION_WORKLOADS = new Set(WORKLOADS_02);
const PACK_KEYS = [
  "contract",
  "unit",
  "source_sha",
  "pack_report_sha256",
  "knowledge",
  "decision_runner_sha256",
  "fixture_definition_sha256",
  "consumer",
  "packages",
  "threshold_misses",
];
const OBSERVATION_KEYS = [
  "contract",
  "unit",
  "host",
  "source_sha",
  "pack_report_sha256",
  "packages",
  "pack_validation_sha256",
  "consumer",
  "knowledge",
  "fixture_definition_sha256",
  "runtime",
  "authority",
  "workloads",
];
const WORKLOAD_KEYS = [
  "id",
  "selected_files",
  "selected_bytes",
  "expected_worker_count",
  "functional",
  "batches",
];
const BATCH_KEYS = [
  "warmups",
  "measured_runs",
  "wall_times_ms",
  "peak_rss_bytes",
  "max_wall_ms",
  "p90_wall_ms",
  "p90_peak_rss_bytes",
];
const FUNCTIONAL_KEYS = [
  "schema_valid",
  "semantic_parity",
  "offline",
  "read_only",
  "worker_execution",
  "exit_code_exact",
  "coverage_complete",
];

export class InvocationError extends Error {}
export class EvidenceError extends Error {}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function canonicalBytes(value) {
  return Buffer.from(`${JSON.stringify(value)}\n`, "utf8");
}

function exactKeys(value, keys, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    JSON.stringify(Object.keys(value)) !== JSON.stringify(keys)
  )
    throw new EvidenceError(
      `${label} has unknown, missing, or reordered keys.`,
    );
}

function git(args, encoding = "utf8") {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.toUpperCase().startsWith("GIT_"),
    ),
  );
  return execFileSync("git", args, {
    cwd: repoRoot,
    env,
    encoding,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function gitBlob(commit, locator) {
  return git(["show", `${commit}:${locator}`], null);
}

function currentHead() {
  return String(git(["rev-parse", "--verify", "HEAD^{commit}"])).trim();
}

function requireCleanSource(sourceSha) {
  if (!SHA40.test(sourceSha) || currentHead() !== sourceSha)
    throw new EvidenceError(
      "Requested source SHA is not the checked-out HEAD.",
    );
  if (String(git(["status", "--porcelain=v1", "--untracked-files=all"])))
    throw new EvidenceError("Plan 006 evidence requires a clean checkout.");
}

function stripPackDigest(value, label) {
  if (!/^sha256:[0-9a-f]{64}$/u.test(value))
    throw new EvidenceError(
      `${label} is not one exact sha256-prefixed digest.`,
    );
  return value.slice("sha256:".length);
}

function safeRelativeFileReference(value) {
  return (
    typeof value === "string" &&
    /^file:\.\.\/plan-006-doctor\.artifacts\/[^/]+\.tgz$/u.test(value)
  );
}

function packageNameFromLocator(locator, entry) {
  if (typeof entry.name === "string" && entry.name) return entry.name;
  const marker = "node_modules/";
  const position = locator.lastIndexOf(marker);
  if (position < 0)
    throw new EvidenceError(`Cannot derive package name from ${locator}.`);
  const remainder = locator.slice(position + marker.length);
  const segments = remainder.split("/");
  return segments[0].startsWith("@")
    ? `${segments[0]}/${segments[1] ?? ""}`
    : segments[0];
}

export function productionGraphFromLock(lock) {
  if (lock?.lockfileVersion !== 3 || lock.packages?.[""] === undefined)
    throw new EvidenceError("Consumer lock is not npm lockfile v3.");
  const graph = Object.entries(lock.packages)
    .filter(
      ([locator, entry]) =>
        locator !== "" && entry && entry.dev !== true && entry.link !== true,
    )
    .map(([locator, entry]) => {
      if (
        path.posix.isAbsolute(locator) ||
        locator.includes("\\") ||
        locator.split("/").includes("..") ||
        typeof entry.version !== "string" ||
        !SHA512.test(entry.integrity ?? "")
      )
        throw new EvidenceError(`Invalid production lock entry ${locator}.`);
      return {
        locator,
        name: packageNameFromLocator(locator, entry),
        version: entry.version,
        integrity: entry.integrity,
      };
    })
    .sort((left, right) =>
      left.locator < right.locator ? -1 : left.locator > right.locator ? 1 : 0,
    );
  if (graph.length === 0)
    throw new EvidenceError("Consumer production graph is empty.");
  return graph;
}

function graphDigest(graph) {
  return sha256(canonicalBytes(graph));
}

function externalGraph(graph) {
  return graph.filter(
    ({ name }) => !["@salt-ds/knowledge", "@salt-ds/cli"].includes(name),
  );
}

function metricProbeSource() {
  return [
    'import { writeSync } from "node:fs";',
    'import { isMainThread } from "node:worker_threads";',
    `const prefix = ${JSON.stringify(DOCTOR_METRIC_PREFIX)};`,
    "if (isMainThread) {",
    '  process.once("exit", () => {',
    '    writeSync(2, prefix + JSON.stringify({ max_rss_kib: process.resourceUsage().maxRSS }) + "\\n");',
    "  });",
    "}",
    "",
  ].join("\n");
}

export function percentile90(values) {
  if (
    !Array.isArray(values) ||
    values.length !== 12 ||
    values.some((value) => !Number.isSafeInteger(value) || value < 0)
  )
    throw new EvidenceError(
      "p90 requires exactly twelve nonnegative integer samples.",
    );
  return [...values].sort((left, right) => left - right)[10];
}

function withinFivePercent(value, boundary) {
  return Math.abs(value - boundary) * 20 <= boundary;
}

export function needsBoundaryRerun(batch) {
  return (
    withinFivePercent(batch.max_wall_ms, 5_000) ||
    withinFivePercent(batch.p90_wall_ms, 3_000) ||
    withinFivePercent(batch.p90_peak_rss_bytes, 256 * 1024 * 1024)
  );
}

function batchFailureDimensions(batch) {
  const failures = [];
  if (batch.max_wall_ms > 5_000) failures.push("max_wall_ms");
  if (batch.p90_wall_ms > 3_000) failures.push("p90_wall_ms");
  if (batch.p90_peak_rss_bytes > 256 * 1024 * 1024)
    failures.push("p90_peak_rss_bytes");
  return failures;
}

function batchPasses(batch) {
  return batchFailureDimensions(batch).length === 0;
}

function workloadState(workload) {
  const passes = workload.batches.map(batchPasses);
  if (passes.length === 1) return passes[0] ? "pass" : "stable_miss";
  if (passes.every(Boolean)) return "pass";
  if (passes.every((value) => !value)) return "stable_miss";
  return "contradictory";
}

function hasAbsoluteString(value) {
  if (typeof value === "string")
    return /^(?:[A-Za-z]:[\\/]|\\\\|\/)/u.test(value);
  if (Array.isArray(value)) return value.some(hasAbsoluteString);
  if (value && typeof value === "object")
    return Object.values(value).some(hasAbsoluteString);
  return false;
}

function validateBatch(batch, label) {
  exactKeys(batch, BATCH_KEYS, label);
  if (batch.warmups !== 3 || batch.measured_runs !== 12)
    throw new EvidenceError(`${label} has the wrong sample counts.`);
  for (const [key, values] of [
    ["wall_times_ms", batch.wall_times_ms],
    ["peak_rss_bytes", batch.peak_rss_bytes],
  ]) {
    if (
      !Array.isArray(values) ||
      values.length !== 12 ||
      values.some((value) => !Number.isSafeInteger(value) || value <= 0)
    )
      throw new EvidenceError(`${label} has invalid ${key}.`);
  }
  if (
    batch.max_wall_ms !== Math.max(...batch.wall_times_ms) ||
    batch.p90_wall_ms !== percentile90(batch.wall_times_ms) ||
    batch.p90_peak_rss_bytes !== percentile90(batch.peak_rss_bytes)
  )
    throw new EvidenceError(`${label} contains forged derivations.`);
}

function validatePackReceipt(receipt, readCommittedBlob = gitBlob) {
  exactKeys(receipt, PACK_KEYS, "Pack receipt");
  if (
    receipt.contract !== "salt-ai-plan-006-pack-validation/1" ||
    !["006/00", "006/02"].includes(receipt.unit) ||
    !SHA40.test(receipt.source_sha) ||
    !SHA64.test(receipt.pack_report_sha256) ||
    !SHA64.test(receipt.decision_runner_sha256) ||
    !SHA64.test(receipt.fixture_definition_sha256)
  )
    throw new EvidenceError("Pack receipt identity is invalid.");
  exactKeys(
    receipt.knowledge,
    ["bundle_version", "bundle_digest", "semantic_digest"],
    "Pack Knowledge identity",
  );
  if (
    typeof receipt.knowledge.bundle_version !== "string" ||
    !/^sha256:[0-9a-f]{64}$/u.test(receipt.knowledge.bundle_digest) ||
    !/^sha256:[0-9a-f]{64}$/u.test(receipt.knowledge.semantic_digest) ||
    sha256(readCommittedBlob(receipt.source_sha, RUNNER_PATH)) !==
      receipt.decision_runner_sha256 ||
    sha256(readCommittedBlob(receipt.source_sha, FIXTURE_PATH)) !==
      receipt.fixture_definition_sha256
  )
    throw new EvidenceError(
      "Pack Knowledge, runner, or fixture identity is stale.",
    );
  exactKeys(
    receipt.consumer,
    [
      "package_json_sha256",
      "package_lock_sha256",
      "lockfile_version",
      "preparation_node_version",
      "preparation_npm_version",
      "production_graph_sha256",
      "external_production_graph_sha256",
      "production_graph",
    ],
    "Pack consumer identity",
  );
  if (
    !SHA64.test(receipt.consumer.package_json_sha256) ||
    !SHA64.test(receipt.consumer.package_lock_sha256) ||
    receipt.consumer.lockfile_version !== 3 ||
    !SHA64.test(receipt.consumer.production_graph_sha256) ||
    !SHA64.test(receipt.consumer.external_production_graph_sha256) ||
    graphDigest(receipt.consumer.production_graph) !==
      receipt.consumer.production_graph_sha256 ||
    graphDigest(externalGraph(receipt.consumer.production_graph)) !==
      receipt.consumer.external_production_graph_sha256
  )
    throw new EvidenceError("Pack consumer graph identity is invalid.");
  if (
    !Array.isArray(receipt.packages) ||
    receipt.packages.length !== 2 ||
    JSON.stringify(receipt.packages.map(({ name }) => name)) !==
      JSON.stringify(["@salt-ds/knowledge", "@salt-ds/cli"])
  )
    throw new EvidenceError("Pack receipt package cohort is invalid.");
  for (const entry of receipt.packages) {
    exactKeys(
      entry,
      [
        "name",
        "version",
        "tarball_sha256",
        "packed_bytes",
        "packed_bytes_limit",
        "unpacked_bytes",
        "unpacked_bytes_limit",
        "entry_count",
        "entry_count_limit",
      ],
      `Pack package ${entry.name}`,
    );
    if (
      !SHA64.test(entry.tarball_sha256) ||
      [
        entry.packed_bytes,
        entry.packed_bytes_limit,
        entry.unpacked_bytes,
        entry.unpacked_bytes_limit,
        entry.entry_count,
        entry.entry_count_limit,
      ].some((value) => !Number.isSafeInteger(value) || value < 0) ||
      entry.packed_bytes > entry.packed_bytes_limit ||
      entry.unpacked_bytes > entry.unpacked_bytes_limit ||
      entry.entry_count > entry.entry_count_limit
    )
      throw new EvidenceError(
        `Pack package ${entry.name} metrics are invalid.`,
      );
  }
  if (
    !Array.isArray(receipt.threshold_misses) ||
    receipt.threshold_misses.length
  )
    throw new EvidenceError("Pack receipt contains threshold misses.");
  if (hasAbsoluteString(receipt))
    throw new EvidenceError("Pack receipt contains an absolute path.");
  return receipt;
}

function validateObservation(
  observation,
  packReceipt,
  packReceiptDigest,
  readCommittedBlob = gitBlob,
) {
  exactKeys(observation, OBSERVATION_KEYS, "Runtime observation");
  if (
    observation.contract !== "salt-ai-plan-006-runtime-observation/1" ||
    observation.unit !== packReceipt.unit ||
    observation.source_sha !== packReceipt.source_sha ||
    observation.pack_report_sha256 !== packReceipt.pack_report_sha256 ||
    observation.pack_validation_sha256 !== packReceiptDigest ||
    observation.fixture_definition_sha256 !==
      packReceipt.fixture_definition_sha256
  )
    throw new EvidenceError(
      "Observation candidate identity disagrees with pack receipt.",
    );
  const host = HOSTS[observation.host];
  if (!host) throw new EvidenceError("Observation host is not registered.");
  if (
    JSON.stringify(observation.packages) !==
    JSON.stringify(packReceipt.packages)
  )
    throw new EvidenceError(
      "Observation package identity disagrees with pack receipt.",
    );
  if (
    JSON.stringify(observation.consumer) !==
      JSON.stringify({
        package_json_sha256: packReceipt.consumer.package_json_sha256,
        package_lock_sha256: packReceipt.consumer.package_lock_sha256,
        production_graph_sha256: packReceipt.consumer.production_graph_sha256,
      }) ||
    JSON.stringify(observation.knowledge) !==
      JSON.stringify(packReceipt.knowledge)
  )
    throw new EvidenceError(
      "Observation lock, graph, or Knowledge identity changed.",
    );
  exactKeys(
    observation.runtime,
    [
      "node_version",
      "install_npm_version",
      "platform",
      "architecture",
      "module_surface",
    ],
    "Runtime identity",
  );
  if (
    Number(observation.runtime.node_version.split(".")[0]) !==
      host.node_major ||
    observation.runtime.platform !== host.platform ||
    observation.runtime.architecture !== host.architecture ||
    observation.runtime.module_surface !== "installed_binary"
  )
    throw new EvidenceError(
      "Observation runtime does not match its host identity.",
    );
  if (
    !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(
      observation.runtime.install_npm_version,
    )
  )
    throw new EvidenceError("Observation install npm version is invalid.");
  exactKeys(
    observation.authority,
    [
      "provider",
      "workflow_path",
      "workflow_sha256",
      "run_id",
      "run_attempt",
      "job_key",
      "runner_image",
      "runner_version",
    ],
    "Observation authority",
  );
  if (
    observation.authority.provider !== "github_actions" ||
    observation.authority.workflow_path !== WORKFLOW_PATH ||
    !SHA64.test(observation.authority.workflow_sha256) ||
    !Number.isSafeInteger(observation.authority.run_id) ||
    observation.authority.run_id < 1 ||
    !Number.isSafeInteger(observation.authority.run_attempt) ||
    observation.authority.run_attempt < 1 ||
    observation.authority.job_key !== `plan-006-${observation.host}` ||
    !observation.authority.runner_image ||
    !observation.authority.runner_version
  )
    throw new EvidenceError(
      "Observation authority is not an accepted GitHub Actions job.",
    );
  const expectedWorkloads =
    observation.unit === "006/00" ? WORKLOADS_00 : WORKLOADS_02;
  if (
    !Array.isArray(observation.workloads) ||
    JSON.stringify(observation.workloads.map(({ id }) => id)) !==
      JSON.stringify(expectedWorkloads)
  )
    throw new EvidenceError(
      "Observation workloads are missing, extra, or reordered.",
    );
  const fixtureManifest = JSON.parse(
    readCommittedBlob(observation.source_sha, FIXTURE_PATH).toString("utf8"),
  );
  const sourceFixture = fixtureManifest.fixtures?.find(
    ({ id }) => id === "repair-family-a-workspace",
  );
  if (typeof sourceFixture?.source !== "string")
    throw new EvidenceError("Frozen workload source fixture is missing.");
  const oneFileBytes = Buffer.byteLength(sourceFixture.source, "utf8");
  observation.workloads.forEach((workload) => {
    exactKeys(workload, WORKLOAD_KEYS, `Workload ${workload.id}`);
    if (
      !Number.isSafeInteger(workload.selected_files) ||
      workload.selected_files < 0 ||
      !Number.isSafeInteger(workload.selected_bytes) ||
      workload.selected_bytes < 0 ||
      !Number.isSafeInteger(workload.expected_worker_count) ||
      workload.expected_worker_count < 0
    )
      throw new EvidenceError(`Workload ${workload.id} counts are invalid.`);
    const expectedCounts = {
      zero_worker: [0, 0, 0],
      one_worker: [1, 1, oneFileBytes],
      default_workers: [25, 2, oneFileBytes * 25],
      forced_one_worker: [25, 1, oneFileBytes * 25],
    }[workload.id];
    if (
      workload.selected_files !== expectedCounts[0] ||
      workload.expected_worker_count !== expectedCounts[1] ||
      workload.selected_bytes !== expectedCounts[2] ||
      workload.selected_bytes > 256 * 1024
    )
      throw new EvidenceError(
        `Workload ${workload.id} does not bind its frozen load shape.`,
      );
    exactKeys(
      workload.functional,
      FUNCTIONAL_KEYS,
      `${workload.id} functional result`,
    );
    if (Object.values(workload.functional).some((value) => value !== true))
      throw new EvidenceError(
        `Workload ${workload.id} has a functional failure.`,
      );
    if (
      !Array.isArray(workload.batches) ||
      ![1, 2].includes(workload.batches.length)
    )
      throw new EvidenceError(
        `Workload ${workload.id} has the wrong batch count.`,
      );
    workload.batches.forEach((batch, index) => {
      validateBatch(batch, `${workload.id} batch ${index + 1}`);
    });
    const requiredSecond = needsBoundaryRerun(workload.batches[0]);
    if (requiredSecond !== (workload.batches.length === 2))
      throw new EvidenceError(
        `Workload ${workload.id} violates the near-boundary rerun rule.`,
      );
  });
  if (hasAbsoluteString(observation))
    throw new EvidenceError("Runtime observation contains an absolute path.");
  return observation;
}

export function decideFromReceipts(
  packReceiptInput,
  observationInputs,
  options = {},
) {
  const readCommittedBlob = options.readCommittedBlob ?? gitBlob;
  const packReceipt = validatePackReceipt(
    structuredClone(packReceiptInput),
    readCommittedBlob,
  );
  if (!Array.isArray(observationInputs) || observationInputs.length !== 3)
    throw new InvocationError("decide requires exactly three observations.");
  const packReceiptDigest = sha256(canonicalBytes(packReceipt));
  const observations = observationInputs.map((observation) =>
    validateObservation(
      structuredClone(observation),
      packReceipt,
      packReceiptDigest,
      readCommittedBlob,
    ),
  );
  if (
    JSON.stringify(observations.map(({ host }) => host)) !==
    JSON.stringify(Object.keys(HOSTS))
  )
    throw new EvidenceError(
      "Required hosts are missing, duplicated, or reordered.",
    );
  const workflowDigest = sha256(
    readCommittedBlob(packReceipt.source_sha, WORKFLOW_PATH),
  );
  if (
    observations.some(
      ({ authority }) => authority.workflow_sha256 !== workflowDigest,
    )
  )
    throw new EvidenceError("Observation workflow digest is stale.");

  const decisionWorkloads = observations.flatMap(({ workloads }) =>
    workloads.filter(({ id }) => DECISION_WORKLOADS.has(id)),
  );
  const states = decisionWorkloads.map(workloadState);
  let result;
  if (states.includes("stable_miss"))
    result =
      packReceipt.unit === "006/00"
        ? "FIX_DUPLICATE_RUNTIME_ONCE"
        : "RETIRE_INTERACTIVE_DOCTOR";
  else if (states.includes("contradictory")) result = "INCONCLUSIVE_RUNTIME";
  else
    result =
      packReceipt.unit === "006/00"
        ? "PASS_RUNTIME_BASELINE"
        : "PASS_TECHNICAL_FIT";

  const decision = {
    contract: "salt-ai-plan-006-decision/1",
    unit: packReceipt.unit,
    result,
  };
  if (packReceipt.unit === "006/00") {
    const all = observations.flatMap(({ workloads }) => workloads);
    const oneWorkerRssPasses = all
      .filter(({ id }) => id === "one_worker")
      .every(({ batches }) =>
        batches.every(
          ({ p90_peak_rss_bytes: rss }) => rss <= 256 * 1024 * 1024,
        ),
      );
    const defaultWorkloads = all.filter(({ id }) => id === "default_workers");
    const defaultFailures = defaultWorkloads.flatMap(({ batches }) =>
      batches.flatMap(batchFailureDimensions),
    );
    const defaultOnlyRss =
      defaultFailures.length > 0 &&
      defaultFailures.every((failure) => failure === "p90_peak_rss_bytes");
    const forcedPasses = all
      .filter(({ id }) => id === "forced_one_worker")
      .every((workload) => workloadState(workload) === "pass");
    decision.worker_concurrency_one_eligible =
      oneWorkerRssPasses && defaultOnlyRss && forcedPasses;
  }
  return decision;
}

async function npmVersion(cwd, environment) {
  const result = await runCommand(getExecutable("npm"), ["--version"], {
    cwd,
    env: environment,
    label: "read npm version",
  });
  const version = result.stdout.trim();
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(version))
    throw new EvidenceError("npm returned an invalid version.");
  return version;
}

async function readCanonicalJson(locator, label) {
  let bytes;
  try {
    bytes = await fs.readFile(locator);
  } catch (error) {
    if (error?.code === "ENOENT")
      throw new InvocationError(`${label} input is missing.`);
    throw error;
  }
  let value;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new EvidenceError(`${label} contains malformed JSON.`);
  }
  if (!bytes.equals(canonicalBytes(value)))
    throw new EvidenceError(`${label} is not canonical compact LF JSON.`);
  return { bytes, value };
}

function requireTransportLayout(transportRoot, packValidationPath) {
  const root = path.resolve(transportRoot);
  if (
    path.resolve(packValidationPath) !== path.join(root, PACK_RECEIPT_NAME) ||
    path.basename(root) !== "transport"
  )
    throw new InvocationError(
      "Plan 006 transport must use the fixed transport layout.",
    );
  return root;
}

async function prepare({
  unit,
  sourceSha,
  transportRoot,
  packValidationPath,
  baseline,
}) {
  requireCleanSource(sourceSha);
  const root = requireTransportLayout(transportRoot, packValidationPath);
  await fs.mkdir(root, { recursive: true });
  const reportPath = path.join(root, PACK_REPORT_NAME);
  const relativeReport = path
    .relative(repoRoot, reportPath)
    .replaceAll("\\", "/");
  if (relativeReport.startsWith("../") || path.isAbsolute(relativeReport))
    throw new InvocationError("Transport root must be inside the checkout.");
  const pack = runAiToolingPackCheck(["--report", relativeReport], {
    log() {},
  });
  if (pack.threshold_misses.length !== 0)
    throw new EvidenceError("Pack checker reported a package threshold miss.");
  const exactPack = await loadExactPackReport(relativeReport);
  if (path.basename(pack.artifact_directory) !== PACK_ARTIFACTS_NAME)
    throw new EvidenceError("Pack checker produced the wrong artifact layout.");

  const consumerRoot = path.join(root, "consumer");
  await fs.mkdir(consumerRoot, { recursive: true });
  const packageByName = new Map(
    pack.report.packages.map((entry) => [entry.name, entry]),
  );
  const knowledgePackage = packageByName.get("@salt-ds/knowledge");
  const cliPackage = packageByName.get("@salt-ds/cli");
  if (!knowledgePackage || !cliPackage || packageByName.size !== 2)
    throw new EvidenceError(
      "Pack checker did not return the exact CLI/Knowledge cohort.",
    );
  const manifest = {
    name: "salt-plan-006-doctor-consumer",
    private: true,
    dependencies: {
      "@salt-ds/knowledge": `file:../${knowledgePackage.tarball.path}`,
      "@salt-ds/cli": `file:../${cliPackage.tarball.path}`,
    },
  };
  if (
    Object.values(manifest.dependencies).some(
      (value) => !safeRelativeFileReference(value),
    )
  )
    throw new EvidenceError(
      "Consumer manifest contains an unsafe tarball reference.",
    );
  const manifestBytes = canonicalBytes(manifest);
  const manifestPath = path.join(consumerRoot, "package.json");
  await fs.writeFile(manifestPath, manifestBytes, { flag: "wx" });
  const packageManagerState = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-plan-006-npm-"),
  );
  let preparationNpmVersion;
  try {
    const environment = await createIsolatedPackageManagerEnvironment(
      consumerRoot,
      { cacheRoot: packageManagerState, writeYarnConfig: false },
    );
    preparationNpmVersion = await npmVersion(consumerRoot, environment);
    await runCommand(
      getExecutable("npm"),
      [
        "install",
        "--package-lock-only",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
      ],
      {
        cwd: consumerRoot,
        env: environment,
        label: "prepare Plan 006 shared consumer lock",
      },
    );
  } finally {
    await fs.rm(packageManagerState, { recursive: true, force: true });
  }
  const lockPath = path.join(consumerRoot, "package-lock.json");
  const lockBytes = await fs.readFile(lockPath);
  const lock = JSON.parse(lockBytes.toString("utf8"));
  const graph = productionGraphFromLock(lock);
  const metricsByName = new Map(
    pack.package_metrics.map((entry) => [entry.name, entry]),
  );
  const packages = [knowledgePackage, cliPackage].map((entry) => {
    const metrics = metricsByName.get(entry.name);
    if (!metrics)
      throw new EvidenceError(`Missing package metrics for ${entry.name}.`);
    return {
      name: entry.name,
      version: entry.version,
      tarball_sha256: stripPackDigest(
        entry.tarball.sha256,
        `${entry.name} tarball`,
      ),
      packed_bytes: metrics.compressed_bytes,
      packed_bytes_limit: metrics.limits.compressed_bytes,
      unpacked_bytes: metrics.unpacked_bytes,
      unpacked_bytes_limit: metrics.limits.unpacked_bytes,
      entry_count: metrics.entry_count,
      entry_count_limit: metrics.limits.entry_count,
    };
  });
  const receipt = {
    contract: "salt-ai-plan-006-pack-validation/1",
    unit,
    source_sha: sourceSha,
    pack_report_sha256: stripPackDigest(pack.report_sha256, "Pack report"),
    knowledge: {
      bundle_version: knowledgePackage.version,
      bundle_digest: pack.report.knowledge_bundle.bundle_digest,
      semantic_digest: pack.report.knowledge_bundle.semantic_digest,
    },
    decision_runner_sha256: sha256(gitBlob(sourceSha, RUNNER_PATH)),
    fixture_definition_sha256: sha256(gitBlob(sourceSha, FIXTURE_PATH)),
    consumer: {
      package_json_sha256: sha256(manifestBytes),
      package_lock_sha256: sha256(lockBytes),
      lockfile_version: lock.lockfileVersion,
      preparation_node_version: process.versions.node,
      preparation_npm_version: preparationNpmVersion,
      production_graph_sha256: graphDigest(graph),
      external_production_graph_sha256: graphDigest(externalGraph(graph)),
      production_graph: graph,
    },
    packages,
    threshold_misses: [],
  };
  validatePackReceipt(receipt);
  if (unit === "006/02") {
    if (!baseline)
      throw new InvocationError(
        "Unit 006/02 prepare requires its Unit 006/00 baseline receipt.",
      );
    const baselineReceipt = validatePackReceipt(
      (
        await readCanonicalJson(
          path.resolve(baseline),
          "Unit 006/00 pack receipt",
        )
      ).value,
    );
    if (
      baselineReceipt.unit !== "006/00" ||
      baselineReceipt.consumer.package_json_sha256 !==
        receipt.consumer.package_json_sha256 ||
      baselineReceipt.consumer.external_production_graph_sha256 !==
        receipt.consumer.external_production_graph_sha256 ||
      JSON.stringify(
        externalGraph(baselineReceipt.consumer.production_graph),
      ) !== JSON.stringify(externalGraph(receipt.consumer.production_graph))
    )
      throw new EvidenceError(
        "Unit 006/02 external consumer graph drifted from Unit 006/00.",
      );
  }
  await fs.writeFile(packValidationPath, canonicalBytes(receipt), {
    flag: "wx",
  });
  await validateTransport(root, packValidationPath);
  return receipt;
}

async function validateTransport(transportRoot, packValidationPath) {
  const root = requireTransportLayout(transportRoot, packValidationPath);
  const { bytes: receiptBytes, value: receiptValue } = await readCanonicalJson(
    packValidationPath,
    "Pack validation receipt",
  );
  const receipt = validatePackReceipt(receiptValue);
  const reportBytes = await fs.readFile(path.join(root, PACK_REPORT_NAME));
  if (sha256(reportBytes) !== receipt.pack_report_sha256)
    throw new EvidenceError("Transport pack report digest changed.");
  const report = JSON.parse(reportBytes.toString("utf8"));
  if (!Array.isArray(report.packages) || report.packages.length !== 2)
    throw new EvidenceError("Transport pack report package cohort is invalid.");
  const reportByName = new Map(
    report.packages.map((entry) => [entry.name, entry]),
  );
  for (const entry of receipt.packages) {
    const reportEntry = reportByName.get(entry.name);
    const expectedPath = path.join(
      root,
      ...reportEntry.tarball.path.split("/"),
    );
    if (
      reportEntry.version !== entry.version ||
      stripPackDigest(
        reportEntry.tarball.sha256,
        `${entry.name} report tarball`,
      ) !== entry.tarball_sha256 ||
      sha256(await fs.readFile(expectedPath)) !== entry.tarball_sha256
    )
      throw new EvidenceError(
        `${entry.name} transport tarball identity changed.`,
      );
  }
  const consumerRoot = path.join(root, "consumer");
  const manifestBytes = await fs.readFile(
    path.join(consumerRoot, "package.json"),
  );
  const lockBytes = await fs.readFile(
    path.join(consumerRoot, "package-lock.json"),
  );
  const graph = productionGraphFromLock(JSON.parse(lockBytes.toString("utf8")));
  if (
    sha256(manifestBytes) !== receipt.consumer.package_json_sha256 ||
    sha256(lockBytes) !== receipt.consumer.package_lock_sha256 ||
    graphDigest(graph) !== receipt.consumer.production_graph_sha256 ||
    JSON.stringify(graph) !== JSON.stringify(receipt.consumer.production_graph)
  )
    throw new EvidenceError(
      "Transport consumer manifest, lock, or graph changed.",
    );
  const expectedFiles = new Set([
    PACK_REPORT_NAME,
    PACK_RECEIPT_NAME,
    "consumer/package.json",
    "consumer/package-lock.json",
    ...report.packages.map(({ tarball }) => tarball.path),
  ]);
  const actualFiles = [];
  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const stats = await fs.lstat(absolute);
      if (stats.isSymbolicLink())
        throw new EvidenceError("Transport contains a symbolic link.");
      if (stats.isDirectory()) await walk(absolute);
      else if (stats.isFile())
        actualFiles.push(path.relative(root, absolute).replaceAll("\\", "/"));
      else throw new EvidenceError("Transport contains a special file.");
    }
  }
  await walk(root);
  actualFiles.sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify([...expectedFiles].sort()))
    throw new EvidenceError("Transport fixed-layout file set changed.");
  return { root, receipt, receiptDigest: sha256(receiptBytes), consumerRoot };
}

async function createWorkloadRoots(parent, candidateManifest, unit) {
  const fixtures = requireFixtureManifest().fixtures;
  const zeroFixture = fixtures.find(({ id }) => id === "non-salt-control");
  const oneFixture = fixtures.find(
    ({ id }) => id === "repair-family-a-workspace",
  );
  if (!zeroFixture || !oneFixture)
    throw new EvidenceError(
      "Frozen Doctor fixtures are missing required workload sources.",
    );
  const specifications = [
    { id: "zero_worker", fixture: zeroFixture, selectedFiles: 0, workers: 0 },
    { id: "one_worker", fixture: oneFixture, selectedFiles: 1, workers: 1 },
    {
      id: "default_workers",
      fixture: oneFixture,
      selectedFiles: 25,
      workers: 2,
    },
  ];
  if (unit === "006/00")
    specifications.push({
      id: "forced_one_worker",
      fixture: {
        ...oneFixture,
        config: { limits: { worker_concurrency: 1 } },
      },
      selectedFiles: 25,
      workers: 1,
    });
  const workloads = [];
  for (const specification of specifications) {
    const root = path.join(parent, specification.id);
    await fs.mkdir(root);
    await materializeFixture(root, specification.fixture, candidateManifest, {
      externalTooling: true,
    });
    if (specification.selectedFiles === 25) {
      for (let index = 1; index < 25; index += 1) {
        const duplicatePath = path.join(
          root,
          "packages",
          "app",
          "src",
          `Plan006Case${String(index).padStart(2, "0")}.tsx`,
        );
        await fs.writeFile(duplicatePath, oneFixture.source, "utf8");
      }
    }
    const selectedBytes =
      specification.selectedFiles === 0
        ? 0
        : Buffer.byteLength(oneFixture.source, "utf8") *
          specification.selectedFiles;
    const expectedFindingPaths =
      specification.selectedFiles === 0
        ? []
        : [
            oneFixture.source_path,
            ...Array.from(
              { length: specification.selectedFiles - 1 },
              (_, index) =>
                `packages/app/src/Plan006Case${String(index + 1).padStart(2, "0")}.tsx`,
            ),
          ].sort();
    workloads.push({
      ...specification,
      root,
      selectedBytes,
      expectedStatus: specification.selectedFiles ? "complete" : "not_salt",
      expectedReason: specification.selectedFiles
        ? "SALT_PROJECT_SELECTED"
        : "SALT_PROJECT_NO_SALT_PACKAGES",
      expectedExit: specification.selectedFiles ? 1 : 3,
      expectedFindingPaths,
      expectedSemanticDigest: candidateManifest.semantic_digest,
    });
  }
  return workloads;
}

function validateMeasuredResult(measured, workload, validateSchema, reference) {
  if (!validateSchema(measured.result))
    throw new EvidenceError(
      `${workload.id} failed Doctor schema validation: ${JSON.stringify(validateSchema.errors)}.`,
    );
  const coverage = measured.result.coverage;
  const findingPaths = measured.result.findings
    .map(({ location }) => location?.path)
    .sort();
  const exact =
    measured.exit_code === workload.expectedExit &&
    measured.result.status === workload.expectedStatus &&
    measured.result.reason_code === workload.expectedReason &&
    measured.result.knowledge.semantic_digest ===
      workload.expectedSemanticDigest &&
    coverage.selected_files === workload.selectedFiles &&
    coverage.evaluated_files === workload.selectedFiles &&
    measured.result.root.discovery.selected_bytes === workload.selectedBytes &&
    JSON.stringify(findingPaths) ===
      JSON.stringify(workload.expectedFindingPaths);
  if (!exact)
    throw new EvidenceError(
      `${workload.id} changed expected output, exit, or coverage.`,
    );
  if (workload.selectedFiles > 0) {
    if (
      coverage.status !== "complete" ||
      measured.result.findings.length !== workload.selectedFiles ||
      measured.result.findings.some(
        (finding) =>
          finding.rule_id !== "salt.component.action_navigation_target" ||
          finding.workspace_unit_id !== "packages/app",
      ) ||
      !coverage.evaluated_rule_ids.includes(
        "salt.component.action_navigation_target",
      )
    )
      throw new EvidenceError(
        `${workload.id} lost complete expected rule coverage.`,
      );
  } else if (
    coverage.selected_files !== 0 ||
    coverage.evaluated_files !== 0 ||
    measured.result.findings.length !== 0
  )
    throw new EvidenceError("zero_worker unexpectedly evaluated Salt sources.");
  const projected = JSON.stringify(projectDoctorParity(measured.result));
  if (reference.value === null) reference.value = projected;
  else if (reference.value !== projected)
    throw new EvidenceError(
      `${workload.id} changed semantic output between processes.`,
    );
}

async function collectBatch({
  workload,
  installedCliBinPath,
  validateSchema,
  metricProbeUrl,
  semanticReference,
}) {
  const runOnce = async () => {
    const measured = await runInstalledDoctorBinaryProcess({
      installedCliBinPath,
      fixtureRoot: workload.root,
      validate: validateSchema,
      metricProbeUrl,
      acceptableExitCodes: [workload.expectedExit],
    });
    validateMeasuredResult(
      measured,
      workload,
      validateSchema,
      semanticReference,
    );
    return measured;
  };
  const treeBefore = await hashExactDirectoryTree(workload.root);
  for (let index = 0; index < 3; index += 1) await runOnce();
  const measured = [];
  for (let index = 0; index < 12; index += 1) measured.push(await runOnce());
  if ((await hashExactDirectoryTree(workload.root)) !== treeBefore)
    throw new EvidenceError(`${workload.id} mutated its repository.`);
  const wallTimes = measured.map(({ wall_ms: value }) => value);
  const peakRss = measured.map(({ peak_rss_bytes: value }) => value);
  return {
    warmups: 3,
    measured_runs: 12,
    wall_times_ms: wallTimes,
    peak_rss_bytes: peakRss,
    max_wall_ms: Math.max(...wallTimes),
    p90_wall_ms: percentile90(wallTimes),
    p90_peak_rss_bytes: percentile90(peakRss),
  };
}

function githubAuthority(sourceSha, host) {
  if (process.env.GITHUB_ACTIONS !== "true")
    throw new EvidenceError(
      "Authoritative observations require GitHub Actions.",
    );
  const runId = Number(process.env.GITHUB_RUN_ID);
  const runAttempt = Number(process.env.GITHUB_RUN_ATTEMPT);
  const runnerImage = process.env.ImageOS;
  const runnerVersion = process.env.ImageVersion;
  if (
    !Number.isSafeInteger(runId) ||
    runId < 1 ||
    !Number.isSafeInteger(runAttempt) ||
    runAttempt < 1 ||
    !runnerImage ||
    !runnerVersion
  )
    throw new EvidenceError("GitHub Actions authority metadata is incomplete.");
  return {
    provider: "github_actions",
    workflow_path: WORKFLOW_PATH,
    workflow_sha256: sha256(gitBlob(sourceSha, WORKFLOW_PATH)),
    run_id: runId,
    run_attempt: runAttempt,
    job_key: `plan-006-${host}`,
    runner_image: runnerImage,
    runner_version: runnerVersion,
  };
}

async function observe({
  unit,
  host,
  sourceSha,
  transportRoot,
  packValidationPath,
  output,
}) {
  requireCleanSource(sourceSha);
  const expectedHost = HOSTS[host];
  if (!expectedHost)
    throw new InvocationError("observe requires a registered host.");
  if (
    process.platform !== expectedHost.platform ||
    process.arch !== expectedHost.architecture ||
    Number(process.versions.node.split(".")[0]) !== expectedHost.node_major
  )
    throw new EvidenceError(
      "observe runtime does not match the requested host.",
    );
  const transport = await validateTransport(transportRoot, packValidationPath);
  if (
    transport.receipt.unit !== unit ||
    transport.receipt.source_sha !== sourceSha
  )
    throw new EvidenceError(
      "observe unit/source differs from the transport receipt.",
    );
  const packageManagerState = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-plan-006-npm-"),
  );
  let installNpmVersion;
  const lockPath = path.join(transport.consumerRoot, "package-lock.json");
  const lockBefore = sha256(await fs.readFile(lockPath));
  try {
    const environment = await createIsolatedPackageManagerEnvironment(
      transport.consumerRoot,
      { cacheRoot: packageManagerState, writeYarnConfig: false },
    );
    installNpmVersion = await npmVersion(transport.consumerRoot, environment);
    await runCommand(
      getExecutable("npm"),
      ["ci", "--ignore-scripts", "--no-audit", "--no-fund"],
      {
        cwd: transport.consumerRoot,
        env: environment,
        label: "install Plan 006 fixed consumer lock",
      },
    );
  } finally {
    await fs.rm(packageManagerState, { recursive: true, force: true });
  }
  if (sha256(await fs.readFile(lockPath)) !== lockBefore)
    throw new EvidenceError("npm ci changed the shared consumer lock.");
  const installedCliDir = path.join(
    transport.consumerRoot,
    "node_modules",
    "@salt-ds",
    "cli",
  );
  const schema = JSON.parse(
    await fs.readFile(
      path.join(installedCliDir, "schemas", "doctor-result-1.schema.json"),
      "utf8",
    ),
  );
  const validateSchema = new Ajv2020({ strict: true }).compile(schema);
  const candidateManifest = JSON.parse(
    await fs.readFile(
      path.join(
        transport.consumerRoot,
        "node_modules",
        "@salt-ds",
        "knowledge",
        "manifest.json",
      ),
      "utf8",
    ),
  );
  if (
    candidateManifest.bundle_digest !==
      transport.receipt.knowledge.bundle_digest ||
    candidateManifest.semantic_digest !==
      transport.receipt.knowledge.semantic_digest
  )
    throw new EvidenceError(
      "Installed Knowledge identity differs from pack validation.",
    );
  const parent = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-plan-006-runtime-"),
  );
  try {
    const probePath = path.join(parent, "process-metric-probe.mjs");
    await fs.writeFile(probePath, metricProbeSource(), { flag: "wx" });
    const workloads = await createWorkloadRoots(
      parent,
      candidateManifest,
      unit,
    );
    const installedCliBinPath = getInstalledCliBin(transport.consumerRoot);
    const workloadReceipts = [];
    for (const workload of workloads) {
      const semanticReference = { value: null };
      const first = await collectBatch({
        workload,
        installedCliBinPath,
        validateSchema,
        metricProbeUrl: pathToFileURL(probePath).href,
        semanticReference,
      });
      const batches = [first];
      if (needsBoundaryRerun(first))
        batches.push(
          await collectBatch({
            workload,
            installedCliBinPath,
            validateSchema,
            metricProbeUrl: pathToFileURL(probePath).href,
            semanticReference,
          }),
        );
      workloadReceipts.push({
        id: workload.id,
        selected_files: workload.selectedFiles,
        selected_bytes: workload.selectedBytes,
        expected_worker_count: workload.workers,
        functional: {
          schema_valid: true,
          semantic_parity: true,
          offline: true,
          read_only: true,
          worker_execution: true,
          exit_code_exact: true,
          coverage_complete: true,
        },
        batches,
      });
    }
    const observation = {
      contract: "salt-ai-plan-006-runtime-observation/1",
      unit,
      host,
      source_sha: sourceSha,
      pack_report_sha256: transport.receipt.pack_report_sha256,
      packages: transport.receipt.packages,
      pack_validation_sha256: transport.receiptDigest,
      consumer: {
        package_json_sha256: transport.receipt.consumer.package_json_sha256,
        package_lock_sha256: transport.receipt.consumer.package_lock_sha256,
        production_graph_sha256:
          transport.receipt.consumer.production_graph_sha256,
      },
      knowledge: transport.receipt.knowledge,
      fixture_definition_sha256: transport.receipt.fixture_definition_sha256,
      runtime: {
        node_version: process.versions.node,
        install_npm_version: installNpmVersion,
        platform: process.platform,
        architecture: process.arch,
        module_surface: "installed_binary",
      },
      authority: githubAuthority(sourceSha, host),
      workloads: workloadReceipts,
    };
    validateObservation(
      observation,
      transport.receipt,
      transport.receiptDigest,
    );
    await fs.writeFile(path.resolve(output), canonicalBytes(observation), {
      flag: "wx",
    });
    return observation;
  } finally {
    await fs.rm(parent, { recursive: true, force: true });
  }
}

async function verifyCandidate(packReportPath) {
  const exactPack = await loadExactPackReport(packReportPath);
  const parent = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-plan-006-verify-"),
  );
  try {
    const installRoot = path.join(parent, "installed-tools");
    const exactSaltRoot = path.join(parent, "exact-salt-app");
    const nonSaltRoot = path.join(parent, "non-salt-app");
    await installLocalCliPackages(installRoot, exactPack, { log() {} });
    await Promise.all([fs.mkdir(exactSaltRoot), fs.mkdir(nonSaltRoot)]);
    await Promise.all([
      createExactCliInfoRepo(exactSaltRoot),
      createNonSaltRepo(nonSaltRoot),
    ]);
    const smoke = await runCliWorkflowCoverage(
      installRoot,
      exactSaltRoot,
      nonSaltRoot,
      exactPack,
      {
        captureThresholdMisses: true,
        log() {},
        doctorHarness: {
          assertFixtureHarness,
          collectDoctorObservation,
          collectFixtureObservation,
          materializeFixture,
          projectDoctorParity,
          requireFixtureManifest,
        },
      },
    );
    if (
      smoke.network !== "offline" ||
      smoke.doctor.source_parity !== true ||
      smoke.doctor.read_only !== true ||
      smoke.doctor.export_modes.cjs !== true ||
      smoke.doctor.export_modes.esm !== true ||
      smoke.doctor.worker_mutations.cjs_missing_rejected !== true ||
      smoke.doctor.worker_mutations.esm_missing_rejected !== true ||
      smoke.doctor.fixtures.length !== 6
    )
      throw new EvidenceError(
        "Packed candidate failed functional Doctor verification.",
      );
  } finally {
    await fs.rm(parent, { recursive: true, force: true });
  }
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--"))
      throw new InvocationError(`Unexpected argument: ${key}`);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--"))
      throw new InvocationError(`${key} requires a value.`);
    if (key === "--observation") {
      const observations = values.get(key) ?? [];
      observations.push(value);
      values.set(key, observations);
    } else {
      if (values.has(key))
        throw new InvocationError(`Duplicate option: ${key}`);
      values.set(key, value);
    }
    index += 1;
  }
  const mode = values.get("--mode");
  const allowedByMode = {
    prepare: new Set([
      "--mode",
      "--unit",
      "--source-sha",
      "--transport-root",
      "--pack-validation",
      "--baseline-pack-validation",
    ]),
    observe: new Set([
      "--mode",
      "--unit",
      "--host",
      "--source-sha",
      "--transport-root",
      "--pack-validation",
      "--output",
    ]),
    "verify-candidate": new Set(["--mode", "--unit", "--pack-report"]),
    decide: new Set(["--mode", "--unit", "--pack-validation", "--observation"]),
  };
  const allowed = allowedByMode[mode];
  if (!allowed) throw new InvocationError("Unknown or missing Plan 006 mode.");
  for (const key of values.keys())
    if (!allowed.has(key))
      throw new InvocationError(`Unknown option for ${mode}: ${key}`);
  const unit = values.get("--unit");
  if (
    (mode === "verify-candidate" && unit !== "006/01") ||
    (mode !== "verify-candidate" && !["006/00", "006/02"].includes(unit))
  )
    throw new InvocationError(`${mode} does not accept unit ${String(unit)}.`);
  return { mode, unit, values };
}

export async function runCli(argv, io = process) {
  try {
    const { mode, unit, values } = parseArguments(argv);
    if (mode === "prepare") {
      for (const key of [
        "--source-sha",
        "--transport-root",
        "--pack-validation",
      ])
        if (!values.has(key))
          throw new InvocationError(`prepare requires ${key}.`);
      if (unit === "006/00" && values.has("--baseline-pack-validation"))
        throw new InvocationError(
          "Unit 006/00 cannot accept a baseline pack receipt.",
        );
      await prepare({
        unit,
        sourceSha: values.get("--source-sha"),
        transportRoot: values.get("--transport-root"),
        packValidationPath: values.get("--pack-validation"),
        baseline: values.get("--baseline-pack-validation"),
      });
    } else if (mode === "observe") {
      for (const key of [
        "--host",
        "--source-sha",
        "--transport-root",
        "--pack-validation",
        "--output",
      ])
        if (!values.has(key))
          throw new InvocationError(`observe requires ${key}.`);
      await observe({
        unit,
        host: values.get("--host"),
        sourceSha: values.get("--source-sha"),
        transportRoot: values.get("--transport-root"),
        packValidationPath: values.get("--pack-validation"),
        output: values.get("--output"),
      });
    } else if (mode === "verify-candidate") {
      if (!values.has("--pack-report"))
        throw new InvocationError("verify-candidate requires --pack-report.");
      await verifyCandidate(values.get("--pack-report"));
    } else {
      const observations = values.get("--observation");
      if (!values.has("--pack-validation") || observations?.length !== 3)
        throw new InvocationError(
          "decide requires one --pack-validation and exactly three --observation values.",
        );
      const pack = (
        await readCanonicalJson(
          path.resolve(values.get("--pack-validation")),
          "Pack validation receipt",
        )
      ).value;
      const receiptValues = [];
      for (const locator of observations)
        receiptValues.push(
          (
            await readCanonicalJson(
              path.resolve(locator),
              "Runtime observation",
            )
          ).value,
        );
      const decision = decideFromReceipts(pack, receiptValues);
      if (decision.unit !== unit)
        throw new EvidenceError(
          "Requested decision unit differs from receipts.",
        );
      io.stdout.write(`${JSON.stringify(decision)}\n`);
    }
    return 0;
  } catch (error) {
    io.stderr.write(
      `salt-ai Plan 006 runtime ${
        error instanceof Error ? error.message : String(error)
      }\n`,
    );
    return error instanceof InvocationError
      ? 2
      : error instanceof EvidenceError
        ? 3
        : 4;
  }
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) process.exitCode = await runCli(process.argv.slice(2));
