import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Convert a Vitest JSON report into one row per test file. */
export function extractFileTimings(report, cwd = process.cwd()) {
  if (!Array.isArray(report.testResults)) {
    throw new TypeError("Expected Vitest JSON report with testResults array");
  }

  return report.testResults
    .map((result) => {
      const assertions = result.assertionResults ?? [];
      const durationMs =
        Number.isFinite(result.startTime) && Number.isFinite(result.endTime)
          ? Math.max(0, result.endTime - result.startTime)
          : null;

      return {
        file: path.isAbsolute(result.name)
          ? path.relative(cwd, result.name)
          : result.name,
        durationMs,
        tests: assertions.length,
        passed: assertions.filter((test) => test.status === "passed").length,
        failed: assertions.filter((test) => test.status === "failed").length,
        skipped: assertions.filter(
          (test) => test.status === "pending" || test.status === "todo",
        ).length,
      };
    })
    .sort(
      (a, b) =>
        (b.durationMs ?? -1) - (a.durationMs ?? -1) ||
        a.file.localeCompare(b.file),
    );
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function toCsv(files) {
  const rows = ["file,duration_ms,tests,passed,failed,skipped"];
  for (const file of files) {
    rows.push(
      [
        escapeCsv(file.file),
        file.durationMs ?? "",
        file.tests,
        file.passed,
        file.failed,
        file.skipped,
      ].join(","),
    );
  }
  return `${rows.join("\n")}\n`;
}

export function toMarkdown(files) {
  const timed = files.filter((file) => file.durationMs !== null);
  const lines = [
    "## Slowest browser test files",
    "",
    "| File | Elapsed | Tests |",
    "| --- | ---: | ---: |",
  ];
  for (const file of timed.slice(0, 10)) {
    const seconds = (file.durationMs / 1000).toFixed(2);
    lines.push(
      `| \`${file.file.replaceAll("|", "\\|")}\` | ${seconds}s | ${file.tests} |`,
    );
  }
  if (timed.length === 0) {
    lines.push("| No file timings found | — | — |");
  }
  lines.push(
    "",
    `Measured ${timed.length}/${files.length} files. File elapsed times overlap across workers; do not add them to estimate shard duration.`,
    "",
  );
  return lines.join("\n");
}

// This script deliberately runs after Vitest; it must not alter test outcomes.
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const reportPath = process.argv[2] ?? ".vitest/browser-test-results.json";
  const files = extractFileTimings(
    JSON.parse(readFileSync(reportPath, "utf8")),
  );
  const csvPath = path.join(
    path.dirname(reportPath),
    "browser-file-timings.csv",
  );
  writeFileSync(csvPath, toCsv(files));

  const summary = toMarkdown(files);
  process.stdout.write(summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}
