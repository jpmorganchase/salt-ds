import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  deriveRulesDecision,
  RulesHarnessError,
  RulesIntegrityError,
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
      "Usage: node ./evals/salt-ai/doctor/run.mjs --mode decide-rules\n",
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
