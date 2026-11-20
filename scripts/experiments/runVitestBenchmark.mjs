import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { availableParallelism, cpus, totalmem } from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

const root = process.cwd();
const baseCommit = "00bb4abdb0aa7bc3948cb3dde22c882f4494a926";
const headCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const [shardText, countText] = process.argv.slice(2);
const shard = Number(shardText);
const count = Number(countText);
assert([2, 3].includes(count), "The experiment supports two or three shards");
assert(
  Number.isInteger(shard) && shard >= 1 && shard <= count,
  "Invalid shard",
);
assert.equal(process.env.CI, "true", "Use built packages with CI=true");

const output = path.resolve(".vitest", "benchmark");
mkdirSync(output, { recursive: true });
const manifestPaths = ["package.json", "yarn.lock"];
const manifests = {
  candidate: Object.fromEntries(
    manifestPaths.map((file) => [file, readFileSync(file)]),
  ),
  baseline: Object.fromEntries(
    manifestPaths.map((file) => [
      file,
      execFileSync("git", ["show", `${baseCommit}:${file}`]),
    ]),
  ),
};
const hardware = {
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  parallelism: availableParallelism(),
  maxWorkers: Math.min(6, availableParallelism()),
  cpuModel: cpus()[0]?.model,
  memoryBytes: totalmem(),
  runnerImage: process.env.ImageOS,
  runnerImageVersion: process.env.ImageVersion,
  browser: execFileSync("google-chrome", ["--version"], {
    encoding: "utf8",
  }).trim(),
};
const records = [];
const schedule =
  count === 3
    ? [
        ["baseline", 1],
        ["candidate", 1],
        ["candidate", 2],
        ["baseline", 2],
      ]
    : [
        ["candidate", 1],
        ["candidate", 2],
      ];
let installed = "candidate";

function version(packageName) {
  return JSON.parse(
    readFileSync(path.join(root, "node_modules", packageName, "package.json")),
  ).version;
}

function identities(report) {
  return report.testResults
    .flatMap((file) =>
      file.assertionResults.map((test) =>
        JSON.stringify([
          path.relative(root, file.name),
          test.fullName,
          test.status,
        ]),
      ),
    )
    .sort();
}

function persist(parity = { equal: false, reason: "Experiment incomplete" }) {
  writeFileSync(
    path.join(output, `benchmark-${count}-${shard}.json`),
    JSON.stringify(
      { baseCommit, headCommit, hardware, records, parity },
      null,
      2,
    ),
  );
}

try {
  for (const [variant, iteration] of schedule) {
    if (installed !== variant) {
      for (const file of manifestPaths) {
        writeFileSync(file, manifests[variant][file]);
      }
      execFileSync(
        process.execPath,
        [".yarn/releases/yarn-4.17.0.cjs", "install", "--immutable"],
        { stdio: "inherit" },
      );
      installed = variant;
    }
    const versions = {
      vitest: version("vitest"),
      provider: version("@vitest/browser-playwright"),
      vite: version("vite"),
      playwright: version("playwright"),
      react: version("react"),
      reactDom: version("react-dom"),
    };
    assert.equal(versions.vitest, variant === "baseline" ? "5.0.5" : "5.1.1");
    assert.equal(versions.provider, versions.vitest);
    const label = `${variant}-${count}-${shard}-${iteration}`;
    const reportFile = `${label}.json`;
    const diagnosticsFile = `${label}.diagnostics.json`;
    const logFile = `${label}.log`;
    // Clear the dependency/results cache between processes. Browser response
    // caching within a run remains at each release's normal defaults.
    rmSync(path.join(root, "node_modules", ".vite"), {
      recursive: true,
      force: true,
    });
    const command = [
      "node_modules/vitest/vitest.mjs",
      "run",
      "--config=vitest.browser.config.mts",
      "--browser.headless",
      `--shard=${shard}/${count}`,
      "--reporter=default",
      "--reporter=json",
      "--reporter=./scripts/experiments/vitestBenchmarkReporter.mjs",
      `--outputFile.json=${path.join(output, reportFile)}`,
    ];
    console.log(JSON.stringify({ event: "start", label, versions, hardware }));
    const descriptor = openSync(path.join(output, logFile), "w");
    const start = performance.now();
    const run = spawnSync(process.execPath, command, {
      env: {
        ...process.env,
        NO_COLOR: "1",
        SALT_BENCHMARK_DIAGNOSTICS: path.join(output, diagnosticsFile),
      },
      stdio: ["ignore", descriptor, descriptor],
      timeout: 600_000,
    });
    const elapsedSeconds = (performance.now() - start) / 1_000;
    closeSync(descriptor);
    let report;
    let diagnostic;
    try {
      report = JSON.parse(readFileSync(path.join(output, reportFile), "utf8"));
      diagnostic = JSON.parse(
        readFileSync(path.join(output, diagnosticsFile), "utf8"),
      );
    } catch (error) {
      console.error(`Incomplete report for ${label}: ${error.message}`);
    }
    const assertions = (report?.testResults ?? []).flatMap(
      (file) => file.assertionResults,
    );
    const totals = {
      tests: assertions.length,
      passed: assertions.filter((test) => test.status === "passed").length,
      failed: assertions.filter((test) => test.status === "failed").length,
      skipped: assertions.filter((test) => test.status === "skipped").length,
      pending: assertions.filter((test) => test.status === "pending").length,
      todo: assertions.filter((test) => test.status === "todo").length,
    };
    const valid =
      run.status === 0 &&
      report?.success === true &&
      assertions.length > 0 &&
      totals.failed === 0 &&
      totals.pending === 0 &&
      diagnostic?.errorCount === 0 &&
      report.testResults.every((file) => file.status !== "failed");
    const record = {
      variant,
      iteration,
      shard,
      count,
      elapsedSeconds,
      exitCode: run.status ?? 124,
      versions,
      reportFile,
      diagnosticsFile,
      logFile,
      totals,
      fileCount: report?.testResults.length ?? 0,
      valid,
    };
    records.push(record);
    persist();
    console.log(JSON.stringify({ event: "result", ...record }));
    console.log(
      readFileSync(path.join(output, logFile), "utf8")
        .split("\n")
        .slice(-18)
        .join("\n"),
    );
  }
  const reference = identities(
    JSON.parse(readFileSync(path.join(output, records[0].reportFile), "utf8")),
  );
  let equal = records.every((record) => record.valid);
  for (const record of records) {
    const report = JSON.parse(
      readFileSync(path.join(output, record.reportFile), "utf8"),
    );
    equal &&= JSON.stringify(identities(report)) === JSON.stringify(reference);
  }
  persist({ equal });
  console.log(JSON.stringify({ event: "parity", shard, count, equal }));
  if (!equal) process.exitCode = 1;
} finally {
  // Leave the checkout on its candidate manifests after the experiment.
  for (const file of manifestPaths) {
    writeFileSync(file, manifests.candidate[file]);
  }
}
