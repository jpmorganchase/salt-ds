import { readFile } from "node:fs/promises";
import path from "node:path";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { getTsconfig } from "get-tsconfig";
import { build } from "tsdown";
import { makeTypings } from "./makeTypings.mjs";
import { emptyDir } from "./utils.mjs";

function isExternal(id) {
  // Compiler helpers belong in the published output, not in a consumer's
  // dependencies. All other bare imports retain the existing library boundary.
  if (id === "@oxc-project/runtime" || id.startsWith("@oxc-project/runtime/")) {
    return false;
  }
  return !id.startsWith("\0") && !id.startsWith(".") && !path.isAbsolute(id);
}

function moduleFileName(chunk, preserveModules) {
  // CSS and a component commonly share a basename (Button.css/Button.tsx).
  // Keep the asset suffix so it cannot take the component's published path.
  const extension = path.extname(chunk.facadeModuleId ?? "");
  return preserveModules && [".css", ".json"].includes(extension)
    ? `[name]${extension}.js`
    : "[name].js";
}

function createBuildOptions(
  cwd,
  { input, directory = "", preserveModules = true },
) {
  return {
    config: false,
    cwd,
    entry: { index: path.resolve(cwd, input) },
    root: path.join(cwd, "src"),
    format: {
      esm: { outDir: path.join(cwd, "dist-es", directory) },
      cjs: { outDir: path.join(cwd, "dist-cjs", directory) },
    },
    outDir: cwd,
    // The package is cleaned once before any of its entry points are built.
    clean: false,
    outExtensions: () => ({ js: ".js" }),
    unbundle: preserveModules,
    // TypeScript 7 checks and emits declarations in a separate process.
    dts: false,
    tsconfig: getTsconfig(cwd)?.path,
    // Published libraries must leave development checks for the consumer's build.
    platform: "neutral",
    target: browserslistToEsbuild(undefined, { path: cwd, env: "production" }),
    sourcemap: true,
    minify: false,
    hash: false,
    cjsDefault: preserveModules,
    treeshake: { propertyReadSideEffects: false },
    deps: {
      alwaysBundle: [/^@oxc-project\/runtime(?:\/|$)/],
      neverBundle: isExternal,
    },
    inputOptions: {
      platform: "neutral",
      // Preserve the source-relative modules used by existing deep imports.
      optimization: { inlineConst: false },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        mainFields: ["module", "main", "browser"],
      },
      transform: { jsx: { development: false } },
      onwarn(warning, defaultHandler) {
        if (["UNRESOLVED_IMPORT", "MISSING_EXPORT"].includes(warning.code)) {
          throw new Error(`${warning.code}: ${warning.message}`);
        }
        defaultHandler(warning);
      },
    },
    outputOptions: {
      entryFileNames: (chunk) => moduleFileName(chunk, preserveModules),
      chunkFileNames: (chunk) => moduleFileName(chunk, preserveModules),
      exports: preserveModules ? "auto" : "named",
    },
    // Salt owns injection, including CSP nonces and the destination window.
    // Loading CSS as text preserves the exact authored stylesheet strings.
    css: false,
    loader: { ".css": "text" },
    exports: false,
    report: false,
    logLevel: "warn",
  };
}

async function buildJavaScript(cwd, entries) {
  for (const entry of entries) {
    await build(createBuildOptions(cwd, entry));
  }
}

async function preparePackage(cwd) {
  const results = await Promise.allSettled(
    ["dist-cjs", "dist-es", "dist-types"].map((directory) =>
      emptyDir(path.join(cwd, directory)),
    ),
  );
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (failures.length > 0) {
    throw new AggregateError(failures, `Could not clean ${cwd}`);
  }
}

export async function buildPackage({
  cwd = process.cwd(),
  entries = [{ input: "src/index.ts" }],
} = {}) {
  const { name } = JSON.parse(
    await readFile(path.join(cwd, "package.json"), "utf8"),
  );
  console.log(`Building ${name}`);

  await preparePackage(cwd);

  // The native compiler runs in a separate process alongside JS generation.
  // Wait for both branches to finish, including cleanup, before reporting errors.
  const results = await Promise.allSettled([
    makeTypings(cwd),
    buildJavaScript(cwd, entries),
  ]);
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (failures.length > 0) {
    throw new AggregateError(failures, `Could not build ${name}`);
  }

  console.log(`Built ${name} into ${cwd}`);
}
