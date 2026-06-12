export const SALT_REPO_INSTRUCTIONS_BLOCK_START =
  "<!-- salt-ds:repo-instructions:start -->";
export const SALT_REPO_INSTRUCTIONS_BLOCK_END =
  "<!-- salt-ds:repo-instructions:end -->";

// The repo-instructions body is the canonical Salt-managed AGENTS.md block.
// Keep it short and verifiable. Every bullet must be either (a) a hard gate
// the agent can check from the workflow output, or (b) a single
// don't-improvise rule. Long prose belongs in Salt's own docs, not in
// every consumer repo.
const SALT_REPO_INSTRUCTIONS_LINES = [
  "Use the Salt MCP (or the `salt-ds` CLI fallback) for any Salt UI task.",
  "",
  "Do not invent Salt APIs, props, imports, package names, tokens, components, patterns, or examples. If the workflow does not surface evidence, report it as pending instead of guessing.",
  "",
  "Hard gate for create/migrate/upgrade implementation: only edit Salt UI when the compact `salt_workflow_v1` contract returns `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete`. Otherwise follow the returned `action` (`ask_user`, `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, `bootstrap_repo`) and rerun the originating workflow.",
  "",
  "After installing dependencies, rerun the originating workflow before editing. Do not insert a manual `get_salt_project_context` call between install and rerun \u2014 the MCP refetches stale context automatically.",
  "",
  "Preprocess screenshots and mockups into structured outline evidence before the canonical migrate step. Do not send raw images to the MCP.",
  "",
  "Before considering Salt UI work complete, run the repo `ui:verify` script when it exists, or `salt-ds review` directly.",
  "",
  "Repo policy lives in `.salt/team.json` (and optionally `.salt/stack.json`). If both are missing, keep the first answer canonical-only and recommend `bootstrap_salt_repo` / `salt-ds init` only when durable policy would change future answers.",
];

const SALT_RUNTIME_SUPPORT_LINES = [
  "If source-level guidance is still not enough and the Salt CLI is available, use:",
  "",
  "- `salt-ds doctor` for local environment and runtime-target checks",
  "- `salt-ds review <path> --url <url>` when source validation and runtime evidence should stay in the same workflow pass",
  "- `salt-ds runtime inspect <url>` only for explicit runtime debugging or support work",
  "",
  "Keep that CLI evidence separate from canonical Salt guidance, and keep fetched-HTML fallback claims narrower than browser-session evidence.",
];

export const SALT_REPO_INSTRUCTIONS_BODY =
  SALT_REPO_INSTRUCTIONS_LINES.join("\n");
export const SALT_REPO_INSTRUCTIONS_TEMPLATE = [
  SALT_REPO_INSTRUCTIONS_BLOCK_START,
  SALT_REPO_INSTRUCTIONS_BODY,
  SALT_REPO_INSTRUCTIONS_BLOCK_END,
  "",
].join("\n");

export const CONSUMER_REPO_AGENTS_TEMPLATE = [
  SALT_REPO_INSTRUCTIONS_TEMPLATE.trimEnd(),
  "",
  SALT_RUNTIME_SUPPORT_LINES.join("\n"),
  "",
].join("\n");

const LEGACY_REPO_INSTRUCTIONS_TEMPLATES = [
  [
    "Use the Salt MCP for canonical Salt guidance.",
    "",
    "Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.",
    "",
    "Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.",
    "",
    "For Salt UI tasks, complete:",
    "",
    "- a selection step through Salt MCP or the Salt CLI fallback",
    "- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
    "- if the workflow output says stronger grounding is needed, follow the returned canonical Salt follow-up before editing",
    "",
    "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
    "",
    "If a Salt workflow result says project conventions matter:",
    "",
    "- keep repo-local policy in `.salt/team.json` when it exists",
    "- use `.salt/stack.json` only when the repo already declares layered upstream policy",
    "- use repo-aware Salt workflows so Salt applies the declared project conventions",
    "- keep the canonical Salt choice visible as provenance",
    "",
    "Default to `.salt/team.json` for simple repos. Add `.salt/stack.json` only when shared upstream layers or explicit merge ordering are real.",
    "",
  ].join("\n"),
  [
    "Use the Salt MCP for canonical Salt guidance.",
    "",
    "Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.",
    "",
    "Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.",
    "",
    "For Salt UI tasks, complete:",
    "",
    "- a selection step through Salt MCP or the Salt CLI fallback",
    "- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
    "- if compact Salt output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before editing",
    "",
    "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
    "",
    "If a Salt workflow result says project conventions matter:",
    "",
    "- keep repo-local policy in `.salt/team.json` when it exists",
    "- use `.salt/stack.json` only when the repo already declares layered upstream policy",
    "- use repo-aware Salt workflows so Salt applies the declared project conventions",
    "- keep the canonical Salt choice visible as provenance",
    "",
    "Default to `.salt/team.json` for simple repos. Add `.salt/stack.json` only when shared upstream layers or explicit merge ordering are real.",
    "",
  ].join("\n"),
  [
    "Use the Salt MCP for canonical Salt guidance.",
    "",
    "Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.",
    "",
    "Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.",
    "",
    "For Salt UI tasks, complete:",
    "",
    "- a selection step through Salt MCP or the Salt CLI fallback",
    "- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
    "- if compact Salt output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before editing",
    "",
    "Do not inspect `node_modules`, copied app code, or generic web examples to choose Salt-specific components, patterns, tokens, props, or layout structures.",
    "",
    "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until both the canonical selection step and the validation step have completed successfully.",
    "",
    "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
    "",
    "Before considering Salt UI work complete, run the repo `ui:verify` script when it exists, or run `salt-ds review` directly.",
    "",
    "If both Salt MCP and the Salt CLI are unavailable or failing, stop, resolve the blocker, or ask the user before proceeding. Do not continue with guessed Salt-specific guidance.",
    "",
    "If a Salt workflow result says project conventions matter:",
    "",
    "- keep repo-local policy in `.salt/team.json` when it exists",
    "- use `.salt/stack.json` only when the repo already declares layered upstream policy",
    "- use repo-aware Salt workflows so Salt applies the declared project conventions",
    "- keep the canonical Salt choice visible as provenance",
    "",
    "Default to `.salt/team.json` for simple repos. Add `.salt/stack.json` only when shared upstream layers or explicit merge ordering are real.",
    "",
  ].join("\n"),
  [
    "Use the Salt MCP for canonical Salt guidance.",
    "",
    "Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.",
    "",
    "Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.",
    "",
    "For Salt UI tasks, complete:",
    "",
    "- a selection step through Salt MCP or the Salt CLI fallback",
    "- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
    "- if compact Salt output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before editing",
    "",
    "Do not inspect `node_modules`, copied app code, or generic web examples to choose Salt-specific components, patterns, tokens, props, or layout structures.",
    "",
    "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until the canonical workflow satisfies the hard gate; after editing, run the validation or review step.",
    "",
    "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
    "",
    "Before considering Salt UI work complete, run the repo `ui:verify` script when it exists, or run `salt-ds review` directly.",
    "",
    "If both Salt MCP and the Salt CLI are unavailable or failing, stop, resolve the blocker, or ask the user before proceeding. Do not continue with guessed Salt-specific guidance.",
    "",
    "If a Salt workflow result says project conventions matter:",
    "",
    "- keep repo-local policy in `.salt/team.json` when it exists",
    "- use `.salt/stack.json` only when the repo already declares layered upstream policy",
    "- use repo-aware Salt workflows so Salt applies the declared project conventions",
    "- keep the canonical Salt choice visible as provenance",
    "",
    "Default to `.salt/team.json` for simple repos. Add `.salt/stack.json` only when shared upstream layers or explicit merge ordering are real.",
    "",
  ].join("\n"),
];

export const VSCODE_COPILOT_BLOCK_START =
  "<!-- salt-ds:copilot-instructions:start -->";
export const VSCODE_COPILOT_BLOCK_END =
  "<!-- salt-ds:copilot-instructions:end -->";

// The VS Code Copilot adapter no longer duplicates the AGENTS.md body.
// VS Code reads AGENTS.md alongside .github/copilot-instructions.md; the
// canonical Salt rules live in AGENTS.md (Salt-managed block). This file
// just tells the host where to look.
export const VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE = [
  VSCODE_COPILOT_BLOCK_START,
  "# Salt UI Workflow",
  "",
  "Follow the repo root `AGENTS.md` as the canonical Salt workflow contract.",
  "The Salt-managed block in `AGENTS.md` is the single source of truth; do not duplicate or paraphrase its rules here.",
  VSCODE_COPILOT_BLOCK_END,
  "",
].join("\n");

function stripExactBlock(content: string, block: string): string {
  if (!content.includes(block)) {
    return content;
  }

  return content
    .replace(block, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

export function stripLegacySaltRepoInstructions(content: string): string {
  return LEGACY_REPO_INSTRUCTIONS_TEMPLATES.reduce(
    (current, block) => stripExactBlock(current, block),
    content,
  );
}

export function upsertMarkedBlock(
  existingContent: string,
  block: string,
  startMarker: string,
  endMarker: string,
): { content: string; changed: boolean } {
  const trimmed = existingContent.trimEnd();
  const startIndex = trimmed.indexOf(startMarker);
  const endIndex = trimmed.indexOf(endMarker);

  if (startIndex >= 0 && endIndex >= startIndex) {
    const blockEndIndex = endIndex + endMarker.length;
    const currentBlock = trimmed.slice(startIndex, blockEndIndex);
    if (currentBlock === block.trimEnd()) {
      return { content: trimmed, changed: false };
    }

    return {
      content:
        `${trimmed.slice(0, startIndex)}${block.trimEnd()}${trimmed.slice(blockEndIndex)}`.trimEnd(),
      changed: true,
    };
  }

  if (trimmed.length === 0) {
    return { content: block.trimEnd(), changed: true };
  }

  return {
    content: `${trimmed}\n\n${block.trimEnd()}`.trimEnd(),
    changed: true,
  };
}

export function upsertSaltRepoInstructions(existingContent: string): {
  content: string;
  changed: boolean;
} {
  const sanitized = stripLegacySaltRepoInstructions(existingContent);
  return upsertMarkedBlock(
    sanitized,
    SALT_REPO_INSTRUCTIONS_TEMPLATE,
    SALT_REPO_INSTRUCTIONS_BLOCK_START,
    SALT_REPO_INSTRUCTIONS_BLOCK_END,
  );
}

// ---------- Agent hook scaffolding (VS Code / Claude Code / Copilot CLI) ----------

/**
 * Relative path inside the repo where the Salt-managed agent hook manifest lives.
 * Picked up by the editor's hookFilesLocations setting.
 */
export const SALT_AGENT_HOOKS_FILE_RELATIVE_PATH = ".github/hooks/salt.json";

/** Salt-managed command emitted into PostToolUse. */
export const SALT_POST_TOOL_USE_HOOK_COMMAND = "npx salt-ds hook";
/** Salt-managed command emitted into SessionStart. */
export const SALT_SESSION_START_HOOK_COMMAND = "npx salt-ds info --hook";
/**
 * Salt-managed command emitted into Stop. Reads SaltAttestationV1 NDJSON from
 * stdin and verifies recorded file hashes against the current on-disk state.
 * Consumers wire stdin to whatever audit store they already operate; Salt does
 * not pick the store path. See `workflow-examples/consumer-repo/README.md` for
 * one wiring pattern (a single-file NDJSON default at
 * `.salt/attestations.ndjson`).
 */
export const SALT_STOP_HOOK_COMMAND = "npx salt-ds verify";

interface HookCommandEntry {
  type: "command";
  command: string;
}

interface SaltAgentHooksManifest {
  hooks: {
    PostToolUse?: HookCommandEntry[];
    SessionStart?: HookCommandEntry[];
    Stop?: HookCommandEntry[];
    [event: string]: HookCommandEntry[] | undefined;
  };
}

function buildDefaultSaltAgentHooks(): SaltAgentHooksManifest {
  return {
    hooks: {
      PostToolUse: [
        { type: "command", command: SALT_POST_TOOL_USE_HOOK_COMMAND },
      ],
      SessionStart: [
        { type: "command", command: SALT_SESSION_START_HOOK_COMMAND },
      ],
      Stop: [{ type: "command", command: SALT_STOP_HOOK_COMMAND }],
    },
  };
}

function isHookCommandEntry(value: unknown): value is HookCommandEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return record.type === "command" && typeof record.command === "string";
}

function ensureSaltCommand(
  entries: HookCommandEntry[],
  command: string,
): { entries: HookCommandEntry[]; changed: boolean } {
  if (entries.some((entry) => entry.command === command)) {
    return { entries, changed: false };
  }
  return {
    entries: [...entries, { type: "command", command }],
    changed: true,
  };
}

/**
 * Merge Salt-managed hook entries into an existing JSON manifest.
 *
 * - If `existing` is null/undefined/empty, returns the default scaffold.
 * - If `existing` already contains the Salt commands under PostToolUse and
 *   SessionStart, returns unchanged.
 * - Preserves any user-added entries for other events or other commands.
 * - Rejects malformed input by replacing the document with the default scaffold
 *   (we own this file via the marked relative path).
 */
export function mergeSaltAgentHooksManifest(existing: unknown): {
  content: SaltAgentHooksManifest;
  changed: boolean;
} {
  if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
    return { content: buildDefaultSaltAgentHooks(), changed: true };
  }

  const existingRecord = existing as Record<string, unknown>;
  const existingHooksValue = existingRecord.hooks;
  const existingHooks: Record<string, unknown> =
    existingHooksValue &&
    typeof existingHooksValue === "object" &&
    !Array.isArray(existingHooksValue)
      ? (existingHooksValue as Record<string, unknown>)
      : {};

  const merged: Record<string, HookCommandEntry[]> = {};
  let changed = false;

  for (const [event, raw] of Object.entries(existingHooks)) {
    if (Array.isArray(raw)) {
      const filtered = raw.filter(isHookCommandEntry);
      if (filtered.length !== raw.length) {
        changed = true;
      }
      merged[event] = filtered;
    } else if (raw !== undefined) {
      changed = true;
    }
  }

  const postToolUse = ensureSaltCommand(
    merged.PostToolUse ?? [],
    SALT_POST_TOOL_USE_HOOK_COMMAND,
  );
  if (postToolUse.changed || !merged.PostToolUse) {
    changed = true;
  }
  merged.PostToolUse = postToolUse.entries;

  const sessionStart = ensureSaltCommand(
    merged.SessionStart ?? [],
    SALT_SESSION_START_HOOK_COMMAND,
  );
  if (sessionStart.changed || !merged.SessionStart) {
    changed = true;
  }
  merged.SessionStart = sessionStart.entries;

  const stop = ensureSaltCommand(merged.Stop ?? [], SALT_STOP_HOOK_COMMAND);
  if (stop.changed || !merged.Stop) {
    changed = true;
  }
  merged.Stop = stop.entries;

  return { content: { hooks: merged }, changed };
}

