import type {
  CatalogContentCodecName,
  CatalogContentReference,
  CatalogPayloadForCodec,
} from "../catalog/catalogPayloadSchemaV2.js";
import {
  assertNoLegacyContentIds,
  catalogContentCodecs,
  parseCatalogContentPayload,
} from "../catalog/catalogPayloadSchemaV2.js";
import {
  type CatalogProjectionStore,
  CatalogRegistryProjection,
} from "../catalog/catalogRegistryProjection.js";
import {
  CATALOG_FAMILY_NAMES,
  type CatalogFamilyName,
  type CatalogManifest,
  type CatalogRecord,
  type CatalogRecordForFamily,
  catalogFamilies,
  getCatalogRuntimeFamilyNames,
} from "../catalog/catalogSchemaV2.js";
import {
  compareCatalogIds,
  sha256Bytes,
} from "../catalog/catalogSerialization.js";
import type { SaltRegistry } from "../types.js";
import type {
  CatalogContentBlob,
  NormalizedCatalogV2,
} from "./normalizeCatalogV2.js";

const fatalUtf8Decoder = new TextDecoder("utf-8", { fatal: true });
const textEncoder = new TextEncoder();

function contentIdentity(mediaType: string, bytes: Uint8Array): string {
  const prefix = textEncoder.encode(`${mediaType}\0`);
  const identity = new Uint8Array(prefix.byteLength + bytes.byteLength);
  identity.set(prefix, 0);
  identity.set(bytes, prefix.byteLength);
  return sha256Bytes(identity);
}

function buildContentRecords(
  blobs: ReadonlyMap<string, CatalogContentBlob>,
): CatalogRecordForFamily<"content">[] {
  let offset = 0;
  return [...blobs.values()].sort(compareCatalogIds).map((blob) => {
    const record: CatalogRecordForFamily<"content"> = {
      family: "content",
      id: blob.id,
      codec: blob.codec,
      media_type: blob.mediaType,
      bytes: blob.bytes.byteLength,
      offset,
      length: blob.bytes.byteLength,
      extraction_method: blob.extractionMethod,
      validation: {
        state: "validated",
        method: "schema",
        basis_digest: blob.id,
        validated_at: null,
      },
    };
    offset += blob.bytes.byteLength;
    return record;
  });
}

/**
 * Read-only projection store over the logical normalized catalog.
 *
 * Records deliberately bypass persistence tuple encoding/decoding so the
 * disk-loaded projection remains an independent check of that boundary.
 * Content bytes are decoded and identity-checked independently because the
 * normalized form retains bytes rather than parsed payload objects.
 */
export class NormalizedCatalogProjectionStore
  implements CatalogProjectionStore
{
  readonly manifest: Pick<
    CatalogManifest,
    "catalog_version" | "semantic_digest"
  >;
  private readonly records: Record<CatalogFamilyName, readonly CatalogRecord[]>;
  private readonly recordsByFamilyAndId = new Map<
    CatalogFamilyName,
    ReadonlyMap<string, CatalogRecord>
  >();
  private readonly contentBlobs: ReadonlyMap<string, CatalogContentBlob>;
  private readonly decodedContent = new Map<string, unknown>();

  constructor(
    normalized: NormalizedCatalogV2,
    manifest: Pick<CatalogManifest, "catalog_version" | "semantic_digest">,
  ) {
    if (normalized.records.content.length !== 0) {
      throw new Error(
        "Normalized catalog must not pre-populate derived content-index records.",
      );
    }
    this.manifest = manifest;
    this.contentBlobs = normalized.contentBlobs;
    this.records = Object.fromEntries(
      CATALOG_FAMILY_NAMES.map((family) => {
        const familyRecords =
          family === "content"
            ? buildContentRecords(normalized.contentBlobs)
            : normalized.records[family];
        for (const record of familyRecords) {
          const parsed = catalogFamilies[family].codec.safeParse(record);
          if (!parsed.success) {
            throw new Error(
              `Normalized ${family} record '${record.id}' does not pass its family codec.`,
              { cause: parsed.error },
            );
          }
        }
        return [family, familyRecords] as const;
      }),
    ) as unknown as Record<CatalogFamilyName, readonly CatalogRecord[]>;
    for (const family of CATALOG_FAMILY_NAMES) {
      const byId = new Map<string, CatalogRecord>();
      for (const record of this.records[family]) {
        if (byId.has(record.id)) {
          throw new Error(
            `Normalized catalog contains duplicate ${family} id '${record.id}'.`,
          );
        }
        byId.set(record.id, record);
      }
      this.recordsByFamilyAndId.set(family, byId);
    }
  }

  getFamily<Family extends CatalogFamilyName>(
    family: Family,
  ): readonly CatalogRecordForFamily<Family>[] {
    return this.records[family] as readonly CatalogRecordForFamily<Family>[];
  }

  getRecord<Family extends CatalogFamilyName>(
    family: Family,
    id: string,
  ): CatalogRecordForFamily<Family> | null {
    return (
      (this.recordsByFamilyAndId.get(family)?.get(id) as
        | CatalogRecordForFamily<Family>
        | undefined) ?? null
    );
  }

  private getContentValue<Codec extends CatalogContentCodecName>(
    reference: CatalogContentReference<Codec>,
  ): CatalogPayloadForCodec<Codec> {
    const cacheKey = `${reference.id}\0${reference.codec}`;
    if (this.decodedContent.has(cacheKey)) {
      return this.decodedContent.get(cacheKey) as CatalogPayloadForCodec<Codec>;
    }
    const blob = this.contentBlobs.get(reference.id);
    if (!blob) {
      throw new Error(`Missing normalized content '${reference.id}'.`);
    }
    const expectedMediaType = catalogContentCodecs[reference.codec].mediaType;
    if (
      blob.codec !== reference.codec ||
      blob.mediaType !== expectedMediaType
    ) {
      throw new Error(
        `Normalized content '${reference.id}' does not match codec '${reference.codec}'.`,
      );
    }
    const actualId = contentIdentity(blob.mediaType, blob.bytes);
    if (actualId !== reference.id) {
      throw new Error(
        `Normalized content object digest mismatch for '${reference.id}'; received '${actualId}'.`,
      );
    }

    let text: string;
    try {
      text = fatalUtf8Decoder.decode(blob.bytes);
    } catch (error) {
      throw new Error(
        `Normalized content '${reference.id}' is not valid UTF-8.`,
        { cause: error },
      );
    }
    let raw: unknown = text;
    if (!blob.mediaType.startsWith("text/")) {
      try {
        raw = JSON.parse(text) as unknown;
      } catch (error) {
        throw new Error(
          `Normalized content '${reference.id}' is not valid JSON.`,
          { cause: error },
        );
      }
    }
    assertNoLegacyContentIds(raw);
    const parsed = parseCatalogContentPayload(reference.codec, raw);
    this.decodedContent.set(cacheKey, parsed);
    return parsed;
  }

  getContentText<Codec extends CatalogContentCodecName>(
    reference: CatalogContentReference<Codec>,
  ): string {
    const value = this.getContentValue(reference);
    if (typeof value !== "string") {
      throw new Error(
        `Normalized content '${reference.id}' with codec '${reference.codec}' is not text.`,
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
        `Normalized content '${reference.id}' with codec '${reference.codec}' is not JSON.`,
      );
    }
    return value;
  }

  prefetch(): void {
    for (const family of getCatalogRuntimeFamilyNames()) {
      void this.getFamily(family);
    }
    for (const blob of this.contentBlobs.values()) {
      void this.getContentValue({
        family: "content",
        id: blob.id,
        codec: blob.codec,
      });
    }
  }
}

export function projectNormalizedCatalogV2(
  normalized: NormalizedCatalogV2,
  manifest: Pick<CatalogManifest, "catalog_version" | "semantic_digest">,
  options: { prefetch?: boolean } = {},
): SaltRegistry {
  return new CatalogRegistryProjection(
    new NormalizedCatalogProjectionStore(normalized, manifest),
  ).asRegistry({ ...options, materialize: true });
}
