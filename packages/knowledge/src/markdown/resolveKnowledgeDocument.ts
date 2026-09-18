import type { KnowledgeRecordStore } from "../manifest/knowledgeStore.js";
import {
  KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES,
  normalizeKnowledgeQuery,
  resolveKnowledgeRecordCompatibility,
  type SaltKnowledgeRecordReference,
} from "../search/searchSalt.js";

interface SearchDocument {
  target: SaltKnowledgeRecordReference;
  title: string;
}

export interface KnowledgeDocumentChoice {
  reference: SaltKnowledgeRecordReference;
  title: string;
  matched_by: "record_id" | "export_name" | "canonical_name" | "alias" | "title";
}

export interface ResolveKnowledgeDocumentInput {
  identifier: string;
  installed_versions?: Readonly<Record<string, string | null | undefined>>;
}

export interface KnowledgeDocumentResult {
  contract: "salt-knowledge-document/1";
  status: "resolved" | "ambiguous" | "not_found" | "incompatible";
  identifier: string;
  bundle: {
    version: string;
    digest: string;
    semantic_digest: string;
  };
  choices: KnowledgeDocumentChoice[];
  excluded_package_families: Array<{
    name: string;
    state: string;
    observed_version: string | null;
    supported_range: string;
  }>;
  document: null | {
    reference: SaltKnowledgeRecordReference;
    title: string;
    summary: string;
    record: unknown;
    content: null | {
      reference: { family: "content"; id: string; codec: string };
      value: unknown;
    };
    citation: {
      record_key: string;
      source_records: string[];
      bundle_digest: string;
    };
  };
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function collectSourceReferences(value: unknown, ids: Set<string>): void {
  if (Array.isArray(value)) {
    for (const entry of value) collectSourceReferences(entry, ids);
    return;
  }
  if (!value || typeof value !== "object") return;
  const candidate = value as Record<string, unknown>;
  if (candidate.family === "source" && typeof candidate.id === "string") {
    ids.add(candidate.id);
  }
  for (const entry of Object.values(candidate)) {
    collectSourceReferences(entry, ids);
  }
}

function contentReference(record: any) {
  const candidate = record?.detail_content_ref ?? record?.body_content_ref;
  return candidate?.family === "content" &&
    typeof candidate.id === "string" &&
    typeof candidate.codec === "string"
    ? (candidate as { family: "content"; id: string; codec: string })
    : null;
}

function identityMatches(
  document: SearchDocument,
  record: any,
  identifier: string,
): KnowledgeDocumentChoice[] {
  const candidates: Array<{
    value: unknown;
    matched_by: KnowledgeDocumentChoice["matched_by"];
  }> = [
    { value: document.target.id, matched_by: "record_id" },
    { value: record?.export_name, matched_by: "export_name" },
    { value: record?.name, matched_by: "canonical_name" },
    { value: record?.title, matched_by: "canonical_name" },
    ...strings(record?.aliases).map((value) => ({
      value,
      matched_by: "alias" as const,
    })),
    { value: document.title, matched_by: "title" },
  ];
  const matched = candidates.find(
    ({ value }) =>
      typeof value === "string" &&
      normalizeKnowledgeQuery(value) === identifier,
  );
  return matched
    ? [
        {
          reference: document.target,
          title: document.title,
          matched_by: matched.matched_by,
        },
      ]
    : [];
}

export function resolveKnowledgeDocument(
  store: KnowledgeRecordStore,
  input: ResolveKnowledgeDocumentInput,
): KnowledgeDocumentResult {
  const identifier = input.identifier.trim();
  const normalized = normalizeKnowledgeQuery(identifier);
  const documents = store.getFamily("search_document") as readonly SearchDocument[];
  const rawChoices = documents.flatMap((document) => {
    if (
      !KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES.includes(document.target.family)
    ) {
      return [];
    }
    const record = store.getRecord(document.target.family, document.target.id);
    return record ? identityMatches(document, record, normalized) : [];
  });
  const exactIdChoices = rawChoices.filter(
    (choice) => choice.matched_by === "record_id",
  );
  const choices = (exactIdChoices.length > 0 ? exactIdChoices : rawChoices).sort(
    (left, right) =>
      left.reference.id.localeCompare(right.reference.id) ||
      left.reference.family.localeCompare(right.reference.family),
  );
  const excludedPackageFamilies = new Map<
    string,
    KnowledgeDocumentResult["excluded_package_families"][number]
  >();
  const applicable = choices.filter((choice) => {
    const compatibility = resolveKnowledgeRecordCompatibility(
      store,
      choice.reference,
      input.installed_versions,
    );
    for (const entry of compatibility.packages) {
      if (!entry.usable) {
        excludedPackageFamilies.set(entry.name, {
          name: entry.name,
          state: entry.state,
          observed_version: entry.installed_version,
          supported_range: entry.supported_range,
        });
      }
    }
    return compatibility.included;
  });
  const bundle = {
    version: store.manifest.bundle_version,
    digest: store.manifest.bundle_digest,
    semantic_digest: store.manifest.semantic_digest,
  };
  const excluded = [...excludedPackageFamilies.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  if (choices.length === 0) {
    return {
      contract: "salt-knowledge-document/1",
      status: "not_found",
      identifier,
      bundle,
      choices: [],
      excluded_package_families: [],
      document: null,
    };
  }
  if (applicable.length === 0) {
    return {
      contract: "salt-knowledge-document/1",
      status: "incompatible",
      identifier,
      bundle,
      choices,
      excluded_package_families: excluded,
      document: null,
    };
  }
  if (applicable.length > 1) {
    return {
      contract: "salt-knowledge-document/1",
      status: "ambiguous",
      identifier,
      bundle,
      choices: applicable,
      excluded_package_families: excluded,
      document: null,
    };
  }
  const choice = applicable[0];
  const record = store.getRecord(choice.reference.family, choice.reference.id);
  const contentRef = contentReference(record);
  const sources = new Set<string>();
  collectSourceReferences(record, sources);
  return {
    contract: "salt-knowledge-document/1",
    status: "resolved",
    identifier,
    bundle,
    choices: [choice],
    excluded_package_families: excluded,
    document: {
      reference: choice.reference,
      title: choice.title,
      summary:
        typeof record?.summary === "string"
          ? record.summary
          : typeof record?.semantic_intent === "string"
            ? record.semantic_intent
            : "",
      record,
      content: contentRef
        ? {
            reference: contentRef,
            value: store.getContentValue(contentRef),
          }
        : null,
      citation: {
        record_key:
          "record:" + choice.reference.family + ":" + choice.reference.id,
        source_records: [...sources].sort(),
        bundle_digest: store.manifest.bundle_digest,
      },
    },
  };
}

export function renderKnowledgeDocumentMarkdown(
  result: KnowledgeDocumentResult,
): string {
  if (result.status !== "resolved" || !result.document) {
    const choices =
      result.choices.length === 0
        ? ""
        : "\n\nChoices:\n" +
          result.choices
            .map(
              (choice) =>
                "- " +
                choice.title +
                " (" +
                choice.reference.family +
                "/" +
                choice.reference.id +
                ")",
            )
            .join("\n");
    return (
      "# Salt docs: " +
      (result.identifier || "(empty)") +
      "\n\nStatus: " +
      result.status +
      choices +
      "\n\nBundle: " +
      result.bundle.digest +
      "\n"
    );
  }
  const content = result.document.content
    ? "\n\n## Verified detail\n\n\u0060\u0060\u0060json\n" +
      JSON.stringify(result.document.content.value, null, 2) +
      "\n\u0060\u0060\u0060"
    : "";
  const sources = result.document.citation.source_records.length
    ? "\nSources: " + result.document.citation.source_records.join(", ")
    : "";
  return (
    "# " +
    result.document.title +
    "\n\n" +
    result.document.summary +
    "\n\nRecord: " +
    result.document.citation.record_key +
    "\nBundle: " +
    result.document.citation.bundle_digest +
    sources +
    content +
    "\n"
  );
}
