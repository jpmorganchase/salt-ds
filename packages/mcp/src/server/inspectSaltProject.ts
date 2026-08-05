import path from "node:path";
import {
  deriveComparableSaltVersion,
  detectProjectPolicy,
  jsonUtf8Bytes,
  MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
  MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES,
  nonSearchToolResultUtf8Bytes,
  normalizeCatalogPublicCitation,
  type ResultBudgetOmission,
} from "../core/runtime.js";
import {
  authorizeProjectRoot,
  type ProjectAccessPolicy,
} from "./projectAccess.js";
import {
  collectSaltInstallationDiagnostics,
  collectSaltPackages,
  detectSaltWorkspaceScope,
  inspectPackageJsonFile,
} from "./projectContext/saltInstallation.js";
import { inspectProjectPolicy } from "./projectPolicyInspection.js";
import { createProjectPolicySnapshot } from "./projectPolicySnapshot.js";
import type { ProjectPolicySnapshotCache } from "./projectPolicySnapshot.js";

export interface InspectSaltProjectInput {
  root_dir?: string;
  include_policy_ir?: boolean;
}

function portable(value: string | null): string | null {
  return value?.replaceAll("\\", "/") ?? null;
}

const MAX_PUBLIC_PATH_JSON_UTF8_BYTES = 1_024;
const MAX_PUBLIC_NAME_JSON_UTF8_BYTES = 512;
const MAX_PUBLIC_VALUE_JSON_UTF8_BYTES = 256;
const MAX_PUBLIC_LIMITATION_JSON_UTF8_BYTES = 512;
const PUBLIC_PACKAGE_MANAGERS = new Set(["npm", "yarn", "pnpm", "bun"]);

function wholeStringWithinBudget(
  value: string | null,
  maxJsonUtf8Bytes: number,
  omission: ResultBudgetOmission,
): string | null {
  if (value === null) return null;
  omission.available = 1;
  if (jsonUtf8Bytes(value) > maxJsonUtf8Bytes) return null;
  omission.returned = 1;
  return value;
}

function stringFitsBudget(
  value: string | null,
  maxJsonUtf8Bytes: number,
): boolean {
  return value === null || jsonUtf8Bytes(value) <= maxJsonUtf8Bytes;
}

function appendWithinBudget<T>(
  response: unknown,
  target: T[],
  values: readonly T[],
  omission: ResultBudgetOmission,
  canInclude: (value: T) => boolean = () => true,
): void {
  omission.available = values.length;
  for (const value of values) {
    if (!canInclude(value)) continue;
    target.push(value);
    omission.returned += 1;
    if (
      jsonUtf8Bytes(response) >
        MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES - 1_024 ||
      nonSearchToolResultUtf8Bytes(response) >
        MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES - 1_024
    ) {
      target.pop();
      omission.returned -= 1;
    }
  }
}

export async function inspectSaltProject(
  input: InspectSaltProjectInput,
  accessPolicy: ProjectAccessPolicy,
  projectPolicySnapshots?: ProjectPolicySnapshotCache,
) {
  const limitations: string[] = [];
  const authorization = await authorizeProjectRoot(
    accessPolicy,
    input.root_dir,
  );
  if (authorization.status === "denied") {
    const reason = {
      no_allowed_roots:
        "Project inspection is disabled because the embedded server has no configured allowed roots.",
      no_default_root:
        "Project inspection requires root_dir because the embedded server has multiple allowed roots and no configured default.",
      outside_allowed_roots:
        "The requested project root is outside the server-configured allowed roots after realpath resolution.",
      unavailable:
        "The requested project root is unavailable within the configured project authority.",
      not_directory: "The requested project root is not a directory.",
    }[authorization.reason];
    return {
      data: {
        root_dir: null,
        package_manifest: null,
        workspace: null,
        installation: null,
        policy: null,
      },
      scope: {
        kind: "configured_project_inspection" as const,
        filesystem_access: "read_only" as const,
        inspected_root: null,
        authorization: accessPolicy.mode,
      },
      coverage: {
        requested_root: "denied" as const,
        package_manifest: "not_evaluated" as const,
        installation: "not_evaluated" as const,
        workspace: "not_evaluated" as const,
        policy: "not_evaluated" as const,
        result_budget: {
          max_utf8_bytes: MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
          truncated: false,
          omissions: [],
        },
      },
      limitations: [reason],
      provenance: { project_policy_digest: null },
    };
  }
  const rootDir = authorization.rootDir;

  const packageJsonPath = path.join(rootDir, "package.json");
  const packageInspection = await inspectPackageJsonFile(
    packageJsonPath,
    rootDir,
    authorization.authorityRoot,
  );
  const packageJson =
    packageInspection.status === "valid" ? packageInspection.value : null;
  if (packageInspection.status === "invalid") {
    limitations.push(
      `The package manifest could not be inspected (${packageInspection.reason}).`,
    );
  } else if (packageInspection.status === "absent") {
    limitations.push("No package.json exists at the requested project root.");
  }

  const declaredSaltPackages = collectSaltPackages(packageJson);
  const workspaceScope = await detectSaltWorkspaceScope(
    rootDir,
    authorization.authorityRoot,
  );
  const installation = await collectSaltInstallationDiagnostics(
    rootDir,
    declaredSaltPackages,
    {
      authorityRoot: authorization.authorityRoot,
      workspaceScope,
    },
  );
  const currentSaltVersion = deriveComparableSaltVersion({
    resolvedPackages: installation.resolvedPackages,
  });
  const detectedPolicy = await detectProjectPolicy(
    rootDir,
    authorization.authorityRoot,
  );
  const policyInspection =
    input.include_policy_ir === false
      ? null
      : await inspectProjectPolicy({
          rootDir,
          authorityRoot: authorization.authorityRoot,
          currentSaltVersion,
          policy: detectedPolicy,
        });
  limitations.push(
    ...installation.inspection.limitations,
    ...installation.versionHealth.issues,
    ...(policyInspection?.limitations ?? []),
  );

  const policyIr = policyInspection?.ir ?? null;
  const policySnapshot = policyInspection
    ? createProjectPolicySnapshot({
        authorization,
        inspection: policyInspection,
        saltVersion: currentSaltVersion,
      })
    : null;
  if (policySnapshot) projectPolicySnapshots?.remember(policySnapshot);
  const policyImportTargets = policyInspection?.import_targets ?? null;
  const omissions: ResultBudgetOmission[] = [
    "root_dir",
    "package_manifest.path",
    "package_manifest.name",
    "workspace.workspace_root",
    "policy.team_config_path",
    "policy.stack_config_path",
    "limitations",
    "installation.resolved_packages",
    "policy.ir",
    "policy.import_targets",
  ].map((section) => ({ section, available: 0, returned: 0 }));
  const omission = (section: string) =>
    omissions.find((entry) => entry.section === section)!;
  const publicRootDir = wholeStringWithinBudget(
    portable(rootDir),
    MAX_PUBLIC_PATH_JSON_UTF8_BYTES,
    omission("root_dir"),
  );
  const publicPackagePath =
    packageInspection.status === "valid"
      ? wholeStringWithinBudget(
          portable(packageInspection.path),
          MAX_PUBLIC_PATH_JSON_UTF8_BYTES,
          omission("package_manifest.path"),
        )
      : null;
  const rawPackageName =
    typeof packageJson?.name === "string" ? packageJson.name : null;
  const publicPackageName = publicPackagePath
    ? wholeStringWithinBudget(
        rawPackageName,
        MAX_PUBLIC_NAME_JSON_UTF8_BYTES,
        omission("package_manifest.name"),
      )
    : null;
  if (!publicPackagePath && rawPackageName !== null) {
    omission("package_manifest.name").available = 1;
  }
  const observedPackageManager = installation.inspection.packageManager;
  const publicPackageManager = PUBLIC_PACKAGE_MANAGERS.has(
    observedPackageManager,
  )
    ? observedPackageManager
    : "unknown";
  if (publicPackageManager !== observedPackageManager) {
    limitations.push(
      "The declared package manager was not one of npm, yarn, pnpm, or bun and is reported as unknown.",
    );
  }
  const publicWorkspaceRoot = wholeStringWithinBudget(
    portable(installation.workspace.workspaceRoot),
    MAX_PUBLIC_PATH_JSON_UTF8_BYTES,
    omission("workspace.workspace_root"),
  );
  const publicTeamConfigPath = wholeStringWithinBudget(
    portable(detectedPolicy.teamConfigPath),
    MAX_PUBLIC_PATH_JSON_UTF8_BYTES,
    omission("policy.team_config_path"),
  );
  const publicStackConfigPath = wholeStringWithinBudget(
    portable(detectedPolicy.stackConfigPath),
    MAX_PUBLIC_PATH_JSON_UTF8_BYTES,
    omission("policy.stack_config_path"),
  );
  const response = {
    data: {
      root_dir: publicRootDir,
      package_manifest:
        packageInspection.status === "valid" && publicPackagePath
          ? {
              path: publicPackagePath,
              name: publicPackageName,
              package_manager: publicPackageManager,
            }
          : null,
      workspace: {
        kind: installation.workspace.kind,
        workspace_root: publicWorkspaceRoot,
      },
      installation: {
        assessment: {
          status:
            packageInspection.status !== "valid" ||
            declaredSaltPackages.length === 0
              ? ("not_observed" as const)
              : installation.versionHealth.unverifiablePackages.length > 0
                ? ("unverifiable" as const)
                : installation.inspection.status === "limited"
                  ? ("limited" as const)
                  : installation.versionHealth.issues.length > 0
                    ? ("advisory_issues" as const)
                    : ("verified_healthy" as const),
          blocking: false as const,
          advisory_issue_count: installation.versionHealth.issues.length,
          unverifiable_package_count:
            installation.versionHealth.unverifiablePackages.length,
        },
        resolved_packages: [] as Array<{
          name: string;
          declared_version: string;
          effective_declared_version: string | null;
          declaration_resolution: "verified" | "unverifiable";
          resolved_version: string | null;
          resolved_path: string | null;
          satisfies_declared_version: boolean | null;
        }>,
      },
      policy: {
        mode: detectedPolicy.mode,
        team_config_path: publicTeamConfigPath,
        stack_config_path: publicStackConfigPath,
        ir: policyIr
          ? {
              contract: policyIr.contract,
              policy_mode: policyIr.policy_mode,
              declared: policyIr.declared,
              digest: policySnapshot!.digest!,
              manifest_uri: normalizeCatalogPublicCitation({
                kind: "project_policy_resource",
                rootDir,
                digest: policySnapshot!.digest!,
                resourceKind: "manifest",
              }),
              counts: {
                layers: policyIr.layers.length,
                occurrences: policyIr.occurrences.length,
                diagnostics: policyIr.diagnostics.length,
              },
              untrusted_ir: null as null | {
                encoding: "json";
                text: string;
              },
            }
          : null,
        import_targets: policyImportTargets
          ? {
              status: policyImportTargets.status,
              declared_count: policyImportTargets.declared_count,
              resolved_count: policyImportTargets.resolved_count,
              issue_count: policyImportTargets.issue_count,
              untrusted_diagnostics: null as null | {
                encoding: "json";
                text: string;
              },
            }
          : null,
      },
    },
    scope: {
      kind: "configured_project_inspection" as const,
      filesystem_access: "read_only" as const,
      inspected_root: publicRootDir,
      authorization: authorization.mode,
    },
    coverage: {
      requested_root: "evaluated" as const,
      package_manifest: packageInspection.status,
      installation: "evaluated" as const,
      workspace: "evaluated" as const,
      policy:
        input.include_policy_ir === false
          ? ("detection_only" as const)
          : ("policy_ir_evaluated" as const),
      result_budget: {
        max_utf8_bytes: MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
        truncated: false,
        omissions,
      },
    },
    limitations: [] as string[],
    provenance: {
      project_policy_digest: policySnapshot?.digest ?? null,
    },
  };

  appendWithinBudget(
    response,
    response.limitations,
    [...new Set(limitations)],
    omission("limitations"),
    (value) => stringFitsBudget(value, MAX_PUBLIC_LIMITATION_JSON_UTF8_BYTES),
  );
  appendWithinBudget(
    response,
    response.data.installation.resolved_packages,
    installation.resolvedPackages.map((entry) => ({
      name: entry.name,
      declared_version: entry.declaredVersion,
      effective_declared_version: entry.effectiveDeclaredVersion,
      declaration_resolution: entry.declarationResolution,
      resolved_version: entry.resolvedVersion,
      resolved_path: portable(entry.resolvedPath),
      satisfies_declared_version: entry.satisfiesDeclaredVersion,
    })),
    omission("installation.resolved_packages"),
    (entry) =>
      stringFitsBudget(entry.name, MAX_PUBLIC_VALUE_JSON_UTF8_BYTES) &&
      stringFitsBudget(
        entry.declared_version,
        MAX_PUBLIC_VALUE_JSON_UTF8_BYTES,
      ) &&
      stringFitsBudget(
        entry.effective_declared_version,
        MAX_PUBLIC_VALUE_JSON_UTF8_BYTES,
      ) &&
      stringFitsBudget(
        entry.resolved_version,
        MAX_PUBLIC_VALUE_JSON_UTF8_BYTES,
      ) &&
      stringFitsBudget(entry.resolved_path, MAX_PUBLIC_PATH_JSON_UTF8_BYTES),
  );
  if (policyIr && response.data.policy.ir) {
    const irOmission = omission("policy.ir");
    irOmission.available = 1;
    response.data.policy.ir.untrusted_ir = {
      encoding: "json",
      text: JSON.stringify(policyIr),
    };
    irOmission.returned = 1;
    if (
      jsonUtf8Bytes(response) >
        MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES - 1_024 ||
      nonSearchToolResultUtf8Bytes(response) >
        MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES - 1_024
    ) {
      response.data.policy.ir.untrusted_ir = null;
      irOmission.returned = 0;
    }
  }
  if (policyImportTargets && response.data.policy.import_targets) {
    const targetsOmission = omission("policy.import_targets");
    targetsOmission.available = 1;
    response.data.policy.import_targets.untrusted_diagnostics = {
      encoding: "json",
      text: JSON.stringify({
        targets: policyImportTargets.targets,
        diagnostic_reasons: policyImportTargets.diagnostic_reasons,
      }),
    };
    targetsOmission.returned = 1;
    if (
      jsonUtf8Bytes(response) >
        MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES - 1_024 ||
      nonSearchToolResultUtf8Bytes(response) >
        MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES - 1_024
    ) {
      response.data.policy.import_targets.untrusted_diagnostics = null;
      targetsOmission.returned = 0;
    }
  }

  response.coverage.result_budget.omissions = omissions.filter(
    (entry) => entry.returned < entry.available,
  );
  response.coverage.result_budget.truncated =
    response.coverage.result_budget.omissions.length > 0;
  if (response.coverage.result_budget.truncated) {
    response.limitations.push(
      "Some inspected facts were omitted from the public response because of the aggregate result budget; coverage.result_budget records exact available and returned counts.",
    );
  }
  if (jsonUtf8Bytes(response) > MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES) {
    throw new Error(
      "inspect_salt_project could not fit its mandatory result skeleton within the structured-content budget.",
    );
  }
  if (
    nonSearchToolResultUtf8Bytes(response) > MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES
  ) {
    throw new Error(
      "inspect_salt_project could not fit its mandatory result skeleton within the public wire budget.",
    );
  }
  return response;
}
