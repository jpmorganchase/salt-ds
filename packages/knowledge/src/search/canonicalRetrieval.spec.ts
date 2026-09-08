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
const WORKFLOW_GUIDE_ID = "operations-dashboard.record-form";
const BUTTON_GUIDE_ID = "guide.button.loading";
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

function contextDocument(query: string, budget = CONTEXT_LIMIT) {
  const result = buildKnowledgeContext(store, {
    query,
    limit: 8,
    max_utf8_bytes: budget,
  });
  expect(result.canonical_documents).toHaveLength(1);
  const document = result.canonical_documents?.[0];
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
    expect(recipe.files).toHaveLength(12);
    expect(
      recipe.files.filter((file) => file.role === "reusable"),
    ).toHaveLength(3);
    expect(recipe.files.filter((file) => file.role === "setup")).toHaveLength(
      1,
    );
    expect(
      recipe.files.filter((file) => file.role === "demo-only"),
    ).toHaveLength(8);
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

    const created = contextDocument("create incident record form");
    const adapted = contextDocument("adapt an existing incident record form");
    for (const { document } of [created, adapted]) {
      expect(document.reference).toBe(`record:guide:${WORKFLOW_GUIDE_ID}`);
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
    expect(markdown).toContain("@salt\\-ds/core@1\\.70\\.0");
    expect(markdown).toContain("react@18\\.3\\.1");
    expect(markdown).toContain("@salt-ds/theme/css/global.css");
    expect(markdown).toContain("OperationsDashboard");
    expect(markdown).toMatch(/pending/u);
    expect(markdown).toMatch(/retry/u);
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
    for (const id of [BUTTON_GUIDE_ID, WORKFLOW_GUIDE_ID]) {
      const { canonical } = resolved(`record:guide:${id}`);
      const generated = store
        .readArtifact(`markdown/guides/${id}.md`)
        .toString("utf8");
      expect(generated).toBe(renderCanonicalDocument(canonical));
      expect(generated).toContain(canonical.content_identity);
    }
  });

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

    const compact = contextDocument("create incident record form", 2 * 1024);
    expect(compact.result.truncated).toBe(true);
    expect(compact.result.utf8_bytes).toBeLessThanOrEqual(2 * 1024);
    expect(compact.document.sections.length).toBeGreaterThan(0);
    const omission = compact.document.omissions.find((entry) =>
      entry.reference.startsWith(`record:guide:${WORKFLOW_GUIDE_ID}#`),
    );
    expect(omission).toBeTruthy();
    if (!omission)
      throw new Error("Expected resolvable compact-context omission.");
    expect(
      resolveKnowledgeDocument(store, { identifier: omission.reference })
        .status,
    ).toBe("resolved");
    expect(
      Buffer.byteLength(
        renderKnowledgeContext(store, {
          query: "create incident record form",
          limit: 8,
          max_utf8_bytes: 2 * 1024,
        }),
        "utf8",
      ),
    ).toBeLessThanOrEqual(2 * 1024);
  });
});
