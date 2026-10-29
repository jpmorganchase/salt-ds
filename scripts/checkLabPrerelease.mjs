import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compareSemver } from "./compareSemver.mjs";

// @salt-ds/lab must only get prerelease bumps, which Changesets can't express,
// so .yarn/patches patches @changesets/assemble-release-plan. Yarn only applies
// the patch while @changesets/cli depends on the exact range in the root
// "resolutions", so a Changesets update can silently drop it, and the next lab
// release would become stable (e.g. 1.0.0-alpha.104 -> 1.0.0).
const labPackageName = "@salt-ds/lab";
const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

// Resolve from the CLI so this checks the code `changeset version` runs.
const requireFromCli = createRequire(
  createRequire(import.meta.url).resolve("@changesets/cli/package.json"),
);
const importFromCli = (specifier) =>
  import(pathToFileURL(requireFromCli.resolve(specifier)).href);

const [{ assembleReleasePlan }, { readConfig }, { getPackages }] =
  await Promise.all([
    importFromCli("@changesets/assemble-release-plan"),
    importFromCli("@changesets/config"),
    importFromCli("@manypkg/get-packages"),
  ]);

const packages = await getPackages(rootDir);
const { config, errors } = await readConfig(packages.rootDir, packages);
if (errors != null) {
  throw new Error(`Invalid Changesets config:\n${errors.join("\n")}`);
}

const results = ["patch", "minor", "major"].map((type) => {
  const { releases } = assembleReleasePlan(
    [
      {
        id: `lab-prerelease-check-${type}`,
        summary: "",
        releases: [{ name: labPackageName, type }],
      },
    ],
    packages,
    config,
    undefined,
  );
  const release = releases.find(({ name }) => name === labPackageName);
  if (!release) {
    throw new Error(`${labPackageName} is missing from the release plan`);
  }
  const { oldVersion, newVersion } = release;
  const [versionCore] = oldVersion.split("-");
  const isPrereleaseBump =
    newVersion.startsWith(`${versionCore}-`) &&
    compareSemver(newVersion, oldVersion) > 0;

  return { type, oldVersion, newVersion, isPrereleaseBump };
});

const failures = results.filter(({ isPrereleaseBump }) => !isPrereleaseBump);

if (failures.length > 0) {
  console.error(
    [
      `${labPackageName} would not stay on a prerelease version:`,
      ...failures.map(
        ({ type, oldVersion, newVersion }) =>
          `  ${type}: ${oldVersion} -> ${newVersion}`,
      ),
      "Check that the @changesets/assemble-release-plan patch in .yarn/patches is",
      'still applied, and that its "resolutions" entry in package.json matches the',
      "range @changesets/cli depends on.",
    ].join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(
    `${labPackageName} stays on prereleases: ${results
      .map(({ type, newVersion }) => `${type} -> ${newVersion}`)
      .join(", ")}`,
  );
}
