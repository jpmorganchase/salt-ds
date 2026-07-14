import { describe, expect, it } from "vitest";
import { loadRegistry } from "../../registry/loadRegistry.js";
import { createSaltUi } from "../createSaltUi.js";
import { buildIconGroundingPlan } from "../iconGrounding.js";
import { migrateToSalt } from "../migrateToSalt.js";
import { reviewSaltUi } from "../reviewSaltUi.js";

function starterCodeText(
  snippets: Array<{ code?: string }> | undefined,
): string {
  return (snippets ?? []).map((snippet) => snippet.code ?? "").join("\n\n");
}

describe("polished UI icon grounding", () => {
  it("derives grounding records from the current icon catalog", async () => {
    const registry = await loadRegistry();

    const plan = buildIconGroundingPlan(registry, "Add a search icon");

    expect(plan.grounded).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          intent: "search",
          export_name: "SearchIcon",
        }),
      ]),
    );
    expect(plan.placeholders).toEqual([]);
  });

  it("adds grounded Salt icon slots to create_salt_ui starter code", async () => {
    const registry = await loadRegistry();
    const result = createSaltUi(registry, {
      query: "Build a search toolbar with a filter action and settings menu",
      include_starter_code: true,
    });
    const code = starterCodeText(result.starter_code);

    expect(code).toContain('from "@salt-ds/icons"');
    expect(code).toContain("SearchIcon");
    expect(code).toContain("FilterIcon");
    expect(code).toContain("SettingsIcon");
    expect(code).toContain("groundedSaltIconSlots");
  });

  it("uses placeholders instead of invented imports for unknown icon requests", async () => {
    const registry = await loadRegistry();
    const result = createSaltUi(registry, {
      query: "Build a primary action button with a bespoke brand glyph icon",
      include_starter_code: true,
    });
    const iconSnippet = result.starter_code?.find(
      (snippet) => snippet.label === "Grounded Salt icon slots",
    );

    expect(iconSnippet?.code).toContain('"unknown-icon": null');
    expect(iconSnippet?.code).not.toContain('from "@salt-ds/icons"');
    expect(iconSnippet?.notes?.join("\n")).toContain(
      "Use a project placeholder until a grounded Salt icon is selected.",
    );
  });

  it("adds grounded Salt icon slots to migrate_to_salt starter code", async () => {
    const registry = await loadRegistry();
    const result = migrateToSalt(registry, {
      query:
        "Convert a Material toolbar with a search icon, filter icon, and settings menu into Salt.",
      include_starter_code: true,
    });
    const code = starterCodeText(result.starter_code);

    expect(code).toContain('from "@salt-ds/icons"');
    expect(code).toContain("SearchIcon");
    expect(code).toContain("FilterIcon");
    expect(code).toContain("SettingsIcon");
  });

  it("flags unknown @salt-ds/icons imports during review", async () => {
    const registry = await loadRegistry();
    const result = reviewSaltUi(registry, {
      code: [
        'import { Button } from "@salt-ds/core";',
        'import { SearchThingIcon } from "@salt-ds/icons";',
        "",
        "export function Demo() {",
        "  return <Button><SearchThingIcon aria-hidden /> Search</Button>;",
        "}",
      ].join("\n"),
      framework: "react",
      package_version: "2.0.0",
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "unknown-salt-icon-import",
          suggested_fix: expect.stringContaining("SearchIcon"),
          evidence: expect.arrayContaining([
            "Salt icon imports are checked against the bundled offline icon catalog.",
          ]),
        }),
      ]),
    );
    expect(JSON.stringify(result.issues ?? [])).not.toContain(
      "icons-lite.json",
    );
  });
});
