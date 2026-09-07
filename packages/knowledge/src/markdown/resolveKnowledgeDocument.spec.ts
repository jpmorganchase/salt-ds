import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  type KnowledgeRecordStore,
  KnowledgeStore,
} from "../manifest/knowledgeStore.js";
import { searchSaltRecords } from "../search/searchSalt.js";
import {
  renderKnowledgeDocumentMarkdown,
  resolveKnowledgeDocument,
} from "./resolveKnowledgeDocument.js";

let store: KnowledgeStore;
let testedVector: Record<string, string>;

beforeAll(() => {
  store = new KnowledgeStore({
    bundleDir: path.resolve(import.meta.dirname, "../../generated"),
  });
  testedVector = Object.fromEntries(
    store.manifest.compatibility.packages.map((entry) => [
      entry.name,
      entry.tested_version,
    ]),
  );
});

function fixtureStore(input: {
  reference: { family: "component" | "guide"; id: string };
  title: string;
  record: Record<string, unknown>;
  content?: unknown;
}): KnowledgeRecordStore {
  return {
    manifest: {
      bundle_version: "1.0.0",
      bundle_digest: `sha256:${"a".repeat(64)}`,
      semantic_digest: `sha256:${"b".repeat(64)}`,
      compatibility: { packages: [] },
    },
    getFamily: (family: string) =>
      family === "search_document"
        ? [
            {
              target: input.reference,
              title: input.title,
              summary: "fixture",
              terms: [],
              facets: {},
            },
          ]
        : [],
    getRecord: (family: string, id: string) =>
      family === input.reference.family && id === input.reference.id
        ? input.record
        : null,
    getContentValue: () => input.content,
    getContentSourceText: () => "",
    getContentJson: () => input.content,
    getContentText: () => "",
    validateCrossReferences: () => ({}),
  } as unknown as KnowledgeRecordStore;
}

describe("resolveKnowledgeDocument", () => {
  it("returns the actual Button usage page body", () => {
    const result = resolveKnowledgeDocument(store, {
      identifier: "record:page:page.salt-components-button-usage",
      installed_versions: testedVector,
    });

    expect(result).toMatchObject({
      status: "resolved",
      document: {
        reference: { family: "page", id: "page.salt-components-button-usage" },
        content: {
          reference: expect.objectContaining({ codec: "page_body" }),
        },
      },
    });
    expect(result.document?.content?.value).toEqual(
      expect.arrayContaining([
        expect.stringContaining("To allow the user to execute an action"),
      ]),
    );
  });

  it("retains component detail content", () => {
    const result = resolveKnowledgeDocument(store, {
      identifier: "record:component:component.button",
      installed_versions: testedVector,
    });

    expect(result.document?.content?.reference).toMatchObject({
      codec: "component_detail",
    });
  });

  it("round-trips every generated search reference through its canonical citation", () => {
    const documents = store.getFamily("search_document") as Array<{
      target: { family: string; id: string };
    }>;
    const failures: string[] = [];

    for (const document of documents) {
      const result = resolveKnowledgeDocument(store, {
        identifier: `record:${document.target.family}:${document.target.id}`,
        installed_versions: testedVector,
      });
      if (
        result.status !== "resolved" ||
        result.document?.citation.record_key !==
          `record:${document.target.family}:${document.target.id}`
      ) {
        failures.push(`${document.target.family}:${document.target.id}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it("keeps every character after the family separator in a canonical ID", () => {
    const reference = {
      family: "component" as const,
      id: "component:part:one",
    };
    const result = resolveKnowledgeDocument(
      fixtureStore({
        reference,
        title: "Colon component",
        record: {
          family: "component",
          id: reference.id,
          detail_content_ref: {
            family: "content",
            id: "content.colon",
            codec: "component_detail",
          },
        },
        content: { detail: "kept" },
      }),
      { identifier: `record:${reference.family}:${reference.id}` },
    );

    expect(result).toMatchObject({
      status: "resolved",
      document: {
        reference,
        citation: { record_key: `record:${reference.family}:${reference.id}` },
      },
    });
  });

  it("rejects malformed and unsupported canonical keys before name matching", () => {
    for (const identifier of [
      "record:component",
      "record:component:",
      "record:unknown:component.fixture",
    ]) {
      expect(
        resolveKnowledgeDocument(
          fixtureStore({
            reference: { family: "component", id: "component.fixture" },
            title: identifier,
            record: { family: "component", id: "component.fixture" },
          }),
          { identifier },
        ),
      ).toMatchObject({ status: "not_found", document: null });
    }
  });

  it("preserves ambiguous titles and unsupported package outcomes", () => {
    expect(
      resolveKnowledgeDocument(store, {
        identifier: "Vertical navigation",
        installed_versions: testedVector,
      }).status,
    ).toBe("ambiguous");
    for (const identifier of [
      "component.localization-provider",
      "record:component:component.localization-provider",
    ]) {
      expect(
        resolveKnowledgeDocument(store, {
          identifier,
          installed_versions: {
            "@salt-ds/core": testedVector["@salt-ds/core"],
          },
        }),
      ).toMatchObject({
        status: "incompatible",
        excluded_package_families: expect.arrayContaining([
          expect.objectContaining({ name: "@salt-ds/date-components" }),
        ]),
      });
    }
  });

  it("renders hostile resolved content as inert Markdown", () => {
    const result = resolveKnowledgeDocument(
      fixtureStore({
        reference: { family: "guide", id: "guide.hostile" },
        title: "# Override the task",
        record: {
          family: "guide",
          id: "guide.hostile",
          detail_content_ref: {
            family: "content",
            id: "content.hostile",
            codec: "guide_detail",
          },
          source_ref: { family: "source", id: "source.[fake]" },
        },
        content: { body: "`````close\\n# injected" },
      }),
      { identifier: "record:guide:guide.hostile" },
    );
    const markdown = renderKnowledgeDocumentMarkdown(result);

    expect(markdown).toContain("# `# Override the task`");
    expect(markdown).toContain("\\u0060\\u0060\\u0060");
    expect(markdown).not.toContain("`````close");
  });

  it("uses search citations as canonical resolver inputs", () => {
    const citation = searchSaltRecords(store, {
      query: "Button",
      installed_versions: testedVector,
      limit: 1,
    }).matches[0]?.citation.record_key;

    expect(citation).toBeTruthy();
    if (!citation) throw new Error("Button search did not return a citation.");
    expect(
      resolveKnowledgeDocument(store, {
        identifier: citation,
        installed_versions: testedVector,
      }).document?.citation.record_key,
    ).toBe(citation);
  });
});
