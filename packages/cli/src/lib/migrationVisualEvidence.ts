import fs from "node:fs/promises";
import path from "node:path";
import type { SourceUiOutlineInput } from "../../../semantic-core/src/index.js";

export interface LoadedSourceOutline {
  path: string;
  outline: SourceUiOutlineInput;
  counts: {
    regions: number;
    actions: number;
    states: number;
    notes: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeOutlineField(
  value: unknown,
  fieldName: keyof SourceUiOutlineInput,
  resolvedPath: string,
): string[] | undefined {
  if (value == null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(
      `--source-outline at ${resolvedPath} must use a string array for ${fieldName}.`,
    );
  }

  const normalized = value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0,
  );

  if (normalized.length !== value.length) {
    throw new Error(
      `--source-outline at ${resolvedPath} must use non-empty strings for ${fieldName}.`,
    );
  }

  return normalized.length > 0 ? normalized : undefined;
}

export async function loadSourceOutlineFile(
  rootDir: string,
  sourceOutlinePath: string,
): Promise<LoadedSourceOutline> {
  const resolvedPath = path.resolve(rootDir, sourceOutlinePath);

  let contents: string;
  try {
    contents = await fs.readFile(resolvedPath, "utf8");
  } catch {
    throw new Error(`Could not read --source-outline at ${resolvedPath}.`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error(
      `Could not parse --source-outline at ${resolvedPath} as JSON.`,
    );
  }

  if (!isRecord(parsed)) {
    throw new Error(
      `--source-outline at ${resolvedPath} must be a JSON object with regions, actions, states, or notes arrays.`,
    );
  }

  const outline: SourceUiOutlineInput = {
    regions: normalizeOutlineField(parsed.regions, "regions", resolvedPath),
    actions: normalizeOutlineField(parsed.actions, "actions", resolvedPath),
    states: normalizeOutlineField(parsed.states, "states", resolvedPath),
    notes: normalizeOutlineField(parsed.notes, "notes", resolvedPath),
  };

  const counts = {
    regions: outline.regions?.length ?? 0,
    actions: outline.actions?.length ?? 0,
    states: outline.states?.length ?? 0,
    notes: outline.notes?.length ?? 0,
  };

  if (counts.regions + counts.actions + counts.states + counts.notes === 0) {
    throw new Error(
      `--source-outline at ${resolvedPath} must include at least one of regions, actions, states, or notes.`,
    );
  }

  return {
    path: resolvedPath,
    outline,
    counts,
  };
}
