import { createHash } from "node:crypto";
import { brotliDecompressSync } from "node:zlib";
import fs from "fs-extra";
import path from "node:path";

const DIGEST = /^sha256:[0-9a-f]{64}$/u;
const PORTABLE_PATH =
  /^(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))(?!.*%)(?!.*\\)[^/]+(?:\/[^/]+)*$/u;
const LIMITS = Object.freeze({
  manifestBytes: 32 * 1024,
  indexBytes: 512 * 1024,
  maxDepth: 4,
  maxLeafEntries: 256,
  maxInternalChildren: 256,
  maxNodeBytes: 65_536,
  maxNodes: 512,
  maxTreeBytes: 8_388_608,
  maxArtifacts: 40_000,
  maxContentBytes: 64 * 1024,
});

function canonicalJson(value) {
  const normalize = (candidate) => {
    if (Array.isArray(candidate)) return candidate.map(normalize);
    if (candidate && typeof candidate === "object") {
      return Object.fromEntries(
        Object.entries(candidate)
          .filter(([, entry]) => entry !== undefined)
          .sort(([left], [right]) =>
            left < right ? -1 : left > right ? 1 : 0,
          )
          .map(([key, entry]) => [key, normalize(entry)]),
      );
    }
    return candidate;
  };
  return JSON.stringify(normalize(value));
}

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertPortablePath(value, label) {
  assert(
    typeof value === "string" &&
      value === value.normalize("NFC") &&
      PORTABLE_PATH.test(value),
    `${label} is not a canonical portable path: ${String(value)}`,
  );
  return value;
}

function resolveContained(root, relativePath) {
  const portablePath = assertPortablePath(relativePath, "Knowledge path");
  const absoluteRoot = path.resolve(root);
  const absolutePath = path.resolve(absoluteRoot, ...portablePath.split("/"));
  const relative = path.relative(absoluteRoot, absolutePath);
  assert(
    relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative),
    `Knowledge path escapes its root: ${portablePath}`,
  );
  const stats = fs.lstatSync(absolutePath);
  assert(
    stats.isFile() && !stats.isSymbolicLink(),
    `Knowledge path is not a regular file: ${portablePath}`,
  );
  return absolutePath;
}

function readExact(root, descriptor, label) {
  assertPortablePath(descriptor.file ?? descriptor.path, `${label} path`);
  assert(
    Number.isSafeInteger(descriptor.bytes) && descriptor.bytes >= 0,
    `${label} has an invalid byte count`,
  );
  assert(DIGEST.test(descriptor.sha256), `${label} has an invalid digest`);
  const relativePath = descriptor.file ?? descriptor.path;
  const bytes = fs.readFileSync(resolveContained(root, relativePath));
  assert(
    bytes.byteLength === descriptor.bytes && sha256(bytes) === descriptor.sha256,
    `${label} digest/bytes mismatch: ${relativePath}`,
  );
  return bytes;
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`, { cause: error });
  }
}

function verifyContentObjects(root, artifacts) {
  const contentPackDescriptor = artifacts.find(
    (entry) => entry.path === "content/content.pack",
  );
  const contentRecordsDescriptor = artifacts.find(
    (entry) => entry.path === "records/content.json",
  );
  assert(
    contentPackDescriptor && contentRecordsDescriptor,
    "Knowledge content pack or content records are missing.",
  );
  const contentPack = readExact(
    root,
    contentPackDescriptor,
    "Knowledge content pack",
  );
  const envelope = parseJson(
    readExact(root, contentRecordsDescriptor, "Knowledge content records"),
    "Knowledge content records",
  );
  assert(
    envelope.contract === "salt-knowledge-record-set/1" &&
      envelope.schema_version === "1.0.0" &&
      envelope.family === "content" &&
      Array.isArray(envelope.records),
    "Knowledge content record envelope is invalid.",
  );
  const seen = new Set();
  let expectedOffset = 0;
  for (const entry of envelope.records) {
    const record = entry?.data;
    assert(
      entry?.family === "content" &&
        entry.id === record?.id &&
        entry.key === `record:content:${entry.id}` &&
        DIGEST.test(record?.id) &&
        !seen.has(record.id) &&
        typeof record.codec === "string" &&
        record.codec.length > 0 &&
        typeof record.media_type === "string" &&
        record.media_type.length > 0 &&
        Number.isSafeInteger(record.bytes) &&
        record.bytes >= 0 &&
        record.bytes <= LIMITS.maxContentBytes &&
        Number.isSafeInteger(record.offset) &&
        record.offset === expectedOffset &&
        Number.isSafeInteger(record.length) &&
        record.length > 0 &&
        record.offset + record.length <= contentPack.byteLength &&
        (record.encoding === "br" || record.encoding === "identity"),
      `Knowledge content record is invalid: ${String(entry?.id)}`,
    );
    seen.add(record.id);
    const stored = contentPack.subarray(
      record.offset,
      record.offset + record.length,
    );
    let decoded;
    try {
      decoded =
        record.encoding === "br"
          ? brotliDecompressSync(stored, {
              maxOutputLength: LIMITS.maxContentBytes,
            })
          : Buffer.from(stored);
    } catch (error) {
      throw new Error(`Knowledge content cannot be decoded: ${record.id}`, {
        cause: error,
      });
    }
    const identity = Buffer.concat([
      Buffer.from(`${record.media_type}\0`, "utf8"),
      decoded,
    ]);
    assert(
      decoded.byteLength === record.bytes && sha256(identity) === record.id,
      `Knowledge content digest/bytes mismatch: ${record.id}`,
    );
    expectedOffset += record.length;
  }
  assert(
    expectedOffset === contentPack.byteLength,
    "Knowledge content records do not exactly cover the content pack.",
  );
}

export function verifyKnowledgeArtifactContract({
  packageRoot,
  manifestPath = "generated/manifest.json",
  publicationInventoryPath,
}) {
  const absolutePackageRoot = path.resolve(packageRoot);
  const absoluteManifestPath = resolveContained(
    absolutePackageRoot,
    manifestPath,
  );
  const generatedRoot = path.dirname(absoluteManifestPath);
  const manifestBytes = fs.readFileSync(absoluteManifestPath);
  assert(
    manifestBytes.byteLength <= LIMITS.manifestBytes,
    "Knowledge manifest exceeds 32 KiB.",
  );
  const manifest = parseJson(manifestBytes, "Knowledge manifest");
  assert(
    manifest.$schema ===
      "https://www.saltdesignsystem.com/ai/schemas/knowledge-manifest-1.json" &&
      manifest.schema_version === "1.0.0" &&
      manifest.record_schema_version === "1.0.0" &&
      manifest.reader_contract === "salt-knowledge-reader/1" &&
      manifest.analyzer_contract === "salt-artifact-analyzer/1",
    "Knowledge manifest has an unsupported contract tuple.",
  );
  assert(
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(manifest.bundle_version),
    "Knowledge bundle version is not exact SemVer.",
  );
  for (const field of [
    "semantic_digest",
    "bundle_digest",
    "semantic_source_digest",
    "compiler_digest",
  ]) {
    assert(DIGEST.test(manifest[field]), `Knowledge ${field} is invalid.`);
  }
  const { bundle_digest: _bundleDigest, ...identity } = manifest;
  assert(
    sha256(Buffer.from(canonicalJson(identity), "utf8")) ===
      manifest.bundle_digest,
    "Knowledge bundle digest does not match the canonical manifest.",
  );
  assert(
    manifest.agent_support === undefined,
    "The pre-agent-support build must not contain agent_support.",
  );
  const tree = manifest.artifact_tree;
  assert(
    tree?.contract === "salt-artifact-tree/1" &&
      tree.path_codec === "salt-posix-relative-path/1" &&
      tree.max_node_bytes === LIMITS.maxNodeBytes &&
      tree.max_leaf_entries === LIMITS.maxLeafEntries &&
      tree.max_internal_children === LIMITS.maxInternalChildren &&
      tree.max_nodes === LIMITS.maxNodes &&
      tree.max_tree_bytes === LIMITS.maxTreeBytes &&
      tree.max_artifacts === LIMITS.maxArtifacts,
    "Knowledge artifact-tree contract or budgets are invalid.",
  );

  const nodeFiles = [];
  const artifacts = [];
  const visitedNodes = new Set();
  let treeBytes = 0;
  const visit = (reference, depth) => {
    assert(depth <= LIMITS.maxDepth, "Knowledge artifact tree is too deep.");
    assert(
      !visitedNodes.has(reference.file),
      `Knowledge artifact tree repeats ${reference.file}.`,
    );
    visitedNodes.add(reference.file);
    assert(
      visitedNodes.size <= LIMITS.maxNodes,
      "Knowledge artifact tree has too many nodes.",
    );
    const bytes = readExact(generatedRoot, reference, "Knowledge tree node");
    assert(
      bytes.byteLength <= LIMITS.maxNodeBytes,
      `Knowledge tree node is too large: ${reference.file}`,
    );
    treeBytes += bytes.byteLength;
    assert(
      treeBytes <= LIMITS.maxTreeBytes,
      "Knowledge artifact descriptor bytes exceed their budget.",
    );
    nodeFiles.push(reference.file);
    const node = parseJson(bytes, `Knowledge tree node ${reference.file}`);
    assert(
      node.contract === "salt-artifact-tree-node/1" &&
        node.schema_version === "1.0.0" &&
        node.prefix === reference.prefix,
      `Knowledge tree node contract mismatch: ${reference.file}`,
    );
    if (node.kind === "leaf") {
      assert(
        Array.isArray(node.artifacts) &&
          node.artifacts.length > 0 &&
          node.artifacts.length <= LIMITS.maxLeafEntries,
        `Knowledge leaf cardinality is invalid: ${reference.file}`,
      );
      for (let index = 1; index < node.artifacts.length; index += 1) {
        assert(
          node.artifacts[index - 1].path < node.artifacts[index].path,
          `Knowledge leaf paths are unordered: ${reference.file}`,
        );
      }
      assert(
        depth === 0 || node.prefix === node.artifacts[0].path,
        `Knowledge leaf prefix is not its lower bound: ${reference.file}`,
      );
      artifacts.push(...node.artifacts);
      return {
        first: node.artifacts[0].path,
        last: node.artifacts[node.artifacts.length - 1].path,
      };
    }
    assert(
      node.kind === "internal" &&
        Array.isArray(node.children) &&
        node.children.length > 0 &&
        node.children.length <= LIMITS.maxInternalChildren,
      `Knowledge internal node is invalid: ${reference.file}`,
    );
    let first = null;
    let previousLast = null;
    for (const child of node.children) {
      const range = visit(child, depth + 1);
      assert(
        child.prefix === range.first &&
          (previousLast === null || previousLast < range.first),
        `Knowledge child ranges overlap or are unordered: ${reference.file}`,
      );
      first ??= range.first;
      previousLast = range.last;
    }
    assert(
      depth === 0 || node.prefix === first,
      `Knowledge internal prefix is not its lower bound: ${reference.file}`,
    );
    return { first, last: previousLast };
  };
  visit(tree.root, 0);

  artifacts.sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
  const portableIdentities = new Set();
  let artifactBytes = 0;
  let previousPath = null;
  for (const descriptor of artifacts) {
    assertPortablePath(descriptor.path, "Knowledge artifact");
    assert(
      previousPath === null || previousPath < descriptor.path,
      "Knowledge artifacts are duplicated or non-canonical-sorted.",
    );
    const portableIdentity = descriptor.path
      .normalize("NFC")
      .toLocaleLowerCase("en-US");
    assert(
      !portableIdentities.has(portableIdentity),
      `Knowledge artifact paths collide portably: ${descriptor.path}`,
    );
    portableIdentities.add(portableIdentity);
    const bytes = readExact(generatedRoot, descriptor, "Knowledge artifact");
    if (descriptor.path === "index.json") {
      assert(bytes.byteLength <= LIMITS.indexBytes, "Knowledge index exceeds 512 KiB.");
    }
    if (
      descriptor.media_type === "application/json" ||
      descriptor.media_type === "application/schema+json" ||
      descriptor.media_type === "text/markdown"
    ) {
      const text = bytes.toString("utf8");
      assert(
        !/"(?:uri|catalog_version|input_inventory_digest|source_revision)"\s*:/u.test(
          text,
        ) &&
          !/salt:\/\/|catalog-manifest\.json|catalog-generations\//u.test(text),
        `Knowledge artifact contains a prototype Catalog-v2 field or locator: ${descriptor.path}`,
      );
      if (
        descriptor.path.startsWith("markdown/") ||
        descriptor.path.startsWith("examples/")
      ) {
        assert(
          !/https?:\/\/[^\s"']*storybook/iu.test(text),
          `Knowledge consumer projection contains a Storybook URL: ${descriptor.path}`,
        );
      }
    }
    artifactBytes += bytes.byteLength;
    previousPath = descriptor.path;
  }
  assert(
    artifacts.length <= LIMITS.maxArtifacts &&
      tree.node_count === visitedNodes.size &&
      tree.tree_bytes === treeBytes &&
      tree.artifact_count === artifacts.length &&
      tree.artifact_bytes === artifactBytes,
    "Knowledge artifact-tree totals disagree with complete traversal.",
  );
  for (const requiredPath of [
    "compatibility/item-applicability.json",
    "index.json",
    "schemas/knowledge-manifest-1.schema.json",
    "support/compiler-inventory.json",
    "support/generation-receipt.json",
    "support/semantic-source-inventory.json",
  ]) {
    assert(
      artifacts.some((entry) => entry.path === requiredPath),
      `Knowledge artifact tree is missing ${requiredPath}.`,
    );
  }
  verifyContentObjects(generatedRoot, artifacts);

  const generationReceiptDescriptor = artifacts.find(
    (entry) => entry.path === "support/generation-receipt.json",
  );
  const generationReceipt = parseJson(
    readExact(
      generatedRoot,
      generationReceiptDescriptor,
      "Knowledge generation receipt",
    ),
    "Knowledge generation receipt",
  );
  const projectionDescriptors = artifacts
    .filter((entry) => entry.path !== "support/generation-receipt.json")
    .map(({ path: artifactPath, media_type, bytes, sha256: digest }) => ({
      path: artifactPath,
      media_type,
      bytes,
      sha256: digest,
    }));
  const projectionDigest = sha256(
    Buffer.from(canonicalJson(projectionDescriptors), "utf8"),
  );
  assert(
    generationReceipt.distribution_projections?.contract ===
      "salt-knowledge-projection-identity/1" &&
      JSON.stringify(generationReceipt.distribution_projections.excludes) ===
        JSON.stringify(["support/generation-receipt.json"]) &&
      generationReceipt.distribution_projections.npm_ready_sha256 ===
        projectionDigest &&
      generationReceipt.distribution_projections.web_ready_sha256 ===
        projectionDigest,
    "Knowledge npm-ready and web-ready projection identities disagree.",
  );
  assert(
    generationReceipt.bundle_digest === undefined &&
      generationReceipt.manifest_sha256 === undefined,
    "Knowledge generation receipt creates a finalized manifest identity cycle.",
  );

  const inputInventories = {};
  for (const [kind, contract, artifactPath] of [
    [
      "semantic",
      "salt-semantic-source-inventory/1",
      "support/semantic-source-inventory.json",
    ],
    ["compiler", "salt-compiler-inventory/1", "support/compiler-inventory.json"],
  ]) {
    const descriptor = artifacts.find((entry) => entry.path === artifactPath);
    const inventory = parseJson(
      readExact(generatedRoot, descriptor, `Knowledge ${kind} inventory`),
      `Knowledge ${kind} inventory`,
    );
    assert(
      inventory.contract === contract &&
        inventory.schema_version === "1.0.0" &&
        Array.isArray(inventory.entries) &&
        inventory.entries.length > 0,
      `Knowledge ${kind} inventory contract is invalid.`,
    );
    const inputsByPath = new Map();
    let previousInventoryPath = null;
    for (const entry of inventory.entries) {
      assertPortablePath(entry.path, `Knowledge ${kind} inventory entry`);
      assert(
        previousInventoryPath === null || previousInventoryPath < entry.path,
        `Knowledge ${kind} inventory entries are duplicated or unordered.`,
      );
      assert(
        Number.isSafeInteger(entry.bytes) &&
          entry.bytes >= 0 &&
          DIGEST.test(entry.sha256),
        `Knowledge ${kind} inventory entry is invalid: ${entry.path}`,
      );
      inputsByPath.set(entry.path, entry);
      previousInventoryPath = entry.path;
    }
    assert(
      sha256(Buffer.from(canonicalJson(inventory.entries), "utf8")) ===
        inventory.digest,
      `Knowledge ${kind} inventory digest is invalid.`,
    );
    inputInventories[kind] = { inputsByPath };
  }

  const expectedFiles = [
    "manifest.json",
    ...nodeFiles,
    ...artifacts.map((entry) => entry.path),
  ].sort();
  if (publicationInventoryPath !== undefined) {
    const publicationInventory = parseJson(
      fs.readFileSync(
        resolveContained(absolutePackageRoot, publicationInventoryPath),
      ),
      "Knowledge publication inventory",
    );
    assert(
      Array.isArray(publicationInventory.files) &&
        JSON.stringify(publicationInventory.files) ===
          JSON.stringify(expectedFiles),
      "Knowledge publication inventory does not exactly select the verified tree.",
    );
  }
  assert(
    !expectedFiles.some((file) =>
      /(?:^|\/)(?:catalog-generations|catalog-manifest\.json|extraction-parity\.json)(?:\/|$)/u.test(
        file,
      ),
    ),
    "Knowledge publication inventory contains a prototype Catalog-v2 path.",
  );
  return {
    manifest,
    manifestBytes,
    generatedRoot,
    files: expectedFiles,
    artifactDescriptors: artifacts,
    nodeFiles,
    inputInventories,
  };
}
