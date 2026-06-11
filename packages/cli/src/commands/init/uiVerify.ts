import fs from "node:fs/promises";
import path from "node:path";
import { pathExists } from "../../lib/common.js";
import { toPosix } from "./utils.js";

export interface EnsureUiVerifyResult {
  action:
    | "created"
    | "unchanged"
    | "preserved_existing"
    | "skipped_no_package_json"
    | "skipped_invalid_package_json";
  packageJsonPath: string | null;
  command: string | null;
}

export async function ensureUiVerifyScript(
  rootDir: string,
): Promise<EnsureUiVerifyResult> {
  const packageJsonPath = path.join(rootDir, "package.json");
  if (!(await pathExists(packageJsonPath))) {
    return {
      action: "skipped_no_package_json",
      packageJsonPath: null,
      command: null,
    };
  }

  let packageJson: Record<string, unknown>;
  try {
    packageJson = JSON.parse(
      await fs.readFile(packageJsonPath, "utf8"),
    ) as Record<string, unknown>;
  } catch {
    return {
      action: "skipped_invalid_package_json",
      packageJsonPath: toPosix(packageJsonPath),
      command: null,
    };
  }

  const reviewTarget = (await pathExists(path.join(rootDir, "src")))
    ? "src"
    : ".";
  const command = `salt-ds review ${reviewTarget}`;
  const scriptsValue = packageJson.scripts;
  const scripts =
    scriptsValue &&
    typeof scriptsValue === "object" &&
    !Array.isArray(scriptsValue)
      ? (scriptsValue as Record<string, unknown>)
      : {};
  const existingScript = scripts["ui:verify"];

  if (typeof existingScript === "string") {
    return {
      action: existingScript === command ? "unchanged" : "preserved_existing",
      packageJsonPath: toPosix(packageJsonPath),
      command: existingScript,
    };
  }

  packageJson.scripts = {
    ...scripts,
    "ui:verify": command,
  };
  await fs.writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf8",
  );
  return {
    action: "created",
    packageJsonPath: toPosix(packageJsonPath),
    command,
  };
}
