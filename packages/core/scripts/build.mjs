import esbuild from "esbuild";
import path from "node:path";
import { deleteSync } from "del";
import { fileURLToPath } from "node:url";
import glob from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildFolder = path.join(__dirname, "../../../dist/salt-ds-core/css");

deleteSync([buildFolder], { force: true });

esbuild.build({
  absWorkingDir: path.resolve(__dirname, ".."),
  entryPoints: glob.sync(["src/**/*.css"]),
  assetNames: "[dir]/[name]",
  outdir: buildFolder,
  loader: {
    ".ttf": "file",
  },
  write: true,
  bundle: true,
  logLevel: "info",
});
