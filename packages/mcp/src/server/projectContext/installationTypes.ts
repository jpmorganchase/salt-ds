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
