import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { fileURLToPath } from "node:url";

export function readCount(argv, name, defaultValue, minimum) {
  const argument = argv.find((value) => value.startsWith(`--${name}=`));
  if (!argument) return defaultValue;

  const count = Number.parseInt(argument.slice(name.length + 3), 10);
  if (!Number.isInteger(count) || count < minimum) {
    throw new Error(
      `--${name} must be an integer greater than or equal to ${minimum}`,
    );
  }
  return count;
}

export function createRunners() {
  return [
    {
      name: "Cypress",
      script: "benchmark:components:cypress",
      specDirectory: new URL("../packages", import.meta.url),
      specPattern: /\.cy\.(?:js|ts|jsx|tsx)$/,
      completionPattern: /\(Run Finished\)/,
    },
    {
      name: "Vitest Browser",
      script: "benchmark:components:vitest",
      specDirectory: new URL("../vitest-browser/benchmark", import.meta.url),
      specPattern: /\.browser\.test\.tsx$/,
      completionPattern: /Test Files\s+/,
    },
  ];
}

export function countSpecs(runners, readDirectory = readdirSync) {
  return runners.map(({ name, specDirectory, specPattern }) => ({
    name,
    count: readDirectory(specDirectory, {
      recursive: true,
      withFileTypes: true,
    }).filter((entry) => entry.isFile() && specPattern.test(entry.name)).length,
  }));
}

function childExitCode(child) {
  return Number.isInteger(child.status) && child.status !== 0
    ? child.status
    : 1;
}

export function runSuite(
  runner,
  phase,
  iteration,
  {
    cwd,
    env,
    execPath,
    yarnPath,
    verbose = false,
    spawn = spawnSync,
    now = () => performance.now(),
    log = console.log,
    error = console.error,
    stdoutWrite = (value) => process.stdout.write(value),
    stderrWrite = (value) => process.stderr.write(value),
  },
) {
  log(`\n${phase} ${iteration}: ${runner.name}`);
  const start = now();
  const child = spawn(execPath, [yarnPath, runner.script], {
    cwd,
    encoding: "utf8",
    env,
    maxBuffer: 50 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const durationSeconds = (now() - start) / 1000;
  const output = `${child.stdout ?? ""}\n${child.stderr ?? ""}`;
  const completed = runner.completionPattern.test(output);
  const passed = completed && child.status === 0 && child.error == null;

  if (verbose || !passed) {
    stdoutWrite(child.stdout ?? "");
    stderrWrite(child.stderr ?? "");
  }

  if (child.error) {
    error(`${runner.name} failed to start: ${child.error.message}`);
  }

  if (!completed) {
    error(`${runner.name} did not complete its full test suite.`);
  }

  const result = {
    completed,
    durationSeconds,
    exitCode: passed ? 0 : childExitCode(child),
    passed,
  };

  log(
    `${runner.name}: ${durationSeconds.toFixed(2)}s wall time (${passed ? "passed" : completed ? `completed with test failures; exit ${child.status ?? "unknown"}` : "incomplete"})`,
  );
  return result;
}

export function percentile(values, fraction) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[
    Math.min(Math.ceil(sorted.length * fraction) - 1, sorted.length - 1)
  ];
}

function formatSeconds(value) {
  return value === undefined ? "n/a" : value.toFixed(2);
}

export function printSummary(runners, results, log = console.log) {
  log("\nComponent benchmark summary (seconds)");
  log("Runner\tAttempts\tPassed\tFailed\tSamples\tMedian\tp95\tMin\tMax");

  for (const { name } of runners) {
    const runs = results.get(name) ?? [];
    const values = runs
      .filter(({ passed }) => passed)
      .map(({ durationSeconds }) => durationSeconds);
    const median = values.length === 0 ? undefined : percentile(values, 0.5);
    const p95 = values.length === 0 ? undefined : percentile(values, 0.95);
    const minimum = values.length === 0 ? undefined : Math.min(...values);
    const maximum = values.length === 0 ? undefined : Math.max(...values);
    const passed = runs.filter((result) => result.passed).length;

    log(
      `${name}\t${runs.length}\t${passed}\t${runs.length - passed}\t${values.length}\t${formatSeconds(median)}\t${formatSeconds(p95)}\t${formatSeconds(minimum)}\t${formatSeconds(maximum)}`,
    );
  }
}

export function runBenchmark({
  runners,
  measuredRuns,
  warmupRuns,
  runSuiteOptions,
}) {
  const results = new Map(runners.map(({ name }) => [name, []]));

  for (let iteration = 1; iteration <= warmupRuns; iteration += 1) {
    for (const runner of runners) {
      const result = runSuite(runner, "Warm-up", iteration, runSuiteOptions);
      if (!result.passed) return result.exitCode;
    }
  }

  let measuredFailure = false;
  for (let iteration = 1; iteration <= measuredRuns; iteration += 1) {
    const orderedRunners =
      iteration % 2 === 1 ? runners : [...runners].reverse();
    for (const runner of orderedRunners) {
      const result = runSuite(
        runner,
        "Measured run",
        iteration,
        runSuiteOptions,
      );
      if (!result.completed) return result.exitCode;
      results.get(runner.name).push(result);
      measuredFailure ||= !result.passed;
    }
  }

  printSummary(runners, results, runSuiteOptions.log);
  return measuredFailure ? 1 : 0;
}

export function main({
  argv = process.argv.slice(2),
  readFile = readFileSync,
  readDirectory = readdirSync,
  spawn = spawnSync,
  now = () => performance.now(),
  log = console.log,
  error = console.error,
  stdoutWrite = (value) => process.stdout.write(value),
  stderrWrite = (value) => process.stderr.write(value),
  cwd = process.cwd(),
  env = process.env,
  execPath = process.execPath,
} = {}) {
  const measuredRuns = readCount(argv, "runs", 5, 1);
  const warmupRuns = readCount(argv, "warmup", 1, 0);
  const verbose = argv.includes("--verbose");
  const packageJson = JSON.parse(
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const yarnVersion = packageJson.packageManager.replace("yarn@", "");
  const yarnPath = fileURLToPath(
    new URL(`../.yarn/releases/yarn-${yarnVersion}.cjs`, import.meta.url),
  );
  const runners = createRunners();
  const specCounts = countSpecs(runners, readDirectory);

  if (new Set(specCounts.map(({ count }) => count)).size !== 1) {
    throw new Error(
      `Component benchmark suites are not comparable: ${specCounts
        .map(({ name, count }) => `${name} has ${count} specs`)
        .join(", ")}`,
    );
  }

  log(
    `Benchmarking complete component suites (${specCounts[0].count} specs each).`,
  );

  return runBenchmark({
    measuredRuns,
    runners,
    warmupRuns,
    runSuiteOptions: {
      cwd,
      env,
      error,
      execPath,
      log,
      now,
      spawn,
      stderrWrite,
      stdoutWrite,
      verbose,
      yarnPath,
    },
  });
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
