/**
 * Internal-only helper for the VS Code / Claude Code / Copilot CLI agent-hook spec.
 *
 * Used by `salt-ds review --hook` and `salt-ds info --hook`. Not exported from
 * `packages/cli/src/index.ts` and not part of the public CLI surface.
 *
 * Spec: https://code.visualstudio.com/docs/agent-customization/hooks
 *
 * Wire format:
 * - Input (stdin):  snake_case top-level (`hook_event_name`, `tool_name`,
 *   `tool_input`, `tool_response`, `session_id`, `cwd`). Also tolerates
 *   camelCase as forward-compat for hosts that drift.
 * - Output (stdout): camelCase (`continue`, `decision`, `reason`,
 *   `suppressOutput`, `hookSpecificOutput.{hookEventName, additionalContext,
 *   permissionDecision, permissionDecisionReason}`).
 * - Exit codes: 0 = pass / advisory JSON on stdout; 2 = blocking, reason on
 *   stderr surfaces to the agent in-loop; other non-zero = non-blocking error.
 */

export type HookEventName =
  | "PreToolUse"
  | "PostToolUse"
  | "SessionStart"
  | "UserPromptSubmit"
  | "Stop"
  | "SubagentStop"
  | "Notification"
  | "PreCompact";

interface HookOutputStream {
  writeStdout(message: string): void;
}

interface HookErrorStream {
  writeStderr(message: string): void;
}

export class HookInputError extends Error {
  readonly code: "invalid-json" | "wrong-shape" | "too-large";

  constructor(
    message: string,
    code: "invalid-json" | "wrong-shape" | "too-large",
  ) {
    super(message);
    this.name = "HookInputError";
    this.code = code;
  }
}

export interface HookInput {
  /** Compare against the HookEventName literals; string for forward-compat. */
  readonly hookEventName: string;
  readonly toolName: string | null;
  readonly toolInput: Record<string, unknown> | null;
  readonly toolResponse: Record<string, unknown> | null;
  readonly sessionId: string | null;
  readonly hookCwd: string | null;
  /**
   * Best-effort extraction of file paths this tool edits/edited.
   * Reads from `tool_input` only — `tool_response` shapes are not standardized.
   * Returns deduped string entries; never null. Caller resolves against
   * `hookCwd` if relative paths show up.
   */
  editedFilePaths(): string[];
}

function readString(
  source: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return null;
}

function readObject(
  source: Record<string, unknown>,
  ...keys: string[]
): Record<string, unknown> | null {
  for (const key of keys) {
    const value = source[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }
  return null;
}

class HookInputImpl implements HookInput {
  constructor(private readonly raw: Record<string, unknown>) {}

  get hookEventName(): string {
    return readString(this.raw, "hook_event_name", "hookEventName") ?? "";
  }

  get toolName(): string | null {
    return readString(this.raw, "tool_name", "toolName");
  }

  get toolInput(): Record<string, unknown> | null {
    return readObject(this.raw, "tool_input", "toolInput");
  }

  get toolResponse(): Record<string, unknown> | null {
    return readObject(this.raw, "tool_response", "toolResponse");
  }

  get sessionId(): string | null {
    return readString(this.raw, "session_id", "sessionId");
  }

  get hookCwd(): string | null {
    return readString(this.raw, "cwd", "hookCwd");
  }

  editedFilePaths(): string[] {
    const input = this.toolInput;
    if (!input) {
      return [];
    }

    const seen = new Set<string>();
    const out: string[] = [];

    const pushIfString = (value: unknown): void => {
      if (typeof value === "string" && value.length > 0 && !seen.has(value)) {
        seen.add(value);
        out.push(value);
      }
    };

    // Common Edit/Write/NotebookEdit shapes.
    pushIfString(input.file_path);
    pushIfString(input.filePath);
    pushIfString(input.path);
    pushIfString(input.notebook_path);
    pushIfString(input.notebookPath);

    // MultiEdit-style arrays under common keys.
    for (const key of ["edits", "changes", "files"]) {
      const arr = input[key];
      if (!Array.isArray(arr)) {
        continue;
      }
      for (const entry of arr) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
          continue;
        }
        const record = entry as Record<string, unknown>;
        pushIfString(record.file_path);
        pushIfString(record.filePath);
        pushIfString(record.path);
      }
    }

    return out;
  }
}

const DEFAULT_MAX_BYTES = 1_048_576;

/**
 * Read a single JSON object from stdin and normalize it.
 *
 * - Returns `null` if stdin is a TTY (no piped input) or the payload is empty,
 *   so the caller can choose how to report a misconfigured `--hook` invocation.
 * - Throws `HookInputError` on malformed JSON, non-object payloads, or payloads
 *   exceeding `maxBytes` (default 1 MiB).
 */
export async function readHookInput(options?: {
  stream?: NodeJS.ReadableStream;
  maxBytes?: number;
}): Promise<HookInput | null> {
  const stream = options?.stream ?? process.stdin;
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;

  // process.stdin (and friends) expose isTTY when not piped.
  const maybeTty = stream as NodeJS.ReadStream;
  if (typeof maybeTty.isTTY === "boolean" && maybeTty.isTTY === true) {
    return null;
  }

  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of stream as AsyncIterable<unknown>) {
    const buffer = Buffer.isBuffer(chunk)
      ? chunk
      : typeof chunk === "string"
        ? Buffer.from(chunk, "utf8")
        : Buffer.from(chunk as Uint8Array);
    total += buffer.length;
    if (total > maxBytes) {
      throw new HookInputError(
        `Hook payload exceeds ${maxBytes} bytes`,
        "too-large",
      );
    }
    chunks.push(buffer);
  }

  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (text.length === 0) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new HookInputError(
      `Invalid JSON on hook stdin: ${error instanceof Error ? error.message : String(error)}`,
      "invalid-json",
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new HookInputError(
      "Hook payload must be a JSON object",
      "wrong-shape",
    );
  }

  return new HookInputImpl(parsed as Record<string, unknown>);
}

export interface HookSpecificOutput {
  hookEventName?: HookEventName | string;
  additionalContext?: string;
  permissionDecision?: "allow" | "deny" | "ask";
  permissionDecisionReason?: string;
}

export interface HookOutput {
  continue?: boolean;
  decision?: "approve" | "block";
  reason?: string;
  suppressOutput?: boolean;
  hookSpecificOutput?: HookSpecificOutput;
}

/** Serialize a HookOutput to JSON with a trailing newline. Pure, no I/O. */
export function formatHookOutput(output: HookOutput): string {
  return `${JSON.stringify(output)}\n`;
}

/**
 * Blocking response: write `reason` to stderr (with trailing newline if missing)
 * and return exit code 2. The hook host surfaces stderr to the agent in-loop.
 */
export function emitHookBlock(reason: string, io: HookErrorStream): 2 {
  io.writeStderr(reason.endsWith("\n") ? reason : `${reason}\n`);
  return 2;
}

/**
 * Non-blocking advisory: write structured JSON to stdout and return 0.
 * Use for PreToolUse `permissionDecision` and SessionStart `additionalContext`.
 */
export function emitHookAdvice(output: HookOutput, io: HookOutputStream): 0 {
  io.writeStdout(formatHookOutput(output));
  return 0;
}

/** Silent pass: no I/O, exit code 0. */
export function emitHookPass(): 0 {
  return 0;
}
