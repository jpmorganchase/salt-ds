import { describe, expect, it } from "vitest";
import { recommendFixRecipes } from "../core/tools/recommendFixRecipes.js";
import { reviewSaltUi } from "../core/tools/reviewSaltUi.js";
import type { SaltRegistry } from "../core/types.js";
import {
  CODE_ANALYSIS_REGISTRY as REGISTRY,
  TIMESTAMP,
} from "./fixtures/codeAnalysisRegistry.js";

const PRIMITIVE_GUIDE = REGISTRY.guides.find(
  (guide) => guide.name === "Choosing the right primitive",
);
const PRIMITIVE_GUIDE_NAME =
  PRIMITIVE_GUIDE?.name ?? "Choosing the right primitive";
const PRIMITIVE_GUIDE_SUMMARY =
  PRIMITIVE_GUIDE?.summary ?? "Fixture primitive choice summary.";
const PRIMITIVE_GUIDE_STEP = PRIMITIVE_GUIDE
  ? `Use ${PRIMITIVE_GUIDE_NAME}: ${PRIMITIVE_GUIDE_SUMMARY}`
  : "Use the registry-backed primitive choice guide.";

function buildFixtureExpectedPatternRegistry(): SaltRegistry {
  // Fixture-only records: these prove expected-pattern review behavior without
  // adding production Salt pattern or component facts to the test.
  const fixtureComponent: SaltRegistry["components"][number] = {
    id: "fixture-action",
    name: "FixtureAction",
    aliases: [],
    package: {
      name: "@salt-ds/fixture",
      status: "stable",
      since: null,
    },
    summary: "Fixture source-backed action component.",
    status: "stable",
    category: ["fixture"],
    tags: [],
    when_to_use: [],
    when_not_to_use: [],
    alternatives: [],
    props: [],
    accessibility: {
      summary: [],
      rules: [],
    },
    patterns: ["FixtureWorkflow"],
    examples: [],
    related_docs: {
      overview: "https://example.test/salt/fixture-action",
      usage: "https://example.test/salt/fixture-action/usage",
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: "packages/fixture/src/FixtureAction.tsx",
      export_name: "FixtureAction",
    },
    deprecations: [],
    last_verified_at: TIMESTAMP,
  };
  const fixturePattern: SaltRegistry["patterns"][number] = {
    id: "fixture-workflow",
    name: "FixtureWorkflow",
    aliases: [],
    summary: "Fixture source-backed workflow pattern.",
    status: "stable",
    category: ["fixture"],
    when_to_use: ["Use FixtureWorkflow for fixture workflow tests."],
    when_not_to_use: [],
    composed_of: [
      {
        component: "FixtureAction",
        role: "fixture action",
      },
    ],
    related_patterns: [],
    how_to_build: ["Compose FixtureWorkflow from fixture starter scaffold."],
    how_it_works: [
      "FixtureWorkflow is validated from fixture starter import evidence.",
    ],
    accessibility: {
      summary: [],
    },
    resources: [],
    examples: [],
    starter_scaffold: {
      fidelity: "canonical",
      source_urls: ["https://example.test/salt/fixture-workflow/source"],
      example_source_urls: [],
      semantics: {
        regions: [],
        build_around: [],
        preserve_constraints: [],
      },
      template: {
        kind: "fallback-template",
        imports: [
          {
            name: "FixtureAction",
            package: "@salt-ds/fixture",
          },
        ],
        jsx_lines: ["<FixtureAction />"],
      },
    },
    related_docs: {
      overview: "https://example.test/salt/fixture-workflow",
    },
    last_verified_at: TIMESTAMP,
  };

  return {
    ...REGISTRY,
    components: [...REGISTRY.components, fixtureComponent],
    patterns: [fixturePattern],
  };
}

describe("recommendFixRecipes", () => {
  it("builds remediation recipes from validation issues, migrations, and examples", () => {
    const recipeRegistry: SaltRegistry = {
      ...REGISTRY,
      tokens: [
        {
          name: "--salt-size-base",
          category: "size",
          type: "dimension",
          value: "32px",
          semantic_intent: "base control size",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Button"],
          guidance: ["Use semantic sizing tokens for control sizing."],
          aliases: [],
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
        {
          name: "--salt-size-fixed-100",
          category: "size",
          type: "dimension",
          value: "1px",
          semantic_intent: "fixed border thickness",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Button"],
          guidance: [
            "Use fixed size tokens for border and separator thickness.",
          ],
          aliases: [],
          policy: {
            usage_tier: "foundation",
            direct_component_use: "conditional",
            preferred_for: ["border thickness", "separator thickness"],
            avoid_for: [
              "semantic component styling when a characteristic token fits",
            ],
            notes: [
              "Fixed size tokens remain constant across densities and are the correct choice for border and separator thickness.",
            ],
            docs: [
              "/salt/foundations/size",
              "/salt/themes/design-tokens/index",
            ],
            structural_roles: ["border-thickness", "separator-thickness"],
            pairing: null,
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
        {
          name: "--salt-palette-accent-border",
          category: "palette",
          type: "color",
          value: "#005fcc",
          semantic_intent: "accent border palette",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Button"],
          guidance: [
            "Palette tokens should be mapped through characteristic tokens.",
          ],
          aliases: [],
          policy: {
            usage_tier: "palette",
            direct_component_use: "never",
            preferred_for: [
              "internal theme and mode mapping inside the Salt token system",
            ],
            avoid_for: [
              "direct component styling",
              "pattern styling",
              "custom UI color selection",
            ],
            notes: [
              "Palette tokens sit between foundations and characteristics and should not be referenced directly in components or patterns.",
              "Choose a semantic characteristic token instead of applying a palette token to UI code.",
            ],
            docs: ["/salt/themes/design-tokens/index"],
            structural_roles: [],
            pairing: null,
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
        {
          name: "--salt-actionable-borderColor",
          category: "actionable",
          type: "color",
          value: "#005fcc",
          semantic_intent: "action border",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Button"],
          guidance: ["Use actionable tokens for action control borders."],
          aliases: [],
          policy: {
            usage_tier: "characteristic",
            direct_component_use: "always",
            preferred_for: ["action control states", "action affordances"],
            avoid_for: ["choosing by visual similarity alone"],
            notes: [
              "Use characteristic tokens directly in components and patterns, choosing by semantic intent rather than by appearance.",
            ],
            docs: [
              "/salt/themes/design-tokens/actionable-characteristic",
              "/salt/themes/design-tokens/index",
            ],
            structural_roles: [],
            pairing: null,
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
        {
          name: "--salt-container-primary-background",
          category: "container",
          type: "color",
          value: "#ffffff",
          semantic_intent: "primary container background",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Button"],
          guidance: [
            "Use primary container background tokens for primary surfaces.",
          ],
          aliases: [],
          policy: {
            usage_tier: "characteristic",
            direct_component_use: "always",
            preferred_for: ["surface backgrounds", "container border colors"],
            avoid_for: ["mixing container background and border levels"],
            notes: [
              "Pair container background and border tokens from the same level to keep surfaces visually coherent.",
            ],
            docs: [
              "/salt/themes/design-tokens/container-characteristic",
              "/salt/themes/design-tokens/index",
            ],
            structural_roles: ["container-background"],
            pairing: {
              family: "container",
              role: "container-background",
              level: "primary",
            },
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
        {
          name: "--salt-container-primary-borderColor",
          category: "container",
          type: "color",
          value: "#d0d7de",
          semantic_intent: "primary container border",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Button"],
          guidance: [
            "Match primary container borders with primary container backgrounds.",
          ],
          aliases: [],
          policy: {
            usage_tier: "characteristic",
            direct_component_use: "always",
            preferred_for: ["surface backgrounds", "container border colors"],
            avoid_for: ["mixing container background and border levels"],
            notes: [
              "Pair container background and border tokens from the same level to keep surfaces visually coherent.",
            ],
            docs: [
              "/salt/themes/design-tokens/container-characteristic",
              "/salt/themes/design-tokens/index",
            ],
            structural_roles: ["container-border-color"],
            pairing: {
              family: "container",
              role: "container-border-color",
              level: "primary",
            },
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
        {
          name: "--salt-container-secondary-borderColor",
          category: "container",
          type: "color",
          value: "#c8ced4",
          semantic_intent: "secondary container border",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Button"],
          guidance: [
            "Use secondary container border tokens with secondary surfaces.",
          ],
          aliases: [],
          policy: {
            usage_tier: "characteristic",
            direct_component_use: "always",
            preferred_for: ["surface backgrounds", "container border colors"],
            avoid_for: ["mixing container background and border levels"],
            notes: [
              "Pair container background and border tokens from the same level to keep surfaces visually coherent.",
            ],
            docs: [
              "/salt/themes/design-tokens/container-characteristic",
              "/salt/themes/design-tokens/index",
            ],
            structural_roles: ["container-border-color"],
            pairing: {
              family: "container",
              role: "container-border-color",
              level: "secondary",
            },
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
        {
          name: "--salt-separable-secondary-borderColor",
          category: "separable",
          type: "color",
          value: "#d0d7de",
          semantic_intent: "secondary separator border",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Divider", "Separator"],
          guidance: ["Use separable tokens for divider and separator lines."],
          aliases: [],
          policy: {
            usage_tier: "characteristic",
            direct_component_use: "always",
            preferred_for: ["divider colors", "separator colors"],
            avoid_for: ["borrowing container or content colors for separators"],
            notes: [
              "Use separable tokens to divide sections and groups rather than reusing unrelated border colors.",
            ],
            docs: [
              "/salt/themes/design-tokens/separable-characteristic",
              "/salt/themes/design-tokens/index",
            ],
            structural_roles: ["separator-color"],
            pairing: null,
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
        {
          name: "--salt-color-warning-foreground",
          category: "color",
          type: "color",
          value: "#b45309",
          semantic_intent: "warning",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Button"],
          guidance: ["Use semantic warning foreground color."],
          aliases: [],
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
      ],
      examples: [
        {
          id: "button.a11y",
          title: "Accessible icon button",
          description: "Icon-only button with an explicit accessible label.",
          intent: ["button accessibility"],
          complexity: "intermediate",
          code: '<Button aria-label="Search"><SearchIcon aria-hidden /></Button>',
          source_url: "/salt/components/button/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "Button",
        },
      ],
      components: REGISTRY.components.map((component) =>
        component.name === "Button"
          ? {
              ...component,
              examples: [
                {
                  id: "button.a11y",
                  title: "Accessible icon button",
                  description:
                    "Icon-only button with an explicit accessible label.",
                  intent: ["button accessibility"],
                  complexity: "intermediate",
                  code: '<Button aria-label="Search"><SearchIcon aria-hidden /></Button>',
                  source_url: "/salt/components/button/examples",
                  package: "@salt-ds/core",
                  target_type: "component",
                  target_name: "Button",
                },
              ],
            }
          : component,
      ),
    };
    const code = `
      import { Button, UNSTABLE_SaltProviderNext } from "@salt-ds/core";

      export function Demo() {
        return (
          <>
            <Button href="/next" variant="cta"><SearchIcon /></Button>
            <UNSTABLE_SaltProviderNext />
            <Button
              style={{
                height: "40px",
                color: "#ff0000",
                borderWidth: "var(--salt-size-base)",
                backgroundColor: "var(--salt-container-primary-background)",
                borderColor: "var(--salt-container-secondary-borderColor)",
              }}
            >
              Styled
            </Button>
            <Button style={{ color: "var(--salt-palette-accent-border)" }}>
              Palette
            </Button>
          </>
        );
      }
    `;

    const result = recommendFixRecipes(recipeRegistry, {
      code,
      framework: "react",
      package_version: "2.0.0",
      max_recipes: 10,
    });

    expect(result.summary.recipe_count).toBeGreaterThan(0);
    expect(result.fixes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          problem:
            "Button: Use Link for navigation. Link: Navigate to another route.",
          category: "primitive-choice",
          rule: "navigation-target-uses-navigation-component",
          recommended_fix: "Use Link for navigation targets instead of Button.",
        }),
        expect.objectContaining({
          rule: "no-hardcoded-size-values",
          token_recommendations: expect.arrayContaining(["--salt-size-base"]),
        }),
        expect.objectContaining({
          rule: "no-direct-palette-token-use",
          token_recommendations: expect.arrayContaining([
            "--salt-actionable-borderColor",
          ]),
        }),
        expect.objectContaining({
          rule: "border-thickness-uses-fixed-size-token",
          token_recommendations: expect.arrayContaining([
            "--salt-size-fixed-100",
          ]),
        }),
      ]),
    );
  });

  it("does not flag zero-valued JSX or CSS sizes as hardcoded sizing", () => {
    const jsxCode = [
      'import { Button } from "@salt-ds/core";',
      "export function ZeroSpacing() {",
      '  return <Button style={{ margin: 0, padding: "0px", minHeight: `-0rem` }}>Save</Button>;',
      "}",
    ].join("\n");
    const cssCode = ".fixture { margin: 0; padding: 0px; min-height: -0rem; }";

    for (const [code, framework] of [
      [jsxCode, "react"],
      [cssCode, "css"],
    ] as const) {
      const result = recommendFixRecipes(REGISTRY, {
        code,
        framework,
        max_recipes: 10,
      });

      expect(result.fixes).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ rule: "no-hardcoded-size-values" }),
        ]),
      );
    }
  });

  it("can recommend fixes from conservative stylesheet scanning", () => {
    const recipeRegistry: SaltRegistry = {
      ...REGISTRY,
      tokens: [
        {
          name: "--salt-container-primary-borderColor",
          category: "container",
          type: "color",
          value: "#d0d7de",
          semantic_intent: "primary container border",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Divider", "Separator"],
          guidance: [
            "Pair primary container borders with primary container backgrounds.",
          ],
          aliases: [],
          policy: {
            usage_tier: "characteristic",
            direct_component_use: "always",
            preferred_for: ["semantic component styling", "pattern styling"],
            avoid_for: ["choosing by visual similarity alone"],
            notes: [
              "Pair container background and border tokens from the same level to keep surfaces visually coherent.",
            ],
            docs: [
              "/salt/themes/design-tokens/container-characteristic",
              "/salt/themes/design-tokens/index",
            ],
            structural_roles: ["container-border-color"],
            pairing: {
              family: "container",
              role: "container-border-color",
              level: "primary",
            },
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
        {
          name: "--salt-separable-secondary-borderColor",
          category: "separable",
          type: "color",
          value: "#d0d7de",
          semantic_intent: "secondary separator border",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Divider", "Separator"],
          guidance: ["Use separable tokens for divider and separator lines."],
          aliases: [],
          policy: {
            usage_tier: "characteristic",
            direct_component_use: "always",
            preferred_for: ["divider colors", "separator colors"],
            avoid_for: ["borrowing container or content colors for separators"],
            notes: [
              "Use separable tokens to divide sections and groups rather than reusing unrelated border colors.",
            ],
            docs: [
              "/salt/themes/design-tokens/separable-characteristic",
              "/salt/themes/design-tokens/index",
            ],
            structural_roles: ["separator-color"],
            pairing: null,
          },
          deprecated: false,
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const code = `
      .appSeparator {
        border-left: 1px solid var(--salt-container-primary-borderColor);
      }
    `;

    const result = recommendFixRecipes(recipeRegistry, {
      code,
      framework: "react",
      max_recipes: 10,
    });

    expect(result.fixes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "separators-use-separable-tokens",
          token_recommendations: expect.arrayContaining([
            "--salt-separable-secondary-borderColor",
          ]),
        }),
      ]),
    );
  });

  it("adds targeted remediation for link-action and pass-through wrapper rules", () => {
    const recipeRegistry: SaltRegistry = {
      ...REGISTRY,
      examples: [
        {
          id: "button.default",
          title: "Default button",
          description: "Basic action button example.",
          intent: ["button action"],
          complexity: "basic",
          code: "<Button onClick={save}>Save</Button>",
          source_url: "/salt/components/button/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "Button",
        },
        {
          id: "link.default",
          title: "Default link",
          description: "Basic navigation link example.",
          intent: ["link navigation"],
          complexity: "basic",
          code: '<Link href="/next">Go</Link>',
          source_url: "/salt/components/link/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "Link",
        },
      ],
      components: REGISTRY.components.map((component) => {
        if (component.name === "Button") {
          return {
            ...component,
            examples: [
              {
                id: "button.default",
                title: "Default button",
                description: "Basic action button example.",
                intent: ["button action"],
                complexity: "basic",
                code: "<Button onClick={save}>Save</Button>",
                source_url: "/salt/components/button/examples",
                package: "@salt-ds/core",
                target_type: "component",
                target_name: "Button",
              },
            ],
          };
        }

        if (component.name === "Link") {
          return {
            ...component,
            examples: [
              {
                id: "link.default",
                title: "Default link",
                description: "Basic navigation link example.",
                intent: ["link navigation"],
                complexity: "basic",
                code: '<Link href="/next">Go</Link>',
                source_url: "/salt/components/link/examples",
                package: "@salt-ds/core",
                target_type: "component",
                target_name: "Link",
              },
            ],
          };
        }

        return component;
      }),
    };
    const code = `
      import { Button, Link } from "@salt-ds/core";

      export function ActionLink() {
        return <Link onClick={() => console.log("save")}>Save</Link>;
      }

      export const PrimaryButton = (props) => <Button {...props} />;
    `;

    const result = recommendFixRecipes(recipeRegistry, {
      code,
      framework: "react",
      max_recipes: 10,
    });

    expect(result.fixes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          problem:
            "Link: Use Button for actions. Button: Trigger an immediate action.",
          category: "primitive-choice",
          rule: "navigation-component-used-as-action",
          recommended_fix:
            "Use Button for actions instead of Link, or add a navigation target when this component is meant to navigate.",
          docs: expect.arrayContaining([
            "/salt/components/button/usage",
            "/salt/components/link/usage",
          ]),
          related_guides: expect.arrayContaining([
            expect.objectContaining({
              name: "Choosing the right primitive",
              overview: "/salt/getting-started/choosing-the-right-primitive",
            }),
          ]),
        }),
        expect.objectContaining({
          problem:
            "Custom wrappers: Avoid wrappers that only forward props to a single Salt primitive. Wrapped component: Button.",
          category: "composition",
          rule: "avoid-pass-through-wrapper-over-salt-primitive",
          recommended_fix:
            "Custom wrappers: Avoid wrappers that only forward props to a single Salt primitive.",
          next_steps: expect.arrayContaining([
            "Use Custom wrappers: Learn when a wrapper over a Salt primitive adds value and when it is only hiding the underlying component behind prop forwarding.",
          ]),
          related_guides: expect.arrayContaining([
            expect.objectContaining({
              name: "Custom wrappers",
              overview: "/salt/getting-started/custom-wrappers",
            }),
          ]),
        }),
      ]),
    );
  });

  it("adds targeted remediation for native and role-based primitive recreation", () => {
    const recipeRegistry: SaltRegistry = {
      ...REGISTRY,
      examples: [
        {
          id: "button.default",
          title: "Default button",
          description: "Basic action button example.",
          intent: ["button action"],
          complexity: "basic",
          code: "<Button onClick={save}>Save</Button>",
          source_url: "/salt/components/button/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "Button",
        },
        {
          id: "link.default",
          title: "Default link",
          description: "Basic navigation link example.",
          intent: ["link navigation"],
          complexity: "basic",
          code: '<Link href="/next">Go</Link>',
          source_url: "/salt/components/link/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "Link",
        },
      ],
      components: REGISTRY.components.map((component) => {
        if (component.name === "Button") {
          return {
            ...component,
            examples: [
              {
                id: "button.default",
                title: "Default button",
                description: "Basic action button example.",
                intent: ["button action"],
                complexity: "basic",
                code: "<Button onClick={save}>Save</Button>",
                source_url: "/salt/components/button/examples",
                package: "@salt-ds/core",
                target_type: "component",
                target_name: "Button",
              },
            ],
          };
        }

        if (component.name === "Link") {
          return {
            ...component,
            examples: [
              {
                id: "link.default",
                title: "Default link",
                description: "Basic navigation link example.",
                intent: ["link navigation"],
                complexity: "basic",
                code: '<Link href="/next">Go</Link>',
                source_url: "/salt/components/link/examples",
                package: "@salt-ds/core",
                target_type: "component",
                target_name: "Link",
              },
            ],
          };
        }

        return component;
      }),
    };
    const code = `
      import { Button, Link } from "@salt-ds/core";

      export function Demo() {
        return (
          <>
            <button onClick={() => console.log("save")}>Save</button>
            <div role="link" onClick={() => console.log("go")}>Go</div>
          </>
        );
      }
    `;

    const result = recommendFixRecipes(recipeRegistry, {
      code,
      framework: "react",
      max_recipes: 10,
    });

    expect(result.fixes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          problem: `Button: Trigger an immediate action. ${PRIMITIVE_GUIDE_NAME}: ${PRIMITIVE_GUIDE_SUMMARY}`,
          category: "primitive-choice",
          rule: "native-button-should-prefer-salt-button",
          recommended_fix:
            "Use Button for action intent instead of recreating that primitive with a native button element.",
          next_steps: expect.arrayContaining([PRIMITIVE_GUIDE_STEP]),
        }),
        expect.objectContaining({
          problem: `Link: Navigate to another route. ${PRIMITIVE_GUIDE_NAME}: ${PRIMITIVE_GUIDE_SUMMARY}`,
          category: "primitive-choice",
          rule: "custom-link-role-should-prefer-salt-link",
          recommended_fix:
            'Use Link for navigation intent instead of recreating that primitive with a custom element with role="link".',
          next_steps: expect.arrayContaining([PRIMITIVE_GUIDE_STEP]),
        }),
      ]),
    );
  });

  it("can return full remediation evidence when requested", () => {
    const code = `
      import { Button } from "@salt-ds/core";

      export function Demo() {
        return <Button href="/next">Go</Button>;
      }
    `;

    const result = recommendFixRecipes(REGISTRY, {
      code,
      framework: "react",
      view: "full",
    });

    expect(result.recipes?.[0]).toMatchObject({
      issue: expect.objectContaining({
        id: "component-choice.navigation",
        category: "primitive-choice",
        rule: "navigation-target-uses-navigation-component",
      }),
      related_guides: expect.arrayContaining([
        expect.objectContaining({
          name: "Choosing the right primitive",
          overview: "/salt/getting-started/choosing-the-right-primitive",
        }),
      ]),
    });
  });
});

describe("reviewSaltUi", () => {
  it("combines validation, fixes, and migrations into one workflow result", () => {
    const result = reviewSaltUi(REGISTRY, {
      code: `
        import { Button } from "@salt-ds/core";

        export function Demo() {
          return <Button href="/next">Go</Button>;
        }
      `,
      framework: "react",
      package_version: "2.0.0",
    });

    expect(result.guidance_boundary).toMatchObject({
      guidance_source: "canonical_salt",
      project_conventions: {
        check_recommended: true,
        topics: expect.arrayContaining(["wrappers"]),
      },
    });
    expect(result.decision.status).toBe("needs_attention");
    expect(result.summary.errors).toBeGreaterThan(0);
    expect(result.fixes?.[0]).toBeTruthy();
    expect(result.issues?.[0]).toMatchObject({
      id: "component-choice.navigation",
      category: "primitive-choice",
      rule: "navigation-target-uses-navigation-component",
      canonical_source: "/salt/components/button/usage",
      fix_hints: {
        related_components: ["Button", "Link"],
      },
    });
  });

  it("scores fix recipes against migrations beyond the visible review limit", () => {
    const earlierMigrations: SaltRegistry["deprecations"] = [
      "aaa",
      "aab",
      "aac",
      "aad",
    ].map((prefix) => ({
      id: `dep.button.${prefix}-legacy`,
      package: "@salt-ds/core",
      component: "Button",
      kind: "prop",
      name: `${prefix}Legacy`,
      deprecated_in: "2.0.0",
      removed_in: null,
      replacement: {
        type: "prop",
        name: `${prefix}Current`,
        notes: `Use ${prefix}Current instead.`,
      },
      migration: {
        strategy: "replace",
        details: [
          {
            from: `${prefix}Legacy="legacy"`,
            to: `${prefix}Current="current"`,
          },
        ],
      },
      source_urls: [`/salt/${prefix}`],
    }));
    const registry: SaltRegistry = {
      ...REGISTRY,
      deprecations: [...REGISTRY.deprecations, ...earlierMigrations],
    };
    const result = reviewSaltUi(registry, {
      code: `
        import { Button } from "@salt-ds/core";

        export function Demo() {
          return (
            <Button
              variant="cta"
              aaaLegacy="legacy"
              aabLegacy="legacy"
              aacLegacy="legacy"
              aadLegacy="legacy"
            >
              Save
            </Button>
          );
        }
      `,
      framework: "react",
      package_version: "2.0.0",
      max_issues: 1,
    });

    expect(result.issues?.[0]?.id).toContain("variant");
    expect(result.migrations).toHaveLength(1);
    expect(result.migrations?.[0]?.from).toContain("aaaLegacy");
    expect(result.fixes?.[0]?.next_steps).toContain(
      "Use appearance and sentiment instead.",
    );
    expect(result.source_urls).toEqual(
      expect.arrayContaining(["/salt/changelog", "/salt/aaa", "/salt/aab"]),
    );
    expect(result.source_urls).not.toContain("/salt/aac");
    expect(result.source_urls).not.toContain("/salt/aad");
  });

  it("grounds clean reviews in docs for the Salt entities present in source", () => {
    const result = reviewSaltUi(REGISTRY, {
      code: `
        import { Button, Link } from "@salt-ds/core";

        export function Demo() {
          return (
            <div>
              <Button>Save</Button>
              <Link href="/details">Details</Link>
            </div>
          );
        }
      `,
      framework: "react",
      package_version: "2.0.0",
    });

    expect(result.decision.status).toBe("clean");
    expect(result.source_urls).toEqual(
      expect.arrayContaining([
        "/salt/components/button",
        "/salt/components/link",
      ]),
    );
  });

  it("accepts an exactly imported approved repo wrapper for an expected canonical component", () => {
    const result = reviewSaltUi(
      REGISTRY,
      {
        code: `
          import { AppButton } from "@/components/AppButton";

          export function Demo() {
            return <AppButton>Save</AppButton>;
          }
        `,
        framework: "react",
        expected_targets: {
          components: ["Button"],
          source: "create_report",
        },
      },
      {
        approved_wrappers: [
          {
            wraps: "Button",
            import: {
              from: "@/components/AppButton",
              name: "AppButton",
            },
          },
        ],
      },
    );

    expect(result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-component-not-imported",
        }),
      ]),
    );
  });

  it.each([
    {
      label: "missing wrapper import",
      code: "export function Demo() { return <AppButton>Save</AppButton>; }",
    },
    {
      label: "wrapper imported from the wrong module",
      code: `
        import { AppButton } from "@/components/LegacyAppButton";
        export function Demo() { return <AppButton>Save</AppButton>; }
      `,
    },
    {
      label: "wrong export imported from the approved module",
      code: `
        import { LegacyButton as AppButton } from "@/components/AppButton";
        export function Demo() { return <AppButton>Save</AppButton>; }
      `,
    },
  ])("does not accept a $label for an expected canonical component", ({
    code,
  }) => {
    const result = reviewSaltUi(
      REGISTRY,
      {
        code,
        framework: "react",
        expected_targets: {
          components: ["Button"],
          source: "create_report",
        },
      },
      {
        approved_wrappers: [
          {
            wraps: "Button",
            import: {
              from: "@/components/AppButton",
              name: "AppButton",
            },
          },
        ],
      },
    );

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-component-not-imported",
        }),
      ]),
    );
  });

  it("records unsupported pattern validation only when review is given an explicit fixture expected target", () => {
    // Fixture-only expected target: this verifies provenance behavior without
    // adding production Salt pattern facts to the test.
    const fixturePattern = "FixtureWorkflowPattern";
    const code = `
      export function FixtureSurface() {
        return <div />;
      }
    `;

    const withoutExpectedTarget = reviewSaltUi(REGISTRY, {
      code,
      framework: "react",
    });
    const withExpectedTarget = reviewSaltUi(REGISTRY, {
      code,
      framework: "react",
      expected_targets: {
        patterns: [fixturePattern],
        source: "create_report",
      },
    });

    expect(withoutExpectedTarget.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-expected.unsupported-pattern.fixtureworkflowpattern",
        }),
      ]),
    );
    expect(withExpectedTarget.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-expected.unsupported-pattern.fixtureworkflowpattern",
          category: "composition",
          rule: "workflow-expected-pattern-validation-unsupported",
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "workflow_input",
              claim_kind: "workflow",
            }),
          ]),
        }),
      ]),
    );
    expect(withExpectedTarget.missing_data).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Expected pattern target 'FixtureWorkflowPattern'",
        ),
        expect.stringContaining("no matching Salt registry pattern"),
      ]),
    );
  });

  it("reports unsupported pattern rule kinds as non-blocking internal limitations", () => {
    const fixtureRegistry = buildFixtureExpectedPatternRegistry();
    fixtureRegistry.patterns = fixtureRegistry.patterns.map((pattern) =>
      pattern.id === "fixture-workflow"
        ? {
            ...pattern,
            starter_scaffold: {
              fidelity: "canonical",
              source_urls: pattern.starter_scaffold?.source_urls ?? [],
              example_source_urls: [],
              semantics: {
                regions: [],
                build_around: [],
                preserve_constraints: ["Keep the fixture workflow constraint."],
              },
            },
          }
        : pattern,
    );

    const result = reviewSaltUi(fixtureRegistry, {
      code: "export function FixtureSurface() { return <div />; }",
      framework: "react",
      expected_targets: {
        patterns: ["FixtureWorkflow"],
        source: "create_report",
      },
    });

    expect(result.decision.status).toBe("clean");
    expect(result.missing_data).not.toEqual(
      expect.arrayContaining([expect.stringContaining("FixtureWorkflow")]),
    );
    expect(result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-pattern-validation-unsupported",
        }),
      ]),
    );
    expect(result.unsupported_rule_kinds).toContain(
      "starter-preserve-constraint",
    );
  });

  it("validates expected fixture pattern imports from source-backed starter scaffold evidence", () => {
    const fixtureRegistry = buildFixtureExpectedPatternRegistry();
    const result = reviewSaltUi(fixtureRegistry, {
      code: `
        export function FixtureSurface() {
          return <div />;
        }
      `,
      framework: "react",
      expected_targets: {
        patterns: ["FixtureWorkflow"],
        source: "create_report",
      },
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-expected.pattern-missing-import.fixtureworkflow.fixtureaction",
          category: "composition",
          rule: "workflow-expected-pattern-import-not-found",
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "workflow_input",
              claim_kind: "workflow",
            }),
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "import",
              registry: expect.objectContaining({
                entity_type: "pattern",
                entity_id: "fixture-workflow",
                field_path: "starter_scaffold.template.imports.0.name",
              }),
            }),
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "component",
              registry: expect.objectContaining({
                entity_type: "component",
                entity_id: "fixture-action",
                field_path: "name",
              }),
            }),
          ]),
        }),
      ]),
    );
    expect(result.missing_data).not.toEqual(
      expect.arrayContaining([expect.stringContaining("FixtureWorkflow")]),
    );
  });

  it("treats imported fixture pattern starter import as satisfied when source-backed imports are present", () => {
    const fixtureRegistry = buildFixtureExpectedPatternRegistry();
    const result = reviewSaltUi(fixtureRegistry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureSurface() {
          return <FixtureAction />;
        }
      `,
      framework: "react",
      expected_targets: {
        patterns: ["FixtureWorkflow"],
        source: "create_report",
      },
    });

    expect(result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-pattern-import-not-found",
        }),
      ]),
    );
    expect(result.missing_data).not.toEqual(
      expect.arrayContaining([expect.stringContaining("FixtureWorkflow")]),
    );
  });

  it("accepts an approved wrapper for a pattern import without suppressing unrelated region findings", () => {
    const fixtureRegistry = buildFixtureExpectedPatternRegistry();
    fixtureRegistry.patterns = fixtureRegistry.patterns.map((pattern) =>
      pattern.id === "fixture-workflow"
        ? {
            ...pattern,
            starter_scaffold: {
              ...pattern.starter_scaffold,
              semantics: {
                ...pattern.starter_scaffold?.semantics,
                regions: ["fixture header"],
                build_around:
                  pattern.starter_scaffold?.semantics.build_around ?? [],
                preserve_constraints:
                  pattern.starter_scaffold?.semantics.preserve_constraints ??
                  [],
              },
            },
          }
        : pattern,
    );
    const approvedWrappers = [
      {
        wraps: "FixtureAction",
        import: {
          from: "@/components/FixtureActionButton",
          name: "FixtureActionButton",
        },
      },
    ];
    const review = (moduleName: string) =>
      reviewSaltUi(
        fixtureRegistry,
        {
          code: `
            import { FixtureActionButton } from "${moduleName}";
            export function FixtureSurface() {
              return <FixtureActionButton />;
            }
          `,
          framework: "react",
          expected_targets: {
            patterns: ["FixtureWorkflow"],
            source: "create_report",
          },
        },
        { approved_wrappers: approvedWrappers },
      );

    const approvedImport = review("@/components/FixtureActionButton");
    const wrongImport = review("@/components/LegacyFixtureActionButton");

    expect(approvedImport.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-pattern-import-not-found",
        }),
      ]),
    );
    expect(approvedImport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-pattern-region-not-found",
        }),
      ]),
    );
    expect(wrongImport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-pattern-import-not-found",
        }),
        expect.objectContaining({
          rule: "workflow-expected-pattern-region-not-found",
        }),
      ]),
    );
  });

  it("validates expected fixture pattern starter regions from source-backed rule evidence", () => {
    const fixtureRegistry = buildFixtureExpectedPatternRegistry();
    fixtureRegistry.patterns = fixtureRegistry.patterns.map((pattern) =>
      pattern.id === "fixture-workflow"
        ? {
            ...pattern,
            starter_scaffold: {
              ...pattern.starter_scaffold,
              semantics: {
                ...pattern.starter_scaffold?.semantics,
                regions: ["fixture header"],
                build_around:
                  pattern.starter_scaffold?.semantics.build_around ?? [],
                preserve_constraints:
                  pattern.starter_scaffold?.semantics.preserve_constraints ??
                  [],
              },
            },
          }
        : pattern,
    );

    const missingRegion = reviewSaltUi(fixtureRegistry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureSurface() {
          return <FixtureAction />;
        }
      `,
      framework: "react",
      expected_targets: {
        patterns: ["FixtureWorkflow"],
        source: "create_report",
      },
    });
    const regionSatisfied = reviewSaltUi(fixtureRegistry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureSurface() {
          return <section data-region="fixture-header"><FixtureAction /></section>;
        }
      `,
      framework: "react",
      expected_targets: {
        patterns: ["FixtureWorkflow"],
        source: "create_report",
      },
    });

    expect(missingRegion.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-expected.pattern-missing-region.fixtureworkflow.fixtureheader",
          category: "composition",
          rule: "workflow-expected-pattern-region-not-found",
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "workflow_input",
              claim_kind: "workflow",
            }),
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "pattern",
              registry: expect.objectContaining({
                entity_type: "pattern",
                entity_id: "fixture-workflow",
                field_path: "starter_scaffold.semantics.regions.0",
              }),
            }),
          ]),
        }),
      ]),
    );
    expect(regionSatisfied.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-pattern-region-not-found",
        }),
      ]),
    );
  });

  it("accepts semantic header, navigation, and main elements for matching pattern regions", () => {
    const fixtureRegistry = buildFixtureExpectedPatternRegistry();
    fixtureRegistry.patterns = fixtureRegistry.patterns.map((pattern) =>
      pattern.id === "fixture-workflow"
        ? {
            ...pattern,
            starter_scaffold: {
              ...pattern.starter_scaffold,
              semantics: {
                ...pattern.starter_scaffold?.semantics,
                regions: ["app header", "navigation pane", "primary content"],
                build_around: [],
                preserve_constraints:
                  pattern.starter_scaffold?.semantics.preserve_constraints ??
                  [],
              },
            },
          }
        : pattern,
    );

    const result = reviewSaltUi(fixtureRegistry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureSurface() {
          return (
            <>
              <header><FixtureAction /></header>
              <aside aria-label="Application navigation" />
              <main />
            </>
          );
        }
      `,
      framework: "react",
      expected_targets: {
        patterns: ["FixtureWorkflow"],
        source: "create_report",
      },
    });

    expect(result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-pattern-region-not-found",
        }),
      ]),
    );
  });

  it("validates expected fixture pattern build-around markers from source-backed rule evidence", () => {
    const fixtureRegistry = buildFixtureExpectedPatternRegistry();
    fixtureRegistry.patterns = fixtureRegistry.patterns.map((pattern) =>
      pattern.id === "fixture-workflow"
        ? {
            ...pattern,
            starter_scaffold: {
              ...pattern.starter_scaffold,
              semantics: {
                ...pattern.starter_scaffold?.semantics,
                regions: pattern.starter_scaffold?.semantics.regions ?? [],
                build_around: ["fixture shell"],
                preserve_constraints:
                  pattern.starter_scaffold?.semantics.preserve_constraints ??
                  [],
              },
            },
          }
        : pattern,
    );

    const missingBuildAround = reviewSaltUi(fixtureRegistry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureSurface() {
          return <FixtureAction />;
        }
      `,
      framework: "react",
      expected_targets: {
        patterns: ["FixtureWorkflow"],
        source: "create_report",
      },
    });
    const buildAroundSatisfied = reviewSaltUi(fixtureRegistry, {
      code: `
        import { FixtureAction } from "@salt-ds/fixture";

        export function FixtureSurface() {
          return <section data-region="fixture-shell"><FixtureAction /></section>;
        }
      `,
      framework: "react",
      expected_targets: {
        patterns: ["FixtureWorkflow"],
        source: "create_report",
      },
    });

    expect(missingBuildAround.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-expected.pattern-missing-build-around.fixtureworkflow.fixtureshell",
          category: "composition",
          rule: "workflow-expected-pattern-build-around-not-found",
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "workflow_input",
              claim_kind: "workflow",
            }),
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "pattern",
              registry: expect.objectContaining({
                entity_type: "pattern",
                entity_id: "fixture-workflow",
                field_path: "starter_scaffold.semantics.build_around.0",
              }),
            }),
          ]),
        }),
      ]),
    );
    expect(buildAroundSatisfied.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "workflow-expected-pattern-build-around-not-found",
        }),
      ]),
    );
  });

  it("source-backs every known Salt component import even when it was not an expected target", () => {
    const result = reviewSaltUi(REGISTRY, {
      code: `
        import { Button, Link } from "@salt-ds/core";

        export function FixtureSurface() {
          return <Button><Link href="/next">Next</Link></Button>;
        }
      `,
      framework: "react",
      expected_targets: {
        components: ["Link"],
        source: "create_report",
      },
    });

    expect(result.artifact_verification).toMatchObject({
      status: "complete",
      component_imports: expect.arrayContaining([
        expect.objectContaining({
          package: "@salt-ds/core",
          imported: "Button",
          resolved_entity: "Button",
          status: "verified",
          source_urls: expect.arrayContaining(["/salt/components/button"]),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "component",
              registry: expect.objectContaining({
                entity_name: "Button",
              }),
            }),
          ]),
        }),
      ]),
    });
  });

  it("resolves BorderItem and GridItem through generated source-backed canonical example ownership", () => {
    const baseComponent = REGISTRY.components.find(
      (component) => component.name === "Button",
    );
    expect(baseComponent).toBeTruthy();
    if (!baseComponent) {
      return;
    }

    const borderExample: SaltRegistry["examples"][number] = {
      id: "example.border-layout.compound-export",
      title: "Border layout compound export",
      description: "Canonical Border layout example.",
      intent: [],
      complexity: "basic",
      code: `import { BorderItem, BorderLayout } from "@salt-ds/core";`,
      source_url: "/salt/components/border-layout/examples",
      package: "@salt-ds/core",
      target_type: "component",
      target_name: "Border layout",
    };
    const gridExample: SaltRegistry["examples"][number] = {
      id: "example.grid-layout.compound-export",
      title: "Grid layout compound export",
      description: "Canonical Grid layout example.",
      intent: [],
      complexity: "basic",
      code: `import { GridItem, GridLayout } from "@salt-ds/core";`,
      source_url: "/salt/components/grid-layout/examples",
      package: "@salt-ds/core",
      target_type: "component",
      target_name: "Grid layout",
    };
    const registry: SaltRegistry = {
      ...REGISTRY,
      components: [
        ...REGISTRY.components,
        {
          ...baseComponent,
          id: "component.border-layout",
          name: "Border layout",
          aliases: [],
          examples: [borderExample],
          canonical_example_exports: [
            {
              export_name: "BorderItem",
              example_id: borderExample.id,
              source_url: "/salt/components/border-layout/examples",
            },
          ],
          related_docs: {
            ...baseComponent.related_docs,
            overview: "/salt/components/border-layout",
            usage: "/salt/components/border-layout/usage",
            examples: "/salt/components/border-layout/examples",
          },
          source: {
            repo_path: "packages/core/src/border-layout",
            export_name: "BorderLayout",
          },
        },
        {
          ...baseComponent,
          id: "component.grid-layout",
          name: "Grid layout",
          aliases: [],
          examples: [gridExample],
          canonical_example_exports: [
            {
              export_name: "GridItem",
              example_id: gridExample.id,
              source_url: "/salt/components/grid-layout/examples",
            },
          ],
          related_docs: {
            ...baseComponent.related_docs,
            overview: "/salt/components/grid-layout",
            usage: "/salt/components/grid-layout/usage",
            examples: "/salt/components/grid-layout/examples",
          },
          source: {
            repo_path: "packages/core/src/grid-layout",
            export_name: "GridLayout",
          },
        },
      ],
      examples: [...REGISTRY.examples, borderExample, gridExample],
    };
    const result = reviewSaltUi(registry, {
      code: `
        import { BorderItem, GridItem } from "@salt-ds/core";

        export function FixtureSurface() {
          return <BorderItem position="center"><GridItem /></BorderItem>;
        }
      `,
      framework: "react",
    });

    expect(result.artifact_verification).toMatchObject({
      status: "complete",
      component_imports: expect.arrayContaining([
        expect.objectContaining({
          imported: "BorderItem",
          resolved_entity: "Border layout",
          resolution: "canonical_example_export",
          source_urls: expect.arrayContaining([
            "/salt/components/border-layout/examples",
          ]),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "example",
              claim_kind: "import",
              registry: expect.objectContaining({
                entity_id: "component.border-layout",
                field_path:
                  "examples.example.border-layout.compound-export.code",
              }),
              source: {
                url: "/salt/components/border-layout/examples",
              },
            }),
          ]),
        }),
        expect.objectContaining({
          imported: "GridItem",
          resolved_entity: "Grid layout",
          resolution: "canonical_example_export",
          source_urls: expect.arrayContaining([
            "/salt/components/grid-layout/examples",
          ]),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "example",
              claim_kind: "import",
              registry: expect.objectContaining({
                entity_id: "component.grid-layout",
                field_path: "examples.example.grid-layout.compound-export.code",
              }),
              source: {
                url: "/salt/components/grid-layout/examples",
              },
            }),
          ]),
        }),
      ]),
    });
    expect(result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "salt-component-import-unverified",
        }),
      ]),
    );
  });

  it("blocks an unknown Salt component import instead of silently passing it", () => {
    const result = reviewSaltUi(REGISTRY, {
      code: `
        import { ImaginarySaltPanel } from "@salt-ds/core";

        export function FixtureSurface() {
          return <ImaginarySaltPanel />;
        }
      `,
      framework: "react",
    });

    expect(result.decision.status).toBe("needs_attention");
    expect(result.summary.errors).toBeGreaterThan(0);
    expect(result.artifact_verification).toMatchObject({
      status: "incomplete",
      component_imports: [
        expect.objectContaining({
          package: "@salt-ds/core",
          imported: "ImaginarySaltPanel",
          resolved_entity: null,
          status: "unsupported",
        }),
      ],
    });
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "salt-component-import-unverified",
          severity: "error",
          source_urls: [],
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "workflow_input",
              workflow_input: {
                field_path: "code.imports",
              },
            }),
          ]),
        }),
      ]),
    );
  });
});
