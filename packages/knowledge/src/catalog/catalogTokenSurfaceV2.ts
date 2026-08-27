import type {
  CatalogContentCodecName,
  CatalogContentReference,
  CatalogPayloadForCodec,
} from "./catalogPayloadSchemaV2.js";
import { catalogContentCodecs } from "./catalogPayloadSchemaV2.js";
import {
  type CatalogFamilyName,
  type CatalogRecord,
  type CatalogRecordForFamily,
  type CatalogRuntimeFamilyName,
  encodeCatalogArtifactRecordsForStorage,
  resolveCatalogRecordContentReferences,
  resolveCatalogRecordReferences,
  SALT_CATALOG_SCHEMA_VERSION,
} from "./catalogSchemaV2.js";
import {
  canonicalJsonFile,
  compareCatalogIds,
} from "./catalogSerialization.js";

export interface CatalogTokenSurfaceView {
  getFamily<Family extends CatalogRuntimeFamilyName>(
    family: Family,
  ): readonly CatalogRecordForFamily<Family>[];
  getContentValue<Codec extends CatalogContentCodecName>(
    reference: CatalogContentReference<Codec>,
  ): CatalogPayloadForCodec<Codec>;
}

export interface TokenOwnedByteBreakdown {
  token_facts: number;
  token_declarations: number;
  declaration_contexts: number;
  declaration_sources: number;
  policy_profiles: number;
  policy_evidence: number;
  token_relations: number;
  token_search_projection: number;
  content_index: number;
  content_objects: number;
  total: number;
}

export interface TokenOwnedRecordCounts {
  token_facts: number;
  token_declarations: number;
  structural_role_profiles: number;
  token_relations: number;
  token_search_projection: number;
}

export interface TokenOwnedSurfaceMeasurement {
  bytes: TokenOwnedByteBreakdown;
  record_counts: TokenOwnedRecordCounts;
}

function artifactSubsetBytes(
  family: CatalogFamilyName,
  records: readonly CatalogRecord[],
): number {
  return Buffer.byteLength(
    canonicalJsonFile({
      schema_version: SALT_CATALOG_SCHEMA_VERSION,
      family,
      records: encodeCatalogArtifactRecordsForStorage(
        family,
        [...records].sort(compareCatalogIds) as never,
      ),
    }),
    "utf8",
  );
}

function addTokenOwnedReferenceClosure(
  view: CatalogTokenSurfaceView,
  seedRecords: readonly CatalogRecord[],
  ownedEvidenceIds: Set<string>,
  ownedSourceIds: Set<string>,
): Set<string> {
  const contentIds = new Set<string>();
  const visitedRecords = new Set<string>();
  const recordQueue = [...seedRecords];
  const enqueuedEvidenceIds = new Set(
    seedRecords.flatMap((record) =>
      record.family === "evidence" ? [record.id] : [],
    ),
  );
  const contentQueue: CatalogContentReference[] = [];
  const evidenceById = new Map(
    view.getFamily("evidence").map((record) => [record.id, record]),
  );
  const enqueueEvidence = (id: string): void => {
    ownedEvidenceIds.add(id);
    if (enqueuedEvidenceIds.has(id)) return;
    enqueuedEvidenceIds.add(id);
    const evidence = evidenceById.get(id);
    if (evidence) recordQueue.push(evidence);
  };

  while (recordQueue.length > 0 || contentQueue.length > 0) {
    const record = recordQueue.shift();
    if (record) {
      const recordKey = `${record.family}:${record.id}`;
      if (visitedRecords.has(recordKey)) continue;
      visitedRecords.add(recordKey);
      contentQueue.push(...resolveCatalogRecordContentReferences(record));
      for (const reference of resolveCatalogRecordReferences(record)) {
        if (reference.family === "evidence") {
          enqueueEvidence(reference.id);
        } else if (reference.family === "source") {
          ownedSourceIds.add(reference.id);
        }
      }
      continue;
    }

    const reference = contentQueue.shift() as CatalogContentReference;
    if (contentIds.has(reference.id)) continue;
    contentIds.add(reference.id);
    const payload = view.getContentValue(reference);
    for (const nestedReference of catalogContentCodecs[
      reference.codec
    ].resolveContentReferences(payload)) {
      contentQueue.push(nestedReference);
    }
    for (const nestedReference of catalogContentCodecs[
      reference.codec
    ].resolveReferences(payload)) {
      if (nestedReference.family === "evidence") {
        enqueueEvidence(nestedReference.id);
      } else if (nestedReference.family === "source") {
        ownedSourceIds.add(nestedReference.id);
      }
    }
  }
  return contentIds;
}

export function measureTokenOwnedCatalogSurface(
  view: CatalogTokenSurfaceView,
): TokenOwnedSurfaceMeasurement {
  const tokens = [...view.getFamily("token")];
  const declarations = [...view.getFamily("token_declaration")];
  const tokenIds = new Set(tokens.map((token) => token.id));
  const declarationIds = new Set(
    declarations.map((declaration) => declaration.id),
  );
  const contextIds = new Set(
    declarations.map((declaration) => declaration.context_ref.id),
  );
  const ownedPolicyIds = new Set(
    tokens.flatMap((token) => [
      ...(token.policy_profile_ref ? [token.policy_profile_ref.id] : []),
      ...(token.evidence_profile_ref ? [token.evidence_profile_ref.id] : []),
    ]),
  );
  const allPolicies = view.getFamily("policy_profile");
  for (const profile of allPolicies) {
    if (profile.policy_kind === "structural_role_rules") {
      ownedPolicyIds.add(profile.id);
    }
  }
  const policies = allPolicies.filter((profile) =>
    ownedPolicyIds.has(profile.id),
  );
  const relations = view
    .getFamily("relation")
    .filter(
      (relation) =>
        (relation.source.family === "token_declaration" &&
          declarationIds.has(relation.source.id)) ||
        (relation.target.family === "token" &&
          tokenIds.has(relation.target.id)),
    );

  const ownedEvidenceIds = new Set<string>();
  const ownedSourceIds = new Set(
    declarations.map((declaration) => declaration.source_ref.id),
  );
  for (const relation of relations) {
    for (const evidenceRef of relation.source_evidence_refs) {
      ownedEvidenceIds.add(evidenceRef.id);
    }
  }
  const seedEvidence = view
    .getFamily("evidence")
    .filter((record) => ownedEvidenceIds.has(record.id));
  const contentIds = addTokenOwnedReferenceClosure(
    view,
    [...tokens, ...policies, ...seedEvidence],
    ownedEvidenceIds,
    ownedSourceIds,
  );
  const evidence = view
    .getFamily("evidence")
    .filter((record) => ownedEvidenceIds.has(record.id));

  const contexts = view
    .getFamily("declaration_context")
    .filter((context) => contextIds.has(context.id));
  const sources = view
    .getFamily("source")
    .filter((source) => ownedSourceIds.has(source.id));
  const tokenSearchDocuments = view
    .getFamily("search_document")
    .filter(
      (document) =>
        document.target.family === "token" && tokenIds.has(document.target.id),
    );
  const contentRecords = view
    .getFamily("content")
    .filter((record) => contentIds.has(record.id));

  const bytes: TokenOwnedByteBreakdown = {
    token_facts: artifactSubsetBytes("token", tokens),
    token_declarations: artifactSubsetBytes("token_declaration", declarations),
    declaration_contexts: artifactSubsetBytes("declaration_context", contexts),
    declaration_sources: artifactSubsetBytes("source", sources),
    policy_profiles: artifactSubsetBytes("policy_profile", policies),
    policy_evidence: artifactSubsetBytes("evidence", evidence),
    token_relations: artifactSubsetBytes("relation", relations),
    token_search_projection: artifactSubsetBytes(
      "search_document",
      tokenSearchDocuments,
    ),
    content_index: artifactSubsetBytes("content", contentRecords),
    content_objects: contentRecords.reduce(
      (total, record) => total + record.length,
      0,
    ),
    total: 0,
  };
  bytes.total =
    bytes.token_facts +
    bytes.token_declarations +
    bytes.declaration_contexts +
    bytes.declaration_sources +
    bytes.policy_profiles +
    bytes.policy_evidence +
    bytes.token_relations +
    bytes.token_search_projection +
    bytes.content_index +
    bytes.content_objects;

  return {
    bytes,
    record_counts: {
      token_facts: tokens.length,
      token_declarations: declarations.length,
      structural_role_profiles: policies.filter(
        (profile) => profile.policy_kind === "structural_role_rules",
      ).length,
      token_relations: relations.length,
      token_search_projection: tokenSearchDocuments.length,
    },
  };
}
