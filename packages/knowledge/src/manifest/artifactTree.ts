import fs from "node:fs";
import path from "node:path";
import { canonicalJsonBytes } from "./canonicalJson.js";
import {
  parseSha256Digest,
  sha256Digest,
  type Sha256Digest,
} from "./digestCodec.js";
import {
  assertPortableArtifactPathSet,
  compareArtifactPaths,
  parseKnowledgeArtifactPath,
  type KnowledgeArtifactPath,
} from "./pathCodec.js";

export const ARTIFACT_TREE_LIMITS = Object.freeze({
  maxDepth: 4,
  maxLeafEntries: 256,
  maxInternalChildren: 256,
  maxNodeBytes: 65_536,
  maxNodes: 512,
  maxTreeBytes: 8_388_608,
  maxArtifacts: 40_000,
});

export interface ArtifactDescriptor {
  path: KnowledgeArtifactPath;
  media_type: string;
  bytes: number;
  sha256: Sha256Digest;
}

export interface ArtifactTreeNodeReference {
  file: KnowledgeArtifactPath;
  prefix: string;
  bytes: number;
  sha256: Sha256Digest;
}

export interface ArtifactTreeLeafNode {
  contract: "salt-artifact-tree-node/1";
  schema_version: "1.0.0";
  kind: "leaf";
  prefix: string;
  artifacts: ArtifactDescriptor[];
}

export interface ArtifactTreeInternalNode {
  contract: "salt-artifact-tree-node/1";
  schema_version: "1.0.0";
  kind: "internal";
  prefix: string;
  children: ArtifactTreeNodeReference[];
}

export type ArtifactTreeNode = ArtifactTreeLeafNode | ArtifactTreeInternalNode;

export interface MaterializedArtifactTree {
  root: ArtifactTreeNodeReference;
  nodes: ReadonlyMap<string, Buffer>;
  node_count: number;
  tree_bytes: number;
  artifact_count: number;
  artifact_bytes: number;
}

function assertByteCount(value: unknown, label: string): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative safe integer.`);
  }
}

export function createArtifactDescriptor(
  artifactPath: string,
  mediaType: string,
  bytes: Uint8Array,
): ArtifactDescriptor {
  if (!/^[a-z]+\/[a-z0-9.+-]+$/u.test(mediaType)) {
    throw new Error(`Invalid artifact media type: ${mediaType}`);
  }
  return {
    path: parseKnowledgeArtifactPath(artifactPath),
    media_type: mediaType,
    bytes: bytes.byteLength,
    sha256: sha256Digest(bytes),
  };
}

function createNodeFile(index: number): KnowledgeArtifactPath {
  return parseKnowledgeArtifactPath(
    index === 0
      ? "indexes/artifacts/root.json"
      : `indexes/artifacts/shards/${String(index).padStart(4, "0")}.json`,
  );
}

export function materializeArtifactTree(
  inputArtifacts: readonly ArtifactDescriptor[],
): MaterializedArtifactTree {
  const artifacts = [...inputArtifacts].sort((left, right) =>
    compareArtifactPaths(left.path, right.path),
  );
  assertPortableArtifactPathSet(artifacts.map((entry) => entry.path));
  if (artifacts.length === 0 || artifacts.length > ARTIFACT_TREE_LIMITS.maxArtifacts) {
    throw new Error("Artifact tree must contain a bounded non-empty inventory.");
  }
  const leafGroups: ArtifactDescriptor[][] = [];
  for (let index = 0; index < artifacts.length; index += ARTIFACT_TREE_LIMITS.maxLeafEntries) {
    leafGroups.push(artifacts.slice(index, index + ARTIFACT_TREE_LIMITS.maxLeafEntries));
  }
  if (leafGroups.length > ARTIFACT_TREE_LIMITS.maxInternalChildren) {
    throw new Error("Artifact tree needs more than one bounded internal level.");
  }

  const nodes = new Map<string, Buffer>();
  const leafReferences = leafGroups.map((group, groupIndex) => {
    const file = createNodeFile(groupIndex + 1);
    const prefix = group[0]!.path;
    const node: ArtifactTreeLeafNode = {
      contract: "salt-artifact-tree-node/1",
      schema_version: "1.0.0",
      kind: "leaf",
      prefix,
      artifacts: group,
    };
    const bytes = canonicalJsonBytes(node);
    if (bytes.byteLength > ARTIFACT_TREE_LIMITS.maxNodeBytes) {
      throw new Error(`Artifact leaf exceeds ${ARTIFACT_TREE_LIMITS.maxNodeBytes} bytes.`);
    }
    nodes.set(file, bytes);
    return {
      file,
      prefix,
      bytes: bytes.byteLength,
      sha256: sha256Digest(bytes),
    } satisfies ArtifactTreeNodeReference;
  });

  const rootFile = createNodeFile(0);
  const rootNode: ArtifactTreeNode =
    leafReferences.length === 1
      ? {
          contract: "salt-artifact-tree-node/1",
          schema_version: "1.0.0",
          kind: "leaf",
          prefix: "",
          artifacts,
        }
      : {
          contract: "salt-artifact-tree-node/1",
          schema_version: "1.0.0",
          kind: "internal",
          prefix: "",
          children: leafReferences,
        };
  if (leafReferences.length === 1) nodes.clear();
  const rootBytes = canonicalJsonBytes(rootNode);
  if (rootBytes.byteLength > ARTIFACT_TREE_LIMITS.maxNodeBytes) {
    throw new Error(`Artifact root exceeds ${ARTIFACT_TREE_LIMITS.maxNodeBytes} bytes.`);
  }
  nodes.set(rootFile, rootBytes);
  const treeBytes = [...nodes.values()].reduce(
    (total, bytes) => total + bytes.byteLength,
    0,
  );
  if (
    nodes.size > ARTIFACT_TREE_LIMITS.maxNodes ||
    treeBytes > ARTIFACT_TREE_LIMITS.maxTreeBytes
  ) {
    throw new Error("Artifact descriptor tree exceeds its bounded budget.");
  }
  return {
    root: {
      file: rootFile,
      prefix: "",
      bytes: rootBytes.byteLength,
      sha256: sha256Digest(rootBytes),
    },
    nodes,
    node_count: nodes.size,
    tree_bytes: treeBytes,
    artifact_count: artifacts.length,
    artifact_bytes: artifacts.reduce((total, entry) => total + entry.bytes, 0),
  };
}

function readContainedFile(rootDir: string, relativePath: string): Buffer {
  const artifactPath = parseKnowledgeArtifactPath(relativePath);
  const absoluteRoot = path.resolve(rootDir);
  const absolutePath = path.resolve(absoluteRoot, ...artifactPath.split("/"));
  const relative = path.relative(absoluteRoot, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Artifact tree path escapes the bundle: ${artifactPath}`);
  }
  const stats = fs.lstatSync(absolutePath);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error(`Artifact tree path is not a regular file: ${artifactPath}`);
  }
  return fs.readFileSync(absolutePath);
}

export interface ArtifactTreeManifestContract {
  root: ArtifactTreeNodeReference;
  node_count: number;
  tree_bytes: number;
  artifact_count: number;
  artifact_bytes: number;
}

export function verifyArtifactTree(
  rootDir: string,
  expected: ArtifactTreeManifestContract,
): ArtifactDescriptor[] {
  const visitedNodes = new Set<string>();
  const descriptors: ArtifactDescriptor[] = [];
  let treeBytes = 0;

  const visit = (
    reference: ArtifactTreeNodeReference,
    depth: number,
  ): { first: KnowledgeArtifactPath; last: KnowledgeArtifactPath } => {
    if (depth > ARTIFACT_TREE_LIMITS.maxDepth) {
      throw new Error("Artifact tree depth exceeds its bounded maximum.");
    }
    if (visitedNodes.has(reference.file)) {
      throw new Error(`Artifact tree repeats node ${reference.file}.`);
    }
    visitedNodes.add(reference.file);
    if (visitedNodes.size > ARTIFACT_TREE_LIMITS.maxNodes) {
      throw new Error("Artifact tree node count exceeds its bounded maximum.");
    }
    const bytes = readContainedFile(rootDir, reference.file);
    assertByteCount(reference.bytes, "Artifact tree node bytes");
    if (
      bytes.byteLength !== reference.bytes ||
      sha256Digest(bytes) !== parseSha256Digest(reference.sha256) ||
      bytes.byteLength > ARTIFACT_TREE_LIMITS.maxNodeBytes
    ) {
      throw new Error(`Artifact tree node digest/bytes mismatch: ${reference.file}`);
    }
    treeBytes += bytes.byteLength;
    if (treeBytes > ARTIFACT_TREE_LIMITS.maxTreeBytes) {
      throw new Error("Artifact descriptor bytes exceed their bounded maximum.");
    }
    const node = JSON.parse(bytes.toString("utf8")) as ArtifactTreeNode;
    if (
      node.contract !== "salt-artifact-tree-node/1" ||
      node.schema_version !== "1.0.0" ||
      node.prefix !== reference.prefix
    ) {
      throw new Error(`Invalid artifact tree node contract: ${reference.file}`);
    }
    if (node.kind === "leaf") {
      if (
        !Array.isArray(node.artifacts) ||
        node.artifacts.length === 0 ||
        node.artifacts.length > ARTIFACT_TREE_LIMITS.maxLeafEntries
      ) {
        throw new Error(`Invalid artifact leaf cardinality: ${reference.file}`);
      }
      const sorted = [...node.artifacts].sort((left, right) =>
        compareArtifactPaths(left.path, right.path),
      );
      if (
        sorted.some((entry, index) => entry.path !== node.artifacts[index]?.path) ||
        (depth > 0 && node.prefix !== node.artifacts[0]!.path)
      ) {
        throw new Error(`Invalid artifact leaf range/order: ${reference.file}`);
      }
      assertPortableArtifactPathSet(node.artifacts.map((entry) => entry.path));
      descriptors.push(...node.artifacts);
      return {
        first: node.artifacts[0]!.path,
        last: node.artifacts[node.artifacts.length - 1]!.path,
      };
    }
    if (
      node.kind !== "internal" ||
      !Array.isArray(node.children) ||
      node.children.length === 0 ||
      node.children.length > ARTIFACT_TREE_LIMITS.maxInternalChildren
    ) {
      throw new Error(`Invalid artifact internal node: ${reference.file}`);
    }
    let first: KnowledgeArtifactPath | null = null;
    let previousLast: KnowledgeArtifactPath | null = null;
    for (const child of node.children) {
      const range = visit(child, depth + 1);
      if (
        child.prefix !== range.first ||
        (previousLast !== null && compareArtifactPaths(previousLast, range.first) >= 0)
      ) {
        throw new Error(`Artifact child ranges overlap or are unordered: ${reference.file}`);
      }
      first ??= range.first;
      previousLast = range.last;
    }
    if (depth > 0 && node.prefix !== first) {
      throw new Error(`Artifact internal prefix disagrees with its range: ${reference.file}`);
    }
    return { first: first!, last: previousLast! };
  };

  visit(expected.root, 0);
  descriptors.sort((left, right) => compareArtifactPaths(left.path, right.path));
  assertPortableArtifactPathSet(descriptors.map((entry) => entry.path));
  if (descriptors.length > ARTIFACT_TREE_LIMITS.maxArtifacts) {
    throw new Error("Artifact count exceeds its bounded maximum.");
  }
  const artifactBytes = descriptors.reduce((total, entry) => {
    assertByteCount(entry.bytes, `Artifact ${entry.path} bytes`);
    const bytes = readContainedFile(rootDir, entry.path);
    if (
      bytes.byteLength !== entry.bytes ||
      sha256Digest(bytes) !== parseSha256Digest(entry.sha256)
    ) {
      throw new Error(`Artifact digest/bytes mismatch: ${entry.path}`);
    }
    return total + bytes.byteLength;
  }, 0);
  if (
    expected.node_count !== visitedNodes.size ||
    expected.tree_bytes !== treeBytes ||
    expected.artifact_count !== descriptors.length ||
    expected.artifact_bytes !== artifactBytes
  ) {
    throw new Error("Artifact tree manifest totals disagree with traversal.");
  }
  return descriptors;
}
