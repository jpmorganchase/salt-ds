export const SALT_REPO_INSTRUCTIONS_BLOCK_START =
  "<!-- salt-ds:repo-instructions:start -->";
export const SALT_REPO_INSTRUCTIONS_BLOCK_END =
  "<!-- salt-ds:repo-instructions:end -->";

const SALT_REPO_INSTRUCTIONS_LINES = [
  "Use the Salt MCP for canonical Salt guidance.",
  "",
  "Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.",
  "",
  "When working in the IDE, prioritize these Salt jobs in order: review current UI, upgrade current Salt usage, migrate attached or referenced non-Salt UI, then create bounded new UI.",
  "",
  "Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.",
  "",
  "Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.",
  "",
  "For Salt UI tasks, complete:",
  "",
  "- a canonical Salt selection step through Salt MCP or the Salt CLI fallback",
  "- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
  "- if the workflow output says stronger grounding is needed, follow the returned canonical Salt follow-up before editing",
  "- if a broad create result includes `composition_contract.expected_patterns` or `expected_components`, treat those named items as required Salt follow-through and run the matching Salt create follow-up before implementing those sub-surfaces",
  "- when a Salt workflow result includes `result.ide_summary`, use that compact summary first and expand the raw workflow fields only when needed",
  "",
  "Do not inspect `node_modules`, copied app code, or generic web examples to choose Salt-specific components, patterns, tokens, props, or layout structures.",
  "",
  "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until the canonical selection step and the validation step have completed successfully.",
  "",
  "If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first result canonical-only and recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.",
  "",
  "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
  "",
  "Before considering Salt UI work complete, run the repo `ui:verify` script when it exists, or run `salt-ds review` directly.",
  "",
  "If this Salt-managed block or the generated host adapter files look stale, rerun the Salt bootstrap workflow or `salt-ds init` to refresh the managed Salt guidance instead of hand-rewriting it.",
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
    "- if a broad create result includes `composition_contract.expected_patterns` or `expected_components`, treat those named items as required Salt follow-through and run the matching Salt create follow-up before implementing those sub-surfaces",
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
    "- if the workflow output says stronger grounding is needed, follow the returned canonical Salt follow-up before editing",
    "- if a broad create result includes `composition_contract.expected_patterns` or `expected_components`, treat those named items as required Salt follow-through and run the matching Salt create follow-up before implementing those sub-surfaces",
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
];

export const VSCODE_COPILOT_BLOCK_START =
  "<!-- salt-ds:copilot-instructions:start -->";
export const VSCODE_COPILOT_BLOCK_END =
  "<!-- salt-ds:copilot-instructions:end -->";
export const VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE = [
  VSCODE_COPILOT_BLOCK_START,
  "# Salt UI Workflow",
  "",
  "Follow the repo root `AGENTS.md` as the primary Salt workflow contract.",
  "",
  "- In the IDE, prefer Salt jobs in this order: review, upgrade, migrate, then create.",
  "- When Salt returns `result.ide_summary`, render that compact summary first and use the rest of the workflow payload as supporting detail.",
  "- For broad prompts such as `create a dashboard`, `add tabs`, `add a table`, or `fix this layout`, use the Salt workflow before editing.",
  "- If a broad create result includes `composition_contract.expected_patterns` or `expected_components`, treat those named items as required Salt follow-through and run the matching Salt create follow-up before implementing those regions.",
  "- Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.",
  "- If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first answer canonical-only and recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.",
  "- Prefer the repo Salt UI agent in `.github/agents/salt-ui.agent.md` for those broad Salt UI tasks when your host supports custom agents.",
  "- Do not use `node_modules`, copied app code, or generic web examples as canonical Salt guidance.",
  "- Validate with the repo `ui:verify` script when it exists, or run `salt-ds review` directly, before considering Salt UI work done.",
  "- If the Salt-managed repo guidance or generated host adapter files look stale, rerun the Salt bootstrap workflow or `salt-ds init` to refresh them instead of hand-rewriting them.",
  "- If Salt MCP and the Salt CLI are both unavailable, stop instead of improvising Salt-specific React/CSS/HTML.",
  VSCODE_COPILOT_BLOCK_END,
  "",
].join("\n");

export const VSCODE_SALT_UI_AGENT_MARKER = "<!-- salt-ds:agent:v1 -->";
export const VSCODE_SALT_UI_AGENT_TEMPLATE = [
  "---",
  'name: "Salt UI"',
  'description: "Use Salt workflows for dashboards, tabs, tables, layouts, forms, dialogs, and other Salt UI tasks in this repo."',
  "target: vscode",
  "---",
  "",
  VSCODE_SALT_UI_AGENT_MARKER,
  "",
  "Follow the repo root `AGENTS.md` as the primary Salt workflow contract.",
  "",
  "Use this agent when the task touches dashboards, tabs, tables, metrics, navigation, forms, dialogs, layouts, or other Salt UI work.",
  "",
  "Required workflow:",
  "1. In the IDE, prefer Salt jobs in this order: review, upgrade, migrate, then create.",
  "2. When Salt returns `result.ide_summary`, render that compact summary first and keep the raw workflow fields as supporting detail.",
  "3. For broad asks such as `create a dashboard`, `add tabs`, `add a table`, or `fix this layout`, keep the task in Salt workflow mode instead of falling back to generic React/CSS/HTML.",
  "4. If a broad create result includes `composition_contract.expected_patterns` or `expected_components`, treat those named items as required Salt follow-through and run the matching Salt create follow-up before implementing those regions.",
  "5. Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.",
  "6. Ground the task in canonical Salt guidance first through Salt MCP, or the Salt CLI fallback if MCP is unavailable.",
  "7. Apply repo conventions only after the canonical Salt choice is clear.",
  "8. If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first answer canonical-only and recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.",
  "9. Validate with the Salt review workflow, the repo `ui:verify` script, or `salt-ds review` before treating the task as done.",
  "10. If the Salt-managed repo guidance or generated host adapter files look stale, rerun the Salt bootstrap workflow or `salt-ds init` to refresh them instead of hand-rewriting them.",
  "",
  "Do not use `node_modules`, copied app code, or generic web examples as canonical Salt guidance.",
  "If Salt grounding is unavailable, stop and ask rather than improvising generic React/CSS/HTML.",
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
