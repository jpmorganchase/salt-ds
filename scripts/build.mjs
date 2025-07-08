import path from "node:path";
import url from "node:url";
import fs from "fs-extra";
import { rolldown } from "rolldown";
import postcss from "rollup-plugin-postcss";
import { makeTypings } from "./makeTypings.mjs";
import { transformWorkspaceDeps } from "./transformWorkspaceDeps.mjs";
import { distinct } from "./utils.mjs";

const cwd = process.cwd();

const packageJson = (
  await import(url.pathToFileURL(path.join(cwd, "package.json")), {
    with: { type: "json" },
  })
).default;

const FILES_TO_COPY = ["README.md", "LICENSE", "CHANGELOG.md"].concat(
  packageJson.files ?? [],
);

const packageName = packageJson.name;
const outputDir = path.join(packageJson.publishConfig.directory);

console.log(`Building ${packageName}`);

await fs.mkdirp(outputDir);
await fs.emptyDir(outputDir);

await makeTypings(outputDir);

const bundle = await rolldown({
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
  plugins: [postcss({ extract: false, inject: false })],
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
  sourcemap: true,
  preserveModules: true,
  dir: path.join(outputDir, "dist-cjs"),
  format: "cjs",
  exports: "auto",
  sourcemapPathTransform: transformSourceMap,
});

await bundle.write({
  sourcemap: true,
  preserveModules: true,
  dir: path.join(outputDir, "dist-es"),
  format: "es",
  exports: "auto",
  sourcemapPathTransform: transformSourceMap,
});

await bundle.close();

await fs.writeJSON(
  path.join(outputDir, "package.json"),
  {
    ...packageJson,
    dependencies: await transformWorkspaceDeps(packageJson.dependencies),
    main: "dist-cjs/index.js",
    module: "dist-es/index.js",
    typings: "dist-types/index.d.ts",
    files: distinct([
      ...(packageJson.files ?? []),
      "dist-cjs",
      "dist-es",
      "dist-types",
      "CHANGELOG.md",
    ]),
  },
  { spaces: 2 },
);

for (const file of FILES_TO_COPY) {
  const filePath = path.join(cwd, file);
  try {
    await fs.copy(filePath, path.join(outputDir, file));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

console.log(`Built ${packageName} into ${outputDir}`);
