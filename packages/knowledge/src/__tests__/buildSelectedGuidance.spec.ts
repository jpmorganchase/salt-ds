import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  type BuildSelectedGuidanceInput,
  buildSelectedGuidance,
} from "../build/buildSelectedGuidance.js";
import {
  createCatalogInputInventory,
  withCatalogInputTracking,
} from "../build/catalogInputInventory.js";

const repoRoot = process.cwd();
const workflowRoot = "examples/apps/operations-dashboard";
const recipeSourcePath = `${workflowRoot}/src/workflows/record-form/recipe.json`;
const manifestPath =
  "examples/workflows/operations-dashboard.record-form/recipe.json";
const formsPath = "site/docs/patterns/forms.mdx";
const buttonPath = "site/docs/components/button/examples.mdx";
const formsPreviewPath = "site/src/examples/patterns/forms/index.tsx";
const buttonPreviewPath = "site/src/examples/button/Loading.tsx";
const reusablePaths = [
  `${workflowRoot}/src/workflows/record-form/RecordForm.tsx`,
  `${workflowRoot}/src/workflows/record-form/RecordForm.css`,
  `${workflowRoot}/src/workflows/record-form/types.ts`,
];
const packagePath = `${workflowRoot}/package.json`;
const fixtureRoots: string[] = [];

const semanticSourcePaths = [
  formsPath,
  buttonPath,
  recipeSourcePath,
  ...reusablePaths,
  packagePath,
];
const trackedSourcePaths = [
  ...semanticSourcePaths,
  formsPreviewPath,
  buttonPreviewPath,
];

function canonicalText(value: string): string {
  return value.replace(/\r\n?/gu, "\n");
}

async function copiedFixture(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "salt-selected-guidance-"));
  fixtureRoots.push(root);
  await Promise.all(
    trackedSourcePaths.map(async (sourcePath) => {
      const target = path.join(root, sourcePath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(
        target,
        await readFile(path.join(repoRoot, sourcePath), "utf8"),
        "utf8",
      );
    }),
  );
  return root;
}

function input(
  paths: string[] = semanticSourcePaths,
): BuildSelectedGuidanceInput {
  return {
    sourceRoot: repoRoot,
    workflow: {
      id: "operations-dashboard.record-form",
      title: "Validated incident record form",
      recipeSourcePath,
      manifestPath,
      semanticSourcePaths: paths,
      minimumPackageNames: ["@salt-ds/core", "@salt-ds/theme"],
    },
  };
}

afterEach(async () => {
  await Promise.all(
    fixtureRoots
      .splice(0)
      .map((root) => rm(root, { force: true, recursive: true })),
  );
});

describe("buildSelectedGuidance", () => {
  it("does not activate when no current recipe is registered", async () => {
    await expect(
      buildSelectedGuidance({ sourceRoot: repoRoot, workflow: null }),
    ).resolves.toEqual([]);
  });

  it("builds exactly the Forms workflow and Button Loading guides from declared inputs", async () => {
    const inventory = await createCatalogInputInventory(
      repoRoot,
      trackedSourcePaths,
    );
    const guides = await withCatalogInputTracking(repoRoot, inventory, () =>
      buildSelectedGuidance(input()),
    );

    expect(guides.map((guide) => guide.id)).toEqual([
      "operations-dashboard.record-form",
      "guide.button.loading",
    ]);
    const workflow = guides[0];
    expect(workflow.summary).toBe(
      "Create or adapt an incident record form with host-owned draft, validation, pending submission, failure recovery, retry, and cancellation state.",
    );
    expect(workflow.aliases).toEqual(
      expect.arrayContaining([
        "Validated incident record form",
        "incident form",
      ]),
    );
    expect(workflow.recipeManifest).toBe(manifestPath);
    expect(workflow.files.map((file) => file.sourcePath)).toEqual([
      formsPreviewPath,
    ]);
    expect(workflow.sourcePaths).toEqual(
      expect.arrayContaining([formsPath, recipeSourcePath, formsPreviewPath]),
    );
    expect(workflow.sourcePaths).not.toContain(buttonPath);
    expect(workflow.sourcePaths).not.toContain(
      `${workflowRoot}/src/workflows/record-form/localDemoAdapter.ts`,
    );
    expect(workflow.attach).toEqual({
      componentNames: [],
      patternNames: ["Forms"],
      pageSourcePaths: [formsPath],
    });
    const buildHeading = workflow.document.sections.findIndex(
      (section) => section.id === "forms.how-to-build",
    );
    expect(buildHeading).toBeGreaterThan(-1);
    expect(workflow.document.sections[buildHeading]).toMatchObject({
      heading_path: ["How to build"],
      level: 2,
    });
    expect(workflow.document.sections[buildHeading + 1]).toMatchObject({
      id: "forms.submission-and-recovery",
      heading_path: ["How to build", "Submission and recovery"],
      level: 3,
    });
    const formsPreview = workflow.document.sections
      .find((section) => section.id === "forms.overview")
      ?.blocks.find((block) => block.kind === "live_preview");
    expect(formsPreview).toEqual(
      expect.objectContaining({ example_source_path: formsPreviewPath }),
    );
    expect(workflow.files[0]).toEqual({
      sourcePath: formsPreviewPath,
      language: "tsx",
      code: canonicalText(
        await readFile(path.join(repoRoot, formsPreviewPath), "utf8"),
      ),
    });

    const loading = guides[1];
    expect(loading.document.diagnostics).toEqual([]);
    expect(loading.name).toBe("Button Loading");
    expect(loading.aliases).toEqual(
      expect.arrayContaining(["Button Loading", "Loading", "Best practices"]),
    );
    expect(loading.summary).toContain("loading state for a button");
    expect(loading.packageNames).toEqual(["@salt-ds/core"]);
    expect(loading.attach).toEqual({
      componentNames: ["Button"],
      patternNames: [],
      pageSourcePaths: [buttonPath],
    });
    expect(loading.files).toEqual([
      {
        sourcePath: buttonPreviewPath,
        language: "tsx",
        code: canonicalText(
          await readFile(path.join(repoRoot, buttonPreviewPath), "utf8"),
        ),
      },
    ]);
  });

  it("keeps selected MDX expressions inert while surfacing their diagnostics and limitations", async () => {
    const sourceRoot = await copiedFixture();
    const fixtureFormsPath = path.join(sourceRoot, formsPath);
    const original = await readFile(fixtureFormsPath, "utf8");
    await writeFile(
      fixtureFormsPath,
      original.replace(
        "---\n\n<LivePreview",
        '---\n\n{(() => { throw new Error("must stay inert"); })()}\n\n<LivePreview',
      ),
      "utf8",
    );

    const guides = await buildSelectedGuidance({ ...input(), sourceRoot });
    const workflow = guides.find(
      (guide) => guide.id === "operations-dashboard.record-form",
    );
    expect(
      workflow?.document.diagnostics.map((diagnostic) => diagnostic.code),
    ).toContain("MDX_EXPRESSION_INERT");
    expect(workflow?.limitations.join("\n")).toContain("MDX_EXPRESSION_INERT");
  });

  it("rejects an AST-selected LivePreview absent from the tracked inventory", async () => {
    const inventory = await createCatalogInputInventory(
      repoRoot,
      trackedSourcePaths.filter((value) => value !== buttonPreviewPath),
    );
    await expect(
      withCatalogInputTracking(repoRoot, inventory, () =>
        buildSelectedGuidance(input()),
      ),
    ).rejects.toThrow(
      /undeclared input read.*site\/src\/examples\/button\/Loading\.tsx/i,
    );
  });
});
