import type { DetectedProjectPolicy } from "../policy/detection.js";
import type { SaltProjectPolicyIrV2 } from "../policy/projectPolicyIr.js";

export interface SaltPackageDescriptor {
  name: string;
  version: string;
}

export interface ResolvedSaltPackageDescriptor {
  name: string;
  declaredVersion: string;
  effectiveDeclaredVersion: string | null;
  declarationResolution: "verified" | "unverifiable";
  resolvedVersion: string | null;
  resolvedPath: string | null;
  satisfiesDeclaredVersion: boolean | null;
}

export interface SaltPackageManagerInspection {
  packageManager: string;
  packageManagerDetectionStatus:
    | "declared"
    | "marker"
    | "absent"
    | "ambiguous"
    | "invalid"
    | "provided";
  strategy: "manifest-resolution";
  status: "succeeded" | "limited";
  packageLayout: "node-modules" | "pnp" | "unknown";
  limitations: string[];
  manifestOverrideFields: string[];
}

export interface SaltInstallationWorkspace {
  kind: "single-package" | "workspace-root" | "workspace-package";
  packageRoot: string;
  workspaceRoot: string | null;
  issueSourceHint: "none" | "package-local" | "workspace-root" | "mixed";
  workspaceSaltPackages: SaltPackageDescriptor[];
  workspaceIssues: string[];
}

export interface SaltPackageVersionMismatch {
  name: string;
  declaredVersion: string;
  resolvedVersion: string | null;
  resolvedPath: string | null;
}

export interface SaltPackageVersionHealth {
  declaredVersions: string[];
  resolvedVersions: string[];
  multipleDeclaredVersions: boolean;
  multipleResolvedVersions: boolean;
  mismatchedPackages: SaltPackageVersionMismatch[];
  unverifiablePackages: SaltPackageVersionMismatch[];
  issues: string[];
}

export interface SaltInstallationDiagnostics {
  resolvedPackages: ResolvedSaltPackageDescriptor[];
  versionHealth: SaltPackageVersionHealth;
  inspection: SaltPackageManagerInspection;
  workspace: SaltInstallationWorkspace;
}

export interface SaltProjectFactsInput {
  rootDir: string;
  packageManifest:
    | { status: "absent"; path: null }
    | { status: "invalid"; path: string; reason: string }
    | {
        status: "valid";
        path: string;
        name: string | null;
        packageManager: string | null;
      };
  declaredSaltPackages: readonly SaltPackageDescriptor[];
  installation: SaltInstallationDiagnostics;
  detectedPolicy: DetectedProjectPolicy;
  policyEvaluation: {
    ir: SaltProjectPolicyIrV2;
    limitations: readonly string[];
  } | null;
}

/**
 * Complete protocol-neutral facts collected after a caller has authorized and
 * bounded the filesystem reads. This projection grants no path authority and
 * contains no snapshot handle, resource URI, transport error, or response
 * budget decision.
 */
export function createSaltProjectFacts(input: SaltProjectFactsInput) {
  return {
    schema_version: "1.0.0" as const,
    root_dir: input.rootDir,
    package_manifest: input.packageManifest,
    declared_salt_packages: [...input.declaredSaltPackages]
      .map((entry) => ({ ...entry }))
      .sort(
        (left, right) =>
          left.name.localeCompare(right.name) ||
          left.version.localeCompare(right.version),
      ),
    installation: input.installation,
    workspace: input.installation.workspace,
    policy: {
      detection: {
        mode: input.detectedPolicy.mode,
        team_config_path: input.detectedPolicy.teamConfigPath,
        stack_config_path: input.detectedPolicy.stackConfigPath,
      },
      evaluation: input.policyEvaluation,
    },
  };
}

export type SaltProjectFacts = ReturnType<typeof createSaltProjectFacts>;
