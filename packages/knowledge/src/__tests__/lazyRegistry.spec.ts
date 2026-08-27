import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  catalogFamilyArtifactPath,
  catalogSupportArtifactPath,
  copyCatalogV2Artifacts,
  createBuiltCatalogV2Fixture,
  rebindCatalogArtifactForTests,
  SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS,
} from "./registryTestUtils.js";
import { SALT_CATALOG_MANIFEST_FILE } from "../catalog/catalogSchemaV2.js";
import { CatalogStoreV2 } from "../catalog/catalogStoreV2.js";
import { getSaltRegistryFingerprint } from "../registry/fingerprint.js";
import { loadRegistry } from "../registry/loadRegistry.js";

const tempDirs: string[] = [];
const WHOLE_CATALOG_TEST_TIMEOUT_MS = 120_000;
let sourceCatalogDirectory = "";

async function createCatalogFixture(): Promise<string> {
  const registryDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-catalog-v2-lazy-"),
  );
  tempDirs.push(registryDir);
  await copyCatalogV2Artifacts(sourceCatalogDirectory, registryDir);
  return registryDir;
}

beforeAll(async () => {
  sourceCatalogDirectory = await createBuiltCatalogV2Fixture(
    "salt-lazy-registry-source-",
  );
}, SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS);

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

afterAll(async () => {
  if (sourceCatalogDirectory) {
    await fs.rm(sourceCatalogDirectory, {
      recursive: true,
      force: true,
    });
  }
});

describe("loadRegistry — Salt catalog schema v2 lazy access", () => {
  it("exposes compatibility metadata before an unread family is loaded", async () => {
    const registryDir = await createCatalogFixture();
    const registry = await loadRegistry({ registryDir });
    const manifest = JSON.parse(
      await fs.readFile(
        path.join(registryDir, SALT_CATALOG_MANIFEST_FILE),
        "utf8",
      ),
    ) as { catalog_version: string; semantic_digest: string };

    expect(registry.version).toBe(manifest.catalog_version);
    expect(registry.generated_at).toBeNull();
    expect(registry.build_info).toBeNull();
    const componentsPath = await catalogFamilyArtifactPath(
      registryDir,
      "component",
    );
    await fs.appendFile(componentsPath, " ", "utf8");
    expect(registry.version).toBe(manifest.catalog_version);
    expect(() => registry.components).toThrow(
      /digest mismatch.*components\.json/iu,
    );
  });

  it(
    "crosses the complete integrity barrier before exposing a collection",
    async () => {
      const registryDir = await createCatalogFixture();
      const registry = await loadRegistry({ registryDir });
      const tokensPath = await catalogFamilyArtifactPath(
        registryDir,
        "token",
      );
      await fs.appendFile(tokensPath, " ", "utf8");
      expect(() => registry.components).toThrow(
        /digest mismatch.*tokens\.json/iu,
      );

      const validRegistry = await loadRegistry({
        registryDir: sourceCatalogDirectory,
      });
      const first = validRegistry.components;
      expect(first.length).toBeGreaterThan(0);
      expect(validRegistry.components).toBe(first);
    },
    WHOLE_CATALOG_TEST_TIMEOUT_MS,
  );

  it(
    "verifies the complete catalog before trusting its manifest fingerprint",
    async () => {
      const registryDir = await createCatalogFixture();
      const registry = await loadRegistry({ registryDir });
      const manifest = JSON.parse(
        await fs.readFile(
          path.join(registryDir, SALT_CATALOG_MANIFEST_FILE),
          "utf8",
        ),
      ) as { semantic_digest: string };

      const tokensPath = await catalogFamilyArtifactPath(
        registryDir,
        "token",
      );
      await fs.appendFile(tokensPath, " ", "utf8");
      expect(() => getSaltRegistryFingerprint(registry)).toThrow(
        /digest mismatch.*tokens\.json/iu,
      );
      expect(manifest.semantic_digest).toMatch(/^sha256:[0-9a-f]{64}$/u);
    },
    WHOLE_CATALOG_TEST_TIMEOUT_MS,
  );

  it(
    "keeps verified lazy projections immutable after fingerprint registration",
    async () => {
      const registry = await loadRegistry({
        registryDir: sourceCatalogDirectory,
      });
      const fingerprint = getSaltRegistryFingerprint(registry);
      const components = registry.components;
      const firstComponent = components[0];
      if (!firstComponent) throw new Error("Fixture has no components.");

      expect(Object.isFrozen(components)).toBe(true);
      expect(Object.isFrozen(firstComponent)).toBe(true);
      expect(Object.isFrozen(firstComponent.aliases)).toBe(true);
      expect(() => components.push(firstComponent)).toThrow();
      expect(() => {
        (firstComponent as { name: string }).name = "Mutated component";
      }).toThrow();
      expect(() => {
        (firstComponent.aliases as string[]).push("mutated-alias");
      }).toThrow();
      expect(() => {
        (registry as { components: unknown[] }).components = [];
      }).toThrow(/read-only/u);
      expect(getSaltRegistryFingerprint(registry)).toBe(fingerprint);
    },
    WHOLE_CATALOG_TEST_TIMEOUT_MS,
  );

  it(
    "prefetches every runtime family and support artifact",
    async () => {
      for (const kind of [
        "json_schema",
        "package_inventory",
        "content_pack",
      ] as const) {
        const registryDir = await createCatalogFixture();
        const supportPath = await catalogSupportArtifactPath(registryDir, kind);
        await fs.appendFile(supportPath, " ");
        await expect(
          loadRegistry({ registryDir, prefetch: true }),
        ).rejects.toThrow(/digest mismatch/iu);
      }
      const valid = await loadRegistry({
        registryDir: sourceCatalogDirectory,
        prefetch: true,
      });
      expect(valid.components.length).toBeGreaterThan(0);
    },
    WHOLE_CATALOG_TEST_TIMEOUT_MS,
  );

  it(
    "caches only successful whole-catalog verification",
    async () => {
      const validStore = new CatalogStoreV2({
        registryDir: sourceCatalogDirectory,
      });
      const validValidation = vi.spyOn(validStore, "validateCrossReferences");
      validStore.ensureCatalogVerified();
      validStore.ensureCatalogVerified();
      expect(validValidation).toHaveBeenCalledTimes(1);

      const invalidDirectory = await createCatalogFixture();
      await rebindCatalogArtifactForTests(
        invalidDirectory,
        "token_declaration",
        (envelope) => {
          const declaration = envelope.records.find(
            (record): record is unknown[] => Array.isArray(record),
          );
          if (!declaration) {
            throw new Error("Fixture has no stored token declaration.");
          }
          declaration[8] = "token.missing-retry-target";
        },
        { canonicalizeRecords: true },
      );
      const invalidStore = new CatalogStoreV2({
        registryDir: invalidDirectory,
      });
      const invalidValidation = vi.spyOn(
        invalidStore,
        "validateCrossReferences",
      );
      expect(() => invalidStore.ensureCatalogVerified()).toThrow(
        /unresolved token:token\.missing-retry-target/iu,
      );
      expect(() => invalidStore.ensureCatalogVerified()).toThrow(
        /unresolved token:token\.missing-retry-target/iu,
      );
      expect(invalidValidation).toHaveBeenCalledTimes(2);
    },
    WHOLE_CATALOG_TEST_TIMEOUT_MS,
  );

  it(
    "rejects fully rebound logical corruption on the public lazy path",
    async () => {
      const registryDir = await createCatalogFixture();
      await rebindCatalogArtifactForTests(
        registryDir,
        "token_declaration",
        (envelope) => {
          const declaration = envelope.records.find(
            (record): record is unknown[] =>
              Array.isArray(record) && typeof record[0] === "string",
          );
          if (!declaration) {
            throw new Error("Fixture has no stored token declaration.");
          }
          declaration[8] = "token.missing-rebound-target";
        },
        { canonicalizeRecords: true },
      );

      const registry = await loadRegistry({ registryDir });
      expect(registry.version).toBeTruthy();
      expect(() => registry.components).toThrow(
        /unresolved token:token\.missing-rebound-target/iu,
      );
      expect(() => registry.semantic_hash).toThrow(
        /unresolved token:token\.missing-rebound-target/iu,
      );
      expect(() => getSaltRegistryFingerprint(registry)).toThrow(
        /unresolved token:token\.missing-rebound-target/iu,
      );
      expect(() => getSaltRegistryFingerprint(registry)).toThrow(
        /unresolved token:token\.missing-rebound-target/iu,
      );
    },
    WHOLE_CATALOG_TEST_TIMEOUT_MS,
  );

  it(
    "treats prefetch as a whole-catalog integrity barrier",
    async () => {
      const registryDir = await createCatalogFixture();
      await rebindCatalogArtifactForTests(
        registryDir,
        "token_declaration",
        (envelope) => {
          const declaration = envelope.records.find(
            (record): record is unknown[] =>
              Array.isArray(record) && typeof record[0] === "string",
          );
          if (!declaration) {
            throw new Error("Fixture has no stored token declaration.");
          }
          declaration[8] = "token.missing-prefetch-target";
        },
        { canonicalizeRecords: true },
      );

      await expect(
        loadRegistry({ registryDir, prefetch: true }),
      ).rejects.toThrow(/unresolved token:token\.missing-prefetch-target/iu);
    },
    WHOLE_CATALOG_TEST_TIMEOUT_MS,
  );

  it(
    "rejects a directory without the mandatory manifest",
    async () => {
      const registryDir = await createCatalogFixture();
      await fs.rm(path.join(registryDir, SALT_CATALOG_MANIFEST_FILE));

      await expect(loadRegistry({ registryDir })).rejects.toThrow(
        /catalog-manifest\.json/iu,
      );
    },
    WHOLE_CATALOG_TEST_TIMEOUT_MS,
  );
});
