import fs from "node:fs/promises";
import path from "node:path";
import {
  buildEvidenceSprintJsonReport,
  runEvidenceSprint,
} from "./evidenceSprint.js";

interface ParsedArgs {
  fixture_dir: string | null;
  json_out: string | null;
  registry_dir: string | null;
  repo_root: string;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    fixture_dir: null,
    json_out: null,
    registry_dir: null,
    repo_root: process.cwd(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--fixture-dir" && next) {
      parsed.fixture_dir = path.resolve(process.cwd(), next);
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
    }
  }

  return parsed;
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
): Promise<number> {
  const parsed = parseArgs(argv);
  const report = await runEvidenceSprint({
    fixtureDir: parsed.fixture_dir ?? undefined,
    registryDir: parsed.registry_dir ?? undefined,
    repoRoot: parsed.repo_root,
  });
  const json = buildEvidenceSprintJsonReport(report);

  if (parsed.json_out) {
    await fs.mkdir(path.dirname(parsed.json_out), { recursive: true });
    await fs.writeFile(parsed.json_out, json);
  }

  process.stdout.write(`${json}\n`);
  return report.passed ? 0 : 1;
}
