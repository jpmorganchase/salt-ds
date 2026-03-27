import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import type {
  NormalizedVisualEvidenceInput,
  SourceUiOutlineInput,
  VisualEvidenceConfidence,
  VisualEvidenceKind,
  VisualEvidenceSourceType,
} from "@salt-ds/semantic-core/tools/translation/sourceUiTypes";

export const MIGRATE_VISUAL_ADAPTER_ENV_VAR = "SALT_DS_MIGRATE_VISUAL_ADAPTER";
export const MIGRATE_VISUAL_ADAPTER_CONTRACT = "migrate_visual_evidence_v1";

interface VisualEvidenceAdapterConfig {
  command: string;
  args: string[];
}

interface OutlineSignalCounts {
  regions: number;
  actions: number;
  states: number;
  notes: number;
}

export interface ResolvedSourceOutline {
  outline: SourceUiOutlineInput;
  counts: OutlineSignalCounts;
}

export interface LoadedSourceOutline extends ResolvedSourceOutline {
  path: string;
}

export interface LoadedVisualEvidenceInput {
  kind: VisualEvidenceKind;
  sourceType: VisualEvidenceSourceType;
  source: string;
  label: string | null;
  confidence: VisualEvidenceConfidence;
  notes: string[];
  derivedOutline: SourceUiOutlineInput;
  counts: OutlineSignalCounts;
}

export interface LoadedMigrationVisualEvidence {
  sourceOutline: LoadedSourceOutline | null;
  visualInputs: LoadedVisualEvidenceInput[];
  mergedOutline: ResolvedSourceOutline | null;
  ambiguities: string[];
}

interface VisualEvidenceAdapterRequest {
  contract: typeof MIGRATE_VISUAL_ADAPTER_CONTRACT;
  cwd: string;
  inputs: Array<{
    kind: VisualEvidenceKind;
    source_type: VisualEvidenceSourceType;
    source: string;
    label: string;
  }>;
}

interface VisualEvidenceAdapterResponse {
  contract: typeof MIGRATE_VISUAL_ADAPTER_CONTRACT;
  visual_evidence: NormalizedVisualEvidenceInput[];
  ambiguities?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

function isVisualEvidenceAdapterResponse(
  value: unknown,
): value is VisualEvidenceAdapterResponse {
  return (
    isRecord(value) &&
    value.contract === MIGRATE_VISUAL_ADAPTER_CONTRACT &&
    Array.isArray(value.visual_evidence) &&
    (value.ambiguities == null || isStringArray(value.ambiguities))
  );
}

function tokenizeCommandLine(rawValue: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;

  for (let index = 0; index < rawValue.length; index += 1) {
    const character = rawValue[index];

    if (quote) {
      if (character === quote) {
        quote = null;
        continue;
      }

      if (
        character === "\\" &&
        quote === '"' &&
        index + 1 < rawValue.length &&
        (rawValue[index + 1] === '"' || rawValue[index + 1] === "\\")
      ) {
        current += rawValue[index + 1];
        index += 1;
        continue;
      }

      current += character;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (/\s/.test(character)) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += character;
  }

  if (quote) {
    throw new Error(
      `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} uses an unterminated quoted argument. Use JSON array/object syntax for portability.`,
    );
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

function parseVisualEvidenceAdapterConfig(
  rawValue: string,
): VisualEvidenceAdapterConfig {
  const trimmed = rawValue.trim();
  if (trimmed.length === 0) {
    throw new Error(
      `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} cannot be empty. Use a JSON array/object or an executable path.`,
    );
  }

  if (trimmed.startsWith("{")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(
        `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} must be valid JSON when it starts with "{".`,
      );
    }

    if (!isRecord(parsed)) {
      throw new Error(
        `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} JSON object form must include a command string and optional args string array.`,
      );
    }

    if (
      typeof parsed.command !== "string" ||
      parsed.command.trim().length === 0
    ) {
      throw new Error(
        `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} JSON object form must include a non-empty command string.`,
      );
    }

    if (parsed.args != null && !isStringArray(parsed.args)) {
      throw new Error(
        `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} JSON object form must use a string array for args.`,
      );
    }

    return {
      command: parsed.command.trim(),
      args: (parsed.args ?? []).map((entry) => entry.trim()).filter(Boolean),
    };
  }

  if (trimmed.startsWith("[")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(
        `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} must be valid JSON when it starts with "[".`,
      );
    }

    if (!isStringArray(parsed) || parsed.length === 0) {
      throw new Error(
        `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} JSON array form must contain at least one command string.`,
      );
    }

    const [command, ...args] = parsed
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (!command) {
      throw new Error(
        `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} JSON array form must start with a non-empty command string.`,
      );
    }

    return {
      command,
      args,
    };
  }

  const tokens = tokenizeCommandLine(trimmed);
  if (tokens.length === 0) {
    throw new Error(
      `${MIGRATE_VISUAL_ADAPTER_ENV_VAR} must resolve to a command. Use JSON array/object syntax for portability.`,
    );
  }

  const [command, ...args] = tokens;
  return {
    command,
    args,
  };
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

function countOutlineSignals(
  outline: SourceUiOutlineInput,
): OutlineSignalCounts {
  return {
    regions: outline.regions?.length ?? 0,
    actions: outline.actions?.length ?? 0,
    states: outline.states?.length ?? 0,
    notes: outline.notes?.length ?? 0,
  };
}

function hasOutlineSignals(counts: OutlineSignalCounts): boolean {
  return counts.regions + counts.actions + counts.states + counts.notes > 0;
}

function mergeOutlineField(
  values: Array<string[] | undefined>,
): string[] | undefined {
  const merged = unique(
    values.flatMap((entries) =>
      (entries ?? []).filter((entry) => entry.trim().length > 0),
    ),
  );

  return merged.length > 0 ? merged : undefined;
}

function resolveVisualEvidenceSourceType(
  value: string,
): VisualEvidenceSourceType {
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return "url";
    }
  } catch {
    // Treat non-URL values as filesystem paths.
  }

  return "file";
}

async function resolveVisualEvidenceSource(
  rootDir: string,
  kind: VisualEvidenceKind,
  value: string,
): Promise<{
  kind: VisualEvidenceKind;
  source_type: VisualEvidenceSourceType;
  source: string;
  label: string;
}> {
  const sourceType = resolveVisualEvidenceSourceType(value);
  if (sourceType === "url") {
    const parsed = new URL(value);
    const label =
      parsed.pathname.split("/").filter(Boolean).at(-1) ?? parsed.hostname;
    return {
      kind,
      source_type: "url",
      source: value,
      label,
    };
  }

  const resolvedPath = path.resolve(rootDir, value);
  try {
    await fs.access(resolvedPath);
  } catch {
    throw new Error(`Could not read --${kind} at ${resolvedPath}.`);
  }

  return {
    kind,
    source_type: "file",
    source: resolvedPath,
    label: path.basename(resolvedPath),
  };
}

function parseOutlineInput(
  rawValue: unknown,
  sourceLabel: string,
): SourceUiOutlineInput {
  if (!isRecord(rawValue)) {
    throw new Error(
      `The visual evidence adapter must return ${sourceLabel}.derived_outline as a JSON object with regions, actions, states, or notes arrays.`,
    );
  }

  const outline: SourceUiOutlineInput = {
    regions: normalizeOutlineField(rawValue.regions, "regions", sourceLabel),
    actions: normalizeOutlineField(rawValue.actions, "actions", sourceLabel),
    states: normalizeOutlineField(rawValue.states, "states", sourceLabel),
    notes: normalizeOutlineField(rawValue.notes, "notes", sourceLabel),
  };
  const counts = countOutlineSignals(outline);
  if (!hasOutlineSignals(counts)) {
    throw new Error(
      `The visual evidence adapter must return at least one outline signal for ${sourceLabel}.`,
    );
  }

  return outline;
}

function parseVisualEvidenceConfidence(
  value: unknown,
  sourceLabel: string,
): VisualEvidenceConfidence {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  throw new Error(
    `The visual evidence adapter must return ${sourceLabel}.confidence as "low", "medium", or "high".`,
  );
}

function parseVisualEvidenceArray(
  value: unknown,
  sourceLabel: string,
): string[] {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(
      `The visual evidence adapter must return ${sourceLabel} as an array of strings when provided.`,
    );
  }

  return value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0,
  );
}

async function runVisualEvidenceAdapter(
  config: VisualEvidenceAdapterConfig,
  request: VisualEvidenceAdapterRequest,
): Promise<VisualEvidenceAdapterResponse> {
  return new Promise<VisualEvidenceAdapterResponse>((resolve, reject) => {
    const child = spawn(config.command, config.args, {
      cwd: request.cwd,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(
        new Error(
          `The visual evidence adapter timed out. Check ${MIGRATE_VISUAL_ADAPTER_ENV_VAR} or provide --source-outline instead.`,
        ),
      );
    }, 30000);

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(
          new Error(
            stderr.trim().length > 0
              ? `The visual evidence adapter failed: ${stderr.trim()}`
              : `The visual evidence adapter exited with code ${code}.`,
          ),
        );
        return;
      }

      try {
        const parsed = JSON.parse(stdout) as unknown;
        if (!isVisualEvidenceAdapterResponse(parsed)) {
          if (!isRecord(parsed)) {
            throw new Error("response must be a JSON object");
          }

          if (parsed.contract !== MIGRATE_VISUAL_ADAPTER_CONTRACT) {
            throw new Error(
              `response contract must be ${MIGRATE_VISUAL_ADAPTER_CONTRACT}`,
            );
          }

          if (!Array.isArray(parsed.visual_evidence)) {
            throw new Error("response visual_evidence must be an array");
          }

          throw new Error(
            "response ambiguities must be a string array when present",
          );
        }

        resolve(parsed);
      } catch (error) {
        reject(
          new Error(
            `The visual evidence adapter returned invalid JSON: ${error instanceof Error ? error.message : "unknown parse error"}.`,
          ),
        );
      }
    });

    child.stdin.write(`${JSON.stringify(request)}\n`);
    child.stdin.end();
  });
}

function toLoadedVisualEvidenceInput(
  entry: unknown,
  index: number,
): LoadedVisualEvidenceInput {
  if (!isRecord(entry)) {
    throw new Error(
      `The visual evidence adapter must return visual_evidence[${index}] as an object.`,
    );
  }

  const kind = entry.kind;
  if (kind !== "mockup" && kind !== "screenshot") {
    throw new Error(
      `The visual evidence adapter must return visual_evidence[${index}].kind as "mockup" or "screenshot".`,
    );
  }

  const sourceType = entry.source_type;
  if (sourceType !== "file" && sourceType !== "url") {
    throw new Error(
      `The visual evidence adapter must return visual_evidence[${index}].source_type as "file" or "url".`,
    );
  }

  const source =
    typeof entry.source === "string" && entry.source.trim().length > 0
      ? entry.source.trim()
      : null;
  if (!source) {
    throw new Error(
      `The visual evidence adapter must return visual_evidence[${index}].source as a non-empty string.`,
    );
  }

  const sourceLabel = `visual_evidence[${index}]`;
  const derivedOutline = parseOutlineInput(entry.derived_outline, sourceLabel);
  const counts = countOutlineSignals(derivedOutline);

  return {
    kind,
    sourceType,
    source,
    label:
      typeof entry.label === "string" && entry.label.trim().length > 0
        ? entry.label.trim()
        : null,
    confidence: parseVisualEvidenceConfidence(entry.confidence, sourceLabel),
    notes: parseVisualEvidenceArray(entry.notes, `${sourceLabel}.notes`),
    derivedOutline,
    counts,
  };
}

export function mergeSourceOutlineInputs(
  outlines: Array<SourceUiOutlineInput | null | undefined>,
): ResolvedSourceOutline | null {
  const mergedOutline: SourceUiOutlineInput = {
    regions: mergeOutlineField(outlines.map((outline) => outline?.regions)),
    actions: mergeOutlineField(outlines.map((outline) => outline?.actions)),
    states: mergeOutlineField(outlines.map((outline) => outline?.states)),
    notes: mergeOutlineField(outlines.map((outline) => outline?.notes)),
  };
  const counts = countOutlineSignals(mergedOutline);

  if (!hasOutlineSignals(counts)) {
    return null;
  }

  return {
    outline: mergedOutline,
    counts,
  };
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

  const counts = countOutlineSignals(outline);

  if (!hasOutlineSignals(counts)) {
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

export async function loadMigrationVisualEvidence(input: {
  rootDir: string;
  sourceOutlinePath?: string;
  mockups?: string[];
  screenshots?: string[];
  adapterCommand?: string | null;
}): Promise<LoadedMigrationVisualEvidence> {
  const sourceOutline = input.sourceOutlinePath
    ? await loadSourceOutlineFile(input.rootDir, input.sourceOutlinePath)
    : null;
  const requestedVisualInputs = [
    ...(input.mockups ?? []).map((value) =>
      resolveVisualEvidenceSource(input.rootDir, "mockup", value),
    ),
    ...(input.screenshots ?? []).map((value) =>
      resolveVisualEvidenceSource(input.rootDir, "screenshot", value),
    ),
  ];
  const resolvedVisualInputs = await Promise.all(requestedVisualInputs);

  if (resolvedVisualInputs.length === 0) {
    return {
      sourceOutline,
      visualInputs: [],
      mergedOutline: sourceOutline
        ? {
            outline: sourceOutline.outline,
            counts: sourceOutline.counts,
          }
        : null,
      ambiguities: [],
    };
  }

  if (!input.adapterCommand) {
    throw new Error(
      `Received --mockup/--screenshot, but ${MIGRATE_VISUAL_ADAPTER_ENV_VAR} is not configured. Set ${MIGRATE_VISUAL_ADAPTER_ENV_VAR} to a command that returns normalized visual evidence, or provide --source-outline instead.`,
    );
  }

  const adapterConfig = parseVisualEvidenceAdapterConfig(input.adapterCommand);

  const adapterOutput = await runVisualEvidenceAdapter(adapterConfig, {
    contract: MIGRATE_VISUAL_ADAPTER_CONTRACT,
    cwd: input.rootDir,
    inputs: resolvedVisualInputs,
  });
  const visualInputs = adapterOutput.visual_evidence.map(
    toLoadedVisualEvidenceInput,
  );
  if (visualInputs.length === 0) {
    throw new Error(
      "The visual evidence adapter returned no normalized visual evidence. Provide --source-outline instead, or fix the adapter output.",
    );
  }
  const mergedOutline = mergeSourceOutlineInputs([
    sourceOutline?.outline,
    ...visualInputs.map((entry) => entry.derivedOutline),
  ]);
  if (!mergedOutline) {
    throw new Error(
      "The visual evidence adapter did not produce any outline signals. Provide --source-outline instead, or fix the adapter output.",
    );
  }
  const ambiguities = unique([
    ...(adapterOutput.ambiguities ?? []).filter(
      (entry) => typeof entry === "string" && entry.trim().length > 0,
    ),
    ...visualInputs
      .filter((entry) => entry.confidence === "low")
      .map((entry) => {
        const label = entry.label ?? entry.source;
        return `Low-confidence visual interpretation from ${label} should be confirmed before implementation.`;
      }),
  ]);

  return {
    sourceOutline,
    visualInputs,
    mergedOutline,
    ambiguities,
  };
}
