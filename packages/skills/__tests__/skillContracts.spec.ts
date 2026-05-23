import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildThemeReferenceMarkdown } from "@salt-ds/semantic-core";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsRoot = path.resolve(__dirname, "..");

async function readSkill(relativePath: string) {
  return fs.readFile(path.join(skillsRoot, relativePath), "utf8");
}

async function readRepoFile(relativePath: string) {
  return fs.readFile(
    path.resolve(skillsRoot, "..", "..", relativePath),
    "utf8",
  );
}

function normalizeLineEndings(content: string): string {
  return content.replace(/\r\n/g, "\n");
}

function readOpenAiDefaultPrompt(content: string): string {
  const match = content.match(/default_prompt:\s*>-\r?\n((?: {4}.+(?:\r?\n|$))+)/);
  return (match?.[1] ?? "").replace(/^ {4}/gm, "").trim();
}

describe("Salt skill contracts", () => {
  it("keeps salt-ds as the only public skill in the collection", async () => {
    const publicSkillEntries = await fs.readdir(skillsRoot, {
      withFileTypes: true,
    });

    expect(
      publicSkillEntries
        .filter(
          (entry) =>
            entry.isDirectory() &&
            !["__tests__", "node_modules"].includes(entry.name) &&
            !entry.name.startsWith("."),
        )
        .map((entry) => entry.name)
        .sort(),
    ).toEqual(["salt-ds"]);
  });

  it("keeps salt-ds self-contained with a workflow-based reference layout", async () => {
    const readme = await readSkill("README.md");
    const agents = await readSkill("AGENTS.md");
    const primarySkill = await readSkill("salt-ds/SKILL.md");
    const openAiMetadata = await readSkill("salt-ds/agents/openai.yaml");
    const createRules = await readSkill("salt-ds/references/create/rules.md");
    const createWorkflow = await readSkill(
      "salt-ds/references/create/workflow.md",
    );
    const reviewRules = await readSkill("salt-ds/references/review/rules.md");
    const reviewRubric = await readSkill("salt-ds/references/review/rubric.md");
    const migrateRules = await readSkill("salt-ds/references/migrate/rules.md");
    const migrateWorkflow = await readSkill(
      "salt-ds/references/migrate/workflow.md",
    );
    const conventionsContract = await readSkill(
      "salt-ds/references/conventions/contract.md",
    );
    const sharedSurfaces = await readSkill(
      "salt-ds/references/shared/surfaces.md",
    );
    const designPrinciples = await readSkill(
      "salt-ds/references/shared/design-principles.md",
    );
    const sharedTheme = await readSkill("salt-ds/references/shared/theme.md");
    const transport = await readSkill("salt-ds/references/shared/transport.md");
    const repoInstructionsTemplate = await readSkill(
      "salt-ds/assets/repo-instructions.template.md",
    );
    const bootstrapScaffolding = await readRepoFile(
      "packages/semantic-core/src/bootstrapScaffolding.ts",
    );
    const openAiDefaultPrompt = readOpenAiDefaultPrompt(openAiMetadata);

    expect(readme).toContain("## Public Skill");
    expect(readme).toContain("`salt-ds`");
    expect(readme).not.toContain("## Internal Workflow Modules");
    expect(agents).toContain("`salt-ds`");
    expect(agents).not.toContain("`salt-ui-builder`");
    expect(agents).not.toContain("`salt-ui-reviewer`");
    expect(agents).not.toContain("`salt-migration-helper`");
    expect(agents).not.toContain("`salt-project-conventions`");
    expect(openAiMetadata).toContain('display_name: "Salt DS"');
    expect(openAiMetadata).toContain(
      'short_description: "evidence-first, agent-agnostic Salt design system workflow for create, review, migrate, upgrade, bootstrap, quick checks, and accessibility audits"',
    );
    expect(openAiDefaultPrompt).toContain(
      "Gold path: choose init, create, review, migrate, or upgrade",
    );
    expect(openAiDefaultPrompt).toContain(
      "for repo-aware work establish trusted project context through Salt MCP or salt-ds info --json before choosing Salt-specific structure",
    );
    expect(openAiDefaultPrompt).toContain(
      "Hard Gate: do not edit Salt UI for create, migrate, or upgrade implementation work unless the current workflow contract has status: success, action.kind: implement, safety.exact_request_safe: true, and evidence.status: complete.",
    );
    expect(openAiDefaultPrompt).toContain(
      "Action Loop: stop and wait when action.kind is ask_user",
    );
    expect(openAiDefaultPrompt).toContain(
      "stop and wait when action.kind is ask_user",
    );
    expect(openAiDefaultPrompt).toContain(
      "treat the answer as updated workflow input",
    );
    expect(openAiDefaultPrompt).toContain(
      "Preserve explicit user nouns as unresolved requirements until the workflow contract or support evidence covers them.",
    );
    expect(openAiDefaultPrompt).toContain(
      "Use explore-options only when the user explicitly asks for alternatives.",
    );
    expect(openAiDefaultPrompt).toContain(
      "Load detailed behavior from SKILL.md and the smallest relevant reference files.",
    );
    expect(openAiDefaultPrompt.length).toBeLessThan(2300);
    expect(primarySkill).toContain("## Trigger Boundary");
    expect(primarySkill).toContain(
      "description: Agent-agnostic Salt design system workflow for Salt-specific create, review, migrate, upgrade, init, quick-check, accessibility audits, repo conventions, and UI composition/layout work in consumer repos.",
    );
    expect(primarySkill).toContain(
      "Use only when @salt-ds packages, .salt policy, Salt MCP/CLI, or explicit Salt adoption is involved; leave non-Salt work to the host.",
    );
    expect(primarySkill.match(/^description: (.*)$/m)?.[1] ?? "").not.toMatch(
      /\b(?:React|CSS|TypeScript|build|test|CI|debugging|generic repo)\b/i,
    );
    expect(primarySkill).toContain("## Example Triggers");
    expect(primarySkill).toContain("## No Salt Invention Rule");
    expect(primarySkill).toContain("## Hard Gate");
    expect(primarySkill).toContain("## Action Loop");
    expect(primarySkill).toContain("## Project Context First");
    expect(primarySkill).toContain("Route by user job, not by IDE presence:");
    expect(primarySkill).not.toContain("## IDE-First Job Order");
    expect(primarySkill).toContain(
      "Do not use this skill for generic React, CSS, accessibility, or product-design work that does not require Salt-specific guidance.",
    );
    expect(primarySkill).toContain(
      "Review this Salt dialog and tell me the safest next fix.",
    );
    expect(primarySkill).toContain(
      "Create a Salt-native dashboard page for this feature.",
    );
    expect(primarySkill).toContain("## Reference Routing");
    expect(primarySkill).toContain(
      "Keep one public workflow surface: `init`, `create`, `review`, `migrate`, `upgrade`.",
    );
    expect(primarySkill).toContain(
      "Use `references/shared/transport.md` for the full action map, degraded-tooling, completion, and CLI follow-through rules.",
    );
    expect(primarySkill).toContain(
      "For repo-aware work, establish trusted project context first",
    );
    expect(primarySkill).toContain(
      "If `action.kind` is `ask_user`, stop and wait for the user answer; treat the answer as a new or updated workflow input, not as an evidence bridge.",
    );
    expect(primarySkill).toContain(
      'For create entity follow-through, pass MCP `resolved_entities: ["Name"]` or CLI `--resolved-entity Name`.',
    );
    expect(primarySkill).toContain(
      "Read compact workflow output from stable top-level workflow signals first: `status`, `safety`, `action`, `next_required_action`, `allowed_next_actions`, `recipe`, `questions`, `evidence`, and `summary`.",
    );
    expect(primarySkill).toContain(
      "Preserve explicit user nouns that are not yet covered as unresolved requirements.",
    );
    expect(primarySkill).toContain(
      "Treat `salt_workflow_v1.action.kind` as binding: perform exactly the returned action, and only edit when the Hard Gate is satisfied.",
    );
    expect(primarySkill).toContain(
      "Do not edit Salt UI for `create`, `migrate`, or `upgrade` implementation work unless the current workflow contract has all of these fields:",
    );
    expect(primarySkill).not.toContain(
      "Treat `salt_workflow_v1` action kinds as binding:",
    );
    expect(primarySkill).not.toContain(
      "`install_dependencies`: install the listed Salt packages, then rerun the originating workflow; installing packages is not implementation permission",
    );
    expect(primarySkill).not.toContain(
      "If compact `create` output is `blocked`, `partial`, or not yet safe for the exact request, follow the returned action before implementing the blocked region.",
    );
    expect(primarySkill).not.toContain("or an answered `ask_user`");
    expect(primarySkill).not.toContain("`ask_user` asks, `retrieve_entity`");
    expect(primarySkill).toContain(
      "Do not claim a Salt workflow completed merely because the host emitted a large payload.",
    );
    expect(primarySkill).toContain("references/shared/transport.md");
    expect(primarySkill).toContain("references/shared/theme.md");
    expect(primarySkill).toContain("references/shared/surfaces.md");
    expect(primarySkill).toContain("references/shared/design-principles.md");
    expect(primarySkill).toContain("references/create/rules.md");
    expect(primarySkill).toContain("references/review/rubric.md");
    expect(primarySkill).toContain("references/migrate/workflow.md");
    expect(primarySkill).toContain("references/conventions/contract.md");
    expect(primarySkill).not.toContain("references/create-rules.md");
    expect(primarySkill).not.toContain("references/review-rules.md");
    expect(primarySkill).not.toContain("references/migration-rules.md");
    expect(primarySkill).not.toContain(
      "references/canonical-salt-tool-surfaces.md",
    );
    expect(primarySkill).not.toContain("references/builder/");
    expect(primarySkill).not.toContain("references/reviewer/");
    expect(primarySkill).not.toContain("references/migration/");
    expect(primarySkill).not.toContain("references/project-conventions/");
    expect(createRules).toContain("create-task-first");
    expect(createRules).toContain("create-verify-named-salt-details");
    expect(createRules).toContain(
      "if compact `create` output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before implementing the blocked sub-surface",
    );
    expect(createRules).toContain(
      "branch on `salt_workflow_v1.action.kind`: `ask_user` asks and stops until the user provides updated input, `retrieve_entity` or `retrieve_examples` gathers evidence and reruns with the returned evidence bridge, `install_dependencies` installs packages and then reruns the workflow, and only `implement` allows Salt UI edits",
    );
    expect(createRules).toContain(
      "installing Salt packages is not implementation permission",
    );
    expect(createRules).toContain(
      "do not translate concrete follow-up asks into abstract category prose",
    );
    expect(createRules).toContain(
      "if an exact Salt target name is already known",
    );
    expect(createRules).toContain(
      "preserve explicit user nouns that are not yet covered as unresolved requirements",
    );
    expect(createRules).toContain(
      "0. Obtain canonical Salt guidance via MCP (`create_salt_ui`) or CLI (`salt-ds create`) and do not proceed until the result is complete enough for the regions you plan to implement.",
    );
    expect(createWorkflow).toContain("workflow-directed grounding follow-ups");
    expect(createWorkflow).toContain(
      "follow the returned top-level `action` before building the blocked region.",
    );
    expect(createWorkflow).toContain(
      "Branch on `salt_workflow_v1.action.kind`: `ask_user` asks and stops until the user provides updated input, `retrieve_entity`/`retrieve_examples` gathers evidence and reruns with the returned evidence bridge, `install_dependencies` installs packages and then reruns the workflow, and only `implement` permits Salt UI edits.",
    );
    expect(createWorkflow).toContain(
      "Request `full` output only when `action` or `safety.blocking_reasons` indicate you need deeper artifacts",
    );
    expect(createWorkflow).toContain(
      "State an assumption only after the workflow satisfies the implementation gate",
    );
    const createOutput = await readSkill("salt-ds/references/create/output.md");
    expect(createOutput).toContain(
      "the exact name was verified against canonical Salt guidance",
    );
    expect(createOutput).toContain(
      "If provider or theme bootstrap was recommended, note whether repo policy and asset availability were confirmed, still pending, or explicitly overridden.",
    );
    expect(createOutput).toContain(
      "If you needed `full` workflow output, note which deeper artifacts were inspected and why the compact contract was not sufficient on its own.",
    );
    expect(normalizeLineEndings(sharedTheme).trim()).toBe(
      normalizeLineEndings(buildThemeReferenceMarkdown()).trim(),
    );
    expect(reviewRules).toContain("review-migration-upgrade-risk");
    expect(reviewRules).toContain(
      "do not propose Salt-specific fixes, replacements, or code until canonical Salt guidance has been obtained via MCP or CLI",
    );
    expect(reviewRubric).toContain("## severity guide");
    expect(migrateRules).toContain("migrate-confirm-workflow-deltas");
    expect(migrateRules).toContain(
      "0. Obtain canonical Salt guidance via MCP (`migrate_to_salt` or `upgrade_salt_ui`) or CLI (`salt-ds migrate` or `salt-ds upgrade`) before proposing Salt-specific migration output.",
    );
    expect(migrateWorkflow).toContain("## 2. map the upgrade impact");
    expect(migrateWorkflow).toContain(
      "Do not treat raw image attachments as direct MCP inputs.",
    );
    const migrateGotchas = await readSkill(
      "salt-ds/references/migrate/gotchas.md",
    );
    expect(migrateGotchas).toContain(
      "Do not overclaim from screenshots or mockups.",
    );
    expect(migrateGotchas).toContain(
      "Do not treat raw image attachments as direct Salt inputs.",
    );
    expect(conventionsContract).toContain("## Merge Order");
    const conventionExamples = await readSkill(
      "salt-ds/references/conventions/examples.md",
    );
    const reviewDebug = await readSkill("salt-ds/references/review/debug.md");
    expect(conventionExamples).toContain("## Contents");
    expect(reviewDebug).toContain("## Contents");
    expect(sharedSurfaces).toContain("## Dashboard Or Overview Page");
    expect(sharedSurfaces).toContain("## Table Plus Filters");
    expect(sharedSurfaces).toContain(
      "## Loading, Empty, Error, And Success States",
    );
    expect(designPrinciples).toContain("## Task-First Composition");
    expect(designPrinciples).toContain("## Layout Ownership");
    expect(designPrinciples).toContain("## Ask Instead Of Guess");
    expect(transport).toContain("Salt MCP");
    expect(transport).toContain(
      "Read compact workflow output from top-level fields first:",
    );
    expect(transport).toContain(
      "Treat `salt_workflow_v1` action kinds as binding:",
    );
    expect(transport).toContain(
      "`install_dependencies`: install the listed Salt packages, then rerun the originating workflow; installing packages is not implementation permission",
    );
    expect(transport).toContain(
      "`ask_user`: stop and ask the returned question before writing code; when the user answers, treat it as a new or updated workflow input, not as an evidence bridge",
    );
    expect(transport).toContain(
      'For create entity follow-through, the evidence bridge is MCP `resolved_entities: ["Name"]` or CLI `--resolved-entity Name`.',
    );
    expect(transport).toContain(
      "Action Loop: establish trusted project context for repo-aware work",
    );
    expect(transport).toContain(
      "Hard Gate: do not edit Salt UI for `create`, `migrate`, or `upgrade` implementation work unless the current workflow contract has `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete`.",
    );
    expect(transport).toContain(
      "`salt-ds migrate [query] --source-outline <path>` when migration starts from a mockup or rough design outline that should be converted into structured evidence before translation",
    );
    expect(transport).toContain(
      "raw image attachments only after the host or adapter has normalized them into structured migration evidence",
    );
    expect(transport).toContain(
      "If Salt-managed repo instructions or host adapter files may be stale, rerun `bootstrap_salt_repo` or `salt-ds init` to refresh the managed Salt blocks instead of hand-rewriting them.",
    );
    expect(repoInstructionsTemplate).toContain("salt-ds review");
    expect(repoInstructionsTemplate).toContain(
      "keep the first result canonical-only",
    );
    expect(repoInstructionsTemplate).toContain(
      "rerun the Salt bootstrap workflow or `salt-ds init` to refresh the managed Salt guidance instead of hand-rewriting it.",
    );
    expect(repoInstructionsTemplate).toContain(
      "recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.",
    );
    expect(repoInstructionsTemplate).toContain(
      "a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
    );
    expect(repoInstructionsTemplate).toContain(
      "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until the canonical workflow satisfies the hard gate; after editing, run the validation or review step.",
    );
    expect(repoInstructionsTemplate).toContain(
      "for repo-aware workflow calls, pass a trusted `root_dir` or reuse a trusted `context_id` so package state and repo policy can be applied",
    );
    expect(repoInstructionsTemplate).toContain(
      '`action.kind: "ask_user"`: stop and ask the returned question; do not edit or rerun unchanged; treat the user\'s answer as updated workflow input',
    );
    expect(repoInstructionsTemplate).toContain(
      "MCP `resolved_entities` or CLI `--resolved-entity` for create entity follow-through",
    );
    expect(repoInstructionsTemplate).not.toContain(
      "canonical selection step and the validation step have completed successfully",
    );
    expect(repoInstructionsTemplate).toContain(
      "if compact Salt output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before editing",
    );
    expect(repoInstructionsTemplate).toContain(
      "use the compact Salt contract first: `status`, `safety.exact_request_safe`, `safety.blocking_reasons`, `action`, `next_required_action`, `allowed_next_actions`, `recipe`, `questions`, `evidence`, and `summary`",
    );
    expect(repoInstructionsTemplate).toContain(
      "Treat the compact `salt_workflow_v1` action as a command, not advice:",
    );
    expect(repoInstructionsTemplate).toContain(
      "Do not send raw image attachments directly to Salt MCP.",
    );
    expect(normalizeLineEndings(repoInstructionsTemplate)).toContain(
      normalizeLineEndings("<!-- salt-ds:repo-instructions:start -->"),
    );
    expect(repoInstructionsTemplate).not.toContain("entity-grounding step");
    expect(bootstrapScaffolding).toContain(
      "if compact Salt output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before editing",
    );
    expect(bootstrapScaffolding).toContain(
      "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until the canonical workflow satisfies the hard gate; after editing, run the validation or review step.",
    );
    expect(bootstrapScaffolding).toContain(
      "for repo-aware workflow calls, pass a trusted `root_dir` or reuse a trusted `context_id` so package state and repo policy can be applied",
    );
  });

  it("keeps the transport contract and consumer example aligned with the workflow-first CLI story", async () => {
    const contract = await readSkill("salt-ds/references/shared/transport.md");
    const consumerExampleAgents = await readRepoFile(
      "workflow-examples/consumer-repo/AGENTS.md",
    );

    expect(contract).toContain("salt-ds info --json");
    expect(contract).toContain("salt-ds init");
    expect(contract).toContain("salt-ds create");
    expect(contract).toContain("salt-ds review");
    expect(contract).toContain("salt-ds migrate");
    expect(contract).toContain("salt-ds upgrade");
    expect(contract).toContain("salt-ds doctor");
    expect(contract).toContain("salt-ds runtime inspect");
    expect(contract).toContain("salt-ds review <path> --url <url>");
    expect(contract).toContain(
      "Do not select Salt components, patterns, props, tokens, plans, or code until the canonical Salt step succeeds through MCP or CLI.",
    );
    expect(contract).toContain(
      "If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first result canonical-only and recommend bootstrap only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.",
    );
    expect(contract).toContain(
      "If both MCP and CLI fail, resolve the blocker or ask the user before proceeding.",
    );
    expect(consumerExampleAgents).toContain("salt-ds doctor");
    expect(consumerExampleAgents).toContain(
      "salt-ds review <path> --url <url>",
    );
    expect(consumerExampleAgents).toContain("salt-ds runtime inspect <url>");
    expect(consumerExampleAgents).toContain(
      "keep the first result canonical-only",
    );
    expect(consumerExampleAgents).toContain(
      "a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
    );
    expect(consumerExampleAgents).toContain(
      "Do not send raw image attachments directly to Salt MCP.",
    );
    expect(consumerExampleAgents).not.toContain("salt lint");
    expect(consumerExampleAgents).not.toContain("salt doctor");
    expect(consumerExampleAgents).not.toContain("salt runtime inspect <url>");
  });
});
