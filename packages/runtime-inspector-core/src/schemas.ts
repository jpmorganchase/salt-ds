import { z } from "zod";

export const diagnosticStatusSchema = z.enum(["pass", "warn", "fail", "info"]);

export const artifactDescriptorSchema = z.object({
  kind: z.string().min(1),
  path: z.string().min(1),
  label: z.string().min(1).optional(),
});

export const doctorCheckSchema = z.object({
  id: z.string().min(1),
  status: diagnosticStatusSchema,
  summary: z.string().min(1),
  details: z.string().min(1).optional(),
});

export const saltPackageDescriptorSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

export const resolvedSaltPackageDescriptorSchema = z.object({
  name: z.string().min(1),
  declaredVersion: z.string().min(1),
  resolvedVersion: z.string().min(1).nullable(),
  resolvedPath: z.string().min(1).nullable(),
  satisfiesDeclaredVersion: z.boolean().nullable(),
});

export const installedSaltPackageDescriptorSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  path: z.string().min(1),
});

export const saltPackageManagerInspectionSchema = z.object({
  packageManager: z.string().min(1),
  strategy: z.enum(["package-manager-command", "node-modules-scan"]),
  status: z.enum(["succeeded", "failed", "fallback"]),
  listCommand: z.string().min(1).nullable(),
  discoveredVersions: z.array(z.string().min(1)),
  error: z.string().min(1).nullable(),
  packageLayout: z.enum(["node-modules", "pnp", "unknown"]),
  limitations: z.array(z.string().min(1)),
  manifestOverrideFields: z.array(z.string().min(1)),
});

export const saltInstallationRemediationSchema = z.object({
  explainCommand: z.string().min(1).nullable(),
  dedupeCommand: z.string().min(1).nullable(),
  reinstallCommand: z.string().min(1).nullable(),
});

export const saltInstallationWorkspaceSchema = z.object({
  kind: z.enum(["single-package", "workspace-root", "workspace-package"]),
  packageRoot: z.string().min(1),
  workspaceRoot: z.string().min(1).nullable(),
  issueSourceHint: z.enum(["none", "package-local", "workspace-root", "mixed"]),
  workspaceSaltPackages: z.array(saltPackageDescriptorSchema),
  workspaceIssues: z.array(z.string().min(1)),
});

export const saltInstallationDuplicatePackageSchema = z.object({
  name: z.string().min(1),
  versions: z.array(z.string().min(1)),
  paths: z.array(z.string().min(1)),
  packageCount: z.number().int().positive(),
  versionCount: z.number().int().positive(),
});

export const saltInstallationHealthSummarySchema = z.object({
  health: z.enum(["pass", "warn", "fail"]),
  recommendedAction: z.enum([
    "none",
    "inspect-dependency-drift",
    "dedupe-salt-install",
    "reinstall-dependencies",
  ]),
  blockingWorkflows: z.array(z.enum(["review", "migrate", "upgrade"])),
  reasons: z.array(z.string().min(1)),
});

export const saltPackageVersionMismatchSchema = z.object({
  name: z.string().min(1),
  declaredVersion: z.string().min(1),
  resolvedVersion: z.string().min(1).nullable(),
  resolvedPath: z.string().min(1).nullable(),
});

export const saltPackageVersionHealthSchema = z.object({
  declaredVersions: z.array(z.string().min(1)),
  resolvedVersions: z.array(z.string().min(1)),
  installedVersions: z.array(z.string().min(1)),
  multipleDeclaredVersions: z.boolean(),
  multipleResolvedVersions: z.boolean(),
  multipleInstalledVersions: z.boolean(),
  mismatchedPackages: z.array(saltPackageVersionMismatchSchema),
  issues: z.array(z.string().min(1)),
});

export const saltInstallationDiagnosticsSchema = z.object({
  nodeModulesRoots: z.array(z.string().min(1)),
  resolvedPackages: z.array(resolvedSaltPackageDescriptorSchema),
  installedPackages: z.array(installedSaltPackageDescriptorSchema),
  versionHealth: saltPackageVersionHealthSchema,
  inspection: saltPackageManagerInspectionSchema,
  remediation: saltInstallationRemediationSchema,
  workspace: saltInstallationWorkspaceSchema,
  duplicatePackages: z.array(saltInstallationDuplicatePackageSchema),
  healthSummary: saltInstallationHealthSummarySchema,
});

export const doctorRuntimeTargetSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  source: z.enum(["user", "detected-default", "detected-script"]),
  reachable: z.boolean(),
  statusCode: z.number().int().nonnegative().optional(),
  contentType: z.string().optional(),
  error: z.string().min(1).optional(),
});

export const doctorPolicyLayerSchema = z.object({
  id: z.string().min(1),
  scope: z.enum(["line_of_business", "team", "repo", "other"]),
  sourceType: z.enum(["file", "package"]),
  source: z.string().min(1),
  optional: z.boolean(),
  status: z.enum(["resolved", "missing", "unreadable", "invalid"]),
  resolvedPath: z.string().min(1).nullable(),
  packageName: z.string().min(1).nullable(),
  exportName: z.string().min(1).nullable(),
  version: z.string().min(1).nullable(),
  packageVersion: z.string().min(1).nullable(),
  conventionsVersion: z.string().min(1).nullable(),
  contract: z.string().min(1).nullable(),
  project: z.string().min(1).nullable(),
  packId: z.string().min(1).nullable(),
  supportedSaltRange: z.string().min(1).nullable(),
  compatibility: z
    .object({
      status: z.enum([
        "compatible",
        "unsupported",
        "missing-range",
        "unknown-current-version",
        "invalid-range",
      ]),
      currentSaltVersion: z.string().min(1).nullable(),
      checkedVersion: z.string().min(1).nullable(),
      reason: z.string().min(1),
    })
    .nullable(),
  reason: z.string().min(1).nullable(),
});

export const doctorPolicyLayersSchema = z.object({
  teamConfigPath: z.string().min(1).nullable(),
  stackConfigPath: z.string().min(1).nullable(),
  layers: z.array(doctorPolicyLayerSchema),
});

export const doctorResultSchema = z.object({
  toolVersion: z.string().min(1),
  timestamp: z.string().min(1),
  rootDir: z.string().min(1),
  environment: z.object({
    os: z.string().min(1),
    nodeVersion: z.string().min(1),
    packageManager: z.string().min(1),
  }),
  saltPackages: z.array(saltPackageDescriptorSchema),
  saltInstallation: saltInstallationDiagnosticsSchema,
  repoSignals: z.object({
    storybookDetected: z.boolean(),
    appRuntimeDetected: z.boolean(),
    saltTeamConfigFound: z.boolean(),
    saltStackConfigFound: z.boolean(),
  }),
  runtimeTargets: z.array(doctorRuntimeTargetSchema),
  policyLayers: doctorPolicyLayersSchema,
  checks: z.array(doctorCheckSchema),
  artifacts: z.array(artifactDescriptorSchema),
  redactionsApplied: z.boolean(),
});

export const runtimeErrorSchema = z.object({
  kind: z.string().min(1),
  level: z.string().min(1).optional(),
  message: z.string().min(1),
});

export const roleSummarySchema = z.object({
  role: z.string().min(1),
  name: z.string(),
  count: z.number().int().nonnegative().optional(),
});

export const layoutBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
});

export const layoutComputedStyleSchema = z.object({
  display: z.string().min(1),
  position: z.string().min(1),
  justifyContent: z.string().min(1),
  alignItems: z.string().min(1),
  textAlign: z.string().min(1),
  overflowX: z.string().min(1),
  overflowY: z.string().min(1),
});

export const layoutAncestorSchema = z.object({
  selector: z.string().min(1),
  label: z.string().min(1),
  box: layoutBoxSchema,
  computedStyle: layoutComputedStyleSchema,
});

export const layoutNodeSchema = z.object({
  selector: z.string().min(1),
  label: z.string().min(1),
  role: z.string(),
  name: z.string(),
  box: layoutBoxSchema,
  computedStyle: layoutComputedStyleSchema,
  ancestorChain: z.array(layoutAncestorSchema),
  hints: z.array(z.string().min(1)),
});

export const layoutEvidenceSchema = z.object({
  available: z.boolean(),
  mode: z.enum(["computed-style", "unavailable"]),
  hints: z.array(z.string().min(1)),
  nodes: z.array(layoutNodeSchema),
});

export const runtimeInspectResultSchema = z.object({
  toolVersion: z.string().min(1),
  timestamp: z.string().min(1),
  inspectionMode: z.string().min(1),
  notes: z.array(z.string().min(1)),
  target: z.object({
    url: z.string().min(1),
  }),
  page: z.object({
    title: z.string(),
    loadState: z.string().min(1),
    statusCode: z.number().int().nonnegative(),
    contentType: z.string(),
  }),
  errors: z.array(runtimeErrorSchema),
  accessibility: z.object({
    roles: z.array(roleSummarySchema),
    landmarks: z.array(roleSummarySchema),
  }),
  structure: z.object({
    summary: z.array(z.string().min(1)),
  }),
  layout: layoutEvidenceSchema,
  screenshots: z.array(
    z.object({
      path: z.string().min(1),
      label: z.string().min(1),
    }),
  ),
  artifacts: z.array(artifactDescriptorSchema),
});

export type DiagnosticStatus = z.infer<typeof diagnosticStatusSchema>;
export type ArtifactDescriptor = z.infer<typeof artifactDescriptorSchema>;
export type DoctorCheck = z.infer<typeof doctorCheckSchema>;
export type SaltPackageDescriptor = z.infer<typeof saltPackageDescriptorSchema>;
export type ResolvedSaltPackageDescriptor = z.infer<
  typeof resolvedSaltPackageDescriptorSchema
>;
export type InstalledSaltPackageDescriptor = z.infer<
  typeof installedSaltPackageDescriptorSchema
>;
export type SaltPackageManagerInspection = z.infer<
  typeof saltPackageManagerInspectionSchema
>;
export type SaltInstallationRemediation = z.infer<
  typeof saltInstallationRemediationSchema
>;
export type SaltInstallationWorkspace = z.infer<
  typeof saltInstallationWorkspaceSchema
>;
export type SaltInstallationDuplicatePackage = z.infer<
  typeof saltInstallationDuplicatePackageSchema
>;
export type SaltInstallationHealthSummary = z.infer<
  typeof saltInstallationHealthSummarySchema
>;
export type SaltPackageVersionMismatch = z.infer<
  typeof saltPackageVersionMismatchSchema
>;
export type SaltPackageVersionHealth = z.infer<
  typeof saltPackageVersionHealthSchema
>;
export type SaltInstallationDiagnostics = z.infer<
  typeof saltInstallationDiagnosticsSchema
>;
export type DoctorRuntimeTarget = z.infer<typeof doctorRuntimeTargetSchema>;
export type DoctorPolicyLayer = z.infer<typeof doctorPolicyLayerSchema>;
export type DoctorPolicyLayers = z.infer<typeof doctorPolicyLayersSchema>;
export type DoctorResult = z.infer<typeof doctorResultSchema>;
export type RuntimeErrorRecord = z.infer<typeof runtimeErrorSchema>;
export type RoleSummary = z.infer<typeof roleSummarySchema>;
export type LayoutBox = z.infer<typeof layoutBoxSchema>;
export type LayoutComputedStyleSummary = z.infer<
  typeof layoutComputedStyleSchema
>;
export type LayoutAncestorSummary = z.infer<typeof layoutAncestorSchema>;
export type LayoutNodeSummary = z.infer<typeof layoutNodeSchema>;
export type LayoutEvidence = z.infer<typeof layoutEvidenceSchema>;
export type RuntimeInspectResult = z.infer<typeof runtimeInspectResultSchema>;

export function parseDoctorResult(value: unknown): DoctorResult {
  return doctorResultSchema.parse(value);
}

export function parseRuntimeInspectResult(
  value: unknown,
): RuntimeInspectResult {
  return runtimeInspectResultSchema.parse(value);
}
