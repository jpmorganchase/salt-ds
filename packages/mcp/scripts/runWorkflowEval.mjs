import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..", "..");
const builtEntryPath = path.join(
  repoRoot,
  "dist",
  "salt-ds-mcp",
  "dist-es",
  "mcp",
  "src",
  "evals",
  "runWorkflowEval.js",
);

const { runCli } = await import(pathToFileURL(builtEntryPath).href);
const exitCode = await runCli(process.argv.slice(2));
process.exit(exitCode);
