import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  planDigest,
  validateControlObject,
  validateReadme,
  validateRepository,
} from "./validateSaltAiPlan032.mjs";

const quote = String.fromCharCode(96);
const fixtures = [];

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function run(root, args) {
  return String(
    execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "pipe" }),
  ).trim();
}

function write(root, locator, value) {
  const target = path.join(root, locator);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, value, { encoding: "utf8" });
}

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "salt-plan-032-"));
  fixtures.push(root);
  run(root, ["init", "--quiet"]);
  run(root, ["config", "user.email", "test@example.invalid"]);
  run(root, ["config", "user.name", "Plan 032 test"]);
  run(root, ["config", "commit.gpgsign", "false"]);
  for (const [locator, value] of Object.entries({
    "history/predecessor.txt": "frozen predecessor\n",
    "plans/README.md": "placeholder\n",
    "plans/032-fix-the-real-consumer-entry-path.md": "placeholder\n",
    "plans/evidence/032/control.json": "{}\n",
    "package.json": "{}\n",
  }))
    write(root, locator, value);
  run(root, ["add", "."]);
  run(root, ["commit", "--quiet", "-m", "baseline"]);
  const baseline = run(root, ["rev-parse", "HEAD"]);
  const predecessor = {
    plan_id: "006",
    unit: "006/00",
    disposition: "SUPERSEDED_UNFINISHED",
    snapshot_sha: baseline,
    plan_sha256: "1".repeat(64),
    control_sha256: "2".repeat(64),
  };
  const plan = "# Current consumer plan\n";
  const control = {
    contract: "salt-ai-plan-032-control/1",
    plan_id: "032",
    plan_sha256: planDigest(Buffer.from(plan)),
    predecessor,
    active_dispatch: { unit: "032/01", checkpoint_sha: baseline },
    units: ["032/01", "032/02", "032/03", "032/04"].map((id, index) => ({
      id,
      status: index === 0 ? "IN_PROGRESS" : "TODO",
      checkpoint_sha: index === 0 ? baseline : null,
      completion_sha: null,
    })),
  };
  write(root, "plans/032-fix-the-real-consumer-entry-path.md", plan);
  write(
    root,
    "plans/evidence/032/control.json",
    `${JSON.stringify(control)}\n`,
  );
  write(
    root,
    "plans/README.md",
    [
      "## Active dispatch",
      `- **Active plan/unit:** Plan 032 / Unit ${quote}032/01${quote}`,
      `- **Checkpoint:** ${quote}${baseline}${quote}`,
      "- **Status:** IN PROGRESS — Unit 032/01",
      `- **Current control:** ${quote}plans/evidence/032/control.json${quote}`,
    ].join("\n"),
  );
  write(
    root,
    "package.json",
    JSON.stringify({
      scripts: {
        "validate:salt-ai:plan-032": "node ./scripts/validateSaltAiPlan032.mjs",
      },
    }),
  );
  return {
    root,
    baseline,
    control,
    options: {
      root,
      baselineSha: baseline,
      predecessorState: predecessor,
      preservedPaths: ["history"],
      preservedDigests: {
        "history/predecessor.txt": digest("frozen predecessor\n"),
      },
    },
  };
}

function saveControl(state) {
  write(
    state.root,
    "plans/evidence/032/control.json",
    `${JSON.stringify(state.control)}\n`,
  );
}

function commit(root, message) {
  write(root, "scratch.txt", `${message}\n`);
  run(root, ["add", "."]);
  run(root, ["commit", "--quiet", "-m", message]);
  return run(root, ["rev-parse", "HEAD"]);
}

function saveActiveReadme(root, unit, checkpoint) {
  write(
    root,
    "plans/README.md",
    [
      "## Active dispatch",
      `- **Active plan/unit:** Plan 032 / Unit ${quote}${unit}${quote}`,
      `- **Checkpoint:** ${quote}${checkpoint}${quote}`,
      `- **Status:** IN PROGRESS — Unit ${unit}`,
      `- **Current control:** ${quote}plans/evidence/032/control.json${quote}`,
    ].join("\n"),
  );
}

afterEach(() => {
  for (const root of fixtures.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("Plan 032 current-state control", () => {
  it("uses strict UTF-8 and normalizes newline conventions for the plan digest", () => {
    expect(planDigest(Buffer.from("first\r\nsecond\rthird"))).toBe(
      planDigest(Buffer.from("first\nsecond\nthird")),
    );
    expect(() => planDigest(Buffer.from([0xff]))).toThrow();
  });

  it("rejects malformed controls and out-of-order unit states", () => {
    const state = fixture();
    const malformed = structuredClone(state.control);
    malformed.authorization = "PASS";
    expect(() =>
      validateControlObject(malformed, malformed.plan_sha256, {
        baselineSha: state.baseline,
        predecessorState: state.control.predecessor,
      }),
    ).toThrow(/fields/u);

    const unordered = structuredClone(state.control);
    unordered.units[1] = {
      id: "032/02",
      status: "DONE",
      checkpoint_sha: state.baseline,
      completion_sha: "a".repeat(40),
    };
    expect(() =>
      validateControlObject(unordered, unordered.plan_sha256, {
        baselineSha: state.baseline,
        predecessorState: state.control.predecessor,
      }),
    ).toThrow(/prefix|checkpoint/u);

    const leadingTodo = structuredClone(state.control);
    leadingTodo.units[0] = {
      id: "032/01",
      status: "TODO",
      checkpoint_sha: null,
      completion_sha: null,
    };
    leadingTodo.units[1] = {
      id: "032/02",
      status: "IN_PROGRESS",
      checkpoint_sha: state.baseline,
      completion_sha: null,
    };
    leadingTodo.active_dispatch = {
      unit: "032/02",
      checkpoint_sha: state.baseline,
    };
    expect(() =>
      validateControlObject(leadingTodo, leadingTodo.plan_sha256, {
        predecessorState: state.control.predecessor,
      }),
    ).toThrow(/active unit/u);
  });

  it("requires the README active dispatch to agree with control", () => {
    const state = fixture();
    expect(() =>
      validateReadme(
        [
          "- **Active plan/unit:** none",
          "- **Checkpoint:** none",
          "- **Status:** DONE",
          `- **Current control:** ${quote}plans/evidence/032/control.json${quote}`,
        ].join("\n"),
        state.control,
      ),
    ).toThrow(/active unit/u);
  });

  it("rejects a README status naming a different unit", () => {
    const state = fixture();
    expect(() =>
      validateReadme(
        [
          `- **Active plan/unit:** Plan 032 / Unit ${quote}032/01${quote}`,
          `- **Checkpoint:** ${quote}${state.baseline}${quote}`,
          "- **Status:** IN PROGRESS — Unit 032/02",
          `- **Current control:** ${quote}plans/evidence/032/control.json${quote}`,
        ].join("\n"),
        state.control,
      ),
    ).toThrow(/status differs/u);
  });

  it("accepts a revised unfinished plan when its matching digest is recorded", () => {
    const state = fixture();
    const revised = "# Revised consumer plan\n\nOrdinary reviewed detail.\n";
    state.control.plan_sha256 = planDigest(Buffer.from(revised));
    write(state.root, "plans/032-fix-the-real-consumer-entry-path.md", revised);
    saveControl(state);
    expect(() => validateRepository(state.options)).not.toThrow();
  });

  it("accepts real checkpoints later than their predecessor completion", () => {
    const state = fixture();
    const start = commit(state.root, "record unit start");
    const completion = commit(state.root, "implement unit");
    const nextCheckpoint = commit(state.root, "record next dispatch");
    state.control.units[0] = {
      id: "032/01",
      status: "DONE",
      checkpoint_sha: start,
      completion_sha: completion,
    };
    state.control.units[1] = {
      id: "032/02",
      status: "IN_PROGRESS",
      checkpoint_sha: nextCheckpoint,
      completion_sha: null,
    };
    state.control.active_dispatch = {
      unit: "032/02",
      checkpoint_sha: nextCheckpoint,
    };
    saveControl(state);
    write(
      state.root,
      "plans/README.md",
      [
        "## Active dispatch",
        `- **Active plan/unit:** Plan 032 / Unit ${quote}032/02${quote}`,
        `- **Checkpoint:** ${quote}${nextCheckpoint}${quote}`,
        "- **Status:** IN PROGRESS — Unit 032/02",
        `- **Current control:** ${quote}plans/evidence/032/control.json${quote}`,
      ].join("\n"),
    );
    expect(() => validateRepository(state.options)).not.toThrow();
  });

  it("rejects nonexistent and nonancestor commit references", () => {
    const missing = fixture();
    missing.control.units[0].checkpoint_sha = "f".repeat(40);
    missing.control.active_dispatch.checkpoint_sha = "f".repeat(40);
    saveControl(missing);
    saveActiveReadme(missing.root, "032/01", "f".repeat(40));
    expect(() => validateRepository(missing.options)).toThrow(
      /does not name a commit/u,
    );

    const unrelated = fixture();
    const tree = run(unrelated.root, ["write-tree"]);
    const orphan = run(unrelated.root, ["commit-tree", tree, "-m", "orphan"]);
    unrelated.control.units[0].checkpoint_sha = orphan;
    unrelated.control.active_dispatch.checkpoint_sha = orphan;
    saveControl(unrelated);
    saveActiveReadme(unrelated.root, "032/01", orphan);
    expect(() => validateRepository(unrelated.options)).toThrow(
      /not an ancestor/u,
    );
  });

  it("rejects predecessor evidence changed after baseline", () => {
    const committed = fixture();
    write(committed.root, "history/predecessor.txt", "rewritten\n");
    run(committed.root, ["add", "history/predecessor.txt"]);
    run(committed.root, ["commit", "--quiet", "-m", "rewrite history"]);
    expect(() => validateRepository(committed.options)).toThrow(
      /historical source changed/u,
    );
  });

  it("rejects predecessor evidence changed in the working tree", () => {
    const worktree = fixture();
    write(worktree.root, "history/predecessor.txt", "rewritten\n");
    expect(() => validateRepository(worktree.options)).toThrow(/working tree/u);
  });
});
