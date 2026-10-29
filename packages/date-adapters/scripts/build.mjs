import path from "node:path";
import url from "node:url";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { makeTypings } from "./../../../scripts/makeTypings.mjs";
import { emptyDir } from "./../../../scripts/utils.mjs";

const cwd = process.cwd();

const packageJson = (
  await import(url.pathToFileURL(path.join(cwd, "package.json")), {
    with: { type: "json" },
  })
).default;
const packageName = packageJson.name;

console.log(`Building ${packageName}`);

await Promise.all(
  ["dist-cjs", "dist-es", "dist-types"].map((directory) =>
    emptyDir(path.join(cwd, directory)),
  ),
);

// Define entry points for each adapter
const entryPoints = {
  types: path.join(cwd, "src/types/index.ts"),
  moment: path.join(cwd, "src/moment-adapter/index.ts"),
  luxon: path.join(cwd, "src/luxon-adapter/index.ts"),
  dayjs: path.join(cwd, "src/dayjs-adapter/index.ts"),
  "date-fns": path.join(cwd, "src/date-fns-adapter/index.ts"),
  "date-fns-tz": path.join(cwd, "src/date-fns-tz-adapter/index.ts"),
};

for (const [adapterName, inputPath] of Object.entries(entryPoints)) {
  await makeTypings(cwd, path.dirname(inputPath));

  const bundle = await rollup({
    input: inputPath,
    external: (id) => {
      if (id === "babel-plugin-transform-async-to-promises/helpers") {
        return false;
      }
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
      json(),
    ],
  });

  const transformSourceMap = (relativeSourcePath, sourceMapPath) => {
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
    preserveModules: false,
    dir: path.join(cwd, `dist-cjs/${adapterName}`),
    format: "cjs",
    exports: "named",
    sourcemapPathTransform: transformSourceMap,
  });

  await bundle.write({
    freeze: false,
    sourcemap: true,
    preserveModules: false,
    dir: path.join(cwd, `dist-es/${adapterName}`),
    format: "es",
    exports: "named",
    sourcemapPathTransform: transformSourceMap,
  });

  await bundle.close();
}

console.log(`Built ${packageName} into ${cwd}`);
