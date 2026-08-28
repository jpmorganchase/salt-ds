import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import { SALT_SCAN_LIMIT_DEFAULTS } from "../../config/limits.js";
import {
  analyzeDiscoveredFiles,
  type ScannerWorkerFactory,
} from "../analyzeFiles.js";

class FakeWorker extends EventEmitter {
  constructor(
    private readonly respond: (worker: FakeWorker, message: unknown) => void,
  ) {
    super();
  }

  postMessage(message: unknown) {
    this.respond(this, message);
  }

  async terminate() {
    return 0;
  }
}

const file = {
  path: "src/index.tsx",
  workspace_unit_id: ".",
  utf8_bytes: 10,
  contents: "<Button />",
};

const analysis = {
  results: [
    {
      outcome: "no_findings_in_evaluated_scope",
      findings: [],
      coverage: {
        parser: "babel",
        unknown_fact_count: 0,
        evaluated_rule_ids: ["salt.catalog.non_stable_import"],
      },
      limitations: [],
    },
  ],
  scope: {},
  coverage: {},
  limitations: [],
  provenance: {},
};

function units() {
  return new Map([
    [
      ".",
      {
        package_vector: [{ name: "@salt-ds/core", observed_version: "1.69.0" }],
      },
    ],
  ]);
}

describe("scanner worker pool", () => {
  it("accepts one schema-matched result per file", async () => {
    const factory: ScannerWorkerFactory = () =>
      new FakeWorker((worker, message) =>
        queueMicrotask(() =>
          worker.emit("message", {
            contract: "salt-scan-worker-response/1",
            type: "result",
            job_id:
              typeof message === "object" &&
              message !== null &&
              "job_id" in message
                ? message.job_id
                : null,
            analysis,
          }),
        ),
      );
    const result = await analyzeDiscoveredFiles({
      files: [file],
      workspaceUnits: units(),
      limits: { ...SALT_SCAN_LIMIT_DEFAULTS, worker_concurrency: 1 },
      scanStartedAt: 0,
      now: () => 1,
      workerFactory: factory,
    });
    expect(result.global_failure).toBeNull();
    expect(result.outcomes[0]).toMatchObject({ status: "evaluated", file });
  });

  it("discards protocol violations and restarts the worker", async () => {
    const factory: ScannerWorkerFactory = () =>
      new FakeWorker((worker, message) =>
        queueMicrotask(() =>
          worker.emit("message", {
            contract: "salt-scan-worker-response/1",
            type: "result",
            job_id:
              typeof message === "object" &&
              message !== null &&
              "job_id" in message
                ? message.job_id
                : null,
            analysis: {},
          }),
        ),
      );
    const result = await analyzeDiscoveredFiles({
      files: [file],
      workspaceUnits: units(),
      limits: { ...SALT_SCAN_LIMIT_DEFAULTS, worker_concurrency: 1 },
      scanStartedAt: 0,
      now: () => 1,
      workerFactory: factory,
    });
    expect(result.forced_restarts).toBe(1);
    expect(result.outcomes[0]).toMatchObject({
      status: "failed",
      reason: "SCAN_WORKER_PROTOCOL",
    });
  });

  it("terminates a timed-out job and never returns partial analysis", async () => {
    const factory: ScannerWorkerFactory = () => new FakeWorker(() => undefined);
    const result = await analyzeDiscoveredFiles({
      files: [file],
      workspaceUnits: units(),
      limits: {
        ...SALT_SCAN_LIMIT_DEFAULTS,
        worker_concurrency: 1,
        worker_deadline_ms: 1,
      },
      scanStartedAt: 0,
      now: () => 1,
      workerFactory: factory,
    });
    expect(result.outcomes[0]).toEqual({
      status: "failed",
      file,
      reason: "SCAN_WORKER_TIMEOUT",
    });
  });

  it("reports restart-limit coverage and discards the failed file", async () => {
    const factory: ScannerWorkerFactory = () =>
      new FakeWorker((worker, message) =>
        queueMicrotask(() =>
          worker.emit("message", {
            contract: "salt-scan-worker-response/1",
            type: "error",
            job_id:
              typeof message === "object" &&
              message !== null &&
              "job_id" in message
                ? message.job_id
                : null,
            code: "SCAN_ANALYZER_FAILURE",
          }),
        ),
      );
    const result = await analyzeDiscoveredFiles({
      files: [file],
      workspaceUnits: units(),
      limits: {
        ...SALT_SCAN_LIMIT_DEFAULTS,
        worker_concurrency: 1,
        forced_worker_restarts: 0,
      },
      scanStartedAt: 0,
      now: () => 1,
      workerFactory: factory,
    });
    expect(result.global_failure).toBe("SCAN_WORKER_RESTART_LIMIT");
    expect(result.outcomes[0]).toMatchObject({
      status: "failed",
      reason: "SCAN_WORKER_RESTART_LIMIT",
    });
  });

  it("starts a clean worker after a contained crash", async () => {
    let workers = 0;
    const factory: ScannerWorkerFactory = () => {
      workers += 1;
      const current = workers;
      return new FakeWorker((worker, message) =>
        queueMicrotask(() => {
          const jobId =
            typeof message === "object" &&
            message !== null &&
            "job_id" in message
              ? message.job_id
              : null;
          worker.emit(
            "message",
            current === 1
              ? {
                  contract: "salt-scan-worker-response/1",
                  type: "error",
                  job_id: jobId,
                  code: "SCAN_ANALYZER_FAILURE",
                }
              : {
                  contract: "salt-scan-worker-response/1",
                  type: "result",
                  job_id: jobId,
                  analysis,
                },
          );
        }),
      );
    };
    const secondFile = { ...file, path: "src/second.tsx" };
    const result = await analyzeDiscoveredFiles({
      files: [file, secondFile],
      workspaceUnits: units(),
      limits: { ...SALT_SCAN_LIMIT_DEFAULTS, worker_concurrency: 1 },
      scanStartedAt: 0,
      now: () => 1,
      workerFactory: factory,
    });
    expect(result.forced_restarts).toBe(1);
    expect(result.outcomes.map((outcome) => outcome.status)).toEqual([
      "failed",
      "evaluated",
    ]);
  });
});
