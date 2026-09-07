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
const planPath = "plans/033-deliver-verified-salt-workflows.md";
const controlPath = "plans/evidence/033/control.json";
const readmePath = "plans/README.md";
const terminalPlanPath = "plans/032-fix-the-real-consumer-entry-path.md";
const terminalControlPath = "plans/evidence/032/control.json";
const units = ["033/01", "033/02", "033/02a"];
const sha = /^[0-9a-f]{40}$/u;
const digest = /^[0-9a-f]{64}$/u;
const quote = String.fromCharCode(96);

function invariant(value, message) {
  if (!value) throw new Error(message);
}
function exactKeys(value, keys, label) {
  invariant(
    value && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object`,
  );
  invariant(
    isDeepStrictEqual(Object.keys(value).sort(), [...keys].sort()),
    `${label} has unknown or missing fields`,
  );
}
export function planDigest(bytes) {
  return createHash("sha256")
    .update(
      new TextDecoder("utf-8", { fatal: true })
        .decode(bytes)
        .replace(/\r\n?/gu, "\n"),
    )
    .digest("hex");
}
export function validateControlObject(control, expectedDigest) {
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
    "Plan 033 control",
  );
  invariant(
    control.contract === "salt-ai-plan-033-control/1" &&
      control.plan_id === "033",
    "Wrong Plan 033 control identity",
  );
  invariant(
    digest.test(expectedDigest) && control.plan_sha256 === expectedDigest,
    "Plan 033 plan hash mismatch",
  );
  exactKeys(
    control.predecessor,
    ["plan_id", "completion_sha"],
    "Plan 033 predecessor",
  );
  invariant(
    control.predecessor.plan_id === "032" &&
      sha.test(control.predecessor.completion_sha),
    "Plan 033 predecessor is invalid",
  );
  invariant(
    Array.isArray(control.units) && control.units.length === units.length,
    "Plan 033 units are incomplete",
  );
  let active = null;
  let todo = false;
  for (const [index, unit] of control.units.entries()) {
    exactKeys(
      unit,
      ["id", "status", "checkpoint_sha", "completion_sha"],
      "Plan 033 unit",
    );
    invariant(unit.id === units[index], "Plan 033 unit order differs");
    if (unit.status === "DONE") {
      invariant(
        !active &&
          !todo &&
          sha.test(unit.checkpoint_sha) &&
          sha.test(unit.completion_sha) &&
          unit.checkpoint_sha !== unit.completion_sha,
        "Plan 033 completed unit is invalid",
      );
      continue;
    }
    if (unit.status === "IN_PROGRESS") {
      invariant(
        !active &&
          !todo &&
          sha.test(unit.checkpoint_sha) &&
          unit.completion_sha === null,
        "Plan 033 active unit is invalid",
      );
      active = unit;
      continue;
    }
    invariant(
      unit.status === "TODO" &&
        unit.checkpoint_sha === null &&
        unit.completion_sha === null &&
        active,
      "Plan 033 TODO unit is invalid",
    );
    todo = true;
  }
  if (control.units.every((unit) => unit.status === "DONE")) {
    invariant(
      control.active_dispatch === null,
      "A completed Plan 033 cannot have an active dispatch",
    );
  } else {
    invariant(active !== null, "Plan 033 requires one active unit");
    exactKeys(
      control.active_dispatch,
      ["unit", "checkpoint_sha"],
      "Plan 033 active dispatch",
    );
    invariant(
      isDeepStrictEqual(control.active_dispatch, {
        unit: active.id,
        checkpoint_sha: active.checkpoint_sha,
      }),
      "Plan 033 active dispatch differs from its unit",
    );
  }
  return control;
}
export function validateReadme(source, control) {
  const field = (name) => {
    const matches = source
      .split(/\r?\n/u)
      .filter((line) => line.startsWith(`- **${name}:** `));
    invariant(matches.length === 1, `README must contain one ${name} field`);
    return matches[0].slice(`- **${name}:** `.length);
  };
  const active = control.active_dispatch;
  invariant(
    field("Active plan/unit") ===
      (active ? `Plan 033 / Unit ${quote}${active.unit}${quote}` : "none"),
    "README active unit differs from Plan 033 control",
  );
  invariant(
    field("Checkpoint") ===
      (active ? `${quote}${active.checkpoint_sha}${quote}` : "none"),
    "README checkpoint differs from Plan 033 control",
  );
  invariant(
    field("Status") === (active ? `IN PROGRESS — Unit ${active.unit}` : "DONE"),
    "README status differs from Plan 033 control",
  );
  invariant(
    field("Current control") === `${quote}${controlPath}${quote}`,
    "README current control differs from Plan 033 control",
  );
}
export function validatePlanStatus(source, control) {
  const active = control.active_dispatch;
  const expected = active
    ? `- Status: IN PROGRESS — Unit ${active.unit} at ${quote}${active.checkpoint_sha}${quote}`
    : "- Status: DONE";
  const statuses = source
    .split(/\r?\n/u)
    .filter((line) => line.startsWith("- Status: "));
  invariant(
    statuses.length === 1 && statuses[0] === expected,
    "Plan 033 status differs from control",
  );
}
export function validateTerminal032(root, completion) {
  const plan = readFileSync(path.join(root, terminalPlanPath));
  const control = JSON.parse(
    readFileSync(path.join(root, terminalControlPath), "utf8"),
  );
  invariant(
    control.contract === "salt-ai-plan-032-control/1" &&
      control.plan_id === "032",
    "Terminal Plan 032 identity mismatch",
  );
  invariant(
    planDigest(plan) === control.plan_sha256,
    "Terminal Plan 032 hash mismatch",
  );
  invariant(
    control.active_dispatch === null &&
      Array.isArray(control.units) &&
      control.units?.length === 4 &&
      control.units.every(
        (unit, index) =>
          unit.id === `032/0${index + 1}` && unit.status === "DONE",
      ),
    "Plan 032 is not terminal",
  );
  invariant(
    control.units[3].id === "032/04" &&
      control.units[3].completion_sha === completion,
    "Plan 032 completion differs from Plan 033 predecessor",
  );
}
function git(root, args) {
  return String(
    execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "pipe" }),
  ).trim();
}
function commit(root, value, label) {
  invariant(sha.test(value), `${label} is invalid`);
  let resolved;
  try {
    resolved = git(root, ["rev-parse", "--verify", `${value}^{commit}`]);
  } catch {
    throw new Error(`${label} does not name a commit`);
  }
  invariant(resolved === value, `${label} does not name a commit`);
}
function ancestor(root, earlier, later, label) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", earlier, later], {
      cwd: root,
      stdio: "pipe",
    });
  } catch {
    throw new Error(`${label} is not an ancestor`);
  }
}
export function validateRepository({ root = repositoryRoot } = {}) {
  const head = git(root, ["rev-parse", "--verify", "HEAD^{commit}"]);
  const control = validateControlObject(
    JSON.parse(readFileSync(path.join(root, controlPath), "utf8")),
    planDigest(readFileSync(path.join(root, planPath))),
  );
  validateReadme(readFileSync(path.join(root, readmePath), "utf8"), control);
  validatePlanStatus(readFileSync(path.join(root, planPath), "utf8"), control);
  validateTerminal032(root, control.predecessor.completion_sha);
  invariant(
    JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).scripts?.[
      "validate:salt-ai:plan-033"
    ] === "node ./scripts/validateSaltAiPlan033.mjs",
    "Plan 033 package command differs",
  );
  commit(
    root,
    control.predecessor.completion_sha,
    "Plan 033 predecessor completion",
  );
  ancestor(
    root,
    control.predecessor.completion_sha,
    head,
    "Plan 033 predecessor completion",
  );
  let previous = control.predecessor.completion_sha;
  for (const unit of control.units) {
    if (unit.status === "TODO") continue;
    commit(root, unit.checkpoint_sha, `${unit.id} checkpoint`);
    ancestor(root, previous, unit.checkpoint_sha, `${unit.id} checkpoint`);
    ancestor(root, unit.checkpoint_sha, head, `${unit.id} checkpoint`);
    if (unit.status === "DONE") {
      commit(root, unit.completion_sha, `${unit.id} completion`);
      ancestor(
        root,
        unit.checkpoint_sha,
        unit.completion_sha,
        `${unit.id} completion`,
      );
      ancestor(root, unit.completion_sha, head, `${unit.id} completion`);
      previous = unit.completion_sha;
    }
  }
  return control;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  try {
    invariant(
      process.argv.length === 2,
      "Plan 033 validator takes no arguments",
    );
    validateRepository();
    process.stdout.write("Plan 033 validated.\n");
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
