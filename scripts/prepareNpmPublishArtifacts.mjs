import childProcess from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outDir = path.resolve(args.get("--out") ?? "npm-publish-artifacts");
const publishTag = args.get("--tag") ?? "latest";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const run = (command, commandArgs, options = {}) =>
  new Promise((resolve, reject) => {
    const { allowFailure, ...spawnOptions } = options;
    const child = childProcess.spawn(command, commandArgs, {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
      ...spawnOptions,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0 || allowFailure) {
        resolve({ code, stdout, stderr });
      } else {
        reject(
          new Error(
            `${command} ${commandArgs.join(" ")} failed with ${code}\n${stderr}`,
          ),
        );
      }
    });
  });

const packageVersionExists = async (name, version) => {
  const result = await run(
    npmCommand,
    ["view", `${name}@${version}`, "version", "--json"],
    { allowFailure: true },
  );

  if (result.code === 0) {
    return true;
  }

  const output = `${result.stdout}\n${result.stderr}`;
  if (output.includes("E404") || output.includes("404")) {
    return false;
  }

  throw new Error(`Unable to check ${name}@${version} on npm:\n${output}`);
};

const extractChangelogEntry = async (packageDir, version) => {
  let changelog;
  try {
    changelog = await fs.readFile(
      path.join(packageDir, "CHANGELOG.md"),
      "utf8",
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      return "";
    }
    throw error;
  }

  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = changelog.match(
    new RegExp(`^##\\s+${escapedVersion}\\s*$([\\s\\S]*?)(?=^##\\s+|$)`, "m"),
  );

  return match?.[1]?.trim() ?? "";
};

const packagesDir = path.join(rootDir, "packages");
const tarballsDir = path.join(outDir, "tarballs");
const publishedPackages = [];

await fs.rm(outDir, { force: true, recursive: true });
await fs.mkdir(tarballsDir, { recursive: true });

const packageDirs = (await fs.readdir(packagesDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const packageDirName of packageDirs) {
  const packageDir = path.join(packagesDir, packageDirName);
  const packageJsonPath = path.join(packageDir, "package.json");

  let packageJson;
  try {
    packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      continue;
    }
    throw error;
  }

  const { name, private: isPrivate, publishConfig, version } = packageJson;

  if (isPrivate || !publishConfig?.directory) {
    continue;
  }

  if (!name?.startsWith("@salt-ds/")) {
    throw new Error(`Refusing to publish unexpected package name: ${name}`);
  }

  if (await packageVersionExists(name, version)) {
    console.log(`${name}@${version} already exists on npm; skipping.`);
    continue;
  }

  const publishDir = path.resolve(packageDir, publishConfig.directory);
  const publishPackageJsonPath = path.join(publishDir, "package.json");

  await fs.access(publishPackageJsonPath);

  const packResult = await run(npmCommand, [
    "pack",
    publishDir,
    "--pack-destination",
    tarballsDir,
    "--json",
  ]);
  const [packedPackage] = JSON.parse(packResult.stdout);

  publishedPackages.push({
    name,
    version,
    tag: publishTag,
    tarball: `tarballs/${path.basename(packedPackage.filename)}`,
    releaseTag: `${name}@${version}`,
    releaseBody: await extractChangelogEntry(packageDir, version),
  });
}

await fs.writeFile(
  path.join(outDir, "packages.json"),
  `${JSON.stringify(
    { packages: publishedPackages, schemaVersion: 1, tag: publishTag },
    null,
    2,
  )}\n`,
);

if (process.env.GITHUB_OUTPUT) {
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `hasPackages=${publishedPackages.length > 0}\n`,
  );
}

console.log(`Prepared ${publishedPackages.length} npm package artifact(s).`);
