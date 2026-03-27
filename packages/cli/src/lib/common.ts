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

export function getStringRecordField(
  record: Record<string, unknown> | null | undefined,
  field: string,
): string | null {
  if (!record) {
    return null;
  }

  const value = record[field];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function getNestedStringRecordField(
  record: Record<string, unknown> | null | undefined,
  first: string,
  second: string,
): string | null {
  if (!record) {
    return null;
  }

  const nested = record[first];
  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return null;
  }

  const value = (nested as Record<string, unknown>)[second];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
