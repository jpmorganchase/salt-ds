import esbuild from "esbuild";
import path, { dirname } from "node:path";
import fs from "node:fs";
import { deleteSync } from "del";
import { fileURLToPath } from "node:url";
import glob from "fast-glob";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildFolder = path.join(__dirname, "../../../dist/salt-ds-core/css");
const absWorkingDir = path.resolve(__dirname, "..");
const outfileName = "salt-core.css";
const entryFile = `src/${crypto.randomUUID()}.css`;

/** MAIN */
deleteSync([buildFolder], { force: true });
createCssEntryFile(runBuild);

function createCssEntryFile(callback) {
  const cssFiles = glob.sync(["src/**/*.css"]);
  console.log(`Merging ${cssFiles.length} into entry file ${entryFile}`);

  const entry = fs.createWriteStream(entryFile, {
    flags: "as", // preserve existing file data and create if doesn't exist
  });

  const writeLine = (line, index) =>
    index == 0 ? entry.write(line) : entry.write(`\n${line}`);

  cssFiles.forEach((cssFile, index) => {
    writeLine(
      `@import "${path.relative(path.dirname(entryFile), cssFile)}";`,
      index
    );
  });

  entry.close(() => {
    console.log("closed filestream");
    callback();
  });
}

function runBuild() {
  esbuild
    .build({
      absWorkingDir,
      entryPoints: [entryFile],
      outfile: path.join(buildFolder, outfileName),
      loader: {
        ".ttf": "file",
      },
      write: true,
      bundle: true,
      logLevel: "info",
    })
    .then(() => {
      // copy built file to storybook dir
      const cssFolder = path.join(__dirname, "../../../docs/css");
      fs.mkdirSync(cssFolder, { recursive: true });
      fs.copyFileSync(
        path.join(buildFolder, outfileName),
        path.join(cssFolder, outfileName)
      );

      //delete generated entry file
      deleteSync([entryFile], { force: true });
    });
}
