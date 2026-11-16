import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import glob from "fast-glob";

const rootDir = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const packages = {
  core: { filename: "salt-core.css" },
  lab: { filename: "salt-lab.css" },
  "date-components": { filename: "salt-date-components.css" },
  "embla-carousel": { filename: "salt-embla-carousel.css" },
  icons: {
    filename: "salt-icon.css",
    source: "src/icon/Icon.css",
    docs: false,
  },
  countries: {
    filename: "salt-countries.css",
    source: "src/country-symbol/CountrySymbol.css",
  },
};

export async function copyCss(source, destination, docsDirectory) {
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  if (docsDirectory) {
    await mkdir(docsDirectory, { recursive: true });
    await copyFile(
      source,
      path.join(docsDirectory, path.basename(destination)),
    );
  }
}

export async function bundleCss({ cwd, filename, docsDirectory }) {
  const packageDir = path.resolve(cwd);
  const buildFolder = path.join(packageDir, "css");
  // Retain the existing glob order: stylesheet order can affect the cascade.
  const cssFiles = glob.sync(["src/**/*.css"], { cwd: packageDir });
  const contents = cssFiles
    .map(
      (file) => `@import ${JSON.stringify(path.posix.relative("src", file))};`,
    )
    .join("\n");

  await rm(buildFolder, { recursive: true, force: true });
  await esbuild.build({
    absWorkingDir: packageDir,
    stdin: {
      contents,
      loader: "css",
      resolveDir: path.join(packageDir, "src"),
      sourcefile: "salt-css-entry.css",
    },
    outfile: path.join(buildFolder, filename),
    loader: { ".ttf": "file" },
    write: true,
    bundle: true,
    logLevel: "info",
  });

  if (docsDirectory) {
    await mkdir(docsDirectory, { recursive: true });
    await copyFile(
      path.join(buildFolder, filename),
      path.join(docsDirectory, filename),
    );
  }
}

export async function buildCssPackages(
  names = Object.keys(packages),
  { repositoryDirectory = rootDir } = {},
) {
  // Jobs read independent sources and write distinct outputs. Keeping them in
  // one process also shares esbuild's service instead of restarting it per job.
  const results = await Promise.allSettled(
    names.map(async (name) => {
      const config = packages[name];
      if (!config) throw new Error(`Unknown CSS package: ${name}`);
      const cwd = path.join(repositoryDirectory, "packages", name);
      const docsDirectory =
        config.docs === false
          ? undefined
          : path.join(repositoryDirectory, "docs", "css");
      if (config.source) {
        await copyCss(
          path.join(cwd, config.source),
          path.join(cwd, "css", config.filename),
          docsDirectory,
        );
      } else {
        await bundleCss({ cwd, filename: config.filename, docsDirectory });
      }
    }),
  );
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (failures.length > 0) {
    throw new AggregateError(failures, "Could not build CSS packages");
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const names = process.argv.slice(2);
  await buildCssPackages(names.length > 0 ? names : undefined);
}
