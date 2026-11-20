import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const expectedVersions = { baseline: "5.0.5", candidate: "5.1.1" };
const statuses = ["passed", "failed", "skipped", "pending", "todo", "disabled"];

function metadataFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return metadataFiles(filename);
    return entry.isFile() && /^benchmark-\d+-\d+\.json$/.test(entry.name)
      ? [filename]
      : [];
  });
}

function relativeTestFile(filename) {
  const normalized = filename.replaceAll("\\", "/");
  if (/^(packages|test)\//.test(normalized)) return normalized;
  const match = normalized.match(/\/(packages|test)\//);
  if (!match) throw new Error(`Cannot normalize test filename: ${filename}`);
  return normalized.slice(match.index + 1);
}

function count(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function differences(left, right) {
  return [...new Set([...left.keys(), ...right.keys()])]
    .filter((key) => left.get(key) !== right.get(key))
    .map((key) => ({
      identity: JSON.parse(key),
      expected: left.get(key) ?? 0,
      actual: right.get(key) ?? 0,
    }));
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentChange(before, after) {
  return ((after - before) / before) * 100;
}

function recordKey(record) {
  return `${record.variant}/${record.count}/${record.iteration}/${record.shard}`;
}

export function analyzeBenchmark(directory) {
  const errors = [];
  const warnings = [];
  const records = new Map();
  const provenance = [];
  let filenames = [];
  try {
    filenames = metadataFiles(directory).sort();
  } catch (error) {
    errors.push(`Cannot read artifact directory: ${error.message}`);
  }
  if (filenames.length === 0)
    errors.push("No benchmark-<count>-<shard>.json artifacts found.");

  for (const filename of filenames) {
    let artifact;
    try {
      artifact = JSON.parse(readFileSync(filename, "utf8"));
    } catch (error) {
      errors.push(`Cannot read ${filename}: ${error.message}`);
      continue;
    }
    const label = path.relative(directory, filename);
    if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
      errors.push(`${label}: artifact must be an object.`);
      continue;
    }
    provenance.push({
      artifact: label,
      baseCommit: artifact.baseCommit,
      headCommit: artifact.headCommit,
      hardware: artifact.hardware,
    });
    if (artifact.parity?.equal !== true)
      errors.push(`${label}: runner parity check did not pass.`);
    if (!Array.isArray(artifact.records)) {
      errors.push(`${label}: records is not an array.`);
      continue;
    }

    for (const record of artifact.records) {
      if (!record || typeof record !== "object" || Array.isArray(record)) {
        errors.push(`${label}: run record must be an object.`);
        continue;
      }
      const key = recordKey(record);
      const allowed =
        [1, 2].includes(record.iteration) &&
        [2, 3].includes(record.count) &&
        Number.isInteger(record.shard) &&
        record.shard >= 1 &&
        record.shard <= record.count &&
        (record.variant === "candidate" ||
          (record.variant === "baseline" && record.count === 3));
      if (!allowed) {
        errors.push(`${label}: unexpected record ${key}.`);
        continue;
      }
      if (records.has(key)) {
        errors.push(`Duplicate run record: ${key}.`);
        continue;
      }
      const run = {
        ...record,
        artifact: label,
        files: [],
        identities: new Map(),
        statusIdentities: new Map(),
        counts: {
          tests: 0,
          ...Object.fromEntries(statuses.map((status) => [status, 0])),
        },
      };
      records.set(key, run);
      if (!Number.isFinite(record.elapsedSeconds) || record.elapsedSeconds <= 0)
        errors.push(`${key}: invalid process elapsedSeconds.`);
      if (record.exitCode !== 0 || record.valid !== true)
        errors.push(
          `${key}: runner did not report a valid successful process (exit ${record.exitCode}).`,
        );
      for (const dependency of ["vitest", "provider"]) {
        if (record.versions?.[dependency] !== expectedVersions[record.variant])
          errors.push(
            `${key}: expected ${dependency} ${expectedVersions[record.variant]}, got ${record.versions?.[dependency]}.`,
          );
      }

      try {
        if (
          typeof record.reportFile !== "string" ||
          path.basename(record.reportFile) !== record.reportFile
        )
          throw new Error(
            "reportFile must be a basename within its artifact directory",
          );
        const report = JSON.parse(
          readFileSync(
            path.join(path.dirname(filename), record.reportFile),
            "utf8",
          ),
        );
        if (!report || typeof report !== "object" || Array.isArray(report))
          throw new Error("raw Vitest report must be an object");
        if (report.success !== true)
          errors.push(`${key}: raw Vitest report success is not true.`);
        if (!Array.isArray(report.testResults))
          throw new Error("raw Vitest report has no testResults array");
        for (const file of report.testResults) {
          const name = relativeTestFile(file.name);
          if (run.files.includes(name))
            errors.push(`${key}: duplicate file result ${name}.`);
          run.files.push(name);
          if (!Array.isArray(file.assertionResults))
            throw new Error(`${name} has no assertionResults array`);
          const intentionallySkipped =
            file.status === "pending" &&
            file.assertionResults.length > 0 &&
            file.assertionResults.every((assertion) =>
              ["skipped", "todo", "disabled"].includes(assertion?.status),
            );
          if (file.status !== "passed" && !intentionallySkipped)
            errors.push(`${key}: file ${name} has status ${file.status}.`);
          for (const assertion of file.assertionResults) {
            if (
              !assertion ||
              typeof assertion.fullName !== "string" ||
              !statuses.includes(assertion.status)
            )
              throw new Error(
                `${name} contains an invalid assertion identity or status`,
              );
            count(run.identities, JSON.stringify([name, assertion.fullName]));
            count(
              run.statusIdentities,
              JSON.stringify([name, assertion.fullName, assertion.status]),
            );
            run.counts.tests++;
            run.counts[assertion.status]++;
          }
        }
        if (run.counts.tests === 0 || run.counts.failed || run.counts.pending)
          errors.push(`${key}: empty, failed or unfinished test inventory.`);
        if (record.fileCount !== run.files.length)
          errors.push(`${key}: metadata fileCount differs from raw report.`);
        for (const field of [
          "tests",
          "passed",
          "failed",
          "skipped",
          "pending",
          "todo",
        ]) {
          if (record.totals?.[field] !== run.counts[field])
            errors.push(
              `${key}: metadata ${field}=${record.totals?.[field]} differs from raw report ${run.counts[field]}.`,
            );
        }
        for (const [field, actual] of [
          ["numTotalTests", run.counts.tests],
          ["numPassedTests", run.counts.passed],
          ["numFailedTests", run.counts.failed],
          ["numTodoTests", run.counts.todo],
        ]) {
          if (report[field] !== actual)
            errors.push(
              `${key}: raw ${field}=${report[field]} differs from assertion inventory ${actual}.`,
            );
        }
      } catch (error) {
        errors.push(`${key}: cannot validate raw report: ${error.message}`);
      }
    }
  }

  for (const field of ["baseCommit", "headCommit"]) {
    const values = provenance.map((item) => item[field]);
    if (
      values.some((value) => typeof value !== "string" || !value) ||
      new Set(values).size > 1
    )
      errors.push(`Artifacts have missing or different ${field} values.`);
  }
  for (const field of [
    "node",
    "platform",
    "arch",
    "parallelism",
    "maxWorkers",
    "browser",
  ]) {
    const values = provenance.map((item) => item.hardware?.[field]);
    if (
      values.some(
        (value) => value === undefined || value === null || value === "",
      ) ||
      new Set(values).size > 1
    )
      errors.push(
        `Artifacts have missing or different hardware.${field} values.`,
      );
  }
  for (const dependency of ["vite", "playwright", "react", "reactDom"]) {
    const values = [...records.values()].map(
      (record) => record.versions?.[dependency],
    );
    if (
      values.some((value) => typeof value !== "string" || !value) ||
      new Set(values).size > 1
    )
      errors.push(`Runs have missing or different ${dependency} versions.`);
  }
  for (const dependency of ["react", "reactDom"]) {
    if (
      [...records.values()].some(
        (record) => !record.versions?.[dependency]?.startsWith("18."),
      )
    ) {
      errors.push(
        `This experiment requires React 18; unexpected ${dependency} version.`,
      );
    }
  }
  for (const field of [
    "cpuModel",
    "memoryBytes",
    "runnerImage",
    "runnerImageVersion",
  ]) {
    const values = [
      ...new Set(
        provenance
          .map((item) => item.hardware?.[field])
          .filter((value) => value !== undefined && value !== null),
      ),
    ];
    if (values.length > 1)
      warnings.push(
        `Runner ${field} differs across artifacts: ${values.join("; ")}. Qualify the comparison between two and three shards; the version comparison is paired within each three-shard runner.`,
      );
  }

  const groups = [];
  for (const [variant, shardCount] of [
    ["baseline", 3],
    ["candidate", 3],
    ["candidate", 2],
  ]) {
    for (const iteration of [1, 2]) {
      const shards = [];
      for (let shard = 1; shard <= shardCount; shard++) {
        const key = recordKey({ variant, count: shardCount, iteration, shard });
        const run = records.get(key);
        if (run) shards.push(run);
        else errors.push(`Missing required run: ${key}.`);
      }
      const files = new Map();
      const identities = new Map();
      const statusIdentities = new Map();
      const totals = {
        tests: 0,
        ...Object.fromEntries(statuses.map((status) => [status, 0])),
      };
      for (const run of shards) {
        for (const filename of run.files) {
          if (files.has(filename))
            errors.push(
              `${variant}/${shardCount}/${iteration}: ${filename} appears in shards ${files.get(filename)} and ${run.shard}.`,
            );
          files.set(filename, run.shard);
        }
        for (const [identity, amount] of run.identities)
          identities.set(identity, (identities.get(identity) ?? 0) + amount);
        for (const [identity, amount] of run.statusIdentities)
          statusIdentities.set(
            identity,
            (statusIdentities.get(identity) ?? 0) + amount,
          );
        for (const field of Object.keys(totals))
          totals[field] += run.counts[field];
      }
      const complete = shards.length === shardCount;
      const durations = shards.map((run) => run.elapsedSeconds);
      const measured =
        complete &&
        durations.every(
          (duration) => Number.isFinite(duration) && duration > 0,
        );
      groups.push({
        variant,
        shardCount,
        iteration,
        complete,
        fileCount: files.size,
        totals,
        slowestShardSeconds: measured ? Math.max(...durations) : null,
        totalProcessSeconds: measured
          ? durations.reduce((sum, duration) => sum + duration, 0)
          : null,
        shards: shards.map((run) => ({
          shard: run.shard,
          elapsedSeconds: run.elapsedSeconds,
          files: run.files.length,
          tests: run.counts.tests,
          versions: run.versions,
          artifact: run.artifact,
        })),
        files,
        identities,
        statusIdentities,
      });
    }
  }

  const reference = groups[0];
  const comparisons = [];
  for (const group of groups.slice(1)) {
    const identityDifferences = differences(
      reference.identities,
      group.identities,
    );
    const statusDifferences = differences(
      reference.statusIdentities,
      group.statusIdentities,
    );
    const fileDifferences = [
      ...new Set([...reference.files.keys(), ...group.files.keys()]),
    ].filter(
      (filename) => reference.files.has(filename) !== group.files.has(filename),
    );
    const sameAssignments =
      group.shardCount === reference.shardCount
        ? [...reference.files].every(
            ([filename, shard]) => group.files.get(filename) === shard,
          )
        : null;
    const equal =
      reference.complete &&
      group.complete &&
      identityDifferences.length === 0 &&
      statusDifferences.length === 0 &&
      fileDifferences.length === 0;
    const name = `${group.variant}/${group.shardCount}/${group.iteration}`;
    if (!equal)
      errors.push(
        `Inventory/status parity failed for ${name} against baseline/3/1 (${identityDifferences.length} identity, ${statusDifferences.length} status, ${fileDifferences.length} file differences).`,
      );
    if (sameAssignments === false)
      errors.push(
        `File-to-shard assignments changed for ${name} against baseline/3/1.`,
      );
    comparisons.push({
      group: name,
      equal,
      sameShardAssignments: sameAssignments,
      identityDifferenceCount: identityDifferences.length,
      identityExamples: identityDifferences.slice(0, 10),
      statusDifferenceCount: statusDifferences.length,
      statusExamples: statusDifferences.slice(0, 10),
      fileDifferenceCount: fileDifferences.length,
      fileExamples: fileDifferences.slice(0, 10),
    });
  }

  const averages = [];
  for (const [variant, shardCount] of [
    ["baseline", 3],
    ["candidate", 3],
    ["candidate", 2],
  ]) {
    const iterations = groups.filter(
      (group) => group.variant === variant && group.shardCount === shardCount,
    );
    const measured = iterations.every(
      (group) =>
        group.slowestShardSeconds !== null &&
        group.totalProcessSeconds !== null,
    );
    averages.push({
      variant,
      shardCount,
      iterations: iterations.length,
      meanSlowestShardSeconds: measured
        ? mean(iterations.map((group) => group.slowestShardSeconds))
        : null,
      meanTotalProcessSeconds: measured
        ? mean(iterations.map((group) => group.totalProcessSeconds))
        : null,
    });
  }
  const changes = [];
  for (const [before, after, label] of [
    [averages[0], averages[1], "Upgrade with three shards"],
    [averages[1], averages[2], "Candidate: two shards versus three"],
  ]) {
    if (
      before.meanSlowestShardSeconds !== null &&
      after.meanSlowestShardSeconds !== null
    )
      changes.push({
        label,
        slowestShardPercentChange: percentChange(
          before.meanSlowestShardSeconds,
          after.meanSlowestShardSeconds,
        ),
        totalProcessPercentChange: percentChange(
          before.meanTotalProcessSeconds,
          after.meanTotalProcessSeconds,
        ),
      });
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    expectedVersions,
    provenance,
    groups: groups.map(
      ({ files, identities, statusIdentities, ...group }) => group,
    ),
    parity: comparisons,
    averages,
    changes,
    caveat:
      "Measured with React 18 only. The 5.0.5 versus 5.1.1 comparison is paired within each three-shard runner; two versus three shards uses separate runners and may reflect CPU variation. Slowest shard process time is the maximum measured test-process duration in an iteration. Summed process time estimates test compute cost. Neither metric is actual GitHub workflow wall time; queueing, installs, builds and uploads are excluded. The runner clears dependency/results caches before each process and leaves within-run browser caching at each release's default. Source commits, browser, effective workers and unrelated dependency versions are checked for parity. Two iterations are indicative, not a statistical confidence claim.",
  };
}

export function toMarkdown(summary) {
  const seconds = (value) =>
    value === null ? "incomplete" : `${value.toFixed(2)}s`;
  const percent = (value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  const lines = [
    "# Vitest browser benchmark",
    "",
    `**Validation: ${summary.valid ? "passed" : "FAILED — do not treat these timings as an accepted comparison"}.**`,
    "",
    summary.caveat,
    "",
    "## Measured iterations",
    "",
    "| Version | Shards | Iteration | Files | Tests | Passed | Skipped | Todo | Slowest shard process | Sum of test processes |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];
  for (const group of summary.groups)
    lines.push(
      `| ${summary.expectedVersions[group.variant]} | ${group.shardCount} | ${group.iteration} | ${group.fileCount} | ${group.totals.tests} | ${group.totals.passed} | ${group.totals.skipped} | ${group.totals.todo} | ${seconds(group.slowestShardSeconds)} | ${seconds(group.totalProcessSeconds)} |`,
    );
  lines.push(
    "",
    "## Means of two iterations",
    "",
    "| Version | Shards | Mean slowest shard process | Mean sum of test processes |",
    "| --- | ---: | ---: | ---: |",
  );
  for (const row of summary.averages)
    lines.push(
      `| ${summary.expectedVersions[row.variant]} | ${row.shardCount} | ${seconds(row.meanSlowestShardSeconds)} | ${seconds(row.meanTotalProcessSeconds)} |`,
    );
  for (const change of summary.changes)
    lines.push(
      "",
      `- ${change.label}: slowest shard process ${percent(change.slowestShardPercentChange)}; summed test-process time ${percent(change.totalProcessPercentChange)}. Negative values mean less time.`,
    );
  lines.push(
    "",
    "## Inventory and status parity",
    "",
    "Compared with baseline 5.0.5, three shards, iteration 1. Duplicate assertion identities are counted as a multiset; duplicate file ownership across shards fails validation.",
    "",
    "| Comparison | Test/file/status parity | Same file-to-shard assignment |",
    "| --- | --- | --- |",
  );
  for (const row of summary.parity)
    lines.push(
      `| ${row.group} | ${row.equal ? "Pass" : "FAIL"} | ${row.sameShardAssignments === null ? "Different shard count" : row.sameShardAssignments ? "Yes" : "No"} |`,
    );
  if (summary.provenance.length) {
    const first = summary.provenance[0];
    lines.push(
      "",
      "## Source and environment",
      "",
      `- Base commit: \`${first.baseCommit}\``,
      `- Experiment commit: \`${first.headCommit}\``,
      `- Environment: \`${JSON.stringify(first.hardware)}\``,
      "- Exact dependency versions and every shard measurement are included in summary.json.",
    );
  }
  if (summary.errors.length) {
    lines.push("", "## Validation errors", "");
    for (const error of summary.errors)
      lines.push(`- ${error.replaceAll("\n", " ")}`);
    lines.push(
      "",
      "Inventory difference examples are included in summary.json.",
    );
  }
  if (summary.warnings.length) {
    lines.push("", "## Interpretation notes", "");
    for (const warning of summary.warnings)
      lines.push(`- ${warning.replaceAll("\n", " ")}`);
  }
  return `${lines.join("\n")}\n`;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const directory = path.resolve(process.argv[2] ?? "benchmark-artifacts");
  const summary = analyzeBenchmark(directory);
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    path.join(directory, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  writeFileSync(path.join(directory, "summary.md"), toMarkdown(summary));
  process.stdout.write(toMarkdown(summary));
  process.exitCode = summary.valid ? 0 : 1;
}
