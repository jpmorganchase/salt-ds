import fs from "node:fs/promises";
import path from "node:path";
import {
  evaluateHostTrace,
  type HostTraceCriticalFailure,
  type HostTraceEvalReport,
} from "./hostTraceEval.js";

interface ParsedArgs {
  trace_patterns: string[];
  json: boolean;
  fail_on_critical: boolean;
}

interface HostTraceFileReport {
  path: string;
  passed: boolean;
  critical_failures: HostTraceCriticalFailure[];
  observations: string[];
  tool_call_count: number;
  workflow_contract_count: number;
}

interface HostTraceEvalCliReport {
  passed: boolean;
  traces: HostTraceFileReport[];
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    trace_patterns: [],
    json: false,
    fail_on_critical: true,
  };

  for (const token of argv) {
    if (token === "--json") {
      parsed.json = true;
      continue;
    }

    if (token === "--no-fail") {
      parsed.fail_on_critical = false;
      continue;
    }

    parsed.trace_patterns.push(token);
  }

  if (parsed.trace_patterns.length === 0) {
    parsed.trace_patterns.push("chat-*.json");
  }

  return parsed;
}

function globPatternToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`, "i");
}

async function resolveTracePattern(pattern: string): Promise<string[]> {
  if (!pattern.includes("*")) {
    return [path.resolve(process.cwd(), pattern)];
  }

  const absolutePattern = path.resolve(process.cwd(), pattern);
  const directory = path.dirname(absolutePattern);
  const basename = path.basename(absolutePattern);
  const matcher = globPatternToRegExp(basename);
  const entries = await fs.readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && matcher.test(entry.name))
    .map((entry) => path.join(directory, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

async function resolveTracePaths(patterns: string[]): Promise<string[]> {
  const paths = (
    await Promise.all(patterns.map((pattern) => resolveTracePattern(pattern)))
  ).flat();

  return [...new Set(paths)].sort((left, right) => left.localeCompare(right));
}

function buildFileReport(
  tracePath: string,
  report: HostTraceEvalReport,
): HostTraceFileReport {
  return {
    path: tracePath,
    passed: report.passed,
    critical_failures: report.critical_failures,
    observations: report.observations,
    tool_call_count: report.tool_calls.length,
    workflow_contract_count: report.workflow_contracts.length,
  };
}

function formatTextReport(report: HostTraceEvalCliReport): string {
  const lines: string[] = [];

  for (const trace of report.traces) {
    lines.push(`${trace.passed ? "PASS" : "FAIL"} ${trace.path}`);
    lines.push(
      `  tool_calls=${trace.tool_call_count} workflow_contracts=${trace.workflow_contract_count} critical_failures=${trace.critical_failures.length}`,
    );

    for (const observation of trace.observations) {
      lines.push(`  observation: ${observation}`);
    }

    for (const failure of trace.critical_failures) {
      lines.push(
        `  ${failure.code}${failure.tool_id ? ` (${failure.tool_id})` : ""}: ${failure.message}`,
      );
    }
  }

  lines.push(report.passed ? "Trace eval passed." : "Trace eval failed.");
  return `${lines.join("\n")}\n`;
}

async function evaluateTracePath(
  tracePath: string,
): Promise<HostTraceFileReport> {
  const raw = await fs.readFile(tracePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  return buildFileReport(tracePath, evaluateHostTrace(parsed));
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
): Promise<number> {
  const parsed = parseArgs(argv);
  const tracePaths = await resolveTracePaths(parsed.trace_patterns);

  if (tracePaths.length === 0) {
    process.stderr.write("No trace files matched.\n");
    return 1;
  }

  const report: HostTraceEvalCliReport = {
    traces: await Promise.all(tracePaths.map(evaluateTracePath)),
    passed: true,
  };
  report.passed = report.traces.every((trace) => trace.passed);

  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(formatTextReport(report));
  }

  return report.passed || !parsed.fail_on_critical ? 0 : 1;
}
