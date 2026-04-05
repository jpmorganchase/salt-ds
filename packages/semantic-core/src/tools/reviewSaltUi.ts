import type { SaltRegistry } from "../types.js";
import {
  analyzeParsedSaltCode,
  resolveImportedSaltSymbol,
  type SaltCodeAnalysis,
  traverseAst,
} from "./codeAnalysisCommon.js";
import type { WorkflowCompositionContract } from "./compositionContract.js";
import {
  appendProjectConventionsNextStep,
  buildGuidanceBoundary,
  type GuidanceBoundary,
} from "./guidanceBoundary.js";
import { recommendFixRecipes } from "./recommendFixRecipes.js";
import { suggestMigration } from "./suggestMigration.js";
import { validateSaltUsage } from "./validateSaltUsage.js";
import type { ValidationIssue } from "./validation/shared.js";
import {
  buildEvidence,
  componentDocUrls,
  createIssueCollector,
  finalizeValidationIssues,
} from "./validation/validateSaltUsageHelpers.js";
import {
  getJsxAttributeName,
  getJsxTagName,
  getStaticStringAttributeValue,
} from "./validation/validateSaltUsageJsx.js";

export interface ReviewSaltUiInput {
  code: string;
  framework?: string;
  package_version?: string;
  from_version?: string;
  to_version?: string;
  max_issues?: number;
  view?: "compact" | "full";
  expected_targets?: ReviewExpectedTargets;
}

export interface ReviewExpectedTargets {
  components?: string[];
  patterns?: string[];
  composition_contract?: WorkflowCompositionContract | null;
  source?: "create_report" | "workflow_context";
}

export interface ReviewSaltUiResult {
  guidance_boundary: GuidanceBoundary;
  decision: {
    status: "clean" | "needs_attention";
    why: string;
  };
  summary: {
    errors: number;
    warnings: number;
    infos: number;
    fix_count: number;
    migration_count: number;
  };
  fixes?: Array<Record<string, unknown>>;
  issues?: Array<Record<string, unknown>>;
  migrations?: Array<Record<string, unknown>>;
  missing_data: string[];
  next_step?: string;
  source_urls: string[];
  raw?: Record<string, unknown>;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeExpectedTargetNames(values: string[] | undefined): string[] {
  return unique(
    (values ?? [])
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );
}

function normalizeTargetName(value: string): string {
  return value.replace(/[\s-]+/g, "").toLowerCase();
}

function collectExpectedPatternNames(
  expectedTargets: ReviewExpectedTargets | undefined,
): string[] {
  return normalizeExpectedTargetNames([
    ...(expectedTargets?.patterns ?? []),
    ...(expectedTargets?.composition_contract?.expected_patterns ?? []),
    ...(expectedTargets?.composition_contract?.slots ?? []).flatMap((slot) =>
      slot.certainty === "optional" ? [] : slot.preferred_patterns,
    ),
  ]);
}

function collectExpectedComponentNames(
  expectedTargets: ReviewExpectedTargets | undefined,
): string[] {
  return normalizeExpectedTargetNames([
    ...(expectedTargets?.components ?? []),
    ...(expectedTargets?.composition_contract?.expected_components ?? []),
    ...(expectedTargets?.composition_contract?.slots ?? []).flatMap((slot) =>
      slot.certainty === "optional" ? [] : slot.preferred_components,
    ),
  ]);
}

function getPatternDocUrls(registry: SaltRegistry, name: string): string[] {
  const pattern = registry.patterns.find((record) => record.name === name);
  if (!pattern) {
    return [];
  }

  return unique(
    [
      pattern.related_docs.overview,
      ...(pattern.starter_scaffold?.source_urls ?? []),
      ...pattern.resources
        .filter((resource) => resource.internal)
        .map((resource) => resource.href),
    ].filter((value): value is string => Boolean(value)),
  );
}

function buildExpectedMetricPatternIssue(
  registry: SaltRegistry,
  input: {
    expectedTargets: ReviewExpectedTargets;
    usesCard: boolean;
  },
): ValidationIssue {
  const sourceUrls = unique([
    ...getPatternDocUrls(registry, "Metric"),
    ...componentDocUrls(registry, "Text", ["overview", "usage"]),
    ...componentDocUrls(registry, "Link", ["overview", "usage"]),
  ]);
  const title = "Expected Metric pattern not followed";
  const message =
    input.expectedTargets.source === "create_report"
      ? "The saved create report selected or sourced the Salt Metric pattern, but the reviewed implementation does not show the expected metric value structure."
      : "The reviewed implementation does not show the expected Salt Metric pattern value structure.";
  const evidence = [
    ...buildEvidence(
      "Review expected the Metric pattern from a prior Salt workflow decision",
      1,
    ),
    "No Salt Display1/Display2/Display3 usage or display-style Text was found for the metric value.",
    ...(input.usesCard
      ? [
          "Salt Card composition was also detected, which suggests the metric surface was rebuilt instead of following the Metric pattern.",
        ]
      : []),
  ];

  return {
    id: "workflow-expected.metric-pattern",
    category: "primitive-choice",
    rule: "workflow-expected-metric-pattern",
    severity: "warning",
    title,
    message,
    evidence,
    canonical_source: sourceUrls[0] ?? "/salt/patterns/metric",
    suggested_fix:
      "Follow the Salt Metric pattern for the value emphasis and supporting context instead of improvising a custom KPI structure.",
    confidence: input.usesCard ? 0.92 : 0.84,
    source_urls: sourceUrls.length > 0 ? sourceUrls : ["/salt/patterns/metric"],
    matches: 1,
    fix_hints: {
      guide_lookups: [],
      related_components: ["Text", "Link"],
      extra_steps: [
        "Use Display1, Display2, Display3, or display-style Text for the metric value.",
        "Keep the title, value, and optional subtitle or subvalue in the Metric pattern shape instead of burying them inside a generic card.",
      ],
    },
  };
}

function buildExpectedTabularSurfaceIssue(
  registry: SaltRegistry,
  input: {
    expectedTargets: ReviewExpectedTargets;
    rawTableMatches: number;
  },
): ValidationIssue {
  const sourceUrls = unique([
    ...getPatternDocUrls(registry, "Analytical dashboard"),
    ...componentDocUrls(registry, "Table", ["overview", "usage", "examples"]),
    ...componentDocUrls(registry, "Data grid", [
      "overview",
      "usage",
      "examples",
    ]),
  ]);
  const message =
    input.expectedTargets.source === "create_report"
      ? "The saved create report expected a Salt tabular surface, but the reviewed implementation fell back to raw HTML table markup."
      : "The reviewed implementation fell back to raw HTML table markup instead of the expected Salt tabular surface.";

  return {
    id: "workflow-expected.tabular-surface",
    category: "primitive-choice",
    rule: "workflow-expected-tabular-surface",
    severity: "warning",
    title: "Expected Salt tabular surface not followed",
    message,
    evidence: [
      ...buildEvidence(
        "Review expected a Salt tabular surface from a prior workflow decision",
        1,
      ),
      ...buildEvidence(
        "Raw HTML table markup was detected instead of a Salt table component",
        input.rawTableMatches,
      ),
    ],
    canonical_source: sourceUrls[0] ?? "/salt/components/table",
    suggested_fix:
      "Use Salt Table or Data grid for the tabular surface instead of raw HTML table markup.",
    confidence: 0.92,
    source_urls:
      sourceUrls.length > 0 ? sourceUrls : ["/salt/components/table"],
    matches: input.rawTableMatches,
    fix_hints: {
      guide_lookups: [],
      related_components: ["Table", "Data grid"],
      extra_steps: [
        "Choose Table for simpler tabular layouts and Data grid for richer interactive tables.",
      ],
    },
  };
}

function buildExpectedTargetIssues(
  registry: SaltRegistry,
  input: {
    expectedTargets: ReviewExpectedTargets | undefined;
    analysis: SaltCodeAnalysis | null;
  },
): ValidationIssue[] {
  const expectedTargets = input.expectedTargets;
  if (!expectedTargets || !input.analysis) {
    return [];
  }

  const expectedPatterns = collectExpectedPatternNames(expectedTargets);
  const expectedComponents = collectExpectedComponentNames(expectedTargets);
  const expectsMetric = expectedPatterns.some(
    (name) => normalizeTargetName(name) === "metric",
  );
  const expectsTabularSurface = expectedComponents.some((name) => {
    const normalized = normalizeTargetName(name);
    return normalized === "table" || normalized === "datagrid";
  });
  if (!expectsMetric && !expectsTabularSurface) {
    return [];
  }

  const analysis = input.analysis;
  let usesMetricDisplayValue = false;
  let usesCard = false;
  let usesSaltTabularSurface = false;
  let rawTableMatches = 0;

  traverseAst(analysis.ast, {
    JSXOpeningElement(path) {
      const imported = resolveImportedSaltSymbol(
        path.node.name,
        analysis.directImportByLocal,
        analysis.namespaceImportByLocal,
      );
      const tagName = getJsxTagName(path.node.name);
      if (!imported && tagName === "table") {
        rawTableMatches += 1;
      }
      if (
        imported?.imported === "Display1" ||
        imported?.imported === "Display2" ||
        imported?.imported === "Display3"
      ) {
        usesMetricDisplayValue = true;
      }

      if (imported?.imported === "Card") {
        usesCard = true;
      }

      if (imported) {
        const normalizedImported = normalizeTargetName(imported.imported);
        if (
          normalizedImported === "table" ||
          normalizedImported === "datagrid"
        ) {
          usesSaltTabularSurface = true;
        }
      }

      if (tagName !== "Text") {
        return;
      }

      const styleAttribute = path.node.attributes.find(
        (attribute) =>
          attribute.type === "JSXAttribute" &&
          getJsxAttributeName(attribute) === "styleAs",
      );
      if (
        styleAttribute?.type === "JSXAttribute" &&
        /^display[123]$/i.test(
          getStaticStringAttributeValue(styleAttribute) ?? "",
        )
      ) {
        usesMetricDisplayValue = true;
      }
    },
  });

  const issues: ValidationIssue[] = [];

  if (expectsMetric && !usesMetricDisplayValue) {
    issues.push(
      buildExpectedMetricPatternIssue(registry, {
        expectedTargets,
        usesCard,
      }),
    );
  }

  if (expectsTabularSurface && rawTableMatches > 0 && !usesSaltTabularSurface) {
    issues.push(
      buildExpectedTabularSurfaceIssue(registry, {
        expectedTargets,
        rawTableMatches,
      }),
    );
  }

  return issues;
}

export function isWorkflowExpectedReviewIssueId(issueId: string): boolean {
  return issueId.startsWith("workflow-expected.");
}

export function reviewSaltUi(
  registry: SaltRegistry,
  input: ReviewSaltUiInput,
): ReviewSaltUiResult {
  const view = input.view ?? "compact";
  const maxIssues = Math.max(1, Math.min(input.max_issues ?? 10, 50));
  const targetVersion = input.to_version ?? input.package_version;
  let analysis: SaltCodeAnalysis | null = null;

  try {
    analysis = analyzeParsedSaltCode(input.code);
  } catch {
    analysis = null;
  }

  const rawValidation = validateSaltUsage(registry, {
    code: input.code,
    framework: input.framework,
    package_version: targetVersion,
    max_issues: maxIssues,
    analysis: analysis ?? undefined,
  });
  const contextualIssues = buildExpectedTargetIssues(registry, {
    expectedTargets: input.expected_targets,
    analysis,
  });
  const validation =
    contextualIssues.length === 0
      ? rawValidation
      : (() => {
          const { issueMap, addIssue } = createIssueCollector();
          for (const issue of rawValidation.issues) {
            addIssue(issue);
          }
          for (const issue of contextualIssues) {
            addIssue(issue);
          }
          const finalized = finalizeValidationIssues(issueMap, maxIssues);

          return {
            ...rawValidation,
            ...finalized,
          };
        })();
  const migrations = suggestMigration(registry, {
    code: input.code,
    from_version: input.from_version,
    to_version: targetVersion,
    max_migrations: maxIssues,
  });
  const fixes = recommendFixRecipes(registry, {
    code: input.code,
    framework: input.framework,
    package_version: targetVersion,
    max_recipes: maxIssues,
    view,
  });

  const missingData = unique([
    ...validation.missing_data,
    ...fixes.missing_data,
    ...migrations.notes,
  ]);
  const sourceUrls = unique([
    ...validation.issues.flatMap((issue) => issue.source_urls),
    ...migrations.source_urls,
    ...fixes.source_urls,
  ]);
  const fixCount =
    view === "full"
      ? Array.isArray(fixes.recipes)
        ? fixes.recipes.length
        : 0
      : Array.isArray(fixes.fixes)
        ? fixes.fixes.length
        : 0;
  const firstRecipe = toRecord(fixes.recipes?.[0]);
  const firstFix = toRecord(fixes.fixes?.[0]);
  const topFix =
    view === "full"
      ? typeof (Array.isArray(firstRecipe?.steps)
          ? firstRecipe.steps[0]
          : null) === "string"
        ? (firstRecipe?.steps as string[])[0]
        : undefined
      : typeof firstFix?.recommended_fix === "string"
        ? firstFix.recommended_fix
        : undefined;
  const topIssue = validation.issues[0]?.message ?? validation.issues[0]?.title;
  const needsAttention =
    validation.summary.errors > 0 ||
    validation.summary.warnings > 0 ||
    fixCount > 0 ||
    migrations.migrations.length > 0;
  const issueCategories = unique(
    validation.issues.map((issue) => issue.category).filter(Boolean),
  );
  const guidanceBoundary = buildGuidanceBoundary({
    workflow: "review_salt_ui",
    issue_categories: issueCategories,
    has_deprecations:
      validation.issues.some((issue) => issue.category === "deprecated") ||
      migrations.migrations.length > 0,
  });

  return {
    guidance_boundary: guidanceBoundary,
    decision: {
      status: needsAttention ? "needs_attention" : "clean",
      why:
        topFix ??
        topIssue ??
        (needsAttention
          ? "Salt usage issues were detected."
          : "No significant Salt usage issues were detected."),
    },
    summary: {
      ...validation.summary,
      fix_count: fixCount,
      migration_count: migrations.migrations.length,
    },
    fixes: view === "full" ? fixes.recipes : fixes.fixes,
    issues: validation.issues.map((issue) => ({
      id: issue.id,
      category: issue.category,
      rule: issue.rule,
      severity: issue.severity,
      title: issue.title,
      message: issue.message,
      evidence: issue.evidence,
      canonical_source: issue.canonical_source,
      suggested_fix: issue.suggested_fix,
      confidence: issue.confidence,
      matches: issue.matches,
      source_urls: issue.source_urls,
      fix_hints: issue.fix_hints,
    })),
    migrations: migrations.migrations.map((migration) => ({
      kind: migration.kind,
      component: migration.component,
      from: migration.from,
      to: migration.to,
      reason: migration.reason,
      source_urls: migration.source_urls,
    })),
    missing_data: missingData,
    next_step: appendProjectConventionsNextStep(
      fixes.next_step ?? topFix ?? topIssue,
      guidanceBoundary,
    ),
    source_urls: sourceUrls,
    raw:
      view === "full"
        ? {
            validation,
            fixes,
            migrations,
          }
        : undefined,
  };
}
