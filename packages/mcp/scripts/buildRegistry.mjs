import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

// Single canonical builder for the Salt registry. The TypeScript builder is
// bundled to a short-lived module beside this package so its external imports
// resolve against @salt-ds/mcp's declared dependencies. The generated registry
// is then written directly into the MCP package for runtime and publishing.

const REQUIRED_PROP_FILES = [
  "ag-grid-theme-props.json",
  "core-props.json",
  "countries-props.json",
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

async function getRepoYarnCliPath(repoRoot) {
  const yarnConfig = await fs.readFile(
    path.join(repoRoot, ".yarnrc.yml"),
    "utf8",
  );
  const configuredPath = yarnConfig
    .match(/^yarnPath:\s*([^#\r\n]+)/mu)?.[1]
    ?.trim()
    .replace(/^(["'])(.*)\1$/u, "$2");
  if (!configuredPath) {
    throw new Error(".yarnrc.yml is missing a valid yarnPath entry.");
  }

  const yarnCliPath = path.resolve(repoRoot, configuredPath);
  if (!(await pathExists(yarnCliPath))) {
    throw new Error(`Configured Yarn CLI does not exist: ${yarnCliPath}`);
  }
  return yarnCliPath;
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

  const yarnCliPath = await getRepoYarnCliPath(repoRoot);
  const result = spawnSync(
    process.execPath,
    [yarnCliPath, "workspace", "@salt-ds/site", "gen:snapshot"],
    { cwd: repoRoot, stdio: "inherit", env: process.env },
  );
  if (result.error) {
    throw new Error(
      `Failed to launch Salt site artifact generation: ${result.error.message}`,
      { cause: result.error },
    );
  }
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
const builderEntryPath = path.join(
  packageRoot,
  "src",
  "core",
  "build",
  "buildRegistry.ts",
);
const temporaryBuildDir = await fs.mkdtemp(
  path.join(packageRoot, ".registry-build-"),
);
const bundledBuilderPath = path.join(temporaryBuildDir, "buildRegistry.mjs");

try {
  await build({
    entryPoints: [builderEntryPath],
    outfile: bundledBuilderPath,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    packages: "external",
    sourcemap: false,
    logLevel: "silent",
  });

  await ensureSiteBuildInputs(repoRoot);

  const outputDir = path.join(packageRoot, "generated");
  await fs.rm(outputDir, { recursive: true, force: true });

  const builderUrl = pathToFileURL(bundledBuilderPath);
  builderUrl.searchParams.set("cacheBust", `${Date.now()}`);
  const { buildRegistry } = await import(builderUrl.href);
  const registry = await buildRegistry({
    sourceRoot: repoRoot,
    outputDir,
  });

  console.error(
    `Built registry at ${outputDir}: ${registry.packages.length} packages, ${registry.components.length} components, ${registry.icons.length} icons, ${registry.country_symbols.length} country symbols, ${registry.patterns.length} patterns, ${registry.tokens.length} tokens.`,
  );
} finally {
  await fs.rm(temporaryBuildDir, { recursive: true, force: true });
}
