import fs from "node:fs/promises";
import path from "node:path";
import {
  composeProjectConventionLayers,
  composeProjectConventionStack,
  type ProjectConventions,
  type ProjectConventionsLayerReference,
  type ProjectConventionsStack,
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
import type { SaltProjectContextData } from "./projectContext.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function collectPolicyWarnings(
  policy: SaltProjectContextData["policy"],
): string[] {
  const warnings: string[] = [];

  for (const layer of policy.stack_layers) {
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

  for (const detail of policy.shared_conventions.pack_details) {
    if (detail.reason) {
      warnings.push(detail.reason);
    }
    if (detail.compatibility && detail.compatibility.status !== "compatible") {
      warnings.push(detail.compatibility.reason);
    }
  }

  return unique(warnings);
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

export async function loadWorkflowProjectPolicyArtifactForContext(
  context: SaltProjectContextData,
): Promise<WorkflowProjectPolicyArtifact | null> {
  const declared =
    Boolean(context.policy.team_config_path) ||
    Boolean(context.policy.stack_config_path);
  const warnings = collectPolicyWarnings(context.policy);

  if (!declared && warnings.length === 0) {
    return null;
  }

  const currentSaltVersion = deriveComparableSaltVersion({
    declaredVersion: context.salt.package_version,
    resolvedVersions:
      context.salt.installation.version_health.resolved_versions,
    installedVersions:
      context.salt.installation.version_health.installed_versions,
  });

  let conventions: ProjectConventions | null = null;
  let layersConsulted: ProjectConventionsLayerReference[] = [];

  if (context.policy.mode === "stack" && context.policy.stack_config_path) {
    const resolved = await loadEffectiveProjectConventionsStack({
      rootDir: context.root_dir,
      stackConfigPath: context.policy.stack_config_path,
      currentSaltVersion,
      warnings,
    });
    conventions = resolved.conventions;
    layersConsulted = resolved.layersConsulted;
  } else if (context.policy.team_config_path) {
    const teamConventions = await loadProjectConventionsFile(
      context.policy.team_config_path,
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

  return buildWorkflowProjectPolicyArtifact({
    policyMode: context.policy.mode,
    declared,
    sharedPacks: [...context.policy.shared_conventions.packs],
    approvedWrappers:
      context.policy.approved_wrappers.length > 0
        ? [...context.policy.approved_wrappers]
        : (conventions?.approved_wrappers ?? []).map((entry) => entry.name),
    approvedWrapperDetails: (conventions?.approved_wrappers ?? []).map(
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
    warnings,
    layersConsulted,
    themeDefaults: conventions?.theme_defaults?.provider
      ? {
          provider: conventions.theme_defaults.provider,
          providerImport: conventions.theme_defaults.provider_import
            ? {
                from: conventions.theme_defaults.provider_import.from,
                name: conventions.theme_defaults.provider_import.name,
              }
            : null,
          imports: conventions.theme_defaults.imports ?? [],
          props: (conventions.theme_defaults.props ?? []).map((entry) => ({
            name: entry.name,
            value: entry.value,
          })),
          reason: conventions.theme_defaults.reason ?? null,
          sourceUrls: conventions.theme_defaults.docs ?? [],
        }
      : null,
    tokenAliases: (conventions?.token_aliases ?? []).map((entry) => ({
      saltName: entry.salt_name,
      prefer: entry.prefer,
      reason: entry.reason,
      sourceUrls: entry.docs ?? [],
    })),
    tokenFamilyPolicies: (conventions?.token_family_policies ?? []).map(
      (entry) => ({
        family: entry.family,
        mode: entry.mode,
        reason: entry.reason,
        sourceUrls: entry.docs ?? [],
      }),
    ),
  });
}
