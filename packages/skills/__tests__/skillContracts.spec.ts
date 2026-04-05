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
      'short_description: "Salt design system workflow for review, upgrade, migrate, create, and bootstrap"',
    );
    expect(openAiMetadata).toContain(
      "If both .salt/team.json and .salt/stack.json are missing, keep the first result canonical-only",
    );
    expect(openAiMetadata).toContain(
      "implementation_gate with follow-through required",
    );
    expect(openAiMetadata).toContain(
      "Do not use this skill for generic React/CSS work that does not require Salt.",
    );
    expect(primarySkill).toContain("## Trigger Boundary");
    expect(primarySkill).toContain("## Example Triggers");
    expect(primarySkill).toContain("## What Salt Handles Best");
    expect(primarySkill).toContain("## Project Context First");
    expect(primarySkill).toContain("Route by user job, not by IDE presence:");
    expect(primarySkill).not.toContain("## IDE-First Job Order");
    expect(primarySkill).toContain(
      "Do not use for generic React/CSS advice or non-UI work that does not require Salt.",
    );
    expect(primarySkill).toContain(
      "Review this Salt dialog layout and tell me the safest next fix.",
    );
    expect(primarySkill).toContain(
      "Create a Salt-native dashboard page for this feature.",
    );
    expect(primarySkill).toContain("## Reference Loading");
    expect(primarySkill).toContain("## Non-Salt Repo Bootstrap");
    expect(primarySkill).toContain("## Scope Boundaries");
    expect(primarySkill).toContain("use `init`");
    expect(primarySkill).toContain("use `migrate`");
    expect(primarySkill).toContain("use `create`");
    expect(primarySkill.split("\n").slice(0, 100).join("\n")).toContain(
      "## Fast Reference Routing",
    );
    expect(primarySkill.split("\n").slice(0, 100).join("\n")).toContain(
      "Load `references/shared/surfaces.md`",
    );
    expect(primarySkill.split("\n").slice(0, 100).join("\n")).toContain(
      "Load `references/shared/design-principles.md`",
    );
    expect(primarySkill.split("\n").slice(0, 130).join("\n")).toContain(
      "When `create` returns `composition_contract.expected_patterns` or `composition_contract.expected_components`, the canonical step is not complete for those named sub-surfaces.",
    );
    expect(primarySkill).toContain(
      "Do not select Salt components, patterns, props, tokens, plans, or code until the canonical Salt step has completed successfully.",
    );
    expect(primarySkill).toContain(
      "If MCP is unavailable, use the CLI fallback. If both MCP and CLI fail, resolve the blocker or ask the user before proceeding.",
    );
    expect(primarySkill).toContain(
      "If both `.salt/team.json` and `.salt/stack.json` are missing, continue with canonical Salt guidance first.",
    );
    expect(primarySkill).toContain(
      "If the repo already has Salt-managed instruction files and they may be stale, rerun `bootstrap_salt_repo` or `salt-ds init` to refresh the managed Salt blocks",
    );
    expect(primarySkill).toContain(
      "keep the result canonical-only and recommend bootstrap only when durable repo policy or managed repo instructions would materially improve future Salt answers",
    );
    expect(primarySkill).toContain(
      "do not select Salt components, patterns, props, tokens, or write Salt-specific code until canonical Salt guidance has been obtained via MCP or CLI",
    );
    expect(primarySkill).toContain(
      "if `create` returns `composition_contract.expected_patterns` or `composition_contract.expected_components`, treat those named items as required Salt follow-through",
    );
    expect(primarySkill).toContain(
      "do not invent Salt APIs, props, components, or token names",
    );
    expect(primarySkill).toContain(
      "treat screenshots and mockups as supporting migration evidence only",
    );
    expect(primarySkill).toContain(
      "do not send raw screenshot or mockup attachments directly to Salt MCP",
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
      "if a broad `create` result returns `composition_contract.expected_patterns` or `composition_contract.expected_components`, treat those named items as required Salt follow-through",
    );
    expect(createRules).toContain(
      "0. Obtain canonical Salt guidance via MCP (`create_salt_ui`) or CLI (`salt-ds create`) and do not proceed until it succeeds.",
    );
    expect(createWorkflow).toContain("workflow-directed grounding follow-ups");
    expect(createWorkflow).toContain(
      "treat them as an implementation checklist and run the matching Salt follow-up for each unresolved named item before building that region.",
    );
    expect(createWorkflow).toContain(
      "verify that the exact name exists in canonical Salt guidance",
    );
    expect(createWorkflow).toContain(
      "If you name or scaffold `SaltProviderNext`, include the full default-new-work bootstrap from `references/shared/theme.md`",
    );
    const createOutput = await readSkill("salt-ds/references/create/output.md");
    expect(createOutput).toContain(
      "the exact name was verified against canonical Salt guidance",
    );
    expect(createOutput).toContain(
      "If the output includes `SaltProviderNext`, include or explicitly preserve the full default-new-work bootstrap from `references/shared/theme.md`",
    );
    expect(createOutput).toContain(
      "If you named `SaltProviderNext`, note that the full bootstrap from `references/shared/theme.md` was also checked instead of assuming the provider name was enough.",
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
    expect(transport).toContain("Do not add a second manual CLI vocabulary");
    expect(transport).toContain(
      "treat returned `composition_contract` as an implementation checklist, not a summary",
    );
    expect(transport).toContain(
      "run the matching Salt create follow-up for each unresolved pattern or component before implementing that sub-surface",
    );
    expect(transport).toContain(
      "normalize them into the published `migrate_visual_evidence_v1` contract",
    );
    expect(transport).toContain(
      "Do not send raw screenshot or mockup attachments directly to Salt MCP.",
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
      "if a broad create result includes `composition_contract.expected_patterns` or `expected_components`, treat those named items as required Salt follow-through",
    );
    expect(repoInstructionsTemplate).toContain(
      "Do not send raw image attachments directly to Salt MCP.",
    );
    expect(normalizeLineEndings(repoInstructionsTemplate)).toContain(
      normalizeLineEndings("<!-- salt-ds:repo-instructions:start -->"),
    );
    expect(repoInstructionsTemplate).not.toContain("entity-grounding step");
    expect(bootstrapScaffolding).toContain(
      "if a broad create result includes `composition_contract.expected_patterns` or `expected_components`, treat those named items as required Salt follow-through",
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
