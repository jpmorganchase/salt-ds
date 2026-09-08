import { describe, expect, it } from "vitest";

import { sha256Digest } from "../../manifest/digestCodec.js";
import type { KnowledgeRecordStore } from "../../manifest/knowledgeStore.js";
import {
  buildKnowledgeContext,
  renderKnowledgeContext,
} from "../../search/searchSalt.js";

const application = "examples/apps/operations-dashboard";
const recipePath =
  "examples/workflows/operations-dashboard.record-form/recipe.json";
const reusablePaths = [
  "src/workflows/record-form/RecordForm.tsx",
  "src/workflows/record-form/RecordForm.css",
  "src/workflows/record-form/types.ts",
];
const demoPaths = Array.from(
  { length: 8 },
  (_, index) => `src/demo/Demo${index + 1}.tsx`,
);

const text = (value: string) => ({ kind: "text" as const, value });
const inlineCode = (value: string) => ({ kind: "inline_code" as const, value });

function workflowRecipe() {
  const files = [
    ...reusablePaths.map((path) => workflowFile(path, "reusable")),
    workflowFile("package.json", "setup"),
    ...demoPaths.map((path) => workflowFile(path, "demo-only")),
  ];
  return {
    contract: "salt-workflow-recipe/1",
    schema_version: "1.0.0",
    id: "operations-dashboard.record-form",
    title: "Incident record form",
    intent: {
      summary: "Create or adapt an incident record form.",
      aliases: ["incident form"],
    },
    owner: "operations-dashboard",
    source_identity: {
      recipe_sha256: `sha256:${"a".repeat(64)}`,
      semantic_source_digest: `sha256:${"b".repeat(64)}`,
      content_identity: `sha256:${"c".repeat(64)}`,
    },
    source: {
      application,
      recipe: `${application}/src/workflows/record-form/recipe.json`,
      canonical_guidance: ["site/docs/patterns/forms.mdx"],
    },
    files,
    setup: {
      provider: "SaltProvider",
      theme_css: ["@salt-ds/theme/index.css"],
      dependency_manifest: "package.json",
      dialog_wrapper: {
        owner: "RecordDialog",
        required_components: ["Dialog", "FormField"],
        form_components: ["Input", "Button"],
      },
    },
    adaptation: {
      draft_owner: "RecordDialog",
      inputs: ["title"],
      callbacks: ["onSubmit"],
      submission_state: ["idle", "pending", "error", "success"],
      cancellation: "Keep the draft when the dialog closes.",
      simulation: "The demo adapter simulates submission locally.",
    },
    acceptance: {
      automated: ["The submit control is disabled while pending."],
      manual_review_pending: [
        "Review focus order in the installed application.",
      ],
    },
    limitations: [
      "The local demonstration does not call a production service.",
    ],
    support: {
      reusable_packages: [
        { name: "@salt-ds/core", version: "1.2.3", role: "reusable" },
      ],
      demo_packages: [{ name: "vite", version: "7.0.0", role: "demo-only" }],
      external_dependencies: [
        { name: "react", version: "18.3.1", role: "reusable" },
      ],
      provider: "SaltProvider",
      theme_css: ["@salt-ds/theme/index.css"],
    },
    readiness: {
      authored: "runnable",
      delivered: "runnable",
      static_validation: "passed",
      packed_application_acceptance: "required",
      manual_review: "pending",
      pending_reviews: ["Review focus order in the installed application."],
    },
  };
}

function workflowFile(path: string, role: "reusable" | "setup" | "demo-only") {
  const source = `export const ${path.replaceAll(/[^A-Za-z]/gu, "")} = true;\n`;
  const bytes = Buffer.from(source, "utf8");
  return {
    id: `workflow-file:operations-dashboard.record-form:${path}`,
    source_path: `${application}/${path}`,
    path,
    artifact_path: `examples/workflows/operations-dashboard.record-form/files/${path}`,
    role,
    media_type: path.endsWith(".css")
      ? "text/css; charset=utf-8"
      : "text/typescript; charset=utf-8",
    sha256: sha256Digest(bytes),
    bytes: bytes.byteLength,
  };
}

function fixtureStore(
  options: { longFormGuidance?: boolean } = {},
): KnowledgeRecordStore {
  const recipe = workflowRecipe();
  const artifacts = new Map<string, Buffer>([
    [recipePath, Buffer.from(JSON.stringify(recipe), "utf8")],
    ...recipe.files.map(
      (file) =>
        [
          file.artifact_path,
          Buffer.from(
            `export const ${file.id.replaceAll(/[^A-Za-z]/gu, "")} = true;\n`,
            "utf8",
          ),
        ] as const,
    ),
  ]);
  const buttonDocument = {
    contract: "salt-document/1" as const,
    source: {
      document_id: "guide.button.loading",
      source_path: "site/docs/components/button/examples.mdx",
      route: "/salt/components/button/examples",
    },
    sections: [
      {
        id: "loading",
        heading_path: ["Loading"],
        heading: [text("Loading")],
        level: 2,
        blocks: [
          {
            kind: "paragraph" as const,
            children: [
              text("Set "),
              inlineCode("loading"),
              text(" and "),
              inlineCode("loadingAnnouncement"),
              text(" while the action is pending."),
            ],
          },
          {
            kind: "live_preview" as const,
            component_name: "button",
            example_name: "Loading",
            display_name: "Loading Button",
            purpose_section_id: "loading",
            example_source_path: "site/src/examples/button/Loading.tsx",
          },
        ],
      },
    ],
    diagnostics: [],
  };
  const formsDocument = {
    contract: "salt-document/1" as const,
    source: {
      document_id: "guide.forms.workflow",
      source_path: "site/docs/patterns/forms.mdx",
      route: "/salt/patterns/forms",
    },
    sections: [
      {
        id: "overview",
        heading_path: ["Forms"],
        heading: [text("Forms")],
        level: 2,
        blocks: [
          {
            kind: "paragraph" as const,
            children: [
              text(
                options.longFormGuidance
                  ? `${"Detailed verified record guidance. ".repeat(1_000)}Use the verified record form workflow.`
                  : "Use the verified record form workflow.",
              ),
            ],
          },
        ],
      },
    ],
    diagnostics: [],
  };
  const records = new Map<string, Record<string, unknown>>([
    [
      "component:component.button",
      {
        family: "component",
        id: "component.button",
        name: "Button",
        document_ref: { family: "guide", id: "guide.button.loading" },
        detail_content_ref: {
          family: "content",
          id: "content.button.detail",
          codec: "component_detail",
        },
      },
    ],
    [
      "guide:guide.button.loading",
      {
        family: "guide",
        id: "guide.button.loading",
        name: "Button Loading",
        detail_content_ref: {
          family: "content",
          id: "content.button.document",
          codec: "document_detail",
        },
      },
    ],
    [
      "guide:guide.forms.workflow",
      {
        family: "guide",
        id: "guide.forms.workflow",
        name: "Incident form workflow",
        detail_content_ref: {
          family: "content",
          id: "content.forms.document",
          codec: "document_detail",
        },
      },
    ],
  ]);
  const contents = new Map<string, unknown>([
    [
      "content.button.detail",
      {
        props: [
          {
            name: "loading",
            type: "boolean",
            description: "Shows pending state.",
            required: false,
            default: "false",
          },
          {
            name: "loadingAnnouncement",
            type: "string",
            description: "Announces loading status.",
            required: false,
            default: null,
          },
        ],
      },
    ],
    [
      "content.button.document",
      {
        document: buttonDocument,
        recipe_manifest: null,
        source_refs: [{ family: "source", id: "source.button.examples" }],
        component_refs: [{ family: "component", id: "component.button" }],
        files: [
          {
            source_path: "site/src/examples/button/Loading.tsx",
            language: "tsx",
            source_ref: { family: "source", id: "source.button.loading" },
            code_ref: {
              family: "content",
              id: "content.button.loading",
              codec: "guide_snippet_code",
            },
            readiness: "contextual",
          },
        ],
        limitations: ["The selected guidance is contextual."],
      },
    ],
    [
      "content.forms.document",
      {
        document: formsDocument,
        recipe_manifest: recipePath,
        source_refs: [{ family: "source", id: "source.forms" }],
        component_refs: [],
        files: [],
        limitations: [],
      },
    ],
  ]);
  return {
    manifest: {
      bundle_version: "1.0.0",
      bundle_digest: `sha256:${"d".repeat(64)}`,
      semantic_digest: `sha256:${"e".repeat(64)}`,
      compatibility: { packages: [] },
    },
    readArtifact: (path: string) => artifacts.get(path)!,
    getFamily: (family: string) =>
      family === "search_document"
        ? [
            {
              target: { family: "component", id: "component.button" },
              title: "Button",
              summary: "Button component.",
              terms: ["button", "loading"],
              facets: {},
            },
            {
              target: { family: "guide", id: "guide.button.loading" },
              title: "Button Loading",
              summary: "Loading Button guidance.",
              terms: ["button", "loading"],
              facets: {},
            },
            {
              target: { family: "guide", id: "guide.forms.workflow" },
              title: "Incident form workflow",
              summary: "Create and adapt a record form.",
              terms: ["create", "record", "form", "adapt"],
              facets: {},
            },
          ]
        : [],
    getRecord: (family: string, id: string) =>
      records.get(`${family}:${id}`) ?? null,
    getContentValue: (reference: { id: string }) => contents.get(reference.id),
    getContentSourceText: (reference: { id: string }) =>
      reference.id === "content.button.loading"
        ? "export function Loading() {\n  return null;\n}\n"
        : "",
    getContentJson: (reference: { id: string }) => contents.get(reference.id),
    getContentText: () => "",
    validateCrossReferences: () => ({}),
  } as unknown as KnowledgeRecordStore;
}

describe("canonical knowledge context", () => {
  it("deduplicates an attached Button guide and uses narrow coverage for loading props, evidence, and its preview file reference", () => {
    const store = fixtureStore();
    const result = buildKnowledgeContext(store, {
      query: "Button Loading",
      limit: 8,
    });
    expect(result.answer_status).toBe("contextual");
    expect(result.canonical_documents).toHaveLength(1);
    expect(result.canonical_documents?.[0]?.reference).toBe(
      "record:guide:guide.button.loading",
    );
    expect(
      result.canonical_documents?.[0]?.sections.map((section) => section.id),
    ).toEqual([
      "loading",
      "api/Button/loading",
      "api/Button/loadingAnnouncement",
    ]);
    const markdown = renderKnowledgeContext(store, {
      query: "Button Loading",
      limit: 8,
    });
    expect(markdown).toContain(
      "Complete example file: `record:guide:guide.button.loading#file/site/src/examples/button/Loading.tsx`",
    );
    expect(markdown).toContain("## Button\\.loadingAnnouncement");
    expect(markdown).not.toContain("## Prerequisites and setup");
    expect(Buffer.byteLength(JSON.stringify(result), "utf8")).toBe(
      result.utf8_bytes,
    );
    expect(Buffer.byteLength(markdown, "utf8")).toBeLessThanOrEqual(16 * 1024);
  });

  it("keeps a neutral component query contextual when the focused pilot guidance does not cover it", () => {
    const result = buildKnowledgeContext(fixtureStore(), {
      query: "Button",
      limit: 8,
    });
    expect(result.matches).not.toEqual([]);
    expect(result.canonical_documents).toBeUndefined();
    expect(result.answer_status).toBe("contextual");
    expect(result.limitations).toContain(
      "The focused canonical guidance does not cover this neutral query.",
    );
  });

  it("selects whole workflow sections for creation and exposes complete-file references without inserting file bodies", () => {
    const store = fixtureStore();
    const result = buildKnowledgeContext(store, {
      query: "create record form",
      limit: 8,
    });
    const document = result.canonical_documents?.[0];
    expect(result.answer_status).toBe("applicable");
    expect(document?.reference).toBe("record:guide:guide.forms.workflow");
    expect(document?.sections.map((section) => section.id)).toEqual([
      "overview",
      "prerequisites",
      "implementation",
      "adaptation",
      "acceptance",
    ]);
    expect(document?.omissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reference:
            "record:guide:guide.forms.workflow#file/src/workflows/record-form/RecordForm.tsx",
        }),
      ]),
    );
    const markdown = renderKnowledgeContext(store, {
      query: "create record form",
      limit: 8,
    });
    expect(markdown).toContain("Complete files and application setup");
    expect(markdown).toContain("react@18\\.3\\.1");
    expect(markdown).toContain(
      "record:guide:guide.forms.workflow#file/src/workflows/record-form/RecordForm.tsx",
    );
    expect(markdown).not.toContain(
      "workflowfileoperationsdashboardrecordformRecordFormtsx = true",
    );
  });

  it("uses the same workflow evidence for an existing-application adaptation request", () => {
    const result = buildKnowledgeContext(fixtureStore(), {
      query: "adapt an existing record form",
      limit: 8,
    });
    expect(
      result.canonical_documents?.[0]?.sections.map((section) => section.id),
    ).toEqual(
      expect.arrayContaining([
        "prerequisites",
        "implementation",
        "adaptation",
        "acceptance",
      ]),
    );
  });

  it("requires topic coverage before a weak create-term match can include workflow evidence", () => {
    const result = buildKnowledgeContext(fixtureStore(), {
      query: "create unsupported kanban",
      limit: 8,
    });
    expect(result.matches).not.toEqual([]);
    expect(result.canonical_documents).toBeUndefined();
    expect(result.answer_status).toBe("contextual");

    expect(
      buildKnowledgeContext(fixtureStore(), {
        query: "unmatched proprietary kanban",
        limit: 8,
      }),
    ).toMatchObject({ answer_status: "no_applicable_evidence", matches: [] });
  });

  it("keeps a compatible pattern searchable while withholding its incompatible attached workflow", () => {
    const incompatibleAttachedWorkflow = {
      manifest: {
        bundle_digest: `sha256:${"a".repeat(64)}`,
        semantic_digest: `sha256:${"b".repeat(64)}`,
        compatibility: {
          packages: [
            {
              name: "@salt-ds/theme",
              tested_version: "1.2.3",
              supported_range: "1.2.3",
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
                summary: "A form pattern.",
                terms: ["form", "pattern"],
                facets: {},
              },
            ]
          : [],
      getRecord: (family: string, id: string) => {
        if (family === "pattern" && id === "pattern.forms") {
          return {
            family: "pattern",
            id,
            name: "Forms",
            document_ref: {
              family: "guide",
              id: "guide.workflow.requires-theme",
            },
          };
        }
        if (family === "guide" && id === "guide.workflow.requires-theme") {
          return {
            family: "guide",
            id,
            name: "Theme workflow",
            package_refs: [{ family: "package", id: "package.theme" }],
            detail_content_ref: {
              family: "content",
              id: "content.workflow",
              codec: "document_detail",
            },
          };
        }
        if (family === "package" && id === "package.theme") {
          return { family: "package", id, name: "@salt-ds/theme" };
        }
        return null;
      },
      getContentValue: () => {
        throw new Error("Incompatible guidance must not be assembled.");
      },
    } as unknown as KnowledgeRecordStore;

    const result = buildKnowledgeContext(incompatibleAttachedWorkflow, {
      query: "form pattern",
      installed_versions: { "@salt-ds/core": "1.2.3" },
    });
    expect(result.matches).toHaveLength(1);
    expect(result.canonical_documents).toBeUndefined();
    expect(result.answer_status).toBe("contextual");
    expect(result.limitations).toEqual([
      "Attached canonical guidance is incompatible with the installed package vector.",
    ]);
  });

  it("narrows a long canonical candidate before removing useful canonical evidence", () => {
    const store = fixtureStore({ longFormGuidance: true });
    const fullBudget = buildKnowledgeContext(store, {
      query: "create record form",
      limit: 8,
      max_utf8_bytes: 16 * 1024,
    });
    expect(fullBudget.matches).toHaveLength(1);
    expect(
      fullBudget.canonical_documents?.[0]?.sections.map(
        (section) => section.id,
      ),
    ).toEqual(
      expect.arrayContaining(["prerequisites", "adaptation", "acceptance"]),
    );

    const compact = buildKnowledgeContext(store, {
      query: "create record form",
      limit: 8,
      max_utf8_bytes: 2 * 1024,
    });
    expect(compact.matches).toEqual([]);
    expect(compact.truncated).toBe(true);
    expect(
      renderKnowledgeContext(fixtureStore({ longFormGuidance: true }), {
        query: "create record form",
        limit: 8,
        max_utf8_bytes: 8 * 1024,
      }),
    ).toContain(
      "Truncated: yes; evidence was omitted to fit the output budget",
    );
    expect(compact.canonical_documents?.[0]?.sections).toHaveLength(1);
    expect(compact.canonical_documents?.[0]?.sections[0]?.id).toBe(
      "prerequisites",
    );
    expect(compact.canonical_documents?.[0]?.omissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reference: "record:guide:guide.forms.workflow#adaptation",
        }),
        expect.objectContaining({
          reference:
            "record:guide:guide.forms.workflow#file/src/workflows/record-form/RecordForm.tsx",
        }),
      ]),
    );
    expect(compact.utf8_bytes + 1).toBeLessThanOrEqual(2 * 1024);
    expect(
      Buffer.byteLength(
        renderKnowledgeContext(store, {
          query: "create record form",
          limit: 8,
          max_utf8_bytes: 2 * 1024,
        }),
        "utf8",
      ),
    ).toBeLessThanOrEqual(2 * 1024);
  });

  it("marks a response truncated when it keeps a match but withholds canonical sections or files", () => {
    const compact = buildKnowledgeContext(
      fixtureStore({ longFormGuidance: true }),
      {
        query: "create record form",
        limit: 8,
        max_utf8_bytes: 8 * 1024,
      },
    );
    expect(compact.matches).toHaveLength(1);
    expect(
      compact.canonical_documents?.[0]?.sections.map((section) => section.id),
    ).not.toContain("overview");
    expect(compact.canonical_documents?.[0]?.files).toBeUndefined();
    expect(compact.truncated).toBe(true);
    expect(
      renderKnowledgeContext(fixtureStore({ longFormGuidance: true }), {
        query: "create record form",
        limit: 8,
        max_utf8_bytes: 8 * 1024,
      }),
    ).toContain(
      "Truncated: yes; evidence was omitted to fit the output budget",
    );
    expect(compact.canonical_documents?.[0]?.omissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reference: "record:guide:guide.forms.workflow#overview",
        }),
        expect.objectContaining({
          reference:
            "record:guide:guide.forms.workflow#file/src/workflows/record-form/RecordForm.tsx",
        }),
      ]),
    );
  });
});
