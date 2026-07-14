import { describe, expect, it } from "vitest";
import {
  createComponentStarterCode,
  createRecipeStarterCode,
} from "../core/tools/starterCode.js";
import type { ComponentRecord } from "../core/types.js";

// Fixture-only records: names, packages, imports, and provider-like tags below
// are synthetic and are not sources of Salt truth.

function makeFixtureComponentWithExample(code: string): ComponentRecord {
  return {
    id: "component.fixture-notice",
    name: "FixtureNotice",
    aliases: [],
    package: {
      name: "@fixture/ui",
      status: "stable",
      since: null,
    },
    summary: "Fixture component for starter-code tests.",
    status: "stable",
    category: ["fixture"],
    tags: [],
    when_to_use: ["Use for fixture coverage."],
    when_not_to_use: [],
    alternatives: [],
    props: [],
    accessibility: {
      summary: [],
      rules: [],
    },
    patterns: [],
    examples: [
      {
        id: "fixture-notice.theme-example",
        title: "Fixture themed notice",
        description: "A fixture example with local wrapper code.",
        intent: ["fixture"],
        complexity: "intermediate",
        code,
        source_url: "/fixture/components/notice/examples",
        package: "@fixture/ui",
        target_type: "component",
        target_name: "FixtureNotice",
      },
    ],
    related_docs: {
      overview: null,
      usage: null,
      accessibility: null,
      examples: "/fixture/components/notice/examples",
    },
    source: {
      repo_path: null,
      export_name: "FixtureNotice",
    },
    deprecations: [],
    last_verified_at: "2026-03-10T00:00:00Z",
  };
}

describe("starter code theme bootstrap", () => {
  it("preserves example-backed recipe starters and reports theme bootstrap as unsupported", () => {
    const sourceBackedCode = [
      'import { FixtureButton, FixtureShell } from "@fixture/ui";',
      'import "@fixture/theme.css";',
      "",
      "export function FixtureExample() {",
      "  return (",
      '    <FixtureShell mode="source-backed">',
      "      <FixtureButton>Save</FixtureButton>",
      "    </FixtureShell>",
      "  );",
      "}",
    ].join("\n");

    const snippets = createRecipeStarterCode({
      recipeName: "Fixture recipe",
      components: [
        { name: "FixtureButton", package: "@fixture/ui", role: "action" },
      ],
      supporting_example: {
        title: "Fixture source example",
        source_url: "/fixture/patterns/recipe/examples",
        code: sourceBackedCode,
      },
    });

    expect(snippets[0]?.code).toBe(sourceBackedCode);
    expect(snippets[0]?.notes).toContain(
      "Theme bootstrap is unsupported until provider, import, prop, and font facts resolve from registry-backed context, project policy, workflow evidence, or explicit workflow input.",
    );
    expect(snippets[0]?.notes?.join("\n")).not.toMatch(/normalized/i);
  });

  it("preserves attached component examples without injecting theme bootstrap", () => {
    const sourceBackedCode = [
      'import { FixtureNotice, FixtureShell } from "@fixture/ui";',
      "",
      "export const ThemedFixtureNotice = () => (",
      '  <FixtureShell density="fixture-high">',
      "    <FixtureNotice>Saved</FixtureNotice>",
      "  </FixtureShell>",
      ");",
    ].join("\n");

    const snippets = createComponentStarterCode(
      makeFixtureComponentWithExample(sourceBackedCode),
    );

    expect(snippets[1]?.code).toBe(sourceBackedCode);
    expect(snippets[1]?.notes?.join("\n")).not.toMatch(/normalized/i);
  });
});
