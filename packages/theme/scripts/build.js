const esbuild = require("esbuild");
const path = require("path");
const del = require("del");
const fs = require("fs");

const buildFolder = path.join(__dirname, "../../../dist/jpmorganchase-theme/");

del.sync([buildFolder], { force: true });

esbuild
  .build({
    absWorkingDir: path.resolve(__dirname, ".."),
    entryPoints: ["index.css", "global.css"],
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
