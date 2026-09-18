import { normalizeCatalogPublicCitation } from "./catalogPublicCitation.js";
import {
  type CatalogManifest,
  type CatalogRecord,
  resolveCatalogRecordContentReferences,
} from "./catalogSchemaV2.js";

export type CatalogResourceRecord = Exclude<
  CatalogRecord,
  { family: "content" }
>;

export function serializeCatalogResourceEnvelope(
  manifest: CatalogManifest,
  record: CatalogResourceRecord,
): string {
  const contentResources = resolveCatalogRecordContentReferences(record).map(
    (reference) => ({
      reference,
      uri: normalizeCatalogPublicCitation({
        kind: "catalog_record",
        manifest,
        family: "content",
        id: reference.id,
      }),
    }),
  );
  return JSON.stringify({
    resolved_catalog_digest: manifest.semantic_digest,
    record,
    content_resources: contentResources,
  });
}
