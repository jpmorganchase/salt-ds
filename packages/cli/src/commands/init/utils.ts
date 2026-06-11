import fs from "node:fs/promises";
import path from "node:path";

export function toPosix(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
}

export async function detectProjectName(
  rootDir: string,
  packageJsonPath: string | null,
  explicitName?: string,
): Promise<string> {
  if (explicitName && explicitName.trim().length > 0) {
    return explicitName.trim();
  }

  if (packageJsonPath) {
    try {
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf8"),
      ) as { name?: unknown };
      if (
        typeof packageJson.name === "string" &&
        packageJson.name.trim().length > 0
      ) {
        return packageJson.name.trim();
      }
    } catch {
      // Ignore invalid package.json here and fall back to the directory name.
    }
  }

  return path.basename(rootDir);
}

export function inferInstructionFilename(
  instructionPath: string,
): "AGENTS.md" | "CLAUDE.md" | null {
  const baseName = path.basename(instructionPath);
  if (baseName === "AGENTS.md" || baseName === "CLAUDE.md") {
    return baseName;
  }

  return null;
}
