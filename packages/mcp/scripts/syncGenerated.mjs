import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const sourceGeneratedDir = path.join(packageRoot, "generated");
const distGeneratedDir = path.resolve(
  packageRoot,
  "..",
  "..",
  "dist",
  "salt-ds-mcp",
  "generated",
);
const distPackageJsonPath = path.resolve(
  packageRoot,
  "..",
  "..",
  "dist",
  "salt-ds-mcp",
  "package.json",
);

const DIST_SCRIPT_EXCLUDES = new Set([
  "build:package",
  "build:registry",
  "sync:generated",
  "build",
  "prepack",
]);

await fs.rm(distGeneratedDir, { recursive: true, force: true });
await fs.cp(sourceGeneratedDir, distGeneratedDir, { recursive: true });

const distPackageJson = JSON.parse(
  await fs.readFile(distPackageJsonPath, "utf8"),
);
if (distPackageJson.scripts && typeof distPackageJson.scripts === "object") {
  distPackageJson.scripts = Object.fromEntries(
    Object.entries(distPackageJson.scripts).filter(
      ([scriptName]) => !DIST_SCRIPT_EXCLUDES.has(scriptName),
    ),
  );
  if (Object.keys(distPackageJson.scripts).length === 0) {
    delete distPackageJson.scripts;
  }
}

await fs.writeFile(
  distPackageJsonPath,
  `${JSON.stringify(distPackageJson, null, 2)}\n`,
  "utf8",
);
