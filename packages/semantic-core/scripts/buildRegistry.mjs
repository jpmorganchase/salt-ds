import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Single canonical builder for the Salt registry. Writes one
// `packages/semantic-core/generated/` bundle that mcp + cli both consume
// at runtime (via the semantic-core default registry path) and that the
// publish flow bundles into each downstream package's tarball via
// `publishBundledWorkspaceDependencies`.
//
// Previously each of packages/mcp/scripts/buildRegistry.mjs and
// packages/cli/scripts/buildGenerated.mjs maintained its own ~25 MB copy
// in packages/{mcp,cli}/generated/ that was rebuilt independently. That
// duplication is gone.

const REQUIRED_PROP_FILES = [
  "ag-grid-theme-props.json",
  "core-props.json",
  "countries-props.json",
  "data-grid-props.json",
  "embla-carousel-props.json",
  "icons-props.json",
  "lab-props.json",
  "react-resizable-panel-theme-props.json",
];

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function getMissingSiteInputs(repoRoot) {
  const missing = [];
  const searchDataPath = path.join(
    repoRoot,
    "site",
    "public",
    "search-data.json",
  );
  const snapshotRoot = path.join(
    repoRoot,
    "site",
    "snapshots",
    "latest",
    "salt",
  );
  const propsDir = path.join(repoRoot, "site", "src", "props");

  if (!(await pathExists(searchDataPath))) missing.push(searchDataPath);
  if (!(await pathExists(snapshotRoot))) missing.push(snapshotRoot);
  for (const fileName of REQUIRED_PROP_FILES) {
    const filePath = path.join(propsDir, fileName);
    if (!(await pathExists(filePath))) missing.push(filePath);
  }
  return missing;
}

async function ensureSiteBuildInputs(repoRoot) {
  const missingBefore = await getMissingSiteInputs(repoRoot);
  if (missingBefore.length === 0) return;

  console.error(
    "Missing Salt site artifacts required for registry build. Regenerating with `yarn workspace @salt-ds/site gen:snapshot`.",
  );
  await fs.rm(path.join(repoRoot, "site", "snapshots", "latest"), {
    recursive: true,
    force: true,
  });
  await fs.rm(path.join(repoRoot, "site", "public", "search-data.json"), {
    force: true,
  });

  const command = process.platform === "win32" ? "yarn.cmd" : "yarn";
  const result = spawnSync(
    command,
    ["workspace", "@salt-ds/site", "gen:snapshot"],
    { cwd: repoRoot, stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) {
    throw new Error("Failed to generate required Salt site artifacts.");
  }

  const missingAfter = await getMissingSiteInputs(repoRoot);
  if (missingAfter.length > 0) {
    throw new Error(
      `Salt site artifact generation completed, but required inputs are still missing:\n${missingAfter.join("\n")}`,
    );
  }
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(packageRoot, "..", "..");
const distPackageRoot = path.join(repoRoot, "dist", "salt-ds-semantic-core");
const buildEntryPath = path.join(
  distPackageRoot,
  "dist-cjs",
  "build",
  "buildRegistry.js",
);

try {
  await fs.access(buildEntryPath);
} catch {
  throw new Error(
    "Missing built @salt-ds/semantic-core buildRegistry output. The package script `build:package` must run before `build:registry`.",
  );
}

await ensureSiteBuildInputs(repoRoot);

const outputDir = path.join(packageRoot, "generated");
await fs.rm(outputDir, { recursive: true, force: true });

const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);
const { buildRegistry } = require(buildEntryPath);
const registry = await buildRegistry({
  sourceRoot: repoRoot,
  outputDir,
});

console.error(
  `Built registry at ${outputDir}: ${registry.packages.length} packages, ${registry.components.length} components, ${registry.icons.length} icons, ${registry.country_symbols.length} country symbols, ${registry.patterns.length} patterns, ${registry.tokens.length} tokens.`,
);
