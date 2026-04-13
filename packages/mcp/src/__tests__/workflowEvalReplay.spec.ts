import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runCli } from "../evals/runWorkflowEvalReplay.js";
import {
  buildWorkflowEvalReplayJsonReport,
  loadWorkflowEvalReplayFixture,
  replayWorkflowEvalFixture,
  runWorkflowEvalReplayReport,
} from "../evals/workflowEvalReplay.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const REPLAY_FIXTURE_PATH = path.join(
  REPO_ROOT,
  "packages",
  "mcp",
  "eval-fixtures",
  "replays",
  "existing-salt-review-toolbar-missing-summary.json",
);

const REPLAY_FIXTURE_PATHS = [
  REPLAY_FIXTURE_PATH,
  path.join(
    REPO_ROOT,
    "packages",
    "mcp",
    "eval-fixtures",
    "replays",
    "existing-salt-create-metric-exact-compact.json",
  ),
  path.join(
    REPO_ROOT,
    "packages",
    "mcp",
    "eval-fixtures",
    "replays",
    "existing-salt-create-header-block-misroute-compact.json",
  ),
  path.join(
    REPO_ROOT,
    "packages",
    "mcp",
    "eval-fixtures",
    "replays",
    "existing-salt-create-dashboard-broadened-compact.json",
  ),
  path.join(
    REPO_ROOT,
    "packages",
    "mcp",
    "eval-fixtures",
    "replays",
    "existing-salt-create-chart-cross-family-compact.json",
  ),
  path.join(
    REPO_ROOT,
    "packages",
    "mcp",
    "eval-fixtures",
    "replays",
    "existing-salt-create-table-follow-up-drift.json",
  ),
  path.join(
    REPO_ROOT,
    "packages",
    "mcp",
    "eval-fixtures",
    "replays",
    "existing-salt-create-chart-follow-up-drift.json",
  ),
  path.join(
    REPO_ROOT,
    "packages",
    "mcp",
    "eval-fixtures",
    "replays",
    "existing-salt-review-wrong-root-context.json",
  ),
  path.join(
    REPO_ROOT,
    "packages",
    "mcp",
    "eval-fixtures",
    "replays",
    "existing-salt-review-full-and-cached-reads.json",
  ),
];

describe("workflow eval replay", () => {
  it("loads a saved transcript replay and judges it with the same rubric", async () => {
    const fixture = await loadWorkflowEvalReplayFixture(REPLAY_FIXTURE_PATH);
    const entry = replayWorkflowEvalFixture(fixture, REPLAY_FIXTURE_PATH);

    expect(entry.scenario_id).toBe(
      "existing-salt-review-toolbar-replay-missing-summary",
    );
    expect(entry.judgment).toEqual(
      expect.objectContaining({
        status: "failed",
        reasons: expect.arrayContaining([
          expect.stringContaining("result.ide_summary"),
        ]),
      }),
    );
    expect(entry.trace.metrics.transcript_bytes).toBeGreaterThan(0);
    expect(entry.trace.metrics.payload_bytes).toBeGreaterThan(0);
  });

  it("accepts compact replay fixtures for exact-name create success", async () => {
    const fixturePath = path.join(
      REPO_ROOT,
      "packages",
      "mcp",
      "eval-fixtures",
      "replays",
      "existing-salt-create-metric-exact-compact.json",
    );
    const fixture = await loadWorkflowEvalReplayFixture(fixturePath);
    const entry = replayWorkflowEvalFixture(fixture, fixturePath);

    expect(entry.scenario_id).toBe(
      "existing-salt-create-metric-exact-compact",
    );
    expect(entry.judgment).toEqual(
      expect.objectContaining({
        status: "passed",
      }),
    );
    expect(entry.trace.workflow_result).toEqual(
      expect.objectContaining({
        requested_entity: "Metric",
        resolved_entity: "Metric",
        match_status: "exact",
      }),
    );
  });

  it("accepts compact replay fixtures for descriptive broadened create results", async () => {
    const fixturePath = path.join(
      REPO_ROOT,
      "packages",
      "mcp",
      "eval-fixtures",
      "replays",
      "existing-salt-create-dashboard-broadened-compact.json",
    );
    const fixture = await loadWorkflowEvalReplayFixture(fixturePath);
    const entry = replayWorkflowEvalFixture(fixture, fixturePath);

    expect(entry.scenario_id).toBe(
      "existing-salt-create-dashboard-broadened-compact",
    );
    expect(entry.judgment).toEqual(
      expect.objectContaining({
        status: "passed",
      }),
    );
    expect(entry.trace.workflow_result).toEqual(
      expect.objectContaining({
        requested_entity: "dashboard summary area",
        resolved_entity: "Analytical dashboard",
        match_status: "broadened",
      }),
    );
  });

  it("proves compact create drift stays unsafe and smaller than the legacy rich create shape", async () => {
    const report = await runWorkflowEvalReplayReport(REPLAY_FIXTURE_PATHS);
    const entriesById = new Map(
      report.entries.map((entry) => [entry.scenario_id, entry] as const),
    );
    const compactCreateEntries = [
      "existing-salt-create-metric-exact-compact",
      "existing-salt-create-header-block-misroute-compact",
      "existing-salt-create-dashboard-broadened-compact",
      "existing-salt-create-chart-cross-family-compact",
    ].map((id) => entriesById.get(id));
    const legacyRichCreateEntries = [
      "existing-salt-create-table-follow-up-drift",
      "existing-salt-create-chart-follow-up-drift",
    ].map((id) => entriesById.get(id));

    expect(compactCreateEntries.every(Boolean)).toBe(true);
    expect(legacyRichCreateEntries.every(Boolean)).toBe(true);

    const compactDriftEntries = compactCreateEntries.filter((entry) => {
      const workflowResult = entry?.trace.workflow_result as
        | {
            match_status?: string;
            safe_to_implement_exact_request?: boolean;
            workflow_status?: string;
          }
        | undefined;
      return (
        workflowResult?.match_status === "broadened" ||
        workflowResult?.match_status === "misrouted"
      );
    });

    expect(
      compactDriftEntries.every(
        (entry) =>
          (
            entry?.trace.workflow_result as {
              safe_to_implement_exact_request?: boolean;
            }
          ).safe_to_implement_exact_request === false,
      ),
    ).toBe(true);
    expect(
      compactDriftEntries.every(
        (entry) =>
          (entry?.trace.workflow_result as { workflow_status?: string })
            .workflow_status !== "success",
      ),
    ).toBe(true);

    const averageCompactWorkflowBytes =
      compactCreateEntries.reduce(
        (sum, entry) => sum + (entry?.trace.metrics.workflow_result_bytes ?? 0),
        0,
      ) / compactCreateEntries.length;
    const averageLegacyRichWorkflowBytes =
      legacyRichCreateEntries.reduce(
        (sum, entry) => sum + (entry?.trace.metrics.workflow_result_bytes ?? 0),
        0,
      ) / legacyRichCreateEntries.length;

    expect(averageCompactWorkflowBytes).toBeLessThan(
      averageLegacyRichWorkflowBytes,
    );
  });

  it("emits a machine-readable replay report with aggregate metrics", async () => {
    const report = await runWorkflowEvalReplayReport(REPLAY_FIXTURE_PATHS);
    const parsed = JSON.parse(buildWorkflowEvalReplayJsonReport(report)) as {
      passed: boolean;
      replay_paths: string[];
      metrics: { transcript_bytes: number; payload_bytes: number };
      entries: Array<{
        scenario_id: string;
        judgment: { status: string; reasons: string[] };
      }>;
    };

    expect(parsed.passed).toBe(false);
    expect(parsed.replay_paths).toEqual(REPLAY_FIXTURE_PATHS);
    expect(parsed.entries).toHaveLength(REPLAY_FIXTURE_PATHS.length);
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id === "existing-salt-create-metric-exact-compact",
      )?.judgment.status,
    ).toBe("passed");
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id ===
          "existing-salt-create-header-block-misroute-compact",
      )?.judgment.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("Canonical choice")]),
    );
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id ===
          "existing-salt-create-dashboard-broadened-compact",
      )?.judgment.status,
    ).toBe("passed");
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id ===
          "existing-salt-create-chart-cross-family-compact",
      )?.judgment.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("Canonical choice")]),
    );
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id === "existing-salt-create-table-follow-up-drift",
      )?.judgment.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("Canonical choice")]),
    );
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id === "existing-salt-create-chart-follow-up-drift",
      )?.judgment.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("Canonical choice")]),
    );
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id === "existing-salt-review-wrong-root-context",
      )?.judgment.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("needs_explicit_root")]),
    );
    expect(
      parsed.entries
        .find(
          (entry) =>
            entry.scenario_id === "existing-salt-review-full-and-cached-reads",
        )
        ?.judgment.reasons.join("\n"),
    ).toContain("byte budget");
    expect(parsed.metrics.transcript_bytes).toBeGreaterThan(0);
    expect(parsed.metrics.payload_bytes).toBeGreaterThan(0);
  });

  it("runs the replay CLI against an explicit saved transcript and writes JSON output", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-eval-replay-cli-"),
    );
    const jsonOut = path.join(tempDir, "replay-report.json");

    try {
      const exitCode = await runCli([
        "--replay",
        REPLAY_FIXTURE_PATH,
        "--json-out",
        jsonOut,
      ]);
      const parsed = JSON.parse(await fs.readFile(jsonOut, "utf8")) as {
        replay_paths: string[];
        passed: boolean;
      };

      expect(exitCode).toBe(1);
      expect(parsed.passed).toBe(false);
      expect(parsed.replay_paths).toEqual([REPLAY_FIXTURE_PATH]);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
