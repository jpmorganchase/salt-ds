import type { ReviewSaltUiResult } from "@salt-ds/semantic-core/tools/reviewSaltUi";

export interface ParsedArgs {
  command: string;
  positionals: string[];
  flags: Record<string, string>;
}

export interface CliIo {
  cwd?: string;
  writeStdout?: (message: string) => void;
  writeStderr?: (message: string) => void;
}

export type RequiredCliIo = Required<CliIo>;

export interface ResolvedLintTarget {
  input: string;
  resolvedPath: string;
  kind: "file" | "directory";
  fileCount: number;
}

export interface LintCommandResult {
  rootDir: string;
  registryDir: string;
  registrySource: "explicit" | "bundled-cli" | "monorepo";
  packageVersion: string | null;
  targetCount: number;
  fileCount: number;
  targets: ResolvedLintTarget[];
  resolvedFiles: string[];
  files: Array<{
    path: string;
    relativePath: string;
    decision: ReviewSaltUiResult["decision"];
    guidanceBoundary: ReviewSaltUiResult["guidance_boundary"];
    summary: ReviewSaltUiResult["summary"];
    nextStep?: string;
    missingData: string[];
    sourceUrls: string[];
    issues?: Array<Record<string, unknown>>;
    fixes?: Array<Record<string, unknown>>;
    migrations?: Array<Record<string, unknown>>;
  }>;
  summary: {
    cleanFiles: number;
    filesNeedingAttention: number;
    errors: number;
    warnings: number;
    infos: number;
    fixCount: number;
    migrationCount: number;
  };
  notes: string[];
}

export interface SaltInfoResult {
  toolVersion: string;
  timestamp: string;
  rootDir: string;
  packageJsonPath: string | null;
  environment: {
    os: string;
    nodeVersion: string;
    packageManager: string;
  };
  framework: {
    name: "next" | "vite-react" | "vite" | "react" | "unknown";
    evidence: string[];
  };
  workspace: {
    kind: "single-package" | "workspace-root" | "workspace-package" | "unknown";
    workspaceRoot: string | null;
  };
  salt: {
    packages: Array<{
      name: string;
      version: string;
    }>;
    packageVersion: string | null;
    installation: {
      nodeModulesRoots: string[];
      resolvedPackages: Array<{
        name: string;
        declaredVersion: string;
        resolvedVersion: string | null;
        resolvedPath: string | null;
        satisfiesDeclaredVersion: boolean | null;
      }>;
      installedPackages: Array<{
        name: string;
        version: string;
        path: string;
      }>;
      versionHealth: {
        declaredVersions: string[];
        resolvedVersions: string[];
        installedVersions: string[];
        multipleDeclaredVersions: boolean;
        multipleResolvedVersions: boolean;
        multipleInstalledVersions: boolean;
        mismatchedPackages: Array<{
          name: string;
          declaredVersion: string;
          resolvedVersion: string | null;
          resolvedPath: string | null;
        }>;
        issues: string[];
      };
      inspection: {
        packageManager: string;
        strategy: "package-manager-command" | "node-modules-scan";
        status: "succeeded" | "failed" | "fallback";
        listCommand: string | null;
        discoveredVersions: string[];
        error: string | null;
        packageLayout: "node-modules" | "pnp" | "unknown";
        limitations: string[];
        manifestOverrideFields: string[];
      };
      remediation: {
        explainCommand: string | null;
        dedupeCommand: string | null;
        reinstallCommand: string | null;
      };
      workspace: {
        kind: "single-package" | "workspace-root" | "workspace-package";
        packageRoot: string;
        workspaceRoot: string | null;
        issueSourceHint: "none" | "package-local" | "workspace-root" | "mixed";
        workspaceSaltPackages: Array<{
          name: string;
          version: string;
        }>;
        workspaceIssues: string[];
      };
      duplicatePackages: Array<{
        name: string;
        versions: string[];
        paths: string[];
        packageCount: number;
        versionCount: number;
      }>;
      healthSummary: {
        health: "pass" | "warn" | "fail";
        recommendedAction:
          | "none"
          | "inspect-dependency-drift"
          | "dedupe-salt-install"
          | "reinstall-dependencies";
        blockingWorkflows: Array<"review" | "migrate" | "upgrade">;
        reasons: string[];
      };
    };
  };
  repoSignals: {
    storybookDetected: boolean;
    appRuntimeDetected: boolean;
    saltTeamConfigFound: boolean;
    saltStackConfigFound: boolean;
  };
  repoInstructions: {
    path: string | null;
    filename: "AGENTS.md" | "CLAUDE.md" | null;
  };
  policy: {
    teamConfigPath: string | null;
    stackConfigPath: string | null;
    mode: "none" | "team" | "stack";
    approvedWrappers: string[];
    stackLayers: Array<{
      id: string;
      scope: "line_of_business" | "team" | "repo" | "other";
      sourceType: "file" | "package";
      source: string;
      optional: boolean;
      resolution: {
        status: "resolved" | "missing" | "unreadable" | "invalid";
        resolvedPath: string | null;
        packageName: string | null;
        exportName: string | null;
        version: string | null;
        packageVersion: string | null;
        conventionsVersion: string | null;
        contract: string | null;
        project: string | null;
        packId: string | null;
        supportedSaltRange: string | null;
        compatibility: {
          status:
            | "compatible"
            | "unsupported"
            | "missing-range"
            | "unknown-current-version"
            | "invalid-range";
          currentSaltVersion: string | null;
          checkedVersion: string | null;
          reason: string;
        } | null;
        reason: string | null;
      };
    }>;
    sharedConventions: {
      enabled: boolean;
      packCount: number;
      packs: string[];
      packDetails: Array<{
        id: string;
        source: string;
        packageName: string | null;
        exportName: string | null;
        version: string | null;
        packageVersion: string | null;
        conventionsVersion: string | null;
        packId: string | null;
        supportedSaltRange: string | null;
        status: "resolved" | "missing" | "unreadable" | "invalid";
        compatibility: {
          status:
            | "compatible"
            | "unsupported"
            | "missing-range"
            | "unknown-current-version"
            | "invalid-range";
          currentSaltVersion: string | null;
          checkedVersion: string | null;
          reason: string;
        } | null;
        resolvedPath: string | null;
        reason: string | null;
      }>;
    };
  };
  imports: {
    tsconfigPath: string | null;
    aliases: Array<{
      alias: string;
      targets: string[];
    }>;
  };
  runtime: {
    storybookDetected: boolean;
    appRuntimeDetected: boolean;
    detectedTargets: Array<{
      label: "storybook" | "app-runtime";
      url: string;
      source: "detected-default" | "detected-script";
    }>;
  };
  registry: {
    available: boolean;
    source: "explicit" | "bundled-cli" | "monorepo" | null;
    registryDir: string | null;
    mcpPackageInstalled: boolean;
    canonicalTransport: "cli" | "unavailable";
  };
  workflows: {
    bootstrapConventions: boolean;
    create: boolean;
    review: boolean;
    migrate: boolean;
    upgrade: boolean;
    runtimeEvidence: boolean;
  };
  notes: string[];
}
