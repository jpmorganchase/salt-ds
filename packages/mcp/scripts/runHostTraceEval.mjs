import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..", "..");
const builtEntryPath = path.join(
  repoRoot,
  "dist",
  "salt-ds-mcp",
  "dist-cjs",
  "mcp",
  "src",
  "evals",
  "runHostTraceEval.js",
);

const require = createRequire(import.meta.url);
const { runCli } = require(builtEntryPath);
const exitCode = await runCli(process.argv.slice(2));
process.exit(exitCode);
