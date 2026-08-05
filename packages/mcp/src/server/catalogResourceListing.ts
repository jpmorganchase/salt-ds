import { Buffer } from "node:buffer";
import type {
  CatalogManifest,
  CatalogRuntimeFamilyName,
} from "../core/runtime.js";
import { normalizeCatalogPublicCitation } from "../core/runtime.js";

export const MAX_CATALOG_RESOURCES_PER_PAGE = 512;
export const MAX_CATALOG_RESOURCE_LIST_PAGE_UTF8_BYTES = 256 * 1024;
export const MAX_CATALOG_RESOURCE_DESCRIPTOR_UTF8_BYTES = 8 * 1024;

const CURSOR_VERSION = 1;
const CURSOR_PATTERN = /^[A-Za-z0-9_-]+$/u;

export interface CatalogResourceListingFamily {
  family: CatalogRuntimeFamilyName;
  count: number;
  idAt(index: number): string | null;
  mediaTypeAt?(index: number): string | null;
}

export interface CatalogResourceListingSource {
  manifest: CatalogManifest;
  manifestUri: string;
  families: readonly CatalogResourceListingFamily[];
}

export interface CatalogResourceDescriptor {
  uri: string;
  name: string;
  mimeType: string;
}

export interface CatalogResourceListPage {
  [key: string]: unknown;
  resources: CatalogResourceDescriptor[];
  nextCursor?: string;
}

interface CatalogResourceCursor {
  v: typeof CURSOR_VERSION;
  catalog: string;
  digest: string;
  offset: number;
}

export class InvalidCatalogResourceCursorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCatalogResourceCursorError";
  }
}

function totalResourceCount(source: CatalogResourceListingSource): number {
  return 1 + source.families.reduce((total, family) => total + family.count, 0);
}

function encodeCursor(
  source: CatalogResourceListingSource,
  offset: number,
): string {
  const payload: CatalogResourceCursor = {
    v: CURSOR_VERSION,
    catalog: source.manifest.catalog_version,
    digest: source.manifest.semantic_digest,
    offset,
  };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(
  source: CatalogResourceListingSource,
  cursor: string | undefined,
  total: number,
): number {
  if (cursor === undefined) return 0;
  if (
    cursor.length === 0 ||
    cursor.length > 1_024 ||
    !CURSOR_PATTERN.test(cursor)
  ) {
    throw new InvalidCatalogResourceCursorError(
      "The resource cursor is malformed.",
    );
  }
  let parsed: unknown;
  try {
    const bytes = Buffer.from(cursor, "base64url");
    if (bytes.toString("base64url") !== cursor) {
      throw new Error("noncanonical base64url");
    }
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new InvalidCatalogResourceCursorError(
      "The resource cursor is malformed.",
    );
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    Object.keys(parsed).sort().join(",") !== "catalog,digest,offset,v"
  ) {
    throw new InvalidCatalogResourceCursorError(
      "The resource cursor has an unsupported shape.",
    );
  }
  const payload = parsed as Partial<CatalogResourceCursor>;
  if (payload.v !== CURSOR_VERSION) {
    throw new InvalidCatalogResourceCursorError(
      "The resource cursor version is not supported.",
    );
  }
  if (
    payload.catalog !== source.manifest.catalog_version ||
    payload.digest !== source.manifest.semantic_digest
  ) {
    throw new InvalidCatalogResourceCursorError(
      "The resource cursor belongs to a different catalog release.",
    );
  }
  if (
    !Number.isSafeInteger(payload.offset) ||
    (payload.offset as number) <= 0 ||
    (payload.offset as number) >= total
  ) {
    throw new InvalidCatalogResourceCursorError(
      "The resource cursor offset is outside the catalog.",
    );
  }
  return payload.offset as number;
}

function descriptorAt(
  source: CatalogResourceListingSource,
  offset: number,
): CatalogResourceDescriptor {
  if (offset === 0) {
    return {
      uri: source.manifestUri,
      name: "salt-catalog-manifest",
      mimeType: "application/json",
    };
  }

  let familyOffset = offset - 1;
  for (const family of source.families) {
    if (familyOffset >= family.count) {
      familyOffset -= family.count;
      continue;
    }
    const id = family.idAt(familyOffset);
    if (!id) {
      throw new Error(
        `Catalog family '${family.family}' omitted record ${familyOffset}.`,
      );
    }
    const uri = normalizeCatalogPublicCitation({
      kind: "catalog_record",
      manifest: source.manifest,
      family: family.family,
      id,
    });
    return {
      uri,
      name: `${family.family}:${id}`,
      mimeType: family.mediaTypeAt?.(familyOffset) ?? "application/json",
    };
  }
  throw new Error(`Catalog resource offset ${offset} is outside the catalog.`);
}

function utf8Bytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function pageUtf8Bytes(
  resourceBytes: number,
  resourceCount: number,
  nextCursor: string | undefined,
): number {
  const emptyPageBytes = Buffer.byteLength('{"resources":[]}', "utf8");
  const separators = Math.max(0, resourceCount - 1);
  const cursorBytes = nextCursor
    ? Buffer.byteLength(`,"nextCursor":${JSON.stringify(nextCursor)}`, "utf8")
    : 0;
  return emptyPageBytes + resourceBytes + separators + cursorBytes;
}

export function listCatalogResourcePage(
  source: CatalogResourceListingSource,
  cursor?: string,
): CatalogResourceListPage {
  const total = totalResourceCount(source);
  const start = decodeCursor(source, cursor, total);
  const resources: CatalogResourceDescriptor[] = [];
  let resourceBytes = 0;

  while (
    start + resources.length < total &&
    resources.length < MAX_CATALOG_RESOURCES_PER_PAGE
  ) {
    const descriptor = descriptorAt(source, start + resources.length);
    const descriptorBytes = utf8Bytes(descriptor);
    if (descriptorBytes > MAX_CATALOG_RESOURCE_DESCRIPTOR_UTF8_BYTES) {
      throw new Error(
        `Catalog resource descriptor at offset ${start + resources.length} exceeds the public byte limit.`,
      );
    }
    const nextOffset = start + resources.length + 1;
    const nextCursor =
      nextOffset < total ? encodeCursor(source, nextOffset) : undefined;
    if (
      pageUtf8Bytes(
        resourceBytes + descriptorBytes,
        resources.length + 1,
        nextCursor,
      ) > MAX_CATALOG_RESOURCE_LIST_PAGE_UTF8_BYTES
    ) {
      if (resources.length === 0) {
        throw new Error(
          `Catalog resource descriptor at offset ${start + resources.length} cannot fit in a public page.`,
        );
      }
      break;
    }
    resources.push(descriptor);
    resourceBytes += descriptorBytes;
  }

  const nextOffset = start + resources.length;
  return {
    resources,
    ...(nextOffset < total
      ? { nextCursor: encodeCursor(source, nextOffset) }
      : {}),
  };
}
