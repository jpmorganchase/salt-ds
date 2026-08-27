import fs from "node:fs";
import path from "node:path";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import {
  type CatalogGeneratorReceipt,
  catalogGeneratorReceiptCodec,
} from "../catalog/catalogSchemaV2.js";
import { canonicalJson, sha256Bytes } from "../catalog/catalogSerialization.js";
import { toPosixPath } from "../registry/paths.js";

export interface GeneratorDependencyFileEntry {
  kind: "file";
  path: string;
  sha256: string;
  bytes: number;
}

export interface GeneratorDependencyDirectoryEntry {
  kind: "directory";
  path: string;
}

export interface GeneratorDependencyLinkEntry {
  kind: "link";
  path: string;
  raw_target: string;
  target: string;
}

export type GeneratorDependencyEntry =
  | GeneratorDependencyFileEntry
  | GeneratorDependencyDirectoryEntry
  | GeneratorDependencyLinkEntry;

export interface GeneratorDependencyInventory {
  schema_version: "1.0.0";
  digest: string;
  entries: readonly GeneratorDependencyEntry[];
}

export type SealedCatalogGeneratorReceipt = CatalogGeneratorReceipt;

interface ActiveGeneratorDependencyInventory {
  repoRoot: string;
  nodeModulesRoots: readonly string[];
  entries: ReadonlyMap<string, GeneratorDependencyEntry>;
  files: ReadonlyMap<string, GeneratorDependencyFileEntry>;
  directories: ReadonlySet<string>;
  links: readonly {
    path: string;
    rawTarget: string;
    target: string;
  }[];
}

let activeInventory: ActiveGeneratorDependencyInventory | null = null;

export function isGeneratorDependencyInventoryActive(): boolean {
  return activeInventory !== null;
}

export function createSealedCatalogGeneratorDigest(
  receipt: SealedCatalogGeneratorReceipt,
): string {
  return sha256Bytes(
    canonicalJson(catalogGeneratorReceiptCodec.parse(receipt)),
  );
}

function normalizedAbsolutePath(targetPath: string): string {
  const resolved = path.resolve(targetPath);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

function dependencyAbsolutePath(
  repoRoot: string,
  portablePath: string,
): string {
  if (
    (portablePath !== "node_modules" &&
      !portablePath.startsWith("node_modules/")) ||
    !isPortableRepositoryPath(portablePath)
  ) {
    throw new Error(
      `Invalid generator dependency inventory path '${portablePath}'.`,
    );
  }
  const absolutePath = path.resolve(repoRoot, ...portablePath.split("/"));
  const nodeModulesRoot = path.resolve(repoRoot, "node_modules");
  const relative = path.relative(nodeModulesRoot, absolutePath);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(
      `Generator dependency inventory path escapes node_modules: '${portablePath}'.`,
    );
  }
  return absolutePath;
}

export function assertGeneratorDependencyInventory(
  repoRoot: string,
  inventory: GeneratorDependencyInventory,
  dependencySnapshotRoot?: string,
): ActiveGeneratorDependencyInventory {
  if (
    inventory.schema_version !== "1.0.0" ||
    !/^sha256:[0-9a-f]{64}$/u.test(inventory.digest) ||
    !Array.isArray(inventory.entries) ||
    inventory.entries.length === 0
  ) {
    throw new Error("Invalid generator dependency inventory.");
  }
  const expectedDigest = sha256Bytes(
    canonicalJson({
      schema_version: inventory.schema_version,
      entries: inventory.entries,
    }),
  );
  if (inventory.digest !== expectedDigest) {
    throw new Error(
      `Generator dependency inventory digest mismatch: expected ${expectedDigest}, received ${inventory.digest}.`,
    );
  }

  const files = new Map<string, GeneratorDependencyFileEntry>();
  const directories = new Set<string>();
  const entries = new Map<string, GeneratorDependencyEntry>();
  const links: Array<{ path: string; rawTarget: string; target: string }> = [];
  const portableSpellings = new Map<string, string>();
  const entriesByPortablePath = new Map<string, GeneratorDependencyEntry>();
  const dependencyRoots = [
    path.resolve(repoRoot),
    ...(dependencySnapshotRoot ? [path.resolve(dependencySnapshotRoot)] : []),
  ];
  let previousPath: string | null = null;
  for (const entry of inventory.entries) {
    const absolutePaths = dependencyRoots.map((rootPath) =>
      dependencyAbsolutePath(rootPath, entry.path),
    );
    const portableKey = entry.path.normalize("NFC").toLowerCase();
    if (
      entry.path !== entry.path.normalize("NFC") ||
      portableSpellings.has(portableKey) ||
      (previousPath !== null && previousPath >= entry.path)
    ) {
      throw new Error(
        `Generator dependency inventory has a duplicate, non-portable, or unsorted path '${entry.path}'.`,
      );
    }
    previousPath = entry.path;
    portableSpellings.set(portableKey, entry.path);
    const parentPath = path.posix.dirname(entry.path);
    if (entry.path !== "node_modules") {
      const parentEntry = entriesByPortablePath.get(parentPath);
      if (!parentEntry || parentEntry.kind !== "directory") {
        throw new Error(
          `Generator dependency inventory path '${entry.path}' has no declared directory parent.`,
        );
      }
    }
    for (const absolutePath of absolutePaths) {
      entries.set(normalizedAbsolutePath(absolutePath), entry);
    }
    entriesByPortablePath.set(entry.path, entry);
    switch (entry.kind) {
      case "file":
        if (
          !Number.isSafeInteger(entry.bytes) ||
          entry.bytes < 0 ||
          !/^sha256:[0-9a-f]{64}$/u.test(entry.sha256)
        ) {
          throw new Error(
            `Invalid generator dependency file entry '${entry.path}'.`,
          );
        }
        for (const absolutePath of absolutePaths) {
          files.set(normalizedAbsolutePath(absolutePath), entry);
        }
        break;
      case "directory":
        for (const absolutePath of absolutePaths) {
          directories.add(normalizedAbsolutePath(absolutePath));
        }
        break;
      case "link":
        if (
          !isPortableRepositoryPath(entry.raw_target) ||
          !isPortableRepositoryPath(entry.target)
        ) {
          throw new Error(
            `Invalid generator dependency link target '${entry.target}'.`,
          );
        }
        directories.add(normalizedAbsolutePath(absolutePaths[0]));
        links.push({
          path: absolutePaths[0],
          rawTarget: path.resolve(repoRoot, ...entry.raw_target.split("/")),
          target: path.resolve(repoRoot, ...entry.target.split("/")),
        });
        break;
      default:
        throw new Error("Unknown generator dependency inventory entry kind.");
    }
  }
  return {
    repoRoot: path.resolve(repoRoot),
    nodeModulesRoots: dependencyRoots.map((rootPath) =>
      path.resolve(rootPath, "node_modules"),
    ),
    entries,
    files,
    directories,
    links: links.sort((left, right) => right.path.length - left.path.length),
  };
}

export async function withGeneratorDependencyInventory<Value>(
  repoRoot: string,
  inventory: GeneratorDependencyInventory,
  action: () => Promise<Value>,
  dependencySnapshotRoot?: string,
): Promise<Value> {
  if (activeInventory) {
    throw new Error("Generator dependency tracking is already active.");
  }
  activeInventory = assertGeneratorDependencyInventory(
    repoRoot,
    inventory,
    dependencySnapshotRoot,
  );
  try {
    return await action();
  } finally {
    activeInventory = null;
  }
}

function requireActiveInventory(): ActiveGeneratorDependencyInventory {
  if (!activeInventory) {
    throw new Error(
      "Generator dependency access requires a sealed dependency inventory.",
    );
  }
  return activeInventory;
}

function dependencyKey(
  inventory: ActiveGeneratorDependencyInventory,
  targetPath: string,
): string | null {
  const absolutePath = path.resolve(targetPath);
  for (const nodeModulesRoot of inventory.nodeModulesRoots) {
    const relative = path.relative(nodeModulesRoot, absolutePath);
    if (
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative)
    ) {
      return normalizedAbsolutePath(absolutePath);
    }
  }
  return null;
}

export function isGeneratorDependencyPath(targetPath: string): boolean {
  return dependencyKey(requireActiveInventory(), targetPath) !== null;
}

function assertInventoryEntryTopology(
  inventory: ActiveGeneratorDependencyInventory,
  absolutePath: string,
  entry: GeneratorDependencyEntry,
): void {
  let stats: fs.Stats;
  try {
    stats = fs.lstatSync(absolutePath);
  } catch (error) {
    throw new Error(
      `Generator dependency topology changed after inventory capture: ${entry.path}.`,
      { cause: error },
    );
  }
  if (entry.kind === "file") {
    if (!stats.isFile() || stats.isSymbolicLink()) {
      throw new Error(
        `Generator dependency topology changed after inventory capture: ${entry.path}.`,
      );
    }
    return;
  }
  if (entry.kind === "directory") {
    if (!stats.isDirectory() || stats.isSymbolicLink()) {
      throw new Error(
        `Generator dependency topology changed after inventory capture: ${entry.path}.`,
      );
    }
    return;
  }
  if (!stats.isSymbolicLink()) {
    throw new Error(
      `Generator dependency topology changed after inventory capture: ${entry.path}.`,
    );
  }
  const rawTarget = path.resolve(
    path.dirname(absolutePath),
    fs.readlinkSync(absolutePath),
  );
  const canonicalTarget = fs.realpathSync.native(absolutePath);
  const expectedLink = inventory.links.find(
    (link) =>
      normalizedAbsolutePath(link.path) ===
      normalizedAbsolutePath(absolutePath),
  );
  if (
    !expectedLink ||
    normalizedAbsolutePath(rawTarget) !==
      normalizedAbsolutePath(expectedLink.rawTarget) ||
    normalizedAbsolutePath(canonicalTarget) !==
      normalizedAbsolutePath(expectedLink.target)
  ) {
    throw new Error(
      `Generator dependency link topology changed after inventory capture: ${entry.path}.`,
    );
  }
}

function assertInventoriedTopology(
  inventory: ActiveGeneratorDependencyInventory,
  targetPath: string,
): GeneratorDependencyEntry | null {
  const key = dependencyKey(inventory, targetPath);
  if (!key) return null;
  const targetEntry = inventory.entries.get(key);
  if (!targetEntry) return null;
  let currentPath = path.resolve(targetPath);
  while (true) {
    const entry = inventory.entries.get(normalizedAbsolutePath(currentPath));
    if (!entry) {
      throw new Error(
        `Generator dependency inventory has no topology entry for ${currentPath}.`,
      );
    }
    assertInventoryEntryTopology(inventory, currentPath, entry);
    if (
      inventory.nodeModulesRoots.some(
        (nodeModulesRoot) =>
          normalizedAbsolutePath(currentPath) ===
          normalizedAbsolutePath(nodeModulesRoot),
      )
    ) {
      break;
    }
    currentPath = path.dirname(currentPath);
  }
  return targetEntry;
}

export function readGeneratorDependencyFileSyncOrNull(
  targetPath: string,
): string | null {
  const inventory = requireActiveInventory();
  const key = dependencyKey(inventory, targetPath);
  if (!key) {
    throw new Error(
      `Generator dependency read escapes node_modules: ${targetPath}.`,
    );
  }
  const expected = inventory.files.get(key);
  if (!expected) return null;
  assertInventoriedTopology(inventory, targetPath);
  const bytes = fs.readFileSync(targetPath);
  const actualDigest = sha256Bytes(bytes);
  if (bytes.byteLength !== expected.bytes || actualDigest !== expected.sha256) {
    throw new Error(
      `Generator dependency changed after inventory capture: ${expected.path}.`,
    );
  }
  return bytes.toString("utf8");
}

export function generatorDependencyFileExists(targetPath: string): boolean {
  const inventory = requireActiveInventory();
  const key = dependencyKey(inventory, targetPath);
  if (!key || !inventory.files.has(key)) return false;
  assertInventoriedTopology(inventory, targetPath);
  return true;
}

export function generatorDependencyDirectoryExists(
  targetPath: string,
): boolean {
  const inventory = requireActiveInventory();
  const key = dependencyKey(inventory, targetPath);
  if (!key || !inventory.directories.has(key)) return false;
  assertInventoriedTopology(inventory, targetPath);
  return true;
}

export function generatorDependencyRealpath(targetPath: string): string | null {
  const inventory = requireActiveInventory();
  const key = dependencyKey(inventory, targetPath);
  if (!key) return null;
  if (!inventory.files.has(key) && !inventory.directories.has(key)) return null;
  assertInventoriedTopology(inventory, targetPath);
  return path.resolve(targetPath);
}

export function generatorDependencyWorkspacePath(
  targetPath: string,
): string | null {
  const inventory = requireActiveInventory();
  const resolvedTarget = path.resolve(targetPath);
  for (const link of inventory.links) {
    const relative = path.relative(link.path, resolvedTarget);
    if (
      relative === "" ||
      (relative !== ".." &&
        !relative.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relative))
    ) {
      const linkEntry = assertInventoriedTopology(inventory, link.path);
      if (!linkEntry || linkEntry.kind !== "link") {
        throw new Error(
          `Generator dependency inventory lost link topology for ${link.path}.`,
        );
      }
      return path.resolve(link.target, relative);
    }
  }
  return null;
}

export function generatorDependencyPortablePath(
  repoRoot: string,
  targetPath: string,
): string {
  const relative = toPosixPath(
    path.relative(repoRoot, path.resolve(targetPath)),
  );
  if (
    !relative.startsWith("node_modules/") ||
    !isPortableRepositoryPath(relative)
  ) {
    throw new Error(
      `Generator dependency path is not portable: ${targetPath}.`,
    );
  }
  return relative;
}
