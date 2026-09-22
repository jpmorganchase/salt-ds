import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { renderCanonicalDocument } from "../documents/assembleCanonicalDocument.js";
import { parseEmittedWorkflowRecipe } from "../documents/workflowRecipeSchema.js";
import { sha256Digest } from "../manifest/digestCodec.js";
import {
  createKnowledgeStore,
  type KnowledgeStore,
} from "../manifest/knowledgeStore.js";
import {
  renderKnowledgeDocumentMarkdown,
  resolveKnowledgeDocument,
} from "../markdown/resolveKnowledgeDocument.js";
import { buildKnowledgeContext, renderKnowledgeContext } from "./searchSalt.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../../..");
const WORKFLOW_GUIDE_ID = "operations-dashboard.service-worklist";
const BUTTON_GUIDE_ID = "guide.button.loading";
const CONTENT_STATUS_GUIDE_ID = "guide.content-status";
const CONTEXT_LIMIT = 16 * 1024;

let store: KnowledgeStore;

beforeAll(() => {
  store = createKnowledgeStore({
    bundleDir: path.join(REPO_ROOT, "packages/knowledge/generated"),
  });
  store.ensureKnowledgeVerified();
});

function resolved(identifier: string) {
  const result = resolveKnowledgeDocument(store, { identifier });
  expect(result.status).toBe("resolved");
  if (result.status !== "resolved" || !result.document?.canonical) {
    throw new Error(`Expected canonical document for ${identifier}.`);
  }
  return { result, canonical: result.document.canonical };
}

function workflowContextDocument(query: string, budget = CONTEXT_LIMIT) {
  const result = buildKnowledgeContext(store, {
    query,
    limit: 8,
    max_utf8_bytes: budget,
  });
  const document = result.canonical_documents?.find(
    (entry) => entry.reference === `record:guide:${WORKFLOW_GUIDE_ID}`,
  );
  if (!document) throw new Error(`Expected canonical evidence for ${query}.`);
  return { result, document };
}

describe("generated canonical retrieval", () => {
  it("resolves Button Loading through the real component and derives only its documented API and preview evidence", () => {
    const button = store
      .getFamily("component")
      .find((record) => record.name === "Button");
    expect(button).toBeTruthy();

    const { canonical } = resolved(`record:component:${button?.id}`);
    expect(canonical.reference).toBe(`record:guide:${BUTTON_GUIDE_ID}`);
    expect(canonical.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "button.loading", purpose: "guidance" }),
        expect.objectContaining({ id: "api/Button/loading", purpose: "api" }),
        expect.objectContaining({
          id: "api/Button/loadingAnnouncement",
          purpose: "api",
        }),
      ]),
    );
    expect(canonical.files).toEqual([
      expect.objectContaining({
        path: "site/src/examples/button/Loading.tsx",
        role: "contextual-example",
        reference: `record:guide:${BUTTON_GUIDE_ID}#file/site/src/examples/button/Loading.tsx`,
      }),
    ]);
    expect(canonical.sections.map((section) => section.purpose)).not.toContain(
      "prerequisites",
    );
    expect(canonical.sections.map((section) => section.purpose)).not.toContain(
      "adaptation",
    );

    const rendered = renderKnowledgeDocumentMarkdown(
      resolved(`record:component:${button?.id}`).result,
    );
    expect(rendered).toContain("Button\\.loadingAnnouncement");
    expect(rendered).toContain("Complete example file");
    expect(rendered).not.toContain("Prerequisites and setup");
  });

  it("routes dashboard metric-card requests to the selected guide with Card API evidence", () => {
    const card = store
      .getFamily("component")
      .find((record) => record.name === "Card");
    expect(card).toBeTruthy();

    const { canonical } = resolved(`record:guide:${WORKFLOW_GUIDE_ID}`);
    expect(canonical.reference).toBe(`record:guide:${WORKFLOW_GUIDE_ID}`);
    expect(canonical.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "primitive.component-or-pattern",
          purpose: "guidance",
        }),
        expect.objectContaining({ id: "api/Card/variant", purpose: "api" }),
        expect.objectContaining({ id: "api/Card/accent", purpose: "api" }),
      ]),
    );

    const context = buildKnowledgeContext(store, {
      query:
        "build dashboard metric cards with Salt instead of token-styled custom cards",
      limit: 8,
    });
    expect(
      context.canonical_documents?.some(
        (document) =>
          document.reference === `record:guide:${WORKFLOW_GUIDE_ID}`,
      ),
    ).toBe(true);
  });

  it("does not let an unrelated source example compact a multiword canonical guide", () => {
    const storeWithUnrelatedExample = {
      manifest: store.manifest,
      readArtifact: store.readArtifact.bind(store),
      getFamily: (family: any) =>
        family === "search_document"
          ? store
              .getFamily("search_document")
              .filter(
                ({ target }) =>
                  (target.family === "component" &&
                    ["component.button", "component.spinner"].includes(
                      target.id,
                    )) ||
                  (target.family === "guide" && target.id === BUTTON_GUIDE_ID),
              )
          : family === "evidence"
            ? [
                {
                  family: "evidence",
                  id: "example:component:component.spinner:unrelated",
                  evidence_kind: "executable_example",
                  local_id: "unrelated",
                  owner: { family: "component", id: "component.spinner" },
                  owner_ordinal: 0,
                  title: "Unrelated illustration",
                  description:
                    "An unrelated illustration with a separate topic.",
                  intent: ["unrelated"],
                  source_ref: { family: "source", id: "source.unrelated" },
                  supporting_files: [],
                },
              ]
            : store.getFamily(family),
      getRecord: store.getRecord.bind(store),
      getContentValue: store.getContentValue.bind(store),
      getContentSourceText: store.getContentSourceText.bind(store),
    } as unknown as KnowledgeStore;
    const context = buildKnowledgeContext(storeWithUnrelatedExample, {
      query: "accessible loading with an announcement",
      limit: 8,
    });
    const workflow = context.canonical_documents?.find(
      (document) => document.reference === `record:guide:${BUTTON_GUIDE_ID}`,
    );
    expect(workflow).toBeDefined();
    expect(workflow?.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reference: `record:guide:${BUTTON_GUIDE_ID}#file/site/src/examples/button/Loading.tsx`,
        }),
      ]),
    );
    expect(workflow?.sections.map((section) => section.id)).toEqual(
      expect.arrayContaining([
        "button.loading",
        "button.loading.best-practices",
      ]),
    );
    expect(
      workflow?.sections.find(
        (section) => section.id === "button.loading.best-practices",
      )?.markdown,
    ).toContain("loadingAnnouncement");
    expect(context.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reference: { family: "component", id: "component.spinner" },
        }),
      ]),
    );
    expect(context.contextual_examples).toBeUndefined();
  });

  it("keeps a fitting complete guide with a matching source example before compact variants", () => {
    const storeWithMatchingExample = {
      manifest: store.manifest,
      readArtifact: store.readArtifact.bind(store),
      getFamily: (family: any) =>
        family === "evidence"
          ? [
              {
                family: "evidence",
                id: "example:component:component.button:pending",
                evidence_kind: "executable_example",
                local_id: "pending",
                owner: { family: "component", id: "component.button" },
                owner_ordinal: 0,
                title: "Pending Button",
                description: "Show a pending action while loading.",
                intent: ["pending", "loading"],
                source_ref: { family: "source", id: "source.button.pending" },
                supporting_files: [],
              },
            ]
          : store.getFamily(family),
      getRecord: store.getRecord.bind(store),
      getContentValue: store.getContentValue.bind(store),
      getContentSourceText: store.getContentSourceText.bind(store),
    } as unknown as KnowledgeStore;
    const context = buildKnowledgeContext(storeWithMatchingExample, {
      query: "Button loading pending announcement",
      limit: 1,
    });
    expect(context.truncated).toBe(false);
    const buttonGuide = context.canonical_documents?.find(
      (document) => document.reference === `record:guide:${BUTTON_GUIDE_ID}`,
    );
    expect(buttonGuide?.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reference: `record:guide:${BUTTON_GUIDE_ID}#file/site/src/examples/button/Loading.tsx`,
        }),
      ]),
    );
    expect(buttonGuide?.sections.map((section) => section.id)).toEqual(
      expect.arrayContaining([
        "button.loading",
        "button.loading.best-practices",
      ]),
    );
    expect(
      buttonGuide?.sections.find(
        (section) => section.id === "button.loading.best-practices",
      )?.markdown,
    ).toContain("loadingAnnouncement");
    expect(context.contextual_examples).toEqual([
      expect.objectContaining({
        reference: "record:component:component.button#example/pending",
      }),
    ]);
  });

  it("exposes the verified workflow recipe, support, seams, state and file references for create and adapt requests", () => {
    const { canonical: workflow } = resolved(
      `record:guide:${WORKFLOW_GUIDE_ID}`,
    );
    const guide = store.getRecord("guide", WORKFLOW_GUIDE_ID);
    expect(workflow.content_identity).toMatch(/^sha256:[0-9a-f]{64}$/u);
    expect(workflow.content_identity).not.toBe(guide.detail_content_ref.id);

    const detail = store.getContentValue(guide.detail_content_ref);
    const recipe = parseEmittedWorkflowRecipe(
      JSON.parse(store.readArtifact(detail.recipe_manifest).toString("utf8")),
    );
    expect(recipe.id).toBe(WORKFLOW_GUIDE_ID);
    for (const file of recipe.files) {
      const bytes = store.readArtifact(file.artifact_path);
      expect(bytes.byteLength).toBe(file.bytes);
      expect(sha256Digest(bytes)).toBe(file.sha256);
    }

    expect(recipe.support.reusable_packages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "@salt-ds/core" }),
      ]),
    );
    expect(recipe.support.external_dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "react",
          version: expect.stringMatching(/^18\./u),
          role: "reusable",
        }),
      ]),
    );
    expect(recipe.support.theme_css).toEqual(
      expect.arrayContaining([
        "@salt-ds/theme/css/global.css",
        "@salt-ds/theme/css/theme-next.css",
      ]),
    );
    expect(recipe.adaptation.draft_owner).toBe("OperationsDashboard");
    expect(recipe.adaptation.submission_state).toEqual(
      expect.arrayContaining(["idle", "pending", "failed"]),
    );
    expect(recipe.adaptation.simulation).toMatch(/retry/u);
    expect(recipe.acceptance.automated.join(" ")).toMatch(/retry/u);

    const created = workflowContextDocument("create incident record form");
    const adapted = workflowContextDocument(
      "adapt an existing incident record form",
    );
    for (const { document } of [created, adapted]) {
      expect(document.reference).toBe(`record:guide:${WORKFLOW_GUIDE_ID}`);
      expect(document.limitations).toEqual(workflow.limitations);
      expect(document.recipe_identity).toEqual(workflow.recipe_identity);
      expect(document.sections.map((section) => section.purpose)).toEqual(
        expect.arrayContaining([
          "prerequisites",
          "implementation",
          "adaptation",
          "acceptance",
        ]),
      );
      expect([...(document.files ?? []), ...document.omissions]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reference: `record:guide:${WORKFLOW_GUIDE_ID}#file/src/workflows/record-form/RecordForm.tsx`,
          }),
        ]),
      );
    }
    const markdown = renderKnowledgeContext(store, {
      query: "create incident record form",
      limit: 8,
    });
    const coreVersion = recipe.support.reusable_packages.find(
      (entry) => entry.name === "@salt-ds/core",
    )?.version;
    expect(coreVersion).toBeDefined();
    expect(markdown).toContain(
      `@salt\\-ds/core@${coreVersion?.replaceAll(".", "\\.")}`,
    );
    expect(markdown).toContain("react@18\\.3\\.1");
    expect(markdown).toContain("@salt-ds/theme/css/global.css");
    expect(markdown).toContain("OperationsDashboard");
    expect(markdown).toMatch(/pending/u);
    expect(markdown).toMatch(/retry/u);
    expect(markdown).toContain("production\\-scale data");
    expect(markdown).toContain(
      "does not certify arbitrary consumer adaptations",
    );
    expect(markdown).toContain(recipe.source_identity.recipe_sha256);
    expect(markdown).toContain(recipe.source_identity.content_identity);
  });

  it("round-trips every generated preview and workflow file reference through the resolver", () => {
    const button = resolved(`record:guide:${BUTTON_GUIDE_ID}`).canonical;
    const workflow = resolved(`record:guide:${WORKFLOW_GUIDE_ID}`).canonical;
    for (const file of [...button.files, ...workflow.files]) {
      const { canonical } = resolved(file.reference);
      expect(canonical.reference).toBe(file.reference);
      expect(canonical.files).toEqual([file]);
      expect(canonical.sections).toEqual([
        expect.objectContaining({ id: `file/${file.path}`, purpose: "file" }),
      ]);
    }
  });

  it("makes the generated Markdown projection exactly the canonical guide content", () => {
    for (const id of [
      BUTTON_GUIDE_ID,
      WORKFLOW_GUIDE_ID,
      CONTENT_STATUS_GUIDE_ID,
    ]) {
      const { canonical } = resolved(`record:guide:${id}`);
      const generated = store
        .readArtifact(`markdown/guides/${id}.md`)
        .toString("utf8");
      expect(generated).toBe(renderCanonicalDocument(canonical));
      expect(generated).toContain(canonical.content_identity);
    }
  });

  it.each([
    { family: "component", id: "component.button", folder: "components" },
    { family: "component", id: "component.banner", folder: "components" },
    { family: "pattern", id: "pattern.content-status", folder: "patterns" },
    {
      family: "page",
      id: "page.salt-patterns-content-status",
      folder: "pages",
    },
    { family: "pattern", id: "pattern.forms", folder: "patterns" },
    {
      family: "page",
      id: "page.salt-components-dialog-accessibility",
      folder: "pages",
    },
  ])(
    "links an attached $family projection to its complete canonical guide",
    ({ family, id, folder }) => {
      const { canonical } = resolved(`record:${family}:${id}`);
      const projectionPath = `markdown/${folder}/${id}.md`;
      const projection = store.readArtifact(projectionPath).toString("utf8");
      const destinations = [...projection.matchAll(/\]\(([^)]+)\)/gu)].map(
        (match) =>
          path.posix.normalize(
            path.posix.join(
              path.posix.dirname(projectionPath),
              decodeURIComponent(match[1]),
            ),
          ),
      );
      const guidePath = `markdown/guides/${canonical.reference.slice("record:guide:".length)}.md`;
      expect(destinations).toContain(guidePath);
      expect(projection).toContain(canonical.reference);
      const complete = store.readArtifact(guidePath).toString("utf8");
      expect(complete).toBe(renderCanonicalDocument(canonical));
      expect(complete).toContain(canonical.content_identity);
      expect(Buffer.byteLength(projection, "utf8")).toBeLessThan(
        Buffer.byteLength(complete, "utf8"),
      );
    },
  );

  it("keeps unrelated create requests contextual and bounds real JSON and Markdown context", () => {
    const unsupported = buildKnowledgeContext(store, {
      query: "create unsupported drag drop kanban",
      limit: 8,
    });
    expect(
      unsupported.canonical_documents?.some(
        (document) =>
          document.reference === `record:guide:${WORKFLOW_GUIDE_ID}`,
      ) ?? false,
    ).toBe(false);
    expect(unsupported.answer_status).toBe("contextual");

    const full = buildKnowledgeContext(store, {
      query: "create incident record form",
      limit: 8,
    });
    const fullMarkdown = renderKnowledgeContext(store, {
      query: "create incident record form",
      limit: 8,
    });
    expect(Buffer.byteLength(JSON.stringify(full), "utf8")).toBe(
      full.utf8_bytes,
    );
    expect(full.utf8_bytes).toBeLessThanOrEqual(CONTEXT_LIMIT);
    expect(Buffer.byteLength(fullMarkdown, "utf8")).toBeLessThanOrEqual(
      CONTEXT_LIMIT,
    );
  });

  it.each([
    "dialog form submit actions composition",
    "compose a dialog form with submit actions",
  ])(
    "keeps direct workflow and source evidence for task wording: %s",
    (query) => {
      const context = buildKnowledgeContext(store, { query, limit: 8 });
      const workflow = context.canonical_documents?.find(
        (document) =>
          document.reference === `record:guide:${WORKFLOW_GUIDE_ID}`,
      );
      expect(workflow).toBeDefined();
      expect(workflow?.sections.length).toBeGreaterThan(0);
      expect([
        ...(workflow?.files ?? []),
        ...(workflow?.omissions ?? []),
      ]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reference: `record:guide:${WORKFLOW_GUIDE_ID}#file/src/workflows/record-form/RecordForm.tsx`,
          }),
        ]),
      );
    },
  );

  it.each([
    ["create incident record form", 2 * 1024],
    ["create incident record form", 4 * 1024],
    ["dialog form submit actions composition", 3 * 1024],
    ["dialog form submit actions composition", 4 * 1024],
    ["compose a dialog form with submit actions", 3 * 1024],
    ["compose a dialog form with submit actions", 4 * 1024],
  ])(
    "keeps qualified workflow evidence or a resolvable omission for %s at %i bytes",
    (query, budget) => {
      const input = { query, limit: 8, max_utf8_bytes: budget };
      const context = buildKnowledgeContext(store, input);
      const markdown = renderKnowledgeContext(store, input);
      const reference = `record:guide:${WORKFLOW_GUIDE_ID}`;
      const { canonical } = resolved(reference);
      const workflow = context.canonical_documents?.find(
        (document) => document.reference === reference,
      );
      expect(context.utf8_bytes).toBe(
        Buffer.byteLength(JSON.stringify(context), "utf8"),
      );
      expect(context.utf8_bytes + 1).toBeLessThanOrEqual(budget);
      expect(Buffer.byteLength(markdown, "utf8")).toBeLessThanOrEqual(budget);
      if (workflow) {
        expect(workflow.sections.length).toBeGreaterThan(0);
        expect(workflow.limitations).toEqual(canonical.limitations);
        expect(workflow.recipe_identity).toEqual(canonical.recipe_identity);
        expect(workflow.readiness).toBe(canonical.readiness);
        expect([...(workflow.files ?? []), ...workflow.omissions]).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              reference: `${reference}#file/src/workflows/record-form/RecordForm.tsx`,
            }),
          ]),
        );
        for (const omission of workflow.omissions) {
          expect(
            resolveKnowledgeDocument(store, { identifier: omission.reference })
              .status,
          ).toBe("resolved");
        }
      } else {
        expect(context.truncated).toBe(true);
        expect(context.answer_status).toBe("contextual");
        const hasWorkflowOmission =
          context.canonical_documents?.some((document) =>
            document.omissions.some(
              (omission) => omission.reference === reference,
            ),
          ) ||
          context.limitations?.some(
            (entry) => entry.includes("omitted") && entry.includes(reference),
          );
        expect(hasWorkflowOmission).toBe(true);
        expect(markdown).toContain(reference);
      }
      for (const match of context.matches) {
        expect(
          resolveKnowledgeDocument(store, {
            identifier: match.citation.record_key,
          }).status,
        ).toBe("resolved");
      }
    },
  );
});
