import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectRuntimeReachableFiles } from "../packages/mcp/scripts/measureRuntimeReachableLoc.mjs";
import { canonicalizeSkillRecords } from "./consumer-smoke/skillTreeHash.mjs";

const modulePath = fileURLToPath(import.meta.url);
const defaultRepoRoot = path.resolve(path.dirname(modulePath), "..");

export const PHASE5_RUNTIME_CAPABILITY_LOCK_PATH =
  "packages/mcp/eval-fixtures/phase5/runtime-capability-lock.json";

export function buildPhase5RuntimeCapabilityLock(repoRoot = defaultRepoRoot) {
  const sourceRoot = path.join(repoRoot, "packages/mcp/src");
  const entrypoint = path.join(sourceRoot, "index.ts");
  const files = canonicalizeSkillRecords(
    collectRuntimeReachableFiles(sourceRoot, [entrypoint]).map((filePath) => ({
      path: path.relative(repoRoot, filePath).split(path.sep).join("/"),
      bytes: fs.readFileSync(filePath),
    })),
  ).records.map(({ path: filePath, sha256 }) => ({ path: filePath, sha256 }));

  return {
    contract: "salt_phase5_runtime_capability_lock_v1",
    entrypoints: ["packages/mcp/src/index.ts"],
    phase6_exceptions: [],
    files,
  };
}

export function renderPhase5RuntimeCapabilityLock(repoRoot = defaultRepoRoot) {
  return `${JSON.stringify(buildPhase5RuntimeCapabilityLock(repoRoot), null, 2)}\n`;
}

export function assertPhase5RuntimeCapabilityLockBytes(
  actual,
  repoRoot = defaultRepoRoot,
) {
  if (actual !== renderPhase5RuntimeCapabilityLock(repoRoot)) {
    throw new Error(
      `${PHASE5_RUNTIME_CAPABILITY_LOCK_PATH} does not match the current runtime capability graph.`,
    );
  }
}

function runCli(argv) {
  const outputPath = path.join(
    defaultRepoRoot,
    PHASE5_RUNTIME_CAPABILITY_LOCK_PATH,
  );
  if (argv.includes("--write")) {
    throw new Error(
      `Refusing to overwrite ${path.relative(defaultRepoRoot, outputPath)}. Use the guarded Phase 5 candidate rebind command.`,
    );
  }
  if (argv.length === 0) {
    process.stdout.write(renderPhase5RuntimeCapabilityLock());
    return;
  }
  if (argv.length === 1 && argv[0] === "--check") {
    const actual = fs.readFileSync(outputPath, "utf8");
    assertPhase5RuntimeCapabilityLockBytes(actual);
    process.stdout.write(
      `${PHASE5_RUNTIME_CAPABILITY_LOCK_PATH} matches the current runtime capability graph.\n`,
    );
    return;
  }
  throw new Error(
    `Unknown runtime capability lock argument: ${argv.join(" ")}`,
  );
}

if (path.resolve(process.argv[1] ?? "") === path.resolve(modulePath)) {
  runCli(process.argv.slice(2));
}
