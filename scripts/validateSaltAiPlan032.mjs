#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual, TextDecoder } from "node:util";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const baseline = "e55fa54e215503b4a0e521e2f5ee054b9f0068ce";
const planPath = "plans/032-fix-the-real-consumer-entry-path.md";
const controlPath = "plans/evidence/032/control.json";
const readmePath = "plans/README.md";
const unitIds = ["032/01", "032/02", "032/03", "032/04"];
const commitPattern = /^[0-9a-f]{40}$/u;
const digestPattern = /^[0-9a-f]{64}$/u;
const quote = String.fromCharCode(96);

export const predecessor = Object.freeze({
  plan_id: "006",
  unit: "006/00",
  disposition: "SUPERSEDED_UNFINISHED",
  snapshot_sha: baseline,
  plan_sha256:
    "d74db6ec4d4c2fd7be23fa61ff6d430224653f6c89bdbb61798b523db7160b76",
  control_sha256:
    "f02b2345cacd48f5900871c5a28263538272eb82413131e71821e6a39500c0d8",
});

export const historicalPaths = Object.freeze([
  "plans/003-publish-salt-ai-release-candidate.md",
  "plans/005-prove-version-aware-salt-ai-doctor.md",
  "plans/006-make-salt-doctor-lightweight-or-retire.md",
  "plans/evidence/004",
  "plans/evidence/005",
  "plans/evidence/006",
  "scripts/validateSaltAiPlan004.mjs",
  "scripts/validateSaltAiPlan004.spec.js",
  "scripts/validateSaltAiPlan006.mjs",
  "scripts/validateSaltAiPlan006.spec.js",
]);

export const historicalDigests = Object.freeze({
  "plans/006-make-salt-doctor-lightweight-or-retire.md":
    predecessor.plan_sha256,
  "plans/evidence/006/control.json": predecessor.control_sha256,
  "plans/evidence/005/control.json":
    "260b27e1cecd304a831b035872c2a23a1583f52fe6bb45dd78e30a96eb1a09c8",
  "plans/evidence/004/index.json":
    "28b981e295669c477de97c5ca453aa56fe4beb59d2ab81115aaa99cfe4dafc72",
});

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function exactKeys(value, keys, label) {
  invariant(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object`,
  );
  invariant(
    isDeepStrictEqual(Object.keys(value).sort(), [...keys].sort()),
    `${label} has unknown or missing fields`,
  );
}

function rawDigest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function planDigest(bytes) {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return rawDigest(text.replace(/\r\n?/gu, "\n"));
}

export function validateControlObject(
  control,
  expectedPlanDigest,
  { predecessorState = predecessor } = {},
) {
  exactKeys(
    control,
    [
      "contract",
      "plan_id",
      "plan_sha256",
      "predecessor",
      "active_dispatch",
      "units",
    ],
    "Plan 032 control",
  );
  invariant(
    control.contract === "salt-ai-plan-032-control/1" &&
      control.plan_id === "032",
    "Wrong Plan 032 control identity",
  );
  invariant(
    digestPattern.test(expectedPlanDigest) &&
      control.plan_sha256 === expectedPlanDigest,
    "Plan 032 plan hash mismatch",
  );
  invariant(
    isDeepStrictEqual(control.predecessor, predecessorState),
    "Plan 032 predecessor must be the fixed unfinished Plan 006 snapshot",
  );
  invariant(
    Array.isArray(control.units) && control.units.length === unitIds.length,
    "Plan 032 must contain exactly four units",
  );

  let active = null;
  let sawTodo = false;
  for (const [index, unit] of control.units.entries()) {
    exactKeys(
      unit,
      ["id", "status", "checkpoint_sha", "completion_sha"],
      "Plan 032 unit",
    );
    invariant(unit.id === unitIds[index], "Plan 032 unit order differs");
    if (unit.status === "DONE") {
      invariant(
        active === null && !sawTodo,
        "Completed units must be a leading prefix",
      );
      invariant(
        commitPattern.test(unit.checkpoint_sha),
        `${unit.id} checkpoint is invalid`,
      );
      invariant(
        commitPattern.test(unit.completion_sha) &&
          unit.completion_sha !== unit.checkpoint_sha,
        `${unit.id} completion is invalid`,
      );
      continue;
    }
    if (unit.status === "IN_PROGRESS") {
      invariant(
        active === null && !sawTodo,
        "Plan 032 must have only one active unit",
      );
      invariant(
        commitPattern.test(unit.checkpoint_sha) && unit.completion_sha === null,
        `${unit.id} active checkpoint is invalid`,
      );
      active = unit;
      continue;
    }
    invariant(unit.status === "TODO", "Invalid Plan 032 unit status");
    invariant(
      unit.checkpoint_sha === null && unit.completion_sha === null,
      `${unit.id} TODO fields must be null`,
    );
    invariant(
      active !== null,
      "Plan 032 must have an active unit before TODO units",
    );
    sawTodo = true;
  }

  const completed = control.units.filter((unit) => unit.status === "DONE");
  if (completed.length === unitIds.length) {
    invariant(
      control.active_dispatch === null,
      "A completed Plan 032 cannot have an active dispatch",
    );
  } else {
    invariant(active !== null, "Plan 032 requires exactly one active unit");
    exactKeys(
      control.active_dispatch,
      ["unit", "checkpoint_sha"],
      "Plan 032 active dispatch",
    );
    invariant(
      isDeepStrictEqual(control.active_dispatch, {
        unit: active.id,
        checkpoint_sha: active.checkpoint_sha,
      }),
      "Plan 032 active dispatch/checkpoint differs from its unit",
    );
  }
  return control;
}

export function validateReadme(source, control) {
  function field(name) {
    const prefix = `- **${name}:** `;
    const matches = source
      .split(/\r?\n/u)
      .filter((line) => line.startsWith(prefix));
    invariant(matches.length === 1, `README must contain one ${name} field`);
    return matches[0].slice(prefix.length);
  }
  const active = control.active_dispatch;
  invariant(
    field("Active plan/unit") ===
      (active ? `Plan 032 / Unit ${quote}${active.unit}${quote}` : "none"),
    "README active unit differs from Plan 032 control",
  );
  invariant(
    field("Checkpoint") ===
      (active ? quote + active.checkpoint_sha + quote : "none"),
    "README checkpoint differs from Plan 032 control",
  );
  const expectedStatus = active ? `IN PROGRESS — Unit ${active.unit}` : "DONE";
  invariant(
    field("Status") === expectedStatus,
    "README status differs from Plan 032 control",
  );
  invariant(
    field("Current control") === quote + controlPath + quote,
    "README current control differs from Plan 032 control",
  );
}

function git(root, args, encoding = "utf8") {
  return execFileSync("git", args, {
    cwd: root,
    env: Object.fromEntries(
      Object.entries(process.env).filter(
        ([key]) => !key.toUpperCase().startsWith("GIT_"),
      ),
    ),
    encoding,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function gitText(root, args) {
  return String(git(root, args)).trim();
}

function blob(root, commit, locator) {
  return git(root, ["show", `${commit}:${locator}`], null);
}

function assertCommit(root, sha, label) {
  invariant(commitPattern.test(sha), `${label} must be a full commit SHA`);
  let resolved;
  try {
    resolved = gitText(root, ["rev-parse", "--verify", `${sha}^{commit}`]);
  } catch {
    throw new Error(`${label} does not name a commit`);
  }
  invariant(resolved === sha, `${label} does not name a commit`);
}

function assertAncestor(root, earlier, later, label) {
  try {
    git(root, ["merge-base", "--is-ancestor", earlier, later]);
  } catch {
    throw new Error(`${label} is not an ancestor`);
  }
}

function validateReferences(root, control, baselineSha, head) {
  assertCommit(root, baselineSha, "Plan 032 baseline");
  assertAncestor(root, baselineSha, head, "Plan 032 baseline");
  let previousCompletion = baselineSha;
  for (const unit of control.units) {
    if (unit.status === "TODO") continue;
    assertCommit(root, unit.checkpoint_sha, `${unit.id} checkpoint`);
    assertAncestor(
      root,
      previousCompletion,
      unit.checkpoint_sha,
      `${unit.id} checkpoint`,
    );
    if (unit.status === "DONE") {
      assertCommit(root, unit.completion_sha, `${unit.id} completion`);
      assertAncestor(
        root,
        unit.checkpoint_sha,
        unit.completion_sha,
        `${unit.id} completion`,
      );
      assertAncestor(root, unit.completion_sha, head, `${unit.id} completion`);
      previousCompletion = unit.completion_sha;
    } else {
      assertAncestor(root, unit.checkpoint_sha, head, `${unit.id} checkpoint`);
    }
  }
}

function baselineFiles(root, baselineSha, paths) {
  return gitText(root, [
    "ls-tree",
    "-r",
    "--name-only",
    baselineSha,
    "--",
    ...paths,
  ])
    .split(/\r?\n/u)
    .filter(Boolean);
}

function validateHistoricalEvidence(
  root,
  baselineSha,
  head,
  paths,
  expectedDigests,
) {
  for (const [locator, digest] of Object.entries(expectedDigests)) {
    invariant(
      rawDigest(blob(root, baselineSha, locator)) === digest,
      `Frozen predecessor snapshot hash differs: ${locator}`,
    );
  }
  invariant(
    gitText(root, [
      "diff",
      "--name-only",
      baselineSha,
      head,
      "--",
      ...paths,
    ]) === "",
    "Preserved historical source changed after the fixed baseline",
  );
  invariant(
    gitText(root, [
      "status",
      "--porcelain=v1",
      "-z",
      "--untracked-files=all",
      "--",
      ...paths,
    ]) === "",
    "Preserved historical source changed in the working tree",
  );
  for (const locator of baselineFiles(root, baselineSha, paths)) {
    try {
      invariant(
        planDigest(readFileSync(path.join(root, locator))) ===
          planDigest(blob(root, baselineSha, locator)),
        `Preserved predecessor bytes changed: ${locator}`,
      );
    } catch {
      throw new Error(`Preserved predecessor bytes changed: ${locator}`);
    }
  }
}

export function validateRepository({
  root = repositoryRoot,
  baselineSha = baseline,
  predecessorState = predecessor,
  preservedPaths = historicalPaths,
  preservedDigests = historicalDigests,
} = {}) {
  const head = gitText(root, ["rev-parse", "--verify", "HEAD^{commit}"]);
  const plan = readFileSync(path.join(root, planPath));
  const control = validateControlObject(
    JSON.parse(readFileSync(path.join(root, controlPath), "utf8")),
    planDigest(plan),
    { baselineSha, predecessorState },
  );
  validateReadme(readFileSync(path.join(root, readmePath), "utf8"), control);
  const scripts = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8"),
  ).scripts;
  invariant(
    scripts?.["validate:salt-ai:plan-032"] ===
      "node ./scripts/validateSaltAiPlan032.mjs",
    "Plan 032 package command differs",
  );
  validateReferences(root, control, baselineSha, head);
  validateHistoricalEvidence(
    root,
    baselineSha,
    head,
    preservedPaths,
    preservedDigests,
  );
  return control;
}

function main() {
  invariant(process.argv.length === 2, "Plan 032 validator takes no arguments");
  validateRepository();
  process.stdout.write("Plan 032 validated.\n");
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
