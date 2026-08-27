#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertCatalogArtifactManifestContract,
  assertCatalogManifestFamilyPartition,
  assertCatalogPublishedSchemaContract,
} from "./catalogArtifactContract.mjs";
import {
  assertSameCatalogBuildIdentity,
  createCatalogBuildIdentity,
  isPathWithinRoot,
  parseCatalogBuildBanner,
} from "./catalogBuildIdentity.mjs";
import { createWindowsCmdInvocation } from "./consumer-smoke/shared.mjs";
import {
  isPortableArchivePath,
  resolvePackageArchiveEntry,
  resolvePackageRelativeArchivePath,
} from "./packageArchivePath.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const isWindows = process.platform === "win32";
const require = createRequire(import.meta.url);
const vitestPackagePath = require.resolve("vitest/package.json");
const vitestPackage = JSON.parse(readFileSync(vitestPackagePath, "utf8"));
const vitestCli = path.resolve(
  path.dirname(vitestPackagePath),
  vitestPackage.bin.vitest,
);

function parseOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--") continue;
    if (token !== "--profile" && token !== "--report") {
      throw new Error(`Unknown AI tooling pack option: ${token}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${token} requires a value.`);
    }
    options[token.slice(2)] = value;
    index += 1;
  }
  if (options.profile !== "extraction-parity") {
    throw new Error(
      "Unit 02 package checks require --profile extraction-parity.",
    );
  }
  if (!options.report) {
    throw new Error("Unit 02 package checks require an explicit --report.");
  }
  const reportPath = path.resolve(repoRoot, options.report);
  const reportRoot = path.join(repoRoot, "dist", "salt-ai-pack");
  if (!isPathWithinRoot(reportRoot, reportPath) || reportPath === reportRoot) {
    throw new Error("The AI tooling pack report must stay under dist/salt-ai-pack.");
  }
  return { profile: options.profile, reportPath, reportRoot };
}

const options = parseOptions(process.argv.slice(2));

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
    name: "@salt-ds/knowledge",
    dir: "dist/salt-ds-knowledge",
    requiredPaths: ["package.json", "dist-cjs", "dist-es", "dist-types"],
    expectedFilesField: [
      "dist-cjs",
      "dist-es",
      "dist-types",
      "CHANGELOG.md",
    ],
    forbiddenManifestFields: [
      "publishEntryPath",
      "publishBuildIdentityManifest",
      "publishBuildIdentityInputPatterns",
      "publishCatalogArtifactPaths",
      "publishTypingEntryPath",
      "publishTypingEntryOnly",
      "publishPreserveModules",
      "publishIncludeReadme",
      "publishSourceMaps",
      "saltDocs",
      "typescriptInclude",
      "typescriptRootDir",
    ],
    forbiddenPublishConfigFields: ["directory"],
    forbiddenPublishedDependencies: [
      "@salt-ds/mcp",
      "@salt-ds/cli",
      "@modelcontextprotocol/server",
    ],
    expectedModuleMarkers: {
      "dist-cjs/package.json": "commonjs",
      "dist-es/package.json": "module",
    },
    expectedBundleFiles: {
      "dist-cjs": ["index.js", "package.json"],
      "dist-es": ["index.js", "package.json"],
    },
    allowedTopLevelPaths: [
      "LICENSE",
      "dist-cjs",
      "dist-es",
      "dist-types",
      "package.json",
    ],
    forbiddenTextMarkers: ["salt://"],
    maxPackageBytes: 2_000_000,
    maxUnpackedBytes: 8_000_000,
    maxGeneratedBytes: 0,
    maxSourceMapBytes: 0,
    maxEntryCount: 80,
  },
  {
    name: "@salt-ds/mcp",
    dir: "dist/salt-ds-mcp",
    requiredPaths: [
      "package.json",
      "bin/salt-mcp.js",
      "dist-cjs",
      "dist-es",
      "dist-types",
    ],
    expectedFilesField: [
      "bin",
      "dist-cjs",
      "dist-es",
      "dist-types",
    ],
    forbiddenManifestFields: [
      "publishEntryPath",
      "publishBuildIdentityManifest",
      "publishTypingEntryPath",
      "publishTypingEntryOnly",
      "publishPreserveModules",
      "publishIncludeReadme",
      "saltDocs",
      "typescriptInclude",
      "typescriptRootDir",
    ],
    forbiddenPublishConfigFields: ["directory"],
    forbiddenPublishedDependencies: ["@salt-ds/semantic-core", "get-tsconfig"],
    expectedExactDependencies: {
      "@modelcontextprotocol/server": "2.0.0",
      "@salt-ds/knowledge": "0.0.0",
    },
    expectedDeclarationFiles: ["dist-types/index.d.ts"],
    forbiddenDeclarationImports: ["@salt-ds/semantic-core"],
    expectedModuleMarkers: {
      "dist-cjs/package.json": "commonjs",
      "dist-es/package.json": "module",
    },
    expectedBundleFiles: {
      bin: ["salt-mcp.js"],
      "dist-cjs": ["index.js", "package.json"],
      "dist-es": ["index.js", "package.json"],
    },
    workspaceBin: "packages/mcp/bin/salt-mcp.js",
    publishedBin: "bin/salt-mcp.js",
    allowedTopLevelPaths: [
      "LICENSE",
      "bin",
      "dist-cjs",
      "dist-es",
      "dist-types",
      "package.json",
    ],
    maxPackageBytes: 2_000_000,
    maxUnpackedBytes: 8_000_000,
    maxGeneratedBytes: 0,
    maxSourceMapBytes: 0,
    maxEntryCount: 16,
  },
];

function fail(message) {
  console.error(`AI tooling package check failed: ${message}`);
  process.exitCode = 1;
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function compareOrdinalStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function hasPath(paths, expectedPath) {
  return paths.some(
    (filePath) =>
      filePath === expectedPath || filePath.startsWith(`${expectedPath}/`),
  );
}

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function assertPackedCatalogBuildIdentity(packageConfig, packageDir) {
  if (!packageConfig.expectedGeneratedManifest) return;
  try {
    const catalogIdentity = createCatalogBuildIdentity(
      readFileSync(
        path.join(packageDir, packageConfig.expectedGeneratedManifest),
      ),
    );
    for (const entrypoint of ["dist-cjs/index.js", "dist-es/index.js"]) {
      const runtimeIdentity = parseCatalogBuildBanner(
        readFileSync(path.join(packageDir, entrypoint)),
      );
      assertSameCatalogBuildIdentity(catalogIdentity, runtimeIdentity);
    }
  } catch (error) {
    fail(
      `${packageConfig.name} runtime/catalog build identity mismatch: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function readCatalogPackageInventory(packageConfig, packageDir) {
  if (!packageConfig.expectedGeneratedManifest) {
    return null;
  }
  const manifestPath = path.join(
    packageDir,
    packageConfig.expectedGeneratedManifest,
  );
  if (!existsSync(manifestPath)) {
    fail(
      `${packageConfig.name} is missing ${packageConfig.expectedGeneratedManifest}`,
    );
    return null;
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const inventoryEntries = (manifest.support_artifacts ?? []).filter(
    (entry) => entry.kind === "package_inventory",
  );
  if (inventoryEntries.length !== 1) {
    fail(
      `${packageConfig.name} manifest must bind exactly one package inventory`,
    );
    return null;
  }
  const [inventoryEntry] = inventoryEntries;
  if (!isPortableArchivePath(inventoryEntry.file)) {
    fail(
      `${packageConfig.name} manifest contains unsafe package inventory path ${inventoryEntry.file}`,
    );
    return null;
  }
  const inventoryPath = path.join(
    path.dirname(manifestPath),
    inventoryEntry.file,
  );
  if (!existsSync(inventoryPath)) {
    fail(
      `${packageConfig.name} is missing manifest-bound package inventory ${inventoryEntry.file}`,
    );
    return null;
  }
  const inventoryBytes = readFileSync(inventoryPath);
  if (
    inventoryBytes.byteLength !== inventoryEntry.bytes ||
    sha256(inventoryBytes) !== inventoryEntry.sha256
  ) {
    fail(
      `${packageConfig.name} package inventory does not match its manifest digest/bytes`,
    );
    return null;
  }
  const inventory = JSON.parse(inventoryBytes.toString("utf8"));
  if (!Array.isArray(inventory.files)) {
    fail(`${packageConfig.name} catalog package inventory has no files array`);
    return null;
  }
  if (
    inventory.schema_version !== manifest.schema_version ||
    inventory.semantic_digest !== manifest.semantic_digest
  ) {
    fail(
      `${packageConfig.name} catalog package inventory identity differs from its manifest`,
    );
    return null;
  }
  const buildArtifacts = manifest.build_artifacts ?? [];
  for (const artifact of buildArtifacts) {
    if (
      !isPortableArchivePath(artifact.file) ||
      typeof inventory.generation !== "string" ||
      !artifact.file.startsWith(`${inventory.generation}/`)
    ) {
      fail(
        `${packageConfig.name} manifest contains an invalid build-artifact receipt`,
      );
      return null;
    }
    if (inventory.files.includes(artifact.file)) {
      fail(
        `${packageConfig.name} package inventory must exclude build-only artifact ${artifact.file}`,
      );
      return null;
    }
  }
  const boundArtifacts = [
    ...(manifest.artifacts ?? []),
    ...(manifest.support_artifacts ?? []),
  ];
  const expectedFiles = [
    path.basename(manifestPath),
    ...boundArtifacts.map((artifact) => artifact.file),
  ].sort(compareOrdinalStrings);
  if (
    typeof inventory.generation !== "string" ||
    boundArtifacts.some(
      (artifact) => !artifact.file.startsWith(`${inventory.generation}/`),
    ) ||
    JSON.stringify(inventory.files) !== JSON.stringify(expectedFiles) ||
    new Set(inventory.files).size !== inventory.files.length
  ) {
    fail(
      `${packageConfig.name} catalog package inventory does not exactly cover its manifest generation`,
    );
    return null;
  }
  return inventory;
}

function assertPackedCatalogSemantics(packageConfig, packageDir) {
  const inventory = readCatalogPackageInventory(packageConfig, packageDir);
  if (!inventory) return;
  const generatedDir = path.join(packageDir, "generated");
  const manifestPath = path.join(generatedDir, "catalog-manifest.json");
  if (!existsSync(manifestPath)) {
    fail(`${packageConfig.name} is missing generated/catalog-manifest.json`);
    return;
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.schema_version !== inventory.schema_version) {
    fail(
      `${packageConfig.name} catalog manifest/inventory schema versions differ`,
    );
  }
  const boundArtifacts = [
    ...(manifest.artifacts ?? []),
    ...(manifest.support_artifacts ?? []),
  ];
  const verifiedArtifactBytes = new Map();
  for (const artifact of boundArtifacts) {
    if (!isPortableArchivePath(artifact.file)) {
      fail(
        `${packageConfig.name} catalog manifest contains unsafe artifact path ${artifact.file}`,
      );
      continue;
    }
    const artifactPath = path.resolve(generatedDir, artifact.file);
    if (!isPathWithinRoot(generatedDir, artifactPath)) {
      fail(
        `${packageConfig.name} catalog manifest contains unsafe artifact path ${artifact.file}`,
      );
      continue;
    }
    if (!existsSync(artifactPath)) {
      fail(
        `${packageConfig.name} catalog manifest artifact is missing: ${artifact.file}`,
      );
      continue;
    }
    const bytes = readFileSync(artifactPath);
    const actualDigest = sha256(bytes);
    if (
      bytes.byteLength !== artifact.bytes ||
      actualDigest !== artifact.sha256
    ) {
      fail(
        `${packageConfig.name} catalog artifact ${artifact.file} does not match its manifest digest/bytes`,
      );
      continue;
    }
    verifiedArtifactBytes.set(artifact.file, bytes);
  }

  const schemaEntries = (manifest.support_artifacts ?? []).filter(
    (artifact) => artifact.kind === "json_schema",
  );
  if (schemaEntries.length !== 1) {
    fail(`${packageConfig.name} manifest must bind exactly one catalog schema`);
    return;
  }
  const [schemaEntry] = schemaEntries;
  const schemaBytes = verifiedArtifactBytes.get(schemaEntry.file);
  if (!schemaBytes) return;

  let catalogSchema;
  try {
    catalogSchema = JSON.parse(schemaBytes.toString("utf8"));
    assertCatalogPublishedSchemaContract(catalogSchema);
  } catch (error) {
    fail(
      `${packageConfig.name} manifest-bound catalog schema is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return;
  }
  if (catalogSchema.schema_version !== manifest.schema_version) {
    fail(`${packageConfig.name} catalog manifest/schema versions differ`);
    return;
  }
  try {
    assertCatalogManifestFamilyPartition({ manifest, catalogSchema });
  } catch (error) {
    fail(
      `${packageConfig.name} catalog manifest family partition is invalid: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return;
  }
  for (const artifact of manifest.build_artifacts ?? []) {
    if (existsSync(path.join(generatedDir, artifact.file))) {
      fail(
        `${packageConfig.name} package must exclude build-only artifact ${artifact.file}`,
      );
      continue;
    }
    const generation = path.posix.dirname(artifact.file);
    if (
      catalogSchema.artifacts?.[artifact.family] === undefined ||
      artifact.file !==
        `${generation}/${catalogSchema.artifacts[artifact.family]}` ||
      catalogSchema.codecs?.[artifact.family] !== artifact.codec ||
      catalogSchema.canonical?.[artifact.family] !== artifact.canonical ||
      catalogSchema.publication_states?.[artifact.family] !== "build-only"
    ) {
      fail(
        `${packageConfig.name} build-artifact receipt does not match the descriptor-derived schema: ${artifact.file}`,
      );
    }
  }

  for (const artifact of boundArtifacts.filter(
    (candidate) => candidate.family,
  )) {
    const bytes = verifiedArtifactBytes.get(artifact.file);
    if (!bytes) continue;
    try {
      assertCatalogArtifactManifestContract({
        artifact,
        envelope: JSON.parse(bytes.toString("utf8")),
        catalogSchema,
      });
    } catch (error) {
      fail(
        `${packageConfig.name} catalog artifact ${artifact.file} fails its manifest family/count contract: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

function assertCatalogDirectoriesEqual(
  packageConfig,
  expectedDirectory,
  actualDirectory,
  label,
) {
  const expectedInventory = readCatalogPackageInventory(
    packageConfig,
    path.dirname(expectedDirectory),
  );
  const actualInventory = readCatalogPackageInventory(
    packageConfig,
    path.dirname(actualDirectory),
  );
  if (!expectedInventory || !actualInventory) return;
  if (JSON.stringify(expectedInventory) !== JSON.stringify(actualInventory)) {
    fail(`${packageConfig.name} ${label} catalog inventories differ`);
    return;
  }
  for (const fileName of expectedInventory.files) {
    if (!isPortableArchivePath(fileName)) {
      fail(
        `${packageConfig.name} ${label} inventory contains unsafe path ${fileName}`,
      );
      continue;
    }
    const expectedPath = path.join(expectedDirectory, fileName);
    const actualPath = path.join(actualDirectory, fileName);
    if (!existsSync(expectedPath) || !existsSync(actualPath)) {
      fail(
        `${packageConfig.name} ${label} is missing catalog file ${fileName}`,
      );
      continue;
    }
    const expectedBytes = readFileSync(expectedPath);
    const actualBytes = readFileSync(actualPath);
    if (!expectedBytes.equals(actualBytes)) {
      fail(
        `${packageConfig.name} ${label} catalog file differs: ${fileName} (${sha256(expectedBytes)} != ${sha256(actualBytes)})`,
      );
    }
  }
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

  for (const [dependencyName, expectedVersion] of Object.entries(
    packageConfig.expectedExactDependencies ?? {},
  )) {
    const actualVersion = manifest.dependencies?.[dependencyName];
    if (actualVersion !== expectedVersion) {
      fail(
        `${packageConfig.name} built dependency ${dependencyName} is ${String(actualVersion)}, expected exactly ${expectedVersion}`,
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
  const normalizedTarget = targetPath.startsWith("./")
    ? targetPath.slice(2)
    : targetPath;

  if (!isPortableArchivePath(normalizedTarget)) {
    fail(
      `${packageConfig.name} ${fieldName} target is not package-relative: ${targetPath}`,
    );
    return;
  }

  const resolvedTarget = path.resolve(packageDir, normalizedTarget);
  if (!isPathWithinRoot(packageDir, resolvedTarget)) {
    fail(
      `${packageConfig.name} ${fieldName} target escapes the package: ${targetPath}`,
    );
    return;
  }

  if (!existsSync(resolvedTarget)) {
    fail(`${packageConfig.name} ${fieldName} target is missing: ${targetPath}`);
  }
}

function collectPublishedNodeScriptTargets(command) {
  if (typeof command !== "string") {
    return [];
  }
  const targets = [];
  const nodeInvocation =
    /(?:^|(?:&&|\|\||;)\s*)(?:yarn\s+)?node(?:\s+--[^\s;&|]+)*\s+(?:"([^"]+)"|'([^']+)'|([^\s;&|]+))/gu;
  for (const match of command.matchAll(nodeInvocation)) {
    const target = match[1] ?? match[2] ?? match[3];
    if (target?.startsWith("./") || target?.startsWith("../")) {
      targets.push(target);
    }
  }
  return targets;
}

function assertPublishedScriptTargetsExist(
  packageConfig,
  packageDir,
  manifest,
) {
  for (const [scriptName, command] of Object.entries(manifest.scripts ?? {})) {
    for (const targetPath of collectPublishedNodeScriptTargets(command)) {
      assertManifestTargetExists(
        packageConfig,
        packageDir,
        `scripts.${scriptName}`,
        targetPath,
      );
    }
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
  assertPublishedScriptTargetsExist(packageConfig, packageDir, manifest);
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

function assertPackedCatalogReleaseCoverage(
  packageConfig,
  extractedPackageDir,
) {
  const result = spawnSync(
    process.execPath,
    [
      vitestCli,
      "run",
      "packages/mcp/src/__tests__/registryCoverage.spec.ts",
      "--maxWorkers=1",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        SALT_MCP_PACKED_REGISTRY_DIR: path.join(
          extractedPackageDir,
          "generated",
        ),
      },
    },
  );
  if (result.error || result.status !== 0) {
    fail(
      `${packageConfig.name} packed catalog release coverage failed: ${
        result.error ?? `${result.stderr}${result.stdout}`
      }`,
    );
  }
}

function runRealPack(packageConfig, packageDir) {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "salt-mcp-pack-"));
  const packDirectory = path.join(temporaryRoot, "pack");
  const extractionDirectory = path.join(temporaryRoot, "extract");
  const npmCache = path.join(temporaryRoot, "npm-cache");
  mkdirSync(packDirectory, { recursive: true });
  mkdirSync(extractionDirectory, { recursive: true });
  const cleanup = () => rmSync(temporaryRoot, { recursive: true, force: true });

  const npmArgs = [
    "pack",
    "--json",
    "--ignore-scripts",
    "--pack-destination",
    packDirectory,
    packageDir,
  ];
  const windowsInvocation = isWindows
    ? createWindowsCmdInvocation("npm.cmd", npmArgs)
    : null;
  const command = windowsInvocation?.command ?? "npm";
  const args = windowsInvocation?.args ?? npmArgs;
  const cleanProcessEnvironment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) =>
        !/^(?:COREPACK_|NPM_CONFIG_|YARN_|NODE_(?:OPTIONS|PATH|REPL_EXTERNAL_MODULE)$)/iu.test(
          key,
        ),
    ),
  );
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...cleanProcessEnvironment,
      NODE_PATH: "",
      NPM_CONFIG_CACHE: npmCache,
    },
    windowsVerbatimArguments:
      windowsInvocation?.windowsVerbatimArguments ?? false,
  });

  if (result.error) {
    fail(`${packageConfig.name} npm pack could not start: ${result.error}`);
    cleanup();
    return null;
  }

  if (result.status !== 0) {
    fail(
      `${packageConfig.name} npm pack failed with exit ${result.status}\n${result.stderr}${result.stdout}`,
    );
    cleanup();
    return null;
  }

  let packed;
  try {
    const parsed = JSON.parse(result.stdout);
    packed = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!packed || typeof packed !== "object") {
      fail(`${packageConfig.name} npm pack returned no package metadata`);
      cleanup();
      return null;
    }
  } catch (error) {
    fail(`${packageConfig.name} npm pack returned invalid JSON: ${error}`);
    cleanup();
    return null;
  }

  if (
    typeof packed.filename !== "string" ||
    !isPortableArchivePath(packed.filename) ||
    packed.filename.includes("/")
  ) {
    fail(
      `${packageConfig.name} npm pack returned an unsafe tarball filename: ${packed.filename}`,
    );
    cleanup();
    return null;
  }

  const tarballPath = path.resolve(packDirectory, packed.filename);
  const relativeTarballPath = path.relative(packDirectory, tarballPath);
  if (
    relativeTarballPath.startsWith("..") ||
    path.isAbsolute(relativeTarballPath) ||
    relativeTarballPath.length === 0 ||
    !existsSync(tarballPath)
  ) {
    fail(
      `${packageConfig.name} npm pack tarball did not resolve beneath the temporary pack directory`,
    );
    cleanup();
    return null;
  }

  const listing = spawnSync("tar", ["-tzf", tarballPath], {
    cwd: temporaryRoot,
    encoding: "utf8",
  });
  if (listing.error || listing.status !== 0) {
    fail(
      `${packageConfig.name} tarball listing failed: ${
        listing.error ?? `${listing.stderr}${listing.stdout}`
      }`,
    );
    cleanup();
    return null;
  }

  const archiveEntries = listing.stdout
    .split(/\r?\n/u)
    .filter((entry) => entry.length > 0);
  let archivePathsValid = archiveEntries.length > 0;
  for (const rawEntry of archiveEntries) {
    try {
      resolvePackageArchiveEntry(extractionDirectory, rawEntry);
    } catch {
      fail(
        `${packageConfig.name} tarball contains unsafe archive path: ${rawEntry}`,
      );
      archivePathsValid = false;
    }
  }
  if (!archivePathsValid) {
    cleanup();
    return null;
  }

  const extraction = spawnSync(
    "tar",
    ["-xzf", tarballPath, "-C", extractionDirectory],
    {
      cwd: temporaryRoot,
      encoding: "utf8",
    },
  );
  if (extraction.error || extraction.status !== 0) {
    fail(
      `${packageConfig.name} tarball extraction failed: ${
        extraction.error ?? `${extraction.stderr}${extraction.stdout}`
      }`,
    );
    cleanup();
    return null;
  }

  const extractedPackageDir = path.join(extractionDirectory, "package");
  if (!existsSync(extractedPackageDir)) {
    fail(`${packageConfig.name} tarball did not extract a package root`);
    cleanup();
    return null;
  }

  return {
    cleanup,
    extractedPackageDir,
    metadata: packed,
    tarballPath,
  };
}

function collectExactFileInventory(rootDirectory) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort(
      (left, right) => compareOrdinalStrings(left.name, right.name),
    )) {
      const absolutePath = path.join(directory, entry.name);
      const stats = lstatSync(absolutePath);
      if (stats.isSymbolicLink()) {
        throw new Error(`Comparison registry contains a link: ${absolutePath}`);
      }
      if (stats.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (!stats.isFile()) {
        throw new Error(
          `Comparison registry contains a non-file entry: ${absolutePath}`,
        );
      }
      const bytes = readFileSync(absolutePath);
      files.push({
        path: normalizePath(path.relative(rootDirectory, absolutePath)),
        sha256: sha256(bytes),
        bytes: bytes.byteLength,
      });
    }
  };
  visit(rootDirectory);
  return files;
}

const reportParent = path.dirname(options.reportPath);
mkdirSync(reportParent, { recursive: true });
const reportBaseName = path.basename(options.reportPath, path.extname(options.reportPath));
const finalArtifactDirectory = path.join(
  reportParent,
  `${reportBaseName}.artifacts`,
);
if (!isPathWithinRoot(options.reportRoot, finalArtifactDirectory)) {
  throw new Error("The AI tooling pack artifact directory escaped its root.");
}
rmSync(options.reportPath, { force: true });
rmSync(finalArtifactDirectory, { recursive: true, force: true });
const stagingArtifactDirectory = mkdtempSync(
  path.join(reportParent, `.${reportBaseName}-artifacts-`),
);
const packageReports = [];

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
    if (packageConfig.verifyCliVersion === true) {
      assertCliVersion(packageConfig, packageDir, manifest);
    }
  }
  assertModuleFormatMarkers(packageConfig, packageDir);
  assertPackedCatalogBuildIdentity(packageConfig, packageDir);
  assertPackedCatalogSemantics(packageConfig, packageDir);
  if (packageConfig.workspaceGeneratedDir) {
    assertCatalogDirectoriesEqual(
      packageConfig,
      path.join(repoRoot, packageConfig.workspaceGeneratedDir),
      path.join(packageDir, "generated"),
      "workspace-to-dist",
    );
  }

  const packResult = runRealPack(packageConfig, packageDir);
  if (!packResult) {
    continue;
  }
  const {
    cleanup,
    extractedPackageDir,
    metadata: packed,
    tarballPath,
  } = packResult;

  try {
    const extractedManifest = assertBuiltManifest(
      packageConfig,
      extractedPackageDir,
    );
    if (extractedManifest) {
      assertManifestTargetsExist(
        packageConfig,
        extractedPackageDir,
        extractedManifest,
      );
    }
    assertModuleFormatMarkers(packageConfig, extractedPackageDir);
    assertPackedCatalogBuildIdentity(packageConfig, extractedPackageDir);
    assertPackedCatalogSemantics(packageConfig, extractedPackageDir);
    if (packageConfig.expectedGeneratedManifest) {
      assertCatalogDirectoriesEqual(
        packageConfig,
        path.join(packageDir, "generated"),
        path.join(extractedPackageDir, "generated"),
        "dist-to-extracted-tarball",
      );
      assertPackedCatalogReleaseCoverage(packageConfig, extractedPackageDir);
    }

    if (packed.name !== packageConfig.name) {
      fail(`${packageConfig.dir} packed as ${packed.name}`);
    }

    const paths = (packed.files ?? []).flatMap((file) => {
      try {
        return [
          resolvePackageRelativeArchivePath(extractedPackageDir, file.path)
            .path,
        ];
      } catch {
        fail(
          `${packageConfig.name} npm pack metadata contains unsafe path: ${file.path}`,
        );
        return [];
      }
    });
    if (paths.length === 0) {
      fail(`${packageConfig.name} npm pack returned no packed files`);
    }

    for (const [directory, expectedFiles] of Object.entries(
      packageConfig.expectedBundleFiles ?? {},
    )) {
      const prefix = `${directory}/`;
      const actualFiles = paths
        .filter((filePath) => filePath.startsWith(prefix))
        .map((filePath) => filePath.slice(prefix.length))
        .sort(compareOrdinalStrings);
      const sortedExpectedFiles = [...expectedFiles].sort(
        compareOrdinalStrings,
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
        .sort(compareOrdinalStrings);
      const expectedDeclarationFiles = [
        ...packageConfig.expectedDeclarationFiles,
      ].sort(compareOrdinalStrings);
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
        path.join(extractedPackageDir, declarationFile),
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

    const generatedInventory = readCatalogPackageInventory(
      packageConfig,
      extractedPackageDir,
    );
    if (generatedInventory) {
      const generatedFiles = (packed.files ?? [])
        .map((file) => normalizePath(file.path))
        .filter((filePath) => filePath.startsWith("generated/"))
        .map((filePath) => filePath.slice("generated/".length))
        .sort(compareOrdinalStrings);
      const expectedGeneratedFiles = [...generatedInventory.files].sort(
        compareOrdinalStrings,
      );
      if (
        JSON.stringify(generatedFiles) !==
        JSON.stringify(expectedGeneratedFiles)
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
      if (/\.(?:md|mdx|markdown)$/iu.test(filePath)) {
        fail(`${packageConfig.name} pack includes Markdown: ${filePath}`);
      }
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
        const content = readFileSync(
          path.join(extractedPackageDir, filePath),
          "utf8",
        );
        if (content.includes("sourceMappingURL")) {
          fail(
            `${packageConfig.name} pack includes sourceMappingURL reference: ${filePath}`,
          );
        }
      }

      if (/\.(?:js|cjs|mjs|d\.ts|json)$/u.test(filePath)) {
        const content = readFileSync(
          path.join(extractedPackageDir, filePath),
          "utf8",
        );
        for (const marker of packageConfig.forbiddenTextMarkers ?? []) {
          if (content.includes(marker)) {
            fail(
              `${packageConfig.name} pack includes forbidden prototype marker ${JSON.stringify(marker)} in ${filePath}`,
            );
          }
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
      `${packageConfig.name}: ${packed.entryCount} files, ${packed.size} compressed bytes, ${packed.unpackedSize} unpacked bytes, ${generatedBytes} generated bytes, tarball ${sha256(readFileSync(tarballPath))}`,
    );

    const persistentTarballPath = path.join(
      stagingArtifactDirectory,
      packed.filename,
    );
    copyFileSync(tarballPath, persistentTarballPath);
    const tarballBytes = readFileSync(persistentTarballPath);
    const manifestBytes = readFileSync(
      path.join(extractedPackageDir, "package.json"),
    );
    const packedManifest = JSON.parse(manifestBytes.toString("utf8"));
    packageReports.push({
      name: packageConfig.name,
      version: packedManifest.version,
      manifest: {
        path: `${packageConfig.name}/package.json`,
        sha256: sha256(manifestBytes),
        bytes: manifestBytes.byteLength,
      },
      tarball: {
        fileName: packed.filename,
        sha256: sha256(tarballBytes),
        bytes: tarballBytes.byteLength,
      },
      dependencies: packedManifest.dependencies ?? {},
    });
  } finally {
    cleanup();
  }
}

if (process.exitCode) {
  rmSync(stagingArtifactDirectory, { recursive: true, force: true });
  process.exit(process.exitCode);
}

const knowledgeReport = packageReports.find(
  (entry) => entry.name === "@salt-ds/knowledge",
);
const mcpReport = packageReports.find((entry) => entry.name === "@salt-ds/mcp");
if (!knowledgeReport || !mcpReport || packageReports.length !== packages.length) {
  rmSync(stagingArtifactDirectory, { recursive: true, force: true });
  throw new Error("AI tooling pack did not produce both required package reports.");
}
if (mcpReport.dependencies["@salt-ds/knowledge"] !== knowledgeReport.version) {
  rmSync(stagingArtifactDirectory, { recursive: true, force: true });
  throw new Error("MCP does not exact-pin the packed knowledge package version.");
}

const extractionParityPath = path.join(
  repoRoot,
  "packages",
  "knowledge",
  "generated",
  "extraction-parity.json",
);
if (!existsSync(extractionParityPath)) {
  rmSync(stagingArtifactDirectory, { recursive: true, force: true });
  throw new Error(
    "Missing packages/knowledge/generated/extraction-parity.json. Run yarn build:ai-tooling first.",
  );
}
const extractionParityBytes = readFileSync(extractionParityPath);
const extractionParity = JSON.parse(extractionParityBytes.toString("utf8"));
if (
  extractionParity.contract !== "extraction-parity@1" ||
  extractionParity.status !== "passed" ||
  extractionParity.current?.semantic_digest !==
    extractionParity.baseline?.semantic_digest
) {
  rmSync(stagingArtifactDirectory, { recursive: true, force: true });
  throw new Error("The extraction parity receipt is not a passing Unit 02 receipt.");
}
const comparisonRegistryRoot = path.dirname(extractionParityPath);
const comparisonRegistryFiles = collectExactFileInventory(
  comparisonRegistryRoot,
);
const comparisonManifest = comparisonRegistryFiles.find(
  (entry) => entry.path === "catalog-manifest.json",
);
if (!comparisonManifest) {
  rmSync(stagingArtifactDirectory, { recursive: true, force: true });
  throw new Error("The comparison registry has no catalog-manifest.json.");
}

renameSync(stagingArtifactDirectory, finalArtifactDirectory);
const artifactDirectoryName = path.basename(finalArtifactDirectory);
const report = {
  schema_version: "1.0.0",
  contract: "salt-ai-pack-report@1",
  policy_profile: options.profile,
  publishable: false,
  packages: packageReports.map((entry) => ({
    name: entry.name,
    version: entry.version,
    manifest: entry.manifest,
    tarball: {
      path: `${artifactDirectoryName}/${entry.tarball.fileName}`,
      sha256: entry.tarball.sha256,
      bytes: entry.tarball.bytes,
    },
    dependencies: entry.dependencies,
    first_party_dependencies:
      entry.name === "@salt-ds/mcp"
        ? [
            {
              name: "@salt-ds/knowledge",
              version: knowledgeReport.version,
              tarball_sha256: knowledgeReport.tarball.sha256,
            },
          ]
        : [],
    content_policy: {
      generated_tree: false,
      prototype_catalog: false,
      workspace_link: false,
    },
  })),
  extraction_parity: {
    path: "packages/knowledge/generated/extraction-parity.json",
    sha256: sha256(extractionParityBytes),
    bytes: extractionParityBytes.byteLength,
    contract: extractionParity.contract,
    status: extractionParity.status,
    semantic_digest: extractionParity.current.semantic_digest,
    normalized_semantic_projection_sha256:
      extractionParity.normalized_semantic_projection_sha256,
  },
  comparison_registry: {
    root: "packages/knowledge/generated",
    semantic_digest: extractionParity.current.semantic_digest,
    manifest: comparisonManifest,
    files: comparisonRegistryFiles,
  },
};
const reportBytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`, "utf8");
const temporaryReportPath = `${options.reportPath}.tmp-${process.pid}`;
writeFileSync(temporaryReportPath, reportBytes, { flag: "wx" });
renameSync(temporaryReportPath, options.reportPath);
console.log(
  `Wrote ${path.relative(repoRoot, options.reportPath)} (${sha256(reportBytes)}).`,
);
