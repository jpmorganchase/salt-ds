import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractComponents,
  extractPackages,
} from "../build/buildRegistryComponents.js";
import type { PackageRecord } from "../types.js";

// All Salt-looking strings in this file are intentionally tiny fixture facts.
const GENERATED_AT = "2026-05-03T00:00:00.000Z";
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
    exampleSourceContent?: string;
    sourceContent?: string;
  } = {},
): Promise<void> {
  const componentDir = path.join(
    repoRoot,
    "site/docs/components/fixture-action",
  );
  const exampleDir = path.join(repoRoot, "site/src/examples/fixture-action");
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
  if (options.sourceContent) {
    const sourceDir = path.join(
      repoRoot,
      "packages/fixture/src/fixture-action",
    );
    await fs.mkdir(sourceDir, { recursive: true });
    await fs.writeFile(
      path.join(sourceDir, "Foo.tsx"),
      options.sourceContent,
      "utf8",
    );
  }
  await fs.writeFile(
    path.join(repoRoot, "site/component-category-map.json"),
    `${JSON.stringify(
      {
        components: {
          fixtureAction: {
            route: "/salt/components/fixture-action/index",
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
  sourceCodeUrl: https://github.com/example/fixture/blob/main/packages/fixture/src/fixture-action/Foo.tsx
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
        GENERATED_AT,
      );

      expect(components).toHaveLength(1);
      expect(components[0].canonical_example_exports).toEqual([
        {
          export_name: "FixtureActionItem",
          example_id: "fixture-action.basicfixtureaction",
          source_url: "/salt/components/fixture-action/examples",
        },
      ]);
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
        GENERATED_AT,
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
      expect(component.accessibility.rules).toEqual([
        {
          id: "fixture-action-a11y-1",
          severity: "warning",
          rule: "Use the fixture action with an explicit accessible label.",
        },
        {
          id: "fixture-action-a11y-2",
          severity: "warning",
          rule: "Announce fixture state changes through source-backed fixture text.",
        },
      ]);
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
        GENERATED_AT,
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([]);
      expect(component.accessibility.rules).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts source-backed fixture ARIA implementation summaries when accessibility docs are keyboard-only", async () => {
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
        GENERATED_AT,
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([
        "Fixture action source declares ARIA role: `switch`.",
        "Fixture action source declares ARIA attributes: `aria-describedby`, `aria-hidden`, `aria-label`.",
        "Fixture action source uses the ARIA announcer utility.",
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
        GENERATED_AT,
      );

      expect(components).toHaveLength(1);
      const component = components[0];
      expect(component.accessibility.summary).toEqual([]);
      expect(component.accessibility.rules).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });
});
