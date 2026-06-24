import fs from "node:fs/promises";
import path from "node:path";
import {
  buildWorkflowEvalReplayJsonReport,
  runWorkflowEvalReplayReport,
} from "./workflowEvalReplay.js";

interface ParsedArgs {
  replay_paths: string[];
  json_out: string | null;
  repo_root: string;
  replay_dir: string;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    replay_paths: [],
    json_out: null,
    repo_root: process.cwd(),
    replay_dir: path.resolve(
      process.cwd(),
      "packages",
      "mcp",
      "eval-fixtures",
      "replays",
    ),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--replay" && next) {
      parsed.replay_paths.push(path.resolve(process.cwd(), next));
      index += 1;
      continue;
    }

    if (token === "--json-out" && next) {
      parsed.json_out = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (token === "--repo-root" && next) {
      parsed.repo_root = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (token === "--replay-dir" && next) {
      parsed.replay_dir = path.resolve(process.cwd(), next);
      index += 1;
    }
  }

  return parsed;
}

async function resolveReplayPaths(parsed: ParsedArgs): Promise<string[]> {
  if (parsed.replay_paths.length > 0) {
    return parsed.replay_paths;
  }

  const entries = await fs.readdir(parsed.replay_dir, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(parsed.replay_dir, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
): Promise<number> {
  const parsed = parseArgs(argv);
  const replayPaths = await resolveReplayPaths(parsed);
  const report = await runWorkflowEvalReplayReport(replayPaths);
  const json = buildWorkflowEvalReplayJsonReport(report);

  if (parsed.json_out) {
    await fs.mkdir(path.dirname(parsed.json_out), { recursive: true });
    await fs.writeFile(parsed.json_out, json);
  }

  process.stdout.write(`${json}\n`);
  return report.passed ? 0 : 1;
}
