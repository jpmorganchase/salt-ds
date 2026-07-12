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
  "evals",
  "eval-fixtures",
  "fixtures",
  "host-results",
  "replay-traces",
  "semantic-core",
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
    forbiddenManifestFields: [
      "publishEntryPath",
      "publishTypingEntryPath",
      "publishTypingEntryOnly",
      "publishPreserveModules",
      "typescriptInclude",
      "typescriptRootDir",
    ],
    forbiddenPublishConfigFields: ["directory"],
    forbiddenPublishedDependencies: ["@salt-ds/semantic-core"],
    expectedDeclarationFiles: ["dist-types/index.d.ts"],
    forbiddenDeclarationImports: ["@salt-ds/semantic-core"],
    expectedModuleMarkers: {
      "dist-cjs/package.json": "commonjs",
      "dist-es/package.json": "module",
    },
    expectedBundleFiles: {
      "dist-cjs": ["index.js", "package.json"],
      "dist-es": ["index.js", "package.json"],
    },
    workspaceBin: "packages/mcp/bin/salt-mcp.js",
    publishedBin: "bin/salt-mcp.js",
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
      "deprecations.json",
      "guides.json",
      "icons.json",
      "country-symbols.json",
      "metadata.json",
      "packages.json",
      "pages.json",
      "patterns.json",
      "token-policy-structural-role-rules.json",
      "tokens.json",
    ],
    forbiddenGeneratedFiles: [
      "changes.json",
      "create-retrieval-index.jsonl",
      "examples.json",
      "icons-lite.json",
      "page-search-index.json",
      "pattern-validation-rules.json",
      "search-index.jsonl",
    ],
    expectedRegistrySourceRoot: ".",
    maxPackageBytes: 1_300_000,
    maxUnpackedBytes: 12_500_000,
    maxGeneratedBytes: 10_000_000,
    maxSourceMapBytes: 0,
    maxEntryCount: 24,
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

  for (const fieldName of packageConfig.forbiddenManifestFields ?? []) {
    if (Object.hasOwn(manifest, fieldName)) {
      fail(
        `${packageConfig.name} built manifest includes build-only field ${fieldName}`,
      );
    }
  }

  for (const fieldName of packageConfig.forbiddenPublishConfigFields ?? []) {
    if (
      manifest.publishConfig &&
      Object.hasOwn(manifest.publishConfig, fieldName)
    ) {
      fail(
        `${packageConfig.name} built manifest publishConfig includes build-only field ${fieldName}`,
      );
    }
  }

  for (const [dependencyName, dependencyVersion] of Object.entries(
    manifest.dependencies ?? {},
  )) {
    if (
      typeof dependencyVersion === "string" &&
      dependencyVersion.startsWith("workspace:")
    ) {
      fail(
        `${packageConfig.name} built manifest includes unresolved workspace dependency ${dependencyName}@${dependencyVersion}`,
      );
    }
  }

  for (const dependencyName of packageConfig.forbiddenPublishedDependencies ??
    []) {
    if (Object.hasOwn(manifest.dependencies ?? {}, dependencyName)) {
      fail(
        `${packageConfig.name} built manifest includes bundled private dependency ${dependencyName}`,
      );
    }
  }

  return manifest;
}

function assertModuleFormatMarkers(packageConfig, packageDir) {
  for (const [relativePath, expectedType] of Object.entries(
    packageConfig.expectedModuleMarkers ?? {},
  )) {
    const markerPath = path.join(packageDir, relativePath);
    if (!existsSync(markerPath)) {
      fail(`${packageConfig.name} is missing module marker ${relativePath}`);
      continue;
    }

    const marker = JSON.parse(readFileSync(markerPath, "utf8"));
    if (marker.type !== expectedType) {
      fail(
        `${packageConfig.name} module marker ${relativePath} has type ${marker.type}, expected ${expectedType}`,
      );
    }
  }
}

function collectManifestTargetPaths(value) {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectManifestTargetPaths);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectManifestTargetPaths);
  }

  return [];
}

function assertManifestTargetExists(
  packageConfig,
  packageDir,
  fieldName,
  targetPath,
) {
  const normalizedTarget = normalizePath(
    targetPath.startsWith("./") ? targetPath.slice(2) : targetPath,
  );

  if (
    normalizedTarget.length === 0 ||
    normalizedTarget.startsWith("/") ||
    normalizedTarget.startsWith("../") ||
    /^[A-Za-z]:/.test(normalizedTarget)
  ) {
    fail(
      `${packageConfig.name} ${fieldName} target is not package-relative: ${targetPath}`,
    );
    return;
  }

  if (!existsSync(path.join(packageDir, normalizedTarget))) {
    fail(`${packageConfig.name} ${fieldName} target is missing: ${targetPath}`);
  }
}

function assertManifestTargetsExist(packageConfig, packageDir, manifest) {
  for (const fieldName of ["main", "module", "typings", "types"]) {
    const targetPath = manifest[fieldName];
    if (typeof targetPath === "string") {
      assertManifestTargetExists(
        packageConfig,
        packageDir,
        fieldName,
        targetPath,
      );
    }
  }

  for (const targetPath of collectManifestTargetPaths(manifest.exports)) {
    assertManifestTargetExists(
      packageConfig,
      packageDir,
      "exports",
      targetPath,
    );
  }
}

function assertCliVersion(packageConfig, packageDir, manifest) {
  const bins = [
    ["workspace", path.join(repoRoot, packageConfig.workspaceBin)],
    ["published", path.join(packageDir, packageConfig.publishedBin)],
  ];

  for (const [label, binPath] of bins) {
    const result = spawnSync(process.execPath, [binPath, "--version"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    if (result.error) {
      fail(
        `${packageConfig.name} ${label} CLI could not start: ${result.error}`,
      );
      continue;
    }
    if (result.status !== 0) {
      fail(
        `${packageConfig.name} ${label} CLI failed with exit ${result.status}\n${result.stderr}${result.stdout}`,
      );
      continue;
    }
    if (result.stdout.trim() !== manifest.version) {
      fail(
        `${packageConfig.name} ${label} CLI reported ${JSON.stringify(result.stdout.trim())}, expected ${manifest.version}`,
      );
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

for (const packageConfig of packages) {
  const packageDir = path.join(repoRoot, packageConfig.dir);
  if (!existsSync(packageDir)) {
    fail(
      `${packageConfig.dir} does not exist. Run yarn build before this check.`,
    );
    continue;
  }

  const manifest = assertBuiltManifest(packageConfig, packageDir);
  if (manifest) {
    assertManifestTargetsExist(packageConfig, packageDir, manifest);
    assertCliVersion(packageConfig, packageDir, manifest);
  }
  assertModuleFormatMarkers(packageConfig, packageDir);

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

  for (const [directory, expectedFiles] of Object.entries(
    packageConfig.expectedBundleFiles ?? {},
  )) {
    const prefix = `${directory}/`;
    const actualFiles = paths
      .filter((filePath) => filePath.startsWith(prefix))
      .map((filePath) => filePath.slice(prefix.length))
      .sort((left, right) => left.localeCompare(right));
    const sortedExpectedFiles = [...expectedFiles].sort((left, right) =>
      left.localeCompare(right),
    );
    if (JSON.stringify(actualFiles) !== JSON.stringify(sortedExpectedFiles)) {
      fail(
        `${packageConfig.name} ${directory} bundle files changed: ${JSON.stringify(actualFiles)}`,
      );
    }
  }

  if (Array.isArray(packageConfig.expectedDeclarationFiles)) {
    const declarationFiles = paths
      .filter((filePath) => filePath.endsWith(".d.ts"))
      .sort((left, right) => left.localeCompare(right));
    const expectedDeclarationFiles = [
      ...packageConfig.expectedDeclarationFiles,
    ].sort((left, right) => left.localeCompare(right));
    if (
      JSON.stringify(declarationFiles) !==
      JSON.stringify(expectedDeclarationFiles)
    ) {
      fail(
        `${packageConfig.name} declaration files changed: ${JSON.stringify(declarationFiles)}`,
      );
    }
  }

  for (const declarationFile of paths.filter((filePath) =>
    filePath.endsWith(".d.ts"),
  )) {
    const content = readFileSync(
      path.join(packageDir, declarationFile),
      "utf8",
    );
    for (const dependencyName of packageConfig.forbiddenDeclarationImports ??
      []) {
      if (content.includes(dependencyName)) {
        fail(
          `${packageConfig.name} declaration ${declarationFile} references bundled private dependency ${dependencyName}`,
        );
      }
    }
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

  const generatedBytes = (packed.files ?? [])
    .filter((file) => normalizePath(file.path).startsWith("generated/"))
    .reduce((total, file) => total + (file.size ?? 0), 0);
  if (typeof packageConfig.maxGeneratedBytes === "number") {
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
    const expectedGeneratedFiles = [
      ...packageConfig.expectedGeneratedFiles,
    ].sort((left, right) => left.localeCompare(right));
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

  if (typeof packageConfig.expectedRegistrySourceRoot === "string") {
    const metadataPath = path.join(packageDir, "generated", "metadata.json");
    const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
    if (
      metadata.build_info?.source_root !==
      packageConfig.expectedRegistrySourceRoot
    ) {
      fail(
        `${packageConfig.name} registry source_root is ${JSON.stringify(metadata.build_info?.source_root)}, expected ${JSON.stringify(packageConfig.expectedRegistrySourceRoot)}`,
      );
    }

    for (const [artifactName, artifact] of Object.entries(
      metadata.build_info?.source_artifacts ?? {},
    )) {
      const artifactPath = artifact?.path;
      if (
        typeof artifactPath !== "string" ||
        artifactPath.startsWith("/") ||
        artifactPath.startsWith("../") ||
        /^[A-Za-z]:/u.test(artifactPath)
      ) {
        fail(
          `${packageConfig.name} registry source artifact ${artifactName} has non-portable path ${JSON.stringify(artifactPath)}`,
        );
      }
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
    `${packageConfig.name}: ${packed.entryCount} files, ${packed.size} compressed bytes, ${packed.unpackedSize} unpacked bytes, ${generatedBytes} generated bytes`,
  );
}

if (process.exitCode) {
  process.exit(process.exitCode);
}
