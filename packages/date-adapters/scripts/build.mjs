import path from "node:path";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import browserslistToEsbuild from "browserslist-to-esbuild";
import fs from "fs-extra";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import postcss from "rollup-plugin-postcss";
import { makeTypings } from "./makeTypings.mjs";
// import { transformWorkspaceDeps } from "./transformWorkspaceDeps.mjs";
// import { distinct } from "./utils.mjs";

const cwd = process.cwd();

const packageJson = (
  await import(path.join("file://", cwd, "package.json"), {
    with: { type: "json" },
  })
).default;

const FILES_TO_COPY = [];
// ["README.md", "LICENSE", "CHANGELOG.md"].concat(
//   packageJson.files ?? [],
// );

const ENTRY_FOLDERS = ["date-fns", "dayjs", "luxon", "moment"];

for (const entry of ENTRY_FOLDERS) {
  const packageName = `${packageJson.name}/${entry}`;

  const outputDir = path.join(packageJson.publishConfig.directory, entry);

  console.log(`Building ${packageName}`);

  await fs.mkdirp(outputDir);
  await fs.emptyDir(outputDir);

  await makeTypings(outputDir, entry);

  const bundle = await rollup({
    input: path.join(cwd, "src", entry, "index.ts"),
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

  await fs.writeJSON(
    path.join(outputDir, "package.json"),
    {
      sideEffects: false,
      main: `dist-cjs/${entry}/index.js`,
      module: `dist-es/${entry}/index.js`,
      typings: `dist-types/${entry}/index.d.ts`,
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
}
