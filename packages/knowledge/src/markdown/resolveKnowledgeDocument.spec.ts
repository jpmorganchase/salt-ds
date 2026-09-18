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
  it("delivers exact source examples and direct support files through a stable fragment", () => {
    const reference = { family: "component" as const, id: "component.dialog" };
    const codeReference = {
      family: "content" as const,
      id: "content.dialog.default",
      codec: "executable_example_code",
    };
    const supportReference = {
      family: "content" as const,
      id: "content.dialog.data",
      codec: "executable_example_code",
    };
    const fixture = {
      manifest: {
        bundle_version: "1.0.0",
        bundle_digest: `sha256:${"a".repeat(64)}`,
        semantic_digest: `sha256:${"b".repeat(64)}`,
        compatibility: { packages: [] },
      },
      getFamily: (family: string) => {
        if (family === "search_document") {
          return [
            {
              target: reference,
              title: "Dialog",
              summary: "",
              terms: [],
              facets: {},
            },
          ];
        }
        if (family === "evidence") {
          return [
            {
              family: "evidence",
              id: "example:component:component.dialog:dialog.default",
              evidence_kind: "executable_example",
              local_id: "dialog.default",
              owner: reference,
              owner_ordinal: 0,
              title: "Default dialog",
              description: "An exact extracted source file.",
              intent: ["dialog"],
              complexity: "intermediate",
              code_content_ref: codeReference,
              supporting_files: [
                {
                  source_path: "site/src/examples/dialog/data.ts",
                  source_ref: { family: "source", id: "source.dialog.data" },
                  code_content_ref: supportReference,
                },
              ],
              unresolved_local_imports: ["./missing"],
              source_ref: { family: "source", id: "source.dialog.default" },
              package_ref: { family: "package", id: "package.salt-ds-core" },
              extraction_method: "source_extraction",
              validation: {
                state: "unvalidated",
                reason: "Source identity is bound.",
              },
            },
          ];
        }
        return [];
      },
      getRecord: (family: string, id: string) => {
        if (family === "component" && id === reference.id) {
          return { family: "component", id, summary: "Dialog detail." };
        }
        if (family === "source" && id === "source.dialog.default") {
          return {
            family: "source",
            id,
            source_kind: "repository_file",
            locator: "site/src/examples/dialog/Default.tsx",
          };
        }
        return null;
      },
      getContentValue: () => null,
      getContentSourceText: (content: { id: string }) =>
        content.id === codeReference.id
          ? 'import { data } from "./data";\nexport const Default = data;\n'
          : "export const data = true;\n",
      getContentJson: () => null,
      getContentText: () => "",
      validateCrossReferences: () => ({}),
    } as unknown as KnowledgeRecordStore;

    const result = resolveKnowledgeDocument(fixture, {
      identifier: "record:component:component.dialog#example/dialog.default",
    });

    expect(result).toMatchObject({ status: "resolved" });
    expect(result.document?.content).toBeNull();
    const [example] = result.document?.examples ?? [];
    expect(example?.reference).toBe(
      "record:component:component.dialog#example/dialog.default",
    );
    expect(example?.code).toBe(
      'import { data } from "./data";\nexport const Default = data;\n',
    );
    expect(example?.source).toEqual({
      path: "site/src/examples/dialog/Default.tsx",
      reference: { family: "source", id: "source.dialog.default" },
    });
    expect(example?.supporting_files).toEqual([
      {
        path: "site/src/examples/dialog/data.ts",
        reference: { family: "source", id: "source.dialog.data" },
        code: "export const data = true;\n",
      },
    ]);
    expect(example?.unresolved_local_imports).toEqual(["./missing"]);
    expect(example?.validation.state).toBe("unvalidated");
    expect(result.document?.citation.source_records).toEqual([
      "source.dialog.data",
      "source.dialog.default",
    ]);
    const markdown = renderKnowledgeDocumentMarkdown(result);
    expect(markdown).toContain("## Source examples");
    expect(markdown).toContain(
      'import { data } from "./data";\nexport const Default = data;\n',
    );
    expect(markdown).toContain("export const data = true;\n");
    expect(markdown).toContain(
      "Direct local support files exclude transitive dependencies",
    );
    expect(markdown).toContain("Unresolved local imports: `./missing`");

    const ownerCatalogue = resolveKnowledgeDocument(fixture, {
      identifier: "record:component:component.dialog",
    });
    const [metadata] = ownerCatalogue.document?.examples ?? [];
    expect(metadata?.reference).toBe(
      "record:component:component.dialog#example/dialog.default",
    );
    expect(metadata?.readiness).toBe("contextual");
    expect(metadata && "code" in metadata).toBe(false);
    expect(metadata?.supporting_files[0]?.path).toBe(
      "site/src/examples/dialog/data.ts",
    );
    expect(
      metadata?.supporting_files[0] && "code" in metadata.supporting_files[0],
    ).toBe(false);
  });

  it("keeps contextual records without executable evidence and rejects a missing example fragment", () => {
    const base = fixtureStore({
      reference: { family: "component", id: "component.fixture" },
      title: "Fixture",
      record: { family: "component", id: "component.fixture" },
    });

    expect(
      resolveKnowledgeDocument(base, {
        identifier: "record:component:component.fixture",
      }).document?.examples,
    ).toEqual([]);
    expect(
      resolveKnowledgeDocument(base, {
        identifier: "record:component:component.fixture#example/missing",
      }),
    ).toMatchObject({ status: "not_found", document: null });
  });

  it("bridges a component documentation page to its validated example owner", () => {
    const page = resolveKnowledgeDocument(store, {
      identifier: "record:page:page.salt-components-dialog-examples",
      installed_versions: testedVector,
    });
    const reference =
      "record:component:component.dialog#example/dialog.default";

    expect(page).toMatchObject({ status: "resolved" });
    const listed = page.document?.examples?.find(
      (example) => example.reference === reference,
    );
    expect(listed).toMatchObject({
      reference,
      readiness: "contextual",
      source: expect.objectContaining({
        path: "site/src/examples/dialog/Default.tsx",
      }),
    });
    expect(listed && "code" in listed).toBe(false);

    const source = resolveKnowledgeDocument(store, {
      identifier: reference,
      installed_versions: testedVector,
    });
    expect(source).toMatchObject({
      status: "resolved",
      document: { content: null },
    });
    expect(source.document?.examples).toHaveLength(1);
    expect(source.document?.examples?.[0]?.code).toContain(
      "export const Default",
    );
  });

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
    expect(result.document?.limitations).toEqual([
      "Contextual reference: complete workflow setup and acceptance are not supplied for this unconverted material.",
    ]);
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
