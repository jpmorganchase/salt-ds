import path from "node:path";
import {
  buildWorkflowProjectPolicyArtifact,
  composeProjectConventionLayers,
  composeProjectConventionStack,
  deriveComparableSaltVersion,
  type ProjectConventions,
  type ProjectConventionsLayerReference,
  type ProjectConventionsStack,
  readProjectConventionsStackFile,
  resolveProjectConventionsFileLayer,
  resolveProjectConventionsPackageLayer,
  type WorkflowProjectPolicyArtifact,
} from "../core/runtime.js";
import type { SaltProjectContextData } from "./projectContext.js";
import {
  type ProjectPolicyImportTargetDiagnostics,
  type ProjectPolicyImportTargetInput,
  validateProjectPolicyImportTargets,
} from "./projectPolicyImports.js";

type ProjectPolicySnapshot = Pick<
  SaltProjectContextData["policy"],
  | "team_config_path"
  | "stack_config_path"
  | "mode"
  | "stack_layers"
  | "shared_conventions"
>;

export interface WorkflowProjectPolicyInspection {
  artifact: WorkflowProjectPolicyArtifact | null;
  importTargets: ProjectPolicyImportTargetDiagnostics;
  blockingReasons: string[];
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function collectPolicyWarnings(policy: ProjectPolicySnapshot): string[] {
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
  rootDir: string,
  filePath: string,
  warnings: string[],
  currentSaltVersion: string | null,
  options?: {
    optional?: boolean;
  },
): Promise<ProjectConventions | null> {
  const resolution = await resolveProjectConventionsFileLayer({
    filePath,
    rootDir,
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
  const stackResolution = await readProjectConventionsStackFile({
    filePath: input.stackConfigPath,
    rootDir: input.rootDir,
  });
  const stack: ProjectConventionsStack | null = stackResolution.stack;

  if (!stack) {
    input.warnings.push(
      stackResolution.reason ??
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
        input.rootDir,
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

async function buildWorkflowProjectPolicyArtifactForContext(input: {
  rootDir: string;
  currentSaltVersion: string | null;
  policy: ProjectPolicySnapshot;
}): Promise<WorkflowProjectPolicyArtifact | null> {
  const declared =
    Boolean(input.policy.team_config_path) ||
    Boolean(input.policy.stack_config_path);
  const warnings = collectPolicyWarnings(input.policy);

  if (!declared && warnings.length === 0) {
    return null;
  }

  let conventions: ProjectConventions | null = null;
  let layersConsulted: ProjectConventionsLayerReference[] = [];

  if (input.policy.mode === "stack" && input.policy.stack_config_path) {
    const resolved = await loadEffectiveProjectConventionsStack({
      rootDir: input.rootDir,
      stackConfigPath: input.policy.stack_config_path,
      currentSaltVersion: input.currentSaltVersion,
      warnings,
    });
    conventions = resolved.conventions;
    layersConsulted = resolved.layersConsulted;
  } else if (input.policy.team_config_path) {
    const teamConventions = await loadProjectConventionsFile(
      input.rootDir,
      input.policy.team_config_path,
      warnings,
      input.currentSaltVersion,
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
    policyMode: input.policy.mode,
    declared,
    sharedPacks: [...input.policy.shared_conventions.packs],
    // Derive wrapper names from the conventions loaded for this inspection.
    // A context snapshot may outlive an edit to team.json; reusing its summary
    // here would let a removed wrapper continue to influence workflows.
    approvedWrappers: (conventions?.approved_wrappers ?? []).map(
      (entry) => entry.name,
    ),
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

function collectImportTargets(
  artifact: WorkflowProjectPolicyArtifact | null,
): ProjectPolicyImportTargetInput[] {
  if (!artifact) {
    return [];
  }

  return [
    ...artifact.approvedWrapperDetails.flatMap<ProjectPolicyImportTargetInput>(
      (wrapper) =>
        wrapper.import
          ? [
              {
                kind: "approved_wrapper",
                owner: wrapper.name,
                from: wrapper.import.from,
                name: wrapper.import.name,
              },
            ]
          : [],
    ),
    ...(artifact.themeDefaults?.providerImport
      ? [
          {
            kind: "theme_provider" as const,
            owner: artifact.themeDefaults.provider,
            from: artifact.themeDefaults.providerImport.from,
            name: artifact.themeDefaults.providerImport.name,
          },
        ]
      : []),
    ...(artifact.themeDefaults?.imports ?? []).map((specifier) => ({
      kind: "theme_import" as const,
      owner: artifact.themeDefaults?.provider ?? "theme defaults",
      from: specifier,
      name: null,
    })),
  ];
}

function withoutInvalidImportTargets(
  artifact: WorkflowProjectPolicyArtifact | null,
  diagnostics: ProjectPolicyImportTargetDiagnostics,
): WorkflowProjectPolicyArtifact | null {
  if (!artifact || diagnostics.blocking_count === 0) {
    return artifact;
  }

  const invalidWrappers = new Set(
    diagnostics.targets.flatMap((diagnostic) =>
      diagnostic.kind === "approved_wrapper" && diagnostic.status !== "resolved"
        ? [diagnostic.owner]
        : [],
    ),
  );
  const invalidThemeProvider = diagnostics.targets.some(
    (diagnostic) =>
      (diagnostic.kind === "theme_provider" ||
        diagnostic.kind === "theme_import") &&
      diagnostic.status !== "resolved",
  );

  return {
    ...artifact,
    approvedWrappers: artifact.approvedWrappers.filter(
      (wrapper) => !invalidWrappers.has(wrapper),
    ),
    approvedWrapperDetails: artifact.approvedWrapperDetails.filter(
      (wrapper) => !invalidWrappers.has(wrapper.name),
    ),
    themeDefaults: invalidThemeProvider ? null : artifact.themeDefaults,
    warnings: [
      ...new Set([...artifact.warnings, ...diagnostics.blocking_reasons]),
    ],
  };
}

export async function inspectWorkflowProjectPolicyArtifact(input: {
  rootDir: string;
  currentSaltVersion: string | null;
  policy: ProjectPolicySnapshot;
}): Promise<WorkflowProjectPolicyInspection> {
  const artifact = await buildWorkflowProjectPolicyArtifactForContext(input);
  const importTargets = await validateProjectPolicyImportTargets(
    input.rootDir,
    collectImportTargets(artifact),
  );
  const sanitizedArtifact = withoutInvalidImportTargets(
    artifact,
    importTargets,
  );

  return {
    artifact: sanitizedArtifact,
    importTargets,
    blockingReasons: unique([
      ...(artifact?.warnings ?? []),
      ...importTargets.blocking_reasons,
    ]),
  };
}

export async function inspectWorkflowProjectPolicyForContext(
  context: SaltProjectContextData,
): Promise<WorkflowProjectPolicyInspection> {
  const currentSaltVersion = deriveComparableSaltVersion({
    declaredVersion: context.salt.package_version,
    resolvedVersions:
      context.salt.installation.version_health.resolved_versions,
  });

  return inspectWorkflowProjectPolicyArtifact({
    rootDir: context.root_dir,
    currentSaltVersion,
    policy: context.policy,
  });
}
