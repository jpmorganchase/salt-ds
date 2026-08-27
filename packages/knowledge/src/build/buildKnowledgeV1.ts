import fs from "node:fs/promises";
import path from "node:path";
import {
  createArtifactDescriptor,
  materializeArtifactTree,
  type ArtifactDescriptor,
} from "../manifest/artifactTree.js";
import { canonicalJson, canonicalJsonBytes } from "../manifest/canonicalJson.js";
import { sha256Digest } from "../manifest/digestCodec.js";
import { parseKnowledgeArtifactPath } from "../manifest/pathCodec.js";
import {
  computeKnowledgeBundleDigest,
  KNOWLEDGE_OPERATIONS,
  KNOWLEDGE_PACKAGE_FAMILIES,
  validateKnowledgeManifestV1,
  type KnowledgeManifestV1,
  type KnowledgePackageCompatibility,
} from "../schemas/knowledgeManifestV1.js";
import {
  getCatalogRuntimeFamilyNames,
  type CatalogRecord,
  type CatalogRuntimeFamilyName,
} from "../catalog/catalogSchemaV2.js";
import { createCatalogStoreV2 } from "../catalog/catalogStoreV2.js";
import { REVIEW_RULE_CHARACTERIZATION } from "../review/reviewRuleCharacterization.js";
import type { SaltRegistry } from "../types.js";

const SCHEMA_FILES = [
  "artifact-tree-node-1.schema.json",
  "item-applicability-1.schema.json",
  "knowledge-manifest-1.schema.json",
  "knowledge-record-1.schema.json",
  "migration-record-1.schema.json",
  "operation-capabilities-1.schema.json",
  "search-index-1.schema.json",
] as const;

const JSON_MEDIA_TYPE = "application/json";
const MARKDOWN_MEDIA_TYPE = "text/markdown";
const RUNTIME_SELECTABLE_FAMILIES = new Set([
  "api_symbol",
  "component",
  "concept",
  "country_symbol",
  "deprecation",
  "guide",
  "icon",
  "package",
  "page",
  "pattern",
  "policy_profile",
  "token",
]);

interface InputInventory {
  schema_version: string;
  digest: string;
  entries: Array<{ path: string; sha256: string; bytes: number }>;
}

export interface BuildKnowledgeV1Options {
  sourceRoot: string;
  packageRoot: string;
  prototypeRoot: string;
  outputDir: string;
  packageVersion: string;
  registry: SaltRegistry;
  semanticInputInventory: InputInventory;
  compilerInputInventory: InputInventory;
  generatorReceipt: unknown;
  generatorDigest: string;
}

export interface KnowledgeRecordV1 {
  key: string;
  family: string;
  id: string;
  title: string;
  summary: string;
  data: CatalogRecord;
  content_value?: unknown;
}

function recordKey(family: string, id: string): string {
  return `record:${family}:${id}`;
}

function titleForRecord(record: CatalogRecord): string {
  const candidate = record as CatalogRecord & {
    name?: unknown;
    title?: unknown;
    label?: unknown;
  };
  for (const value of [candidate.name, candidate.title, candidate.label]) {
    if (typeof value === "string") return value;
  }
  return record.id;
}

function summaryForRecord(record: CatalogRecord): string {
  const summary = (record as CatalogRecord & { summary?: unknown }).summary;
  return typeof summary === "string" ? summary : "";
}

function safeMarkdown(value: string): string {
  return value
    .replace(/https?:\/\/[^\s)]*storybook[^\s)]*/giu, "")
    .replaceAll("\r\n", "\n")
    .trim();
}

function packageReferences(value: unknown, target: Set<string>): void {
  if (Array.isArray(value)) {
    for (const entry of value) packageReferences(entry, target);
    return;
  }
  if (!value || typeof value !== "object") return;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.family === "package" &&
    typeof candidate.id === "string"
  ) {
    target.add(candidate.id);
  }
  for (const entry of Object.values(candidate)) packageReferences(entry, target);
}

function referencedContentIds(value: unknown, target: Set<string>): void {
  if (Array.isArray(value)) {
    for (const entry of value) referencedContentIds(entry, target);
    return;
  }
  if (!value || typeof value !== "object") return;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.family === "content" &&
    typeof candidate.id === "string"
  ) {
    target.add(candidate.id);
  }
  for (const entry of Object.values(candidate)) referencedContentIds(entry, target);
}

async function writeArtifact(
  outputDir: string,
  relativePath: string,
  bytes: Buffer,
  mediaType: string,
  descriptors: ArtifactDescriptor[],
): Promise<void> {
  const artifactPath = parseKnowledgeArtifactPath(relativePath);
  const absolutePath = path.join(outputDir, ...artifactPath.split("/"));
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, bytes, { flag: "wx" });
  descriptors.push(createArtifactDescriptor(artifactPath, mediaType, bytes));
}

function normalizedInventory(inventory: InputInventory, kind: string): unknown {
  const entries = [...inventory.entries]
    .map((entry) => ({
      path: parseKnowledgeArtifactPath(entry.path),
      sha256: entry.sha256,
      bytes: entry.bytes,
    }))
    .sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
  return {
    schema_version: "1.0.0",
    contract: `salt-${kind}-inventory/1`,
    digest: inventory.digest,
    entries,
  };
}

export async function buildKnowledgeV1(
  options: BuildKnowledgeV1Options,
): Promise<KnowledgeManifestV1> {
  const outputDir = path.resolve(options.outputDir);
  const packageRoot = path.resolve(options.packageRoot);
  const sourceRoot = path.resolve(options.sourceRoot);
  const relativeOutput = path.relative(packageRoot, outputDir);
  if (
    relativeOutput.startsWith("..") ||
    path.isAbsolute(relativeOutput) ||
    path.resolve(options.prototypeRoot) === outputDir
  ) {
    throw new Error("Knowledge-v1 output must be a distinct package-owned directory.");
  }
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const store = createCatalogStoreV2({ registryDir: options.prototypeRoot });
  store.ensureCatalogVerified();
  const descriptors: ArtifactDescriptor[] = [];
  const recordsByFamily = new Map<CatalogRuntimeFamilyName, KnowledgeRecordV1[]>();
  const recordByKey = new Map<string, KnowledgeRecordV1>();
  const contentOwners = new Map<string, Set<string>>();

  for (const family of getCatalogRuntimeFamilyNames()) {
    const records = store.getFamily(family).map((record) => {
      const key = recordKey(family, record.id);
      const knowledgeRecord: KnowledgeRecordV1 = {
        key,
        family,
        id: record.id,
        title: titleForRecord(record),
        summary: summaryForRecord(record),
        data: record,
      };
      if (family !== "content") {
        const references = new Set<string>();
        referencedContentIds(record, references);
        for (const contentId of references) {
          const owners = contentOwners.get(contentId) ?? new Set<string>();
          owners.add(key);
          contentOwners.set(contentId, owners);
        }
      }
      recordByKey.set(key, knowledgeRecord);
      return knowledgeRecord;
    });
    recordsByFamily.set(family, records);
  }

  for (const [family, records] of recordsByFamily) {
    if (family === "search_document") continue;
    await writeArtifact(
      outputDir,
      `records/${family}.json`,
      canonicalJsonBytes({
        contract: "salt-knowledge-record-set/1",
        schema_version: "1.0.0",
        family,
        records,
      }),
      JSON_MEDIA_TYPE,
      descriptors,
    );
  }

  const prototypeContentPack = store.manifest.support_artifacts.find(
    (entry) => entry.kind === "content_pack",
  );
  if (!prototypeContentPack) {
    throw new Error("The verified extraction baseline has no content pack.");
  }
  const contentPackBytes = await fs.readFile(
    path.join(options.prototypeRoot, ...prototypeContentPack.file.split("/")),
  );
  if (
    contentPackBytes.byteLength !== prototypeContentPack.bytes ||
    sha256Digest(contentPackBytes) !== prototypeContentPack.sha256
  ) {
    throw new Error("The extraction content pack changed after verification.");
  }
  await writeArtifact(
    outputDir,
    "content/content.pack",
    contentPackBytes,
    "application/octet-stream",
    descriptors,
  );

  const searchRecords = recordsByFamily.get("search_document") ?? [];
  if (searchRecords.length === 0) {
    throw new Error("Knowledge-v1 search index cannot be empty.");
  }
  const searchShardPath = "indexes/search/all.json";
  const searchShardBytes = canonicalJsonBytes({
    contract: "salt-search-shard/1",
    schema_version: "1.0.0",
    first_key: searchRecords[0].key,
    last_key: searchRecords.at(-1)?.key,
    records: searchRecords,
  });
  await writeArtifact(
    outputDir,
    searchShardPath,
    searchShardBytes,
    JSON_MEDIA_TYPE,
    descriptors,
  );
  const indexBytes = canonicalJsonBytes({
    contract: "salt-search-index/1",
    schema_version: "1.0.0",
    shards: [
      {
        path: searchShardPath,
        first_key: searchRecords[0].key,
        last_key: searchRecords.at(-1)?.key,
        records: searchRecords.length,
        bytes: searchShardBytes.byteLength,
        sha256: sha256Digest(searchShardBytes),
      },
    ],
  });
  if (indexBytes.byteLength > 512 * 1024) {
    throw new Error("Knowledge bootstrap search index exceeds 512 KiB.");
  }
  await writeArtifact(
    outputDir,
    "index.json",
    indexBytes,
    JSON_MEDIA_TYPE,
    descriptors,
  );

  for (const family of ["component", "pattern", "guide", "page"] as const) {
    for (const record of recordsByFamily.get(family) ?? []) {
      const kind = family === "component" ? "components" : `${family}s`;
      const markdown = `# ${safeMarkdown(record.title)}\n\n${safeMarkdown(record.summary)}\n`;
      const projectionPath = `markdown/${kind}/${record.id}.md`;
      await writeArtifact(
        outputDir,
        projectionPath,
        Buffer.from(markdown, "utf8"),
        MARKDOWN_MEDIA_TYPE,
        descriptors,
      );
      recordByKey.set(`projection:${projectionPath}`, record);
    }
  }

  const exampleIndex = {
    contract: "salt-example-index/1",
    schema_version: "1.0.0",
    examples: [...options.registry.examples]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((example) => ({
        id: example.id,
        title:
          "title" in example && typeof example.title === "string"
            ? example.title
            : example.id,
        status: "contextual",
        entry_file: null,
        supporting_files: [],
        dependencies: [],
        css: [],
        providers: [],
        package_vector: [],
        source_provenance: "verified Salt authoring source",
        limitation:
          "This pre-agent projection is contextual until Unit 06 publishes dependency-complete copy-ready examples.",
      })),
  };
  await writeArtifact(
    outputDir,
    "examples/index.json",
    canonicalJsonBytes(exampleIndex),
    JSON_MEDIA_TYPE,
    descriptors,
  );

  const migrationInventoryPath = path.join(
    sourceRoot,
    "tooling",
    "ai",
    "migration-records-v1.json",
  );
  const migrationInventory = JSON.parse(
    await fs.readFile(migrationInventoryPath, "utf8"),
  ) as { records: Array<{ id: string; status: string; affected_families: string[] }> };
  await writeArtifact(
    outputDir,
    "markdown/migrations/index.md",
    Buffer.from(
      `# Salt migration records\n\n${migrationInventory.records
        .map((entry) => `- ${entry.id} (${entry.status})`)
        .join("\n")}\n`,
      "utf8",
    ),
    MARKDOWN_MEDIA_TYPE,
    descriptors,
  );

  const schemaRoot = path.join(packageRoot, "schemas");
  for (const schemaFile of SCHEMA_FILES) {
    const bytes = await fs.readFile(path.join(schemaRoot, schemaFile));
    await writeArtifact(
      outputDir,
      `schemas/${schemaFile}`,
      bytes,
      "application/schema+json",
      descriptors,
    );
  }

  const packageRecords = new Map(
    (recordsByFamily.get("package") ?? []).map((record) => [
      record.id,
      record.data as CatalogRecord & { name: string; version: string },
    ]),
  );
  const compatibilityPackages = KNOWLEDGE_PACKAGE_FAMILIES.map((name) => {
    const record = [...packageRecords.values()].find(
      (candidate) => candidate.name === name,
    );
    if (!record) throw new Error(`Missing frozen Salt package family ${name}.`);
    return {
      name,
      tested_version: record.version,
      supported_range: record.version,
      required: name === "@salt-ds/core",
    } satisfies KnowledgePackageCompatibility;
  });
  const packageById = new Map(
    [...packageRecords].map(([id, record]) => [id, record.name]),
  );
  const packageRangeByName = new Map<string, string>(
    compatibilityPackages.map((entry) => [entry.name, entry.supported_range]),
  );

  const applicabilityProfiles = [
    {
      id: "version-independent",
      mode: "version-independent",
      rationale:
        "The normalized item has no Salt package-family reference and is safe across the frozen current vector.",
      evidence: "Knowledge-v1 normalized record graph",
    },
    ...compatibilityPackages.map((entry) => ({
      id: `package:${entry.name}`,
      mode: "package-ranges",
      packages: [
        {
          name: entry.name,
          range: entry.supported_range,
          evidence: `frozen tested package ${entry.name}@${entry.tested_version}`,
        },
      ],
    })),
  ];
  const applicabilityItems = [...recordByKey]
    .filter(
      ([key, record]) =>
        key.startsWith("projection:") ||
        RUNTIME_SELECTABLE_FAMILIES.has(record.family),
    )
    .map(([key, record]) => {
    if (key.startsWith("projection:")) {
      return {
        key,
        mode: "inherits",
        source_items: [record.key],
      };
    }
    const references = new Set<string>();
    packageReferences(record.data, references);
    if (record.family === "package") references.add(record.id);
    const names = [...references]
      .map((id) => packageById.get(id))
      .filter((name): name is string => Boolean(name))
      .sort();
    return names.length > 0
      ? names.length === 1
        ? { key, profile: `package:${names[0]}` }
        : {
            key,
            mode: "package-ranges",
            packages: names.map((name) => ({
              name,
              range: packageRangeByName.get(name),
              evidence: `record package reference in ${key}`,
            })),
          }
      : { key, profile: "version-independent" };
    });
  for (const rule of REVIEW_RULE_CHARACTERIZATION) {
    applicabilityItems.push({
      key: `rule:${rule.rule_id}`,
      profile: "version-independent",
    });
  }
  applicabilityItems.sort((left, right) => left.key.localeCompare(right.key));
  await writeArtifact(
    outputDir,
    "compatibility/item-applicability.json",
    canonicalJsonBytes({
      contract: "salt-item-applicability/1",
      schema_version: "1.0.0",
      frozen_families: KNOWLEDGE_PACKAGE_FAMILIES,
      profiles: applicabilityProfiles,
      items: applicabilityItems,
    }),
    JSON_MEDIA_TYPE,
    descriptors,
  );

  const semanticInventory = normalizedInventory(
    options.semanticInputInventory,
    "semantic-source",
  );
  const compilerInventory = normalizedInventory(
    options.compilerInputInventory,
    "compiler",
  );
  await writeArtifact(
    outputDir,
    "support/semantic-source-inventory.json",
    canonicalJsonBytes(semanticInventory),
    JSON_MEDIA_TYPE,
    descriptors,
  );
  await writeArtifact(
    outputDir,
    "support/compiler-inventory.json",
    canonicalJsonBytes(compilerInventory),
    JSON_MEDIA_TYPE,
    descriptors,
  );

  const rulesetDigest = sha256Digest(canonicalJson(REVIEW_RULE_CHARACTERIZATION));
  const generationReceipt = {
    contract: "salt-knowledge-generation-receipt/1",
    schema_version: "1.0.0",
    semantic_source_digest: options.semanticInputInventory.digest,
    compiler_digest: options.compilerInputInventory.digest,
    generator_digest: options.generatorDigest,
    generator_receipt: options.generatorReceipt,
    ruleset_digest: rulesetDigest,
    deterministic_parameters: {
      canonical_json: "rfc8785-json-subset/1",
      artifact_tree: "salt-artifact-tree/1",
      path_codec: "salt-posix-relative-path/1",
      timestamps: "omitted",
    },
    output_counts: {
      records: [...recordsByFamily.values()].reduce(
        (total, records) => total + records.length,
        0,
      ),
      search_records: searchRecords.length,
      examples: exampleIndex.examples.length,
      migrations: migrationInventory.records.length,
      applicability_items: applicabilityItems.length,
    },
    oversized_artifact_allowlist: descriptors
      .filter((entry) => entry.bytes > 65_536)
      .map((entry) => ({
        path: entry.path,
        bytes: entry.bytes,
        rationale: "Canonical bulk record/index artifact retained to preserve semantic parity.",
        owner: "saltdesignsystem",
        review_expires_at: "2027-08-27T00:00:00.000Z",
      })),
  };
  await writeArtifact(
    outputDir,
    "support/generation-receipt.json",
    canonicalJsonBytes(generationReceipt),
    JSON_MEDIA_TYPE,
    descriptors,
  );

  const tree = materializeArtifactTree(descriptors);
  for (const [nodePath, bytes] of tree.nodes) {
    const absolutePath = path.join(outputDir, ...nodePath.split("/"));
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, bytes, { flag: "wx" });
  }

  const manifestWithoutDigest: Omit<KnowledgeManifestV1, "bundle_digest"> = {
    $schema:
      "https://www.saltdesignsystem.com/ai/schemas/knowledge-manifest-1.json",
    schema_version: "1.0.0",
    record_schema_version: "1.0.0",
    bundle_version: options.packageVersion,
    semantic_digest: store.manifest.semantic_digest as `sha256:${string}`,
    semantic_source_digest: options.semanticInputInventory.digest as `sha256:${string}`,
    compiler_digest: options.compilerInputInventory.digest as `sha256:${string}`,
    reader_contract: "salt-knowledge-reader/1",
    analyzer_contract: "salt-artifact-analyzer/1",
    ruleset: {
      id: "salt-rules-current",
      version: "1.0.0",
      digest: rulesetDigest,
      required_rule_implementations: REVIEW_RULE_CHARACTERIZATION.map(
        (rule) => `${rule.rule_id}@1`,
      ).sort(),
    },
    operation_capabilities: Object.fromEntries(
      KNOWLEDGE_OPERATIONS.map((operation) => [operation, "supported"]),
    ) as KnowledgeManifestV1["operation_capabilities"],
    compatibility: { packages: compatibilityPackages },
    artifact_tree: {
      contract: "salt-artifact-tree/1",
      path_codec: "salt-posix-relative-path/1",
      root: tree.root,
      node_count: tree.node_count,
      tree_bytes: tree.tree_bytes,
      artifact_count: tree.artifact_count,
      artifact_bytes: tree.artifact_bytes,
      max_node_bytes: 65_536,
      max_leaf_entries: 256,
      max_internal_children: 256,
      max_nodes: 512,
      max_tree_bytes: 8_388_608,
      max_artifacts: 40_000,
    },
    support_artifacts: [
      {
        kind: "semantic_source_inventory",
        artifact: "support/semantic-source-inventory.json",
      },
      {
        kind: "compiler_inventory",
        artifact: "support/compiler-inventory.json",
      },
      {
        kind: "generation_receipt",
        artifact: "support/generation-receipt.json",
      },
    ],
    limitations: { historical_completeness: false },
  };
  const manifest: KnowledgeManifestV1 = {
    ...manifestWithoutDigest,
    bundle_digest: computeKnowledgeBundleDigest(manifestWithoutDigest),
  };
  validateKnowledgeManifestV1(manifest);
  const manifestBytes = canonicalJsonBytes(manifest);
  if (manifestBytes.byteLength > 32 * 1024) {
    throw new Error("Knowledge outer manifest exceeds 32 KiB.");
  }
  await fs.writeFile(path.join(outputDir, "manifest.json"), manifestBytes, {
    flag: "wx",
  });

  const publicationFiles = [
    "manifest.json",
    ...tree.nodes.keys(),
    ...descriptors.map((entry) => entry.path),
  ].sort();
  await fs.writeFile(
    path.join(outputDir, "publication-files.json"),
    `${JSON.stringify({ files: publicationFiles }, null, 2)}\n`,
    { flag: "wx" },
  );
  return manifest;
}
