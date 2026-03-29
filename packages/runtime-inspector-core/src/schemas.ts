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

export const doctorRuntimeTargetSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  source: z.enum(["user", "detected-default"]),
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
  status: z.enum(["resolved", "missing", "unreadable"]),
  resolvedPath: z.string().min(1).nullable(),
  packageName: z.string().min(1).nullable(),
  exportName: z.string().min(1).nullable(),
  version: z.string().min(1).nullable(),
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
