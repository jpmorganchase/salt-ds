import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import {
  collectDoctorObservation,
  deriveDoctorDecision,
  deriveRulesDecision,
  RulesHarnessError,
  RulesIntegrityError,
  runDoctorObservation,
} from "./run.mjs";

const RUNNER = fileURLToPath(new URL("./run.mjs", import.meta.url));

function run(...args) {
  return spawnSync(process.execPath, [RUNNER, ...args], {
    cwd: path.resolve(import.meta.dirname, "../../.."),
    encoding: "utf8",
  });
}

function passingObservation(overrides = {}) {
  return {
    renderer_safe: true,
    rule_ids_equal: true,
    enabled_rule_count: 5,
    trustworthy_product_miss_count: 0,
    actionable_repair_families: [
      "interaction_semantics",
      "symbol_migration",
      "prop_migration",
    ],
    harness_failures: [],
    ...overrides,
  };
}

describe("Salt AI doctor rule decision runner", () => {
  it("emits the exact PASS_RULES decision for current built Knowledge", () => {
    const result = run("--mode", "decide-rules");
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe(
      '{"contract":"salt-ai-plan-005-decision/1","unit":"005/00","result":"PASS_RULES"}\n',
    );
  });

  it("rejects every invocation outside the one closed mode", () => {
    const result = run("--mode", "other");
    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe(
      "Usage: node ./evals/salt-ai/doctor/run.mjs --mode decide-rules|decide-source\n",
    );
  });

  it("derives PASS_RULES only with two distinct clean repair families", () => {
    expect(deriveRulesDecision(passingObservation())).toBe("PASS_RULES");
    expect(
      deriveRulesDecision(
        passingObservation({
          actionable_repair_families: ["symbol_migration"],
        }),
      ),
    ).toBe("CUT_DOCTOR");
  });

  it("cuts a trustworthy product miss", () => {
    expect(
      deriveRulesDecision(
        passingObservation({ trustworthy_product_miss_count: 1 }),
      ),
    ).toBe("CUT_DOCTOR");
  });

  it.each([
    { renderer_safe: false },
    { harness_failures: ["corrupt coverage"] },
  ])("fails closed on harness failure %#", (override) => {
    expect(() => deriveRulesDecision(passingObservation(override))).toThrow(
      RulesHarnessError,
    );
  });

  it("classifies registry identity mismatch as evidence-integrity failure", () => {
    expect(() =>
      deriveRulesDecision(passingObservation({ rule_ids_equal: false })),
    ).toThrow(RulesIntegrityError);
  });
});

function captureIo() {
  let stdout = "";
  let stderr = "";
  return {
    io: {
      stdout: { write: (value) => (stdout += value) },
      stderr: { write: (value) => (stderr += value) },
    },
    stdout: () => stdout,
    stderr: () => stderr,
  };
}

describe("Salt AI Doctor source decision runner", () => {
  let passing;

  beforeAll(async () => {
    passing = await collectDoctorObservation();
  }, 30_000);

  it("derives PASS_DOCTOR from exactly six trustworthy physical fixtures", () => {
    expect(deriveDoctorDecision(passing)).toBe("PASS_DOCTOR");
    expect(passing).toMatchObject({
      contract: "salt-ai-doctor-source-observation/1",
      physical_fixture_count: 6,
      worker_artifact_present: true,
    });
    expect(passing.fixtures.map((fixture) => fixture.id)).toEqual([
      "repair-family-a-workspace",
      "repair-family-b",
      "clean-exact-current-hostile-text",
      "non-salt-control",
      "exact-version-mismatch",
      "incomplete-analysis",
    ]);
    expect(
      passing.fixtures.find(
        (fixture) => fixture.id === "repair-family-a-workspace",
      ),
    ).toMatchObject({
      invocation_root: ".",
      exit_code: 1,
      read_only: true,
      worker_backed: true,
      result: {
        status: "complete",
        reason_code: "SALT_PROJECT_SELECTED",
        findings: [
          {
            workspace_unit_id: "packages/app",
            rule_id: "salt.component.action_navigation_target",
            location: { path: "packages/app/src/App.tsx" },
          },
        ],
      },
      repair: {
        changed: true,
        source_matches_manifest: true,
        read_only: true,
        after_exit_code: 0,
        after_result: { status: "complete", findings: [] },
      },
    });
  });

  it("emits the exact PASS_DOCTOR decision line", () => {
    const capture = captureIo();
    expect(runDoctorObservation(passing, capture.io)).toBe(0);
    expect(capture.stderr()).toBe("");
    expect(capture.stdout()).toBe(
      '{"contract":"salt-ai-plan-005-decision/1","unit":"005/01","result":"PASS_DOCTOR"}\n',
    );
  });

  const mutations = [
    [
      "command evaluation skipped",
      (value) => {
        value.fixtures[0].command_executed = false;
      },
    ],
    [
      "worker evaluation skipped",
      (value) => {
        value.fixtures[0].worker_backed = false;
      },
    ],
    [
      "zero coverage",
      (value) => {
        value.fixtures[0].result.coverage.evaluated_files = 0;
        value.fixtures[0].result.coverage.evaluated_rule_ids = [];
      },
    ],
    [
      "missing finding",
      (value) => {
        value.fixtures[0].result.findings = [];
      },
    ],
    [
      "extra finding",
      (value) => {
        value.fixtures[0].result.findings.push(
          structuredClone(value.fixtures[0].result.findings[0]),
        );
      },
    ],
    [
      "wrong status",
      (value) => {
        value.fixtures[0].result.status = "not_salt";
      },
    ],
    [
      "wrong reason",
      (value) => {
        value.fixtures[0].result.reason_code = "EXACT_VERSION_REQUIRED";
      },
    ],
    [
      "wrong finding ID",
      (value) => {
        value.fixtures[0].result.findings[0].id = "sha256:" + "0".repeat(64);
      },
    ],
    [
      "wrong finding path",
      (value) => {
        value.fixtures[0].result.findings[0].location.path = "src/wrong.tsx";
      },
    ],
    [
      "wrong exit",
      (value) => {
        value.fixtures[0].exit_code = 0;
      },
    ],
    [
      "workspace child invoked directly",
      (value) => {
        value.fixtures[0].invocation_root = "packages/app";
      },
    ],
    [
      "non-Salt root overrides selected child",
      (value) => {
        value.fixtures[0].result.status = "not_salt";
        value.fixtures[0].result.reason_code = "SALT_PROJECT_NO_SALT_PACKAGES";
      },
    ],
    [
      "inverted repair",
      (value) => {
        value.fixtures[0].repair.after_result.findings = structuredClone(
          value.fixtures[0].result.findings,
        );
      },
    ],
    [
      "repair mutation did not apply",
      (value) => {
        value.fixtures[0].repair.source_matches_manifest = false;
      },
    ],
    [
      "repository was modified by Doctor",
      (value) => {
        value.fixtures[2].read_only = false;
      },
    ],
    [
      "worker artifact missing",
      (value) => {
        value.worker_artifact_present = false;
      },
    ],
    [
      "malformed child output",
      (value) => {
        value.fixtures[0].json_valid = false;
      },
    ],
    [
      "public contract mutated",
      (value) => {
        value.fixtures[0].result.contract = "salt-scan-result/1";
      },
    ],
  ];

  it.each(mutations)("returns nonzero when %s", (_name, mutate) => {
    const observation = structuredClone(passing);
    mutate(observation);
    const capture = captureIo();
    expect(runDoctorObservation(observation, capture.io)).not.toBe(0);
    expect(capture.stdout()).toBe("");
    expect(capture.stderr()).toMatch(
      /^salt-ai doctor source harness failure:/u,
    );
  });

  it.each([
    [
      "applicable finding is inaccurate",
      (value) => {
        value.fixtures[0].result.findings = [];
        value.fixtures[0].product_assessment = "finding_inaccurate";
      },
    ],
    [
      "golden repair does not pass",
      (value) => {
        value.fixtures[0].repair.after_result.findings = structuredClone(
          value.fixtures[0].result.findings,
        );
        value.fixtures[0].product_assessment = "repair_failed";
      },
    ],
  ])("returns registered CUT_DOCTOR with exit zero when %s", (_name, cut) => {
    const observation = structuredClone(passing);
    cut(observation);
    const capture = captureIo();
    expect(runDoctorObservation(observation, capture.io)).toBe(0);
    expect(capture.stderr()).toBe("");
    expect(capture.stdout()).toBe(
      '{"contract":"salt-ai-plan-005-decision/1","unit":"005/01","result":"CUT_DOCTOR"}\n',
    );
  });
});
