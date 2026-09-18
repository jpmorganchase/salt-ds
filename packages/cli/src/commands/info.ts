import path from "node:path";
import {
  type PackageCompatibilityDecision,
  resolveKnowledgeCompatibility,
} from "@salt-ds/knowledge";
import { loadRetrievalRuntime } from "./retrievalRuntime.js";

export interface RunInfoCommandInput {
  rootDir: string;
  cliVersion: string;
}

const UNSAFE_INFO_PATH_LIMITATION = "SALT_INFO_PATH_NOT_PORTABLE";

function createProjectPathProjection(
  selectedRoot: string,
  pathLimitations: Set<string>,
) {
  const authorityRoot = path.resolve(selectedRoot);

  return (observedPath: string | null): string | null => {
    if (observedPath === null) return null;
    const nativeAbsolute = path.isAbsolute(observedPath);
    if (
      observedPath.includes("\0") ||
      (!nativeAbsolute &&
        (path.win32.isAbsolute(observedPath) ||
          path.posix.isAbsolute(observedPath)))
    ) {
      pathLimitations.add(UNSAFE_INFO_PATH_LIMITATION);
      return null;
    }
    const absolutePath = nativeAbsolute
      ? path.resolve(observedPath)
      : path.resolve(authorityRoot, observedPath);
    const relativePath = path.relative(authorityRoot, absolutePath);
    if (relativePath === "") return ".";
    const portablePath = relativePath.split(path.sep).join("/");
    if (
      path.isAbsolute(relativePath) ||
      portablePath === ".." ||
      portablePath.startsWith("../") ||
      portablePath.includes("\0") ||
      portablePath.split("/").includes("..") ||
      path.win32.isAbsolute(portablePath) ||
      path.posix.isAbsolute(portablePath)
    ) {
      pathLimitations.add(UNSAFE_INFO_PATH_LIMITATION);
      return null;
    }
    return portablePath;
  };
}

function comparePackages(
  left: { name: string },
  right: { name: string },
): number {
  return left.name.localeCompare(right.name);
}

function disabledFamily(entry: PackageCompatibilityDecision) {
  return {
    name: entry.name,
    observed_version: entry.installed_version,
    reason: entry.state,
  };
}

/** Build the deterministic JSON result for `salt-ds info`. */
export async function runInfoCommand(input: RunInfoCommandInput) {
  const runtime = await loadRetrievalRuntime(input.rootDir);
  const { facts, inspectionLimitations, selection } = runtime;
  const manifest = runtime.store.manifest;
  const compatibility = resolveKnowledgeCompatibility(
    manifest,
    runtime.installedVersions,
  );
  const pathLimitations = new Set<string>();
  const projectPath = createProjectPathProjection(
    facts.root_dir,
    pathLimitations,
  );
  const declaredByName = new Map(
    facts.declared_salt_packages.map((entry) => [entry.name, entry.version]),
  );
  const projectPackages = facts.installation.resolvedPackages
    .map((entry) => ({
      name: entry.name,
      declared_version: declaredByName.get(entry.name) ?? entry.declaredVersion,
      effective_declared_version: entry.effectiveDeclaredVersion,
      declaration_resolution: entry.declarationResolution,
      observed_version: entry.resolvedVersion,
      observed_manifest_path: projectPath(entry.resolvedPath),
      satisfies_declaration: entry.satisfiesDeclaredVersion,
    }))
    .sort(comparePackages);
  const exactProjectPackageVector = selection.status === "selected";
  const limitations = [
    ...inspectionLimitations,
    ...compatibility.limitations,
    ...(facts.installation.inspection.status === "limited"
      ? ["SALT_INSTALLATION_INSPECTION_LIMITED"]
      : []),
    ...(facts.installation.inspection.packageLayout === "pnp"
      ? ["SALT_PACKAGE_LAYOUT_PNP_UNSUPPORTED"]
      : facts.installation.inspection.packageLayout === "unknown"
        ? ["SALT_PACKAGE_LAYOUT_UNKNOWN"]
        : []),
    ...(facts.installation.inspection.packageManagerDetectionStatus ===
    "ambiguous"
      ? ["SALT_PACKAGE_MANAGER_EVIDENCE_AMBIGUOUS"]
      : facts.installation.inspection.packageManagerDetectionStatus ===
          "invalid"
        ? ["SALT_PACKAGE_MANAGER_EVIDENCE_INVALID"]
        : []),
    ...(facts.installation.versionHealth.unverifiablePackages.length > 0
      ? ["SALT_PACKAGE_VERSION_UNVERIFIABLE"]
      : []),
    ...(facts.workspace.workspaceIssues.length > 0
      ? ["SALT_WORKSPACE_DECLARATION_ISSUE"]
      : []),
    ...(exactProjectPackageVector
      ? []
      : ["SALT_PROJECT_PACKAGE_VECTOR_NOT_EXACT"]),
    ...pathLimitations,
  ];

  const packageManifest =
    facts.package_manifest.path === null
      ? facts.package_manifest
      : {
          ...facts.package_manifest,
          path: projectPath(facts.package_manifest.path),
        };
  const workspace = {
    ...facts.workspace,
    packageRoot: projectPath(facts.workspace.packageRoot),
    workspaceRoot: projectPath(facts.workspace.workspaceRoot),
  };

  if (pathLimitations.size > 0) {
    limitations.push(...pathLimitations);
  }

  return {
    contract: "salt-cli-info/1" as const,
    schema_version: "1.0.0" as const,
    tool: {
      package: "@salt-ds/cli" as const,
      version: input.cliVersion,
      node: process.versions.node,
    },
    project: {
      root: "." as const,
      package_manifest: packageManifest,
      package_manager: {
        name: facts.installation.inspection.packageManager,
        detection_status:
          facts.installation.inspection.packageManagerDetectionStatus,
        layout: facts.installation.inspection.packageLayout,
        evidence_status: facts.installation.inspection.status,
      },
      workspace,
      packages: projectPackages,
    },
    knowledge: {
      package: "@salt-ds/knowledge" as const,
      package_version: manifest.bundle_version,
      selected_bundle_version: manifest.bundle_version,
      bundle_digest: manifest.bundle_digest,
      semantic_digest: manifest.semantic_digest,
    },
    selection,
    compatibility: {
      compatible: compatibility.complete,
      packages: compatibility.packages,
      usable_families: [...compatibility.usable_families].sort(),
      disabled_families: compatibility.packages
        .filter((entry) => !entry.usable)
        .map(disabledFamily)
        .sort(comparePackages),
    },
    coverage: {
      status:
        exactProjectPackageVector && compatibility.complete
          ? ("complete" as const)
          : ("partial" as const),
      exact_project_package_vector: exactProjectPackageVector,
      declared_package_count: facts.declared_salt_packages.length,
      observed_package_count: projectPackages.filter(
        (entry) => entry.observed_version !== null,
      ).length,
      family_count: compatibility.packages.length,
      usable_family_count: compatibility.usable_families.length,
    },
    limitations: [...new Set(limitations)].sort(),
  };
}
