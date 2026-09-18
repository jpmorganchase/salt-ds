import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertCatalogInputBytes,
  assertCatalogManifestBytes,
  assertCompleteCatalogInputSet,
  assertSameCatalogBuildIdentity,
  createCatalogBuildIdentity,
  formatCatalogBuildBanner,
  hasForbiddenPortablePathCharacter,
  isPathWithinRoot,
  isPortableRepositoryBuildPath,
  normalizePortableRepositoryBuildPath,
  parseCatalogBuildBanner,
} from "../../../../scripts/catalogBuildIdentity.mjs";
import {
  createBundleMetafileDigest,
  materializeVerifiedDependencySnapshot,
  verifySealedGeneratorBundleStability,
} from "../../scripts/buildKnowledge.mjs";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import { canonicalJson } from "../catalog/catalogSerialization.js";

type PackageManifest = {
  name?: string;
  private?: boolean;
  engines?: Record<string, string>;
  files?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  publishEntryPath?: string;
  publishAdditionalEntryPaths?: string[];
  publishBuildIdentityManifest?: string;
  publishBuildIdentityInputPatterns?: {
    semantic: string;
    compiler: string;
  };
  publishCatalogArtifactPaths?: {
    generationDirectory: string;
    publicationInventoryFile: string;
    schemaArtifactKind: string;
    buildArtifactsField: string;
  };
  publishCanonicalTextPaths?: string[];
  publishBundledWorkspaceDependencies?: string[];
  publishBinEntrypoints?: Record<
    string,
    {
      requirePath?: string;
      errorPrefix?: string;
      conciseErrorCodes?: string[];
      ignoreBrokenPipe?: boolean;
    }
  >;
  publishConfig?: {
    directory?: string;
  };
  publishExports?: Record<string, unknown>;
  publishExtraCopyPaths?: Array<
    | string
    | {
        from: string;
        to: string;
        files?: string[];
        filesFrom?: string;
        filesFromManifest?: string;
        manifestSupportArtifactKind?: string;
      }
  >;
  publishPreserveModules?: boolean;
  publishSourceMaps?: boolean;
  publishIncludeReadme?: boolean;
  publishScriptExcludes?: string[];
  saltDocs?: unknown;
  publishTypingEntryPath?: string;
  publishTypingEntryOnly?: boolean;
  typescriptInclude?: string[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  ) as T;
}

function sha256(bytes: string | Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

const FORBIDDEN_RUNTIME_FILE_ENTRIES = [
  "docs",
  "src",
  "__tests__",
  "eval-fixtures",
  "fixtures",
  "host-results",
  "workflow-examples",
  "baselines",
  "archive",
];

function expectEntriesToExclude(
  entries: string[] | undefined,
  forbidden: string[],
) {
  expect(entries).toBeDefined();
  for (const entry of entries ?? []) {
    const normalized = entry.replace(/\\/g, "/");
    expect(normalized).not.toEqual(
      expect.stringMatching(new RegExp(`(^|/)(${forbidden.join("|")})(/|$)`)),
    );
  }
}

describe("package publish boundaries", () => {
  it("binds generator metafile topology without checkout-dependent input byte counts", () => {
    const metafile = {
      inputs: {
        "src/index.ts": { bytes: 20, imports: [] },
      },
      outputs: {
        "dist/index.js": {
          bytes: 12,
          inputs: { "src/index.ts": { bytesInOutput: 12 } },
          imports: [],
          exports: [],
          entryPoint: "src/index.ts",
        },
      },
    };
    const baseline = createBundleMetafileDigest(metafile);
    expect(
      createBundleMetafileDigest({
        ...metafile,
        inputs: {
          "src/index.ts": { bytes: 21, imports: [] },
        },
      }),
    ).toBe(baseline);
    expect(
      createBundleMetafileDigest({
        ...metafile,
        inputs: {
          "src/index.ts": {
            bytes: 20,
            imports: [{ path: "src/dependency.ts", kind: "import-statement" }],
          },
        },
      }),
    ).not.toBe(baseline);
  });

  it("publishes only the Knowledge-v1 contract under the release embargo", () => {
    const manifest = readJson<PackageManifest>("../../package.json");
    const publicEntry = readFileSync(
      new URL("../public.ts", import.meta.url),
      "utf8",
    );

    expect(manifest.name).toBe("@salt-ds/knowledge");
    expect(manifest.private).toBe(true);
    expect(manifest.engines?.node).toBe(">=22");
    expect(manifest.files).toEqual([
      "manifest.json",
      "index.json",
      "indexes",
      "records",
      "content",
      "examples",
      "markdown",
      "compatibility",
      "support",
      "skills",
      "schemas",
    ]);
    expect(manifest.publishConfig?.directory).toBe(
      "../../dist/salt-ds-knowledge",
    );
    expect(manifest.publishEntryPath).toBe("src/public.ts");
    expect(manifest.typescriptInclude).toEqual(["src/public.ts"]);
    expect(manifest.publishExtraCopyPaths).toEqual([
      {
        from: "generated",
        to: ".",
        filesFrom: "generated/publication-files.json",
      },
    ]);
    expect(manifest.publishSourceMaps).toBe(false);
    expect(manifest.publishPreserveModules).toBe(false);
    expect(manifest.publishCanonicalTextPaths).toEqual([
      "README.md",
      "LICENSE",
    ]);
    expect(publicEntry).not.toContain('from "./build/');
    expect(publicEntry).not.toContain("salt://");
  });

  it("binds runtime and package-build portable path classifiers to one corpus", () => {
    const corpus = readJson<{
      accepted: string[];
      rejected: string[];
    }>("../../../../scripts/fixtures/catalogPortablePath.cases.json");

    for (const candidate of corpus.accepted) {
      expect(isPortableRepositoryPath(candidate), candidate).toBe(true);
      expect(isPortableRepositoryBuildPath(candidate), candidate).toBe(true);
    }
    for (const candidate of corpus.rejected) {
      expect(isPortableRepositoryPath(candidate), candidate).toBe(false);
      expect(isPortableRepositoryBuildPath(candidate), candidate).toBe(false);
    }
  });

  it("rejects non-string build paths before normalization", () => {
    for (const candidate of [null, {}, []]) {
      expect(() =>
        normalizePortableRepositoryBuildPath(
          candidate,
          "Test portable path boundary",
        ),
      ).toThrow("Test portable path boundary");
    }
  });

  it("revalidates the complete catalog input path set and rejects linked inputs", async () => {
    const fixtureRoot = await fs.mkdtemp(
      path.join(tmpdir(), "salt-complete-catalog-inputs-"),
    );
    const externalRoot = await fs.mkdtemp(
      path.join(tmpdir(), "salt-external-catalog-inputs-"),
    );
    const packageBytes = Buffer.from('{"private":true}\n', "utf8");
    const docsBytes = Buffer.from("# Stable documentation\n", "utf8");
    const packagePath = path.join(fixtureRoot, "package.json");
    const docsDirectory = path.join(fixtureRoot, "site", "docs");
    const docsPath = path.join(docsDirectory, "stable.mdx");
    const inputsByPath = new Map([
      [
        "package.json",
        { bytes: packageBytes.byteLength, sha256: sha256(packageBytes) },
      ],
      [
        "site/docs/stable.mdx",
        { bytes: docsBytes.byteLength, sha256: sha256(docsBytes) },
      ],
    ]);
    const identity = { inputsByPath };
    const inputPatterns = ["package.json", "site/docs/**/*.mdx"];

    try {
      await fs.mkdir(docsDirectory, { recursive: true });
      await fs.writeFile(packagePath, packageBytes);
      await fs.writeFile(docsPath, docsBytes);

      await expect(
        assertCompleteCatalogInputSet(identity, fixtureRoot, inputPatterns),
      ).resolves.toBeUndefined();

      await fs.writeFile(path.join(fixtureRoot, "notes.txt"), "unrelated\n");
      await expect(
        assertCompleteCatalogInputSet(identity, fixtureRoot, inputPatterns),
      ).resolves.toBeUndefined();

      await fs.writeFile(docsPath, "# Changed documentation\n");
      await expect(
        assertCompleteCatalogInputSet(identity, fixtureRoot, inputPatterns),
      ).rejects.toThrow(/does not match the catalog input inventory/u);
      await fs.writeFile(docsPath, docsBytes);

      const addedPath = path.join(docsDirectory, "added.mdx");
      await fs.writeFile(addedPath, "# Added\n");
      await expect(
        assertCompleteCatalogInputSet(identity, fixtureRoot, inputPatterns),
      ).rejects.toThrow(/path set does not match/u);
      await fs.rm(addedPath);

      await fs.rm(docsPath);
      await expect(
        assertCompleteCatalogInputSet(identity, fixtureRoot, inputPatterns),
      ).rejects.toThrow(/path set does not match/u);
      await fs.writeFile(docsPath, docsBytes);

      const originalPackagePath = `${packagePath}.original`;
      const externalPackagePath = path.join(externalRoot, "package.json");
      await fs.rename(packagePath, originalPackagePath);
      await fs.writeFile(externalPackagePath, packageBytes);
      await fs.link(externalPackagePath, packagePath);
      await expect(
        assertCompleteCatalogInputSet(identity, fixtureRoot, inputPatterns),
      ).rejects.toThrow(/resolves through a link/u);
      await fs.rm(packagePath);
      await fs.rename(originalPackagePath, packagePath);

      const originalDocsDirectory = `${docsDirectory}-original`;
      await fs.rename(docsDirectory, originalDocsDirectory);
      await fs.writeFile(path.join(externalRoot, "stable.mdx"), docsBytes);
      await fs.symlink(externalRoot, docsDirectory, "junction");
      await expect(
        assertCompleteCatalogInputSet(identity, fixtureRoot, inputPatterns),
      ).rejects.toThrow(/path set does not match|resolves through a link/u);
      await expect(
        fs.readFile(path.join(externalRoot, "stable.mdx"), "utf8"),
      ).resolves.toBe(docsBytes.toString("utf8"));
    } finally {
      await fs.rm(fixtureRoot, { recursive: true, force: true });
      await fs.rm(externalRoot, { recursive: true, force: true });
    }
  });

  it("fails closed when catalog inputs change across the generator bundle boundary", async () => {
    let content = "before";
    const createInventory = () => ({
      digest: `sha256:${content}`,
      entries: [
        {
          path: "packages/mcp/src/core/build/buildRegistry.ts",
          sha256: `sha256:${content}`,
          bytes: content.length,
        },
      ],
    });
    const dependencyInventory = { digest: "sha256:dependencies", entries: [] };
    let bundlePass = 0;
    const buildBundle = async () => {
      const observed = content;
      bundlePass += 1;
      if (bundlePass === 1) content = "after";
      const bytes = Buffer.from(observed, "utf8");
      return {
        bytes,
        digest: sha256(bytes),
        metafileDigest: sha256(`metafile:${observed}`),
        firstPartyInputs: ["packages/mcp/src/core/build/buildRegistry.ts"],
        generator: {
          createCatalogInputInventory: async () => createInventory(),
        },
      };
    };

    await expect(
      verifySealedGeneratorBundleStability({
        sourceRoot: "fixture",
        dependencyInventory,
        createDependencyInventory: async () => dependencyInventory,
        buildBundle,
        assertToolSnapshotStable: async () => undefined,
        assertGeneratorIdentity: () => undefined,
      }),
    ).rejects.toThrow(/not byte-identical/u);

    content = "stable";
    bundlePass = 0;
    await expect(
      verifySealedGeneratorBundleStability({
        sourceRoot: "fixture",
        dependencyInventory,
        createDependencyInventory: async () => dependencyInventory,
        buildBundle: async () => {
          const bytes = Buffer.from(content, "utf8");
          return {
            bytes,
            digest: sha256(bytes),
            metafileDigest: sha256("metafile:stable"),
            firstPartyInputs: ["packages/mcp/src/core/build/buildRegistry.ts"],
            generator: {
              createCatalogInputInventory: async () => createInventory(),
            },
          };
        },
        assertToolSnapshotStable: async () => undefined,
        assertGeneratorIdentity: () => undefined,
      }),
    ).resolves.toMatchObject({
      inputInventory: { digest: "sha256:stable" },
    });
  });

  it("rejects a transient ABA edit observed by only one bundle pass", async () => {
    let content = "stable";
    let bundlePass = 0;
    const createInventory = () => ({
      digest: `sha256:${content}`,
      entries: [
        {
          path: "packages/mcp/src/core/build/buildRegistry.ts",
          sha256: `sha256:${content}`,
          bytes: content.length,
        },
      ],
    });
    const dependencyInventory = { digest: "sha256:dependencies", entries: [] };

    await expect(
      verifySealedGeneratorBundleStability({
        sourceRoot: "fixture",
        dependencyInventory,
        createDependencyInventory: async () => dependencyInventory,
        buildBundle: async () => {
          bundlePass += 1;
          let observed = content;
          if (bundlePass === 1) {
            content = "transient";
            observed = content;
            content = "stable";
          }
          const bytes = Buffer.from(observed, "utf8");
          return {
            bytes,
            digest: sha256(bytes),
            metafileDigest: sha256(`metafile:${observed}`),
            firstPartyInputs: ["packages/mcp/src/core/build/buildRegistry.ts"],
            generator: {
              createCatalogInputInventory: async () => createInventory(),
            },
          };
        },
        assertToolSnapshotStable: async () => undefined,
        assertGeneratorIdentity: () => undefined,
      }),
    ).rejects.toThrow(/not byte-identical/u);
  });

  it("rejects source inventory mutation during the final production bundle pass", async () => {
    let content = "stable";
    let bundlePass = 0;
    const sourcePath = "packages/mcp/src/core/build/buildRegistry.ts";
    const createInventory = () => ({
      digest: `sha256:${content}`,
      entries: [
        {
          path: sourcePath,
          sha256: `sha256:${content}`,
          bytes: content.length,
        },
      ],
    });
    const dependencyInventory = { digest: "sha256:dependencies", entries: [] };

    await expect(
      verifySealedGeneratorBundleStability({
        sourceRoot: "fixture",
        dependencyInventory,
        createDependencyInventory: async () => dependencyInventory,
        buildBundle: async () => {
          bundlePass += 1;
          const observed = content;
          const bytes = Buffer.from(observed, "utf8");
          if (bundlePass === 2) content = "changed-after-final-bundle";
          return {
            bytes,
            digest: sha256(bytes),
            metafileDigest: sha256(`metafile:${observed}`),
            firstPartyInputs: [sourcePath],
            generator: {
              createCatalogInputInventory: async () => createInventory(),
            },
          };
        },
        assertToolSnapshotStable: async () => undefined,
        assertGeneratorIdentity: () => undefined,
      }),
    ).rejects.toThrow(/Catalog source inventory changed/u);
  });

  it("never loads transient dependency bytes from an ABA edit", async () => {
    const fixtureRoot = await fs.mkdtemp(
      path.join(tmpdir(), "salt-generator-dependency-aba-"),
    );
    const snapshotRoot = path.join(fixtureRoot, "snapshot");
    const dependencyPath = path.join(
      fixtureRoot,
      "repo",
      "node_modules",
      "tool",
      "main.js",
    );
    const stableBytes = Buffer.from("module.exports = 'stable';\n", "utf8");
    const transientBytes = Buffer.from(
      "module.exports = 'transient';\n",
      "utf8",
    );
    const entries = [
      { kind: "directory" as const, path: "node_modules" },
      { kind: "directory" as const, path: "node_modules/tool" },
      {
        kind: "file" as const,
        path: "node_modules/tool/main.js",
        sha256: sha256(stableBytes),
        bytes: stableBytes.byteLength,
      },
    ];
    const inventory = {
      schema_version: "1.0.0",
      entries,
      digest: sha256(canonicalJson({ schema_version: "1.0.0", entries })),
    };

    try {
      await fs.mkdir(path.dirname(dependencyPath), { recursive: true });
      await fs.mkdir(snapshotRoot);
      await fs.writeFile(dependencyPath, stableBytes);

      // The attacker changes the executable bytes after inventory capture.
      await fs.writeFile(dependencyPath, transientBytes);
      await expect(
        materializeVerifiedDependencySnapshot({
          sourceRoot: path.join(fixtureRoot, "repo"),
          dependencyInventory: inventory,
          portableRoots: ["node_modules/tool"],
          snapshotRoot,
        }),
      ).rejects.toThrow(/changed after inventory capture/u);

      // Restoring the source completes the ABA cycle, but only verified bytes
      // can enter the private snapshot used by the orchestrator.
      await fs.writeFile(dependencyPath, stableBytes);
      const snapshot = await materializeVerifiedDependencySnapshot({
        sourceRoot: path.join(fixtureRoot, "repo"),
        dependencyInventory: inventory,
        portableRoots: ["node_modules/tool"],
        snapshotRoot,
      });
      await fs.writeFile(dependencyPath, transientBytes);
      await snapshot.assertStable();
      await expect(
        fs.readFile(
          path.join(snapshot.nodeModulesPath, "tool", "main.js"),
          "utf8",
        ),
      ).resolves.toBe(stableBytes.toString("utf8"));
    } finally {
      await fs.rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("builds docgen metadata hermetically without ignored site snapshots", () => {
    const manifest = readJson<PackageManifest>("../../package.json");
    const registryBuilder = readFileSync(
      new URL("../../scripts/buildKnowledge.mjs", import.meta.url),
      "utf8",
    );
    const registryGenerator = readFileSync(
      new URL("../build/buildRegistry.ts", import.meta.url),
      "utf8",
    );
    const knowledgeV1Builder = readFileSync(
      new URL("../build/buildKnowledgeV1.ts", import.meta.url),
      "utf8",
    );
    const inputInventory = readFileSync(
      new URL("../build/catalogInputInventory.ts", import.meta.url),
      "utf8",
    );
    const semanticInputPatterns = readJson<string[]>(
      "../build/catalogSemanticInputPatterns.json",
    );
    const compilerInputPatterns = readJson<string[]>(
      "../build/catalogCompilerInputPatterns.json",
    );
    const buildIdentity = readFileSync(
      new URL("../../../../scripts/catalogBuildIdentity.mjs", import.meta.url),
      "utf8",
    );

    expect(manifest.devDependencies).toMatchObject({
      "react-docgen-typescript": "^2.4.0",
      typescript: "^6.0.2",
    });
    expect(registryBuilder).not.toContain("refreshSiteProps");
    expect(registryBuilder).not.toContain("gen:props");
    expect(registryBuilder).not.toContain("spawnSync");
    expect(registryGenerator).not.toContain("spawnSync");
    expect(registryGenerator).not.toContain("rev-parse");
    expect(registryGenerator).toContain(
      "options.sourceRevision ?? inventory.digest",
    );
    expect(registryBuilder).toContain("tsconfigRaw");
    expect(registryBuilder).toContain("inputInventory: inputBefore");
    expect(knowledgeV1Builder).toContain("withCatalogInputTracking(");
    expect(knowledgeV1Builder).toContain(
      'readCatalogInputFile(path.join(schemaRoot, schemaFile), "utf8")',
    );
    expect(knowledgeV1Builder).not.toContain(
      "fs.readFile(path.join(schemaRoot, schemaFile)",
    );
    expect(inputInventory).not.toContain("site/src/props");
    expect(inputInventory).toContain("semanticInputPatterns");
    expect(inputInventory).toContain("compilerInputPatterns");
    expect(buildIdentity).not.toMatch(/import catalogInputPatterns/u);
    expect(semanticInputPatterns).toContain(
      "packages/core/src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,css,scss,json}",
    );
    expect(semanticInputPatterns).not.toContain(
      "packages/*/src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,css,scss,json}",
    );
    expect(compilerInputPatterns).toContain("package.json");
    expect(compilerInputPatterns).toContain(".yarnrc.yml");
    expect(compilerInputPatterns).toContain("yarn.lock");
  });

  it("keeps the private CLI package narrow and exact-pinned to Knowledge", () => {
    const manifest = readJson<PackageManifest>("../../../cli/package.json");

    expect(manifest.name).toBe("@salt-ds/cli");
    expect(manifest.private).toBe(true);
    expect(manifest.engines?.node).toBe(">=22");
    expect(manifest.files).toEqual([
      "bin",
      "schemas/salt-config-1.schema.json",
    ]);
    expect(manifest.dependencies).toEqual({
      "@salt-ds/knowledge": "workspace:*",
    });
    expect(manifest.dependencies).not.toHaveProperty("@salt-ds/mcp");
    expect(manifest.dependencies).not.toHaveProperty(
      "@modelcontextprotocol/server",
    );
    expect(manifest.publishConfig?.directory).toBe("../../dist/salt-ds-cli");
    expect(manifest.publishIncludeReadme).toBe(true);
    expect(manifest.publishTypingEntryOnly).toBe(true);
    expect(manifest.publishPreserveModules).toBe(false);
    expect(manifest.publishCanonicalTextPaths).toEqual([
      "README.md",
      "LICENSE",
      "schemas/salt-config-1.schema.json",
    ]);
    expect(manifest.typescriptInclude).toEqual(["src/index.ts"]);
    expect(manifest.publishBinEntrypoints).toEqual({
      "bin/salt-ds.js": {
        requirePath: "../dist-cjs/index.js",
        errorPrefix: "salt-ds error:",
        ignoreBrokenPipe: true,
        conciseErrorCodes: [
          "SALT_CLI_USAGE",
          "SALT_PROJECT_ROOT_NOT_DIRECTORY",
          "SALT_PROJECT_ROOT_UNAVAILABLE",
          "SALT_CONFIG_INVALID",
        ],
      },
    });
    expect(manifest.publishAdditionalEntryPaths).toBeUndefined();
    expect(manifest.publishExports).toEqual({
      ".": {
        types: "./dist-types/index.d.ts",
        import: "./dist-es/index.js",
        require: "./dist-cjs/index.js",
      },
      "./package.json": "./package.json",
    });
    expectEntriesToExclude(manifest.files, FORBIDDEN_RUNTIME_FILE_ENTRIES);
  });

  it("binds package banners and loaded source bytes to one exact catalog build", () => {
    const sourceBytes = Buffer.from("export const fixture = true;\n", "utf8");
    const inputs = [
      {
        path: "packages/mcp/src/index.ts",
        bytes: sourceBytes.byteLength,
        sha256: sha256(sourceBytes),
      },
    ];
    const inputInventoryDigest = sha256(canonicalJson(inputs));
    const generatorReceipt = {
      schema_version: "1.1.0",
      orchestrator: {
        path: "packages/mcp/scripts/buildRegistry.mjs",
        sha256: `sha256:${"1".repeat(64)}`,
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
        platform: "test",
        arch: "test",
        exec_argv: [],
        environment: {
          policy: "empty",
        },
      },
    };
    const manifest = {
      generator: {
        mode: "sealed",
        version: "2.0.0",
        digest: sha256(canonicalJson(generatorReceipt)),
        receipt: generatorReceipt,
      },
      input_inventory_digest: inputInventoryDigest,
      inputs,
    };
    const manifestBytes = Buffer.from(JSON.stringify(manifest), "utf8");
    const identity = createCatalogBuildIdentity(manifestBytes);
    const banner = formatCatalogBuildBanner(identity);
    const parsedBanner = parseCatalogBuildBanner(
      Buffer.from(`${banner}\nexport const fixture = true;\n`, "utf8"),
    );

    expect(assertSameCatalogBuildIdentity(identity, parsedBanner)).toEqual(
      expect.objectContaining({
        manifest_sha256: sha256(manifestBytes),
        input_inventory_digest: inputInventoryDigest,
      }),
    );
    expect(
      assertCatalogInputBytes(
        identity,
        "packages/mcp/src/index.ts",
        sourceBytes,
      ),
    ).toEqual(sourceBytes);
    expect(
      assertCatalogInputBytes(
        identity,
        "packages/mcp/src/index.ts",
        Buffer.from("export const fixture = true;\r\n", "utf8"),
      ),
    ).toEqual(sourceBytes);
    expect(() =>
      assertCatalogInputBytes(
        identity,
        "packages/mcp/src/index.ts",
        Buffer.from([0xc3, 0x28]),
      ),
    ).toThrow(/not valid UTF-8/u);
    expect(assertCatalogManifestBytes(identity, manifestBytes)).toEqual(
      manifestBytes,
    );
    expect(() =>
      assertCatalogInputBytes(
        identity,
        "packages/mcp/src/index.ts",
        Buffer.from("changed", "utf8"),
      ),
    ).toThrow(/does not match/u);
    expect(() =>
      assertCatalogInputBytes(
        identity,
        "packages/mcp/src/undeclared.ts",
        sourceBytes,
      ),
    ).toThrow(/absent from the catalog input inventory/u);
    expect(() =>
      assertCatalogManifestBytes(
        identity,
        Buffer.concat([manifestBytes, Buffer.from("\n", "utf8")]),
      ),
    ).toThrow(/changed during/u);
    expect(() =>
      parseCatalogBuildBanner(Buffer.from("export const fixture = true;")),
    ).toThrow(/no valid Salt catalog identity banner/u);
    expect(() =>
      parseCatalogBuildBanner(
        Buffer.from(`export const fixture = true;\n${banner}\n`, "utf8"),
      ),
    ).toThrow(/no valid Salt catalog identity banner/u);
    expect(() =>
      createCatalogBuildIdentity(
        Buffer.from(
          JSON.stringify({
            ...manifest,
            input_inventory_digest: `sha256:${"1".repeat(64)}`,
          }),
          "utf8",
        ),
      ),
    ).toThrow(/input inventory digest mismatch/u);
    expect(() =>
      createCatalogBuildIdentity(
        Buffer.from(
          JSON.stringify({
            ...manifest,
            inputs: [{ ...inputs[0], path: "packages\\mcp\\src\\index.ts" }],
          }),
          "utf8",
        ),
      ),
    ).toThrow(/Invalid repository-relative build input path/u);
    expect(() =>
      createCatalogBuildIdentity(
        Buffer.from(
          JSON.stringify({
            ...manifest,
            generator: {
              mode: "test",
              version: "2.0.0-test",
              digest: `sha256:${"6".repeat(64)}`,
            },
          }),
          "utf8",
        ),
      ),
    ).toThrow(/requires a sealed, non-test generator/u);
    expect(() =>
      createCatalogBuildIdentity(
        Buffer.from(
          JSON.stringify({
            ...manifest,
            generator: {
              ...manifest.generator,
              receipt: {
                ...generatorReceipt,
                runtime: {
                  ...generatorReceipt.runtime,
                  platform: "tampered",
                },
              },
            },
          }),
          "utf8",
        ),
      ),
    ).toThrow(/generator digest mismatch/u);
    const upperControlBoundary = String.fromCharCode(0x1f);
    const allowedSpaceBoundary = String.fromCharCode(0x20);
    expect(hasForbiddenPortablePathCharacter("packages/mcp/src/index.ts")).toBe(
      false,
    );
    expect(
      hasForbiddenPortablePathCharacter(
        `packages/mcp/src/index${allowedSpaceBoundary}file.ts`,
      ),
    ).toBe(false);
    for (const invalidCharacter of [
      String.fromCharCode(0),
      "\n",
      upperControlBoundary,
      "<",
      ">",
      ":",
      '"',
      "|",
      "?",
      "*",
    ]) {
      expect(
        hasForbiddenPortablePathCharacter(
          `packages/mcp/src/index${invalidCharacter}.ts`,
        ),
      ).toBe(true);
    }
    expect(() =>
      createCatalogBuildIdentity(
        Buffer.from(
          JSON.stringify({
            ...manifest,
            input_inventory_digest: inputInventoryDigest,
            inputs: [
              {
                ...inputs[0],
                path: `packages/mcp/src/index${upperControlBoundary}.ts`,
              },
            ],
          }),
          "utf8",
        ),
      ),
    ).toThrow(/Invalid repository-relative build input path/u);

    const root = path.resolve("catalog-build-root");
    expect(isPathWithinRoot(root, path.join(root, "..guard.ts"))).toBe(true);
    expect(isPathWithinRoot(root, path.resolve(root, "..", "escape.ts"))).toBe(
      false,
    );
  });
});
