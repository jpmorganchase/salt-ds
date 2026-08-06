import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertCatalogArtifactManifestContract,
  assertCatalogManifestFamilyPartition,
  assertCatalogPublishedSchemaContract,
  countCatalogArtifactLogicalRecords,
} from "../../../../scripts/catalogArtifactContract.mjs";
import { REPO_ROOT } from "./registryTestUtils.js";

interface CatalogArtifact {
  readonly family: string;
  readonly file: string;
  readonly record_count: number;
}

interface CatalogManifest {
  readonly artifacts: CatalogArtifact[];
  readonly support_artifacts: Array<{
    readonly file: string;
    readonly kind: string;
  }>;
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8")) as unknown;
}

describe("catalog artifact package contracts", () => {
  it("counts object, tuple, and derived target-group storage logically", () => {
    expect(
      countCatalogArtifactLogicalRecords({ kind: "object" }, [
        { id: "a" },
        { id: "b" },
      ]),
    ).toBe(2);
    expect(
      countCatalogArtifactLogicalRecords({ fields: ["id"], kind: "tuple" }, [
        ["a"],
        ["b"],
      ]),
    ).toBe(2);
    expect(
      countCatalogArtifactLogicalRecords(
        { kind: "derived_target_groups", targetField: "target" },
        [
          ["component", ["a", "b"]],
          ["token", ["c"]],
        ],
      ),
    ).toBe(3);
    expect(
      countCatalogArtifactLogicalRecords({ kind: "tagged_source_assertion" }, [
        { id: "link" },
        ["id", "token_policy", null, ["source"], "detail"],
      ]),
    ).toBe(2);
  });

  it("fails closed on malformed or unknown storage contracts", () => {
    expect(() =>
      countCatalogArtifactLogicalRecords(
        { kind: "derived_target_groups", targetField: "target" },
        [["component", []]],
      ),
    ).toThrow(/invalid target group/u);
    expect(() =>
      countCatalogArtifactLogicalRecords(
        { kind: "derived_target_groups", targetField: "target" },
        [
          ["token", ["a"]],
          ["component", ["b"]],
        ],
      ),
    ).toThrow(/unique and sorted/u);
    expect(() =>
      countCatalogArtifactLogicalRecords(
        { kind: "derived_target_groups", targetField: "target" },
        [["component", ["b", "a"]]],
      ),
    ).toThrow(/unique, non-empty strings sorted/u);
    expect(() =>
      countCatalogArtifactLogicalRecords({ kind: "tuple" }, [["a"]]),
    ).toThrow(/tuple storage/u);
    for (const records of [[["a"]], [["a", null, "extra"]], [{ id: "a" }]]) {
      expect(() =>
        countCatalogArtifactLogicalRecords(
          { fields: ["id", "value"], kind: "tuple" },
          records,
        ),
      ).toThrow(/exactly 2 field/u);
    }
    expect(() =>
      countCatalogArtifactLogicalRecords({ kind: "future" }, []),
    ).toThrow(/unknown storage kind/u);
    expect(() =>
      countCatalogArtifactLogicalRecords({ kind: "tagged_source_assertion" }, [
        ["too", "short"],
      ]),
    ).toThrow(/five-field tuples/u);
  });

  it("requires exact descriptor-derived runtime and build family partitions", () => {
    const catalogSchema = {
      family_names: ["component", "search_document", "build_audit"],
      publication_states: {
        component: "resource-ready",
        search_document: "derived",
        build_audit: "build-only",
      },
    };
    const validManifest = {
      artifacts: [{ family: "component" }, { family: "search_document" }],
      build_artifacts: [{ family: "build_audit" }],
    };
    expect(() =>
      assertCatalogManifestFamilyPartition({
        manifest: validManifest,
        catalogSchema,
      }),
    ).not.toThrow();

    for (const mutate of [
      (manifest: typeof validManifest) => {
        manifest.build_artifacts = [];
      },
      (manifest: typeof validManifest) => {
        manifest.build_artifacts.push({ family: "build_audit" });
      },
      (manifest: typeof validManifest) => {
        manifest.artifacts.push({ family: "build_audit" });
        manifest.build_artifacts = [];
      },
      (manifest: typeof validManifest) => {
        manifest.artifacts = manifest.artifacts.filter(
          (entry) => entry.family !== "component",
        );
      },
    ]) {
      const manifest = structuredClone(validManifest);
      mutate(manifest);
      expect(() =>
        assertCatalogManifestFamilyPartition({ manifest, catalogSchema }),
      ).toThrow(/families do not exactly match/u);
    }
  });

  it("validates the active grouped search index against its logical manifest count", () => {
    const generatedDir = path.join(REPO_ROOT, "packages/mcp/generated");
    const manifest = readJson(
      path.join(generatedDir, "catalog-manifest.json"),
    ) as CatalogManifest;
    const schemaEntry = manifest.support_artifacts.find(
      (artifact) => artifact.kind === "json_schema",
    );
    const searchArtifact = manifest.artifacts.find(
      (artifact) => artifact.family === "search_document",
    );

    expect(schemaEntry).toBeDefined();
    expect(searchArtifact).toBeDefined();
    const catalogSchema = readJson(
      path.join(generatedDir, schemaEntry?.file ?? ""),
    );
    expect(() =>
      assertCatalogPublishedSchemaContract(catalogSchema),
    ).not.toThrow();
    const searchEnvelope = readJson(
      path.join(generatedDir, searchArtifact?.file ?? ""),
    ) as { records: Array<[string, string[]]> };

    expect(searchEnvelope.records).toHaveLength(10);
    expect(
      assertCatalogArtifactManifestContract({
        artifact: searchArtifact,
        envelope: searchEnvelope,
        catalogSchema,
      }),
    ).toBe(3332);

    const corruptedEnvelope = structuredClone(searchEnvelope);
    corruptedEnvelope.records[0][1] = corruptedEnvelope.records[0][1].slice(1);
    expect(() =>
      assertCatalogArtifactManifestContract({
        artifact: searchArtifact,
        envelope: corruptedEnvelope,
        catalogSchema,
      }),
    ).toThrow(/logical record count 3331 does not match manifest count 3332/u);
  });
});
