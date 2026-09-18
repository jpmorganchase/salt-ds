import {
  type CatalogManifest,
  type CatalogRuntimeFamilyName,
  catalogFamilies,
  getCatalogRuntimeFamilyNames,
  isCanonicalCatalogFamily,
} from "./catalogSchemaV2.js";

const DIGEST_PREFIX = "sha256:";
const CATALOG_URI_PREFIX = "salt://catalog/v2/";

export function catalogIdentitySegment(manifest: CatalogManifest): string {
  const digest = manifest.semantic_digest;
  return digest.startsWith(DIGEST_PREFIX)
    ? `sha256-${digest.slice(DIGEST_PREFIX.length)}`
    : encodeURIComponent(digest);
}

export function catalogManifestResourceUri(manifest: CatalogManifest): string {
  return `${CATALOG_URI_PREFIX}${catalogIdentitySegment(manifest)}/manifest`;
}

export function catalogFamilyUriSegment(
  family: CatalogRuntimeFamilyName,
): string {
  const template = catalogFamilies[family].resourceUriTemplate;
  const match = /^salt:\/\/catalog\/v2\/([^/]+)\/\{id\}$/u.exec(template);
  if (!match?.[1]) {
    throw new Error(
      `Catalog family '${family}' does not declare an exact v2 resource URI template.`,
    );
  }
  return match[1];
}

export function canonicalCatalogRuntimeFamilies(): CatalogRuntimeFamilyName[] {
  return getCatalogRuntimeFamilyNames().filter((family) =>
    isCanonicalCatalogFamily(family),
  );
}

export function catalogRecordResourceUri(
  manifest: CatalogManifest,
  family: CatalogRuntimeFamilyName,
  id: string,
): string {
  if (!isCanonicalCatalogFamily(family)) {
    throw new Error(`Catalog family '${family}' is not canonical.`);
  }
  return `${CATALOG_URI_PREFIX}${catalogIdentitySegment(manifest)}/${catalogFamilyUriSegment(family)}/${encodeURIComponent(id)}`;
}

export function catalogRecordResourceTemplate(
  manifest: CatalogManifest,
): string {
  return `${CATALOG_URI_PREFIX}${catalogIdentitySegment(manifest)}/{family}/{id}`;
}

export function catalogFamilyFromUriSegment(
  value: string,
): CatalogRuntimeFamilyName | null {
  return (
    canonicalCatalogRuntimeFamilies().find(
      (family) => catalogFamilyUriSegment(family) === value,
    ) ?? null
  );
}
