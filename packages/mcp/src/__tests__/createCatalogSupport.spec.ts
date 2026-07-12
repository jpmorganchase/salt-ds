import { describe, expect, it } from "vitest";
import { buildRegistry } from "../core/build/buildRegistry.js";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import { lookupCreateCatalogEntity } from "../core/tools/createCatalogSupport.js";
import { REPO_ROOT, withRegistryDir } from "./registryTestUtils.js";

describe("create catalog entity support", () => {
  it("exposes canonical entity summaries for the registered resource", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await buildRegistry({
          sourceRoot: REPO_ROOT,
          outputDir: registryDir,
          timestamp: "2026-04-22T00:00:00Z",
        });
      },
      async (registryDir) => {
        const registry = await loadRegistry({ registryDir });

        const entity = lookupCreateCatalogEntity(registry, "Tabs");
        const tableEntity = lookupCreateCatalogEntity(registry, "Table");

        expect(entity).toEqual(
          expect.objectContaining({
            status: "resolved",
            matches: expect.arrayContaining([
              expect.objectContaining({
                name: "Tabs",
                aliases: expect.arrayContaining(["Tab"]),
                example_count: expect.any(Number),
              }),
            ]),
          }),
        );

        expect(tableEntity).toEqual(
          expect.objectContaining({
            status: "resolved",
            matches: expect.arrayContaining([
              expect.objectContaining({
                name: "Table",
                retrieval_signals: expect.objectContaining({
                  contrast_targets: expect.arrayContaining([
                    expect.objectContaining({
                      target: "Data grid",
                      relation: "prefer-instead",
                    }),
                  ]),
                }),
              }),
            ]),
          }),
        );
      },
    );
  }, 60_000);
});
