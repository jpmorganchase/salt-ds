import type { ComponentRecord, ExampleRecord, SaltRegistry } from "../types.js";
import {
  analyzeParsedSaltCode,
  type SaltCodeAnalysis,
} from "./codeAnalysisCommon.js";
import {
  inferExampleFrameworkHints,
  inferExamplePackageHints,
  inferExampleRepoSourceCandidates,
  inferExampleScenarioTags,
  scoreQueryFields,
} from "./consumerSignals.js";
import { getRelevantGuides } from "./guideAwareness.js";
import { findGuideByIdentifier } from "./guideLookup.js";
import { recommendTokens } from "./recommendTokens.js";
import { suggestMigration } from "./suggestMigration.js";
import { isExampleAllowedByDocsPolicy, tokenize, unique } from "./utils.js";
import { validateSaltUsage } from "./validateSaltUsage.js";
import {
  CHOOSING_PRIMITIVE_GUIDE_LOOKUP,
  COMPOSITION_PITFALLS_GUIDE_LOOKUP,
  CUSTOM_WRAPPERS_GUIDE_LOOKUP,
} from "./validation/issueCatalog.js";
import type { ValidationIssue } from "./validation/shared.js";

export interface RecommendFixRecipesInput {
  code: string;
  framework?: string;
  package_version?: string;
  max_recipes?: number;
  view?: "compact" | "full";
}

export interface RecommendFixRecipesResult {
  summary: {
    errors: number;
    warnings: number;
    infos: number;
    recipe_count: number;
  };
  recipes?: Array<Record<string, unknown>>;
  fixes?: Array<Record<string, unknown>>;
  next_step?: string;
  missing_data: string[];
  source_urls: string[];
}

function collectComponentExamples(
  registry: SaltRegistry,
  component: ComponentRecord,
): ExampleRecord[] {
  const examples = new Map<string, ExampleRecord>();

  for (const example of component.examples) {
    if (isExampleAllowedByDocsPolicy(registry, example)) {
      examples.set(example.id, example);
    }
  }

  for (const example of registry.examples) {
    if (
      example.target_type === "component" &&
      example.target_name.toLowerCase() === component.name.toLowerCase() &&
      isExampleAllowedByDocsPolicy(registry, example)
    ) {
      examples.set(example.id, example);
    }
  }

  return [...examples.values()];
}

function collectRelatedComponentsForIssue(
  registry: SaltRegistry,
  issue: ValidationIssue,
  migrations: Array<{
    component: string | null;
  }>,
): ComponentRecord[] {
  const matches = new Map<string, ComponentRecord>();

  for (const componentName of issue.fix_hints?.related_components ?? []) {
    const component =
      registry.components.find(
        (candidate) => candidate.name === componentName,
      ) ?? null;
    if (component) {
      matches.set(component.id, component);
    }
  }

  for (const migration of migrations) {
    if (!migration.component) {
      continue;
    }

    const component =
      registry.components.find(
        (candidate) =>
          candidate.name.toLowerCase() === migration.component?.toLowerCase(),
      ) ?? null;
    if (component) {
      matches.set(component.id, component);
    }
  }

  for (const component of registry.components) {
    const docs = Object.values(component.related_docs)
      .filter((value): value is string => Boolean(value))
      .some((value) => issue.source_urls.includes(value));
    if (docs) {
      matches.set(component.id, component);
    }
  }

  return [...matches.values()];
}

function getIssueSpecificSteps(
  registry: SaltRegistry,
  issue: ValidationIssue,
  relatedComponents: ComponentRecord[],
): string[] {
  const guideBackedSteps = unique(
    (issue.fix_hints?.guide_lookups ?? []).flatMap((lookup) => {
      const guide = findGuideByIdentifier(registry.guides, lookup);
      const guideName = guide?.name ?? lookup;

      if (lookup === CHOOSING_PRIMITIVE_GUIDE_LOOKUP) {
        return [
          `Use ${guideName} to keep actions on Button and navigation on Link before accepting a custom or native alternative.`,
        ];
      }

      if (lookup === COMPOSITION_PITFALLS_GUIDE_LOOKUP) {
        return [
          `Use ${guideName} to keep one interactive primitive per interaction and remove extra wrapper layers before preserving the current structure.`,
        ];
      }

      if (lookup === CUSTOM_WRAPPERS_GUIDE_LOOKUP) {
        return [
          `Use ${guideName} to confirm that the wrapper adds a stable API, semantics, or shared behavior beyond prop forwarding.`,
        ];
      }

      return [];
    }),
  );
  const extraSteps = unique([
    ...guideBackedSteps,
    ...(issue.fix_hints?.extra_steps ?? []),
  ]);

  if (issue.id === "composition.pass-through-wrapper") {
    const relatedNames = relatedComponents.map((component) => component.name);
    const targetText =
      relatedNames.length > 0
        ? `Use ${relatedNames.join(" or ")} directly where possible.`
        : "Use the underlying Salt primitive directly where possible.";

    return [
      ...extraSteps,
      targetText,
      "If the wrapper must remain, make it add meaningful shared behavior, semantics, or a stable public API beyond prop forwarding.",
    ];
  }

  return extraSteps;
}

function getIssueGuideRoutes(
  registry: SaltRegistry,
  issue: ValidationIssue,
): string[] {
  return unique(
    (issue.fix_hints?.guide_lookups ?? []).flatMap((lookup) => {
      const guide = findGuideByIdentifier(registry.guides, lookup);
      return guide?.related_docs.overview ? [guide.related_docs.overview] : [];
    }),
  );
}

function scoreExampleForIssue(
  issue: ValidationIssue,
  example: ExampleRecord,
): number {
  const issueText = [
    issue.id,
    issue.title,
    issue.message,
    issue.suggested_fix ?? "",
  ]
    .join(" ")
    .toLowerCase();
  const scenarioTags = inferExampleScenarioTags(example);
  const score = scoreQueryFields(issueText, [
    {
      key: "title",
      value: example.title,
      phrase_weight: 8,
      token_weight: 3,
    },
    {
      key: "intent",
      value: example.intent.join(" "),
      phrase_weight: 6,
      token_weight: 3,
    },
    {
      key: "scenario_tags",
      value: scenarioTags.join(" "),
      phrase_weight: 7,
      token_weight: 3,
    },
    {
      key: "code",
      value: example.code,
      phrase_weight: 4,
      token_weight: 1,
    },
  ]);

  return score.score;
}

function scoreMigrationForIssue(
  issue: ValidationIssue,
  migration: {
    kind: string;
    component: string | null;
    from: string;
    to: string | null;
    reason: string;
    source_urls: string[];
  },
): number {
  const issueTokens = tokenize(
    [issue.id, issue.title, issue.message, issue.suggested_fix ?? ""].join(" "),
  ).filter(
    (token) =>
      !new Set([
        "use",
        "with",
        "when",
        "from",
        "into",
        "than",
        "rather",
        "component",
        "components",
        "imported",
        "button",
      ]).has(token),
  );
  const migrationText = [
    migration.kind,
    migration.component ?? "",
    migration.from,
    migration.to ?? "",
    migration.reason,
  ]
    .join(" ")
    .toLowerCase();

  return issueTokens.reduce((score, token) => {
    return migrationText.includes(token) ? score + 1 : score;
  }, 0);
}

function getTokenRecommendationsForIssue(
  registry: SaltRegistry,
  issue: ValidationIssue,
): Array<Record<string, unknown>> {
  const tokenRecommendation = issue.fix_hints?.token_recommendation;
  if (!tokenRecommendation) {
    return [];
  }

  return (
    recommendTokens(registry, {
      query: tokenRecommendation.query,
      category: tokenRecommendation.category,
      top_k: tokenRecommendation.top_k ?? 3,
      view: "full",
    }).recommendations ?? []
  );
}

function getTokenRecommendationName(
  tokenRecommendation: Record<string, unknown>,
): string | null {
  if (typeof tokenRecommendation.name === "string") {
    return tokenRecommendation.name;
  }

  const nestedToken = tokenRecommendation.token;
  if (
    nestedToken &&
    typeof nestedToken === "object" &&
    typeof (nestedToken as { name?: unknown }).name === "string"
  ) {
    return (nestedToken as { name: string }).name;
  }

  return null;
}

export function recommendFixRecipes(
  registry: SaltRegistry,
  input: RecommendFixRecipesInput,
): RecommendFixRecipesResult {
  let analysis: SaltCodeAnalysis | undefined;
  if (input.code.trim().length > 0) {
    try {
      analysis = analyzeParsedSaltCode(input.code);
    } catch {
      analysis = undefined;
    }
  }

  const validation = validateSaltUsage(registry, {
    code: input.code,
    framework: input.framework,
    package_version: input.package_version,
    max_issues: input.max_recipes ?? 20,
    analysis,
  });
  const migrations = suggestMigration(registry, {
    code: input.code,
    to_version: input.package_version,
    max_migrations: 50,
    analysis,
  }).migrations;
  const maxRecipes = Math.max(1, Math.min(input.max_recipes ?? 10, 50));
  const view = input.view ?? "compact";

  const recipes = validation.issues.slice(0, maxRecipes).map((issue) => {
    const relevantMigrations = migrations
      .map((migration) => ({
        ...migration,
        score: scoreMigrationForIssue(issue, migration),
      }))
      .filter(
        (migration) =>
          migration.score >= 2 || issue.id.startsWith("deprecated."),
      )
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map(({ score: _score, ...migration }) => migration);
    const relatedComponents = collectRelatedComponentsForIssue(
      registry,
      issue,
      relevantMigrations,
    );
    const examplesById = new Map<string, ExampleRecord>();
    for (const component of relatedComponents) {
      for (const example of collectComponentExamples(registry, component)) {
        examplesById.set(example.id, example);
      }
    }
    const supportingExamples = [...examplesById.values()]
      .map((example) => ({
        example,
        score: scoreExampleForIssue(issue, example),
      }))
      .filter(
        (candidate) => candidate.score > 0 || relevantMigrations.length > 0,
      )
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map(({ example }) => ({
        title: example.title,
        intent: example.intent,
        complexity: example.complexity,
        source_url: example.source_url,
        target_type: example.target_type,
        target_name: example.target_name,
        scenario_tags: inferExampleScenarioTags(example),
        framework_hints: inferExampleFrameworkHints(example),
        package_hints: inferExamplePackageHints(example),
        repo_source_candidates: inferExampleRepoSourceCandidates(example),
      }));
    const tokenRecommendations = getTokenRecommendationsForIssue(
      registry,
      issue,
    );
    const issueSpecificSteps = getIssueSpecificSteps(
      registry,
      issue,
      relatedComponents,
    );
    const docs = unique([
      ...issue.source_urls,
      ...relatedComponents.flatMap((component) =>
        Object.values(component.related_docs).filter((value): value is string =>
          Boolean(value),
        ),
      ),
    ]);
    const relatedGuides = getRelevantGuides(registry, {
      componentNames: relatedComponents.map((component) => component.name),
      packages: unique(
        relatedComponents.map((component) => component.package.name),
      ),
      guideRoutes: unique(
        [
          issue.canonical_source,
          ...getIssueGuideRoutes(registry, issue),
          ...issue.source_urls,
        ].filter((value): value is string => Boolean(value)),
      ),
      top_k: 4,
    });
    const steps = unique(
      [
        issue.suggested_fix,
        ...issueSpecificSteps,
        ...relevantMigrations.map((migration) => migration.reason),
        ...(tokenRecommendations.length > 0
          ? [
              "Use the recommended Salt tokens that match the semantic or structural role instead of the current styling values.",
            ]
          : []),
      ].filter((value): value is string => Boolean(value)),
    );

    return {
      issue: {
        id: issue.id,
        category: issue.category,
        rule: issue.rule,
        severity: issue.severity,
        title: issue.title,
        message: issue.message,
        evidence: issue.evidence,
        canonical_source: issue.canonical_source,
        confidence: issue.confidence,
        matches: issue.matches,
      },
      steps,
      supporting_docs: docs,
      related_guides: relatedGuides,
      related_components: relatedComponents.map((component) => ({
        name: component.name,
        package: component.package.name,
        status: component.status,
        related_docs: component.related_docs,
      })),
      supporting_examples: supportingExamples,
      migrations: relevantMigrations,
      token_recommendations: tokenRecommendations,
    };
  });

  const summary = {
    ...validation.summary,
    recipe_count: recipes.length,
  };
  const sourceUrls = unique([
    ...validation.issues.flatMap((issue) => issue.source_urls),
    ...migrations.flatMap((migration) => migration.source_urls),
  ]);

  if (view === "full") {
    return {
      summary,
      recipes,
      next_step:
        recipes[0]?.steps?.[0] ?? "No remediation was required for this code.",
      missing_data: validation.missing_data,
      source_urls: sourceUrls,
    };
  }

  const fixes = recipes.map((recipe) => ({
    problem: recipe.issue?.message ?? recipe.issue?.title,
    category: recipe.issue?.category,
    rule: recipe.issue?.rule,
    severity: recipe.issue?.severity,
    canonical_source: recipe.issue?.canonical_source ?? null,
    recommended_fix: recipe.steps?.[0] ?? null,
    next_steps: recipe.steps?.slice(1) ?? [],
    example: recipe.supporting_examples?.[0]?.source_url ?? null,
    docs: recipe.supporting_docs?.slice(0, 4) ?? [],
    related_guides: recipe.related_guides ?? [],
    token_recommendations: (recipe.token_recommendations ?? [])
      .map((tokenRecommendation: Record<string, unknown>) =>
        getTokenRecommendationName(tokenRecommendation),
      )
      .filter((value: unknown): value is string => typeof value === "string"),
  }));

  return {
    summary,
    fixes,
    next_step:
      fixes[0]?.recommended_fix ?? "No remediation was required for this code.",
    missing_data: validation.missing_data,
    source_urls: sourceUrls,
  };
}
