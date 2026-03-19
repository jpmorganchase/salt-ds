import type { ComponentRecord, ExampleRecord, SaltRegistry } from "../types.js";
import {
  analyzeSaltCode,
  type SaltCodeAnalysis,
} from "./codeAnalysisCommon.js";
import {
  inferExampleFrameworkHints,
  inferExamplePackageHints,
  inferExampleRepoSourceCandidates,
  inferExampleScenarioTags,
  scoreQueryFields,
} from "./consumerSignals.js";
import { recommendTokens } from "./recommendTokens.js";
import { suggestMigration } from "./suggestMigration.js";
import { isExampleAllowedByDocsPolicy, tokenize, unique } from "./utils.js";
import {
  type ValidationIssue,
  validateSaltUsage,
} from "./validateSaltUsage.js";

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
  const text = [
    issue.id,
    issue.title,
    issue.message,
    issue.suggested_fix ?? "",
    ...issue.source_urls,
  ]
    .join(" ")
    .toLowerCase();
  const matches = new Map<string, ComponentRecord>();

  for (const component of registry.components) {
    if (text.includes(component.name.toLowerCase())) {
      matches.set(component.id, component);
      continue;
    }

    const docs = Object.values(component.related_docs)
      .filter((value): value is string => Boolean(value))
      .some((value) => issue.source_urls.includes(value));
    if (docs) {
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

  if (issue.id.startsWith("component-choice.navigation")) {
    for (const componentName of ["Button", "Link"]) {
      const component =
        registry.components.find(
          (candidate) => candidate.name === componentName,
        ) ?? null;
      if (component) {
        matches.set(component.id, component);
      }
    }
  }

  if (issue.id.startsWith("a11y.button")) {
    const button =
      registry.components.find((candidate) => candidate.name === "Button") ??
      null;
    if (button) {
      matches.set(button.id, button);
    }
  }

  return [...matches.values()];
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
  if (issue.id === "tokens.hardcoded-size") {
    return (
      recommendTokens(registry, {
        query: "size spacing control",
        category: "size",
        top_k: 3,
        view: "full",
      }).recommendations ?? []
    );
  }

  if (issue.id === "tokens.hardcoded-color") {
    return (
      recommendTokens(registry, {
        query: "semantic color foreground background",
        category: "color",
        top_k: 3,
        view: "full",
      }).recommendations ?? []
    );
  }

  return [];
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
      analysis = analyzeSaltCode(input.code);
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
    const docs = unique([
      ...issue.source_urls,
      ...relatedComponents.flatMap((component) =>
        Object.values(component.related_docs).filter((value): value is string =>
          Boolean(value),
        ),
      ),
    ]);
    const steps = unique(
      [
        issue.suggested_fix,
        ...relevantMigrations.map((migration) => migration.reason),
        ...(tokenRecommendations.length > 0
          ? [
              "Use the recommended semantic Salt tokens instead of hard-coded values.",
            ]
          : []),
      ].filter((value): value is string => Boolean(value)),
    );

    return {
      issue: {
        id: issue.id,
        severity: issue.severity,
        title: issue.title,
        message: issue.message,
        confidence: issue.confidence,
        matches: issue.matches,
      },
      steps,
      supporting_docs: docs,
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
    severity: recipe.issue?.severity,
    recommended_fix: recipe.steps?.[0] ?? null,
    next_steps: recipe.steps?.slice(1) ?? [],
    example: recipe.supporting_examples?.[0]?.source_url ?? null,
    docs: recipe.supporting_docs?.slice(0, 4) ?? [],
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
