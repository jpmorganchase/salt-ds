/**
 * Runtime boundary between the MCP adapter and the retained Salt catalog and
 * analysis primitives. Server code imports through this module; registry
 * builders and core modules do not depend on MCP protocol types.
 */

export type {
  KnowledgeApplicability,
  KnowledgeApplicabilityBasis,
  KnowledgeApplicabilityState,
} from "./applicability/knowledgeApplicability.js";
export {
  currentKnowledgeApplicability,
  deprecationTimelineKnowledgeApplicability,
  resolvePackageKnowledgeApplicability,
  unknownKnowledgeApplicability,
} from "./applicability/knowledgeApplicability.js";
export { normalizeCatalogPublicCitation } from "./catalog/catalogPublicCitation.js";
export type { CatalogResourceRecord } from "./catalog/catalogResourceEnvelope.js";
export { serializeCatalogResourceEnvelope } from "./catalog/catalogResourceEnvelope.js";
export {
  canonicalCatalogRuntimeFamilies,
  catalogFamilyFromUriSegment,
  catalogFamilyUriSegment,
} from "./catalog/catalogResourceIdentity.js";
export type {
  CatalogManifest,
  CatalogRuntimeFamilyName,
} from "./catalog/catalogSchemaV2.js";
export {
  CATALOG_SEARCH_TARGET_FAMILY_NAMES,
  resolveCatalogRecordContentReferences,
} from "./catalog/catalogSchemaV2.js";
export { canonicalJson } from "./catalog/catalogSerialization.js";
export type { DetectedProjectPolicy } from "./policy/detection.js";
export { detectProjectPolicy } from "./policy/detection.js";
export {
  deriveComparableSaltVersion,
  readProjectConventionsStackFile,
  resolveProjectConventionsFileLayer,
} from "./policy/layerDiagnostics.js";
export type {
  ProjectPolicyConditionV2,
  ProjectPolicyImportCheckV2,
  ProjectPolicyIrLayerInputV2,
  ProjectPolicyOccurrenceV2,
  SaltProjectPolicyIrV2,
} from "./policy/projectPolicyIr.js";
export {
  attachProjectPolicyImportChecks,
  compileSaltProjectPolicyIrV2,
} from "./policy/projectPolicyIr.js";
export {
  decodeProjectPolicyRootToken,
  MAX_PROJECT_POLICY_ENCODED_RESOURCE_ID_CHARS,
  MAX_PROJECT_POLICY_RESOURCE_ID_CHARS,
} from "./policy/projectPolicyResourceIdentity.js";
export {
  inspectProjectFileMetadata,
  readBoundedProjectFile,
} from "./project/boundedProjectFile.js";
export { createSaltProjectFacts } from "./project/projectFacts.js";
export type {
  ResolvedSaltPackageDescriptor,
  SaltInstallationDiagnostics,
  SaltInstallationWorkspace,
  SaltPackageDescriptor,
  SaltPackageManagerInspection,
  SaltPackageVersionHealth,
  SaltPackageVersionMismatch,
  SaltProjectFacts,
  SaltProjectFactsInput,
} from "./project/projectFacts.js";
export {
  assertPublicResourceText,
  MAX_PUBLIC_RESOURCE_UTF8_BYTES,
  publicResourceUtf8Bytes,
  serializePublicResourceJson,
} from "./publicResourceBudget.js";
export type { ResultBudgetOmission } from "./publicResultBudget.js";
export {
  jsonUtf8Bytes,
  MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
  MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES,
} from "./publicResultBudget.js";
export type { SaltCatalogRuntimeContext } from "./registry/loadRegistry.js";
export { loadCatalogRuntimeContext } from "./registry/loadRegistry.js";
export { getPackageRoot } from "./registry/paths.js";
export {
  MAX_REVIEW_ARTIFACT_ID_CHARS,
  MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES,
  MAX_REVIEW_ARTIFACT_UTF8_BYTES,
  MAX_REVIEW_ARTIFACTS,
  MAX_REVIEW_PACKAGE_VERSIONS,
  MAX_REVIEW_SUBMITTED_UTF8_BYTES,
  analyzeSaltCode,
  reviewSaltCode,
} from "./review/reviewSaltCode.js";
export type {
  CompleteReviewArtifactAnalysis,
  CompleteReviewFinding,
  CompleteReviewSaltCodeAnalysis,
  ReviewSaltCodeContext,
  ReviewSaltCodeResult,
} from "./review/reviewSaltCode.js";
export {
  DEFAULT_SEARCH_RESULTS,
  MAX_SEARCH_RESULTS,
  MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
  searchSalt,
  searchSaltRecords,
} from "./search/searchSalt.js";
export type {
  SaltKnowledgeRecordReference,
  SearchSaltRecordMatch,
  SearchSaltRecordsResult,
} from "./search/searchSalt.js";
export { EXACT_SEMVER_PATTERN } from "./versionUtils.js";
