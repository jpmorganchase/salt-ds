import {
  assembleCanonicalDocument,
  type CanonicalDocumentSelection,
  canonicalDocumentReference,
  renderCanonicalDocument,
} from "../documents/assembleCanonicalDocument.js";
import type { KnowledgeRecordStore } from "../manifest/knowledgeStore.js";
import {
  KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES,
  normalizeKnowledgeQuery,
  resolveKnowledgeRecordCompatibility,
  type SaltKnowledgeRecordReference,
} from "../search/searchSalt.js";
import { renderUntrustedMarkdownEvidence } from "./untrustedMarkdown.js";

interface SearchDocument {
  target: SaltKnowledgeRecordReference;
  title: string;
}

interface ContentReference {
  family: "content";
  id: string;
  codec: string;
}

interface DocumentRecord {
  family?: unknown;
  detail_content_ref?: unknown;
  body_content_ref?: unknown;
  export_name?: unknown;
  name?: unknown;
  title?: unknown;
  aliases?: unknown;
  summary?: unknown;
  semantic_intent?: unknown;
}

export interface KnowledgeDocumentChoice {
  reference: SaltKnowledgeRecordReference;
  title: string;
  matched_by:
    | "record_id"
    | "export_name"
    | "canonical_name"
    | "alias"
    | "title";
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
      reference: ContentReference;
      value: unknown;
    };
    citation: {
      record_key: string;
      source_records: string[];
      bundle_digest: string;
    };
    canonical?: CanonicalDocumentSelection;
    limitations?: string[];
  };
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function documentRecord(value: unknown): DocumentRecord | null {
  return isRecord(value) ? value : null;
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

function contentReference(value: unknown): ContentReference | null {
  if (!isRecord(value)) return null;
  return value.family === "content" &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.codec === "string" &&
    value.codec.length > 0
    ? { family: "content", id: value.id, codec: value.codec }
    : null;
}

function primaryContentReference(
  record: DocumentRecord | null,
  family: SaltKnowledgeRecordReference["family"],
): ContentReference | null {
  if (!record) return null;
  return contentReference(
    family === "page"
      ? record.body_content_ref
      : (record.detail_content_ref ?? record.body_content_ref),
  );
}

function identityMatches(
  document: SearchDocument,
  record: DocumentRecord,
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

function isSearchTargetFamily(
  value: string,
): value is SaltKnowledgeRecordReference["family"] {
  return (KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES as readonly string[]).includes(
    value,
  );
}

function parseCanonicalRecordKey(
  identifier: string,
): SaltKnowledgeRecordReference | null {
  const match = /^record:([^:]+):(.+)$/u.exec(identifier);
  if (!match || !isSearchTargetFamily(match[1]) || match[2].trim().length === 0)
    return null;
  return { family: match[1], id: match[2] };
}

function canonicalChoice(
  store: KnowledgeRecordStore,
  documents: readonly SearchDocument[],
  reference: SaltKnowledgeRecordReference,
): KnowledgeDocumentChoice[] {
  const document = documents.find(
    (candidate) =>
      candidate.target.family === reference.family &&
      candidate.target.id === reference.id,
  );
  return document &&
    documentRecord(store.getRecord(reference.family, reference.id))
    ? [
        {
          reference,
          title: document.title,
          matched_by: "record_id",
        },
      ]
    : [];
}

function addExcludedPackageFamilies(
  target: Map<
    string,
    KnowledgeDocumentResult["excluded_package_families"][number]
  >,
  compatibility: ReturnType<typeof resolveKnowledgeRecordCompatibility>,
): void {
  for (const entry of compatibility.packages) {
    if (!entry.usable) {
      target.set(entry.name, {
        name: entry.name,
        state: entry.state,
        observed_version: entry.installed_version,
        supported_range: entry.supported_range,
      });
    }
  }
}

function sortedExcludedPackageFamilies(
  excluded: ReadonlyMap<
    string,
    KnowledgeDocumentResult["excluded_package_families"][number]
  >,
): KnowledgeDocumentResult["excluded_package_families"] {
  return [...excluded.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

export function resolveKnowledgeDocument(
  store: KnowledgeRecordStore,
  input: ResolveKnowledgeDocumentInput,
): KnowledgeDocumentResult {
  const identifier = input.identifier.trim();
  const fragmentOffset = identifier.startsWith("record:")
    ? identifier.indexOf("#")
    : -1;
  const baseIdentifier =
    fragmentOffset < 0 ? identifier : identifier.slice(0, fragmentOffset);
  const fragment =
    fragmentOffset < 0 ? undefined : identifier.slice(fragmentOffset + 1);
  const normalized = normalizeKnowledgeQuery(baseIdentifier);
  const documents = store.getFamily(
    "search_document",
  ) as readonly SearchDocument[];
  const canonicalReference = parseCanonicalRecordKey(baseIdentifier);
  const rawChoices = canonicalReference
    ? canonicalChoice(store, documents, canonicalReference)
    : identifier.startsWith("record:")
      ? []
      : documents.flatMap((document) => {
          if (
            !KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES.includes(
              document.target.family,
            )
          ) {
            return [];
          }
          const record = documentRecord(
            store.getRecord(document.target.family, document.target.id),
          );
          return record ? identityMatches(document, record, normalized) : [];
        });
  const exactIdChoices = rawChoices.filter(
    (choice) => choice.matched_by === "record_id",
  );
  const choices = (
    exactIdChoices.length > 0 ? exactIdChoices : rawChoices
  ).sort(
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
    addExcludedPackageFamilies(excludedPackageFamilies, compatibility);
    return compatibility.included;
  });
  const bundle = {
    version: store.manifest.bundle_version,
    digest: store.manifest.bundle_digest,
    semantic_digest: store.manifest.semantic_digest,
  };
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
      excluded_package_families: sortedExcludedPackageFamilies(
        excludedPackageFamilies,
      ),
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
      excluded_package_families: sortedExcludedPackageFamilies(
        excludedPackageFamilies,
      ),
      document: null,
    };
  }
  const choice = applicable[0];
  const record = documentRecord(
    store.getRecord(choice.reference.family, choice.reference.id),
  );
  const contentRef = primaryContentReference(record, choice.reference.family);
  const sources = new Set<string>();
  collectSourceReferences(record, sources);
  let canonical: CanonicalDocumentSelection | null = null;
  let canonicalLimitation: string | undefined;
  const attachedGuideReference = canonicalDocumentReference(
    store,
    choice.reference,
  );
  if (attachedGuideReference) {
    const canonicalCompatibility = resolveKnowledgeRecordCompatibility(
      store,
      attachedGuideReference,
      input.installed_versions,
    );
    addExcludedPackageFamilies(excludedPackageFamilies, canonicalCompatibility);
    if (!canonicalCompatibility.included) {
      if (fragment !== undefined || choice.reference.family === "guide") {
        return {
          contract: "salt-knowledge-document/1",
          status: "incompatible",
          identifier,
          bundle,
          choices: [choice],
          excluded_package_families: sortedExcludedPackageFamilies(
            excludedPackageFamilies,
          ),
          document: null,
        };
      }
      canonicalLimitation =
        "Attached canonical guidance is incompatible with the installed package vector.";
    } else {
      canonical = assembleCanonicalDocument(store, choice.reference, fragment);
    }
  }
  if (fragment !== undefined && (!fragment || !canonical)) {
    return {
      contract: "salt-knowledge-document/1",
      status: "not_found",
      identifier,
      bundle,
      choices: [],
      excluded_package_families: sortedExcludedPackageFamilies(
        excludedPackageFamilies,
      ),
      document: null,
    };
  }
  if (!canonical && !canonicalLimitation) {
    canonicalLimitation =
      "Contextual reference: complete workflow setup and acceptance are not supplied for this unconverted material.";
  }
  for (const source of canonical?.source_records ?? []) sources.add(source);
  return {
    contract: "salt-knowledge-document/1",
    status: "resolved",
    identifier,
    bundle,
    choices: [choice],
    excluded_package_families: sortedExcludedPackageFamilies(
      excludedPackageFamilies,
    ),
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
        record_key: `record:${choice.reference.family}:${choice.reference.id}`,
        source_records: [...sources].sort(),
        bundle_digest: store.manifest.bundle_digest,
      },
      ...(canonical ? { canonical } : {}),
      ...(canonicalLimitation ? { limitations: [canonicalLimitation] } : {}),
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
                renderUntrustedMarkdownEvidence(choice.title, {
                  mode: "inline",
                }) +
                " (" +
                renderUntrustedMarkdownEvidence(choice.reference.family, {
                  mode: "inline",
                }) +
                "/" +
                renderUntrustedMarkdownEvidence(choice.reference.id, {
                  mode: "inline",
                }) +
                ")",
            )
            .join("\n");
    return (
      "# Salt docs: " +
      renderUntrustedMarkdownEvidence(result.identifier || "(empty)", {
        mode: "inline",
      }) +
      "\n\nStatus: " +
      result.status +
      choices +
      "\n\nBundle: " +
      renderUntrustedMarkdownEvidence(result.bundle.digest, {
        mode: "inline",
      }) +
      "\n"
    );
  }
  if (result.document.canonical) {
    const nativeComponentDetail =
      result.document.reference.family === "component" &&
      !result.identifier.includes("#") &&
      result.document.content
        ? `\n## Component reference\n\n${renderUntrustedMarkdownEvidence(result.document.content.value, { mode: "block" })}\n`
        : "";
    return `${renderCanonicalDocument(result.document.canonical)}${nativeComponentDetail}\nBundle: ${renderUntrustedMarkdownEvidence(result.bundle.digest, { mode: "inline" })}\n`;
  }
  const content = result.document.content
    ? "\n\n## Verified detail\n\n" +
      renderUntrustedMarkdownEvidence(result.document.content.value, {
        mode: "block",
      })
    : "";
  const sources = result.document.citation.source_records.length
    ? "\nSources: " +
      result.document.citation.source_records
        .map((source) =>
          renderUntrustedMarkdownEvidence(source, { mode: "inline" }),
        )
        .join(", ")
    : "";
  const limitations = result.document.limitations?.length
    ? "\n\n## Context limits\n\n" +
      result.document.limitations
        .map(
          (limitation) =>
            "- " +
            renderUntrustedMarkdownEvidence(limitation, { mode: "inline" }),
        )
        .join("\n")
    : "";
  return (
    "# " +
    renderUntrustedMarkdownEvidence(result.document.title, {
      mode: "inline",
    }) +
    "\n\nEvidence:\n\n" +
    renderUntrustedMarkdownEvidence(result.document.summary, {
      mode: "block",
    }) +
    "\n\nRecord: " +
    renderUntrustedMarkdownEvidence(result.document.citation.record_key, {
      mode: "inline",
    }) +
    "\nBundle: " +
    renderUntrustedMarkdownEvidence(result.document.citation.bundle_digest, {
      mode: "inline",
    }) +
    sources +
    content +
    limitations +
    "\n"
  );
}
