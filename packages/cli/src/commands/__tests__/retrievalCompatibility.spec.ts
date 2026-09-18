import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => {
  const recordReads = {
    getFamily: vi.fn(),
    getRecord: vi.fn(),
    getContentValue: vi.fn(),
    getContentSourceText: vi.fn(),
    getContentJson: vi.fn(),
    getContentText: vi.fn(),
  };
  return {
    recordReads,
    store: {
      manifest: {
        bundle_version: "0.0.0",
        compatibility: { packages: [] },
      },
      ...recordReads,
    },
    inspectSaltProjectFacts: vi.fn(),
    createKnowledgeStore: vi.fn(),
    decideSaltProject: vi.fn(),
    resolveKnowledgeDocument: vi.fn(),
    renderKnowledgeDocumentMarkdown: vi.fn(),
    buildKnowledgeContext: vi.fn(),
    renderKnowledgeContext: vi.fn(),
  };
});

vi.mock("@salt-ds/knowledge", () => ({
  inspectSaltProjectFacts: harness.inspectSaltProjectFacts,
  createKnowledgeStore: harness.createKnowledgeStore,
  decideSaltProject: harness.decideSaltProject,
  resolveKnowledgeDocument: harness.resolveKnowledgeDocument,
  renderKnowledgeDocumentMarkdown: harness.renderKnowledgeDocumentMarkdown,
  buildKnowledgeContext: harness.buildKnowledgeContext,
  renderKnowledgeContext: harness.renderKnowledgeContext,
}));

import { runContextCommand } from "../context.js";
import { runDocsCommand } from "../docs.js";

function selection(
  status: "selected" | "not_salt" | "unverifiable" | "unsupported",
) {
  return {
    contract: "salt-project-decision/1" as const,
    schema_version: "1.0.0" as const,
    status,
    reason_code:
      status === "selected"
        ? ("SALT_PROJECT_SELECTED" as const)
        : status === "not_salt"
          ? ("SALT_PROJECT_NO_SALT_PACKAGES" as const)
          : status === "unverifiable"
            ? ("SALT_PROJECT_INSPECTION_INCOMPLETE" as const)
            : ("SALT_PROJECT_EXACT_VERSION_REQUIRED" as const),
    installed_package_vector: [],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  harness.createKnowledgeStore.mockReturnValue(harness.store);
  harness.inspectSaltProjectFacts.mockResolvedValue({
    facts: { installation: { resolvedPackages: [] } },
    limitations: [],
  });
});

describe("retrieval project-selection gate", () => {
  it.each(["not_salt", "unverifiable", "unsupported"] as const)(
    "returns exit 3 for %s without any record, content, or analyzer path",
    async (status) => {
      harness.decideSaltProject.mockReturnValue(selection(status));

      const docs = await runDocsCommand({
        rootDir: "D:/fixture",
        identifier: "Button",
        format: "json",
      });
      const context = await runContextCommand({
        rootDir: "D:/fixture",
        query: "button",
        format: "markdown",
        limit: 5,
      });

      expect(docs.exitCode).toBe(3);
      expect(JSON.parse(docs.output)).toMatchObject({
        contract: "salt-project-decision/1",
        status,
      });
      expect(context).toMatchObject({
        exitCode: 3,
        output: expect.stringContaining(`Status: ${status}`),
      });
      expect(harness.resolveKnowledgeDocument).not.toHaveBeenCalled();
      expect(harness.renderKnowledgeDocumentMarkdown).not.toHaveBeenCalled();
      expect(harness.buildKnowledgeContext).not.toHaveBeenCalled();
      expect(harness.renderKnowledgeContext).not.toHaveBeenCalled();
      for (const read of Object.values(harness.recordReads)) {
        expect(read).not.toHaveBeenCalled();
      }
    },
  );

  it("allows selected projects to enter the normal retrieval paths", async () => {
    harness.decideSaltProject.mockReturnValue(selection("selected"));
    harness.resolveKnowledgeDocument.mockReturnValue({
      contract: "salt-knowledge-document/1",
      status: "resolved",
    });
    harness.buildKnowledgeContext.mockReturnValue({
      contract: "salt-knowledge-context/1",
      results: [],
    });

    await expect(
      runDocsCommand({
        rootDir: "D:/fixture",
        identifier: "Button",
        format: "json",
      }),
    ).resolves.toMatchObject({ exitCode: 0 });
    await expect(
      runContextCommand({
        rootDir: "D:/fixture",
        query: "button",
        format: "json",
        limit: 5,
      }),
    ).resolves.toMatchObject({ exitCode: 0 });
    expect(harness.resolveKnowledgeDocument).toHaveBeenCalledOnce();
    expect(harness.buildKnowledgeContext).toHaveBeenCalledOnce();
  });
});
