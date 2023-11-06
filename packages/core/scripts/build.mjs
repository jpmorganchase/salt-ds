import esbuild from "esbuild";
import path from "node:path";
import fs from "node:fs";
import { deleteSync } from "del";
import { fileURLToPath } from "node:url";
import glob from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildFolder = path.join(__dirname, "../../../dist/salt-ds-core/css");
const absWorkingDir = path.resolve(__dirname, "..");
const entryFile = "src/salt-core.css";

/** MAIN */
deleteSync([buildFolder], { force: true });
createCssEntryFile();
runBuild();

function createCssEntryFile() {
  const cssFiles = glob.sync(["src/**/*.css"]);
  console.log(`Merging ${cssFiles.length} into entry file...`);

  const entry = fs.createWriteStream(entryFile, {
    flags: "a", // preserve existing file data
  });

  const writeLine = (line, index) =>
    index == 0 ? entry.write(line) : entry.write(`\n${line}`);

  cssFiles.forEach((cssFile, index) => {
    writeLine(
      `@import "${path.resolve(path.relative(absWorkingDir, cssFile))}";`,
      index
    );
  });

  entry.end();
}

function runBuild() {
  esbuild
    .build({
      absWorkingDir,
      entryPoints: [entryFile],
      outdir: buildFolder,
      loader: {
        ".ttf": "file",
      },
      write: true,
      bundle: true,
      logLevel: "info",
    })
    .then(() => {
      deleteSync(entryFile, { force: true });
    });
}
