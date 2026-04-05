import fs from "node:fs/promises";
import path from "node:path";
import {
  type AppliedProjectConvention,
  type CanonicalSaltResult,
  composeProjectConventionLayers,
  composeProjectConventionStack,
  type GuidanceBoundary,
  type GuidanceSource,
  mergeCanonicalAndProjectConventionLayers,
  mergeCanonicalAndProjectConventionStack,
  type ProjectConventionRuleType,
  type ProjectConventions,
  type ProjectConventionsLayerReference,
  type ProjectConventionsStack,
  type ThemeDefaultsConvention,
  type TokenAliasConvention,
  type TokenFamilyPolicyConvention,
} from "@salt-ds/semantic-core/policy";
import {
  deriveComparableSaltVersion,
  resolveProjectConventionsFileLayer,
  resolveProjectConventionsPackageLayer,
} from "@salt-ds/semantic-core/policy/layerDiagnostics";
import {
  buildWorkflowProjectPolicyArtifact,
  type WorkflowProjectPolicyArtifact,
} from "@salt-ds/semantic-core/tools/workflowProjectPolicy";
import type { SaltInfoResult } from "../types.js";

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
  themeDefaults: {
    provider: string;
    providerImport: { from: string; name: string } | null;
    imports: string[];
    props: Array<{
      name: string;
      value: string;
    }>;
    reason: string | null;
    sourceUrls: string[];
  } | null;
  tokenAliases: Array<{
    saltName: string;
    prefer: string;
    reason: string;
    sourceUrls: string[];
  }>;
  tokenFamilyPolicies: Array<{
    family: string;
    mode: TokenFamilyPolicyConvention["mode"];
    reason: string;
    sourceUrls: string[];
  }>;
  warnings: string[];
}

export interface WorkflowProjectConventionsCheckSummary {
  policyMode: SaltInfoResult["policy"]["mode"];
  declared: boolean;
  checkRecommended: boolean;
  reasons: string[];
  topics: string[];
  teamConfigPath: string | null;
  stackConfigPath: string | null;
  sharedPacks: string[];
  warnings: string[];
}

export type WorkflowProjectPolicySummary = WorkflowProjectPolicyArtifact;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function collectPolicyWarnings(policy: SaltInfoResult["policy"]): string[] {
  const warnings: string[] = [];

  for (const layer of policy.stackLayers) {
    if (layer.resolution.reason) {
      warnings.push(layer.resolution.reason);
    }
    if (
      layer.resolution.compatibility &&
      layer.resolution.compatibility.status !== "compatible"
    ) {
      warnings.push(layer.resolution.compatibility.reason);
    }
  }

  for (const detail of policy.sharedConventions.packDetails) {
    if (detail.reason) {
      warnings.push(detail.reason);
    }
    if (detail.compatibility && detail.compatibility.status !== "compatible") {
      warnings.push(detail.compatibility.reason);
    }
  }

  return unique(warnings);
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

function toThemeDefaultsSummary(
  value: ThemeDefaultsConvention | null | undefined,
): WorkflowProjectConventionsSummary["themeDefaults"] {
  if (!value?.provider) {
    return null;
  }

  return {
    provider: value.provider,
    providerImport: value.provider_import
      ? {
          from: value.provider_import.from,
          name: value.provider_import.name,
        }
      : null,
    imports: value.imports ?? [],
    props: (value.props ?? []).map((entry) => ({
      name: entry.name,
      value: entry.value,
    })),
    reason: value.reason ?? null,
    sourceUrls: value.docs ?? [],
  };
}

function toThemeDefaultsConvention(
  value: WorkflowProjectConventionsSummary["themeDefaults"] | null | undefined,
): ThemeDefaultsConvention | undefined {
  if (!value?.provider) {
    return undefined;
  }

  const base = {
    imports: value.imports,
    props: value.props,
    reason: value.reason ?? "Repo theme defaults are declared.",
    docs: value.sourceUrls,
  };

  if (value.providerImport) {
    return {
      provider: value.provider,
      provider_import: {
        from: value.providerImport.from,
        name: value.providerImport.name,
      },
      ...base,
    };
  }

  if (
    value.provider === "SaltProvider" ||
    value.provider === "SaltProviderNext"
  ) {
    return {
      provider: value.provider,
      ...base,
    };
  }

  return undefined;
}

function toTokenAliasesSummary(
  values: TokenAliasConvention[] | null | undefined,
): WorkflowProjectConventionsSummary["tokenAliases"] {
  return (values ?? []).map((entry) => ({
    saltName: entry.salt_name,
    prefer: entry.prefer,
    reason: entry.reason,
    sourceUrls: entry.docs ?? [],
  }));
}

function toTokenFamilyPoliciesSummary(
  values: TokenFamilyPolicyConvention[] | null | undefined,
): WorkflowProjectConventionsSummary["tokenFamilyPolicies"] {
  return (values ?? []).map((entry) => ({
    family: entry.family,
    mode: entry.mode,
    reason: entry.reason,
    sourceUrls: entry.docs ?? [],
  }));
}

function toProjectPolicySummary(input: {
  policyMode: SaltInfoResult["policy"]["mode"];
  declared: boolean;
  sharedPacks: string[];
  approvedWrappers: string[];
  warnings: string[];
  layersConsulted?: ProjectConventionsLayerReference[];
  conventions?: ProjectConventions | null;
}): WorkflowProjectPolicySummary {
  return buildWorkflowProjectPolicyArtifact({
    policyMode: input.policyMode,
    declared: input.declared,
    sharedPacks: input.sharedPacks,
    approvedWrappers:
      input.approvedWrappers.length > 0
        ? input.approvedWrappers
        : (input.conventions?.approved_wrappers ?? []).map(
            (entry) => entry.name,
          ),
    approvedWrapperDetails: (input.conventions?.approved_wrappers ?? []).map(
      (entry) => ({
        name: entry.name,
        wraps: entry.wraps,
        reason: entry.reason,
        import: entry.import
          ? {
              from: entry.import.from,
              name: entry.import.name,
            }
          : null,
        useWhen: entry.use_when ?? [],
        avoidWhen: entry.avoid_when ?? [],
        migrationShim: entry.migration_shim === true,
        sourceUrls: entry.docs ?? [],
      }),
    ),
    warnings: input.warnings,
    layersConsulted: input.layersConsulted ?? [],
    themeDefaults: toThemeDefaultsSummary(input.conventions?.theme_defaults),
    tokenAliases: toTokenAliasesSummary(input.conventions?.token_aliases),
    tokenFamilyPolicies: toTokenFamilyPoliciesSummary(
      input.conventions?.token_family_policies,
    ),
  });
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
      themeDefaults: null,
      tokenAliases: [],
      tokenFamilyPolicies: [],
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
    themeDefaults: toThemeDefaultsSummary(
      merged.project_conventions.theme_defaults,
    ),
    tokenAliases: toTokenAliasesSummary(
      merged.project_conventions.token_aliases,
    ),
    tokenFamilyPolicies: toTokenFamilyPoliciesSummary(
      merged.project_conventions.token_family_policies,
    ),
    warnings: input.warnings,
  };
}

async function loadProjectConventionsFile(
  filePath: string,
  warnings: string[],
  currentSaltVersion: string | null,
  options?: {
    optional?: boolean;
  },
): Promise<ProjectConventions | null> {
  const resolution = await resolveProjectConventionsFileLayer({
    filePath,
    currentSaltVersion,
    optional: options?.optional,
  });
  if (resolution.status !== "resolved" || !resolution.conventions) {
    if (resolution.reason) {
      warnings.push(resolution.reason);
    }
    return null;
  }

  if (
    resolution.compatibility &&
    resolution.compatibility.status === "unsupported"
  ) {
    warnings.push(resolution.compatibility.reason);
    return null;
  }

  return resolution.conventions;
}

async function loadProjectConventionsPackage(
  rootDir: string,
  specifier: string,
  exportName: string | undefined,
  warnings: string[],
  currentSaltVersion: string | null,
  options?: {
    optional?: boolean;
  },
): Promise<ProjectConventions | null> {
  const resolution = await resolveProjectConventionsPackageLayer({
    rootDir,
    specifier,
    exportName,
    currentSaltVersion,
    optional: options?.optional,
  });
  if (resolution.status !== "resolved" || !resolution.conventions) {
    warnings.push(
      resolution.reason ??
        `Could not load project-conventions layer ${
          exportName ? `${specifier}#${exportName}` : specifier
        }.`,
    );
    return null;
  }

  if (resolution.compatibility?.status === "unsupported") {
    warnings.push(resolution.compatibility.reason);
    return null;
  }

  return resolution.conventions;
}

async function loadProjectConventionsStack(
  rootDir: string,
  stackConfigPath: string,
  canonical: CanonicalSaltResult,
  currentSaltVersion: string | null,
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
          currentSaltVersion,
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
        currentSaltVersion,
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

async function loadEffectiveProjectConventionsStack(input: {
  rootDir: string;
  stackConfigPath: string;
  currentSaltVersion: string | null;
  warnings: string[];
}): Promise<{
  conventions: ProjectConventions | null;
  layersConsulted: ProjectConventionsLayerReference[];
}> {
  let stack: ProjectConventionsStack | null = null;

  try {
    const parsed = JSON.parse(
      await fs.readFile(input.stackConfigPath, "utf8"),
    ) as unknown;
    if (isRecord(parsed)) {
      stack = parsed as ProjectConventionsStack;
    }
  } catch {
    stack = null;
  }

  if (!stack) {
    input.warnings.push(
      `Could not parse project-conventions stack at ${input.stackConfigPath}.`,
    );
    return {
      conventions: null,
      layersConsulted: [],
    };
  }

  const stackDir = path.dirname(input.stackConfigPath);
  const composed = await composeProjectConventionStack(stack, async (layer) => {
    if (layer.source.type === "file") {
      return loadProjectConventionsFile(
        path.resolve(stackDir, layer.source.path),
        input.warnings,
        input.currentSaltVersion,
        {
          optional: layer.optional === true,
        },
      );
    }

    return loadProjectConventionsPackage(
      input.rootDir,
      layer.source.specifier,
      layer.source.export,
      input.warnings,
      input.currentSaltVersion,
      {
        optional: layer.optional === true,
      },
    );
  });

  return {
    conventions: composed.conventions,
    layersConsulted: composed.layers_consulted,
  };
}

export async function loadCreateProjectConventionsSummary(input: {
  rootDir: string;
  policy: SaltInfoResult["policy"];
  salt: SaltInfoResult["salt"];
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
  const currentSaltVersion = deriveComparableSaltVersion({
    declaredVersion: input.salt.packageVersion,
    resolvedVersions: input.salt.installation.versionHealth.resolvedVersions,
    installedVersions: input.salt.installation.versionHealth.installedVersions,
  });

  if (input.policy.mode === "stack" && input.policy.stackConfigPath) {
    return loadProjectConventionsStack(
      input.rootDir,
      input.policy.stackConfigPath,
      canonical,
      currentSaltVersion,
      warnings,
    );
  }

  if (input.policy.teamConfigPath) {
    const teamConventions = await loadProjectConventionsFile(
      input.policy.teamConfigPath,
      warnings,
      currentSaltVersion,
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

export function toWorkflowProjectPolicySummary(input: {
  policy: SaltInfoResult["policy"];
  detailedSummary: WorkflowProjectConventionsSummary | null;
}): WorkflowProjectPolicySummary | null {
  const declared =
    Boolean(input.policy.teamConfigPath) ||
    Boolean(input.policy.stackConfigPath);
  const warnings = collectPolicyWarnings(input.policy);

  if (!declared && !input.detailedSummary && warnings.length === 0) {
    return null;
  }

  return toProjectPolicySummary({
    policyMode: input.policy.mode,
    declared,
    sharedPacks: [...input.policy.sharedConventions.packs],
    approvedWrappers: [...input.policy.approvedWrappers],
    warnings: unique([...(input.detailedSummary?.warnings ?? []), ...warnings]),
    layersConsulted: input.detailedSummary?.layersConsulted ?? [],
    conventions: input.detailedSummary
      ? {
          theme_defaults: toThemeDefaultsConvention(
            input.detailedSummary.themeDefaults,
          ),
          approved_wrappers:
            input.detailedSummary.appliedRule?.type === "approved-wrapper"
              ? [
                  {
                    name:
                      input.detailedSummary.appliedRule.replacement ??
                      input.detailedSummary.finalRecommendation ??
                      "",
                    wraps:
                      input.detailedSummary.appliedRule.wraps ??
                      input.detailedSummary.canonicalChoice.name ??
                      "",
                    reason: input.detailedSummary.appliedRule.reason,
                    import:
                      input.detailedSummary.appliedRule.import ?? undefined,
                    use_when: input.detailedSummary.appliedRule.useWhen,
                    avoid_when: input.detailedSummary.appliedRule.avoidWhen,
                    migration_shim:
                      input.detailedSummary.appliedRule.migrationShim,
                    docs: input.detailedSummary.appliedRule.docs,
                  },
                ]
              : undefined,
          token_aliases: input.detailedSummary.tokenAliases.map((entry) => ({
            salt_name: entry.saltName,
            prefer: entry.prefer,
            reason: entry.reason,
            docs: entry.sourceUrls,
          })),
          token_family_policies: input.detailedSummary.tokenFamilyPolicies.map(
            (entry) => ({
              family: entry.family,
              mode: entry.mode,
              reason: entry.reason,
              docs: entry.sourceUrls,
            }),
          ),
        }
      : null,
  });
}

export async function loadWorkflowProjectPolicySummary(input: {
  rootDir: string;
  policy: SaltInfoResult["policy"];
  salt: SaltInfoResult["salt"];
}): Promise<WorkflowProjectPolicySummary | null> {
  const declared =
    Boolean(input.policy.teamConfigPath) ||
    Boolean(input.policy.stackConfigPath);
  const warnings = collectPolicyWarnings(input.policy);

  if (!declared && warnings.length === 0) {
    return null;
  }

  const currentSaltVersion = deriveComparableSaltVersion({
    declaredVersion: input.salt.packageVersion,
    resolvedVersions: input.salt.installation.versionHealth.resolvedVersions,
    installedVersions: input.salt.installation.versionHealth.installedVersions,
  });

  let conventions: ProjectConventions | null = null;
  let layersConsulted: ProjectConventionsLayerReference[] = [];

  if (input.policy.mode === "stack" && input.policy.stackConfigPath) {
    const resolved = await loadEffectiveProjectConventionsStack({
      rootDir: input.rootDir,
      stackConfigPath: input.policy.stackConfigPath,
      currentSaltVersion,
      warnings,
    });
    conventions = resolved.conventions;
    layersConsulted = resolved.layersConsulted;
  } else if (input.policy.teamConfigPath) {
    const teamConventions = await loadProjectConventionsFile(
      input.policy.teamConfigPath,
      warnings,
      currentSaltVersion,
    );
    const composed = composeProjectConventionLayers(
      teamConventions
        ? [
            {
              id: "team-policy",
              scope: "team",
              source: "./team.json",
              conventions: teamConventions,
            },
          ]
        : [],
    );
    conventions = composed.conventions;
    layersConsulted = composed.layers_consulted;
  }

  return toProjectPolicySummary({
    policyMode: input.policy.mode,
    declared,
    sharedPacks: [...input.policy.sharedConventions.packs],
    approvedWrappers: [...input.policy.approvedWrappers],
    warnings,
    layersConsulted,
    conventions,
  });
}

export function buildProjectConventionsCheckSummary(input: {
  policy: SaltInfoResult["policy"];
  guidanceBoundaries: GuidanceBoundary[];
}): WorkflowProjectConventionsCheckSummary | null {
  const declared =
    Boolean(input.policy.teamConfigPath) ||
    Boolean(input.policy.stackConfigPath);
  const relevantBoundaries = input.guidanceBoundaries.filter(
    (boundary) => boundary.project_conventions.check_recommended,
  );
  const warnings = collectPolicyWarnings(input.policy);

  if (!declared && relevantBoundaries.length === 0 && warnings.length === 0) {
    return null;
  }

  const reasons =
    relevantBoundaries.length > 0
      ? unique(
          relevantBoundaries.map(
            (boundary) => boundary.project_conventions.reason,
          ),
        )
      : declared
        ? [
            "Repo policy is declared, but this workflow result did not require a project-conventions check by default.",
          ]
        : [];

  return {
    policyMode: input.policy.mode,
    declared,
    checkRecommended: relevantBoundaries.length > 0,
    reasons,
    topics: unique(
      relevantBoundaries.flatMap(
        (boundary) => boundary.project_conventions.topics,
      ),
    ),
    teamConfigPath: input.policy.teamConfigPath,
    stackConfigPath: input.policy.stackConfigPath,
    sharedPacks: [...input.policy.sharedConventions.packs],
    warnings,
  };
}
