import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./registryTestUtils.js";

describe("MCP adapter dependency boundary", () => {
  it("uses only the split SDK-v2 packages at the adapter boundary", () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(REPO_ROOT, "packages/mcp/package.json"),
        "utf8",
      ),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const dependencies = {
      ...manifest.dependencies,
      ...manifest.devDependencies,
    };

    expect(dependencies).not.toHaveProperty("@modelcontextprotocol/sdk");
    expect(dependencies["@modelcontextprotocol/server"]).toMatch(/^\^2\./u);
    expect(dependencies["@modelcontextprotocol/client"]).toMatch(/^\^2\./u);
  });
});
