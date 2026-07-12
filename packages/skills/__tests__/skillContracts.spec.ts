import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  SALT_MCP_CAPABILITY_MANIFEST_URI,
  SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
  SALT_MCP_CATALOG_MANIFEST_URI,
} from "../../mcp/src/server/serverMetadata.js";
import { TOOL_DEFINITIONS } from "../../mcp/src/server/toolDefinitions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(skillsRoot, "..", "..");

async function readSkill(relativePath: string) {
  return fs.readFile(path.join(skillsRoot, relativePath), "utf8");
}

function extractFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  return Object.fromEntries(
    match[1].split(/\r?\n/).flatMap((line) => {
      const fieldMatch = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
      return fieldMatch ? [[fieldMatch[1], fieldMatch[2].trim()]] : [];
    }),
  );
}

function extractReferenceLinks(content: string): string[] {
  return Array.from(new Set(content.match(/references\/[\w./-]+\.md/g) ?? []));
}

function extractPublicContractItems(content: string): string[] {
  const section = content.split("## Public surface", 2)[1];
  return Array.from(section?.matchAll(/^- `([^`]+)`$/gm) ?? [], (match) =>
    String(match[1]),
  );
}

function countWords(content: string): number {
  return content.match(/\b[\w-]+\b/g)?.length ?? 0;
}

function countMatches(content: string, pattern: RegExp): number {
  return Array.from(content.matchAll(pattern)).length;
}

async function collectFiles(relativeRoot: string): Promise<string[]> {
  const absoluteRoot = path.join(skillsRoot, relativeRoot);
  const entries = await fs.readdir(absoluteRoot, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.join(relativeRoot, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(relativePath);
      }
      return [relativePath.replace(/\\/g, "/")];
    }),
  );
  return nested.flat().sort((left, right) => left.localeCompare(right));
}

const PUBLIC_V1_TOOLS = [
  "get_salt_project_context",
  "get_salt_reference",
  "review_salt_ui",
  "create_salt_ui",
  "migrate_to_salt",
] as const;
const PUBLIC_V1_RESOURCES = [
  SALT_MCP_CAPABILITY_MANIFEST_URI,
  SALT_MCP_CATALOG_MANIFEST_URI,
  SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
] as const;

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

  it("keeps SKILL.md as a thin router with reachable progressive references", async () => {
    const primarySkill = await readSkill("salt-ds/SKILL.md");
    const frontmatter = extractFrontmatter(primarySkill);
    const references = extractReferenceLinks(primarySkill);

    expect(frontmatter.name).toBe("salt-ds");
    expect(frontmatter.description).toContain("review, create, and migrate");
    expect(references.sort()).toEqual(
      [
        "references/core.md",
        "references/create.md",
        "references/migrate.md",
        "references/review.md",
        "references/troubleshooting.md",
      ].sort(),
    );
    expect(primarySkill).toMatch(/troubleshooting\.md.*only after/i);
    expect(primarySkill.length).toBeLessThan(3_000);

    for (const ref of references) {
      await fs.access(path.join(skillsRoot, "salt-ds", ref));
    }
  });

  it("ships no orphaned skill references", async () => {
    const primarySkill = await readSkill("salt-ds/SKILL.md");
    const routedFiles = extractReferenceLinks(primarySkill).map(
      (reference) => `salt-ds/${reference}`,
    );

    const expectedFiles = [...routedFiles, "salt-ds/SKILL.md"].sort(
      (left, right) => left.localeCompare(right),
    );
    await expect(collectFiles("salt-ds")).resolves.toEqual(expectedFiles);
    expect(routedFiles).toHaveLength(5);
  });

  it("keeps the routed skill aligned to the public MCP contract", async () => {
    const [core, troubleshooting] = await Promise.all([
      readSkill("salt-ds/references/core.md"),
      readSkill("salt-ds/references/troubleshooting.md"),
    ]);

    expect(TOOL_DEFINITIONS.map((tool) => tool.name)).toEqual(PUBLIC_V1_TOOLS);
    expect(extractPublicContractItems(troubleshooting)).toEqual([
      ...PUBLIC_V1_TOOLS,
      ...PUBLIC_V1_RESOURCES,
    ]);
    expect(core).toMatch(/Salt MCP is read-only/i);
    for (const gate of [
      "status: success",
      "action.kind: implement",
      "safety.exact_request_safe: true",
      "evidence.status: complete",
    ]) {
      expect(core).toContain(gate);
    }
    expect(core).toMatch(
      /action\.kind: apply_fixes[\s\S]*scope: grounded_findings/,
    );
    expect(core).toMatch(/524,288 characters per file/i);
  });

  it("keeps workflow sequencing, review targets, and recovery executable", async () => {
    const [router, core, create, review, migrate, troubleshooting] =
      await Promise.all([
        readSkill("salt-ds/SKILL.md"),
        readSkill("salt-ds/references/core.md"),
        readSkill("salt-ds/references/create.md"),
        readSkill("salt-ds/references/review.md"),
        readSkill("salt-ds/references/migrate.md"),
        readSkill("salt-ds/references/troubleshooting.md"),
      ]);

    expect(router).toMatch(/one primary workflow per phase/i);
    expect(create).toContain("create_salt_ui");
    expect(review).toContain("review_salt_ui");
    expect(migrate).toContain("migrate_to_salt");
    expect(core).toMatch(/review_targets[\s\S]*composition-root/);
    expect(troubleshooting).toMatch(
      /Context or policy failure:[\s\S]*rerun the original workflow fresh/,
    );
    expect(troubleshooting).toMatch(
      /Schema rejection:[\s\S]*once[\s\S]*contract defect and stop/,
    );
    expect(troubleshooting).toMatch(
      /replaying invalid arguments cannot repair it/i,
    );
  });

  it("treats workflow evidence as grounding without redundant integration playbooks", async () => {
    const [core, create, review, migrate] = await Promise.all([
      readSkill("salt-ds/references/core.md"),
      readSkill("salt-ds/references/create.md"),
      readSkill("salt-ds/references/review.md"),
      readSkill("salt-ds/references/migrate.md"),
    ]);
    const normalReferences = [core, create, review, migrate].join("\n");

    expect(core).toMatch(/Workflow evidence counts as grounding/i);
    expect(core).toMatch(
      /action returns it[\s\S]*explicitly asks[\s\S]*ungrounded/i,
    );
    expect(migrate).not.toMatch(/does not emit a reference-retrieval action/i);
    expect(normalReferences).not.toMatch(/`mcp` hint|mcp hint/i);
    expect(countMatches(normalReferences, /\bFigma\b/g)).toBeLessThanOrEqual(1);
    expect(
      countMatches(normalReferences, /\bStorybook\b/g),
    ).toBeLessThanOrEqual(1);
  });

  it("models file-complete review without applying aggregate targets to every file", async () => {
    const [core, create, migrate, review, aiPage, consumerAgents] =
      await Promise.all([
        readSkill("salt-ds/references/core.md"),
        readSkill("salt-ds/references/create.md"),
        readSkill("salt-ds/references/migrate.md"),
        readSkill("salt-ds/references/review.md"),
        fs.readFile(
          path.join(repoRoot, "site", "docs", "getting-started", "ai.mdx"),
          "utf8",
        ),
        fs.readFile(
          path.join(
            repoRoot,
            "workflow-examples",
            "consumer-repo",
            "AGENTS.md",
          ),
          "utf8",
        ),
      ]);

    expect(core).toMatch(
      /complete current contents of every changed Salt source file/i,
    );
    expect(core).toMatch(/524,288 characters per file[\s\S]*Do not truncate/i);
    expect(core).toMatch(
      /review_targets[\s\S]*only to the composition-root file[\s\S]*omit them for leaf files/i,
    );
    expect(core).toMatch(
      /no single file owns the aggregate contract[\s\S]*do not claim the target\/composition check complete/i,
    );

    for (const workflowReference of [create, migrate]) {
      expect(workflowReference).toContain("completion protocol");
      expect(workflowReference).toContain(
        "Workflow evidence already counts as grounding",
      );
    }
    expect(review).toMatch(
      /composition-root file[\s\S]*Omit them for leaf files/i,
    );

    for (const hostInstructionSurface of [aiPage, consumerAgents]) {
      expect(hostInstructionSurface).toMatch(
        /every changed Salt source file[\s\S]*524,288 characters per file/i,
      );
      expect(hostInstructionSurface).toMatch(
        /composition-root file[\s\S]*omit them for leaf files/i,
      );
      expect(hostInstructionSurface).toMatch(
        /cannot prove aggregate coverage/i,
      );
    }
  });

  it("keeps review fixes grounded and separately authorized", async () => {
    const [core, review, aiPage, consumerAgents] = await Promise.all([
      readSkill("salt-ds/references/core.md"),
      readSkill("salt-ds/references/review.md"),
      fs.readFile(
        path.join(repoRoot, "site", "docs", "getting-started", "ai.mdx"),
        "utf8",
      ),
      fs.readFile(
        path.join(repoRoot, "workflow-examples", "consumer-repo", "AGENTS.md"),
        "utf8",
      ),
    ]);

    for (const surface of [core, review, aiPage, consumerAgents]) {
      expect(surface).toMatch(/apply_fixes/);
      expect(surface).toMatch(/grounded_findings/);
      expect(surface).toMatch(/authoriz/i);
      expect(surface).toMatch(/post-action/);
    }
    expect(core).toMatch(/ask_user` always stops/i);
  });

  it("budgets each complete normal route rather than isolated files", async () => {
    const [router, core, troubleshooting, ...workflows] = await Promise.all([
      readSkill("salt-ds/SKILL.md"),
      readSkill("salt-ds/references/core.md"),
      readSkill("salt-ds/references/troubleshooting.md"),
      readSkill("salt-ds/references/create.md"),
      readSkill("salt-ds/references/review.md"),
      readSkill("salt-ds/references/migrate.md"),
    ]);

    expect(core.length).toBeLessThan(4_500);
    expect(countWords(core)).toBeGreaterThanOrEqual(350);
    expect(countWords(core)).toBeLessThanOrEqual(600);
    for (const workflow of workflows) {
      expect(router.length + core.length + workflow.length).toBeLessThan(8_000);
    }
    expect(troubleshooting.length).toBeLessThan(3_000);
  });

  it("keeps the public AI entrypoint and consumer config aligned with the thin router", async () => {
    const aiPage = await fs.readFile(
      path.join(repoRoot, "site", "docs", "getting-started", "ai.mdx"),
      "utf8",
    );
    const consumerConfig = JSON.parse(
      await fs.readFile(
        path.join(
          repoRoot,
          "workflow-examples",
          "consumer-repo",
          "mcp.config.example.json",
        ),
        "utf8",
      ),
    ) as {
      mcpServers?: { Salt?: { command?: string; args?: string[] } };
    };

    expect(aiPage).toMatch(/workflow collects repo context/i);
    expect(aiPage).toMatch(
      /get_salt_project_context[\s\S]*diagnose a disputed root/i,
    );
    expect(aiPage).not.toMatch(
      /Expected MCP path:\s*\n\s*1\. `get_salt_project_context`/,
    );
    expect(aiPage).toMatch(/ask_user[\s\S]*question and stop/i);
    expect(aiPage).toMatch(/tool and concrete arguments/i);
    expect(aiPage).toMatch(/apply_fixes[\s\S]*grounded_findings/);
    expect(aiPage).toMatch(/contract defect and stop/i);
    expect(aiPage).not.toMatch(/`mcp` hint|mcp hint/i);
    expect(consumerConfig.mcpServers?.Salt).toEqual({
      command: "npx",
      args: ["-y", "@salt-ds/mcp@latest"],
    });
  });
});
