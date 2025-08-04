import path from "node:path";
import { argv } from "node:process";
import url from "node:url";
import { deleteSync } from "del";
import esbuild from "esbuild";
import fs from "fs-extra";

const FILES_TO_COPY = ["README.md", "LICENSE", "CHANGELOG.md", "package.json"];

const cwd = process.cwd();
const packageJson = (
  await import(url.pathToFileURL(path.join(cwd, "package.json")), {
    with: { type: "json" },
  })
).default;
const buildFolder = packageJson.publishConfig.directory;
const packageName = packageJson.name;

console.log(`Building ${packageName}`);

deleteSync([buildFolder], { force: true });

const context = await esbuild.context({
  absWorkingDir: cwd,
  entryPoints: [
    "index.css",
    "css/commercial/index.css",
    "css/consumer/index.css",
    "css/legacy/index.css",
  ],
  assetNames: "[dir]/[name]",
  outdir: buildFolder,
  loader: {
    ".ttf": "file",
  },
  write: true,
  bundle: true,
  logLevel: "info",
});

if (argv.includes("--watch")) {
  await context.watch();
} else {
  await context.rebuild();
  await context.dispose();
}

for (const file of FILES_TO_COPY) {
  const from = path.join(cwd, file);
  const to = path.join(buildFolder, file);
  try {
    await fs.copyFile(from, to);
    console.log(
      `${path.relative(process.cwd(), from)} copied to ${path.relative(
        process.cwd(),
        to,
      )}`,
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

console.log(`Built ${packageName} into ${buildFolder}`);
