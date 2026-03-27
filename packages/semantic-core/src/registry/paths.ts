import { accessSync } from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fsPromises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export function getPackageRoot(fromImportMetaUrl: string): string {
  const filePath = fileURLToPath(fromImportMetaUrl);
  let current = path.dirname(filePath);

  while (true) {
    const packageJsonPath = path.join(current, "package.json");
    try {
      accessSync(packageJsonPath);
      return current;
    } catch {
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
  }

  return path.resolve(path.dirname(filePath), "..", "..");
}

export async function findSaltRepoRoot(start: string): Promise<string | null> {
  let current = path.resolve(start);

  while (true) {
    const packagesCore = path.join(current, "packages", "core");
    const siteDocs = path.join(current, "site", "docs");

    if ((await pathExists(packagesCore)) && (await pathExists(siteDocs))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }

    current = parent;
  }
}

export function toPosixPath(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
}
