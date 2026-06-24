#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const npmCache = path.join(repoRoot, "dist", ".npm-pack-cache");
const isWindows = process.platform === "win32";

const forbiddenPublishPathSegments = [
  "archive",
  "baselines",
  "docs",
  "eval-fixtures",
  "fixtures",
  "host-results",
  "replay-traces",
  "workflow-examples",
];

const packages = [
  {
    name: "@salt-ds/mcp",
    dir: "dist/salt-ds-mcp",
    requiredPaths: [
      "package.json",
      "README.md",
      "bin/salt-mcp.js",
      "generated",
      "schemas",
      "dist-cjs",
      "dist-es",
      "dist-types",
    ],
    expectedFilesField: [
      "bin",
      "generated",
      "schemas",
      "dist-cjs",
      "dist-es",
      "dist-types",
      "CHANGELOG.md",
    ],
  },
  {
    name: "@salt-ds/cli",
    dir: "dist/salt-ds-cli",
    requiredPaths: [
      "package.json",
      "README.md",
      "bin/salt-ds.js",
      "generated",
      "schemas",
      "dist-cjs",
      "dist-es",
    ],
    expectedFilesField: [
      "bin",
      "generated",
      "schemas",
      "dist-cjs",
      "dist-es",
      "CHANGELOG.md",
    ],
  },
];

function fail(message) {
  console.error(`AI tooling package dry-run check failed: ${message}`);
  process.exitCode = 1;
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function hasPath(paths, expectedPath) {
  return paths.some(
    (filePath) =>
      filePath === expectedPath || filePath.startsWith(`${expectedPath}/`),
  );
}

function assertBuiltManifest(packageConfig, packageDir) {
  const manifestPath = path.join(packageDir, "package.json");
  if (!existsSync(manifestPath)) {
    fail(`${packageConfig.name} is missing ${packageConfig.dir}/package.json`);
    return null;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.name !== packageConfig.name) {
    fail(
      `${packageConfig.dir}/package.json has name ${manifest.name}, expected ${packageConfig.name}`,
    );
  }

  const files = manifest.files ?? [];
  if (
    JSON.stringify(files) !== JSON.stringify(packageConfig.expectedFilesField)
  ) {
    fail(
      `${packageConfig.name} built files field changed: ${JSON.stringify(files)}`,
    );
  }

  return manifest;
}

function runPackDryRun(packageConfig, packageDir) {
  const npmArgs = ["pack", "--dry-run", "--json", packageDir];
  const command = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "npm";
  const args = isWindows ? ["/d", "/s", "/c", "npm", ...npmArgs] : npmArgs;
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: npmCache,
    },
  });

  if (result.error) {
    fail(`${packageConfig.name} npm pack could not start: ${result.error}`);
    return null;
  }

  if (result.status !== 0) {
    fail(
      `${packageConfig.name} npm pack failed with exit ${result.status}\n${result.stderr}${result.stdout}`,
    );
    return null;
  }

  try {
    const parsed = JSON.parse(result.stdout);
    const packed = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!packed || typeof packed !== "object") {
      fail(`${packageConfig.name} npm pack returned no package metadata`);
      return null;
    }
    return packed;
  } catch (error) {
    fail(`${packageConfig.name} npm pack returned invalid JSON: ${error}`);
    return null;
  }
}

for (const packageConfig of packages) {
  const packageDir = path.join(repoRoot, packageConfig.dir);
  if (!existsSync(packageDir)) {
    fail(
      `${packageConfig.dir} does not exist. Run yarn build before this check.`,
    );
    continue;
  }

  assertBuiltManifest(packageConfig, packageDir);
  const packed = runPackDryRun(packageConfig, packageDir);
  if (!packed) {
    continue;
  }

  if (packed.name !== packageConfig.name) {
    fail(`${packageConfig.dir} packed as ${packed.name}`);
  }

  const paths = (packed.files ?? []).map((file) => normalizePath(file.path));
  if (paths.length === 0) {
    fail(`${packageConfig.name} dry-run returned no packed files`);
  }

  for (const requiredPath of packageConfig.requiredPaths) {
    if (!hasPath(paths, requiredPath)) {
      fail(`${packageConfig.name} pack is missing ${requiredPath}`);
    }
  }

  for (const filePath of paths) {
    const segments = filePath.split("/");
    const forbiddenSegment = forbiddenPublishPathSegments.find((segment) =>
      segments.includes(segment),
    );
    if (forbiddenSegment) {
      fail(
        `${packageConfig.name} pack includes forbidden ${forbiddenSegment} payload: ${filePath}`,
      );
    }
  }

  console.log(
    `${packageConfig.name}: ${packed.entryCount} files, ${packed.unpackedSize} unpacked bytes`,
  );
}

if (process.exitCode) {
  process.exit(process.exitCode);
}
