import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { linkTokensToComponents } from "../build/buildRegistryTokens.js";
import type { ComponentRecord, TokenRecord } from "../types.js";

const temporaryRoots: string[] = [];

function component(repoPath: string): ComponentRecord {
  return {
    id: "component.fixture",
    name: "Fixture",
    aliases: [],
    package: { name: "@salt-ds/fixture", status: "stable", since: null },
    summary: "Fixture component.",
    status: "stable",
    category: [],
    tags: [],
    when_to_use: [],
    when_not_to_use: [],
    alternatives: [],
    props: [],
    accessibility: { summary: [], rules: [] },
    patterns: [],
    examples: [],
    related_docs: {
      overview: null,
      usage: null,
      accessibility: null,
      examples: null,
    },
    source: { repo_path: repoPath, export_name: null },
    deprecations: [],
    last_verified_at: null,
  };
}

function token(name: string): TokenRecord {
  return {
    name,
    category: "fixture",
    type: "color",
    value: null,
    semantic_intent: null,
    themes: [],
    densities: [],
    applies_to: [],
    guidance: [],
    aliases: [],
    policy: null,
    policy_gap: null,
    deprecated: false,
    last_verified_at: null,
  };
}

describe("component token applicability", () => {
  it("uses implementation sources without admitting tests or stories", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-applicability-"),
    );
    temporaryRoots.push(repoRoot);
    const sourceRoot = path.join(repoRoot, "packages", "fixture", "src");
    await fs.mkdir(path.join(sourceRoot, "__tests__"), { recursive: true });
    await Promise.all([
      fs.writeFile(
        path.join(sourceRoot, "Fixture.tsx"),
        "const production = 'var(--salt-production-token)';",
      ),
      fs.writeFile(
        path.join(sourceRoot, "Fixture.spec.tsx"),
        "const spec = 'var(--salt-spec-token)';",
      ),
      fs.writeFile(
        path.join(sourceRoot, "Fixture.test.tsx"),
        "const test = 'var(--salt-test-token)';",
      ),
      fs.writeFile(
        path.join(sourceRoot, "Fixture.stories.tsx"),
        "const story = 'var(--salt-story-token)';",
      ),
      fs.writeFile(
        path.join(sourceRoot, "__tests__", "fixture.tsx"),
        "const nested = 'var(--salt-nested-test-token)';",
      ),
    ]);

    const tokenNames = [
      "--salt-production-token",
      "--salt-spec-token",
      "--salt-test-token",
      "--salt-story-token",
      "--salt-nested-test-token",
    ];
    const result = await linkTokensToComponents(
      repoRoot,
      [component("packages/fixture/src")],
      tokenNames.map(token),
    );

    expect(
      Object.fromEntries(
        result.tokens.map((entry) => [entry.name, entry.applies_to]),
      ),
    ).toEqual({
      "--salt-production-token": ["Fixture"],
      "--salt-spec-token": [],
      "--salt-test-token": [],
      "--salt-story-token": [],
      "--salt-nested-test-token": [],
    });
  });
});

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) =>
      fs.rm(root, {
        recursive: true,
        force: true,
      }),
    ),
  );
});
