import { createHash } from "node:crypto";
import { Worker } from "node:worker_threads";
import type {
  CompleteReviewSaltCodeAnalysis,
  SubmittedArtifactLanguage,
} from "@salt-ds/knowledge";
import type { SaltScanLimits } from "../config/limits.js";
import type { DiscoveredSourceFile } from "../discovery/discoverProject.js";

interface ScannerWorkerRequest {
  contract: "salt-scan-worker-request/1";
  type: "scan";
  job_id: string;
  payload: {
    path: string;
    language: SubmittedArtifactLanguage;
    text: string;
    package_versions: Record<string, string>;
    limits: {
      source_bytes: number;
      ast_nodes: number;
      evidence_candidates: number;
      findings: number;
    };
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

function isFinding(value: unknown): boolean {
  if (
    !isRecord(value) ||
    !isRecord(value.location) ||
    !isRecord(value.evidence)
  ) {
    return false;
  }
  const location = value.location;
  const evidence = value.evidence;
  const locationNumbers = [
    "start_offset",
    "end_offset",
    "start_line",
    "start_column",
    "end_line",
    "end_column",
  ];
  const validLocationNumbers = locationNumbers.every((name) => {
    const number = location[name];
    const minimum = name.endsWith("line") || name.endsWith("column") ? 1 : 0;
    return Number.isSafeInteger(number) && Number(number) >= minimum;
  });
  return (
    typeof value.rule_id === "string" &&
    typeof value.rule_description === "string" &&
    ["info", "warning", "error"].includes(String(value.severity)) &&
    validLocationNumbers &&
    (typeof value.remediation === "string" || value.remediation === null) &&
    evidence.validation === "source_bound" &&
    Array.isArray(evidence.references) &&
    evidence.references.length > 0 &&
    evidence.references.every(
      (reference) =>
        isRecord(reference) &&
        typeof reference.locator === "string" &&
        typeof reference.field_path === "string",
    )
  );
}

function isCompleteAnalysis(
  value: unknown,
): value is CompleteReviewSaltCodeAnalysis {
  if (
    !isRecord(value) ||
    !Array.isArray(value.results) ||
    value.results.length !== 1
  ) {
    return false;
  }
  const result = value.results[0];
  return (
    isRecord(result) &&
    ["not_evaluated", "findings", "no_findings_in_evaluated_scope"].includes(
      String(result.outcome),
    ) &&
    Array.isArray(result.findings) &&
    result.findings.every(isFinding) &&
    isRecord(result.coverage) &&
    ["limited", "babel", "postcss", "failed", "not_run"].includes(
      String(result.coverage.parser),
    ) &&
    isStringArray(result.coverage.evaluated_rule_ids) &&
    typeof result.coverage.unknown_fact_count === "number" &&
    isStringArray(result.limitations) &&
    isRecord(value.scope) &&
    isRecord(value.coverage) &&
    isStringArray(value.limitations) &&
    isRecord(value.provenance)
  );
}

function isScannerWorkerResponse(
  value: unknown,
  jobId: string,
): value is
  | { type: "result"; job_id: string; analysis: CompleteReviewSaltCodeAnalysis }
  | {
      type: "error";
      job_id: string;
      code: "SCAN_ANALYZER_FAILURE" | "SCAN_FINDING_LIMIT";
    } {
  if (
    !isRecord(value) ||
    value.contract !== "salt-scan-worker-response/1" ||
    value.job_id !== jobId
  ) {
    return false;
  }
  if (value.type === "result") return isCompleteAnalysis(value.analysis);
  return (
    value.type === "error" &&
    (value.code === "SCAN_ANALYZER_FAILURE" ||
      value.code === "SCAN_FINDING_LIMIT")
  );
}

export type ScannerFailureReason =
  | "SCAN_WORKER_TIMEOUT"
  | "SCAN_WORKER_OOM"
  | "SCAN_WORKER_CRASH"
  | "SCAN_WORKER_PROTOCOL"
  | "SCAN_WORKER_RESTART_LIMIT"
  | "SCAN_WORKER_TIME_LIMIT"
  | "SCAN_WHOLE_TIMEOUT"
  | "SCAN_FINDING_LIMIT"
  | "SCAN_ANALYZER_FAILURE"
  | "SCAN_ISOLATION_UNAVAILABLE";

export type FileAnalysisOutcome =
  | {
      status: "evaluated";
      file: DiscoveredSourceFile;
      analysis: CompleteReviewSaltCodeAnalysis;
    }
  | {
      status: "failed";
      file: DiscoveredSourceFile;
      reason: ScannerFailureReason;
    };

interface WorkerLike {
  on(event: "message", listener: (message: unknown) => void): this;
  on(
    event: "error",
    listener: (error: Error & { code?: string }) => void,
  ): this;
  on(event: "exit", listener: (code: number) => void): this;
  off(event: "message", listener: (message: unknown) => void): this;
  off(
    event: "error",
    listener: (error: Error & { code?: string }) => void,
  ): this;
  off(event: "exit", listener: (code: number) => void): this;
  postMessage(message: ScannerWorkerRequest): void;
  terminate(): Promise<number>;
}

export type ScannerWorkerFactory = (heapMiB: number) => WorkerLike;

function defaultWorkerFactory(heapMiB: number): WorkerLike {
  return new Worker(new URL("./scannerWorker.js", import.meta.url), {
    env: {
      ...process.env,
      SALT_SCANNER_WORKER_CONTEXT: "1",
    },
    resourceLimits: {
      maxOldGenerationSizeMb: heapMiB,
      stackSizeMb: 4,
    },
  });
}

function languageForPath(filePath: string): SubmittedArtifactLanguage {
  if (filePath.endsWith(".tsx")) return "tsx";
  if (filePath.endsWith(".ts")) return "typescript";
  if (filePath.endsWith(".jsx")) return "jsx";
  if (filePath.endsWith(".css")) return "css";
  return "javascript";
}

function packageVersions(
  vector: Array<{ name: string; observed_version: string | null }>,
): Record<string, string> {
  return Object.fromEntries(
    vector.flatMap((entry) =>
      entry.observed_version ? [[entry.name, entry.observed_version]] : [],
    ),
  );
}

function stableJobId(index: number, filePath: string): string {
  const digest = createHash("sha256")
    .update(filePath)
    .digest("hex")
    .slice(0, 16);
  return `scan-${String(index).padStart(6, "0")}-${digest}`;
}

type WorkerJobResult =
  | { status: "evaluated"; analysis: CompleteReviewSaltCodeAnalysis }
  | { status: "failed"; reason: ScannerFailureReason; restart: boolean };

function runWorkerJob(input: {
  worker: WorkerLike;
  request: ScannerWorkerRequest;
  deadlineMs: number;
}): Promise<WorkerJobResult> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: WorkerJobResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      input.worker.off("message", onMessage);
      input.worker.off("error", onError);
      input.worker.off("exit", onExit);
      resolve(result);
    };
    const onMessage = (message: unknown) => {
      if (!isScannerWorkerResponse(message, input.request.job_id)) {
        finish({
          status: "failed",
          reason: "SCAN_WORKER_PROTOCOL",
          restart: true,
        });
        return;
      }
      if (message.type === "result") {
        finish({ status: "evaluated", analysis: message.analysis });
      } else {
        finish({
          status: "failed",
          reason:
            message.code === "SCAN_FINDING_LIMIT"
              ? "SCAN_FINDING_LIMIT"
              : "SCAN_ANALYZER_FAILURE",
          restart: message.code !== "SCAN_FINDING_LIMIT",
        });
      }
    };
    const onError = (error: Error & { code?: string }) =>
      finish({
        status: "failed",
        reason:
          error.code === "ERR_WORKER_OUT_OF_MEMORY"
            ? "SCAN_WORKER_OOM"
            : "SCAN_WORKER_CRASH",
        restart: true,
      });
    const onExit = (_code: number) =>
      finish({
        status: "failed",
        reason: "SCAN_WORKER_CRASH",
        restart: true,
      });
    const timeout = setTimeout(
      () =>
        finish({
          status: "failed",
          reason: "SCAN_WORKER_TIMEOUT",
          restart: true,
        }),
      input.deadlineMs,
    );
    timeout.unref();
    input.worker.on("message", onMessage);
    input.worker.on("error", onError);
    input.worker.on("exit", onExit);
    try {
      input.worker.postMessage(input.request);
    } catch {
      finish({ status: "failed", reason: "SCAN_WORKER_CRASH", restart: true });
    }
  });
}

export async function analyzeDiscoveredFiles(input: {
  files: readonly DiscoveredSourceFile[];
  workspaceUnits: ReadonlyMap<
    string,
    { package_vector: Array<{ name: string; observed_version: string | null }> }
  >;
  limits: SaltScanLimits;
  scanStartedAt: number;
  now?: () => number;
  workerFactory?: ScannerWorkerFactory;
}): Promise<{
  outcomes: FileAnalysisOutcome[];
  forced_restarts: number;
  global_failure: ScannerFailureReason | null;
}> {
  const now = input.now ?? (() => performance.now());
  const factory = input.workerFactory ?? defaultWorkerFactory;
  const outcomes = new Array<FileAnalysisOutcome>(input.files.length);
  const activeIndexes = new Set<number>();
  const discardIndexes = new Set<number>();
  const activeWorkers = new Set<WorkerLike>();
  let nextIndex = 0;
  let forcedRestarts = 0;
  let cumulativeJobMs = 0;
  let globalFailure: ScannerFailureReason | null = null;

  const failGlobal = (reason: ScannerFailureReason) => {
    if (globalFailure) return;
    globalFailure = reason;
    for (const index of activeIndexes) discardIndexes.add(index);
    for (const worker of activeWorkers)
      void worker.terminate().catch(() => undefined);
  };

  const createWorker = (): WorkerLike | null => {
    try {
      const worker = factory(input.limits.worker_old_generation_mib);
      activeWorkers.add(worker);
      return worker;
    } catch {
      failGlobal("SCAN_ISOLATION_UNAVAILABLE");
      return null;
    }
  };

  const workerLoop = async () => {
    let worker = createWorker();
    try {
      while (worker && !globalFailure) {
        if (now() - input.scanStartedAt > input.limits.whole_scan_elapsed_ms) {
          failGlobal("SCAN_WHOLE_TIMEOUT");
          break;
        }
        const index = nextIndex;
        nextIndex += 1;
        if (index >= input.files.length) break;
        const file = input.files[index];
        const unit = input.workspaceUnits.get(file.workspace_unit_id);
        if (!unit) {
          outcomes[index] = {
            status: "failed",
            file,
            reason: "SCAN_ANALYZER_FAILURE",
          };
          continue;
        }
        const jobStartedAt = now();
        activeIndexes.add(index);
        const result = await runWorkerJob({
          worker,
          deadlineMs: input.limits.worker_deadline_ms,
          request: {
            contract: "salt-scan-worker-request/1",
            type: "scan",
            job_id: stableJobId(index, file.path),
            payload: {
              path: file.path,
              language: languageForPath(file.path),
              text: file.contents,
              package_versions: packageVersions(unit.package_vector),
              limits: {
                source_bytes: input.limits.individual_source_bytes,
                ast_nodes: file.path.endsWith(".css")
                  ? input.limits.css_nodes_per_file
                  : input.limits.js_ast_nodes_per_file,
                evidence_candidates: input.limits.evidence_candidates_per_file,
                findings: input.limits.findings_per_file,
              },
            },
          },
        });
        activeIndexes.delete(index);
        cumulativeJobMs += Math.max(0, now() - jobStartedAt);
        if (cumulativeJobMs > input.limits.cumulative_worker_wall_ms) {
          discardIndexes.add(index);
          failGlobal("SCAN_WORKER_TIME_LIMIT");
          break;
        }
        outcomes[index] =
          result.status === "evaluated"
            ? { status: "evaluated", file, analysis: result.analysis }
            : { status: "failed", file, reason: result.reason };
        if (result.status === "failed" && result.restart) {
          forcedRestarts += 1;
          activeWorkers.delete(worker);
          await worker.terminate().catch(() => undefined);
          if (forcedRestarts > input.limits.forced_worker_restarts) {
            outcomes[index] = {
              status: "failed",
              file,
              reason: "SCAN_WORKER_RESTART_LIMIT",
            };
            failGlobal("SCAN_WORKER_RESTART_LIMIT");
            break;
          }
          worker = createWorker();
        }
      }
    } finally {
      if (worker) {
        activeWorkers.delete(worker);
        await worker.terminate().catch(() => undefined);
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(input.limits.worker_concurrency, input.files.length) },
      workerLoop,
    ),
  );
  for (let index = 0; index < input.files.length; index += 1) {
    if (discardIndexes.has(index) || !outcomes[index]) {
      outcomes[index] = {
        status: "failed",
        file: input.files[index],
        reason: globalFailure ?? "SCAN_ANALYZER_FAILURE",
      };
    }
  }
  return {
    outcomes,
    forced_restarts: forcedRestarts,
    global_failure: globalFailure,
  };
}
