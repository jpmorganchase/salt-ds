import type { SaltRegistry } from "../types.js";
import { recommendFixRecipes } from "./recommendFixRecipes.js";
import { suggestMigration } from "./suggestMigration.js";
import { validateSaltUsage } from "./validateSaltUsage.js";

export interface AnalyzeSaltCodeInput {
  code: string;
  framework?: string;
  package_version?: string;
  from_version?: string;
  to_version?: string;
  max_issues?: number;
  view?: "compact" | "full";
}

export interface AnalyzeSaltCodeResult {
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

export function analyzeSaltCode(
  registry: SaltRegistry,
  input: AnalyzeSaltCodeInput,
): AnalyzeSaltCodeResult {
  const view = input.view ?? "compact";
  const maxIssues = Math.max(1, Math.min(input.max_issues ?? 10, 50));
  const targetVersion = input.to_version ?? input.package_version;

  const validation = validateSaltUsage(registry, {
    code: input.code,
    framework: input.framework,
    package_version: targetVersion,
    max_issues: maxIssues,
  });
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

  return {
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
      severity: issue.severity,
      title: issue.title,
      message: issue.message,
      suggested_fix: issue.suggested_fix,
      confidence: issue.confidence,
      matches: issue.matches,
      source_urls: issue.source_urls,
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
    next_step: fixes.next_step ?? topFix ?? topIssue,
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
