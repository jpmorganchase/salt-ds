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
          "  return <FixturePart aria-label=\"Fixture label\" />;",
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
});
