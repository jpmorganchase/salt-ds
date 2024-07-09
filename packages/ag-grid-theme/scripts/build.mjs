import fs from "node:fs";
import path from "node:path";
import { argv } from "node:process";
import { fileURLToPath } from "node:url";
import { deleteSync } from "del";
import esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildFolder = path.join(__dirname, "../../../dist/salt-ds-ag-grid-theme");

deleteSync([buildFolder], { force: true });

esbuild
  .build({
    absWorkingDir: path.resolve(__dirname, ".."),
    entryPoints: ["salt-ag-theme.css"],
    assetNames: "[dir]/[name]",
    outdir: buildFolder,
    loader: {
      ".woff": "file",
    },
    write: true,
    bundle: true,
    logLevel: "info",
    watch: argv.includes("--watch"),
  })
  .then(() => {
    // File destination.txt will be created or overwritten by default.
    fs.copyFile(
      path.resolve(__dirname, "../package.json"),
      path.join(buildFolder, "package.json"),
      (err) => {
        if (err) throw err;
        console.log(
          `${path.relative(
            process.cwd(),
            path.resolve(__dirname, "../package.json"),
          )} copied to ${path.relative(
            process.cwd(),
            path.join(buildFolder, "package.json"),
          )}`,
        );
      },
    );
  });
