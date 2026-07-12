import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { extractGuides } from "../core/build/buildRegistryDocs.js";

const TIMESTAMP = "2026-03-10T00:00:00Z";
const tempRoots: string[] = [];

// Fixture-only documentation snippets in this file are synthetic source inputs
// for registry extraction tests; they are not sources of Salt truth.

async function createTempRepo(structure: Record<string, string>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-guide-docs-"));
  tempRoots.push(root);

  for (const [relativePath, source] of Object.entries(structure)) {
    const absolutePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, source, "utf8");
  }

  return root;
}

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe("extractGuides", () => {
  it("extracts only getting-started guides explicitly marked for AI use", async () => {
    const repoRoot = await createTempRepo({
      "site/docs/getting-started/developing.mdx": `---
title: Developing with Salt
description: Learn how to bootstrap a React app with Salt.
salt_ai_guide: true
---

Install Salt in a React app.

## The step-by-step process

### 1. Install packages

Install \`@salt-ds/fixture-core\` and \`@salt-ds/fixture-theme\`.

### 2. Add the theme

Import the fixture theme and start with [Fixture Button](/salt/components/fixture-button).
`,
      "site/docs/getting-started/choosing-the-right-primitive.mdx": `---
title: Choosing the right primitive
description: Choose the most constrained Salt option first.
salt_ai_guide: true
---

Choose the best primitive for the user intent.

## Start with user intent

Use [Fixture Button](/salt/components/fixture-button) for actions and [Fixture Link](/salt/components/fixture-link) for navigation.

## Common decisions

### Fixture Button or Fixture Link

Use Fixture Button for actions and Fixture Link for navigation.
`,
      "site/docs/getting-started/not-for-ai.mdx": `---
title: Visual polish notes
description: Human-only navigation notes.
---

This page should not become an AI guide.
`,
    });

    const guides = await extractGuides(repoRoot, TIMESTAMP);
    const developingGuide = guides.find(
      (guide) => guide.name === "Developing with Salt",
    );
    const primitiveGuide = guides.find(
      (guide) => guide.name === "Choosing the right primitive",
    );

    expect(developingGuide).toMatchObject({
      summary: "Learn how to bootstrap a React app with Salt.",
      packages: expect.arrayContaining([
        "@salt-ds/fixture-core",
        "@salt-ds/fixture-theme",
      ]),
      related_docs: {
        overview: "/salt/getting-started/developing",
        related_components: ["FixtureButton"],
        related_packages: expect.arrayContaining([
          "@salt-ds/fixture-core",
          "@salt-ds/fixture-theme",
        ]),
      },
    });
    expect(developingGuide?.steps.map((step) => step.title)).toEqual([
      "Install packages",
      "Add the theme",
    ]);
    expect(primitiveGuide?.steps.map((step) => step.title)).toEqual(
      expect.arrayContaining(["Start with user intent", "Common decisions"]),
    );
    expect(
      guides.find((guide) => guide.name === "Visual polish notes"),
    ).toBeUndefined();
  });

  it("derives guide aliases from file names, titles, and headings", async () => {
    const repoRoot = await createTempRepo({
      "site/docs/getting-started/custom-wrappers.mdx": `---
title: Custom wrappers
description: Learn when wrappers add value.
salt_ai_guide: true
---

Wrap Salt primitives only when the wrapper adds value.

## When wrappers hurt

Avoid wrappers that only forward props.

## Wrapper review checklist

Check whether the wrapper adds behavior or only renames a component.
`,
    });

    const guides = await extractGuides(repoRoot, TIMESTAMP);
    const wrapperGuide = guides.find(
      (guide) => guide.name === "Custom wrappers",
    );

    expect(wrapperGuide?.aliases).toEqual(
      expect.arrayContaining([
        "Custom wrappers",
        "custom wrappers",
        "When wrappers hurt",
        "Wrapper review checklist",
      ]),
    );
  });

  it("extracts only source-backed theme statements for AI guidance", async () => {
    const repoRoot = await createTempRepo({
      "site/docs/themes/index.mdx": `---
title: Themes
description: Learn how to apply Salt themes in code.
---

## Which theme to pick

### Fixture current theme

Fixture current theme guidance comes from this source document.

### Fixture migration theme

Fixture migration theme guidance comes from this source document.
`,
    });

    const guides = await extractGuides(repoRoot, TIMESTAMP);
    const themesGuide = guides.find((guide) => guide.id === "guide.themes");
    const sourceBackedStep = themesGuide?.steps.find(
      (step) => step.title === "Fixture current theme",
    );

    expect(themesGuide).toMatchObject({
      name: "Themes",
      packages: [],
      related_docs: {
        overview: "/salt/themes",
        related_components: [],
        related_packages: [],
      },
    });
    expect(sourceBackedStep?.statements).toEqual(
      expect.arrayContaining([
        "Fixture current theme guidance comes from this source document.",
      ]),
    );
    expect(sourceBackedStep?.snippets).toEqual([]);
  });
});
