/**
 * Tests for task 2.10 / M14 — theme-aware create_salt_ui.
 *
 * These unit tests pin the pure detector and the registry-grounded
 * question builder against a small synthetic registry. The end-to-end
 * createSaltUi integration (which depends on the full registry shape
 * for indexing, retrieval, and composition) is exercised separately
 * by the MCP integration spec against the bundled registry artifact.
 */
import { describe, expect, it } from "vitest";
import {
  evaluateCreateThemeProviderQuestion,
  isThemeAmbiguousQuery,
} from "../createSaltUiThemeQuestion.js";
import type { SaltRegistry } from "../../types.js";

type ComponentRecord = SaltRegistry["components"][number];

/** Brand-aware prop set surfaced by the SaltProviderNext component entity. */
const SALT_PROVIDER_NEXT_PROPS: ComponentRecord["props"] = [
  {
    name: "accent",
    type: '"blue" | "teal"',
    required: false,
    description: "Accent color of the theme.",
    default: '"blue"',
    allowed_values: ["blue", "teal"],
    deprecated: false,
  },
  {
    name: "actionFont",
    type: '"Open Sans" | "Amplitude"',
    required: false,
    description: "Action font family.",
    default: '"Open Sans"',
    allowed_values: ["Open Sans", "Amplitude"],
    deprecated: false,
  },
  {
    name: "corner",
    type: '"sharp" | "rounded"',
    required: false,
    description: "Corner style of the theme.",
    default: '"sharp"',
    allowed_values: ["sharp", "rounded"],
    deprecated: false,
  },
  {
    name: "density",
    type: '"mobile" | "medium" | "high" | "low" | "touch"',
    required: false,
    description: "Density of the theme.",
    default: '"medium"',
    allowed_values: ["mobile", "medium", "high", "low", "touch"],
    deprecated: false,
  },
  {
    name: "headingFont",
    type: '"Open Sans" | "Amplitude"',
    required: false,
    description: "Heading font family.",
    default: '"Open Sans"',
    allowed_values: ["Open Sans", "Amplitude"],
    deprecated: false,
  },
  {
    name: "mode",
    type: '"light" | "dark"',
    required: false,
    description: "Light or dark mode.",
    default: '"light"',
    allowed_values: ["light", "dark"],
    deprecated: false,
  },
];

function makeProviderComponent(
  name: "Salt provider" | "SaltProviderNext",
): ComponentRecord {
  return {
    id: `component.${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    aliases: [],
    package: {
      name: "@salt-ds/core",
      status: "stable",
      since: "1.63.0",
    },
    summary: `${name} component`,
    status: "stable",
    category: ["theme"],
    tags: [],
    when_to_use: [],
    when_not_to_use: [],
    alternatives: [],
    props: name === "SaltProviderNext" ? SALT_PROVIDER_NEXT_PROPS : [],
    accessibility: {
      summary: [],
      rules: [],
    },
    examples: [],
    deprecations: [],
    changes: [],
    related_components: [],
    related_patterns: [],
    related_foundations: [],
    related_tokens: [],
    related_guides: [],
    docs_root: null,
    source_url: `https://salt-ds.dev/components/${name
      .toLowerCase()
      .replace(/\s+/g, "-")}`,
  } as unknown as ComponentRecord;
}

function buildSyntheticRegistry(): SaltRegistry {
  return {
    generated_at: "2026-06-11T00:00:00Z",
    version: "test-fixture",
    components: [
      makeProviderComponent("Salt provider"),
      makeProviderComponent("SaltProviderNext"),
    ],
    patterns: [],
    foundations: [],
    tokens: [],
    icons: [],
    countries: [],
    pages: [],
    guides: [],
    packages: [],
    deprecations: [],
    changes: [],
  } as unknown as SaltRegistry;
}

describe("PR 16 (task 2.10) — theme-aware create_salt_ui", () => {
  it("keyword detector flags theme/brand/provider prompts and skips unrelated ones", () => {
    expect(isThemeAmbiguousQuery("set up the theme for my dashboard")).toBe(
      true,
    );
    expect(isThemeAmbiguousQuery("apply our JPM brand")).toBe(true);
    expect(isThemeAmbiguousQuery("set primary color and accent")).toBe(true);
    expect(isThemeAmbiguousQuery("wrap the page with SaltProvider")).toBe(true);
    expect(isThemeAmbiguousQuery("toggle dark mode")).toBe(true);

    expect(isThemeAmbiguousQuery("button to submit the form")).toBe(false);
    expect(isThemeAmbiguousQuery("tabbed navigation panel")).toBe(false);
    expect(isThemeAmbiguousQuery(undefined)).toBe(false);
    expect(isThemeAmbiguousQuery("")).toBe(false);
  });

  it("emits a SaltProvider vs SaltProviderNext question grounded in registry brand props", () => {
    const registry = buildSyntheticRegistry();
    const question = evaluateCreateThemeProviderQuestion(registry, {
      query: "apply our JPM brand to the page",
    });

    expect(question).not.toBeNull();
    expect(question?.kind).toBe("theme-provider-choice");
    expect(question?.topic).toBe("theme-provider");
    expect(question?.ask_before_proceeding).toBe(true);

    // Transitional framing: SaltProviderNext is the recommended default
    // for brand-aware prompts today, so it leads both the rich `options`
    // array and the flat `choices` array that flat hosts surface.
    expect(question?.options.map((option) => option.id)).toEqual([
      "salt-provider-next",
      "salt-provider",
    ]);
    expect(question?.choices[0]).toMatch(/SaltProviderNext/);
    expect(question?.choices[0]).toMatch(/recommended/i);

    // The recommended marker must live on the SaltProviderNext option
    // (and only on that one) so hosts can pre-select or visually
    // emphasize it without inferring from prose.
    const recommended = question?.options.filter(
      (option) => option.recommended === true,
    );
    expect(recommended).toHaveLength(1);
    expect(recommended?.[0]?.id).toBe("salt-provider-next");

    // The convergence_note must be present and call the question
    // transitional so hosts don't encode the split as a permanent fork.
    expect(question?.convergence_note).toMatch(/transitional/i);
    expect(question?.convergence_note).toMatch(/SaltProviderNext/);
    expect(question?.convergence_note).toMatch(/SaltProvider/);

    // The reason should also surface the transitional framing — this is
    // what older consumers that don't read convergence_note will see.
    expect(question?.reason).toMatch(/transitional|deprecation alias/i);

    // Both options expose the registry-backed component name so the host can
    // route the user's pick back to a get_salt_entity follow-up.
    const optionsByComponent = new Map(
      (question?.options ?? []).map((option) => [option.component, option]),
    );
    expect(optionsByComponent.has("SaltProvider")).toBe(true);
    expect(optionsByComponent.has("SaltProviderNext")).toBe(true);

    // Brand prop defaults come from the synthetic registry, not invented,
    // and live on the SaltProviderNext option regardless of order.
    const brandDefaults =
      optionsByComponent.get("SaltProviderNext")?.brand_prop_defaults ?? [];
    expect(brandDefaults.map((entry) => entry.name)).toEqual([
      "accent",
      "actionFont",
      "corner",
      "density",
      "headingFont",
      "mode",
    ]);
    const accent = brandDefaults.find((entry) => entry.name === "accent");
    expect(accent?.default).toBe('"blue"');
    expect(accent?.type).toBe('"blue" | "teal"');

    // The provider source URLs from the registry must surface.
    expect(question?.source_urls.length).toBeGreaterThanOrEqual(1);
  });

  it("suppresses the question when the host signals a declared theme provider", () => {
    const registry = buildSyntheticRegistry();
    expect(
      evaluateCreateThemeProviderQuestion(registry, {
        query: "apply our JPM brand to the page",
        repoHasThemeProvider: true,
      }),
    ).toBeNull();
  });

  it("returns null when the registry does not expose SaltProviderNext", () => {
    const registry = {
      ...buildSyntheticRegistry(),
      components: [makeProviderComponent("Salt provider")],
    };
    expect(
      evaluateCreateThemeProviderQuestion(registry, {
        query: "apply our JPM brand to the page",
      }),
    ).toBeNull();
  });
});
