import type { AnalyzeSaltCodeResult } from "../../semantic-core/src/index.js";

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
  registrySource: "explicit" | "installed-mcp" | "monorepo";
  packageVersion: string | null;
  targetCount: number;
  fileCount: number;
  targets: ResolvedLintTarget[];
  resolvedFiles: string[];
  files: Array<{
    path: string;
    relativePath: string;
    decision: AnalyzeSaltCodeResult["decision"];
    summary: AnalyzeSaltCodeResult["summary"];
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
        status: "resolved" | "missing" | "unreadable";
        resolvedPath: string | null;
        packageName: string | null;
        exportName: string | null;
        version: string | null;
        contract: string | null;
        project: string | null;
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
        status: "resolved" | "missing" | "unreadable";
        resolvedPath: string | null;
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
      source: "detected-default";
    }>;
  };
  registry: {
    available: boolean;
    source: "explicit" | "installed-mcp" | "monorepo" | null;
    registryDir: string | null;
    mcpPackageInstalled: boolean;
    canonicalTransport: "mcp" | "cli" | "unavailable";
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
