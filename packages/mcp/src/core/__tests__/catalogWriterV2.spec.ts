import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CatalogInputInventory } from "../build/catalogInputInventory.js";
import { withCatalogInputTracking } from "../build/catalogInputInventory.js";
import { writeCatalogV2 } from "../build/catalogWriterV2.js";
import type {
  CatalogContentBlob,
  NormalizedCatalogV2,
} from "../build/normalizeCatalogV2.js";
import {
  type CatalogContentCodecName,
  type CatalogContentReference,
  type CatalogPayloadForCodec,
  catalogContentCodecs,
  parseCatalogContentPayload,
} from "../catalog/catalogPayloadSchemaV2.js";
import {
  CATALOG_FAMILY_NAMES,
  CATALOG_SEARCH_TARGET_FAMILY_NAMES,
  type CatalogFamilyName,
  type CatalogManifest,
  type CatalogRecord,
  type CatalogRecordForFamily,
  catalogFamilies,
  catalogManifestCodec,
  catalogPackageFilesCodec,
  catalogPublicationCodec,
  createCatalogSearchDocument,
  SALT_CATALOG_MANIFEST_FILE,
  SALT_CATALOG_PACKAGE_FILES_FILE,
} from "../catalog/catalogSchemaV2.js";
import {
  canonicalJson,
  canonicalJsonFile,
  sha256Bytes,
} from "../catalog/catalogSerialization.js";
import { CatalogStoreV2 } from "../catalog/catalogStoreV2.js";
import { measureTokenOwnedCatalogSurface } from "../catalog/catalogTokenSurfaceV2.js";
import { MAX_PUBLIC_RESOURCE_UTF8_BYTES } from "../publicResourceBudget.js";

const temporaryDirectories: string[] = [];

function createNormalizedCatalog(): NormalizedCatalogV2 {
  return {
    records: Object.fromEntries(
      CATALOG_FAMILY_NAMES.map((family) => [family, []]),
    ) as unknown as Record<CatalogFamilyName, CatalogRecord[]>,
    contentBlobs: new Map(),
  };
}

function addCatalogContent<Codec extends CatalogContentCodecName>(
  normalized: NormalizedCatalogV2,
  codec: Codec,
  value: CatalogPayloadForCodec<Codec>,
): CatalogContentReference<Codec> {
  const parsed = parseCatalogContentPayload(codec, value);
  const mediaType = catalogContentCodecs[codec].mediaType;
  const serialized =
    typeof parsed === "string" ? parsed : canonicalJson(parsed);
  const bytes = Buffer.from(serialized, "utf8");
  const id = sha256Bytes(
    Buffer.concat([Buffer.from(`${mediaType}\0`, "utf8"), bytes]),
  );
  normalized.contentBlobs.set(id, {
    id,
    codec,
    mediaType,
    bytes,
    extractionMethod: "source_extraction",
  } satisfies CatalogContentBlob);
  return { family: "content", id, codec };
}

function synchronizeSearchDocuments(normalized: NormalizedCatalogV2): void {
  const documents: CatalogRecordForFamily<"search_document">[] = [];
  for (const family of CATALOG_SEARCH_TARGET_FAMILY_NAMES) {
    for (const record of normalized.records[family]) {
      const searchDocument = createCatalogSearchDocument(record);
      if (!searchDocument) {
        throw new Error(
          `Searchable catalog family '${family}' did not produce a search document for '${record.id}'.`,
        );
      }
      documents.push(searchDocument);
    }
  }
  normalized.records.search_document = documents;
}

function addAggregateOversizedTokens(normalized: NormalizedCatalogV2): void {
  for (let index = 0; index < 100; index += 1) {
    const id = `--salt-oversized-${String(index).padStart(3, "0")}`;
    normalized.records.token.push({
      family: "token",
      id,
      name: id,
      category: "fixture",
      type: "color",
      semantic_intent: null,
      aliases: [`alias-${index}-${"x".repeat(27_000)}`],
      status: "stable",
      replacement_token_refs: [],
      policy_profile_ref: null,
      evidence_profile_ref: null,
      applies_to: [],
    } satisfies CatalogRecordForFamily<"token">);
  }
}

function createInventory(): CatalogInputInventory {
  const bytes = Buffer.from("fixture", "utf8");
  const entries = [
    {
      path: "fixture/source.txt",
      sha256: sha256Bytes(bytes),
      bytes: bytes.byteLength,
    },
  ];
  return {
    entries,
    digest: sha256Bytes(canonicalJson(entries)),
    absolutePaths: new Set(),
    expectedByAbsolutePath: new Map(),
  };
}

async function createRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-catalog-writer-"));
  temporaryDirectories.push(root);
  return root;
}

async function snapshotDirectory(
  directory: string,
): Promise<Record<string, string>> {
  const manifestPath = path.join(directory, SALT_CATALOG_MANIFEST_FILE);
  const manifest = catalogManifestCodec.parse(
    JSON.parse(await fs.readFile(manifestPath, "utf8")),
  );
  const firstGenerationEntry =
    manifest.artifacts[0] ?? manifest.build_artifacts[0];
  const generation = firstGenerationEntry
    ? path.posix.dirname(firstGenerationEntry.file)
    : null;
  const names = [
    ...new Set([
      SALT_CATALOG_MANIFEST_FILE,
      ...manifest.artifacts.map((entry) => entry.file),
      ...manifest.build_artifacts.map((entry) => entry.file),
      ...manifest.support_artifacts.map((entry) => entry.file),
      ...(generation
        ? [
            `${generation}/${SALT_CATALOG_MANIFEST_FILE}`,
            `${generation}/${SALT_CATALOG_PACKAGE_FILES_FILE}`,
          ]
        : []),
    ]),
  ].sort((left, right) => left.localeCompare(right));
  return Object.fromEntries(
    await Promise.all(
      names.map(async (name) => [
        name,
        (await fs.readFile(path.join(directory, ...name.split("/")))).toString(
          "base64",
        ),
      ]),
    ),
  );
}

async function writerDebris(
  parentDirectory: string,
  outputName: string,
): Promise<string[]> {
  const outputDirectory = path.join(parentDirectory, outputName);
  const parentDebris = (await fs.readdir(parentDirectory))
    .filter((name) => name.startsWith(`.${outputName}.generation-staging-`))
    .map((name) => `parent/${name}`);
  let outputDebris: string[] = [];
  try {
    outputDebris = (await fs.readdir(outputDirectory))
      .filter((name) => name.includes(".publishing-"))
      .map((name) => `output/${name}`);
  } catch {
    // The output is allowed not to exist before its first publication.
  }
  return [...parentDebris, ...outputDebris].sort((left, right) =>
    left.localeCompare(right),
  );
}

async function mutateExistingBuildArtifact(
  outputDir: string,
  publishedManifest: CatalogManifest,
  mutate: (envelope: { family: string; records: unknown[] }) => void,
): Promise<void> {
  const publishedEntry = publishedManifest.build_artifacts[0];
  if (!publishedEntry) {
    throw new Error("Fixture manifest has no build artifact.");
  }
  const artifactPath = path.join(outputDir, ...publishedEntry.file.split("/"));
  const envelope = JSON.parse(await fs.readFile(artifactPath, "utf8")) as {
    family: string;
    records: unknown[];
  };
  mutate(envelope);
  const bytes = Buffer.from(canonicalJsonFile(envelope), "utf8");
  await fs.writeFile(artifactPath, bytes);

  const generation = path.posix.dirname(publishedEntry.file);
  const generationManifestPath = path.join(
    outputDir,
    ...generation.split("/"),
    SALT_CATALOG_MANIFEST_FILE,
  );
  const generationManifest = catalogManifestCodec.parse(
    JSON.parse(await fs.readFile(generationManifestPath, "utf8")),
  );
  const generationEntry = generationManifest.build_artifacts.find(
    (entry) => entry.family === publishedEntry.family,
  );
  if (!generationEntry) {
    throw new Error("Generation manifest has no matching build artifact.");
  }
  generationEntry.sha256 = sha256Bytes(bytes);
  generationEntry.bytes = bytes.byteLength;
  generationEntry.record_count = envelope.records.length;
  await fs.writeFile(
    generationManifestPath,
    canonicalJsonFile(generationManifest),
    "utf8",
  );
}

const fixedOptions = {
  catalogVersion: "0.1.0-test",
  inventory: createInventory(),
  sourceRevision: "fixture-source-revision",
  generator: {
    mode: "test",
    version: "2.0.0-test",
    digest: `sha256:${"1".repeat(64)}`,
  },
} as const;

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0, temporaryDirectories.length)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("atomic deterministic Salt catalog writer", () => {
  it("cannot publish until input tracking and enumeration validation are sealed", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    await withCatalogInputTracking(root, fixedOptions.inventory, async () => {
      await expect(
        writeCatalogV2({
          ...fixedOptions,
          outputDir,
          normalized: createNormalizedCatalog(),
        }),
      ).rejects.toThrow(/before input tracking is sealed/u);
    });
    await expect(fs.access(outputDir)).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("emits byte-identical complete directories for identical semantic inputs", async () => {
    const root = await createRoot();
    const first = path.join(root, "first");
    const second = path.join(root, "second");
    const normalized = createNormalizedCatalog();
    normalized.records.concept.push(
      {
        family: "concept",
        id: "concept.z",
        name: "Z",
        concept_kind: "other",
        summary: "z",
      },
      {
        family: "concept",
        id: "concept.a",
        name: "A",
        concept_kind: "other",
        summary: "a",
      },
    );
    synchronizeSearchDocuments(normalized);
    const originalOrder = normalized.records.concept.map((record) => record.id);
    await writeCatalogV2({
      ...fixedOptions,
      outputDir: first,
      normalized,
    });
    await writeCatalogV2({
      ...fixedOptions,
      outputDir: second,
      normalized,
    });
    expect(await snapshotDirectory(second)).toEqual(
      await snapshotDirectory(first),
    );
    expect(normalized.records.concept.map((record) => record.id)).toEqual(
      originalOrder,
    );
    expect(await writerDebris(root, "first")).toEqual([]);
    expect(await writerDebris(root, "second")).toEqual([]);
  });

  it("rejects an oversized public record envelope before replacing the manifest", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    const baseline = createNormalizedCatalog();
    baseline.records.concept.push({
      family: "concept",
      id: "concept.baseline",
      name: "Baseline",
      concept_kind: "other",
      summary: "Baseline concept",
    });
    synchronizeSearchDocuments(baseline);
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: baseline,
    });
    const previousManifest = await fs.readFile(
      path.join(outputDir, SALT_CATALOG_MANIFEST_FILE),
      "utf8",
    );

    const oversized = createNormalizedCatalog();
    oversized.records.concept.push({
      family: "concept",
      id: "concept.oversized-public-envelope",
      name: "Oversized",
      concept_kind: "other",
      summary: "x".repeat(MAX_PUBLIC_RESOURCE_UTF8_BYTES),
    });
    synchronizeSearchDocuments(oversized);

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: oversized,
      }),
    ).rejects.toThrow(
      /Public resource 'concept:concept\.oversized-public-envelope'.*limit is 65536/iu,
    );
    expect(
      await fs.readFile(path.join(outputDir, SALT_CATALOG_MANIFEST_FILE), "utf8"),
    ).toBe(previousManifest);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("binds build-only artifacts without publishing them and safely reuses an intact generation", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    const normalized = createNormalizedCatalog();
    normalized.records.build_audit.push({
      family: "build_audit",
      id: "build-audit.fixture",
      audit_kind: "coverage",
      summary: "Fixture build audit",
      gating: true,
    });

    const first = await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized,
    });
    const buildEntry = first.manifest.build_artifacts[0];
    expect(buildEntry).toMatchObject({
      family: "build_audit",
      codec: "salt.catalog.v2.build-audit",
      canonical: false,
      record_count: 1,
    });
    expect(first.metrics.familyRecordCounts.build_audit).toBe(1);
    const publicationEntry = first.manifest.support_artifacts.find(
      (entry) => entry.kind === "package_inventory",
    );
    if (!publicationEntry || !buildEntry) {
      throw new Error("Fixture publication metadata is incomplete.");
    }
    expect(publicationEntry.codec).toBe("salt.catalog.v2.inventory");
    const publication = catalogPublicationCodec.parse(
      JSON.parse(
        await fs.readFile(
          path.join(outputDir, ...publicationEntry.file.split("/")),
          "utf8",
        ),
      ),
    );
    expect(publication.files).not.toContain(buildEntry.file);
    const generationManifest = catalogManifestCodec.parse(
      JSON.parse(
        await fs.readFile(
          path.join(
            outputDir,
            ...path.posix.dirname(buildEntry.file).split("/"),
            SALT_CATALOG_MANIFEST_FILE,
          ),
          "utf8",
        ),
      ),
    );
    const packageFilesEntry = generationManifest.support_artifacts.find(
      (entry) => entry.kind === "package_inventory",
    );
    if (!packageFilesEntry) {
      throw new Error("Generation manifest has no package file inventory.");
    }
    expect(packageFilesEntry.codec).toBe("salt.catalog.v2.inventory");
    const packageFiles = catalogPackageFilesCodec.parse(
      JSON.parse(
        await fs.readFile(
          path.join(
            outputDir,
            ...path.posix.dirname(buildEntry.file).split("/"),
            packageFilesEntry.file,
          ),
          "utf8",
        ),
      ),
    );
    expect(packageFiles.files).not.toContain(
      catalogFamilies.build_audit.artifact,
    );

    const baseline = await snapshotDirectory(outputDir);
    const second = await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized,
    });
    expect(second.manifest).toEqual(first.manifest);
    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("rotates the immutable generation without changing semantic identity when only build-audit data changes", async () => {
    const root = await createRoot();
    const firstNormalized = createNormalizedCatalog();
    const secondNormalized = createNormalizedCatalog();
    for (const [normalized, summary] of [
      [firstNormalized, "First audit"],
      [secondNormalized, "Second audit"],
    ] as const) {
      normalized.records.build_audit.push({
        family: "build_audit",
        id: "build-audit.fixture",
        audit_kind: "coverage",
        summary,
        gating: true,
      });
    }

    const first = await writeCatalogV2({
      ...fixedOptions,
      outputDir: path.join(root, "first"),
      normalized: firstNormalized,
    });
    const second = await writeCatalogV2({
      ...fixedOptions,
      outputDir: path.join(root, "second"),
      normalized: secondNormalized,
    });
    const firstBuildEntry = first.manifest.build_artifacts[0];
    const secondBuildEntry = second.manifest.build_artifacts[0];
    if (!firstBuildEntry || !secondBuildEntry) {
      throw new Error("Fixture manifest has no build artifact.");
    }
    expect(first.manifest.semantic_digest).toBe(
      second.manifest.semantic_digest,
    );
    expect(firstBuildEntry.sha256).not.toBe(secondBuildEntry.sha256);
    expect(path.posix.dirname(firstBuildEntry.file)).not.toBe(
      path.posix.dirname(secondBuildEntry.file),
    );
  });

  it.each([
    {
      label: "deleted",
      mutate: async (artifactPath: string) =>
        fs.rm(artifactPath, { force: true }),
      expected: /ENOENT|no such file|cannot find/u,
    },
    {
      label: "byte-corrupt",
      mutate: async (artifactPath: string) =>
        fs.appendFile(artifactPath, Buffer.from("\ncorrupt", "utf8")),
      expected: /artifact digest mismatch|operational limit/u,
    },
  ])(
    "rejects an identical-generation reuse when its build artifact is $label",
    async ({ mutate, expected }) => {
      const root = await createRoot();
      const outputDir = path.join(root, "catalog");
      const normalized = createNormalizedCatalog();
      const first = await writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized,
      });
      const buildEntry = first.manifest.build_artifacts[0];
      if (!buildEntry) {
        throw new Error("Fixture manifest has no build artifact.");
      }
      await mutate(path.join(outputDir, ...buildEntry.file.split("/")));

      await expect(
        writeCatalogV2({
          ...fixedOptions,
          outputDir,
          normalized,
        }),
      ).rejects.toThrow(expected);
      expect(await writerDebris(root, "catalog")).toEqual([]);
    },
  );

  it.each([
    {
      label: "wrong-family envelope",
      mutate: (envelope: { family: string; records: unknown[] }) => {
        envelope.family = "component";
      },
      expected: /declares family 'component', expected 'build_audit'/u,
    },
    {
      label: "malformed record",
      mutate: (envelope: { family: string; records: unknown[] }) => {
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
  ])(
    "rejects an identical-generation reuse with a rebound $label",
    async ({ mutate, expected }) => {
      const root = await createRoot();
      const outputDir = path.join(root, "catalog");
      const normalized = createNormalizedCatalog();
      const first = await writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized,
      });
      await mutateExistingBuildArtifact(outputDir, first.manifest, mutate);

      await expect(
        writeCatalogV2({
          ...fixedOptions,
          outputDir,
          normalized,
        }),
      ).rejects.toThrow(expected);
      expect(await writerDebris(root, "catalog")).toEqual([]);
    },
  );

  it("rejects a valid rebound build artifact as an identical-generation collision", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    const normalized = createNormalizedCatalog();
    const first = await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized,
    });
    const rootManifestPath = path.join(outputDir, SALT_CATALOG_MANIFEST_FILE);
    const rootManifestBytes = await fs.readFile(rootManifestPath);
    await mutateExistingBuildArtifact(outputDir, first.manifest, (envelope) => {
      envelope.records = [
        {
          family: "build_audit",
          id: "build-audit.rebound",
          audit_kind: "coverage",
          summary: "Valid but not the requested generation",
          gating: true,
        },
      ];
    });

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized,
      }),
    ).rejects.toThrow(/generation digest collision/u);
    expect(
      (await fs.readFile(rootManifestPath)).equals(rootManifestBytes),
    ).toBe(true);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("rejects malformed build-audit records during staging", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    const normalized = createNormalizedCatalog();
    normalized.records.build_audit.push({
      family: "build_audit",
      id: "build-audit.invalid",
      audit_kind: "future",
      summary: "Invalid audit kind",
      gating: true,
    } as never);

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized,
      }),
    ).rejects.toThrow(/audit_kind/u);
    await expect(
      fs.access(path.join(outputDir, SALT_CATALOG_MANIFEST_FILE)),
    ).rejects.toMatchObject({ code: "ENOENT" });
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("atomically switches readers while retaining the prior immutable generation", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    const first = createNormalizedCatalog();
    first.records.concept.push({
      family: "concept",
      id: "concept.first",
      name: "First",
      concept_kind: "other",
      summary: "first",
    } satisfies CatalogRecordForFamily<"concept">);
    synchronizeSearchDocuments(first);
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: first,
    });
    await expect(
      fs.access(path.join(outputDir, SALT_CATALOG_PACKAGE_FILES_FILE)),
    ).rejects.toMatchObject({ code: "ENOENT" });
    const oldStore = new CatalogStoreV2({ registryDir: outputDir });
    const lateOldStore = new CatalogStoreV2({ registryDir: outputDir });
    const oldDigest = oldStore.manifest.semantic_digest;

    const second = createNormalizedCatalog();
    second.records.concept.push({
      family: "concept",
      id: "concept.second",
      name: "Second",
      concept_kind: "other",
      summary: "second",
    } satisfies CatalogRecordForFamily<"concept">);
    synchronizeSearchDocuments(second);

    const originalRename = fs.rename.bind(fs);
    let observedCommit = false;
    const rename = vi
      .spyOn(fs, "rename")
      .mockImplementation(async (sourcePath, targetPath) => {
        if (
          String(sourcePath).includes(".catalog-manifest.json.publishing-") &&
          path.resolve(String(targetPath)) ===
            path.join(outputDir, SALT_CATALOG_MANIFEST_FILE)
        ) {
          const interleavedStore = new CatalogStoreV2({
            registryDir: outputDir,
          });
          expect(interleavedStore.manifest.semantic_digest).toBe(oldDigest);
          expect(() => interleavedStore.prefetch()).not.toThrow();
          expect(() => oldStore.prefetch()).not.toThrow();
          const result = await originalRename(sourcePath, targetPath);
          const committedStore = new CatalogStoreV2({
            registryDir: outputDir,
          });
          expect(committedStore.manifest.semantic_digest).not.toBe(oldDigest);
          expect(() => committedStore.prefetch()).not.toThrow();
          observedCommit = true;
          return result;
        }
        return originalRename(sourcePath, targetPath);
      });
    try {
      await writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: second,
      });
    } finally {
      rename.mockRestore();
    }

    expect(observedCommit).toBe(true);
    expect(() => lateOldStore.prefetch()).not.toThrow();
    expect(oldStore.getFamily("concept").map((record) => record.id)).toEqual([
      "concept.first",
    ]);
    expect(
      new CatalogStoreV2({ registryDir: outputDir })
        .getFamily("concept")
        .map((record) => record.id),
    ).toEqual(["concept.second"]);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("preserves the previous publication when the manifest commit fails", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: createNormalizedCatalog(),
    });
    const baseline = await snapshotDirectory(outputDir);
    const changed = createNormalizedCatalog();
    changed.records.concept.push({
      family: "concept",
      id: "concept.changed",
      name: "Changed",
      concept_kind: "other",
      summary: "changed",
    } satisfies CatalogRecordForFamily<"concept">);
    synchronizeSearchDocuments(changed);

    const originalRename = fs.rename.bind(fs);
    const rename = vi
      .spyOn(fs, "rename")
      .mockImplementation(async (sourcePath, targetPath) => {
        if (
          String(sourcePath).includes(".catalog-manifest.json.publishing-") &&
          path.resolve(String(targetPath)) ===
            path.join(outputDir, SALT_CATALOG_MANIFEST_FILE)
        ) {
          throw new Error("injected staged commit failure");
        }
        return originalRename(sourcePath, targetPath);
      });
    try {
      await expect(
        writeCatalogV2({
          ...fixedOptions,
          outputDir,
          normalized: changed,
        }),
      ).rejects.toThrow(/injected staged commit failure/u);
    } finally {
      rename.mockRestore();
    }

    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("preserves the previous directory and removes staging debris after validation failure", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: createNormalizedCatalog(),
    });
    const baseline = await snapshotDirectory(outputDir);
    const invalid = createNormalizedCatalog();
    invalid.records.token.push({
      family: "token",
      id: "--salt-invalid-reference",
      name: "--salt-invalid-reference",
      category: "fixture",
      type: "color",
      semantic_intent: null,
      aliases: [],
      status: "stable",
      replacement_token_refs: [],
      policy_profile_ref: null,
      evidence_profile_ref: null,
      applies_to: [
        {
          family: "component",
          id: "component.does-not-exist",
        },
      ],
    } satisfies CatalogRecordForFamily<"token">);

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: invalid,
      }),
    ).rejects.toThrow(/unresolved component:component\.does-not-exist/u);
    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("refuses to publish shape-valid evidence with invalid ordinal sequences", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: createNormalizedCatalog(),
    });
    const baseline = await snapshotDirectory(outputDir);
    const invalid = createNormalizedCatalog();
    for (const [index, id] of ["first", "second"].entries()) {
      invalid.records.evidence.push({
        family: "evidence",
        id: `example.${id}`,
        evidence_kind: "executable_example",
        local_id: id,
        owner: {
          family: "component",
          id: "component.fixture",
        },
        owner_ordinal: index,
        registry_ordinal: 0,
        title: id,
        description: "",
        intent: [],
        complexity: "basic",
        code_content_ref: {
          family: "content",
          id: `sha256:${"a".repeat(64)}`,
          codec: "executable_example_code",
        },
        source_ref: {
          family: "source",
          id: "source.fixture",
        },
        package_ref: null,
        extraction_method: "source_extraction",
        validation: {
          state: "unvalidated",
          reason: "Fixture only validates ordinal publication gating.",
          validated_at: null,
        },
      } satisfies CatalogRecordForFamily<"evidence">);
    }

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: invalid,
      }),
    ).rejects.toThrow(/registry ordinals .* unique and contiguous/u);
    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("refuses to publish shape-valid accessibility claims with invalid ordinal sequences", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: createNormalizedCatalog(),
    });
    const baseline = await snapshotDirectory(outputDir);
    const invalid = createNormalizedCatalog();
    invalid.records.accessibility_claim.push({
      family: "accessibility_claim",
      id: "accessibility.fixture.summary.1",
      owner: {
        family: "component",
        id: "component.fixture",
      },
      source_field: "accessibility.summary",
      ordinal: 1,
      statement_content_ref: {
        family: "content",
        id: `sha256:${"a".repeat(64)}`,
        codec: "accessibility_statement",
      },
      provenance: [
        {
          reference: {
            family: "source",
            id: "source.fixture",
          },
          supports: ["statement", "classification"],
          source_range: null,
          content_digest: null,
        },
      ],
      classification: "fact",
      normativity: "descriptive",
      severity: null,
      rule_kind: null,
    } satisfies CatalogRecordForFamily<"accessibility_claim">);

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: invalid,
      }),
    ).rejects.toThrow(/accessibility claims .* unique and contiguous/u);
    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("refuses policy profiles used in the wrong catalog role", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: createNormalizedCatalog(),
    });
    const baseline = await snapshotDirectory(outputDir);
    const invalid = createNormalizedCatalog();
    invalid.records.policy_profile.push({
      family: "policy_profile",
      id: "policy.component-usage.fixture",
      summary: "Fixture component policy.",
      policy_kind: "component_usage",
      body_content_ref: {
        family: "content",
        id: `sha256:${"a".repeat(64)}`,
        codec: "component_usage",
      },
    } satisfies CatalogRecordForFamily<"policy_profile">);
    invalid.records.token.push({
      family: "token",
      id: "--salt-fixture",
      name: "--salt-fixture",
      category: "fixture",
      type: "color",
      semantic_intent: null,
      aliases: [],
      status: "stable",
      replacement_token_refs: [],
      policy_profile_ref: {
        family: "policy_profile",
        id: "policy.component-usage.fixture",
      },
      evidence_profile_ref: null,
      applies_to: [],
    } satisfies CatalogRecordForFamily<"token">);
    synchronizeSearchDocuments(invalid);

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: invalid,
      }),
    ).rejects.toThrow(
      /cannot use 'component_usage' policy profile .*token_usage or token_gap/u,
    );
    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("refuses orphan content with unresolved nested references", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: createNormalizedCatalog(),
    });
    const baseline = await snapshotDirectory(outputDir);
    const invalid = createNormalizedCatalog();
    addCatalogContent(invalid, "guide_detail", {
      steps: [
        {
          title: "Unresolved snippet",
          statements: [],
          snippets: [
            {
              title: "Fixture",
              language: "tsx",
              code_ref: {
                family: "content",
                id: `sha256:${"a".repeat(64)}`,
                codec: "guide_snippet_code",
              },
            },
          ],
        },
      ],
      related_docs: {
        overview: null,
      },
    });

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: invalid,
      }),
    ).rejects.toThrow(/unresolved content:sha256:/u);
    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("refuses non-token assertions in token evidence payloads", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: createNormalizedCatalog(),
    });
    const baseline = await snapshotDirectory(outputDir);
    const invalid = createNormalizedCatalog();
    invalid.records.evidence.push({
      family: "evidence",
      id: "evidence.documentation.fixture",
      evidence_kind: "documentation_link",
      owner: null,
      owner_ordinal: null,
      label: "Fixture documentation",
      href: "https://example.test/fixture",
      page_ref: null,
      internal: false,
      link_role: "related_doc",
      extraction_method: "link_extraction",
      validation: {
        state: "unvalidated",
        reason: "External fixture URL is not fetched.",
        validated_at: null,
      },
    } satisfies CatalogRecordForFamily<"evidence">);
    const bodyContentRef = addCatalogContent(invalid, "token_evidence", {
      evidence_refs: [
        {
          family: "evidence",
          id: "evidence.documentation.fixture",
        },
      ],
    });
    invalid.records.policy_profile.push({
      family: "policy_profile",
      id: "policy.token-evidence.fixture",
      summary: "Fixture token evidence.",
      policy_kind: "token_evidence",
      body_content_ref: bodyContentRef,
    } satisfies CatalogRecordForFamily<"policy_profile">);

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: invalid,
      }),
    ).rejects.toThrow(/must reference token-policy source assertions/u);
    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("fails both default hard budgets without replacing valid output", async () => {
    const root = await createRoot();
    const outputDir = path.join(root, "catalog");
    await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized: createNormalizedCatalog(),
    });
    const baseline = await snapshotDirectory(outputDir);

    const oversizedSearch = createNormalizedCatalog();
    const oversizedIdPrefix = `concept.${"s".repeat(430)}.`;
    for (let index = 0; index < 7_000; index += 1) {
      oversizedSearch.records.concept.push({
        family: "concept",
        id: `${oversizedIdPrefix}${String(index).padStart(6, "0")}`,
        name: `Oversized search target ${index}`,
        concept_kind: "other",
        summary: "fixture",
      } satisfies CatalogRecordForFamily<"concept">);
    }
    synchronizeSearchDocuments(oversizedSearch);
    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: oversizedSearch,
      }),
    ).rejects.toThrow(/search artifact .* budget/u);
    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);

    const oversizedTokens = createNormalizedCatalog();
    addAggregateOversizedTokens(oversizedTokens);
    synchronizeSearchDocuments(oversizedTokens);
    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: oversizedTokens,
      }),
    ).rejects.toThrow(/token-owned artifacts .* budget/u);
    expect(await snapshotDirectory(outputDir)).toEqual(baseline);
    expect(await writerDebris(root, "catalog")).toEqual([]);
  });

  it("counts token policy documentation sources once through codec-declared references", async () => {
    const measureFixture = async (
      outputName: string,
      profileCount: number,
      includeDocs: boolean,
    ) => {
      const root = await createRoot();
      const outputDir = path.join(root, outputName);
      const normalized = createNormalizedCatalog();
      const sourceRef = {
        family: "source" as const,
        id: "source.external.token-policy-fixture",
      };
      if (includeDocs) {
        normalized.records.source.push({
          ...sourceRef,
          status: "current",
          source_kind: "external_https",
          locator: "https://example.com/token-policy",
          extraction_method: "external_reference",
          validation: {
            state: "unvalidated",
            reason: "Test fixture reference.",
            validated_at: null,
          },
        } satisfies CatalogRecordForFamily<"source">);
      }
      for (let index = 0; index < profileCount; index += 1) {
        const bodyContentRef = addCatalogContent(normalized, "token_usage", {
          policy: {
            usage_tier: "foundation",
            direct_component_use: "conditional",
            preferred_for: [],
            avoid_for: [],
            notes: [],
            docs_refs: includeDocs ? [sourceRef] : [],
          },
          guidance: [`Profile ${index} guidance.`],
        });
        const policyRef = {
          family: "policy_profile" as const,
          id: `policy.token-usage.fixture-${index}`,
        };
        normalized.records.policy_profile.push({
          ...policyRef,
          summary: "Fixture token usage policy.",
          policy_kind: "token_usage",
          body_content_ref: bodyContentRef,
        } satisfies CatalogRecordForFamily<"policy_profile">);
        normalized.records.token.push({
          family: "token",
          id: `--salt-token-policy-fixture-${index}`,
          name: `--salt-token-policy-fixture-${index}`,
          category: "fixture",
          type: "color",
          semantic_intent: null,
          aliases: [],
          status: "stable",
          replacement_token_refs: [],
          policy_profile_ref: policyRef,
          evidence_profile_ref: null,
          applies_to: [],
        } satisfies CatalogRecordForFamily<"token">);
      }
      synchronizeSearchDocuments(normalized);
      await writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized,
      });
      const store = new CatalogStoreV2({ registryDir: outputDir });
      store.validateCrossReferences();
      return measureTokenOwnedCatalogSurface(store);
    };

    const withoutDocs = await measureFixture("without-docs", 1, false);
    const withOneReference = await measureFixture("with-one-doc", 1, true);
    const withSharedReference = await measureFixture(
      "with-shared-doc",
      2,
      true,
    );

    expect(withOneReference.bytes.declaration_sources).toBeGreaterThan(
      withoutDocs.bytes.declaration_sources,
    );
    expect(withSharedReference.bytes.declaration_sources).toBe(
      withOneReference.bytes.declaration_sources,
    );
  });

  it("refuses filesystem roots as output directories", async () => {
    const root = path.parse(await createRoot()).root;
    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir: root,
        normalized: createNormalizedCatalog(),
      }),
    ).rejects.toThrow(/unsafe catalog output directory/u);
  });

  it("rejects linked output and generation directories without touching their targets", async () => {
    const root = await createRoot();
    const external = await createRoot();
    const sentinel = path.join(external, "sentinel.txt");
    await fs.writeFile(sentinel, "unchanged", "utf8");
    const outputLink = path.join(root, "catalog-link");
    await fs.symlink(
      external,
      outputLink,
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir: outputLink,
        normalized: createNormalizedCatalog(),
      }),
    ).rejects.toThrow(/linked catalog output directory/iu);
    expect(await fs.readFile(sentinel, "utf8")).toBe("unchanged");

    const outputDir = path.join(root, "catalog");
    await fs.mkdir(outputDir);
    await fs.symlink(
      external,
      path.join(outputDir, "catalog-generations"),
      process.platform === "win32" ? "junction" : "dir",
    );
    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized: createNormalizedCatalog(),
      }),
    ).rejects.toThrow(/unsafe generation directory/iu);
    expect(await fs.readFile(sentinel, "utf8")).toBe("unchanged");
  });

  it("rejects a linked generation collision without changing prior or external data", async () => {
    const root = await createRoot();
    const external = await createRoot();
    const outputDir = path.join(root, "catalog");
    const normalized = createNormalizedCatalog();
    const first = await writeCatalogV2({
      ...fixedOptions,
      outputDir,
      normalized,
    });
    const rootManifestPath = path.join(outputDir, SALT_CATALOG_MANIFEST_FILE);
    const rootManifestBytes = await fs.readFile(rootManifestPath);
    const generation = path.posix.dirname(
      first.manifest.artifacts[0]?.file ?? "",
    );
    if (generation === ".") {
      throw new Error("Published fixture manifest has no generation prefix.");
    }
    const generationDir = path.join(outputDir, ...generation.split("/"));
    const externalGeneration = path.join(external, "generation");
    await fs.cp(generationDir, externalGeneration, { recursive: true });
    const sentinel = path.join(externalGeneration, "sentinel.txt");
    await fs.writeFile(sentinel, "unchanged", "utf8");
    await fs.rm(generationDir, { recursive: true });
    try {
      await fs.symlink(
        externalGeneration,
        generationDir,
        process.platform === "win32" ? "junction" : "dir",
      );
    } catch (error) {
      if (
        ["EACCES", "ENOTSUP", "EPERM"].includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      ) {
        return;
      }
      throw error;
    }

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir,
        normalized,
      }),
    ).rejects.toThrow(/generation collision is linked or non-directory/iu);
    expect(
      (await fs.readFile(rootManifestPath)).equals(rootManifestBytes),
    ).toBe(true);
    expect(await fs.readFile(sentinel, "utf8")).toBe("unchanged");
  });

  it("permits explicitly non-gating oversized fixtures only when budgets are disabled", async () => {
    const root = await createRoot();
    const normalized = createNormalizedCatalog();
    addAggregateOversizedTokens(normalized);
    synchronizeSearchDocuments(normalized);

    await expect(
      writeCatalogV2({
        ...fixedOptions,
        outputDir: path.join(root, "catalog"),
        normalized,
        enforceBudgets: false,
      }),
    ).resolves.toMatchObject({
      metrics: {
        familyRecordCounts: {
          token: 100,
          search_document: 100,
        },
      },
    });
  });
});
