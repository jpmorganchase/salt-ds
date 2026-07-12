import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  REGISTRY_ARRAY_ARTIFACTS,
  REGISTRY_METADATA_ARTIFACT,
  writeJsonFile,
} from "../registry/artifacts.js";
import { getSaltRegistryFingerprint } from "../registry/fingerprint.js";
import {
  __getFileReadCountForTests,
  __resetFileReadCountsForTests,
} from "../registry/lazyRegistry.js";
import {
  clearArtifactCache,
  configureArtifactCache,
  loadRegistry,
} from "../registry/loadRegistry.js";

const GENERATED_AT = "2026-03-25T12:00:00Z";
const VERSION = "1.0.0";
const SEMANTIC_HASH = `sha256:${"a".repeat(64)}`;

const tempDirs: string[] = [];

async function createTempRegistryDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "salt-lazy-registry-"));
  tempDirs.push(dir);
  return dir;
}

async function writeLazyRegistryFixture(registryDir: string): Promise<void> {
  for (const definition of REGISTRY_ARRAY_ARTIFACTS) {
    await writeJsonFile(path.join(registryDir, definition.file_name), {
      generated_at: GENERATED_AT,
      version: VERSION,
      [definition.key]: [],
    });
  }
  await writeJsonFile(
    path.join(registryDir, REGISTRY_METADATA_ARTIFACT.file_name),
    {
      generated_at: GENERATED_AT,
      version: VERSION,
      semantic_hash: SEMANTIC_HASH,
      [REGISTRY_METADATA_ARTIFACT.key]: null,
    },
  );
}

beforeEach(() => {
  clearArtifactCache();
  __resetFileReadCountsForTests();
});

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
  clearArtifactCache();
  configureArtifactCache({ capacity: 64 });
  __resetFileReadCountsForTests();
});

describe("loadRegistry — lazy by default (Phase 0 task 0.2)", () => {
  it("seeds version / generated_at without touching any array artifact", async () => {
    const registryDir = await createTempRegistryDir();
    await writeLazyRegistryFixture(registryDir);

    const registry = await loadRegistry({ registryDir });

    // Reading metadata-derived fields must not trigger any array load.
    expect(registry.version).toBe(VERSION);
    expect(registry.generated_at).toBe(GENERATED_AT);
    expect(getSaltRegistryFingerprint(registry)).toBe(SEMANTIC_HASH);
    expect(registry.build_info).toBeNull();

    // metadata.json was the only artifact read.
    expect(
      __getFileReadCountForTests(
        path.join(registryDir, REGISTRY_METADATA_ARTIFACT.file_name),
      ),
    ).toBe(1);
    for (const definition of REGISTRY_ARRAY_ARTIFACTS) {
      expect(
        __getFileReadCountForTests(
          path.join(registryDir, definition.file_name),
        ),
      ).toBe(0);
    }
  });

  it("loads an array artifact only on first property touch and memoises subsequent reads", async () => {
    const registryDir = await createTempRegistryDir();
    await writeLazyRegistryFixture(registryDir);

    const registry = await loadRegistry({ registryDir });
    const componentsPath = path.join(registryDir, "components.json");
    expect(__getFileReadCountForTests(componentsPath)).toBe(0);

    const componentsFirst = registry.components;
    expect(Array.isArray(componentsFirst)).toBe(true);
    expect(__getFileReadCountForTests(componentsPath)).toBe(1);

    // Second touch is fully memoised — no new disk read.
    const componentsSecond = registry.components;
    expect(componentsSecond).toBe(componentsFirst);
    expect(__getFileReadCountForTests(componentsPath)).toBe(1);
  });

  it("derives component and pattern examples when the duplicate examples artifact is omitted", async () => {
    const registryDir = await createTempRegistryDir();
    await writeLazyRegistryFixture(registryDir);
    const componentExample = {
      id: "component-example",
      code: "<Button />",
    };
    const patternExample = {
      id: "pattern-example",
      code: "<Metric />",
    };
    await writeJsonFile(path.join(registryDir, "components.json"), {
      generated_at: GENERATED_AT,
      version: VERSION,
      components: [{ id: "component.button", examples: [componentExample] }],
    });
    await writeJsonFile(path.join(registryDir, "patterns.json"), {
      generated_at: GENERATED_AT,
      version: VERSION,
      patterns: [{ id: "pattern.metric", examples: [patternExample] }],
    });
    const registry = await loadRegistry({ registryDir });

    expect(registry.examples).toEqual([componentExample, patternExample]);
    expect(registry.examples).toBe(registry.examples);
  });

  it("prefetch: true touches every artifact during loadRegistry", async () => {
    const registryDir = await createTempRegistryDir();
    await writeLazyRegistryFixture(registryDir);

    await loadRegistry({ registryDir, prefetch: true });

    for (const definition of REGISTRY_ARRAY_ARTIFACTS) {
      expect(
        __getFileReadCountForTests(
          path.join(registryDir, definition.file_name),
        ),
        `prefetch should have read ${definition.file_name}`,
      ).toBeGreaterThan(0);
    }
    expect(
      __getFileReadCountForTests(
        path.join(registryDir, REGISTRY_METADATA_ARTIFACT.file_name),
      ),
    ).toBeGreaterThan(0);
  });

  it("throws a clear mismatch error when an artifact's version diverges from the metadata seed", async () => {
    const registryDir = await createTempRegistryDir();
    await writeLazyRegistryFixture(registryDir);
    await writeJsonFile(path.join(registryDir, "components.json"), {
      generated_at: GENERATED_AT,
      version: "9.9.9",
      components: [],
    });

    const registry = await loadRegistry({ registryDir });
    expect(() => registry.components).toThrow(/version mismatch/);
  });

  it("LRU cache reuses parsed artifacts across loadRegistry calls in the same process", async () => {
    const registryDir = await createTempRegistryDir();
    await writeLazyRegistryFixture(registryDir);

    const firstRegistry = await loadRegistry({ registryDir });
    void firstRegistry.components;
    const componentsPath = path.join(registryDir, "components.json");
    expect(__getFileReadCountForTests(componentsPath)).toBe(1);

    const secondRegistry = await loadRegistry({ registryDir });
    void secondRegistry.components;

    // The LRU returned the parsed components.json without a second fs read.
    expect(__getFileReadCountForTests(componentsPath)).toBe(1);
  });

  it("LRU evicts least-recently-used entries when configured under capacity pressure", async () => {
    configureArtifactCache({ capacity: 2 });
    const registryDirA = await createTempRegistryDir();
    const registryDirB = await createTempRegistryDir();
    const registryDirC = await createTempRegistryDir();
    for (const dir of [registryDirA, registryDirB, registryDirC]) {
      await writeLazyRegistryFixture(dir);
    }

    void (await loadRegistry({ registryDir: registryDirA })).components;
    void (await loadRegistry({ registryDir: registryDirB })).components;
    void (await loadRegistry({ registryDir: registryDirC })).components;

    const componentsPathA = path.join(registryDirA, "components.json");
    expect(__getFileReadCountForTests(componentsPathA)).toBe(1);

    void (await loadRegistry({ registryDir: registryDirA })).components;
    // A was evicted (capacity 2 + 3 dirs touched), so the LRU miss
    // forced a second disk read for A's components.
    expect(__getFileReadCountForTests(componentsPathA)).toBe(2);
  });

  it("rejects metadata-less registry directories as a retired format", async () => {
    const registryDir = await createTempRegistryDir();
    await writeLazyRegistryFixture(registryDir);
    await fs.rm(path.join(registryDir, REGISTRY_METADATA_ARTIFACT.file_name));

    await expect(loadRegistry({ registryDir })).rejects.toThrow(
      /metadata\.json is required/,
    );
  });
});
