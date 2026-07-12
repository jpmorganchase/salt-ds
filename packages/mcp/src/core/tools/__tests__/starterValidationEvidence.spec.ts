import { describe, expect, it } from "vitest";
import type { SaltRegistry } from "../../types.js";
import { validateStarterCodeSnippets } from "../starterValidation.js";

// All Salt-looking names in this file are fixture-only workflow-input facts.
function buildFixtureRegistry(): SaltRegistry {
  return {
    generated_at: "2026-05-01T00:00:00.000Z",
    version: "fixture",
    build_info: null,
    packages: [],
    components: [],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
  };
}

describe("starter validation evidence", () => {
  it("records missing token evidence without inventing token docs sources", () => {
    const summary = validateStarterCodeSnippets(buildFixtureRegistry(), [
      {
        label: "Fixture starter",
        language: "tsx",
        code: `
          export function FixtureStarter() {
            return (
              <div style={{ color: "var(--salt-fixture-undocumented)" }}>
                Fixture
              </div>
            );
          }
        `,
      },
    ]);

    expect(summary).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        source_urls: [],
        missing_data: [
          "Starter code contains Salt-looking token names with no registry token evidence: --salt-fixture-undocumented.",
        ],
      }),
    );
  });
});
