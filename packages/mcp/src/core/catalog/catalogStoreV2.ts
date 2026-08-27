import {
  closeSync,
  fstatSync,
  lstatSync,
  openSync,
  readSync,
  realpathSync,
} from "node:fs";
import path from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { isSemanticCatalogSourcePath } from "./catalogSemanticSource.js";
import { formatAccessibilityImplementationSignalStatement } from "./accessibilityImplementationSignal.js";
import {
  createApiSymbolId,
  createDeprecationId,
  isApiSymbolSpaceReplacementCompatible,
} from "./catalogApiSymbolV2.js";
import { deepFreezeCatalogValue } from "./catalogImmutability.js";
import {
  assertNoLegacyContentIds,
  type CatalogContentCodecName,
  type CatalogContentReference,
  type CatalogPayloadForCodec,
  catalogContentCodecs,
  MAX_CATALOG_CONTENT_BYTES,
  parseCatalogContentPayload,
} from "./catalogPayloadSchemaV2.js";
import { isPortableRepositoryPath } from "./catalogPortablePath.js";
import {
  CATALOG_FAMILY_NAMES,
  CATALOG_SEARCH_TARGET_FAMILY_NAMES,
  type CatalogArtifactManifestEntry,
  type CatalogBuildArtifactManifestEntry,
  type CatalogBuildOnlyFamilyName,
  type CatalogFamilyName,
  type CatalogManifest,
  type CatalogRecord,
  type CatalogRecordForFamily,
  type CatalogReference,
  type CatalogRuntimeFamilyName,
  catalogFamilies,
  catalogInventoryCodec,
  catalogManifestCodec,
  createCatalogJsonSchema,
  createCatalogSearchDocument,
  getCatalogBuildOnlyFamilyNames,
  getCatalogPublishedManifestGenerationPath,
  getCatalogRuntimeFamilyNames,
  isCatalogRuntimeFamilyName,
  MAX_CATALOG_MANIFEST_BYTES,
  MAX_CATALOG_RUNTIME_FILE_BYTES,
  MAX_CATALOG_RUNTIME_TOTAL_BYTES,
  parseCatalogArtifactEnvelope,
  resolveCatalogRecordContentReferences,
  resolveCatalogRecordReferences,
  SALT_CATALOG_CONTENT_PACK_FILE,
  SALT_CATALOG_GENERATIONS_DIRECTORY,
  SALT_CATALOG_JSON_SCHEMA_FILE,
  SALT_CATALOG_MANIFEST_FILE,
  SALT_CATALOG_PACKAGE_FILES_FILE,
  SALT_CATALOG_PUBLICATION_FILE,
} from "./catalogSchemaV2.js";
import {
  canonicalJson,
  compareCatalogIds,
  compareOrdinalStrings,
  sha256Bytes,
} from "./catalogSerialization.js";
import { measureTokenOwnedCatalogSurface } from "./catalogTokenSurfaceV2.js";

const fatalUtf8Decoder = new TextDecoder("utf-8", { fatal: true });

function normalizeAccessibilityDocumentationText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/`([^`]+)`/gu, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replace(/<[^>]+>/gu, " ")
    .replace(/[*_~]+/gu, "")
    .replace(/^\s*[-*]\s+/gmu, "")
    .replace(/^\s*\d+\.\s+/gmu, "")
    .replace(/\s*\\\s*/gu, " ")
    .replace(/^\s*\{\/\*.*\*\/\}\s*$/gmu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function safeArtifactPath(registryDir: string, relativePath: string): string {
  if (!isPortableRepositoryPath(relativePath)) {
    throw new Error(`Catalog artifact path is not portable: ${relativePath}`);
  }
  const lexicalRegistryDir = path.resolve(registryDir);
  const absolutePath = path.resolve(lexicalRegistryDir, relativePath);
  const relativeCheck = path.relative(lexicalRegistryDir, absolutePath);
  if (
    relativeCheck === ".." ||
    relativeCheck.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeCheck) ||
    relativeCheck.length === 0
  ) {
    throw new Error(`Catalog artifact escapes its directory: ${relativePath}`);
  }
  let segmentPath = lexicalRegistryDir;
  const segments = relativePath.split("/");
  for (const [index, segment] of segments.entries()) {
    segmentPath = path.join(segmentPath, segment);
    const segmentStats = lstatSync(segmentPath);
    if (segmentStats.isSymbolicLink()) {
      throw new Error(
        `Catalog artifact path traverses a linked segment: ${relativePath}`,
      );
    }
    if (index < segments.length - 1 && !segmentStats.isDirectory()) {
      throw new Error(
        `Catalog artifact path traverses a non-directory segment: ${relativePath}`,
      );
    }
    if (index === segments.length - 1 && !segmentStats.isFile()) {
      throw new Error(
        `Catalog artifact is not a regular file: ${relativePath}`,
      );
    }
  }
  const realRegistryDir = realpathSync.native(lexicalRegistryDir);
  const realArtifactPath = realpathSync.native(absolutePath);
  const realRelativePath = path.relative(realRegistryDir, realArtifactPath);
  if (
    realRelativePath === ".." ||
    realRelativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(realRelativePath) ||
    realRelativePath.length === 0
  ) {
    throw new Error(
      `Catalog artifact resolves outside its directory: ${relativePath}`,
    );
  }
  const portableRealRelativePath = realRelativePath.split(path.sep).join("/");
  if (portableRealRelativePath !== relativePath) {
    throw new Error(
      `Catalog artifact path spelling does not match its real path: ${relativePath}`,
    );
  }
  return absolutePath;
}

function readFileCounted(
  absolutePath: string,
  maxBytes: number,
  label: string,
): Buffer {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new Error(`${label} has an invalid operational byte limit.`);
  }
  const fileDescriptor = openSync(absolutePath, "r");
  try {
    const openedStats = fstatSync(fileDescriptor, { bigint: true });
    if (!openedStats.isFile()) {
      throw new Error(`${label} is not a regular file.`);
    }
    if (openedStats.size > BigInt(maxBytes)) {
      throw new Error(
        `${label} exceeds the ${maxBytes}-byte operational limit.`,
      );
    }
    const bytes = Buffer.alloc(Number(openedStats.size) + 1);
    let bytesRead = 0;
    while (bytesRead < bytes.length) {
      const count = readSync(
        fileDescriptor,
        bytes,
        bytesRead,
        bytes.length - bytesRead,
        null,
      );
      if (count === 0) break;
      bytesRead += count;
    }
    const finalStats = fstatSync(fileDescriptor, { bigint: true });
    if (
      finalStats.dev !== openedStats.dev ||
      finalStats.ino !== openedStats.ino ||
      finalStats.size !== openedStats.size ||
      finalStats.mtimeNs !== openedStats.mtimeNs ||
      bytesRead !== Number(openedStats.size)
    ) {
      throw new Error(`${label} changed while it was read.`);
    }
    if (bytesRead > maxBytes) {
      throw new Error(
        `${label} exceeds the ${maxBytes}-byte operational limit.`,
      );
    }
    return bytes.subarray(0, bytesRead);
  } finally {
    closeSync(fileDescriptor);
  }
}

function readJsonCounted(
  absolutePath: string,
  maxBytes: number,
  label: string,
): unknown {
  const bytes = readFileCounted(absolutePath, maxBytes, label);
  try {
    return JSON.parse(bytes.toString("utf8")) as unknown;
  } catch (error) {
    throw new Error(
      `Catalog JSON artifact is invalid: ${path.basename(absolutePath)}`,
      { cause: error },
    );
  }
}

function assertCatalogRuntimeBudget(manifest: CatalogManifest): void {
  const declaredRuntimeBytes = [
    ...manifest.artifacts,
    ...manifest.build_artifacts,
    ...manifest.support_artifacts,
  ].reduce((total, entry) => {
    if (
      !Number.isSafeInteger(entry.bytes) ||
      entry.bytes < 0 ||
      entry.bytes > MAX_CATALOG_RUNTIME_FILE_BYTES ||
      !Number.isSafeInteger(total + entry.bytes)
    ) {
      throw new Error(
        "Catalog manifest declares an invalid artifact byte budget.",
      );
    }
    return total + entry.bytes;
  }, 0);
  if (declaredRuntimeBytes > MAX_CATALOG_RUNTIME_TOTAL_BYTES) {
    throw new Error(
      `Catalog manifest exceeds the ${MAX_CATALOG_RUNTIME_TOTAL_BYTES}-byte aggregate runtime limit.`,
    );
  }
}

function assertDecodedContentBudget(
  records: readonly CatalogRecordForFamily<"content">[],
): void {
  let decodedBytes = 0;
  for (const record of records) {
    if (record.bytes > MAX_CATALOG_RUNTIME_TOTAL_BYTES - decodedBytes) {
      throw new Error(
        `Catalog content declarations exceed the ${MAX_CATALOG_RUNTIME_TOTAL_BYTES}-byte aggregate decoded-content limit.`,
      );
    }
    decodedBytes += record.bytes;
  }
}

function assertExactManifestCoverage(manifest: CatalogManifest): string {
  const runtimeFamilies = getCatalogRuntimeFamilyNames();
  const expectedFamilySet = new Set(runtimeFamilies);
  const seenFamilySet = new Set<CatalogFamilyName>();
  const seenFiles = new Set<string>();
  let publicationPrefix: string | undefined;
  const requireExpectedFile = (
    actualFile: string,
    expectedFile: string,
  ): boolean => {
    const suffix = `/${expectedFile}`;
    const prefix =
      actualFile === expectedFile
        ? ""
        : actualFile.endsWith(suffix)
          ? actualFile.slice(0, -suffix.length)
          : null;
    if (
      prefix === null ||
      (prefix !== "" &&
        !new RegExp(
          `^${SALT_CATALOG_GENERATIONS_DIRECTORY}/[0-9a-f]{64}$`,
          "u",
        ).test(prefix))
    ) {
      return false;
    }
    if (publicationPrefix === undefined) {
      publicationPrefix = prefix;
      return true;
    }
    return publicationPrefix === prefix;
  };

  for (const entry of manifest.artifacts) {
    if (!expectedFamilySet.has(entry.family)) {
      throw new Error(
        `Manifest publishes non-runtime family '${entry.family}'.`,
      );
    }
    if (seenFamilySet.has(entry.family)) {
      throw new Error(`Manifest contains duplicate family '${entry.family}'.`);
    }
    if (seenFiles.has(entry.file)) {
      throw new Error(`Manifest contains duplicate file '${entry.file}'.`);
    }
    const descriptor = catalogFamilies[entry.family];
    if (
      !requireExpectedFile(entry.file, descriptor.artifact) ||
      entry.codec !== descriptor.codecName ||
      entry.canonical !== descriptor.canonical
    ) {
      throw new Error(
        `Manifest metadata does not match descriptor for '${entry.family}'.`,
      );
    }
    seenFamilySet.add(entry.family);
    seenFiles.add(entry.file);
  }

  const missingFamilies = runtimeFamilies.filter(
    (family) => !seenFamilySet.has(family),
  );
  if (missingFamilies.length > 0) {
    throw new Error(
      `Manifest is missing runtime families: ${missingFamilies.join(", ")}.`,
    );
  }

  const buildOnlyFamilies = getCatalogBuildOnlyFamilyNames();
  const expectedBuildFamilySet = new Set(buildOnlyFamilies);
  const seenBuildFamilySet = new Set<CatalogFamilyName>();
  for (const entry of manifest.build_artifacts) {
    if (!expectedBuildFamilySet.has(entry.family)) {
      throw new Error(
        `Manifest binds non-build-only family '${entry.family}' as a build artifact.`,
      );
    }
    if (seenBuildFamilySet.has(entry.family)) {
      throw new Error(
        `Manifest contains duplicate build artifact family '${entry.family}'.`,
      );
    }
    if (seenFiles.has(entry.file)) {
      throw new Error(`Manifest contains duplicate file '${entry.file}'.`);
    }
    const descriptor = catalogFamilies[entry.family];
    if (
      !requireExpectedFile(entry.file, descriptor.artifact) ||
      entry.codec !== descriptor.codecName ||
      entry.canonical !== descriptor.canonical
    ) {
      throw new Error(
        `Manifest build artifact metadata does not match descriptor for '${entry.family}'.`,
      );
    }
    seenBuildFamilySet.add(entry.family);
    seenFiles.add(entry.file);
  }
  const missingBuildFamilies = buildOnlyFamilies.filter(
    (family) => !seenBuildFamilySet.has(family),
  );
  if (missingBuildFamilies.length > 0) {
    throw new Error(
      `Manifest is missing build-only families: ${missingBuildFamilies.join(", ")}.`,
    );
  }
  const resolvedPublicationPrefix = publicationPrefix ?? "";

  const expectedSupport = new Map([
    [
      "json_schema",
      {
        file: SALT_CATALOG_JSON_SCHEMA_FILE,
        codec: "salt.catalog.v2.json-schema",
      },
    ],
    [
      "package_inventory",
      {
        file: SALT_CATALOG_PACKAGE_FILES_FILE,
        codec: "salt.catalog.v2.inventory",
      },
    ],
    [
      "content_pack",
      {
        file: SALT_CATALOG_CONTENT_PACK_FILE,
        codec: "salt.catalog.v2.content-pack",
      },
    ],
  ] as const);
  const seenSupport = new Set<string>();
  for (const entry of manifest.support_artifacts) {
    const expected = expectedSupport.get(entry.kind);
    if (!expected) {
      throw new Error(`Manifest has unknown support kind '${entry.kind}'.`);
    }
    if (seenSupport.has(entry.kind)) {
      throw new Error(
        `Manifest contains duplicate support kind '${entry.kind}'.`,
      );
    }
    const isPackageInventory =
      entry.kind === "package_inventory" &&
      (resolvedPublicationPrefix === ""
        ? entry.file === SALT_CATALOG_PACKAGE_FILES_FILE
        : entry.file ===
          `${resolvedPublicationPrefix}/${SALT_CATALOG_PUBLICATION_FILE}`);
    if (
      (!isPackageInventory &&
        !requireExpectedFile(entry.file, expected.file)) ||
      entry.codec !== expected.codec
    ) {
      throw new Error(
        `Manifest support metadata does not match '${entry.kind}'.`,
      );
    }
    seenSupport.add(entry.kind);
    if (seenFiles.has(entry.file)) {
      throw new Error(`Manifest contains duplicate file '${entry.file}'.`);
    }
    seenFiles.add(entry.file);
  }
  if (seenSupport.size !== expectedSupport.size) {
    throw new Error("Manifest is missing required support artifacts.");
  }

  const sortedInputs = [...manifest.inputs].sort((left, right) =>
    compareOrdinalStrings(left.path, right.path),
  );
  if (canonicalJson(sortedInputs) !== canonicalJson(manifest.inputs)) {
    throw new Error("Manifest inputs must be sorted by repository path.");
  }
  const inputPaths = new Set<string>();
  const portableInputIdentities = new Map<string, string>();
  for (const entry of manifest.inputs) {
    if (inputPaths.has(entry.path)) {
      throw new Error(`Manifest has duplicate input path '${entry.path}'.`);
    }
    inputPaths.add(entry.path);
    const portableIdentity = entry.path.normalize("NFC").toLowerCase();
    const previous = portableInputIdentities.get(portableIdentity);
    if (previous && previous !== entry.path) {
      throw new Error(
        `Manifest input paths collide under portable case normalization: '${previous}' and '${entry.path}'.`,
      );
    }
    portableInputIdentities.set(portableIdentity, entry.path);
  }
  const expectedInputInventoryDigest = sha256Bytes(
    canonicalJson(manifest.inputs),
  );
  if (manifest.input_inventory_digest !== expectedInputInventoryDigest) {
    throw new Error(
      `Manifest input inventory digest mismatch: expected ${expectedInputInventoryDigest}, received ${manifest.input_inventory_digest}.`,
    );
  }

  const contentPack = manifest.support_artifacts.find(
    (entry) => entry.kind === "content_pack",
  );
  if (!contentPack) {
    throw new Error("Manifest is missing required content pack metadata.");
  }
  const expectedSemanticDigest = sha256Bytes(
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
  if (manifest.semantic_digest !== expectedSemanticDigest) {
    throw new Error(
      `Manifest semantic digest mismatch: expected ${expectedSemanticDigest}, received ${manifest.semantic_digest}.`,
    );
  }
  return resolvedPublicationPrefix;
}

function assertPublishedGenerationIdentity(
  manifest: CatalogManifest,
  publicationPrefix: string,
): void {
  if (publicationPrefix === "") return;
  const expectedPrefix = getCatalogPublishedManifestGenerationPath(
    manifest,
    publicationPrefix,
  );
  if (publicationPrefix !== expectedPrefix) {
    throw new Error(
      `Catalog generation path '${publicationPrefix}' does not match its content digest '${expectedPrefix}'.`,
    );
  }
}

function isCatalogReference(value: unknown): value is CatalogReference {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).family === "string" &&
    typeof (value as Record<string, unknown>).id === "string" &&
    Object.keys(value as Record<string, unknown>).length === 2
  );
}

function isCatalogContentReference(
  value: unknown,
): value is CatalogContentReference {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).family === "content" &&
    typeof (value as Record<string, unknown>).id === "string" &&
    typeof (value as Record<string, unknown>).codec === "string" &&
    Object.keys(value as Record<string, unknown>).length === 3
  );
}

function walkNestedReferences(
  value: unknown,
  visitReference: (reference: CatalogReference) => void,
  visitContentReference: (reference: CatalogContentReference) => void,
): void {
  if (isCatalogContentReference(value)) {
    visitContentReference(value);
    return;
  }
  if (isCatalogReference(value)) {
    visitReference(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      walkNestedReferences(entry, visitReference, visitContentReference);
    }
    return;
  }
  if (typeof value === "object" && value !== null) {
    for (const entry of Object.values(value)) {
      walkNestedReferences(entry, visitReference, visitContentReference);
    }
  }
}

function referenceMultiset(references: readonly CatalogReference[]): string[] {
  return references
    .map((reference) => catalogReferenceKey(reference))
    .sort(compareOrdinalStrings);
}

function contentReferenceMultiset(
  references: readonly CatalogContentReference[],
): string[] {
  return references
    .map(
      (reference) => `${reference.family}\0${reference.id}\0${reference.codec}`,
    )
    .sort(compareOrdinalStrings);
}

interface CatalogExampleSequenceEntry {
  evidenceId: string;
  localId: string;
  owner: CatalogReference;
  ownerOrdinal: number;
  registryOrdinal: number;
}

function catalogExampleSequenceEntry(
  evidence: CatalogRecordForFamily<"evidence">,
): CatalogExampleSequenceEntry | null {
  if (evidence.evidence_kind === "executable_example") {
    return {
      evidenceId: evidence.id,
      localId: evidence.local_id,
      owner: evidence.owner,
      ownerOrdinal: evidence.owner_ordinal,
      registryOrdinal: evidence.registry_ordinal,
    };
  }
  return null;
}

function validateContiguousExampleOrdinals(
  entries: readonly CatalogExampleSequenceEntry[],
  dimension: "owner" | "registry",
  scope: string,
): void {
  const ordinalKey = dimension === "owner" ? "ownerOrdinal" : "registryOrdinal";
  const sorted = [...entries].sort(
    (left, right) =>
      left[ordinalKey] - right[ordinalKey] ||
      compareOrdinalStrings(left.evidenceId, right.evidenceId),
  );
  sorted.forEach((entry, expectedOrdinal) => {
    const receivedOrdinal = entry[ordinalKey];
    if (receivedOrdinal !== expectedOrdinal) {
      throw new Error(
        `Catalog example ${dimension} ordinals for ${scope} must be unique and contiguous from zero; expected ${expectedOrdinal}, received ${receivedOrdinal} for '${entry.evidenceId}'.`,
      );
    }
  });
}

function validateCatalogExampleSequences(
  evidenceRecords: readonly CatalogRecordForFamily<"evidence">[],
): void {
  const entries = evidenceRecords
    .map(catalogExampleSequenceEntry)
    .filter((entry): entry is CatalogExampleSequenceEntry => entry !== null);
  validateContiguousExampleOrdinals(entries, "registry", "the registry");

  const entriesByOwner = new Map<string, CatalogExampleSequenceEntry[]>();
  const ownerLocalIds = new Set<string>();
  for (const entry of entries) {
    const ownerKey = `${entry.owner.family}:${entry.owner.id}`;
    const ownerLocalKey = `${ownerKey}\0${entry.localId}`;
    if (ownerLocalIds.has(ownerLocalKey)) {
      throw new Error(
        `Catalog example local id '${entry.localId}' is duplicated for ${ownerKey}.`,
      );
    }
    ownerLocalIds.add(ownerLocalKey);
    const ownerEntries = entriesByOwner.get(ownerKey) ?? [];
    ownerEntries.push(entry);
    entriesByOwner.set(ownerKey, ownerEntries);
  }
  for (const [ownerKey, ownerEntries] of entriesByOwner) {
    validateContiguousExampleOrdinals(ownerEntries, "owner", ownerKey);
  }
}

function validateCatalogAccessibilityClaimSequences(
  claims: readonly CatalogRecordForFamily<"accessibility_claim">[],
): void {
  const claimsByOwnerAndField = new Map<
    string,
    Array<{ id: string; ordinal: number }>
  >();
  for (const claim of claims) {
    const scope = `${catalogReferenceKey(claim.owner)}.${claim.source_field}`;
    const entries = claimsByOwnerAndField.get(scope) ?? [];
    entries.push({ id: claim.id, ordinal: claim.ordinal });
    claimsByOwnerAndField.set(scope, entries);
  }
  for (const [scope, entries] of claimsByOwnerAndField) {
    validateContiguousOrdinals(
      entries,
      `Catalog accessibility claims for ${scope}`,
    );
  }
}

function catalogReferenceKey(reference: CatalogReference): string {
  return `${reference.family}:${reference.id}`;
}

function resolveCatalogFieldPath(
  value: unknown,
  fieldPath: string,
): { found: true; value: unknown } | { found: false } {
  let current = value;
  for (const segment of fieldPath.split(".")) {
    if (segment.length === 0) return { found: false };
    if (Array.isArray(current)) {
      if (!/^(?:0|[1-9][0-9]*)$/u.test(segment)) return { found: false };
      const index = Number(segment);
      if (index >= current.length) return { found: false };
      current = current[index];
      continue;
    }
    if (
      typeof current !== "object" ||
      current === null ||
      !Object.hasOwn(current, segment)
    ) {
      return { found: false };
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return { found: true, value: current };
}

function validateContiguousOrdinals(
  entries: readonly { id: string; ordinal: number }[],
  scope: string,
): void {
  const sorted = [...entries].sort(
    (left, right) =>
      left.ordinal - right.ordinal || compareOrdinalStrings(left.id, right.id),
  );
  sorted.forEach((entry, expectedOrdinal) => {
    if (entry.ordinal !== expectedOrdinal) {
      throw new Error(
        `${scope} ordinals must be unique and contiguous from zero; expected ${expectedOrdinal}, received ${entry.ordinal} for '${entry.id}'.`,
      );
    }
  });
}

export interface CatalogValidationMetrics {
  familyRecordCounts: Record<CatalogFamilyName, number>;
  contentBytes: number;
  searchArtifactBytes: number;
  tokenOwnedArtifactBytes: number;
}

export interface CatalogStoreV2Options {
  registryDir: string;
}

/**
 * Manifest-first, digest-keyed access to the canonical v2 catalog.
 * The manifest is the only eager read. Family artifacts and the content pack
 * are verified on their first access and cached by their manifest digest.
 */
export class CatalogStoreV2 {
  readonly registryDir: string;
  readonly manifest: CatalogManifest;
  private readonly publicationPrefix: string;
  private readonly artifactByFamily: Map<
    CatalogRuntimeFamilyName,
    CatalogArtifactManifestEntry
  >;
  private readonly familyCache = new Map<
    CatalogRuntimeFamilyName,
    readonly CatalogRecord[]
  >();
  private readonly familyByIdCache = new Map<
    CatalogRuntimeFamilyName,
    ReadonlyMap<string, CatalogRecord>
  >();
  private readonly loadingFamilies = new Set<CatalogRuntimeFamilyName>();
  private readonly decodedContentCache = new Map<string, unknown>();
  private readonly contentTextCache = new Map<string, string>();
  private readonly verifiedContentObjects = new Set<string>();
  private readonly verifiedSupport = new Set<string>();
  private readonly verifiedBuildArtifactRecordCounts = new Map<
    CatalogBuildOnlyFamilyName,
    number
  >();
  private verifiedCatalogMetrics: CatalogValidationMetrics | null = null;
  private catalogValidationInProgress = false;
  private contentPackBytes: Buffer | null = null;

  constructor(options: CatalogStoreV2Options) {
    this.registryDir = path.resolve(options.registryDir);
    const manifestPath = safeArtifactPath(
      this.registryDir,
      SALT_CATALOG_MANIFEST_FILE,
    );
    this.manifest = deepFreezeCatalogValue(
      catalogManifestCodec.parse(
        readJsonCounted(
          manifestPath,
          MAX_CATALOG_MANIFEST_BYTES,
          "Catalog manifest",
        ),
      ),
    );
    assertCatalogRuntimeBudget(this.manifest);
    safeArtifactPath(this.registryDir, SALT_CATALOG_MANIFEST_FILE);
    this.publicationPrefix = assertExactManifestCoverage(this.manifest);
    assertPublishedGenerationIdentity(this.manifest, this.publicationPrefix);
    this.artifactByFamily = new Map(
      this.manifest.artifacts.map((entry) => [entry.family, entry]),
    );
  }

  private verifyArtifactBytes(
    relativePath: string,
    expectedSha256: string,
    expectedBytes: number,
  ): Buffer {
    const absolutePath = safeArtifactPath(this.registryDir, relativePath);
    const bytes = readFileCounted(
      absolutePath,
      Math.min(expectedBytes + 1, MAX_CATALOG_RUNTIME_FILE_BYTES),
      `Catalog artifact '${relativePath}'`,
    );
    safeArtifactPath(this.registryDir, relativePath);
    const actualSha256 = sha256Bytes(bytes);
    if (actualSha256 !== expectedSha256 || bytes.byteLength !== expectedBytes) {
      throw new Error(
        `Catalog artifact digest mismatch for '${relativePath}': expected ${expectedSha256}/${expectedBytes}, received ${actualSha256}/${bytes.byteLength}.`,
      );
    }
    return bytes;
  }

  private readManifestArtifact<Family extends CatalogFamilyName>(
    entry: (
      | CatalogArtifactManifestEntry
      | CatalogBuildArtifactManifestEntry
    ) & { family: Family },
    options: {
      label: "artifact" | "build artifact";
      resolveReferences: boolean;
    },
  ): readonly CatalogRecordForFamily<Family>[] {
    const bytes = this.verifyArtifactBytes(
      entry.file,
      entry.sha256,
      entry.bytes,
    );
    let raw: unknown;
    try {
      raw = JSON.parse(bytes.toString("utf8")) as unknown;
    } catch (error) {
      throw new Error(
        `Catalog ${options.label} '${entry.file}' is invalid JSON.`,
        { cause: error },
      );
    }
    const envelope = parseCatalogArtifactEnvelope(
      entry.family,
      raw,
      options.resolveReferences
        ? (reference) =>
            this.getRecord(
              reference.family as CatalogRuntimeFamilyName,
              reference.id,
            ) as CatalogRecord | null
        : undefined,
    );
    if (envelope.records.length !== entry.record_count) {
      throw new Error(
        `Catalog ${options.label} '${entry.file}' record count mismatch: expected ${entry.record_count}, received ${envelope.records.length}.`,
      );
    }
    const sorted = [...envelope.records].sort(compareCatalogIds);
    if (canonicalJson(sorted) !== canonicalJson(envelope.records)) {
      throw new Error(
        `Catalog ${options.label} '${entry.file}' records are not sorted by id.`,
      );
    }
    return envelope.records as readonly CatalogRecordForFamily<Family>[];
  }

  validateBuildArtifacts(): void {
    for (const entry of this.manifest.build_artifacts) {
      if (this.verifiedBuildArtifactRecordCounts.has(entry.family)) continue;
      const records = this.readManifestArtifact(entry, {
        label: "build artifact",
        resolveReferences: false,
      });
      this.verifiedBuildArtifactRecordCounts.set(entry.family, records.length);
    }
  }

  getFamily<Family extends CatalogRuntimeFamilyName>(
    family: Family,
  ): readonly CatalogRecordForFamily<Family>[] {
    const cached = this.familyCache.get(family);
    if (cached) {
      return cached as readonly CatalogRecordForFamily<Family>[];
    }
    if (this.loadingFamilies.has(family)) {
      throw new Error(
        `Catalog family '${family}' recursively depends on itself while loading.`,
      );
    }
    this.loadingFamilies.add(family);
    try {
      const entry = this.artifactByFamily.get(family);
      if (!entry) {
        throw new Error(`Catalog manifest has no runtime family '${family}'.`);
      }
      const records = deepFreezeCatalogValue(
        this.readManifestArtifact<Family>(
          entry as CatalogArtifactManifestEntry & { family: Family },
          {
            label: "artifact",
            resolveReferences: true,
          },
        ),
      );
      this.familyCache.set(family, records);
      this.familyByIdCache.set(
        family,
        new Map(records.map((record) => [record.id, record])),
      );
      return records;
    } finally {
      this.loadingFamilies.delete(family);
    }
  }

  getRecord<Family extends CatalogRuntimeFamilyName>(
    family: Family,
    id: string,
  ): CatalogRecordForFamily<Family> | null {
    void this.getFamily(family);
    return (
      (this.familyByIdCache.get(family)?.get(id) as
        | CatalogRecordForFamily<Family>
        | undefined) ?? null
    );
  }

  private getSupportEntry(
    kind: CatalogManifest["support_artifacts"][number]["kind"],
  ): CatalogManifest["support_artifacts"][number] {
    const entry = this.manifest.support_artifacts.find(
      (candidate) => candidate.kind === kind,
    );
    if (!entry) {
      throw new Error(`Catalog manifest is missing '${kind}'.`);
    }
    return entry;
  }

  verifyJsonSchema(): void {
    if (this.verifiedSupport.has("json_schema")) return;
    const entry = this.getSupportEntry("json_schema");
    const bytes = this.verifyArtifactBytes(
      entry.file,
      entry.sha256,
      entry.bytes,
    );
    let parsed: unknown;
    try {
      parsed = JSON.parse(bytes.toString("utf8")) as unknown;
    } catch (error) {
      throw new Error("Catalog JSON Schema is invalid JSON.", {
        cause: error,
      });
    }
    if (canonicalJson(parsed) !== canonicalJson(createCatalogJsonSchema())) {
      throw new Error(
        "Catalog JSON Schema does not match the family descriptor table.",
      );
    }
    this.verifiedSupport.add("json_schema");
  }

  verifyPackageInventory(): void {
    if (this.verifiedSupport.has("package_inventory")) return;
    const entry = this.getSupportEntry("package_inventory");
    const bytes = this.verifyArtifactBytes(
      entry.file,
      entry.sha256,
      entry.bytes,
    );
    let parsed: unknown;
    try {
      parsed = JSON.parse(bytes.toString("utf8")) as unknown;
    } catch (error) {
      throw new Error("Catalog package inventory is invalid JSON.", {
        cause: error,
      });
    }
    const manifestBoundFiles = [
      SALT_CATALOG_MANIFEST_FILE,
      ...this.manifest.artifacts.map((artifact) => artifact.file),
      ...this.manifest.support_artifacts.map((artifact) => artifact.file),
    ].sort(compareOrdinalStrings);
    const inventory = catalogInventoryCodec.parse(parsed);
    const expected =
      "generation" in inventory
        ? inventory
        : {
            schema_version: this.manifest.schema_version,
            files: manifestBoundFiles,
          };
    if (
      "generation" in expected &&
      (this.publicationPrefix === "" ||
        expected.generation !== this.publicationPrefix ||
        expected.semantic_digest !== this.manifest.semantic_digest ||
        canonicalJson(expected.files) !== canonicalJson(manifestBoundFiles))
    ) {
      throw new Error(
        "Catalog publication inventory does not match the active manifest generation.",
      );
    }
    if (!("generation" in expected) && this.publicationPrefix !== "") {
      throw new Error(
        "Published catalog manifests require a generation-bound package inventory.",
      );
    }
    if (canonicalJson(parsed) !== canonicalJson(expected)) {
      throw new Error(
        "Catalog package inventory does not match the descriptor-derived file list.",
      );
    }
    this.verifiedSupport.add("package_inventory");
  }

  verifyContentPack(): void {
    if (this.verifiedSupport.has("content_pack")) return;
    const entry = this.getSupportEntry("content_pack");
    const absolutePath = safeArtifactPath(this.registryDir, entry.file);
    const bytes = readFileCounted(
      absolutePath,
      Math.min(entry.bytes + 1, MAX_CATALOG_RUNTIME_FILE_BYTES),
      "Catalog content pack",
    );
    safeArtifactPath(this.registryDir, entry.file);
    const actual = {
      sha256: sha256Bytes(bytes),
      bytes: bytes.byteLength,
    };
    safeArtifactPath(this.registryDir, entry.file);
    if (actual.sha256 !== entry.sha256 || actual.bytes !== entry.bytes) {
      throw new Error(
        `Catalog content pack digest mismatch: expected ${entry.sha256}/${entry.bytes}, received ${actual.sha256}/${actual.bytes}.`,
      );
    }
    this.contentPackBytes = bytes;
    this.verifiedSupport.add("content_pack");
  }

  getContentBytes(reference: CatalogContentReference): Uint8Array {
    const contentRecord = this.getRecord("content", reference.id);
    if (!contentRecord) {
      throw new Error(`Catalog content '${reference.id}' does not exist.`);
    }
    if (contentRecord.codec !== reference.codec) {
      throw new Error(
        `Catalog content '${reference.id}' has codec '${contentRecord.codec}', expected '${reference.codec}'.`,
      );
    }
    const codecDescriptor = catalogContentCodecs[reference.codec];
    if (contentRecord.media_type !== codecDescriptor.mediaType) {
      throw new Error(
        `Catalog content '${reference.id}' has media type '${contentRecord.media_type}', expected '${codecDescriptor.mediaType}'.`,
      );
    }
    this.verifyContentPack();
    const packEntry = this.getSupportEntry("content_pack");
    if (contentRecord.offset + contentRecord.length > packEntry.bytes) {
      throw new Error(
        `Catalog content '${reference.id}' has an invalid byte range.`,
      );
    }
    const packBytes = this.contentPackBytes;
    if (!packBytes) {
      throw new Error(
        "Catalog content pack verification did not retain its bytes.",
      );
    }
    const storedBytes = packBytes.subarray(
      contentRecord.offset,
      contentRecord.offset + contentRecord.length,
    );
    let bytes: Uint8Array;
    if (contentRecord.encoding === "br") {
      try {
        bytes = brotliDecompressSync(storedBytes, {
          maxOutputLength: MAX_CATALOG_CONTENT_BYTES,
        });
      } catch (error) {
        throw new Error(
          `Catalog content '${reference.id}' exceeds its decoded-byte limit or is invalid Brotli data.`,
          { cause: error },
        );
      }
    } else {
      bytes = storedBytes;
    }
    if (bytes.byteLength !== contentRecord.bytes) {
      throw new Error(
        `Catalog content '${reference.id}' decoded to ${bytes.byteLength} bytes, expected ${contentRecord.bytes}.`,
      );
    }
    if (!this.verifiedContentObjects.has(reference.id)) {
      const identity = Buffer.concat([
        Buffer.from(`${contentRecord.media_type}\0`, "utf8"),
        bytes,
      ]);
      const actualId = sha256Bytes(identity);
      if (actualId !== reference.id) {
        throw new Error(
          `Catalog content object digest mismatch for '${reference.id}': received ${actualId}.`,
        );
      }
      this.verifiedContentObjects.add(reference.id);
    }
    return Buffer.from(bytes);
  }

  getContentSourceText<Codec extends CatalogContentCodecName>(
    reference: CatalogContentReference<Codec>,
  ): string {
    const cacheKey = `${reference.id}\0${reference.codec}`;
    const cached = this.contentTextCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const bytes = this.getContentBytes(reference);
    let text: string;
    try {
      text = fatalUtf8Decoder.decode(bytes);
    } catch (error) {
      throw new Error(`Catalog content '${reference.id}' is not valid UTF-8.`, {
        cause: error,
      });
    }
    this.contentTextCache.set(cacheKey, text);
    return text;
  }

  getContentValue<Codec extends CatalogContentCodecName>(
    reference: CatalogContentReference<Codec>,
  ): CatalogPayloadForCodec<Codec> {
    const cacheKey = `${reference.id}\0${reference.codec}`;
    if (this.decodedContentCache.has(cacheKey)) {
      return this.decodedContentCache.get(
        cacheKey,
      ) as CatalogPayloadForCodec<Codec>;
    }
    const text = this.getContentSourceText(reference);
    const mediaType = catalogContentCodecs[reference.codec].mediaType;
    let raw: unknown = text;
    if (!mediaType.startsWith("text/")) {
      try {
        raw = JSON.parse(text) as unknown;
      } catch (error) {
        throw new Error(
          `Catalog content '${reference.id}' is not valid JSON.`,
          { cause: error },
        );
      }
    }
    assertNoLegacyContentIds(raw);
    const parsed = deepFreezeCatalogValue(
      parseCatalogContentPayload(reference.codec, raw),
    );
    this.decodedContentCache.set(cacheKey, parsed);
    return parsed;
  }

  getContentText<Codec extends CatalogContentCodecName>(
    reference: CatalogContentReference<Codec>,
  ): string {
    const value = this.getContentValue(reference);
    if (typeof value !== "string") {
      throw new Error(
        `Catalog content '${reference.id}' with codec '${reference.codec}' is not text.`,
      );
    }
    return value;
  }

  getContentJson<Codec extends CatalogContentCodecName>(
    reference: CatalogContentReference<Codec>,
  ): CatalogPayloadForCodec<Codec> {
    const value = this.getContentValue(reference);
    if (typeof value === "string") {
      throw new Error(
        `Catalog content '${reference.id}' with codec '${reference.codec}' is not JSON.`,
      );
    }
    return value;
  }

  prefetch(options: { verifyEveryContentObject?: boolean } = {}): void {
    for (const family of getCatalogRuntimeFamilyNames()) {
      void this.getFamily(family);
    }
    assertDecodedContentBudget(this.getFamily("content"));
    this.verifyJsonSchema();
    this.verifyPackageInventory();
    this.verifyContentPack();
    if (options.verifyEveryContentObject) {
      for (const record of this.getFamily("content")) {
        void this.getContentValue({
          family: "content",
          id: record.id,
          codec: record.codec,
        });
      }
    }
  }

  ensureCatalogVerified(): CatalogValidationMetrics {
    if (this.verifiedCatalogMetrics) return this.verifiedCatalogMetrics;
    if (this.catalogValidationInProgress) {
      throw new Error("Salt catalog integrity verification re-entered.");
    }
    this.catalogValidationInProgress = true;
    try {
      const metrics = deepFreezeCatalogValue(this.validateCrossReferences());
      this.verifiedCatalogMetrics = metrics;
      return metrics;
    } finally {
      this.catalogValidationInProgress = false;
    }
  }

  validateCrossReferences(): CatalogValidationMetrics {
    this.prefetch({ verifyEveryContentObject: true });
    const idSets = new Map<CatalogFamilyName, ReadonlySet<string>>();
    for (const family of getCatalogRuntimeFamilyNames()) {
      idSets.set(
        family,
        new Set(this.getFamily(family).map((record) => record.id)),
      );
    }
    const requireReference = (
      reference: CatalogReference,
      owner: string,
    ): void => {
      const family = reference.family as CatalogFamilyName;
      if (
        !CATALOG_FAMILY_NAMES.includes(family) ||
        !idSets.get(family)?.has(reference.id)
      ) {
        throw new Error(
          `${owner} contains unresolved ${reference.family}:${reference.id}.`,
        );
      }
    };
    const sourceForReference = (
      reference: CatalogReference,
      owner: string,
    ): CatalogRecordForFamily<"source"> => {
      if (reference.family !== "source") {
        throw new Error(
          `${owner} expected a source reference, received ${catalogReferenceKey(reference)}.`,
        );
      }
      const source = this.getRecord("source", reference.id);
      if (!source) {
        throw new Error(`${owner} contains unresolved source:${reference.id}.`);
      }
      return source;
    };
    const requireSourceKinds = <
      Kind extends CatalogRecordForFamily<"source">["source_kind"],
    >(
      reference: CatalogReference,
      owner: string,
      allowedKinds: readonly Kind[],
    ): Extract<CatalogRecordForFamily<"source">, { source_kind: Kind }> => {
      const source = sourceForReference(reference, owner);
      if (!allowedKinds.includes(source.source_kind as Kind)) {
        throw new Error(
          `${owner} cannot use ${source.source_kind} source '${source.id}'; expected ${allowedKinds.join(" or ")}.`,
        );
      }
      return source as Extract<
        CatalogRecordForFamily<"source">,
        { source_kind: Kind }
      >;
    };
    const requirePolicyProfileKinds = (
      reference: CatalogReference,
      owner: string,
      allowedKinds: readonly CatalogRecordForFamily<"policy_profile">["policy_kind"][],
    ): CatalogRecordForFamily<"policy_profile"> => {
      if (reference.family !== "policy_profile") {
        throw new Error(
          `${owner} expected a policy profile reference, received ${catalogReferenceKey(reference)}.`,
        );
      }
      const profile = this.getRecord("policy_profile", reference.id);
      if (!profile) {
        throw new Error(
          `${owner} contains unresolved policy_profile:${reference.id}.`,
        );
      }
      if (!allowedKinds.includes(profile.policy_kind)) {
        throw new Error(
          `${owner} cannot use '${profile.policy_kind}' policy profile '${profile.id}'; expected ${allowedKinds.join(" or ")}.`,
        );
      }
      return profile;
    };
    const identityForApiSymbol = (
      record: CatalogRecordForFamily<"api_symbol">,
      owner: string,
    ) => {
      const packageRecord = this.getRecord("package", record.package_ref.id);
      if (!packageRecord) {
        throw new Error(
          `${owner} contains unresolved package:${record.package_ref.id}.`,
        );
      }
      return {
        package: packageRecord.name,
        entrypoint: record.entrypoint,
        export_name: record.export_name,
        symbol_space: record.symbol_space,
        member_path: record.member_path,
      };
    };
    const requireTokenPolicyAssertion = (
      reference: CatalogReference,
      owner: string,
    ): Extract<
      CatalogRecordForFamily<"evidence">,
      {
        evidence_kind: "source_assertion";
        assertion_kind: "token_policy";
      }
    > => {
      if (reference.family !== "evidence") {
        throw new Error(
          `${owner} expected an evidence reference, received ${catalogReferenceKey(reference)}.`,
        );
      }
      const evidence = this.getRecord("evidence", reference.id);
      if (
        !evidence ||
        evidence.evidence_kind !== "source_assertion" ||
        evidence.assertion_kind !== "token_policy"
      ) {
        throw new Error(
          `${owner} must reference token-policy source assertions; received evidence:${reference.id}.`,
        );
      }
      return evidence;
    };
    validateCatalogExampleSequences(this.getFamily("evidence"));
    validateCatalogAccessibilityClaimSequences(
      this.getFamily("accessibility_claim"),
    );

    const pageIdByRoute = new Map<string, string>();
    const pageByRoute = new Map<string, CatalogRecordForFamily<"page">>();
    for (const page of this.getFamily("page")) {
      const previous = pageIdByRoute.get(page.route);
      if (previous && previous !== page.id) {
        throw new Error(
          `Catalog page route '${page.route}' is duplicated by '${previous}' and '${page.id}'.`,
        );
      }
      pageIdByRoute.set(page.route, page.id);
      pageByRoute.set(page.route, page);
    }

    const inputByPath = new Map(
      this.manifest.inputs.map((entry) => [entry.path, entry] as const),
    );
    const unboundCatalogProvenance = new Set<string>();
    const unboundAccessibilityAssertions = new Set(
      this.getFamily("evidence")
        .filter(
          (evidence) =>
            evidence.evidence_kind === "source_assertion" &&
            evidence.assertion_kind === "accessibility_implementation_signal",
        )
        .map((evidence) => evidence.id),
    );
    const unboundStructuralRelationAssertions = new Set(
      this.getFamily("evidence")
        .filter(
          (evidence) =>
            evidence.evidence_kind === "source_assertion" &&
            evidence.assertion_kind === "structural_relation",
        )
        .map((evidence) => evidence.id),
    );
    const unboundTokenReplacementAssertions = new Set(
      this.getFamily("evidence")
        .filter(
          (evidence) =>
            evidence.evidence_kind === "source_assertion" &&
            evidence.assertion_kind === "token_replacement",
        )
        .map((evidence) => evidence.id),
    );
    const unboundApiReplacementAssertions = new Set(
      this.getFamily("evidence")
        .filter(
          (evidence) =>
            evidence.evidence_kind === "source_assertion" &&
            evidence.assertion_kind === "api_replacement",
        )
        .map((evidence) => evidence.id),
    );
    const relationConsumersByEvidence = new Map<string, string[]>();
    for (const relation of this.getFamily("relation")) {
      for (const evidenceRef of relation.source_evidence_refs) {
        const consumers = relationConsumersByEvidence.get(evidenceRef.id) ?? [];
        consumers.push(relation.id);
        relationConsumersByEvidence.set(evidenceRef.id, consumers);
      }
    }
    const replacementRelationsByDeclaration = new Map<string, string[]>();
    const tokenReplacementTargets = new Map<string, Set<string>>();
    const apiReplacementRelationsByDeprecation = new Map<string, string[]>();
    const apiReplacementTargets = new Map<string, Set<string>>();
    const requireExclusiveRelationEvidence = (
      evidenceId: string,
      relationId: string,
      claim: string,
    ): void => {
      const consumers = relationConsumersByEvidence.get(evidenceId) ?? [];
      if (consumers.length !== 1 || consumers[0] !== relationId) {
        throw new Error(
          `${claim} assertion '${evidenceId}' must be consumed by exactly its one relation.`,
        );
      }
    };
    for (const source of this.getFamily("source")) {
      const owner = `source:${source.id}`;
      if (
        source.source_kind === "repository_directory" &&
        source.entrypoint_contexts.length > 0
      ) {
        throw new Error(
          `${owner} cannot attach file import-chain contexts to a directory source.`,
        );
      }
      if (source.source_kind === "repository_file") {
        const sortedContexts = [...source.entrypoint_contexts].sort(
          (left, right) =>
            compareOrdinalStrings(canonicalJson(left), canonicalJson(right)),
        );
        if (
          canonicalJson(sortedContexts) !==
          canonicalJson(source.entrypoint_contexts)
        ) {
          throw new Error(
            `${owner} entrypoint contexts must be unique and canonically sorted.`,
          );
        }
        const contextKeys = new Set<string>();
        for (const context of source.entrypoint_contexts) {
          const contextKey = canonicalJson(context);
          if (contextKeys.has(contextKey)) {
            throw new Error(`${owner} has a duplicate entrypoint context.`);
          }
          contextKeys.add(contextKey);
          if (
            context.import_chain.length === 0 ||
            context.import_chain[0] !== context.entrypoint ||
            context.import_chain.at(-1) !== source.locator
          ) {
            throw new Error(
              `${owner} import chain must start at its entrypoint and end at the source file.`,
            );
          }
          for (const inputPath of [
            context.entrypoint,
            ...context.import_chain,
          ]) {
            if (!inputByPath.has(inputPath)) {
              throw new Error(
                `${owner} import chain references non-inventoried file '${inputPath}'.`,
              );
            }
          }
        }
      }
      switch (source.source_kind) {
        case "repository_file": {
          const input = inputByPath.get(source.locator);
          if (
            !input ||
            !isSemanticCatalogSourcePath(source.locator) ||
            input.sha256 !== source.sha256 ||
            input.bytes !== source.bytes
          ) {
            throw new Error(
              `${owner} does not match its exact manifest input file.`,
            );
          }
          break;
        }
        case "repository_directory": {
          if (inputByPath.has(source.locator)) {
            throw new Error(
              `${owner} is typed as a directory but matches a manifest input file.`,
            );
          }
          const prefix = `${source.locator}/`;
          const entries = this.manifest.inputs.filter(
            (entry) =>
              entry.path.startsWith(prefix) &&
              isSemanticCatalogSourcePath(entry.path),
          );
          if (entries.length === 0) {
            throw new Error(
              `${owner} has no manifest inputs beneath its directory prefix.`,
            );
          }
          const expectedDigest = sha256Bytes(canonicalJson(entries));
          const expectedBytes = entries.reduce(
            (total, entry) => total + entry.bytes,
            0,
          );
          if (
            source.sha256 !== expectedDigest ||
            source.bytes !== expectedBytes
          ) {
            throw new Error(
              `${owner} does not match its manifest input directory inventory.`,
            );
          }
          break;
        }
        case "site_route": {
          const page = this.getRecord("page", source.page_ref.id);
          if (!page || page.route !== source.locator) {
            throw new Error(
              `${owner} route does not match its referenced catalog page.`,
            );
          }
          const expectedBasis = sha256Bytes(
            canonicalJson({
              locator: source.locator,
              page_ref: source.page_ref,
            }),
          );
          if (source.validation.basis_digest !== expectedBasis) {
            throw new Error(
              `${owner} route-resolution basis is not bound to its route and page.`,
            );
          }
          break;
        }
        case "external_https":
          break;
        case "package_source": {
          const packageRecord = this.getRecord(
            "package",
            source.package_ref.id,
          );
          if (
            !packageRecord ||
            (source.version !== null &&
              source.version !== packageRecord.version)
          ) {
            throw new Error(
              `${owner} does not resolve to the declared catalog package version.`,
            );
          }
          const expectedBasis = sha256Bytes(
            canonicalJson({
              package_ref: source.package_ref,
              version: source.version,
            }),
          );
          if (source.validation.basis_digest !== expectedBasis) {
            throw new Error(
              `${owner} package metadata basis is not bound to its package reference.`,
            );
          }
          break;
        }
        case "catalog_record_provenance": {
          const target = this.getRecord(
            source.record_ref.family,
            source.record_ref.id,
          );
          if (!target) {
            throw new Error(
              `${owner} points to unresolved ${catalogReferenceKey(source.record_ref)}.`,
            );
          }
          if (source.field_path !== null) {
            const resolved = resolveCatalogFieldPath(target, source.field_path);
            if (!resolved.found) {
              throw new Error(
                `${owner} points to missing field '${source.field_path}'.`,
              );
            }
            const expectedBasis = sha256Bytes(canonicalJson(resolved.value));
            if (source.basis_digest !== expectedBasis) {
              throw new Error(
                `${owner} field basis does not match '${source.field_path}'.`,
              );
            }
          } else {
            unboundCatalogProvenance.add(source.id);
          }
          break;
        }
      }
    }

    const validatedContent = new Set<string>();
    const validatingContent = new Set<string>();
    const citationSourceKinds = [
      "repository_file",
      "site_route",
      "external_https",
    ] as const;
    const publicSourceKinds = ["site_route", "external_https"] as const;
    const structuralOverviewSourceCache = new Map<string, CatalogReference>();
    const structuralOverviewSource = (
      ownerReference: CatalogReference,
      claim: string,
    ): CatalogReference => {
      if (
        ownerReference.family !== "component" &&
        ownerReference.family !== "pattern" &&
        ownerReference.family !== "guide"
      ) {
        throw new Error(`${claim} has no structural overview owner.`);
      }
      const ownerKey = catalogReferenceKey(ownerReference);
      const cached = structuralOverviewSourceCache.get(ownerKey);
      if (cached) return cached;
      const ownerRecord = this.getRecord(
        ownerReference.family,
        ownerReference.id,
      );
      if (!ownerRecord) {
        throw new Error(`${claim} has an unresolved structural owner.`);
      }
      const detail = this.getContentJson(ownerRecord.detail_content_ref);
      const overview =
        typeof detail === "object" &&
        detail !== null &&
        "related_docs" in detail &&
        typeof detail.related_docs === "object" &&
        detail.related_docs !== null &&
        "overview" in detail.related_docs &&
        typeof detail.related_docs.overview === "string"
          ? detail.related_docs.overview
          : null;
      const page = overview ? pageByRoute.get(overview) : null;
      if (!page) {
        throw new Error(
          `${claim} must resolve through its owner's source-backed overview page.`,
        );
      }
      const overviewLinks = this.getFamily("evidence").filter(
        (
          evidence,
        ): evidence is Extract<
          CatalogRecordForFamily<"evidence">,
          { evidence_kind: "documentation_link" }
        > =>
          evidence.evidence_kind === "documentation_link" &&
          evidence.owner !== null &&
          catalogReferenceKey(evidence.owner) === ownerKey &&
          evidence.label === "overview" &&
          evidence.link_role === "related_doc",
      );
      if (
        overviewLinks.length !== 1 ||
        overviewLinks[0].href !== overview ||
        overviewLinks[0].page_ref?.id !== page.id
      ) {
        throw new Error(
          `${claim} overview detail does not exactly match its published overview evidence.`,
        );
      }
      structuralOverviewSourceCache.set(ownerKey, page.source_ref);
      return page.source_ref;
    };
    const accessibilityDocumentationCache = new Map<
      string,
      CatalogRecordForFamily<"page">
    >();
    const accessibilityDocumentationPage = (
      ownerReference: CatalogReference,
      claim: string,
    ): CatalogRecordForFamily<"page"> => {
      if (
        ownerReference.family !== "component" &&
        ownerReference.family !== "pattern"
      ) {
        throw new Error(
          `${claim} documentation prose has no supported accessibility owner.`,
        );
      }
      const ownerKey = catalogReferenceKey(ownerReference);
      const cached = accessibilityDocumentationCache.get(ownerKey);
      if (cached) return cached;
      const ownerRecord = this.getRecord(
        ownerReference.family,
        ownerReference.id,
      );
      if (!ownerRecord) {
        throw new Error(`${claim} has an unresolved accessibility owner.`);
      }
      const detail = this.getContentJson(ownerRecord.detail_content_ref);
      const relatedDocs =
        typeof detail === "object" &&
        detail !== null &&
        "related_docs" in detail &&
        typeof detail.related_docs === "object" &&
        detail.related_docs !== null
          ? detail.related_docs
          : null;
      const route =
        ownerReference.family === "component"
          ? relatedDocs &&
            "accessibility" in relatedDocs &&
            typeof relatedDocs.accessibility === "string"
            ? relatedDocs.accessibility
            : null
          : relatedDocs &&
              "overview" in relatedDocs &&
              typeof relatedDocs.overview === "string"
            ? relatedDocs.overview
            : null;
      const label =
        ownerReference.family === "component" ? "accessibility" : "overview";
      const page = route ? pageByRoute.get(route) : null;
      if (!page) {
        throw new Error(
          `${claim} must resolve through its owner's exact accessibility documentation page.`,
        );
      }
      const documentationLinks = this.getFamily("evidence").filter(
        (
          evidence,
        ): evidence is Extract<
          CatalogRecordForFamily<"evidence">,
          { evidence_kind: "documentation_link" }
        > =>
          evidence.evidence_kind === "documentation_link" &&
          evidence.owner !== null &&
          catalogReferenceKey(evidence.owner) === ownerKey &&
          evidence.label === label &&
          evidence.link_role === "related_doc",
      );
      if (
        documentationLinks.length !== 1 ||
        documentationLinks[0].href !== route ||
        documentationLinks[0].page_ref?.id !== page.id
      ) {
        throw new Error(
          `${claim} documentation detail does not exactly match its published owner link.`,
        );
      }
      accessibilityDocumentationCache.set(ownerKey, page);
      return page;
    };
    const validateContentReference = (
      reference: CatalogContentReference,
      owner: string,
    ): void => {
      requireReference(reference, owner);
      const key = `${reference.id}\0${reference.codec}`;
      if (validatedContent.has(key)) return;
      if (validatingContent.has(key)) {
        throw new Error(
          `${owner} contains a cyclic content reference '${reference.id}'.`,
        );
      }
      validatingContent.add(key);
      const payload = this.getContentValue(reference);
      const descriptor = catalogContentCodecs[reference.codec];
      for (const nested of descriptor.resolveReferences(payload)) {
        if (nested.family === "source") {
          requireSourceKinds(
            nested as CatalogReference,
            `content:${reference.id}`,
            citationSourceKinds,
          );
        } else {
          requireReference(
            nested as CatalogReference,
            `content:${reference.id}`,
          );
        }
      }
      for (const nested of descriptor.resolveContentReferences(payload)) {
        validateContentReference(
          nested as CatalogContentReference,
          `content:${reference.id}`,
        );
      }
      if (reference.codec === "component_detail") {
        const detail = payload as CatalogPayloadForCodec<"component_detail">;
        for (const requiredImport of detail.implementation_requirements
          ?.required_imports ?? []) {
          requireSourceKinds(
            requiredImport.source_ref,
            `content:${reference.id}.implementation_requirements.required_imports`,
            publicSourceKinds,
          );
        }
      }
      if (reference.codec === "token_usage") {
        const usage = payload as CatalogPayloadForCodec<"token_usage">;
        for (const sourceRef of usage.policy?.docs_refs ?? []) {
          requireSourceKinds(
            sourceRef,
            `content:${reference.id}.policy.docs_refs`,
            publicSourceKinds,
          );
        }
      }
      if (reference.codec === "token_evidence") {
        const tokenEvidence =
          payload as CatalogPayloadForCodec<"token_evidence">;
        for (const evidenceRef of tokenEvidence.evidence_refs) {
          requireTokenPolicyAssertion(
            evidenceRef,
            `content:${reference.id}.evidence_refs`,
          );
        }
      }
      if (reference.codec === "structural_role_rules") {
        const structuralRules =
          payload as CatalogPayloadForCodec<"structural_role_rules">;
        for (const rule of structuralRules.rules) {
          const expectedSourceRefs = new Set<string>();
          for (const evidenceRef of rule.evidence_refs) {
            const evidence = requireTokenPolicyAssertion(
              evidenceRef,
              `content:${reference.id}.rules.${rule.id}.evidence_refs`,
            );
            for (const sourceRef of evidence.source_refs) {
              expectedSourceRefs.add(catalogReferenceKey(sourceRef));
            }
          }
          const actualSourceRefs = new Set(
            rule.source_refs.map(catalogReferenceKey),
          );
          if (
            actualSourceRefs.size !== expectedSourceRefs.size ||
            [...expectedSourceRefs].some(
              (sourceRef) => !actualSourceRefs.has(sourceRef),
            )
          ) {
            throw new Error(
              `content:${reference.id}.rules.${rule.id}.source_refs must exactly derive from its token-policy evidence.`,
            );
          }
        }
      }
      validatingContent.delete(key);
      validatedContent.add(key);
    };

    for (const family of getCatalogRuntimeFamilyNames()) {
      for (const record of this.getFamily(family)) {
        const owner = `${family}:${record.id}`;
        const declaredReferences = resolveCatalogRecordReferences(record);
        const declaredContentReferences =
          resolveCatalogRecordContentReferences(record);
        const discoveredReferences: CatalogReference[] = [];
        const discoveredContentReferences: CatalogContentReference[] = [];
        walkNestedReferences(
          record,
          (reference) => discoveredReferences.push(reference),
          (reference) => discoveredContentReferences.push(reference),
        );
        if (
          canonicalJson(referenceMultiset(discoveredReferences)) !==
            canonicalJson(referenceMultiset(declaredReferences)) ||
          canonicalJson(
            contentReferenceMultiset(discoveredContentReferences),
          ) !==
            canonicalJson(contentReferenceMultiset(declaredContentReferences))
        ) {
          throw new Error(
            `${owner} descriptor reference resolver does not exhaustively match its nested reference fields.`,
          );
        }
        for (const reference of discoveredReferences) {
          requireReference(reference, owner);
        }
        for (const reference of discoveredContentReferences) {
          validateContentReference(reference, owner);
        }
        if (record.family === "component" && record.policy_profile_ref) {
          requirePolicyProfileKinds(
            record.policy_profile_ref,
            `${owner}.policy_profile_ref`,
            ["component_usage"],
          );
        }
        if (record.family === "pattern") {
          requirePolicyProfileKinds(
            record.policy_profile_ref,
            `${owner}.policy_profile_ref`,
            ["pattern_usage"],
          );
        }
        if (record.family === "token") {
          if (record.policy_profile_ref) {
            requirePolicyProfileKinds(
              record.policy_profile_ref,
              `${owner}.policy_profile_ref`,
              ["token_usage", "token_gap"],
            );
          }
          if (record.evidence_profile_ref) {
            requirePolicyProfileKinds(
              record.evidence_profile_ref,
              `${owner}.evidence_profile_ref`,
              ["token_evidence"],
            );
          }
        }
        if (record.family === "api_symbol") {
          const identity = identityForApiSymbol(record, owner);
          const member = identity.member_path[0];
          if (
            member &&
            (identity.symbol_space === "value" ||
              (member.kind === "static_method" &&
                identity.symbol_space !== "type_and_value"))
          ) {
            throw new Error(
              `${owner} member kind is incompatible with its public symbol space.`,
            );
          }
          const expectedId = createApiSymbolId(identity);
          if (record.id !== expectedId) {
            throw new Error(
              `${owner} id does not match its stable public-API identity.`,
            );
          }
        }
        if (record.family === "deprecation") {
          const subject = this.getRecord("api_symbol", record.subject_ref.id);
          if (!subject) {
            throw new Error(
              `${owner} contains unresolved api_symbol:${record.subject_ref.id}.`,
            );
          }
          const subjectIdentity = identityForApiSymbol(
            subject,
            `${owner}.subject_ref`,
          );
          if (
            record.id !== createDeprecationId(subjectIdentity) ||
            catalogReferenceKey(record.package_ref) !==
              catalogReferenceKey(subject.package_ref) ||
            record.name !==
              (subject.member_path.at(-1)?.name ?? subject.export_name)
          ) {
            throw new Error(
              `${owner} does not match its stable public-API subject.`,
            );
          }
          const subjectMember = subject.member_path.at(-1);
          const expectedMemberKind =
            subjectMember === undefined
              ? null
              : subjectMember.kind === "prop"
                ? "prop"
                : "method";
          if (
            expectedMemberKind === null
              ? record.kind === "prop" || record.kind === "method"
              : record.kind !== expectedMemberKind
          ) {
            throw new Error(
              `${owner} kind does not match its stable public-API subject.`,
            );
          }
          if (record.component_ref) {
            const component = this.getRecord(
              "component",
              record.component_ref.id,
            );
            if (
              !component ||
              catalogReferenceKey(component.package_ref) !==
                catalogReferenceKey(record.package_ref)
            ) {
              throw new Error(
                `${owner} component reference belongs to a different package.`,
              );
            }
            if (!component.source_ref) {
              throw new Error(
                `${owner} component reference has no source identity.`,
              );
            }
            const componentSource = requireSourceKinds(
              component.source_ref,
              `${owner}.component_ref`,
              ["repository_file", "repository_directory"],
            );
            const deprecationSourcePaths = record.source_refs.flatMap(
              (sourceRef) => {
                const source = sourceForReference(sourceRef, owner);
                return source.source_kind === "repository_file"
                  ? [source.locator]
                  : [];
              },
            );
            if (subject.member_path.length === 0) {
              if (
                subject.symbol_space === "type" ||
                component.export_name === null ||
                component.export_name !== subject.export_name ||
                componentSource.source_kind !== "repository_file" ||
                !deprecationSourcePaths.includes(componentSource.locator)
              ) {
                throw new Error(
                  `${owner} top-level component reference does not match its public export and exact source identity.`,
                );
              }
            } else {
              const componentSourceRoot =
                componentSource.source_kind === "repository_directory"
                  ? componentSource.locator
                  : path.posix.dirname(componentSource.locator);
              if (
                !deprecationSourcePaths.some(
                  (sourcePath) =>
                    sourcePath === componentSourceRoot ||
                    sourcePath.startsWith(`${componentSourceRoot}/`),
                )
              ) {
                throw new Error(
                  `${owner} member component reference does not share the component source root.`,
                );
              }
              if (subjectMember?.kind === "prop") {
                const componentDetail = this.getContentJson(
                  component.detail_content_ref,
                );
                const exactPropSubject = componentDetail.prop_subjects?.some(
                  (candidate) =>
                    candidate.package === subjectIdentity.package &&
                    candidate.entrypoint === subjectIdentity.entrypoint &&
                    candidate.export_name === subjectIdentity.export_name &&
                    candidate.symbol_space === subjectIdentity.symbol_space &&
                    candidate.member_path.length === 1 &&
                    candidate.member_path[0]?.kind === "prop" &&
                    candidate.member_path[0].name === subjectMember.name,
                );
                if (
                  !exactPropSubject ||
                  !componentDetail.props.some(
                    (prop) => prop.name === subjectMember.name,
                  )
                ) {
                  throw new Error(
                    `${owner} prop component reference does not match an exact public prop subject.`,
                  );
                }
              }
            }
          }
          const detail = this.getContentJson(record.detail_content_ref);
          const targetIds = new Set(
            detail.replacement.target_refs.map(
              (target: CatalogReference) => target.id,
            ),
          );
          const replacementTargets =
            apiReplacementTargets.get(subject.id) ?? new Set<string>();
          for (const targetRef of detail.replacement.target_refs) {
            if (targetRef.id === subject.id) {
              throw new Error(`${owner} cannot replace its own API subject.`);
            }
            const targetSymbol = this.getRecord("api_symbol", targetRef.id);
            if (
              !targetSymbol ||
              !isApiSymbolSpaceReplacementCompatible(
                subject.symbol_space,
                targetSymbol.symbol_space,
              )
            ) {
              throw new Error(
                `${owner} replacement target has an incompatible public type/value symbol space.`,
              );
            }
            replacementTargets.add(targetRef.id);
          }
          apiReplacementTargets.set(subject.id, replacementTargets);
          if (detail.migration.value_map) {
            if (subject.member_path.at(-1)?.kind !== "prop") {
              throw new Error(
                `${owner} value map subject must be a public property.`,
              );
            }
            for (const targetRef of detail.replacement.target_refs) {
              const targetSymbol = this.getRecord("api_symbol", targetRef.id);
              if (
                !targetSymbol ||
                targetSymbol.member_path.at(-1)?.kind !== "prop"
              ) {
                throw new Error(
                  `${owner} value map targets must be public properties.`,
                );
              }
              if (
                catalogReferenceKey(targetSymbol.package_ref) !==
                  catalogReferenceKey(subject.package_ref) ||
                targetSymbol.entrypoint !== subject.entrypoint ||
                targetSymbol.export_name !== subject.export_name
              ) {
                throw new Error(
                  `${owner} value map targets must belong to the deprecated property's public API owner.`,
                );
              }
            }
          }
          for (const valueMapCase of detail.migration.value_map?.cases ?? []) {
            for (const assignment of valueMapCase.set) {
              if (!targetIds.has(assignment.target_ref.id)) {
                throw new Error(
                  `${owner} value map assigns an undeclared replacement target.`,
                );
              }
              const assignmentTarget = this.getRecord(
                "api_symbol",
                assignment.target_ref.id,
              );
              if (
                !assignmentTarget ||
                assignmentTarget.member_path.at(-1)?.kind !== "prop"
              ) {
                throw new Error(
                  `${owner} value map assignments must target public properties.`,
                );
              }
              if (
                catalogReferenceKey(assignmentTarget.package_ref) !==
                  catalogReferenceKey(subject.package_ref) ||
                assignmentTarget.entrypoint !== subject.entrypoint ||
                assignmentTarget.export_name !== subject.export_name
              ) {
                throw new Error(
                  `${owner} value map assignments must belong to the deprecated property's public API owner.`,
                );
              }
            }
          }
        }

        if (record.family === "package") {
          const detail = this.getContentJson(record.detail_content_ref);
          const sourceRoot = requireSourceKinds(
            record.source_root_ref,
            `${owner}.source_root_ref`,
            ["repository_directory"],
          );
          const changelog = record.changelog_source_ref
            ? requireSourceKinds(
                record.changelog_source_ref,
                `${owner}.changelog_source_ref`,
                ["repository_file"],
              )
            : null;
          const docs = record.docs_source_ref
            ? requireSourceKinds(
                record.docs_source_ref,
                `${owner}.docs_source_ref`,
                ["site_route", "external_https"],
              )
            : null;
          if (
            sourceRoot.locator !== detail.source_root ||
            (detail.changelog_path ?? null) !==
              (changelog ? changelog.locator : null) ||
            (detail.docs_root ?? null) !== (docs ? docs.locator : null)
          ) {
            throw new Error(
              `${owner} detail locators do not match typed source references.`,
            );
          }
        }
        if (record.family === "component" && record.source_ref) {
          requireSourceKinds(record.source_ref, `${owner}.source_ref`, [
            "repository_file",
            "repository_directory",
          ]);
          if (record.export_name !== null) {
            requireSourceKinds(record.source_ref, `${owner}.export_name`, [
              "repository_file",
            ]);
          }
        }
        if (record.family === "icon") {
          requireSourceKinds(record.source_ref, `${owner}.source_ref`, [
            "repository_file",
          ]);
        }
        if (record.family === "country_symbol") {
          requireSourceKinds(
            record.variants.circle.source_ref,
            `${owner}.variants.circle.source_ref`,
            ["repository_file"],
          );
          requireSourceKinds(
            record.variants.sharp.source_ref,
            `${owner}.variants.sharp.source_ref`,
            ["repository_file"],
          );
        }
        if (record.family === "page") {
          const detail = this.getContentJson(record.detail_content_ref);
          const source = requireSourceKinds(
            record.source_ref,
            `${owner}.source_ref`,
            ["repository_file"],
          );
          if (source.locator !== detail.source_path) {
            throw new Error(
              `${owner} detail source_path does not match source_ref.`,
            );
          }
        }
        if (record.family === "token_declaration") {
          const source = requireSourceKinds(
            record.source_ref,
            `${owner}.source_ref`,
            ["repository_file"],
          );
          const [
            startOffset,
            endOffset,
            startLine,
            startColumn,
            endLine,
            endColumn,
          ] = record.source_range;
          if (
            startOffset > endOffset ||
            endOffset > source.bytes ||
            endLine < startLine ||
            (endLine === startLine && endColumn < startColumn)
          ) {
            throw new Error(
              `${owner} source range is outside or reverses its bound repository file.`,
            );
          }
        }
        if (record.family === "deprecation") {
          for (const sourceRef of record.source_refs) {
            requireSourceKinds(
              sourceRef,
              `${owner}.source_refs`,
              citationSourceKinds,
            );
          }
          let previousOccurrenceKey: string | null = null;
          for (const occurrence of record.source_occurrences) {
            const source = requireSourceKinds(
              occurrence.source_ref,
              `${owner}.source_occurrences`,
              ["repository_file"],
            );
            const range = occurrence.source_range;
            if (
              range.start_offset > range.end_offset ||
              range.end_offset > source.bytes ||
              range.end_line < range.start_line ||
              (range.end_line === range.start_line &&
                range.end_column < range.start_column)
            ) {
              throw new Error(
                `${owner} source occurrence is outside or reverses its repository file.`,
              );
            }
            const occurrenceKey = `${source.id}\0${range.start_offset
              .toString()
              .padStart(16, "0")}\0${range.end_offset
              .toString()
              .padStart(16, "0")}`;
            if (
              previousOccurrenceKey !== null &&
              compareOrdinalStrings(previousOccurrenceKey, occurrenceKey) >= 0
            ) {
              throw new Error(
                `${owner} source occurrences must be unique and canonically sorted.`,
              );
            }
            previousOccurrenceKey = occurrenceKey;
          }
        }
        if (record.family === "evidence") {
          if (
            record.evidence_kind !== "source_assertion" &&
            record.evidence_kind !== "executable_example" &&
            record.link_role !== "resource" &&
            record.owner_ordinal !== null
          ) {
            throw new Error(
              `${owner} may only publish an owner ordinal for ordered resource evidence.`,
            );
          }
          if (record.evidence_kind === "executable_example") {
            requireSourceKinds(
              record.source_ref,
              `${owner}.source_ref`,
              citationSourceKinds,
            );
          }
          if (record.evidence_kind === "source_assertion") {
            for (const sourceRef of record.source_refs) {
              requireSourceKinds(
                sourceRef,
                `${owner}.source_refs`,
                citationSourceKinds,
              );
            }
          }
          if (record.evidence_kind === "documentation_link") {
            if (record.href.startsWith("/")) {
              const page = record.page_ref
                ? this.getRecord("page", record.page_ref.id)
                : null;
              const expectedBasis = record.page_ref
                ? sha256Bytes(
                    canonicalJson({
                      href: record.href,
                      page_ref: record.page_ref,
                    }),
                  )
                : null;
              if (
                !page ||
                page.route !== record.href ||
                record.validation.state !== "validated" ||
                record.validation.method !== "route_resolved" ||
                record.validation.basis_digest !== expectedBasis
              ) {
                throw new Error(
                  `${owner} documentation route is not bound to its referenced page.`,
                );
              }
            } else if (record.validation.state !== "unvalidated") {
              throw new Error(
                `${owner} cannot claim validation for an unchecked external documentation URL.`,
              );
            }
          }
          if (
            (record.evidence_kind === "external_demo" ||
              record.evidence_kind === "design_reference") &&
            record.validation.state !== "unvalidated"
          ) {
            throw new Error(
              `${owner} cannot claim validation for an unchecked external link.`,
            );
          }
        }
        if (
          record.family === "relation" &&
          (record.relation_kind === "observed_in_example" ||
            record.relation_kind === "export_observed_in_example")
        ) {
          for (const evidenceRef of record.source_evidence_refs) {
            const evidence = this.getRecord("evidence", evidenceRef.id);
            if (evidence?.evidence_kind !== "executable_example") {
              throw new Error(
                `${owner} observation evidence must be executable.`,
              );
            }
            if (
              evidence.owner.family !== record.source.family ||
              evidence.owner.id !== record.source.id
            ) {
              throw new Error(
                `${owner} observation evidence owner does not match the relation source.`,
              );
            }
          }
        }
        if (
          record.family === "relation" &&
          (record.relation_kind === "exported_from" ||
            record.relation_kind === "export_observed_in_example")
        ) {
          requireSourceKinds(record.target, `${owner}.target`, [
            "repository_file",
          ]);
        }
        if (
          record.family === "relation" &&
          (record.relation_kind === "composes" ||
            record.relation_kind === "related_to" ||
            record.relation_kind === "documents")
        ) {
          if (record.source_evidence_refs.length !== 1) {
            throw new Error(
              `${owner} structural relation must bind exactly one source assertion.`,
            );
          }
          const evidence = this.getRecord(
            "evidence",
            record.source_evidence_refs[0].id,
          );
          if (
            !evidence ||
            evidence.evidence_kind !== "source_assertion" ||
            evidence.assertion_kind !== "structural_relation"
          ) {
            throw new Error(
              `${owner} structural relation must cite structural-relation source evidence.`,
            );
          }
          if (
            catalogReferenceKey(evidence.owner) !==
            catalogReferenceKey(record.source)
          ) {
            throw new Error(
              `${owner} structural assertion owner does not match its relation source.`,
            );
          }
          const expectedSourceField =
            record.relation_kind === "composes"
              ? "data.components"
              : record.relation_kind === "related_to"
                ? record.source.family === "component"
                  ? "component.patterns"
                  : "pattern.related_patterns"
                : record.target.family === "package"
                  ? "guide.related_docs.related_packages"
                  : "guide.related_docs.related_components";
          const target = this.getRecord(record.target.family, record.target.id);
          if (!target) {
            throw new Error(
              `${owner} structural assertion target does not resolve.`,
            );
          }
          const expectedRoleSourceField =
            record.role === null
              ? null
              : `mcp.catalogEditorialOverrides.componentRoles[${JSON.stringify(target.name)}]`;
          const detail = this.getContentJson(evidence.detail_content_ref);
          const expectedDetail = {
            relation_kind: record.relation_kind,
            source: record.source,
            target: record.target,
            provenance: record.provenance,
            role: record.role,
            source_ordinal: record.source_ordinal,
            source_field: expectedSourceField,
            role_source_field: expectedRoleSourceField,
          };
          if (canonicalJson(detail) !== canonicalJson(expectedDetail)) {
            throw new Error(
              `${owner} structural assertion payload does not exactly match the relation and its source field.`,
            );
          }
          requireSourceKinds(
            evidence.source_refs[0],
            `${owner}.source_evidence_refs`,
            ["repository_file"],
          );
          const expectedOverviewSource = structuralOverviewSource(
            record.source,
            owner,
          );
          if (
            catalogReferenceKey(evidence.source_refs[0]) !==
            catalogReferenceKey(expectedOverviewSource)
          ) {
            throw new Error(
              `${owner} structural assertion does not bind its owner's overview source.`,
            );
          }
          requireExclusiveRelationEvidence(
            evidence.id,
            record.id,
            `${owner} structural`,
          );
          if (!unboundStructuralRelationAssertions.delete(evidence.id)) {
            throw new Error(
              `${owner} structural assertion '${evidence.id}' is bound to more than one relation.`,
            );
          }
        }
        if (
          record.family === "relation" &&
          record.relation_kind === "replaced_by"
        ) {
          const evidence = this.getRecord(
            "evidence",
            record.source_evidence_refs[0].id,
          );
          if (record.source.family === "token_declaration") {
            const declaration = this.getRecord(
              "token_declaration",
              record.source.id,
            );
            if (
              record.target.family !== "token" ||
              !declaration ||
              !evidence ||
              evidence.evidence_kind !== "source_assertion" ||
              evidence.assertion_kind !== "token_replacement"
            ) {
              throw new Error(
                `${owner} token replacement must cite a token-replacement source assertion.`,
              );
            }
            if (
              catalogReferenceKey(evidence.owner) !==
                catalogReferenceKey(record.source) ||
              !declaration.replacement_token_ref ||
              catalogReferenceKey(declaration.replacement_token_ref) !==
                catalogReferenceKey(record.target) ||
              catalogReferenceKey(declaration.token_ref) ===
                catalogReferenceKey(record.target)
            ) {
              throw new Error(
                `${owner} token replacement does not match its declaration.`,
              );
            }
            const detail = this.getContentJson(evidence.detail_content_ref);
            if (
              canonicalJson(detail) !==
              canonicalJson({
                source: record.source,
                target: record.target,
              })
            ) {
              throw new Error(
                `${owner} token-replacement assertion payload does not exactly match the relation.`,
              );
            }
            if (
              evidence.source_refs.length !== 1 ||
              catalogReferenceKey(evidence.source_refs[0]) !==
                catalogReferenceKey(declaration.source_ref)
            ) {
              throw new Error(
                `${owner} token-replacement assertion does not bind its declaration source.`,
              );
            }
            requireSourceKinds(
              evidence.source_refs[0],
              `${owner}.source_evidence_refs`,
              ["repository_file"],
            );
            requireExclusiveRelationEvidence(
              evidence.id,
              record.id,
              `${owner} token-replacement`,
            );
            if (!unboundTokenReplacementAssertions.delete(evidence.id)) {
              throw new Error(
                `${owner} token-replacement assertion '${evidence.id}' is bound to more than one relation.`,
              );
            }
            const declarationRelations =
              replacementRelationsByDeclaration.get(declaration.id) ?? [];
            declarationRelations.push(record.id);
            replacementRelationsByDeclaration.set(
              declaration.id,
              declarationRelations,
            );
            const targets =
              tokenReplacementTargets.get(declaration.token_ref.id) ??
              new Set<string>();
            targets.add(record.target.id);
            tokenReplacementTargets.set(declaration.token_ref.id, targets);
          } else if (record.source.family === "token") {
            if (record.target.family !== "token") {
              throw new Error(
                `${owner} curated token replacement must target a token.`,
              );
            }
            if (record.source.id === record.target.id) {
              throw new Error(
                `${owner} token replacement cannot target itself.`,
              );
            }
            for (const evidenceRef of record.source_evidence_refs) {
              const curatedEvidence = this.getRecord(
                "evidence",
                evidenceRef.id,
              );
              if (
                !curatedEvidence ||
                curatedEvidence.evidence_kind !== "source_assertion" ||
                curatedEvidence.assertion_kind !== "token_replacement" ||
                curatedEvidence.owner.family !== "token" ||
                catalogReferenceKey(curatedEvidence.owner) !==
                  catalogReferenceKey(record.source)
              ) {
                throw new Error(
                  `${owner} curated token replacement must cite token-owned replacement assertions.`,
                );
              }
              if (curatedEvidence.source_refs.length !== 1) {
                throw new Error(
                  `${owner} curated token-replacement assertion must cite exactly one source.`,
                );
              }
              requireSourceKinds(
                curatedEvidence.source_refs[0],
                `${owner}.source_evidence_refs`,
                ["repository_file"],
              );
              const sourceRecord = this.getRecord(
                "source",
                curatedEvidence.source_refs[0].id,
              );
              const detail = this.getContentJson(
                curatedEvidence.detail_content_ref,
              );
              if (
                !("source_kind" in detail) ||
                catalogReferenceKey(detail.source) !==
                  catalogReferenceKey(record.source) ||
                catalogReferenceKey(detail.target) !==
                  catalogReferenceKey(record.target) ||
                !sourceRecord ||
                (sourceRecord.source_kind !== "repository_file" &&
                  sourceRecord.source_kind !== "repository_directory") ||
                sourceRecord.locator !== detail.source_path
              ) {
                throw new Error(
                  `${owner} curated token-replacement assertion does not match its relation and repository source.`,
                );
              }
              requireExclusiveRelationEvidence(
                curatedEvidence.id,
                record.id,
                `${owner} curated token-replacement`,
              );
              if (
                !unboundTokenReplacementAssertions.delete(curatedEvidence.id)
              ) {
                throw new Error(
                  `${owner} token-replacement assertion '${curatedEvidence.id}' is bound to more than one relation.`,
                );
              }
            }
            const targets =
              tokenReplacementTargets.get(record.source.id) ??
              new Set<string>();
            targets.add(record.target.id);
            tokenReplacementTargets.set(record.source.id, targets);
          } else {
            if (
              record.target.family !== "api_symbol" ||
              !evidence ||
              evidence.evidence_kind !== "source_assertion" ||
              evidence.assertion_kind !== "api_replacement"
            ) {
              throw new Error(
                `${owner} API replacement must cite an API-replacement source assertion.`,
              );
            }
            const deprecation = this.getRecord(
              "deprecation",
              evidence.owner.id,
            );
            if (!deprecation) {
              throw new Error(
                `${owner} API-replacement assertion has no deprecation owner.`,
              );
            }
            const deprecationDetail = this.getContentJson(
              deprecation.detail_content_ref,
            );
            if (
              catalogReferenceKey(deprecation.subject_ref) !==
                catalogReferenceKey(record.source) ||
              deprecationDetail.replacement.mode !== "single" ||
              !deprecationDetail.replacement.target_ref ||
              catalogReferenceKey(deprecationDetail.replacement.target_ref) !==
                catalogReferenceKey(record.target) ||
              catalogReferenceKey(record.source) ===
                catalogReferenceKey(record.target)
            ) {
              throw new Error(
                `${owner} API replacement does not match its deprecation detail.`,
              );
            }
            const assertionDetail = this.getContentJson(
              evidence.detail_content_ref,
            );
            const expectedAssertionDetail = {
              deprecation_ref: evidence.owner,
              source: record.source,
              target: record.target,
              source_occurrences: deprecation.source_occurrences,
            };
            if (
              canonicalJson(assertionDetail) !==
              canonicalJson(expectedAssertionDetail)
            ) {
              throw new Error(
                `${owner} API-replacement assertion payload does not exactly match its deprecation and relation.`,
              );
            }
            const expectedSourceRefs = [
              ...new Map(
                deprecation.source_occurrences.map((occurrence) => [
                  occurrence.source_ref.id,
                  occurrence.source_ref,
                ]),
              ).values(),
            ];
            if (
              canonicalJson(evidence.source_refs) !==
              canonicalJson(expectedSourceRefs)
            ) {
              throw new Error(
                `${owner} API-replacement assertion does not bind its deprecation sources.`,
              );
            }
            for (const sourceRef of evidence.source_refs) {
              requireSourceKinds(sourceRef, `${owner}.source_evidence_refs`, [
                "repository_file",
              ]);
            }
            requireExclusiveRelationEvidence(
              evidence.id,
              record.id,
              `${owner} API-replacement`,
            );
            if (!unboundApiReplacementAssertions.delete(evidence.id)) {
              throw new Error(
                `${owner} API-replacement assertion '${evidence.id}' is bound to more than one relation.`,
              );
            }
            const deprecationRelations =
              apiReplacementRelationsByDeprecation.get(deprecation.id) ?? [];
            deprecationRelations.push(record.id);
            apiReplacementRelationsByDeprecation.set(
              deprecation.id,
              deprecationRelations,
            );
          }
        }
        if (
          record.family === "evidence" &&
          record.evidence_kind === "source_assertion" &&
          record.validation.state !== "unvalidated"
        ) {
          throw new Error(
            `${owner} cannot claim semantic validation from source identity alone.`,
          );
        }
        if (record.family === "accessibility_claim") {
          const isDocumentationProse =
            record.source_field === "accessibility.summary" ||
            record.source_field === "accessibility.rules";
          if (isDocumentationProse) {
            if (
              record.classification !== "guidance" ||
              record.normativity !== "descriptive"
            ) {
              throw new Error(
                `${owner} documentation prose must remain descriptive accessibility guidance.`,
              );
            }
            if (record.provenance.length !== 1) {
              throw new Error(
                `${owner} documentation prose must bind exactly one owner documentation source.`,
              );
            }
            const provenance = record.provenance[0];
            const page = accessibilityDocumentationPage(record.owner, owner);
            if (
              provenance.reference.family !== "source" ||
              provenance.reference.id !== page.source_ref.id ||
              provenance.supports.length !== 2 ||
              !provenance.supports.includes("statement") ||
              !provenance.supports.includes("classification") ||
              provenance.source_range !== null ||
              provenance.content_digest !== null
            ) {
              throw new Error(
                `${owner} documentation provenance must bind its exact owner page without claiming an unverified source span or digest.`,
              );
            }
            requireSourceKinds(provenance.reference, `${owner}.provenance`, [
              "repository_file",
            ]);
            const statement = normalizeAccessibilityDocumentationText(
              this.getContentText(record.statement_content_ref),
            );
            const pageBody = normalizeAccessibilityDocumentationText(
              this.getContentJson(page.body_content_ref).join("\n"),
            );
            if (statement.length === 0 || !pageBody.includes(statement)) {
              throw new Error(
                `${owner} statement ${JSON.stringify(statement)} does not occur in its exact owner documentation page '${page.route}'.`,
              );
            }
          }
          if (record.source_field === "accessibility.implementation_signals") {
            if (
              record.classification !== "fact" ||
              record.normativity !== "descriptive"
            ) {
              throw new Error(
                `${owner} implementation signal must be a descriptive accessibility fact.`,
              );
            }
            const evidenceProvenance = record.provenance.filter(
              (provenance) => provenance.reference.family === "evidence",
            );
            if (
              record.provenance.length !== 1 ||
              evidenceProvenance.length !== 1
            ) {
              throw new Error(
                `${owner} implementation signal must bind exactly one evidence assertion.`,
              );
            }
            const provenance = evidenceProvenance[0];
            const evidence = this.getRecord(
              "evidence",
              provenance.reference.id,
            );
            if (
              !evidence ||
              evidence.evidence_kind !== "source_assertion" ||
              evidence.assertion_kind !== "accessibility_implementation_signal"
            ) {
              throw new Error(
                `${owner} implementation signal must bind an accessibility implementation assertion.`,
              );
            }
            if (
              evidence.owner.family !== record.owner.family ||
              evidence.owner.id !== record.owner.id
            ) {
              throw new Error(
                `${owner} implementation assertion owner does not match its claim owner.`,
              );
            }
            if (
              evidence.source_refs.length !== 1 ||
              provenance.supports.length !== 2 ||
              !provenance.supports.includes("statement") ||
              !provenance.supports.includes("classification")
            ) {
              throw new Error(
                `${owner} implementation assertion must bind one source and support its statement and classification.`,
              );
            }
            const signal = this.getContentJson(evidence.detail_content_ref);
            const statement = this.getContentText(record.statement_content_ref);
            if (
              statement !==
              formatAccessibilityImplementationSignalStatement(signal)
            ) {
              throw new Error(
                `${owner} implementation statement does not match its assertion payload.`,
              );
            }
            if (!unboundAccessibilityAssertions.has(evidence.id)) {
              throw new Error(
                `${owner} implementation assertion '${evidence.id}' is bound to more than one claim.`,
              );
            }
            unboundAccessibilityAssertions.delete(evidence.id);
          }
          for (const provenance of record.provenance) {
            if (
              provenance.content_digest !== null &&
              provenance.content_digest !== record.statement_content_ref.id
            ) {
              throw new Error(
                `${owner} provenance content digest does not bind its statement content.`,
              );
            }
            if (provenance.source_range !== null) {
              let rangeSource: CatalogRecordForFamily<"source">;
              if (provenance.reference.family === "source") {
                rangeSource = sourceForReference(
                  provenance.reference,
                  `${owner}.provenance.source_range`,
                );
              } else {
                const evidence = this.getRecord(
                  "evidence",
                  provenance.reference.id,
                );
                const sourceRef =
                  evidence?.evidence_kind === "executable_example"
                    ? evidence.source_ref
                    : evidence?.evidence_kind === "source_assertion" &&
                        evidence.source_refs.length === 1
                      ? evidence.source_refs[0]
                      : null;
                if (!sourceRef) {
                  throw new Error(
                    `${owner} source range does not resolve through exactly one evidence source.`,
                  );
                }
                rangeSource = sourceForReference(
                  sourceRef,
                  `${owner}.provenance.source_range`,
                );
              }
              const range = provenance.source_range;
              if (
                rangeSource.source_kind !== "repository_file" ||
                range.start_offset > range.end_offset ||
                range.end_offset > rangeSource.bytes ||
                range.end_line < range.start_line ||
                (range.end_line === range.start_line &&
                  range.end_column < range.start_column)
              ) {
                throw new Error(
                  `${owner} provenance source range is not ordered within one repository file.`,
                );
              }
            }
            if (provenance.reference.family !== "source") continue;
            const source = sourceForReference(provenance.reference, owner);
            if (source.source_kind === "catalog_record_provenance") {
              if (
                source.record_ref.family !== record.owner.family ||
                source.record_ref.id !== record.owner.id ||
                source.field_path !== null ||
                source.basis_digest !== record.statement_content_ref.id ||
                provenance.content_digest !== record.statement_content_ref.id
              ) {
                throw new Error(
                  `${owner} catalog provenance does not bind its owner and statement content.`,
                );
              }
              unboundCatalogProvenance.delete(source.id);
            } else if (
              !citationSourceKinds.some(
                (sourceKind) => sourceKind === source.source_kind,
              )
            ) {
              throw new Error(
                `${owner} cannot use ${source.source_kind} as accessibility provenance.`,
              );
            }
          }
        }
      }
    }
    const deprecationIdsByComponentId = new Map<string, string[]>();
    for (const deprecation of this.getFamily("deprecation")) {
      if (!deprecation.component_ref) continue;
      const deprecationIds =
        deprecationIdsByComponentId.get(deprecation.component_ref.id) ?? [];
      deprecationIds.push(deprecation.id);
      deprecationIdsByComponentId.set(
        deprecation.component_ref.id,
        deprecationIds,
      );
    }
    for (const component of this.getFamily("component")) {
      const detail = this.getContentJson(component.detail_content_ref);
      const expectedDeprecationIds = [
        ...(deprecationIdsByComponentId.get(component.id) ?? []),
      ].sort(compareOrdinalStrings);
      const actualDeprecationIds = [...detail.deprecations].sort(
        compareOrdinalStrings,
      );
      if (
        canonicalJson(actualDeprecationIds) !==
        canonicalJson(expectedDeprecationIds)
      ) {
        throw new Error(
          `component:${component.id} detail deprecations do not exactly match deprecation component references.`,
        );
      }
    }
    for (const declaration of this.getFamily("token_declaration")) {
      const relationIds =
        replacementRelationsByDeclaration.get(declaration.id) ?? [];
      const expectedRelationCount = declaration.replacement_token_ref ? 1 : 0;
      if (relationIds.length !== expectedRelationCount) {
        throw new Error(
          `token_declaration:${declaration.id} must bind exactly ${expectedRelationCount} token-replacement relation(s); received ${relationIds.length}.`,
        );
      }
    }
    for (const token of this.getFamily("token")) {
      const actualTargets = [
        ...(tokenReplacementTargets.get(token.id) ?? new Set<string>()),
      ].sort(compareOrdinalStrings);
      const expectedTargets = token.replacement_token_refs
        .map((reference) => reference.id)
        .sort(compareOrdinalStrings);
      if (canonicalJson(actualTargets) !== canonicalJson(expectedTargets)) {
        throw new Error(
          `token:${token.id} replacement references do not exactly match validated replacement relations.`,
        );
      }
    }
    for (const deprecation of this.getFamily("deprecation")) {
      const detail = this.getContentJson(deprecation.detail_content_ref);
      const relationIds =
        apiReplacementRelationsByDeprecation.get(deprecation.id) ?? [];
      const expectedRelationCount =
        detail.replacement.mode === "single" ? 1 : 0;
      if (relationIds.length !== expectedRelationCount) {
        throw new Error(
          `deprecation:${deprecation.id} must bind exactly ${expectedRelationCount} API-replacement relation(s); received ${relationIds.length}.`,
        );
      }
    }
    const replacementVisitState = new Map<string, "visiting" | "visited">();
    const visitTokenReplacement = (tokenId: string): void => {
      const state = replacementVisitState.get(tokenId);
      if (state === "visiting") {
        throw new Error(
          `Token replacement graph contains a cycle through token:${tokenId}.`,
        );
      }
      if (state === "visited") return;
      replacementVisitState.set(tokenId, "visiting");
      for (const targetId of tokenReplacementTargets.get(tokenId) ?? []) {
        visitTokenReplacement(targetId);
      }
      replacementVisitState.set(tokenId, "visited");
    };
    for (const tokenId of tokenReplacementTargets.keys()) {
      visitTokenReplacement(tokenId);
    }
    const apiReplacementVisitState = new Map<string, "visiting" | "visited">();
    const visitApiReplacement = (symbolId: string): void => {
      const state = apiReplacementVisitState.get(symbolId);
      if (state === "visiting") {
        throw new Error(
          `API replacement graph contains a cycle through api_symbol:${symbolId}.`,
        );
      }
      if (state === "visited") return;
      apiReplacementVisitState.set(symbolId, "visiting");
      for (const targetId of apiReplacementTargets.get(symbolId) ?? []) {
        visitApiReplacement(targetId);
      }
      apiReplacementVisitState.set(symbolId, "visited");
    };
    for (const symbolId of apiReplacementTargets.keys()) {
      visitApiReplacement(symbolId);
    }
    for (const contentRecord of this.getFamily("content")) {
      validateContentReference(
        {
          family: "content",
          id: contentRecord.id,
          codec: contentRecord.codec,
        },
        `content:${contentRecord.id}`,
      );
    }
    if (unboundCatalogProvenance.size > 0) {
      throw new Error(
        `Catalog provenance sources are not bound to accessibility statement content: ${[
          ...unboundCatalogProvenance,
        ]
          .sort(compareOrdinalStrings)
          .join(", ")}.`,
      );
    }
    if (unboundAccessibilityAssertions.size > 0) {
      throw new Error(
        `Accessibility implementation assertions are not bound to exactly one claim: ${[
          ...unboundAccessibilityAssertions,
        ]
          .sort(compareOrdinalStrings)
          .join(", ")}.`,
      );
    }
    if (unboundStructuralRelationAssertions.size > 0) {
      throw new Error(
        `Structural-relation assertions are not bound to exactly one relation: ${[
          ...unboundStructuralRelationAssertions,
        ]
          .sort(compareOrdinalStrings)
          .join(", ")}.`,
      );
    }
    if (unboundTokenReplacementAssertions.size > 0) {
      throw new Error(
        `Token-replacement assertions are not bound to exactly one relation: ${[
          ...unboundTokenReplacementAssertions,
        ]
          .sort(compareOrdinalStrings)
          .join(", ")}.`,
      );
    }
    if (unboundApiReplacementAssertions.size > 0) {
      throw new Error(
        `API-replacement assertions are not bound to exactly one relation: ${[
          ...unboundApiReplacementAssertions,
        ]
          .sort(compareOrdinalStrings)
          .join(", ")}.`,
      );
    }

    const orderedRelationsByKindAndSource = new Map<
      string,
      Array<{ id: string; ordinal: number }>
    >();
    const exportOriginByPackageAndName = new Map<
      string,
      { locator: string; claim: string }
    >();
    const registerExportOrigin = (
      packageRef: CatalogReference,
      exportName: string,
      sourceRef: CatalogReference,
      claim: string,
    ): void => {
      const source = requireSourceKinds(sourceRef, claim, ["repository_file"]);
      const key = `${packageRef.id}\0${exportName}`;
      const previous = exportOriginByPackageAndName.get(key);
      if (previous && previous.locator !== source.locator) {
        throw new Error(
          `Package '${packageRef.id}' export '${exportName}' has conflicting source origins '${previous.locator}' (${previous.claim}) and '${source.locator}' (${claim}).`,
        );
      }
      exportOriginByPackageAndName.set(key, {
        locator: source.locator,
        claim,
      });
    };
    const packageForExportOwner = (
      owner: CatalogReference,
      claim: string,
    ): CatalogReference => {
      switch (owner.family) {
        case "component": {
          const record = this.getRecord("component", owner.id);
          if (record) return record.package_ref;
          break;
        }
        case "icon": {
          const record = this.getRecord("icon", owner.id);
          if (record) return record.package_ref;
          break;
        }
        case "country_symbol": {
          const record = this.getRecord("country_symbol", owner.id);
          if (record) return record.package_ref;
          break;
        }
      }
      throw new Error(`${claim} has no package-owning export source.`);
    };
    for (const component of this.getFamily("component")) {
      if (component.export_name && component.source_ref) {
        registerExportOrigin(
          component.package_ref,
          component.export_name,
          component.source_ref,
          `component:${component.id}.export_name`,
        );
      }
    }
    for (const icon of this.getFamily("icon")) {
      registerExportOrigin(
        icon.package_ref,
        icon.export_name,
        icon.source_ref,
        `icon:${icon.id}.export_name`,
      );
    }
    for (const symbol of this.getFamily("country_symbol")) {
      registerExportOrigin(
        symbol.package_ref,
        symbol.variants.circle.export_name,
        symbol.variants.circle.source_ref,
        `country_symbol:${symbol.id}.variants.circle`,
      );
      registerExportOrigin(
        symbol.package_ref,
        symbol.variants.sharp.export_name,
        symbol.variants.sharp.source_ref,
        `country_symbol:${symbol.id}.variants.sharp`,
      );
    }
    for (const relation of this.getFamily("relation")) {
      if (
        relation.relation_kind === "related_to" ||
        relation.relation_kind === "composes" ||
        relation.relation_kind === "documents"
      ) {
        const sourceKey = catalogReferenceKey(relation.source);
        const sourceField =
          relation.relation_kind === "composes"
            ? "data.components"
            : relation.relation_kind === "related_to"
              ? relation.source.family === "component"
                ? "component.patterns"
                : "pattern.related_patterns"
              : relation.target.family === "package"
                ? "guide.related_docs.related_packages"
                : "guide.related_docs.related_components";
        const key = `${relation.relation_kind}\0${sourceKey}\0${sourceField}`;
        const entries = orderedRelationsByKindAndSource.get(key) ?? [];
        entries.push({ id: relation.id, ordinal: relation.source_ordinal });
        orderedRelationsByKindAndSource.set(key, entries);
      }
      if (
        relation.relation_kind === "exported_from" ||
        relation.relation_kind === "export_observed_in_example"
      ) {
        registerExportOrigin(
          packageForExportOwner(
            relation.source,
            `relation:${relation.id}.source`,
          ),
          relation.role.slice("export:".length),
          relation.target,
          `relation:${relation.id}.target`,
        );
      }
    }
    for (const [
      relationAndSourceKey,
      entries,
    ] of orderedRelationsByKindAndSource) {
      validateContiguousOrdinals(
        entries,
        `Catalog ordered relations for ${relationAndSourceKey}`,
      );
    }
    for (const guide of this.getFamily("guide")) {
      const ownerKey = catalogReferenceKey({
        family: "guide",
        id: guide.id,
      });
      const documentedPackageRefs = this.getFamily("relation")
        .filter(
          (
            relation,
          ): relation is Extract<
            CatalogRecordForFamily<"relation">,
            { relation_kind: "documents" }
          > =>
            relation.relation_kind === "documents" &&
            relation.target.family === "package" &&
            catalogReferenceKey(relation.source) === ownerKey,
        )
        .sort(
          (left, right) =>
            left.source_ordinal - right.source_ordinal ||
            compareOrdinalStrings(left.id, right.id),
        )
        .map((relation) => relation.target);
      const documentedEntityRefs = this.getFamily("relation")
        .filter(
          (
            relation,
          ): relation is Extract<
            CatalogRecordForFamily<"relation">,
            { relation_kind: "documents" }
          > =>
            relation.relation_kind === "documents" &&
            relation.target.family !== "package" &&
            catalogReferenceKey(relation.source) === ownerKey,
        )
        .sort(
          (left, right) =>
            left.source_ordinal - right.source_ordinal ||
            compareOrdinalStrings(left.id, right.id),
        )
        .map((relation) => relation.target);
      if (
        canonicalJson(documentedPackageRefs) !==
        canonicalJson(guide.package_refs)
      ) {
        throw new Error(
          `guide:${guide.id} package facts do not exactly match package document relations.`,
        );
      }
      if (
        canonicalJson(documentedEntityRefs) !==
        canonicalJson(guide.documented_entity_refs)
      ) {
        throw new Error(
          `guide:${guide.id} component and pattern facts do not exactly match document relations.`,
        );
      }
    }

    const resourceEvidenceByOwner = new Map<
      string,
      Array<{ id: string; ordinal: number }>
    >();
    for (const evidence of this.getFamily("evidence")) {
      if (
        evidence.evidence_kind === "source_assertion" ||
        evidence.evidence_kind === "executable_example" ||
        evidence.link_role !== "resource"
      ) {
        continue;
      }
      if (
        !evidence.owner ||
        evidence.owner.family !== "pattern" ||
        evidence.owner_ordinal === null
      ) {
        throw new Error(
          `Catalog resource evidence '${evidence.id}' requires a pattern owner and ordinal.`,
        );
      }
      const ownerKey = catalogReferenceKey(evidence.owner);
      const entries = resourceEvidenceByOwner.get(ownerKey) ?? [];
      entries.push({ id: evidence.id, ordinal: evidence.owner_ordinal });
      resourceEvidenceByOwner.set(ownerKey, entries);
    }
    for (const [ownerKey, entries] of resourceEvidenceByOwner) {
      validateContiguousOrdinals(
        entries,
        `Catalog resource evidence for ${ownerKey}`,
      );
    }

    const structuralRoleProfiles = this.getFamily("policy_profile").filter(
      (profile) => profile.policy_kind === "structural_role_rules",
    );
    if (structuralRoleProfiles.length > 1) {
      throw new Error(
        "Catalog must publish at most one structural-role policy profile.",
      );
    }
    for (const profile of structuralRoleProfiles) {
      const payload = this.getContentJson(profile.body_content_ref);
      for (const rule of payload.rules) {
        for (const sourceRef of rule.source_refs) {
          requireSourceKinds(
            sourceRef,
            `policy_profile:${profile.id}.rules.${rule.id}.source_refs`,
            citationSourceKinds,
          );
        }
      }
    }

    const expectedSearch = new Map<string, unknown>();
    for (const family of CATALOG_SEARCH_TARGET_FAMILY_NAMES) {
      for (const record of this.getFamily(family)) {
        const searchDocument = createCatalogSearchDocument(record);
        if (!searchDocument) {
          throw new Error(
            `Searchable catalog family '${family}' did not produce a search document for '${record.id}'.`,
          );
        }
        expectedSearch.set(searchDocument.id, searchDocument);
      }
    }
    const actualSearch = this.getFamily("search_document");
    if (
      actualSearch.length !== expectedSearch.size ||
      actualSearch.some(
        (record) =>
          canonicalJson(record) !==
          canonicalJson(expectedSearch.get(record.id)),
      )
    ) {
      throw new Error(
        "Catalog search documents do not match descriptor-derived indexing.",
      );
    }

    const familyRecordCounts = Object.fromEntries(
      CATALOG_FAMILY_NAMES.map((family) => [
        family,
        (isCatalogRuntimeFamilyName(family)
          ? this.familyCache.get(family)?.length
          : this.verifiedBuildArtifactRecordCounts.get(family)) ?? 0,
      ]),
    ) as Record<CatalogFamilyName, number>;
    const searchEntry = this.artifactByFamily.get("search_document");
    const tokenOwnedArtifactBytes =
      measureTokenOwnedCatalogSurface(this).bytes.total;
    return {
      familyRecordCounts,
      contentBytes: this.getSupportEntry("content_pack").bytes,
      searchArtifactBytes: searchEntry?.bytes ?? 0,
      tokenOwnedArtifactBytes,
    };
  }
}

export function createCatalogStoreV2(
  options: CatalogStoreV2Options,
): CatalogStoreV2 {
  return new CatalogStoreV2(options);
}
