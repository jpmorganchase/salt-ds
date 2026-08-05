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
  primaryExport: "FixtureAction"
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

async function writeFixtureLayoutOwnerDocs(
  repoRoot: string,
  options: {
    componentExportAliases?: FixtureComponentExportAlias[];
    exampleSourceContent: string;
  },
): Promise<void> {
  const componentDir = path.join(
    repoRoot,
    "site/docs/components/fixture-action-layout",
  );
  const exampleDir = path.join(
    repoRoot,
    "site/src/examples/fixture-action-layout",
  );
  await fs.mkdir(componentDir, { recursive: true });
  await fs.mkdir(exampleDir, { recursive: true });

  const categoryMapPath = path.join(
    repoRoot,
    "site/component-category-map.json",
  );
  const categoryMap = JSON.parse(
    await fs.readFile(categoryMapPath, "utf8"),
  ) as {
    meta: { componentCount: number };
    components: Record<
      string,
      {
        route: string;
        category: string;
      }
    >;
  };
  categoryMap.meta.componentCount += 1;
  categoryMap.components.fixtureActionLayout = {
    route: "/salt/components/fixture-action-layout",
    category: "Fixture",
  };
  await fs.writeFile(
    categoryMapPath,
    `${JSON.stringify(categoryMap, null, 2)}\n`,
    "utf8",
  );

  await fs.writeFile(
    path.join(componentDir, "index.mdx"),
    `---
layout: DetailComponent
title: Fixture action layout
data:
  package:
    name: "@salt-ds/fixture"
  primaryExport: "FixtureActionLayout"
  description: Fixture source-backed layout component.
  sourceCodeUrl: https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/fixture-action/nested
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

Fixture source-backed layout component overview.
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(componentDir, "examples.mdx"),
    `## Basic fixture action layout

Fixture source-backed layout example.

<LivePreview componentName="fixture-action-layout" exampleName="BasicFixtureActionLayout" displayName="Basic fixture action layout" />
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(exampleDir, "BasicFixtureActionLayout.tsx"),
    options.exampleSourceContent,
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
          directory: "public-fixture",
          manifest: {
            name: "@salt-ds/public-fixture",
            version: "1.2.3",
            description: "Public fixture package.",
          },
        },
        {
          directory: "private-fixture",
          manifest: {
            name: "@salt-ds/private-fixture",
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

      expect(packages.map((pkg) => pkg.name)).toEqual([
        "@salt-ds/public-fixture",
      ]);
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

  it("uses the authored source scope to prove non-prefix export ownership", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-source-scope-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        sourceCodeUrl:
          "https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/fixture-action",
        componentExportAliases: [
          "H1",
          "H2",
          {
            exportName: "H3",
            sourceCodeUrl:
              "https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/outside",
          },
        ],
        exampleSourceContent: `import {
  FixtureAction,
  H1,
  H2,
  H3,
  FixtureActionOutside,
} from "@salt-ds/fixture";

export function BasicFixtureAction() {
  return <H1><H2><H3><FixtureAction /></H3></H2></H1>;
}
`,
      });
      const packageSourceDir = path.join(repoRoot, "packages/fixture/src");
      const componentSourceDir = path.join(packageSourceDir, "fixture-action");
      const outsideSourceDir = path.join(packageSourceDir, "outside");
      await fs.mkdir(outsideSourceDir, { recursive: true });
      await fs.writeFile(
        path.join(componentSourceDir, "Headings.tsx"),
        `export function H1() {
  return null;
}

export function H2() {
  return null;
}
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(componentSourceDir, "index.ts"),
        `export { FixtureAction, FixtureActionItem } from "./Foo.js";
export { H1, H2 } from "./Headings.js";
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(outsideSourceDir, "FixtureActionOutside.tsx"),
        `export function FixtureActionOutside() {
  return null;
}

export function H3() {
  return null;
}
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(packageSourceDir, "index.ts"),
        `export {
  FixtureAction,
  FixtureActionItem,
  H1,
  H2,
} from "./fixture-action/index.js";
export {
  FixtureActionOutside,
  H3,
} from "./outside/FixtureActionOutside.js";
`,
        "utf8",
      );

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
      );

      expect(components).toHaveLength(1);
      expect(components[0].canonical_example_exports).toEqual([
        {
          export_name: "H1",
          example_id: "fixture-action.basicfixtureaction",
          source_url: null,
          source_path:
            "site/src/examples/fixture-action/BasicFixtureAction.tsx",
          export_repo_path: "packages/fixture/src/fixture-action/Headings.tsx",
        },
        {
          export_name: "H2",
          example_id: "fixture-action.basicfixtureaction",
          source_url: null,
          source_path:
            "site/src/examples/fixture-action/BasicFixtureAction.tsx",
          export_repo_path: "packages/fixture/src/fixture-action/Headings.tsx",
        },
        {
          export_name: "H3",
          example_id: "fixture-action.basicfixtureaction",
          source_url: null,
          source_path:
            "site/src/examples/fixture-action/BasicFixtureAction.tsx",
          export_repo_path:
            "packages/fixture/src/outside/FixtureActionOutside.tsx",
        },
      ]);
      expect(
        components[0].canonical_example_exports?.some(
          (candidate) => candidate.export_name === "FixtureActionOutside",
        ),
      ).toBe(false);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("requires exact authored scope for sibling-source subcomponent ownership", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-sibling-subcomponent-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        componentExportAliases: [
          {
            exportName: "FixtureActionGroup",
            sourceCodeUrl:
              "https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/sibling",
          },
        ],
        exampleSourceContent: `import {
  FixtureAction,
  FixtureActionGroup,
  FixtureActionOutside,
} from "@salt-ds/fixture";

export function BasicFixtureAction() {
  return (
    <FixtureActionGroup>
      <FixtureAction />
      <FixtureActionOutside />
    </FixtureActionGroup>
  );
}
`,
      });
      const packageSourceDir = path.join(repoRoot, "packages/fixture/src");
      const siblingSourceDir = path.join(packageSourceDir, "sibling");
      await fs.mkdir(siblingSourceDir, { recursive: true });
      await fs.writeFile(
        path.join(siblingSourceDir, "SiblingActions.tsx"),
        `export function FixtureActionGroup() {
  return null;
}

export function FixtureActionOutside() {
  return null;
}
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(packageSourceDir, "index.ts"),
        `export { FixtureAction, FixtureActionItem } from "./fixture-action/Foo.js";
export {
  FixtureActionGroup,
  FixtureActionOutside,
} from "./sibling/SiblingActions.js";
`,
        "utf8",
      );

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        {
          byPackage: new Map([
            [
              "@salt-ds/fixture",
              new Map([
                [
                  "fixtureaction",
                  [{ displayName: "FixtureAction", props: {} }],
                ],
                [
                  "fixtureactiongroup",
                  [{ displayName: "FixtureActionGroup", props: {} }],
                ],
                [
                  "fixtureactionitem",
                  [{ displayName: "FixtureActionItem", props: {} }],
                ],
                [
                  "fixtureactionoutside",
                  [{ displayName: "FixtureActionOutside", props: {} }],
                ],
              ]),
            ],
          ]),
        },
      );

      expect(components[0].sub_components).toEqual([
        {
          name: "Group",
          export_name: "FixtureActionGroup",
          props: [],
          repo_path: "packages/fixture/src/sibling/SiblingActions.tsx",
        },
        {
          name: "Item",
          export_name: "FixtureActionItem",
          props: [],
          repo_path: "packages/fixture/src/fixture-action/Foo.tsx",
        },
      ]);
      expect(components[0].canonical_example_exports).toBeUndefined();
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps explicit export ownership authoritative over a deeper implicit scope", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-explicit-owner-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        sourceCodeUrl:
          "https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/fixture-action",
        componentExportAliases: [
          {
            exportName: "FixtureActionShared",
            sourceCodeUrl:
              "https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/fixture-action",
          },
        ],
        exampleSourceContent: `import {
  FixtureAction,
  FixtureActionShared,
} from "@salt-ds/fixture";

export function BasicFixtureAction() {
  return <FixtureActionShared><FixtureAction /></FixtureActionShared>;
}
`,
      });
      await writeFixtureLayoutOwnerDocs(repoRoot, {
        exampleSourceContent: `import {
  FixtureActionLayout,
  FixtureActionShared,
} from "@salt-ds/fixture";

export function BasicFixtureActionLayout() {
  return <FixtureActionLayout><FixtureActionShared /></FixtureActionLayout>;
}
`,
      });
      const packageSourceDir = path.join(repoRoot, "packages/fixture/src");
      const nestedSourceDir = path.join(
        packageSourceDir,
        "fixture-action/nested",
      );
      await fs.mkdir(nestedSourceDir, { recursive: true });
      await fs.writeFile(
        path.join(nestedSourceDir, "SharedActions.tsx"),
        `export function FixtureActionLayout() {
  return null;
}

export function FixtureActionShared() {
  return null;
}
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(packageSourceDir, "index.ts"),
        `export { FixtureAction, FixtureActionItem } from "./fixture-action/Foo.js";
export {
  FixtureActionLayout,
  FixtureActionShared,
} from "./fixture-action/nested/SharedActions.js";
`,
        "utf8",
      );

      const components = await extractComponents(
        repoRoot,
        new Map([[buildFixturePackage().name, buildFixturePackage()]]),
        { byPackage: new Map() },
      );
      const explicitOwner = components.find(
        (component) => component.source.export_name === "FixtureAction",
      );
      const implicitCandidate = components.find(
        (component) => component.source.export_name === "FixtureActionLayout",
      );

      expect(explicitOwner?.canonical_example_exports).toEqual([
        {
          export_name: "FixtureActionShared",
          example_id: "fixture-action.basicfixtureaction",
          source_url: null,
          source_path:
            "site/src/examples/fixture-action/BasicFixtureAction.tsx",
          export_repo_path:
            "packages/fixture/src/fixture-action/nested/SharedActions.tsx",
        },
      ]);
      expect(implicitCandidate?.canonical_example_exports).toBeUndefined();

      const layoutIndexPath = path.join(
        repoRoot,
        "site/docs/components/fixture-action-layout/index.mdx",
      );
      const layoutIndex = await fs.readFile(layoutIndexPath, "utf8");
      await fs.writeFile(
        layoutIndexPath,
        layoutIndex.replace(
          "  description: Fixture source-backed layout component.",
          `  componentExportAliases:
    - exportName: "FixtureActionShared"
      sourceCodeUrl: "https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/fixture-action/nested"
  description: Fixture source-backed layout component.`,
        ),
        "utf8",
      );
      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(
        /Authored export alias 'FixtureActionShared' has conflicting component owners/u,
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("rejects an export alias whose origin is outside its exact authored scope", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-alias-source-mismatch-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        componentExportAliases: [
          {
            exportName: "FixtureActionOutside",
            sourceCodeUrl:
              "https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/fixture-action",
          },
        ],
      });
      const packageSourceDir = path.join(repoRoot, "packages/fixture/src");
      const outsideSourceDir = path.join(packageSourceDir, "outside");
      await fs.mkdir(outsideSourceDir, { recursive: true });
      await fs.writeFile(
        path.join(outsideSourceDir, "FixtureActionOutside.tsx"),
        `export function FixtureActionOutside() {
  return null;
}
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(packageSourceDir, "index.ts"),
        `export { FixtureAction, FixtureActionItem } from "./fixture-action/Foo.js";
export { FixtureActionOutside } from "./outside/FixtureActionOutside.js";
`,
        "utf8",
      );

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(
        /export alias 'FixtureActionOutside' is not a unique public value export within its authored sourceCodeUrl scope/u,
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("rejects duplicate authored component export aliases", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-alias-duplicate-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        componentExportAliases: ["FixtureActionItem", "FixtureActionItem"],
      });

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(/contains duplicate export name 'FixtureActionItem'/u);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("rejects extra keys in source-scoped export alias records", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-alias-shape-fixture-"),
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
          "  description: Fixture source-backed action component.",
          `  componentExportAliases:
    - exportName: "FixtureActionItem"
      sourceCodeUrl: "https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/fixture-action"
      sourcePath: "packages/fixture/src/fixture-action"
  description: Fixture source-backed action component.`,
        ),
        "utf8",
      );

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(
        /records must contain exactly exportName and sourceCodeUrl/u,
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it.each([
    {
      label: "wrong-case export",
      aliases: ["fixtureActionItem"] satisfies FixtureComponentExportAlias[],
      error:
        /export alias 'fixtureActionItem' is not a unique public value export/u,
    },
    {
      label: "foreign-package source URL",
      aliases: [
        {
          exportName: "FixtureActionItem",
          sourceCodeUrl:
            "https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/button",
        },
      ] satisfies FixtureComponentExportAlias[],
      error:
        /sourceCodeUrl belongs to '@salt-ds\/core', not '@salt-ds\/fixture'/u,
    },
  ])("rejects a $label alias declaration", async ({ aliases, error }) => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-alias-identity-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        componentExportAliases: aliases,
      });

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(error);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("rejects an alias with ambiguous public value origins", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-alias-ambiguous-fixture-"),
    );

    try {
      await writeFixtureRepo(repoRoot, {
        sourceCodeUrl:
          "https://github.com/jpmorganchase/salt-ds/tree/main/packages/fixture/src/fixture-action",
        componentExportAliases: ["FixtureActionAmbiguous"],
      });
      const packageSourceDir = path.join(repoRoot, "packages/fixture/src");
      const componentSourceDir = path.join(packageSourceDir, "fixture-action");
      await fs.writeFile(
        path.join(componentSourceDir, "AmbiguousA.ts"),
        "export const FixtureActionAmbiguous = 1;\n",
        "utf8",
      );
      await fs.writeFile(
        path.join(componentSourceDir, "AmbiguousB.ts"),
        "export const FixtureActionAmbiguous = 2;\n",
        "utf8",
      );
      await fs.writeFile(
        path.join(packageSourceDir, "index.ts"),
        `export { FixtureAction, FixtureActionItem } from "./fixture-action/Foo.js";
export * from "./fixture-action/AmbiguousA.js";
export * from "./fixture-action/AmbiguousB.js";
`,
        "utf8",
      );

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(
        /export alias 'FixtureActionAmbiguous' is not a unique public value export/u,
      );
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

  it("requires an explicit authored primary export decision", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-component-primary-export-fixture-"),
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
        source.replace(/^\s+primaryExport:.*\n/mu, ""),
        "utf8",
      );

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(/must explicitly declare data\.primaryExport/u);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it.each([
    "7",
    "false",
    "[]",
    '""',
    '" FixtureAction "',
  ])("rejects malformed authored primaryExport value %s", async (primaryExportValue) => {
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
          /^\s+primaryExport:.*$/mu,
          `  primaryExport: ${primaryExportValue}`,
        ),
        "utf8",
      );

      await expect(
        extractComponents(
          repoRoot,
          new Map([[buildFixturePackage().name, buildFixturePackage()]]),
          { byPackage: new Map() },
        ),
      ).rejects.toThrow(
        /data\.primaryExport must be a non-empty JavaScript export name or null/u,
      );
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
