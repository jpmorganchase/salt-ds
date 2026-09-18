import {
  getKnowledgeRecordFamilyNames,
  isKnowledgeRecordFamily,
  type KnowledgeRecordFamily,
} from "@salt-ds/knowledge";

export interface KnowledgeManifestIdentity {
  semantic_digest: string;
}

const DIGEST_PREFIX = "sha256:";
const CATALOG_URI_PREFIX = "salt://catalog/v2/";
const CATALOG_RUNTIME_FAMILY_URI_SEGMENTS = {
  package: "packages",
  component: "components",
  icon: "icons",
  country_symbol: "country-symbols",
  pattern: "patterns",
  guide: "guides",
  page: "pages",
  token: "tokens",
  api_symbol: "api-symbols",
  deprecation: "deprecations",
  concept: "concepts",
  declaration_context: "declaration-contexts",
  token_declaration: "token-declarations",
  relation: "relations",
  policy_profile: "policy-profiles",
  content: "content",
  evidence: "evidence",
  source: "sources",
  accessibility_claim: "accessibility-claims",
  search_document: "search-documents",
} as const satisfies Record<KnowledgeRecordFamily, string>;

export function catalogIdentitySegment(manifest: KnowledgeManifestIdentity): string {
  const digest = manifest.semantic_digest;
  return digest.startsWith(DIGEST_PREFIX)
    ? `sha256-${digest.slice(DIGEST_PREFIX.length)}`
    : encodeURIComponent(digest);
}

export function catalogManifestResourceUri(
  manifest: KnowledgeManifestIdentity,
): string {
  return `${CATALOG_URI_PREFIX}${catalogIdentitySegment(manifest)}/manifest`;
}

export function catalogFamilyUriSegment(
  family: KnowledgeRecordFamily,
): string {
  return CATALOG_RUNTIME_FAMILY_URI_SEGMENTS[family];
}

export function canonicalCatalogRuntimeFamilies(): KnowledgeRecordFamily[] {
  return getKnowledgeRecordFamilyNames();
}

export function catalogRecordResourceUri(
  manifest: KnowledgeManifestIdentity,
  family: KnowledgeRecordFamily,
  id: string,
): string {
  if (!isKnowledgeRecordFamily(family)) {
    throw new Error(`Catalog family '${family}' is not canonical.`);
  }
  return `${CATALOG_URI_PREFIX}${catalogIdentitySegment(manifest)}/${catalogFamilyUriSegment(family)}/${encodeURIComponent(id)}`;
}

export function catalogRecordResourceTemplate(
  manifest: KnowledgeManifestIdentity,
): string {
  return `${CATALOG_URI_PREFIX}${catalogIdentitySegment(manifest)}/{family}/{id}`;
}

export function catalogFamilyFromUriSegment(
  value: string,
): KnowledgeRecordFamily | null {
  return (
    canonicalCatalogRuntimeFamilies().find(
      (family) => catalogFamilyUriSegment(family) === value,
    ) ?? null
  );
}
