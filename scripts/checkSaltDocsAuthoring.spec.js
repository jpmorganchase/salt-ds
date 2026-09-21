import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";
import { createCatalogInputInventory } from "../packages/knowledge/src/build/catalogInputInventory.ts";
import {
  validateCurrentSourceInventories,
  validateCurrentWebArtifacts,
} from "./checkSaltDocsAuthoringCurrent.mjs";
import { sha256 } from "./saltAiEvidenceUtils.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const script = path.join(repositoryRoot, "scripts/checkSaltDocsAuthoring.mjs");

function checkCurrentAuthoring(arguments_) {
  return execFileSync(
    process.execPath,
    [script, "--current-product", ...arguments_],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
}

describe("checkSaltDocsAuthoring current-product mode", () => {
  const temporaryDirectories = [];

  afterEach(async () => {
    await Promise.all(
      temporaryDirectories
        .splice(0)
        .map((directory) => rm(directory, { recursive: true, force: true })),
    );
  });

  async function sourceFixture() {
    const root = await mkdtemp(path.join(tmpdir(), "salt-current-authoring-"));
    temporaryDirectories.push(root);
    const inputs = {
      "packages/core/src/index.ts": "export const semantic = 1;\n",
      "packages/knowledge/src/search/searchSalt.ts":
        "export const compiler = 1;\n",
      "packages/knowledge/src/search/searchSalt.spec.ts":
        "export const testOnly = 1;\n",
      "examples/apps/operations-dashboard/src/main.tsx": "export {};\n",
    };
    const inventories = [
      [
        "support/semantic-source-inventory.json",
        "catalogSemanticInputPatterns.json",
      ],
      [
        "support/publication-input-inventory.json",
        "catalogPublicationInputPatterns.json",
      ],
      ["support/compiler-inventory.json", "catalogCompilerInputPatterns.json"],
    ];
    for (const [, filename] of inventories) {
      const relative = `packages/knowledge/src/build/${filename}`;
      inputs[relative] = await readFile(
        path.join(repositoryRoot, relative),
        "utf8",
      );
    }
    for (const [relative, content] of Object.entries(inputs)) {
      const destination = path.join(root, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, content);
    }
    const artifacts = new Map();
    for (const [artifact, filename] of inventories) {
      const patterns = JSON.parse(
        inputs[`packages/knowledge/src/build/${filename}`],
      );
      const inventory = await createCatalogInputInventory(root, patterns);
      artifacts.set(artifact, JSON.stringify({ entries: inventory.entries }));
    }
    return {
      repositoryRoot: root,
      store: { readArtifact: (artifact) => artifacts.get(artifact) },
    };
  }

  it.each([
    ["compiler", "packages/knowledge/src/search/searchSalt.ts"],
    ["semantic source", "packages/core/src/index.ts"],
    ["publication input", "examples/apps/operations-dashboard/src/main.tsx"],
  ])(
    "rejects stale %s inputs while excluding test-only changes",
    async (kind, relative) => {
      const fixture = await sourceFixture();
      await expect(
        validateCurrentSourceInventories(fixture),
      ).resolves.toBeUndefined();
      await writeFile(
        path.join(
          fixture.repositoryRoot,
          "packages/knowledge/src/search/searchSalt.spec.ts",
        ),
        "export const testOnly = 2;\n",
      );
      await expect(
        validateCurrentSourceInventories(fixture),
      ).resolves.toBeUndefined();
      await writeFile(path.join(fixture.repositoryRoot, relative), "changed\n");
      await expect(validateCurrentSourceInventories(fixture)).rejects.toThrow(
        new RegExp(
          `Current authoring ${kind} inventory is stale:.*Run yarn build:ai-tooling and rebuild preview`,
          "u",
        ),
      );
    },
  );

  function webFixture() {
    const routeMap = {
      contract: "salt-ai-web-route-map/2",
      bundle_digest: "sha256:bundle",
      routes: [
        {
          path: "/ai/development/bootstrap.json",
          sha256: "sha256:bootstrap",
          bytes: 12,
        },
      ],
    };
    const routeMapBytes = Buffer.from(JSON.stringify(routeMap), "utf8");
    return {
      routeMap,
      routeMapBytes,
      receipt: {
        bundle_digest: "sha256:bundle",
        route_map: {
          sha256: sha256(routeMapBytes),
          bytes: routeMapBytes.byteLength,
        },
        workflow_preview: {
          bootstrap: {
            path: "/ai/development/bootstrap.json",
            sha256: "sha256:bootstrap",
            bytes: 12,
          },
        },
      },
    };
  }

  it("requires an explicit generated web route map", () => {
    expect(() => checkCurrentAuthoring([])).toThrow(
      /--current-product requires --require-web-route-map/u,
    );
  });

  it("rejects a route map that is not the current generated web map", () => {
    expect(() =>
      checkCurrentAuthoring(["--require-web-route-map", "package.json"]),
    ).toThrow(/Current authoring route map must be/u);
  });

  it("rejects stale route-map bytes and an incomplete workflow bootstrap", () => {
    const fixture = webFixture();
    expect(() => validateCurrentWebArtifacts(fixture)).not.toThrow();
    expect(() =>
      validateCurrentWebArtifacts({
        ...fixture,
        routeMapBytes: Buffer.from("stale", "utf8"),
      }),
    ).toThrow(/route map or receipt is stale/u);
    expect(() =>
      validateCurrentWebArtifacts({
        ...fixture,
        routeMap: { ...fixture.routeMap, routes: [] },
      }),
    ).toThrow(/workflow bootstrap is absent/u);
  });
});
