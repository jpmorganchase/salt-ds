import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");

async function readRepoFile(relativePath: string): Promise<string> {
  return fs.readFile(path.join(repoRoot, relativePath), "utf8");
}

async function collectRepoFiles(
  relativeRoot: string,
  extensions: ReadonlySet<string>,
): Promise<string[]> {
  const absoluteRoot = path.join(repoRoot, relativeRoot);
  const entries = await fs.readdir(absoluteRoot, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.join(relativeRoot, entry.name);
      if (entry.isDirectory()) {
        return collectRepoFiles(relativePath, extensions);
      }

      const extension = path.extname(entry.name).toLowerCase();
      return extensions.has(extension)
        ? [relativePath.replace(/\\/g, "/")]
        : [];
    }),
  );

  return files.flat();
}

async function collectFactSensitiveSurfaces(): Promise<string[]> {
  const generatedSkillSurfaces = await collectRepoFiles(
    "packages/skills/salt-ds",
    new Set([".md", ".yaml", ".yml"]),
  );
  const consumerPromptSurfaces = await collectRepoFiles(
    "workflow-examples/consumer-repo",
    new Set([".md"]),
  );
  const sharedCodeSurfaces = ["packages/mcp/src/server/serverMetadata.ts"];

  return [
    ...generatedSkillSurfaces,
    ...consumerPromptSurfaces,
    ...sharedCodeSurfaces,
  ]
    .filter((value, index, allValues) => allValues.indexOf(value) === index)
    .sort((left, right) => left.localeCompare(right));
}

const bannedSentinels = [
  /\bSaltProviderNext\b/,
  /@salt-ds\/theme\/index\.css/,
  /@salt-ds\/theme\/css\/theme-next\.css/,
  /accent(?:=\\?")?teal/i,
  /corner(?:=\\?")?rounded/i,
  /headingFont/i,
  /actionFont/i,
  /\bAmplitude\b/,
  /\bAnalytical dashboard\b/,
  /\bAvatar\b/,
  /\bDownloadIcon\b/,
  /\bUNSTABLE_SaltProviderNext\b/,
  /\bsix repo-aware workflow tools\b/i,
] as const;

describe("Salt skill and prompt surface fact guard", () => {
  it("keeps first-load skill, prompt, generated-doc, and MCP surfaces free of static Salt facts", async () => {
    // These are banned-sentinel fixtures from earlier surface regressions; they
    // are not sources of Salt truth.
    const factSensitiveSurfaces = await collectFactSensitiveSurfaces();

    for (const relativePath of factSensitiveSurfaces) {
      const content = await readRepoFile(relativePath);

      for (const sentinel of bannedSentinels) {
        expect(content, relativePath).not.toMatch(sentinel);
      }
    }
  });
});
