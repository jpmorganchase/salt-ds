import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveCatalogGeneratorCapability } from "../build/buildRegistry.js";
import {
  assertGeneratorDependencyInventory,
  createSealedCatalogGeneratorDigest,
  type GeneratorDependencyInventory,
  generatorDependencyDirectoryExists,
  generatorDependencyFileExists,
  generatorDependencyRealpath,
  generatorDependencyWorkspacePath,
  isGeneratorDependencyInventoryActive,
  readGeneratorDependencyFileSyncOrNull,
  withGeneratorDependencyInventory,
} from "../build/generatorDependencyInventory.js";
import {
  type CatalogGeneratorReceipt,
  catalogManifestCodec,
} from "../catalog/catalogSchemaV2.js";
import { canonicalJson, sha256Bytes } from "../catalog/catalogSerialization.js";

const temporaryDirectories: string[] = [];
const SHA = `sha256:${"1".repeat(64)}`;

function createReceipt(): CatalogGeneratorReceipt {
  return {
    schema_version: "1.1.0",
    orchestrator: {
      path: "packages/mcp/scripts/buildRegistry.mjs",
      sha256: SHA,
    },
    generator_bundle: {
      sha256: `sha256:${"2".repeat(64)}`,
      metafile_sha256: `sha256:${"3".repeat(64)}`,
    },
    dependencies: {
      sha256: `sha256:${"4".repeat(64)}`,
      esbuild_entry: "node_modules/esbuild/lib/main.js",
      esbuild_version: "1.0.0",
      esbuild_binary: "node_modules/@esbuild/test/bin/esbuild",
      esbuild_binary_sha256: `sha256:${"6".repeat(64)}`,
      typescript_entry: "node_modules/typescript/lib/typescript.js",
      typescript_version: "6.0.0",
      tool_snapshot_sha256: `sha256:${"7".repeat(64)}`,
      tool_snapshot_files: 3,
    },
    runtime: {
      executable_sha256: `sha256:${"5".repeat(64)}`,
      version: "v22.0.0",
      versions: { node: "22.0.0" },
      platform: "test-platform",
      arch: "test-arch",
      exec_argv: [],
      environment: {
        policy: "empty",
      },
    },
  };
}

function sealInventory(
  entries: GeneratorDependencyInventory["entries"],
): GeneratorDependencyInventory {
  const payload = {
    schema_version: "1.0.0" as const,
    entries,
  };
  return {
    ...payload,
    digest: sha256Bytes(canonicalJson(payload)),
  };
}

async function createFixture(): Promise<{
  filePath: string;
  inventory: GeneratorDependencyInventory;
  repoRoot: string;
}> {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-generator-inventory-"),
  );
  temporaryDirectories.push(repoRoot);
  const filePath = path.join(repoRoot, "node_modules", "fixture", "index.js");
  const workspaceTarget = path.join(repoRoot, "packages", "workspace");
  const workspaceLink = path.join(repoRoot, "node_modules", "workspace");
  const bytes = Buffer.from("export const fixture = true;\n", "utf8");
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.mkdir(workspaceTarget, { recursive: true });
  await fs.writeFile(filePath, bytes);
  await fs.symlink(
    workspaceTarget,
    workspaceLink,
    process.platform === "win32" ? "junction" : "dir",
  );
  const inventory = sealInventory([
    { kind: "directory", path: "node_modules" },
    { kind: "directory", path: "node_modules/fixture" },
    {
      kind: "file",
      path: "node_modules/fixture/index.js",
      sha256: sha256Bytes(bytes),
      bytes: bytes.byteLength,
    },
    {
      kind: "link",
      path: "node_modules/workspace",
      raw_target: "packages/workspace",
      target: "packages/workspace",
    },
  ]);
  return { filePath, inventory, repoRoot };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0, temporaryDirectories.length)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe.sequential("sealed generator dependency inventory", () => {
  it("serves dependency probes from the sealed topology and verifies bytes", async () => {
    const { filePath, inventory, repoRoot } = await createFixture();
    const undeclaredFile = path.join(
      repoRoot,
      "node_modules",
      "ambient",
      "index.js",
    );
    await fs.mkdir(path.dirname(undeclaredFile), { recursive: true });
    await fs.writeFile(undeclaredFile, "export const ambient = true;\n");
    const workspacePath = path.join(
      repoRoot,
      "node_modules",
      "workspace",
      "src",
      "index.ts",
    );

    await withGeneratorDependencyInventory(repoRoot, inventory, async () => {
      expect(isGeneratorDependencyInventoryActive()).toBe(true);
      expect(readGeneratorDependencyFileSyncOrNull(filePath)).toContain(
        "fixture",
      );
      expect(generatorDependencyFileExists(filePath)).toBe(true);
      expect(generatorDependencyDirectoryExists(path.dirname(filePath))).toBe(
        true,
      );
      expect(generatorDependencyRealpath(filePath)).toBe(
        path.resolve(filePath),
      );
      expect(generatorDependencyWorkspacePath(workspacePath)).toBe(
        path.join(repoRoot, "packages", "workspace", "src", "index.ts"),
      );
      expect(
        generatorDependencyFileExists(
          path.join(repoRoot, "node_modules", "fixture", "missing.js"),
        ),
      ).toBe(false);
      expect(generatorDependencyFileExists(undeclaredFile)).toBe(false);
      expect(
        generatorDependencyDirectoryExists(path.dirname(undeclaredFile)),
      ).toBe(false);
      expect(readGeneratorDependencyFileSyncOrNull(undeclaredFile)).toBeNull();
      expect(
        generatorDependencyWorkspacePath(
          path.join(
            repoRoot,
            "node_modules",
            "workspace-extra",
            "src",
            "index.ts",
          ),
        ),
      ).toBeNull();
      expect(() =>
        readGeneratorDependencyFileSyncOrNull(
          path.join(repoRoot, "packages", "workspace", "src", "index.ts"),
        ),
      ).toThrow(/escapes node_modules/u);
      await expect(
        withGeneratorDependencyInventory(
          repoRoot,
          inventory,
          async () => undefined,
        ),
      ).rejects.toThrow(/already active/u);

      await fs.writeFile(filePath, "export const fixture = false;\n", "utf8");
      expect(() => readGeneratorDependencyFileSyncOrNull(filePath)).toThrow(
        /changed after inventory capture/u,
      );
    });

    expect(isGeneratorDependencyInventoryActive()).toBe(false);
  });

  it("rejects forged digests, path collisions, and malformed link topology", async () => {
    const { inventory, repoRoot } = await createFixture();
    expect(() =>
      assertGeneratorDependencyInventory(repoRoot, {
        ...inventory,
        digest: SHA,
      }),
    ).toThrow(/digest mismatch/u);

    const collidingEntries = [
      ...inventory.entries,
      { kind: "directory" as const, path: "node_modules/Fixture" },
    ].sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
    expect(() =>
      assertGeneratorDependencyInventory(
        repoRoot,
        sealInventory(collidingEntries),
      ),
    ).toThrow(/duplicate, non-portable, or unsorted/u);

    const malformedLinkEntries = inventory.entries.map((entry) =>
      entry.kind === "link" ? { ...entry, raw_target: "../escape" } : entry,
    );
    expect(() =>
      assertGeneratorDependencyInventory(
        repoRoot,
        sealInventory(malformedLinkEntries),
      ),
    ).toThrow(/Invalid generator dependency link target/u);
  });

  it("rejects a byte-identical dependency hidden behind changed link topology", async () => {
    const { filePath, inventory, repoRoot } = await createFixture();
    const replacementDirectory = path.join(repoRoot, "replacement", "fixture");
    await fs.mkdir(replacementDirectory, { recursive: true });
    await fs.copyFile(filePath, path.join(replacementDirectory, "index.js"));
    const dependencyDirectory = path.dirname(filePath);
    await fs.rm(dependencyDirectory, { recursive: true, force: true });
    await fs.symlink(
      replacementDirectory,
      dependencyDirectory,
      process.platform === "win32" ? "junction" : "dir",
    );

    await withGeneratorDependencyInventory(repoRoot, inventory, async () => {
      expect(() => generatorDependencyFileExists(filePath)).toThrow(
        /topology changed after inventory capture/u,
      );
      expect(() => readGeneratorDependencyFileSyncOrNull(filePath)).toThrow(
        /topology changed after inventory capture/u,
      );
    });
  });

  it("clears the active inventory when the guarded action fails", async () => {
    const { inventory, repoRoot } = await createFixture();
    await expect(
      withGeneratorDependencyInventory(repoRoot, inventory, async () => {
        throw new Error("fixture failure");
      }),
    ).rejects.toThrow("fixture failure");
    expect(isGeneratorDependencyInventoryActive()).toBe(false);
  });
});

describe("catalog generator identity modes", () => {
  const receipt = createReceipt();
  const sealedGenerator = {
    mode: "sealed" as const,
    version: "2.0.0",
    digest: createSealedCatalogGeneratorDigest(receipt),
    receipt,
  };
  const manifest = {
    schema_version: "2.0.0",
    catalog_version: "0.1.0",
    source_revision: SHA,
    generator: sealedGenerator,
    input_inventory_digest: SHA,
    inputs: [{ path: "package.json", sha256: SHA, bytes: 0 }],
    artifacts: [],
    build_artifacts: [],
    support_artifacts: [],
    semantic_digest: SHA,
  };

  it("binds sealed identities to their complete canonical receipt", () => {
    expect(catalogManifestCodec.safeParse(manifest).success).toBe(true);
    expect(
      catalogManifestCodec.safeParse({
        ...manifest,
        generator: {
          ...sealedGenerator,
          receipt: {
            ...receipt,
            runtime: { ...receipt.runtime, platform: "tampered" },
          },
        },
      }).success,
    ).toBe(false);
  });

  it("admits explicit test identities without allowing them to impersonate sealed output", () => {
    expect(
      catalogManifestCodec.safeParse({
        ...manifest,
        generator: {
          mode: "test",
          version: "2.0.0-test",
          digest: SHA,
        },
      }).success,
    ).toBe(true);
    expect(
      catalogManifestCodec.safeParse({
        ...manifest,
        generator: {
          mode: "test",
          version: "2.0.0",
          digest: SHA,
        },
      }).success,
    ).toBe(false);
    expect(
      catalogManifestCodec.safeParse({
        ...manifest,
        generator: {
          ...sealedGenerator,
          version: "2.0.0-test",
        },
      }).success,
    ).toBe(false);
  });

  it("selects one coherent generator capability before extraction", async () => {
    const { inventory, repoRoot } = await createFixture();
    const boundReceipt = {
      ...receipt,
      dependencies: {
        ...receipt.dependencies,
        sha256: inventory.digest,
      },
    };
    const explicitLayout = {
      packageRoot: repoRoot,
      packageVersion: "0.0.0",
      semanticInputPatterns: ["package.json"],
      compilerInputPatterns: ["package.json"],
    };
    expect(() =>
      resolveCatalogGeneratorCapability(
        {
          ...explicitLayout,
          sourceRoot: repoRoot,
          outputDir: path.join(repoRoot, "catalog"),
          generatorDependencyInventory: inventory,
        },
        repoRoot,
      ),
    ).toThrow(
      /requires explicit source\/package\/output roots, package version, semantic\/compiler input patterns, a receipt/u,
    );
    expect(() =>
      resolveCatalogGeneratorCapability(
        {
          generatorVersion: "2.0.0-test",
          generatorReceipt: boundReceipt,
        },
        null,
      ),
    ).toThrow(/require the matching dependency inventory/u);
    expect(() =>
      resolveCatalogGeneratorCapability(
        {
          ...explicitLayout,
          sourceRoot: repoRoot,
          outputDir: path.join(repoRoot, "catalog"),
          generatorDependencyInventory: inventory,
          generatorDependencySnapshotRoot: repoRoot,
          generatorReceipt: receipt,
          assertGeneratorDependenciesStable: async () => undefined,
        },
        repoRoot,
      ),
    ).toThrow(/does not bind the active dependency inventory/u);
    expect(
      resolveCatalogGeneratorCapability(
        {
          ...explicitLayout,
          sourceRoot: repoRoot,
          outputDir: path.join(repoRoot, "catalog"),
          generatorDependencyInventory: inventory,
          generatorDependencySnapshotRoot: repoRoot,
          generatorReceipt: boundReceipt,
          assertGeneratorDependenciesStable: async () => undefined,
        },
        repoRoot,
      ).mode,
    ).toBe("sealed");
    expect(
      resolveCatalogGeneratorCapability(
        {
          generatorVersion: "2.0.0-test",
        },
        null,
      ).mode,
    ).toBe("test");
    expect(() =>
      resolveCatalogGeneratorCapability(
        {
          ...explicitLayout,
          sourceRoot: repoRoot,
          outputDir: path.join(repoRoot, "catalog"),
          generatorDependencyInventory: inventory,
          generatorDependencySnapshotRoot: repoRoot,
          generatorReceipt: boundReceipt,
          assertGeneratorDependenciesStable: async () => undefined,
          generatorDigest: SHA,
        },
        repoRoot,
      ),
    ).toThrow(/rejects caller-supplied digests/u);
  });
});
