/**
 * salt-eval-grade: one-shot (`salt-eval-grade request.json`, or a request on stdin) or
 * `--serve`, which answers one JSON line per request line until stdin closes. The first
 * line in serve mode is `{"ready": true, ...}` so the caller knows when to start sending.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { Environment, gradeRequest } from "./grade";
import { type GraderResult, ProtocolError, parseRequest } from "./protocol";
import { buildRegistry } from "./registry/build";

const PROTOCOL_VERSION = 1;
const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const DEFAULT_REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");

function environmentFromArgs(values: {
  repo?: string;
  "fixtures-dir"?: string;
  "cache-dir"?: string;
  "salt-types"?: string;
}): Environment {
  const repoRoot = path.resolve(values.repo ?? DEFAULT_REPO_ROOT);
  const saltTypes = values["salt-types"] ?? "src";
  if (saltTypes !== "src" && saltTypes !== "dist") {
    throw new Error("--salt-types must be src or dist");
  }
  return new Environment({
    repoRoot,
    fixturesDir: path.resolve(
      values["fixtures-dir"] ?? path.join(repoRoot, "salt-eval", "fixtures"),
    ),
    cacheDir: path.resolve(
      values["cache-dir"] ?? path.join(repoRoot, "salt-eval", ".work"),
    ),
    saltTypes,
  });
}

function gradeLine(line: string, environment: Environment): GraderResult {
  let raw: unknown;
  try {
    raw = JSON.parse(line);
  } catch (error) {
    return { id: "", error: `request is not valid JSON: ${String(error)}` };
  }
  const id =
    typeof raw === "object" &&
    raw !== null &&
    typeof (raw as { id?: unknown }).id === "string"
      ? (raw as { id: string }).id
      : "";
  try {
    return gradeRequest(parseRequest(raw), environment);
  } catch (error) {
    if (error instanceof ProtocolError) {
      return { id, error: error.message };
    }
    return {
      id,
      error: `grader crashed: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`,
    };
  }
}

async function serve(environment: Environment): Promise<void> {
  process.stdout.write(
    `${JSON.stringify({ ready: true, protocol: PROTOCOL_VERSION, pid: process.pid })}\n`,
  );
  const lines = createInterface({
    input: process.stdin,
    crlfDelay: Number.POSITIVE_INFINITY,
  });
  for await (const line of lines) {
    if (line.trim().length === 0) continue;
    process.stdout.write(`${JSON.stringify(gradeLine(line, environment))}\n`);
  }
}

export async function main(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      serve: { type: "boolean", default: false },
      "build-registry": { type: "boolean", default: false },
      repo: { type: "string" },
      "fixtures-dir": { type: "string" },
      "cache-dir": { type: "string" },
      "salt-types": { type: "string" },
    },
  });
  const environment = environmentFromArgs(values);
  if (values["build-registry"]) {
    process.stdout.write(
      `${JSON.stringify(buildRegistry(environment.options.repoRoot), null, 2)}\n`,
    );
    return;
  }
  if (values.serve) {
    await serve(environment);
    return;
  }
  const input = positionals[0]
    ? readFileSync(positionals[0], "utf8")
    : readFileSync(0, "utf8");
  const result = gradeLine(input, environment);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if ("error" in result) process.exitCode = 1;
}
