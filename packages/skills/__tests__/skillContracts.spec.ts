import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TOOL_DEFINITIONS } from "../../mcp/src/server/toolDefinitions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const skillRoot = path.join(repoRoot, "packages", "skills", "salt-ds");

const PUBLIC_TOOLS = [
  "search_salt",
  "inspect_salt_project",
  "review_salt_code",
] as const;

const RETIRED_PROTOCOL_TERMS = [
  "salt_workflow_v1",
  "create_salt_ui",
  "migrate_to_salt",
  "action.kind",
  "post_action",
  "implementation_ready",
  "exact_request_safe",
  "apply_fixes",
  "ask_user",
  "finish_without_changes",
] as const;

async function readSkill(relativePath: string): Promise<string> {
  return fs.readFile(path.join(skillRoot, relativePath), "utf8");
}

async function collectFiles(root: string): Promise<string[]> {
  const absoluteRoot = path.join(skillRoot, root);
  const entries = await fs.readdir(absoluteRoot, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.posix.join(root, entry.name);
      return entry.isDirectory() ? collectFiles(relativePath) : [relativePath];
    }),
  );
  return nested.flat().sort((left, right) => left.localeCompare(right));
}

describe("Salt skill contracts", () => {
  it("keeps one thin router with reachable progressive references", async () => {
    const router = await readSkill("SKILL.md");
    const files = await collectFiles(".");

    expect(files).toEqual([
      "references/core.md",
      "references/create.md",
      "references/migrate.md",
      "references/review.md",
      "references/troubleshooting.md",
      "SKILL.md",
    ]);
    for (const reference of [
      "references/core.md",
      "references/create.md",
      "references/migrate.md",
      "references/review.md",
      "references/troubleshooting.md",
    ]) {
      expect(router).toContain(reference);
    }
    expect(router.length).toBeLessThan(4_000);
  });

  it("matches the final three-tool read-only MCP surface", async () => {
    expect(TOOL_DEFINITIONS.map((tool) => tool.name)).toEqual(PUBLIC_TOOLS);
    for (const definition of TOOL_DEFINITIONS) {
      expect(definition.annotations).toEqual(
        expect.objectContaining({
          readOnlyHint: true,
          destructiveHint: false,
        }),
      );
    }

    const troubleshooting = await readSkill("references/troubleshooting.md");
    for (const name of PUBLIC_TOOLS) {
      expect(troubleshooting).toContain(name);
    }
    expect(troubleshooting).toContain(
      "salt://catalog/v2/sha256-<digest>/manifest",
    );
    expect(troubleshooting).toContain(
      "salt://catalog/v2/sha256-<digest>/{family}/{id}",
    );
    expect(troubleshooting).not.toContain("salt://capabilities/manifest");
  });

  it("keeps creation and migration as agent-owned evidence procedures", async () => {
    const [router, core, create, migrate] = await Promise.all([
      readSkill("SKILL.md"),
      readSkill("references/core.md"),
      readSkill("references/create.md"),
      readSkill("references/migrate.md"),
    ]);

    for (const content of [router, core, create, migrate]) {
      expect(content).toMatch(/agent-owned|host agent owns/iu);
      expect(content).toMatch(/evidence/iu);
      expect(content).toMatch(/authoriz/iu);
    }
    expect(create).toMatch(/retrieve exact Salt records/iu);
    expect(create).toMatch(/submit the changed text/iu);
    expect(migrate).toMatch(/Preserve critical actions, states, hierarchy/iu);
    expect(migrate).toMatch(/Do not invent a Salt equivalent/iu);
  });

  it("keeps review bounded to submitted text without completion claims", async () => {
    const [core, review] = await Promise.all([
      readSkill("references/core.md"),
      readSkill("references/review.md"),
    ]);

    expect(review).toMatch(/submitted text only/iu);
    expect(review).toMatch(/stable rule[\s\S]*exact submitted location/iu);
    expect(review).toMatch(/no-findings result applies only/iu);
    expect(review).toMatch(/Never claim complete-file/iu);
    expect(core).toMatch(/No-findings-in-submitted-text is not proof/iu);
    expect(core).toMatch(
      /Report the\s+reviewed scope, coverage, limitations/iu,
    );
  });

  it("contains no retired private workflow interpreter language", async () => {
    const files = await collectFiles(".");
    for (const relativePath of files) {
      const content = await readSkill(relativePath);
      for (const term of RETIRED_PROTOCOL_TERMS) {
        expect(content, `${relativePath}: ${term}`).not.toContain(term);
      }
    }
  });

  it("aligns public guidance and the consumer fixture to the same boundary", async () => {
    const [aiPage, mcpReadme, consumerAgents, consumerConfig] =
      await Promise.all([
        fs.readFile(
          path.join(repoRoot, "site", "docs", "getting-started", "ai.mdx"),
          "utf8",
        ),
        fs.readFile(
          path.join(repoRoot, "packages", "mcp", "README.md"),
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
        fs.readFile(
          path.join(
            repoRoot,
            "workflow-examples",
            "consumer-repo",
            "mcp.config.example.json",
          ),
          "utf8",
        ),
      ]);

    for (const surface of [aiPage, mcpReadme, consumerAgents]) {
      expect(surface).toMatch(/read-only/iu);
      expect(surface).toMatch(/agent[\s\S]*(owns|owned)/iu);
      expect(surface).toMatch(/authoriz/iu);
      expect(surface).toMatch(/task complete|task completion/iu);
    }
    expect(consumerConfig).not.toMatch(/@salt-ds\/mcp@|\bnpx\b/u);
  });
});
