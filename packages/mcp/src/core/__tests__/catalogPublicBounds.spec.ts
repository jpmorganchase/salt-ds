import { describe, expect, it } from "vitest";
import {
  MAX_CATALOG_CONTENT_BYTES,
  MAX_CATALOG_ID_CHARS,
} from "@salt-ds/knowledge";
import {
  normalizeCatalogPublicCitation,
  normalizeCatalogPublicLocator,
} from "../catalog/catalogPublicCitation.js";
import { serializeCatalogResourceEnvelope } from "../catalog/catalogResourceEnvelope.js";
import {
  type CatalogManifest,
  contentCodec,
  packageFactCodec,
  policyProfileCodec,
} from "@salt-ds/knowledge";
import {
  assertPublicResourceText,
  MAX_PUBLIC_RESOURCE_UTF8_BYTES,
  publicResourceUtf8Bytes,
  serializePublicResourceJson,
} from "../publicResourceBudget.js";

const CONTENT_ID = `sha256:${"a".repeat(64)}`;

describe("catalog public bounds", () => {
  it.each([
    ["ASCII", "x", 1],
    ["multibyte", "漢", 3],
    ["JSON-escaped", "\u0001", 6],
  ] as const)(
    "measures the exact %s serialized UTF-8 resource boundary",
    (_label, unit, encodedUnitBytes) => {
      const empty = JSON.stringify({ value: "" });
      const available = MAX_PUBLIC_RESOURCE_UTF8_BYTES - empty.length;
      const value =
        unit.repeat(Math.floor(available / encodedUnitBytes)) +
        "x".repeat(available % encodedUnitBytes);
      const exact = serializePublicResourceJson("boundary", { value });
      expect(publicResourceUtf8Bytes(exact)).toBe(
        MAX_PUBLIC_RESOURCE_UTF8_BYTES,
      );
      expect(() =>
        serializePublicResourceJson("boundary", { value: `${value}x` }),
      ).toThrow(/Public resource 'boundary'.*65537.*65536/iu);
    },
  );

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

  it("serializes a valid content-linked catalog envelope at the exact limit", () => {
    const manifest = {
      semantic_digest: `sha256:${"b".repeat(64)}`,
    } as CatalogManifest;
    const baseRecord = {
      family: "policy_profile",
      id: "policy-profile.boundary",
      summary: "",
      policy_kind: "token_usage",
      body_content_ref: {
        family: "content",
        id: CONTENT_ID,
        codec: "token_usage",
      },
    } as const;
    expect(policyProfileCodec.safeParse(baseRecord).success).toBe(true);
    const baseBytes = publicResourceUtf8Bytes(
      serializeCatalogResourceEnvelope(manifest, baseRecord),
    );
    const record = {
      ...baseRecord,
      summary: "x".repeat(MAX_PUBLIC_RESOURCE_UTF8_BYTES - baseBytes),
    };
    expect(policyProfileCodec.safeParse(record).success).toBe(true);
    const serialized = serializeCatalogResourceEnvelope(manifest, record);
    expect(serialized).toContain(
      `salt://catalog/v2/sha256-${"b".repeat(64)}/content/${encodeURIComponent(CONTENT_ID)}`,
    );
    expect(publicResourceUtf8Bytes(serialized)).toBe(
      MAX_PUBLIC_RESOURCE_UTF8_BYTES,
    );
    expect(assertPublicResourceText("catalog boundary", serialized)).toBe(
      serialized,
    );
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
