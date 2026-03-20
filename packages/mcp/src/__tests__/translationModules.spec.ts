import { describe, expect, it } from "vitest";
import { buildTranslationRecords } from "../tools/translation/sourceUiMapping.js";
import {
  createEmptySourceAnalysis,
  detectFromCode,
  detectFromOutline,
  detectFromQuery,
  mergeDetectionBundle,
} from "../tools/translation/sourceUiDetection.js";
import { buildSourceUiModel } from "../tools/translation/sourceUiModel.js";
import {
  buildCombinedScaffoldOutput,
  buildDecisionGates,
  buildImplementationPlan,
} from "../tools/translation/sourceUiPlanning.js";
import type {
  SourceUiModel,
  TranslationRecord,
} from "../tools/translation/sourceUiTypes.js";
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
  ],
  icons: [],
  country_symbols: [],
  pages: [],
  patterns: [],
  guides: [],
  tokens: [],
  deprecations: [],
  examples: [],
  changes: [],
  search_index: [],
};

function makeManualReviewTranslation(sourceModel: SourceUiModel): TranslationRecord {
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
    notes: sourceModel.ui_regions[0].notes,
    implementation: {
      readiness: "review",
      next_action: "Resolve the data surface direction before scaffolding the final layout.",
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
        region_signals: mergeDetectionBundle(codeSignals, querySignals).region_signals,
        state_signals: mergeDetectionBundle(codeSignals, querySignals).state_signals,
      },
      outlineSignals,
    );

    expect([...merged.detections.keys()]).toEqual(
      expect.arrayContaining(["split-action", "vertical-navigation", "toolbar"]),
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

  it("maps a normalized source model into Salt translation records", () => {
    const model = buildSourceUiModel(
      detectFromOutline({
        regions: ["form section"],
        actions: ["text field", "navigation link"],
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
      ]),
    );
    expect(translations[0].confidence_detail.reasons.length).toBeGreaterThan(0);
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
          suggested_workflow: "choose_salt_solution",
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
