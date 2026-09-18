import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { builtinModules, createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizePortableRepositoryBuildPath } from "../../../scripts/catalogBuildIdentity.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(packageRoot, "..", "..");
const generatorEntryPath = path.join(
  packageRoot,
  "src",
  "build",
  "knowledgeGeneratorEntry.ts",
);
const generatorNoSourceMapPath = path.join(
  packageRoot,
  "src",
  "build",
  "knowledgeGeneratorNoSourceMap.ts",
);
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const BUILTIN_MODULES = new Set(
  builtinModules.flatMap((name) => [
    name,
    name.startsWith("node:") ? name.slice(5) : `node:${name}`,
  ]),
);

function canonicalJson(value) {
  const sortValue = (candidate) => {
    if (Array.isArray(candidate)) return candidate.map(sortValue);
    if (candidate && typeof candidate === "object") {
      return Object.fromEntries(
        Object.entries(candidate)
          .filter(([, entry]) => entry !== undefined)
          .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
          .map(([key, entry]) => [key, sortValue(entry)]),
      );
    }
    return candidate;
  };
  return JSON.stringify(sortValue(value));
}

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function isWithin(rootPath, candidatePath) {
  const relative = path.relative(
    path.resolve(rootPath),
    path.resolve(candidatePath),
  );
  return (
    relative === "" ||
    (relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
}

function assertGeneratorTypeScriptIdentity(
  generator,
  expectedPackageRoot,
  expectedVersion,
) {
  const identity = generator.knowledgeGeneratorTypeScriptIdentity;
  const expectedLibDirectory = path.join(expectedPackageRoot, "lib");
  if (
    !identity ||
    identity.version !== expectedVersion ||
    path.resolve(identity.default_lib_directory) !==
      path.resolve(expectedLibDirectory)
  ) {
    throw new Error(
      "Generator bundle did not load the exact sealed TypeScript installation.",
    );
  }
}

function assertPortablePath(portablePath) {
  return normalizePortableRepositoryBuildPath(
    portablePath,
    "Non-portable generator dependency path",
  );
}

export function assertCleanGeneratorEnvironment(
  environment = process.env,
  execArgv = process.execArgv,
) {
  for (const name of [
    "NODE_OPTIONS",
    "NODE_PATH",
    "NODE_ICU_DATA",
    "NODE_PRESERVE_SYMLINKS",
    "NODE_PRESERVE_SYMLINKS_MAIN",
    "NODE_V8_COVERAGE",
    "NODE_COMPILE_CACHE",
    "NODE_DISABLE_COMPILE_CACHE",
    "UV_THREADPOOL_SIZE",
    "ESBUILD_BINARY_PATH",
    "ESBUILD_WORKER_THREADS",
    "ESBUILD_MAX_BUFFER",
  ]) {
    if (environment[name]?.trim()) {
      throw new Error(
        `Catalog generation rejects influential ambient variable ${name}.`,
      );
    }
  }
  const forbiddenArgument = execArgv[0];
  if (forbiddenArgument) {
    throw new Error(
      `Catalog generation rejects Node argument '${forbiddenArgument}' so the runtime receipt remains canonical.`,
    );
  }
}

export async function withCanonicalGeneratorEnvironment(action) {
  const ambientEnvironment = process.env;
  process.env = Object.create(null);
  try {
    if (Object.keys(process.env).length !== 0) {
      throw new Error("Catalog generator environment could not be emptied.");
    }
    return await action();
  } finally {
    process.env = ambientEnvironment;
  }
}

async function mapWithConcurrency(values, concurrency, action) {
  const results = new Array(values.length);
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, async () => {
      while (nextIndex < values.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await action(values[index], index);
      }
    }),
  );
  return results;
}

export async function createGeneratorDependencyInventory(
  sourceRoot = repoRoot,
) {
  const resolvedRepoRoot = path.resolve(sourceRoot);
  const resolvedNodeModulesRoot = path.join(resolvedRepoRoot, "node_modules");
  const nodeModulesStats = await fs.lstat(resolvedNodeModulesRoot);
  if (!nodeModulesStats.isDirectory() || nodeModulesStats.isSymbolicLink()) {
    throw new Error(
      "Canonical generator dependencies require a real repository node_modules directory.",
    );
  }
  const installedPackages = [];
  const workspaceLinks = [];
  const packageRootsByName = new Map();
  const entryByPath = new Map();
  const files = [];

  const readJson = async (filePath) =>
    JSON.parse(await fs.readFile(filePath, "utf8"));
  const pathExists = async (targetPath) => {
    try {
      await fs.lstat(targetPath);
      return true;
    } catch (error) {
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return false;
      throw error;
    }
  };
  const addEntry = (entry) => {
    const existing = entryByPath.get(entry.path);
    if (existing && canonicalJson(existing) !== canonicalJson(entry)) {
      throw new Error(
        `Conflicting generator dependency topology at '${entry.path}'.`,
      );
    }
    entryByPath.set(entry.path, entry);
  };
  const sortedDirents = async (directoryPath) =>
    (await fs.readdir(directoryPath, { withFileTypes: true })).sort(
      (left, right) =>
        left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );

  async function inspectPackageRoot(absolutePath, portablePath, dirent) {
    if (dirent.isSymbolicLink()) {
      const rawLinkTarget = await fs.readlink(absolutePath);
      const resolvedRawTarget = path.resolve(
        path.dirname(absolutePath),
        rawLinkTarget,
      );
      const realPath = await fs.realpath(absolutePath);
      if (
        !isWithin(resolvedRepoRoot, resolvedRawTarget) ||
        !isWithin(resolvedRepoRoot, realPath)
      ) {
        throw new Error(
          `Generator dependency link escapes the repository: ${portablePath}.`,
        );
      }
      const raw_target = assertPortablePath(
        toPosixPath(path.relative(resolvedRepoRoot, resolvedRawTarget)),
      );
      const target = assertPortablePath(
        toPosixPath(path.relative(resolvedRepoRoot, realPath)),
      );
      workspaceLinks.push({
        kind: "link",
        path: portablePath,
        raw_target,
        target,
      });
      return;
    }
    if (!dirent.isDirectory()) return;
    const manifestPath = path.join(absolutePath, "package.json");
    if (!(await pathExists(manifestPath))) return;
    const manifest = await readJson(manifestPath);
    files.push({
      absolutePath: manifestPath,
      path: assertPortablePath(`${portablePath}/package.json`),
    });
    if (typeof manifest.name !== "string" || manifest.name.length === 0) {
      throw new Error(`Installed package has no name: ${portablePath}.`);
    }
    const installed = {
      name: manifest.name,
      root: absolutePath,
      path: portablePath,
      manifest,
    };
    installedPackages.push(installed);
    const roots = packageRootsByName.get(installed.name) ?? [];
    roots.push(installed);
    packageRootsByName.set(installed.name, roots);
    const nestedNodeModules = path.join(absolutePath, "node_modules");
    if (await pathExists(nestedNodeModules)) {
      await discoverNodeModules(
        nestedNodeModules,
        `${portablePath}/node_modules`,
      );
    }
  }

  async function discoverNodeModules(directoryPath, portableDirectory) {
    for (const dirent of await sortedDirents(directoryPath)) {
      if (dirent.name.startsWith(".")) continue;
      const absolutePath = path.join(directoryPath, dirent.name);
      const portablePath = assertPortablePath(
        `${portableDirectory}/${dirent.name}`,
      );
      if (dirent.name.startsWith("@") && dirent.isDirectory()) {
        for (const scopedEntry of await sortedDirents(absolutePath)) {
          await inspectPackageRoot(
            path.join(absolutePath, scopedEntry.name),
            assertPortablePath(`${portablePath}/${scopedEntry.name}`),
            scopedEntry,
          );
        }
      } else {
        await inspectPackageRoot(absolutePath, portablePath, dirent);
      }
    }
  }

  await discoverNodeModules(resolvedNodeModulesRoot, "node_modules");

  const seedNames = new Set(["esbuild", "typescript"]);
  const addDependencyNames = (manifest, includeDevDependencies = false) => {
    for (const section of [
      manifest.dependencies,
      manifest.optionalDependencies,
      manifest.peerDependencies,
      ...(includeDevDependencies ? [manifest.devDependencies] : []),
    ]) {
      if (!section || typeof section !== "object") continue;
      for (const dependencyName of Object.keys(section)) {
        seedNames.add(dependencyName);
      }
    }
  };
  const packagesDirectory = path.join(resolvedRepoRoot, "packages");
  for (const dirent of await sortedDirents(packagesDirectory)) {
    if (!dirent.isDirectory()) continue;
    const manifestPath = path.join(
      packagesDirectory,
      dirent.name,
      "package.json",
    );
    if (!(await pathExists(manifestPath))) continue;
    const manifest = await readJson(manifestPath);
    addDependencyNames(manifest, manifest.name === "@salt-ds/knowledge");
  }
  const rootManifest = await readJson(
    path.join(resolvedRepoRoot, "package.json"),
  );
  if (rootManifest.dependencies) addDependencyNames(rootManifest, false);
  for (const packageName of packageRootsByName.keys()) {
    if (packageName.startsWith("@types/")) seedNames.add(packageName);
  }

  const selectedRoots = new Map();
  const pendingNames = [...seedNames];
  const visitedNames = new Set();
  while (pendingNames.length > 0) {
    const packageName = pendingNames.shift();
    if (!packageName || visitedNames.has(packageName)) continue;
    visitedNames.add(packageName);
    for (const installed of packageRootsByName.get(packageName) ?? []) {
      if (selectedRoots.has(installed.path)) continue;
      selectedRoots.set(installed.path, installed);
      for (const section of [
        installed.manifest.dependencies,
        installed.manifest.optionalDependencies,
        installed.manifest.peerDependencies,
      ]) {
        if (!section || typeof section !== "object") continue;
        pendingNames.push(...Object.keys(section));
      }
    }
  }

  const addAncestorDirectories = (portablePath) => {
    const segments = portablePath.split("/");
    for (let index = 1; index <= segments.length; index += 1) {
      addEntry({
        kind: "directory",
        path: segments.slice(0, index).join("/"),
      });
    }
  };
  addEntry({ kind: "directory", path: "node_modules" });
  for (const file of files) {
    addAncestorDirectories(path.posix.dirname(file.path));
  }
  for (const link of workspaceLinks) {
    addAncestorDirectories(path.posix.dirname(link.path));
    addEntry(link);
  }

  async function inventoryPackageDirectory(directoryPath, portableDirectory) {
    for (const dirent of await sortedDirents(directoryPath)) {
      if (dirent.name === "node_modules") continue;
      const absolutePath = path.join(directoryPath, dirent.name);
      const portablePath = assertPortablePath(
        `${portableDirectory}/${dirent.name}`,
      );
      if (dirent.isSymbolicLink()) {
        throw new Error(
          `Selected external package contains unsupported link '${portablePath}'.`,
        );
      }
      if (dirent.isDirectory()) {
        addEntry({ kind: "directory", path: portablePath });
        await inventoryPackageDirectory(absolutePath, portablePath);
      } else if (dirent.isFile()) {
        files.push({ absolutePath, path: portablePath });
      } else {
        throw new Error(
          `Unsupported generator dependency entry type: ${portablePath}.`,
        );
      }
    }
  }

  for (const installed of [...selectedRoots.values()].sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  )) {
    addAncestorDirectories(installed.path);
    await inventoryPackageDirectory(installed.root, installed.path);
  }

  const fileEntries = await mapWithConcurrency(
    files,
    32,
    async ({ absolutePath, path: portablePath }) => {
      const bytes = await fs.readFile(absolutePath);
      return {
        kind: "file",
        path: portablePath,
        sha256: sha256(bytes),
        bytes: bytes.byteLength,
      };
    },
  );
  for (const entry of fileEntries) addEntry(entry);
  const entries = [...entryByPath.values()].sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
  const spellings = new Map();
  let previousPath = null;
  for (const entry of entries) {
    const portableKey = entry.path.normalize("NFC").toLowerCase();
    if (
      spellings.has(portableKey) ||
      (previousPath !== null && previousPath >= entry.path)
    ) {
      throw new Error(
        `Generator dependency inventory has a case, Unicode, or duplicate collision at '${entry.path}'.`,
      );
    }
    spellings.set(portableKey, entry.path);
    previousPath = entry.path;
  }
  const payload = { schema_version: "1.0.0", entries };
  return {
    ...payload,
    digest: sha256(Buffer.from(canonicalJson(payload), "utf8")),
  };
}

function inventoryIdentity(inventory) {
  return canonicalJson({
    digest: inventory.digest,
    entries: inventory.entries,
  });
}

function assertSameInventory(expected, actual, label) {
  if (inventoryIdentity(expected) !== inventoryIdentity(actual)) {
    throw new Error(`${label} changed during catalog generation.`);
  }
}

function dependencyFileEntry(inventory, portablePath) {
  const entry = inventory.entries.find(
    (candidate) => candidate.kind === "file" && candidate.path === portablePath,
  );
  if (!entry) {
    throw new Error(
      `Generator dependency inventory has no file '${portablePath}'.`,
    );
  }
  return entry;
}

async function readVerifiedDependencyBytes(
  sourceRoot,
  inventory,
  portablePath,
) {
  const entry = dependencyFileEntry(inventory, portablePath);
  const absolutePath = path.resolve(sourceRoot, ...portablePath.split("/"));
  if (
    !portablePath.startsWith("node_modules/") ||
    !isWithin(path.join(sourceRoot, "node_modules"), absolutePath)
  ) {
    throw new Error(
      `Generator dependency snapshot path escapes node_modules: '${portablePath}'.`,
    );
  }
  const bytes = await fs.readFile(absolutePath);
  if (bytes.byteLength !== entry.bytes || sha256(bytes) !== entry.sha256) {
    throw new Error(
      `Generator dependency changed after inventory capture: ${portablePath}.`,
    );
  }
  return bytes;
}

async function readVerifiedDependencyJson(sourceRoot, inventory, portablePath) {
  return JSON.parse(
    (
      await readVerifiedDependencyBytes(sourceRoot, inventory, portablePath)
    ).toString("utf8"),
  );
}

function resolvePackageEntryPortablePath(packageRootPath, manifest) {
  if (
    typeof manifest.main !== "string" ||
    manifest.main.length === 0 ||
    manifest.main.includes("\\") ||
    path.posix.isAbsolute(manifest.main)
  ) {
    throw new Error(
      `Generator tool package '${packageRootPath}' has no safe CommonJS entry.`,
    );
  }
  const entryPath = assertPortablePath(
    path.posix.normalize(`${packageRootPath}/${manifest.main}`),
  );
  if (!entryPath.startsWith(`${packageRootPath}/`)) {
    throw new Error(
      `Generator tool package entry escapes '${packageRootPath}'.`,
    );
  }
  return entryPath;
}

function packageConstraintAllows(constraint, currentValue) {
  if (!Array.isArray(constraint)) return true;
  if (constraint.includes(`!${currentValue}`)) return false;
  const positiveValues = constraint.filter((value) => !value.startsWith("!"));
  return positiveValues.length === 0 || positiveValues.includes(currentValue);
}

async function resolveEsbuildBinary(
  sourceRoot,
  dependencyInventory,
  esbuildManifest,
) {
  const binaryHashes = esbuildManifest["esbuild.binaryHashes"];
  if (!binaryHashes || typeof binaryHashes !== "object") {
    throw new Error("The sealed esbuild manifest has no binary hash map.");
  }
  const candidates = [];
  for (const [relativePath, expectedDigest] of Object.entries(binaryHashes)) {
    const portablePath = assertPortablePath(`node_modules/${relativePath}`);
    const entry = dependencyInventory.entries.find(
      (candidate) =>
        candidate.kind === "file" && candidate.path === portablePath,
    );
    if (!entry || entry.sha256 !== `sha256:${expectedDigest}`) continue;
    const segments = relativePath.split("/");
    const packageName = relativePath.startsWith("@")
      ? segments.slice(0, 2).join("/")
      : segments[0];
    const packageRootPath = `node_modules/${packageName}`;
    const platformManifest = await readVerifiedDependencyJson(
      sourceRoot,
      dependencyInventory,
      `${packageRootPath}/package.json`,
    );
    if (
      platformManifest.name === packageName &&
      platformManifest.version === esbuildManifest.version &&
      packageConstraintAllows(platformManifest.os, process.platform) &&
      packageConstraintAllows(platformManifest.cpu, process.arch)
    ) {
      candidates.push({
        packageRootPath,
        path: portablePath,
        sha256: entry.sha256,
      });
    }
  }
  if (candidates.length !== 1) {
    throw new Error(
      `Expected exactly one sealed esbuild binary for ${process.platform}/${process.arch}; found ${candidates.length}.`,
    );
  }
  return candidates[0];
}

function selectedSnapshotEntries(dependencyInventory, portableRoots) {
  const selected = dependencyInventory.entries.filter((entry) =>
    portableRoots.some(
      (rootPath) =>
        entry.path === rootPath ||
        entry.path.startsWith(`${rootPath}/`) ||
        rootPath.startsWith(`${entry.path}/`),
    ),
  );
  for (const rootPath of portableRoots) {
    if (
      !selected.some(
        (entry) => entry.kind === "directory" && entry.path === rootPath,
      )
    ) {
      throw new Error(
        `Generator dependency snapshot root is absent from inventory: ${rootPath}.`,
      );
    }
  }
  const unsupportedLink = selected.find((entry) => entry.kind === "link");
  if (unsupportedLink) {
    throw new Error(
      `Generator tool snapshot rejects links: ${unsupportedLink.path}.`,
    );
  }
  return selected;
}

async function inspectDependencySnapshot(nodeModulesPath) {
  const entries = [{ kind: "directory", path: "node_modules" }];
  async function visit(directoryPath, portableDirectory) {
    const dirents = (
      await fs.readdir(directoryPath, { withFileTypes: true })
    ).sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
    for (const dirent of dirents) {
      const absolutePath = path.join(directoryPath, dirent.name);
      const portablePath = `${portableDirectory}/${dirent.name}`;
      if (dirent.isSymbolicLink()) {
        throw new Error(
          `Generator tool snapshot contains a link: ${portablePath}.`,
        );
      }
      if (dirent.isDirectory()) {
        entries.push({ kind: "directory", path: portablePath });
        await visit(absolutePath, portablePath);
      } else if (dirent.isFile()) {
        const bytes = await fs.readFile(absolutePath);
        entries.push({
          kind: "file",
          path: portablePath,
          sha256: sha256(bytes),
          bytes: bytes.byteLength,
        });
      } else {
        throw new Error(
          `Generator tool snapshot contains an unsupported entry: ${portablePath}.`,
        );
      }
    }
  }
  await visit(nodeModulesPath, "node_modules");
  return entries.sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
}

export async function materializeVerifiedDependencySnapshot({
  sourceRoot,
  dependencyInventory,
  portableRoots,
  snapshotRoot,
}) {
  const expectedInventoryDigest = sha256(
    Buffer.from(
      canonicalJson({
        schema_version: dependencyInventory.schema_version,
        entries: dependencyInventory.entries,
      }),
      "utf8",
    ),
  );
  if (
    dependencyInventory.schema_version !== "1.0.0" ||
    dependencyInventory.digest !== expectedInventoryDigest
  ) {
    throw new Error(
      "Generator dependency snapshot requires a valid inventory.",
    );
  }
  const selectedEntries = selectedSnapshotEntries(
    dependencyInventory,
    portableRoots,
  );
  const expectedIdentity = canonicalJson(selectedEntries);
  const nodeModulesPath = path.join(snapshotRoot, "node_modules");
  await fs.mkdir(nodeModulesPath, { recursive: false });
  try {
    for (const entry of selectedEntries) {
      if (entry.path === "node_modules" || entry.kind === "directory") {
        continue;
      }
      const relativePath = entry.path.slice("node_modules/".length);
      const destinationPath = path.join(
        nodeModulesPath,
        ...relativePath.split("/"),
      );
      await fs.mkdir(path.dirname(destinationPath), { recursive: true });
      const bytes = await readVerifiedDependencyBytes(
        sourceRoot,
        dependencyInventory,
        entry.path,
      );
      await fs.writeFile(destinationPath, bytes, { flag: "wx" });
    }
    const materializedIdentity = canonicalJson(
      await inspectDependencySnapshot(nodeModulesPath),
    );
    if (materializedIdentity !== expectedIdentity) {
      throw new Error(
        "Generator tool snapshot differs from its sealed dependency inventory.",
      );
    }
    const assertStable = async () => {
      const currentIdentity = canonicalJson(
        await inspectDependencySnapshot(nodeModulesPath),
      );
      if (currentIdentity !== expectedIdentity) {
        throw new Error(
          "Generator tool snapshot changed after materialization.",
        );
      }
    };
    await assertStable();
    const payload = { schema_version: "1.0.0", entries: selectedEntries };
    return {
      digest: sha256(Buffer.from(canonicalJson(payload), "utf8")),
      entries: selectedEntries,
      fileCount: selectedEntries.filter((entry) => entry.kind === "file")
        .length,
      nodeModulesPath,
      assertStable,
    };
  } catch (error) {
    await fs.rm(nodeModulesPath, { recursive: true, force: true });
    throw error;
  }
}

export async function verifySealedGeneratorBundleStability({
  sourceRoot,
  semanticInputPatterns = [],
  compilerInputPatterns = [],
  dependencyInventory,
  createDependencyInventory,
  buildBundle,
  assertToolSnapshotStable,
  assertGeneratorIdentity,
}) {
  await assertToolSnapshotStable();
  const firstBundle = await buildBundle("first");
  await assertToolSnapshotStable();
  assertGeneratorIdentity(firstBundle.generator);
  const inputPatterns = [
    ...semanticInputPatterns,
    ...compilerInputPatterns,
  ];
  const inputBefore = await firstBundle.generator.createCatalogInputInventory(
    sourceRoot,
    inputPatterns,
  );
  const sourceInputPaths = new Set(
    inputBefore.entries.map((entry) => entry.path),
  );
  for (const bundleInput of firstBundle.firstPartyInputs) {
    if (!sourceInputPaths.has(bundleInput)) {
      throw new Error(
        `Generator bundle consumed an un-inventoried repository source: ${bundleInput}.`,
      );
    }
  }

  const dependencyBetween = await createDependencyInventory(sourceRoot);
  assertSameInventory(
    dependencyInventory,
    dependencyBetween,
    "Generator dependency inventory",
  );
  const finalBundle = await buildBundle("final");
  await assertToolSnapshotStable();
  if (
    !firstBundle.bytes.equals(finalBundle.bytes) ||
    firstBundle.digest !== finalBundle.digest ||
    firstBundle.metafileDigest !== finalBundle.metafileDigest
  ) {
    throw new Error(
      "Catalog generator bundle was not byte-identical across the sealed dependency snapshot.",
    );
  }

  assertGeneratorIdentity(finalBundle.generator);
  const inputAfterBundle =
    await finalBundle.generator.createCatalogInputInventory(
      sourceRoot,
      inputPatterns,
    );
  assertSameInventory(
    inputBefore,
    inputAfterBundle,
    "Catalog source inventory",
  );
  return {
    finalBundle,
    generator: finalBundle.generator,
    inputInventory: inputBefore,
  };
}

function bundleOptions(outfile, layout = {}) {
  const activeRepoRoot = path.resolve(layout.sourceRoot ?? repoRoot);
  const activeGeneratorEntryPath = path.resolve(
    layout.generatorEntryPath ?? generatorEntryPath,
  );
  const activeGeneratorNoSourceMapPath = path.resolve(
    layout.generatorNoSourceMapPath ?? generatorNoSourceMapPath,
  );
  return {
    entryPoints: [activeGeneratorEntryPath],
    outfile,
    absWorkingDir: activeRepoRoot,
    bundle: true,
    format: "cjs",
    platform: "node",
    target: "node22",
    external: ["typescript"],
    metafile: true,
    sourcemap: false,
    logLevel: "silent",
    conditions: ["node", "import", "default"],
    alias: {
      "react-docgen-typescript": path.join(
        activeRepoRoot,
        "node_modules",
        "react-docgen-typescript",
      ),
      "source-map-js": activeGeneratorNoSourceMapPath,
    },
    resolveExtensions: [
      ".tsx",
      ".ts",
      ".mts",
      ".cts",
      ".jsx",
      ".js",
      ".mjs",
      ".cjs",
      ".css",
      ".json",
    ],
    tsconfigRaw: {
      compilerOptions: {},
    },
  };
}

export function validateBundleMetafile(
  metafile,
  dependencyInventory,
  sourceRoot = repoRoot,
) {
  const dependencyFiles = new Set(
    dependencyInventory.entries
      .filter((entry) => entry.kind === "file")
      .map((entry) => entry.path),
  );
  let sawTypeScriptExternal = false;
  for (const inputPath of Object.keys(metafile.inputs)) {
    const portablePath = portableBundleInputPath(inputPath, sourceRoot);
    if (portablePath.startsWith("node_modules/source-map-js/")) {
      throw new Error(
        `Generator bundle retained forbidden source-map runtime code: ${portablePath}.`,
      );
    }
    if (
      portablePath.startsWith("node_modules/") &&
      !dependencyFiles.has(portablePath)
    ) {
      throw new Error(
        `Generator bundle consumed an un-inventoried dependency: ${portablePath}.`,
      );
    }
  }
  for (const output of Object.values(metafile.outputs)) {
    for (const imported of output.imports ?? []) {
      if (!imported.external) continue;
      if (imported.path === "typescript") {
        sawTypeScriptExternal = true;
        continue;
      }
      if (BUILTIN_MODULES.has(imported.path)) continue;
      throw new Error(
        `Generator bundle retained undeclared external import '${imported.path}'.`,
      );
    }
  }
  if (!sawTypeScriptExternal) {
    throw new Error(
      "Generator bundle did not retain the expected exact TypeScript external.",
    );
  }
}

function portableBundleInputPath(inputPath, sourceRoot = repoRoot) {
  const activeSourceRoot = path.resolve(sourceRoot);
  const absolutePath = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(activeSourceRoot, inputPath);
  if (!isWithin(activeSourceRoot, absolutePath)) {
    throw new Error(
      `Generator bundle input escapes the repository: ${inputPath}.`,
    );
  }
  return assertPortablePath(
    toPosixPath(path.relative(activeSourceRoot, absolutePath)),
  );
}

export function getBundleFirstPartyInputPaths(metafile, sourceRoot = repoRoot) {
  return Object.keys(metafile.inputs)
    .map((inputPath) => portableBundleInputPath(inputPath, sourceRoot))
    .filter((inputPath) => !inputPath.startsWith("node_modules/"))
    .sort();
}

export function createBundleMetafileDigest(metafile) {
  const outputs = Object.values(metafile.outputs ?? {});
  if (outputs.length !== 1) {
    throw new Error(
      "Catalog generator bundle must produce exactly one inspected output.",
    );
  }
  return sha256(
    Buffer.from(
      canonicalJson({
        inputs: metafile.inputs,
        output: outputs[0],
      }),
      "utf8",
    ),
  );
}

export function assertNoDynamicCodeLoading(bundleSource, typescript) {
  if (!typescript || typeof typescript.createSourceFile !== "function") {
    throw new Error(
      "Generator bundle inspection requires the exact sealed TypeScript parser.",
    );
  }
  const sourceFile = typescript.createSourceFile(
    "catalog-generator-bundle.mjs",
    bundleSource,
    typescript.ScriptTarget.Latest,
    true,
    typescript.ScriptKind.JS,
  );

  const unwrapExpression = (candidate) => {
    let current = candidate;
    while (typescript.isParenthesizedExpression(current)) {
      current = current.expression;
    }
    if (
      typescript.isBinaryExpression(current) &&
      current.operatorToken.kind === typescript.SyntaxKind.CommaToken
    ) {
      return unwrapExpression(current.right);
    }
    return current;
  };
  const staticPropertyName = (candidate) => {
    const expression = unwrapExpression(candidate);
    if (typescript.isIdentifier(expression)) return expression.text;
    if (typescript.isPropertyAccessExpression(expression)) {
      return expression.name.text;
    }
    if (
      typescript.isElementAccessExpression(expression) &&
      expression.argumentExpression &&
      typescript.isStringLiteral(expression.argumentExpression)
    ) {
      return expression.argumentExpression.text;
    }
    return null;
  };
  const referencesIdentifier = (candidate, identifier) => {
    const expression = unwrapExpression(candidate);
    if (typescript.isIdentifier(expression)) {
      return expression.text === identifier;
    }
    if (typescript.isPropertyAccessExpression(expression)) {
      return referencesIdentifier(expression.expression, identifier);
    }
    if (typescript.isElementAccessExpression(expression)) {
      return referencesIdentifier(expression.expression, identifier);
    }
    return false;
  };

  let finding = null;
  const visit = (node) => {
    if (finding) return;
    if (typescript.isNewExpression(node)) {
      if (referencesIdentifier(node.expression, "Function")) {
        finding = "Function constructor";
        return;
      }
    } else if (typescript.isCallExpression(node)) {
      if (node.expression.kind === typescript.SyntaxKind.ImportKeyword) {
        if (
          node.arguments.length !== 1 ||
          !typescript.isStringLiteral(node.arguments[0])
        ) {
          finding = "dynamic import";
          return;
        }
      } else {
        const callee = unwrapExpression(node.expression);
        const calleeName = staticPropertyName(callee);
        if (
          calleeName === "eval" ||
          calleeName === "Function" ||
          referencesIdentifier(callee, "eval") ||
          referencesIdentifier(callee, "Function")
        ) {
          finding = calleeName === "eval" ? "eval" : "Function constructor";
          return;
        }
        if (calleeName === "createRequire") {
          finding = "createRequire";
          return;
        }
        if (calleeName === "require" || calleeName === "__require") {
          if (
            !typescript.isIdentifier(callee) ||
            node.arguments.length !== 1 ||
            !typescript.isStringLiteral(node.arguments[0])
          ) {
            finding = "dynamic require";
            return;
          }
        }
        if (
          (typescript.isPropertyAccessExpression(callee) ||
            typescript.isElementAccessExpression(callee)) &&
          (referencesIdentifier(callee.expression, "require") ||
            referencesIdentifier(callee.expression, "__require"))
        ) {
          finding = "runtime require method";
          return;
        }
      }
    }
    typescript.forEachChild(node, visit);
  };
  visit(sourceFile);
  if (finding) {
    throw new Error(
      `Generator bundle contains forbidden runtime code loading (${finding}).`,
    );
  }
}

async function bundleAndInspect(
  esbuild,
  typescript,
  outfile,
  dependencyInventory,
  layout = {},
) {
  const result = await esbuild.build(bundleOptions(outfile, layout));
  if (!result.metafile) {
    throw new Error("Generator bundle did not produce an esbuild metafile.");
  }
  validateBundleMetafile(
    result.metafile,
    dependencyInventory,
    layout.sourceRoot,
  );
  const bytes = await fs.readFile(outfile);
  assertNoDynamicCodeLoading(bytes.toString("utf8"), typescript);
  return {
    digest: sha256(bytes),
    bytes,
    firstPartyInputs: getBundleFirstPartyInputPaths(
      result.metafile,
      layout.sourceRoot,
    ),
    metafileDigest: createBundleMetafileDigest(result.metafile),
  };
}

async function hashFile(filePath) {
  return sha256(await fs.readFile(filePath));
}

export function createGeneratorDigest(receipt) {
  const digest = sha256(Buffer.from(canonicalJson(receipt), "utf8"));
  if (!SHA256_PATTERN.test(digest)) {
    throw new Error("Failed to create the composite generator digest.");
  }
  return digest;
}

export async function buildCatalogRegistry(options = {}) {
  assertCleanGeneratorEnvironment();
  return withCanonicalGeneratorEnvironment(async () => {
    const sourceRoot = path.resolve(options.sourceRoot ?? repoRoot);
    const activePackageRoot = path.resolve(
      options.packageRoot ?? path.join(sourceRoot, "packages", "knowledge"),
    );
    const outputDir = path.resolve(
      options.outputDir ?? path.join(activePackageRoot, "generated"),
    );
    const activeGeneratorEntryPath = path.resolve(
      options.generatorEntryPath ??
        path.join(
          activePackageRoot,
          "src",
          "build",
          "knowledgeGeneratorEntry.ts",
        ),
    );
    const activeGeneratorNoSourceMapPath = path.resolve(
      options.generatorNoSourceMapPath ??
        path.join(
          activePackageRoot,
          "src",
          "build",
          "knowledgeGeneratorNoSourceMap.ts",
        ),
    );
    const semanticInputPatternsPath = path.resolve(
      options.semanticInputPatternsPath ??
        path.join(
          activePackageRoot,
          "src",
          "build",
          "catalogSemanticInputPatterns.json",
        ),
    );
    const compilerInputPatternsPath = path.resolve(
      options.compilerInputPatternsPath ??
        path.join(
          activePackageRoot,
          "src",
          "build",
          "catalogCompilerInputPatterns.json",
        ),
    );
    for (const [label, candidate] of [
      ["package root", activePackageRoot],
      ["output root", outputDir],
      ["generator entry", activeGeneratorEntryPath],
      ["source-map replacement", activeGeneratorNoSourceMapPath],
      ["semantic input patterns", semanticInputPatternsPath],
      ["compiler input patterns", compilerInputPatternsPath],
    ]) {
      if (!isWithin(sourceRoot, candidate)) {
        throw new Error(`Catalog ${label} escapes the repository root.`);
      }
    }
    const [packageManifest, semanticInputPatterns, compilerInputPatterns] =
      await Promise.all([
        fs.readFile(path.join(activePackageRoot, "package.json"), "utf8").then(JSON.parse),
        fs.readFile(semanticInputPatternsPath, "utf8").then(JSON.parse),
        fs.readFile(compilerInputPatternsPath, "utf8").then(JSON.parse),
      ]);
    const packageVersion = options.packageVersion ?? packageManifest.version;
    if (
      typeof packageVersion !== "string" ||
      !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(packageVersion)
    ) {
      throw new Error(
        "Canonical catalog generation requires an exact package version.",
      );
    }
    const layout = {
      sourceRoot,
      generatorEntryPath: activeGeneratorEntryPath,
      generatorNoSourceMapPath: activeGeneratorNoSourceMapPath,
    };

    const runtimeIdentity = {
      executable_sha256: await hashFile(process.execPath),
      version: process.version,
      versions: { ...process.versions },
      platform: process.platform,
      arch: process.arch,
      exec_argv: [],
      environment: {
        policy: "empty",
      },
    };
    const assertRuntimeIdentityStable = async () => {
      const currentIdentity = {
        ...runtimeIdentity,
        executable_sha256: await hashFile(process.execPath),
        version: process.version,
        versions: { ...process.versions },
        platform: process.platform,
        arch: process.arch,
      };
      if (canonicalJson(currentIdentity) !== canonicalJson(runtimeIdentity)) {
        throw new Error(
          "Node runtime identity changed during catalog generation.",
        );
      }
    };
    const dependencyBefore =
      await createGeneratorDependencyInventory(sourceRoot);
    const esbuildPackagePortableRoot = "node_modules/esbuild";
    const typescriptPackagePortableRoot = "node_modules/typescript";
    const esbuildManifest = await readVerifiedDependencyJson(
      sourceRoot,
      dependencyBefore,
      `${esbuildPackagePortableRoot}/package.json`,
    );
    const typescriptManifest = await readVerifiedDependencyJson(
      sourceRoot,
      dependencyBefore,
      `${typescriptPackagePortableRoot}/package.json`,
    );
    if (
      esbuildManifest.name !== "esbuild" ||
      typescriptManifest.name !== "typescript"
    ) {
      throw new Error(
        "Canonical generator tools did not resolve to the expected local packages.",
      );
    }
    const esbuildPortablePath = resolvePackageEntryPortablePath(
      esbuildPackagePortableRoot,
      esbuildManifest,
    );
    const typescriptPortablePath = resolvePackageEntryPortablePath(
      typescriptPackagePortableRoot,
      typescriptManifest,
    );
    const dependencyFiles = new Set(
      dependencyBefore.entries
        .filter((entry) => entry.kind === "file")
        .map((entry) => entry.path),
    );
    if (
      !dependencyFiles.has(esbuildPortablePath) ||
      !dependencyFiles.has(typescriptPortablePath)
    ) {
      throw new Error(
        "Resolved esbuild or TypeScript entry is absent from the sealed dependency inventory.",
      );
    }
    const esbuildBinary = await resolveEsbuildBinary(
      sourceRoot,
      dependencyBefore,
      esbuildManifest,
    );
    const temporaryToolRoot = await fs.mkdtemp(
      path.join(activePackageRoot, ".registry-tools-"),
    );
    const temporaryBuildDir = path.join(temporaryToolRoot, "work");
    const firstBundlePath = path.join(temporaryBuildDir, "generator-first.cjs");
    const finalBundlePath = path.join(temporaryBuildDir, "generator-final.cjs");
    let esbuildToStop = null;

    try {
      const toolSnapshot = await materializeVerifiedDependencySnapshot({
        sourceRoot,
        dependencyInventory: dependencyBefore,
        portableRoots: [
          esbuildPackagePortableRoot,
          typescriptPackagePortableRoot,
          esbuildBinary.packageRootPath,
        ],
        snapshotRoot: temporaryToolRoot,
      });
      await fs.mkdir(temporaryBuildDir);
      const snapshotRequire = createRequire(
        path.join(temporaryBuildDir, "generator-loader.cjs"),
      );
      await toolSnapshot.assertStable();
      const importedEsbuild = snapshotRequire("esbuild");
      const esbuild = importedEsbuild.build
        ? importedEsbuild
        : importedEsbuild.default;
      if (!esbuild || typeof esbuild.build !== "function") {
        throw new Error("Resolved esbuild module has no build function.");
      }
      if (esbuild.version !== esbuildManifest.version) {
        throw new Error(
          "Resolved esbuild implementation and package manifest versions differ.",
        );
      }
      esbuildToStop = esbuild;
      const importedTypeScript = snapshotRequire("typescript");
      const typescript = importedTypeScript.default ?? importedTypeScript;
      if (
        !typescript ||
        typeof typescript.createSourceFile !== "function" ||
        typescript.version !== typescriptManifest.version
      ) {
        throw new Error(
          "Resolved TypeScript parser and package manifest versions differ.",
        );
      }
      const typescriptPackageRoot = path.join(
        temporaryToolRoot,
        ...typescriptPackagePortableRoot.split("/"),
      );
      const {
        finalBundle,
        generator,
        inputInventory: inputBefore,
      } = await verifySealedGeneratorBundleStability({
        sourceRoot,
        semanticInputPatterns,
        compilerInputPatterns,
        dependencyInventory: dependencyBefore,
        createDependencyInventory: createGeneratorDependencyInventory,
        assertToolSnapshotStable: () => toolSnapshot.assertStable(),
        assertGeneratorIdentity: (candidate) =>
          assertGeneratorTypeScriptIdentity(
            candidate,
            typescriptPackageRoot,
            typescriptManifest.version,
          ),
        buildBundle: async (pass) => {
          const bundlePath =
            pass === "first" ? firstBundlePath : finalBundlePath;
          return {
            ...(await bundleAndInspect(
              esbuild,
              typescript,
              bundlePath,
              dependencyBefore,
              layout,
            )),
            generator: snapshotRequire(bundlePath),
          };
        },
      });
      const orchestratorPath = assertPortablePath(
        toPosixPath(path.relative(sourceRoot, scriptPath)),
      );
      const orchestratorSha256 = await hashFile(scriptPath);
      const orchestratorInput = inputBefore.entries.find(
        (entry) => entry.path === orchestratorPath,
      );
      if (
        !orchestratorInput ||
        orchestratorInput.sha256 !== orchestratorSha256
      ) {
        throw new Error(
          "Catalog source inventory does not bind the executing generator orchestrator.",
        );
      }

      const receipt = {
        schema_version: "1.1.0",
        orchestrator: {
          path: orchestratorPath,
          sha256: orchestratorSha256,
        },
        generator_bundle: {
          sha256: finalBundle.digest,
          metafile_sha256: finalBundle.metafileDigest,
        },
        dependencies: {
          sha256: dependencyBefore.digest,
          esbuild_entry: esbuildPortablePath,
          esbuild_version: esbuildManifest.version,
          esbuild_binary: esbuildBinary.path,
          esbuild_binary_sha256: esbuildBinary.sha256,
          typescript_entry: typescriptPortablePath,
          typescript_version: typescriptManifest.version,
          tool_snapshot_sha256: toolSnapshot.digest,
          tool_snapshot_files: toolSnapshot.fileCount,
        },
        runtime: runtimeIdentity,
      };
      const generatorDigest = createGeneratorDigest(receipt);
      if (
        generator.createSealedKnowledgeGeneratorDigest(receipt) !==
        generatorDigest
      ) {
        throw new Error(
          "Generator bundle and orchestrator disagree on the sealed receipt digest.",
        );
      }
      const assertGeneratorDependenciesStable = async () => {
        await assertRuntimeIdentityStable();
        const current = await createGeneratorDependencyInventory(sourceRoot);
        assertSameInventory(
          dependencyBefore,
          current,
          "Generator dependency inventory",
        );
      };
      const built = await generator.buildKnowledgeSource({
          sourceRoot,
          packageRoot: activePackageRoot,
          outputDir,
          packageVersion,
          semanticInputPatterns,
          compilerInputPatterns,
          excludedPackageNames: options.excludedPackageNames ?? [
            "@salt-ds/knowledge",
            "@salt-ds/mcp",
          ],
          generatorVersion: "2.0.0",
          inputInventory: inputBefore,
          generatorDependencyInventory: dependencyBefore,
          generatorReceipt: receipt,
          assertGeneratorDependenciesStable,
          generatorDependencySnapshotRoot: temporaryToolRoot,
        });
      await toolSnapshot.assertStable();
      await assertGeneratorDependenciesStable();
        const [semanticInputInventory, compilerInputInventory] =
          await Promise.all([
            generator.createCatalogInputInventory(
              sourceRoot,
              semanticInputPatterns,
            ),
            generator.createCatalogInputInventory(
              sourceRoot,
              compilerInputPatterns,
            ),
          ]);
        await generator.buildKnowledgeV1({
          sourceRoot,
          packageRoot: activePackageRoot,
          outputDir,
          packageVersion,
          registry: built.registry,
          normalized: built.normalized,
          semanticInputInventory,
          compilerInputInventory,
          generatorReceipt: receipt,
          generatorDigest,
        });
      return built.registry;
    } finally {
      await esbuildToStop?.stop?.();
      await fs.rm(temporaryToolRoot, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 100,
      });
    }
  });
}

async function main() {
  const outputDir = path.join(packageRoot, "generated");
  if (
    path.resolve(outputDir) !== path.resolve(packageRoot, "generated") ||
    !isWithin(packageRoot, outputDir)
  ) {
    throw new Error("Knowledge comparison output must stay inside the package.");
  }
  await fs.rm(outputDir, { recursive: true, force: true });
  const registry = await buildCatalogRegistry({
    sourceRoot: repoRoot,
    packageRoot,
    outputDir,
    packageVersion: "0.0.0",
    semanticInputPatternsPath: path.join(
      packageRoot,
      "src",
      "build",
      "catalogSemanticInputPatterns.json",
    ),
    compilerInputPatternsPath: path.join(
      packageRoot,
      "src",
      "build",
      "catalogCompilerInputPatterns.json",
    ),
    excludedPackageNames: ["@salt-ds/knowledge", "@salt-ds/mcp"],
  });
  console.error(
    `Built registry at ${outputDir}: ${registry.packages.length} packages, ${registry.components.length} components, ${registry.icons.length} icons, ${registry.country_symbols.length} country symbols, ${registry.patterns.length} patterns, ${registry.tokens.length} tokens.`,
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath && invokedPath === path.resolve(scriptPath)) {
  await main();
}
