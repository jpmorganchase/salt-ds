import { readFileSync } from "node:fs";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { assembleWorkflowRecipe } from "../build/assembleWorkflowRecipe.js";
import {
  createCatalogInputInventory,
  withCatalogInputTracking,
} from "../build/catalogInputInventory.js";
import { parseAuthoredWorkflowRecipe } from "../documents/workflowRecipeSchema.js";
import { createArtifactDescriptor } from "../manifest/artifactTree.js";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

const recipePath =
  "examples/apps/operations-dashboard/src/workflows/service-worklist/recipe.json";
const semanticPaths = [
  recipePath,
  "examples/apps/operations-dashboard/package.json",
  "examples/apps/operations-dashboard/src/workflows/record-form/RecordForm.css",
  "examples/apps/operations-dashboard/src/workflows/record-form/RecordForm.tsx",
  "examples/apps/operations-dashboard/src/workflows/record-form/types.ts",
  "examples/apps/operations-dashboard/src/workflows/service-worklist/IncidentInspector.tsx",
  "examples/apps/operations-dashboard/src/workflows/service-worklist/IncidentWorklist.tsx",
  "examples/apps/operations-dashboard/src/workflows/service-worklist/ServiceWorklist.css",
  "examples/apps/operations-dashboard/src/workflows/service-worklist/types.ts",
  "site/docs/components/button/examples.mdx",
  "site/docs/components/button/accessibility.mdx",
  "site/docs/patterns/analytical-dashboard.mdx",
  "site/docs/patterns/navigation.mdx",
  "site/docs/patterns/content-status.mdx",
  "site/docs/patterns/forms.mdx",
  "site/docs/getting-started/choosing-the-right-primitive.mdx",
  "site/docs/getting-started/composition-pitfalls.mdx",
  "site/docs/components/dialog/usage.mdx",
  "site/docs/components/dialog/examples.mdx",
  "site/docs/components/dialog/accessibility.mdx",
  "site/docs/patterns/button-bar.mdx",
];
const publicationPaths = [
  "examples/apps/operations-dashboard/index.html",
  "examples/apps/operations-dashboard/src/OperationsDashboard.tsx",
  "examples/apps/operations-dashboard/src/dashboard.css",
  "examples/apps/operations-dashboard/src/main.tsx",
  "examples/apps/operations-dashboard/src/vite-env.d.ts",
  "examples/apps/operations-dashboard/src/workflows/record-form/localDemoAdapter.ts",
  "examples/apps/operations-dashboard/src/workflows/service-worklist/localWorklistAdapter.ts",
  "examples/apps/operations-dashboard/tsconfig.json",
  "examples/apps/operations-dashboard/vite.config.ts",
];

async function copyWorkflowFixture(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "salt-workflow-recipe-"));
  for (const relativePath of [...semanticPaths, ...publicationPaths]) {
    const target = path.join(root, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(repositoryRoot, relativePath), target);
  }
  return root;
}

async function fixtureInventories(root: string) {
  const [semanticInputInventory, publicationInputInventory, trackedInventory] =
    await Promise.all([
      createCatalogInputInventory(root, semanticPaths),
      createCatalogInputInventory(root, publicationPaths),
      createCatalogInputInventory(root, [
        ...semanticPaths,
        ...publicationPaths,
      ]),
    ]);
  return {
    semanticInputInventory,
    publicationInputInventory,
    trackedInventory,
  };
}

async function assembleFixture(root: string) {
  const inventories = await fixtureInventories(root);
  return withCatalogInputTracking(root, inventories.trackedInventory, () =>
    assembleWorkflowRecipe({
      sourceRoot: root,
      semanticInputInventory: inventories.semanticInputInventory,
      publicationInputInventory: inventories.publicationInputInventory,
      compatibility,
    }),
  );
}

function currentWorkspaceVersion(directory: string): string {
  const manifest = JSON.parse(
    readFileSync(
      path.join(repositoryRoot, "packages", directory, "package.json"),
      "utf8",
    ),
  ) as { version: string };
  return manifest.version;
}

const compatibility = {
  packages: ["core", "icons", "lab", "theme"].map((directory) => ({
    name: `@salt-ds/${directory}`,
    tested_version: currentWorkspaceVersion(directory),
  })),
} as const;

describe("assembleWorkflowRecipe", () => {
  it("assembles the selected workflow without leaking demo-only sources into semantic metadata", async () => {
    const [
      semanticInputInventory,
      publicationInputInventory,
      trackedInventory,
    ] = await Promise.all([
      createCatalogInputInventory(repositoryRoot, semanticPaths),
      createCatalogInputInventory(repositoryRoot, publicationPaths),
      createCatalogInputInventory(repositoryRoot, [
        ...semanticPaths,
        ...publicationPaths,
      ]),
    ]);

    const result = await withCatalogInputTracking(
      repositoryRoot,
      trackedInventory,
      () =>
        assembleWorkflowRecipe({
          sourceRoot: repositoryRoot,
          semanticInputInventory,
          publicationInputInventory,
          compatibility,
        }),
    );

    expect(result.recipeArtifact.files).toHaveLength(17);
    expect(() =>
      result.publicFiles.map((file) =>
        createArtifactDescriptor(file.artifactPath, file.mediaType, file.bytes),
      ),
    ).not.toThrow();
    expect(
      result.recipeArtifact.files.filter((file) => file.role === "reusable"),
    ).toHaveLength(7);
    expect(
      result.recipeArtifact.files.filter((file) => file.role === "setup"),
    ).toHaveLength(1);
    expect(
      result.recipeArtifact.files.filter((file) => file.role === "demo-only"),
    ).toHaveLength(9);
    expect(result.recipeArtifact.support.reusable_packages).toEqual([
      {
        name: "@salt-ds/core",
        version: currentWorkspaceVersion("core"),
        role: "reusable",
      },
      {
        name: "@salt-ds/icons",
        version: currentWorkspaceVersion("icons"),
        role: "reusable",
      },
      {
        name: "@salt-ds/theme",
        version: currentWorkspaceVersion("theme"),
        role: "reusable",
      },
    ]);
    expect(result.recipeArtifact.support.external_dependencies).toEqual([
      { name: "react", version: "18.3.1", role: "reusable" },
      { name: "react-dom", version: "18.3.1", role: "demo-only" },
    ]);
    expect(result.semanticMetadata.packageNames).toEqual([
      "@salt-ds/core",
      "@salt-ds/icons",
      "@salt-ds/theme",
      "react",
    ]);
    expect(result.semanticMetadata.sourcePaths).toEqual(semanticPaths.sort());
    expect(result.semanticMetadata.sourcePaths).not.toContain(
      "examples/apps/operations-dashboard/src/OperationsDashboard.tsx",
    );
    expect(result.indexEntry.recipe_manifest).toBe(
      "examples/workflows/operations-dashboard.service-worklist/recipe.json",
    );
    expect(result.recipeArtifact.readiness).toMatchObject({
      delivered: "runnable",
      static_validation: "passed",
      packed_application_acceptance: "required",
      manual_review: "pending",
    });
  });

  it.each([
    {
      name: "undeclared relative import",
      relativePath:
        "examples/apps/operations-dashboard/src/workflows/record-form/RecordForm.tsx",
      addition: 'import "./missing";\n',
      message: /exactly one declared public file/u,
    },
    {
      name: "undeclared CSS asset",
      relativePath:
        "examples/apps/operations-dashboard/src/workflows/record-form/RecordForm.css",
      addition: '.recordForm { background-image: url("./missing.svg"); }\n',
      message: /exactly one declared public file/u,
    },
    {
      name: "undeclared CSS import",
      relativePath:
        "examples/apps/operations-dashboard/src/workflows/record-form/RecordForm.css",
      addition: '@import "./missing.css";\n',
      message: /exactly one declared public file/u,
    },
    {
      name: "reusable import of a demo-only source",
      relativePath:
        "examples/apps/operations-dashboard/src/workflows/record-form/RecordForm.tsx",
      addition: 'import "./localDemoAdapter";\n',
      message: /exactly one declared public file/u,
    },
    {
      name: "non-literal dynamic import",
      relativePath:
        "examples/apps/operations-dashboard/src/workflows/record-form/RecordForm.tsx",
      addition: 'const hidden = import("./" + "types");\n',
      message: /non-literal dynamic import/u,
    },
  ])("rejects $name", async ({ relativePath, addition, message }) => {
    const root = await copyWorkflowFixture();
    try {
      const target = path.join(root, relativePath);
      await writeFile(target, `${addition}${await readFile(target, "utf8")}`);
      const inventories = await fixtureInventories(root);
      await expect(
        withCatalogInputTracking(root, inventories.trackedInventory, () =>
          assembleWorkflowRecipe({
            sourceRoot: root,
            semanticInputInventory: inventories.semanticInputInventory,
            publicationInputInventory: inventories.publicationInputInventory,
            compatibility,
          }),
        ),
      ).rejects.toThrow(message);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("separates demo publication identity from reusable semantic identity", async () => {
    const root = await copyWorkflowFixture();
    try {
      const initial = await assembleFixture(root);
      const adapterPath = path.join(
        root,
        "examples/apps/operations-dashboard/src/workflows/record-form/localDemoAdapter.ts",
      );
      await writeFile(
        adapterPath,
        `${await readFile(adapterPath, "utf8")}\n// Host-only demo change.\n`,
      );
      const demoChanged = await assembleFixture(root);
      expect(demoChanged.semanticMetadata).toEqual(initial.semanticMetadata);
      expect(
        demoChanged.recipeArtifact.source_identity.semantic_source_digest,
      ).toBe(initial.recipeArtifact.source_identity.semantic_source_digest);
      expect(
        demoChanged.recipeArtifact.source_identity.content_identity,
      ).not.toBe(initial.recipeArtifact.source_identity.content_identity);
      expect(
        demoChanged.recipeArtifact.files.find((file) =>
          file.path.endsWith("localDemoAdapter.ts"),
        )?.sha256,
      ).not.toBe(
        initial.recipeArtifact.files.find((file) =>
          file.path.endsWith("localDemoAdapter.ts"),
        )?.sha256,
      );

      const reusablePath = path.join(
        root,
        "examples/apps/operations-dashboard/src/workflows/record-form/types.ts",
      );
      await writeFile(
        reusablePath,
        `${await readFile(reusablePath, "utf8")}\n// Reusable contract change.\n`,
      );
      const reusableChanged = await assembleFixture(root);
      expect(
        reusableChanged.recipeArtifact.source_identity.semantic_source_digest,
      ).not.toBe(
        demoChanged.recipeArtifact.source_identity.semantic_source_digest,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects an incompatible tested family vector", async () => {
    const [
      semanticInputInventory,
      publicationInputInventory,
      trackedInventory,
    ] = await Promise.all([
      createCatalogInputInventory(repositoryRoot, semanticPaths),
      createCatalogInputInventory(repositoryRoot, publicationPaths),
      createCatalogInputInventory(repositoryRoot, [
        ...semanticPaths,
        ...publicationPaths,
      ]),
    ]);
    await expect(
      withCatalogInputTracking(repositoryRoot, trackedInventory, () =>
        assembleWorkflowRecipe({
          sourceRoot: repositoryRoot,
          semanticInputInventory,
          publicationInputInventory,
          compatibility: {
            packages: compatibility.packages.map((entry) =>
              entry.name === "@salt-ds/core"
                ? { ...entry, tested_version: "1.69.0" }
                : entry,
            ),
          },
        }),
      ),
    ).rejects.toThrow(/does not match tested compatibility/u);
  });

  it("does not allow editable declarations to self-promote pending work", () => {
    const declaration = {
      id: "operations-dashboard.service-worklist",
      title: "Record form",
      intent: { summary: "Create a record.", aliases: ["record form"] },
      owner: "Maintainers",
      readiness: "workflow-verified",
      source: {
        application: "examples/apps/operations-dashboard",
        reusable_workflow_files: [
          "a.ts",
          "b.ts",
          "c.css",
          "d.ts",
          "e.ts",
          "f.ts",
          "g.css",
        ],
        demo_application_files: [
          "package.json",
          "1.ts",
          "2.ts",
          "3.ts",
          "4.ts",
          "5.ts",
          "6.ts",
          "7.ts",
          "8.ts",
          "9.ts",
        ],
        canonical_guidance: ["site/docs/patterns/forms.mdx"],
      },
      setup: {
        provider: "SaltProviderNext",
        theme_css: ["@salt-ds/theme/css/global.css"],
        dependency_manifest: "package.json",
        dialog_wrapper: {
          owner: "host",
          required_components: ["Dialog"],
          form_components: ["DialogContent"],
        },
      },
      adaptation: {
        draft_owner: "host",
        inputs: ["title"],
        callbacks: ["onChange"],
        submission_state: ["idle"],
        cancellation: "Retain the draft.",
        simulation: "No network request.",
      },
      acceptance: {
        automated: ["The form builds."],
        manual_review_pending: ["design review"],
      },
      limitations: ["Reference workflow only."],
    };
    expect(() => parseAuthoredWorkflowRecipe(declaration)).toThrow(
      /cannot be workflow-verified/u,
    );
    expect(
      parseAuthoredWorkflowRecipe({
        ...declaration,
        acceptance: {
          ...declaration.acceptance,
          manual_review_pending: [],
        },
      }).readiness,
    ).toBe("workflow-verified");
    expect(() =>
      parseAuthoredWorkflowRecipe({
        ...declaration,
        acceptance: { automated: [], manual_review_pending: [] },
      }),
    ).toThrow();
    expect(() =>
      parseAuthoredWorkflowRecipe({
        ...declaration,
        readiness: "runnable",
        acceptance: { ...declaration.acceptance, automated: [] },
      }),
    ).toThrow();
    expect(() =>
      parseAuthoredWorkflowRecipe({
        ...declaration,
        readiness: "runnable",
        source: {
          ...declaration.source,
          reusable_workflow_files: ["../a.ts", "b.ts", "c.css"],
        },
      }),
    ).toThrow(/portable repository-relative path/u);
  });
});
