import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./registryTestUtils.js";

interface RootPackageJson {
  scripts?: Record<string, string>;
}

interface StylelintConfig {
  overrides?: Array<{
    files?: string[];
    rules?: Record<string, unknown>;
  }>;
}

const POST_BUILD_STEPS = [
  "yarn typecheck",
  "yarn typecheck:ai-tooling",
  "yarn test:ai-tooling",
  "yarn workspace @salt-ds/mcp measure:runtime-loc",
  "yarn workspace @salt-ds/mcp measure:surface",
  "yarn build:ai-tooling",
  "yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-ai-pack/unit-04a.json",
  "yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-04a.json",
];

async function readScripts(): Promise<Record<string, string>> {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(REPO_ROOT, "package.json"), "utf8"),
  ) as RootPackageJson;
  return packageJson.scripts ?? {};
}

describe("release verification scripts", () => {
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

    expect(postBuild.split(" && ")).toEqual(POST_BUILD_STEPS);
    expect(postBuild).not.toContain("release:verify:mcp:after-build");
  });

  it("runs the Core and Date package gates before the unchanged MCP composite", async () => {
    const scripts = await readScripts();

    expect(scripts["release:verify:after-build"]?.split(" && ")).toEqual([
      "yarn check:core-react-types",
      "yarn check:date-adapters:pack",
      "yarn release:verify:mcp:after-build",
    ]);
    expect(scripts["release:verify:after-build"]).not.toContain(
      "release:verify:after-build",
    );
  });

  it("runs all package gates after the PR build", async () => {
    const workflow = await fs.readFile(
      path.join(REPO_ROOT, ".github", "workflows", "test.yml"),
      "utf8",
    );
    const build = workflow.indexOf("run: yarn build");
    const mcpPackageGate = workflow.indexOf(
      "run: yarn check:ai-tooling:pack -- --profile pre-agent-support --report dist/salt-ai-pack/unit-04a.json",
    );
    const datePackageGate = workflow.indexOf(
      "run: yarn check:date-adapters:pack",
    );
    const coreTypeGate = workflow.indexOf("run: yarn check:core-react-types");

    expect(build).toBeGreaterThanOrEqual(0);
    expect(mcpPackageGate).toBeGreaterThan(build);
    expect(datePackageGate).toBeGreaterThan(build);
    expect(coreTypeGate).toBeGreaterThan(build);
  });

  it("checks the AI embargo before reusing the full release build", async () => {
    const scripts = await readScripts();

    expect(scripts.release).toBe(
      "yarn verify:salt-ai-release-embargo && yarn build && yarn release:verify:after-build && yarn changeset publish",
    );
  });

  it("keeps published registry smoke explicit and verifies the packed local consumer", async () => {
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
    expect(scripts["release:verify:mcp:after-build"]).toContain(
      "yarn smoke:consumer --skip-build --pack-report dist/salt-ai-pack/unit-04a.json",
    );
  });

  it("keeps Biome responsible for lint and Prettier responsible for format", async () => {
    const scripts = await readScripts();

    expect(scripts["lint:check:error"]).toBe(
      "biome lint --diagnostic-level=error",
    );
    expect(scripts.prettier).toBe("prettier --check .");
    expect(scripts["prettier:ci"]).toBe("prettier --check .");
    expect(scripts.format).toBe("prettier --write .");
  });

  it("includes theme CSS in the style gate while exempting compatibility definitions", async () => {
    const scripts = await readScripts();
    const stylelintConfig = JSON.parse(
      await fs.readFile(path.join(REPO_ROOT, ".stylelintrc.json"), "utf8"),
    ) as StylelintConfig;
    const deprecatedThemeOverride = stylelintConfig.overrides?.find(
      (override) =>
        override.files?.includes("**/theme/css/**/deprecated/**/*.css"),
    );
    const legacyThemeOverride = stylelintConfig.overrides?.find((override) =>
      override.files?.includes("**/theme/css/legacy/**/*.css"),
    );

    expect(scripts["lint:style"]?.split(" && ")).toContain(
      "yarn lint:style:theme",
    );
    expect(deprecatedThemeOverride?.rules).toMatchObject({
      "salt/no-deprecated-token-usage": null,
    });
    expect(legacyThemeOverride?.rules).toMatchObject({
      "salt/no-deprecated-token-usage": null,
    });
  });

  it("keeps evaluation, provider, post-publish, and publish work out of verification", async () => {
    const scripts = await readScripts();
    const verification = [
      scripts["release:verify:after-build"],
      scripts["release:verify:mcp"],
      scripts["release:verify:mcp:after-build"],
    ].join(" ");

    expect(verification).not.toMatch(
      /eval:|causal|skill-behavior|prepare-live|import-live|provider|post-publish|changeset publish|npm publish/iu,
    );
  });
});
