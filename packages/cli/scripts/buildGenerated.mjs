import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(packageRoot, "..", "..");
const generatedDir = path.join(packageRoot, "generated");
const distPackageRoot = path.join(repoRoot, "dist", "salt-ds-semantic-core");
const buildEntryPath = path.join(
  distPackageRoot,
  "dist-cjs",
  "build",
  "buildRegistry.js",
);

async function ensureSemanticCoreBuild() {
  const result = spawnSync(
    "yarn",
    ["workspace", "@salt-ds/semantic-core", "build"],
    {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

await ensureSemanticCoreBuild();
await fs.rm(generatedDir, { recursive: true, force: true });
const { buildRegistry } = require(buildEntryPath);
await buildRegistry({
  sourceRoot: repoRoot,
  outputDir: generatedDir,
});
