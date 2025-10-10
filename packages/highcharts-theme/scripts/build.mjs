import path from "node:path";
import { argv } from "node:process";
import { deleteSync } from "del";
import esbuild from "esbuild";
import fs from "fs-extra";
import { transformWorkspaceDeps } from "../../../scripts/transformWorkspaceDeps.mjs";

const FILES_TO_COPY = ["README.md", "LICENSE", "CHANGELOG.md"];

const cwd = process.cwd();
const packageJson = (
  await import(path.join("file://", cwd, "package.json"), {
    with: { type: "json" },
  })
).default;
const buildFolder = packageJson.publishConfig.directory;
const packageName = packageJson.name;

console.log(`Building ${packageName}`);

if (!argv.includes("--watch")) {
  deleteSync([buildFolder], { force: true });
}

const context = await esbuild.context({
  absWorkingDir: cwd,
  entryPoints: ["index.css"],
  assetNames: "[dir]/[name]",
  outdir: buildFolder,
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

await fs.writeJSON(
  path.join(buildFolder, "package.json"),
  {
    ...packageJson,
    peerDependencies: await transformWorkspaceDeps(
      packageJson.peerDependencies,
    ),
  },
  { spaces: 2 },
);

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

console.log(`Built ${packageName} into ${buildFolder}`);
