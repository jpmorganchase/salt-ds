import fs from "node:fs/promises";
import path from "node:path";
import {
  judgeWorkflowEvalScenario,
  type WorkflowEvalJudgment,
  type WorkflowEvalMetrics,
  type WorkflowEvalScenario,
  type WorkflowEvalTrace,
} from "./workflowEvalHarness.js";

export interface WorkflowEvalReplayFixture {
  scenario: WorkflowEvalScenario;
  trace: Omit<WorkflowEvalTrace, "metrics"> & {
    metrics?: Partial<WorkflowEvalMetrics>;
  };
}

export interface WorkflowEvalReplayEntry {
  source_path: string;
  scenario_id: string;
  judgment: WorkflowEvalJudgment;
  trace: WorkflowEvalTrace;
}

export interface WorkflowEvalReplayReport {
  generated_at: string;
  replay_paths: string[];
  passed: boolean;
  metrics: WorkflowEvalMetrics;
  entries: WorkflowEvalReplayEntry[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

function estimatePromptTokensFromBytes(bytes: number): number {
  return Math.max(1, Math.ceil(bytes / 4));
}

function computeReplayMetrics(input: {
  transcript: string[];
  workflowResult: unknown | null;
  logs: string[];
  durationMs?: number;
}): WorkflowEvalMetrics {
  const transcriptText = input.transcript.join("\n");
  const workflowResultText = JSON.stringify(input.workflowResult ?? null);
  const logsText = input.logs.join("\n");
  const transcriptBytes = byteLength(transcriptText);
  const workflowResultBytes = byteLength(workflowResultText);
  const logsBytes = byteLength(logsText);
  const payloadBytes = transcriptBytes + workflowResultBytes + logsBytes;

  return {
    transcript_line_count: input.transcript.length,
    transcript_bytes: transcriptBytes,
    workflow_result_bytes: workflowResultBytes,
    logs_bytes: logsBytes,
    payload_bytes: payloadBytes,
    approx_prompt_tokens: estimatePromptTokensFromBytes(
      transcriptBytes + logsBytes,
    ),
    duration_ms: Math.max(0, Math.round(input.durationMs ?? 0)),
  };
}

function normalizeReplayTrace(
  trace: WorkflowEvalReplayFixture["trace"],
): WorkflowEvalTrace {
  const transcript = Array.isArray(trace.transcript)
    ? trace.transcript.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.length > 0,
      )
    : [];
  const logs = Array.isArray(trace.artifacts?.logs)
    ? trace.artifacts.logs.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.length > 0,
      )
    : [];
  const metrics = trace.metrics ?? {};

  return {
    scenario_id: trace.scenario_id,
    runner_id: trace.runner_id,
    status: trace.status,
    transport_trace: trace.transport_trace,
    workflow_result: trace.workflow_result,
    transcript,
    metrics: {
      ...computeReplayMetrics({
        transcript,
        workflowResult: trace.workflow_result,
        logs,
        durationMs: metrics.duration_ms,
      }),
      ...metrics,
    },
    artifacts: {
      files: trace.artifacts?.files,
      logs,
      report_path: trace.artifacts?.report_path ?? null,
    },
  };
}

export async function loadWorkflowEvalReplayFixture(
  filePath: string,
): Promise<WorkflowEvalReplayFixture> {
  const raw = JSON.parse(await fs.readFile(filePath, "utf8")) as unknown;
  if (!isRecord(raw) || !isRecord(raw.scenario) || !isRecord(raw.trace)) {
    throw new Error(`Invalid workflow eval replay fixture: ${filePath}`);
  }

  return {
    scenario: raw.scenario as unknown as WorkflowEvalScenario,
    trace: raw.trace as WorkflowEvalReplayFixture["trace"],
  };
}

export function replayWorkflowEvalFixture(
  fixture: WorkflowEvalReplayFixture,
  sourcePath: string,
): WorkflowEvalReplayEntry {
  const trace = normalizeReplayTrace(fixture.trace);
  return {
    source_path: sourcePath,
    scenario_id: fixture.scenario.id,
    judgment: judgeWorkflowEvalScenario(fixture.scenario, trace),
    trace,
  };
}

export async function runWorkflowEvalReplayReport(
  replayPaths: string[],
): Promise<WorkflowEvalReplayReport> {
  const entries: WorkflowEvalReplayEntry[] = [];

  for (const replayPath of replayPaths) {
    const fixture = await loadWorkflowEvalReplayFixture(replayPath);
    entries.push(replayWorkflowEvalFixture(fixture, replayPath));
  }

  return {
    generated_at: new Date().toISOString(),
    replay_paths: replayPaths,
    passed: entries.every((entry) => entry.judgment.status === "passed"),
    metrics: entries.reduce<WorkflowEvalMetrics>(
      (summary, entry) => ({
        transcript_line_count:
          summary.transcript_line_count +
          entry.trace.metrics.transcript_line_count,
        transcript_bytes:
          summary.transcript_bytes + entry.trace.metrics.transcript_bytes,
        workflow_result_bytes:
          summary.workflow_result_bytes +
          entry.trace.metrics.workflow_result_bytes,
        logs_bytes: summary.logs_bytes + entry.trace.metrics.logs_bytes,
        payload_bytes:
          summary.payload_bytes + entry.trace.metrics.payload_bytes,
        approx_prompt_tokens:
          summary.approx_prompt_tokens +
          entry.trace.metrics.approx_prompt_tokens,
        duration_ms: summary.duration_ms + entry.trace.metrics.duration_ms,
      }),
      {
        transcript_line_count: 0,
        transcript_bytes: 0,
        workflow_result_bytes: 0,
        logs_bytes: 0,
        payload_bytes: 0,
        approx_prompt_tokens: 0,
        duration_ms: 0,
      },
    ),
    entries,
  };
}

export function buildWorkflowEvalReplayJsonReport(
  report: WorkflowEvalReplayReport,
): string {
  return JSON.stringify(report, null, 2);
}

export function toReplayFixturePath(...segments: string[]): string {
  return path.join(...segments);
}
