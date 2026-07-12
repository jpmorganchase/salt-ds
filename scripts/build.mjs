import path from "node:path";
import url from "node:url";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import browserslistToEsbuild from "browserslist-to-esbuild";
import fs from "fs-extra";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import postcss from "rollup-plugin-postcss";
import { makeTypings } from "./makeTypings.mjs";
import { transformWorkspaceDeps } from "./transformWorkspaceDeps.mjs";
import { distinct } from "./utils.mjs";

const cwd = process.cwd();
const repoRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
);

const packageJson = (
  await import(url.pathToFileURL(path.join(cwd, "package.json")), {
    with: { type: "json" },
  })
).default;
const {
  publishExports,
  publishBinEntrypoints = {},
  publishScriptExcludes = [],
  publishAdditionalDependencies = {},
  publishAdditionalEntryPaths = [],
  publishExtraCopyPaths = [],
  publishPreserveModules = true,
  publishSourceMaps = true,
  publishIncludeChangelog = true,
  generateTypings = true,
  publishTypingEntryOnly = false,
  publishConfig,
  typescriptInclude: _typescriptInclude,
  typescriptRootDir: _typescriptRootDir,
  dependencies: _dependencies,
  devDependencies: _devDependencies,
  peerDependencies: _peerDependencies,
  ...packageJsonForPublish
} = packageJson;

const FILES_TO_COPY = [
  "README.md",
  "LICENSE",
  ...(publishIncludeChangelog ? ["CHANGELOG.md"] : []),
].concat(packageJson.files ?? []);

const packageName = packageJson.name;
const { directory: _publishConfigDirectory, ...publishConfigForPublish } =
  publishConfig ?? {};
const outputDir = path.join(publishConfig.directory);
const sourceEntryPath = path.join(cwd, "src", "index.ts");
const additionalSourceEntryPaths = publishAdditionalEntryPaths.map(
  (entryPath) => path.join(cwd, entryPath),
);

const typingSourceConfig =
  packageJson.typescriptInclude || packageJson.typescriptRootDir
    ? {
        include: (packageJson.typescriptInclude ?? ["src"]).map((entry) =>
          path.join(cwd, entry),
        ),
        rootDir: path.join(cwd, packageJson.typescriptRootDir ?? "src"),
      }
    : path.join(cwd, "src");
const typingRootDir =
  typeof typingSourceConfig === "string"
    ? typingSourceConfig
    : typingSourceConfig.rootDir;

const publishedEntryPath = path
  .relative(typingRootDir, sourceEntryPath)
  .replace(/\\/g, "/")
  .replace(/\.ts$/, ".js");
const publishedTypingEntryPath = publishedEntryPath.replace(/\.js$/, ".d.ts");

console.log(`Building ${packageName}`);

await fs.mkdirp(outputDir);
await fs.emptyDir(outputDir);

if (generateTypings) {
  await makeTypings(outputDir, typingSourceConfig);

  if (publishTypingEntryOnly) {
    const typingsDir = path.join(outputDir, "dist-types");
    const typingEntryPath = path.resolve(typingsDir, publishedTypingEntryPath);
    const relativeTypingEntryPath = path.relative(typingsDir, typingEntryPath);

    if (
      relativeTypingEntryPath.startsWith("..") ||
      path.isAbsolute(relativeTypingEntryPath)
    ) {
      throw new Error(
        `Published typing entry must stay inside dist-types: ${publishedTypingEntryPath}`,
      );
    }

    const typingEntry = await fs.readFile(typingEntryPath, "utf8");
    if (/(?:from\s+|import\s*\()\s*["']\.\.?\//u.test(typingEntry)) {
      throw new Error(
        `Cannot publish only ${publishedTypingEntryPath}: its declaration still references a relative module`,
      );
    }

    await fs.emptyDir(typingsDir);
    await fs.outputFile(typingEntryPath, typingEntry, "utf8");
  }
}

const bundle = await rollup({
  input: [sourceEntryPath, ...additionalSourceEntryPaths],
  external: (id) => {
    // via tsdx
    // TODO: this should probably be included into deps instead
    if (id === "babel-plugin-transform-async-to-promises/helpers") {
      // we want to inline these helpers
      return false;
    }
    // exclude any dependency that's not a realtive import
    return !id.startsWith(".") && !path.isAbsolute(id);
  },
  treeshake: {
    propertyReadSideEffects: false,
  },
  plugins: [
    nodeResolve({
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      browser: true,
      mainFields: ["module", "main", "browser"],
    }),
    commonjs({ include: /\/node_modules\// }),
    esbuild({
      target: browserslistToEsbuild(),
      minify: false,
      sourceMap: publishSourceMaps,
    }),
    postcss({ extract: false, inject: false }),
    json(),
  ],
});

const transformSourceMap = (relativeSourcePath, sourceMapPath) => {
  // make source map input files relative to the `${packagePath}/dist-${format}` within
  // the package directory

  const absoluteSourcepath = path.resolve(
    path.dirname(sourceMapPath),
    relativeSourcePath,
  );
  const packageRelativeSourcePath = path.relative(cwd, absoluteSourcepath);

  return `../${packageRelativeSourcePath}`;
};

await bundle.write({
  freeze: false,
  sourcemap: publishSourceMaps,
  preserveModules: publishPreserveModules,
  dir: path.join(outputDir, "dist-cjs"),
  format: "cjs",
  exports: "auto",
  ...(publishSourceMaps ? { sourcemapPathTransform: transformSourceMap } : {}),
});

await bundle.write({
  freeze: false,
  sourcemap: publishSourceMaps,
  preserveModules: publishPreserveModules,
  dir: path.join(outputDir, "dist-es"),
  format: "es",
  exports: "auto",
  ...(publishSourceMaps ? { sourcemapPathTransform: transformSourceMap } : {}),
});

await bundle.close();

// The repository root intentionally has no package `type`, while the build
// emits `.js` files for both module formats. Give Node an unambiguous format
// boundary so ESM consumers do not trigger MODULE_TYPELESS_PACKAGE_JSON
// reparsing warnings, and so CJS remains correct if a package later opts into
// `type: module` at its root.
await Promise.all([
  fs.writeJSON(path.join(outputDir, "dist-cjs", "package.json"), {
    type: "commonjs",
  }),
  fs.writeJSON(path.join(outputDir, "dist-es", "package.json"), {
    type: "module",
  }),
]);

const publishedScripts =
  packageJsonForPublish.scripts &&
  typeof packageJsonForPublish.scripts === "object"
    ? Object.fromEntries(
        Object.entries(packageJsonForPublish.scripts).filter(
          ([scriptName]) => !publishScriptExcludes.includes(scriptName),
        ),
      )
    : undefined;

if (publishedScripts && Object.keys(publishedScripts).length > 0) {
  packageJsonForPublish.scripts = publishedScripts;
} else {
  delete packageJsonForPublish.scripts;
}

const publishedDependencies = await transformWorkspaceDeps({
  ...(packageJson.dependencies ?? {}),
  ...publishAdditionalDependencies,
});
const publishedPeerDependencies = packageJson.peerDependencies
  ? await transformWorkspaceDeps(packageJson.peerDependencies)
  : null;
const publishedExtraCopyPaths = publishExtraCopyPaths.map((copyConfig) =>
  typeof copyConfig === "string" ? copyConfig : copyConfig.to,
);

async function copyPublishExtraFile(fromPath, toPath) {
  if (path.extname(fromPath) === ".json") {
    const content = await fs.readFile(fromPath, "utf8");
    await fs.outputFile(toPath, JSON.stringify(JSON.parse(content)), "utf8");
    return;
  }

  await fs.copy(fromPath, toPath);
}

await fs.writeJSON(
  path.join(outputDir, "package.json"),
  {
    ...packageJsonForPublish,
    ...(Object.keys(publishedDependencies).length > 0
      ? { dependencies: publishedDependencies }
      : {}),
    ...(publishedPeerDependencies &&
    Object.keys(publishedPeerDependencies).length > 0
      ? {
          peerDependencies: publishedPeerDependencies,
        }
      : {}),
    ...(Object.keys(publishConfigForPublish).length > 0
      ? { publishConfig: publishConfigForPublish }
      : {}),
    ...(publishExports ? { exports: publishExports } : {}),
    main: `dist-cjs/${publishedEntryPath}`,
    module: `dist-es/${publishedEntryPath}`,
    ...(generateTypings
      ? { typings: `dist-types/${publishedTypingEntryPath}` }
      : {}),
    files: distinct([
      ...(packageJson.files ?? []),
      ...publishedExtraCopyPaths,
      "dist-cjs",
      "dist-es",
      ...(generateTypings ? ["dist-types"] : []),
      ...(publishIncludeChangelog ? ["CHANGELOG.md"] : []),
    ]),
  },
  { spaces: 2 },
);

for (const file of FILES_TO_COPY) {
  let filePath = path.join(cwd, file);
  if (file === "LICENSE" && !(await fs.pathExists(filePath))) {
    filePath = path.join(repoRoot, file);
  }
  try {
    await fs.copy(filePath, path.join(outputDir, file));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

for (const copyConfig of publishExtraCopyPaths) {
  const fromPath =
    typeof copyConfig === "string"
      ? path.join(cwd, copyConfig)
      : path.resolve(cwd, copyConfig.from);
  const toPath =
    typeof copyConfig === "string"
      ? path.join(outputDir, copyConfig)
      : path.join(outputDir, copyConfig.to);

  if (
    typeof copyConfig === "object" &&
    Array.isArray(copyConfig.files) &&
    copyConfig.files.length > 0
  ) {
    await Promise.all(
      copyConfig.files.map(async (relativeFilePath) => {
        await copyPublishExtraFile(
          path.join(fromPath, relativeFilePath),
          path.join(toPath, relativeFilePath),
        );
      }),
    );
  } else {
    await fs.copy(fromPath, toPath);
  }
}

for (const [relativeBinPath, entrypoint] of Object.entries(
  publishBinEntrypoints,
)) {
  const {
    requirePath,
    exportName = "runCli",
    errorPrefix = `${packageName} error:`,
  } = entrypoint;
  const binPath = path.join(outputDir, relativeBinPath);

  await fs.mkdirp(path.dirname(binPath));
  await fs.writeFile(
    binPath,
    `#!/usr/bin/env node

const { ${exportName} } = require(${JSON.stringify(requirePath)});

${exportName}(process.argv.slice(2))
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error(${JSON.stringify(errorPrefix)}, error);
    process.exit(1);
  });
`,
    "utf8",
  );
  await fs.chmod(binPath, 0o755);
}

console.log(`Built ${packageName} into ${outputDir}`);
