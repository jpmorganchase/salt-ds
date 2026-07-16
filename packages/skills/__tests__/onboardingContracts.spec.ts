import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const exampleRoot = path.join(repoRoot, "workflow-examples", "consumer-repo");

async function read(relativePath: string): Promise<string> {
  return fs.readFile(path.join(repoRoot, relativePath), "utf8");
}

function extractMcpSpecs(content: string): string[] {
  return Array.from(
    content.matchAll(/@salt-ds\/mcp@[^\s"'`,\]]+/gu),
    (match) => match[0],
  );
}

describe("public AI onboarding contract", () => {
  it("pins every public setup surface to one exact release version", async () => {
    const surfaces = await Promise.all([
      read("site/docs/getting-started/ai.mdx"),
      read("packages/mcp/README.md"),
      read("workflow-examples/consumer-repo/mcp.config.example.json"),
    ]);
    const specs = surfaces.map((content) => extractMcpSpecs(content));
    const exactSpec = specs[0]?.[0];

    expect(exactSpec).toMatch(/^@salt-ds\/mcp@\d+\.\d+\.\d+$/u);
    expect(exactSpec).not.toBe("@salt-ds/mcp@0.0.0");
    for (const [index, content] of surfaces.entries()) {
      expect(specs[index]).toContain(exactSpec);
      expect(content).not.toMatch(/@salt-ds\/mcp@(latest|snapshot\b)/iu);
      expect(content).not.toMatch(/@salt-ds\/mcp@0\.0\.0(?:\b|-)/u);
    }
  });

  it("states the Node prerequisite before the first setup command", async () => {
    for (const content of await Promise.all([
      read("site/docs/getting-started/ai.mdx"),
      read("packages/mcp/README.md"),
      read("workflow-examples/consumer-repo/README.md"),
    ])) {
      const nodePrerequisite = content.search(/Node(?:\.js)? 22 or newer/iu);
      const setupCommand = content.search(/(?:@salt-ds\/mcp@|corepack yarn)/u);

      expect(nodePrerequisite).toBeGreaterThanOrEqual(0);
      expect(setupCommand).toBeGreaterThan(nodePrerequisite);
    }
  });

  it("deliberately omits a mutable public skill install", async () => {
    const surfaces = await Promise.all([
      read("site/docs/getting-started/ai.mdx"),
      read("packages/mcp/README.md"),
      read("packages/skills/README.md"),
      read("workflow-examples/consumer-repo/README.md"),
    ]);

    for (const content of surfaces) {
      expect(content).toMatch(/skill[\s\S]*(omitted|not part|withheld)/iu);
      expect(content).toMatch(/immutable/iu);
      expect(content).not.toMatch(
        /https:\/\/github\.com\/jpmorganchase\/salt-ds\/tree\/(?:main|[\w./-]*branch[\w./-]*)\/packages\/skills/iu,
      );
    }
  });

  it("explains optional repo policy and canonical-only fallback", async () => {
    for (const content of await Promise.all([
      read("site/docs/getting-started/ai.mdx"),
      read("packages/mcp/README.md"),
      read("workflow-examples/consumer-repo/README.md"),
    ])) {
      expect(content).toMatch(
        /\.salt\/team\.json[\s\S]*optional|optional[\s\S]*\.salt\/team\.json/iu,
      );
      expect(content).toMatch(/canonical-only/iu);
      expect(content).toMatch(/(?:repo|user|host)[/-]owned/iu);
    }
  });

  it("keeps the consumer example independent of this workspace", async () => {
    const packageJson = JSON.parse(
      await fs.readFile(path.join(exampleRoot, "package.json"), "utf8"),
    ) as {
      packageManager?: string;
      engines?: { node?: string };
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const tsconfig = JSON.parse(
      await fs.readFile(path.join(exampleRoot, "tsconfig.json"), "utf8"),
    ) as { extends?: string; compilerOptions?: { paths?: unknown } };
    const ranges = [
      ...Object.values(packageJson.dependencies ?? {}),
      ...Object.values(packageJson.devDependencies ?? {}),
    ];

    expect(packageJson.packageManager).toBe("yarn@4.17.0");
    expect(packageJson.engines?.node).toBe(">=22");
    expect(ranges.every((range) => !range.startsWith("workspace:"))).toBe(true);
    expect(tsconfig.extends).toBeUndefined();
    expect(tsconfig.compilerOptions?.paths).toEqual({ "@/*": ["./src/*"] });
    await expect(
      fs.access(path.join(exampleRoot, "yarn.lock")),
    ).resolves.toBeUndefined();
  });
});
