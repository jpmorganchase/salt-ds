import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const dependencyFields = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];
const requiredCss = new Map([
  ["@salt-ds/icons", ["css/salt-icon.css"]],
  ["@salt-ds/countries", ["css/salt-countries.css"]],
]);
const smokePackages = [
  "@salt-ds/core",
  "@salt-ds/date-adapters",
  "@salt-ds/icons",
  "@salt-ds/countries",
  "@salt-ds/embla-carousel",
];

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function findPackageJsonFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPackageJsonFiles(entryPath));
    } else if (entry.name === "package.json") {
      results.push(entryPath);
    }
  }
  return results;
}

export function getPublishablePackages(repositoryRoot = rootDirectory) {
  const rootManifest = readJson(path.join(repositoryRoot, "package.json"));
  const roots = new Set(
    rootManifest.workspaces.map((workspace) =>
      workspace.replace(/[\\/](?:\*\*|\*).*$/, ""),
    ),
  );

  return [...roots]
    .flatMap((workspaceRoot) =>
      findPackageJsonFiles(path.join(repositoryRoot, workspaceRoot)),
    )
    .map((manifestPath) => ({
      manifestPath,
      manifest: readJson(manifestPath),
    }))
    .filter(({ manifest }) => manifest.publishConfig?.directory)
    .map(({ manifestPath, manifest }) => ({
      sourceDirectory: path.dirname(manifestPath),
      manifest,
      outputDirectory: path.resolve(
        path.dirname(manifestPath),
        manifest.publishConfig.directory,
      ),
    }))
    .sort((left, right) =>
      left.manifest.name.localeCompare(right.manifest.name),
    );
}

export function validatePublishedPackage({ outputDirectory, manifest }) {
  const errors = [];
  const builtManifestPath = path.join(outputDirectory, "package.json");
  if (!fs.existsSync(builtManifestPath)) {
    return [`${manifest.name}: missing package.json at ${builtManifestPath}`];
  }

  const builtManifest = readJson(builtManifestPath);
  for (const field of ["main", "module", "typings", "types"]) {
    if (
      builtManifest[field] &&
      !fs.existsSync(path.join(outputDirectory, builtManifest[field]))
    ) {
      errors.push(
        `${manifest.name}: ${field} points to missing ${builtManifest[field]}`,
      );
    }
  }

  for (const declaredFile of builtManifest.files ?? []) {
    const normalizedFile = declaredFile.replace(/^[\\/]+/, "");
    if (!fs.existsSync(path.join(outputDirectory, normalizedFile))) {
      errors.push(`${manifest.name}: files declares missing ${declaredFile}`);
    }
  }

  for (const field of dependencyFields) {
    for (const [name, version] of Object.entries(builtManifest[field] ?? {})) {
      if (typeof version === "string" && version.startsWith("workspace:")) {
        errors.push(
          `${manifest.name}: unresolved ${field} range for ${name}: ${version}`,
        );
      }
    }
  }

  for (const cssFile of requiredCss.get(manifest.name) ?? []) {
    if (!fs.existsSync(path.join(outputDirectory, cssFile))) {
      errors.push(`${manifest.name}: missing required CSS ${cssFile}`);
    }
  }

  return errors;
}

function runConsumerSmoke(packages) {
  const packageByName = new Map(
    packages.map((packageInfo) => [packageInfo.manifest.name, packageInfo]),
  );
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "salt-published-consumer-"),
  );

  try {
    const consumerNodeModules = path.join(temporaryDirectory, "node_modules");
    const repositoryNodeModules = path.join(rootDirectory, "node_modules");
    fs.mkdirSync(consumerNodeModules, { recursive: true });
    for (const entry of fs.readdirSync(repositoryNodeModules, {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory() || entry.name === ".bin") {
        continue;
      }
      if (entry.name.startsWith("@")) {
        if (entry.name === "@salt-ds") {
          continue;
        }
        const targetScope = path.join(consumerNodeModules, entry.name);
        fs.mkdirSync(targetScope, { recursive: true });
        for (const scopedPackage of fs.readdirSync(
          path.join(repositoryNodeModules, entry.name),
          { withFileTypes: true },
        )) {
          if (scopedPackage.isDirectory()) {
            fs.symlinkSync(
              path.join(repositoryNodeModules, entry.name, scopedPackage.name),
              path.join(targetScope, scopedPackage.name),
              "junction",
            );
          }
        }
      } else {
        fs.symlinkSync(
          path.join(repositoryNodeModules, entry.name),
          path.join(consumerNodeModules, entry.name),
          "junction",
        );
      }
    }

    for (const packageInfo of packages) {
      const packageDirectory = path.join(
        consumerNodeModules,
        ...packageInfo.manifest.name.split("/"),
      );
      fs.mkdirSync(path.dirname(packageDirectory), { recursive: true });
      fs.cpSync(packageInfo.outputDirectory, packageDirectory, {
        recursive: true,
      });
    }

    const entries = smokePackages.map((packageName) => {
      const packageInfo = packageByName.get(packageName);
      if (!packageInfo) {
        throw new Error(
          `Consumer smoke package is not publishable: ${packageName}`,
        );
      }
      const builtManifest = readJson(
        path.join(packageInfo.outputDirectory, "package.json"),
      );
      return {
        packageName,
        esm: path.join(
          consumerNodeModules,
          ...packageName.split("/"),
          builtManifest.module,
        ),
      };
    });

    const cjsScript = entries
      .map(({ packageName }) => `require(${JSON.stringify(packageName)});`)
      .join("\n");
    const esmScript = entries
      .map(
        ({ esm }) =>
          `await import(${JSON.stringify(pathToFileURL(esm).href)});`,
      )
      .join("\n");
    const scripts = [
      ["consumer.cjs", cjsScript],
      ["consumer.mjs", esmScript],
    ];

    for (const [filename, contents] of scripts) {
      const scriptPath = path.join(temporaryDirectory, filename);
      fs.writeFileSync(scriptPath, contents);
      const result = spawnSync(process.execPath, [scriptPath], {
        cwd: temporaryDirectory,
        encoding: "utf8",
        env: {
          ...process.env,
          NODE_OPTIONS: "",
        },
      });
      if (result.error || result.status !== 0) {
        throw new Error(
          `${filename} failed to consume built artifacts:\n${
            result.error?.stack || result.stderr || result.stdout
          }`,
        );
      }
    }
  } finally {
    fs.rmSync(temporaryDirectory, { force: true, recursive: true });
  }
}

export function checkPublishedArtifacts(repositoryRoot = rootDirectory) {
  const packages = getPublishablePackages(repositoryRoot);
  if (packages.length === 0) {
    throw new Error("No publishable workspaces were discovered");
  }

  const errors = packages.flatMap(validatePublishedPackage);
  if (errors.length > 0) {
    throw new Error(
      `Published artifact validation failed:\n- ${errors.join("\n- ")}`,
    );
  }

  runConsumerSmoke(packages);
  return packages.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const packageCount = checkPublishedArtifacts();
  console.log(`Validated ${packageCount} published package artifacts.`);
}
