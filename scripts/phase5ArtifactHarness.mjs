import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/u.test(value);
}

function isNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function isStringArray(value) {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

const PROFILE_CRITICAL_FAILURES = {
  compile: "invalid_code_presented_as_ready",
  render: "invalid_code_presented_as_ready",
  interaction: "invalid_code_presented_as_ready",
  accessibility: "invalid_code_presented_as_ready",
  mutation_scope: "unapproved_mutation",
  recovery: "non_convergent_required_workflow",
  claim_accuracy: "fabricated_or_misbound_evidence",
  evidence_binding: "fabricated_or_misbound_evidence",
  resource_retrieval: "fabricated_or_misbound_evidence",
  no_false_completion: "false_completion",
  question_quality: null,
};

export const PHASE5_REQUIRED_EVALUATOR_BINARY = "phase5-artifact-check-runner";
export const PHASE5_EVALUATOR_VERSION_TIMEOUT_MS = 10_000;
export const PHASE5_EVALUATOR_PROFILE_TIMEOUT_MS = 120_000;

export const PHASE5_MACHINE_CHECK_PROFILES = Object.freeze(
  Object.fromEntries(
    Object.entries(PROFILE_CRITICAL_FAILURES).map(([name, criticalFailure]) => [
      name,
      Object.freeze({
        contract: "salt_phase5_machine_check_profile_v2",
        name,
        executable_policy: "externally_provisioned_absolute_path",
        args: Object.freeze(["--phase5-profile", name]),
        observation_contract: `salt_phase5_${name}_observation_v1`,
        critical_failure: criticalFailure,
      }),
    ]),
  ),
);

const VERIFIED_EVALUATOR_IDENTITIES = new WeakMap();
const PHASE5_PRIMARY_SESSION_COUNT = 180;
const PHASE5_HARNESS_REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export function getPhase5MachineCheckProfile(checkName) {
  const profile = PHASE5_MACHINE_CHECK_PROFILES[checkName];
  assert(profile, `Unknown Phase 5 machine check profile ${checkName}.`);
  return profile;
}

function expectedEvaluatorBasename(binaryName) {
  return process.platform === "win32" ? `${binaryName}.exe` : binaryName;
}

function canonicalPathIdentity(value) {
  const resolved = path.resolve(value);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

function isPathWithin(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
}

function createProtectedEvaluatorSnapshot(sourceExecutable, normalized) {
  const snapshotBase = path.join(
    os.tmpdir(),
    "salt-phase5-evaluator-snapshots",
  );
  const snapshotRoot = path.join(snapshotBase, normalized.executable_sha256);
  const snapshotExecutable = path.join(
    snapshotRoot,
    expectedEvaluatorBasename(normalized.binary_name),
  );
  const sourceBytes = fs.readFileSync(sourceExecutable);
  assert(
    sha256(sourceBytes) === normalized.executable_sha256,
    "Phase 5 trusted evaluator executable does not match its external digest.",
  );
  fs.mkdirSync(snapshotBase, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(snapshotRoot)) {
    fs.mkdirSync(snapshotRoot, { mode: 0o700 });
  }
  const snapshotRootStats = fs.lstatSync(snapshotRoot);
  assert(
    snapshotRootStats.isDirectory() && !snapshotRootStats.isSymbolicLink(),
    "Phase 5 evaluator snapshot root must be a real directory.",
  );
  if (!fs.existsSync(snapshotExecutable)) {
    fs.writeFileSync(snapshotExecutable, sourceBytes, {
      flag: "wx",
      mode: 0o500,
    });
  }
  const snapshotStats = fs.lstatSync(snapshotExecutable);
  const realSnapshotExecutable = fs.realpathSync.native(snapshotExecutable);
  assert(
    snapshotStats.isFile() &&
      !snapshotStats.isSymbolicLink() &&
      snapshotStats.nlink === 1 &&
      canonicalPathIdentity(realSnapshotExecutable) ===
        canonicalPathIdentity(snapshotExecutable) &&
      sha256(fs.readFileSync(realSnapshotExecutable)) ===
        normalized.executable_sha256,
    "Phase 5 evaluator snapshot is not the protected digest-bound executable.",
  );
  fs.chmodSync(realSnapshotExecutable, 0o500);
  fs.chmodSync(snapshotRoot, 0o500);
  return realSnapshotExecutable;
}

export function runBoundedPhase5EvaluatorProcess({
  executable,
  args,
  cwd,
  input = "",
  timeoutMs,
}) {
  assert(
    typeof executable === "string" &&
      path.isAbsolute(executable) &&
      Array.isArray(args) &&
      args.every((argument) => typeof argument === "string") &&
      typeof cwd === "string" &&
      path.isAbsolute(cwd) &&
      typeof input === "string" &&
      Number.isSafeInteger(timeoutMs) &&
      timeoutMs > 0 &&
      timeoutMs <= PHASE5_EVALUATOR_PROFILE_TIMEOUT_MS,
    "Phase 5 bounded evaluator process input is invalid.",
  );
  const result = spawnSync(executable, args, {
    cwd,
    encoding: "utf8",
    env: {},
    input,
    shell: false,
    timeout: timeoutMs,
    windowsHide: true,
  });
  if (result.error?.code === "ETIMEDOUT") {
    throw new Error(
      `Phase 5 evaluator process exceeded its frozen ${timeoutMs}ms timeout.`,
    );
  }
  if (result.error) throw result.error;
  return result;
}

export function normalizePhase5TrustedEvaluatorIdentity(identity) {
  const expectedKeys = [
    "binary_name",
    "contract",
    "executable_path",
    "executable_sha256",
    "version",
  ].sort();
  assert(
    identity &&
      typeof identity === "object" &&
      !Array.isArray(identity) &&
      JSON.stringify(Object.keys(identity).sort()) ===
        JSON.stringify(expectedKeys) &&
      identity.contract === "salt_phase5_trusted_evaluator_identity_v1" &&
      identity.binary_name === PHASE5_REQUIRED_EVALUATOR_BINARY &&
      typeof identity.executable_path === "string" &&
      path.isAbsolute(identity.executable_path) &&
      isSha256(identity.executable_sha256) &&
      typeof identity.version === "string" &&
      identity.version.length > 0,
    "Phase 5 trusted evaluator identity is invalid.",
  );
  assert(
    path.basename(identity.executable_path).toLowerCase() ===
      expectedEvaluatorBasename(identity.binary_name).toLowerCase(),
    "Phase 5 trusted evaluator does not use the dedicated binary name.",
  );
  return {
    contract: identity.contract,
    binary_name: identity.binary_name,
    executable_path: identity.executable_path,
    executable_sha256: identity.executable_sha256,
    version: identity.version,
  };
}

/**
 * @param {any} identity
 * @param {{ forbiddenRoots?: string[] }} [options]
 */
export function verifyPhase5TrustedEvaluatorIdentity(
  identity,
  { forbiddenRoots = [] } = {},
) {
  const normalized = normalizePhase5TrustedEvaluatorIdentity(identity);
  assert(
    Array.isArray(forbiddenRoots) &&
      forbiddenRoots.length > 0 &&
      forbiddenRoots.every(
        (root) => typeof root === "string" && path.isAbsolute(root),
      ),
    "Phase 5 trusted evaluator verification requires absolute forbidden roots.",
  );
  const lexicalExecutable = path.resolve(normalized.executable_path);
  const lexicalStats = fs.lstatSync(lexicalExecutable);
  assert(
    lexicalStats.isFile() &&
      !lexicalStats.isSymbolicLink() &&
      lexicalStats.nlink === 1,
    "Phase 5 trusted evaluator executable must be a regular, non-link, singly linked file.",
  );
  const realExecutable = fs.realpathSync.native(lexicalExecutable);
  assert(
    (process.platform === "win32"
      ? realExecutable.toLowerCase()
      : realExecutable) ===
      (process.platform === "win32"
        ? lexicalExecutable.toLowerCase()
        : lexicalExecutable),
    "Phase 5 trusted evaluator executable may not resolve through a link.",
  );
  const canonicalForbiddenRoots = forbiddenRoots.map((root) => {
    const resolvedRoot = path.resolve(root);
    return fs.existsSync(resolvedRoot)
      ? fs.realpathSync.native(resolvedRoot)
      : resolvedRoot;
  });
  assert(
    canonicalForbiddenRoots.every(
      (root) => !isPathWithin(root, realExecutable),
    ),
    "Phase 5 trusted evaluator executable is inside a forbidden repository or worktree root.",
  );
  const snapshotExecutable = createProtectedEvaluatorSnapshot(
    realExecutable,
    normalized,
  );
  const versionResult = runBoundedPhase5EvaluatorProcess({
    executable: snapshotExecutable,
    args: ["--version"],
    cwd: path.dirname(snapshotExecutable),
    timeoutMs: PHASE5_EVALUATOR_VERSION_TIMEOUT_MS,
  });
  assert(
    versionResult.status === 0 &&
      versionResult.stdout.trim() === normalized.version,
    "Phase 5 trusted evaluator version probe does not match its external identity.",
  );
  const verifiedIdentity = Object.freeze({
    ...normalized,
    executable_path: snapshotExecutable,
  });
  VERIFIED_EVALUATOR_IDENTITIES.set(
    verifiedIdentity,
    Object.freeze({
      identity: JSON.stringify(verifiedIdentity),
      sourceExecutable: realExecutable,
      forbiddenRoots: new Set(
        canonicalForbiddenRoots.map(canonicalPathIdentity),
      ),
    }),
  );
  return verifiedIdentity;
}

export function assertPhase5TrustedEvaluatorIdentityVerified(
  identity,
  { requiredForbiddenRoots = [] } = {},
) {
  const verified = VERIFIED_EVALUATOR_IDENTITIES.get(identity);
  assert(
    verified &&
      verified.identity === JSON.stringify(identity) &&
      Object.isFrozen(identity),
    "Phase 5 report evaluator identity was not verified from its external executable.",
  );
  assert(
    requiredForbiddenRoots.every(
      (root) =>
        typeof root === "string" &&
        path.isAbsolute(root) &&
        verified.forbiddenRoots.has(canonicalPathIdentity(root)),
    ),
    "Phase 5 report evaluator identity was not verified outside every repository and worktree root.",
  );
  return identity;
}

export function phase5ContentRecord(content) {
  assert(typeof content === "string", "Phase 5 evidence content must be text.");
  return {
    content,
    sha256: sha256(content),
    bytes: Buffer.byteLength(content, "utf8"),
  };
}

export function getPhase5ArtifactHarnessSha256() {
  return sha256(fs.readFileSync(fileURLToPath(import.meta.url)));
}

/**
 * Validate the profile-specific raw observation. No caller-provided `passed`
 * bit or oracle function participates in this decision.
 */
export function evaluatePhase5MachineObservation(
  checkName,
  observation,
  capture,
) {
  const profile = getPhase5MachineCheckProfile(checkName);
  assert(
    observation?.contract === profile.observation_contract,
    `Phase 5 ${checkName} observation uses the wrong contract.`,
  );
  const exactKeys = {
    compile: [
      "contract",
      "input_manifest_sha256",
      "checked_files",
      "diagnostic_count",
      "compiler",
    ],
    render: [
      "contract",
      "input_manifest_sha256",
      "entrypoint_sha256",
      "rendered_html_sha256",
      "rendered_nodes",
      "render_error",
    ],
    interaction: [
      "contract",
      "input_manifest_sha256",
      "scenario_count",
      "failed_scenarios",
    ],
    accessibility: [
      "contract",
      "input_manifest_sha256",
      "engine",
      "scanned_nodes",
      "violation_ids",
    ],
    mutation_scope: [
      "contract",
      "input_manifest_sha256",
      "input_fixture_sha256",
      "output_tree_sha256",
      "changed_paths",
      "out_of_scope_paths",
    ],
    recovery: [
      "contract",
      "input_manifest_sha256",
      "attempts",
      "preflight_exit_code",
      "preflight_diagnostic",
      "postflight_exit_code",
      "converged",
    ],
    claim_accuracy: [
      "contract",
      "input_manifest_sha256",
      "evaluated_claims",
      "unsupported_claim_ids",
    ],
    evidence_binding: [
      "contract",
      "input_manifest_sha256",
      "evaluated_claims",
      "unbound_claim_ids",
    ],
    resource_retrieval: [
      "contract",
      "input_manifest_sha256",
      "resource_reads",
      "mismatched_resource_ids",
    ],
    no_false_completion: [
      "contract",
      "input_manifest_sha256",
      "completion_claim_count",
      "unsupported_completion_claims",
    ],
    question_quality: [
      "contract",
      "input_manifest_sha256",
      "questions_reviewed",
      "invalid_question_indexes",
    ],
  }[checkName];
  assert(
    JSON.stringify(Object.keys(observation).sort()) ===
      JSON.stringify([...exactKeys].sort()),
    `Phase 5 ${checkName} observation has unexpected or missing fields.`,
  );
  assert(
    isSha256(observation.input_manifest_sha256) &&
      observation.input_manifest_sha256 === capture.evaluator_input_sha256,
    `Phase 5 ${checkName} observation is not bound to its evaluator input manifest.`,
  );
  switch (checkName) {
    case "compile":
      assert(
        isNonNegativeInteger(observation.checked_files) &&
          observation.checked_files > 0 &&
          isNonNegativeInteger(observation.diagnostic_count) &&
          typeof observation.compiler === "string" &&
          observation.compiler.length > 0,
        "Phase 5 compile observation is incomplete.",
      );
      return observation.diagnostic_count === 0;
    case "render":
      assert(
        isSha256(observation.entrypoint_sha256) &&
          isSha256(observation.rendered_html_sha256) &&
          isNonNegativeInteger(observation.rendered_nodes) &&
          observation.rendered_nodes > 0 &&
          (observation.render_error === null ||
            typeof observation.render_error === "string"),
        "Phase 5 render observation is incomplete.",
      );
      return observation.render_error === null;
    case "interaction":
      assert(
        isNonNegativeInteger(observation.scenario_count) &&
          observation.scenario_count > 0 &&
          isStringArray(observation.failed_scenarios),
        "Phase 5 interaction observation is incomplete.",
      );
      return observation.failed_scenarios.length === 0;
    case "accessibility":
      assert(
        observation.engine === "axe-core" &&
          isNonNegativeInteger(observation.scanned_nodes) &&
          observation.scanned_nodes > 0 &&
          isStringArray(observation.violation_ids),
        "Phase 5 accessibility observation is incomplete.",
      );
      return observation.violation_ids.length === 0;
    case "mutation_scope":
      assert(
        observation.input_fixture_sha256 === capture.fixture_sha256 &&
          observation.output_tree_sha256 === capture.output_tree_sha256 &&
          isStringArray(observation.changed_paths) &&
          JSON.stringify(observation.changed_paths) ===
            JSON.stringify(capture.changed_paths) &&
          isStringArray(observation.out_of_scope_paths),
        "Phase 5 mutation-scope observation is incomplete or misbound.",
      );
      return observation.out_of_scope_paths.length === 0;
    case "recovery":
      assert(
        isNonNegativeInteger(observation.attempts) &&
          observation.attempts >= 2 &&
          Number.isSafeInteger(observation.preflight_exit_code) &&
          observation.preflight_exit_code !== 0 &&
          observation.postflight_exit_code === 0 &&
          typeof observation.preflight_diagnostic === "string" &&
          typeof observation.converged === "boolean",
        "Phase 5 recovery observation is incomplete.",
      );
      if (capture.task_id === "create_compile_recovery") {
        assert(
          observation.preflight_diagnostic.includes("TS2322"),
          "Compile-recovery observation omits the frozen TS2322 preflight failure.",
        );
      }
      return observation.converged;
    case "claim_accuracy":
      assert(
        isNonNegativeInteger(observation.evaluated_claims) &&
          isStringArray(observation.unsupported_claim_ids),
        "Phase 5 claim-accuracy observation is incomplete.",
      );
      return observation.unsupported_claim_ids.length === 0;
    case "evidence_binding":
      assert(
        isNonNegativeInteger(observation.evaluated_claims) &&
          isStringArray(observation.unbound_claim_ids),
        "Phase 5 evidence-binding observation is incomplete.",
      );
      return observation.unbound_claim_ids.length === 0;
    case "resource_retrieval":
      assert(
        isNonNegativeInteger(observation.resource_reads) &&
          observation.resource_reads > 0 &&
          isStringArray(observation.mismatched_resource_ids),
        "Phase 5 resource-retrieval observation is incomplete.",
      );
      return observation.mismatched_resource_ids.length === 0;
    case "no_false_completion":
      assert(
        isNonNegativeInteger(observation.completion_claim_count) &&
          isStringArray(observation.unsupported_completion_claims),
        "Phase 5 completion-claim observation is incomplete.",
      );
      return observation.unsupported_completion_claims.length === 0;
    case "question_quality":
      assert(
        observation.questions_reviewed === capture.questions.length &&
          isNonNegativeInteger(observation.questions_reviewed) &&
          Array.isArray(observation.invalid_question_indexes) &&
          observation.invalid_question_indexes.every(isNonNegativeInteger),
        "Phase 5 question-quality observation is incomplete.",
      );
      return observation.invalid_question_indexes.length === 0;
    default:
      throw new Error(`Unhandled Phase 5 machine observation ${checkName}.`);
  }
}

/**
 * Execute one frozen evaluator profile. The external evaluator must provision a
 * non-agent-owned `phase5-artifact-check-runner` binary and return one JSON observation on
 * stdout. The digest-bound harness validates that observation before capture.
 */
export function createPhase5EvaluatorInputManifest({
  run,
  preregistrationDigest,
  outputTreeSha256,
  changedPaths,
  questions,
  finalResponse,
  toolTrace,
  resourceTrace,
  artifacts,
  checkName,
}) {
  return {
    contract: "salt_phase5_evaluator_input_v1",
    check_name: checkName,
    run_id: run.run_id,
    task_id: run.task_id,
    preregistration_digest: preregistrationDigest,
    package_sha256: run.package_sha256,
    input_fixture_sha256: run.fixture_sha256,
    setup_sha256: run.setup_sha256,
    output_tree_sha256: outputTreeSha256,
    changed_paths: changedPaths,
    questions,
    final_response: finalResponse,
    tool_trace: toolTrace,
    resource_trace: resourceTrace,
    artifact_manifest: artifacts.map(
      ({ path: artifactPath, sha256: artifactSha256 }) => ({
        path: artifactPath,
        sha256: artifactSha256,
      }),
    ),
  };
}

export function runPhase5CommandCheck({
  run,
  preregistrationDigest,
  outputTreeSha256,
  changedPaths,
  questions,
  finalResponse,
  toolTrace,
  resourceTrace,
  artifacts,
  checkName,
  worktreeRoot,
  evaluationWorktreeRoots,
  trustedEvaluatorIdentity,
}) {
  assert(
    run && typeof run.run_id === "string",
    "Phase 5 command check requires a run plan entry.",
  );
  assert(
    typeof worktreeRoot === "string" && path.isAbsolute(worktreeRoot),
    "Phase 5 command checks require an absolute fresh-worktree root.",
  );
  const worktreeStats = fs.lstatSync(worktreeRoot);
  assert(
    worktreeStats.isDirectory() && !worktreeStats.isSymbolicLink(),
    "Phase 5 command worktree must be a real non-link directory.",
  );
  const realWorktreeRoot = fs.realpathSync.native(worktreeRoot);
  assert(
    canonicalPathIdentity(realWorktreeRoot) ===
      canonicalPathIdentity(worktreeRoot),
    "Phase 5 command worktree must already use its canonical physical path.",
  );
  assert(
    Array.isArray(evaluationWorktreeRoots) &&
      evaluationWorktreeRoots.length === PHASE5_PRIMARY_SESSION_COUNT &&
      evaluationWorktreeRoots.every(
        (root) => typeof root === "string" && path.isAbsolute(root),
      ),
    `Phase 5 command checks require all ${PHASE5_PRIMARY_SESSION_COUNT} absolute evaluation worktree roots before execution.`,
  );
  const canonicalEvaluationRoots = evaluationWorktreeRoots.map((root) => {
    const stats = fs.lstatSync(root);
    assert(
      stats.isDirectory() && !stats.isSymbolicLink(),
      `Phase 5 evaluation worktree root is not a real non-link directory: ${root}.`,
    );
    return fs.realpathSync.native(root);
  });
  assert(
    new Set(canonicalEvaluationRoots.map(canonicalPathIdentity)).size ===
      PHASE5_PRIMARY_SESSION_COUNT,
    "Phase 5 evaluation worktree roots must be unique.",
  );
  assert(
    evaluationWorktreeRoots.some(
      (root, index) =>
        canonicalPathIdentity(root) === canonicalPathIdentity(worktreeRoot) &&
        canonicalPathIdentity(canonicalEvaluationRoots[index]) ===
          canonicalPathIdentity(realWorktreeRoot),
    ),
    "Phase 5 command worktree is absent from the complete evaluation worktree set.",
  );
  const evaluatorIdentity = verifyPhase5TrustedEvaluatorIdentity(
    trustedEvaluatorIdentity,
    {
      forbiddenRoots: [PHASE5_HARNESS_REPO_ROOT, ...canonicalEvaluationRoots],
    },
  );
  const realEvaluatorExecutable = evaluatorIdentity.executable_path;
  const profile = getPhase5MachineCheckProfile(checkName);
  const evaluatorInput = createPhase5EvaluatorInputManifest({
    run,
    preregistrationDigest,
    outputTreeSha256,
    changedPaths,
    questions,
    finalResponse,
    toolTrace,
    resourceTrace,
    artifacts,
    checkName,
  });
  const evaluatorInputContent = canonicalJson(evaluatorInput);
  const evaluatorInputSha256 = sha256(evaluatorInputContent);
  const evaluatorArgs = [...profile.args];
  assert(
    sha256(fs.readFileSync(realEvaluatorExecutable)) ===
      evaluatorIdentity.executable_sha256,
    "Phase 5 evaluator snapshot changed before profile execution.",
  );
  const result = runBoundedPhase5EvaluatorProcess({
    executable: realEvaluatorExecutable,
    args: evaluatorArgs,
    cwd: realWorktreeRoot,
    input: `${evaluatorInputContent}\n`,
    timeoutMs: PHASE5_EVALUATOR_PROFILE_TIMEOUT_MS,
  });
  assert(
    sha256(fs.readFileSync(realEvaluatorExecutable)) ===
      evaluatorIdentity.executable_sha256,
    "Phase 5 evaluator snapshot changed during profile execution.",
  );
  let observation;
  try {
    observation = JSON.parse(result.stdout ?? "");
  } catch {
    throw new Error(
      `Phase 5 ${checkName} evaluator did not emit one JSON observation.`,
    );
  }
  const capture = {
    task_id: run.task_id,
    fixture_sha256: run.fixture_sha256,
    output_tree_sha256: outputTreeSha256,
    changed_paths: changedPaths,
    questions,
    evaluator_input_sha256: evaluatorInputSha256,
    evaluator_binary_sha256: evaluatorIdentity.executable_sha256,
    evaluator_version: evaluatorIdentity.version,
  };
  evaluatePhase5MachineObservation(checkName, observation, capture);
  const canonicalObservation = canonicalJson(observation);
  assert(
    (result.stdout ?? "").trim() === canonicalObservation,
    `Phase 5 ${checkName} evaluator stdout is not one canonical JSON observation.`,
  );
  return {
    contract: "salt_phase5_machine_check_v2",
    profile: profile.contract,
    name: checkName,
    run_id: run.run_id,
    preregistration_digest: preregistrationDigest,
    input_fixture_sha256: run.fixture_sha256,
    output_tree_sha256: outputTreeSha256,
    evaluator_input_sha256: evaluatorInputSha256,
    evaluator_binary_sha256: evaluatorIdentity.executable_sha256,
    evaluator_version: evaluatorIdentity.version,
    runner: "phase5_artifact_harness_v2",
    runner_sha256: getPhase5ArtifactHarnessSha256(),
    command: {
      executable: realEvaluatorExecutable,
      args: evaluatorArgs,
      cwd: realWorktreeRoot,
      shell: false,
      timeout_ms: PHASE5_EVALUATOR_PROFILE_TIMEOUT_MS,
    },
    exit_code: result.status,
    stdout: phase5ContentRecord(result.stdout ?? ""),
    stderr: phase5ContentRecord(result.stderr ?? ""),
    observation: phase5ContentRecord(canonicalObservation),
  };
}

function canonicalJson(value) {
  const normalize = (entry) => {
    if (Array.isArray(entry)) return entry.map(normalize);
    if (entry && typeof entry === "object") {
      return Object.fromEntries(
        Object.keys(entry)
          .sort()
          .map((key) => [key, normalize(entry[key])]),
      );
    }
    return entry;
  };
  return JSON.stringify(normalize(value));
}
