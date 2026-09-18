import { describe, expect, it } from "vitest";

import type { KnowledgeRecordStore } from "../../manifest/knowledgeStore.js";
import {
  renderKnowledgeDocumentMarkdown,
  resolveKnowledgeDocument,
} from "../../markdown/resolveKnowledgeDocument.js";

function fixtureStore(): KnowledgeRecordStore {
  const records = new Map<string, Record<string, unknown>>([
    [
      "pattern:pattern.forms",
      {
        family: "pattern",
        id: "pattern.forms",
        name: "Forms",
        package_refs: [{ family: "package", id: "package.core" }],
        detail_content_ref: {
          family: "content",
          id: "content.forms.native",
          codec: "pattern_detail",
        },
        document_ref: { family: "guide", id: "guide.forms.workflow" },
      },
    ],
    [
      "guide:guide.forms.workflow",
      {
        family: "guide",
        id: "guide.forms.workflow",
        name: "Forms workflow",
        package_refs: [{ family: "package", id: "package.theme" }],
        detail_content_ref: {
          family: "content",
          id: "content.forms.workflow",
          codec: "document_detail",
        },
      },
    ],
    [
      "package:package.core",
      { family: "package", id: "package.core", name: "@salt-ds/core" },
    ],
    [
      "package:package.theme",
      { family: "package", id: "package.theme", name: "@salt-ds/theme" },
    ],
  ]);
  const contents = new Map<string, unknown>([
    ["content.forms.native", { summary: "Native Forms detail." }],
    [
      "content.forms.workflow",
      {
        document: {
          contract: "salt-document/1",
          source: {
            document_id: "guide.forms.workflow",
            source_path: "site/docs/patterns/forms.mdx",
            route: "/salt/patterns/forms",
          },
          sections: [],
          diagnostics: [],
        },
        recipe_manifest: null,
        source_refs: [],
        component_refs: [],
        files: [],
        limitations: [],
      },
    ],
  ]);
  return {
    manifest: {
      bundle_version: "1.0.0",
      bundle_digest: `sha256:${"a".repeat(64)}`,
      semantic_digest: `sha256:${"b".repeat(64)}`,
      compatibility: {
        packages: [
          {
            name: "@salt-ds/core",
            tested_version: "1.0.0",
            supported_range: "1.0.0",
            required: true,
          },
          {
            name: "@salt-ds/theme",
            tested_version: "2.0.0",
            supported_range: "2.0.0",
            required: false,
          },
        ],
      },
    },
    getFamily: (family: string) =>
      family === "search_document"
        ? [
            {
              target: { family: "pattern", id: "pattern.forms" },
              title: "Forms",
            },
            {
              target: { family: "guide", id: "guide.forms.workflow" },
              title: "Forms workflow",
            },
          ]
        : [],
    getRecord: (family: string, id: string) =>
      records.get(`${family}:${id}`) ?? null,
    getContentValue: (reference: { id: string }) => contents.get(reference.id),
    getContentSourceText: () => "",
    getContentJson: (reference: { id: string }) => contents.get(reference.id),
    getContentText: () => "",
    readArtifact: () => {
      throw new Error("This fixture has no workflow artifact.");
    },
    validateCrossReferences: () => ({}),
  } as unknown as KnowledgeRecordStore;
}

const incompatibleVector = {
  "@salt-ds/core": "1.0.0",
  "@salt-ds/theme": "1.0.0",
};

const compatibleVector = {
  "@salt-ds/core": "1.0.0",
  "@salt-ds/theme": "2.0.0",
};

describe("attached canonical document compatibility", () => {
  it("keeps compatible native pattern detail when its attached guide is incompatible", () => {
    const result = resolveKnowledgeDocument(fixtureStore(), {
      identifier: "record:pattern:pattern.forms",
      installed_versions: incompatibleVector,
    });

    expect(result).toMatchObject({
      status: "resolved",
      excluded_package_families: [
        expect.objectContaining({
          name: "@salt-ds/theme",
          state: "unsupported",
        }),
      ],
      document: {
        content: { value: { summary: "Native Forms detail." } },
        limitations: [
          "Attached canonical guidance is incompatible with the installed package vector.",
        ],
      },
    });
    expect(result.document?.canonical).toBeUndefined();
    expect(renderKnowledgeDocumentMarkdown(result)).toContain(
      "Attached canonical guidance is incompatible with the installed package vector",
    );
  });

  it("serves the attached guide when the complete package vector is compatible", () => {
    const result = resolveKnowledgeDocument(fixtureStore(), {
      identifier: "record:pattern:pattern.forms",
      installed_versions: compatibleVector,
    });

    expect(result).toMatchObject({
      status: "resolved",
      excluded_package_families: [],
      document: {
        canonical: {
          reference: "record:guide:guide.forms.workflow",
        },
      },
    });
  });

  it("rejects a canonical fragment through a compatible pattern when its guide is incompatible", () => {
    expect(
      resolveKnowledgeDocument(fixtureStore(), {
        identifier: "record:pattern:pattern.forms#adaptation",
        installed_versions: incompatibleVector,
      }),
    ).toMatchObject({
      status: "incompatible",
      document: null,
      excluded_package_families: [
        expect.objectContaining({
          name: "@salt-ds/theme",
          state: "unsupported",
        }),
      ],
    });
  });

  it("rejects the direct workflow guide for the incompatible package vector", () => {
    expect(
      resolveKnowledgeDocument(fixtureStore(), {
        identifier: "record:guide:guide.forms.workflow",
        installed_versions: incompatibleVector,
      }),
    ).toMatchObject({
      status: "incompatible",
      document: null,
      excluded_package_families: [
        expect.objectContaining({
          name: "@salt-ds/theme",
          state: "unsupported",
        }),
      ],
    });
  });
});
