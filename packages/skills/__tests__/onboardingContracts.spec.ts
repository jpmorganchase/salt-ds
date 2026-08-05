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

describe("public AI onboarding contract during remediation", () => {
  it("publishes no registry install spec or release-ready claim", async () => {
    const surfaces = await Promise.all([
      read("site/docs/getting-started/ai.mdx"),
      read("packages/mcp/README.md"),
      read("packages/skills/README.md"),
      read("workflow-examples/consumer-repo/README.md"),
      read("workflow-examples/consumer-repo/mcp.config.example.json"),
    ]);

    for (const content of surfaces) {
      expect(content).not.toMatch(/@salt-ds\/mcp@[^\s"'`,\]]+/u);
      expect(content).not.toMatch(
        /https:\/\/github\.com\/jpmorganchase\/salt-ds\/tree\/(?:main|[\w./-]*branch[\w./-]*)\/packages\/skills/iu,
      );
      expect(content).not.toMatch(
        /\bbeta\b|\bbeta-ready\b|\brelease-ready\b/iu,
      );
    }
  });

  it("keeps the checked-in MCP config local-only", async () => {
    const config = JSON.parse(
      await read("workflow-examples/consumer-repo/mcp.config.example.json"),
    ) as { mcpServers?: { Salt?: { command?: string; args?: string[] } } };

    expect(config.mcpServers?.Salt).toEqual({
      command: "node",
      args: ["./node_modules/@salt-ds/mcp/bin/salt-mcp.js"],
    });
    expect(JSON.stringify(config)).not.toMatch(/\bnpx\b|@salt-ds\/mcp@/u);
  });

  it("states the responsibility and trust boundaries consistently", async () => {
    for (const content of await Promise.all([
      read("site/docs/getting-started/ai.mdx"),
      read("packages/mcp/README.md"),
      read("workflow-examples/consumer-repo/README.md"),
      read("workflow-examples/consumer-repo/AGENTS.md"),
    ])) {
      expect(content).toMatch(/agent[\s\S]*(owns|owned)/iu);
      expect(content).toMatch(/read-only/iu);
      expect(content).toMatch(/authoriz/iu);
      expect(content).toMatch(
        /does not|no MCP (?:response|result)|never infer|not.*proof/iu,
      );
    }
  });

  it("withholds a mutable public skill install", async () => {
    const readme = await read("packages/skills/README.md");

    expect(readme).toMatch(/Public installation is withheld/iu);
    expect(readme).toMatch(/immutable/iu);
    expect(readme).toMatch(/mutable branch/iu);
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
