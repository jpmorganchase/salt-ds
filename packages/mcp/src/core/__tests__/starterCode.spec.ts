import { describe, expect, it } from "vitest";
import { createRecipeStarterCode } from "../tools/starterCode.js";

// All Salt-looking strings in this file are intentionally tiny fixture facts.
describe("recipe starter code generation", () => {
  it("does not emit generic fixture pattern starter code when no example or source-backed scaffold is available", () => {
    const snippets = createRecipeStarterCode({
      recipeName: "Fixture pattern",
      components: [
        {
          name: "FixturePart",
          package: "@salt-ds/fixture",
          role: "fixture part",
        },
      ],
      allow_generic_component_starter: false,
    });

    expect(snippets).toEqual([]);
  });

  it("keeps source-backed fixture pattern example structure when starter code is requested", () => {
    const snippets = createRecipeStarterCode({
      recipeName: "Fixture pattern",
      components: [
        {
          name: "FixturePart",
          package: "@salt-ds/fixture",
          role: "fixture part",
        },
      ],
      supporting_example: {
        title: "Fixture example",
        code: [
          'import { FixturePart } from "@salt-ds/fixture";',
          "",
          "export function FixtureExample() {",
          '  return <FixturePart aria-label="Fixture label" />;',
          "}",
        ].join("\n"),
        source_url: "https://example.test/salt/fixture-pattern/examples/basic",
      },
      allow_generic_component_starter: false,
    });

    expect(snippets).toEqual([
      expect.objectContaining({
        label: "Fixture pattern starter",
        language: "tsx",
        code: expect.stringContaining("<FixturePart aria-label"),
        notes: expect.arrayContaining([
          "Starter code is based on the closest extracted pattern story example rather than a private fallback template.",
        ]),
      }),
    ]);
  });

  it("keeps template-backed workflow starters compact while explicit example lookup owns full examples", () => {
    const snippets = createRecipeStarterCode({
      recipeName: "Fixture workflow",
      components: [
        {
          name: "FixtureShell",
          package: "@salt-ds/fixture",
          role: "workflow shell",
        },
        {
          name: "FixtureControl",
          package: "@salt-ds/fixture",
          role: "workflow control",
        },
      ],
      starter_scaffold: {
        fidelity: "canonical",
        source_urls: ["https://example.test/salt/fixture-workflow"],
        example_source_urls: [
          "https://example.test/salt/fixture-workflow/examples/full",
        ],
        semantics: {
          regions: ["shell", "controls"],
          required_regions: ["shell"],
          optional_regions: ["controls"],
          build_around: ["Fixture shell"],
          preserve_constraints: ["Keep controls inside the shell"],
        },
        template: {
          kind: "fallback-template",
          imports: [
            { name: "FixtureShell", package: "@salt-ds/fixture" },
            { name: "FixtureControl", package: "@salt-ds/fixture" },
          ],
          jsx_lines: [
            "<FixtureShell>",
            "  <FixtureControl />",
            "</FixtureShell>",
          ],
          notes: ["Use the verified fixture composition."],
        },
      },
      supporting_example: {
        title: "Full fixture story",
        code: [
          'import { FixtureShell } from "@salt-ds/fixture";',
          "",
          "export function FullFixtureStory() {",
          ...Array.from(
            { length: 80 },
            (_, index) => `  // Full story detail ${index + 1}`,
          ),
          "  return <FixtureShell />;",
          "}",
        ].join("\n"),
        source_url: "https://example.test/salt/fixture-workflow/examples/full",
      },
      allow_generic_component_starter: false,
      prefer_supporting_example_as_starter: false,
      include_supporting_example: false,
    });

    expect(snippets).toHaveLength(1);
    expect(snippets[0]?.code).toContain("<FixtureShell>");
    expect(snippets[0]?.code).not.toContain("Full story detail");
    expect(snippets[0]?.code.split(/\r?\n/).length).toBeLessThanOrEqual(30);
  });

  it("does not invent exports for a structured pattern without a starter template", () => {
    const snippets = createRecipeStarterCode({
      recipeName: "Announcement dialog",
      components: [
        { name: "Header block", package: null, role: "header" },
        { name: "Button bar", package: null, role: "actions" },
      ],
      starter_scaffold: {
        fidelity: "canonical",
        source_urls: ["https://example.test/salt/announcement-dialog"],
        semantics: {
          regions: ["header", "actions"],
          build_around: ["Dialog"],
          preserve_constraints: ["Use the canonical dialog structure"],
        },
      },
      allow_generic_component_starter: false,
      prefer_supporting_example_as_starter: false,
      include_supporting_example: false,
    });

    expect(snippets).toEqual([]);
  });
});
