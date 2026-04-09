import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildWorkflowEvalReplayJsonReport,
  loadWorkflowEvalReplayFixture,
  replayWorkflowEvalFixture,
  runWorkflowEvalReplayReport,
} from "../evals/workflowEvalReplay.js";
import { runCli } from "../evals/runWorkflowEvalReplay.js";
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

    expect(entry.scenario_id).toBe("existing-salt-review-toolbar-replay-missing-summary");
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
          entry.scenario_id ===
          "existing-salt-create-table-follow-up-drift",
      )?.judgment.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("Canonical choice")]),
    );
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id ===
          "existing-salt-create-chart-follow-up-drift",
      )?.judgment.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("Canonical choice")]),
    );
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id ===
          "existing-salt-review-wrong-root-context",
      )?.judgment.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("needs_explicit_root")]),
    );
    expect(
      parsed.entries.find(
        (entry) =>
          entry.scenario_id ===
          "existing-salt-review-full-and-cached-reads",
      )?.judgment.reasons.join("\n"),
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
