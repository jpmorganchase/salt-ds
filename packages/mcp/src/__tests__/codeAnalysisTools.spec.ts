import { describe, expect, it } from "vitest";
import {
  analyzeSaltCode,
  recommendFixRecipes,
  suggestMigration,
  validateSaltUsage,
} from "../tools/index.js";
import type { SaltRegistry } from "../types.js";

const TIMESTAMP = "2026-03-10T00:00:00Z";

const REGISTRY: SaltRegistry = {
  generated_at: TIMESTAMP,
  version: "1.0.0",
  build_info: null,
  packages: [
    {
      id: "package.core",
      name: "@salt-ds/core",
      status: "stable",
      version: "2.0.0",
      summary: "Core Salt components.",
      source_root: "packages/core",
      changelog_path: "packages/core/CHANGELOG.md",
      docs_root: "/salt/components",
    },
    {
      id: "package.lab",
      name: "@salt-ds/lab",
      status: "lab",
      version: "2.0.0",
      summary: "Lab Salt components.",
      source_root: "packages/lab",
      changelog_path: "packages/lab/CHANGELOG.md",
      docs_root: "/salt/components",
    },
  ],
  components: [
    {
      id: "component.button",
      name: "Button",
      aliases: [],
      package: {
        name: "@salt-ds/core",
        status: "stable",
        since: "1.0.0",
      },
      summary: "Executes an action.",
      status: "stable",
      category: ["actions"],
      tags: ["action", "form"],
      when_to_use: ["Trigger an immediate action."],
      when_not_to_use: ["Use Link for navigation."],
      alternatives: [{ use: "Link", reason: "Use for navigation." }],
      props: [
        {
          name: "appearance",
          type: "string",
          required: false,
          description: "Visual treatment.",
          default: null,
          allowed_values: ["solid", "bordered", "transparent"],
          deprecated: false,
        },
        {
          name: "variant",
          type: '"primary" | "secondary" | "cta"',
          required: false,
          description: "Deprecated variant prop.",
          default: "primary",
          deprecated: true,
          deprecation_note:
            "Use appearance and sentiment instead. | variant | appearance | sentiment | | ----------- | ------------- | ----------- | | cta | solid | accented | | primary | solid | neutral | | secondary | transparent | neutral |",
        },
      ],
      accessibility: {
        summary: ["Must have an accessible name."],
        rules: [
          {
            id: "button-name",
            severity: "error",
            rule: "Provide visible text or another accessible name.",
          },
        ],
      },
      tokens: [
        {
          name: "--salt-size-base",
          category: "size",
          semantic_intent: "base control size",
        },
      ],
      patterns: [],
      examples: [],
      related_docs: {
        overview: "/salt/components/button",
        usage: "/salt/components/button/usage",
        accessibility: "/salt/components/button/accessibility",
        examples: "/salt/components/button/examples",
      },
      source: {
        repo_path: "packages/core/src/button",
        export_name: "Button",
      },
      deprecations: ["dep.button.variant"],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "component.link",
      name: "Link",
      aliases: [],
      package: {
        name: "@salt-ds/core",
        status: "stable",
        since: "1.0.0",
      },
      summary: "Navigates to another route or location.",
      status: "stable",
      category: ["navigation"],
      tags: ["navigation"],
      when_to_use: ["Navigate to another route."],
      when_not_to_use: [],
      alternatives: [{ use: "Button", reason: "Use for action execution." }],
      props: [],
      accessibility: {
        summary: ["Links should have clear text labels."],
        rules: [],
      },
      tokens: [],
      patterns: [],
      examples: [],
      related_docs: {
        overview: "/salt/components/link",
        usage: "/salt/components/link/usage",
        accessibility: "/salt/components/link/accessibility",
        examples: "/salt/components/link/examples",
      },
      source: {
        repo_path: "packages/core/src/link",
        export_name: "Link",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "component.unstable-salt-provider-next",
      name: "UNSTABLE_SaltProviderNext",
      aliases: [],
      package: {
        name: "@salt-ds/core",
        status: "deprecated",
        since: "1.0.0",
      },
      summary: "Legacy provider implementation.",
      status: "deprecated",
      category: ["providers"],
      tags: ["provider"],
      when_to_use: [],
      when_not_to_use: ["Use SaltProvider instead."],
      alternatives: [
        { use: "SaltProvider", reason: "Use the supported provider." },
      ],
      props: [],
      accessibility: {
        summary: [],
        rules: [],
      },
      tokens: [],
      patterns: [],
      examples: [],
      related_docs: {
        overview: "/salt/components/salt-provider-next",
        usage: "/salt/components/salt-provider-next/usage",
        accessibility: "/salt/components/salt-provider-next/accessibility",
        examples: "/salt/components/salt-provider-next/examples",
      },
      source: {
        repo_path: "packages/core/src/salt-provider-next",
        export_name: "UNSTABLE_SaltProviderNext",
      },
      deprecations: ["dep.provider.unstable"],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "component.datepicker",
      name: "DatePicker",
      aliases: [],
      package: {
        name: "@salt-ds/lab",
        status: "lab",
        since: "1.0.0",
      },
      summary: "Experimental date picker.",
      status: "lab",
      category: ["inputs"],
      tags: ["date"],
      when_to_use: ["Use when evaluating lab date entry patterns."],
      when_not_to_use: [
        "Avoid in production unless the lab dependency is intentional.",
      ],
      alternatives: [],
      props: [],
      accessibility: {
        summary: [],
        rules: [],
      },
      tokens: [],
      patterns: [],
      examples: [],
      related_docs: {
        overview: "/salt/components/date-picker",
        usage: "/salt/components/date-picker/usage",
        accessibility: "/salt/components/date-picker/accessibility",
        examples: "/salt/components/date-picker/examples",
      },
      source: {
        repo_path: "packages/lab/src/date-picker",
        export_name: "DatePicker",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
  ],
  icons: [],
  country_symbols: [],
  pages: [],
  patterns: [],
  guides: [],
  tokens: [],
  deprecations: [
    {
      id: "dep.button.variant",
      package: "@salt-ds/core",
      component: "Button",
      kind: "prop",
      name: "variant",
      deprecated_in: "2.0.0",
      removed_in: null,
      replacement: {
        type: "prop",
        name: "appearance",
        notes: "Use appearance and sentiment instead.",
      },
      migration: {
        strategy: "replace",
        details: [{ from: 'variant="cta"', to: 'appearance="solid"' }],
      },
      source_urls: ["/salt/changelog"],
    },
    {
      id: "dep.provider.unstable",
      package: "@salt-ds/core",
      component: null,
      kind: "component",
      name: "UNSTABLE_SaltProviderNext",
      deprecated_in: "2.0.0",
      removed_in: null,
      replacement: {
        type: "component",
        name: "SaltProvider",
        notes: "Use SaltProvider instead.",
      },
      migration: {
        strategy: "replace",
        details: [
          {
            from: "<UNSTABLE_SaltProviderNext>",
            to: "<SaltProvider>",
          },
        ],
      },
      source_urls: ["/salt/changelog"],
    },
  ],
  examples: [],
  changes: [],
  search_index: [],
};

describe("validateSaltUsage", () => {
  it("flags navigation misuse, deprecated usage, accessibility gaps, and hard-coded values", () => {
    const code = `
      import { Button, UNSTABLE_SaltProviderNext } from "@salt-ds/core";

      export function Demo() {
        return (
          <>
            <Button href="/next" variant="cta"><SearchIcon /></Button>
            <UNSTABLE_SaltProviderNext />
            <Button style={{ height: "40px", color: "#ff0000" }}>
              Styled
            </Button>
          </>
        );
      }
    `;
    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });
    const issueIds = result.issues.map((issue) => issue.id);

    expect(issueIds).toContain("component-choice.navigation");
    expect(issueIds).toContain("a11y.button-accessible-name");
    expect(issueIds).toContain("deprecated.prop.salt-ds-core.variant");
    expect(issueIds).toContain(
      "deprecated.import.salt-ds-core.unstable-saltprovidernext",
    );
    expect(issueIds).toContain("tokens.hardcoded-size");
    expect(issueIds).toContain("tokens.hardcoded-color");
    expect(result.summary.errors).toBeGreaterThanOrEqual(2);
    expect(result.summary.warnings).toBeGreaterThanOrEqual(3);
  });

  it("returns no issues for clean aligned usage", () => {
    const code = `
      import { Button, Link } from "@salt-ds/core";

      export function Demo() {
        return (
          <>
            <Button appearance="solid">Save</Button>
            <Link href="/next">Go</Link>
          </>
        );
      }
    `;
    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });

    expect(result.issues).toHaveLength(0);
    expect(result.summary).toEqual({
      errors: 0,
      warnings: 0,
      infos: 0,
    });
  });

  it("flags decorative Button icons that are missing aria-hidden", () => {
    const code = `
      import { Button } from "@salt-ds/core";
      import { SendIcon } from "@salt-ds/icons";

      export function Demo() {
        return (
          <>
            <Button aria-label="Send message">
              <SendIcon />
            </Button>
            <Button>
              <SendIcon /> Send
            </Button>
          </>
        );
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });
    const decorativeIconIssue = result.issues.find(
      (issue) => issue.id === "a11y.button-decorative-icon-hidden",
    );

    expect(decorativeIconIssue).toMatchObject({
      severity: "warning",
      matches: 2,
    });
    expect(result.issues.map((issue) => issue.id)).not.toContain(
      "a11y.button-accessible-name",
    );
  });

  it("does not flag decorative Button icons when aria-hidden is present", () => {
    const code = `
      import { Button, Link } from "@salt-ds/core";
      import { SendIcon } from "@salt-ds/icons";

      export function Demo() {
        return (
          <>
            <Button aria-label="Send message">
              <SendIcon aria-hidden />
            </Button>
            <Button appearance="solid">
              <SendIcon aria-hidden /> Send
            </Button>
            <Link href="/next">Go</Link>
          </>
        );
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });

    expect(result.issues).toHaveLength(0);
    expect(result.summary).toEqual({
      errors: 0,
      warnings: 0,
      infos: 0,
    });
  });

  it("only flags hard-coded styles when used on Salt components", () => {
    const code = `
      export function Demo() {
        return <div style={{ height: "40px", color: "#ff0000" }} />;
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });
    const issueIds = result.issues.map((issue) => issue.id);

    expect(issueIds).not.toContain("tokens.hardcoded-size");
    expect(issueIds).not.toContain("tokens.hardcoded-color");
  });

  it("applies package_version filtering to deprecation rules", () => {
    const code = `
      import { Button } from "@salt-ds/core";
      export function Demo() {
        return <Button variant="cta">Run</Button>;
      }
    `;

    const beforeDeprecation = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
      package_version: "1.5.0",
    });
    const afterDeprecation = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
      package_version: "2.0.0",
    });

    expect(
      beforeDeprecation.issues.some((issue) =>
        issue.id.startsWith("deprecated.prop.salt-ds-core.variant"),
      ),
    ).toBe(false);
    expect(
      afterDeprecation.issues.some((issue) =>
        issue.id.startsWith("deprecated.prop.salt-ds-core.variant"),
      ),
    ).toBe(true);
  });

  it("keeps summary counts independent from max_issues truncation", () => {
    const code = `
      import { Button, UNSTABLE_SaltProviderNext } from "@salt-ds/core";

      export function Demo() {
        return (
          <>
            <Button href="/next" variant="cta"><SearchIcon /></Button>
            <UNSTABLE_SaltProviderNext />
            <div style={{ height: "40px", color: "#ff0000" }} />
          </>
        );
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
      max_issues: 1,
    });

    expect(result.issues).toHaveLength(1);
    expect(
      result.summary.errors + result.summary.warnings + result.summary.infos,
    ).toBeGreaterThan(1);
  });

  it("flags namespace-imported Salt Button usage", () => {
    const code = `
      import * as Salt from "@salt-ds/core";

      export function Demo() {
        return <Salt.Button href="/next"><SearchIcon /></Salt.Button>;
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });
    const issueIds = result.issues.map((issue) => issue.id);

    expect(issueIds).toContain("component-choice.navigation");
    expect(issueIds).toContain("a11y.button-accessible-name");
    expect(
      result.missing_data.includes(
        "No @salt-ds imports were detected; component-choice and deprecation checks are limited.",
      ),
    ).toBe(false);
  });

  it("flags namespace-imported deprecated and lab components", () => {
    const code = `
      import * as Salt from "@salt-ds/core";
      import * as SaltLab from "@salt-ds/lab";

      export function Demo() {
        return (
          <>
            <Salt.UNSTABLE_SaltProviderNext />
            <SaltLab.DatePicker />
          </>
        );
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });
    const issueIds = result.issues.map((issue) => issue.id);

    expect(issueIds).toContain(
      "component-status.unstable-saltprovidernext.deprecated",
    );
    expect(issueIds).toContain(
      "deprecated.import.salt-ds-core.unstable-saltprovidernext",
    );
    expect(issueIds).toContain("component-status.datepicker.lab");
  });

  it("flags non-JSX namespace member usage for deprecated and lab components", () => {
    const code = `
      import * as Salt from "@salt-ds/core";
      import * as SaltLab from "@salt-ds/lab";

      const LegacyProvider = Salt.UNSTABLE_SaltProviderNext;
      const ExperimentalPicker = SaltLab.DatePicker;
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });
    const issueIds = result.issues.map((issue) => issue.id);

    expect(issueIds).toContain(
      "component-status.unstable-saltprovidernext.deprecated",
    );
    expect(issueIds).toContain(
      "deprecated.import.salt-ds-core.unstable-saltprovidernext",
    );
    expect(issueIds).toContain("component-status.datepicker.lab");
  });
});

describe("suggestMigration", () => {
  it("suggests prop and component migrations for deprecated Salt APIs", () => {
    const code = `
      import { Button, UNSTABLE_SaltProviderNext } from "@salt-ds/core";

      export function Demo() {
        return (
          <>
            <Button variant="cta">Go</Button>
            <UNSTABLE_SaltProviderNext />
          </>
        );
      }
    `;

    const result = suggestMigration(REGISTRY, {
      code,
      from_version: "1.0.0",
      to_version: "2.0.0",
    });

    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "prop",
          component: "Button",
          from: 'variant="cta"',
          to: 'appearance="solid" sentiment="accented"',
          source_urls: ["/salt/changelog"],
        }),
        expect.objectContaining({
          kind: "component",
          component: "UNSTABLE_SaltProviderNext",
          from: "UNSTABLE_SaltProviderNext",
          to: "<SaltProvider>",
          source_urls: ["/salt/changelog"],
        }),
      ]),
    );
    expect(result.source_urls).toEqual(["/salt/changelog"]);
  });

  it("suggests namespace-imported component migrations", () => {
    const code = `
      import * as Salt from "@salt-ds/core";

      export function Demo() {
        return <Salt.UNSTABLE_SaltProviderNext />;
      }
    `;

    const result = suggestMigration(REGISTRY, {
      code,
      to_version: "2.0.0",
    });

    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "component",
          from: "Salt.UNSTABLE_SaltProviderNext",
          to: "<SaltProvider>",
          source_urls: ["/salt/changelog"],
        }),
      ]),
    );
    expect(result.source_urls).toEqual(["/salt/changelog"]);
  });

  it("suggests non-JSX namespace member migrations", () => {
    const code = `
      import * as Salt from "@salt-ds/core";

      const Provider = Salt.UNSTABLE_SaltProviderNext;
    `;

    const result = suggestMigration(REGISTRY, {
      code,
      to_version: "2.0.0",
    });

    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "component",
          from: "Salt.UNSTABLE_SaltProviderNext",
          to: "<SaltProvider>",
          source_urls: ["/salt/changelog"],
        }),
      ]),
    );
    expect(result.source_urls).toEqual(["/salt/changelog"]);
  });
});

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
            <Button style={{ height: "40px", color: "#ff0000" }}>
              Styled
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
          problem: "Use Link for navigation rather than Button.",
          recommended_fix:
            "Replace Button with Link and keep an accessible link label.",
        }),
        expect.objectContaining({
          problem:
            "Hard-coded sizing values were detected. Prefer semantic Salt tokens for control size and spacing.",
          token_recommendations: expect.arrayContaining(["--salt-size-base"]),
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
      }),
    });
  });
});

describe("analyzeSaltCode", () => {
  it("combines validation, fixes, and migrations into one workflow result", () => {
    const result = analyzeSaltCode(REGISTRY, {
      code: `
        import { Button } from "@salt-ds/core";

        export function Demo() {
          return <Button href="/next">Go</Button>;
        }
      `,
      framework: "react",
      package_version: "2.0.0",
    });

    expect(result.decision.status).toBe("needs_attention");
    expect(result.summary.errors).toBeGreaterThan(0);
    expect(result.fixes?.[0]).toBeTruthy();
    expect(result.issues?.[0]).toMatchObject({
      id: "component-choice.navigation",
    });
  });
});
