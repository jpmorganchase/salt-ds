import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import compilerInputPatterns from "../build/catalogCompilerInputPatterns.json";
import {
  CATALOG_INPUT_PATTERNS,
  createCatalogInputInventory,
  globCatalogInputs,
  isCatalogInputTrackingActive,
  readCatalogInputFile,
  readCatalogInputFileOrNull,
  readCatalogInputFileSync,
  readCatalogInputFileSyncOrNull,
  withCatalogInputTracking,
} from "../build/catalogInputInventory.js";
import semanticInputPatterns from "../build/catalogSemanticInputPatterns.json";

const temporaryDirectories: string[] = [];

async function createFixture(
  files: Readonly<Record<string, string>>,
): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-catalog-inputs-"));
  temporaryDirectories.push(root);
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, "utf8");
  }
  return root;
}

afterEach(async () => {
  expect(isCatalogInputTrackingActive()).toBe(false);
  await Promise.all(
    temporaryDirectories
      .splice(0, temporaryDirectories.length)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("catalog input inventory", () => {
  it("binds Knowledge sources while excluding downstream release tooling", () => {
    expect(CATALOG_INPUT_PATTERNS).toEqual(
      expect.arrayContaining([
        "scripts/catalogBuildIdentity.mjs",
        "packages/knowledge/schemas/**/*.json",
        "packages/knowledge/src/**/*.ts",
        "packages/knowledge/src/build/catalogCompilerInputPatterns.json",
        "packages/knowledge/src/build/catalogSemanticInputPatterns.json",
      ]),
    );
    expect(CATALOG_INPUT_PATTERNS).not.toEqual(
      expect.arrayContaining([
        "scripts/catalogArtifactContract.mjs",
        "scripts/checkAiToolingPackageDryRun.mjs",
        "packages/mcp/public-surface-budgets.json",
        "packages/*/src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,css,scss,json}",
      ]),
    );
  });

  it("rejects a custom pattern base that is the repository parent", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "alpha",
    });

    await expect(
      createCatalogInputInventory(root, ["../**/*"]),
    ).rejects.toThrow(/pattern base escapes the repository/u);
  });

  it("rejects an outside glob cwd even when the glob returns no files", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "alpha",
    });
    const outsideRoot = await createFixture({
      "unrelated.txt": "outside",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);

    await expect(
      withCatalogInputTracking(root, inventory, () =>
        globCatalogInputs("missing/**/*", {
          cwd: outsideRoot,
          absolute: true,
          followSymbolicLinks: false,
          onlyFiles: true,
        }),
      ),
    ).rejects.toThrow(/escapes the repository/u);
  });

  it("binds sorted input paths, bytes, and content digests across mutation, addition, and removal", async () => {
    const root = await createFixture({
      "inputs/b.txt": "bravo",
      "inputs/a.txt": "alpha",
    });
    const patterns = ["inputs/**/*"] as const;
    const initial = await createCatalogInputInventory(root, patterns);
    expect(initial.entries.map((entry) => entry.path)).toEqual([
      "inputs/a.txt",
      "inputs/b.txt",
    ]);

    await fs.writeFile(path.join(root, "inputs/a.txt"), "ALPHA", "utf8");
    const mutated = await createCatalogInputInventory(root, patterns);
    expect(mutated.entries[0]?.bytes).toBe(initial.entries[0]?.bytes);
    expect(mutated.entries[0]?.sha256).not.toBe(initial.entries[0]?.sha256);
    expect(mutated.digest).not.toBe(initial.digest);

    await fs.writeFile(path.join(root, "inputs/c.txt"), "charlie", "utf8");
    const added = await createCatalogInputInventory(root, patterns);
    expect(added.entries.map((entry) => entry.path)).toEqual([
      "inputs/a.txt",
      "inputs/b.txt",
      "inputs/c.txt",
    ]);
    expect(added.digest).not.toBe(mutated.digest);

    await fs.rm(path.join(root, "inputs/b.txt"));
    const removed = await createCatalogInputInventory(root, patterns);
    expect(removed.entries.map((entry) => entry.path)).toEqual([
      "inputs/a.txt",
      "inputs/c.txt",
    ]);
    expect(removed.digest).not.toBe(added.digest);
  });

  it("keeps semantic/compiler closures isolated from adapters, tests, and release tooling", async () => {
    const root = await createFixture({
      "package.json": "{}\n",
      "packages/core/src/index.ts": "export const semantic = 1;\n",
      "packages/knowledge/src/public.ts": "export const compiler = 1;\n",
      "packages/cli/src/index.ts": "export const cli = 1;\n",
      "packages/mcp/src/index.ts": "export const mcp = 1;\n",
      "packages/knowledge/src/__tests__/fixture.spec.ts":
        "export const testOnly = 1;\n",
      "scripts/checkAiToolingPackageDryRun.mjs":
        "export const releaseTool = 1;\n",
    });
    const baselineSemantic = await createCatalogInputInventory(
      root,
      semanticInputPatterns,
    );
    const baselineCompiler = await createCatalogInputInventory(
      root,
      compilerInputPatterns,
    );

    for (const relativePath of [
      "packages/cli/src/index.ts",
      "packages/mcp/src/index.ts",
      "packages/knowledge/src/__tests__/fixture.spec.ts",
      "scripts/checkAiToolingPackageDryRun.mjs",
    ]) {
      await fs.writeFile(path.join(root, relativePath), "changed\n", "utf8");
    }
    expect(
      (await createCatalogInputInventory(root, semanticInputPatterns)).digest,
    ).toBe(baselineSemantic.digest);
    expect(
      (await createCatalogInputInventory(root, compilerInputPatterns)).digest,
    ).toBe(baselineCompiler.digest);

    await fs.writeFile(
      path.join(root, "packages/core/src/index.ts"),
      "export const semantic = 2;\n",
      "utf8",
    );
    expect(
      (await createCatalogInputInventory(root, semanticInputPatterns)).digest,
    ).not.toBe(baselineSemantic.digest);
    expect(
      (await createCatalogInputInventory(root, compilerInputPatterns)).digest,
    ).toBe(baselineCompiler.digest);

    await fs.writeFile(
      path.join(root, "packages/knowledge/src/public.ts"),
      "export const compiler = 2;\n",
      "utf8",
    );
    expect(
      (await createCatalogInputInventory(root, compilerInputPatterns)).digest,
    ).not.toBe(baselineCompiler.digest);
  });

  it("allows declared reads and fails every undeclared read closed", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "declared",
      "other/undeclared.txt": "undeclared",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    await withCatalogInputTracking(root, inventory, async () => {
      await expect(
        readCatalogInputFile(path.join(root, "inputs/declared.txt"), "utf8"),
      ).resolves.toBe("declared");
      expect(
        readCatalogInputFileSync(
          path.join(root, "inputs/declared.txt"),
          "utf8",
        ),
      ).toBe("declared");
      await expect(
        readCatalogInputFile(path.join(root, "other/undeclared.txt"), "utf8"),
      ).rejects.toThrow(/undeclared input read/u);
      expect(() =>
        readCatalogInputFileSync(
          path.join(root, "other/undeclared.txt"),
          "utf8",
        ),
      ).toThrow(/undeclared input read/u);
      await expect(
        readCatalogInputFile(path.join(root, "../outside.txt"), "utf8"),
      ).rejects.toThrow(/undeclared input read/u);
    });
  });

  it("rejects bytes changed after inventory even when the source is restored before a final inventory", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "alpha",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    const declaredPath = path.join(root, "inputs/declared.txt");
    await fs.writeFile(declaredPath, "ALPHA", "utf8");
    await expect(
      withCatalogInputTracking(root, inventory, async () =>
        readCatalogInputFile(declaredPath, "utf8"),
      ),
    ).rejects.toThrow(/input changed after inventory/u);
    await fs.writeFile(declaredPath, "alpha", "utf8");
    const finalInventory = await createCatalogInputInventory(root, [
      "inputs/**/*",
    ]);
    expect(finalInventory.digest).toBe(inventory.digest);
  });

  it("rejects catalog inputs reached through a nested directory link", async () => {
    const root = await createFixture({
      "site/.keep": "",
    });
    const outsideRoot = await createFixture({
      "page.mdx": "# Outside",
    });
    await fs.symlink(
      outsideRoot,
      path.join(root, "site/docs"),
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      createCatalogInputInventory(root, ["site/docs/**/*.mdx"]),
    ).rejects.toThrow(/nested link or outside the repository/u);
  });

  it("rejects catalog inputs with an external hard-link alias", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "alpha",
    });
    const outsideRoot = await createFixture({
      "outside.txt": "alpha",
    });
    const declaredPath = path.join(root, "inputs/declared.txt");
    await fs.rm(declaredPath);
    await fs.link(path.join(outsideRoot, "outside.txt"), declaredPath);

    await expect(
      createCatalogInputInventory(root, ["inputs/**/*"]),
    ).rejects.toThrow(/uniquely linked regular file/u);
  });

  it("rejects linked subtrees beneath a dynamic catalog input base", async () => {
    const root = await createFixture({
      "site/docs/local.mdx": "# Local",
    });
    const outsideRoot = await createFixture({
      "page.mdx": "# Outside",
    });
    await fs.symlink(
      outsideRoot,
      path.join(root, "site/docs/linked"),
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      createCatalogInputInventory(root, ["site/docs/**/*.mdx"]),
    ).rejects.toThrow(/nested link or outside the repository/u);
  });

  it("rejects a linked fixed directory after a wildcard package segment", async () => {
    const root = await createFixture({
      "packages/fixture/package.json": '{"name":"@salt-ds/fixture"}',
    });
    const outsideRoot = await createFixture({
      "index.ts": "export const fixture = true;",
    });
    await fs.symlink(
      outsideRoot,
      path.join(root, "packages/fixture/src"),
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      createCatalogInputInventory(root, ["packages/*/src/**/*.ts"]),
    ).rejects.toThrow(/nested link or outside the repository/u);
  });

  it("rejects link topology introduced after inventory even when bytes are unchanged", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "alpha",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    const inputsPath = path.join(root, "inputs");
    const movedInputsPath = path.join(root, "moved-inputs");
    await fs.rename(inputsPath, movedInputsPath);
    await fs.symlink(
      movedInputsPath,
      inputsPath,
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      withCatalogInputTracking(root, inventory, async () =>
        readCatalogInputFile(path.join(inputsPath, "declared.txt"), "utf8"),
      ),
    ).rejects.toThrow(/nested link or outside the repository/u);
  });

  it("rejects a glob-only subtree replaced by a link after inventory", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "alpha",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    const inputsPath = path.join(root, "inputs");
    const movedInputsPath = path.join(root, "moved-inputs");

    await expect(
      withCatalogInputTracking(root, inventory, async () => {
        await globCatalogInputs("inputs/**/*", {
          cwd: root,
          absolute: true,
          followSymbolicLinks: false,
          onlyFiles: true,
        });
        await fs.rename(inputsPath, movedInputsPath);
        await fs.symlink(
          movedInputsPath,
          inputsPath,
          process.platform === "win32" ? "junction" : "dir",
        );
      }),
    ).rejects.toThrow(/nested link or outside the repository/u);
  });

  it("only treats genuinely absent synchronous optional inputs as absent", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "alpha",
      "other/undeclared.txt": "undeclared",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    const declaredPath = path.join(root, "inputs/declared.txt");

    await expect(
      withCatalogInputTracking(root, inventory, async () => {
        expect(
          readCatalogInputFileSyncOrNull(
            path.join(root, "inputs/absent.txt"),
            "utf8",
          ),
        ).toBeNull();
        expect(() =>
          readCatalogInputFileSyncOrNull(
            path.join(root, "other/undeclared.txt"),
            "utf8",
          ),
        ).toThrow(/undeclared input read/u);

        await fs.rm(declaredPath);
        expect(() =>
          readCatalogInputFileSyncOrNull(declaredPath, "utf8"),
        ).toThrow(/became unavailable after inventory/u);
        await fs.writeFile(declaredPath, "alpha", "utf8");

        await fs.writeFile(declaredPath, "ALPHA", "utf8");
        expect(() =>
          readCatalogInputFileSyncOrNull(declaredPath, "utf8"),
        ).toThrow(/input changed after inventory/u);
        await fs.writeFile(declaredPath, "alpha", "utf8");
      }),
    ).resolves.toBeUndefined();
  });

  it("only treats genuinely absent asynchronous optional inputs as absent", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "alpha",
      "other/undeclared.txt": "undeclared",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    const declaredPath = path.join(root, "inputs/declared.txt");

    await expect(
      withCatalogInputTracking(root, inventory, async () => {
        await expect(
          readCatalogInputFileOrNull(
            path.join(root, "inputs/absent.txt"),
            "utf8",
          ),
        ).resolves.toBeNull();
        await expect(
          readCatalogInputFileOrNull(
            path.join(root, "other/undeclared.txt"),
            "utf8",
          ),
        ).rejects.toThrow(/undeclared input read/u);

        await fs.rm(declaredPath);
        await expect(
          readCatalogInputFileOrNull(declaredPath, "utf8"),
        ).rejects.toThrow(/became unavailable after inventory/u);
        await fs.writeFile(declaredPath, "ALPHA", "utf8");
        await expect(
          readCatalogInputFileOrNull(declaredPath, "utf8"),
        ).rejects.toThrow(/input changed after inventory/u);
        await fs.writeFile(declaredPath, "alpha", "utf8");
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects a relevant file omitted during enumeration even when it is restored before generation ends", async () => {
    const root = await createFixture({
      "inputs/alpha.txt": "alpha",
      "inputs/bravo.txt": "bravo",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    const bravoPath = path.join(root, "inputs/bravo.txt");

    await expect(
      withCatalogInputTracking(root, inventory, async () => {
        await fs.rm(bravoPath);
        const enumerated = await globCatalogInputs("inputs/**/*", {
          cwd: root,
          absolute: true,
          onlyFiles: true,
        });
        expect(enumerated.some((entry) => entry.endsWith("bravo.txt"))).toBe(
          false,
        );
        await fs.writeFile(bravoPath, "bravo", "utf8");
      }),
    ).rejects.toThrow(/input enumeration changed during generation/u);
  });

  it("always resets tracking after failure and rejects overlapping trackers", async () => {
    const root = await createFixture({
      "inputs/declared.txt": "declared",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    await expect(
      withCatalogInputTracking(root, inventory, async () => {
        expect(isCatalogInputTrackingActive()).toBe(true);
        await expect(
          withCatalogInputTracking(root, inventory, async () => undefined),
        ).rejects.toThrow(/already active/u);
        throw new Error("fixture failure");
      }),
    ).rejects.toThrow(/fixture failure/u);
    expect(isCatalogInputTrackingActive()).toBe(false);
    await expect(
      withCatalogInputTracking(root, inventory, async () =>
        readCatalogInputFile(path.join(root, "inputs/declared.txt"), "utf8"),
      ),
    ).resolves.toBe("declared");
  });

  it("preserves repository path case and distinct case-sensitive identities", async () => {
    const root = await createFixture({
      "inputs/Case.txt": "upper",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    expect(inventory.entries.map((entry) => entry.path)).toContain(
      "inputs/Case.txt",
    );
  });

  it("rejects reads whose spelling differs from the inventoried portable path", async () => {
    const root = await createFixture({
      "inputs/Case.txt": "upper",
    });
    const inventory = await createCatalogInputInventory(root, ["inputs/**/*"]);
    await expect(
      withCatalogInputTracking(root, inventory, async () =>
        readCatalogInputFile(path.join(root, "inputs/case.txt"), "utf8"),
      ),
    ).rejects.toThrow(
      process.platform === "win32"
        ? /does not match its inventoried portable spelling/u
        : /undeclared input read/u,
    );
  });

  it("rejects case-colliding portable input identities", async () => {
    const root = await createFixture({
      "inputs/Case.txt": "upper",
      "inputs/case.txt": "lower",
    });
    const names = await fs.readdir(path.join(root, "inputs"));
    if (!(names.includes("Case.txt") && names.includes("case.txt"))) {
      return;
    }
    await expect(
      createCatalogInputInventory(root, ["inputs/**/*"]),
    ).rejects.toThrow(/collide under portable case normalization/u);
  });

  it("rejects Unicode-normalization-colliding portable input identities", async () => {
    const composedName = "caf\u00e9.txt";
    const decomposedName = "cafe\u0301.txt";
    const root = await createFixture({
      [`inputs/${composedName}`]: "composed",
      [`inputs/${decomposedName}`]: "decomposed",
    });
    const names = await fs.readdir(path.join(root, "inputs"));
    if (!(names.includes(composedName) && names.includes(decomposedName))) {
      return;
    }
    await expect(
      createCatalogInputInventory(root, ["inputs/**/*"]),
    ).rejects.toThrow(/collide under portable case normalization/u);
  });
});
