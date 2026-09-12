import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { compareSemver } from "./compareSemver.mjs";

const execFile = promisify(execFileCallback);
const releaseTagPattern = /^(@salt-ds\/[a-z0-9-]+)@(.+)$/;
const npmRegistry = "https://registry.npmjs.org/";

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

  const required = ["--artifact", "--release-tag", "--commit", "--npm-tag"];
  for (const name of required) {
    if (!args.has(name)) {
      throw new Error(`Missing required argument: ${name}`);
    }
  }

  return Object.fromEntries(
    required.map((name) => [name.slice(2), args.get(name)]),
  );
}

async function sha256(filePath) {
  const hash = createHash("sha256");
  hash.update(await readFile(filePath));
  return `sha256-${hash.digest("base64")}`;
}

async function isPublished(name, version) {
  try {
    const { stdout } = await execFile(
      "npm",
      [
        "view",
        `${name}@${version}`,
        "version",
        "--json",
        "--registry",
        npmRegistry,
      ],
      { maxBuffer: 20 * 1024 * 1024 },
    );
    return JSON.parse(stdout) === version;
  } catch (error) {
    if (error.stderr?.includes("E404")) {
      return false;
    }

    throw error;
  }
}

async function getLatestVersion(name) {
  try {
    const { stdout } = await execFile(
      "npm",
      ["view", name, "dist-tags.latest", "--json", "--registry", npmRegistry],
      { maxBuffer: 20 * 1024 * 1024 },
    );
    const output = stdout.trim();
    if (output === "") {
      return null;
    }

    const result = JSON.parse(output);

    if (typeof result !== "string") {
      throw new Error(`npm did not report a latest version for ${name}`);
    }

    return result;
  } catch (error) {
    if (error.stderr?.includes("E404")) {
      return null;
    }

    throw error;
  }
}

function assertNpmVersion(version) {
  const [major, minor, patch] = version.split(".").map(Number);

  if (
    major < 11 ||
    (major === 11 && (minor < 5 || (minor === 5 && patch < 1)))
  ) {
    throw new Error(
      `npm ${version} does not support trusted publishing; npm 11.5.1 or newer is required`,
    );
  }
}

const args = readArguments();
const artifactDir = path.resolve(args.artifact);
const manifest = JSON.parse(
  await readFile(path.join(artifactDir, "manifest.json"), "utf8"),
);
const releaseMatch = args["release-tag"].match(releaseTagPattern);

if (!releaseMatch) {
  throw new Error("Release tag must match @salt-ds/<library>@<version>");
}

if (
  manifest.version !== 1 ||
  manifest.releaseTag !== args["release-tag"] ||
  manifest.commit !== args.commit ||
  manifest.npmTag !== args["npm-tag"]
) {
  throw new Error("Publish artifact metadata does not match this workflow run");
}

if (args["npm-tag"] !== "latest") {
  throw new Error("Version publishing requires the latest npm tag");
}

const pkg = manifest.package;
if (
  !pkg ||
  typeof pkg.name !== "string" ||
  typeof pkg.version !== "string" ||
  typeof pkg.tarball !== "string" ||
  typeof pkg.integrity !== "string"
) {
  throw new Error("Publish artifact contains invalid package metadata");
}

const [, packageName, packageVersion] = releaseMatch;
if (pkg.name !== packageName || pkg.version !== packageVersion) {
  throw new Error(
    `Artifact contains ${pkg.name}@${pkg.version}, expected ${args["release-tag"]}`,
  );
}

const tarballPath = path.resolve(artifactDir, pkg.tarball);
const relativeTarballPath = path.relative(artifactDir, tarballPath);
if (
  relativeTarballPath === ".." ||
  relativeTarballPath.startsWith(`..${path.sep}`)
) {
  throw new Error("Backfill tarball resolves outside the artifact directory");
}

if ((await sha256(tarballPath)) !== pkg.integrity) {
  throw new Error(`Integrity check failed for ${pkg.name}@${pkg.version}`);
}

const { stdout: packedManifestJson } = await execFile(
  "tar",
  ["-xOf", tarballPath, "package/package.json"],
  { maxBuffer: 20 * 1024 * 1024 },
);
const packedManifest = JSON.parse(packedManifestJson);
if (
  packedManifest.name !== pkg.name ||
  packedManifest.version !== pkg.version
) {
  throw new Error(
    `Tarball contains ${packedManifest.name}@${packedManifest.version}, expected ${pkg.name}@${pkg.version}`,
  );
}

const publishConfigKeys = Object.keys(packedManifest.publishConfig ?? {});
if (
  publishConfigKeys.some((key) => {
    const normalizedKey = key.toLowerCase();
    return normalizedKey === "registry" || normalizedKey.endsWith(":registry");
  })
) {
  throw new Error(
    `Tarball for ${pkg.name}@${pkg.version} contains a registry override`,
  );
}

if (await isPublished(pkg.name, pkg.version)) {
  console.log(
    `${pkg.name}@${pkg.version} is already published; nothing to do.`,
  );
  process.exit(0);
}

const latestVersion = await getLatestVersion(pkg.name);
if (latestVersion !== null && compareSemver(pkg.version, latestVersion) <= 0) {
  throw new Error(
    `${pkg.name}@${pkg.version} must be newer than npm latest ${latestVersion}; publish missing versions in order`,
  );
}

const { stdout: npmVersion } = await execFile("npm", ["--version"]);
assertNpmVersion(npmVersion.trim());

// Inherit the workflow's GITHUB_REF and GITHUB_SHA: npm verifies provenance
// against the signing certificate's source identity, which overrides cannot change.
await execFile(
  "npm",
  [
    "publish",
    tarballPath,
    "--tag",
    args["npm-tag"],
    "--registry",
    npmRegistry,
    "--access",
    "public",
    "--provenance",
    "--ignore-scripts",
  ],
  {
    maxBuffer: 20 * 1024 * 1024,
  },
);

if (!(await isPublished(pkg.name, pkg.version))) {
  throw new Error(
    `npm did not report ${pkg.name}@${pkg.version} after publishing`,
  );
}

const publishedLatestVersion = await getLatestVersion(pkg.name);
if (publishedLatestVersion !== pkg.version) {
  throw new Error(
    `npm latest is ${publishedLatestVersion}, expected ${pkg.version} after publishing`,
  );
}

const result = `Published ${pkg.name}@${pkg.version} as npm latest.`;
console.log(result);

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    `## Publish version\n\n${result}\n\nSource: \`${manifest.releaseTag}\` (\`${manifest.commit}\`)\n`,
  );
}
