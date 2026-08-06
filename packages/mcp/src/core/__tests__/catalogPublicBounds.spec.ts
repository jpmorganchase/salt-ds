import { describe, expect, it } from "vitest";
import {
  MAX_CATALOG_CONTENT_BYTES,
  MAX_CATALOG_ID_CHARS,
} from "../catalog/catalogPayloadSchemaV2.js";
import {
  normalizeCatalogPublicCitation,
  normalizeCatalogPublicLocator,
} from "../catalog/catalogPublicCitation.js";
import {
  type CatalogManifest,
  contentCodec,
  packageFactCodec,
} from "../catalog/catalogSchemaV2.js";

const CONTENT_ID = `sha256:${"a".repeat(64)}`;

describe("catalog public bounds", () => {
  it("rejects content metadata beyond the public resource read limit", () => {
    const base = {
      family: "content",
      id: CONTENT_ID,
      codec: "page_body",
      media_type: "application/vnd.salt.entity-details+json",
      encoding: "identity",
      bytes: MAX_CATALOG_CONTENT_BYTES,
      offset: 0,
      length: MAX_CATALOG_CONTENT_BYTES,
      extraction_method: "source_extraction",
      validation: {
        state: "validated",
        method: "digest_bound",
        basis_digest: CONTENT_ID,
        validated_at: null,
      },
    } as const;
    expect(contentCodec.safeParse(base).success).toBe(true);
    expect(
      contentCodec.safeParse({
        ...base,
        bytes: MAX_CATALOG_CONTENT_BYTES + 1,
        length: MAX_CATALOG_CONTENT_BYTES + 1,
      }).success,
    ).toBe(false);
  });

  it("rejects catalog IDs that could defeat listing byte bounds", () => {
    const minimalPackage = {
      family: "package",
      id: "x".repeat(MAX_CATALOG_ID_CHARS + 1),
      name: "fixture",
      aliases: [],
      summary: "fixture",
    };
    expect(packageFactCodec.safeParse(minimalPackage).success).toBe(false);
  });

  it("normalizes every public locator to absolute HTTPS", () => {
    expect(normalizeCatalogPublicLocator("/salt/components/button")).toBe(
      "https://www.saltdesignsystem.com/salt/components/button",
    );
    expect(normalizeCatalogPublicLocator("https://example.test/docs")).toBe(
      "https://example.test/docs",
    );
    expect(() => normalizeCatalogPublicLocator("site/docs/button.mdx")).toThrow(
      /unsupported public citation locator/iu,
    );
    for (const unsafe of [
      "http://example.test/docs",
      "//example.test/docs",
      "https://user:pass@example.test/docs",
      "https://example.test\\docs",
      "https://example.test/a b",
      "https://example.test/a\u0000b",
    ]) {
      expect(() => normalizeCatalogPublicLocator(unsafe)).toThrow();
    }
  });

  it("projects every public catalog URI form through structured citations", () => {
    const manifest = {
      semantic_digest: `sha256:${"b".repeat(64)}`,
    } as CatalogManifest;
    const prefix = `salt://catalog/v2/sha256-${"b".repeat(64)}`;

    expect(
      normalizeCatalogPublicCitation({ kind: "catalog_manifest", manifest }),
    ).toBe(`${prefix}/manifest`);
    expect(
      normalizeCatalogPublicCitation({
        kind: "catalog_record",
        manifest,
        family: "component",
        id: "Button / primary",
      }),
    ).toBe(`${prefix}/components/Button%20%2F%20primary`);
    expect(
      normalizeCatalogPublicCitation({
        kind: "catalog_record_template",
        manifest,
        family: "component",
      }),
    ).toBe(`${prefix}/components/{id}`);
    expect(
      normalizeCatalogPublicCitation({
        kind: "catalog_family_template",
        manifest,
      }),
    ).toBe(`${prefix}/{family}/{id}`);
    expect(
      normalizeCatalogPublicCitation({
        kind: "project_policy_chunk_template",
        rootDir: "D:/project root",
        digest: `sha256:${"c".repeat(64)}`,
      }),
    ).toMatch(
      new RegExp(
        `^salt://project-policy/v2/[A-Za-z0-9_-]+/sha256-${"c".repeat(64)}/chunk/\\{index\\}$`,
        "u",
      ),
    );
  });
});
