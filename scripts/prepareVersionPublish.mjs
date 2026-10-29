import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  readdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const releaseTagPattern = /^(@salt-ds\/[a-z0-9-]+)@(.+)$/;

function readArguments() {
  const args = new Map();

  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];

    if (!name?.startsWith("--") || value == null) {
      throw new Error(`Invalid argument: ${name ?? "<missing>"}`);
    }

    args.set(name, value);
  }

  const required = ["--source", "--output", "--release-tag", "--commit"];
  for (const name of required) {
    if (!args.has(name)) {
      throw new Error(`Missing required argument: ${name}`);
    }
  }

  return Object.fromEntries(
    required.map((name) => [name.slice(2), args.get(name)]),
  );
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function discoverPackages(rootDir) {
  const packagesDir = path.join(rootDir, "packages");
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const packages = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const directory = path.join(packagesDir, entry.name);
    const manifestPath = path.join(directory, "package.json");

    try {
      await access(manifestPath);
    } catch {
      continue;
    }

    packages.push({
      directory,
      manifest: await readJson(manifestPath),
    });
  }

  return packages;
}

function normalizedTarballName(name, version) {
  return `${name.replace(/^@/, "").replace("/", "-")}-${version}.tgz`;
}

function containsWorkspaceRange(value) {
  if (typeof value === "string") {
    return value.startsWith("workspace:");
  }

  if (Array.isArray(value)) {
    return value.some(containsWorkspaceRange);
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(containsWorkspaceRange);
  }

  return false;
}

async function sha256(filePath) {
  const hash = createHash("sha256");
  hash.update(await readFile(filePath));
  return `sha256-${hash.digest("base64")}`;
}

async function packPackage(pkg, outputDir) {
  const { directory, manifest } = pkg;
  const filename = normalizedTarballName(manifest.name, manifest.version);
  const tarballPath = path.join(outputDir, filename);
  const publishDirectory = manifest.publishConfig?.directory;

  if (publishDirectory) {
    const packDirectory = path.resolve(directory, publishDirectory);
    const relativePackDirectory = path.relative(sourceDir, packDirectory);

    if (
      relativePackDirectory === ".." ||
      relativePackDirectory.startsWith(`..${path.sep}`)
    ) {
      throw new Error(
        `${manifest.name} publish directory resolves outside the release source`,
      );
    }

    await access(path.join(packDirectory, "package.json"));
    const { stdout } = await execFile(
      "npm",
      [
        "pack",
        packDirectory,
        "--json",
        "--ignore-scripts",
        "--pack-destination",
        outputDir,
      ],
      {
        cwd: sourceDir,
        maxBuffer: 20 * 1024 * 1024,
      },
    );
    const [result] = JSON.parse(stdout);

    if (!result?.filename) {
      throw new Error(`npm did not report a tarball for ${manifest.name}`);
    }

    const packedPath = path.join(outputDir, result.filename);
    if (packedPath !== tarballPath) {
      await rename(packedPath, tarballPath);
    }
  } else {
    await execFile("yarn", ["pack", "--out", tarballPath], {
      cwd: directory,
      maxBuffer: 20 * 1024 * 1024,
    });
  }

  const { stdout: packedManifestJson } = await execFile(
    "tar",
    ["-xOf", tarballPath, "package/package.json"],
    { maxBuffer: 20 * 1024 * 1024 },
  );
  const packedManifest = JSON.parse(packedManifestJson);

  if (
    packedManifest.name !== manifest.name ||
    packedManifest.version !== manifest.version
  ) {
    throw new Error(
      `Packed ${packedManifest.name}@${packedManifest.version}, expected ${manifest.name}@${manifest.version}`,
    );
  }

  if (containsWorkspaceRange(packedManifest)) {
    throw new Error(
      `Packed manifest for ${manifest.name}@${manifest.version} contains a workspace dependency`,
    );
  }

  return {
    name: manifest.name,
    version: manifest.version,
    tarball: `packages/${filename}`,
    integrity: await sha256(tarballPath),
  };
}

const args = readArguments();
const sourceDir = path.resolve(args.source);
const artifactDir = path.resolve(args.output);
const packagesOutputDir = path.join(artifactDir, "packages");
const releaseMatch = args["release-tag"].match(releaseTagPattern);

if (!releaseMatch) {
  throw new Error("Release tag must match @salt-ds/<library>@<version>");
}

const [, packageName, packageVersion] = releaseMatch;
const historicalPackages = await discoverPackages(sourceDir);
const releasePackage = historicalPackages.find(
  ({ manifest }) =>
    manifest.name === packageName && manifest.version === packageVersion,
);

if (!releasePackage) {
  throw new Error(
    `${args["release-tag"]} does not match a package manifest at the tagged commit`,
  );
}

if (releasePackage.manifest.private === true) {
  throw new Error(`${args["release-tag"]} refers to a private package`);
}

await mkdir(packagesOutputDir, { recursive: true });
if ((await readdir(packagesOutputDir)).length !== 0) {
  throw new Error(
    `Publish output directory is not empty: ${packagesOutputDir}`,
  );
}

const packedPackage = await packPackage(releasePackage, packagesOutputDir);
const publishManifest = {
  version: 1,
  releaseTag: args["release-tag"],
  commit: args.commit,
  npmTag: "latest",
  package: packedPackage,
};

await writeFile(
  path.join(artifactDir, "manifest.json"),
  `${JSON.stringify(publishManifest, undefined, 2)}\n`,
);

console.log(
  `Packed ${packedPackage.name}@${packedPackage.version} from ${args.commit}.`,
);
