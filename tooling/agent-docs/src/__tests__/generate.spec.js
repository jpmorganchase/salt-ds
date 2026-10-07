import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { GENERATED_MARKER } from "../config.mjs";
import { pathExists } from "../files.mjs";
import {
  AgentDocsError,
  findBrokenLinks,
  generateAgentDocs,
} from "../generate.mjs";

const fixtureFiles = {
  "packages/core/package.json": {
    name: "@salt-ds/core",
    version: "1.2.3",
    files: ["dist-es", "docs"],
  },
  "packages/theme/package.json": {
    name: "@salt-ds/theme",
    version: "4.5.6",
    files: ["/css", "/docs"],
  },
  "packages/theme/src/css/foundations/spacing.css":
    ".salt-theme { --salt-spacing-100: 8px; }",
  "packages/theme/src/css/next/palette/accent.css":
    ".salt-theme { --salt-palette-accent: blue; }",
  "packages/theme/src/css/next/characteristics/actionable.css":
    ".salt-theme { --salt-actionable-bold-background: var(--salt-palette-accent); }",
  "packages/theme/src/css/deprecated/characteristics.css":
    ".salt-theme { --salt-old-background: var(--salt-actionable-bold-background); --salt-old-accent: var(--salt-palette-accent); }",
  "site/src/examples/patterns/forms/index.ts":
    'export * from "./Compact";\nexport * from "./Standard";\n',
  "site/src/examples/patterns/forms/Standard.tsx":
    "export const Standard = () => null;\n",
  "site/src/examples/patterns/forms/Compact.tsx":
    "export const Compact = () => null;\n",
  "site/src/examples/button/Primary.tsx":
    'import "./styles.css";\n\nexport const Primary = () => null;\n',
  "site/src/examples/button/styles.css": ".primary {}\n",
  "site/docs/components/button/index.mdx": `---
title: Button
data:
  description: "\`Button\` triggers an action. See [dialogs](../dialog)."
  package:
    name: "@salt-ds/core"
  alsoKnownAs: ["Action"]
  relatedComponents: [{ name: "Dialog", relationship: "similarTo" }]
  relatedPatterns: ["Forms"]
layout: DetailComponent
---
`,
  "site/docs/components/button/usage.mdx": `---
title:
  $ref: ./#/title
layout: DetailComponent
---

## Using the component

Use buttons in [forms](/salt/patterns/forms) with [spacing](/salt/foundations/spacing).

<PropsTable componentName="Button" />
`,
  "site/docs/components/button/examples.mdx": `---
layout: DetailComponent
---

## Primary

<LivePreview componentName="button" exampleName="Primary" />
`,
  "site/docs/components/button/accessibility.mdx": `---
layout: DetailComponent
---

## Keyboard interactions

<KeyboardControls>
<KeyboardControl keyOrCombos="Enter">
Activates the button.
</KeyboardControl>
</KeyboardControls>
`,
  "site/docs/components/dialog/index.mdx": `---
title: Dialog
data:
  description: "\`Dialog\` opens over content."
  package:
    name: "@salt-ds/core"
layout: DetailComponent
---
`,
  "site/docs/components/dialog/alert-dialog/index.mdx": `---
title: Alert dialog
data:
  description: "\`AlertDialog\` interrupts the user."
layout: DetailComponent
---
`,
  "site/docs/patterns/forms.mdx": `---
title: Forms
description: "Forms capture data."
layout: DetailPattern
---

## Layout

Stack fields vertically.

<LivePreview componentName="patterns/forms" exampleName="Standard" />

<LivePreview componentName="patterns/forms" exampleName="Compact" />
`,
  "site/docs/foundations/spacing.mdx": `---
title: Spacing
layout: DetailTechnical
---

Spacing positions elements.

<TokenTableWithControls tokens={["--salt-spacing-100"]} />
`,
  "site/docs/themes/design-tokens/index.mdx": `---
title: Design tokens
layout: DetailTechnical
---

Tokens capture design choices.
`,
  "site/docs/about/roadmap.mdx": `---
title: Roadmap
---

Skipped.
`,
};

const propsProvider = {
  get: (packageDirectory, componentName) =>
    packageDirectory === "core" && componentName === "Button"
      ? {
          props: {
            appearance: {
              name: "appearance",
              type: { name: "enum", value: [{ value: '"solid"' }] },
              description: "The appearance.",
            },
          },
        }
      : undefined,
};

const roots = [];

async function createFixture(overrides = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "salt-agent-docs-"));
  roots.push(root);
  for (const [file, content] of Object.entries({
    ...fixtureFiles,
    ...overrides,
  })) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(
      target,
      typeof content === "string" ? content : JSON.stringify(content),
    );
  }
  return root;
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("findBrokenLinks", () => {
  it("checks relative and cross-package links but not code or URLs", () => {
    const outputs = new Map([
      [
        "@salt-ds/core",
        {
          files: new Map([
            [
              "components/button.md",
              "[ok](./dialog.md#focus) [theme](@salt-ds/theme/docs/tokens.md) [web](https://example.com) [missing](../patterns/nope.md) [site](/salt/x)\n\n```md\n[ignored](./nope.md)\n```\n",
            ],
            ["components/dialog.md", ""],
          ]),
        },
      ],
      ["@salt-ds/theme", { files: new Map([["tokens.md", ""]]) }],
    ]);
    expect(findBrokenLinks(outputs)).toEqual([
      "@salt-ds/core/docs/components/button.md: broken link ../patterns/nope.md.",
      "@salt-ds/core/docs/components/button.md: broken link /salt/x.",
    ]);
  });
});

describe("generateAgentDocs", () => {
  it("writes version-matched docs into each owning package", async () => {
    const repoRoot = await createFixture();
    const result = await generateAgentDocs({ repoRoot, propsProvider });

    expect([...result.packages.keys()]).toEqual([
      "@salt-ds/core",
      "@salt-ds/theme",
    ]);
    expect(
      [...result.outputs.get("@salt-ds/core").files.keys()].sort(),
    ).toEqual([
      "agents-md.mjs",
      "components/button.md",
      "components/dialog.md",
      "components/dialog/alert-dialog.md",
      "index.md",
      "manifest.json",
      "patterns/forms.md",
    ]);

    const button = await readFile(
      path.join(repoRoot, "packages/core/docs/components/button.md"),
      "utf8",
    );
    expect(button).toContain(
      "# Button\n\n`Button` triggers an action. See [dialogs](./dialog.md).",
    );
    expect(button).toContain("- Package: `@salt-ds/core@1.2.3`");
    expect(button).toContain("- Also known as: Action");
    expect(button).toContain("[Dialog](./dialog.md) (similar to)");
    expect(button).toContain("[Forms](../patterns/forms.md)");
    expect(button).toContain("## Usage\n\n### Using the component");
    expect(button).toContain(
      "[spacing](@salt-ds/theme/docs/foundations/spacing.md)",
    );
    expect(button).toContain(
      '| `appearance` | `"solid"` | - | The appearance. |',
    );
    expect(button).toContain("## Examples\n\n### Primary");
    expect(button).toContain("Supporting file `./styles.css`:");
    expect(button).toContain("## Accessibility");
    expect(button).toContain("- **Enter**");
    // Accessibility comes before the examples, which are the longest part.
    expect(button.indexOf("## Usage")).toBeLessThan(
      button.indexOf("## Accessibility"),
    );
    expect(button.indexOf("## Accessibility")).toBeLessThan(
      button.indexOf("## Examples"),
    );

    const alertDialog = result.outputs
      .get("@salt-ds/core")
      .files.get("components/dialog/alert-dialog.md");
    expect(alertDialog).toContain("- Package: `@salt-ds/core@1.2.3`");

    const forms = result.outputs
      .get("@salt-ds/core")
      .files.get("patterns/forms.md");
    expect(forms).toContain(
      "_Example:_ `Standard`\n\n```tsx\nexport const Standard = () => null;\n```",
    );
    expect(forms).toContain(
      "_Example:_ `Compact`\n\n```tsx\nexport const Compact = () => null;\n```",
    );

    const index = await readFile(
      path.join(repoRoot, "packages/core/docs/index.md"),
      "utf8",
    );
    expect(index.split("\n", 1)[0]).toBe(GENERATED_MARKER);
    expect(index).toContain(
      "- [Button](components/button.md): Button triggers an action. See dialogs. Also known as: Action.",
    );
    expect(index).toContain("- `@salt-ds/theme/docs/index.md`");

    const manifest = JSON.parse(
      await readFile(
        path.join(repoRoot, "packages/core/docs/manifest.json"),
        "utf8",
      ),
    );
    expect(manifest).toMatchObject({ name: "@salt-ds/core", version: "1.2.3" });
    expect(manifest.pages).toContainEqual({
      path: "components/button.md",
      title: "Button",
      section: "components",
      aliases: ["Action"],
    });
    expect(manifest.pages.map((page) => page.path)).toEqual([
      "components/button.md",
      "components/dialog.md",
      "components/dialog/alert-dialog.md",
      "patterns/forms.md",
    ]);
    expect(result.agentsBlockBytes).toBeGreaterThan(0);

    const spacing = result.outputs
      .get("@salt-ds/theme")
      .files.get("foundations/spacing.md");
    expect(spacing).toContain(
      "Token: `--salt-spacing-100` ([token reference](../tokens.md)).",
    );

    const tokens = result.outputs.get("@salt-ds/theme").files.get("tokens.md");
    expect(tokens).toContain(
      "### actionable\n\n- `--salt-actionable-bold-background`",
    );
    expect(tokens).toContain(
      "- `--salt-old-background`: alias of `--salt-actionable-bold-background`",
    );
    expect(tokens).toContain("- `--salt-old-accent`\n");
    expect(tokens).not.toContain("alias of `--salt-palette-accent`");
  });

  it("replaces previously generated docs", async () => {
    const repoRoot = await createFixture();
    await generateAgentDocs({ repoRoot, propsProvider });
    const stale = path.join(repoRoot, "packages/core/docs/components/stale.md");
    await writeFile(stale, "old");
    await generateAgentDocs({ repoRoot, propsProvider });
    expect(await pathExists(stale)).toBe(false);
  });

  it("refuses to replace a docs folder it did not generate", async () => {
    const repoRoot = await createFixture({
      "packages/core/docs/notes.md": "Hand-written notes.",
    });
    const error = await generateAgentDocs({ repoRoot, propsProvider }).catch(
      (caught) => caught,
    );
    expect(error).toBeInstanceOf(AgentDocsError);
    expect(error.message).toContain(
      "Refusing to replace packages/core/docs: it was not generated by tooling/agent-docs",
    );
    expect(
      await pathExists(path.join(repoRoot, "packages/core/docs/notes.md")),
    ).toBe(true);
    expect(await pathExists(path.join(repoRoot, "packages/theme/docs"))).toBe(
      false,
    );
  });

  it("replaces a docs folder that an interrupted run left without files", async () => {
    const repoRoot = await createFixture();
    await mkdir(path.join(repoRoot, "packages/core/docs/components/dialog"), {
      recursive: true,
    });
    await generateAgentDocs({ repoRoot, propsProvider });
    expect(
      await pathExists(path.join(repoRoot, "packages/core/docs/index.md")),
    ).toBe(true);
  });

  it("files component pages under the package they declare, whatever their layout", async () => {
    const repoRoot = await createFixture({
      "packages/lab/package.json": {
        name: "@salt-ds/lab",
        version: "1.0.0-alpha.1",
        files: ["dist-es", "docs"],
      },
      "site/docs/components/layouts/deck-layout/index.mdx": `---
title: Deck layout
data:
  description: "\`DeckLayout\` shows one page at a time."
  package:
    name: "@salt-ds/lab"
  alsoKnownAs: ["Slide deck"]
layout: DetailTechnical
---

Use \`DeckLayout\` for slides.
`,
    });
    const result = await generateAgentDocs({
      repoRoot,
      propsProvider,
      write: false,
    });
    const deck = result.outputs
      .get("@salt-ds/lab")
      .files.get("components/layouts/deck-layout.md");
    expect(deck).toContain("- Package: `@salt-ds/lab@1.0.0-alpha.1`");
    expect(deck).toContain("- Also known as: Slide deck");
    expect(deck).toContain("Use `DeckLayout` for slides.");
    expect(
      result.outputs
        .get("@salt-ds/core")
        .files.has("components/layouts/deck-layout.md"),
    ).toBe(false);
  });

  it("warns when a page stays too long to read in one go", async () => {
    const repoRoot = await createFixture({
      "site/docs/patterns/forms.mdx": `---
title: Forms
layout: DetailPattern
---

${"Stack fields vertically.\n\n".repeat(1000)}
`,
    });
    const result = await generateAgentDocs({
      repoRoot,
      propsProvider,
      write: false,
    });
    expect(result.warnings).toContainEqual(
      expect.stringMatching(
        /^@salt-ds\/core\/docs\/patterns\/forms\.md is \d+ KB .*site\/docs\/patterns\/forms\.mdx\.$/,
      ),
    );
    expect(result.notes).not.toContainEqual(
      expect.stringContaining("patterns/forms.md is"),
    );
  });

  it("suggests shortening a page longer than agents usually read", async () => {
    const repoRoot = await createFixture({
      "site/docs/patterns/forms.mdx": `---
title: Forms
layout: DetailPattern
---

${"Stack fields vertically.\n\n".repeat(150)}
`,
    });
    const result = await generateAgentDocs({
      repoRoot,
      propsProvider,
      write: false,
    });
    expect(result.warnings).toEqual([]);
    expect(result.notes).toContainEqual(
      expect.stringMatching(
        /^@salt-ds\/core\/docs\/patterns\/forms\.md is \d+ lines, .*site\/docs\/patterns\/forms\.mdx\.$/,
      ),
    );
  });

  it("fails when a package would not publish its docs", async () => {
    const repoRoot = await createFixture({
      "packages/theme/package.json": {
        name: "@salt-ds/theme",
        version: "4.5.6",
        files: ["/css"],
      },
    });
    const error = await generateAgentDocs({ repoRoot, propsProvider }).catch(
      (caught) => caught,
    );
    expect(error).toBeInstanceOf(AgentDocsError);
    expect(error.errors).toEqual([
      '@salt-ds/theme: add "docs" to "files" in packages/theme/package.json so its generated docs are published.',
    ]);
    expect(await pathExists(path.join(repoRoot, "packages/core/docs"))).toBe(
      false,
    );
  });

  it("writes nothing in check mode", async () => {
    const repoRoot = await createFixture();
    const result = await generateAgentDocs({
      repoRoot,
      propsProvider,
      write: false,
    });
    expect(result.packages.get("@salt-ds/core").files).toBe(7);
    expect(await pathExists(path.join(repoRoot, "packages/core/docs"))).toBe(
      false,
    );
  });

  it("reports unsupported MDX with its location", async () => {
    const repoRoot = await createFixture({
      "site/docs/patterns/forms.mdx": `---
title: Forms
layout: DetailPattern
---

<Unknown />
`,
    });
    await expect(
      generateAgentDocs({ repoRoot, propsProvider }),
    ).rejects.toThrow(
      "site/docs/patterns/forms.mdx:6: Unsupported MDX component <Unknown>.",
    );
  });
});
