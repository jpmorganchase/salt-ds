import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  type AppliedProjectConvention,
  type CanonicalSaltResult,
  type GuidanceBoundary,
  type GuidanceSource,
  mergeCanonicalAndProjectConventionLayers,
  mergeCanonicalAndProjectConventionStack,
  type ProjectConventionRuleType,
  type ProjectConventions,
  type ProjectConventionsLayerReference,
  type ProjectConventionsStack,
} from "../../../project-conventions-runtime/src/index.js";
import type { SaltInfoResult } from "../types.js";

const require = createRequire(import.meta.url);

export interface WorkflowProjectConventionsSummary {
  policyMode: SaltInfoResult["policy"]["mode"];
  checkRecommended: boolean;
  consulted: boolean;
  reason: string;
  topics: string[];
  layersConsulted: ProjectConventionsLayerReference[];
  applied: boolean;
  appliedRule: {
    type: AppliedProjectConvention["type"];
    name: string | null;
    replacement: string | null;
    wraps: string | null;
    reason: string;
    docs: string[];
    precedence: AppliedProjectConvention["precedence"];
    layer: ProjectConventionsLayerReference | null;
    import: { from: string; name: string } | null;
    useWhen: string[];
    avoidWhen: string[];
    migrationShim: boolean;
  } | null;
  canonicalChoice: {
    source: GuidanceSource;
    name: string | null;
    why: string;
  };
  finalChoice: {
    name: string | null;
    source: "project_conventions" | GuidanceSource;
    changed: boolean;
    basedOn: string | null;
    import: { from: string; name: string } | null;
  };
  finalRecommendation: string | null;
  mergeReason: ProjectConventionRuleType | "canonical-only";
  whyChanged: string | null;
  warnings: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function isMissingModuleError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "MODULE_NOT_FOUND"
  );
}

function toCanonicalResult(input: {
  decision: { name: string | null; why: string };
  guidanceBoundary: GuidanceBoundary;
}): CanonicalSaltResult {
  return {
    decision: input.decision,
    guidance_boundary: input.guidanceBoundary,
  };
}

function toImportReference(
  value: AppliedProjectConvention["import"] | null | undefined,
): { from: string; name: string } | null {
  if (!value) {
    return null;
  }

  return {
    from: value.from,
    name: value.name,
  };
}

function toAppliedRuleSummary(
  value: AppliedProjectConvention | null,
): WorkflowProjectConventionsSummary["appliedRule"] {
  if (!value) {
    return null;
  }

  return {
    type: value.type,
    name: value.name,
    replacement: value.replacement,
    wraps: value.wraps ?? null,
    reason: value.reason,
    docs: value.docs ?? [],
    precedence: value.precedence,
    layer: value.layer,
    import: toImportReference(value.import),
    useWhen: value.use_when ?? [],
    avoidWhen: value.avoid_when ?? [],
    migrationShim: value.migration_shim === true,
  };
}

function toSummary(input: {
  canonical: CanonicalSaltResult;
  policyMode: SaltInfoResult["policy"]["mode"];
  warnings: string[];
  merged?: Awaited<
    ReturnType<typeof mergeCanonicalAndProjectConventionLayers>
  > | null;
}): WorkflowProjectConventionsSummary {
  const merged = input.merged;

  if (!merged) {
    return {
      policyMode: input.policyMode,
      checkRecommended:
        input.canonical.guidance_boundary.project_conventions.check_recommended,
      consulted: false,
      reason: input.canonical.guidance_boundary.project_conventions.reason,
      topics: input.canonical.guidance_boundary.project_conventions.topics,
      layersConsulted: [],
      applied: false,
      appliedRule: null,
      canonicalChoice: {
        source: input.canonical.guidance_boundary.guidance_source,
        name: input.canonical.decision.name,
        why: input.canonical.decision.why,
      },
      finalChoice: {
        name: input.canonical.decision.name,
        source: input.canonical.guidance_boundary.guidance_source,
        changed: false,
        basedOn: input.canonical.decision.name,
        import: null,
      },
      finalRecommendation: input.canonical.decision.name,
      mergeReason: "canonical-only",
      whyChanged: null,
      warnings: input.warnings,
    };
  }

  return {
    policyMode: input.policyMode,
    checkRecommended: merged.project_conventions.check_recommended,
    consulted: merged.project_conventions.consulted,
    reason: merged.project_conventions.reason,
    topics: merged.project_conventions.topics,
    layersConsulted: merged.project_conventions.layers_consulted,
    applied: merged.project_conventions.applied,
    appliedRule: toAppliedRuleSummary(merged.project_convention_applied),
    canonicalChoice: {
      source: merged.canonical_choice.source,
      name: merged.canonical_choice.name,
      why: merged.canonical_choice.why,
    },
    finalChoice: {
      name: merged.final_choice.name,
      source: merged.final_choice.source,
      changed: merged.final_choice.changed,
      basedOn: merged.final_choice.based_on,
      import: toImportReference(merged.final_choice.import),
    },
    finalRecommendation: merged.final_recommendation,
    mergeReason: merged.merge_reason,
    whyChanged: merged.why_changed,
    warnings: input.warnings,
  };
}

function extractProjectConventionsCandidate(
  value: unknown,
  exportName: string | undefined,
): ProjectConventions | null {
  if (!isRecord(value)) {
    return null;
  }

  const directCandidate = exportName
    ? value[exportName]
    : ((value.default as unknown) ?? value.project_conventions_v1 ?? value);
  if (isRecord(directCandidate)) {
    return directCandidate as ProjectConventions;
  }

  if (!exportName && isRecord(value.default)) {
    return value.default as ProjectConventions;
  }

  if (
    exportName &&
    isRecord(value.default) &&
    isRecord(value.default[exportName])
  ) {
    return value.default[exportName] as ProjectConventions;
  }

  return null;
}

async function loadProjectConventionsFile(
  filePath: string,
  warnings: string[],
  options?: {
    optional?: boolean;
  },
): Promise<ProjectConventions | null> {
  let contents: string;

  try {
    contents = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (options?.optional && isMissingFileError(error)) {
      return null;
    }

    warnings.push(`Could not read project conventions at ${filePath}.`);
    return null;
  }

  try {
    const parsed = JSON.parse(contents) as unknown;
    if (!isRecord(parsed)) {
      warnings.push(`Could not parse project conventions at ${filePath}.`);
      return null;
    }

    return parsed as ProjectConventions;
  } catch {
    warnings.push(`Could not parse project conventions at ${filePath}.`);
    return null;
  }
}

async function loadProjectConventionsPackage(
  rootDir: string,
  specifier: string,
  exportName: string | undefined,
  warnings: string[],
  options?: {
    optional?: boolean;
  },
): Promise<ProjectConventions | null> {
  const descriptor = exportName ? `${specifier}#${exportName}` : specifier;
  let resolvedEntry: string;

  try {
    resolvedEntry = require.resolve(specifier, { paths: [rootDir] });
  } catch (error) {
    if (options?.optional && isMissingModuleError(error)) {
      return null;
    }

    warnings.push(`Could not load project-conventions layer ${descriptor}.`);
    return null;
  }

  try {
    const imported = await import(pathToFileURL(resolvedEntry).href);
    const candidate = extractProjectConventionsCandidate(imported, exportName);
    if (candidate) {
      return candidate;
    }
  } catch {
    // Fall through to require-based loading for CommonJS or mixed packages.
  }

  try {
    const required = require(resolvedEntry) as unknown;
    const candidate = extractProjectConventionsCandidate(required, exportName);
    if (candidate) {
      return candidate;
    }
  } catch {
    // Report a single warning below.
  }

  warnings.push(`Could not load project-conventions layer ${descriptor}.`);
  return null;
}

async function loadProjectConventionsStack(
  rootDir: string,
  stackConfigPath: string,
  canonical: CanonicalSaltResult,
  warnings: string[],
): Promise<WorkflowProjectConventionsSummary> {
  let stack: ProjectConventionsStack | null = null;

  try {
    const parsed = JSON.parse(
      await fs.readFile(stackConfigPath, "utf8"),
    ) as unknown;
    if (isRecord(parsed)) {
      stack = parsed as ProjectConventionsStack;
    }
  } catch {
    stack = null;
  }

  if (!stack) {
    warnings.push(
      `Could not parse project-conventions stack at ${stackConfigPath}.`,
    );
    return toSummary({
      canonical,
      policyMode: "stack",
      warnings,
    });
  }

  const stackDir = path.dirname(stackConfigPath);
  const merged = await mergeCanonicalAndProjectConventionStack(
    canonical,
    stack,
    async (layer) => {
      if (layer.source.type === "file") {
        return loadProjectConventionsFile(
          path.resolve(stackDir, layer.source.path),
          warnings,
          {
            optional: layer.optional === true,
          },
        );
      }

      return loadProjectConventionsPackage(
        rootDir,
        layer.source.specifier,
        layer.source.export,
        warnings,
        {
          optional: layer.optional === true,
        },
      );
    },
  );

  return toSummary({
    canonical,
    policyMode: "stack",
    warnings,
    merged,
  });
}

export async function loadCreateProjectConventionsSummary(input: {
  rootDir: string;
  policy: SaltInfoResult["policy"];
  decision: { name: string | null; why: string };
  guidanceBoundary: GuidanceBoundary;
}): Promise<WorkflowProjectConventionsSummary | null> {
  const hasPolicy =
    Boolean(input.policy.teamConfigPath) ||
    Boolean(input.policy.stackConfigPath);
  if (
    !hasPolicy &&
    !input.guidanceBoundary.project_conventions.check_recommended
  ) {
    return null;
  }

  const warnings: string[] = [];
  const canonical = toCanonicalResult({
    decision: input.decision,
    guidanceBoundary: input.guidanceBoundary,
  });

  if (input.policy.mode === "stack" && input.policy.stackConfigPath) {
    return loadProjectConventionsStack(
      input.rootDir,
      input.policy.stackConfigPath,
      canonical,
      warnings,
    );
  }

  if (input.policy.teamConfigPath) {
    const teamConventions = await loadProjectConventionsFile(
      input.policy.teamConfigPath,
      warnings,
    );
    const merged = teamConventions
      ? mergeCanonicalAndProjectConventionLayers(canonical, [
          {
            id: "team-policy",
            scope: "team",
            source: "./team.json",
            conventions: teamConventions,
          },
        ])
      : null;

    return toSummary({
      canonical,
      policyMode: "team",
      warnings,
      merged,
    });
  }

  if (!hasPolicy) {
    warnings.push(
      "No .salt/team.json or .salt/stack.json was available for the project-conventions check.",
    );
  }

  return toSummary({
    canonical,
    policyMode: input.policy.mode,
    warnings,
  });
}
