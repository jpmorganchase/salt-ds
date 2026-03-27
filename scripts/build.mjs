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
  generateTypings = true,
  publishEntryPath,
  ...packageJsonForPublish
} = packageJson;

const FILES_TO_COPY = ["README.md", "LICENSE", "CHANGELOG.md"].concat(
  packageJson.files ?? [],
);

const packageName = packageJson.name;
const outputDir = path.join(packageJson.publishConfig.directory);
const sourceEntryPath = path.join(cwd, "src", "index.ts");

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

const publishedEntryPath =
  publishEntryPath ??
  path
    .relative(typingRootDir, sourceEntryPath)
    .replace(/\\/g, "/")
    .replace(/\.ts$/, ".js");
const publishedTypingEntryPath = publishedEntryPath.replace(/\.js$/, ".d.ts");

console.log(`Building ${packageName}`);

await fs.mkdirp(outputDir);
await fs.emptyDir(outputDir);

if (generateTypings) {
  await makeTypings(outputDir, typingSourceConfig);
}

const bundle = await rollup({
  input: path.join(cwd, "src/index.ts"),
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
      sourceMap: true,
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
  sourcemap: true,
  preserveModules: true,
  dir: path.join(outputDir, "dist-cjs"),
  format: "cjs",
  exports: "auto",
  sourcemapPathTransform: transformSourceMap,
});

await bundle.write({
  freeze: false,
  sourcemap: true,
  preserveModules: true,
  dir: path.join(outputDir, "dist-es"),
  format: "es",
  exports: "auto",
  sourcemapPathTransform: transformSourceMap,
});

await bundle.close();

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

await fs.writeJSON(
  path.join(outputDir, "package.json"),
  {
    ...packageJsonForPublish,
    dependencies: await transformWorkspaceDeps(packageJson.dependencies),
    ...(packageJson.peerDependencies
      ? {
          peerDependencies: await transformWorkspaceDeps(
            packageJson.peerDependencies,
          ),
        }
      : {}),
    ...(publishExports ? { exports: publishExports } : {}),
    main: `dist-cjs/${publishedEntryPath}`,
    module: `dist-es/${publishedEntryPath}`,
    ...(generateTypings
      ? { typings: `dist-types/${publishedTypingEntryPath}` }
      : {}),
    files: distinct([
      ...(packageJson.files ?? []),
      "dist-cjs",
      "dist-es",
      ...(generateTypings ? ["dist-types"] : []),
      "CHANGELOG.md",
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
