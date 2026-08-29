import { execFile as execFileCallback } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const packagesDir = path.join(rootDir, "packages");
const yarn = process.platform === "win32" ? "yarn.cmd" : "yarn";
const dependencyFields = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];

async function run(command, args) {
  return execFile(command, args, {
    cwd: rootDir,
    maxBuffer: 20 * 1024 * 1024,
  });
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function discoverPackages() {
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const packages = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const directory = path.join(packagesDir, entry.name);
        const manifest = await readJson(path.join(directory, "package.json"));
        return { directory, manifest };
      }),
  );

  return packages.filter(({ manifest }) => manifest.private !== true);
}

function checkBoundaries(manifest) {
  const dependencies = new Set(
    dependencyFields.flatMap((field) => Object.keys(manifest[field] ?? {})),
  );
  const violations = (manifest.forbiddenDependencies ?? []).filter((name) =>
    dependencies.has(name),
  );

  return violations.length === 0
    ? []
    : [`cannot depend on ${violations.join(", ")}`];
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function packagePath(directory, target) {
  return path.join(directory, target.replace(/^\.?\//, ""));
}

async function checkCssPackage(pkg) {
  const { directory, manifest } = pkg;
  const targets = new Set([manifest.style, ...(manifest.files ?? [])]);
  const errors = [];

  for (const target of targets) {
    if (
      typeof target !== "string" ||
      !(await pathExists(packagePath(directory, target)))
    ) {
      errors.push(`missing output ${target}`);
    }
  }

  return errors;
}

function findWorkspaceRanges(value, field = "package.json") {
  if (typeof value === "string") {
    return value.startsWith("workspace:") ? [field] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findWorkspaceRanges(item, `${field}[${index}]`),
    );
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      findWorkspaceRanges(item, `${field}.${key}`),
    );
  }
  return [];
}

async function checkJavaScriptPackage(pkg, temporaryDirectory) {
  const { manifest } = pkg;
  const archiveName = `${manifest.name
    .replace(/^@/, "")
    .replaceAll("/", "-")}.tgz`;
  const archivePath = path.join(temporaryDirectory, archiveName);
  const extractedDirectory = path.join(
    temporaryDirectory,
    archiveName.replace(/\.tgz$/, ""),
  );

  await run(yarn, ["workspace", manifest.name, "pack", "--out", archivePath]);
  await mkdir(extractedDirectory);
  await run("tar", ["-xzf", archivePath, "-C", extractedDirectory]);

  const packageDirectory = path.join(extractedDirectory, "package");
  const packedManifest = await readJson(
    path.join(packageDirectory, "package.json"),
  );
  const errors = [];
  const workspaceRanges = findWorkspaceRanges(packedManifest);

  if (workspaceRanges.length > 0) {
    errors.push(
      `contains unresolved workspace ranges at ${workspaceRanges.join(", ")}`,
    );
  }

  for (const field of ["main", "module", "typings"]) {
    const target = packedManifest[field];
    if (
      typeof target !== "string" ||
      path.isAbsolute(target) ||
      target.split(/[\\/]/).includes("..")
    ) {
      errors.push(`has invalid ${field} target ${target}`);
      continue;
    }

    try {
      const targetStat = await stat(packagePath(packageDirectory, target));
      if (!targetStat.isFile()) {
        errors.push(`${field} target is not a file: ${target}`);
      }
    } catch {
      errors.push(`${field} points to missing file ${target}`);
    }
  }

  for (const directory of ["src", "scripts"]) {
    if (await pathExists(path.join(packageDirectory, directory))) {
      errors.push(`contains unintended ${directory}/ files`);
    }
  }

  return errors;
}

const packages = await discoverPackages();
const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "salt-packages-"));
const errors = [];

try {
  for (const pkg of packages) {
    console.log(`Checking ${pkg.manifest.name}`);
    const packageErrors = [
      ...checkBoundaries(pkg.manifest),
      ...(pkg.manifest.main
        ? await checkJavaScriptPackage(pkg, temporaryDirectory)
        : await checkCssPackage(pkg)),
    ];

    errors.push(
      ...packageErrors.map((error) => `${pkg.manifest.name}: ${error}`),
    );
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exitCode = 1;
} else {
  console.log(`Checked ${packages.length} packages`);
}
