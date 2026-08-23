import { describe, expect, it, vi } from "vitest";
import {
  printSummary,
  runBenchmark,
  runSuite,
} from "./component-test-benchmark.mjs";

const runner = {
  completionPattern: /Test Files\s+/,
  name: "Vitest Browser",
  script: "benchmark:components:vitest",
};

function createClock(durations) {
  let current = 0;
  let durationIndex = 0;
  let starting = true;

  return () => {
    if (starting) {
      starting = false;
      return current;
    }

    current += durations[durationIndex] * 1000;
    durationIndex += 1;
    starting = true;
    return current;
  };
}

function createHarness(children, durations = children.map(() => 1)) {
  const logs = [];
  const errors = [];
  const stdout = [];
  const stderr = [];
  const spawn = vi.fn(() => children.shift());

  return {
    errors,
    logs,
    options: {
      cwd: "D:/repo",
      env: {},
      error: (value) => errors.push(value),
      execPath: "node",
      log: (value) => logs.push(value),
      now: createClock(durations),
      spawn,
      stderrWrite: (value) => stderr.push(value),
      stdoutWrite: (value) => stdout.push(value),
      verbose: false,
      yarnPath: "yarn.cjs",
    },
    spawn,
    stderr,
    stdout,
  };
}

function completed(status = 0, stdout = "Test Files 1 passed") {
  return { status, stderr: "", stdout };
}

describe("component test benchmark", () => {
  it("prints and invalidates a completed failing measured run", () => {
    const harness = createHarness(
      [completed(1, "Test Files 1 failed\nfailure details")],
      [0.1],
    );

    const exitCode = runBenchmark({
      measuredRuns: 1,
      runners: [runner],
      runSuiteOptions: harness.options,
      warmupRuns: 0,
    });

    expect(exitCode).toBe(1);
    expect(harness.stdout.join("")).toContain("failure details");
    expect(harness.logs.join("\n")).toContain(
      "Vitest Browser\t1\t0\t1\t0\tn/a\tn/a\tn/a\tn/a",
    );
  });

  it("treats a zero exit without a completion marker as incomplete", () => {
    const harness = createHarness([{ status: 0, stderr: "", stdout: "" }]);

    const exitCode = runBenchmark({
      measuredRuns: 2,
      runners: [runner],
      runSuiteOptions: harness.options,
      warmupRuns: 0,
    });

    expect(exitCode).toBe(1);
    expect(harness.spawn).toHaveBeenCalledOnce();
    expect(harness.errors).toContain(
      "Vitest Browser did not complete its full test suite.",
    );
  });

  it("fails fast when a warm-up fails", () => {
    const harness = createHarness([completed(2, "Test Files 1 failed")]);

    const exitCode = runBenchmark({
      measuredRuns: 1,
      runners: [runner],
      runSuiteOptions: harness.options,
      warmupRuns: 1,
    });

    expect(exitCode).toBe(2);
    expect(harness.spawn).toHaveBeenCalledOnce();
    expect(harness.stdout.join("")).toContain("Test Files 1 failed");
  });

  it("calculates timing statistics from passing samples only", () => {
    const harness = createHarness(
      [completed(), completed(1, "Test Files 1 failed"), completed()],
      [3, 0.1, 7],
    );

    const exitCode = runBenchmark({
      measuredRuns: 3,
      runners: [runner],
      runSuiteOptions: harness.options,
      warmupRuns: 0,
    });

    expect(exitCode).toBe(1);
    expect(harness.logs.join("\n")).toContain(
      "Vitest Browser\t3\t2\t1\t2\t3.00\t7.00\t3.00\t7.00",
    );
    expect(harness.logs.join("\n")).not.toContain("0.10\t");
  });

  it("prints n/a when a runner has no passing timing samples", () => {
    const logs = [];

    printSummary(
      [runner],
      new Map([
        [
          runner.name,
          [
            {
              completed: true,
              durationSeconds: 0.25,
              exitCode: 1,
              passed: false,
            },
          ],
        ],
      ]),
      (value) => logs.push(value),
    );

    const output = logs.join("\n");
    expect(output).toContain("\t0\tn/a\tn/a\tn/a\tn/a");
    expect(output).not.toContain("NaN");
    expect(output).not.toContain("Infinity");
  });

  it("returns zero and preserves alternating runner order when all runs pass", () => {
    const firstRunner = { ...runner, name: "First", script: "first" };
    const secondRunner = { ...runner, name: "Second", script: "second" };
    const harness = createHarness(Array.from({ length: 6 }, () => completed()));

    const exitCode = runBenchmark({
      measuredRuns: 2,
      runners: [firstRunner, secondRunner],
      runSuiteOptions: harness.options,
      warmupRuns: 1,
    });

    expect(exitCode).toBe(0);
    expect(harness.spawn.mock.calls.map(([, args]) => args[1])).toEqual([
      "first",
      "second",
      "first",
      "second",
      "second",
      "first",
    ]);
  });

  it("normalizes spawn errors to a visible nonzero result", () => {
    const spawnError = new Error("spawn failed");
    const harness = createHarness([
      { error: spawnError, status: null, stderr: "", stdout: "" },
    ]);

    const result = runSuite(runner, "Measured run", 1, harness.options);

    expect(result).toMatchObject({
      completed: false,
      exitCode: 1,
      passed: false,
    });
    expect(harness.errors).toContain(
      "Vitest Browser failed to start: spawn failed",
    );
  });
});
