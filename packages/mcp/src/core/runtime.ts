/**
 * Deliberate boundary between MCP transport/orchestration and the internal
 * Salt reasoning core. Code outside this directory imports core capabilities
 * through this module; core code must not depend on MCP protocol concerns.
 */

export type {
  SaltEvidenceValidationIssueCode,
  SaltGeneratedArtifactKind,
} from "./evidence.js";
export type { ProjectPolicyDetailLevel } from "./policy/detection.js";
export { detectProjectPolicy } from "./policy/detection.js";
export type {
  ProjectConventions,
  ProjectConventionsLayerReference,
  ProjectConventionsStack,
} from "./policy/index.js";

export {
  composeProjectConventionLayers,
  composeProjectConventionStack,
} from "./policy/index.js";
export {
  deriveComparableSaltVersion,
  readProjectConventionsStackFile,
  resolveProjectConventionsFileLayer,
  resolveProjectConventionsPackageLayer,
} from "./policy/layerDiagnostics.js";
export { loadRegistry } from "./registry/loadRegistry.js";
export { getPackageRoot } from "./registry/paths.js";
export type { SaltCapabilityManifest } from "./tools/capabilityManifest.js";
export { buildSaltCapabilityManifest } from "./tools/capabilityManifest.js";
export {
  buildCreateCatalogSupportManifest,
  listCreateCatalogEntityNames,
  lookupCreateCatalogEntity,
} from "./tools/createCatalogSupport.js";
export type { CreateSaltUiResult } from "./tools/createSaltUi.js";
export { createSaltUi } from "./tools/createSaltUi.js";
export { getSaltEntities } from "./tools/getSaltEntities.js";
export type { MigrateToSaltResult } from "./tools/migrateToSalt.js";
export { migrateToSalt } from "./tools/migrateToSalt.js";
export type {
  PublicCreateRerunArgs,
  PublicReferenceEntityType,
} from "./tools/publicContract.js";
export {
  buildCreatePublicContract,
  buildMigratePublicContract,
  buildReviewPublicContract,
  PUBLIC_CREATE_REFERENCE_BATCH_MAX,
  PUBLIC_CREATE_RESOLVED_ENTITY_MAX,
  PUBLIC_REFERENCE_ENTITY_TYPES,
} from "./tools/publicContract.js";
export type {
  ReviewExpectedTargets,
  ReviewSaltUiResult,
} from "./tools/reviewSaltUi.js";
export { reviewSaltUi } from "./tools/reviewSaltUi.js";
export type {
  NormalizedVisualEvidenceInput,
  SourceUiOutlineInput,
} from "./tools/translation/sourceUiTypes.js";
export {
  buildCreateSaltUiWorkflowContract,
  buildMigrateToSaltWorkflowContract,
  buildReviewSaltUiWorkflowContract,
} from "./tools/workflowContracts.js";
export type { WorkflowProjectPolicyArtifact } from "./tools/workflowProjectPolicy.js";
export { buildWorkflowProjectPolicyArtifact } from "./tools/workflowProjectPolicy.js";
export { applyProjectPolicyToStarterCodeSnippets } from "./tools/workflowProjectPolicyApplication.js";
export type { LoadRegistryOptions, SaltRegistry } from "./types.js";
