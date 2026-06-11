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

function expectAllConcepts(source: string, concepts: RegExp[]) {
  for (const concept of concepts) {
    expect(source).toMatch(concept);
  }
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

    expect(skill).toContain(
      "Use `references/shared/transport.md` for the full action map, degraded-tooling, completion, and CLI follow-through rules.",
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
    expect(repoInstructions).toContain(
      "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until the canonical workflow satisfies the hard gate; after editing, run the validation or review step.",
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
    expect(consumerAgents).toContain(
      "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until the canonical workflow satisfies the hard gate; after editing, run the validation or review step.",
    );
    expect(consumerAgents).toContain("keep the first result canonical-only");
    expect(consumerCopilotInstructions).toContain(
      "If compact create output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before implementing the blocked region.",
    );
    expect(repoInstructions).not.toContain(
      "canonical selection step and the validation step have completed successfully",
    );
    expect(consumerAgents).not.toContain(
      "canonical selection step and the validation step have completed successfully",
    );
  });

  it("keeps compact workflow follow-through aligned across the skill, transport contract, repo instructions, and consumer examples", async () => {
    const skill = await readSkill("salt-ds/SKILL.md");
    const core = await readSkill("salt-ds/references/shared/core.md");
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

    // The compact-output summary moved from SKILL.md into the always-loaded
    // references/shared/core.md as part of the PR 11.5 router trim. Skill +
    // core are loaded together, so the first-load contract is preserved.
    expect(skill).toContain("references/shared/core.md");
    expect(core).toContain(
      "Read compact workflow output from stable top-level workflow signals first:",
    );
    expect(core).toContain(
      "`status`, `safety`, `action`, `next_required_action`, `allowed_next_actions`, `recipe`, `questions`, `evidence`, and `summary`.",
    );
    expect(transport).toContain(
      "Read compact workflow output from top-level fields first:",
    );
    expect(repoInstructions).toContain(
      "if compact Salt output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before editing",
    );
    expect(consumerAgents).toContain(
      "if compact Salt output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before editing",
    );
    expect(consumerCopilotInstructions).toContain(
      "When Salt returns compact workflow output, read `status`, `safety.exact_request_safe`, `safety.blocking_reasons`, `action`, and `summary` first.",
    );
  });

  it("keeps v1 action semantics aligned across skill and host adapter guidance", async () => {
    const skill = await readSkill("salt-ds/SKILL.md");
    const core = await readSkill("salt-ds/references/shared/core.md");
    const transport = await readSkill("salt-ds/references/shared/transport.md");
    const copilotHosts = await readSkill(
      "salt-ds/references/shared/copilot-hosts.md",
    );
    const repoInstructions = await readSkill(
      "salt-ds/assets/repo-instructions.template.md",
    );
    const consumerAgents = await readRepoFile(
      "workflow-examples/consumer-repo/AGENTS.md",
    );
    const consumerCopilotInstructions = await readRepoFile(
      "workflow-examples/consumer-repo/.github/copilot-instructions.md",
    );

    // Action semantics moved into the always-loaded core; SKILL.md still
    // routes there.
    expect(core).toContain("Treat `salt_workflow_v1.action.kind` as binding");
    expect(skill).not.toContain(
      "Treat `salt_workflow_v1` action kinds as binding:",
    );
    expect(core).not.toContain(
      "Treat `salt_workflow_v1` action kinds as binding:",
    );
    expect(transport).toContain(
      "Treat `salt_workflow_v1` action kinds as binding:",
    );
    expect(copilotHosts).toContain(
      "Branch on compact `salt_workflow_v1.action.kind` before editing",
    );
    expect(repoInstructions).toContain(
      "Treat the compact `salt_workflow_v1` action as a command, not advice:",
    );
    expect(consumerAgents).toContain(
      "Treat the compact `salt_workflow_v1` action as a command, not advice:",
    );
    expect(consumerCopilotInstructions).toContain(
      "Treat the compact `salt_workflow_v1` action as binding: `ask_user` means ask and stop until the user provides updated input, `retrieve_entity`/`retrieve_examples` means gather evidence and rerun with the returned evidence bridge, `install_dependencies` means install packages and then rerun the originating workflow, and only `implement` permits editing Salt UI.",
    );
    expect(consumerCopilotInstructions).toContain(
      "For create entity follow-through, use MCP `resolved_entities` or CLI `--resolved-entity` on the rerun.",
    );
    expect(skill).not.toContain(
      "`install_dependencies`: install the listed Salt packages, then rerun the originating workflow; installing packages is not implementation permission",
    );
    expect(core).not.toContain(
      "`install_dependencies`: install the listed Salt packages, then rerun the originating workflow; installing packages is not implementation permission",
    );
    expect(transport).toContain(
      "`install_dependencies`: install the listed Salt packages, then rerun the originating workflow; installing packages is not implementation permission",
    );
    for (const source of [repoInstructions, consumerAgents]) {
      expect(source).toContain(
        '`action.kind: "install_dependencies"`: install the listed packages, then rerun the originating workflow; installing packages is not implementation permission',
      );
      expect(source).toContain(
        "installing Salt packages is not implementation permission",
      );
      expect(source).toContain(
        "for repo-aware workflow calls, pass a trusted `root_dir` or reuse a trusted `context_id` so package state and repo policy can be applied",
      );
      expect(source).toContain(
        "if `action.kind` is `ask_user`, stop and treat the user's answer as updated workflow input",
      );
    }
  });

  it("keeps anti-hallucination, hard gate, rerun, and review semantics on first-load skill surfaces", async () => {
    const skill = await readSkill("salt-ds/SKILL.md");
    const core = await readSkill("salt-ds/references/shared/core.md");
    const openAiMetadata = await readSkill("salt-ds/agents/openai.yaml");
    const transport = await readSkill("salt-ds/references/shared/transport.md");
    const copilotHosts = await readSkill(
      "salt-ds/references/shared/copilot-hosts.md",
    );
    const modes = await readSkill("salt-ds/references/shared/modes.md");
    const repoInstructions = await readSkill(
      "salt-ds/assets/repo-instructions.template.md",
    );
    const consumerAgents = await readRepoFile(
      "workflow-examples/consumer-repo/AGENTS.md",
    );
    const consumerCopilotInstructions = await readRepoFile(
      "workflow-examples/consumer-repo/.github/copilot-instructions.md",
    );

    const requiredConcepts = [
      /do not (?:guess|invent|hallucinate)[\s\S]+Salt APIs/i,
      /props[\s\S]+imports[\s\S]+package names[\s\S]+tokens/i,
      /status(?:`|\b)[\s\S]+success/i,
      /action\.kind(?:`|\b)[\s\S]+implement/i,
      /safety\.exact_request_safe(?:`|\b)[\s\S]+true/i,
      /evidence\.status(?:`|\b)[\s\S]+complete/i,
      /rerun (?:the )?originating workflow/i,
      /run (?:the returned )?review/i,
    ];

    // SKILL.md is now a thin router; the always-loaded behavior contract lives
    // in references/shared/core.md. The first-load surface is skill + core.
    const skillAndCore = `${skill}\n${core}`;
    for (const source of [
      skillAndCore,
      openAiMetadata,
      transport,
      copilotHosts,
      repoInstructions,
      consumerAgents,
      consumerCopilotInstructions,
    ]) {
      expectAllConcepts(source, requiredConcepts);
    }

    expectAllConcepts(modes, [
      /quick-check is not permission to implement create, migrate, or upgrade work/i,
      /Salt-specific props[\s\S]+verified through MCP or CLI evidence/i,
    ]);
  });

  it("keeps provider and theme bootstrap evidence-gated across first-load agent surfaces", async () => {
    const skill = await readSkill("salt-ds/SKILL.md");
    const core = await readSkill("salt-ds/references/shared/core.md");
    const openAiMetadata = await readSkill("salt-ds/agents/openai.yaml");
    const themeReference = await readSkill(
      "salt-ds/references/shared/theme.md",
    );
    const repoInstructions = await readSkill(
      "salt-ds/assets/repo-instructions.template.md",
    );
    const consumerAgents = await readRepoFile(
      "workflow-examples/consumer-repo/AGENTS.md",
    );
    const consumerCopilotInstructions = await readRepoFile(
      "workflow-examples/consumer-repo/.github/copilot-instructions.md",
    );

    const requiredThemeGuardrails = [
      /provider(?: and| or) theme bootstrap/i,
      /workflow (?:evidence|output)/i,
      /registry-backed generated context/i,
      /\.salt(?:`)? policy|\.salt(?:`)? project policy/i,
      /explicit user input/i,
      /pending or unsupported/i,
    ];
    const bannedStaticThemeFacts = [
      /SaltProviderNext/,
      /@salt-ds\/theme\/index\.css/,
      /@salt-ds\/theme\/css\/theme-next\.css/,
      /accent(?:=\\?")?teal/i,
      /corner(?:=\\?")?rounded/i,
      /headingFont/i,
      /actionFont/i,
      /Amplitude/,
    ];

    // Theme Evidence Rule moved into references/shared/core.md (always-loaded
    // alongside the SKILL.md router). The first-load surface is skill + core.
    const skillAndCore = `${skill}\n${core}`;
    for (const source of [
      skillAndCore,
      openAiMetadata,
      themeReference,
      repoInstructions,
      consumerAgents,
      consumerCopilotInstructions,
    ]) {
      expectAllConcepts(source, requiredThemeGuardrails);
      for (const bannedFact of bannedStaticThemeFacts) {
        expect(source).not.toMatch(bannedFact);
      }
    }
  });

  it("keeps explicit user nouns as evidence-backed unresolved requirements instead of magic inferred implementation", async () => {
    const skill = await readSkill("salt-ds/SKILL.md");
    const core = await readSkill("salt-ds/references/shared/core.md");
    const createRules = await readSkill("salt-ds/references/create/rules.md");
    const surfaceResolution = await readSkill(
      "salt-ds/references/shared/surface-resolution.md",
    );

    const skillAndCore = `${skill}\n${core}`;
    expectAllConcepts(skillAndCore, [
      /preserve explicit user nouns[\s\S]+unresolved requirements/i,
      /retrieve canonical evidence[\s\S]+do not implement those regions/i,
      /workflow contract or support evidence covers them/i,
    ]);
    expectAllConcepts(createRules, [
      /preserve explicit user nouns[\s\S]+unresolved requirements/i,
      /retrieve canonical evidence[\s\S]+do not implement those regions/i,
    ]);
    expect(surfaceResolution).toContain(
      "if a region remains unresolved after the canonical step, either keep it pending or ask instead of inventing a bespoke structure",
    );
  });

  it("keeps the Salt skill metadata agent agnostic for future host adapters", async () => {
    const skill = await readSkill("salt-ds/SKILL.md");
    const openAiMetadata = await readSkill("salt-ds/agents/openai.yaml");
    const description = skill.match(/^description: (.*)$/m)?.[1] ?? "";

    expect(description).toContain(
      "Agent-agnostic Salt design system workflow for Salt-specific create",
    );
    expect(description).toContain("review, migrate, upgrade");
    expect(description).toContain("Use only when @salt-ds packages");
    expect(description).toContain("leave non-Salt work to the host");
    expect(description).not.toMatch(
      /\b(?:React|CSS|TypeScript|build|test|CI|debugging|generic repo)\b/i,
    );
    expect(description).not.toMatch(
      /\b(?:AI agent|ChatGPT|Copilot|Claude|Codex)\b/i,
    );
    expect(openAiMetadata).toContain(
      "agent-agnostic Salt design system workflow",
    );
  });
});
