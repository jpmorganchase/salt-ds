import { recommendFixRecipes, reviewSaltUi } from "@salt-ds/semantic-core";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { describe, expect, it } from "vitest";
import {
  CODE_ANALYSIS_REGISTRY as REGISTRY,
  TIMESTAMP,
} from "./fixtures/codeAnalysisRegistry.js";

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
            "This interaction looks like navigation rather than an in-place action.",
          category: "primitive-choice",
          rule: "button-must-not-handle-navigation",
          recommended_fix:
            "Use Link for navigation and keep Button for in-place actions.",
        }),
        expect.objectContaining({
          problem:
            "Hard-coded sizing values were detected. Prefer semantic Salt tokens for control size and spacing.",
          token_recommendations: expect.arrayContaining(["--salt-size-base"]),
        }),
        expect.objectContaining({
          problem:
            "Styling references palette tokens directly. Palette tokens are internal mapping tokens; choose a semantic characteristic token instead.",
          token_recommendations: expect.arrayContaining([
            "--salt-actionable-borderColor",
          ]),
        }),
        expect.objectContaining({
          problem:
            "Border styling uses a hard-coded value or a non-fixed size token. Use fixed size tokens for border and separator thickness so line weight stays stable across densities.",
          token_recommendations: expect.arrayContaining([
            "--salt-size-fixed-100",
          ]),
        }),
      ]),
    );
  });

  it("can recommend fixes from conservative stylesheet scanning", () => {
    const recipeRegistry: SaltRegistry = {
      ...REGISTRY,
      tokens: [
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
          problem:
            "Separator or divider styling appears to use a non-separable color token. Use separable tokens for separator and divider lines.",
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
            "This interaction looks action-oriented rather than navigational.",
          category: "primitive-choice",
          rule: "link-without-navigation-target-should-prefer-button",
          recommended_fix:
            "Use Button for actions, or add a real navigation target if this element is meant to navigate.",
          next_steps: expect.arrayContaining([
            "Replace Link with Button when the element triggers work instead of navigation.",
          ]),
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
            "Wrapper component PrimaryButton only forwards props to Salt primitive Button without adding structure or behavior.",
          category: "composition",
          rule: "avoid-pass-through-wrapper-over-salt-primitive",
          recommended_fix:
            "Use the underlying Salt primitive directly unless the wrapper is establishing meaningful shared behavior, semantics, or a stable public API.",
          next_steps: expect.arrayContaining([
            "Use Button directly where possible.",
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
          problem:
            "This Salt UI recreates a standard button with a native element.",
          category: "primitive-choice",
          rule: "native-button-should-prefer-salt-button",
          recommended_fix:
            "Replace native button elements with Salt Button unless a native-only behavior is required.",
          next_steps: expect.arrayContaining([
            "Use Choosing the right primitive to keep actions on Button and navigation on Link before accepting a custom or native alternative.",
            "Replace the button-like element with Salt Button so interaction, semantics, and styling come from the design system.",
          ]),
        }),
        expect.objectContaining({
          problem: "This Salt UI recreates a standard link with a custom role.",
          category: "primitive-choice",
          rule: "custom-link-role-should-prefer-salt-link",
          recommended_fix:
            "Replace the custom link-like element with Salt Link unless there is a strong reason to manage link semantics manually.",
          next_steps: expect.arrayContaining([
            "Use Choosing the right primitive to keep actions on Button and navigation on Link before accepting a custom or native alternative.",
            "Replace the link-like element with Salt Link so interaction, semantics, and styling come from the design system.",
          ]),
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
        rule: "button-must-not-handle-navigation",
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
      rule: "button-must-not-handle-navigation",
      canonical_source: "/salt/getting-started/choosing-the-right-primitive",
      fix_hints: {
        related_components: ["Button", "Link"],
        guide_lookups: ["choosing-the-right-primitive"],
      },
    });
  });

  it("flags metric-pattern drift only when review is given an explicit expected target", () => {
    const code = `
      import { Card, StackLayout, Text } from "@salt-ds/core";

      export function MetricSurface() {
        return (
          <Card>
            <StackLayout gap={1}>
              <Text styleAs="label">PnL</Text>
              <Text styleAs="h3">+12.5%</Text>
            </StackLayout>
          </Card>
        );
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
        patterns: ["Metric"],
        source: "create_report",
      },
    });

    expect(withoutExpectedTarget.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-expected.metric-pattern",
        }),
      ]),
    );
    expect(withExpectedTarget.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-expected.metric-pattern",
          category: "primitive-choice",
          rule: "workflow-expected-metric-pattern",
        }),
      ]),
    );
  });
});
