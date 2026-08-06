import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type CatalogFamilyName,
  type CatalogManifest,
  type CatalogRecord,
  type CatalogRuntimeFamilyName,
  catalogManifestCodec,
  catalogPublicationCodec,
  encodeCatalogArtifactRecordsForStorage,
  getCatalogBuildOnlyArtifactFileNames,
  getCatalogPackageFileNames,
  getCatalogPublishedFileNames,
  getCatalogPublishedManifestGenerationPath,
  parseCatalogArtifactEnvelope,
  SALT_CATALOG_MANIFEST_FILE,
} from "../core/catalog/catalogSchemaV2.js";
import {
  canonicalJson,
  canonicalJsonFile,
  compareOrdinalStrings,
  sha256Bytes,
} from "../core/catalog/catalogSerialization.js";
import { CatalogStoreV2 } from "../core/catalog/catalogStoreV2.js";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);
// Full source extraction can exceed four minutes on Windows even in isolation;
// this bounds setup without turning normal catalog extraction into a flaky hook.
export const SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS = 360_000;
export const CATALOG_V2_PACKAGE_FILES = getCatalogPackageFileNames();
export const CATALOG_V2_BUILD_ONLY_FILES =
  getCatalogBuildOnlyArtifactFileNames();
export const RETIRED_CATALOG_ARTIFACT_FILES = [
  "metadata.json",
  "search-index.jsonl",
  "changes.json",
  "create-retrieval-index.jsonl",
  "examples.json",
  "icons-lite.json",
  "page-search-index.json",
  "pattern-validation-rules.json",
  "token-policy-structural-role-rules.json",
] as const;

export async function readCatalogManifest(
  registryDir: string,
): Promise<CatalogManifest> {
  return catalogManifestCodec.parse(
    JSON.parse(
      await fs.readFile(
        path.join(registryDir, SALT_CATALOG_MANIFEST_FILE),
        "utf8",
      ),
    ),
  );
}

export async function catalogFamilyArtifactPath(
  registryDir: string,
  family: CatalogFamilyName,
): Promise<string> {
  const manifest = await readCatalogManifest(registryDir);
  const entry = manifest.artifacts.find(
    (candidate) => candidate.family === family,
  );
  if (!entry) {
    throw new Error(`Catalog manifest has no '${family}' artifact.`);
  }
  return path.join(registryDir, ...entry.file.split("/"));
}

export async function catalogSupportArtifactPath(
  registryDir: string,
  kind: CatalogManifest["support_artifacts"][number]["kind"],
): Promise<string> {
  const manifest = await readCatalogManifest(registryDir);
  const entry = manifest.support_artifacts.find(
    (candidate) => candidate.kind === kind,
  );
  if (!entry) {
    throw new Error(`Catalog manifest has no '${kind}' support artifact.`);
  }
  return path.join(registryDir, ...entry.file.split("/"));
}

export async function withRegistryDir(
  buildArtifacts: (registryDir: string) => Promise<void>,
  runAssertion: (registryDir: string) => Promise<void>,
): Promise<void> {
  const registryDir = await fs.mkdtemp(path.join(os.tmpdir(), "salt-mcp-"));

  try {
    await buildArtifacts(registryDir);
    await runAssertion(registryDir);
  } finally {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
}

export async function createBuiltCatalogV2Fixture(
  prefix = "salt-mcp-catalog-v2-",
): Promise<string> {
  const registryDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  try {
    // CI builds and digest-validates this immutable registry once. Protocol,
    // policy, and loader suites copy that artifact instead of independently
    // repeating the multi-minute source extraction path.
    await copyCatalogV2Artifacts(
      path.join(REPO_ROOT, "packages", "mcp", "generated"),
      registryDir,
    );
    return registryDir;
  } catch (error) {
    await fs.rm(registryDir, { recursive: true, force: true });
    throw error;
  }
}

export async function copyCatalogV2Artifacts(
  sourceDirectory: string,
  registryDir: string,
): Promise<void> {
  await fs.mkdir(registryDir, { recursive: true });
  const manifest = catalogManifestCodec.parse(
    JSON.parse(
      await fs.readFile(
        path.join(sourceDirectory, SALT_CATALOG_MANIFEST_FILE),
        "utf8",
      ),
    ),
  );
  const publicationEntry = manifest.support_artifacts.find(
    (entry) => entry.kind === "package_inventory",
  );
  if (!publicationEntry) {
    throw new Error("Catalog manifest has no package inventory.");
  }
  const publication = catalogPublicationCodec.parse(
    JSON.parse(
      await fs.readFile(
        path.join(sourceDirectory, ...publicationEntry.file.split("/")),
        "utf8",
      ),
    ),
  );

  for (const fileName of publication.files) {
    const targetPath = path.join(registryDir, ...fileName.split("/"));
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(
      path.join(sourceDirectory, ...fileName.split("/")),
      targetPath,
    );
  }
}

export interface MutableCatalogArtifactEnvelope {
  schema_version: string;
  family: string;
  records: unknown[];
}

function recomputeCatalogSemanticDigest(manifest: CatalogManifest): string {
  const contentPack = manifest.support_artifacts.find(
    (entry) => entry.kind === "content_pack",
  );
  if (!contentPack) {
    throw new Error("Catalog manifest has no content pack.");
  }
  return sha256Bytes(
    canonicalJson({
      catalog_version: manifest.catalog_version,
      canonical_artifacts: manifest.artifacts
        .filter((entry) => entry.canonical)
        .map((entry) => ({
          family: entry.family,
          sha256: entry.sha256,
          bytes: entry.bytes,
          record_count: entry.record_count,
          codec: entry.codec,
        })),
      content_pack: {
        sha256: contentPack.sha256,
        bytes: contentPack.bytes,
      },
    }),
  );
}

/**
 * Rebinds a deliberately mutated test artifact through every manifest,
 * generation, and publication identity. Logical-integrity tests therefore
 * cannot pass merely because a stale digest failed first.
 */
export async function rebindCatalogArtifactForTests(
  registryDir: string,
  family: CatalogFamilyName,
  mutate: (envelope: MutableCatalogArtifactEnvelope) => void,
  options: { canonicalizeRecords?: boolean } = {},
): Promise<void> {
  const manifest = await readCatalogManifest(registryDir);
  const artifactEntry = manifest.artifacts.find(
    (entry) => entry.family === family,
  );
  if (!artifactEntry) {
    throw new Error(`Catalog manifest has no '${family}' artifact.`);
  }
  const artifactPath = path.join(registryDir, ...artifactEntry.file.split("/"));
  const envelope = JSON.parse(
    await fs.readFile(artifactPath, "utf8"),
  ) as MutableCatalogArtifactEnvelope;
  const sourceStore = options.canonicalizeRecords
    ? new CatalogStoreV2({ registryDir })
    : null;
  mutate(envelope);
  if (options.canonicalizeRecords) {
    const records = parseCatalogArtifactEnvelope(
      family,
      envelope,
      (reference) =>
        sourceStore?.getRecord(
          reference.family as CatalogRuntimeFamilyName,
          reference.id,
        ) as CatalogRecord | null,
    ).records.sort((left, right) => compareOrdinalStrings(left.id, right.id));
    envelope.records = encodeCatalogArtifactRecordsForStorage(family, records);
  }
  const artifactBytes = Buffer.from(canonicalJsonFile(envelope), "utf8");
  await fs.writeFile(artifactPath, artifactBytes);
  artifactEntry.sha256 = sha256Bytes(artifactBytes);
  artifactEntry.bytes = artifactBytes.byteLength;
  artifactEntry.record_count = envelope.records.length;
  manifest.semantic_digest = recomputeCatalogSemanticDigest(manifest);

  let publicationEntry = manifest.support_artifacts.find(
    (entry) => entry.kind === "package_inventory",
  );
  if (!publicationEntry) {
    throw new Error("Catalog manifest has no package inventory.");
  }
  const generationMatch = publicationEntry.file.match(
    /^(catalog-generations\/[0-9a-f]{64})\//u,
  );
  const previousGeneration = generationMatch?.[1];
  if (!previousGeneration) {
    throw new Error("Catalog manifest has no active generation.");
  }
  const nextGeneration = getCatalogPublishedManifestGenerationPath(
    manifest,
    previousGeneration,
  );
  if (nextGeneration !== previousGeneration) {
    await fs.rename(
      path.join(registryDir, ...previousGeneration.split("/")),
      path.join(registryDir, ...nextGeneration.split("/")),
    );
    const rebindPath = (file: string): string =>
      file.startsWith(`${previousGeneration}/`)
        ? `${nextGeneration}/${file.slice(previousGeneration.length + 1)}`
        : file;
    for (const entry of manifest.artifacts) entry.file = rebindPath(entry.file);
    for (const entry of manifest.build_artifacts) {
      entry.file = rebindPath(entry.file);
    }
    for (const entry of manifest.support_artifacts) {
      entry.file = rebindPath(entry.file);
    }
    publicationEntry = manifest.support_artifacts.find(
      (entry) => entry.kind === "package_inventory",
    );
    if (!publicationEntry) {
      throw new Error("Rebound manifest lost its package inventory.");
    }
  }

  const publicationPath = path.join(
    registryDir,
    ...publicationEntry.file.split("/"),
  );
  const publication = catalogPublicationCodec.parse(
    JSON.parse(await fs.readFile(publicationPath, "utf8")),
  );
  publication.generation = nextGeneration;
  publication.files = getCatalogPublishedFileNames(nextGeneration);
  publication.semantic_digest = manifest.semantic_digest;
  const publicationBytes = Buffer.from(canonicalJsonFile(publication), "utf8");
  await fs.writeFile(publicationPath, publicationBytes);
  publicationEntry.sha256 = sha256Bytes(publicationBytes);
  publicationEntry.bytes = publicationBytes.byteLength;

  await fs.writeFile(
    path.join(registryDir, SALT_CATALOG_MANIFEST_FILE),
    canonicalJsonFile(manifest),
    "utf8",
  );
}
