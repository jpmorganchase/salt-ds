import path from "node:path";
import url from "node:url";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import browserslistToEsbuild from "browserslist-to-esbuild";
import fs from "fs-extra";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { makeTypings } from "./../../../scripts/makeTypings.mjs";
import { transformWorkspaceDeps } from "./../../../scripts/transformWorkspaceDeps.mjs";
import { distinct } from "./../../../scripts/utils.mjs";

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
  await makeTypings(outputDir, path.dirname(inputPath));

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
    dir: path.join(outputDir, `dist-cjs/${adapterName}`),
    format: "cjs",
    exports: "named",
    sourcemapPathTransform: transformSourceMap,
  });

  await bundle.write({
    freeze: false,
    sourcemap: true,
    preserveModules: false,
    dir: path.join(outputDir, `dist-es/${adapterName}`),
    format: "es",
    exports: "named",
    sourcemapPathTransform: transformSourceMap,
  });

  await bundle.close();
}

await fs.writeJSON(
  path.join(outputDir, "package.json"),
  {
    ...packageJson,
    dependencies: await transformWorkspaceDeps(packageJson.dependencies),
    main: "dist-cjs/types/index.js",
    module: "dist-es/types/index.js",
    typings: "dist-types/types/index.d.ts",
    exports: {
      ".": {
        types: "./dist-types/types/index.d.ts",
        import: "./dist-es/types/index.js",
        require: "./dist-cjs/types/index.js",
      },
      "./date-fns": {
        types: "./dist-types/date-fns-adapter/index.d.ts",
        import: "./dist-es/date-fns/index.js",
        require: "./dist-cjs/date-fns/index.js",
      },
      "./date-fns-tz": {
        types: "./dist-types/date-fns-tz-adapter/index.d.ts",
        import: "./dist-es/date-fns-tz/index.js",
        require: "./dist-cjs/date-fns-tz/index.js",
      },
      "./dayjs": {
        types: "./dist-types/dayjs-adapter/index.d.ts",
        import: "./dist-es/dayjs/index.js",
        require: "./dist-cjs/dayjs/index.js",
      },
      "./luxon": {
        types: "./dist-types/luxon-adapter/index.d.ts",
        import: "./dist-es/luxon/index.js",
        require: "./dist-cjs/luxon/index.js",
      },
      "./moment": {
        types: "./dist-types/moment-adapter/index.d.ts",
        import: "./dist-es/moment/index.js",
        require: "./dist-cjs/moment/index.js",
      },
    },
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
