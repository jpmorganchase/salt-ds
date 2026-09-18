import path from "node:path";
import { KnowledgeStore } from "@salt-ds/knowledge";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { runCliWithIo } from "../../cli.js";

const loadRetrievalRuntime = vi.hoisted(() => vi.fn());
vi.mock("../retrievalRuntime.js", () => ({
  loadRetrievalRuntime,
  renderRejectedProjectSelection: () => {
    throw new Error("This fixture already selected its application.");
  },
}));

async function run(args: string[]) {
  let output = "";
  const exitCode = await runCliWithIo(args, {
    cwd: () => "/prepared-app",
    stdout: (value) => {
      output += value;
    },
  });
  return { exitCode, output };
}

describe("CLI task-to-component-example journey", () => {
  beforeAll(() => {
    const store = new KnowledgeStore({
      bundleDir: path.resolve(
        import.meta.dirname,
        "../../../../knowledge/generated",
      ),
    });
    loadRetrievalRuntime.mockResolvedValue({
      store,
      selection: { status: "selected" },
      installedVersions: Object.fromEntries(
        store.manifest.compatibility.packages.map((entry) => [
          entry.name,
          entry.tested_version,
        ]),
      ),
      inspectionLimitations: [],
    });
  });

  it.each([
    ["Dialog with a cancel decision and an extra action in the body", "Dialog"],
    [
      "NavigationItem for moving between destinations in the header",
      "NavigationItem",
    ],
    ["Tabs for changing local panels", "Tabs"],
  ])("follows returned references for %s", async (query, component) => {
    const context = await run([
      "context",
      query,
      "--format",
      "json",
      "--limit",
      "5",
    ]);
    expect(context.exitCode).toBe(0);
    expect(Buffer.byteLength(context.output)).toBeLessThanOrEqual(16 * 1024);
    const result = JSON.parse(context.output);
    const match = result.matches.find(
      (candidate: { reference: { family: string }; title: string }) =>
        candidate.reference.family === "component" &&
        candidate.title.replace(/\W/g, "").toLowerCase() ===
          component.toLowerCase(),
    );
    expect(
      match,
      "A named component's reference is discoverable within the task budget",
    ).toBeDefined();
    const docs = await run([
      "docs",
      match.citation.record_key,
      "--format",
      "json",
    ]);
    expect(docs.exitCode).toBe(0);
    const owner = JSON.parse(docs.output);
    expect(owner.bundle.digest).toBe(result.bundle_digest);
    expect(owner.document.examples.length).toBeGreaterThan(0);
    const example =
      owner.document.examples.find((candidate: { source: { path: string } }) =>
        candidate.source.path.endsWith("/Default.tsx"),
      ) ?? owner.document.examples[0];
    expect(example).toBeDefined();
    expect(example.code).toBeUndefined();
    const selected = await run(["docs", example.reference, "--format", "json"]);
    expect(selected.exitCode).toBe(0);
    const resolved = JSON.parse(selected.output);
    expect(resolved.document.examples).toHaveLength(1);
    const completeExample = resolved.document.examples[0];
    expect(completeExample).toMatchObject(example);
    expect(example.validation.state).toBe("unvalidated");
    expect(example.source.path).toMatch(/^site\/src\/examples\//);
    expect(completeExample.code).toContain("export ");
    expect(completeExample.code).toContain(component);
    const markdown = await run([
      "docs",
      example.reference,
      "--format",
      "markdown",
    ]);
    expect(markdown.exitCode).toBe(0);
    expect(markdown.output).toContain(completeExample.code);
    for (const file of completeExample.supporting_files) {
      expect(markdown.output).toContain(file.code);
    }
  });

  it("delivers a real example stylesheet with the Tabs source", async () => {
    const owner = await run([
      "docs",
      "record:component:component.tabs",
      "--format",
      "json",
    ]);
    const examples = JSON.parse(owner.output).document.examples;
    const example = examples.find(
      (candidate: { supporting_files: { path: string }[] }) =>
        candidate.supporting_files.some((file) => file.path.endsWith(".css")),
    );
    expect(example).toBeDefined();
    const selected = await run(["docs", example.reference, "--format", "json"]);
    expect(selected.exitCode).toBe(0);
    const complete = JSON.parse(selected.output).document.examples[0];
    expect(complete.code).toContain("Tabs");
    expect(complete.code).toContain("index.module.css");
    expect(
      complete.supporting_files.some((file: { code: string }) =>
        file.code.includes("{"),
      ),
    ).toBe(true);
  });

  it.each([
    [
      "dialog form submit actions composition",
      "record:component:component.dialog#example/",
    ],
    [
      "horizontal application navigation in the header",
      "record:component:component.navigation-item#example/",
    ],
  ])(
    "retains relevant example references alongside guidance for %s",
    async (query, prefix) => {
      const context = await run([
        "context",
        query,
        "--format",
        "json",
        "--limit",
        "5",
      ]);
      expect(context.exitCode).toBe(0);
      const result = JSON.parse(context.output);
      const example = result.contextual_examples?.find(
        (entry: { reference: string }) => entry.reference.startsWith(prefix),
      );
      expect(example).toBeDefined();
      expect(example).toMatchObject({
        readiness: "contextual",
        validation: "unvalidated",
      });
      const selected = await run([
        "docs",
        example.reference,
        "--format",
        "json",
      ]);
      expect(selected.exitCode).toBe(0);
      expect(JSON.parse(selected.output).document.examples[0].code).toContain(
        "export ",
      );
    },
  );
});
