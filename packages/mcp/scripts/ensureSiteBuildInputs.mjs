import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

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

async function getMissingInputs(repoRoot) {
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

  if (!(await pathExists(searchDataPath))) {
    missing.push(searchDataPath);
  }
  if (!(await pathExists(snapshotRoot))) {
    missing.push(snapshotRoot);
  }

  for (const fileName of REQUIRED_PROP_FILES) {
    const filePath = path.join(propsDir, fileName);
    if (!(await pathExists(filePath))) {
      missing.push(filePath);
    }
  }

  return missing;
}

function runYarnGenSnapshot(repoRoot) {
  const command = process.platform === "win32" ? "yarn.cmd" : "yarn";
  const result = spawnSync(
    command,
    ["workspace", "@salt-ds/site", "gen:snapshot"],
    {
      cwd: repoRoot,
      stdio: "inherit",
      env: process.env,
    },
  );

  if (result.status !== 0) {
    throw new Error("Failed to generate required Salt site artifacts for MCP.");
  }
}

export async function ensureSiteBuildInputs(repoRoot) {
  const missingBefore = await getMissingInputs(repoRoot);
  if (missingBefore.length === 0) {
    return;
  }

  console.error(
    "Missing Salt site artifacts required for MCP registry build. Regenerating with `yarn workspace @salt-ds/site gen:snapshot`.",
  );

  await fs.rm(path.join(repoRoot, "site", "snapshots", "latest"), {
    recursive: true,
    force: true,
  });
  await fs.rm(path.join(repoRoot, "site", "public", "search-data.json"), {
    force: true,
  });

  runYarnGenSnapshot(repoRoot);

  const missingAfter = await getMissingInputs(repoRoot);
  if (missingAfter.length > 0) {
    throw new Error(
      `Salt site artifact generation completed, but required MCP inputs are still missing:\n${missingAfter.join("\n")}`,
    );
  }
}
