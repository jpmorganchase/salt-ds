import fs from "node:fs/promises";
import path from "node:path";
import {
  buildWorkflowEvalJsonReport,
  type EvalTransport,
  runWorkflowEvalScenarios,
  WORKFLOW_LOCAL_EVAL_RUNNERS,
} from "./workflowEvalHarness.js";
import {
  buildDefaultWorkflowEvalScenarios,
  filterWorkflowEvalScenarios,
} from "./workflowEvalScenarios.js";

interface ParsedArgs {
  runner_ids: string[];
  scenario_ids: string[];
  json_out: string | null;
  registry_dir: string;
  repo_root: string;
  include_tags: string[];
  exclude_tags: string[];
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    runner_ids: [],
    scenario_ids: [],
    json_out: null,
    registry_dir: path.resolve(process.cwd(), "packages", "mcp", "generated"),
    repo_root: process.cwd(),
    include_tags: ["default"],
    exclude_tags: ["planned"],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--runner" && next) {
      parsed.runner_ids.push(next);
      index += 1;
      continue;
    }

    if (token === "--scenario" && next) {
      parsed.scenario_ids.push(next);
      index += 1;
      continue;
    }

    if (token === "--json-out" && next) {
      parsed.json_out = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (token === "--registry-dir" && next) {
      parsed.registry_dir = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (token === "--repo-root" && next) {
      parsed.repo_root = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (token === "--include-tag" && next) {
      parsed.include_tags.push(next);
      index += 1;
      continue;
    }

    if (token === "--exclude-tag" && next) {
      parsed.exclude_tags.push(next);
      index += 1;
    }
  }

  if (parsed.scenario_ids.length > 0) {
    parsed.include_tags = [];
  }

  return parsed;
}

function toEnabledTransports(runnerIds: string[]): EvalTransport[] {
  const transports = new Set<EvalTransport>();
  for (const runnerId of runnerIds) {
    if (runnerId.startsWith("mcp")) {
      transports.add("mcp");
    }
    if (runnerId.startsWith("cli")) {
      transports.add("cli");
    }
  }

  return transports.size > 0 ? [...transports] : ["mcp", "cli"];
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
): Promise<number> {
  const parsed = parseArgs(argv);
  const scenarios = filterWorkflowEvalScenarios(
    buildDefaultWorkflowEvalScenarios({
      fixture_base_dir: path.join(
        parsed.repo_root,
        "packages",
        "mcp",
        "eval-fixtures",
      ),
    }),
    {
      scenario_ids: parsed.scenario_ids,
      include_tags: parsed.include_tags,
      exclude_tags: parsed.exclude_tags,
    },
  );

  const runners =
    parsed.runner_ids.length > 0
      ? WORKFLOW_LOCAL_EVAL_RUNNERS.filter((runner) =>
          parsed.runner_ids.includes(runner.id),
        )
      : WORKFLOW_LOCAL_EVAL_RUNNERS;
  const report = await runWorkflowEvalScenarios(scenarios, {
    runners,
    enabled_transports: toEnabledTransports(parsed.runner_ids),
    context: {
      registry_dir: parsed.registry_dir,
      repo_root: parsed.repo_root,
    },
  });
  const json = buildWorkflowEvalJsonReport(report);

  if (parsed.json_out) {
    await fs.mkdir(path.dirname(parsed.json_out), { recursive: true });
    await fs.writeFile(parsed.json_out, json);
  }

  process.stdout.write(`${json}\n`);
  return report.passed ? 0 : 1;
}
