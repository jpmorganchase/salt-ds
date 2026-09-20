import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { canonicalJson } from "../manifest/canonicalJson.js";
import { sha256Digest } from "../manifest/digestCodec.js";
import {
  createKnowledgeStore,
  type KnowledgeStore,
} from "../manifest/knowledgeStore.js";
import { resolveKnowledgeDocument } from "../markdown/resolveKnowledgeDocument.js";
import {
  buildKnowledgeContext,
  type KnowledgeContextResult,
  renderKnowledgeContext,
} from "./searchSalt.js";

interface EvidenceRequirement {
  document: string;
  section: string;
  source: string;
  fragments: string[];
}

interface EvidenceQuestion {
  id: string;
  scope: string;
  question: string;
  required: EvidenceRequirement[];
}

interface EvidenceFixture {
  contract: string;
  scope: Record<string, string[]>;
  documents: Record<string, string>;
  sources: Record<string, string>;
  qualifications: {
    document: string;
    readiness: string;
    limitation_facts: string[][];
  };
  qualified_units: string[][];
  cases: EvidenceQuestion[];
}

const fixture = JSON.parse(
  fs.readFileSync(
    path.resolve(
      import.meta.dirname,
      "../__fixtures__/taskEvidenceQuestions.json",
    ),
    "utf8",
  ),
) as EvidenceFixture;

const DEFAULT_BUDGET = 16 * 1024;
const COMPACT_BUDGET = 8 * 1024;

let store: KnowledgeStore;

beforeAll(() => {
  store = createKnowledgeStore({
    bundleDir: path.resolve(import.meta.dirname, "../../generated"),
  });
  store.ensureKnowledgeVerified();
});

// The questions and decisive facts were selected from canonical sources before
// selection was tuned. Short source-backed anchors tolerate editorial changes;
// critical conditions and negation remain explicit. This measures evidence
// coverage, not semantic answers, a holdout, or maintainer approval.
function evidenceText(value: string): string {
  return value
    .replace(/\\([!-/:-@[-`{-~])/gu, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
    .replace(/[`*_]/gu, "")
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/\s+/gu, " ")
    .trim();
}

function containsFactAnchors(
  value: string,
  anchors: readonly string[],
): boolean {
  const text = evidenceText(value);
  return anchors.every((anchor) => text.includes(evidenceText(anchor)));
}

function missingLimitationFacts(limitations: readonly string[]): string[][] {
  return fixture.qualifications.limitation_facts.filter(
    (anchors) =>
      !limitations.some((item) => containsFactAnchors(item, anchors)),
  );
}
function versionsFor(question: EvidenceQuestion): Record<string, string> {
  const versions = new Map<string, string>(
    store.manifest.compatibility.packages.map((entry) => [
      entry.name,
      entry.tested_version,
    ]),
  );
  return Object.fromEntries(
    fixture.scope[question.scope].map((name) => {
      const version = versions.get(name);
      if (!version) throw new Error(`Missing tested package: ${name}`);
      return [name, version];
    }),
  );
}

function inputFor(question: EvidenceQuestion, budget = DEFAULT_BUDGET) {
  return {
    query: question.question,
    installed_versions: versionsFor(question),
    limit: 8,
    max_utf8_bytes: budget,
  };
}

function referenceFor(requirement: EvidenceRequirement): string {
  return `${fixture.documents[requirement.document]}#${requirement.section}`;
}

function missingEvidence(
  question: EvidenceQuestion,
  context: Pick<KnowledgeContextResult, "canonical_documents">,
): EvidenceRequirement[] {
  return question.required.filter((requirement) => {
    const document = context.canonical_documents?.find(
      (entry) => entry.reference === fixture.documents[requirement.document],
    );
    const section = document?.sections.find(
      (entry) => entry.reference === referenceFor(requirement),
    );
    return (
      !section ||
      section.source_path !== fixture.sources[requirement.source] ||
      !containsFactAnchors(section.markdown, requirement.fragments)
    );
  });
}

function missingLabels(
  question: EvidenceQuestion,
  context: Pick<KnowledgeContextResult, "canonical_documents">,
): string[] {
  return missingEvidence(question, context).map(
    (requirement) =>
      `${referenceFor(requirement)}: ${requirement.fragments.join(" / ")}`,
  );
}

function returnedOmissions(context: KnowledgeContextResult): string[] {
  return [
    ...(context.canonical_documents ?? []).flatMap((document) =>
      document.omissions.map((omission) => omission.reference),
    ),
    ...(context.limitations ?? []).flatMap((limitation) =>
      /\bomitted\b/u.test(limitation)
        ? [...limitation.matchAll(/record:[^\s`]+/gu)].map((match) => match[0])
        : [],
    ),
  ];
}

function omissionResolvesEvidence(
  reference: string,
  requirement: EvidenceRequirement,
  question: EvidenceQuestion,
): boolean {
  const documentReference = fixture.documents[requirement.document];
  // A different omitted fragment in the same document is not disclosure that
  // the missing fact was withheld. A whole-document omission is explicit.
  if (
    reference !== documentReference &&
    reference !== referenceFor(requirement)
  )
    return false;
  const result = resolveKnowledgeDocument(store, {
    identifier: reference,
    installed_versions: versionsFor(question),
  });
  if (result.status !== "resolved" || !result.document?.canonical) return false;
  const canonical = result.document.canonical;
  assertWorkflowQualifications({
    canonical_documents: [{ ...canonical, reference: documentReference }],
  });
  return (
    missingEvidence(
      { ...question, required: [requirement] },
      {
        canonical_documents: [{ ...canonical, reference: documentReference }],
      },
    ).length === 0
  );
}

function assertWorkflowQualifications(
  context: Pick<KnowledgeContextResult, "canonical_documents">,
): void {
  const expected = fixture.qualifications;
  const workflow = context.canonical_documents?.find(
    (document) => document.reference === fixture.documents[expected.document],
  );
  if (!workflow) return;
  expect(workflow.readiness).toBe(expected.readiness);
  expect(workflow.recipe_identity).toEqual({
    recipe_sha256: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
    semantic_source_digest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
    content_identity: expect.stringMatching(/^sha256:[0-9a-f]{64}$/u),
  });
  expect(missingLimitationFacts(workflow.limitations)).toEqual([]);
}

function assertQualifiedUnits(context: KnowledgeContextResult): void {
  const sections = (context.canonical_documents ?? []).flatMap(
    (document) => document.sections,
  );
  for (const unit of fixture.qualified_units) {
    if (!sections.some((section) => unit.includes(section.id))) continue;
    const required = fixture.cases
      .flatMap((question) => question.required)
      .filter((requirement) => unit.includes(requirement.section));
    expect(
      missingLabels({ ...fixture.cases[0], required }, context),
      "A returned recommendation must keep its authored conditions and exclusions.",
    ).toEqual([]);
  }
}

function assertReferences(
  question: EvidenceQuestion,
  context: KnowledgeContextResult,
): void {
  const references = new Set([
    ...(context.canonical_documents ?? []).flatMap((document) => [
      document.reference,
      ...document.sections.map((section) => section.reference),
      ...(document.files ?? []).map((file) => file.reference),
      ...document.omissions.map((omission) => omission.reference),
    ]),
    ...(context.contextual_examples ?? []).map((example) => example.reference),
    ...returnedOmissions(context),
    ...context.matches.map((match) => match.citation.record_key),
  ]);
  for (const identifier of references) {
    expect(
      resolveKnowledgeDocument(store, {
        identifier,
        installed_versions: versionsFor(question),
      }).status,
      `Unresolvable pilot reference: ${identifier}`,
    ).toBe("resolved");
  }
}

function assertMarkdownEvidence(
  context: KnowledgeContextResult,
  markdown: string,
): void {
  const text = evidenceText(markdown);
  for (const document of context.canonical_documents ?? []) {
    for (const section of document.sections) {
      // Preserve evidence through rendering without freezing labels, spacing,
      // inline formatting, or adjacency between evidence and its citation.
      expect(text).toContain(evidenceText(section.markdown));
      expect(markdown).toContain(section.reference);
    }
    for (const omission of document.omissions) {
      expect(markdown).toContain(omission.reference);
    }
    if (
      document.reference === fixture.documents[fixture.qualifications.document]
    ) {
      expect(text).toContain(fixture.qualifications.readiness);
      if (!document.recipe_identity)
        throw new Error("Missing workflow identity.");
      expect(markdown).toContain(document.recipe_identity.recipe_sha256);
      expect(markdown).toContain(document.recipe_identity.content_identity);
      for (const anchors of fixture.qualifications.limitation_facts) {
        expect(containsFactAnchors(markdown, anchors)).toBe(true);
      }
    }
  }
  for (const reference of returnedOmissions(context)) {
    expect(markdown).toContain(reference);
  }
}
function assertTransport(
  question: EvidenceQuestion,
  context: KnowledgeContextResult,
  budget: number,
): void {
  const input = inputFor(question, budget);
  expect(buildKnowledgeContext(store, input)).toEqual(context);
  expect(context.utf8_bytes).toBe(
    Buffer.byteLength(JSON.stringify(context), "utf8"),
  );
  expect(context.utf8_bytes + 1).toBeLessThanOrEqual(budget);
  const {
    context_digest: digest,
    utf8_bytes: _bytes,
    ...digestInput
  } = context;
  expect(digest).toBe(sha256Digest(canonicalJson(digestInput)));
  const markdown = renderKnowledgeContext(store, input);
  expect(Buffer.byteLength(markdown, "utf8")).toBeLessThanOrEqual(budget);
  expect(markdown).toContain(digest);
  assertWorkflowQualifications(context);
  assertMarkdownEvidence(context, markdown);
  assertQualifiedUnits(context);
  assertReferences(question, context);
}

describe("content-led task knowledge pilot", () => {
  it("keeps ten independently authored development questions and exact package scopes", () => {
    expect(fixture.contract).toBe("salt-task-evidence-development/1");
    expect(fixture.cases).toHaveLength(10);
    expect(new Set(fixture.cases.map((question) => question.id)).size).toBe(10);
    for (const question of fixture.cases) {
      expect(fixture.scope[question.scope]).toEqual([
        "@salt-ds/core",
        "@salt-ds/icons",
        "@salt-ds/lab",
        "@salt-ds/theme",
      ]);
      expect(question.required.length).toBeGreaterThan(0);
      for (const requirement of question.required) {
        expect(fixture.documents[requirement.document]).toBeDefined();
        expect(fixture.sources[requirement.source]).toBeDefined();
        expect(requirement.fragments.length).toBeGreaterThan(0);
      }
    }
  });

  it.each(fixture.cases)(
    "includes source-backed decisive evidence at 16 KiB: $id",
    (question) => {
      const context = buildKnowledgeContext(store, inputFor(question));
      expect(missingLabels(question, context)).toEqual([]);
      assertTransport(question, context, DEFAULT_BUDGET);
    },
    30_000,
  );

  it("retains validation evidence when a task also asks about focus", () => {
    const validation = fixture.cases.find(
      (question) => question.id === "invalid-fields",
    );
    if (!validation) throw new Error("Missing invalid-fields question.");
    const question = {
      ...validation,
      question: "What happens to focus when submitted fields are invalid?",
    };
    const context = buildKnowledgeContext(store, inputFor(question));
    expect(missingLabels(question, context)).toEqual([]);
    assertTransport(question, context, DEFAULT_BUDGET);
  });

  it.each(fixture.cases)(
    "keeps evidence or discloses relevant resolvable omissions at 8 KiB: $id",
    (question) => {
      const context = buildKnowledgeContext(
        store,
        inputFor(question, COMPACT_BUDGET),
      );
      const omissions = returnedOmissions(context);
      const missing = missingEvidence(question, context);
      expect(
        missing
          .filter(
            (requirement) =>
              !omissions.some((reference) =>
                omissionResolvesEvidence(reference, requirement, question),
              ),
          )
          .map(referenceFor),
      ).toEqual([]);
      if (missing.length > 0) {
        expect(context.truncated).toBe(true);
        expect(omissions.length).toBeGreaterThan(0);
      }
      assertTransport(question, context, COMPACT_BUDGET);
    },
    30_000,
  );

  it("fails evidence coverage when a decisive clause disappears despite retaining its record and section", () => {
    const question = fixture.cases.find(
      (entry) => entry.id === "invalid-fields",
    );
    if (!question) throw new Error("Missing invalid-fields question.");
    const context = buildKnowledgeContext(store, inputFor(question));
    expect(missingLabels(question, context)).toEqual([]);
    const mutated = structuredClone(context);
    const requirement = question.required[0];
    const section = mutated.canonical_documents
      ?.flatMap((document) => document.sections)
      .find((entry) => entry.reference === referenceFor(requirement));
    if (!section) throw new Error("Missing validation evidence to mutate.");
    const originalReference = section.reference;
    const decisiveClause = "error summary";
    expect(evidenceText(section.markdown)).toContain(decisiveClause);
    section.markdown = section.markdown.replace(
      /error summary/gu,
      "show an unspecified message",
    );
    expect(section.reference).toBe(originalReference);
    expect(missingEvidence(question, mutated)).toContain(requirement);
  });

  it("rejects compact evidence that loses a limitation's negation while retaining the same guide", () => {
    const question = fixture.cases.find(
      (entry) => entry.id === "example-limits",
    );
    if (!question) throw new Error("Missing example-limits question.");
    const context = buildKnowledgeContext(
      store,
      inputFor(question, COMPACT_BUDGET),
    );
    assertWorkflowQualifications(context);
    const mutated = structuredClone(context);
    const workflow = mutated.canonical_documents?.find(
      (document) =>
        document.reference ===
        fixture.documents[fixture.qualifications.document],
    );
    if (!workflow) throw new Error("Missing workflow to mutate.");
    const originalReference = workflow.reference;
    workflow.limitations = workflow.limitations.map((entry) =>
      entry.replace(/does not model/gu, "models"),
    );
    expect(workflow.reference).toBe(originalReference);
    expect(() => assertWorkflowQualifications(mutated)).toThrow();
  });

  it("does not treat an omission link as a substitute for a retained recommendation's exclusion", () => {
    const question = fixture.cases.find(
      (entry) => entry.id === "editor-surface",
    );
    if (!question) throw new Error("Missing editor-surface question.");
    const context = buildKnowledgeContext(store, inputFor(question));
    assertQualifiedUnits(context);
    const mutated = structuredClone(context);
    const exclusion = question.required.find(
      (entry) => entry.section === "dialog.using.when-not-to-use",
    );
    const workflow = mutated.canonical_documents?.find(
      (document) => document.reference === fixture.documents.workflow,
    );
    if (!workflow || !exclusion) throw new Error("Missing decision evidence.");
    workflow.sections = workflow.sections.filter(
      (section) => section.reference !== referenceFor(exclusion),
    );
    workflow.omissions.push({
      reference: referenceFor(exclusion),
      title: "When not to use",
      reason: "Omitted to fit a compact output budget.",
    });
    mutated.truncated = true;
    expect(
      omissionResolvesEvidence(referenceFor(exclusion), exclusion, question),
    ).toBe(true);
    expect(() => assertQualifiedUnits(mutated)).toThrow();
  });
  it("does not return the pilot's canonical evidence for unsupported packages", () => {
    const question = fixture.cases[0];
    const context = buildKnowledgeContext(store, {
      ...inputFor(question),
      installed_versions: Object.fromEntries(
        fixture.scope[question.scope].map((name) => [name, "999.0.0"]),
      ),
    });
    expect(context.canonical_documents ?? []).toEqual([]);
    expect(context.excluded_package_families).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "@salt-ds/core" }),
      ]),
    );
  });

  it("does not invent an applicable task packet for an unmatched query", () => {
    const question = fixture.cases[0];
    const context = buildKnowledgeContext(store, {
      ...inputFor(question),
      query: "qzxv unmatchabletaskvocabulary",
    });
    expect(context.matches).toEqual([]);
    expect(context.canonical_documents ?? []).toEqual([]);
    expect(context.answer_status).toBe("no_applicable_evidence");
  });
});
