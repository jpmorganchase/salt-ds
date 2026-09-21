import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { linkTokensToComponents } from "../build/buildRegistryTokens.js";
import {
  createCatalogInputInventory,
  withCatalogInputTracking,
} from "../build/catalogInputInventory.js";
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
  it("uses implementation sources without admitting tests, stories or build outputs", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-applicability-"),
    );
    temporaryRoots.push(repoRoot);
    const packageRoot = path.join(repoRoot, "packages", "fixture");
    const sourceRoot = path.join(packageRoot, "src");
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

    await fs.writeFile(
      path.join(packageRoot, "theme.css"),
      ".fixture { color: var(--salt-root-token); }",
    );
    for (const [directory, file] of [
      ["dist-types", "index.d.ts"],
      ["dist-cjs", "theme.css"],
      ["dist-es", "theme.css"],
    ]) {
      await fs.mkdir(path.join(packageRoot, directory), { recursive: true });
      await fs.writeFile(
        path.join(packageRoot, directory, file),
        "/* generated output references --salt-built-token */",
      );
    }
    const rootCssOutputs = [
      ["ag-grid-theme", "salt-ag-theme.css", "--salt-grid-source-token"],
      [
        "react-resizable-panels-theme",
        "index.css",
        "--salt-splitter-source-token",
      ],
    ] as const;
    for (const [packageName, cssFile, sourceToken] of rootCssOutputs) {
      const themeRoot = path.join(repoRoot, "packages", packageName);
      await fs.mkdir(path.join(themeRoot, "src"), { recursive: true });
      await fs.writeFile(
        path.join(themeRoot, "src", cssFile),
        `.fixture { color: var(${sourceToken}); }`,
      );
      await fs.writeFile(
        path.join(themeRoot, cssFile),
        "/* generated output references --salt-built-token */",
      );
    }
    const inventory = await createCatalogInputInventory(repoRoot, [
      "packages/fixture/src/**/*",
      "packages/fixture/*.css",
      "packages/ag-grid-theme/src/**/*",
      "packages/react-resizable-panels-theme/src/**/*",
    ]);
    const tokenNames = [
      "--salt-production-token",
      "--salt-root-token",
      "--salt-grid-source-token",
      "--salt-splitter-source-token",
      "--salt-built-token",
      "--salt-spec-token",
      "--salt-test-token",
      "--salt-story-token",
      "--salt-nested-test-token",
    ];
    const scan = () =>
      withCatalogInputTracking(repoRoot, inventory, () =>
        linkTokensToComponents(
          repoRoot,
          [
            component("packages/fixture"),
            component("packages/ag-grid-theme"),
            component("packages/react-resizable-panels-theme"),
          ],
          tokenNames.map(token),
        ),
      );
    const result = await scan();

    expect(
      Object.fromEntries(
        result.tokens.map((entry) => [entry.name, entry.applies_to]),
      ),
    ).toEqual({
      "--salt-production-token": ["Fixture"],
      "--salt-root-token": ["Fixture"],
      "--salt-grid-source-token": ["Fixture"],
      "--salt-splitter-source-token": ["Fixture"],
      "--salt-built-token": [],
      "--salt-spec-token": [],
      "--salt-test-token": [],
      "--salt-story-token": [],
      "--salt-nested-test-token": [],
    });

    await fs.writeFile(
      path.join(sourceRoot, "undeclared.ts"),
      "const untracked = 'var(--salt-production-token)';",
    );
    await expect(scan()).rejects.toThrow(/undeclared input/u);
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
