import path from "node:path";
import ts from "typescript";

export { buildKnowledgeSource, buildRegistry } from "./buildRegistry.js";
export { buildKnowledgeV1 } from "./buildKnowledgeV1.js";
export {
  assertCatalogInputInventoriesStable,
  createCatalogInputInventory,
  validateCatalogInputPatterns,
} from "./catalogInputInventory.js";
export { createSealedKnowledgeGeneratorDigest } from "./generatorDependencyInventory.js";

export const knowledgeGeneratorTypeScriptIdentity = Object.freeze({
  version: ts.version,
  default_lib_directory: path.dirname(ts.getDefaultLibFilePath({})),
});
