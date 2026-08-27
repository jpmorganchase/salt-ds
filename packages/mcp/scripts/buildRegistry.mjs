import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const knowledgeBuild = path.resolve(
  scriptDir,
  "../../knowledge/scripts/buildKnowledge.mjs",
);
const result = spawnSync(
  process.execPath,
  [knowledgeBuild, ...process.argv.slice(2)],
  { stdio: "inherit" },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
