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
  guides: [
    {
      id: "guide.choosing-the-right-primitive",
      name: "Choosing the right primitive",
      aliases: ["button vs link", "primitive choice", "choose component"],
      kind: "getting-started",
      summary:
        "Choose Salt components, layouts, and patterns by user intent first, then prefer the most constrained Salt option before creating custom UI.",
      packages: ["@salt-ds/core"],
      steps: [
        {
          title: "Start with user intent",
          statements: [
            "Use Button for actions in the current view.",
            "Use Link for navigation to another route or destination.",
          ],
          snippets: [],
        },
      ],
      related_docs: {
        overview: "/salt/getting-started/choosing-the-right-primitive",
        related_components: ["Button", "Link"],
        related_packages: ["@salt-ds/core"],
      },
      last_verified_at: TIMESTAMP,
    },
    {
      id: "guide.composition-pitfalls",
      name: "Composition pitfalls",
      aliases: ["composition", "pass-through wrapper", "nested interactive"],
      kind: "getting-started",
      summary:
        "Review the most common Salt composition mistakes, including nested interactive primitives, pass-through wrappers, and rebuilding standard primitives.",
      packages: ["@salt-ds/core"],
      steps: [
        {
          title: "Pitfalls to avoid",
          statements: [
            "Do not nest interactive Salt primitives.",
            "Treat pass-through wrappers as suspicious.",
          ],
          snippets: [],
        },
      ],
      related_docs: {
        overview: "/salt/getting-started/composition-pitfalls",
        related_components: ["Button", "Link"],
        related_packages: ["@salt-ds/core"],
      },
      last_verified_at: TIMESTAMP,
    },
    {
      id: "guide.custom-wrappers",
      name: "Custom wrappers",
      aliases: ["wrapper review", "custom wrappers", "prop forwarding"],
      kind: "getting-started",
      summary:
        "Learn when a wrapper over a Salt primitive adds value and when it is only hiding the underlying component behind prop forwarding.",
      packages: ["@salt-ds/core"],
      steps: [
        {
          title: "When wrappers hurt",
          statements: [
            "Avoid wrappers that only forward props to a single Salt primitive.",
          ],
          snippets: [],
        },
      ],
      related_docs: {
        overview: "/salt/getting-started/custom-wrappers",
        related_components: ["Button", "Link"],
        related_packages: ["@salt-ds/core"],
      },
      last_verified_at: TIMESTAMP,
    },
  ],
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

  it("flags direct palette token usage, non-fixed border thickness, and container level mismatches", () => {
    const code = `
      import { Button } from "@salt-ds/core";

      export function Demo() {
        return (
          <Button
            style={{
              color: "var(--salt-palette-accent-border)",
              borderWidth: "var(--salt-size-base)",
              backgroundColor: "var(--salt-container-primary-background)",
              borderColor: "var(--salt-container-secondary-borderColor)",
            }}
          >
            Save
          </Button>
        );
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });
    const issueIds = result.issues.map((issue) => issue.id);
    const paletteIssue = result.issues.find(
      (issue) => issue.id === "tokens.palette-direct-use",
    );

    expect(issueIds).toContain("tokens.palette-direct-use");
    expect(issueIds).toContain("tokens.border-thickness-not-fixed");
    expect(issueIds).toContain("tokens.container-level-mismatch");
    expect(paletteIssue).toMatchObject({
      category: "tokens",
      rule: "no-direct-palette-token-use",
      canonical_source: "/salt/themes/design-tokens/token-usage-rules",
    });
  });

  it("falls back to stylesheet scanning for token-policy checks in css input", () => {
    const code = `
      .appSeparator {
        border-left: 1px solid var(--salt-container-primary-borderColor);
      }

      .panel {
        background-color: var(--salt-container-primary-background);
        border-color: var(--salt-container-secondary-borderColor);
      }

      .accent {
        color: var(--salt-palette-accent-border);
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });
    const issueIds = result.issues.map((issue) => issue.id);

    expect(issueIds).toContain("tokens.palette-direct-use");
    expect(issueIds).toContain("tokens.border-thickness-not-fixed");
    expect(issueIds).toContain("tokens.container-level-mismatch");
    expect(issueIds).toContain("tokens.separator-color-not-separable");
    expect(result.missing_data).toContain(
      "Code could not be parsed as JSX/TSX; validation fell back to a conservative stylesheet scan.",
    );
  });

  it("flags Link used as an action without a navigation target", () => {
    const code = `
      import { Link } from "@salt-ds/core";

      export function Demo() {
        return <Link onClick={() => console.log("save")}>Save</Link>;
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "primitive-choice.link-action",
          category: "primitive-choice",
          rule: "link-without-navigation-target-should-prefer-button",
        }),
      ]),
    );
  });

  it("flags native interactive elements that recreate Salt primitives in Salt code", () => {
    const code = `
      import { Button, Link } from "@salt-ds/core";

      export function Demo() {
        return (
          <>
            <button onClick={() => console.log("save")}>Save</button>
            <a href="/next">Go</a>
          </>
        );
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "primitive-choice.native-button",
          category: "primitive-choice",
          rule: "native-button-should-prefer-salt-button",
        }),
        expect.objectContaining({
          id: "primitive-choice.native-link",
          category: "primitive-choice",
          rule: "native-anchor-should-prefer-salt-link",
        }),
      ]),
    );
  });

  it("flags custom role-based interactive elements that recreate Salt primitives in Salt code", () => {
    const code = `
      import { Button, Link } from "@salt-ds/core";

      export function Demo() {
        return (
          <>
            <div role="button" onClick={() => console.log("save")}>Save</div>
            <div role="link" onClick={() => console.log("go")}>Go</div>
          </>
        );
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "primitive-choice.custom-button-role",
          category: "primitive-choice",
          rule: "custom-button-role-should-prefer-salt-button",
        }),
        expect.objectContaining({
          id: "primitive-choice.custom-link-role",
          category: "primitive-choice",
          rule: "custom-link-role-should-prefer-salt-link",
        }),
      ]),
    );
  });

  it("flags nested Button and Link composition", () => {
    const code = `
      import { Button, Link } from "@salt-ds/core";

      export function Demo() {
        return (
          <Button>
            <Link href="/next">Go</Link>
          </Button>
        );
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "composition.nested-interactive-primitives",
          category: "composition",
          rule: "avoid-nesting-interactive-salt-primitives",
          severity: "error",
        }),
      ]),
    );
  });

  it("flags pass-through wrappers over Salt primitives", () => {
    const code = `
      import { Button } from "@salt-ds/core";

      export const PrimaryButton = (props) => <Button {...props} />;
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "composition.pass-through-wrapper",
          category: "composition",
          rule: "avoid-pass-through-wrapper-over-salt-primitive",
        }),
      ]),
    );
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
          name: "--salt-size-fixed-100",
          category: "size",
          type: "dimension",
          value: "1px",
          semantic_intent: "fixed border thickness",
          themes: ["salt"],
          densities: ["medium"],
          applies_to: ["Button"],
          guidance: ["Use fixed size tokens for border and separator thickness."],
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
          guidance: ["Palette tokens should be mapped through characteristic tokens."],
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
          guidance: ["Use primary container background tokens for primary surfaces."],
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
          guidance: ["Match primary container borders with primary container backgrounds."],
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
          guidance: ["Use secondary container border tokens with secondary surfaces."],
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
          problem: "Use Link for navigation rather than Button.",
          category: "primitive-choice",
          rule: "button-must-not-handle-navigation",
          recommended_fix:
            "Replace Button with Link and keep an accessible link label.",
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
          code: '<Button onClick={save}>Save</Button>',
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
                code: '<Button onClick={save}>Save</Button>',
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
            "Link appears to be used as an action without href or to. Prefer Button when the primary intent is action execution.",
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
          code: '<Button onClick={save}>Save</Button>',
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
                code: '<Button onClick={save}>Save</Button>',
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
            "Native button elements were detected alongside Salt usage. Prefer Salt Button unless native behavior is explicitly required.",
          category: "primitive-choice",
          rule: "native-button-should-prefer-salt-button",
          recommended_fix:
            "Replace native button elements with Salt Button unless a native-only behavior is required.",
          next_steps: expect.arrayContaining([
            "Replace the button-like element with Salt Button so interaction, semantics, and styling come from the design system.",
          ]),
        }),
        expect.objectContaining({
          problem:
            "A non-native element is being used as a link. Prefer Salt Link for navigation interactions instead of recreating link semantics manually.",
          category: "primitive-choice",
          rule: "custom-link-role-should-prefer-salt-link",
          recommended_fix:
            "Replace the custom link-like element with Salt Link unless there is a strong reason to manage link semantics manually.",
          next_steps: expect.arrayContaining([
            "Replace the link-like element with Salt Link so navigation semantics and styling come from the design system.",
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
      category: "primitive-choice",
      rule: "button-must-not-handle-navigation",
      canonical_source: "/salt/getting-started/choosing-the-right-primitive",
      fix_hints: {
        related_components: ["Button", "Link"],
        guide_lookups: ["choosing-the-right-primitive"],
      },
    });
  });
});
