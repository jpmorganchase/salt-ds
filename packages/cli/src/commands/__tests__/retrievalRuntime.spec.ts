import path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  createKnowledgeStore: vi.fn(),
  decideSaltProject: vi.fn(),
  inspectSaltProjectFacts: vi.fn(),
}));

vi.mock("@salt-ds/knowledge", async () => {
  const actual =
    await vi.importActual<typeof import("@salt-ds/knowledge")>(
      "@salt-ds/knowledge",
    );
  return {
    ...actual,
    createKnowledgeStore: harness.createKnowledgeStore,
    decideSaltProject: harness.decideSaltProject,
    inspectSaltProjectFacts: harness.inspectSaltProjectFacts,
  };
});

import { loadRetrievalRuntime } from "../retrievalRuntime.js";

const authorityRoot = path.resolve("D:/salt-authority");
const selectedRoot = path.join(authorityRoot, "apps", "consumer");

beforeEach(() => {
  vi.clearAllMocks();
  harness.createKnowledgeStore.mockReturnValue({ manifest: {} });
  harness.decideSaltProject.mockReturnValue({ installed_package_vector: [] });
  harness.inspectSaltProjectFacts.mockResolvedValue({
    authorityRoot,
    facts: { root_dir: selectedRoot.replaceAll("\\", "/") },
    limitations: [],
  });
});

describe("loadRetrievalRuntime project selection", () => {
  it("inspects only the explicitly selected project beneath its authority", async () => {
    const runtime = await loadRetrievalRuntime({
      rootDir: authorityRoot,
      project: "apps/consumer",
    });

    expect(harness.inspectSaltProjectFacts).toHaveBeenCalledWith({
      rootDir: selectedRoot,
      authorityRoot,
    });
    expect(runtime.authorityRoot).toBe(authorityRoot);
    expect(runtime.projectRelative).toBe("apps/consumer");
  });

  it("does not infer a project when the required selection is absent", async () => {
    await expect(
      loadRetrievalRuntime({ rootDir: authorityRoot } as never),
    ).rejects.toMatchObject({ code: "SALT_PROJECT_ROOT_UNAVAILABLE" });
    expect(harness.inspectSaltProjectFacts).not.toHaveBeenCalled();
  });

  it.each([
    "",
    "../outside",
    "apps/../consumer",
    "/outside",
    "C:\\outside",
    "C:drive-relative",
    "\0bad",
  ])("rejects an unsafe direct project selection %j", async (project) => {
    await expect(
      loadRetrievalRuntime({ rootDir: authorityRoot, project }),
    ).rejects.toMatchObject({ code: "SALT_PROJECT_ROOT_UNAVAILABLE" });
    expect(harness.inspectSaltProjectFacts).not.toHaveBeenCalled();
  });
});
