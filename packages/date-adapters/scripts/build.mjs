import * as fs from "node:fs/promises";
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
const repoRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../../..",
);

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

const packageJson = (
  await import(url.pathToFileURL(path.join(cwd, "package.json")), {
    with: { type: "json" },
  })
).default;
const { saltSourceEntrypoints } = packageJson;
const packageName = packageJson.name;

if (
  !saltSourceEntrypoints ||
  typeof saltSourceEntrypoints !== "object" ||
  Array.isArray(saltSourceEntrypoints)
) {
  throw new Error("saltSourceEntrypoints must be an object.");
}

const runtimeDestinations = new Set();
const declarationDestinations = new Set();
const sourceEntrypoints = [];
for (const [exportPath, sourcePath] of Object.entries(
  saltSourceEntrypoints,
).sort(([left], [right]) => left.localeCompare(right))) {
  if (exportPath !== "." && !/^\.\/[a-z0-9][a-z0-9-]*$/u.test(exportPath)) {
    throw new Error(`Invalid Date Adapters export path: ${exportPath}`);
  }
  if (
    typeof sourcePath !== "string" ||
    sourcePath.includes("\\") ||
    path.posix.normalize(sourcePath) !== sourcePath ||
    path.posix.isAbsolute(sourcePath) ||
    sourcePath === ".." ||
    sourcePath.startsWith("../")
  ) {
    throw new Error(`Invalid Date Adapters source path for ${exportPath}.`);
  }
  const inputPath = path.resolve(cwd, ...sourcePath.split("/"));
  const relativeInputPath = path.relative(cwd, inputPath);
  if (
    relativeInputPath === ".." ||
    relativeInputPath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeInputPath) ||
    !(await pathExists(inputPath)) ||
    !(await fs.stat(inputPath)).isFile()
  ) {
    throw new Error(
      `Date Adapters source entrypoint is missing or escapes the package: ${sourcePath}`,
    );
  }
  const runtimeName = exportPath === "." ? "types" : exportPath.slice(2);
  const declarationName = path.posix.basename(path.posix.dirname(sourcePath));
  const runtimeDestination = `dist-es/${runtimeName}/index.js`;
  const declarationDestination = `dist-types/${declarationName}/index.d.ts`;
  if (
    runtimeDestinations.has(runtimeDestination) ||
    declarationDestinations.has(declarationDestination)
  ) {
    throw new Error(
      `Date Adapters entrypoint destinations are duplicated for ${exportPath}.`,
    );
  }
  runtimeDestinations.add(runtimeDestination);
  declarationDestinations.add(declarationDestination);
  sourceEntrypoints.push({
    exportPath,
    sourcePath,
    inputPath,
    runtimeName,
    declarationName,
  });
}

console.log(`Building ${packageName}`);

await Promise.all(
  ["dist-cjs", "dist-es", "dist-types"].map((directory) =>
    emptyDir(path.join(cwd, directory)),
  ),
);
await makeTypings(cwd, path.join(cwd, "src"));

// Package-authored source entrypoints are shared with catalog extraction.
const entryPoints = Object.fromEntries(
  sourceEntrypoints.map(({ runtimeName, inputPath }) => [
    runtimeName,
    inputPath,
  ]),
);

for (const [adapterName, inputPath] of Object.entries(entryPoints)) {
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

await Promise.all([
  fs.writeFile(
    path.join(cwd, "dist-cjs", "package.json"),
    `${JSON.stringify({ type: "commonjs" })}\n`,
  ),
  fs.writeFile(
    path.join(cwd, "dist-es", "package.json"),
    `${JSON.stringify({ type: "module" })}\n`,
  ),
]);

const publishedExports = Object.fromEntries(
  sourceEntrypoints.map(({ exportPath, runtimeName, declarationName }) => [
    exportPath,
    {
      types: `./dist-types/${declarationName}/index.d.ts`,
      import: `./dist-es/${runtimeName}/index.js`,
      require: `./dist-cjs/${runtimeName}/index.js`,
    },
  ]),
);
const rootEntrypoint = publishedExports["."];
if (!rootEntrypoint) {
  throw new Error("Date Adapters requires a root source entrypoint.");
}

const configuredExports = packageJson.publishConfig?.exports ?? {};
if (
  Object.keys(configuredExports).length !==
    Object.keys(publishedExports).length ||
  packageJson.publishConfig?.main !== rootEntrypoint.require.slice(2) ||
  packageJson.publishConfig?.module !== rootEntrypoint.import.slice(2) ||
  packageJson.typings !== rootEntrypoint.types.slice(2)
) {
  throw new Error(
    "Date Adapters package metadata does not match source entrypoints.",
  );
}
for (const [exportPath, conditions] of Object.entries(publishedExports)) {
  for (const [condition, target] of Object.entries(conditions)) {
    if (configuredExports[exportPath]?.[condition] !== target) {
      throw new Error(
        `Date Adapters ${exportPath} ${condition} export does not match its source entrypoint.`,
      );
    }
  }
}

for (const file of ["README.md", "LICENSE"]) {
  const packageDocumentPath = path.join(cwd, file);
  if (!(await pathExists(packageDocumentPath))) {
    const repositoryDocumentPath = path.join(repoRoot, file);
    if (!(await pathExists(repositoryDocumentPath))) {
      throw new Error(`Date Adapters build requires a package or root ${file}.`);
    }
    await fs.cp(repositoryDocumentPath, packageDocumentPath, { recursive: true });
  }
}

console.log(`Built ${packageName} into ${cwd}`);
