/**
 * Compatibility seam for MCP-internal imports. The protocol-neutral package
 * inspection implementation is owned and published by @salt-ds/knowledge.
 */
export {
  collectSaltInstallationDiagnostics,
  collectSaltPackages,
  detectPackageManager,
  detectPackageManagerName,
  detectSaltWorkspaceScope,
  inspectPackageJsonFile,
  MAX_PACKAGE_JSON_BYTES,
  MAX_PNPM_WORKSPACE_BYTES,
  MAX_WORKSPACE_ANCESTOR_DIRECTORIES,
  MAX_WORKSPACE_PATTERNS,
  MAX_WORKSPACE_PATTERN_UTF8_BYTES,
  readPackageJsonFile,
  SALT_INSTALLATION_SCOPE_LIMITATION,
  type CollectSaltInstallationOptions,
  type CompiledWorkspacePatterns,
  type MarkerInspection,
  type MarkerInspectionReason,
  type PackageManagerDetection,
  type SaltPackageJsonLike,
  type SaltWorkspaceScope,
} from "../../core/runtime.js";
