import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  assertCleanGeneratorEnvironment,
  assertNoDynamicCodeLoading,
  createBundleMetafileDigest,
  createGeneratorDigest,
  getBundleFirstPartyInputPaths,
  validateBundleMetafile,
  withCanonicalGeneratorEnvironment,
} from "../../scripts/buildKnowledge.mjs";
import { createSealedCatalogGeneratorDigest } from "../build/generatorDependencyInventory.js";
import type { CatalogGeneratorReceipt } from "../catalog/catalogSchemaV2.js";

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

describe("canonical generator script guards", () => {
  it("rejects ambient module resolution and every launcher argument", () => {
    expect(() => assertCleanGeneratorEnvironment({}, [])).not.toThrow();
    for (const name of [
      "NODE_OPTIONS",
      "NODE_PATH",
      "NODE_ICU_DATA",
      "NODE_PRESERVE_SYMLINKS",
      "NODE_PRESERVE_SYMLINKS_MAIN",
      "NODE_V8_COVERAGE",
      "NODE_COMPILE_CACHE",
      "NODE_DISABLE_COMPILE_CACHE",
      "UV_THREADPOOL_SIZE",
      "ESBUILD_BINARY_PATH",
      "ESBUILD_WORKER_THREADS",
      "ESBUILD_MAX_BUFFER",
    ]) {
      expect(() =>
        assertCleanGeneratorEnvironment({ [name]: "hostile" }, []),
      ).toThrow(new RegExp(name, "u"));
    }
    for (const argument of [
      "-r",
      "-r./hook.cjs",
      "--require=./hook.cjs",
      "--import",
      "--loader=./loader.mjs",
      "--experimental-loader",
      "--conditions=custom",
      "--preserve-symlinks",
      "--trace-warnings",
    ]) {
      expect(() => assertCleanGeneratorEnvironment({}, [argument])).toThrow(
        /rejects Node argument/u,
      );
    }
  });

  it("executes generator work with an empty process environment and restores it", async () => {
    const ambientEnvironment = process.env;
    process.env.SALT_MCP_GENERATOR_ENV_SENTINEL = "ambient";
    try {
      await withCanonicalGeneratorEnvironment(async () => {
        expect(process.env).not.toBe(ambientEnvironment);
        expect(Object.keys(process.env)).toEqual([]);
        process.env.SALT_MCP_GENERATOR_ENV_SENTINEL = "isolated";
      });
      expect(process.env).toBe(ambientEnvironment);
      expect(process.env.SALT_MCP_GENERATOR_ENV_SENTINEL).toBe("ambient");
    } finally {
      process.env = ambientEnvironment;
      delete process.env.SALT_MCP_GENERATOR_ENV_SENTINEL;
    }
  });

  it("rejects runtime code generation and non-literal module loading", () => {
    for (const source of [
      'eval("hostile")',
      '(0, eval)("hostile")',
      'Function("return hostile")',
      'new Function("return hostile")',
      'globalThis.Function("return hostile")',
      "require(moduleName)",
      "__require(moduleName)",
      "require.apply(null, moduleArguments)",
      'module["require"]("hostile")',
      "import(moduleName)",
      'createRequire(import.meta.url)("hostile")',
      "require/* hidden */(moduleName)",
    ]) {
      expect(() => assertNoDynamicCodeLoading(source, ts), source).toThrow(
        /forbidden runtime code loading/u,
      );
    }
    expect(() =>
      assertNoDynamicCodeLoading(
        'const message = "import(moduleName)"; const visitor = { Function(path) { return path; } }; const fs = __require("node:fs"); import("node:path");',
        ts,
      ),
    ).not.toThrow();
  });

  it("requires every dependency input and only declared external modules", () => {
    const inventory = {
      schema_version: "1.0.0",
      digest: SHA,
      entries: [
        {
          kind: "file",
          path: "node_modules/fixture/index.js",
          sha256: SHA,
          bytes: 0,
        },
      ],
    };
    const metafile = {
      inputs: {
        "packages/mcp/src/core/build/catalogGeneratorEntry.ts": {
          bytes: 1,
          imports: [],
        },
      },
      outputs: {
        "generator.mjs": {
          bytes: 1,
          inputs: {},
          exports: [],
          entryPoint: "packages/mcp/src/core/build/catalogGeneratorEntry.ts",
          imports: [
            { path: "typescript", kind: "import-statement", external: true },
            { path: "node:fs", kind: "import-statement", external: true },
          ],
        },
      },
    };

    expect(() => validateBundleMetafile(metafile, inventory)).not.toThrow();
    expect(getBundleFirstPartyInputPaths(metafile)).toEqual([
      "packages/mcp/src/core/build/catalogGeneratorEntry.ts",
    ]);
    expect(createBundleMetafileDigest(metafile)).toBe(
      createBundleMetafileDigest({
        ...metafile,
        outputs: {
          "different-temporary-path/generator.mjs":
            metafile.outputs["generator.mjs"],
        },
      }),
    );
    expect(() =>
      validateBundleMetafile(
        {
          ...metafile,
          inputs: {
            ...metafile.inputs,
            "node_modules/undeclared/index.js": {
              bytes: 1,
              imports: [],
            },
          },
        },
        inventory,
      ),
    ).toThrow(/un-inventoried dependency/u);
    expect(() =>
      validateBundleMetafile(
        {
          ...metafile,
          inputs: {
            ...metafile.inputs,
            "node_modules/source-map-js/source-map.js": {
              bytes: 1,
              imports: [],
            },
          },
        },
        inventory,
      ),
    ).toThrow(/forbidden source-map runtime code/u);
    expect(() =>
      validateBundleMetafile(
        {
          ...metafile,
          outputs: {
            "generator.mjs": {
              ...metafile.outputs["generator.mjs"],
              imports: [
                {
                  path: "left-pad",
                  kind: "import-statement",
                  external: true,
                },
                {
                  path: "typescript",
                  kind: "import-statement",
                  external: true,
                },
              ],
            },
          },
        },
        inventory,
      ),
    ).toThrow(/undeclared external import/u);
    expect(() =>
      validateBundleMetafile(
        {
          ...metafile,
          outputs: {
            "generator.mjs": {
              ...metafile.outputs["generator.mjs"],
              imports: [],
            },
          },
        },
        inventory,
      ),
    ).toThrow(/expected exact TypeScript external/u);
  });

  it("computes the same receipt digest in the orchestrator and bundle", () => {
    const receipt = createReceipt();
    const digest = createGeneratorDigest(receipt);
    expect(digest).toBe(createSealedCatalogGeneratorDigest(receipt));
    expect(
      createGeneratorDigest({
        ...receipt,
        runtime: { ...receipt.runtime, platform: "changed" },
      }),
    ).not.toBe(digest);
  });
});
