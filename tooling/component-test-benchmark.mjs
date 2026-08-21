import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { fileURLToPath } from "node:url";

function readCount(name, defaultValue, minimum) {
  const argument = process.argv.find((value) => value.startsWith(`--${name}=`));
  if (!argument) return defaultValue;

  const count = Number.parseInt(argument.slice(name.length + 3), 10);
  if (!Number.isInteger(count) || count < minimum) {
    throw new Error(
      `--${name} must be an integer greater than or equal to ${minimum}`,
    );
  }
  return count;
}

const measuredRuns = readCount("runs", 5, 1);
const warmupRuns = readCount("warmup", 1, 0);
const verbose = process.argv.includes("--verbose");
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const yarnVersion = packageJson.packageManager.replace("yarn@", "");
const yarnPath = fileURLToPath(
  new URL(`../.yarn/releases/yarn-${yarnVersion}.cjs`, import.meta.url),
);

const runners = [
  { name: "Cypress", script: "benchmark:components:cypress" },
  { name: "Vitest Browser", script: "benchmark:components:vitest" },
];
const results = new Map(runners.map(({ name }) => [name, []]));

function run(runner, phase, iteration) {
  console.log(`\n${phase} ${iteration}: ${runner.name}`);
  const start = performance.now();
  const child = spawnSync(process.execPath, [yarnPath, runner.script], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    stdio: verbose ? "inherit" : ["ignore", "pipe", "pipe"],
  });
  const durationSeconds = (performance.now() - start) / 1000;

  if (child.status !== 0) {
    if (!verbose) {
      process.stdout.write(child.stdout ?? "");
      process.stderr.write(child.stderr ?? "");
    }
    process.exit(child.status ?? 1);
  }

  console.log(`${runner.name}: ${durationSeconds.toFixed(2)}s wall time`);
  return durationSeconds;
}

for (let iteration = 1; iteration <= warmupRuns; iteration += 1) {
  for (const runner of runners) {
    run(runner, "Warm-up", iteration);
  }
}

for (let iteration = 1; iteration <= measuredRuns; iteration += 1) {
  const orderedRunners = iteration % 2 === 1 ? runners : [...runners].reverse();
  for (const runner of orderedRunners) {
    results.get(runner.name).push(run(runner, "Measured run", iteration));
  }
}

function percentile(values, fraction) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[
    Math.min(Math.ceil(sorted.length * fraction) - 1, sorted.length - 1)
  ];
}

console.log("\nComponent benchmark summary (seconds)");
console.log("Runner\tRuns\tMedian\tp95\tMin\tMax");
for (const { name } of runners) {
  const values = results.get(name);
  const median = percentile(values, 0.5);
  const p95 = percentile(values, 0.95);
  console.log(
    `${name}\t${values.length}\t${median.toFixed(2)}\t${p95.toFixed(2)}\t${Math.min(...values).toFixed(2)}\t${Math.max(...values).toFixed(2)}`,
  );
}
