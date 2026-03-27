import type { SourceUiModel, TranslationRecord } from "@salt-ds/semantic-core";
import {
  buildCombinedScaffoldOutput,
  buildDecisionGates,
  buildImplementationPlan,
  buildSourceUiModel,
  buildTranslationRecords,
  createEmptySourceAnalysis,
  detectFromCode,
  detectFromOutline,
  detectFromQuery,
  getCompositionRecipe,
  mergeDetectionBundle,
} from "@salt-ds/semantic-core";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { describe, expect, it } from "vitest";

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
  ],
  components: [
    {
      id: "component.link",
      name: "Link",
      aliases: [],
      package: {
        name: "@salt-ds/core",
        status: "stable",
        since: "1.0.0",
      },
      summary: "Navigate to another route.",
      status: "stable",
      category: ["navigation"],
      tags: ["navigation"],
      when_to_use: ["Navigate to another route."],
      when_not_to_use: ["Use Button for actions."],
      alternatives: [{ use: "Button", reason: "Use Button for actions." }],
      props: [],
      accessibility: {
        summary: ["Use discernible link text."],
        rules: [],
      },
      tokens: [],
      patterns: [],
      examples: [
        {
          id: "link.basic",
          title: "Basic link",
          intent: ["navigation"],
          complexity: "basic",
          code: '<Link href="/next">Next</Link>',
          source_url: "/salt/components/link/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "Link",
        },
      ],
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
      id: "component.input",
      name: "Input",
      aliases: ["text field"],
      package: {
        name: "@salt-ds/core",
        status: "stable",
        since: "1.0.0",
      },
      summary: "Collects short text input.",
      status: "stable",
      category: ["inputs"],
      tags: ["form", "text"],
      when_to_use: ["Capture short-form text."],
      when_not_to_use: ["Use MultilineInput for longer content."],
      alternatives: [],
      props: [],
      accessibility: {
        summary: ["Associate Input with a visible label or FormField."],
        rules: [],
      },
      tokens: [],
      patterns: [],
      examples: [
        {
          id: "input.basic",
          title: "Basic input",
          intent: ["capture short text"],
          complexity: "basic",
          code: '<Input aria-label="Search" />',
          source_url: "/salt/components/input/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "Input",
        },
      ],
      related_docs: {
        overview: "/salt/components/input",
        usage: "/salt/components/input/usage",
        accessibility: "/salt/components/input/accessibility",
        examples: "/salt/components/input/examples",
      },
      source: {
        repo_path: "packages/core/src/input",
        export_name: "Input",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
    {
      id: "component.vertical-navigation",
      name: "VerticalNavigation",
      aliases: ["vertical navigation"],
      package: {
        name: "@salt-ds/core",
        status: "stable",
        since: "1.0.0",
      },
      summary: "Structured vertical navigation for sidebars and app shells.",
      status: "stable",
      category: ["navigation"],
      tags: ["navigation", "sidebar", "app shell"],
      when_to_use: ["Move between sections in structured vertical navigation."],
      when_not_to_use: ["Use Link for a single navigation destination."],
      alternatives: [{ use: "Link", reason: "Use for a single destination." }],
      props: [],
      accessibility: {
        summary: ["Provide a clear accessible name for the navigation region."],
        rules: [],
      },
      tokens: [],
      patterns: ["Vertical navigation"],
      examples: [
        {
          id: "vertical-navigation.basic",
          title: "Basic vertical navigation",
          intent: ["sidebar navigation"],
          complexity: "intermediate",
          code: '<VerticalNavigation aria-label="Main navigation" />',
          source_url: "/salt/components/vertical-navigation/examples",
          package: "@salt-ds/core",
          target_type: "component",
          target_name: "VerticalNavigation",
        },
      ],
      related_docs: {
        overview: "/salt/components/vertical-navigation",
        usage: "/salt/components/vertical-navigation/usage",
        accessibility: "/salt/components/vertical-navigation/accessibility",
        examples: "/salt/components/vertical-navigation/examples",
      },
      source: {
        repo_path: "packages/core/src/vertical-navigation",
        export_name: "VerticalNavigation",
      },
      deprecations: [],
      last_verified_at: TIMESTAMP,
    },
  ],
  icons: [],
  country_symbols: [],
  pages: [],
  patterns: [
    {
      id: "pattern.command-header",
      name: "Command header",
      aliases: ["/salt/patterns/command-header"],
      summary: "A primary action with fallback options in a related menu.",
      status: "stable",
      category: ["layout-and-shells"],
      when_to_use: [
        "One action is most likely, with secondary actions still available.",
      ],
      when_not_to_use: [],
      composed_of: [{ component: "Button", role: "primary action" }],
      related_patterns: [],
      how_to_build: [
        "Use a primary button for the dominant action.",
        "Pair it with a menu trigger for secondary actions.",
      ],
      how_it_works: [
        "The primary trigger executes immediately.",
        "The menu trigger exposes related fallback actions.",
      ],
      accessibility: {
        summary: ["Ensure keyboard access to both triggers and menu items."],
      },
      resources: [],
      examples: [],
      related_docs: {
        overview: "/salt/patterns/command-header",
      },
      last_verified_at: TIMESTAMP,
    },
    {
      id: "pattern.split-button",
      name: "Split button",
      aliases: ["/salt/patterns/split-button", "split action"],
      summary: "A primary action with fallback options in a related menu.",
      status: "stable",
      category: ["actions-and-commands"],
      when_to_use: [
        "One action is most likely, with secondary actions still available.",
      ],
      when_not_to_use: [],
      composed_of: [
        { component: "Button", role: "primary action" },
        { component: "Menu", role: "secondary actions" },
      ],
      related_patterns: [],
      how_to_build: [
        "Use a primary button for the dominant action.",
        "Pair it with a menu trigger for secondary actions.",
      ],
      how_it_works: [
        "The primary trigger executes immediately.",
        "The menu trigger exposes related fallback actions.",
      ],
      accessibility: {
        summary: ["Ensure keyboard access to both triggers and menu items."],
      },
      resources: [],
      examples: [],
      related_docs: {
        overview: "/salt/patterns/split-button",
      },
      last_verified_at: TIMESTAMP,
    },
  ],
  guides: [],
  tokens: [],
  deprecations: [],
  examples: [],
  changes: [],
  search_index: [],
};

function makeManualReviewTranslation(
  sourceModel: SourceUiModel,
): TranslationRecord {
  return {
    source_model_ref: sourceModel.ui_regions[0].id,
    source_kind: sourceModel.ui_regions[0].kind,
    label: sourceModel.ui_regions[0].label,
    source_scope: sourceModel.ui_regions[0].scope,
    source_role: sourceModel.ui_regions[0].role,
    page_region_refs: sourceModel.page_regions.map((region) => region.id),
    grouping_refs: sourceModel.groupings.map((grouping) => grouping.id),
    evidence: sourceModel.ui_regions[0].evidence,
    matched_sources: [],
    confidence: 0.55,
    confidence_detail: {
      level: "low",
      reasons: ["No clear Salt target resolved from the current evidence."],
      blocker: "no-direct-salt-match",
      next_question:
        "Is this a dense data surface with sorting or filters, or just a simple list or read-only table?",
    },
    migration_kind: "manual-review",
    delta_category: "workflow-change-requires-confirmation",
    delta_rationale:
      "The current evidence suggests this flow may need a meaningful workflow change or more clarification before migration is safe.",
    notes: sourceModel.ui_regions[0].notes,
    implementation: {
      readiness: "review",
      next_action:
        "Resolve the data surface direction before scaffolding the final layout.",
      validation_step:
        "Review the Salt guidance and nearby examples for structured data display before locking the implementation.",
      starter_code_available: false,
    },
    salt_target: {
      solution_type: null,
      name: null,
      why: "No clear Salt data-surface target resolved.",
      docs: [],
      related_guides: [],
    },
  };
}

describe("translation modules", () => {
  it("detects code, query, and outline signals directly", () => {
    const codeSignals = detectFromCode(`
      export function Demo() {
        return (
          <>
            <aside />
            <main />
            <button onClick={() => {}}>Save</button>
            <a href="/next">Next</a>
          </>
        );
      }
    `);
    const querySignals = detectFromQuery(
      "Build a sidebar with toolbar and loading state",
    );
    const outlineSignals = detectFromOutline({
      regions: ["dialog footer"],
      actions: ["primary action with secondary menu"],
      states: ["validation"],
    });
    const merged = mergeDetectionBundle(
      {
        ...codeSignals,
        detections: mergeDetectionBundle(codeSignals, querySignals).detections,
        region_signals: mergeDetectionBundle(codeSignals, querySignals)
          .region_signals,
        state_signals: mergeDetectionBundle(codeSignals, querySignals)
          .state_signals,
      },
      outlineSignals,
    );

    expect([...merged.detections.keys()]).toEqual(
      expect.arrayContaining([
        "split-action",
        "vertical-navigation",
        "toolbar",
      ]),
    );
    expect([...merged.region_signals.keys()]).toEqual(
      expect.arrayContaining(["sidebar", "content", "toolbar", "footer"]),
    );
    expect([...merged.state_signals.keys()]).toEqual(
      expect.arrayContaining(["loading", "validation"]),
    );
  });

  it("builds a grouped source UI model from merged signals", () => {
    const merged = mergeDetectionBundle(
      createEmptySourceAnalysis(),
      detectFromOutline({
        regions: ["header", "sidebar", "main content", "dialog body"],
        actions: ["vertical navigation", "modal dialog"],
        states: ["error"],
      }),
    );
    const model = buildSourceUiModel(merged, {
      codeProvided: false,
      queryProvided: true,
      uiFlavor: "description",
    });

    expect(model.page_regions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "header" }),
        expect.objectContaining({ kind: "sidebar" }),
        expect.objectContaining({ kind: "content" }),
      ]),
    );
    expect(model.groupings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "app-shell" }),
        expect.objectContaining({ kind: "dialog-flow" }),
      ]),
    );
    expect(model.summary).toMatchObject({
      page_regions: 4,
      state_signals: 1,
      groupings: 2,
    });
  });

  it("carries footer actions and control regions into grouped form and data flows", () => {
    const model = buildSourceUiModel(
      detectFromOutline({
        regions: ["form section", "footer", "main content", "toolbar"],
        actions: ["text field", "submit button", "data grid", "toolbar"],
      }),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );

    expect(model.groupings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "form-flow",
          region_refs: expect.arrayContaining([
            expect.stringMatching(/^page-region-/),
          ]),
          ui_region_refs: expect.arrayContaining([
            expect.stringMatching(/^source-ui-/),
          ]),
        }),
        expect.objectContaining({
          kind: "data-surface",
          region_refs: expect.arrayContaining([
            expect.stringMatching(/^page-region-/),
          ]),
          ui_region_refs: expect.arrayContaining([
            expect.stringMatching(/^source-ui-/),
          ]),
        }),
      ]),
    );

    const formFlow = model.groupings.find(
      (grouping) => grouping.kind === "form-flow",
    );
    const dataSurface = model.groupings.find(
      (grouping) => grouping.kind === "data-surface",
    );
    const footerRegion = model.page_regions.find(
      (region) => region.kind === "footer",
    );
    const contentRegion = model.page_regions.find(
      (region) => region.kind === "content",
    );
    const actionRegion = model.ui_regions.find(
      (region) => region.kind === "action",
    );
    const toolbarRegion = model.ui_regions.find(
      (region) => region.kind === "toolbar",
    );

    expect(formFlow?.region_refs).toContain(footerRegion?.id);
    expect(formFlow?.ui_region_refs).toContain(actionRegion?.id);
    expect(dataSurface?.region_refs).toContain(contentRegion?.id);
    expect(dataSurface?.ui_region_refs).toContain(toolbarRegion?.id);
  });

  it("maps a normalized source model into Salt translation records", () => {
    const model = buildSourceUiModel(
      detectFromOutline({
        regions: ["sidebar", "form section"],
        actions: ["text field", "navigation link", "vertical navigation"],
      }),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );

    const translations = buildTranslationRecords(
      REGISTRY,
      {
        include_starter_code: true,
      },
      model,
    );

    expect(translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "text-input",
          salt_target: expect.objectContaining({
            name: "Input",
          }),
        }),
        expect.objectContaining({
          source_kind: "navigation",
          salt_target: expect.objectContaining({
            name: "Link",
          }),
        }),
        expect.objectContaining({
          source_kind: "vertical-navigation",
          salt_target: expect.objectContaining({
            name: "VerticalNavigation",
          }),
        }),
      ]),
    );
    expect(translations[0].confidence_detail.reasons.length).toBeGreaterThan(0);
    expect(
      translations.some(
        (translation) =>
          translation.source_kind === "vertical-navigation" &&
          translation.confidence_detail.blocker ===
            "project-conventions-dependency",
      ),
    ).toBe(true);
  });

  it("does not let structured vertical navigation collapse to Link when no structured target is available", () => {
    const model = buildSourceUiModel(
      detectFromOutline({
        regions: ["sidebar", "main content"],
        actions: ["vertical navigation"],
      }),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );
    const registryWithoutVerticalNavigation: SaltRegistry = {
      ...REGISTRY,
      components: REGISTRY.components.filter(
        (component) => component.name !== "VerticalNavigation",
      ),
    };

    const translations = buildTranslationRecords(
      registryWithoutVerticalNavigation,
      {},
      model,
    );

    expect(translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "vertical-navigation",
          migration_kind: "manual-review",
          salt_target: expect.objectContaining({
            name: null,
            why: expect.stringContaining(
              "Structured navigation should resolve to a structured navigation component or pattern",
            ),
          }),
        }),
      ]),
    );
  });

  it("uses app-shell context to prefer structured navigation over a single Link", () => {
    const model = buildSourceUiModel(
      detectFromOutline({
        regions: ["header", "sidebar", "main content"],
        actions: ["navigation link"],
      }),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );

    const translations = buildTranslationRecords(
      REGISTRY,
      {
        view: "full",
      },
      model,
    );
    const navigation = translations.find(
      (translation) => translation.source_kind === "navigation",
    );

    expect(navigation?.salt_target).toMatchObject({
      name: "VerticalNavigation",
    });
    expect(navigation?.raw_recommendation).toMatchObject({
      intent_profile: {
        query: expect.stringContaining("app shell"),
      },
    });
  });

  it("links dialog footer actions into dialog-flow context and prefers Preferences dialog when navigation is present", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          id: "pattern.preferences-dialog",
          name: "Preferences dialog",
          aliases: ["/salt/patterns/preferences-dialog"],
          summary:
            "A dialog pattern for grouped application settings with navigation and footer actions.",
          status: "stable",
          category: ["dialogs-and-overlays", "forms-and-data-entry"],
          when_to_use: [
            "Use for grouped settings panels inside one dialog with navigation and save or cancel actions.",
          ],
          when_not_to_use: [
            "Use Button bar alone only when the surrounding dialog pattern is already resolved.",
          ],
          composed_of: [
            { component: "VerticalNavigation", role: "settings navigation" },
            { component: "Button", role: "dialog actions" },
          ],
          related_patterns: ["Button bar"],
          how_to_build: [
            "Use dialog layout with navigation, content, and footer actions.",
          ],
          how_it_works: [
            "Users move between settings panels and then apply or cancel changes.",
          ],
          accessibility: {
            summary: [
              "Keep dialog navigation and footer actions keyboard reachable.",
            ],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/preferences-dialog",
          },
          semantics: {
            category: ["dialogs-and-overlays", "forms-and-data-entry"],
            preferred_for: [
              "Dialog navigation and content for application settings.",
              "Grouped settings panels with footer actions.",
            ],
            not_for: ["Standalone footer actions without dialog structure."],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
          last_verified_at: TIMESTAMP,
        },
        {
          id: "pattern.button-bar",
          name: "Button bar",
          aliases: ["/salt/patterns/button-bar"],
          summary: "Possible actions at the end of a task.",
          status: "stable",
          category: ["actions-and-commands"],
          when_to_use: ["Use for end-of-task actions."],
          when_not_to_use: [
            "Use a dialog pattern when the whole overlay structure matters.",
          ],
          composed_of: [{ component: "Button", role: "actions" }],
          related_patterns: [],
          how_to_build: ["Group related actions together."],
          how_it_works: ["Buttons complete or cancel the current task."],
          accessibility: {
            summary: ["Keep core actions visible and ordered consistently."],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/button-bar",
          },
          semantics: {
            category: ["actions-and-commands"],
            preferred_for: ["End-of-task actions."],
            not_for: ["Dialogs with navigation and settings panels."],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const model = buildSourceUiModel(
      detectFromOutline({
        regions: ["dialog header", "dialog body", "dialog footer"],
        actions: ["modal dialog", "navigation link", "save button"],
      }),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );

    const translations = buildTranslationRecords(
      registry,
      {
        view: "full",
      },
      model,
    );
    const dialog = translations.find(
      (translation) => translation.source_kind === "dialog",
    );
    const action = translations.find(
      (translation) => translation.source_kind === "action",
    );

    expect(dialog?.salt_target).toMatchObject({
      name: "Preferences dialog",
    });
    expect(dialog?.raw_recommendation).toMatchObject({
      intent_profile: {
        query: expect.stringContaining("preferences dialog"),
      },
    });
    expect(action?.grouping_refs?.length).toBeGreaterThan(0);
    expect(action?.raw_recommendation).toMatchObject({
      intent_profile: {
        query: expect.stringContaining("dialog actions"),
      },
    });
  });

  it("uses preferred pattern categories to keep split-action translation on the right Salt pattern family", () => {
    const model = buildSourceUiModel(
      detectFromQuery("split action with a primary action and fallback menu"),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );

    const translations = buildTranslationRecords(REGISTRY, {}, model);
    const splitAction = translations.find(
      (translation) => translation.source_kind === "split-action",
    );

    expect(splitAction?.salt_target).toMatchObject({
      name: "Split button",
    });
  });

  it("uses surrounding filter-bar context to refine toolbar pattern categories from docs-derived semantics", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        ...REGISTRY.patterns,
        {
          id: "pattern.action-toolbar",
          name: "Action toolbar",
          aliases: ["command toolbar"],
          summary: "A toolbar pattern for immediate in-place operations.",
          status: "stable",
          category: ["actions-and-commands"],
          when_to_use: ["Use for immediate operations exposed in a toolbar."],
          when_not_to_use: [
            "Use a different pattern when the toolbar primarily refines content.",
          ],
          composed_of: [{ component: "Button", role: "toolbar action" }],
          related_patterns: [],
          how_to_build: ["Place the most common operations in the toolbar."],
          how_it_works: ["Toolbar operations execute immediately."],
          accessibility: {
            summary: ["Ensure toolbar actions remain keyboard reachable."],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/action-toolbar",
          },
          semantics: {
            category: ["actions-and-commands"],
            preferred_for: ["Immediate operations exposed in a toolbar."],
            not_for: ["Filtering or narrowing a result set."],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
          last_verified_at: TIMESTAMP,
        },
        {
          id: "pattern.filter-toolbar",
          name: "Filter toolbar",
          aliases: ["filter bar"],
          summary:
            "A toolbar pattern for narrowing and refining current results.",
          status: "stable",
          category: ["selection-and-filtering"],
          when_to_use: [
            "Use when filters and search controls narrow the current result set.",
          ],
          when_not_to_use: ["Use Action toolbar for immediate actions only."],
          composed_of: [
            { component: "Input", role: "search field" },
            { component: "Input", role: "filter control" },
          ],
          related_patterns: ["Action toolbar"],
          how_to_build: ["Place filter controls in a persistent filter bar."],
          how_it_works: ["The controls refine the current results in place."],
          accessibility: {
            summary: ["Ensure filter controls have clear labels."],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/filter-toolbar",
          },
          semantics: {
            category: ["selection-and-filtering"],
            preferred_for: [
              "Filter controls that narrow the current result set.",
            ],
            not_for: ["Immediate action clusters without filtering."],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const model = buildSourceUiModel(
      detectFromQuery(
        "toolbar with filters and search controls for narrowing results",
      ),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );

    const translations = buildTranslationRecords(
      registry,
      {
        view: "full",
      },
      model,
    );
    const toolbar = translations.find(
      (translation) => translation.source_kind === "toolbar",
    );

    expect(toolbar?.salt_target).toMatchObject({
      name: "Filter toolbar",
    });
    expect(toolbar?.raw_recommendation).toMatchObject({
      intent_profile: {
        preferred_categories: ["selection-and-filtering"],
      },
    });

    expect(
      getCompositionRecipe(registry, {
        query: "toolbar with filters and search controls for narrowing results",
      }).recommended,
    ).toMatchObject({
      name: "Filter toolbar",
      type: "pattern",
    });
  });

  it("keeps filter-heavy data surfaces in the filtering family even inside an app shell", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        {
          id: "pattern.list-filtering",
          name: "List filtering",
          aliases: ["/salt/patterns/list-filtering"],
          summary:
            "Filtering and narrowing a set of results with an input and list-based surface.",
          status: "stable",
          category: ["selection-and-filtering"],
          when_to_use: [
            "Use when filters and search narrow the current results.",
          ],
          when_not_to_use: [
            "Use analytical dashboards for broad multi-widget analysis.",
          ],
          composed_of: [{ component: "Input", role: "filter field" }],
          related_patterns: [],
          how_to_build: ["Pair filter input with visible filtered results."],
          how_it_works: [
            "The current list updates as the user narrows the results.",
          ],
          accessibility: {
            summary: ["Keep filter controls clearly labeled."],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/list-filtering",
          },
          semantics: {
            category: ["selection-and-filtering"],
            preferred_for: [
              "Filter results",
              "List filtering",
              "Refine a list.",
            ],
            not_for: ["Wide analytical dashboard layouts."],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
          last_verified_at: TIMESTAMP,
        },
        {
          id: "pattern.analytical-dashboard",
          name: "Analytical dashboard",
          aliases: ["/salt/patterns/dashboards/analytical-dashboard"],
          summary:
            "A dashboard layout for metrics, charts, tables, and fixed panels.",
          status: "stable",
          category: ["data-display-and-analysis", "layout-and-shells"],
          when_to_use: [
            "Use for broad analytical dashboards with multiple widgets and regions.",
          ],
          when_not_to_use: [
            "Use list filtering for a single filtered result surface.",
          ],
          composed_of: [{ component: "Tabs", role: "dashboard grouping" }],
          related_patterns: [],
          how_to_build: [
            "Use fixed panels and dashboard regions around analytical content.",
          ],
          how_it_works: [
            "Users analyze multiple widgets and supporting controls together.",
          ],
          accessibility: {
            summary: ["Keep dashboard regions structured and scannable."],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/dashboards/analytical-dashboard",
          },
          semantics: {
            category: ["data-display-and-analysis", "layout-and-shells"],
            preferred_for: [
              "Dashboard regions",
              "Metrics and charts",
              "Fixed panels.",
            ],
            not_for: ["Single filtered result lists."],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const model = buildSourceUiModel(
      detectFromOutline({
        regions: ["header", "sidebar", "main content", "toolbar", "filter bar"],
        actions: ["data grid", "toolbar", "text field"],
      }),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );

    const translations = buildTranslationRecords(
      registry,
      {
        view: "full",
      },
      model,
    );
    const dataTable = translations.find(
      (translation) => translation.source_kind === "data-table",
    );

    expect(dataTable?.salt_target).toMatchObject({
      name: "List filtering",
    });
    expect(dataTable?.raw_recommendation).toMatchObject({
      intent_profile: {
        query: expect.stringContaining("list filtering"),
        preferred_categories: ["selection-and-filtering"],
      },
    });
  });

  it("adds wizard-oriented grouped hints when form actions describe previous and next steps", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        {
          id: "pattern.forms",
          name: "Forms",
          aliases: ["/salt/patterns/forms"],
          summary: "Pattern for grouped form fields and submission flows.",
          status: "stable",
          category: ["forms-and-data-entry"],
          when_to_use: ["Use for grouped fields and standard form submission."],
          when_not_to_use: ["Use Wizard for multi-step sequences."],
          composed_of: [{ component: "Input", role: "field" }],
          related_patterns: ["Wizard"],
          how_to_build: [
            "Group fields and place actions at the end of the task.",
          ],
          how_it_works: ["Users complete fields and submit the form."],
          accessibility: {
            summary: ["Keep field labels and validation guidance clear."],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/forms",
          },
          semantics: {
            category: ["forms-and-data-entry"],
            preferred_for: [
              "Grouped form fields",
              "Single-step form submission.",
            ],
            not_for: ["Step-by-step wizard flows."],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
          last_verified_at: TIMESTAMP,
        },
        {
          id: "pattern.wizard",
          name: "Wizard",
          aliases: ["/salt/patterns/wizard"],
          summary:
            "Pattern for multi-step forms with previous and next actions.",
          status: "stable",
          category: ["forms-and-data-entry"],
          when_to_use: [
            "Use for multi-step forms with next and previous actions.",
          ],
          when_not_to_use: [
            "Use Forms when all fields belong to one task view.",
          ],
          composed_of: [
            { component: "Button", role: "next and previous actions" },
          ],
          related_patterns: ["Forms"],
          how_to_build: ["Use grouped steps with a button bar and stepper."],
          how_it_works: [
            "Users move between steps with previous and next controls.",
          ],
          accessibility: {
            summary: ["Keep step state and action order consistent."],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/wizard",
          },
          semantics: {
            category: ["forms-and-data-entry"],
            preferred_for: ["Wizard", "Multi-step form", "Stepper"],
            not_for: ["Single-step forms."],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
          last_verified_at: TIMESTAMP,
        },
      ],
    };

    expect(
      getCompositionRecipe(registry, {
        query:
          "form section with a text field and previous and next footer actions",
      }).recommended,
    ).toMatchObject({
      name: "Wizard",
      type: "pattern",
    });
  });

  it("falls back to manual review when a flow-level pattern match only has thin semantics", () => {
    const registry: SaltRegistry = {
      ...REGISTRY,
      patterns: [
        {
          id: "pattern.generic-filter-toolbar",
          name: "Generic filter toolbar",
          aliases: [],
          summary: "Toolbar for filters.",
          status: "stable",
          category: ["selection-and-filtering"],
          when_to_use: [],
          when_not_to_use: [],
          composed_of: [],
          related_patterns: [],
          how_to_build: [],
          how_it_works: [],
          accessibility: {
            summary: [],
          },
          resources: [],
          examples: [],
          related_docs: {
            overview: "/salt/patterns/generic-filter-toolbar",
          },
          semantics: {
            category: ["selection-and-filtering"],
            preferred_for: [],
            not_for: [],
            derived_from: ["pattern-category-map", "pattern-docs"],
          },
          last_verified_at: TIMESTAMP,
        },
      ],
    };
    const model = buildSourceUiModel(
      detectFromQuery(
        "toolbar with filters and search controls for narrowing results",
      ),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );

    const translations = buildTranslationRecords(
      registry,
      {
        view: "full",
      },
      model,
    );
    const toolbar = translations.find(
      (translation) => translation.source_kind === "toolbar",
    );

    expect(toolbar?.migration_kind).toBe("manual-review");
    expect(toolbar?.salt_target).toMatchObject({
      name: null,
      solution_type: null,
    });

    expect(
      getCompositionRecipe(registry, {
        query: "toolbar with filters and search controls for narrowing results",
      }).recommended,
    ).toMatchObject({
      name: "Generic filter toolbar",
      type: "pattern",
    });
  });

  it("builds planning outputs, decision gates, and a combined scaffold directly", () => {
    const model = buildSourceUiModel(
      detectFromOutline({
        regions: ["sidebar", "main content", "toolbar"],
        actions: ["data grid"],
        states: ["loading"],
      }),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );
    const translations = [makeManualReviewTranslation(model)];
    const plan = buildImplementationPlan(translations, model, false);
    const gates = buildDecisionGates(translations);
    const scaffold = buildCombinedScaffoldOutput(translations, model, plan);

    expect(plan.workstreams).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "App shell",
        }),
      ]),
    );
    expect(gates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "data-table",
          suggested_workflow: "create_salt_ui",
        }),
      ]),
    );
    expect(scaffold?.[0]).toMatchObject({
      label: "Translated Salt scaffold",
      language: "tsx",
    });
    expect(scaffold?.[0]?.code).toContain("TranslatedSaltScaffold");
  });
});
