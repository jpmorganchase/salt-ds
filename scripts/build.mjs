import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import url from "node:url";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import browserslistToEsbuild from "browserslist-to-esbuild";
import fs from "fs-extra";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import postcss from "rollup-plugin-postcss";
import {
  assertCatalogArtifactManifestContract,
  assertCatalogManifestFamilyPartition,
  assertCatalogPublishedSchemaContract,
} from "./catalogArtifactContract.mjs";
import {
  assertCatalogInputBytes,
  assertCompleteCatalogInputSet,
  assertCatalogManifestBytes,
  createCatalogBuildIdentity,
  formatCatalogBuildBanner,
  hasForbiddenPortablePathCharacter,
  isPathWithinRoot,
} from "./catalogBuildIdentity.mjs";
import { makeTypings } from "./makeTypings.mjs";
import { transformWorkspaceDeps } from "./transformWorkspaceDeps.mjs";
import { distinct, getTypescriptConfig } from "./utils.mjs";

const cwd = process.cwd();
const repoRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
);

const packageJson = (
  await import(url.pathToFileURL(path.join(cwd, "package.json")), {
    with: { type: "json" },
  })
).default;
const {
  publishExports,
  publishBinEntrypoints = {},
  publishScriptExcludes = [],
  publishAdditionalDependencies = {},
  publishAdditionalEntryPaths = [],
  publishBuildIdentityManifest,
  publishExtraCopyPaths = [],
  publishPreserveModules = true,
  publishSourceMaps = true,
  publishIncludeChangelog = true,
  generateTypings = true,
  publishTypingEntryOnly = false,
  publishConfig,
  typescriptInclude: _typescriptInclude,
  typescriptRootDir: _typescriptRootDir,
  dependencies: _dependencies,
  devDependencies: _devDependencies,
  peerDependencies: _peerDependencies,
  ...packageJsonForPublish
} = packageJson;

const FILES_TO_COPY = [
  "README.md",
  "LICENSE",
  ...(publishIncludeChangelog ? ["CHANGELOG.md"] : []),
].concat(packageJson.files ?? []);

const packageName = packageJson.name;
const { directory: _publishConfigDirectory, ...publishConfigForPublish } =
  publishConfig ?? {};
const outputDir = path.join(publishConfig.directory);
const sourceEntryPath = path.join(cwd, "src", "index.ts");
const additionalSourceEntryPaths = publishAdditionalEntryPaths.map(
  (entryPath) => path.join(cwd, entryPath),
);
if (
  publishBuildIdentityManifest !== undefined &&
  (typeof publishBuildIdentityManifest !== "string" ||
    publishBuildIdentityManifest.length === 0 ||
    publishBuildIdentityManifest.includes("\\") ||
    path.isAbsolute(publishBuildIdentityManifest) ||
    publishBuildIdentityManifest
      .split("/")
      .some((segment) => segment === "" || segment === "." || segment === ".."))
) {
  throw new Error(
    "publishBuildIdentityManifest must be a safe package-relative path.",
  );
}
const buildIdentityManifestPath = publishBuildIdentityManifest
  ? path.resolve(cwd, publishBuildIdentityManifest)
  : null;
const catalogBuildIdentity = buildIdentityManifestPath
  ? createCatalogBuildIdentity(await fs.readFile(buildIdentityManifestPath))
  : null;
const catalogBuildBanner = catalogBuildIdentity
  ? formatCatalogBuildBanner(catalogBuildIdentity)
  : undefined;
async function assertBuildBoundaryInputs() {
  if (!catalogBuildIdentity) return;
  await assertCompleteCatalogInputSet(catalogBuildIdentity, repoRoot);
}
await assertBuildBoundaryInputs();

function repositoryModulePath(id) {
  if (!catalogBuildIdentity || !path.isAbsolute(id) || id.includes("\0")) {
    return null;
  }
  const cleanId = id.split("?")[0];
  if (!isPathWithinRoot(repoRoot, cleanId)) return null;
  const relativePath = path.relative(repoRoot, cleanId);
  if (relativePath.split(path.sep).includes("node_modules")) {
    return null;
  }
  return relativePath.replaceAll("\\", "/");
}

const catalogInputGuardPlugin = catalogBuildIdentity
  ? {
      name: "salt-catalog-build-input-guard",
      async load(id) {
        const repoPath = repositoryModulePath(id);
        if (!repoPath) return null;
        const bytes = await fs.readFile(id.split("?")[0]);
        assertCatalogInputBytes(catalogBuildIdentity, repoPath, bytes);
        return bytes.toString("utf8");
      },
    }
  : null;

const typingSourceConfig =
  packageJson.typescriptInclude || packageJson.typescriptRootDir
    ? {
        include: (packageJson.typescriptInclude ?? ["src"]).map((entry) =>
          path.join(cwd, entry),
        ),
        rootDir: path.join(cwd, packageJson.typescriptRootDir ?? "src"),
      }
    : path.join(cwd, "src");
const typingRootDir =
  typeof typingSourceConfig === "string"
    ? typingSourceConfig
    : typingSourceConfig.rootDir;
const capturedTypescriptConfig = await getTypescriptConfig(
  cwd,
  typeof typingSourceConfig === "string"
    ? typingSourceConfig
    : typingSourceConfig.include[0],
);
await assertBuildBoundaryInputs();

const publishedEntryPath = path
  .relative(typingRootDir, sourceEntryPath)
  .replace(/\\/g, "/")
  .replace(/\.ts$/, ".js");
const publishedTypingEntryPath = publishedEntryPath.replace(/\.js$/, ".d.ts");

console.log(`Building ${packageName}`);

await fs.mkdirp(outputDir);
await fs.emptyDir(outputDir);

if (generateTypings) {
  await makeTypings(outputDir, typingSourceConfig, capturedTypescriptConfig);

  if (publishTypingEntryOnly) {
    const typingsDir = path.join(outputDir, "dist-types");
    const typingEntryPath = path.resolve(typingsDir, publishedTypingEntryPath);
    const relativeTypingEntryPath = path.relative(typingsDir, typingEntryPath);

    if (
      relativeTypingEntryPath.startsWith("..") ||
      path.isAbsolute(relativeTypingEntryPath)
    ) {
      throw new Error(
        `Published typing entry must stay inside dist-types: ${publishedTypingEntryPath}`,
      );
    }

    const typingEntry = await fs.readFile(typingEntryPath, "utf8");
    if (/(?:from\s+|import\s*\()\s*["']\.\.?\//u.test(typingEntry)) {
      throw new Error(
        `Cannot publish only ${publishedTypingEntryPath}: its declaration still references a relative module`,
      );
    }

    await fs.emptyDir(typingsDir);
    await fs.outputFile(typingEntryPath, typingEntry, "utf8");
  }
}

const bundle = await rollup({
  input: [sourceEntryPath, ...additionalSourceEntryPaths],
  external: (id) => {
    // via tsdx
    // TODO: this should probably be included into deps instead
    if (id === "babel-plugin-transform-async-to-promises/helpers") {
      // we want to inline these helpers
      return false;
    }
    // exclude any dependency that's not a realtive import
    return !id.startsWith(".") && !path.isAbsolute(id);
  },
  treeshake: {
    propertyReadSideEffects: false,
  },
  plugins: [
    ...(catalogInputGuardPlugin ? [catalogInputGuardPlugin] : []),
    nodeResolve({
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      browser: true,
      mainFields: ["module", "main", "browser"],
    }),
    commonjs({ include: /\/node_modules\// }),
    esbuild({
      target: browserslistToEsbuild(),
      minify: false,
      sourceMap: publishSourceMaps,
      tsconfigRaw: capturedTypescriptConfig,
    }),
    postcss({ extract: false, inject: false }),
    json(),
  ],
});

const transformSourceMap = (relativeSourcePath, sourceMapPath) => {
  // make source map input files relative to the `${packagePath}/dist-${format}` within
  // the package directory

  const absoluteSourcepath = path.resolve(
    path.dirname(sourceMapPath),
    relativeSourcePath,
  );
  const packageRelativeSourcePath = path.relative(cwd, absoluteSourcepath);

  return `../${packageRelativeSourcePath}`;
};

await bundle.write({
  freeze: false,
  sourcemap: publishSourceMaps,
  preserveModules: publishPreserveModules,
  dir: path.join(outputDir, "dist-cjs"),
  format: "cjs",
  exports: "auto",
  ...(catalogBuildBanner ? { banner: catalogBuildBanner } : {}),
  ...(publishSourceMaps ? { sourcemapPathTransform: transformSourceMap } : {}),
});

await bundle.write({
  freeze: false,
  sourcemap: publishSourceMaps,
  preserveModules: publishPreserveModules,
  dir: path.join(outputDir, "dist-es"),
  format: "es",
  exports: "auto",
  ...(catalogBuildBanner ? { banner: catalogBuildBanner } : {}),
  ...(publishSourceMaps ? { sourcemapPathTransform: transformSourceMap } : {}),
});

await bundle.close();
await assertBuildBoundaryInputs();

// The repository root intentionally has no package `type`, while the build
// emits `.js` files for both module formats. Give Node an unambiguous format
// boundary so ESM consumers do not trigger MODULE_TYPELESS_PACKAGE_JSON
// reparsing warnings, and so CJS remains correct if a package later opts into
// `type: module` at its root.
await Promise.all([
  fs.writeJSON(path.join(outputDir, "dist-cjs", "package.json"), {
    type: "commonjs",
  }),
  fs.writeJSON(path.join(outputDir, "dist-es", "package.json"), {
    type: "module",
  }),
]);

const publishedScripts =
  packageJsonForPublish.scripts &&
  typeof packageJsonForPublish.scripts === "object"
    ? Object.fromEntries(
        Object.entries(packageJsonForPublish.scripts).filter(
          ([scriptName]) => !publishScriptExcludes.includes(scriptName),
        ),
      )
    : undefined;

if (publishedScripts && Object.keys(publishedScripts).length > 0) {
  packageJsonForPublish.scripts = publishedScripts;
} else {
  delete packageJsonForPublish.scripts;
}

const publishedDependencies = await transformWorkspaceDeps({
  ...(packageJson.dependencies ?? {}),
  ...publishAdditionalDependencies,
});
const publishedPeerDependencies = packageJson.peerDependencies
  ? await transformWorkspaceDeps(packageJson.peerDependencies)
  : null;
const publishedExtraCopyPaths = publishExtraCopyPaths.map((copyConfig) =>
  typeof copyConfig === "string" ? copyConfig : copyConfig.to,
);

function assertPortableRelativeCopyPath(relativePath, label) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    relativePath !== relativePath.normalize("NFC") ||
    relativePath.includes("\\") ||
    path.isAbsolute(relativePath) ||
    hasForbiddenPortablePathCharacter(relativePath) ||
    relativePath
      .split("/")
      .some(
        (part) =>
          part === "" ||
          part === "." ||
          part === ".." ||
          /[ .]$/u.test(part) ||
          /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(part),
      )
  ) {
    throw new Error(
      `${label} contains an unsafe relative path: ${relativePath}`,
    );
  }
}

async function copyPublishExtraFile(fromPath, toPath, capturedBytes) {
  if (capturedBytes !== undefined) {
    await fs.outputFile(toPath, capturedBytes);
    return;
  }
  await fs.copy(fromPath, toPath);
}

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

async function readManifestBoundInventory(copyConfig, fromPath) {
  assertPortableRelativeCopyPath(
    copyConfig.filesFromManifest,
    "publishExtraCopyPaths.filesFromManifest",
  );
  const manifestPath = path.resolve(cwd, copyConfig.filesFromManifest);
  if (!isPathWithinRoot(cwd, manifestPath)) {
    throw new Error(
      `publishExtraCopyPaths.filesFromManifest escapes the package: ${copyConfig.filesFromManifest}`,
    );
  }
  const manifestRelativePath = path
    .relative(fromPath, manifestPath)
    .replaceAll("\\", "/");
  assertPortableRelativeCopyPath(
    manifestRelativePath,
    "publishExtraCopyPaths.filesFromManifest relative to its copy root",
  );
  const manifestBytes = await fs.readFile(manifestPath);
  if (
    catalogBuildIdentity &&
    buildIdentityManifestPath &&
    path.resolve(manifestPath) === buildIdentityManifestPath
  ) {
    assertCatalogManifestBytes(catalogBuildIdentity, manifestBytes);
  }
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const supportArtifactKind = copyConfig.manifestSupportArtifactKind;
  if (
    typeof supportArtifactKind !== "string" ||
    supportArtifactKind.length === 0
  ) {
    throw new Error(
      "publishExtraCopyPaths.manifestSupportArtifactKind must be a non-empty string",
    );
  }
  const matchingEntries = (manifest.support_artifacts ?? []).filter(
    (entry) => entry.kind === supportArtifactKind,
  );
  if (matchingEntries.length !== 1) {
    throw new Error(
      `${copyConfig.filesFromManifest} must contain exactly one '${supportArtifactKind}' support artifact`,
    );
  }
  const [entry] = matchingEntries;
  assertPortableRelativeCopyPath(
    entry.file,
    `${copyConfig.filesFromManifest} ${supportArtifactKind} file`,
  );
  const inventoryPath = path.resolve(path.dirname(manifestPath), entry.file);
  if (!isPathWithinRoot(fromPath, inventoryPath)) {
    throw new Error(
      `${copyConfig.filesFromManifest} support artifact escapes its copy root: ${entry.file}`,
    );
  }
  const inventoryBytes = await fs.readFile(inventoryPath);
  if (
    inventoryBytes.byteLength !== entry.bytes ||
    sha256(inventoryBytes) !== entry.sha256
  ) {
    throw new Error(
      `${copyConfig.filesFromManifest} support artifact does not match its manifest digest/bytes: ${entry.file}`,
    );
  }
  const inventory = JSON.parse(inventoryBytes.toString("utf8"));
  const expectedInventoryGeneration =
    typeof entry.file === "string" ? path.posix.dirname(entry.file) : null;
  if (
    inventory.schema_version !== manifest.schema_version ||
    inventory.semantic_digest !== manifest.semantic_digest ||
    !Array.isArray(inventory.files) ||
    typeof inventory.generation !== "string" ||
    !/^catalog-generations\/[0-9a-f]{64}$/u.test(inventory.generation) ||
    inventory.generation !== expectedInventoryGeneration ||
    entry.file !== `${inventory.generation}/catalog-publication.json`
  ) {
    throw new Error(
      `${entry.file} must match the manifest schema, semantic identity, and immutable generation`,
    );
  }
  const manifestBoundFiles = [
    manifestRelativePath,
    ...(manifest.artifacts ?? []).map((artifact) => artifact.file),
    ...(manifest.support_artifacts ?? []).map((artifact) => artifact.file),
  ].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  if (
    [...(manifest.artifacts ?? []), ...(manifest.support_artifacts ?? [])].some(
      (artifact) => !artifact.file.startsWith(`${inventory.generation}/`),
    ) ||
    JSON.stringify(inventory.files) !== JSON.stringify(manifestBoundFiles)
  ) {
    throw new Error(
      `${entry.file} does not exactly cover its active manifest generation`,
    );
  }
  const schemaEntries = (manifest.support_artifacts ?? []).filter(
    (artifact) => artifact.kind === "json_schema",
  );
  if (schemaEntries.length !== 1) {
    throw new Error(
      `${copyConfig.filesFromManifest} must contain exactly one catalog schema`,
    );
  }
  const [schemaEntry] = schemaEntries;
  assertPortableRelativeCopyPath(
    schemaEntry.file,
    `${copyConfig.filesFromManifest} catalog schema file`,
  );
  const schemaPath = path.resolve(path.dirname(manifestPath), schemaEntry.file);
  if (!isPathWithinRoot(fromPath, schemaPath)) {
    throw new Error(
      `${copyConfig.filesFromManifest} catalog schema escapes its copy root: ${schemaEntry.file}`,
    );
  }
  const schemaArtifactBytes = await fs.readFile(schemaPath);
  if (
    schemaArtifactBytes.byteLength !== schemaEntry.bytes ||
    sha256(schemaArtifactBytes) !== schemaEntry.sha256
  ) {
    throw new Error(
      `${copyConfig.filesFromManifest} catalog schema does not match its manifest digest/bytes`,
    );
  }
  const catalogSchema = JSON.parse(schemaArtifactBytes.toString("utf8"));
  assertCatalogPublishedSchemaContract(catalogSchema);
  assertCatalogManifestFamilyPartition({ manifest, catalogSchema });
  const requireFromPackage = createRequire(path.join(cwd, "package.json"));
  const Ajv2020 = requireFromPackage("ajv/dist/2020").default;
  const schemaValidator = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  const buildRecordValidators = new Map();
  for (const artifact of manifest.build_artifacts) {
    assertPortableRelativeCopyPath(
      artifact.file,
      `${copyConfig.filesFromManifest} build artifact file`,
    );
    if (
      !artifact.file.startsWith(`${inventory.generation}/`) ||
      inventory.files.includes(artifact.file)
    ) {
      throw new Error(
        `${copyConfig.filesFromManifest} build artifact must be generation-bound and excluded from publication: ${artifact.file}`,
      );
    }
    const artifactPath = path.resolve(
      path.dirname(manifestPath),
      artifact.file,
    );
    if (!isPathWithinRoot(fromPath, artifactPath)) {
      throw new Error(
        `${copyConfig.filesFromManifest} build artifact escapes its copy root: ${artifact.file}`,
      );
    }
    const artifactBytes = await fs.readFile(artifactPath);
    if (
      artifactBytes.byteLength !== artifact.bytes ||
      sha256(artifactBytes) !== artifact.sha256
    ) {
      throw new Error(
        `${copyConfig.filesFromManifest} build artifact does not match its manifest digest/bytes: ${artifact.file}`,
      );
    }
    const envelope = JSON.parse(artifactBytes.toString("utf8"));
    assertCatalogArtifactManifestContract({
      artifact,
      envelope,
      catalogSchema,
    });
    if (
      catalogSchema.artifacts?.[artifact.family] === undefined ||
      artifact.file !==
        `${inventory.generation}/${catalogSchema.artifacts[artifact.family]}` ||
      catalogSchema.codecs?.[artifact.family] !== artifact.codec ||
      catalogSchema.canonical?.[artifact.family] !== artifact.canonical ||
      catalogSchema.publication_states?.[artifact.family] !== "build-only"
    ) {
      throw new Error(
        `${copyConfig.filesFromManifest} build artifact metadata does not match its descriptor-derived schema: ${artifact.file}`,
      );
    }
    if (catalogSchema.storage?.[artifact.family]?.kind === "object") {
      const definition = catalogSchema.definitions?.[artifact.family];
      if (definition === undefined) {
        throw new Error(
          `${copyConfig.filesFromManifest} catalog schema has no definition for build artifact family '${artifact.family}'`,
        );
      }
      let validateRecord = buildRecordValidators.get(artifact.family);
      if (!validateRecord) {
        validateRecord = schemaValidator.compile(definition);
        buildRecordValidators.set(artifact.family, validateRecord);
      }
      for (const record of envelope.records) {
        if (!validateRecord(record)) {
          throw new Error(
            `${copyConfig.filesFromManifest} build artifact record does not match '${artifact.family}' codec: ${JSON.stringify(validateRecord.errors)}`,
          );
        }
      }
    }
  }
  const capturedFiles = new Map([
    [manifestRelativePath, manifestBytes],
    [
      path.relative(fromPath, inventoryPath).replaceAll("\\", "/"),
      inventoryBytes,
    ],
  ]);
  for (const artifact of [
    ...(manifest.artifacts ?? []),
    ...(manifest.support_artifacts ?? []),
  ]) {
    const artifactPath = path.resolve(
      path.dirname(manifestPath),
      artifact.file,
    );
    if (!isPathWithinRoot(fromPath, artifactPath)) {
      throw new Error(
        `${copyConfig.filesFromManifest} artifact escapes its copy root: ${artifact.file}`,
      );
    }
    const relativeArtifactPath = path
      .relative(fromPath, artifactPath)
      .replaceAll("\\", "/");
    const artifactBytes =
      relativeArtifactPath ===
      path.relative(fromPath, inventoryPath).replaceAll("\\", "/")
        ? inventoryBytes
        : await fs.readFile(artifactPath);
    if (
      artifactBytes.byteLength !== artifact.bytes ||
      sha256(artifactBytes) !== artifact.sha256
    ) {
      throw new Error(
        `${copyConfig.filesFromManifest} artifact does not match its manifest digest/bytes: ${artifact.file}`,
      );
    }
    capturedFiles.set(relativeArtifactPath, artifactBytes);
  }
  return {
    capturedFiles,
    inventory,
  };
}

async function resolveExtraCopyFiles(copyConfig, fromPath) {
  const hasExplicitFiles =
    Array.isArray(copyConfig.files) && copyConfig.files.length > 0;
  const selectionCount = [
    hasExplicitFiles,
    Boolean(copyConfig.filesFrom),
    Boolean(copyConfig.filesFromManifest),
  ].filter(Boolean).length;
  if (selectionCount > 1) {
    throw new Error(
      "publishExtraCopyPaths entries may declare only one of files, filesFrom, or filesFromManifest",
    );
  }
  if (hasExplicitFiles) {
    return copyConfig.files.map((relativePath) => ({
      source: relativePath,
      destination: relativePath,
    }));
  }
  if (!copyConfig.filesFrom && !copyConfig.filesFromManifest) {
    return null;
  }

  let inventory;
  let capturedFiles = new Map();
  if (copyConfig.filesFromManifest) {
    const manifestBound = await readManifestBoundInventory(
      copyConfig,
      fromPath,
    );
    inventory = manifestBound.inventory;
    capturedFiles = manifestBound.capturedFiles;
  } else {
    assertPortableRelativeCopyPath(
      copyConfig.filesFrom,
      "publishExtraCopyPaths.filesFrom",
    );
    const inventoryPath = path.resolve(cwd, copyConfig.filesFrom);
    if (!isPathWithinRoot(cwd, inventoryPath)) {
      throw new Error(
        `publishExtraCopyPaths.filesFrom escapes the package: ${copyConfig.filesFrom}`,
      );
    }
    inventory = await fs.readJSON(inventoryPath);
  }
  if (
    !inventory ||
    typeof inventory !== "object" ||
    !Array.isArray(inventory.files)
  ) {
    throw new Error(
      "publishExtraCopyPaths inventory must contain an object with a files array",
    );
  }
  const inventoryLabel =
    copyConfig.filesFromManifest ?? copyConfig.filesFrom ?? "inventory";
  const files = inventory.files;
  const portableFiles = new Map();
  for (const relativePath of files) {
    assertPortableRelativeCopyPath(relativePath, inventoryLabel);
    const portableIdentity = relativePath.normalize("NFC").toLowerCase();
    const previous = portableFiles.get(portableIdentity);
    if (previous && previous !== relativePath) {
      throw new Error(
        `${inventoryLabel} paths collide under portable case normalization: ${previous}, ${relativePath}`,
      );
    }
    portableFiles.set(portableIdentity, relativePath);
  }
  const sortedFiles = [...files].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  if (
    new Set(files).size !== files.length ||
    JSON.stringify(files) !== JSON.stringify(sortedFiles)
  ) {
    throw new Error(`${inventoryLabel} files must be unique and sorted`);
  }
  for (const relativePath of files) {
    const sourcePath = path.resolve(fromPath, relativePath);
    if (!isPathWithinRoot(fromPath, sourcePath)) {
      throw new Error(
        `${inventoryLabel} path escapes its copy root: ${relativePath}`,
      );
    }
  }
  for (const capturedPath of capturedFiles.keys()) {
    if (!files.includes(capturedPath)) {
      throw new Error(
        `${copyConfig.filesFromManifest} inventory does not publish captured file ${capturedPath}`,
      );
    }
  }
  return files.map((relativePath) => ({
    source: relativePath,
    destination: relativePath,
    ...(capturedFiles.has(relativePath)
      ? { capturedBytes: capturedFiles.get(relativePath) }
      : {}),
  }));
}

await fs.writeJSON(
  path.join(outputDir, "package.json"),
  {
    ...packageJsonForPublish,
    ...(Object.keys(publishedDependencies).length > 0
      ? { dependencies: publishedDependencies }
      : {}),
    ...(publishedPeerDependencies &&
    Object.keys(publishedPeerDependencies).length > 0
      ? {
          peerDependencies: publishedPeerDependencies,
        }
      : {}),
    ...(Object.keys(publishConfigForPublish).length > 0
      ? { publishConfig: publishConfigForPublish }
      : {}),
    ...(publishExports ? { exports: publishExports } : {}),
    main: `dist-cjs/${publishedEntryPath}`,
    module: `dist-es/${publishedEntryPath}`,
    ...(generateTypings
      ? { typings: `dist-types/${publishedTypingEntryPath}` }
      : {}),
    files: distinct([
      ...(packageJson.files ?? []),
      ...publishedExtraCopyPaths,
      "dist-cjs",
      "dist-es",
      ...(generateTypings ? ["dist-types"] : []),
      ...(publishIncludeChangelog ? ["CHANGELOG.md"] : []),
    ]),
  },
  { spaces: 2 },
);

for (const file of FILES_TO_COPY) {
  let filePath = path.join(cwd, file);
  if (file === "LICENSE" && !(await fs.pathExists(filePath))) {
    filePath = path.join(repoRoot, file);
  }
  try {
    await fs.copy(filePath, path.join(outputDir, file));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

for (const copyConfig of publishExtraCopyPaths) {
  const fromPath =
    typeof copyConfig === "string"
      ? path.join(cwd, copyConfig)
      : path.resolve(cwd, copyConfig.from);
  const toPath =
    typeof copyConfig === "string"
      ? path.join(outputDir, copyConfig)
      : path.join(outputDir, copyConfig.to);

  const selectedFiles =
    typeof copyConfig === "object"
      ? await resolveExtraCopyFiles(copyConfig, fromPath)
      : null;

  if (selectedFiles) {
    await Promise.all(
      selectedFiles.map(async ({ source, destination, capturedBytes }) => {
        await copyPublishExtraFile(
          path.join(fromPath, source),
          path.join(toPath, destination),
          capturedBytes,
        );
      }),
    );
  } else {
    await fs.copy(fromPath, toPath);
  }
}

for (const [relativeBinPath, entrypoint] of Object.entries(
  publishBinEntrypoints,
)) {
  const {
    requirePath,
    exportName = "runCli",
    errorPrefix = `${packageName} error:`,
    conciseErrorCodes = [],
  } = entrypoint;
  const binPath = path.join(outputDir, relativeBinPath);

  await fs.mkdirp(path.dirname(binPath));
  await fs.writeFile(
    binPath,
    `#!/usr/bin/env node

const { ${exportName} } = require(${JSON.stringify(requirePath)});

${exportName}(process.argv.slice(2))
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    const concise = ${JSON.stringify(conciseErrorCodes)}.includes(error?.code);
    const rendered = concise && error instanceof Error
      ? error.message
      : error?.stack ?? String(error);
    console.error(${JSON.stringify(errorPrefix)}, rendered);
    process.exit(1);
  });
`,
    "utf8",
  );
  await fs.chmod(binPath, 0o755);
}

await assertBuildBoundaryInputs();
console.log(`Built ${packageName} into ${outputDir}`);
