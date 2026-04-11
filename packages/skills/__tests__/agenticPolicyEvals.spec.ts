import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(skillsRoot, "..", "..");

async function readSkill(relativePath: string) {
  return fs.readFile(path.join(skillsRoot, relativePath), "utf8");
}

async function readRepoFile(relativePath: string) {
  return fs.readFile(path.join(repoRoot, relativePath), "utf8");
}

describe("deterministic agentic policy evals", () => {
  it("keeps the MCP to CLI fallback contract aligned across the skill, transport contract, repo instructions, and consumer example", async () => {
    const skill = await readSkill("salt-ds/SKILL.md");
    const transport = await readSkill("salt-ds/references/shared/transport.md");
    const repoInstructions = await readSkill(
      "salt-ds/assets/repo-instructions.template.md",
    );
    const consumerAgents = await readRepoFile(
      "workflow-examples/consumer-repo/AGENTS.md",
    );
    const consumerCopilotInstructions = await readRepoFile(
      "workflow-examples/consumer-repo/.github/copilot-instructions.md",
    );
    const consumerSaltUiAgent = await readRepoFile(
      "workflow-examples/consumer-repo/.github/agents/salt-ui.agent.md",
    );

    expect(skill).toContain(
      "if MCP is unavailable, explicitly switch to CLI fallback instead of acting as though canonical guidance succeeded",
    );
    expect(transport).toContain("Prefer Salt MCP when it is available.");
    expect(transport).toContain(
      "If Salt MCP is unavailable, keep the same workflow and let the environment fall back to the Salt CLI.",
    );
    expect(transport).toContain(
      "If both MCP and CLI fail, resolve the blocker or ask the user before proceeding.",
    );
    expect(transport).toContain(
      "raw image attachments only after the host or adapter has normalized them into structured migration evidence",
    );
    expect(transport).toContain(
      "`salt-ds migrate [query] --source-outline <path>` when migration starts from a mockup or rough design outline",
    );
    expect(repoInstructions).toContain(
      "- a canonical Salt selection step through Salt MCP or the Salt CLI fallback",
    );
    expect(repoInstructions).toContain(
      "- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
    );
    expect(repoInstructions).toContain(
      "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
    );
    expect(repoInstructions).toContain(
      "Do not send raw image attachments directly to Salt MCP.",
    );
    expect(repoInstructions).toContain(
      "If both Salt MCP and the Salt CLI are unavailable or failing, stop, resolve the blocker, or ask the user before proceeding.",
    );
    expect(consumerAgents).toContain(
      "- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
    );
    expect(consumerAgents).toContain(
      "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
    );
    expect(consumerAgents).toContain(
      "Do not send raw image attachments directly to Salt MCP.",
    );
    expect(consumerAgents).toContain(
      "If both Salt MCP and the Salt CLI are unavailable or failing, stop, resolve the blocker, or ask the user before proceeding.",
    );
    expect(consumerAgents).toContain("keep the first result canonical-only");
    expect(consumerCopilotInstructions).toContain(
      "If compact create output is `blocked`, `partial`, or `safe_to_implement_exact_request: false`, follow the returned `next_step` before implementing the blocked region.",
    );
    expect(consumerSaltUiAgent).toContain(
      "If compact create output is `blocked`, `partial`, or `safe_to_implement_exact_request: false`, follow the returned `next_step` before implementing the blocked region.",
    );
  });

  it("keeps compact workflow follow-through aligned across the skill, transport contract, repo instructions, and consumer examples", async () => {
    const skill = await readSkill("salt-ds/SKILL.md");
    const transport = await readSkill("salt-ds/references/shared/transport.md");
    const repoInstructions = await readSkill(
      "salt-ds/assets/repo-instructions.template.md",
    );
    const consumerAgents = await readRepoFile(
      "workflow-examples/consumer-repo/AGENTS.md",
    );
    const consumerCopilotInstructions = await readRepoFile(
      "workflow-examples/consumer-repo/.github/copilot-instructions.md",
    );
    const consumerSaltUiAgent = await readRepoFile(
      "workflow-examples/consumer-repo/.github/agents/salt-ui.agent.md",
    );

    expect(skill).toContain("## Compact Contract First");
    expect(transport).toContain(
      "read `workflow_status`, `safe_to_implement_exact_request`, `blocking_reasons`, `next_step`, and `summary` first",
    );
    expect(repoInstructions).toContain(
      "if compact Salt output is `blocked`, `partial`, or `safe_to_implement_exact_request: false`, follow the returned top-level `next_step` before editing",
    );
    expect(consumerAgents).toContain(
      "if compact Salt output is `blocked`, `partial`, or `safe_to_implement_exact_request: false`, follow the returned top-level `next_step` before editing",
    );
    expect(consumerCopilotInstructions).toContain(
      "When Salt returns compact workflow output, read `summary`, `workflow_status`, `safe_to_implement_exact_request`, `blocking_reasons`, and `next_step` first.",
    );
    expect(consumerSaltUiAgent).toContain(
      "When Salt returns compact workflow output, read `summary`, `workflow_status`, `safe_to_implement_exact_request`, `blocking_reasons`, and `next_step` first.",
    );
  });
});
