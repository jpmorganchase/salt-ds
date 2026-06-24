import fs from "node:fs/promises";
import path from "node:path";
import {
  upsertMarkedBlock,
  VSCODE_COPILOT_BLOCK_END,
  VSCODE_COPILOT_BLOCK_START,
  VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE,
} from "@salt-ds/semantic-core/bootstrapScaffolding";
import { pathExists } from "../../lib/common.js";

export function parseHostAdapters(rawValue: string | undefined): Set<"vscode"> {
  const adapters = new Set<"vscode">();
  if (!rawValue) {
    return adapters;
  }

  for (const candidate of rawValue.split(",")) {
    if (candidate.trim() === "vscode") {
      adapters.add("vscode");
    }
  }

  return adapters;
}

export async function ensureCopilotInstructions(
  rootDir: string,
): Promise<"created" | "updated" | "unchanged"> {
  const instructionsPath = path.join(
    rootDir,
    ".github",
    "copilot-instructions.md",
  );
  if (!(await pathExists(instructionsPath))) {
    await fs.mkdir(path.dirname(instructionsPath), { recursive: true });
    await fs.writeFile(
      instructionsPath,
      `${VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE}\n`,
      "utf8",
    );
    return "created";
  }

  const existingContent = await fs.readFile(instructionsPath, "utf8");
  const nextContent = upsertMarkedBlock(
    existingContent,
    VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE,
    VSCODE_COPILOT_BLOCK_START,
    VSCODE_COPILOT_BLOCK_END,
  );
  if (!nextContent.changed) {
    return "unchanged";
  }

  await fs.writeFile(instructionsPath, `${nextContent.content}\n`, "utf8");
  return "updated";
}
