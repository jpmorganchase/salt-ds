import fs from "node:fs/promises";
import path from "node:path";
import { detectProjectPolicy } from "../policy/detection.js";
import { createSaltProjectFacts, type SaltProjectFacts } from "./projectFacts.js";
import {
  collectSaltInstallationDiagnostics,
  collectSaltPackages,
  detectSaltWorkspaceScope,
  inspectPackageJsonFile,
  type MarkerInspectionReason,
} from "./saltInstallation.js";

export type SaltProjectInspectionErrorCode =
  | "SALT_PROJECT_ROOT_NOT_DIRECTORY"
  | "SALT_PROJECT_ROOT_UNAVAILABLE";

export class SaltProjectInspectionError extends Error {
  readonly code: SaltProjectInspectionErrorCode;

  constructor(code: SaltProjectInspectionErrorCode, message: string) {
    super(message);
    this.name = "SaltProjectInspectionError";
    this.code = code;
  }
}

export interface InspectSaltProjectFactsInput {
  rootDir: string;
}

export interface InspectedSaltProjectFacts {
  facts: SaltProjectFacts;
  limitations: string[];
}

function portable(value: string): string {
  return value.replaceAll("\\", "/");
}

function manifestLimitation(reason: MarkerInspectionReason): string {
  return `SALT_PACKAGE_MANIFEST_${reason.toUpperCase()}`;
}

/**
 * Inspects one explicit project root using bounded, data-only package reads.
 * The root is canonicalized once and then acts as the filesystem authority;
 * project code, package-manager commands, PnP loaders, and plugins are never
 * executed.
 */
export async function inspectSaltProjectFacts(
  input: InspectSaltProjectFactsInput,
): Promise<InspectedSaltProjectFacts> {
  const requestedRoot = path.resolve(input.rootDir);
  let rootDir: string;
  let rootStats;
  try {
    rootDir = await fs.realpath(requestedRoot);
    rootStats = await fs.lstat(rootDir);
  } catch (error) {
    throw new SaltProjectInspectionError(
      "SALT_PROJECT_ROOT_UNAVAILABLE",
      `Project root is unavailable: ${portable(requestedRoot)}.`,
    );
  }
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
    throw new SaltProjectInspectionError(
      "SALT_PROJECT_ROOT_NOT_DIRECTORY",
      `Project root is not a canonical directory: ${portable(requestedRoot)}.`,
    );
  }

  const packageInspection = await inspectPackageJsonFile(
    path.join(rootDir, "package.json"),
    rootDir,
    rootDir,
  );
  const packageJson =
    packageInspection.status === "valid" ? packageInspection.value : null;
  const declaredSaltPackages = collectSaltPackages(packageJson);
  const workspaceScope = await detectSaltWorkspaceScope(rootDir, rootDir);
  const installation = await collectSaltInstallationDiagnostics(
    rootDir,
    declaredSaltPackages,
    { authorityRoot: rootDir, workspaceScope },
  );
  const detectedPolicy = await detectProjectPolicy(rootDir, rootDir);
  const limitations = [
    ...(packageInspection.status === "absent"
      ? ["SALT_PACKAGE_MANIFEST_ABSENT"]
      : packageInspection.status === "invalid"
        ? [manifestLimitation(packageInspection.reason)]
        : []),
    ...installation.inspection.limitations,
    ...installation.versionHealth.issues,
    ...detectedPolicy.markerIssues.map((issue) => issue.toUpperCase()),
  ];

  return {
    facts: createSaltProjectFacts({
      rootDir: portable(rootDir),
      packageManifest:
        packageInspection.status === "valid"
          ? {
              status: "valid",
              path: portable(packageInspection.path),
              name:
                typeof packageJson?.name === "string" ? packageJson.name : null,
              packageManager:
                typeof packageJson?.packageManager === "string"
                  ? packageJson.packageManager
                  : null,
            }
          : packageInspection.status === "invalid"
            ? {
                status: "invalid",
                path: portable(packageInspection.path),
                reason: packageInspection.reason,
              }
            : { status: "absent", path: null },
      declaredSaltPackages,
      installation: {
        ...installation,
        resolvedPackages: installation.resolvedPackages.map((entry) => ({
          ...entry,
          resolvedPath: entry.resolvedPath
            ? portable(entry.resolvedPath)
            : null,
        })),
        workspace: {
          ...installation.workspace,
          packageRoot: portable(installation.workspace.packageRoot),
          workspaceRoot: installation.workspace.workspaceRoot
            ? portable(installation.workspace.workspaceRoot)
            : null,
        },
      },
      detectedPolicy: {
        ...detectedPolicy,
        teamConfigPath: detectedPolicy.teamConfigPath
          ? portable(detectedPolicy.teamConfigPath)
          : null,
        stackConfigPath: detectedPolicy.stackConfigPath
          ? portable(detectedPolicy.stackConfigPath)
          : null,
      },
      policyEvaluation: null,
    }),
    limitations: [...new Set(limitations)].sort(),
  };
}
