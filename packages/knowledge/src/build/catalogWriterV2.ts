import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { brotliCompressSync, constants as zlibConstants } from "node:zlib";
import { TOKEN_OWNED_ARTIFACT_BYTE_BUDGET } from "../catalog/catalogBudgets.js";
import {
  CATALOG_FAMILY_NAMES,
  type CatalogArtifactManifestEntry,
  type CatalogBuildArtifactManifestEntry,
  type CatalogFamilyName,
  type CatalogManifest,
  type CatalogRecord,
  type CatalogRecordForFamily,
  catalogArtifactManifestEntryCodec,
  catalogBuildArtifactManifestEntryCodec,
  catalogFamilies,
  catalogManifestCodec,
  catalogPackageFilesCodec,
  catalogPublicationCodec,
  createCatalogJsonSchema,
  encodeCatalogArtifactRecordsForStorage,
  getCatalogManifestGenerationPath,
  getCatalogPackageFileNames,
  getCatalogPublishedFileNames,
  SALT_CATALOG_CONTENT_PACK_FILE,
  SALT_CATALOG_JSON_SCHEMA_FILE,
  SALT_CATALOG_MANIFEST_FILE,
  SALT_CATALOG_PACKAGE_FILES_FILE,
  SALT_CATALOG_PUBLICATION_FILE,
  SALT_CATALOG_SCHEMA_VERSION,
} from "../catalog/catalogSchemaV2.js";
import {
  canonicalJson,
  canonicalJsonFile,
  compareCatalogIds,
  sha256Bytes,
} from "../catalog/catalogSerialization.js";
import {
  CatalogStoreV2,
  type CatalogValidationMetrics,
} from "../catalog/catalogStoreV2.js";
import { measureTokenOwnedCatalogSurface } from "../catalog/catalogTokenSurfaceV2.js";
import {
  type CatalogInputInventory,
  isCatalogInputTrackingActive,
} from "./catalogInputInventory.js";
import type {
  CatalogContentBlob,
  NormalizedCatalogV2,
} from "./normalizeCatalogV2.js";

export { TOKEN_OWNED_ARTIFACT_BYTE_BUDGET };
export const SEARCH_ARTIFACT_BYTE_BUDGET = 3_000_000;

export type CatalogGeneratorIdentity = CatalogManifest["generator"];

export interface WriteCatalogV2Options {
  outputDir: string;
  normalized: NormalizedCatalogV2;
  inventory: CatalogInputInventory;
  catalogVersion: string;
  sourceRevision: string;
  generator: CatalogGeneratorIdentity;
  enforceBudgets?: boolean;
}

export interface WriteCatalogV2Result {
  manifest: CatalogManifest;
  metrics: CatalogValidationMetrics;
}

interface CatalogOutputDirectoryIdentity {
  outputDir: string;
  realParentDir: string;
  parentDev: bigint;
  parentIno: bigint;
  outputDev: bigint;
  outputIno: bigint;
}

function sameFilesystemPath(left: string, right: string): boolean {
  return process.platform === "win32"
    ? left.toLowerCase() === right.toLowerCase()
    : left === right;
}

async function assertCatalogGenerationDirectorySafe(
  identity: CatalogOutputDirectoryIdentity,
): Promise<void> {
  const generationsDir = path.join(identity.outputDir, "catalog-generations");
  try {
    const stats = await fs.lstat(generationsDir);
    if (stats.isSymbolicLink() || !stats.isDirectory()) {
      throw new Error(
        `Catalog output contains an unsafe generation directory: ${generationsDir}`,
      );
    }
    const realGenerationsDir = await fs.realpath(generationsDir);
    if (
      !sameFilesystemPath(
        realGenerationsDir,
        path.join(await fs.realpath(identity.outputDir), "catalog-generations"),
      )
    ) {
      throw new Error(
        `Catalog generation directory resolves through a link: ${generationsDir}`,
      );
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

async function assertCatalogOutputDirectoryIdentity(
  identity: CatalogOutputDirectoryIdentity,
): Promise<void> {
  const parentStats = await fs.stat(identity.realParentDir, { bigint: true });
  const outputStats = await fs.lstat(identity.outputDir, { bigint: true });
  if (outputStats.isSymbolicLink() || !outputStats.isDirectory()) {
    throw new Error(
      `Catalog output directory became linked or non-directory: ${identity.outputDir}`,
    );
  }
  const realOutputDir = await fs.realpath(identity.outputDir);
  const expectedRealOutputDir = path.join(
    identity.realParentDir,
    path.basename(identity.outputDir),
  );
  if (
    parentStats.dev !== identity.parentDev ||
    parentStats.ino !== identity.parentIno ||
    outputStats.dev !== identity.outputDev ||
    outputStats.ino !== identity.outputIno ||
    !sameFilesystemPath(realOutputDir, expectedRealOutputDir)
  ) {
    throw new Error(
      `Catalog output directory identity changed during publication: ${identity.outputDir}`,
    );
  }
  await assertCatalogGenerationDirectorySafe(identity);
}

async function prepareCatalogOutputDirectory(
  outputDir: string,
): Promise<CatalogOutputDirectoryIdentity> {
  const resolved = path.resolve(outputDir);
  const parsed = path.parse(resolved);
  if (
    resolved === parsed.root ||
    path.basename(resolved).length === 0 ||
    path.dirname(resolved) === resolved
  ) {
    throw new Error(`Refusing unsafe catalog output directory: ${resolved}`);
  }
  const parentDir = path.dirname(resolved);
  await fs.mkdir(parentDir, { recursive: true });
  const realParentDir = await fs.realpath(parentDir);
  const parentStats = await fs.stat(realParentDir, { bigint: true });
  try {
    await fs.mkdir(resolved);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
  const outputStats = await fs.lstat(resolved, { bigint: true });
  if (outputStats.isSymbolicLink() || !outputStats.isDirectory()) {
    throw new Error(`Refusing linked catalog output directory: ${resolved}`);
  }
  const realOutputDir = await fs.realpath(resolved);
  if (
    !sameFilesystemPath(
      realOutputDir,
      path.join(realParentDir, path.basename(resolved)),
    )
  ) {
    throw new Error(
      `Catalog output directory resolves through a link: ${resolved}`,
    );
  }
  const identity = {
    outputDir: resolved,
    realParentDir,
    parentDev: parentStats.dev,
    parentIno: parentStats.ino,
    outputDev: outputStats.dev,
    outputIno: outputStats.ino,
  };
  await assertCatalogOutputDirectoryIdentity(identity);
  return identity;
}

function cloneRecords(
  records: Record<CatalogFamilyName, CatalogRecord[]>,
): Record<CatalogFamilyName, CatalogRecord[]> {
  return Object.fromEntries(
    CATALOG_FAMILY_NAMES.map((family) => [family, [...records[family]]]),
  ) as unknown as Record<CatalogFamilyName, CatalogRecord[]>;
}

function buildContentPack(blobs: ReadonlyMap<string, CatalogContentBlob>): {
  pack: Buffer;
  records: CatalogRecordForFamily<"content">[];
} {
  const sorted = [...blobs.values()].sort((left, right) =>
    compareCatalogIds(left, right),
  );
  const chunks: Buffer[] = [];
  const records: CatalogRecordForFamily<"content">[] = [];
  let offset = 0;
  for (const blob of sorted) {
    const bytes = Buffer.from(blob.bytes);
    const compressed = brotliCompressSync(bytes, {
      params: {
        [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
        [zlibConstants.BROTLI_PARAM_QUALITY]: 6,
        [zlibConstants.BROTLI_PARAM_SIZE_HINT]: bytes.byteLength,
      },
    });
    const storedBytes =
      compressed.byteLength < bytes.byteLength ? compressed : bytes;
    const encoding = storedBytes === compressed ? "br" : "identity";
    chunks.push(storedBytes);
    records.push({
      family: "content",
      id: blob.id,
      codec: blob.codec,
      media_type: blob.mediaType,
      bytes: bytes.byteLength,
      offset,
      length: storedBytes.byteLength,
      encoding,
      extraction_method: blob.extractionMethod,
      validation: {
        state: "validated",
        method: "schema",
        basis_digest: blob.id,
        validated_at: null,
      },
    });
    offset += storedBytes.byteLength;
  }
  return {
    pack: Buffer.concat(chunks),
    records,
  };
}

function artifactEnvelopeBytes(
  family: CatalogFamilyName,
  records: readonly CatalogRecord[],
): Buffer {
  return Buffer.from(
    canonicalJsonFile({
      schema_version: SALT_CATALOG_SCHEMA_VERSION,
      family,
      records: encodeCatalogArtifactRecordsForStorage(family, records as never),
    }),
    "utf8",
  );
}

async function writeBytes(
  outputDir: string,
  fileName: string,
  bytes: Buffer,
): Promise<{
  file: string;
  sha256: string;
  bytes: number;
}> {
  await fs.writeFile(path.join(outputDir, fileName), bytes);
  return {
    file: fileName,
    sha256: sha256Bytes(bytes),
    bytes: bytes.byteLength,
  };
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}

function publishedManifest(
  manifest: CatalogManifest,
  generation: string,
  publicationInventory: {
    sha256: string;
    bytes: number;
  },
): CatalogManifest {
  return catalogManifestCodec.parse({
    ...manifest,
    artifacts: manifest.artifacts.map((entry) => ({
      ...entry,
      file: `${generation}/${entry.file}`,
    })),
    build_artifacts: manifest.build_artifacts.map((entry) => ({
      ...entry,
      file: `${generation}/${entry.file}`,
    })),
    support_artifacts: manifest.support_artifacts.map((entry) => ({
      ...entry,
      ...(entry.kind === "package_inventory"
        ? {
            file: `${generation}/${SALT_CATALOG_PUBLICATION_FILE}`,
            ...publicationInventory,
          }
        : { file: `${generation}/${entry.file}` }),
    })),
  });
}

async function installCatalogGeneration(
  stagedDir: string,
  outputIdentity: CatalogOutputDirectoryIdentity,
  manifest: CatalogManifest,
  nonce: string,
): Promise<CatalogManifest> {
  const { outputDir } = outputIdentity;
  const generation = getCatalogManifestGenerationPath(manifest);
  const generationDir = path.join(outputDir, ...generation.split("/"));
  const publicationInventory = catalogPublicationCodec.parse({
    schema_version: SALT_CATALOG_SCHEMA_VERSION,
    generation,
    semantic_digest: manifest.semantic_digest,
    files: getCatalogPublishedFileNames(generation),
  });
  const publicationInventoryBytes = Buffer.from(
    canonicalJsonFile(publicationInventory),
    "utf8",
  );
  await fs.writeFile(
    path.join(stagedDir, SALT_CATALOG_PUBLICATION_FILE),
    publicationInventoryBytes,
    { flag: "wx" },
  );
  const publicationManifest = publishedManifest(manifest, generation, {
    sha256: sha256Bytes(publicationInventoryBytes),
    bytes: publicationInventoryBytes.byteLength,
  });
  await assertCatalogOutputDirectoryIdentity(outputIdentity);
  await fs.mkdir(path.dirname(generationDir), { recursive: true });
  await assertCatalogOutputDirectoryIdentity(outputIdentity);

  try {
    await assertCatalogOutputDirectoryIdentity(outputIdentity);
    await fs.rename(stagedDir, generationDir);
  } catch (error) {
    if (!(await pathExists(generationDir))) {
      throw error;
    }
    await assertCatalogOutputDirectoryIdentity(outputIdentity);
    const generationStats = await fs.lstat(generationDir);
    if (generationStats.isSymbolicLink() || !generationStats.isDirectory()) {
      throw new Error(
        `Catalog generation collision is linked or non-directory: ${generationDir}`,
        { cause: error },
      );
    }
    const realGenerationsDir = await fs.realpath(path.dirname(generationDir));
    const realGenerationDir = await fs.realpath(generationDir);
    if (
      !sameFilesystemPath(
        realGenerationDir,
        path.join(realGenerationsDir, path.basename(generationDir)),
      )
    ) {
      throw new Error(
        `Catalog generation collision resolves through a link: ${generationDir}`,
        { cause: error },
      );
    }
    const existingStore = new CatalogStoreV2({
      registryDir: generationDir,
    });
    existingStore.validateBuildArtifacts();
    existingStore.validateCrossReferences();
    if (canonicalJson(existingStore.manifest) !== canonicalJson(manifest)) {
      throw new Error(
        `Catalog generation digest collision at '${generation}'.`,
        { cause: error },
      );
    }
    const existingPublicationInventory = await fs.readFile(
      path.join(generationDir, SALT_CATALOG_PUBLICATION_FILE),
    );
    if (!existingPublicationInventory.equals(publicationInventoryBytes)) {
      throw new Error(
        `Catalog publication metadata collision at '${generation}'.`,
        { cause: error },
      );
    }
    await fs.rm(stagedDir, { recursive: true, force: true });
  }

  const manifestTempPath = path.join(
    outputDir,
    `.${SALT_CATALOG_MANIFEST_FILE}.publishing-${nonce}`,
  );
  try {
    await assertCatalogOutputDirectoryIdentity(outputIdentity);
    await fs.writeFile(
      manifestTempPath,
      canonicalJsonFile(publicationManifest),
      {
        encoding: "utf8",
        flag: "wx",
      },
    );
    // Every referenced artifact is immutable and installed before this
    // single-file commit point, so old and new readers each retain a complete
    // manifest-pinned snapshot.
    await assertCatalogOutputDirectoryIdentity(outputIdentity);
    await fs.rename(
      manifestTempPath,
      path.join(outputDir, SALT_CATALOG_MANIFEST_FILE),
    );
    return publicationManifest;
  } finally {
    if (await pathExists(manifestTempPath)) {
      await fs.rm(manifestTempPath, { force: true });
    }
  }
}

async function writeStagedCatalog(
  stagedDir: string,
  options: WriteCatalogV2Options,
): Promise<CatalogManifest> {
  await fs.mkdir(stagedDir, { recursive: false });
  const records = cloneRecords(options.normalized.records);
  const { pack, records: contentRecords } = buildContentPack(
    options.normalized.contentBlobs,
  );
  records.content = contentRecords;

  const artifactEntries: CatalogArtifactManifestEntry[] = [];
  const buildArtifactEntries: CatalogBuildArtifactManifestEntry[] = [];
  for (const family of CATALOG_FAMILY_NAMES) {
    const descriptor = catalogFamilies[family];
    const familyRecords = [...records[family]].sort(compareCatalogIds);
    const bytes = artifactEnvelopeBytes(family, familyRecords);
    const written = await writeBytes(stagedDir, descriptor.artifact, bytes);
    const entry = {
      family,
      ...written,
      record_count: familyRecords.length,
      codec: descriptor.codecName,
      canonical: descriptor.canonical,
    };
    if (descriptor.publicationState === "build-only") {
      buildArtifactEntries.push(
        catalogBuildArtifactManifestEntryCodec.parse(entry),
      );
    } else {
      artifactEntries.push(catalogArtifactManifestEntryCodec.parse(entry));
    }
  }

  const schemaBytes = Buffer.from(
    canonicalJsonFile(createCatalogJsonSchema()),
    "utf8",
  );
  const packageInventoryBytes = Buffer.from(
    canonicalJsonFile(
      catalogPackageFilesCodec.parse({
        schema_version: SALT_CATALOG_SCHEMA_VERSION,
        files: getCatalogPackageFileNames(),
      }),
    ),
    "utf8",
  );
  const [contentPack, jsonSchema, packageInventory] = await Promise.all([
    writeBytes(stagedDir, SALT_CATALOG_CONTENT_PACK_FILE, pack),
    writeBytes(stagedDir, SALT_CATALOG_JSON_SCHEMA_FILE, schemaBytes),
    writeBytes(
      stagedDir,
      SALT_CATALOG_PACKAGE_FILES_FILE,
      packageInventoryBytes,
    ),
  ]);

  const semanticDigest = sha256Bytes(
    canonicalJson({
      catalog_version: options.catalogVersion,
      canonical_artifacts: artifactEntries
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
  const manifest = catalogManifestCodec.parse({
    schema_version: SALT_CATALOG_SCHEMA_VERSION,
    catalog_version: options.catalogVersion,
    source_revision: options.sourceRevision,
    generator: options.generator,
    input_inventory_digest: options.inventory.digest,
    inputs: options.inventory.entries,
    artifacts: artifactEntries,
    build_artifacts: buildArtifactEntries,
    support_artifacts: [
      {
        kind: "json_schema",
        ...jsonSchema,
        codec: "salt.catalog.v2.json-schema",
      },
      {
        kind: "package_inventory",
        ...packageInventory,
        codec: "salt.catalog.v2.inventory",
      },
      {
        kind: "content_pack",
        ...contentPack,
        codec: "salt.catalog.v2.content-pack",
      },
    ],
    semantic_digest: semanticDigest,
  });
  await writeBytes(
    stagedDir,
    SALT_CATALOG_MANIFEST_FILE,
    Buffer.from(canonicalJsonFile(manifest), "utf8"),
  );

  const searchBytes =
    artifactEntries.find((entry) => entry.family === "search_document")
      ?.bytes ?? 0;
  if (options.enforceBudgets !== false) {
    if (searchBytes > SEARCH_ARTIFACT_BYTE_BUDGET) {
      throw new Error(
        `Catalog search artifact is ${searchBytes} bytes; budget is ${SEARCH_ARTIFACT_BYTE_BUDGET}.`,
      );
    }
  }
  return manifest;
}

export async function writeCatalogV2(
  options: WriteCatalogV2Options,
): Promise<WriteCatalogV2Result> {
  if (isCatalogInputTrackingActive()) {
    throw new Error(
      "Refusing to publish a catalog before input tracking is sealed.",
    );
  }
  const outputIdentity = await prepareCatalogOutputDirectory(options.outputDir);
  const { outputDir } = outputIdentity;
  const parentDir = path.dirname(outputDir);
  const nonce = `${process.pid}-${randomUUID()}`;
  const stagedDir = path.join(
    parentDir,
    `.${path.basename(outputDir)}.generation-staging-${nonce}`,
  );

  try {
    const generationManifest = await writeStagedCatalog(stagedDir, options);
    const stagedStore = new CatalogStoreV2({ registryDir: stagedDir });
    stagedStore.validateBuildArtifacts();
    const metrics = stagedStore.validateCrossReferences();
    const measuredTokenOwnedSurface =
      measureTokenOwnedCatalogSurface(stagedStore);
    if (
      metrics.tokenOwnedArtifactBytes !== measuredTokenOwnedSurface.bytes.total
    ) {
      throw new Error(
        `Catalog token-owned surface measurement diverged between validation and publication: ${metrics.tokenOwnedArtifactBytes} !== ${measuredTokenOwnedSurface.bytes.total}.`,
      );
    }
    if (
      options.enforceBudgets !== false &&
      measuredTokenOwnedSurface.bytes.total > TOKEN_OWNED_ARTIFACT_BYTE_BUDGET
    ) {
      throw new Error(
        `Catalog token-owned artifacts are ${measuredTokenOwnedSurface.bytes.total} bytes; budget is ${TOKEN_OWNED_ARTIFACT_BYTE_BUDGET}. Measurement: ${canonicalJson(measuredTokenOwnedSurface)}`,
      );
    }
    const manifest = await installCatalogGeneration(
      stagedDir,
      outputIdentity,
      generationManifest,
      nonce,
    );
    return { manifest, metrics };
  } catch (error) {
    if (await pathExists(stagedDir)) {
      await fs.rm(stagedDir, { recursive: true, force: true });
    }
    throw error;
  }
}
