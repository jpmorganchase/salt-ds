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
import {
  renderUntrustedMarkdownCode,
  renderUntrustedMarkdownEvidence,
} from "./untrustedMarkdown.js";

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

interface SourceRecord {
  family?: unknown;
  id?: unknown;
  source_kind?: unknown;
  locator?: unknown;
}

interface ExecutableExampleRecord {
  family?: unknown;
  id?: unknown;
  evidence_kind?: unknown;
  local_id?: unknown;
  owner?: unknown;
  owner_ordinal?: unknown;
  title?: unknown;
  description?: unknown;
  intent?: unknown;
  complexity?: unknown;
  code_content_ref?: unknown;
  source_ref?: unknown;
  supporting_files?: unknown;
  unresolved_local_imports?: unknown;
  package_ref?: unknown;
  validation?: unknown;
}

interface EvidenceReference {
  family: "evidence";
  id: string;
}

interface EvidenceIndex {
  executable_by_owner: ReadonlyMap<string, readonly unknown[]>;
  documented_owners_by_page: ReadonlyMap<
    string,
    readonly SaltKnowledgeRecordReference[]
  >;
}

const evidenceIndexByStore = new WeakMap<object, EvidenceIndex>();

export interface KnowledgeDocumentExample {
  reference: string;
  evidence_reference: EvidenceReference;
  local_id: string;
  title: string;
  description: string;
  intent: string[];
  complexity: "basic" | "intermediate" | "advanced";
  readiness: "contextual";
  /** Present only for an explicit `#example/<local_id>` request. */
  code?: string;
  source: {
    reference: { family: "source"; id: string };
    path: string | null;
  };
  supporting_files: Array<{
    path: string;
    reference: { family: "source"; id: string };
    /** Present only for an explicit `#example/<local_id>` request. */
    code?: string;
  }>;
  unresolved_local_imports: string[];
  package: { family: "package"; id: string } | null;
  validation: {
    state: "unvalidated";
    reason: string;
  };
  limitation: string;
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
    examples?: KnowledgeDocumentExample[];
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

function reference<
  T extends "source" | "package" | "component" | "pattern" | "page",
>(value: unknown, family: T): { family: T; id: string } | null {
  if (
    !isRecord(value) ||
    value.family !== family ||
    typeof value.id !== "string"
  )
    return null;
  return { family, id: value.id };
}

function executableExampleRecord(
  value: unknown,
): ExecutableExampleRecord | null {
  if (!isRecord(value) || value.family !== "evidence") return null;
  return value.evidence_kind === "executable_example" ? value : null;
}

function sourcePath(
  store: KnowledgeRecordStore,
  source: { family: "source"; id: string },
): string | null {
  const record = store.getRecord("source", source.id) as SourceRecord | null;
  return record?.family === "source" &&
    record.id === source.id &&
    record.source_kind === "repository_file" &&
    typeof record.locator === "string"
    ? record.locator
    : null;
}

function exampleReference(
  owner: SaltKnowledgeRecordReference,
  localId: string,
): string {
  return `record:${owner.family}:${owner.id}#example/${localId}`;
}

function exampleOwnerReference(
  value: unknown,
): SaltKnowledgeRecordReference | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  if (
    value.family !== "component" &&
    value.family !== "pattern" &&
    value.family !== "page"
  ) {
    return null;
  }
  return { family: value.family, id: value.id };
}

function evidenceIndex(store: KnowledgeRecordStore): EvidenceIndex {
  const cached = evidenceIndexByStore.get(store);
  if (cached) return cached;
  const executableByOwner = new Map<string, unknown[]>();
  const documentedOwnersByPage = new Map<
    string,
    SaltKnowledgeRecordReference[]
  >();
  for (const candidate of store.getFamily("evidence") as unknown[]) {
    if (!isRecord(candidate) || candidate.family !== "evidence") continue;
    if (candidate.evidence_kind === "executable_example") {
      const owner = exampleOwnerReference(candidate.owner);
      if (!owner) continue;
      const key = `${owner.family}:${owner.id}`;
      const entries = executableByOwner.get(key) ?? [];
      entries.push(candidate);
      executableByOwner.set(key, entries);
      continue;
    }
    if (candidate.evidence_kind !== "documentation_link") continue;
    const page = reference(candidate.page_ref, "page");
    const owner = exampleOwnerReference(candidate.owner);
    const validation = isRecord(candidate.validation)
      ? candidate.validation
      : null;
    if (!page || !owner || validation?.state !== "validated") continue;
    const entries = documentedOwnersByPage.get(page.id) ?? [];
    if (
      !entries.some(
        (entry) => entry.family === owner.family && entry.id === owner.id,
      )
    ) {
      entries.push(owner);
      documentedOwnersByPage.set(page.id, entries);
    }
  }
  const index = {
    executable_by_owner: executableByOwner,
    documented_owners_by_page: new Map(
      [...documentedOwnersByPage].map(([page, owners]) => [
        page,
        owners.sort(
          (left, right) =>
            left.family.localeCompare(right.family) ||
            left.id.localeCompare(right.id),
        ),
      ]),
    ),
  } satisfies EvidenceIndex;
  evidenceIndexByStore.set(store, index);
  return index;
}

/**
 * A page may name an example owner only through a validated documentation
 * link. This preserves the authored source relation and never guesses from a
 * route, page title, or filename.
 */
function pageLinkedExampleOwners(
  store: KnowledgeRecordStore,
  page: SaltKnowledgeRecordReference,
): SaltKnowledgeRecordReference[] {
  if (page.family !== "page") return [];
  return (
    evidenceIndex(store).documented_owners_by_page.get(page.id) ?? []
  ).filter((owner) => owner.family !== page.family || owner.id !== page.id);
}

const SOURCE_EXAMPLE_LIMITATION =
  "Source-extracted illustration only; it is not an independently verified portable recipe or complete application setup. Direct local support files exclude transitive dependencies and are not independently verified.";

function examplesForDocument(
  store: KnowledgeRecordStore,
  owner: SaltKnowledgeRecordReference,
  includeCode: boolean,
): KnowledgeDocumentExample[] {
  const entries: KnowledgeDocumentExample[] = [];
  for (const candidate of evidenceIndex(store).executable_by_owner.get(
    `${owner.family}:${owner.id}`,
  ) ?? []) {
    const evidence = executableExampleRecord(candidate);
    const evidenceId = typeof evidence?.id === "string" ? evidence.id : null;
    const localId =
      typeof evidence?.local_id === "string" ? evidence.local_id : null;
    const evidenceOwner = reference(
      evidence?.owner,
      owner.family as "component" | "pattern" | "page",
    );
    const code = contentReference(evidence?.code_content_ref);
    const source = reference(evidence?.source_ref, "source");
    const packageRef = reference(evidence?.package_ref, "package");
    const validation = isRecord(evidence?.validation)
      ? evidence.validation
      : null;
    if (
      !evidence ||
      !evidenceId ||
      !localId ||
      !evidenceOwner ||
      evidenceOwner.id !== owner.id ||
      !code ||
      !source ||
      !validation ||
      validation.state !== "unvalidated" ||
      typeof validation.reason !== "string" ||
      (evidence.complexity !== "basic" &&
        evidence.complexity !== "intermediate" &&
        evidence.complexity !== "advanced")
    ) {
      continue;
    }
    const supportingFiles = Array.isArray(evidence.supporting_files)
      ? evidence.supporting_files.flatMap((file) => {
          if (!isRecord(file) || typeof file.source_path !== "string")
            return [];
          const supportSource = reference(file.source_ref, "source");
          const supportCode = contentReference(file.code_content_ref);
          return supportSource && supportCode
            ? [
                {
                  path: file.source_path,
                  reference: supportSource,
                  ...(includeCode
                    ? { code: store.getContentSourceText(supportCode) }
                    : {}),
                },
              ]
            : [];
        })
      : [];
    entries.push({
      reference: exampleReference(owner, localId),
      evidence_reference: { family: "evidence", id: evidenceId },
      local_id: localId,
      title: typeof evidence.title === "string" ? evidence.title : localId,
      description:
        typeof evidence.description === "string" ? evidence.description : "",
      intent: strings(evidence.intent),
      complexity: evidence.complexity,
      readiness: "contextual",
      ...(includeCode ? { code: store.getContentSourceText(code) } : {}),
      source: { reference: source, path: sourcePath(store, source) },
      supporting_files: supportingFiles.sort((left, right) =>
        left.path.localeCompare(right.path),
      ),
      unresolved_local_imports: strings(evidence.unresolved_local_imports),
      package: packageRef,
      validation: { state: "unvalidated", reason: validation.reason },
      limitation: SOURCE_EXAMPLE_LIMITATION,
    });
  }
  return entries.sort(
    (left, right) =>
      left.local_id.localeCompare(right.local_id) ||
      left.evidence_reference.id.localeCompare(right.evidence_reference.id),
  );
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
  const requestedExample = fragment?.startsWith("example/")
    ? fragment.slice("example/".length)
    : null;
  const examples = examplesForDocument(
    store,
    choice.reference,
    requestedExample !== null,
  );
  if (requestedExample === null) {
    for (const owner of pageLinkedExampleOwners(store, choice.reference)) {
      const compatibility = resolveKnowledgeRecordCompatibility(
        store,
        owner,
        input.installed_versions,
      );
      addExcludedPackageFamilies(excludedPackageFamilies, compatibility);
      if (compatibility.included) {
        examples.push(...examplesForDocument(store, owner, false));
      }
    }
    examples.sort(
      (left, right) =>
        left.reference.localeCompare(right.reference) ||
        left.evidence_reference.id.localeCompare(right.evidence_reference.id),
    );
  }
  const selectedExamples =
    requestedExample === null
      ? examples
      : examples.filter((example) => example.local_id === requestedExample);
  if (requestedExample !== null && selectedExamples.length === 0) {
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
  const contentRef =
    requestedExample === null
      ? primaryContentReference(record, choice.reference.family)
      : null;
  const sources = new Set<string>();
  collectSourceReferences(record, sources);
  let canonical: CanonicalDocumentSelection | null = null;
  let canonicalLimitation: string | undefined;
  const attachedGuideReference = canonicalDocumentReference(
    store,
    choice.reference,
  );
  if (attachedGuideReference && requestedExample === null) {
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
  if (
    fragment !== undefined &&
    (!fragment || (requestedExample === null && !canonical))
  ) {
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
  for (const example of selectedExamples) {
    sources.add(example.source.reference.id);
    for (const file of example.supporting_files) sources.add(file.reference.id);
  }
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
      examples: selectedExamples,
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
  const examples = result.document.examples ?? [];
  const renderedExamples = examples.length
    ? "\n\n## Source examples\n\n" +
      examples
        .map((example) => {
          const source = example.source.path
            ? `${example.source.path} (${example.source.reference.id})`
            : example.source.reference.id;
          const support =
            typeof example.code === "string" && example.supporting_files.length
              ? "\n\nSupporting files:\n\n" +
                example.supporting_files
                  .map(
                    (file) =>
                      `#### ${renderUntrustedMarkdownEvidence(file.path, { mode: "inline" })}\n\nSource: ${renderUntrustedMarkdownEvidence(file.reference.id, { mode: "inline" })}\n\n${renderUntrustedMarkdownCode(file.code ?? "", file.path.split(".").at(-1))}`,
                  )
                  .join("\n\n")
              : "";
          const unresolved = example.unresolved_local_imports.length
            ? "\n\nUnresolved local imports: " +
              example.unresolved_local_imports
                .map((specifier) =>
                  renderUntrustedMarkdownEvidence(specifier, {
                    mode: "inline",
                  }),
                )
                .join(", ")
            : "";
          const code =
            typeof example.code === "string"
              ? `\n\n${renderUntrustedMarkdownCode(example.code, example.source.path?.split(".").at(-1))}${support}`
              : "\n\nCode: omitted from this owner catalogue; resolve the example reference to retrieve its complete extracted source and direct support files.";
          return `### ${renderUntrustedMarkdownEvidence(example.title, { mode: "inline" })}\n\nReference: ${renderUntrustedMarkdownEvidence(example.reference, { mode: "inline" })}\n\nSource: ${renderUntrustedMarkdownEvidence(source, { mode: "inline" })}\n\nReadiness: ${example.readiness}. Validation: ${renderUntrustedMarkdownEvidence(example.validation.state, { mode: "inline" })} — ${renderUntrustedMarkdownEvidence(example.validation.reason, { mode: "inline" })}${code}${unresolved}\n\nLimit: ${renderUntrustedMarkdownEvidence(example.limitation, { mode: "inline" })}`;
        })
        .join("\n\n")
    : "";
  if (result.document.canonical) {
    const nativeComponentDetail =
      result.document.reference.family === "component" &&
      !result.identifier.includes("#") &&
      result.document.content
        ? `\n## Component reference\n\n${renderUntrustedMarkdownEvidence(result.document.content.value, { mode: "block" })}\n`
        : "";
    return `${renderCanonicalDocument(result.document.canonical)}${nativeComponentDetail}${renderedExamples}\n\nBundle: ${renderUntrustedMarkdownEvidence(result.bundle.digest, { mode: "inline" })}\n`;
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
    renderedExamples +
    "\n"
  );
}
