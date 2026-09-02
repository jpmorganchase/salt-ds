import path from "node:path";
import { argv } from "node:process";
import url from "node:url";
import { deleteSync } from "del";
import esbuild from "esbuild";

const cwd = process.cwd();
const packageJson = (
  await import(url.pathToFileURL(path.join(cwd, "package.json")), {
    with: { type: "json" },
  })
).default;
const packageName = packageJson.name;

console.log(`Building ${packageName}`);

if (!argv.includes("--watch")) {
  deleteSync([path.join(cwd, "salt-ag-theme.css"), path.join(cwd, "fonts")], {
    force: true,
  });
}

const context = await esbuild.context({
  absWorkingDir: path.join(cwd, "src"),
  entryPoints: ["salt-ag-theme.css"],
  assetNames: "[dir]/[name]",
  outdir: cwd,
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

console.log(`Built ${packageName} into ${cwd}`);
