import fs from "node:fs/promises";
import path from "node:path";
import {
  mergeSaltAgentHooksManifest,
  SALT_AGENT_HOOKS_FILE_RELATIVE_PATH,
} from "@salt-ds/semantic-core/bootstrapScaffolding";
import { pathExists } from "../../lib/common.js";
import { toPosix } from "./utils.js";

interface EnsureSaltAgentHooksResult {
  action: "created" | "updated" | "unchanged";
  path: string;
}

export async function ensureSaltAgentHooksManifest(
  rootDir: string,
): Promise<EnsureSaltAgentHooksResult> {
  const manifestPath = path.join(
    rootDir,
    ...SALT_AGENT_HOOKS_FILE_RELATIVE_PATH.split("/"),
  );
  const exists = await pathExists(manifestPath);
  if (!exists) {
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    const initial = mergeSaltAgentHooksManifest(null);
    await fs.writeFile(
      manifestPath,
      `${JSON.stringify(initial.content, null, 2)}\n`,
      "utf8",
    );
    return { action: "created", path: toPosix(manifestPath) };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch {
    parsed = null;
  }
  const merged = mergeSaltAgentHooksManifest(parsed);
  if (!merged.changed) {
    return { action: "unchanged", path: toPosix(manifestPath) };
  }
  await fs.writeFile(
    manifestPath,
    `${JSON.stringify(merged.content, null, 2)}\n`,
    "utf8",
  );
  return { action: "updated", path: toPosix(manifestPath) };
}
