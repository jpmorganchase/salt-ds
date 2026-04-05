import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  buildWorkflowEvalJsonReport,
  CLI_LOCAL_EVAL_RUNNER,
  judgeWorkflowEvalScenario,
  MCP_LOCAL_EVAL_RUNNER,
  runWorkflowEvalScenario,
  runWorkflowEvalScenarios,
  type WorkflowEvalScenario,
  type WorkflowEvalTrace,
} from "../evals/workflowEvalHarness.js";
import {
  buildDefaultWorkflowEvalScenarios,
  filterWorkflowEvalScenarios,
} from "../evals/workflowEvalScenarios.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const BUILT_AT = "2026-04-04T00:00:00Z";

let registryDir: string;
let scenarios: WorkflowEvalScenario[] = [];

beforeAll(async () => {
  registryDir = await fs.mkdtemp(path.join(os.tmpdir(), "salt-live-evals-"));
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: registryDir,
    timestamp: BUILT_AT,
  });

  scenarios = buildDefaultWorkflowEvalScenarios({
    fixture_base_dir: path.join(REPO_ROOT, "packages", "mcp", "eval-fixtures"),
  });
}, 180000);

afterAll(async () => {
  if (registryDir) {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
});

describe("live eval harness", () => {
  it("runs the default scenario pack through the real MCP-local runner", async () => {
    for (const scenario of filterWorkflowEvalScenarios(scenarios, {
      include_tags: ["default"],
      exclude_tags: ["planned", "transport", "blocked"],
    })) {
      const trace = await MCP_LOCAL_EVAL_RUNNER.run(scenario, {
        registry_dir: registryDir,
        repo_root: REPO_ROOT,
      });
      expect(judgeWorkflowEvalScenario(scenario, trace), scenario.id).toEqual({
        status: "passed",
        reasons: [
          `Runner ${MCP_LOCAL_EVAL_RUNNER.id} satisfied the deterministic workflow rubric for ${scenario.id}.`,
        ],
      });
    }
  }, 240000);

  it("runs the default scenario pack through the real CLI-local runner", async () => {
    for (const scenario of filterWorkflowEvalScenarios(scenarios, {
      include_tags: ["default"],
      exclude_tags: ["planned", "transport", "blocked"],
    })) {
      const trace = await CLI_LOCAL_EVAL_RUNNER.run(scenario, {
        registry_dir: registryDir,
        repo_root: REPO_ROOT,
      });
      expect(judgeWorkflowEvalScenario(scenario, trace), scenario.id).toEqual({
        status: "passed",
        reasons: [
          `Runner ${CLI_LOCAL_EVAL_RUNNER.id} satisfied the deterministic workflow rubric for ${scenario.id}.`,
        ],
      });
    }
  }, 240000);

  it("falls back to CLI when MCP transport is unavailable", async () => {
    const scenario = scenarios.find(
      (entry) => entry.id === "existing-salt-review-mcp-blocked-cli-fallback",
    );
    if (!scenario) {
      throw new Error("Expected the MCP-blocked fallback scenario.");
    }

    const trace = await runWorkflowEvalScenario(scenario, {
      enabled_transports: ["cli"],
      context: {
        registry_dir: registryDir,
        repo_root: REPO_ROOT,
      },
    });

    expect(trace.transport_trace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          transport: "mcp",
          status: "unavailable",
        }),
        expect.objectContaining({
          transport: "cli",
          status: "succeeded",
        }),
      ]),
    );
    expect(judgeWorkflowEvalScenario(scenario, trace)).toEqual({
      status: "passed",
      reasons: [
        `Runner ${trace.runner_id} satisfied the deterministic workflow rubric for ${scenario.id}.`,
      ],
    });
  }, 180000);

  it("stops cleanly when both transports are unavailable", async () => {
    const scenario = scenarios.find(
      (entry) => entry.id === "existing-salt-review-all-transports-blocked",
    );
    if (!scenario) {
      throw new Error("Expected the all-transports-blocked scenario.");
    }

    const trace = await runWorkflowEvalScenario(scenario, {
      enabled_transports: [],
      context: {
        registry_dir: registryDir,
        repo_root: REPO_ROOT,
      },
    });

    expect(trace.status).toBe("failed");
    expect(trace.workflow_result).toBeNull();
    expect(judgeWorkflowEvalScenario(scenario, trace)).toEqual({
      status: "passed",
      reasons: [
        `Runner ${trace.runner_id} stopped cleanly when all transports were unavailable for ${scenario.id}.`,
      ],
    });
  }, 120000);

  it("reports the eval suite in machine-readable JSON", async () => {
    const report = await runWorkflowEvalScenarios(
      filterWorkflowEvalScenarios(scenarios, {
        scenario_ids: [
          "existing-salt-review-toolbar",
          "existing-salt-upgrade-core",
        ],
      }),
      {
        runners: [CLI_LOCAL_EVAL_RUNNER],
        enabled_transports: ["cli"],
        context: {
          registry_dir: registryDir,
          repo_root: REPO_ROOT,
        },
      },
    );

    const parsed = JSON.parse(buildWorkflowEvalJsonReport(report)) as {
      passed: boolean;
      entries: Array<{ scenario_id: string; judgment: { status: string } }>;
    };
    expect(parsed.passed).toBe(true);
    expect(parsed.entries).toHaveLength(2);
    expect(parsed.entries[0]?.judgment.status).toBe("passed");
  }, 180000);

  it("fails when a workflow trace drops the summary-first contract", async () => {
    const [scenario] = filterWorkflowEvalScenarios(scenarios, {
      scenario_ids: ["existing-salt-review-toolbar"],
    });
    if (!scenario) {
      throw new Error("Expected at least one workflow eval scenario.");
    }

    const trace = (await MCP_LOCAL_EVAL_RUNNER.run(scenario, {
      registry_dir: registryDir,
      repo_root: REPO_ROOT,
    })) as WorkflowEvalTrace & {
      workflow_result: {
        result: Record<string, unknown>;
      };
    };
    delete trace.workflow_result.result.ide_summary;

    expect(judgeWorkflowEvalScenario(scenario, trace)).toEqual(
      expect.objectContaining({
        status: "failed",
        reasons: expect.arrayContaining([
          expect.stringContaining("result.ide_summary"),
        ]),
      }),
    );
  }, 180000);
});
