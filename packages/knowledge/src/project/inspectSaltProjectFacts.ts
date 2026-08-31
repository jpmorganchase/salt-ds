import type { Stats } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import {
  createSaltProjectFacts,
  type SaltProjectFacts,
} from "./projectFacts.js";
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
  /** Canonical filesystem authority. Defaults to the inspected root. */
  authorityRoot?: string;
}

export interface InspectedSaltProjectFacts {
  facts: SaltProjectFacts;
  limitations: string[];
}

function portable(value: string): string {
  return value.replaceAll("\\", "/");
}

function isPathInside(rootDir: string, candidatePath: string): boolean {
  const relative = path.relative(rootDir, candidatePath);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
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
  const requestedAuthorityRoot = path.resolve(
    input.authorityRoot ?? requestedRoot,
  );
  let rootDir: string;
  let authorityRoot: string;
  let rootStats: Stats;
  try {
    authorityRoot = await fs.realpath(requestedAuthorityRoot);
    rootDir = await fs.realpath(requestedRoot);
    rootStats = await fs.lstat(rootDir);
  } catch {
    throw new SaltProjectInspectionError(
      "SALT_PROJECT_ROOT_UNAVAILABLE",
      "The project root is unavailable.",
    );
  }
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
    throw new SaltProjectInspectionError(
      "SALT_PROJECT_ROOT_NOT_DIRECTORY",
      "The project root must be a canonical directory.",
    );
  }
  if (!isPathInside(authorityRoot, rootDir)) {
    throw new SaltProjectInspectionError(
      "SALT_PROJECT_ROOT_UNAVAILABLE",
      "The project root is outside its filesystem authority.",
    );
  }

  const packageInspection = await inspectPackageJsonFile(
    path.join(rootDir, "package.json"),
    rootDir,
    authorityRoot,
  );
  const packageJson =
    packageInspection.status === "valid" ? packageInspection.value : null;
  const declaredSaltPackages = collectSaltPackages(packageJson);
  const workspaceScope = await detectSaltWorkspaceScope(rootDir, authorityRoot);
  const installation = await collectSaltInstallationDiagnostics(
    rootDir,
    declaredSaltPackages,
    { authorityRoot, workspaceScope },
  );
  const limitations = [
    ...(packageInspection.status === "absent"
      ? ["SALT_PACKAGE_MANIFEST_ABSENT"]
      : packageInspection.status === "invalid"
        ? [manifestLimitation(packageInspection.reason)]
        : []),
    ...installation.inspection.limitations,
    ...installation.versionHealth.issues,
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
    }),
    limitations: [...new Set(limitations)].sort(),
  };
}
