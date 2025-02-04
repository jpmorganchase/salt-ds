import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deleteSync } from "del";
import esbuild from "esbuild";
import glob from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildFolder = path.join(__dirname, "../../../dist/salt-ds-style-contract/css");
const absWorkingDir = path.resolve(__dirname, "..");
const outfileName = "salt-adapter.css";
const entryFile = `src/${crypto.randomUUID()}.css`;

/** MAIN */
deleteSync([buildFolder], { force: true });

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
        path.join(cssFolder, outfileName),
      );
    })
    .finally(() => {
      //delete generated entry file
      deleteSync([entryFile], { force: true });
    });
}
