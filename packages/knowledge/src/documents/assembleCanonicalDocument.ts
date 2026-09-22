import { canonicalJsonBytes } from "../manifest/canonicalJson.js";
import { sha256Digest } from "../manifest/digestCodec.js";
import type { KnowledgeRecordStore } from "../manifest/knowledgeStore.js";
import {
  escapeUntrustedMarkdownText,
  renderUntrustedMarkdownCode,
  renderUntrustedMarkdownEvidence,
} from "../markdown/untrustedMarkdown.js";
import type { CatalogPayloadForCodec } from "../records/contentCodecs.js";
import type { DocumentSemanticRole } from "./documentSchema.js";
import {
  documentInlineText,
  documentSectionText,
  renderDocumentSection,
} from "./renderDocument.js";
import {
  type EmittedWorkflowRecipe,
  parseEmittedWorkflowRecipe,
} from "./workflowRecipeSchema.js";

type DocumentDetail = CatalogPayloadForCodec<"document_detail">;
export type CanonicalDocumentStore = Pick<
  KnowledgeRecordStore,
  "getRecord" | "getContentValue" | "getContentSourceText" | "readArtifact"
>;

export interface CanonicalDocumentSection {
  id: string;
  title: string;
  reference: string;
  /** Exact authored provenance for selected MDX and recipe sections. */
  source_path?: string;
  source_url?: string;
  semantic_role?: DocumentSemanticRole;
  qualification_group?: string;
  purpose:
    | "guidance"
    | "prerequisites"
    | "implementation"
    | "adaptation"
    | "acceptance"
    | "api"
    | "file";
  markdown: string;
  search_text: string;
}

export interface CanonicalDocumentFile {
  path: string;
  reference: string;
  role: "reusable" | "setup" | "demo-only" | "contextual-example";
  bytes: number;
  sha256: string;
}

export interface CanonicalDocumentSelection {
  contract: "salt-canonical-document/1";
  reference: string;
  title: string;
  source_url: string;
  source_records: string[];
  content_identity: string;
  recipe_identity: EmittedWorkflowRecipe["source_identity"] | null;
  readiness: "contextual" | "runnable" | "workflow-verified";
  sections: CanonicalDocumentSection[];
  files: CanonicalDocumentFile[];
  limitations: string[];
  omissions: Array<{ reference: string; title: string; reason: string }>;
}

export function canonicalDocumentReference(
  store: CanonicalDocumentStore,
  reference: { family: string; id: string },
): { family: "guide"; id: string } | null {
  const record = store.getRecord(reference.family, reference.id);
  if (
    record?.family === "guide" &&
    record.detail_content_ref?.codec === "document_detail"
  )
    return { family: "guide", id: record.id };
  if (record?.document_ref?.family === "guide") {
    const attached = store.getRecord("guide", record.document_ref.id);
    if (attached?.detail_content_ref?.codec === "document_detail")
      return { family: "guide", id: attached.id };
  }
  return null;
}

function languageForPath(filePath: string): string {
  const extension = filePath.split(".").at(-1) ?? "";
  return extension === "ts" ||
    extension === "tsx" ||
    extension === "css" ||
    extension === "json" ||
    extension === "html"
    ? extension
    : "text";
}

function markdownList(values: readonly string[]): string {
  return values
    .map((value) => `- ${escapeUntrustedMarkdownText(value)}`)
    .join("\n");
}

function readRecipe(
  store: CanonicalDocumentStore,
  artifactPath: string,
): EmittedWorkflowRecipe {
  if (!store.readArtifact)
    throw new Error(
      "The verified artifact reader is required for a workflow recipe.",
    );
  return parseEmittedWorkflowRecipe(
    JSON.parse(store.readArtifact(artifactPath).toString("utf8")),
  );
}

function canonicalSourceUrl(route: string): string {
  return new URL(route, "https://www.saltdesignsystem.com").href;
}

function recipeSections(
  recipe: EmittedWorkflowRecipe,
  base: string,
): CanonicalDocumentSection[] {
  const section = (
    id: string,
    title: string,
    purpose: CanonicalDocumentSection["purpose"],
    body: string,
    searchText: string,
  ): CanonicalDocumentSection => ({
    id,
    title,
    purpose,
    source_path: recipe.source.recipe,
    semantic_role:
      purpose === "prerequisites"
        ? "composition"
        : purpose === "implementation"
          ? "guidance"
          : "behavior",
    reference: `${base}#${id}`,
    markdown: `## ${escapeUntrustedMarkdownText(title)}\n\n${body}`,
    search_text: `${title} ${searchText}`,
  });
  const reusablePackages = [
    ...recipe.support.reusable_packages,
    ...recipe.support.external_dependencies.filter(
      (entry) => entry.role === "reusable",
    ),
  ].map((entry) => `${entry.name}@${entry.version}`);
  const demoPackages = [
    ...recipe.support.demo_packages,
    ...recipe.support.external_dependencies.filter(
      (entry) => entry.role === "demo-only",
    ),
  ].map((entry) => `${entry.name}@${entry.version}`);
  const files = recipe.files.filter((file) => file.role === "reusable");
  const sourceReference = (file: EmittedWorkflowRecipe["files"][number]) =>
    `${base}#file/${file.path}`;
  return [
    section(
      "prerequisites",
      "Prerequisites and setup",
      "prerequisites",
      `Reusable workflow dependencies:\n\n${markdownList(reusablePackages)}\n\nProvider: ${escapeUntrustedMarkdownText(recipe.support.provider)}.\n\nImport the theme CSS once in the host application:\n\n${renderUntrustedMarkdownCode(recipe.support.theme_css.map((file) => `import ${JSON.stringify(file)};`).join("\n"), "tsx")}\n\n${escapeUntrustedMarkdownText(recipe.setup.dialog_wrapper.owner)} supplies ${recipe.setup.dialog_wrapper.required_components.map((name) => renderUntrustedMarkdownEvidence(name, { mode: "inline" })).join(" and ")}. The reusable form supplies ${recipe.setup.dialog_wrapper.form_components.map((name) => renderUntrustedMarkdownEvidence(name, { mode: "inline" })).join(" and ")}.\n\nThe complete demo also uses:\n\n${markdownList(demoPackages)}`,
      `${reusablePackages.join(" ")} ${recipe.support.provider} ${recipe.support.theme_css.join(" ")} provider theme dependencies install setup ${recipe.setup.dialog_wrapper.owner} ${recipe.setup.dialog_wrapper.required_components.join(" ")} ${recipe.setup.dialog_wrapper.form_components.join(" ")}`,
    ),
    section(
      "implementation",
      "Complete files and application setup",
      "implementation",
      `Use these reusable files with your application's existing state and services:\n\n${files.map((file) => `- ${renderUntrustedMarkdownEvidence(file.path, { mode: "inline" })}: ${renderUntrustedMarkdownEvidence(sourceReference(file), { mode: "inline" })}`).join("\n")}\n\nThe file inventory also includes the complete local demonstration application. Its package manifest supplies the declared dependency versions and build commands. Fetch complete files by their references; local adapters simulate worklist loading, refresh, and submission.`,
      `implementation complete reusable files application setup ${files.map((file) => file.path).join(" ")}`,
    ),
    section(
      "adaptation",
      "Adapt an existing application",
      "adaptation",
      `Keep the draft in the host application. The reference host is ${renderUntrustedMarkdownEvidence(recipe.adaptation.draft_owner, { mode: "inline" })}.\n\nInputs: ${recipe.adaptation.inputs.map((value) => renderUntrustedMarkdownEvidence(value, { mode: "inline" })).join(", ")}.\n\nCallbacks: ${recipe.adaptation.callbacks.map((value) => renderUntrustedMarkdownEvidence(value, { mode: "inline" })).join(", ")}.\n\nSubmission states: ${recipe.adaptation.submission_state.map((value) => renderUntrustedMarkdownEvidence(value, { mode: "inline" })).join(", ")}.\n\n${escapeUntrustedMarkdownText(recipe.adaptation.cancellation)}\n\n${escapeUntrustedMarkdownText(recipe.adaptation.simulation)}`,
      `adapt existing application integrate callbacks draft submit state cancellation ${Object.values(recipe.adaptation).flat().join(" ")}`,
    ),
    section(
      "acceptance",
      "States, recovery and acceptance",
      "acceptance",
      `${markdownList(recipe.acceptance.automated)}\n\nReview still required:\n\n${markdownList(recipe.acceptance.manual_review_pending)}\n\nInstalled application acceptance: ${escapeUntrustedMarkdownText(recipe.readiness.packed_application_acceptance)}. Static file checks have passed.`,
      `states validation pending failure retry success keyboard focus accessibility acceptance ${[...recipe.acceptance.automated, ...recipe.acceptance.manual_review_pending, ...recipe.limitations].join(" ")}`,
    ),
  ];
}

function referencedPropNames(detail: DocumentDetail): Set<string> {
  const names = new Set<string>();
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;
    const node = value as Record<string, unknown>;
    if (node.kind === "inline_code" && typeof node.value === "string") {
      for (const name of node.value.match(/[A-Za-z_$][\w$]*/gu) ?? [])
        names.add(name);
    }
    Object.values(node).forEach(visit);
  };
  visit(detail.document.sections);
  return names;
}

function propSections(
  store: CanonicalDocumentStore,
  detail: DocumentDetail,
  base: string,
): CanonicalDocumentSection[] {
  const selectedNames = referencedPropNames(detail);
  return detail.component_refs.flatMap((reference) => {
    const record = store.getRecord("component", reference.id);
    if (record?.detail_content_ref?.codec !== "component_detail") return [];
    const content = store.getContentValue(record.detail_content_ref);
    return (content?.props ?? [])
      .filter((prop: { name: string }) => selectedNames.has(prop.name))
      .map(
        (prop: {
          name: string;
          type: string;
          description: string;
          required: boolean;
          default?: string | null;
        }) => {
          const id = `api/${record.name}/${prop.name}`;
          const title = `${record.name}.${prop.name}`;
          const body = `${renderUntrustedMarkdownEvidence(prop.type, { mode: "inline" })}${prop.required ? " (required)" : " (optional)"}.\n\n${escapeUntrustedMarkdownText(prop.description)}${prop.default == null ? "" : `\n\nDefault: ${renderUntrustedMarkdownEvidence(prop.default, { mode: "inline" })}.`}`;
          return {
            id,
            title,
            reference: `${base}#${id}`,
            purpose: "api" as const,
            markdown: `## ${escapeUntrustedMarkdownText(title)}\n\n${body}`,
            search_text: `${title} ${prop.description}`,
          };
        },
      );
  });
}

/** The same assembly supplies packaged Markdown, docs, and task context. */
export function assembleCanonicalDocument(
  store: CanonicalDocumentStore,
  reference: { family: string; id: string },
  fragment?: string,
): CanonicalDocumentSelection | null {
  const resolved = canonicalDocumentReference(store, reference);
  if (!resolved) return null;
  const record = store.getRecord("guide", resolved.id);
  const detail = store.getContentValue(
    record.detail_content_ref,
  ) as DocumentDetail;
  const recipe = detail.recipe_manifest
    ? readRecipe(store, detail.recipe_manifest)
    : null;
  const base = `record:guide:${resolved.id}`;
  const fileReference = (sourcePath: string) =>
    detail.files.some((file) => file.source_path === sourcePath)
      ? `${base}#file/${sourcePath}`
      : null;
  const options = { fileReference };
  const sections: CanonicalDocumentSection[] = detail.document.sections.map(
    (section) => {
      const source = section.source ?? detail.document.source;
      const sourceUrl = canonicalSourceUrl(source.route);
      return {
        id: section.id,
        title: section.heading
          ? documentInlineText(section.heading)
          : record.name,
        reference: `${base}#${section.id}`,
        source_path: source.source_path,
        source_url: sourceUrl,
        purpose: "guidance",
        semantic_role: section.semantic_role,
        ...(section.qualification_group
          ? { qualification_group: section.qualification_group }
          : {}),
        markdown: `${renderDocumentSection(section, {
          ...options,
          route: source.route,
        })}\n\nSource: [${escapeUntrustedMarkdownText(source.source_path)}](${sourceUrl}).`,
        search_text: documentSectionText(section),
      };
    },
  );
  if (recipe) sections.push(...recipeSections(recipe, base));
  sections.push(...propSections(store, detail, base));
  const files: CanonicalDocumentFile[] = [
    ...detail.files.map((file) => {
      const bytes = Buffer.from(
        store.getContentSourceText(file.code_ref),
        "utf8",
      );
      return {
        path: file.source_path,
        reference: `${base}#file/${file.source_path}`,
        role: "contextual-example" as const,
        bytes: bytes.byteLength,
        sha256: sha256Digest(bytes),
      };
    }),
    ...(recipe?.files ?? []).map((file) => ({
      path: file.path,
      reference: `${base}#file/${file.path}`,
      role: file.role,
      bytes: file.bytes,
      sha256: file.sha256,
    })),
  ];
  const result: CanonicalDocumentSelection = {
    contract: "salt-canonical-document/1",
    reference: fragment ? `${base}#${fragment}` : base,
    title: record.name,
    source_url: canonicalSourceUrl(detail.document.source.route),
    source_records: detail.source_refs.map((entry) => entry.id),
    content_identity: record.detail_content_ref.id,
    recipe_identity: recipe?.source_identity ?? null,
    readiness:
      detail.document.diagnostics.length > 0
        ? "contextual"
        : (recipe?.readiness.delivered ?? "contextual"),
    sections,
    files,
    limitations: [
      ...new Set([
        ...detail.limitations,
        ...(recipe?.limitations ?? []),
        ...detail.document.diagnostics.map(
          (diagnostic) =>
            `${detail.document.source.source_path}:${diagnostic.range.start_line} ${diagnostic.code}: ${diagnostic.message}`,
        ),
      ]),
    ],
    omissions: files.map((file) => ({
      reference: file.reference,
      title: file.path,
      reason: "Complete file available separately.",
    })),
  };
  // Recipe and API facts live outside document_detail. Bind the assembled
  // evidence before selecting a fragment so every surface identifies the same
  // complete source, including exported file identities and readiness.
  result.content_identity = sha256Digest(
    canonicalJsonBytes({
      document_content: record.detail_content_ref.id,
      recipe_identity: result.recipe_identity,
      sections: sections.map(
        ({ search_text: _searchText, ...section }) => section,
      ),
      files,
      readiness: result.readiness,
      limitations: result.limitations,
    }),
  );
  if (!fragment) return result;
  if (fragment.startsWith("file/")) {
    const requestedPath = fragment.slice(5);
    const file = files.find((candidate) => candidate.path === requestedPath);
    if (!file) return null;
    const preview = detail.files.find(
      (candidate) => candidate.source_path === requestedPath,
    );
    const exported = recipe?.files.find(
      (candidate) => candidate.path === requestedPath,
    );
    let code: string;
    if (preview) code = store.getContentSourceText(preview.code_ref);
    else {
      if (!exported || !store.readArtifact) return null;
      const bytes = store.readArtifact(exported.artifact_path);
      if (
        sha256Digest(bytes) !== exported.sha256 ||
        bytes.byteLength !== exported.bytes
      )
        throw new Error(`Workflow file identity mismatch: ${requestedPath}.`);
      code = bytes.toString("utf8");
    }
    result.sections = [
      {
        id: fragment,
        title: requestedPath,
        reference: file.reference,
        purpose: "file",
        markdown: renderUntrustedMarkdownCode(
          code,
          preview?.language ?? languageForPath(requestedPath),
        ),
        search_text: requestedPath,
      },
    ];
    result.files = [file];
    result.omissions = [];
    return result;
  }
  const selected = sections.filter(
    (section) =>
      section.id === fragment || section.id.startsWith(`${fragment}.`),
  );
  if (selected.length === 0) return null;
  result.sections = selected;
  result.omissions.push(
    ...sections
      .filter((section) => !selected.includes(section))
      .map((section) => ({
        reference: section.reference,
        title: section.title,
        reason: "Outside the requested section.",
      })),
  );
  return result;
}

export function renderCanonicalDocument(
  selection: CanonicalDocumentSelection,
): string {
  const recipeIdentity = selection.recipe_identity
    ? `\n\nRecipe declaration: ${renderUntrustedMarkdownEvidence(selection.recipe_identity.recipe_sha256, { mode: "inline" })}\n\nExported files: ${renderUntrustedMarkdownEvidence(selection.recipe_identity.content_identity, { mode: "inline" })}`
    : "";
  return `# ${escapeUntrustedMarkdownText(selection.title)}\n\nReadiness: ${selection.readiness}.\n\nSource: [canonical guidance](${selection.source_url}).\n\nReference: ${renderUntrustedMarkdownEvidence(selection.reference, { mode: "inline" })}\n\nContent: ${renderUntrustedMarkdownEvidence(selection.content_identity, { mode: "inline" })}${recipeIdentity}\n\n${selection.sections.map((section) => `${section.markdown}\n\nSection: ${renderUntrustedMarkdownEvidence(section.reference, { mode: "inline" })}`).join("\n\n")}\n\n${selection.limitations.length ? `## Limits\n\n${markdownList(selection.limitations)}\n\n` : ""}${selection.omissions.length ? `## Further detail\n\n${selection.omissions.map((entry) => `- ${escapeUntrustedMarkdownText(entry.title)}: ${renderUntrustedMarkdownEvidence(entry.reference, { mode: "inline" })} — ${escapeUntrustedMarkdownText(entry.reason)}`).join("\n")}\n` : ""}`;
}
