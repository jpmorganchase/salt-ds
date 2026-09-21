import { readFileSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { assembleWorkflowRecipe } from "../build/assembleWorkflowRecipe.js";
import { buildKnowledgeSource } from "../build/buildRegistry.js";
import {
  type CatalogInputInventory,
  createCatalogInputInventory,
  withCatalogInputTracking,
} from "../build/catalogInputInventory.js";

const inventoryCapture = vi.hoisted(() => ({
  enabled: false,
  inventory: null as unknown,
  message: "captured buildKnowledgeSource input inventory",
}));

vi.mock("../build/catalogInputInventory.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../build/catalogInputInventory.js")>();
  return {
    ...actual,
    createCatalogInputInventory: async (
      ...args: Parameters<typeof actual.createCatalogInputInventory>
    ) => {
      const inventory = await actual.createCatalogInputInventory(...args);
      if (inventoryCapture.enabled) {
        // Stop after real inventory creation to avoid compiling the unrelated
        // component graph in this focused publication-default regression.
        inventoryCapture.enabled = false;
        inventoryCapture.inventory = inventory;
        throw new Error(inventoryCapture.message);
      }
      return inventory;
    },
  };
});

const repositoryRoot = path.resolve(import.meta.dirname, "../../../..");
const recipePath =
  "examples/apps/operations-dashboard/src/workflows/service-worklist/recipe.json";
const manifestPath = "site/src/examples/patterns/manifest.json";
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
  "site/docs/patterns/analytical-dashboard.mdx",
  "site/docs/patterns/navigation.mdx",
  "site/docs/patterns/content-status.mdx",
  "site/docs/components/button/examples.mdx",
  "site/docs/components/button/accessibility.mdx",
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
const temporaryDirectories: string[] = [];

async function createWorkflowFixture(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "salt-build-registry-"));
  temporaryDirectories.push(root);
  await Promise.all(
    [...semanticPaths, ...publicationPaths].map(async (relativePath) => {
      const target = path.join(root, relativePath);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(path.join(repositoryRoot, relativePath), target);
    }),
  );
  const registrationPath = path.join(root, manifestPath);
  await mkdir(path.dirname(registrationPath), { recursive: true });
  await writeFile(
    registrationPath,
    JSON.stringify({
      contract: "salt-authored-example-manifest/2",
      workflows: [
        { id: "operations-dashboard.service-worklist", recipe: recipePath },
      ],
    }),
    "utf8",
  );
  await writeFile(path.join(root, "package.json"), "{}\n", "utf8");
  return root;
}

async function captureBuildInventory(
  root: string,
  publicationInputPatterns?: readonly string[],
): Promise<CatalogInputInventory> {
  inventoryCapture.enabled = true;
  inventoryCapture.inventory = null;
  await expect(
    buildKnowledgeSource({
      sourceRoot: root,
      semanticInputPatterns: [...semanticPaths, manifestPath],
      compilerInputPatterns: ["package.json"],
      ...(publicationInputPatterns === undefined
        ? {}
        : { publicationInputPatterns }),
    }),
  ).rejects.toThrow(inventoryCapture.message);
  expect(inventoryCapture.inventory).not.toBeNull();
  return inventoryCapture.inventory as CatalogInputInventory;
}

async function assembleWithCapturedInventory(
  root: string,
  inventory: CatalogInputInventory,
) {
  const semanticInputInventory = await createCatalogInputInventory(
    root,
    semanticPaths,
  );
  return withCatalogInputTracking(root, inventory, () =>
    assembleWorkflowRecipe({
      sourceRoot: root,
      semanticInputInventory,
      publicationInputInventory: inventory,
      compatibility,
    }),
  );
}

afterEach(async () => {
  inventoryCapture.enabled = false;
  inventoryCapture.inventory = null;
  await Promise.all(
    temporaryDirectories
      .splice(0, temporaryDirectories.length)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("buildKnowledgeSource publication defaults", () => {
  it("inventories all nine demo files for the selected workflow", async () => {
    const root = await createWorkflowFixture();
    const inventory = await captureBuildInventory(root);
    const workflow = await assembleWithCapturedInventory(root, inventory);

    expect(workflow.recipeArtifact.files).toHaveLength(17);
    expect(
      workflow.recipeArtifact.files.filter((file) => file.role === "demo-only"),
    ).toHaveLength(publicationPaths.length);
  });

  it("keeps an explicit empty publication override authoritative", async () => {
    const root = await createWorkflowFixture();
    const inventory = await captureBuildInventory(root, []);

    await expect(
      assembleWithCapturedInventory(root, inventory),
    ).rejects.toThrow(
      /Publication inventory must contain exactly one entry .* found 0/u,
    );
  });
});
