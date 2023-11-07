import esbuild from "esbuild";
import path from "node:path";
import fs from "node:fs";
import { deleteSync } from "del";
import { fileURLToPath } from "node:url";
import glob from "fast-glob";

const args = process.argv.slice(2);
const createEntryFile = args[0] === "--create-entry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildFolder = path.join(__dirname, "../../../dist/salt-ds-lab/css");
const absWorkingDir = path.resolve(__dirname, "..");
const entryFile = "src/salt-lab.css";

/** MAIN */
deleteSync([buildFolder], { force: true });
createCssEntryFile(createEntryFile);
runBuild();

function createCssEntryFile(shouldCreate) {
  if (shouldCreate) {
    deleteSync([entryFile], { force: true });
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

    entry.end();
  }
}

function runBuild() {
  esbuild.build({
    absWorkingDir,
    entryPoints: [entryFile],
    outdir: buildFolder,
    loader: {
      ".ttf": "file",
    },
    write: true,
    bundle: true,
    logLevel: "info",
  });
}
