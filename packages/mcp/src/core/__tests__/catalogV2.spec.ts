import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
} from "vitest";
import { SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS } from "../../__tests__/registryTestUtils.js";
import { buildRegistry } from "../build/buildRegistry.js";
import { linkDeprecationsToComponents } from "../build/buildRegistryComponentDeprecations.js";
import { extractDeprecations } from "../build/buildRegistryDeprecations.js";
import {
  type CatalogInputInventory,
  createCatalogInputInventory,
  withCatalogInputTracking,
} from "../build/catalogInputInventory.js";
import { extractTokenDeclarations } from "../build/extractTokenDeclarations.js";
import { normalizeCatalogV2 } from "../build/normalizeCatalogV2.js";
import { createDeprecationId } from "../catalog/catalogApiSymbolV2.js";
import { parseCatalogContentPayload } from "../catalog/catalogPayloadSchemaV2.js";
import {
  accessibilityClaimCodec,
  CATALOG_FAMILY_NAMES,
  CATALOG_SEARCH_TARGET_FAMILY_NAMES,
  type CatalogBuildOnlyFamilyName,
  type CatalogFamilyName,
  type CatalogManifest,
  type CatalogRecord,
  type CatalogRecordForFamily,
  type CatalogReference,
  type CatalogRuntimeFamilyName,
  type CatalogSearchTargetFamilyName,
  catalogFamilies,
  catalogManifestCodec,
  catalogPublicationCodec,
  createCatalogJsonSchema,
  decodeCatalogRecordFromStorage,
  encodeCatalogRecordForStorage,
  getCatalogBuildOnlyFamilyNames,
  getCatalogPublishedFileNames,
  getCatalogPublishedManifestGenerationPath,
  getCatalogRuntimeFamilyNames,
  parseCatalogArtifactEnvelope,
  portableRepositoryPathCodec,
  relationCodec,
  SALT_CATALOG_MANIFEST_FILE,
  SALT_CATALOG_PACKAGE_FILES_FILE,
  SALT_CATALOG_SCHEMA_VERSION,
  sourceCodec,
} from "../catalog/catalogSchemaV2.js";
import {
  canonicalJson,
  canonicalJsonFile,
  compareCatalogIds,
  sha256Bytes,
} from "../catalog/catalogSerialization.js";
import {
  __getCatalogFileReadCountForTests,
  __resetCatalogFileReadCountsForTests,
  CatalogStoreV2,
} from "../catalog/catalogStoreV2.js";
import { measureTokenOwnedCatalogSurface } from "../catalog/catalogTokenSurfaceV2.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import type { SaltRegistry } from "../types.js";

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(TEST_DIRECTORY, "../../..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../..");
const CATALOG_GRAPH_TEST_TIMEOUT_MS = 120_000;
const temporaryDirectories: string[] = [];
let generatedDirectory = "";
let builtInventory: CatalogInputInventory;
let builtRegistry: SaltRegistry;

interface MutableExampleOrdinalCarrier {
  owner_ordinal: number;
  registry_ordinal: number;
}

interface MutableExampleEvidence {
  evidence_kind: string;
  id: string;
  owner?: CatalogReference | null;
  owner_ordinal?: number;
  registry_ordinal?: number;
}

interface MutableArtifactEnvelope {
  schema_version: string;
  family: string;
  records: unknown[];
}

function decodeArtifactRecords<Family extends CatalogFamilyName>(
  family: Family,
  records: readonly unknown[],
): CatalogRecordForFamily<Family>[] {
  return records.map(
    (record) =>
      decodeCatalogRecordFromStorage(
        family,
        record,
      ) as CatalogRecordForFamily<Family>,
  );
}

function encodeArtifactRecords<Family extends CatalogFamilyName>(
  family: Family,
  records: readonly CatalogRecordForFamily<Family>[],
): unknown[] {
  return records.map((record) =>
    encodeCatalogRecordForStorage(family, record as never),
  );
}

function asExampleEvidence(record: unknown): MutableExampleEvidence | null {
  if (
    typeof record !== "object" ||
    record === null ||
    typeof (record as { id?: unknown }).id !== "string" ||
    typeof (record as { evidence_kind?: unknown }).evidence_kind !== "string"
  ) {
    return null;
  }
  const evidence = record as MutableExampleEvidence;
  return evidence.evidence_kind === "executable_example" &&
    exampleOrdinalCarrier(evidence)
    ? evidence
    : null;
}

function exampleOrdinalCarrier(
  evidence: MutableExampleEvidence,
): MutableExampleOrdinalCarrier | null {
  if (
    evidence.evidence_kind === "executable_example" &&
    typeof evidence.owner_ordinal === "number" &&
    typeof evidence.registry_ordinal === "number"
  ) {
    return evidence as MutableExampleOrdinalCarrier;
  }
  return null;
}

function evidenceOwnerKey(evidence: MutableExampleEvidence): string | null {
  const owner = evidence.owner;
  return owner ? `${owner.family}:${owner.id}` : null;
}

function recomputeManifestSemanticDigest(manifest: CatalogManifest): string {
  const contentPack = manifest.support_artifacts.find(
    (entry) => entry.kind === "content_pack",
  );
  if (!contentPack) throw new Error("Fixture manifest has no content pack.");
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

beforeAll(async () => {
  generatedDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-catalog-v2-built-"),
  );
  builtInventory = await createCatalogInputInventory(REPO_ROOT);
  builtRegistry = await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: generatedDirectory,
    sourceRevision: "catalog-v2-test-source",
    generatorVersion: "2.0.0-test",
    generatorDigest: `sha256:${"1".repeat(64)}`,
    inputInventory: builtInventory,
  });
}, SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS);

async function createCatalogCopy(
  options: { includeBuildArtifacts?: boolean } = {},
): Promise<string> {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "salt-catalog-v2-"));
  temporaryDirectories.push(target);
  const inventory = await readPublicationInventory(generatedDirectory);
  const sourceManifest = await readManifest(generatedDirectory);
  const fileNames = [
    ...inventory.files,
    ...(options.includeBuildArtifacts
      ? sourceManifest.build_artifacts.map((entry) => entry.file)
      : []),
  ];
  await Promise.all(
    fileNames.map(async (fileName) => {
      const targetPath = path.join(target, ...fileName.split("/"));
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(
        path.join(generatedDirectory, ...fileName.split("/")),
        targetPath,
      );
    }),
  );
  return target;
}

async function readManifest(directory: string): Promise<CatalogManifest> {
  return catalogManifestCodec.parse(
    JSON.parse(
      await fs.readFile(
        path.join(directory, SALT_CATALOG_MANIFEST_FILE),
        "utf8",
      ),
    ),
  );
}

async function readPublicationInventory(directory: string) {
  const manifest = await readManifest(directory);
  const entry = manifest.support_artifacts.find(
    (artifact) => artifact.kind === "package_inventory",
  );
  if (!entry) {
    throw new Error("Fixture manifest has no package inventory support entry.");
  }
  return catalogPublicationCodec.parse(
    JSON.parse(
      await fs.readFile(path.join(directory, ...entry.file.split("/")), "utf8"),
    ),
  );
}

async function writeManifest(
  directory: string,
  manifest: CatalogManifest,
  options: { rebindGeneration?: boolean } = {},
): Promise<void> {
  let publicationInventoryEntry = manifest.support_artifacts.find(
    (entry) => entry.kind === "package_inventory",
  );
  if (!publicationInventoryEntry) {
    throw new Error("Fixture manifest has no package inventory support entry.");
  }
  if (options.rebindGeneration) {
    const generationMatch = publicationInventoryEntry.file.match(
      /^(catalog-generations\/[0-9a-f]{64})\//u,
    );
    const currentGeneration = generationMatch?.[1];
    if (!currentGeneration) {
      throw new Error("Fixture manifest has no published generation prefix.");
    }
    const expectedGeneration = getCatalogPublishedManifestGenerationPath(
      manifest,
      currentGeneration,
    );
    if (expectedGeneration !== currentGeneration) {
      await fs.rename(
        path.join(directory, ...currentGeneration.split("/")),
        path.join(directory, ...expectedGeneration.split("/")),
      );
      const rebindPath = (file: string): string =>
        file.startsWith(`${currentGeneration}/`)
          ? `${expectedGeneration}/${file.slice(currentGeneration.length + 1)}`
          : file;
      for (const entry of manifest.artifacts) {
        entry.file = rebindPath(entry.file);
      }
      for (const entry of manifest.build_artifacts) {
        entry.file = rebindPath(entry.file);
      }
      for (const entry of manifest.support_artifacts) {
        entry.file = rebindPath(entry.file);
      }
      publicationInventoryEntry = manifest.support_artifacts.find(
        (entry) => entry.kind === "package_inventory",
      );
      if (!publicationInventoryEntry) {
        throw new Error(
          "Fixture manifest lost its package inventory support entry.",
        );
      }
    }
  }
  const publicationInventoryPath = path.join(
    directory,
    ...publicationInventoryEntry.file.split("/"),
  );
  const publicationInventory = catalogPublicationCodec.parse(
    JSON.parse(await fs.readFile(publicationInventoryPath, "utf8")),
  );
  if (options.rebindGeneration) {
    const generationMatch = publicationInventoryEntry.file.match(
      /^(catalog-generations\/[0-9a-f]{64})\//u,
    );
    const generation = generationMatch?.[1];
    if (!generation) {
      throw new Error("Fixture manifest has no rebound generation prefix.");
    }
    publicationInventory.generation = generation;
    publicationInventory.files = getCatalogPublishedFileNames(generation);
  }
  publicationInventory.semantic_digest = manifest.semantic_digest;
  const publicationInventoryBytes = Buffer.from(
    canonicalJsonFile(publicationInventory),
    "utf8",
  );
  await fs.writeFile(publicationInventoryPath, publicationInventoryBytes);
  publicationInventoryEntry.sha256 = sha256Bytes(publicationInventoryBytes);
  publicationInventoryEntry.bytes = publicationInventoryBytes.byteLength;
  await fs.writeFile(
    path.join(directory, SALT_CATALOG_MANIFEST_FILE),
    canonicalJsonFile(manifest),
    "utf8",
  );
}

async function replaceArtifact(
  directory: string,
  family: CatalogFamilyName,
  mutate: (envelope: MutableArtifactEnvelope) => void,
  options: {
    rebindRecordCount?: boolean;
  } = {},
): Promise<void> {
  const manifest = await readManifest(directory);
  const entry = manifest.artifacts.find(
    (candidate) => candidate.family === family,
  );
  if (!entry) throw new Error(`Missing ${family} manifest entry.`);
  const artifactPath = path.join(directory, entry.file);
  const envelope = JSON.parse(
    await fs.readFile(artifactPath, "utf8"),
  ) as MutableArtifactEnvelope;
  mutate(envelope);
  const bytes = Buffer.from(canonicalJsonFile(envelope), "utf8");
  await fs.writeFile(artifactPath, bytes);
  entry.bytes = bytes.byteLength;
  entry.sha256 = sha256Bytes(bytes);
  if (options.rebindRecordCount !== false) {
    entry.record_count = envelope.records.length;
  }
  manifest.semantic_digest = recomputeManifestSemanticDigest(manifest);
  await writeManifest(directory, manifest, { rebindGeneration: true });
}

async function replaceBuildArtifact(
  directory: string,
  mutate: (envelope: MutableArtifactEnvelope) => void,
  options: {
    rebindRecordCount?: boolean;
  } = {},
): Promise<void> {
  const manifest = await readManifest(directory);
  const entry = manifest.build_artifacts[0];
  if (!entry) throw new Error("Missing build artifact manifest entry.");
  const artifactPath = path.join(directory, ...entry.file.split("/"));
  const envelope = JSON.parse(
    await fs.readFile(artifactPath, "utf8"),
  ) as MutableArtifactEnvelope;
  mutate(envelope);
  const bytes = Buffer.from(canonicalJsonFile(envelope), "utf8");
  await fs.writeFile(artifactPath, bytes);
  entry.bytes = bytes.byteLength;
  entry.sha256 = sha256Bytes(bytes);
  if (options.rebindRecordCount !== false) {
    entry.record_count = envelope.records.length;
  }
  await writeManifest(directory, manifest, { rebindGeneration: true });
}

async function rebindAccessibilitySignalContent(
  directory: string,
  transform: (serialized: string) => string,
): Promise<void> {
  const store = new CatalogStoreV2({ registryDir: directory });
  const assertion = store
    .getFamily("evidence")
    .find(
      (evidence) =>
        evidence.evidence_kind === "source_assertion" &&
        evidence.assertion_kind === "accessibility_implementation_signal",
    );
  if (!assertion) {
    throw new Error("Fixture has no accessibility implementation assertion.");
  }
  const oldReference = assertion.detail_content_ref;
  const oldContentId = oldReference.id;
  const contentRecord = store.getRecord("content", oldContentId);
  if (!contentRecord) {
    throw new Error("Fixture assertion content is missing.");
  }

  const manifest = await readManifest(directory);
  const packEntry = manifest.support_artifacts.find(
    (entry) => entry.kind === "content_pack",
  );
  if (!packEntry) {
    throw new Error("Fixture manifest has no content pack.");
  }
  const packPath = path.join(directory, ...packEntry.file.split("/"));
  const packBytes = await fs.readFile(packPath);
  const oldBytes = packBytes.subarray(
    contentRecord.offset,
    contentRecord.offset + contentRecord.length,
  );
  const newBytes = Buffer.from(transform(oldBytes.toString("utf8")), "utf8");
  if (newBytes.byteLength !== oldBytes.byteLength) {
    throw new Error("Rebound content mutation must preserve byte length.");
  }
  const newId = sha256Bytes(
    Buffer.concat([
      Buffer.from(`${contentRecord.media_type}\0`, "utf8"),
      newBytes,
    ]),
  );
  const reboundPack = Buffer.from(packBytes);
  newBytes.copy(reboundPack, contentRecord.offset);
  await fs.writeFile(packPath, reboundPack);
  packEntry.sha256 = sha256Bytes(reboundPack);
  packEntry.bytes = reboundPack.byteLength;

  const rewriteFamily = async <Family extends CatalogFamilyName>(
    family: Family,
    records: CatalogRecordForFamily<Family>[],
  ): Promise<void> => {
    const entry = manifest.artifacts.find(
      (candidate) => candidate.family === family,
    );
    if (!entry) {
      throw new Error(`Fixture manifest has no ${family} artifact.`);
    }
    const artifactPath = path.join(directory, ...entry.file.split("/"));
    const envelope = JSON.parse(
      await fs.readFile(artifactPath, "utf8"),
    ) as MutableArtifactEnvelope;
    envelope.records = encodeArtifactRecords(family, records);
    const bytes = Buffer.from(canonicalJsonFile(envelope), "utf8");
    await fs.writeFile(artifactPath, bytes);
    entry.sha256 = sha256Bytes(bytes);
    entry.bytes = bytes.byteLength;
    entry.record_count = records.length;
  };

  const contentRecords = structuredClone([...store.getFamily("content")]);
  const reboundContent = contentRecords.find(
    (record) => record.id === oldContentId,
  );
  if (!reboundContent) {
    throw new Error("Fixture content index record disappeared.");
  }
  reboundContent.id = newId;
  if (reboundContent.validation.state !== "validated") {
    throw new Error("Fixture content index is not validated.");
  }
  reboundContent.validation.basis_digest = newId;
  contentRecords.sort(compareCatalogIds);
  await rewriteFamily("content", contentRecords);

  const evidenceRecords = structuredClone([...store.getFamily("evidence")]);
  let reboundReferences = 0;
  for (const evidence of evidenceRecords) {
    if (
      evidence.evidence_kind === "source_assertion" &&
      evidence.assertion_kind === "accessibility_implementation_signal" &&
      evidence.detail_content_ref.id === oldContentId
    ) {
      evidence.detail_content_ref.id = newId;
      reboundReferences += 1;
    }
  }
  if (reboundReferences === 0) {
    throw new Error("Fixture content has no assertion references.");
  }
  await rewriteFamily("evidence", evidenceRecords);

  manifest.semantic_digest = recomputeManifestSemanticDigest(manifest);
  await writeManifest(directory, manifest, { rebindGeneration: true });
}

async function rebindDeprecationValueMapTargetOwner(
  directory: string,
): Promise<void> {
  const store = new CatalogStoreV2({ registryDir: directory });
  const deprecation = store.getFamily("deprecation").find((candidate) => {
    const detail = store.getContentJson(candidate.detail_content_ref);
    return (
      detail.migration.value_map !== null &&
      detail.replacement.target_refs.length > 0
    );
  });
  if (!deprecation) {
    throw new Error("Fixture has no value-map deprecation.");
  }
  const detail = store.getContentJson(deprecation.detail_content_ref);
  const subject = store.getRecord("api_symbol", deprecation.subject_ref.id);
  const originalTargetRef = detail.replacement.target_refs[0];
  if (!subject || !originalTargetRef) {
    throw new Error("Fixture value-map subject or target is missing.");
  }
  const existingTargetIds = new Set(
    detail.replacement.target_refs.map((target) => target.id),
  );
  const replacementTarget = store
    .getFamily("api_symbol")
    .find(
      (candidate) =>
        candidate.member_path.at(-1)?.kind === "prop" &&
        !existingTargetIds.has(candidate.id) &&
        candidate.id.length === originalTargetRef.id.length &&
        canonicalJson(candidate.package_ref) ===
          canonicalJson(subject.package_ref) &&
        (candidate.entrypoint !== subject.entrypoint ||
          candidate.export_name !== subject.export_name),
    );
  if (!replacementTarget) {
    throw new Error(
      "Fixture has no same-package property from another public API owner.",
    );
  }

  const oldContentId = deprecation.detail_content_ref.id;
  const contentRecord = store.getRecord("content", oldContentId);
  if (!contentRecord) {
    throw new Error("Fixture deprecation detail content is missing.");
  }
  const manifest = await readManifest(directory);
  const packEntry = manifest.support_artifacts.find(
    (entry) => entry.kind === "content_pack",
  );
  if (!packEntry) {
    throw new Error("Fixture manifest has no content pack.");
  }
  const packPath = path.join(directory, ...packEntry.file.split("/"));
  const packBytes = await fs.readFile(packPath);
  const oldBytes = packBytes.subarray(
    contentRecord.offset,
    contentRecord.offset + contentRecord.length,
  );
  const serialized = oldBytes.toString("utf8");
  const reboundSerialized = serialized
    .split(originalTargetRef.id)
    .join(replacementTarget.id);
  if (reboundSerialized === serialized) {
    throw new Error("Fixture target reference is absent from its detail.");
  }
  const newBytes = Buffer.from(reboundSerialized, "utf8");
  if (newBytes.byteLength !== oldBytes.byteLength) {
    throw new Error("Rebound value-map content must preserve byte length.");
  }
  const newId = sha256Bytes(
    Buffer.concat([
      Buffer.from(`${contentRecord.media_type}\0`, "utf8"),
      newBytes,
    ]),
  );
  const reboundPack = Buffer.from(packBytes);
  newBytes.copy(reboundPack, contentRecord.offset);
  await fs.writeFile(packPath, reboundPack);
  packEntry.sha256 = sha256Bytes(reboundPack);
  packEntry.bytes = reboundPack.byteLength;

  const rewriteFamily = async <Family extends CatalogFamilyName>(
    family: Family,
    records: CatalogRecordForFamily<Family>[],
  ): Promise<void> => {
    const entry = manifest.artifacts.find(
      (candidate) => candidate.family === family,
    );
    if (!entry) throw new Error(`Fixture manifest has no ${family} artifact.`);
    const artifactPath = path.join(directory, ...entry.file.split("/"));
    const envelope = JSON.parse(
      await fs.readFile(artifactPath, "utf8"),
    ) as MutableArtifactEnvelope;
    envelope.records = encodeArtifactRecords(family, records);
    const bytes = Buffer.from(canonicalJsonFile(envelope), "utf8");
    await fs.writeFile(artifactPath, bytes);
    entry.sha256 = sha256Bytes(bytes);
    entry.bytes = bytes.byteLength;
    entry.record_count = records.length;
  };

  const contentRecords = structuredClone([...store.getFamily("content")]);
  const reboundContent = contentRecords.find(
    (record) => record.id === oldContentId,
  );
  if (!reboundContent || reboundContent.validation.state !== "validated") {
    throw new Error("Fixture value-map content is not validated.");
  }
  reboundContent.id = newId;
  reboundContent.validation.basis_digest = newId;
  contentRecords.sort(compareCatalogIds);
  await rewriteFamily("content", contentRecords);

  const deprecations = structuredClone([...store.getFamily("deprecation")]);
  const reboundDeprecation = deprecations.find(
    (candidate) => candidate.id === deprecation.id,
  );
  if (!reboundDeprecation) {
    throw new Error("Fixture value-map deprecation disappeared.");
  }
  reboundDeprecation.detail_content_ref.id = newId;
  await rewriteFamily("deprecation", deprecations);

  manifest.semantic_digest = recomputeManifestSemanticDigest(manifest);
  await writeManifest(directory, manifest, { rebindGeneration: true });
}

async function rebindStructuralRelationOrdinal(
  directory: string,
  relationKind: "composes" | "related_to" | "documents",
): Promise<void> {
  const store = new CatalogStoreV2({ registryDir: directory });
  const relation = store
    .getFamily("relation")
    .find(
      (candidate) =>
        candidate.relation_kind === relationKind &&
        candidate.source_ordinal === 0,
    );
  if (!relation) {
    throw new Error(`Fixture has no zero-ordinal ${relationKind} relation.`);
  }
  const evidenceRef = relation.source_evidence_refs[0];
  const evidence = store.getRecord("evidence", evidenceRef.id);
  if (
    !evidence ||
    evidence.evidence_kind !== "source_assertion" ||
    evidence.assertion_kind !== "structural_relation"
  ) {
    throw new Error("Fixture relation has no structural assertion.");
  }
  const oldContentId = evidence.detail_content_ref.id;
  const contentRecord = store.getRecord("content", oldContentId);
  if (!contentRecord) {
    throw new Error("Fixture structural assertion content is missing.");
  }

  const manifest = await readManifest(directory);
  const packEntry = manifest.support_artifacts.find(
    (entry) => entry.kind === "content_pack",
  );
  if (!packEntry) throw new Error("Fixture manifest has no content pack.");
  const packPath = path.join(directory, ...packEntry.file.split("/"));
  const packBytes = await fs.readFile(packPath);
  const oldBytes = packBytes.subarray(
    contentRecord.offset,
    contentRecord.offset + contentRecord.length,
  );
  const detail = JSON.parse(oldBytes.toString("utf8")) as {
    source_ordinal: number;
  };
  detail.source_ordinal = 1;
  const newBytes = Buffer.from(canonicalJson(detail), "utf8");
  if (newBytes.byteLength !== oldBytes.byteLength) {
    throw new Error("Ordinal content rebinding must preserve byte length.");
  }
  const newId = sha256Bytes(
    Buffer.concat([
      Buffer.from(`${contentRecord.media_type}\0`, "utf8"),
      newBytes,
    ]),
  );
  const reboundPack = Buffer.from(packBytes);
  newBytes.copy(reboundPack, contentRecord.offset);
  await fs.writeFile(packPath, reboundPack);
  packEntry.sha256 = sha256Bytes(reboundPack);
  packEntry.bytes = reboundPack.byteLength;

  const rewriteFamily = async <Family extends CatalogFamilyName>(
    family: Family,
    records: CatalogRecordForFamily<Family>[],
  ): Promise<void> => {
    const entry = manifest.artifacts.find(
      (candidate) => candidate.family === family,
    );
    if (!entry) throw new Error(`Fixture has no ${family} artifact.`);
    const artifactPath = path.join(directory, ...entry.file.split("/"));
    const envelope = JSON.parse(
      await fs.readFile(artifactPath, "utf8"),
    ) as MutableArtifactEnvelope;
    envelope.records = encodeArtifactRecords(family, records);
    const bytes = Buffer.from(canonicalJsonFile(envelope), "utf8");
    await fs.writeFile(artifactPath, bytes);
    entry.sha256 = sha256Bytes(bytes);
    entry.bytes = bytes.byteLength;
    entry.record_count = records.length;
  };

  const contentRecords = structuredClone([...store.getFamily("content")]);
  const reboundContent = contentRecords.find(
    (record) => record.id === oldContentId,
  );
  if (!reboundContent || reboundContent.validation.state !== "validated") {
    throw new Error("Fixture structural content is not validated.");
  }
  reboundContent.id = newId;
  reboundContent.validation.basis_digest = newId;
  contentRecords.sort(compareCatalogIds);
  await rewriteFamily("content", contentRecords);

  const evidenceRecords = structuredClone([...store.getFamily("evidence")]);
  const reboundEvidence = evidenceRecords.find(
    (record) => record.id === evidence.id,
  );
  if (
    !reboundEvidence ||
    reboundEvidence.evidence_kind !== "source_assertion" ||
    reboundEvidence.assertion_kind !== "structural_relation"
  ) {
    throw new Error("Fixture structural evidence disappeared.");
  }
  reboundEvidence.detail_content_ref.id = newId;
  await rewriteFamily("evidence", evidenceRecords);

  const relationRecords = structuredClone([...store.getFamily("relation")]);
  const reboundRelation = relationRecords.find(
    (record) => record.id === relation.id,
  );
  if (
    !reboundRelation ||
    (reboundRelation.relation_kind !== "composes" &&
      reboundRelation.relation_kind !== "related_to" &&
      reboundRelation.relation_kind !== "documents")
  ) {
    throw new Error("Fixture structural relation disappeared.");
  }
  reboundRelation.source_ordinal = 1;
  await rewriteFamily("relation", relationRecords);

  manifest.semantic_digest = recomputeManifestSemanticDigest(manifest);
  await writeManifest(directory, manifest, { rebindGeneration: true });
}

afterEach(async () => {
  __resetCatalogFileReadCountsForTests();
  await Promise.all(
    temporaryDirectories
      .splice(0, temporaryDirectories.length)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

afterAll(async () => {
  if (generatedDirectory) {
    await fs.rm(generatedDirectory, { recursive: true, force: true });
  }
});

describe("Salt catalog schema v2 descriptor and storage contract", () => {
  it("returns a structured-cloneable materialized build snapshot", () => {
    const firstComponent = builtRegistry.components[0];
    if (!firstComponent) throw new Error("Fixture has no components.");
    expect(Object.isFrozen(builtRegistry)).toBe(true);
    expect(Object.isFrozen(builtRegistry.components)).toBe(true);
    expect(Object.isFrozen(firstComponent)).toBe(true);
    expect(() => {
      (firstComponent as { name: string }).name = "Mutated component";
    }).toThrow();

    const clone = structuredClone(builtRegistry);

    expect(clone).not.toBe(builtRegistry);
    expect(clone.semantic_hash).toBe(builtRegistry.semantic_hash);
    expect(clone.deprecations).toHaveLength(builtRegistry.deprecations.length);
  });

  it("derives runtime families, package files, codecs, and URIs from one descriptor table", async () => {
    const runtimeFamilies = getCatalogRuntimeFamilyNames();
    const buildOnlyFamilies = getCatalogBuildOnlyFamilyNames();
    expectTypeOf<CatalogBuildOnlyFamilyName>().toEqualTypeOf<"build_audit">();
    expectTypeOf<CatalogRuntimeFamilyName>().toEqualTypeOf<
      Exclude<CatalogFamilyName, "build_audit">
    >();
    expect(runtimeFamilies).toEqual(
      CATALOG_FAMILY_NAMES.filter(
        (family) => catalogFamilies[family].publicationState !== "build-only",
      ),
    );
    expect(buildOnlyFamilies).toEqual(
      CATALOG_FAMILY_NAMES.filter(
        (family) => catalogFamilies[family].publicationState === "build-only",
      ),
    );
    expect(CATALOG_SEARCH_TARGET_FAMILY_NAMES).toEqual(
      CATALOG_FAMILY_NAMES.filter(
        (family) => catalogFamilies[family].searchable,
      ),
    );
    expectTypeOf<
      CatalogRecordForFamily<"search_document">["target"]["family"]
    >().toEqualTypeOf<CatalogSearchTargetFamilyName>();
    expectTypeOf<
      string extends CatalogSearchTargetFamilyName ? true : false
    >().toEqualTypeOf<false>();
    for (const family of CATALOG_FAMILY_NAMES) {
      const descriptor = catalogFamilies[family];
      expect(descriptor.primaryKey).toBe("id");
      expect(descriptor.codecName).toMatch(/^salt\.catalog\.v2\./u);
      expect(descriptor.artifact).toMatch(/\.json$/u);
      expect(descriptor.resourceUriTemplate).toContain("{id}");
    }

    const definitions = createCatalogJsonSchema().definitions as Record<
      string,
      {
        properties?: {
          target?: {
            properties?: {
              family?: { enum?: string[] };
            };
          };
        };
      }
    >;
    const searchDocumentSchema = definitions.search_document;
    expect(
      searchDocumentSchema?.properties?.target?.properties?.family?.enum,
    ).toEqual(CATALOG_SEARCH_TARGET_FAMILY_NAMES);
    if (!searchDocumentSchema) {
      throw new Error("Published catalog schema has no search definition.");
    }
    const validateSearchDocument = new Ajv2020({
      allErrors: true,
      strict: false,
    }).compile(searchDocumentSchema);
    const searchDocument = {
      family: "search_document",
      id: "search:fixture",
      target: { family: "", id: "fixture" },
      title: "Fixture",
      summary: "",
      terms: [],
      facets: {},
    };
    for (const family of CATALOG_SEARCH_TARGET_FAMILY_NAMES) {
      expect(
        validateSearchDocument({
          ...searchDocument,
          target: { ...searchDocument.target, family },
        }),
        JSON.stringify(validateSearchDocument.errors),
      ).toBe(true);
    }
    for (const family of CATALOG_FAMILY_NAMES.filter(
      (candidate) => !catalogFamilies[candidate].searchable,
    )) {
      expect(
        validateSearchDocument({
          ...searchDocument,
          target: { ...searchDocument.target, family },
        }),
      ).toBe(false);
    }

    const inventory = await readPublicationInventory(generatedDirectory);
    const manifest = await readManifest(generatedDirectory);
    expect(manifest.build_artifacts.map((entry) => entry.family)).toEqual(
      buildOnlyFamilies,
    );
    expect(inventory.files).toEqual(
      getCatalogPublishedFileNames(inventory.generation),
    );
    const buildEntry = manifest.build_artifacts[0];
    if (!buildEntry) {
      throw new Error("Fixture manifest has no build artifact.");
    }
    expect(buildEntry).toMatchObject({
      family: "build_audit",
      codec: catalogFamilies.build_audit.codecName,
      canonical: catalogFamilies.build_audit.canonical,
    });
    expect(inventory.files).not.toContain(buildEntry.file);
    const buildBytes = await fs.readFile(
      path.join(generatedDirectory, ...buildEntry.file.split("/")),
    );
    expect(buildEntry.bytes).toBe(buildBytes.byteLength);
    expect(buildEntry.sha256).toBe(sha256Bytes(buildBytes));
    const buildEnvelope = JSON.parse(buildBytes.toString("utf8")) as {
      records: unknown[];
    };
    expect(buildEntry.record_count).toBe(buildEnvelope.records.length);
    expect(
      (
        await fs.stat(
          path.join(
            generatedDirectory,
            ...inventory.generation.split("/"),
            catalogFamilies.build_audit.artifact,
          ),
        )
      ).isFile(),
    ).toBe(true);
    const store = new CatalogStoreV2({ registryDir: generatedDirectory });
    expect(() => store.validateBuildArtifacts()).not.toThrow();

    const runtimeInBuildSection = structuredClone(manifest);
    (
      runtimeInBuildSection.build_artifacts[0] as unknown as {
        family: string;
      }
    ).family = "component";
    expect(catalogManifestCodec.safeParse(runtimeInBuildSection).success).toBe(
      false,
    );
    const buildOnlyInRuntimeSection = structuredClone(manifest);
    (
      buildOnlyInRuntimeSection.artifacts[0] as unknown as { family: string }
    ).family = "build_audit";
    expect(
      catalogManifestCodec.safeParse(buildOnlyInRuntimeSection).success,
    ).toBe(false);
  });

  it("protects every typed relation variant with an explicit family matrix", () => {
    const evidence = { family: "evidence", id: "evidence.fixture" };
    const cases: Array<{
      relationKind: string;
      valid: Record<string, unknown>;
      wrongSourceFamily: string;
      wrongTargetFamily: string;
    }> = [
      {
        relationKind: "composes",
        valid: {
          family: "relation",
          id: "relation.composes",
          relation_kind: "composes",
          source: { family: "pattern", id: "pattern.fixture" },
          target: { family: "component", id: "component.fixture" },
          provenance: "declared",
          role: null,
          source_ordinal: 0,
          normative: false,
          source_evidence_refs: [evidence],
        },
        wrongSourceFamily: "component",
        wrongTargetFamily: "guide",
      },
      {
        relationKind: "related_to",
        valid: {
          family: "relation",
          id: "relation.related",
          relation_kind: "related_to",
          source: { family: "component", id: "component.fixture" },
          target: { family: "pattern", id: "pattern.fixture" },
          provenance: "declared",
          role: null,
          source_ordinal: 0,
          normative: false,
          source_evidence_refs: [evidence],
        },
        wrongSourceFamily: "guide",
        wrongTargetFamily: "component",
      },
      {
        relationKind: "documents",
        valid: {
          family: "relation",
          id: "relation.documents",
          relation_kind: "documents",
          source: { family: "guide", id: "guide.fixture" },
          target: { family: "package", id: "package.fixture" },
          provenance: "derived",
          role: null,
          source_ordinal: 0,
          normative: false,
          source_evidence_refs: [evidence],
        },
        wrongSourceFamily: "pattern",
        wrongTargetFamily: "guide",
      },
      {
        relationKind: "observed_in_example",
        valid: {
          family: "relation",
          id: "relation.observed",
          relation_kind: "observed_in_example",
          source: { family: "page", id: "page.fixture" },
          target: evidence,
          provenance: "observation",
          role: null,
          normative: false,
          source_evidence_refs: [evidence],
        },
        wrongSourceFamily: "guide",
        wrongTargetFamily: "source",
      },
      {
        relationKind: "export_observed_in_example",
        valid: {
          family: "relation",
          id: "relation.export-observed",
          relation_kind: "export_observed_in_example",
          source: { family: "component", id: "component.fixture" },
          target: { family: "source", id: "source.fixture" },
          provenance: "observation",
          role: "export:Fixture",
          normative: false,
          source_evidence_refs: [evidence],
        },
        wrongSourceFamily: "pattern",
        wrongTargetFamily: "component",
      },
      {
        relationKind: "exported_from",
        valid: {
          family: "relation",
          id: "relation.exported",
          relation_kind: "exported_from",
          source: { family: "icon", id: "icon.fixture" },
          target: { family: "source", id: "source.fixture" },
          provenance: "derived",
          role: "export:Fixture",
          normative: false,
          source_evidence_refs: [],
        },
        wrongSourceFamily: "pattern",
        wrongTargetFamily: "component",
      },
      {
        relationKind: "replaced_by",
        valid: {
          family: "relation",
          id: "relation.replaced",
          relation_kind: "replaced_by",
          source: {
            family: "token_declaration",
            id: "token-declaration.fixture",
          },
          target: { family: "token", id: "token.replacement" },
          provenance: "declared",
          role: null,
          normative: true,
          source_evidence_refs: [evidence],
        },
        wrongSourceFamily: "component",
        wrongTargetFamily: "component",
      },
    ];

    for (const fixture of cases) {
      const parsed = relationCodec.parse(fixture.valid);
      expect(parsed).toMatchObject({
        relation_kind: fixture.relationKind,
      });
      expect(
        decodeCatalogRecordFromStorage(
          "relation",
          encodeCatalogRecordForStorage("relation", parsed),
        ),
      ).toEqual(parsed);

      const wrongSource = structuredClone(fixture.valid) as {
        source: { family: string };
      };
      wrongSource.source.family = fixture.wrongSourceFamily;
      expect(() => relationCodec.parse(wrongSource)).toThrow();

      const wrongTarget = structuredClone(fixture.valid) as {
        target: { family: string };
      };
      wrongTarget.target.family = fixture.wrongTargetFamily;
      expect(() => relationCodec.parse(wrongTarget)).toThrow();
    }

    const divergentObservation = structuredClone(
      cases.find((fixture) => fixture.relationKind === "observed_in_example")
        ?.valid,
    ) as {
      source_evidence_refs: Array<{
        family: "evidence";
        id: string;
      }>;
    };
    divergentObservation.source_evidence_refs[0] = {
      family: "evidence",
      id: "evidence.different",
    };
    expect(() => relationCodec.parse(divergentObservation)).toThrow(
      /must cite the executable evidence target/u,
    );
  });

  it("binds every structural relation to source evidence", () => {
    const relations = new CatalogStoreV2({
      registryDir: generatedDirectory,
    })
      .getFamily("relation")
      .filter(
        (relation) =>
          relation.relation_kind === "composes" ||
          relation.relation_kind === "related_to" ||
          relation.relation_kind === "documents",
      );
    expect(relations.length).toBeGreaterThan(0);
    for (const relation of relations) {
      expect(
        relation.source_evidence_refs.length,
        `${relation.id} has no declaration evidence`,
      ).toBeGreaterThan(0);
    }
  });

  it("publishes Content status composition only from its authored component metadata", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const relations = store
      .getFamily("relation")
      .filter(
        (
          relation,
        ): relation is Extract<
          CatalogRecordForFamily<"relation">,
          { relation_kind: "composes" }
        > =>
          relation.relation_kind === "composes" &&
          relation.source.family === "pattern" &&
          relation.source.id === "pattern.content-status",
      )
      .sort((left, right) => left.source_ordinal - right.source_ordinal);

    expect(relations.map((relation) => relation.target.id)).toEqual([
      "component.button",
      "component.progress",
      "component.spinner",
      "component.stack-layout",
      "component.status-indicator",
      "component.text",
    ]);
    const stackRelation = relations.find(
      (relation) => relation.target.id === "component.stack-layout",
    );
    expect(stackRelation?.role).toBe(
      "Arranges the visual indicator, title, supporting message, and optional action in one vertically centered content-status group.",
    );
    const evidenceRef = stackRelation?.source_evidence_refs[0];
    const evidence = evidenceRef
      ? store.getRecord("evidence", evidenceRef.id)
      : null;
    if (
      !evidence ||
      evidence.evidence_kind !== "source_assertion" ||
      evidence.assertion_kind !== "structural_relation"
    ) {
      throw new Error("Content status Stack layout assertion is missing.");
    }
    expect(store.getContentJson(evidence.detail_content_ref)).toMatchObject({
      source: { family: "pattern", id: "pattern.content-status" },
      target: { family: "component", id: "component.stack-layout" },
      source_field: "data.components",
      role_source_field: 'data.ai.componentRoles["Stack layout"]',
      role: stackRelation?.role,
    });
    expect(
      canonicalJson({
        relation: stackRelation,
        assertion: store.getContentJson(evidence.detail_content_ref),
      }),
    ).not.toMatch(/list builder|two lists|move buttons/iu);
  });

  it("publishes canonical guide component and package document relations", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const guide = store
      .getFamily("guide")
      .find((candidate) => candidate.id === "guide.developing");
    expect(guide).toBeDefined();

    const componentTarget = {
      family: "component" as const,
      id: "component.data-grid",
    };
    const packageTarget = {
      family: "package" as const,
      id: "package.salt-ds-ag-grid-theme",
    };
    expect(guide?.documented_entity_refs).toContainEqual(componentTarget);
    expect(guide?.package_refs).toContainEqual(packageTarget);

    const documentRelations = store
      .getFamily("relation")
      .filter((relation) => relation.relation_kind === "documents")
      .filter(
        (relation) =>
          relation.source.family === "guide" &&
          relation.source.id === guide?.id,
      );
    const componentRelations = documentRelations.filter(
      (relation) =>
        relation.target.family === componentTarget.family &&
        relation.target.id === componentTarget.id,
    );
    const packageRelations = documentRelations.filter(
      (relation) =>
        relation.target.family === packageTarget.family &&
        relation.target.id === packageTarget.id,
    );
    expect(componentRelations).toHaveLength(1);
    expect(componentRelations[0]?.source_ordinal).toBe(
      guide?.documented_entity_refs.findIndex(
        (reference) =>
          reference.family === componentTarget.family &&
          reference.id === componentTarget.id,
      ),
    );
    expect(packageRelations).toHaveLength(1);
    expect(packageRelations[0]?.source_ordinal).toBe(
      guide?.package_refs.findIndex(
        (reference) =>
          reference.family === packageTarget.family &&
          reference.id === packageTarget.id,
      ),
    );
  });

  it(
    "detects a descriptor resolver that omits a dormant nested reference",
    () => {
      const descriptor = catalogFamilies.component;
      const originalResolver = descriptor.resolveReferences;
      descriptor.resolveReferences = () => [];
      try {
        expect(() =>
          new CatalogStoreV2({
            registryDir: generatedDirectory,
          }).validateCrossReferences(),
        ).toThrow(/descriptor reference resolver does not exhaustively match/u);
      } finally {
        descriptor.resolveReferences = originalResolver;
      }
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it("round-trips fixed-width token declaration tuples without inventing optional fields", () => {
    const logical: CatalogRecordForFamily<"token_declaration"> = {
      family: "token_declaration",
      id: "declaration.fixture",
      token_ref: { family: "token", id: "--salt-fixture" },
      value: "1px",
      context_ref: { family: "declaration_context", id: "context.fixture" },
      source_range: [0, 20, 1, 1, 1, 21],
      source_ref: { family: "source", id: "source.fixture" },
      deprecated: false,
    };
    const stored = encodeCatalogRecordForStorage("token_declaration", logical);
    expect(stored).toEqual([
      "declaration.fixture",
      "--salt-fixture",
      "1px",
      null,
      null,
      "context.fixture",
      [0, 20, 1, 1, 1, 21],
      "source.fixture",
      false,
      null,
    ]);
    expect(decodeCatalogRecordFromStorage("token_declaration", stored)).toEqual(
      logical,
    );
    expect(() =>
      decodeCatalogRecordFromStorage(
        "token_declaration",
        (stored as unknown[]).slice(0, -1),
      ),
    ).toThrow(/invalid token_declaration storage tuple/u);
  });

  it("round-trips method and static-method API identities without changing tuple width", () => {
    for (const memberKind of ["method", "static_method"] as const) {
      const logical: CatalogRecordForFamily<"api_symbol"> = {
        family: "api_symbol",
        id: `api-symbol.fixture-${memberKind}`,
        package_ref: { family: "package", id: "package.salt-ds-core" },
        entrypoint: ".",
        export_name: "FixtureApi",
        symbol_space:
          memberKind === "static_method" ? "type_and_value" : "type",
        member_path: [{ kind: memberKind, name: "legacy" }],
      };
      const stored = encodeCatalogRecordForStorage("api_symbol", logical);
      expect(stored).toHaveLength(6);
      expect(decodeCatalogRecordFromStorage("api_symbol", stored)).toEqual(
        logical,
      );
    }
  });

  it("round-trips compact content and search tuples without changing logical records", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    for (const family of [
      "content",
      "search_document",
      "accessibility_claim",
      "policy_profile",
      "deprecation",
    ] as const) {
      const logical = store.getFamily(family)[0];
      if (!logical) {
        throw new Error(`Built fixture has no ${family} record.`);
      }
      const stored = encodeCatalogRecordForStorage(family, logical);
      expect(Array.isArray(stored)).toBe(true);
      expect(
        decodeCatalogRecordFromStorage(
          family,
          stored,
          family === "search_document"
            ? (reference) =>
                store.getRecord(
                  reference.family as CatalogRuntimeFamilyName,
                  reference.id,
                ) as CatalogRecord | null
            : undefined,
        ),
      ).toEqual(logical);
    }
  });

  it("rejects invalid derived-search groups before resolving any target", () => {
    const nonSearchFamily = CATALOG_FAMILY_NAMES.find(
      (family) =>
        catalogFamilies[family].canonical &&
        !catalogFamilies[family].searchable,
    );
    if (!nonSearchFamily) {
      throw new Error("Fixture descriptor has no canonical non-search family.");
    }
    for (const records of [
      [["not_a_family", ["target.fixture"]]],
      [[nonSearchFamily, ["target.fixture"]]],
      [["component", []]],
    ]) {
      let resolverCalls = 0;
      expect(() =>
        parseCatalogArtifactEnvelope(
          "search_document",
          {
            schema_version: SALT_CATALOG_SCHEMA_VERSION,
            family: "search_document",
            records,
          },
          () => {
            resolverCalls += 1;
            return null;
          },
        ),
      ).toThrow();
      expect(resolverCalls).toBe(0);
    }
  });

  it("accepts only portable repository-relative paths", () => {
    expect(
      portableRepositoryPathCodec.parse("packages/theme/css/theme.css"),
    ).toBe("packages/theme/css/theme.css");
    for (const invalid of [
      "../escape",
      "packages/../escape",
      "packages/./theme.css",
      "packages\\theme.css",
      "/absolute/path",
      "C:/absolute/path",
      "packages//theme.css",
      "packages/theme\u0000.css",
      "packages/theme:invalid.css",
      "packages/CON/readme.md",
      "packages/com1.txt/readme.md",
      "packages/theme./readme.md",
      "packages/theme /readme.md",
      "packages/cafe\u0301/readme.md",
      ".",
      "",
    ]) {
      expect(() => portableRepositoryPathCodec.parse(invalid)).toThrow(
        /repository-relative portable path/u,
      );
    }
  });

  it("retains representable locator constraints in the published catalog schema", () => {
    const published = createCatalogJsonSchema();
    const definitions = published.definitions as
      | Record<string, Record<string, unknown>>
      | undefined;
    const sourceSchema = definitions?.source;
    if (!sourceSchema) {
      throw new Error("Published catalog schema has no source definition.");
    }
    const validateSource = new Ajv2020({
      allErrors: true,
      strict: false,
    }).compile(sourceSchema);
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const repositorySource = store
      .getFamily("source")
      .find((record) => record.source_kind === "repository_file");
    if (!repositorySource) {
      throw new Error(
        "Built fixture lacks a representative repository source.",
      );
    }
    const externalSource = sourceCodec.parse({
      family: "source",
      id: "source.external-https-schema-fixture",
      status: "neutral",
      source_kind: "external_https",
      locator: "https://example.test/catalog-source",
      extraction_method: "external_reference",
      validation: {
        state: "unvalidated",
        reason: "Synthetic schema variant for locator-boundary coverage.",
        validated_at: null,
      },
    });
    expect(validateSource(repositorySource)).toBe(true);
    expect(validateSource(externalSource)).toBe(true);

    for (const locator of [
      `${repositorySource.locator}/`,
      `./${repositorySource.locator}`,
      "packages/COM¹/readme.md",
    ]) {
      expect(
        validateSource({
          ...repositorySource,
          locator,
        }),
        JSON.stringify(validateSource.errors),
      ).toBe(false);
    }
    for (const locator of [
      "https://a:bad",
      "https://[::1",
      "https://user:secret@example.test/source",
    ]) {
      expect(
        validateSource({
          ...externalSource,
          locator,
        }),
        JSON.stringify(validateSource.errors),
      ).toBe(false);
    }
  });

  it(
    "rejects malformed authored repository paths without normalizing them",
    () => {
      const sourceRoot = builtRegistry.packages.find(
        (packageRecord) => packageRecord.source_root.length > 0,
      )?.source_root;
      if (!sourceRoot) {
        throw new Error("Built fixture has no package source root.");
      }

      for (const invalid of [
        `./${sourceRoot}`,
        sourceRoot.replaceAll("/", "\\"),
      ]) {
        const registry = JSON.parse(
          JSON.stringify(builtRegistry),
        ) as SaltRegistry;
        const packageRecord = registry.packages.find(
          (candidate) => candidate.source_root === sourceRoot,
        );
        if (!packageRecord) {
          throw new Error("Cloned fixture lost its package source root.");
        }
        packageRecord.source_root = invalid;
        expect(() =>
          normalizeCatalogV2({
            registry,
            inventory: builtInventory,
          }),
        ).toThrow(/portable repository-relative path/u);
      }

      const registryWithPathInUrlField = JSON.parse(
        JSON.stringify(builtRegistry),
      ) as SaltRegistry;
      const deprecation = registryWithPathInUrlField.deprecations[0];
      if (!deprecation) {
        throw new Error("Built fixture has no deprecation.");
      }
      deprecation.source_urls = ["packages/core/src/fixture.ts"];
      expect(() =>
        normalizeCatalogV2({
          registry: registryWithPathInUrlField,
          inventory: builtInventory,
        }),
      ).toThrow(/canonical Salt route or safe absolute HTTPS URL/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it("keeps URL-semantic detail fields on the public locator policy", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const component = store.getFamily("component")[0];
    if (!component) {
      throw new Error("Built fixture has no component.");
    }
    const detail = store.getContentJson(component.detail_content_ref);

    for (const invalid of [
      "packages/core/src/button/Button.tsx",
      "/salt/components/button/index",
      "https://user@example.com/docs",
      "https://example.com\\docs",
    ]) {
      const mutated = structuredClone(detail);
      mutated.related_docs.overview = invalid;
      expect(() =>
        parseCatalogContentPayload("component_detail", mutated),
      ).toThrow();
    }
  });

  it("requires executable ordering dimensions and rejects executable fields on links", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const executable = store
      .getFamily("evidence")
      .find((record) => record.evidence_kind === "executable_example");
    const linked = store
      .getFamily("evidence")
      .find(
        (record) =>
          record.evidence_kind === "external_demo" ||
          record.evidence_kind === "design_reference" ||
          record.evidence_kind === "documentation_link",
      );
    if (
      !executable ||
      executable.evidence_kind !== "executable_example" ||
      !linked
    ) {
      throw new Error("Built fixture has no representative example evidence.");
    }

    for (const field of ["owner_ordinal", "registry_ordinal"] as const) {
      const invalidExecutable = structuredClone(executable) as Record<
        string,
        unknown
      >;
      delete invalidExecutable[field];
      const executableResult =
        catalogFamilies.evidence.codec.safeParse(invalidExecutable);
      expect(executableResult.success).toBe(false);
    }

    for (const [field, value] of [
      ["code", "// Linked resource: https://example.com"],
      ["code_content_id", `sha256:${"a".repeat(64)}`],
      [
        "example_occurrence",
        {
          local_id: "linked",
          owner_ordinal: 0,
          registry_ordinal: 0,
        },
      ],
    ] as const) {
      const invalidLinked = {
        ...structuredClone(linked),
        [field]: value,
      };
      const linkedResult =
        catalogFamilies.evidence.codec.safeParse(invalidLinked);
      expect(linkedResult.success).toBe(false);
      if (!linkedResult.success) {
        expect(linkedResult.error.message).toContain(field);
      }
    }

    expect(
      builtRegistry.examples.every(
        (example) => !/\/\/\s*Linked resource:/iu.test(example.code),
      ),
    ).toBe(true);
  });

  it(
    "rejects missing or divergent nested/global example copies during normalization",
    () => {
      const originalComponent = builtRegistry.components.find(
        (component) => component.examples.length > 0,
      );
      const originalExample = originalComponent?.examples[0];
      if (!originalComponent || !originalExample) {
        throw new Error("Built fixture has no component example.");
      }

      const missingNested = JSON.parse(
        JSON.stringify(builtRegistry),
      ) as SaltRegistry;
      const missingNestedOwner = missingNested.components.find(
        (component) => component.id === originalComponent.id,
      );
      if (!missingNestedOwner) {
        throw new Error("Cloned fixture lost its example owner.");
      }
      missingNestedOwner.examples = missingNestedOwner.examples.filter(
        (example) => example.id !== originalExample.id,
      );
      expect(() =>
        normalizeCatalogV2({
          registry: missingNested,
          inventory: builtInventory,
        }),
      ).toThrow(/missing from its nested owner examples/u);

      const missingGlobal = JSON.parse(
        JSON.stringify(builtRegistry),
      ) as SaltRegistry;
      missingGlobal.examples = missingGlobal.examples.filter(
        (example) =>
          !(
            example.id === originalExample.id &&
            example.target_type === "component" &&
            example.target_name === originalComponent.name
          ),
      );
      expect(() =>
        normalizeCatalogV2({
          registry: missingGlobal,
          inventory: builtInventory,
        }),
      ).toThrow(/Nested owner examples are missing from the global registry/u);

      const divergent = JSON.parse(
        JSON.stringify(builtRegistry),
      ) as SaltRegistry;
      const divergentOwner = divergent.components.find(
        (component) => component.id === originalComponent.id,
      );
      const divergentExample = divergentOwner?.examples.find(
        (example) => example.id === originalExample.id,
      );
      if (!divergentExample) {
        throw new Error("Cloned fixture lost its nested example.");
      }
      divergentExample.description = `${divergentExample.description} changed`;
      expect(() =>
        normalizeCatalogV2({
          registry: divergent,
          inventory: builtInventory,
        }),
      ).toThrow(/differs from the record nested under/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it("rejects deprecation kinds that contradict their public API subjects during normalization", () => {
    const registry = structuredClone(builtRegistry);
    const deprecation = registry.deprecations.find(
      (candidate) => candidate.kind === "prop",
    );
    if (!deprecation) throw new Error("Fixture has no prop deprecation.");
    deprecation.kind = "component";

    expect(() =>
      normalizeCatalogV2({
        registry,
        inventory: builtInventory,
      }),
    ).toThrow(/kind does not match its public API subject/u);
  });

  it("rejects unresolved deprecation component associations instead of dropping them", () => {
    const registry = structuredClone(builtRegistry);
    const deprecation = registry.deprecations[0];
    if (!deprecation) throw new Error("Fixture has no deprecation.");
    deprecation.component = "MissingComponent";

    expect(() =>
      normalizeCatalogV2({
        registry,
        inventory: builtInventory,
      }),
    ).toThrow(/unresolved component association 'MissingComponent'/u);
  });

  it("rejects method identities in property-assignment value maps during normalization", () => {
    const registry = structuredClone(builtRegistry);
    const deprecation = registry.deprecations.find(
      (candidate) =>
        candidate.migration.value_map &&
        candidate.replacement.targets[0]?.member_path.at(-1)?.kind === "prop",
    );
    if (!deprecation || !deprecation.migration.value_map) {
      throw new Error("Fixture has no property value-map deprecation.");
    }
    const originalTarget = deprecation.replacement.targets[0];
    if (!originalTarget?.member_path[0]) {
      throw new Error("Fixture value-map target is not a member.");
    }
    originalTarget.member_path[0].kind = "method";
    for (const valueMapCase of deprecation.migration.value_map.cases) {
      for (const assignment of valueMapCase.set) {
        if (assignment.target.member_path[0]) {
          assignment.target.member_path[0].kind = "method";
        }
      }
    }

    expect(() =>
      normalizeCatalogV2({
        registry,
        inventory: builtInventory,
      }),
    ).toThrow(/value map targets must be public properties/u);
  });

  it(
    "requires value maps to stay on one public property owner during normalization",
    () => {
      const crossOwnerRegistry = structuredClone(builtRegistry);
      const crossOwnerDeprecation = crossOwnerRegistry.deprecations.find(
        (candidate) =>
          candidate.migration.value_map &&
          candidate.replacement.targets[0]?.member_path.at(-1)?.kind === "prop",
      );
      if (
        !crossOwnerDeprecation ||
        !crossOwnerDeprecation.migration.value_map
      ) {
        throw new Error("Fixture has no property value-map deprecation.");
      }
      for (const target of crossOwnerDeprecation.replacement.targets) {
        target.export_name = "OtherProps";
      }
      if (crossOwnerDeprecation.replacement.target) {
        crossOwnerDeprecation.replacement.target.export_name = "OtherProps";
      }
      for (const valueMapCase of crossOwnerDeprecation.migration.value_map
        .cases) {
        for (const assignment of valueMapCase.set) {
          assignment.target.export_name = "OtherProps";
        }
      }
      expect(() =>
        normalizeCatalogV2({
          registry: crossOwnerRegistry,
          inventory: builtInventory,
        }),
      ).toThrow(/must belong to the deprecated property's public API owner/u);

      const nonPropRegistry = structuredClone(builtRegistry);
      const nonPropDeprecation = nonPropRegistry.deprecations.find(
        (candidate) => candidate.migration.value_map,
      );
      if (
        !nonPropDeprecation ||
        !nonPropDeprecation.migration.value_map ||
        !nonPropDeprecation.subject.member_path[0]
      ) {
        throw new Error("Fixture has no property value-map deprecation.");
      }
      nonPropDeprecation.subject.member_path[0].kind = "method";
      nonPropDeprecation.kind = "method";
      nonPropDeprecation.id = createDeprecationId(nonPropDeprecation.subject);
      expect(() =>
        normalizeCatalogV2({
          registry: nonPropRegistry,
          inventory: builtInventory,
        }),
      ).toThrow(/value map subject must be a public property/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it("rejects replacement targets with incompatible public symbol spaces during normalization", () => {
    const registry = structuredClone(builtRegistry);
    const deprecation = registry.deprecations.find(
      (candidate) =>
        candidate.subject.symbol_space === "value" &&
        candidate.replacement.target?.symbol_space === "value",
    );
    if (!deprecation?.replacement.target) {
      throw new Error("Fixture has no value-space direct replacement.");
    }
    deprecation.replacement.target.symbol_space = "type";
    for (const target of deprecation.replacement.targets) {
      target.symbol_space = "type";
    }

    expect(() =>
      normalizeCatalogV2({
        registry,
        inventory: builtInventory,
      }),
    ).toThrow(/incompatible public type\/value symbol space/u);
  });

  it(
    "rejects self-targeting and cyclic composite API replacement graphs",
    () => {
      const findButtonVariantComposite = (registry: SaltRegistry) =>
        registry.deprecations.find(
          (candidate) =>
            candidate.package === "@salt-ds/core" &&
            candidate.subject.entrypoint === "." &&
            candidate.subject.export_name === "ButtonProps" &&
            candidate.subject.member_path.at(-1)?.name === "variant" &&
            candidate.replacement.mode === "composite",
        );
      const selfTargeting = structuredClone(builtRegistry);
      const selfComposite = findButtonVariantComposite(selfTargeting);
      const originalSelfTarget = selfComposite?.replacement.targets.find(
        (target) => target.member_path.at(-1)?.name === "appearance",
      );
      if (
        !selfComposite ||
        !selfComposite.migration.value_map ||
        !originalSelfTarget
      ) {
        throw new Error(
          "Fixture has no ButtonProps.variant composite deprecation.",
        );
      }
      const originalSelfTargetIndex =
        selfComposite.replacement.targets.indexOf(originalSelfTarget);
      selfComposite.replacement.targets[originalSelfTargetIndex] =
        structuredClone(selfComposite.subject);
      for (const valueMapCase of selfComposite.migration.value_map.cases) {
        for (const assignment of valueMapCase.set) {
          if (
            canonicalJson(assignment.target) ===
            canonicalJson(originalSelfTarget)
          ) {
            assignment.target = structuredClone(selfComposite.subject);
          }
        }
      }
      expect(() =>
        normalizeCatalogV2({
          registry: selfTargeting,
          inventory: builtInventory,
        }),
      ).toThrow(/cannot replace its own API subject/u);

      const cyclic = structuredClone(builtRegistry);
      const composite = findButtonVariantComposite(cyclic);
      const compositeAppearanceTarget = composite?.replacement.targets.find(
        (target) => target.member_path.at(-1)?.name === "appearance",
      );
      if (
        !composite ||
        !composite.migration.value_map ||
        !compositeAppearanceTarget
      ) {
        throw new Error(
          "Fixture has no ButtonProps.variant composite deprecation.",
        );
      }
      const reverseSubject = structuredClone(compositeAppearanceTarget);
      if (
        cyclic.deprecations.some(
          (candidate) =>
            canonicalJson(candidate.subject) === canonicalJson(reverseSubject),
        )
      ) {
        throw new Error("Fixture composite target is already deprecated.");
      }
      const reverse = structuredClone(composite);
      reverse.id = createDeprecationId(reverseSubject);
      reverse.subject = reverseSubject;
      reverse.kind = "prop";
      reverse.name =
        reverseSubject.member_path.at(-1)?.name ?? reverseSubject.export_name;
      reverse.replacement = {
        mode: "single",
        target: structuredClone(composite.subject),
        targets: [structuredClone(composite.subject)],
        type: "symbol",
        name:
          composite.subject.member_path.at(-1)?.name ??
          composite.subject.export_name,
        notes: "Cyclic fixture.",
      };
      reverse.migration = {
        strategy: "replace",
        value_map: null,
        details: [
          {
            from: reverse.name,
            to:
              composite.subject.member_path.at(-1)?.name ??
              composite.subject.export_name,
          },
        ],
      };
      cyclic.deprecations.push(reverse);
      expect(() =>
        normalizeCatalogV2({
          registry: cyclic,
          inventory: builtInventory,
        }),
      ).toThrow(/API replacement graph contains a cycle/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it("round-trips token tuples and validates every token declaration slot", () => {
    const token: CatalogRecordForFamily<"token"> = {
      family: "token",
      id: "--salt-fixture",
      name: "--salt-fixture",
      category: "fixture",
      type: "length",
      semantic_intent: null,
      aliases: ["--legacy-fixture"],
      policy_profile_ref: { family: "policy_profile", id: "policy.fixture" },
      evidence_profile_ref: {
        family: "policy_profile",
        id: "policy.evidence.fixture",
      },
      applies_to: [
        {
          family: "component",
          id: "component.fixture",
        },
      ],
    };
    const storedToken = encodeCatalogRecordForStorage("token", token);
    expect(storedToken).toEqual([
      "--salt-fixture",
      "fixture",
      "length",
      null,
      ["--legacy-fixture"],
      "policy.fixture",
      "policy.evidence.fixture",
      ["component.fixture"],
    ]);
    expect(decodeCatalogRecordFromStorage("token", storedToken)).toEqual(token);
    expect(() =>
      encodeCatalogRecordForStorage("token", {
        ...token,
        name: "--salt-different",
      }),
    ).toThrow(/name must exactly match its canonical id/u);
    expect(() =>
      decodeCatalogRecordFromStorage("token", [
        "--salt-fixture",
        "--salt-fixture",
        "fixture",
        "length",
        null,
        ["--legacy-fixture"],
        "policy.fixture",
        "policy.evidence.fixture",
        ["component.fixture"],
      ]),
    ).toThrow(/invalid token storage tuple/u);

    const declaration: CatalogRecordForFamily<"token_declaration"> = {
      family: "token_declaration",
      id: "declaration.full",
      token_ref: { family: "token", id: "--salt-fixture" },
      value: "1px",
      raw_value: " 1px",
      important: true,
      context_ref: { family: "declaration_context", id: "context.fixture" },
      source_range: [2, 24, 2, 3, 3, 10],
      source_ref: { family: "source", id: "source.fixture" },
      deprecated: true,
      replacement_token_ref: {
        family: "token",
        id: "--salt-replacement",
      },
    };
    const storedDeclaration = encodeCatalogRecordForStorage(
      "token_declaration",
      declaration,
    );
    expect(storedDeclaration).toEqual([
      "declaration.full",
      "--salt-fixture",
      "1px",
      " 1px",
      true,
      "context.fixture",
      [2, 24, 2, 3, 3, 10],
      "source.fixture",
      true,
      "--salt-replacement",
    ]);
    expect(
      decodeCatalogRecordFromStorage("token_declaration", storedDeclaration),
    ).toEqual(declaration);

    const wrongRangeType = [...(storedDeclaration as unknown[])];
    wrongRangeType[6] = { start: 2, end: 24 };
    const wrongRequiredType = [...(storedDeclaration as unknown[])];
    wrongRequiredType[8] = "true";
    for (const invalid of [
      { ...token },
      wrongRangeType,
      wrongRequiredType,
      [...(storedDeclaration as unknown[]), "extra"],
    ]) {
      expect(() =>
        decodeCatalogRecordFromStorage("token_declaration", invalid),
      ).toThrow();
    }
  });

  it("requires claim-level statement and classification provenance for every accessibility class", () => {
    const provenance = [
      {
        reference: {
          family: "source" as const,
          id: "source.fixture",
        },
        supports: ["statement" as const, "classification" as const],
        source_range: null,
        content_digest: `sha256:${"a".repeat(64)}`,
      },
    ];
    const base = {
      family: "accessibility_claim" as const,
      owner: {
        family: "component" as const,
        id: "component.fixture",
      },
      source_field: "accessibility.fixture",
      ordinal: 0,
      statement_content_ref: {
        family: "content",
        id: `sha256:${"b".repeat(64)}`,
        codec: "accessibility_statement",
      },
      provenance,
    };

    expect(
      accessibilityClaimCodec.parse({
        ...base,
        id: "claim.fact",
        classification: "fact",
        normativity: "descriptive",
        severity: null,
        rule_kind: null,
      }),
    ).toMatchObject({ classification: "fact" });
    expect(
      accessibilityClaimCodec.parse({
        ...base,
        id: "claim.guidance",
        classification: "guidance",
        normativity: "descriptive",
        severity: null,
        rule_kind: null,
      }),
    ).toMatchObject({ classification: "guidance" });
    expect(
      accessibilityClaimCodec.parse({
        ...base,
        id: "claim.rule",
        provenance: [
          {
            ...provenance[0],
            supports: ["statement", "classification", "severity"],
          },
        ],
        classification: "rule",
        normativity: "normative",
        authority: "curated",
        severity: "warning",
        rule_kind: "fixture",
      }),
    ).toMatchObject({ classification: "rule" });

    for (const supports of [["classification"], ["statement"]] as const) {
      expect(() =>
        accessibilityClaimCodec.parse({
          ...base,
          id: `claim.missing-${supports[0]}`,
          provenance: [{ ...provenance[0], supports: [...supports] }],
          classification: "fact",
          normativity: "descriptive",
          severity: null,
          rule_kind: null,
        }),
      ).toThrow(/supports its (?:statement|classification)/u);
    }

    for (const invalid of [
      {
        ...base,
        id: "claim.guidance-normative",
        classification: "guidance",
        normativity: "normative",
        severity: null,
        rule_kind: null,
      },
      {
        ...base,
        id: "claim.fact-normative",
        classification: "fact",
        normativity: "normative",
        severity: null,
        rule_kind: null,
      },
      {
        ...base,
        id: "claim.fact-severity",
        classification: "fact",
        normativity: "descriptive",
        severity: "warning",
        rule_kind: null,
      },
      {
        ...base,
        id: "claim.guidance-severity",
        classification: "guidance",
        normativity: "normative",
        severity: "warning",
        rule_kind: null,
      },
      {
        ...base,
        id: "claim.rule-authority",
        provenance: [
          {
            ...provenance[0],
            supports: ["statement", "classification", "severity"],
          },
        ],
        classification: "rule",
        normativity: "normative",
        authority: "inferred",
        severity: "warning",
        rule_kind: "fixture",
      },
      {
        ...base,
        id: "claim.rule-kind",
        provenance: [
          {
            ...provenance[0],
            supports: ["statement", "classification", "severity"],
          },
        ],
        classification: "rule",
        normativity: "normative",
        authority: "curated",
        severity: "warning",
        rule_kind: "",
      },
    ]) {
      expect(() => accessibilityClaimCodec.parse(invalid)).toThrow();
    }
  });

  it("rejects enforceable accessibility rules without source-backed severity", () => {
    expect(() =>
      accessibilityClaimCodec.parse({
        family: "accessibility_claim",
        id: "claim.fixture",
        owner: { family: "component", id: "component.fixture" },
        source_field: "accessibility.rules",
        ordinal: 0,
        statement_content_ref: {
          family: "content",
          id: `sha256:${"a".repeat(64)}`,
          codec: "accessibility_statement",
        },
        provenance: [
          {
            reference: { family: "source", id: "source.fixture" },
            supports: ["statement", "classification"],
            source_range: null,
            content_digest: `sha256:${"a".repeat(64)}`,
          },
        ],
        classification: "rule",
        normativity: "normative",
        authority: "curated",
        severity: "error",
        rule_kind: "fixture",
      }),
    ).toThrow(/explicitly supports severity/u);
  });

  it("keeps extracted accessibility prose descriptive unless it is explicitly classified", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const extractedProse = store
      .getFamily("accessibility_claim")
      .filter(
        (claim) =>
          claim.source_field === "accessibility.summary" ||
          claim.source_field === "accessibility.rules",
      );

    expect(extractedProse.length).toBeGreaterThan(0);
    for (const claim of extractedProse) {
      expect(claim).toMatchObject({
        classification: "guidance",
        normativity: "descriptive",
        severity: null,
        rule_kind: null,
        provenance: [
          {
            reference: { family: "source" },
            supports: ["statement", "classification"],
            source_range: null,
            content_digest: null,
          },
        ],
      });
    }
  });
});

describe("CatalogStoreV2 lazy integrity checks", () => {
  it("freezes decoded records, nested values, content payloads, and the manifest", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const component = store.getFamily("component")[0];
    if (!component) throw new Error("Fixture has no components.");
    const detail = store.getContentJson(component.detail_content_ref);

    expect(Object.isFrozen(store.manifest)).toBe(true);
    expect(Object.isFrozen(store.manifest.inputs)).toBe(true);
    expect(Object.isFrozen(store.getFamily("component"))).toBe(true);
    expect(Object.isFrozen(component)).toBe(true);
    expect(Object.isFrozen(component.aliases)).toBe(true);
    expect(Object.isFrozen(detail)).toBe(true);
    expect(() => {
      (component as { name: string }).name = "Mutated component";
    }).toThrow();
    expect(() => {
      (component.aliases as string[]).push("mutated-alias");
    }).toThrow();
    expect(() => {
      (detail as { related_docs: Record<string, unknown> }).related_docs = {};
    }).toThrow();
  });

  it("reads only the manifest eagerly and verifies a family once on first access", async () => {
    __resetCatalogFileReadCountsForTests();
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const manifestPath = path.join(
      generatedDirectory,
      SALT_CATALOG_MANIFEST_FILE,
    );
    const manifest = await readManifest(generatedDirectory);
    const tokenEntry = manifest.artifacts.find(
      (entry) => entry.family === "token",
    );
    const buildEntry = manifest.build_artifacts[0];
    if (!tokenEntry || !buildEntry) {
      throw new Error("Fixture is missing token or build artifact metadata.");
    }
    const tokenPath = path.join(
      generatedDirectory,
      ...tokenEntry.file.split("/"),
    );
    const buildPath = path.join(
      generatedDirectory,
      ...buildEntry.file.split("/"),
    );
    expect(__getCatalogFileReadCountForTests(manifestPath)).toBe(1);
    expect(__getCatalogFileReadCountForTests(tokenPath)).toBe(0);
    expect(__getCatalogFileReadCountForTests(buildPath)).toBe(0);
    expect(store.getRecord("token", "--salt-accent-background")).not.toBeNull();
    expect(__getCatalogFileReadCountForTests(tokenPath)).toBe(1);
    expect(store.getRecord("token", "--salt-accent-background")).not.toBeNull();
    expect(__getCatalogFileReadCountForTests(tokenPath)).toBe(1);
    store.prefetch();
    expect(__getCatalogFileReadCountForTests(buildPath)).toBe(0);
    store.validateBuildArtifacts();
    expect(__getCatalogFileReadCountForTests(buildPath)).toBe(1);
    store.validateBuildArtifacts();
    expect(__getCatalogFileReadCountForTests(buildPath)).toBe(1);
  });

  it("rejects digest corruption on the first affected family access", async () => {
    const directory = await createCatalogCopy();
    const manifest = await readManifest(directory);
    const componentEntry = manifest.artifacts.find(
      (entry) => entry.family === "component",
    );
    if (!componentEntry) {
      throw new Error("Fixture has no component artifact.");
    }
    await fs.appendFile(
      path.join(directory, ...componentEntry.file.split("/")),
      " ",
    );
    const store = new CatalogStoreV2({ registryDir: directory });
    expect(() => store.getFamily("component")).toThrow(/digest mismatch/u);
  });

  it("keeps build artifacts out of runtime prefetch but fails build validation when one is missing", async () => {
    const directory = await createCatalogCopy({ includeBuildArtifacts: true });
    const manifest = await readManifest(directory);
    const buildEntry = manifest.build_artifacts[0];
    if (!buildEntry) {
      throw new Error("Fixture manifest has no build artifact.");
    }
    await fs.rm(path.join(directory, ...buildEntry.file.split("/")));

    const store = new CatalogStoreV2({ registryDir: directory });
    expect(() => store.prefetch()).not.toThrow();
    expect(() => store.validateBuildArtifacts()).toThrow(
      /ENOENT|no such file|cannot find/u,
    );
  });

  it("rejects byte corruption in a manifest-bound build artifact", async () => {
    const directory = await createCatalogCopy({ includeBuildArtifacts: true });
    const manifest = await readManifest(directory);
    const buildEntry = manifest.build_artifacts[0];
    if (!buildEntry) {
      throw new Error("Fixture manifest has no build artifact.");
    }
    await fs.appendFile(
      path.join(directory, ...buildEntry.file.split("/")),
      "\ncorrupt",
    );

    const store = new CatalogStoreV2({ registryDir: directory });
    expect(() => store.validateBuildArtifacts()).toThrow(/digest mismatch/u);
  });

  it.each([
    {
      label: "wrong-family envelope",
      mutate: (envelope: MutableArtifactEnvelope) => {
        envelope.family = "component";
      },
      expected: /declares family 'component', expected 'build_audit'/u,
    },
    {
      label: "malformed record",
      mutate: (envelope: MutableArtifactEnvelope) => {
        envelope.records = [
          {
            family: "build_audit",
            id: "build-audit.invalid",
            audit_kind: "future",
            summary: "Invalid audit kind",
            gating: true,
          },
        ];
      },
      expected: /audit_kind/u,
    },
    {
      label: "record-count mismatch",
      mutate: (envelope: MutableArtifactEnvelope) => {
        envelope.records = [
          {
            family: "build_audit",
            id: "build-audit.valid",
            audit_kind: "coverage",
            summary: "Valid record with unbound count",
            gating: true,
          },
        ];
      },
      rebindRecordCount: false,
      expected: /record count mismatch/u,
    },
    {
      label: "unsorted records",
      mutate: (envelope: MutableArtifactEnvelope) => {
        envelope.records = ["z", "a"].map((suffix) => ({
          family: "build_audit",
          id: `build-audit.${suffix}`,
          audit_kind: "coverage",
          summary: suffix,
          gating: true,
        }));
      },
      expected: /records are not sorted by id/u,
    },
    {
      label: "duplicate records",
      mutate: (envelope: MutableArtifactEnvelope) => {
        envelope.records = ["first", "second"].map((summary) => ({
          family: "build_audit",
          id: "build-audit.duplicate",
          audit_kind: "coverage",
          summary,
          gating: true,
        }));
      },
      expected: /contains duplicate id 'build-audit\.duplicate'/u,
    },
  ])("rejects a rebound build artifact with $label", async ({
    mutate,
    rebindRecordCount,
    expected,
  }) => {
    const directory = await createCatalogCopy({
      includeBuildArtifacts: true,
    });
    await replaceBuildArtifact(directory, mutate, { rebindRecordCount });
    const store = new CatalogStoreV2({ registryDir: directory });
    expect(() => store.validateBuildArtifacts()).toThrow(expected);
  });

  it.each([
    {
      label: "a missing required entry",
      mutate: (manifest: CatalogManifest) => {
        manifest.build_artifacts.splice(0);
      },
      expected: /missing build-only families/u,
    },
    {
      label: "a duplicate family",
      mutate: (manifest: CatalogManifest) => {
        const entry = manifest.build_artifacts[0];
        if (entry) manifest.build_artifacts.push({ ...entry });
      },
      expected: /duplicate build artifact family/u,
    },
    {
      label: "a descriptor-inconsistent file",
      mutate: (manifest: CatalogManifest) => {
        const entry = manifest.build_artifacts[0];
        if (entry) {
          (entry as unknown as { file: string }).file =
            "wrong-build-audit.json";
        }
      },
      expected: /build artifact metadata does not match descriptor/u,
    },
    {
      label: "a descriptor-inconsistent codec",
      mutate: (manifest: CatalogManifest) => {
        const entry = manifest.build_artifacts[0];
        if (entry) entry.codec = "salt.catalog.v2.wrong";
      },
      expected: /build artifact metadata does not match descriptor/u,
    },
    {
      label: "a descriptor-inconsistent canonical flag",
      mutate: (manifest: CatalogManifest) => {
        const entry = manifest.build_artifacts[0];
        if (entry) entry.canonical = true;
      },
      expected: /build artifact metadata does not match descriptor/u,
    },
    {
      label: "a file duplicated across runtime and build sections",
      mutate: (manifest: CatalogManifest) => {
        const buildEntry = manifest.build_artifacts[0];
        const runtimeEntry = manifest.artifacts[0];
        if (buildEntry && runtimeEntry) buildEntry.file = runtimeEntry.file;
      },
      expected: /contains duplicate file/u,
    },
  ])("rejects build-artifact manifest metadata with $label", async ({
    mutate,
    expected,
  }) => {
    const directory = await createCatalogCopy();
    const manifest = await readManifest(directory);
    mutate(manifest);
    await fs.writeFile(
      path.join(directory, SALT_CATALOG_MANIFEST_FILE),
      canonicalJsonFile(manifest),
      "utf8",
    );
    expect(() => new CatalogStoreV2({ registryDir: directory })).toThrow(
      expected,
    );
  });

  it("rejects malformed tuples even when the attacker rebinds the artifact digest", async () => {
    const directory = await createCatalogCopy();
    await replaceArtifact(directory, "token_declaration", (envelope) => {
      envelope.records[0] = (envelope.records[0] as unknown[]).slice(0, -1);
    });
    const store = new CatalogStoreV2({ registryDir: directory });
    expect(() => store.getFamily("token_declaration")).toThrow(
      /invalid token_declaration storage tuple/u,
    );
  });

  it("rejects duplicate and gapped example ordinals after digest rebinding", async () => {
    const registryDirectory = await createCatalogCopy();
    await replaceArtifact(registryDirectory, "evidence", (envelope) => {
      const examples = envelope.records
        .map(asExampleEvidence)
        .filter((record): record is MutableExampleEvidence => record !== null);
      const first = examples[0];
      const second = examples[1];
      if (!first || !second) {
        throw new Error("Fixture has fewer than two examples.");
      }
      const firstOrdinals = exampleOrdinalCarrier(first);
      const secondOrdinals = exampleOrdinalCarrier(second);
      if (!firstOrdinals || !secondOrdinals) {
        throw new Error("Fixture example has no ordinal carrier.");
      }
      secondOrdinals.registry_ordinal = firstOrdinals.registry_ordinal;
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: registryDirectory,
      }).validateCrossReferences(),
    ).toThrow(/registry ordinals .* unique and contiguous/u);

    const ownerDirectory = await createCatalogCopy();
    await replaceArtifact(ownerDirectory, "evidence", (envelope) => {
      const byOwner = new Map<string, MutableExampleEvidence[]>();
      for (const record of envelope.records) {
        const evidence = asExampleEvidence(record);
        const ownerKey = evidence ? evidenceOwnerKey(evidence) : null;
        if (!evidence || !ownerKey) continue;
        const entries = byOwner.get(ownerKey) ?? [];
        entries.push(evidence);
        byOwner.set(ownerKey, entries);
      }
      const ownerExamples = [...byOwner.values()].find(
        (entries) => entries.length >= 2,
      );
      const first = ownerExamples?.[0];
      const second = ownerExamples?.[1];
      if (!first || !second) {
        throw new Error("Fixture has no owner with multiple examples.");
      }
      const firstOrdinals = exampleOrdinalCarrier(first);
      const secondOrdinals = exampleOrdinalCarrier(second);
      if (!firstOrdinals || !secondOrdinals) {
        throw new Error("Fixture example has no ordinal carrier.");
      }
      secondOrdinals.owner_ordinal = firstOrdinals.owner_ordinal;
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: ownerDirectory,
      }).validateCrossReferences(),
    ).toThrow(/owner ordinals .* unique and contiguous/u);

    const pageOwnerDirectory = await createCatalogCopy();
    await replaceArtifact(pageOwnerDirectory, "evidence", (envelope) => {
      const byOwner = new Map<string, MutableExampleEvidence[]>();
      for (const record of envelope.records) {
        const evidence = asExampleEvidence(record);
        const ownerKey = evidence ? evidenceOwnerKey(evidence) : null;
        if (!evidence || !ownerKey?.startsWith("page:")) continue;
        const entries = byOwner.get(ownerKey) ?? [];
        entries.push(evidence);
        byOwner.set(ownerKey, entries);
      }
      const solePageExample = [...byOwner.values()].find(
        (entries) => entries.length === 1,
      )?.[0];
      const ordinals = solePageExample
        ? exampleOrdinalCarrier(solePageExample)
        : null;
      if (!ordinals) {
        throw new Error("Fixture has no page owner with exactly one example.");
      }
      ordinals.owner_ordinal = 1;
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: pageOwnerDirectory,
      }).validateCrossReferences(),
    ).toThrow(/owner ordinals .* unique and contiguous/u);
  }, 120_000);

  it(
    "rejects gapped accessibility-claim ordinals after digest rebinding",
    async () => {
      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "accessibility_claim", (envelope) => {
        const claims = decodeArtifactRecords(
          "accessibility_claim",
          envelope.records,
        );
        const first = claims[0];
        if (!first) {
          throw new Error("Fixture has no accessibility claims.");
        }
        first.ordinal += 1;
        envelope.records = encodeArtifactRecords("accessibility_claim", claims);
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(/accessibility claims .* unique and contiguous/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects API-symbol and deprecation-kind identity tampering after digest rebinding",
    async () => {
      const symbolDirectory = await createCatalogCopy();
      await replaceArtifact(symbolDirectory, "api_symbol", (envelope) => {
        const symbols = decodeArtifactRecords("api_symbol", envelope.records);
        const symbol = symbols[0];
        if (!symbol) throw new Error("Fixture has no API symbols.");
        symbol.export_name = `${symbol.export_name}Changed`;
        envelope.records = encodeArtifactRecords("api_symbol", symbols);
      });
      expect(() =>
        new CatalogStoreV2({
          registryDir: symbolDirectory,
        }).validateCrossReferences(),
      ).toThrow(/id does not match its stable public-API identity/u);

      const kindDirectory = await createCatalogCopy();
      await replaceArtifact(kindDirectory, "deprecation", (envelope) => {
        const deprecations = decodeArtifactRecords(
          "deprecation",
          envelope.records,
        );
        const deprecation = deprecations.find(
          (candidate) => candidate.kind === "prop",
        );
        if (!deprecation) throw new Error("Fixture has no prop deprecation.");
        deprecation.kind = "component";
        envelope.records = encodeArtifactRecords("deprecation", deprecations);
      });
      expect(() =>
        new CatalogStoreV2({
          registryDir: kindDirectory,
        }).validateCrossReferences(),
      ).toThrow(/kind does not match its stable public-API subject/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects same-package cross-source component-reference rebinding after digest rebinding",
    async () => {
      const sourceStore = new CatalogStoreV2({
        registryDir: generatedDirectory,
      });
      const originalComponent = sourceStore
        .getFamily("component")
        .find((candidate) => candidate.name === "Button");
      if (!originalComponent) {
        throw new Error("Fixture has no Button component.");
      }
      const deprecation = sourceStore
        .getFamily("deprecation")
        .find(
          (candidate) =>
            candidate.name === "variant" &&
            candidate.component_ref?.id === originalComponent.id,
        );
      if (!deprecation?.component_ref) {
        throw new Error("Fixture has no Button.variant deprecation.");
      }
      const replacementComponent = sourceStore
        .getFamily("component")
        .find(
          (candidate) =>
            candidate.name === "Dialog" &&
            candidate.id !== originalComponent.id &&
            canonicalJson(candidate.package_ref) ===
              canonicalJson(originalComponent.package_ref),
        );
      if (!replacementComponent) {
        throw new Error("Fixture has no same-package Dialog component.");
      }

      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "deprecation", (envelope) => {
        const deprecations = decodeArtifactRecords(
          "deprecation",
          envelope.records,
        );
        const rebound = deprecations.find(
          (candidate) => candidate.id === deprecation.id,
        );
        if (!rebound) throw new Error("Fixture deprecation disappeared.");
        rebound.component_ref = {
          family: "component",
          id: replacementComponent.id,
        };
        envelope.records = encodeArtifactRecords("deprecation", deprecations);
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(
        /member component reference does not share the component source root/u,
      );
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects component-reference removal that diverges from component detail",
    async () => {
      const sourceStore = new CatalogStoreV2({
        registryDir: generatedDirectory,
      });
      const button = sourceStore
        .getFamily("component")
        .find((candidate) => candidate.name === "Button");
      if (!button) {
        throw new Error("Fixture has no Button component.");
      }
      const deprecation = sourceStore
        .getFamily("deprecation")
        .find(
          (candidate) =>
            candidate.name === "variant" &&
            candidate.component_ref?.id === button.id,
        );
      if (!deprecation) {
        throw new Error("Fixture has no Button.variant deprecation.");
      }

      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "deprecation", (envelope) => {
        const deprecations = decodeArtifactRecords(
          "deprecation",
          envelope.records,
        );
        const rebound = deprecations.find(
          (candidate) => candidate.id === deprecation.id,
        );
        if (!rebound) throw new Error("Fixture deprecation disappeared.");
        rebound.component_ref = null;
        envelope.records = encodeArtifactRecords("deprecation", deprecations);
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(
        /detail deprecations do not exactly match deprecation component references/u,
      );
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects value-map owner rebinding after content and digest rebinding",
    async () => {
      const directory = await createCatalogCopy();
      await rebindDeprecationValueMapTargetOwner(directory);

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(
        /value map targets must belong to the deprecated property's public API owner/u,
      );
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects multi-segment public member identities after digest rebinding",
    async () => {
      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "api_symbol", (envelope) => {
        const tuple = envelope.records.find((record): record is unknown[] =>
          Array.isArray(record),
        );
        if (!tuple) throw new Error("Fixture has no API-symbol tuple.");
        tuple[5] = [
          { kind: "prop", name: "nested" },
          { kind: "method", name: "legacy" },
        ];
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(/member_path|at most 1|too_big/iu);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects public member kinds that contradict their symbol space",
    async () => {
      for (const mutation of [
        {
          symbolSpace: "value",
          member: { kind: "prop", name: "legacy" },
          error: /type-bearing owner symbol space/u,
        },
        {
          symbolSpace: "type",
          member: { kind: "static_method", name: "legacy" },
          error: /type-and-value owner symbol space/u,
        },
      ] as const) {
        const directory = await createCatalogCopy();
        await replaceArtifact(directory, "api_symbol", (envelope) => {
          const tuple = envelope.records.find((record): record is unknown[] =>
            Array.isArray(record),
          );
          if (!tuple) throw new Error("Fixture has no API-symbol tuple.");
          tuple[4] = mutation.symbolSpace;
          tuple[5] = [mutation.member];
        });

        expect(() =>
          new CatalogStoreV2({
            registryDir: directory,
          }).validateCrossReferences(),
        ).toThrow(mutation.error);
      }
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects structural assertions bound to the wrong overview source",
    async () => {
      const sourceStore = new CatalogStoreV2({
        registryDir: generatedDirectory,
      });
      const assertion = sourceStore
        .getFamily("evidence")
        .find(
          (evidence) =>
            evidence.evidence_kind === "source_assertion" &&
            evidence.assertion_kind === "structural_relation",
        );
      if (
        !assertion ||
        assertion.evidence_kind !== "source_assertion" ||
        assertion.assertion_kind !== "structural_relation"
      ) {
        throw new Error("Fixture has no structural assertion.");
      }
      const wrongSource = sourceStore
        .getFamily("source")
        .find(
          (source) =>
            source.source_kind === "repository_file" &&
            !assertion.source_refs.some(
              (reference) => reference.id === source.id,
            ),
        );
      if (!wrongSource) {
        throw new Error("Fixture has no alternative repository source.");
      }

      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "evidence", (envelope) => {
        const evidence = decodeArtifactRecords("evidence", envelope.records);
        const target = evidence.find(
          (candidate) => candidate.id === assertion.id,
        );
        if (
          !target ||
          target.evidence_kind !== "source_assertion" ||
          target.assertion_kind !== "structural_relation"
        ) {
          throw new Error("Fixture structural assertion disappeared.");
        }
        target.source_refs = [{ family: "source", id: wrongSource.id }];
        envelope.records = encodeArtifactRecords("evidence", evidence);
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(/does not bind its owner's overview source/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "requires structural overview details to match their published overview evidence",
    async () => {
      const sourceStore = new CatalogStoreV2({
        registryDir: generatedDirectory,
      });
      const overview = sourceStore
        .getFamily("evidence")
        .find(
          (evidence) =>
            evidence.evidence_kind === "documentation_link" &&
            evidence.owner !== null &&
            (evidence.owner.family === "component" ||
              evidence.owner.family === "pattern" ||
              evidence.owner.family === "guide") &&
            evidence.label === "overview" &&
            sourceStore
              .getFamily("relation")
              .some(
                (relation) =>
                  (relation.relation_kind === "composes" ||
                    relation.relation_kind === "related_to" ||
                    relation.relation_kind === "documents") &&
                  relation.source.family === evidence.owner?.family &&
                  relation.source.id === evidence.owner.id,
              ),
        );
      if (!overview) {
        throw new Error(
          "Fixture has no structural owner with published overview evidence.",
        );
      }
      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "evidence", (envelope) => {
        const evidence = decodeArtifactRecords("evidence", envelope.records);
        envelope.records = encodeArtifactRecords(
          "evidence",
          evidence.filter((candidate) => candidate.id !== overview.id),
        );
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(
        /overview detail does not exactly match its published overview evidence/u,
      );
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects one structural assertion consumed by two relations",
    async () => {
      const sourceStore = new CatalogStoreV2({
        registryDir: generatedDirectory,
      });
      const relation = sourceStore
        .getFamily("relation")
        .find(
          (candidate) =>
            candidate.relation_kind === "composes" ||
            candidate.relation_kind === "related_to" ||
            candidate.relation_kind === "documents",
        );
      if (!relation) throw new Error("Fixture has no structural relation.");

      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "relation", (envelope) => {
        const relations = decodeArtifactRecords("relation", envelope.records);
        const duplicate = structuredClone(relation);
        duplicate.id = `${duplicate.id}.duplicate-consumer`;
        relations.push(duplicate);
        relations.sort(compareCatalogIds);
        envelope.records = encodeArtifactRecords("relation", relations);
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(/must be consumed by exactly its one relation/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "enforces guide fact parity while keeping component and package ordinals field-local",
    async () => {
      const sourceStore = new CatalogStoreV2({
        registryDir: generatedDirectory,
      });
      const guide = sourceStore
        .getFamily("guide")
        .find(
          (candidate) =>
            candidate.documented_entity_refs.length > 0 &&
            candidate.package_refs.length > 0,
        );
      if (!guide) {
        throw new Error(
          "Fixture has no guide with both documented entities and packages.",
        );
      }
      const guideRelations = sourceStore
        .getFamily("relation")
        .filter(
          (relation) =>
            relation.relation_kind === "documents" &&
            relation.source.family === "guide" &&
            relation.source.id === guide.id,
        );
      const entityOrdinals = guideRelations
        .filter((relation) => relation.target.family !== "package")
        .flatMap((relation) =>
          "source_ordinal" in relation ? [relation.source_ordinal] : [],
        )
        .sort((left, right) => left - right);
      const packageOrdinals = guideRelations
        .filter((relation) => relation.target.family === "package")
        .flatMap((relation) =>
          "source_ordinal" in relation ? [relation.source_ordinal] : [],
        )
        .sort((left, right) => left - right);
      expect(entityOrdinals).toEqual(entityOrdinals.map((_, index) => index));
      expect(packageOrdinals).toEqual(packageOrdinals.map((_, index) => index));
      expect(entityOrdinals[0]).toBe(0);
      expect(packageOrdinals[0]).toBe(0);

      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "guide", (envelope) => {
        const guides = decodeArtifactRecords("guide", envelope.records);
        const target = guides.find((candidate) => candidate.id === guide.id);
        if (!target) throw new Error("Fixture guide disappeared.");
        target.documented_entity_refs = target.documented_entity_refs.slice(1);
        envelope.records = encodeArtifactRecords("guide", guides);
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(
        /component and pattern facts do not exactly match document relations/u,
      );

      const packageDirectory = await createCatalogCopy();
      await replaceArtifact(packageDirectory, "guide", (envelope) => {
        const guides = decodeArtifactRecords("guide", envelope.records);
        const target = guides.find((candidate) => candidate.id === guide.id);
        if (!target) throw new Error("Fixture guide disappeared.");
        target.package_refs = target.package_refs.slice(1);
        envelope.records = encodeArtifactRecords("guide", guides);
      });
      expect(() =>
        new CatalogStoreV2({
          registryDir: packageDirectory,
        }).validateCrossReferences(),
      ).toThrow(
        /package facts do not exactly match package document relations/u,
      );
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it.each(["composes", "related_to", "documents"] as const)(
    "rejects gapped %s relation ordinals after digest rebinding",
    async (relationKind) => {
      const directory = await createCatalogCopy();
      await rebindStructuralRelationOrdinal(directory, relationKind);

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(/ordered relations .* unique and contiguous/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it("rejects accessibility prose rebound away from its exact owner documentation", async () => {
    const sourceStore = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const proseClaims = sourceStore
      .getFamily("accessibility_claim")
      .filter(
        (claim) =>
          claim.source_field === "accessibility.summary" ||
          claim.source_field === "accessibility.rules",
      );
    const originalClaim = proseClaims.find(
      (claim) => claim.owner.family === "component",
    );
    if (!originalClaim || originalClaim.owner.family !== "component") {
      throw new Error("Fixture has no component accessibility prose.");
    }
    const owner = sourceStore.getRecord(
      originalClaim.owner.family,
      originalClaim.owner.id,
    );
    if (!owner) throw new Error("Fixture accessibility owner disappeared.");
    const ownerDetail = sourceStore.getContentJson(
      owner.detail_content_ref,
    ) as {
      related_docs: { accessibility: string | null };
    };
    const ownerPage = sourceStore
      .getFamily("page")
      .find((page) => page.route === ownerDetail.related_docs.accessibility);
    if (!ownerPage) {
      throw new Error("Fixture accessibility documentation page disappeared.");
    }
    const normalizeDocumentationText = (value: string): string =>
      value
        .normalize("NFC")
        .replace(/`([^`]+)`/gu, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
        .replace(/<[^>]+>/gu, " ")
        .replace(/[*_~]+/gu, "")
        .replace(/^\s*[-*]\s+/gmu, "")
        .replace(/^\s*\d+\.\s+/gmu, "")
        .replace(/\s+/gu, " ")
        .trim();
    const ownerPageText = normalizeDocumentationText(
      sourceStore.getContentJson(ownerPage.body_content_ref).join("\n"),
    );
    const unrelatedClaim = proseClaims.find(
      (claim) =>
        (claim.owner.family !== originalClaim.owner.family ||
          claim.owner.id !== originalClaim.owner.id) &&
        !ownerPageText.includes(
          normalizeDocumentationText(
            sourceStore.getContentText(claim.statement_content_ref),
          ),
        ),
    );
    if (!unrelatedClaim) {
      throw new Error("Fixture has no unrelated accessibility prose.");
    }

    const statementDirectory = await createCatalogCopy();
    await replaceArtifact(
      statementDirectory,
      "accessibility_claim",
      (envelope) => {
        const claims = decodeArtifactRecords(
          "accessibility_claim",
          envelope.records,
        );
        const claim = claims.find(
          (candidate) => candidate.id === originalClaim.id,
        );
        if (!claim) throw new Error("Fixture claim disappeared.");
        claim.statement_content_ref = structuredClone(
          unrelatedClaim.statement_content_ref,
        );
        envelope.records = encodeArtifactRecords("accessibility_claim", claims);
      },
    );
    expect(() =>
      new CatalogStoreV2({
        registryDir: statementDirectory,
      }).validateCrossReferences(),
    ).toThrow(
      /statement .* does not occur in its exact owner documentation page/u,
    );

    const sourceDirectory = await createCatalogCopy();
    await replaceArtifact(
      sourceDirectory,
      "accessibility_claim",
      (envelope) => {
        const claims = decodeArtifactRecords(
          "accessibility_claim",
          envelope.records,
        );
        const claim = claims.find(
          (candidate) => candidate.id === originalClaim.id,
        );
        if (!claim) throw new Error("Fixture claim disappeared.");
        claim.provenance = structuredClone(unrelatedClaim.provenance);
        envelope.records = encodeArtifactRecords("accessibility_claim", claims);
      },
    );
    expect(() =>
      new CatalogStoreV2({
        registryDir: sourceDirectory,
      }).validateCrossReferences(),
    ).toThrow(/must bind its exact owner page/u);

    const classificationDirectory = await createCatalogCopy();
    await replaceArtifact(
      classificationDirectory,
      "accessibility_claim",
      (envelope) => {
        const claims = decodeArtifactRecords(
          "accessibility_claim",
          envelope.records,
        );
        const claim = claims.find(
          (candidate) => candidate.id === originalClaim.id,
        );
        if (!claim) throw new Error("Fixture claim disappeared.");
        (claim as { classification: "fact" | "guidance" }).classification =
          "fact";
        envelope.records = encodeArtifactRecords("accessibility_claim", claims);
      },
    );
    expect(() =>
      new CatalogStoreV2({
        registryDir: classificationDirectory,
      }).validateCrossReferences(),
    ).toThrow(
      /documentation prose must remain descriptive accessibility guidance/u,
    );
  }, 120_000);

  it("enforces a one-to-one accessibility implementation assertion binding", async () => {
    const sourceStore = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const implementationClaims = sourceStore
      .getFamily("accessibility_claim")
      .filter(
        (claim) =>
          claim.source_field === "accessibility.implementation_signals",
      );
    const accessibilityAssertions = sourceStore
      .getFamily("evidence")
      .filter(
        (evidence) =>
          evidence.evidence_kind === "source_assertion" &&
          evidence.assertion_kind === "accessibility_implementation_signal",
      );
    const tokenAssertion = sourceStore
      .getFamily("evidence")
      .find(
        (evidence) =>
          evidence.evidence_kind === "source_assertion" &&
          evidence.assertion_kind === "token_policy",
      );
    const firstClaim = implementationClaims[0];
    const firstAccessibilityAssertion = accessibilityAssertions[0];
    if (
      !firstClaim ||
      !firstAccessibilityAssertion ||
      accessibilityAssertions.length < 2 ||
      !tokenAssertion
    ) {
      throw new Error(
        "Fixture lacks representative accessibility and token assertions.",
      );
    }
    const wrongOwnerAssertion = accessibilityAssertions.find(
      (assertion) =>
        assertion.owner.family !== firstClaim.owner.family ||
        assertion.owner.id !== firstClaim.owner.id,
    );
    if (!wrongOwnerAssertion) {
      throw new Error(
        "Fixture lacks an accessibility assertion for a different owner.",
      );
    }

    const wrongOwnerDirectory = await createCatalogCopy();
    await replaceArtifact(
      wrongOwnerDirectory,
      "accessibility_claim",
      (envelope) => {
        const claims = decodeArtifactRecords(
          "accessibility_claim",
          envelope.records,
        );
        const claim = claims.find(
          (candidate) => candidate.id === firstClaim.id,
        );
        if (!claim) throw new Error("Fixture claim disappeared.");
        const provenance = claim.provenance[0];
        if (!provenance) throw new Error("Fixture claim has no provenance.");
        provenance.reference = {
          family: "evidence",
          id: wrongOwnerAssertion.id,
        };
        envelope.records = encodeArtifactRecords("accessibility_claim", claims);
      },
    );
    expect(() =>
      new CatalogStoreV2({
        registryDir: wrongOwnerDirectory,
      }).validateCrossReferences(),
    ).toThrow(/assertion owner does not match its claim owner/u);

    const wrongSubtypeDirectory = await createCatalogCopy();
    await replaceArtifact(
      wrongSubtypeDirectory,
      "accessibility_claim",
      (envelope) => {
        const claims = decodeArtifactRecords(
          "accessibility_claim",
          envelope.records,
        );
        const claim = claims.find(
          (candidate) => candidate.id === firstClaim.id,
        );
        if (!claim) throw new Error("Fixture claim disappeared.");
        const provenance = claim.provenance[0];
        if (!provenance) throw new Error("Fixture claim has no provenance.");
        provenance.reference = {
          family: "evidence",
          id: tokenAssertion.id,
        };
        envelope.records = encodeArtifactRecords("accessibility_claim", claims);
      },
    );
    expect(() =>
      new CatalogStoreV2({
        registryDir: wrongSubtypeDirectory,
      }).validateCrossReferences(),
    ).toThrow(/must bind an accessibility implementation assertion/u);

    const extraSupportDirectory = await createCatalogCopy();
    await replaceArtifact(
      extraSupportDirectory,
      "accessibility_claim",
      (envelope) => {
        const claims = decodeArtifactRecords(
          "accessibility_claim",
          envelope.records,
        );
        const claim = claims.find(
          (candidate) => candidate.id === firstClaim.id,
        );
        if (!claim) throw new Error("Fixture claim disappeared.");
        const provenance = claim.provenance[0];
        if (!provenance) throw new Error("Fixture claim has no provenance.");
        provenance.supports = ["statement", "classification", "severity"];
        envelope.records = encodeArtifactRecords("accessibility_claim", claims);
      },
    );
    expect(() =>
      new CatalogStoreV2({
        registryDir: extraSupportDirectory,
      }).validateCrossReferences(),
    ).toThrow(
      /must bind one source and support its statement and classification/u,
    );

    const claimsByOwner = new Map<
      string,
      CatalogRecordForFamily<"accessibility_claim">[]
    >();
    for (const claim of implementationClaims) {
      const key = `${claim.owner.family}:${claim.owner.id}`;
      const claims = claimsByOwner.get(key) ?? [];
      claims.push(claim);
      claimsByOwner.set(key, claims);
    }
    const duplicatePair = [...claimsByOwner.values()].find(
      (claims) => claims.length >= 2,
    );
    const originalClaim = duplicatePair?.[0];
    const reboundClaim = duplicatePair?.[1];
    if (!originalClaim || !reboundClaim) {
      throw new Error("Fixture lacks two implementation claims for one owner.");
    }
    const duplicateBindingDirectory = await createCatalogCopy();
    await replaceArtifact(
      duplicateBindingDirectory,
      "accessibility_claim",
      (envelope) => {
        const claims = decodeArtifactRecords(
          "accessibility_claim",
          envelope.records,
        );
        const target = claims.find((claim) => claim.id === reboundClaim.id);
        if (!target) throw new Error("Fixture claim disappeared.");
        target.statement_content_ref = structuredClone(
          originalClaim.statement_content_ref,
        );
        target.provenance = structuredClone(originalClaim.provenance);
        envelope.records = encodeArtifactRecords("accessibility_claim", claims);
      },
    );
    expect(() =>
      new CatalogStoreV2({
        registryDir: duplicateBindingDirectory,
      }).validateCrossReferences(),
    ).toThrow(/bound to more than one claim/u);

    const unboundAssertionDirectory = await createCatalogCopy();
    await replaceArtifact(unboundAssertionDirectory, "evidence", (envelope) => {
      const evidence = decodeArtifactRecords("evidence", envelope.records);
      const clone = structuredClone(firstAccessibilityAssertion);
      clone.id = `${clone.id}.unbound`;
      evidence.push(clone);
      evidence.sort(compareCatalogIds);
      envelope.records = encodeArtifactRecords("evidence", evidence);
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: unboundAssertionDirectory,
      }).validateCrossReferences(),
    ).toThrow(/assertions are not bound to exactly one claim/u);
  }, 120_000);

  it("rejects policy profiles used in the wrong catalog role", async () => {
    const sourceStore = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const profileId = (
      kind: CatalogRecordForFamily<"policy_profile">["policy_kind"],
    ): string => {
      const profile = sourceStore
        .getFamily("policy_profile")
        .find((candidate) => candidate.policy_kind === kind);
      if (!profile) {
        throw new Error(`Fixture has no ${kind} policy profile.`);
      }
      return profile.id;
    };
    const tokenUsageId = profileId("token_usage");
    const componentUsageId = profileId("component_usage");

    const componentDirectory = await createCatalogCopy();
    await replaceArtifact(componentDirectory, "component", (envelope) => {
      const records = decodeArtifactRecords("component", envelope.records);
      const record = records.find(
        (candidate) => candidate.policy_profile_ref !== null,
      );
      if (!record) throw new Error("Fixture has no component policy profile.");
      record.policy_profile_ref = {
        family: "policy_profile",
        id: tokenUsageId,
      };
      envelope.records = encodeArtifactRecords("component", records);
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: componentDirectory,
      }).validateCrossReferences(),
    ).toThrow(/cannot use 'token_usage' policy profile .*component_usage/u);

    const patternDirectory = await createCatalogCopy();
    await replaceArtifact(patternDirectory, "pattern", (envelope) => {
      const records = decodeArtifactRecords("pattern", envelope.records);
      const record = records[0];
      if (!record) throw new Error("Fixture has no pattern.");
      record.policy_profile_ref = {
        family: "policy_profile",
        id: componentUsageId,
      };
      envelope.records = encodeArtifactRecords("pattern", records);
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: patternDirectory,
      }).validateCrossReferences(),
    ).toThrow(/cannot use 'component_usage' policy profile .*pattern_usage/u);

    const tokenPolicyDirectory = await createCatalogCopy();
    await replaceArtifact(tokenPolicyDirectory, "token", (envelope) => {
      const records = decodeArtifactRecords("token", envelope.records);
      const record = records.find(
        (candidate) => candidate.policy_profile_ref !== null,
      );
      if (!record) throw new Error("Fixture has no token policy profile.");
      record.policy_profile_ref = {
        family: "policy_profile",
        id: componentUsageId,
      };
      envelope.records = encodeArtifactRecords("token", records);
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: tokenPolicyDirectory,
      }).validateCrossReferences(),
    ).toThrow(
      /cannot use 'component_usage' policy profile .*token_usage or token_gap/u,
    );

    const tokenEvidenceDirectory = await createCatalogCopy();
    await replaceArtifact(tokenEvidenceDirectory, "token", (envelope) => {
      const records = decodeArtifactRecords("token", envelope.records);
      const record = records.find(
        (candidate) => candidate.evidence_profile_ref !== null,
      );
      if (!record) throw new Error("Fixture has no token evidence profile.");
      record.evidence_profile_ref = {
        family: "policy_profile",
        id: tokenUsageId,
      };
      envelope.records = encodeArtifactRecords("token", records);
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: tokenEvidenceDirectory,
      }).validateCrossReferences(),
    ).toThrow(/cannot use 'token_usage' policy profile .*token_evidence/u);
  }, 60_000);

  it(
    "rejects code-bearing linked evidence after digest rebinding",
    async () => {
      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "evidence", (envelope) => {
        const evidence = envelope.records.find((record) => {
          const candidate = record as { evidence_kind?: unknown };
          return (
            candidate?.evidence_kind === "external_demo" ||
            candidate?.evidence_kind === "design_reference" ||
            candidate?.evidence_kind === "documentation_link"
          );
        }) as Record<string, unknown> | undefined;
        if (!evidence) {
          throw new Error("Fixture has no linked evidence.");
        }
        evidence.code_content_id = `sha256:${"a".repeat(64)}`;
      });
      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).getFamily("evidence"),
      ).toThrow(/code_content_id|unrecognized key/iu);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it("rejects record-count and byte-count corruption after digest rebinding", async () => {
    const countDirectory = await createCatalogCopy();
    await replaceArtifact(
      countDirectory,
      "token",
      (envelope) => {
        envelope.records.pop();
      },
      { rebindRecordCount: false },
    );
    expect(() =>
      new CatalogStoreV2({
        registryDir: countDirectory,
      }).getFamily("token"),
    ).toThrow(/record count mismatch/u);

    const byteDirectory = await createCatalogCopy();
    const manifest = await readManifest(byteDirectory);
    const tokenEntry = manifest.artifacts.find(
      (entry) => entry.family === "token",
    );
    if (!tokenEntry) throw new Error("Fixture has no token artifact.");
    tokenEntry.bytes += 1;
    manifest.semantic_digest = recomputeManifestSemanticDigest(manifest);
    await writeManifest(byteDirectory, manifest, {
      rebindGeneration: true,
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: byteDirectory,
      }).getFamily("token"),
    ).toThrow(/digest mismatch/u);
  });

  it("rejects independently forged inventory and semantic manifest digests", async () => {
    const inventoryDirectory = await createCatalogCopy();
    const inventoryManifest = await readManifest(inventoryDirectory);
    inventoryManifest.input_inventory_digest = `sha256:${"0".repeat(64)}`;
    await writeManifest(inventoryDirectory, inventoryManifest);
    expect(
      () => new CatalogStoreV2({ registryDir: inventoryDirectory }),
    ).toThrow(/input inventory digest mismatch/u);

    const semanticDirectory = await createCatalogCopy();
    const semanticManifest = await readManifest(semanticDirectory);
    semanticManifest.semantic_digest = `sha256:${"0".repeat(64)}`;
    await writeManifest(semanticDirectory, semanticManifest);
    expect(
      () => new CatalogStoreV2({ registryDir: semanticDirectory }),
    ).toThrow(/semantic digest mismatch/u);
  });

  it("binds published generation paths to the full canonical generation manifest", async () => {
    const manifestOnlyDirectory = await createCatalogCopy();
    const manifestOnly = await readManifest(manifestOnlyDirectory);
    manifestOnly.source_revision = `${manifestOnly.source_revision}-forged`;
    await fs.writeFile(
      path.join(manifestOnlyDirectory, SALT_CATALOG_MANIFEST_FILE),
      canonicalJsonFile(manifestOnly),
      "utf8",
    );
    expect(
      () => new CatalogStoreV2({ registryDir: manifestOnlyDirectory }),
    ).toThrow(/generation path .* does not match its content digest/u);

    const relocatedDirectory = await createCatalogCopy();
    const relocatedManifest = await readManifest(relocatedDirectory);
    const firstArtifact = relocatedManifest.artifacts[0];
    if (!firstArtifact) throw new Error("Fixture manifest has no artifacts.");
    const originalGeneration = firstArtifact.file
      .split("/")
      .slice(0, 2)
      .join("/");
    const semanticGeneration = `catalog-generations/${relocatedManifest.semantic_digest.slice("sha256:".length)}`;
    const relocatedGeneration =
      semanticGeneration === originalGeneration
        ? `catalog-generations/${"0".repeat(64)}`
        : semanticGeneration;
    await fs.rename(
      path.join(relocatedDirectory, ...originalGeneration.split("/")),
      path.join(relocatedDirectory, ...relocatedGeneration.split("/")),
    );
    const rebindGeneration = (file: string): string =>
      file.startsWith(`${originalGeneration}/`)
        ? `${relocatedGeneration}/${file.slice(originalGeneration.length + 1)}`
        : file;
    for (const entry of relocatedManifest.artifacts) {
      entry.file = rebindGeneration(entry.file);
    }
    for (const entry of relocatedManifest.build_artifacts) {
      entry.file = rebindGeneration(entry.file);
    }
    for (const entry of relocatedManifest.support_artifacts) {
      entry.file = rebindGeneration(entry.file);
    }
    const publicationEntry = relocatedManifest.support_artifacts.find(
      (entry) => entry.kind === "package_inventory",
    );
    if (!publicationEntry) {
      throw new Error("Fixture manifest has no publication inventory.");
    }
    const publicationPath = path.join(
      relocatedDirectory,
      ...publicationEntry.file.split("/"),
    );
    const publication = catalogPublicationCodec.parse(
      JSON.parse(await fs.readFile(publicationPath, "utf8")),
    );
    publication.generation = relocatedGeneration;
    publication.files = publication.files.map(rebindGeneration);
    const publicationBytes = Buffer.from(
      canonicalJsonFile(publication),
      "utf8",
    );
    await fs.writeFile(publicationPath, publicationBytes);
    publicationEntry.sha256 = sha256Bytes(publicationBytes);
    publicationEntry.bytes = publicationBytes.byteLength;
    await fs.writeFile(
      path.join(relocatedDirectory, SALT_CATALOG_MANIFEST_FILE),
      canonicalJsonFile(relocatedManifest),
      "utf8",
    );

    expect(
      () => new CatalogStoreV2({ registryDir: relocatedDirectory }),
    ).toThrow(/generation path .* does not match its content digest/u);
  });

  it("rejects mutable-root and wrong-generation publication inventories", async () => {
    const mutableRootDirectory = await createCatalogCopy();
    const mutableRootManifest = await readManifest(mutableRootDirectory);
    const mutableRootEntry = mutableRootManifest.support_artifacts.find(
      (entry) => entry.kind === "package_inventory",
    );
    if (!mutableRootEntry) {
      throw new Error("Fixture manifest has no package inventory.");
    }
    mutableRootEntry.file = SALT_CATALOG_PACKAGE_FILES_FILE;
    await fs.writeFile(
      path.join(mutableRootDirectory, SALT_CATALOG_MANIFEST_FILE),
      canonicalJsonFile(mutableRootManifest),
      "utf8",
    );
    expect(
      () => new CatalogStoreV2({ registryDir: mutableRootDirectory }),
    ).toThrow(/support metadata does not match 'package_inventory'/u);

    const wrongGenerationDirectory = await createCatalogCopy();
    const wrongGenerationManifest = await readManifest(
      wrongGenerationDirectory,
    );
    const wrongGenerationEntry = wrongGenerationManifest.support_artifacts.find(
      (entry) => entry.kind === "package_inventory",
    );
    if (!wrongGenerationEntry) {
      throw new Error("Fixture manifest has no package inventory.");
    }
    const wrongGenerationPath = path.join(
      wrongGenerationDirectory,
      ...wrongGenerationEntry.file.split("/"),
    );
    const wrongGenerationInventory = catalogPublicationCodec.parse(
      JSON.parse(await fs.readFile(wrongGenerationPath, "utf8")),
    );
    wrongGenerationInventory.generation = `catalog-generations/${"0".repeat(64)}`;
    const wrongGenerationBytes = Buffer.from(
      canonicalJsonFile(wrongGenerationInventory),
      "utf8",
    );
    await fs.writeFile(wrongGenerationPath, wrongGenerationBytes);
    wrongGenerationEntry.sha256 = sha256Bytes(wrongGenerationBytes);
    wrongGenerationEntry.bytes = wrongGenerationBytes.byteLength;
    await fs.writeFile(
      path.join(wrongGenerationDirectory, SALT_CATALOG_MANIFEST_FILE),
      canonicalJsonFile(wrongGenerationManifest),
      "utf8",
    );

    const wrongGenerationStore = new CatalogStoreV2({
      registryDir: wrongGenerationDirectory,
    });
    expect(() => wrongGenerationStore.verifyPackageInventory()).toThrow(
      /does not match the active manifest generation/u,
    );
  });

  it("rejects portable-path violations in manifests and source records", async () => {
    const inputDirectory = await createCatalogCopy();
    const inputManifest = await readManifest(inputDirectory);
    const firstInput = inputManifest.inputs[0];
    if (!firstInput) throw new Error("Fixture manifest has no inputs.");
    firstInput.path = "packages/theme/../escape.css";
    await writeManifest(inputDirectory, inputManifest);
    expect(() => new CatalogStoreV2({ registryDir: inputDirectory })).toThrow(
      /repository-relative portable path/u,
    );

    const artifactDirectory = await createCatalogCopy();
    const artifactManifest = await readManifest(artifactDirectory);
    const artifact = artifactManifest.artifacts[0];
    if (!artifact) throw new Error("Fixture manifest has no artifacts.");
    artifact.file = "nested/../../escape.json";
    await writeManifest(artifactDirectory, artifactManifest);
    expect(
      () => new CatalogStoreV2({ registryDir: artifactDirectory }),
    ).toThrow(/repository-relative portable path/u);

    const sourceDirectory = await createCatalogCopy();
    await replaceArtifact(sourceDirectory, "source", (envelope) => {
      const source = envelope.records.find(
        (record) =>
          typeof record === "object" &&
          record !== null &&
          (record as { source_kind?: unknown }).source_kind ===
            "repository_file",
      ) as { locator?: string } | undefined;
      if (!source) throw new Error("Fixture has no file source.");
      source.locator = "packages/theme/../escape.css";
    });
    expect(() =>
      new CatalogStoreV2({
        registryDir: sourceDirectory,
      }).getFamily("source"),
    ).toThrow(/repository-relative portable path/u);
  });

  it("rejects catalog artifacts reached through linked directories", async () => {
    const directory = await createCatalogCopy();
    const manifest = await readManifest(directory);
    const artifact = manifest.artifacts[0];
    if (!artifact) throw new Error("Fixture manifest has no artifacts.");
    const publicationDirectory = path.dirname(
      path.join(directory, ...artifact.file.split("/")),
    );
    if (publicationDirectory === directory) {
      throw new Error("Fixture artifact is not in a publication directory.");
    }

    const externalRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-catalog-v2-linked-"),
    );
    temporaryDirectories.push(externalRoot);
    const externalDirectory = path.join(externalRoot, "publication");
    await fs.cp(publicationDirectory, externalDirectory, { recursive: true });
    await fs.rm(publicationDirectory, { recursive: true, force: true });
    await fs.symlink(
      externalDirectory,
      publicationDirectory,
      process.platform === "win32" ? "junction" : "dir",
    );

    expect(() =>
      new CatalogStoreV2({
        registryDir: directory,
      }).getFamily(artifact.family),
    ).toThrow(/linked segment|resolves outside/u);
  });

  it(
    "rejects content-object corruption even when the content-pack digest is rebound",
    async () => {
      const directory = await createCatalogCopy();
      const manifest = await readManifest(directory);
      const packEntry = manifest.support_artifacts.find(
        (entry) => entry.kind === "content_pack",
      );
      if (!packEntry) throw new Error("Fixture has no content pack.");
      const packPath = path.join(directory, packEntry.file);
      const bytes = await fs.readFile(packPath);
      const content = new CatalogStoreV2({
        registryDir: directory,
      })
        .getFamily("content")
        .find(
          (record) =>
            record.media_type === "text/typescript" && record.length > 0,
        );
      if (!content) {
        throw new Error("Fixture content pack has no TypeScript content.");
      }
      let mutated = false;
      for (
        let index = content.offset;
        index < content.offset + content.length;
        index += 1
      ) {
        const byte = bytes[index];
        if (
          byte !== undefined &&
          ((byte >= 0x41 && byte <= 0x5a) || (byte >= 0x61 && byte <= 0x7a))
        ) {
          bytes[index] = byte ^ 0x20;
          mutated = true;
          break;
        }
      }
      if (!mutated) {
        throw new Error(
          "Fixture TypeScript content has no mutable ASCII letter.",
        );
      }
      await fs.writeFile(packPath, bytes);
      packEntry.sha256 = sha256Bytes(bytes);
      packEntry.bytes = bytes.byteLength;
      manifest.semantic_digest = recomputeManifestSemanticDigest(manifest);
      await writeManifest(directory, manifest, { rebindGeneration: true });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(/content object digest mismatch/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects malformed content after every affected identity and digest is rebound",
    async () => {
      const directory = await createCatalogCopy();
      await rebindAccessibilitySignalContent(directory, (serialized) => {
        if (serialized.includes('"source_kind":"source"')) {
          return serialized.replace(
            '"source_kind":"source"',
            '"source_kind":"xource"',
          );
        }
        if (serialized.includes('"source_kind":"example"')) {
          return serialized.replace(
            '"source_kind":"example"',
            '"source_kind":"invalid"',
          );
        }
        throw new Error("Fixture accessibility signal has no source kind.");
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(/source_kind|Invalid option/u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "rejects schema-valid rebound content that contradicts its bound statement",
    async () => {
      const directory = await createCatalogCopy();
      await rebindAccessibilitySignalContent(directory, (serialized) => {
        const payload = JSON.parse(serialized) as {
          values: string[];
        };
        const value = payload.values[0];
        if (!value) {
          throw new Error("Fixture accessibility signal has no values.");
        }
        const index = value.search(/[A-Za-z]/u);
        if (index < 0) {
          throw new Error(
            "Fixture accessibility signal has no mutable letter.",
          );
        }
        const replacement = value[index] === "x" ? "y" : "x";
        payload.values[0] =
          value.slice(0, index) + replacement + value.slice(index + 1);
        return canonicalJson(payload);
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(
        /implementation statement does not match its assertion payload/u,
      );
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it("rejects duplicate primary keys after tuple decoding", async () => {
    const directory = await createCatalogCopy();
    await replaceArtifact(directory, "token", (envelope) => {
      const first = envelope.records[0] as unknown[];
      const second = [...(envelope.records[1] as unknown[])];
      second[0] = first[0];
      envelope.records[1] = second;
    });
    const store = new CatalogStoreV2({ registryDir: directory });
    expect(() => store.getFamily("token")).toThrow(/duplicate id/u);
  });

  it(
    "rejects unresolved typed references after all family codecs pass",
    async () => {
      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "token", (envelope) => {
        const tokens = decodeArtifactRecords("token", envelope.records);
        const first = tokens[0];
        if (!first) throw new Error("Fixture has no token record.");
        first.applies_to = [
          { family: "component", id: "component.does-not-exist" },
        ];
        envelope.records = encodeArtifactRecords("token", tokens);
      });
      const store = new CatalogStoreV2({ registryDir: directory });
      expect(() => store.validateCrossReferences()).toThrow(
        /unresolved component:component\.does-not-exist/u,
      );
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it(
    "resolves relation endpoint IDs only within their declared family",
    async () => {
      const packageId = new CatalogStoreV2({
        registryDir: generatedDirectory,
      }).getFamily("package")[0]?.id;
      if (!packageId) {
        throw new Error("Fixture has no package record.");
      }

      const directory = await createCatalogCopy();
      await replaceArtifact(directory, "relation", (envelope) => {
        const relations = decodeArtifactRecords("relation", envelope.records);
        const relation = relations.find(
          (candidate) => candidate.relation_kind === "related_to",
        );
        if (!relation || relation.target.family !== "pattern") {
          throw new Error("Fixture has no related_to relation.");
        }
        relation.target.id = packageId;
        envelope.records = encodeArtifactRecords("relation", relations);
      });

      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(/unresolved pattern:package\./u);
    },
    CATALOG_GRAPH_TEST_TIMEOUT_MS,
  );

  it("validates packed owner-qualified reference ids against their declared families", async () => {
    const mutations: Array<{
      family: CatalogFamilyName;
      mutate: (records: unknown[]) => void;
      error: RegExp;
    }> = [
      {
        family: "token_declaration",
        mutate: (records) => {
          const first = [...(records[0] as unknown[])];
          first[1] = "component.button";
          records[0] = first;
        },
        error: /unresolved token:component\.button/u,
      },
      {
        family: "token_declaration",
        mutate: (records) => {
          const first = [...(records[0] as unknown[])];
          first[5] = "context.does-not-exist";
          records[0] = first;
        },
        error: /unresolved declaration_context:context\.does-not-exist/u,
      },
      {
        family: "token_declaration",
        mutate: (records) => {
          const first = [...(records[0] as unknown[])];
          first[7] = "source.does-not-exist";
          records[0] = first;
        },
        error: /unresolved source:source\.does-not-exist/u,
      },
      {
        family: "token",
        mutate: (records) => {
          const tokens = decodeArtifactRecords("token", records);
          const first = tokens[0];
          if (!first) throw new Error("Fixture has no token record.");
          first.policy_profile_ref = {
            family: "policy_profile",
            id: "policy.does-not-exist",
          };
          records.splice(
            0,
            records.length,
            ...encodeArtifactRecords("token", tokens),
          );
        },
        error: /unresolved policy_profile:policy\.does-not-exist/u,
      },
      {
        family: "package",
        mutate: (records) => {
          const first = records[0] as {
            source_root_ref?: CatalogReference;
          };
          first.source_root_ref = {
            family: "source",
            id: "source.does-not-exist",
          };
        },
        error: /unresolved source:source\.does-not-exist/u,
      },
      {
        family: "relation",
        mutate: (records) => {
          const relations = decodeArtifactRecords("relation", records);
          const first = relations.find(
            (record) => record.relation_kind === "related_to",
          );
          if (!first) throw new Error("Fixture has no relation record.");
          first.source_evidence_refs = [
            { family: "evidence", id: "evidence.does-not-exist" },
          ];
          records.splice(
            0,
            records.length,
            ...encodeArtifactRecords("relation", relations),
          );
        },
        error: /unresolved evidence:evidence\.does-not-exist/u,
      },
    ];

    for (const mutation of mutations) {
      const directory = await createCatalogCopy();
      await replaceArtifact(directory, mutation.family, (envelope) => {
        mutation.mutate(envelope.records);
      });
      expect(() =>
        new CatalogStoreV2({
          registryDir: directory,
        }).validateCrossReferences(),
      ).toThrow(mutation.error);
    }
  }, 120_000);

  it("validates every packed record/content digest and reports exact hard budgets", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const metrics = store.validateCrossReferences();
    expect(metrics.familyRecordCounts.token).toBe(1_973);
    expect(metrics.familyRecordCounts.token_declaration).toBe(3_803);
    expect(metrics.searchArtifactBytes).toBeLessThanOrEqual(3_000_000);
    expect(metrics.tokenOwnedArtifactBytes).toBeLessThanOrEqual(2_352_829);
    const tokenSurface = measureTokenOwnedCatalogSurface(store);
    expect(tokenSurface.record_counts.token_facts).toBe(1_973);
    expect(tokenSurface.record_counts.token_search_projection).toBe(1_973);
    expect(tokenSurface.record_counts.structural_role_profiles).toBe(1);
    expect(tokenSurface.bytes.token_search_projection).toBeGreaterThan(0);
    expect(tokenSurface.bytes.total).toBe(metrics.tokenOwnedArtifactBytes);
    expect(tokenSurface.bytes.total).toBe(
      tokenSurface.bytes.token_facts +
        tokenSurface.bytes.token_declarations +
        tokenSurface.bytes.declaration_contexts +
        tokenSurface.bytes.declaration_sources +
        tokenSurface.bytes.policy_profiles +
        tokenSurface.bytes.policy_evidence +
        tokenSurface.bytes.token_relations +
        tokenSurface.bytes.token_search_projection +
        tokenSurface.bytes.content_index +
        tokenSurface.bytes.content_objects,
    );
    expect(1 - tokenSurface.bytes.total / 4_705_658).toBeGreaterThanOrEqual(
      0.5,
    );
  }, 120_000);
});

describe("source-to-packed token declaration oracle", () => {
  it("records UTF-8 byte ranges as exclusive offsets for multiline declarations", async () => {
    const sourceRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-range-"),
    );
    temporaryDirectories.push(sourceRoot);
    const cssDirectory = path.join(sourceRoot, "packages/theme/css");
    await fs.mkdir(cssDirectory, { recursive: true });
    const source =
      "/* café */\n.salt-theme {\n  --salt-fixture:\n    rgb(1, 2, 3);\n}\n";
    await Promise.all([
      fs.writeFile(path.join(cssDirectory, "theme.css"), source, "utf8"),
      fs.writeFile(
        path.join(cssDirectory, "theme-next.css"),
        "/* empty */\n",
        "utf8",
      ),
    ]);
    const inventory = await createCatalogInputInventory(sourceRoot, [
      "packages/theme/css/**/*.css",
    ]);
    const extraction = await withCatalogInputTracking(
      sourceRoot,
      inventory,
      () => extractTokenDeclarations(sourceRoot),
    );
    const declaration = extraction.declarations.get("--salt-fixture")?.[0];
    expect(declaration).toBeDefined();
    expect(declaration?.source_range).toEqual({
      start_offset: 28,
      end_offset: 61,
      start_line: 3,
      start_column: 3,
      end_line: 4,
      end_column: 18,
    });
    const bytes = Buffer.from(source, "utf8");
    expect(
      bytes
        .subarray(
          declaration?.source_range.start_offset,
          declaration?.source_range.end_offset,
        )
        .toString("utf8"),
    ).toBe("--salt-fixture:\n    rgb(1, 2, 3);");
  });

  it("does not follow external CSS source maps during extraction", async () => {
    const sourceRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-source-map-"),
    );
    temporaryDirectories.push(sourceRoot);
    const cssDirectory = path.join(sourceRoot, "packages/theme/css");
    await fs.mkdir(cssDirectory, { recursive: true });
    await Promise.all([
      fs.writeFile(
        path.join(cssDirectory, "theme.css"),
        ".salt-theme {\n  --salt-fixture: red;\n}\n/*# sourceMappingURL=untracked.map */\n",
        "utf8",
      ),
      fs.writeFile(
        path.join(cssDirectory, "theme-next.css"),
        "/* empty */\n",
        "utf8",
      ),
      fs.writeFile(
        path.join(cssDirectory, "untracked.map"),
        "not valid source-map JSON",
        "utf8",
      ),
    ]);
    const inventory = await createCatalogInputInventory(sourceRoot, [
      "packages/theme/css/**/*.css",
    ]);

    const extraction = await withCatalogInputTracking(
      sourceRoot,
      inventory,
      () => extractTokenDeclarations(sourceRoot),
    );

    expect(extraction.declarations.get("--salt-fixture")).toHaveLength(1);
    expect(inventory.entries.some((entry) => entry.path.endsWith(".map"))).toBe(
      false,
    );
  });

  it("preserves every source occurrence, selector, context, range, status, replacement, and dimension", async () => {
    const inventory = await createCatalogInputInventory(REPO_ROOT);
    const extracted = await withCatalogInputTracking(REPO_ROOT, inventory, () =>
      extractTokenDeclarations(REPO_ROOT),
    );
    const expected = [...extracted.declarations.values()]
      .flat()
      .sort((left, right) => left.id.localeCompare(right.id));
    const registry = await loadRegistry({
      registryDir: generatedDirectory,
    });
    const actual = registry.tokens
      .flatMap((token) => token.declarations ?? [])
      .sort((left, right) => left.id.localeCompare(right.id));

    expect(extracted.declarations.size).toBe(1_973);
    expect(expected).toHaveLength(3_803);
    expect(actual).toHaveLength(3_803);
    expect(canonicalJson(actual)).toBe(canonicalJson(expected));
    expect(
      [...new Set(actual.map((declaration) => declaration.source_path))].sort(),
    ).toEqual(
      [
        ...new Set(expected.map((declaration) => declaration.source_path)),
      ].sort(),
    );
  }, 120_000);

  it("preserves the complete source-authored deprecation contract through packed load", async () => {
    const inventory = await createCatalogInputInventory(REPO_ROOT);
    const extracted = await withCatalogInputTracking(REPO_ROOT, inventory, () =>
      extractDeprecations(
        REPO_ROOT,
        builtRegistry.packages,
        new Set(["@salt-ds/mcp"]),
      ),
    );
    const linked = linkDeprecationsToComponents(
      builtRegistry.components,
      extracted,
    ).deprecations;
    const loaded = await loadRegistry({ registryDir: generatedDirectory });
    const sourceContract = (deprecation: (typeof linked)[number]) => ({
      id: deprecation.id,
      subject: deprecation.subject,
      package: deprecation.package,
      component: deprecation.component,
      kind: deprecation.kind,
      name: deprecation.name,
      deprecated_in: deprecation.deprecated_in,
      removed_in: deprecation.removed_in,
      replacement: deprecation.replacement,
      migration: deprecation.migration,
      source_paths: deprecation.source_paths,
      source_occurrences: deprecation.source_occurrences,
      source_urls: deprecation.source_urls,
      inference: deprecation.inference,
    });
    expect(extracted).toHaveLength(37);
    expect(canonicalJson(loaded.deprecations.map(sourceContract))).toBe(
      canonicalJson(linked.map(sourceContract)),
    );
  }, 120_000);
});

describe("source-established export and accessibility facts", () => {
  it("preserves authored restricted-resource access independently of URL shape", async () => {
    const registry = await loadRegistry({
      registryDir: generatedDirectory,
    });
    const restrictedResources = registry.patterns.flatMap((pattern) =>
      pattern.resources
        .filter((resource) => resource.internal)
        .map((resource) => ({ pattern: pattern.name, ...resource })),
    );

    expect(restrictedResources).toHaveLength(6);
    expect(
      restrictedResources.every((resource) =>
        resource.href.startsWith("https://www.figma.com/"),
      ),
    ).toBe(true);
    expect(
      registry.patterns
        .flatMap((pattern) => pattern.resources)
        .some((resource) => resource.href.startsWith("/") && resource.internal),
    ).toBe(false);
  }, 120_000);

  it("records real primary origins and keeps extra exports as non-normative observations", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const sources = new Map(
      store
        .getFamily("source")
        .map(
          (record) =>
            [record.id, "locator" in record ? record.locator : null] as const,
        ),
    );
    const rangeSlider = store.getRecord("component", "component.range-slider");
    const carousel = store.getRecord("component", "component.carousel");
    expect(
      rangeSlider?.source_ref ? sources.get(rangeSlider.source_ref.id) : null,
    ).toBe("packages/core/src/slider/RangeSlider.tsx");
    expect(
      carousel?.source_ref ? sources.get(carousel.source_ref.id) : null,
    ).toBe("packages/embla-carousel/src/Carousel.tsx");

    const toggleGroupObservation = store
      .getFamily("relation")
      .find(
        (relation) =>
          relation.source.family === "component" &&
          relation.source.id === "component.toggle-button" &&
          relation.relation_kind === "exported_from" &&
          relation.role === "export:ToggleButtonGroup",
      );
    expect(toggleGroupObservation).toMatchObject({
      relation_kind: "exported_from",
      provenance: "derived",
      normative: false,
      target: { family: "source" },
    });
    expect(
      toggleGroupObservation?.target.family === "source"
        ? sources.get(toggleGroupObservation.target.id)
        : null,
    ).toBe("packages/core/src/toggle-button-group/ToggleButtonGroup.tsx");
  });

  it("does not fabricate enforceable accessibility rules from ordinary documentation", () => {
    const store = new CatalogStoreV2({
      registryDir: generatedDirectory,
    });
    const claims = store.getFamily("accessibility_claim");
    expect(claims.some((claim) => claim.classification === "fact")).toBe(true);
    expect(claims.some((claim) => claim.classification === "guidance")).toBe(
      true,
    );
    expect(claims.filter((claim) => claim.classification === "rule")).toEqual(
      [],
    );
  });
});
