/**
 * MCP adapter boundary. Protocol-neutral behavior comes only from the
 * @salt-ds/knowledge package root; this module adds MCP-specific budgets,
 * resource identities, URI rendering, and public response projection.
 */

export * from "@salt-ds/knowledge";
export { normalizeCatalogPublicCitation } from "./catalog/catalogPublicCitation.js";
export type { CatalogResourceRecord } from "./catalog/catalogResourceEnvelope.js";
export { serializeCatalogResourceEnvelope } from "./catalog/catalogResourceEnvelope.js";
export {
  canonicalCatalogRuntimeFamilies,
  catalogFamilyFromUriSegment,
  catalogFamilyUriSegment,
} from "./catalog/catalogResourceIdentity.js";
export {
  decodeProjectPolicyRootToken,
  MAX_PROJECT_POLICY_ENCODED_RESOURCE_ID_CHARS,
  MAX_PROJECT_POLICY_RESOURCE_ID_CHARS,
} from "./policy/projectPolicyResourceIdentity.js";
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
export {
  MAX_REVIEW_NONFINDING_VERSION_DECISIONS,
  reviewSaltCode,
} from "./review/reviewSaltCode.js";
export type { ReviewSaltCodeResult } from "./review/reviewSaltCode.js";
export {
  DEFAULT_SEARCH_RESULTS,
  MAX_SEARCH_RESULTS,
  MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
  searchSalt,
} from "./search/searchSalt.js";
export type {
  SearchSaltMatch,
  SearchSaltResult,
} from "./search/searchSalt.js";
