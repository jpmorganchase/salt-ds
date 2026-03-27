import { suggestMigration, validateSaltUsage } from "@salt-ds/semantic-core";
import { describe, expect, it } from "vitest";
import { CODE_ANALYSIS_REGISTRY as REGISTRY } from "./fixtures/codeAnalysisRegistry.js";

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
      canonical_source: "/salt/themes/design-tokens/index",
    });
  });

  it("flags unrecognized canonical-looking Salt token names", () => {
    const code = `
      import { Button } from "@salt-ds/core";

      export function Demo() {
        return (
          <Button style={{ borderColor: "var(--salt-container-borderColor)" }}>
            Save
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
          id: "tokens.unknown-salt-token",
          category: "tokens",
          rule: "only-use-known-salt-token-names",
          canonical_source: "/salt/themes/design-tokens/index",
        }),
      ]),
    );
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

  it("flags deprecated token usage in inline Salt styling", () => {
    const code = `
      import { Button } from "@salt-ds/core";

      export function Demo() {
        return (
          <Button
            style={{
              borderWidth: "var(--salt-size-border)",
              borderStyle: "var(--salt-borderStyle-solid)",
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
    const deprecatedIssue = result.issues.find(
      (issue) => issue.id === "tokens.deprecated-use",
    );

    expect(deprecatedIssue).toMatchObject({
      category: "deprecated",
      rule: "no-deprecated-token-use",
      canonical_source: "/salt/themes/design-tokens/index",
    });
    expect(deprecatedIssue?.evidence.join(" ")).toContain("--salt-size-border");
  });

  it("flags deprecated token usage during stylesheet fallback scanning", () => {
    const code = `
      .divider {
        border-width: var(--salt-size-border);
        border-style: var(--salt-borderStyle-solid);
      }
    `;

    const result = validateSaltUsage(REGISTRY, {
      code,
      framework: "react",
    });
    const issueIds = result.issues.map((issue) => issue.id);

    expect(issueIds).toContain("tokens.deprecated-use");
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

  it("flags raw HTML table markup that recreates Salt table guidance in Salt code", () => {
    const code = `
      import { StackLayout, Text } from "@salt-ds/core";

      export function TransactionsTable() {
        return (
          <StackLayout gap={1}>
            <Text styleAs="h4">Transactions</Text>
            <table>
              <thead>
                <tr>
                  <th>Trade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Buy</td>
                  <td>Settled</td>
                </tr>
              </tbody>
            </table>
          </StackLayout>
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
          id: "primitive-choice.native-table",
          category: "primitive-choice",
          rule: "native-table-should-prefer-salt-table-or-data-grid",
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
