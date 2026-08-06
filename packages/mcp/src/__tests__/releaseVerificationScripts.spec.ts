import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./registryTestUtils.js";

interface RootPackageJson {
  scripts?: Record<string, string>;
}

const POST_BUILD_STEPS = [
  "yarn typecheck:mcp",
  "yarn test:ai-tooling",
  "yarn workspace @salt-ds/mcp measure:runtime-loc",
  "yarn workspace @salt-ds/mcp measure:surface",
  "yarn check:ai-tooling:pack",
];

async function readScripts(): Promise<Record<string, string>> {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(REPO_ROOT, "package.json"), "utf8"),
  ) as RootPackageJson;
  return packageJson.scripts ?? {};
}

describe("MCP release verification scripts", () => {
  it("keeps the public verification command self-contained and stale-safe", async () => {
    const scripts = await readScripts();

    expect(scripts["release:verify:mcp"]).toBe(
      "yarn workspace @salt-ds/mcp build && yarn release:verify:mcp:after-build",
    );
    expect(scripts["release:verify:mcp"]).not.toContain(
      "yarn release:verify:mcp &&",
    );
  });

  it("retains each distinct post-build check once and in dependency order", async () => {
    const scripts = await readScripts();
    const postBuild = scripts["release:verify:mcp:after-build"];

    const positions = POST_BUILD_STEPS.map((step) => postBuild.indexOf(step));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    for (const step of POST_BUILD_STEPS) {
      expect(postBuild.split(step)).toHaveLength(2);
    }
    expect(postBuild).not.toContain("yarn eval:deterministic");
    expect(postBuild).not.toContain("release:verify:mcp:after-build");
  });

  it("reuses the full release build without rebuilding MCP", async () => {
    const scripts = await readScripts();

    expect(scripts.release).toBe(
      "yarn build && yarn release:verify:mcp:after-build && yarn changeset publish",
    );
  });

  it("keeps published registry smoke explicit and outside deterministic verification", async () => {
    const scripts = await readScripts();

    expect(scripts["smoke:consumer:published"]).toBe(
      "node ./scripts/consumerRepoSmoke.mjs --published",
    );
    expect(scripts["release:verify:mcp:after-build"]).not.toContain(
      "smoke:consumer:published",
    );
    expect(scripts["smoke:consumer:network"]).toBe(
      "node ./scripts/consumerRepoSmoke.mjs",
    );
    expect(scripts["release:verify:mcp:after-build"]).not.toContain(
      "smoke:consumer",
    );
  });

  it("keeps Biome responsible for lint and Prettier responsible for format", async () => {
    const scripts = await readScripts();

    expect(scripts["lint:check:error"]).toBe(
      "biome lint --diagnostic-level=error",
    );
    expect(scripts["prettier:ci"]).toBe("prettier --check .");
  });

  it("keeps live evaluation, provider, post-publish, and publish work out of verification", async () => {
    const scripts = await readScripts();
    const verification = [
      scripts["release:verify:mcp"],
      scripts["release:verify:mcp:after-build"],
    ].join(" ");

    expect(verification).not.toMatch(
      /causal|skill-behavior|prepare-live|import-live|provider|post-publish|changeset publish|npm publish/iu,
    );
  });
});
