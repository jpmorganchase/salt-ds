import { normalizeCatalogPublicCitation } from "./catalogPublicCitation.js";
import {
  resolveKnowledgeRecordContentReferences,
} from "@salt-ds/knowledge";
import type { KnowledgeManifestIdentity } from "./catalogResourceIdentity.js";

export type CatalogResourceRecord = any;

export function serializeCatalogResourceEnvelope(
  manifest: KnowledgeManifestIdentity,
  record: CatalogResourceRecord,
): string {
  const contentResources = resolveKnowledgeRecordContentReferences(record).map(
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
