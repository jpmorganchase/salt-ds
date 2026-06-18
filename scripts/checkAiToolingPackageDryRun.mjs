#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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
  "evals",
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
      "dist-cjs",
      "dist-es",
      "dist-types",
    ],
    expectedFilesField: [
      "bin",
      "generated",
      "dist-cjs",
      "dist-es",
      "dist-types",
    ],
    allowedTopLevelPaths: [
      "LICENSE",
      "README.md",
      "bin",
      "dist-cjs",
      "dist-es",
      "dist-types",
      "generated",
      "package.json",
    ],
    expectedGeneratedFiles: [
      "components.json",
      "create-retrieval-index.jsonl",
      "deprecations.json",
      "examples.json",
      "guides.json",
      "icons-lite.json",
      "metadata.json",
      "packages.json",
      "page-search-index.json",
      "pages.json",
      "pattern-validation-rules.json",
      "patterns.json",
      "token-policy-structural-role-rules.json",
      "tokens.json",
    ],
    forbiddenGeneratedFiles: [
      "changes.json",
      "country-symbols.json",
      "icons.json",
      "search-index.jsonl",
    ],
    maxPackageBytes: 3_000_000,
    maxUnpackedBytes: 24_000_000,
    maxGeneratedBytes: 20_000_000,
    maxSourceMapBytes: 0,
    maxEntryCount: 300,
  },
];

const publicSurfacePaths = [
  "packages/mcp/README.md",
  "packages/mcp/src/server/registerResources.ts",
  "packages/mcp/src/server/serverMetadata.ts",
  "packages/mcp/src/server/toolDefinitions.ts",
  "packages/skills/AGENTS.md",
  "packages/skills/salt-ds/SKILL.md",
  "packages/skills/salt-ds/references/core.md",
  "packages/skills/salt-ds/references/create.md",
  "packages/skills/salt-ds/references/migrate.md",
  "packages/skills/salt-ds/references/review.md",
  "scripts/consumer-smoke/checks.mjs",
  "workflow-examples/consumer-repo/AGENTS.md",
  "workflow-examples/consumer-repo/README.md",
  "workflow-examples/consumer-repo/mcp.config.example.json",
  "workflow-examples/consumer-repo/package.json",
];

const publicSurfaceDirectories = [
  "packages/mcp/src/__tests__/fixtures/public-contract",
];

const forbiddenPublicSurfacePhrases = [
  "bootstrap_salt_repo",
  "persist_salt_artifact",
  "discover_salt",
  "get_salt_entities",
  "get_salt_examples",
  "upgrade_salt_ui",
  "salt-ds create",
  "salt-ds review",
  "salt-ds migrate",
  "salt-ds upgrade",
  "salt-ds init",
  "salt-ds doctor",
  "salt-ds runtime inspect",
  "salt://context/",
  "salt://setup/",
  "salt://review/",
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

function collectFilesRecursively(relativeDir) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  if (!existsSync(absoluteDir)) return [];

  return readdirSync(absoluteDir).flatMap((entry) => {
    const relativeEntryPath = path.join(relativeDir, entry);
    const absoluteEntryPath = path.join(repoRoot, relativeEntryPath);
    const stat = statSync(absoluteEntryPath);
    if (stat.isDirectory()) {
      return collectFilesRecursively(relativeEntryPath);
    }
    return [relativeEntryPath];
  });
}

function assertPublicSurfaceHasNoDeferredNames() {
  const files = [
    ...publicSurfacePaths,
    ...publicSurfaceDirectories.flatMap(collectFilesRecursively),
  ];

  for (const relativeFilePath of files) {
    const absoluteFilePath = path.join(repoRoot, relativeFilePath);
    if (!existsSync(absoluteFilePath)) {
      fail(`public surface check is missing ${relativeFilePath}`);
      continue;
    }

    const content = readFileSync(absoluteFilePath, "utf8");
    for (const phrase of forbiddenPublicSurfacePhrases) {
      if (content.includes(phrase)) {
        fail(
          `public surface ${normalizePath(relativeFilePath)} includes deferred v1 surface ${phrase}`,
        );
      }
    }
  }
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

assertPublicSurfaceHasNoDeferredNames();

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

  if (
    typeof packageConfig.maxPackageBytes === "number" &&
    packed.size > packageConfig.maxPackageBytes
  ) {
    fail(
      `${packageConfig.name} compressed size ${packed.size} exceeds budget ${packageConfig.maxPackageBytes}`,
    );
  }

  if (
    typeof packageConfig.maxUnpackedBytes === "number" &&
    packed.unpackedSize > packageConfig.maxUnpackedBytes
  ) {
    fail(
      `${packageConfig.name} unpacked size ${packed.unpackedSize} exceeds budget ${packageConfig.maxUnpackedBytes}`,
    );
  }

  if (typeof packageConfig.maxGeneratedBytes === "number") {
    const generatedBytes = (packed.files ?? [])
      .filter((file) => normalizePath(file.path).startsWith("generated/"))
      .reduce((total, file) => total + (file.size ?? 0), 0);
    if (generatedBytes > packageConfig.maxGeneratedBytes) {
      fail(
        `${packageConfig.name} generated payload ${generatedBytes} exceeds budget ${packageConfig.maxGeneratedBytes}`,
      );
    }
  }

  if (
    typeof packageConfig.maxEntryCount === "number" &&
    packed.entryCount > packageConfig.maxEntryCount
  ) {
    fail(
      `${packageConfig.name} file count ${packed.entryCount} exceeds budget ${packageConfig.maxEntryCount}`,
    );
  }

  if (typeof packageConfig.maxSourceMapBytes === "number") {
    const sourceMapBytes = (packed.files ?? [])
      .filter((file) => normalizePath(file.path).endsWith(".map"))
      .reduce((total, file) => total + (file.size ?? 0), 0);
    if (sourceMapBytes > packageConfig.maxSourceMapBytes) {
      fail(
        `${packageConfig.name} source-map payload ${sourceMapBytes} exceeds budget ${packageConfig.maxSourceMapBytes}`,
      );
    }
  }

  if (Array.isArray(packageConfig.expectedGeneratedFiles)) {
    const generatedFiles = (packed.files ?? [])
      .map((file) => normalizePath(file.path))
      .filter((filePath) => filePath.startsWith("generated/"))
      .map((filePath) => filePath.slice("generated/".length))
      .sort((left, right) => left.localeCompare(right));
    const expectedGeneratedFiles = [...packageConfig.expectedGeneratedFiles].sort(
      (left, right) => left.localeCompare(right),
    );
    if (
      JSON.stringify(generatedFiles) !== JSON.stringify(expectedGeneratedFiles)
    ) {
      fail(
        `${packageConfig.name} generated catalog files changed: ${JSON.stringify(generatedFiles)}`,
      );
    }
  }

  for (const forbiddenFile of packageConfig.forbiddenGeneratedFiles ?? []) {
    if (paths.includes(`generated/${forbiddenFile}`)) {
      fail(
        `${packageConfig.name} pack includes excluded generated artifact generated/${forbiddenFile}`,
      );
    }
  }

  for (const requiredPath of packageConfig.requiredPaths) {
    if (!hasPath(paths, requiredPath)) {
      fail(`${packageConfig.name} pack is missing ${requiredPath}`);
    }
  }

  for (const filePath of paths) {
    const topLevelPath = filePath.split("/")[0];
    if (
      Array.isArray(packageConfig.allowedTopLevelPaths) &&
      !packageConfig.allowedTopLevelPaths.includes(topLevelPath)
    ) {
      fail(
        `${packageConfig.name} pack includes unexpected top-level payload: ${filePath}`,
      );
    }

    if (filePath.endsWith(".map")) {
      fail(`${packageConfig.name} pack includes source map: ${filePath}`);
    }

    if (filePath.endsWith(".js")) {
      const content = readFileSync(path.join(packageDir, filePath), "utf8");
      if (content.includes("sourceMappingURL")) {
        fail(
          `${packageConfig.name} pack includes sourceMappingURL reference: ${filePath}`,
        );
      }
    }

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
