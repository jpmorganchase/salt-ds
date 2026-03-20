import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { extractGuides } from "../build/buildRegistryDocs.js";

const TIMESTAMP = "2026-03-10T00:00:00Z";
const tempRoots: string[] = [];

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
    tempRoots.splice(0).map((root) =>
      fs.rm(root, { recursive: true, force: true }),
    ),
  );
});

describe("extractGuides", () => {
  it("infers getting-started guides from normal docs structure", async () => {
    const repoRoot = await createTempRepo({
      "site/docs/getting-started/developing.mdx": `---
title: Developing with Salt
description: Learn how to bootstrap a React app with Salt.
---

Install Salt in a React app.

## The step-by-step process

### 1. Install packages

Install \`@salt-ds/core\` and \`@salt-ds/theme\`.

### 2. Add the theme

Import the theme and start with [Button](/salt/components/button).
`,
      "site/docs/getting-started/choosing-the-right-primitive.mdx": `---
title: Choosing the right primitive
description: Choose the most constrained Salt option first.
---

Choose the best primitive for the user intent.

## Start with user intent

Use [Button](/salt/components/button) for actions and [Link](/salt/components/link) for navigation.

## Common decisions

### Button or Link

Use Button for actions and Link for navigation.
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
      packages: expect.arrayContaining(["@salt-ds/core", "@salt-ds/theme"]),
      related_docs: {
        overview: "/salt/getting-started/developing",
        related_components: ["Button"],
        related_packages: expect.arrayContaining([
          "@salt-ds/core",
          "@salt-ds/theme",
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
  });

  it("derives guide aliases from file names, titles, and headings", async () => {
    const repoRoot = await createTempRepo({
      "site/docs/getting-started/custom-wrappers.mdx": `---
title: Custom wrappers
description: Learn when wrappers add value.
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
});
