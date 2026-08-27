import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonicalJsonBytes,
  computeKnowledgeBundleDigest,
  createArtifactDescriptor,
  loadKnowledgeRuntimeContext,
  materializeArtifactTree,
  type KnowledgeManifestV1,
  type KnowledgeRuntimeContext,
  verifyArtifactTree,
} from "@salt-ds/knowledge";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);
export const SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS = 120_000;
export const VERIFIED_CATALOG_CONTEXT_TEST_TIMEOUT_MS = 120_000;

export async function readCatalogManifest(
  bundleDir: string,
): Promise<KnowledgeManifestV1> {
  return JSON.parse(
    await fs.readFile(path.join(bundleDir, "manifest.json"), "utf8"),
  ) as KnowledgeManifestV1;
}

export async function copyCatalogV2Artifacts(
  sourceDirectory: string,
  bundleDir: string,
): Promise<void> {
  await fs.cp(sourceDirectory, bundleDir, {
    recursive: true,
    force: false,
    errorOnExist: true,
  });
}

export async function createBuiltCatalogV2Fixture(
  prefix = "salt-knowledge-v1-",
): Promise<string> {
  const bundleDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  try {
    await copyCatalogV2Artifacts(
      path.join(REPO_ROOT, "packages", "knowledge", "generated"),
      bundleDir,
    );
    return bundleDir;
  } catch (error) {
    await fs.rm(bundleDir, { recursive: true, force: true });
    throw error;
  }
}

export interface VerifiedCatalogTestContext {
  registryDir: string;
  runtime: KnowledgeRuntimeContext;
  coldStartMs: number;
  dispose: () => Promise<void>;
}

export async function createVerifiedCatalogTestContext(
  prefix: string,
): Promise<VerifiedCatalogTestContext> {
  const registryDir = await createBuiltCatalogV2Fixture(prefix);
  const startedAt = performance.now();
  try {
    const runtime = await loadKnowledgeRuntimeContext({ bundleDir: registryDir });
    const coldStartMs = performance.now() - startedAt;
    return {
      registryDir,
      runtime,
      coldStartMs,
      dispose: () =>
        fs.rm(registryDir, { recursive: true, force: true, maxRetries: 5 }),
    };
  } catch (error) {
    await fs.rm(registryDir, { recursive: true, force: true, maxRetries: 5 });
    throw error;
  }
}

export interface MutableCatalogArtifactEnvelope {
  schema_version: string;
  family: string;
  records: unknown[];
}

export async function rebindCatalogArtifactForTests(
  bundleDir: string,
  family: string,
  mutate: (envelope: MutableCatalogArtifactEnvelope) => void,
  _options: { canonicalizeRecords?: boolean } = {},
): Promise<void> {
  const manifest = await readCatalogManifest(bundleDir);
  const descriptors = verifyArtifactTree(bundleDir, manifest.artifact_tree);
  const artifactPath = `records/${family}.json`;
  const descriptorIndex = descriptors.findIndex(
    (entry) => entry.path === artifactPath,
  );
  if (descriptorIndex < 0) {
    throw new Error(`Knowledge fixture has no ${family} record artifact.`);
  }
  const envelope = JSON.parse(
    await fs.readFile(path.join(bundleDir, "records", `${family}.json`), "utf8"),
  ) as MutableCatalogArtifactEnvelope;
  mutate(envelope);
  const bytes = canonicalJsonBytes(envelope);
  await fs.writeFile(path.join(bundleDir, "records", `${family}.json`), bytes);
  descriptors[descriptorIndex] = createArtifactDescriptor(
    artifactPath,
    "application/json",
    bytes,
  );

  const tree = materializeArtifactTree(descriptors);
  await fs.rm(path.join(bundleDir, "indexes", "artifacts"), {
    recursive: true,
    force: true,
  });
  for (const [relativePath, nodeBytes] of tree.nodes) {
    const target = path.join(bundleDir, ...relativePath.split("/"));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, nodeBytes);
  }
  manifest.artifact_tree = {
    ...manifest.artifact_tree,
    root: tree.root,
    node_count: tree.node_count,
    tree_bytes: tree.tree_bytes,
    artifact_count: tree.artifact_count,
    artifact_bytes: tree.artifact_bytes,
  };
  const { bundle_digest: _bundleDigest, ...identity } = manifest;
  manifest.bundle_digest = computeKnowledgeBundleDigest(identity);
  await fs.writeFile(
    path.join(bundleDir, "manifest.json"),
    canonicalJsonBytes(manifest),
  );
}
