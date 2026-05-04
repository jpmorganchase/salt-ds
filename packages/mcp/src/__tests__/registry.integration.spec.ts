import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  getChanges,
  getCountrySymbol,
  getCountrySymbols,
  getExamples,
  getGuide,
  getIcon,
  getPage,
  getPattern,
  getSaltEntity,
  recommendComponent,
  searchSaltDocs,
  validateSaltUsage,
} from "@salt-ds/semantic-core";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildRegistry } from "../build/buildRegistry.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const BUILT_AT = "2026-03-10T00:00:00Z";

let registry: SaltRegistry;
let registryDir: string;

beforeAll(async () => {
  registryDir = await fs.mkdtemp(path.join(os.tmpdir(), "salt-mcp-registry-"));
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: registryDir,
    timestamp: BUILT_AT,
  });
  registry = await loadRegistry({ registryDir });
}, 120000);

afterAll(async () => {
  if (registryDir) {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
});

describe("registry integration", () => {
  it("maps Button variant deprecation to Button guidance", () => {
    const result = validateSaltUsage(registry, {
      code: 'import { Button } from "@salt-ds/core"; const Demo = () => <Button variant="cta">Go</Button>;',
      framework: "react",
      package_version: "2.0.0",
    });
    const variantIssue = result.issues.find(
      (issue) => issue.id === "deprecated.prop.salt-ds-core.variant",
    );

    expect(variantIssue).toBeDefined();
    expect(variantIssue?.message.toLowerCase()).toContain("appearance");
    expect(
      variantIssue?.source_urls.some((url) =>
        url.includes("packages/core/src/button/Button.tsx"),
      ),
    ).toBe(true);
  });

  it("flags Button href as navigation misuse", () => {
    const result = validateSaltUsage(registry, {
      code: 'import { Button } from "@salt-ds/core"; const Demo = () => <Button href="/next">Go</Button>;',
      framework: "react",
    });

    expect(
      result.issues.some((issue) => issue.id === "component-choice.navigation"),
    ).toBe(true);
  });

  it("resolves package metadata for non-core components", () => {
    const rangeDatePicker = registry.components.find(
      (component) => component.name === "Range date picker",
    );
    expect(rangeDatePicker?.package.name).toBe("@salt-ds/lab");

    const rangeSlider = registry.components.find(
      (component) => component.name === "Range slider",
    );
    expect(rangeSlider?.package.name).toBe("@salt-ds/core");
  });

  it("uses the build timestamp for verification fields", () => {
    expect(registry.build_info).toBeTruthy();
    expect(registry.build_info?.source_artifacts.docs_root.path).toBe(
      "site/docs",
    );
    expect(registry.build_info?.source_artifacts.search_data.path).toBe(
      "site/public/search-data.json",
    );
    expect(registry.components[0]?.last_verified_at).toBe(BUILT_AT);
    expect(registry.icons[0]?.last_verified_at).toBe(BUILT_AT);
    expect(registry.country_symbols[0]?.last_verified_at).toBe(BUILT_AT);
    expect(registry.patterns[0]?.last_verified_at).toBe(BUILT_AT);
    expect(registry.guides[0]?.last_verified_at).toBe(BUILT_AT);
    expect(registry.tokens[0]?.last_verified_at).toBe(BUILT_AT);
    expect(registry.changes[0]?.last_verified_at).toBe(BUILT_AT);
    expect(registry.pages[0]?.last_verified_at).toBe(BUILT_AT);
  });

  it("attaches token usage policy metadata for palette, characteristic, and foundation tokens", () => {
    const paletteToken = registry.tokens.find(
      (token) => token.name === "--salt-palette-accent-border",
    );
    const separableToken = registry.tokens.find(
      (token) => token.name === "--salt-separable-secondary-borderColor",
    );
    const fixedSizeToken = registry.tokens.find(
      (token) => token.name === "--salt-size-fixed-100",
    );

    expect(paletteToken?.policy).toMatchObject({
      usage_tier: "palette",
      direct_component_use: "never",
    });
    expect(separableToken?.policy).toMatchObject({
      usage_tier: "characteristic",
      direct_component_use: "always",
    });
    expect(fixedSizeToken?.policy).toMatchObject({
      usage_tier: "foundation",
      direct_component_use: "conditional",
    });
    expect(fixedSizeToken?.policy?.docs).toContain("/salt/foundations/size");
    expect(fixedSizeToken?.policy?.evidence_refs?.length).toBe(
      fixedSizeToken?.policy?.docs.length,
    );
  });

  it("derives component and pattern guidance from category maps and usage docs", () => {
    const button = registry.components.find(
      (component) => component.name === "Button",
    );
    const link = registry.components.find(
      (component) => component.name === "Link",
    );
    const verticalNavigationComponent = registry.components.find(
      (component) => component.name === "Vertical navigation",
    );
    const navigationItem = registry.components.find(
      (component) => component.name === "Navigation item",
    );
    const dropdown = registry.components.find(
      (component) => component.name === "Dropdown",
    );
    const comboBox = registry.components.find(
      (component) => component.name === "Combo box",
    );
    const dialog = registry.components.find(
      (component) => component.name === "Dialog",
    );
    const menu = registry.components.find(
      (component) => component.name === "Menu",
    );
    const tabs = registry.components.find(
      (component) => component.name === "Tabs",
    );
    const banner = registry.components.find(
      (component) => component.name === "Banner",
    );
    const toast = registry.components.find(
      (component) => component.name === "Toast",
    );
    const verticalNavigationPattern = registry.patterns.find(
      (pattern) => pattern.name === "Vertical navigation",
    );
    const splitButtonPattern = registry.patterns.find(
      (pattern) => pattern.name === "Split button",
    );

    expect(button?.category).toEqual(["actions"]);
    expect(button?.semantics).toMatchObject({
      category: ["actions"],
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      preferred_for: expect.arrayContaining([
        expect.stringContaining("allow the user to execute an action"),
      ]),
      not_for: expect.arrayContaining([
        expect.stringContaining(
          "primary action is to take the user to another page",
        ),
      ]),
    });

    expect(link?.category).toEqual(["navigation"]);
    expect(link?.semantics).toMatchObject({
      category: ["navigation"],
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      preferred_for: expect.arrayContaining([
        "To provide navigation to a page on the same or different site.",
      ]),
      not_for: expect.arrayContaining([
        "To trigger an action, such as submitting a form or opening a dialog. Instead, use Button.",
      ]),
    });

    expect(verticalNavigationComponent?.category).toEqual(["navigation"]);
    expect(verticalNavigationComponent?.semantics).toMatchObject({
      category: ["navigation"],
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      preferred_for: expect.arrayContaining([
        "When you have multiple levels of navigation in your application or website.",
      ]),
    });

    expect(navigationItem?.category).toEqual(["navigation"]);
    expect(navigationItem?.semantics).toMatchObject({
      category: ["navigation"],
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
    });

    expect(dropdown?.semantics).toMatchObject({
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      preferred_for: expect.arrayContaining([
        "When a user needs the ability to choose one value from a set of five to 10 options.",
      ]),
    });

    expect(comboBox?.semantics).toMatchObject({
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      preferred_for: expect.arrayContaining([
        "If a workflow benefits from having a filter to quickly narrow down the available options.",
      ]),
      not_for: expect.arrayContaining([
        "To choose one value from a set of five to ten options that does not require filtering. Instead, use Dropdown.",
      ]),
    });

    expect(dialog?.semantics).toMatchObject({
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      preferred_for: expect.arrayContaining([
        "To notify the user of critical information related to their current workflow that requires immediate action.",
      ]),
      not_for: expect.arrayContaining([
        "When you don't need to interrupt the user's flow. If the information is part of an event that’s occurred in a peripheral application or workflow, use Toast instead. If the information is related to the current workflow, use Banner instead.",
      ]),
    });

    expect(menu?.semantics).toMatchObject({
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      preferred_for: expect.arrayContaining([
        "When you need to display a list of actions or options.",
      ]),
      not_for: expect.arrayContaining([
        "Inside a form. Instead, use ComboBox or Dropdown.",
      ]),
    });

    expect(tabs?.semantics).toMatchObject({
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      preferred_for: expect.arrayContaining([
        "Use tabs to organize logically related but mutually exclusive content on a single page.",
      ]),
      not_for: expect.arrayContaining([
        "Don’t use tabs for primary navigation, taking the user off the current page. Instead, use Navigation Item.",
      ]),
    });

    expect(banner?.semantics).toMatchObject({
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      preferred_for: expect.arrayContaining([
        "To show a notification that applies to the user’s current task or workflow.",
      ]),
      not_for: expect.arrayContaining([
        "To notify users of an event that has occurred in a peripheral application or workflow. Instead, use Toast.",
      ]),
    });

    expect(toast?.semantics).toMatchObject({
      derived_from: expect.arrayContaining([
        "component-category-map",
        "usage-docs",
      ]),
      not_for: expect.arrayContaining([
        "When the notification requires immediate action and relates to the user’s current task. Instead, use Dialog to interrupt the user's workflow.",
      ]),
    });

    expect(verticalNavigationPattern?.category).toEqual([
      "navigation-and-wayfinding",
      "layout-and-shells",
    ]);
    expect(verticalNavigationPattern?.semantics).toMatchObject({
      category: ["navigation-and-wayfinding", "layout-and-shells"],
      derived_from: expect.arrayContaining([
        "pattern-category-map",
        "pattern-docs",
        "usage-callouts",
      ]),
      preferred_for: expect.arrayContaining([
        "Use vertical navigation when the page needs a persistent navigation pane that organizes multiple sections of an application into a vertical hierarchy.",
      ]),
    });

    expect(splitButtonPattern?.category).toEqual(["actions-and-commands"]);
    expect(splitButtonPattern?.semantics).toMatchObject({
      category: ["actions-and-commands"],
      derived_from: expect.arrayContaining([
        "pattern-category-map",
        "pattern-docs",
        "usage-callouts",
      ]),
    });
  });

  it("prefers Chart for chart-focused component recommendation prompts", () => {
    const result = recommendComponent(registry, {
      task: "chart of data visualization component for dashboard analytical body",
      top_k: 5,
      view: "full",
    });

    expect(result.recommendations?.[0]).toMatchObject({
      name: "Chart",
      component: {
        package: "@salt-ds/highcharts-theme",
      },
    });
  });

  it("matches Chart through its Highcharts alias during component recommendation", () => {
    const result = recommendComponent(registry, {
      task: "highcharts data visualization component",
      top_k: 5,
      view: "full",
    });

    expect(result.recommendations?.[0]).toMatchObject({
      name: "Chart",
      component: {
        package: "@salt-ds/highcharts-theme",
      },
    });
  });

  it("prefers Dialog over decorative icon matches for confirmation dialog prompts", () => {
    const result = recommendComponent(registry, {
      task: "confirmation dialog with warning icon",
      top_k: 5,
      view: "full",
    });

    expect(result.recommendations?.[0]).toMatchObject({
      name: "Dialog",
      component: {
        package: "@salt-ds/core",
      },
    });
  });

  it("prefers Tabs over Avatar when the prompt names both a surface owner and decoration", () => {
    const result = recommendComponent(registry, {
      task: "user profile with tabs and avatar",
      top_k: 5,
      view: "full",
    });

    expect(result.recommendations?.[0]).toMatchObject({
      name: "Tabs",
      component: {
        package: "@salt-ds/lab",
      },
    });
  });

  it.each([
    [
      "Table component with custom cell rendering and column definitions",
      "Data grid",
      "@salt-ds/ag-grid-theme",
    ],
    ["table in analytical dashboard main body", "Table", "@salt-ds/core"],
    [
      "use the table in the analytical dashboard body",
      "Table",
      "@salt-ds/core",
    ],
    [
      "data grid with custom cell rendering and column definitions",
      "Data grid",
      "@salt-ds/ag-grid-theme",
    ],
  ])("returns %s for tabular component recommendation prompts", (task, expectedName, expectedPackage) => {
    const result = recommendComponent(registry, {
      task,
      top_k: 5,
      view: "full",
    });

    expect(result.recommendations?.[0]).toMatchObject({
      name: expectedName,
      component: {
        package: expectedPackage,
      },
    });
  });

  it("extracts explicit usage boundaries for Table, Data grid, and Chart", () => {
    const table = registry.components.find(
      (component) => component.name === "Table",
    );
    const dataGrid = registry.components.find(
      (component) => component.name === "Data grid",
    );
    const chart = registry.components.find(
      (component) => component.name === "Chart",
    );

    expect(table?.summary).toContain("simple, structured tabular data");
    expect(table?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("simple data in a structured, tabular format"),
      ]),
    );
    expect(table?.when_not_to_use).toEqual(
      expect.arrayContaining([expect.stringContaining("Data grid")]),
    );

    expect(dataGrid?.summary).toContain("complex or high-volume data");
    expect(dataGrid?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("complex or high-volume data"),
      ]),
    );
    expect(dataGrid?.when_not_to_use).toEqual(
      expect.arrayContaining([expect.stringContaining("Table")]),
    );

    expect(chart?.summary).toContain("Highcharts-backed visualization surface");
    expect(chart?.when_to_use).toEqual(
      expect.arrayContaining([expect.stringContaining("visualize trends")]),
    );
    expect(chart?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("inspect exact values"),
        expect.stringContaining("edit, filter, or select rows"),
      ]),
    );
  });

  it("exposes Data grid CSS imports directly from usage docs", () => {
    const dataGrid = registry.components.find(
      (component) => component.name === "Data grid",
    );

    expect(dataGrid?.implementation_requirements).toEqual({
      required_imports: expect.arrayContaining([
        {
          kind: "css",
          specifier: "ag-grid-community/styles/ag-grid.css",
          statement: 'import "ag-grid-community/styles/ag-grid.css";',
          source_url: "/salt/components/ag-grid-theme/usage",
        },
        {
          kind: "css",
          specifier: "@salt-ds/ag-grid-theme/salt-ag-theme.css",
          statement: 'import "@salt-ds/ag-grid-theme/salt-ag-theme.css";',
          source_url: "/salt/components/ag-grid-theme/usage",
        },
      ]),
    });
    expect(
      dataGrid?.implementation_requirements?.required_imports.map(
        (entry) => entry.specifier,
      ),
    ).not.toContain("@salt-ds/ag-grid-theme/css/salt-ag-theme.css");

    const lookup = getSaltEntity(registry, {
      name: "Data grid",
      entity_type: "component",
      view: "compact",
    });

    expect(lookup.entity).toMatchObject({
      implementation_requirements: {
        required_imports: expect.arrayContaining([
          expect.objectContaining({
            specifier: "@salt-ds/ag-grid-theme/salt-ag-theme.css",
            source_url: "/salt/components/ag-grid-theme/usage",
          }),
        ]),
      },
    });
  });

  it("extracts explicit usage guidance for Search, Button bar, and Forms", () => {
    const searchPattern = registry.patterns.find(
      (pattern) => pattern.name === "Search",
    );
    const buttonBarPattern = registry.patterns.find(
      (pattern) => pattern.name === "Button bar",
    );
    const formsPattern = registry.patterns.find(
      (pattern) => pattern.name === "Forms",
    );

    expect(searchPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Locate information in applications with large amounts of data",
        ),
        expect.stringContaining("Look through a catalog of items"),
        expect.stringContaining("Navigate to a page or resource"),
      ]),
    );
    expect(searchPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("link, button, or navigation item"),
        expect.stringContaining("filtering a visible data set in place"),
        expect.stringContaining("small, fixed set of options"),
      ]),
    );

    expect(buttonBarPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Navigating to previous or next steps"),
        expect.stringContaining("Submitting a form"),
        expect.stringContaining("Acknowledging or canceling changes"),
      ]),
    );
    expect(buttonBarPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("toolbar or another action surface"),
        expect.stringContaining("single primary action"),
        expect.stringContaining(
          "navigation rather than task-completion actions",
        ),
      ]),
    );

    expect(formsPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "enter, edit, or confirm structured information",
        ),
        expect.stringContaining("labels, helper text, and validation"),
        expect.stringContaining("clear action area at the end of the form"),
      ]),
    );
    expect(formsPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("When the task is only a single action"),
        expect.stringContaining("dashboard, table, or Data grid"),
        expect.stringContaining("short, bounded decision"),
        expect.stringContaining("Dialog or smaller overlay pattern"),
      ]),
    );
  });

  it("extracts explicit guidance for Preferences dialog and Announcement dialog", () => {
    const preferencesDialogPattern = registry.patterns.find(
      (pattern) => pattern.name === "Preferences dialog",
    );
    const announcementDialogPattern = registry.patterns.find(
      (pattern) => pattern.name === "Announcement dialog",
    );

    expect(preferencesDialogPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("centralize application or window settings"),
        expect.stringContaining("navigate between related settings panels"),
        expect.stringContaining("relevant settings panel"),
        expect.stringContaining("apply/cancel action area"),
      ]),
    );
    expect(preferencesDialogPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("single, short confirmation or alert"),
        expect.stringContaining("page-based settings surface"),
        expect.stringContaining("simpler form or overlay pattern"),
      ]),
    );

    expect(announcementDialogPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "new product features or the highlights of a recent release",
        ),
        expect.stringContaining("follow-up action"),
        expect.stringContaining("modal interruption"),
        expect.stringContaining("concise announcement or informational notice"),
      ]),
    );
    expect(announcementDialogPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Preferences dialog"),
        expect.stringContaining("Toast or Banner"),
        expect.stringContaining("page section or card"),
      ]),
    );
  });

  it("extracts explicit guidance for Content status", () => {
    const contentStatusPattern = registry.patterns.find(
      (pattern) => pattern.name === "Content status",
    );

    expect(contentStatusPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("content is loading"),
        expect.stringContaining("empty-state message"),
        expect.stringContaining("information, warnings, or errors"),
        expect.stringContaining(
          "successfully submitted content or completed an action",
        ),
      ]),
    );
    expect(contentStatusPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("reach across the app"),
        expect.stringContaining("full workflow interruption"),
        expect.stringContaining("inline text or another component"),
      ]),
    );
  });

  it("extracts explicit guidance for List filtering", () => {
    const listFilteringPattern = registry.patterns.find(
      (pattern) => pattern.name === "List filtering",
    );

    expect(listFilteringPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Use filtering when you have a lengthy list that users have to scroll to view all available options",
        ),
        expect.stringContaining(
          "pattern typically comprises input and list based components",
        ),
      ]),
    );
    expect(listFilteringPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("search across broader content or pages"),
        expect.stringContaining("dashboard or table shell"),
        expect.stringContaining("Dropdown or another selection control"),
      ]),
    );
  });

  it("extracts explicit guidance for List builder", () => {
    const listBuilderPattern = registry.patterns.find(
      (pattern) => pattern.name === "List builder",
    );

    expect(listBuilderPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Use this pattern when users need to customize a list from a selection of options",
        ),
        expect.stringContaining(
          "distinguish selected items from a larger list of available items",
        ),
        expect.stringContaining("two lists side-by-side"),
      ]),
    );
    expect(listBuilderPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("single selection"),
        expect.stringContaining("List filtering"),
        expect.stringContaining("simple re-orderable list"),
      ]),
    );
  });

  it("extracts explicit guidance for Wizard", () => {
    const wizardPattern = registry.patterns.find(
      (pattern) => pattern.name === "Wizard",
    );

    expect(wizardPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "guide users through a series of steps or tasks in a specific, linear order",
        ),
        expect.stringContaining(
          "Users must complete each step in order before moving on to the next",
        ),
      ]),
    );
    expect(wizardPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("single form or short dialog"),
        expect.stringContaining("Tabs or Vertical navigation"),
        expect.stringContaining("dashboard, table, or list-based pattern"),
      ]),
    );
  });

  it("extracts explicit guidance for Header block", () => {
    const headerBlockPattern = registry.patterns.find(
      (pattern) => pattern.name === "Header block",
    );

    expect(headerBlockPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Display a combination of headings, pre-headers and descriptions within container components such as Dialog, Drawer and Overlay",
        ),
        expect.stringContaining(
          "Maintain a visually consistent layout and presentation for headers",
        ),
        expect.stringContaining("Display headings with status icons"),
      ]),
    );
    expect(headerBlockPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("App header"),
        expect.stringContaining("Navigation or Vertical navigation"),
        expect.stringContaining("Heading or Text"),
      ]),
    );
  });

  it("extracts explicit guidance for Navigation", () => {
    const navigationPattern = registry.patterns.find(
      (pattern) => pattern.name === "Navigation",
    );

    expect(navigationPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Display navigation in websites or applications with two or more pages",
        ),
        expect.stringContaining(
          "content hierarchy and help users orient themselves",
        ),
        expect.stringContaining("Simplify your hierarchy"),
        expect.stringContaining("Label effectively"),
      ]),
    );
    expect(navigationPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Forms, Wizard, or Dialog"),
        expect.stringContaining("Tabs or segmented controls"),
        expect.stringContaining("Button bar or toolbar"),
      ]),
    );
  });

  it("preserves canonical scaffold metadata for the priority patterns", () => {
    const metricPattern = registry.patterns.find(
      (pattern) => pattern.name === "Metric",
    );
    const appHeaderPattern = registry.patterns.find(
      (pattern) => pattern.name === "App header",
    );
    const analyticalDashboardPattern = registry.patterns.find(
      (pattern) => pattern.name === "Analytical dashboard",
    );
    const verticalNavigationPattern = registry.patterns.find(
      (pattern) => pattern.name === "Vertical navigation",
    );

    expect(metricPattern?.starter_scaffold).toMatchObject({
      fidelity: "hybrid",
      semantics: {
        required_regions: [],
        optional_regions: ["metric-supporting-context"],
        build_around: expect.arrayContaining([
          "Metric title",
          "Metric value",
          "Metric supporting context",
        ]),
        preserve_constraints: expect.arrayContaining([
          expect.stringContaining("Never leave the user guessing"),
          expect.stringContaining("same orientation"),
        ]),
      },
      source_urls: expect.arrayContaining(["/salt/patterns/metric"]),
    });
    expect(metricPattern?.starter_scaffold?.template).toMatchObject({
      kind: "fallback-template",
      imports: expect.arrayContaining([
        expect.objectContaining({
          name: "StackLayout",
          package: "@salt-ds/core",
        }),
      ]),
      jsx_lines: expect.arrayContaining([
        expect.stringContaining("Portfolio value"),
      ]),
    });
    expect(metricPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("single key measurement"),
        expect.stringContaining("dashboard building block"),
      ]),
    );
    expect(metricPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("full dashboard shell"),
        expect.stringContaining("charts or tables"),
      ]),
    );
    expect(appHeaderPattern?.starter_scaffold).toMatchObject({
      fidelity: "hybrid",
      semantics: {
        required_regions: [],
        optional_regions: ["primary-navigation"],
        build_around: expect.arrayContaining([
          "Branding",
          "Navigation",
          "Utilities",
        ]),
        preserve_constraints: expect.arrayContaining([
          expect.stringContaining("top-left corner"),
          expect.stringContaining("app home page"),
        ]),
      },
      source_urls: expect.arrayContaining(["/salt/patterns/app-header"]),
    });
    expect(appHeaderPattern?.starter_scaffold?.template).toMatchObject({
      kind: "fallback-template",
      imports: expect.arrayContaining([
        expect.objectContaining({
          name: "NavigationItem",
          package: "@salt-ds/core",
        }),
      ]),
      jsx_lines: expect.arrayContaining([expect.stringContaining("<header>")]),
    });
    expect(appHeaderPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("top-level, globally persistent shell element"),
        expect.stringContaining("persistent branding area"),
        expect.stringContaining(
          "application-wide navigation or utility actions",
        ),
      ]),
    );
    expect(appHeaderPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("not globally persistent"),
        expect.stringContaining("multiple levels"),
        expect.stringContaining("brand lockup"),
      ]),
    );
    expect(analyticalDashboardPattern?.starter_scaffold).toMatchObject({
      fidelity: "hybrid",
      semantics: {
        required_regions: ["main-body"],
        optional_regions: expect.arrayContaining([
          "dashboard-header",
          "key-metrics",
          "fixed-panel",
        ]),
        build_around: expect.arrayContaining([
          "Dashboard header",
          "Key metrics",
          "Fixed controls or filters",
          "Main analytical body",
        ]),
      },
      source_urls: expect.arrayContaining([
        "/salt/patterns/analytical-dashboard",
      ]),
    });
    expect(analyticalDashboardPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("top-level dashboard shell"),
        expect.stringContaining(
          "charts, graphs, tables, and other visual elements",
        ),
        expect.stringContaining("Data-intensive environments"),
        expect.stringContaining("Performance tracking"),
      ]),
    );
    expect(analyticalDashboardPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("simple presentation surface"),
        expect.stringContaining("Metric"),
        expect.stringContaining("Table"),
        expect.stringContaining("Data grid"),
      ]),
    );
    expect(
      analyticalDashboardPattern?.starter_scaffold?.template,
    ).toMatchObject({
      kind: "fallback-template",
      imports: expect.arrayContaining([
        expect.objectContaining({
          name: "BorderLayout",
          package: "@salt-ds/core",
        }),
        expect.objectContaining({
          name: "Tabs",
          package: "@salt-ds/lab",
        }),
      ]),
      jsx_lines: expect.arrayContaining([
        expect.stringContaining("<BorderLayout>"),
        expect.stringContaining("Key metrics bar"),
      ]),
    });
    expect(verticalNavigationPattern?.starter_scaffold?.template).toMatchObject(
      {
        kind: "fallback-template",
        imports: expect.arrayContaining([
          expect.objectContaining({
            name: "BorderLayout",
            package: "@salt-ds/core",
          }),
          expect.objectContaining({
            name: "NavigationItem",
            package: "@salt-ds/core",
          }),
        ]),
        jsx_lines: expect.arrayContaining([
          expect.stringContaining("<BorderLayout>"),
          expect.stringContaining("Navigation pane"),
        ]),
      },
    );
    expect(verticalNavigationPattern?.starter_scaffold).toMatchObject({
      fidelity: "hybrid",
      semantics: {
        required_regions: ["navigation-pane"],
        optional_regions: ["nested-navigation"],
        build_around: expect.any(Array),
      },
      source_urls: expect.arrayContaining([
        "/salt/patterns/vertical-navigation",
      ]),
    });
    expect(verticalNavigationPattern?.when_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("persistent navigation pane"),
        expect.stringContaining("multiple top-level categories"),
        expect.stringContaining("information architecture is complex"),
      ]),
    );
    expect(verticalNavigationPattern?.when_not_to_use).toEqual(
      expect.arrayContaining([
        expect.stringContaining("small number of top-level destinations"),
        expect.stringContaining("secondary or page-local"),
        expect.stringContaining("modal or task-oriented"),
      ]),
    );
  });

  it("adds route-slug aliases to built pattern records", () => {
    const preferencesDialog = registry.patterns.find(
      (pattern) => pattern.name === "Preferences dialog",
    );

    expect(preferencesDialog?.aliases).toContain("preferences-dialog");
  });

  it("records build inference metadata for component docgen, tokens, and deprecations", () => {
    const button = registry.components.find(
      (component) => component.name === "Button",
    );
    const buttonVariantDeprecation = registry.deprecations.find(
      (deprecation) =>
        deprecation.package === "@salt-ds/core" &&
        deprecation.kind === "prop" &&
        deprecation.name === "variant",
    );

    expect(button?.inference?.docgen?.candidate_count).toBeGreaterThan(0);
    expect(button?.inference?.docgen?.selected_display_name).toBeTruthy();
    // tokens inference was removed when per-component tokens were dropped
    expect(button?.inference?.deprecations?.matched_count).toBeGreaterThan(0);
    expect(
      buttonVariantDeprecation?.inference?.matched_component_names,
    ).toContain("Button");
    expect(typeof buttonVariantDeprecation?.inference?.component_inferred).toBe(
      "boolean",
    );
  });

  it("builds searchable icon metadata from the icon synonym source", () => {
    const workflowIcon = registry.icons.find(
      (icon) => icon.name === "WorkflowIcon",
    );
    const sparkleRefreshIcon = registry.icons.find(
      (icon) => icon.name === "SparkleRefreshIcon",
    );

    expect(workflowIcon).toBeDefined();
    expect(workflowIcon?.category).toBe("organize");
    expect(workflowIcon?.synonyms).toEqual(
      expect.arrayContaining(["nodes", "process", "sequence"]),
    );
    expect(workflowIcon?.related_docs.foundation).toBe(
      "/salt/foundations/assets/index",
    );

    expect(sparkleRefreshIcon?.synonyms).toEqual(
      expect.arrayContaining(["ai", "llm", "artificial intelligence"]),
    );
    expect(
      registry.search_index.some(
        (entry) => entry.type === "icon" && entry.name === "WorkflowIcon",
      ),
    ).toBe(true);
  });

  it("builds searchable country symbol metadata from countryMetaMap", () => {
    const unitedStates = registry.country_symbols.find(
      (countrySymbol) => countrySymbol.code === "US",
    );
    const england = registry.country_symbols.find(
      (countrySymbol) => countrySymbol.code === "GB-ENG",
    );

    expect(unitedStates).toBeDefined();
    expect(unitedStates?.aliases).toEqual(
      expect.arrayContaining(["United States of America", "United States"]),
    );
    expect(unitedStates?.related_docs.foundation).toBe(
      "/salt/foundations/assets/country-symbols",
    );
    expect(unitedStates?.variants.sharp.export_name).toBe("US_Sharp");

    expect(england?.variants.circle.export_name).toBe("GB_ENG");
    expect(
      registry.search_index.some(
        (entry) =>
          entry.type === "country_symbol" &&
          entry.name === "United States of America (the)",
      ),
    ).toBe(true);
  });

  it("resolves country symbol lookups by code, fuzzy country name, and query search", () => {
    const codeResult = getCountrySymbol(registry, {
      name: "US",
    });
    const fuzzyResult = getCountrySymbol(registry, {
      name: "United States",
    });
    const listResult = getCountrySymbols(registry, {
      query: "england",
      max_results: 10,
    });

    expect(codeResult.country_symbol).toMatchObject({
      code: "US",
    });
    expect(fuzzyResult.country_symbol).toMatchObject({
      code: "US",
    });
    expect(
      listResult.country_symbols.some(
        (countrySymbol) => countrySymbol.code === "GB-ENG",
      ),
    ).toBe(true);
  });

  it("treats shared icon base names as ambiguous across outline and solid variants", () => {
    const result = getIcon(registry, {
      name: "workflow",
    });

    expect(result.icon).toBeNull();
    expect(result.ambiguity).toMatchObject({
      query: "workflow",
      matched_by: "name",
    });
    expect(result.ambiguity?.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "WorkflowIcon",
          variant: "outline",
        }),
        expect.objectContaining({
          name: "WorkflowSolidIcon",
          variant: "solid",
        }),
      ]),
    );
  });

  it("excludes non-consumer packages from consumer registry artifacts", () => {
    expect(registry.packages.some((pkg) => pkg.name === "@salt-ds/mcp")).toBe(
      false,
    );
    expect(
      registry.packages.some((pkg) => pkg.name === "@salt-ds/data-grid"),
    ).toBe(false);
    expect(
      registry.search_index.some(
        (entry) => entry.type === "package" && entry.name === "@salt-ds/mcp",
      ),
    ).toBe(false);
    expect(
      registry.search_index.some(
        (entry) =>
          entry.type === "package" && entry.name === "@salt-ds/data-grid",
      ),
    ).toBe(false);
    expect(
      registry.changes.some(
        (change) => change.package === "@salt-ds/data-grid",
      ),
    ).toBe(false);
  });

  it("emits unique deprecation ids and source-backed deprecated_in versions", () => {
    expect(
      new Set(registry.deprecations.map((deprecation) => deprecation.id)).size,
    ).toBe(registry.deprecations.length);

    const buttonVariantDeprecation = registry.deprecations.find(
      (deprecation) =>
        deprecation.package === "@salt-ds/core" &&
        deprecation.kind === "prop" &&
        deprecation.name === "variant",
    );
    expect(buttonVariantDeprecation?.deprecated_in).toBe("1.36.0");
    expect(buttonVariantDeprecation?.replacement.notes).toBe(
      "Use appearance and sentiment instead.",
    );

    const dialogIdPropDeprecation = registry.deprecations.find(
      (deprecation) =>
        deprecation.package === "@salt-ds/core" &&
        deprecation.kind === "prop" &&
        deprecation.name === "idProp",
    );
    expect(dialogIdPropDeprecation?.deprecated_in).toBe("1.58.0");

    const unstableProviderDeprecation = registry.deprecations.find(
      (deprecation) =>
        deprecation.package === "@salt-ds/core" &&
        deprecation.kind === "component" &&
        deprecation.name === "UNSTABLE_SaltProviderNext",
    );
    expect(unstableProviderDeprecation?.deprecated_in).toBe("1.32.0");
    expect(unstableProviderDeprecation?.replacement.name).toBe(
      "SaltProviderNext",
    );
  });

  it("attaches package metadata to component and pattern-story examples", () => {
    const componentExamples = registry.examples.filter(
      (example) => example.target_type === "component",
    );
    expect(componentExamples.length).toBeGreaterThan(0);
    expect(
      componentExamples.every((example) =>
        example.package?.startsWith("@salt-ds/"),
      ),
    ).toBe(true);

    const patternStoryExample = registry.examples.find((example) =>
      example.id.startsWith("pattern-story."),
    );
    expect(patternStoryExample?.package).toMatch(/^@salt-ds\//);
  });

  it("returns component examples by canonical component name", () => {
    const result = getExamples(registry, {
      target_type: "component",
      target_name: "Data grid",
      max_results: 10,
    });

    expect(result.examples.length).toBeGreaterThan(0);
    expect(result.resolved_target).toMatchObject({
      name: "Data grid",
      target_type: "component",
    });
  });

  it("extracts multiline LivePreview examples from docs pages", () => {
    const result = getExamples(registry, {
      target_type: "component",
      target_name: "Date input",
      max_results: 20,
    });

    expect(result.examples.length).toBeGreaterThan(2);
    expect(
      result.examples.some((example) => example.title === "Single controlled"),
    ).toBe(true);
    expect(
      result.examples.some((example) => example.title === "Range controlled"),
    ).toBe(true);
  });

  it("returns pattern story examples by canonical pattern name", () => {
    const result = getExamples(registry, {
      target_type: "pattern",
      target_name: "Button bar",
      max_results: 20,
      view: "full",
    });

    expect(
      result.examples.some((example) =>
        String(example.id).startsWith("pattern-story."),
      ),
    ).toBe(true);
  });

  it("extracts getting-started guides and makes them searchable by page content", () => {
    const result = getGuide(registry, {
      name: "bootstrap",
      view: "full",
    });

    expect(result.guide).toMatchObject({
      name: "Developing with Salt",
      kind: "getting-started",
    });
    expect(
      registry.search_index.some(
        (entry) =>
          entry.type === "guide" && entry.name === "Developing with Salt",
      ),
    ).toBe(true);
  });

  it("extracts primitive-choice and composition guides into the registry", () => {
    const primitiveGuide = getGuide(registry, {
      name: "button vs link",
      view: "full",
    });
    const compositionGuide = getGuide(registry, {
      name: "nested interactive",
      view: "full",
    });
    const wrapperGuide = getGuide(registry, {
      name: "wrapper review",
      view: "full",
    });

    expect(primitiveGuide.guide).toMatchObject({
      name: "Choosing the right primitive",
      kind: "getting-started",
      related_docs: expect.objectContaining({
        overview: "/salt/getting-started/choosing-the-right-primitive",
      }),
    });
    expect(compositionGuide.guide).toMatchObject({
      name: "Composition pitfalls",
      kind: "getting-started",
      related_docs: expect.objectContaining({
        overview: "/salt/getting-started/composition-pitfalls",
      }),
    });
    expect(wrapperGuide.guide).toMatchObject({
      name: "Custom wrappers",
      kind: "getting-started",
      related_docs: expect.objectContaining({
        overview: "/salt/getting-started/custom-wrappers",
      }),
    });
    expect(
      registry.search_index.some(
        (entry) =>
          entry.type === "guide" &&
          entry.name === "Choosing the right primitive",
      ),
    ).toBe(true);
    expect(
      registry.search_index.some(
        (entry) =>
          entry.type === "guide" && entry.name === "Composition pitfalls",
      ),
    ).toBe(true);
    expect(
      registry.search_index.some(
        (entry) => entry.type === "guide" && entry.name === "Custom wrappers",
      ),
    ).toBe(true);
  });

  it("indexes site pages so broad docs statements are searchable", () => {
    const result = searchSaltDocs(registry, {
      query: "wcag 2.1 aa standards",
      area: "pages",
      top_k: 10,
    });

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results.every((entry) => entry.type === "page")).toBe(true);
    expect(
      result.results.some((entry) =>
        String(entry.source_url).startsWith("/salt/"),
      ),
    ).toBe(true);
  });

  it("returns a page record for the Salt homepage", () => {
    const result = getPage(registry, {
      name: "/salt/index",
    });

    expect(result.page).toMatchObject({
      title: "Salt Design System",
      route: "/salt/index",
    });
  });

  it("preserves inline code tokens in docs-backed page content", () => {
    const layoutGridPage = getPage(registry, {
      name: "/salt/foundations/responsiveness/index",
      view: "full",
    });
    const spacingPage = getPage(registry, {
      name: "/salt/foundations/spacing",
      view: "full",
    });

    const layoutGridContent =
      (layoutGridPage.page as { content?: string[] } | null)?.content ?? [];
    const spacingContent =
      (spacingPage.page as { content?: string[] } | null)?.content ?? [];

    expect(
      layoutGridContent.some((block) => block.includes("--salt-layout-gap")),
    ).toBe(true);
    expect(
      spacingContent.some(
        (block) =>
          block.includes("--salt-layout-gap") &&
          block.includes("--salt-spacing-300"),
      ),
    ).toBe(true);
  });

  it("returns docs-backed layout gap guidance in page search results", () => {
    const result = searchSaltDocs(registry, {
      query: "salt-layout-gap",
      area: "pages",
      top_k: 10,
    });

    expect(
      result.results.some(
        (entry) =>
          entry.source_url === "/salt/foundations/responsiveness/index" &&
          entry.matched_excerpt?.includes("--salt-layout-gap"),
      ),
    ).toBe(true);
  });

  it("uses structured MDX extraction instead of flattened site-search code blocks", () => {
    const result = getPage(registry, {
      name: "/salt/themes/index",
      view: "full",
    });
    const content =
      (result.page as { content?: string[] } | null)?.content ?? [];

    expect(content.some((block) => block.includes("Amplitude font"))).toBe(
      true,
    );
    expect(content.some((block) => block.includes("```"))).toBe(false);
    expect(content.some((block) => block.includes("src: local("))).toBe(false);
  });

  it("resolves patterns by slug and includes docs-backed build guidance", () => {
    const result = getPattern(registry, {
      name: "preferences-dialog",
    });

    expect(result.pattern).toMatchObject({
      name: "Preferences dialog",
    });
    expect(
      Array.isArray(
        (result.pattern as { how_to_build?: unknown }).how_to_build,
      ),
    ).toBe(true);
  });

  it("emits examples only for supported target types", () => {
    expect(
      registry.examples.every(
        (example) =>
          example.target_type === "component" ||
          example.target_type === "pattern",
      ),
    ).toBe(true);
  });

  it("builds changelog-derived change records for component history lookups", () => {
    const result = getChanges(registry, {
      target_type: "component",
      target_name: "Button",
      limit: 20,
    });

    expect(result.changes.length).toBeGreaterThan(0);
    expect(
      result.changes.some(
        (change) =>
          change.target_name === "Button" && change.package === "@salt-ds/core",
      ),
    ).toBe(true);
  });
});
