import { describe, expect, it } from "vitest";
import { parseSelectedMdxDocument } from "../../build/selectedMdxDocument.js";
import { assembleCanonicalDocument } from "../../documents/assembleCanonicalDocument.js";
import type { KnowledgeRecordStore } from "../../manifest/knowledgeStore.js";
import { resolveKnowledgeDocument } from "../../markdown/resolveKnowledgeDocument.js";
import {
  buildKnowledgeContext,
  renderKnowledgeContext,
} from "../../search/searchSalt.js";

function oversizedSectionStore(
  body: string,
  ids: readonly string[] = ["pending"],
): KnowledgeRecordStore {
  const guides = ids.map((id) => ({
    family: "guide",
    id: `guide.${id}`,
    name: "Pending save",
    summary: "Keep the draft while saving.",
    detail_content_ref: {
      family: "content",
      id: `content.${id}`,
      codec: "document_detail",
    },
  }));
  const documents = new Map(
    guides.map((guide) => [
      guide.detail_content_ref.id,
      parseSelectedMdxDocument({
        source: {
          document_id: guide.id,
          source_path: `site/docs/${guide.id}.mdx`,
          route: `/salt/${guide.id}`,
        },
        mdx: `## Pending save\n\n${body}\n`,
        selectors: [
          {
            id: "pending",
            semantic_role: "behavior" as const,
            heading_path: ["Pending save"],
            include_descendants: true,
          },
        ],
      }),
    ]),
  );
  return {
    manifest: {
      bundle_digest: `sha256:${"a".repeat(64)}`,
      semantic_digest: `sha256:${"b".repeat(64)}`,
      compatibility: { packages: [] },
    },
    getFamily: (family: string) =>
      family === "search_document"
        ? guides.map((guide) => ({
            target: { family: guide.family, id: guide.id },
            title: guide.name,
            summary: guide.summary,
            terms: ["pending", "save"],
            facets: {},
          }))
        : [],
    getRecord: (family: string, id: string) =>
      guides.find((guide) => guide.family === family && guide.id === id) ??
      null,
    getContentValue: (reference: { id: string }) => ({
      document: documents.get(reference.id),
      recipe_manifest: null,
      source_refs: [],
      component_refs: [],
      files: [],
      limitations: [],
    }),
  } as unknown as KnowledgeRecordStore;
}

describe("canonical context budgets", () => {
  it("discloses every oversized guide when no complete section fits", () => {
    const store = oversizedSectionStore(
      "Keep the pending draft until saving completes. ".repeat(200),
      ["pending", "recovery"],
    );
    const input = { query: "pending save", limit: 2, max_utf8_bytes: 2_048 };
    const result = buildKnowledgeContext(store, input);
    const markdown = renderKnowledgeContext(store, input);
    expect(result.canonical_documents).toBeUndefined();
    expect(result.answer_status).toBe("contextual");
    expect(result.truncated).toBe(true);
    for (const reference of [
      "record:guide:guide.pending",
      "record:guide:guide.recovery",
    ]) {
      expect(
        result.limitations?.some((entry) => entry.includes(reference)),
      ).toBe(true);
      expect(markdown).toContain(reference);
      const resolved = resolveKnowledgeDocument(store, {
        identifier: reference,
      });
      expect(resolved.status).toBe("resolved");
      expect(resolved.document?.canonical?.reference).toBe(reference);
      expect(resolved.document?.canonical?.sections[0]?.markdown).toContain(
        "Keep the pending draft until saving completes",
      );
    }
    expect(result.utf8_bytes).toBe(
      Buffer.byteLength(JSON.stringify(result), "utf8"),
    );
    expect(result.utf8_bytes + 1).toBeLessThanOrEqual(input.max_utf8_bytes);
    expect(Buffer.byteLength(markdown, "utf8")).toBeLessThanOrEqual(
      input.max_utf8_bytes,
    );
  });

  it.each([
    ["prose", "Keep the pending draft until saving completes. ".repeat(200)],
    [
      "code",
      `\`\`\`tsx\nconst pending = ${JSON.stringify("draft".repeat(2_000))};\n\`\`\``,
    ],
  ])(
    "retains a cited match when its whole %s section cannot fit",
    (_kind, body) => {
      const store = oversizedSectionStore(body);
      const input = { query: "pending save", limit: 1, max_utf8_bytes: 2_048 };
      const complete = buildKnowledgeContext(store, {
        ...input,
        max_utf8_bytes: 16_384,
      });
      expect(complete.canonical_documents?.[0]?.sections).toHaveLength(1);

      const result = buildKnowledgeContext(store, input);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].citation.record_key).toBe(
        "record:guide:guide.pending",
      );
      expect(result.canonical_documents).toBeUndefined();
      expect(result.answer_status).toBe("contextual");
      expect(result.truncated).toBe(true);
      expect(result.limitations?.join(" ")).toContain(
        "omitted to fit the output budget",
      );
      expect(result.limitations?.join(" ")).toContain(
        "record:guide:guide.pending",
      );
      expect(
        assembleCanonicalDocument(store, result.matches[0].reference)
          ?.reference,
      ).toBe("record:guide:guide.pending");
      expect(result.utf8_bytes + 1).toBeLessThanOrEqual(input.max_utf8_bytes);
      expect(result.utf8_bytes).toBe(
        Buffer.byteLength(JSON.stringify(result), "utf8"),
      );
      const markdown = renderKnowledgeContext(store, input);
      expect(Buffer.byteLength(markdown, "utf8")).toBeLessThanOrEqual(
        input.max_utf8_bytes,
      );
      expect(markdown).toContain("record:guide:guide.pending");
      expect(markdown).not.toContain("```tsx");
    },
  );
});
