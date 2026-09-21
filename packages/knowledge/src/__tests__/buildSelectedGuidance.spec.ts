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
const recipeSourcePath = `${workflowRoot}/src/workflows/service-worklist/recipe.json`;
const manifestPath =
  "examples/workflows/operations-dashboard.service-worklist/recipe.json";
const formsPath = "site/docs/patterns/forms.mdx";
const analyticalDashboardPath = "site/docs/patterns/analytical-dashboard.mdx";
const navigationPath = "site/docs/patterns/navigation.mdx";
const contentStatusPath = "site/docs/patterns/content-status.mdx";
const choosingPrimitivePath =
  "site/docs/getting-started/choosing-the-right-primitive.mdx";
const compositionPitfallsPath =
  "site/docs/getting-started/composition-pitfalls.mdx";
const buttonPath = "site/docs/components/button/examples.mdx";
const buttonAccessibilityPath = "site/docs/components/button/accessibility.mdx";
const dialogUsagePath = "site/docs/components/dialog/usage.mdx";
const dialogExamplesPath = "site/docs/components/dialog/examples.mdx";
const dialogAccessibilityPath = "site/docs/components/dialog/accessibility.mdx";
const buttonBarPath = "site/docs/patterns/button-bar.mdx";
const formsPreviewPath = "site/src/examples/patterns/forms/index.tsx";
const buttonPreviewPath = "site/src/examples/button/Loading.tsx";
const reusablePaths = [
  `${workflowRoot}/src/workflows/record-form/RecordForm.tsx`,
  `${workflowRoot}/src/workflows/record-form/RecordForm.css`,
  `${workflowRoot}/src/workflows/record-form/types.ts`,
  `${workflowRoot}/src/workflows/service-worklist/types.ts`,
  `${workflowRoot}/src/workflows/service-worklist/IncidentWorklist.tsx`,
  `${workflowRoot}/src/workflows/service-worklist/IncidentInspector.tsx`,
  `${workflowRoot}/src/workflows/service-worklist/ServiceWorklist.css`,
];
const packagePath = `${workflowRoot}/package.json`;
const fixtureRoots: string[] = [];

const semanticSourcePaths = [
  analyticalDashboardPath,
  navigationPath,
  contentStatusPath,
  choosingPrimitivePath,
  compositionPitfallsPath,
  formsPath,
  buttonPath,
  buttonAccessibilityPath,
  dialogUsagePath,
  dialogExamplesPath,
  dialogAccessibilityPath,
  buttonBarPath,
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
      id: "operations-dashboard.service-worklist",
      title: "Service operations worklist",
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

  it("builds the workflow and independent component guidance from declared inputs", async () => {
    const inventory = await createCatalogInputInventory(
      repoRoot,
      trackedSourcePaths,
    );
    const guides = await withCatalogInputTracking(repoRoot, inventory, () =>
      buildSelectedGuidance(input()),
    );

    expect(guides.map((guide) => guide.id)).toEqual(
      expect.arrayContaining([
        "operations-dashboard.service-worklist",
        "guide.button.loading",
        "guide.content-status",
        "guide.button.accessible-name",
      ]),
    );
    const workflow = guides[0];
    expect(workflow.summary).toBe(
      "Build a runnable service-operations dashboard with a persistent shell, worklist filters, local loading, empty and error recovery states, incident inspection, and an editable record form.",
    );
    expect(workflow.aliases).toEqual(
      expect.arrayContaining([
        "Service operations worklist",
        "service worklist",
      ]),
    );
    expect(workflow.recipeManifest).toBe(manifestPath);
    expect(workflow.componentNames).toEqual(
      expect.arrayContaining([
        "Card",
        "Panel",
        "Link",
        "Table",
        "Input",
        "Banner",
      ]),
    );
    expect(workflow.files.map((file) => file.sourcePath)).toEqual([
      formsPreviewPath,
    ]);
    expect(workflow.sourcePaths).toEqual(
      expect.arrayContaining([
        analyticalDashboardPath,
        navigationPath,
        choosingPrimitivePath,
        compositionPitfallsPath,
        formsPath,
        recipeSourcePath,
        formsPreviewPath,
      ]),
    );
    expect(workflow.sourcePaths).not.toContain(buttonPath);
    expect(workflow.sourcePaths).not.toContain(buttonAccessibilityPath);
    expect(workflow.sourcePaths).not.toContain(
      `${workflowRoot}/src/workflows/record-form/localDemoAdapter.ts`,
    );
    expect(workflow.attach).toEqual({
      componentNames: [],
      patternNames: ["Analytical dashboard", "Navigation", "Forms", "Metric"],
      pageSourcePaths: [
        analyticalDashboardPath,
        navigationPath,
        formsPath,
        choosingPrimitivePath,
        compositionPitfallsPath,
        dialogUsagePath,
        dialogExamplesPath,
        dialogAccessibilityPath,
        buttonBarPath,
      ],
    });
    expect(
      Object.fromEntries(
        workflow.document.sections.map((section) => [
          section.id,
          {
            source_path: section.source?.source_path,
          },
        ]),
      ),
    ).toMatchObject({
      "dashboard.overview": { source_path: analyticalDashboardPath },
      "navigation.overview": { source_path: navigationPath },
      "forms.overview": { source_path: formsPath },
      "primitive.overview": { source_path: choosingPrimitivePath },
      "composition.overview": { source_path: compositionPitfallsPath },
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

    const accessibleName = guides.find(
      (guide) => guide.id === "guide.button.accessible-name",
    );
    expect(accessibleName).toMatchObject({
      id: "guide.button.accessible-name",
      kind: "component-guidance",
      document: {
        source: {
          document_id: "guide.button.accessible-name",
          source_path: buttonAccessibilityPath,
        },
        sections: [expect.objectContaining({ id: "button.accessible-name" })],
        diagnostics: [],
      },
      recipeManifest: null,
      sourcePaths: [buttonAccessibilityPath],
      componentNames: ["Button"],
      packageNames: ["@salt-ds/core"],
      attach: {
        componentNames: [],
        patternNames: [],
        pageSourcePaths: [buttonAccessibilityPath],
      },
    });

    const contentStatus = guides[2];
    expect(contentStatus).toMatchObject({
      id: "guide.content-status",
      kind: "component-guidance",
      name: "Content status",
      document: {
        source: {
          document_id: "guide.content-status",
          source_path: contentStatusPath,
        },
        diagnostics: [],
      },
      recipeManifest: null,
      sourcePaths: [contentStatusPath],
      packageNames: ["@salt-ds/core"],
      attach: {
        componentNames: ["Banner"],
        patternNames: ["Content status"],
        pageSourcePaths: [contentStatusPath],
      },
    });
    expect(
      contentStatus.document.sections.some(
        (section) => section.id === "content-status.overview",
      ),
    ).toBe(true);
    expect(
      workflow.document.sections.some((section) =>
        section.id.startsWith("content-status."),
      ),
    ).toBe(false);

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

  it.each([formsPath, contentStatusPath])(
    "reports unsupported selected source %s with its own provenance",
    async (sourcePath) => {
      const sourceRoot = await copiedFixture();
      const fixturePath = path.join(sourceRoot, sourcePath);
      const original = canonicalText(await readFile(fixturePath, "utf8"));
      const unsupportedSource = original.replace(
        /^(---\n[\s\S]*?\n---\n)/u,
        '$1\n{(() => { throw new Error("must stay inert"); })()}\n',
      );
      expect(unsupportedSource).not.toBe(original);
      await writeFile(fixturePath, unsupportedSource, "utf8");

      await expect(
        buildSelectedGuidance({ ...input(), sourceRoot }),
      ).rejects.toThrow(
        new RegExp(
          `${sourcePath.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}.*MDX_EXPRESSION_INERT`,
          "u",
        ),
      );
    },
  );

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
