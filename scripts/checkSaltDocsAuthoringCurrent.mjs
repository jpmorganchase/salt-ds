import path from "node:path";
import { assertCompleteCatalogInputSet } from "./catalogBuildIdentity.mjs";
import { assert, readJson, sha256 } from "./saltAiEvidenceUtils.mjs";

export function validateCurrentWebArtifacts({
  routeMap,
  routeMapBytes,
  receipt,
}) {
  assert(
    routeMap?.contract === "salt-ai-web-route-map/2" &&
      Array.isArray(routeMap.routes) &&
      routeMap.bundle_digest === receipt?.bundle_digest &&
      receipt?.route_map?.sha256 === sha256(routeMapBytes) &&
      receipt.route_map.bytes === routeMapBytes.byteLength &&
      receipt.workflow_preview?.bootstrap?.path ===
        "/ai/development/bootstrap.json",
    "Current authoring web route map or receipt is stale",
  );
  const bootstrap = routeMap.routes.find(
    (route) => route.path === receipt.workflow_preview.bootstrap.path,
  );
  assert(
    bootstrap?.sha256 === receipt.workflow_preview.bootstrap.sha256 &&
      bootstrap?.bytes === receipt.workflow_preview.bootstrap.bytes,
    "Current authoring workflow bootstrap is absent from the web route map",
  );
}

export async function validateCurrentSourceInventories({
  store,
  repositoryRoot,
}) {
  for (const [kind, inventoryArtifact, patternsPath] of [
    [
      "semantic source",
      "support/semantic-source-inventory.json",
      "packages/knowledge/src/build/catalogSemanticInputPatterns.json",
    ],
    [
      "publication input",
      "support/publication-input-inventory.json",
      "packages/knowledge/src/build/catalogPublicationInputPatterns.json",
    ],
    [
      "compiler",
      "support/compiler-inventory.json",
      "packages/knowledge/src/build/catalogCompilerInputPatterns.json",
    ],
  ]) {
    const inventory = JSON.parse(store.readArtifact(inventoryArtifact));
    try {
      await assertCompleteCatalogInputSet(
        {
          inputsByPath: new Map(
            inventory.entries.map((entry) => [entry.path, entry]),
          ),
        },
        repositoryRoot,
        await readJson(path.join(repositoryRoot, patternsPath)),
      );
    } catch (error) {
      throw new Error(
        `Current authoring ${kind} inventory is stale: ${error.message} Run yarn build:ai-tooling and rebuild preview.`,
      );
    }
  }
}
