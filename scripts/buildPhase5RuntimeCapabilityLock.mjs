import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectRuntimeReachableFiles } from "../packages/mcp/scripts/measureRuntimeReachableLoc.mjs";
import { canonicalizeSkillRecords } from "./consumer-smoke/skillTreeHash.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceRoot = path.join(repoRoot, "packages/mcp/src");
const entrypoint = path.join(sourceRoot, "index.ts");
const outputPath = path.join(
  repoRoot,
  "packages/mcp/eval-fixtures/phase5/runtime-capability-lock.json",
);

const files = canonicalizeSkillRecords(
  collectRuntimeReachableFiles(sourceRoot, [entrypoint]).map((filePath) => ({
    path: path.relative(repoRoot, filePath).split(path.sep).join("/"),
    bytes: fs.readFileSync(filePath),
  })),
).records.map(({ path: filePath, sha256 }) => ({ path: filePath, sha256 }));

const lock = {
  contract: "salt_phase5_runtime_capability_lock_v1",
  entrypoints: ["packages/mcp/src/index.ts"],
  phase6_exceptions: [],
  files,
};

if (process.argv.includes("--write")) {
  throw new Error(
    `Refusing to overwrite ${path.relative(repoRoot, outputPath)}. Runtime capability changes require a separately reviewed, digest-bound Phase 6 superiority report.`,
  );
}
process.stdout.write(`${JSON.stringify(lock, null, 2)}\n`);
