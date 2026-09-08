import { describe, expect, it } from "vitest";
import { parseSelectedMdxDocument } from "../../build/selectedMdxDocument.js";
import { assembleCanonicalDocument } from "../../documents/assembleCanonicalDocument.js";
import type { KnowledgeRecordStore } from "../../manifest/knowledgeStore.js";
import {
  buildKnowledgeContext,
  renderKnowledgeContext,
} from "../../search/searchSalt.js";

function oversizedSectionStore(body: string): KnowledgeRecordStore {
  const guide = {
    family: "guide",
    id: "guide.pending",
    name: "Pending save",
    summary: "Keep the draft while saving.",
    detail_content_ref: {
      family: "content",
      id: "content.pending",
      codec: "document_detail",
    },
  };
  const document = parseSelectedMdxDocument({
    source: {
      document_id: guide.id,
      source_path: "site/docs/pending.mdx",
      route: "/salt/pending",
    },
    mdx: `## Pending save\n\n${body}\n`,
    selectors: [
      {
        id: "pending",
        heading_path: ["Pending save"],
        include_descendants: true,
      },
    ],
  });
  return {
    manifest: {
      bundle_digest: `sha256:${"a".repeat(64)}`,
      semantic_digest: `sha256:${"b".repeat(64)}`,
      compatibility: { packages: [] },
    },
    getFamily: (family: string) =>
      family === "search_document"
        ? [
            {
              target: { family: guide.family, id: guide.id },
              title: guide.name,
              summary: guide.summary,
              terms: ["pending", "save"],
              facets: {},
            },
          ]
        : [],
    getRecord: () => guide,
    getContentValue: () => ({
      document,
      recipe_manifest: null,
      source_refs: [],
      component_refs: [],
      files: [],
      limitations: [],
    }),
  } as unknown as KnowledgeRecordStore;
}

describe("canonical context budgets", () => {
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
