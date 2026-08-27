import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { CatalogManifest } from "../catalog/catalogSchemaV2.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import { getPackageRoot } from "../registry/paths.js";
import {
  catalogFamilyArtifactPath,
  copyCatalogV2Artifacts,
  createBuiltCatalogV2Fixture,
  VERIFIED_CATALOG_CONTEXT_TEST_TIMEOUT_MS,
  withRegistryDir,
} from "./registryTestUtils.js";

let catalogFixtureDirectory = "";

beforeAll(async () => {
  catalogFixtureDirectory = await createBuiltCatalogV2Fixture(
    "salt-load-registry-source-",
  );
}, VERIFIED_CATALOG_CONTEXT_TEST_TIMEOUT_MS);

afterAll(async () => {
  if (catalogFixtureDirectory) {
    await fs.rm(catalogFixtureDirectory, {
      recursive: true,
      force: true,
    });
  }
});

describe("loadRegistry", () => {
  it("skips nested module-format markers when locating the package root", async () => {
    await withRegistryDir(
      async (tempRoot) => {
        const packageRoot = path.join(tempRoot, "package");
        const nestedModuleDir = path.join(
          packageRoot,
          "dist-cjs",
          "core",
          "registry",
        );
        await fs.mkdir(nestedModuleDir, { recursive: true });
        await fs.writeFile(
          path.join(packageRoot, "package.json"),
          JSON.stringify({ name: "@salt-ds/knowledge" }),
        );
        await fs.writeFile(
          path.join(packageRoot, "dist-cjs", "package.json"),
          JSON.stringify({ type: "commonjs" }),
        );
      },
      async (tempRoot) => {
        const packageRoot = path.join(tempRoot, "package");
        const nestedModuleDir = path.join(
          packageRoot,
          "dist-cjs",
          "core",
          "registry",
        );
        expect(
          getPackageRoot(
            pathToFileURL(path.join(nestedModuleDir, "loadRegistry.js")).href,
          ),
        ).toBe(packageRoot);
      },
    );
  });

  it("fails clearly when no named package manifest can be found", async () => {
    await withRegistryDir(
      async (tempRoot) => {
        await fs.mkdir(path.join(tempRoot, "no-package", "nested"), {
          recursive: true,
        });
      },
      async (tempRoot) => {
        const modulePath = path.join(
          tempRoot,
          "no-package",
          "nested",
          "module.js",
        );
        expect(() => getPackageRoot(pathToFileURL(modulePath).href)).toThrow(
          /Could not locate a named package root/u,
        );
      },
    );
  });

  it("fails prefetch when a manifest-bound artifact digest changes", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await copyCatalogV2Artifacts(catalogFixtureDirectory, registryDir);
        await fs.appendFile(
          await catalogFamilyArtifactPath(registryDir, "component"),
          " ",
          "utf8",
        );
      },
      async (registryDir) => {
        await expect(
          loadRegistry({ registryDir, prefetch: true }),
        ).rejects.toThrow(/digest mismatch.*components\.json/iu);
      },
    );
  }, 30_000);

  it("fails before family access when manifest metadata diverges from the descriptor", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await copyCatalogV2Artifacts(catalogFixtureDirectory, registryDir);
        const manifestPath = path.join(registryDir, "catalog-manifest.json");
        const manifest = JSON.parse(
          await fs.readFile(manifestPath, "utf8"),
        ) as CatalogManifest;
        const components = manifest.artifacts.find(
          (entry) => entry.family === "component",
        );
        if (!components) {
          throw new Error("Generated fixture has no component family.");
        }
        components.codec = "salt.catalog.v2.invalid";
        await fs.writeFile(
          manifestPath,
          `${JSON.stringify(manifest)}\n`,
          "utf8",
        );
      },
      async (registryDir) => {
        await expect(loadRegistry({ registryDir })).rejects.toThrow(
          /metadata does not match descriptor.*component/iu,
        );
      },
    );
  }, 30_000);
});
