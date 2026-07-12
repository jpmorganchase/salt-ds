import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const restrictedImportPattern = /@salt-ds\/[^\s"'`]+\/src(?:\/[^\s"'`]*)?/g;

export function findRestrictedSourceImports(source) {
  return source.split(/\r?\n/u).flatMap((line, index) =>
    [...line.matchAll(restrictedImportPattern)].map((match) => ({
      line: index + 1,
      importPath: match[0],
    })),
  );
}

export function getTrackedTypeScriptFiles() {
  const result = spawnSync("git", ["ls-files", "-z", "--", "packages"], {
    encoding: "utf8",
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || "git ls-files failed");
  }

  return result.stdout.split("\0").filter((file) => /\.tsx?$/u.test(file));
}

export function checkSourceImports(files = getTrackedTypeScriptFiles()) {
  return files.flatMap((file) =>
    findRestrictedSourceImports(fs.readFileSync(file, "utf8")).map(
      ({ line, importPath }) => ({ file, line, importPath }),
    ),
  );
}

export function main() {
  const violations = checkSourceImports();
  if (violations.length === 0) {
    console.log("No package source imports found.");
    return;
  }

  for (const { file, line, importPath } of violations) {
    console.error(`${file}:${line}: imports private source path ${importPath}`);
  }
  process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
