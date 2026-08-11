import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import catalogInputPatterns from "./catalogInputPatterns.json";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import {
  canonicalJson,
  compareOrdinalStrings,
  sha256Bytes,
} from "../catalog/catalogSerialization.js";
import { toPosixPath } from "../registry/paths.js";

export interface CatalogInputInventoryEntry {
  path: string;
  sha256: string;
  bytes: number;
}

export interface CatalogInputInventory {
  entries: CatalogInputInventoryEntry[];
  digest: string;
  absolutePaths: ReadonlySet<string>;
  expectedByAbsolutePath: ReadonlyMap<string, CatalogInputInventoryEntry>;
}

export const CATALOG_INPUT_PATTERNS = Object.freeze([
  ...catalogInputPatterns,
]);

const INPUT_HASH_CONCURRENCY = 32;

interface ActiveCatalogInputTracking {
  repoRoot: string;
  realRepoRoot: string;
  expectedByAbsolutePath: ReadonlyMap<string, CatalogInputInventoryEntry>;
  globs: TrackedCatalogGlob[];
}

let activeTracking: ActiveCatalogInputTracking | null = null;

type CatalogGlobOptions = NonNullable<Parameters<typeof fg>[1]>;

interface TrackedCatalogGlob {
  patterns: string[];
  options: CatalogGlobOptions;
  result: string[];
}

function normalizeAbsolutePath(targetPath: string): string {
  const resolved = path.resolve(targetPath);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

function assertCatalogInputRealPathIdentity(
  repoRoot: string,
  realRepoRoot: string,
  targetPath: string,
  actualRealPath: string,
): void {
  const lexicalRepoRoot = path.resolve(repoRoot);
  const lexicalTargetPath = path.resolve(targetPath);
  const relativePath = toPosixPath(
    path.relative(lexicalRepoRoot, lexicalTargetPath),
  );
  if (
    relativePath === ".." ||
    relativePath.startsWith("../") ||
    path.isAbsolute(relativePath) ||
    (relativePath !== "" && !isPortableRepositoryPath(relativePath))
  ) {
    throw new Error(
      `Catalog input path escapes the repository or is not portable: ${relativePath}.`,
    );
  }
  const expectedRealPath = path.resolve(realRepoRoot, relativePath);
  const actualRelativePath = toPosixPath(
    path.relative(realRepoRoot, actualRealPath),
  );
  if (
    normalizeAbsolutePath(actualRealPath) !==
      normalizeAbsolutePath(expectedRealPath) ||
    actualRelativePath !== relativePath
  ) {
    throw new Error(
      `Catalog input path resolves through a nested link or outside the repository: ${relativePath}.`,
    );
  }
}

function assertTrackedCatalogInputRealPathSync(targetPath: string): void {
  if (!activeTracking) return;
  const actualRealPath = fs.realpathSync.native(targetPath);
  assertCatalogInputRealPathIdentity(
    activeTracking.repoRoot,
    activeTracking.realRepoRoot,
    targetPath,
    actualRealPath,
  );
}

async function assertTrackedCatalogInputRealPath(
  targetPath: string,
): Promise<void> {
  if (!activeTracking) return;
  const actualRealPath = await fsPromises.realpath(targetPath);
  assertCatalogInputRealPathIdentity(
    activeTracking.repoRoot,
    activeTracking.realRepoRoot,
    targetPath,
    actualRealPath,
  );
}

function assertPortableRepoRelativePath(relativePath: string): void {
  if (!isPortableRepositoryPath(relativePath)) {
    throw new Error(
      `Catalog input path is not portable and repository-relative: ${relativePath}`,
    );
  }
}

function assertCatalogInputPortableSpelling(
  targetPath: string,
  expected: CatalogInputInventoryEntry,
): void {
  if (!activeTracking) return;
  const relativePath = toPosixPath(
    path.relative(activeTracking.repoRoot, path.resolve(targetPath)),
  );
  if (relativePath !== expected.path) {
    throw new Error(
      `Catalog input path does not match its inventoried portable spelling: requested '${relativePath}', inventoried '${expected.path}'.`,
    );
  }
}

async function assertNoLinkedPathSegments(
  repoRoot: string,
  repoPath: string,
): Promise<void> {
  const normalizedRepoPath = toPosixPath(repoPath);
  if (normalizedRepoPath === ".") return;
  const absolutePath = path.resolve(repoRoot, normalizedRepoPath);
  const relativePath = toPosixPath(path.relative(repoRoot, absolutePath));
  if (
    relativePath === ".." ||
    relativePath.startsWith("../") ||
    path.isAbsolute(relativePath) ||
    relativePath === ""
  ) {
    throw new Error(
      `Catalog input pattern base escapes the repository: ${normalizedRepoPath}.`,
    );
  }
  let currentPath = path.resolve(repoRoot);
  for (const segment of relativePath.split("/")) {
    currentPath = path.join(currentPath, segment);
    try {
      const stats = await fsPromises.lstat(currentPath);
      if (stats.isSymbolicLink()) {
        throw new Error(
          `Catalog input path resolves through a nested link or outside the repository: ${toPosixPath(
            path.relative(repoRoot, currentPath),
          )}.`,
        );
      }
    } catch (error) {
      const code =
        typeof error === "object" && error !== null
          ? (error as NodeJS.ErrnoException).code
          : undefined;
      if (code === "ENOENT" || code === "ENOTDIR") return;
      throw error;
    }
  }
}

async function assertNoCatalogPatternLinks(
  repoRoot: string,
  patterns: readonly string[],
): Promise<void> {
  const traversalPatterns = new Set<string>();
  for (const task of fg.generateTasks([...patterns], {
    cwd: repoRoot,
    dot: true,
    followSymbolicLinks: false,
  })) {
    await assertNoLinkedPathSegments(repoRoot, task.base);
    if (!task.dynamic) {
      for (const repoPath of task.positive) {
        await assertNoLinkedPathSegments(repoRoot, repoPath);
      }
      continue;
    }
    for (const pattern of task.positive) {
      traversalPatterns.add(pattern);
      let directoryPattern = path.posix.dirname(pattern);
      while (
        directoryPattern !== "." &&
        directoryPattern !== task.base &&
        (task.base === "." || directoryPattern.startsWith(`${task.base}/`))
      ) {
        traversalPatterns.add(directoryPattern);
        directoryPattern = path.posix.dirname(directoryPattern);
      }
    }
  }
  if (traversalPatterns.size === 0) return;
  const entries = await fg([...traversalPatterns], {
    cwd: repoRoot,
    dot: true,
    followSymbolicLinks: false,
    objectMode: true,
    onlyFiles: false,
    unique: true,
  });
  const linkedEntry = entries.find((entry) => entry.dirent.isSymbolicLink());
  if (linkedEntry) {
    throw new Error(
      `Catalog input path resolves through a nested link or outside the repository: ${toPosixPath(
        linkedEntry.path,
      )}.`,
    );
  }
}

export async function createCatalogInputInventory(
  repoRoot: string,
  patterns: readonly string[] = CATALOG_INPUT_PATTERNS,
): Promise<CatalogInputInventory> {
  const resolvedRoot = path.resolve(repoRoot);
  const realRoot = await fsPromises.realpath(resolvedRoot);
  await assertNoCatalogPatternLinks(resolvedRoot, patterns);
  const discoveredPaths = await fg([...patterns], {
    cwd: resolvedRoot,
    absolute: false,
    dot: true,
    followSymbolicLinks: false,
    onlyFiles: true,
    unique: true,
  });
  await assertNoCatalogPatternLinks(resolvedRoot, patterns);
  const relativePaths = discoveredPaths
    .map(toPosixPath)
    .sort(compareOrdinalStrings);

  const portablePathIdentities = new Map<string, string>();
  for (const relativePath of relativePaths) {
    const portableIdentity = relativePath.normalize("NFC").toLowerCase();
    const existingPortablePath = portablePathIdentities.get(portableIdentity);
    if (existingPortablePath && existingPortablePath !== relativePath) {
      throw new Error(
        `Catalog input paths collide under portable case normalization: '${existingPortablePath}' and '${relativePath}'.`,
      );
    }
    portablePathIdentities.set(portableIdentity, relativePath);
  }
  for (const relativePath of relativePaths) {
    assertPortableRepoRelativePath(relativePath);
  }

  const entries = new Array<CatalogInputInventoryEntry>(relativePaths.length);
  let nextPathIndex = 0;
  const workerCount = Math.min(INPUT_HASH_CONCURRENCY, relativePaths.length);
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextPathIndex < relativePaths.length) {
        const index = nextPathIndex;
        nextPathIndex += 1;
        const relativePath = relativePaths[index] as string;
        const absolutePath = path.resolve(resolvedRoot, relativePath);
        const relativeCheck = path.relative(resolvedRoot, absolutePath);
        if (
          relativeCheck.startsWith("..") ||
          path.isAbsolute(relativeCheck) ||
          relativeCheck.length === 0
        ) {
          throw new Error(`Catalog input escapes source root: ${relativePath}`);
        }

        const initialStats = await fsPromises.lstat(absolutePath, {
          bigint: true,
        });
        const initialRealPath = await fsPromises.realpath(absolutePath);
        if (
          initialStats.isSymbolicLink() ||
          !initialStats.isFile() ||
          initialStats.nlink !== 1n
        ) {
          throw new Error(
            `Catalog input must be a uniquely linked regular file: ${relativePath}.`,
          );
        }
        assertCatalogInputRealPathIdentity(
          resolvedRoot,
          realRoot,
          absolutePath,
          initialRealPath,
        );
        const bytes = await fsPromises.readFile(absolutePath);
        const finalStats = await fsPromises.lstat(absolutePath, {
          bigint: true,
        });
        const finalRealPath = await fsPromises.realpath(absolutePath);
        if (
          finalStats.isSymbolicLink() ||
          !finalStats.isFile() ||
          finalStats.nlink !== 1n ||
          finalStats.dev !== initialStats.dev ||
          finalStats.ino !== initialStats.ino ||
          finalStats.size !== initialStats.size ||
          finalStats.mtimeNs !== initialStats.mtimeNs
        ) {
          throw new Error(
            `Catalog input changed while its inventory was captured: ${relativePath}.`,
          );
        }
        assertCatalogInputRealPathIdentity(
          resolvedRoot,
          realRoot,
          absolutePath,
          finalRealPath,
        );
        entries[index] = {
          path: relativePath,
          sha256: sha256Bytes(bytes),
          bytes: bytes.byteLength,
        };
      }
    }),
  );

  const absolutePaths = new Set<string>();
  const expectedByAbsolutePath = new Map<string, CatalogInputInventoryEntry>();
  for (const entry of entries) {
    const absolutePath = path.resolve(resolvedRoot, entry.path);
    const normalizedAbsolutePath = normalizeAbsolutePath(absolutePath);
    absolutePaths.add(normalizedAbsolutePath);
    expectedByAbsolutePath.set(normalizedAbsolutePath, entry);
  }

  if (entries.length === 0) {
    throw new Error("Catalog input inventory is empty.");
  }

  return {
    entries,
    digest: sha256Bytes(canonicalJson(entries)),
    absolutePaths,
    expectedByAbsolutePath,
  };
}

function expectedCatalogInput(
  targetPath: string,
): CatalogInputInventoryEntry | null {
  if (!activeTracking) {
    return null;
  }

  const absolutePath = path.resolve(targetPath);
  const relativePath = toPosixPath(
    path.relative(activeTracking.repoRoot, absolutePath),
  );
  if (
    relativePath.startsWith("../") ||
    path.isAbsolute(relativePath) ||
    !activeTracking.expectedByAbsolutePath.has(
      normalizeAbsolutePath(absolutePath),
    )
  ) {
    throw new Error(
      `Catalog builder attempted an undeclared input read: ${relativePath}`,
    );
  }
  const expected = activeTracking.expectedByAbsolutePath.get(
    normalizeAbsolutePath(absolutePath),
  ) as CatalogInputInventoryEntry;
  assertCatalogInputPortableSpelling(targetPath, expected);
  return expected;
}

function missingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    ((error as NodeJS.ErrnoException).code === "ENOENT" ||
      (error as NodeJS.ErrnoException).code === "EISDIR")
  );
}

function assertInventoriedBytes(
  expected: CatalogInputInventoryEntry | null,
  bytes: Buffer,
): void {
  if (!expected) return;
  const actualSha256 = sha256Bytes(bytes);
  if (bytes.byteLength !== expected.bytes || actualSha256 !== expected.sha256) {
    throw new Error(
      `Catalog input changed after inventory: ${expected.path}; expected ${expected.sha256}/${expected.bytes}, received ${actualSha256}/${bytes.byteLength}.`,
    );
  }
}

export function readCatalogInputFileSync(
  targetPath: string,
  encoding: BufferEncoding,
): string {
  const expected = expectedCatalogInput(targetPath);
  assertTrackedCatalogInputRealPathSync(targetPath);
  const bytes = fs.readFileSync(targetPath);
  assertTrackedCatalogInputRealPathSync(targetPath);
  assertInventoriedBytes(expected, bytes);
  return bytes.toString(encoding);
}

export function readCatalogInputFileSyncOrNull(
  targetPath: string,
  encoding: BufferEncoding,
): string | null {
  if (!activeTracking) {
    try {
      return fs.readFileSync(targetPath, encoding);
    } catch (error) {
      if (missingFileError(error)) return null;
      throw error;
    }
  }

  const normalizedPath = normalizeAbsolutePath(targetPath);
  const expected =
    activeTracking.expectedByAbsolutePath.get(normalizedPath) ?? null;
  if (!expected) {
    try {
      const stats = fs.statSync(targetPath);
      if (!stats.isFile()) return null;
    } catch (error) {
      if (missingFileError(error)) return null;
      throw error;
    }
    void expectedCatalogInput(targetPath);
    throw new Error("Unreachable undeclared catalog input.");
  }
  assertCatalogInputPortableSpelling(targetPath, expected);

  let bytes: Buffer;
  try {
    assertTrackedCatalogInputRealPathSync(targetPath);
    bytes = fs.readFileSync(targetPath);
    assertTrackedCatalogInputRealPathSync(targetPath);
  } catch (error) {
    if (missingFileError(error)) {
      throw new Error(
        `Catalog input became unavailable after inventory: ${expected.path}.`,
        { cause: error },
      );
    }
    throw error;
  }
  assertInventoriedBytes(expected, bytes);
  return bytes.toString(encoding);
}

export async function readCatalogInputFile(
  targetPath: string,
  encoding: BufferEncoding,
): Promise<string> {
  const expected = expectedCatalogInput(targetPath);
  await assertTrackedCatalogInputRealPath(targetPath);
  const bytes = await fsPromises.readFile(targetPath);
  await assertTrackedCatalogInputRealPath(targetPath);
  assertInventoriedBytes(expected, bytes);
  return bytes.toString(encoding);
}

export async function readCatalogInputFileOrNull(
  targetPath: string,
  encoding: BufferEncoding,
): Promise<string | null> {
  if (!activeTracking) {
    try {
      return await fsPromises.readFile(targetPath, encoding);
    } catch (error) {
      if (missingFileError(error)) return null;
      throw error;
    }
  }

  const normalizedPath = normalizeAbsolutePath(targetPath);
  const expected =
    activeTracking.expectedByAbsolutePath.get(normalizedPath) ?? null;
  if (!expected) {
    try {
      const stats = await fsPromises.stat(targetPath);
      if (!stats.isFile()) return null;
    } catch (error) {
      if (missingFileError(error)) return null;
      throw error;
    }
    void expectedCatalogInput(targetPath);
    throw new Error("Unreachable undeclared catalog input.");
  }
  assertCatalogInputPortableSpelling(targetPath, expected);

  let bytes: Buffer;
  try {
    await assertTrackedCatalogInputRealPath(targetPath);
    bytes = await fsPromises.readFile(targetPath);
    await assertTrackedCatalogInputRealPath(targetPath);
  } catch (error) {
    if (missingFileError(error)) {
      throw new Error(
        `Catalog input became unavailable after inventory: ${expected.path}.`,
        { cause: error },
      );
    }
    throw error;
  }
  assertInventoriedBytes(expected, bytes);
  return bytes.toString(encoding);
}

function normalizedGlobResult(
  values: readonly string[],
  options: CatalogGlobOptions,
): string[] {
  const cwd = catalogGlobCwd(options);
  return values
    .map((value) => {
      const absolutePath = path.isAbsolute(value)
        ? path.resolve(value)
        : path.resolve(cwd, value);
      return normalizeAbsolutePath(absolutePath);
    })
    .sort(compareOrdinalStrings);
}

function catalogGlobCwd(options: CatalogGlobOptions): string {
  return typeof options.cwd === "string"
    ? path.resolve(options.cwd)
    : process.cwd();
}

async function assertTrackedGlobValues(
  values: readonly string[],
  options: CatalogGlobOptions,
): Promise<void> {
  if (!activeTracking) return;
  const cwd =
    typeof options.cwd === "string" ? path.resolve(options.cwd) : process.cwd();
  for (const value of values) {
    const absolutePath = path.isAbsolute(value)
      ? path.resolve(value)
      : path.resolve(cwd, value);
    const expected =
      activeTracking.expectedByAbsolutePath.get(
        normalizeAbsolutePath(absolutePath),
      ) ?? null;
    if (!expected) {
      const relativePath = toPosixPath(
        path.relative(activeTracking.repoRoot, absolutePath),
      );
      throw new Error(
        `Catalog builder enumerated an undeclared input: ${relativePath}`,
      );
    }
    assertCatalogInputPortableSpelling(absolutePath, expected);
    await assertTrackedCatalogInputRealPath(absolutePath);
  }
}

export async function globCatalogInputs(
  patterns: string | readonly string[],
  options: CatalogGlobOptions,
): Promise<string[]> {
  const normalizedPatterns =
    typeof patterns === "string" ? [patterns] : [...patterns];
  if (activeTracking) {
    const cwd = catalogGlobCwd(options);
    await assertTrackedCatalogInputRealPath(cwd);
    await assertNoCatalogPatternLinks(cwd, normalizedPatterns);
  }
  const values = await fg(normalizedPatterns, options);
  if (activeTracking) {
    await assertNoCatalogPatternLinks(
      catalogGlobCwd(options),
      normalizedPatterns,
    );
    const result = normalizedGlobResult(values, options);
    await assertTrackedGlobValues(values, options);
    activeTracking.globs.push({
      patterns: normalizedPatterns,
      options: { ...options },
      result,
    });
  }
  return values;
}

async function assertTrackedGlobsStable(
  tracking: ActiveCatalogInputTracking,
): Promise<void> {
  for (const glob of tracking.globs) {
    const cwd = catalogGlobCwd(glob.options);
    await assertTrackedCatalogInputRealPath(cwd);
    await assertNoCatalogPatternLinks(cwd, glob.patterns);
    const finalValues = await fg(glob.patterns, glob.options);
    await assertNoCatalogPatternLinks(cwd, glob.patterns);
    const finalResult = normalizedGlobResult(finalValues, glob.options);
    await assertTrackedGlobValues(finalValues, glob.options);
    if (canonicalJson(finalResult) !== canonicalJson(glob.result)) {
      throw new Error(
        `Catalog input enumeration changed during generation for patterns ${canonicalJson(glob.patterns)}.`,
      );
    }
  }
}

export async function withCatalogInputTracking<T>(
  repoRoot: string,
  inventory: CatalogInputInventory,
  action: () => Promise<T>,
): Promise<T> {
  if (activeTracking) {
    throw new Error("Catalog input tracking is already active.");
  }

  activeTracking = {
    repoRoot: path.resolve(repoRoot),
    realRepoRoot: fs.realpathSync.native(repoRoot),
    expectedByAbsolutePath: inventory.expectedByAbsolutePath,
    globs: [],
  };
  try {
    const result = await action();
    await assertTrackedGlobsStable(activeTracking);
    return result;
  } finally {
    activeTracking = null;
  }
}

export function isCatalogInputTrackingActive(): boolean {
  return activeTracking !== null;
}
