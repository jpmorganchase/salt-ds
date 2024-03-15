import esbuild from "esbuild";
import path from "node:path";
import { deleteSync } from "del";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildFolder = path.join(__dirname, "../../../dist/salt-ds-theme");

deleteSync([buildFolder], { force: true });

esbuild
  .build({
    absWorkingDir: path.resolve(__dirname, ".."),
    entryPoints: [
      "index.css",
      "css/theme.css",
      "css/global.css",
      "css/theme-next.css",
      "json/theme.mjs",
      // "json/theme.json",
    ],
    assetNames: "[dir]/[name]",
    outdir: buildFolder,
    loader: {
      ".ttf": "file",
    },
    write: true,
    bundle: true,
    logLevel: "info",
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
            path.resolve(__dirname, "../package.json")
          )} copied to ${path.relative(
            process.cwd(),
            path.join(buildFolder, "package.json")
          )}`
        );
      }
    );
  });
