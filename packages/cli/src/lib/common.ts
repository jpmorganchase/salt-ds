import fs from "node:fs/promises";
import path from "node:path";

export function formatStatus(status: string): string {
  return status.toUpperCase();
}

export function createDefaultBundleDir(cwd: string): string {
  return path.join(cwd, ".salt-support", "doctor-bundle");
}

export async function writeJsonFile(
  outputPath: string,
  value: unknown,
): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
