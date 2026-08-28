import { brotliDecompressSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import {
  verifyArtifactTree,
  type ArtifactDescriptor,
} from "./artifactTree.js";
import { sha256Digest } from "./digestCodec.js";
import { parseKnowledgeArtifactPath } from "./pathCodec.js";
import {
  validateKnowledgeManifestV1,
  type KnowledgeManifestV1,
} from "../schemas/knowledgeManifestV1.js";

export interface KnowledgeRecordV1 {
  key: string;
  family: string;
  id: string;
  title: string;
  summary: string;
  data: any;
}

interface KnowledgeRecordSet {
  contract: "salt-knowledge-record-set/1";
  schema_version: "1.0.0";
  family: string;
  records: KnowledgeRecordV1[];
}

interface ContentRecordData {
  family: "content";
  id: string;
  codec: string;
  media_type: string;
  bytes: number;
  offset: number;
  length: number;
  encoding: "br" | "identity";
}

const MAX_KNOWLEDGE_CONTENT_BYTES = 64 * 1024;

export const KNOWLEDGE_RECORD_FAMILIES = [
  "package",
  "component",
  "icon",
  "country_symbol",
  "pattern",
  "guide",
  "page",
  "token",
  "api_symbol",
  "deprecation",
  "concept",
  "declaration_context",
  "token_declaration",
  "relation",
  "policy_profile",
  "content",
  "evidence",
  "source",
  "accessibility_claim",
  "search_document",
] as const;

export type KnowledgeRecordFamily = (typeof KNOWLEDGE_RECORD_FAMILIES)[number];

export interface KnowledgeRecordStore {
  readonly manifest: KnowledgeManifestV1;
  getFamily(family: any): readonly any[];
  getRecord(family: any, id: string): any | null;
  getContentValue(reference: {
    family?: "content";
    id: string;
    codec: any;
  }): any;
  getContentSourceText(reference: {
    family?: "content";
    id: string;
    codec: any;
  }): string;
  getContentJson(reference: {
    family: "content";
    id: string;
    codec: any;
  }): any;
  getContentText(reference: {
    family: "content";
    id: string;
    codec: any;
  }): string;
  validateCrossReferences(): unknown;
}

function readRegularFile(rootDir: string, relativePath: string): Buffer {
  const artifactPath = parseKnowledgeArtifactPath(relativePath);
  const root = path.resolve(rootDir);
  const absolutePath = path.resolve(root, ...artifactPath.split("/"));
  const relative = path.relative(root, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Knowledge artifact escapes the bundle: ${artifactPath}`);
  }
  const stats = fs.lstatSync(absolutePath);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error(`Knowledge artifact is not a regular file: ${artifactPath}`);
  }
  return fs.readFileSync(absolutePath);
}

function parseJson(bytes: Buffer, label: string): any {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`, { cause: error });
  }
}

export interface KnowledgeValidationMetrics {
  artifacts: number;
  artifact_bytes: number;
  records: number;
}

export class KnowledgeStore {
  readonly bundleDir: string;
  readonly manifest: KnowledgeManifestV1;
  private readonly artifactByPath: ReadonlyMap<string, ArtifactDescriptor>;
  private readonly recordSets = new Map<string, readonly KnowledgeRecordV1[]>();
  private readonly recordsById = new Map<string, ReadonlyMap<string, KnowledgeRecordV1>>();
  private contentPack: Buffer | null = null;
  private validationMetrics: KnowledgeValidationMetrics | null = null;

  constructor(options: { bundleDir: string }) {
    this.bundleDir = path.resolve(options.bundleDir);
    const manifestBytes = readRegularFile(this.bundleDir, "manifest.json");
    if (manifestBytes.byteLength > 32 * 1024) {
      throw new Error("Knowledge manifest exceeds 32 KiB.");
    }
    this.manifest = validateKnowledgeManifestV1(
      parseJson(manifestBytes, "Knowledge manifest"),
    );
    const descriptors = verifyArtifactTree(
      this.bundleDir,
      this.manifest.artifact_tree,
    );
    this.artifactByPath = new Map(
      descriptors.map((descriptor) => [descriptor.path, descriptor]),
    );
  }

  private readVerifiedArtifact(relativePath: string): Buffer {
    const artifactPath = parseKnowledgeArtifactPath(relativePath);
    const descriptor = this.artifactByPath.get(artifactPath);
    if (!descriptor) {
      throw new Error(`Knowledge artifact is absent from the tree: ${artifactPath}`);
    }
    const bytes = readRegularFile(this.bundleDir, artifactPath);
    if (
      bytes.byteLength !== descriptor.bytes ||
      sha256Digest(bytes) !== descriptor.sha256
    ) {
      throw new Error(`Knowledge artifact digest mismatch: ${artifactPath}`);
    }
    return bytes;
  }

  /** Read one manifest-selected artifact after verifying its descriptor bytes. */
  readArtifact(relativePath: string): Buffer {
    return Buffer.from(this.readVerifiedArtifact(relativePath));
  }

  getKnowledgeFamily(family: KnowledgeRecordFamily): readonly KnowledgeRecordV1[] {
    const cached = this.recordSets.get(family);
    if (cached) return cached;
    const raw =
      family === "search_document"
        ? parseJson(
            this.readVerifiedArtifact("indexes/search/all.json"),
            "Knowledge search shard",
          )
        : parseJson(
            this.readVerifiedArtifact(`records/${family}.json`),
            `Knowledge ${family} records`,
          );
    if (
      (family === "search_document"
        ? raw.contract !== "salt-search-shard/1"
        : raw.contract !== "salt-knowledge-record-set/1") ||
      raw.schema_version !== "1.0.0" ||
      (family === "search_document" &&
        raw.scoring_version !== "salt-lexical-ranking/1") ||
      !Array.isArray(raw.records)
    ) {
      throw new Error(`Knowledge ${family} record envelope is invalid.`);
    }
    const seen = new Set<string>();
    const records = raw.records.map((record: KnowledgeRecordV1) => {
      if (
        !record ||
        record.family !== family ||
        typeof record.id !== "string" ||
        record.key !== `record:${family}:${record.id}` ||
        seen.has(record.id) ||
        record.data?.family !== family ||
        record.data?.id !== record.id
      ) {
        throw new Error(`Knowledge ${family} record identity is invalid.`);
      }
      seen.add(record.id);
      return Object.freeze(record);
    });
    this.recordSets.set(family, Object.freeze(records));
    this.recordsById.set(
      family,
      new Map(records.map((record: KnowledgeRecordV1) => [record.id, record])),
    );
    return records;
  }

  getKnowledgeRecord(
    family: KnowledgeRecordFamily,
    id: string,
  ): KnowledgeRecordV1 | null {
    void this.getKnowledgeFamily(family);
    return this.recordsById.get(family)?.get(id) ?? null;
  }

  /** Protocol-neutral logical record access used by current adapters. */
  getFamily(family: KnowledgeRecordFamily): readonly any[] {
    return this.getKnowledgeFamily(family).map((record) => record.data);
  }

  getRecord(family: KnowledgeRecordFamily, id: string): any | null {
    return this.getKnowledgeRecord(family, id)?.data ?? null;
  }

  private getContentPack(): Buffer {
    return (this.contentPack ??= this.readVerifiedArtifact(
      "content/content.pack",
    ));
  }

  getContentBytes(reference: {
    family?: "content";
    id: string;
    codec: string;
  }): Buffer {
    const record = this.getRecord("content", reference.id) as
      | ContentRecordData
      | null;
    if (
      !record ||
      record.codec !== reference.codec ||
      (record.encoding !== "br" && record.encoding !== "identity") ||
      typeof record.media_type !== "string" ||
      record.media_type.length === 0
    ) {
      throw new Error(`Unknown Knowledge content reference: ${reference.id}.`);
    }
    if (
      !Number.isSafeInteger(record.bytes) ||
      !Number.isSafeInteger(record.offset) ||
      !Number.isSafeInteger(record.length) ||
      record.bytes < 0 ||
      record.bytes > MAX_KNOWLEDGE_CONTENT_BYTES ||
      record.offset < 0 ||
      record.length < 1 ||
      record.offset + record.length > this.getContentPack().byteLength
    ) {
      throw new Error(`Knowledge content bounds are invalid: ${reference.id}.`);
    }
    const storedBytes = this.getContentPack().subarray(
      record.offset,
      record.offset + record.length,
    );
    const bytes =
      record.encoding === "br"
        ? brotliDecompressSync(storedBytes, {
            maxOutputLength: MAX_KNOWLEDGE_CONTENT_BYTES,
          })
        : Buffer.from(storedBytes);
    const contentIdentity = Buffer.concat([
      Buffer.from(`${record.media_type}\0`, "utf8"),
      bytes,
    ]);
    if (
      bytes.byteLength !== record.bytes ||
      sha256Digest(contentIdentity) !== record.id
    ) {
      throw new Error(`Knowledge content digest mismatch: ${reference.id}.`);
    }
    return bytes;
  }

  getContentSourceText(reference: {
    family?: "content";
    id: string;
    codec: string;
  }): string {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      this.getContentBytes(reference),
    );
  }

  getContentValue(reference: {
    family?: "content";
    id: string;
    codec: string;
  }): any {
    const record = this.getRecord("content", reference.id) as ContentRecordData;
    const text = this.getContentSourceText(reference);
    return record.media_type.startsWith("text/")
      ? text
      : parseJson(Buffer.from(text, "utf8"), `Knowledge content ${reference.id}`);
  }

  getContentText(reference: {
    family?: "content";
    id: string;
    codec: string;
  }): string {
    const value = this.getContentValue(reference);
    if (typeof value !== "string") {
      throw new Error(`Knowledge content is not text: ${reference.id}.`);
    }
    return value;
  }

  getContentJson(reference: {
    family?: "content";
    id: string;
    codec: string;
  }): any {
    const value = this.getContentValue(reference);
    if (typeof value === "string") {
      throw new Error(`Knowledge content is not JSON: ${reference.id}.`);
    }
    return value;
  }

  validateCrossReferences(): KnowledgeValidationMetrics {
    if (this.validationMetrics) return this.validationMetrics;
    let recordCount = 0;
    for (const family of KNOWLEDGE_RECORD_FAMILIES) {
      recordCount += this.getKnowledgeFamily(family).length;
    }
    const visit = (value: unknown, owner: string): void => {
      if (Array.isArray(value)) {
        for (const entry of value) visit(entry, owner);
        return;
      }
      if (!value || typeof value !== "object") return;
      const candidate = value as Record<string, unknown>;
      if (
        typeof candidate.family === "string" &&
        (KNOWLEDGE_RECORD_FAMILIES as readonly string[]).includes(
          candidate.family,
        ) &&
        typeof candidate.id === "string" &&
        !this.getKnowledgeRecord(
          candidate.family as KnowledgeRecordFamily,
          candidate.id,
        )
      ) {
        throw new Error(
          `${owner} has unresolved ${candidate.family}:${candidate.id}.`,
        );
      }
      for (const entry of Object.values(candidate)) visit(entry, owner);
    };
    for (const family of KNOWLEDGE_RECORD_FAMILIES) {
      for (const record of this.getKnowledgeFamily(family)) {
        visit(record.data, `${family}:${record.id}`);
      }
    }
    this.validationMetrics = Object.freeze({
      artifacts: this.manifest.artifact_tree.artifact_count,
      artifact_bytes: this.manifest.artifact_tree.artifact_bytes,
      records: recordCount,
    });
    return this.validationMetrics;
  }

  ensureKnowledgeVerified(): KnowledgeValidationMetrics {
    return this.validateCrossReferences();
  }

  prefetch(options: { verifyEveryContentObject?: boolean } = {}): void {
    this.validateCrossReferences();
    if (options.verifyEveryContentObject) {
      for (const record of this.getFamily("content") as ContentRecordData[]) {
        void this.getContentValue({ id: record.id, codec: record.codec });
      }
    }
  }
}

export function createKnowledgeStore(options: {
  bundleDir: string;
}): KnowledgeStore {
  return new KnowledgeStore(options);
}
