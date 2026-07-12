import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  derivePatternExampleAccessibilitySignals,
  derivePatternImplementationAccessibilitySignals,
  extractPatterns,
} from "../build/buildRegistryPatterns.js";

// All Salt-looking strings in this file are intentionally tiny fixture facts.
const GENERATED_AT = "2026-05-04T00:00:00.000Z";
async function writeFixturePatternRepo(
  repoRoot: string,
  content: string,
): Promise<void> {
  await fs.mkdir(path.join(repoRoot, "site/docs/patterns"), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(repoRoot, "site/pattern-category-map.json"),
    `${JSON.stringify(
      {
        patterns: {
          fixtureFlow: {
            route: "/salt/patterns/fixture-flow/index",
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
    path.join(repoRoot, "site/docs/patterns/fixture-flow.mdx"),
    content,
    "utf8",
  );
}

describe("pattern registry extraction", () => {
  it("extracts fixture behavior guidance from source-backed non-generic sections and preserves EvidenceRefs", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-registry-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
  resources:
    [
      { href: "https://example.test/salt/fixture-flow/examples", label: "Fixture examples" }
    ]
---

## When to use

Use the fixture flow when fixture evidence applies.

## How to build

Add the fixture part to the fixture flow.

## Runtime state

The fixture flow keeps source-backed state visible while fixture work is active.

## Result state

The fixture flow shows source-backed completion text when fixture work is done.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);

      expect(patterns).toHaveLength(1);
      const pattern = patterns[0];
      expect(pattern.how_it_works).toEqual([
        "Fixture flow Runtime state: The fixture flow keeps source-backed state visible while fixture work is active.",
        "Fixture flow Result state: The fixture flow shows source-backed completion text when fixture work is done.",
      ]);
      expect(pattern.how_it_works.join(" ")).not.toMatch(
        /When to use|How to build|Runtime state Result state/,
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("prefers explicit fixture How it works docs over fallback behavior sections", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-explicit-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
---

## When to use

Use the fixture flow when fixture evidence applies.

## How to build

Add the fixture part to the fixture flow.

## How it works

The fixture flow uses the explicit source-backed behavior section.

## Runtime state

Fallback fixture behavior must not replace explicit fixture behavior.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);

      expect(patterns[0].how_it_works).toEqual([
        "The fixture flow uses the explicit source-backed behavior section.",
      ]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("does not infer fixture when_to_use guidance from generic topical sections", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-generic-topics-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
  resources:
    [
      { href: "https://example.test/salt/fixture-flow/examples", label: "Fixture examples" }
    ]
---

## Status

Fixture status explains the current fixture condition.

## Sentiment

Fixture sentiment explains the fixture tone.

## Progression

Fixture progression explains the fixture sequence.

## Urgency

Fixture urgency explains the fixture priority.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];

      expect(pattern.when_to_use).toEqual([]);
      expect(pattern.how_it_works).toEqual([
        "Fixture flow Status: Fixture status explains the current fixture condition.",
        "Fixture flow Sentiment: Fixture sentiment explains the fixture tone.",
        "Fixture flow Progression: Fixture progression explains the fixture sequence.",
        "Fixture flow Urgency: Fixture urgency explains the fixture priority.",
      ]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts fixture avoidance guidance from source-backed guidance callouts and preserves EvidenceRefs", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-avoid-callout-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
  resources:
    [
      { href: "https://example.test/salt/fixture-flow/examples", label: "Fixture examples" }
    ]
---

## When to use

Use the fixture flow when fixture evidence applies.

## How to build

Add the fixture part to the fixture flow.

## Runtime state

The fixture flow keeps source-backed state visible while fixture work is active.

<GuidanceCallout type="positive" customPillText="Best practices">
- Keep fixture state visible while fixture work is active.
- Use fixture switches only for true fixture toggles, and label final buttons clearly instead of just 'Finish'.
- Do not use the fixture flow when fixture work has no source-backed hierarchy.
- Refrain from using fixture labels when several fixture values represent the same channel.
- Use FixtureAlternative instead if fixture work needs only a single primitive.
</GuidanceCallout>
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];

      expect(pattern.when_not_to_use).toEqual([
        "Do not use the fixture flow when fixture work has no source-backed hierarchy.",
        "Refrain from using fixture labels when several fixture values represent the same channel.",
        "Use FixtureAlternative instead if fixture work needs only a single primitive.",
      ]);
      expect(pattern.when_not_to_use.join(" ")).not.toContain(
        "Keep fixture state visible",
      );
      expect(pattern.when_not_to_use.join(" ")).not.toContain(
        "instead of just",
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts fixture accessibility summaries from explicit source-backed statements", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-accessibility-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
  resources:
    [
      { href: "https://example.test/salt/fixture-flow/examples", label: "Fixture examples" }
    ]
---

## When to use

Use the fixture flow when fixture evidence applies.

## Layout

Fixture layout preserves fixture grouping.

For accessibility, fixture workflows must keep fixture controls reachable to keyboard users.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];

      expect(pattern.accessibility.summary).toEqual([
        "For accessibility, fixture workflows must keep fixture controls reachable to keyboard users.",
      ]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("does not promote fixture visual focus or layout text into accessibility summaries", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-visual-focus-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
  resources:
    [
      { href: "https://example.test/salt/fixture-flow/examples", label: "Fixture examples" }
    ]
---

## When to use

Use the fixture flow when fixture evidence applies.

## Visual focus

Fixture visual focus directs attention to the primary fixture area.

Fixture layout preserves a clear visual hierarchy.

Fixture actions remain easily accessible from any fixture page.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];
      expect(pattern.accessibility.summary).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("derives fixture accessibility implementation signals from source-backed story ARIA attributes without promoting them to guidance", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-story-accessibility-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
  resources:
    [
      { href: "https://example.test/salt/fixture-flow/examples", label: "Fixture examples" }
    ]
---

## When to use

Use the fixture flow when fixture evidence applies.

## How to build

Add the fixture part to the fixture flow.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];
      const storySource =
        "packages/core/stories/patterns/fixture-flow/fixture-flow.stories.tsx";

      pattern.examples = [
        {
          id: "fixture-story-example",
          title: "Fixture story",
          description: "",
          intent: ["fixture story"],
          complexity: "basic",
          code: `
export const FixtureStory = () => (
  <button aria-label="Open fixture">
    <span aria-hidden>Fixture icon</span>
  </button>
);
`,
          source_url: storySource,
          package: "@salt-ds/fixture",
          target_type: "pattern",
          target_name: "Fixture flow",
        },
      ];

      const accessibilitySignals =
        derivePatternExampleAccessibilitySignals(pattern);
      pattern.accessibility.implementation_signals = accessibilitySignals;

      expect(pattern.accessibility.summary).toEqual([]);
      expect(pattern.accessibility.implementation_signals).toEqual([
        {
          kind: "aria_attribute",
          values: ["aria-hidden", "aria-label"],
          source_kind: "example",
          source_url: storySource,
        },
      ]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("derives fixture accessibility implementation signals from source-backed story semantic elements", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-story-semantic-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
  resources:
    [
      { href: "https://example.test/salt/fixture-flow/examples", label: "Fixture examples" }
    ]
---

## When to use

Use the fixture flow when fixture evidence applies.

## How to build

Add the fixture part to the fixture flow.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];
      const storySource =
        "packages/core/stories/patterns/fixture-flow/fixture-flow.stories.tsx";

      pattern.examples = [
        {
          id: "fixture-story-example",
          title: "Fixture story",
          description: "",
          intent: ["fixture story"],
          complexity: "basic",
          code: `
export const FixtureStory = () => (
  <nav>
    <a href="#fixture">Fixture destination</a>
  </nav>
);
`,
          source_url: storySource,
          package: "@salt-ds/fixture",
          target_type: "pattern",
          target_name: "Fixture flow",
        },
      ];

      const accessibilitySignals =
        derivePatternExampleAccessibilitySignals(pattern);

      expect(accessibilitySignals).toEqual([
        {
          kind: "semantic_element",
          values: ["nav"],
          source_kind: "example",
          source_url: storySource,
        },
      ]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("derives fixture accessibility implementation signals from source-backed implementation code and preserves EvidenceRefs", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-source-accessibility-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
  resources:
    [
      { href: "https://example.test/salt/fixture-flow/examples", label: "Fixture examples" }
    ]
---

## When to use

Use the fixture flow when fixture evidence applies.

## How to build

Add the fixture part to the fixture flow.
`,
      );
      const sourcePath = path.join(
        repoRoot,
        "packages/lab/src/fixture-flow/FixtureFlow.tsx",
      );
      await fs.mkdir(path.dirname(sourcePath), { recursive: true });
      await fs.writeFile(
        sourcePath,
        `
import { useAriaAnnouncer } from "@salt-ds/core";

export function FixtureFlow() {
  useAriaAnnouncer();

  return (
    <section aria-labelledby="fixture-title" role="region">
      <h2 id="fixture-title">Fixture title</h2>
    </section>
  );
}
`,
        "utf8",
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];
      const accessibilitySignals =
        await derivePatternImplementationAccessibilitySignals(
          repoRoot,
          pattern,
        );

      pattern.accessibility.implementation_signals = accessibilitySignals;

      expect(pattern.accessibility.summary).toEqual([]);
      expect(pattern.accessibility.implementation_signals).toEqual([
        {
          kind: "aria_attribute",
          values: ["aria-labelledby"],
          source_kind: "source",
          source_url: "packages/lab/src/fixture-flow/FixtureFlow.tsx",
        },
        {
          kind: "aria_role",
          values: ["region"],
          source_kind: "source",
          source_url: "packages/lab/src/fixture-flow/FixtureFlow.tsx",
        },
        {
          kind: "aria_announcement",
          values: ["useAriaAnnouncer"],
          source_kind: "source",
          source_url: "packages/lab/src/fixture-flow/FixtureFlow.tsx",
        },
      ]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("does not derive fixture accessibility implementation signals from focus-only story code", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-focus-only-story-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
  resources:
    [
      { href: "https://example.test/salt/fixture-flow/examples", label: "Fixture examples" }
    ]
---

## When to use

Use the fixture flow when fixture evidence applies.

## How to build

Add the fixture part to the fixture flow.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];
      pattern.examples = [
        {
          id: "fixture-story-example",
          title: "Fixture story",
          description: "",
          intent: ["fixture story"],
          complexity: "basic",
          code: `
export const FixtureStory = () => (
  <div tabIndex={0} onFocus={() => undefined}>
    Fixture focus surface
  </div>
);
`,
          source_url:
            "packages/core/stories/patterns/fixture-flow/fixture-flow.stories.tsx",
          package: "@salt-ds/fixture",
          target_type: "pattern",
          target_name: "Fixture flow",
        },
      ];

      const accessibilitySignals =
        derivePatternExampleAccessibilitySignals(pattern);

      expect(accessibilitySignals).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts source-backed fixture docs examples from visual MDX tags", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-docs-example-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
---

<Diagram
  src="/img/fixture-flow/example.png"
  alt="Fixture source-backed example."
  border
/>

## When to use

Use the fixture flow when fixture evidence applies.

## How to build

Add the fixture part to the fixture flow.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];

      expect(pattern.examples).toEqual([
        expect.objectContaining({
          id: "pattern-docs.fixture-flow.fixture-source-backed-example.1",
          title: "Fixture source-backed example.",
          description: "Fixture source-backed example.",
          code: expect.stringContaining("<Diagram"),
          source_url: "/salt/patterns/fixture-flow",
          target_name: "Fixture flow",
        }),
      ]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps missing fixture examples unsupported when no source-backed docs example exists", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-pattern-missing-example-fixture-"),
    );

    try {
      await writeFixturePatternRepo(
        repoRoot,
        `---
title: Fixture flow
description: Fixture source-backed flow pattern.
layout: DetailPattern
data:
  components: ["FixturePart"]
---

## When to use

Use the fixture flow when fixture evidence applies.

## How to build

Add the fixture part to the fixture flow.
`,
      );

      const patterns = await extractPatterns(repoRoot, GENERATED_AT);
      const pattern = patterns[0];

      expect(pattern.examples).toEqual([]);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });
});
