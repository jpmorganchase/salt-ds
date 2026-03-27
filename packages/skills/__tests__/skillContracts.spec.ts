import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

describe("Salt skill contracts", () => {
  it("keeps salt-ds as the single public workflow skill with a sharper public contract", async () => {
    const readme = await readSkill("README.md");
    const agents = await readSkill("AGENTS.md");
    const primarySkill = await readSkill("skills/salt-ds/SKILL.md");
    const createRules = await readSkill("references/create-rules.md");
    const reviewRules = await readSkill("references/review-rules.md");
    const migrationRules = await readSkill("references/migration-rules.md");

    expect(readme).toContain("## Public Skill");
    expect(readme).toContain("`salt-ds`");
    expect(readme).toContain("## Internal Workflow Modules");
    expect(agents).toContain("`salt-ds`");
    expect(primarySkill).toContain("## Default Rule");
    expect(primarySkill).toContain("`get_salt_project_context`");
    expect(primarySkill).toContain("`salt-ds info --json`");
    expect(primarySkill).toContain("## Critical Rules");
    expect(primarySkill).toContain("## Workflow Loops");
    expect(primarySkill).toContain("## Ask Instead Of Guess");
    expect(primarySkill).toContain("../../references/create-rules.md");
    expect(primarySkill).toContain("../../references/review-rules.md");
    expect(primarySkill).toContain("../../references/migration-rules.md");
    expect(primarySkill).not.toContain("../salt-ui-builder/SKILL.md");
    expect(primarySkill).not.toContain("../salt-ui-reviewer/SKILL.md");
    expect(primarySkill).not.toContain("../salt-migration-helper/SKILL.md");
    expect(primarySkill).not.toContain("../salt-project-conventions/SKILL.md");
    expect(createRules).toContain("## Intent-First Loop");
    expect(createRules).toContain("create-task-first");
    expect(createRules).toContain("create-canonical-before-custom");
    expect(reviewRules).toContain("## Issue Families");
    expect(reviewRules).toContain("review-canonical-mismatch");
    expect(reviewRules).toContain("review-migration-upgrade-risk");
    expect(migrationRules).toContain("## Migration Loop");
    expect(migrationRules).toContain("migrate-preserve-task-flow");
    expect(migrationRules).toContain("migrate-confirm-workflow-deltas");
  });

  it("keeps the shared workflow contract transport-aware and workflow-first in CLI fallback", async () => {
    const contract = await readSkill(
      "references/canonical-salt-tool-surfaces.md",
    );

    expect(contract).toContain("Salt MCP");
    expect(contract).toContain("Salt CLI");
    expect(contract).toContain("salt-ds info --json");
    expect(contract).toContain("salt-ds init");
    expect(contract).toContain("salt-ds create");
    expect(contract).toContain("salt-ds review");
    expect(contract).toContain("salt-ds migrate");
    expect(contract).toContain("salt-ds upgrade");
    expect(contract).toContain("salt-ds doctor");
    expect(contract).toContain("salt-ds runtime inspect");
    expect(contract).toContain("salt-ds review <path> --url <url>");
    expect(contract).toContain("Do not add a second manual CLI vocabulary");
  });

  it("keeps builder, reviewer, and migration skills aligned on fallback and evidence order", async () => {
    const builder = await readSkill("skills/salt-ui-builder/SKILL.md");
    const reviewer = await readSkill("skills/salt-ui-reviewer/SKILL.md");
    const migration = await readSkill("skills/salt-migration-helper/SKILL.md");

    for (const source of [builder, reviewer, migration]) {
      const normalized = source.toLowerCase();
      expect(normalized).toContain("if mcp is unavailable");
      expect(normalized).toContain("salt-ds info --json");
      expect(normalized).toContain("salt-ds doctor");
      expect(normalized).toContain("salt-ds review");
      expect(normalized).toContain("--url");
      expect(normalized).toContain(
        "treat layout-debug details as advanced evidence only",
      );
    }
  });

  it("keeps project conventions on the default .salt/team.json and AGENTS.md path", async () => {
    const projectConventions = await readSkill(
      "skills/salt-project-conventions/SKILL.md",
    );
    const repoInstructionsTemplate = await readSkill(
      "skills/salt-project-conventions/assets/repo-instructions.template.md",
    );
    const builderWorkflow = await readSkill(
      "skills/salt-ui-builder/references/build-workflow.md",
    );
    const consumerExampleAgents = await readRepoFile(
      "workflow-examples/consumer-repo/AGENTS.md",
    );

    const normalized = projectConventions.toLowerCase();

    expect(normalized).toContain("look for `.salt/team.json` first");
    expect(normalized).toContain("salt-ds init");
    expect(projectConventions).toContain(
      "If no repo-local instruction file exists, create or update `AGENTS.md` by default.",
    );
    expect(normalized).toContain("if the repo already uses `claude.md`");
    expect(normalized).toContain(
      "do not let them masquerade as permanent component policy",
    );
    expect(repoInstructionsTemplate).toContain("salt-ds review");
    expect(repoInstructionsTemplate).toContain(
      "follow the returned canonical Salt follow-up before editing",
    );
    expect(repoInstructionsTemplate).not.toContain("entity-grounding step");
    expect(builderWorkflow).toContain("workflow-directed grounding follow-ups");
    expect(consumerExampleAgents).toContain("salt-ds doctor");
    expect(consumerExampleAgents).toContain(
      "salt-ds review <path> --url <url>",
    );
    expect(consumerExampleAgents).toContain("salt-ds runtime inspect <url>");
    expect(consumerExampleAgents).not.toContain("salt lint");
    expect(consumerExampleAgents).not.toContain("salt doctor");
    expect(consumerExampleAgents).not.toContain("salt runtime inspect <url>");
  });
});
