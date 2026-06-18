import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsRoot = path.resolve(__dirname, "..");

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

const DEFERRED_OR_REMOVED_SURFACES = [
  "salt-ds create",
  "salt-ds review",
  "salt-ds migrate",
  "salt-ds upgrade",
  "salt-ds init",
  "salt-ds doctor",
  "salt-ds runtime inspect",
  "bootstrap_salt_repo",
  "persist_salt_artifact",
  "discover_salt",
  "get_salt_entities",
  "get_salt_examples",
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

  it("keeps SKILL.md as a thin v1 MCP router", async () => {
    const primarySkill = await readSkill("salt-ds/SKILL.md");
    const frontmatter = extractFrontmatter(primarySkill);

    expect(frontmatter.name).toBe("salt-ds");
    expect(frontmatter.description).toContain("review, create, and migrate");
    expect(primarySkill).toContain("Load `references/core.md` first.");
    expect(primarySkill).toContain("references/review.md");
    expect(primarySkill).toContain("references/create.md");
    expect(primarySkill).toContain("references/migrate.md");
    expect(primarySkill).toContain("get_salt_reference");
    expect(primarySkill).not.toContain("Keep one public workflow surface");
    expect(primarySkill).not.toContain("upgrade`: Salt version moves");

    for (const ref of extractReferenceLinks(primarySkill)) {
      await fs.access(path.join(skillsRoot, "salt-ds", ref));
    }
  });

  it("ships only the v1 router and workflow references", async () => {
    await expect(collectFiles("salt-ds")).resolves.toEqual([
      "salt-ds/references/core.md",
      "salt-ds/references/create.md",
      "salt-ds/references/migrate.md",
      "salt-ds/references/review.md",
      "salt-ds/SKILL.md",
    ]);
  });

  it("keeps the always-loaded core aligned to the public v1 MCP contract", async () => {
    const core = await readSkill("salt-ds/references/core.md");

    for (const tool of PUBLIC_V1_TOOLS) {
      expect(core).toContain(tool);
    }
    expect(core).toContain("Do not guess Salt APIs");
    expect(core).toContain("status: success");
    expect(core).toContain("action.kind: implement");
    expect(core).toContain("safety.exact_request_safe: true");
    expect(core).toContain("evidence.status: complete");
    expect(core).toContain("The MCP server is read-only");

    for (const removedSurface of DEFERRED_OR_REMOVED_SURFACES) {
      expect(core).not.toContain(removedSurface);
    }
  });

  it("keeps public workflow references small and free of removed transport claims", async () => {
    const files = [
      "salt-ds/references/create.md",
      "salt-ds/references/review.md",
      "salt-ds/references/migrate.md",
    ];

    for (const file of files) {
      const content = await readSkill(file);
      expect(content).toContain("get_salt_reference");
      for (const removedSurface of DEFERRED_OR_REMOVED_SURFACES) {
        expect(content).not.toContain(removedSurface);
      }
    }
  });

  it("keeps always-on skill surfaces inside progressive disclosure budgets", async () => {
    const primarySkill = await readSkill("salt-ds/SKILL.md");
    const core = await readSkill("salt-ds/references/core.md");

    expect(primarySkill.length).toBeLessThan(5_000);
    expect(core.length).toBeLessThan(7_000);
  });
});
