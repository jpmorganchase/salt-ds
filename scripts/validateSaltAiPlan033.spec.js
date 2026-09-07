import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  planDigest,
  validateControlObject,
  validatePlanStatus,
  validateReadme,
  validateRepository,
} from "./validateSaltAiPlan033.mjs";

const roots = [];
const plan = "# Plan 033\n";
const command = "node ./scripts/validateSaltAiPlan033.mjs";
function controlAt(checkpoint = "a".repeat(40)) {
  return {
    contract: "salt-ai-plan-033-control/1",
    plan_id: "033",
    plan_sha256: planDigest(Buffer.from(plan)),
    predecessor: { plan_id: "032", completion_sha: checkpoint },
    active_dispatch: { unit: "033/01", checkpoint_sha: checkpoint },
    units: [
      {
        id: "033/01",
        status: "IN_PROGRESS",
        checkpoint_sha: checkpoint,
        completion_sha: null,
      },
      {
        id: "033/02",
        status: "TODO",
        checkpoint_sha: null,
        completion_sha: null,
      },
      {
        id: "033/02a",
        status: "TODO",
        checkpoint_sha: null,
        completion_sha: null,
      },
    ],
  };
}
function readme(control) {
  const active = control.active_dispatch;
  return [
    `- **Active plan/unit:** ${active ? `Plan 033 / Unit \`${active.unit}\`` : "none"}`,
    `- **Checkpoint:** ${active ? `\`${active.checkpoint_sha}\`` : "none"}`,
    `- **Status:** ${active ? `IN PROGRESS — Unit ${active.unit}` : "DONE"}`,
    "- **Current control:** `plans/evidence/033/control.json`",
  ].join("\n");
}
function run(root, args) {
  return String(
    execFileSync("git", args, {
      cwd: root,
      env: Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => !key.toUpperCase().startsWith("GIT_"),
        ),
      ),
      encoding: "utf8",
      stdio: "pipe",
    }),
  ).trim();
}
function write(root, file, value) {
  const target = path.join(root, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, value);
}
function save(root, control, packageCommand = command) {
  const active = control.active_dispatch;
  const planSource = `${plan}- Status: ${active ? `IN PROGRESS — Unit ${active.unit} at \`${active.checkpoint_sha}\`` : "DONE"}\n`;
  control.plan_sha256 = planDigest(Buffer.from(planSource));
  write(root, "plans/033-deliver-verified-salt-workflows.md", planSource);
  write(root, "plans/evidence/033/control.json", JSON.stringify(control));
  const terminalPlan = "# Plan 032 terminal\n";
  write(root, "plans/032-fix-the-real-consumer-entry-path.md", terminalPlan);
  write(
    root,
    "plans/evidence/032/control.json",
    JSON.stringify({
      contract: "salt-ai-plan-032-control/1",
      plan_id: "032",
      plan_sha256: planDigest(Buffer.from(terminalPlan)),
      active_dispatch: null,
      units: ["032/01", "032/02", "032/03", "032/04"].map((id) => ({
        id,
        status: "DONE",
        completion_sha: control.predecessor.completion_sha,
      })),
    }),
  );
  write(root, "plans/README.md", readme(control));
  write(
    root,
    "package.json",
    JSON.stringify({
      scripts: { "validate:salt-ai:plan-033": packageCommand },
    }),
  );
}
function record(root, text) {
  write(root, "seed", text);
  run(root, ["add", "."]);
  run(root, ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", text]);
  return run(root, ["rev-parse", "HEAD"]);
}
function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "salt-033-"));
  roots.push(root);
  run(root, ["init", "--quiet"]);
  run(root, ["config", "user.email", "test@example.invalid"]);
  run(root, ["config", "user.name", "test"]);
  const control = controlAt(record(root, "seed"));
  save(root, control);
  return { root, control };
}
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("Plan 033 current-state control", () => {
  it("accepts current control and line-ending-independent plan identity", () => {
    const control = controlAt();
    expect(
      validateControlObject(control, planDigest(Buffer.from("# Plan 033\r\n"))),
    ).toBe(control);
    expect(() => validateReadme(readme(control), control)).not.toThrow();
    expect(() => validateControlObject(control, "0".repeat(64))).toThrow(
      /hash/u,
    );
  });
  it.each([
    [
      "unknown fields",
      (c) => {
        c.reviewed = true;
      },
    ],
    [
      "wrong identity",
      (c) => {
        c.plan_id = "032";
      },
    ],
    [
      "missing active checkpoint",
      (c) => {
        c.units[0].checkpoint_sha = null;
      },
    ],
    [
      "two active units",
      (c) => {
        c.units[1] = { ...c.units[0], id: "033/02" };
      },
    ],
    [
      "out-of-order completion",
      (c) => {
        c.units[2].status = "DONE";
        c.units[2].checkpoint_sha = "a".repeat(40);
        c.units[2].completion_sha = "b".repeat(40);
      },
    ],
    [
      "invented status",
      (c) => {
        c.units[0].status = "APPROVED";
      },
    ],
    [
      "disagreeing dispatch",
      (c) => {
        c.active_dispatch.unit = "033/02";
      },
    ],
  ])("rejects %s", (_label, mutate) => {
    const control = controlAt();
    mutate(control);
    expect(() => validateControlObject(control, control.plan_sha256)).toThrow();
  });
  it.each([
    ["Plan 033 / Unit `033/01`", "Plan 033 / Unit `033/02`"],
    ["`" + "a".repeat(40) + "`", "`" + "b".repeat(40) + "`"],
    ["IN PROGRESS — Unit 033/01", "DONE"],
    ["plans/evidence/033/control.json", "plans/evidence/032/control.json"],
  ])("rejects stale README field %s", (before, after) => {
    const control = controlAt();
    expect(() =>
      validateReadme(readme(control).replace(before, after), control),
    ).toThrow(/README/u);
  });
  it("rejects contradictory dispatch text even after its digest is recomputed", () => {
    const { root, control } = fixture();
    const current = readFileSync(
      path.join(root, "plans/033-deliver-verified-salt-workflows.md"),
      "utf8",
    );
    for (const source of [
      current.replace("033/01", "033/02"),
      current.replace(control.active_dispatch.checkpoint_sha, "f".repeat(40)),
      "# Plan 033\n- Status: DONE\n",
      `${current}- Status: DONE\n`,
      current.replace(/\n$/u, ". Unit 033/01 is TODO.\n"),
    ]) {
      write(root, "plans/033-deliver-verified-salt-workflows.md", source);
      control.plan_sha256 = planDigest(Buffer.from(source));
      write(root, "plans/evidence/033/control.json", JSON.stringify(control));
      expect(() => validateRepository({ root })).toThrow(/status/u);
    }
    expect(() =>
      validatePlanStatus("- Status: DONEISH\n", { active_dispatch: null }),
    ).toThrow(/status/u);
  });
  it("rejects a changed predecessor digest, identity, completion or terminal state", () => {
    const { root, control } = fixture();
    const terminal = "plans/evidence/032/control.json";
    const saved = JSON.parse(readFileSync(path.join(root, terminal), "utf8"));
    for (const [mutate, error] of [
      [
        (c) => {
          c.plan_sha256 = "f".repeat(64);
        },
        /hash/u,
      ],
      [
        (c) => {
          c.plan_id = "031";
        },
        /identity/u,
      ],
      [
        (c) => {
          c.units[3].completion_sha = "f".repeat(40);
        },
        /completion/u,
      ],
      [
        (c) => {
          c.active_dispatch = { unit: "032/04" };
        },
        /terminal/u,
      ],
      [
        (c) => {
          c.units[2].status = "TODO";
        },
        /terminal/u,
      ],
      [
        (c) => {
          c.units[1].id = "032/01";
        },
        /terminal/u,
      ],
    ]) {
      const changed = structuredClone(saved);
      mutate(changed);
      write(root, terminal, JSON.stringify(changed));
      expect(() => validateRepository({ root })).toThrow(error);
    }
  });
  it("accepts ordinary commits, reviewed plan edits and actual ordered completion", () => {
    const { root, control } = fixture();
    expect(() => validateRepository({ root })).not.toThrow();
    record(root, "ordinary implementation one");
    record(root, "ordinary implementation two");
    for (const [index, unit] of control.units.entries()) {
      unit.status = "DONE";
      unit.completion_sha = record(root, `complete ${unit.id}`);
      const next = control.units[index + 1];
      if (next) {
        next.status = "IN_PROGRESS";
        next.checkpoint_sha = unit.completion_sha;
        control.active_dispatch = {
          unit: next.id,
          checkpoint_sha: next.checkpoint_sha,
        };
      } else control.active_dispatch = null;
      save(root, control);
      expect(() => validateRepository({ root })).not.toThrow();
    }
    const revised = "# Plan 033\n- Status: DONE\nReviewed clarification.\n";
    write(root, "plans/033-deliver-verified-salt-workflows.md", revised);
    control.plan_sha256 = planDigest(Buffer.from(revised));
    write(root, "plans/evidence/033/control.json", JSON.stringify(control));
    expect(() => validateRepository({ root })).not.toThrow();
  }, 15000);
  it("rejects nonexistent commits, non-ancestor checkpoints and a stale package command", () => {
    const { root, control } = fixture();
    const original = structuredClone(control);
    control.units[0].checkpoint_sha = "f".repeat(40);
    control.active_dispatch.checkpoint_sha = "f".repeat(40);
    save(root, control);
    expect(() => validateRepository({ root })).toThrow(
      /does not name a commit/u,
    );
    const originalHead = run(root, ["rev-parse", "HEAD"]);
    run(root, ["checkout", "--quiet", "-b", "unrelated"]);
    const future = record(root, "not in checked-out ancestry");
    run(root, ["checkout", "--quiet", "--detach", originalHead]);
    control.units[0].checkpoint_sha = future;
    control.active_dispatch.checkpoint_sha = future;
    save(root, control);
    expect(() => validateRepository({ root })).toThrow(/not an ancestor/u);
    save(root, original, "node ./scripts/obsolete.mjs");
    expect(() => validateRepository({ root })).toThrow(/package command/u);
  });
});
