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
            !["__tests__"].includes(entry.name) &&
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
      'short_description: "salt design system workflow for quick checks, create, review, migrate, upgrade, bootstrap, and accessibility audits"',
    );
    expect(openAiMetadata).toContain(
      "Start deep or repo-spanning work from project context through Salt MCP or salt-ds info --json before choosing Salt-specific structure.",
    );
    expect(openAiMetadata).toContain(
      "When create or review returns expected_patterns, expected_components, required_follow_through, implementation_gate, or open questions, resolve that follow-through before finalizing those regions.",
    );
    expect(openAiMetadata).toContain(
      "Preserve concrete user nouns in follow-up create calls.",
    );
    expect(openAiMetadata).toContain(
      "Only use explore-options when the user explicitly wants alternatives.",
    );
    expect(primarySkill).toContain("## Trigger Boundary");
    expect(primarySkill).toContain("## Example Triggers");
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
    expect(primarySkill.split("\n").slice(0, 120).join("\n")).toContain(
      "## Reference Routing",
    );
    expect(primarySkill).toContain(
      "Read compact workflow output from top-level fields first:",
    );
    expect(primarySkill).toContain(
      "Do not paraphrase concrete follow-up asks into abstract taxonomy prompts.",
    );
    expect(primarySkill).toContain(
      "If an exact Salt target name is already known from canonical output, use that exact name or verified alias in the next call.",
    );
    expect(primarySkill).toContain(
      "if MCP is unavailable, explicitly switch to CLI fallback instead of acting as though canonical guidance succeeded",
    );
    expect(primarySkill).toContain(
      "if output is truncated, malformed, semantically off-target, or repeatedly misroutes to unrelated patterns, fail closed",
    );
    expect(primarySkill).toContain(
      "If compact `create` output is `blocked`, `partial`, or `safe_to_implement_exact_request: false`, follow the returned `next_step` before implementing the blocked region.",
    );
    expect(primarySkill).toContain(
      "do not claim a Salt workflow completed merely because the host emitted a large payload",
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
      "if compact `create` output is `blocked`, `partial`, or `safe_to_implement_exact_request: false`, follow the returned top-level `next_step` before implementing the blocked sub-surface",
    );
    expect(createRules).toContain(
      "do not translate concrete follow-up asks into abstract category prose",
    );
    expect(createRules).toContain(
      "if an exact Salt target name is already known",
    );
    expect(createRules).toContain(
      "0. Obtain canonical Salt guidance via MCP (`create_salt_ui`) or CLI (`salt-ds create`) and do not proceed until the result is complete enough for the regions you plan to implement.",
    );
    expect(createWorkflow).toContain("workflow-directed grounding follow-ups");
    expect(createWorkflow).toContain(
      "follow the returned top-level `next_step` before building the blocked region.",
    );
    expect(createWorkflow).toContain(
      "Request `full` output only when `next_step` or `blocking_reasons` indicate you need deeper artifacts",
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
      "read `workflow_status`, `safe_to_implement_exact_request`, `blocking_reasons`, `next_step`, and `summary` first",
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
      "if compact Salt output is `blocked`, `partial`, or `safe_to_implement_exact_request: false`, follow the returned top-level `next_step` before editing",
    );
    expect(repoInstructionsTemplate).toContain(
      "use the compact Salt contract first: `workflow_status`, `safe_to_implement_exact_request`, `blocking_reasons`, `next_step`, and `summary`",
    );
    expect(repoInstructionsTemplate).toContain(
      "Do not send raw image attachments directly to Salt MCP.",
    );
    expect(normalizeLineEndings(repoInstructionsTemplate)).toContain(
      normalizeLineEndings("<!-- salt-ds:repo-instructions:start -->"),
    );
    expect(repoInstructionsTemplate).not.toContain("entity-grounding step");
    expect(bootstrapScaffolding).toContain(
      "if compact Salt output is `blocked`, `partial`, or `safe_to_implement_exact_request: false`, follow the returned top-level `next_step` before editing",
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
