import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./registryTestUtils.js";

const docsDir = path.join(REPO_ROOT, "packages", "mcp", "docs");
const runbookPath = path.join(docsDir, "ai-tooling-operator-runbook.md");

async function readDoc(fileName: string) {
  return fs.readFile(path.join(docsDir, fileName), "utf8");
}

describe("AI tooling operator runbook docs", () => {
  it("keeps the runbook focused on Salt evidence workflow only", async () => {
    const runbook = await fs.readFile(runbookPath, "utf8");

    expect(runbook).toContain(
      "# Salt AI Tooling Reviewer And Operator Runbook",
    );
    expect(runbook).toContain("## Evidence Sources");
    expect(runbook).toContain("## Layer Map");
    expect(runbook).toContain("## Run Phases");
    expect(runbook).toContain("### 5. Slice Close-Out");
    expect(runbook).toContain("## Unsupported Or Degraded Output");

    const forbiddenFragments = [
      ["compe", "titor"].join(""),
      ["external", " comparison"].join(""),
      ["accessibility", " skill"].join(""),
      ["PLAN", ".md"].join(""),
      ["design-system", " docs"].join(""),
    ];

    for (const fragment of forbiddenFragments) {
      expect(runbook.toLowerCase()).not.toContain(fragment.toLowerCase());
    }
  });

  it("links the runbook from the active MCP docs entry points", async () => {
    await expect(fs.access(runbookPath)).resolves.toBeUndefined();

    const readme = await readDoc("README.md");
    const maintainerGuide = await readDoc("maintaining-salt-ai-tooling.md");

    expect(readme).toContain("ai-tooling-operator-runbook.md");
    expect(maintainerGuide).toContain("ai-tooling-operator-runbook.md");
  });
});
