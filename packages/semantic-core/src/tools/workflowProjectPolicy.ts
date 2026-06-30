export interface WorkflowProjectPolicyLayerReference {
  id: string;
  scope: string;
  source: string | null;
}

export interface WorkflowProjectPolicyImportReference {
  from: string;
  name: string;
}

export interface WorkflowProjectPolicyWrapperDetail {
  name: string;
  wraps: string;
  reason: string;
  import: WorkflowProjectPolicyImportReference | null;
  useWhen: string[];
  avoidWhen: string[];
  migrationShim: boolean;
  sourceUrls: string[];
}

export interface WorkflowProjectPolicyThemeDefaults {
  provider: string;
  providerImport: WorkflowProjectPolicyImportReference | null;
  imports: string[];
  props: Array<{
    name: string;
    value: string;
  }>;
  reason: string | null;
  sourceUrls: string[];
}

export interface WorkflowProjectPolicyTokenAlias {
  saltName: string;
  prefer: string;
  reason: string;
  sourceUrls: string[];
}

export interface WorkflowProjectPolicyTokenFamilyPolicy {
  family: string;
  mode: string;
  reason: string;
  sourceUrls: string[];
}

export interface WorkflowProjectPolicyArtifact {
  policyMode: "none" | "team" | "stack";
  declared: boolean;
  layersConsulted: WorkflowProjectPolicyLayerReference[];
  sharedPacks: string[];
  approvedWrappers: string[];
  approvedWrapperDetails: WorkflowProjectPolicyWrapperDetail[];
  themeDefaults: WorkflowProjectPolicyThemeDefaults | null;
  tokenAliases: WorkflowProjectPolicyTokenAlias[];
  tokenFamilyPolicies: WorkflowProjectPolicyTokenFamilyPolicy[];
  warnings: string[];
  sourceUrls: string[];
}

function getMissingProviderImportWarning(provider: string): string {
  return `Theme defaults declare custom provider ${provider} without provider_import metadata. Repo policy can describe that provider, but starter rewrites will not replace the default Salt bootstrap safely until provider_import is supplied.`;
}

export interface WorkflowProjectPolicyArtifactInput {
  policyMode: WorkflowProjectPolicyArtifact["policyMode"];
  declared: boolean;
  sharedPacks: string[];
  approvedWrappers: string[];
  approvedWrapperDetails?: Array<{
    name: string;
    wraps: string;
    reason: string;
    import?: {
      from: string;
      name: string;
    } | null;
    useWhen?: string[];
    avoidWhen?: string[];
    migrationShim?: boolean;
    sourceUrls?: string[];
  }>;
  warnings: string[];
  layersConsulted?: Array<{
    id: string;
    scope: string;
    source?: string | null;
  }>;
  themeDefaults?: {
    provider: string;
    providerImport?: {
      from: string;
      name: string;
    } | null;
    imports: string[];
    props: Array<{
      name: string;
      value: string;
    }>;
    reason: string | null;
    sourceUrls?: string[];
  } | null;
  tokenAliases?: Array<{
    saltName: string;
    prefer: string;
    reason: string;
    sourceUrls?: string[];
  }>;
  tokenFamilyPolicies?: Array<{
    family: string;
    mode: string;
    reason: string;
    sourceUrls?: string[];
  }>;
}

function unique(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

function isBuiltInSaltThemeProvider(provider: string): boolean {
  return provider === "SaltProvider" || provider === "SaltProviderNext";
}

export function getWorkflowProjectPolicyStarterBlockers(
  policy: WorkflowProjectPolicyArtifact | null | undefined,
): string[] {
  if (!policy?.themeDefaults) {
    return [];
  }

  return !policy.themeDefaults.providerImport &&
    !isBuiltInSaltThemeProvider(policy.themeDefaults.provider)
    ? [getMissingProviderImportWarning(policy.themeDefaults.provider)]
    : [];
}

export function buildWorkflowProjectPolicyArtifact(
  input: WorkflowProjectPolicyArtifactInput,
): WorkflowProjectPolicyArtifact {
  const layersConsulted = (input.layersConsulted ?? []).map((layer) => ({
    id: layer.id,
    scope: layer.scope,
    source: layer.source ?? null,
  }));
  const approvedWrapperDetails = (input.approvedWrapperDetails ?? []).map(
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
      useWhen: [...(entry.useWhen ?? [])],
      avoidWhen: [...(entry.avoidWhen ?? [])],
      migrationShim: entry.migrationShim === true,
      sourceUrls: unique(entry.sourceUrls ?? []),
    }),
  );
  const themeDefaults = input.themeDefaults
    ? {
        provider: input.themeDefaults.provider,
        providerImport: input.themeDefaults.providerImport
          ? {
              from: input.themeDefaults.providerImport.from,
              name: input.themeDefaults.providerImport.name,
            }
          : null,
        imports: [...input.themeDefaults.imports],
        props: input.themeDefaults.props.map((entry) => ({
          name: entry.name,
          value: entry.value,
        })),
        reason: input.themeDefaults.reason,
        sourceUrls: unique(input.themeDefaults.sourceUrls ?? []),
      }
    : null;
  const tokenAliases = (input.tokenAliases ?? []).map((entry) => ({
    saltName: entry.saltName,
    prefer: entry.prefer,
    reason: entry.reason,
    sourceUrls: unique(entry.sourceUrls ?? []),
  }));
  const tokenFamilyPolicies = (input.tokenFamilyPolicies ?? []).map(
    (entry) => ({
      family: entry.family,
      mode: entry.mode,
      reason: entry.reason,
      sourceUrls: unique(entry.sourceUrls ?? []),
    }),
  );
  const warnings = unique(input.warnings);
  if (themeDefaults) {
    warnings.push(
      ...getWorkflowProjectPolicyStarterBlockers({
        themeDefaults,
      } as WorkflowProjectPolicyArtifact),
    );
  }

  return {
    policyMode: input.policyMode,
    declared: input.declared,
    layersConsulted,
    sharedPacks: [...input.sharedPacks],
    approvedWrappers: unique([
      ...input.approvedWrappers,
      ...approvedWrapperDetails.map((entry) => entry.name),
    ]),
    approvedWrapperDetails,
    themeDefaults,
    tokenAliases,
    tokenFamilyPolicies,
    warnings: unique(warnings),
    sourceUrls: unique([
      ...layersConsulted.map((layer) => layer.source),
      ...approvedWrapperDetails.flatMap((entry) => entry.sourceUrls),
      ...(themeDefaults?.sourceUrls ?? []),
      ...tokenAliases.flatMap((entry) => entry.sourceUrls),
      ...tokenFamilyPolicies.flatMap((entry) => entry.sourceUrls),
    ]),
  };
}
