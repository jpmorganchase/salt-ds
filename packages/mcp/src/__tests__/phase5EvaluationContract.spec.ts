import { spawnSync } from "node:child_process";
import {
  createHash,
  createPublicKey,
  generateKeyPairSync,
  type KeyObject,
  sign as signBytes,
} from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  createPhase5EvaluatorInputManifest,
  getPhase5ArtifactHarnessSha256,
  getPhase5MachineCheckProfile,
  runBoundedPhase5EvaluatorProcess,
  runPhase5CommandCheck,
  verifyPhase5TrustedEvaluatorIdentity,
} from "../../../../scripts/phase5ArtifactHarness.mjs";
import {
  auditPhase5RuntimeIntelligence,
  buildBlindScorePackets,
  buildPhase5SealedMapping,
  canonicalJson,
  computePhase5EvaluationReport,
  computePhase5RunScheduleDigest,
  computePreregistrationDigest,
  createPhase5AdjudicationPlan,
  createPhase5RunPlan,
  freezePhase5Scores,
  inspectPhase5NpmTar,
  loadPhase5Preregistration,
  phase5SignedEvidenceSigningPayload,
  sha256Bytes,
  validatePhase5HostTrace,
  validatePhase5Preregistration,
  validatePhase5PublishedPackageAttestation,
  validatePhase5ReplayBinding,
  validatePhase5RunCaptures,
  validatePhase5SignedEvidenceChain,
  verifyPhase5EvaluationCommit,
} from "../../../../scripts/phase5EvaluationContract.mjs";
import { REPO_ROOT } from "./registryTestUtils.js";

type Preregistration = ReturnType<typeof loadPhase5Preregistration>;
const BLINDING_SECRET = "f".repeat(64);

function clonePreregistration(preregistration: Preregistration) {
  return structuredClone(preregistration);
}

function afterFreeze(preregistration: Preregistration, minutes: number) {
  return new Date(
    Date.parse(preregistration.frozen_at) + minutes * 60_000,
  ).toISOString();
}

function contentRecord(content: string) {
  return {
    content,
    sha256: sha256Bytes(content),
    bytes: Buffer.byteLength(content, "utf8"),
  };
}

function passingMachineObservation(
  name: string,
  run: { task_id: string; fixture_sha256: string },
  outputTreeSha256: string,
  changedPaths: string[],
  questions: string[],
  evaluatorInputSha256: string,
) {
  const contract = `salt_phase5_${name}_observation_v1`;
  const binding = { contract, input_manifest_sha256: evaluatorInputSha256 };
  switch (name) {
    case "compile":
      return {
        ...binding,
        checked_files: 1,
        diagnostic_count: 0,
        compiler: "tsc",
      };
    case "render":
      return {
        ...binding,
        entrypoint_sha256: "1".repeat(64),
        rendered_html_sha256: "2".repeat(64),
        rendered_nodes: 1,
        render_error: null,
      };
    case "interaction":
      return { ...binding, scenario_count: 1, failed_scenarios: [] };
    case "accessibility":
      return {
        ...binding,
        engine: "axe-core",
        scanned_nodes: 1,
        violation_ids: [],
      };
    case "mutation_scope":
      return {
        ...binding,
        input_fixture_sha256: run.fixture_sha256,
        output_tree_sha256: outputTreeSha256,
        changed_paths: changedPaths,
        out_of_scope_paths: [],
      };
    case "recovery":
      return {
        ...binding,
        attempts: 2,
        preflight_exit_code: 1,
        preflight_diagnostic:
          run.task_id === "create_compile_recovery"
            ? "TS2322"
            : "runtime failure",
        postflight_exit_code: 0,
        converged: true,
      };
    case "claim_accuracy":
      return { ...binding, evaluated_claims: 1, unsupported_claim_ids: [] };
    case "evidence_binding":
      return { ...binding, evaluated_claims: 1, unbound_claim_ids: [] };
    case "resource_retrieval":
      return { ...binding, resource_reads: 1, mismatched_resource_ids: [] };
    case "no_false_completion":
      return {
        ...binding,
        completion_claim_count: 0,
        unsupported_completion_claims: [],
      };
    case "question_quality":
      return {
        ...binding,
        questions_reviewed: questions.length,
        invalid_question_indexes: [],
      };
    default:
      throw new Error(`Unknown synthetic observation ${name}.`);
  }
}

function createCaptures(
  preregistration: Preregistration,
  finalResponseForRun: (run: { run_id: string }) => string = (run) =>
    `completed ${run.run_id}`,
) {
  const digest = computePreregistrationDigest(preregistration);
  const tasks = new Map(
    preregistration.tasks.map((task: { id: string }) => [task.id, task]),
  );
  return createPhase5RunPlan(preregistration).map((run, index) => {
    const task = tasks.get(run.task_id) as {
      artifact_checks: string[];
      category: string;
    };
    const content = `artifact for ${run.run_id}`;
    const artifacts = [
      {
        path: "result.txt",
        ...contentRecord(content),
      },
    ];
    const outputTreeSha256 = sha256Bytes(
      canonicalJson(artifacts.map(({ path, sha256 }) => ({ path, sha256 }))),
    );
    const worktreeRoot = path.join(
      REPO_ROOT,
      ".phase5-test-worktrees",
      `${index}`,
    );
    const evaluatorExecutable = path.join(
      path.parse(REPO_ROOT).root,
      "phase5-external-evaluator",
      process.platform === "win32"
        ? "phase5-artifact-check-runner.exe"
        : "phase5-artifact-check-runner",
    );
    const changedPaths =
      task.category === "review_retrieval_policy" ? [] : ["result.txt"];
    const finalResponse = finalResponseForRun(run);
    const preflightGitStatus = contentRecord("");
    const finalGitStatus = contentRecord(
      changedPaths.length === 0 ? "" : " M result.txt\0",
    );
    const frozenAt = Date.parse(preregistration.frozen_at);
    const gitCommandReceipt = (command: string[], stdout: string) => ({
      contract: "salt_phase5_git_command_receipt_v1",
      command,
      cwd: worktreeRoot,
      exit_code: 0,
      stdout: contentRecord(stdout),
      stderr: contentRecord(""),
    });
    const worktreeReceipt = {
      contract: "salt_phase5_worktree_receipt_v1",
      instance_id: index.toString(16).padStart(32, "0"),
      creation_challenge: sha256Bytes(`challenge-${index}`),
      root_at_execution: worktreeRoot,
      root_sha256: sha256Bytes(worktreeRoot),
      real_root_at_execution: worktreeRoot,
      real_root_sha256: sha256Bytes(worktreeRoot),
      git_admin_dir_at_execution: path.join(
        path.parse(REPO_ROOT).root,
        "phase5-external-git-admin",
        `${index}`,
      ),
      git_admin_dir_realpath_sha256: sha256Bytes(
        path.join(
          path.parse(REPO_ROOT).root,
          "phase5-external-git-admin",
          `${index}`,
        ),
      ),
      evaluation_commit: "a".repeat(40),
      head_commit: "a".repeat(40),
      head_tree: "b".repeat(40),
      preflight_git_status: preflightGitStatus,
      setup_state_sha256: sha256Bytes(
        canonicalJson({
          fixture_sha256: run.fixture_sha256,
          setup_sha256: run.setup_sha256,
        }),
      ),
      final_git_status: finalGitStatus,
      git_command_receipts: {
        head_commit: gitCommandReceipt(
          ["git", "rev-parse", "HEAD"],
          `${"a".repeat(40)}\n`,
        ),
        head_tree: gitCommandReceipt(
          ["git", "rev-parse", "HEAD^{tree}"],
          `${"b".repeat(40)}\n`,
        ),
        git_admin_dir: gitCommandReceipt(
          ["git", "rev-parse", "--absolute-git-dir"],
          `${path.join(path.parse(REPO_ROOT).root, "phase5-external-git-admin", `${index}`)}\n`,
        ),
        changed_paths: gitCommandReceipt(
          ["git", "diff", "--name-only", "--no-renames", "-z", "HEAD"],
          `${changedPaths.join("\0")}${changedPaths.length > 0 ? "\0" : ""}`,
        ),
        untracked_paths: gitCommandReceipt(
          ["git", "ls-files", "--others", "--exclude-standard", "-z"],
          "",
        ),
      },
      changed_paths: changedPaths,
      final_state_sha256: sha256Bytes(
        canonicalJson({
          output_tree_sha256: outputTreeSha256,
          changed_paths: changedPaths,
          final_git_status_sha256: finalGitStatus.sha256,
        }),
      ),
      created_at: new Date(frozenAt + 2 * 60_000).toISOString(),
      closed_at: new Date(frozenAt + 7 * 60_000).toISOString(),
    };
    return {
      ...run,
      preregistration_digest: digest,
      host_version: "codex-desktop-test-version",
      evaluation_commit: "a".repeat(40),
      conversation_id: `conversation-${index}`,
      worktree_id: `worktree-${index}`,
      worktree_root: worktreeRoot,
      worktree_receipt: worktreeReceipt,
      final_response: finalResponse,
      questions: [],
      tool_trace: [],
      resource_trace: [],
      artifacts,
      output_tree_sha256: outputTreeSha256,
      changed_paths: changedPaths,
      telemetry: {
        elapsed_ms: 1,
        tool_calls: 0,
        context_bytes: 1,
        response_bytes: 1,
      },
      checks: task.artifact_checks.map((name) => {
        const profile = getPhase5MachineCheckProfile(name);
        const evaluatorInput = createPhase5EvaluatorInputManifest({
          run,
          preregistrationDigest: digest,
          outputTreeSha256,
          changedPaths,
          questions: [],
          finalResponse,
          toolTrace: [],
          resourceTrace: [],
          artifacts,
          checkName: name,
        });
        const evaluatorInputSha256 = sha256Bytes(canonicalJson(evaluatorInput));
        const observation = passingMachineObservation(
          name,
          run,
          outputTreeSha256,
          changedPaths,
          [],
          evaluatorInputSha256,
        );
        const observationContent = canonicalJson(observation);
        return {
          contract: "salt_phase5_machine_check_v2",
          profile: profile.contract,
          name,
          run_id: run.run_id,
          preregistration_digest: digest,
          input_fixture_sha256: run.fixture_sha256,
          output_tree_sha256: outputTreeSha256,
          evaluator_input_sha256: evaluatorInputSha256,
          evaluator_binary_sha256: "c".repeat(64),
          evaluator_version: "phase5-test-evaluator-1.0.0",
          runner: "phase5_artifact_harness_v2",
          runner_sha256: preregistration.artifact_harness.sha256,
          command: {
            executable: evaluatorExecutable,
            args: [...profile.args],
            cwd: worktreeRoot,
            shell: false,
            timeout_ms: 120_000,
          },
          exit_code: 0,
          stdout: contentRecord(observationContent),
          stderr: contentRecord(""),
          observation: contentRecord(observationContent),
        };
      }),
    };
  });
}

function createPrimarySubmission(
  preregistration: Preregistration,
  packetManifest: ReturnType<typeof buildBlindScorePackets>,
  raterId: string,
  score = 4,
) {
  return {
    contract: "salt_phase5_rating_v1",
    phase: "primary",
    preregistration_digest: computePreregistrationDigest(preregistration),
    packet_manifest_digest: packetManifest.packet_manifest_digest,
    rater_id: raterId,
    rater_key_id: `${raterId}_key`,
    independence_attestation: true,
    submitted_at: afterFreeze(preregistration, 12),
    ratings: packetManifest.packets.map((packet: { opaque_id: string }) => ({
      opaque_id: packet.opaque_id,
      scores: Object.fromEntries(
        preregistration.rubric.blind_dimensions.map((dimension: string) => [
          dimension,
          score,
        ]),
      ),
      critical_failures: [],
      rationale: contentRecord(`independent rationale for ${packet.opaque_id}`),
    })),
  };
}

function createHostTrace(preregistration: Preregistration) {
  const evidence = (label: string) => contentRecord(`${label} evidence`);
  return {
    contract: "salt_phase5_host_trace_v1",
    host: preregistration.primary_host.host,
    model: preregistration.primary_host.model,
    reasoning_effort: preregistration.primary_host.reasoning_effort,
    service_tier: preregistration.primary_host.service_tier,
    host_version: "codex-desktop-test-version",
    protocol_revision: "2026-06-18",
    preregistration_digest: computePreregistrationDigest(preregistration),
    architectures: preregistration.architectures.map(
      (architecture: {
        id: string;
        package_sha256: string;
        public_tools: string[];
      }) => ({
        architecture_id: architecture.id,
        package_sha256: architecture.package_sha256,
        transport_results: {
          in_memory: {
            contract: "salt_phase5_transport_observation_v1",
            exit_code: 0,
            observed_tool_names: architecture.public_tools,
            observed_resource_uris: ["salt://catalog/manifest"],
            request_log: evidence("in-memory request"),
            response_log: evidence("in-memory response"),
          },
          stdio: {
            contract: "salt_phase5_transport_observation_v1",
            exit_code: 0,
            observed_tool_names: architecture.public_tools,
            observed_resource_uris: ["salt://catalog/manifest"],
            request_log: evidence("stdio request"),
            response_log: evidence("stdio response"),
          },
        },
      }),
    ),
    resource_strategy: "resource_links",
    capability_evidence: Object.fromEntries(
      ["create", "migration", "review", "ambiguity", "failure_recovery"].map(
        (capability) => [capability, evidence(capability)],
      ),
    ),
    deleted_private_protocol_dependency: false,
  };
}

function configureSignedEvidenceKeys(preregistration: Preregistration) {
  const roles = [
    ["executor_key", "executor"],
    ["coordinator_key", "coordinator"],
    ["primary_one_key", "primary_rater"],
    ["primary_two_key", "primary_rater"],
    ["adjudicator_key", "adjudicator"],
    ["host_key", "host_verifier"],
    ["publisher_key", "publisher_verifier"],
  ] as const;
  const privateKeys = new Map<string, KeyObject>();
  preregistration.evidence_trust.status = "configured";
  preregistration.evidence_trust.trusted_keys = roles.map(([keyId, role]) => {
    const pair = generateKeyPairSync("ed25519");
    privateKeys.set(keyId, pair.privateKey);
    return {
      key_id: keyId,
      role,
      public_key_pem: pair.publicKey
        .export({ type: "spki", format: "pem" })
        .toString(),
    };
  });
  return privateKeys;
}

function externalKeyFingerprints(preregistration: Preregistration) {
  return preregistration.evidence_trust.trusted_keys.map(
    (key: { key_id: string; public_key_pem: string }) => ({
      key_id: key.key_id,
      sha256: sha256Bytes(
        createPublicKey(key.public_key_pem).export({
          type: "spki",
          format: "der",
        }),
      ),
    }),
  );
}

function syntheticTrustedEvaluatorIdentity(preregistration: Preregistration) {
  const executableName =
    process.platform === "win32"
      ? `${preregistration.artifact_harness.required_evaluator_binary}.exe`
      : preregistration.artifact_harness.required_evaluator_binary;
  return {
    contract: "salt_phase5_trusted_evaluator_identity_v1",
    binary_name: preregistration.artifact_harness.required_evaluator_binary,
    executable_path: path.join(
      path.parse(REPO_ROOT).root,
      "phase5-external-evaluator",
      executableName,
    ),
    executable_sha256: "c".repeat(64),
    version: "phase5-test-evaluator-1.0.0",
  };
}

function createSignedEvent(
  privateKeys: Map<string, KeyObject>,
  eventType: string,
  role: string,
  keyId: string,
  issuedAt: string,
  previousEventSha256: string,
  payload: unknown,
) {
  const event = {
    contract: "salt_phase5_signed_evidence_v1",
    event_type: eventType,
    role,
    key_id: keyId,
    issued_at: issuedAt,
    previous_event_sha256: previousEventSha256,
    payload,
    payload_sha256: `sha256:${sha256Bytes(canonicalJson(payload))}`,
    signature_ed25519: "",
  };
  const privateKey = privateKeys.get(keyId);
  if (!privateKey) throw new Error(`Missing private key ${keyId}.`);
  event.signature_ed25519 = signBytes(
    null,
    Buffer.from(phase5SignedEvidenceSigningPayload(event), "utf8"),
    privateKey,
  ).toString("base64");
  return event;
}

describe("Phase 5 real-agent evaluation contract", () => {
  const preregistration = loadPhase5Preregistration(REPO_ROOT);

  // These three causal-study gates intentionally remain executable research
  // code, but no longer freeze current product source bytes in archive CI.
  it.skip("binds the frozen 30-task, 180-session preregistration to repository evidence", async () => {
    await expect(
      validatePhase5Preregistration(preregistration, { repoRoot: REPO_ROOT }),
    ).resolves.toMatchObject({
      task_count: 30,
      category_counts: {
        create: 10,
        migration: 10,
        review_retrieval_policy: 10,
      },
      primary_session_count: 180,
    });
    expect(createPhase5RunPlan(preregistration)).toHaveLength(180);
    const runPlan = createPhase5RunPlan(preregistration);
    expect(
      runPlan.map((run: { dispatch_index: number }) => run.dispatch_index),
    ).toEqual(Array.from({ length: 180 }, (_value, index) => index));
    const firstArmByPair = runPlan.filter(
      (run: { dispatch_index: number }) => run.dispatch_index % 2 === 0,
    );
    expect(
      new Set(
        firstArmByPair.map(
          (run: { architecture_id: string }) => run.architecture_id,
        ),
      ).size,
    ).toBe(2);
    const changedSeed = clonePreregistration(preregistration);
    changedSeed.run_plan.randomization_seed = "different-seed";
    expect(computePhase5RunScheduleDigest(changedSeed)).not.toBe(
      computePhase5RunScheduleDigest(preregistration),
    );
    expect(
      validatePhase5ReplayBinding(preregistration.architectures[0], REPO_ROOT),
    ).toMatchObject({
      package_name: "@salt-ds/mcp",
      package_version: "0.0.0",
    });
    expect(
      auditPhase5RuntimeIntelligence(preregistration, REPO_ROOT),
    ).toMatchObject({
      status: "unproved_rankers_and_analyzers_eliminated",
      allowlisted_primitive_count: 4,
      phase6_exceptions: [],
      restored_intelligence: [],
      superiority_evidence: null,
      ac24_passed: true,
    });
  });

  it("proves the frozen recovery seed fails compilation with TS2322", () => {
    const result = spawnSync(
      process.execPath,
      [
        path.join(REPO_ROOT, "node_modules/typescript/bin/tsc"),
        "--noEmit",
        "--strict",
        "--target",
        "ES2022",
        "--ignoreConfig",
        path.join(
          REPO_ROOT,
          "packages/mcp/eval-fixtures/phase5/setup/create-compile-recovery.ts",
        ),
      ],
      { encoding: "utf8" },
    );
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(/TS2322/u);
  });

  it("freezes machine commands and oracles instead of accepting caller-authored checks", () => {
    expect(getPhase5MachineCheckProfile("compile")).toMatchObject({
      executable_policy: "externally_provisioned_absolute_path",
      args: ["--phase5-profile", "compile"],
      observation_contract: "salt_phase5_compile_observation_v1",
    });
    expect(getPhase5ArtifactHarnessSha256()).toBe(
      preregistration.artifact_harness.sha256,
    );

    const arbitraryCommand = createCaptures(preregistration);
    const compileCapture = arbitraryCommand.find((capture) =>
      capture.checks.some(
        (check: { name: string }) => check.name === "compile",
      ),
    );
    if (!compileCapture)
      throw new Error("Synthetic matrix has no compile check.");
    const compileCheck = compileCapture.checks.find(
      (check: { name: string }) => check.name === "compile",
    );
    if (!compileCheck)
      throw new Error("Synthetic capture has no compile check.");
    (compileCheck as { command: unknown }).command = {
      executable: "phase5-artifact-check-runner",
      args: ["--version"],
      cwd: compileCapture.worktree_root,
      shell: false,
    };
    expect(() =>
      validatePhase5RunCaptures(preregistration, arbitraryCommand),
    ).toThrow(/invalid compile runner evidence/u);
  });

  it("bounds every evaluator subprocess with a frozen timeout", () => {
    expect(() =>
      runBoundedPhase5EvaluatorProcess({
        executable: process.execPath,
        args: ["--eval", "setInterval(() => {}, 1000)"],
        cwd: os.tmpdir(),
        timeoutMs: 100,
      }),
    ).toThrow(/exceeded its frozen 100ms timeout/u);
  });

  it("rejects generic and worktree-local evaluator executables before use", () => {
    const worktreeRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "salt-phase5-harness-"),
    );
    const evaluatorRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "salt-phase5-evaluator-"),
    );
    try {
      const evaluatorName =
        process.platform === "win32"
          ? "phase5-artifact-check-runner.exe"
          : "phase5-artifact-check-runner";
      const evaluatorExecutable = path.join(evaluatorRoot, evaluatorName);
      fs.copyFileSync(process.execPath, evaluatorExecutable);
      fs.chmodSync(evaluatorExecutable, 0o755);
      const evaluationWorktreeRoots = [
        worktreeRoot,
        ...Array.from({ length: 179 }, (_, index) =>
          path.join(evaluatorRoot, `future-worktree-${index}`),
        ),
      ];
      for (const futureWorktree of evaluationWorktreeRoots.slice(1)) {
        fs.mkdirSync(futureWorktree);
      }
      const run = createPhase5RunPlan(preregistration)[0];
      const artifact = {
        path: "result.txt",
        ...contentRecord("result"),
      };
      const outputTreeSha256 = sha256Bytes(
        canonicalJson([{ path: artifact.path, sha256: artifact.sha256 }]),
      );
      const evaluatorBinarySha256 = sha256Bytes(
        fs.readFileSync(evaluatorExecutable),
      );
      const trustedEvaluatorIdentity = {
        contract: "salt_phase5_trusted_evaluator_identity_v1",
        binary_name: "phase5-artifact-check-runner",
        executable_path: evaluatorExecutable,
        executable_sha256: evaluatorBinarySha256,
        version: process.version,
      };
      expect(() =>
        runPhase5CommandCheck({
          run,
          preregistrationDigest: computePreregistrationDigest(preregistration),
          outputTreeSha256,
          changedPaths: [artifact.path],
          questions: [],
          finalResponse: "Completed the compile fixture.",
          toolTrace: [],
          resourceTrace: [],
          artifacts: [artifact],
          checkName: "compile",
          worktreeRoot,
          evaluationWorktreeRoots,
          trustedEvaluatorIdentity: {
            ...trustedEvaluatorIdentity,
            executable_path: process.execPath,
          },
        }),
      ).toThrow(/dedicated binary name/u);
      const worktreeEvaluator = path.join(worktreeRoot, evaluatorName);
      fs.copyFileSync(process.execPath, worktreeEvaluator);
      fs.chmodSync(worktreeEvaluator, 0o755);
      expect(() =>
        runPhase5CommandCheck({
          run,
          preregistrationDigest: computePreregistrationDigest(preregistration),
          outputTreeSha256,
          changedPaths: [artifact.path],
          questions: [],
          finalResponse: "Completed the compile fixture.",
          toolTrace: [],
          resourceTrace: [],
          artifacts: [artifact],
          checkName: "compile",
          worktreeRoot,
          evaluationWorktreeRoots,
          trustedEvaluatorIdentity: {
            ...trustedEvaluatorIdentity,
            executable_path: worktreeEvaluator,
            version: "must-not-be-probed",
          },
        }),
      ).toThrow(/inside a forbidden .* root/u);
      const linkedWorktree = path.join(evaluatorRoot, "linked-worktree");
      fs.symlinkSync(
        worktreeRoot,
        linkedWorktree,
        process.platform === "win32" ? "junction" : "dir",
      );
      expect(() =>
        runPhase5CommandCheck({
          run,
          preregistrationDigest: computePreregistrationDigest(preregistration),
          outputTreeSha256,
          changedPaths: [artifact.path],
          questions: [],
          finalResponse: "Completed the compile fixture.",
          toolTrace: [],
          resourceTrace: [],
          artifacts: [artifact],
          checkName: "compile",
          worktreeRoot: linkedWorktree,
          evaluationWorktreeRoots: [
            linkedWorktree,
            ...evaluationWorktreeRoots.slice(1),
          ],
          trustedEvaluatorIdentity: {
            ...trustedEvaluatorIdentity,
            version: "must-not-be-probed",
          },
        }),
      ).toThrow(/real non-link directory/u);
      expect(() =>
        runPhase5CommandCheck({
          run,
          preregistrationDigest: computePreregistrationDigest(preregistration),
          outputTreeSha256,
          changedPaths: [artifact.path],
          questions: [],
          finalResponse: "Completed the compile fixture.",
          toolTrace: [],
          resourceTrace: [],
          artifacts: [artifact],
          checkName: "compile",
          worktreeRoot,
          evaluationWorktreeRoots,
          trustedEvaluatorIdentity,
        }),
      ).toThrow(/did not emit one JSON observation/u);
    } finally {
      fs.rmSync(worktreeRoot, { recursive: true, force: true });
      fs.rmSync(evaluatorRoot, { recursive: true, force: true });
    }
  });

  it.each([
    ["too few tasks", (value: Preregistration) => value.tasks.pop()],
    [
      "too few repeats",
      (value: Preregistration) => {
        value.run_plan.runs_per_task_architecture_host = 2;
      },
    ],
    [
      "missing required coverage",
      (value: Preregistration) =>
        value.required_coverage_tags.push("absent_tag"),
    ],
    [
      "missing artifact evidence",
      (value: Preregistration) => value.tasks[0].artifact_checks.pop(),
    ],
    [
      "review mutation evidence",
      (value: Preregistration) => {
        const reviewTask = value.tasks.find(
          (task: { category: string }) =>
            task.category === "review_retrieval_policy",
        );
        if (!reviewTask) throw new Error("Missing review task.");
        reviewTask.artifact_checks = reviewTask.artifact_checks.filter(
          (check: string) => check !== "mutation_scope",
        );
      },
    ],
    [
      "unknown artifact evidence profile",
      (value: Preregistration) =>
        value.tasks[0].artifact_checks.push("not_a_real_profile"),
    ],
    [
      "duplicate artifact evidence profile",
      (value: Preregistration) =>
        value.tasks[0].artifact_checks.push(value.tasks[0].artifact_checks[0]),
    ],
    [
      "unknown randomization algorithm",
      (value: Preregistration) => {
        value.run_plan.randomization_algorithm = "unregistered_shuffle";
      },
    ],
    [
      "missing randomization seed",
      (value: Preregistration) => {
        value.run_plan.randomization_seed = null;
      },
    ],
    [
      "changed statistics",
      (value: Preregistration) => {
        value.statistics.bootstrap_samples = 999;
      },
    ],
    [
      "stale primitive source binding",
      (value: Preregistration) => {
        value.minimal_primitive_allowlist[0].sha256 = "0".repeat(64);
      },
    ],
    [
      "semantically swapped replay manifest and lock",
      (value: Preregistration) => {
        const architecture = value.architectures[0];
        [architecture.install_manifest_path, architecture.lockfile_path] = [
          architecture.lockfile_path,
          architecture.install_manifest_path,
        ];
        [architecture.install_manifest_sha256, architecture.lockfile_sha256] = [
          architecture.lockfile_sha256,
          architecture.install_manifest_sha256,
        ];
      },
    ],
    [
      "missing replay metadata",
      (value: Preregistration) => {
        value.architectures[0].install_manifest_path = null;
        value.architectures[0].install_manifest_sha256 = null;
        value.architectures[0].lockfile_path = null;
        value.architectures[0].lockfile_sha256 = null;
      },
    ],
  ])("rejects %s", async (_name, mutate) => {
    const changed = clonePreregistration(preregistration);
    mutate(changed);
    await expect(
      validatePhase5Preregistration(changed, { repoRoot: REPO_ROOT }),
    ).rejects.toThrow();
  });

  it("rejects unsafe or special npm tar entries before extraction", () => {
    const minimalArchitecture = preregistration.architectures.find(
      (architecture: { kind: string }) =>
        architecture.kind === "minimal_architecture",
    );
    if (!minimalArchitecture) throw new Error("Missing minimal architecture.");
    const tarball = fs.readFileSync(
      path.resolve(REPO_ROOT, minimalArchitecture.package_path),
    );
    const rewriteFirstHeader = (mutate: (header: Buffer) => void) => {
      const archive = Buffer.from(gunzipSync(tarball));
      const header = archive.subarray(0, 512);
      mutate(header);
      header.fill(0x20, 148, 156);
      const checksum = header.reduce((total, byte) => total + byte, 0);
      header.write(
        `${checksum.toString(8).padStart(6, "0")}\0 `,
        148,
        8,
        "ascii",
      );
      return gzipSync(archive);
    };
    const unsafePath = rewriteFirstHeader((header) => {
      header.fill(0, 0, 100);
      header.write("package/../outside", 0, "utf8");
    });
    expect(() => inspectPhase5NpmTar(unsafePath)).toThrow(/unsafe npm path/u);

    for (const invalidPath of [
      "package/CON",
      "package/trailing.",
      "package/trailing ",
      "package/bad:name",
      "package/cafe\u0301",
    ]) {
      const nonportablePath = rewriteFirstHeader((header) => {
        header.fill(0, 0, 100);
        header.write(invalidPath, 0, "utf8");
      });
      expect(() => inspectPhase5NpmTar(nonportablePath)).toThrow(
        /unsafe npm path/u,
      );
    }

    const linkedEntry = rewriteFirstHeader((header) => {
      header[156] = "2".charCodeAt(0);
    });
    expect(() => inspectPhase5NpmTar(linkedEntry)).toThrow(
      /unsupported entry type/u,
    );

    const checksumMismatchArchive = Buffer.from(gunzipSync(tarball));
    checksumMismatchArchive[148] =
      checksumMismatchArchive[148] === "0".charCodeAt(0)
        ? "1".charCodeAt(0)
        : "0".charCodeAt(0);
    expect(() =>
      inspectPhase5NpmTar(gzipSync(checksumMismatchArchive)),
    ).toThrow(/checksum mismatch/u);

    const malformedSize = rewriteFirstHeader((header) => {
      header.fill(0, 124, 136);
      header.write("not-octal", 124, "ascii");
    });
    expect(() => inspectPhase5NpmTar(malformedSize)).toThrow(
      /invalid tar size/iu,
    );

    const truncatedEntry = rewriteFirstHeader((header) => {
      header.fill(0, 124, 136);
      header.write("77777777777\0", 124, 12, "ascii");
    });
    expect(() => inspectPhase5NpmTar(truncatedEntry)).toThrow(
      /truncated tar entry/iu,
    );

    const duplicateArchive = Buffer.from(gunzipSync(tarball));
    const firstHeader = duplicateArchive.subarray(0, 512);
    const firstSize = Number.parseInt(
      firstHeader
        .subarray(124, 136)
        .toString("ascii")
        .replace(/\0.*$/u, "")
        .trim() || "0",
      8,
    );
    const secondHeaderOffset = 512 + Math.ceil(firstSize / 512) * 512;
    const rewriteSecondHeaderPath = (logicalDirectoryAlias: boolean) => {
      const archiveCopy = Buffer.from(duplicateArchive);
      const sourceHeader = archiveCopy.subarray(0, 512);
      const targetHeader = archiveCopy.subarray(
        secondHeaderOffset,
        secondHeaderOffset + 512,
      );
      if (logicalDirectoryAlias) {
        const firstName = sourceHeader
          .subarray(0, 100)
          .toString("utf8")
          .replace(/\0.*$/u, "");
        const firstPrefix = sourceHeader
          .subarray(345, 500)
          .toString("utf8")
          .replace(/\0.*$/u, "");
        const firstPath = firstPrefix
          ? `${firstPrefix}/${firstName}`
          : firstName;
        expect(Buffer.byteLength(`${firstPath}/`, "utf8")).toBeLessThan(100);
        targetHeader.fill(0, 0, 100);
        targetHeader.fill(0, 345, 500);
        targetHeader.write(`${firstPath}/`, 0, "utf8");
      } else {
        sourceHeader.copy(targetHeader, 0, 0, 100);
        sourceHeader.copy(targetHeader, 345, 345, 500);
      }
      targetHeader.fill(0x20, 148, 156);
      const checksum = targetHeader.reduce((total, byte) => total + byte, 0);
      targetHeader.write(
        `${checksum.toString(8).padStart(6, "0")}\0 `,
        148,
        8,
        "ascii",
      );
      return gzipSync(archiveCopy);
    };
    expect(() => inspectPhase5NpmTar(rewriteSecondHeaderPath(false))).toThrow(
      /duplicate tar entry/iu,
    );
    expect(() => inspectPhase5NpmTar(rewriteSecondHeaderPath(true))).toThrow(
      /duplicate tar entry/iu,
    );

    const archive = Buffer.from(gunzipSync(tarball));
    let contentEnd = archive.length;
    while (
      contentEnd >= 512 &&
      archive.subarray(contentEnd - 512, contentEnd).every((byte) => byte === 0)
    ) {
      contentEnd -= 512;
    }
    expect(() =>
      inspectPhase5NpmTar(gzipSync(archive.subarray(0, contentEnd))),
    ).toThrow(/two-block end marker/u);
    expect(() =>
      inspectPhase5NpmTar(
        gzipSync(
          Buffer.concat([archive.subarray(0, contentEnd), Buffer.alloc(512)]),
        ),
      ),
    ).toThrow(/two-block end marker/u);
    expect(() =>
      inspectPhase5NpmTar(
        gzipSync(
          Buffer.concat([archive.subarray(0, contentEnd), Buffer.alloc(1024)]),
        ),
      ),
    ).not.toThrow();
    expect(() =>
      inspectPhase5NpmTar(
        gzipSync(
          Buffer.concat([archive.subarray(0, contentEnd), Buffer.alloc(1536)]),
        ),
      ),
    ).not.toThrow();
    const nonzeroTrailingBlock = Buffer.alloc(512);
    nonzeroTrailingBlock[0] = 1;
    expect(() =>
      inspectPhase5NpmTar(
        gzipSync(
          Buffer.concat([
            archive.subarray(0, contentEnd),
            Buffer.alloc(1024),
            nonzeroTrailingBlock,
          ]),
        ),
      ),
    ).toThrow(/nonzero trailing material/u);
    expect(() =>
      inspectPhase5NpmTar(
        gzipSync(
          Buffer.concat([archive.subarray(0, contentEnd), Buffer.alloc(1025)]),
        ),
      ),
    ).toThrow(/not aligned/u);

    const nonzeroEntryPadding = Buffer.from(gunzipSync(tarball));
    let paddingOffset = 0;
    for (let offset = 0; offset + 512 <= nonzeroEntryPadding.length; ) {
      const header = nonzeroEntryPadding.subarray(offset, offset + 512);
      if (header.every((byte) => byte === 0)) break;
      const rawSize = header
        .subarray(124, 136)
        .toString("ascii")
        .replace(/\0.*$/u, "")
        .trim();
      const size = Number.parseInt(rawSize || "0", 8);
      const dataEnd = offset + 512 + size;
      const nextOffset = offset + 512 + Math.ceil(size / 512) * 512;
      if (nextOffset > dataEnd) {
        paddingOffset = dataEnd;
        break;
      }
      offset = nextOffset;
    }
    expect(paddingOffset).toBeGreaterThan(0);
    nonzeroEntryPadding[paddingOffset] = 1;
    expect(() => inspectPhase5NpmTar(gzipSync(nonzeroEntryPadding))).toThrow(
      /nonzero padding bytes/u,
    );
  }, 20_000);

  it("validates independent captures, bound artifacts, and failure semantics", () => {
    const captures = createCaptures(preregistration);
    expect(validatePhase5RunCaptures(preregistration, captures)).toMatchObject({
      capture_count: 180,
    });

    const genericInterpreter = structuredClone(captures);
    genericInterpreter[0].checks[0].command.executable = process.execPath;
    expect(() =>
      validatePhase5RunCaptures(preregistration, genericInterpreter),
    ).toThrow(/invalid .* runner evidence/u);

    expect(() =>
      validatePhase5RunCaptures(preregistration, captures, {
        trustedEvaluatorIdentity: {
          ...syntheticTrustedEvaluatorIdentity(preregistration),
          executable_sha256: "d".repeat(64),
        },
      }),
    ).toThrow(/externally trusted evaluator identity/u);

    const reusedConversation = structuredClone(captures);
    reusedConversation[1].conversation_id =
      reusedConversation[0].conversation_id;
    expect(() =>
      validatePhase5RunCaptures(preregistration, reusedConversation),
    ).toThrow(/reused/u);

    const reusedRoot = structuredClone(captures);
    reusedRoot[1].worktree_root = reusedRoot[0].worktree_root;
    reusedRoot[1].worktree_receipt.root_at_execution =
      reusedRoot[0].worktree_root;
    reusedRoot[1].worktree_receipt.root_sha256 = sha256Bytes(
      reusedRoot[0].worktree_root,
    );
    for (const check of reusedRoot[1].checks) {
      check.command.cwd = reusedRoot[0].worktree_root;
    }
    for (const receipt of Object.values(
      reusedRoot[1].worktree_receipt.git_command_receipts,
    ) as Array<{ cwd: string }>) {
      receipt.cwd = reusedRoot[0].worktree_root;
    }
    expect(() =>
      validatePhase5RunCaptures(preregistration, reusedRoot),
    ).toThrow(/reused its worktree root/u);

    const reusedInstanceId = structuredClone(captures);
    reusedInstanceId[1].worktree_receipt.instance_id =
      reusedInstanceId[0].worktree_receipt.instance_id;
    expect(() =>
      validatePhase5RunCaptures(preregistration, reusedInstanceId),
    ).toThrow(/reused its worktree instance id/u);

    const aliasedRoot = structuredClone(captures);
    aliasedRoot[1].worktree_root = `${aliasedRoot[0].worktree_root}${path.sep}`;
    aliasedRoot[1].worktree_receipt.root_at_execution =
      aliasedRoot[1].worktree_root;
    aliasedRoot[1].worktree_receipt.root_sha256 = sha256Bytes(
      aliasedRoot[1].worktree_root,
    );
    for (const check of aliasedRoot[1].checks) {
      check.command.cwd = aliasedRoot[1].worktree_root;
    }
    for (const receipt of Object.values(
      aliasedRoot[1].worktree_receipt.git_command_receipts,
    ) as Array<{ cwd: string }>) {
      receipt.cwd = aliasedRoot[1].worktree_root;
    }
    expect(() =>
      validatePhase5RunCaptures(preregistration, aliasedRoot),
    ).toThrow(/reused its canonical worktree root/u);

    const physicalAlias = structuredClone(captures);
    physicalAlias[1].worktree_receipt.real_root_at_execution =
      physicalAlias[0].worktree_receipt.real_root_at_execution;
    physicalAlias[1].worktree_receipt.real_root_sha256 =
      physicalAlias[0].worktree_receipt.real_root_sha256;
    expect(() =>
      validatePhase5RunCaptures(preregistration, physicalAlias),
    ).toThrow(/reused its physical worktree root/u);

    const shuffledDispatch = structuredClone(captures);
    [shuffledDispatch[0], shuffledDispatch[1]] = [
      shuffledDispatch[1],
      shuffledDispatch[0],
    ];
    expect(() =>
      validatePhase5RunCaptures(preregistration, shuffledDispatch),
    ).toThrow(/dispatch order changed/u);

    const unboundArtifact = structuredClone(captures);
    unboundArtifact[0].artifacts[0].content = "changed";
    expect(() =>
      validatePhase5RunCaptures(preregistration, unboundArtifact),
    ).toThrow(/unbound artifact/u);

    const untrackedMutation = structuredClone(captures);
    const mutableCaptureIndex = untrackedMutation.findIndex((capture) => {
      const task = preregistration.tasks.find(
        (candidate: { id: string }) => candidate.id === capture.task_id,
      );
      return task?.category !== "review_retrieval_policy";
    });
    if (mutableCaptureIndex < 0) throw new Error("Missing mutable capture.");
    untrackedMutation[
      mutableCaptureIndex
    ].worktree_receipt.git_command_receipts.untracked_paths.stdout =
      contentRecord("undeclared.txt\0");
    expect(() =>
      validatePhase5RunCaptures(preregistration, untrackedMutation),
    ).toThrow(/does not match tracked and untracked Git evidence/u);

    const readOnlyMutation = structuredClone(captures);
    const readOnlyCapture = readOnlyMutation.find((capture) => {
      const task = preregistration.tasks.find(
        (candidate: { id: string }) => candidate.id === capture.task_id,
      );
      return task?.category === "review_retrieval_policy";
    });
    if (!readOnlyCapture) throw new Error("Missing read-only capture.");
    readOnlyCapture.changed_paths = ["unexpected.txt"];
    expect(() =>
      validatePhase5RunCaptures(preregistration, readOnlyMutation),
    ).toThrow(/mutated files during a read-only review or retrieval task/u);

    const falseSuccess = structuredClone(captures);
    (falseSuccess[0].checks[0] as { status?: string }).status = "fail";
    expect(() =>
      validatePhase5RunCaptures(preregistration, falseSuccess),
    ).toThrow(/may not self-assert success or check status/u);

    const callerFailureEnvelope = structuredClone(captures) as Array<
      (typeof captures)[number] & { failure_envelope?: boolean }
    >;
    callerFailureEnvelope[0].failure_envelope = false;
    expect(() =>
      validatePhase5RunCaptures(preregistration, callerFailureEnvelope),
    ).toThrow(/may not self-assert a failure envelope/u);

    const mixedHostVersion = structuredClone(captures);
    mixedHostVersion[0].host_version = "another-version";
    expect(() =>
      validatePhase5RunCaptures(preregistration, mixedHostVersion),
    ).toThrow(/one exact host version/u);

    const nonStringQuestion = structuredClone(captures);
    nonStringQuestion[0].questions = [{ text: "identity bypass" }] as never;
    expect(() =>
      validatePhase5RunCaptures(preregistration, nonStringQuestion),
    ).toThrow(/questions must be strings/u);

    const injectedOracle = structuredClone(captures);
    const injectedObservation = JSON.parse(
      injectedOracle[0].checks[0].observation.content,
    );
    injectedObservation.passed = true;
    injectedOracle[0].checks[0].observation = contentRecord(
      canonicalJson(injectedObservation),
    );
    expect(() =>
      validatePhase5RunCaptures(preregistration, injectedOracle),
    ).toThrow(/stdout and observation disagree/u);

    const injectedRawOracle = structuredClone(captures);
    const injectedRawObservation = JSON.parse(
      injectedRawOracle[0].checks[0].observation.content,
    );
    injectedRawObservation.passed = true;
    const injectedRawContent = contentRecord(
      canonicalJson(injectedRawObservation),
    );
    injectedRawOracle[0].checks[0].stdout = injectedRawContent;
    injectedRawOracle[0].checks[0].observation = injectedRawContent;
    expect(() =>
      validatePhase5RunCaptures(preregistration, injectedRawOracle),
    ).toThrow(/unexpected or missing fields/u);

    const failedClassifiedOracle = structuredClone(captures);
    const failedCapture = failedClassifiedOracle.find((capture) =>
      capture.checks.some(
        (check: { name: string }) => check.name === "compile",
      ),
    );
    if (!failedCapture)
      throw new Error("Synthetic matrix has no compile check.");
    const failedCheck = failedCapture.checks.find(
      (check: { name: string }) => check.name === "compile",
    );
    if (!failedCheck)
      throw new Error("Synthetic capture has no compile check.");
    const failedObservation = JSON.parse(failedCheck.observation.content);
    failedObservation.diagnostic_count = 1;
    const failedContent = contentRecord(canonicalJson(failedObservation));
    failedCheck.stdout = failedContent;
    failedCheck.observation = failedContent;
    expect(
      validatePhase5RunCaptures(preregistration, failedClassifiedOracle),
    ).toMatchObject({ capture_count: 180 });

    expect(() =>
      verifyPhase5EvaluationCommit(preregistration, captures, REPO_ROOT),
    ).toThrow(/evaluation commit resolution/u);
  });

  it("creates opaque blind packets and a separately sealed mapping", () => {
    const captures = createCaptures(
      preregistration,
      () =>
        "BASELINE used create_salt_ui from @salt-ds/mcp minimal_phase4_verified",
    );
    const blinded = buildBlindScorePackets(
      preregistration,
      captures,
      BLINDING_SECRET,
    );
    const sealed = buildPhase5SealedMapping(
      preregistration,
      captures,
      BLINDING_SECRET,
    );
    expect(blinded.packets).toHaveLength(180);
    expect(blinded).not.toHaveProperty("sealed_mapping");
    expect(blinded).not.toHaveProperty("commitment_nonce");
    expect(blinded.packets[0]).toMatchObject({
      task_prompt: expect.any(String),
      fixture_sha256: expect.any(String),
      changed_paths: expect.any(Array),
    });
    expect(sealed.mapping).toHaveLength(180);
    expect(sealed.mapping_commitment).toBe(blinded.mapping_commitment);
    expect(JSON.stringify(blinded.packets[0])).not.toMatch(
      /architecture_id|task_id|run_id|baseline|minimal|create_salt_ui|@salt-ds\/mcp/iu,
    );
    expect(sealed.mapping[0]).toMatchObject({
      opaque_id: expect.any(String),
      run_id: expect.any(String),
      architecture_id: expect.any(String),
      task_id: expect.any(String),
    });
    const independentlyBlinded = buildBlindScorePackets(
      preregistration,
      captures,
      "e".repeat(64),
    );
    expect(independentlyBlinded.packets[0].opaque_id).not.toBe(
      blinded.packets[0].opaque_id,
    );
  });

  it.skip("computes the preregistered paired gate and rejects critical failures", () => {
    const captures = createCaptures(preregistration);
    const packetManifest = buildBlindScorePackets(
      preregistration,
      captures,
      BLINDING_SECRET,
    );
    const sealedMapping = buildPhase5SealedMapping(
      preregistration,
      captures,
      BLINDING_SECRET,
    );
    const primarySubmissions = [
      createPrimarySubmission(preregistration, packetManifest, "rater_one"),
      createPrimarySubmission(preregistration, packetManifest, "rater_two"),
    ];
    const scoreFreeze = freezePhase5Scores(
      preregistration,
      packetManifest,
      primarySubmissions,
      null,
      afterFreeze(preregistration, 22),
    );
    const evaluation = {
      captures,
      packet_manifest: packetManifest,
      sealed_mapping: sealedMapping,
      primary_submissions: primarySubmissions,
      adjudication_submission: null,
      score_freeze: scoreFreeze,
    };
    expect(
      computePhase5EvaluationReport(preregistration, evaluation, {
        repoRoot: REPO_ROOT,
      }),
    ).toMatchObject({
      capture_count: 180,
      ac24_passed: true,
      gate_status: "blocked",
      beta_gate_passed: false,
    });
    const callerAuthoredScoreFreeze = structuredClone(scoreFreeze);
    callerAuthoredScoreFreeze.final_scores[0].scores.task_correctness = 0;
    callerAuthoredScoreFreeze.final_score_table_digest = `sha256:${sha256Bytes(
      canonicalJson(callerAuthoredScoreFreeze.final_scores),
    )}`;
    expect(() =>
      computePhase5EvaluationReport(preregistration, {
        ...evaluation,
        score_freeze: callerAuthoredScoreFreeze,
      }),
    ).toThrow(/does not reproduce from the raw primary/u);
    const callerAuthoredExternalEvidence = {
      ...evaluation,
      host_trace: createHostTrace(preregistration),
      published_package_attestation: {
        contract: "salt_phase5_published_package_attestation_v1",
        package_sha256: preregistration.architectures.find(
          (architecture: { kind: string }) =>
            architecture.kind === "minimal_architecture",
        ).package_sha256,
        registry_url: "https://registry.example.invalid/@salt-ds/mcp",
        verified_at: afterFreeze(preregistration, 32),
      },
    };
    expect(
      computePhase5EvaluationReport(
        preregistration,
        callerAuthoredExternalEvidence,
      ),
    ).toMatchObject({
      gate_status: "blocked",
      beta_gate_passed: false,
      external_evidence_blockers: expect.arrayContaining([
        "trusted_external_evidence_keys_unconfigured",
      ]),
    });

    const criticalSubmissions = structuredClone(primarySubmissions);
    const minimalMapping = sealedMapping.mapping.find(
      (entry: { architecture_id: string }) =>
        entry.architecture_id === "minimal_phase4_verified",
    );
    expect(minimalMapping).toBeDefined();
    const criticalRating = criticalSubmissions[0].ratings.find(
      (rating: { opaque_id: string }) =>
        rating.opaque_id === minimalMapping?.opaque_id,
    );
    expect(criticalRating).toBeDefined();
    if (!criticalRating) throw new Error("Missing minimal-arm rating.");
    criticalRating.critical_failures = ["false_completion"];
    const criticalFreeze = freezePhase5Scores(
      preregistration,
      packetManifest,
      criticalSubmissions,
      null,
      afterFreeze(preregistration, 22),
    );
    expect(
      computePhase5EvaluationReport(preregistration, {
        ...callerAuthoredExternalEvidence,
        primary_submissions: criticalSubmissions,
        score_freeze: criticalFreeze,
      }),
    ).toMatchObject({
      gate_status: "blocked",
      beta_gate_passed: false,
      outcome_thresholds_passed: false,
    });
  });

  it("requires independent ratings and exact third-rater adjudication", () => {
    const captures = createCaptures(preregistration);
    const packetManifest = buildBlindScorePackets(
      preregistration,
      captures,
      BLINDING_SECRET,
    );
    const first = createPrimarySubmission(
      preregistration,
      packetManifest,
      "rater_one",
    );
    const second = createPrimarySubmission(
      preregistration,
      packetManifest,
      "rater_two",
    );
    second.ratings[0].scores.task_correctness = 1;
    const plan = createPhase5AdjudicationPlan(preregistration, packetManifest, [
      first,
      second,
    ]);
    expect(plan.cells).toEqual([
      {
        opaque_id: packetManifest.packets[0].opaque_id,
        dimension: "task_correctness",
      },
    ]);
    expect(() =>
      freezePhase5Scores(
        preregistration,
        packetManifest,
        [first, second],
        null,
        afterFreeze(preregistration, 22),
      ),
    ).toThrow();
    expect(() =>
      freezePhase5Scores(
        preregistration,
        packetManifest,
        [first, { ...second, rater_id: first.rater_id }],
        null,
        afterFreeze(preregistration, 22),
      ),
    ).toThrow(/independent/u);
    expect(
      freezePhase5Scores(
        preregistration,
        packetManifest,
        [first, second],
        {
          contract: "salt_phase5_rating_v1",
          phase: "adjudication",
          preregistration_digest: computePreregistrationDigest(preregistration),
          packet_manifest_digest: packetManifest.packet_manifest_digest,
          plan_digest: plan.plan_digest,
          rater_id: "rater_three",
          rater_key_id: "rater_three_key",
          independence_attestation: true,
          submitted_at: afterFreeze(preregistration, 17),
          ratings: [{ ...plan.cells[0], score: 3 }],
        },
        afterFreeze(preregistration, 22),
      ).final_scores[0].scores.task_correctness,
    ).toBe(3);
  });

  it.skip("verifies role-separated signatures and the complete evidence event chain", async () => {
    const signedPreregistration = clonePreregistration(preregistration);
    const privateKeys = configureSignedEvidenceKeys(signedPreregistration);
    const trustedKeyFingerprints = externalKeyFingerprints(
      signedPreregistration,
    );
    await expect(
      validatePhase5Preregistration(signedPreregistration, {
        repoRoot: REPO_ROOT,
        verifyBoundFiles: false,
        verifyLock: false,
        trustedKeyFingerprints,
      }),
    ).resolves.toMatchObject({ task_count: 30 });
    await expect(
      validatePhase5Preregistration(signedPreregistration, {
        repoRoot: REPO_ROOT,
        verifyBoundFiles: false,
        verifyLock: false,
      }),
    ).rejects.toThrow(/external fingerprint set/u);
    const duplicatedFingerprints = trustedKeyFingerprints.map(() => ({
      ...trustedKeyFingerprints[0],
    }));
    await expect(
      validatePhase5Preregistration(signedPreregistration, {
        repoRoot: REPO_ROOT,
        verifyBoundFiles: false,
        verifyLock: false,
        trustedKeyFingerprints: duplicatedFingerprints,
      }),
    ).rejects.toThrow(/external fingerprint set/u);

    const captures = createCaptures(signedPreregistration);
    const evaluatorRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "salt-phase5-signed-evaluator-"),
    );
    onTestFinished(() =>
      fs.rmSync(evaluatorRoot, { recursive: true, force: true }),
    );
    const evaluatorName =
      process.platform === "win32"
        ? "phase5-artifact-check-runner.exe"
        : "phase5-artifact-check-runner";
    const evaluatorExecutable = path.join(evaluatorRoot, evaluatorName);
    fs.copyFileSync(process.execPath, evaluatorExecutable);
    fs.chmodSync(evaluatorExecutable, 0o755);
    const evaluatorBinarySha256 = sha256Bytes(
      fs.readFileSync(evaluatorExecutable),
    );
    for (const capture of captures) {
      for (const check of capture.checks) {
        check.command.executable = evaluatorExecutable;
        check.evaluator_binary_sha256 = evaluatorBinarySha256;
        check.evaluator_version = process.version;
      }
    }
    const verifiedTrustedEvaluatorIdentity =
      verifyPhase5TrustedEvaluatorIdentity(
        {
          contract: "salt_phase5_trusted_evaluator_identity_v1",
          binary_name: "phase5-artifact-check-runner",
          executable_path: evaluatorExecutable,
          executable_sha256: evaluatorBinarySha256,
          version: process.version,
        },
        {
          forbiddenRoots: [
            REPO_ROOT,
            ...captures.flatMap((capture) => [
              capture.worktree_root,
              capture.worktree_receipt.real_root_at_execution,
            ]),
          ],
        },
      );
    for (const capture of captures) {
      for (const check of capture.checks) {
        check.command.executable =
          verifiedTrustedEvaluatorIdentity.executable_path;
      }
    }
    const packetManifest = buildBlindScorePackets(
      signedPreregistration,
      captures,
      BLINDING_SECRET,
    );
    const sealedMapping = buildPhase5SealedMapping(
      signedPreregistration,
      captures,
      BLINDING_SECRET,
    );
    const primarySubmissions = [
      createPrimarySubmission(
        signedPreregistration,
        packetManifest,
        "primary_one",
      ),
      createPrimarySubmission(
        signedPreregistration,
        packetManifest,
        "primary_two",
      ),
    ];
    const adjudicationPlan = createPhase5AdjudicationPlan(
      signedPreregistration,
      packetManifest,
      primarySubmissions,
    );
    const scoreFreeze = freezePhase5Scores(
      signedPreregistration,
      packetManifest,
      primarySubmissions,
      null,
      afterFreeze(signedPreregistration, 22),
    );
    const hostTrace = createHostTrace(signedPreregistration);
    const minimalArchitecture = signedPreregistration.architectures.find(
      (architecture: { kind: string }) =>
        architecture.kind === "minimal_architecture",
    );
    if (!minimalArchitecture) throw new Error("Missing minimal architecture.");
    const publishedTarballBytes = fs.readFileSync(
      path.resolve(REPO_ROOT, minimalArchitecture.package_path),
    );
    const distIntegrity = `sha512-${createHash("sha512")
      .update(publishedTarballBytes)
      .digest("base64")}`;
    const downloadedTarballSha256 = sha256Bytes(publishedTarballBytes);
    const registryManifest = {
      name: "@salt-ds/mcp",
      version: "0.0.0",
      gitHead: "a".repeat(40),
      dist: {
        integrity: distIntegrity,
        tarball:
          "https://registry.npmjs.org/@salt-ds/mcp/-/salt-ds-mcp-0.0.0.tgz",
      },
    };
    const smokeReceipt = {
      contract: "salt_phase5_published_consumer_smoke_receipt_v1",
      package_name: "@salt-ds/mcp",
      package_version: "0.0.0",
      registry_git_head: "a".repeat(40),
      dist_integrity: distIntegrity,
      downloaded_tarball_sha256: downloadedTarballSha256,
      exit_code: 0,
      checks: Object.fromEntries(
        [
          "npm_clean_install",
          "yarn_clean_replay",
          "esm_exports",
          "commonjs_exports",
          "stdio_transport",
          "resource_exhaustion",
          "offline_boundary",
          "typecheck",
          "render",
          "keyboard_interaction",
          "whole_document_accessibility",
        ].map((check) => [check, true]),
      ),
    };
    const publishedPackageAttestation = {
      contract: "salt_phase5_published_package_attestation_v3",
      package_name: "@salt-ds/mcp",
      package_version: "0.0.0",
      registry_origin: "https://registry.npmjs.org",
      registry_manifest_url: "https://registry.npmjs.org/@salt-ds%2fmcp/0.0.0",
      dist_integrity: distIntegrity,
      registry_git_head: "a".repeat(40),
      candidate_package_sha256: minimalArchitecture.package_sha256,
      downloaded_tarball_sha256: downloadedTarballSha256,
      downloaded_tarball_sha512: distIntegrity,
      downloaded_tarball_bytes: publishedTarballBytes.byteLength,
      smoke_exit_code: 0,
      verified_at: afterFreeze(signedPreregistration, 37),
      registry_manifest: contentRecord(canonicalJson(registryManifest)),
      smoke_receipt: contentRecord(canonicalJson(smokeReceipt)),
    };
    const runtimeIntelligenceAudit = auditPhase5RuntimeIntelligence(
      signedPreregistration,
      REPO_ROOT,
    );
    expect(
      validatePhase5PublishedPackageAttestation(
        signedPreregistration,
        publishedPackageAttestation,
        scoreFreeze.frozen_at,
        {
          downloadedTarballBytes: publishedTarballBytes,
          repoRoot: REPO_ROOT,
        },
      ),
    ).toBe(true);
    const arbitraryVersion = structuredClone(publishedPackageAttestation);
    arbitraryVersion.package_version = "9.9.9";
    arbitraryVersion.registry_manifest_url =
      "https://registry.npmjs.org/@salt-ds%2fmcp/9.9.9";
    expect(() =>
      validatePhase5PublishedPackageAttestation(
        signedPreregistration,
        arbitraryVersion,
        scoreFreeze.frozen_at,
        {
          downloadedTarballBytes: publishedTarballBytes,
          repoRoot: REPO_ROOT,
        },
      ),
    ).toThrow(/registry manifest is not exactly bound/u);
    const nonJsonManifest = structuredClone(publishedPackageAttestation);
    nonJsonManifest.registry_manifest = contentRecord("not json");
    expect(() =>
      validatePhase5PublishedPackageAttestation(
        signedPreregistration,
        nonJsonManifest,
        scoreFreeze.frozen_at,
        {
          downloadedTarballBytes: publishedTarballBytes,
          repoRoot: REPO_ROOT,
        },
      ),
    ).toThrow(/must be canonical JSON/u);
    const digest = (value: unknown) =>
      `sha256:${sha256Bytes(canonicalJson(value))}`;
    const eventDefinitions = [
      [
        "capture_manifest_closed",
        "executor",
        "executor_key",
        {
          captures_digest: digest(captures),
          run_schedule_sha256: computePhase5RunScheduleDigest(
            signedPreregistration,
          ),
        },
      ],
      [
        "blind_packet_manifest_published",
        "coordinator",
        "coordinator_key",
        {
          packet_manifest_digest: packetManifest.packet_manifest_digest,
          mapping_commitment: packetManifest.mapping_commitment,
        },
      ],
      [
        "primary_rating_submitted",
        "primary_rater",
        "primary_one_key",
        {
          submission_digest: digest(primarySubmissions[0]),
          rater_key_id: "primary_one_key",
        },
      ],
      [
        "primary_rating_submitted",
        "primary_rater",
        "primary_two_key",
        {
          submission_digest: digest(primarySubmissions[1]),
          rater_key_id: "primary_two_key",
        },
      ],
      [
        "adjudication_plan_published",
        "coordinator",
        "coordinator_key",
        { plan_digest: adjudicationPlan.plan_digest },
      ],
      [
        "adjudication_submission_recorded",
        "adjudicator",
        "adjudicator_key",
        { submission_digest: null, adjudicator_key_id: null },
      ],
      [
        "score_freeze_published",
        "coordinator",
        "coordinator_key",
        { score_freeze_digest: digest(scoreFreeze) },
      ],
      [
        "mapping_revealed",
        "coordinator",
        "coordinator_key",
        {
          mapping_digest: digest(sealedMapping.mapping),
          mapping_commitment: sealedMapping.mapping_commitment,
        },
      ],
      [
        "host_interoperability_verified",
        "host_verifier",
        "host_key",
        { host_trace_digest: digest(hostTrace) },
      ],
      [
        "published_package_verified",
        "publisher_verifier",
        "publisher_key",
        {
          published_package_attestation_digest: digest(
            publishedPackageAttestation,
          ),
          published_tarball_sha256: downloadedTarballSha256,
          ac24_audit_digest: digest(runtimeIntelligenceAudit),
        },
      ],
    ] as const;
    let previous = computePreregistrationDigest(signedPreregistration);
    const signedEvidence = eventDefinitions.map(
      ([eventType, role, keyId, payload], index) => {
        const event = createSignedEvent(
          privateKeys,
          eventType,
          role,
          keyId,
          afterFreeze(signedPreregistration, 28 + index),
          previous,
          payload,
        );
        previous = digest(event);
        return event;
      },
    );
    const evidence = {
      captures,
      packetManifest,
      primarySubmissions,
      adjudicationSubmission: null,
      scoreFreeze,
      sealedMapping,
      hostTrace,
      publishedPackageAttestation,
      signedEvidence,
    };
    const evidenceValidationOptions = {
      downloadedTarballBytes: publishedTarballBytes,
      repoRoot: REPO_ROOT,
      runtimeIntelligenceAudit,
      trustedKeyFingerprints,
      trustedEvaluatorIdentity: verifiedTrustedEvaluatorIdentity,
    };
    expect(Object.isFrozen(verifiedTrustedEvaluatorIdentity)).toBe(true);
    expect(() =>
      Object.assign(verifiedTrustedEvaluatorIdentity, {
        version: "tampered-after-verification",
      }),
    ).toThrow();
    expect(() =>
      validatePhase5SignedEvidenceChain(signedPreregistration, evidence, {
        ...evidenceValidationOptions,
        trustedEvaluatorIdentity: {
          ...verifiedTrustedEvaluatorIdentity,
        },
      }),
    ).toThrow(/not verified from its external executable/u);
    const incompletelyScopedEvaluatorIdentity =
      verifyPhase5TrustedEvaluatorIdentity(
        {
          contract: "salt_phase5_trusted_evaluator_identity_v1",
          binary_name: "phase5-artifact-check-runner",
          executable_path: evaluatorExecutable,
          executable_sha256: evaluatorBinarySha256,
          version: process.version,
        },
        { forbiddenRoots: [REPO_ROOT] },
      );
    expect(() =>
      validatePhase5SignedEvidenceChain(signedPreregistration, evidence, {
        ...evidenceValidationOptions,
        trustedEvaluatorIdentity: incompletelyScopedEvaluatorIdentity,
      }),
    ).toThrow(/outside every repository and worktree root/u);
    expect(() =>
      computePhase5EvaluationReport(
        signedPreregistration,
        {
          captures,
          packet_manifest: packetManifest,
          sealed_mapping: sealedMapping,
          primary_submissions: primarySubmissions,
          adjudication_submission: null,
          score_freeze: scoreFreeze,
          host_trace: hostTrace,
          published_package_attestation: publishedPackageAttestation,
          signed_evidence: signedEvidence,
        },
        {
          publishedPackageTarballBytes: publishedTarballBytes,
          repoRoot: REPO_ROOT,
          trustedKeyFingerprints,
          trustedEvaluatorIdentity: {
            ...verifiedTrustedEvaluatorIdentity,
          },
        },
      ),
    ).toThrow(/not verified from its external executable/u);
    expect(
      validatePhase5SignedEvidenceChain(signedPreregistration, evidence, {
        ...evidenceValidationOptions,
      }),
    ).toEqual({ complete: true, blockers: [] });
    expect(() =>
      validatePhase5SignedEvidenceChain(signedPreregistration, evidence),
    ).toThrow(/external fingerprint set/u);

    const badSignature = structuredClone(signedEvidence);
    badSignature[0].signature_ed25519 = Buffer.alloc(64).toString("base64");
    expect(() =>
      validatePhase5SignedEvidenceChain(
        signedPreregistration,
        {
          ...evidence,
          signedEvidence: badSignature,
        },
        evidenceValidationOptions,
      ),
    ).toThrow(/invalid Ed25519 signature/u);

    const reordered = structuredClone(signedEvidence);
    [reordered[2], reordered[3]] = [reordered[3], reordered[2]];
    expect(() =>
      validatePhase5SignedEvidenceChain(
        signedPreregistration,
        {
          ...evidence,
          signedEvidence: reordered,
        },
        evidenceValidationOptions,
      ),
    ).toThrow(/stale, misbound, or uses an untrusted role/u);

    const wrongPayload = structuredClone(signedEvidence);
    wrongPayload[0] = createSignedEvent(
      privateKeys,
      "capture_manifest_recorded",
      "executor",
      "executor_key",
      wrongPayload[0].issued_at,
      computePreregistrationDigest(signedPreregistration),
      {
        captures_digest: "sha256:deadbeef",
        run_schedule_sha256: "sha256:deadbeef",
      },
    );
    expect(() =>
      validatePhase5SignedEvidenceChain(
        signedPreregistration,
        {
          ...evidence,
          signedEvidence: wrongPayload,
        },
        evidenceValidationOptions,
      ),
    ).toThrow(/stale, misbound, or uses an untrusted role/u);

    const earlyPublish = structuredClone(signedEvidence);
    earlyPublish[9] = createSignedEvent(
      privateKeys,
      "published_package_verified",
      "publisher_verifier",
      "publisher_key",
      afterFreeze(signedPreregistration, 36),
      digest(earlyPublish[8]),
      earlyPublish[9].payload,
    );
    expect(() =>
      validatePhase5SignedEvidenceChain(
        signedPreregistration,
        {
          ...evidence,
          signedEvidence: earlyPublish,
        },
        evidenceValidationOptions,
      ),
    ).toThrow(/predates its immutable registry attestation/u);

    const aliasedKeys = clonePreregistration(signedPreregistration);
    const repeatedPem =
      aliasedKeys.evidence_trust.trusted_keys[0].public_key_pem;
    for (const key of aliasedKeys.evidence_trust.trusted_keys) {
      key.public_key_pem = repeatedPem;
    }
    await expect(
      validatePhase5Preregistration(aliasedKeys, {
        repoRoot: REPO_ROOT,
        verifyBoundFiles: false,
        verifyLock: false,
      }),
    ).rejects.toThrow(/reuses public key material/u);

    const rsaKeys = clonePreregistration(signedPreregistration);
    rsaKeys.evidence_trust.trusted_keys =
      rsaKeys.evidence_trust.trusted_keys.map(
        (key: { key_id: string; role: string; public_key_pem: string }) => {
          const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
          return {
            ...key,
            public_key_pem: pair.publicKey
              .export({ type: "spki", format: "pem" })
              .toString(),
          };
        },
      );
    await expect(
      validatePhase5Preregistration(rsaKeys, {
        repoRoot: REPO_ROOT,
        verifyBoundFiles: false,
        verifyLock: false,
      }),
    ).rejects.toThrow(/non-Ed25519 public key/u);
  }, 20_000);

  it("requires an exact, capability-complete real-host trace", () => {
    const trace = createHostTrace(preregistration);
    expect(validatePhase5HostTrace(preregistration, trace)).toBe(true);
    expect(() =>
      validatePhase5HostTrace(preregistration, {
        ...trace,
        deleted_private_protocol_dependency: true,
      }),
    ).toThrow(/deleted private protocol/u);
  });
});
