import { describe, expect, it } from "vitest";

import { parseSelectedMdxDocument } from "../../build/selectedMdxDocument.js";
import {
  assembleCanonicalDocument,
  canonicalDocumentReference,
  renderCanonicalDocument,
} from "../../documents/assembleCanonicalDocument.js";
import { sha256Digest } from "../../manifest/digestCodec.js";
import type { KnowledgeRecordStore } from "../../manifest/knowledgeStore.js";

const application = "examples/apps/operations-dashboard";
const recipePath =
  "examples/workflows/operations-dashboard.service-worklist/recipe.json";
const reusablePaths = [
  "src/workflows/record-form/RecordForm.tsx",
  "src/workflows/record-form/RecordForm.css",
  "src/workflows/record-form/types.ts",
  "src/workflows/service-worklist/types.ts",
  "src/workflows/service-worklist/IncidentWorklist.tsx",
  "src/workflows/service-worklist/IncidentInspector.tsx",
  "src/workflows/service-worklist/ServiceWorklist.css",
];
const demoPaths = Array.from(
  { length: 9 },
  (_, index) => `src/demo/Demo${index + 1}.tsx`,
);

function recipeFile(
  path: string,
  role: "reusable" | "setup" | "demo-only",
  source: string,
) {
  const bytes = Buffer.from(source, "utf8");
  return {
    id: `workflow-file:operations-dashboard.service-worklist:${path}`,
    source_path: `${application}/${path}`,
    path,
    artifact_path: `examples/workflows/operations-dashboard.service-worklist/files/${path}`,
    role,
    media_type: path.endsWith(".css")
      ? "text/css; charset=utf-8"
      : "text/typescript; charset=utf-8",
    sha256: sha256Digest(bytes),
    bytes: bytes.byteLength,
  };
}

function emittedRecipe() {
  const files = [
    ...reusablePaths.map((path) =>
      recipeFile(
        path,
        "reusable",
        `export const ${path.replaceAll(/[^A-Za-z]/gu, "")} = true;\n`,
      ),
    ),
    recipeFile("package.json", "setup", '{\n  "private": true\n}\n'),
    ...demoPaths.map((path) =>
      recipeFile(
        path,
        "demo-only",
        `export const demo = ${JSON.stringify(path)};\n`,
      ),
    ),
  ];
  return {
    contract: "salt-workflow-recipe/1",
    schema_version: "1.0.0",
    id: "operations-dashboard.service-worklist",
    title: "Validated incident record form",
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
      recipe: `${application}/src/workflows/service-worklist/recipe.json`,
      canonical_guidance: [
        "site/docs/patterns/forms.mdx",
        "site/docs/components/button/examples.mdx#loading",
      ],
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
    limitations: ["The local demo does not call a production service."],
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

function buttonDocument() {
  const global = globalThis as typeof globalThis & {
    __saltMdxExecuted?: boolean;
  };
  delete global.__saltMdxExecuted;
  const document = parseSelectedMdxDocument({
    source: {
      document_id: "guide.button.loading",
      source_path: "site/docs/components/button/examples.mdx",
      route: "/salt/components/button/examples",
    },
    mdx: `## Loading\n\nUse \`loading\` with \`loadingAnnouncement\` for a pending save. [Forms](../../patterns/forms#submission).\n\n<GuidanceCallout type="positive" label="Keep the draft">

Do not discard user input.

</GuidanceCallout>\n\n<Diagram src="/img/patterns/forms/loading.png" alt="Loading form" caption="Pending submission" />\n\n<LivePreview componentName="button" exampleName="Loading" displayName="Loading Button" />\n\n{globalThis.__saltMdxExecuted = true}\n`,
    selectors: [
      { id: "loading", heading_path: ["Loading"], include_descendants: true },
    ],
  });
  expect(global.__saltMdxExecuted).toBeUndefined();
  return document;
}

function composedDocument() {
  const button = buttonDocument();
  const forms = parseSelectedMdxDocument({
    source: {
      document_id: "guide.forms.spacing",
      source_path: "site/docs/patterns/forms.mdx",
      route: "/salt/patterns/forms",
    },
    mdx: "## Spacing\n\nRead [spacing](../foundations/spacing).\n",
    selectors: [
      {
        id: "forms.spacing",
        heading_path: ["Spacing"],
        include_descendants: true,
      },
    ],
  });
  return {
    ...button,
    source: {
      document_id: "guide.dashboard.workflow",
      source_path: "site/docs/patterns/analytical-dashboard.mdx",
      route: "/salt/patterns/analytical-dashboard",
    },
    sections: [...button.sections, ...forms.sections],
  };
}

function fixtureStore(
  options: {
    corruptRecipeFile?: boolean;
    recipeAdaptationChange?: boolean;
    buttonPropFactChange?: boolean;
    composedSources?: boolean;
  } = {},
): KnowledgeRecordStore {
  const document = options.composedSources
    ? composedDocument()
    : buttonDocument();
  const recipe = emittedRecipe();
  if (options.recipeAdaptationChange) {
    recipe.adaptation.cancellation =
      "Keep the host draft after a cancelled submission so it can be retried.";
    recipe.source_identity.recipe_sha256 = `sha256:${"f".repeat(64)}`;
  }
  const artifacts = new Map<string, Buffer>();
  artifacts.set(recipePath, Buffer.from(JSON.stringify(recipe), "utf8"));
  for (const file of recipe.files) {
    const bytes = Buffer.from(
      `export const ${file.id.replaceAll(/[^A-Za-z]/gu, "")} = true;\n`,
      "utf8",
    );
    // Match the declared digest for each exported workflow file.
    artifacts.set(file.artifact_path, bytes);
    file.bytes = bytes.byteLength;
    file.sha256 = sha256Digest(bytes);
  }
  if (options.corruptRecipeFile) {
    const target = recipe.files.find((file) => file.role === "demo-only")!;
    artifacts.set(
      target.artifact_path,
      Buffer.from("altered after verification\n", "utf8"),
    );
    artifacts.set(recipePath, Buffer.from(JSON.stringify(recipe), "utf8"));
  } else {
    artifacts.set(recipePath, Buffer.from(JSON.stringify(recipe), "utf8"));
  }

  const code =
    "  const markdown = `\n`````\n# injected`;\n\n  return markdown;\n";
  const documentDetail = {
    document,
    recipe_manifest: recipePath,
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
    limitations: [
      "This selected excerpt is guidance, not a complete application.",
    ],
  };
  const records = new Map<string, Record<string, unknown>>([
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
  ]);
  const buttonProps = [
    {
      name: "loading",
      type: "boolean",
      description: options.buttonPropFactChange
        ? "Shows a pending state and blocks duplicate actions."
        : "Shows pending state.",
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
    {
      name: "children",
      type: "ReactNode",
      description: "Button contents.",
      required: false,
      default: null,
    },
  ];
  const contents = new Map<string, unknown>([
    ["content.button.document", documentDetail],
    [
      "content.button.detail",
      {
        props: buttonProps,
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
    readArtifact: (path: string) => {
      const value = artifacts.get(path);
      if (!value) throw new Error(`Missing verified artifact: ${path}`);
      return value;
    },
    getFamily: () => [],
    getRecord: (family: string, id: string) =>
      records.get(`${family}:${id}`) ?? null,
    getContentValue: (reference: { id: string }) => contents.get(reference.id),
    getContentSourceText: (reference: { id: string }) =>
      reference.id === "content.button.loading" ? code : "",
    getContentJson: (reference: { id: string }) => contents.get(reference.id),
    getContentText: () => "",
    validateCrossReferences: () => ({}),
  } as unknown as KnowledgeRecordStore;
}

describe("assembleCanonicalDocument", () => {
  it("preserves each selected MDX section's source path, range, and route when composing documents", () => {
    const selection = assembleCanonicalDocument(
      fixtureStore({ composedSources: true }),
      { family: "guide", id: "guide.button.loading" },
    );
    const loading = selection?.sections.find(
      (section) => section.id === "loading",
    );
    const spacing = selection?.sections.find(
      (section) => section.id === "forms.spacing",
    );
    expect(loading).toMatchObject({
      source_path: "site/docs/components/button/examples.mdx",
      source_url:
        "https://www.saltdesignsystem.com/salt/components/button/examples",
    });
    expect(spacing).toMatchObject({
      source_path: "site/docs/patterns/forms.mdx",
      source_url: "https://www.saltdesignsystem.com/salt/patterns/forms",
    });
    expect(loading?.markdown).toContain(
      "Source: [site/docs/components/button/examples\\.mdx]",
    );
    expect(spacing?.markdown).toContain(
      "Source: [site/docs/patterns/forms\\.mdx]",
    );
    const markdown = renderCanonicalDocument(selection!);
    expect(markdown).toContain(
      "[Forms](https://www.saltdesignsystem.com/salt/patterns/forms#submission)",
    );
    expect(markdown).toContain(
      "[spacing](https://www.saltdesignsystem.com/salt/foundations/spacing)",
    );
    expect(markdown).toContain(
      "Source: [site/docs/components/button/examples\\.mdx]",
    );
    expect(markdown).toContain("Source: [site/docs/patterns/forms\\.mdx]");
  });

  it("assembles parent Button loading guidance, matching API props, verified workflow support, and contextual diagnostics", () => {
    const store = fixtureStore();
    expect(
      canonicalDocumentReference(store, {
        family: "component",
        id: "component.button",
      }),
    ).toEqual({ family: "guide", id: "guide.button.loading" });

    const selection = assembleCanonicalDocument(store, {
      family: "component",
      id: "component.button",
    });
    expect(selection).toMatchObject({
      title: "Button Loading",
      source_url:
        "https://www.saltdesignsystem.com/salt/components/button/examples",
      readiness: "contextual",
      recipe_identity: expect.objectContaining({
        recipe_sha256: expect.stringMatching(/^sha256:/u),
      }),
    });
    expect(selection?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "loading", purpose: "guidance" }),
        expect.objectContaining({ id: "api/Button/loading", purpose: "api" }),
        expect.objectContaining({
          id: "api/Button/loadingAnnouncement",
          purpose: "api",
        }),
        expect.objectContaining({
          id: "prerequisites",
          purpose: "prerequisites",
        }),
      ]),
    );
    const prerequisites = selection?.sections.find(
      (section) => section.id === "prerequisites",
    )?.markdown;
    expect(prerequisites).toContain("@salt\\-ds/core@1\\.2\\.3");
    expect(prerequisites).toContain("react@18\\.3\\.1");
    expect(prerequisites).toContain("vite@7\\.0\\.0");
    expect(
      selection?.files.filter((file) => file.role === "reusable"),
    ).toHaveLength(7);
    expect(
      selection?.files.filter((file) => file.role === "demo-only"),
    ).toHaveLength(9);
    expect(selection?.limitations.join("\n")).toContain("MDX_EXPRESSION_INERT");

    const markdown = renderCanonicalDocument(selection!);
    expect(markdown).toContain(
      "[Forms](https://www.saltdesignsystem.com/salt/patterns/forms#submission)",
    );
    expect(markdown).toContain("> **Keep the draft**");
    expect(markdown).toContain(
      "Diagram: [Loading form](https://www.saltdesignsystem.com/img/patterns/forms/loading.png)",
    );
    expect(markdown).toContain(
      `Recipe declaration: \`${selection?.recipe_identity?.recipe_sha256}\``,
    );
    expect(markdown).toContain(
      `Exported files: \`${selection?.recipe_identity?.content_identity}\``,
    );
    expect(markdown).not.toContain("__saltMdxExecuted = true");
  });

  it("round-trips section and contextual file fragments while rejecting unknown fragments", () => {
    const store = fixtureStore();
    const complete = assembleCanonicalDocument(store, {
      family: "guide",
      id: "guide.button.loading",
    });
    const section = assembleCanonicalDocument(
      store,
      { family: "guide", id: "guide.button.loading" },
      "loading",
    );
    expect(section).toMatchObject({
      reference: "record:guide:guide.button.loading#loading",
    });
    expect(section?.content_identity).toBe(complete?.content_identity);
    expect(section?.sections.map((entry) => entry.id)).toEqual(["loading"]);
    expect(section?.omissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reference: "record:guide:guide.button.loading#prerequisites",
        }),
      ]),
    );

    const file = assembleCanonicalDocument(
      store,
      { family: "guide", id: "guide.button.loading" },
      "file/site/src/examples/button/Loading.tsx",
    );
    expect(file?.reference).toBe(
      "record:guide:guide.button.loading#file/site/src/examples/button/Loading.tsx",
    );
    expect(file?.content_identity).toBe(complete?.content_identity);
    expect(file?.sections).toEqual([
      expect.objectContaining({
        id: "file/site/src/examples/button/Loading.tsx",
        purpose: "file",
      }),
    ]);
    expect(file?.sections[0]?.markdown).toContain("``````tsx");
    expect(file?.sections[0]?.markdown).toContain("`````\n# injected");
    expect(
      assembleCanonicalDocument(
        store,
        { family: "guide", id: "guide.button.loading" },
        "missing",
      ),
    ).toBeNull();
    expect(
      assembleCanonicalDocument(
        store,
        { family: "guide", id: "guide.button.loading" },
        "file/missing.tsx",
      ),
    ).toBeNull();
  });

  it("rejects a recipe file when its verified bytes or digest no longer match", () => {
    const store = fixtureStore({ corruptRecipeFile: true });
    expect(() =>
      assembleCanonicalDocument(
        store,
        { family: "guide", id: "guide.button.loading" },
        "file/src/demo/Demo1.tsx",
      ),
    ).toThrow("Workflow file identity mismatch: src/demo/Demo1.tsx.");
  });

  it("changes the canonical identity and Markdown when only recipe adaptation changes", () => {
    const baseline = assembleCanonicalDocument(fixtureStore(), {
      family: "guide",
      id: "guide.button.loading",
    })!;
    const changed = assembleCanonicalDocument(
      fixtureStore({ recipeAdaptationChange: true }),
      { family: "guide", id: "guide.button.loading" },
    )!;

    expect(baseline.content_identity).not.toBe(changed.content_identity);
    expect(baseline.recipe_identity?.recipe_sha256).not.toBe(
      changed.recipe_identity?.recipe_sha256,
    );
    expect(renderCanonicalDocument(changed)).toContain(
      "Keep the host draft after a cancelled submission so it can be retried",
    );
    expect(renderCanonicalDocument(changed)).not.toBe(
      renderCanonicalDocument(baseline),
    );
  });

  it("changes the canonical identity and Markdown when only an assembled Button prop fact changes", () => {
    const baseline = assembleCanonicalDocument(fixtureStore(), {
      family: "component",
      id: "component.button",
    })!;
    const changed = assembleCanonicalDocument(
      fixtureStore({ buttonPropFactChange: true }),
      { family: "component", id: "component.button" },
    )!;

    expect(baseline.content_identity).not.toBe(changed.content_identity);
    expect(renderCanonicalDocument(changed)).toContain(
      "Shows a pending state and blocks duplicate actions",
    );
    expect(renderCanonicalDocument(changed)).not.toBe(
      renderCanonicalDocument(baseline),
    );
  });
});
