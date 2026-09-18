#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const baseCommit = "25a93f131f824ea767e9412c2b10213588133cbb";
const predecessorPlanDigest =
  "5e048a9db36abb4409279856ace70e1f5e1af3125886940bede04584dfbd646f";
const predecessorControlDigest =
  "260b27e1cecd304a831b035872c2a23a1583f52fe6bb45dd78e30a96eb1a09c8";
const planPath = "plans/006-make-salt-doctor-lightweight-or-retire.md";
const controlPath = "plans/evidence/006/control.json";
const readmePath = "plans/README.md";
const validatorPath = "scripts/validateSaltAiPlan006.mjs";
const validatorSpecPath = "scripts/validateSaltAiPlan006.spec.js";
const fullCommit = /^[0-9a-f]{40}$/u;
const rawDigest = /^[0-9a-f]{64}$/u;

export const activationPaths = [
  "AGENTS.md",
  "package.json",
  "plans/README.md",
  "plans/evidence/006/control.json",
  "scripts/validateSaltAiPlan006.mjs",
  "scripts/validateSaltAiPlan006.spec.js",
].sort();

export const draftPaths = [planPath, readmePath].sort();

const immutableAfterActivation = [
  "AGENTS.md",
  "package.json",
  planPath,
  validatorPath,
  validatorSpecPath,
];

const unitIds = ["006/00", "006/01", "006/02"];
const resultsByUnit = new Map([
  [
    "006/00",
    new Map([
      [
        "PASS_RUNTIME_BASELINE",
        { successor: null, terminal: "READY_REAL_TASK_EVALUATION" },
      ],
      ["FIX_DUPLICATE_RUNTIME_ONCE", { successor: "006/01", terminal: null }],
      [
        "INCONCLUSIVE_RUNTIME",
        { successor: null, terminal: "DEFER_RUNTIME_EVIDENCE" },
      ],
    ]),
  ],
  [
    "006/01",
    new Map([
      [
        "READY_PACKED_RUNTIME_DECISION",
        { successor: "006/02", terminal: null },
      ],
    ]),
  ],
  [
    "006/02",
    new Map([
      [
        "PASS_TECHNICAL_FIT",
        { successor: null, terminal: "READY_REAL_TASK_EVALUATION" },
      ],
      [
        "RETIRE_INTERACTIVE_DOCTOR",
        { successor: null, terminal: "RETIRE_INTERACTIVE_DOCTOR" },
      ],
      [
        "INCONCLUSIVE_RUNTIME",
        { successor: null, terminal: "DEFER_RUNTIME_EVIDENCE" },
      ],
    ]),
  ],
]);

const activationControlKeys = [
  "contract",
  "plan_id",
  "plan_sha256",
  "predecessor",
  "active_dispatch",
  "units",
  "terminal_result",
];
const predecessorKeys = [
  "plan_id",
  "terminal_commit",
  "terminal_result",
  "control_sha256",
];
const unitKeys = [
  "id",
  "status",
  "checkpoint_sha",
  "completion_sha",
  "result",
  "evidence",
];
const evidenceKeys00 = [
  "pack_report_sha256",
  "decision_runner_sha256",
  "fixture_definition_sha256",
  "worker_concurrency_one_eligible",
  "pack_validation",
  "runtime_receipts",
];
const evidenceKeys02 = evidenceKeys00.filter(
  (key) => key !== "worker_concurrency_one_eligible",
);
const requiredHosts = ["linux-node-22", "linux-node-24", "windows-node-24"];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function git(args, options = {}) {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.toUpperCase().startsWith("GIT_"),
    ),
  );
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    env,
    encoding: Object.hasOwn(options, "encoding") ? options.encoding : "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function head() {
  return String(git(["rev-parse", "--verify", "HEAD^{commit}"])).trim();
}

function parents(commit) {
  const line = String(git(["rev-list", "--parents", "-n", "1", commit])).trim();
  return line.split(" ").slice(1);
}

function directParent(commit, label = commit) {
  const values = parents(commit);
  invariant(values.length === 1, `${label} must have exactly one parent`);
  return values[0];
}

function assertAncestor(ancestor, descendant, label) {
  try {
    git(["merge-base", "--is-ancestor", ancestor, descendant]);
  } catch {
    throw new Error(`${label} is not an ancestor`);
  }
}

function readBlob(commit, locator) {
  return git(["show", `${commit}:${locator}`], { encoding: null });
}

function parseZ(bytes) {
  return Buffer.from(bytes).toString("utf8").split("\0").filter(Boolean);
}

function changedPaths(from, to = "HEAD") {
  return parseZ(
    git(["diff", "--name-only", "-z", from, to, "--"], { encoding: null }),
  ).sort();
}

function dirtyPaths() {
  const records = parseZ(
    git(["status", "--porcelain=v1", "-z", "--untracked-files=all"], {
      encoding: null,
    }),
  );
  const paths = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    invariant(record.length >= 4, "Malformed Git status entry");
    paths.push(record.slice(3));
    if (/[RC]/u.test(record.slice(0, 2))) {
      index += 1;
      invariant(index < records.length, "Malformed Git rename entry");
      paths.push(records[index]);
    }
  }
  return [...new Set(paths)].sort();
}

export function assertExactPaths(actual, expected, label) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  invariant(
    JSON.stringify(sortedActual) === JSON.stringify(sortedExpected),
    `${label} path set mismatch: ${JSON.stringify(sortedActual)}`,
  );
}

function assertKeys(value, expected, label) {
  invariant(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object`,
  );
  invariant(
    JSON.stringify(Object.keys(value)) === JSON.stringify(expected),
    `${label} has unknown, missing, or reordered keys`,
  );
}

function assertSafeEvidencePath(locator, digest) {
  invariant(rawDigest.test(digest), "Evidence digest must be 64 lowercase hex");
  invariant(
    locator === `plans/evidence/006/runtime/sha256-${digest}.json`,
    "Evidence path is not content-addressed by its declared digest",
  );
}

function validateEvidenceShape(evidence, unit) {
  assertKeys(
    evidence,
    unit === "006/00" ? evidenceKeys00 : evidenceKeys02,
    `${unit} evidence`,
  );
  invariant(
    rawDigest.test(evidence.pack_report_sha256),
    "Invalid pack report digest",
  );
  invariant(
    rawDigest.test(evidence.decision_runner_sha256),
    "Invalid decision runner digest",
  );
  invariant(
    rawDigest.test(evidence.fixture_definition_sha256),
    "Invalid fixture definition digest",
  );
  if (unit === "006/00")
    invariant(
      typeof evidence.worker_concurrency_one_eligible === "boolean",
      "Unit 006/00 worker eligibility must be boolean",
    );
  assertKeys(
    evidence.pack_validation,
    ["path", "sha256"],
    "pack validation locator",
  );
  assertSafeEvidencePath(
    evidence.pack_validation.path,
    evidence.pack_validation.sha256,
  );
  invariant(
    Array.isArray(evidence.runtime_receipts) &&
      evidence.runtime_receipts.length === 3,
    "Runtime evidence must contain exactly three host receipts",
  );
  const seen = new Set([
    evidence.pack_validation.path,
    evidence.pack_validation.sha256,
  ]);
  evidence.runtime_receipts.forEach((entry, index) => {
    assertKeys(entry, ["host", "path", "sha256"], `runtime receipt ${index}`);
    invariant(
      entry.host === requiredHosts[index],
      "Runtime hosts are missing or reordered",
    );
    assertSafeEvidencePath(entry.path, entry.sha256);
    invariant(
      !seen.has(entry.path) && !seen.has(entry.sha256),
      "Duplicate evidence locator or digest",
    );
    seen.add(entry.path);
    seen.add(entry.sha256);
  });
}

export function validateControlObject(
  control,
  { planDigest, activationParent },
) {
  assertKeys(control, activationControlKeys, "Plan 006 control");
  invariant(
    control.contract === "salt-ai-plan-006-control/1",
    "Wrong Plan 006 control contract",
  );
  invariant(control.plan_id === "006", "Wrong Plan 006 ID");
  invariant(control.plan_sha256 === planDigest, "Plan 006 hash mismatch");
  assertKeys(control.predecessor, predecessorKeys, "Plan 006 predecessor");
  invariant(
    JSON.stringify(control.predecessor) ===
      JSON.stringify({
        plan_id: "005",
        terminal_commit: baseCommit,
        terminal_result: "CUT_DOCTOR",
        control_sha256: predecessorControlDigest,
      }),
    "Plan 006 predecessor differs from the fixed Plan 005 terminal",
  );
  invariant(
    Array.isArray(control.units) && control.units.length === 3,
    "Plan 006 must have three units",
  );

  let inProgress = null;
  let seenNonDone = false;
  control.units.forEach((entry, index) => {
    assertKeys(entry, unitKeys, `Plan 006 unit ${index}`);
    invariant(entry.id === unitIds[index], "Plan 006 unit order changed");
    invariant(
      ["DONE", "IN_PROGRESS", "TODO"].includes(entry.status),
      "Invalid unit status",
    );
    if (entry.status === "DONE") {
      invariant(!seenNonDone, "Plan 006 completed prefix is not contiguous");
      invariant(
        fullCommit.test(entry.checkpoint_sha),
        `${entry.id} checkpoint is invalid`,
      );
      invariant(
        fullCommit.test(entry.completion_sha),
        `${entry.id} completion is invalid`,
      );
      invariant(
        resultsByUnit.get(entry.id).has(entry.result),
        `${entry.id} result is not registered`,
      );
      if (entry.id === "006/01")
        invariant(
          entry.evidence === null,
          "Unit 006/01 must not bind runtime evidence",
        );
      else validateEvidenceShape(entry.evidence, entry.id);
    } else {
      seenNonDone = true;
      invariant(
        entry.completion_sha === null &&
          entry.result === null &&
          entry.evidence === null,
        `${entry.id} unfinished fields must be null`,
      );
      if (entry.status === "IN_PROGRESS") {
        invariant(inProgress === null, "Only one Plan 006 unit may be active");
        invariant(
          fullCommit.test(entry.checkpoint_sha),
          `${entry.id} checkpoint is invalid`,
        );
        inProgress = entry;
      } else
        invariant(
          entry.checkpoint_sha === null,
          `${entry.id} TODO checkpoint must be null`,
        );
    }
  });

  invariant(
    control.units[0].checkpoint_sha === activationParent,
    "Unit 006/00 checkpoint is not the activation parent",
  );
  for (let index = 1; index < control.units.length; index += 1) {
    const entry = control.units[index];
    if (entry.status !== "TODO")
      invariant(
        entry.checkpoint_sha === control.units[index - 1].completion_sha,
        `${entry.id} checkpoint does not equal predecessor completion`,
      );
  }

  if (inProgress) {
    assertKeys(
      control.active_dispatch,
      ["unit", "checkpoint_sha"],
      "active dispatch",
    );
    invariant(
      control.active_dispatch.unit === inProgress.id &&
        control.active_dispatch.checkpoint_sha === inProgress.checkpoint_sha,
      "Active dispatch differs from the in-progress unit",
    );
    invariant(
      control.terminal_result === null,
      "Active Plan 006 cannot be terminal",
    );
  } else {
    invariant(
      control.active_dispatch === null,
      "Terminal Plan 006 must have no active dispatch",
    );
    const last = control.units
      .filter((entry) => entry.status === "DONE")
      .at(-1);
    invariant(last, "Terminal Plan 006 has no completed unit");
    const transition = resultsByUnit.get(last.id).get(last.result);
    invariant(
      transition.terminal !== null,
      "Nonterminal result lacks its required successor",
    );
    invariant(
      control.terminal_result === transition.terminal,
      "Terminal result does not match the completed unit",
    );
  }
  return control;
}

export function isImplementationPathAuthorized(unit, locator) {
  if (unit === "006/00") {
    if (
      [
        ".github/workflows/test.yml",
        "evals/salt-ai/doctor/runtimeFitness.mjs",
        "evals/salt-ai/doctor/runtimeFitness.spec.js",
        "scripts/consumer-smoke/checks.mjs",
        "scripts/consumer-smoke/fixture.mjs",
        "scripts/consumer-smoke/shared.mjs",
      ].includes(locator)
    )
      return true;
    return /^scripts\/consumer-smoke\/(checks|fixture|shared)\.spec\.(js|mjs)$/u.test(
      locator,
    );
  }
  if (unit === "006/01") {
    if (
      [
        "packages/cli/src/__tests__/cli.spec.ts",
        "packages/cli/src/commands/doctor.ts",
        "packages/cli/src/commands/context.ts",
        "packages/cli/src/commands/docs.ts",
        "packages/cli/src/commands/info.ts",
        "packages/cli/src/commands/retrievalRuntime.ts",
        "packages/cli/src/commands/scan.ts",
        "packages/cli/src/commands/skill.ts",
        "packages/cli/src/scan/analyzeFiles.ts",
        "packages/cli/src/scan/scannerWorker.ts",
        "packages/cli/src/config/limits.ts",
        "packages/cli/schemas/salt-config-1.schema.json",
        "packages/cli/src/config/loadConfig.ts",
        "packages/cli/src/discovery/discoverProject.ts",
        "packages/cli/src/discovery/pathPatterns.ts",
        "packages/cli/src/scan/result.ts",
        "packages/knowledge/package.json",
        "packages/knowledge/src/__tests__/packagePublishBoundary.spec.ts",
        "packages/knowledge/src/manifest/artifactTree.ts",
        "packages/knowledge/src/manifest/knowledgeStore.ts",
        "packages/knowledge/src/manifest/loadKnowledge.ts",
        "packages/knowledge/src/review/reviewCatalogAdapter.ts",
        "scripts/checkAiToolingPackageDryRun.mjs",
        "scripts/checkAiToolingPackageDryRun.spec.js",
      ].includes(locator)
    )
      return true;
    if (/^packages\/knowledge\/src\/runtime\/(core|review)\.ts$/u.test(locator))
      return true;
    return (
      /^packages\/cli\/src\/(commands\/__tests__|config|discovery|scan)\/.*\.(spec|test)\.ts$/u.test(
        locator,
      ) ||
      /^packages\/knowledge\/src\/(manifest|review)\/.*\.spec\.ts$/u.test(
        locator,
      )
    );
  }
  return false;
}

function assertAuthorized(paths, unit, label) {
  const rejected = paths.filter(
    (locator) => !isImplementationPathAuthorized(unit, locator),
  );
  invariant(
    rejected.length === 0,
    `${label} includes unauthorized paths: ${rejected.join(", ")}`,
  );
}

function findActivationCommit(currentHead) {
  const commits = String(
    git([
      "rev-list",
      "--reverse",
      `${baseCommit}..${currentHead}`,
      "--",
      validatorPath,
    ]),
  )
    .trim()
    .split(/\r?\n/u)
    .filter(Boolean);
  invariant(
    commits.length === 1,
    "Plan 006 validator must be introduced exactly once",
  );
  return commits[0];
}

function readHeadState(currentHead) {
  invariant(
    readFileSync(fileURLToPath(import.meta.url)).equals(
      readBlob(currentHead, validatorPath),
    ),
    "Executing Plan 006 validator differs from the validator at HEAD",
  );
  const activationCommit = findActivationCommit(currentHead);
  const activationParent = directParent(
    activationCommit,
    "Plan 006 activation",
  );
  const planBytes = readBlob(currentHead, planPath);
  const planDigest = sha256(planBytes);
  const control = validateControlObject(
    JSON.parse(readBlob(currentHead, controlPath).toString("utf8")),
    { planDigest, activationParent },
  );
  assertAncestor(baseCommit, currentHead, "Fixed Plan 005 terminal");
  invariant(
    planDigest === control.plan_sha256,
    "Plan 006 control does not bind the plan blob",
  );
  invariant(
    sha256(
      readBlob(currentHead, "plans/005-prove-version-aware-salt-ai-doctor.md"),
    ) === predecessorPlanDigest,
    "Plan 005 plan bytes changed",
  );
  invariant(
    sha256(readBlob(currentHead, "plans/evidence/005/control.json")) ===
      predecessorControlDigest,
    "Plan 005 control bytes changed",
  );
  invariant(
    readBlob(
      currentHead,
      "plans/003-publish-salt-ai-release-candidate.md",
    ).equals(
      readBlob(baseCommit, "plans/003-publish-salt-ai-release-candidate.md"),
    ),
    "Plan 003 changed during Plan 006",
  );
  immutableAfterActivation.forEach((locator) => {
    invariant(
      readBlob(currentHead, locator).equals(
        readBlob(activationCommit, locator),
      ),
      `${locator} changed after Plan 006 activation`,
    );
  });
  const packageJson = JSON.parse(
    readBlob(currentHead, "package.json").toString("utf8"),
  );
  invariant(
    packageJson.scripts?.["validate:salt-ai:plan-006"] ===
      "node ./scripts/validateSaltAiPlan006.mjs",
    "Plan 006 package script changed",
  );
  const readme = readBlob(currentHead, readmePath).toString("utf8");
  if (control.active_dispatch)
    invariant(
      readme.includes(`Plan 006 / Unit \`${control.active_dispatch.unit}\``) &&
        readme.includes(`\`${control.active_dispatch.checkpoint_sha}\``),
      "README does not mirror the active Plan 006 dispatch",
    );
  else
    invariant(
      readme.includes(`\`${control.terminal_result}\``),
      "README does not mirror the terminal Plan 006 result",
    );
  return { activationCommit, activationParent, control, planBytes, planDigest };
}

export function assertUnit02EvidenceContinuity(unit00Pack, unit02Pack) {
  invariant(
    unit00Pack?.unit === "006/00" && unit02Pack?.unit === "006/02",
    "Cross-unit evidence does not identify Units 006/00 and 006/02",
  );
  invariant(
    unit00Pack.source_sha !== unit02Pack.source_sha,
    "Unit 006/02 source must differ from Unit 006/00",
  );
  invariant(
    unit00Pack.consumer?.package_json_sha256 ===
      unit02Pack.consumer?.package_json_sha256 &&
      unit00Pack.consumer?.external_production_graph_sha256 ===
        unit02Pack.consumer?.external_production_graph_sha256,
    "Unit 006/02 consumer manifest or external production graph drifted",
  );
  const firstExternal = unit00Pack.consumer?.production_graph?.filter(
    ({ name }) => !["@salt-ds/knowledge", "@salt-ds/cli"].includes(name),
  );
  const secondExternal = unit02Pack.consumer?.production_graph?.filter(
    ({ name }) => !["@salt-ds/knowledge", "@salt-ds/cli"].includes(name),
  );
  invariant(
    JSON.stringify(firstExternal) === JSON.stringify(secondExternal),
    "Unit 006/02 external production graph entries drifted",
  );
  invariant(
    Array.isArray(unit00Pack.packages) &&
      Array.isArray(unit02Pack.packages) &&
      unit00Pack.packages.length === 2 &&
      unit02Pack.packages.length === 2 &&
      unit00Pack.packages.every(
        (entry, index) =>
          entry.name === unit02Pack.packages[index]?.name &&
          entry.tarball_sha256 !== unit02Pack.packages[index]?.tarball_sha256,
      ),
    "Unit 006/02 did not bind two rebuilt Salt tarballs",
  );
}

function validateCommittedEvidence(currentHead, entry) {
  const evidence = entry.evidence;
  const locators = [
    evidence.pack_validation,
    ...evidence.runtime_receipts.map(
      ({ path: receiptPath, sha256: digest }) => ({
        path: receiptPath,
        sha256: digest,
      }),
    ),
  ];
  locators.forEach(({ path: locator, sha256: digest }) => {
    const bytes = readBlob(currentHead, locator);
    invariant(sha256(bytes) === digest, `${locator} content digest mismatch`);
    const value = JSON.parse(bytes.toString("utf8"));
    invariant(
      bytes.toString("utf8") === `${JSON.stringify(value)}\n`,
      `${locator} is not canonical compact LF JSON`,
    );
  });
  const packReceipt = JSON.parse(
    readBlob(currentHead, evidence.pack_validation.path).toString("utf8"),
  );
  invariant(
    packReceipt.unit === entry.id &&
      packReceipt.source_sha === entry.completion_sha &&
      packReceipt.pack_report_sha256 === evidence.pack_report_sha256 &&
      packReceipt.decision_runner_sha256 === evidence.decision_runner_sha256 &&
      packReceipt.fixture_definition_sha256 ===
        evidence.fixture_definition_sha256,
    `${entry.id} control does not bind its pack receipt and completion`,
  );
  invariant(
    sha256(readBlob(currentHead, "evals/salt-ai/doctor/runtimeFitness.mjs")) ===
      evidence.decision_runner_sha256,
    "Decision runner digest mismatch",
  );
  invariant(
    sha256(readBlob(currentHead, "evals/salt-ai/doctor/fixtures.json")) ===
      evidence.fixture_definition_sha256,
    "Fixture definition digest mismatch",
  );
  const argumentsForRunner = [
    path.join(repositoryRoot, "evals/salt-ai/doctor/runtimeFitness.mjs"),
    "--mode",
    "decide",
    "--unit",
    entry.id,
    "--pack-validation",
    path.join(repositoryRoot, evidence.pack_validation.path),
  ];
  evidence.runtime_receipts.forEach((receipt) => {
    argumentsForRunner.push(
      "--observation",
      path.join(repositoryRoot, receipt.path),
    );
  });
  const stdout = execFileSync(process.execPath, argumentsForRunner, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const expected = {
    contract: "salt-ai-plan-006-decision/1",
    unit: entry.id,
    result: entry.result,
  };
  if (entry.id === "006/00")
    expected.worker_concurrency_one_eligible =
      evidence.worker_concurrency_one_eligible;
  invariant(
    stdout === `${JSON.stringify(expected)}\n`,
    "Decision runner output differs from control",
  );
  return packReceipt;
}

function assertTransition(currentHead, state) {
  invariant(
    dirtyPaths().length === 0,
    "Plan 006 transition validation requires a clean worktree",
  );
  const transitionParent = directParent(currentHead, "Plan 006 transition");
  const beforeControl = JSON.parse(
    readBlob(transitionParent, controlPath).toString("utf8"),
  );
  assertKeys(
    beforeControl,
    activationControlKeys,
    "Pre-transition Plan 006 control",
  );
  invariant(
    beforeControl.active_dispatch !== null,
    "Transition parent has no active unit",
  );
  const unit = beforeControl.active_dispatch.unit;
  const afterEntry = state.control.units.find((entry) => entry.id === unit);
  invariant(
    afterEntry?.status === "DONE",
    "Transition did not complete the active unit",
  );
  const rule = resultsByUnit.get(unit)?.get(afterEntry.result);
  invariant(rule, "Transition result is not registered");
  const implementationUnits = new Set(["006/00", "006/01"]);
  if (implementationUnits.has(unit)) {
    invariant(
      afterEntry.completion_sha === transitionParent,
      "Transition completion is not its implementation parent",
    );
    const dispatch = directParent(transitionParent, `${unit} implementation`);
    invariant(
      directParent(dispatch, `${unit} dispatch`) === afterEntry.checkpoint_sha,
      `${unit} dispatch is not the child of its checkpoint`,
    );
  } else {
    invariant(
      afterEntry.completion_sha === transitionParent,
      "Unit 006/02 completion must equal its dispatch HEAD",
    );
    invariant(
      directParent(transitionParent, "Unit 006/02 dispatch") ===
        afterEntry.checkpoint_sha,
      "Unit 006/02 dispatch is not the child of its checkpoint",
    );
  }

  const expectedBefore = structuredClone(state.control);
  const expectedEntry = expectedBefore.units.find((entry) => entry.id === unit);
  expectedEntry.status = "IN_PROGRESS";
  expectedEntry.completion_sha = null;
  expectedEntry.result = null;
  expectedEntry.evidence = null;
  expectedBefore.terminal_result = null;
  expectedBefore.active_dispatch = {
    unit,
    checkpoint_sha: expectedEntry.checkpoint_sha,
  };
  if (rule.successor) {
    const successor = expectedBefore.units.find(
      (entry) => entry.id === rule.successor,
    );
    successor.status = "TODO";
    successor.checkpoint_sha = null;
  }
  invariant(
    JSON.stringify(beforeControl) === JSON.stringify(expectedBefore),
    "Transition changed control beyond the registered state change",
  );

  const expectedPaths = [readmePath, controlPath];
  if (unit !== "006/01") {
    expectedPaths.push(afterEntry.evidence.pack_validation.path);
    expectedPaths.push(
      ...afterEntry.evidence.runtime_receipts.map((entry) => entry.path),
    );
    validateCommittedEvidence(currentHead, afterEntry);
  }
  assertExactPaths(
    changedPaths(transitionParent, currentHead),
    expectedPaths,
    `${unit} transition`,
  );
  if (unit === "006/02") {
    const unit00 = state.control.units[0];
    invariant(
      afterEntry.evidence.decision_runner_sha256 ===
        unit00.evidence.decision_runner_sha256,
      "Unit 006/02 did not reuse the Unit 006/00 decision runner",
    );
    const unit00Pack = validateCommittedEvidence(currentHead, unit00);
    const unit02Pack = validateCommittedEvidence(currentHead, afterEntry);
    assertUnit02EvidenceContinuity(unit00Pack, unit02Pack);
  }
}

function validateActivation(currentHead, state) {
  invariant(
    dirtyPaths().length === 0,
    "Plan 006 activation validation requires a clean worktree",
  );
  invariant(
    currentHead === state.activationCommit,
    "Activation phase must run at the activation commit",
  );
  assertExactPaths(
    changedPaths(state.activationParent, currentHead),
    activationPaths,
    "Plan 006 activation",
  );
  assertExactPaths(
    changedPaths(baseCommit, state.activationParent),
    draftPaths,
    "Plan 006 activation parent",
  );
  invariant(
    state.control.active_dispatch?.unit === "006/00" &&
      state.control.active_dispatch.checkpoint_sha === state.activationParent,
    "Plan 006 activation did not dispatch only Unit 006/00",
  );
  invariant(
    state.control.units[0].status === "IN_PROGRESS" &&
      state.control.units.slice(1).every((entry) => entry.status === "TODO"),
    "Plan 006 activation unit state is invalid",
  );
}

function validateWorktree(currentHead, state) {
  const active = state.control.active_dispatch;
  invariant(active, "Plan 006 worktree phase requires an active unit");
  invariant(
    directParent(currentHead, `${active.unit} dispatch`) ===
      active.checkpoint_sha,
    `${active.unit} dispatch is not the direct child of its checkpoint`,
  );
  assertAuthorized(dirtyPaths(), active.unit, `${active.unit} worktree`);
}

function validatePostCommit(currentHead, state) {
  invariant(
    dirtyPaths().length === 0,
    "Plan 006 post-commit validation requires a clean worktree",
  );
  const active = state.control.active_dispatch;
  invariant(
    active && ["006/00", "006/01"].includes(active.unit),
    "Post-commit requires active Unit 006/00 or 006/01",
  );
  const dispatch = directParent(currentHead, `${active.unit} implementation`);
  invariant(
    directParent(dispatch, `${active.unit} dispatch`) === active.checkpoint_sha,
    `${active.unit} dispatch is not the direct child of its checkpoint`,
  );
  assertAuthorized(
    changedPaths(dispatch, currentHead),
    active.unit,
    `${active.unit} implementation`,
  );
  const entry = state.control.units.find(({ id }) => id === active.unit);
  invariant(
    entry.completion_sha === null,
    "Control guessed the implementation completion SHA",
  );
}

function validateFinal(currentHead, state) {
  invariant(
    dirtyPaths().length === 0,
    "Plan 006 final validation requires a clean worktree",
  );
  invariant(
    state.control.active_dispatch === null,
    "Plan 006 final validation requires terminal control",
  );
  assertTransition(currentHead, state);
  state.control.units
    .filter((entry) => entry.status === "DONE" && entry.id !== "006/01")
    .forEach((entry) => {
      validateCommittedEvidence(currentHead, entry);
    });
  if (state.control.units[2].status === "DONE") {
    const unit00Pack = validateCommittedEvidence(
      currentHead,
      state.control.units[0],
    );
    const unit02Pack = validateCommittedEvidence(
      currentHead,
      state.control.units[2],
    );
    assertUnit02EvidenceContinuity(unit00Pack, unit02Pack);
  }
}

async function main() {
  invariant(
    process.argv.length === 4 && process.argv[2] === "--phase",
    "Expected exactly --phase <registered-phase>",
  );
  const phase = process.argv[3];
  const phases = new Set([
    "plan-006-hash",
    "plan-006-activation",
    "plan-006-worktree",
    "plan-006-post-commit",
    "plan-006-transition",
    "plan-006-final",
  ]);
  invariant(phases.has(phase), "Unknown Plan 006 phase");
  invariant(
    String(git(["rev-parse", "--is-shallow-repository"])).trim() === "false",
    "Plan 006 validation requires a complete, non-shallow repository",
  );
  const currentHead = head();
  if (phase === "plan-006-hash") {
    process.stdout.write(`${sha256(readBlob(currentHead, planPath))}\n`);
    return;
  }
  const state = readHeadState(currentHead);
  if (phase === "plan-006-activation") validateActivation(currentHead, state);
  else if (phase === "plan-006-worktree") validateWorktree(currentHead, state);
  else if (phase === "plan-006-post-commit")
    validatePostCommit(currentHead, state);
  else if (phase === "plan-006-transition")
    assertTransition(currentHead, state);
  else validateFinal(currentHead, state);
  console.log(`Plan 006 validated (${phase}).`);
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
