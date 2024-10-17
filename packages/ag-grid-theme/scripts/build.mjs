import path from "node:path";
import { argv } from "node:process";
import { deleteSync } from "del";
import esbuild from "esbuild";
import findUp from "find-up";
import fs from "fs-extra";

const FILES_TO_COPY = ["README.md", "CHANGELOG.md", "package.json"];

const cwd = process.cwd();
const packageJson = await fs.readJSON(path.join(cwd, "package.json"));
const buildFolder = packageJson.publishConfig.directory;
const packageName = packageJson.name;

console.log(`Building ${packageName}`);

deleteSync([buildFolder], { force: true });

const context = await esbuild.context({
  absWorkingDir: cwd,
  entryPoints: ["salt-ag-theme.css"],
  assetNames: "[dir]/[name]",
  outdir: buildFolder,
  loader: {
    ".woff": "file",
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

// Copy license file if it exists in the current or parent directories
const licensePath = await findUp("LICENSE", { cwd });

if (licensePath) {
  await fs.copy(licensePath, path.join(buildFolder, "LICENSE"));
}

console.log(`Built ${packageName} into ${buildFolder}`);
