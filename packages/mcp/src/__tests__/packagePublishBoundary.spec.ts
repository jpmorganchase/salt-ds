import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertCatalogInputBytes,
  assertCatalogManifestBytes,
  assertSameCatalogBuildIdentity,
  createCatalogBuildIdentity,
  formatCatalogBuildBanner,
  hasForbiddenPortablePathCharacter,
  isPathWithinRoot,
  parseCatalogBuildBanner,
} from "../../../../scripts/catalogBuildIdentity.mjs";
import {
  captureStableCatalogInventory,
  materializeVerifiedDependencySnapshot,
} from "../../scripts/buildRegistry.mjs";
import { canonicalJson } from "../core/catalog/catalogSerialization.js";

type PackageManifest = {
  name?: string;
  engines?: Record<string, string>;
  files?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  publishEntryPath?: string;
  publishAdditionalEntryPaths?: string[];
  publishBuildIdentityManifest?: string;
  publishBundledWorkspaceDependencies?: string[];
  publishBinEntrypoints?: Record<
    string,
    { requirePath?: string; errorPrefix?: string }
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
  publishScriptExcludes?: string[];
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
  it("fails closed when catalog inputs change across the generator bundle boundary", async () => {
    let content = "before";
    const createInventory = async () => ({
      digest: `sha256:${content}`,
      entries: [
        {
          path: "packages/mcp/src/core/build/buildRegistry.ts",
          sha256: `sha256:${content}`,
          bytes: content.length,
        },
      ],
    });

    await expect(
      captureStableCatalogInventory(createInventory, async () => {
        content = "after";
      }),
    ).rejects.toThrow(/changed while bundling the generator/u);

    content = "stable";
    await expect(
      captureStableCatalogInventory(
        createInventory,
        async () => "sha256:stable-bundle",
      ),
    ).resolves.toMatchObject({
      digest: "sha256:stable",
    });
  });

  it("rejects a transient ABA edit observed by only one bundle pass", async () => {
    let content = "stable";
    let bundlePass = 0;
    const createInventory = async () => ({
      digest: `sha256:${content}`,
      entries: [
        {
          path: "packages/mcp/src/core/build/buildRegistry.ts",
          sha256: `sha256:${content}`,
          bytes: content.length,
        },
      ],
    });

    await expect(
      captureStableCatalogInventory(createInventory, async () => {
        bundlePass += 1;
        if (bundlePass === 1) {
          content = "transient";
          const observed = content;
          content = "stable";
          return `sha256:${observed}`;
        }
        return `sha256:${content}`;
      }),
    ).rejects.toThrow(/not byte-identical/u);
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
      new URL("../../scripts/buildRegistry.mjs", import.meta.url),
      "utf8",
    );
    const registryGenerator = readFileSync(
      new URL("../core/build/buildRegistry.ts", import.meta.url),
      "utf8",
    );
    const inputInventory = readFileSync(
      new URL("../core/build/catalogInputInventory.ts", import.meta.url),
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
    expect(inputInventory).not.toContain("site/src/props");
    expect(inputInventory).toContain('"package.json"');
    expect(inputInventory).toContain('".yarnrc.yml"');
    expect(inputInventory).toContain('"yarn.lock"');
  });

  it("keeps MCP published file roots limited to runtime payload", () => {
    const manifest = readJson<PackageManifest>("../../package.json");

    expect(manifest.publishConfig?.directory).toBe("../../dist/salt-ds-mcp");
    expect(manifest.engines?.node).toBe(">=22");
    expect(manifest.files).toEqual(["bin", "CORE_ARCHITECTURE.md"]);
    expect(manifest.typescriptInclude).toEqual(["src/index.ts"]);
    expect(manifest.publishEntryPath).toBeUndefined();
    expect(manifest.publishTypingEntryPath).toBeUndefined();
    expect(manifest.publishTypingEntryOnly).toBe(true);
    expect(manifest.publishPreserveModules).toBe(false);
    expect(manifest.publishBuildIdentityManifest).toBe(
      "generated/catalog-manifest.json",
    );
    expectEntriesToExclude(manifest.files, FORBIDDEN_RUNTIME_FILE_ENTRIES);
    expect(manifest.publishBundledWorkspaceDependencies).toBeUndefined();
    expect(manifest.dependencies).not.toHaveProperty("@salt-ds/semantic-core");
    expect(manifest.dependencies).not.toHaveProperty("get-tsconfig");
    expect(manifest.dependencies?.["jsonc-parser"]).toMatch(/^\^3\./u);
    expect(manifest.dependencies?.["js-yaml"]).toMatch(/^\^4\./u);
    expect(manifest.dependencies?.postcss).toMatch(/^\^8\./u);
    expect(manifest.dependencies?.["@types/node"]).toMatch(/^\^24\./u);
    expect(manifest.publishBinEntrypoints).toEqual({
      "bin/salt-mcp.js": {
        requirePath: "../dist-cjs/index.js",
        errorPrefix: "salt-mcp error:",
      },
    });
    expect(manifest.publishScriptExcludes).toEqual([
      "build",
      "build:package",
      "build:registry",
      "measure:runtime-loc",
      "measure:surface",
      "prepack",
    ]);
    expect(manifest.publishExports).toEqual({
      ".": {
        types: "./dist-types/index.d.ts",
        import: "./dist-es/index.js",
        require: "./dist-cjs/index.js",
      },
      "./package.json": "./package.json",
    });
    expect(manifest.publishExtraCopyPaths).toEqual([
      {
        from: "generated",
        to: "generated",
        filesFromManifest: "generated/catalog-manifest.json",
        manifestSupportArtifactKind: "package_inventory",
      },
    ]);
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

  it("does not publish MCP eval runner entrypoints or fixture payloads", () => {
    const manifest = readJson<PackageManifest>("../../package.json");

    expect(manifest.publishAdditionalEntryPaths).toBeUndefined();
  });

  it("keeps the workspace CLI on the same single bundled entrypoint", () => {
    const workspaceBin = readFileSync(
      new URL("../../bin/salt-mcp.js", import.meta.url),
      "utf8",
    );

    expect(workspaceBin).toContain(
      "../../../dist/salt-ds-mcp/dist-cjs/index.js",
    );
    expect(workspaceBin).not.toContain("dist-cjs/mcp/src/index.js");
  });

  it("keeps the public-surface measurement compatible with esbuild and ESM", () => {
    const measurementScript = readFileSync(
      new URL("../../scripts/measurePublicSurface.mjs", import.meta.url),
      "utf8",
    );

    expect(measurementScript).toContain(
      'onLoad({ filter: /.*/, namespace: "file" }',
    );
    expect(measurementScript).not.toContain("filter: /.*/u");
    expect(measurementScript).toContain(
      'path.join(builtPackageRoot, "dist-es", "package.json")',
    );
    const firstHitIndex = measurementScript.indexOf(
      "await client.callTool(firstHitTool)",
    );
    expect(firstHitIndex).toBeGreaterThan(-1);
    expect(firstHitIndex).toBeLessThan(
      measurementScript.indexOf("await client.listResources()"),
    );
    expect(firstHitIndex).toBeLessThan(
      measurementScript.indexOf("await client.listResourceTemplates()"),
    );
    expect(measurementScript).toContain(
      "resource_inventory_warmed_before_first_hit: false",
    );
  });

  it("does not declare private workspace or browser-test dependencies", () => {
    const manifest = readJson<PackageManifest>("../../package.json");
    const dependencyNames = Object.keys(manifest.dependencies ?? {});

    expect(dependencyNames).not.toContain("@salt-ds/semantic-core");
    expect(dependencyNames).not.toContain("playwright");
    expect(dependencyNames).not.toContain("playwright-core");
    expect(dependencyNames).not.toContain("@playwright/test");
  });
});
