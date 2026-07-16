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
  "yarn eval:evidence-sprint",
  "yarn check:ai-tooling:pack",
  "yarn smoke:consumer --skip-build",
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

  it("retains the deterministic post-build checks in order", async () => {
    const scripts = await readScripts();
    const postBuild = scripts["release:verify:mcp:after-build"];

    expect(postBuild).toBe(POST_BUILD_STEPS.join(" && "));
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
