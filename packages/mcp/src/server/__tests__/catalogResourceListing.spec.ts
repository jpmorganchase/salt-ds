import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { catalogManifestResourceUri } from "../../core/catalog/catalogResourceIdentity.js";
import type { CatalogManifest } from "../../core/catalog/catalogSchemaV2.js";
import {
  type CatalogResourceListingSource,
  InvalidCatalogResourceCursorError,
  listCatalogResourcePage,
  MAX_CATALOG_RESOURCE_LIST_PAGE_UTF8_BYTES,
  MAX_CATALOG_RESOURCES_PER_PAGE,
} from "../catalogResourceListing.js";

function syntheticManifest(
  digest = `sha256:${"a".repeat(64)}`,
): CatalogManifest {
  return {
    catalog_version: "synthetic-larger-than-current",
    semantic_digest: digest,
  } as CatalogManifest;
}

function syntheticSource(recordCount: number): CatalogResourceListingSource {
  const manifest = syntheticManifest();
  return {
    manifest,
    manifestUri: catalogManifestResourceUri(manifest),
    families: [
      {
        family: "component",
        count: recordCount,
        idAt: (index) =>
          `component.synthetic-${String(index).padStart(6, "0")}`,
      },
    ],
  };
}

describe("catalog resource pagination", () => {
  it("exhausts a catalog larger than today's without gaps or duplicates", () => {
    const source = syntheticSource(21_500);
    const uris: string[] = [];
    let cursor: string | undefined;
    let pages = 0;

    do {
      const page = listCatalogResourcePage(source, cursor);
      expect(page.resources.length).toBeGreaterThan(0);
      expect(page.resources.length).toBeLessThanOrEqual(
        MAX_CATALOG_RESOURCES_PER_PAGE,
      );
      expect(
        Buffer.byteLength(JSON.stringify(page), "utf8"),
      ).toBeLessThanOrEqual(MAX_CATALOG_RESOURCE_LIST_PAGE_UTF8_BYTES);
      uris.push(...page.resources.map((resource) => resource.uri));
      cursor = page.nextCursor;
      pages += 1;
    } while (cursor);

    expect(pages).toBeGreaterThan(1);
    expect(uris).toHaveLength(21_501);
    expect(new Set(uris).size).toBe(uris.length);
    expect(uris[0]).toBe(source.manifestUri);
    expect(uris[25]).toContain("component.synthetic-000024");
    expect(uris[26]).toContain("component.synthetic-000025");
    expect(uris[103]).toContain("component.synthetic-000102");
    expect(uris.at(-1)).toContain("component.synthetic-021499");
  });

  it("omits a cursor when the final page is exactly full", () => {
    const page = listCatalogResourcePage(
      syntheticSource(MAX_CATALOG_RESOURCES_PER_PAGE - 1),
    );
    expect(page.resources).toHaveLength(MAX_CATALOG_RESOURCES_PER_PAGE);
    expect(page.nextCursor).toBeUndefined();
  });

  it("rejects malformed, stale, tampered, and out-of-range cursors", () => {
    const source = syntheticSource(1_000);
    const cursor = listCatalogResourcePage(source).nextCursor;
    if (!cursor) throw new Error("Synthetic first page omitted its cursor.");
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as Record<string, unknown>;
    const encoded = (value: Record<string, unknown>) =>
      Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

    for (const candidate of [
      "%%%",
      encoded({ ...decoded, digest: `sha256:${"b".repeat(64)}` }),
      encoded({ ...decoded, v: 2 }),
      encoded({ ...decoded, offset: 0 }),
      encoded({ ...decoded, offset: 1_001 }),
      encoded({ ...decoded, invented: true }),
    ]) {
      expect(() => listCatalogResourcePage(source, candidate)).toThrow(
        InvalidCatalogResourceCursorError,
      );
    }
  });

  it("defensively rejects a descriptor that cannot fit its public bound", () => {
    const manifest = syntheticManifest();
    const source: CatalogResourceListingSource = {
      manifest,
      manifestUri: catalogManifestResourceUri(manifest),
      families: [
        {
          family: "component",
          count: 1,
          idAt: () => "x".repeat(9_000),
        },
      ],
    };
    expect(() => listCatalogResourcePage(source)).toThrow(
      /descriptor.*byte limit/iu,
    );
  });
});
