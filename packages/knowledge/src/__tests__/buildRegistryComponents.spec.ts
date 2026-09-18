import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractComponents,
  extractPackages,
} from "../build/buildRegistryComponents.js";
import type { PackageRecord } from "../types.js";

type FixtureComponentExportAlias =
  | string
  | {
      exportName: string;
      sourceCodeUrl: string;
    };

// All Salt-looking strings in this file are intentionally tiny fixture facts.
function buildFixturePackage(): PackageRecord {
  return {
    id: "package.fixture",
    name: "@salt-ds/fixture",
    status: "stable",
    version: "0.0.0",
    summary: "Fixture package for registry extraction tests.",
    source_root: "packages/fixture",
    changelog_path: null,
    docs_root: "/salt/components",
  };
}

async function writeFixtureRepo(
  repoRoot: string,
  options: {
    accessibilityContent?: string;
    componentExportAliases?: FixtureComponentExportAlias[];
    exampleSourceContent?: string;
    sourceContent?: string;
    sourceCodeUrl?: string;
  } = {},
): Promise<void> {
  const componentDir = path.join(
    repoRoot,
    "site/docs/components/fixture-action",
  );
  const exampleDir = path.join(repoRoot, "site/src/examples/fixture-action");
  const packageSourceDir = path.join(repoRoot, "packages/fixture/src");
  const componentSourceDir = path.join(packageSourceDir, "fixture-action");
  const accessibilityContent =
    options.accessibilityContent ??
    `---
title: Fixture action accessibility
---

Use the fixture action with an explicit accessible label.

## Keyboard interactions

| Key | Description |
| --- | --- |
| Tab | Moves focus to the fixture action. |

## Accessibility considerations

Announce fixture state changes through source-backed fixture text.
`;

  await fs.mkdir(componentDir, { recursive: true });
  await fs.mkdir(exampleDir, { recursive: true });
  await fs.mkdir(componentSourceDir, { recursive: true });
  await fs.writeFile(
    path.join(componentSourceDir, "Foo.tsx"),
    `${
      options.sourceContent ??
      `export function FixtureAction() {
  return null;
}
`
    }

export function FixtureActionItem() {
  return null;
}
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(packageSourceDir, "index.ts"),
    `export { FixtureAction, FixtureActionItem } from "./fixture-action/Foo.js";
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(repoRoot, "site/component-category-map.json"),
    `${JSON.stringify(
      {
        meta: {
          componentCount: 1,
        },
        components: {
          fixtureAction: {
            route: "/salt/components/fixture-action",
            category: "Fixture",
          },
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(componentDir, "index.mdx"),
    `---
layout: DetailComponent
title: Fixture action
data:
  package:
    name: "@salt-ds/fixture"
  description: Fixture source-backed action component.
  sourceCodeUrl: ${
    options.sourceCodeUrl ??
    "https://github.com/jpmorganchase/salt-ds/blob/main/packages/fixture/src/fixture-action/Foo.tsx"
  }
${
  options.componentExportAliases
    ? `  componentExportAliases:
${options.componentExportAliases
  .map((alias) =>
    typeof alias === "string"
      ? `    - "${alias}"`
      : `    - exportName: "${alias.exportName}"
      sourceCodeUrl: "${alias.sourceCodeUrl}"`,
  )
  .join("\n")}
`
    : ""
}
---

Fixture source-backed action component overview.
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(componentDir, "accessibility.mdx"),
    accessibilityContent,
    "utf8",
  );
  await fs.writeFile(
    path.join(componentDir, "examples.mdx"),
    `## Basic fixture action

Fixture source-backed example.

<LivePreview componentName="fixture-action" exampleName="BasicFixtureAction" displayName="Basic fixture action" />
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(exampleDir, "BasicFixtureAction.tsx"),
    options.exampleSourceContent ??
      `export function BasicFixtureAction() {
  return <FixtureAction />;
}
`,
    "utf8",
  );
}

function buildCoreFixturePackage(): PackageRecord {
  return {
    id: "package.salt-ds-core",
    name: "@salt-ds/core",
    status: "stable",
    version: "0.0.0",
    summary: "Core fixture package.",
    source_root: "packages/core",
    changelog_path: null,
    docs_root: "/salt/components",
  };
}

async function writeCardOverrideFixture(
  repoRoot: string,
  linkCardSourceDirectory = "link-card",
): Promise<void> {
  const docsDir = path.join(repoRoot, "site/docs/components/card");
  const sourceRoot = path.join(repoRoot, "packages/core/src");
  await fs.mkdir(docsDir, { recursive: true });
  await fs.mkdir(path.join(sourceRoot, "card"), { recursive: true });
  await fs.mkdir(path.join(sourceRoot, "interactable-card"), {
    recursive: true,
  });
  await fs.mkdir(path.join(sourceRoot, linkCardSourceDirectory), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(repoRoot, "site/component-category-map.json"),
    `${JSON.stringify(
      {
        meta: { componentCount: 1 },
        components: {
          card: { route: "/salt/components/card", category: "Fixture" },
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(docsDir, "index.mdx"),
    `---
layout: DetailComponent
title: Card
data:
  package:
    name: "@salt-ds/core"
  description: Source-backed card fixture.
  sourceCodeUrl: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/card
---

Source-backed card fixture.
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(sourceRoot, "card/index.tsx"),
    "export function Card() { return null; }\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(sourceRoot, "interactable-card/index.tsx"),
    `export function InteractableCard() { return null; }
export function InteractableCardGroup() { return null; }
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(sourceRoot, linkCardSourceDirectory, "index.tsx"),
    "export function LinkCard() { return null; }\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(sourceRoot, "index.ts"),
    `export { Card } from "./card/index.js";
export { InteractableCard, InteractableCardGroup } from "./interactable-card/index.js";
export { LinkCard } from "./${linkCardSourceDirectory}/index.js";
`,
    "utf8",
  );
}

const aliasScopeFixtures = [
  {
    route: "/salt/components/card",
    title: "Card",
    primaryExport: "Card",
    primaryDirectory: "card",
    aliases: [
      ["InteractableCard", "interactable-card"],
      ["InteractableCardGroup", "interactable-card"],
      ["LinkCard", "link-card"],
    ],
  },
  {
    route: "/salt/components/layouts/border-layout",
    title: "Border layout",
    primaryExport: "BorderLayout",
    primaryDirectory: "border-layout",
    aliases: [["BorderItem", "border-item"]],
  },
  {
    route: "/salt/components/layouts/flex-layout",
    title: "Flex layout",
    primaryExport: "FlexLayout",
    primaryDirectory: "flex-layout",
    aliases: [["FlexItem", "flex-item"]],
  },
  {
    route: "/salt/components/layouts/grid-layout",
    title: "Grid layout",
    primaryExport: "GridLayout",
    primaryDirectory: "grid-layout",
    aliases: [["GridItem", "grid-item"]],
  },
  {
    route: "/salt/components/list-box",
    title: "List box",
    primaryExport: "ListBox",
    primaryDirectory: "list-box",
    aliases: [
      ["Option", "option"],
      ["OptionGroup", "option"],
    ],
  },
  {
    route: "/salt/components/text",
    title: "Text",
    primaryExport: "Text",
    primaryDirectory: "text",
    aliases: [
      ["Code", "text"],
      ["Display1", "text"],
      ["Display2", "text"],
      ["Display3", "text"],
      ["Display4", "text"],
      ["H1", "text"],
      ["H2", "text"],
      ["H3", "text"],
      ["H4", "text"],
      ["Label", "text"],
      ["TextAction", "text"],
      ["TextNotation", "text"],
    ],
  },
  {
    route: "/salt/components/toggle-button",
    title: "Toggle button",
    primaryExport: "ToggleButton",
    primaryDirectory: "toggle-button",
    aliases: [["ToggleButtonGroup", "toggle-button-group"]],
  },
] as const;

type AliasScopeFixture = (typeof aliasScopeFixtures)[number];
const displacedAliasScopeFixtures = aliasScopeFixtures.flatMap((fixture) =>
  fixture.aliases.map(([exportName, configuredDirectory]) => ({
    fixture,
    exportName,
    configuredDirectory,
  })),
);

async function writeAliasScopeFixture(
  repoRoot: string,
  fixture: AliasScopeFixture,
  displacedAlias?: string,
): Promise<void> {
  const routeSuffix = fixture.route.slice("/salt/components/".length);
  const docsDir = path.join(repoRoot, "site/docs/components", routeSuffix);
  const sourceRoot = path.join(repoRoot, "packages/core/src");
  await fs.mkdir(docsDir, { recursive: true });
  await fs.writeFile(
    path.join(repoRoot, "site/component-category-map.json"),
    `${JSON.stringify(
      {
        meta: { componentCount: 1 },
        components: {
          fixture: { route: fixture.route, category: "Fixture" },
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(docsDir, "index.mdx"),
    `---
layout: DetailComponent
title: ${fixture.title}
data:
  package:
    name: "@salt-ds/core"
  description: Source-backed alias-scope fixture.
  sourceCodeUrl: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/${fixture.primaryDirectory}
---

Source-backed alias-scope fixture.
`,
    "utf8",
  );

  const exportsByDirectory = new Map<string, string[]>([
    [fixture.primaryDirectory, [fixture.primaryExport]],
  ]);
  for (const [exportName, configuredDirectory] of fixture.aliases) {
    const directory =
      exportName === displacedAlias
        ? `outside-${exportName.toLowerCase()}`
        : configuredDirectory;
    const exports = exportsByDirectory.get(directory) ?? [];
    exports.push(exportName);
    exportsByDirectory.set(directory, exports);
  }

  const rootExports: string[] = [];
  for (const [directory, exportNames] of exportsByDirectory) {
    const sourceDirectory = path.join(sourceRoot, directory);
    await fs.mkdir(sourceDirectory, { recursive: true });
    await fs.writeFile(
      path.join(sourceDirectory, "index.tsx"),
      `${exportNames
        .map(
          (exportName) =>
            `export function ${exportName}() { return null; }`,
        )
        .join("\n")}\n`,
      "utf8",
    );
    rootExports.push(
      `export { ${exportNames.join(", ")} } from "./${directory}/index.js";`,
    );
  }
  await fs.writeFile(
    path.join(sourceRoot, "index.ts"),
    `${rootExports.join("\n")}\n`,
    "utf8",
  );
}

describe("component registry extraction", () => {
  it("omits private workspace packages from the public registry", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-package-registry-fixture-"),
    );

    try {
      const manifests = [
        {
          directory: "core",
          manifest: {
            name: "@salt-ds/core",
            version: "1.2.3",
            description: "Public fixture package.",
          },
        },
        {
          directory: "lab",
          manifest: {
            name: "@salt-ds/lab",
            version: "0.0.0",
            private: true,
          },
        },
      ];
      for (const fixture of manifests) {
        const packageDir = path.join(repoRoot, "packages", fixture.directory);
        await fs.mkdir(packageDir, { recursive: true });
        await fs.writeFile(
          path.join(packageDir, "package.json"),
          `${JSON.stringify(fixture.manifest, null, 2)}\n`,
          "utf8",
        );
      }

      const packages = await extractPackages(repoRoot, new Set());

      expect(packages.map((pkg) => pkg.name)).toEqual(["@salt-ds/core"]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("records source-backed canonical child-export ownership at build time", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-export-owner-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        exampleSourceContent: `import {
  FixtureAction,
  FixtureActionItem as RenamedFixtureActionItem,
  type FixtureActionProps,
  UnrelatedAction,
} from "@salt-ds/fixture";
import type { FixtureActionType } from "@salt-ds/fixture";
import { FixtureActionExternal } from "@salt-ds/external";

export function BasicFixtureAction() {
  return <RenamedFixtureActionItem><FixtureAction /></RenamedFixtureActionItem>;
}
`,
      });

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
      );

      expect(components).toHaveLength(1);
      expect(components[0].package).toEqual({
        name: "@salt-ds/fixture",
        status: "stable",
        since: null,
      });
      expect(components[0].canonical_example_exports).toEqual([
        {
          export_name: "FixtureActionItem",
          example_id: "fixture-action.basicfixtureaction",
          source_url: null,
          source_path:
            "site/src/examples/fixture-action/BasicFixtureAction.tsx",
          export_repo_path: "packages/fixture/src/fixture-action/Foo.tsx",
        },
      ]);
      expect(components[0].source).toEqual({
        repo_path: "packages/fixture/src/fixture-action/Foo.tsx",
        export_name: "FixtureAction",
      });
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("resolves MCP-owned component export aliases through the public graph", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-override-fixture-"),
    );

    try {
      await writeCardOverrideFixture(repoRoot);
      const [component] = await extractComponents(
        repoRoot,
        new Map([["@salt-ds/core", buildCoreFixturePackage()]]),
        { byPackage: new Map() },
      );

      expect(component.aliases).toEqual([
        "InteractableCard",
        "InteractableCardGroup",
        "LinkCard",
      ]);
      expect(component.source).toEqual({
        repo_path: "packages/core/src/card/index.tsx",
        export_name: "Card",
      });
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("rejects an MCP export alias outside its configured source scope", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-override-scope-fixture-"),
    );

    try {
      await writeCardOverrideFixture(repoRoot, "outside-link-card");

      await expect(
        extractComponents(
          repoRoot,
          new Map([["@salt-ds/core", buildCoreFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(
        /export alias 'LinkCard' is not a unique public value export within its MCP source path 'packages\/core\/src\/link-card'/u,
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it.each(aliasScopeFixtures)(
    "resolves every MCP alias for $route within its configured public scope",
    async (fixture) => {
      const repoRoot = await fs.mkdtemp(
        path.join(os.tmpdir(), "salt-component-alias-scope-positive-"),
      );
      try {
        await writeAliasScopeFixture(repoRoot, fixture);
        const [component] = await extractComponents(
          repoRoot,
          new Map([["@salt-ds/core", buildCoreFixturePackage()]]),
          { byPackage: new Map() },
        );
        expect(component.aliases).toEqual(
          fixture.aliases.map(([exportName]) => exportName),
        );
      } finally {
        await fs.rm(repoRoot, { recursive: true, force: true });
      }
    },
  );

  it.each(displacedAliasScopeFixtures)(
    "rejects displaced $exportName evidence outside its authored scope",
    async ({ fixture, exportName, configuredDirectory }) => {
      const repoRoot = await fs.mkdtemp(
        path.join(os.tmpdir(), "salt-component-alias-scope-negative-"),
      );
      try {
        await writeAliasScopeFixture(repoRoot, fixture, exportName);
        const escapedScope = `packages/core/src/${configuredDirectory}`.replace(
          /[.*+?^${}()|[\]\\]/gu,
          "\\$&",
        );
        await expect(
          extractComponents(
            repoRoot,
            new Map([["@salt-ds/core", buildCoreFixturePackage()]]),
            { byPackage: new Map() },
          ),
        ).rejects.toThrow(
          new RegExp(
            `export alias '${exportName}' is not a unique public value export within its MCP source path '${escapedScope}'`,
            "u",
          ),
        );
      } finally {
        await fs.rm(repoRoot, { recursive: true, force: true });
      }
    },
  );

  it("rejects legacy component export-alias frontmatter", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-legacy-alias-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        componentExportAliases: ["FixtureActionItem"],
      });

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(/must not declare data.componentExportAliases/u);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("rejects component source URLs outside the canonical Salt repository", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-source-origin-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        sourceCodeUrl:
          "https://github.com/example/fixture/blob/main/packages/fixture/src/fixture-action/Foo.tsx",
      });

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(/non-canonical Salt sourceCodeUrl/u);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("derives and validates the conventional primary export", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-primary-export-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot);
      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
      );

      expect(components[0].source).toEqual({
        repo_path: "packages/fixture/src/fixture-action/Foo.tsx",
        export_name: "FixtureAction",
      });
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("rejects legacy primaryExport frontmatter", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-primary-export-shape-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot);
      const indexPath = path.join(
        repoRoot,
        "site/docs/components/fixture-action/index.mdx",
      );
      const source = await fs.readFile(indexPath, "utf8");
      await fs.writeFile(
        indexPath,
        source.replace(
          "  package:\n",
          '  primaryExport: "FixtureAction"\n  package:\n',
        ),
        "utf8",
      );

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(/must not declare data\.primaryExport/u);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("rejects a primary export outside the authored source path", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-source-mismatch-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        sourceCodeUrl:
          "https://github.com/jpmorganchase/salt-ds/blob/main/packages/fixture/src/other-component",
      });

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(/outside its authored sourceCodeUrl path/u);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts fixture accessibility guidance from source docs without Best practices and preserves EvidenceRefs", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-registry-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot);

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([
        "Use the fixture action with an explicit accessible label.",
        "Announce fixture state changes through source-backed fixture text.",
      ]);
      expect(component.accessibility.summary.join(" ")).not.toMatch(
        /Keyboard interactions|Moves focus|Tab/i,
      );
      expect(component.accessibility.rules).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps keyboard-only fixture accessibility docs as a registry gap without inventing claims", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-keyboard-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        accessibilityContent: `---
title: Fixture action accessibility
---

## Keyboard interactions

<KeyboardControls>
  <KeyboardControl keyOrCombos={["Tab"]} description="Moves focus to the fixture action." />
</KeyboardControls>
`,
      });

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([]);
      expect(component.accessibility.rules).toEqual([]);
      expect(component.accessibility.implementation_signals).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("removes keyboard controls before extracting Best practices guidance", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-best-practices-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        accessibilityContent: `---
title: Fixture action accessibility
---

## Best practices

<KeyboardControls>
  <KeyboardControl keyOrCombos={["Tab"]} description="Moves focus to the fixture action." />
</KeyboardControls>

- Keep the fixture action label concise.
`,
      });

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
      );

      expect(components[0]?.accessibility.summary).toEqual([
        "Keep the fixture action label concise.",
      ]);
      expect(components[0]?.accessibility.summary.join(" ")).not.toMatch(
        /Moves focus|KeyboardControl|Tab/i,
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts source-backed fixture ARIA implementation signals when accessibility docs are keyboard-only", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-source-a11y-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        accessibilityContent: `---
title: Fixture action accessibility
---

## Keyboard interactions

<KeyboardControls>
  <KeyboardControl keyOrCombos={["Tab"]} description="Moves focus to the fixture action." />
</KeyboardControls>
`,
        sourceContent: `export function FixtureAction() {
  return (
    <AriaAnnouncerProvider>
      <button
        role="switch"
        aria-label="Fixture source label"
        aria-describedby="fixture-description"
      >
        <span aria-hidden="true" />
      </button>
    </AriaAnnouncerProvider>
  );
}
`,
      });

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([]);
      expect(component.accessibility.implementation_signals).toEqual([
        {
          kind: "aria_announcement",
          values: ["ARIA announcer utility"],
          source_kind: "source",
          source_url: null,
          source_path: "packages/fixture/src/fixture-action/Foo.tsx",
        },
        {
          kind: "aria_attribute",
          values: ["aria-describedby", "aria-hidden", "aria-label"],
          source_kind: "source",
          source_url: null,
          source_path: "packages/fixture/src/fixture-action/Foo.tsx",
        },
        {
          kind: "aria_role",
          values: ["switch"],
          source_kind: "source",
          source_url: null,
          source_path: "packages/fixture/src/fixture-action/Foo.tsx",
        },
      ]);
      expect(component.accessibility.rules).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("does not promote fixture source focus plumbing into accessibility summaries", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-focus-source-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        accessibilityContent: `---
title: Fixture action accessibility
---

## Keyboard interactions

<KeyboardControls>
  <KeyboardControl keyOrCombos={["Tab"]} description="Moves focus to the fixture action." />
</KeyboardControls>
`,
        sourceContent: `export function FixtureAction() {
  return <button tabIndex={0} onFocus={() => undefined}>Fixture</button>;
}
`,
      });

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([]);
      expect(component.accessibility.rules).toEqual([]);
      expect(component.accessibility.implementation_signals).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });
});
