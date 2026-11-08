import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("../../", import.meta.url));
const [directory, sourceCommit] = process.argv.slice(2);

if (!directory || (sourceCommit && !/^[a-f0-9]{40}$/.test(sourceCommit))) {
  throw new Error(
    "Usage: node site/scripts/use-local-mosaic.mjs <tarball-directory> [full-source-commit-sha]",
  );
}

const packageDir = path.resolve(directory);
const rootManifestPath = path.join(rootDir, "package.json");
const siteManifestPath = path.join(rootDir, "site/package.json");
const rootManifest = JSON.parse(fs.readFileSync(rootManifestPath, "utf8"));
const siteManifest = JSON.parse(fs.readFileSync(siteManifestPath, "utf8"));
const mosaicPackages = new Map();

for (const entry of fs.readdirSync(packageDir).sort()) {
  if (!/\.(tgz|tar\.gz)$/.test(entry)) continue;
  const archivePath = path.join(packageDir, entry);
  // Read only the package manifest; do not extract archive paths into the repo.
  const manifest = JSON.parse(
    execFileSync("tar", ["-xOf", archivePath, "package/package.json"], {
      encoding: "utf8",
    }),
  );
  if (!manifest.name?.startsWith("@jpmorganchase/mosaic-")) continue;
  if (mosaicPackages.has(manifest.name)) {
    throw new Error(`More than one tarball found for ${manifest.name}`);
  }
  mosaicPackages.set(manifest.name, {
    name: manifest.name,
    version: manifest.version,
    archive: path.relative(rootDir, archivePath).split(path.sep).join("/"),
    sha256: createHash("sha256")
      .update(fs.readFileSync(archivePath))
      .digest("hex"),
  });
}

const versions = new Set(
  [...mosaicPackages.values()].map((pkg) => pkg.version),
);
if (versions.size !== 1) {
  throw new Error(
    "Expected one complete Mosaic snapshot version in the directory",
  );
}
const [snapshotVersion] = versions;

for (const name of Object.keys(siteManifest.dependencies)) {
  if (!name.startsWith("@jpmorganchase/mosaic-")) continue;
  if (!mosaicPackages.has(name)) {
    throw new Error(`Missing required Mosaic tarball: ${name}`);
  }
  siteManifest.dependencies[name] = snapshotVersion;
}

// Override transitive Mosaic dependencies too, so the consumer never mixes
// files from this candidate with packages from a previous registry release.
rootManifest.resolutions ??= {};
for (const pkg of mosaicPackages.values()) {
  rootManifest.resolutions[pkg.name] = `file:${pkg.archive}`;
}

const writeJson = (filename, data) =>
  fs.writeFileSync(filename, `${JSON.stringify(data, null, 2)}\n`);
writeJson(rootManifestPath, rootManifest);
writeJson(siteManifestPath, siteManifest);
writeJson(path.join(rootDir, "site/mosaic-snapshot-manifest.json"), {
  snapshotVersion,
  sourceCommit: sourceCommit ?? null,
  packages: [...mosaicPackages.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  ),
});

console.log(
  `Selected ${mosaicPackages.size} packed Mosaic packages at ${snapshotVersion}.`,
);
console.log(
  "Run yarn install, then the snapshot, typecheck and build commands in site/README.md.",
);
